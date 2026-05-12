# GitHub リポジトリ検索

GitHub の公開リポジトリをキーワード検索し、一覧から詳細ページへ遷移できる Next.js App Router アプリです。

## 設計方針

- 検索状態は URL クエリ `q` / `page` を正本にしています。リロード、共有、戻る操作で同じ状態を再現できます。
- `src/app` はルーティングと画面合成に限定し、GitHub API 呼び出し、データ変換、検索条件の正規化は `src/lib` と `src/features` に分離しています。
- Server Components を基本にし、検索フォームは native HTML form の `method="get"` で実装しています。
- 詳細ページは一覧から渡された情報に依存せず、`GET /repos/{owner}/{repo}` で必ず再取得します。

## 使用技術

- Next.js 16.2.6
- React 19.2.6
- TypeScript
- Vitest
- React Testing Library
- Playwright
- ESLint

## ルーティング設計

- `/`: `searchParams` から `q` と `page` を読み、未検索時は検索フォームのみ、検索時は一覧、空状態、または画面内エラーを表示します。
- `/repositories/[owner]/[repo]`: 詳細 API を再取得し、repo 名、owner icon、language、Star 数、Watcher 数、Fork 数、Issue 数を表示します。
- 詳細 404 は `notFound()` に委譲し、専用の `not-found.tsx` を表示します。

## データ取得方針

- GitHub API 呼び出しはすべて `src/lib/github` に隔離しています。
- `GITHUB_API_BASE_URL` で API base URL を差し替え可能です。未設定時は `https://api.github.com` を使います。
- `GITHUB_TOKEN` がある場合は `Authorization: Bearer ...` を付与します。
- `Accept: application/vnd.github+json` と `X-GitHub-Api-Version: 2022-11-28` を常に付与します。
- 検索 API は `GET /search/repositories?q=...&page=...&per_page=20`、キャッシュは 60 秒です。
- 詳細 API は `GET /repos/{owner}/{repo}`、キャッシュは 300 秒です。

## GitHub API の仕様上の考慮

GitHub API では `watchers_count` は Star 数に対応し、実際の Watcher 数は `subscribers_count` に対応します。そのため詳細画面の Watcher 数は `subscribers_count` を採用しています。

また、検索 API は取得可能な検索結果が最大 1,000 件に制限されるため、ページ数計算でも 1,000 件を上限にしています。

## ディレクトリ構成

```text
src/
  app/                         # App Router
  features/repositories/        # リポジトリ検索の UI、モデル、サービス
  lib/github/                   # GitHub API client、headers、errors、types
  test/fixtures/                # Unit/Component/E2E 共通 fixtures
  e2e/                          # Playwright spec と mock GitHub server
```

## テスト戦略

- Unit test: `parseSearchParams`、`normalizePage`、mapper、`classifyGitHubError` を検証します。
- Component test: SearchForm、RepositoryList、RepositoryDetail、Pagination、EmptyState、ErrorMessage を Testing Library で検証します。
- E2E: Playwright の `webServer` で mock GitHub server と Next.js dev server を起動し、`GITHUB_API_BASE_URL=http://127.0.0.1:4010` に差し替えます。
- E2E では検索、一覧から詳細への遷移、詳細から戻る操作、0 件表示、rate limit 表示を検証します。

実行コマンド:

```bash
npm run lint
npm run test
npm run test:e2e
```

## アクセシビリティ対応

- 検索フォームに `role="search"` を付与しています。
- label、button、link、heading は Testing Library / Playwright の `getByRole` で取得できる accessible name を意識しています。
- エラー表示は `role="alert"`、ページネーションは `nav aria-label` を使っています。
- キーボードフォーカスが見えるように focus style を定義しています。

## レスポンシブ対応

- 一覧カード、検索フォーム、詳細統計は画面幅に応じて 1 カラムへ落ちるようにしています。
- 長いリポジトリ名や説明文でも崩れにくいように `minmax(0, 1fr)` と `overflow-wrap` を使っています。
- タップしやすいようにフォーム、ボタン、ページネーションの高さを確保しています。

## エラーハンドリング方針

- 未検索: フォームのみ表示します。
- 0 件: Empty State を画面内に表示します。
- 422: 検索条件エラーとして画面内に表示します。
- 403 / 429: rate limit として再試行案内を画面内に表示します。
- 詳細 404: `notFound()` を呼び出します。
- 想定外エラー: throw して `app/error.tsx` に委譲します。

## AI利用レポート

AI コーダーを使い、Next.js 16 App Router の構成作成、GitHub API 層の分離、URL クエリを正本にした検索設計、Testing Library / Playwright のテスト追加、README の設計説明整理を実施しました。

実装中は、GitHub API の `watchers_count` と `subscribers_count` の意味の違い、Next.js の Server Components と native form の相性、Playwright で実 API に依存しない mock server 構成を重点的に確認しました。最終的な判断とコード修正は、テスト実行結果と lint 結果を見ながら反映しています。

## 今後の改善

- 検索条件の候補補完や language filter を追加する。
- GitHub rate limit の残量表示をレスポンスヘッダーから出す。
- 本番運用向けに monitoring と structured logging を追加する。
- Playwright の mobile viewport テストを追加する。

