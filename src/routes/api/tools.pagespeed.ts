import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { normalizeAndValidateStartUrl } from "@/server/lib/audit/url-policy";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";

// Free page-speed / Core Web Vitals tool. Delegates the fetch+analysis to
// Google PageSpeed Insights (Google fetches the target, not our worker), so it
// adds the performance dimension our crawl-only scan lacks. Optional
// PAGESPEED_API_KEY raises quota; the endpoint degrades gracefully without it.
const schema = z.object({ url: z.string().min(1).max(2048) });

const METRIC_LABELS: Record<string, string> = {
  "largest-contentful-paint": "En büyük içerik (LCP)",
  "cumulative-layout-shift": "Görsel kayma (CLS)",
  "total-blocking-time": "Toplam engelleme (TBT)",
  "first-contentful-paint": "İlk içerik (FCP)",
  "speed-index": "Hız endeksi",
};

const psiSchema = z
  .object({
    lighthouseResult: z
      .object({
        categories: z
          .object({
            performance: z
              .object({ score: z.number().nullable().optional() })
              .optional(),
          })
          .optional(),
        audits: z
          .record(
            z.string(),
            z
              .object({
                numericValue: z.number().optional(),
                displayValue: z.string().optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .optional(),
  })
  .passthrough();

function apiKey(): string | null {
  const k: unknown = Reflect.get(env, "PAGESPEED_API_KEY");
  return typeof k === "string" && k.trim() ? k.trim() : null;
}

async function handlePageSpeed(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Geçerli bir adres girin." }, 400);

  let target: string;
  try {
    target = await normalizeAndValidateStartUrl(parsed.data.url);
  } catch {
    return json({ error: "Geçerli bir adres girin (ör. example.com)." }, 400);
  }

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
  );
  endpoint.searchParams.set("url", target);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.set("category", "performance");
  const key = apiKey();
  if (key) endpoint.searchParams.set("key", key);

  let raw: unknown;
  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(45_000) });
    if (!res.ok) {
      return json(
        { error: "Hız verisi alınamadı. Adresi kontrol edip tekrar deneyin." },
        502,
      );
    }
    raw = await res.json();
  } catch {
    return json({ error: "Analiz zaman aşımına uğradı, tekrar deneyin." }, 504);
  }

  const psi = psiSchema.safeParse(raw);
  const lh = psi.success ? psi.data.lighthouseResult : undefined;
  const scoreRaw = lh?.categories?.performance?.score;
  if (typeof scoreRaw !== "number") {
    return json({ error: "Bu sayfa için hız verisi üretilemedi." }, 502);
  }

  const audits = lh?.audits ?? {};
  const metrics = Object.keys(METRIC_LABELS)
    .map((id) => {
      const a = audits[id];
      if (!a || typeof a.numericValue !== "number") return null;
      return {
        id,
        label: METRIC_LABELS[id],
        numericValue: a.numericValue,
        displayValue: a.displayValue ?? String(a.numericValue),
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return json({ url: target, score: Math.round(scoreRaw * 100), metrics }, 200);
}

export const Route = createFileRoute("/api/tools/pagespeed")({
  server: {
    handlers: {
      POST: ({ request }) => handlePageSpeed(request),
    },
  },
});
