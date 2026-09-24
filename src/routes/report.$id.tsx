import { createFileRoute } from "@tanstack/react-router";
import { getHealthReport } from "@/server/features/health-report/report-store";
import { renderSharedReportHtml } from "@/server/features/health-report/sharedReportHtml";
import { resolveLang } from "@/server/features/health-report/serverLang";

// Server-rendered public share page. Returns real HTML (title + OpenGraph meta
// + readable report) so links preview correctly on social/chat and are
// indexable, which the client-rendered app cannot do.
async function handleSharedReport(
  id: string,
  request: Request,
): Promise<Response> {
  const origin = new URL(request.url).origin;
  const stored = await getHealthReport(id);
  if (!stored) {
    return html(notFoundHtml(origin), 404);
  }
  return html(
    renderSharedReportHtml({
      report: stored.report,
      id,
      origin,
      lang: resolveLang(request),
    }),
    200,
    "public, max-age=300",
  );
}

function html(body: string, status: number, cacheControl?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
  };
  if (cacheControl) headers["Cache-Control"] = cacheControl;
  return new Response(body, { status, headers });
}

function notFoundHtml(origin: string): string {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Rapor bulunamadı — mySeo</title>
<style>body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center}a{color:#35c6f4}</style>
</head><body><div><h1>Rapor bulunamadı</h1>
<p>Bu rapor mevcut değil ya da süresi dolmuş olabilir.</p>
<p><a href="${origin}/">Kendi raporunu al →</a></p></div></body></html>`;
}

export const Route = createFileRoute("/report/$id")({
  server: {
    handlers: {
      GET: ({ params, request }) => handleSharedReport(params.id, request),
    },
  },
});
