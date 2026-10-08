'use client';

import { useCallback, useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import RewardsAuth from '@/components/rewards/RewardsAuth';
import { cn } from '@/lib/cn';
import {
  WALLET_HINT,
  clearSession,
  currentSession,
  errorText,
  fmtPoints,
  last4Input,
  onSessionChange,
  rewardsCall,
  type Balance,
  type ClaimResult,
  type PendingLink,
  type Session,
} from '@/lib/rewards';

/**
 * /points — a member's balance, bills linked at a table (finished here with the card's last 4 once paid),
 * a receipt form for card-paid bills not added at the table, history, and the rules. Rewards v2: every
 * bill needs proof of payment — the last 4 digits of the card that paid it; cash bills get the guest's
 * phone added in Toast by the server.
 */

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
                Sign in with your mobile number to see your points and history, or to add a bill from your receipt. Your
                number is your Narwhal Rewards account — one per number, the same on every device.
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
              <h2 className="font-display text-[19px] text-cream">Bills linked to you</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-cream/60">
                Once a bill is paid, add it with the last 4 digits of the card that paid it.
              </p>
              <ul className="mt-3 flex flex-col divide-y divide-cream/10">
                {balance.pending.map((p) => (
                  <PendingRow key={p.id} link={p} staff={balance.staff} onAdded={load} />
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

const field =
  'h-12 w-full rounded-2xl border border-cream/15 bg-white/[0.05] px-4 font-sans text-[16px] text-cream placeholder:text-cream/35 ' +
  'outline-none transition-[border-color,background-color] duration-200 focus:border-brass-light/70 focus:bg-white/[0.07] [color-scheme:dark]';

/** A bill linked at a table: waiting for payment, or paid — then finished here with the card's last 4. */
function PendingRow({ link, staff, onAdded }: { link: PendingLink; staff: boolean; onAdded: () => void }) {
  const [digits, setDigits] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    if (digits.length !== 4 || busy) return;
    setBusy(true);
    setMsg(null);
    const r = await rewardsCall<ClaimResult>('prove', { claimId: link.id, last4: digits, v: 2 }, true);
    setBusy(false);
    if (!r.ok) {
      setMsg({ ok: false, text: errorText(r.error === 'proof_mismatch' ? 'proof_mismatch_bill' : r.error) });
      return;
    }
    setMsg({ ok: true, text: `+${fmtPoints(r.data.points)} points added.` });
    window.setTimeout(onAdded, 1200);
  }

  return (
    <li className="flex flex-col gap-3 py-3.5">
      <div className="flex items-center justify-between gap-4 text-[14px]">
        <span className="text-cream/85">
          {link.label}
          {link.movedTo ? ` · moved to ${link.movedTo}` : ''}
        </span>
        <span className="shrink-0 text-cream/45">{prettyDate(link.date)}</span>
      </div>
      {!link.paid ? (
        <p className="text-[13px] text-cream/55">Waiting for payment — come back here once it&rsquo;s paid.</p>
      ) : link.proof === 'cash' ? (
        <p className="text-[13px] leading-relaxed text-cream/60">{errorText('cash_bill')}</p>
      ) : staff ? null : (
        <form onSubmit={finish} className="flex flex-col gap-2">
          <div className="flex items-stretch gap-2.5">
            <input
              aria-label="Last 4 digits of the card you paid with"
              className={cn(field, 'w-[7.5rem] shrink-0 px-3 text-center font-display text-[20px] tracking-[0.3em]')}
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="••••"
              value={digits}
              onChange={(e) => setDigits(last4Input(e.target.value))}
            />
            <Button type="submit" size="md" disabled={digits.length !== 4 || busy} className="min-w-0 flex-1 px-4">
              {busy ? 'Checking…' : 'Add points'}
            </Button>
          </div>
          <p className="text-[12px] leading-relaxed text-cream/45">Last 4 digits of the card you paid with. {WALLET_HINT}</p>
        </form>
      )}
      {msg && (
        <p
          role={msg.ok ? 'status' : 'alert'}
          className={cn(
            'rounded-xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed',
            msg.ok ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-500/10 text-red-200',
          )}
        >
          {msg.text}
        </p>
      )}
    </li>
  );
}

type Receipt = { checkNumber: string; date: string; total: string; last4: string };

function ReceiptForm({ onAdded }: { onAdded: () => void }) {
  const [num, setNum] = useState('');
  const [date, setDate] = useState(() => todayLA());
  const [total, setTotal] = useState('');
  const [last4, setLast4] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Another member already added this bill: the guest can say it's theirs (same receipt, card digits included).
  const [claimed, setClaimed] = useState<Receipt | null>(null);

  const ok =
    /^\d{1,8}$/.test(num) && Number(total.replace(/[$,\s]/g, '')) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date) && last4.length === 4;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    setMsg(null);
    setClaimed(null);
    const receipt: Receipt = { checkNumber: num, date, total, last4 };
    const r = await rewardsCall<ClaimResult>('receipt_claim', receipt, true);
    setBusy(false);
    if (!r.ok) {
      setMsg({ ok: false, text: errorText(r.error) });
      if (r.error === 'already_claimed') setClaimed(receipt);
      return;
    }
    setMsg({ ok: true, text: `+${fmtPoints(r.data.points)} points added.` });
    setNum('');
    setTotal('');
    setLast4('');
    onAdded();
  }

  async function dispute() {
    if (!claimed || busy) return;
    setBusy(true);
    const r = await rewardsCall<{ ok: true }>('dispute', claimed, true);
    setBusy(false);
    setClaimed(null);
    if (!r.ok) {
      setMsg({ ok: false, text: errorText(r.error === 'not_found' ? 'receipt_not_found' : r.error) });
      return;
    }
    setMsg({ ok: true, text: 'Thanks — we’ll check this bill and add the points if it’s yours.' });
    setNum('');
    setTotal('');
    setLast4('');
  }

  return (
    <section id="receipt" className={cn(card, 'scroll-mt-32 px-6 py-6')}>
      <h2 className="font-display text-[19px] text-cream">Add a bill from your receipt</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-cream/60">
        Paid by card and didn&rsquo;t add it at the table? Enter these from your receipt — up to 7 days after your visit.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
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
          <span className="text-[12px] text-cream/45">Before or after tip — either works.</span>
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-brass-light">Card&rsquo;s last 4</span>
          <input
            className={cn(field, 'tracking-[0.3em]')}
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="••••"
            value={last4}
            onChange={(e) => setLast4(last4Input(e.target.value))}
          />
          <span className="text-[12px] text-cream/45">{WALLET_HINT}</span>
        </label>
        <div className="flex flex-col gap-3 sm:col-span-2">
          <Button type="submit" size="md" disabled={!ok || busy} className="w-full sm:w-auto sm:self-start">
            {busy ? 'Checking…' : 'Add points'}
          </Button>
          <p className="text-[12.5px] leading-relaxed text-cream/50">
            Paid in cash? Receipts without a card can&rsquo;t be added here — next time, ask your server to add your phone
            number to the bill and the points land on their own.
          </p>
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
      {claimed && claimed.checkNumber === num && claimed.date === date && claimed.total === total && claimed.last4 === last4 && (
        <Button variant="secondary" size="sm" className="mt-3" disabled={busy} onClick={dispute}>
          {busy ? 'Sending…' : 'That’s my bill'}
        </Button>
      )}
    </section>
  );
}

function HowItWorks() {
  const rows: { t: string; d: string }[] = [
    {
      t: 'One account per phone number',
      d: 'Your mobile number is your Narwhal Rewards account — no card or app. Sign in with the same number on any phone, and give that number when a server adds it to your bill or you order online. Points on different numbers stay separate (new number? Ask us to move them).',
    },
    {
      t: '100 points for every $1',
      d: 'On food and soft drinks, before tax and tip — dine-in, takeout and online orders placed directly with us.',
    },
    {
      t: 'At your table',
      d: 'Scan the QR card on your table and tap “Earn points”. After you pay by card, enter the last 4 digits of that card — that’s how we know the bill is yours. Confirm your phone once; this device remembers you.',
    },
    {
      t: 'Apple Pay or Google Pay',
      d: 'Points go to your account whatever you pay with. Your phone pays with its own card number, so enter the last 4 digits printed on your receipt — not the ones on your plastic card.',
    },
    {
      t: 'Sharing a table',
      d: 'Each bill earns once, for the first member who adds it. Want points each? Ask for separate checks before paying — one check split across cards still counts as one bill.',
    },
    {
      t: 'Paying cash',
      d: 'Ask your server to add your phone number to the bill — the points land on their own within 15 minutes.',
    },
    {
      t: 'Ordering online',
      d: 'Use the same phone number at checkout on our online ordering and the points land on their own.',
    },
    {
      t: 'Forgot? Use your receipt',
      d: 'Add a card-paid bill here with its check number, date, total and the card’s last 4 digits, up to 7 days later.',
    },
    {
      t: 'What doesn’t earn',
      d: 'Alcohol, gift cards, and orders through DoorDash, Uber Eats or Grubhub. Refunded items come off.',
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
