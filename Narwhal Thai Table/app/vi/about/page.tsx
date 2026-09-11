import AboutPage, { aboutMetadata } from '@/components/pages/AboutPage';

export const metadata = aboutMetadata('vi');

export default function Page() {
  return <AboutPage locale="vi" />;
}
