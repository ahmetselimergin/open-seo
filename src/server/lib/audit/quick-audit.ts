/**
 * Lightweight, self-contained site audit for the public "SEO Health Report".
 *
 * Reuses the real audit engine's analysis layer — URL discovery, per-page
 * fetch+parse, and the page-level issue reporters — WITHOUT the heavyweight
 * production orchestration (Cloudflare Workflow, the AuditScratchpad Durable
 * Object, D1 persistence, auth, or billing). It runs synchronously inside a
 * single request against a bounded page budget and wall-clock deadline, so it
 * costs nothing beyond crawling the target's own pages (no DataForSEO).
 *
 * SSRF safety mirrors the production path: the start URL is validated with the
 * shared url-policy (blocked hosts + resolved-address checks) before this runs,
 * and every internal link enqueued from a crawled page is re-checked with
 * isCrawlableUrl.
 */
import { crawlPage } from "@/server/workflows/site-audit-workflow-helpers";
import { createCrawlThrottle } from "@/server/lib/audit/crawl-throttle";
import { discoverUrls } from "@/server/lib/audit/discovery";
import { runPageReporters } from "@/server/lib/audit/issues/page-reporters";
import type { DetectedIssue } from "@/server/lib/audit/issues/page-reporters";
import type { CrawledPageResult } from "@/server/lib/audit/types";
import {
  canonicalUrlKey,
  getOrigin,
  isSameOrigin,
  normalizeUrl,
} from "@/server/lib/audit/url-utils";
import { isCrawlableUrl } from "@/server/lib/audit/url-policy";
import { DEFAULT_AUDIT_PAGES } from "@/shared/audit-limits";

// Public MVP bounds. The page cap matches the free-tier audit default (50);
// the deadline keeps the endpoint responsive on slow or huge sites and the
// crawl returns whatever it gathered so far (`truncated: true`).
const MAX_PAGES = DEFAULT_AUDIT_PAGES;
const TIME_BUDGET_MS = 25_000;
const CONCURRENCY = 6;
// Production starts the origin throttle at 1 request/second and lets the
// durable workflow span minutes. A synchronous endpoint can't wait that long,
// so we pace faster while still leaving the 429 backoff intact (it ratchets
// the interval up from here whenever the site pushes back).
const INITIAL_INTERVAL_MS = 150;

interface FrontierEntry {
  url: string;
  depth: number | null;
  inSitemap: boolean;
}

export interface QuickAuditResult {
  startUrl: string;
  origin: string;
  pages: CrawledPageResult[];
  issues: DetectedIssue[];
  pagesCrawled: number;
  durationMs: number;
  /** True when the page budget or the time budget stopped the crawl early. */
  truncated: boolean;
}

/**
 * Crawl up to 50 same-origin pages starting from `startUrl` and return the
 * crawled pages plus every detected issue.
 *
 * `startUrl` MUST already be normalized and SSRF-validated by the caller
 * (see normalizeAndValidateStartUrl / resolveStartUrlRedirects).
 */
