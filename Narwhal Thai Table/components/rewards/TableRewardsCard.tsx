'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { serviceWindowNow } from '@/lib/serviceHours';
import { canonTable, currentSession, onSessionChange, openRewards, tableLabel, type Session } from '@/lib/rewards';

/**
 * "Earn points on this meal" strip at the top of /menu — only for guests who scanned
 * a table QR (/menu?t=7, P1–P5) during service hours. Opens the rewards sheet with
 * the table, which shows that table's Toast bill; after paying by card the guest adds
 * it with the card's last 4 digits (rewards v2).
 */
export default function TableRewardsCard({ className }: { className?: string }) {
  const [table, setTable] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const t = canonTable(new URLSearchParams(window.location.search).get('t'));
      if (t && serviceWindowNow()) setTable(t);
    } catch {
      /* no table */
    }
    setSession(currentSession());
    return onSessionChange(() => setSession(currentSession()));
  }, []);

  if (!table) return null;

  return (
    <button
      type="button"
      onClick={() => openRewards({ table })}
      className={cn(
        'group relative flex w-full flex-col gap-3 overflow-hidden rounded-[var(--radius-card)] border border-brass/45 bg-brass/[0.08] px-5 py-4 text-left shadow-card backdrop-blur-md',
        'sm:flex-row sm:items-center sm:gap-5 sm:px-6',
        'transition-[transform,border-color,background-color] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brass-light/70 hover:bg-brass/[0.12]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
        className,
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-[radial-gradient(circle,rgba(227,197,129,0.22),transparent_65%)]" />
      <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-brass px-3 py-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.16em] text-navy sm:self-auto">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5">
          <path d="M12 2.6l2.75 5.82 6.35.78-4.68 4.37 1.22 6.28L12 16.77l-5.64 3.08 1.22-6.28L2.9 9.2l6.35-.78L12 2.6z" />
        </svg>
        Narwhal Rewards
      </span>
      <span className="relative flex-1 text-[15px] leading-relaxed text-cream/85 transition-colors duration-300 group-hover:text-cream">
        {session ? (
          <>
            Add today&rsquo;s bill at {tableLabel(table)} to your points — after you pay, just enter your card&rsquo;s last 4 digits.
            <span className="mt-0.5 block font-sans text-[12px] tracking-[0.02em] text-cream/50">Signed in · {session.phoneMasked}</span>
          </>
        ) : (
          <>
            Earn <span className="text-brass-light">100 points for every $1</span> on this meal at {tableLabel(table)}.
          </>
        )}
      </span>
      <span className="relative inline-flex shrink-0 items-center gap-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brass-light">
        {session ? 'My bill' : 'Earn points'}{' '}
        <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </button>
  );
}
