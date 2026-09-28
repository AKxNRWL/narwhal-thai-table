import type { OccasionKey } from './occasions';
import { partyCount, type GuestCard } from './guestCards';

/**
 * The party-size card: a BACKDROP for the occasion plus one CHARACTER per
 * guest, composed by code — the narwhal is always the host, and a booking of
 * four brings three sea friends (seahorse, stingray, starfish, clownfish,
 * turtle, octopus, jellyfish, crab, pufferfish — our own cast, cream edition
 * of the house style, cut out on transparent PNGs).
 *
 * Owner, 28 Sep 2026: "เอาให้มีสัตว์น้ำอื่นด้วย … มาร่วมสังสรรค์ … น่ารัก
 * อบอุ่น" and "จอง 4 ก็มีสัตว์ 4 ตัว". Generating a finished picture per
 * (occasion × party size × variant) would have been ~200 images and another
 * batch for every new occasion; composing needs 14 backdrops + 23 cutouts
 * once, and a new occasion is two backdrops.
 *
 * Everything here is pure geometry in FRACTIONS of the face (0..1 of its
 * width / height), so the PDF (points), the print page (inches) and
 * /stats/cards (CSS %) lay the same booking out identically. Choices are
 * DETERMINISTIC from the reservation id: a reprint, the Drive copy and the
 * /stats/cards sheet all show the same friends in the same places.
 *
 * Assets: public/images/cards/backdrops/{letter,small}/<id>.jpg (see
 * scripts/card-backdrop-cut.py) and public/images/cards/cast/<id>.png
 * (scripts/card-cast-cut.py; the ratios below come from its manifest).
 */

export type CastTheme = OccasionKey | '';

export type Backdrop = { id: string; occasion?: OccasionKey; title: string };
export const BACKDROPS: Backdrop[] = [
  { id: 'general-1', title: 'HB pier ยามเย็น' },
  { id: 'general-2', title: 'ศาลาริมทะเล + จันทร์เสี้ยว' },
  { id: 'birthday-1', occasion: 'birthday', title: 'เค้ก + ของขวัญ + โคมแถว' },
  { id: 'birthday-2', occasion: 'birthday', title: 'ธงกนก + โคมลูกโป่ง + คัพเค้ก' },
  { id: 'anniversary-1', occasion: 'anniversary', title: 'พระจันทร์เต็มดวง + ซุ้มมาลัย' },
  { id: 'anniversary-2', occasion: 'anniversary', title: 'จันทร์เสี้ยว + โคม + บัว' },
  { id: 'celebration-1', occasion: 'celebration', title: 'พลุ + ลอเรล + ถ้วยรางวัล' },
  { id: 'celebration-2', occasion: 'celebration', title: 'โยนหมวกบัณฑิต' },
  { id: 'family-1', occasion: 'family', title: 'โต๊ะอาหารครอบครัว' },
  { id: 'family-2', occasion: 'family', title: 'บ้านริมน้ำ + พระอาทิตย์ตก' },
  { id: 'friends-1', occasion: 'friends', title: 'ต้มยำหม้อใหญ่ + ชาเย็น' },
  { id: 'friends-2', occasion: 'friends', title: 'คลื่นใหญ่ + โคมลอย' },
  { id: 'business-1', occasion: 'business', title: 'โต๊ะยาวเรียบร้อย + ท่าเรือ' },
  { id: 'business-2', occasion: 'business', title: 'ตรากนกทอง' },
];

/** A cutout: `ratio` = width / height of the PNG (from the cut manifest). */
export type Cutout = { id: string; ratio: number; title: string };

/** The narwhal host — one per occasion where it dresses up; otherwise plain or garlanded. `count` = how many guests it stands for. */
export type Host = Cutout & { occasion?: OccasionKey; count: number };
export const HOSTS: Host[] = [
  { id: 'narwhal-plain', ratio: 1.775, count: 1, title: 'นาวาล' },
  { id: 'narwhal-garland', ratio: 1.544, count: 1, title: 'นาวาลพวงมาลัย' },
  { id: 'narwhal-birthday', ratio: 1.541, count: 1, occasion: 'birthday', title: 'นาวาลหมวกปาร์ตี้ + คัพเค้ก' },
  { id: 'narwhal-grad', ratio: 1.67, count: 1, occasion: 'celebration', title: 'นาวาลหมวกบัณฑิต' },
  { id: 'narwhal-pair', ratio: 1.576, count: 2, occasion: 'anniversary', title: 'นาวาลคู่ งาเป็นหัวใจ' },
];

