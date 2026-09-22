import { createFileRoute } from "@tanstack/react-router";
import { unsubscribeByToken } from "@/server/features/health-report/monitor-store";

// One-click unsubscribe from weekly monitoring (linked in every alert email).
async function handleUnsubscribe(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const ok = token ? await unsubscribeByToken(token) : false;
  const message = ok
    ? "Haftalık izleme aboneliğiniz iptal edildi."
    : "Bağlantı geçersiz ya da abonelik zaten iptal edilmiş.";

  return new Response(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Abonelik — mySeo</title>
<style>body{background:#070a0f;color:#eef2f8;font-family:ui-sans-serif,system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center}a{color:#35c6f4}</style>
</head><body><div><h1>${ok ? "İptal edildi" : "İşlem yapılamadı"}</h1>
<p>${message}</p><p><a href="${url.origin}/">mySeo ana sayfa →</a></p></div></body></html>`,
    {
      status: ok ? 200 : 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

export const Route = createFileRoute("/api/health-report/monitor/unsubscribe")({
  server: {
    handlers: {
      GET: ({ request }) => handleUnsubscribe(request),
    },
  },
});
