'use client';

/**
 * Staff order queue — Aileen's dine-in order requests land here as "pending".
 * Approve → key the order into the Toast handheld → mark Done when served.
 * Token-gated with the same STATS_TOKEN as /stats (enter once, kept locally).
 */
import { useEffect, useRef, useState } from 'react';

type OrderItem = { item: string; qty: number; protein?: string; spice?: string; notes?: string };
type OrderRecord = {
  id: string; ts: string; status: 'pending' | 'approved' | 'done' | 'cancelled';
  table: string; items: OrderItem[]; guest_name?: string; notes?: string;
};

const NAVY = '#0B1F33', CREAM = '#F5F0E6', GOLD = '#B08D3C', LINE = 'rgba(245,240,230,0.16)';
const card: React.CSSProperties = { background: 'rgba(245,240,230,0.05)', border: `1px solid ${LINE}`, borderRadius: 14, padding: 16, marginBottom: 12 };
const btn: React.CSSProperties = { padding: '10px 18px', borderRadius: 999, border: `1px solid ${LINE}`, cursor: 'pointer', fontSize: 14, fontWeight: 600 };

export default function OrdersPage() {
  const [key, setKey] = useState('');
  const [entered, setEntered] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [err, setErr] = useState('');
  const pendingCount = useRef(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('key');
    const saved = fromUrl || window.localStorage.getItem('nrwl-orders-key') || '';
    if (saved) { setKey(saved); setEntered(true); }
  }, []);

  useEffect(() => {
    if (!entered || !key) return;
    let stop = false;
    const beep = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.12;
        o.start(); o.stop(ctx.currentTime + 0.25);
      } catch { /* silent */ }
    };
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders?key=${encodeURIComponent(key)}`);
        if (r.status === 404) { setErr('โทเคนไม่ถูกต้อง'); setEntered(false); return; }
        const d = (await r.json()) as { orders?: OrderRecord[] };
        if (stop) return;
        const list = d.orders ?? [];
        const pend = list.filter((o) => o.status === 'pending').length;
        if (pend > pendingCount.current) beep();
        pendingCount.current = pend;
        setOrders(list); setErr('');
        window.localStorage.setItem('nrwl-orders-key', key);
      } catch { /* transient */ }
    };
    tick();
    const t = window.setInterval(tick, 6000);
    return () => { stop = true; window.clearInterval(t); };
  }, [entered, key]);

  async function setStatus(id: string, status: string) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: status as OrderRecord['status'] } : o)));
    await fetch(`/api/orders?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  }

  const ago = (ts: string) => {
    const m = Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
    return m < 1 ? 'เมื่อกี้' : m < 60 ? `${m} นาทีที่แล้ว` : `${Math.floor(m / 60)} ชม. ${m % 60} น.`;
  };

  const pending = orders.filter((o) => o.status === 'pending');
  const approved = orders.filter((o) => o.status === 'approved');
  const rest = orders.filter((o) => o.status === 'done' || o.status === 'cancelled').slice(0, 10);

  const Item = ({ o }: { o: OrderRecord }) => {
    const togo = o.table === 'TOGO';
    return (
    <div style={togo ? { ...card, borderColor: 'rgba(176,141,60,0.55)' } : card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>
          {togo ? <>🥡 TO-GO{o.guest_name ? ` — ${o.guest_name}` : ''}</> : <>โต๊ะ {o.table}{o.guest_name ? ` · ${o.guest_name}` : ''}</>}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>{o.id} · {ago(o.ts)}</div>
      </div>
      {togo && o.status === 'pending' && (
        <div style={{ fontSize: 13, color: '#ffd27a', margin: '6px 0 0' }}>💵 เก็บเงินที่เคาน์เตอร์ก่อน แล้วค่อยกดรับเข้าครัว</div>
      )}
      <ul style={{ margin: '10px 0', paddingLeft: 18, lineHeight: 1.7 }}>
        {o.items.map((it, i) => (
          <li key={i}>
            <strong>{it.qty}×</strong> {it.item}
            {it.protein ? ` · ${it.protein}` : ''}{it.spice ? ` · ${it.spice}` : ''}
            {it.notes ? <em style={{ opacity: 0.7 }}> — {it.notes}</em> : null}
          </li>
        ))}
      </ul>
      {o.notes ? <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>หมายเหตุ: {o.notes}</div> : null}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {o.status === 'pending' && (
          <>
            <button style={{ ...btn, background: GOLD, color: NAVY, border: 'none' }} onClick={() => setStatus(o.id, 'approved')}>
              {togo ? 'เก็บเงินแล้ว → คีย์เข้า Toast' : 'รับออเดอร์ → คีย์เข้า Toast'}
            </button>
            <button style={{ ...btn, background: 'transparent', color: CREAM }} onClick={() => setStatus(o.id, 'cancelled')}>ยกเลิก</button>
          </>
        )}
        {o.status === 'approved' && (
          <button style={{ ...btn, background: 'transparent', color: CREAM, borderColor: GOLD }} onClick={() => setStatus(o.id, 'done')}>{togo ? 'รับของแล้ว ✓' : 'เสิร์ฟแล้ว ✓'}</button>
        )}
      </div>
    </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', background: NAVY, color: CREAM, padding: '90px 18px 60px', fontFamily: 'Inter, Noto Sans Thai, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>คิวออเดอร์จาก Aileen 🐋</h1>
        <p style={{ opacity: 0.65, fontSize: 13.5, marginBottom: 24 }}>
          ออเดอร์จากแชทจะขึ้นที่นี่เป็น &ldquo;รออนุมัติ&rdquo; — กดรับแล้วคีย์เข้า Toast handheld ครัวถึงเริ่มทำ (รีเฟรชเองทุก 6 วิ พร้อมเสียงเตือน)
        </p>
        {!entered ? (
          <div style={{ ...card, display: 'flex', gap: 10 }}>
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="ใส่โทเคนพนักงาน"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${LINE}`, background: 'transparent', color: CREAM }} />
            <button style={{ ...btn, background: GOLD, color: NAVY, border: 'none' }} onClick={() => setEntered(true)}>เข้าดูคิว</button>
          </div>
        ) : (
          <>
            {err && <p style={{ color: '#ff9d76' }}>{err}</p>}
            <h2 style={{ fontSize: 15, letterSpacing: '0.12em', opacity: 0.7, margin: '18px 0 10px' }}>รออนุมัติ ({pending.length})</h2>
            {pending.length ? pending.map((o) => <Item key={o.id} o={o} />) : <p style={{ opacity: 0.5, fontSize: 14 }}>ยังไม่มีออเดอร์ใหม่</p>}
            {approved.length > 0 && (
              <>
                <h2 style={{ fontSize: 15, letterSpacing: '0.12em', opacity: 0.7, margin: '26px 0 10px' }}>รับแล้ว / กำลังทำ ({approved.length})</h2>
                {approved.map((o) => <Item key={o.id} o={o} />)}
              </>
            )}
            {rest.length > 0 && (
              <>
                <h2 style={{ fontSize: 15, letterSpacing: '0.12em', opacity: 0.5, margin: '26px 0 10px' }}>ล่าสุด</h2>
                {rest.map((o) => (
                  <div key={o.id} style={{ ...card, opacity: 0.45, padding: 10 }}>
                    <span style={{ color: GOLD }}>{o.table === 'TOGO' ? `🥡 TO-GO${o.guest_name ? ' — ' + o.guest_name : ''}` : `โต๊ะ ${o.table}`}</span> · {o.items.map((i) => `${i.qty}× ${i.item}`).join(', ')} · {o.status === 'done' ? 'เสร็จแล้ว' : 'ยกเลิก'}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
