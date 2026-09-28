import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument, PDFFont, PDFImage, PDFPage, PrintScaling, clip, concatTransformationMatrix, degrees, endPath, popGraphicsState, pushGraphicsState, rectangle, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CARD_THANKS, type GuestCard } from './guestCards';
import { artFor, letterFileOf, type CardArt, type CardTone } from './guestCardArt';
import { backdropFile, castFile, layoutCast, type CastLayout } from './guestCardCast';

/**
 * Welcome-card PDFs, in two layouts.
 *
 * LETTER (default — v4, owner 27 Sep 2026: "ออกมาเล็ก ไม่ใช่ size letter …
 * ส่งไฟล์พร้อมปริ้นแบบกระดาษหนา"; v5 the same night: "ทำให้ปริ้นเต็ม …
 * Borderless"): ONE card per Letter sheet, portrait, folded once across the
 * middle into a tent 8.5 × 5.5 in — wider than tall, so it stands, and big
 * enough to read from the next table. Nothing to cut: print on card stock,
 * fold, set it down. This is what the HQ app prints on confirm, what
 * "⬇ PDF" hands out and what Drive archives.
 *
 *   sheet 612 × 792 pt, fold at y = 396
 *   face  612 × 396 (8.5 × 5.5 in); the lower face reads upright, the upper
 *         face is the same face rotated 180° so it reads from the far side
 *   art   FULL BLEED: each picture covers its whole face, runs off the
 *         paper's edges and meets the other one at the fold — art from
 *         images/cards/letter/, cut to exactly the face (ratio 1.545) with
 *         the name scrim baked in. Made for the printer's Borderless mode,
 *         which prints ~3 mm past every edge (that sliver of picture is
 *         lost, nothing that matters sits there). Printed WITH margins it
 *         still works — the sheet just gets a thin white edge all round.
 *   safe  type stays ≥ 0.45 in inside the paper edge, and there is no inset
 *         frame line: borderless overspray and a card-stock sheet feeding a
 *         millimetre askew would both show on a border as uneven margins.
 *
 * TENT2 (the original two-up): the same card as /stats/cards prints from the
 * browser — Letter landscape, two 5.5 × 8.5 in blanks side by side, each
 * folded at its waist into a 5.5 × 4.25 in tent. Kept for batch previews.
 *
 * FACE DESIGN (v2, owner 26 Sep 2026): full-face artwork. One piece from the
 * house art set (lib/guestCardArt.ts — gold/navy line art, cute narwhal)
 * fills the face (Letter: to the paper's edges; tent2: inside a white frame
 * with a hairline); the guest's name sits over the calm lower part of the
 * picture, behind a soft scrim in the picture's own ground colour. The v1
 * layout (logo mark, rule, navy type on white) stays as the fallback when
 * the art set is empty.
 *
 * Fonts are the site's own (Fraunces for the name, Inter for the small caps)
 * shipped as TTFs in /public/fonts; Noto Sans Thai steps in for any string
 * those two cannot set, so a guest who booked in Thai still gets a real name
 * on the table instead of boxes.
 */

/* ── page geometry (pt) — TENT2 ────────────────────────────────────────── */
const IN = 72;
const SHEET_W = 11 * IN; // 792
const SHEET_H = 8.5 * IN; // 612
const TENT_W = SHEET_W / 2; // 396
const TENT_H = SHEET_H / 2; // 306
const PAD_TOP = 0.34 * IN;
const PAD_SIDE = 0.45 * IN;
const PAD_BOTTOM = 0.56 * IN;
const CONTENT_W = TENT_W - PAD_SIDE * 2;
const CONTENT_H = TENT_H - PAD_TOP - PAD_BOTTOM;

/* art face */
const FRAME = 0.2 * IN; // white frame around the navy panel
const PANEL_W = TENT_W - FRAME * 2; // 367.2
const PANEL_H = TENT_H - FRAME * 2; // 277.2
export const ART_RATIO = PANEL_W / PANEL_H; // 1.3247 — art files are pre-cropped to this
const ART_TEXT_W = PANEL_W - 2 * 0.35 * IN;
const ART_TEXT_BOTTOM = 0.62 * IN; // stack bottom, measured from the face's bottom edge
const ART_FOOT_BOTTOM = 0.32 * IN;
const SCRIM_FRAC = 0.6; // how much of the panel the name scrim covers, from the bottom

/* ── page geometry (pt) — LETTER ───────────────────────────────────────── */
const L_FACE_W = 8.5 * IN; // 612
const L_FACE_H = 5.5 * IN; // 396 — the fold runs across the middle of the sheet
export const LETTER = {
  sheetW: 8.5 * IN, // 612
  sheetH: 11 * IN, // 792
  faceW: L_FACE_W,
  faceH: L_FACE_H,
  /** Text column, centred: 0.85 in in from each side edge of the paper. */
  textW: L_FACE_W - 2 * 0.85 * IN, // 489.6
  /** Bottom of the name stack / of the small-caps footer, above the paper edge (where v4 had them too). */
  textBottom: 0.71 * IN,
  footBottom: 0.45 * IN,
  /** Fold ticks: this long in from each side edge, on the fold line. */
  tick: 0.3 * IN,
  /**
   * Small type and gaps relative to the small tent's. Deliberately less than
   * the face grew (×1.3): the picture keeps the top ~60 % of the face and the
   * whole name block has to live in the calm bottom ~40 %.
   */
  k: 1.12,
  /** Name: largest one-line size, smallest one-line size, largest two-line size. */
  nameMax: 40,
  nameMinOne: 26,
  nameMaxTwo: 30,
  /** Tallest the name block may be (pt) before the name steps down — keeps it off the picture. */
  stackMax: 112,
} as const;
export const LETTER_ART_RATIO = L_FACE_W / L_FACE_H; // 1.545 — letter/ files are cut to this (the whole face)

