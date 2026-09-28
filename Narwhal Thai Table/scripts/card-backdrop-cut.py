"""
Backdrops for the party-size (cast) cards -> public/images/cards/backdrops/

The composed card (lib/guestCardCast.ts) draws one backdrop, then the
characters, then the name block. A backdrop is generated 3:2 with an EMPTY
middle band (props at the edges/top/bottom only), so it is cut from the top:

  letter/<id>.jpg   2125 x 1375 (ratio 1.545 = the Letter face), name scrim
                    baked in with the SAME curve as card-art-letter.py, so a
                    composed card and a scene card read alike at the bottom.
  small/<id>.jpg    1590 x 1200 (ratio 1.3247 = the small tent's panel), NO
                    scrim (the tent2 renderer draws one) — width cropped
                    from the centre, which only trims the outermost props.

usage:
  python scripts/card-backdrop-cut.py <gen_dir> [out_dir]
    gen_dir  folder with bd-2xx.png (see IDS)
"""
import os
import sys

import numpy as np
from PIL import Image

LETTER_RATIO = 612 / 396
LETTER_W = 2125
SMALL_W, SMALL_H = 1590, 1200
FADE_FROM, FADE_KNEE, KNEE_ALPHA, BOTTOM_ALPHA = 0.46, 0.63, 0.62, 0.95  # = card-art-letter.py

# gen number -> backdrop id (occasion-variant)
IDS = {
    201: 'general-1', 202: 'general-2',
    211: 'birthday-1', 212: 'birthday-2',
    221: 'anniversary-1', 222: 'anniversary-2',
    231: 'celebration-1', 232: 'celebration-2',
    241: 'family-1', 242: 'family-2',
    251: 'friends-1', 252: 'friends-2',
    261: 'business-1', 262: 'business-2',
}


def scrim_alpha(h: int) -> np.ndarray:
    y = (np.arange(h, dtype=np.float64) + 0.5) / h
    a = np.zeros(h)
    ramp = (y > FADE_FROM) & (y <= FADE_KNEE)
    t = (y[ramp] - FADE_FROM) / (FADE_KNEE - FADE_FROM)
    a[ramp] = KNEE_ALPHA * t * t * (3 - 2 * t)
    low = y > FADE_KNEE
    a[low] = KNEE_ALPHA + (BOTTOM_ALPHA - KNEE_ALPHA) * (y[low] - FADE_KNEE) / (1 - FADE_KNEE)
    return a


def letter_cut(im: Image.Image) -> Image.Image:
    w, h = im.size
    wh = round(w / LETTER_RATIO)
    crop = im.crop((0, 0, w, min(h, wh))).resize((LETTER_W, round(LETTER_W / LETTER_RATIO)), Image.LANCZOS)
    a = np.asarray(crop).astype(np.float64)
    hh = a.shape[0]
    ground = np.median(a[int(hh * 0.97):, :, :].reshape(-1, 3), axis=0)
    alpha = scrim_alpha(hh)[:, None, None]
    out = a * (1 - alpha) + ground[None, None, :] * alpha
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def small_cut(im: Image.Image) -> Image.Image:
    w, h = im.size
    ratio = SMALL_W / SMALL_H
    cw = round(h * ratio)
    x0 = (w - cw) // 2
    return im.crop((x0, 0, x0 + cw, h)).resize((SMALL_W, SMALL_H), Image.LANCZOS)


def main() -> None:
    src = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '..', 'public', 'images', 'cards', 'backdrops')
    os.makedirs(os.path.join(out, 'letter'), exist_ok=True)
    os.makedirs(os.path.join(out, 'small'), exist_ok=True)
    total = 0
    for n, bid in IDS.items():
        path = os.path.join(src, f'bd-{n}.png')
        if not os.path.exists(path):
            print('skip', bid); continue
        im = Image.open(path).convert('RGB')
        p1 = os.path.join(out, 'letter', f'{bid}.jpg'); letter_cut(im).save(p1, 'JPEG', quality=85, optimize=True, subsampling=2)
        p2 = os.path.join(out, 'small', f'{bid}.jpg'); small_cut(im).save(p2, 'JPEG', quality=86, optimize=True, subsampling=2)
        total += os.path.getsize(p1) + os.path.getsize(p2)
        print(f'{bid:16s} letter {os.path.getsize(p1) // 1024} KB · small {os.path.getsize(p2) // 1024} KB')
    print(f'-> {os.path.abspath(out)} ({total / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
