import Button from '@/components/ui/Button';
import { Section, Container, Heading } from '@/components/ui/Section';
import { ui } from '@/lib/i18n';
import { localePath, type Locale } from '@/lib/i18n/locales';
import Rich from '@/lib/i18n/rich';

/** 404 for an unknown dish slug — app/menu/[slug]/not-found.tsx and its /vi twin. */
export default function DishNotFound({ locale = 'en' }: { locale?: Locale }) {
  const t = ui(locale).notFound;
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
