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
import { getIssueCopy, type IssueCopy } from "@/shared/health-report-copy";

export type { IssueSeverity } from "@/shared/audit-issues";

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

function gradeFor(score: number): string {
  if (score >= 90) return "Mükemmel";
  if (score >= 75) return "İyi";
  if (score >= 50) return "Orta";
  if (score >= 25) return "Zayıf";
  return "Kritik";
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

function buildActionPlan(
  aggregated: Map<string, AggregatedIssue>,
): ActionItem[] {
  if (aggregated.size === 0) {
    // A clean crawl still deserves forward-looking, evergreen guidance.
    return [
      {
        week: 1,
        task: "Ana sayfalarınızın başlık ve açıklamalarını güncel tutun.",
      },
      { week: 2, task: "Yeni içerik ekleyip iç bağlantılarla güçlendirin." },
      { week: 3, task: "Sayfa hızını ve mobil deneyimi düzenli olarak ölçün." },
      {
        week: 4,
        task: "Site haritanızı güncel tutup arama motorlarına gönderin.",
      },
    ];
  }

  const ordered = [...aggregated.values()];
  ordered.sort(
    (a, b) =>
      a.copy.week - b.copy.week ||
      ISSUE_SEVERITY_ORDER[a.severity] - ISSUE_SEVERITY_ORDER[b.severity] ||
      b.affectedPages.size - a.affectedPages.size,
  );
  return ordered.map((agg) => ({ week: agg.copy.week, task: agg.copy.task }));
}

function buildSummary(
  score: number,
  counts: HealthReport["issueCounts"],
  pagesScanned: number,
): string {
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
