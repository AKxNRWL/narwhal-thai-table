"""
Letter-tent cut of the welcome-card art -> public/images/cards/letter/art-XX.jpg

The Letter card (lib/guestCardPdf.ts, LETTER) shows each piece in a picture
panel of 8.0 x 5.0 in (576 x 360 pt, ratio 1.6). This makes that cut from the
ORIGINAL generations (2336 x 1744, kept outside git in
D:\\projects\\narwhal-thai-table\\_art-candidates\\cards\\card-XX.png):

  * window  full width of the original, starting SHIFT of its height down.
            0.15 is the top edge the approved small-tent cut (art-XX.jpg)
            uses; what falls off the bottom is calm water.
  * scrim   baked in: from FADE_FROM of the height down the picture eases
            into its own ground colour (median of its bottom rows) — soft at
            first, then firm under the name, so the block of type in the
            bottom ~40 % always reads, whatever the picture does there.
  * output  2000 x 1250 px (250 dpi at 8 in), JPEG q85, 4:2:0.

usage:
  python scripts/card-art-letter.py <originals_dir> [out_dir] [ids...]
    originals_dir  folder with card-XX.png (or .jpg)
    out_dir        default: public/images/cards/letter (next to this script)
"""
import os
import sys

import numpy as np
from PIL import Image

RATIO = 576 / 360
OUT_W = 2000
SHIFT = 0.15
FADE_FROM = 0.46  # scrim starts here (fraction of the panel, from the top)
FADE_KNEE = 0.64  # ... reaches KNEE_ALPHA here (smoothstep) ...
KNEE_ALPHA = 0.62
BOTTOM_ALPHA = 0.93  # ... and this at the bottom edge (linear)
IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '11', '12', '13', '14', '15', '16', '17', '18',
       '21', '22', '23', '24', '31', '32', '33', '34', '41', '42', '43', '44', '51', '52', '53', '54',
       '61', '62', '63', '64', '71', '72', '73', '74']


def scrim_alpha(h: int) -> np.ndarray:
    y = (np.arange(h, dtype=np.float64) + 0.5) / h
    a = np.zeros(h)
    ramp = (y > FADE_FROM) & (y <= FADE_KNEE)
    t = (y[ramp] - FADE_FROM) / (FADE_KNEE - FADE_FROM)
    a[ramp] = KNEE_ALPHA * t * t * (3 - 2 * t)
    low = y > FADE_KNEE
    a[low] = KNEE_ALPHA + (BOTTOM_ALPHA - KNEE_ALPHA) * (y[low] - FADE_KNEE) / (1 - FADE_KNEE)
    return a


def build(path: str) -> Image.Image:
    im = Image.open(path).convert('RGB')
    w, h = im.size
    wh = round(w / RATIO)
    y0 = min(round(SHIFT * h), h - wh)
    crop = im.crop((0, y0, w, y0 + wh)).resize((OUT_W, round(OUT_W / RATIO)), Image.LANCZOS)
    a = np.asarray(crop).astype(np.float64)
    hh = a.shape[0]
    ground = np.median(a[int(hh * 0.97):, :, :].reshape(-1, 3), axis=0)
    alpha = scrim_alpha(hh)[:, None, None]
    out = a * (1 - alpha) + ground[None, None, :] * alpha
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def main() -> None:
    src = sys.argv[1]
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '..', 'public', 'images', 'cards', 'letter')
    ids = sys.argv[3:] or IDS
    os.makedirs(out, exist_ok=True)
    total = 0
    for i in ids:
        path = next((p for p in (os.path.join(src, f'card-{i}.png'), os.path.join(src, f'card-{i}.jpg')) if os.path.exists(p)), None)
        if not path:
            print(f'skip {i}: no original')
            continue
        dest = os.path.join(out, f'art-{i}.jpg')
        build(path).save(dest, 'JPEG', quality=85, optimize=True, subsampling=2)
        total += os.path.getsize(dest)
    print(f'{len(ids)} pieces -> {os.path.abspath(out)} ({total / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
