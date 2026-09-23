import { AUDIT_ISSUE_TYPES, type IssueSeverity } from "@/shared/audit-issues";
import { getIssueCopy } from "@/shared/health-report-copy";

// Server-rendered, indexable SEO guide built from the same issue registry the
// scanner uses. Real content (title + plain-Turkish explanation + fix) for
// organic search, each section funnelling into a free scan.

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  critical: "Acil sorunlar",
  warning: "Orta öncelikli sorunlar",
  info: "Küçük iyileştirmeler",
};
const SEVERITY_ORDER: IssueSeverity[] = ["critical", "warning", "info"];

function itemsFor(severity: IssueSeverity): string {
  return Object.entries(AUDIT_ISSUE_TYPES)
    .filter(([, descriptor]) => descriptor.severity === severity)
    .map(([issueType]) => {
      const copy = getIssueCopy(issueType);
      if (!copy) return "";
      return `<article class="g">
        <h3>${copy.title}</h3>
        <p>${copy.whatItMeans}</p>
        <p class="fix"><span>Nasıl düzeltilir?</span> ${copy.howToFix}</p>
      </article>`;
    })
    .join("");
}

export function renderGuideHtml(origin: string): string {
  const accent = "#35c6f4";
  const sections = SEVERITY_ORDER.map(
    (sev) =>
      `<section><h2 class="sev sev-${sev}">${SEVERITY_LABEL[sev]}</h2>${itemsFor(sev)}</section>`,
  ).join("");

  const title = "SEO Sağlık Rehberi — sık karşılaşılan sorunlar ve çözümleri";
  const desc =
    "Sitenizin arama motoru performansını etkileyen yaygın SEO sorunları, ne anlama geldikleri ve nasıl düzeltilecekleri — sade Türkçe ile.";

  return `<!doctype html>
<html lang="tr">
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
  .g{padding:18px 0;border-bottom:1px solid #161b23}
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
      <a class="btn" href="${origin}/">Ücretsiz tara</a>
    </header>

    <h1>SEO Sağlık Rehberi</h1>
    <p class="lead">${desc}</p>

    ${sections}

    <div class="cta">
      <h2>Siteniz bu sorunların hangisinden etkileniyor?</h2>
      <p>Alan adınızı girin, saniyeler içinde ücretsiz öğrenin.</p>
      <a class="btn" href="${origin}/">Sitemi tara</a>
    </div>

    <footer>
      <a href="${origin}/">Ana sayfa</a>
      <a href="${origin}/karsilastir">Karşılaştır</a>
      <a href="${origin}/gizlilik">Gizlilik</a>
      <a href="${origin}/kullanim-kosullari">Kullanım Koşulları</a>
    </footer>
  </div>
</body>
</html>`;
}
