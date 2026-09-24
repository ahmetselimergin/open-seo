import type { Lang } from "@/client/features/health-report/i18n";

// Copy for the client tool pages (kept separate so i18n.tsx stays under the
// max-lines limit). Dynamic detail strings are functions.

export interface ToolsCopy {
  allTools: string;
  check: string;
  loading: string;
  connError: string;
  genericError: string;
  meta: {
    title: string;
    accent: string;
    subtitle: string;
    placeholder: string;
    googlePreview: string;
    socialPreview: string;
    checks: string;
    noTitle: string;
    noDesc: string;
    invalid: string;
    lTitle: string;
    lDesc: string;
    lH1: string;
    lCanonical: string;
    lOg: string;
    lIndexable: string;
    dTitle: (len: number, has: boolean) => string;
    dDesc: (len: number, has: boolean) => string;
    dH1: (n: number) => string;
    dCanonical: (url: string | null) => string;
    dOg: (has: boolean) => string;
    dIndexable: (ok: boolean) => string;
  };
  robots: {
    title: string;
    accent: string;
    subtitle: string;
    placeholder: string;
    checks: string;
    sitemaps: string;
    robotsFile: string;
    lRobots: string;
    lOpen: string;
    lSitemap: string;
    dRobots: (found: boolean) => string;
    dOpen: (blocks: boolean) => string;
    dSitemap: (any: boolean, total: number) => string;
    sitemapCount: (isIndex: boolean, n: number) => string;
  };
  snippet: {
    title: string;
    accent: string;
    subtitle: string;
    fTitle: string;
    fDesc: string;
    fUrl: string;
    chars: string;
    phTitle: string;
    phDesc: string;
    phUrl: string;
    previewTitle: string;
    previewDesc: string;
    previewUrl: string;
    googlePreview: string;
  };
}

const TR: ToolsCopy = {
  allTools: "Tüm araçlar",
  check: "Kontrol et",
  loading: "…",
  connError: "Bağlantı hatası, tekrar deneyin.",
  genericError: "Bir hata oluştu.",
  meta: {
    title: "Meta etiket",
    accent: "kontrolü",
    subtitle:
      "Bir sayfanın başlık, açıklama ve paylaşım etiketlerini görün; Google ve sosyal medyada nasıl göründüğünü önizleyin.",
    placeholder: "siteniz.com/sayfa",
    googlePreview: "Google önizlemesi",
    socialPreview: "Sosyal medya önizlemesi",
    checks: "Kontroller",
    noTitle: "(başlık yok)",
    noDesc: "(açıklama yok)",
    invalid: "Geçerli bir adres girin.",
    lTitle: "Başlık etiketi",
    lDesc: "Meta açıklama",
    lH1: "Tek H1 başlığı",
    lCanonical: "Canonical adres",
    lOg: "Sosyal paylaşım görseli (og:image)",
    lIndexable: "İndekslenebilir",
    dTitle: (len, has) =>
      has ? `${len} karakter (ideal 10–60).` : "Başlık bulunamadı.",
    dDesc: (len, has) =>
      has ? `${len} karakter (ideal 70–160).` : "Açıklama bulunamadı.",
    dH1: (n) => `${n} adet H1 bulundu (ideal 1).`,
    dCanonical: (url) => url ?? "Canonical etiketi yok.",
    dOg: (has) => (has ? "Mevcut." : "og:image bulunamadı."),
    dIndexable: (ok) =>
      ok ? "Sayfa arama motorlarına açık." : "Sayfa noindex ile engellenmiş.",
  },
  robots: {
    title: "robots.txt & sitemap",
    accent: "kontrolü",
    subtitle:
      "Sitenizin arama motorlarına açık olup olmadığını ve site haritanızı saniyeler içinde kontrol edin.",
    placeholder: "siteniz.com",
    checks: "Kontroller",
    sitemaps: "Site haritaları",
    robotsFile: "robots.txt",
    lRobots: "robots.txt",
    lOpen: "Arama motorlarına açık",
    lSitemap: "Site haritası (sitemap)",
    dRobots: (found) => (found ? "Bulundu." : "robots.txt bulunamadı."),
    dOpen: (blocks) =>
      blocks
        ? "robots.txt tüm sayfaları engelliyor (Disallow: /)."
        : "Site taranmaya açık.",
    dSitemap: (any, total) =>
      any ? `${total} adres bulundu.` : "Sitemap bulunamadı.",
    sitemapCount: (isIndex, n) => (isIndex ? `${n} sitemap` : `${n} adres`),
  },
  snippet: {
    title: "SERP snippet",
    accent: "yazarı",
    subtitle:
      "Başlık ve açıklamanızı yazın; Google'da nasıl görüneceğini ve ideal uzunlukta olup olmadığını anında görün.",
    fTitle: "Başlık",
    fDesc: "Meta açıklama",
    fUrl: "Görünen adres (opsiyonel)",
    chars: "karakter",
    phTitle: "Örn: El Yapımı Deri Cüzdanlar | Marka",
    phDesc: "Sayfayı özetleyen, tıklamaya teşvik eden bir cümle…",
    phUrl: "siteniz.com › kategori › sayfa",
    previewTitle: "Sayfa başlığınız burada görünür",
    previewDesc:
      "Meta açıklamanız burada görünür. Aramada tıklamayı artıracak, sayfayı özetleyen bir cümle yazın.",
    previewUrl: "siteniz.com › sayfa",
    googlePreview: "Google önizlemesi",
  },
};

