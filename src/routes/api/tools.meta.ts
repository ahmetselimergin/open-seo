import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { crawlPage } from "@/server/workflows/site-audit-workflow-helpers";
import { createCrawlThrottle } from "@/server/lib/audit/crawl-throttle";
import {
  normalizeAndValidateStartUrl,
  resolveStartUrlRedirects,
} from "@/server/lib/audit/url-policy";
import { asAppError } from "@/server/lib/errors";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";

// Free single-page meta tag inspector. Fetches one URL and returns its on-page
// SEO metadata for a SERP + social preview. Reuses the audit engine's page
// analyzer; SSRF-validated; abuse-guarded.
const schema = z.object({ url: z.string().min(1).max(2048) });

async function handleMeta(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Geçerli bir adres girin." }, 400);

  let startUrl: string;
  try {
    startUrl = await resolveStartUrlRedirects(
      await normalizeAndValidateStartUrl(parsed.data.url),
    );
  } catch (error) {
    if (asAppError(error)?.code === "CRAWL_TARGET_BLOCKED") {
      return json({ error: "Bu adres taranamaz." }, 400);
    }
    return json(
      { error: "Geçerli bir adres girin (ör. example.com/sayfa)." },
      400,
    );
  }

  const throttle = createCrawlThrottle(Date.now() + 15_000, {
    intervalMs: 0,
    nextRequestAt: 0,
    pausedUntil: 0,
    consecutiveRateLimits: 0,
    cooldownMs: 0,
  });
  const page = await crawlPage(startUrl, 0, false, throttle);
  if (!page || page.statusCode === 0) {
    return json({ error: "Sayfa getirilemedi. Adresi kontrol edin." }, 502);
  }

  return json(
    {
      url: page.url,
      statusCode: page.statusCode,
      title: page.title,
      metaDescription: page.metaDescription,
      h1Count: page.h1Count,
      canonicalUrl: page.canonicalUrl ?? page.headerCanonicalUrl,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImage: page.ogImage,
      isIndexable: page.isIndexable,
    },
    200,
  );
}

export const Route = createFileRoute("/api/tools/meta")({
  server: {
    handlers: {
      POST: ({ request }) => handleMeta(request),
    },
  },
});
