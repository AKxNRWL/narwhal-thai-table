/**
 * One welcome card (the HQ design — narwhal host + a sea friend per guest,
 * occasion backdrop) for a party that is NOT in the reservation system: a
 * walk-in, a phone booking, or a card the owner asks for in chat.
 *
 *   npx tsx scripts/card-one.ts --first Davis --last Koontz --party 4 --occasion birthday
 *       [--time 19:00] [--date 2026-11-01] [--out "D:\projects\narwhal-menu\Narwhal-Card-Davis-Koontz.pdf"] [--small]
 *
 * Same renderer as the HQ "ยืนยัน + ส่งเมล" card (lib/guestCardPdf.ts), so it
 * prints the same: Letter portrait, fold in half into a tent, borderless via
 * Epson Smart Panel. Occasion keys: lib/occasions.ts (birthday, anniversary,
 * celebration, family, friends, business). Without --time the time line is
 * simply left off. The friends are picked from the id, so the same name +
 * date always gives the same cast (re-print = identical card).
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { cardFromSource, type CardSource } from '../lib/guestCards';
import { renderCardsPdf } from '../lib/guestCardPdf';

function arg(name: string, dflt = ''): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : dflt;
}

async function main() {
  const first = arg('first');
  const last = arg('last');
  const party = arg('party', '2');
  const occasion = arg('occasion');
  const date = arg('date', new Date().toISOString().slice(0, 10));
  const time = arg('time');
  const small = process.argv.includes('--small');
  if (!first && !last) throw new Error('give at least --first or --last');
  const slug = [first, last].filter(Boolean).join('-').replace(/[^\w\-]+/g, '');
  const out = path.resolve(arg('out', `Narwhal-Card-${slug}.pdf`));
  const src: CardSource = {
    id: `chat-${slug.toLowerCase()}-${date}`,
    first_name: first, last_name: last, party_size: `${party} Guests`, date, time, notes: '', occasion,
  };
  const card = cardFromSource(src);
  const pdf = await renderCardsPdf([card], { title: `Welcome card — ${card.name}`, layout: small ? 'tent2' : 'letter' });
  await writeFile(out, pdf);
  console.log(`wrote ${out} (${pdf.length} bytes) — ${card.name} · ${card.party} · ${card.occasion || 'no occasion line'} · theme ${card.theme || 'general'} · ${card.time || 'no time'}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
