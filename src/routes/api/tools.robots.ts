import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { parseRobotsTxt } from "@/server/lib/audit/discovery";
import { getOrigin } from "@/server/lib/audit/url-utils";
import { normalizeAndValidateStartUrl } from "@/server/lib/audit/url-policy";
import { asAppError } from "@/server/lib/errors";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";

// Free robots.txt & sitemap checker. Self-contained: fetches the target's
// robots.txt and sitemaps (SSRF-validated, abuse-guarded), no external API.
const schema = z.object({ domain: z.string().min(1).max(2048) });
const UA = "OpenSEO-Audit/1.0";
const MAX_SITEMAPS = 3;
const MAX_SITEMAP_BYTES = 2_000_000;

async function fetchText(url: string, max: number): Promise<string | null> {
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return null;
    return (await r.text()).slice(0, max);
  } catch {
    return null;
  }
}

async function checkSitemap(url: string) {
  const body = await fetchText(url, MAX_SITEMAP_BYTES);
  if (body === null) return { url, found: false, urlCount: 0, isIndex: false };
  return {
    url,
    found: true,
    urlCount: (body.match(/<loc>/g) ?? []).length,
    isIndex: body.includes("<sitemapindex"),
  };
}

async function handleRobots(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return json({ error: "Geçerli bir alan adı girin." }, 400);

  let origin: string;
  try {
    origin = getOrigin(await normalizeAndValidateStartUrl(parsed.data.domain));
  } catch (error) {
    if (asAppError(error)?.code === "CRAWL_TARGET_BLOCKED") {
      return json({ error: "Bu adres taranamaz." }, 400);
    }
    return json({ error: "Geçerli bir alan adı girin." }, 400);
  }

  const robotsText = await fetchText(`${origin}/robots.txt`, 20_000);
  const robots = parseRobotsTxt(origin, robotsText);
  const blocksAll = !robots.isAllowed(`${origin}/`);

  const sitemapUrls = [
    ...new Set([...robots.sitemapUrls, `${origin}/sitemap.xml`]),
  ].slice(0, MAX_SITEMAPS);
  const sitemaps = await Promise.all(sitemapUrls.map(checkSitemap));

  return json(
    {
      robotsFound: robotsText !== null,
      blocksAll,
      robotsPreview: robotsText ? robotsText.slice(0, 2000) : null,
      sitemaps,
    },
    200,
  );
}

export const Route = createFileRoute("/api/tools/robots")({
  server: {
    handlers: {
      POST: ({ request }) => handleRobots(request),
    },
  },
});
