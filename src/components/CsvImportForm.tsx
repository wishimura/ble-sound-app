'use client';

import { useActionState } from 'react';
import {
  operatorImportCsvAction,
  type CsvImportActionState,
} from '@/app/operator/(protected)/museums/[id]/actions';
import { Alert, Badge, btn } from '@/components/ui';

export default function CsvImportForm({ museumId }: { museumId: string }) {
  const [state, formAction, pending] = useActionState<CsvImportActionState, FormData>(
    operatorImportCsvAction,
    {},
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="museumId" value={museumId} />
        <input
          type="file"
          name="csv"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-canvas hover:file:bg-ink-soft"
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className={btn('primary')}>
            {pending ? '読み込み中...' : 'インポート実行'}
          </button>
          <a href="/api/csv-template/exhibits" className={btn('ghost')} download>
            テンプレートをダウンロード
          </a>
        </div>
      </form>

      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.result ? <ResultPanel result={state.result} /> : null}
    </div>
  );
}

function ResultPanel({
  result,
}: {
  result: NonNullable<CsvImportActionState['result']>;
}) {
  return (
    <div className="space-y-3">
      <Alert kind={result.errors === 0 ? 'success' : 'info'}>
        {result.errors === 0
          ? `${result.total} 件中 ${result.created} 件を新規作成、${result.updated} 件を更新しました。`
          : `${result.total} 件中 ${result.created + result.updated} 件成功、${result.errors} 件失敗`}
      </Alert>

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-ink-muted">
            <tr>
              <th className="px-3 py-2">行</th>
              <th className="px-3 py-2">展示番号</th>
              <th className="px-3 py-2">状態</th>
              <th className="px-3 py-2">メッセージ</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.row} className="border-t border-line">
                <td className="px-3 py-2 text-ink-muted">{r.row}</td>
                <td className="px-3 py-2">{r.exhibitNumber ?? '-'}</td>
                <td className="px-3 py-2">
                  {r.status === 'created' ? (
                    <Badge tone="success">新規</Badge>
                  ) : r.status === 'updated' ? (
                    <Badge>更新</Badge>
                  ) : (
                    <Badge tone="muted">エラー</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-ink-muted">{r.message ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
