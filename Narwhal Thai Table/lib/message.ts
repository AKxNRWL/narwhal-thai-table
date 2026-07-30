/**
 * General message submission for Aileen (the chat host).
 *
 * When a guest wants to say hello, leave a compliment, give feedback, ask the
 * team something, or be contacted by email, the chat route calls submitMessage(),
 * which mirrors submitReservation():
 *   1) POSTs to the existing Netlify "contact" form (/__forms.html) so the
 *      already-configured email notification fires to welcome@narwhalthaihb.com.
 *   2) Appends a record to a Netlify Blobs store (aileen-messages) as a backup.
 *
 * Returns ok=true if EITHER channel succeeded.
 */
import { getStore } from '@netlify/blobs';
import { upsertCustomer } from './customers';

export const MSG_STORE = 'aileen-messages';
export const MSG_KEY = 'list';
const MAX = 1000;

export type MessageInput = {
  name: string;
  email: string;
  message: string;
  topic?: string;
  phone?: string;
  /** Where the message came from — 'chat' (website) or 'phone' (Aileen call line). */
  source?: 'chat' | 'phone';
};

export type MessageResult = { ok: boolean; id: string; emailed: boolean; stored: boolean };

const SITE = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://narwhalthaihb.com';

const clip = (s: string | undefined, n = 200): string =>
  (s ?? '').toString().replace(/\s+/g, ' ').trim().slice(0, n);

export async function submitMessage(input: MessageInput): Promise<MessageResult> {
  const id = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const via = input.source === 'phone' ? 'Aileen phone line' : 'Aileen chat';
  const rec = {
    id,
    ts: new Date().toISOString(),
    source: input.source === 'phone' ? 'aileen-phone' : 'aileen-chat',
    name: clip(input.name, 80),
    email: clip(input.email, 120),
    phone: clip(input.phone, 40),
    topic: clip(input.topic, 80) || `Message via ${via}`,
    message: clip(input.message, 1200),
  };

  let emailed = false;
  try {
    const params = new URLSearchParams({
      'form-name': 'contact',
      name: rec.name,
      email: rec.email,
      phone: rec.phone,
      topic: rec.topic,
      message: rec.message + ` — Sent via ${via}`,
    });
    const res = await fetch(`${SITE}/__forms.html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    emailed = res.ok;
  } catch {
    emailed = false;
  }

  let stored = false;
  try {
    const store = getStore({ name: MSG_STORE, consistency: 'strong' });
    const existing = (await store.get(MSG_KEY, { type: 'json' })) as unknown;
    const list = Array.isArray(existing) ? (existing as unknown[]) : [];
    list.push({ ...rec, emailed });
    await store.setJSON(MSG_KEY, list.slice(-MAX));
    stored = true;
  } catch {
    stored = false;
  }

  // Retention: remember the guest in the customer book (best-effort).
  await upsertCustomer({ name: rec.name, phone: rec.phone, email: rec.email, source: 'message' });

  return { ok: emailed || stored, id, emailed, stored };
}
