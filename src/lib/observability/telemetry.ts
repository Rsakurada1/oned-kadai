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

export function recordGitHubRequest(attributes: Attributes, durationMs: number) {
  githubRequestCounter.add(1, attributes);
  githubRequestDuration.record(durationMs, attributes);
}

export function recordGitHubCacheEvent(attributes: Attributes) {
  githubCacheCounter.add(1, attributes);
}

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

