/**
 * Render sample welcome cards to a PDF without the site running — for eyeballing
 * a layout change before it reaches a table.
 *
 *   npx tsx scripts/card-preview.ts [out.pdf] [--all-art] [--occasions] [--cast] [--no-art] [--small]
 *
 *   --all-art    one card per piece in CARD_ART (every picture under real type)
 *   --occasions  one card per occasion set, drawn the way a real booking would
 *                (explicit occasion → that set + its line)
 *   --cast       the party-size card (default design): every occasion at party sizes 1, 2, 3, 4, 6, 8
 *   --no-art     the v1 white card
 *   --small      the old two-up sheet (5.5 × 4.25 in tents, what /stats/cards
 *                prints) instead of the Letter card (one per sheet, the default)
 *
 * Reads fonts/logo/art straight from /public, so it also proves the asset loader.
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { cardFromSource, type CardSource, type GuestCard } from '../lib/guestCards';
import { CARD_ART } from '../lib/guestCardArt';
import { OCCASIONS } from '../lib/occasions';
import { renderCardsPdf } from '../lib/guestCardPdf';

const samples: CardSource[] = [
  { id: 'a', first_name: 'John', last_name: 'Smith', party_size: '4 Guests', date: '2026-09-27', time: '19:00', notes: '' },
  { id: 'b', first_name: 'Maria', last_name: 'Gonzalez-Hernandez', party_size: '2 Guests', date: '2026-09-27', time: '18:30', notes: '' },
  { id: 'c', first_name: 'สมชาย', last_name: 'ใจดี', party_size: '6', date: '2026-09-27', time: '20:00', notes: '' },
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
  } else if (flags.has('--occasions')) {
    // every piece of every occasion set, each as a booking that declared that occasion
    cards = [];
    for (const o of OCCASIONS) {
      const pieces = CARD_ART.map((a, i) => ({ a, i })).filter(({ a }) => a.occasion === o.key);
      pieces.forEach(({ a }, j) => cards.push({ ...cardFromSource({ ...samples[j % samples.length], occasion: o.key }), id: a.id }));
    }
    const byId = new Map(CARD_ART.map((a, i) => [a.id, i + 1]));
    art = (c) => byId.get(c.id) ?? 0;
  }
  if (flags.has('--cast')) {
    cards = [];
    const sizes = [1, 2, 3, 4, 6, 8];
    const themes: (string | undefined)[] = [undefined, ...OCCASIONS.map((o) => o.key)];
    themes.forEach((occasion, ti) =>
      sizes.forEach((n, si) => {
        const s = samples[(ti + si) % samples.length];
        cards.push(cardFromSource({ ...s, id: `${occasion || 'general'}-${n}-${ti}`, party_size: `${n} Guests`, occasion }));
      }),
    );
    art = undefined;
  }
  const small = flags.has('--small');
  // --all-art / --occasions pick finished scenes by index (art chooser); --cast and plain runs compose the party-size card
  const pdf = await renderCardsPdf(cards, { title: 'Welcome card — preview', art, noArt: flags.has('--no-art'), layout: small ? 'tent2' : 'letter' });
  await writeFile(out, pdf);
  console.log(`wrote ${out} (${pdf.length} bytes, ${cards.length} cards, ${small ? Math.ceil(cards.length / 2) : cards.length} sheets)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
