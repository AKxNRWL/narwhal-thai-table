import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import LunchSpecials from '@/components/LunchSpecials';
import { getHeroMedia } from '@/lib/media';
import { SHOW_CHEF } from '@/lib/site';
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
  return (
    <>
      <Hero media={heroMedia} />
      {/* Signature dishes straight after the hero — owner, 7 Sep 2026: "เอาเมนูมาอยู่รองจาก hero". */}
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
