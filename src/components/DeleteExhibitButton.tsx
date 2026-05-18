'use client';

import { btn } from '@/components/ui';

type DeleteAction = (formData: FormData) => void | Promise<void>;

/**
 * Reusable confirm-then-submit delete button. The caller passes whichever
 * server action is appropriate (admin scope or operator scope).
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
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm('この展示を削除します。よろしいですか？')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={exhibitId} />
      {museumId ? <input type="hidden" name="museumId" value={museumId} /> : null}
      <button type="submit" className={btn('danger')}>
        削除する
      </button>
    </form>
  );
}
