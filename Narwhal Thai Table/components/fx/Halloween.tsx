'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Halloween — the ghost gang. A shy little ghost peeks out from the right
 * edge of the page, works up the courage to come out, calls its friends
 * ("boo!") and the whole gang pours in: the regulars, a sly one in a witch
 * hat that zig-zags in and cackles, one hugging a jack-o'-lantern that hops
 * to show it off, a daredevil that zooms in on a broomstick, loops the loop,
 * ditches the broom and flies solo, and last the big FIERCE one that lumbers
 * in and roars — everyone gasps and jumps back. They party ("Happy
 * Halloween!"), the boss roars once more, then they all drift off behind the
 * edge and it starts again. Owner, 27 Oct 2026: "ผีแบบนี้ … แอบมองอยู่ตรงกรอบ
 * แล้วมีจังหวะออกมา และก็เรียกเพื่อนมา ทีนี้มากันเต็มเลย … อนิเมชั่นลูป", then
 * "น่ารักไป เอาให้มีตัวที่ดูดุด้วย บางตัวใส่หมวกแม่มด บางตัวถือฟักทอง บางตัวขี่
 * ไม้กวาดแต่ทิ้งไม้กวาดและบินเอง แต่ละตัวมีบุคลิกภาพของตัวเอง".
 *
 * Art: one original ghost cast, generated as sticker sheets (gpt_image_2_5,
 * transparent background) and cut into public/images/halloween/ghost-*.webp
 * (560 px tall, 26–41 KB each): peek / wave / laugh / wow (the regulars and
 * the lead), fierce, witch, pumpkin, rider (on the broom), flyer (off it),
 * broom. All the motion — peeking, waving, bubbles, flights, the broom toss,
 * the roar — is this canvas script.
 *
 * Same conventions as components/fx/Airshow.tsx: fixed canvas in the strip
 * under the nav (42 % of the viewport; a 160 px lane on phones — the gang
 * keeps to the right ~54 % on wide screens so the headline stays readable),
 * pauses when the tab is hidden, half-ghosts itself once the reader has
 * scrolled into content, motion always on (owner's rule). Mounted by
 * components/fx/AirshowLayer.tsx while lib/events.ts has an event with
 * `fx: 'halloween'` in its window. `?ghost=<seconds>` jumps the loop.
 */
type Props = { className?: string };

type Sprite = 'peek' | 'wave' | 'laugh' | 'wow' | 'fierce' | 'witch' | 'pumpkin' | 'rider' | 'flyer' | 'broom';
const SPRITES: Sprite[] = ['peek', 'wave', 'laugh', 'wow', 'fierce', 'witch', 'pumpkin', 'rider', 'flyer', 'broom'];
const REGULAR: Sprite[] = ['peek', 'wave', 'laugh', 'wow'];
const CHEERY: Sprite[] = ['laugh', 'wave', 'laugh', 'wave', 'peek']; // what the regulars wear by default
const NAV_H = 72; // components/Nav.tsx h-[72px]
const NAVY = '#0D2B3E';

// the loop, in seconds
const T_PEEK = 1; // lead's first peek from the edge
const T_OUT = 7; // lead comes all the way out
const T_CALL = 9; // lead waves and calls ("boo!")
const T_FRIENDS = 12.5; // regulars stream in
const T_WITCH = 13.2;
const T_RIDER = 15.0; // zooms in on the broom
const T_RIDER_LOOP = 16.4; // loop-the-loop
const T_TOSS = 17.6; // ditches the broom, flies solo
const T_PUMPKIN = 15.5;
const T_FIERCE = 19.5; // the boss lumbers in
const ROARS = [21.8, 26.2]; // everyone gasps
const T_PARTY = 22;
const T_HH = 23.5; // "Happy Halloween!" bubble
const T_LEAVE = 29; // regulars drift off
const T_WITCH_OUT = 30;
const T_PUMPKIN_OUT = 30.5;
const T_RIDER_OUT = 31;
const T_FIERCE_OUT = 32;
const T_LEAD_BYE = 33.5; // lead waves goodbye at the edge
const T_REST = 35.5; // lead slips behind the edge
const T_LOOP = 38;

type Kind = 'reg' | 'witch' | 'pumpkin' | 'rider' | 'fierce';
type Actor = {
  kind: Kind; sprite: Sprite; flip: boolean;
  sx: number; sy: number; size: number;
  tIn: number; tOut: number; fromY: number;
  bobPh: number; bobA: number; bobF: number;
  act: 'none' | 'hop' | 'spin' | 'cackle' | 'lift'; actT: number; actSprite: Sprite; actIn: number;
  ox: number; oy: number; // easing offset away from the pointer
  gx: number; gy: number; // scatter direction when the boss roars
};
type Broom = { on: boolean; x: number; y: number; vx: number; vy: number; rot: number; vr: number; alpha: number; size: number };

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
    let actors: Actor[] = [];
    let leadSlot = { x: 0, y: 0 };
    let leadBob = 0;
    const broom: Broom = { on: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, alpha: 0, size: 0 };
    const pointer = { x: -9999, y: -9999, on: false };
    const img = {} as Record<Sprite, HTMLImageElement>;

    const bandY = (f: number) => yT + (h - yT) * f;
    const leadY = () => bandY(0.46);
    const edgeIn = (size: number) => w - size * 0.42; // peeking: ~42 % of the width shows
    const edgeHidden = (size: number) => w + size * 0.7;
    const outX = (size: number) => w - size * 0.5 - (phone ? 18 : 56);

    const seed = () => {
      const nReg = phone ? 3 : w < 1100 ? 6 : 8;
      const margin = phone ? 24 : 60;
      // the gang gathers around the edge it came from: the right ~54 % of
      // wide screens (the headline lives on the left), the whole width on phones
      const left = phone ? margin : Math.max(margin, w * 0.5);
      const nSlots = nReg + 5; // + lead, witch, pumpkin, rider, fierce
      const cols = Array.from({ length: nSlots }, (_, i) => i);
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
      const slot = (c: number) => ({
        x: left + ((c + rand(0.25, 0.75)) / nSlots) * (w - left - margin),
        y: bandY(phone ? rand(0.08, 0.42) : rand(0.15, 0.85)),
      });
      const base = (kind: Kind, sprite: Sprite, s: { x: number; y: number }, size: number, tIn: number, tOut: number): Actor => ({
        kind, sprite, flip: false,
        sx: s.x, sy: s.y, size, tIn, tOut,
        fromY: leadY() + rand(-50, 50),
        bobPh: rand(0, Math.PI * 2), bobA: rand(4, 9), bobF: rand(0.3, 0.55),
        act: 'none', actT: 0, actSprite: sprite, actIn: rand(1, 4),
        ox: 0, oy: 0, gx: 0, gy: 0,
      });
      leadSlot = slot(cols[0]);
      actors = [];
      for (let i = 0; i < nReg; i++) {
        const a = base('reg', pick(CHEERY), slot(cols[1 + i]), lead * (phone ? rand(0.42, 0.72) : rand(0.45, 0.82)), T_FRIENDS + i * (phone ? 0.45 : 0.3) + rand(0, 0.15), T_LEAVE + rand(0, 2.2));
        a.flip = Math.random() < 0.4;
        actors.push(a);
      }
      const wi = base('witch', 'witch', slot(cols[nReg + 1]), lead * (phone ? 0.78 : 0.82), T_WITCH, T_WITCH_OUT);
      const pu = base('pumpkin', 'pumpkin', slot(cols[nReg + 2]), lead * (phone ? 0.8 : 0.86), T_PUMPKIN, T_PUMPKIN_OUT);
      pu.bobF = 0.25; pu.bobA = 5;
      const ri = base('rider', 'rider', slot(cols[nReg + 3]), lead * (phone ? 0.82 : 0.88), T_RIDER, T_RIDER_OUT);
      ri.flip = true; // the sprite faces right; it comes in heading left
      // the boss: biggest, parks in the middle of the gang
      const fi = base('fierce', 'fierce', { x: (left + w - margin) / 2, y: bandY(phone ? 0.3 : 0.5) }, lead * 1.15, T_FIERCE, T_FIERCE_OUT);
      fi.bobA = 3; fi.bobF = 0.25;
      actors.push(wi, pu, ri, fi);
      leadBob = rand(0, Math.PI * 2);
      broom.on = false;
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

    const draw = (sprite: Sprite, x: number, y: number, size: number, rot: number, alpha: number, flip: boolean) => {
      const im = img[sprite];
      if (!im || alpha <= 0) return;
      const dw = size * (im.width / im.height);
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.translate(x, y);
      ctx.rotate(rot);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(im, -dw / 2, -size / 2, dw, size);
      ctx.restore();
    };

    /** speech bubble above-left of a ghost; k = pop scale 0..1 */
    const bubble = (text: string, x: number, y: number, size: number, k: number) => {
      if (k <= 0) return;
      ctx.font = `800 ${Math.round(size * 0.2)}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      const tw = ctx.measureText(text).width;
      const bw = tw + size * 0.3;
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
      ctx.lineTo(bw * 0.3, bh / 2); // tail toward the ghost (down-right)
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
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, bh * 0.02);
      ctx.restore();
    };
    const pop = (t0: number, t1: number) => (t < t0 ? 0 : t < t0 + 0.35 ? easeOutBack((t - t0) / 0.35) : t < t1 ? 1 : 1 - prog(t, t1, 0.25));

    /** push a settled ghost away from the mouse (desktop); true when it should gasp */
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

    /** 0..1 while the boss is roaring (0.8 s pulses) */
    const roaring = () => { for (const r of ROARS) if (t >= r && t < r + 0.8) return (t - r) / 0.8; return -1; };
    /** 0..1 gasp envelope after each roar (everyone jumps back, then settles) */
    const gasp = () => { for (const r of ROARS) if (t >= r && t < r + 1.6) return Math.sin(prog(t, r, 1.6) * Math.PI); return 0; };

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
      const g = gasp();
      const boss = actors.find((a) => a.kind === 'fierce');
      const bossX = boss ? boss.sx : w;
      const bossY = boss ? boss.sy : ly;

      // ---- the gang ----------------------------------------------------
      for (const f of actors) {
        if (t < f.tIn) continue;
        let x: number;
        let y: number;
        let rot = 0;
        let scale = 1;
        let sprite = f.sprite;
        let flip = f.flip;
        const bob = Math.sin(t * f.bobF * Math.PI * 2 + f.bobPh) * f.bobA;
        const settledIdle = () => {
          // everyone's idle: bob, party tricks, shy of the pointer, gasp at the roar
          x = f.sx;
          y = f.sy + bob;
          if (t >= T_PARTY && f.kind === 'reg') {
            if (f.act === 'none' && Math.random() < dt * 0.22) {
              f.act = Math.random() < 0.65 ? 'hop' : 'spin';
              f.actT = 0;
              f.actSprite = pick(CHEERY.filter((p) => p !== f.sprite));
            }
          }
          if (f.kind === 'witch') {
            f.actIn -= dt;
            if (f.act === 'none' && f.actIn <= 0) { f.act = 'cackle'; f.actT = 0; }
          }
          if (f.kind === 'pumpkin') {
            f.actIn -= dt;
            if (f.act === 'none' && f.actIn <= 0) { f.act = 'lift'; f.actT = 0; }
          }
          if (f.act !== 'none') {
            f.actT += dt;
            const d = f.act === 'hop' ? 0.7 : f.act === 'spin' ? 0.85 : f.act === 'cackle' ? 1.1 : 0.9;
            const p = clamp01(f.actT / d);
            if (f.act === 'hop') { y -= Math.sin(p * Math.PI) * f.size * 0.45; sprite = f.actSprite; }
            else if (f.act === 'spin') { rot = easeInOut(p) * Math.PI * 2; sprite = p > 0.5 ? f.actSprite : f.sprite; }
            else if (f.act === 'cackle') { rot = Math.sin(p * Math.PI * 7) * 0.16; y -= Math.abs(Math.sin(p * Math.PI * 3.5)) * 8; }
            else if (f.act === 'lift') { y -= Math.sin(p * Math.PI) * f.size * 0.32; rot = Math.sin(p * Math.PI) * -0.12; }
            if (p >= 1) {
              f.act = 'none';
              if (f.kind === 'reg') f.sprite = f.actSprite;
              f.actIn = f.kind === 'witch' ? rand(3, 5.5) : rand(3.5, 6);
            }
          }
          if (f.kind === 'rider') {
            // hovers in a lazy figure-8 on its own
            const dx = Math.sin(t * 1.1) * 18;
            x += dx;
            y += Math.sin(t * 2.2) * 10;
            rot = Math.sin(t * 1.1) * 0.15;
            flip = Math.cos(t * 1.1) < 0;
          }
          if (f.kind === 'fierce') {
            const r = roaring();
            if (r >= 0) {
              scale = 1 + 0.25 * Math.sin(r * Math.PI);
              x += Math.sin(r * 60) * 4;
              rot = Math.sin(r * 40) * 0.06;
            }
          } else if (g > 0 && f.kind !== 'rider') {
            // the boss roared: gasp and jump back
            if (f.gx === 0 && f.gy === 0) {
              const dx = f.sx - bossX;
              const dy = f.sy - bossY;
              const d = Math.hypot(dx, dy) || 1;
              f.gx = (dx / d) * (phone ? 26 : 55);
              f.gy = (dy / d) * (phone ? 14 : 30) - 14;
            }
            x += f.gx * g;
            y += f.gy * g;
            if (f.kind === 'reg') sprite = 'wow';
            rot += Math.sin(g * Math.PI * 4) * 0.08;
          } else { f.gx = 0; f.gy = 0; }
          if (f.kind !== 'rider' && f.kind !== 'fierce' && shy(f, x, y, f.size, dt) && f.kind === 'reg') sprite = 'wow';
          if (f.kind !== 'rider' && f.kind !== 'fierce') { x += f.ox; y += f.oy; }
        };

        if (f.kind === 'reg') {
          if (t < f.tIn + 1.5) {
            // fly in from behind the right edge along a little arc
            const p = easeOutCubic(prog(t, f.tIn, 1.5));
            x = lerp(edgeHidden(f.size), f.sx, p);
            y = lerp(f.fromY, f.sy, p) - Math.sin(p * Math.PI) * 55 + bob * p;
            rot = (1 - p) * -0.35 * (f.flip ? -1 : 1);
            sprite = p < 0.7 ? 'wow' : f.sprite;
          } else if (t < f.tOut) settledIdle();
          else if (t < f.tOut + 1.3) {
            const p = easeInCubic(prog(t, f.tOut, 1.3));
            x = lerp(f.sx + f.ox, edgeHidden(f.size), p);
            y = lerp(f.sy + f.oy, f.fromY, p) - Math.sin(p * Math.PI) * 40 + bob * (1 - p);
            rot = p * 0.3 * (f.flip ? -1 : 1);
            sprite = 'wave';
            f.ox = 0; f.oy = 0; f.act = 'none';
          } else continue;
        } else if (f.kind === 'witch') {
          if (t < f.tIn + 2) {
            // zig-zags in, cackling
            const p = prog(t, f.tIn, 2);
            const e = easeOutCubic(p);
            x = lerp(edgeHidden(f.size), f.sx, e);
            y = lerp(f.fromY, f.sy, e) + Math.sin(p * Math.PI * 3) * 42 * (1 - p * 0.6);
            rot = Math.cos(p * Math.PI * 3) * 0.28 * (1 - p * 0.5);
          } else if (t < f.tOut) settledIdle();
          else if (t < f.tOut + 1.6) {
            const p = prog(t, f.tOut, 1.6);
            const e = easeInCubic(p);
            x = lerp(f.sx + f.ox, edgeHidden(f.size), e);
            y = lerp(f.sy + f.oy, f.fromY, e) + Math.sin(p * Math.PI * 3) * 36;
            rot = Math.cos(p * Math.PI * 3) * 0.25;
            f.ox = 0; f.oy = 0; f.act = 'none';
          } else continue;
        } else if (f.kind === 'pumpkin') {
          if (t < f.tIn + 2.6) {
            // takes its time — it's carrying something
            const p = easeOutCubic(prog(t, f.tIn, 2.6));
            x = lerp(edgeHidden(f.size), f.sx, p);
            y = lerp(f.fromY + 30, f.sy, p) + Math.sin(t * 3) * 5;
            rot = (1 - p) * -0.12;
          } else if (t < f.tOut) settledIdle();
          else if (t < f.tOut + 2) {
            const p = easeInCubic(prog(t, f.tOut, 2));
            x = lerp(f.sx + f.ox, edgeHidden(f.size), p);
            y = lerp(f.sy + f.oy, f.fromY + 30, p) + Math.sin(t * 3) * 5;
            rot = p * 0.12;
            f.ox = 0; f.oy = 0; f.act = 'none';
          } else continue;
        } else if (f.kind === 'rider') {
          const cx = phone ? w * 0.5 : w * 0.62; // where the loop happens
          const cy = ly - 10;
          const R = f.size * 0.5;
          if (t < T_RIDER_LOOP) {
            // zooms in on the broom, weaving
            const p = prog(t, f.tIn, T_RIDER_LOOP - f.tIn);
            const e = easeOutCubic(p);
            x = lerp(edgeHidden(f.size * 1.3), cx, e);
            y = lerp(f.fromY - 20, cy, e) + Math.sin(p * Math.PI * 2) * 26;
            rot = -0.12 + Math.cos(p * Math.PI * 2) * 0.12;
            sprite = 'rider';
            flip = true;
          } else if (t < T_TOSS) {
            // loop-the-loop (clockwise on screen), nose following the circle
            const p = prog(t, T_RIDER_LOOP, T_TOSS - T_RIDER_LOOP);
            const th = easeInOut(p) * Math.PI * 2;
            x = cx - R * Math.sin(th);
            y = cy - R * (1 - Math.cos(th));
            rot = Math.atan2(-Math.sin(th), -Math.cos(th)) - Math.PI;
            sprite = 'rider';
            flip = true;
          } else if (t < T_TOSS + 1.4) {
            // ditches the broom and barrel-rolls to its spot
            if (!broom.on) {
              broom.on = true; broom.x = cx; broom.y = cy + f.size * 0.1; broom.vx = -70; broom.vy = -160;
              broom.rot = 0.3; broom.vr = 7; broom.alpha = 1; broom.size = f.size * 0.9;
            }
            const p = prog(t, T_TOSS, 1.4);
            const e = easeOutCubic(p);
            x = lerp(cx, f.sx, e);
            y = lerp(cy, f.sy, e) - Math.sin(p * Math.PI) * 50;
            rot = easeInOut(p) * Math.PI * 2;
            sprite = 'flyer';
            flip = f.sx > cx;
          } else if (t < f.tOut) { sprite = 'flyer'; settledIdle(); }
          else if (t < f.tOut + 1.1) {
            // zooms out the way it came — no broom needed
            const p = easeInCubic(prog(t, f.tOut, 1.1));
            x = lerp(f.sx, edgeHidden(f.size * 1.3), p);
            y = lerp(f.sy, f.fromY - 30, p) - Math.sin(p * Math.PI) * 30;
            rot = -0.25 * p;
            sprite = 'flyer';
            flip = false;
          } else continue;
        } else {
          // the boss
          if (t < f.tIn + 2.2) {
            const p = easeInOut(prog(t, f.tIn, 2.2));
            x = lerp(edgeHidden(f.size), f.sx, p);
            y = lerp(f.fromY, f.sy, p) + Math.sin(t * 2.5) * 3;
            rot = Math.sin(t * 2.5) * 0.04;
          } else if (t < f.tOut) settledIdle();
          else if (t < f.tOut + 2) {
            const p = easeInOut(prog(t, f.tOut, 2));
            x = lerp(f.sx, edgeHidden(f.size), p);
            y = lerp(f.sy, f.fromY, p) + Math.sin(t * 2.5) * 3;
            rot = Math.sin(t * 2.5) * 0.04;
          } else continue;
        }
        draw(sprite, x!, y!, f.size * scale, rot, 1, flip);
      }

      // the ditched broom tumbles away
      if (broom.on) {
        broom.vy += 900 * dt;
        broom.x += broom.vx * dt;
        broom.y += broom.vy * dt;
        broom.rot += broom.vr * dt;
        broom.alpha -= dt / 1.4;
        if (broom.alpha <= 0 || broom.y > h + broom.size) broom.on = false;
        else draw('broom', broom.x, broom.y, broom.size, broom.rot, broom.alpha, false);
      }

      // ---- the lead ----------------------------------------------------
      {
        const size = lead;
        let x = edgeHidden(size);
        let y = ly;
        let rot = 0;
        let sprite: Sprite = 'peek';
        let bk = 0; // "boo!" bubble
        let hk = 0; // "Happy Halloween!" bubble
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
          else { x = w - size * 0.55; y = ly + 26 + bobL; rot = lean + Math.sin((p - 4) * 3.2) * 0.05; if (p > 5.4) sprite = 'wow'; }
        } else if (t < T_CALL) {
          const p = prog(t, T_OUT, 0.9);
          x = lerp(w - size * 0.55, outX(size), easeOutBack(p));
          y = ly + 26 * (1 - p) - Math.sin(p * Math.PI) * 34 + bobL * p;
          rot = -0.17 * (1 - easeOutCubic(p));
          sprite = t < T_OUT + 1.2 ? 'wow' : 'wave';
        } else if (t < T_FRIENDS) {
          x = outX(size);
          y = ly + bobL;
          rot = Math.sin((t - T_CALL) * Math.PI * 2 * 2.3) * 0.12; // waving
          sprite = 'wave';
          bk = pop(T_CALL + 0.25, T_FRIENDS - 0.3);
        } else if (t < T_LEAD_BYE) {
          // slides to its own spot and parties with everyone
          const p = easeOutCubic(prog(t, T_FRIENDS, 1.2));
          x = lerp(outX(size), leadSlot.x, p);
          y = lerp(ly, leadSlot.y, p) + bobL;
          const wave = t >= T_PARTY && Math.floor((t - T_PARTY) / 1.7) % 3 === 1;
          sprite = wave ? 'wave' : 'laugh';
          rot = wave ? Math.sin(t * Math.PI * 2 * 2.3) * 0.1 : Math.sin(t * 1.3) * 0.05;
          if (g > 0) {
            // the boss roared
            const dx = leadSlot.x - bossX;
            const dy = leadSlot.y - bossY;
            const d = Math.hypot(dx, dy) || 1;
            x += (dx / d) * (phone ? 26 : 55) * g;
            y += ((dy / d) * (phone ? 14 : 30) - 14) * g;
            sprite = 'wow';
            rot = Math.sin(g * Math.PI * 4) * 0.08;
          } else if (p >= 1 && shy(leadShy, x, y, size, dt)) sprite = 'wow';
          x += leadShy.ox;
          y += leadShy.oy;
          hk = pop(T_HH, T_HH + 3.2);
        } else if (t < T_REST) {
          // waves goodbye from near the edge, then slips behind it
          const p = easeOutCubic(prog(t, T_LEAD_BYE, 0.9));
          x = lerp(leadSlot.x + leadShy.ox, outX(size), p);
          y = lerp(leadSlot.y + leadShy.oy, ly, p) + bobL;
          rot = Math.sin(t * Math.PI * 2 * 2.3) * 0.12;
          sprite = 'wave';
          if (p >= 1) { leadShy.ox = 0; leadShy.oy = 0; }
        } else if (t < T_REST + 0.6) {
          const p = easeInCubic(prog(t, T_REST, 0.6));
          x = lerp(outX(size), edgeHidden(size), p);
          y = ly + bobL;
          rot = -0.17 * p;
          sprite = 'peek';
        }
        draw(sprite, x, y, size, rot, 1, false);
        if (bk > 0) bubble('boo!', x - size * 0.5, y - size * 0.56, size, bk);
        if (hk > 0) bubble('Happy Halloween!', x - size * 0.2, y - size * 0.62, size, hk);
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

    // load the cast, then start (onload rather than decode(): decode() never
    // settles while the tab is hidden)
    Promise.all(
      SPRITES.map(
        (p) =>
          new Promise<void>((res, rej) => {
            const im = new Image();
            im.onload = () => { img[p] = im; res(); };
            im.onerror = () => rej(new Error(p));
            im.src = `/images/halloween/ghost-${p}.webp`;
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
