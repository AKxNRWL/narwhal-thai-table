'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Halloween — a little cartoon ghost peeks out from the right edge of the
 * page, works up the courage to come out, calls its friends ("boo!"), and
 * the whole gang pours in and fills the sky under the nav; they party, then
 * drift back behind the edge and it starts over. Owner, 27 Oct 2026, after
 * two drawn attempts: "ผีแบบนี้ … ไม่ต้องลอยก็ได้ เอาเป็นแบบแอบมองอยู่ตรงกรอบ
 * แล้วมีจังหวะออกมา และก็เรียกเพื่อนมา ทีนี้มากันเต็มเลย … อนิเมชั่นลูป".
 *
 * Art: four poses of one original ghost (shy / waving / laughing / surprised),
 * generated as a sticker sheet (gpt_image_2_5, transparent background) and cut
 * into public/images/halloween/ghost-{peek,wave,laugh,wow}.webp (560 px tall,
 * ~26 KB each). Everything else — the peeking, the waving, the speech bubble,
 * the stream of friends — is this canvas script.
 *
 * Same conventions as components/fx/Airshow.tsx: fixed canvas in the strip
 * under the nav (42 % of the viewport; a 160 px lane on phones — the gang
 * keeps to the right ~58 % on wide screens so the headline stays readable),
 * pauses when the tab
 * is hidden, half-ghosts itself once the reader has scrolled into content,
 * motion always on (owner's rule). Mounted by components/fx/AirshowLayer.tsx
 * while lib/events.ts has an event with `fx: 'halloween'` in its window.
 */
type Props = { className?: string };

type Pose = 'peek' | 'wave' | 'laugh' | 'wow';
const POSES: Pose[] = ['peek', 'wave', 'laugh', 'wow'];
const SRC: Record<Pose, string> = {
  peek: '/images/halloween/ghost-peek.webp',
  wave: '/images/halloween/ghost-wave.webp',
  laugh: '/images/halloween/ghost-laugh.webp',
  wow: '/images/halloween/ghost-wow.webp',
};
const NAV_H = 72; // components/Nav.tsx h-[72px]
const NAVY = '#0D2B3E';

// the loop, in seconds
const T_PEEK = 1; // first peek from the edge
const T_OUT = 7; // comes all the way out
const T_CALL = 9; // waves and calls ("boo!")
const T_FRIENDS = 12.5; // friends stream in
const T_PARTY = 19; // everyone's here
const T_LEAVE = 26; // they drift off
const T_REST = 30.5; // lead slips back behind the edge
const T_LOOP = 32;

type Friend = {
  pose: Pose; flip: boolean;
  sx: number; sy: number; size: number; // slot (centre) + drawn height
  delayIn: number; delayOut: number; fromY: number;
  bobPh: number; bobA: number; bobF: number;
  act: 'none' | 'hop' | 'spin'; actT: number; actPose: Pose;
  ox: number; oy: number; // easing offset away from the pointer
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInCubic = (p: number) => p * p * p;
const easeOutBack = (p: number) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const easeInOut = (p: number) => -(Math.cos(Math.PI * p) - 1) / 2;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** progress 0..1 of a tween that starts at t0 and lasts d (clamped) */
const prog = (t: number, t0: number, d: number) => clamp01((t - t0) / d);

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
    let phone = false;
    let lead = 150; // lead ghost drawn height
    let raf = 0;
    let running = true;
    let alive = true;
    let t = 0;
    let lastNow = performance.now();
    let friends: Friend[] = [];
    let leadSlot = { x: 0, y: 0 };
    let leadBob = 0;
    const pointer = { x: -9999, y: -9999, on: false };
    const img = {} as Record<Pose, HTMLImageElement>;

    const bandY = (f: number) => yT + (h - yT) * f;
    const leadY = () => bandY(0.46);
    const edgeIn = (size: number) => w - size * 0.42; // peeking: ~42 % of the width shows
    const edgeHidden = (size: number) => w + size * 0.6;
    const outX = (size: number) => w - size * 0.5 - (phone ? 18 : 56);

    const seed = () => {
      const n = phone ? 7 : w < 1100 ? 10 : 14;
      const margin = phone ? 24 : 60;
      // the gang gathers around the edge it came from: the right ~58 % of
      // wide screens (the headline lives on the left), the whole width on phones
      const left = phone ? margin : Math.max(margin, w * 0.46);
      // jittered columns, shuffled, so the sky fills evenly but not in a row
      const cols = Array.from({ length: n + 1 }, (_, i) => i);
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
      const slot = (c: number) => ({
        x: left + ((c + rand(0.25, 0.75)) / (n + 1)) * (w - left - margin),
        y: bandY(phone ? rand(0.08, 0.42) : rand(0.15, 0.85)),
      });
      const ls = slot(cols[0]);
      leadSlot = ls;
      friends = cols.slice(1).map((c, i) => {
        const s = slot(c);
        return {
          pose: pick(POSES), flip: Math.random() < 0.4,
          sx: s.x, sy: s.y, size: lead * (phone ? rand(0.42, 0.72) : rand(0.45, 0.82)),
          delayIn: i * (phone ? 0.42 : 0.3) + rand(0, 0.15), delayOut: rand(0, 2.2),
          fromY: leadY() + rand(-50, 50),
          bobPh: rand(0, Math.PI * 2), bobA: rand(4, 9), bobF: rand(0.3, 0.55),
          act: 'none', actT: 0, actPose: 'laugh', ox: 0, oy: 0,
        };
      });
      leadBob = rand(0, Math.PI * 2);
    };

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const ticker = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cs-ticker-h')) || 0;
      yT = ticker + NAV_H + 6;
      phone = w < 700;
      h = phone ? yT + 160 : Math.max(yT + 220, Math.round(vh * 0.42));
      lead = phone ? 84 : Math.min(170, Math.max(120, vh * 0.2));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (pose: Pose, x: number, y: number, size: number, rot: number, alpha: number, flip: boolean) => {
      const im = img[pose];
      if (!im || alpha <= 0) return;
      const dw = size * (im.width / im.height);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(im, -dw / 2, -size / 2, dw, size);
      ctx.restore();
    };

    /** "boo!" bubble, anchored at the ghost's top-left; k = pop scale 0..1 */
    const bubble = (x: number, y: number, size: number, k: number) => {
      if (k <= 0) return;
      const bw = size * 0.66;
      const bh = size * 0.36;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(k, k);
      ctx.beginPath();
      const r = bh * 0.45;
      ctx.moveTo(-bw / 2 + r, -bh / 2);
      ctx.lineTo(bw / 2 - r, -bh / 2);
      ctx.quadraticCurveTo(bw / 2, -bh / 2, bw / 2, -bh / 2 + r);
      ctx.lineTo(bw / 2, bh / 2 - r);
      ctx.quadraticCurveTo(bw / 2, bh / 2, bw / 2 - r, bh / 2);
      // tail toward the ghost (down-right)
      ctx.lineTo(bw * 0.3, bh / 2);
      ctx.lineTo(bw * 0.42, bh * 0.95);
      ctx.lineTo(bw * 0.12, bh / 2);
      ctx.lineTo(-bw / 2 + r, bh / 2);
      ctx.quadraticCurveTo(-bw / 2, bh / 2, -bw / 2, bh / 2 - r);
      ctx.lineTo(-bw / 2, -bh / 2 + r);
      ctx.quadraticCurveTo(-bw / 2, -bh / 2, -bw / 2 + r, -bh / 2);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = Math.max(2, size * 0.028);
      ctx.strokeStyle = NAVY;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.fillStyle = NAVY;
      ctx.font = `800 ${Math.round(bh * 0.58)}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('boo!', 0, bh * 0.02);
      ctx.restore();
    };

    /** push a settled ghost away from the mouse and make it gasp (desktop) */
    const shy = (f: { ox: number; oy: number }, x: number, y: number, size: number, dt: number): boolean => {
      let tx = 0;
      let ty = 0;
      let near = false;
      if (pointer.on) {
        const R = size * 1.1;
        const dx = x + f.ox - pointer.x;
        const dy = y + f.oy - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < R && d > 0.001) {
          const push = (R - d) * 0.9;
          tx = (dx / d) * push;
          ty = (dy / d) * push;
          near = d < R * 0.7;
        }
      }
      const e = Math.min(1, dt * 5);
      f.ox += (tx - f.ox) * e;
      f.oy += (ty - f.oy) * e;
      return near;
    };
    const leadShy = { ox: 0, oy: 0 };

    const step = () => {
      if (!running || !alive) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      t += dt;
      if (t >= T_LOOP) { t -= T_LOOP; seed(); }
      ctx.clearRect(0, 0, w, h);

      const ly = leadY();
      const bobL = Math.sin(t * 0.9 * Math.PI * 2 + leadBob) * 4;

      // ---- the friends -------------------------------------------------
      if (t >= T_FRIENDS) {
        for (const f of friends) {
          let x: number;
          let y: number;
          const alpha = 1;
          let rot = 0;
          let pose = f.pose;
          const bob = Math.sin(t * f.bobF * Math.PI * 2 + f.bobPh) * f.bobA;
          const tIn = T_FRIENDS + f.delayIn;
          const tOut = T_LEAVE + f.delayOut;
          if (t < tIn) continue;
          if (t < tIn + 1.5) {
            // fly in from behind the right edge along a little arc
            const p = easeOutCubic(prog(t, tIn, 1.5));
            const x0 = edgeHidden(f.size);
            const y0 = f.fromY;
            x = lerp(x0, f.sx, p);
            y = lerp(y0, f.sy, p) - Math.sin(p * Math.PI) * 55 + bob * p;
            rot = (1 - p) * -0.35 * (f.flip ? -1 : 1);
            pose = p < 0.7 ? 'wow' : f.pose;
          } else if (t < tOut) {
            // settled: bob, party tricks, shy of the pointer
            x = f.sx;
            y = f.sy + bob;
            if (t >= T_PARTY) {
              if (f.act === 'none' && Math.random() < dt * 0.22) {
                f.act = Math.random() < 0.65 ? 'hop' : 'spin';
                f.actT = 0;
                f.actPose = pick(POSES.filter((p) => p !== f.pose));
              }
              if (f.act !== 'none') {
                f.actT += dt;
                const d = f.act === 'hop' ? 0.7 : 0.85;
                const p = clamp01(f.actT / d);
                if (f.act === 'hop') { y -= Math.sin(p * Math.PI) * f.size * 0.45; pose = f.actPose; }
                else { rot = easeInOut(p) * Math.PI * 2; pose = p > 0.5 ? f.actPose : f.pose; }
                if (p >= 1) { f.act = 'none'; f.pose = f.actPose; }
              }
            }
            if (shy(f, x, y, f.size, dt)) pose = 'wow';
            x += f.ox;
            y += f.oy;
          } else if (t < tOut + 1.3) {
            // drift back behind the right edge
            const p = easeInCubic(prog(t, tOut, 1.3));
            x = lerp(f.sx + f.ox, edgeHidden(f.size), p);
            y = lerp(f.sy + f.oy, f.fromY, p) - Math.sin(p * Math.PI) * 40 + bob * (1 - p);
            rot = p * 0.3 * (f.flip ? -1 : 1);
            pose = 'wave';
            f.ox = 0; f.oy = 0; f.act = 'none';
          } else continue;
          draw(pose, x, y, f.size, rot, alpha, f.flip);
        }
      }

      // ---- the lead ----------------------------------------------------
      {
        const size = lead;
        let x = edgeHidden(size);
        let y = ly;
        let rot = 0;
        let pose: Pose = 'peek';
        let bk = 0; // bubble pop
        if (t < T_PEEK) {
          // hidden
        } else if (t < T_OUT) {
          const p = t - T_PEEK; // 0..6: two peeks
          const lean = -0.17; // leaning out from behind the edge
          if (p < 0.6) { x = lerp(edgeHidden(size), edgeIn(size), easeOutBack(p / 0.6)); rot = lean * easeOutCubic(p / 0.6); }
          else if (p < 2.2) { x = edgeIn(size); rot = lean + Math.sin((p - 0.6) * 4) * 0.06; y = ly + bobL; }
          else if (p < 2.7) { x = lerp(edgeIn(size), edgeHidden(size), easeInCubic((p - 2.2) / 0.5)); rot = lean * (1 - (p - 2.2) / 0.5); }
          else if (p < 3.4) { x = edgeHidden(size); }
          else if (p < 4.0) { x = lerp(edgeHidden(size), w - size * 0.55, easeOutBack((p - 3.4) / 0.6)); y = ly + 26; rot = lean * easeOutCubic((p - 3.4) / 0.6); }
          else { x = w - size * 0.55; y = ly + 26 + bobL; rot = lean + Math.sin((p - 4) * 3.2) * 0.05; if (p > 5.4) pose = 'wow'; }
        } else if (t < T_CALL) {
          const p = prog(t, T_OUT, 0.9);
          x = lerp(w - size * 0.55, outX(size), easeOutBack(p));
          y = ly + 26 * (1 - p) - Math.sin(p * Math.PI) * 34 + bobL * p;
          rot = -0.17 * (1 - easeOutCubic(p));
          pose = t < T_OUT + 1.2 ? 'wow' : 'wave';
        } else if (t < T_FRIENDS) {
          x = outX(size);
          y = ly + bobL;
          rot = Math.sin((t - T_CALL) * Math.PI * 2 * 2.3) * 0.12; // waving
          pose = 'wave';
          const tb = T_CALL + 0.25;
          const te = T_FRIENDS - 0.3;
          bk = t < tb ? 0 : t < tb + 0.35 ? easeOutBack((t - tb) / 0.35) : t < te ? 1 : 1 - prog(t, te, 0.25);
        } else if (t < T_LEAVE + 3.4) {
          // slides to its own spot and parties with everyone
          const p = easeOutCubic(prog(t, T_FRIENDS, 1.2));
          x = lerp(outX(size), leadSlot.x, p);
          y = lerp(ly, leadSlot.y, p) + bobL;
          pose = p < 1 ? 'laugh' : t < T_PARTY ? 'laugh' : Math.floor((t - T_PARTY) / 1.7) % 3 === 1 ? 'wave' : 'laugh';
          rot = pose === 'wave' ? Math.sin(t * Math.PI * 2 * 2.3) * 0.1 : Math.sin(t * 1.3) * 0.05;
          if (p >= 1 && shy(leadShy, x, y, size, dt)) pose = 'wow';
          x += leadShy.ox;
          y += leadShy.oy;
        } else if (t < T_REST) {
          // waves goodbye from near the edge, then slips behind it
          const p = easeOutCubic(prog(t, T_LEAVE + 3.4, 0.9));
          x = lerp(leadSlot.x + leadShy.ox, outX(size), p);
          y = lerp(leadSlot.y + leadShy.oy, ly, p) + bobL;
          rot = Math.sin(t * Math.PI * 2 * 2.3) * 0.12;
          pose = 'wave';
          if (p >= 1) { leadShy.ox = 0; leadShy.oy = 0; }
        } else if (t < T_REST + 0.6) {
          const p = easeInCubic(prog(t, T_REST, 0.6));
          x = lerp(outX(size), edgeHidden(size), p);
          y = ly + bobL;
          rot = -0.17 * p;
          pose = 'peek';
        }
        draw(pose, x, y, size, rot, 1, false);
        if (bk > 0) bubble(x - size * 0.5, y - size * 0.56, size, bk);
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

    // load the four poses, then start (onload rather than decode(): decode()
    // never settles while the tab is hidden)
    Promise.all(
      POSES.map(
        (p) =>
          new Promise<void>((res, rej) => {
            const im = new Image();
            im.onload = () => { img[p] = im; res(); };
            im.onerror = () => rej(new Error(p));
            im.src = SRC[p];
          }),
      ),
    )
      .then(() => {
        if (!alive) return;
        resize();
        onScroll();
        // `?ghost=<seconds>` jumps the loop for checking a phase
        const jump = parseFloat(new URLSearchParams(window.location.search).get('ghost') || '');
        if (Number.isFinite(jump)) t = Math.max(0, Math.min(T_LOOP - 0.01, jump));
        lastNow = performance.now();
        raf = requestAnimationFrame(step);
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        document.addEventListener('visibilitychange', onVis);
      })
      .catch(() => { /* no art, no ghosts */ });

    return () => {
      alive = false;
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
