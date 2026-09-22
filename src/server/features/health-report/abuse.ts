import { env } from "cloudflare:workers";

interface AbuseBindings {
  HEALTH_REPORT_RATE_LIMIT?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
}

export function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Shared same-origin + per-IP rate-limit guard for the public health-report
 * POST endpoints. Returns a Response to short-circuit, or null to proceed.
 */
export async function guardPublicPost(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    return jsonResponse({ error: "Bu istek reddedildi." }, 403);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const limiter = (env as unknown as AbuseBindings).HEALTH_REPORT_RATE_LIMIT;
  if (limiter) {
    const ip = request.headers.get("cf-connecting-ip") ?? "local";
    try {
      const { success } = await limiter.limit({ key: `health-report:${ip}` });
      if (!success) {
        return jsonResponse(
          {
            error: "Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin.",
          },
          429,
        );
      }
    } catch {
      // A limiter failure must not take the endpoint down; fall through.
    }
  }
  return null;
}
