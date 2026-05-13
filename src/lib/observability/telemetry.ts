import {
  SpanStatusCode,
  metrics,
  trace,
  type Attributes,
  type Span,
} from "@opentelemetry/api";

const tracer = trace.getTracer("oned-kadai");
const meter = metrics.getMeter("oned-kadai");

const githubRequestCounter = meter.createCounter("github_api_requests_total", {
  description: "Total GitHub API requests by status and cache behavior.",
});
const githubRequestDuration = meter.createHistogram(
  "github_api_request_duration_ms",
  {
    description: "GitHub API request duration in milliseconds.",
    unit: "ms",
  },
);
const githubCacheCounter = meter.createCounter("github_api_cache_events_total", {
  description: "GitHub API cache hits and stale fallback events.",
});

/**
 * span の開始/終了と例外記録を共通化します。
 * 呼び出し側は callback の中で属性追加や metrics 記録に集中できます。
 */
export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  callback: (span: Span) => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await callback(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
}

/** GitHub API の成功/失敗件数とレイテンシを同じ属性で記録します。 */
export function recordGitHubRequest(attributes: Attributes, durationMs: number) {
  githubRequestCounter.add(1, attributes);
  githubRequestDuration.record(durationMs, attributes);
}

/** cache hit と stale fallback は API latency と別軸で見たいので専用 counter にしています。 */
export function recordGitHubCacheEvent(attributes: Attributes) {
  githubCacheCounter.add(1, attributes);
}

/** structured log と trace を後から突き合わせられるよう、現在の trace 情報を取り出します。 */
export function getActiveTraceFields(): Record<string, string> {
  const spanContext = trace.getActiveSpan()?.spanContext();

  if (!spanContext) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}
