'use client';

import { useState } from 'react';
import { deleteAdminAction } from '@/app/operator/actions';
import Modal from '@/components/Modal';
import { btn } from '@/components/ui';

export default function DeleteAdminButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] text-red-700 hover:bg-red-50"
      >
        削除
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-base font-semibold text-ink">事業者アカウントを削除しますか？</h3>
        <p className="mt-2 text-sm text-ink-soft">
          以下のアカウントは再ログインできなくなります。
        </p>
        <p className="mt-3 break-all rounded-lg border border-line bg-canvas px-3 py-2 text-sm font-medium text-ink">
          {email}
        </p>
        <p className="mt-3 text-xs text-ink-muted">
          ※ 施設・展示・音声・画像などのコンテンツは残ります。アカウントの再発行はいつでも可能です。
        </p>
        <form action={deleteAdminAction} className="mt-5 flex justify-end gap-2">
          <input type="hidden" name="id" value={userId} />
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
