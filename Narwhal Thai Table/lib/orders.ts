/**
 * Dine-in order requests taken by Aileen (the chat host).
 *
 * Guests seated at a table order in chat; the order lands in a Netlify Blobs
 * queue as "pending". Staff see it on /orders (token-gated), approve it, and
 * key it into the Toast handheld. The kitchen only starts after that human
 * approval — Aileen never fires anything to the kitchen and takes no payment.
 * (When Toast partner API write access lands, submitOrder is the single place
 * to swap in real order injection.)
 */
import { getStore } from '@netlify/blobs';

export const ORDERS_STORE = 'aileen-orders';
export const ORDERS_KEY = 'list';
const MAX = 500;

export type OrderItem = {
  item: string;
  qty: number;
  protein?: string;
  spice?: string;
  notes?: string;
};

export type OrderInput = {
  table: string;
  items: OrderItem[];
  guest_name?: string;
  notes?: string;
};

export type OrderStatus = 'pending' | 'approved' | 'done' | 'cancelled';

export type OrderRecord = OrderInput & {
  id: string;
  ts: string;
  status: OrderStatus;
};

export type OrderResult = { ok: boolean; id: string };

function makeId(): string {
  return 'O' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 90 + 10);
}

async function readAll(): Promise<OrderRecord[]> {
  const store = getStore({ name: ORDERS_STORE, consistency: 'strong' });
  const arr = await store.get(ORDERS_KEY, { type: 'json' });
  return Array.isArray(arr) ? (arr as OrderRecord[]) : [];
}

async function writeAll(list: OrderRecord[]): Promise<void> {
  const store = getStore({ name: ORDERS_STORE, consistency: 'strong' });
  await store.setJSON(ORDERS_KEY, list.slice(-MAX));
}

export async function submitOrder(input: OrderInput): Promise<OrderResult> {
  const id = makeId();
  try {
    const list = await readAll();
    list.push({ ...input, id, ts: new Date().toISOString(), status: 'pending' });
    await writeAll(list);
    return { ok: true, id };
  } catch (e) {
    console.error('submitOrder failed', e);
    return { ok: false, id };
  }
}

export async function listOrders(): Promise<OrderRecord[]> {
  try {
    return (await readAll()).slice().reverse(); // newest first
  } catch {
    return [];
  }
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  try {
    const list = await readAll();
    const rec = list.find((o) => o.id === id);
    if (!rec) return false;
    rec.status = status;
    await writeAll(list);
    return true;
  } catch (e) {
    console.error('setOrderStatus failed', e);
    return false;
  }
}
