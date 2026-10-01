/**
 * Narwhal Rewards — browser side of dine-in points (Oct 2026).
 *
 * The backend is the Supabase Edge Function `rewards` (project ccdjnpjmdrjceadftedd,
 * source kept with the loyalty runbook). A guest confirms their phone once with an
 * SMS code (Twilio Verify); the function hands back a device token that this file
 * keeps in localStorage and sends as `x-rewards-token`. Points: 100 per $1 of food
 * and soft drinks before tax and tip — the same rule as the nightly Toast sync.
 *
 * Used by components/rewards/* (sheet, sign-in, menu strip, /points page) and the
 * chat chip in ChatWidget. Opening the sheet from anywhere: openRewards({ table }).
 */

export const REWARDS_API = 'https://ccdjnpjmdrjceadftedd.supabase.co/functions/v1/rewards';
export const OPEN_EVENT = 'nrw:rewards';
const TOKEN_KEY = 'nrw-rewards';
const SESSION_EVENT = 'nrw:rewards-session';

/** Must match SMS_DISCLOSURE in the rewards function — it is stored with each consent. */
export const SMS_DISCLOSURE =
  'Text me Narwhal Rewards news and offers. Up to 4 msgs/month. Msg & data rates may apply. Reply STOP to opt out. Not required to earn points.';

/** Tables that carry a QR card: 1–13 inside, P1–P5 on the patio (togo / spare cards don't earn at the table). */
const QR_TABLES = new Set([...Array.from({ length: 13 }, (_, i) => String(i + 1)), 'P1', 'P2', 'P3', 'P4', 'P5']);

/** "7" / "07" → "7", "p3" / "P-3" → "P3"; anything else → null. Same rule as the function. */
export function canonTable(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  let m = s.match(/^(\d{1,2})$/);
  if (m) {
    const id = String(Number(m[1]));
    return QR_TABLES.has(id) ? id : null;
  }
  m = s.match(/^p-?(\d)$/i);
  if (m) {
    const id = 'P' + Number(m[1]);
    return QR_TABLES.has(id) ? id : null;
  }
  return null;
}

export function tableLabel(id: string): string {
  return id.startsWith('P') ? `Patio ${id.slice(1)}` : `Table ${id}`;
}

export function fmtPoints(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString('en-US');
}

export function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

/** Ask the sheet (components/rewards/RewardsSheet, mounted once in app/layout) to open. */
export function openRewards(detail: { table?: string | null } = {}) {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail }));
  } catch {
    /* very old browser — nothing to open */
  }
}

/* ── session (device token) ─────────────────────────────────────────── */

export type Session = { token: string; phoneMasked: string };

export function loadSession(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null') as Session | null;
    return s && typeof s.token === 'string' && s.token.length >= 20 ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: s.token, phoneMasked: s.phoneMasked }));
  } catch {
    /* private mode: the guest stays signed in for this page only */
  }
  memorySession = s;
  announce();
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  memorySession = null;
  announce();
}

// Fallback when storage is blocked (Safari private mode): keep the token for this page view.
let memorySession: Session | null = null;
export function currentSession(): Session | null {
  return loadSession() ?? memorySession;
}

function announce() {
  try {
    window.dispatchEvent(new Event(SESSION_EVENT));
  } catch {
    /* ignore */
  }
}

/** Subscribe to sign-in / sign-out from any component on the page. Returns an unsubscribe. */
export function onSessionChange(fn: () => void): () => void {
  window.addEventListener(SESSION_EVENT, fn);
  window.addEventListener('storage', fn);
  return () => {
    window.removeEventListener(SESSION_EVENT, fn);
    window.removeEventListener('storage', fn);
  };
}

