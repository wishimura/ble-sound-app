'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import FileUploadButton from '@/components/FileUploadButton';
import GenerateAudioButton from '@/components/GenerateAudioButton';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import type { Exhibit } from '@/lib/repository/types';

interface ActionState {
  error?: string;
  ok?: boolean;
}

type ExhibitAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export default function ExhibitForm({
  exhibit,
  action,
  cancelHref,
  museumId,
}: {
  exhibit?: Exhibit;
  action: ExhibitAction;
  cancelHref: string;
  /** Operator-scoped forms emit this as a hidden field so the action knows
   * which museum to write to. Admin (museum_admin) forms omit it because the
   * museum is derived from the session. */
  museumId?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const textareaClass = `${inputClass} min-h-28 resize-y`;

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {museumId ? <input type="hidden" name="museumId" value={museumId} /> : null}
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

      <div className="rounded-xl border border-line bg-canvas p-4">
        <p className="text-sm font-medium text-ink">音声の登録方法</p>
        <p className="mt-1 text-xs text-ink-muted">
          各言語で「音声URL」を登録すると、その音声ファイルが再生されます。
          URL が空のまま「読み上げテキスト」を登録すると、ブラウザの音声合成で
          AI が読み上げます（端末によって声質が変わります）。両方空ならその言語の音声は表示されません。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="音声（日本語）" htmlFor="audioUrlJa" hint="mp3 / wav 等。ファイルから直接アップロードできます">
          <input
            id="audioUrlJa"
            name="audioUrlJa"
            type="text"
            defaultValue={exhibit?.audioUrlJa ?? ''}
            className={inputClass}
          />
          <FileUploadButton targetInputId="audioUrlJa" purpose="audio" />
        </Field>
        <Field label="音声（英語）" htmlFor="audioUrlEn">
          <input
            id="audioUrlEn"
            name="audioUrlEn"
            type="text"
            defaultValue={exhibit?.audioUrlEn ?? ''}
            className={inputClass}
          />
          <FileUploadButton targetInputId="audioUrlEn" purpose="audio" />
        </Field>
      </div>

      <Field
        label="読み上げテキスト（日本語）"
        htmlFor="narrationJa"
        hint="音声URLが空のとき、このテキストを来館者の端末がAIで読み上げます。「AIで音声を生成」を押すと、より自然な音声ファイルを生成して上の音声欄に自動セットします"
      >
        <textarea
          id="narrationJa"
          name="narrationJa"
          defaultValue={exhibit?.narrationJa ?? ''}
          className={textareaClass}
        />
        <GenerateAudioButton
          narrationInputId="narrationJa"
          audioInputId="audioUrlJa"
          lang="ja"
        />
      </Field>

      <Field label="読み上げテキスト（英語）" htmlFor="narrationEn">
        <textarea
          id="narrationEn"
          name="narrationEn"
          defaultValue={exhibit?.narrationEn ?? ''}
          className={textareaClass}
        />
        <GenerateAudioButton
          narrationInputId="narrationEn"
          audioInputId="audioUrlEn"
          lang="en"
        />
      </Field>

      <Field label="展示画像" htmlFor="imageUrl" hint="jpeg / png / webp 等。ファイルから直接アップロードできます">
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          defaultValue={exhibit?.imageUrl ?? ''}
          className={inputClass}
        />
        <FileUploadButton targetInputId="imageUrl" purpose="image" />
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
        <Link href={cancelHref} className={btn('ghost')}>
          キャンセル
        </Link>
      </div>
    </form>
  );
}
