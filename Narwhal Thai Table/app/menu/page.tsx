import type { Metadata } from 'next';
import MenuTabs from '@/components/MenuTabs';

export const metadata: Metadata = {
  title: 'Menu',
  description: 'The full Narwhal Thai Table menu — thirteen categories of royal-court Thai dishes. Tap any plate for its story, ingredients, and how to eat it.',
  openGraph: {
    title: 'Menu · Narwhal Thai Table',
    description: 'Thirteen categories of royal-court Thai dishes, made by hand.',
  },
};

export default function MenuPage() {
  return (
    <section className="menu-section" style={{ paddingTop: 140 }}>
      <div className="container">
        <div className="section-head">
          <span className="label">The Menu</span>
          <h2>The full menu — <em>tap a plate to hear its story</em>.</h2>
          <p>
            Thirteen categories, from appetizers to dessert. ★ marks the house signatures. Each plate has its own page with the recipe&apos;s history, how to eat it, and what it pairs with.
          </p>
        </div>
        <MenuTabs />
      </div>
    </section>
  );
}
