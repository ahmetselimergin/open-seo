import { describe, expect, it } from "vitest";
import { AUDIT_ISSUE_TYPES } from "@/shared/audit-issues";
import { getIssueCopy } from "@/shared/health-report-copy";

describe("health-report copy completeness", () => {
  const issueTypes = Object.keys(AUDIT_ISSUE_TYPES);

  it("covers every registered issue type", () => {
    // Guards the whole reporting pipeline: an issue with no Turkish copy is
    // silently dropped from the report, guide, and summary. This fails loudly
    // the moment a new AUDIT_ISSUE_TYPE is added without copy.
    for (const type of issueTypes) {
      expect(getIssueCopy(type), `missing copy for "${type}"`).not.toBeNull();
    }
  });

  it("has non-empty, well-formed copy for each type", () => {
    for (const type of issueTypes) {
      const copy = getIssueCopy(type);
      expect(copy).not.toBeNull();
      if (!copy) continue;
      expect(copy.title.trim().length).toBeGreaterThan(0);
      expect(copy.whatItMeans.trim().length).toBeGreaterThan(0);
      expect(copy.howToFix.trim().length).toBeGreaterThan(0);
      expect(copy.task.trim().length).toBeGreaterThan(0);
      expect(copy.week).toBeGreaterThanOrEqual(1);
      expect(copy.week).toBeLessThanOrEqual(4);
    }
  });

  it("returns null for unknown types", () => {
    expect(getIssueCopy("not-a-real-issue")).toBeNull();
  });

  it("has distinct, well-formed English copy for every type", () => {
    for (const type of issueTypes) {
      const tr = getIssueCopy(type, "tr");
      const en = getIssueCopy(type, "en");
      expect(en, `missing EN copy for "${type}"`).not.toBeNull();
      if (!en || !tr) continue;
      expect(en.title.trim().length).toBeGreaterThan(0);
      expect(en.whatItMeans.trim().length).toBeGreaterThan(0);
      expect(en.howToFix.trim().length).toBeGreaterThan(0);
      expect(en.task.trim().length).toBeGreaterThan(0);
      // The neutral week is shared across languages.
      expect(en.week).toBe(tr.week);
      // English is actually translated, not a Turkish fallback.
      expect(en.title).not.toBe(tr.title);
    }
  });
});
