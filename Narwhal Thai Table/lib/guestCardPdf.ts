import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument, PDFFont, PDFImage, PDFPage, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CARD_THANKS, type GuestCard } from './guestCards';
import { artFor, type CardArt, type CardTone } from './guestCardArt';

/**
 * Table-tent PDF — the same card /stats/cards prints from the browser, drawn
 * by hand into a Letter-landscape PDF so it can be ARCHIVED (Drive) and
 * printed from a phone (iOS share → Print) where a web page's @page rules are
 * not reliable.
 *
 * Geometry is the one documented in app/stats/cards/CardsClient.tsx, in
 * points (72/in): sheet 792 × 612, two blanks of 396 × 612 side by side, each
 * folded at its waist into a 396 × 306 tent (5.5 × 4.25 in). The lower half
 * of a blank is the front face, upright; the upper half is the same face
 * rotated 180° so it reads from the far side of the table once folded.
 * A single confirmation prints one card into the left blank and leaves the
 * right blank empty — the cut line is still drawn so the team's routine is
 * unchanged: cut down the middle, fold across the dotted line.
 *
 * FACE DESIGN (v2, owner 26 Sep 2026): full-face artwork. A navy panel with
 * one piece from the house art set (lib/guestCardArt.ts — gold line art,
 * cute narwhal) fills the face inside a 0.2 in white frame; the guest's name
 * sits in cream over the calm lower third of the picture, behind a soft
 * navy scrim. The white frame is deliberate: the Epson cannot print into
 * the outer ~3 mm of the sheet, so a true full-bleed would come out with a
 * white sliver on two edges of every tent — a frame on all four looks meant.
 * The v1 layout (logo mark, rule, navy type on white) stays as the fallback
 * when the art set is empty.
 *
 * Fonts are the site's own (Fraunces for the name, Inter for the small caps)
 * shipped as TTFs in /public/fonts; Noto Sans Thai steps in for any string
 * those two cannot set, so a guest who booked in Thai still gets a real name
 * on the table instead of boxes.
 */

/* ── page geometry (pt) ────────────────────────────────────────────────── */
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

/** The text lines of a card, top to bottom (no logo/rule — the art face adds none). */
function textStack(card: GuestCard, fonts: Fonts, opts: RenderOptions, pal: Palette, maxW: number): Line[] {
  const pick = (want: PDFFont, text: string): PDFFont => (canSet(want, text) ? want : fonts.thai);
  const out: Line[] = [];

  out.push({ kind: 'text', text: 'RESERVED FOR', font: fonts.sansBold, size: 7.5, lh: 7.5 * 1.2, spacing: 0.3 * 7.5, color: pal.kicker, opacity: 1, mt: 0 });

  const name = card.name.trim() || 'Reserved';
  const nSize = nameSize(name);
  const nFont = pick(fonts.serif, name);
  wrap(nFont, name, nSize, maxW).forEach((ln, i) =>
    out.push({ kind: 'text', text: ln, font: nFont, size: nSize, lh: nSize * 1.08, spacing: 0, color: pal.name, opacity: 1, mt: i === 0 ? 0.09 * IN : 0 }),
  );

  const meta = opts.details === false ? '' : [card.time, card.party].filter(Boolean).join('  ·  ');
  if (meta) {
    out.push({ kind: 'text', text: meta, font: pick(fonts.sans, meta), size: 9.5, lh: 9.5 * 1.2, spacing: 0.09 * 9.5, color: pal.meta, opacity: pal.metaOpacity, mt: 0.11 * IN });
  }

  const occasion = card.occasion.trim();
  if (occasion) {
    const f = pick(fonts.serifItalic, occasion);
    wrap(f, occasion, 12, maxW).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 12, lh: 12 * 1.25, spacing: 0, color: pal.occasion, opacity: 1, mt: i === 0 ? 0.1 * IN : 0 }),
    );
  }

  const thanks = (opts.thanks ?? CARD_THANKS).trim();
  if (thanks) {
    const f = pick(fonts.serifItalic, thanks);
    wrap(f, thanks, 10.5, maxW).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 10.5, lh: 10.5 * 1.3, spacing: 0, color: pal.thanks, opacity: pal.thanksOpacity, mt: i === 0 ? 0.14 * IN : 0 }),
    );
  }
  return out;
}

