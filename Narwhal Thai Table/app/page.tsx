import Hero from '@/components/Hero';
import { getHeroMedia } from '@/lib/media';
import { SHOW_CHEF } from '@/lib/site';
import {
  StorySection,
  ChefSection,
  MenuPreviewSection,
  ExperienceSection,
  ContactSection,
} from '@/components/HomeSections';

export default function HomePage() {
  const heroMedia = getHeroMedia();
  return (
    <>
      <Hero media={heroMedia} />
      <StorySection />
      {SHOW_CHEF && <ChefSection />}
      <MenuPreviewSection />
      <ExperienceSection />
      <ContactSection />
    </>
  );
}
