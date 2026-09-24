/**
 * Plain-Turkish, jargon-free copy for each audit issue type, plus its slot in
 * the 30-day action plan. Kept separate from the report logic so the (long)
 * copy table doesn't bury the scoring code.
 *
 * Keyed by the same issue type ids as the shared registry in audit-issues.ts;
 * `getIssueCopy` looks copy up safely for an arbitrary string.
 */
import type { AuditIssueType } from "@/shared/audit-issues";
import { EN_ISSUE_COPY } from "@/shared/health-report-copy-en";

/** Report language. Kept local so this shared module has no client dependency. */
export type ReportLang = "tr" | "en";

export interface IssueCopy {
  title: string;
  whatItMeans: string;
  howToFix: string;
  /** Suggested week (1–4) in the 30-day plan; lower = more urgent. */
  week: number;
  /** Imperative checklist task for the action plan. */
  task: string;
}

const ISSUE_COPY: Record<AuditIssueType, IssueCopy> = {
  "blocked-page": {
    title: "Sayfa taranamadı (erişim engellendi)",
    whatItMeans:
      "Site, tarayıcımıza bir güvenlik/bot engeli gösterdi. Google gibi arama motorları da benzer bir engelle karşılaşıp sayfayı göremeyebilir.",
    howToFix:
      "Site güvenlik ayarlarınızda (ör. Cloudflare bot koruması) arama motoru ve denetim botlarına izin verin, sonra raporu yenileyin.",
    week: 1,
    task: "Bot/güvenlik engeli nedeniyle taranamayan sayfalara arama motorlarının erişebildiğini doğrulayın.",
  },
  "rate-limited-page": {
    title: "Sayfa çok fazla istek uyarısı verdi",
    whatItMeans:
      "Sunucu, kısa sürede gelen isteklere 'çok fazla istek' yanıtı verdi ve sayfa taranamadı.",
    howToFix:
      "Sunucunuzun istek sınırlarını gözden geçirin veya arama/denetim botları için sınırı yükseltin.",
    week: 2,
    task: "Sunucu istek sınırlarını (rate limit) tarayıcılar için gevşetin.",
  },
  "crawl-rate-limited": {
    title: "Tarama erken durdu (hız sınırı)",
    whatItMeans:
      "Site beklememizi istediği için tarama tamamlanamadı; rapor eksik olabilir.",
    howToFix:
      "Sitenin hız sınırı sıfırlandıktan sonra tekrar deneyin veya botlara izin verin.",
    week: 2,
    task: "Hız sınırı nedeniyle yarım kalan taramayı sınır ayarlarını düzelttikten sonra tekrarlayın.",
  },
  "server-error": {
    title: "Sunucu hatası veren sayfalar (5xx)",
    whatItMeans:
      "Bazı sayfalar açılırken sunucu hatası veriyor. Google böyle sayfaları daha az tarar ve zamanla listeden düşürebilir.",
    howToFix:
      "Sunucu kayıtlarına bakıp hatanın kaynağını giderin. Sayfa artık yoksa 404/410 döndürün ya da uygun bir sayfaya yönlendirin.",
    week: 1,
    task: "Sunucu hatası (5xx) veren sayfaları onarın ya da doğru şekilde yönlendirin.",
  },
  "broken-internal-link": {
    title: "Kırık iç bağlantılar",
    whatItMeans:
      "Bazı sayfalarınız, sitenizde artık çalışmayan (hata veren) sayfalara bağlantı veriyor. Bu hem ziyaretçiyi hem de Google'ı çıkmaza sokar.",
    howToFix:
      "Bağlantıyı doğru ve çalışan adrese güncelleyin ya da kaldırın. Sayfa taşındıysa doğrudan yeni adrese bağlantı verin.",
    week: 1,
    task: "Kırık iç bağlantıları doğru adreslerle güncelleyin veya kaldırın.",
  },
  "missing-title": {
    title: "Başlık etiketi eksik sayfalar",
    whatItMeans:
      "Bazı sayfaların başlığı (title) yok. Başlık, arama sonuçlarında görünen ana metindir; olmadığında Google kendi (genelde kötü) başlığını yazar.",
    howToFix:
      "Her sayfaya, konusunu içeren, 50–60 karakterlik özgün bir başlık ekleyin.",
    week: 1,
    task: "Başlığı olmayan her sayfaya özgün, açıklayıcı bir başlık ekleyin.",
  },
  "broken-page": {
    title: "Bulunamayan sayfalar (4xx)",
    whatItMeans:
      "Bazı adresler açılmıyor (ör. 404). Bu adreslere hâlâ bağlantı varsa hem ziyaretçi hem arama motoru boşa yönlendirilir.",
    howToFix:
      "Sayfa olması gerekiyorsa geri getirin. Kalkacaksa site haritası ve iç bağlantılardan kaldırıp en yakın sayfaya 301 yönlendirin.",
    week: 1,
    task: "Bulunamayan (404) sayfaları geri getirin veya uygun sayfalara yönlendirin.",
  },
  "duplicate-title": {
    title: "Aynı başlığı paylaşan sayfalar",
    whatItMeans:
      "Birden fazla sayfa aynı başlığı kullanıyor. Google sayfaları başlıklarıyla ayırt eder; aynı başlıklar sayfaları birbiriyle yarıştırır.",
    howToFix:
      "Her sayfaya, içeriğini anlatan özgün bir başlık yazın. Şablon sayfalarda ayırt edici bilgiyi (isim, kategori, konum) başlığa ekleyin.",
    week: 2,
    task: "Aynı başlığı paylaşan sayfalara özgün başlıklar yazın.",
  },
  "duplicate-meta-description": {
    title: "Aynı açıklamayı paylaşan sayfalar",
    whatItMeans:
      "Birden fazla sayfa aynı meta açıklamayı kullanıyor; arama sonuçlarında aynı özet görünür ve sayfalar birbirinden ayırt edilemez.",
    howToFix:
      "Her sayfaya özgün bir açıklama yazın veya tekrarlananı kaldırın (Google metinden kendi özetini üretir).",
    week: 3,
    task: "Tekrarlanan meta açıklamaları özgün hale getirin.",
  },
  "duplicate-content": {
    title: "Aynı içeriğe sahip sayfalar",
    whatItMeans:
      "İki veya daha fazla adres birebir aynı içeriği gösteriyor. Google birini seçip diğerlerini yok sayar ve puan bölünür.",
    howToFix:
      "Bir ana adres belirleyip diğerlerine rel=canonical ekleyin ve mümkünse 301 ile yönlendirin.",
    week: 3,
    task: "Aynı içeriği gösteren adresleri tek bir ana adreste birleştirin.",
  },
  "missing-meta-description": {
    title: "Meta açıklama eksik sayfalar",
    whatItMeans:
      "Bazı sayfaların meta açıklaması yok. Google metinden bir özet üretir; bu genelde daha az ilgi çeker ve tıklama oranını düşürür.",
    howToFix:
      "Her sayfaya, sayfayı özetleyen ve tıklamaya teşvik eden 70–160 karakterlik bir açıklama ekleyin.",
    week: 2,
    task: "Açıklaması eksik sayfalara tıklamaya teşvik eden meta açıklamalar ekleyin.",
  },
  "missing-h1": {
    title: "Ana başlık (H1) eksik sayfalar",
    whatItMeans:
      "Bazı sayfalarda ana başlık (H1) yok. H1, sayfanın ne hakkında olduğunu hem kullanıcıya hem Google'a söyler.",
    howToFix:
      "Her sayfaya, sayfanın ana konusunu belirten tek bir H1 başlığı ekleyin.",
    week: 2,
    task: "Ana başlığı (H1) olmayan sayfalara tek ve net bir H1 ekleyin.",
  },
  "multiple-h1": {
    title: "Birden fazla ana başlık (H1)",
    whatItMeans:
      "Bazı sayfalarda birden çok H1 var; bu, ana konu sinyalini zayıflatır ve genelde bir şablon hatasıdır.",
    howToFix:
      "Sayfanın ana başlığı için tek bir H1 bırakın, diğerlerini H2/H3 yapın.",
    week: 3,
    task: "Birden fazla H1 içeren sayfalarda tek bir ana başlık bırakın.",
  },
  "redirect-chain": {
    title: "Zincirleme yönlendirmeler",
    whatItMeans:
      "Son sayfaya ulaşmak için üst üste birden çok yönlendirme gerekiyor. Bu hem yavaşlatır hem de tarama bütçesini boşa harcar.",
    howToFix:
      "İlk adresi (ve iç bağlantıları) doğrudan son hedefe yöneltin; en fazla tek yönlendirme kalsın.",
    week: 3,
    task: "Zincirleme yönlendirmeleri tek adıma indirin.",
  },
  "redirect-loop": {
    title: "Sonsuz yönlendirme döngüsü",
    whatItMeans:
      "Bir adres kendine dönen bir döngüde; sayfa hiç açılmıyor ve tarayıcılar hata verip vazgeçiyor.",
    howToFix:
      "Bu adresin yönlendirme kurallarını izleyip döngüyü kırın; zincir gerçek bir 200 sayfada bitmeli.",
    week: 1,
    task: "Sonsuz yönlendirme döngülerini kırın.",
  },
  "canonical-conflict": {
    title: "Çelişkili canonical sinyalleri",
    whatItMeans:
      "Sayfa, HTML ve HTTP başlığında farklı canonical adresler bildiriyor. Sinyaller çelişince Google ikisini de yok sayıp kendi seçimini yapar.",
    howToFix:
      "Tek bir canonical adres belirleyip yalnızca tek yerde (genelde HTML head) bildirin.",
    week: 3,
    task: "Çelişen canonical bildirimlerini tek ve tutarlı hale getirin.",
  },
  "thin-content": {
    title: "İçeriği çok az sayfalar",
    whatItMeans:
      "Bazı sayfalarda görünür metin çok az. Zayıf içerikli sayfalar nadiren sıralanır ve sitenin genel kalitesini düşürebilir.",
    howToFix:
      "Sayfayı gerçekten faydalı içerikle genişletin, indekslemeyin (noindex) veya daha güçlü bir sayfayla birleştirin.",
    week: 4,
    task: "İçeriği zayıf sayfaları güçlendirin veya birleştirin.",
  },
  "images-missing-alt": {
    title: "Alternatif metni (alt) eksik görseller",
    whatItMeans:
      "Bazı görsellerin alt metni yok. Alt metni hem erişilebilirlik için gerekli hem de Google'ın görseli anlamasının ana yoludur.",
    howToFix:
      'Anlamlı görsellere açıklayıcı alt metni ekleyin; yalnızca dekoratif görsellerde boş alt (alt="") kullanın.',
    week: 4,
    task: "Alt metni eksik görsellere açıklayıcı alt metinleri ekleyin.",
  },
  "orphan-page": {
    title: "Bağlantısız (yetim) sayfalar",
    whatItMeans:
      "Bu sayfalara hiçbir sayfadan bağlantı verilmemiş; yalnızca site haritasından bulunabiliyorlar. Böyle sayfalar az taranır ve az değer alır.",
    howToFix:
      "İlgili sayfalardan (menü, ilgili içerik, kategori) bu sayfalara bağlantı verin.",
    week: 4,
    task: "Bağlantısız sayfalara ilgili sayfalardan iç bağlantılar verin.",
  },
  "no-outgoing-links": {
    title: "Hiç bağlantı vermeyen sayfalar",
    whatItMeans:
      "Bazı sayfalarda hiç bağlantı yok; bir çıkmaz sokak gibi. Tarayıcının gidecek yeri kalmaz, kullanıcı geri dönmek zorunda kalır.",
    howToFix:
      "İlgili sayfalara, üst kategoriye veya ana sayfaya bağlantılar ekleyin.",
    week: 4,
    task: "Hiç bağlantı vermeyen sayfalara ilgili bağlantılar ekleyin.",
  },
  "title-too-long": {
    title: "Başlığı çok uzun sayfalar",
    whatItMeans:
      "Başlık ~60 karakteri aşıyor; arama sonuçlarında sonu kesilir.",
    howToFix:
      "Başlığı 50–60 karaktere indirin ve en önemli kelimeleri başa alın.",
    week: 4,
    task: "Çok uzun başlıkları 50–60 karaktere kısaltın.",
  },
  "title-too-short": {
    title: "Başlığı çok kısa sayfalar",
    whatItMeans:
      "Başlık ~10 karakterin altında; sayfayı anlatmak ve tıklama çekmek için genelde yetersiz.",
    howToFix:
      "Başlığı, sayfanın ne sunduğunu anlatan 30–60 karakterlik bir ifadeye genişletin.",
    week: 4,
    task: "Çok kısa başlıkları açıklayıcı hale getirin.",
  },
  "meta-description-too-long": {
    title: "Meta açıklaması çok uzun sayfalar",
    whatItMeans:
      "Açıklama ~160 karakteri aşıyor; arama sonucundaki özet kesilir.",
    howToFix:
      "Açıklamayı, ana mesajı ve çağrıyı koruyarak 70–160 karaktere indirin.",
    week: 4,
    task: "Çok uzun meta açıklamaları 70–160 karaktere kısaltın.",
  },
  "meta-description-too-short": {
    title: "Meta açıklaması çok kısa sayfalar",
    whatItMeans:
      "Açıklama ~70 karakterin altında; arama sonucundaki alanı boşa harcar.",
    howToFix: "Açıklamayı, sayfayı özetleyen 70–160 karaktere genişletin.",
    week: 4,
    task: "Çok kısa meta açıklamaları genişletin.",
  },
  "heading-order-skip": {
    title: "Başlık düzeyleri atlanmış sayfalar",
    whatItMeans:
      "Başlık sırası atlıyor (ör. H2'den sonra doğrudan H4). Bu, belgenin yapısını zayıflatır.",
    howToFix:
      "Başlık düzeylerini atlamadan birer birer ilerletin (H1 → H2 → H3).",
    week: 4,
    task: "Başlık düzeylerini doğru sıraya (H1→H2→H3) getirin.",
  },
  "slow-response": {
    title: "Yavaş açılan sayfalar",
    whatItMeans:
      "Bazı sayfaların sunucu yanıtı 1,5 saniyeden uzun. Yavaş yanıt tüm hız ölçümlerini kötüleştirir ve tarama hızını düşürür.",
    howToFix:
      "Sunucu/veritabanı süresini ve önbelleği inceleyin; önbelleğe alınmış (statik) HTML sunmak genelde çözer.",
    week: 2,
    task: "Yavaş açılan sayfaların sunucu yanıt süresini önbellek/optimizasyonla düşürün.",
  },
  "noindex-page": {
    title: "İndekslenmeyen (noindex) sayfalar",
    whatItMeans:
      "Bazı sayfalar Google'dan indekslenmemesini istiyor. Bu çoğu zaman bilinçlidir; sadece bilgilendirmedir.",
    howToFix:
      "Bu sayfa sıralanmalıysa noindex kuralını kaldırın. Bilinçliyse (yönetim, teşekkür sayfaları) bir şey yapmanıza gerek yok.",
    week: 4,
    task: "Yanlışlıkla noindex yapılmış sayfa var mı kontrol edin.",
  },
  "canonicalized-page": {
    title: "Başka adrese işaret eden (canonical) sayfalar",
    whatItMeans:
      "Bazı sayfalar Google'a 'beni değil şu adresi dizine ekle' diyor. Amaçlıysa sorun değil; bu sayfa sıralanacaksa sorundur.",
    howToFix:
      "Bu sayfa kendi başına sıralanmalıysa canonical'ını kendisine ayarlayın; değilse bir şey yapmayın.",
    week: 4,
    task: "Yanlış canonical ile başka adrese işaret eden sayfaları kontrol edin.",
  },
  "deep-page": {
    title: "Site yapısında çok derinde kalan sayfalar",
    whatItMeans:
      "Bazı sayfalar ana sayfadan 5+ tıklama uzakta. Derin sayfalar daha az taranır ve daha az değer alır.",
    howToFix:
      "Üst seviye sayfalardan (kategori, menü) bu sayfalara bağlantı vererek yolu kısaltın.",
    week: 4,
    task: "Derinde kalan önemli sayfalara üst sayfalardan bağlantı verin.",
  },
};

const copyRegistry: Record<string, IssueCopy> = ISSUE_COPY;
const enRegistry: Record<string, Omit<IssueCopy, "week">> = EN_ISSUE_COPY;

/**
 * Safe lookup for an arbitrary issue-type string; null when unknown.
 * `lang` selects the language ("tr" default); the neutral `week` always comes
 * from the Turkish table so the two languages can't drift on scheduling.
 */
export function getIssueCopy(
  issueType: string,
  lang: ReportLang = "tr",
): IssueCopy | null {
  const tr = copyRegistry[issueType];
  if (!tr) return null;
  if (lang === "en") {
    const en = enRegistry[issueType];
    if (en) return { ...en, week: tr.week };
  }
  return tr;
}
