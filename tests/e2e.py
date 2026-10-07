#!/usr/bin/env python3
"""
End-to-end tests for Hero Squad (Playwright, headless Chromium).

    pip install -r requirements-dev.txt
    python -m playwright install chromium
    python tests/e2e.py            # all suites
    python tests/e2e.py smoke      # one suite: smoke | missions | quest

Pages are opened straight from disk (file://), so no web server is needed.
Without a Firebase config the site runs in "demo" mode (localStorage), which lets
the quest suite drive the admin panel and a player page in the same browser.
"""
import asyncio
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = lambda p: (ROOT / p).as_uri()
PAGES = ["index.html", "heroes.html", "services.html", "about.html", "contacts.html", "404.html"]
FAILS = []


def check(cond, msg):
    print(("  ✓ " if cond else "  ✗ ") + msg)
    if not cond:
        FAILS.append(msg)


def ignore(msg: str) -> bool:
    # fonts.googleapis.com may be unreachable in sandboxes — not a site error
    return "Failed to load resource" in msg


async def new_page(browser, errs, **kw):
    ctx = await browser.new_context(**kw)
    page = await ctx.new_page()
    page.on("pageerror", lambda e: errs.append(f"{page.url}: {e}"))
    page.on("dialog", lambda d: asyncio.ensure_future(d.accept()))
    return ctx, page


async def prepare(page, path, wait=900):
    await page.goto(URL(path))
    await page.wait_for_timeout(wait)
    await page.evaluate("document.documentElement.style.scrollBehavior='auto';"
                        "document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))")


