'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  SMS_DISCLOSURE,
  errorText,
  formatUsPhone,
  otpReady,
  phoneDigits,
  rewardsCall,
  saveSession,
  type SignInResult,
} from '@/lib/rewards';

/**
 * Sign in to Narwhal Rewards with a phone number + SMS code (Twilio Verify via the
 * `rewards` function). Two steps, no password. The marketing-texts box is optional,
 * unticked by default, and its exact wording is stored with the consent.
 */
export default function RewardsAuth({
  onSignedIn,
  intro,
}: {
  onSignedIn: (r: SignInResult) => void;
  intro?: React.ReactNode;
}) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [honey, setHoney] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(true);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    otpReady().then((ok) => alive && setReady(ok));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  const digits = phoneDigits(phone);
  const phoneOk = /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);

  async function sendCode() {
    if (!phoneOk || busy) return;
    setBusy(true);
    setErr('');
    const r = await rewardsCall<{ ok: true }>('otp_start', { phone: digits, website: honey });
    setBusy(false);
    if (!r.ok) {
      setErr(errorText(r.error));
      return;
    }
    setCode('');
    setStep('code');
    setResendIn(30);
  }

  async function confirm(value = code) {
    const c = value.replace(/\D/g, '');
    if (c.length !== 6 || busy) return;
    setBusy(true);
    setErr('');
    const r = await rewardsCall<SignInResult>('otp_check', { phone: digits, code: c, smsOptIn: optIn });
    setBusy(false);
    if (!r.ok) {
      setErr(errorText(r.error));
      setCode('');
      codeRef.current?.focus();
      return;
    }
    saveSession({ token: r.data.token, phoneMasked: r.data.phoneMasked });
    onSignedIn(r.data);
  }

  if (!ready) {
    return (
      <p className="rounded-2xl border border-brass/25 bg-brass/[0.06] px-4 py-3 text-[14.5px] leading-relaxed text-cream/80">
        Narwhal Rewards sign-in is switching on shortly. Please check back in a little while — your bill can still be
        added later with your receipt (up to 7 days).
      </p>
    );
  }

  const field =
    'h-12 w-full rounded-2xl border border-cream/15 bg-white/[0.05] px-4 font-sans text-[16px] text-cream placeholder:text-cream/35 ' +
    'outline-none transition-[border-color,background-color] duration-200 focus:border-brass-light/70 focus:bg-white/[0.07]';

  return (
    <div className="flex flex-col gap-4">
      {intro}
      {step === 'phone' ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-brass-light">Mobile number</span>
            <span className="relative flex items-center">
              <span aria-hidden="true" className="pointer-events-none absolute left-4 font-sans text-[16px] text-cream/45">+1</span>
              <input
                ref={phoneRef}
                className={cn(field, 'pl-11 tracking-[0.02em]')}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(714) 555-0123"
                value={phone}
                onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                aria-describedby="nrw-phone-note"
              />
            </span>
          </label>
          {/* Honeypot: real guests never see or fill this. */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            name="website"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cream/10 bg-white/[0.025] px-3.5 py-3">
            <input
              type="checkbox"
              className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-[#C8A24E]"
              checked={optIn}
              onChange={(e) => setOptIn(e.target.checked)}
            />
            <span className="text-[12.5px] leading-[1.55] text-cream/65">
              <span className="text-cream/85">Optional:</span> {SMS_DISCLOSURE}
            </span>
          </label>
          <Button type="submit" size="lg" disabled={!phoneOk || busy} className="w-full">
            {busy ? 'Sending…' : 'Text me a code'}
          </Button>
          <p id="nrw-phone-note" className="text-center text-[12px] leading-relaxed text-cream/45">
            Your number is your Rewards account &mdash; use the same one every visit. We text a one-time 6-digit code to
            confirm it&rsquo;s yours. Msg &amp; data rates may apply.
          </p>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
        >
          <p className="text-[15px] leading-relaxed text-cream/80">
            Enter the 6-digit code we texted to <span className="whitespace-nowrap text-cream">{formatUsPhone(digits)}</span>.
          </p>
          <input
            ref={codeRef}
            className={cn(field, 'h-14 text-center font-display text-[26px] tracking-[0.5em] placeholder:tracking-[0.5em]')}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="••••••"
            aria-label="6-digit code"
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(v);
              if (v.length === 6) confirm(v);
            }}
          />
          <Button type="submit" size="lg" disabled={code.length !== 6 || busy} className="w-full">
            {busy ? 'Checking…' : 'Confirm'}
          </Button>
          <div className="flex items-center justify-between gap-3 font-sans text-[12.5px]">
            <button
              type="button"
              className="text-cream/60 underline-offset-4 hover:text-brass-light hover:underline"
              onClick={() => {
                setStep('phone');
                setErr('');
                window.setTimeout(() => phoneRef.current?.focus(), 0);
              }}
            >
              Use a different number
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              className="text-brass-light underline-offset-4 hover:underline disabled:text-cream/35 disabled:no-underline"
              onClick={sendCode}
            >
              {resendIn > 0 ? `Send a new code (${resendIn}s)` : 'Send a new code'}
            </button>
          </div>
        </form>
      )}
      {err && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-red-200">
          {err}
        </p>
      )}
    </div>
  );
}
