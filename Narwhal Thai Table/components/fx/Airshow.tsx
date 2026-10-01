'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Airshow — a little flying display across the top of every page, drawn on a
 * fixed canvas in the placemat's hand: navy ink line, cream fill, a brass
 * edge, smoke in cream. Owner, 30 Sep 2026, for the Pacific Airshow weekend:
 * "เอาเป็น มีเครื่องบิน บินอยู่ในเว็บเลย", then 1 Oct: "เอาให้ขึ้นทุกหน้าเลย".
 *
 * The band is the strip of sky under the nav (ticker + 72 px nav + a little)
 * down to ~40 % of the viewport; the canvas is only that tall. Two-tone
 * drawing so it works on both grounds: on navy pages the navy ink vanishes
 * and you see cream silhouettes with brass edges and cream smoke; on cream
 * pages the cream vanishes and you see the navy line art and a thin navy
 * trail — the placemat's own ink either way.
 *
 * One 32-second cycle: a four-jet diamond crosses left → right high in the
 * band (2 s–10.5 s), then a lone jet comes in from the right, pulls a loop,
 * climbs out and exits left along the top of the band (14 s–~27 s).
 * Mounted by AirshowLayer only while lib/events.ts says so; fixed-step
 * simulation so smoke stays smooth on throttled tabs; pauses when hidden.
 * Motion is always on — the site has no reduced-motion branch by owner's rule.
 */
type Props = { className?: string };

const CREAM = [247, 240, 225] as const;
const NAVY = [13, 43, 62] as const;
const BRASS = [212, 178, 106] as const;
const CYCLE = 32; // seconds
const TRAIL_MAX = 150;
const NAV_H = 72; // components/Nav.tsx h-[72px]

type Jet = { x: number; y: number; heading: number; on: boolean; trail: { x: number; y: number; a: number }[] };

