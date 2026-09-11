'use client';

import Button from '@/components/ui/Button';
import { Section, Container, Heading } from '@/components/ui/Section';
import { chrome } from '@/lib/i18n/chrome';
import { localePath } from '@/lib/i18n/locales';
import Rich from '@/lib/i18n/rich';
import { useLocale } from '@/lib/i18n/useLocale';

/**
 * 404 for an unknown dish slug under a translated edition. not-found.tsx gets
 * no route params, so the locale comes from the URL on the client and the
 * strings from the client-safe chrome dictionary.
 */
export default function DishNotFoundClient() {
  const locale = useLocale();
  const t = chrome(locale).notFound;
  const menu = localePath(locale, '/menu');
  return (
    <Section first>
      <Container narrow className="flex flex-col items-center text-center">
        <Button href={menu} variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> {t.back}
        </Button>
        <Heading as="h1" size="lg" className="mt-8">
          <Rich text={t.title} locale={locale} />
        </Heading>
        <p className="mt-6 max-w-xl font-serif text-[19px] italic leading-relaxed text-cream/70">{t.body}</p>
        <div className="mt-10">
          <Button href={menu} variant="primary" size="lg" arrow>{t.cta}</Button>
        </div>
      </Container>
    </Section>
  );
}
