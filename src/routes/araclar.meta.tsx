import { createFileRoute } from "@tanstack/react-router";
import { MetaToolPage } from "@/client/features/health-report/MetaToolPage";

export const Route = createFileRoute("/araclar/meta")({
  head: () => ({
    meta: [
      { title: "Meta Etiket Kontrolü — mySeo" },
      {
        name: "description",
        content:
          "Bir sayfanın başlık, açıklama ve OG etiketlerini kontrol edin; Google ve sosyal medya önizlemesini görün.",
      },
    ],
  }),
  component: MetaToolPage,
});
