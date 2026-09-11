import HomePage, { homeMetadata } from '@/components/pages/HomePage';

/* The page itself lives in components/pages/HomePage.tsx, shared with the
   translated editions at /vi, /th, /zh, /ko, /ja (app/[locale]/page.tsx). */
export const metadata = homeMetadata('en');

export default function Page() {
  return <HomePage locale="en" />;
}
