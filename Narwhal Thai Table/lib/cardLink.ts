import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Short-lived signed links to one reservation's card.
 *
 * The HQ app talks to the owner API with a Bearer token, but a card has to be
 * OPENED — in a new tab, in the browser's PDF viewer, in the iOS print sheet —
 * and none of those can carry a header. Putting the long-lived owner token in
 * the URL instead would leak it into history and logs (the exact mistake the
 * cookie sessions fixed). So the API mints a link that is only good for this
 * one card and only for a short while:
 *
 *   /api/owner/card?id=<resv>&exp=<ms>&sig=<hmac(id.exp)>
 *
 * Signed with the same secret the sessions use. Nothing is stored; a link
 * simply stops verifying once `exp` has passed.
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes — long enough to print, short enough to forget

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.STATS_TOKEN;
  if (!s) throw new Error('[cardLink] AUTH_SECRET is not set — refusing to sign card links.');
  return s;
}

function sign(id: string, exp: number): string {
  return createHmac('sha256', secret()).update(`card.${id}.${exp}`).digest('base64url');
}

export type CardLinkParams = { id: string; exp: number; sig: string };

export function signCardLink(id: string, ttlMs: number = TTL_MS): CardLinkParams {
  const exp = Date.now() + ttlMs;
  return { id, exp, sig: sign(id, exp) };
}

export function verifyCardLink(id: string, expRaw: string | null, sigRaw: string | null): boolean {
  const exp = Number(expRaw);
  const sig = (sigRaw || '').trim();
  if (!id || !Number.isFinite(exp) || !sig) return false;
  if (Date.now() > exp) return false;
  let expected: string;
  try {
    expected = sign(id, exp);
  } catch {
    return false;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Absolute URLs for every way of opening the card, ready to hand to the app. */
export function cardUrls(origin: string, id: string): { print: string; pdf: string; view: string } {
  const p = signCardLink(id);
  const base = `${origin}/api/owner/card?id=${encodeURIComponent(p.id)}&exp=${p.exp}&sig=${encodeURIComponent(p.sig)}`;
  return {
    print: `${base}&format=html&print=1`,
    view: `${base}&format=html`,
    pdf: `${base}&format=pdf`,
  };
}
