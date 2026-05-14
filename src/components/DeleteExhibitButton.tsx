'use client';

import { deleteExhibitAction } from '@/app/admin/actions';
import { btn } from '@/components/ui';

export default function DeleteExhibitButton({ exhibitId }: { exhibitId: string }) {
  return (
    <form
      action={deleteExhibitAction}
      onSubmit={(e) => {
        if (!window.confirm('この展示を削除します。よろしいですか？')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={exhibitId} />
      <button type="submit" className={btn('danger')}>
        削除する
      </button>
    </form>
  );
}
