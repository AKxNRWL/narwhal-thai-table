import { requireOwner } from '@/lib/session';
import { jsonCors } from '@/lib/cors';
import { writePromoImage, newImageId, imageUrl, LIMITS } from '@/lib/promo';

export { OPTIONS } from '@/lib/cors';

/**
 * Owner: upload one promo photo.
 *   POST { dataUrl: "data:image/jpeg;base64,…" } → { ok, url, id }
 * The browser downsizes the photo to ≤1400px before sending (see
 * components/PromoEditor.tsx), so the body stays well under Netlify's limit.
 * Each upload gets its own id/URL; uploads the saved promo no longer uses are
 * deleted on the next save (lib/promo.ts cleanupPromoImages).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'cache-control': 'no-store' };
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export async function POST(req: Request) {
  const auth = await requireOwner(req);
  if (!auth) return jsonCors(req, { ok: false, error: 'unauthorized' }, { status: 401, headers: NO_STORE });

  let body: { dataUrl?: unknown };
  try {
    body = (await req.json()) as { dataUrl?: unknown };
  } catch {
    return jsonCors(req, { ok: false, error: 'bad_json' }, { status: 400, headers: NO_STORE });
  }
  const m = typeof body.dataUrl === 'string' ? DATA_URL.exec(body.dataUrl) : null;
  if (!m) return jsonCors(req, { ok: false, error: 'bad_image' }, { status: 400, headers: NO_STORE });

  const bytes = Buffer.from(m[2], 'base64');
  if (bytes.length < 64) return jsonCors(req, { ok: false, error: 'bad_image' }, { status: 400, headers: NO_STORE });
  if (bytes.length > LIMITS.imageBytes) return jsonCors(req, { ok: false, error: 'too_large' }, { status: 413, headers: NO_STORE });

  const id = newImageId();
  try {
    await writePromoImage(auth.tenantId, id, bytes, m[1]);
  } catch (e) {
    console.warn('[owner/promo/image] write failed', e);
    return jsonCors(req, { ok: false, error: 'store_failed' }, { status: 502, headers: NO_STORE });
  }
  return jsonCors(req, { ok: true, id, url: imageUrl(id), bytes: bytes.length }, { headers: NO_STORE });
}
