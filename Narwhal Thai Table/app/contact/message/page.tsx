import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

/* Shell + form live in components/pages/ContactSubPage.tsx, shared with /vi/contact/message. */
export const metadata = contactSubMetadata('message', 'en');

export default function Page() {
  return <ContactSubPage kind="message" locale="en" />;
}
