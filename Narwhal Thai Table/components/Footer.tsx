'use client';

import Link from 'next/link';
import { RESTAURANT, SOCIAL, ORDER_ONLINE_URL, DIRECTIONS_URL } from '@/lib/site';
import { chrome, type ChromeDict } from '@/lib/i18n/chrome';
import { localePath, type Locale } from '@/lib/i18n/locales';
import { fmt } from '@/lib/i18n/rich';
import { useLocale } from '@/lib/i18n/useLocale';

/* hrefs are English paths; localePath() prefixes the ones that have a
   Vietnamese twin. The Little Saigon page only exists in Vietnamese, so it is
   listed on /vi pages only. */
function explore(t: ChromeDict['footer']['links'], locale: Locale) {
  return [
    { href: '/menu', label: t.menu },
    { href: '/lunch', label: t.lunch },
    { href: '/order', label: t.order },
    { href: '/contact/reservation', label: t.reservation },
    { href: '/contact/catering', label: t.catering },
    { href: '/about', label: t.about },
    ...(locale === 'vi' ? [{ href: '/vi/nha-hang-thai-little-saigon', label: t.littleSaigon }] : []),
    { href: '/thai-food-orange-county', label: t.guide },
    { href: '/press', label: t.press },
    { href: '/play', label: t.play },
  ];
}

/**
 * Site footer — brand, hours, NAP line (consistent address + phone for local
 * SEO), social links (only those with a URL in lib/site.ts) and site map.
 * The /play link stays here on purpose: a discreet pointer to the mini-game.
 * Client component only so it can pick EN / VI strings from the URL — it
 * renders on the server as before (no state, no effects).
 */
export default function Footer() {
  const locale = useLocale();
  const t = chrome(locale).footer;
  const href = (p: string) => localePath(locale, p);
  const { address } = RESTAURANT;
  const live = SOCIAL.filter((s) => s.url);
  const tel = RESTAURANT.phone ? `tel:${RESTAURANT.phone.replace(/[^\d+]/g, '')}` : null;
  const EXPLORE = explore(t.links, locale);

  return (
    <footer className="relative isolate overflow-hidden border-t border-brass/15 bg-navy-deep">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(200,162,78,0.12),transparent_70%)]" />
      {/* placemat pattern behind the wordmark (art pass) */}
      <div aria-hidden="true" className="art-texture [mask-image:linear-gradient(180deg,#000,transparent_70%)] [-webkit-mask-image:linear-gradient(180deg,#000,transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        {/* Giant outlined wordmark — pure decoration, the real brand line is below. */}
        <div
          aria-hidden="true"
          className="wordmark pointer-events-none -mb-6 select-none whitespace-nowrap font-display text-[clamp(72px,15.5vw,236px)] font-medium leading-[0.85] tracking-[-0.03em] sm:-mb-10"
        >
          Narwhal
        </div>
        <div className="grid gap-12 border-t border-cream/10 pt-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-mark-cream.png" alt="" className="h-auto w-12 opacity-95" />
              <span className="font-display text-[19px] tracking-[0.06em] text-cream">
                Narwhal <em className="font-serif italic font-normal text-brass-light">Thai Table</em>
              </span>
            </div>
            <p className="max-w-sm font-serif text-[16px] italic leading-relaxed text-cream/60">{t.brandLine}</p>
            <div className="flex flex-wrap gap-2.5">
              {ORDER_ONLINE_URL && (
                <a
                  href={ORDER_ONLINE_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center rounded-full bg-brass px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-navy transition-colors hover:bg-brass-light"
                >
                  {t.order}
                </a>
              )}
              <Link
                href={href('/contact/reservation')}
                className="inline-flex items-center rounded-full border border-cream/20 px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:border-brass-light hover:text-brass-light"
              >
                {t.reserve}
              </Link>
            </div>
          </div>

          {/* visit */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{t.visit}</h3>
            <address className="not-italic text-[15px] leading-relaxed text-cream/75">
              {address.street}
              <br />
              {address.city}, {address.region} {address.zip}
            </address>
            <div className="mt-3 flex flex-col gap-1.5 text-[15px]">
              {tel && (
                <a href={tel} className="text-cream/85 transition-colors hover:text-brass-light">
                  {RESTAURANT.phone}
                </a>
              )}
              <a href={`mailto:${RESTAURANT.email}`} className="text-cream/85 transition-colors hover:text-brass-light">
                {RESTAURANT.email}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener"
                className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-brass-light/90 transition-colors hover:text-cream"
              >
                {t.directions}
              </a>
            </div>
          </div>

          {/* hours */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{t.hours}</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px] text-cream/75">
              <dt className="text-cream/50">{t.weekdays}</dt>
              <dd>{t.weekdayHours}</dd>
              <dt className="text-cream/50">{t.weekend}</dt>
              <dd>{t.weekendHours}</dd>
              <dt className="text-cream/50">{t.lunch}</dt>
              <dd>
                <Link href={href('/lunch')} className="transition-colors hover:text-brass-light">
                  {t.lunchHours}
                </Link>
              </dd>
            </dl>
          </div>

          {/* explore */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{t.explore}</h3>
            <nav aria-label={t.siteMap} className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px] text-cream/75 lg:grid-cols-1">
              {EXPLORE.map((l) => (
                <Link key={l.href} href={href(l.href)} className="transition-colors hover:text-brass-light">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-cream/10 pt-8 md:flex-row md:items-center md:justify-between">
          <nav aria-label={t.social} className="flex flex-wrap gap-x-6 gap-y-2">
            {live.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={fmt(t.on, { label: s.label })}
                className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-cream/70 transition-colors hover:text-brass-light"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <p className="font-sans text-[11px] tracking-[0.12em] text-cream/45">{t.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
