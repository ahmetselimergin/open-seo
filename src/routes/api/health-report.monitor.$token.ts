import { createFileRoute } from "@tanstack/react-router";
import { getMonitorByToken } from "@/server/features/health-report/monitor-store";

// Read a monitor's public data (score history, no email) via its capability
// token — powers the /izleme/<token> dashboard.
async function handleGetMonitor(token: string): Promise<Response> {
  const monitor = await getMonitorByToken(token);
  const body = monitor
    ? JSON.stringify(monitor)
    : JSON.stringify({ error: "İzleme bulunamadı." });
  return new Response(body, {
    status: monitor ? 200 : 404,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/health-report/monitor/$token")({
  server: {
    handlers: {
      GET: ({ params }) => handleGetMonitor(params.token),
    },
  },
});
