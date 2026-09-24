import {
  localizeReport,
  type HealthReport,
  type ReportLang,
} from "@/shared/health-report";

// Server-rendered HTML for a shared report at /report/<id>. Unlike the app's
// client-rendered pages, this returns real markup so social crawlers and
// search engines get proper <title>/OpenGraph meta AND readable content.
// The mySeo cinematic dark theme is inlined so the page is self-contained.

interface SharedCopy {
  htmlLang: string;
  scoreSuffix: string;
  overallScore: string;
  pagesScanned: (n: number) => string;
  firstN: string;
  critical: string;
  warning: string;
  info: string;
  pagesWord: string;
  noIssuesTitle: string;
  noIssuesBody: string;
  topProblems: string;
  whatItMeans: string;
  howToFix: string;
  planHeading: string;
  weekLabel: (n: number) => string;
  download: string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
}

const SHARED_COPY: Record<ReportLang, SharedCopy> = {
  tr: {
    htmlLang: "tr",
    scoreSuffix: "SEO sağlık skoru",
    overallScore: "Genel sağlık skoru",
    pagesScanned: (n) => `${n} sayfa tarandı`,
    firstN: " · ilk 50 sayfa",
    critical: "Acil",
    warning: "Orta",
    info: "Küçük",
    pagesWord: "sayfa",
    noIssuesTitle: "Sorun bulunamadı",
    noIssuesBody: "Taranan sayfalarda acil bir sorun çıkmadı.",
    topProblems: "Öncelikli 3 sorun",
    whatItMeans: "Ne anlama geliyor?",
    howToFix: "Nasıl düzeltilir?",
    planHeading: "30 günlük eylem planı",
    weekLabel: (n) => `${n}. hafta`,
    download: "İndir",
    ctaHeading: "Kendi sitenizi ücretsiz kontrol edin",
    ctaBody: "Kayıt gerekmez, saniyeler sürer.",
    ctaButton: "mySeo ile tara",
  },
  en: {
    htmlLang: "en",
    scoreSuffix: "SEO health score",
    overallScore: "Overall health score",
    pagesScanned: (n) => `${n} pages scanned`,
    firstN: " · first 50 pages",
    critical: "Urgent",
    warning: "Moderate",
    info: "Minor",
    pagesWord: "pages",
    noIssuesTitle: "No issues found",
    noIssuesBody: "No urgent issues came up on the scanned pages.",
    topProblems: "Top 3 issues",
    whatItMeans: "What does it mean?",
    howToFix: "How to fix it?",
    planHeading: "30-day action plan",
    weekLabel: (n) => `Week ${n}`,
    download: "Download",
    ctaHeading: "Check your own site for free",
    ctaBody: "No sign-up, takes seconds.",
    ctaButton: "Scan with mySeo",
  },
};

function esc(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] ?? c,
  );
}

function toneColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function severityColor(severity: string): string {
  if (severity === "critical") return "#ef4444";
  if (severity === "warning") return "#f59e0b";
  return "#38bdf8";
}

function gaugeSvg(score: number): string {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = toneColor(score);
  return `<svg viewBox="0 0 120 120" width="128" height="128" style="transform:rotate(-90deg)">
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#232a36" stroke-width="9"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="9"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
      style="filter:drop-shadow(0 0 7px ${color})"/>
  </svg>`;
}

function problemsHtml(report: HealthReport, t: SharedCopy): string {
  if (report.topProblems.length === 0) {
    return `<div class="card ok">
      <h2>${t.noIssuesTitle}</h2>
      <p>${t.noIssuesBody}</p>
    </div>`;
  }
  const items = report.topProblems
    .map(
      (p, i) => `<article class="card">
        <div class="prow">
          <span class="pnum" style="background:${severityColor(p.severity)}22;color:${severityColor(p.severity)}">${i + 1}</span>
          <h3>${esc(p.title)}</h3>
          <span class="pages">${p.affectedPages} ${t.pagesWord}</span>
        </div>
        <div class="pgrid">
          <div><span class="lbl">${t.whatItMeans}</span><p>${esc(p.whatItMeans)}</p></div>
          <div><span class="lbl">${t.howToFix}</span><p>${esc(p.howToFix)}</p></div>
        </div>
      </article>`,
    )
    .join("");
  return `<h2 class="sech">${t.topProblems}</h2>${items}`;
}

function planHtml(report: HealthReport, t: SharedCopy): string {
  const weeks = [1, 2, 3, 4]
    .map((w) => {
      const tasks = report.actionPlan.filter((a) => a.week === w);
      if (tasks.length === 0) return "";
      const lis = tasks.map((task) => `<li>${esc(task.task)}</li>`).join("");
      return `<div class="week"><h4>${t.weekLabel(w)}</h4><ul>${lis}</ul></div>`;
    })
    .join("");
  return `<h2 class="sech">${t.planHeading}</h2><div class="plan">${weeks}</div>`;
}

