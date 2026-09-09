'use client';

import { useState, type ReactNode } from 'react';
import { submitNetlifyForm } from '@/lib/netlifyForm';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { fireConfetti } from '@/components/fx/confetti';

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

/** Catering / private events enquiry → Netlify "catering" form. */
export default function CateringForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const hp = (form.elements.namedItem('bot-field') as HTMLInputElement | null)?.value;
    if (hp) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setSending(true);
    setError(null);

    submitNetlifyForm(form)
      .then(() => { setSending(false); setSubmitted(true); fireConfetti(); })
      .catch(() => {
        setSending(false);
        setError('Something went wrong — please email catering@narwhalthaihb.com.');
      });
  }

  return (
    <form
      className="relative rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.03] p-6 shadow-card sm:p-8"
      id="catering-form"
      method="post"
      noValidate
      onSubmit={handleSubmit}
      aria-describedby="catering-form-status"
    >
      <input type="hidden" name="form-name" value="catering" />
      <div className="font-display text-[clamp(26px,3vw,34px)] font-medium leading-tight tracking-[-0.01em] text-cream [&_em]:font-serif [&_em]:font-normal [&_em]:italic [&_em]:text-brass-light">
        Catering &amp; <em>private events</em>
      </div>
      <div className="mt-2 font-serif text-[16px] italic leading-relaxed text-cream/70">Buyouts, family-style tastings, off-site catering — tell us about your event.</div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="cat-name" label="Name" required full>
          <input id="cat-name" name="name" type="text" autoComplete="name" required className={field} />
        </Field>

        <Field id="cat-email" label="Email" required>
          <input id="cat-email" name="email" type="email" autoComplete="email" required className={field} />
        </Field>
        <Field id="cat-phone" label="Phone" required>
          <input id="cat-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={field} />
        </Field>

        <Field id="cat-date" label="Event date" required>
          <input id="cat-date" name="event_date" type="date" required className={field} />
        </Field>
        <Field id="cat-guests" label="Guests" required>
          <SelectShell>
            <select id="cat-guests" name="guests" required defaultValue="" className={selectField}>
              <option value="">Select</option>
              <option>Up to 10</option>
              <option>10–25</option>
              <option>25–50</option>
              <option>50–100</option>
              <option>100+</option>
            </select>
          </SelectShell>
        </Field>

        <Field id="cat-type" label="Event type" required>
          <SelectShell>
            <select id="cat-type" name="event_type" required defaultValue="" className={selectField}>
              <option value="">Select</option>
              <option>Private dinner</option>
              <option>Corporate event</option>
              <option>Full restaurant buyout</option>
              <option>Off-site catering</option>
              <option>Other</option>
            </select>
          </SelectShell>
        </Field>
        <Field id="cat-location" label="Where?" required>
          <SelectShell>
            <select id="cat-location" name="location" required defaultValue="" className={selectField}>
              <option value="">Select</option>
              <option>At the restaurant</option>
              <option>Off-site (we come to you)</option>
            </select>
          </SelectShell>
        </Field>

        <Field id="cat-budget" label="Budget (per head or total)" full>
          <input id="cat-budget" name="budget" type="text" placeholder="e.g. $60 per head, or $3,000 total" className={field} />
        </Field>

        <Field id="cat-message" label="Tell us more" full>
          <textarea id="cat-message" name="message" rows={4} placeholder="Occasion, dietary needs, must-have dishes, timing..." className={textareaField}></textarea>
        </Field>
      </div>

      {/* Honeypot for spam bots — never visible/focusable for real users */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="cat-hp">Leave blank</label>
        <input id="cat-hp" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8">
        <Button type="submit" variant="primary" size="lg" arrow={!sending && !submitted} disabled={sending || submitted} className="w-full sm:w-auto">
          {submitted ? 'Request Sent' : sending ? 'Sending…' : 'Request Catering'}
        </Button>
        <p
          id="catering-form-status"
          role="status"
          aria-live="polite"
          className="mt-4 min-h-[1em] font-serif text-[16px] italic leading-relaxed text-brass-light"
        >
          {submitted && 'Thank you — we will be in touch about your event shortly.'}
          {error && error}
        </p>
      </div>
    </form>
  );
}
