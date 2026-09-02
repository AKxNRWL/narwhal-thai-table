import { getStore } from '@netlify/blobs';
import { createHash, randomBytes } from 'crypto';

/**
 * Promo pop-up — the owner-managed "special" card that greets visitors
 * (components/PromoCard.tsx). Content lives in Netlify Blobs so the owner can
 * change the offer from /stats without a rebuild; every public page stays
 * static and only the client fetches /api/promo at runtime.
 *
 * Store layout (tenant-scoped, same convention as lib/tenants.ts):
 *   store "promo"  key `promo:<tenantId>`        → Promo JSON
 *   store "promo"  key `image:<tenantId>:<id>`   → one uploaded photo (+ metadata)
 * Uploaded photos are served at /api/promo/image/<id>. The id lives in the PATH
 * on purpose: Netlify's edge cache for Next routes ignores query strings
 * (Netlify-Vary), so `?v=` versions would all collapse onto one cached copy.
 */

import { LIMITS } from './promoShared';
import type { Promo, PromoImage } from './promoShared';
export * from './promoShared';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_ID = /^[a-z0-9]{8,24}$/;
const UPLOAD_PATH = /^\/api\/promo\/image\/([a-z0-9]{8,24})$/;

const STORE = 'promo';
const promoKey = (tenantId: string) => `promo:${tenantId}`;
const imagePrefix = (tenantId: string) => `image:${tenantId}:`;
const imageKey = (tenantId: string, id: string) => imagePrefix(tenantId) + id;
const store = () => getStore({ name: STORE, consistency: 'strong' });

/* ── read / write ─────────────────────────────────────────────────────── */

function normImages(raw: unknown, legacy: unknown): PromoImage[] {
  const out: PromoImage[] = [];
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (it && typeof it === 'object' && typeof (it as PromoImage).src === 'string' && (it as PromoImage).src) {
        out.push({ src: (it as PromoImage).src, alt: str((it as PromoImage).alt) });
      }
    }
  } else if (typeof legacy === 'string' && legacy) {
    out.push({ src: legacy, alt: '' }); // records saved before the carousel
  }
  return out.slice(0, LIMITS.images);
}

export async function readPromo(tenantId: string): Promise<Promo | null> {
  try {
    const raw = await store().get(promoKey(tenantId), { type: 'json' });
    if (!raw || typeof raw !== 'object') return null;
    const p = raw as Partial<Promo> & { image?: unknown };
    // Tolerate older/partial records: every field has a safe default.
    return {
      id: str(p.id),
      enabled: p.enabled === true,
      eyebrow: str(p.eyebrow),
      title: str(p.title),
      body: str(p.body),
      price: str(p.price),
      images: normImages(p.images, p.image),
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

export const isImageId = (id: string): boolean => IMAGE_ID.test(id);
export const newImageId = (): string => Date.now().toString(36) + randomBytes(4).toString('hex');
export const imageUrl = (id: string): string => `/api/promo/image/${id}`;

export async function readPromoImage(
  tenantId: string,
  id: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  if (!isImageId(id)) return null;
  try {
    const res = await store().getWithMetadata(imageKey(tenantId, id), { type: 'arrayBuffer' });
    if (!res || !res.data) return null;
    const ct = typeof res.metadata?.contentType === 'string' ? res.metadata.contentType : 'image/jpeg';
    return { data: res.data, contentType: ct };
  } catch {
    return null;
  }
}

export async function writePromoImage(tenantId: string, id: string, bytes: Uint8Array, contentType: string): Promise<void> {
  // Blobs wants a plain ArrayBuffer — slice so a pooled Buffer can't leak neighbours.
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  await store().set(imageKey(tenantId, id), ab, {
    metadata: { contentType, updatedAt: new Date().toISOString() },
  });
}

/** Delete uploaded photos the saved promo no longer references (best-effort,
 *  called after every save so the store never fills up with old uploads). */
export async function cleanupPromoImages(tenantId: string, keep: PromoImage[]): Promise<number> {
  const referenced = new Set<string>();
  for (const im of keep) {
    const m = UPLOAD_PATH.exec(im.src);
    if (m) referenced.add(imageKey(tenantId, m[1]));
  }
  let removed = 0;
  try {
    const { blobs } = await store().list({ prefix: imagePrefix(tenantId) });
    for (const b of blobs) {
      if (!referenced.has(b.key)) {
        await store().delete(b.key);
        removed++;
      }
    }
  } catch (e) {
    console.warn('[promo] image cleanup skipped', e);
  }
  return removed;
}

/* ── validation ───────────────────────────────────────────────────────── */

function cleanUrl(v: string, allowTel: boolean, max: number): string | null {
  const s = v.trim();
  if (!s) return '';
  if (s.length > max) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (allowTel && /^tel:[+\d\s()-]{5,}$/i.test(s)) return s;
  return null;
}

function cleanImages(raw: unknown, legacy: unknown): PromoImage[] | null {
  const list = Array.isArray(raw) ? raw : typeof legacy === 'string' && legacy.trim() ? [{ src: legacy, alt: '' }] : [];
  const out: PromoImage[] = [];
  const seen = new Set<string>();
  for (const it of list) {
    if (!it || typeof it !== 'object') return null;
    const src = cleanUrl(str((it as PromoImage).src), false, LIMITS.imageSrc);
    if (src === null) return null;
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push({ src, alt: str((it as PromoImage).alt).trim().slice(0, LIMITS.alt) });
    if (out.length >= LIMITS.images) break;
  }
  return out;
}

/** Content hash → promo id. Only the visible offer counts, not enabled/dates. */
function contentId(p: Omit<Promo, 'id' | 'updatedAt'>): string {
  return createHash('sha1')
    .update(JSON.stringify([p.eyebrow, p.title, p.body, p.price, p.images, p.ctaLabel, p.ctaUrl]))
    .digest('hex')
    .slice(0, 10);
}

/** Turn an untrusted request body into a Promo, or explain what's wrong. */
export function sanitizePromo(input: unknown): { promo: Promo } | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'bad_body' };
  const b = input as Record<string, unknown>;
  const clip = (k: 'eyebrow' | 'title' | 'body' | 'price' | 'ctaLabel', v: unknown) => str(v).trim().slice(0, LIMITS[k]);

  const enabled = b.enabled === true;
  const eyebrow = clip('eyebrow', b.eyebrow);
  const title = clip('title', b.title);
  const body = clip('body', b.body);
  const price = clip('price', b.price);
  const ctaLabel = clip('ctaLabel', b.ctaLabel);
  const ctaUrl = cleanUrl(str(b.ctaUrl), true, LIMITS.ctaUrl);
  const images = cleanImages(b.images, b.image);
  const startsAt = str(b.startsAt).trim();
  const endsAt = str(b.endsAt).trim();

  if (enabled && !title) return { error: 'title_required' };
  if (ctaUrl === null) return { error: 'bad_cta_url' };
  if (images === null) return { error: 'bad_image' };
  if (startsAt && !DAY.test(startsAt)) return { error: 'bad_start' };
  if (endsAt && !DAY.test(endsAt)) return { error: 'bad_end' };
  if (startsAt && endsAt && endsAt < startsAt) return { error: 'end_before_start' };

  const base = { enabled, eyebrow, title, body, price, images, ctaLabel: ctaLabel || (ctaUrl ? 'Order now' : ''), ctaUrl, startsAt, endsAt };
  return { promo: { ...base, id: contentId(base), updatedAt: new Date().toISOString() } };
}
