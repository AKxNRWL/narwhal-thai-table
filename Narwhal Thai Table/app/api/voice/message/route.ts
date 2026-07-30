import { submitMessage } from '@/lib/message';

/**
 * Phone line — messages and callback requests.
 *
 * The ElevenLabs voice host calls this for anything the phone host cannot
 * finish on the call: catering, private events, complaints, press, suppliers,
 * a compliment, or simply "have someone call me back".
 *
 * Same destination as a website message (welcome@narwhalthaihb.com + the
 * aileen-messages blob store), tagged aileen-phone. Email is OPTIONAL here —
 * nobody wants to spell an address out loud — the phone number is what matters.
 *
 * Security: shared secret in the `x-phone-secret` header (PHONE_ORDER_SECRET).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  topic?: string;
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

  const name = s(body.name, 80);
  const phone = s(body.phone, 40).replace(/[^\d+()\-\s]/g, '');
  const message = s(body.message, 1200);

  const missing = [!name && 'name', !phone && 'phone number', !message && 'reason for the call'].filter(
    Boolean,
  );

  if (missing.length) {
    return Response.json(
      {
        ok: false,
        error: 'missing_details',
        message: `Not sent yet — still missing the caller's ${missing.join(', ')}. Ask warmly, one thing at a time, read the phone number back digit by digit, then try again.`,
      },
      { status: 422 },
    );
  }

  const result = await submitMessage({
    name,
    phone,
    email: s(body.email, 120),
    message,
    topic: s(body.topic, 80) || 'Phone callback request',
    source: 'phone',
  });

  if (!result.ok) {
    return Response.json(
      {
        ok: false,
        error: 'submit_failed',
        message:
          'Could not send it just now. Apologize once and ask the caller to try 714-378-6003 again a little later, or to email welcome@narwhalthaihb.com.',
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    id: result.id,
    message: `Message ${result.id} passed to the team for ${name} at ${phone}. Warmly confirm in one sentence that the team will call back, then ask if there is anything else.`,
  });
}
