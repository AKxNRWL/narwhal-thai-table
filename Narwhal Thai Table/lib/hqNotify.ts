/**
 * Push a notification into the owner's Narwhal HQ app (Web Push to every
 * device that enabled 🔔 in the app's Inbox room).
 *
 * The HQ app exposes POST /api/push (Vercel); it fans out to the subscriptions
 * stored in the costing Sheet and logs the message in the "แจ้งเตือน Noti" tab
 * so it also shows up in the app's inbox even if a phone missed the push.
 *
 * Env (Netlify):  HQ_PUSH_URL   = https://narwhal-hq.vercel.app/api/push
 *                 HQ_GAME_TOKEN = same value as the app's GAME_TOKEN
 *
 * Best-effort by design: never throws, capped at 3.5s so a slow push can never
 * hold up a reservation or a form submit.
 */
export type HqNotice = { title: string; body: string; url?: string; tag?: string };

export async function notifyHQ(n: HqNotice): Promise<boolean> {
  const endpoint = process.env.HQ_PUSH_URL;
  const token = process.env.HQ_GAME_TOKEN;
  if (!endpoint || !token) return false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, title: n.title, body: n.body, url: n.url || './#inbox', tag: n.tag || '' }),
      signal: ctrl.signal,
    });
    return r.ok;
  } catch (e) {
    console.warn('[hqNotify] not sent:', e instanceof Error ? e.message : e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
