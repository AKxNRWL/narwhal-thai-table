import { ownerOk, hasAI } from '@/lib/agents';
import { getToastToday } from '@/lib/toast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Toast connection health — the single place to confirm "is Toast wired up?".
   Shows which env vars are set (booleans only, never the values) and whether a
   real call to Toast actually succeeds. Open this right after setting the env
   vars + redeploying to verify the switch flipped. Owner-gated. */
export async function GET(req: Request) {
  if (!(await ownerOk(req))) return Response.json({ ok: false }, { status: 401 });

  const env = {
    TOAST_HOSTNAME: !!process.env.TOAST_HOSTNAME,
    TOAST_CLIENT_ID: !!process.env.TOAST_CLIENT_ID,
    TOAST_CLIENT_SECRET: !!process.env.TOAST_CLIENT_SECRET,
    TOAST_RESTAURANT_GUID: !!process.env.TOAST_RESTAURANT_GUID,
  };
  const configured = env.TOAST_CLIENT_ID && env.TOAST_CLIENT_SECRET && env.TOAST_RESTAURANT_GUID;

  const d = await getToastToday();

  return Response.json(
    {
      ok: true,
      connected: d.connected,
      configured,
      businessDate: d.businessDate ?? null,
      salesToday: d.connected && d.today ? d.today.sales : null,
      error: d.error ?? null,
      env,
      ai: hasAI(),
      checkedAt: new Date().toISOString(),
      hint: configured
        ? d.connected
          ? 'ต่อ Toast สำเร็จ ✓ ระบบใช้ข้อมูลจริงแล้ว'
          : 'ตั้ง env ครบแล้วแต่เรียก Toast ไม่สำเร็จ — เช็ค client id / secret / GUID หรือสิทธิ์ Toast API'
        : 'ยังไม่ได้ตั้ง env ของ Toast — ระบบทำงานโหมดเดโม (ดู .env.example และ runbook)',
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
