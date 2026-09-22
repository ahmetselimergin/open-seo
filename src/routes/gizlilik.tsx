import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/client/features/health-report/LegalPage";

export const Route = createFileRoute("/gizlilik")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası — mySeo" },
      {
        name: "description",
        content: "mySeo hangi verileri, neden ve ne kadar süreyle işler.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      updated="22 Eylül 2026"
      intro="mySeo, sitenizin SEO sağlığını ölçen ücretsiz bir araçtır. Bu politika, hizmeti kullanırken hangi verileri işlediğimizi, neden işlediğimizi ve haklarınızı açıklar."
      sections={[
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
      ]}
    />
  );
}
