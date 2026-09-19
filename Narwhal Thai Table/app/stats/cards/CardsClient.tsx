'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  addDays,
  cardsForDate,
  prettyLongDate,
  todayInLA,
  type CardSource,
  type GuestCard,
} from '@/lib/guestCards';

/**
 * Owner · Welcome Cards (/stats/cards)
 *
 * Takes the day's CONFIRMED reservations and lays them out as table tents the
 * team prints in-house on the Epson and stands on the table before the guests
 * arrive. One sheet of Letter → two tents: one cut down the middle, one fold
 * across each half. Both faces of a tent carry the same name so it reads from
 * either side of the table.
 *
 * Why the geometry is what it is: a tent's fold has to be the TOP ridge, so a
 * blank is W wide by 2H tall and folds at its waist. Two blanks side by side
 * on Letter LANDSCAPE (11 × 8.5) gives W = 5.5, H = 4.25 — a 5.5 × 4.25in tent,
 * wider than it is tall, which stands without tipping. The same two-up on
 * portrait would yield 4.25 × 5.5, tall and tippy, so landscape it is.
 *
 * Printing is the browser's own dialog aimed at the shop printer — no driver,
 * no PDF round-trip. @page pins the paper to 11 × 8.5 with zero margin, and
 * the sheets are duplicated into a body-level portal so the site's nav, promo
 * pop-up and chat widget are not in the print flow at all.
 */

/* ── brand ─────────────────────────────────────────────────────────────── */
const NAVY = '#0B1F33';
const NAVY_SOFT = '#152F4A';
const BRASS = '#C8A24E';
const BRASSL = '#E3C581';
const BRASS_DEEP = '#9C7A33';
const OFF = '#F5F0E6';
const PANEL = 'rgba(255,255,255,0.04)';
const LINE = 'rgba(200,162,78,0.20)';

