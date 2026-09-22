import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { normalizeAndValidateStartUrl } from "@/server/lib/audit/url-policy";
import { upsertMonitor } from "@/server/features/health-report/monitor-store";
import {
  guardPublicPost,
  jsonResponse as json,
} from "@/server/features/health-report/abuse";

// Opt in to weekly monitoring for a domain. Stores (email, domain) and the
// current score as the baseline; the weekly cron re-scans and emails on change.
const schema = z.object({
  email: z.string().email().max(320),
  domain: z.string().min(1).max(2048),
  score: z.number().int().min(0).max(100).optional(),
});

async function handleSubscribe(request: Request): Promise<Response> {
  const blocked = await guardPublicPost(request);
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Geçersiz istek gövdesi." }, 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Geçerli bir e-posta ve alan adı girin." }, 400);
  }

  let startUrl: string;
  try {
    startUrl = await normalizeAndValidateStartUrl(parsed.data.domain);
  } catch {
    return json({ error: "Geçerli bir alan adı girin." }, 400);
  }
  const domain = new URL(startUrl).hostname.replace(/^www\./, "");

  await upsertMonitor({
    email: parsed.data.email.trim(),
    domain,
    startUrl,
    score: parsed.data.score ?? null,
  });

  return json({ ok: true }, 200);
}

export const Route = createFileRoute("/api/health-report/monitor")({
  server: {
    handlers: {
      POST: ({ request }) => handleSubscribe(request),
    },
  },
});
