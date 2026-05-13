import type { GitHubRateLimit } from "./rate-limit";

export class GitHubApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly rateLimit: GitHubRateLimit | null = null,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export type GitHubErrorKind =
  | "validation"
  | "rate-limit"
  | "not-found"
  | "unexpected";

export type ClassifiedGitHubError = {
  kind: GitHubErrorKind;
  title: string;
  message: string;
  status?: number;
  rateLimit?: GitHubRateLimit | null;
};

export function classifyGitHubError(error: unknown): ClassifiedGitHubError {
  if (!(error instanceof GitHubApiError)) {
    return {
      kind: "unexpected",
      title: "予期しないエラーが発生しました",
      message: "時間を置いてからもう一度お試しください。",
    };
  }

  if (error.status === 422) {
    return {
      kind: "validation",
      title: "検索条件を確認してください",
      message:
        "GitHub API が検索条件を処理できませんでした。キーワードを変えて再検索してください。",
      status: error.status,
      rateLimit: error.rateLimit,
    };
  }

  if (error.status === 403 || error.status === 429) {
    return {
      kind: "rate-limit",
      title: "GitHub API の制限に達しました",
      message:
        "少し時間を置いてから再試行してください。GITHUB_TOKEN を設定すると制限が緩和されます。",
      status: error.status,
      rateLimit: error.rateLimit,
    };
  }

  if (error.status === 404) {
    return {
      kind: "not-found",
      title: "リポジトリが見つかりません",
      message: "指定されたリポジトリは存在しないか、公開されていません。",
      status: error.status,
      rateLimit: error.rateLimit,
    };
  }

  return {
    kind: "unexpected",
    title: "予期しないエラーが発生しました",
    message: "時間を置いてからもう一度お試しください。",
    status: error.status,
    rateLimit: error.rateLimit,
  };
}
