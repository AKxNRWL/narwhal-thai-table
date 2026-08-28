'use client';

/**
 * Multi-language "Now Open" ticker pinned to the very top of every page.
 *
 * Born as the pre-opening "Coming Soon" bar; since Sunday, August 9, 2026
 * the restaurant is open, so the same slim bar now announces the daily
 * hours in the 8 languages Huntington Beach actually speaks.
 *
 * SEO/a11y note: every phrase carries its own `lang` attribute. Without it a
 * crawler, a screen reader, or an AI extractor reads ~180 words of Thai,
 * Vietnamese, Chinese, Korean, Japanese and Tagalog as if it were English —
 * on a short drinks page that is over half the page's text. The duplicate
 * track is aria-hidden so the message is announced exactly once.
 *
 * Motion (M16): a small pause/play button lets anyone stop the marquee
 * (WCAG 2.2.2 "Pause, Stop, Hide"). prefers-reduced-motion users already get
 * a static bar via globals.css, so the button hides itself for them.
 */
import { useState } from 'react';

type Phrase = { lang: string; text: string };

const LANGUAGES: Phrase[] = [
  { lang: 'en', text: 'Now Open Every Day — Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM' },
  { lang: 'th', text: 'เปิดให้บริการแล้วทุกวันค่ะ — จ–ศ 11:30–22:00 · ส–อา 12:00–22:00' },
  { lang: 'es', text: 'Abierto todos los días — lun–vie 11:30 AM–10 PM · sáb–dom 12–10 PM' },
  { lang: 'vi', text: 'Mở cửa mỗi ngày — T2–T6 11:30–22:00 · T7–CN 12:00–22:00' },
  { lang: 'zh', text: '每天营业 · 周一至五 11:30–22:00 · 周末 12:00–22:00' },
  { lang: 'ko', text: '매일 영업합니다 — 월–금 11:30–22:00 · 토·일 12:00–22:00' },
  { lang: 'tl', text: 'Bukas araw-araw — Lun–Biy 11:30 AM–10 PM · Sab–Lin 12–10 PM' },
  { lang: 'ja', text: '毎日営業中 — 月〜金 11:30–22:00 · 土日 12:00–22:00' },
];

export default function ComingSoonTicker() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="cs-ticker"
      role="status"
      aria-label="Now open every day — Monday to Friday 11:30 AM to 10 PM, Saturday and Sunday 12 to 10 PM"
    >
      <div className={paused ? 'cs-ticker-track is-paused' : 'cs-ticker-track'}>
        {LANGUAGES.map((p, i) => (
          <span key={`a-${i}`} className="cs-ticker-item" lang={p.lang}>{p.text}</span>
        ))}
        {LANGUAGES.map((p, i) => (
          <span key={`b-${i}`} className="cs-ticker-item" lang={p.lang} aria-hidden="true">{p.text}</span>
        ))}
      </div>
      <button
        type="button"
        className="cs-ticker-toggle"
        aria-pressed={paused}
        aria-label={paused ? 'Resume the announcements ticker' : 'Pause the announcements ticker'}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 1l6.8 4-6.8 4z" fill="currentColor" /></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2.3v8H2zM5.7 1H8v8H5.7z" fill="currentColor" /></svg>
        )}
      </button>
    </div>
  );
}
