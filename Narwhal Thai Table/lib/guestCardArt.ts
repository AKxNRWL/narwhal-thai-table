/**
 * Artwork for the welcome cards — the "random" card design.
 *
 * Owner, 26 Sep 2026: card design should be random, in the Narwhal art DNA
 * (placemat style: fine gold line art on deep navy, cute narwhal, lanterns),
 * full-face art with the guest's name in cream over it.
 *
 * The set is generated up front (Higgsfield, GPT Image 2.5 Sunburst max, with
 * the site's placemat + narwhal-rising art as style references) and curated
 * by the owner, then each card picks one piece from the set. Nothing is
 * generated at confirm time: that would be slow, cost credits per guest and,
 * worst of all, could hand a guest an off-brand picture nobody looked at.
 *
 * The pick is DETERMINISTIC per reservation (hash of the reservation id), so
 * a reprint or the Drive copy always shows the same picture the table did.
 *
 * Files live in /public/images/cards, pre-cropped to the card's navy panel
 * (1590 × 1200 = 367.2 × 277.2 pt, see guestCardPdf.ts). Originals (2336 ×
 * 1744 PNG) are kept in D:\projects\narwhal-thai-table\_art-candidates\cards.
 * To retire a piece, delete it from this list; to add one, generate in the
 * same style, crop to 1590 × 1200 and append.
 */

export type CardTone = 'navy' | 'cream';

export type CardArt = {
  /** Stable id — appears in nothing the guest sees; used for overrides/tests. */
  id: string;
  /** Path under /public. */
  file: string;
  /** Ground colour of the picture — decides the type colours and the name scrim on top of it. */
  tone: CardTone;
  /** One-line description for the owner tools. */
  title: string;
};

/* Two editions of the same style, owner 26 Sep 2026: "เอาให้มีแบบสีอ่อนด้วย" —
   navy ground with gold line (the placemat look) AND cream ground with navy
   line (the print-logo look). The pick is spread over both. */
export const CARD_ART: CardArt[] = [
  { id: 'lantern-leap', file: 'images/cards/art-01.jpg', tone: 'navy', title: 'นาวาลกระโดดคาบโคม + กระทง' },
  { id: 'under-the-pier', file: 'images/cards/art-02.jpg', tone: 'navy', title: 'นาวาลว่ายใต้ HB pier' },
  { id: 'tom-yum', file: 'images/cards/art-03.jpg', tone: 'navy', title: 'นาวาลกับชามต้มยำบนใบบัว' },
  { id: 'garland', file: 'images/cards/art-04.jpg', tone: 'navy', title: 'นาวาลใส่พวงมาลัย' },
  { id: 'two-narwhals', file: 'images/cards/art-05.jpg', tone: 'navy', title: 'นาวาลสองตัวชนงาใต้พระจันทร์' },
  { id: 'sala', file: 'images/cards/art-06.jpg', tone: 'navy', title: 'นาวาลกับศาลาริมทะเล' },
  { id: 'floating-market', file: 'images/cards/art-07.jpg', tone: 'navy', title: 'นาวาลดันเรืออาหารไทย' },
  { id: 'jasmine-spout', file: 'images/cards/art-08.jpg', tone: 'navy', title: 'นาวาลพ่นน้ำเป็นดาว+มะลิ' },
  // ── light edition (cream ground, navy line) ──
  { id: 'lantern-leap-light', file: 'images/cards/art-11.jpg', tone: 'cream', title: 'นาวาลกระโดดคาบโคม (ครีม)' },
  { id: 'under-the-pier-light', file: 'images/cards/art-12.jpg', tone: 'cream', title: 'นาวาลกับ HB pier ยามเย็น (ครีม)' },
  { id: 'mango-sticky-rice', file: 'images/cards/art-13.jpg', tone: 'cream', title: 'นาวาลกับข้าวเหนียวมะม่วง (ครีม)' },
  { id: 'garland-light', file: 'images/cards/art-14.jpg', tone: 'cream', title: 'นาวาลใส่พวงมาลัย (ครีม)' },
  { id: 'two-narwhals-light', file: 'images/cards/art-15.jpg', tone: 'cream', title: 'นาวาลสองตัวชนงาใต้พระอาทิตย์ (ครีม)' },
  { id: 'sala-dawn', file: 'images/cards/art-16.jpg', tone: 'cream', title: 'นาวาลกับศาลาริมทะเลยามเช้า (ครีม)' },
  { id: 'lotus', file: 'images/cards/art-17.jpg', tone: 'cream', title: 'นาวาลชูดอกบัวบนงา (ครีม)' },
  { id: 'jasmine-spout-light', file: 'images/cards/art-18.jpg', tone: 'cream', title: 'นาวาลพ่นน้ำเป็นดาว+มะลิ (ครีม)' },
];

/** FNV-1a — small, stable, good enough to spread ids evenly over the set. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Index into CARD_ART for a reservation id (or any stable key). */
export function artIndexFor(key: string, n: number = CARD_ART.length): number {
  if (n <= 0) return -1;
  const k = (key || '').trim();
  if (!k) return Math.floor(Math.random() * n);
  return hash32(k) % n;
}

/**
 * The art for one card. `override` is a 1-based position in CARD_ART (the
 * `?art=` query on the card route / the picker on /stats/cards); anything
 * out of range falls back to the deterministic pick.
 */
export function artFor(key: string, override?: number | string | null): CardArt | null {
  if (!CARD_ART.length) return null;
  const o = Number(override);
  if (Number.isInteger(o) && o >= 1 && o <= CARD_ART.length) return CARD_ART[o - 1];
  return CARD_ART[artIndexFor(key)];
}
