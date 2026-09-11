'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { Arrow } from '@/components/ui/Button';
import { Tag, cardSurface } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { chrome, categoryLabel } from '@/lib/i18n/chrome';
import { localePath, type Locale } from '@/lib/i18n/locales';
import { fmt } from '@/lib/i18n/rich';

import type { MenuCard } from '@/lib/menuCard';

/**
 * The whole menu on one scroll — owner, 11 Sep 2026: "เลื่อนลงมาเรื่อยๆ แล้วเจอทุกเมนูเลย
 * แล้วก็ตั้งหัวข้อแต่ละหัวข้อหุบได้".
 *
 * Thirteen course sections stacked top to bottom, every one open by default so
 * a guest simply scrolls through the menu. Each course heading is a disclosure
 * button (WAI-ARIA accordion, sections independent) that folds its cards away;
 * folded cards stay in the DOM (grid-rows collapse + inert), so every dish page
 * keeps a crawlable link from /menu — which is why the old "Every dish" index
 * at the foot of the page could go. The sticky pill bar that used to switch
 * tabs now jumps to a course and follows the scroll.
 *
 * Copy (labels, tags, the sides list) comes from lib/i18n/chrome.ts so the same
 * component serves /menu and /vi/menu; the dish cards arrive already localised.
 */
