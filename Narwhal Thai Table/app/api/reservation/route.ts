import { submitReservation } from '@/lib/reservation';

/**
 * Website reservation form → the same pipeline as Aileen's bookings.
 *
 * WHY THIS EXISTS: components/ReserveForm.tsx used to POST straight to
 * /__forms.html, which only ever emails the restaurant. Going through here
 * instead means a website booking also lands in the Control Room list and the
 * guest gets the "we've got your request" email — same as a chat or phone one.
 *
 * Public on purpose (it is a public booking form). Defences: honeypot field,
 * required-field validation, and a size cap on every string. The Netlify form
 * notification still fires inside submitReservation, so Netlify's own spam
 * filtering keeps working on the restaurant-facing copy.
 *
 * The form falls back to posting /__forms.html directly if this route fails —
 * a booking must never be lost because our extras broke.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Payload = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  party_size?: string;
  notes?: string;
  'bot-field'?: string;
};

const s = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields, people don't. Answer 200 so the bot
  // thinks it worked and doesn't retry.
  if (s(body['bot-field'], 50)) return Response.json({ ok: true, id: 'ignored' });

  const first_name = s(body.first_name, 80);
  const phone = s(body.phone, 40);
  const date = s(body.date, 60);
  const time = s(body.time, 40);
  const party_size = s(body.party_size, 40);

  if (!first_name || !phone || !date || !time || !party_size) {
    return Response.json({ ok: false, error: 'missing required fields' }, { status: 422 });
  }

  const result = await submitReservation({
    first_name,
    last_name: s(body.last_name, 80) || undefined,
    phone,
    email: s(body.email, 120) || undefined,
    date,
    time,
    party_size,
    notes: s(body.notes, 400) || undefined,
    source: 'web',
  });

  if (!result.ok) return Response.json({ ok: false, error: 'submit failed' }, { status: 502 });

  return Response.json({ ok: true, id: result.id, guestEmailed: result.guestEmailed });
}
