import Link from 'next/link';
import { ORDER_ONLINE_URL, DIRECTIONS_URL } from '@/lib/site';

/**
 * Sticky bottom action bar — phones only (hidden from 761px up).
 *
 * On a phone the three things a hungry person actually wants are always one
 * thumb-reach away instead of a scroll back to the hero: order, navigate,
 * book. Rendered once in the root layout, so it follows the visitor across
 * every page including the 67 dish pages, which previously had no way to act
 * without scrolling to the footer.
 *
 * Notes for future edits:
 *  - It is plain links, no client JS — it costs nothing on the bundle.
 *  - `--mab-h` (declared in globals.css) reserves the matching bottom padding
 *    on <body> and lifts the Aileen chat button, so nothing is ever covered.
 *  - The safe-area inset keeps it clear of the iPhone home indicator.
 */
export default function MobileActionBar() {
  return (
    <nav className="mobile-action-bar" aria-label="Quick actions">
      {ORDER_ONLINE_URL && (
        <a
          className="mab-item mab-primary"
          href={ORDER_ONLINE_URL}
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
            <path d="M4 8h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span>Order</span>
        </a>
      )}
      <a className="mab-item" href={DIRECTIONS_URL} target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
          <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
        <span>Directions</span>
      </a>
      <Link className="mab-item" href="/contact/reservation">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
        </svg>
        <span>Reserve</span>
      </Link>
    </nav>
  );
}
