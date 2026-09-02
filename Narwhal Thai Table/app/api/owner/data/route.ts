import { getStore } from '@netlify/blobs';
import { requireOwner } from '@/lib/session';
import { jsonCors } from '@/lib/cors';
import { dataFor, getTenant, TENANT_NARWHAL_ID } from '@/lib/tenants';

export { OPTIONS } from '@/lib/cors';
import { listCustomers, segmentCustomers } from '@/lib/customers';
import { aggregateChatLogs } from '@/lib/statsAggregate';
import type { LogEntry } from '@/lib/chatLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Scoped owner data: chat stats + reservations + messages for the logged-in
   tenant only. Each tenant reads only its own blob keys (see dataFor). */

async function readArray<T>(storeName: string, key: string): Promise<T[]> {
  try {
    const store = getStore({ name: storeName, consistency: 'strong' });
    const arr = await store.get(key, { type: 'json' });
    return Array.isArray(arr) ? (arr as T[]) : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const sess = await requireOwner(req); // cookie (/stats) or Bearer HQ_GAME_TOKEN (HQ app)
  if (!sess) return jsonCors(req, { ok: false }, { status: 401 });
  const tenant = await getTenant(sess.tenantId);
  if (!tenant) return jsonCors(req, { ok: false }, { status: 401 });

  const loc = dataFor(tenant.id);
  const [logs, reservations, messages] = await Promise.all([
    readArray<LogEntry>(loc.chat.store, loc.chat.key),
    readArray<Record<string, unknown>>(loc.reservations.store, loc.reservations.key),
    readArray<Record<string, unknown>>(loc.messages.store, loc.messages.key),
  ]);

  // Customer book: pilot store is Narwhal-only for now (namespaced per-tenant
  // later, mirroring dataFor) — other tenants just see an empty book.
  const customers = tenant.id === TENANT_NARWHAL_ID ? await listCustomers() : [];

  return jsonCors(
    req,
    {
      ok: true,
      tenant: { id: tenant.id, name: tenant.name },
      stats: aggregateChatLogs(logs),
      reservations: reservations.slice(-50).reverse(),
      messages: messages.slice(-50).reverse(),
      customers: customers.slice(-200).reverse(),
      customerSegments: segmentCustomers(customers),
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
