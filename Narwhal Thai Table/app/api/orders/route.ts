import { listOrders, setOrderStatus, type OrderStatus } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Staff-only order queue API. Same token as /stats: ?key=STATS_TOKEN */

function authed(req: Request): boolean {
  const token = process.env.STATS_TOKEN;
  const key = new URL(req.url).searchParams.get('key') || '';
  return Boolean(token) && key === token;
}

export async function GET(req: Request) {
  if (!authed(req)) return new Response('Not found', { status: 404 });
  return Response.json({ orders: await listOrders() });
}

export async function POST(req: Request) {
  if (!authed(req)) return new Response('Not found', { status: 404 });
  let body: { id?: string; status?: string } | null = null;
  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    /* fallthrough */
  }
  const status = body?.status as OrderStatus | undefined;
  if (!body?.id || !status || !['approved', 'done', 'cancelled'].includes(status)) {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }
  const ok = await setOrderStatus(String(body.id), status);
  return Response.json({ ok });
}
