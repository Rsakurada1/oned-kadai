import type { ClassifiedGitHubError } from "@/lib/github/errors";
import { RateLimitStatus } from "./rate-limit-status";

type ErrorMessageProps = {
  error: ClassifiedGitHubError;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <section className="error-message" role="alert">
      <h2>{error.title}</h2>
      <p>{error.message}</p>
      <RateLimitStatus rateLimit={error.rateLimit} />
    </section>
  );
}
