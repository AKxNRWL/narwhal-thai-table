import { readPromoImage } from '@/lib/promo';
import { TENANT_NARWHAL_ID } from '@/lib/tenants';

/**
 * Public: the photo the owner uploaded for the promo card.
 * The card links to it as /api/promo/image?v=<upload id>, so every new upload
 * is a new URL and this response can be cached forever.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMMUTABLE = 'public, max-age=31536000, immutable';

export async function GET() {
  const img = await readPromoImage(TENANT_NARWHAL_ID);
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
