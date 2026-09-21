import { createFileRoute } from "@tanstack/react-router";
import { asAppError } from "@/server/lib/errors";
import { runQuickAudit } from "@/server/lib/audit/quick-audit";
import {
  normalizeAndValidateStartUrl,
  resolveStartUrlRedirects,
} from "@/server/lib/audit/url-policy";
import { buildHealthReport } from "@/shared/health-report";
import { healthReportRequestSchema } from "@/types/schemas/health-report";

// Public, unauthenticated endpoint for the single-click SEO Health Report.
// Runs a bounded (≤50 page, time-limited) same-origin crawl reusing the audit
// engine's analysis layer, then returns a plain-Turkish health scorecard.
// No auth, no project, no billing, and no DataForSEO — it only fetches the
// target site's own pages. SSRF is enforced by normalizeAndValidateStartUrl.
async function handleHealthReport(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const parsed = healthReportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Lütfen geçerli bir alan adı girin." }, 400);
  }

  const { domain, email } = parsed.data;

  let startUrl: string;
  try {
    startUrl = await resolveStartUrlRedirects(
      await normalizeAndValidateStartUrl(domain),
    );
  } catch (error) {
    const appError = asAppError(error);
    if (appError?.code === "CRAWL_TARGET_BLOCKED") {
      return json(
        { error: "Bu adres taranamaz (özel/engelli bir hedef)." },
        400,
      );
    }
    return json(
      { error: "Geçerli bir alan adı girin (ör. example.com)." },
      400,
    );
  }

  // MVP: capture the optional email as a log line only; no email is sent.
  if (email) {
    console.info(
      `[health-report] lead email captured for ${startUrl}: ${email}`,
    );
  }

  try {
    const audit = await runQuickAudit(startUrl);
    const report = buildHealthReport({
      startUrl: audit.startUrl,
      origin: audit.origin,
      pagesCrawled: audit.pagesCrawled,
      truncated: audit.truncated,
      issues: audit.issues,
    });
    return json(report, 200);
  } catch (error) {
    console.error("[health-report] audit failed:", error);
    return json(
      { error: "Rapor oluşturulamadı. Lütfen birazdan tekrar deneyin." },
      500,
    );
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/health-report")({
  server: {
    handlers: {
      POST: ({ request }) => handleHealthReport(request),
    },
  },
});
