import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/lib/audit/ids";
import { guardPublicPost } from "@/server/features/health-report/abuse";
import { renderProInterestPage } from "@/server/features/health-report/pricingHtml";
import { resolveLang } from "@/server/features/health-report/serverLang";

// Captures Pro early-access interest (email) until billing is wired.
function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handleInterest(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  const origin = new URL(request.url).origin;
  const lang = resolveLang(request);
  let email = "";
  try {
    const form = await request.formData();
    const value = form.get("email");
    email = typeof value === "string" ? value.trim() : "";
  } catch {
    return html(renderProInterestPage(origin, false, lang), 400);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return html(renderProInterestPage(origin, false, lang), 400);
  }

  const hash = await sha256Hex(email.toLowerCase());
  await env.KV.put(
    `pro-interest:${hash}`,
    JSON.stringify({ email, at: new Date().toISOString() }),
  );
  return html(renderProInterestPage(origin, true, lang));
}

export const Route = createFileRoute("/api/account/pro-interest")({
  server: {
    handlers: {
      POST: ({ request }) => handleInterest(request),
    },
  },
});