/* ── drawing ───────────────────────────────────────────────────────────── */
/**
 * A face's drawing surface. Everything is placed in "face-local" coordinates
 * — `l` from the face's left edge, `t` from its top edge, like CSS — and the
 * surface maps that onto the sheet: the upright face is the LOWER half of a
 * blank, the flipped face the UPPER half rotated 180°, which is the same as
 * point-reflecting every element and rotating text/images by 180°.
 */
class Face {
  constructor(private page: PDFPage, private bx: number, private flip: boolean) {}

  text(text: string, font: PDFFont, size: number, l: number, t: number, color: ReturnType<typeof rgb>, opacity: number) {
    if (!this.flip) this.page.drawText(text, { x: this.bx + l, y: TENT_H - t, size, font, color, opacity });
    else this.page.drawText(text, { x: this.bx + TENT_W - l, y: TENT_H + t, size, font, color, opacity, rotate: degrees(180) });
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
    if (!this.flip) this.page.drawImage(img, { x: this.bx + l, y: TENT_H - (t + hh), width: w, height: hh, opacity });
    else this.page.drawImage(img, { x: this.bx + TENT_W - l, y: TENT_H + t + hh, width: w, height: hh, opacity, rotate: degrees(180) });
  }

  rect(l: number, t: number, w: number, hh: number, o: { color?: ReturnType<typeof rgb>; opacity?: number; border?: ReturnType<typeof rgb>; borderWidth?: number; borderOpacity?: number }) {
    const x = this.flip ? this.bx + TENT_W - l - w : this.bx + l;
    const y = this.flip ? TENT_H + t : TENT_H - (t + hh);
    this.page.drawRectangle({ x, y, width: w, height: hh, color: o.color, opacity: o.opacity, borderColor: o.border, borderWidth: o.borderWidth ?? 0, borderOpacity: o.borderOpacity });
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
  foot(font: PDFFont, color: ReturnType<typeof rgb>, opacity: number, bottom: number) {
    const ln: Line = { kind: 'text', text: 'NARWHAL THAI TABLE', font, size: 6.8, lh: 6.8 * 1.2, spacing: 0.34 * 6.8, color, opacity, mt: 0 };
    const fm = metrics(font);
    const top = TENT_H - bottom - ln.lh;
    const baseline = top + (ln.lh - (fm.asc + fm.desc) * ln.size) / 2 + fm.asc * ln.size;
    this.line(ln, (TENT_W - textWidth(font, ln.text, ln.size, ln.spacing)) / 2, baseline);
  }
}

const stackHeight = (lines: Line[]) => lines.reduce((s, l) => s + h(l), 0);

/** v1 — logo mark, brass rule, navy type on the white card. Used when no art is available. */
function drawClassicFace(page: PDFPage, bx: number, flip: boolean, card: GuestCard, fonts: Fonts, mark: PDFImage, opts: RenderOptions) {
  const f = new Face(page, bx, flip);
  const lines = textStack(card, fonts, opts, ON_WHITE, CONTENT_W);
  const markW = (0.36 * IN * 457) / 260;
  const markH = 0.36 * IN;
  const ruleMt = 0.19 * IN;
  const ruleMb = 0.12 * IN;
  const total = markH + ruleMt + 0.75 + ruleMb + stackHeight(lines);
  let top = PAD_TOP + Math.max(0, (CONTENT_H - total) / 2);

  f.image(mark, (TENT_W - markW) / 2, top, markW, markH, 0.92);
  top += markH + ruleMt;
  f.rect((TENT_W - 1.35 * IN) / 2, top, 1.35 * IN, 0.75, { color: BRASS, opacity: 0.75 });
  top += 0.75 + ruleMb;
  f.stack(lines, top, TENT_W / 2);
  f.foot(fonts.sansBold, BRASS_DEEP, 0.75, 0.3 * IN);
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
  // scrim: bands from the panel's bottom up, solid at the base and fading out —
  // keeps the name readable whatever the picture does down there
  const bands = 18;
  const scrimH = PANEL_H * SCRIM_FRAC;
  const bh = scrimH / bands;
  for (let i = 0; i < bands; i++) {
    const k = 1 - i / bands; // 1 at the bottom band
    const opacity = (dark ? 0.92 : 0.9) * Math.pow(k, 1.4);
    f.rect(FRAME, FRAME + PANEL_H - (i + 1) * bh, PANEL_W, bh + 0.2, { color: ground, opacity });
  }
  // hairline just inside the panel
  const inset = 6;
  f.rect(FRAME + inset, FRAME + inset, PANEL_W - inset * 2, PANEL_H - inset * 2, { border: accent, borderWidth: 0.6, borderOpacity: dark ? 0.7 : 0.6, opacity: 0 });
  // name block, anchored to the bottom so the picture keeps its sky
  const lines = textStack(card, fonts, opts, dark ? ON_NAVY : ON_WHITE, ART_TEXT_W);
  const top = TENT_H - ART_TEXT_BOTTOM - stackHeight(lines);
  f.stack(lines, top, TENT_W / 2);
  f.foot(fonts.sansBold, dark ? DNA_GOLD : BRASS_DEEP, dark ? 0.85 : 0.8, ART_FOOT_BOTTOM);
}

function drawGuides(page: PDFPage) {
  const ink = rgb(11 / 255, 31 / 255, 51 / 255);
  // Cut down the middle (dashed) — vanishes into the tent's edge.
  page.drawLine({ start: { x: TENT_W, y: 0 }, end: { x: TENT_W, y: SHEET_H }, thickness: 0.75, color: ink, opacity: 0.3, dashArray: [3, 3] });
  // Fold across the waist (dotted) — vanishes into the crease.
  page.drawLine({ start: { x: 0, y: TENT_H }, end: { x: SHEET_W, y: TENT_H }, thickness: 0.75, color: ink, opacity: 0.22, dashArray: [1, 2] });
}

/* ── public API ────────────────────────────────────────────────────────── */
export type RenderOptions = {
  /** Show "7:00 PM · Party of 4" under the name (default true). */
  details?: boolean;
  /** Override the thank-you line; '' hides it. Defaults to CARD_THANKS. */
  thanks?: string;
  /** PDF metadata title. */
  title?: string;
  /** Art override: 1-based index into CARD_ART, or a chooser per card. Default: deterministic per card id. */
  art?: number | string | null | ((card: GuestCard, i: number) => number | string | null | undefined);
  /** Force the v1 white card (no artwork). */
  noArt?: boolean;
};

/**
 * Render cards to a Letter-landscape PDF, two tents per sheet, in order.
 * One card → one sheet with the right blank empty.
 */
export async function renderCardsPdf(cards: GuestCard[], opts: RenderOptions = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(opts.title || 'Narwhal Thai Table — welcome card');
  doc.setProducer('narwhalthaihb.com');
  doc.setCreator('Narwhal Thai Table');

  const list = cards.length ? cards : [{ id: 'blank', name: 'Reserved', time: '', party: '', occasion: '', notes: '' }];

  // Decide the artwork per card first so the assets can load in one go.
  const arts: (CardArt | null)[] = list.map((c, i) => {
    if (opts.noArt) return null;
    const o = typeof opts.art === 'function' ? opts.art(c, i) : opts.art;
    return artFor(c.id, o);
  });
  const artFiles = [...new Set(arts.filter((a): a is CardArt => !!a).map((a) => a.file))];

  const [serif, serifItalic, sans, sansBold, thai, markBytes, ...artBytes] = await Promise.all([
    loadAsset(FONT_FILES.serif),
    loadAsset(FONT_FILES.serifItalic),
    loadAsset(FONT_FILES.sans),
    loadAsset(FONT_FILES.sansBold),
    loadAsset(FONT_FILES.thai),
    loadAsset(MARK_FILE),
    ...artFiles.map((f) => loadAsset(f)),
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
  const mark = await doc.embedPng(markBytes);
  const artImages = new Map<string, PDFImage>();
  for (let i = 0; i < artFiles.length; i++) {
    const bytes = artBytes[i];
    artImages.set(artFiles[i], /\.png$/i.test(artFiles[i]) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes));
  }

  for (let i = 0; i < list.length; i += 2) {
    const page = doc.addPage([SHEET_W, SHEET_H]);
    list.slice(i, i + 2).forEach((card, j) => {
      const bx = j * TENT_W;
      const art = arts[i + j];
      const img = art ? artImages.get(art.file) : undefined;
      if (img) {
        drawArtFace(page, bx, true, card, fonts, img, art!.tone, opts);
        drawArtFace(page, bx, false, card, fonts, img, art!.tone, opts);
      } else {
        drawClassicFace(page, bx, true, card, fonts, mark, opts);
        drawClassicFace(page, bx, false, card, fonts, mark, opts);
      }
    });
    drawGuides(page);
  }
  return doc.save();
}

export async function renderCardPdf(card: GuestCard, opts: RenderOptions = {}): Promise<Uint8Array> {
  return renderCardsPdf([card], { title: `Welcome card — ${card.name}`, ...opts });
}
