import PasswordChangeForm from '@/components/PasswordChangeForm';
import { Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';

export const metadata = { title: 'パスワード変更' };

export default async function OperatorPasswordPage() {
  await requireOperator();
  return (
    <div className="mx-auto max-w-md space-y-5">
      <PageTitle title="パスワード変更" subtitle="運営アカウントのパスワードを更新します" />
      <Card className="p-5">
        <PasswordChangeForm />
      </Card>
    </div>
  );
}
