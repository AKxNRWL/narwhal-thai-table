'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import RewardsAuth from '@/components/rewards/RewardsAuth';
import { cn } from '@/lib/cn';
import {
  OPEN_EVENT,
  canonTable,
  clearSession,
  currentSession,
  errorText,
  fmtMoney,
  fmtPoints,
  grantedGeo,
  onSessionChange,
  rewardsCall,
  tableLabel,
  type Balance,
  type ClaimResult,
  type Session,
  type TableBill,
  type TableBillResult,
} from '@/lib/rewards';

/**
 * The Narwhal Rewards sheet — mounted once in app/layout, opened from anywhere with
 * openRewards({ table }) (menu strip, Aileen's chat chip, /points). At a QR table it
 * shows that table's live Toast bill and adds it to the guest's points in one tap.
 * Bottom sheet on phones, centred card on desktop; sits above the chat (z 1200) and
 * the promo card (z 1300).
 */

type View =
  | { kind: 'auth' }
  | { kind: 'loading' }
  | { kind: 'bill'; result: TableBillResult }
  | { kind: 'claimed'; status: 'earned' | 'pending'; points: number; balance?: number }
  | { kind: 'balance'; balance: Balance }
  | { kind: 'error'; message: string };

export default function RewardsSheet() {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState(false);
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [claiming, setClaiming] = useState(false);
  const [claimErr, setClaimErr] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const loadBalance = useCallback(async () => {
    setView({ kind: 'loading' });
    const r = await rewardsCall<Balance>('balance', {}, true);
    if (!r.ok) {
      setView(r.error === 'auth' ? { kind: 'auth' } : { kind: 'error', message: errorText(r.error) });
      return;
    }
    setStaff(r.data.staff);
    setView({ kind: 'balance', balance: r.data });
  }, []);

  const loadBill = useCallback(async (t: string) => {
    setView({ kind: 'loading' });
    setClaimErr('');
    const geo = await grantedGeo();
    const r = await rewardsCall<TableBillResult>('table_bill', { table: t, geo }, true);
    if (!r.ok) {
      setView(r.error === 'auth' ? { kind: 'auth' } : { kind: 'error', message: errorText(r.error) });
      return;
    }
    setView({ kind: 'bill', result: r.data });
  }, []);

  const load = useCallback(
    (t: string | null) => {
      if (!currentSession()) {
        setView({ kind: 'auth' });
        return;
      }
      if (t) loadBill(t);
      else loadBalance();
    },
    [loadBill, loadBalance],
  );

  // Open requests from anywhere on the page.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ table?: string | null }>).detail ?? {};
      const t = canonTable(detail.table);
      returnFocus.current = document.activeElement as HTMLElement | null;
      setTable(t);
      setSession(currentSession());
      setOpen(true);
      load(t);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [load]);

  useEffect(() => onSessionChange(() => setSession(currentSession())), []);

  // Lock the page behind (SmoothScroll pauses Lenis on body overflow hidden), Escape closes.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const id = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  async function claim(bill: TableBill) {
    if (!table || claiming) return;
    setClaiming(true);
    setClaimErr('');
    const geo = await grantedGeo();
    const r = await rewardsCall<ClaimResult>('claim', { table, orderGuid: bill.guid, geo }, true);
    setClaiming(false);
    if (!r.ok) {
      if (r.error === 'auth') {
        setView({ kind: 'auth' });
        return;
      }
      setClaimErr(errorText(r.error));
      return;
    }
    setView({ kind: 'claimed', status: r.data.status, points: r.data.points });
    const b = await rewardsCall<Balance>('balance', {}, true);
    if (b.ok) setView({ kind: 'claimed', status: r.data.status, points: r.data.points, balance: b.data.points });
  }

  function signOut() {
    rewardsCall('logout', {}, true).finally(() => clearSession());
    clearSession();
    setSession(null);
    setStaff(false);
    setView({ kind: 'auth' });
  }

  if (!open) return null;

  const title =
    view.kind === 'auth'
      ? table
        ? 'Earn points on this meal'
        : 'Narwhal Rewards'
      : table
        ? `Your bill at ${tableLabel(table)}`
        : 'Your points';

  return (
    <div className="fixed inset-0 z-[1400] flex items-end justify-center sm:items-center sm:p-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-navy-deep/70 backdrop-blur-[3px] animate-[promo-fade_.25s_ease_both]"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nrw-title"
        data-lenis-prevent
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-y-auto overscroll-contain bg-navy-deep text-cream outline-none',
          'rounded-t-[26px] border-t border-brass/35 shadow-[0_-24px_70px_-20px_rgba(0,0,0,0.75)]',
          'sm:w-[min(100%,460px)] sm:rounded-[26px] sm:border sm:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]',
          'animate-[promo-in_.38s_cubic-bezier(.2,.8,.2,1)_both]',
        )}
      >
        {/* soft brass glow at the top */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(200,162,78,0.18),transparent_70%)]" />
        <div className="relative flex items-start gap-3.5 px-6 pb-2 pt-6">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brass text-navy shadow-[0_8px_24px_-8px_rgba(200,162,78,0.8)]">
            <StarIcon className="size-[22px]" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-sans text-[10.5px] font-medium uppercase tracking-[0.26em] text-brass-light">Narwhal Rewards</p>
            <h2 id="nrw-title" className="mt-1 font-display text-[23px] font-medium leading-tight text-cream">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mr-2 -mt-1 flex size-10 items-center justify-center rounded-full text-[26px] leading-none text-cream/55 transition-colors hover:bg-white/[0.06] hover:text-brass-light"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="relative flex flex-col gap-5 px-6 pb-6 pt-3">
          {view.kind === 'auth' && (
            <RewardsAuth
              intro={
                <p className="text-[15px] leading-relaxed text-cream/75">
                  {table ? (
                    <>
                      Get <span className="text-brass-light">100 points for every $1</span> on today&rsquo;s bill. Confirm your
                      phone once and it&rsquo;s saved on this device for next time.
                    </>
                  ) : (
                    <>Sign in with your phone to see your points and add a bill.</>
                  )}
                </p>
              }
              onSignedIn={(r) => {
                setSession(currentSession());
                setStaff(r.staff);
                load(table);
              }}
            />
          )}

          {view.kind === 'loading' && <Loading />}

          {view.kind === 'error' && (
            <div className="flex flex-col gap-4">
              <Notice tone="warn">{view.message}</Notice>
              <Button variant="secondary" onClick={() => load(table)}>
                Try again
              </Button>
            </div>
          )}

          {view.kind === 'bill' && table && (
            <BillView
              table={table}
              result={view.result}
              staff={staff}
              claiming={claiming}
              claimErr={claimErr}
              onClaim={claim}
              onRefresh={() => loadBill(table)}
              onNavigate={() => setOpen(false)}
            />
          )}

          {view.kind === 'claimed' && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full border border-brass/50 bg-brass/15 text-brass-light">
                <CheckIcon className="size-8" />
              </span>
              {view.status === 'earned' ? (
                <>
                  <p className="font-display text-[30px] font-medium leading-none text-gold">+{fmtPoints(view.points)}</p>
                  <p className="text-[15px] text-cream/80">points added to your account.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-[24px] font-medium leading-tight text-cream">Bill linked</p>
                  <p className="max-w-sm text-[15px] leading-relaxed text-cream/75">
                    Your <span className="text-brass-light">{fmtPoints(view.points)} points</span> land as soon as the bill is
                    paid — usually within 15 minutes.
                  </p>
                </>
              )}
              {typeof view.balance === 'number' && (
                <p className="mt-1 rounded-full border border-cream/12 bg-white/[0.04] px-4 py-1.5 font-sans text-[12.5px] tracking-[0.04em] text-cream/75">
                  Balance {fmtPoints(view.balance)} pts
                </p>
              )}
              <div className="mt-3 flex w-full flex-col gap-2.5">
                <Button size="lg" className="w-full" onClick={() => setOpen(false)}>
                  Back to the menu
                </Button>
                <Link
                  href="/points"
                  onClick={() => setOpen(false)}
                  className="py-1.5 text-center font-sans text-[12.5px] text-cream/60 underline-offset-4 hover:text-brass-light hover:underline"
                >
                  See my points &amp; history
                </Link>
              </div>
            </div>
          )}

          {view.kind === 'balance' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-[20px] border border-brass/25 bg-white/[0.035] px-5 py-5 text-center">
                <p className="font-sans text-[10.5px] uppercase tracking-[0.24em] text-cream/55">Your balance</p>
                <p className="mt-2 font-display text-[40px] font-medium leading-none text-gold">{fmtPoints(view.balance.points)}</p>
                <p className="mt-1.5 text-[13px] text-cream/55">points</p>
              </div>
              {view.balance.staff && <Notice tone="info">{errorText('staff')}</Notice>}
              {view.balance.pending.length > 0 && (
                <Notice tone="info">
                  {view.balance.pending.length === 1 ? '1 bill' : `${view.balance.pending.length} bills`} waiting to be paid —
                  points land automatically.
                </Notice>
              )}
              <Button href="/points" size="lg" arrow className="w-full" onClick={() => setOpen(false)}>
                History &amp; add a receipt
              </Button>
            </div>
          )}

          {session && view.kind !== 'auth' && (
            <div className="flex items-center justify-between gap-3 border-t border-cream/10 pt-4 font-sans text-[12px] text-cream/50">
              <span>
                Signed in as <span className="text-cream/75">{session.phoneMasked}</span>
              </span>
              <button type="button" className="underline-offset-4 hover:text-brass-light hover:underline" onClick={signOut}>
                Not you? Sign out
              </button>
            </div>
          )}
          <p className="text-center text-[11px] leading-relaxed text-cream/35">
            100 points per $1 of food &amp; soft drinks, before tax and tip. Alcohol and delivery-app orders don&rsquo;t earn.
          </p>
        </div>
      </div>
    </div>
  );
}

