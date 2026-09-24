import { createFileRoute } from "@tanstack/react-router";
import { SnippetToolPage } from "@/client/features/health-report/SnippetToolPage";

export const Route = createFileRoute("/araclar/snippet")({
  head: () => ({
    meta: [
      { title: "SERP Snippet Yazarı — mySeo" },
      {
        name: "description",
        content:
          "Başlık ve meta açıklamanızı yazın; Google önizlemesini ve ideal uzunluğu anında görün.",
      },
    ],
  }),
  component: SnippetToolPage,
});
