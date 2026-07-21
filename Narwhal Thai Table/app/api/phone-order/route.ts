import { submitOrder, type OrderItem } from '@/lib/orders';
import { upsertCustomer } from '@/lib/customers';
import { DISHES } from '@/lib/dishes';

/**
 * Phone Order Line — the voice AI (Retell agent "Aileen") calls this endpoint
 * when the caller has confirmed their to-go order.
 *
 * Security: shared secret in the `x-phone-secret` header (PHONE_ORDER_SECRET env).
 * The order lands in the same staff queue (/orders) as chat orders, marked PHONE.
 * Staff collect payment at pickup BEFORE keying into Toast — same rule as TO-GO.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MENU_NAMES = new Set(DISHES.map((d) => d.name.toLowerCase()));

type Payload = {
  guest_name?: string;
  phone?: string;
  pickup_time?: string;
  items?: Array<{ item?: string; qty?: number; protein?: string; spice?: string; notes?: string }>;
  notes?: string;
};

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

  const guestName = String(body.guest_name ?? '').trim().slice(0, 60);
  if (!guestName) {
    return Response.json(
      { ok: false, error: 'guest_name required — ask the caller for a name for the order.' },
      { status: 422 },
    );
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: OrderItem[] = rawItems
    .slice(0, 20)
    .map((o) => ({
      item: String(o?.item ?? '').slice(0, 80),
      qty: Math.max(1, Math.min(20, Number(o?.qty ?? 1) || 1)),
      protein: o?.protein ? String(o.protein).slice(0, 40) : undefined,
      spice: o?.spice ? String(o.spice).slice(0, 30) : undefined,
      notes: o?.notes ? String(o.notes).slice(0, 120) : undefined,
    }))
    .filter((it) => it.item);

  if (!items.length) {
    return Response.json({ ok: false, error: 'no items' }, { status: 422 });
  }

  // Soft validation: flag unknown dish names so the agent can correct itself.
  const unknown = items
    .map((it) => it.item)
    .filter((n) => !MENU_NAMES.has(n.toLowerCase()));

  const phone = body.phone ? String(body.phone).replace(/[^\d+()\-\s]/g, '').slice(0, 20) : '';
  const pickup = body.pickup_time ? String(body.pickup_time).slice(0, 40) : 'ASAP';
  const extra = body.notes ? ` · ${String(body.notes).slice(0, 140)}` : '';

  const result = await submitOrder({
    table: 'PHONE',
    items,
    guest_name: guestName,
    notes: `📞 pickup ${pickup}${phone ? ` · ${phone}` : ''}${extra}`,
  });

  if (!result.ok) {
    return Response.json({ ok: false, error: 'queue write failed' }, { status: 500 });
  }

  // Retention: phone callers who leave a number go into the customer book
  // (best-effort; never blocks the order response back to the voice agent).
  if (phone) await upsertCustomer({ name: guestName, phone, source: 'phone' });

  return Response.json({
    ok: true,
    id: result.id,
    unknown_items: unknown, // agent should re-confirm these with the caller if non-empty
    message: `Order ${result.id} received for ${guestName}. Tell the caller: pickup ${pickup}, pay at the counter when they arrive, and we'll call their name.`,
  });
}
