/**
 * One-off closures (holidays, private events, a day off) — single source of
 * truth for the whole site. Add a date here and everything follows:
 *
 *   - top ticker + hero chip announce it ahead of time (components)
 *   - Aileen chat / phone facts (lib/chatKnowledge.ts → RESTAURANT_FACTS)
 *   - table-QR service window returns "closed" that day (lib/serviceHours.ts)
 *   - reservation form + API refuse that date (components/ReserveForm.tsx,
 *     app/api/reserve/route.ts)
 *   - JSON-LD specialOpeningHoursSpecification for Google (app/layout.tsx)
 *
 * The OTHER channels are not code — set them by hand each time:
 * Google Business Profile special hours · DoorDash · Uber Eats ·
 * Toast Online Ordering closure · Yelp. (See the ops checklist in CLAUDE.md.)
 *
 * Dates are calendar days in America/Los_Angeles, `YYYY-MM-DD`.
 * Past closures are harmless — they just stop showing. Prune occasionally.
 */

export type Closure = {
  date: string; // YYYY-MM-DD (restaurant local day)
  /** Human line for the ticker / chips, English */
  label: string;
  /** Same, Thai */
  labelTh: string;
  /** Optional reason shown to guests (keep it warm and short) */
  reason?: string;
  /** When we're back — spelled out so guests don't have to think */
  reopen: string;
  reopenTh: string;
};

export const CLOSURES: Closure[] = [
  {
    date: '2026-09-24',
    label: 'Closed Thursday, September 24',
    labelTh: 'ปิดวันพฤหัสบดีที่ 24 กันยายน',
    reopen: 'back Friday, September 25 at 11:30 AM',
    reopenTh: 'เปิดตามปกติวันศุกร์ที่ 25 ก.ย. เวลา 11:30',
  },
];

/** Today's date in the restaurant's timezone as YYYY-MM-DD. */
export function todayPT(now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** True if the restaurant is closed on that calendar day (YYYY-MM-DD). */
export function isClosedOn(date: string): boolean {
  return CLOSURES.some((c) => c.date === date);
}

export function closureFor(date: string): Closure | undefined {
  return CLOSURES.find((c) => c.date === date);
}

/**
 * The next closure worth announcing: today or within `daysAhead` days.
 * Announcements start early so regulars see it before they plan the week.
 */
export function upcomingClosure(now: Date = new Date(), daysAhead = 10): Closure | undefined {
  const today = todayPT(now);
  const limit = new Date(now.getTime() + daysAhead * 86_400_000);
  const until = todayPT(limit);
  return CLOSURES.filter((c) => c.date >= today && c.date <= until).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
}

/** Plain-English sentence for AI hosts (chat + phone). Empty when nothing is scheduled ahead. */
export function closuresForPrompt(now: Date = new Date()): string {
  const today = todayPT(now);
  const ahead = CLOSURES.filter((c) => c.date >= today);
  if (!ahead.length) return '';
  return ahead
    .map((c) => {
      const d = new Date(`${c.date}T12:00:00-07:00`);
      const long = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
      return `CLOSED ALL DAY on ${long} (a one-day closure${c.reason ? ` — ${c.reason}` : ''}). No dine-in, pickup or delivery that day; do NOT take a reservation for that date — offer another day instead. We are ${c.reopen} with normal hours.`;
    })
    .join(' ');
}