/* ── API ────────────────────────────────────────────────────────────── */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export async function rewardsCall<T>(action: string, body: Record<string, unknown> = {}, auth = false): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (auth) {
    const s = currentSession();
    if (!s) return { ok: false, status: 401, error: 'auth' };
    headers['x-rewards-token'] = s.token;
  }
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(REWARDS_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, ...body }),
      signal: ctrl.signal,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401 && auth) clearSession();
    if (!res.ok || typeof data.error === 'string') {
      return { ok: false, status: res.status, error: typeof data.error === 'string' ? data.error : 'server' };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: 'network' };
  } finally {
    window.clearTimeout(timer);
  }
}

/** One `config` call per page view: is SMS sign-in switched on? */
let configPromise: Promise<boolean> | null = null;
export function otpReady(): Promise<boolean> {
  if (!configPromise) {
    configPromise = rewardsCall<{ otpReady: boolean }>('config').then((r) => (r.ok ? !!r.data.otpReady : true));
  }
  return configPromise;
}

/**
 * The guest's location, but only if they already allowed it (the chat asks at a table).
 * Never triggers a permission prompt. The function only uses it to refuse a claim made
 * from clearly far away; nothing is stored.
 */
export async function grantedGeo(): Promise<{ lat: number; lng: number; acc: number } | undefined> {
  try {
    if (!navigator.geolocation || !navigator.permissions) return undefined;
    const p = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    if (p.state !== 'granted') return undefined;
    return await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
        () => resolve(undefined),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300_000 },
      );
    });
  } catch {
    return undefined;
  }
}

/* ── shapes returned by the function ───────────────────────────────── */

export type TableBill = {
  guid: string;
  opened: string | null;
  closed: boolean;
  items: string[];
  itemCount: number;
  subtotal: number;
  points: number;
  phoneOnBill: boolean;
  claimed: 'none' | 'you' | 'other';
};
export type TableBillResult =
  | { found: true; table: string; label: string; bill: TableBill }
  | { found: false; reason: 'no_open_bill' | 'no_tables' | 'far' | 'invalid_table'; table?: string; label?: string };

export type ClaimResult = { ok: true; status: 'earned' | 'pending'; points: number };

export type Balance = {
  phoneMasked: string;
  staff: boolean;
  points: number;
  history: { date: string; label: string; points: number }[];
  pending: { date: string; label: string }[];
};

export type SignInResult = { ok: true; token: string; phoneMasked: string; points: number; staff: boolean };

/* ── wording ───────────────────────────────────────────────────────── */

const ERRORS: Record<string, string> = {
  invalid_phone: "That doesn't look like a US mobile number.",
  not_mobile: "That number can't receive texts — please use a mobile number.",
  rate_limited: 'Too many tries — please wait a few minutes and try again.',
  sms_failed: "We couldn't send the text just now. Please try again.",
  otp_unavailable: 'Text sign-in is switching on shortly — please try again soon.',
  bad_code: "That code didn't match. Check the text and try again.",
  expired: 'That code has expired — tap “Send a new code”.',
  auth: 'Please sign in again.',
  far: 'Points can only be added from the restaurant.',
  staff: "Staff phones don't earn points.",
  has_phone: 'This bill already has a phone number on it — the points go to that number.',
  already_claimed: 'This bill was already added by someone else at the table.',
  limit: "You've reached today's limit of 3 bills.",
  not_found: "We couldn't find that bill anymore — tap Refresh.",
  receipt_not_found: "We couldn't match that receipt. Check the check number, date and total.",
  not_closed: 'That bill is still open — add it at your table, or try again once it is paid.',
  not_eligible: "That order doesn't earn points (delivery-app orders and voided bills don't).",
  too_old: 'Receipts can be added up to 7 days after your visit.',
  bad_request: 'Please check the details and try again.',
  network: "Can't reach Narwhal Rewards — check your connection and try again.",
  server: 'Something went wrong on our side. Please try again.',
};

export function errorText(code: string): string {
  return ERRORS[code] ?? ERRORS.server;
}

/** "(714) 555-0123" while typing; digits only otherwise. */
export function formatUsPhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.length > 10 && d[0] === '1') d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function phoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  return d;
}
