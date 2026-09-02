import { requireOwner } from '@/lib/session';
import { jsonCors } from '@/lib/cors';
import { readPromo, writePromo, sanitizePromo, promoStatus } from '@/lib/promo';

export { OPTIONS } from '@/lib/cors';

/**
 * Owner: read / save the promo pop-up (the "ป้ายโปรโมชั่น" panel in /stats).
 *
 *   GET             → { ok, promo, status }
 *   POST <Promo>    → validates, stores, returns { ok, promo, status }
 *
 * POST rather than PUT so the existing CORS allow-list (GET, POST) also lets
 * the Narwhal HQ app call this with its Bearer token later. Guarded exactly
 * like /api/owner/reservations: cookie session (/stats) or HQ_GAME_TOKEN.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };

export async function GET(req: Request) {
  const auth = await requireOwner(req);
  if (!auth) return jsonCors(req, { ok: false, error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  const promo = await readPromo(auth.tenantId);
  return jsonCors(req, { ok: true, promo, status: promoStatus(promo) }, { headers: NO_STORE });
}

export async function POST(req: Request) {
  const auth = await requireOwner(req);
  if (!auth) return jsonCors(req, { ok: false, error: 'unauthorized' }, { status: 401, headers: NO_STORE });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonCors(req, { ok: false, error: 'bad_json' }, { status: 400, headers: NO_STORE });
  }

  const result = sanitizePromo(body);
  if ('error' in result) return jsonCors(req, { ok: false, error: result.error }, { status: 400, headers: NO_STORE });

  try {
    await writePromo(auth.tenantId, result.promo);
  } catch (e) {
    console.warn('[owner/promo] write failed', e);
    return jsonCors(req, { ok: false, error: 'store_failed' }, { status: 502, headers: NO_STORE });
  }
  return jsonCors(req, { ok: true, promo: result.promo, status: promoStatus(result.promo) }, { headers: NO_STORE });
}