const panel: React.CSSProperties = {
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
const pill: React.CSSProperties = {
  padding: '8px 15px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid ' + LINE,
  color: OFF,
  cursor: 'pointer',
  fontSize: 13,
};
const field: React.CSSProperties = {
  padding: '8px 13px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid ' + LINE,
  color: OFF,
  fontSize: 14,
  outline: 'none',
};

/* ── print sheet geometry, in CSS inches ───────────────────────────────── */
const SHEET_W = 11;
const SHEET_H = 8.5;
const TENT_W = SHEET_W / 2; // 5.5in — one blank, and the finished tent width
const TENT_H = SHEET_H / 2; // 4.25in — the finished tent height (fold at the waist)
const PER_SHEET = 2;
const PX_PER_IN = 96;

/** A card as the page holds it — the derived card plus the team's overrides. */
type Editable = GuestCard & { on: boolean; manual?: boolean };

/**
 * Point size for the guest name. Fraunces at 34pt fits roughly 18 characters
 * across the 4.6in of usable width; past that we step down rather than let a
 * long name wrap into three cramped lines.
 */
function nameSize(name: string): number {
  const n = name.trim().length;
  if (n <= 18) return 34;
  if (n <= 26) return 29;
  if (n <= 36) return 24;
  return 20;
}

type DataResp = { ok: boolean; reservations: CardSource[] };

export default function CardsClient() {
  const [reservations, setReservations] = useState<CardSource[] | null>(null);
  const [booted, setBooted] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState('');
  const [edits, setEdits] = useState<Record<string, Partial<Editable>>>({});
  const [extras, setExtras] = useState<Editable[]>([]);
  const [showDetails, setShowDetails] = useState(true);
  const [mounted, setMounted] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.5);

  /* The restaurant's own "today" — never the device's, which may be a phone in
     another time zone or a laptop that thinks it is already tomorrow. */
  useEffect(() => {
    setDate(todayInLA());
    setMounted(true);
  }, []);

  const load = useCallback(async (): Promise<boolean> => {
    const r = await fetch('/api/owner/data', { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) return false;
    const j = (await r.json()) as DataResp;
    setReservations(Array.isArray(j.reservations) ? j.reservations : []);
    return true;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch {
        /* not signed in */
      } finally {
        setBooted(true);
      }
    })();
  }, [load]);

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
      if (!r.ok) setErr('รหัสไม่ถูกต้อง');
      else {
        setPw('');
        await load();
      }
    } catch {
      setErr('เข้าสู่ระบบไม่ได้ ลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  /* Fit the preview to whatever width the screen gives us — a phone in the
     pass gets a scrollable half-size sheet, a desktop gets it near full. */
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, Math.max(0.28, (w - 2) / (SHEET_W * PX_PER_IN))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [reservations]);

  /* Cards for the chosen day, with any hand edits applied on top. */
  const dayCards: Editable[] = useMemo(() => {
    const base = cardsForDate(reservations ?? [], date);
    return base.map((c) => ({ ...c, on: true, ...(edits[c.id] ?? {}) }));
  }, [reservations, date, edits]);

  const allCards = useMemo(() => [...dayCards, ...extras], [dayCards, extras]);
  const printing = allCards.filter((c) => c.on && c.name.trim());
  const sheets = useMemo(() => {
    const out: Editable[][] = [];
    for (let i = 0; i < printing.length; i += PER_SHEET) out.push(printing.slice(i, i + PER_SHEET));
    return out;
  }, [printing]);

  const patch = (id: string, p: Partial<Editable>) => {
    if (id.startsWith('m_')) setExtras((x) => x.map((c) => (c.id === id ? { ...c, ...p } : c)));
    else setEdits((e) => ({ ...e, [id]: { ...(e[id] ?? {}), ...p } }));
  };

  const addManual = () =>
    setExtras((x) => [
      ...x,
      { id: 'm_' + Date.now().toString(36), name: '', time: '', party: '', occasion: '', notes: '', on: true, manual: true },
    ]);

  const isToday = date === todayInLA();

  /* One card face. Rendered twice per tent: upright below the fold, and
     rotated above it so the far side reads the right way up too. */
  const Face = ({ c, back }: { c: Editable; back?: boolean }) => (
    <div className={'nwc-face' + (back ? ' is-back' : ' is-front')}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark-print.png" alt="" className="nwc-mark" />
      <div className="nwc-rule" />
      <div className="nwc-kicker">Reserved for</div>
      <div className="nwc-name" style={{ fontSize: nameSize(c.name) + 'pt' }}>
        {c.name}
      </div>
      {showDetails && (c.time || c.party) ? (
        <div className="nwc-meta">{[c.time, c.party].filter(Boolean).join('  ·  ')}</div>
      ) : null}
      {c.occasion.trim() ? <div className="nwc-occasion">{c.occasion}</div> : null}
      <div className="nwc-foot">Narwhal Thai Table</div>
    </div>
  );

  const Sheet = ({ group, k }: { group: Editable[]; k: number }) => (
    <div className="nwc-sheet" key={k}>
      {group.map((c, i) => (
        <div className={'nwc-blank ' + (i === 0 ? 'b1' : 'b2')} key={c.id}>
          <Face c={c} back />
          <Face c={c} />
        </div>
      ))}
      <div className="nwc-fold" />
      <div className="nwc-cut" />
    </div>
  );

  const sheetNodes = sheets.map((g, i) => <Sheet group={g} k={i} key={i} />);

  return (
    <section style={{ padding: '40px 22px 80px', minHeight: '70vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div style={{ maxWidth: 1040, margin: '0 auto' }} className="nwc-ui">
        <span style={{ ...label, color: BRASSL }}>Owner · Control Room</span>
        <h1 style={{ fontFamily: 'var(--font-display, serif)', color: OFF, fontSize: 30, margin: '6px 0 4px' }}>
          การ์ด<em style={{ color: BRASSL }}>ต้อนรับ</em>ที่โต๊ะ
        </h1>
        <p style={{ color: 'rgba(245,240,230,0.6)', fontSize: 14, marginBottom: 22 }}>
          ดึงชื่อจากการจองที่ <strong style={{ color: BRASSL }}>ยืนยันแล้ว</strong> ของวันที่เลือก แล้วพิมพ์เป็นการ์ดตั้งโต๊ะเองที่ร้าน — 1 แผ่นได้ 2 ใบ
        </p>

        {!reservations ? (
          !booted ? (
            <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>กำลังโหลด…</div>
          ) : (
            <form onSubmit={login} style={{ ...panel, maxWidth: 380 }}>
              <div style={label}>รหัสผ่านเจ้าของร้าน</div>
              <input
                type="password"
                value={pw}
                onChange={(ev) => setPw(ev.target.value)}
                placeholder="ใส่รหัสผ่าน"
                autoComplete="current-password"
                style={{ ...field, width: '100%', marginTop: 10, padding: '11px 14px', borderRadius: 999, fontSize: 15 }}
              />
              {err && <div style={{ color: '#e0907a', fontSize: 13, marginTop: 10 }}>{err}</div>}
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 14, width: '100%', padding: '11px 18px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          )
        ) : (
          <>
            {/* ── วันที่ ─────────────────────────────────────────────── */}
            <div style={{ ...panel, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setDate((d) => addDays(d, -1))} style={pill} aria-label="วันก่อนหน้า">‹</button>
                <input
                  type="date"
                  value={date}
                  onChange={(ev) => setDate(ev.target.value)}
                  style={{ ...field, colorScheme: 'dark' }}
                />
                <button onClick={() => setDate((d) => addDays(d, 1))} style={pill} aria-label="วันถัดไป">›</button>
                {!isToday && (
                  <button onClick={() => setDate(todayInLA())} style={pill}>วันนี้</button>
                )}
                <button onClick={() => void load()} style={pill}>↻ รีเฟรช</button>
                <Link href="/stats" style={{ ...pill, textDecoration: 'none', display: 'inline-block' }}>← กลับห้องควบคุม</Link>
              </div>
              <div style={{ color: BRASSL, fontSize: 14, marginTop: 12 }}>
                {prettyLongDate(date)}{isToday ? ' · วันนี้' : ''} — ยืนยันแล้ว {dayCards.length} ราย
                {extras.length ? ` · เพิ่มเอง ${extras.length} ใบ` : ''}
              </div>
              <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 12.5, marginTop: 4 }}>
                จะพิมพ์ {printing.length} ใบ = กระดาษ {sheets.length} แผ่น
              </div>
            </div>

            {/* ── รายชื่อ ────────────────────────────────────────────── */}
            <div style={{ ...panel, marginBottom: 16 }}>
              <div style={{ ...label, marginBottom: 12 }}>รายชื่อบนการ์ด — แก้ได้ก่อนพิมพ์</div>

              {allCards.length === 0 ? (
                <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>
                  วันนี้ยังไม่มีการจองที่ยืนยันแล้ว — กดยืนยันในห้องควบคุมก่อน หรือเพิ่มการ์ดเองด้านล่าง
                </div>
              ) : (
                allCards.map((c, i, arr) => (
                  <div
                    key={c.id}
                    style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + LINE : 'none', opacity: c.on ? 1 : 0.45 }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 9, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={c.on}
                          onChange={(ev) => patch(c.id, { on: ev.target.checked })}
                          style={{ width: 17, height: 17, accentColor: BRASS, cursor: 'pointer' }}
                        />
                        <span style={{ color: 'rgba(245,240,230,0.5)', fontSize: 12 }}>พิมพ์</span>
                      </label>

                      <div style={{ flex: 1, minWidth: 240 }}>
                        <input
                          value={c.name}
                          onChange={(ev) => patch(c.id, { name: ev.target.value })}
                          placeholder="ชื่อบนการ์ด เช่น John Smith &amp; Party"
                          style={{ ...field, width: '100%', fontSize: 15, fontFamily: 'var(--font-serif, Georgia, serif)' }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                          <input
                            value={c.time}
                            onChange={(ev) => patch(c.id, { time: ev.target.value })}
                            placeholder="เวลา"
                            style={{ ...field, width: 110, fontSize: 13 }}
                          />
                          <input
                            value={c.party}
                            onChange={(ev) => patch(c.id, { party: ev.target.value })}
                            placeholder="Party of 4"
                            style={{ ...field, width: 130, fontSize: 13 }}
                          />
                          <input
                            value={c.occasion}
                            onChange={(ev) => patch(c.id, { occasion: ev.target.value })}
                            placeholder="โอกาสพิเศษ (ไม่ใส่ก็ได้)"
                            style={{ ...field, flex: 1, minWidth: 190, fontSize: 13 }}
                          />
                          {c.manual && (
                            <button
                              onClick={() => setExtras((x) => x.filter((e) => e.id !== c.id))}
                              style={{ ...pill, fontSize: 12, padding: '7px 12px', color: 'rgba(245,240,230,0.6)' }}
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                        {c.notes && (
                          <div style={{ color: 'rgba(245,240,230,0.45)', fontSize: 12, marginTop: 6 }}>
                            {'📝 ' + c.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={addManual} style={pill}>+ เพิ่มการ์ดเอง</button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,240,230,0.6)', fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(ev) => setShowDetails(ev.target.checked)}
                    style={{ width: 16, height: 16, accentColor: BRASS, cursor: 'pointer' }}
                  />
                  แสดงเวลา + จำนวนคนบนการ์ด
                </label>
              </div>
            </div>

            {/* ── พิมพ์ ──────────────────────────────────────────────── */}
            <div style={{ ...panel, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.print()}
                  disabled={printing.length === 0}
                  style={{ padding: '12px 22px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 700, fontSize: 15, cursor: printing.length ? 'pointer' : 'not-allowed', opacity: printing.length ? 1 : 0.45 }}
                >
                  🖨️ พิมพ์การ์ด {printing.length} ใบ ({sheets.length} แผ่น)
                </button>
                <div style={{ color: 'rgba(245,240,230,0.6)', fontSize: 13, lineHeight: 1.75, minWidth: 260, flex: 1 }}>
                  ตั้งค่าในหน้าต่างพิมพ์: เครื่อง <strong style={{ color: BRASSL }}>Epson ET-16650</strong> · กระดาษ <strong style={{ color: BRASSL }}>Letter</strong> · <strong style={{ color: BRASSL }}>แนวนอน</strong> · Scale <strong style={{ color: BRASSL }}>100%</strong> · ปิด Headers and footers
                  <br />
                  แนะนำกระดาษหนา 65–110 lb (176–300 gsm) จะตั้งได้ไม่ล้ม
                </div>
              </div>
              <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 12.5, marginTop: 12, lineHeight: 1.8 }}>
                หลังพิมพ์: ตัดตาม<strong style={{ color: BRASSL }}>เส้นประแนวตั้ง</strong>ตรงกลาง 1 ครั้ง → ได้ 2 ใบ → พับแต่ละใบตาม<strong style={{ color: BRASSL }}>เส้นจุดแนวนอน</strong> → ตั้งเป็นเต็นท์ 5.5 × 4.25 นิ้ว อ่านได้ทั้งสองด้าน
              </div>
            </div>

            {/* ── พรีวิวหน้ากระดาษจริง ────────────────────────────────── */}
            <div style={{ ...panel }}>
              <div style={{ ...label, marginBottom: 12 }}>พรีวิวกระดาษจริง (Letter แนวนอน)</div>
              <div ref={previewRef} style={{ width: '100%' }}>
                {sheets.length === 0 ? (
                  <div style={{ color: 'rgba(245,240,230,0.5)', fontSize: 14 }}>ยังไม่มีการ์ดที่เลือกไว้</div>
                ) : (
                  <div
                    className="nwc-preview"
                    style={{ ['--nwc-s' as string]: String(scale), display: 'flex', flexDirection: 'column', gap: 18 }}
                  >
                    {sheets.map((g, i) => (
                      <div
                        key={i}
                        style={{ width: SHEET_W * PX_PER_IN * scale, height: SHEET_H * PX_PER_IN * scale }}
                      >
                        <Sheet group={g} k={i} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* The real print output: the same sheets, parked at body level so the
          site chrome is not part of the printed document. */}
      {mounted && sheets.length > 0
        ? createPortal(
            <div className="nwc-printroot">{sheetNodes}</div>,
            document.body,
          )
        : null}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Sheet + card CSS. Kept as one string because @page and the print-only
   overrides cannot live in inline styles.
   ────────────────────────────────────────────────────────────────────── */
const CSS = `
.nwc-sheet{
  position:relative; width:${SHEET_W}in; height:${SHEET_H}in;
  background:#fff; overflow:hidden;
  transform:scale(var(--nwc-s,1)); transform-origin:top left;
}
.nwc-blank{ position:absolute; top:0; width:${TENT_W}in; height:${SHEET_H}in; }
.nwc-blank.b1{ left:0; }
.nwc-blank.b2{ left:${TENT_W}in; }

.nwc-face{
  position:absolute; left:0; width:${TENT_W}in; height:${TENT_H}in;
  box-sizing:border-box; padding:0.34in 0.45in 0.56in;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; color:${NAVY}; background:#fff;
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
.nwc-face.is-front{ top:${TENT_H}in; }
.nwc-face.is-back{ top:0; transform:rotate(180deg); }

.nwc-mark{ height:0.36in; width:auto; opacity:0.92; }
.nwc-rule{ width:1.35in; height:1px; background:${BRASS}; opacity:0.75; margin:0.19in 0 0.12in; }
.nwc-kicker{
  font-family:var(--font-sans, sans-serif); font-size:7.5pt; font-weight:600;
  letter-spacing:0.30em; text-transform:uppercase; color:${BRASS_DEEP};
}
.nwc-name{
  font-family:var(--font-serif, Georgia, serif); font-weight:500;
  line-height:1.08; color:${NAVY}; margin-top:0.09in;
  max-width:100%; overflow-wrap:break-word;
}
.nwc-meta{
  font-family:var(--font-sans, sans-serif); font-size:9.5pt;
  letter-spacing:0.09em; color:${NAVY_SOFT}; opacity:0.78; margin-top:0.11in;
}
.nwc-occasion{
  font-family:var(--font-serif, Georgia, serif); font-style:italic;
  font-size:12pt; color:${BRASS_DEEP}; margin-top:0.10in;
}
.nwc-foot{
  position:absolute; left:0; right:0; bottom:0.30in;
  font-family:var(--font-sans, sans-serif); font-size:6.8pt; font-weight:600;
  letter-spacing:0.34em; text-transform:uppercase; color:${BRASS_DEEP}; opacity:0.75;
}

/* Cut down the middle, fold across the waist — both lines vanish into an
   edge or a crease once the tent is assembled, so they can print visibly. */
.nwc-cut{ position:absolute; top:0; bottom:0; left:${TENT_W}in; width:0;
  border-left:1px dashed rgba(11,31,51,0.30); }
.nwc-fold{ position:absolute; left:0; right:0; top:${TENT_H}in; height:0;
  border-top:1px dotted rgba(11,31,51,0.22); }

@media screen{
  .nwc-printroot{ display:none; }
  .nwc-preview .nwc-sheet{ box-shadow:0 10px 34px rgba(0,0,0,0.45); border-radius:2px; }
}

@media print{
  @page{ size:${SHEET_W}in ${SHEET_H}in; margin:0; }
  html,body{ margin:0 !important; padding:0 !important; background:#fff !important; }
  body > *{ display:none !important; }
  body > .nwc-printroot{ display:block !important; }
  .nwc-sheet{
    transform:none !important; box-shadow:none !important;
    border-radius:0 !important; margin:0 !important;
    break-after:page; page-break-after:always;
  }
  .nwc-printroot .nwc-sheet:last-child{ break-after:auto; page-break-after:auto; }
}
`;
