-- ============================================================
-- Museum Audio Guide — デモデータ投入用 SQL
-- ============================================================
-- Neon の SQL Editor（または psql）にそのまま貼り付けて実行できます。
--
-- ログイン情報（3アカウント共通パスワード）: password1234
--   運営管理者          : operator@example.com    -> /operator/login
--   美術館管理者(美術館): art-admin@example.com   -> /admin/login
--   美術館管理者(水族館): aqua-admin@example.com  -> /admin/login
--
-- 画像 / 音声はアプリ同梱の public/samples/ を参照します（外部ホスト不要）。
-- ※ 何度実行しても同じ状態になります（先に全削除してから投入）。
-- ※ 既存DBに対しても STEP 1 を流すことで不足カラムを追加（ALTER）します。
-- ============================================================


-- ------------------------------------------------------------
-- STEP 1: テーブル作成 / 既存テーブルへのカラム追加（冪等）
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE museum_type AS ENUM ('museum', 'aquarium', 'zoo', 'other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('museum_admin', 'operator');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS museums (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  type        museum_type NOT NULL DEFAULT 'museum',
  logo_url    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS museum_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id     uuid REFERENCES museums(id) ON DELETE CASCADE,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          user_role NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 既存DB向け: 初回ログイン時パスワード変更フラグを追加。
-- 既存ユーザーは強制変更しない（false）が、今後発行されるアカウントは true 既定。
ALTER TABLE museum_users
  ADD COLUMN IF NOT EXISTS must_change_password boolean;
UPDATE museum_users
  SET must_change_password = false
  WHERE must_change_password IS NULL;
ALTER TABLE museum_users
  ALTER COLUMN must_change_password SET NOT NULL,
  ALTER COLUMN must_change_password SET DEFAULT true;

CREATE TABLE IF NOT EXISTS exhibits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id       uuid NOT NULL REFERENCES museums(id) ON DELETE CASCADE,
  exhibit_number  text NOT NULL,
  title_ja        text NOT NULL,
  title_en        text,
  description_ja  text NOT NULL DEFAULT '',
  description_en  text,
  audio_url_ja    text,
  audio_url_en    text,
  image_url       text,
  is_published    boolean NOT NULL DEFAULT false,
  play_count      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exhibits_museum_number_unique UNIQUE (museum_id, exhibit_number)
);

-- 既存DB向け: AI読み上げ用の原稿カラムを追加。
ALTER TABLE exhibits ADD COLUMN IF NOT EXISTS narration_ja text;
ALTER TABLE exhibits ADD COLUMN IF NOT EXISTS narration_en text;


-- ------------------------------------------------------------
-- STEP 2: デモデータ投入
-- ------------------------------------------------------------

DELETE FROM exhibits;
DELETE FROM museum_users;
DELETE FROM museums;

INSERT INTO museums (id, name, description, type, logo_url, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111',
   '湊町近代美術館',
   '近現代の絵画・彫刻を中心に展示する美術館。落ち着いた空間で名作をお楽しみいただけます。',
   'museum', '/samples/logo-art.svg', true),
  ('22222222-2222-2222-2222-222222222222',
   'うみのいろ水族館',
   '深海から沿岸まで、海の生きものたちの多様な世界をご紹介します。',
   'aquarium', '/samples/logo-aqua.svg', true);

-- 既存アカウントは強制変更フラグを false（普通にログインで使える状態）にする。
INSERT INTO museum_users (museum_id, email, password_hash, role, must_change_password) VALUES
  (NULL,
   'operator@example.com',
   '$2a$10$xtRwcLnYs8y.6p.TSizfkOgTHox5Et0GtV5C.73als17TT0glltDi',
   'operator', false),
  ('11111111-1111-1111-1111-111111111111',
   'art-admin@example.com',
   '$2a$10$xtRwcLnYs8y.6p.TSizfkOgTHox5Et0GtV5C.73als17TT0glltDi',
   'museum_admin', false),
  ('22222222-2222-2222-2222-222222222222',
   'aqua-admin@example.com',
   '$2a$10$xtRwcLnYs8y.6p.TSizfkOgTHox5Et0GtV5C.73als17TT0glltDi',
   'museum_admin', false);

