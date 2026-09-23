import { createFileRoute } from "@tanstack/react-router";
import {
  consumeLoginToken,
  createSession,
  getAccountByHash,
  getSessionHash,
  readSidCookie,
  sessionCookie,
} from "@/server/features/health-report/account-store";
import { getMonitorByToken } from "@/server/features/health-report/monitor-store";
import {
  renderDashboard,
  renderLoginPage,
} from "@/server/features/health-report/accountHtml";

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handleAccount(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = url.origin;
  const secure = url.protocol === "https:";

  // Magic-link exchange: token -> session cookie -> redirect.
  const token = url.searchParams.get("token");
  if (token) {
    const email = await consumeLoginToken(token);
    if (!email) {
      return html(
        renderLoginPage(origin, {
          error: "Giriş bağlantısı geçersiz veya süresi dolmuş.",
        }),
      );
    }
    const sid = await createSession(email);
    return new Response(null, {
      status: 302,
      headers: { Location: "/hesap", "Set-Cookie": sessionCookie(sid, secure) },
    });
  }

  const sid = readSidCookie(request);
  const hash = sid ? await getSessionHash(sid) : null;
  if (!hash) return html(renderLoginPage(origin));

  const account = await getAccountByHash(hash);
  const monitors = (
    await Promise.all(account.monitorTokens.map((t) => getMonitorByToken(t)))
  )
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .map((m) => ({
      domain: m.domain,
      lastScore: m.lastScore,
      unsubToken: m.unsubToken,
    }));

  return html(renderDashboard(origin, account.reports, monitors));
}

export const Route = createFileRoute("/hesap")({
  server: {
    handlers: {
      GET: ({ request }) => handleAccount(request),
    },
  },
});
