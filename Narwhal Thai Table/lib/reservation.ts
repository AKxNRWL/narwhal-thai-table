/**
 * Reservation submission for Aileen (the chat host).
 *
 * When Aileen has collected a guest's reservation details in chat, the chat
 * route calls submitReservation(), which:
 *   1) POSTs to the existing Netlify "reservation" form (/__forms.html) so the
 *      already-configured email notification fires to reservations@narwhalthaihb.com
 *      — exactly the same path the website's ReserveForm uses.
 *   2) Appends a record to a Netlify Blobs store (aileen-reservations) so every
 *      chat booking is also saved for the dashboard / as a backup.
 *
 * It returns ok=true if EITHER channel succeeded. This is a reservation
 * REQUEST — the team still confirms by phone/email; no payment is taken.
 */
import { getStore } from '@netlify/blobs';
import { upsertCustomer } from './customers';

export const RESV_STORE = 'aileen-reservations';
export const RESV_KEY = 'list';
const MAX = 1000;

export type ReservationInput = {
  first_name: string;
  last_name?: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  party_size: string;
  notes?: string;
};

export type ReservationResult = { ok: boolean; id: string; emailed: boolean; stored: boolean };

// Netlify sets URL to the main site address at runtime; fall back to the domain.
const SITE = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://narwhalthaihb.com';

const clip = (s: string | undefined, n = 200): string =>
  (s ?? '').toString().replace(/\s+/g, ' ').trim().slice(0, n);

export async function submitReservation(input: ReservationInput): Promise<ReservationResult> {
  const id = 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const rec = {
    id,
    ts: new Date().toISOString(),
    source: 'aileen-chat',
    first_name: clip(input.first_name, 80),
    last_name: clip(input.last_name, 80),
    phone: clip(input.phone, 40),
    email: clip(input.email, 120),
    date: clip(input.date, 60),
    time: clip(input.time, 40),
    party_size: clip(input.party_size, 40),
    notes: clip(input.notes, 400),
  };

  // 1) Email the restaurant via the existing Netlify "reservation" form.
  let emailed = false;
  try {
    const params = new URLSearchParams({
      'form-name': 'reservation',
      first_name: rec.first_name,
      last_name: rec.last_name,
      email: rec.email,
      phone: rec.phone,
      date: rec.date,
      time: rec.time,
      party_size: rec.party_size,
      notes: (rec.notes ? rec.notes + ' — ' : '') + 'Booked via Aileen chat',
    });
    const res = await fetch(`${SITE}/__forms.html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    emailed = res.ok;
  } catch {
    emailed = false;
  }

  // 2) Save a record to Netlify Blobs (backup + future dashboard).
  let stored = false;
  try {
    const store = getStore({ name: RESV_STORE, consistency: 'strong' });
    const existing = (await store.get(RESV_KEY, { type: 'json' })) as unknown;
    const list = Array.isArray(existing) ? (existing as unknown[]) : [];
    list.push({ ...rec, emailed });
    await store.setJSON(RESV_KEY, list.slice(-MAX));
    stored = true;
  } catch {
    stored = false;
  }

  // 3) Retention: remember the guest in the customer book (best-effort —
  //    upsertCustomer never throws, and must never block a reservation).
  await upsertCustomer({
    name: [rec.first_name, rec.last_name].filter(Boolean).join(' '),
    phone: rec.phone,
    email: rec.email,
    source: 'reservation',
  });

  return { ok: emailed || stored, id, emailed, stored };
}
