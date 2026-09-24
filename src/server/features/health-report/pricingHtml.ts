import type { ServerLang } from "@/server/features/health-report/serverLang";

// Server-rendered, indexable, bilingual pricing page. Free tier reflects what
// ships today; Pro is honest "early access" (no invented price, no fake
// checkout) with interest capture until billing is wired.
interface Plan {
  name: string;
  price: string;
  note: string;
  features: string[];
  highlight: boolean;
}
interface PricingCopy {
  title: string;
  desc: string;
  heading: string;
  foot: string;
  earlyBtn: string;
  freeBtn: string;
  plans: Plan[];
}

const COPY: Record<ServerLang, PricingCopy> = {
  tr: {
    title: "Fiyatlandırma — mySeo",
    desc: "mySeo ücretsiz plana her şey dahil. Daha fazlası için Pro erken erişim listesine katılın.",
    heading: "Basit, dürüst fiyatlandırma",
    foot: "Pro henüz yayında değil; erken erişim listesine katılanlara ilk biz haber vereceğiz.",
    earlyBtn: "Erken erişime katıl",
    freeBtn: "Hemen tara",
    plans: [
      {
        name: "Ücretsiz",
        price: "₺0",
        note: "Sonsuza kadar ücretsiz",
        highlight: false,
        features: [
          "Tek tıkla site taraması (50 sayfaya kadar)",
          "Sağlık skoru, öncelikli 3 sorun, 30 günlük plan",
          "Paylaşılabilir rapor + PDF indirme",
          "1 sitede haftalık izleme + skor uyarısı",
          "Tüm ücretsiz araçlar (meta, hız, robots, snippet, karşılaştırma)",
        ],
      },
      {
        name: "Pro",
        price: "Yakında",
        note: "Erken erişim",
        highlight: true,
        features: [
          "Tarama başına daha fazla sayfa",
          "Sınırsız site izleme + daha sık kontrol",
          "Rakip takibi ve geçmiş trendler",
          "White-label / markasız PDF",
          "Öncelikli destek",
        ],
      },
    ],
  },
  en: {
    title: "Pricing — mySeo",
    desc: "mySeo's free plan includes everything. For more, join the Pro early-access list.",
    heading: "Simple, honest pricing",
    foot: "Pro isn't live yet; early-access members hear from us first.",
    earlyBtn: "Join early access",
    freeBtn: "Scan now",
    plans: [
      {
        name: "Free",
        price: "$0",
        note: "Free forever",
        highlight: false,
        features: [
          "One-click site scan (up to 50 pages)",
          "Health score, top 3 issues, 30-day plan",
          "Shareable report + PDF download",
          "Weekly monitoring for 1 site + score alerts",
          "All free tools (meta, speed, robots, snippet, compare)",
        ],
      },
      {
        name: "Pro",
        price: "Soon",
        note: "Early access",
        highlight: true,
        features: [
          "More pages per scan",
          "Unlimited site monitoring + more frequent checks",
          "Competitor tracking and historical trends",
          "White-label PDF",
          "Priority support",
        ],
      },
    ],
  },
};

function langToggle(origin: string, lang: ServerLang): string {
  const mk = (l: ServerLang, label: string) =>
    l === lang
      ? `<span class="on">${label}</span>`
      : `<a href="${origin}/fiyatlandirma?lang=${l}">${label}</a>`;
  return `<span class="lang">${mk("tr", "TR")} ${mk("en", "EN")}</span>`;
}

function planCard(plan: Plan, origin: string, c: PricingCopy): string {
  const items = plan.features
    .map((f) => `<li><span class="tick">✓</span>${f}</li>`)
    .join("");
  const cta = plan.highlight
    ? `<form method="POST" action="${origin}/api/account/pro-interest" class="cta">
         <input type="email" name="email" placeholder="siz@example.com" required aria-label="email"/>
         <button class="btn" type="submit">${c.earlyBtn}</button>
       </form>`
    : `<a class="btn ghost" href="${origin}/">${c.freeBtn}</a>`;
  return `<div class="plan${plan.highlight ? " hi" : ""}">
    <div class="ptop"><h2>${plan.name}</h2><div class="price">${plan.price}</div><div class="pnote">${plan.note}</div></div>
    <ul>${items}</ul>
    ${cta}
  </div>`;
}