/**
 * The name on a Letter card: as big as fits on ONE line (40 → 26 pt), and
 * only when even 26 pt won't hold it, two balanced lines (≤ 30 pt) — never
 * "William Northington &" / "Party". `measure` is the width of a string at a
 * size, from the same font the card is set in, so the PDF and the print page
 * (which asks for the numbers through letterNameLayout) break identically.
 * `maxSize` lets the face step the name down when the block runs too tall.
 */
export type NameFit = { size: number; lines: string[] };
export function fitName(measure: (text: string, size: number) => number, raw: string, maxW: number, maxSize: number = LETTER.nameMax): NameFit {
  const text = raw.replace(/\s+/g, ' ').trim() || 'Reserved';
  for (let s = maxSize; s >= LETTER.nameMinOne; s -= 1) if (measure(text, s) <= maxW) return { size: s, lines: [text] };
  const words = text.split(' ');
  if (words.length > 1) {
    for (let s = Math.min(maxSize, LETTER.nameMaxTwo); s >= 16; s -= 1) {
      let best: { cost: number; lines: string[] } | null = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(' ');
        const b = words.slice(i).join(' ');
        if (/&$/.test(a)) continue; // never leave the ampersand hanging
        const wa = measure(a, s);
        const wb = measure(b, s);
        if (wa > maxW || wb > maxW) continue;
        const cost = Math.max(wa, wb) + (b.startsWith('&') ? maxW * 0.08 : 0);
        if (!best || cost < best.cost) best = { cost, lines: [a, b] };
      }
      if (best) return { size: s, lines: best.lines };
    }
  }
  return { size: 16, lines: [text] };
}

/** Everything in the Letter name block except the name itself, in pt (occasion/thanks on one line each). */
function letterOtherHeight(hasMeta: boolean, hasOccasion: boolean, hasThanks: boolean): number {
  const k = LETTER.k;
  let hh = 7.5 * k * 1.2 + 0.09 * IN * k; // kicker + the gap above the name
  if (hasMeta) hh += 0.11 * IN * k + 9.5 * k * 1.2;
  if (hasOccasion) hh += 0.1 * IN * k + 12 * k * 1.25;
  if (hasThanks) hh += 0.14 * IN * k + 10.5 * k * 1.3;
  return hh;
}

/**
 * The Letter name fit for a whole card: fitName, stepped down until the block
 * (kicker, name, time/party, occasion, thanks) stays inside LETTER.stackMax —
 * a card with an occasion line gets 16 pt more, since that line is the point.
 */
export function letterNameFit(measure: (text: string, size: number) => number, card: GuestCard, opts: Pick<RenderOptions, 'details' | 'thanks'> = {}): NameFit {
  const hasMeta = opts.details !== false && Boolean(card.time || card.party);
  const hasOccasion = Boolean(card.occasion.trim());
  const hasThanks = Boolean((opts.thanks ?? CARD_THANKS).trim());
  const budget = LETTER.stackMax + (hasOccasion ? 16 : 0) - letterOtherHeight(hasMeta, hasOccasion, hasThanks);
  let fit = fitName(measure, card.name, LETTER.textW);
  for (let max = fit.size - 1; fit.lines.length * fit.size * 1.08 > budget && max >= LETTER.nameMinOne; max -= 1) {
    fit = fitName(measure, card.name, LETTER.textW, max);
  }
  return fit;
}

/* ── brand ─────────────────────────────────────────────────────────────── */
const NAVY = rgb(11 / 255, 31 / 255, 51 / 255); // #0B1F33 type on the white card
const NAVY_SOFT = rgb(21 / 255, 47 / 255, 74 / 255); // #152F4A
const BRASS = rgb(200 / 255, 162 / 255, 78 / 255); // #C8A24E
const BRASS_DEEP = rgb(156 / 255, 122 / 255, 51 / 255); // #9C7A33
const DNA_NAVY = rgb(9 / 255, 37 / 255, 59 / 255); // #09253B — the navy edition's own ground (sampled from the files)
const DNA_GOLD = rgb(212 / 255, 178 / 255, 106 / 255); // #D4B26A — gold on navy
const CREAM = rgb(247 / 255, 240 / 255, 225 / 255); // #F7F0E1 — type on navy
const ART_CREAM = rgb(246 / 255, 238 / 255, 222 / 255); // #F6EEDE — the cream edition's own ground (sampled)

/* ── assets ────────────────────────────────────────────────────────────── */
const SITE = (process.env.URL || 'https://narwhalthaihb.com').replace(/\/$/, '');
const FONT_FILES = {
  serif: 'fonts/Fraunces-Medium.ttf',
  serifItalic: 'fonts/Fraunces-MediumItalic.ttf',
  sans: 'fonts/Inter-Regular.ttf',
  sansBold: 'fonts/Inter-SemiBold.ttf',
  thai: 'fonts/NotoSansThai-Medium.ttf',
} as const;
const MARK_FILE = 'images/logo-mark-print.png';

const assetCache = new Map<string, Promise<Uint8Array>>();

/**
 * Read a /public asset. On the function host the file is usually right there
 * (next.config traces public/fonts + public/images/cards into the bundle);
 * when it is not, fetch it from the live site — the CDN has it either way.
 * Cached per process.
 */
