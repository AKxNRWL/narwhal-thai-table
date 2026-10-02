'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * SocialEmbed — a platform's own public embed (Instagram profile grid, TikTok
 * creator strip, Facebook page timeline) inside a Narwhal TV "channel" frame.
 *
 * All three are the platforms' official no-token embeds (verified 1 Oct 2026):
 *   instagram.com/<user>/embed/                → header + grid of the latest posts
 *   tiktok.com/embed/@<user>                   → header + horizontal strip of videos
 *   facebook.com/plugins/page.php?href=…       → page header + timeline
 * They are third-party pages, so each loads only when scrolled near (one
 * IntersectionObserver), behind a shimmering placeholder. If a platform ever
 * breaks its embed the frame still shows the handle and the Open button.
 */
export default function SocialEmbed({
  src,
  height,
  title,
  className,
}: {
  src: string;
  /** iframe height in px (the embeds size themselves to their own width) */
  height: number;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || load) return;
    if (!('IntersectionObserver' in window)) {
      setLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '480px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref} className={cn('relative w-full overflow-hidden bg-[#0a1a2b]', className)} style={{ height }}>
      {/* placeholder: shimmer + three ghost tiles, like a TV channel tuning in */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 grid grid-cols-3 gap-1.5 p-3 transition-opacity duration-700',
          ready ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="tv-shimmer aspect-square rounded-md bg-white/[0.05]" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      {load && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          onLoad={() => setReady(true)}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; web-share"
          className={cn('absolute inset-0 h-full w-full border-0 bg-white transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  );
}