export function renderPricingHtml(origin: string, lang: ServerLang): string {
  const c = COPY[lang];
  const accent = "#35c6f4";
  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${c.title}</title>
<meta name="description" content="${c.desc}"/>
<link rel="canonical" href="${origin}/fiyatlandirma"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="mySeo"/>
<meta property="og:title" content="${c.title}"/>
<meta property="og:description" content="${c.desc}"/>
<meta property="og:url" content="${origin}/fiyatlandirma"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:900px;margin:0 auto;padding:20px 20px 90px}
  header{display:flex;align-items:center;justify-content:space-between;height:56px}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.02em}
  .brand span{color:${accent}}
  .lang{font-size:.85rem;color:#8b95a3}
  .lang .on{color:#eef2f8;font-weight:700}
  .lang a:hover{color:#eef2f8}
  h1{font-size:clamp(2rem,5vw,3rem);letter-spacing:-.02em;line-height:1.1;margin-top:24px;text-align:center}
  .lead{color:#c3cbd6;margin-top:12px;text-align:center;max-width:60ch;margin-left:auto;margin-right:auto}
  .grid{margin-top:36px;display:grid;gap:20px;grid-template-columns:1fr 1fr}
  @media(max-width:720px){.grid{grid-template-columns:1fr}}
  .plan{background:#0e1219;border:1px solid #232a36;border-radius:20px;padding:28px;display:flex;flex-direction:column}
  .plan.hi{border-color:${accent}66;box-shadow:0 24px 70px -40px ${accent}}
  .ptop h2{font-size:1.3rem}
  .price{font-size:2.4rem;font-weight:800;letter-spacing:-.02em;margin-top:6px}
  .pnote{color:#8b95a3;font-size:.9rem}
  ul{list-style:none;margin:20px 0;display:flex;flex-direction:column;gap:10px;flex:1}
  li{color:#c3cbd6;font-size:.97rem;display:flex;gap:10px}
  .tick{color:${accent};font-weight:700}
  .btn{display:inline-block;text-align:center;background:linear-gradient(135deg,#3b82f6,${accent});color:#04121b;font-weight:600;border:0;border-radius:12px;padding:12px 18px;cursor:pointer;font-size:1rem}
  .btn.ghost{background:none;border:1px solid #232a36;color:#eef2f8}
  .cta{display:flex;gap:8px}
  .cta input{flex:1;background:#0a0d13;border:1px solid #232a36;border-radius:12px;padding:12px 14px;color:#eef2f8;outline:none}
  .cta input:focus{border-color:${accent}}
  .foot{margin-top:28px;text-align:center;color:#8b95a3;font-size:.9rem}
</style></head>
<body><div class="wrap">
<header>
  <a class="brand" href="${origin}/">my<span>Seo</span></a>
  ${langToggle(origin, lang)}
</header>
<h1>${c.heading}</h1>
<p class="lead">${c.desc}</p>
<div class="grid">${c.plans.map((p) => planCard(p, origin, c)).join("")}</div>
<p class="foot">${c.foot}</p>
</div></body></html>`;
}

export function renderProInterestPage(
  origin: string,
  ok: boolean,
  lang: ServerLang,
): string {
  const accent = "#35c6f4";
  const t =
    lang === "en"
      ? {
          title: ok ? "You're on the list 🎉" : "Something went wrong",
          msg: ok
            ? "Thanks! We'll let you know first when Pro early access opens."
            : "Please enter a valid email.",
          back: "Back to home →",
        }
      : {
          title: ok ? "Listeye eklendin 🎉" : "Bir sorun oldu",
          msg: ok
            ? "Teşekkürler! Pro erken erişime açıldığında ilk sana haber vereceğiz."
            : "Geçerli bir e-posta girin.",
          back: "Ana sayfaya dön →",
        };
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${t.title} — mySeo</title><meta name="robots" content="noindex"/>
<style>body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:20px}a{color:${accent}}</style>
</head><body><div><h1>${t.title}</h1>
<p style="color:#c3cbd6;margin-top:8px">${t.msg}</p>
<p style="margin-top:16px"><a href="${origin}/">${t.back}</a></p></div></body></html>`;
}
