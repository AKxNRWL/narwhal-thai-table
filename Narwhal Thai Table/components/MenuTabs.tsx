'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { DISHES } from '@/lib/dishes';

/**
 * Full menu with ARIA-compliant tabs and a horizontal scroll on mobile.
 * Tab state is local — the page is fully static apart from the active tab.
 * Each dish card links to /menu/[slug] for the detail page.
 */
export default function MenuTabs({ initial = 'appetizers' as CategoryId }: { initial?: CategoryId }) {
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
    <>
      <div className="menu-tabs-wrap">
        <div className="menu-tabs" role="tablist" aria-label="Menu categories">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              ref={(el) => { tabRefs.current[cat.id] = el; }}
              role="tab"
              id={`tab-${cat.id}`}
              aria-controls={`cat-${cat.id}`}
              aria-selected={active === cat.id}
              tabIndex={active === cat.id ? 0 : -1}
              className={`tab${active === cat.id ? ' active' : ''}`}
              onClick={() => setActive(cat.id)}
              onKeyDown={(e) => onKey(e, idx)}
            >
              {cat.label}
            </button>
          ))}
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
            className={`menu-category${active === cat.id ? ' active' : ''}`}
            hidden={active !== cat.id}
          >
            {isSides ? <SidesPanel /> : (
              <div className="cat-grid">
                {dishes.map(d => (
                  <Link key={d.slug} href={`/menu/${d.slug}`} className={`dish${d.signature ? ' sig' : ''}`}>
                    <div className="dish-head">
                      <div className="dish-name">
                        {d.name}{d.thai && <span className="thai">{d.thai}</span>}
                      </div>
                      {d.price && <div className="dish-price">{d.price}</div>}
                    </div>
                    <p className="dish-desc">{d.description}</p>
                    {d.variants && (
                      <p className="dish-variants">{d.variants.join(' · ')}</p>
                    )}
                    <div className="dish-tags">
                      {d.signature && <span className="tag">Signature</span>}
                      {d.spicy && <span className="tag spicy">Spicy</span>}
                      {d.protein && <span className="tag">Choice of Protein</span>}
                    </div>
                    {d.story && <span className="dish-read">Read the story</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="menu-note">★ are Chef Rainny&apos;s signature creations. Dishes marked &ldquo;Choice of Protein&rdquo; are priced before protein — pick yours under Sides &amp; Protein (from +$2). Tell us about your allergies or spice level when you order — we&apos;ll cook it just for you.</p>
    </>
  );
}

/* The "Sides & Protein" panel is a list, not dish cards. */
function SidesPanel() {
  return (
    <div className="menu-aside-grid" style={{ border: 'none', padding: 0, margin: '0 auto' }}>
      <div>
        <h4>&mdash; Choose Your Protein</h4>
        <ul>
          <li>Chicken +$2</li>
          <li>Chicken &amp; Shrimp (2 pc) +$2</li>
          <li>Pork +$2</li>
          <li>Fried Tofu +$2</li>
          <li>Soft Tofu +$2</li>
          <li>Ground Pork +$2</li>
          <li>Ground Chicken +$2</li>
          <li>Ground Beef +$5</li>
          <li>Beef +$5</li>
          <li>Shrimp +$6</li>
          <li>Combination &mdash; Chicken, Pork &amp; Beef +$6</li>
          <li>Seafood +$9</li>
        </ul>
      </div>
      <div>
        <h4>&mdash; On the Side</h4>
        <ul>
          <li>Jasmine Rice $3</li>
          <li>Brown Rice $4</li>
          <li>Sticky Rice $4</li>
          <li>Fried Egg $3</li>
          <li>Omelet $13 &mdash; add ground pork or chicken +$2, ground shrimp +$3</li>
        </ul>
      </div>
    </div>
  );
}
