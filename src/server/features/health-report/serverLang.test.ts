import { describe, expect, it } from "vitest";
import {
  hasLangOverride,
  langCookie,
  resolveLang,
} from "@/server/features/health-report/serverLang";

function req(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

describe("resolveLang", () => {
  it("prefers the ?lang override above everything else", () => {
    const request = req("https://myseo.example/?lang=en", {
      cookie: "myseo_lang=tr",
      "accept-language": "tr-TR",
    });
    expect(resolveLang(request)).toBe("en");
  });

  it("falls back to the cookie when there is no ?lang", () => {
    const request = req("https://myseo.example/", {
      cookie: "foo=1; myseo_lang=en; bar=2",
      "accept-language": "tr-TR",
    });
    expect(resolveLang(request)).toBe("en");
  });

  it("falls back to Accept-Language when there is no override or cookie", () => {
    expect(
      resolveLang(
        req("https://myseo.example/", { "accept-language": "en-US,en" }),
      ),
    ).toBe("en");
  });

  it("defaults to Turkish", () => {
    expect(resolveLang(req("https://myseo.example/"))).toBe("tr");
    // A non-en Accept-Language is not English.
    expect(
      resolveLang(
        req("https://myseo.example/", { "accept-language": "fr-FR" }),
      ),
    ).toBe("tr");
  });

  it("ignores an invalid ?lang value", () => {
    expect(resolveLang(req("https://myseo.example/?lang=de"))).toBe("tr");
  });
});

describe("hasLangOverride", () => {
  it("is true only for a valid explicit ?lang", () => {
    expect(hasLangOverride(req("https://myseo.example/?lang=en"))).toBe(true);
    expect(hasLangOverride(req("https://myseo.example/?lang=tr"))).toBe(true);
    expect(hasLangOverride(req("https://myseo.example/?lang=de"))).toBe(false);
    expect(hasLangOverride(req("https://myseo.example/"))).toBe(false);
  });
});

describe("langCookie", () => {
  it("builds a year-long, lax, site-wide cookie", () => {
    const cookie = langCookie("en");
    expect(cookie).toContain("myseo_lang=en");
    expect(cookie).toContain("path=/");
    expect(cookie).toContain("max-age=31536000");
    expect(cookie).toContain("samesite=lax");
  });
});
