/**
 * Accessibility sweep for narwhalthaihb.com — axe-core (WCAG 2.0/2.1/2.2 A+AA + best-practice)
 * on every guest-facing route, plus the checks axe can't do: keyboard tab order & visible
 * focus, 320 px reflow (no horizontal scroll), 200 %-zoom-equivalent layout, and the
 * WCAG 1.4.12 text-spacing stress test.
 *
 *   node scripts/a11y-sweep.mjs [--base http://localhost:3077] [--out a11y-report] [--quick] [--only /menu,/about]
 *
 * Uses the Chrome already installed on the shop PC (puppeteer-core, no browser download).
 * Output: <out>/report.json + <out>/report.md. Exit code 1 when any serious/critical
 * violation remains, so it can gate a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';

const require = createRequire(import.meta.url);
const axeSource = require('axe-core').source;

const arg = (n, d = '') => { const i = process.argv.indexOf(`--${n}`); return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:3077').replace(/\/$/, '');
const OUT = path.resolve(arg('out', 'a11y-report'));
const QUICK = process.argv.includes('--quick');
const ONLY = arg('only') ? arg('only').split(',').map((s) => s.trim()) : null;
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ALL_PAGES = [
  '/', '/menu', '/menu/og-pad-thai', '/menu/tom-kha', '/menu/crying-tiger', '/menu/bok-choy', '/lunch', '/about',
  '/contact', '/contact/reservation', '/contact/message', '/contact/catering', '/order', '/press', '/socialmedia',
  '/points', '/play', '/thai-food-orange-county', '/thai-food-fountain-valley', '/thai-food-westminster',
  '/vi/nha-hang-thai-little-saigon',
  '/th', '/th/menu', '/th/contact/reservation', '/ja/menu/og-pad-thai', '/es', '/zh/contact', '/ko/about', '/vi/lunch', '/zh-tw/menu', '/es/contact/catering',
];
const QUICK_PAGES = ['/', '/menu', '/menu/og-pad-thai', '/contact/reservation', '/socialmedia', '/th'];
const PAGES = ONLY || (QUICK ? QUICK_PAGES : ALL_PAGES);

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice'];

async function settle(page, ms = 1800) {
  await new Promise((r) => setTimeout(r, ms));
  // trigger lazy content
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 600));
}

async function runAxe(page, label) {
  await page.evaluate(axeSource);
  const r = await page.evaluate(async (tags) => {
    const res = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete'] });
    const pick = (v) => ({
      id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, n: v.nodes.length,
      nodes: v.nodes.slice(0, 5).map((nd) => ({ target: nd.target.join(' '), html: (nd.html || '').slice(0, 200), msg: (nd.failureSummary || '').slice(0, 300) })),
    });
    return { violations: res.violations.map(pick), incomplete: res.incomplete.filter((v) => v.id !== 'frame-tested').map(pick) };
  }, TAGS);
  return { label, ...r };
}

async function keyboardPass(page) {
  // Tab through the page, note each stop: what it is, whether it is visible, whether focus is visible.
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
  const stops = [];
  let lastKey = '';
  let repeats = 0;
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { body: true };
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.getAttribute('alt') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const focusRing = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
      // also accept a focus-visible rule on a child/parent (e.g. ring on wrapper)
      const parentRing = (() => { const p = el.parentElement; if (!p) return false; const pc = getComputedStyle(p); return (pc.outlineStyle !== 'none' && parseFloat(pc.outlineWidth) > 0); })();
      const visible = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0';
      const inViewport = r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
      const hidden = !!el.closest('[aria-hidden="true"], [inert]');
      const key = el.tagName + '|' + (el.id || '') + '|' + name;
      const devOnly = el.tagName.toLowerCase() === 'nextjs-portal';
      const multiStop = el.tagName === 'IFRAME' || (el.tagName === 'INPUT' && ['date', 'time', 'datetime-local'].includes(el.type));
      return { devOnly, multiStop, tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', name, href: el.getAttribute('href') || '', focusRing: focusRing || parentRing, visible, inViewport, insideHidden: hidden, size: [Math.round(r.width), Math.round(r.height)], key };
    });
    if (s.body) { stops.push({ body: true, i }); if (i > 5) break; continue; }
    if (s.devOnly) continue;
    if (s.key === lastKey) { repeats++; if (repeats >= (s.multiStop ? 8 : 3)) { stops.push({ trap: true, at: s.key }); break; } } else repeats = 0;
    lastKey = s.key;
    stops.push(s);
    if (i > 0 && stops.length > 2 && stops[0].key === s.key) break; // wrapped around
  }
  const problems = [];
  for (const s of stops) {
    if (s.trap) problems.push(`keyboard trap at ${s.at}`);
    if (s.body || s.trap) continue;
    if (!s.visible) problems.push(`focus lands on invisible element: <${s.tag}> ${s.name || s.href}`);
    if (s.insideHidden) problems.push(`focus inside aria-hidden/inert: <${s.tag}> ${s.name || s.href}`);
    if (!s.focusRing && s.visible && s.tag !== 'iframe') problems.push(`no visible focus indicator: <${s.tag}> ${s.name || s.href}`);
    if (s.visible && (s.size[0] < 24 || s.size[1] < 24) && s.tag !== 'a') problems.push(`target smaller than 24x24: <${s.tag}> ${s.name} ${s.size.join('x')}`);
  }
  return { stops: stops.length, problems: [...new Set(problems)] };
}

async function reflowCheck(page, width) {
  await page.setViewport({ width, height: 760, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await settle(page, 1200);
  return page.evaluate((w) => {
    const de = document.documentElement;
    const over = de.scrollWidth > de.clientWidth + 1;
    const offenders = [];
    if (over) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > w + 2 && r.width > 40 && getComputedStyle(el).position !== 'fixed' && getComputedStyle(el).overflowX !== 'hidden') {
          offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${(el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0, 2).join('.') : '')} right=${Math.round(r.right)}`);
          if (offenders.length >= 6) break;
        }
      }
    }
    return { width: w, scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, horizontalScroll: over, offenders };
  }, width);
}

async function textSpacingCheck(page) {
  // WCAG 1.4.12: with these overrides nothing may be clipped or overlap
  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await settle(page, 1000);
  return page.evaluate(() => {
    const st = document.createElement('style');
    st.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
    document.head.appendChild(st);
    const clipped = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,p,a,button,li,span,label')) {
      const cs = getComputedStyle(el);
      if ((cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.textOverflow === 'ellipsis') && el.scrollHeight > el.clientHeight + 4 && el.clientHeight > 0 && cs.whiteSpace !== 'nowrap') {
        clipped.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 40)}"`);
        if (clipped.length >= 8) break;
      }
    }
    st.remove();
    return { clipped };
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--lang=en-US'] });
  const report = { base: BASE, at: new Date().toISOString(), pages: [] };
  for (const route of PAGES) {
    const url = BASE + route;
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
    const entry = { route, url };
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
      entry.status = resp ? resp.status() : null;
      entry.title = await page.title();
      await settle(page);
      entry.desktop = await runAxe(page, 'desktop');
      entry.keyboard = await keyboardPass(page);
      entry.textSpacing = await textSpacingCheck(page);
      entry.reflow320 = await reflowCheck(page, 320);
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      await page.reload({ waitUntil: 'load', timeout: 60000 }).catch(() => {});
      await settle(page, 1200);
      entry.mobile = await runAxe(page, 'mobile-390');
      entry.zoom200 = await reflowCheck(page, 683);
    } catch (e) {
      entry.error = String(e && e.message || e);
    }
    const nV = (r) => (r ? r.violations.reduce((a, v) => a + v.n, 0) : '-');
    console.log(`${route.padEnd(36)} ${entry.status || 'ERR'}  desktop:${nV(entry.desktop)} mobile:${nV(entry.mobile)} kb:${entry.keyboard ? entry.keyboard.problems.length : '-'} reflow320:${entry.reflow320 ? (entry.reflow320.horizontalScroll ? 'SCROLL' : 'ok') : '-'} zoom200:${entry.zoom200 ? (entry.zoom200.horizontalScroll ? 'SCROLL' : 'ok') : '-'} spacing:${entry.textSpacing ? entry.textSpacing.clipped.length : '-'}${entry.error ? '  ERROR ' + entry.error.slice(0, 80) : ''}`);
    report.pages.push(entry);
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));

  // markdown summary grouped by rule
  const byRule = new Map();
  for (const p of report.pages) for (const scope of ['desktop', 'mobile']) {
    const r = p[scope]; if (!r) continue;
    for (const v of r.violations) {
      const k = v.id; const cur = byRule.get(k) || { id: k, impact: v.impact, help: v.help, helpUrl: v.helpUrl, pages: new Map() };
      const pk = `${p.route} (${scope})`;
      cur.pages.set(pk, v);
      byRule.set(k, cur);
    }
  }
  const lines = [`# a11y sweep — ${report.at} — ${BASE}`, '', `Pages: ${report.pages.length}`, ''];
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  for (const rule of [...byRule.values()].sort((a, b) => (order[a.impact] ?? 9) - (order[b.impact] ?? 9))) {
    lines.push(`## ${rule.id} — ${rule.impact} — ${rule.help}`, `<${rule.helpUrl}>`, '');
    for (const [pk, v] of rule.pages) {
      lines.push(`- ${pk}: ${v.n} node(s)`);
      for (const nd of v.nodes.slice(0, 3)) lines.push(`    - \`${nd.target}\` — ${nd.html.replace(/\n/g, ' ').slice(0, 140)}`);
    }
    lines.push('');
  }
  lines.push('## Keyboard / reflow / spacing', '');
  for (const p of report.pages) {
    const kb = p.keyboard ? p.keyboard.problems : ['(not run)'];
    const rf = p.reflow320 && p.reflow320.horizontalScroll ? `HORIZONTAL SCROLL at 320 (${p.reflow320.scrollWidth}px): ${p.reflow320.offenders.join('; ')}` : '';
    const z = p.zoom200 && p.zoom200.horizontalScroll ? `HORIZONTAL SCROLL at 200% zoom (${p.zoom200.scrollWidth}px): ${p.zoom200.offenders.join('; ')}` : '';
    const ts = p.textSpacing && p.textSpacing.clipped.length ? `text-spacing clipped: ${p.textSpacing.clipped.join('; ')}` : '';
    const items = [...kb, rf, z, ts].filter(Boolean);
    lines.push(`### ${p.route} — ${p.keyboard ? p.keyboard.stops + ' tab stops' : ''}${p.error ? ' — ERROR ' + p.error : ''}`);
    if (!items.length) lines.push('- clean');
    for (const it of items) lines.push(`- ${it}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(OUT, 'report.md'), lines.join('\n'));
  const bad = report.pages.some((p) => ['desktop', 'mobile'].some((s) => p[s] && p[s].violations.some((v) => v.impact === 'critical' || v.impact === 'serious')));
  console.log(`\nwrote ${path.join(OUT, 'report.md')} — ${bad ? 'SERIOUS/CRITICAL violations remain' : 'no serious/critical axe violations'}`);
  process.exit(bad ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
