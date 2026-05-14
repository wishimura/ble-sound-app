# Museum Audio Guide (MVP)

美術館・水族館・動物園などの施設で使う「番号入力式 音声ガイド Web アプリ」の MVP です。
来館者はスマホから展示番号を入力し、解説文と音声ガイドを閲覧／再生できます。

> データベースは **Neon (PostgreSQL)** を利用します（Supabase ではありません）。

---

## 主な機能

### 来館者（ログイン不要）
- 施設選択 → 展示番号入力 → 展示詳細表示
- 音声再生（再生／停止のみ・HTML5 `<audio>`・Bluetooth / オープンイヤー対応・MediaSession でバックグラウンド操作対応）
- 日本語 / 英語の切替
- お気に入り登録（LocalStorage、DB 不要）

### 美術館／施設管理者（要ログイン）
- 自施設情報の編集
- 展示の登録 / 編集 / 削除
- 展示番号・解説文（日英）・音声 URL（日英）・画像 URL の設定
- 公開 / 非公開の切替
- 再生数の確認（ダッシュボード・展示一覧）
- **他施設のデータには一切アクセス不可**（マルチテナント）

### 運営管理者（サービス運営者）
- 全施設の管理・施設の追加・施設の停止／再開
- 美術館管理者アカウントの発行
- 全体統計・人気展示ランキング（全施設横断）

---

## 技術スタック

| 領域 | 採用技術 |
| ---- | -------- |
| フレームワーク | Next.js 15 (App Router) / React 19 |
| 言語 | TypeScript（strict） |
| スタイル | Tailwind CSS v3 |
| データベース | Neon (PostgreSQL) |
| ORM / マイグレーション | Drizzle ORM / drizzle-kit |
| 認証 | 自前実装（bcrypt パスワードハッシュ + `jose` による署名付き JWT を httpOnly Cookie に保存） |
| バリデーション | Zod |
| テスト | Vitest |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
src/
├─ app/
│  ├─ (visitor)/              来館者向け画面（BottomNav 付きレイアウト）
│  │  ├─ page.tsx             トップ
│  │  ├─ museums/             施設選択
│  │  ├─ m/[museumId]/        展示番号入力
│  │  │  └─ e/[number]/       展示詳細 + 音声再生
│  │  └─ favorites/           お気に入り一覧
│  ├─ admin/                  美術館管理画面（/admin/login + (protected) グループ）
│  ├─ operator/               運営管理画面（/operator/login + (protected) グループ）
│  └─ api/                    login / logout / 再生数記録 の API ルート
├─ components/                UI コンポーネント
├─ lib/
│  ├─ db/                     Drizzle スキーマ & Neon クライアント
│  ├─ repository/             Repository 抽象（neon 実装 + テスト用 in-memory 実装）
│  ├─ services/               業務ロジック（visitor / admin / operator / auth）
│  ├─ auth/                   パスワード・JWT・セッション
│  ├─ validation.ts           Zod スキーマ
│  ├─ tenant.ts               マルチテナント分離ガード
│  └─ analytics.ts            集計ロジック
├─ middleware.ts              /admin・/operator のルート保護
scripts/seed.ts               ダミーデータ投入
tests/                        単体・結合・シナリオテスト
```

データアクセスは `Repository` インターフェース経由に統一しているため、
業務ロジック（`services/`）は DB なしで完全にテスト可能です。

---

## セットアップ手順

### 1. Neon プロジェクトを作成

1. [Neon](https://neon.tech/) でアカウント作成 → 新規プロジェクトを作成
2. **Connection Details** から接続文字列（`postgresql://...?sslmode=require`）をコピー

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

| 変数 | 説明 |
| ---- | ---- |
| `DATABASE_URL` | Neon の接続文字列（必須） |
| `JWT_SECRET` | セッション JWT の署名鍵。16 文字以上のランダム文字列（本番必須）。`openssl rand -base64 48` などで生成 |
| `SEED_PASSWORD` | seed が作成する管理者の初期パスワード（任意・既定 `password1234`） |

