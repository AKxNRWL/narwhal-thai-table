import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument, PDFFont, PDFImage, PDFPage, degrees, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CARD_THANKS, type GuestCard } from './guestCards';

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

/* ── brand ─────────────────────────────────────────────────────────────── */
const NAVY = rgb(11 / 255, 31 / 255, 51 / 255);
const NAVY_SOFT = rgb(21 / 255, 47 / 255, 74 / 255);
const BRASS = rgb(200 / 255, 162 / 255, 78 / 255);
const BRASS_DEEP = rgb(156 / 255, 122 / 255, 51 / 255);

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
 * (next.config traces public/fonts into the bundle); when it is not, fetch it
 * from the live site — the CDN has it either way. Cached per process.
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

/** Greedy word wrap to the card's usable width; a single over-long word is left whole. */
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

function buildStack(card: GuestCard, fonts: Fonts, opts: RenderOptions): Block[] {
  const pick = (want: PDFFont, text: string): PDFFont => (canSet(want, text) ? want : fonts.thai);
  const out: Block[] = [];

  out.push({ kind: 'mark', w: (0.36 * IN * 457) / 260, h: 0.36 * IN, mt: 0 });
  out.push({ kind: 'rule', w: 1.35 * IN, h: 0.75, mt: 0.19 * IN, mb: 0.12 * IN });

  const kicker = 'RESERVED FOR';
  out.push({ kind: 'text', text: kicker, font: fonts.sansBold, size: 7.5, lh: 7.5 * 1.2, spacing: 0.3 * 7.5, color: BRASS_DEEP, opacity: 1, mt: 0 });

  const name = card.name.trim() || 'Reserved';
  const nSize = nameSize(name);
  const nFont = pick(fonts.serif, name);
  wrap(nFont, name, nSize, CONTENT_W).forEach((ln, i) =>
    out.push({ kind: 'text', text: ln, font: nFont, size: nSize, lh: nSize * 1.08, spacing: 0, color: NAVY, opacity: 1, mt: i === 0 ? 0.09 * IN : 0 }),
  );

  const meta = opts.details === false ? '' : [card.time, card.party].filter(Boolean).join('  ·  ');
  if (meta) {
    out.push({ kind: 'text', text: meta, font: pick(fonts.sans, meta), size: 9.5, lh: 9.5 * 1.2, spacing: 0.09 * 9.5, color: NAVY_SOFT, opacity: 0.78, mt: 0.11 * IN });
  }

  const occasion = card.occasion.trim();
  if (occasion) {
    const f = pick(fonts.serifItalic, occasion);
    wrap(f, occasion, 12, CONTENT_W).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 12, lh: 12 * 1.25, spacing: 0, color: BRASS_DEEP, opacity: 1, mt: i === 0 ? 0.1 * IN : 0 }),
    );
  }

  const thanks = (opts.thanks ?? CARD_THANKS).trim();
  if (thanks) {
    const f = pick(fonts.serifItalic, thanks);
    wrap(f, thanks, 10.5, CONTENT_W).forEach((ln, i) =>
      out.push({ kind: 'text', text: ln, font: f, size: 10.5, lh: 10.5 * 1.3, spacing: 0, color: NAVY_SOFT, opacity: 0.85, mt: i === 0 ? 0.14 * IN : 0 }),
    );
  }
  return out;
}

/* ── drawing ───────────────────────────────────────────────────────────── */
/**
 * Draw one face of a tent. `bx` is the blank's left edge on the sheet.
 * `flip` draws the upper (rotated) face: every point-reflected element is
 * placed at the mirror of its upright position and rotated 180°, which is
 * exactly what a 180° turn of the whole face amounts to.
 */
