import { createFileRoute } from "@tanstack/react-router";

// Public robots for the mySeo marketing surface. The homepage, shared reports
// and legal pages are crawlable; the authenticated app and API are not.
function handleRobots(request: Request): Response {
  const origin = new URL(request.url).origin;
  const body = [
    "User-agent: *",
    "Allow: /$",
    "Allow: /report/",
    "Allow: /araclar",
    "Allow: /fiyatlandirma",
    "Allow: /karsilastir",
    "Allow: /rehber",
    "Allow: /gizlilik",
    "Allow: /kullanim-kosullari",
    "Disallow: /app",
    "Disallow: /p/",
    "Disallow: /api/",
    "Disallow: /r/",
    "Disallow: /s/",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => handleRobots(request),
    },
  },
});
