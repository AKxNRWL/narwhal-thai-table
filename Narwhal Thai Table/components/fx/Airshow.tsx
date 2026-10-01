'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Airshow — a little flying display over the hero sky, drawn on a canvas in
 * the placemat's hand (cream fills, brass lines, smoke in cream). Owner, 30 Sep
 * 2026, for the Pacific Airshow weekend: "เอาเป็น มีเครื่องบิน บินอยู่ในเว็บเลย".
 *
 * One 32-second cycle: a four-jet diamond crosses left → right trailing smoke
 * (2 s–10 s), then a lone jet comes in from the right, pulls a full loop over
 * the lanterns and flies out (14 s–27 s). Shown only while lib/events.ts has an
 * active event with fx: 'airshow' (see Hero.tsx); pauses when the tab is hidden.
 * Motion is always on — the site has no reduced-motion branch by owner's rule.
 */
type Props = { className?: string };

const CREAM = [247, 240, 225] as const;
const BRASS = [212, 178, 106] as const;
const CYCLE = 32; // seconds
const TRAIL_MAX = 150;

type Jet = { x: number; y: number; heading: number; on: boolean; trail: { x: number; y: number; a: number }[] };

/** generic swept-wing jet silhouette seen from below, nose along +x, length L */
function drawJet(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, L: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.8, L * 0.035);
  ctx.strokeStyle = `rgba(${BRASS[0]},${BRASS[1]},${BRASS[2]},0.95)`;
  ctx.fillStyle = `rgba(${CREAM[0]},${CREAM[1]},${CREAM[2]},0.92)`;
  // wings (one piece, swept back)
  ctx.beginPath();
  ctx.moveTo(L * 0.12, 0);
  ctx.lineTo(-L * 0.28, -L * 0.34);
  ctx.lineTo(-L * 0.4, -L * 0.3);
  ctx.lineTo(-L * 0.3, 0);
  ctx.lineTo(-L * 0.4, L * 0.3);
  ctx.lineTo(-L * 0.28, L * 0.34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // tail planes
  ctx.beginPath();
  ctx.moveTo(-L * 0.36, 0);
  ctx.lineTo(-L * 0.52, -L * 0.15);
  ctx.lineTo(-L * 0.55, -L * 0.12);
  ctx.lineTo(-L * 0.48, 0);
  ctx.lineTo(-L * 0.55, L * 0.12);
  ctx.lineTo(-L * 0.52, L * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // fuselage
  ctx.beginPath();
  ctx.moveTo(L * 0.5, 0);
  ctx.quadraticCurveTo(L * 0.3, -L * 0.07, -L * 0.1, -L * 0.065);
  ctx.lineTo(-L * 0.52, -L * 0.04);
  ctx.lineTo(-L * 0.52, L * 0.04);
  ctx.lineTo(-L * 0.1, L * 0.065);
  ctx.quadraticCurveTo(L * 0.3, L * 0.07, L * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // canopy
  ctx.beginPath();
  ctx.ellipse(L * 0.2, 0, L * 0.09, L * 0.035, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${BRASS[0]},${BRASS[1]},${BRASS[2]},0.7)`;
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
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(p.x, p.y);
    ctx.lineWidth = L * (0.05 + 0.22 * (1 - k)) * p.a; // smoke widens as it ages
    ctx.strokeStyle = `rgba(${CREAM[0]},${CREAM[1]},${CREAM[2]},${(0.42 * k * p.a).toFixed(3)})`;
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
    let h = 0;
    let L = 30;
    let raf = 0;
    let running = true;
    const jets: Jet[] = Array.from({ length: 5 }, () => ({ x: 0, y: 0, heading: 0, on: false, trail: [] }));

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      h = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
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

      // ── 1. the diamond: four jets, left → right, a gentle swell in altitude,
      //      high in the sky band above the headline (hero text starts ~20 % down)
      const fStart = 2;
      const fDur = 8.5;
      if (t >= fStart && t <= fStart + fDur) {
        const u = (t - fStart) / fDur; // constant speed reads as flight, not UI
        const x0 = -L * 4 + (w + L * 8) * u;
        const y0 = h * 0.125 + Math.sin(u * Math.PI * 1.4) * h * 0.025;
        const slope = (Math.cos(u * Math.PI * 1.4) * h * 0.025 * Math.PI * 1.4) / (w + L * 8);
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

      // ── 2. the lone jet: in from the right over the lanterns, one loop,
      //      then a climb-out to the top-left so it never crosses the headline
      const sStart = 14;
      const R = Math.min(w, h) * 0.09;
      const cx = w * 0.62;
      const cruise = h * 0.3; // right-hand sky, above the medallion card
      const cy = cruise - R; // loop centre; its bottom (cy + R) is the cruise line
      const speed = Math.max(160, w / 7); // px per second
      const inDist = w + L * 2 - cx;
      const loopDur = (2 * Math.PI * R) / (speed * 0.85);
      // climb-out: a steep pull up to the top of the sky while still over the
      // right half, then level flight out above the headline
      const topY = h * 0.12; // the same sky band as the diamond, clear of the nav
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

    resize();
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />;
}
