/* =========================================================
   СЕКРЕТНЫЙ ОТДЕЛ «Щ.И.Т.»  ·  пасхалки HERO SQUAD
   ---------------------------------------------------------
   Список всех секретов (спойлер для препода):
   1–6  Камни бесконечности, спрятаны по разным страницам
   7    Щелчок перчаткой (когда собраны все 6 камней)
   8    J.A.R.V.I.S.-терминал (клавиша «ё» / ` или слово jarvis)
   9    Stark Vision — HUD, который показывает HTML-теги под курсором
   10   Дэдпул ломает четвёртую стену (подожди без действий)
   11   Когти Росомахи (слово snikt)
   12   Паутина (Shift + клик)
   13   Петля Дормамму (слово dormammu) → промокод
   14   Режим Ваканды (слово wakanda) → промокод
   15   Секрет в консоли разработчика
   16   Потеряться (страница 404)
   ========================================================= */
(function () {
  "use strict";
  const { store, toast, modal, $, $$ } = window.HS;

  /* ---------- реестр достижений ---------- */
  const ACH = {
    space:   { n: "Камень Пространства", i: "◆" },
    mind:    { n: "Камень Разума", i: "◆" },
    reality: { n: "Камень Реальности", i: "◆" },
    power:   { n: "Камень Силы", i: "◆" },
    time:    { n: "Камень Времени", i: "◆" },
    soul:    { n: "Камень Души", i: "◆" },
    snap:    { n: "Щелчок перчаткой", i: "✋" },
    jarvis:  { n: "Привет, J.A.R.V.I.S.", i: "⌘" },
    stark:   { n: "Зрение Старка", i: "◎" },
    deadpool:{ n: "Четвёртая стена сломана", i: "✖" },
    claws:   { n: "SNIKT!", i: "⚔" },
    web:     { n: "Паутиной по сайту", i: "✳" },
    dormammu:{ n: "Сделка с Дормамму", i: "∞" },
    wakanda: { n: "Ваканда навсегда", i: "✦" },
    console: { n: "Хакер из Щ.И.Т.а", i: ">_" },
    lost:    { n: "Потерялся в мультивселенной", i: "?" }
  };
  const STONES = {
    space: "#3b82ff", mind: "#ffd400", reality: "#ff2b2b",
    power: "#a64dff", time: "#22e07a", soul: "#ff8a00"
  };
  const STONE_HINTS = {
    space: "Там, где начинается праздник — рядом с первым героем главной.",
    mind: "На обороте карточки самой хитрой шпионки.",
    reality: "Появится, когда праздник станет по-настоящему большим (от 4 000 сомони).",
    power: "Спроси команду, что будет, если на праздник придёт Танос.",
    time: "У Доктора Стрэнджа ответ висит прямо на груди.",
    soul: "Вормир. Спроси того, кто всегда на связи."
  };
  let found = store.get("ach", []);
  const has = k => found.includes(k);
  function achieve(k) {
    if (has(k) || !ACH[k]) return false;
    found.push(k); store.set("ach", found);
    toast(`Секрет найден · ${found.length}/${Object.keys(ACH).length}`, ACH[k].n, ACH[k].i);
    renderGauntlet();
    return true;
  }
  window.HSecrets = { has, achieve };

  /* ---------- перчатка в футере ---------- */
  function stonesGot() { return Object.keys(STONES).filter(has); }
  function renderGauntlet() {
    const g = $(".gauntlet");
    if (!g) return;
    $(".slots", g).innerHTML = Object.entries(STONES).map(([k, c]) => `<i class="slot ${has(k) ? "got" : ""}" style="--sc:${c}"></i>`).join("");
    const n = stonesGot().length;
    g.classList.toggle("full", n === 6);
    $("small", g).textContent = n === 6 ? "Все камни собраны. Щёлкни!" : `Камней: ${n}/6 · секретов: ${found.length}/${Object.keys(ACH).length}`;
  }
  renderGauntlet();
  const gauntlet = $(".gauntlet");
  gauntlet && gauntlet.addEventListener("click", () => {
    if (stonesGot().length === 6) return snap();
    modal(`
      <h3>Перчатка бесконечности</h3>
      <p>Шесть камней спрятаны на страницах сайта. Подсказки:</p>
      <div style="text-align:left;display:grid;gap:10px;margin:18px 0">
        ${Object.entries(STONES).map(([k, c]) => `
          <div style="display:flex;gap:12px;align-items:flex-start;opacity:${has(k) ? 0.45 : 1}">
            <i style="width:14px;height:18px;flex:none;margin-top:3px;background:${c};clip-path:polygon(50% 0,100% 35%,80% 100%,20% 100%,0 35%);box-shadow:0 0 10px ${c}"></i>
            <span><b>${ACH[k].n}</b>${has(k) ? " ✓" : ""}<br><small style="color:#9b9aad">${STONE_HINTS[k]}</small></span>
          </div>`).join("")}
      </div>
      <p style="font-size:13px">Паучье чутьё подскажет, когда камень рядом.</p>
      <button class="btn" data-close>Искать!</button>`);
  });

  /* ---------- камни на странице ---------- */
  function collectStone(btn) {
    const k = btn.dataset.stone;
    const r = btn.getBoundingClientRect();
    const target = gauntlet ? gauntlet.getBoundingClientRect() : { left: innerWidth - 60, top: innerHeight - 60 };
    const fly = document.createElement("div");
    fly.className = "stone-fly";
    fly.style.cssText = `left:${r.left}px;top:${r.top}px;background:${STONES[k]};box-shadow:0 0 30px ${STONES[k]}`;
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.left = (target.left + 20) + "px";
      fly.style.top = Math.min(innerHeight - 40, target.top + 10) + "px";
      fly.style.transform = "scale(.5) rotate(360deg)";
    });
    setTimeout(() => fly.remove(), 1100);
    btn.classList.add("taken");
    achieve(k);
    if (stonesGot().length === 6) setTimeout(() => toast("Перчатка заряжена", "Все 6 камней! Щёлкни перчаткой в подвале сайта", "✋", 6000), 1200);
  }
  function bindStones(root = document) {
    $$(".stone", root).forEach(b => {
      if (has(b.dataset.stone)) { b.classList.add("taken"); return; }
      if (b.dataset.bound) return;
      b.dataset.bound = 1;
      b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); collectStone(b); });
    });
  }
  bindStones();
  new MutationObserver(() => bindStones()).observe(document.body, { childList: true, subtree: true });

  /* камень Реальности — появляется в калькуляторе при сумме от 4000 */
  document.addEventListener("hs:total", e => {
    const box = $(".summary");
    if (!box || has("reality") || $(".stone[data-stone=reality]", box)) return;
    if (e.detail >= 4000) {
      const s = document.createElement("button");
      s.className = "stone"; s.dataset.stone = "reality"; s.setAttribute("aria-label", "?");
      s.style.cssText = "right:22px;top:20px;opacity:.6";
      box.appendChild(s);
    }
  });

  /* камень Времени — Око Агамотто */
  const eye = $(".agamotto");
  eye && eye.addEventListener("click", () => {
    if (has("time") || $(".stone[data-stone=time]")) return;
    const s = document.createElement("button");
    s.className = "stone"; s.dataset.stone = "time"; s.setAttribute("aria-label", "?");
    s.style.cssText = `left:${eye.offsetLeft + 10}px;top:${eye.offsetTop - 30}px;opacity:1;transform:scale(1.6)`;
    eye.parentElement.appendChild(s);
    toast("Око Агамотто", "Оно открылось… что-то зелёное блеснуло", "◉");
  });

  /* ---------- паучье чутьё ---------- */
  const sense = document.createElement("div");
  sense.className = "spidey-sense"; sense.innerHTML = "<i></i><i></i><i></i>";
  document.body.appendChild(sense);
  let senseT = 0;
  addEventListener("mousemove", e => {
    sense.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    const now = performance.now(); if (now - senseT < 120) return; senseT = now;
    let near = false;
    $$(".stone:not(.taken)").forEach(s => {
      const r = s.getBoundingClientRect();
      if (!r.width) return;
      const d = Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY);
      if (d < 140) near = true;
    });
    sense.classList.toggle("on", near);
  });

  /* ---------- слова, набранные на клавиатуре (в любой раскладке) ---------- */
  let buf = "";
  const WORDS = {
    jarvis: () => openJarvis(),
    dormammu: () => dormammu(),
    wakanda: () => wakanda(),
    snikt: () => claws(),
    stark: () => toggleStark(),
    deadpool: () => showDeadpool(true)
  };
  document.addEventListener("keydown", e => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "textarea", "select"].includes(tag)) return;
    if (e.code === "Backquote") { e.preventDefault(); return toggleJarvis(); }
    if (e.key === "Escape") { if (document.documentElement.classList.contains("stark")) toggleStark(false); closeJarvis(); }
    const m = /^Key([A-Z])$/.exec(e.code);
    if (!m) return;
    buf = (buf + m[1].toLowerCase()).slice(-12);
    for (const w in WORDS) if (buf.endsWith(w)) { buf = ""; WORDS[w](); }
  });

  /* ---------- J.A.R.V.I.S. ---------- */
  const jv = document.createElement("div");
  jv.className = "jarvis";
  jv.innerHTML = `
    <div class="jarvis-head"><span class="dots"><i></i><i></i><i></i></span><span>J.A.R.V.I.S. · терминал Hero Squad</span><button aria-label="Закрыть">×</button></div>
    <div class="jarvis-log" aria-live="polite"></div>
    <div class="jarvis-in"><span>›</span><input type="text" spellcheck="false" autocomplete="off" aria-label="Команда для J.A.R.V.I.S."><span class="jarvis-wave"><i></i><i></i><i></i><i></i><i></i></span></div>`;
  document.body.appendChild(jv);
  const log = $(".jarvis-log", jv), jin = $("input", jv);
  $(".jarvis-head button", jv).addEventListener("click", closeJarvis);
  let jvMode = null, jvHist = [], jvIdx = 0;

  function say(text, cls = "s", delay = 0) {
    return new Promise(res => setTimeout(() => {
      const p = document.createElement("div"); p.className = cls; p.textContent = text;
      log.appendChild(p); log.scrollTop = log.scrollHeight; res();
    }, delay));
  }
  function openJarvis() {
    jv.classList.add("open");
    setTimeout(() => jin.focus(), 300);
    if (!log.children.length) {
      const h = new Date().getHours();
      const hi = h < 6 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
      say(`${hi}. Я J.A.R.V.I.S. — помощник команды Hero Squad.`);
      say("Введите help, чтобы увидеть список команд.", "w", 200);
    }
    achieve("jarvis");
  }
  function closeJarvis() { jv.classList.remove("open"); jin.blur(); }
  function toggleJarvis() { jv.classList.contains("open") ? closeJarvis() : openJarvis(); }
  window.HSecrets.openJarvis = openJarvis;

  const PAGES = { home: "index.html", главная: "index.html", heroes: "heroes.html", герои: "heroes.html", services: "services.html", услуги: "services.html", about: "about.html", "о-нас": "about.html", contacts: "contacts.html", контакты: "contacts.html", "404": "404.html" };

  const CMDS = {
    help: () => [
      "Доступные команды:",
      "  heroes        — список героев и цены",
      "  go <страница> — перейти: home, heroes, services, about, contacts",
      "  stark         — включить зрение Старка (инспектор HTML)",
      "  stones        — где искать камни бесконечности",
      "  secrets       — найденные секреты",
      "  snap          — щёлкнуть перчаткой",
      "  whoami · date · clear · exit",
      "…а ещё есть команды, которых нет в списке. Как и положено секретам."
    ],
    heroes: () => (window.HEROES || []).map(h => `  ${h.name.padEnd(18, " ")} ${String(h.price).padStart(4)} смн/час  · ${h.ages}`),
    stones: () => Object.keys(STONES).map(k => `${has(k) ? "[✓]" : "[ ]"} ${ACH[k].n}${has(k) ? "" : " — " + STONE_HINTS[k]}`),
    secrets: () => {
      const all = Object.keys(ACH);
      return [`Найдено ${found.length} из ${all.length}:`, ...all.map(k => has(k) ? `  ✓ ${ACH[k].n}` : "  · ????????")];
    },
    stark: () => { toggleStark(true); closeJarvis(); return "Зрение Старка активировано. Наведите на любой элемент. ESC — выход."; },
    snap: () => { if (stonesGot().length < 6) return [`Недостаточно камней: ${stonesGot().length}/6.`, "Даже Танос сначала собирал коллекцию."]; closeJarvis(); snap(); return "Щёлк."; },
    whoami: () => [`Гость. Уровень допуска: стажёр Мстителей.`, `Браузер: ${navigator.userAgent.split(" ").slice(-1)[0]}`, `Экран: ${screen.width}×${screen.height}. Секретов найдено: ${found.length}.`],
    date: () => `Земля-616: ${new Date().toLocaleString("ru-RU")}`,
    clear: () => { log.innerHTML = ""; return null; },
    exit: () => { closeJarvis(); return null; },
    vormir: () => { jvMode = "vormir"; return ["Вы на Вормире. Ветер. Скалы. Красный Череп смотрит на вас.", "«Чтобы получить камень, нужно отдать то, что любишь». Что вы отдадите?"]; },
    dormammu: () => { closeJarvis(); dormammu(); return null; },
    wakanda: () => { wakanda(); return "Протокол «Ваканда» переключён."; },
    snikt: () => { closeJarvis(); claws(); return null; },
    deadpool: () => { closeJarvis(); showDeadpool(true); return null; },
    web: () => "Паучье чутьё подсказывает: зажмите Shift и кликните куда угодно.",
    hack: async () => {
      const lines = ["Подключение к серверу Щ.И.Т.а…", "Обход брандмауэра Ника Фьюри…", "Расшифровка: ██████░░░░ 61%", "Расшифровка: ██████████ 100%", "ДОСТУП ЗАПРЕЩЁН. Фьюри всё видел. Он всегда всё видит.  (•_•)"];
      for (let i = 0; i < lines.length; i++) await say(lines[i], i === 4 ? "e" : "g", 450);
      return null;
    },
    sudo: () => ({ t: "Ник Фьюри не выдавал вам права администратора.", c: "e" }),
    thanos: () => "Он неизбежен. А вот скидка — нет.",
    hulk: () => ({ t: "ХАЛК КРУШИТЬ! …но не на детском празднике. Халк обнимать.", c: "w" }),
    iamironman: () => { toggleStark(true); closeJarvis(); return "Я — Железный человек."; },
    reset: () => { found = []; store.set("ach", []); renderGauntlet(); $$(".stone.taken").forEach(s => s.classList.remove("taken")); return { t: "Прогресс сброшен. Мультивселенная перезагружена.", c: "w" }; },
    promo: () => "Промокоды не выдаются. Их зарабатывают подвигами.",
    marvel: () => "Этот сайт — учебный проект и не связан с Marvel. Но мы фанаты.",
    "42": () => "Это из другой вселенной."
  };

  async function run(raw) {
    const input = raw.trim();
    if (!input) return;
    say(input, "u");
    jvHist.push(input); jvIdx = jvHist.length;
    if (jvMode === "vormir") {
      jvMode = null;
      await say(`Вы отдаёте: «${input}».`, "w", 300);
      await say("Красный Череп кивает. Жертва засчитана… условно. Никто не пострадал, это детский сайт.", "s", 700);
      if (!has("soul")) { await say("◆ Вы получили Камень Души.", "g", 600); achieve("soul"); }
      else await say("Камень Души у вас уже есть.", "s", 400);
      return;
    }
    const [cmd, ...args] = input.toLowerCase().replace(/\s+/g, " ").split(" ");
    const key = (cmd + args.join("")).replace(/[^a-zа-я0-9-]/g, "") in CMDS ? (cmd + args.join("")) : cmd;
    if (cmd === "go") {
      const url = PAGES[args[0]];
      if (!url) return say("Неизвестная страница. Варианты: home, heroes, services, about, contacts", "e");
      await say(`Прокладываю маршрут к ${url}…`, "s");
      return setTimeout(() => location.href = url, 500);
    }
    const fn = CMDS[key];
    if (!fn) return say(`Команда «${cmd}» не распознана. Мистер Старк бы разобрался. Введите help.`, "e");
    let out = await fn(args);
    if (out == null) return;
    if (typeof out === "object" && !Array.isArray(out)) return say(out.t, out.c);
    [].concat(out).forEach((l, i) => say(l, "s", i * 60));
  }
  jin.addEventListener("keydown", e => {
    if (e.key === "Enter") { run(jin.value); jin.value = ""; }
    if (e.key === "ArrowUp") { jvIdx = Math.max(0, jvIdx - 1); jin.value = jvHist[jvIdx] || ""; e.preventDefault(); }
    if (e.key === "ArrowDown") { jvIdx = Math.min(jvHist.length, jvIdx + 1); jin.value = jvHist[jvIdx] || ""; }
    if (e.key === "Escape" || e.code === "Backquote") { e.preventDefault(); closeJarvis(); }
    e.stopPropagation();
  });
  $$(".arc").forEach(a => a.addEventListener("click", openJarvis));

  /* ---------- Stark Vision ---------- */
  const hud = document.createElement("div");
  hud.className = "stark-hud";
  hud.innerHTML = `<i class="hud-corner tl"></i><i class="hud-corner tr"></i><i class="hud-corner bl"></i><i class="hud-corner br"></i>
    <div class="hud-top">STARK VISION · MARK LXXXV<br><small>ESC — выход</small></div>
    <div class="hud-side"></div><div class="hud-box"></div><div class="hud-tag"></div><div class="hud-reticle"></div>`;
  document.body.appendChild(hud);
  const hBox = $(".hud-box", hud), hTag = $(".hud-tag", hud), hRet = $(".hud-reticle", hud), hSide = $(".hud-side", hud);
  function toggleStark(on) {
    const root = document.documentElement;
    const val = on === undefined ? !root.classList.contains("stark") : on;
    root.classList.toggle("stark", val);
    if (val) {
      achieve("stark");
      let rules = 0;
      try { [...document.styleSheets].forEach(s => { try { rules += s.cssRules.length; } catch (e) {} }); } catch (e) {}
      hSide.innerHTML = [
        "СКАН DOM ......... OK",
        `ЭЛЕМЕНТОВ ........ ${document.querySelectorAll("*").length}`,
        `CSS-ПРАВИЛ ....... ${rules || "засекречено"}`,
        `ИЗОБРАЖЕНИЙ ...... ${document.images.length}`,
        `ССЫЛОК ........... ${document.links.length}`,
        `ЭКРАН ............ ${innerWidth}×${innerHeight}`,
        "РЕАКТОР .......... 100%"
      ].join("<br>");
    }
  }
  addEventListener("mousemove", e => {
    if (!document.documentElement.classList.contains("stark")) return;
    hRet.style.left = e.clientX + "px"; hRet.style.top = e.clientY + "px";
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === document.documentElement) return;
    const r = el.getBoundingClientRect();
    Object.assign(hBox.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    const cs = getComputedStyle(el);
    const cls = [...el.classList].slice(0, 3).map(c => "." + c).join("");
    hTag.innerHTML = `<b>&lt;${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls}&gt;</b><br>
      <span class="k">размер:</span> ${Math.round(r.width)}×${Math.round(r.height)}px<br>
      <span class="k">шрифт:</span> ${cs.fontFamily.split(",")[0].replace(/"/g, "")} ${cs.fontSize}<br>
      <span class="k">цвет:</span> ${cs.color}<br>
      <span class="k">display:</span> ${cs.display} · <span class="k">детей:</span> ${el.children.length}`;
    const tx = Math.min(e.clientX + 24, innerWidth - 330), ty = Math.min(e.clientY + 24, innerHeight - 120);
    hTag.style.left = tx + "px"; hTag.style.top = ty + "px";
  });
  // тройной клик по логотипу
  let logoClicks = 0, logoT;
  $$(".logo").forEach(l => l.addEventListener("click", e => {
    logoClicks++; clearTimeout(logoT);
    logoT = setTimeout(() => logoClicks = 0, 600);
    if (logoClicks >= 3) { e.preventDefault(); logoClicks = 0; toggleStark(); }
  }));

  /* ---------- Дэдпул ---------- */
  const dp = document.createElement("div");
  dp.className = "deadpool";
  dp.innerHTML = `<img src="assets/img/deadpool.jpg" alt="Дэдпул выглядывает из-за края экрана"><div class="dp-bubble"><button class="dp-close" aria-label="Скрыть">×</button><span></span></div>`;
  document.body.appendChild(dp);
  let dpClicks = 0, dpShown = false, idleT, idleSec = 0, scrolls = 0;
  addEventListener("scroll", () => scrolls++, { passive: true });
  const pageName = document.body.dataset.page;
  const PAGE_LINES = {
    home: "Это главная. А главный тут — я. Можешь не спорить.",
    heroes: "Почему моя карточка не первая?! Требую пересмотра списка.",
    services: "Видел цены? Бери меня. Я лучше Росомахи. И чище. Иногда.",
    about: "«О нас»… А где страница «Обо мне»? Я подам жалобу.",
    contacts: "Звони прямо сейчас. Я подожду. Я в этом углу живу.",
    lost: "404? Я тоже не знаю, где мы. Но вид красивый."
  };
  function dpLine() {
    const t = new Date();
    const hh = String(t.getHours()).padStart(2, "0"), mm = String(t.getMinutes()).padStart(2, "0");
    const lines = [
      PAGE_LINES[pageName] || "Привет. Да, я с тобой разговариваю.",
      `Ты уже ${idleSec} секунд ничего не делаешь. Я засёк. Мне скучно.`,
      `Прокруток страницы: ${scrolls}. Я считал. У меня много свободного времени.`,
      "Препод, если вы это читаете — ставьте пятёрку. Я видел код, там даже комментарии есть!",
      "Подсказка: камни бесконечности слегка светятся. Как моя карьера.",
      "Нажми «ё» на клавиатуре. Только не говори, что это я сказал.",
      (t.getHours() >= 23 || t.getHours() < 6) ? `Уже ${hh}:${mm}. Нормальные люди спят, а ты пасхалки ищешь.` : `Сейчас ${hh}:${mm}. Идеальное время, чтобы забронировать меня.`,
      "Ещё раз ткнёшь — я сломаю этот сайт. Я серьёзно. Почти."
    ];
    return lines[dpClicks % lines.length];
  }
  function talk(text) { $(".dp-bubble span", dp).textContent = text; dp.classList.add("talk"); }
  function showDeadpool(force) {
    if (dpShown && !force) return;
    dpShown = true; dpClicks = 0;
    dp.classList.add("show");
    setTimeout(() => talk(dpLine()), 700);
  }
  function hideDeadpool() { dp.classList.remove("talk", "show"); }
  dp.addEventListener("click", e => {
    if (e.target.closest(".dp-close")) { e.stopPropagation(); return hideDeadpool(); }
    dpClicks++;
    achieve("deadpool");
    if (dpClicks >= 8) { dpClicks = 0; breakSite(); return talk("Я ПРЕДУПРЕЖДАЛ! …ладно, сейчас всё вернётся. Наверное."); }
    talk(dpLine());
  });
  function resetIdle() { idleSec = 0; }
  ["mousemove", "keydown", "scroll", "touchstart"].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
  setInterval(() => { idleSec++; if (idleSec === 25) showDeadpool(); }, 1000);

  function breakSite() {
    const els = $$("main h1, main h2, main .btn, main .hcard, main .svc, main .step, main .stat, main .pack, main .value, main .c-card, main img")
      .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; })
      .slice(0, 40);
    els.forEach(el => {
      el.classList.add("falling");
      const r = el.getBoundingClientRect();
      el.dataset.oldT = el.style.transform || "";
      el.style.transform = `translateY(${innerHeight - r.top + 40}px) rotate(${(Math.random() - 0.5) * 70}deg)`;
    });
    document.documentElement.classList.add("shake");
    setTimeout(() => document.documentElement.classList.remove("shake"), 500);
    setTimeout(() => {
      els.forEach(el => el.style.transform = el.dataset.oldT);
      setTimeout(() => els.forEach(el => el.classList.remove("falling")), 1300);
    }, 2600);
  }

  /* ---------- когти Росомахи ---------- */
  function claws() {
    const w = innerWidth, h = innerHeight;
    const a = Math.random() * 0.6 - 0.3;
    const paths = [-1, 0, 1].map(i => {
      const off = i * 70;
      const x1 = w * 0.15 + off, y1 = h * 0.1 + off * a, x2 = w * 0.85 + off, y2 = h * 0.9 + off * a;
      return `M${x1} ${y1} Q ${w / 2 + off + 40} ${h / 2 - 60 + off} ${x2} ${y2}`;
    });
    const c = document.createElement("div");
    c.className = "claws";
    c.innerHTML = `<svg viewBox="0 0 ${w} ${h}">${paths.map(p => `<path class="gap" d="${p}"/>`).join("")}${paths.map(p => `<path d="${p}"/>`).join("")}</svg>`;
    document.body.appendChild(c);
    document.documentElement.classList.add("shake");
    setTimeout(() => document.documentElement.classList.remove("shake"), 450);
    setTimeout(() => { c.style.transition = "opacity .6s"; c.style.opacity = 0; }, 1300);
    setTimeout(() => c.remove(), 2000);
    achieve("claws");
  }
  document.addEventListener("dblclick", e => { if (e.target.closest('.hcard[data-id="wolverine"] .fig')) claws(); });

  /* ---------- паутина: Shift + клик ---------- */
  const webLayer = document.createElement("div");
  webLayer.className = "web-layer";
  webLayer.innerHTML = `<svg></svg>`;
  document.body.appendChild(webLayer);
  const webSvg = $("svg", webLayer);
  document.addEventListener("click", e => {
    if (!e.shiftKey) return;
    e.preventDefault();
    const x = e.clientX, y = e.clientY;
    const sx = x < innerWidth / 2 ? 0 : innerWidth, sy = innerHeight;
    const NS = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(NS, "g");
    let spokes = "", rings = "";
    for (let i = 0; i < 8; i++) {
      const ang = i * Math.PI / 4 + 0.2, R = 42;
      spokes += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(ang) * R}" y2="${y + Math.sin(ang) * R}"/>`;
    }
    [14, 26, 38].forEach(R => {
      const pts = Array.from({ length: 8 }, (_, i) => { const ang = i * Math.PI / 4 + 0.2; return `${x + Math.cos(ang) * R},${y + Math.sin(ang) * R}`; }).join(" ");
      rings += `<polygon points="${pts}"/>`;
    });
    g.innerHTML = `<line class="web-line" x1="${sx}" y1="${sy}" x2="${x}" y2="${y}"/>
      <g class="web-splat" fill="none" stroke="#fff" stroke-width="1.6" style="filter:drop-shadow(0 0 3px #fff)">${spokes}${rings}</g>`;
    webSvg.appendChild(g);
    setTimeout(() => g.classList.add("web-fade"), 2600);
    setTimeout(() => g.remove(), 4000);
    achieve("web");
  }, true);

  /* ---------- щелчок Таноса ---------- */
  function snap() {
    const cands = $$("main h1, main h2, main p, main img, main .btn, main .hcard, main .svc, main .step, main .stat, main .pack, main .value, main .c-card, main .tl-item, .footer-big")
      .filter(el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && !el.closest(".dusted"); });
    const victims = cands.filter(() => Math.random() < 0.5);
    const fl = document.createElement("div"); fl.className = "snap-flash"; document.body.appendChild(fl);
    setTimeout(() => fl.remove(), 1000);

    const cv = document.createElement("canvas"); cv.className = "dust-canvas";
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const parts = [];
    const tones = ["#8a6a4a", "#5e4630", "#b0896a", "#3d2e22", "#c9a27e"];
    victims.forEach((el, vi) => {
      const r = el.getBoundingClientRect();
      const n = Math.min(260, Math.max(30, (r.width * r.height) / 500));
      for (let i = 0; i < n; i++) parts.push({
        x: r.left + Math.random() * r.width, y: r.top + Math.random() * r.height,
        vx: Math.random() * 2.5 + 0.6, vy: -Math.random() * 1.6 - 0.2,
        s: Math.random() * 2.6 + 0.8, a: 1, d: vi * 4 + Math.random() * 40,
        c: tones[Math.random() * tones.length | 0]
      });
      setTimeout(() => el.classList.add("dusted"), vi * 60 + 200);
    });
    let f = 0;
    (function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        if (f < p.d) return;
        p.x += p.vx; p.y += p.vy; p.vx += 0.03; p.a -= 0.008;
        if (p.a <= 0) return;
        ctx.globalAlpha = p.a; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      if (++f < 260) requestAnimationFrame(draw); else cv.remove();
    })();

    const msg = document.createElement("div"); msg.className = "snap-msg";
    msg.innerHTML = `Мистер Старк, мне что-то нехорошо…<small>Половина сайта исчезла. Но не волнуйся — Халк уже щёлкает обратно.</small>`;
    setTimeout(() => document.body.appendChild(msg), 1200);
    setTimeout(() => msg.remove(), 5400);
    setTimeout(() => {
      victims.forEach(el => el.classList.remove("dusted"));
      const first = achieve("snap");
      toast("Награда", "Промокод SNAP15 — скидка 15% в калькуляторе", "✋", 7000);
      if (first) setTimeout(() => HS.confetti(), 300);
    }, 5600);
  }

  /* ---------- Дормамму ---------- */
  let dormBusy = false;
  function dormammu() {
    if (dormBusy) return; dormBusy = true;
    const root = document.documentElement;
    const L = document.createElement("div"); L.className = "dorm-layer";
    L.innerHTML = `<i class="dorm-ring" style="width:60vmin;height:60vmin"></i><i class="dorm-ring r2" style="width:75vmin;height:75vmin"></i><i class="dorm-ring r3" style="width:45vmin;height:45vmin"></i><div class="dorm-text"></div>`;
    document.body.appendChild(L); root.classList.add("dormammu");
    const T = $(".dorm-text", L);
    const startY = scrollY;
    const steps = [
      ["петля 1", "Дормамму, я пришёл договориться."],
      ["петля 2", "Дормамму, я пришёл договориться."],
      ["петля 3", "Дормамму, я пришёл договориться."],
      ["петля 47", "Дормамму… я пришёл… договориться."],
      ["сделка заключена", "Ладно! Держи промокод DORMAMMU10 — −10% на праздник. Только уходи."]
    ];
    steps.forEach(([a, b], i) => setTimeout(() => {
      T.innerHTML = `<small>${a}</small>${b}`;
      window.scrollTo({ top: i % 2 ? startY + 200 : startY, behavior: "smooth" });
    }, i * 1300));
    setTimeout(() => {
      L.style.transition = "opacity .8s"; L.style.opacity = 0; root.classList.remove("dormammu");
      setTimeout(() => { L.remove(); dormBusy = false; }, 800);
      try { navigator.clipboard && navigator.clipboard.writeText("DORMAMMU10").catch(() => {}); } catch (e) {}
      achieve("dormammu");
    }, steps.length * 1300 + 1200);
  }

  /* ---------- Ваканда ---------- */
  function wakanda(force) {
    const root = document.documentElement;
    const on = force !== undefined ? force : !root.classList.contains("wakanda");
    root.classList.toggle("wakanda", on);
    store.set("wakanda", on);
    if (on && force === undefined) {
      toast("Ваканда навсегда", "Вибраниум активирован. Кликай — почувствуешь кинетическую энергию. Промокод: WAKANDA7", "✦", 6500);
      achieve("wakanda");
    }
  }
  if (store.get("wakanda", false)) wakanda(true);
  document.addEventListener("pointerdown", e => {
    if (!document.documentElement.classList.contains("wakanda")) return;
    const k = document.createElement("i"); k.className = "kinetic";
    k.style.left = e.clientX + "px"; k.style.top = e.clientY + "px";
    document.body.appendChild(k); setTimeout(() => k.remove(), 800);
  });

  /* ---------- консоль разработчика ---------- */
  const big = "font:24px 'Russo One',Impact,sans-serif;color:#fff;background:linear-gradient(90deg,#0a1a6b 50%,#a10d13 50%);padding:10px 22px;border-radius:6px";
  console.log("%cHERO SQUAD", big);
  console.log("%cАгент, вы открыли консоль. Щ.И.Т. это ценит.\nВведите %chero()%c и нажмите Enter.", "color:#9b9aad;font-size:13px", "color:#f5c518;font-weight:bold;font-size:13px", "color:#9b9aad;font-size:13px");
  window.hero = function () {
    achieve("console");
    console.log("%c✓ Доступ подтверждён.", "color:#9cff6b;font-size:14px");
    console.log("%cСекретные слова (просто набери их на странице):\n  jarvis · stark · snikt · wakanda · dormammu · deadpool\nИли нажми клавишу «ё».", "color:#6fe3ff;font-size:13px");
    return "Добро пожаловать в Щ.И.Т., агент.";
  };

  /* ---------- вкладка браузера ---------- */
  const origTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "Мистер Старк, вернитесь…" : origTitle;
  });

  /* ---------- 404 ---------- */
  const typed = $(".typed");
  if (typed) {
    achieve("lost");
    const text = [
      "ДУМ не признаёт ошибок.",
      "Эта страница не потерялась — ДУМ её конфисковал.",
      "Ищешь Камень Души? ДУМ слышал, что J.A.R.V.I.S. знает дорогу на Вормир…",
      "А теперь — уходи. Пока ДУМ добрый."
    ];
    let li = 0, ci = 0;
    (function type() {
      if (li >= text.length) return;
      const cur = text[li];
      typed.textContent = cur.slice(0, ++ci);
      if (ci >= cur.length) { li++; ci = 0; setTimeout(type, 1700); }
      else setTimeout(type, 38);
    })();
  }
})();