const EN: ToolsCopy = {
  allTools: "All tools",
  check: "Check",
  loading: "…",
  connError: "Connection error, please try again.",
  genericError: "Something went wrong.",
  meta: {
    title: "Meta tag",
    accent: "checker",
    subtitle:
      "See a page's title, description and share tags; preview how it looks on Google and social media.",
    placeholder: "yoursite.com/page",
    googlePreview: "Google preview",
    socialPreview: "Social media preview",
    checks: "Checks",
    noTitle: "(no title)",
    noDesc: "(no description)",
    invalid: "Enter a valid address.",
    lTitle: "Title tag",
    lDesc: "Meta description",
    lH1: "Single H1 heading",
    lCanonical: "Canonical URL",
    lOg: "Social share image (og:image)",
    lIndexable: "Indexable",
    dTitle: (len, has) =>
      has ? `${len} characters (ideal 10–60).` : "No title found.",
    dDesc: (len, has) =>
      has ? `${len} characters (ideal 70–160).` : "No description found.",
    dH1: (n) => `${n} H1 found (ideal 1).`,
    dCanonical: (url) => url ?? "No canonical tag.",
    dOg: (has) => (has ? "Present." : "No og:image found."),
    dIndexable: (ok) =>
      ok ? "Page is open to search engines." : "Page is blocked with noindex.",
  },
  robots: {
    title: "robots.txt & sitemap",
    accent: "check",
    subtitle:
      "Check whether your site is open to search engines and whether you have a sitemap, in seconds.",
    placeholder: "yoursite.com",
    checks: "Checks",
    sitemaps: "Sitemaps",
    robotsFile: "robots.txt",
    lRobots: "robots.txt",
    lOpen: "Open to search engines",
    lSitemap: "Sitemap",
    dRobots: (found) => (found ? "Found." : "No robots.txt found."),
    dOpen: (blocks) =>
      blocks
        ? "robots.txt blocks all pages (Disallow: /)."
        : "Site is open to crawling.",
    dSitemap: (any, total) =>
      any ? `${total} URLs found.` : "No sitemap found.",
    sitemapCount: (isIndex, n) => (isIndex ? `${n} sitemaps` : `${n} URLs`),
  },
  snippet: {
    title: "SERP snippet",
    accent: "writer",
    subtitle:
      "Write your title and description and instantly see how it looks on Google and whether the length is ideal.",
    fTitle: "Title",
    fDesc: "Meta description",
    fUrl: "Displayed URL (optional)",
    chars: "characters",
    phTitle: "e.g. Handmade Leather Wallets | Brand",
    phDesc: "A sentence that summarizes the page and invites a click…",
    phUrl: "yoursite.com › category › page",
    previewTitle: "Your page title appears here",
    previewDesc:
      "Your meta description appears here. Write a sentence that summarizes the page and boosts clicks in search.",
    previewUrl: "yoursite.com › page",
    googlePreview: "Google preview",
  },
};

export function toolsCopy(lang: Lang): ToolsCopy {
  return lang === "en" ? EN : TR;
}
