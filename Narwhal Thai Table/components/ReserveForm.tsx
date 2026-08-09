'use client';

import { useState } from 'react';
import { submitNetlifyForm } from '@/lib/netlifyForm';

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
        setSubmitted(true);
      })
      .catch(() =>
        // Fallback: the plain Netlify form post, so the restaurant still gets it.
        submitNetlifyForm(form)
          .then(() => { setSending(false); setSubmitted(true); })
          .catch(() => {
            setSending(false);
            setError('Something went wrong — please call us or email welcome@narwhalthaihb.com.');
          }),
      );
  }

  return (
    <form
      className="reserve-form"
      id="reserve-form"
      method="post"
      action=""
      noValidate
      onSubmit={handleSubmit}
      aria-describedby="reserve-form-status"
    >
      <input type="hidden" name="form-name" value="reservation" />
      <div className="form-title">Book a <em>seat</em> at the table</div>
      <div className="form-sub">We&apos;ll text or email you to confirm — usually within a few hours.</div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rsv-first">First Name</label>
          <input id="rsv-first" name="first_name" type="text" autoComplete="given-name" required />
        </div>
        <div className="form-group">
          <label htmlFor="rsv-last">Last Name</label>
          <input id="rsv-last" name="last_name" type="text" autoComplete="family-name" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rsv-email">Email</label>
          <input id="rsv-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="rsv-phone">Phone</label>
          <input id="rsv-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rsv-date">Date</label>
          <input id="rsv-date" name="date" type="date" required />
        </div>
        <div className="form-group">
          <label htmlFor="rsv-time">Time</label>
          <select id="rsv-time" name="time" required defaultValue="">
            <option value="">Select</option>
            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="rsv-party">Party Size</label>
        <select id="rsv-party" name="party_size" required defaultValue="">
          <option value="">Select</option>
          <option>2 Guests</option><option>3 Guests</option>
          <option>4 Guests</option><option>5 Guests</option>
          <option>6 Guests</option><option>7+ (please specify)</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="rsv-notes">Anything we should know?</label>
        <textarea id="rsv-notes" name="notes" placeholder="Allergies, spice level, occasion, seating preference..."></textarea>
      </div>

      {/* Honeypot for spam bots — never visible/focusable for real users */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="rsv-hp">Leave blank</label>
        <input id="rsv-hp" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn-submit" disabled={sending || submitted}>
        {submitted ? 'Request Sent' : sending ? 'Sending…' : 'Request Reservation'}
      </button>
      <p
        id="reserve-form-status"
        role="status"
        aria-live="polite"
        style={{
          minHeight: '1em', marginTop: 14,
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          color: 'var(--brass-deep)', fontSize: 16,
        }}
      >
        {submitted && 'Thank you — we will confirm your reservation within a few hours.'}
        {error && error}
      </p>
    </form>
  );
}