/** The friends, two poses each: a = calm, b = celebrating (party hat / lantern / stars). */
export type Friend = { species: string; title: string; a: Cutout; b: Cutout };
export const FRIENDS: Friend[] = [
  { species: 'seahorse', title: 'ม้าน้ำ', a: { id: 'seahorse-a', ratio: 0.547, title: 'ม้าน้ำ' }, b: { id: 'seahorse-b', ratio: 0.486, title: 'ม้าน้ำหมวกปาร์ตี้' } },
  { species: 'ray', title: 'ปลากระเบน', a: { id: 'ray-a', ratio: 1.492, title: 'ปลากระเบน' }, b: { id: 'ray-b', ratio: 0.833, title: 'ปลากระเบนถือโคม' } },
  { species: 'starfish', title: 'ปลาดาว', a: { id: 'starfish-a', ratio: 0.803, title: 'ปลาดาว' }, b: { id: 'starfish-b', ratio: 0.766, title: 'ปลาดาวหมวกปาร์ตี้' } },
  { species: 'clownfish', title: 'ปลาการ์ตูน', a: { id: 'clownfish-a', ratio: 1.322, title: 'ปลาการ์ตูน' }, b: { id: 'clownfish-b', ratio: 1.092, title: 'ปลาการ์ตูนหมวกปาร์ตี้' } },
  { species: 'turtle', title: 'เต่า', a: { id: 'turtle-a', ratio: 1.187, title: 'เต่า' }, b: { id: 'turtle-b', ratio: 0.741, title: 'เต่าถือโคม' } },
  { species: 'octopus', title: 'ปลาหมึก', a: { id: 'octopus-a', ratio: 0.917, title: 'ปลาหมึก' }, b: { id: 'octopus-b', ratio: 0.872, title: 'ปลาหมึกเล่นดาว' } },
  { species: 'jelly', title: 'แมงกะพรุน', a: { id: 'jelly-a', ratio: 0.614, title: 'แมงกะพรุน' }, b: { id: 'jelly-b', ratio: 0.713, title: 'แมงกะพรุนหมวกปาร์ตี้' } },
  { species: 'crab', title: 'ปู', a: { id: 'crab-a', ratio: 0.988, title: 'ปู' }, b: { id: 'crab-b', ratio: 0.683, title: 'ปูชูโคม' } },
  { species: 'puffer', title: 'ปลาปักเป้า', a: { id: 'puffer-a', ratio: 1.085, title: 'ปลาปักเป้า' }, b: { id: 'puffer-b', ratio: 1.202, title: 'ปลาปักเป้าดอกมะลิ' } },
];

/** Most characters a face can hold before it turns into a crowd. */
export const MAX_CAST = 8;

export const castFile = (id: string) => `images/cards/cast/${id}.png`;
export const backdropFile = (id: string, cut: 'letter' | 'small') => `images/cards/backdrops/${cut}/${id}.jpg`;

/* ── deterministic choices ─────────────────────────────────────────────── */

/** FNV-1a, as in guestCardArt — one hash per (key, salt) so each choice is independent. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
const pick = (key: string, salt: string, n: number) => (n > 0 ? hash32(`${key}|${salt}`) % n : 0);
/** 0..1, stable per (key, salt). */
const unit = (key: string, salt: string) => hash32(`${key}|${salt}`) / 0x100000000;

const FESTIVE = new Set<CastTheme>(['birthday', 'celebration', 'friends']);

export function backdropFor(key: string, theme: CastTheme, override?: string | null): Backdrop {
  if (override) {
    const b = BACKDROPS.find((x) => x.id === override);
    if (b) return b;
  }
  const pool = BACKDROPS.filter((b) => (theme ? b.occasion === theme : !b.occasion));
  const list = pool.length ? pool : BACKDROPS.filter((b) => !b.occasion);
  return list[pick(key, 'backdrop', list.length)];
}

export function hostFor(key: string, theme: CastTheme, guests: number): Host {
  const themed = HOSTS.find((h) => h.occasion === theme);
  if (themed && (themed.count <= Math.max(guests, 1) || guests <= 0)) return themed;
  const plain = HOSTS.filter((h) => !h.occasion);
  return plain[pick(key, 'host', plain.length)];
}

/** How many guests the card shows: the party size, clamped; unknown → 2 (host + one friend). */
export function guestsOf(card: Pick<GuestCard, 'party' | 'guests'>): number {
  // the party TEXT wins (the team can retype "Party of 6" on /stats/cards), then the stored count
  const n = partyCount(card.party) || card.guests || 0;
  return n > 0 ? Math.min(n, MAX_CAST) : 2;
}

/* ── layout ────────────────────────────────────────────────────────────── */

/**
 * Widths are fractions of the face's WIDTH, heights of its HEIGHT, but a
 * cutout's ratio is in pixels: on the Letter face (8.5 × 5.5) a box of
 * width w shows a cutout of ratio r at height h = w × (8.5/5.5) / r. The
 * small tent's face is 5.5 × 4.25 (1.294) — close enough to share the
 * layout; characters come out ~7 % wider there.
 */
const FACE_RATIO_FIX = 8.5 / 5.5;

export type Placement = {
  /** Cutout id (file = castFile(id)). */
  id: string;
  title: string;
  /** Box in fractions of the face: left, top, width, height. */
  l: number;
  t: number;
  w: number;
  h: number;
  /** Draw mirrored (facing left). Cutouts are drawn facing right. */
  mirror: boolean;
  /** true for the narwhal host. */
  host: boolean;
};

export type CastLayout = { backdrop: Backdrop; host: Host; guests: number; cast: Placement[] };