function loadAsset(rel: string): Promise<Uint8Array> {
  let p = assetCache.get(rel);
  if (!p) {
    p = (async () => {
      try {
        const buf = await readFile(path.join(process.cwd(), 'public', rel));
        return new Uint8Array(buf);
      } catch {
        const res = await fetch(`${SITE}/${rel}`, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`asset ${rel}: http ${res.status}`);
        return new Uint8Array(await res.arrayBuffer());
      }
    })();
    assetCache.set(rel, p);
    p.catch(() => assetCache.delete(rel));
  }
  return p;
}

type Fonts = Record<keyof typeof FONT_FILES, PDFFont>;

/* ── name measuring without a PDF (for the print page) ─────────────────── */
type FkFont = { unitsPerEm: number; characterSet: number[]; layout: (s: string) => { advanceWidth: number } };
const fkCache = new Map<string, Promise<{ font: FkFont; chars: Set<number> }>>();
function fkFont(rel: string) {
  let p = fkCache.get(rel);
  if (!p) {
    p = loadAsset(rel).then((bytes) => {
      const font = (fontkit as unknown as { create: (b: Uint8Array) => FkFont }).create(bytes);
      return { font, chars: new Set(font.characterSet) };
    });
    fkCache.set(rel, p);
    p.catch(() => fkCache.delete(rel));
  }
  return p;
}

/**
 * The Letter card's name layout (size + lines), measured with the same font
 * files and the same rule (letterNameFit) the PDF uses — the print page asks
 * for this so a name breaks the same way on paper from either path. A name
 * the serif cannot set is measured in Noto Sans Thai, as the PDF draws it.
 */
export async function letterNameLayout(card: GuestCard, opts: Pick<RenderOptions, 'details' | 'thanks'> = {}): Promise<NameFit & { thai: boolean }> {
  const serif = await fkFont(FONT_FILES.serif);
  const fits = [...card.name].every((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return cp < 32 || serif.chars.has(cp);
  });
  const use = fits ? serif : await fkFont(FONT_FILES.thai);
  const measure = (t: string, s: number) => (use.font.layout(t).advanceWidth * s) / use.font.unitsPerEm;
  return { ...letterNameFit(measure, card, opts), thai: !fits };
}

/* ── text helpers ──────────────────────────────────────────────────────── */
const charsets = new WeakMap<PDFFont, Set<number>>();
function canSet(font: PDFFont, text: string): boolean {
  let set = charsets.get(font);
  if (!set) {
    set = new Set(font.getCharacterSet());
    charsets.set(font, set);
  }
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 32) continue;
    if (!set.has(cp)) return false;
  }
  return true;
}

/** Vertical metrics as fractions of the em, from the embedded font when it will say. */
function metrics(font: PDFFont): { asc: number; desc: number } {
  try {
    const fk = (font as unknown as { embedder?: { font?: { ascent?: number; descent?: number; unitsPerEm?: number } } }).embedder?.font;
    if (fk && fk.unitsPerEm && fk.ascent) {
      return { asc: fk.ascent / fk.unitsPerEm, desc: Math.abs(fk.descent ?? 0) / fk.unitsPerEm };
    }
  } catch {
    /* fall through */
  }
  return { asc: 0.9, desc: 0.25 };
}

function textWidth(font: PDFFont, text: string, size: number, spacing = 0): number {
  const n = [...text].length;
  return font.widthOfTextAtSize(text, size) + spacing * Math.max(0, n - 1);
}

/** Greedy word wrap to a width; a single over-long word is left whole. */
function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxW || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

/** Point size for the guest name — the same steps the web page uses. */
export function nameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 18) return 34;
  if (n <= 26) return 29;
  if (n <= 36) return 24;
  return 20;
}

/* ── layout model ──────────────────────────────────────────────────────── */
type Line = {
  kind: 'text';
  text: string;
  font: PDFFont;
  size: number;
  lh: number; // line box height, pt
  spacing: number; // extra letter spacing, pt
  color: ReturnType<typeof rgb>;
  opacity: number;
  mt: number; // margin above, pt
};
type Block = Line | { kind: 'mark'; w: number; h: number; mt: number } | { kind: 'rule'; w: number; h: number; mt: number; mb: number };

/** Vertical room a block takes in the stack, margins included. */
function h(b: Block): number {
  if (b.kind === 'text') return b.mt + b.lh;
  if (b.kind === 'rule') return b.mt + b.h + b.mb;
  return b.mt + b.h;
}

type Palette = { kicker: ReturnType<typeof rgb>; name: ReturnType<typeof rgb>; meta: ReturnType<typeof rgb>; metaOpacity: number; occasion: ReturnType<typeof rgb>; thanks: ReturnType<typeof rgb>; thanksOpacity: number };
const ON_WHITE: Palette = { kicker: BRASS_DEEP, name: NAVY, meta: NAVY_SOFT, metaOpacity: 0.78, occasion: BRASS_DEEP, thanks: NAVY_SOFT, thanksOpacity: 0.85 };
const ON_NAVY: Palette = { kicker: DNA_GOLD, name: CREAM, meta: CREAM, metaOpacity: 0.82, occasion: DNA_GOLD, thanks: CREAM, thanksOpacity: 0.88 };

/**
 * The text lines of a card, top to bottom (no logo/rule — the art face adds none).
 * `k` scales every size and gap (1 = the small tent; LETTER.k for the Letter
 * card), and `nameFit` (the Letter rule, letterNameFit) replaces the small
 * tent's character-count steps for the name.
 */
