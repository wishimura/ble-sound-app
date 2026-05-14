'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { isAppError } from '@/lib/errors';
import {
  createAdminExhibit,
  deleteAdminExhibit,
  setAdminExhibitPublished,
  updateAdminExhibit,
  updateOwnMuseum,
} from '@/lib/services/admin';
import {
  exhibitInputSchema,
  firstZodMessage,
  museumInputSchema,
} from '@/lib/validation';

export interface ActionState {
  error?: string;
  ok?: boolean;
}

function readExhibitForm(formData: FormData) {
  return {
    exhibitNumber: formData.get('exhibitNumber'),
    titleJa: formData.get('titleJa'),
    titleEn: formData.get('titleEn'),
    descriptionJa: formData.get('descriptionJa') ?? '',
    descriptionEn: formData.get('descriptionEn'),
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
  console.error('admin action error', e);
  return '保存に失敗しました。時間をおいて再度お試しください';
}

export async function saveExhibitAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMuseumAdmin();
  const parsed = exhibitInputSchema.safeParse(readExhibitForm(formData));
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  const id = formData.get('id');
  try {
    const repo = getRepository();
    if (typeof id === 'string' && id.length > 0) {
      await updateAdminExhibit(repo, session, id, parsed.data);
    } else {
      await createAdminExhibit(repo, session, parsed.data);
    }
  } catch (e) {
    return { error: describeError(e) };
  }

  revalidatePath('/admin/exhibits');
  revalidatePath('/admin');
  redirect('/admin/exhibits');
}

export async function deleteExhibitAction(formData: FormData): Promise<void> {
  const session = await requireMuseumAdmin();
  const id = formData.get('id');
  if (typeof id === 'string' && id.length > 0) {
    await deleteAdminExhibit(getRepository(), session, id);
  }
  revalidatePath('/admin/exhibits');
  revalidatePath('/admin');
  redirect('/admin/exhibits');
}

export async function togglePublishAction(formData: FormData): Promise<void> {
  const session = await requireMuseumAdmin();
  const id = formData.get('id');
  const publish = formData.get('publish') === 'true';
  if (typeof id === 'string' && id.length > 0) {
    await setAdminExhibitPublished(getRepository(), session, id, publish);
  }
  revalidatePath('/admin/exhibits');
  revalidatePath('/admin');
}

export async function updateMuseumAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMuseumAdmin();
  const parsed = museumInputSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    type: formData.get('type'),
    logoUrl: formData.get('logoUrl'),
  });
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }
  try {
    await updateOwnMuseum(getRepository(), session, parsed.data);
  } catch (e) {
    return { error: describeError(e) };
  }
  revalidatePath('/admin/museum');
  revalidatePath('/admin');
  return { ok: true };
}
