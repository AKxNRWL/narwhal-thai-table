/**
 * Customer book + comeback coupons — the retention loop.
 *
 * Every touchpoint that captures contact info (reservations, Aileen messages,
 * phone orders) calls upsertCustomer() best-effort, so guests accumulate in
 * ONE customer book instead of evaporating after each visit. The owner sees
 * the book on /stats, issues a comeback coupon per guest, copies a ready-made
 * TH/EN invite message to send (SMS/LINE/IG DM — no email provider needed),
 * and staff redeem the code at the counter from the same page.
 *
 * Design rules:
 *  - upsertCustomer NEVER throws and never blocks the caller's main flow —
 *    losing a customer-book write must never lose a reservation/order.
 *  - A guest is identifiable only with a phone or an email; records are
 *    merged by normalized phone first, then email.
 *  - Pilot store is un-namespaced (same convention as aileen-* stores);
 *    future SaaS tenants namespace by key, mirroring lib/tenants.dataFor().
 */
import { getStore } from '@netlify/blobs';

export const CUSTOMERS_STORE = 'narwhal-customers';
export const CUSTOMERS_KEY = 'list';
const MAX = 5000;

export type CustomerSource = 'reservation' | 'order' | 'phone' | 'message' | 'game';

export type Coupon = {
  code: string; // e.g. "NWT-7K2F" — short enough to read over a counter
  offer: string; // human text, e.g. "10% off next visit"
  issuedAt: string;
  expiresAt: string;
  redeemedAt?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string; // display form as given by the guest ('' if unknown)
  email: string; // lowercased ('' if unknown)
  firstSeen: string;
  lastSeen: string;
  visits: number; // touchpoints we saw (reservations/orders/messages)
  sources: CustomerSource[];
  coupons: Coupon[];
};

export type UpsertInput = {
  name?: string;
  phone?: string;
  email?: string;
  source: CustomerSource;
};

const clip = (s: string | undefined, n: number): string =>
  (s ?? '').toString().replace(/\s+/g, ' ').trim().slice(0, n);

/** Digits-only key for matching; US 11-digit with leading 1 folds to 10. */
export function phoneKey(phone: string | undefined): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

export function emailKey(email: string | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

async function readAll(): Promise<CustomerRecord[]> {
  const store = getStore({ name: CUSTOMERS_STORE, consistency: 'strong' });
  const arr = await store.get(CUSTOMERS_KEY, { type: 'json' });
  return Array.isArray(arr) ? (arr as CustomerRecord[]) : [];
}

async function writeAll(list: CustomerRecord[]): Promise<void> {
  const store = getStore({ name: CUSTOMERS_STORE, consistency: 'strong' });
  await store.setJSON(CUSTOMERS_KEY, list.slice(-MAX));
}

/**
 * Add or update a guest in the customer book. Fire-and-forget safe:
 * catches everything, returns { ok:false } instead of throwing.
 */
export async function upsertCustomer(
  input: UpsertInput,
): Promise<{ ok: boolean; id?: string; isNew?: boolean }> {
  try {
    const name = clip(input.name, 80);
    const phone = clip(input.phone, 40);
    const email = emailKey(clip(input.email, 120));
    const pKey = phoneKey(phone);
    if (!pKey && !email) return { ok: false }; // nothing identifiable to remember

    const now = new Date().toISOString();
    const list = await readAll();

    const found = list.find(
      (c) =>
        (pKey && phoneKey(c.phone) === pKey) ||
        (email && emailKey(c.email) === email),
    );

    if (found) {
      found.lastSeen = now;
      found.visits += 1;
      if (!found.name && name) found.name = name;
      if (!found.phone && phone) found.phone = phone;
      if (!found.email && email) found.email = email;
      if (!found.sources.includes(input.source)) found.sources.push(input.source);
      await writeAll(list);
      return { ok: true, id: found.id, isNew: false };
    }

    const rec: CustomerRecord = {
      id: 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      phone,
      email,
      firstSeen: now,
      lastSeen: now,
      visits: 1,
      sources: [input.source],
      coupons: [],
    };
    list.push(rec);
    await writeAll(list);
    return { ok: true, id: rec.id, isNew: true };
  } catch (e) {
    console.error('upsertCustomer failed', e);
    return { ok: false };
  }
}

export async function listCustomers(): Promise<CustomerRecord[]> {
  try {
    return await readAll();
  } catch {
    return [];
  }
}

/* ----------------------------- coupons ----------------------------- */

// No 0/O/1/I — every character survives being read aloud over a counter.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeCode(): string {
  let s = '';
  for (let i = 0; i < 4; i++) {
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return 'NWT-' + s;
}

export function couponActive(c: Coupon, nowMs: number = Date.now()): boolean {
  return !c.redeemedAt && Date.parse(c.expiresAt) > nowMs;
}

export function activeCoupon(rec: CustomerRecord, nowMs: number = Date.now()): Coupon | null {
  return rec.coupons.find((c) => couponActive(c, nowMs)) ?? null;
}

/**
 * Issue a comeback coupon. If the guest already holds an active one,
 * that coupon is returned instead of stacking a second offer.
 */
export async function issueCoupon(
  customerId: string,
  offer: string,
  validDays: number = 14,
): Promise<{ ok: boolean; coupon?: Coupon; customer?: CustomerRecord; error?: string }> {
  try {
    const list = await readAll();
    const rec = list.find((c) => c.id === customerId);
    if (!rec) return { ok: false, error: 'customer not found' };

    const existing = activeCoupon(rec);
    if (existing) return { ok: true, coupon: existing, customer: rec };

    const now = Date.now();
    const coupon: Coupon = {
      code: makeCode(),
      offer: clip(offer, 120) || '10% off next visit',
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + validDays * 24 * 60 * 60 * 1000).toISOString(),
    };
    rec.coupons.push(coupon);
    await writeAll(list);
    return { ok: true, coupon, customer: rec };
  } catch (e) {
    console.error('issueCoupon failed', e);
    return { ok: false, error: 'store write failed' };
  }
}

