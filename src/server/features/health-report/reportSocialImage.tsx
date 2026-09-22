import { ImageResponse } from "takumi-js/response";
import type { HealthReport } from "@/shared/health-report";

// Dynamic 1200x630 social card for a shared SEO health report. Rendered
// server-side (takumi) so shared links preview well on social/chat. Cinematic
// dark theme + electric-blue brand, matching the mySeo site.
function toneColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export function renderHealthReportSocialImage(report: HealthReport): Response {
  const accent = "#35c6f4";
  const ring = toneColor(report.score);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        backgroundColor: "#070a0f",
        color: "#eef2f8",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#eef2f8" }}>my</span>
          <span style={{ color: accent }}>Seo</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#8b95a3",
            letterSpacing: 2,
          }}
        >
          SEO SAĞLIK RAPORU
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 56,
          paddingTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 240,
            height: 240,
            borderRadius: 240,
            border: `16px solid ${ring}`,
            color: "#eef2f8",
            fontSize: 96,
            fontWeight: 800,
          }}
        >
          {report.score}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#8b95a3" }}>
            {report.domain}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2,
              paddingTop: 6,
            }}
          >
            {report.grade}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#c3cbd6",
              paddingTop: 16,
            }}
          >
            {report.issueCounts.total} iyileştirme fırsatı bulundu
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: 8,
          borderRadius: 8,
          backgroundColor: accent,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      format: "png",
      emoji: "from-font",
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
