import Image from 'next/image';
import Link from 'next/link';
import Marquee from '@/components/fx/Marquee';
import { Container, Eyebrow, Heading } from '@/components/ui/Section';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';
import { ui } from '@/lib/i18n';
import { categoryLabel } from '@/lib/i18n/chrome';
import { localePath, type Locale } from '@/lib/i18n/locales';
import Rich, { fmt } from '@/lib/i18n/rich';

/**
 * PhotoMarquee — "From the kitchen": two counter-scrolling rows of real dish
 * photography (every dish that has a photo), each tile linking to its story.
 * Every tile carries its course label so a plate is never mistaken for
 * another style — owner (8 Sep 2026): "Over Rice" must be spelled out, a bare
 * name risks a bad review. Server component: photo lookup uses the filesystem
 * at build time.
 */
export default function PhotoMarquee({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).marquee;
  const tiles = DISHES.map((d) => ({
    slug: d.slug,
    name: d.name,
    thai: d.thai,
    course: categoryLabel(locale, d.category),
    emphasis: d.category === 'overrice' || d.category === 'alacarte',
    spicy: Boolean(d.spicy),
    src: d.image?.src ?? getDishImage(d.slug),
  })).filter((t): t is typeof t & { src: string } => Boolean(t.src));
  if (tiles.length < 6) return null;
  const half = Math.ceil(tiles.length / 2);
  const rows = [tiles.slice(0, half), tiles.slice(half)];

  return (
    <section aria-labelledby="kitchen-marquee-title" className="relative isolate overflow-hidden border-y border-cream/[0.06] bg-navy py-14 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(200,162,78,0.14),transparent_70%)]" />
      {/* the placemat pattern, whispered behind the running plates (art pass) */}
      <div aria-hidden="true" className="art-texture" />
      <Container className="mb-10 flex flex-col items-center gap-4 text-center">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <Heading as="h2" size="md" id="kitchen-marquee-title">
          <Rich text={t.title} vars={{ count: tiles.length }} locale={locale} />
        </Heading>
        <p className="max-w-xl font-serif text-[16px] italic text-cream/65">{t.lede}</p>
      </Container>

      <div className="flex flex-col gap-5 [transform:rotate(-2deg)_scale(1.06)]">
        {rows.map((row, i) => (
          <Marquee key={i} reverse={i === 1} duration={i === 0 ? 105 : 120} gap={18}>
            {row.map((tile) => (
              <Link
                key={tile.slug}
                href={localePath(locale, `/menu/${tile.slug}`)}
                className="group relative block h-[170px] w-[236px] shrink-0 overflow-hidden rounded-2xl border border-cream/10 bg-navy-deep shadow-card sm:h-[210px] sm:w-[300px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light"
              >
                <Image
                  src={tile.src}
                  alt={fmt(t.alt, { name: `${tile.name}${tile.thai ? ` (${tile.thai})` : ''}`, course: tile.course })}
                  fill
                  sizes="300px"
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
                />
                {/* course + name — always visible */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-navy-deep/95 via-navy-deep/60 to-transparent px-3.5 pb-3 pt-12">
                  <span
                    className={
                      tile.emphasis
                        ? 'inline-flex w-fit items-center rounded-full border border-brass/50 bg-brass/20 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-brass-light'
                        : 'font-sans text-[9px] font-medium uppercase tracking-[0.22em] text-brass-light/85'
                    }
                  >
                    {tile.course}
                    {tile.spicy ? ` · ${t.spicy}` : ''}
                  </span>
                  <span className="font-display text-[14px] leading-tight text-cream">{tile.name}</span>
                </span>
              </Link>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
