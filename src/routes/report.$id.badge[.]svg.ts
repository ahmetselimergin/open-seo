import { createFileRoute } from "@tanstack/react-router";
import { getHealthReport } from "@/server/features/health-report/report-store";
import { renderBadgeSvg } from "@/server/features/health-report/badgeSvg";

// Embeddable score badge for a shared report. Always returns a valid SVG (a
// neutral fallback when the report is missing) so an embedded <img> never breaks.
async function handleBadge(id: string): Promise<Response> {
  const stored = await getHealthReport(id);
  const svg = renderBadgeSvg(stored ? stored.report.score : null);
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/report/$id/badge.svg")({
  server: {
    handlers: {
      GET: ({ params }) => handleBadge(params.id),
    },
  },
});
