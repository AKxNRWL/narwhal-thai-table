'use client';

import { useCallback, useEffect, useState } from 'react';

type Recent = {
  ts: string;
  lang: string;
  question: string;
  reply: string;
  dishes: string[];
  reservationIntent: boolean;
  flag: boolean;
};
type Stats = {
  total: number;
  languages: { th: number; en: number };
  reservationIntent: number;
  byDay: Record<string, number>;
  topRecommendedDishes: { name: string; count: number }[];
  flaggedCount: number;
  flagged: { ts: string; question: string }[];
  recent: Recent[];
};
type Rec = Record<string, unknown>;
type CouponT = { code: string; offer: string; issuedAt: string; expiresAt: string; redeemedAt?: string };
type CustomerT = {
  id: string;
  name: string;
  phone: string;
  email: string;
  firstSeen: string;
  lastSeen: string;
  visits: number;
  sources: string[];
  coupons: CouponT[];
};
type Segments = {
  total: number;
  new7d: number;
  regulars: number;
  lapsed21d: number;
  withActiveCoupon: number;
  redeemed: number;
};
type DataResp = {
  ok: boolean;
  tenant: { id: string; name: string };
  stats: Stats;
  reservations: Rec[];
  messages: Rec[];
  customers?: CustomerT[];
  customerSegments?: Segments;
};

const NAVY = 'var(--navy, #0B1F33)';
const BRASS = 'var(--brass, #B08D3C)';
const BRASSL = 'var(--brass-light, #D4B36A)';
const OFF = 'var(--off-white, #F5F0E6)';
const PANEL = 'rgba(255,255,255,0.04)';
const LINE = 'rgba(200,162,78,0.20)';

const card: React.CSSProperties = {
  background: PANEL,
  border: '1px solid ' + LINE,
  borderRadius: 14,
  padding: '18px 20px',
};
const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,230,0.55)',
};
const big: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 700,
  color: OFF,
  marginTop: 6,
  fontFamily: 'var(--font-display, serif)',
};

