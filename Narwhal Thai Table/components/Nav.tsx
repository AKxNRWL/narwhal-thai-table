'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SHOW_CHEF } from '@/lib/site';

const NAV_LINKS = [
  { href: '/#story',       label: 'Our Story' },
  ...(SHOW_CHEF ? [{ href: '/#chef', label: 'The Chef' }] : []),
  { href: '/menu',         label: 'Menu' },
  { href: '/#experience',  label: 'Experience' },
  { href: '/play',         label: 'Play' },
  { href: '/#contact',     label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    if (href === '/menu') return pathname === '/menu' || pathname?.startsWith('/menu/');
    if (href === '/play') return pathname === '/play';
    if (href === '/contact') return pathname === '/contact' || pathname?.startsWith('/contact/');
    return false;
  };

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`} aria-label="Primary">
        <Link href="/" className="logo" aria-label="Narwhal Thai Table home">
          <span className="logo-mark" aria-hidden="true"><img src="/images/logo-mark.png" alt="" /></span>
          Narwhal Thai Table
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link href="/contact/reservation" className="btn-reserve desktop-only">Save a Seat</Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="nav-drawer"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(v => !v)}
        >
          <span className="nav-toggle-bar" aria-hidden="true" />
        </button>
      </nav>

      <div
        id="nav-drawer"
        className="nav-drawer"
        data-open={open}
        aria-hidden={!open}
      >
        {NAV_LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            aria-current={isCurrent(l.href) ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/contact/reservation" className="drawer-cta" onClick={() => setOpen(false)}>
          Save a Seat
        </Link>
      </div>
    </>
  );
}
