import { CARD_THANKS, type GuestCard } from './guestCards';
import { letterFileOf, type CardArt } from './guestCardArt';
import { backdropFile, castFile, type CastLayout } from './guestCardCast';
import { cardDesign, LETTER, type NameFit } from './guestCardPdf';

/**
 * The card as a stand-alone web page — what the HQ app opens the moment a
 * reservation is confirmed. The SAME Letter card as the PDF (lib/guestCardPdf
 * LETTER): one card per Letter sheet, PORTRAIT, folded once across the middle
 * into an 8.5 × 5.5 in tent, both faces (the upper one upside down). Plus a
 * small toolbar that only shows on screen: print, PDF, Drive. With
 * `autoPrint` the browser's print dialog opens by itself once the fonts and
 * the picture are in, so on the shop iPad it is confirm → pick the Epson →
 * done.
 *
 * Portrait on purpose (owner, 27 Sep 2026: "ออกมาเล็ก ไม่ใช่ size letter"):
 * phones print web pages onto portrait Letter whatever @page asks for, so the
 * old landscape sheet came out shrunk to fit. A portrait page prints at full
 * size everywhere. The name's size and line breaks come in precomputed
 * (`nameFit`, from letterNameLayout) so they match the PDF exactly.
 *
 * Full bleed (v5, "ทำให้ปริ้นเต็ม … Borderless"): the picture runs to the
 * paper's edges like the PDF's. A browser/AirPrint print has no Borderless
 * switch, so from here the printer keeps its ~3 mm margin (a thin white edge
 * round the sheet); edge-to-edge comes from the PDF through the Epson app —
 * the hint on the page says so.
 *
 * Self-contained on purpose: no React, no site chrome, fonts from
 * /public/fonts so the print output matches the PDF glyph for glyph.
 */

const NAVY = '#0B1F33';
const NAVY_SOFT = '#152F4A';
const BRASS = '#C8A24E';
const BRASSL = '#E3C581';
const BRASS_DEEP = '#9C7A33';
const OFF = '#F5F0E6';
const DNA_NAVY = '#09253B'; // the navy edition's own ground (sampled from the files)
const DNA_GOLD = '#D4B26A';
const CREAM = '#F7F0E1';
const ART_CREAM = '#F6EEDE'; // the cream edition's own ground

/* Letter geometry, inches (LETTER is in points) — the picture fills each face edge to edge */
const IN = 72;
const SHEET_W = LETTER.sheetW / IN; // 8.5
const SHEET_H = LETTER.sheetH / IN; // 11
const FACE_H = LETTER.faceH / IN; // 5.5
const SIDE = (LETTER.faceW - LETTER.textW) / 2 / IN; // 0.85
const TEXT_BOTTOM = LETTER.textBottom / IN; // 0.71 — above the paper edge
const FOOT_BOTTOM = LETTER.footBottom / IN; // 0.45
const TICK = LETTER.tick / IN; // 0.3
const K = LETTER.k;
const pt = (n: number) => `${+(n * K).toFixed(2)}pt`;
const inch = (n: number) => `${+(n * K).toFixed(4)}in`;

function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export type CardPageOptions = {
  card: GuestCard;
  /** Size + line breaks of the name — letterNameLayout(card) from guestCardPdf. */
  nameFit: NameFit & { thai?: boolean };
  /** Shown in the toolbar, e.g. "Sat, Sep 27 · 7:00 PM". */
  when?: string;
  pdfUrl: string;
  driveUrl?: string;
  autoPrint?: boolean;
  thanks?: string;
  details?: boolean;
  /** A 1-based index into CARD_ART shows that finished scene; anything else composes the party-size card (default). */
  art?: number | string | null;
  /** Backdrop override for the composed card (BACKDROPS id). */
  backdrop?: string | null;
  /** Force the v1 white card. */
  noArt?: boolean;
};

