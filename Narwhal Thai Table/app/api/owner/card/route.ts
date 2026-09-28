import { getStore } from '@netlify/blobs';
import { requireOwner } from '@/lib/session';
import { jsonCors } from '@/lib/cors';
import { dataFor, getTenant, TENANT_NARWHAL_ID } from '@/lib/tenants';
import { cardFileName, cardFromSource, type CardSource } from '@/lib/guestCards';
import { letterNameLayout, renderCardPdf } from '@/lib/guestCardPdf';
import { cardPageHtml } from '@/lib/guestCardHtml';
import { cardUrls, verifyCardLink } from '@/lib/cardLink';
import { archiveCard } from '@/lib/cardArchive';
import { prettyDate, prettyTime } from '@/lib/guestMail';

export { OPTIONS } from '@/lib/cors';

/**
 * One reservation's welcome card.
 *
 *   GET  /api/owner/card?id=…&format=html|pdf[&print=1]
 *        Auth: a signed link (exp+sig, see lib/cardLink) — what the HQ app
 *        opens in a new tab — or the owner cookie / Bearer token.
 *        html → the printable page (print=1 opens the print dialog itself)
 *        pdf  → the PDF, inline, named "<date> <time> <name>.pdf"
 *        Both are the LETTER card — one card per Letter sheet, portrait,
 *        fold in half → 8.5 × 5.5 in tent, made for card stock.
 *        (&layout=tent2 on the PDF = the old two-up 5.5 × 4.25 in sheet.)
 *
 *   POST /api/owner/card { id, action: 'link' | 'archive' }
 *        Auth: owner cookie / Bearer token only.
 *        link    → fresh signed URLs { print, view, pdf } + the Drive link if any
 *        archive → (re)upload the PDF to Drive and stamp the record
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Rec = Record<string, unknown>;
const str = (r: Rec, k: string): string => (typeof r[k] === 'string' ? (r[k] as string) : '');

async function loadList(tenantId: string): Promise<{ store: ReturnType<typeof getStore>; key: string; list: Rec[] } | null> {
  const loc = dataFor(tenantId);
  const store = getStore({ name: loc.reservations.store, consistency: 'strong' });
  try {
    const raw = await store.get(loc.reservations.key, { type: 'json' });
    return { store, key: loc.reservations.key, list: Array.isArray(raw) ? (raw as Rec[]) : [] };
  } catch {
    return null;
  }
}

const asSource = (r: Rec): CardSource => ({
  id: str(r, 'id'),
  first_name: str(r, 'first_name'),
  last_name: str(r, 'last_name'),
  party_size: str(r, 'party_size'),
  date: str(r, 'date'),
  time: str(r, 'time'),
  notes: str(r, 'notes'),
  status: str(r, 'status'),
  occasion: str(r, 'occasion'),
});

const driveOf = (r: Rec): { url: string; fileId: string } | null => {
  const c = r.card;
  if (!c || typeof c !== 'object') return null;
  const o = c as Rec;
  return str(o, 'url') ? { url: str(o, 'url'), fileId: str(o, 'fileId') } : null;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get('id') || '').trim();
  const format = url.searchParams.get('format') === 'pdf' ? 'pdf' : 'html';
  const autoPrint = url.searchParams.get('print') === '1';
  const art = url.searchParams.get('art'); // optional: a 1-based CARD_ART index shows that finished scene; default = the composed party-size card
  const backdrop = url.searchParams.get('backdrop'); // optional BACKDROPS id for the composed card
  if (!id) return new Response('missing id', { status: 400 });

  // Signed link first (no cookie, no header — a plain URL that expires), then the usual owner auth.
  let tenantId = '';
  if (verifyCardLink(id, url.searchParams.get('exp'), url.searchParams.get('sig'))) tenantId = TENANT_NARWHAL_ID;
  else {
    const sess = await requireOwner(req);
    if (!sess) return new Response('unauthorized', { status: 401 });
    tenantId = sess.tenantId;
  }
  if (!(await getTenant(tenantId))) return new Response('unauthorized', { status: 401 });

  const data = await loadList(tenantId);
  if (!data) return new Response('store unavailable', { status: 503 });
  const rec = data.list.find((r) => str(r, 'id') === id);
  if (!rec) return new Response('not found', { status: 404 });

  const src = asSource(rec);
  const card = cardFromSource(src);

  if (format === 'pdf') {
    let pdf: Uint8Array;
    try {
      pdf = await renderCardPdf(card, { art, backdrop, layout: url.searchParams.get('layout') === 'tent2' ? 'tent2' : 'letter' });
    } catch (e) {
      return new Response('render failed: ' + (e instanceof Error ? e.message : String(e)), { status: 500 });
    }
    const name = cardFileName(src, card);
    return new Response(Buffer.from(pdf), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex',
      },
    });
  }

  const links = cardUrls(url.origin, id);
  const when = [prettyDate(src.date || ''), src.time ? prettyTime(src.time) : ''].filter(Boolean).join(' · ');
  let nameFit: Awaited<ReturnType<typeof letterNameLayout>>;
  try {
    nameFit = await letterNameLayout(card);
  } catch {
    nameFit = { size: 30, lines: [card.name], thai: false }; // fonts unreachable: still a usable page
  }
  const extra = (art ? '&art=' + encodeURIComponent(art) : '') + (backdrop ? '&backdrop=' + encodeURIComponent(backdrop) : '');
  const html = cardPageHtml({ card, nameFit, when, pdfUrl: links.pdf + extra, driveUrl: driveOf(rec)?.url, autoPrint, art, backdrop });
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' },
  });
}

export async function POST(req: Request) {
  const json = (body: unknown, init: ResponseInit = {}) => jsonCors(req, body, init);
  const sess = await requireOwner(req);
  if (!sess) return json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (!(await getTenant(sess.tenantId))) return json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { id?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return json({ ok: false, error: 'bad json' }, { status: 400 });
  }
  const id = String(body.id || '').trim();
  const action = String(body.action || 'link');
  if (!id) return json({ ok: false, error: 'missing id' }, { status: 400 });

  const data = await loadList(sess.tenantId);
  if (!data) return json({ ok: false, error: 'store unavailable' }, { status: 503 });
  const idx = data.list.findIndex((r) => str(r, 'id') === id);
  if (idx < 0) return json({ ok: false, error: 'not found' }, { status: 404 });
  const rec = data.list[idx];
  const origin = new URL(req.url).origin;

  if (action === 'link') {
    return json({ ok: true, ...cardUrls(origin, id), drive: driveOf(rec)?.url || '' });
  }

  if (action === 'archive') {
    const r = await archiveCard(asSource(rec));
    if (!r.ok) return json({ ok: false, error: r.error, ...cardUrls(origin, id) });
    data.list[idx] = { ...rec, card: r.card };
    try {
      await data.store.setJSON(data.key, data.list);
    } catch {
      return json({ ok: false, error: 'uploaded but could not save link', drive: r.card.url, ...cardUrls(origin, id) }, { status: 503 });
    }
    return json({ ok: true, drive: r.card.url, ...cardUrls(origin, id) });
  }

  return json({ ok: false, error: 'unknown action' }, { status: 400 });
}
