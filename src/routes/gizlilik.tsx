import { createFileRoute } from "@tanstack/react-router";
import {
  LegalPage,
  type LegalContent,
} from "@/client/features/health-report/LegalPage";
import { getHomeMeta } from "@/serverFunctions/homeMeta";

const HEAD = {
  tr: {
    title: "Gizlilik Politikası — mySeo",
    description: "mySeo hangi verileri, neden ve ne kadar süreyle işler.",
  },
  en: {
    title: "Privacy Policy — mySeo",
    description: "What data mySeo processes, why, and for how long.",
  },
} as const;

const TR: LegalContent = {
  title: "Gizlilik Politikası",
  updated: "22 Eylül 2026",
  intro:
    "mySeo, sitenizin SEO sağlığını ölçen ücretsiz bir araçtır. Bu politika, hizmeti kullanırken hangi verileri işlediğimizi, neden işlediğimizi ve haklarınızı açıklar.",
  sections: [
    {
      heading: "1. İşlediğimiz veriler",
      body: [
        "Taradığınız alan adı ve tarama sonucunda oluşan teknik rapor verileri.",
        "İsteğe bağlı olarak verdiğiniz e-posta adresi (raporu göndermek ve/veya haftalık izleme uyarıları için).",
        "Kötüye kullanımı önlemek ve anonim kullanım istatistiği tutmak için IP adresiniz — ham hâlde saklanmaz, gün bazında geri döndürülemez şekilde özetlenir (hash).",
      ],
    },
    {
      heading: "2. Verileri ne için kullanıyoruz",
      body: [
        "SEO sağlık raporunuzu oluşturmak ve göstermek.",
        "Talep ederseniz raporu e-posta ile iletmek ve haftalık izleme kapsamında skor değişimlerinde sizi bilgilendirmek.",
        "Hizmeti kötüye kullanıma karşı korumak (istek sınırlama) ve ürünü geliştirmek için anonim kullanım analizi.",
      ],
    },
    {
      heading: "3. Saklama süresi",
      body: [
        "Oluşturulan raporlar en fazla 90 gün sonra otomatik olarak silinir.",
        "Haftalık izleme aboneliğiniz, siz iptal edene kadar saklanır; her uyarı e-postasındaki bağlantıyla tek tıkla çıkabilirsiniz.",
      ],
    },
    {
      heading: "4. Üçüncü taraf hizmetler",
      body: [
        "Barındırma için Cloudflare, e-posta gönderimi için Loops, anonim analiz için PostHog kullanıyoruz.",
        "Verilerinizi üçüncü taraflara satmıyoruz veya pazarlama amacıyla paylaşmıyoruz.",
      ],
    },
    {
      heading: "5. Haklarınız (KVKK)",
      body: [
        "6698 sayılı KVKK kapsamında; verilerinize erişme, düzeltilmesini veya silinmesini isteme ve işlenmesine itiraz etme haklarına sahipsiniz.",
        "Bu haklarınızı kullanmak veya izlemeden çıkmak için bize e-posta ile ulaşabilirsiniz.",
      ],
    },
    {
      heading: "6. Çerezler",
      body: [
        "Reklam veya takip çerezi kullanmıyoruz. Yalnızca sayfanın çalışması için gereken işlevsel yerel depolamayı kullanırız.",
      ],
    },
    {
      heading: "7. Değişiklikler",
      body: [
        "Bu politikayı zaman zaman güncelleyebiliriz; güncel sürüm her zaman bu sayfada yayınlanır.",
      ],
    },
  ],
};

const EN: LegalContent = {
  title: "Privacy Policy",
  updated: "September 22, 2026",
  intro:
    "mySeo is a free tool that measures your site's SEO health. This policy explains what data we process while you use the service, why we process it, and your rights.",
  sections: [
    {
      heading: "1. Data we process",
      body: [
        "The domain you scan and the technical report data produced by the scan.",
        "The email address you optionally provide (to send the report and/or weekly monitoring alerts).",
        "Your IP address, to prevent abuse and keep anonymous usage statistics — it is not stored raw; it is irreversibly summarized (hashed) on a daily basis.",
      ],
    },
    {
      heading: "2. What we use the data for",
      body: [
        "To generate and display your SEO health report.",
        "To email you the report on request and, under weekly monitoring, to notify you of score changes.",
        "To protect the service against abuse (rate limiting) and to improve the product through anonymous usage analytics.",
      ],
    },
    {
      heading: "3. Retention",
      body: [
        "Generated reports are automatically deleted after at most 90 days.",
        "Your weekly monitoring subscription is kept until you cancel it; you can opt out with one click via the link in every alert email.",
      ],
    },
    {
      heading: "4. Third-party services",
      body: [
        "We use Cloudflare for hosting, Loops for email delivery, and PostHog for anonymous analytics.",
        "We do not sell your data to third parties or share it for marketing purposes.",
      ],
    },
    {
      heading: "5. Your rights (GDPR/KVKK)",
      body: [
        "You have the right to access your data, request its correction or deletion, and object to its processing.",
        "To exercise these rights or to opt out of monitoring, you can reach us by email.",
      ],
    },
    {
      heading: "6. Cookies",
      body: [
        "We use no advertising or tracking cookies. We use only the functional local storage needed for the page to work.",
      ],
    },
    {
      heading: "7. Changes",
      body: [
        "We may update this policy from time to time; the current version is always published on this page.",
      ],
    },
  ],
};

export const Route = createFileRoute("/gizlilik")({
  loader: () => getHomeMeta(),
  head: ({ loaderData }) => {
    const c = HEAD[loaderData?.lang ?? "tr"];
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
      ],
    };
  },
  component: () => <LegalPage tr={TR} en={EN} />,
});
