import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { resolveLang } from "@/server/features/health-report/serverLang";

// Resolves the request language + absolute origin for the landing page's SSR
// <head> (canonical + OpenGraph need absolute URLs, and the meta is bilingual).
// A server fn (not inline in the loader) so the request-reading code only ever
// runs on the server, never during client-side navigation.
export const getHomeMeta = createServerFn({ method: "GET" }).handler(() => {
  const request = getRequest();
  return {
    lang: resolveLang(request),
    origin: new URL(request.url).origin,
  };
});
