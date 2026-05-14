# テスト結果

実行コマンド:

```bash
npm run test       # Vitest（単体・結合・シナリオ）
npm run typecheck  # tsc --noEmit
npm run lint       # next lint (ESLint)
npm run build      # next build（本番ビルド）
```

## サマリ

| 項目 | 結果 |
| ---- | ---- |
| 単体・結合・シナリオテスト | ✅ 4 ファイル / 22 件すべて成功 |
| TypeScript 型チェック | ✅ エラーなし |
| ESLint | ✅ 警告・エラーなし |
| 本番ビルド | ✅ 成功（17 ルート + middleware を生成） |

---

## 1. 単体テスト（Unit）

### `tests/auth.test.ts` — 認証
- ✅ 正しいパスワードを検証できる（bcrypt）
- ✅ 誤ったパスワードを拒否する
- ✅ セッション JWT を署名→検証で正しく往復できる
- ✅ 改ざん / 不正なトークンは `null` を返す

### `tests/validation.test.ts` — 入力バリデーション（Zod）
- ✅ 展示の有効な入力を受理し、空文字を `null` に正規化する
- ✅ 未チェックの公開チェックボックスを「非公開」として扱う
- ✅ 日本語タイトル空欄を拒否する
- ✅ `javascript:` など非 http(s) の URL を拒否する（XSS / 不正スキーム対策）
- ✅ 展示番号の空欄を拒否する
- ✅ 施設の有効な入力を受理 / 不明な施設タイプを拒否する
- ✅ ログイン時にメールアドレスを小文字化する / 不正な形式を拒否する
- ✅ 短いパスワード（8 文字未満）を拒否する

### `tests/analytics.test.ts` — 集計・テナント分離
- ✅ 展示数・公開／非公開数・累計再生数を正しく集計する
- ✅ 再生数の降順で人気展示をランキングし、上限件数を尊重する
- ✅ 自施設の展示には所有権ガードを通過できる
- ✅ 他施設の展示へのアクセスは `FORBIDDEN` で拒否する
- ✅ `canAccessMuseum`: 運営者は全施設、美術館管理者は自施設のみ許可

## 2. 結合テスト（Integration）

`tests/scenario.test.ts` 内で、`Repository` のインメモリ実装を介して
各サービス（visitor / admin / operator / auth）の連携を検証。

- ✅ 管理者メールアドレスの重複を `CONFLICT` で拒否する
- ✅ 同一施設内での展示番号重複を拒否する（施設をまたぐ重複は許可）
- ✅ 運営者は停止中を含む全施設を一覧できる

## 3. シナリオテスト（Scenario）

`tests/scenario.test.ts` — 指示書の主要 8 フローを 1 本で通し検証。

| # | フロー | 検証内容 |
| - | ------ | -------- |
| 1 | 来館者が施設選択 | 稼働中の施設のみ一覧に出る / 施設詳細を取得できる |
| 2 | 番号入力 | 番号で公開展示を取得できる |
| 3 | 展示表示 | 非公開展示・存在しない番号は `null`（来館者に非表示） |
| 4 | 音声再生 | 再生数が加算される / 非公開展示では加算できない |
| 5 | 美術館管理者ログイン | 正しい資格情報で成功 / 誤パスワードは失敗 |
| 6 | 展示追加 | 管理者が自施設に展示を作成できる |
| 7 | 展示公開 | 非公開展示を公開化すると来館者に表示される |
| 8 | 他施設データへアクセス不可 | 美術館 A の管理者が美術館 B の展示を読取／更新しようとすると `FORBIDDEN` |

加えて、施設停止後はその施設が来館者の一覧・詳細から除外されること、
全体分析の集計（施設数・稼働数・人気展示）が正しいことも確認。

---

## 実行ログ（`npm run test`）

```
 ✓ tests/validation.test.ts (10 tests)
 ✓ tests/analytics.test.ts (5 tests)
 ✓ tests/scenario.test.ts (3 tests)
 ✓ tests/auth.test.ts (4 tests)

 Test Files  4 passed (4)
      Tests  22 passed (22)
```

## ビルド結果（`npm run build`）

```
 ✓ Compiled successfully
 ✓ Generating static pages (17/17)

Route (app)                              First Load JS
┌ ○ /                                          106 kB
├ ƒ /admin, /admin/exhibits, /admin/...         104-108 kB
├ ƒ /m/[museumId]/e/[number]                    114 kB
├ ƒ /museums, /operator/...                     103-107 kB
└ ƒ Middleware                                  39.7 kB
```

---

## 手動確認の手順（DB 接続が必要なため自動化対象外）

`DATABASE_URL` を設定し `npm run db:push && npm run seed && npm run dev` 実行後:

1. `/` → 「音声ガイドを始める」→ `/museums` で施設一覧が表示される
2. 施設を選び、展示番号（例: `1`）を入力 → 展示詳細が表示される
3. 再生ボタンで音声が再生され、言語切替・お気に入り登録ができる
4. `/admin/login` で `art-admin@example.com` ログイン → ダッシュボード表示
5. 展示を追加・公開 → 来館者画面に反映される
6. `/operator/login` で `operator@example.com` ログイン → 全施設・全体分析を確認
