import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/lib/audit/ids";

/**
 * Lightweight, privacy-preserving product analytics for the public funnel.
 *
 * Server-side (no cookies, no client SDK, so no consent banner needed) and
 * no-ops when PostHog isn't configured. The distinct id is a per-day hash of
 * the visitor IP, so a visitor's events link within a day without storing raw
 * IPs. Fire-and-forget: never blocks or fails a request.
 */
function posthogConfig(): { key: string; host: string } | null {
  const key: unknown = Reflect.get(env, "POSTHOG_PUBLIC_KEY");
  const host: unknown = Reflect.get(env, "POSTHOG_HOST");
  if (typeof key !== "string" || !key.trim()) return null;
  if (typeof host !== "string" || !host.trim()) return null;
  return { key: key.trim(), host: host.trim().replace(/\/$/, "") };
}

/** Per-day hashed visitor id (not an anonymity guarantee, just no raw IPs). */
export async function visitorId(request: Request): Promise<string> {
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const day = new Date().toISOString().slice(0, 10);
  const digest = await sha256Hex(`${day}:${ip}`);
  return `hr-${digest.slice(0, 24)}`;
}

export async function captureHealthEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const cfg = posthogConfig();
  if (!cfg) return;
  try {
    await fetch(`${cfg.host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: cfg.key,
        event,
        distinct_id: distinctId,
        properties,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.error("[health-report] analytics capture failed:", error);
  }
}
