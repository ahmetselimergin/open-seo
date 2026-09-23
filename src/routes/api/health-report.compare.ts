import { createFileRoute } from "@tanstack/react-router";
import { waitUntil } from "cloudflare:workers";
import { z } from "zod";
import { runQuickAudit } from "@/server/lib/audit/quick-audit";
import {
  normalizeAndValidateStartUrl,
  resolveStartUrlRedirects,
} from "@/server/lib/audit/url-policy";
import { asAppError } from "@/server/lib/errors";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";
import {
  captureHealthEvent,
  visitorId,
} from "@/server/features/health-report/analytics";
import { buildHealthReport, type HealthReport } from "@/shared/health-report";

// Compare two sites side by side. Both crawls run in parallel with a smaller
// page budget each so the request stays responsive and within subrequest limits.
const COMPARE_MAX_PAGES = 30;

const schema = z.object({
  domain: z.string().min(1).max(2048),
  competitor: z.string().min(1).max(2048),
});

async function auditOne(rawDomain: string): Promise<HealthReport> {
  const startUrl = await resolveStartUrlRedirects(
    await normalizeAndValidateStartUrl(rawDomain),
  );
  const audit = await runQuickAudit(startUrl, { maxPages: COMPARE_MAX_PAGES });
  return buildHealthReport({
    startUrl: audit.startUrl,
    origin: audit.origin,
    pagesCrawled: audit.pagesCrawled,
    truncated: audit.truncated,
    issues: audit.issues,
  });
}

async function handleCompare(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "İki geçerli alan adı girin." }, 400);
  }

  try {
    const [a, b] = await Promise.all([
      auditOne(parsed.data.domain),
      auditOne(parsed.data.competitor),
    ]);

    waitUntil(
      visitorId(request).then((vid) =>
        captureHealthEvent(vid, "health_report_compared", {
          domain: a.domain,
          competitor: b.domain,
          score_a: a.score,
          score_b: b.score,
        }),
      ),
    );

    return json({ a, b }, 200);
  } catch (error) {
    if (asAppError(error)?.code === "CRAWL_TARGET_BLOCKED") {
      return json({ error: "Bu adreslerden biri taranamaz." }, 400);
    }
    console.error("[health-report] compare failed:", error);
    return json(
      { error: "Karşılaştırma yapılamadı. Lütfen adresleri kontrol edin." },
      400,
    );
  }
}

export const Route = createFileRoute("/api/health-report/compare")({
  server: {
    handlers: {
      POST: ({ request }) => handleCompare(request),
    },
  },
});
