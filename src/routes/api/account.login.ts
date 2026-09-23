import { createFileRoute } from "@tanstack/react-router";
import { waitUntil } from "cloudflare:workers";
import { createLoginToken } from "@/server/features/health-report/account-store";
import { sendMagicLinkEmail } from "@/server/features/health-report/report-email";
import { guardPublicPost } from "@/server/features/health-report/abuse";
import { renderLoginPage } from "@/server/features/health-report/accountHtml";

// Passwordless sign-in: emails a magic link. Always shows the same "sent"
// page for valid emails (no account enumeration).
function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handleLogin(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  const origin = new URL(request.url).origin;
  let email = "";
  try {
    const form = await request.formData();
    const value = form.get("email");
    email = typeof value === "string" ? value.trim() : "";
  } catch {
    return html(renderLoginPage(origin, { error: "Geçersiz istek." }), 400);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return html(
      renderLoginPage(origin, { error: "Geçerli bir e-posta girin." }),
      400,
    );
  }

  const token = await createLoginToken(email);
  waitUntil(
    sendMagicLinkEmail({ email, loginUrl: `${origin}/hesap?token=${token}` }),
  );
  return html(renderLoginPage(origin, { sent: true }));
}

export const Route = createFileRoute("/api/account/login")({
  server: {
    handlers: {
      POST: ({ request }) => handleLogin(request),
    },
  },
});
