# Changelog

All notable changes to this project. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [2.1.0] — 2026-10-07
### Added
- Repository documentation: README (EN/RU) with screenshots, `docs/ARCHITECTURE.md`, `AGENTS.md`, `llms.txt`.
- `tools/` (page generator, QR generator, background-removal script) and `tests/e2e.py` with GitHub Actions CI.

## [2.0.0] — 2026-10-07
### Added
- Database layer `HSDB` with Firebase Realtime Database and a localStorage demo mode.
- Admin panel (`admin.html`): start, stop and extend quest rounds, waiting and free modes, announcements, live leaderboard with projector mode, bookings with statuses and CSV export, hero visibility, prices and descriptions.
- Live quest on the site: name prompt, 3-2-1 countdown, timer bar, leaderboard in the Missions panel, round results.
- Bookings from the contact form are saved to the database.
- Firebase security rules (`database.rules.json`) and a setup guide.
### Fixed
- Infinity Stones were too small and faint to find. They are now larger and glowing, with a bigger tap target on phones.
- Doctor Strange's amulet now shows a hint that it can be clicked.
- The Reality Stone threshold is aligned with the calculator mission (3,000 TJS).
- The J.A.R.V.I.S. terminal could lose keyboard focus, which blocked the Soul Stone.

## [1.2.0] — 2026-10-07
### Added
- Presentation helper: 18 missions with XP and ranks, a 14-step guided tour with spotlight, a QR-code modal, and an Avenger ID certificate.
- Mobile long-press for the web-shooter easter egg.
### Changed
- Hero cards can be flipped by clicking anywhere on the card.

## [1.1.0] — 2026-10-07
### Added
- Tajik and English versions of every page, a language switcher, and translated easter eggs.
### Fixed
- Lazy-loaded images inside 3D cards never loaded.
- Stale cached assets after deploys (added `?v=` cache busting).

## [1.0.0] — 2026-10-07
### Added
- First release: 5 pages and a 404 page, slider, 3D hero cards, calculator, booking form, and 16 easter eggs.