const rgba = (c: readonly [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;

/** generic swept-wing jet silhouette seen from below, nose along +x, length L */
function drawJet(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, L: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.lineJoin = 'round';
  const body = () => {
    // wings (one piece, swept back)
    ctx.beginPath();
    ctx.moveTo(L * 0.12, 0);
    ctx.lineTo(-L * 0.28, -L * 0.34);
    ctx.lineTo(-L * 0.4, -L * 0.3);
    ctx.lineTo(-L * 0.3, 0);
    ctx.lineTo(-L * 0.4, L * 0.3);
    ctx.lineTo(-L * 0.28, L * 0.34);
    ctx.closePath();
    // tail planes
    ctx.moveTo(-L * 0.36, 0);
    ctx.lineTo(-L * 0.52, -L * 0.15);
    ctx.lineTo(-L * 0.55, -L * 0.12);
    ctx.lineTo(-L * 0.48, 0);
    ctx.lineTo(-L * 0.55, L * 0.12);
    ctx.lineTo(-L * 0.52, L * 0.15);
    ctx.closePath();
    // fuselage
    ctx.moveTo(L * 0.5, 0);
    ctx.quadraticCurveTo(L * 0.3, -L * 0.07, -L * 0.1, -L * 0.065);
    ctx.lineTo(-L * 0.52, -L * 0.04);
    ctx.lineTo(-L * 0.52, L * 0.04);
    ctx.lineTo(-L * 0.1, L * 0.065);
    ctx.quadraticCurveTo(L * 0.3, L * 0.07, L * 0.5, 0);
    ctx.closePath();
  };
  // navy ink under everything (the outline on cream pages; invisible on navy)
  body();
  ctx.lineWidth = Math.max(1.2, L * 0.07);
  ctx.strokeStyle = rgba(NAVY, 0.9);
  ctx.stroke();
  // cream fill, brass edge (the silhouette on navy pages)
  body();
  ctx.fillStyle = rgba(CREAM, 0.94);
  ctx.fill();
  ctx.lineWidth = Math.max(0.6, L * 0.022);
  ctx.strokeStyle = rgba(BRASS, 0.9);
  ctx.stroke();
  // canopy
  ctx.beginPath();
  ctx.ellipse(L * 0.2, 0, L * 0.09, L * 0.035, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(BRASS, 0.8);
  ctx.fill();
  ctx.restore();
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: Jet['trail'], L: number) {
  if (trail.length < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 1; i < trail.length; i++) {
    const p = trail[i];
    const q = trail[i - 1];
    const k = i / trail.length; // 0 = oldest, 1 = freshest
    // a thin navy thread (what you see on cream pages) …
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = Math.max(0.5, L * 0.04 * p.a);
    ctx.strokeStyle = rgba(NAVY, 0.3 * k * p.a);
    ctx.stroke();
    // … under the cream smoke that widens as it ages (what you see on navy)
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = L * (0.05 + 0.22 * (1 - k)) * p.a;
    ctx.strokeStyle = rgba(CREAM, 0.42 * k * p.a);
    ctx.stroke();
  }
}

export default function Airshow({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0; // canvas height = bottom of the sky band
    let yT = 110; // top of the band (under the nav)
    let L = 30;
    let raf = 0;
    let running = true;
    const jets: Jet[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0, heading: 0, on: false, trail: [] }));

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const ticker = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs-ticker-h')) || 0;
      yT = ticker + NAV_H + 6;
      h = Math.max(yT + 200, Math.round(vh * 0.4));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L = Math.min(44, Math.max(22, w * 0.028));
    };

    /** place a jet, record smoke from its tail */
    const put = (j: Jet, x: number, y: number, heading: number) => {
      j.on = true;
      j.x = x;
      j.y = y;
      j.heading = heading;
      const tx = x - Math.cos(heading) * L * 0.5;
      const ty = y - Math.sin(heading) * L * 0.5;
      j.trail.push({ x: tx + (Math.random() - 0.5) * 1.2, y: ty + (Math.random() - 0.5) * 1.2, a: 1 });
      if (j.trail.length > TRAIL_MAX) j.trail.shift();
    };

    /** where everything is at cycle time t (seconds) — records smoke as a side effect */
    const simulate = (t: number) => {
      for (const j of jets) j.on = false;
      const band = h - yT;

      // ── 1. the diamond: four jets, left → right, high in the band
      const fStart = 2;
      const fDur = 8.5;
      if (t >= fStart && t <= fStart + fDur) {
        const u = (t - fStart) / fDur; // constant speed reads as flight, not UI
        const x0 = -L * 4 + (w + L * 8) * u;
        const swell = band * 0.08;
        const y0 = yT + band * 0.2 + Math.sin(u * Math.PI * 1.4) * swell;
        const slope = (Math.cos(u * Math.PI * 1.4) * swell * Math.PI * 1.4) / (w + L * 8);
        const heading = Math.atan2(slope, 1);
        const gap = L * 1.35;
        const offsets = [
          [0, 0],
          [-gap, -gap * 0.8],
          [-gap, gap * 0.8],
          [-gap * 2, 0],
        ];
        offsets.forEach(([dx, dy], i) => put(jets[i], x0 + dx, y0 + dy, heading));
      }

      // ── 2. the lone jet: in from the right low in the band, one loop,
      //      a steep climb while still on the right, then level flight out
      //      along the top of the band
      const sStart = 14;
      const cruise = yT + band * 0.78;
      const R = Math.min(Math.min(w, h) * 0.09, band * 0.3);
      const cx = w * 0.62;
      const cy = cruise - R; // loop centre; its bottom (cy + R) is the cruise line
      const speed = Math.max(160, w / 7); // px per second
      const inDist = w + L * 2 - cx;
      const loopDur = (2 * Math.PI * R) / (speed * 0.85);
      const topY = yT + band * 0.16;
      const kneeX = w * 0.46;
      const climbDist = Math.hypot(cx - kneeX, cruise - topY);
      const outDist = kneeX + L * 3;
      const tIn = inDist / speed;
      const tClimb = climbDist / speed;
      const tOut = outDist / speed;
      const sEnd = sStart + tIn + loopDur + tClimb + tOut;
      if (t >= sStart && t <= sEnd) {
        const j = jets[4];
        const tt = t - sStart;
        if (tt < tIn) {
          put(j, w + L * 2 - tt * speed, cruise, Math.PI);
        } else if (tt < tIn + loopDur) {
          const phi = ((tt - tIn) / loopDur) * Math.PI * 2;
          put(j, cx - R * Math.sin(phi), cy + R * Math.cos(phi), Math.atan2(-Math.sin(phi), -Math.cos(phi)));
        } else if (tt < tIn + loopDur + tClimb) {
          const k = (tt - tIn - loopDur) / tClimb;
          put(j, cx + (kneeX - cx) * k, cruise + (topY - cruise) * k, Math.atan2(topY - cruise, kneeX - cx));
        } else {
          put(j, kneeX - (tt - tIn - loopDur - tClimb) * speed, topY, Math.PI);
        }
      }
    };

    const DT = 1 / 60; // fixed simulation step, so a throttled tab still lays smooth smoke
    let simT = 0;
    let lastNow = performance.now();

    const step = () => {
      if (!running) return;
      const now = performance.now();
      let budget = Math.min(2, (now - lastNow) / 1000); // after a long pause, don't replay the whole gap
      lastNow = now;
      while (budget >= DT) {
        simT = (simT + DT) % CYCLE;
        simulate(simT);
        for (const j of jets) for (const p of j.trail) p.a *= j.on ? 0.992 : 0.975;
        budget -= DT;
      }
      for (const j of jets) while (j.trail.length && j.trail[0].a < 0.02) j.trail.shift();

      ctx.clearRect(0, 0, w, h);
      for (const j of jets) drawTrail(ctx, j.trail, L);
      for (const j of jets) if (j.on) drawJet(ctx, j.x, j.y, j.heading, L);
      raf = requestAnimationFrame(step);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) {
        lastNow = performance.now();
        raf = requestAnimationFrame(step);
      } else cancelAnimationFrame(raf);
    };

    // full strength over the sky at the top of a page; half-ghosted once the
    // reader has scrolled into the content, so the display never fights copy
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
