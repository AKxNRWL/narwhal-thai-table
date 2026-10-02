'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { embedUrl, posterUrl, watchUrl, type Film } from '@/lib/films';

/**
 * The /watch player — a "lite" YouTube embed.
 *
 * The poster frame and a play button render first (one small image, no
 * third-party script); the YouTube iframe loads only when the guest presses
 * play, with autoplay — so the tap that loads it is also the tap that starts
 * it, which is what phone browsers require for sound. With more than one film
 * the strip below switches the player (newest first).
 */
export default function FilmPlayer({ films, label }: { films: Film[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const film = films[index] ?? films[0];
  if (!film) return null;

  const choose = (i: number) => {
    setIndex(i);
    setPlaying(true); // the tap on a thumbnail is a user gesture — autoplay is allowed
  };

  return (
    <div>
      <figure
        aria-label={label}
        className="relative isolate m-0 aspect-video w-full overflow-hidden rounded-[var(--radius-frame)] border border-brass/25 bg-navy shadow-card"
      >
        {playing ? (
          <iframe
            key={film.id}
            src={embedUrl(film.id, true)}
            title={film.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${film.title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
          >
            <Poster key={film.id} id={film.id} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]" />
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,18,31,0.05),rgba(6,18,31,0.45))]" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-brass-light/70 bg-navy-deep/70 text-brass-light shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md transition-[transform,background-color] duration-300 group-hover:scale-105 group-hover:bg-brass group-hover:text-navy"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
            </span>
          </button>
        )}
      </figure>

      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="font-display text-[19px] tracking-[0.02em] text-cream">{film.title}</span>
        <a
          href={watchUrl(film.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans text-[10.5px] font-medium uppercase tracking-[0.22em] text-brass-light transition-colors hover:text-cream"
        >
          Open on YouTube ↗
        </a>
      </figcaption>

      {films.length > 1 && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {films.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-current={i === index ? 'true' : undefined}
                className={cn(
                  'group block w-full overflow-hidden rounded-[var(--radius-frame)] border text-left transition-[border-color,transform] duration-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
                  i === index ? 'border-brass-light/80' : 'border-cream/10 hover:-translate-y-0.5 hover:border-brass/50',
                )}
              >
                <span className="block aspect-video w-full overflow-hidden bg-navy">
                  <Poster id={f.id} size="hq" className="h-full w-full object-cover" />
                </span>
                <span className="block px-3 py-2.5 font-serif text-[14px] italic leading-snug text-cream/80 group-hover:text-cream">{f.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** YouTube's own poster frames; falls back to the always-present hqdefault. */
function Poster({ id, size = 'max', className }: { id: string; size?: 'max' | 'hq'; className?: string }) {
  const [src, setSrc] = useState(posterUrl(id, size));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={size === 'max' ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => size === 'max' && setSrc(posterUrl(id, 'hq'))}
      className={className}
    />
  );
}
