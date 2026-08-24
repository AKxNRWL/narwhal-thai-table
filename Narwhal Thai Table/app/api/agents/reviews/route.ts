import { ownerOk, hasAI, callClaude, parseJSON, cacheGet, cacheSet } from '@/lib/agents';
import type { AgentItem, AgentResult } from '@/lib/agents';
import { bizDate } from '@/lib/toast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Reviewer — เฝ้ารีวิว. Daily: reads new Google/Yelp reviews and DRAFTS a reply
   for each. It never posts by itself — the owner approves, and actually posting
   also needs the Google/Yelp integration (a later step). Paste real reviews via
   POST {reviews:[...]}, or GET a demo set. */

const SYSTEM = `คุณคือผู้ช่วยตอบรีวิวลูกค้าของร้าน Narwhal Thai Table (อาหารไทยตำรับชาววัง, เชฟ Rainny – royal Thai / MasterChef Thailand Top 10, Huntington Beach).
ร่างคำตอบรีวิวแต่ละอันให้: สุภาพ อบอุ่น เป็นกันเอง ขอบคุณจริงใจ; ถ้าเป็นรีวิวไม่ดีให้รับฟัง + เสนอแก้ไขอย่างมืออาชีพ ไม่โต้เถียง; ยาว 2-4 ประโยค; ตอบภาษาเดียวกับรีวิว (ไทยตอบไทย / อังกฤษตอบอังกฤษ).
ตอบกลับเป็น JSON เท่านั้น: {"summary":"สรุปภาพรวม+อารมณ์รีวิว 1 ประโยค","items":[{"who":"ชื่อ (ดาว, แพลตฟอร์ม)","reply":"ร่างคำตอบ"}]}.`;

type Review = { author?: string; rating?: number; platform?: string; text: string };

const DEMO_REVIEWS: Review[] = [
  { author: 'Jessica L.', rating: 5, platform: 'Google', text: 'Best Thai food in HB! The Narwhal salad and the lobster were unreal. The chef clearly knows what she is doing.' },
  { author: 'Mark T.', rating: 3, platform: 'Yelp', text: 'Food was great but we waited 40 min for a table on opening weekend. Hope they sort out the wait.' },
  { author: 'ปรีดา ส.', rating: 5, platform: 'Google', text: 'แกงเขียวหวานรสจัดจริง เหมือนกินที่เมืองไทย เชฟเก่งมากค่ะ' },
];

function lineFor(it: AgentItem): string {
  return `${it.title} → ร่างคำตอบแล้ว`;
}

function demoResult(reviews: Review[]): AgentResult {
  const items: AgentItem[] = reviews.map((r) => ({
    title: `${'★'.repeat(r.rating || 5)} ${r.author || 'ลูกค้า'} (${r.platform || 'Google'})`,
    body:
      r.rating && r.rating <= 3
        ? 'ขอบคุณสำหรับฟีดแบ็กมากๆ ครับ/ค่ะ และขออภัยเรื่องการรอคิวจริงๆ — ช่วงเปิดใหม่เรากำลังปรับระบบที่นั่งให้เร็วขึ้น อยากขอโอกาสดูแลคุณอีกครั้ง แล้วเจอกันที่ Narwhal นะครับ/คะ 🙏'
        : 'ขอบคุณมากๆ เลยครับ/ค่ะ! ดีใจสุดๆ ที่ถูกใจเมนูของร้านเรา แวะมาใหม่เร็วๆ นี้นะครับ/คะ 🌊',
    meta: 'ร่าง · รออนุมัติ',
  }));
  return {
    ok: true,
    id: 'reviews',
    title: 'Reviewer — เฝ้ารีวิว',
    date: bizDate(),
    dataLive: false,
    aiDemo: true,
    summary: `รีวิวใหม่ ${reviews.length} อัน — ส่วนใหญ่ดี มีเรื่องเวลารอคิว 1 อัน`,
    lines: items.map(lineFor),
    items,
    needsApproval: true,
    actionNote: 'ยังไม่โพสต์ — ต้องต่อ Google/Yelp และกดอนุมัติก่อนเผยแพร่',
    trigger: 'รายวัน',
  };
}

async function build(reviews: Review[], force: boolean): Promise<AgentResult> {
  const cacheKey = `reviews:${bizDate()}:${reviews.length}`;
  if (!force) {
    const c = await cacheGet<AgentResult>(cacheKey);
    if (c) return { ...c, cached: true };
  }
  if (!hasAI()) return demoResult(reviews);
  try {
    const prompt = `รีวิวใหม่:\n${reviews
      .map((r, i) => `${i + 1}) ${r.author || 'ลูกค้า'} — ${r.rating || '?'}★ (${r.platform || 'Google'}): ${r.text}`)
      .join('\n')}\n\nร่างคำตอบทุกอัน ตอบเป็น JSON.`;
    const out = await callClaude(prompt, SYSTEM, 1000);
    const p = parseJSON<{ summary?: string; items?: { who?: string; reply?: string }[] }>(out, {});
    const items: AgentItem[] = (p.items || []).map((it) => ({ title: it.who || 'ลูกค้า', body: it.reply || '', meta: 'ร่าง · รออนุมัติ' }));
    if (!items.length) return demoResult(reviews);
    const r: AgentResult = {
      ok: true,
      id: 'reviews',
      title: 'Reviewer — เฝ้ารีวิว',
      date: bizDate(),
      dataLive: false,
      aiDemo: false,
      summary: p.summary || `ร่างคำตอบ ${items.length} รีวิวแล้ว`,
      lines: items.map(lineFor),
      items,
      needsApproval: true,
      actionNote: 'ยังไม่โพสต์ — ต้องต่อ Google/Yelp และกดอนุมัติก่อนเผยแพร่',
      trigger: 'รายวัน',
    };
    await cacheSet(cacheKey, r);
    return r;
  } catch {
    return demoResult(reviews);
  }
}

export async function GET(req: Request) {
  if (!(await ownerOk(req))) return Response.json({ ok: false }, { status: 401 });
  const force = new URL(req.url).searchParams.get('force') === '1';
  return Response.json(await build(DEMO_REVIEWS, force), { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!(await ownerOk(req))) return Response.json({ ok: false }, { status: 401 });
  let reviews: Review[] = DEMO_REVIEWS;
  try {
    const b = await req.json();
    if (Array.isArray(b?.reviews) && b.reviews.length) reviews = b.reviews as Review[];
  } catch {
    /* use demo */
  }
  return Response.json(await build(reviews, true), { headers: { 'cache-control': 'no-store' } });
}
