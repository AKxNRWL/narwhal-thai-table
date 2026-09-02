import { getStore } from '@netlify/blobs';
import { createHash } from 'crypto';

/**
 * Promo pop-up — the owner-managed "special" card that greets visitors
 * (components/PromoCard.tsx). Content lives in Netlify Blobs so the owner can
 * change the offer from /stats without a rebuild; every public page stays
 * static and only the client fetches /api/promo at runtime.
 *
 * Store layout (tenant-scoped, same convention as lib/tenants.ts):
 *   store "promo"  key `promo:<tenantId>`  → Promo JSON
 *   store "promo"  key `image:<tenantId>`  → uploaded photo bytes (+ metadata)
 */

import { LIMITS } from './promoShared';
import type { Promo } from './promoShared';
export * from './promoShared';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const STORE = 'promo';
const promoKey = (tenantId: string) => `promo:${tenantId}`;
const imageKey = (tenantId: string) => `image:${tenantId}`;
const store = () => getStore({ name: STORE, consistency: 'strong' });

/* ── read / write ─────────────────────────────────────────────────────── */

export async function readPromo(tenantId: string): Promise<Promo | null> {
  try {
    const raw = await store().get(promoKey(tenantId), { type: 'json' });
    if (!raw || typeof raw !== 'object') return null;
    const p = raw as Partial<Promo>;
    // Tolerate older/partial records: every field has a safe default.
    return {
      id: str(p.id),
      enabled: p.enabled === true,
      eyebrow: str(p.eyebrow),
      title: str(p.title),
      body: str(p.body),
      price: str(p.price),
      image: str(p.image),
      ctaLabel: str(p.ctaLabel),
      ctaUrl: str(p.ctaUrl),
      startsAt: str(p.startsAt),
      endsAt: str(p.endsAt),
      updatedAt: str(p.updatedAt),
    };
  } catch {
    return null; // store unreachable → no pop-up, never an error page
  }
}

export async function writePromo(tenantId: string, promo: Promo): Promise<void> {
  await store().setJSON(promoKey(tenantId), promo);
}

export async function readPromoImage(
  tenantId: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await store().getWithMetadata(imageKey(tenantId), { type: 'arrayBuffer' });
    if (!res || !res.data) return null;
    const ct = typeof res.metadata?.contentType === 'string' ? res.metadata.contentType : 'image/jpeg';
    return { data: res.data, contentType: ct };
  } catch {
    return null;
  }
}

export async function writePromoImage(tenantId: string, bytes: Uint8Array, contentType: string): Promise<void> {
  // Blobs wants a plain ArrayBuffer — slice so a pooled Buffer can't leak neighbours.
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  await store().set(imageKey(tenantId), ab, {
    metadata: { contentType, updatedAt: new Date().toISOString() },
  });
}

/* ── validation ───────────────────────────────────────────────────────── */

function cleanUrl(v: string, allowTel: boolean): string | null {
  const s = v.trim();
  if (!s) return '';
  if (s.length > LIMITS.ctaUrl) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (allowTel && /^tel:[+\d\s()-]{5,}$/i.test(s)) return s;
  return null;
}

/** Content hash → promo id. Only the visible offer counts, not enabled/dates. */
function contentId(p: Omit<Promo, 'id' | 'updatedAt'>): string {
  return createHash('sha1')
    .update(JSON.stringify([p.eyebrow, p.title, p.body, p.price, p.image, p.ctaLabel, p.ctaUrl]))
    .digest('hex')
    .slice(0, 10);
}

/** Turn an untrusted request body into a Promo, or explain what's wrong. */
export function sanitizePromo(input: unknown): { promo: Promo } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'bad_body' };
  const b = input as Record<string, unknown>;
  const clip = (k: keyof typeof LIMITS, v: unknown) => str(v).trim().slice(0, LIMITS[k] as number);

  const enabled = b.enabled === true;
  const eyebrow = clip('eyebrow', b.eyebrow);
  const title = clip('title', b.title);
  const body = clip('body', b.body);
  const price = clip('price', b.price);
  const ctaLabel = clip('ctaLabel', b.ctaLabel);
  const ctaUrl = cleanUrl(str(b.ctaUrl), true);
  const image = cleanUrl(str(b.image), false);
  const startsAt = str(b.startsAt).trim();
  const endsAt = str(b.endsAt).trim();

  if (enabled && !title) return { error: 'title_required' };
  if (ctaUrl === null) return { error: 'bad_cta_url' };
  if (image === null || image.length > LIMITS.image) return { error: 'bad_image' };
  if (startsAt && !DAY.test(startsAt)) return { error: 'bad_start' };
  if (endsAt && !DAY.test(endsAt)) return { error: 'bad_end' };
  if (startsAt && endsAt && endsAt < startsAt) return { error: 'end_before_start' };

  const base = { enabled, eyebrow, title, body, price, image, ctaLabel: ctaLabel || (ctaUrl ? 'Order now' : ''), ctaUrl, startsAt, endsAt };
  return { promo: { ...base, id: contentId(base), updatedAt: new Date().toISOString() } };
}
