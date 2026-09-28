"""
Cut the welcome-card CAST out of the generated sheets -> public/images/cards/cast/<id>.png

The party-size cards (lib/guestCardCast.ts) are composed in code: a backdrop
per occasion plus one character per guest. The characters come from
Higgsfield as transparent PNGs — single narwhal hosts, and "sheets" of three
friends in a row. This script:

  * splits a sheet into its characters: a cut where the column occupancy
    (pixels with alpha > 128) is lowest near each expected boundary
    (i/n of the width, +/- 13 %) — a fin tip or tail that crosses the cut
    costs a few pixels of that tip, nothing more,
  * trims every cutout to its alpha bounding box (+ a hair of padding),
    ignoring columns/rows with only a handful of pixels (a neighbour's
    sliver that crossed the cut),
  * scales each cutout so its longer side is MAX_PX (plenty for a 2.5 in
    character at 250 dpi) and writes an optimised PNG,
  * prints a JSON manifest {id: {w, h}} — the aspect ratios go into CAST in
    lib/guestCardCast.ts (the layout needs each cutout's aspect).

usage:
  python scripts/card-cast-cut.py <gen_dir> [out_dir]
    gen_dir  folder with gen-1xx.png (see SOURCES below)
    out_dir  default: public/images/cards/cast (next to this script)
"""
import json
import os
import sys

import numpy as np
from PIL import Image

MAX_PX = {'narwhal': 900, 'friend': 640}  # host ~3 in wide at 250 dpi, friends ~2 in; keeps an 8-guest PDF well under Drive's 5 MB cap
PAD = 6

# gen file -> list of ids, left to right (1 id = a single cutout)
SOURCES = {
    'gen-101.png': ['narwhal-plain'],
    'gen-102.png': ['narwhal-birthday'],
    'gen-103.png': ['narwhal-grad'],
    'gen-104.png': ['narwhal-garland'],
    'gen-105.png': ['narwhal-pair'],
    'gen-111.png': ['seahorse-a', 'ray-a', 'starfish-a'],
    'gen-112.png': ['clownfish-a', 'turtle-a', 'octopus-a'],
    'gen-113.png': ['jelly-a', 'crab-a', 'puffer-a'],
    'gen-114.png': ['seahorse-b', 'ray-b', 'starfish-b'],
    'gen-115.png': ['clownfish-b', 'turtle-b', 'octopus-b'],
    'gen-116.png': ['jelly-b', 'crab-b', 'puffer-b'],
}


def alpha_of(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert('RGBA'))[:, :, 3]


def bbox(alpha: np.ndarray, thresh: int = 24):
    keep = alpha > thresh
    cols = np.where(keep.sum(axis=0) > 3)[0]
    rows = np.where(keep.sum(axis=1) > 3)[0]
    if len(cols) == 0 or len(rows) == 0:
        return None
    return int(cols.min()), int(rows.min()), int(cols.max()) + 1, int(rows.max()) + 1


def split_columns(alpha: np.ndarray, want: int):
    h, w = alpha.shape
    prof = (alpha > 128).sum(axis=0).astype(float)
    k = 9
    prof = np.convolve(prof, np.ones(k) / k, mode='same')
    cuts = []
    for i in range(1, want):
        c = w * i / want
        lo, hi = int(c - 0.13 * w), int(c + 0.13 * w)
        x = lo + int(np.argmin(prof[lo:hi]))
        cuts.append(x)
        print(f'   cut at col {x} (occupancy {prof[x]:.1f} px)')
    edges = [0] + cuts + [w]
    return [[edges[i], edges[i + 1]] for i in range(want)]


def save_cut(im: Image.Image, out_path: str) -> tuple:
    max_px = MAX_PX['narwhal'] if 'narwhal' in os.path.basename(out_path) else MAX_PX['friend']
    a = alpha_of(im)
    b = bbox(a)
    if b is None:
        raise SystemExit(f'empty cutout for {out_path}')
    x0, y0, x1, y1 = b
    x0 = max(0, x0 - PAD); y0 = max(0, y0 - PAD); x1 = min(im.width, x1 + PAD); y1 = min(im.height, y1 + PAD)
    cut = im.convert('RGBA').crop((x0, y0, x1, y1))
    scale = min(1.0, max_px / max(cut.size))
    if scale < 1:
        cut = cut.resize((max(1, round(cut.width * scale)), max(1, round(cut.height * scale))), Image.LANCZOS)
    cut.save(out_path, 'PNG', optimize=True)
    return cut.size


def main():
    gen = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'images', 'cards', 'cast')
    os.makedirs(out, exist_ok=True)
    manifest = {}
    for fname, ids in SOURCES.items():
        src = os.path.join(gen, fname)
        if not os.path.exists(src):
            print('missing', src); continue
        im = Image.open(src).convert('RGBA')
        if len(ids) == 1:
            w, h = save_cut(im, os.path.join(out, ids[0] + '.png'))
            manifest[ids[0]] = {'w': w, 'h': h}
            print(f'{ids[0]:18s} {w}x{h}')
            continue
        print(fname)
        for (x0, x1), cid in zip(split_columns(alpha_of(im), len(ids)), ids):
            piece = im.crop((x0, 0, x1, im.height))
            w, h = save_cut(piece, os.path.join(out, cid + '.png'))
            manifest[cid] = {'w': w, 'h': h}
            print(f'{cid:18s} {w}x{h}  (cols {x0}-{x1})')
    with open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=1)
    print(json.dumps({k: round(v['w'] / v['h'], 3) for k, v in manifest.items()}))


if __name__ == '__main__':
    main()
