import FavoritesList from '@/components/FavoritesList';
import { PageTitle } from '@/components/ui';

export const metadata = { title: 'お気に入り | Museum Audio Guide' };

export default function FavoritesPage() {
  return (
    <main className="space-y-4 px-5 pt-8">
      <PageTitle
        title="お気に入り"
        subtitle="この端末に保存された展示の一覧です"
      />
      <FavoritesList />
    </main>
  );
}
