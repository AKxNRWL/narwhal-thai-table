import LunchPage, { lunchMetadata } from '@/components/pages/LunchPage';

export const metadata = lunchMetadata('vi');

export default function Page() {
  return <LunchPage locale="vi" />;
}
