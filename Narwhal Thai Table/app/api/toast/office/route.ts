import { requireSession } from '@/lib/session';
import { getToastToday } from '@/lib/toast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Toast -> AI Office data feed (today's sales / covers / labor).
   Gated by the owner session (same nwh_owner cookie as /stats, /cal).
   Uses shared lib/toast.ts. Returns { connected:false } when Toast env
   is absent so the office shows demo mode. See virtual-ai-office/TOAST-SETUP.md */

export async function GET(req: Request) {
  const sess = await requireSession(req);
  if (!sess) return Response.json({ ok: false }, { status: 401 });

  const d = await getToastToday();
  if (!d.connected) {
    return Response.json({ connected: false, demo: true, note: d.error ?? 'Toast env not set' });
  }
  return Response.json(d, { headers: { 'cache-control': 'no-store' } });
}