function textStack(card: GuestCard, fonts: Fonts, opts: RenderOptions, pal: Palette, maxW: number, k = 1, nameFit?: NameFit): Line[] {
  const pick = (want: PDFFont, text: string): PDFFont => (canSet(want, text) ? want : fonts.thai);
  const out: Line[] = [];

  out.push({ kind: 'text', text: 'RESERVED FOR', font: fonts.sansBold, size: 7.5 * k, lh: 7.5 * k * 1.2, spacing: 0.3 * 7.5 * k, color: pal.kicker, opacity: 1, mt: 0 });

  const name = card.name.trim() || 'Reserved';
  const nFont = pick(fonts.serif, name);
  const nm: NameFit = nameFit ?? { size: nameSize(name), lines: wrap(nFont, name, nameSize(name), maxW) };
  nm.lines.forEach((ln, i) =>
    out.push({ kind: 'text', text: ln, font: nFont, size: nm.size, lh: nm.size * 1.08, spacing: 0, color: pal.name, opacity: 1, mt: i === 0 ? 0.09 * IN * k : 0 }),
  );

  const meta = opts.details === false ? '' : [card.time, card.party].filter(Boolean).join('  ·  ');
  if (meta) {
    out.push({ kind: 'text', text: meta, font: pick(fonts.sans, meta), size: 9.5 * k, lh: 9.5 * k * 1.2, spacing: 0.09 * 9.5 * k, color: pal.meta, opacity: pal.metaOpacity, mt: 0.11 * IN * k });
  }

  const occasion = card.occasion.trim();
  if (occasion) {
    const f = pick(fonts.serifItalic, occasion);
    wrap(f, occasion, 12 * k, maxW).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 12 * k, lh: 12 * k * 1.25, spacing: 0, color: pal.occasion, opacity: 1, mt: i === 0 ? 0.1 * IN * k : 0 }),
    );
  }

  const thanks = (opts.thanks ?? CARD_THANKS).trim();
  if (thanks) {
    const f = pick(fonts.serifItalic, thanks);
    wrap(f, thanks, 10.5 * k, maxW).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 10.5 * k, lh: 10.5 * k * 1.3, spacing: 0, color: pal.thanks, opacity: pal.thanksOpacity, mt: i === 0 ? 0.14 * IN * k : 0 }),
    );
  }
  return out;
}

/* ── drawing ───────────────────────────────────────────────────────────── */
type FaceGeom = { w: number; h: number };
const TENT2_FACE: FaceGeom = { w: TENT_W, h: TENT_H };
const LETTER_FACE: FaceGeom = { w: L_FACE_W, h: L_FACE_H };

/**
 * A face's drawing surface. Everything is placed in "face-local" coordinates
 * — `l` from the face's left edge, `t` from its top edge, like CSS — and the
 * surface maps that onto the sheet. Both layouts fold at y = g.h: the upright
 * face is the region BELOW the fold (its top edge on the fold), the flipped
 * face the region ABOVE it rotated 180°, which is the same as point-
 * reflecting every element and rotating text/images by 180°.
 */
class Face {
  constructor(private page: PDFPage, private bx: number, private flip: boolean, private g: FaceGeom = TENT2_FACE) {}

  text(text: string, font: PDFFont, size: number, l: number, t: number, color: ReturnType<typeof rgb>, opacity: number) {
    const { w, h } = this.g;
    if (!this.flip) this.page.drawText(text, { x: this.bx + l, y: h - t, size, font, color, opacity });
    else this.page.drawText(text, { x: this.bx + w - l, y: h + t, size, font, color, opacity, rotate: degrees(180) });
  }

  /** Letter-spaced run, drawn glyph by glyph (pdf-lib has no tracking). */
  line(ln: Line, l: number, baseline: number) {
    if (!ln.spacing) return this.text(ln.text, ln.font, ln.size, l, baseline, ln.color, ln.opacity);
    let x = l;
    for (const ch of [...ln.text]) {
      this.text(ch, ln.font, ln.size, x, baseline, ln.color, ln.opacity);
      x += ln.font.widthOfTextAtSize(ch, ln.size) + ln.spacing;
    }
  }

  image(img: PDFImage, l: number, t: number, w: number, hh: number, opacity = 1) {
    const g = this.g;
    if (!this.flip) this.page.drawImage(img, { x: this.bx + l, y: g.h - (t + hh), width: w, height: hh, opacity });
    else this.page.drawImage(img, { x: this.bx + g.w - l, y: g.h + t + hh, width: w, height: hh, opacity, rotate: degrees(180) });
  }

  /**
   * An image drawn mirrored left↔right in its own box (a friend on the
   * host's right looks in toward the host). A horizontal mirror about the
   * box's vertical centre line commutes with the flipped face's 180° turn,
   * so it is the same operation on both faces.
   */
  imageMirrored(img: PDFImage, l: number, t: number, w: number, hh: number) {
    const b = this.box(l, t, w, hh);
    const cx = b.x + b.width / 2;
    this.page.pushOperators(pushGraphicsState(), concatTransformationMatrix(-1, 0, 0, 1, 2 * cx, 0));
    this.image(img, l, t, w, hh);
    this.page.pushOperators(popGraphicsState());
  }

  /** Page-space rectangle of a face-local box. */
  box(l: number, t: number, w: number, hh: number) {
    const g = this.g;
    return { x: this.flip ? this.bx + g.w - l - w : this.bx + l, y: this.flip ? g.h + t : g.h - (t + hh), width: w, height: hh };
  }

