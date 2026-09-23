import { createFileRoute } from "@tanstack/react-router";
import { waitUntil } from "cloudflare:workers";
import { asAppError } from "@/server/lib/errors";
import { runQuickAudit } from "@/server/lib/audit/quick-audit";
import {
  normalizeAndValidateStartUrl,
  resolveStartUrlRedirects,
} from "@/server/lib/audit/url-policy";
import { saveHealthReport } from "@/server/features/health-report/report-store";
import { sendHealthReportEmail } from "@/server/features/health-report/report-email";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";
import {
  captureHealthEvent,
  visitorId,
} from "@/server/features/health-report/analytics";
import { addReportToAccount } from "@/server/features/health-report/account-store";
import { buildHealthReport } from "@/shared/health-report";
import { healthReportRequestSchema } from "@/types/schemas/health-report";

// Public, unauthenticated endpoint for the single-click SEO health report.
// Runs a bounded same-origin crawl (≤50 pages, time-limited), stores the
// result for sharing, optionally emails it, and returns a plain-Turkish
// scorecard. No auth, no project, no billing, no DataForSEO. SSRF is enforced
// by normalizeAndValidateStartUrl; abuse is bounded by guardPublicPost.
async function handleHealthReport(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

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
    if (asAppError(error)?.code === "CRAWL_TARGET_BLOCKED") {
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

  try {
    const audit = await runQuickAudit(startUrl);
    const report = buildHealthReport({
      startUrl: audit.startUrl,
      origin: audit.origin,
      pagesCrawled: audit.pagesCrawled,
      truncated: audit.truncated,
      issues: audit.issues,
    });

    const trimmedEmail = email?.trim() || null;
    const id = await saveHealthReport(report, trimmedEmail);

    if (trimmedEmail) {
      const shareUrl = `${new URL(request.url).origin}/report/${id}`;
      waitUntil(
        sendHealthReportEmail({ email: trimmedEmail, report, shareUrl }),
      );
      waitUntil(
        addReportToAccount(trimmedEmail, {
          id,
          domain: report.domain,
          score: report.score,
          createdAt: new Date().toISOString(),
        }),
      );
    }

    waitUntil(
      visitorId(request).then((vid) =>
        captureHealthEvent(vid, "health_report_scanned", {
          domain: report.domain,
          score: report.score,
          pages_scanned: report.pagesScanned,
          has_email: Boolean(trimmedEmail),
        }),
      ),
    );

    return json({ ...report, id }, 200);
  } catch (error) {
    console.error("[health-report] audit failed:", error);
    return json(
      { error: "Rapor oluşturulamadı. Lütfen birazdan tekrar deneyin." },
      500,
    );
  }
}

export const Route = createFileRoute("/api/health-report")({
  server: {
    handlers: {
      POST: ({ request }) => handleHealthReport(request),
    },
  },
});
