// Server-side locale resolution for the SSR pages (pricing, tools hub, ...).
// Priority: ?lang override -> myseo_lang cookie (set by the client switcher and
// by ?lang here) -> Accept-Language -> Turkish default. No client JS needed.
export type ServerLang = "tr" | "en";

export function resolveLang(request: Request): ServerLang {
  const q = new URL(request.url).searchParams.get("lang");
  if (q === "en" || q === "tr") return q;

  const cookie = request.headers.get("cookie") ?? "";
  const m = cookie.match(/(?:^|;\s*)myseo_lang=(tr|en)/);
  if (m) return m[1] === "en" ? "en" : "tr";

  const accept = request.headers.get("accept-language") ?? "";
  if (/^\s*en\b/i.test(accept)) return "en";
  return "tr";
}

/** True when the request carried an explicit ?lang the route should persist. */
export function hasLangOverride(request: Request): boolean {
  const q = new URL(request.url).searchParams.get("lang");
  return q === "en" || q === "tr";
}

export function langCookie(lang: ServerLang): string {
  return `myseo_lang=${lang};path=/;max-age=31536000;samesite=lax`;
}
