import { logError, logInfo } from "@/lib/observability/logger";
import { registerOTel } from "@vercel/otel";

type RequestErrorContext = {
  routerKind?: string;
  routePath?: string;
  renderSource?: string;
  revalidateReason?: string;
};

type RequestErrorRequest = {
  path?: string;
  method?: string;
  headers?: Headers;
};

/**
 * Next.js 起動時に OpenTelemetry を登録し、初期化完了を structured log に残す。
 */
export async function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "oned-kadai",
  });

  logInfo("app_instrumentation_registered", {
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    nodeEnv: process.env.NODE_ENV,
  });
}

/**
 * App Router の未処理エラーを構造化して記録し、route や renderSource と紐付ける。
 */
export async function onRequestError(
  error: unknown,
  request: RequestErrorRequest,
  context: RequestErrorContext,
) {
  logError("next_request_error", {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "UnknownError",
    stack: error instanceof Error ? error.stack : undefined,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
  });
}
