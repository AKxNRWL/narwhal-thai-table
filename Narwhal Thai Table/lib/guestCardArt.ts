import type { OccasionKey } from './occasions';

/**
 * Artwork for the welcome cards — the "random" card design.
 *
 * Owner, 26 Sep 2026: card design should be random, in the Narwhal art DNA
 * (placemat style: fine line art, cute narwhal, lanterns), full-face art with
 * the guest's name over it. Then: "ผมชอบสีอ่อนมากกว่า" — the general
 * rotation is the cream edition only (the navy pieces stay selectable by
 * hand on /stats/cards) — and when the OCCASION is known (form field, Aileen,
 * or read from the notes) the card draws from that occasion's own set:
 * birthday, anniversary, graduation/celebration, family, friends, business.
 *
 * The sets are generated up front (Higgsfield, GPT Image 2.5 Sunburst max,
 * with the site's placemat + narwhal-rising art and the print logo as style
 * references) and curated by the owner; nothing is generated at confirm
 * time — that would be slow, cost credits per guest and could hand a guest
 * an off-brand picture nobody looked at.
 *
 * The pick is DETERMINISTIC per reservation (hash of the reservation id), so
 * a reprint or the Drive copy always shows the same picture the table did.
 *
 * Two cuts of every piece:
 *   · /public/images/cards/art-XX.jpg — the small two-up tent (/stats/cards):
 *     1590 × 1200 = the 367.2 × 277.2 pt panel, picture shifted up 15 % with
 *     its own ground colour filled in below.
 *   · /public/images/cards/letter/art-XX.jpg — the Letter tent (one card per
 *     sheet, what the HQ app prints and Drive keeps), FULL BLEED: 2125 × 1375
 *     = the whole 612 × 396 pt face (8.5 × 5.5 in, 250 dpi), window ending on
 *     the original's bottom row (~13 % down), with the name scrim BAKED IN
 *     (fades to the picture's ground from 46 % down) so the print page and
 *     the PDF only lay type on top. Made by scripts/card-art-letter.py from
 *     the originals.
 * Originals (2336 × 1744 PNG) are kept in
 * D:\projects\narwhal-thai-table\_art-candidates\cards. To retire a piece,
 * delete it from this list; to add one, generate in the same style, cut both
 * files the same way and append.
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
  /** Occasion set this piece belongs to; unset = general. */
  occasion?: OccasionKey;
  /** In the general random rotation? (navy pieces: no — owner prefers the light ones.) */
  general?: boolean;
};

