import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

/* Shell + form live in components/pages/ContactSubPage.tsx, shared with /vi/contact/catering. */
export const metadata = contactSubMetadata('catering', 'en');

export default function Page() {
  return <ContactSubPage kind="catering" locale="en" />;
}
