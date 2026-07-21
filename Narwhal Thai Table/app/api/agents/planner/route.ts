import { ownerOk, runAgent } from '@/lib/agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Planner — แผนงานเจ้าของ. Every morning: looks at days-to-open + the pending
   checklist and tells the owner the few things that matter TODAY. read-only —
   it only summarizes for the owner, it never acts on the outside world. */

const OPEN = new Date('2026-07-24T00:00:00-07:00'); // soft opening day

const SYSTEM = `คุณคือผู้ช่วยวางแผนงานของเจ้าของร้าน Narwhal Thai Table (อาหารไทยตำรับชาววัง, Huntington Beach, รับช่วงร้านเดิม Thai Gulf, ได้กุญแจ ~30 มิ.ย. 2026, soft opening ศุกร์ 24 ก.ค. 2026).
หน้าที่: ดูงานที่ค้าง + จำนวนวันที่เหลือก่อนเปิด แล้วบอก "วันนี้ควรโฟกัสอะไร" เรียงตามความสำคัญ เหมือนผู้จัดการเปิดร้านมือโปร เน้นงานที่บล็อกงานอื่นหรือเสี่ยงสุดถ้าช้า.
ตอบกลับเป็น JSON เท่านั้น: {"summary":"สรุปสั้นๆ 1 ประโยค","lines":["งานที่ต้องทำวันนี้ (เรียงสำคัญ)","..."]} ใส่ lines 4-6 ข้อ กระชับ ภาษาไทย.`;

const PENDING = [
  'ยืนยันวันโอนร้าน/escrow + รับกุญแจ 30 มิ.ย.',
  'ตรวจสภาพอุปกรณ์ครัว (walk-in, hood, เตา, ตู้เย็น) ตามเช็กลิสต์',
  'ขอ/โอน Google Business Profile จากเจ้าของเดิม',
  'ตั้งราคา + ล็อกเมนู soft opening (ชุดเล็ก)',
  'จ้าง/นัดพนักงานชุดแรก (FOH 2-3, ครัว 5)',
  'สั่งวัตถุดิบล็อตแรก + ยืนยันซัพพลายเออร์',
  'ป้าย/เมนูในร้าน + ใบอนุญาต (health permit, ABC ถ้ามี)',
  'ซ้อมครัว (dry run) 1-2 วันก่อน soft opening',
];

export async function GET(req: Request) {
  if (!ownerOk(req)) return Response.json({ ok: false }, { status: 401 });
  const force = new URL(req.url).searchParams.get('force') === '1';

  const now = new Date();
  const days = Math.max(0, Math.ceil((OPEN.getTime() - now.getTime()) / 86400000));

  const prompt = `วันนี้: ${now.toLocaleDateString('th-TH')} · เหลืออีก ~${days} วันก่อน soft opening (ศุกร์ 24 ก.ค. 2026).
งานที่ค้างอยู่:
${PENDING.map((t, i) => `${i + 1}. ${t}`).join('\n')}

เรียงว่า "วันนี้" ควรทำอะไรก่อน-หลัง แล้วเตือนเจ้าของสั้นๆ. ตอบเป็น JSON.`;

  const demo = {
    summary: `เหลือ ~${days} วันก่อนเปิด — โฟกัสรับร้าน + ตรวจครัว + ล็อกเมนู`,
    lines: [
      'ปิดดีล/รับกุญแจให้จบก่อน (บล็อกทุกอย่าง) — ยืนยัน escrow + วันโอน',
      'เดินตรวจอุปกรณ์ครัวทันทีที่ได้ร้าน (walk-in / hood / เตา) — ถ้าพังต้องรีบสั่งซ่อม',
      'ขอ Google Business Profile ต่อจากเจ้าเดิม — กันรีวิว/พินหาย',
      'ล็อกเมนู soft opening ชุดเล็ก + ตั้งราคา',
      'นัดพนักงานชุดแรก + ซ้อมครัว 1 วันก่อนเปิด',
    ],
  };

  const r = await runAgent({
    id: 'planner',
    title: 'Planner — แผนงานเจ้าของ',
    system: SYSTEM,
    prompt,
    demo,
    cacheKey: `planner:${now.toISOString().slice(0, 10)}`,
    force,
  });
  return Response.json({ ...r, trigger: 'ทุกเช้า' }, { headers: { 'cache-control': 'no-store' } });
}
