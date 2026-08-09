/**
 * Guest-facing email for Narwhal Thai Table.
 *
 * WHY THIS EXISTS: Netlify Forms only notifies US (reservations@narwhalthaihb.com).
 * It cannot email the guest. So every guest-facing email goes through a small
 * Apps Script web app running under welcome@narwhalthaihb.com (same keyless
 * pattern as the Toast sales-sync endpoint — the Workspace org blocks service
 * account keys). Source of that script: D:\projects\narwhal-mailer\Code.gs
 *
 * Two moments, two emails:
 *   1) sendReservationReceived()  — instantly, when a request comes in.
 *      "We've got it, it is not confirmed yet, we'll email you when it is."
 *   2) sendReservationConfirmed() — when the team hits Confirm in /stats.
 *      "Your table is confirmed."
 *
 * Everything here is best-effort and NEVER throws: a mail failure must never
 * cost us the booking itself.
 *
 * ENV (set in Netlify → Site settings → Environment variables):
 *   GUEST_MAIL_URL   = the Apps Script /exec web-app URL
 *   GUEST_MAIL_TOKEN = shared secret, must match TOKEN inside Code.gs
 */

const MAIL_URL = process.env.GUEST_MAIL_URL || '';
const MAIL_TOKEN = process.env.GUEST_MAIL_TOKEN || '';
const TIMEOUT_MS = 8000;

const PHONE = '(714) 378-6003';
const PHONE_HREF = '+17143786003';
const ADDRESS = '19072 Beach Blvd, Huntington Beach, CA 92648';
const MAP_URL = 'https://maps.google.com/?q=19072+Beach+Blvd,+Huntington+Beach,+CA+92648';
const SITE = 'https://narwhalthaihb.com';
const REPLY_TO = 'reservations@narwhalthaihb.com';

const NAVY = '#0B1F33';
const BRASS = '#B08D3C';
const BRASS_LIGHT = '#D4B36A';
const OFF_WHITE = '#F5F0E6';

