'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

/**
 * Wraps the long-form portion of the chef bio in a collapsible panel
 * with a "Read More / Show Less" toggle. The intro paragraph above
 * this component stays visible at all times — this is only for the
 * deeper credentials / competitions / golden-quote / tags block.
 *
 * Uses the grid-template-rows: 0fr → 1fr trick so the height animates
 * smoothly to the content's natural size (no max-height guessing). The
 * `.chef-bio-collapsible` / `.chef-bio-inner` / `.is-open` rules (and their
 * prefers-reduced-motion guard) live in app/globals.css.
 */
export default function ChefBioReadMore({
  children,
  openLabel = 'Read more about Chef Rainny',
  closeLabel = 'Show less',
}: {
  children: React.ReactNode;
  openLabel?: string;
  closeLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={`chef-bio-collapsible${expanded ? ' is-open' : ''}`}
        aria-hidden={!expanded}
      >
        <div className="chef-bio-inner">{children}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="mt-7 text-[11px]"
      >
        <span>{expanded ? closeLabel : openLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className={cn('shrink-0 transition-transform duration-300 ease-out-soft', expanded && 'rotate-180')}
        >
          <path d="M5 9l7 7 7-7" />
        </svg>
      </Button>
    </>
  );
}
