// Server-rendered, indexable "free tools" hub. A real landing page for the
// "ücretsiz SEO araçları" intent, cross-linking every tool and funnelling into
// a scan. Includes ItemList structured data for rich results.

interface Tool {
  href: string;
  name: string;
  desc: string;
}

const TOOLS: Tool[] = [
  {
    href: "/",
    name: "SEO Sağlık Raporu",
    desc: "Alan adınızı girin; 50 sayfaya kadar tarayıp skor, öncelikli sorunlar ve 30 günlük plan çıkaralım.",
  },
  {
    href: "/karsilastir",
    name: "Rakip Karşılaştırma",
    desc: "Sitenizi bir rakiple yan yana koyun; skorları ve sorunları karşılaştırın.",
  },
  {
    href: "/araclar/meta",
    name: "Meta Etiket Kontrolü",
    desc: "Bir sayfanın başlık, açıklama ve OG etiketlerini kontrol edin; Google ve sosyal medya önizlemesini görün.",
  },
  {
    href: "/araclar/robots",
    name: "robots.txt & Sitemap Kontrolü",
    desc: "Siteniz arama motorlarına açık mı, site haritanız var mı — saniyeler içinde kontrol edin.",
  },
  {
    href: "/araclar/hiz",
    name: "Sayfa Hızı & Core Web Vitals",
    desc: "Google verileriyle mobil performans skorunuzu ve temel hız metriklerinizi ölçün.",
  },
  {
    href: "/rehber",
    name: "SEO Sağlık Rehberi",
    desc: "Yaygın SEO sorunlarının ne anlama geldiğini ve nasıl düzeltileceğini sade Türkçe ile öğrenin.",
  },
];

export function renderToolsHubHtml(origin: string): string {
  const accent = "#35c6f4";
  const title = "Ücretsiz SEO Araçları — mySeo";
  const desc =
    "Sitenizi ücretsiz analiz edin: SEO sağlık raporu, rakip karşılaştırma, meta etiket kontrolü ve daha fazlası. Kayıt gerekmez.";

  const cards = TOOLS.map(
    (t) => `<a class="card" href="${origin}${t.href}">
      <h2>${t.name}</h2>
      <p>${t.desc}</p>
      <span class="go">Aç →</span>
    </a>`,
  ).join("");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${origin}${t.href}`,
    })),
  });

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="description" content="${desc}"/>
<link rel="canonical" href="${origin}/araclar"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="mySeo"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:url" content="${origin}/araclar"/>
<meta name="twitter:card" content="summary"/>
<script type="application/ld+json">${jsonLd}</script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:820px;margin:0 auto;padding:20px 20px 90px}
  header{display:flex;align-items:center;justify-content:space-between;height:56px}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.02em}
  .brand span{color:${accent}}
  h1{font-size:clamp(2rem,5vw,3rem);letter-spacing:-.02em;line-height:1.1;margin-top:24px}
  .lead{color:#c3cbd6;margin-top:14px;font-size:1.1rem;max-width:56ch}
  .grid{margin-top:32px;display:grid;gap:16px;grid-template-columns:1fr 1fr}
  @media(max-width:640px){.grid{grid-template-columns:1fr}}
  .card{display:block;background:#0e1219;border:1px solid #232a36;border-radius:18px;padding:22px;transition:transform .15s ease,border-color .15s ease}
  .card:hover{transform:translateY(-2px);border-color:${accent}66}
  .card h2{font-size:1.2rem;letter-spacing:-.01em}
  .card p{color:#c3cbd6;margin-top:8px;font-size:.97rem}
  .card .go{display:inline-block;margin-top:14px;color:${accent};font-weight:600;font-size:.95rem}
  footer{margin-top:40px;border-top:1px solid #232a36;padding-top:20px;color:#8b95a3;font-size:.9rem;display:flex;gap:16px;flex-wrap:wrap}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <a class="brand" href="${origin}/">my<span>Seo</span></a>
      <a class="brand" style="color:${accent};font-size:15px" href="${origin}/">Ücretsiz tara →</a>
    </header>
    <h1>Ücretsiz SEO araçları</h1>
    <p class="lead">${desc}</p>
    <div class="grid">${cards}</div>
    <footer>
      <a href="${origin}/">Ana sayfa</a>
      <a href="${origin}/rehber">Rehber</a>
      <a href="${origin}/gizlilik">Gizlilik</a>
      <a href="${origin}/kullanim-kosullari">Kullanım Koşulları</a>
    </footer>
  </div>
</body>
</html>`;
}
