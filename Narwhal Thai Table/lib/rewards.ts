/**
 * Narwhal Rewards — browser side of dine-in points (Oct 2026, v2).
 *
 * The backend is the Supabase Edge Function `rewards` (project ccdjnpjmdrjceadftedd,
 * source kept with the loyalty runbook). A guest confirms their phone once with an
 * SMS code (Twilio Verify); the function hands back a device token that this file
 * keeps in localStorage and sends as `x-rewards-token`. Points: 100 per $1 of food
 * and soft drinks before tax and tip — the same rule as the Toast sync.
 *
 * v2 (the money rule): a bill earns only with proof of payment — the last 4 digits of
 * the card that paid it, once Toast shows it paid in full. At the table the guest
 * checks in (location, only to decide whether to show that table's bill), may link
 * the bill while it is open, then proves it with the card digits. Cash bills: the
 * server adds the guest's phone in Toast. Table calls send v: 2.
 *
 * Used by components/rewards/* (sheet, sign-in, menu strip, /points page) and the
 * chat chip in ChatWidget. Opening the sheet from anywhere: openRewards({ table }).
 */

import { RESTAURANT } from '@/lib/site';

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

/** Digits only, at most 4 — for the card-digits boxes. */
export function last4Input(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4);
}

/** "7:42 PM" in restaurant time. */
export function timeLA(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
  } catch {
    return '';
  }
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

/* ── location (check-in at a table) ─────────────────────────────────── */

export type Geo = { lat: number; lng: number; acc: number };
export type GeoPermission = 'granted' | 'prompt' | 'denied' | 'unknown';

/** Has the guest already answered the location prompt for this site? Never prompts. */
export async function geoPermission(): Promise<GeoPermission> {
  try {
    if (!navigator.geolocation) return 'denied';
    if (!navigator.permissions) return 'unknown';
    const p = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return p.state === 'granted' || p.state === 'denied' ? p.state : 'prompt';
  } catch {
    return 'unknown';
  }
}

/**
 * The guest's location — asks for permission if needed, so call it from a tap. The
 * function only uses it to decide whether to show a table's bill to this phone (someone
 * across town shouldn't see it); it is never stored and never needed to earn points.
 */
export function requestGeo(): Promise<{ geo?: Geo; denied?: boolean }> {
  return new Promise((resolve) => {
    try {
      if (!navigator.geolocation) return resolve({ denied: true });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ geo: { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy } }),
        (err) => resolve(err.code === err.PERMISSION_DENIED ? { denied: true } : {}),
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
      );
    } catch {
      resolve({});
    }
  });
}

/* ── shapes returned by the function ───────────────────────────────── */

/** What this guest sees of one check at their table (rewards v2 `table_bill`). */
export type BillState =
  | 'open' // unpaid — link it now, prove it after paying
  | 'linked' // unpaid, linked by this guest (auto = linked for them)
  | 'linked_other' // unpaid, linked by someone else — the card payer can still prove it
  | 'paid' // paid while this guest was checked in — prove it with the card digits
  | 'paid_earlier' // paid just before this guest checked in — no details, proof only
  | 'yours' // on this guest's account
  | 'other' // added by another member
  | 'phone' // a phone number is on the check — it earns for that number
  | 'receipt_only'; // paid over 2 hours ago — use the receipt form

export type TableBill = {
  guid: string;
  state: BillState;
  auto: boolean;
  linkedByYou: boolean;
  split: boolean;
  paid: boolean;
  paidAt: string | null;
  proof: 'card' | 'cash' | null;
  items: string[];
  itemCount: number;
  subtotal: number | null;
  points: number | null;
  movedTo?: string; // a bill of theirs that the server moved to another table ("Table 8")
};

export type TableResult = {
  found: boolean;
  table: string;
  label: string;
  staff?: boolean;
  /** Why there is no check-in: need_location / rough_location / far / table_limit / busy, or no_tables. */
  reason?: string;
  /** No check-in: the bill stays hidden, but a paid bill can still be added with the card digits. */
  proofOnly?: boolean;
  seat?: { since: string };
  bills?: TableBill[];
};

