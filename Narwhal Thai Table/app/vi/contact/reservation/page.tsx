import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

export const metadata = contactSubMetadata('reservation', 'vi');

export default function Page() {
  return <ContactSubPage kind="reservation" locale="vi" />;
}
