/**
 * Multi-language "Coming Soon" ticker pinned to the very top of every page.
 *
 * Why a ticker: the giant Hero watermark looked rough on mobile (font scaled
 * down too aggressively and competed with the H1 for attention). A slim
 * top bar that runs through 8 languages serves the same "we are opening
 * soon" message but is immediately visible on first paint at any screen
 * size — which matters because Huntington Beach has a multilingual
 * customer base (Thai, Spanish, Vietnamese, Chinese, Korean, Filipino,
 * Japanese, English).
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
  'Soft Opening — Sunday, August 9 · Thank you for waiting, Huntington Beach',
  'Soft Opening อาทิตย์ 9 ส.ค.นี้ — ขอบคุณที่รอกันนะคะ · ฮันติงตันบีช',
  'Soft Opening — domingo 9 de agosto · Gracias por esperar',
  'Soft Opening — Chủ nhật 9/8 · Cảm ơn bạn đã chờ đợi',
  '8月9日（周日）正式迎客 · 感谢等待 / 8月9日（週日）正式迎客 · 感謝等待',
  '8월 9일 일요일 소프트 오픈 — 기다려 주셔서 감사합니다',
  'Soft Opening — Linggo, Agosto 9 · Salamat sa paghihintay',
  '8月9日（日）ソフトオープン · お待たせいたしました',
];

export default function ComingSoonTicker() {
  return (
    <div className="cs-ticker" role="status" aria-label="Soft opening Sunday, August 9 — thank you for waiting, Huntington Beach">
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
