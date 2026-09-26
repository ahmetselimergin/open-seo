import { describe, expect, it } from "vitest";
import { buildHealthReport } from "@/shared/health-report";
import { renderSharedReportHtml } from "@/server/features/health-report/sharedReportHtml";

// A report is stored with Turkish strings baked in; the share page must be able
// to re-render it in either language (localizeReport under the hood).
const report = buildHealthReport({
  startUrl: "https://example.com/",
  origin: "https://example.com",
  pagesCrawled: 10,
  truncated: false,
  issues: [{ issueType: "missing-title", pageUrl: "https://example.com/a" }],
});

describe("renderSharedReportHtml", () => {
  it("defaults to Turkish", () => {
    const html = renderSharedReportHtml({
      report,
      id: "abc",
      origin: "https://myseo.example",
    });
    expect(html).toContain('<html lang="tr">');
    expect(html).toContain("Genel sağlık skoru");
    expect(html).toContain("Öncelikli 3 sorun");
    // Turkish issue title from the baked report.
    expect(html).toContain("Başlık etiketi eksik sayfalar");
  });

  it("re-renders the stored report in English", () => {
    const html = renderSharedReportHtml({
      report,
      id: "abc",
      origin: "https://myseo.example",
      lang: "en",
    });
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("Overall health score");
    expect(html).toContain("Top 3 issues");
    expect(html).toContain("30-day action plan");
    // Issue content is localized, not the baked Turkish.
    expect(html).toContain("Pages missing a title tag");
    expect(html).not.toContain("Genel sağlık skoru");
  });

  it("lists affected example pages and links to the guide", () => {
    const html = renderSharedReportHtml({
      report,
      id: "abc",
      origin: "https://myseo.example",
    });
    expect(html).toContain("Etkilenen sayfalar");
    // The example affected page URL is shown.
    expect(html).toContain("example.com/a");
    // Each problem links to its guide anchor.
    expect(html).toContain('href="https://myseo.example/rehber#missing-title"');
  });

  it("always emits canonical + OpenGraph pointing at the given origin", () => {
    const html = renderSharedReportHtml({
      report,
      id: "xyz",
      origin: "https://myseo.example",
    });
    expect(html).toContain(
      '<link rel="canonical" href="https://myseo.example/report/xyz"/>',
    );
    expect(html).toContain(
      '<meta property="og:image" content="https://myseo.example/report/xyz/og.png"/>',
    );
  });
});
