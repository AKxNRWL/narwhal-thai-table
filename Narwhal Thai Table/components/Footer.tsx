import Link from 'next/link';
import { RESTAURANT, SOCIAL, ORDER_ONLINE_URL, DIRECTIONS_URL } from '@/lib/site';

const EXPLORE = [
  { href: '/menu', label: 'Full menu' },
  { href: '/lunch', label: 'Lunch specials' },
  { href: '/order', label: 'Order online' },
  { href: '/contact/reservation', label: 'Reservations' },
  { href: '/contact/catering', label: 'Catering & events' },
  { href: '/about', label: 'Our story' },
  { href: '/thai-food-orange-county', label: 'Thai food guide' },
  { href: '/press', label: 'Press' },
  { href: '/play', label: 'Bubble Glide' },
];

/**
 * Site footer — brand, hours, NAP line (consistent address + phone for local
 * SEO), social links (only those with a URL in lib/site.ts) and site map.
 * The /play link stays here on purpose: a discreet pointer to the mini-game.
 */
export default function Footer() {
  const { address } = RESTAURANT;
  const live = SOCIAL.filter((s) => s.url);
  const tel = RESTAURANT.phone ? `tel:${RESTAURANT.phone.replace(/[^\d+]/g, '')}` : null;

  return (
    <footer className="relative isolate overflow-hidden border-t border-brass/15 bg-navy-deep">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(200,162,78,0.12),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-mark-cream.png" alt="" className="h-auto w-12 opacity-95" />
              <span className="font-display text-[19px] tracking-[0.06em] text-cream">
                Narwhal <em className="font-serif italic font-normal text-brass-light">Thai Table</em>
              </span>
            </div>
            <p className="max-w-sm font-serif text-[16px] italic leading-relaxed text-cream/60">
              Three siblings, thirty years of restaurant life, one table on Beach Boulevard — royal-court Thai, cooked
              fresh for every plate.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {ORDER_ONLINE_URL && (
                <a
                  href={ORDER_ONLINE_URL}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center rounded-full bg-brass px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-navy transition-colors hover:bg-brass-light"
                >
                  Order Online
                </a>
              )}
              <Link
                href="/contact/reservation"
                className="inline-flex items-center rounded-full border border-cream/20 px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:border-brass-light hover:text-brass-light"
              >
                Save a Seat
              </Link>
            </div>
          </div>

          {/* visit */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">Visit</h3>
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
                Get directions →
              </a>
            </div>
          </div>

          {/* hours */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">Hours</h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[15px] text-cream/75">
              <dt className="text-cream/50">Mon – Fri</dt>
              <dd>11:30 AM – 10:00 PM</dd>
              <dt className="text-cream/50">Sat – Sun</dt>
              <dd>12:00 – 10:00 PM</dd>
              <dt className="text-cream/50">Lunch</dt>
              <dd>
                <Link href="/lunch" className="transition-colors hover:text-brass-light">
                  Mon – Fri 11:30 – 3
                </Link>
              </dd>
            </dl>
          </div>

          {/* explore */}
          <div>
            <h3 className="mb-4 font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">Explore</h3>
            <nav aria-label="Site map" className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px] text-cream/75 lg:grid-cols-1">
              {EXPLORE.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-brass-light">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-cream/10 pt-8 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Social" className="flex flex-wrap gap-x-6 gap-y-2">
            {live.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Narwhal Thai Table on ${s.label}`}
                className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-cream/70 transition-colors hover:text-brass-light"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <p className="font-sans text-[11px] tracking-[0.12em] text-cream/45">
            © 2026 Narwhal Hospitality LLC · Huntington Beach, CA
          </p>
        </div>
      </div>
    </footer>
  );
}
