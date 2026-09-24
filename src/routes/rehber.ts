import { createFileRoute } from "@tanstack/react-router";
import { renderGuideHtml } from "@/server/features/health-report/guideHtml";
import { resolveLang } from "@/server/features/health-report/serverLang";

// Server-rendered SEO guide (indexable content + OpenGraph meta).
function handleGuide(request: Request): Response {
  const origin = new URL(request.url).origin;
  return new Response(renderGuideHtml(origin, resolveLang(request)), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/rehber")({
  server: {
    handlers: {
      GET: ({ request }) => handleGuide(request),
    },
  },
});
