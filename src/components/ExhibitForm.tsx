'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { saveExhibitAction, type ActionState } from '@/app/admin/actions';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import type { Exhibit } from '@/lib/repository/types';

const initialState: ActionState = {};

export default function ExhibitForm({ exhibit }: { exhibit?: Exhibit }) {
  const [state, formAction, pending] = useActionState(saveExhibitAction, initialState);
  const textareaClass = `${inputClass} min-h-28 resize-y`;

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {exhibit ? <input type="hidden" name="id" value={exhibit.id} /> : null}

      <Field label="展示番号" htmlFor="exhibitNumber" hint="施設内で重複しない番号">
        <input
          id="exhibitNumber"
          name="exhibitNumber"
          required
          defaultValue={exhibit?.exhibitNumber ?? ''}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="タイトル（日本語）" htmlFor="titleJa">
          <input
            id="titleJa"
            name="titleJa"
            required
            defaultValue={exhibit?.titleJa ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="タイトル（英語）" htmlFor="titleEn">
          <input
            id="titleEn"
            name="titleEn"
            defaultValue={exhibit?.titleEn ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="解説文（日本語）" htmlFor="descriptionJa">
        <textarea
          id="descriptionJa"
          name="descriptionJa"
          defaultValue={exhibit?.descriptionJa ?? ''}
          className={textareaClass}
        />
      </Field>

      <Field label="解説文（英語）" htmlFor="descriptionEn">
        <textarea
          id="descriptionEn"
          name="descriptionEn"
          defaultValue={exhibit?.descriptionEn ?? ''}
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="音声URL（日本語）" htmlFor="audioUrlJa" hint="https:// で始まる音声ファイル">
          <input
            id="audioUrlJa"
            name="audioUrlJa"
            type="url"
            defaultValue={exhibit?.audioUrlJa ?? ''}
            className={inputClass}
          />
        </Field>
        <Field label="音声URL（英語）" htmlFor="audioUrlEn">
          <input
            id="audioUrlEn"
            name="audioUrlEn"
            type="url"
            defaultValue={exhibit?.audioUrlEn ?? ''}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="展示画像URL" htmlFor="imageUrl" hint="https:// で始まる画像URL">
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          defaultValue={exhibit?.imageUrl ?? ''}
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={exhibit?.isPublished ?? false}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        <span className="text-sm font-medium text-ink-soft">この展示を公開する</span>
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={btn('primary')}>
          {pending ? '保存中...' : '保存する'}
        </button>
        <Link href="/admin/exhibits" className={btn('ghost')}>
          キャンセル
        </Link>
      </div>
    </form>
  );
}
