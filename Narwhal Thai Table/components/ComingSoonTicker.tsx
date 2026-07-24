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
  'Now in Beta — soft opening very soon · Huntington Beach',
  'ช่วง Beta Test — soft opening เร็วๆ นี้ · ฮันติงตันบีช',
  'En beta — soft opening muy pronto',
  'Đang chạy thử — soft opening rất sớm',
  '试营业筹备中 · 即将正式迎客 / 試營業籌備中 · 即將正式迎客',
  '베타 테스트 중 — 소프트 오픈 곧 시작',
  'Nasa beta — soft opening sa lalong madaling panahon',
  'ベータ運営中 · ソフトオープンまもなく',
];

export default function ComingSoonTicker() {
  return (
    <div className="cs-ticker" role="status" aria-label="Now in beta — soft opening very soon in Huntington Beach">
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
