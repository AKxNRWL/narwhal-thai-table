'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import RewardsAuth from '@/components/rewards/RewardsAuth';
import { cn } from '@/lib/cn';
import {
  clearSession,
  currentSession,
  errorText,
  fmtPoints,
  onSessionChange,
  rewardsCall,
  type Balance,
  type ClaimResult,
  type Session,
} from '@/lib/rewards';

/** /points — a member's balance, history, a receipt form for bills not added at the table, and the rules. */

function todayLA(offsetDays = 0): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const card = 'rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] shadow-card backdrop-blur-md';

export default function PointsClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setErr('');
    const r = await rewardsCall<Balance>('balance', {}, true);
    if (!r.ok) {
      if (r.error === 'auth') setSession(null);
      else setErr(errorText(r.error));
      return;
    }
    setBalance(r.data);
  }, []);

  useEffect(() => {
    const s = currentSession();
    setSession(s);
    setChecked(true);
    if (s) load();
    return onSessionChange(() => setSession(currentSession()));
  }, [load]);

  function signOut() {
    rewardsCall('logout', {}, true).finally(() => clearSession());
    clearSession();
    setSession(null);
    setBalance(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {!checked ? (
        <div className={cn(card, 'h-56 animate-pulse')} />
      ) : !session ? (
        <div className={cn(card, 'mx-auto w-full max-w-md px-6 py-7')}>
          <RewardsAuth
            intro={
              <p className="text-[15px] leading-relaxed text-cream/75">
                Sign in with your phone to see your points and history, or to add a bill from your receipt.
              </p>
            }
            onSignedIn={() => {
              setSession(currentSession());
              load();
            }}
          />
        </div>
      ) : (
        <>
          <div className={cn(card, 'relative overflow-hidden px-6 py-8 text-center sm:px-10')}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(200,162,78,0.16),transparent_70%)]" />
            <p className="relative font-sans text-[10.5px] uppercase tracking-[0.26em] text-cream/55">Your balance</p>
            {balance ? (
              <p className="relative mt-3 font-display text-[clamp(44px,9vw,64px)] font-medium leading-none text-gold">
                {fmtPoints(balance.points)}
              </p>
            ) : (
              <div className="relative mx-auto mt-3 h-14 w-48 animate-pulse rounded-xl bg-white/[0.06]" />
            )}
            <p className="relative mt-2 text-[13.5px] text-cream/55">points</p>
            <p className="relative mt-5 font-sans text-[12.5px] text-cream/50">
              Signed in as <span className="text-cream/75">{session.phoneMasked}</span> ·{' '}
              <button type="button" className="underline-offset-4 hover:text-brass-light hover:underline" onClick={signOut}>
                Sign out
              </button>
            </p>
            {balance?.staff && (
              <p className="relative mx-auto mt-4 max-w-sm rounded-xl border border-cream/15 bg-white/[0.04] px-3.5 py-2.5 text-[13.5px] text-cream/75">
                {errorText('staff')}
              </p>
            )}
          </div>

          {err && (
            <div className="flex flex-col items-center gap-3">
              <p role="alert" className="text-[14px] text-red-200">
                {err}
              </p>
              <Button variant="secondary" size="sm" onClick={load}>
                Try again
              </Button>
            </div>
          )}

          {balance && balance.pending.length > 0 && (
            <section className={cn(card, 'px-6 py-5')}>
              <h2 className="font-display text-[19px] text-cream">Waiting for payment</h2>
              <ul className="mt-3 flex flex-col divide-y divide-cream/10">
                {balance.pending.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-2.5 text-[14px]">
                    <span className="text-cream/80">{p.label}</span>
                    <span className="shrink-0 text-cream/45">{prettyDate(p.date)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ReceiptForm onAdded={load} />

          {balance && (
            <section className={cn(card, 'px-6 py-5')}>
              <h2 className="font-display text-[19px] text-cream">History</h2>
              {balance.history.length === 0 ? (
                <p className="mt-3 text-[14.5px] leading-relaxed text-cream/60">
                  No points yet — add your next bill at the table, or with your receipt above.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col divide-y divide-cream/10">
                  {balance.history.map((h, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 py-3">
                      <span className="min-w-0">
                        <span className="block text-[14.5px] text-cream/85">{h.label}</span>
                        <span className="block text-[12.5px] text-cream/45">{prettyDate(h.date)}</span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 font-sans text-[15px] font-medium tabular-nums',
                          h.points < 0 ? 'text-cream/55' : 'text-brass-light',
                        )}
                      >
                        {h.points < 0 ? '−' : '+'}
                        {fmtPoints(Math.abs(h.points))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      <HowItWorks />
    </div>
  );
}

function ReceiptForm({ onAdded }: { onAdded: () => void }) {
  const [num, setNum] = useState('');
  const [date, setDate] = useState(() => todayLA());
  const [total, setTotal] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ok = /^\d{1,8}$/.test(num) && Number(total.replace(/[$,\s]/g, '')) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    setMsg(null);
    const r = await rewardsCall<ClaimResult>('receipt_claim', { checkNumber: num, date, total }, true);
    setBusy(false);
    if (!r.ok) {
      setMsg({ ok: false, text: errorText(r.error) });
      return;
    }
    setMsg({
      ok: true,
      text:
        r.data.status === 'earned'
          ? `+${fmtPoints(r.data.points)} points added.`
          : `Bill linked — ${fmtPoints(r.data.points)} points land shortly.`,
    });
    setNum('');
    setTotal('');
    onAdded();
  }

  const field =
    'h-12 w-full rounded-2xl border border-cream/15 bg-white/[0.05] px-4 font-sans text-[16px] text-cream placeholder:text-cream/35 ' +
    'outline-none transition-[border-color,background-color] duration-200 focus:border-brass-light/70 focus:bg-white/[0.07] [color-scheme:dark]';

  return (
    <section id="receipt" className={cn(card, 'scroll-mt-32 px-6 py-6')}>
      <h2 className="font-display text-[19px] text-cream">Add a bill from your receipt</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-cream/60">
        Forgot to add it at the table? Enter the check number, date and total from your receipt — up to 7 days after your visit.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">Check #</span>
          <input
            className={field}
            inputMode="numeric"
            placeholder="e.g. 128"
            value={num}
            onChange={(e) => setNum(e.target.value.replace(/\D/g, '').slice(0, 8))}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">Date</span>
          <input className={field} type="date" min={todayLA(7)} max={todayLA()} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">Total</span>
          <span className="relative flex items-center">
            <span aria-hidden="true" className="pointer-events-none absolute left-4 text-[16px] text-cream/45">$</span>
            <input
              className={cn(field, 'pl-8')}
              inputMode="decimal"
              placeholder="54.98"
              value={total}
              onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, '').slice(0, 9))}
            />
          </span>
        </label>
        <div className="sm:col-span-3">
          <Button type="submit" size="md" disabled={!ok || busy} className="w-full sm:w-auto">
            {busy ? 'Checking…' : 'Add points'}
          </Button>
        </div>
      </form>
      {msg && (
        <p
          role={msg.ok ? 'status' : 'alert'}
          className={cn(
            'mt-4 rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed',
            msg.ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-500/10 text-red-200',
          )}
        >
          {msg.text}
        </p>
      )}
    </section>
  );
}

function HowItWorks() {
  const rows: { t: string; d: string }[] = [
    {
      t: '100 points for every $1',
      d: 'On food and soft drinks, before tax and tip — dine-in, takeout and online orders placed directly with us.',
    },
    {
      t: 'At your table',
      d: 'Scan the QR card on your table, tap “Earn points” and add the bill. Confirm your phone once; this device remembers you.',
    },
    {
      t: 'Ordering online',
      d: 'Use the same phone number at checkout on our online ordering and the points land on their own.',
    },
    {
      t: 'Forgot? Use your receipt',
      d: 'Add any bill here with its check number, date and total, up to 7 days later.',
    },
    {
      t: 'What doesn’t earn',
      d: 'Alcohol, and orders placed through DoorDash, Uber Eats or Grubhub. Each bill can be added to one account, once.',
    },
    {
      t: 'Rewards counter',
      d: 'Trade points for Narwhal keepsakes at the restaurant — opening soon. Ask your server.',
    },
  ];
  return (
    <section className={cn(card, 'px-6 py-6')}>
      <h2 className="font-display text-[19px] text-cream">How Narwhal Rewards works</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.t}>
            <dt className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">{r.t}</dt>
            <dd className="mt-1.5 text-[14.5px] leading-relaxed text-cream/70">{r.d}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
