/**
 * Local events that change how a visit goes (an airshow weekend, the US Open
 * of Surfing, a parade on Beach Blvd…) without closing the restaurant — the
 * sibling of lib/closures.ts. Add a window here and the AI hosts (web chat +
 * phone, via lib/chatKnowledge.ts restaurantFacts()) know about it only
 * while it is on; afterwards the note drops out by itself.
 *
 * Dates are calendar days in America/Los_Angeles, `YYYY-MM-DD`, inclusive.
 * Keep `note` to the facts a guest needs: what is happening, how it affects
 * traffic / parking / waits, and what to suggest (reserve, order pickup).
 * No prices, no discounts — the host may not promise either.
 */
import { todayPT } from './closures';

export type LocalEvent = {
  from: string; // YYYY-MM-DD, first day the note shows
  to: string; // YYYY-MM-DD, last day the note shows
  label: string;
  note: string;
};

export const EVENTS: LocalEvent[] = [
  {
    from: '2026-09-30', // a day early so the phone prompt synced tonight already carries it
    to: '2026-10-04',
    label: 'Pacific Airshow weekend',
    note:
      'The Pacific Airshow is on at Huntington Beach Friday–Sunday, October 2–4, 2026, flying about 10:30 AM – 4:30 PM each day, centred at Huntington St & Pacific Coast Highway, about five minutes down Beach Blvd from us. We are OPEN with normal hours all weekend. Expect very heavy traffic on Beach Blvd and PCH, especially 8–11 AM heading to the beach and 4:30–7:30 PM leaving it; downtown and beach parking is scarce. Our plaza lot is for our guests — mention it as a plus (park once, eat, no PCH traffic). Dinner right after the last flight (about 4:30–8 PM) is the busiest time: warmly suggest reserving a table for the evening or ordering pickup ahead through the online ordering page, and be honest that walk-in waits and delivery times can run longer than usual that weekend.',
  },
];

/** Events whose window covers today (restaurant local day). */
export function activeEvents(now: Date = new Date()): LocalEvent[] {
  const today = todayPT(now);
  return EVENTS.filter((e) => e.from <= today && today <= e.to);
}

/** Prompt lines for the AI hosts. Empty when no event window is active. */
export function eventsForPrompt(now: Date = new Date()): string {
  return activeEvents(now)
    .map((e) => `${e.label.toUpperCase()}: ${e.note}`)
    .join(' ');
}
