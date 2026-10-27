'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Halloween — jack-o'-lanterns floating across the top of every page, drawn
 * on a fixed canvas in the placemat's hand (navy ink line, cream fill, brass
 * edge) with an amber candle flickering inside. Owner, 26 Oct 2026:
 * "เอาเป็นตีมฮาโลวีน … มีฟักหัวเราะลอยไปมา" — so every few seconds one of them
 * laughs: the grin opens and closes, the eyes squint, it wobbles and bobs.
 * A small bat crosses now and then.
 *
 * Same conventions as components/fx/Airshow.tsx: the canvas is the strip of
 * sky under the nav down to ~45 % of the viewport; two-tone drawing so it
 * reads on navy pages (cream silhouettes, brass edge) and cream pages (navy
 * line art) alike; pauses when the tab is hidden; half-ghosts itself once
 * the reader has scrolled into content; motion always on (owner's rule).
 * Mounted by components/fx/AirshowLayer.tsx while lib/events.ts has an
 * event with `fx: 'halloween'` in its window.
 */
type Props = { className?: string };

const CREAM = [247, 240, 225] as const;
const NAVY = [13, 43, 62] as const;
const BRASS = [212, 178, 106] as const;
const AMBER = [255, 178, 74] as const;
const FLAME = [255, 232, 160] as const;
const NAV_H = 72; // components/Nav.tsx h-[72px]

type Pumpkin = {
  x: number; y: number; s: number; vx: number; depth: number;
  bob: number; bobA: number; bobF: number; rot: number; flick: number;
  laughIn: number; laugh: number; // seconds until the next laugh / seconds into the current one
};
type Bat = { x: number; y: number; s: number; dir: 1 | -1; v: number; ph: number };

const rgba = (c: readonly [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const LAUGH_LEN = 1.6; // s
const LAUGH_HZ = 17; // rad/s — the ha-ha-ha

// five lobes: [centre offset, width] in units of s; outer ones drawn first so the middle sits on top
const LOBES: [number, number][] = [[-0.78, 0.5], [0.78, 0.5], [-0.42, 0.78], [0.42, 0.78], [0, 1.0]];

/** s = body half-width · mouth 0..1 how open · squint 0..1 · flicker 0..1 · facing ±1 */
function drawPumpkin(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, mouth: number, squint: number, flicker: number, facing: 1 | -1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.lineJoin = 'round';
  const H = s * 0.82;
  // candle glow behind the whole lantern (reads on both grounds)
  const g = ctx.createRadialGradient(0, H * 0.15, s * 0.1, 0, H * 0.1, s * 1.9);
  g.addColorStop(0, rgba(AMBER, 0.28 + 0.12 * flicker));
  g.addColorStop(0.5, rgba(AMBER, 0.08));
  g.addColorStop(1, rgba(AMBER, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, H * 0.1, s * 1.9, 0, Math.PI * 2);
  ctx.fill();
  // navy ink under everything (the outline on cream pages; vanishes on navy)
  for (const [dx, w] of LOBES) {
    ctx.beginPath();
    ctx.ellipse(dx * s, 0, w * s * 0.62, H * (0.86 + 0.14 * w), 0, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(1.2, s * 0.07);
    ctx.strokeStyle = rgba(NAVY, 0.9);
    ctx.stroke();
  }
  // cream fill with a brass edge (the silhouette on navy pages)
  for (const [dx, w] of LOBES) {
    ctx.beginPath();
    ctx.ellipse(dx * s, 0, w * s * 0.62, H * (0.86 + 0.14 * w), 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(CREAM, 0.95);
    ctx.fill();
    ctx.lineWidth = Math.max(0.6, s * 0.024);
    ctx.strokeStyle = rgba(BRASS, 0.85);
    ctx.stroke();
  }
  // ridges
  ctx.lineWidth = Math.max(0.6, s * 0.02);
  ctx.strokeStyle = rgba(NAVY, 0.35);
  for (const dx of [-0.31, 0.31]) {
    ctx.beginPath();
    ctx.ellipse(dx * s * 1.25, 0, s * 0.26, H * 0.97, 0, -Math.PI / 2, Math.PI / 2, dx < 0);
    ctx.stroke();
  }
  // stem + a curl of vine
  ctx.beginPath();
  ctx.moveTo(-s * 0.09, -H * 0.98);
  ctx.quadraticCurveTo(-s * 0.14, -H * 1.3, s * 0.12, -H * 1.34);
  ctx.quadraticCurveTo(s * 0.2, -H * 1.2, s * 0.13, -H * 0.98);
  ctx.closePath();
  ctx.fillStyle = rgba(CREAM, 0.95);
  ctx.fill();
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.strokeStyle = rgba(NAVY, 0.9);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.6, s * 0.022);
  ctx.strokeStyle = rgba(BRASS, 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.16, -H * 1.1);
  ctx.bezierCurveTo(s * 0.4, -H * 1.25, s * 0.46, -H * 1.0, s * 0.3, -H * 0.98);
  ctx.lineWidth = Math.max(0.8, s * 0.03);
  ctx.strokeStyle = rgba(BRASS, 0.9);
  ctx.stroke();
  // the carved face, lit from inside
  const eyeH = H * 0.26 * (1 - 0.75 * squint);
  const eyeW = s * 0.22;
  const ey = -H * 0.22;
  const ex = s * 0.3 * facing;
  ctx.beginPath();
  for (const sgn of [-1, 1]) {
    ctx.moveTo(sgn * ex - sgn * eyeW * 0.15, ey + eyeH / 2);
    ctx.lineTo(sgn * ex + sgn * eyeW * 0.9, ey + eyeH / 2);
    ctx.lineTo(sgn * ex + sgn * eyeW * 0.2, ey - eyeH / 2);
    ctx.closePath();
  }
  ctx.moveTo(0, ey + H * 0.1);
  ctx.lineTo(-s * 0.09, ey + H * 0.34);
  ctx.lineTo(s * 0.09, ey + H * 0.34);
  ctx.closePath();
  const my = H * 0.22;
  const mw = s * 0.62;
  const mh = H * (0.16 + 0.3 * mouth);
  ctx.moveTo(-mw, my - mh * 0.15);
  ctx.quadraticCurveTo(0, my + mh * 1.25, mw, my - mh * 0.15);
  ctx.lineTo(mw * 0.62, my - mh * 0.4);
  ctx.lineTo(mw * 0.5, my - mh * 0.02);
  ctx.lineTo(mw * 0.36, my - mh * 0.48);
  ctx.lineTo(-mw * 0.2, my - mh * 0.48);
  ctx.lineTo(-mw * 0.32, my - mh * 0.02);
  ctx.lineTo(-mw * 0.44, my - mh * 0.4);
  ctx.closePath();
  ctx.fillStyle = rgba(FLAME, 0.85 + 0.15 * flicker);
  ctx.fill();
  ctx.lineWidth = Math.max(0.8, s * 0.03);
  ctx.strokeStyle = rgba(AMBER, 0.95);
  ctx.stroke();
  // light spilling onto the skin around the face
  const g2 = ctx.createRadialGradient(0, H * 0.05, s * 0.05, 0, H * 0.05, s * 0.9);
  g2.addColorStop(0, rgba(AMBER, 0.22 * (0.6 + 0.4 * flicker)));
  g2.addColorStop(1, rgba(AMBER, 0));
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 1.1, H, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** a small bat, wings flapping with `flap` (-1..1) */
function drawBat(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, dir: 1 | -1, flap: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.lineJoin = 'round';
  const wy = -s * 0.55 * flap;
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.18);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.6 + wy * 0.3, s * 1.1, wy);
    ctx.quadraticCurveTo(s * 0.92, s * 0.1, s * 0.72, s * 0.12);
    ctx.quadraticCurveTo(s * 0.56, s * 0.3, s * 0.38, s * 0.22);
    ctx.quadraticCurveTo(s * 0.22, s * 0.4, 0, s * 0.32);
    ctx.quadraticCurveTo(-s * 0.22, s * 0.4, -s * 0.38, s * 0.22);
    ctx.quadraticCurveTo(-s * 0.56, s * 0.3, -s * 0.72, s * 0.12);
    ctx.quadraticCurveTo(-s * 0.92, s * 0.1, -s * 1.1, wy);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.6 + wy * 0.3, 0, -s * 0.18);
    ctx.closePath();
    ctx.moveTo(-s * 0.1, -s * 0.16);
    ctx.lineTo(-s * 0.16, -s * 0.4);
    ctx.lineTo(-s * 0.02, -s * 0.22);
    ctx.moveTo(s * 0.1, -s * 0.16);
    ctx.lineTo(s * 0.16, -s * 0.4);
    ctx.lineTo(s * 0.02, -s * 0.22);
  };
  shape();
  ctx.lineWidth = Math.max(1, s * 0.1);
  ctx.strokeStyle = rgba(NAVY, 0.9);
  ctx.stroke();
  shape();
  ctx.fillStyle = rgba(CREAM, 0.92);
  ctx.fill();
  ctx.lineWidth = Math.max(0.5, s * 0.03);
  ctx.strokeStyle = rgba(BRASS, 0.9);
  ctx.stroke();
  ctx.fillStyle = rgba(AMBER, 0.95);
  ctx.beginPath();
  ctx.arc(-s * 0.08, -s * 0.05, s * 0.035, 0, Math.PI * 2);
  ctx.arc(s * 0.08, -s * 0.05, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function Halloween({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0; // canvas height = bottom of the band
    let yT = 110; // top of the band (under the nav)
    let S = 36; // base pumpkin half-width
    let raf = 0;
    let running = true;
    let t = 0;
    let lastNow = performance.now();
    let pumpkins: Pumpkin[] = [];
    const bats: Bat[] = [];
    let nextBat = rand(2, 5);

    const seed = () => {
      const n = w < 700 ? 3 : w < 1100 ? 4 : 5;
      pumpkins = Array.from({ length: n }, (_, i) => {
        const depth = rand(0.65, 1);
        return {
          x: ((i + rand(0.15, 0.85)) / n) * w,
          y: yT + (h - yT) * rand(0.12, 0.8),
          s: S * (0.55 + 0.6 * depth),
          vx: rand(7, 20) * (Math.random() < 0.5 ? 1 : -1),
          depth,
          bob: rand(0, Math.PI * 2),
          bobA: rand(6, 14),
          bobF: rand(0.22, 0.42),
          rot: rand(-0.1, 0.1),
          flick: rand(0, Math.PI * 2),
          laughIn: rand(1, 9),
          laugh: 0,
        };
      });
    };

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const ticker = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs-ticker-h')) || 0;
      yT = ticker + NAV_H + 6;
      // phones: a tighter strip under the nav so the lanterns hover above the
      // headline more than across it; wider screens get the whole upper sky
      const phone = w < 700;
      h = Math.max(yT + (phone ? 150 : 200), Math.round(vh * (phone ? 0.3 : 0.42)));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = Math.min(40, Math.max(22, w * 0.025));
      seed();
    };

    const step = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);

      // bats: one at a time, every few seconds, across the band
      nextBat -= dt;
      if (nextBat <= 0 && bats.length < 2) {
        const fromLeft = Math.random() < 0.5;
        bats.push({ x: fromLeft ? -40 : w + 40, y: yT + (h - yT) * rand(0.05, 0.6), s: S * rand(0.36, 0.5), dir: fromLeft ? 1 : -1, v: rand(120, 200), ph: rand(0, Math.PI * 2) });
        nextBat = rand(5, 11);
      }
      for (let i = bats.length - 1; i >= 0; i--) {
        const b = bats[i];
        b.x += b.dir * b.v * dt;
        b.y += Math.sin(t * 3 + b.ph) * 0.6;
        if (b.x < -80 || b.x > w + 80) bats.splice(i, 1);
        else drawBat(ctx, b.x, b.y, b.s, b.dir, Math.sin(t * 14 + b.ph));
      }

      // pumpkins: drift, bob, flicker, and every so often one of them laughs
      for (const p of pumpkins) {
        p.x += p.vx * dt * p.depth;
        if (p.x < -p.s * 2.2) p.x = w + p.s * 2.2;
        if (p.x > w + p.s * 2.2) p.x = -p.s * 2.2;
        let mouth = 0.15;
        let squint = 0;
        let wob = 0;
        let hop = 0;
        if (p.laugh > 0) {
          p.laugh += dt;
          if (p.laugh < LAUGH_LEN) {
            const k = Math.abs(Math.sin(p.laugh * LAUGH_HZ));
            mouth = 0.5 + 0.5 * k;
            squint = 0.7;
            wob = Math.sin(p.laugh * LAUGH_HZ) * 0.06;
            hop = k * 6;
          } else {
            p.laugh = 0;
            p.laughIn = rand(5, 13);
          }
        } else {
          p.laughIn -= dt;
          if (p.laughIn <= 0) p.laugh = 0.0001;
        }
        const y = p.y + Math.sin(t * p.bobF * Math.PI * 2 + p.bob) * p.bobA - hop;
        const flick = 0.5 + 0.5 * Math.sin(t * 9 + p.flick) * Math.sin(t * 2.3 + p.flick);
        drawPumpkin(ctx, p.x, y, p.s, p.rot + Math.sin(t * 0.7 + p.bob) * 0.06 + wob, mouth, squint, flick, p.vx > 0 ? 1 : -1);
      }
      raf = requestAnimationFrame(step);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) {
        lastNow = performance.now();
        raf = requestAnimationFrame(step);
      } else cancelAnimationFrame(raf);
    };
    const onScroll = () => {
      canvas.style.opacity = window.scrollY > 160 ? '0.5' : '1';
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('pointer-events-none fixed inset-x-0 top-0 z-[80] transition-opacity duration-700', className)} />;
}
