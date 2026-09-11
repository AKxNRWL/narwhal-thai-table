import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DishPage, { dishMetadata } from '@/components/pages/DishPage';
import { DISHES, getDishBySlug } from '@/lib/dishes';
import { isLocale, type Locale } from '@/lib/i18n/locales';

/* Translated twin of app/menu/[slug]/page.tsx — same slugs, same component. */
type Params = { locale: string; slug: string };
type P = { params: Promise<Params> };

export function generateStaticParams(): { slug: string }[] {
  return DISHES.map((d) => ({ slug: d.slug }));
}

async function resolve(params: P['params']): Promise<{ locale: Locale; slug: string }> {
  const { locale, slug } = await params;
  return { locale: isLocale(locale) ? locale : 'en', slug };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await resolve(params);
  return dishMetadata(getDishBySlug(slug), locale);
}

export default async function Page({ params }: P) {
  const { locale, slug } = await resolve(params);
  const dish = getDishBySlug(slug);
  if (!dish) notFound();
  return <DishPage dish={dish} locale={locale} />;
}
