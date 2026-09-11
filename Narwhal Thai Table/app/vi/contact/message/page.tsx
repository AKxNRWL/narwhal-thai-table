import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

export const metadata = contactSubMetadata('message', 'vi');

export default function Page() {
  return <ContactSubPage kind="message" locale="vi" />;
}
