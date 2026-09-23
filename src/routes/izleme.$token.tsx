import { createFileRoute } from "@tanstack/react-router";
import { MonitorDashboard } from "@/client/features/health-report/MonitorDashboard";

export const Route = createFileRoute("/izleme/$token")({
  head: () => ({
    meta: [{ title: "İzleme paneli — mySeo" }],
  }),
  component: MonitorRoute,
});

function MonitorRoute() {
  const { token } = Route.useParams();
  return <MonitorDashboard token={token} />;
}
