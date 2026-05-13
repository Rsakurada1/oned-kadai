import type { ClassifiedGitHubError } from "@/lib/github/errors";
import { RateLimitStatus } from "./rate-limit-status";

type ErrorMessageProps = {
  error: ClassifiedGitHubError;
};

/**
 * 検索で回復可能な GitHub API エラーを、ページ内の alert として案内する。
 */
export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <section
      aria-labelledby="search-error-heading"
      className="error-message"
      role="alert"
    >
      <h2 id="search-error-heading" tabIndex={-1}>
        {error.title}
      </h2>
      <p>{error.message}</p>
      <p className="error-message__action">
        条件を緩めるか、少し時間を置いてから再検索してください。
      </p>
      <RateLimitStatus rateLimit={error.rateLimit} />
    </section>
  );
}
