import type { ClassifiedGitHubError } from "@/lib/github/errors";

type ErrorMessageProps = {
  error: ClassifiedGitHubError;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <section className="error-message" role="alert">
      <h2>{error.title}</h2>
      <p>{error.message}</p>
    </section>
  );
}

