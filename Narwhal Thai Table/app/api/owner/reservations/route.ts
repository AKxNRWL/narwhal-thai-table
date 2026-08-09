import { getStore } from '@netlify/blobs';
import { readCookie, readSession } from '@/lib/session';
import { dataFor, getTenant } from '@/lib/tenants';
import { looksLikeEmail, sendReservationConfirmed } from '@/lib/guestMail';

/**
 * Owner action on one reservation — the "Confirm" button in the Control Room.
 *
 *   POST { action: 'confirm',   id, note?, resend? }
 *   POST { action: 'unconfirm', id }
 *
 * Confirming does two things: it stamps the stored record (status/confirmedAt)
 * and it emails the guest "your table is confirmed". A second Confirm click is
 * a no-op unless resend:true — nobody wants to send the same guest four emails.
 *
 * Guarded by the owner session cookie, scoped to the logged-in tenant's own
 * blob key, exactly like /api/owner/data.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Rec = Record<string, unknown>;
const str = (r: Rec, k: string): string => (typeof r[k] === 'string' ? (r[k] as string) : '');

export async function POST(req: Request) {
  const sess = readSession(readCookie(req));
  if (!sess) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const tenant = await getTenant(sess.tenantId);
  if (!tenant) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { action?: string; id?: string; note?: string; resend?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  const action = String(body.action || '');
  const id = String(body.id || '').trim();
  const note = String(body.note || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!id) return Response.json({ ok: false, error: 'missing id' }, { status: 400 });
  if (action !== 'confirm' && action !== 'unconfirm') {
    return Response.json({ ok: false, error: 'unknown action' }, { status: 400 });
  }

  const loc = dataFor(tenant.id);
  const store = getStore({ name: loc.reservations.store, consistency: 'strong' });

  let list: Rec[];
  try {
    const raw = await store.get(loc.reservations.key, { type: 'json' });
    list = Array.isArray(raw) ? (raw as Rec[]) : [];
  } catch {
    return Response.json({ ok: false, error: 'store unavailable' }, { status: 503 });
  }

  const idx = list.findIndex((r) => str(r, 'id') === id);
  if (idx < 0) return Response.json({ ok: false, error: 'not found' }, { status: 404 });
  const rec = list[idx];

  if (action === 'unconfirm') {
    list[idx] = { ...rec, status: 'new', confirmedAt: '', confirmEmailed: false };
    await store.setJSON(loc.reservations.key, list);
    return Response.json({ ok: true, status: 'new', emailed: false });
  }

  // ── confirm ──────────────────────────────────────────────────────────────
  const already = str(rec, 'status') === 'confirmed';
  if (already && !body.resend) {
    return Response.json({ ok: true, status: 'confirmed', emailed: false, already: true });
  }

  const email = str(rec, 'email');
  let emailed = false;
  let mailError = '';
  if (looksLikeEmail(email)) {
    const r = await sendReservationConfirmed(
      {
        first_name: str(rec, 'first_name'),
        last_name: str(rec, 'last_name'),
        email,
        phone: str(rec, 'phone'),
        date: str(rec, 'date'),
        time: str(rec, 'time'),
        party_size: str(rec, 'party_size'),
        notes: str(rec, 'notes'),
      },
      note || undefined,
    );
    emailed = r.sent;
    mailError = r.error || '';
  } else {
    mailError = 'no email on file — call the guest instead';
  }

  // The stamp lands either way: the team confirmed it, mail or no mail.
  list[idx] = {
    ...rec,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
    confirmEmailed: emailed,
    ...(note ? { confirmNote: note } : {}),
  };
  try {
    await store.setJSON(loc.reservations.key, list);
  } catch {
    return Response.json({ ok: false, error: 'could not save', emailed }, { status: 503 });
  }

  return Response.json({ ok: true, status: 'confirmed', emailed, ...(emailed ? {} : { mailError }) });
}