export const CARD_ART: CardArt[] = [
  // ── general, navy edition (gold line on navy) — hand-pick only ──
  { id: 'lantern-leap', file: 'images/cards/art-01.jpg', tone: 'navy', title: 'นาวาลกระโดดคาบโคม + กระทง' },
  { id: 'under-the-pier', file: 'images/cards/art-02.jpg', tone: 'navy', title: 'นาวาลว่ายใต้ HB pier' },
  { id: 'tom-yum', file: 'images/cards/art-03.jpg', tone: 'navy', title: 'นาวาลกับชามต้มยำบนใบบัว' },
  { id: 'garland', file: 'images/cards/art-04.jpg', tone: 'navy', title: 'นาวาลใส่พวงมาลัย' },
  { id: 'two-narwhals', file: 'images/cards/art-05.jpg', tone: 'navy', title: 'นาวาลสองตัวชนงาใต้พระจันทร์' },
  { id: 'sala', file: 'images/cards/art-06.jpg', tone: 'navy', title: 'นาวาลกับศาลาริมทะเล' },
  { id: 'floating-market', file: 'images/cards/art-07.jpg', tone: 'navy', title: 'นาวาลดันเรืออาหารไทย' },
  { id: 'jasmine-spout', file: 'images/cards/art-08.jpg', tone: 'navy', title: 'นาวาลพ่นน้ำเป็นดาว+มะลิ' },
  // ── general, light edition (navy line on cream) — the random rotation ──
  { id: 'lantern-leap-light', file: 'images/cards/art-11.jpg', tone: 'cream', title: 'นาวาลกระโดดคาบโคม', general: true },
  { id: 'under-the-pier-light', file: 'images/cards/art-12.jpg', tone: 'cream', title: 'นาวาลกับ HB pier ยามเย็น', general: true },
  { id: 'mango-sticky-rice', file: 'images/cards/art-13.jpg', tone: 'cream', title: 'นาวาลกับข้าวเหนียวมะม่วง', general: true },
  { id: 'garland-light', file: 'images/cards/art-14.jpg', tone: 'cream', title: 'นาวาลใส่พวงมาลัย', general: true },
  { id: 'two-narwhals-light', file: 'images/cards/art-15.jpg', tone: 'cream', title: 'นาวาลสองตัวชนงาใต้พระอาทิตย์', general: true },
  { id: 'sala-dawn', file: 'images/cards/art-16.jpg', tone: 'cream', title: 'นาวาลกับศาลาริมทะเลยามเช้า', general: true },
  { id: 'lotus', file: 'images/cards/art-17.jpg', tone: 'cream', title: 'นาวาลชูดอกบัวบนงา', general: true },
  { id: 'jasmine-spout-light', file: 'images/cards/art-18.jpg', tone: 'cream', title: 'นาวาลพ่นน้ำเป็นดาว+มะลิ', general: true },
  // ── occasion sets (cream) ──
  { id: 'bday-hat-cake', file: 'images/cards/art-21.jpg', tone: 'cream', occasion: 'birthday', title: 'วันเกิด — หมวกปาร์ตี้ + เค้กบนงา' },
  { id: 'bday-cake-gift', file: 'images/cards/art-22.jpg', tone: 'cream', occasion: 'birthday', title: 'วันเกิด — เค้กสองชั้น + ของขวัญบนใบบัว' },
  { id: 'bday-cupcake', file: 'images/cards/art-23.jpg', tone: 'cream', occasion: 'birthday', title: 'วันเกิด — เป่าเทียนคัพเค้ก' },
  { id: 'bday-lantern-balloons', file: 'images/cards/art-24.jpg', tone: 'cream', occasion: 'birthday', title: 'วันเกิด — ถือโคมเป็นลูกโป่ง + กล่องของขวัญ' },
  { id: 'anniv-heart-tusks', file: 'images/cards/art-31.jpg', tone: 'cream', occasion: 'anniversary', title: 'ครบรอบ — งาโค้งเป็นหัวใจ + ดอกบัว' },
  { id: 'anniv-garland-moon', file: 'images/cards/art-32.jpg', tone: 'cream', occasion: 'anniversary', title: 'ครบรอบ — พวงมาลัยคล้องงาใต้พระจันทร์' },
  { id: 'anniv-rings', file: 'images/cards/art-33.jpg', tone: 'cream', occasion: 'anniversary', title: 'ครบรอบ — ว่ายวนเป็นแหวนรอบกระทง' },
  { id: 'anniv-boat', file: 'images/cards/art-34.jpg', tone: 'cream', occasion: 'anniversary', title: 'ครบรอบ — สองตัวในเรือ ยื่นดอกบัว' },
  { id: 'grad-cap-diploma', file: 'images/cards/art-41.jpg', tone: 'cream', occasion: 'celebration', title: 'เรียนจบ — หมวกบัณฑิต + ม้วนปริญญา' },
  { id: 'success-wreath', file: 'images/cards/art-42.jpg', tone: 'cream', occasion: 'celebration', title: 'ความสำเร็จ — กระโดดลอดพวงลอเรลทอง' },
  { id: 'success-trophy', file: 'images/cards/art-43.jpg', tone: 'cream', occasion: 'celebration', title: 'ความสำเร็จ — ถ้วยรางวัลบนงา + พลุ' },
  { id: 'grad-caps-toss', file: 'images/cards/art-44.jpg', tone: 'cream', occasion: 'celebration', title: 'เรียนจบ — สามตัวโยนหมวกบัณฑิต' },
  { id: 'family-row', file: 'images/cards/art-51.jpg', tone: 'cream', occasion: 'family', title: 'ครอบครัว — ว่ายเรียงแถวใหญ่เล็ก' },
  { id: 'family-table', file: 'images/cards/art-52.jpg', tone: 'cream', occasion: 'family', title: 'ครอบครัว — ล้อมโต๊ะใบบัวกินข้าว' },
  { id: 'family-lantern', file: 'images/cards/art-53.jpg', tone: 'cream', occasion: 'family', title: 'ครอบครัว — สามรุ่นชูงาหาโคม' },
  { id: 'family-pier', file: 'images/cards/art-54.jpg', tone: 'cream', occasion: 'family', title: 'ครอบครัว — ว่ายกลับบ้านผ่าน HB pier' },
  { id: 'friends-toast', file: 'images/cards/art-61.jpg', tone: 'cream', occasion: 'friends', title: 'เพื่อน — สี่ตัวชูงาชนกัน' },
  { id: 'friends-surf', file: 'images/cards/art-62.jpg', tone: 'cream', occasion: 'friends', title: 'เพื่อน — โต้คลื่นด้วยกัน' },
  { id: 'friends-tomyum', file: 'images/cards/art-63.jpg', tone: 'cream', occasion: 'friends', title: 'เพื่อน — ล้อมชามต้มยำ' },
  { id: 'friends-lanterns', file: 'images/cards/art-64.jpg', tone: 'cream', occasion: 'friends', title: 'เพื่อน — ปล่อยโคมด้วยกัน' },
  { id: 'biz-handshake', file: 'images/cards/art-71.jpg', tone: 'cream', occasion: 'business', title: 'งาน — จับครีบแบบจับมือ + ม้วนสาร' },
  { id: 'biz-long-table', file: 'images/cards/art-72.jpg', tone: 'cream', occasion: 'business', title: 'งาน — โต๊ะยาวเรียบร้อย' },
  { id: 'biz-scrolls', file: 'images/cards/art-73.jpg', tone: 'cream', occasion: 'business', title: 'งาน — แบกม้วนเอกสารผูกริบบิ้นทอง' },
  { id: 'biz-emblem', file: 'images/cards/art-74.jpg', tone: 'cream', occasion: 'business', title: 'งาน — ตรากนกทองสง่างาม' },
];

