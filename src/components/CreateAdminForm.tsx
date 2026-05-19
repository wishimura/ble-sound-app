'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  createAdminAction,
  type CreateAdminResult,
} from '@/app/operator/actions';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import type { Museum } from '@/lib/repository/types';

interface Issued {
  email: string;
  museumName: string;
  initialPassword: string;
}

export default function CreateAdminForm({ museums }: { museums: Museum[] }) {
  const [state, formAction, pending] = useActionState<CreateAdminResult, FormData>(
    createAdminAction,
    {},
  );
  const [issued, setIssued] = useState<Issued | null>(null);

  // Whenever the server action reports success, flip into "issued" mode.
  useEffect(() => {
    if (state.ok && state.initialPassword && state.email) {
      setIssued({
        email: state.email,
        museumName: state.museumName ?? '',
        initialPassword: state.initialPassword,
      });
    }
  }, [state]);

  if (issued) {
    return (
      <IssuedAccountCard
        {...issued}
        onIssueAnother={() => setIssued(null)}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Field label="担当施設" htmlFor="museumId">
        <select id="museumId" name="museumId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            選択してください
          </option>
          {museums.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="メールアドレス" htmlFor="email" hint="このメールアドレスがログインIDになります">
        <input id="email" name="email" type="email" required className={inputClass} />
      </Field>

      <button type="submit" disabled={pending} className={btn('primary')}>
        {pending ? '発行中...' : '事業者アカウントを発行'}
      </button>

      <p className="text-xs text-ink-muted">
        初期パスワードは自動生成されます。発行直後にこの画面に表示されるので、
        事業者にメール等で連絡してください（再表示はできません）。
      </p>
    </form>
  );
}

function IssuedAccountCard({
  email,
  museumName,
  initialPassword,
  onIssueAnother,
}: Issued & { onIssueAnother: () => void }) {
  const [copied, setCopied] = useState(false);

  const message = [
    '事業者アカウントを発行しました。下記情報を事業者へお伝えください。',
    '',
    `施設        : ${museumName}`,
    `ログインID  : ${email}`,
    `初期パスワード: ${initialPassword}`,
    'ログインURL : /admin/login',
    '',
    '※ 初回ログイン時、パスワード変更が必須となります。',
  ].join('\n');

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">
          アカウントを発行しました
        </p>
        <p className="mt-1 text-xs text-emerald-700">
          この画面を離れると初期パスワードは再表示できません。必ずコピーして事業者に送ってください。
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="施設" value={museumName} />
          <Row label="ログインID" value={email} />
          <Row label="初期パスワード" value={initialPassword} mono />
        </dl>
        <button
          type="button"
          onClick={copyAll}
          className={btn('secondary', 'mt-3 text-xs')}
        >
          {copied ? 'コピーしました' : '連絡用テキストをコピー'}
        </button>
      </div>
      <button type="button" onClick={onIssueAnother} className={btn('ghost', 'w-full')}>
        別のアカウントを発行する
      </button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-28 flex-none text-xs text-emerald-700">{label}</dt>
      <dd
        className={`min-w-0 flex-1 break-all text-emerald-900 ${
          mono ? 'font-mono text-base font-semibold' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
