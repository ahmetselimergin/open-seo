import { createFileRoute } from "@tanstack/react-router";
import { ComparePage } from "@/client/features/health-report/ComparePage";

export const Route = createFileRoute("/karsilastir")({
  head: () => ({
    meta: [
      { title: "İki siteyi karşılaştır — mySeo" },
      {
        name: "description",
        content:
          "Sitenizi rakibinizle yan yana koyun; SEO skorlarını ve sorunları karşılaştırın.",
      },
    ],
  }),
  component: ComparePage,
});
