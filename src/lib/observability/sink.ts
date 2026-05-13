export type StructuredLogPayload = Record<string, unknown> & {
  timestamp: string;
  level: string;
  event: string;
};

/**
 * 任意の webhook にログを非同期転送する。失敗してもリクエスト処理は止めない。
 */
export function sendStructuredLog(payload: StructuredLogPayload) {
  if (typeof window !== "undefined") {
    return;
  }

  const webhookUrl = process.env.OBSERVABILITY_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    const url = new URL(webhookUrl);
    void fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: process.env.OBSERVABILITY_SERVICE_NAME ?? "oned-kadai",
        environment: process.env.OBSERVABILITY_ENV ?? process.env.NODE_ENV,
        ...payload,
      }),
    }).catch((error: unknown) => {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          event: "observability_webhook_failed",
          message: error instanceof Error ? error.message : String(error),
        }),
      );
    });
  } catch (error) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        event: "observability_webhook_invalid_url",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
