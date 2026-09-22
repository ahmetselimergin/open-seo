import { env } from "cloudflare:workers";
import type { HealthReport } from "@/shared/health-report";

const LOOPS_TRANSACTIONAL_URL = "https://app.loops.so/api/v1/transactional";

function getOptionalEnv(name: string): string | null {
  const value: unknown = Reflect.get(env, name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Best-effort delivery of the report link to the lead's email via Loops.
 *
 * Enabled only when both LOOPS_API_KEY and LOOPS_HEALTH_REPORT_TEMPLATE_ID are
 * set; otherwise it's a no-op (the share link is still returned to the UI). It
 * never throws: a failed marketing email must not fail the scan.
 */
export async function sendHealthReportEmail(input: {
  email: string;
  report: HealthReport;
  shareUrl: string;
}): Promise<void> {
  const LOOPS_API_KEY = getOptionalEnv("LOOPS_API_KEY");
  const LOOPS_HEALTH_REPORT_TEMPLATE_ID = getOptionalEnv(
    "LOOPS_HEALTH_REPORT_TEMPLATE_ID",
  );

  if (!LOOPS_API_KEY || !LOOPS_HEALTH_REPORT_TEMPLATE_ID) {
    console.info(
      `[health-report] email capture (delivery disabled) for ${input.report.domain}: ${input.email}`,
    );
    return;
  }

  try {
    const response = await fetch(LOOPS_TRANSACTIONAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOOPS_API_KEY}`,
      },
      body: JSON.stringify({
        transactionalId: LOOPS_HEALTH_REPORT_TEMPLATE_ID,
        email: input.email,
        dataVariables: {
          domain: input.report.domain,
          score: input.report.score,
          grade: input.report.grade,
          reportUrl: input.shareUrl,
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(
        `[health-report] Loops email failed (${response.status}) for ${input.email}`,
      );
    }
  } catch (error) {
    console.error("[health-report] Loops email error:", error);
  }
}

/**
 * Best-effort weekly-monitoring alert when a site's score changes. Enabled only
 * when LOOPS_API_KEY and LOOPS_HEALTH_ALERT_TEMPLATE_ID are set; never throws.
 */
export async function sendHealthAlertEmail(input: {
  email: string;
  domain: string;
  previousScore: number;
  newScore: number;
  reportUrl: string;
  unsubscribeUrl: string;
}): Promise<void> {
  const apiKey = getOptionalEnv("LOOPS_API_KEY");
  const templateId = getOptionalEnv("LOOPS_HEALTH_ALERT_TEMPLATE_ID");

  if (!apiKey || !templateId) {
    console.info(
      `[health-report] alert (delivery disabled) ${input.domain}: ${input.previousScore} -> ${input.newScore}`,
    );
    return;
  }

  try {
    const response = await fetch(LOOPS_TRANSACTIONAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        transactionalId: templateId,
        email: input.email,
        dataVariables: {
          domain: input.domain,
          previousScore: input.previousScore,
          newScore: input.newScore,
          direction:
            input.newScore >= input.previousScore ? "yükseldi" : "düştü",
          reportUrl: input.reportUrl,
          unsubscribeUrl: input.unsubscribeUrl,
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error(
        `[health-report] alert email failed (${response.status}) for ${input.email}`,
      );
    }
  } catch (error) {
    console.error("[health-report] alert email error:", error);
  }
}
