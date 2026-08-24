import { requireSession } from '@/lib/session';
import { getTenant } from '@/lib/tenants';
import {
  issueCoupon,
  listCustomers,
  redeemCoupon,
  activeCoupon,
} from '@/lib/customers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Owner-only customer-book actions (same signed-cookie auth as /api/owner/data):
     POST { action:'issue',  customerId, offer?, validDays? } → issue/reuse a comeback coupon
     POST { action:'redeem', code }                           → redeem at the counter
     GET  ?format=csv                                         → export the book (backup / mail tools) */

async function authed(req: Request): Promise<boolean> {
  const sess = await requireSession(req);
  if (!sess) return false;
  return Boolean(await getTenant(sess.tenantId));
}

export async function POST(req: Request) {
  if (!(await authed(req))) return Response.json({ ok: false }, { status: 401 });

  let body: {
    action?: string;
    customerId?: string;
    offer?: string;
    validDays?: number;
    code?: string;
  } | null = null;
  try {
    body = await req.json();
  } catch {
    /* fallthrough */
  }

  if (body?.action === 'issue' && body.customerId) {
    const days = Math.max(1, Math.min(90, Number(body.validDays ?? 14) || 14));
    const res = await issueCoupon(String(body.customerId), String(body.offer ?? ''), days);
    return Response.json(res, { status: res.ok ? 200 : 400 });
  }

  if (body?.action === 'redeem' && body.code) {
    const res = await redeemCoupon(String(body.code));
    return Response.json(res, { status: 200 }); // errors are expected outcomes at the counter
  }

  return Response.json({ ok: false, error: 'bad request' }, { status: 400 });
}

export async function GET(req: Request) {
  if (!(await authed(req))) return Response.json({ ok: false }, { status: 401 });

  const url = new URL(req.url);
  if (url.searchParams.get('format') !== 'csv') {
    return Response.json({ ok: true, customers: await listCustomers() });
  }

  const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';
  const rows = [
    ['id', 'name', 'phone', 'email', 'first_seen', 'last_seen', 'visits', 'sources', 'active_coupon'],
    ...(await listCustomers()).map((c) => [
      c.id,
      c.name,
      c.phone,
      c.email,
      c.firstSeen,
      c.lastSeen,
      String(c.visits),
      c.sources.join('|'),
      activeCoupon(c)?.code ?? '',
    ]),
  ];
  const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
  // BOM so Excel opens Thai names as UTF-8 instead of mojibake.
  return new Response('\uFEFF' + csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="narwhal-customers.csv"',
      'cache-control': 'no-store',
    },
  });
}
