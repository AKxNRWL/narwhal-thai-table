'use client';

/**
 * จอเรียกพนักงาน — the dedicated staff display.
 *
 * Dine-in guests ask Aileen for service → a call lands here. This screen is
 * meant to sit on its own device (tablet / small monitor) where servers can
 * see it: BIG table numbers, how long each table has waited, a chime on every
 * new call. Tap a card when a server heads over — the order itself is taken
 * at the table on the Toast handheld.
 *
 * Token-gated with the same STATS_TOKEN as /stats and /orders
 * (open /calls?key=TOKEN once — it's remembered on the device).
 */
import { useEffect, useRef, useState } from 'react';

type CallRecord = { id: string; table: string; reason?: string; ts: string; status: 'waiting' | 'acked' };

const NAVY = '#0B1F33', CREAM = '#F5F0E6', GOLD = '#B08D3C', LINE = 'rgba(245,240,230,0.16)';

// Patio QR cards carry P1-P5, indoor tables carry 1-13. Show the zone as the
// small caption so a server reads "พาทิโอ / 3" instead of a cryptic "P3".
const PATIO = /^p-?(\d+)$/i;
const zoneOf = (t: string) => (PATIO.test(t) ? 'พาทิโอ' : 'โต๊ะ');
const seatOf = (t: string) => t.replace(PATIO, '$1');

const btn: React.CSSProperties = { padding: '10px 18px', borderRadius: 999, border: `1px solid ${LINE}`, cursor: 'pointer', fontSize: 14, fontWeight: 600 };

export default function CallsPage() {
  const [key, setKey] = useState('');
  const [entered, setEntered] = useState(false);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [err, setErr] = useState('');
  const [now, setNow] = useState(Date.now());
  const waitingCount = useRef(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('key');
    const saved = fromUrl || window.localStorage.getItem('nrwl-orders-key') || '';
    if (saved) { setKey(saved); setEntered(true); }
  }, []);

  // Live "waited X min" counter.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!entered || !key) return;
    let stop = false;
    const chime = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const ping = (freq: number, at: number) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; g.gain.value = 0.14;
          o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.28);
        };
        ping(880, 0); ping(1174, 0.18); // two-tone "ding-dong"
      } catch { /* silent */ }
    };
    const tick = async () => {
      try {
        const r = await fetch(`/api/calls?key=${encodeURIComponent(key)}`);
        if (r.status === 404) { setErr('โทเคนไม่ถูกต้อง'); setEntered(false); return; }
        const d = (await r.json()) as { calls?: CallRecord[] };
        if (stop) return;
        const list = d.calls ?? [];
        const waiting = list.filter((c) => c.status === 'waiting').length;
        if (waiting > waitingCount.current) chime();
        waitingCount.current = waiting;
        setCalls(list); setErr('');
        window.localStorage.setItem('nrwl-orders-key', key);
      } catch { /* transient */ }
    };
    tick();
    const t = window.setInterval(tick, 5000);
    return () => { stop = true; window.clearInterval(t); };
  }, [entered, key]);

  async function ack(id: string) {
    setCalls((cs) => cs.map((c) => (c.id === id ? { ...c, status: 'acked' } : c)));
    await fetch(`/api/calls?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  }

  const waitedSec = (ts: string) => Math.max(0, Math.round((now - new Date(ts).getTime()) / 1000));
  const waitedLabel = (ts: string) => {
    const s = waitedSec(ts);
    return s < 60 ? `${s} วิ` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} นาที`;
  };

  const waiting = calls.filter((c) => c.status === 'waiting').sort((a, b) => a.ts.localeCompare(b.ts)); // oldest first
  const recent = calls.filter((c) => c.status === 'acked').slice(0, 8);

  return (
    <main style={{ minHeight: '100vh', background: NAVY, color: CREAM, padding: '40px 22px 40px', fontFamily: 'Inter, Noto Sans Thai, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>🔔 จอเรียกพนักงาน</h1>
          <span style={{ fontSize: 13, opacity: 0.55 }}>ลูกค้ากดเรียกผ่าน Aileen — เดินไปรับออเดอร์ที่โต๊ะ แล้วคีย์ลง Toast handheld ได้เลย</span>
        </div>

        {!entered ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 24, maxWidth: 480 }}>
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="ใส่โทเคนพนักงาน"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${LINE}`, background: 'transparent', color: CREAM }} />
            <button style={{ ...btn, background: GOLD, color: NAVY, border: 'none' }} onClick={() => setEntered(true)}>เปิดจอ</button>
          </div>
        ) : (
          <>
            {err && <p style={{ color: '#ff9d76' }}>{err}</p>}

            {waiting.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '110px 0', opacity: 0.45 }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🐋</div>
                <div style={{ fontSize: 20 }}>ยังไม่มีโต๊ะเรียก — สบายๆ</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 26 }}>
                {waiting.map((c) => {
                  const urgent = waitedSec(c.ts) > 120; // > 2 นาที = แดง
                  return (
                    <button key={c.id} onClick={() => ack(c.id)}
                      style={{
                        background: urgent ? 'rgba(220,80,60,0.18)' : 'rgba(176,141,60,0.14)',
                        border: `2px solid ${urgent ? '#e2694f' : GOLD}`,
                        borderRadius: 18, padding: '26px 18px', cursor: 'pointer', color: CREAM,
                        textAlign: 'center', transition: 'transform 0.1s',
                      }}>
                      <div style={{ fontSize: 13, letterSpacing: '0.18em', opacity: 0.65 }}>{zoneOf(c.table)}</div>
                      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, color: urgent ? '#ffb49e' : '#e7c987' }}>{seatOf(c.table)}</div>
                      {c.reason && <div style={{ fontSize: 14, margin: '6px 0 2px', opacity: 0.85 }}>{c.reason}</div>}
                      <div style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>รอมา {waitedLabel(c.ts)}</div>
                      <div style={{ marginTop: 14, fontSize: 13, background: urgent ? '#e2694f' : GOLD, color: NAVY, borderRadius: 999, padding: '8px 0', fontWeight: 700 }}>
                        แตะเมื่อกำลังไป ✓
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {recent.length > 0 && (
              <>
                <h2 style={{ fontSize: 14, letterSpacing: '0.12em', opacity: 0.45, margin: '38px 0 10px' }}>รับแล้วล่าสุด</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {recent.map((c) => (
                    <span key={c.id} style={{ fontSize: 13, opacity: 0.5, border: `1px solid ${LINE}`, borderRadius: 999, padding: '6px 14px' }}>
                      {zoneOf(c.table)} {seatOf(c.table)} ✓
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
