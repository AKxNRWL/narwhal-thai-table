import Button from '@/components/ui/Button';
import { Section, Container, Heading } from '@/components/ui/Section';

export default function NotFound() {
  return (
    <Section first>
      <Container narrow className="flex flex-col items-center text-center">
        <Button href="/menu" variant="ghost" className="text-[10.5px]">
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span> Back to menu
        </Button>
        <Heading as="h1" size="lg" className="mt-8">
          That plate isn&apos;t on <em>this table</em>.
        </Heading>
        <p className="mt-6 max-w-xl font-serif text-[19px] italic leading-relaxed text-cream/70">
          Maybe the link is old, or we&apos;ve renamed the dish. Take a look at the full menu — our kitchen probably has something even better for you.
        </p>
        <div className="mt-10">
          <Button href="/menu" variant="primary" size="lg" arrow>See the full menu</Button>
        </div>
      </Container>
    </Section>
  );
}
