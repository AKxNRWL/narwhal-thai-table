import type { Metadata } from 'next';
import PointsClient from '@/components/rewards/PointsClient';
import { Container, Eyebrow, Heading, Section } from '@/components/ui/Section';

/**
 * /points — Narwhal Rewards for members: balance, history, add a bill from a receipt,
 * and the rules. Everything member-specific loads in the browser (components/rewards/
 * PointsClient → the Supabase `rewards` function), so the page itself is static.
 * Kept out of search results (it is a personal account page, not content).
 */
export const metadata: Metadata = {
  title: 'Narwhal Rewards — Your Points',
  description:
    'Your Narwhal Rewards points at Narwhal Thai Table, Huntington Beach — 100 points for every $1. Check your balance or add a bill from your receipt.',
  alternates: { canonical: '/points' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <Section first tone="aurora" className="pb-24">
      <Container narrow>
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <Eyebrow>Narwhal Rewards</Eyebrow>
          <Heading as="h1" size="lg">
            Your <em>points</em>
          </Heading>
          <p className="max-w-xl font-serif text-[17px] italic leading-relaxed text-cream/70">
            Every dollar at our table earns 100 points.
          </p>
        </div>
        <PointsClient />
      </Container>
    </Section>
  );
}
