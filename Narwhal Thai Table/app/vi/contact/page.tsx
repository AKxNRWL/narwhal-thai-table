import ContactPage, { contactMetadata } from '@/components/pages/ContactPage';

export const metadata = contactMetadata('vi');

export default function Page() {
  return <ContactPage locale="vi" />;
}
