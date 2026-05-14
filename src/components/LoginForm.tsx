'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Field, btn, inputClass } from '@/components/ui';
import type { UserRole } from '@/lib/repository/types';

export default function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data: { redirectTo?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'ログインに失敗しました');
        return;
      }
      router.push(data.redirectTo ?? '/');
      router.refresh();
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      <Field label="メールアドレス" htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="パスワード" htmlFor="password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={loading} className={btn('primary', 'w-full')}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
