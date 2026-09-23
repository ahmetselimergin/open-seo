import { createFileRoute } from "@tanstack/react-router";
import { renderToolsHubHtml } from "@/server/features/health-report/toolsHubHtml";

// Server-rendered, indexable free-tools hub.
function handleHub(request: Request): Response {
  const origin = new URL(request.url).origin;
  return new Response(renderToolsHubHtml(origin), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/araclar")({
  server: {
    handlers: {
      GET: ({ request }) => handleHub(request),
    },
  },
});
