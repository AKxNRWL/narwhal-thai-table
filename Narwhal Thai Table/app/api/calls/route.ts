import { listCalls, ackCall } from '@/lib/calls';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Staff-only "table is calling" API. Same token as /stats and /orders: ?key=STATS_TOKEN */

function authed(req: Request): boolean {
  const token = process.env.STATS_TOKEN;
  const key = new URL(req.url).searchParams.get('key') || '';
  return Boolean(token) && key === token;
}

export async function GET(req: Request) {
  if (!authed(req)) return new Response('Not found', { status: 404 });
  return Response.json({ calls: await listCalls() });
}

export async function POST(req: Request) {
  if (!authed(req)) return new Response('Not found', { status: 404 });
  let body: { id?: string } | null = null;
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    /* fallthrough */
  }
  if (!body?.id) return Response.json({ error: 'bad request' }, { status: 400 });
  const ok = await ackCall(String(body.id));
  return Response.json({ ok });
}
