import { createFileRoute } from "@tanstack/react-router";
import { getHealthReport } from "@/server/features/health-report/report-store";

// Public read of a stored SEO health report by share id. The lead email is
// never included in the response — only the scorecard is public.
async function handleGetReport(id: string): Promise<Response> {
  const stored = await getHealthReport(id);
  if (!stored) {
    return json({ error: "Rapor bulunamadı veya süresi dolmuş." }, 404);
  }
  return json(
    { ...stored.report, id, createdAt: stored.createdAt },
    200,
    "public, max-age=300",
  );
}

function json(data: unknown, status: number, cacheControl?: string): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cacheControl) headers["Cache-Control"] = cacheControl;
  return new Response(JSON.stringify(data), { status, headers });
}

export const Route = createFileRoute("/api/health-report/$id")({
  server: {
    handlers: {
      GET: ({ params }) => handleGetReport(params.id),
    },
  },
});
