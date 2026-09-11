import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DishPage, { dishMetadata } from '@/components/pages/DishPage';
import { DISHES, getDishBySlug } from '@/lib/dishes';

/* Vietnamese twin of app/menu/[slug]/page.tsx — same slugs, same component. */
type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DISHES.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  return dishMetadata(getDishBySlug(slug), 'vi');
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dish = getDishBySlug(slug);
  if (!dish) notFound();
  return <DishPage dish={dish} locale="vi" />;
}
