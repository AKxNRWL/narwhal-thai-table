/**
 * Welcome-card data — the names and lines printed on the table tents the team
 * sets out before service, one per CONFIRMED reservation.
 *
 * The hard question this file answers: what do you call a party when you know
 * exactly who booked but nothing about who they are bringing? The restaurant
 * convention is the booker's name plus a collective tail — "John Smith & Party"
 * — which is warm, never wrong, and never presumes a relationship (a card that
 * guessed "& Family" in front of a business dinner is worse than no card).
 * A solo booking gets the bare name; a guest who only gave a first name gets
 * "John & Party". The team can still override any name before printing.
 *
 * Nothing here touches the network — it is pure string work so the Control Room
 * page, and anything later (the HQ app, a print watcher), share one rulebook.
 */

import { normalizeOccasion, occasionByKey, type OccasionKey } from './occasions';

export type CardSource = {
  id?: string;
  first_name?: string;
  last_name?: string;
  party_size?: string;
  date?: string;
  time?: string;
  notes?: string;
  status?: string;
  /** Explicit occasion from the form / Aileen (lib/occasions.ts key), when the guest gave one. */
  occasion?: string;
};

/** The finished card, ready to lay out. */
export type GuestCard = {
  id: string;
  /** Big line: "John Smith & Party". */
  name: string;
  /** "7:00 PM" — empty when the booking had no usable time. */
  time: string;
  /** "Party of 4" — empty when we don't know the size. */
  party: string;
  /** "Happy Birthday!" and friends — empty unless the guest told us (occasion field or notes). */
  occasion: string;
  /** Which artwork set the card draws from — explicit occasion, else read from the notes; '' = the general set. */
  theme: OccasionKey | '';
  /** The raw note, shown in the Control Room list only (never printed). */
  notes: string;
};

const tidy = (v: string | undefined): string => (v ?? '').replace(/\s+/g, ' ').trim();

/** '4 Guests' | '4' | 'Party of 4' → 4 · anything unreadable → 0 */
export function partyCount(raw: string | undefined): number {
  const m = /\d+/.exec(tidy(raw));
  if (!m) return 0;
  const n = Number(m[0]);
  return Number.isFinite(n) && n > 0 && n < 200 ? n : 0;
}

/**
 * Title-case a name the guest typed, without mangling the ones that are
 * already right: McDonald and O'Brien keep their capitals, "JOHN SMITH"
 * calms down to "John Smith", "john" becomes "John".
 */
