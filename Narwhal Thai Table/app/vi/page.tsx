import type { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';
import { ui } from '@/lib/i18n';
import { alternatesFor, OG_LOCALE } from '@/lib/i18n/locales';
import { SITE_URL } from '@/lib/site';

const t = ui('vi').meta.home;

export const metadata: Metadata = {
  title: { absolute: t.title },
  description: t.description,
  alternates: alternatesFor('vi', '/'),
  openGraph: {
    locale: OG_LOCALE.vi,
    title: t.ogTitle,
    description: t.ogDescription,
    url: `${SITE_URL}/vi`,
  },
};

export default function Page() {
  return <HomePage locale="vi" />;
}
