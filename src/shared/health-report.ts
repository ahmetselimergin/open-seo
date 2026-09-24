/**
 * Turns a raw quick-audit result into a user-facing "SEO Health Report":
 * a 0–100 score, the top problems in plain Turkish, and a 30-day action plan.
 *
 * Pure and dependency-light so it can be unit-tested and run on any surface.
 * Severity comes from the shared audit issue registry; the plain-Turkish copy
 * and the action-plan scheduling live in health-report-copy.ts.
 */
import {
  getIssueDescriptor,
  ISSUE_SEVERITY_ORDER,
  type IssueSeverity,
} from "@/shared/audit-issues";
import {
  getIssueCopy,
  type IssueCopy,
  type ReportLang,
} from "@/shared/health-report-copy";

export type { IssueSeverity } from "@/shared/audit-issues";
export type { ReportLang } from "@/shared/health-report-copy";

/** Minimal issue shape the report needs (a subset of DetectedIssue). */
export interface ReportIssueInput {
  issueType: string;
  pageUrl: string;
}

export interface HealthReportInput {
  startUrl: string;
  origin: string;
  pagesCrawled: number;
  truncated: boolean;
  issues: ReportIssueInput[];
}

export interface TopProblem {
  issueType: string;
  title: string;
  severity: IssueSeverity;
  affectedPages: number;
  whatItMeans: string;
  howToFix: string;
}

export interface ActionItem {
  week: number;
  task: string;
  /**
   * Source issue type, so the task can be re-localized at render time. `null`
   * for the evergreen clean-crawl items. Optional for backward compatibility
   * with reports stored before this field existed.
   */
  issueType?: string | null;
}

