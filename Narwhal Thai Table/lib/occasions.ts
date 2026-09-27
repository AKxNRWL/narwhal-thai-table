/**
 * Special occasions a reservation can carry — one small vocabulary shared by
 * the booking form, Aileen's reservation tool, the owner tools and the
 * welcome cards, so "birthday" means the same thing everywhere.
 *
 * Owner, 26 Sep 2026: the form and Aileen ask for the occasion (optional);
 * a known occasion picks the card artwork from that occasion's set, and adds
 * the matching line under the guest's name. Unknown → the general set.
 *
 * `line` is customer-facing copy printed on the table: only owner-approved
 * lines go here. Family / friends / business get themed art but no line
 * until the owner has signed off on wording for them.
 */

export type OccasionKey = 'birthday' | 'anniversary' | 'celebration' | 'family' | 'friends' | 'business';

export type Occasion = {
  key: OccasionKey;
  /** English label — what the team reads in emails / the Control Room. */
  label: string;
  /** Thai label for the HQ app. */
  th: string;
  emoji: string;
  /** Line printed on the card, '' = none. */
  line: string;
};

export const OCCASIONS: Occasion[] = [
  { key: 'birthday', label: 'Birthday', th: 'วันเกิด', emoji: '🎂', line: 'Happy Birthday!' },
  { key: 'anniversary', label: 'Anniversary', th: 'ครบรอบ', emoji: '💍', line: 'Happy Anniversary!' },
  { key: 'celebration', label: 'Graduation / celebration', th: 'เรียนจบ / ฉลองความสำเร็จ', emoji: '🎓', line: 'Congratulations!' },
  { key: 'family', label: 'Family gathering', th: 'รวมญาติ / ครอบครัว', emoji: '👪', line: '' },
  { key: 'friends', label: 'Friends night out', th: 'รวมเพื่อน', emoji: '🥂', line: '' },
  { key: 'business', label: 'Business dinner', th: 'งาน / ประชุม', emoji: '💼', line: '' },
];

const BY_KEY = new Map(OCCASIONS.map((o) => [o.key, o]));

export function occasionByKey(key: string | undefined | null): Occasion | undefined {
  return key ? BY_KEY.get(key as OccasionKey) : undefined;
}

/**
 * Accept what a form, a tool call or an old record might send and reduce it
 * to a known key — or '' when it is nothing we recognise. Tolerant on
 * purpose: Aileen may pass "Birthday dinner", a guest may type "anniv".
 */
export function normalizeOccasion(v: unknown): OccasionKey | '' {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s || s === 'none' || s === 'no' || s === 'n/a') return '';
  if (BY_KEY.has(s as OccasionKey)) return s as OccasionKey;
  if (/birth|bday|b-day|วันเกิด/.test(s)) return 'birthday';
  if (/anniv|ครบรอบ|wedding|honeymoon|engag|propos|แต่งงาน|หมั้น/.test(s)) return 'anniversary';
  if (/gradu|promot|retire|new job|celebrat|congrat|achiev|success|จบ|ปริญญา|เลื่อน|เกษียณ|ฉลอง/.test(s)) return 'celebration';
  if (/family|reunion|relativ|ครอบครัว|ญาติ/.test(s)) return 'family';
  if (/friend|night out|girls|guys|เพื่อน/.test(s)) return 'friends';
  if (/business|meeting|work|corporate|client|team|company|ประชุม|งาน|บริษัท/.test(s)) return 'business';
  return '';
}
