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
  'Soft Opening Friday, July 24 · Huntington Beach',
  'Soft opening ศุกร์นี้ 24 ก.ค. · ฮันติงตันบีช',
  'Soft opening: viernes 24 de julio',
  'Soft opening: thứ Sáu 24/7',
  '软开业 · 7月24日(周五) / 軟開業 · 7月24日(週五)',
  '소프트 오픈 · 7월 24일 금요일',
  'Soft opening · Biyernes, Hulyo 24',
  'ソフトオープン · 7月24日(金)',
];

export default function ComingSoonTicker() {
  return (
    <div className="cs-ticker" role="status" aria-label="Soft opening Friday, July 24 in Huntington Beach">
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
