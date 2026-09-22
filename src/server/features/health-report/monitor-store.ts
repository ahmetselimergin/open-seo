import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/lib/audit/ids";

/**
 * Weekly-monitoring subscriptions, backed by Cloudflare KV.
 *
 * One record per (email, domain), keyed by a hash so re-subscribing updates in
 * place. A reverse token index powers one-click unsubscribe links. The cron
 * sweep (scheduledHealthChecks.ts) lists these, re-scans, and alerts on change.
 */
const PREFIX = "monitor:";
const TOKEN_PREFIX = "monitor-unsub:";

export interface MonitorRecord {
  email: string;
  domain: string;
  startUrl: string;
  lastScore: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  unsubToken: string;
}

function keyFor(hash: string): string {
  return `${PREFIX}${hash}`;
}

async function hashOf(email: string, domain: string): Promise<string> {
  return sha256Hex(`${email.toLowerCase()}|${domain.toLowerCase()}`);
}

/** Create or refresh a monitor for (email, domain). Returns its unsub token. */
export async function upsertMonitor(input: {
  email: string;
  domain: string;
  startUrl: string;
  score: number | null;
}): Promise<string> {
  const hash = await hashOf(input.email, input.domain);
  const key = keyFor(hash);
  const existing = await getMonitor(key);
  const unsubToken = existing?.unsubToken ?? crypto.randomUUID();

  const record: MonitorRecord = {
    email: input.email,
    domain: input.domain,
    startUrl: input.startUrl,
    lastScore: input.score,
    lastCheckedAt: existing?.lastCheckedAt ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    unsubToken,
  };

  await env.KV.put(key, JSON.stringify(record));
  await env.KV.put(`${TOKEN_PREFIX}${unsubToken}`, key);
  return unsubToken;
}

export async function getMonitor(key: string): Promise<MonitorRecord | null> {
  const raw = await env.KV.get(key, "text");
  if (!raw) return null;
  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return JSON.parse(raw) as MonitorRecord;
  } catch {
    return null;
  }
}

/** List monitor keys (oldest-checked handled by the caller). */
export async function listMonitorKeys(limit = 100): Promise<string[]> {
  const result = await env.KV.list({ prefix: PREFIX, limit });
  return result.keys.map((k) => k.name);
}

export async function updateMonitor(
  key: string,
  patch: Partial<Pick<MonitorRecord, "lastScore" | "lastCheckedAt">>,
): Promise<void> {
  const current = await getMonitor(key);
  if (!current) return;
  await env.KV.put(key, JSON.stringify({ ...current, ...patch }));
}

/** Resolve an unsubscribe token to its monitor, then delete both entries. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const key = await env.KV.get(`${TOKEN_PREFIX}${token}`, "text");
  if (!key) return false;
  await env.KV.delete(key);
  await env.KV.delete(`${TOKEN_PREFIX}${token}`);
  return true;
}
