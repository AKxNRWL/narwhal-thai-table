import { readPromoImage } from '@/lib/promo';
import { TENANT_NARWHAL_ID } from '@/lib/tenants';

/**
 * Public: one photo the owner uploaded for the promo card, by id.
 * The id is part of the path (not a query string) so the edge cache keys each
 * upload separately — Netlify-Vary on Next routes ignores query strings — and
 * this response can then be cached forever.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMMUTABLE = 'public, max-age=31536000, immutable';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await readPromoImage(TENANT_NARWHAL_ID, id);
  if (!img) return new Response('Not found', { status: 404, headers: { 'cache-control': 'no-store' } });
  return new Response(img.data, {
    headers: {
      'content-type': img.contentType,
      'content-length': String(img.data.byteLength),
      'cache-control': IMMUTABLE,
      'netlify-cdn-cache-control': IMMUTABLE,
    },
  });
}