  /** An image cropped to a box ("object-fit: cover", anchored to the box's TOP). */
  coverImage(img: PDFImage, l: number, t: number, w: number, hh: number) {
    const scale = Math.max(w / img.width, hh / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const b = this.box(l, t, w, hh);
    this.page.pushOperators(pushGraphicsState(), rectangle(b.x, b.y, b.width, b.height), clip(), endPath());
    this.image(img, l + (w - dw) / 2, t, dw, dh);
    this.page.pushOperators(popGraphicsState());
  }

  rect(l: number, t: number, w: number, hh: number, o: { color?: ReturnType<typeof rgb>; opacity?: number; border?: ReturnType<typeof rgb>; borderWidth?: number; borderOpacity?: number }) {
    const b = this.box(l, t, w, hh);
    this.page.drawRectangle({ ...b, color: o.color, opacity: o.opacity, borderColor: o.border, borderWidth: o.borderWidth ?? 0, borderOpacity: o.borderOpacity });
  }

  /** Draw a text stack whose TOP sits at `top` (face-local), each line centred on `cx`. */
  stack(lines: Line[], top: number, cx: number) {
    let y = top;
    for (const ln of lines) {
      const { asc, desc } = metrics(ln.font);
      const lineTop = y + ln.mt;
      const baseline = lineTop + (ln.lh - (asc + desc) * ln.size) / 2 + asc * ln.size;
      const w = textWidth(ln.font, ln.text, ln.size, ln.spacing);
      this.line(ln, cx - w / 2, baseline);
      y = lineTop + ln.lh;
    }
  }

  /** The small-caps footer, pinned `bottom` above the face's bottom edge. */
  foot(font: PDFFont, color: ReturnType<typeof rgb>, opacity: number, bottom: number, size = 6.8) {
    const g = this.g;
    const ln: Line = { kind: 'text', text: 'NARWHAL THAI TABLE', font, size, lh: size * 1.2, spacing: 0.34 * size, color, opacity, mt: 0 };
    const fm = metrics(font);
    const top = g.h - bottom - ln.lh;
    const baseline = top + (ln.lh - (fm.asc + fm.desc) * ln.size) / 2 + fm.asc * ln.size;
    this.line(ln, (g.w - textWidth(font, ln.text, ln.size, ln.spacing)) / 2, baseline);
  }
}

const stackHeight = (lines: Line[]) => lines.reduce((s, l) => s + h(l), 0);

/** Width measure in the font the name will be set in (the serif, or Noto Sans Thai for what it can't set). */
const nameMeasure = (fonts: Fonts, name: string) => {
  const f = canSet(fonts.serif, name.trim() || 'Reserved') ? fonts.serif : fonts.thai;
  return (t: string, s: number) => f.widthOfTextAtSize(t, s);
};

/** v1 — logo mark, brass rule, navy type on the white card. Used when no art is available. */
function drawClassicFace(page: PDFPage, bx: number, flip: boolean, card: GuestCard, fonts: Fonts, mark: PDFImage, opts: RenderOptions, g: FaceGeom = TENT2_FACE, k = 1) {
  const f = new Face(page, bx, flip, g);
  const padTop = PAD_TOP * k;
  const contentW = g.w - PAD_SIDE * k * 2;
  const contentH = g.h - padTop - PAD_BOTTOM * k;
  const nameFit = k !== 1 ? letterNameFit(nameMeasure(fonts, card.name), card, opts) : undefined;
  const lines = textStack(card, fonts, opts, ON_WHITE, contentW, k, nameFit);
  const markH = 0.36 * IN * k;
  const markW = (markH * 457) / 260;
  const ruleMt = 0.19 * IN * k;
  const ruleMb = 0.12 * IN * k;
  const total = markH + ruleMt + 0.75 + ruleMb + stackHeight(lines);
  let top = padTop + Math.max(0, (contentH - total) / 2);

  f.image(mark, (g.w - markW) / 2, top, markW, markH, 0.92);
  top += markH + ruleMt;
  f.rect((g.w - 1.35 * IN * k) / 2, top, 1.35 * IN * k, 0.75, { color: BRASS, opacity: 0.75 });
  top += 0.75 + ruleMb;
  f.stack(lines, top, g.w / 2);
  f.foot(fonts.sansBold, BRASS_DEEP, 0.75, k !== 1 ? LETTER.footBottom : 0.3 * IN, 6.8 * k);
}

/**
 * Soft scrim in the picture's own ground colour: bands from the panel's
 * bottom up, solid at the base and fading out over SCRIM_FRAC of the panel —
 * keeps the name readable whatever the picture does down there. (The Letter
 * art files carry this baked in; it is drawn only over a small-tent cut.)
 */
function drawScrim(f: Face, l: number, t: number, w: number, hh: number, ground: ReturnType<typeof rgb>, dark: boolean) {
  const bands = 18;
  const scrimH = hh * SCRIM_FRAC;
  const bh = scrimH / bands;
  for (let i = 0; i < bands; i++) {
    const k = 1 - i / bands; // 1 at the bottom band
    const opacity = (dark ? 0.92 : 0.9) * Math.pow(k, 1.4);
    f.rect(l, t + hh - (i + 1) * bh, w, bh + 0.2, { color: ground, opacity });
  }
}

/**
 * v2 — full-face artwork inside a white frame, the name over a soft scrim in
 * the picture's own ground colour: cream type + gold small caps on the navy
 * edition, navy type + deep-brass small caps on the cream edition.
 */
function drawArtFace(page: PDFPage, bx: number, flip: boolean, card: GuestCard, fonts: Fonts, art: PDFImage, tone: CardTone, opts: RenderOptions) {
  const f = new Face(page, bx, flip);
  const dark = tone === 'navy';
  const ground = dark ? DNA_NAVY : ART_CREAM;
  const accent = dark ? DNA_GOLD : BRASS;
  // panel + picture (the file is pre-cropped to the panel's ratio; draw it edge to edge)
  f.rect(FRAME, FRAME, PANEL_W, PANEL_H, { color: ground });
  f.image(art, FRAME, FRAME, PANEL_W, PANEL_H);
  drawScrim(f, FRAME, FRAME, PANEL_W, PANEL_H, ground, dark);
  // hairline just inside the panel
  const inset = 6;
  f.rect(FRAME + inset, FRAME + inset, PANEL_W - inset * 2, PANEL_H - inset * 2, { border: accent, borderWidth: 0.6, borderOpacity: dark ? 0.7 : 0.6, opacity: 0 });
  // name block, anchored to the bottom so the picture keeps its sky
  const lines = textStack(card, fonts, opts, dark ? ON_NAVY : ON_WHITE, ART_TEXT_W);
  const top = TENT_H - ART_TEXT_BOTTOM - stackHeight(lines);
  f.stack(lines, top, TENT_W / 2);
  f.foot(fonts.sansBold, dark ? DNA_GOLD : BRASS_DEEP, dark ? 0.85 : 0.8, ART_FOOT_BOTTOM);
}

/**
 * The Letter card's face, full bleed: the picture covers the whole
 * 8.5 × 5.5 in face, the name block sits over its calm bottom. `baked` = the
 * picture is the letter/ cut (the face's exact ratio, scrim already in it);
 * anything else — the small-tent cut when the letter file can't be loaded,
 * or a cut of another ratio — is cropped to fill, and an unbaked one gets
 * the scrim drawn, so a missing file never costs the card.
 */
function drawLetterArtFace(page: PDFPage, flip: boolean, card: GuestCard, fonts: Fonts, art: { img: PDFImage; baked: boolean }, tone: CardTone, opts: RenderOptions) {
  const f = new Face(page, 0, flip, LETTER_FACE);
  const dark = tone === 'navy';
  const ground = dark ? DNA_NAVY : ART_CREAM;
  const { faceW: fw, faceH: fh } = LETTER;
  f.coverImage(art.img, 0, 0, fw, fh);
  if (!art.baked) drawScrim(f, 0, 0, fw, fh, ground, dark);
  const lines = textStack(card, fonts, opts, dark ? ON_NAVY : ON_WHITE, LETTER.textW, LETTER.k, letterNameFit(nameMeasure(fonts, card.name), card, opts));
  f.stack(lines, fh - LETTER.textBottom - stackHeight(lines), fw / 2);
  f.foot(fonts.sansBold, dark ? DNA_GOLD : BRASS_DEEP, dark ? 0.85 : 0.8, LETTER.footBottom, 6.8 * LETTER.k);
}

/** Images a composed (cast) card needs: its backdrop and every cutout it seats. */
type CastImages = { backdrop: PDFImage; cutouts: Map<string, PDFImage> };

/**
 * The party-size card's Letter face: backdrop (letter cut, scrim baked in)
 * to the paper's edges, then the cast — host and friends placed by
 * layoutCast in fractions of the face — then the name block. Cream edition
 * only, so the type is the on-cream palette.
 */
function drawLetterCastFace(page: PDFPage, flip: boolean, card: GuestCard, fonts: Fonts, lay: CastLayout, imgs: CastImages, opts: RenderOptions) {
  const f = new Face(page, 0, flip, LETTER_FACE);
  const { faceW: fw, faceH: fh } = LETTER;
  f.coverImage(imgs.backdrop, 0, 0, fw, fh);
  for (const p of lay.cast) {
    const img = imgs.cutouts.get(p.id);
    if (!img) continue;
    if (p.mirror) f.imageMirrored(img, p.l * fw, p.t * fh, p.w * fw, p.h * fh);
    else f.image(img, p.l * fw, p.t * fh, p.w * fw, p.h * fh);
  }
  const lines = textStack(card, fonts, opts, ON_WHITE, LETTER.textW, LETTER.k, letterNameFit(nameMeasure(fonts, card.name), card, opts));
  f.stack(lines, fh - LETTER.textBottom - stackHeight(lines), fw / 2);
  f.foot(fonts.sansBold, BRASS_DEEP, 0.8, LETTER.footBottom, 6.8 * LETTER.k);
}

/** The party-size card on the small tent (tent2): backdrop small cut in the panel, drawn scrim UNDER the cast, then the cast, hairline, name. */
function drawCastFace(page: PDFPage, bx: number, flip: boolean, card: GuestCard, fonts: Fonts, lay: CastLayout, imgs: CastImages, opts: RenderOptions) {
  const f = new Face(page, bx, flip);
  f.rect(FRAME, FRAME, PANEL_W, PANEL_H, { color: ART_CREAM });
  f.coverImage(imgs.backdrop, FRAME, FRAME, PANEL_W, PANEL_H);
  drawScrim(f, FRAME, FRAME, PANEL_W, PANEL_H, ART_CREAM, false);
  for (const p of lay.cast) {
    const img = imgs.cutouts.get(p.id);
    if (!img) continue;
    const l = FRAME + p.l * PANEL_W;
    const t = FRAME + p.t * PANEL_H;
    if (p.mirror) f.imageMirrored(img, l, t, p.w * PANEL_W, p.h * PANEL_H);
    else f.image(img, l, t, p.w * PANEL_W, p.h * PANEL_H);
  }
  const inset = 6;
  f.rect(FRAME + inset, FRAME + inset, PANEL_W - inset * 2, PANEL_H - inset * 2, { border: BRASS, borderWidth: 0.6, borderOpacity: 0.6, opacity: 0 });
  const lines = textStack(card, fonts, opts, ON_WHITE, ART_TEXT_W);
  f.stack(lines, TENT_H - ART_TEXT_BOTTOM - stackHeight(lines), TENT_W / 2);
  f.foot(fonts.sansBold, BRASS_DEEP, 0.8, ART_FOOT_BOTTOM);
}

function drawGuides(page: PDFPage) {
  const ink = rgb(11 / 255, 31 / 255, 51 / 255);
  // Cut down the middle (dashed) — vanishes into the tent's edge.
  page.drawLine({ start: { x: TENT_W, y: 0 }, end: { x: TENT_W, y: SHEET_H }, thickness: 0.75, color: ink, opacity: 0.3, dashArray: [3, 3] });
  // Fold across the waist (dotted) — vanishes into the crease.
  page.drawLine({ start: { x: 0, y: TENT_H }, end: { x: SHEET_W, y: TENT_H }, thickness: 0.75, color: ink, opacity: 0.22, dashArray: [1, 2] });
}

/**
 * Letter: nothing to cut — one fold across the middle, where the two
 * pictures meet. No line across the art (fold a hair off and it would show
 * on a face); just a short tick in from each side edge, on the fold line, to
 * lay a ruler on and score along (card stock folds clean scored). Long
 * enough that borderless overspray (~3 mm) leaves most of it; after folding
 * it sits on the crease and disappears. `tone` = the picture's ground.
 */
function drawLetterGuides(page: PDFPage, tone: CardTone | null) {
  const ink = tone === 'navy' ? CREAM : NAVY;
  const opacity = tone === 'navy' ? 0.55 : 0.45;
  const y = LETTER.faceH;
  const { sheetW: w, tick } = LETTER;
  page.drawLine({ start: { x: 0, y }, end: { x: tick, y }, thickness: 0.75, color: ink, opacity });
  page.drawLine({ start: { x: w - tick, y }, end: { x: w, y }, thickness: 0.75, color: ink, opacity });
}

/* ── public API ────────────────────────────────────────────────────────── */
export type CardLayout = 'letter' | 'tent2';

export type RenderOptions = {
  /** 'letter' (default): one card per Letter sheet, full bleed, fold in half → 8.5 × 5.5 in tent. 'tent2': two 5.5 × 4.25 in tents per landscape sheet (the /stats/cards sheet). */
  layout?: CardLayout;
  /** Show "7:00 PM · Party of 4" under the name (default true). */
  details?: boolean;
  /** Override the thank-you line; '' hides it. Defaults to CARD_THANKS. */
  thanks?: string;
  /** PDF metadata title. */
  title?: string;
  /**
   * Art override: a 1-based index into CARD_ART picks a finished scene;
   * 'cast' (or nothing) composes the party-size card; a chooser per card
   * may return either. Default: the composed card.
   */
  art?: number | string | null | ((card: GuestCard, i: number) => number | string | null | undefined);
  /** Backdrop override for composed cards (BACKDROPS id), e.g. from the print page's picker. */
  backdrop?: string | null;
  /** Force the v1 white card (no artwork). */
  noArt?: boolean;
};

/** What a card shows: a composed party-size card, a finished scene, or the plain v1 card. */
export type CardDesign = { kind: 'cast'; layout: CastLayout } | { kind: 'scene'; art: CardArt } | { kind: 'plain' };

/**
 * Resolve one card's design from the options. A numeric override (1..N)
 * means a scene from CARD_ART; anything else is the composed card — the
 * default since v6 — unless `noArt` asks for the plain one.
 */
export function cardDesign(card: GuestCard, override: number | string | null | undefined, opts: Pick<RenderOptions, 'noArt' | 'backdrop' | 'layout'> = {}): CardDesign {
  if (opts.noArt) return { kind: 'plain' };
  const n = Number(override);
  if (Number.isInteger(n) && n >= 1) {
    const art = artFor(card.id, n, card.theme);
    if (art) return { kind: 'scene', art };
  }
  return { kind: 'cast', layout: layoutCast(card, { backdrop: opts.backdrop, stageBottom: opts.layout === 'tent2' ? 0.5 : 0.57 }) };
}

type LoadedArt = { bytes: Uint8Array; file: string; baked: boolean };

/**
 * Render cards to a PDF, in order. Letter: one sheet per card. Tent2: two
 * tents per landscape sheet; one card → one sheet with the right blank empty.
 */
export async function renderCardsPdf(cards: GuestCard[], opts: RenderOptions = {}): Promise<Uint8Array> {
  const layout: CardLayout = opts.layout === 'tent2' ? 'tent2' : 'letter';
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(opts.title || 'Narwhal Thai Table — welcome card');
  doc.setProducer('narwhalthaihb.com');
  doc.setCreator('Narwhal Thai Table');
  // Print at actual size where the viewer honours it (Acrobat): the fold is the middle of the sheet.
  if (layout === 'letter') doc.catalog.getOrCreateViewerPreferences().setPrintScaling(PrintScaling.None);

  const list: GuestCard[] = cards.length ? cards : [{ id: 'blank', name: 'Reserved', time: '', party: '', occasion: '', theme: '', notes: '' }];

  // Decide each card's design first so the assets can load in one go.
  const designs: CardDesign[] = list.map((c, i) => cardDesign(c, typeof opts.art === 'function' ? opts.art(c, i) : opts.art, { noArt: opts.noArt, backdrop: opts.backdrop, layout }));
  const arts: (CardArt | null)[] = designs.map((d) => (d.kind === 'scene' ? d.art : null));
  const pieces = [...new Map(arts.filter((a): a is CardArt => !!a).map((a) => [a.id, a])).values()];
  const backdropIds = [...new Set(designs.flatMap((d) => (d.kind === 'cast' ? [d.layout.backdrop.id] : [])))];
  const cutoutIds = [...new Set(designs.flatMap((d) => (d.kind === 'cast' ? d.layout.cast.map((p) => p.id) : [])))];
  const cut = layout === 'letter' ? 'letter' : 'small';

  const loadArt = async (a: CardArt): Promise<LoadedArt> => {
    if (layout === 'letter') {
      const file = letterFileOf(a);
      try {
        return { bytes: await loadAsset(file), file, baked: true };
      } catch {
        /* no letter cut on disk or CDN — crop the small one instead */
      }
    }
    return { bytes: await loadAsset(a.file), file: a.file, baked: false };
  };

  const [serif, serifItalic, sans, sansBold, thai, markBytes, artLoaded, backdropBytes, cutoutBytes] = await Promise.all([
    loadAsset(FONT_FILES.serif),
    loadAsset(FONT_FILES.serifItalic),
    loadAsset(FONT_FILES.sans),
    loadAsset(FONT_FILES.sansBold),
    loadAsset(FONT_FILES.thai),
    loadAsset(MARK_FILE),
    Promise.all(pieces.map(loadArt)),
    Promise.all(backdropIds.map((id) => loadAsset(backdropFile(id, cut)))),
    Promise.all(cutoutIds.map((id) => loadAsset(castFile(id)))),
  ]);

  // Two embedding modes, chosen by experiment (scripts/card-preview.ts):
  //  · Fraunces / Noto Thai: subset. Whole-font embedding breaks them — glyphs
  //    reached through OpenType features (the "Th" ligature, contextual h/n/d)
  //    get no width entry and print with a gap after them.
  //  · Inter: whole. fontkit's TrueType subsetter silently drops glyphs from
  //    Google's Inter build (R, D, digits… came out blank). The Inter TTFs in
  //    /public/fonts are pre-trimmed to Latin (~60 KB each) to keep that cheap.
  const fonts: Fonts = {
    serif: await doc.embedFont(serif, { subset: true }),
    serifItalic: await doc.embedFont(serifItalic, { subset: true }),
    sans: await doc.embedFont(sans, { subset: false }),
    sansBold: await doc.embedFont(sansBold, { subset: false }),
    thai: await doc.embedFont(thai, { subset: true }),
  };
  const mark = await doc.embedPng(markBytes as Uint8Array);
  const artImages = new Map<string, { img: PDFImage; baked: boolean }>();
  for (let i = 0; i < pieces.length; i++) {
    const got = artLoaded[i] as LoadedArt;
    const img = /\.png$/i.test(got.file) ? await doc.embedPng(got.bytes) : await doc.embedJpg(got.bytes);
    artImages.set(pieces[i].id, { img, baked: got.baked });
  }
  const backdrops = new Map<string, PDFImage>();
  for (let i = 0; i < backdropIds.length; i++) backdrops.set(backdropIds[i], await doc.embedJpg(backdropBytes[i]));
  const cutouts = new Map<string, PDFImage>();
  for (let i = 0; i < cutoutIds.length; i++) cutouts.set(cutoutIds[i], await doc.embedPng(cutoutBytes[i]));
  const castImages = (d: CastLayout): CastImages | null => {
    const backdrop = backdrops.get(d.backdrop.id);
    return backdrop ? { backdrop, cutouts } : null;
  };

  if (layout === 'letter') {
    list.forEach((card, i) => {
      const page = doc.addPage([LETTER.sheetW, LETTER.sheetH]);
      const d = designs[i];
      const art = arts[i];
      const got = art ? artImages.get(art.id) : undefined;
      const cast = d.kind === 'cast' ? castImages(d.layout) : null;
      const tone: CardTone | null = cast ? 'cream' : got && art ? art.tone : null;
      // The picture's ground under the whole sheet first: no white hairline where the two pictures meet at the fold.
      if (tone) page.drawRectangle({ x: 0, y: 0, width: LETTER.sheetW, height: LETTER.sheetH, color: tone === 'navy' ? DNA_NAVY : ART_CREAM });
      for (const flip of [true, false]) {
        if (d.kind === 'cast' && cast) drawLetterCastFace(page, flip, card, fonts, d.layout, cast, opts);
        else if (got && art) drawLetterArtFace(page, flip, card, fonts, got, art.tone, opts);
        else drawClassicFace(page, 0, flip, card, fonts, mark, opts, LETTER_FACE, LETTER.k);
      }
      drawLetterGuides(page, tone);
    });
    return doc.save();
  }

  for (let i = 0; i < list.length; i += 2) {
    const page = doc.addPage([SHEET_W, SHEET_H]);
    list.slice(i, i + 2).forEach((card, j) => {
      const bx = j * TENT_W;
      const d = designs[i + j];
      const art = arts[i + j];
      const got = art ? artImages.get(art.id) : undefined;
      const cast = d.kind === 'cast' ? castImages(d.layout) : null;
      for (const flip of [true, false]) {
        if (d.kind === 'cast' && cast) drawCastFace(page, bx, flip, card, fonts, d.layout, cast, opts);
        else if (got && art) drawArtFace(page, bx, flip, card, fonts, got.img, art.tone, opts);
        else drawClassicFace(page, bx, flip, card, fonts, mark, opts);
      }
    });
    drawGuides(page);
  }
  return doc.save();
}

/** One reservation's card — the Letter tent unless `layout: 'tent2'` is asked for. */
export async function renderCardPdf(card: GuestCard, opts: RenderOptions = {}): Promise<Uint8Array> {
  return renderCardsPdf([card], { title: `Welcome card — ${card.name}`, ...opts });
}
