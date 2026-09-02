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
 *   3) Emails the GUEST a "we've got your request" acknowledgement — only when
 *      they gave us an email address. The *confirmation* email is a separate,
 *      later step the team fires from the Control Room. See lib/guestMail.ts.
 *
 * It returns ok=true if EITHER channel (1) or (2) succeeded — the guest email
 * is best-effort and never decides the outcome. This is a reservation
 * REQUEST — the team still confirms by phone/email; no payment is taken.
 */
import { getStore } from '@netlify/blobs';
import { upsertCustomer } from './customers';
import { looksLikeEmail, sendReservationReceived } from './guestMail';
import { notifyHQ } from './hqNotify';

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
  /** Where the booking came from — the website form, Aileen chat, or the call line. */
  source?: 'chat' | 'phone' | 'web';
};

export type ReservationResult = {
  ok: boolean;
  id: string;
  /** The restaurant was notified (Netlify form email to reservations@). */
  emailed: boolean;
  stored: boolean;
  /** The guest got the "we've got your request" acknowledgement. */
  guestEmailed: boolean;
};

// Netlify sets URL to the main site address at runtime; fall back to the domain.
const SITE = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://narwhalthaihb.com';

const clip = (s: string | undefined, n = 200): string =>
  (s ?? '').toString().replace(/\s+/g, ' ').trim().slice(0, n);

export async function submitReservation(input: ReservationInput): Promise<ReservationResult> {
  const id = 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const via =
    input.source === 'phone' ? 'Aileen phone line' : input.source === 'web' ? 'the website form' : 'Aileen chat';
  const rec = {
    id,
    ts: new Date().toISOString(),
    source: input.source === 'phone' ? 'aileen-phone' : input.source === 'web' ? 'web' : 'aileen-chat',
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
      notes: (rec.notes ? rec.notes + ' — ' : '') + `Booked via ${via}`,
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

  // 2) Acknowledge to the GUEST right away, when we have an address to write to.
  //    Best-effort: a mail failure must never cost us the booking.
  let guestEmailed = false;
  if (looksLikeEmail(rec.email)) {
    const r = await sendReservationReceived({
      first_name: rec.first_name,
      last_name: rec.last_name,
      email: rec.email,
      phone: rec.phone,
      date: rec.date,
      time: rec.time,
      party_size: rec.party_size,
      notes: rec.notes,
    });
    guestEmailed = r.sent;
    if (!r.sent) console.warn('[reservation] guest ack email not sent:', r.error);
  }

  // 3) Save a record to Netlify Blobs (backup + Control Room list).
  //    status: 'new' until the team confirms it in /stats.
  let stored = false;
  try {
    const store = getStore({ name: RESV_STORE, consistency: 'strong' });
    const existing = (await store.get(RESV_KEY, { type: 'json' })) as unknown;
    const list = Array.isArray(existing) ? (existing as unknown[]) : [];
    list.push({ ...rec, emailed, guestEmailed, status: 'new' });
    await store.setJSON(RESV_KEY, list.slice(-MAX));
    stored = true;
  } catch {
    stored = false;
  }

  // 4) Retention: remember the guest in the customer book (best-effort —
  //    upsertCustomer never throws, and must never block a reservation).
  await upsertCustomer({
    name: [rec.first_name, rec.last_name].filter(Boolean).join(' '),
    phone: rec.phone,
    email: rec.email,
    source: 'reservation',
  });

  // 5) 🔔 Ping the owner's HQ app (Web Push + inbox log). Best-effort, ≤3.5s.
  if (emailed || stored) {
    const guest = [rec.first_name, rec.last_name].filter(Boolean).join(' ') || 'ไม่ระบุชื่อ';
    const partyN = (rec.party_size.match(/\d+/) || [rec.party_size || '?'])[0]; // "2 Guests" → 2
    await notifyHQ({
      title: `📅 จองใหม่ ${partyN} ท่าน · ${guest}`,
      body: `${rec.date} ${rec.time} · ☎ ${rec.phone || '-'}${rec.notes ? ' · ' + rec.notes : ''} · ผ่าน${via.replace('the website form', 'ฟอร์มเว็บ').replace('Aileen phone line', 'โทร Aileen').replace('Aileen chat', 'แชต Aileen')}`,
      url: './#inbox',
      tag: 'resv-' + id,
    });
  }

  return { ok: emailed || stored, id, emailed, stored, guestEmailed };
}
