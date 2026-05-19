'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOperator } from '@/lib/auth/session';
import { CACHE_TAGS } from '@/lib/cache';
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
  if (e instanceof Error && /slug/i.test(e.message)) {
    return 'そのURL識別子は既に使われています';
  }
  console.error('operator action error', e);
  return '処理に失敗しました。時間をおいて再度お試しください';
}

export async function createMuseumAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOperator();
  const parsed = museumInputSchema.safeParse({
    slug: formData.get('slug'),
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
  revalidateTag(CACHE_TAGS.museums);
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
  revalidateTag(CACHE_TAGS.museums);
}

export interface CreateAdminResult extends ActionState {
  initialPassword?: string;
  email?: string;
  museumName?: string;
}

export async function createAdminAction(
  _prev: CreateAdminResult,
  formData: FormData,
): Promise<CreateAdminResult> {
  await requireOperator();
  const parsed = newUserSchema.safeParse({
    email: formData.get('email'),
    museumId: formData.get('museumId'),
  });
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }
  try {
    const repo = getRepository();
    const { user, initialPassword } = await createMuseumAdmin(repo, parsed.data);
    const museum = await repo.getMuseum(parsed.data.museumId);
    revalidatePath('/operator/admins');
    return {
      ok: true,
      initialPassword,
      email: user.email,
      museumName: museum?.name,
    };
  } catch (e) {
    return { error: describeError(e) };
  }
}
