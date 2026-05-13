import type { GitHubRateLimit } from "@/lib/github/rate-limit";

type RateLimitStatusProps = {
  rateLimit: GitHubRateLimit | null | undefined;
};

export function RateLimitStatus({ rateLimit }: RateLimitStatusProps) {
  if (!rateLimit) {
    return null;
  }

  const resetText = rateLimit.resetAt
    ? new Intl.DateTimeFormat("ja-JP", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(rateLimit.resetAt))
    : "不明";

  return (
    <aside aria-label="GitHub API rate limit" className="rate-limit-status">
      <h2>GitHub API 残量</h2>
      <dl>
        <div>
          <dt>Remaining</dt>
          <dd>{formatRemaining(rateLimit)}</dd>
        </div>
        <div>
          <dt>Reset</dt>
          <dd>{resetText}</dd>
        </div>
        <div>
          <dt>Resource</dt>
          <dd>{rateLimit.resource ?? "不明"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function formatRemaining(rateLimit: GitHubRateLimit): string {
  if (rateLimit.remaining === null && rateLimit.limit === null) {
    return "不明";
  }

  if (rateLimit.limit === null) {
    return `${rateLimit.remaining?.toLocaleString()} 回`;
  }

  if (rateLimit.remaining === null) {
    return `上限 ${rateLimit.limit.toLocaleString()} 回`;
  }

  return `${rateLimit.remaining.toLocaleString()} / ${rateLimit.limit.toLocaleString()} 回`;
}

