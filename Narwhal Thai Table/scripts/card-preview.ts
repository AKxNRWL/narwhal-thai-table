/**
 * Render sample welcome cards to a PDF without the site running — for eyeballing
 * a layout change before it reaches a table.
 *
 *   npx tsx scripts/card-preview.ts [out.pdf]
 *
 * Reads fonts/logo straight from /public, so it also proves the asset loader.
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { cardFromSource } from '../lib/guestCards';
import { renderCardsPdf } from '../lib/guestCardPdf';

const samples = [
  { id: 'a', first_name: 'John', last_name: 'Smith', party_size: '4 Guests', date: '2026-09-27', time: '19:00', notes: 'birthday dinner' },
  { id: 'b', first_name: 'Maria', last_name: 'Gonzalez-Hernandez', party_size: '2 Guests', date: '2026-09-27', time: '18:30', notes: '' },
  { id: 'c', first_name: 'สมชาย', last_name: 'ใจดี', party_size: '6', date: '2026-09-27', time: '20:00', notes: 'ครบรอบแต่งงาน' },
  { id: 'd', first_name: 'Alex', last_name: '', party_size: '1', date: '2026-09-27', time: '12:15', notes: '' },
];

async function main() {
  const out = path.resolve(process.argv[2] || 'card-preview.pdf');
  const pdf = await renderCardsPdf(samples.map((s) => cardFromSource(s)), { title: 'Welcome card — preview' });
  await writeFile(out, pdf);
  console.log(`wrote ${out} (${pdf.length} bytes, ${Math.ceil(samples.length / 2)} sheets)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
