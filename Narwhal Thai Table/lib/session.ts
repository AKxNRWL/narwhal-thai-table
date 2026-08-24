import { createHmac, timingSafeEqual } from 'crypto';

/* Stateless signed-cookie sessions for the owner Control Room.
   Cookie value = base64url(payload) + "." + base64url(HMAC_SHA256(payload)),
   where payload = `${tenantId}.${expiresAtMs}`. No server-side store needed.
   Replaces the old token-in-URL scheme (which leaked the token into logs). */

export const SESSION_COOKIE = 'nwh_owner';
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/* FAIL-CLOSED. There is deliberately no hard-coded fallback key: this file
   lives in a public repo, so any literal here would let anyone forge an owner
   cookie. If neither env var is set we throw — every /os route then 500s,
   which is the correct outcome (no session is better than a forgeable one). */
function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.STATS_TOKEN;
  if (!s) throw new Error('[session] AUTH_SECRET is not set — refusing to sign or verify sessions.');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSession(tenantId: string, ttlMs: number = TTL_MS): string {
  const payload = `${tenantId}.${Date.now() + ttlMs}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function readSession(value: string | null | undefined): { tenantId: string } | null {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot < 0) return null;
  const p = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(p, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const lastDot = payload.lastIndexOf('.');
  if (lastDot < 0) return null;
  const tenantId = payload.slice(0, lastDot);
  const exp = Number(payload.slice(lastDot + 1));
  if (!tenantId || !Number.isFinite(exp) || Date.now() > exp) return null;
  return { tenantId };
}

/* Full owner-auth check for API routes.
   readSession() alone only proves the cookie carries a valid, unexpired
   signature — it never asks whether that tenant still exists. A tenant that
   was removed from the registry (or an id that was signed and later dropped)
   would keep full access until its 8h TTL ran out. requireSession() closes
   that by re-checking the registry on every request. The tenants module is
   imported lazily so modules that only verify signatures don't pull in
   @netlify/blobs. */
export async function requireSession(req: Request): Promise<{ tenantId: string } | null> {
  const sess = readSession(readCookie(req));
  if (!sess) return null;
  try {
    const { getTenant } = await import('@/lib/tenants');
    return (await getTenant(sess.tenantId)) ? sess : null;
  } catch {
    return null; // registry unreachable → deny, don't fall open
  }
}

export function sessionCookie(value: string, maxAgeSec: number = Math.floor(TTL_MS / 1000)): string {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAgeSec}`;
}

export function clearCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function readCookie(req: Request, name: string = SESSION_COOKIE): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}
