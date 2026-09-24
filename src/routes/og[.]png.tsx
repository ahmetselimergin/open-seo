import { createFileRoute } from "@tanstack/react-router";
import { resolveLang } from "@/server/features/health-report/serverLang";

// Dynamic social card for the mySeo landing page (referenced by the homepage's
// og:image / twitter:image). The takumi renderer (WASM) is lazy-imported so it
// never loads on unrelated requests or at startup.
async function handleHomeImage(request: Request): Promise<Response> {
  try {
    const { renderHomeSocialImage } =
      await import("@/server/features/health-report/homeSocialImage");
    return renderHomeSocialImage(resolveLang(request));
  } catch (error) {
    console.error("[home] social image failed:", error);
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }
}

export const Route = createFileRoute("/og.png")({
  server: {
    handlers: {
      GET: ({ request }) => handleHomeImage(request),
    },
  },
});
