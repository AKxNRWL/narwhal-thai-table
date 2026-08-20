/**
 * Multi-language "Now Open" ticker pinned to the very top of every page.
 *
 * Born as the pre-opening "Coming Soon" bar; since Sunday, August 9, 2026
 * the restaurant is open, so the same slim bar now announces the daily
 * hours in the 8 languages Huntington Beach actually speaks (English,
 * Thai, Spanish, Vietnamese, Chinese, Korean, Filipino, Japanese).
 *
 * The languages are repeated twice in the track so the CSS keyframe can
 * translate the inner element by exactly -50% and loop seamlessly. Only
 * the FIRST set carries semantic meaning (read by screen readers); the
 * duplicate is aria-hidden so it isn't announced twice.
 *
 * Animation respects prefers-reduced-motion (set in globals.css) by
 * stopping the scroll and showing the first phrase only.
 */
const LANGUAGES = [
  'Now Open Every Day — Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM',
  'เปิดให้บริการแล้วทุกวันค่ะ — จ–ศ 11:30–22:00 · ส–อา 12:00–22:00',
  'Abierto todos los días — lun–vie 11:30 AM–10 PM · sáb–dom 12–10 PM',
  'Mở cửa mỗi ngày — T2–T6 11:30–22:00 · T7–CN 12:00–22:00',
  '每天营业 · 周一至五 11:30–22:00 · 周末 12:00–22:00 / 每天營業 · 週一至五 11:30–22:00 · 週末 12:00–22:00',
  '매일 영업합니다 — 월–금 11:30–22:00 · 토·일 12:00–22:00',
  'Bukas araw-araw — Lun–Biy 11:30 AM–10 PM · Sab–Lin 12–10 PM',
  '毎日営業中 — 月〜金 11:30–22:00 · 土日 12:00–22:00',
];

export default function ComingSoonTicker() {
  return (
    <div className="cs-ticker" role="status" aria-label="Now open every day — Monday to Friday 11:30 AM to 10 PM, Saturday and Sunday 12 to 10 PM">
      <div className="cs-ticker-track">
        {LANGUAGES.map((phrase, i) => (
          <span key={`a-${i}`} className="cs-ticker-item">{phrase}</span>
        ))}
        {LANGUAGES.map((phrase, i) => (
          <span key={`b-${i}`} className="cs-ticker-item" aria-hidden="true">{phrase}</span>
        ))}
      </div>
    </div>
  );
}
