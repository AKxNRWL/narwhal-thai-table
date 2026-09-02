'use client';

import { useEffect, useRef, useState } from 'react';
import { PromoCardView } from '@/components/PromoCard';
import { promoStatus, LIMITS } from '@/lib/promoShared';
import type { Promo, PromoImage, PromoImageOption, PromoStatus } from '@/lib/promoShared';
import { ORDER_ONLINE_URL, RESTAURANT } from '@/lib/site';

/**
 * "ป้ายโปรโมชั่น" panel in /stats — the owner writes the special, picks up to
 * LIMITS.images photos (Lunch Special plates / dish photos already on the site,
 * or uploads from the phone), sees the exact card visitors will get, and
 * saves. Talks to /api/owner/promo with the same cookie session as the rest
 * of the Control Room.
 */

type Draft = Omit<Promo, 'id' | 'updatedAt'>;

const EMPTY: Draft = {
  enabled: false,
  eyebrow: 'New · Lunch Special',
  title: '',
  body: '',
  price: '',
  images: [],
  ctaLabel: 'Order now',
  ctaUrl: ORDER_ONLINE_URL,
  startsAt: '',
  endsAt: '',
};

/** Editable fields of a stored promo, in EMPTY's key order (the dirty check compares JSON). */
const toDraft = (p: Promo): Draft => ({
  enabled: p.enabled,
  eyebrow: p.eyebrow,
  title: p.title,
  body: p.body,
  price: p.price,
  images: (p.images || []).map((i) => ({ src: i.src, alt: i.alt || '' })),
  ctaLabel: p.ctaLabel,
  ctaUrl: p.ctaUrl,
  startsAt: p.startsAt,
  endsAt: p.endsAt,
});

const CTA_PRESETS: { label: string; ctaLabel: string; ctaUrl: string }[] = [
  { label: 'สั่งออนไลน์ (Toast)', ctaLabel: 'Order now', ctaUrl: ORDER_ONLINE_URL },
  { label: 'เมนู Lunch Specials', ctaLabel: 'See lunch specials', ctaUrl: '/lunch' },
  { label: 'ดูเมนู', ctaLabel: 'See the menu', ctaUrl: '/menu' },
  { label: 'จองโต๊ะ', ctaLabel: 'Reserve a table', ctaUrl: '/contact/reservation' },
  { label: 'โทรหาร้าน', ctaLabel: 'Call us', ctaUrl: 'tel:' + RESTAURANT.phone.replace(/[^\d+]/g, '') },
  { label: 'ไม่มีปุ่ม', ctaLabel: '', ctaUrl: '' },
];

const STATUS_TEXT: Record<PromoStatus, string> = {
  live: '🟢 กำลังแสดงบนเว็บ',
  off: '⚪ ปิดอยู่ — ลูกค้าไม่เห็น',
  scheduled: '🕒 ตั้งเวลาไว้ — จะเริ่มแสดงตามวันที่กำหนด',
  ended: '⏹ หมดเวลาแล้ว — เลยวันสิ้นสุด',
  empty: 'ยังไม่มีป้าย',
};

const ERROR_TEXT: Record<string, string> = {
  title_required: 'ใส่ชื่อโปรก่อนเปิดแสดง',
  bad_cta_url: 'ลิงก์ปุ่มไม่ถูกต้อง (ต้องขึ้นต้นด้วย https:// หรือ /)',
  bad_image: 'ลิงก์รูปไม่ถูกต้อง',
  bad_start: 'วันเริ่มไม่ถูกต้อง',
  bad_end: 'วันสิ้นสุดไม่ถูกต้อง',
  end_before_start: 'วันสิ้นสุดอยู่ก่อนวันเริ่ม',
  too_large: 'รูปใหญ่เกินไป (ลองรูปเล็กกว่านี้)',
  store_failed: 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง',
  unauthorized: 'หมดเวลาเข้าสู่ระบบ — รีเฟรชแล้วเข้าใหม่',
};

/* Downsize a phone photo in the browser: ≤1400px on the long side, JPEG 0.86.
   A 4 MB camera shot becomes ~200 KB, which keeps the upload fast and the
   card quick to load for visitors. Goes through an <img> (not
   createImageBitmap) so EXIF rotation from phones is applied everywhere. */
