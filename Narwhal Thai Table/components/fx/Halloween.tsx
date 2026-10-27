'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Halloween — little white ghosts floating across the top of every page,
 * drawn on a fixed canvas. Owner, 26 Oct 2026: first asked for laughing
 * jack-o'-lanterns ("ฟักหัวเราะลอยไปมา"), then "ยังไม่สวยครับ เอาเป็นผี ghost
 * สีขาวก็ได้" — so: the classic sheet ghost, white with a soft halo, navy
 * ink line so it still reads on cream pages, brass hairline edge and brass
 * cheeks to keep it in the placemat family. They drift, bob, their hems
 * ripple; every few seconds one laughs (^ ^ eyes, wide mouth, arms up,
 * little hop); now and then one fades out and reappears somewhere else;
 * on desktop they shy away from the pointer with a startled face.
 *
 * Same conventions as components/fx/Airshow.tsx: the canvas is the strip of
 * sky under the nav (42 % of the viewport on desktop, a tighter strip on
 * phones so they hover above the headline rather than across it); pauses
 * when the tab is hidden; half-ghosts itself once the reader has scrolled
 * into content; motion always on (owner's rule). Mounted by
 * components/fx/AirshowLayer.tsx while lib/events.ts has an event with
 * `fx: 'halloween'` in its window.
 */
type Props = { className?: string };

const WHITE = [255, 255, 255] as const;
const NAVY = [13, 43, 62] as const;
const INK = [23, 52, 74] as const;
const BRASS = [212, 178, 106] as const;
const NAV_H = 72; // components/Nav.tsx h-[72px]

type Mood = { eyes: number; mouth: number; arms: number; wide: number };
type Ghost = {
  x: number; y: number; s: number; vx: number;
  bob: number; bobA: number; bobF: number; ph: number;
  laughIn: number; laugh: number; // seconds until the next laugh / seconds into the current one
  vanishIn: number; vanish: number; // seconds until the next vanishing act / seconds into it
  ox: number; oy: number; // easing offset away from the pointer
  alpha: number;
};

const rgba = (c: readonly [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const LAUGH_LEN = 1.6; // s
const LAUGH_HZ = 14; // rad/s — the hee-hee-hee
const VANISH_LEN = 2.2; // s: 0.7 fade out, 0.8 gone, 0.7 fade in
const SHY_R = 150; // px — how close the pointer gets before a ghost backs off

/** s = half-width of the body (arms reach ±1.4 s, head to −1.26 s, hem to ≈ +1.2 s). */
function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, mood: Mood, t: number, phase: number, alpha: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // halo (reads on navy pages, vanishes on cream ones)
  const halo = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 2.1);
  halo.addColorStop(0, rgba(WHITE, 0.22));
  halo.addColorStop(0.55, rgba(WHITE, 0.07));
  halo.addColorStop(1, rgba(WHITE, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, s * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // body: dome, two mitten arms (raised while laughing), rippling hem
  const top = -1.6 * s; // bezier control height → apex ≈ −1.26 s
  const hemY = 0.85 * s;
  const armY = 0.22 * s;
  const up = mood.arms;
  const n = 4;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(-s, hemY);
    ctx.lineTo(-s, armY + 0.28 * s);
    ctx.bezierCurveTo(-1.05 * s, armY + 0.22 * s - 0.35 * s * up, -1.42 * s, armY + 0.18 * s - 0.55 * s * up, -1.36 * s, armY - 0.05 * s - 0.45 * s * up);
    ctx.bezierCurveTo(-1.3 * s, armY - 0.25 * s - 0.35 * s * up, -1.02 * s, armY - 0.22 * s - 0.12 * s * up, -s, armY - 0.18 * s);
    ctx.lineTo(-s, -0.25 * s);
    ctx.bezierCurveTo(-0.96 * s, top, 0.96 * s, top, s, -0.25 * s);
    ctx.lineTo(s, armY - 0.18 * s);
    ctx.bezierCurveTo(1.02 * s, armY - 0.22 * s - 0.12 * s * up, 1.3 * s, armY - 0.25 * s - 0.35 * s * up, 1.36 * s, armY - 0.05 * s - 0.45 * s * up);
    ctx.bezierCurveTo(1.42 * s, armY + 0.18 * s - 0.55 * s * up, 1.05 * s, armY + 0.22 * s - 0.35 * s * up, s, armY + 0.28 * s);
    ctx.lineTo(s, hemY);
    const w = (2 * s) / n;
    for (let i = 0; i < n; i++) {
      const x0 = s - i * w;
      const x1 = x0 - w;
      const dip = hemY + 0.32 * s + Math.sin(t * 2.6 + phase + i * 1.3) * 0.08 * s;
      const lift = hemY + Math.sin(t * 2.6 + phase + i * 1.3 + 0.9) * 0.05 * s;
      ctx.quadraticCurveTo((x0 + x1) / 2, dip, x1, i === n - 1 ? hemY : lift);
    }
    ctx.closePath();
  };
  // ink line under everything (the outline on cream pages; melts into navy ones)
  path();
  ctx.lineWidth = Math.max(1.2, s * 0.07);
  ctx.strokeStyle = rgba(INK, 0.85);
  ctx.stroke();
  // white body
  path();
  ctx.fillStyle = rgba(WHITE, 0.95);
  ctx.fill();
  // a breath of shade on the lower-left so it has volume
  ctx.save();
  path();
  ctx.clip();
  const sh = ctx.createRadialGradient(0.45 * s, -0.55 * s, 0.2 * s, 0.1 * s, 0.3 * s, 2.1 * s);
  sh.addColorStop(0, rgba(WHITE, 0));
  sh.addColorStop(0.6, rgba(NAVY, 0.035));
  sh.addColorStop(1, rgba(NAVY, 0.13));
  ctx.fillStyle = sh;
  ctx.fillRect(-2 * s, -2 * s, 4 * s, 4 * s);
  ctx.restore();
  // brass hairline — the placemat edge
  path();
  ctx.lineWidth = Math.max(0.6, s * 0.022);
  ctx.strokeStyle = rgba(BRASS, 0.75);
  ctx.stroke();

  // face
  const ex = 0.34 * s;
  const ey = -0.38 * s;
  if (mood.eyes < 0.5) {
    const sq = 1 + 0.25 * mood.wide; // startled → rounder, wider eyes
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(k * ex, ey, 0.13 * s * sq, 0.2 * s * sq, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(INK, 0.95);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(k * ex - 0.04 * s, ey - 0.07 * s, 0.045 * s, 0, Math.PI * 2);
      ctx.fillStyle = rgba(WHITE, 0.95);
      ctx.fill();
    }
  } else {
    ctx.lineWidth = Math.max(1.4, s * 0.075);
    ctx.strokeStyle = rgba(INK, 0.95);
    for (const k of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(k * ex, ey + 0.06 * s, 0.15 * s, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
    }
  }
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 0.56 * s, -0.1 * s, 0.11 * s, 0.07 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(BRASS, 0.22);
    ctx.fill();
  }
  const m = mood.mouth;
  const my = 0.1 * s;
  if (m < 0.15) {
    const o = 1 + 0.6 * mood.wide; // startled → bigger "oh"
    ctx.beginPath();
    ctx.ellipse(0, my + 0.08 * s, 0.11 * s * o, 0.14 * s * o, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(INK, 0.95);
    ctx.fill();
  } else {
    const mw = 0.14 * s + 0.22 * s * m;
    const mh = 0.1 * s + 0.42 * s * m;
    ctx.beginPath();
    ctx.moveTo(-mw, my);
    ctx.quadraticCurveTo(0, my - 0.06 * s, mw, my);
    ctx.quadraticCurveTo(0, my + mh * 2, -mw, my);
    ctx.closePath();
    ctx.fillStyle = rgba(INK, 0.95);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(0, my + mh * 0.95, mw * 0.55, mh * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(BRASS, 0.9);
    ctx.fill();
    ctx.restore();
  }
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
    let S = 40; // base ghost half-width
    let raf = 0;
    let running = true;
    let t = 0;
    let lastNow = performance.now();
    let ghosts: Ghost[] = [];
    let phone = false;
    const pointer = { x: -9999, y: -9999, on: false };

    // phones: a single lane right under the nav (over the eyebrow line, above
    // the headline); wider screens: anywhere in the upper sky
    const spawnY = () => (phone ? yT + rand(24, 38) : yT + (h - yT) * rand(0.2, 0.75));

    const seed = () => {
      const n = phone ? 3 : w < 1100 ? 4 : 5;
      ghosts = Array.from({ length: n }, (_, i) => ({
        x: ((i + rand(0.2, 0.8)) / n) * w,
        y: spawnY(),
        s: S * rand(0.8, 1.15),
        vx: rand(6, 16) * (Math.random() < 0.5 ? 1 : -1),
        bob: rand(0, Math.PI * 2),
        bobA: phone ? rand(5, 9) : rand(8, 16),
        bobF: rand(0.22, 0.4),
        ph: rand(0, Math.PI * 2),
        laughIn: rand(2, 8) + i * 1.5,
        laugh: 0,
        vanishIn: rand(12, 30) + i * 4,
        vanish: 0,
        ox: 0,
        oy: 0,
        alpha: 1,
      }));
    };

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const ticker = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs-ticker-h')) || 0;
      yT = ticker + NAV_H + 6;
      phone = w < 700;
      h = phone ? yT + 130 : Math.max(yT + 200, Math.round(vh * 0.42));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = phone ? 21 : Math.min(46, Math.max(26, w * 0.029));
      seed();
    };

    const step = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);

      for (const g of ghosts) {
        g.x += g.vx * dt;
        if (g.x < -g.s * 2.5) g.x = w + g.s * 2.5;
        if (g.x > w + g.s * 2.5) g.x = -g.s * 2.5;

        // vanishing act: fade out, pop up somewhere else, fade in
        if (g.vanish > 0) {
          g.vanish += dt;
          if (g.vanish < 0.7) g.alpha = 1 - g.vanish / 0.7;
          else if (g.vanish < 1.5) {
            if (g.alpha !== 0) { g.alpha = 0; g.x = rand(g.s * 2, w - g.s * 2); g.y = spawnY(); }
          } else if (g.vanish < VANISH_LEN) g.alpha = (g.vanish - 1.5) / 0.7;
          else { g.vanish = 0; g.alpha = 1; g.vanishIn = rand(14, 32); }
        } else {
          g.vanishIn -= dt;
          if (g.vanishIn <= 0 && g.laugh === 0) g.vanish = 0.0001;
        }

        // laugh
        const mood: Mood = { eyes: 0, mouth: 0, arms: 0, wide: 0 };
        let hop = 0;
        let wob = 0;
        if (g.laugh > 0) {
          g.laugh += dt;
          if (g.laugh < LAUGH_LEN) {
            const k = Math.abs(Math.sin(g.laugh * LAUGH_HZ));
            mood.eyes = 1;
            mood.mouth = 0.55 + 0.45 * k;
            mood.arms = 0.6 + 0.4 * k;
            hop = k * 8;
            wob = Math.sin(g.laugh * LAUGH_HZ) * 0.07;
          } else {
            g.laugh = 0;
            g.laughIn = rand(6, 14);
          }
        } else if (g.vanish === 0) {
          g.laughIn -= dt;
          if (g.laughIn <= 0) g.laugh = 0.0001;
        }

        // shy of the pointer (desktop): ease away and look startled
        const by = g.y + Math.sin(t * g.bobF * Math.PI * 2 + g.bob) * g.bobA - hop;
        let tx = 0;
        let ty = 0;
        if (pointer.on && g.alpha > 0.5) {
          const dx = g.x + g.ox - pointer.x;
          const dy = by + g.oy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < SHY_R && d > 0.001) {
            const push = (SHY_R - d) * 0.9;
            tx = (dx / d) * push;
            ty = (dy / d) * push;
            if (g.laugh === 0) mood.wide = Math.min(1, (SHY_R - d) / 80);
          }
        }
        const ease = Math.min(1, dt * 5);
        g.ox += (tx - g.ox) * ease;
        g.oy += (ty - g.oy) * ease;

        const rot = Math.sin(t * 0.6 + g.bob) * 0.06 + wob + (g.vx > 0 ? 0.04 : -0.04);
        drawGhost(ctx, g.x + g.ox, by + g.oy, g.s, rot, mood, t, g.ph, g.alpha);
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
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
    };
    const onLeave = () => { pointer.on = false; };

    resize();
    onScroll();
    raf = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('pointer-events-none fixed inset-x-0 top-0 z-[80] transition-opacity duration-700', className)} />;
}