export type ClaimResult = { ok: true; status: 'earned'; points: number };

export type PendingLink = {
  id: number;
  date: string;
  label: string;
  table: string | null;
  paid: boolean;
  proof: 'card' | 'cash' | null;
  movedTo?: string; // the server moved this bill to another table since it was linked
};

export type Balance = {
  phoneMasked: string;
  staff: boolean;
  points: number;
  history: { date: string; label: string; points: number }[];
  pending: PendingLink[];
};

export type SignInResult = { ok: true; token: string; phoneMasked: string; points: number; staff: boolean };

/* ── wording ───────────────────────────────────────────────────────── */

/** Shown under every card-digits box: wallet payments print the phone's own 4 digits. */
export const WALLET_HINT = 'Paid with Apple Pay or Google Pay? Use the 4 digits printed on your receipt.';

// "(714) 378-6003" kept on one line (no-break space and hyphen).
const CALL_US = RESTAURANT.phone
  ? ` (or call ${RESTAURANT.phone.replace(/^\+1\s*/, '').replace(/ /g, ' ').replace(/-/g, '‑')})`
  : '';

const ERRORS: Record<string, string> = {
  invalid_phone: "That doesn't look like a US mobile number.",
  not_mobile: "That number can't receive texts — please use a mobile number.",
  rate_limited: 'Too many tries — please wait a few minutes and try again.',
  sms_failed: "We couldn't send the text just now. Please try again.",
  otp_unavailable: 'Text sign-in is switching on shortly — please try again soon.',
  bad_code: "That code didn't match. Check the text and try again.",
  expired: 'That code has expired — tap “Send a new code”.',
  auth: 'Please sign in again.',
  need_location: 'Location is off, so we keep the bill hidden.',
  rough_location: "Your location is too rough to tell you're at the restaurant, so we keep the bill hidden.",
  far: "You don't seem to be at the restaurant, so we keep the bill hidden.",
  table_limit: "You've checked in at 3 tables today — please ask your server.",
  busy: 'Please try again in a moment.',
  checkin_required: 'Tap Refresh to show your bill first.',
  staff: "Staff phones don't earn points.",
  has_phone: 'This bill already has a phone number on it, so the points go to that number on their own — if it’s yours, they’re on the way.',
  already_claimed: 'Another member already added this bill. If it’s yours, tap “That’s my bill” and we’ll check.',
  payment_used:
    'This payment already earned points on another bill (a moved or combined bill earns once). If that looks wrong, show your receipt to our staff.',
  link_limit: 'You already have 2 bills waiting — finish or remove one first.',
  one_link: 'You already linked a bill at this table.',
  not_linkable: 'That bill can’t be linked any more — tap Refresh.',
  proof_mismatch:
    'Those digits don’t match a card that paid a bill here in the last 2 hours. Check your receipt — paid with Apple Pay or Google Pay? Use the 4 digits printed on it. Moved tables? Scan the QR code on your new table.',
  proof_mismatch_bill:
    'Those digits don’t match the card that paid this bill. Check your receipt — paid with Apple Pay or Google Pay? Use the 4 digits printed on it.',
  proof_locked: `Too many wrong tries on this bill, so it’s locked to keep it safe. Please show your receipt to our staff${CALL_US} — we’ll sort it out.`,
  cash_bill:
    'This bill was paid without a card. Ask your server to add your phone number (the one you sign in with) to it — your points land within 15 minutes.',
  need_last4:
    'Enter the last 4 digits of the card you paid with. Paid in cash? Ask us to add your phone number to the bill instead.',
  limit: "You've reached today's limit for adding bills.",
  receipt_limit: "You've added 6 receipts this week — that's the weekly limit.",
  not_found: "We couldn't find that bill anymore — tap Refresh.",
  receipt_not_found:
    "We couldn't match that receipt. Check the check number, date, total (before or after tip) and the card's last 4.",
  not_closed: 'That bill isn’t fully paid yet — try again once it’s settled.',
  not_eligible: "That bill doesn't earn points (drinks only, refunded or voided, or a delivery-app order).",
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
