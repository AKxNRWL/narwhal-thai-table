import MenuPage, { menuMetadata } from '@/components/pages/MenuPage';

/* The page lives in components/pages/MenuPage.tsx, shared with the translated editions. */
export const metadata = menuMetadata('en');

export default function Page() {
  return <MenuPage locale="en" />;
}
