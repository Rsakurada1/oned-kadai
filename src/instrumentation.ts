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

export async function register() {
  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME ?? "oned-kadai",
  });

  logInfo("app_instrumentation_registered", {
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    nodeEnv: process.env.NODE_ENV,
  });
}

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
