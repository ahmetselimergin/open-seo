import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/lib/audit/ids";

/**
 * Weekly-monitoring subscriptions, backed by Cloudflare KV.
 *
 * One record per (email, domain), keyed by a hash so re-subscribing updates in
 * place. A reverse token index powers the capability URLs (dashboard +
 * one-click unsubscribe). The cron sweep re-scans, appends to score history,
 * and alerts on change.
 */
const PREFIX = "monitor:";
const TOKEN_PREFIX = "monitor-unsub:";
const HISTORY_CAP = 26; // ~6 months of weekly checks

export interface ScorePoint {
  date: string; // YYYY-MM-DD
  score: number;
}

export interface MonitorRecord {
  email: string;
  domain: string;
  startUrl: string;
  lastScore: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  unsubToken: string;
  history: ScorePoint[];
}

/** Public (email-free) view of a monitor for the dashboard capability URL. */
export interface MonitorPublicView {
  domain: string;
  lastScore: number | null;
  lastCheckedAt: string | null;
  createdAt: string;
  history: ScorePoint[];
  unsubToken: string;
}

function keyFor(hash: string): string {
  return `${PREFIX}${hash}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function hashOf(email: string, domain: string): Promise<string> {
  return sha256Hex(`${email.toLowerCase()}|${domain.toLowerCase()}`);
}

/** Create or refresh a monitor for (email, domain). Returns its capability token. */
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
  const history =
    existing?.history ??
    (input.score !== null ? [{ date: today(), score: input.score }] : []);

  const record: MonitorRecord = {
    email: input.email,
    domain: input.domain,
    startUrl: input.startUrl,
    lastScore: input.score,
    lastCheckedAt: existing?.lastCheckedAt ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    unsubToken,
    history,
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
    const parsed = JSON.parse(raw) as MonitorRecord;
    if (!Array.isArray(parsed.history)) parsed.history = [];
    return parsed;
  } catch {
    return null;
  }
}

/** List monitor keys (oldest-checked ordering handled by the caller). */
export async function listMonitorKeys(limit = 100): Promise<string[]> {
  const result = await env.KV.list({ prefix: PREFIX, limit });
  return result.keys.map((k) => k.name);
}

/** Record a fresh check: append to history (capped) and update the last score. */
export async function recordCheck(key: string, score: number): Promise<void> {
  const current = await getMonitor(key);
  if (!current) return;
  const history = [...current.history, { date: today(), score }].slice(
    -HISTORY_CAP,
  );
  await env.KV.put(
    key,
    JSON.stringify({
      ...current,
      lastScore: score,
      lastCheckedAt: new Date().toISOString(),
      history,
    }),
  );
}

async function resolveToken(token: string): Promise<string | null> {
  return env.KV.get(`${TOKEN_PREFIX}${token}`, "text");
}

/** Load a monitor's public (email-free) view by its capability token. */
export async function getMonitorByToken(
  token: string,
): Promise<MonitorPublicView | null> {
  const key = await resolveToken(token);
  if (!key) return null;
  const rec = await getMonitor(key);
  if (!rec) return null;
  return {
    domain: rec.domain,
    lastScore: rec.lastScore,
    lastCheckedAt: rec.lastCheckedAt,
    createdAt: rec.createdAt,
    history: rec.history,
    unsubToken: rec.unsubToken,
  };
}

/** Resolve an unsubscribe token to its monitor, then delete both entries. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const key = await resolveToken(token);
  if (!key) return false;
  await env.KV.delete(key);
  await env.KV.delete(`${TOKEN_PREFIX}${token}`);
  return true;
}
