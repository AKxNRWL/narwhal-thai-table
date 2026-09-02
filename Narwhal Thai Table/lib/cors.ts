/**
 * CORS for the owner API when it is called from the Narwhal HQ app
 * (https://narwhal-hq.vercel.app) instead of the same-origin /stats page.
 * Only the app origin (and localhost for dev) is allowed; everything else
 * gets no CORS headers and the browser blocks it.
 */
const ALLOWED = new Set(['https://narwhal-hq.vercel.app']);
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  if (!origin || !(ALLOWED.has(origin) || LOCAL.test(origin))) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-max-age': '600',
    vary: 'origin',
  };
}

/** Preflight handler — re-export from a route: `export { OPTIONS } from '@/lib/cors'` */
export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/** JSON response with CORS headers merged in. */
export function jsonCors(req: Request, body: unknown, init: ResponseInit = {}): Response {
  const h = new Headers(init.headers);
  for (const [k, v] of Object.entries(corsHeaders(req))) h.set(k, v);
  return Response.json(body, { ...init, headers: h });
}
