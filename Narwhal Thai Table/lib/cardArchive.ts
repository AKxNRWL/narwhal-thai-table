import { cardFileName, cardFromSource, type CardSource, type GuestCard } from './guestCards';
import { renderCardPdf } from './guestCardPdf';

/**
 * Archive a reservation's card as a PDF in Google Drive (welcome@'s Drive,
 * folder "Narwhal Reservation Cards / YYYY-MM").
 *
 * The upload goes through the same Apps Script web app that sends guest mail
 * ("Narwhal Guest Mailer", source D:\projects\narwhal-mailer) — it runs as
 * welcome@ and can write to that account's Drive, and the site already holds
 * its URL + shared secret (GUEST_MAIL_URL / GUEST_MAIL_TOKEN). A request with
 * `action: 'card'` is a file drop; anything else is still a mail send.
 *
 * Best-effort and never throws: a card that fails to archive must not undo
 * a confirmation that already happened. The result is stored on the record
 * as `card: { fileId, url, name, at }` by the caller.
 */

const URL_ = process.env.CARDS_DRIVE_URL || process.env.GUEST_MAIL_URL || '';
const TOKEN = process.env.CARDS_DRIVE_TOKEN || process.env.GUEST_MAIL_TOKEN || '';
const TIMEOUT_MS = 12000; // rendering is local; the upload itself is one small POST

export type CardArchive = { fileId: string; url: string; name: string; folderUrl?: string; at: string };
export type ArchiveResult = { ok: true; card: CardArchive } | { ok: false; error: string };

export function archiveConfigured(): boolean {
  return Boolean(URL_ && TOKEN);
}

export async function archiveCard(rec: CardSource, card: GuestCard = cardFromSource(rec)): Promise<ArchiveResult> {
  if (!archiveConfigured()) return { ok: false, error: 'card archive not configured' };
  let pdf: Uint8Array;
  try {
    pdf = await renderCardPdf(card);
  } catch (e) {
    return { ok: false, error: 'render: ' + (e instanceof Error ? e.message : String(e)) };
  }
  const name = cardFileName(rec, card);
  const date = /^\d{4}-\d{2}-\d{2}$/.test((rec.date || '').trim()) ? (rec.date as string).trim() : '';
  try {
    const res = await fetch(URL_, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: TOKEN,
        action: 'card',
        name,
        month: date ? date.slice(0, 7) : 'undated',
        mime: 'application/pdf',
        data: Buffer.from(pdf).toString('base64'),
        description: [card.name, rec.date, rec.time, rec.party_size].filter(Boolean).join(' · '),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });
    if (!res.ok) return { ok: false, error: `drive http ${res.status}` };
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; id?: string; url?: string; folderUrl?: string } | null;
    if (!body?.ok || !body.id || !body.url) return { ok: false, error: body?.error || 'drive said no' };
    return { ok: true, card: { fileId: body.id, url: body.url, name, folderUrl: body.folderUrl, at: new Date().toISOString() } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'drive unreachable' };
  }
}
