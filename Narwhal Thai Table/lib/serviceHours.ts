/**
 * Single source of truth for the table-QR service window.
 *
 * Official hours (Aug 1 2026 — matches GBP / Yelp / Apple Maps and the
 * JSON-LD in app/layout.tsx):
 *   Mon–Fri 11:30–22:00 · Sat–Sun 12:00–22:00 (America/Los_Angeles)
 *
 * The QR gate opens 15 min before service and stays 60 min after close, so
 * guests being seated early or finishing a chat at close never hit the wall.
 * Outside this window a ?t= link is a saved link from an old visit — the
 * chat still works, just as plain web-visitor Aileen.
 *
 * UPDATE the HOURS table when the schedule changes (and keep the JSON-LD in
 * app/layout.tsx in sync). Used by app/api/chat/route.ts (server enforcement)
 * and components/ChatWidget.tsx (greeting only).
 */

type DayWindow = { open: number; close: number }; // minutes since midnight PT

const HOURS: Record<number, DayWindow> = {
  0: { open: 12 * 60, close: 22 * 60 }, // Sunday    12:00–22:00
  1: { open: 11 * 60 + 30, close: 22 * 60 }, // Monday    11:30–22:00
  2: { open: 11 * 60 + 30, close: 22 * 60 }, // Tuesday   11:30–22:00
  3: { open: 11 * 60 + 30, close: 22 * 60 }, // Wednesday 11:30–22:00
  4: { open: 11 * 60 + 30, close: 22 * 60 }, // Thursday  11:30–22:00
  5: { open: 11 * 60 + 30, close: 22 * 60 }, // Friday    11:30–22:00
  6: { open: 12 * 60, close: 22 * 60 }, // Saturday  12:00–22:00
};

const PRE_OPEN_MIN = 15; // guests seated a touch early still get table mode
const GRACE_AFTER_CLOSE_MIN = 60; // finish the chat after close

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** True while the restaurant is (about to be / just was) open, PT. Fail-open. */
export function serviceWindowNow(now: Date = new Date()): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const dow = DOW.indexOf(get('weekday'));
    const mins = Number(get('hour')) * 60 + Number(get('minute'));
    if (dow < 0 || Number.isNaN(mins)) return true;
    const w = HOURS[dow];
    return mins >= w.open - PRE_OPEN_MIN && mins < w.close + GRACE_AFTER_CLOSE_MIN;
  } catch {
    return true; // clock lookup failed — behave like normal open hours
  }
}
