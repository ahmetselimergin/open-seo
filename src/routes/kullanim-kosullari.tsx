import { createFileRoute } from "@tanstack/react-router";
import {
  LegalPage,
  type LegalContent,
} from "@/client/features/health-report/LegalPage";
import { getHomeMeta } from "@/serverFunctions/homeMeta";

const HEAD = {
  tr: {
    title: "Kullanım Koşulları — mySeo",
    description: "mySeo hizmetini kullanmaya ilişkin koşullar.",
  },
  en: {
    title: "Terms of Use — mySeo",
    description: "The terms for using the mySeo service.",
  },
} as const;

const TR: LegalContent = {
  title: "Kullanım Koşulları",
  updated: "22 Eylül 2026",
  intro:
    "mySeo'yu kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Lütfen dikkatle okuyun.",
  sections: [
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
  ],
};

const EN: LegalContent = {
  title: "Terms of Use",
  updated: "September 22, 2026",
  intro:
    "By using mySeo you accept the following terms. Please read them carefully.",
  sections: [
    {
      heading: "1. Description of the service",
      body: [
        "mySeo is a free tool that crawls a website's publicly available pages to produce an informational SEO health report.",
        "The service is provided 'as is'; no guarantee of uninterrupted or error-free operation is given.",
      ],
    },
    {
      heading: "2. Acceptable use",
      body: [
        "Only scan sites you own or have permission to scan.",
        "Overloading the service with automated/excessive requests, attempting to bypass security measures, or harming others is prohibited. Rate limiting is applied for fair use.",
      ],
    },
    {
      heading: "3. Disclaimer",
      body: [
        "Report results are based on automated analysis and are for informational purposes only; their accuracy or completeness is not guaranteed.",
        "You alone are responsible for the decisions you make based on the report.",
      ],
    },
    {
      heading: "4. Limitation of liability",
      body: [
        "To the maximum extent permitted by applicable law, mySeo cannot be held liable for indirect or consequential damages arising from use of the service.",
      ],
    },
    {
      heading: "5. Changes and termination",
      body: [
        "We reserve the right to change or discontinue the service and these terms without prior notice.",
      ],
    },
  ],
};

export const Route = createFileRoute("/kullanim-kosullari")({
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
