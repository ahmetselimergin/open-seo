import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/client/features/health-report/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "mySeo — Ücretsiz SEO Sağlık Raporu" },
      {
        name: "description",
        content:
          "Alan adınızı girin, sitenizin ücretsiz SEO sağlık karnesini saniyeler içinde alın.",
      },
    ],
  }),
  component: HomePage,
});
