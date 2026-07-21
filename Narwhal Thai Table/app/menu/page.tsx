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
            Thirteen categories, cooked to order from the first bite to the last sweet one. ★ marks the house signatures. Every plate carries its own story — the recipe&apos;s history, how to eat it well, and what belongs beside it.
          </p>
        </div>
        <MenuTabs />
      </div>
    </section>
  );
}
