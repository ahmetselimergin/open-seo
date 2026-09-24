import { createFileRoute } from "@tanstack/react-router";
import { RobotsToolPage } from "@/client/features/health-report/RobotsToolPage";

export const Route = createFileRoute("/araclar/robots")({
  head: () => ({
    meta: [
      { title: "robots.txt & Sitemap Kontrolü — mySeo" },
      {
        name: "description",
        content:
          "Sitenizin robots.txt ve sitemap.xml dosyalarını kontrol edin; arama motorlarına açık mı, site haritanız var mı öğrenin.",
      },
    ],
  }),
  component: RobotsToolPage,
});
