import FadeUp from './FadeUp';
import PhotoCarousel from './PhotoCarousel';
import BorderBeam from '@/components/fx/BorderBeam';
import Button from '@/components/ui/Button';
import { Section, Container, Eyebrow, Heading } from '@/components/ui/Section';
import { LUNCH, LUNCH_PHOTOS, LUNCH_PHOTO_DIR } from '@/lib/lunchPhotos';
import { RESTAURANT } from '@/lib/site';

/**
 * Homepage — Weekday Lunch Specials (#lunch-specials, the hero pill's target).
 *
 * Owner's ask (2 Sep 2026): "เอาให้ขึ้นหน้าแรกเลย ตอนเปิดเว็บมาเจอเลย" — the
 * weekday lunch deal should be real, server-rendered content (indexable for
 * "thai lunch special huntington beach"), not only the dismissable pop-up.
 * The eight plate photos ride in the same swipeable strip the pop-up uses.
 * Facts live in lib/lunchPhotos.ts. Moved below the story on 7 Sep.
 */
export default function LunchSpecials() {
  const photos = LUNCH_PHOTOS.map(({ file, label }) => ({ src: `${LUNCH_PHOTO_DIR}/${file}`, alt: label }));
  const tel = 'tel:' + RESTAURANT.phone.replace(/[^\d+]/g, '');
  return (
    <Section id="lunch-specials" tone="glow" aria-labelledby="lunch-title" className="border-t border-cream/[0.06]">
      <Container className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <FadeUp>
          {/* PhotoCarousel fills its parent (position:absolute; inset:0) — this
              box supplies the aspect ratio, the frame and the clipping. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-frame)] border border-brass/25 bg-navy shadow-card">
            <PhotoCarousel images={photos} label="Lunch Special plates" eagerCount={1} />
            <BorderBeam radius={18} size={260} duration={14} />
          </div>
        </FadeUp>

        <FadeUp className="flex flex-col items-start gap-5">
          <Eyebrow>Weekday Lunch Specials</Eyebrow>
          <Heading as="h2" size="lg" id="lunch-title">
            Thai lunch specials, <em>from {LUNCH.fromPrice}</em>
          </Heading>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-brass/40 bg-brass/10 px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brass-light motion-safe:animate-pulse-dot" />
            {LUNCH.days} · {LUNCH.hours}
          </div>
          <p className="text-[16.5px] leading-[1.75] text-cream/75">
            Pick a plate — every lunch comes with {LUNCH.includes}.
          </p>
          <ul aria-label="Lunch Special plates" className="grid w-full gap-2 sm:grid-cols-2">
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
          <div className="mt-2 flex flex-wrap gap-3">
            {RESTAURANT.phone && (
              <Button href={tel} variant="primary" arrow>
                Call to order lunch
              </Button>
            )}
            <Button href={LUNCH.menuPath} variant={RESTAURANT.phone ? 'secondary' : 'primary'} arrow>
              See the lunch menu
            </Button>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}
