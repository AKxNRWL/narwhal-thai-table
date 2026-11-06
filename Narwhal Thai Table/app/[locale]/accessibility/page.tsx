import type { Metadata } from 'next';
import AccessibilityPage, { accessibilityMetadata } from '@/components/pages/AccessibilityPage';
import { isLocale, type Locale } from '@/lib/i18n/locales';

type P = { params: Promise<{ locale: string }> };
const loc = async (params: P['params']): Promise<Locale> => { const { locale } = await params; return isLocale(locale) ? locale : 'en'; };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  return accessibilityMetadata(await loc(params));
}

export default async function Page({ params }: P) {
  return <AccessibilityPage locale={await loc(params)} />;
}
