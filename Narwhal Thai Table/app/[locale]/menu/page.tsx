import type { Metadata } from 'next';
import MenuPage, { menuMetadata } from '@/components/pages/MenuPage';
import { isLocale, type Locale } from '@/lib/i18n/locales';

type P = { params: Promise<{ locale: string }> };
const loc = async (params: P['params']): Promise<Locale> => { const { locale } = await params; return isLocale(locale) ? locale : 'en'; };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return menuMetadata(await loc(params));
}

export default async function Page({ params }: P) {
  return <MenuPage locale={await loc(params)} />;
}
