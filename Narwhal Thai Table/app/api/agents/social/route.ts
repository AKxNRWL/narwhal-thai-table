import { ownerOk, hasAI, callClaude, parseJSON, cacheGet, cacheSet } from '@/lib/agents';
import type { AgentItem, AgentResult } from '@/lib/agents';
import { bizDate } from '@/lib/toast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Social — คอนเทนต์เปิดตัว. Weekly: drafts IG / FB / TikTok posts around a dish
   or event. Drafts only — the owner approves, and actually posting needs the
   IG/FB integration (a later step). GET ?topic=... or POST {topic}. */

const SYSTEM = `คุณคือครีเอเตอร์โซเชียลของร้าน Narwhal Thai Table (อาหารไทยตำรับชาววังพรีเมียม, เชฟ Rainny – royal Thai / MasterChef Thailand Top 10, Huntington Beach, เปิดใหม่ 2026; ซิกเนเจอร์: Narwhal Salad, seafood ceviche, Pacific lobster, Dungeness crab, ปลากะพงนึ่งซีฟู้ด, แกงโขลกมือ).
ร่างโพสต์โซเชียลที่ปังตามหัวข้อที่ได้รับ: โทนพรีเมียมแต่อบอุ่น, มีฮุกดึงดูดในบรรทัดแรก, ผสมไทย+อังกฤษสั้นๆ, ใส่ emoji พองาม, มี call-to-action (จองโต๊ะ/แวะมา).
ตอบกลับเป็น JSON เท่านั้น: {"summary":"ธีมสัปดาห์นี้ 1 ประโยค","items":[{"platform":"Instagram","caption":"...","hashtags":"#..."}]} ให้ครบ Instagram, Facebook, TikTok.`;

function demoResult(topic: string): AgentResult {
  const items: AgentItem[] = [
    {
      title: 'Instagram',
      body: `🌊 เปิดแล้วที่ Huntington Beach! Narwhal Thai Table — อาหารไทยตำรับชาววัง ทำมือทุกจาน\n${topic}\nจองโต๊ะวันนี้ 📍 19072 Beach Blvd`,
      meta: 'ร่าง · รออนุมัติ · #NarwhalThai #HuntingtonBeach #ThaiFood',
    },
    {
      title: 'Facebook',
      body: `Grand flavors, royal Thai roots 👑 ตำรับชาววังแท้ๆ มาถึง HB แล้ว — ${topic} มากันเป็นกลุ่มได้เลย!`,
      meta: 'ร่าง · รออนุมัติ',
    },
    {
      title: 'TikTok',
      body: `POV: คุณเพิ่งเจอร้านไทยที่ทำ lobster + แกงโขลกมือ ระดับ fine dining ที่ HB 🦞🔥 ${topic}`,
      meta: 'ร่าง · รออนุมัติ · เพลงเทรนด์ + โชว์จานเด่น',
    },
  ];
  return {
    ok: true,
    id: 'social',
    title: 'Social — คอนเทนต์เปิดตัว',
    date: bizDate(),
    dataLive: false,
    aiDemo: true,
    summary: `ร่างชุดโพสต์สัปดาห์นี้: ${topic}`,
    lines: items.map((i) => `${i.title}: ร่างพร้อมรีวิว`),
    items,
    needsApproval: true,
    actionNote: 'ยังไม่โพสต์ — ต้องต่อ IG/FB และกดอนุมัติก่อนเผยแพร่',
    trigger: 'รายสัปดาห์',
  };
}

async function build(topic: string, force: boolean): Promise<AgentResult> {
  const cacheKey = `social:${bizDate()}`;
  if (!force) {
    const c = await cacheGet<AgentResult>(cacheKey);
    if (c) return { ...c, cached: true };
  }
  if (!hasAI()) return demoResult(topic);
  try {
    const out = await callClaude(`หัวข้อ/โอกาสสัปดาห์นี้: ${topic}\nร่างโพสต์ IG / FB / TikTok ตอบเป็น JSON.`, SYSTEM, 1000);
    const p = parseJSON<{ summary?: string; items?: { platform?: string; caption?: string; hashtags?: string }[] }>(out, {});
    const items: AgentItem[] = (p.items || []).map((it) => ({
      title: it.platform || 'Post',
      body: it.caption || '',
      meta: 'ร่าง · รออนุมัติ' + (it.hashtags ? ' · ' + it.hashtags : ''),
    }));
    if (!items.length) return demoResult(topic);
    const r: AgentResult = {
      ok: true,
      id: 'social',
      title: 'Social — คอนเทนต์เปิดตัว',
      date: bizDate(),
      dataLive: false,
      aiDemo: false,
      summary: p.summary || `ร่างชุดโพสต์: ${topic}`,
      lines: items.map((i) => `${i.title}: ร่างพร้อมรีวิว`),
      items,
      needsApproval: true,
      actionNote: 'ยังไม่โพสต์ — ต้องต่อ IG/FB และกดอนุมัติก่อนเผยแพร่',
      trigger: 'รายสัปดาห์',
    };
    await cacheSet(cacheKey, r);
    return r;
  } catch {
    return demoResult(topic);
  }
}

export async function GET(req: Request) {
  if (!ownerOk(req)) return Response.json({ ok: false }, { status: 401 });
  const u = new URL(req.url);
  const force = u.searchParams.get('force') === '1';
  const topic = u.searchParams.get('topic') || 'Soft opening สัปดาห์นี้ + จานซิกเนเจอร์ Narwhal Salad & Pacific lobster';
  return Response.json(await build(topic, force), { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!ownerOk(req)) return Response.json({ ok: false }, { status: 401 });
  let topic = 'Soft opening + จานซิกเนเจอร์';
  try {
    const b = await req.json();
    if (b?.topic) topic = String(b.topic);
  } catch {
    /* default */
  }
  return Response.json(await build(topic, true), { headers: { 'cache-control': 'no-store' } });
}
