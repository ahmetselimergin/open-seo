import { describe, expect, it } from "vitest";
import { AUDIT_ISSUE_TYPES } from "@/shared/audit-issues";
import { getIssueCopy } from "@/shared/health-report-copy";
import { renderGuideHtml } from "@/server/features/health-report/guideHtml";

describe("renderGuideHtml", () => {
  const html = renderGuideHtml("https://myseo.example");

  it("is a full HTML document with canonical + meta", () => {
    expect(html).toContain("<!doctype html>");
    expect(html).toContain(
      '<link rel="canonical" href="https://myseo.example/rehber"/>',
    );
    expect(html).toContain("<title>");
  });

  it("groups by all three severities", () => {
    expect(html).toContain("Acil sorunlar");
    expect(html).toContain("Orta öncelikli sorunlar");
    expect(html).toContain("Küçük iyileştirmeler");
  });

  it("renders every issue's title (nothing silently dropped)", () => {
    for (const type of Object.keys(AUDIT_ISSUE_TYPES)) {
      const copy = getIssueCopy(type);
      if (!copy) continue;
      expect(html, `guide missing "${type}"`).toContain(copy.title);
    }
  });
});
