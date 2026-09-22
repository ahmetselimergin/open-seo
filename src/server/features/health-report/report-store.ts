import { env } from "cloudflare:workers";
import type { HealthReport } from "@/shared/health-report";

/**
 * Persistence for public SEO health reports, backed by Cloudflare KV.
 *
 * Reports are immutable read-by-id snapshots (a scorecard the user can share),
 * so KV is a good fit: no schema, no dual-dialect migration, per-colo reads.
 * Records auto-expire so the store stays bounded without a cleanup job.
 */
const PREFIX = "health-report:";
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export interface StoredHealthReport {
  report: HealthReport;
  /** Optional lead email captured at scan time (never shown on the share page). */
  email: string | null;
  createdAt: string;
}

/** Save a report and return its share id. */
export async function saveHealthReport(
  report: HealthReport,
  email: string | null,
): Promise<string> {
  const id = crypto.randomUUID();
  const record: StoredHealthReport = {
    report,
    email: email || null,
    createdAt: new Date().toISOString(),
  };
  await env.KV.put(`${PREFIX}${id}`, JSON.stringify(record), {
    expirationTtl: TTL_SECONDS,
  });
  return id;
}

/** Load a stored report by id, or null if it is missing/expired/corrupt. */
export async function getHealthReport(
  id: string,
): Promise<StoredHealthReport | null> {
  const raw = await env.KV.get(`${PREFIX}${id}`, "text");
  if (!raw) return null;
  try {
    // We only ever write StoredHealthReport JSON to this key.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return JSON.parse(raw) as StoredHealthReport;
  } catch {
    return null;
  }
}
