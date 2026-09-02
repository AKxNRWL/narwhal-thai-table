import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import StatsClient from './StatsClient';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { LUNCH_PHOTOS, LUNCH_PHOTO_DIR } from '@/lib/lunchPhotos';
import type { PromoImageOption } from '@/lib/promoShared';

/**
 * Owner Control Room — thin server shell around the client page (StatsClient).
 *
 * Why a server component exists at all: the promo editor offers the photos
 * already on the site (Lunch Special plates + dish photos) as pop-up images,
 * and knowing which files exist means checking /public on disk. That only
 * works at build time, never inside a Netlify function — so the library is
 * computed here, baked into the static page, and handed down as a prop.
 */
export const metadata: Metadata = {
  title: 'Owner · Control Room',
  robots: { index: false, follow: false },
};

function photoLibrary(): PromoImageOption[] {
  const lunch = LUNCH_PHOTOS.flatMap<PromoImageOption>(({ file, label }) =>
    fs.existsSync(path.join(process.cwd(), 'public', LUNCH_PHOTO_DIR.slice(1), file))
      ? [{ label, src: `${LUNCH_PHOTO_DIR}/${file}`, group: 'lunch' }]
      : [],
  );
  const dishes = DISHES.flatMap<PromoImageOption>((d) => {
    const src = d.image?.src ?? getDishImage(d.slug);
    return src ? [{ label: d.name, src, group: 'dish' }] : [];
  });
  return [...lunch, ...dishes];
}

export default function StatsPage() {
  return <StatsClient promoImages={photoLibrary()} />;
}