/** The composed (party-size) face: backdrop to the edges, the cast placed in % of the face, then the name. */
function castInner(textBlock: string, lay: CastLayout): string {
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
  const cast = lay.cast
    .map(
      (p) =>
        `<img class="cast${p.mirror ? ' mirror' : ''}${p.host ? ' host' : ''}" src="/${esc(castFile(p.id))}" alt="" style="left:${pct(p.l)};top:${pct(p.t)};width:${pct(p.w)};height:${pct(p.h)}">`,
    )
    .join('');
  return `
        <div class="panel cream composed">
          <img class="art" src="/${esc(backdropFile(lay.backdrop.id, 'letter'))}" alt="">
          ${cast}
          <div class="text">${textBlock}
          </div>
          <div class="foot">Narwhal Thai Table</div>
        </div>`;
}

/** The inside of one face — shared by both faces of the tent. */
function faceInner(c: GuestCard, o: CardPageOptions, art: CardArt | null, cast: CastLayout | null): string {
  const thanks = (o.thanks ?? CARD_THANKS).trim();
  const meta = o.details === false ? '' : [c.time, c.party].filter(Boolean).join('  ·  ');
  const name = o.nameFit.lines.map(esc).join('<br>');
  const textBlock = `
        <div class="kicker">Reserved for</div>
        <div class="name${o.nameFit.thai ? ' thai' : ''}" style="font-size:${o.nameFit.size}pt">${name}</div>
        ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
        ${c.occasion.trim() ? `<div class="occasion">${esc(c.occasion)}</div>` : ''}
        ${thanks ? `<div class="thanks">${esc(thanks)}</div>` : ''}`;
  if (cast) return castInner(textBlock, cast);
  if (!art) {
    return `
        <img class="mark" src="/images/logo-mark-print.png" alt="">
        <div class="rule"></div>${textBlock}
        <div class="foot">Narwhal Thai Table</div>`;
  }
  // The letter/ cut carries its own scrim; if it is ever missing, fall back to the small cut and draw one.
  const small = '/' + art.file;
  return `
        <div class="panel ${art.tone}">
          <img class="art" src="/${esc(letterFileOf(art))}" alt="" onerror="this.onerror=null;this.src='${esc(small)}';this.parentNode.classList.add('unbaked')">
          <div class="scrim"></div>
          <div class="text">${textBlock}
          </div>
          <div class="foot">Narwhal Thai Table</div>
        </div>`;
}

export function cardPageHtml(o: CardPageOptions): string {
  const c = o.card;
  const design = cardDesign(c, o.art, { noArt: o.noArt, backdrop: o.backdrop, layout: 'letter' });
  const art = design.kind === 'scene' ? design.art : null;
  const cast = design.kind === 'cast' ? design.layout : null;
  const tone = cast ? 'cream' : art ? art.tone : 'classic';
  const inner = faceInner(c, o, art, cast);
  const face = (back: boolean) => `<div class="face ${back ? 'back' : 'front'} ${tone === 'classic' ? 'classic' : 'has-art ' + tone}">${inner}</div>`;
  const title = cast ? `${cast.backdrop.title} · ${cast.cast.map((p) => p.title).join(', ')}` : art ? art.title : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Welcome card — ${esc(c.name)}</title>
<style>
@font-face{font-family:'Fraunces';font-weight:500;font-style:normal;src:url(/fonts/Fraunces-Medium.ttf) format('truetype');font-display:block}
@font-face{font-family:'Fraunces';font-weight:500;font-style:italic;src:url(/fonts/Fraunces-MediumItalic.ttf) format('truetype');font-display:block}
@font-face{font-family:'Inter';font-weight:400;src:url(/fonts/Inter-Regular.ttf) format('truetype');font-display:block}
@font-face{font-family:'Inter';font-weight:600;src:url(/fonts/Inter-SemiBold.ttf) format('truetype');font-display:block}
@font-face{font-family:'Noto Sans Thai';font-weight:500;src:url(/fonts/NotoSansThai-Medium.ttf) format('truetype');font-display:block}

:root{color-scheme:dark}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:${NAVY};color:${OFF};font-family:Inter,'Noto Sans Thai',system-ui,sans-serif;-webkit-font-smoothing:antialiased}