export interface HealthReport {
  domain: string;
  scannedUrl: string;
  pagesScanned: number;
  truncated: boolean;
  score: number;
  grade: string;
  summary: string;
  issueCounts: {
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  topProblems: TopProblem[];
  actionPlan: ActionItem[];
}

/** One issue type's aggregated impact, resolved once from the registries. */
interface AggregatedIssue {
  issueType: string;
  severity: IssueSeverity;
  copy: IssueCopy;
  affectedPages: Set<string>;
}

// How many points each affected page costs, by severity. Penalties are capped
// per issue type so one widespread issue can't zero the whole score on its own,
// and the total is clamped to [0, 100].
const SEVERITY_POINTS: Record<IssueSeverity, number> = {
  critical: 12,
  warning: 4,
  info: 1,
};
const SEVERITY_CAP: Record<IssueSeverity, number> = {
  critical: 30,
  warning: 15,
  info: 6,
};

const GRADES: Record<ReportLang, [string, string, string, string, string]> = {
  tr: ["Mükemmel", "İyi", "Orta", "Zayıf", "Kritik"],
  en: ["Excellent", "Good", "Fair", "Poor", "Critical"],
};

function gradeFor(score: number, lang: ReportLang = "tr"): string {
  const g = GRADES[lang];
  if (score >= 90) return g[0];
  if (score >= 75) return g[1];
  if (score >= 50) return g[2];
  if (score >= 25) return g[3];
  return g[4];
}

/** Build the report from a quick-audit result. */
export function buildHealthReport(input: HealthReportInput): HealthReport {
  const domain = safeHostname(input.origin) ?? input.origin;
  const aggregated = aggregateIssues(input.issues);

  const issueCounts = { critical: 0, warning: 0, info: 0, total: 0 };
  let penalty = 0;
  for (const agg of aggregated.values()) {
    const affected = agg.affectedPages.size;
    issueCounts[agg.severity] += affected;
    issueCounts.total += affected;
    penalty += Math.min(
      affected * SEVERITY_POINTS[agg.severity],
      SEVERITY_CAP[agg.severity],
    );
  }

  const score =
    input.pagesCrawled === 0 ? 0 : clamp(Math.round(100 - penalty), 0, 100);

  return {
    domain,
    scannedUrl: input.startUrl,
    pagesScanned: input.pagesCrawled,
    truncated: input.truncated,
    score,
    grade: gradeFor(score),
    summary: buildSummary(score, issueCounts, input.pagesCrawled),
    issueCounts,
    topProblems: buildTopProblems(aggregated),
    actionPlan: buildActionPlan(aggregated),
  };
}

/**
 * Group issues by type, counting distinct affected pages per type. Issue types
 * absent from the shared registry (or without Turkish copy) are dropped here,
 * so the rest of the pipeline never needs a type assertion.
 */
function aggregateIssues(
  issues: ReportIssueInput[],
): Map<string, AggregatedIssue> {
  const byType = new Map<string, AggregatedIssue>();
  for (const issue of issues) {
    const descriptor = getIssueDescriptor(issue.issueType);
    const copy = getIssueCopy(issue.issueType);
    if (!descriptor || !copy) continue;

    let agg = byType.get(issue.issueType);
    if (!agg) {
      agg = {
        issueType: issue.issueType,
        severity: descriptor.severity,
        copy,
        affectedPages: new Set<string>(),
      };
      byType.set(issue.issueType, agg);
    }
    agg.affectedPages.add(issue.pageUrl);
  }
  return byType;
}

function buildTopProblems(
  aggregated: Map<string, AggregatedIssue>,
): TopProblem[] {
  const ranked = [...aggregated.values()];
  ranked.sort(
    (a, b) =>
      ISSUE_SEVERITY_ORDER[a.severity] - ISSUE_SEVERITY_ORDER[b.severity] ||
      b.affectedPages.size - a.affectedPages.size,
  );
  return ranked.slice(0, 3).map((agg) => ({
    issueType: agg.issueType,
    title: agg.copy.title,
    severity: agg.severity,
    affectedPages: agg.affectedPages.size,
    whatItMeans: agg.copy.whatItMeans,
    howToFix: agg.copy.howToFix,
  }));
}

// Evergreen guidance for a clean crawl, keyed by week. `issueType: null` marks
// these so localizeReport re-derives them from EVERGREEN_PLAN rather than a copy
// table lookup.
const EVERGREEN_PLAN: Record<ReportLang, Record<number, string>> = {
  tr: {
    1: "Ana sayfalarınızın başlık ve açıklamalarını güncel tutun.",
    2: "Yeni içerik ekleyip iç bağlantılarla güçlendirin.",
    3: "Sayfa hızını ve mobil deneyimi düzenli olarak ölçün.",
    4: "Site haritanızı güncel tutup arama motorlarına gönderin.",
  },
  en: {
    1: "Keep your main pages' titles and descriptions up to date.",
    2: "Add new content and strengthen it with internal links.",
    3: "Measure page speed and mobile experience regularly.",
    4: "Keep your sitemap current and submit it to search engines.",
  },
};

function evergreenPlan(lang: ReportLang = "tr"): ActionItem[] {
  return [1, 2, 3, 4].map((week) => ({
    week,
    task: EVERGREEN_PLAN[lang][week],
    issueType: null,
  }));
}

function buildActionPlan(
  aggregated: Map<string, AggregatedIssue>,
): ActionItem[] {
  if (aggregated.size === 0) return evergreenPlan("tr");

  const ordered = [...aggregated.values()];
  ordered.sort(
    (a, b) =>
      a.copy.week - b.copy.week ||
      ISSUE_SEVERITY_ORDER[a.severity] - ISSUE_SEVERITY_ORDER[b.severity] ||
      b.affectedPages.size - a.affectedPages.size,
  );
  return ordered.map((agg) => ({
    week: agg.copy.week,
    task: agg.copy.task,
    issueType: agg.issueType,
  }));
}

function buildSummary(
  score: number,
  counts: HealthReport["issueCounts"],
  pagesScanned: number,
  lang: ReportLang = "tr",
): string {
  if (lang === "en") return buildSummaryEn(score, counts, pagesScanned);
  if (pagesScanned === 0) {
    return "Siteniz taranamadı. Adresi kontrol edip tekrar deneyin.";
  }
  if (counts.total === 0) {
    return `Harika! ${pagesScanned} sayfa tarandı ve önemli bir sorun bulunamadı.`;
  }
  const parts: string[] = [];
  if (counts.critical > 0) parts.push(`${counts.critical} acil`);
  if (counts.warning > 0) parts.push(`${counts.warning} orta`);
  if (counts.info > 0) parts.push(`${counts.info} küçük`);
  const breakdown = parts.join(", ");
  if (score >= 75) {
    return `Siteniz iyi durumda. ${pagesScanned} sayfada ${breakdown} iyileştirme fırsatı bulduk.`;
  }
  if (score >= 50) {
    return `Sitenizde giderilecek noktalar var. ${pagesScanned} sayfada ${breakdown} sorun tespit ettik.`;
  }
  return `Sitenizin acil ilgiye ihtiyacı var. ${pagesScanned} sayfada ${breakdown} sorun tespit ettik.`;
}

function buildSummaryEn(
  score: number,
  counts: HealthReport["issueCounts"],
  pagesScanned: number,
): string {
  if (pagesScanned === 0) {
    return "We couldn't scan your site. Check the address and try again.";
  }
  if (counts.total === 0) {
    return `Great! We scanned ${pagesScanned} pages and found no significant issues.`;
  }
  const parts: string[] = [];
  if (counts.critical > 0) parts.push(`${counts.critical} urgent`);
  if (counts.warning > 0) parts.push(`${counts.warning} moderate`);
  if (counts.info > 0) parts.push(`${counts.info} minor`);
  const breakdown = parts.join(", ");
  if (score >= 75) {
    return `Your site is in good shape. Across ${pagesScanned} pages we found ${breakdown} improvement opportunities.`;
  }
  if (score >= 50) {
    return `Your site has things to fix. Across ${pagesScanned} pages we found ${breakdown} issues.`;
  }
  return `Your site needs urgent attention. Across ${pagesScanned} pages we found ${breakdown} issues.`;
}

/**
 * Re-derive a stored report's user-facing prose in the requested language from
 * its language-neutral fields (score, counts, issueType, week). Reports stored
 * before an issue type had `issueType`/EN copy keep their baked-in strings, so
 * old reports still render.
 */
export function localizeReport(
  report: HealthReport,
  lang: ReportLang,
): HealthReport {
  return {
    ...report,
    grade: gradeFor(report.score, lang),
    summary: buildSummary(
      report.score,
      report.issueCounts,
      report.pagesScanned,
      lang,
    ),
    topProblems: report.topProblems.map((problem) => {
      const copy = getIssueCopy(problem.issueType, lang);
      if (!copy) return problem;
      return {
        ...problem,
        title: copy.title,
        whatItMeans: copy.whatItMeans,
        howToFix: copy.howToFix,
      };
    }),
    actionPlan: report.actionPlan.map((item) => {
      if (item.issueType === null) {
        return { ...item, task: EVERGREEN_PLAN[lang][item.week] ?? item.task };
      }
      if (!item.issueType) return item; // legacy report without issueType
      const copy = getIssueCopy(item.issueType, lang);
      return copy ? { ...item, task: copy.task } : item;
    }),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
