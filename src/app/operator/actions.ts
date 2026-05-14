'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOperator } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { isAppError } from '@/lib/errors';
import {
  createMuseumAdmin,
  createMuseumByOperator,
  setMuseumActive,
} from '@/lib/services/operator';
import {
  firstZodMessage,
  museumInputSchema,
  newUserSchema,
} from '@/lib/validation';

export interface ActionState {
  error?: string;
  ok?: boolean;
}

function describeError(e: unknown): string {
  if (isAppError(e)) return e.message;
  console.error('operator action error', e);
  return '処理に失敗しました。時間をおいて再度お試しください';
}

export async function createMuseumAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperator();
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
    await createMuseumByOperator(getRepository(), parsed.data);
  } catch (e) {
    return { error: describeError(e) };
  }
  revalidatePath('/operator');
  redirect('/operator');
}

export async function toggleMuseumActiveAction(formData: FormData): Promise<void> {
  await requireOperator();
  const id = formData.get('id');
  const active = formData.get('active') === 'true';
  if (typeof id === 'string' && id.length > 0) {
    await setMuseumActive(getRepository(), id, active);
  }
  revalidatePath('/operator');
}

export async function createAdminAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperator();
  const parsed = newUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    museumId: formData.get('museumId'),
  });
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }
  try {
    await createMuseumAdmin(getRepository(), parsed.data);
  } catch (e) {
    return { error: describeError(e) };
  }
  revalidatePath('/operator/admins');
  return { ok: true };
}
