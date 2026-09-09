'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { DISHES } from '@/lib/dishes';
import { Arrow } from '@/components/ui/Button';
import { Tag, cardSurface } from '@/components/ui/Section';
import { cn } from '@/lib/cn';

/**
 * Full menu with ARIA-compliant tabs and a horizontal scroll on mobile.
 * Tab state is local — the page is fully static apart from the active tab.
 * Each dish card links to /menu/[slug] for the detail page.
 */
export default function MenuTabs({
  initial = 'appetizers' as CategoryId,
  photos = {},
}: {
  initial?: CategoryId;
  /** slug → public image URL, built server-side in app/menu/page.tsx */
  photos?: Record<string, string>;
}) {
  const [active, setActive] = useState<CategoryId>(initial);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Scroll active tab into view on the mobile horizontal scroller
  useEffect(() => {
    const el = tabRefs.current[active];
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  function onKey(e: React.KeyboardEvent, idx: number) {
    let next: CategoryId | null = null;
    if (e.key === 'ArrowRight') next = CATEGORIES[(idx + 1) % CATEGORIES.length].id;
    else if (e.key === 'ArrowLeft') next = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length].id;
    else if (e.key === 'Home') next = CATEGORIES[0].id;
    else if (e.key === 'End') next = CATEGORIES[CATEGORIES.length - 1].id;
    if (next) {
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div>
      {/* Category bar — sticks directly under the fixed nav (ticker + 72px) so
          the categories stay reachable while a long panel scrolls by. Bleeds to
          the Container edges; pills scroll horizontally with a hidden scrollbar. */}
      <div className="sticky top-[calc(var(--cs-ticker-h)+var(--nav-offset,72px))] transition-[top] duration-500 z-30 -mx-5 mt-12 border-y border-cream/10 bg-navy-deep/80 backdrop-blur-xl sm:-mx-8 lg:-mx-12 lg:mt-16">
        <div
          role="tablist"
          aria-label="Menu categories"
          className="flex snap-x gap-2 overflow-x-auto px-5 py-3 scroll-px-5 [scrollbar-width:none] sm:px-8 sm:scroll-px-8 lg:px-12 lg:scroll-px-12 [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((cat, idx) => {
            const selected = active === cat.id;
            return (
              <button
                key={cat.id}
                ref={(el) => { tabRefs.current[cat.id] = el; }}
                type="button"
                role="tab"
                id={`tab-${cat.id}`}
                aria-controls={`cat-${cat.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(cat.id)}
                onKeyDown={(e) => onKey(e, idx)}
                className={cn(
                  'shrink-0 snap-center whitespace-nowrap rounded-full border px-4 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em]',
                  'transition-[background-color,border-color,color,box-shadow] duration-300 ease-out-soft',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-light focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep',
                  selected
                    ? 'border-brass bg-brass text-navy shadow-[0_8px_24px_-10px_rgba(200,162,78,0.7)]'
                    : 'border-cream/10 bg-white/[0.03] text-cream/70 hover:border-brass/50 hover:bg-white/[0.06] hover:text-cream',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const dishes = DISHES.filter(d => d.category === cat.id);
        const isSides = cat.id === 'sides';
        return (
          <div
            key={cat.id}
            id={`cat-${cat.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${cat.id}`}
            className="pt-8 sm:pt-10"
            hidden={active !== cat.id}
          >
            {/* Category name as a real H2 — gives the menu page the machine-
                readable topical structure it otherwise completely lacks.
                Visually hidden because the active tab already names it. */}
            <h2 className="visually-hidden">{cat.label}</h2>
            {isSides ? <SidesPanel /> : (
              <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
                {dishes.map(d => {
                  const photo = d.image?.src ?? photos[d.slug];
                  return (
                    <Link
                      key={d.slug}
                      href={`/menu/${d.slug}`}
                      className={cardSurface('flex-row items-start gap-4 p-4 hover:-translate-y-1 sm:gap-5 sm:p-5')}
                    >
                      {photo && (
                        <span className="relative size-[84px] shrink-0 overflow-hidden rounded-[14px] bg-navy sm:size-[104px]">
                          {/* Real descriptive alt — image search + AI grounding.
                              Was alt="" on all 29 photos, forfeiting both. */}
                          <Image
                            src={photo}
                            alt={`${d.name}${d.thai ? ` (${d.thai})` : ''} — Thai ${cat.label.toLowerCase()} at Narwhal Thai Table, Huntington Beach`}
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
                        {(d.signature || d.spicy || d.protein || d.story) && (
                          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                            {d.signature && <Tag>Signature</Tag>}
                            {d.spicy && <Tag tone="spicy">Spicy</Tag>}
                            {d.protein && <Tag tone="muted">Choice of Protein</Tag>}
                            {d.story && (
                              <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                                Read the story <Arrow />
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
        );
      })}

      <p className="mt-10 max-w-3xl text-[14px] leading-relaxed text-cream/55 lg:mt-12">★ are the house signature creations. Dishes marked &ldquo;Choice of Protein&rdquo; are priced before protein — pick yours under Sides &amp; Protein (from +$2). Tell us about your allergies or spice level when you order — we&apos;ll cook it just for you.</p>
    </div>
  );
}

/* The "Sides & Protein" panel is a list, not dish cards. */
type SideRow = { name: string; price: string; note?: string };

const PROTEINS: SideRow[] = [
  { name: 'Chicken', price: '+$2' },
  { name: 'Chicken & Shrimp (2 pc)', price: '+$3' },
  { name: 'Pork', price: '+$2' },
  { name: 'Fried Tofu', price: '+$2' },
  { name: 'Soft Tofu', price: '+$2' },
  { name: 'Ground Pork', price: '+$2' },
  { name: 'Ground Chicken', price: '+$2' },
  { name: 'Ground Beef', price: '+$5' },
  { name: 'Beef', price: '+$5' },
  { name: 'Shrimp', price: '+$6' },
  { name: 'Combination — Chicken, Pork & Beef', price: '+$6' },
  { name: 'Seafood', price: '+$9' },
];

const SIDES: SideRow[] = [
  { name: 'Jasmine Rice', price: '$3' },
  { name: 'Brown Rice', price: '$4' },
  { name: 'Sticky Rice', price: '$4' },
  { name: 'Fried Egg', price: '$3' },
  { name: 'Omelet', price: '$13', note: '— add ground pork or chicken +$2, ground shrimp +$3' },
];

function SidesPanel() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
      <SideList title="— Choose Your Protein" rows={PROTEINS} />
      <SideList title="— On the Side" rows={SIDES} />
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