### 4. データベースの初期化

```bash
npm run db:push   # スキーマを Neon に反映（テーブル作成）
npm run seed      # ダミーデータ（施設・管理者・展示）を投入
```

`seed` 完了後、以下のアカウントが利用できます（パスワードは `SEED_PASSWORD`）。

| ロール | メールアドレス | ログイン URL |
| ------ | -------------- | ------------ |
| 運営管理者 | `operator@example.com` | `/operator/login` |
| 美術館管理者（美術館） | `art-admin@example.com` | `/admin/login` |
| 美術館管理者（水族館） | `aqua-admin@example.com` | `/admin/login` |

### 5. 開発サーバー起動

```bash
npm run dev
# http://localhost:3000
```

---

## npm スクリプト

| コマンド | 内容 |
| -------- | ---- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` / `npm start` | 本番ビルド / 起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 型チェック |
| `npm run test` | Vitest（単体・結合・シナリオ） |
| `npm run db:push` | Drizzle スキーマを DB に反映 |
| `npm run db:generate` | マイグレーションファイル生成 |
| `npm run seed` | ダミーデータ投入 |

---

## Vercel へのデプロイ

1. このリポジトリを GitHub に push し、Vercel で Import
2. **Environment Variables** に `DATABASE_URL` と `JWT_SECRET` を設定
3. デプロイ実行（フレームワークは自動で Next.js が選択されます）
4. 初回のみ、ローカルから本番 DB に対して `npm run db:push` と `npm run seed` を実行
   （`.env` の `DATABASE_URL` を本番 Neon の値にして実行）

Neon はサーバーレス接続（`@neondatabase/serverless`）を利用しているため、
Vercel の Serverless / Edge 環境でも追加設定なく動作します。

---

## セキュリティ

- **認証**: パスワードは bcrypt でハッシュ化。セッションは署名付き JWT を httpOnly / SameSite=Lax Cookie に保存
- **ルート保護**: `middleware.ts` で `/admin/*`・`/operator/*` をロール単位で保護
- **マルチテナント分離**: 美術館管理者の操作はすべて `session.museumId` にスコープされ、`lib/tenant.ts` の所有権ガードで他施設データへのアクセスを拒否（テストで検証済み）
- **XSS 対策**: ユーザー入力は React のエスケープに委ね、`dangerouslySetInnerHTML` は不使用。音声・画像・ロゴ URL は Zod で `http(s)` スキームのみ許可（`javascript:` 等を拒否）
- **API キー秘匿**: 接続情報・署名鍵は環境変数管理。`.env` は `.gitignore` 済み
- **再生数の保護**: 公開済み展示に対してのみ再生数を加算

---

## MVP の制約・割り切り

- 画像・音声は **URL 指定方式**（ファイルアップロード UI は未実装）。実運用では Vercel Blob 等の追加を想定
- 再生数は「展示の音声を初めて再生したセッション」単位の簡易カウント
- お気に入りは LocalStorage のみ（端末間同期なし）
- 多言語は日本語・英語の 2 言語、UI ラベルは日本語ベース
- BLE 制御 / 自動接続 / ビーコン / AI / 決済などは対象外（指示書の「MVP では不要」に準拠）

---

## テスト

`npm run test` で実行。詳細な結果は [`TEST_RESULTS.md`](./TEST_RESULTS.md) を参照してください。

- **単体テスト**: パスワードハッシュ / JWT、Zod バリデーション、集計ロジック、テナント分離ガード
- **結合テスト**: `Repository` 実装（in-memory）を介した各サービスの連携
- **シナリオテスト**: 指示書の主要 8 フロー（施設選択 → 番号入力 → 展示表示 → 音声再生 → 管理者ログイン → 展示追加 → 展示公開 → 他施設アクセス不可）を 1 本のテストで通し検証
