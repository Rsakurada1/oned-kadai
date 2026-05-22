# GitHub リポジトリ検索

GitHub REST API の `search/repositories` を使い、公開リポジトリを求人検索サイト風の UI で探せる Next.js App Router アプリです。一覧カードからリポジトリ詳細ページへ遷移し、詳細ページでは主要指標、言語構成、ライセンス、topics、作成日、最終 push、clone URL、HTTPS/SSH の clone command などを表示します。

## 使用技術

- Next.js 16.2.6
- App Router
- React 19.2.6
- TypeScript
- Vitest / React Testing Library
- Playwright
- ESLint

## 設計思想

- 検索状態は URL クエリを正本にしています。`q`、`languages`、`frameworks`、`clouds`、`stars`、`forks`、`lowIssues`、`recentlyUpdated`、`sort`、`order`、`page` を見れば現在の状態が分かります。
- PC では左に検索条件サイドバー、右に検索結果カード一覧を置く 2 カラムです。スマホでは検索条件が一覧の上に積まれるレスポンシブ構成です。
- `src/app` はルーティングと画面合成に寄せ、GitHub API 呼び出し、検索条件の正規化、Search API の `q` 生成、データ変換は `src/features` と `src/lib` に分離しています。
- 検索フォームは native HTML form の `method="get"` を使い、React state に検索条件を閉じ込めない設計にしています。チェックボックス submit の repeated params と、内部リンクの comma-separated params の両方を受け付けます。
- 詳細ページはモーダルではなく `/repositories/[owner]/[repo]` のページです。一覧から渡された情報には依存せず、`GET /repos/{owner}/{repo}` と `GET /repos/{owner}/{repo}/languages` で再取得します。

## 検索条件の変換方針

- 言語フィルターは `language:TypeScript` のような GitHub Search qualifier に変換します。複数選択時は `(language:TypeScript OR language:JavaScript)` のように OR group として `q` に含めます。
- フレームワーク・ライブラリ、クラウド・インフラは GitHub API で構造化されていない条件のため、キーワードまたは `topic:` 検索として扱います。例: Next.js は `(nextjs OR topic:nextjs)`、Spring Boot は `("spring boot" OR topic:spring-boot)`。
- Star / Fork はチェックボックスで有効化したうえで数値入力し、`stars:>=100`、`forks:>=100` のような qualifier に変換します。最近更新されたは直近 30 日の `pushed:>YYYY-MM-DD` に変換します。
- Issueが少ないは GitHub repository search に open issue 数の直接 qualifier がないため、取得したページ内で Issue 数 10 以下に後処理フィルターします。総件数とページングは GitHub API の返す件数を基準にしています。
- README 内容検索は GitHub Search API だけでは扱いづらいため、現在の UI には検索条件として出していません。将来、contents API などを組み合わせて追加する想定です。

## ルーティング

- `/`: URL query から検索状態を復元し、左サイドバー、並び替えリンク、検索結果一覧、空状態、API 残量、エラー案内を表示します。
- `/repositories/[owner]/[repo]`: 詳細 API と言語 API を再取得し、リポジトリ詳細を表示します。詳細 404 は `notFound()` に委譲します。

## データ取得

- 検索 API: `GET /search/repositories?q=...&sort=...&order=...&page=...&per_page=20`
- 詳細 API: `GET /repos/{owner}/{repo}`
- 言語 API: `GET /repos/{owner}/{repo}/languages`
- `GITHUB_API_BASE_URL` で API base URL を差し替え可能です。E2E では mock GitHub server に向けます。
- `GITHUB_TOKEN` がある場合は `Authorization: Bearer ...` を付与します。
- Rate limit は `X-RateLimit-*` header から読み取り、画面に表示します。
- 詳細リンクの prefetch は無効化し、一覧表示だけで詳細 API を大量に呼ばないようにしています。

## ローカル実行

```bash
npm install
npm run dev
```

アプリは通常 `http://localhost:3000` で起動します。Redis shared cache を含めて試す場合は Docker Compose を使えます。

```bash
docker compose up --build
```

## テスト戦略

- Unit test: URL query の正規化、GitHub Search `q` builder、URL builder、mapper、GitHub API error / rate limit / cache を検証します。
- Component test: SearchForm、SortLinks、FilterSummary、RepositoryList、RepositoryDetail、Pagination、EmptyState、ErrorMessage、RateLimitStatus を Testing Library で検証します。
- E2E: Playwright で mock GitHub server と Next.js dev server を起動し、検索、フィルター、並び替え、一覧から詳細への遷移、戻る導線、0 件、rate limit、アクセシビリティ、レスポンシブ表示を検証します。
- Visual smoke / snapshot: 主要 viewport の描画、横スクロールなし、検索パネル・条件チップ・カードの screenshot regression を検証します。

実行コマンド:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:visual
```

既に同じリポジトリで `next dev` が起動している場合、Next.js の dev server lock により Playwright の `webServer` が起動できません。その場合は既存の dev server を停止してから `npm run test:e2e` を実行してください。

## AI利用レポート

AI コーダーを使い、Next.js 16 / App Router / TypeScript の既存構成を読み取り、URL 正本の検索状態モデル、チェックボックス中心の左サイドバー UI、GitHub Search API の `q` 生成、詳細ページ導線、テスト、README を実装・更新しました。

実装中は、GitHub repository search の qualifier、フレームワーク/クラウドの非構造化条件の扱い、Watcher 数として `subscribers_count` を使う判断、Server Components と native GET form の相性、E2E で実 API に依存しない mock server 構成を確認しました。最終判断は lint、unit/component test、production build の結果を見ながら反映しています。
