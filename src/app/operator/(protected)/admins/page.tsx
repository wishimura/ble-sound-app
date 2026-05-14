import CreateAdminForm from '@/components/CreateAdminForm';
import { Badge, Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { listMuseumAdmins, listMuseumsForOperator } from '@/lib/services/operator';

export const metadata = { title: '管理者管理' };

export default async function OperatorAdminsPage() {
  await requireOperator();
  const repo = getRepository();
  const [users, museums] = await Promise.all([
    listMuseumAdmins(repo),
    listMuseumsForOperator(repo),
  ]);

  return (
    <div className="space-y-6">
      <PageTitle title="管理者管理" subtitle="美術館管理者アカウントの発行と一覧" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold text-ink">管理者アカウントを発行</h2>
          <p className="mt-1 mb-4 text-sm text-ink-muted">
            指定した施設のみを管理できる管理者を発行します。
          </p>
          <CreateAdminForm museums={museums} />
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-ink">登録済みアカウント（{users.length}）</h2>
          {users.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">アカウントがありません。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{u.email}</p>
                    <p className="text-xs text-ink-muted">
                      {u.museumName ?? '全施設'}
                    </p>
                  </div>
                  <Badge tone={u.role === 'operator' ? 'neutral' : 'muted'}>
                    {u.role === 'operator' ? '運営' : '美術館'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
