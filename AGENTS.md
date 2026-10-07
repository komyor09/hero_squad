# AGENTS.md — guide for AI coding assistants

Read this before changing anything. Humans should start with [README.md](README.md). The full design is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Project in one paragraph
This is a static, framework-free website (HTML, CSS and vanilla JS) for a fictional superhero kids'-party service, published on GitHub Pages. It has 6 pages in 3 languages (RU in the root, TJ in `tj/`, EN in `en/`), so 18 generated HTML files, plus a hand-written `admin.html`. Interactive layers sit on top: easter eggs, missions with XP, a guided tour, a QR modal, and a live multiplayer quest. The quest is backed by Firebase Realtime Database, with a localStorage demo fallback.

## Commands
```bash
python tools/build_pages.py        # regenerate all 18 pages — REQUIRED after editing page text/markup
python tools/make_qr.py            # regenerate assets/qr/*.svg (needs: pip install segno)
python tests/e2e.py [smoke|missions|quest]   # Playwright e2e (pip install -r requirements-dev.txt)
python -m http.server 8000         # optional local server; file:// also works
```

## Golden rules
1. **Never edit the generated HTML** (`*.html` in the root, `tj/` and `en/`, except `admin.html`). Edit `tools/build_pages.py` and re-run it.
2. **Every user-visible string needs all three languages.** In Python templates use `T("ru", "tj", "en")`; in JS use `tr("ru", "tj", "en")`. The Tajik language code is `tg` (`<html lang="tg">`, `window.LANG === "tg"`), but the folder is `tj/`.
3. **Bump `ASSET_VERSION`** in `tools/build_pages.py` *and* the `?v=` in `admin.html` whenever any CSS or JS changes; otherwise GitHub Pages and phones keep serving stale files.
4. **Paths:** pages in `tj/` and `en/` reach assets through `../`. In JS, build asset URLs with `window.ROOT` (from `<body data-root>`).
5. **No frameworks, no bundler, no npm runtime dependencies.** Firebase is loaded lazily through dynamic `import()` from gstatic, and only when a config is present.
6. **Keep the security model in `database.rules.json`.** Client-side admin checks are cosmetic. If you add a DB path, add rules for it.
7. Run `python tests/e2e.py` before finishing. All suites must print `ALL PASSED`.

## Code map
| Need to change… | Edit |
|---|---|
| Page text, sections, navigation, footer | `tools/build_pages.py` → rebuild |
| Hero list, prices, descriptions, stats, calculator extras | `assets/js/data.js` (`HEROES`, `EXTRAS`) |
| Slider, cards, filter, calculator, booking form | `assets/js/main.js` |
| Easter eggs, Infinity Stones, J.A.R.V.I.S. commands | `assets/js/secrets.js` (+ `assets/css/secrets.css`) |
| Missions, XP, ranks, tour steps, QR modal | `assets/js/guide.js` (+ `assets/css/guide.css`) |
| Quest sync, leaderboard, announcements, bookings → DB | `assets/js/live.js` |
| Database API and demo mode | `assets/js/db.js` |
| Admin panel | `admin.html`, `assets/js/admin.js`, `assets/css/admin.css` |
| Design tokens (colours, fonts, radius) | `:root` in `assets/css/style.css` |

## Conventions
- Each JS file is an IIFE in `"use strict"` mode and exposes at most one global (`HS`, `HSecrets`, `HGuide`, `HLive`, `HSDB`).
- Modules communicate through `CustomEvent`s on `document`: `hs:act`, `hs:total`, `hs:ach`, `hs:progress`, `hs:heroes` (see ARCHITECTURE.md).
- Wrap localStorage access in `HS.store` (it has try/catch and the `hs_` prefix).
- Escape any data from the DB or from users before inserting it into HTML (`esc()` in `live.js` / `admin.js`).
- CSS class names must not collide across features. Two past bugs came from this: `.hero` (page section vs card tag) and `.step` (tour label vs step card). Prefix feature classes (`g-` guide, `q-` quest, `a-` admin).
- Comments are in Russian (the author's working language), and identifiers are in English.

## Recipes
- **Add a hero:** add an object to `HEROES` in `data.js` (with `id`, `role`, `img`, colours, `price`, and `tr()` for `name`/`ages`/`desc`/stats). Put the image in `assets/img/` (use `tools/cutout.py` for transparent PNGs). Cards, the calculator, the form select and the admin pick it up automatically.
- **Add a mission:** append to `MISSIONS` in `guide.js` with `ch`, `id`, `xp`, `title`/`desc`/`hint` via `T()`, and one completion source: `egg: egg("<achievement>")`, `count`/`of`, or `mark("<id>")` called from an event handler. Update the tour text and README counts if needed.
- **Add an easter egg:** add it to `ACH` in `secrets.js`, call `achieve("<id>")` when it is found, and add a mission with `egg()`.
- **Add a page:** add a `p_<name>()` function and an entry in `PAGES` and `nav_items()` in `build_pages.py`, add the tour step and QR (`make_qr.py` `PAGES`) if relevant, then rebuild.

## Gotchas
- Infinity Stones float (a CSS animation), so Playwright needs `click(force=True)`.
- In demo mode every tab of one browser shares a single player `uid`, so use two browser contexts to simulate two players.
- `file://` pages share one localStorage in Chromium; tests rely on this.
- Character images are third-party (Marvel/Disney) and are **not** MIT-licensed.
