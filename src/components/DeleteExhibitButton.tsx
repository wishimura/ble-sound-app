'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import { btn } from '@/components/ui';

type DeleteAction = (formData: FormData) => void | Promise<void>;

/**
 * Shows a styled confirm dialog before posting the delete form. Replaces
 * the native window.confirm so the experience matches the rest of the UI.
 */
export default function DeleteExhibitButton({
  exhibitId,
  action,
  museumId,
}: {
  exhibitId: string;
  action: DeleteAction;
  museumId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btn('danger')}>
        削除する
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-base font-semibold text-ink">この展示を削除しますか？</h3>
        <p className="mt-2 text-sm text-ink-soft">
          展示と紐づく解説テキスト・公開設定が削除されます。
          来館者画面からも見えなくなります。
          <br />
          <span className="text-ink-muted">※ 元に戻すことはできません。</span>
        </p>
        <form action={action} className="mt-5 flex justify-end gap-2">
          <input type="hidden" name="id" value={exhibitId} />
          {museumId ? <input type="hidden" name="museumId" value={museumId} /> : null}
          <button type="button" onClick={() => setOpen(false)} className={btn('ghost')}>
            キャンセル
          </button>
          <button type="submit" className={btn('danger')}>
            削除する
          </button>
        </form>
      </Modal>
    </>
  );
}
