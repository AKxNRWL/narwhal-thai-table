import ContactSubPage, { contactSubMetadata } from '@/components/pages/ContactSubPage';

export const metadata = contactSubMetadata('catering', 'vi');

export default function Page() {
  return <ContactSubPage kind="catering" locale="vi" />;
}
