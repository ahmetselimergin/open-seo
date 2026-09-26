import { AUDIT_ISSUE_TYPES, type IssueSeverity } from "@/shared/audit-issues";
import { getIssueCopy } from "@/shared/health-report-copy";
import type { ReportLang } from "@/shared/health-report";

// Server-rendered, indexable SEO guide built from the same issue registry the
// scanner uses. Real content (title + plain explanation + fix) for organic
// search, each section funnelling into a free scan.

interface GuideCopy {
  htmlLang: string;
  severity: Record<IssueSeverity, string>;
  howToFix: string;
  title: string;
  desc: string;
  heading: string;
  freeScan: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  home: string;
  compare: string;
  privacy: string;
  terms: string;
}

const GUIDE_COPY: Record<ReportLang, GuideCopy> = {
  tr: {
    htmlLang: "tr",
    severity: {
      critical: "Acil sorunlar",
      warning: "Orta öncelikli sorunlar",
      info: "Küçük iyileştirmeler",
    },
    howToFix: "Nasıl düzeltilir?",
    title: "SEO Sağlık Rehberi — sık karşılaşılan sorunlar ve çözümleri",
    desc: "Sitenizin arama motoru performansını etkileyen yaygın SEO sorunları, ne anlama geldikleri ve nasıl düzeltilecekleri — sade Türkçe ile.",
    heading: "SEO Sağlık Rehberi",
    freeScan: "Ücretsiz tara",
    ctaHeading: "Siteniz bu sorunların hangisinden etkileniyor?",
    ctaBody: "Alan adınızı girin, saniyeler içinde ücretsiz öğrenin.",
    ctaButton: "Sitemi tara",
    home: "Ana sayfa",
    compare: "Karşılaştır",
    privacy: "Gizlilik",
    terms: "Kullanım Koşulları",
  },
  en: {
    htmlLang: "en",
    severity: {
      critical: "Urgent issues",
      warning: "Moderate-priority issues",
      info: "Minor improvements",
    },
    howToFix: "How to fix it?",
    title: "SEO Health Guide — common issues and how to fix them",
    desc: "The common SEO issues that affect your site's search performance, what they mean and how to fix them — in plain language.",
    heading: "SEO Health Guide",
    freeScan: "Free scan",
    ctaHeading: "Which of these issues affects your site?",
    ctaBody: "Enter your domain and find out for free in seconds.",
    ctaButton: "Scan my site",
    home: "Home",
    compare: "Compare",
    privacy: "Privacy",
    terms: "Terms",
  },
};

const SEVERITY_ORDER: IssueSeverity[] = ["critical", "warning", "info"];

function itemsFor(
  severity: IssueSeverity,
  lang: ReportLang,
  t: GuideCopy,
): string {
  return Object.entries(AUDIT_ISSUE_TYPES)
    .filter(([, descriptor]) => descriptor.severity === severity)
    .map(([issueType]) => {
      const copy = getIssueCopy(issueType, lang);
      if (!copy) return "";
      return `<article class="g" id="${issueType}">
        <h3>${copy.title}</h3>
        <p>${copy.whatItMeans}</p>
        <p class="fix"><span>${t.howToFix}</span> ${copy.howToFix}</p>
      </article>`;
    })
    .join("");
}

export function renderGuideHtml(
  origin: string,
  lang: ReportLang = "tr",
): string {
  const accent = "#35c6f4";
  const t = GUIDE_COPY[lang];
  const sections = SEVERITY_ORDER.map(
    (sev) =>
      `<section><h2 class="sev sev-${sev}">${t.severity[sev]}</h2>${itemsFor(sev, lang, t)}</section>`,
  ).join("");

  const title = t.title;
  const desc = t.desc;

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${origin}/rehber"/>
<meta property="og:type" content="article"/>
<meta property="og:site_name" content="mySeo"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${origin}/rehber"/>
<meta name="twitter:card" content="summary"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:${accent}}
  .wrap{max-width:760px;margin:0 auto;padding:20px 20px 90px}
  header{display:flex;align-items:center;justify-content:space-between;height:56px}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.02em;text-decoration:none;color:#eef2f8}
  .brand span{color:${accent}}
  .btn{display:inline-block;background:linear-gradient(135deg,#3b82f6,${accent});color:#04121b;font-weight:600;border-radius:12px;padding:10px 18px;text-decoration:none}
  h1{font-size:clamp(2rem,5vw,3rem);letter-spacing:-.02em;line-height:1.1;margin-top:24px}
  .lead{color:#c3cbd6;margin-top:14px;font-size:1.1rem}
  .sev{font-size:1.4rem;letter-spacing:-.01em;margin:44px 0 8px;padding-bottom:8px;border-bottom:1px solid #232a36}
  .sev-critical{color:#ef4444}.sev-warning{color:#f59e0b}.sev-info{color:${accent}}
  .g{padding:18px 0;border-bottom:1px solid #161b23;scroll-margin-top:80px}
  .g:target h3{color:#35c6f4}
  .g h3{font-size:1.15rem;font-weight:600}
  .g p{color:#c3cbd6;margin-top:6px}
  .g .fix{color:#9aa4b2}
  .g .fix span{color:#eef2f8;font-weight:600}
  .cta{margin-top:56px;text-align:center;background:#0e1219;border:1px solid #232a36;border-radius:20px;padding:36px 20px}
  .cta h2{font-size:1.5rem;letter-spacing:-.01em}
  .cta p{color:#8b95a3;margin:8px 0 18px}
  footer{margin-top:40px;border-top:1px solid #232a36;padding-top:20px;color:#8b95a3;font-size:.9rem;display:flex;gap:16px;flex-wrap:wrap}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="brand" href="${origin}/">my<span>Seo</span></a>
      <a class="btn" href="${origin}/">${t.freeScan}</a>
    </header>

    <h1>${t.heading}</h1>
    <p class="lead">${desc}</p>

    ${sections}

    <div class="cta">
      <h2>${t.ctaHeading}</h2>
      <p>${t.ctaBody}</p>
      <a class="btn" href="${origin}/">${t.ctaButton}</a>
    </div>

    <footer>
      <a href="${origin}/">${t.home}</a>
      <a href="${origin}/karsilastir">${t.compare}</a>
      <a href="${origin}/gizlilik">${t.privacy}</a>
      <a href="${origin}/kullanim-kosullari">${t.terms}</a>
    </footer>
  </div>
</body>
</html>`;
}
