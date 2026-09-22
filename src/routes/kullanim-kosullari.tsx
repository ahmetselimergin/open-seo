import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/client/features/health-report/LegalPage";

export const Route = createFileRoute("/kullanim-kosullari")({
  head: () => ({
    meta: [
      { title: "Kullanım Koşulları — mySeo" },
      {
        name: "description",
        content: "mySeo hizmetini kullanmaya ilişkin koşullar.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Kullanım Koşulları"
      updated="22 Eylül 2026"
      intro="mySeo'yu kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Lütfen dikkatle okuyun."
      sections={[
        {
          heading: "1. Hizmetin tanımı",
          body: [
            "mySeo, bir web sitesinin herkese açık sayfalarını tarayarak bilgilendirici bir SEO sağlık raporu üreten ücretsiz bir araçtır.",
            "Hizmet 'olduğu gibi' sunulur; kesintisizlik veya hatasızlık garantisi verilmez.",
          ],
        },
        {
          heading: "2. Kabul edilebilir kullanım",
          body: [
            "Yalnızca sahibi olduğunuz ya da taramak için izniniz olan siteleri tarayın.",
            "Hizmeti otomatik/aşırı istekle yormak, güvenlik önlemlerini aşmaya çalışmak veya başkalarına zarar vermek yasaktır. Adil kullanım için istek sınırlaması uygulanır.",
          ],
        },
        {
          heading: "3. Sorumluluk reddi",
          body: [
            "Rapor sonuçları otomatik analize dayanır ve yalnızca bilgilendirme amaçlıdır; doğruluğu veya eksiksizliği garanti edilmez.",
            "Rapora dayanarak aldığınız kararlardan yalnızca siz sorumlusunuz.",
          ],
        },
        {
          heading: "4. Sorumluluğun sınırı",
          body: [
            "Yürürlükteki hukukun izin verdiği azami ölçüde mySeo, hizmetin kullanımından doğan dolaylı veya sonuçsal zararlardan sorumlu tutulamaz.",
          ],
        },
        {
          heading: "5. Değişiklik ve fesih",
          body: [
            "Hizmeti ve bu koşulları önceden bildirmeksizin değiştirme veya durdurma hakkımız saklıdır.",
          ],
        },
      ]}
    />
  );
}
