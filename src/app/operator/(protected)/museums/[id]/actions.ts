'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  createExhibitForOperator,
  deleteExhibitForOperator,
  importExhibitsCsv,
  setExhibitPublishedForOperator,
  updateExhibitForOperator,
  type CsvImportResult,
} from '@/lib/services/operator-content';
import { exhibitInputSchema, firstZodMessage } from '@/lib/validation';

export interface ActionState {
  error?: string;
  ok?: boolean;
}

export interface CsvImportActionState {
  error?: string;
  result?: CsvImportResult;
}

function readExhibitForm(formData: FormData) {
  return {
    exhibitNumber: formData.get('exhibitNumber'),
    titleJa: formData.get('titleJa'),
    titleEn: formData.get('titleEn'),
    descriptionJa: formData.get('descriptionJa') ?? '',
    descriptionEn: formData.get('descriptionEn'),
    narrationJa: formData.get('narrationJa'),
    narrationEn: formData.get('narrationEn'),
    audioUrlJa: formData.get('audioUrlJa'),
    audioUrlEn: formData.get('audioUrlEn'),
    imageUrl: formData.get('imageUrl'),
    isPublished: formData.get('isPublished'),
  };
}

function describeError(e: unknown): string {
  if (isAppError(e)) return e.message;
  if (e instanceof Error && /unique/i.test(e.message)) {
    return 'その展示番号は既に使われています';
  }
  console.error('operator content action error', e);
  return '保存に失敗しました。時間をおいて再度お試しください';
}

export async function operatorSaveExhibitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperator();
  const museumId = String(formData.get('museumId') ?? '');
  if (!museumId) return { error: '施設IDが不正です' };

  const parsed = exhibitInputSchema.safeParse(readExhibitForm(formData));
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  const id = formData.get('id');
  try {
    const repo = getRepository();
    if (typeof id === 'string' && id.length > 0) {
      await updateExhibitForOperator(repo, museumId, id, parsed.data);
    } else {
      await createExhibitForOperator(repo, museumId, parsed.data);
    }
  } catch (e) {
    return { error: describeError(e) };
  }

  revalidatePath(`/operator/museums/${museumId}/exhibits`);
  revalidatePath(`/operator/museums/${museumId}`);
  redirect(`/operator/museums/${museumId}/exhibits`);
}

export async function operatorDeleteExhibitAction(formData: FormData): Promise<void> {
  await requireOperator();
  const museumId = String(formData.get('museumId') ?? '');
  const id = formData.get('id');
  if (museumId && typeof id === 'string' && id.length > 0) {
    await deleteExhibitForOperator(getRepository(), museumId, id);
  }
  revalidatePath(`/operator/museums/${museumId}/exhibits`);
  redirect(`/operator/museums/${museumId}/exhibits`);
}

export async function operatorTogglePublishAction(formData: FormData): Promise<void> {
  await requireOperator();
  const museumId = String(formData.get('museumId') ?? '');
  const id = formData.get('id');
  const publish = formData.get('publish') === 'true';
  if (museumId && typeof id === 'string' && id.length > 0) {
    await setExhibitPublishedForOperator(getRepository(), museumId, id, publish);
  }
  revalidatePath(`/operator/museums/${museumId}/exhibits`);
}

export async function operatorImportCsvAction(
  _prev: CsvImportActionState,
  formData: FormData,
): Promise<CsvImportActionState> {
  await requireOperator();
  const museumId = String(formData.get('museumId') ?? '');
  const file = formData.get('csv');
  if (!museumId) return { error: '施設IDが不正です' };
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'CSVファイルを選択してください' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'CSVファイルが大きすぎます（5MB以内）' };
  }
  try {
    const csvText = await file.text();
    const result = await importExhibitsCsv(getRepository(), museumId, csvText);
    revalidatePath(`/operator/museums/${museumId}/exhibits`);
    return { result };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'インポートに失敗しました' };
  }
}
