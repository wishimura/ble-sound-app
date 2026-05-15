'use client';

import Image from 'next/image';
import { useState } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import FavoriteButton from '@/components/FavoriteButton';
import TTSPlayer from '@/components/TTSPlayer';
import { Badge } from '@/components/ui';
import { languageLabel } from '@/lib/i18n';
import type { Exhibit, Language } from '@/lib/repository/types';

interface ExhibitViewProps {
  exhibit: Pick<
    Exhibit,
    | 'id'
    | 'exhibitNumber'
    | 'titleJa'
    | 'titleEn'
    | 'descriptionJa'
    | 'descriptionEn'
    | 'narrationJa'
    | 'narrationEn'
    | 'audioUrlJa'
    | 'audioUrlEn'
    | 'imageUrl'
  >;
  museumName: string;
  museumId: string;
}

export default function ExhibitView({ exhibit, museumName, museumId }: ExhibitViewProps) {
  const [lang, setLang] = useState<Language>('ja');

  const title =
    lang === 'en' ? (exhibit.titleEn ?? exhibit.titleJa) : exhibit.titleJa;
  const description =
    lang === 'en'
      ? (exhibit.descriptionEn ?? exhibit.descriptionJa)
      : exhibit.descriptionJa;
  const audioUrl = lang === 'en' ? exhibit.audioUrlEn : exhibit.audioUrlJa;
  const narration = lang === 'en' ? exhibit.narrationEn : exhibit.narrationJa;

  return (
    <article className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge>No. {exhibit.exhibitNumber}</Badge>
        <div className="flex rounded-full border border-line bg-surface p-0.5">
          {(['ja', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                lang === l ? 'bg-ink text-canvas' : 'text-ink-muted'
              }`}
            >
              {languageLabel[l]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-ink-muted">{museumName}</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight text-ink">{title}</h1>
      </div>

      {exhibit.imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl2 border border-line bg-canvas">
          <Image
            src={exhibit.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}

      {audioUrl ? (
        <AudioPlayer
          src={audioUrl}
          exhibitId={exhibit.id}
          title={title}
          museumName={museumName}
        />
      ) : narration ? (
        <TTSPlayer
          text={narration}
          lang={lang}
          exhibitId={exhibit.id}
          title={title}
          museumName={museumName}
        />
      ) : (
        <div className="rounded-xl2 border border-dashed border-line bg-canvas p-4 text-center text-sm text-ink-muted">
          {languageLabel[lang]}の音声はありません
        </div>
      )}

      {description ? (
        <p className="whitespace-pre-wrap leading-relaxed text-ink-soft">{description}</p>
      ) : null}

      <FavoriteButton
        item={{
          museumId,
          museumName,
          exhibitId: exhibit.id,
          exhibitNumber: exhibit.exhibitNumber,
          title: exhibit.titleJa,
        }}
      />
    </article>
  );
}
