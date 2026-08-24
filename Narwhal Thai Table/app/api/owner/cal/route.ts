import { requireSession } from '@/lib/session';
import { calculatorHtml } from '@/lib/calculatorHtml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Serves the owner profit / Owner-Draw calculator as a full HTML document,
   but ONLY to a logged-in owner (same nwh_owner signed-cookie session as
   /stats). It is rendered inside an iframe by app/cal/page.tsx. A direct hit
   without a valid session returns 401 — so the page is genuinely gated, not
   just hidden behind a URL. */
export async function GET(req: Request) {
  const sess = await requireSession(req);
  if (!sess) return new Response('Unauthorized', { status: 401 });
  return new Response(calculatorHtml, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-frame-options': 'SAMEORIGIN',
    },
  });
}
