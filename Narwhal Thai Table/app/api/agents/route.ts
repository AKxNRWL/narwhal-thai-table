import { ownerOk, hasAI } from '@/lib/agents';
import { AGENT_MANIFEST } from '@/lib/agentManifest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Directory of all Narwhal agents (the owner's spec) + what is live right now.
   `status` per agent: 'live' (real Toast numbers) / 'demo-data' (real Claude,
   demo numbers, waiting on Toast) / 'ready' (real Claude) / 'demo' (no AI key). */
export async function GET(req: Request) {
  if (!(await ownerOk(req))) return Response.json({ ok: false }, { status: 401 });
  const ai = hasAI();
  const toastReady = !!process.env.TOAST_CLIENT_ID && !!process.env.TOAST_RESTAURANT_GUID;
  const agents = AGENT_MANIFEST.map((a) => ({
    ...a,
    ai,
    toastReady,
    status: a.toast ? (toastReady ? 'live' : 'demo-data') : ai ? 'ready' : 'demo',
  }));
  return Response.json({ ok: true, ai, toastReady, count: agents.length, agents }, { headers: { 'cache-control': 'no-store' } });
}
