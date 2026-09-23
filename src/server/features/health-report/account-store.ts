import { env } from "cloudflare:workers";
import { sha256Hex } from "@/server/lib/audit/ids";

/**
 * Passwordless, email-owned accounts for mySeo, backed by Cloudflare KV.
 * Isolated from the OpenSEO app's better-auth. "Account" = email; auth =
 * magic link; session = a random id in KV behind an HttpOnly cookie.
 */
const ACCOUNT_PREFIX = "account:";
const LOGIN_PREFIX = "login:";
const SESSION_PREFIX = "session:";
const LOGIN_TTL = 900; // 15 minutes
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days
const MAX_REPORTS = 50;
const MAX_MONITORS = 100;
export const SESSION_COOKIE = "mys_sid";

export interface AccountReport {
  id: string;
  domain: string;
  score: number;
  createdAt: string;
}
export interface AccountData {
  reports: AccountReport[];
  monitorTokens: string[];
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
async function emailHash(email: string): Promise<string> {
  return sha256Hex(normalizeEmail(email));
}

async function readAccount(hash: string): Promise<AccountData> {
  const raw = await env.KV.get(`${ACCOUNT_PREFIX}${hash}`, "text");
  if (!raw) return { reports: [], monitorTokens: [] };
  try {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const data = JSON.parse(raw) as Partial<AccountData>;
    return {
      reports: data.reports ?? [],
      monitorTokens: data.monitorTokens ?? [],
    };
  } catch {
    return { reports: [], monitorTokens: [] };
  }
}

async function writeAccount(hash: string, data: AccountData): Promise<void> {
  await env.KV.put(`${ACCOUNT_PREFIX}${hash}`, JSON.stringify(data));
}

export async function getAccountByHash(hash: string): Promise<AccountData> {
  return readAccount(hash);
}

/** Attach a report snapshot to the owner's account (newest first, deduped). */
export async function addReportToAccount(
  email: string,
  report: AccountReport,
): Promise<void> {
  const hash = await emailHash(email);
  const acc = await readAccount(hash);
  const reports = [
    report,
    ...acc.reports.filter((r) => r.id !== report.id),
  ].slice(0, MAX_REPORTS);
  await writeAccount(hash, { ...acc, reports });
}

/** Attach a monitor (by its capability token) to the owner's account. */
export async function addMonitorToAccount(
  email: string,
  token: string,
): Promise<void> {
  const hash = await emailHash(email);
  const acc = await readAccount(hash);
  if (acc.monitorTokens.includes(token)) return;
  await writeAccount(hash, {
    ...acc,
    monitorTokens: [token, ...acc.monitorTokens].slice(0, MAX_MONITORS),
  });
}

// ── Magic-link login tokens ─────────────────────────────────────────────────
export async function createLoginToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  await env.KV.put(`${LOGIN_PREFIX}${token}`, normalizeEmail(email), {
    expirationTtl: LOGIN_TTL,
  });
  return token;
}

/** One-time: returns the email and invalidates the token. */
export async function consumeLoginToken(token: string): Promise<string | null> {
  const email = await env.KV.get(`${LOGIN_PREFIX}${token}`, "text");
  if (email) await env.KV.delete(`${LOGIN_PREFIX}${token}`);
  return email;
}

// ── Sessions ────────────────────────────────────────────────────────────────
export async function createSession(email: string): Promise<string> {
  const sid = crypto.randomUUID();
  await env.KV.put(`${SESSION_PREFIX}${sid}`, await emailHash(email), {
    expirationTtl: SESSION_TTL,
  });
  return sid;
}
export async function getSessionHash(sid: string): Promise<string | null> {
  return env.KV.get(`${SESSION_PREFIX}${sid}`, "text");
}
export async function deleteSession(sid: string): Promise<void> {
  await env.KV.delete(`${SESSION_PREFIX}${sid}`);
}

// ── Cookies ─────────────────────────────────────────────────────────────────
export function readSidCookie(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=") || null;
  }
  return null;
}

export function sessionCookie(sid: string, secure: boolean): string {
  const flags = [
    `${SESSION_COOKIE}=${sid}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL}`,
  ];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}

export function clearCookie(secure: boolean): string {
  const flags = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}