function niceCase(raw: string | undefined): string {
  const s = tidy(raw);
  if (!s) return '';
  // Mixed case that isn't all-caps is the guest's own spelling — leave it.
  if (/[a-z]/.test(s) && /[A-Z]/.test(s.slice(1))) return s;
  return s
    .toLowerCase()
    .replace(/(^|[\s\-'’])([a-zà-ÿ])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** "Lisette &Henry" → "Lisette & Henry": guests type the ampersand any which way. */
const spaceAmp = (s: string): string => s.replace(/\s*&\s*/g, ' & ').trim();

/**
 * The naming rule. `size` is the party size as stored ("4 Guests"):
 *   2+ guests, full name → "John Smith & Party"
 *   2+ guests, first only → "John & Party"
 *   1 guest              → "John Smith"
 *   no name at all       → "Reserved"
 */
export function partyName(first: string | undefined, last: string | undefined, size: string | undefined): string {
  const f = spaceAmp(niceCase(first));
  const l = spaceAmp(niceCase(last));
  const full = [f, l].filter(Boolean).join(' ');
  if (!full) return 'Reserved';
  return partyCount(size) >= 2 ? `${full} & Party` : full;
}

/** "Party of 4" · '' when the size is missing or unreadable. */
export function partyLine(size: string | undefined): string {
  const n = partyCount(size);
  return n ? `Party of ${n}` : '';
}

/* Occasions worth a line on the card, read from free-text notes. First match
   wins, so the more specific patterns sit above the generic "celebrate". Thai
   spellings included because guests book in Thai through Aileen. `theme`
   is the artwork set the note points at (lib/guestCardArt.ts). */
const NOTE_OCCASIONS: { re: RegExp; line: string; theme: OccasionKey }[] = [
  { re: /\b(birthday|bday|b-day|happy\s*bday)\b|วันเกิด/i, line: 'Happy Birthday!', theme: 'birthday' },
  { re: /\banniversar(y|ies)\b|ครบรอบ/i, line: 'Happy Anniversary!', theme: 'anniversary' },
  { re: /\b(engagement|engaged|propose|proposal)\b|ขอแต่งงาน|หมั้น/i, line: 'Congratulations!', theme: 'anniversary' },
  { re: /\b(wedding|honeymoon)\b|แต่งงาน|ฮันนีมูน/i, line: 'Congratulations!', theme: 'anniversary' },
  { re: /\b(graduat\w*)\b|จบการศึกษา|รับปริญญา/i, line: 'Congratulations, Graduate!', theme: 'celebration' },
  { re: /\b(promotion|new\s*job|retirement|retiring)\b|เลื่อนขั้น|เกษียณ/i, line: 'Congratulations!', theme: 'celebration' },
  { re: /\b(celebrat\w*|special\s*occasion)\b|ฉลอง|โอกาสพิเศษ/i, line: 'Here’s to the celebration!', theme: 'celebration' },
  { re: /\b(family|reunion|relatives|grandma|grandpa|parents)\b|ครอบครัว|ญาติ/i, line: '', theme: 'family' },
  { re: /\b(friends?|girls'?\s*night|guys'?\s*night|night\s*out)\b|เพื่อน/i, line: '', theme: 'friends' },
  { re: /\b(business|meeting|work\s*dinner|corporate|clients?|team\s*dinner|company)\b|ประชุม|บริษัท/i, line: '', theme: 'business' },
];

/** A note that negates the occasion ("no birthday song please") never becomes a line. */
const negated = (s: string) => /\b(no|not|don'?t|without)\b[^.;]{0,24}(birthday|anniversar|celebrat|song|sing)/i.test(s);

/**
 * The occasion behind a booking: the explicit field first (the form's
 * dropdown / Aileen's tool), then the free-text notes. Returns the card line
 * and the artwork theme. Deliberately quiet: nothing recognised → no line,
 * general artwork, and the team can still type a line in before printing.
 */
export function occasionOf(notes: string | undefined, explicit?: string | undefined): { line: string; theme: OccasionKey | '' } {
  const key = normalizeOccasion(explicit);
  if (key) return { line: occasionByKey(key)?.line ?? '', theme: key };
  const s = tidy(notes);
  if (!s || negated(s)) return { line: '', theme: '' };
  for (const o of NOTE_OCCASIONS) if (o.re.test(s)) return { line: o.line, theme: o.theme };
  return { line: '', theme: '' };
}

/** Card line only — kept for callers that just want the words. */
export function occasionLine(notes: string | undefined, explicit?: string | undefined): string {
  return occasionOf(notes, explicit).line;
}

/** '19:00' → '7:00 PM'. Already-pretty or unparseable values pass through. */
export function prettyTime(raw: string | undefined): string {
  const s = tidy(raw);
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return s;
  const h = Number(m[1]);
  const min = m[2];
  if (h > 23 || Number(min) > 59) return s;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${min} ${ampm}`;
}

/** '2026-09-19' → 'Saturday, September 19' — the header above the card list. */
export function prettyLongDate(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tidy(ymd));
  if (!m) return tidy(ymd);
  try {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return tidy(ymd);
  }
}

/**
 * Today's date at the RESTAURANT, as YYYY-MM-DD. The page may be open on a
 * phone in another time zone (and the server runs in UTC), so "today" has to
 * be asked of Huntington Beach, never of the device clock's own calendar —
 * otherwise an 8 PM Friday service looks up Saturday's bookings.
 */
export function todayInLA(now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const y = get('year');
    const mo = get('month');
    const d = get('day');
    if (y && mo && d) return `${y}-${mo}-${d}`;
  } catch {
    /* fall through */
  }
  return now.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD by whole days — the ‹ › arrows on the date picker. */
export function addDays(ymd: string, delta: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tidy(ymd));
  if (!m) return ymd;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Minutes since midnight, for sorting a service by seating time. */
function timeRank(raw: string | undefined): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(tidy(raw));
  if (!m) return 24 * 60 + 1; // unknown times sink to the bottom
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * The line under the name that says why the card is there at all. One string,
 * used by the print page, the PDF and /stats/cards alike so every tent on
 * every table reads the same. Owner-approved copy — change it here only.
 */
export const CARD_THANKS = 'Welcome to our table — thank you for joining us.';

/** One reservation → one card. The same rulebook `cardsForDate` uses. */
export function cardFromSource(r: CardSource, fallbackId = 'card'): GuestCard {
  const occ = occasionOf(r.notes, r.occasion);
  return {
    id: tidy(r.id) || fallbackId,
    name: partyName(r.first_name, r.last_name, r.party_size),
    time: prettyTime(r.time),
    party: partyLine(r.party_size),
    occasion: occ.line,
    theme: occ.theme,
    notes: tidy(r.notes),
  };
}

/**
 * File name for the archived PDF: "2026-09-27 19-00 John Smith & Party.pdf".
 * Sorts by service date and time inside the Drive folder, and the name is
 * readable without opening the file. Characters Drive/Windows dislike are
 * dropped rather than escaped.
 */
export function cardFileName(r: CardSource, card: GuestCard = cardFromSource(r)): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(tidy(r.date)) ? tidy(r.date) : 'undated';
  const time = tidy(r.time).replace(':', '-') || '';
  const name = card.name.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return [date, time, name].filter(Boolean).join(' ') + '.pdf';
}

/**
 * Confirmed bookings for one service day, earliest seating first, turned into
 * cards. Only `status: 'confirmed'` records qualify: an unconfirmed request is
 * a table we have not promised, and a card on that table is a promise.
 */
export function cardsForDate(reservations: CardSource[], ymd: string): GuestCard[] {
  return reservations
    .filter((r) => tidy(r.status) === 'confirmed' && tidy(r.date) === tidy(ymd))
    .sort((a, b) => timeRank(a.time) - timeRank(b.time))
    .map((r, i) => cardFromSource(r, `resv-${i}`));
}
