import Hero from '@/components/Hero';
import LunchSpecials from '@/components/LunchSpecials';
import PhotoMarquee from '@/components/PhotoMarquee';
import ArtBand from '@/components/fx/ArtBand';
import FloatingLanterns from '@/components/fx/FloatingLanterns';
import ThaiWaveDivider from '@/components/fx/ThaiWaveDivider';
import { Eyebrow } from '@/components/ui/Section';
import { getDishImage, getHeroMedia } from '@/lib/media';
import { DISHES } from '@/lib/dishes';
import { SHOW_CHEF } from '@/lib/site';
import { ui } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/locales';
import {
  StorySection,
  ChefSection,
  MenuPreviewSection,
  ExperienceSection,
  RoomSection,
  ContactSection,
} from '@/components/HomeSections';

/**
 * Optional dish chip above the hero headline. The weekday-lunch pill that sat
 * here (2–9 Sep 2026) is retired; the owner then tried the whole pompano and
 * decided to leave the spot empty (9 Sep: "เอาออก") — the September special
 * lives in the promo pop-up (/stats) instead. Set a slug here to bring the
 * chip back for a featured plate.
 */
const HERO_FEATURED_SLUG: string | null = null;

/**
 * The home page, shared by / (English) and /vi (Vietnamese) — app/page.tsx and
 * app/vi/page.tsx are one-line wrappers that pass the locale and metadata.
 */
export default function HomePage({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale);
  const heroMedia = getHeroMedia();
  const featuredDish = HERO_FEATURED_SLUG ? DISHES.find((d) => d.slug === HERO_FEATURED_SLUG) : undefined;
  const featured = featuredDish
    ? { slug: featuredDish.slug, name: featuredDish.name, price: featuredDish.price, image: getDishImage(featuredDish.slug) }
    : null;
  return (
    <>
      <Hero media={heroMedia} featured={featured} locale={locale} t={t.hero} />
      {/* "From the kitchen" — the running menu straight after the hero (owner, 8 Sep 2026:
          "เอาเมนูที่วิ่งได้ขึ้นไปรองจาก Hero"). */}
      <PhotoMarquee locale={locale} />
      {/* Recommended plates — owner-curated grid (7 Sep: "เอาเมนูมาอยู่รองจาก hero"). */}
      <MenuPreviewSection locale={locale} />

      {/* Art pass (9 Sep 2026, owner: "ใส่งานอาร์ตมากกว่านี้") — "From Siam's royal
          court to Huntington Beach" painted as one panorama: the Grand Palace on
          the left, the HB pier on the right, the narwhal crossing between them. */}
      <ThaiWaveDivider />
      <ArtBand base="/images/art/siam-to-hb" widths={[1400, 2400]} position="50% 55%" speed={0.16} height="h-[58vh] min-h-[380px] max-h-[760px]">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Eyebrow>{t.bands.siamEyebrow}</Eyebrow>
          <p className="max-w-2xl font-serif text-[clamp(20px,2.6vw,30px)] italic leading-snug text-cream [text-shadow:0_2px_24px_rgba(6,18,31,0.9)]">
            {t.bands.siamLine}
          </p>
        </div>
      </ArtBand>
      <StorySection locale={locale} />
      {SHOW_CHEF && <ChefSection />}
      {/* Weekday Lunch Specials — was first under the hero (2 Sep); owner moved it down
          on 7 Sep ("เอาลงไปข้างล่าง") and retired the hero pill on 9 Sep. */}
      <LunchSpecials locale={locale} />
      <ExperienceSection locale={locale} />
      <RoomSection locale={locale} />

      {/* The patio at night, with Loy Krathong lanterns rising through it — the
          lead-in to "Come See Us". */}
      <ThaiWaveDivider flip />
      <ArtBand base="/images/art/patio" widths={[1400, 2400]} position="50% 60%" speed={0.14} height="h-[54vh] min-h-[360px] max-h-[700px]" className="[&>div:last-child]:items-end">
        <FloatingLanterns count={16} seed={11} className="z-0" />
        <div className="flex flex-col items-center gap-3 px-6 pb-12 text-center">
          <Eyebrow>{t.bands.patioEyebrow}</Eyebrow>
          <p className="font-serif text-[clamp(18px,2.2vw,26px)] italic text-cream [text-shadow:0_2px_24px_rgba(6,18,31,0.9)]">
            {t.bands.patioLine}
          </p>
        </div>
      </ArtBand>
      <ContactSection locale={locale} />
    </>
  );
}
