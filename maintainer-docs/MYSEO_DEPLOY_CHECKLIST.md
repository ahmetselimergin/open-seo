# mySeo deploy checklist

Pre-production checklist for shipping the mySeo public SEO Health Report (the
end-user product at `/`) plus the reused OpenSEO dashboard (`/app`). Everything
runs in a single Cloudflare Worker, so **every** binding in `wrangler.jsonc` must
resolve or `wrangler deploy` fails — even bindings only the dashboard uses.

Secrets must never be committed. Use `wrangler secret put <NAME>` (or the
Cloudflare dashboard) for anything below marked "secret".

## 0. Verified in build

- `npm run build` (`vite build && tsc --noEmit`) builds both the app and the
  `open_seo_audit` worker with no errors.
- `oxlint . --type-aware` clean; `vitest run` for the health-report suite green.

## 1. Cloudflare resources (create in prod, put the id in `wrangler.jsonc`)

| Binding | Type | Used by |
| --- | --- | --- |
| `KV` | KV namespace | **mySeo core** — report store, accounts (magic link), monitoring |
| `OAUTH_KV` | KV namespace | Auth / OAuth state |
| `DB` | D1 | OpenSEO dashboard |
| `HYPERDRIVE` | Hyperdrive (Postgres) | OpenSEO dashboard |
| `R2` | R2 bucket | Asset/report storage |
| `AUDIT_ENGINE` | Durable Object | Audit engine |
| `SITE_AUDIT_WORKFLOW` | Workflow | Site audit |
| `RANK_CHECK_WORKFLOW` | Workflow | Rank checking |
| `HEALTH_REPORT_RATE_LIMIT` | Ratelimit | mySeo abuse protection on public POSTs |
| cron `0 8 * * 1` | Trigger | Weekly monitoring sweep (auto from config) |

## 2. Secrets / vars

**Required for the mySeo core flow (scan → report → share):**

- `PUBLIC_BASE_URL` — absolute site origin (used for share/OG absolute URLs)
- `BETTER_AUTH_URL` — auth base URL

**Optional — the feature degrades gracefully (silently off) when unset:**

- Email (Loops), all needed together per email type:
  - `LOOPS_API_KEY`
  - `LOOPS_HEALTH_REPORT_TEMPLATE_ID` (report delivery)
  - `LOOPS_MAGIC_LINK_TEMPLATE_ID` (passwordless sign-in)
  - `LOOPS_HEALTH_ALERT_TEMPLATE_ID` (weekly score-change alert)
  - Note: Loops templates are external and currently Turkish-only; make them
    bilingual template-side if EN email is wanted.
- `PAGESPEED_API_KEY` — raises quota for the `/araclar/hiz` speed tool; without
  it Google intermittently rate-limits and the tool shows a graceful error.
- `POSTHOG_PUBLIC_KEY`, `POSTHOG_HOST` — anonymous analytics; off when unset.

The OpenSEO dashboard (`/app`) may need its own secrets (DataForSEO, Google
OAuth, etc.). The mySeo end-user flow does not require them.

## 3. Deploy steps

```sh
wrangler login                 # run yourself (interactive)
npm run deploy                 # db:migrate:prod && build && wrangler deploy
```

`npm run deploy` already runs prod DB migration, the build, and both worker
deploys (`dist/open_seo_audit/wrangler.json` then the root worker).

## 4. Post-deploy smoke test

- `/` returns 200 with the mySeo homepage; `<head>` has title, description,
  canonical, OpenGraph + Twitter tags with absolute URLs.
- `/og.png` returns a 1200×630 PNG.
- Run a scan on a real domain → report renders → share link `/report/<id>`
  opens with correct OG preview; `/report/<id>/og.png` renders.
- `/rehber`, `/karsilastir`, `/araclar/*`, `/fiyatlandirma`, `/gizlilik`,
  `/kullanim-kosullari` all 200; `?lang=en` switches language.
- `/sitemap.xml` and `/robots.txt` return valid content.

## Not yet done (tracked separately)

- Real Pro checkout (needs Autumn products + a payment provider).
- Full server-side rendering of the homepage `<body>` (currently `ClientOnly`
  app-wide; meta + OG are server-rendered, and Google renders JS, so the page is
  indexable in practice — full body SSR is an app-wide architectural change).
- Bilingual transactional email (blocked on external Loops templates).
