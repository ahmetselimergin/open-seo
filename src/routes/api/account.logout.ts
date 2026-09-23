import { createFileRoute } from "@tanstack/react-router";
import {
  clearCookie,
  deleteSession,
  readSidCookie,
} from "@/server/features/health-report/account-store";

async function handleLogout(request: Request): Promise<Response> {
  const secure = new URL(request.url).protocol === "https:";
  const sid = readSidCookie(request);
  if (sid) await deleteSession(sid);
  return new Response(null, {
    status: 302,
    headers: { Location: "/hesap", "Set-Cookie": clearCookie(secure) },
  });
}

export const Route = createFileRoute("/api/account/logout")({
  server: {
    handlers: {
      POST: ({ request }) => handleLogout(request),
    },
  },
});