export function renderSharedReportHtml(input: {
  report: HealthReport;
  id: string;
  origin: string;
  lang?: ReportLang;
}): string {
  const { id, origin } = input;
  const lang = input.lang ?? "tr";
  const t = SHARED_COPY[lang];
  const report = localizeReport(input.report, lang);
  const shareUrl = `${origin}/report/${esc(id)}`;
  const ogImage = `${origin}/report/${esc(id)}/og.png`;
  const title = `${esc(report.domain)} — ${t.scoreSuffix} ${report.score}/100 · mySeo`;
  const desc = esc(report.summary);
  const accent = "#35c6f4";

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${shareUrl}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="mySeo"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${shareUrl}"/>
<meta property="og:image" content="${ogImage}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image" content="${ogImage}"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5}
  a{color:inherit}
  .wrap{max-width:820px;margin:0 auto;padding:20px 20px 80px}
  header{display:flex;align-items:center;justify-content:space-between;height:56px}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.02em}
  .brand span{color:${accent}}
  .btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#3b82f6,${accent});color:#04121b;font-weight:600;border:0;border-radius:14px;padding:12px 20px;text-decoration:none;cursor:pointer}
  .card{background:#0e1219;border:1px solid #232a36;border-radius:18px;padding:24px;margin-top:16px}
  .score{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
  .score .num{position:relative;width:128px;height:128px;flex:0 0 auto}
  .score .num b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:800}
  .grade{display:inline-block;border-radius:999px;padding:3px 12px;font-size:13px;font-weight:700;background:${accent}22;color:${accent};margin-left:8px}
  .summary{color:#c3cbd6;margin-top:8px}
  .meta{color:#8b95a3;font-size:14px;margin-top:10px}
  .pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .pill{border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600}
  .sech{font-size:24px;font-weight:700;letter-spacing:-.02em;margin-top:40px}
  .prow{display:flex;align-items:center;gap:12px}
  .pnum{width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px}
  .prow h3{font-size:18px;font-weight:600;flex:1}
  .pages{color:#8b95a3;font-size:13px}
  .pgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
  .pgrid > div{background:#0a0d13;border-radius:12px;padding:14px}
  .lbl{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8b95a3;font-weight:700;margin-bottom:4px}
  .pgrid p{font-size:14px;color:#c3cbd6}
  .plan{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
  .week{background:#0e1219;border:1px solid #232a36;border-radius:14px;padding:16px}
  .week h4{font-size:14px;color:#8b95a3;margin-bottom:8px}
  .week ul{list-style:none;display:flex;flex-direction:column;gap:8px}
  .week li{font-size:14px;padding-left:20px;position:relative}
  .week li::before{content:"";position:absolute;left:0;top:7px;width:8px;height:8px;border-radius:3px;border:1px solid #3a4453}
  .cta{margin-top:40px;text-align:center;background:#0e1219;border:1px solid #232a36;border-radius:20px;padding:36px 20px}
  .cta h3{font-size:22px;font-weight:700;letter-spacing:-.02em}
  .cta p{color:#8b95a3;margin:8px 0 18px}
  .card.ok{border-color:#22c55e55;background:#0f1a12}
  @media (max-width:640px){.pgrid,.plan{grid-template-columns:1fr}}
  @media print{body{background:#fff;color:#111}.card,.week,.cta{background:#fff;border-color:#e5e7eb}.pgrid>div{background:#f5f6f8}.no-print{display:none}}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="brand" href="${origin}/">my<span>Seo</span></a>
      <button class="btn no-print" onclick="window.print()">${t.download}</button>
    </header>

    <div class="card">
      <div class="score">
        <div class="num">${gaugeSvg(report.score)}<b>${report.score}</b></div>
        <div>
          <div style="display:flex;align-items:center"><span style="font-size:22px;font-weight:700">${t.overallScore}</span><span class="grade">${esc(report.grade)}</span></div>
          <p class="summary">${desc}</p>
          <p class="meta">${esc(report.domain)} · ${t.pagesScanned(report.pagesScanned)}${report.truncated ? t.firstN : ""}</p>
          <div class="pills">
            <span class="pill" style="background:#ef444422;color:#ef4444">${report.issueCounts.critical} ${t.critical}</span>
            <span class="pill" style="background:#f59e0b22;color:#f59e0b">${report.issueCounts.warning} ${t.warning}</span>
            <span class="pill" style="background:#38bdf822;color:#38bdf8">${report.issueCounts.info} ${t.info}</span>
          </div>
        </div>
      </div>
    </div>

    ${problemsHtml(report, t)}
    ${planHtml(report, t)}

    <div class="cta no-print">
      <h3>${t.ctaHeading}</h3>
      <p>${t.ctaBody}</p>
      <a class="btn" href="${origin}/">${t.ctaButton}</a>
    </div>
  </div>
</body>
</html>`;
}
