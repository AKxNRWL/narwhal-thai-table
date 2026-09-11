import Image from 'next/image';
import Link from 'next/link';
import FadeUp from './FadeUp';
import Marquee from '@/components/fx/Marquee';
import Button from '@/components/ui/Button';
import { Section, Container, Eyebrow, Heading } from '@/components/ui/Section';
import { LUNCH, LUNCH_PHOTOS, LUNCH_PHOTO_DIR } from '@/lib/lunchPhotos';
import { RESTAURANT } from '@/lib/site';
import { ui } from '@/lib/i18n';
import { localePath, type Locale } from '@/lib/i18n/locales';
import Rich, { fmt } from '@/lib/i18n/rich';

/**
 * Homepage — Weekday Lunch Specials (#lunch-specials, the hero pill's target).
 *
 * Owner's ask (2 Sep 2026): "เอาให้ขึ้นหน้าแรกเลย ตอนเปิดเว็บมาเจอเลย" — the
 * weekday lunch deal should be real, server-rendered content (indexable for
 * "thai lunch special huntington beach"), not only the dismissable pop-up.
 * 8 Sep 2026: the eight plate photos now run as a marquee ("LS ก็เอาเป็นเหมือน
 * ตัวเมนูวิ่งได้"), every tile labelled "Lunch Special". Facts live in
 * lib/lunchPhotos.ts; the words in lib/i18n (EN / VI).
 */
export default function LunchSpecials({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).lunchHome;
  const photos = LUNCH_PHOTOS.map(({ file, label }) => ({ src: `${LUNCH_PHOTO_DIR}/${file}`, label }));
  const tel = 'tel:' + RESTAURANT.phone.replace(/[^\d+]/g, '');
  const menuPath = localePath(locale, LUNCH.menuPath);
  // English facts stay in lib/lunchPhotos.ts (the single source); Vietnamese carries its own wording.
  const days = locale === 'en' ? LUNCH.days : t.days;
  const includes = locale === 'en' ? LUNCH.includes : t.includes;
  return (
    <Section id="lunch-specials" tone="aurora" aria-labelledby="lunch-title" className="border-t border-cream/[0.06]">
      <Container>
        <FadeUp className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <Heading as="h2" size="lg" id="lunch-title">
            <Rich text={t.title} vars={{ price: LUNCH.fromPrice }} locale={locale} />
          </Heading>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-brass/40 bg-brass/10 px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brass-light animate-pulse-dot" />
            {days} · {LUNCH.hours}
          </div>
          <p className="max-w-xl text-[16.5px] leading-[1.75] text-cream/75">
            <Rich text={t.lede} vars={{ includes }} locale={locale} />
          </p>
        </FadeUp>
      </Container>

      {/* the plates, running — full-bleed, pauses on hover, every tile says "Lunch Special" */}
      <div className="mt-12 [transform:rotate(1.5deg)_scale(1.05)]">
        <Marquee duration={70} gap={18}>
          {photos.map((p) => (
            <Link
              key={p.src}
              href={menuPath}
              className="group relative block h-[190px] w-[254px] shrink-0 overflow-hidden rounded-2xl border border-brass/25 bg-navy-deep shadow-card sm:h-[240px] sm:w-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light"
            >
              <Image
                src={p.src}
                alt={fmt(t.alt, { label: p.label })}
                fill
                sizes="320px"
                className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
              />
              <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-brass/50 bg-navy-deep/70 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-brass-light backdrop-blur-md">
                <span aria-hidden="true" className="size-1 rounded-full bg-brass-light" />
                {fmt(t.tile, { price: LUNCH.fromPrice })}
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/55 to-transparent px-3.5 pb-3 pt-12 font-display text-[15px] text-cream">
                {p.label}
              </span>
            </Link>
          ))}
        </Marquee>
      </div>

      <Container>
        <FadeUp className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-6">
          <ul aria-label={t.platesLabel} className="flex flex-wrap justify-center gap-2">
            {LUNCH.plates.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2.5 rounded-full border border-cream/10 bg-white/[0.035] px-3.5 py-2 font-sans text-[13.5px] text-cream/85"
              >
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brass" />
                {p}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-3">
            {RESTAURANT.phone && (
              <Button href={tel} variant="primary" arrow data-magnetic>
                {t.call}
              </Button>
            )}
            <Button href={menuPath} variant={RESTAURANT.phone ? 'secondary' : 'primary'} arrow>
              {t.seeMenu}
            </Button>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}
