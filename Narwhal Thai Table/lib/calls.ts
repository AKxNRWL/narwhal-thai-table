/**
 * "Call a server" requests from dine-in guests (via Aileen).
 *
 * Soft-opening flow: Aileen does NOT take dine-in orders in chat (there is no
 * pipe into the Toast handhelds yet). Instead, when a seated guest is ready to
 * order — or needs water, the check, anything — Aileen fires a call here. The
 * staff display at /calls (token-gated) shows which table is calling and how
 * long they've waited; a server walks over and keys the order into the Toast
 * handheld at the table.
 */
import { getStore } from '@netlify/blobs';

export const CALLS_STORE = 'table-calls';
export const CALLS_KEY = 'list';
const MAX = 300;

export type CallStatus = 'waiting' | 'acked';

export type CallRecord = {
  id: string;
  table: string;
  reason?: string;
  ts: string;
  status: CallStatus;
};

function makeId(): string {
  return 'C' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 90 + 10);
}

async function readAll(): Promise<CallRecord[]> {
  const store = getStore({ name: CALLS_STORE, consistency: 'strong' });
  const arr = await store.get(CALLS_KEY, { type: 'json' });
  return Array.isArray(arr) ? (arr as CallRecord[]) : [];
}

async function writeAll(list: CallRecord[]): Promise<void> {
  const store = getStore({ name: CALLS_STORE, consistency: 'strong' });
  await store.setJSON(CALLS_KEY, list.slice(-MAX));
}

export async function submitCall(table: string, reason?: string): Promise<{ ok: boolean; id: string }> {
  const id = makeId();
  try {
    const list = await readAll();
    // Debounce: if this table already has an open call, refresh it instead of stacking.
    const open = list.find((c) => c.table === table && c.status === 'waiting');
    if (open) {
      open.ts = new Date().toISOString();
      if (reason) open.reason = reason.slice(0, 120);
      await writeAll(list);
      return { ok: true, id: open.id };
    }
    list.push({ id, table: table.slice(0, 12), reason: reason?.slice(0, 120), ts: new Date().toISOString(), status: 'waiting' });
    await writeAll(list);
    return { ok: true, id };
  } catch (e) {
    console.error('submitCall failed', e);
    return { ok: false, id };
  }
}

export async function listCalls(): Promise<CallRecord[]> {
  try {
    return (await readAll()).slice().reverse(); // newest first
  } catch {
    return [];
  }
}

export async function ackCall(id: string): Promise<boolean> {
  try {
    const list = await readAll();
    const rec = list.find((c) => c.id === id);
    if (!rec) return false;
    rec.status = 'acked';
    await writeAll(list);
    return true;
  } catch (e) {
    console.error('ackCall failed', e);
    return false;
  }
}
