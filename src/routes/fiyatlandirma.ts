import { createFileRoute } from "@tanstack/react-router";
import { renderPricingHtml } from "@/server/features/health-report/pricingHtml";
import {
  hasLangOverride,
  langCookie,
  resolveLang,
} from "@/server/features/health-report/serverLang";

// Server-rendered, indexable, bilingual pricing page.
function handlePricing(request: Request): Response {
  const origin = new URL(request.url).origin;
  const lang = resolveLang(request);
  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, max-age=300",
    Vary: "Accept-Language, Cookie",
  };
  if (hasLangOverride(request)) headers["Set-Cookie"] = langCookie(lang);
  return new Response(renderPricingHtml(origin, lang), {
    status: 200,
    headers,
  });
}

export const Route = createFileRoute("/fiyatlandirma")({
  server: {
    handlers: {
      GET: ({ request }) => handlePricing(request),
    },
  },
});
