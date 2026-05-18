'use client';

import { useActionState } from 'react';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import { museumTypeLabel } from '@/lib/i18n';
import type { Museum } from '@/lib/repository/types';

interface ActionState {
  error?: string;
  ok?: boolean;
}

type MuseumAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const types = ['museum', 'aquarium', 'zoo', 'other'] as const;

export default function MuseumForm({
  action,
  museum,
  submitLabel,
  successMessage,
}: {
  action: MuseumAction;
  museum?: Museum;
  submitLabel: string;
  successMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.ok && successMessage ? <Alert kind="success">{successMessage}</Alert> : null}

      <Field label="施設名" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={museum?.name ?? ''}
          className={inputClass}
        />
      </Field>

      <Field label="施設タイプ" htmlFor="type">
        <select
          id="type"
          name="type"
          defaultValue={museum?.type ?? 'museum'}
          className={inputClass}
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {museumTypeLabel[t]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="説明" htmlFor="description">
        <textarea
          id="description"
          name="description"
          defaultValue={museum?.description ?? ''}
          className={`${inputClass} min-h-24 resize-y`}
        />
      </Field>

      <Field label="ロゴ画像URL" htmlFor="logoUrl" hint="https:// で始まる画像URL">
        <input
          id="logoUrl"
          name="logoUrl"
          type="text"
          defaultValue={museum?.logoUrl ?? ''}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={btn('primary')}>
        {pending ? '保存中...' : submitLabel}
      </button>
    </form>
  );
}
