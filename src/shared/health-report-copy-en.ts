/**
 * Plain-English copy for each audit issue type, mirroring the Turkish table in
 * health-report-copy.ts key-for-key. Kept in its own file so neither language
 * table blows past the max-lines limit.
 *
 * The `week` (action-plan slot) is language-neutral and lives only in the
 * Turkish table; getIssueCopy merges it in, so entries here omit it.
 */
import type { AuditIssueType } from "@/shared/audit-issues";
import type { IssueCopy } from "@/shared/health-report-copy";

export const EN_ISSUE_COPY: Record<AuditIssueType, Omit<IssueCopy, "week">> = {
  "blocked-page": {
    title: "Page couldn't be crawled (access blocked)",
    whatItMeans:
      "The site showed our crawler a security/bot challenge. Search engines like Google may hit the same wall and fail to see the page.",
    howToFix:
      "Allow search-engine and audit bots through your security settings (e.g. Cloudflare bot protection), then re-run the report.",
    task: "Verify that search engines can reach pages blocked by a bot/security challenge.",
  },
  "rate-limited-page": {
    title: "Page returned a too-many-requests warning",
    whatItMeans:
      "The server answered with a 'too many requests' response and the page couldn't be crawled.",
    howToFix:
      "Review your server's request limits or raise them for search and audit bots.",
    task: "Loosen server request (rate) limits for crawlers.",
  },
  "crawl-rate-limited": {
    title: "Crawl stopped early (rate limit)",
    whatItMeans:
      "The site asked us to slow down, so the crawl couldn't finish and the report may be incomplete.",
    howToFix:
      "Try again once the site's rate limit has reset, or allow the bots through.",
    task: "Re-run the crawl that stalled on a rate limit after fixing the limit settings.",
  },
  "server-error": {
    title: "Pages returning a server error (5xx)",
    whatItMeans:
      "Some pages throw a server error when opened. Google crawls such pages less and may eventually drop them.",
    howToFix:
      "Check server logs and fix the cause. If the page is gone, return 404/410 or redirect it to a suitable page.",
    task: "Fix pages returning a server error (5xx) or redirect them properly.",
  },
  "broken-internal-link": {
    title: "Broken internal links",
    whatItMeans:
      "Some of your pages link to pages on your site that no longer work. This dead-ends both visitors and Google.",
    howToFix:
      "Update the link to the correct, working address or remove it. If the page moved, link straight to the new address.",
    task: "Fix broken internal links with the correct addresses or remove them.",
  },
  "missing-title": {
    title: "Pages missing a title tag",
    whatItMeans:
      "Some pages have no title tag. The title is the main text shown in search results; without it Google writes its own (usually worse) one.",
    howToFix:
      "Add a unique 50–60 character title describing the topic to every page.",
    task: "Add a unique, descriptive title to every page that lacks one.",
  },
  "broken-page": {
    title: "Pages not found (4xx)",
    whatItMeans:
      "Some addresses don't open (e.g. 404). If they're still linked, both visitors and search engines are sent nowhere.",
    howToFix:
      "Bring the page back if it should exist. If it's retired, remove it from the sitemap and internal links and 301-redirect to the closest page.",
    task: "Restore not-found (404) pages or redirect them to suitable pages.",
  },
  "duplicate-title": {
    title: "Pages sharing the same title",
    whatItMeans:
      "Several pages use the same title. Google tells pages apart by their titles; identical titles make them compete with each other.",
    howToFix:
      "Write a unique title describing each page's content. On template pages, add the distinguishing detail (name, category, location) to the title.",
    task: "Write unique titles for pages that share the same one.",
  },
  "duplicate-meta-description": {
    title: "Pages sharing the same description",
    whatItMeans:
      "Several pages use the same meta description; the same snippet shows in search results and the pages can't be told apart.",
    howToFix:
      "Write a unique description for each page or remove the duplicate (Google generates its own snippet from the text).",
    task: "Make duplicated meta descriptions unique.",
  },
  "duplicate-content": {
    title: "Pages with identical content",
    whatItMeans:
      "Two or more addresses show exactly the same content. Google picks one and ignores the rest, splitting their value.",
    howToFix:
      "Choose one main address, add rel=canonical on the others, and 301-redirect where possible.",
    task: "Consolidate addresses showing identical content under one main address.",
  },
  "missing-meta-description": {
    title: "Pages missing a meta description",
    whatItMeans:
      "Some pages have no meta description. Google generates a snippet from the text, which is usually less compelling and lowers click-through.",
    howToFix:
      "Add a 70–160 character description that summarizes the page and invites a click to every page.",
    task: "Add click-worthy meta descriptions to pages missing one.",
  },
  "missing-h1": {
    title: "Pages missing a main heading (H1)",
    whatItMeans:
      "Some pages have no main heading (H1). The H1 tells both users and Google what the page is about.",
    howToFix: "Add a single H1 stating the main topic to every page.",
    task: "Add one clear H1 to pages that lack a main heading.",
  },
  "multiple-h1": {
    title: "Multiple main headings (H1)",
    whatItMeans:
      "Some pages have more than one H1; this weakens the main-topic signal and is usually a template bug.",
    howToFix:
      "Keep a single H1 for the page's main heading and turn the rest into H2/H3.",
    task: "Keep a single main heading on pages with multiple H1s.",
  },
  "redirect-chain": {
    title: "Redirect chains",
    whatItMeans:
      "Reaching the final page takes several redirects in a row. This slows things down and wastes crawl budget.",
    howToFix:
      "Point the first address (and internal links) straight at the final target, leaving at most one redirect.",
    task: "Reduce redirect chains to a single step.",
  },
  "redirect-loop": {
    title: "Infinite redirect loop",
    whatItMeans:
      "An address loops back on itself; the page never opens and crawlers error out and give up.",
    howToFix:
      "Trace this address's redirect rules and break the loop; the chain must end on a real 200 page.",
    task: "Break infinite redirect loops.",
  },
  "canonical-conflict": {
    title: "Conflicting canonical signals",
    whatItMeans:
      "The page declares different canonical addresses in the HTML and the HTTP header. When signals conflict, Google ignores both and picks its own.",
    howToFix:
      "Choose one canonical address and declare it in a single place (usually the HTML head).",
    task: "Make conflicting canonical declarations single and consistent.",
  },
  "thin-content": {
    title: "Pages with very little content",
    whatItMeans:
      "Some pages have very little visible text. Thin pages rarely rank and can drag down the site's overall quality.",
    howToFix:
      "Expand the page with genuinely useful content, noindex it, or merge it into a stronger page.",
    task: "Strengthen or merge thin-content pages.",
  },
  "images-missing-alt": {
    title: "Images missing alt text",
    whatItMeans:
      "Some images have no alt text. Alt text is needed for accessibility and is the main way Google understands an image.",
    howToFix:
      'Add descriptive alt text to meaningful images; use empty alt ("") only for decorative ones.',
    task: "Add descriptive alt text to images missing it.",
  },
  "orphan-page": {
    title: "Unlinked (orphan) pages",
    whatItMeans:
      "No page links to these pages; they're only reachable via the sitemap. Such pages are crawled little and gain little value.",
    howToFix:
      "Link to these pages from related pages (menu, related content, category).",
    task: "Add internal links to orphan pages from related pages.",
  },
  "no-outgoing-links": {
    title: "Pages with no outgoing links",
    whatItMeans:
      "Some pages have no links at all, like a dead end. The crawler has nowhere to go and users have to hit back.",
    howToFix:
      "Add links to related pages, the parent category, or the homepage.",
    task: "Add relevant links to pages that have no outgoing links.",
  },
  "title-too-long": {
    title: "Pages with an overly long title",
    whatItMeans:
      "The title exceeds ~60 characters; it gets cut off in search results.",
    howToFix:
      "Trim the title to 50–60 characters and move the most important words to the front.",
    task: "Shorten overly long titles to 50–60 characters.",
  },
  "title-too-short": {
    title: "Pages with an overly short title",
    whatItMeans:
      "The title is under ~10 characters; usually too little to describe the page and attract clicks.",
    howToFix:
      "Expand the title into a 30–60 character phrase describing what the page offers.",
    task: "Make overly short titles more descriptive.",
  },
  "meta-description-too-long": {
    title: "Pages with an overly long meta description",
    whatItMeans:
      "The description exceeds ~160 characters; the snippet gets cut off in search results.",
    howToFix:
      "Trim the description to 70–160 characters while keeping the main message and call to action.",
    task: "Shorten overly long meta descriptions to 70–160 characters.",
  },
  "meta-description-too-short": {
    title: "Pages with an overly short meta description",
    whatItMeans:
      "The description is under ~70 characters; it wastes the space in the search result.",
    howToFix:
      "Expand the description to 70–160 characters summarizing the page.",
    task: "Expand overly short meta descriptions.",
  },
  "heading-order-skip": {
    title: "Pages with skipped heading levels",
    whatItMeans:
      "Heading levels skip (e.g. an H4 straight after an H2). This weakens the document's structure.",
    howToFix:
      "Step heading levels one at a time without skipping (H1 → H2 → H3).",
    task: "Put heading levels in the correct order (H1→H2→H3).",
  },
  "slow-response": {
    title: "Slow-loading pages",
    whatItMeans:
      "Some pages take over 1.5 seconds to respond. A slow response worsens every speed metric and lowers crawl rate.",
    howToFix:
      "Review server/database time and caching; serving cached (static) HTML usually fixes it.",
    task: "Cut server response time on slow pages with caching/optimization.",
  },
  "noindex-page": {
    title: "Non-indexed (noindex) pages",
    whatItMeans:
      "Some pages ask Google not to index them. This is often intentional; it's just informational.",
    howToFix:
      "If the page should rank, remove the noindex rule. If it's intentional (admin, thank-you pages), no action is needed.",
    task: "Check whether any page is set to noindex by mistake.",
  },
  "canonicalized-page": {
    title: "Pages pointing to another address (canonical)",
    whatItMeans:
      "Some pages tell Google 'index that address, not me'. Fine if intentional; a problem if this page should rank.",
    howToFix:
      "If this page should rank on its own, set its canonical to itself; otherwise leave it.",
    task: "Check pages whose canonical wrongly points to another address.",
  },
  "deep-page": {
    title: "Pages buried deep in the site structure",
    whatItMeans:
      "Some pages are 5+ clicks from the homepage. Deep pages are crawled less and gain less value.",
    howToFix:
      "Link to these pages from higher-level pages (category, menu) to shorten the path.",
    task: "Link to deep but important pages from higher-level pages.",
  },
};