const str = (r: Rec, k: string): string => (typeof r[k] === 'string' ? (r[k] as string) : '');
const bool = (r: Rec, k: string): boolean => r[k] === true;
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function StatsPage() {
  const [pw, setPw] = useState('');
  const [data, setData] = useState<DataResp | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState(false);
  // Retention panel state
  const [couponBusy, setCouponBusy] = useState('');
  const [copied, setCopied] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  // Reservation confirm state
  const [resvBusy, setResvBusy] = useState('');
  const [resvMsg, setResvMsg] = useState<Record<string, string>>({});
  const [resvNote, setResvNote] = useState<Record<string, string>>({});

  const loadData = useCallback(async (): Promise<boolean> => {
    const r = await fetch('/api/owner/data', { credentials: 'same-origin', cache: 'no-store' });
    if (r.ok) {
      setData((await r.json()) as DataResp);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadData();
      } catch {
        /* not logged in */
      } finally {
        setBooted(true);
      }
    })();
  }, [loadData]);

  async function login(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!pw.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const r = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: pw.trim() }),
      });
      if (!r.ok) {
        setErr('รหัสไม่ถูกต้อง');
      } else {
        setPw('');
        await loadData();
      }
    } catch {
      setErr('เข้าสู่ระบบไม่ได้ ลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/owner/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      /* ignore */
    }
    setData(null);
  }

  /* ── การจอง: กดยืนยัน แล้วลูกค้าได้เมล "โต๊ะยืนยันแล้ว" ───────────────── */
  async function resvAction(id: string, action: 'confirm' | 'unconfirm', resend = false) {
    setResvBusy(id);
    setResvMsg((m) => ({ ...m, [id]: '' }));
    try {
      const r = await fetch('/api/owner/reservations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action, id, resend, note: (resvNote[id] || '').trim() }),
      });
      const j = (await r.json()) as { ok: boolean; emailed?: boolean; mailError?: string; error?: string };
      if (!j.ok) {
        setResvMsg((m) => ({ ...m, [id]: '❌ ' + (j.error || 'ไม่สำเร็จ') }));
      } else if (action === 'unconfirm') {
        setResvMsg((m) => ({ ...m, [id]: 'ย้อนกลับเป็นรอยืนยันแล้ว' }));
      } else if (j.emailed) {
        setResvMsg((m) => ({ ...m, [id]: '✅ ยืนยันแล้ว — ส่งเมลหาลูกค้าเรียบร้อย' }));
      } else {
        setResvMsg((m) => ({ ...m, [id]: '⚠️ ยืนยันแล้ว แต่เมลไม่ออก — ' + (j.mailError || 'ลองส่งซ้ำ') }));
      }
      setResvNote((n) => ({ ...n, [id]: '' }));
      await loadData();
    } catch {
      setResvMsg((m) => ({ ...m, [id]: '❌ เชื่อมต่อไม่ได้ ลองใหม่' }));
    } finally {
      setResvBusy('');
    }
  }

  /* ── Retention: customer book + comeback coupons ────────────────────── */
  const customers = data?.customers ?? [];
  const seg: Segments =
    data?.customerSegments ?? { total: 0, new7d: 0, regulars: 0, lapsed21d: 0, withActiveCoupon: 0, redeemed: 0 };

  async function issue(customerId: string) {
    setCouponBusy(customerId);
    try {
      await fetch('/api/owner/customers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'issue', customerId, offer: '10% off next visit · ลด 10% ครั้งถัดไป' }),
      });
      await loadData();
    } catch {
      /* ignore */
    } finally {
      setCouponBusy('');
    }
  }

  async function redeem(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeemMsg('');
    try {
      const r = await fetch('/api/owner/customers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'redeem', code: redeemCode.trim() }),
      });
      const j = (await r.json()) as { ok: boolean; customerName?: string; offer?: string; error?: string };
      if (j.ok) {
        setRedeemMsg(`✅ ใช้ได้ — ${j.offer ?? ''}${j.customerName ? ' (คุณ' + j.customerName + ')' : ''}`);
        setRedeemCode('');
        await loadData();
      } else {
        const why =
          j.error === 'already redeemed' ? 'โค้ดนี้ถูกใช้ไปแล้ว' : j.error === 'expired' ? 'โค้ดหมดอายุแล้ว' : 'ไม่พบโค้ดนี้';
        setRedeemMsg('❌ ' + why);
      }
    } catch {
      setRedeemMsg('❌ เช็คไม่สำเร็จ ลองใหม่');
    }
  }

  function copyInvite(c: CustomerT, ac: CouponT) {
    const d = new Date(ac.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const name = c.name || 'ลูกค้า';
    const text = `สวัสดีค่ะคุณ${name} 🙏 ขอบคุณที่มาอุดหนุน Narwhal Thai Table นะคะ ครั้งหน้ารับ ${ac.offer} เพียงแจ้งโค้ด ${ac.code} ที่ร้านได้เลยค่ะ (ใช้ได้ถึง ${d})
Hi ${name}! Thank you for visiting Narwhal Thai Table 🐋 Show code ${ac.code} on your next visit for ${ac.offer} (valid until ${d}) — 19072 Beach Blvd, Huntington Beach · narwhalthaihb.com`;
    try {
      void navigator.clipboard.writeText(text);
      setCopied(c.id);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const pendingResv = data ? data.reservations.filter((r) => str(r, 'status') !== 'confirmed').length : 0;
  const days = data ? Object.entries(data.stats.byDay).sort((a, b) => (a[0] < b[0] ? -1 : 1)) : [];
  const maxDay = days.length ? Math.max(1, ...days.map((d) => d[1])) : 1;
  const maxDish = data ? Math.max(1, ...data.stats.topRecommendedDishes.map((d) => d.count)) : 1;

  return (
    <section style={{ padding: '40px 22px 80px', minHeight: '70vh' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <span style={{ ...label, color: BRASSL }}>Owner · Control Room</span>
        <h1 style={{ fontFamily: 'var(--font-display, serif)', color: OFF, fontSize: 30, margin: '6px 0 4px' }}>
          {data ? (
            <>สวัสดี <em style={{ color: BRASSL }}>{data.tenant.name}</em></>
          ) : (
            <>ห้องควบคุมของ <em style={{ color: BRASSL }}>เจ้าของร้าน</em></>
          )}
        </h1>
        <p style={{ color: 'rgba(245,240,230,0.6)', fontSize: 14, marginBottom: 28 }}>
          ข้อมูลจริงจากร้าน — แชตกับ Aileen, การจองโต๊ะ, ข้อความจากลูกค้า และคำติชมที่ต้องดู
        </p>

        {!data ? (
          !booted ? (
            <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>กำลังโหลด…</div>
          ) : (
            <form onSubmit={login} style={{ ...card, maxWidth: 380 }}>
              <div style={label}>รหัสผ่านเจ้าของร้าน</div>
              <input
                type="password"
                value={pw}
                onChange={(ev) => setPw(ev.target.value)}
                placeholder="ใส่รหัสผ่าน"
                autoComplete="current-password"
                style={{ width: '100%', marginTop: 10, padding: '11px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, fontSize: 15, outline: 'none' }}
              />
              {err && <div style={{ color: '#e0907a', fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button type="submit" disabled={loading} style={{ marginTop: 14, width: '100%', padding: '11px 18px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          )
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <button onClick={() => loadData()} style={{ padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, cursor: 'pointer', fontSize: 13 }}>↻ รีเฟรช</button>
              <button onClick={logout} style={{ padding: '8px 16px', borderRadius: 999, background: 'transparent', border: '1px solid ' + LINE, color: 'rgba(245,240,230,0.6)', cursor: 'pointer', fontSize: 13 }}>ออกจากระบบ</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 14, marginBottom: 26 }}>
              <div style={card}><div style={label}>บทสนทนาทั้งหมด</div><div style={big}>{data.stats.total}</div></div>
              <div style={card}><div style={label}>การจองโต๊ะ</div><div style={big}>{data.reservations.length}</div></div>
              <div style={{ ...card, borderColor: pendingResv > 0 ? 'rgba(200,162,78,0.5)' : LINE }}><div style={label}>รอยืนยัน</div><div style={{ ...big, color: pendingResv > 0 ? BRASSL : OFF }}>{pendingResv}</div></div>
              <div style={card}><div style={label}>ข้อความจากลูกค้า</div><div style={big}>{data.messages.length}</div></div>
              <div style={card}><div style={label}>ไทย / อังกฤษ</div><div style={big}>{data.stats.languages.th} / {data.stats.languages.en}</div></div>
              <div style={{ ...card, borderColor: data.stats.flaggedCount > 0 ? '#b5513a' : LINE }}><div style={label}>คำติชมที่ตั้งธง</div><div style={{ ...big, color: data.stats.flaggedCount > 0 ? '#e0907a' : OFF }}>{data.stats.flaggedCount}</div></div>
            </div>

            <div style={{ ...card, marginBottom: 22 }}>
              <div style={{ ...label, marginBottom: 12 }}>📅 การจองโต๊ะล่าสุด</div>
              {data.reservations.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีการจอง</div>
              ) : (
                data.reservations.slice(0, 20).map((r, i, arr) => {
                  const id = str(r, 'id');
                  const name = [str(r, 'first_name'), str(r, 'last_name')].filter(Boolean).join(' ');
                  const email = str(r, 'email');
                  const contact = '☎ ' + (str(r, 'phone') || '—') + (email ? ' · ' + email : '');
                  const meta = (str(r, 'source') || 'web') + ' · ' + fmtDate(str(r, 'ts'));
                  const confirmed = str(r, 'status') === 'confirmed';
                  const busy = resvBusy === id;
                  // อีเมลแจ้ง "ได้รับคำขอแล้ว" ที่ส่งหาลูกค้าตอนจองเข้ามา
                  const ack = !email
                    ? '✉️ ไม่มีอีเมล — ต้องโทรหาลูกค้า'
                    : bool(r, 'guestEmailed')
                      ? '✉️ ส่งเมล “ได้รับคำขอแล้ว” หาลูกค้าแล้ว'
                      : '✉️ เมลแจ้งรับคำขอไม่ออก — ยืนยันทางโทรศัพท์ด้วย';
                  return (
                    <div key={id || i} style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 200, flex: 1 }}>
                          <div style={{ color: OFF, fontSize: 14, fontWeight: 600 }}>
                            {(name || 'ไม่ระบุชื่อ') + ' · ' + (str(r, 'party_size') || '?') + ' ท่าน'}
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 9px',
                                borderRadius: 999,
                                color: confirmed ? '#8fd6a8' : BRASSL,
                                background: confirmed ? 'rgba(80,170,110,0.14)' : 'rgba(200,162,78,0.12)',
                                border: '1px solid ' + (confirmed ? 'rgba(80,170,110,0.35)' : LINE),
                              }}
                            >
                              {confirmed ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                            </span>
                          </div>
                          <div style={{ color: BRASSL, fontSize: 13, marginTop: 3 }}>{str(r, 'date') + ' ' + str(r, 'time')}</div>
                          <div style={{ color: 'rgba(245,240,230,0.6)', fontSize: 12.5, marginTop: 2 }}>{contact}</div>
                          {str(r, 'notes') && <div style={{ color: 'rgba(245,240,230,0.55)', fontSize: 12.5, marginTop: 2 }}>{'📝 ' + str(r, 'notes')}</div>}
                          <div style={{ color: 'rgba(245,240,230,0.4)', fontSize: 11.5, marginTop: 3 }}>{meta + ' · ' + ack}</div>
                          {confirmed && str(r, 'confirmedAt') && (
                            <div style={{ color: 'rgba(143,214,168,0.75)', fontSize: 11.5, marginTop: 2 }}>
                              {'✓ ยืนยันเมื่อ ' + fmtDate(str(r, 'confirmedAt')) + (bool(r, 'confirmEmailed') ? ' · ส่งเมลยืนยันหาลูกค้าแล้ว' : ' · ยังไม่ได้ส่งเมลยืนยัน')}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-end' }}>
                          {!confirmed ? (
                            <>
                              <input
                                value={resvNote[id] || ''}
                                onChange={(ev) => setResvNote((n) => ({ ...n, [id]: ev.target.value }))}
                                placeholder="ข้อความถึงลูกค้า (ไม่ใส่ก็ได้)"
                                style={{ padding: '7px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, fontSize: 12.5, outline: 'none', width: 215 }}
                              />
                              <button
                                onClick={() => resvAction(id, 'confirm')}
                                disabled={busy || !id}
                                style={{ padding: '8px 15px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 12.5, opacity: busy ? 0.6 : 1 }}
                              >
                                {busy ? 'กำลังส่ง…' : email ? '✅ ยืนยัน + ส่งเมลหาลูกค้า' : '✅ ยืนยัน (ไม่มีอีเมล)'}
                              </button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {email && (
                                <button
                                  onClick={() => resvAction(id, 'confirm', true)}
                                  disabled={busy}
                                  style={{ padding: '7px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, cursor: 'pointer', fontSize: 12.5, opacity: busy ? 0.6 : 1 }}
                                >
                                  {busy ? '…' : '✉️ ส่งเมลยืนยันซ้ำ'}
                                </button>
                              )}
                              <button
                                onClick={() => resvAction(id, 'unconfirm')}
                                disabled={busy}
                                style={{ padding: '7px 13px', borderRadius: 999, background: 'transparent', border: '1px solid ' + LINE, color: 'rgba(245,240,230,0.55)', cursor: 'pointer', fontSize: 12.5 }}
                              >
                                ↩ ยกเลิกการยืนยัน
                              </button>
                            </div>
                          )}
                          {resvMsg[id] && (
                            <div style={{ fontSize: 12, color: resvMsg[id].startsWith('✅') ? '#8fd6a8' : resvMsg[id].startsWith('❌') ? '#e0907a' : BRASSL, maxWidth: 240, textAlign: 'right' }}>
                              {resvMsg[id]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ ...card, marginBottom: 22 }}>
              <div style={{ ...label, marginBottom: 12 }}>💬 ข้อความจากลูกค้า</div>
              {data.messages.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีข้อความ</div>
              ) : (
                data.messages.slice(0, 20).map((m, i, arr) => {
                  const head = (str(m, 'topic') || 'ข้อความ') + ' — ' + (str(m, 'name') || 'ไม่ระบุชื่อ');
                  const meta = (str(m, 'email') || '—') + ' · ' + fmtDate(str(m, 'ts'));
                  return (
                    <div key={str(m, 'id') || i} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none' }}>
                      <div style={{ color: OFF, fontSize: 14, fontWeight: 600 }}>{head}</div>
                      <div style={{ color: 'rgba(245,240,230,0.7)', fontSize: 13, marginTop: 3 }}>{str(m, 'message')}</div>
                      <div style={{ color: 'rgba(245,240,230,0.4)', fontSize: 11.5, marginTop: 3 }}>{meta}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── ลูกค้า & คูปองชวนกลับ (Retention loop) ──────────────── */}
            <div style={{ ...card, marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
                <div style={label}>🔁 ลูกค้า & คูปองชวนกลับ</div>
                <a href="/api/owner/customers?format=csv" style={{ color: BRASSL, fontSize: 12.5 }}>⬇ ดาวน์โหลด CSV</a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(115px,1fr))', gap: 10, marginBottom: 16 }}>
                <div><div style={label}>ในสมุดลูกค้า</div><div style={{ ...big, fontSize: 26 }}>{seg.total}</div></div>
                <div><div style={label}>ใหม่ 7 วัน</div><div style={{ ...big, fontSize: 26 }}>{seg.new7d}</div></div>
                <div><div style={label}>มา 2 ครั้ง+</div><div style={{ ...big, fontSize: 26, color: BRASSL }}>{seg.regulars}</div></div>
                <div><div style={label}>เงียบ 21 วัน+</div><div style={{ ...big, fontSize: 26, color: seg.lapsed21d ? '#e0907a' : OFF }}>{seg.lapsed21d}</div></div>
                <div><div style={label}>คูปองถูกใช้</div><div style={{ ...big, fontSize: 26 }}>{seg.redeemed}</div></div>
              </div>

              {/* กล่องเช็คคูปองหน้าเคาน์เตอร์ — พนักงานพิมพ์โค้ดที่ลูกค้าโชว์ */}
              <form onSubmit={redeem} style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={redeemCode}
                  onChange={(ev) => setRedeemCode(ev.target.value)}
                  placeholder="โค้ดคูปอง เช่น NWT-7K2F"
                  style={{ padding: '9px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, fontSize: 14, outline: 'none', width: 190 }}
                />
                <button type="submit" style={{ padding: '9px 16px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  เช็ค / ใช้คูปอง
                </button>
                {redeemMsg && <span style={{ fontSize: 13, color: redeemMsg.startsWith('✅') ? BRASSL : '#e0907a' }}>{redeemMsg}</span>}
              </form>

              {customers.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>
                  ยังไม่มีลูกค้าในสมุด — ทุกการจอง / ข้อความ / โทรสั่ง ที่มีเบอร์หรืออีเมลจะเข้ามาที่นี่เอง
                </div>
              ) : (
                customers.slice(0, 20).map((c, i, arr) => {
                  const ac = c.coupons.find((x) => !x.redeemedAt && Date.parse(x.expiresAt) > Date.now());
                  const wasRedeemed = c.coupons.some((x) => x.redeemedAt);
                  return (
                    <div key={c.id} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ color: OFF, fontSize: 14, fontWeight: 600 }}>
                            {(c.name || 'ไม่ระบุชื่อ') + (c.visits >= 2 ? ' ⭐' : '') + (wasRedeemed ? ' 🔁' : '')}
                          </div>
                          <div style={{ color: 'rgba(245,240,230,0.6)', fontSize: 12.5, marginTop: 2 }}>
                            {[c.phone, c.email].filter(Boolean).join(' · ') || '—'}
                          </div>
                          <div style={{ color: 'rgba(245,240,230,0.4)', fontSize: 11.5, marginTop: 2 }}>
                            {'มา ' + c.visits + ' ครั้ง · ล่าสุด ' + fmtDate(c.lastSeen) + ' · ' + c.sources.join(', ')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          {ac ? (
                            <>
                              <span style={{ fontSize: 12.5, color: BRASSL, border: '1px dashed ' + LINE, borderRadius: 8, padding: '4px 9px' }}>🎟 {ac.code}</span>
                              <button
                                onClick={() => copyInvite(c, ac)}
                                style={{ padding: '7px 13px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, cursor: 'pointer', fontSize: 12.5 }}
                              >
                                {copied === c.id ? '✅ คัดลอกแล้ว' : '📋 คัดลอกข้อความชวน'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => issue(c.id)}
                              disabled={couponBusy === c.id}
                              style={{ padding: '7px 13px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 12.5, opacity: couponBusy === c.id ? 0.6 : 1 }}
                            >
                              🎟 ออกคูปองชวนกลับ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ ...card, marginBottom: 22 }}>
              <div style={{ ...label, marginBottom: 14 }}>จานที่ Aileen แนะนำบ่อยสุด</div>
              {data.stats.topRecommendedDishes.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีข้อมูล</div>
              ) : (
                data.stats.topRecommendedDishes.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '7px 0' }}>
                    <div style={{ width: 200, fontSize: 13.5, color: OFF, flexShrink: 0 }}>{d.name}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 16 }}>
                      <div style={{ width: ((d.count / maxDish) * 100) + '%', background: BRASS, height: '100%', borderRadius: 6, minWidth: 4 }} />
                    </div>
                    <div style={{ width: 30, textAlign: 'right', color: BRASSL, fontSize: 13, fontWeight: 600 }}>{d.count}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ ...card, marginBottom: 22 }}>
              <div style={{ ...label, marginBottom: 14 }}>การคุยรายวัน</div>
              {days.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีข้อมูล</div>
              ) : (
                days.slice(-14).map(([day, n]) => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0' }}>
                    <div style={{ width: 90, fontSize: 12.5, color: 'rgba(245,240,230,0.7)', flexShrink: 0 }}>{day}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 14 }}>
                      <div style={{ width: ((n / maxDay) * 100) + '%', background: BRASSL, height: '100%', borderRadius: 6, minWidth: 4 }} />
                    </div>
                    <div style={{ width: 30, textAlign: 'right', color: OFF, fontSize: 12.5 }}>{n}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ ...card, marginBottom: 22, borderColor: data.stats.flagged.length ? 'rgba(181,81,58,0.45)' : LINE }}>
              <div style={{ ...label, marginBottom: 12, color: data.stats.flagged.length ? '#e0907a' : undefined }}>⚠️ คำติชมที่ต้องดู</div>
              {data.stats.flagged.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีคำติชม 🎉</div>
              ) : (
                data.stats.flagged.slice().reverse().map((f, i, arr) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none' }}>
                    <div style={{ color: OFF, fontSize: 14 }}>{f.question}</div>
                    <div style={{ color: 'rgba(245,240,230,0.45)', fontSize: 11.5, marginTop: 2 }}>{fmtDate(f.ts)}</div>
                  </div>
                ))
              )}
            </div>

            <div style={card}>
              <div style={{ ...label, marginBottom: 12 }}>บทสนทนาล่าสุด</div>
              {data.stats.recent.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีข้อมูล</div>
              ) : (
                data.stats.recent.slice().reverse().map((c, i, arr) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none' }}>
                    <div style={{ color: BRASSL, fontSize: 13.5, fontWeight: 600 }}>{(c.flag ? '⚠️ ' : '') + (c.reservationIntent ? '📅 ' : '') + c.question}</div>
                    <div style={{ color: 'rgba(245,240,230,0.6)', fontSize: 13, marginTop: 3 }}>{c.reply}</div>
                    <div style={{ color: 'rgba(245,240,230,0.4)', fontSize: 11.5, marginTop: 3 }}>{c.lang.toUpperCase() + ' · ' + fmtDate(c.ts) + (c.dishes.length ? ' · ' + c.dishes.join(', ') : '')}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
