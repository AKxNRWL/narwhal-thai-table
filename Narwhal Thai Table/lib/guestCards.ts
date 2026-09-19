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

export type CardSource = {
  id?: string;
  first_name?: string;
  last_name?: string;
  party_size?: string;
  date?: string;
  time?: string;
  notes?: string;
  status?: string;
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
  /** "Happy Birthday!" and friends — empty unless the notes said so. */
  occasion: string;
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

/**
 * The naming rule. `size` is the party size as stored ("4 Guests"):
 *   2+ guests, full name → "John Smith & Party"
 *   2+ guests, first only → "John & Party"
 *   1 guest              → "John Smith"
 *   no name at all       → "Reserved"
 */
export function partyName(first: string | undefined, last: string | undefined, size: string | undefined): string {
  const f = niceCase(first);
  const l = niceCase(last);
  const full = [f, l].filter(Boolean).join(' ');
  if (!full) return 'Reserved';
  return partyCount(size) >= 2 ? `${full} & Party` : full;
}

/** "Party of 4" · '' when the size is missing or unreadable. */
export function partyLine(size: string | undefined): string {
  const n = partyCount(size);
  return n ? `Party of ${n}` : '';
}

/* Occasions worth a line on the card. First match wins, so the more specific
   patterns sit above the generic "celebrate". Thai spellings included because
   guests book in Thai through Aileen. */
const OCCASIONS: { re: RegExp; line: string }[] = [
  { re: /\b(birthday|bday|b-day|happy\s*bday)\b|วันเกิด/i, line: 'Happy Birthday!' },
  { re: /\banniversar(y|ies)\b|ครบรอบ/i, line: 'Happy Anniversary!' },
  { re: /\b(engagement|engaged|propose|proposal)\b|ขอแต่งงาน|หมั้น/i, line: 'Congratulations!' },
  { re: /\b(wedding|honeymoon)\b|แต่งงาน|ฮันนีมูน/i, line: 'Congratulations!' },
  { re: /\b(graduat\w*)\b|จบการศึกษา|รับปริญญา/i, line: 'Congratulations, Graduate!' },
  { re: /\b(promotion|new\s*job|retirement|retiring)\b|เลื่อนขั้น|เกษียณ/i, line: 'Congratulations!' },
  { re: /\b(celebrat\w*|special\s*occasion)\b|ฉลอง|โอกาสพิเศษ/i, line: 'Here’s to the celebration!' },
];

/**
 * Read an occasion out of the booking notes. Deliberately quiet: no match
 * means no line, and the team can type one in before printing. We skip a
 * note that negates the occasion ("no birthday song please") so the card
 * never shouts something the guest asked us not to.
 */
export function occasionLine(notes: string | undefined): string {
  const s = tidy(notes);
  if (!s) return '';
  if (/\b(no|not|don'?t|without)\b[^.;]{0,24}(birthday|anniversar|celebrat|song|sing)/i.test(s)) return '';
  for (const o of OCCASIONS) if (o.re.test(s)) return o.line;
  return '';
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
 * Confirmed bookings for one service day, earliest seating first, turned into
 * cards. Only `status: 'confirmed'` records qualify: an unconfirmed request is
 * a table we have not promised, and a card on that table is a promise.
 */
export function cardsForDate(reservations: CardSource[], ymd: string): GuestCard[] {
  return reservations
    .filter((r) => tidy(r.status) === 'confirmed' && tidy(r.date) === tidy(ymd))
    .sort((a, b) => timeRank(a.time) - timeRank(b.time))
    .map((r, i) => ({
      id: tidy(r.id) || `resv-${i}`,
      name: partyName(r.first_name, r.last_name, r.party_size),
      time: prettyTime(r.time),
      party: partyLine(r.party_size),
      occasion: occasionLine(r.notes),
      notes: tidy(r.notes),
    }));
}
