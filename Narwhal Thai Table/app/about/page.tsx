import AboutPage, { aboutMetadata } from '@/components/pages/AboutPage';

/* The page lives in components/pages/AboutPage.tsx, shared with /vi/about. */
export const metadata = aboutMetadata('en');

export default function Page() {
  return <AboutPage locale="en" />;
}