export default function MenuSections({
  dishes,
  photos = {},
  locale = 'en',
}: {
  /** every dish, in menu order, already localised (see components/pages/MenuPage.tsx) */
  dishes: MenuCard[];
  /** slug → public image URL, built server-side in app/menu/page.tsx */
  photos?: Record<string, string>;
  locale?: Locale;
}) {
  const t = chrome(locale).menuList;
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, true])),
  );
  const [active, setActive] = useState<CategoryId>(CATEGORIES[0].id);
  const barRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const lenis = useLenis();

  const toggle = useCallback((id: CategoryId) => {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }, []);

  // Jump to a course: unfold it if needed, then scroll it under the sticky bar.
  // Lenis drives the page scroll; `force` scrolls even while Lenis is paused
  // (e.g. right after the promo pop-up closes). If nothing has moved after a
  // beat (Lenis loop throttled in a background tab), fall back to the
  // browser's own smooth scroll.
  const jump = useCallback((id: CategoryId) => {
    setOpen((o) => (o[id] ? o : { ...o, [id]: true }));
    const el = sectionRefs.current[id];
    if (!el) return;
    const barBottom = barRef.current?.getBoundingClientRect().bottom ?? 118;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - (barBottom + 12));
    const startY = window.scrollY;
    const native = () => window.scrollTo({ top, behavior: 'smooth' });
    if (lenis) {
      lenis.scrollTo(top, { duration: 1.1, force: true });
      window.setTimeout(() => { if (Math.abs(window.scrollY - startY) < 4 && Math.abs(top - startY) >= 4) native(); }, 260);
    } else {
      native();
    }
  }, [lenis]);

  // Scroll-spy: the pill of the course currently under the bar lights up.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = (barRef.current?.getBoundingClientRect().bottom ?? 118) + 24;
      let current: CategoryId = CATEGORIES[0].id;
      for (const c of CATEGORIES) {
        const el = sectionRefs.current[c.id];
        if (el && el.getBoundingClientRect().top <= line) current = c.id;
      }
      setActive((a) => (a === current ? a : current));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Keep the active pill visible in the horizontal scroller — scroll the bar
  // itself, never scrollIntoView (that can nudge the page and interrupt Lenis).
  useEffect(() => {
    const pill = pillRefs.current[active];
    const strip = pill?.parentElement;
    if (!pill || !strip) return;
    const left = pill.offsetLeft - strip.clientWidth / 2 + pill.offsetWidth / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  return (
    <div>
      {/* Course bar — sticks under the fixed nav (ticker + 72px, or just the ticker
          while the nav is hidden on a downward scroll). Pills jump to a course. */}
      <div
        ref={barRef}
        className="sticky top-[calc(var(--cs-ticker-h)+var(--nav-offset,72px))] z-30 -mx-5 mt-12 border-y border-cream/10 bg-navy-deep/80 backdrop-blur-xl transition-[top] duration-500 sm:-mx-8 lg:-mx-12 lg:mt-16"
      >
        <nav
          aria-label={t.jump}
          className="flex snap-x gap-2 overflow-x-auto px-5 py-3 scroll-px-5 [scrollbar-width:none] sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12 [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat) => {
            const selected = active === cat.id;
            return (
              <button
                key={cat.id}
                ref={(el) => { pillRefs.current[cat.id] = el; }}
                type="button"
                aria-current={selected ? 'location' : undefined}
                onClick={() => jump(cat.id)}
                className={cn(
                  'shrink-0 snap-center whitespace-nowrap rounded-full border px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em]',
                  'transition-[background-color,border-color,color,box-shadow] duration-300 ease-out-soft',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
                  selected
                    ? 'border-brass bg-brass text-navy shadow-[0_8px_24px_-10px_rgba(200,162,78,0.7)]'
                    : 'border-cream/10 bg-white/[0.03] text-cream/70 hover:border-brass/50 hover:bg-white/[0.06] hover:text-cream',
                )}
              >
                {categoryLabel(locale, cat.id)}
              </button>
            );
          })}
        </nav>
      </div>

      {CATEGORIES.map((cat) => {
        const inCourse = dishes.filter((d) => d.category === cat.id);
        const label = categoryLabel(locale, cat.id);
        const isSides = cat.id === 'sides';
        const isOpen = open[cat.id] !== false;
        const count = isSides ? t.proteinsSides : `${inCourse.length} ${inCourse.length === 1 ? t.dish : t.dishes}`;
        return (
          <section
            key={cat.id}
            id={`cat-${cat.id}`}
            ref={(el) => { sectionRefs.current[cat.id] = el; }}
            aria-labelledby={`cat-${cat.id}-title`}
            className="border-t border-cream/[0.08] first-of-type:border-t-0"
          >
            {/* Course heading = the fold/unfold control (real H2 for structure). */}
            <h2 id={`cat-${cat.id}-title`} className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`cat-${cat.id}-panel`}
                onClick={() => toggle(cat.id)}
                className={cn(
                  'group flex w-full items-center gap-3 py-5 text-left sm:gap-4 sm:py-6',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-4 focus-visible:ring-offset-navy-deep',
                )}
              >
                <span className={cn('font-display text-[24px] font-medium leading-none transition-colors duration-300 sm:text-[30px]', isOpen ? 'text-cream' : 'text-cream/70 group-hover:text-cream')}>
                  {label}
                </span>
                <span className="mt-1 font-sans text-[10.5px] font-medium uppercase tracking-[0.2em] text-cream/40">
                  {count}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-cream/15 text-brass-light',
                    'transition-[transform,border-color,background-color] duration-500 ease-out-soft group-hover:border-brass/50 group-hover:bg-white/[0.04]',
                    isOpen ? 'rotate-180' : 'rotate-0',
                  )}
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l5 5 5-5" /></svg>
                </span>
              </button>
            </h2>

            {/* Fold: grid-rows 1fr→0fr keeps the cards in the DOM (crawlable) while they collapse. */}
            <div
              id={`cat-${cat.id}-panel`}
              role="region"
              aria-labelledby={`cat-${cat.id}-title`}
              className={cn(
                'grid transition-[grid-template-rows] duration-500 ease-out-soft motion-reduce:transition-none',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden" inert={!isOpen}>
                <div className="pb-10 sm:pb-12">
                  {isSides ? <SidesPanel locale={locale} /> : (
                    <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
                      {inCourse.map((d) => {
                        const photo = photos[d.slug];
                        return (
                          <Link
                            key={d.slug}
                            href={localePath(locale, `/menu/${d.slug}`)}
                            className={cardSurface('flex-row items-start gap-4 p-4 hover:-translate-y-1 sm:gap-5 sm:p-5')}
                          >
                            {photo && (
                              <span className="relative size-[84px] shrink-0 overflow-hidden rounded-[14px] bg-navy sm:size-[104px]">
                                <Image
                                  src={photo}
                                  alt={fmt(t.alt, { name: `${d.name}${d.thai ? ` (${d.thai})` : ''}`, category: locale === 'en' ? label.toLowerCase() : label })}
                                  fill
                                  sizes="(max-width: 640px) 84px, 104px"
                                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
                                />
                              </span>
                            )}
                            <div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch">
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="min-w-0 font-display text-[18px] font-medium leading-tight text-cream">
                                  {d.name}
                                  {d.thai && (
                                    <>
                                      {' '}
                                      <span lang="th" className="mt-1 block font-serif text-[13px] font-normal italic text-cream/55">{d.thai}</span>
                                    </>
                                  )}
                                </h3>
                                {d.price && <div className="shrink-0 font-display text-[17px] font-medium leading-tight text-brass-light">{d.price}</div>}
                              </div>
                              <p className="text-[14.5px] leading-relaxed text-cream/70">{d.description}</p>
                              {d.variants && (
                                <p className="font-serif text-[13px] italic leading-snug text-cream/50">{d.variants.join(' · ')}</p>
                              )}
                              {(d.signature || d.spicy || d.protein || d.hasStory) && (
                                <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                                  {d.signature && <Tag>{t.signature}</Tag>}
                                  {d.spicy && <Tag tone="spicy">{t.spicy}</Tag>}
                                  {d.protein && <Tag tone="muted">{t.protein}</Tag>}
                                  {d.hasStory && (
                                    <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                                      {t.readStory} <Arrow />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <p className="mt-6 max-w-3xl border-t border-cream/[0.08] pt-8 text-[14px] leading-relaxed text-cream/55 lg:mt-8">{t.footnote}</p>
    </div>
  );
}

/* The "Sides & Protein" section is a list, not dish cards. Prices are the
   facts (Toast is the source of truth); the names come from lib/i18n/chrome.ts. */
type SideRow = { name: string; price: string; note?: string };

function proteinRows(locale: Locale): SideRow[] {
  const n = chrome(locale).menuList.proteins;
  return [
    { name: n.chicken, price: '+$2' },
    { name: n.chickenShrimp, price: '+$3' },
    { name: n.pork, price: '+$2' },
    { name: n.friedTofu, price: '+$2' },
    { name: n.softTofu, price: '+$2' },
    { name: n.groundPork, price: '+$2' },
    { name: n.groundChicken, price: '+$2' },
    { name: n.groundBeef, price: '+$5' },
    { name: n.beef, price: '+$5' },
    { name: n.shrimp, price: '+$6' },
    { name: n.combo, price: '+$6' },
    { name: n.seafood, price: '+$9' },
  ];
}

function sideRows(locale: Locale): SideRow[] {
  const n = chrome(locale).menuList.sides;
  return [
    { name: n.jasmine, price: '$3' },
    { name: n.brown, price: '$4' },
    { name: n.sticky, price: '$4' },
    { name: n.friedEgg, price: '$3' },
    { name: n.omelet, price: '$13', note: n.omeletNote },
  ];
}

function SidesPanel({ locale }: { locale: Locale }) {
  const t = chrome(locale).menuList;
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
      <SideList title={t.chooseProtein} rows={proteinRows(locale)} />
      <SideList title={t.onTheSide} rows={sideRows(locale)} />
    </div>
  );
}

function SideList({ title, rows }: { title: string; rows: SideRow[] }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] p-6 shadow-card sm:p-7">
      <h4 className="font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">{title}</h4>
      <ul className="mt-4">
        {rows.map((r) => (
          <li key={r.name} className="border-t border-cream/[0.06] py-2.5 first:border-t-0">
            <div className="flex items-baseline gap-3">
              <span className="text-[15px] text-cream/85">{r.name}</span>{' '}
              {/* dotted leader between name and price */}
              <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-cream/25" />{' '}
              <span className="shrink-0 font-display text-[15px] font-medium tabular-nums text-brass-light">{r.price}</span>
            </div>
            {r.note && <p className="mt-1 font-serif text-[13px] italic leading-snug text-cream/50">{r.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
