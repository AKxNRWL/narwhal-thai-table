/**
 * The restaurant's films — the YouTube channel, read through its public RSS feed.
 *
 * WHY: the placemat carries a QR code "WHILE YOU WAIT" → /socialmedia. That page must
 * never go stale and never need a deploy when a new film goes up, so it reads
 * the channel feed (no API key, no quota) and is revalidated once an hour.
 * If YouTube is unreachable at build or request time the page still renders
 * from FALLBACK — the films we know are there.
 *
 * Channel: "Narwhal Thai Table" — welcome@ account, created 22 Sep 2026.
 */
export const YOUTUBE = {
  handle: '@NarwhalThaiTable',
  channelId: 'UCJvuINWhE10vat7f38uf4Nw',
  url: 'https://www.youtube.com/@NarwhalThaiTable',
} as const;

export type Film = {
  /** YouTube video id */
  id: string;
  /** Display title — the part before " | Narwhal Thai Table …" */
  title: string;
  /** ISO date (YYYY-MM-DD) the film was published, '' if unknown */
  published: string;
};

/** Films we know are on the channel — used when the feed cannot be read. */
export const FALLBACK: Film[] = [
  { id: '6i3kDLyKFEI', title: 'The Ship Has Come In', published: '2026-10-01' },
];

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE.channelId}`;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

/** "The Ship Has Come In | Narwhal Thai Table · Huntington Beach, CA" → "The Ship Has Come In" */
export function displayTitle(raw: string): string {
  return decodeEntities(raw).split(' | ')[0].trim();
}

/** Newest first, at most `limit`. Never throws. */
export async function latestFilms(limit = 12): Promise<Film[]> {
  try {
    const r = await fetch(FEED, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return FALLBACK;
    const xml = await r.text();
    const films: Film[] = [];
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const e = m[1];
      const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = e.match(/<title>([^<]*)<\/title>/)?.[1];
      const published = e.match(/<published>([^<]+)<\/published>/)?.[1]?.slice(0, 10) ?? '';
      if (id && title) films.push({ id, title: displayTitle(title), published });
    }
    if (!films.length) return FALLBACK;
    films.sort((a, b) => (b.published > a.published ? 1 : b.published < a.published ? -1 : 0));
    return films.slice(0, limit);
  } catch {
    return FALLBACK;
  }
}

/** Poster frames YouTube serves for every public video (no key needed). */
export function posterUrl(id: string, size: 'max' | 'hq' = 'max'): string {
  return `https://i.ytimg.com/vi/${id}/${size === 'max' ? 'maxresdefault' : 'hqdefault'}.jpg`;
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Privacy-enhanced embed (no cookies until the guest presses play). */
export function embedUrl(id: string, autoplay = false): string {
  const q = new URLSearchParams({ rel: '0', modestbranding: '1', playsinline: '1', ...(autoplay ? { autoplay: '1' } : {}) });
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`;
}
