'use client';

import { useActionState } from 'react';
import {
  changePasswordAction,
  type PasswordActionState,
} from '@/app/admin/password/actions';
import { Alert, Field, btn, inputClass } from '@/components/ui';

export default function PasswordChangeForm({ forced }: { forced?: boolean }) {
  const [state, formAction, pending] = useActionState<PasswordActionState, FormData>(
    changePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {forced ? (
        <Alert kind="info">
          初回ログインです。安全のため、運営者から発行された初期パスワードを
          ご自身のパスワードに変更してください。
        </Alert>
      ) : null}
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Field label="現在のパスワード" htmlFor="currentPassword">
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <Field label="新しいパスワード" htmlFor="newPassword" hint="8文字以上">
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>

      <Field label="新しいパスワード（確認）" htmlFor="confirmPassword">
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={btn('primary', 'w-full')}>
        {pending ? '更新中...' : 'パスワードを変更'}
      </button>
    </form>
  );
}