/** The Letter-tent cut of a piece (see the note at the top): same name, `letter/` folder. */
export function letterFileOf(art: CardArt): string {
  return art.file.replace(/^images\/cards\//, 'images/cards/letter/');
}

/** FNV-1a — small, stable, good enough to spread ids evenly over a set. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The pieces a card may draw from: the occasion's set when it has one, else the general rotation. */
export function artPool(theme?: OccasionKey | '' | null): CardArt[] {
  if (theme) {
    const themed = CARD_ART.filter((a) => a.occasion === theme);
    if (themed.length) return themed;
  }
  const general = CARD_ART.filter((a) => a.general);
  return general.length ? general : CARD_ART;
}

/** Index into CARD_ART (the whole list) of the deterministic pick for a key + theme. */
export function artIndexFor(key: string, theme?: OccasionKey | '' | null): number {
  const pool = artPool(theme);
  if (!pool.length) return -1;
  const k = (key || '').trim();
  const pick = k ? pool[hash32(k) % pool.length] : pool[Math.floor(Math.random() * pool.length)];
  return CARD_ART.indexOf(pick);
}

/**
 * The art for one card. `override` is a 1-based position in CARD_ART (the
 * `?art=` query on the card route / the picker on /stats/cards); anything
 * out of range falls back to the deterministic pick for the card's theme.
 */
export function artFor(key: string, override?: number | string | null, theme?: OccasionKey | '' | null): CardArt | null {
  if (!CARD_ART.length) return null;
  const o = Number(override);
  if (Number.isInteger(o) && o >= 1 && o <= CARD_ART.length) return CARD_ART[o - 1];
  const i = artIndexFor(key, theme);
  return i >= 0 ? CARD_ART[i] : null;
}
