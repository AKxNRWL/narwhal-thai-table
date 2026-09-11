import ContactPage, { contactMetadata } from '@/components/pages/ContactPage';

/* The page lives in components/pages/ContactPage.tsx, shared with /vi/contact. */
export const metadata = contactMetadata('en');

export default function Page() {
  return <ContactPage locale="en" />;
}
