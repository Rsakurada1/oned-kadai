"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * 想定外エラーは App Router の error boundary に任せ、最小限の再試行 UI を出す。
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  void error;

  return (
    <div className="error-message" role="alert">
      <h1>予期しないエラーが発生しました</h1>
      <p>時間を置いてからもう一度お試しください。</p>
      <button className="button button--primary" onClick={reset} type="button">
        再試行
      </button>
    </div>
  );
}
