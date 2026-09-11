import LunchPage, { lunchMetadata } from '@/components/pages/LunchPage';

/* The page lives in components/pages/LunchPage.tsx, shared with /vi/lunch. */
export const metadata = lunchMetadata('en');

export default function Page() {
  return <LunchPage locale="en" />;
}