export async function runQuickAudit(
  startUrl: string,
  options: { maxPages?: number } = {},
): Promise<QuickAuditResult> {
  const maxPages = Math.min(options.maxPages ?? MAX_PAGES, MAX_PAGES);
  const startedAt = Date.now();
  const origin = getOrigin(startUrl);
  const deadline = startedAt + TIME_BUDGET_MS;
  const throttle = createCrawlThrottle(deadline, {
    intervalMs: INITIAL_INTERVAL_MS,
    nextRequestAt: 0,
    pausedUntil: 0,
    consecutiveRateLimits: 0,
    cooldownMs: 0,
  });

  // Seed with the start URL (depth 0) and any sitemap-discovered URLs. Sitemap
  // discovery is best-effort: a site without one just falls back to link-
  // following from the homepage.
  const seen = new Set<string>();
  const queue: FrontierEntry[] = [];
  const enqueue = (entry: FrontierEntry) => {
    const key = canonicalUrlKey(entry.url);
    if (seen.has(key)) return;
    seen.add(key);
    queue.push(entry);
  };

  enqueue({ url: startUrl, depth: 0, inSitemap: false });

  try {
    const discovered = await discoverUrls(origin, maxPages);
    for (const url of discovered.urls) {
      if (isSameOrigin(url, origin) && isCrawlableUrl(url)) {
        enqueue({ url, depth: null, inSitemap: true });
      }
    }
  } catch {
    // Discovery failure is non-fatal; link-following still covers the site.
  }

  const pages: CrawledPageResult[] = [];
  let active = 0;

  const worker = async (): Promise<void> => {
    while (pages.length < maxPages && Date.now() < deadline) {
      const next = queue.shift();
      if (!next) {
        // Nothing queued: if other workers are mid-fetch they may enqueue more,
        // so wait briefly; if the whole pool is idle the crawl is done.
        if (active === 0) return;
        await sleep(20);
        continue;
      }

      active += 1;
      let page: CrawledPageResult | null = null;
      try {
        page = await crawlPage(next.url, next.depth, next.inSitemap, throttle);
      } finally {
        active -= 1;
      }

      // Null means the shared cooldown stopped this URL's fetch (site is
      // rate-limiting hard); skip it rather than reporting a false error.
      if (!page) continue;
      if (pages.length >= maxPages) break;
      pages.push(page);

      // Follow internal links from real HTML pages to widen the frontier.
      if (page.isHtml && page.statusCode >= 200 && page.statusCode < 300) {
        const parentDepth = next.depth ?? 0;
        for (const link of page.links) {
          if (!link.isInternal) continue;
          const normalized = normalizeUrl(link.targetUrl, origin);
          if (!normalized) continue;
          if (!isSameOrigin(normalized, origin)) continue;
          if (!isCrawlableUrl(normalized)) continue;
          enqueue({
            url: normalized,
            depth: parentDepth + 1,
            inSitemap: false,
          });
        }
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const crawled = pages.slice(0, maxPages);
  const issues = [
    ...crawled.flatMap((page) => runPageReporters(page)),
    ...detectCrossPageIssues(crawled, origin),
  ];

  return {
    startUrl,
    origin,
    pages: crawled,
    issues,
    pagesCrawled: crawled.length,
    durationMs: Date.now() - startedAt,
    truncated: queue.length > 0 || Date.now() >= deadline,
  };
}

/**
 * A trimmed in-memory version of the production multipage checks (which read
 * from D1). Covers the highest-value cross-page issues for the MVP:
 * broken internal links, duplicate titles, and duplicate meta descriptions.
 */
function detectCrossPageIssues(
  pages: CrawledPageResult[],
  origin: string,
): DetectedIssue[] {
  const issues: DetectedIssue[] = [];

  // Status of every crawled URL, keyed canonically so link targets resolve to
  // the page we actually fetched (handles www/trailing-slash/param variants).
  const statusByKey = new Map<
    string,
    { statusCode: number; blocked: boolean }
  >();
  for (const page of pages) {
    statusByKey.set(canonicalUrlKey(page.url), {
      statusCode: page.statusCode,
      blocked: page.fetchClass === "blocked",
    });
  }

  // Broken internal links: a link whose crawled target returned 4xx/5xx.
  for (const page of pages) {
    if (!page.isHtml || page.statusCode >= 300) continue;
    const reported = new Set<string>();
    for (const link of page.links) {
      if (!link.isInternal) continue;
      const normalized = normalizeUrl(link.targetUrl, origin);
      if (!normalized) continue;
      const key = canonicalUrlKey(normalized);
      if (reported.has(key)) continue;
      const target = statusByKey.get(key);
      if (target && target.statusCode >= 400) {
        reported.add(key);
        issues.push({
          issueType: "broken-internal-link",
          pageId: page.id,
          pageUrl: page.url,
          dedupeKey: key,
          details: { targetUrl: normalized, statusCode: target.statusCode },
        });
      }
    }
  }

  issues.push(...findDuplicateMetadata(pages, "title"));
  issues.push(...findDuplicateMetadata(pages, "metaDescription"));

  return issues;
}

function findDuplicateMetadata(
  pages: CrawledPageResult[],
  field: "title" | "metaDescription",
): DetectedIssue[] {
  const issueType =
    field === "title" ? "duplicate-title" : "duplicate-meta-description";
  const groups = new Map<string, CrawledPageResult[]>();

  for (const page of pages) {
    if (!page.isHtml || page.statusCode >= 300 || !page.isIndexable) continue;
    const value = page[field]?.trim();
    if (!value) continue;
    const bucket = groups.get(value);
    if (bucket) bucket.push(page);
    else groups.set(value, [page]);
  }

  const issues: DetectedIssue[] = [];
  for (const [value, group] of groups) {
    if (group.length < 2) continue;
    for (const page of group) {
      issues.push({
        issueType,
        pageId: page.id,
        pageUrl: page.url,
        dedupeKey: value,
        details: { value, occurrences: group.length },
      });
    }
  }
  return issues;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