export type LayoutOptions = {
  /** Lowest point (fraction of the face height) a character may reach — above the name block. Letter 0.57, small tent 0.50. */
  stageBottom?: number;
  backdrop?: string | null;
};

/**
 * Lay the cast out for one card. Host in the middle, larger and a little
 * lower (nearer); friends fan out to both sides, smaller and a little higher
 * with each step (further away) and a gentle bob, the ones on the right
 * mirrored so everyone looks in toward the host. Widths shrink as the party
 * grows; if the row still does not fit, everything scales to fit.
 * Draw order: top to bottom (far to near), host last.
 */
export function layoutCast(card: Pick<GuestCard, 'id' | 'party' | 'guests' | 'theme'>, opts: LayoutOptions = {}): CastLayout {
  const key = card.id || 'card';
  const theme: CastTheme = card.theme || '';
  const guests = guestsOf(card);
  const backdrop = backdropFor(key, theme, opts.backdrop);
  const host = hostFor(key, theme, guests);
  const stageBottom = opts.stageBottom ?? 0.57;
  const stageTop = 0.05;

  const nFriends = Math.max(0, Math.min(MAX_CAST - host.count, guests - host.count));
  const pose: 'a' | 'b' = FESTIVE.has(theme) ? 'b' : 'a';
  // friends: a stable shuffle of the species, first nFriends
  const order = FRIENDS.map((f, i) => ({ f, r: unit(key, 'friend' + i) })).sort((a, b) => a.r - b.r).map((x) => x.f);
  const friends = order.slice(0, nFriends).map((f) => f[pose]);

  const total = 1 + friends.length; // characters, the host (pair or single) as one
  // host width as a fraction of the face width, by crowd size
  const hostW = total <= 1 ? 0.40 : total === 2 ? 0.36 : total <= 4 ? 0.32 : total <= 6 ? 0.28 : 0.25;
  const hostH = (hostW * FACE_RATIO_FIX) / host.ratio;
  // friends: height-led so tall (seahorse) and wide (ray) read the same size
  const friendH = hostH * 0.78;
  const friendMaxW = hostW * 0.72;

  type Box = { id: string; title: string; w: number; h: number; host: boolean; side: -1 | 0 | 1; d: number; j: number };
  const boxes: Box[] = [];
  boxes.push({ id: host.id, title: host.title, w: hostW, h: hostH, host: true, side: 0, d: 0, j: 0 });
  friends.forEach((c, i) => {
    const side: -1 | 1 = i % 2 === 0 ? 1 : -1; // first friend to the right, then left, right…
    const d = Math.floor(i / 2) + 1; // distance from the host, 1..
    const jitter = 0.88 + 0.24 * unit(key, 'size' + i);
    let h = friendH * jitter * (1 - 0.06 * (d - 1));
    let w = (h * c.ratio) / FACE_RATIO_FIX;
    if (w > friendMaxW) {
      w = friendMaxW;
      h = (w * FACE_RATIO_FIX) / c.ratio;
    }
    boxes.push({ id: c.id, title: c.title, w, h, host: false, side, d, j: i });
  });

  // left-to-right order: left friends (farthest first), host, right friends (nearest first)
  const left = boxes.filter((b) => b.side === -1).sort((a, b) => b.d - a.d);
  const right = boxes.filter((b) => b.side === 1).sort((a, b) => a.d - b.d);
  const row = [...left, boxes[0], ...right];

  // horizontal fit: even gaps across the stage; overlap a little when crowded, scale down when very crowded
  const stageL = 0.03;
  const stageR = 0.97;
  const avail = stageR - stageL;
  let sum = row.reduce((s, b) => s + b.w, 0);
  let gap = row.length > 1 ? (avail - sum) / (row.length - 1) : 0;
  const minGap = -0.05;
  if (gap < minGap) {
    const k = (avail - minGap * (row.length - 1)) / sum;
    row.forEach((b) => {
      b.w *= k;
      b.h *= k;
    });
    sum = row.reduce((s, b) => s + b.w, 0);
    gap = minGap;
  }
  const maxGap = 0.06;
  if (gap > maxGap) gap = maxGap;
  let x = stageL + (avail - (sum + gap * (row.length - 1))) / 2;

  const placements: Placement[] = [];
  for (const b of row) {
    // vertical: host centre lowest; friends step up with distance, and bob
    const centre = b.host ? 0.40 : 0.36 - 0.025 * (b.d - 1) + (b.j % 2 ? 0.018 : -0.018);
    let t = centre - b.h / 2;
    if (t + b.h > stageBottom) t = stageBottom - b.h;
    if (t < stageTop) t = stageTop;
    placements.push({ id: b.id, title: b.title, l: x, t, w: b.w, h: b.h, mirror: b.side === 1, host: b.host });
    x += b.w + gap;
  }
  // draw order: higher on the face first, host last
  placements.sort((a, b) => (a.host ? 1 : 0) - (b.host ? 1 : 0) || a.t + a.h - (b.t + b.h));
  return { backdrop, host, guests, cast: placements };
}

