import { readPromo, isLive, publicPromo } from '@/lib/promo';
import { TENANT_NARWHAL_ID } from '@/lib/tenants';

/**
 * Public: the promo card currently showing on the site, or null.
 * Read by components/PromoCard.tsx once per visitor session. Cached briefly
 * at the edge so a busy lunch hour is one blob read, not thousands — an edit
 * in /stats reaches visitors within about a minute.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE = 'public, max-age=60, stale-while-revalidate=300';

export async function GET() {
  const promo = await readPromo(TENANT_NARWHAL_ID);
  const live = promo && isLive(promo) ? publicPromo(promo) : null;
  return Response.json(
    { promo: live },
    { headers: { 'cache-control': CACHE, 'netlify-cdn-cache-control': CACHE } },
  );
}
