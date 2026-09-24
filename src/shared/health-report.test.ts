import { describe, expect, it } from "vitest";
import {
  buildHealthReport,
  localizeReport,
  type HealthReportInput,
} from "@/shared/health-report";

function baseInput(
  overrides: Partial<HealthReportInput> = {},
): HealthReportInput {
  return {
    startUrl: "https://example.com/",
    origin: "https://example.com",
    pagesCrawled: 10,
    truncated: false,
    issues: [],
    ...overrides,
  };
}

describe("buildHealthReport", () => {
  it("gives a perfect score and evergreen plan for a clean crawl", () => {
    const report = buildHealthReport(baseInput());
    expect(report.score).toBe(100);
    expect(report.grade).toBe("Mükemmel");
    expect(report.issueCounts.total).toBe(0);
    expect(report.topProblems).toHaveLength(0);
    // A clean site still gets a 4-week evergreen plan.
    expect(report.actionPlan.length).toBeGreaterThan(0);
    expect(new Set(report.actionPlan.map((i) => i.week))).toEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  it("scores 0 and reports no crawl when nothing could be crawled", () => {
    const report = buildHealthReport(baseInput({ pagesCrawled: 0 }));
    expect(report.score).toBe(0);
    expect(report.summary).toContain("taranamadı");
  });

  it("counts distinct affected pages per issue type", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "missing-title", pageUrl: "https://example.com/a" },
          { issueType: "missing-title", pageUrl: "https://example.com/b" },
          // Duplicate page for the same type must not be double-counted.
          { issueType: "missing-title", pageUrl: "https://example.com/a" },
          { issueType: "slow-response", pageUrl: "https://example.com/a" },
        ],
      }),
    );
    expect(report.issueCounts.critical).toBe(2); // missing-title x2 pages
    expect(report.issueCounts.info).toBe(1); // slow-response x1 page
    expect(report.issueCounts.total).toBe(3);
  });

  it("ignores unknown issue types", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "not-a-real-issue", pageUrl: "https://example.com/a" },
        ],
      }),
    );
    expect(report.issueCounts.total).toBe(0);
    expect(report.score).toBe(100);
  });

  it("ranks the top 3 problems by severity then reach", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "title-too-long", pageUrl: "https://example.com/1" }, // info
          { issueType: "missing-h1", pageUrl: "https://example.com/2" }, // warning
          { issueType: "missing-title", pageUrl: "https://example.com/3" }, // critical
          { issueType: "server-error", pageUrl: "https://example.com/4" }, // critical
          { issueType: "server-error", pageUrl: "https://example.com/5" }, // critical (2 pages)
        ],
      }),
    );
    expect(report.topProblems).toHaveLength(3);
    // Both criticals come first; server-error (2 pages) outranks missing-title (1).
    expect(report.topProblems[0].issueType).toBe("server-error");
    expect(report.topProblems[0].severity).toBe("critical");
    expect(report.topProblems[1].issueType).toBe("missing-title");
    expect(report.topProblems[2].severity).toBe("warning");
    // Copy is present and Turkish.
    expect(report.topProblems[0].title.length).toBeGreaterThan(0);
    expect(report.topProblems[0].howToFix.length).toBeGreaterThan(0);
  });

  it("caps the penalty per severity so score never underflows", () => {
    // 40 pages each with a critical + a warning + an info issue.
    const issues = Array.from(
      { length: 40 },
      (_, i) => `https://example.com/${i}`,
    ).flatMap((pageUrl) => [
      { issueType: "missing-title", pageUrl }, // critical
      { issueType: "missing-h1", pageUrl }, // warning
      { issueType: "title-too-long", pageUrl }, // info
    ]);
    const report = buildHealthReport(baseInput({ pagesCrawled: 40, issues }));
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    // critical cap 30 + warning cap 15 + info cap 6 = 51 penalty -> score 49.
    expect(report.score).toBe(49);
    expect(report.grade).toBe("Zayıf");
  });

  it("derives the domain from the origin and drops www", () => {
    const report = buildHealthReport(
      baseInput({ origin: "https://www.example.com" }),
    );
    expect(report.domain).toBe("example.com");
  });

  it("stores the source issue type on action-plan items", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "missing-title", pageUrl: "https://example.com/a" },
        ],
      }),
    );
    expect(report.actionPlan[0].issueType).toBe("missing-title");
    // A clean crawl's evergreen items are marked issueType: null.
    const clean = buildHealthReport(baseInput());
    expect(clean.actionPlan.every((i) => i.issueType === null)).toBe(true);
  });

  it("re-localizes a stored report into English", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "missing-title", pageUrl: "https://example.com/a" },
        ],
      }),
    );
    const en = localizeReport(report, "en");
    // 1 critical page -> 12 penalty -> score 88 -> "Good" band.
    expect(en.grade).toBe("Good");
    expect(en.summary).not.toBe(report.summary);
    expect(en.summary).toMatch(/pages/);
    expect(en.topProblems[0].title).not.toBe(report.topProblems[0].title);
    expect(en.actionPlan[0].task).not.toBe(report.actionPlan[0].task);
    // Language-neutral numbers are untouched.
    expect(en.score).toBe(report.score);
    expect(en.issueCounts).toEqual(report.issueCounts);
  });

  it("localizes the evergreen plan for a clean crawl", () => {
    const en = localizeReport(buildHealthReport(baseInput()), "en");
    expect(en.grade).toBe("Excellent");
    expect(en.actionPlan[0].task).toMatch(/titles and descriptions/);
  });

  it("orders the action plan by week", () => {
    const report = buildHealthReport(
      baseInput({
        issues: [
          { issueType: "images-missing-alt", pageUrl: "https://example.com/a" }, // week 4
          { issueType: "missing-title", pageUrl: "https://example.com/b" }, // week 1
        ],
      }),
    );
    const weeks = report.actionPlan.map((i) => i.week);
    const sorted = [...weeks];
    sorted.sort((a, b) => a - b);
    expect(weeks).toEqual(sorted);
    expect(report.actionPlan[0].week).toBe(1);
  });
});
