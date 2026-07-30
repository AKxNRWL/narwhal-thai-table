import { submitReservation } from '@/lib/reservation';

/**
 * Phone line — reservation requests.
 *
 * The ElevenLabs voice host ("Aileen — Order Line") calls this once the caller
 * has confirmed their booking details. It lands in the SAME place as a website
 * reservation: the Netlify form email to reservations@narwhalthaihb.com plus the
 * aileen-reservations blob store — only tagged aileen-phone.
 *
 * Security: shared secret in the `x-phone-secret` header (PHONE_ORDER_SECRET).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Payload = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  date?: string;
  time?: string;
  party_size?: string;
  notes?: string;
};

const s = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function POST(req: Request) {
  const secret = process.env.PHONE_ORDER_SECRET;
  if (!secret || req.headers.get('x-phone-secret') !== secret) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  const first_name = s(body.first_name, 80);
  const phone = s(body.phone, 40).replace(/[^\d+()\-\s]/g, '');
  const date = s(body.date, 60);
  const time = s(body.time, 40);
  const party_size = s(body.party_size, 40);

  const missing = [
    !first_name && 'name',
    !phone && 'phone number',
    !date && 'date',
    !time && 'time',
    !party_size && 'party size',
  ].filter(Boolean);

  if (missing.length) {
    return Response.json(
      {
        ok: false,
        error: 'missing_details',
        message: `Not sent yet — still missing the caller's ${missing.join(', ')}. Ask for it warmly, one thing at a time, then try again.`,
      },
      { status: 422 },
    );
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
    source: 'phone',
  });

  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: 'submit_failed',
        message:
          'Could not send it just now. Apologize once, and let the caller know the team will need them to call back on 714-378-6003 or book on the website.',
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    id: result.id,
    message: `Reservation request ${result.id} received for ${first_name}, ${party_size} guests, ${date} at ${time}. Tell the caller warmly that the team will confirm by phone shortly — it is a request, not a guaranteed table — and restate the date, time and party size once.`,
  });
}
