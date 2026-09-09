'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Particles — a light canvas of drifting brass embers (Magic UI-style).
 * Used behind the hero art so the lanterns feel alive. Skips entirely for
 * prefers-reduced-motion users and pauses when the tab is hidden.
 */
type Props = {
  className?: string;
  /** particle count at 1440px; scaled down on small screens */
  quantity?: number;
  /** hex color of the embers */
  color?: string;
  /** base radius in px */
  size?: number;
  /** how strongly the field follows the pointer (0 = off) */
  parallax?: number;
};

type P = { x: number; y: number; r: number; a: number; da: number; vx: number; vy: number; tw: number };

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export default function Particles({ className, quantity = 70, color = '#E3C581', size = 1.4, parallax = 18 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [cr, cg, cb] = hexToRgb(color);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let particles: P[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let running = true;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      h = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(quantity * Math.min(1, w / 1440));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (anywhere = false): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: size * (0.5 + Math.random() * 1.2),
      a: 0,
      da: 0.004 + Math.random() * 0.008,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.08 + Math.random() * 0.22),
      tw: Math.random() * Math.PI * 2,
    });

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      for (const p of particles) {
        p.x += p.vx + Math.sin(p.tw) * 0.05;
        p.y += p.vy;
        p.tw += 0.01;
        p.a = Math.min(p.a + p.da, 1);
        const alpha = (0.25 + 0.55 * Math.abs(Math.sin(p.tw * 2))) * p.a;
        const px = p.x + mouse.x * parallax * (p.r / size);
        const py = p.y + mouse.y * parallax * (p.r / size);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},0.9)`;
        ctx.shadowBlur = 6;
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -12 || p.x < -20 || p.x > w + 20) Object.assign(p, spawn());
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    if (parallax > 0) window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [quantity, color, size, parallax]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}
