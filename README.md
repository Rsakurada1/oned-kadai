# GitHub リポジトリ検索

GitHub の公開リポジトリをキーワード検索し、一覧から詳細ページへ遷移できる Next.js App Router アプリです。

## 設計方針

- 検索状態は URL クエリ `q` / `language` / `topic` / `minStars` / `sort` / `order` / `page` を正本にしています。リロード、共有、戻る操作で同じ状態を再現できます。
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

- `/`: `searchParams` から検索語、language、topic、Star 下限、sort/order、page を読み、未検索時は検索フォームのみ、検索時は一覧、空状態、API 残量、または画面内エラーを表示します。
- `/repositories/[owner]/[repo]`: 詳細 API を再取得し、repo 名、owner icon、language、Star 数、Watcher 数、Fork 数、Issue 数を表示します。
- 詳細 404 は `notFound()` に委譲し、専用の `not-found.tsx` を表示します。

## データ取得方針

- GitHub API 呼び出しはすべて `src/lib/github` に隔離しています。
- `GITHUB_API_BASE_URL` で API base URL を差し替え可能です。未設定時は `https://api.github.com` を使います。
- `GITHUB_TOKEN` がある場合は `Authorization: Bearer ...` を付与します。
- `Accept: application/vnd.github+json` と `X-GitHub-Api-Version: 2022-11-28` を常に付与します。
- 検索 API は `GET /search/repositories?q=...&page=...&per_page=20`、キャッシュは 60 秒です。`language`、`topic`、`minStars` 指定時は GitHub Search の qualifier を検索クエリに追加します。
- 詳細 API は `GET /repos/{owner}/{repo}`、キャッシュは 300 秒です。
- GitHub API の rate limit は各レスポンスの `X-RateLimit-*` header から読み取り、成功時と rate limit エラー時に画面へ表示します。
- API 呼び出し結果は JSON structured log として `github_api_request_succeeded` / `github_api_request_failed` を出力します。
- Next.js の fetch cache に加えてプロセス内 cache を持ち、同じ URL は fresh cache を返し、403 / 429 / 5xx では stale window 内の cached response を fallback として返します。
- `OBSERVABILITY_WEBHOOK_URL` を設定すると structured log を外部 collector に POST します。未設定時は console JSON のみです。

## GitHub API の仕様上の考慮

GitHub API では `watchers_count` は Star 数に対応し、実際の Watcher 数は `subscribers_count` に対応します。そのため詳細画面の Watcher 数は `subscribers_count` を採用しています。

また、検索 API は取得可能な検索結果が最大 1,000 件に制限されるため、ページ数計算でも 1,000 件を上限にしています。

## ディレクトリ構成

```text
src/
  app/                         # App Router
  e2e/                          # Playwright spec と mock GitHub server
  features/repositories/        # リポジトリ検索の UI、モデル、サービス
  instrumentation.ts            # Next.js request error monitoring hook
  lib/github/                   # GitHub API client、headers、errors、rate limit、types
  lib/observability/            # structured logging
  test/fixtures/                # Unit/Component/E2E 共通 fixtures
```

## テスト戦略

- Unit test: `parseSearchParams`、filter 正規化、GitHub search query builder、search URL builder、mapper、`classifyGitHubError`、rate limit header parser、GitHub response cache を検証します。
- Component test: SearchForm、RepositoryList、RepositoryDetail、Pagination、EmptyState、ErrorMessage、RateLimitStatus を Testing Library で検証します。
- E2E: Playwright の `webServer` で mock GitHub server と Next.js dev server を起動し、`GITHUB_API_BASE_URL=http://127.0.0.1:4010` に差し替えます。
- E2E では desktop と mobile viewport で、検索、filter、一覧から詳細への遷移、詳細から戻る操作、0 件表示、rate limit 表示を検証します。
- Accessibility test: `@axe-core/playwright` で serious / critical violation がないことを検証します。
- Visual smoke test: screenshot の画素多様性と横スクロールなしを検証し、CI 環境差分に強い視覚テストにしています。
- CI: GitHub Actions で lint、Unit/Component、build、Playwright E2E/a11y/visual smoke を実行します。

実行コマンド:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## アクセシビリティ対応

- 検索フォームに `role="search"` を付与しています。
- 検索キーワード、language、topic は native `<datalist>` で候補補完を提供しています。
- label、button、link、heading は Testing Library / Playwright の `getByRole` で取得できる accessible name を意識しています。
- エラー表示は `role="alert"`、ページネーションは `nav aria-label` を使っています。
- キーボードフォーカスが見えるように focus style を定義しています。

## レスポンシブ対応

- 一覧カード、検索フォーム、詳細統計は画面幅に応じて 1 カラムへ落ちるようにしています。
- 長いリポジトリ名や説明文でも崩れにくいように `minmax(0, 1fr)` と `overflow-wrap` を使っています。
- タップしやすいようにフォーム、ボタン、ページネーションの高さを確保しています。
- Playwright の `Pixel 5` project で mobile viewport の主要導線、a11y、visual smoke を検証しています。

## エラーハンドリング方針

- 未検索: フォームのみ表示します。
- 0 件: Empty State を画面内に表示します。
- 422: 検索条件エラーとして画面内に表示します。
- 403 / 429: rate limit として再試行案内と可能な範囲の API 残量を画面内に表示します。
- 詳細 404: `notFound()` を呼び出します。
- 想定外エラー: throw して `app/error.tsx` に委譲します。

## AI利用レポート

AI コーダーを使い、Next.js 16 App Router の構成作成、GitHub API 層の分離、URL クエリを正本にした検索設計、Testing Library / Playwright のテスト追加、README の設計説明整理を実施しました。

実装中は、GitHub API の `watchers_count` と `subscribers_count` の意味の違い、Search API の `language:` qualifier、rate limit header、Next.js の Server Components と native form の相性、Playwright で実 API に依存しない mock server 構成を重点的に確認しました。最終的な判断とコード修正は、テスト実行結果と lint 結果を見ながら反映しています。

## 今後の改善

- `/rate_limit` の取得を併用して、キャッシュ済みページでもより新しい API 残量を表示する。
- Redis や CDN KV を使い、プロセスをまたいだ shared cache を追加する。
- structured log を OpenTelemetry の traces / metrics と関連付ける。
- Playwright screenshot snapshot による視覚回帰テストを追加する。