export type GuestMailResult = { sent: boolean; error?: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export const looksLikeEmail = (v: string | undefined): boolean => EMAIL_RE.test((v ?? '').trim());

function esc(v: string | undefined): string {
  return (v ?? '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** '2026-08-15' → 'Sat, Aug 15, 2026'. Anything else passes through untouched. */
export function prettyDate(raw: string): string {
  const s = (raw || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return s;
  try {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return s;
  }
}

/** '19:00' → '7:00 PM'. Anything else passes through untouched. */
export function prettyTime(raw: string): string {
  const s = (raw || '').trim();
  const m = /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return s;
  const h = Number(m[1]);
  const min = m[2];
  if (h > 23 || Number(min) > 59) return s;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${min} ${ampm}`;
}

/** Fire one email through the Apps Script mailer. Never throws. */
async function send(opts: { to: string; subject: string; html: string; text: string }): Promise<GuestMailResult> {
  if (!MAIL_URL || !MAIL_TOKEN) return { sent: false, error: 'mailer not configured' };
  if (!looksLikeEmail(opts.to)) return { sent: false, error: 'no valid recipient' };
  try {
    const res = await fetch(MAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: MAIL_TOKEN,
        to: opts.to.trim(),
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        replyTo: REPLY_TO,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { sent: false, error: `mailer http ${res.status}` };
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!body?.ok) return { sent: false, error: body?.error || 'mailer said no' };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'mailer unreachable' };
  }
}

/* ── Template ─────────────────────────────────────────────────────────────
   Table-based, inline styles only, ~560px — the shape that survives Gmail,
   Apple Mail and Outlook alike. Dark navy card on a light page so it reads
   fine in both light and dark clients.                                     */

type Row = { k: string; v: string };

function shell(o: { preheader: string; eyebrow: string; headline: string; intro: string; rows: Row[]; note?: string; footNote: string }): string {
  const rows = o.rows
    .filter((r) => r.v)
    .map(
      (r) => `
            <tr>
              <td style="padding:7px 0;font:12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,240,230,.55);width:120px;vertical-align:top;">${esc(r.k)}</td>
              <td style="padding:7px 0;font:16px/1.45 Helvetica,Arial,sans-serif;color:${OFF_WHITE};font-weight:600;">${esc(r.v)}</td>
            </tr>`,
    )
    .join('');

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.headline)}</title></head>
<body style="margin:0;padding:0;background:#EFEAE0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(o.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEAE0;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${NAVY};border-radius:16px;overflow:hidden;">

        <tr><td style="padding:30px 30px 6px;">
          <div style="font:12px/1 Helvetica,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:${BRASS_LIGHT};">${esc(o.eyebrow)}</div>
          <div style="font:700 25px/1.25 Georgia,'Times New Roman',serif;color:${OFF_WHITE};margin-top:10px;">${esc(o.headline)}</div>
          <div style="font:15px/1.6 Helvetica,Arial,sans-serif;color:rgba(245,240,230,.78);margin-top:12px;">${o.intro}</div>
        </td></tr>

        <tr><td style="padding:16px 30px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(200,162,78,.25);border-bottom:1px solid rgba(200,162,78,.25);padding:6px 0;">
            ${rows}
          </table>
        </td></tr>
        ${
          o.note
            ? `<tr><td style="padding:14px 30px 0;">
          <div style="font:14px/1.6 Helvetica,Arial,sans-serif;color:rgba(245,240,230,.78);background:rgba(255,255,255,.05);border-left:3px solid ${BRASS};border-radius:0 8px 8px 0;padding:11px 14px;">${o.note}</div>
        </td></tr>`
            : ''
        }

        <tr><td style="padding:20px 30px 4px;">
          <div style="font:14px/1.65 Helvetica,Arial,sans-serif;color:rgba(245,240,230,.72);">${o.footNote}</div>
        </td></tr>

        <tr><td style="padding:22px 30px 30px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:999px;background:${BRASS};">
              <a href="tel:${PHONE_HREF}" style="display:inline-block;padding:11px 22px;font:600 14px Helvetica,Arial,sans-serif;color:${NAVY};text-decoration:none;">Call ${PHONE}</a>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:0 30px 30px;border-top:1px solid rgba(200,162,78,.18);">
          <div style="font:600 15px/1.4 Georgia,'Times New Roman',serif;color:${OFF_WHITE};padding-top:20px;">Narwhal Thai Table</div>
          <div style="font:13px/1.65 Helvetica,Arial,sans-serif;color:rgba(245,240,230,.55);margin-top:5px;">
            <a href="${MAP_URL}" style="color:${BRASS_LIGHT};text-decoration:none;">${ADDRESS}</a><br>
            <a href="${SITE}" style="color:${BRASS_LIGHT};text-decoration:none;">narwhalthaihb.com</a> &middot; ${PHONE}
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

function plain(lines: (string | false | undefined)[]): string {
  return lines.filter(Boolean).join('\n') + `\n\nNarwhal Thai Table\n${ADDRESS}\n${PHONE} · ${SITE}\n`;
}

export type ReservationMail = {
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  party_size: string;
  notes?: string;
};

const guests = (n: string): string => {
  const t = (n || '').trim();
  return /^\d+$/.test(t) ? `${t} ${Number(t) === 1 ? 'guest' : 'guests'}` : t;
};

const detailRows = (r: ReservationMail): Row[] => [
  { k: 'Date', v: prettyDate(r.date) },
  { k: 'Time', v: prettyTime(r.time) },
  { k: 'Party', v: guests(r.party_size) },
  { k: 'Name', v: [r.first_name, r.last_name].filter(Boolean).join(' ') },
  { k: 'Phone', v: r.phone || '' },
  { k: 'Notes', v: r.notes || '' },
];

/** 1) Sent the moment a request arrives — from the site form, Aileen chat or the phone line. */
export async function sendReservationReceived(r: ReservationMail): Promise<GuestMailResult> {
  const when = `${prettyDate(r.date)} at ${prettyTime(r.time)}`;
  const html = shell({
    preheader: `We received your table request for ${when}. We'll confirm shortly.`,
    eyebrow: 'Request received',
    headline: `Thank you, ${esc(r.first_name) || 'friend'} — we've got your request`,
    intro: `Here is what came through. <strong style="color:${OFF_WHITE};">This is a request, not a confirmed table yet</strong> — our team looks at every booking by hand, and you'll get one more email from us the moment it's confirmed.`,
    rows: detailRows(r),
    footNote: `Need to change something, or no longer need the table? Just reply to this email or give us a call — we'd much rather know.`,
  });
  const text = plain([
    `Thank you, ${r.first_name} — we've got your table request.`,
    '',
    `Date: ${prettyDate(r.date)}`,
    `Time: ${prettyTime(r.time)}`,
    `Party: ${guests(r.party_size)}`,
    r.phone && `Phone: ${r.phone}`,
    r.notes && `Notes: ${r.notes}`,
    '',
    "This is a request, not a confirmed table yet. Our team reviews every booking by hand and you'll get one more email the moment it's confirmed.",
    '',
    'Need to change or cancel? Reply to this email or call ' + PHONE + '.',
  ]);
  return send({ to: r.email, subject: `We've got your table request — ${when}`, html, text });
}

/** 2) Sent when the team hits Confirm in the Control Room. */
export async function sendReservationConfirmed(r: ReservationMail, teamNote?: string): Promise<GuestMailResult> {
  const when = `${prettyDate(r.date)} at ${prettyTime(r.time)}`;
  const html = shell({
    preheader: `Your table on ${when} is confirmed. See you soon.`,
    eyebrow: 'Confirmed',
    headline: `Your table is confirmed, ${esc(r.first_name) || 'friend'}`,
    intro: `We're looking forward to having you. Everything below is set — nothing else for you to do.`,
    rows: detailRows(r),
    note: teamNote ? esc(teamNote) : undefined,
    footNote: `Running late, or plans changed? A quick call or a reply to this email is all we need — it lets us give the table to someone else in the meantime.`,
  });
  const text = plain([
    `Your table is confirmed, ${r.first_name}.`,
    '',
    `Date: ${prettyDate(r.date)}`,
    `Time: ${prettyTime(r.time)}`,
    `Party: ${guests(r.party_size)}`,
    r.notes && `Notes: ${r.notes}`,
    teamNote && `\nFrom the team: ${teamNote}`,
    '',
    'Running late or plans changed? Reply to this email or call ' + PHONE + '.',
  ]);
  return send({ to: r.email, subject: `Confirmed — your table on ${when}`, html, text });
}
