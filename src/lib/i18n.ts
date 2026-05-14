import type { Language } from '@/lib/repository/types';

export const LANGUAGES: Language[] = ['ja', 'en'];

export const languageLabel: Record<Language, string> = {
  ja: '日本語',
  en: 'English',
};

type Dict = Record<Language, string>;

export const ui = {
  appName: { ja: 'Museum Audio Guide', en: 'Museum Audio Guide' } satisfies Dict,
  tagline: {
    ja: '番号を入力して、展示の音声ガイドを楽しむ',
    en: 'Enter a number to enjoy the exhibit audio guide',
  } satisfies Dict,
  start: { ja: '音声ガイドを始める', en: 'Start audio guide' } satisfies Dict,
  home: { ja: 'ホーム', en: 'Home' } satisfies Dict,
  museums: { ja: '施設', en: 'Facilities' } satisfies Dict,
  favorites: { ja: 'お気に入り', en: 'Favorites' } satisfies Dict,
  selectMuseum: { ja: '施設を選択', en: 'Select a facility' } satisfies Dict,
  enterNumber: { ja: '展示番号を入力', en: 'Enter exhibit number' } satisfies Dict,
  show: { ja: '表示する', en: 'Show' } satisfies Dict,
  notFound: {
    ja: 'その番号の展示は見つかりませんでした',
    en: 'No exhibit found for that number',
  } satisfies Dict,
  play: { ja: '再生', en: 'Play' } satisfies Dict,
  pause: { ja: '停止', en: 'Pause' } satisfies Dict,
  noAudio: { ja: 'この言語の音声はありません', en: 'No audio for this language' } satisfies Dict,
  addFavorite: { ja: 'お気に入りに追加', en: 'Add to favorites' } satisfies Dict,
  removeFavorite: { ja: 'お気に入りから削除', en: 'Remove from favorites' } satisfies Dict,
  noFavorites: {
    ja: 'まだお気に入りはありません',
    en: 'No favorites yet',
  } satisfies Dict,
  exhibitNo: { ja: '展示番号', en: 'Exhibit No.' } satisfies Dict,
} as const;

export function t(key: keyof typeof ui, lang: Language): string {
  return ui[key][lang];
}

export const museumTypeLabel: Record<string, string> = {
  museum: '美術館',
  aquarium: '水族館',
  zoo: '動物園',
  other: 'その他',
};