-- 展示（湊町近代美術館）
INSERT INTO exhibits
  (museum_id, exhibit_number, title_ja, title_en, description_ja, description_en,
   narration_ja, narration_en,
   audio_url_ja, audio_url_en, image_url, is_published, play_count)
VALUES
  ('11111111-1111-1111-1111-111111111111', '1', '朝の港', 'Harbor at Dawn',
   '夜明けの港を描いた油彩画。淡い光と水面の反射が、静かな時間の流れを表現しています。',
   'An oil painting of a harbor at dawn. The soft light and reflections on the water express the quiet passage of time.',
   NULL, NULL,
   '/samples/guide-ja.wav', '/samples/guide-en.wav',
   '/samples/art-1.svg', true, 128),

  ('11111111-1111-1111-1111-111111111111', '2', '赤い椅子のある室内', 'Interior with a Red Chair',
   '室内の静物を大胆な色彩で構成した作品。赤い椅子が画面に強い緊張感を生み出します。',
   'A still life of an interior composed with bold colors. The red chair creates a strong tension in the composition.',
   NULL, NULL,
   '/samples/guide-ja.wav', NULL,
   '/samples/art-2.svg', true, 86),

  -- AI読み上げのデモ: 音声URLを設定せず、読み上げテキストのみを登録した展示
  ('11111111-1111-1111-1111-111111111111', '3', '山の記憶', 'Memory of the Mountain',
   '抽象的な筆致で山の稜線を描いた大作。制作中の下絵も併せて展示しています。',
   'A large work depicting mountain ridges with abstract brushwork.',
   'こちらの作品は、抽象的な筆致で山の稜線を描いた大作です。ぜひ近くで筆使いをご覧ください。',
   'This large work depicts mountain ridges with abstract brushwork. Please take a closer look at the brush strokes.',
   NULL, NULL,
   '/samples/art-3.svg', true, 42),

  ('11111111-1111-1111-1111-111111111111', '99', '（準備中）特別展示', NULL,
   '次回特別展に向けて準備中の展示です。', NULL,
   NULL, NULL, NULL, NULL, NULL, false, 0);

-- 展示（うみのいろ水族館）
INSERT INTO exhibits
  (museum_id, exhibit_number, title_ja, title_en, description_ja, description_en,
   narration_ja, narration_en,
   audio_url_ja, audio_url_en, image_url, is_published, play_count)
VALUES
  ('22222222-2222-2222-2222-222222222222', '1', 'クラゲの遊泳', 'Drifting Jellyfish',
   'ゆらめく光の中を漂うミズクラゲ。透き通った体と規則的な拍動の仕組みを解説します。',
   'Moon jellyfish drifting in shimmering light. Learn about their transparent bodies and rhythmic pulsing.',
   NULL, NULL,
   '/samples/guide-ja.wav', '/samples/guide-en.wav',
   '/samples/aqua-1.svg', true, 203),

  ('22222222-2222-2222-2222-222222222222', '2', '深海の生きものたち', 'Creatures of the Deep Sea',
   '水深200m以深に暮らす生きものたち。光の届かない世界での適応をご覧ください。',
   'Creatures living below 200m depth. Discover their adaptations to a world without light.',
   NULL, NULL,
   '/samples/guide-ja.wav', NULL,
   '/samples/aqua-2.svg', true, 157),

  ('22222222-2222-2222-2222-222222222222', '3', 'サンゴ礁の世界', 'The Coral Reef',
   '色とりどりの魚が暮らすサンゴ礁。生態系のつながりを映像とともに紹介します。',
   'A coral reef where colorful fish live, shown with its ecosystem connections.',
   NULL, NULL,
   '/samples/guide-ja.wav', NULL,
   '/samples/aqua-3.svg', true, 91);

SELECT 'museums' AS table, count(*) FROM museums
UNION ALL SELECT 'museum_users', count(*) FROM museum_users
UNION ALL SELECT 'exhibits', count(*) FROM exhibits;
