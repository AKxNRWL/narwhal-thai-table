'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * Halloween — the ghost gang. A shy little ghost in a candy-corn hat peeks
 * out from the right edge of the page, works up the courage to come out,
 * calls its friends ("boo!") and ten costumed ghosts pour in, each with its
 * own way of moving: a vampire that swoops, a black cat that pounces and
 * darts, a pirate rolling in on the swell, a sly one in a witch hat that
 * zig-zags and cackles, the restaurant's own narwhal hiding under a sheet
 * (tusk and tail poking out) that swims rather than floats, a stiff mummy
 * that shuffles, a little devil that spins, a daredevil that zooms in on a
 * broomstick, loops the loop, ditches the broom and flies solo, one hugging
 * a jack-o'-lantern that hops to show it off, and last the big FIERCE boss
 * that lumbers in and roars — everyone gasps and jumps back. They party
 * ("Happy Halloween!"), the boss roars once more, then they all drift off
 * behind the edge and it starts again. Owner, 27 Oct 2026: "แอบมองอยู่ตรงกรอบ
 * แล้วมีจังหวะออกมา และก็เรียกเพื่อนมา ทีนี้มากันเต็มเลย", "แต่ละตัวมีบุคลิกภาพ
 * ของตัวเอง", "มี 1 ตัวเป็นปลานาวาลของร้าน แต่เนียน ใส่ชุดคลุมผี … สัก 10 ตัว
 * แต่ละตัวไม่เหมือนกัน มีชุดตีมฮาโลวีนหมดเลย".
 *
 * Art: one original ghost cast generated as sticker sheets (gpt_image_2_5,
 * transparent background) and cut into public/images/halloween/ghost-*.webp
 * (560 px tall, 25–48 KB each). All the motion — peeking, waving, bubbles,
 * flights, the broom toss, the roar — is this canvas script.
 *
 * Same conventions as components/fx/Airshow.tsx: fixed canvas in the strip
 * under the nav (42 % of the viewport; a 160 px lane on phones — the gang
 * keeps to the right half on wide screens so the headline stays readable),
 * pauses when the tab is hidden, half-ghosts itself once the reader has
 * scrolled into content, motion always on (owner's rule). Mounted by
 * components/fx/AirshowLayer.tsx while lib/events.ts has an event with
 * `fx: 'halloween'` in its window. `?ghost=<seconds>` jumps the loop.
 */
type Props = { className?: string };

type Sprite =
  | 'lead-peek' | 'lead-wave' | 'lead-laugh' | 'lead-wow'
  | 'fierce' | 'witch' | 'pumpkin' | 'rider' | 'flyer' | 'broom'
  | 'narwhal' | 'vampire' | 'mummy' | 'pirate' | 'cat' | 'devil';
const SPRITES: Sprite[] = ['lead-peek', 'lead-wave', 'lead-laugh', 'lead-wow', 'fierce', 'witch', 'pumpkin', 'rider', 'flyer', 'broom', 'narwhal', 'vampire', 'mummy', 'pirate', 'cat', 'devil'];
const NAV_H = 72; // components/Nav.tsx h-[72px]
const NAVY = '#0D2B3E';

// the loop, in seconds
const T_PEEK = 1; // lead's first peek from the edge
const T_OUT = 7; // lead comes all the way out
const T_CALL = 9; // lead waves and calls ("boo!")
const T_RIDER_LOOP = 16.4; // the daredevil's loop-the-loop
const T_TOSS = 17.6; // ditches the broom, flies solo
const ROARS = [21.8, 26.2]; // the boss roars, everyone gasps
const T_PARTY = 22;
const T_HH = 23.5; // "Happy Halloween!" bubble
const T_LEAD_BYE = 33.5; // lead waves goodbye at the edge
const T_REST = 35.5; // lead slips behind the edge
const T_LOOP = 38;

type Kind = 'vampire' | 'cat' | 'pirate' | 'witch' | 'narwhal' | 'mummy' | 'devil' | 'rider' | 'pumpkin' | 'fierce';
type Style = 'arc' | 'swoop' | 'pounce' | 'roll' | 'zigzag' | 'swim' | 'shuffle' | 'slow';
type Trick = 'none' | 'swoop' | 'dash' | 'hop' | 'cackle' | 'nod' | 'wobble' | 'spin' | 'lift';
type Trait = { tIn: number; tOut: number; inDur: number; outDur: number; style: Style; size: number; bobA: number; bobF: number; trick: Trick; every: [number, number]; trickDur: number; phone: boolean };
/** who comes when, how they move, what they do once they're here (size = × lead) */
const TRAITS: Record<Kind, Trait> = {
  vampire: { tIn: 12.5, tOut: 29.2, inDur: 1.3, outDur: 1.1, style: 'swoop', size: 0.84, bobA: 5, bobF: 0.3, trick: 'swoop', every: [3.5, 6], trickDur: 0.9, phone: true },
  cat: { tIn: 12.9, tOut: 29.0, inDur: 0.9, outDur: 0.8, style: 'pounce', size: 0.7, bobA: 4, bobF: 0.9, trick: 'dash', every: [2.5, 4.5], trickDur: 0.7, phone: true },
  pirate: { tIn: 13.4, tOut: 29.6, inDur: 1.8, outDur: 1.4, style: 'roll', size: 0.8, bobA: 7, bobF: 0.35, trick: 'hop', every: [3, 5.5], trickDur: 0.7, phone: false },
  witch: { tIn: 13.8, tOut: 30.0, inDur: 2.0, outDur: 1.6, style: 'zigzag', size: 0.82, bobA: 6, bobF: 0.4, trick: 'cackle', every: [3, 5.5], trickDur: 1.1, phone: true },
  narwhal: { tIn: 14.2, tOut: 30.2, inDur: 2.4, outDur: 1.8, style: 'swim', size: 0.78, bobA: 4, bobF: 0.5, trick: 'nod', every: [3.5, 6], trickDur: 0.8, phone: true },
  mummy: { tIn: 14.6, tOut: 30.4, inDur: 2.8, outDur: 2.2, style: 'shuffle', size: 0.8, bobA: 1.5, bobF: 0.6, trick: 'wobble', every: [4, 7], trickDur: 0.9, phone: false },
  devil: { tIn: 15.2, tOut: 29.9, inDur: 1.2, outDur: 1.0, style: 'arc', size: 0.72, bobA: 6, bobF: 0.6, trick: 'spin', every: [2.5, 4.5], trickDur: 0.85, phone: false },
  rider: { tIn: 15.0, tOut: 31.0, inDur: 1.4, outDur: 1.1, style: 'arc', size: 0.88, bobA: 5, bobF: 0.4, trick: 'none', every: [9, 9], trickDur: 0, phone: true },
  pumpkin: { tIn: 15.5, tOut: 30.5, inDur: 2.6, outDur: 2.0, style: 'slow', size: 0.86, bobA: 5, bobF: 0.25, trick: 'lift', every: [3.5, 6], trickDur: 0.9, phone: true },
  fierce: { tIn: 19.5, tOut: 32.0, inDur: 2.2, outDur: 2.0, style: 'slow', size: 1.15, bobA: 3, bobF: 0.25, trick: 'none', every: [9, 9], trickDur: 0, phone: true },
};
const CAST = Object.keys(TRAITS) as Kind[];

type Actor = {
  kind: Kind; sprite: Sprite; tr: Trait; flip: boolean;
  sx: number; sy: number; size: number; fromY: number;
  bobPh: number;
  act: Trick; actT: number; actIn: number; actDir: 1 | -1;
  ox: number; oy: number; // easing offset away from the pointer
  gx: number; gy: number; // scatter direction when the boss roars
};
type Broom = { on: boolean; x: number; y: number; vx: number; vy: number; rot: number; vr: number; alpha: number; size: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
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
      const cast = CAST.filter((k) => !phone || TRAITS[k].phone);
      const margin = phone ? 24 : 60;
      // the gang gathers around the edge it came from: the right half of
      // wide screens (the headline lives on the left), the whole width on phones
      const left = phone ? margin : Math.max(margin, w * 0.5);
      const nSlots = cast.length + 1; // + lead
      const cols = Array.from({ length: nSlots }, (_, i) => i);
      for (let i = cols.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cols[i], cols[j]] = [cols[j], cols[i]]; }
      const slot = (c: number) => ({
        x: left + ((c + rand(0.25, 0.75)) / nSlots) * (w - left - margin),
        y: bandY(phone ? rand(0.08, 0.42) : rand(0.3, 0.85)),
      });
      leadSlot = slot(cols[0]);
      // the boss parks in the middle of the gang — keep the lead (drawn on top) off its face
      const bx = (left + w - margin) / 2;
      if (Math.abs(leadSlot.x - bx) < lead * 1.1) leadSlot.x = bx + (leadSlot.x < bx ? -1 : 1) * lead * 1.2;
      actors = cast.map((kind, i) => {
        const tr = TRAITS[kind];
        const s = kind === 'fierce' ? { x: bx, y: bandY(phone ? 0.3 : 0.5) } : slot(cols[1 + i]);
        return {
          kind, sprite: kind, tr, flip: kind === 'rider',
          sx: s.x, sy: s.y, size: lead * tr.size * (phone ? 0.9 : 1),
          fromY: leadY() + rand(-50, 50),
          bobPh: rand(0, Math.PI * 2),
          act: 'none', actT: 0, actIn: rand(tr.every[0], tr.every[1]), actDir: Math.random() < 0.5 ? -1 : 1,
          ox: 0, oy: 0, gx: 0, gy: 0,
        };
      });
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
        const tr = f.tr;
        if (t < tr.tIn) continue;
        let x = 0;
        let y = 0;
        let rot = 0;
        let scale = 1;
        let sprite = f.sprite;
        let flip = f.flip;
        const bob = Math.sin(t * tr.bobF * Math.PI * 2 + f.bobPh) * tr.bobA;

        /** travel between the edge and the slot in this ghost's own style; dir 1 = arriving, -1 = leaving */
        const travel = (p: number, dir: 1 | -1) => {
          // q: 0 at the edge, 1 at the slot, whichever way it's going
          const q = dir === 1 ? p : 1 - p;
          const e = dir === 1 ? easeOutCubic(q) : 1 - easeInCubic(1 - q);
          const x0 = edgeHidden(f.size);
          const y0 = f.fromY;
          switch (tr.style) {
            case 'swoop': {
              // dives under the slot and comes up into it
              x = lerp(x0, f.sx, e);
              y = lerp(y0, f.sy, e) + Math.sin(q * Math.PI) * 70;
              rot = Math.sin(q * Math.PI) * -0.35;
              break;
            }
            case 'pounce': {
              const eb = dir === 1 ? easeOutBack(q) : easeInCubic(q);
              x = lerp(x0, f.sx, eb);
              y = lerp(y0, f.sy, eb) - Math.sin(q * Math.PI) * 45;
              rot = (1 - q) * -0.3;
              break;
            }
            case 'roll': {
              // rolling in on the swell
              x = lerp(x0, f.sx, e);
              y = lerp(y0, f.sy, e) + Math.sin(q * Math.PI * 2.5) * 22;
              rot = Math.cos(q * Math.PI * 2.5) * 0.16;
              break;
            }
            case 'zigzag': {
              x = lerp(x0, f.sx, e);
              y = lerp(y0, f.sy, e) + Math.sin(q * Math.PI * 3) * 42 * (1 - q * 0.6);
              rot = Math.cos(q * Math.PI * 3) * 0.28 * (1 - q * 0.5);
              break;
            }
            case 'swim': {
              // a fish, not a ghost: wriggles along a gentle wave, tail wagging
              const el = easeInOut(q);
              x = lerp(x0, f.sx, el);
              y = lerp(y0 + 20, f.sy, el) + Math.sin(q * Math.PI * 4) * 14;
              rot = Math.sin(t * 7) * 0.06 + Math.cos(q * Math.PI * 4) * 0.08;
              break;
            }
            case 'shuffle': {
              // stiff little steps, no bob
              const el = easeInOut(q);
              x = lerp(x0, f.sx, el) + Math.sin(t * 9) * 2;
              y = lerp(y0, f.sy, el) + Math.abs(Math.sin(t * 9)) * 4;
              rot = Math.sin(t * 9) * 0.03;
              break;
            }
            case 'slow': {
              const el = easeInOut(q);
              x = lerp(x0, f.sx, el);
              y = lerp(y0 + 30, f.sy, el) + Math.sin(t * 2.5) * 4;
              rot = (1 - q) * -0.1;
              break;
            }
            default: {
              // the plain arc
              x = lerp(x0, f.sx, e);
              y = lerp(y0, f.sy, e) - Math.sin(q * Math.PI) * 55 + bob * q;
              rot = (1 - q) * -0.35 * (f.flip ? -1 : 1);
            }
          }
          if (dir === -1) rot = -rot;
        };

        const settled = () => {
          x = f.sx;
          y = f.sy + bob;
          // this ghost's own party trick, every so often
          if (tr.trick !== 'none') {
            f.actIn -= dt;
            if (f.act === 'none' && f.actIn <= 0 && t >= T_PARTY - 2) { f.act = tr.trick; f.actT = 0; f.actDir = Math.random() < 0.5 ? -1 : 1; }
          }
          if (f.act !== 'none') {
            f.actT += dt;
            const p = clamp01(f.actT / tr.trickDur);
            switch (f.act) {
              case 'swoop': y += Math.sin(p * Math.PI) * 50; rot = Math.sin(p * Math.PI) * -0.3; break;
              case 'dash': x += Math.sin(p * Math.PI) * 45 * f.actDir; y -= Math.sin(p * Math.PI * 2) * 10; flip = f.actDir < 0; rot = Math.sin(p * Math.PI) * 0.2 * f.actDir; break;
              case 'hop': y -= Math.sin(p * Math.PI) * f.size * 0.45; break;
              case 'cackle': rot = Math.sin(p * Math.PI * 7) * 0.16; y -= Math.abs(Math.sin(p * Math.PI * 3.5)) * 8; break;
              case 'nod': rot = Math.sin(p * Math.PI) * -0.22; y += Math.sin(p * Math.PI) * 6; break; // tips its tusk
              case 'wobble': rot = Math.sin(p * Math.PI * 6) * 0.15 * (1 - p * 0.5); break;
              case 'spin': rot = easeInOut(p) * Math.PI * 2 * f.actDir; break;
              case 'lift': y -= Math.sin(p * Math.PI) * f.size * 0.32; rot = Math.sin(p * Math.PI) * -0.12; break;
            }
            if (p >= 1) { f.act = 'none'; f.actIn = rand(tr.every[0], tr.every[1]); }
          }
          if (f.kind === 'narwhal') rot += Math.sin(t * 2.2) * 0.04; // never quite still
          if (f.kind === 'pirate') rot += Math.sin(t * 2.2) * 0.09; // still at sea
          if (f.kind === 'vampire') rot += Math.sin(t * 0.8) * 0.08; // dramatic
          if (f.kind === 'rider') {
            // hovers in a lazy figure-8 on its own
            x += Math.sin(t * 1.1) * 18;
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
            // the boss roared: jump back
            if (f.gx === 0 && f.gy === 0) {
              const dx = f.sx - bossX;
              const dy = f.sy - bossY;
              const d = Math.hypot(dx, dy) || 1;
              f.gx = (dx / d) * (phone ? 26 : 55);
              f.gy = (dy / d) * (phone ? 14 : 30) - 14;
            }
            x += f.gx * g;
            y += f.gy * g;
            rot += Math.sin(g * Math.PI * 4) * 0.08;
          } else { f.gx = 0; f.gy = 0; }
          if (f.kind !== 'rider' && f.kind !== 'fierce') {
            shy(f, x, y, f.size, dt);
            x += f.ox;
            y += f.oy;
          }
        };

        if (f.kind === 'rider') {
          const cx = phone ? w * 0.5 : w * 0.62; // where the loop happens
          const cy = ly - 10;
          const R = f.size * 0.5;
          if (t < T_RIDER_LOOP) {
            // zooms in on the broom, weaving
            const p = prog(t, tr.tIn, T_RIDER_LOOP - tr.tIn);
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
          } else if (t < tr.tOut) { sprite = 'flyer'; settled(); }
          else if (t < tr.tOut + tr.outDur) {
            // zooms out the way it came — no broom needed
            const p = easeInCubic(prog(t, tr.tOut, tr.outDur));
            x = lerp(f.sx, edgeHidden(f.size * 1.3), p);
            y = lerp(f.sy, f.fromY - 30, p) - Math.sin(p * Math.PI) * 30;
            rot = -0.25 * p;
            sprite = 'flyer';
            flip = false;
          } else continue;
        } else if (t < tr.tIn + tr.inDur) {
          travel(prog(t, tr.tIn, tr.inDur), 1);
        } else if (t < tr.tOut) {
          settled();
        } else if (t < tr.tOut + tr.outDur) {
          f.ox = 0; f.oy = 0; f.act = 'none';
          travel(prog(t, tr.tOut, tr.outDur), -1);
        } else continue;
        draw(sprite, x, y, f.size * scale, rot, 1, flip);
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
        let sprite: Sprite = 'lead-peek';
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
          else { x = w - size * 0.55; y = ly + 26 + bobL; rot = lean + Math.sin((p - 4) * 3.2) * 0.05; if (p > 5.4) sprite = 'lead-wow'; }
        } else if (t < T_CALL) {
          const p = prog(t, T_OUT, 0.9);
          x = lerp(w - size * 0.55, outX(size), easeOutBack(p));
          y = ly + 26 * (1 - p) - Math.sin(p * Math.PI) * 34 + bobL * p;
          rot = -0.17 * (1 - easeOutCubic(p));
          sprite = t < T_OUT + 1.2 ? 'lead-wow' : 'lead-wave';
        } else if (t < TRAITS.vampire.tIn) {
          x = outX(size);
          y = ly + bobL;
          rot = Math.sin((t - T_CALL) * Math.PI * 2 * 2.3) * 0.12; // waving
          sprite = 'lead-wave';
          bk = pop(T_CALL + 0.25, TRAITS.vampire.tIn - 0.3);
        } else if (t < T_LEAD_BYE) {
          // slides to its own spot and parties with everyone
          const p = easeOutCubic(prog(t, TRAITS.vampire.tIn, 1.2));
          x = lerp(outX(size), leadSlot.x, p);
          y = lerp(ly, leadSlot.y, p) + bobL;
          const wave = t >= T_PARTY && Math.floor((t - T_PARTY) / 1.7) % 3 === 1;
          sprite = wave ? 'lead-wave' : 'lead-laugh';
          rot = wave ? Math.sin(t * Math.PI * 2 * 2.3) * 0.1 : Math.sin(t * 1.3) * 0.05;
          if (g > 0) {
            // the boss roared
            const dx = leadSlot.x - bossX;
            const dy = leadSlot.y - bossY;
            const d = Math.hypot(dx, dy) || 1;
            x += (dx / d) * (phone ? 26 : 55) * g;
            y += ((dy / d) * (phone ? 14 : 30) - 14) * g;
            sprite = 'lead-wow';
            rot = Math.sin(g * Math.PI * 4) * 0.08;
          } else if (p >= 1 && shy(leadShy, x, y, size, dt)) sprite = 'lead-wow';
          x += leadShy.ox;
          y += leadShy.oy;
          hk = pop(T_HH, T_HH + 3.2);
        } else if (t < T_REST) {
          // waves goodbye from near the edge, then slips behind it
          const p = easeOutCubic(prog(t, T_LEAD_BYE, 0.9));
          x = lerp(leadSlot.x + leadShy.ox, outX(size), p);
          y = lerp(leadSlot.y + leadShy.oy, ly, p) + bobL;
          rot = Math.sin(t * Math.PI * 2 * 2.3) * 0.12;
          sprite = 'lead-wave';
          if (p >= 1) { leadShy.ox = 0; leadShy.oy = 0; }
        } else if (t < T_REST + 0.6) {
          const p = easeInCubic(prog(t, T_REST, 0.6));
          x = lerp(outX(size), edgeHidden(size), p);
          y = ly + bobL;
          rot = -0.17 * p;
          sprite = 'lead-peek';
        }
        draw(sprite, x, y, size, rot, 1, false);
        const by = (dy: number) => Math.max(yT + size * 0.2, y - dy); // keep bubbles out of the nav
        if (bk > 0) bubble('boo!', x - size * 0.5, by(size * 0.56), size, bk);
        if (hk > 0) bubble('Happy Halloween!', x - size * 0.2, by(size * 0.62), size, hk);
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