function drawFace(page: PDFPage, bx: number, flip: boolean, stack: Block[], mark: PDFImage, fonts: Fonts) {
  const total = stack.reduce((s, b) => s + h(b), 0);
  let top = PAD_TOP + Math.max(0, (CONTENT_H - total) / 2); // distance from the face's top edge

  // Upright face is the LOWER half (y 0..306): face top sits at y = TENT_H.
  // Flipped face is the UPPER half; see the mapping worked out in the header.
  const textAt = (text: string, font: PDFFont, size: number, l: number, t: number, color: ReturnType<typeof rgb>, opacity: number) => {
    if (!flip) page.drawText(text, { x: bx + l, y: TENT_H - t, size, font, color, opacity });
    else page.drawText(text, { x: bx + TENT_W - l, y: TENT_H + t, size, font, color, opacity, rotate: degrees(180) });
  };
  const spacedAt = (line: Line, l: number, t: number) => {
    if (!line.spacing) return textAt(line.text, line.font, line.size, l, t, line.color, line.opacity);
    let x = l;
    for (const ch of [...line.text]) {
      textAt(ch, line.font, line.size, x, t, line.color, line.opacity);
      x += line.font.widthOfTextAtSize(ch, line.size) + line.spacing;
    }
  };

  for (const b of stack) {
    if (b.kind === 'mark') {
      const l = (TENT_W - b.w) / 2;
      const tTop = top + b.mt;
      const tBottom = tTop + b.h;
      if (!flip) page.drawImage(mark, { x: bx + l, y: TENT_H - tBottom, width: b.w, height: b.h, opacity: 0.92 });
      else page.drawImage(mark, { x: bx + TENT_W - l, y: TENT_H + tBottom, width: b.w, height: b.h, opacity: 0.92, rotate: degrees(180) });
      top = tBottom;
    } else if (b.kind === 'rule') {
      const l = (TENT_W - b.w) / 2;
      const tTop = top + b.mt;
      const tBottom = tTop + b.h;
      const x = flip ? bx + TENT_W - l - b.w : bx + l;
      const y = flip ? TENT_H + tTop : TENT_H - tBottom;
      page.drawRectangle({ x, y, width: b.w, height: b.h, color: BRASS, opacity: 0.75 });
      top = tBottom + b.mb;
    } else {
      const { asc, desc } = metrics(b.font);
      const lineTop = top + b.mt;
      const baseline = lineTop + (b.lh - (asc + desc) * b.size) / 2 + asc * b.size;
      const w = textWidth(b.font, b.text, b.size, b.spacing);
      spacedAt(b, (TENT_W - w) / 2, baseline);
      top = lineTop + b.lh;
    }
  }

  // Foot — pinned 0.30in above the bottom edge, like the CSS `bottom: 0.30in`.
  const foot: Line = { kind: 'text', text: 'NARWHAL THAI TABLE', font: fonts.sansBold, size: 6.8, lh: 6.8 * 1.2, spacing: 0.34 * 6.8, color: BRASS_DEEP, opacity: 0.75, mt: 0 };
  const fm = metrics(foot.font);
  const footTop = TENT_H - 0.3 * IN - foot.lh;
  const footBase = footTop + (foot.lh - (fm.asc + fm.desc) * foot.size) / 2 + fm.asc * foot.size;
  spacedAt(foot, (TENT_W - textWidth(foot.font, foot.text, foot.size, foot.spacing)) / 2, footBase);
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

  const [serif, serifItalic, sans, sansBold, thai, markBytes] = await Promise.all([
    loadAsset(FONT_FILES.serif),
    loadAsset(FONT_FILES.serifItalic),
    loadAsset(FONT_FILES.sans),
    loadAsset(FONT_FILES.sansBold),
    loadAsset(FONT_FILES.thai),
    loadAsset(MARK_FILE),
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

  const list = cards.length ? cards : [{ id: 'blank', name: 'Reserved', time: '', party: '', occasion: '', notes: '' }];
  for (let i = 0; i < list.length; i += 2) {
    const page = doc.addPage([SHEET_W, SHEET_H]);
    list.slice(i, i + 2).forEach((card, j) => {
      const stack = buildStack(card, fonts, opts);
      const bx = j * TENT_W;
      drawFace(page, bx, true, stack, mark, fonts);
      drawFace(page, bx, false, stack, mark, fonts);
    });
    drawGuides(page);
  }
  return doc.save();
}

export async function renderCardPdf(card: GuestCard, opts: RenderOptions = {}): Promise<Uint8Array> {
  return renderCardsPdf([card], { title: `Welcome card — ${card.name}`, ...opts });
}
