import { createFileRoute } from "@tanstack/react-router";
import { getHealthReport } from "@/server/features/health-report/report-store";

// Dynamic social card for a shared report. The takumi renderer (WASM) is
// lazy-imported so it never loads on unrelated requests or at startup.
async function handleSocialImage(id: string): Promise<Response> {
  const stored = await getHealthReport(id);
  if (!stored) return new Response("Not found", { status: 404 });
  try {
    const { renderHealthReportSocialImage } =
      await import("@/server/features/health-report/reportSocialImage");
    return renderHealthReportSocialImage(stored.report);
  } catch (error) {
    console.error("[health-report] social image failed:", error);
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }
}

export const Route = createFileRoute("/report/$id/og.png")({
  server: {
    handlers: {
      GET: ({ params }) => handleSocialImage(params.id),
    },
  },
});
