import { CARD_THANKS, type GuestCard } from './guestCards';
import { nameSize } from './guestCardPdf';

/**
 * The card as a stand-alone web page — what the HQ app opens the moment a
 * reservation is confirmed. Same tent as /stats/cards (one blank, left half
 * of Letter landscape, both faces) plus a small toolbar that only shows on
 * screen: print, PDF, Drive. With `autoPrint` the browser's print dialog
 * opens by itself once the fonts are in, so on the shop iPad it is
 * confirm → pick the Epson → done.
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

const SHEET_W = 11;
const SHEET_H = 8.5;
const TENT_W = 5.5;
const TENT_H = 4.25;

function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export type CardPageOptions = {
  card: GuestCard;
  /** Shown in the toolbar, e.g. "Sat, Sep 27 · 7:00 PM". */
  when?: string;
  pdfUrl: string;
  driveUrl?: string;
  autoPrint?: boolean;
  thanks?: string;
  details?: boolean;
};

export function cardPageHtml(o: CardPageOptions): string {
  const c = o.card;
  const thanks = (o.thanks ?? CARD_THANKS).trim();
  const meta = o.details === false ? '' : [c.time, c.party].filter(Boolean).join('  ·  ');
  const face = (back: boolean) => `
      <div class="face ${back ? 'back' : 'front'}">
        <img class="mark" src="/images/logo-mark-print.png" alt="">
        <div class="rule"></div>
        <div class="kicker">Reserved for</div>
        <div class="name" style="font-size:${nameSize(c.name)}pt">${esc(c.name)}</div>
        ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
        ${c.occasion.trim() ? `<div class="occasion">${esc(c.occasion)}</div>` : ''}
        ${thanks ? `<div class="thanks">${esc(thanks)}</div>` : ''}
        <div class="foot">Narwhal Thai Table</div>
      </div>`;

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
.hint{padding:10px 14px 0;font-size:12.5px;line-height:1.7;opacity:.7}
.hint b{color:${BRASSL};font-weight:600}

.wrap{padding:14px;overflow:auto}
.scale{transform-origin:top left}
.sheet{position:relative;width:${SHEET_W}in;height:${SHEET_H}in;background:#fff;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,.45);border-radius:2px}
.blank{position:absolute;top:0;left:0;width:${TENT_W}in;height:${SHEET_H}in}
.face{position:absolute;left:0;width:${TENT_W}in;height:${TENT_H}in;padding:0.34in 0.45in 0.56in;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${NAVY};background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.face.front{top:${TENT_H}in}
.face.back{top:0;transform:rotate(180deg)}
.mark{height:0.36in;width:auto;opacity:.92}
.rule{width:1.35in;height:1px;background:${BRASS};opacity:.75;margin:0.19in 0 0.12in}
.kicker{font-family:Inter,sans-serif;font-size:7.5pt;font-weight:600;letter-spacing:.30em;text-transform:uppercase;color:${BRASS_DEEP}}
.name{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-weight:500;line-height:1.08;color:${NAVY};margin-top:0.09in;max-width:100%;overflow-wrap:break-word}
.meta{font-family:Inter,'Noto Sans Thai',sans-serif;font-size:9.5pt;letter-spacing:.09em;color:${NAVY_SOFT};opacity:.78;margin-top:0.11in}
.occasion{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-style:italic;font-size:12pt;color:${BRASS_DEEP};margin-top:0.10in}
.thanks{font-family:Fraunces,'Noto Sans Thai',Georgia,serif;font-style:italic;font-size:10.5pt;line-height:1.3;color:${NAVY_SOFT};opacity:.85;margin-top:0.14in;max-width:100%}
.foot{position:absolute;left:0;right:0;bottom:0.30in;font-family:Inter,sans-serif;font-size:6.8pt;font-weight:600;letter-spacing:.34em;text-transform:uppercase;color:${BRASS_DEEP};opacity:.75}
.cut{position:absolute;top:0;bottom:0;left:${TENT_W}in;width:0;border-left:1px dashed rgba(11,31,51,.30)}
.fold{position:absolute;left:0;right:0;top:${TENT_H}in;height:0;border-top:1px dotted rgba(11,31,51,.22)}

@media print{
  @page{size:${SHEET_W}in ${SHEET_H}in;margin:0}
  html,body{background:#fff!important}
  .bar,.hint{display:none!important}
  .wrap{padding:0;overflow:visible}
  .scale{transform:none!important}
  .sheet{box-shadow:none;border-radius:0}
}
</style>
</head>
<body>
<div class="bar">
  <div class="who"><b>${esc(c.name)}</b><span>${esc(o.when || [c.time, c.party].filter(Boolean).join(' · '))}</span></div>
  <button class="btn gold" id="print" type="button">🖨 พิมพ์การ์ด</button>
  <a class="btn" href="${esc(o.pdfUrl)}" target="_blank" rel="noopener">⬇ PDF</a>
  ${o.driveUrl ? `<a class="btn" href="${esc(o.driveUrl)}" target="_blank" rel="noopener">☁️ Drive</a>` : ''}
</div>
<div class="hint">เครื่อง <b>Epson ET-16650</b> · กระดาษ <b>Letter</b> · <b>แนวนอน</b> · Scale <b>100%</b> · ปิด Headers and footers — พิมพ์แล้ว<b>ตัด</b>ตามเส้นประกลางแผ่น แล้ว<b>พับ</b>ตามเส้นจุด ตั้งเป็นเต็นท์ 5.5 × 4.25 นิ้ว (ครึ่งขวาว่าง เก็บไว้ใช้ครั้งหน้า)</div>
<div class="wrap"><div class="scale" id="scale"><div class="sheet">
  <div class="blank">${face(true)}${face(false)}</div>
  <div class="fold"></div><div class="cut"></div>
</div></div></div>
<script>
(function(){
  var wrap=document.querySelector('.wrap'),sc=document.getElementById('scale');
  function fit(){var w=wrap.clientWidth-28,s=Math.min(1,Math.max(.25,w/(${SHEET_W}*96)));sc.style.transform='scale('+s+')';sc.style.height=(${SHEET_H}*96*s)+'px';sc.style.width=(${SHEET_W}*96*s)+'px';}
  fit();addEventListener('resize',fit);
  var ready=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  function go(){ready.then(function(){setTimeout(function(){window.print();},150);});}
  document.getElementById('print').addEventListener('click',go);
  ${o.autoPrint ? 'go();' : ''}
})();
</script>
</body>
</html>`;
}
