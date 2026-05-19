# GitHub リポジトリ検索

GitHub の公開リポジトリをキーワード検索し、一覧から詳細ページへ遷移できる Next.js App Router アプリです。

## 設計方針

- 検索状態は URL クエリ `q` / `language` / `topic` / `minStars` / `sort` / `order` / `page` を正本にしています。リロード、共有、戻る操作で同じ状態を再現できます。
- `src/app` はルーティングと画面合成に限定し、GitHub API 呼び出し、データ変換、検索条件の正規化は `src/lib` と `src/features` に分離しています。
- Server Components を基本にし、検索フォームは native HTML form の `method="get"` で実装しています。
- 適用中の検索条件は filter summary chips として表示し、条件ごとの解除と全リセットを URL ベースで実現しています。
- 詳細ページは一覧から渡された情報に依存せず、`GET /repos/{owner}/{repo}` で必ず再取得します。

## 工夫した点・拘ったポイント

- URL クエリを検索状態の正本にし、検索結果、ページネーション、詳細から戻る導線で状態が失われにくいようにしました。
- GitHub API 呼び出しを `src/lib/github` に集約し、ヘッダー、rate limit、キャッシュ、エラー分類を画面実装から分離しました。
- GitHub API の仕様に合わせ、詳細画面の Watcher 数は `watchers_count` ではなく `subscribers_count` を採用しています。
- Server Components と native form を基本にし、JavaScript が少ない構成でも検索導線が素直に動くようにしました。
- モバイル表示、キーボード操作、スクリーンリーダー向けの live region、E2E の mock server など、提出課題を超えて運用時に崩れにくい作りを意識しました。

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
- 詳細ページへのリンクはプリフェッチを無効化し、検索結果を表示しただけで各リポジトリの詳細 API を先読みしないようにしています。
- API 呼び出し結果は JSON structured log として `github_api_request_succeeded` / `github_api_request_failed` を出力します。
- Next.js の fetch cache に加えてプロセス内 cache を持ち、同じ URL は fresh cache を返し、403 / 429 / 5xx では stale window 内の cached response を fallback として返します。
- `SHARED_CACHE_REDIS_URL` または `REDIS_URL` を設定すると Redis shared cache を使い、複数プロセスや複数インスタンス間で GitHub API response cache を共有します。未設定時は in-memory cache のみです。
- `OBSERVABILITY_WEBHOOK_URL` を設定すると structured log を外部 collector に POST します。未設定時は console JSON のみです。
- `@vercel/otel` と OpenTelemetry API を使い、GitHub API 呼び出し、cache hit/stale fallback、request duration を traces / metrics として送れるようにしています。`OTEL_EXPORTER_OTLP_ENDPOINT` などの OTEL 標準環境変数で collector に接続できます。

## ローカル実行

通常の開発では Redis は必須ではありません。Redis 接続情報がない場合、GitHub API response cache はプロセス内 memory cache として動きます。

```bash
npm install
npm run dev
```

Redis shared cache を含めて本番に近い構成を試す場合は Docker Compose を使います。

```bash
docker compose up --build
```

アプリは `http://localhost:3000`、Redis は `localhost:6379` で起動します。`GITHUB_TOKEN` を使う場合は環境変数として渡してください。

```bash
GITHUB_TOKEN=... docker compose up --build
```

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
- Keyboard E2E: Enter での検索、キーボードによるリポジトリリンク遷移を検証します。
- Visual smoke test: 360px / 768px / 1440px viewport で screenshot の画素多様性と横スクロールなしを検証し、CI 環境差分に強い視覚テストにしています。
- Visual snapshot test: `npm run test:visual:update` で基準画像を更新し、`npm run test:visual` で検索フォーム、filter chips、repository card の screenshot regression を検証します。OS / font 差分が出やすいため、通常の `test:e2e` では smoke test のみ実行します。
- CI: GitHub Actions は責務別 job に分けています。Static Analysis、Unit and Component Tests、Production Build、E2E/Accessibility/Visual Smoke、Visual Snapshot Regression の単位で失敗箇所を確認できます。

実行コマンド:

```bash
npm run lint
npm run test
npm run test:e2e
npm run test:visual
npm run build
```

## アクセシビリティ対応

- 検索フォームに `role="search"` を付与しています。
- language、topic は候補プルダウンと自由入力の両方を用意し、検索キーワードは候補なしの自由入力にしています。
- 検索結果、0 件、エラー状態は live region で支援技術へ通知し、主要見出しへフォーカスを移動します。
- label、button、link、heading は Testing Library / Playwright の `getByRole` で取得できる accessible name を意識しています。
- エラー表示は `role="alert"`、ページネーションは `nav aria-label` を使っています。
- キーボードフォーカスが見えるように focus style を定義しています。

## レスポンシブ対応

- 一覧カード、検索フォーム、詳細統計は画面幅に応じて 1 カラムへ落ちるようにしています。
- 検索エリアは sticky にして、長い結果一覧でも条件変更へ戻りやすくしています。
- 詳細フィルターは native `<details>` で折りたためるようにし、モバイルで表示密度を調整しやすくしています。
- 長いリポジトリ名や説明文でも崩れにくいように `minmax(0, 1fr)` と `overflow-wrap` を使っています。
- タップしやすいようにフォーム、ボタン、ページネーションの高さを確保しています。
- Playwright の `Pixel 5` project で mobile viewport の主要導線、a11y、visual smoke を検証しています。

## エラーハンドリング方針

- 未検索: フォームのみ表示します。
- 0 件: Empty State を画面内に表示します。
- Loading: 結果カードに近い skeleton を表示します。
- 422: 検索条件エラーとして画面内に表示します。
- 403 / 429: rate limit として再試行案内と可能な範囲の API 残量を画面内に表示します。
- 詳細 404: `notFound()` を呼び出します。
- 想定外エラー: throw して `app/error.tsx` に委譲します。

## AI利用レポート

AI コーダーを使い、Next.js 16 App Router の構成作成、GitHub API 層の分離、URL クエリを正本にした検索設計、Testing Library / Playwright のテスト追加、README の設計説明整理を実施しました。

実装中は、GitHub API の `watchers_count` と `subscribers_count` の意味の違い、Search API の `language:` qualifier、rate limit header、Next.js の Server Components と native form の相性、Playwright で実 API に依存しない mock server 構成を重点的に確認しました。最終的な判断とコード修正は、テスト実行結果と lint 結果を見ながら反映しています。

## 今後の改善

- OpenTelemetry Collector / Grafana Tempo / Datadog など実際の監視基盤へ接続し、trace sampling と alert ルールを設計する。
- Redis shared cache の hit ratio、eviction、障害時 fallback を metrics 化し、CDN KV など他の shared cache backend も比較する。
- Docker image の軽量化、standalone output、healthcheck endpoint、非 root 実行の運用確認を進める。
- screenshot snapshot を CI の専用 job に分離し、承認フローと基準画像更新ルールを整備する。
- GitHub API の secondary rate limit や abuse detection を考慮した backoff / circuit breaker を追加する。
