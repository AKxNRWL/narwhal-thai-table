import Image from 'next/image';
import Link from 'next/link';
import Marquee from '@/components/fx/Marquee';
import { Container, Eyebrow, Heading } from '@/components/ui/Section';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';

/**
 * PhotoMarquee — "From the kitchen": two counter-scrolling rows of real dish
 * photography (every dish that has a photo), each tile linking to its story.
 * Server component: photo lookup uses the filesystem at build time.
 */
export default function PhotoMarquee() {
  const tiles = DISHES.map((d) => ({ slug: d.slug, name: d.name, thai: d.thai, src: d.image?.src ?? getDishImage(d.slug) }))
    .filter((t): t is typeof t & { src: string } => Boolean(t.src));
  if (tiles.length < 6) return null;
  const half = Math.ceil(tiles.length / 2);
  const rows = [tiles.slice(0, half), tiles.slice(half)];

  return (
    <section aria-labelledby="kitchen-marquee-title" className="relative isolate overflow-hidden border-y border-cream/[0.06] bg-navy py-16 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(200,162,78,0.14),transparent_70%)]" />
      <Container className="mb-10 flex flex-col items-center gap-4 text-center">
        <Eyebrow>From the kitchen</Eyebrow>
        <Heading as="h2" size="md" id="kitchen-marquee-title">
          {tiles.length} plates, <em>one wok at a time</em>.
        </Heading>
      </Container>

      <div className="flex flex-col gap-5 [transform:rotate(-2deg)_scale(1.06)]">
        {rows.map((row, i) => (
          <Marquee key={i} reverse={i === 1} duration={i === 0 ? 95 : 110} gap={18}>
            {row.map((t) => (
              <Link
                key={t.slug}
                href={`/menu/${t.slug}`}
                className="group relative block h-[150px] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-cream/10 bg-navy-deep shadow-card sm:h-[190px] sm:w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light"
              >
                <Image
                  src={t.src}
                  alt={`${t.name}${t.thai ? ` (${t.thai})` : ''} at Narwhal Thai Table, Huntington Beach`}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/90 to-transparent px-4 pb-3 pt-10 font-display text-[13px] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {t.name}
                </span>
              </Link>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
