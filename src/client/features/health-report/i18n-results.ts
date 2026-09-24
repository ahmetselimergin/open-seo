import type { Lang } from "@/client/features/health-report/i18n";

// UI-chrome copy for the report result view (Results.tsx) and the compare page
// (ComparePage.tsx). The report *content* (issue titles, action tasks, grade,
// summary) is localized separately via localizeReport in shared/health-report.

export interface ResultsCopy {
  getOwnReport: string;
  newReport: string;
  download: string;
  overallScore: string;
  pagesScanned: (n: number) => string;
  firstN: (n: number) => string;
  critical: string;
  warning: string;
  info: string;
  noIssuesTitle: string;
  noIssuesBody: string;
  topProblems: string;
  detectedOn: (n: number) => string;
  whatItMeans: string;
  howToFix: string;
  planHeading: string;
  completed: (done: number, total: number) => string;
  weekLabel: (n: number) => string;
  footerHeading: string;
  footerBody: string;
  footerButton: string;
}

export interface CompareCopy {
  singleScan: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  yourSite: string;
  competitor: string;
  yourPlaceholder: string;
  rivalPlaceholder: string;
  scanning: string;
  compareBtn: string;
  genericError: string;
  connError: string;
  ahead: (you: string, rival: string, diff: number) => string;
  behind: (rival: string, diff: number) => string;
  tie: string;
  winBadge: string;
  pagesGrade: (pages: number, grade: string) => string;
  critical: string;
  warning: string;
}

const RESULTS_TR: ResultsCopy = {
  getOwnReport: "Kendi raporunu al",
  newReport: "Yeni rapor",
  download: "İndir",
  overallScore: "Genel sağlık skoru",
  pagesScanned: (n) => `${n} sayfa tarandı`,
  firstN: (n) => ` · ilk ${n} sayfa`,
  critical: "Acil",
  warning: "Orta",
  info: "Küçük",
  noIssuesTitle: "Sorun bulunamadı",
  noIssuesBody:
    "Taranan sayfalarda acil bir sorun çıkmadı. Aşağıdaki plan sitenizi daha da güçlendirmenize yardımcı olur.",
  topProblems: "Öncelikli 3 sorun",
  detectedOn: (n) => `${n} sayfada tespit edildi`,
  whatItMeans: "Ne anlama geliyor?",
  howToFix: "Nasıl düzeltilir?",
  planHeading: "30 günlük eylem planı",
  completed: (done, total) => `${done}/${total} tamamlandı`,
  weekLabel: (n) => `${n}. hafta`,
  footerHeading: "Daha derin bir analiz mi istiyorsunuz?",
  footerBody:
    "mySeo ile rakip analizi, anahtar kelime araştırması, sıralama takibi ve tam site denetimini tek yerde yapın.",
  footerButton: "mySeo'yu keşfet",
};

const RESULTS_EN: ResultsCopy = {
  getOwnReport: "Get your own report",
  newReport: "New report",
  download: "Download",
  overallScore: "Overall health score",
  pagesScanned: (n) => `${n} pages scanned`,
  firstN: (n) => ` · first ${n} pages`,
  critical: "Urgent",
  warning: "Moderate",
  info: "Minor",
  noIssuesTitle: "No issues found",
  noIssuesBody:
    "No urgent issues came up on the scanned pages. The plan below helps you strengthen your site even further.",
  topProblems: "Top 3 issues",
  detectedOn: (n) => `Detected on ${n} pages`,
  whatItMeans: "What does it mean?",
  howToFix: "How to fix it?",
  planHeading: "30-day action plan",
  completed: (done, total) => `${done}/${total} done`,
  weekLabel: (n) => `Week ${n}`,
  footerHeading: "Want a deeper analysis?",
  footerBody:
    "With mySeo, do competitor analysis, keyword research, rank tracking and a full site audit all in one place.",
  footerButton: "Explore mySeo",
};

const COMPARE_TR: CompareCopy = {
  singleScan: "Tek site tara",
  title: "İki siteyi",
  titleAccent: "karşılaştır",
  subtitle: "Seninki ile rakibini yan yana koy; kim önde, nerede geride gör.",
  yourSite: "Senin siten",
  competitor: "Rakip",
  yourPlaceholder: "siteniz.com",
  rivalPlaceholder: "rakip.com",
  scanning: "Taranıyor…",
  compareBtn: "Karşılaştır",
  genericError: "Beklenmeyen bir hata oluştu.",
  connError: "Bağlantı hatası, tekrar deneyin.",
  ahead: (you, rival, diff) =>
    `Öndesin! ${you}, ${rival} sitesinden ${diff} puan yüksek.`,
  behind: (rival, diff) =>
    `Rakip önde: ${rival}, seninkinden ${diff} puan yüksek.`,
  tie: "Başa baş! İki site de aynı skorda.",
  winBadge: "Önde",
  pagesGrade: (pages, grade) => `${pages} sayfa · ${grade}`,
  critical: "Acil",
  warning: "Orta",
};

const COMPARE_EN: CompareCopy = {
  singleScan: "Scan a single site",
  title: "Compare two",
  titleAccent: "sites",
  subtitle:
    "Put yours next to a competitor's, side by side — see who's ahead and where you fall behind.",
  yourSite: "Your site",
  competitor: "Competitor",
  yourPlaceholder: "yoursite.com",
  rivalPlaceholder: "competitor.com",
  scanning: "Scanning…",
  compareBtn: "Compare",
  genericError: "An unexpected error occurred.",
  connError: "Connection error, please try again.",
  ahead: (you, rival, diff) =>
    `You're ahead! ${you} is ${diff} points higher than ${rival}.`,
  behind: (rival, diff) =>
    `Competitor ahead: ${rival} is ${diff} points higher than yours.`,
  tie: "Neck and neck! Both sites score the same.",
  winBadge: "Ahead",
  pagesGrade: (pages, grade) => `${pages} pages · ${grade}`,
  critical: "Urgent",
  warning: "Moderate",
};

export function resultsCopy(lang: Lang): ResultsCopy {
  return lang === "en" ? RESULTS_EN : RESULTS_TR;
}

export function compareCopy(lang: Lang): CompareCopy {
  return lang === "en" ? COMPARE_EN : COMPARE_TR;
}