function BillView({
  table,
  result,
  staff,
  claiming,
  claimErr,
  onClaim,
  onRefresh,
  onNavigate,
}: {
  table: string;
  result: TableBillResult;
  staff: boolean;
  claiming: boolean;
  claimErr: string;
  onClaim: (b: TableBill) => void;
  onRefresh: () => void;
  onNavigate: () => void;
}) {
  if (!result.found) {
    if (result.reason === 'far') return <Notice tone="warn">{errorText('far')}</Notice>;
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-[20px] border border-cream/12 bg-white/[0.03] px-5 py-5">
          <p className="font-display text-[19px] text-cream">No bill on {tableLabel(table)} yet</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-cream/70">
            {result.reason === 'no_tables'
              ? 'Adding points at the table is paused for a moment.'
              : 'Once your server starts your order in the system, tap Refresh and it will appear here.'}
          </p>
        </div>
        <Button variant="secondary" onClick={onRefresh}>
          Refresh
        </Button>
        <Link
          href="/points#receipt"
          onClick={onNavigate}
          className="text-center font-sans text-[12.5px] text-cream/60 underline-offset-4 hover:text-brass-light hover:underline"
        >
          Already paid? Add it with your receipt &rarr;
        </Link>
      </div>
    );
  }

  const b = result.bill;
  const full = Math.round(b.subtotal * 100);
  const alcoholExcluded = b.points < full - 1;
  const canClaim = b.claimed === 'none' && !b.phoneOnBill && !staff;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-[20px] border border-brass/25 bg-white/[0.035]">
        <div className="flex items-center justify-between gap-3 border-b border-cream/10 px-5 py-3">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-cream/60">
            {tableLabel(table)} · {b.itemCount} {b.itemCount === 1 ? 'item' : 'items'}
          </span>
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em]',
              b.closed ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200' : 'border-brass/40 bg-brass/10 text-brass-light',
            )}
          >
            {b.closed ? 'Paid' : 'Open'}
          </span>
        </div>
        {b.items.length > 0 ? (
          <ul className="flex flex-col gap-1.5 px-5 py-4">
            {b.items.map((name, i) => (
              <li key={i} className="flex items-baseline gap-2.5 text-[14.5px] leading-snug text-cream/85">
                <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-brass-light/80" />
                <span className="min-w-0">{name}</span>
              </li>
            ))}
            {b.itemCount > b.items.length && <li className="pl-3.5 text-[13px] text-cream/45">and more…</li>}
          </ul>
        ) : (
          <p className="px-5 py-4 text-[14px] leading-relaxed text-cream/65">
            Nothing rung in yet — you can link the bill now and the points land when it&rsquo;s paid.
          </p>
        )}
        <div className="flex items-end justify-between gap-3 border-t border-cream/10 bg-white/[0.02] px-5 py-4">
          <div>
            <p className="text-[12.5px] text-cream/55">Before tax &amp; tip</p>
            <p className="font-sans text-[15px] text-cream/85">{fmtMoney(b.subtotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12.5px] text-cream/55">You earn</p>
            <p className="font-display text-[28px] font-medium leading-none text-gold">+{fmtPoints(b.points)}</p>
          </div>
        </div>
      </div>
      {alcoholExcluded && <p className="-mt-1 text-[12px] text-cream/45">Alcohol on the bill doesn&rsquo;t earn points.</p>}

      {staff && <Notice tone="info">{errorText('staff')}</Notice>}
      {b.phoneOnBill && <Notice tone="info">{errorText('has_phone')}</Notice>}
      {b.claimed === 'other' && <Notice tone="warn">{errorText('already_claimed')}</Notice>}
      {b.claimed === 'you' && <Notice tone="ok">This bill is already on your account.</Notice>}

      {canClaim && (
        <Button size="lg" className="w-full" disabled={claiming} onClick={() => onClaim(b)}>
          {claiming ? 'Adding…' : `Add ${fmtPoints(b.points)} points`}
        </Button>
      )}
      {claimErr && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-red-200">
          {claimErr}
        </p>
      )}
      {canClaim && !b.closed && (
        <p className="-mt-1 text-center text-[12px] leading-relaxed text-cream/45">
          Points land on your account when the bill is paid. Not your bill? Tap Refresh after your server rings you in.
        </p>
      )}
      <button
        type="button"
        onClick={onRefresh}
        className="self-center font-sans text-[12px] text-cream/50 underline-offset-4 hover:text-brass-light hover:underline"
      >
        Refresh bill
      </button>
    </div>
  );
}

function Notice({ tone, children }: { tone: 'info' | 'warn' | 'ok'; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        'rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed',
        tone === 'info' && 'border-cream/15 bg-white/[0.04] text-cream/75',
        tone === 'warn' && 'border-brass/35 bg-brass/[0.08] text-brass-light',
        tone === 'ok' && 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
      )}
    >
      {children}
    </p>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3 py-2" aria-busy="true" aria-label="Loading">
      <div className="h-24 animate-pulse rounded-[20px] bg-white/[0.05]" />
      <div className="h-12 animate-pulse rounded-full bg-white/[0.05]" />
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.6l2.75 5.82 6.35.78-4.68 4.37 1.22 6.28L12 16.77l-5.64 3.08 1.22-6.28L2.9 9.2l6.35-.78L12 2.6z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
