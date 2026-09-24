import { createFileRoute } from "@tanstack/react-router";
import { PageSpeedToolPage } from "@/client/features/health-report/PageSpeedToolPage";

export const Route = createFileRoute("/araclar/hiz")({
  head: () => ({
    meta: [
      { title: "Sayfa Hızı & Core Web Vitals — mySeo" },
      {
        name: "description",
        content:
          "Sayfanızın mobil performans skorunu ve Core Web Vitals metriklerini (LCP, CLS, TBT) ücretsiz ölçün.",
      },
    ],
  }),
  component: PageSpeedToolPage,
});
