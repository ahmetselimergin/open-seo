import { ImageResponse } from "takumi-js/response";
import type { ReportLang } from "@/shared/health-report";

// Static-ish 1200x630 social card for the mySeo landing page, rendered
// server-side (takumi) so shares on social/chat preview with the brand rather
// than a bare link. Cinematic dark theme + electric-blue accent, matching the
// site. Bilingual via the resolved request language.

const COPY: Record<
  ReportLang,
  { tagline: string; sub: string; badge: string }
> = {
  tr: {
    tagline: "SEO sağlığınız, tek bakışta.",
    sub: "Alan adınızı girin, ücretsiz sağlık karnenizi ve 30 günlük planınızı saniyeler içinde alın.",
    badge: "ÜCRETSIZ SEO SAĞLIK RAPORU",
  },
  en: {
    tagline: "Your SEO health, at a glance.",
    sub: "Enter your domain and get a free health scorecard and a 30-day action plan in seconds.",
    badge: "FREE SEO HEALTH REPORT",
  },
};

export function renderHomeSocialImage(lang: ReportLang = "tr"): Response {
  const accent = "#35c6f4";
  const t = COPY[lang];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: "#070a0f",
        color: "#eef2f8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            fontSize: 44,
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
            fontSize: 18,
            color: accent,
            letterSpacing: 3,
            border: `1px solid ${accent}55`,
            borderRadius: 999,
            padding: "6px 16px",
          }}
        >
          {t.badge}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          {t.tagline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#c3cbd6",
            paddingTop: 24,
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          {t.sub}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 10,
          backgroundColor: accent,
        }}
      />
    </div>,
    {
      width: 1200,
      height: 630,
      format: "png",
      emoji: "from-font",
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