/**
 * Redeem a code at the counter. Case/dash tolerant ("nwt7k2f" works).
 */
export async function redeemCoupon(
  code: string,
): Promise<{ ok: boolean; customerName?: string; offer?: string; error?: string }> {
  try {
    const wanted = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!wanted) return { ok: false, error: 'empty code' };

    const list = await readAll();
    for (const rec of list) {
      for (const c of rec.coupons) {
        if (c.code.replace(/[^A-Z0-9]/g, '') !== wanted) continue;
        if (c.redeemedAt) return { ok: false, error: 'already redeemed', customerName: rec.name };
        if (Date.parse(c.expiresAt) <= Date.now()) {
          return { ok: false, error: 'expired', customerName: rec.name };
        }
        c.redeemedAt = new Date().toISOString();
        await writeAll(list);
        return { ok: true, customerName: rec.name || 'guest', offer: c.offer };
      }
    }
    return { ok: false, error: 'code not found' };
  } catch (e) {
    console.error('redeemCoupon failed', e);
    return { ok: false, error: 'store write failed' };
  }
}

/* ---------------------------- segments ----------------------------- */

export type CustomerSegments = {
  total: number;
  new7d: number; // first seen within 7 days
  regulars: number; // 2+ touchpoints
  lapsed21d: number; // quiet for 21+ days
  withActiveCoupon: number;
  redeemed: number; // coupons ever redeemed = loop actually closed
};

export function segmentCustomers(
  list: CustomerRecord[],
  nowMs: number = Date.now(),
): CustomerSegments {
  const DAY = 24 * 60 * 60 * 1000;
  let new7d = 0;
  let regulars = 0;
  let lapsed21d = 0;
  let withActiveCoupon = 0;
  let redeemed = 0;
  for (const c of list) {
    if (nowMs - Date.parse(c.firstSeen) <= 7 * DAY) new7d += 1;
    if (c.visits >= 2) regulars += 1;
    if (nowMs - Date.parse(c.lastSeen) >= 21 * DAY) lapsed21d += 1;
    if (activeCoupon(c, nowMs)) withActiveCoupon += 1;
    redeemed += c.coupons.filter((x) => x.redeemedAt).length;
  }
  return { total: list.length, new7d, regulars, lapsed21d, withActiveCoupon, redeemed };
}
