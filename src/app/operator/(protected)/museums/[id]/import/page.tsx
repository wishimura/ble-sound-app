import Link from 'next/link';
import { notFound } from 'next/navigation';
import CsvImportForm from '@/components/CsvImportForm';
import { Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  CSV_HEADERS,
  getMuseumForOperator,
} from '@/lib/services/operator-content';

export const metadata = { title: 'CSV一括登録' };

export default async function OperatorCsvImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;

  let museum;
  try {
    museum = await getMuseumForOperator(getRepository(), id);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/operator/museums/${museum.id}`} className="text-sm text-ink-muted">
          ← {museum.name}
        </Link>
        <div className="mt-2">
          <PageTitle title="CSV一括登録" subtitle={museum.name} />
        </div>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-ink">CSVフォーマット</h2>
        <p className="mt-1 text-sm text-ink-muted">
          1行目はヘッダ。展示番号が既存と重複する場合は内容を上書き更新します
          （音声URL・画像URLは既存値を保持）。
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-canvas p-3">
          <code className="text-xs text-ink-soft">{CSV_HEADERS.join(',')}</code>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <Row name="exhibit_number" desc="展示番号（施設内で重複しない文字列）" />
          <Row name="title_ja / title_en" desc="日本語タイトル（必須）／英語タイトル（任意）" />
          <Row name="description_ja / description_en" desc="解説文（任意）" />
          <Row
            name="narration_ja / narration_en"
            desc="AI読み上げ用テキスト（音声URL未設定時に使用、任意）"
          />
          <Row name="is_published" desc="true / false。公開するかどうか" />
        </dl>
        <p className="mt-3 text-xs text-ink-muted">
          ※ 音声ファイル・画像ファイルの登録はCSV後に各展示の編集画面から個別に行ってください。
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-ink">CSVをアップロード</h2>
        <p className="mt-1 mb-4 text-sm text-ink-muted">
          UTF-8（BOM付き可）の CSV ファイルを選択してください。
        </p>
        <CsvImportForm museumId={museum.id} />
      </Card>
    </div>
  );
}

function Row({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-56 flex-none font-mono text-xs text-accent-dark">{name}</dt>
      <dd className="text-ink-soft">{desc}</dd>
    </div>
  );
}
