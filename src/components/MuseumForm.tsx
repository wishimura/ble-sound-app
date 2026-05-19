'use client';

import { useActionState, useRef, useState } from 'react';
import FileUploadButton from '@/components/FileUploadButton';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import { museumTypeLabel } from '@/lib/i18n';
import { useUnsavedWarning } from '@/lib/use-unsaved-warning';
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
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty && !pending);

  const originalSlug = museum?.slug ?? '';
  const formRef = useRef<HTMLFormElement>(null);

  function guardSlugChange(e: React.FormEvent<HTMLFormElement>) {
    if (!museum) return; // creating a new museum -> no risk
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get('slug') ?? '').trim();
    if (next && next !== originalSlug) {
      const ok = window.confirm(
        [
          '施設のURL識別子（スラッグ）を変更しようとしています。',
          '',
          `  旧: ${originalSlug}`,
          `  新: ${next}`,
          '',
          '変更すると、印刷済みのQRコードや、共有された旧URLは無効になります。',
          'よろしいですか？',
        ].join('\n'),
      );
      if (!ok) e.preventDefault();
    }
    setDirty(false);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={() => setDirty(true)}
      onSubmit={guardSlugChange}
      className="space-y-5"
    >
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

      <Field
        label="URL識別子（スラッグ）"
        htmlFor="slug"
        hint="来館者URLに使われます（例: uminoiro）。半角英小文字・数字・ハイフン、先頭は英字。変更すると既存QRコードのURLが無効になります"
      >
        <input
          id="slug"
          name="slug"
          required
          pattern="[a-z][a-z0-9-]{1,31}"
          defaultValue={museum?.slug ?? ''}
          placeholder="例: uminoiro"
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

      <Field label="ロゴ画像" htmlFor="logoUrl" hint="jpeg / png / webp 等。ファイルから直接アップロードできます">
        <input
          id="logoUrl"
          name="logoUrl"
          type="text"
          defaultValue={museum?.logoUrl ?? ''}
          className={inputClass}
        />
        <FileUploadButton targetInputId="logoUrl" purpose="image" />
      </Field>

      <button type="submit" disabled={pending} className={btn('primary')}>
        {pending ? '保存中...' : submitLabel}
      </button>
    </form>
  );
}
