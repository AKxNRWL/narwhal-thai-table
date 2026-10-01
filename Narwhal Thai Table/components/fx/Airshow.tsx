'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Airshow — a full flying display across the top of every page, drawn on a
 * fixed canvas in the placemat's hand: navy ink line, cream fill, a brass
 * edge, smoke in cream. Owner, 30 Sep 2026, for the Pacific Airshow weekend:
 * "เอาเป็น มีเครื่องบิน บินอยู่ในเว็บเลย" → 1 Oct "ขึ้นทุกหน้า" → "บินกันให้ว่อน ๆ".
 *
 * The band is the strip of sky under the nav (ticker + 72 px nav + a little)
 * down to ~40 % of the viewport; the canvas is only that tall. Two-tone
 * drawing so it works on both grounds: on navy pages the navy ink vanishes
 * and you see cream silhouettes with brass edges and cream smoke; on cream
 * pages the cream vanishes and you see the navy line art and a thin navy
 * trail — the placemat's own ink either way.
 *
 * The programme is a scheduler, not a script: acts (formation passes in
 * diamond / vic / echelon / delta / pair / trail / line-abreast, opposing
 * solos, a loop with climb-out, a bomb-burst fountain, a rolling pass) spawn
 * every 1–2 s at random altitudes and directions, three or four at once, so
 * the sky is never empty. Fixed-step simulation so smoke stays smooth on
 * throttled tabs; pauses when hidden; half-ghosts itself once the reader
 * has scrolled into content. Motion is always on — no reduced-motion branch
 * by owner's rule.
 */
type Props = { className?: string };

const CREAM = [247, 240, 225] as const;
const NAVY = [13, 43, 62] as const;
const BRASS = [212, 178, 106] as const;
const NAV_H = 72; // components/Nav.tsx h-[72px]

type Jet = { x: number; y: number; heading: number; on: boolean; trail: { x: number; y: number; a: number }[] };
type Act = { kind: string; t: number; jets: Jet[]; update: (tt: number) => boolean };

