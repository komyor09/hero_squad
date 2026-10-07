#!/usr/bin/env python3
"""
Remove a flat background (white, grey or dark) from a character image.

How it works: pixels that look like background AND are connected to the image
border are flood-filled (scipy.ndimage.label) and made transparent; the mask edge
is slightly blurred so the outline looks natural. Interior holes of the same
colour (e.g. the gap between legs) can be removed with --holes.

    pip install pillow numpy scipy
    python tools/cutout.py input.png assets/img/hero.png --mode white --thr 238 --holes
    python tools/cutout.py input.png assets/img/doom.png --mode dark --bg 6,7,12
"""
import argparse

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def cutout(src: str, dst: str, mode: str, thr: int, bg: str, holes: bool, max_h: int) -> None:
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(int)
    if mode == "white":
        cand = a.min(axis=2) > thr
    elif mode == "grey":
        cand = (a.min(axis=2) > thr) & ((a.max(axis=2) - a.min(axis=2)) < 22)
    else:  # dark: distance to a given background colour
        ref = np.array([int(x) for x in bg.split(",")])
        cand = np.abs(a - ref).sum(axis=2) < thr

    lab, n = ndimage.label(cand)
    keep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    if holes:
        sizes = ndimage.sum(cand, lab, range(1, n + 1))
        keep |= {i + 1 for i, s in enumerate(sizes) if s > 300}
    bgmask = ndimage.binary_opening(np.isin(lab, list(keep)))
    alpha = Image.fromarray(((~bgmask) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))

    out = im.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    if out.height > max_h:
        out = out.resize((int(out.width * max_h / out.height), max_h), Image.LANCZOS)
    out.save(dst, optimize=True)
    print("✓", dst, out.size)


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("src"); p.add_argument("dst")
    p.add_argument("--mode", choices=["white", "grey", "dark"], default="white")
    p.add_argument("--thr", type=int, default=238, help="brightness threshold (white/grey) or colour distance (dark)")
    p.add_argument("--bg", default="6,7,12", help="background RGB for --mode dark")
    p.add_argument("--holes", action="store_true", help="also remove large interior background areas")
    p.add_argument("--max-h", type=int, default=1100)
    a = p.parse_args()
    cutout(a.src, a.dst, a.mode, a.thr, a.bg, a.holes, a.max_h)