# --------------------------------------------------------------------------- smoke
async def smoke(browser):
    print("\n[smoke] every page, every language")
    errs = []
    ctx, page = await new_page(browser, errs, viewport={"width": 1440, "height": 900})
    await page.goto(URL("index.html"))
    await page.evaluate("localStorage.clear();sessionStorage.setItem('hs_loaded','1')")
    for lang in ["", "tj/", "en/"]:
        for p in PAGES:
            await prepare(page, lang + p, 700)
            broken = await page.evaluate("[...document.images].filter(i=>i.getAttribute('src')&&i.complete&&i.naturalWidth===0).map(i=>i.src)")
            check(not broken, f"{lang}{p}: all images load")
    await prepare(page, "admin.html")
    check(await page.is_visible("#login"), "admin.html: login form shown")
    check(await page.evaluate("document.querySelectorAll('#heroes-grid .hcard').length") == 0, "admin.html: no site widgets")
    await ctx.close()

    ctx, m = await new_page(browser, errs, viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    for p in ["index.html", "services.html", "tj/contacts.html"]:
        await prepare(m, p)
        w = await m.evaluate("document.documentElement.scrollWidth")
        check(w <= 390, f"mobile {p}: no horizontal scroll ({w}px)")
    await ctx.close()
    check(not errs, "no JavaScript errors" + ("" if not errs else ": " + "; ".join(errs[:3])))


# --------------------------------------------------------------------------- missions
async def missions(browser):
    print("\n[missions] complete all 18 missions like a player would")
    errs = []
    ctx, pg = await new_page(browser, errs, viewport={"width": 1440, "height": 900})
    await pg.goto(URL("index.html"))
    await pg.evaluate("localStorage.clear();sessionStorage.setItem('hs_loaded','1')")

    async def stone(k):
        await pg.evaluate(f"document.querySelector('.stone[data-stone={k}]').scrollIntoView({{block:'center'}})")
        await pg.wait_for_timeout(400)
        await pg.locator(f".stone[data-stone={k}]").click(force=True)   # stones float, so force the click
        await pg.wait_for_timeout(1200)

    await prepare(pg, "index.html"); await stone("space")
    await prepare(pg, "heroes.html")
    w = pg.locator(".hcard[data-id=widow]"); await w.scroll_into_view_if_needed(); await pg.wait_for_timeout(600)
    await w.locator(".meta .flip-btn").click(); await pg.wait_for_timeout(1200); await stone("mind")
    await pg.click(".filters [data-f=villain]"); await pg.click(".filters [data-f=all]")
    wf = pg.locator(".hcard[data-id=wolverine] .fig"); await wf.scroll_into_view_if_needed(); await wf.dblclick()
    await prepare(pg, "services.html")
    await pg.evaluate("document.querySelectorAll('#pick-heroes input').forEach((i,k)=>i.checked=k<4);"
                      "document.getElementById('calc-form').dispatchEvent(new Event('input'))")
    await pg.wait_for_timeout(400); await stone("reality")
    await pg.fill("#promo", "WAKANDA7"); await pg.click("#promo-btn")
    await prepare(pg, "about.html")
    a = pg.locator(".agamotto"); await a.scroll_into_view_if_needed(); await a.click(); await pg.wait_for_timeout(500)
    await stone("time")
    await prepare(pg, "contacts.html")
    await pg.locator(".faq details").nth(5).locator("summary").click(); await stone("power")
    await pg.fill("#f-name", "Test"); await pg.fill("#f-phone", "927770000"); await pg.fill("#f-date", "2030-01-01")
    await pg.select_option("#f-hero", "spider"); await pg.click("button[type=submit]"); await pg.wait_for_timeout(700)
    await pg.keyboard.press("Escape"); await pg.mouse.click(5, 5)
    await pg.keyboard.press("Backquote"); await pg.wait_for_timeout(600)
    await pg.keyboard.type("vormir"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
    await pg.keyboard.type("my fear"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(2400)
    await pg.keyboard.press("Escape"); await pg.mouse.click(5, 5)
    await pg.keyboard.type("stark"); await pg.wait_for_timeout(300); await pg.keyboard.press("Escape")
    await pg.keyboard.type("wakanda"); await pg.wait_for_timeout(300)
    await pg.keyboard.down("Shift"); await pg.mouse.click(700, 400); await pg.keyboard.up("Shift")
    await pg.keyboard.type("deadpool"); await pg.wait_for_timeout(1600)
    await pg.click(".deadpool img", position={"x": 50, "y": 120})
    await pg.evaluate("hero()")
    await pg.keyboard.type("dormammu"); await pg.wait_for_timeout(8500)
    await prepare(pg, "tj/index.html"); await prepare(pg, "404.html", 1500)
    await prepare(pg, "index.html"); await pg.evaluate("window.scrollTo(0, 1e6)"); await pg.wait_for_timeout(400)
    await pg.click(".gauntlet"); await pg.wait_for_timeout(7500)
    await pg.click(".g-fab[data-g=missions]"); await pg.wait_for_timeout(600)

    left = await pg.evaluate("[...document.querySelectorAll('.g-m:not(.done)')].map(m=>m.dataset.id)")
    check(await pg.text_content(".g-badge") == "18/18", "missions badge shows 18/18")
    check(not left, "no unfinished missions" + (f": {left}" if left else ""))
    check(await pg.evaluate("!!document.querySelector('.g-cert')"), "Avenger ID certificate appears")
    check(not errs, "no JavaScript errors" + ("" if not errs else ": " + "; ".join(errs[:3])))
    await ctx.close()


# --------------------------------------------------------------------------- quest (admin ↔ player)
async def quest(browser):
    print("\n[quest] admin starts a round, player joins, leaderboard/bookings/heroes sync")
    errs = []
    ctx, A = await new_page(browser, errs, viewport={"width": 1440, "height": 900})
    P = await ctx.new_page(); P.on("pageerror", lambda e: errs.append(f"player: {e}"))
    await A.goto(URL("admin.html")); await A.evaluate("localStorage.clear();sessionStorage.clear()")
    await A.reload(); await A.wait_for_timeout(500)
    await A.fill("#l-pass", "wrong"); await A.click("#login-form .btn"); await A.wait_for_timeout(300)
    check(bool(await A.text_content("#l-err")), "wrong password rejected")
    await A.fill("#l-pass", "avengers"); await A.click("#login-form .btn"); await A.wait_for_timeout(500)
    check(await A.is_visible("#app"), "admin logs in (demo mode)")

    await P.goto(URL("index.html")); await P.evaluate("sessionStorage.setItem('hs_loaded','1')"); await P.reload()
    await P.wait_for_timeout(900)
    await A.click("#q-wait"); await P.wait_for_timeout(1800)
    check(await P.text_content(".g-badge") == "🔒", "waiting mode locks missions on player page")

    await A.select_option("#q-dur", "5"); await A.click("#q-start"); await P.wait_for_timeout(2000)
    check(await P.is_visible(".q-over.open input"), "player is asked for a name when the round starts")
    await P.fill(".q-over input", "Tester"); await P.click(".q-over .btn"); await P.wait_for_timeout(5500)
    check(await P.evaluate("document.querySelector('.q-bar')?.classList.contains('on')"), "quest timer bar is shown")

    await prepare(P, "heroes.html", 1200)
    await P.locator(".hcard[data-id=iron]").click(position={"x": 80, "y": 120})
    await P.click(".filters [data-f=villain]"); await P.wait_for_timeout(2500)
    await A.click("[data-tab=leaders]"); await A.wait_for_timeout(1500)
    row = await A.text_content("#lb-table tbody tr")
    check("Tester" in row and "60" in row, "player appears on admin leaderboard with 60 XP")

    await A.click("[data-tab=quest]"); await A.fill("#ann-text", "One minute left!"); await A.click("#ann-send")
    await P.wait_for_timeout(1800)
    check(await P.is_visible(".q-ann.on"), "announcement shows on player screen")

    await A.click("[data-tab=heroes]")
    await A.locator("[data-h=deadpool] [data-f=enabled]").uncheck(); await A.locator("[data-h=deadpool] [data-save]").click()
    await A.locator("[data-h=spider] [data-f=price]").fill("999"); await A.locator("[data-h=spider] [data-save]").click()
    await P.wait_for_timeout(2200)
    check(await P.evaluate("document.querySelectorAll('#heroes-grid .hcard').length") == 7, "hidden hero disappears from catalogue")
    check("999" in await P.text_content(".hcard[data-id=spider] .meta small"), "price change reaches the site")

    await prepare(P, "contacts.html")
    await P.fill("#f-name", "Client"); await P.fill("#f-phone", "927770000"); await P.fill("#f-date", "2030-01-01")
    await P.select_option("#f-hero", "spider"); await P.click("button[type=submit]"); await P.wait_for_timeout(1800)
    await A.click("[data-tab=bookings]"); await A.wait_for_timeout(500)
    check("Client" in await A.text_content("#bk-table tbody"), "booking form lands in admin panel")

    await P.keyboard.press("Escape")
    await A.click("[data-tab=quest]"); await A.click("#q-stop"); await P.wait_for_timeout(2500)
    check(await P.is_visible(".q-over.open"), "player sees round results")
    await A.click("#q-free"); await P.wait_for_timeout(2000)
    check(await P.text_content(".g-badge") != "🔒", "free mode unlocks missions")
    check(not errs, "no JavaScript errors" + ("" if not errs else ": " + "; ".join(errs[:3])))
    await ctx.close()


async def main(which):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        suites = {"smoke": smoke, "missions": missions, "quest": quest}
        for name in which or suites:
            await suites[name](browser)
        await browser.close()
    print(f"\n{'FAILED: ' + str(len(FAILS)) if FAILS else 'ALL PASSED'}")
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:]))
