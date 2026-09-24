import { describe, expect, it } from "vitest";
import { renderBadgeSvg } from "@/server/features/health-report/badgeSvg";

describe("renderBadgeSvg", () => {
  it("renders a valid SVG with the score and brand", () => {
    const svg = renderBadgeSvg(92);
    expect(svg.trimStart().startsWith("<svg")).toBe(true);
    expect(svg).toContain(">92</text>");
    expect(svg).toContain("Seo");
    expect(svg).toContain("</svg>");
  });

  it("uses a green tone for high scores and red for low", () => {
    expect(renderBadgeSvg(90)).toContain("#22c55e");
    expect(renderBadgeSvg(20)).toContain("#ef4444");
  });

  it("falls back to a dash when the score is unknown (never breaks an embed)", () => {
    const svg = renderBadgeSvg(null);
    expect(svg.trimStart().startsWith("<svg")).toBe(true);
    expect(svg).toContain("—");
  });
});
