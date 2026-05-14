/**
 * Seeds the Neon database with demo data.
 *
 *   1. npm run db:push   # create tables
 *   2. npm run seed      # insert demo museums / users / exhibits
 *
 * Safe to re-run: it clears the three tables first.
 */
import 'dotenv/config';
import { getDb } from '../src/lib/db/client';
import { exhibits, museums, museumUsers } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/auth/password';

const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const SAMPLE_AUDIO_2 = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Configure .env before seeding.');
  }
  const db = getDb();
  const password = process.env.SEED_PASSWORD ?? 'password1234';
  const passwordHash = await hashPassword(password);

  console.log('Clearing existing data...');
  await db.delete(exhibits);
  await db.delete(museumUsers);
  await db.delete(museums);

  console.log('Inserting museums...');
  const [artMuseum, aquarium] = await db
    .insert(museums)
    .values([
      {
        name: '湊町近代美術館',
        description:
          '近現代の絵画・彫刻を中心に展示する美術館。落ち着いた空間で名作をお楽しみいただけます。',
        type: 'museum',
        logoUrl: img('artmuseum-logo'),
        isActive: true,
      },
      {
        name: 'うみのいろ水族館',
        description: '深海から沿岸まで、海の生きものたちの多様な世界をご紹介します。',
        type: 'aquarium',
        logoUrl: img('aquarium-logo'),
        isActive: true,
      },
    ])
    .returning();

  console.log('Inserting users...');
  await db.insert(museumUsers).values([
    {
      museumId: null,
      email: 'operator@example.com',
      passwordHash,
      role: 'operator',
    },
    {
      museumId: artMuseum.id,
      email: 'art-admin@example.com',
      passwordHash,
      role: 'museum_admin',
    },
    {
      museumId: aquarium.id,
      email: 'aqua-admin@example.com',
      passwordHash,
      role: 'museum_admin',
    },
  ]);

  console.log('Inserting exhibits...');
  await db.insert(exhibits).values([
    {
      museumId: artMuseum.id,
      exhibitNumber: '1',
      titleJa: '朝の港',
      titleEn: 'Harbor at Dawn',
      descriptionJa:
        '夜明けの港を描いた油彩画。淡い光と水面の反射が、静かな時間の流れを表現しています。',
      descriptionEn:
        'An oil painting of a harbor at dawn. The soft light and reflections on the water express the quiet passage of time.',
      audioUrlJa: SAMPLE_AUDIO,
      audioUrlEn: SAMPLE_AUDIO_2,
      imageUrl: img('harbor'),
      isPublished: true,
      playCount: 128,
    },
    {
      museumId: artMuseum.id,
      exhibitNumber: '2',
      titleJa: '赤い椅子のある室内',
      titleEn: 'Interior with a Red Chair',
      descriptionJa:
        '室内の静物を大胆な色彩で構成した作品。赤い椅子が画面に強い緊張感を生み出します。',
      descriptionEn:
        'A still life of an interior composed with bold colors. The red chair creates a strong tension in the composition.',
      audioUrlJa: SAMPLE_AUDIO,
      audioUrlEn: null,
      imageUrl: img('redchair'),
      isPublished: true,
      playCount: 86,
    },
    {
      museumId: artMuseum.id,
      exhibitNumber: '3',
      titleJa: '山の記憶',
      titleEn: 'Memory of the Mountain',
      descriptionJa: '抽象的な筆致で山の稜線を描いた大作。制作中の下絵も併せて展示しています。',
      descriptionEn: 'A large work depicting mountain ridges with abstract brushwork.',
      audioUrlJa: SAMPLE_AUDIO_2,
      audioUrlEn: null,
      imageUrl: img('mountain'),
      isPublished: true,
      playCount: 42,
    },
    {
      museumId: artMuseum.id,
      exhibitNumber: '99',
      titleJa: '（準備中）特別展示',
      titleEn: null,
      descriptionJa: '次回特別展に向けて準備中の展示です。',
      descriptionEn: null,
      audioUrlJa: null,
      audioUrlEn: null,
      imageUrl: null,
      isPublished: false,
      playCount: 0,
    },
    {
      museumId: aquarium.id,
      exhibitNumber: '1',
      titleJa: 'クラゲの遊泳',
      titleEn: 'Drifting Jellyfish',
      descriptionJa:
        'ゆらめく光の中を漂うミズクラゲ。透き通った体と規則的な拍動の仕組みを解説します。',
      descriptionEn:
        'Moon jellyfish drifting in shimmering light. Learn about their transparent bodies and rhythmic pulsing.',
      audioUrlJa: SAMPLE_AUDIO,
      audioUrlEn: SAMPLE_AUDIO_2,
      imageUrl: img('jellyfish'),
      isPublished: true,
      playCount: 203,
    },
    {
      museumId: aquarium.id,
      exhibitNumber: '2',
      titleJa: '深海の生きものたち',
      titleEn: 'Creatures of the Deep Sea',
      descriptionJa: '水深200m以深に暮らす生きものたち。光の届かない世界での適応をご覧ください。',
      descriptionEn:
        'Creatures living below 200m depth. Discover their adaptations to a world without light.',
      audioUrlJa: SAMPLE_AUDIO_2,
      audioUrlEn: null,
      imageUrl: img('deepsea'),
      isPublished: true,
      playCount: 157,
    },
    {
      museumId: aquarium.id,
      exhibitNumber: '3',
      titleJa: 'サンゴ礁の世界',
      titleEn: 'The Coral Reef',
      descriptionJa: '色とりどりの魚が暮らすサンゴ礁。生態系のつながりを映像とともに紹介します。',
      descriptionEn: 'A coral reef where colorful fish live, shown with its ecosystem connections.',
      audioUrlJa: SAMPLE_AUDIO,
      audioUrlEn: null,
      imageUrl: img('coral'),
      isPublished: true,
      playCount: 91,
    },
  ]);

  console.log('\nSeed complete.');
  console.log('--------------------------------------------------');
  console.log('Operator login   : operator@example.com');
  console.log('Art museum admin : art-admin@example.com');
  console.log('Aquarium admin   : aqua-admin@example.com');
  console.log(`Password (all)   : ${password}`);
  console.log('--------------------------------------------------');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