.bar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 14px;background:rgba(11,31,51,.92);backdrop-filter:blur(8px);border-bottom:1px solid rgba(200,162,78,.2)}
.bar .who{flex:1 1 200px;min-width:0}
.bar .who b{display:block;font-family:Fraunces,Georgia,serif;font-weight:500;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar .who span{display:block;font-size:12.5px;opacity:.65;margin-top:2px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:999px;border:1px solid rgba(200,162,78,.35);background:rgba(255,255,255,.06);color:${OFF};font:600 14px Inter,system-ui,sans-serif;text-decoration:none;cursor:pointer;white-space:nowrap}
.btn.gold{background:${BRASS};border-color:${BRASS};color:${NAVY}}
.hint{padding:10px 14px 0;font-size:12.5px;line-height:1.75;opacity:.78}
.hint b{color:${BRASSL};font-weight:600}

.wrap{padding:14px;overflow:auto}
.scale{transform-origin:top left}
.sheet{position:relative;width:${SHEET_W}in;height:${SHEET_H}in;background:#fff;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,.45);border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.sheet.navy{background:${DNA_NAVY}}
.sheet.cream{background:${ART_CREAM}}
.face{position:absolute;left:0;width:${SHEET_W}in;height:${FACE_H}in;color:${NAVY};background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.face.front{top:${FACE_H}in}
.face.back{top:0;transform:rotate(180deg)}
.face.classic{padding:${inch(0.34)} ${inch(0.45)} ${inch(0.56)};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}

/* type — the PDF's sizes (LETTER.k × the small tent's) */
.kicker{font-family:Inter,sans-serif;font-size:${pt(7.5)};line-height:1.2;font-weight:600;letter-spacing:.30em;text-transform:uppercase;color:${BRASS_DEEP}}
.name{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-weight:500;line-height:1.08;color:${NAVY};margin-top:${inch(0.09)};white-space:nowrap}
.name.thai{font-family:'Noto Sans Thai',Fraunces,sans-serif}
.meta{font-family:Inter,'Noto Sans Thai',sans-serif;font-size:${pt(9.5)};line-height:1.2;letter-spacing:.09em;white-space:pre;color:${NAVY_SOFT};opacity:.78;margin-top:${inch(0.11)}}
.occasion{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-style:italic;font-size:${pt(12)};line-height:1.25;color:${BRASS_DEEP};margin-top:${inch(0.1)}}
.thanks{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-style:italic;font-size:${pt(10.5)};line-height:1.3;color:${NAVY_SOFT};opacity:.85;margin-top:${inch(0.14)}}
.foot{position:absolute;left:0;right:0;bottom:${FOOT_BOTTOM.toFixed(4)}in;text-align:center;font-family:Inter,sans-serif;font-size:${pt(6.8)};line-height:1.2;font-weight:600;letter-spacing:.34em;text-transform:uppercase;color:${BRASS_DEEP};opacity:.75}

/* v1 pieces */
.mark{height:${inch(0.36)};width:auto;opacity:.92}
.rule{width:${inch(1.35)};height:1px;background:${BRASS};opacity:.75;margin:${inch(0.19)} 0 ${inch(0.12)}}

/* v2 — full-face art; v5 — to the paper's edges */
.panel{position:absolute;inset:0;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.panel.navy{background:${DNA_NAVY}}
.panel.cream{background:${ART_CREAM}}
.art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.cast{position:absolute;display:block;object-fit:contain}
.cast.mirror{transform:scaleX(-1)}
.scrim{display:none;position:absolute;left:0;right:0;bottom:0;height:60%;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.panel.unbaked .scrim{display:block}
.panel.navy .scrim{background:linear-gradient(to top,rgba(9,37,59,.92) 0%,rgba(9,37,59,.7) 35%,rgba(9,37,59,0) 100%)}
.panel.cream .scrim{background:linear-gradient(to top,rgba(246,238,222,.92) 0%,rgba(246,238,222,.7) 35%,rgba(246,238,222,0) 100%)}
.text{position:absolute;left:${SIDE.toFixed(4)}in;right:${SIDE.toFixed(4)}in;bottom:${TEXT_BOTTOM.toFixed(4)}in;text-align:center}
.panel.navy .kicker{color:${DNA_GOLD}}
.panel.navy .name{color:${CREAM}}
.panel.navy .meta{color:${CREAM};opacity:.82}
.panel.navy .occasion{color:${DNA_GOLD}}
.panel.navy .thanks{color:${CREAM};opacity:.88}
.panel.navy .foot{color:${DNA_GOLD};opacity:.85}
.panel.cream .foot{opacity:.8}

/* fold: where the two pictures meet — a short tick in from each side edge, nothing across the art */
.tick{position:absolute;top:${FACE_H}in;width:${TICK}in;height:0;border-top:0.75pt solid rgba(11,31,51,.45)}
.sheet.navy .tick{border-top-color:rgba(247,240,225,.55)}
.tick.l{left:0}.tick.r{right:0}

@media print{
  @page{size:${SHEET_W}in ${SHEET_H}in;margin:0}
  html,body{background:#fff!important}
  .bar,.hint{display:none!important}
  .wrap{padding:0;overflow:visible}
  .scale{transform:none!important;width:auto!important;height:auto!important}
  .sheet{box-shadow:none;border-radius:0;page-break-inside:avoid;break-inside:avoid}
}
</style>
</head>
<body>
<div class="bar">
  <div class="who"><b>${esc(c.name)}</b><span>${esc(o.when || [c.time, c.party].filter(Boolean).join(' · '))}${art ? ' · 🎨 ' + esc(art.title) : ''}</span></div>
  <button class="btn gold" id="print" type="button">🖨 พิมพ์การ์ด</button>
  <a class="btn" href="${esc(o.pdfUrl)}" target="_blank" rel="noopener">📄 PDF พร้อมพิมพ์</a>
  ${o.driveUrl ? `<a class="btn" href="${esc(o.driveUrl)}" target="_blank" rel="noopener">☁️ Drive</a>` : ''}
</div>
<div class="hint">การ์ด <b>1 ใบเต็มแผ่น Letter แนวตั้ง · ภาพเต็มถึงขอบ</b> · กระดาษ<b>การ์ด 65–80 lb cover (176–216 g/m²)</b> ใส่<b>ช่องป้อนด้านหลัง</b> หงายด้านพิมพ์ขึ้น · <b>ไร้ขอบ (Borderless)</b>: กด <b>📄 PDF</b> → เปิดด้วยแอป <b>Epson Smart Panel</b> → Letter · <b>Borderless เปิด</b> · Paper Type <b>Premium Presentation Paper Matte</b> (ถ้าเลือก Card Stock ปุ่ม Borderless มักกดไม่ได้) — ปุ่ม 🖨 หน้านี้/AirPrint ก็พิมพ์ได้ แต่จะเหลือขอบขาว ~3 มม. รอบแผ่น · พิมพ์แล้ว<b>พับครึ่ง</b>ตรงขีดสั้นที่ขอบซ้าย-ขวา (กรีดตามไม้บรรทัดก่อน พับจะคม) ตั้งเป็นเต็นท์ 8.5 × 5.5 นิ้ว</div>
<div class="wrap"><div class="scale" id="scale"><div class="sheet ${tone}">
  ${face(true)}${face(false)}
  <div class="tick l"></div><div class="tick r"></div>
</div></div></div>
<script>
(function(){
  var wrap=document.querySelector('.wrap'),sc=document.getElementById('scale');
  function fit(){var w=wrap.clientWidth-28,s=Math.min(1,Math.max(.2,w/(${SHEET_W}*96)));sc.style.transform='scale('+s+')';sc.style.height=(${SHEET_H}*96*s)+'px';sc.style.width=(${SHEET_W}*96*s)+'px';}
  fit();addEventListener('resize',fit);
  var fonts=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  var imgs=Array.prototype.map.call(document.querySelectorAll('.face img'),function(im){return (im.complete&&im.naturalWidth)?Promise.resolve():new Promise(function(r){im.addEventListener('load',function(){r();});im.addEventListener('error',function(){setTimeout(r,800);});});});
  var ready=Promise.all([fonts].concat(imgs));
  function go(){ready.then(function(){setTimeout(function(){window.print();},200);});}
  document.getElementById('print').addEventListener('click',go);
  ${o.autoPrint ? 'go();' : ''}
})();
</script>
</body>
</html>`;
}
