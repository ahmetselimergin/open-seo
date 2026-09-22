import { createFileRoute, redirect } from "@tanstack/react-router";

// The SEO health report now lives at the site root ("/"). Keep this path as a
// redirect so any existing links to /health-report still land on the homepage.
export const Route = createFileRoute("/health-report")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
