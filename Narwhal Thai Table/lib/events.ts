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
import type { Locale } from './i18n/locales';

export type LocalEvent = {
  from: string; // YYYY-MM-DD, first day the note shows
  to: string; // YYYY-MM-DD, last day the note shows
  label: string;
  note: string;
  /** Optional site-wide decoration while the event is on (components/fx/AirshowLayer):
   *  'airshow' = jets + smoke trails, 'halloween' = little white ghosts. */
  fx?: 'airshow' | 'halloween';
  /** Last day of the decoration when it should outlive the event itself
   *  (YYYY-MM-DD, inclusive). Defaults to `to`. The AI note and the chip
   *  always stop at `to` — only the decoration runs on. */
  fxTo?: string;
  /** Optional one-line chip under the hero hours, with where it links.
   *  `icon` is the glyph in front (default ✈); `i18n` overrides `text` per
   *  edition — editions without an entry fall back to the English text. */
  chip?: { text: string; href: string; icon?: string; i18n?: Partial<Record<Locale, string>> };
};

export const EVENTS: LocalEvent[] = [
  {
    from: '2026-09-30', // a day early so the phone prompt synced tonight already carries it
    to: '2026-10-04',
    label: 'Pacific Airshow weekend',
    fx: 'airshow',
    fxTo: '2026-10-11', // owner (1 Oct): jets on every page "ถึงอาทิตย์หน้า" — through Sunday the 11th
    chip: { text: 'Pacific Airshow weekend, Oct 2–4 — open all weekend, parking on site. Reserve a table →', href: '/contact/reservation' },
    note:
      'The Pacific Airshow is on at Huntington Beach Friday–Sunday, October 2–4, 2026, flying about 10:30 AM – 4:30 PM each day, centred at Huntington St & Pacific Coast Highway, about five minutes down Beach Blvd from us. We are OPEN with normal hours all weekend. Expect very heavy traffic on Beach Blvd and PCH, especially 8–11 AM heading to the beach and 4:30–7:30 PM leaving it; downtown and beach parking is scarce. Our plaza lot is for our guests — mention it as a plus (park once, eat, no PCH traffic). Dinner right after the last flight (about 4:30–8 PM) is the busiest time: warmly suggest reserving a table for the evening or ordering pickup ahead through the online ordering page, and be honest that walk-in waits and delivery times can run longer than usual that weekend.',
  },
  {
    // Owner (26 Oct 2026): "เอาเป็นตีมฮาโลวีน … มีฟักหัวเราะลอยไปมา", then
    // "ยังไม่สวยครับ เอาเป็นผี ghost สีขาวก็ได้" — little white ghosts drifting
    // across the top of every page, through the weekend after Halloween;
    // the chip and the hosts' note stop on the 31st.
    from: '2026-10-26',
    to: '2026-10-31',
    label: 'Halloween',
    fx: 'halloween',
    fxTo: '2026-11-01',
    chip: {
      icon: '👻',
      href: '/contact/reservation',
      text: 'Happy Halloween from our table — open as always, Halloween night included. Save a seat →',
      i18n: {
        th: 'สุขสันต์วันฮาโลวีนจากโต๊ะของเรา — เปิดตามปกติ รวมคืนวันที่ 31 ด้วย จองโต๊ะไว้ก่อน →',
        vi: 'Chúc mừng Halloween từ bàn ăn của chúng tôi — mở cửa như thường lệ, kể cả đêm 31. Giữ chỗ trước →',
        zh: '万圣节快乐 — 我们照常营业，万圣夜也不例外。预订座位 →',
        'zh-tw': '萬聖節快樂 — 我們照常營業，萬聖夜也不例外。預訂座位 →',
        ko: '해피 핼러윈 — 10월 31일 밤에도 평소처럼 영업합니다. 자리 예약하기 →',
        ja: 'ハッピーハロウィン — 10月31日の夜も通常どおり営業しています。席のご予約はこちら →',
        es: 'Feliz Halloween de nuestra mesa — abrimos como siempre, también la noche del 31. Reserva tu mesa →',
      },
    },
    note:
      'Halloween is Saturday, October 31, 2026. We are OPEN with normal hours that day and all week. There is no special Halloween menu, event, costume contest, candy or discount — the little white ghosts floating on the website are decoration only, so never promise treats or offers. If a guest asks about Halloween plans, say warmly that we are open as usual and would love to seat them that evening; Saturday dinner tends to be busy, so suggest reserving a table or ordering pickup ahead through the online ordering page.',
  },
];

/** Events whose window covers today (restaurant local day). */
export function activeEvents(now: Date = new Date()): LocalEvent[] {
  const today = todayPT(now);
  return EVENTS.filter((e) => e.from <= today && today <= e.to);
}

/** The decoration to show today, if any — an event's `fx` within from..(fxTo ?? to). */
export function activeFx(now: Date = new Date()): LocalEvent['fx'] | undefined {
  const today = todayPT(now);
  return EVENTS.find((e) => e.fx && e.from <= today && today <= (e.fxTo ?? e.to))?.fx;
}

/** Prompt lines for the AI hosts. Empty when no event window is active. */
export function eventsForPrompt(now: Date = new Date()): string {
  return activeEvents(now)
    .map((e) => `${e.label.toUpperCase()}: ${e.note}`)
    .join(' ');
}
