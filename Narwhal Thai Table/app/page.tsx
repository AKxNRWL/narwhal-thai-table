import type { Metadata } from 'next';
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

/**
 * The dish pinned at the very top of the hero (the chip above the headline).
 * Owner, 9 Sep 2026: "เลิกเอา Lunch Special ขึ้นข้างหน้าสุด ให้เอาปลาราดพริกขึ้นแทน" —
 * the weekday-lunch chip is retired; the whole fried pompano takes its place.
 * Change the slug here to feature something else. Lunch Specials still have
 * their own section further down.
 */
const HERO_FEATURED_SLUG = 'fried-whole-pompano';
import {
  StorySection,
  ChefSection,
  MenuPreviewSection,
  ExperienceSection,
  RoomSection,
  ContactSection,
} from '@/components/HomeSections';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const heroMedia = getHeroMedia();
  const featuredDish = DISHES.find((d) => d.slug === HERO_FEATURED_SLUG);
  const featured = featuredDish
    ? { slug: featuredDish.slug, name: featuredDish.name, price: featuredDish.price, image: getDishImage(featuredDish.slug) }
    : null;
  return (
    <>
      <Hero media={heroMedia} featured={featured} />
      {/* "From the kitchen" — the running menu straight after the hero (owner, 8 Sep 2026:
          "เอาเมนูที่วิ่งได้ขึ้นไปรองจาก Hero"). */}
      <PhotoMarquee />
      {/* Recommended plates — owner-curated grid (7 Sep: "เอาเมนูมาอยู่รองจาก hero"). */}
      <MenuPreviewSection />

      {/* Art pass (9 Sep 2026, owner: "ใส่งานอาร์ตมากกว่านี้") — "From Siam's royal
          court to Huntington Beach" painted as one panorama: the Grand Palace on
          the left, the HB pier on the right, the narwhal crossing between them. */}
      <ThaiWaveDivider />
      <ArtBand base="/images/art/siam-to-hb" widths={[1400, 2400]} position="50% 55%" speed={0.16} height="h-[58vh] min-h-[380px] max-h-[760px]">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <Eyebrow>Our Story</Eyebrow>
          <p className="max-w-2xl font-serif text-[clamp(20px,2.6vw,30px)] italic leading-snug text-cream [text-shadow:0_2px_24px_rgba(6,18,31,0.9)]">
            Three siblings, thirty years of restaurant life, one table on Beach Boulevard.
          </p>
        </div>
      </ArtBand>
      <StorySection />
      {SHOW_CHEF && <ChefSection />}
      {/* Weekday Lunch Specials — was first under the hero (2 Sep); owner moved it down
          on 7 Sep ("เอาลงไปข้างล่าง") and retired the hero pill on 9 Sep. */}
      <LunchSpecials />
      <ExperienceSection />
      <RoomSection />

      {/* The patio at night, with Loy Krathong lanterns rising through it — the
          lead-in to "Come See Us". */}
      <ThaiWaveDivider flip />
      <ArtBand base="/images/art/patio" widths={[1400, 2400]} position="50% 60%" speed={0.14} height="h-[54vh] min-h-[360px] max-h-[700px]" className="[&>div:last-child]:items-end">
        <FloatingLanterns count={16} seed={11} className="z-0" />
        <div className="flex flex-col items-center gap-3 px-6 pb-12 text-center">
          <Eyebrow>19072 Beach Blvd &middot; Huntington Beach</Eyebrow>
          <p className="font-serif text-[clamp(18px,2.2vw,26px)] italic text-cream [text-shadow:0_2px_24px_rgba(6,18,31,0.9)]">
            Open every day &mdash; Mon&ndash;Fri 11:30 AM &ndash; 10 PM &middot; Sat&ndash;Sun 12 &ndash; 10 PM
          </p>
        </div>
      </ArtBand>
      <ContactSection />
    </>
  );
}
