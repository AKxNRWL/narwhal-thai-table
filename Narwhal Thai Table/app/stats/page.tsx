import type { Metadata } from 'next';
import StatsClient from './StatsClient';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import type { PromoImageOption } from '@/lib/promoShared';

/**
 * Owner Control Room — thin server shell around the client page (StatsClient).
 *
 * Why a server component exists at all: the promo editor offers the dish
 * photos already on the site as pop-up images, and knowing which dishes HAVE a
 * photo means checking /public on disk (lib/media.ts). That only works at
 * build time, never inside a Netlify function — so the list is computed here,
 * baked into the static page, and handed down as a prop.
 */
export const metadata: Metadata = {
  title: 'Owner · Control Room',
  robots: { index: false, follow: false },
};

export default function StatsPage() {
  const promoImages = DISHES.flatMap<PromoImageOption>((d) => {
    const src = d.image?.src ?? getDishImage(d.slug);
    return src ? [{ label: d.name, src }] : [];
  });
  return <StatsClient promoImages={promoImages} />;
}
