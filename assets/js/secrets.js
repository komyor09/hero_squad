/* =========================================================
   СЕКРЕТНЫЙ ОТДЕЛ «Щ.И.Т.»  ·  пасхалки HERO SQUAD (RU / TJ / EN)
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
  const ROOT = window.ROOT || "";
  const LOC = { ru: "ru-RU", tg: "ru-RU", en: "en-US" }[window.LANG] || "ru-RU";

  /* ---------- реестр достижений ---------- */
  const ACH = {
    space:   { n: tr("Камень Пространства", "Санги Фазо", "Space Stone"), i: "◆" },
    mind:    { n: tr("Камень Разума", "Санги Ақл", "Mind Stone"), i: "◆" },
    reality: { n: tr("Камень Реальности", "Санги Воқеият", "Reality Stone"), i: "◆" },
    power:   { n: tr("Камень Силы", "Санги Қудрат", "Power Stone"), i: "◆" },
    time:    { n: tr("Камень Времени", "Санги Вақт", "Time Stone"), i: "◆" },
    soul:    { n: tr("Камень Души", "Санги Рӯҳ", "Soul Stone"), i: "◆" },
    snap:    { n: tr("Щелчок перчаткой", "Ширтоси дастпӯшак", "The Snap"), i: "✋" },
    jarvis:  { n: tr("Привет, J.A.R.V.I.S.", "Салом, J.A.R.V.I.S.", "Hello, J.A.R.V.I.S."), i: "⌘" },
    stark:   { n: tr("Зрение Старка", "Чашми Старк", "Stark Vision"), i: "◎" },
    deadpool:{ n: tr("Четвёртая стена сломана", "Девори чорум шикаст", "Fourth wall broken"), i: "✖" },
    claws:   { n: "SNIKT!", i: "⚔" },
    web:     { n: tr("Паутиной по сайту", "Тор ба сайт", "Web-slinger"), i: "✳" },
    dormammu:{ n: tr("Сделка с Дормамму", "Созиш бо Дормамму", "Deal with Dormammu"), i: "∞" },
    wakanda: { n: tr("Ваканда навсегда", "Ваканда то абад", "Wakanda Forever"), i: "✦" },
    console: { n: tr("Хакер из Щ.И.Т.а", "Хакери S.H.I.E.L.D.", "S.H.I.E.L.D. hacker"), i: ">_" },
    lost:    { n: tr("Потерялся в мультивселенной", "Дар мултиолам гум шуд", "Lost in the multiverse"), i: "?" }
  };
  const STONES = { space: "#3b82ff", mind: "#ffd400", reality: "#ff2b2b", power: "#a64dff", time: "#22e07a", soul: "#ff8a00" };
  const STONE_HINTS = {
    space: tr("Там, где начинается праздник — рядом с первым героем главной.", "Дар ҷое, ки ҷашн оғоз мешавад — назди қаҳрамони аввали саҳифаи асосӣ.", "Where the party begins — next to the first hero on the home page."),
    mind: tr("На обороте карточки самой хитрой шпионки.", "Дар пушти корти ҷосуси аз ҳама зирак.", "On the back of the cleverest spy’s card."),
    reality: tr("Появится, когда праздник станет по-настоящему большим (от 4 000 сомони).", "Вақте пайдо мешавад, ки ҷашн воқеан калон шавад (аз 4 000 сомонӣ).", "Appears when the party gets really big (4,000 TJS and up)."),
    power: tr("Спроси команду, что будет, если на праздник придёт Танос.", "Аз даста пурс: агар Танос ба ҷашн ояд, чӣ мешавад?", "Ask the team what happens if Thanos shows up."),
    time: tr("У Доктора Стрэнджа ответ висит прямо на груди.", "Ҷавоб дар синаи Доктор Стрэндж овезон аст.", "Doctor Strange wears the answer on his chest."),
    soul: tr("Вормир. Спроси того, кто всегда на связи.", "Вормир. Аз касе пурс, ки ҳамеша дар тамос аст.", "Vormir. Ask the one who’s always online.")
  };
  const TOTAL = Object.keys(ACH).length;
  let found = store.get("ach", []);
  const has = k => found.includes(k);
  function achieve(k) {
    if (has(k) || !ACH[k]) return false;
    found.push(k); store.set("ach", found);
    toast(`${tr("Секрет найден", "Сирр ёфт шуд", "Secret found")} · ${found.length}/${TOTAL}`, ACH[k].n, ACH[k].i);
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
    $("small", g).textContent = n === 6
      ? tr("Все камни собраны. Щёлкни!", "Ҳамаи сангҳо ҷамъ шуданд. Ширтос зан!", "All stones collected. Snap!")
      : `${tr("Камней", "Сангҳо", "Stones")}: ${n}/6 · ${tr("секретов", "сирҳо", "secrets")}: ${found.length}/${TOTAL}`;
  }
  renderGauntlet();
  const gauntlet = $(".gauntlet");
  gauntlet && gauntlet.addEventListener("click", () => {
    if (stonesGot().length === 6) return snap();
    modal(`
      <h3>${tr("Перчатка бесконечности", "Дастпӯшаки беохирӣ", "Infinity Gauntlet")}</h3>
      <p>${tr("Шесть камней спрятаны на страницах сайта. Подсказки:", "Шаш санг дар саҳифаҳои сайт пинҳон шудаанд. Маслиҳатҳо:", "Six stones are hidden across the site. Hints:")}</p>
      <div style="text-align:left;display:grid;gap:10px;margin:18px 0">
        ${Object.entries(STONES).map(([k, c]) => `
          <div style="display:flex;gap:12px;align-items:flex-start;opacity:${has(k) ? 0.45 : 1}">
            <i style="width:14px;height:18px;flex:none;margin-top:3px;background:${c};clip-path:polygon(50% 0,100% 35%,80% 100%,20% 100%,0 35%);box-shadow:0 0 10px ${c}"></i>
            <span><b>${ACH[k].n}</b>${has(k) ? " ✓" : ""}<br><small style="color:#9b9aad">${STONE_HINTS[k]}</small></span>
          </div>`).join("")}
      </div>
      <p style="font-size:13px">${tr("Паучье чутьё подскажет, когда камень рядом.", "Ҳисси тортанак мегӯяд, ки санг наздик аст.", "Your spider-sense will tingle when a stone is near.")}</p>
      <button class="btn" data-close>${tr("Искать!", "Ҷустуҷӯ!", "Let’s hunt!")}</button>`);
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
    if (stonesGot().length === 6) setTimeout(() => toast(tr("Перчатка заряжена", "Дастпӯшак пур шуд", "Gauntlet charged"),
      tr("Все 6 камней! Щёлкни перчаткой в подвале сайта", "Ҳамаи 6 санг! Дастпӯшакро дар поёни сайт пахш кун", "All 6 stones! Click the gauntlet in the footer"), "✋", 6000), 1200);
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
    toast(tr("Око Агамотто", "Чашми Агамотто", "Eye of Agamotto"), tr("Оно открылось… что-то зелёное блеснуло", "Он кушода шуд… чизе сабз дурахшид", "It opened… something green glinted"), "◉");
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
      if (Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) < 140) near = true;
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
    <div class="jarvis-head"><span class="dots"><i></i><i></i><i></i></span><span>J.A.R.V.I.S. · ${tr("терминал Hero Squad", "терминали Hero Squad", "Hero Squad terminal")}</span><button aria-label="×">×</button></div>
    <div class="jarvis-log" aria-live="polite"></div>
    <div class="jarvis-in"><span>›</span><input type="text" spellcheck="false" autocomplete="off" aria-label="J.A.R.V.I.S."><span class="jarvis-wave"><i></i><i></i><i></i><i></i><i></i></span></div>`;
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
      const hi = h < 6 ? tr("Доброй ночи", "Шаб ба хайр", "Good night") : h < 12 ? tr("Доброе утро", "Субҳ ба хайр", "Good morning") : h < 18 ? tr("Добрый день", "Рӯз ба хайр", "Good afternoon") : tr("Добрый вечер", "Шом ба хайр", "Good evening");
      say(`${hi}. ${tr("Я J.A.R.V.I.S. — помощник команды Hero Squad.", "Ман J.A.R.V.I.S. — ёрдамчии дастаи Hero Squad.", "I am J.A.R.V.I.S., the Hero Squad assistant.")}`);
      say(tr("Введите help, чтобы увидеть список команд.", "Барои дидани фармонҳо help нависед.", "Type help to see the list of commands."), "w", 200);
    }
    achieve("jarvis");
  }
  function closeJarvis() { jv.classList.remove("open"); jin.blur(); }
  function toggleJarvis() { jv.classList.contains("open") ? closeJarvis() : openJarvis(); }
  window.HSecrets.openJarvis = openJarvis;

  const PAGES = { home: "index.html", heroes: "heroes.html", services: "services.html", about: "about.html", contacts: "contacts.html", "404": "404.html" };

  const CMDS = {
    help: () => tr(
      ["Доступные команды:", "  heroes        — список героев и цены", "  go <страница> — перейти: home, heroes, services, about, contacts", "  stark         — зрение Старка (инспектор HTML)", "  stones        — где искать камни бесконечности", "  secrets       — найденные секреты", "  snap          — щёлкнуть перчаткой", "  lang ru|tj|en — сменить язык", "  whoami · date · clear · exit", "…а ещё есть команды, которых нет в списке. Как и положено секретам."],
      ["Фармонҳои дастрас:", "  heroes        — рӯйхати қаҳрамонон ва нархҳо", "  go <саҳифа>   — гузариш: home, heroes, services, about, contacts", "  stark         — чашми Старк (инспектори HTML)", "  stones        — сангҳои беохириро аз куҷо ҷустан", "  secrets       — сирҳои ёфтшуда", "  snap          — ширтоси дастпӯшак", "  lang ru|tj|en — иваз кардани забон", "  whoami · date · clear · exit", "…ва фармонҳое ҳастанд, ки дар рӯйхат нестанд. Сир бояд сир бошад."],
      ["Available commands:", "  heroes        — heroes and prices", "  go <page>     — navigate: home, heroes, services, about, contacts", "  stark         — Stark Vision (HTML inspector)", "  stones        — where to find the Infinity Stones", "  secrets       — secrets you’ve found", "  snap          — snap the gauntlet", "  lang ru|tj|en — switch language", "  whoami · date · clear · exit", "…and there are commands not on this list. Secrets should stay secret."]),
    heroes: () => (window.HEROES || []).map(h => `  ${h.name.padEnd(18, " ")} ${String(h.price).padStart(4)} ${CUR}  · ${h.ages}`),
    stones: () => Object.keys(STONES).map(k => `${has(k) ? "[✓]" : "[ ]"} ${ACH[k].n}${has(k) ? "" : " — " + STONE_HINTS[k]}`),
    secrets: () => {
      const all = Object.keys(ACH);
      return [`${tr("Найдено", "Ёфт шуд", "Found")} ${found.length} / ${all.length}:`, ...all.map(k => has(k) ? `  ✓ ${ACH[k].n}` : "  · ????????")];
    },
    stark: () => { toggleStark(true); closeJarvis(); return tr("Зрение Старка активировано. ESC — выход.", "Чашми Старк фаъол шуд. ESC — баромад.", "Stark Vision online. ESC to exit."); },
    snap: () => {
      if (stonesGot().length < 6) return [`${tr("Недостаточно камней", "Сангҳо кам аст", "Not enough stones")}: ${stonesGot().length}/6.`, tr("Даже Танос сначала собирал коллекцию.", "Ҳатто Танос аввал коллексия ҷамъ мекард.", "Even Thanos had to collect them first.")];
      closeJarvis(); snap(); return "*snap*";
    },
    whoami: () => [tr("Гость. Уровень допуска: стажёр Мстителей.", "Меҳмон. Сатҳи дастрасӣ: таҷрибаомӯзи Интиқомгирандагон.", "Guest. Clearance level: Avengers intern."), `${tr("Экран", "Экран", "Screen")}: ${screen.width}×${screen.height}. ${tr("Секретов", "Сирҳо", "Secrets")}: ${found.length}/${TOTAL}.`],
    date: () => `Earth-616: ${new Date().toLocaleString(LOC)}`,
    clear: () => { log.innerHTML = ""; return null; },
    exit: () => { closeJarvis(); return null; },
    vormir: () => { jvMode = "vormir"; return tr(
      ["Вы на Вормире. Ветер. Скалы. Красный Череп смотрит на вас.", "«Чтобы получить камень, нужно отдать то, что любишь». Что вы отдадите?"],
      ["Шумо дар Вормир ҳастед. Бод. Харсангҳо. Косахонаи Сурх ба шумо менигарад.", "«Барои гирифтани санг, бояд чизи азизро диҳӣ». Шумо чӣ медиҳед?"],
      ["You are on Vormir. Wind. Cliffs. The Red Skull stares at you.", "“To get the stone, you must give up what you love.” What will you give?"]); },
    dormammu: () => { closeJarvis(); dormammu(); return null; },
    wakanda: () => { wakanda(); return tr("Протокол «Ваканда» переключён.", "Протоколи «Ваканда» иваз шуд.", "Wakanda protocol toggled."); },
    snikt: () => { closeJarvis(); claws(); return null; },
    deadpool: () => { closeJarvis(); showDeadpool(true); return null; },
    web: () => tr("Паучье чутьё подсказывает: зажмите Shift и кликните куда угодно.", "Ҳисси тортанак мегӯяд: Shift-ро пахш карда, ба ҳар ҷо клик кунед.", "Spider-sense says: hold Shift and click anywhere."),
    hack: async () => {
      const lines = tr(
        ["Подключение к серверу Щ.И.Т.а…", "Обход брандмауэра Ника Фьюри…", "Расшифровка: ██████░░░░ 61%", "Расшифровка: ██████████ 100%", "ДОСТУП ЗАПРЕЩЁН. Фьюри всё видел. Он всегда всё видит.  (•_•)"],
        ["Пайвастшавӣ ба сервери S.H.I.E.L.D.…", "Гузаштан аз брандмауэри Ник Фюри…", "Рамзкушоӣ: ██████░░░░ 61%", "Рамзкушоӣ: ██████████ 100%", "ДАСТРАСӢ МАНЪ АСТ. Фюри ҳамаро дид. Ӯ ҳамеша мебинад.  (•_•)"],
        ["Connecting to S.H.I.E.L.D. server…", "Bypassing Nick Fury’s firewall…", "Decrypting: ██████░░░░ 61%", "Decrypting: ██████████ 100%", "ACCESS DENIED. Fury saw everything. He always does.  (•_•)"]);
      for (let i = 0; i < lines.length; i++) await say(lines[i], i === 4 ? "e" : "g", 450);
      return null;
    },
    sudo: () => ({ t: tr("Ник Фьюри не выдавал вам права администратора.", "Ник Фюри ба шумо ҳуқуқи администратор надодааст.", "Nick Fury did not grant you admin rights."), c: "e" }),
    thanos: () => tr("Он неизбежен. А вот скидка — нет.", "Ӯ ногузир аст. Аммо тахфиф — не.", "He is inevitable. The discount is not."),
    hulk: () => ({ t: tr("ХАЛК КРУШИТЬ! …но не на детском празднике. Халк обнимать.", "ХАЛК МЕШИКАНАД! …аммо на дар ҷашни кӯдакон. Халк оғӯш мекунад.", "HULK SMASH! …but not at a kids’ party. Hulk hug."), c: "w" }),
    iamironman: () => { toggleStark(true); closeJarvis(); return tr("Я — Железный человек.", "Ман — Одами оҳанин.", "I am Iron Man."); },
    reset: () => { found = []; store.set("ach", []); renderGauntlet(); $$(".stone.taken").forEach(s => s.classList.remove("taken")); return { t: tr("Прогресс сброшен.", "Пешрафт тоза шуд.", "Progress reset."), c: "w" }; },
    promo: () => tr("Промокоды не выдаются. Их зарабатывают подвигами.", "Промокод дода намешавад. Онро бо корнамоӣ ба даст меоранд.", "Promo codes aren’t handed out. They are earned through heroics."),
    marvel: () => tr("Этот сайт — учебный проект и не связан с Marvel. Но мы фанаты.", "Ин сайт лоиҳаи таълимӣ аст ва ба Marvel алоқа надорад. Вале мо мухлисонем.", "This site is a student project, not affiliated with Marvel. But we are fans."),
    salom: () => tr("И вам салом!", "Ва алейкум ассалом!", "Salom to you too!"),
    "42": () => tr("Это из другой вселенной.", "Ин аз олами дигар аст.", "Wrong universe.")
  };
  CMDS.hello = CMDS.salom; CMDS.привет = CMDS.salom; CMDS.салом = CMDS.salom;

  async function run(raw) {
    const input = raw.trim();
    if (!input) return;
    say(input, "u");
    jvHist.push(input); jvIdx = jvHist.length;
    if (jvMode === "vormir") {
      jvMode = null;
      await say(`${tr("Вы отдаёте", "Шумо медиҳед", "You give up")}: «${input}».`, "w", 300);
      await say(tr("Красный Череп кивает. Жертва засчитана… условно. Никто не пострадал, это детский сайт.", "Косахонаи Сурх сар ҷунбонд. Қурбонӣ қабул шуд… шартан. Ҳеҷ кас осеб надид, ин сайти кӯдакона аст.", "The Red Skull nods. Sacrifice accepted… symbolically. Nobody got hurt, this is a kids’ site."), "s", 700);
      if (!has("soul")) { await say("◆ " + ACH.soul.n + " ✓", "g", 600); achieve("soul"); }
      return;
    }
    const [cmd, ...args] = input.toLowerCase().replace(/\s+/g, " ").split(" ");
    const joined = cmd + args.join("");
    const key = joined in CMDS ? joined : cmd;
    if (cmd === "go") {
      const url = PAGES[args[0]];
      if (!url) return say(tr("Неизвестная страница. Варианты: home, heroes, services, about, contacts", "Саҳифаи номаълум. Вариантҳо: home, heroes, services, about, contacts", "Unknown page. Options: home, heroes, services, about, contacts"), "e");
      await say(`→ ${url}…`, "s");
      return setTimeout(() => location.href = url, 500);
    }
    if (cmd === "lang") {
      const a = $(`.lang-switch a[data-lang="${args[0]}"]`);
      if (!a) return say("lang ru | lang tj | lang en", "e");
      await say("→ " + args[0].toUpperCase(), "s");
      return setTimeout(() => location.href = a.href, 400);
    }
    const fn = CMDS[key];
    if (!fn) return say(tr(`Команда «${cmd}» не распознана. Мистер Старк бы разобрался. Введите help.`, `Фармони «${cmd}» шинохта нашуд. Ҷаноби Старк мефаҳмид. help нависед.`, `Command “${cmd}” not recognised. Mr. Stark would figure it out. Type help.`), "e");
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
    <div class="hud-top">STARK VISION · MARK LXXXV<br><small>ESC — ${tr("выход", "баромад", "exit")}</small></div>
    <div class="hud-side"></div><div class="hud-box"></div><div class="hud-tag"></div><div class="hud-reticle"></div>`;
  document.body.appendChild(hud);
  const hBox = $(".hud-box", hud), hTag = $(".hud-tag", hud), hRet = $(".hud-reticle", hud), hSide = $(".hud-side", hud);
  const K = {
    size: tr("размер", "андоза", "size"), font: tr("шрифт", "ҳуруф", "font"), color: tr("цвет", "ранг", "color"), kids: tr("детей", "фарзандон", "children")
  };
  function toggleStark(on) {
    const root = document.documentElement;
    const val = on === undefined ? !root.classList.contains("stark") : on;
    root.classList.toggle("stark", val);
    if (val) {
      achieve("stark");
      let rules = 0;
      try { [...document.styleSheets].forEach(s => { try { rules += s.cssRules.length; } catch (e) {} }); } catch (e) {}
      hSide.innerHTML = [
        "DOM SCAN ......... OK",
        `ELEMENTS ......... ${document.querySelectorAll("*").length}`,
        `CSS RULES ........ ${rules || "classified"}`,
        `IMAGES ........... ${document.images.length}`,
        `LINKS ............ ${document.links.length}`,
        `VIEWPORT ......... ${innerWidth}×${innerHeight}`,
        `LANG ............. ${window.LANG.toUpperCase()}`,
        "ARC REACTOR ...... 100%"
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
      <span class="k">${K.size}:</span> ${Math.round(r.width)}×${Math.round(r.height)}px<br>
      <span class="k">${K.font}:</span> ${cs.fontFamily.split(",")[0].replace(/"/g, "")} ${cs.fontSize}<br>
      <span class="k">${K.color}:</span> ${cs.color}<br>
      <span class="k">display:</span> ${cs.display} · <span class="k">${K.kids}:</span> ${el.children.length}`;
    hTag.style.left = Math.min(e.clientX + 24, innerWidth - 330) + "px";
    hTag.style.top = Math.min(e.clientY + 24, innerHeight - 120) + "px";
  });
  let logoClicks = 0, logoT;
  $$(".logo").forEach(l => l.addEventListener("click", e => {
    logoClicks++; clearTimeout(logoT);
    logoT = setTimeout(() => logoClicks = 0, 600);
    if (logoClicks >= 3) { e.preventDefault(); logoClicks = 0; toggleStark(); }
  }));

  /* ---------- Дэдпул ---------- */
  const dp = document.createElement("div");
  dp.className = "deadpool";
  dp.innerHTML = `<img src="${ROOT}assets/img/deadpool.jpg" alt="Deadpool"><div class="dp-bubble"><button class="dp-close" aria-label="×">×</button><span></span></div>`;
  document.body.appendChild(dp);
  let dpClicks = 0, dpShown = false, idleSec = 0, scrolls = 0;
  addEventListener("scroll", () => scrolls++, { passive: true });
  const pageName = document.body.dataset.page;
  const PAGE_LINES = {
    home: tr("Это главная. А главный тут — я. Можешь не спорить.", "Ин саҳифаи асосӣ аст. Асосӣ дар ин ҷо — ман. Баҳс накун.", "This is the home page. And I’m the main character. Don’t argue."),
    heroes: tr("Почему моя карточка не первая?! Требую пересмотра списка.", "Чаро корти ман аввал нест?! Рӯйхатро аз нав дида бароед!", "Why isn’t my card first?! I demand a recount."),
    services: tr("Видел цены? Бери меня. Я лучше Росомахи. И чище. Иногда.", "Нархҳоро дидӣ? Маро гир. Ман аз Вулверин беҳтарам. Ва тозатар. Баъзан.", "Seen the prices? Pick me. I’m better than Wolverine. And cleaner. Sometimes."),
    about: tr("«О нас»… А где страница «Обо мне»? Я подам жалобу.", "«Дар бораи мо»… Пас саҳифаи «Дар бораи ман» куҷост? Шикоят мекунам.", "“About us”… Where’s the “About me” page? I’m filing a complaint."),
    contacts: tr("Звони прямо сейчас. Я подожду. Я в этом углу живу.", "Ҳозир занг зан. Ман интизор мешавам. Ман дар ҳамин гӯша зиндагӣ мекунам.", "Call now. I’ll wait. I live in this corner."),
    lost: tr("404? Я тоже не знаю, где мы. Но вид красивый.", "404? Ман ҳам намедонам мо куҷоем. Аммо манзара зебо.", "404? I don’t know where we are either. Nice view though.")
  };
  function dpLine() {
    const t = new Date();
    const hm = t.toLocaleTimeString(LOC, { hour: "2-digit", minute: "2-digit" });
    const night = t.getHours() >= 23 || t.getHours() < 6;
    const lines = [
      PAGE_LINES[pageName] || tr("Привет. Да, я с тобой разговариваю.", "Салом. Ҳа, бо ту гап мезанам.", "Hi. Yes, I’m talking to you."),
      tr(`Ты уже ${idleSec} секунд ничего не делаешь. Я засёк. Мне скучно.`, `Ту ${idleSec} сония боз ҳеҷ кор намекунӣ. Ман ҳисоб кардам. Дилам танг шуд.`, `You’ve done nothing for ${idleSec} seconds. I counted. I’m bored.`),
      tr(`Прокруток страницы: ${scrolls}. Я считал. У меня много свободного времени.`, `Саҳифаро ${scrolls} бор варақ задӣ. Ман ҳисоб кардам. Вақти холӣ бисёр дорам.`, `Page scrolls: ${scrolls}. I counted. I have a lot of free time.`),
      tr("Препод, если вы это читаете — ставьте пятёрку. Я видел код, там даже комментарии есть!", "Муаллим, агар инро хонда истода бошед — 5 гузоред. Ман кодро дидам, ҳатто шарҳҳо доранд!", "Teacher, if you’re reading this — give an A. I’ve seen the code, it even has comments!"),
      tr("Подсказка: камни бесконечности слегка светятся. Как моя карьера.", "Маслиҳат: сангҳои беохирӣ каме медурахшанд. Мисли карераи ман.", "Hint: the Infinity Stones glow a little. Like my career."),
      tr("Нажми «ё» на клавиатуре. Только не говори, что это я сказал.", "Тугмаи «ё» (`)-ро пахш кун. Фақат нагӯ, ки ман гуфтам.", "Press the ` key. Just don’t tell anyone I told you."),
      night ? tr(`Уже ${hm}. Нормальные люди спят, а ты пасхалки ищешь.`, `Соат ${hm}. Одамони муқаррарӣ хобанд, ту бошӣ сир меҷӯӣ.`, `It’s ${hm}. Normal people are asleep, and you’re hunting easter eggs.`)
            : tr(`Сейчас ${hm}. Идеальное время, чтобы забронировать меня.`, `Ҳоло ${hm}. Вақти беҳтарин барои фармоиш додани ман.`, `It’s ${hm}. Perfect time to book me.`),
      tr("Ещё раз ткнёшь — я сломаю этот сайт. Я серьёзно. Почти.", "Боз як бор занӣ — ин сайтро мешиканам. Ҷиддӣ. Қариб.", "Poke me again and I’ll break this site. I’m serious. Almost.")
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
    if (dpClicks >= 8) { dpClicks = 0; breakSite(); return talk(tr("Я ПРЕДУПРЕЖДАЛ! …ладно, сейчас всё вернётся. Наверное.", "МАН ОГОҲ КАРДА БУДАМ! …хуб, ҳозир ҳама бармегардад. Шояд.", "I WARNED YOU! …okay, it’ll all come back. Probably.")); }
    talk(dpLine());
  });
  ["mousemove", "keydown", "scroll", "touchstart"].forEach(ev => addEventListener(ev, () => { idleSec = 0; }, { passive: true }));
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
      return `M${w * 0.15 + off} ${h * 0.1 + off * a} Q ${w / 2 + off + 40} ${h / 2 - 60 + off} ${w * 0.85 + off} ${h * 0.9 + off * a}`;
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
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let spokes = "", rings = "";
    for (let i = 0; i < 8; i++) {
      const ang = i * Math.PI / 4 + 0.2;
      spokes += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(ang) * 42}" y2="${y + Math.sin(ang) * 42}"/>`;
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
    msg.innerHTML = tr(
      `Мистер Старк, мне что-то нехорошо…<small>Половина сайта исчезла. Но не волнуйся — Халк уже щёлкает обратно.</small>`,
      `Ҷаноби Старк, ҳоли ман хуб нест…<small>Нисфи сайт нопадид шуд. Хавотир нашав — Халк аллакай баргардонда истодааст.</small>`,
      `Mr. Stark, I don’t feel so good…<small>Half the site is gone. Don’t worry — Hulk is already snapping it back.</small>`);
    setTimeout(() => document.body.appendChild(msg), 1200);
    setTimeout(() => msg.remove(), 5400);
    setTimeout(() => {
      victims.forEach(el => el.classList.remove("dusted"));
      const first = achieve("snap");
      toast(tr("Награда", "Мукофот", "Reward"), tr("Промокод SNAP15 — скидка 15% в калькуляторе", "Промокоди SNAP15 — 15% тахфиф дар ҳисобкунак", "Promo code SNAP15 — 15% off in the calculator"), "✋", 7000);
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
    const loop = tr("петля", "давр", "loop");
    const ask = tr("Дормамму, я пришёл договориться.", "Дормамму, ман барои гуфтушунид омадам.", "Dormammu, I’ve come to bargain.");
    const steps = [
      [loop + " 1", ask], [loop + " 2", ask], [loop + " 3", ask],
      [loop + " 47", tr("Дормамму… я пришёл… договориться.", "Дормамму… ман… барои гуфтушунид… омадам.", "Dormammu… I’ve come… to bargain.")],
      [tr("сделка заключена", "созиш баста шуд", "deal made"), tr("Ладно! Держи промокод DORMAMMU10 — −10% на праздник. Только уходи.", "Хуб! Ана промокоди DORMAMMU10 — −10% барои ҷашн. Фақат рав.", "Fine! Take promo code DORMAMMU10 — 10% off your party. Just leave.")]
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
      toast(ACH.wakanda.n, tr("Вибраниум активирован. Кликай — почувствуешь кинетическую энергию. Промокод: WAKANDA7", "Вибраниум фаъол шуд. Клик кун — энергияи кинетикиро ҳис мекунӣ. Промокод: WAKANDA7", "Vibranium activated. Click to feel the kinetic energy. Promo code: WAKANDA7"), "✦", 6500);
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
  console.log("%c" + tr("Агент, вы открыли консоль. Щ.И.Т. это ценит.\nВведите ", "Агент, шумо консолро кушодед. S.H.I.E.L.D. инро қадр мекунад.\nНависед ", "Agent, you opened the console. S.H.I.E.L.D. appreciates that.\nType ") + "%chero()%c" + tr(" и нажмите Enter.", " ва Enter-ро пахш кунед.", " and press Enter."), "color:#9b9aad;font-size:13px", "color:#f5c518;font-weight:bold;font-size:13px", "color:#9b9aad;font-size:13px");
  window.hero = function () {
    achieve("console");
    console.log("%c✓ " + tr("Доступ подтверждён.", "Дастрасӣ тасдиқ шуд.", "Access granted."), "color:#9cff6b;font-size:14px");
    console.log("%c" + tr("Секретные слова (просто набери их на странице):", "Калимаҳои махфӣ (дар саҳифа нависед):", "Secret words (just type them on the page):") + "\n  jarvis · stark · snikt · wakanda · dormammu · deadpool", "color:#6fe3ff;font-size:13px");
    return tr("Добро пожаловать в Щ.И.Т., агент.", "Хуш омадед ба S.H.I.E.L.D., агент.", "Welcome to S.H.I.E.L.D., agent.");
  };

  /* ---------- вкладка браузера ---------- */
  const origTitle = document.title;
  const awayTitle = tr("Мистер Старк, вернитесь…", "Ҷаноби Старк, баргардед…", "Mr. Stark, come back…");
  document.addEventListener("visibilitychange", () => { document.title = document.hidden ? awayTitle : origTitle; });

  /* ---------- 404 ---------- */
  const typed = $(".typed");
  if (typed) {
    achieve("lost");
    const text = tr(
      ["ДУМ не признаёт ошибок.", "Эта страница не потерялась — ДУМ её конфисковал.", "Ищешь Камень Души? ДУМ слышал, что J.A.R.V.I.S. знает дорогу на Вормир…", "А теперь — уходи. Пока ДУМ добрый."],
      ["ДУМ хаторо эътироф намекунад.", "Ин саҳифа гум нашудааст — ДУМ онро мусодира кард.", "Санги Рӯҳро меҷӯӣ? ДУМ шунидааст, ки J.A.R.V.I.S. роҳи Вормирро медонад…", "Акнун — рав. То ДУМ меҳрубон аст."],
      ["DOOM does not make mistakes.", "This page isn’t lost — DOOM confiscated it.", "Looking for the Soul Stone? DOOM hears J.A.R.V.I.S. knows the way to Vormir…", "Now leave. While DOOM is still in a good mood."]);
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
