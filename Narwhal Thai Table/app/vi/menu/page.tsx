import type { Metadata } from 'next';
import MenuPage from '@/components/pages/MenuPage';
import { ui } from '@/lib/i18n';
import { alternatesFor, OG_LOCALE } from '@/lib/i18n/locales';
import { SITE_URL } from '@/lib/site';

const t = ui('vi').meta.menu;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: alternatesFor('vi', '/menu'),
  openGraph: {
    locale: OG_LOCALE.vi,
    title: t.ogTitle,
    description: t.ogDescription,
    url: `${SITE_URL}/vi/menu`,
  },
};

export default function Page() {
  return <MenuPage locale="vi" />;
}
