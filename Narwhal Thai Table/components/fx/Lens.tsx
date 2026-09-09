'use client';

import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lens — a magnifying glass that follows the pointer over a photo
 * (Magic UI-style). Desktop pointer devices only; touch users just see the
 * photo. Wrap exactly one positioned image container.
 */
export default function Lens({
  children,
  zoom = 1.8,
  size = 180,
  className,
}: {
  children: ReactNode;
  zoom?: number;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={ref}
      className={cn('group/lens relative', className)}
      onPointerMove={onMove}
      onPointerLeave={() => setPos(null)}
    >
      {children}
      {pos && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-[5] hidden overflow-hidden rounded-full border border-brass/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),0_0_0_6px_rgba(6,18,31,0.35)] lg:block"
          style={{
            width: size,
            height: size,
            left: pos.x - size / 2,
            top: pos.y - size / 2,
          }}
        >
          <div
            className="absolute inset-0 [&_img]:!object-cover"
            style={{
              width: ref.current?.clientWidth,
              height: ref.current?.clientHeight,
              transform: `translate(${-pos.x + size / 2}px, ${-pos.y + size / 2}px) scale(${zoom})`,
              transformOrigin: `${pos.x}px ${pos.y}px`,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
