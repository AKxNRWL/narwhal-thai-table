import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import LunchSpecials from '@/components/LunchSpecials';
import PhotoMarquee from '@/components/PhotoMarquee';
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
      <StorySection />
      {SHOW_CHEF && <ChefSection />}
      {/* Weekday Lunch Specials — was first under the hero (2 Sep); owner moved it down
          on 7 Sep ("เอาลงไปข้างล่าง"). The hero pill still jumps to #lunch-specials. */}
      <LunchSpecials />
      <ExperienceSection />
      <RoomSection />
      <ContactSection />
    </>
  );
}
