#!/usr/bin/env python3
"""
Generate QR codes (SVG) for every page in every language.

Output: assets/qr/{ru|tj|en}-{page}.svg  — used by the "QR" button and the admin projector.
Change BASE_URL if the site is deployed somewhere else, then re-run:

    pip install segno
    python tools/make_qr.py
"""
import pathlib
import re

import segno

BASE_URL = "https://komyor09.github.io/hero_squad/"
PAGES = ["index", "heroes", "services", "about", "contacts", "404"]
LANGS = {"ru": "", "tj": "tj/", "en": "en/"}
OUT = pathlib.Path(__file__).resolve().parents[1] / "assets" / "qr"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for lang, folder in LANGS.items():
        for page in PAGES:
            url = BASE_URL + folder + ("" if page == "index" else f"{page}.html")
            path = OUT / f"{lang}-{page}.svg"
            segno.make(url, error="m").save(str(path), scale=10, border=2,
                                             dark="#07070b", light="#ffffff", xmldecl=False)
            svg = path.read_text()
            m = re.search(r'width="(\d+)" height="(\d+)"', svg)
            # add a viewBox so the SVG scales cleanly with CSS
            svg = svg.replace(m.group(0), f'viewBox="0 0 {m[1]} {m[2]}" {m.group(0)}', 1)
            path.write_text(svg)
            print("✓", path.name, "→", url)


if __name__ == "__main__":
    main()
