import type { Metadata } from 'next';
import CardsClient from './CardsClient';

/**
 * Owner · Welcome Cards — the print bench for the table tents that greet a
 * confirmed reservation by name. Server shell only; everything real happens
 * client-side in CardsClient (it reads the same owner session as /stats).
 */
export const metadata: Metadata = {
  title: 'Owner · Welcome Cards',
  robots: { index: false, follow: false },
};

export default function CardsPage() {
  return <CardsClient />;
}
