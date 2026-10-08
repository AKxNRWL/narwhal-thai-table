'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import RewardsAuth from '@/components/rewards/RewardsAuth';
import { cn } from '@/lib/cn';
import {
  OPEN_EVENT,
  WALLET_HINT,
  canonTable,
  clearSession,
  currentSession,
  errorText,
  fmtMoney,
  fmtPoints,
  geoPermission,
  last4Input,
  onSessionChange,
  requestGeo,
  rewardsCall,
  tableLabel,
  timeLA,
  type Balance,
  type ClaimResult,
  type Geo,
  type Session,
  type TableBill,
  type TableResult,
} from '@/lib/rewards';

/**
 * The Narwhal Rewards sheet — mounted once in app/layout, opened from anywhere with
 * openRewards({ table }) (menu strip, Aileen's chat chip, /points).
 *
 * At a QR table (rewards v2): the guest checks in — location is used only to decide
 * whether this phone may see the table's bill — sees the bills there, may link theirs
 * while it's open, and adds it after paying with the last 4 digits of the card (proof of
 * payment). Without a check-in a paid bill can still be added with the card digits.
 * Cash bills: the server adds the guest's phone in Toast. Open bills refresh every 25 s.
 * Bottom sheet on phones, centred card on desktop; sits above the chat and the promo card.
 */

type View =
  | { kind: 'auth' }
  | { kind: 'loading' }
  | { kind: 'locate' }
  | { kind: 'table'; data: TableResult }
  | { kind: 'earned'; points: number; balance?: number }
  | { kind: 'balance'; balance: Balance }
  | { kind: 'error'; message: string };

type Note = { key: string; text: string; tone: 'warn' | 'ok' };

const POLL_MS = 25_000;
const LIVE = new Set(['open', 'linked', 'linked_other']);
const RELOAD_AFTER = new Set(['not_found', 'not_linkable', 'checkin_required', 'already_claimed', 'has_phone', 'one_link']);

