'use client';

import { useActionState } from 'react';
import { createAdminAction, type ActionState } from '@/app/operator/actions';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import type { Museum } from '@/lib/repository/types';

export default function CreateAdminForm({ museums }: { museums: Museum[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createAdminAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.ok ? <Alert kind="success">管理者アカウントを発行しました</Alert> : null}

      <Field label="担当施設" htmlFor="museumId">
        <select id="museumId" name="museumId" required className={inputClass}>
          <option value="">選択してください</option>
          {museums.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="メールアドレス" htmlFor="email">
        <input id="email" name="email" type="email" required className={inputClass} />
      </Field>

      <Field label="初期パスワード" htmlFor="password" hint="8文字以上">
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={btn('primary')}>
        {pending ? '発行中...' : '管理者を発行'}
      </button>
    </form>
  );
}
