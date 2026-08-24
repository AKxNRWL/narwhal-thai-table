import { getStore } from '@netlify/blobs';
import { requireSession } from '@/lib/session';
import { getToastToday, bizDate } from '@/lib/toast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* AI Agent #1 — "ที่ปรึกษาประจำวัน" (Daily Insights).
   The full agent loop: gather (Toast today, or demo) -> reason (Claude)
   -> output (3-5 Thai recommendations) -> cache (Netlify Blobs).
   Gated by owner session. Uses the SAME ANTHROPIC_API_KEY as Aileen, so
   it gives real advice now (on demo numbers) and real numbers once Toast
   is connected. Trigger on demand (GET) now; point a Netlify Scheduled
   Function at this route to run it every morning. ?force=1 bypasses cache. */

const MODEL = 'claude-sonnet-4-6';

const SYSTEM = `คุณคือ "ที่ปรึกษาการดำเนินงานประจำวัน" ของร้าน Narwhal Thai Table (อาหารไทยตำรับชาววัง ย่าน Huntington Beach รัฐแคลิฟอร์เนีย).
ให้คำแนะนำที่ลงมือได้จริง เจาะจง มีตัวเลข กระชับ เป็นภาษาไทย เหมือนผู้จัดการร้านที่เก่งเรื่องตัวเลข.
ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอก JSON รูปแบบ:
{"summary":"สรุปวันนี้สั้นๆ 1 ประโยค","advice":["คำแนะนำลงมือได้ทันที", "..."]}
ใส่ advice 3-5 ข้อ.`;

const CONTEXT = `บริบทร้าน (คงที่):
- Break-even ~$1,400/วัน · ค่าคงที่ ~$11,220/เดือน (เช่ารวม CAM+ขยะ $5,600)
- เป้าค่าแรง ~20% ของยอด · food cost ~32%
- รูปแบบยอด: วันธรรมดาเบากว่า; ศุกร์-เสาร์-อาทิตย์ = เครื่องทำเงิน (~60% ของสัปดาห์)
- เมนูเด่น: Narwhal Salad, seafood ceviche, Pacific lobster, Dungeness crab, ปลากะพงนึ่งซีฟู้ด, ไก่ทอดน้ำจิ้มมะนาว, แกงโขลกมือ
- เชฟ Rainny (royal Thai / MasterChef Thailand Top 10) = จุดขายหลัก`;

type Today = { sales?: number; orders?: number; covers?: number; laborPct?: number };

function demoToday(): Today {
  return { sales: 2856, orders: 41, covers: 79, laborPct: 0.34 };
}

function buildPrompt(t: Today, live: boolean): string {
  const lp = t.laborPct ? Math.round(t.laborPct * 100) + '%' : 'ไม่มีข้อมูล';
  return `${CONTEXT}

ข้อมูลวันนี้ (${live ? 'จาก Toast จริง' : 'ตัวอย่าง/เดโม'}):
- ยอดขาย: $${Math.round(t.sales || 0).toLocaleString('en-US')}
- ออเดอร์: ${t.orders || 0} · ลูกค้า: ${t.covers || 0} คน
- ค่าแรงวันนี้: ${lp}

วิเคราะห์เทียบ break-even และเป้า แล้วให้ 3-5 คำแนะนำที่ลงมือได้วันนี้/พรุ่งนี้
(เช่น ปรับราคาเมนู, จัดกะให้ตรงพีค, ดันเมนูกำไรสูง, จัดโปรช่วงเงียบ, ขอรีวิว). ตอบเป็น JSON ตามรูปแบบ.`;
}

async function callClaude(key: string, prompt: string): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system: [{ type: 'text', text: SYSTEM }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}`);
  const j = await r.json();
  return ((j?.content ?? []) as { type: string; text?: string }[])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
    .trim();
}

function parseAdvice(text: string): { summary: string; advice: string[] } {
  const t = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    const p = JSON.parse(t) as { summary?: unknown; advice?: unknown };
    return {
      summary: String(p.summary ?? ''),
      advice: Array.isArray(p.advice) ? p.advice.map((x) => String(x)) : [],
    };
  } catch {
    const lines = t.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean);
    return { summary: lines[0] ?? '', advice: lines.slice(1) };
  }
}

const DEMO = {
  summary: '(เดโม) ยอดผ่าน break-even แต่ต่ำกว่าเป้า — ดันช่วงเย็น + คุมค่าแรง',
  advice: [
    'ยอด ~$2,856 ผ่าน break-even ($1,400) สบาย แต่ต่ำกว่าเป้า $4,200 — ดันยอดช่วงเย็น/to-go',
    'ค่าแรง 34% สูงไป (เป้า ~20%) — วันนี้คนเยอะเทียบยอด ถ้าช่วงบ่ายเงียบลองตัด 1 กะ',
    'ให้พนักงานเชียร์เมนูกำไรสูง (Narwhal Salad / แกงโขลกมือ) → ดันเช็คเฉลี่ย',
    'พอ ABC พร้อม เปิดเบียร์-ไวน์ ดันเช็คเฉลี่ยได้อีก',
    'ขอรีวิว Google จากลูกค้าที่ประทับใจวันนี้ → review flywheel',
  ],
};

export async function GET(req: Request) {
  const sess = await requireSession(req);
  if (!sess) return Response.json({ ok: false }, { status: 401 });

  const date = bizDate();
  const force = new URL(req.url).searchParams.get('force');
  let store: ReturnType<typeof getStore> | null = null;
  try { store = getStore({ name: 'narwhal-os', consistency: 'strong' }); } catch { store = null; }

  if (store && !force) {
    try {
      const cached = await store.get(`insights:${date}`, { type: 'json' });
      if (cached) return Response.json({ ...(cached as object), cached: true });
    } catch { /* ignore */ }
  }

  const toast = await getToastToday();
  const today: Today = toast.connected && toast.today ? toast.today : demoToday();
  const key = process.env.ANTHROPIC_API_KEY;

  let summary: string, advice: string[], aiDemo = false;
  if (!key) {
    aiDemo = true; summary = DEMO.summary; advice = DEMO.advice;
  } else {
    try {
      const out = await callClaude(key, buildPrompt(today, toast.connected));
      const p = parseAdvice(out);
      summary = p.summary || DEMO.summary;
      advice = p.advice.length ? p.advice : DEMO.advice;
    } catch {
      aiDemo = true; summary = DEMO.summary; advice = DEMO.advice;
    }
  }

  const result = {
    ok: true,
    date,
    dataLive: toast.connected,
    aiDemo,
    today: { sales: today.sales ?? null, covers: today.covers ?? null, laborPct: today.laborPct ?? null },
    summary,
    advice,
  };
  if (store) { try { await store.set(`insights:${date}`, JSON.stringify(result)); } catch { /* ignore */ } }
  return Response.json(result, { headers: { 'cache-control': 'no-store' } });
}
