import { requireSession } from '@/lib/session';
import { getTenant } from '@/lib/tenants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sess = await requireSession(req);
  if (!sess) return Response.json({ ok: false }, { status: 401 });
  const tenant = await getTenant(sess.tenantId);
  if (!tenant) return Response.json({ ok: false }, { status: 401 });
  return Response.json(
    { ok: true, tenant: { id: tenant.id, name: tenant.name } },
    { headers: { 'cache-control': 'no-store' } },
  );
}
