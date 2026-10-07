# Architecture

Hero Squad is a static site with no framework and no bundler. Every feature is a plain script wrapped in an IIFE that runs in page order. The scripts share a few `window` globals and talk to each other through DOM `CustomEvent`s.

## Page generation

`tools/build_pages.py` renders 6 page templates × 3 languages into static HTML:

| Folder | `<html lang>` | `data-root` | Asset prefix |
|---|---|---|---|
| `/` | `ru` | `""` | `assets/…` |
| `/tj/` | `tg` | `"../"` | `../assets/…` |
| `/en/` | `en` | `"../"` | `../assets/…` |

Each string is written once as `T("ru", "tj", "en")`. The header language switcher links to the same page in another folder. Asset URLs carry `?v=ASSET_VERSION` for cache busting on GitHub Pages. `admin.html` is hand-written and Russian-only, because it is a tool for the presenter.

## Script load order

```
data.js → firebase-config.js → db.js → main.js → secrets.js → guide.js → live.js
```

| File | Global | Responsibility |
|---|---|---|
| `data.js` | `LANG`, `ROOT`, `tr()`, `CUR`, `HEROES`, `EXTRAS` | Language detection, translation helper, hero data |
| `firebase-config.js` | `FIREBASE_CONFIG`, `HS_ADMIN_EMAILS`, `HS_DEMO_PASSWORD` | Deployment settings (Firebase web config is public by design) |
| `db.js` | `HSDB` | Database API with Firebase and localStorage back ends |
| `main.js` | `HS` (`store`, `toast`, `modal`, `act`, `confetti`, `visibleHeroes`) | UI: header, slider, cards, filter, calculator, booking form |
| `secrets.js` | `HSecrets` (`has`, `achieve`, `openJarvis`, `ACH`, `STONES`) | 16 easter eggs, Infinity Stones, J.A.R.V.I.S. terminal |
| `guide.js` | `HGuide` (`stats`, `setQuest`, `setBoard`, `resetProgress`…) | Missions panel, XP and ranks, guided tour, QR modal, certificate |
| `live.js` | `HLive` | Quest sync, leaderboard, announcements, bookings → DB, hero overrides ← DB |
| `admin.js` | — | Admin panel (`admin.html` only) |

## Events

| Event | Fired by | `detail` | Listened by |
|---|---|---|---|
| `hs:act` | `main.js` | `{t: "flip"\|"filter"\|"promo"\|"book", v}` | `guide.js` (missions), `live.js` (bookings) |
| `hs:total` | `main.js` calculator | total in TJS | `guide.js`, `secrets.js` (Reality Stone) |
| `hs:ach` | `secrets.js` `achieve()` | achievement id | `guide.js` |
| `hs:progress` | `guide.js` `refresh()` | `{xp, done, total, stones, rank}` | `live.js` → player row |
| `hs:heroes` | `live.js` | — | `main.js` re-renders cards, calculator and form |

## Data model (Realtime Database)

```
quest        { active, round, startedAt, endsAt|null, duration }      admin writes
announce     { id, text, at }                                         admin writes
heroes/{id}  { enabled, price|null, desc: { ru, tg, en } }            admin writes (overrides data.js)
players/{uid}{ name, xp, done, total, stones, rank, round, lang, updated }   each player writes own row
bookings/{id}{ name, phone, date, hero, msg, lang, status, createdAt }      anyone creates, admin reads
```

### Quest states (derived on the client)

| State | Condition | Player sees |
|---|---|---|
| Free | `quest` is missing | Missions work normally |
| Waiting | `round` set, `startedAt` null | Missions locked (🔒) |
| Running | `active && (endsAt == null \|\| now < endsAt)` | Name prompt → 3-2-1 → timer bar, progress synced |
| Finished | not running, `startedAt` set | Results overlay with place and top 5 |

A new `round` number makes each client reset its local progress, which keeps the competition fair. `HSDB.now()` uses Firebase's `.info/serverTimeOffset`, so every phone shows the same timer.

## Security

The rules in `database.rules.json` enforce access. Client checks only shape the UI.

- Reads are public only for `quest`, `announce`, `heroes` and `players`.
- `players/$uid` can be written only by the user with that `auth.uid` (anonymous auth). The rules also validate the name length and the XP range.
- `bookings/$id` can be created by any signed-in visitor but not overwritten, and only the admin can read the list.
- The admin is identified by `auth.token.email`, a Firebase Email/Password account.

## Local demo mode

When `FIREBASE_CONFIG` is `null`, or the Firebase SDK fails to load, `HSDB` switches to a localStorage tree with the same API. Changes reach other tabs through the `storage` event and `BroadcastChannel`, with 1.2 s polling as a fallback. The admin panel and the site therefore work together in one browser, which is also how `tests/e2e.py` drives both sides.

## Testing

`tests/e2e.py` (Playwright, Chromium) contains three suites:

1. **smoke**: all 19 pages in every language load without JS errors or broken images, and there is no horizontal scroll at 390 px.
2. **missions**: a scripted player completes all 18 missions, including every easter egg, and gets the certificate.
3. **quest**: the admin logs in, locks and starts a round; the player joins and scores; then the test checks leaderboard sync, announcements, hero edits, booking delivery and the results screen.

GitHub Actions runs the suites on every push (`.github/workflows/e2e.yml`).
