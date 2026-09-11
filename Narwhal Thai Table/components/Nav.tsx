'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SHOW_CHEF, ORDER_ONLINE_URL } from '@/lib/site';
import { cn } from '@/lib/cn';
import { chrome, type ChromeDict } from '@/lib/i18n/chrome';
import { localePath, stripLocale } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';
import LocaleSwitch from '@/components/i18n/LocaleSwitch';

/* Labels come from lib/i18n/chrome.ts (EN / VI); hrefs are English paths and
   are localised per page (/vi/menu …) — English-only pages such as /play stay
   English from either side. */
function navLinks(t: ChromeDict['nav']) {
  return [
    { href: '/#story', label: t.story },
    ...(SHOW_CHEF ? [{ href: '/#chef', label: t.chef }] : []),
    { href: '/menu', label: t.menu },
    { href: '/lunch', label: t.lunch },
    { href: '/#experience', label: t.experience },
    { href: '/play', label: t.play },
    { href: '/#contact', label: t.contact },
  ];
}

/**
 * Primary navigation — a glass bar docked directly under the multilingual
 * ticker (top = --cs-ticker-h). Turns solid after 40px of scroll. On phones a
 * full-screen drawer slides in; body scroll is locked via data-nav-open.
 */
export default function Nav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = chrome(locale).nav;
  const NAV_LINKS = navLinks(t);
  const href = (p: string) => localePath(locale, p);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // Solid bar after 40px; "floating navbar" behaviour after 360px — slides
  // away while reading down, returns on the first scroll up (Aceternity
  // FloatingNav idea). Ignored while the drawer is open.
  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 40);
        const dy = y - lastY;
        if (y < 360 || dy < -6) setHidden(false);
        else if (dy > 6) setHidden(true);
        lastY = y;
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Expose the visible nav height to sticky elements (menu category bar)
  // so they can dock under the ticker while the bar is hidden.
  useEffect(() => {
    document.documentElement.style.setProperty('--nav-offset', hidden && !open ? '0px' : '72px');
  }, [hidden, open]);

  useEffect(() => {
    document.body.dataset.navOpen = String(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 980) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isCurrent = (href: string) => {
    const p = stripLocale(pathname ?? '/');
    if (href === '/menu') return p === '/menu' || p.startsWith('/menu/');
    if (href === '/lunch') return p === '/lunch';
    if (href === '/play') return p === '/play';
    if (href === '/contact') return p === '/contact' || p.startsWith('/contact/');
    return false;
  };

  const linkCls = (current: boolean) =>
    cn(
      'relative font-sans text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300',
      'after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brass-light after:transition-transform after:duration-300 after:content-[""]',
      'hover:text-brass-light hover:after:scale-x-100',
      current ? 'text-brass-light after:scale-x-100' : 'text-cream/80',
    );

  return (
    <>
      <a href="#main" className="skip-link">{t.skip}</a>

      <nav
        aria-label={t.primary}
        className={cn(
          'fixed inset-x-0 z-[100] top-[var(--cs-ticker-h)] transition-[background-color,box-shadow,border-color,backdrop-filter,transform] duration-500',
          'border-b',
          hidden && !open && '-translate-y-[calc(100%+var(--cs-ticker-h))]',
          scrolled || open
            ? 'border-brass/20 bg-navy-deep/85 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl'
            : 'border-transparent bg-gradient-to-b from-navy-deep/70 to-transparent',
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link
            href={href('/')}
            aria-label={t.home}
            className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full border border-brass/40 bg-cream/95 shadow-[0_0_0_4px_rgba(200,162,78,0.12)] transition-transform duration-500 group-hover:rotate-[-6deg]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-mark.png" alt="" className="size-7 object-contain" />
            </span>
            <span className="font-display text-[15px] font-medium tracking-[0.08em] text-cream">
              Narwhal <span className="font-serif italic font-normal tracking-normal text-brass-light">Thai Table</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={href(l.href)}
                aria-current={isCurrent(l.href) ? 'page' : undefined}
                className={linkCls(isCurrent(l.href))}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {ORDER_ONLINE_URL && (
              <a
                href={ORDER_ONLINE_URL}
                target="_blank"
                rel="noopener"
                data-magnetic
                className="btn-shine inline-flex items-center rounded-full bg-brass px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-navy transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-[0_14px_30px_-12px_rgba(200,162,78,0.8)]"
              >
                {t.order}
              </a>
            )}
            <Link
              href={href('/contact/reservation')}
              className={cn(
                'inline-flex items-center rounded-full px-5 py-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5',
                ORDER_ONLINE_URL
                  ? 'border border-cream/25 text-cream hover:border-brass-light hover:text-brass-light'
                  : 'bg-brass text-navy hover:bg-brass-light',
              )}
            >
              {t.reserve}
            </Link>
            <LocaleSwitch />
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? t.close : t.open}
            onClick={() => setOpen((v) => !v)}
            className="relative grid size-11 place-items-center rounded-full border border-cream/15 bg-white/[0.04] text-cream lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light"
          >
            <span aria-hidden="true" className="relative block h-[14px] w-5">
              <span
                className={cn(
                  'absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300',
                  open && 'translate-y-[6.5px] rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current transition-opacity duration-200',
                  open && 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-px w-5 bg-current transition-transform duration-300',
                  open && '-translate-y-[6.5px] -rotate-45',
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="nav-drawer"
        data-open={open}
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-[90] flex flex-col bg-navy-deep/95 px-6 pb-10 pt-[calc(var(--cs-ticker-h)+96px)] backdrop-blur-2xl transition-[opacity,visibility] duration-300 lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(200,162,78,0.16),transparent_70%)]" />
        <nav aria-label={t.mobile} className="relative flex flex-col gap-1">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={href(l.href)}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
              style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
              className={cn(
                'flex items-baseline justify-between border-b border-cream/10 py-4 font-display text-[28px] font-medium text-cream transition-[opacity,transform,color] duration-500',
                open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
                isCurrent(l.href) && 'text-brass-light',
              )}
            >
              {l.label}
              <span className="font-sans text-[10px] tracking-[0.3em] text-brass/70">0{i + 1}</span>
            </Link>
          ))}
        </nav>
        <div className="relative mt-auto flex flex-col gap-3 pt-8">
          {ORDER_ONLINE_URL && (
            <a
              href={ORDER_ONLINE_URL}
              target="_blank"
              rel="noopener"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-brass px-6 py-4 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-navy"
            >
              {t.orderDrawer}
            </a>
          )}
          <Link
            href={href('/contact/reservation')}
            onClick={() => setOpen(false)}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-6 py-4 font-sans text-[11px] font-medium uppercase tracking-[0.18em]',
              ORDER_ONLINE_URL ? 'border border-cream/25 text-cream' : 'bg-brass text-navy',
            )}
          >
            {t.reserve}
          </Link>
          <div className="mt-2 flex items-center justify-center gap-4">
            <LocaleSwitch size="lg" />
          </div>
          <p className="mt-2 text-center font-serif text-[13px] italic text-cream/50">{t.address}</p>
        </div>
      </div>
    </>
  );
}
