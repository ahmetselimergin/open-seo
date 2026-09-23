import { env } from "cloudflare:workers";
import { runQuickAudit } from "@/server/lib/audit/quick-audit";
import {
  normalizeAndValidateStartUrl,
  resolveStartUrlRedirects,
} from "@/server/lib/audit/url-policy";
import { buildHealthReport } from "@/shared/health-report";
import { saveHealthReport } from "@/server/features/health-report/report-store";
import { sendHealthAlertEmail } from "@/server/features/health-report/report-email";
import {
  getMonitor,
  listMonitorKeys,
  recordCheck,
  type MonitorRecord,
} from "@/server/features/health-report/monitor-store";

// Re-scan a bounded batch of monitored sites and alert on score change.
// Bounded per run (crawls are subrequest-heavy) — the weekly cadence plus
// oldest-first rotation covers the rest over successive runs. For large scale
// this should move to a queue/workflow.
const BATCH_PER_RUN = 5;
const RUN_BUDGET_MS = 50_000;

function baseUrl(): string | null {
  const raw: unknown =
    Reflect.get(env, "PUBLIC_BASE_URL") ?? Reflect.get(env, "BETTER_AUTH_URL");
  return typeof raw === "string" && raw.trim()
    ? raw.trim().replace(/\/$/, "")
    : null;
}

export async function runScheduledHealthChecks(): Promise<void> {
  const keys = await listMonitorKeys(200);
  const loaded = await Promise.all(
    keys.map(async (key) => ({ key, rec: await getMonitor(key) })),
  );
  const records = loaded.filter(
    (x): x is { key: string; rec: MonitorRecord } => x.rec !== null,
  );
  // Oldest-checked first (never-checked sorts first with "").
  records.sort((a, b) =>
    (a.rec.lastCheckedAt ?? "").localeCompare(b.rec.lastCheckedAt ?? ""),
  );

  const base = baseUrl();
  const deadline = Date.now() + RUN_BUDGET_MS;
  let checked = 0;

  for (const { key, rec } of records) {
    if (checked >= BATCH_PER_RUN || Date.now() > deadline) break;
    checked += 1;
    try {
      const startUrl = await resolveStartUrlRedirects(
        await normalizeAndValidateStartUrl(rec.startUrl),
      );
      const audit = await runQuickAudit(startUrl);
      const report = buildHealthReport({
        startUrl: audit.startUrl,
        origin: audit.origin,
        pagesCrawled: audit.pagesCrawled,
        truncated: audit.truncated,
        issues: audit.issues,
      });

      const previous = rec.lastScore;
      const id = await saveHealthReport(report, rec.email);
      await recordCheck(key, report.score);

      if (previous !== null && report.score !== previous) {
        await sendHealthAlertEmail({
          email: rec.email,
          domain: report.domain,
          previousScore: previous,
          newScore: report.score,
          reportUrl: base ? `${base}/report/${id}` : `/report/${id}`,
          dashboardUrl: base
            ? `${base}/izleme/${rec.unsubToken}`
            : `/izleme/${rec.unsubToken}`,
          unsubscribeUrl: base
            ? `${base}/api/health-report/monitor/unsubscribe?token=${rec.unsubToken}`
            : `/api/health-report/monitor/unsubscribe?token=${rec.unsubToken}`,
        });
      }
    } catch (error) {
      console.error(`[health-monitor] check failed for ${rec.domain}:`, error);
    }
  }

  if (checked > 0) {
    console.info(`[health-monitor] checked ${checked} monitored site(s)`);
  }
}
