import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

/* Shell + form live in components/pages/ContactSubPage.tsx, shared with /vi/contact/reservation. */
export const metadata = contactSubMetadata('reservation', 'en');

export default function Page() {
  return <ContactSubPage kind="reservation" locale="en" />;
}
