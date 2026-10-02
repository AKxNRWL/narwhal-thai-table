import type { Metadata } from 'next';
import NarwhalTV, { type Channel, type Pick } from '@/components/watch/NarwhalTV';
import { DISHES } from '@/lib/dishes';
import { latestFilms, posterUrl, watchUrl, embedUrl } from '@/lib/films';
import { getDishImage } from '@/lib/media';
import { SITE_URL, SOCIAL, RESTAURANT_ID } from '@/lib/site';

/**
 * /watch — "Narwhal TV", the restaurant's social hub as a television home screen.
 *
 * WHY THIS PAGE EXISTS: the paper placemat (Oct 2026) carries two QR codes —
 * THE MENU → /menu and WHILE YOU WAIT → here. A guest who has just ordered
 * scans it and lands on a launcher: the channel's films in a spotlight that
 * plays right here, app tiles for the four social channels and the house
 * (menu, reservations, rewards, the game), the platforms' own live embeds, and
 * a shelf of signature dishes. Everything that can update itself does:
 * films come from the YouTube channel feed (revalidated hourly), the channel
 * panels are Instagram's, TikTok's and Facebook's public embeds of our
 * accounts, the dish shelf reads lib/dishes.ts. Nothing here needs a deploy
 * when a new film or post goes up.
 *
 * Owner, 1 Oct 2026: "ถ้า /watch เป็นเหมือนรวม Social Media ของร้าน … ทำหน้าให้ทันสมัย
 * แบบล้ำ ๆ … เหมือนหน้า Home ของ Google TV / Vidaa แต่เป็นของร้านเรา".
 */

export const revalidate = 3600; // the channel feed is re-read once an hour

const TITLE = 'Narwhal TV — films, reels and clips from Narwhal Thai Table, Huntington Beach';
const DESCRIPTION =
  'Narwhal TV: short films from the Narwhal Thai Table kitchen in Huntington Beach, CA, plus our latest Instagram, TikTok and Facebook posts — something to watch while you wait.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/watch' },
  openGraph: {
    title: 'Narwhal TV · while you wait',
    description: DESCRIPTION,
    url: `${SITE_URL}/watch`,
    type: 'website',
  },
};

/** The platforms' own public embeds (no tokens, no SDKs) — verified 1 Oct 2026. */
function channelFor(label: string): Channel | null {
  const s = SOCIAL.find((x) => x.label === label && x.url);
  if (!s) return null;
  const handle = s.handle ?? s.label;
  switch (label) {
    case 'YouTube':
      return { key: 'youtube', label, handle, url: s.url, note: 'Our films — the long ones' };
    case 'Instagram': {
      const user = s.url.replace(/\/+$/, '').split('/').pop() ?? '';
      return { key: 'instagram', label, handle, url: s.url, note: 'Plates, the patio, reels', embed: { src: `https://www.instagram.com/${user}/embed/`, height: 540 } };
    }
    case 'TikTok': {
      const user = s.url.split('/@').pop() ?? '';
      return { key: 'tiktok', label, handle, url: s.url, note: 'Quick cuts from the kitchen', embed: { src: `https://www.tiktok.com/embed/@${user}`, height: 360 } };
    }
    case 'Facebook':
      return {
        key: 'facebook',
        label,
        handle,
        url: s.url,
        note: 'News, hours and events',
        embed: {
          src: `https://www.facebook.com/plugins/page.php?${new URLSearchParams({ href: s.url, tabs: 'timeline', width: '500', height: '540', small_header: 'true', adapt_container_width: 'true', hide_cover: 'false', show_facepile: 'false' }).toString()}`,
          height: 540,
        },
      };
    default:
      return null;
  }
}

export default async function WatchPage() {
  const films = await latestFilms();
  const channels = ['YouTube', 'Instagram', 'TikTok', 'Facebook'].map(channelFor).filter((c): c is Channel => !!c);
  const picks: Pick[] = DISHES.filter((d) => d.signature)
    .map((d) => ({ slug: d.slug, name: d.name, thai: d.thai, price: d.price, image: d.image?.src ?? getDishImage(d.slug) }))
    .filter((p) => p.image)
    .slice(0, 10);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/watch#page`,
        url: `${SITE_URL}/watch`,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'en-US',
        about: { '@id': RESTAURANT_ID },
      },
      ...films.map((f) => ({
        '@type': 'VideoObject',
        '@id': `${SITE_URL}/watch#${f.id}`,
        name: f.title,
        description: `${f.title} — a short film from Narwhal Thai Table, Huntington Beach.`,
        thumbnailUrl: [posterUrl(f.id, 'max'), posterUrl(f.id, 'hq')],
        uploadDate: f.published || undefined,
        embedUrl: embedUrl(f.id),
        contentUrl: watchUrl(f.id),
        publisher: { '@id': RESTAURANT_ID },
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NarwhalTV films={films} channels={channels} picks={picks} />
    </>
  );
}
