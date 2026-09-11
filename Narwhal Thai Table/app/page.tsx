import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { alternatesFor } from '@/lib/i18n/locales';

/* The page itself lives in components/pages/HomePage.tsx, shared with the
   Vietnamese edition at /vi (app/vi/page.tsx). */
export const metadata: Metadata = {
  alternates: alternatesFor('en', '/'),
};

export default function Page() {
  return <HomePage locale="en" />;
}
