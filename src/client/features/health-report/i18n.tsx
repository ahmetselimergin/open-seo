import * as React from "react";

// Lightweight i18n for the mySeo homepage (client surfaces). Phase 1 covers the
// marketing homepage; tool/result/server-rendered pages stay Turkish for now.
export type Lang = "tr" | "en";

const STORAGE_KEY = "myseo_lang";

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "tr") return v;
  } catch {
    // ignore
  }
  return "tr";
}

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}
const Ctx = React.createContext<LangCtx>({ lang: "tr", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(readStored);
  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.cookie = `${STORAGE_KEY}=${l};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // ignore
    }
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return React.useContext(Ctx);
}

export function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const other: Lang = lang === "tr" ? "en" : "tr";
  return (
    <button
      onClick={() => setLang(other)}
      className="rounded-full border border-base-300 px-2.5 py-1 text-xs font-semibold uppercase transition-colors hover:text-base-content"
      aria-label="Dil değiştir / Change language"
    >
      {lang === "tr" ? "EN" : "TR"}
    </button>
  );
}

export interface HomeCopy {
  nav: { tools: string; pricing: string; account: string };
  hero: {
    badge: string;
    title1: string;
    titleAccent: string;
    subtitle: string;
    domainPlaceholder: string;
    scan: string;
    emailPlaceholder: string;
    trust: string;
  };
  visual: {
    urlBar: string;
    scoreLabel: string;
    grade: string;
    healthy: string;
    pagesScanned: string;
    missingTitle: string;
    brokenLink: string;
    pages3: string;
    pages2: string;
    chipPoints: string;
    chipPointsNote: string;
    chipIssues: string;
    chipIssuesNote: string;
  };
  scanning: string[];
  manifesto: { lead: string; muted: string };
  score: { heading: string; body: string };
  problems: {
    heading: string;
    body: string;
    s1t: string;
    s1b: string;
    s2t: string;
    s2b: string;
  };
  plan: { heading: string; body: string; weeks: { w: string; task: string }[] };
  cta: { heading: string; body: string; button: string };
  faqHeading: string;
  faq: { q: string; a: string }[];
  footer: {
    tagline: string;
    free: string;
    tools: string;
    pricing: string;
    compare: string;
    guide: string;
    privacy: string;
    terms: string;
  };
}

const TR: HomeCopy = {
  nav: { tools: "Araçlar", pricing: "Fiyatlar", account: "Hesabım" },
  hero: {
    badge: "Ücretsiz SEO taraması",
    title1: "SEO sağlığınız,",
    titleAccent: "tek bakışta.",
    subtitle:
      "Alan adınızı girin, sitenizi tarayıp sade bir sağlık karnesi ve 30 günlük plan çıkaralım.",
    domainPlaceholder: "siteniz.com",
    scan: "Tara",
    emailPlaceholder: "E-posta (opsiyonel)",
    trust: "Kayıt gerekmez, 50 sayfaya kadar, ~30 saniye",
  },
  visual: {
    urlBar: "siteniz.com — sağlık raporu",
    scoreLabel: "Sağlık skoru",
    grade: "İyi",
    healthy: "Siteniz sağlıklı",
    pagesScanned: "18 sayfa tarandı",
    missingTitle: "Eksik başlık",
    brokenLink: "Kırık bağlantı",
    pages3: "3 sayfa",
    pages2: "2 sayfa",
    chipPoints: "+14 puan",
    chipPointsNote: "bu hafta",
    chipIssues: "3 sorun",
    chipIssuesNote: "bulundu",
  },
  scanning: [
    "Site haritası ve sayfalar keşfediliyor…",
    "Sayfalar taranıyor…",
    "Başlıklar ve bağlantılar kontrol ediliyor…",
    "Sağlık karneniz hazırlanıyor…",
  ],
  manifesto: {
    lead: "SEO karmaşık olmak zorunda değil.",
    muted: "Tek bir skor, öncelikli sorunlar ve net bir yol.",
  },
  score: {
    heading: "0'dan 100'e, tek bir sağlık skoru",
    body: "Sitenizin genel durumunu tek bakışta anlarsınız. Skor düştükçe acil işler artar, yükseldikçe içiniz rahat eder.",
  },
  problems: {
    heading: "Öncelikli 3 sorun, sade dille",
    body: "Teknik terim yok. En çok zarar veren sorunları, ne anlama geldiklerini ve nasıl düzeltileceğini anlatırız.",
    s1t: "Eksik başlık",
    s1b: "Arama sonuçlarında görünen ana metin yok.",
    s2t: "Kırık bağlantı",
    s2b: "Çalışmayan bir sayfaya yönlendiren linkler var.",
  },
  plan: {
    heading: "30 günlük, adım adım plan",
    body: "Haftalara bölünmüş, işaretledikçe ilerlediğiniz bir yapılacaklar listesi.",
    weeks: [
      { w: "1. Hafta", task: "Eksik başlıkları ekle" },
      { w: "2. Hafta", task: "Kırık linkleri onar" },
      { w: "3. Hafta", task: "Yavaş sayfaları hızlandır" },
      { w: "4. Hafta", task: "Site haritasını güncelle" },
    ],
  },
  cta: {
    heading: "Sitenizi bugün kontrol edin.",
    body: "Ücretsiz, kayıt gerektirmez ve saniyeler sürer.",
    button: "Ücretsiz taramaya başla",
  },
  faqHeading: "Sık sorulan sorular",
  faq: [
    {
      q: "Gerçekten ücretsiz mi?",
      a: "Evet. Alan adını girip raporu almak tamamen ücretsizdir ve kart bilgisi istemez.",
    },
    {
      q: "Kayıt olmam gerekiyor mu?",
      a: "Hayır. Hesap açmadan doğrudan raporu alırsınız. E-posta alanı tamamen opsiyoneldir.",
    },
    {
      q: "Verilerimi saklıyor musunuz?",
      a: "Rapor için yalnızca sitenin herkese açık sayfaları taranır. E-posta verirseniz sadece raporunuzu iletmek için kullanılır.",
    },
    {
      q: "Kaç sayfa taranıyor ve ne kadar sürüyor?",
      a: "Gereksiz maliyeti önlemek için en fazla 50 sayfa taranır. Çoğu sitede rapor 30 saniyede hazır olur.",
    },
  ],
  footer: {
    tagline: "Sitenizin SEO sağlığı, herkesin anlayacağı dilde.",
    free: "Ücretsiz, kayıt gerektirmez",
    tools: "Araçlar",
    pricing: "Fiyatlar",
    compare: "Karşılaştır",
    guide: "Rehber",
    privacy: "Gizlilik",
    terms: "Kullanım Koşulları",
  },
};

const EN: HomeCopy = {
  nav: { tools: "Tools", pricing: "Pricing", account: "Account" },
  hero: {
    badge: "Free SEO scan",
    title1: "Your SEO health,",
    titleAccent: "at a glance.",
    subtitle:
      "Enter your domain and we'll scan your site for a clear health scorecard and a 30-day action plan.",
    domainPlaceholder: "yoursite.com",
    scan: "Scan",
    emailPlaceholder: "Email (optional)",
    trust: "No sign-up, up to 50 pages, ~30 seconds",
  },
  visual: {
    urlBar: "yoursite.com — health report",
    scoreLabel: "Health score",
    grade: "Good",
    healthy: "Your site is healthy",
    pagesScanned: "18 pages scanned",
    missingTitle: "Missing title",
    brokenLink: "Broken link",
    pages3: "3 pages",
    pages2: "2 pages",
    chipPoints: "+14 points",
    chipPointsNote: "this week",
    chipIssues: "3 issues",
    chipIssuesNote: "found",
  },
  scanning: [
    "Discovering sitemap and pages…",
    "Crawling pages…",
    "Checking titles and links…",
    "Preparing your scorecard…",
  ],
  manifesto: {
    lead: "SEO doesn't have to be complicated.",
    muted: "One score, the priority issues, and a clear path.",
  },
  score: {
    heading: "One health score, from 0 to 100",
    body: "Understand your site's overall state at a glance. The lower the score, the more urgent the work; the higher, the more peace of mind.",
  },
  problems: {
    heading: "Top 3 issues, in plain language",
    body: "No jargon. We explain the most damaging issues, what they mean, and how to fix them.",
    s1t: "Missing title",
    s1b: "No main text shown in search results.",
    s2t: "Broken link",
    s2b: "Links pointing to a page that no longer works.",
  },
  plan: {
    heading: "A 30-day, step-by-step plan",
    body: "A checklist split into weeks that you progress through as you tick items off.",
    weeks: [
      { w: "Week 1", task: "Add missing titles" },
      { w: "Week 2", task: "Fix broken links" },
      { w: "Week 3", task: "Speed up slow pages" },
      { w: "Week 4", task: "Update the sitemap" },
    ],
  },
  cta: {
    heading: "Check your site today.",
    body: "Free, no sign-up, and it takes seconds.",
    button: "Start a free scan",
  },
  faqHeading: "Frequently asked questions",
  faq: [
    {
      q: "Is it really free?",
      a: "Yes. Entering a domain and getting the report is completely free and asks for no card details.",
    },
    {
      q: "Do I need to sign up?",
      a: "No. You get the report directly without an account. The email field is entirely optional.",
    },
    {
      q: "Do you store my data?",
      a: "We only crawl the site's publicly available pages. If you provide an email, it is used only to send you the report.",
    },
    {
      q: "How many pages are scanned and how long does it take?",
      a: "To avoid unnecessary cost, up to 50 pages are scanned. For most sites the report is ready in about 30 seconds.",
    },
  ],
  footer: {
    tagline: "Your site's SEO health, in language everyone understands.",
    free: "Free, no sign-up required",
    tools: "Tools",
    pricing: "Pricing",
    compare: "Compare",
    guide: "Guide",
    privacy: "Privacy",
    terms: "Terms",
  },
};

export function homeCopy(lang: Lang): HomeCopy {
  return lang === "en" ? EN : TR;
}
