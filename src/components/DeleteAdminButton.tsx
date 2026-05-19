'use client';

import { deleteAdminAction } from '@/app/operator/actions';

export default function DeleteAdminButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <form
      action={deleteAdminAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `${email} のアカウントを削除します。よろしいですか？\n（このアカウントではログインできなくなります）`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={userId} />
      <button
        type="submit"
        className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] text-red-700 hover:bg-red-50"
      >
        削除
      </button>
    </form>
  );
}