async function fileToDataUrl(file: File, max = 1400, quality = 0.86): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ── styles: match the rest of /stats (inline, navy + brass) ───────────── */
const OFF = 'var(--off-white, #F5F0E6)';
const NAVY = 'var(--navy, #0B1F33)';
const BRASS = 'var(--brass, #B08D3C)';
const BRASSL = 'var(--brass-light, #D4B36A)';
const LINE = 'rgba(200,162,78,0.20)';
const label: React.CSSProperties = { fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.55)' };
const field: React.CSSProperties = { width: '100%', marginTop: 6, padding: '9px 13px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid ' + LINE, color: OFF, fontSize: 14, outline: 'none', fontFamily: 'inherit' };
const chip = (on: boolean): React.CSSProperties => ({ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer', border: '1px solid ' + (on ? 'rgba(200,162,78,0.6)' : LINE), background: on ? 'rgba(200,162,78,0.16)' : 'rgba(255,255,255,0.04)', color: on ? BRASSL : 'rgba(245,240,230,0.75)' });
const hint: React.CSSProperties = { fontSize: 11.5, color: 'rgba(245,240,230,0.45)', marginTop: 4 };
const iconBtn: React.CSSProperties = { width: 28, height: 28, borderRadius: 8, border: '1px solid ' + LINE, background: 'rgba(255,255,255,0.05)', color: OFF, cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 };

export default function PromoEditor({ images: library }: { images: PromoImageOption[] }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saved, setSaved] = useState<Promo | null>(null);
  const [status, setStatus] = useState<PromoStatus>('empty');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/owner/promo', { credentials: 'same-origin', cache: 'no-store' });
        const j = (await r.json()) as { ok: boolean; promo: Promo | null; status: PromoStatus };
        if (j.ok && j.promo) {
          setDraft(toDraft(j.promo));
          setSaved(j.promo);
          setStatus(j.status);
        }
      } catch {
        /* shown as not loaded */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = loaded && JSON.stringify(draft) !== JSON.stringify(saved ? toDraft(saved) : EMPTY);
  const preview = { id: 'preview', eyebrow: draft.eyebrow, title: draft.title || 'ชื่อโปรจะขึ้นตรงนี้', body: draft.body, price: draft.price, images: draft.images, ctaLabel: draft.ctaLabel, ctaUrl: draft.ctaUrl };
  const lunch = library.filter((i) => i.group === 'lunch');
  const dishes = library.filter((i) => i.group === 'dish');
  const room = LIMITS.images - draft.images.length;

  /* ── photo list helpers ── */
  const addImages = (items: PromoImage[]) =>
    setDraft((d) => {
      const have = new Set(d.images.map((i) => i.src));
      const next = [...d.images];
      for (const it of items) {
        if (next.length >= LIMITS.images) break;
        if (it.src && !have.has(it.src)) {
          have.add(it.src);
          next.push({ src: it.src, alt: (it.alt || '').slice(0, LIMITS.alt) });
        }
      }
      return { ...d, images: next };
    });
  const removeImage = (i: number) => setDraft((d) => ({ ...d, images: d.images.filter((_, k) => k !== i) }));
  const moveImage = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.images.length) return d;
      const next = [...d.images];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, images: next };
    });
  const setAlt = (i: number, alt: string) => setDraft((d) => ({ ...d, images: d.images.map((im, k) => (k === i ? { ...im, alt: alt.slice(0, LIMITS.alt) } : im)) }));

  async function save() {
    setBusy(true);
    setMsg('');
    try {
      const r = await fetch('/api/owner/promo', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const j = (await r.json()) as { ok: boolean; error?: string; promo?: Promo; status?: PromoStatus };
      if (!j.ok || !j.promo) {
        setMsg('❌ ' + (ERROR_TEXT[j.error || ''] || 'บันทึกไม่สำเร็จ (' + (j.error || r.status) + ')'));
        return;
      }
      setSaved(j.promo);
      setDraft(toDraft(j.promo)); // server-normalised copy (trimmed, defaults filled)
      setStatus(j.status || promoStatus(j.promo));
      setMsg('✅ บันทึกแล้ว — ' + STATUS_TEXT[j.status || promoStatus(j.promo)] + ' (ขึ้นบนเว็บภายในประมาณ 1 นาที)');
    } catch {
      setMsg('❌ เชื่อมต่อไม่ได้ ลองใหม่');
    } finally {
      setBusy(false);
    }
  }

  async function upload(files: FileList) {
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (!list.length) {
      setMsg('❌ ใส่รูปได้สูงสุด ' + LIMITS.images + ' รูป — ลบรูปเก่าก่อน');
      return;
    }
    setMsg('');
    let done = 0;
    try {
      for (const file of list) {
        setUploading(`กำลังย่อรูปและอัปโหลด ${done + 1}/${list.length}…`);
        const dataUrl = await fileToDataUrl(file);
        const r = await fetch('/api/owner/promo/image', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ dataUrl }),
        });
        const j = (await r.json()) as { ok: boolean; url?: string; error?: string };
        if (!j.ok || !j.url) {
          setMsg('❌ ' + (ERROR_TEXT[j.error || ''] || 'อัปโหลดรูปไม่สำเร็จ') + (done ? ` (สำเร็จ ${done} รูป)` : ''));
          return;
        }
        addImages([{ src: j.url, alt: '' }]);
        done++;
      }
      setMsg(`🖼 อัปโหลดแล้ว ${done} รูป — ใส่คำบรรยายได้ แล้วอย่าลืมกด "บันทึกขึ้นเว็บ"`);
    } catch {
      setMsg('❌ อ่านรูปไม่ได้ ลองรูป JPG/PNG อื่น' + (done ? ` (สำเร็จ ${done} รูป)` : ''));
    } finally {
      setUploading('');
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid ' + (status === 'live' ? 'rgba(80,170,110,0.45)' : LINE), borderRadius: 14, padding: '18px 20px', marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={label}>📣 ป้ายโปรโมชั่น (Pop-up หน้าเว็บ)</div>
        <div style={{ fontSize: 12.5, color: status === 'live' ? '#8fd6a8' : 'rgba(245,240,230,0.6)' }}>{loaded ? STATUS_TEXT[status] : 'กำลังโหลด…'}</div>
      </div>
      <p style={{ color: 'rgba(245,240,230,0.55)', fontSize: 12.5, margin: '0 0 14px', lineHeight: 1.5 }}>
        ป้ายเด้งขึ้นครั้งเดียวต่อการเข้าเว็บ ลูกค้ากดปิดได้ (ปิดแล้วไม่เห็นป้ายเดิมอีก 3 วัน) · ไม่ขึ้นบนหน้า /order ของโฆษณา · แก้ข้อความหรือรูป = ป้ายใหม่ ทุกคนจะเห็นอีกครั้ง
      </p>

      <div className="promo-editor-grid">
        {/* ── form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={draft.enabled} onChange={(e) => set('enabled', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#C8A24E' }} />
            <span style={{ color: OFF, fontSize: 14, fontWeight: 600 }}>แสดงป้ายบนเว็บ</span>
          </label>

          <div>
            <div style={label}>หัวข้อเล็ก (บรรทัดบน)</div>
            <input value={draft.eyebrow} maxLength={LIMITS.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} placeholder="New · Lunch Special" style={field} />
          </div>
          <div>
            <div style={label}>ชื่อโปร *</div>
            <input value={draft.title} maxLength={LIMITS.title} onChange={(e) => set('title', e.target.value)} placeholder="เช่น Weekday Lunch Specials" style={field} />
          </div>
          <div>
            <div style={label}>รายละเอียด</div>
            <textarea value={draft.body} maxLength={LIMITS.body} onChange={(e) => set('body', e.target.value)} rows={3} placeholder="เช่น Pad Thai, Krapow, Panang curry and more — with a fresh salad and a crispy spring roll." style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
            <div style={hint}>{draft.body.length}/{LIMITS.body} · สั้นๆ 1–2 ประโยคอ่านง่ายสุด</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={label}>ราคา / ป้ายราคา</div>
              <input value={draft.price} maxLength={LIMITS.price} onChange={(e) => set('price', e.target.value)} placeholder="from $11.99" style={field} />
            </div>
            <div>
              <div style={label}>ข้อความบนปุ่ม</div>
              <input value={draft.ctaLabel} maxLength={LIMITS.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Order now" style={field} />
            </div>
          </div>
          <div>
            <div style={label}>ปุ่มพาไปที่</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {CTA_PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => setDraft((d) => ({ ...d, ctaLabel: p.ctaLabel, ctaUrl: p.ctaUrl }))} style={chip(draft.ctaUrl === p.ctaUrl)}>{p.label}</button>
              ))}
            </div>
            <input value={draft.ctaUrl} maxLength={LIMITS.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} placeholder="https://… หรือ /menu (ว่าง = ไม่มีปุ่ม)" style={{ ...field, fontSize: 12.5 }} />
          </div>

          {/* ── photos ── */}
          <div>
            <div style={label}>รูปภาพ · {draft.images.length}/{LIMITS.images} {draft.images.length > 1 ? '(ลูกค้าเลื่อนดูได้ มีจุดบอกตำแหน่ง)' : ''}</div>
            {draft.images.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {draft.images.map((im, i) => (
                  <div key={im.src} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid ' + LINE }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail of a site/uploaded photo */}
                    <img src={im.src} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input value={im.alt} maxLength={LIMITS.alt} onChange={(e) => setAlt(i, e.target.value)} placeholder="คำบรรยายบนรูป เช่น Pad Thai (ไม่บังคับ)" style={{ ...field, marginTop: 0, padding: '7px 10px', fontSize: 12.5 }} />
                      {i === 0 && <div style={{ ...hint, marginTop: 2 }}>รูปแรก = รูปหน้าปก</div>}
                    </div>
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="เลื่อนขึ้น" style={{ ...iconBtn, opacity: i === 0 ? 0.35 : 1 }}>▲</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === draft.images.length - 1} aria-label="เลื่อนลง" style={{ ...iconBtn, opacity: i === draft.images.length - 1 ? 0.35 : 1 }}>▼</button>
                    <button type="button" onClick={() => removeImage(i)} aria-label="ลบรูป" style={{ ...iconBtn, color: '#e0907a' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
              <select
                value=""
                disabled={room <= 0}
                onChange={(e) => {
                  const opt = library.find((i) => i.src === e.target.value);
                  if (opt) addImages([{ src: opt.src, alt: opt.label }]);
                }}
                style={{ ...field, width: 'auto', marginTop: 0, cursor: 'pointer', padding: '7px 10px', fontSize: 12.5, maxWidth: 260 }}
              >
                <option value="">＋ เลือกจากรูปบนเว็บ…</option>
                {lunch.length > 0 && (
                  <optgroup label="Lunch Specials">
                    {lunch.map((i) => <option key={i.src} value={i.src} disabled={draft.images.some((d) => d.src === i.src)}>{i.label}</option>)}
                  </optgroup>
                )}
                {dishes.length > 0 && (
                  <optgroup label="จานบนเมนู">
                    {dishes.map((i) => <option key={i.src} value={i.src} disabled={draft.images.some((d) => d.src === i.src)}>{i.label}</option>)}
                  </optgroup>
                )}
              </select>
              {lunch.length > 0 && (
                <button type="button" onClick={() => addImages(lunch.map((i) => ({ src: i.src, alt: i.label })))} disabled={room <= 0} style={chip(false)}>
                  ＋ Lunch Specials ทั้งหมด ({lunch.length})
                </button>
              )}
              <label style={{ ...chip(false), display: 'inline-flex', alignItems: 'center', gap: 6, opacity: room <= 0 || uploading ? 0.5 : 1 }}>
                {uploading || '＋ อัปโหลดรูป'}
                <input ref={fileRef} type="file" accept="image/*" multiple disabled={room <= 0 || !!uploading} onChange={(e) => { if (e.target.files?.length) upload(e.target.files); }} style={{ display: 'none' }} />
              </label>
              {draft.images.length > 0 && (
                <button type="button" onClick={() => set('images', [])} style={{ ...chip(false), color: '#e0907a' }}>ล้างรูปทั้งหมด</button>
              )}
            </div>
            <div style={hint}>ถ่ายจากมือถือได้เลย ระบบย่อรูปให้อัตโนมัติ · รูปแนวนอน 4:3 สวยสุด · สูงสุด {LIMITS.images} รูป</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={label}>แสดงตั้งแต่วันที่</div>
              <input type="date" value={draft.startsAt} onChange={(e) => set('startsAt', e.target.value)} style={{ ...field, colorScheme: 'dark' }} />
            </div>
            <div>
              <div style={label}>ถึงวันที่</div>
              <input type="date" value={draft.endsAt} onChange={(e) => set('endsAt', e.target.value)} style={{ ...field, colorScheme: 'dark' }} />
            </div>
          </div>
          <div style={{ ...hint, marginTop: -6 }}>ว่างทั้งคู่ = แสดงตลอดจนกว่าจะปิด · นับตามเวลาแคลิฟอร์เนีย</div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <button type="button" onClick={save} disabled={busy || !loaded || !!uploading} style={{ padding: '10px 18px', borderRadius: 999, background: BRASS, color: NAVY, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13.5, opacity: busy || !loaded || uploading ? 0.6 : 1 }}>
              {busy ? 'กำลังบันทึก…' : '💾 บันทึกขึ้นเว็บ'}
            </button>
            {dirty && !msg && <span style={{ fontSize: 12.5, color: BRASSL }}>มีการแก้ไขที่ยังไม่บันทึก</span>}
            {status === 'live' && !dirty && (
              <a href="/?promo=show" target="_blank" rel="noopener" style={{ fontSize: 12.5, color: BRASSL }}>ดูบนเว็บ ↗</a>
            )}
          </div>
          {msg && <div style={{ fontSize: 13, color: msg.startsWith('✅') || msg.startsWith('🖼') ? '#8fd6a8' : '#e0907a', lineHeight: 1.5 }}>{msg}</div>}
        </div>

        {/* ── live preview ── */}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...label, marginBottom: 8 }}>ตัวอย่างที่ลูกค้าจะเห็น{draft.images.length > 1 ? ' · ลองเลื่อนรูปได้' : ''}</div>
          <div className="promo-preview">
            <PromoCardView promo={preview} preview />
          </div>
          <div style={hint}>บนมือถือป้ายจะเลื่อนขึ้นจากด้านล่าง ไม่บังทั้งจอ · ลูกค้าปัดซ้าย-ขวาเพื่อดูรูปถัดไป</div>
        </div>
      </div>
    </div>
  );
}
