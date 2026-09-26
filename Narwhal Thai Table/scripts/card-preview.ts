/**
 * Render sample welcome cards to a PDF without the site running — for eyeballing
 * a layout change before it reaches a table.
 *
 *   npx tsx scripts/card-preview.ts [out.pdf] [--all-art] [--no-art]
 *
 *   --all-art  one card per piece in CARD_ART (16 cards → 8 sheets), so every
 *              picture is checked under real type
 *   --no-art   the v1 white card
 *
 * Reads fonts/logo/art straight from /public, so it also proves the asset loader.
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { cardFromSource, type GuestCard } from '../lib/guestCards';
import { CARD_ART } from '../lib/guestCardArt';
import { renderCardsPdf } from '../lib/guestCardPdf';

const samples = [
  { id: 'a', first_name: 'John', last_name: 'Smith', party_size: '4 Guests', date: '2026-09-27', time: '19:00', notes: 'birthday dinner' },
  { id: 'b', first_name: 'Maria', last_name: 'Gonzalez-Hernandez', party_size: '2 Guests', date: '2026-09-27', time: '18:30', notes: '' },
  { id: 'c', first_name: 'สมชาย', last_name: 'ใจดี', party_size: '6', date: '2026-09-27', time: '20:00', notes: 'ครบรอบแต่งงาน' },
  { id: 'd', first_name: 'Alex', last_name: '', party_size: '1', date: '2026-09-27', time: '12:15', notes: '' },
];

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const out = path.resolve(args.find((a) => !a.startsWith('--')) || 'card-preview.pdf');

  let cards: GuestCard[] = samples.map((s) => cardFromSource(s));
  let art: ((c: GuestCard, i: number) => number) | undefined;
  if (flags.has('--all-art')) {
    cards = CARD_ART.map((a, i) => ({ ...cardFromSource(samples[i % samples.length]), id: a.id }));
    art = (_c, i) => i + 1;
  }
  const pdf = await renderCardsPdf(cards, { title: 'Welcome card — preview', art, noArt: flags.has('--no-art') });
  await writeFile(out, pdf);
  console.log(`wrote ${out} (${pdf.length} bytes, ${cards.length} cards, ${Math.ceil(cards.length / 2)} sheets)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
