import type { Metadata } from 'next';
import MenuPage from '@/components/pages/MenuPage';
import { alternatesFor } from '@/lib/i18n/locales';

/* The page lives in components/pages/MenuPage.tsx, shared with /vi/menu. */
export const metadata: Metadata = {
  title: 'Menu',
  description: 'The full Narwhal Thai Table menu — thirteen categories of royal-court Thai dishes. Tap any plate for its story, ingredients, and how to eat it.',
  alternates: alternatesFor('en', '/menu'),
  openGraph: {
    title: 'Menu · Narwhal Thai Table',
    description: 'Thirteen categories of royal-court Thai dishes, made by hand.',
  },
};

export default function Page() {
  return <MenuPage locale="en" />;
}
