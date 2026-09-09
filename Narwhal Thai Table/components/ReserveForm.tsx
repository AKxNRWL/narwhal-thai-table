'use client';

import { useState, type ReactNode } from 'react';
import { submitNetlifyForm } from '@/lib/netlifyForm';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { fireConfetti } from '@/components/fx/confetti';

/** Reservation time slots: 11:00 AM → 10:00 PM, every 30 minutes
 *  (last seating about an hour before the 11:00 PM close). */
const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let mins = 11 * 60; mins <= 22 * 60; mins += 30) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h24 < 12 ? 'AM' : 'PM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    slots.push(`${h12}:${m.toString().padStart(2, '0')} ${period}`);
  }
  return slots;
})();

/* ---- field styling (kept local so each form stays self-contained) ---- */
const field =
  'min-h-12 w-full rounded-xl border border-cream/15 bg-navy-deep/60 px-4 py-3 font-sans text-[15px] text-cream [color-scheme:dark] ' +
  'placeholder:text-cream/35 transition focus:border-brass-light focus:outline-none focus:ring-2 focus:ring-brass/40';
const selectField = cn(field, 'cursor-pointer appearance-none pr-11 invalid:text-cream/45 [&_option]:bg-navy [&_option]:text-cream');
const textareaField = cn(field, 'min-h-[132px] resize-y');
const labelCls = 'mb-1.5 block font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-cream/60';

function Req() {
  return <span aria-hidden="true" className="ml-0.5 text-brass">*</span>;
}

function Field({ id, label, required, full, children }: { id: string; label: ReactNode; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className={cn('min-w-0', full && 'sm:col-span-2')}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required && <Req />}
      </label>
      {children}
    </div>
  );
}

/** Wraps a native <select> (appearance-none) with a brass chevron. */
function SelectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-brass-light">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </span>
    </div>
  );
}

/**
 * Reservation form.
 *
 * Posts to /api/reservation, which runs the same pipeline as an Aileen booking:
 * the Netlify form notification to reservations@, a record in the Control Room
 * list, and a "we've got your request" email to the guest.
 *
 * If that route is down for any reason we fall back to posting /__forms.html
 * directly — the old behaviour. The guest then gets no email, but the booking
 * still reaches the restaurant, which is the part that must never fail.
 */
export default function ReserveForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Honeypot — bots fill hidden fields; real users don't
    const hp = (form.elements.namedItem('bot-field') as HTMLInputElement | null)?.value;
    if (hp) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSending(true);
    setError(null);

    const payload: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string') payload[key] = value;
    });

    fetch('/api/reservation', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        setSending(false);
        setSubmitted(true); fireConfetti();
      })
      .catch(() =>
        // Fallback: the plain Netlify form post, so the restaurant still gets it.
        submitNetlifyForm(form)
          .then(() => { setSending(false); setSubmitted(true); fireConfetti(); })
          .catch(() => {
            setSending(false);
            setError('Something went wrong — please call us or email welcome@narwhalthaihb.com.');
          }),
      );
  }

  return (
    <form
      className="relative rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.03] p-6 shadow-card sm:p-8"
      id="reserve-form"
      method="post"
      action=""
      noValidate
      onSubmit={handleSubmit}
      aria-describedby="reserve-form-status"
    >
      <input type="hidden" name="form-name" value="reservation" />
      <div className="font-display text-[clamp(26px,3vw,34px)] font-medium leading-tight tracking-[-0.01em] text-cream [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light">
        Book a <em>seat</em> at the table
      </div>
      <div className="mt-2 font-serif text-[16px] italic leading-relaxed text-cream/70">We&apos;ll text or email you to confirm — usually within a few hours.</div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="rsv-first" label="First Name" required>
          <input id="rsv-first" name="first_name" type="text" autoComplete="given-name" required className={field} />
        </Field>
        <Field id="rsv-last" label="Last Name" required>
          <input id="rsv-last" name="last_name" type="text" autoComplete="family-name" required className={field} />
        </Field>

        <Field id="rsv-email" label="Email" required>
          <input id="rsv-email" name="email" type="email" autoComplete="email" required className={field} />
        </Field>
        <Field id="rsv-phone" label="Phone" required>
          <input id="rsv-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={field} />
        </Field>

        <Field id="rsv-date" label="Date" required>
          <input id="rsv-date" name="date" type="date" required className={field} />
        </Field>
        <Field id="rsv-time" label="Time" required>
          <SelectShell>
            <select id="rsv-time" name="time" required defaultValue="" className={selectField}>
              <option value="">Select</option>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </SelectShell>
        </Field>

        <Field id="rsv-party" label="Party Size" required full>
          <SelectShell>
            <select id="rsv-party" name="party_size" required defaultValue="" className={selectField}>
              <option value="">Select</option>
              <option>2 Guests</option><option>3 Guests</option>
              <option>4 Guests</option><option>5 Guests</option>
              <option>6 Guests</option><option>7+ (please specify)</option>
            </select>
          </SelectShell>
        </Field>

        <Field id="rsv-notes" label="Anything we should know?" full>
          <textarea id="rsv-notes" name="notes" rows={4} placeholder="Allergies, spice level, occasion, seating preference..." className={textareaField}></textarea>
        </Field>
      </div>

      {/* Honeypot for spam bots — never visible/focusable for real users */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="rsv-hp">Leave blank</label>
        <input id="rsv-hp" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8">
        <Button type="submit" variant="primary" size="lg" arrow={!sending && !submitted} disabled={sending || submitted} className="w-full sm:w-auto">
          {submitted ? 'Request Sent' : sending ? 'Sending…' : 'Request Reservation'}
        </Button>
        <p
          id="reserve-form-status"
          role="status"
          aria-live="polite"
          className="mt-4 min-h-[1em] font-serif text-[16px] italic leading-relaxed text-brass-light"
        >
          {submitted && 'Thank you — we will confirm your reservation within a few hours.'}
          {error && error}
        </p>
      </div>
    </form>
  );
}