const rgba = (c: readonly [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];

/** formation shapes: [along-track (negative = behind the lead), lateral] in gap units */
const SHAPES: Record<string, [number, number][]> = {
  diamond: [[0, 0], [-1, -0.8], [-1, 0.8], [-2, 0]],
  vic: [[0, 0], [-1, -0.9], [-1, 0.9]],
  echelon: [[0, 0], [-1, 0.8], [-2, 1.6], [-3, 2.4]],
  delta: [[0, 0], [-1, -0.9], [-1, 0.9], [-2, -1.8], [-2, 1.8], [-2, 0]],
  pair: [[0, 0], [-1.2, 0.7]],
  trail: [[0, 0], [-1.6, 0], [-3.2, 0]],
  abreast: [[0, -1.2], [0, 0], [0, 1.2]],
};

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
    ctx.lineWidth = L * (0.05 + 0.2 * (1 - k)) * p.a;
    ctx.strokeStyle = rgba(CREAM, 0.4 * k * p.a);
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
    let speed = 200; // px per second, base
    let trailMax = 120;
    let maxActs = 3;
    let raf = 0;
    let running = true;
    const acts: Act[] = [];
    const fading: Jet[] = []; // jets whose act is over, smoke still clearing
    let lastKind = '';
    let nextSpawn = 0.3; // seconds of sim time until the next act

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
      L = Math.min(40, Math.max(20, w * 0.026));
      speed = Math.max(170, w / 6.5);
      trailMax = w < 700 ? 80 : 120;
      maxActs = w < 700 ? 3 : 4;
    };

    const newJet = (): Jet => ({ x: 0, y: 0, heading: 0, on: false, trail: [] });

    /** place a jet, record smoke from its tail */
    const put = (j: Jet, x: number, y: number, heading: number) => {
      j.on = true;
      j.x = x;
      j.y = y;
      j.heading = heading;
      const tx = x - Math.cos(heading) * L * 0.5;
      const ty = y - Math.sin(heading) * L * 0.5;
      j.trail.push({ x: tx + (Math.random() - 0.5) * 1.2, y: ty + (Math.random() - 0.5) * 1.2, a: 1 });
      if (j.trail.length > trailMax) j.trail.shift();
    };

    /** place a whole formation around a lead at (x, y) flying along `heading` */
    const putFormation = (jets: Jet[], shape: [number, number][], x: number, y: number, heading: number) => {
      const gap = L * 1.35;
      const cx = Math.cos(heading);
      const sy = Math.sin(heading);
      shape.forEach(([along, lateral], i) => {
        const dx = along * gap;
        const dy = lateral * gap;
        put(jets[i], x + dx * cx - dy * sy, y + dx * sy + dy * cx, heading);
      });
    };

    // ── acts ──────────────────────────────────────────────────────────────
    const band = () => h - yT;

    /** a formation pass across the band, with a gentle swell in altitude */
    const cross = (shape: string, dir: 1 | -1, altFrac: number, vMul = 1): Act => {
      const pts = SHAPES[shape];
      const jets = pts.map(newJet);
      const alt = yT + band() * altFrac;
      const swell = band() * rand(0.03, 0.08);
      const phase = rand(0, Math.PI * 2);
      const span = w + L * 12;
      const v = speed * vMul * rand(0.9, 1.15);
      const dur = span / v;
      return {
        kind: 'cross', t: 0, jets,
        update(tt) {
          const u = tt / dur;
          if (u > 1) return false;
          const x = dir > 0 ? -L * 6 + span * u : w + L * 6 - span * u;
          const y = alt + Math.sin(u * Math.PI * 1.3 + phase) * swell;
          const dydu = Math.cos(u * Math.PI * 1.3 + phase) * swell * Math.PI * 1.3;
          const heading = Math.atan2(dydu, dir * span);
          putFormation(jets, pts, x, y, heading);
          return true;
        },
      };
    };

    /** two solos meet head-on at the middle, a hand's width apart */
    const opposing = (altFrac: number): Act => {
      const jets = [newJet(), newJet()];
      const alt = yT + band() * altFrac;
      const v = speed * 1.35;
      const span = w + L * 8;
      const dur = span / v;
      const sep = L * 0.7;
      return {
        kind: 'opposing', t: 0, jets,
        update(tt) {
          if (tt > dur) return false;
          put(jets[0], -L * 4 + tt * v, alt - sep, 0);
          put(jets[1], w + L * 4 - tt * v, alt + sep, Math.PI);
          return true;
        },
      };
    };

    /** a lone jet: in low, one loop, a steep climb, out along the top of the band */
    const loop = (dir: 1 | -1): Act => {
      const j = newJet();
      const bnd = band();
      const cruise = yT + bnd * rand(0.7, 0.82);
      const R = Math.min(Math.min(w, h) * 0.09, bnd * 0.3);
      const cx = w * rand(0.5, 0.68);
      const cy = cruise - R;
      const v = speed * 1.05;
      const inDist = w + L * 2 - cx;
      const loopDur = (2 * Math.PI * R) / (v * 0.85);
      const topY = yT + bnd * 0.14;
      const kneeX = w * 0.42;
      const climbDist = Math.hypot(cx - kneeX, cruise - topY);
      const outDist = kneeX + L * 3;
      const tIn = inDist / v;
      const tClimb = climbDist / v;
      const tOut = outDist / v;
      const dur = tIn + loopDur + tClimb + tOut;
      // canonical: enters from the right; dir = +1 mirrors it
      const place = (x: number, y: number, heading: number) =>
        dir < 0 ? put(j, x, y, heading) : put(j, w - x, y, Math.atan2(Math.sin(heading), -Math.cos(heading)));
      return {
        kind: 'loop', t: 0, jets: [j],
        update(tt) {
          if (tt > dur) return false;
          if (tt < tIn) place(w + L * 2 - tt * v, cruise, Math.PI);
          else if (tt < tIn + loopDur) {
            const phi = ((tt - tIn) / loopDur) * Math.PI * 2;
            place(cx - R * Math.sin(phi), cy + R * Math.cos(phi), Math.atan2(-Math.sin(phi), -Math.cos(phi)));
          } else if (tt < tIn + loopDur + tClimb) {
            const k = (tt - tIn - loopDur) / tClimb;
            place(cx + (kneeX - cx) * k, cruise + (topY - cruise) * k, Math.atan2(topY - cruise, kneeX - cx));
          } else place(kneeX - (tt - tIn - loopDur - tClimb) * v, topY, Math.PI);
          return true;
        },
      };
    };

    /** bomb burst: four climb together from below the band, then fountain out left and right */
    const burst = (xFrac: number): Act => {
      const jets = [newJet(), newJet(), newJet(), newJet()];
      const bnd = band();
      const bx = w * xFrac;
      const by = yT + bnd * 0.6; // where they split
      const v = speed * 1.1;
      const y0 = h + L * 2;
      const tc = (y0 - by) / v;
      const radii = [bnd * 0.18, bnd * 0.4, bnd * 0.18, bnd * 0.4];
      const sides = [-1, -1, 1, 1];
      const phiMax = Math.PI * 0.78;
      const dur = tc + Math.max(...radii.map((R) => (phiMax * R) / v)) + 3.5;
      return {
        kind: 'burst', t: 0, jets,
        update(tt) {
          if (tt > dur) return false;
          jets.forEach((j, i) => {
            const R = radii[i];
            const s = sides[i];
            if (tt < tc) {
              put(j, bx + (i - 1.5) * L * 0.55, y0 - tt * v, -Math.PI / 2);
              return;
            }
            const ta = (phiMax * R) / v;
            const t2 = tt - tc;
            if (t2 < ta) {
              const phi = (t2 / ta) * phiMax;
              // arc up and over, turning towards `s`
              const x = bx + s * R * (1 - Math.cos(phi));
              const y = by - R * Math.sin(phi);
              put(j, x, y, Math.atan2(-Math.cos(phi), s * Math.sin(phi)));
              return;
            }
            const xEnd = bx + s * R * (1 - Math.cos(phiMax));
            const yEnd = by - R * Math.sin(phiMax);
            const heading = Math.atan2(-Math.cos(phiMax), s * Math.sin(phiMax));
            const d = (t2 - ta) * v;
            put(j, xEnd + Math.cos(heading) * d, yEnd + Math.sin(heading) * d, heading);
          });
          return true;
        },
      };
    };

    /** a rolling pass: one jet corkscrews across */
    const roll = (dir: 1 | -1, altFrac: number): Act => {
      const j = newJet();
      const alt = yT + band() * altFrac;
      const amp = band() * 0.07;
      const v = speed * 1.25;
      const span = w + L * 8;
      const dur = span / v;
      const om = Math.PI * 2 * 0.55;
      return {
        kind: 'roll', t: 0, jets: [j],
        update(tt) {
          if (tt > dur) return false;
          const x = dir > 0 ? -L * 4 + tt * v : w + L * 4 - tt * v;
          const y = alt + Math.sin(tt * om) * amp;
          put(j, x, y, Math.atan2(Math.cos(tt * om) * amp * om, dir * v));
          return true;
        },
      };
    };

    const spawn = () => {
      const kinds = ['cross', 'cross', 'cross', 'cross', 'opposing', 'loop', 'burst', 'roll', 'chase'];
      let kind = pick(kinds);
      if (kind === lastKind) kind = pick(kinds);
      lastKind = kind;
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      let act: Act;
      switch (kind) {
        case 'opposing': act = opposing(rand(0.2, 0.75)); break;
        case 'loop': act = loop(dir); break;
        case 'burst': act = burst(rand(0.3, 0.7)); break;
        case 'roll': act = roll(dir, rand(0.15, 0.7)); break;
        case 'chase': act = cross('trail', dir, rand(0.55, 0.85), 1.6); break;
        default: act = cross(pick(['diamond', 'vic', 'echelon', 'delta', 'pair', 'abreast']), dir, rand(0.1, 0.8));
      }
      acts.push(act);
    };

    /** advance the programme by dt seconds */
    const simulate = (dt: number) => {
      nextSpawn -= dt;
      if (acts.length === 0 || (acts.length < maxActs && nextSpawn <= 0)) {
        spawn();
        nextSpawn = rand(0.7, 2.0);
      }
      for (let i = acts.length - 1; i >= 0; i--) {
        const a = acts[i];
        a.t += dt;
        for (const j of a.jets) j.on = false;
        if (!a.update(a.t)) {
          acts.splice(i, 1);
          for (const j of a.jets) {
            j.on = false;
            fading.push(j);
          }
        }
      }
      for (const a of acts) for (const j of a.jets) for (const p of j.trail) p.a *= 0.992;
      for (let i = fading.length - 1; i >= 0; i--) {
        const j = fading[i];
        for (const p of j.trail) p.a *= 0.97;
        while (j.trail.length && j.trail[0].a < 0.02) j.trail.shift();
        if (!j.trail.length) fading.splice(i, 1);
      }
      while (fading.length > 24) fading.shift();
    };

    const DT = 1 / 60; // fixed simulation step, so a throttled tab still lays smooth smoke
    let lastNow = performance.now();

    const step = () => {
      if (!running) return;
      const now = performance.now();
      let budget = Math.min(1.5, (now - lastNow) / 1000); // after a long pause, don't replay the whole gap
      lastNow = now;
      while (budget >= DT) {
        simulate(DT);
        budget -= DT;
      }
      ctx.clearRect(0, 0, w, h);
      for (const j of fading) drawTrail(ctx, j.trail, L);
      for (const a of acts) for (const j of a.jets) drawTrail(ctx, j.trail, L);
      for (const a of acts) for (const j of a.jets) if (j.on) drawJet(ctx, j.x, j.y, j.heading, L);
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