export default function RewardsSheet() {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState(false);
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const geoRef = useRef<Geo | undefined>(undefined);
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

  // This guest's view of the table. quiet = keep the screen while it loads (refresh, polling, after an action).
  const fetchTable = useCallback(async (t: string, quiet = false) => {
    if (!quiet) setView({ kind: 'loading' });
    const r = await rewardsCall<TableResult>('table_bill', { table: t, geo: geoRef.current, v: 2 }, true);
    if (!r.ok) {
      if (r.error === 'auth') setView({ kind: 'auth' });
      else if (!quiet) setView({ kind: 'error', message: errorText(r.error) });
      return;
    }
    if (typeof r.data.staff === 'boolean') setStaff(r.data.staff);
    setView({ kind: 'table', data: r.data });
  }, []);

  // Check in: use the location if the guest already allowed it; otherwise explain first and ask on a tap.
  const startTable = useCallback(
    async (t: string) => {
      setView({ kind: 'loading' });
      setNote(null);
      if (!geoRef.current) {
        const perm = await geoPermission();
        if (perm === 'granted') {
          geoRef.current = (await requestGeo()).geo;
        } else if (perm !== 'denied') {
          setView({ kind: 'locate' });
          return;
        }
      }
      await fetchTable(t);
    },
    [fetchTable],
  );

  const locate = useCallback(async () => {
    if (!table) return;
    setView({ kind: 'loading' });
    setNote(null);
    geoRef.current = (await requestGeo()).geo;
    await fetchTable(table);
  }, [table, fetchTable]);

  const load = useCallback(
    (t: string | null) => {
      if (!currentSession()) {
        setView({ kind: 'auth' });
        return;
      }
      if (t) startTable(t);
      else loadBalance();
    },
    [startTable, loadBalance],
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

  // While a bill at the table is still unpaid, look again every 25 s so "Paid" shows up on its own.
  const live = view.kind === 'table' && (view.data.bills ?? []).some((b) => LIVE.has(b.state));
  useEffect(() => {
    if (!open || !table || !live) return;
    const id = window.setInterval(() => {
      if (!document.hidden) fetchTable(table, true);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [open, table, live, fetchTable]);

  async function act(key: string, action: string, body: Record<string, unknown>): Promise<boolean> {
    if (!table || busy) return false;
    setBusy(key);
    setNote(null);
    const r = await rewardsCall<Record<string, unknown>>(action, { table, v: 2, ...body }, true);
    setBusy(null);
    if (!r.ok) {
      if (r.error === 'auth') {
        setView({ kind: 'auth' });
        return false;
      }
      setNote({ key, text: errorText(r.error), tone: 'warn' });
      if (RELOAD_AFTER.has(r.error)) fetchTable(table, true);
      return false;
    }
    return true;
  }

  async function link(b: TableBill) {
    if (table && (await act('bill:' + b.guid, 'link', { checkGuid: b.guid }))) fetchTable(table, true);
  }

  async function notMine(b: TableBill) {
    if (table && (await act('bill:' + b.guid, 'not_mine', { checkGuid: b.guid }))) fetchTable(table, true);
  }

  async function dispute(b: TableBill) {
    const key = 'bill:' + b.guid;
    if (await act(key, 'dispute', { checkGuid: b.guid })) {
      setNote({ key, text: 'Thanks — we’ll check this bill and fix your points if it’s yours.', tone: 'ok' });
    }
  }

  // Proof of payment: the card's last 4. With a bill picked, only that bill; otherwise any bill paid here lately.
  async function prove(key: string, last4: string, checkGuid?: string) {
    if (!table || busy) return;
    setBusy(key);
    setNote(null);
    const r = await rewardsCall<ClaimResult>('prove', { table, v: 2, last4, ...(checkGuid ? { checkGuid } : {}) }, true);
    setBusy(null);
    if (!r.ok) {
      if (r.error === 'auth') {
        setView({ kind: 'auth' });
        return;
      }
      const text = errorText(r.error === 'proof_mismatch' && checkGuid ? 'proof_mismatch_bill' : r.error);
      setNote({ key, text, tone: 'warn' });
      if (RELOAD_AFTER.has(r.error)) fetchTable(table, true);
      return;
    }
    setView({ kind: 'earned', points: r.data.points });
    const b = await rewardsCall<Balance>('balance', {}, true);
    if (b.ok) setView({ kind: 'earned', points: r.data.points, balance: b.data.points });
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
      : view.kind === 'earned'
        ? 'Points added'
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
                      Get <span className="text-brass-light">100 points for every $1</span> on today&rsquo;s bill. Your mobile
                      number is your account &mdash; one per number, no card or app. Confirm it once and this device remembers
                      you.
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

          {view.kind === 'locate' && table && (
            <LocateScreen
              table={table}
              busy={busy}
              note={note}
              onLocate={locate}
              onProve={(d) => prove('any', d)}
            />
          )}

          {view.kind === 'table' && table && (
            <TableScreen
              table={table}
              data={view.data}
              staff={staff}
              busy={busy}
              note={note}
              onLink={link}
              onNotMine={notMine}
              onDispute={dispute}
              onProve={prove}
              onRefresh={() => fetchTable(table)}
              onLocate={locate}
              onNavigate={() => setOpen(false)}
            />
          )}

          {view.kind === 'earned' && (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full border border-brass/50 bg-brass/15 text-brass-light">
                <CheckIcon className="size-8" />
              </span>
              <p className="font-display text-[30px] font-medium leading-none text-gold">+{fmtPoints(view.points)}</p>
              <p className="text-[15px] text-cream/80">points added to your account. Thank you for dining with us!</p>
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
                  {view.balance.pending.length === 1 ? '1 bill is' : `${view.balance.pending.length} bills are`} linked to you —
                  add {view.balance.pending.length === 1 ? 'it' : 'them'} with the card&rsquo;s last 4 digits once paid.
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
            100 points per $1 of food &amp; soft drinks, before tax and tip &mdash; one account per mobile number. Points need
            the last 4 digits of the card that paid the bill. Alcohol, gift cards and delivery-app orders don&rsquo;t earn.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── at the table ───────────────────────────────────────────────────── */

function LocateScreen({
  table,
  busy,
  note,
  onLocate,
  onProve,
}: {
  table: string;
  busy: string | null;
  note: Note | null;
  onLocate: () => void;
  onProve: (last4: string) => void;
}) {
  const [paid, setPaid] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[20px] border border-cream/12 bg-white/[0.03] px-5 py-5">
        <p className="font-display text-[19px] text-cream">Show the bill at {tableLabel(table)}</p>
        <p className="mt-2 text-[14.5px] leading-relaxed text-cream/70">
          We only show a table&rsquo;s bill to phones at the restaurant, so your browser will ask for your location. It&rsquo;s
          used for this check and never saved.
        </p>
      </div>
      <Button size="lg" className="w-full" disabled={!!busy} onClick={onLocate}>
        Show my bill
      </Button>
      {paid ? (
        <ProveBox
          id="nrw-any-locate"
          title="Already paid by card?"
          text="Enter the last 4 digits of the card — we’ll find the bill paid at this table."
          busy={busy === 'any'}
          note={note?.key === 'any' ? note : null}
          onProve={onProve}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPaid(true)}
          className="self-center font-sans text-[12.5px] text-cream/60 underline-offset-4 hover:text-brass-light hover:underline"
        >
          Already paid? Add it with your card&rsquo;s last 4 instead
        </button>
      )}
    </div>
  );
}

function TableScreen({
  table,
  data,
  staff,
  busy,
  note,
  onLink,
  onNotMine,
  onDispute,
  onProve,
  onRefresh,
  onLocate,
  onNavigate,
}: {
  table: string;
  data: TableResult;
  staff: boolean;
  busy: string | null;
  note: Note | null;
  onLink: (b: TableBill) => void;
  onNotMine: (b: TableBill) => void;
  onDispute: (b: TableBill) => void;
  onProve: (key: string, last4: string, checkGuid?: string) => void;
  onRefresh: () => void;
  onLocate: () => void;
  onNavigate: () => void;
}) {
  const [showAny, setShowAny] = useState(false);
  const bills = data.bills ?? [];
  const hidden = !!data.proofOnly;
  const cashShown = bills.some((b) => (b.state === 'paid' || b.state === 'paid_earlier') && b.proof === 'cash');
  const paused = data.reason === 'no_tables';
  const geoIssue = data.reason === 'need_location' || data.reason === 'rough_location' || data.reason === 'far';
  const anyBox = (
    <ProveBox
      id="nrw-any"
      title={hidden ? 'Paid by card? Add it here' : 'Bill not listed, or already paid?'}
      text="Enter the last 4 digits of the card you paid with — we’ll find the bill paid at this table in the last 2 hours."
      busy={busy === 'any'}
      note={note?.key === 'any' ? note : null}
      onProve={(d) => onProve('any', d)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {staff && <Notice tone="info">{errorText('staff')}</Notice>}

      {paused ? (
        <div className="rounded-[20px] border border-cream/12 bg-white/[0.03] px-5 py-5">
          <p className="font-display text-[19px] text-cream">Table points are paused for a moment</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-cream/70">
            Paid by card? You can add the bill from your receipt on your points page, up to 7 days later.
          </p>
        </div>
      ) : hidden ? (
        <div className="rounded-[20px] border border-brass/30 bg-brass/[0.06] px-5 py-5">
          <p className="font-display text-[19px] text-cream">We can&rsquo;t show the bill here</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-cream/75">{errorText(data.reason ?? 'need_location')}</p>
          {geoIssue && (
            <button
              type="button"
              onClick={onLocate}
              className="mt-3 font-sans text-[12.5px] text-brass-light underline-offset-4 hover:underline"
            >
              Try my location again
            </button>
          )}
        </div>
      ) : bills.length === 0 ? (
        <div className="rounded-[20px] border border-cream/12 bg-white/[0.03] px-5 py-5">
          <p className="font-display text-[19px] text-cream">No bill on {tableLabel(table)} yet</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-cream/70">
            Once your server starts your order, it appears here on its own — or tap Refresh. Moved tables? Scan the QR code
            on your new table.
          </p>
        </div>
      ) : (
        bills.map((b) => (
          <BillCard
            key={b.guid}
            bill={b}
            staff={staff}
            busy={busy === 'bill:' + b.guid}
            locked={!!busy}
            note={note?.key === 'bill:' + b.guid ? note : null}
            onLink={() => onLink(b)}
            onNotMine={() => onNotMine(b)}
            onDispute={() => onDispute(b)}
            onProve={(d) => onProve('bill:' + b.guid, d, b.guid)}
            onNavigate={onNavigate}
          />
        ))
      )}

      {!staff && !paused && (hidden ? anyBox : showAny ? anyBox : (
        <button
          type="button"
          onClick={() => setShowAny(true)}
          className="self-center font-sans text-[12.5px] text-cream/60 underline-offset-4 hover:text-brass-light hover:underline"
        >
          Bill not listed, or already paid? Enter your card&rsquo;s last 4
        </button>
      ))}

      {!staff && !paused && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-cream/10 bg-white/[0.025] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-cream/60">
          {!cashShown && (
            <p>
              <span className="text-cream/80">Paying cash?</span> Ask your server to add your phone number (the one you sign in
              with) to the bill — the points land on their own within 15 minutes.
            </p>
          )}
          <p>
            <span className="text-cream/80">Sharing a table?</span> Each bill earns once, for whoever adds it first. Want points
            each? Ask for separate checks before you pay.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 font-sans text-[12px]">
        {!hidden && !paused ? (
          <button type="button" onClick={onRefresh} className="text-cream/55 underline-offset-4 hover:text-brass-light hover:underline">
            Refresh
          </button>
        ) : (
          <span />
        )}
        <Link href="/points#receipt" onClick={onNavigate} className="text-cream/55 underline-offset-4 hover:text-brass-light hover:underline">
          Add from a receipt &rarr;
        </Link>
      </div>
    </div>
  );
}

const BADGE: Record<TableBill['state'], { text: string; tone: 'open' | 'paid' | 'done' | 'muted' }> = {
  open: { text: 'Open', tone: 'open' },
  linked: { text: 'Linked to you', tone: 'open' },
  linked_other: { text: 'Open', tone: 'open' },
  paid: { text: 'Paid', tone: 'paid' },
  paid_earlier: { text: 'Paid', tone: 'paid' },
  yours: { text: 'Added ✓', tone: 'done' },
  other: { text: 'Added', tone: 'muted' },
  phone: { text: 'Phone on bill', tone: 'muted' },
  receipt_only: { text: 'Paid', tone: 'muted' },
};

function BillCard({
  bill: b,
  staff,
  busy,
  locked,
  note,
  onLink,
  onNotMine,
  onDispute,
  onProve,
  onNavigate,
}: {
  bill: TableBill;
  staff: boolean;
  busy: boolean;
  locked: boolean;
  note: Note | null;
  onLink: () => void;
  onNotMine: () => void;
  onDispute: () => void;
  onProve: (last4: string) => void;
  onNavigate: () => void;
}) {
  const st = b.state;
  const badge = BADGE[st];
  const details = st !== 'paid_earlier';
  const showPoints = details && st !== 'other' && st !== 'phone';
  const provable = (st === 'paid' || st === 'paid_earlier') && b.proof === 'card';
  const cash = (st === 'paid' || st === 'paid_earlier') && b.proof === 'cash';
  // Items are listed as "2 × Thai Iced Tea" (first 8 lines): "and more" only when the count goes past what's listed.
  const listedQty = b.items.reduce((s, n) => s + (Number(/^(\d+) × /.exec(n)?.[1]) || 1), 0);
  const head = [
    details ? `${b.itemCount} ${b.itemCount === 1 ? 'item' : 'items'}` : 'Bill',
    b.split ? 'split bill' : '',
    b.movedTo ? `moved to ${b.movedTo}` : '',
    b.paid && b.paidAt ? `paid ${timeLA(b.paidAt)}` : '',
  ].filter(Boolean).join(' · ');

  return (
    <div className="overflow-hidden rounded-[20px] border border-brass/25 bg-white/[0.035]">
      <div className="flex items-center justify-between gap-3 border-b border-cream/10 px-5 py-3">
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-cream/60">{head}</span>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.16em]',
            badge.tone === 'open' && 'border-brass/40 bg-brass/10 text-brass-light',
            badge.tone === 'paid' && 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
            badge.tone === 'done' && 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100',
            badge.tone === 'muted' && 'border-cream/20 bg-white/[0.04] text-cream/60',
          )}
        >
          {badge.text}
        </span>
      </div>

      {details && b.items.length > 0 && (
        <ul className="flex flex-col gap-1.5 px-5 py-4">
          {b.items.map((name, i) => (
            <li key={i} className="flex items-baseline gap-2.5 text-[14.5px] leading-snug text-cream/85">
              <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-brass-light/80" />
              <span className="min-w-0">{name}</span>
            </li>
          ))}
          {b.itemCount > listedQty && <li className="pl-3.5 text-[13px] text-cream/45">and more…</li>}
        </ul>
      )}
      {details && b.items.length === 0 && (
        <p className="px-5 py-4 text-[14px] leading-relaxed text-cream/60">Nothing rung in yet.</p>
      )}
      {!details && (
        <p className="px-5 py-4 text-[14px] leading-relaxed text-cream/70">
          A bill at this table was paid just before you checked in. If it was yours, add it with the card&rsquo;s last 4 digits.
        </p>
      )}

      {showPoints && b.subtotal != null && b.points != null && (
        <div className="flex items-end justify-between gap-3 border-t border-cream/10 bg-white/[0.02] px-5 py-4">
          <div>
            <p className="text-[12.5px] text-cream/55">Before tax &amp; tip</p>
            <p className="font-sans text-[15px] text-cream/85">{fmtMoney(b.subtotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12.5px] text-cream/55">{st === 'yours' ? 'Added' : 'Earns'}</p>
            <p className="font-display text-[28px] font-medium leading-none text-gold">+{fmtPoints(b.points)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-cream/10 px-5 py-4">
        {st === 'open' && (
          <>
            <p className="text-[13.5px] leading-relaxed text-cream/70">
              Not paid yet. Link it now so it waits for you — after you pay by card, enter the card&rsquo;s last 4 digits here.
            </p>
            {!staff && (
              <div className="flex items-center gap-4">
                <Button size="sm" variant="secondary" disabled={locked} onClick={onLink}>
                  {busy ? 'Linking…' : 'This is my bill'}
                </Button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={onNotMine}
                  className="font-sans text-[12px] text-cream/55 underline-offset-4 hover:text-brass-light hover:underline disabled:opacity-50"
                >
                  Not my bill
                </button>
              </div>
            )}
          </>
        )}

        {st === 'linked' && (
          <>
            <p className="text-[13.5px] leading-relaxed text-cream/70">
              {b.auto ? 'We linked this bill to you because you checked in before it was opened. ' : 'Linked to you. '}
              When it&rsquo;s paid, add it here with your card&rsquo;s last 4 digits — or later on your points page.
            </p>
            <button
              type="button"
              disabled={locked}
              onClick={onNotMine}
              className="self-start font-sans text-[12px] text-cream/55 underline-offset-4 hover:text-brass-light hover:underline disabled:opacity-50"
            >
              Not my bill
            </button>
          </>
        )}

        {st === 'linked_other' && (
          <p className="text-[13.5px] leading-relaxed text-cream/70">
            Someone else at the table linked this bill. Whoever pays by card adds it with the card&rsquo;s last 4 digits.
          </p>
        )}

        {provable && !staff && (
          <Last4Form id={'nrw-' + b.guid} busy={busy} locked={locked} cta={b.points ? `Add ${fmtPoints(b.points)} pts` : 'Add points'} onSubmit={onProve} />
        )}

        {cash && <Notice tone="info">{errorText('cash_bill')}</Notice>}

        {st === 'yours' && <Notice tone="ok">On your account — thank you!</Notice>}

        {st === 'other' && (
          <>
            <p className="text-[13.5px] leading-relaxed text-cream/70">Another member already added this bill — each bill earns once.</p>
            {!staff && (
              <Button size="sm" variant="secondary" className="self-start" disabled={locked} onClick={onDispute}>
                {busy ? 'Sending…' : 'That’s my bill'}
              </Button>
            )}
          </>
        )}

        {st === 'phone' && <Notice tone="info">{errorText('has_phone')}</Notice>}

        {st === 'receipt_only' && (
          <p className="text-[13.5px] leading-relaxed text-cream/70">
            Paid over 2 hours ago —{' '}
            <Link href="/points#receipt" onClick={onNavigate} className="text-brass-light underline-offset-4 hover:underline">
              add it from your receipt
            </Link>
            .
          </p>
        )}

        {note && (
          <p
            role={note.tone === 'ok' ? 'status' : 'alert'}
            className={cn(
              'rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed',
              note.tone === 'ok' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-500/10 text-red-200',
            )}
          >
            {note.text}
          </p>
        )}
      </div>
    </div>
  );
}

function ProveBox({
  id,
  title,
  text,
  busy,
  note,
  onProve,
}: {
  id: string;
  title: string;
  text: string;
  busy: boolean;
  note: Note | null;
  onProve: (last4: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-cream/12 bg-white/[0.03] px-5 py-5">
      <div>
        <p className="font-display text-[17px] text-cream">{title}</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-cream/65">{text}</p>
      </div>
      <Last4Form id={id} busy={busy} locked={busy} cta="Add points" onSubmit={onProve} />
      {note && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-red-200">
          {note.text}
        </p>
      )}
    </div>
  );
}

function Last4Form({
  id,
  busy,
  locked,
  cta,
  onSubmit,
}: {
  id: string;
  busy: boolean;
  locked: boolean;
  cta: string;
  onSubmit: (last4: string) => void;
}) {
  const [digits, setDigits] = useState('');
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (digits.length === 4 && !locked) onSubmit(digits);
      }}
    >
      <label htmlFor={id} className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">
        Last 4 digits of the card you paid with
      </label>
      <div className="flex items-stretch gap-2.5">
        <input
          id={id}
          className={cn(
            'h-12 w-[7.5rem] shrink-0 rounded-2xl border border-cream/15 bg-white/[0.05] px-3 text-center font-display text-[22px] tracking-[0.3em] text-cream',
            'outline-none transition-[border-color,background-color] duration-200 placeholder:text-cream/30 focus:border-brass-light/70 focus:bg-white/[0.07]',
          )}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="••••"
          value={digits}
          onChange={(e) => setDigits(last4Input(e.target.value))}
        />
        <Button type="submit" size="md" disabled={digits.length !== 4 || locked} className="min-w-0 flex-1 px-4">
          {busy ? 'Checking…' : cta}
        </Button>
      </div>
      <p className="text-[12px] leading-relaxed text-cream/45">{WALLET_HINT}</p>
    </form>
  );
}

/* ── bits ───────────────────────────────────────────────────────────── */

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
