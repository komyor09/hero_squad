/* =========================================================
   МИНИ-ПОМОЩНИК ДЛЯ ПРЕЗЕНТАЦИИ (RU / TJ / EN)
   · «Миссии» — квесты по сайту с очками опыта и званиями
   · «Тур» — пошаговая экскурсия с подсветкой элементов
   · «QR» — QR-код текущей страницы на GitHub Pages
   ========================================================= */
(function () {
  "use strict";
  const { store, toast, $, $$ } = window.HS;
  const S = window.HSecrets || { has: () => false };
  const SITE = "https://komyor09.github.io/hero_squad/";
  const LANG = window.LANG;                       // ru | tg | en
  const LCODE = LANG === "tg" ? "tj" : LANG;      // папки: tj, en
  const ROOT = window.ROOT || "";
  const PAGE = document.body.dataset.page;        // home | heroes | services | about | contacts | lost
  const FILE = { home: "index.html", heroes: "heroes.html", services: "services.html", about: "about.html", contacts: "contacts.html", lost: "404.html" };
  const ICON = {
    qr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'
  };
  const LOGO_SVG = '<svg viewBox="0 0 48 48"><path d="M24 2 43 12v24L24 46 5 36V12z" fill="#e62429"/><path d="M27 9 15 27h8l-3 12 13-19h-8z" fill="#fff"/></svg>';
  const T = tr;

  /* ================= СОСТОЯНИЕ ================= */
  const done = store.get("mdone", {});
  const pages = new Set(store.get("pages", []));
  if (FILE[PAGE] && PAGE !== "lost") { pages.add(PAGE); store.set("pages", [...pages]); }

  function mark(id, silent) {
    if (done[id]) return;
    if (quest && !quest.running) return;           // квест на паузе — задания не засчитываются
    done[id] = Date.now(); store.set("mdone", done);
    const m = MISSIONS.find(x => x.id === id);
    if (m && !silent) toast(T("Миссия выполнена", "Миссия иҷро шуд", "Mission complete") + ` · +${m.xp} XP`, m.title, "✓");
    refresh(true);
  }

  /* ================= МИССИИ ================= */
  const egg = (k) => () => S.has(k);
  const go = (file) => (FILE[PAGE] === file.split("#")[0] ? null : file);
  const MISSIONS = [
    // ---- глава 1
    { ch: 1, id: "pages", xp: 50, count: () => [...pages].filter(p => p !== "lost").length, of: 5,
      title: T("Облети все 5 страниц", "Ҳамаи 5 саҳифаро бубин", "Visit all 5 pages"),
      desc: T("Главная, Герои, Услуги, О нас, Контакты.", "Асосӣ, Қаҳрамонон, Хизматҳо, Дар бораи мо, Тамос.", "Home, Heroes, Services, About, Contacts."),
      hint: T("Пользуйся меню в шапке сайта. На телефоне — кнопка ☰.", "Аз менюи боло истифода бар. Дар телефон — тугмаи ☰.", "Use the menu in the header. On a phone — the ☰ button.") },
    { ch: 1, id: "flip", xp: 30, link: "heroes.html",
      title: T("Переверни карточку героя", "Корти қаҳрамонро гардон", "Flip a hero card"),
      desc: T("Узнай характеристики любого персонажа.", "Хусусиятҳои ягон қаҳрамонро бифаҳм.", "Check out any hero’s stats."),
      hint: T("Круглая белая кнопка в углу карточки.", "Тугмаи сафеди мудаввар дар кунҷи корт.", "The round white button in the card corner.") },
    { ch: 1, id: "villain", xp: 30, link: "heroes.html",
      title: T("Вычисли злодея", "Бадкирдорро ёб", "Identify the villain"),
      desc: T("Отфильтруй каталог так, чтобы остались только злодеи.", "Феҳристро тавре филтр кун, ки танҳо бадкирдорон монанд.", "Filter the catalogue to show villains only."),
      hint: T("Кнопка «Злодеи» над карточками.", "Тугмаи «Бадкирдорон» болои кортҳо.", "The “Villains” button above the cards.") },
    { ch: 1, id: "lang", xp: 40,
      title: T("Полиглот", "Бисёрзабон", "Polyglot"),
      desc: T("Открой сайт на таджикском или английском языке.", "Сайтро бо забони тоҷикӣ ё англисӣ кушо.", "Open the site in another language."),
      hint: T("Переключатель RU · TJ · EN в шапке.", "Тугмаҳои RU · TJ · EN дар боло.", "The RU · TJ · EN switch in the header.") },
    // ---- глава 2
    { ch: 2, id: "calc", xp: 50, link: "services.html#calc",
      title: T("Праздник на широкую ногу", "Ҷашни калон", "Go big"),
      desc: T("Собери в калькуляторе праздник от 3 000 сомони.", "Дар ҳисобкунак ҷашни аз 3 000 сомонӣ созед.", "Build a party worth 3,000 TJS or more."),
      hint: T("Выбери 3 героя и подвинь ползунок часов.", "3 қаҳрамонро интихоб карда, соатҳоро зиёд кун.", "Pick 3 heroes and drag the hours slider.") },
    { ch: 2, id: "promo", xp: 60, link: "services.html#calc",
      title: T("Охотник за скидками", "Шикорчии тахфиф", "Discount hunter"),
      desc: T("Активируй любой промокод в калькуляторе.", "Ягон промокодро дар ҳисобкунак фаъол кун.", "Apply any promo code in the calculator."),
      hint: T("Промокоды выдают за пасхалки. Например, договорись с Дормамму (миссия ниже).", "Промокодҳоро барои сирҳо медиҳанд. Масалан, бо Дормамму созиш кун (миссияи поён).", "Promo codes are rewards for easter eggs — try making a deal with Dormammu (below).") },
    { ch: 2, id: "book", xp: 50, link: "contacts.html#book",
      title: T("Вызов героя", "Даъвати қаҳрамон", "Call a hero"),
      desc: T("Заполни и отправь форму заявки.", "Формаи дархостро пур карда фирист.", "Fill in and send the booking form."),
      hint: T("Телефон вводится в формате +992 XX XXX XX XX.", "Телефон бо формати +992 XX XXX XX XX.", "Phone format: +992 XX XXX XX XX.") },
    // ---- глава 3 (пасхалки)
    { ch: 3, id: "jarvis", xp: 80, egg: egg("jarvis"),
      title: T("Поговори с J.A.R.V.I.S.", "Бо J.A.R.V.I.S. гап зан", "Talk to J.A.R.V.I.S."),
      desc: T("У каждого Мстителя есть ИИ-помощник.", "Ҳар Интиқомгиранда ёрдамчии зеҳни сунъӣ дорад.", "Every Avenger has an AI assistant."),
      hint: T("Клавиша «ё» (`) или светящийся реактор в подвале сайта.", "Тугмаи «ё» (`) ё реактори дурахшон дар поёни сайт.", "The ` key or the glowing reactor in the footer.") },
    { ch: 3, id: "stark", xp: 80, egg: egg("stark"),
      title: T("Зрение Старка", "Чашми Старк", "Stark Vision"),
      desc: T("Посмотри на сайт глазами Железного человека.", "Ба сайт бо чашми Одами оҳанин нигоҳ кун.", "See the site through Iron Man’s eyes."),
      hint: T("Набери на клавиатуре stark, трижды кликни по логотипу или дай команду stark в J.A.R.V.I.S.", "Дар клавиатура stark навис, логоро се бор пахш кун ё ба J.A.R.V.I.S. фармони stark деҳ.", "Type stark, triple-click the logo, or send stark to J.A.R.V.I.S.") },
    { ch: 3, id: "deadpool", xp: 80, egg: egg("deadpool"),
      title: T("Четвёртая стена", "Девори чорум", "The fourth wall"),
      desc: T("Кое-кто в красном любит появляться без приглашения.", "Касе дар либоси сурх бе даъват пайдо шуданро дӯст медорад.", "Someone in red loves to show up uninvited."),
      hint: T("Замри на 25 секунд — и ткни в того, кто выглянет.", "25 сония ҳеҷ кор накун — ва ба касе, ки пайдо мешавад, пахш кун.", "Stay still for 25 seconds, then tap whoever peeks in.") },
    { ch: 3, id: "claws", xp: 80, egg: egg("claws"),
      title: "SNIKT!", desc: T("Выпусти когти Росомахи.", "Чанголҳои Вулверинро бароред.", "Unleash Wolverine’s claws."),
      hint: T("Набери snikt или дважды кликни по Росомахе на странице «Герои».", "snikt навис ё ба Вулверин дар саҳифаи «Қаҳрамонон» ду бор пахш кун.", "Type snikt or double-click Wolverine on the Heroes page.") },
    { ch: 3, id: "web", xp: 80, egg: egg("web"),
      title: T("Паутиной по сайту", "Тор ба сайт", "Web-slinger"),
      desc: T("Выстрели паутиной, как Человек-паук.", "Мисли Одам-тортанак тор парон.", "Shoot a web like Spider-Man."),
      hint: T("Shift + клик в любом месте. На телефоне — долгое нажатие.", "Shift + клик дар ҳар ҷо. Дар телефон — пахши дароз.", "Shift + click anywhere. On a phone — long press.") },
    { ch: 3, id: "dormammu", xp: 80, egg: egg("dormammu"),
      title: T("Сделка с Дормамму", "Созиш бо Дормамму", "Bargain with Dormammu"),
      desc: T("Попади во временную петлю и выйди с наградой.", "Ба давраи вақт афт ва бо мукофот бароед.", "Get stuck in a time loop and escape with a prize."),
      hint: T("Набери dormammu (или команда в J.A.R.V.I.S.).", "dormammu навис (ё фармон дар J.A.R.V.I.S.).", "Type dormammu (or ask J.A.R.V.I.S.).") },
    { ch: 3, id: "wakanda", xp: 80, egg: egg("wakanda"),
      title: T("Ваканда навсегда", "Ваканда то абад", "Wakanda Forever"),
      desc: T("Включи режим вибраниума.", "Режими вибраниумро фаъол кун.", "Switch on vibranium mode."),
      hint: T("Набери wakanda (или команда в J.A.R.V.I.S.). Повторно — чтобы выключить.", "wakanda навис (ё фармон дар J.A.R.V.I.S.). Бори дигар — барои хомӯш кардан.", "Type wakanda (or ask J.A.R.V.I.S.). Again to switch off.") },
    { ch: 3, id: "console", xp: 80, egg: egg("console"),
      title: T("Хакер Щ.И.Т.а", "Хакери S.H.I.E.L.D.", "S.H.I.E.L.D. hacker"),
      desc: T("Найди послание для разработчиков.", "Паёмро барои барномасозон ёб.", "Find the message for developers."),
      hint: T("F12 → вкладка Console → введи hero() и нажми Enter. Только на компьютере.", "F12 → Console → hero() навишта Enter пахш кун. Танҳо дар компютер.", "F12 → Console → type hero() and press Enter. Desktop only.") },
    { ch: 3, id: "lost", xp: 80, egg: egg("lost"),
      title: T("Потеряйся в мультивселенной", "Дар мултиолам гум шав", "Get lost in the multiverse"),
      desc: T("Найди страницу, которой нет в меню.", "Саҳифаеро ёб, ки дар меню нест.", "Find the page that isn’t in the menu."),
      hint: T("Загляни в самый низ подвала сайта — там есть почти невидимая ссылка.", "Ба поёни сайт нигоҳ кун — он ҷо истиноди қариб ноаён ҳаст.", "Look at the very bottom of the footer — there’s an almost invisible link.") },
    // ---- глава 4
    { ch: 4, id: "stones", xp: 150, count: () => ["space", "mind", "reality", "power", "time", "soul"].filter(S.has).length, of: 6,
      title: T("Собери 6 камней бесконечности", "6 санги беохириро ҷамъ кун", "Collect all 6 Infinity Stones"),
      desc: T("Они спрятаны на разных страницах и слегка светятся.", "Онҳо дар саҳифаҳои гуногун пинҳонанд ва каме медурахшанд.", "They’re hidden across pages and glow faintly."),
      hint: T("Рядом с камнем вокруг курсора появляются красные кольца. Подсказки по каждому камню — в перчатке в подвале сайта.", "Дар назди санг атрофи курсор ҳалқаҳои сурх пайдо мешаванд. Маслиҳат барои ҳар санг — дар дастпӯшак дар поёни сайт.", "Red rings appear around the cursor near a stone. Per-stone hints are in the gauntlet in the footer.") },
    { ch: 4, id: "snap", xp: 200, egg: egg("snap"),
      title: T("Щёлкни пальцами", "Ширтос зан", "Snap your fingers"),
      desc: T("Используй силу всех камней сразу.", "Қуввати ҳамаи сангҳоро якбора истифода бар.", "Use the power of all the stones at once."),
      hint: T("Когда перчатка засветится золотом — нажми на неё.", "Вақте дастпӯшак тиллоӣ медурахшад — онро пахш кун.", "When the gauntlet glows gold, click it.") }
  ];
  const CHAPTERS = {
    1: T("Глава 1 · Разведка", "Боби 1 · Иктишоф", "Chapter 1 · Recon"),
    2: T("Глава 2 · Операция «Праздник»", "Боби 2 · Амалиёти «Ҷашн»", "Chapter 2 · Operation Party"),
    3: T("Глава 3 · Секретные материалы", "Боби 3 · Маводи махфӣ", "Chapter 3 · Classified files"),
    4: T("Глава 4 · Бесконечность", "Боби 4 · Беохирӣ", "Chapter 4 · Infinity")
  };
  const RANKS = [
    [0, "🎓", T("Стажёр", "Таҷрибаомӯз", "Intern")],
    [150, "🛡", T("Новобранец", "Сарбози нав", "Recruit")],
    [400, "🕶", T("Агент Щ.И.Т.а", "Агенти S.H.I.E.L.D.", "S.H.I.E.L.D. Agent")],
    [750, "⚡", T("Мститель", "Интиқомгиранда", "Avenger")],
    [1100, "✨", T("Верховный чародей", "Ҷодугари олӣ", "Sorcerer Supreme")],
    [1380, "♾", T("Легенда мультивселенной", "Афсонаи мултиолам", "Multiverse Legend")]
  ];
  const isDone = m => m.egg ? m.egg() : m.count ? m.count() >= m.of : !!done[m.id];
  const MAXXP = MISSIONS.reduce((s, m) => s + m.xp, 0);
  const xpNow = () => MISSIONS.filter(isDone).reduce((s, m) => s + m.xp, 0);
  const rankOf = xp => RANKS.filter(r => xp >= r[0]).pop();

  /* ================= ИНТЕРФЕЙС ================= */
  const dock = document.createElement("div");
  dock.className = "g-dock";
  dock.innerHTML = `
    <button class="g-fab qr" data-g="qr" aria-label="QR">${ICON.qr}</button>
    <button class="g-fab" data-g="missions" aria-label="${T("Миссии", "Миссияҳо", "Missions")}">
      <span class="ring"></span>${ICON.target}<span class="g-label">${T("Миссии", "Миссияҳо", "Missions")}</span><span class="g-badge">0/0</span>
    </button>`;
  document.body.appendChild(dock);

  const panel = document.createElement("aside");
  panel.className = "g-panel";
  panel.setAttribute("aria-label", T("Миссии", "Миссияҳо", "Missions"));
  panel.innerHTML = `
    <div class="g-head">
      <h3>${T("Штаб миссий", "Ситоди миссияҳо", "Mission HQ")}</h3>
      <div class="sub">${T("Выполняй задания, находи секреты, получай звания.", "Супоришҳоро иҷро кун, сирҳоро ёб, унвон гир.", "Complete missions, find secrets, earn ranks.")}</div>
      <button class="g-close" aria-label="×">×</button>
      <div class="g-rank"><div class="emb"></div><div style="flex:1"><b></b><small></small><div class="g-xp"><i></i></div></div></div>
      <div class="g-actions">
        <button class="g-btn main" data-g="tour">${ICON.play}${T("Тур по сайту", "Сайри сайт", "Site tour")}</button>
        <button class="g-btn" data-g="qr">${ICON.qr}${T("QR-код", "QR-код", "QR code")}</button>
      </div>
    </div>
    <div class="g-body"></div>
    <div class="g-foot"><span class="g-total"></span><button data-g="reset">${T("Сбросить прогресс", "Аз нав оғоз", "Reset progress")}</button></div>`;
  document.body.appendChild(panel);
  const body = $(".g-body", panel);

  /* где искать каждый камень */
  const STONE_WHERE = {
    space: ["index.html", T("Главная", "Асосӣ", "Home")],
    mind: ["heroes.html", T("Герои", "Қаҳрамонон", "Heroes")],
    reality: ["services.html#calc", T("Услуги", "Хизматҳо", "Services")],
    power: ["contacts.html", T("Контакты", "Тамос", "Contacts")],
    time: ["about.html", T("О нас", "Дар бораи мо", "About")],
    soul: [null, "J.A.R.V.I.S."]
  };
  function stonesList() {
    const ST = S.STONES || {};
    return `<div class="g-stones">${Object.keys(STONE_WHERE).map(k => {
      const got = S.has(k), [href, label] = STONE_WHERE[k];
      const nm = S.ACH && S.ACH[k] ? S.ACH[k].n : k;
      const tip = S.STONE_HINTS ? S.STONE_HINTS[k] : "";
      const to = got ? "✓" : href ? `<a href="${href}">${label} →</a>` : `<button data-jarvis>${label}</button>`;
      return `<div class="g-stone ${got ? "got" : ""}" title="${tip.replace(/"/g, "&quot;")}"><i style="--sc:${ST[k] || "#fff"}"></i><span>${nm}</span>${to}</div>`;
    }).join("")}</div>`;
  }

  /* состояние общего квеста (приходит из live.js) */
  let quest = null, boardHTML = "", qTimer = "";
  const questLocked = () => !!(quest && !quest.running);
  function questBanner() {
    if (!quest) return "";
    if (quest.running) return `<div class="g-qban run"><b>🟢 ${T("Квест идёт", "Квест идома дорад", "Quest is live")}</b> · ${T("раунд", "давр", "round")} ${quest.round}<span class="g-qtime">${qTimer}</span></div>`;
    if (quest.finished) return `<div class="g-qban end"><b>🏁 ${T("Раунд завершён", "Давр ба охир расид", "Round finished")}</b><br>${T("Итоги — в таблице ниже. Ждите следующего старта.", "Натиҷаҳо — дар ҷадвали поён. Оғози навбатиро интизор шавед.", "Results are below. Wait for the next start.")}</div>`;
    return `<div class="g-qban wait"><b>⏳ ${T("Квест ещё не начался", "Квест ҳанӯз оғоз нашудааст", "Quest hasn’t started yet")}</b><br>${T("Ведущий запустит его из админки — у всех стартует одновременно.", "Пешбар онро аз админка оғоз мекунад — барои ҳама якбора.", "The host will start it from the admin panel — for everyone at once.")}</div>`;
  }

  function render() {
    let html = questBanner() + (quest ? `<div class="g-board">${boardHTML}</div>` : "");
    if (questLocked()) { body.innerHTML = html; return; }
    [1, 2, 3, 4].forEach(ch => {
      const list = MISSIONS.filter(m => m.ch === ch);
      const n = list.filter(isDone).length;
      html += `<div class="g-chap"><h4>${CHAPTERS[ch]}<span>${n}/${list.length}</span></h4>`;
      list.forEach(m => {
        const ok = isDone(m);
        const cnt = m.count ? `<span class="g-count">${Math.min(m.count(), m.of)}/${m.of}</span>` : "";
        const link = m.link && !ok && go(m.link) ? `<a href="${m.link}">${T("Перейти", "Гузариш", "Go")} →</a>` : "";
        html += `<div class="g-m ${ok ? "done" : ""}" data-id="${m.id}">
          <span class="chk">${ok ? "✓" : m.ch === 3 ? "?" : m.ch === 4 ? "◆" : "•"}</span>
          <div><div class="t">${m.title}${cnt}</div><div class="d">${m.desc}</div>
            ${m.id === "stones" ? stonesList() : ""}
            ${ok ? "" : `<div class="tools"><button data-hint>${T("Подсказка", "Маслиҳат", "Hint")}</button>${link}</div><div class="g-hint">💡 ${m.hint}</div>`}
          </div>
          <span class="xp">+${m.xp} XP</span>
        </div>`;
      });
      html += "</div>";
    });
    body.innerHTML = html;
  }
  body.addEventListener("click", e => {
    const h = e.target.closest("[data-hint]");
    if (h) h.closest(".g-m").classList.toggle("show-hint");
    if (e.target.closest("[data-jarvis]") && S.openJarvis) { closePanel(); S.openJarvis(); }
  });

  let lastRank = store.get("rank", 0);
  function refresh(pulse) {
    const xp = xpNow();
    const r = rankOf(xp);
    const nextR = RANKS.find(x => x[0] > xp);
    const doneN = MISSIONS.filter(isDone).length;
    $(".g-badge", dock).textContent = questLocked() ? "🔒" : `${doneN}/${MISSIONS.length}`;
    $(".emb", panel).textContent = r[1];
    $(".g-rank b", panel).textContent = r[2];
    $(".g-rank small", panel).textContent = nextR
      ? `${xp} XP · ${T("до звания", "то унвони", "next rank")} «${nextR[2]}» — ${nextR[0] - xp} XP`
      : `${xp} XP · ${T("максимальное звание!", "унвони олӣ!", "max rank!")}`;
    $(".g-xp i", panel).style.width = (xp / MAXXP * 100).toFixed(1) + "%";
    $(".g-total", panel).textContent = `${T("Выполнено", "Иҷро шуд", "Completed")}: ${doneN}/${MISSIONS.length}`;
    if (panel.classList.contains("open") || !body.innerHTML) render();
    const ri = RANKS.indexOf(r);
    if (ri > lastRank) {
      lastRank = ri; store.set("rank", ri);
      setTimeout(() => toast(T("Новое звание", "Унвони нав", "Rank up"), `${r[1]} ${r[2]}`, "★", 5000), 900);
    }
    if (pulse) { const f = $('[data-g="missions"]', dock); f.classList.remove("pulse"); void f.offsetWidth; f.classList.add("pulse"); }
    if (doneN === MISSIONS.length && !store.get("certShown", false)) { store.set("certShown", true); setTimeout(certificate, 1500); }
    document.dispatchEvent(new CustomEvent("hs:progress", { detail: stats() }));
  }
  function stats() {
    const xp = xpNow();
    return { xp, done: MISSIONS.filter(isDone).length, total: MISSIONS.length,
      stones: ["space", "mind", "reality", "power", "time", "soul"].filter(S.has).length, rank: rankOf(xp)[2] };
  }
  const PROGRESS_KEYS = ["mdone", "pages", "ach", "rank", "certShown", "wakanda", "tour"];
  function resetProgress() { PROGRESS_KEYS.forEach(k => store.del(k)); }

  function openPanel() { render(); panel.classList.add("open"); }
  function closePanel() { panel.classList.remove("open"); }
  $(".g-close", panel).addEventListener("click", closePanel);
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-g]");
    if (!b) return;
    const g = b.dataset.g;
    if (g === "missions") panel.classList.contains("open") ? closePanel() : openPanel();
    if (g === "qr") openQR();
    if (g === "tour") { closePanel(); startTour(); }
    if (g === "reset") {
      if (!b.classList.contains("warn")) { b.classList.add("warn"); b.textContent = T("Точно сбросить? Нажми ещё раз", "Боварӣ доред? Боз пахш кунед", "Sure? Click again"); return; }
      resetProgress();
      location.reload();
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closePanel(); closeQR(); endTour(); } });

  /* события сайта → миссии */
  document.addEventListener("hs:act", e => {
    const { t, v } = e.detail;
    if (t === "flip") mark("flip");
    if (t === "filter" && v === "villain") mark("villain");
    if (t === "promo") mark("promo");
    if (t === "book") mark("book");
  });
  document.addEventListener("hs:total", e => { if (e.detail >= 3000) mark("calc"); });
  document.addEventListener("hs:ach", () => refresh(true));
  if (LANG !== "ru" && !done.lang) { done.lang = Date.now(); store.set("mdone", done); }
  refresh(false);

  /* ================= QR-КОД ================= */
  const qr = document.createElement("div");
  qr.className = "g-qr";
  qr.innerHTML = `<div class="g-qr-box" role="dialog" aria-modal="true">
      <button class="x" aria-label="×">×</button>
      <span class="eyebrow">Hero Squad · ${T("на телефоне", "дар телефон", "on your phone")}</span>
      <h3>${T("Сканируй и играй с нами", "Скан кун ва бо мо бозӣ кун", "Scan and play along")}</h3>
      <p>${T("Наведи камеру телефона на код — сайт откроется сразу. Миссии и пасхалки работают и на телефоне.", "Камераи телефонро ба код рост кун — сайт фавран кушода мешавад. Миссияҳо ва сирҳо дар телефон ҳам кор мекунанд.", "Point your phone camera at the code to open the site. Missions and easter eggs work on phones too.")}</p>
      <div class="g-qr-tabs"><button data-q="page" class="on">${T("Эта страница", "Ҳамин саҳифа", "This page")}</button><button data-q="home">${T("Главная", "Асосӣ", "Home")}</button></div>
      <div class="g-qr-img"><img alt="QR"><span class="logo-c">${LOGO_SVG}</span></div>
      <div class="g-qr-url"></div>
      <div class="g-qr-row">
        <button class="btn ghost" data-copy>${T("Скопировать ссылку", "Нусхабардории истинод", "Copy link")}</button>
        <button class="btn" data-g="missions" onclick="this.closest('.g-qr').classList.remove('open')">${T("Открыть миссии", "Миссияҳоро кушо", "Open missions")}</button>
      </div>
    </div>`;
  document.body.appendChild(qr);
  let qMode = "page";
  function qrUrl(mode) {
    const folder = LCODE === "ru" ? "" : LCODE + "/";
    const f = mode === "home" ? "index.html" : (FILE[PAGE] || "index.html");
    return SITE + folder + (f === "index.html" ? "" : f);
  }
  function drawQR() {
    const f = qMode === "home" ? "index" : (FILE[PAGE] || "index.html").replace(".html", "");
    $("img", qr).src = `${ROOT}assets/qr/${LCODE}-${f}.svg`;
    $(".g-qr-url", qr).textContent = qrUrl(qMode).replace("https://", "");
    $$(".g-qr-tabs button", qr).forEach(b => b.classList.toggle("on", b.dataset.q === qMode));
  }
  function openQR() { drawQR(); qr.classList.add("open"); }
  function closeQR() { qr.classList.remove("open"); }
  qr.addEventListener("click", e => {
    if (e.target === qr || e.target.closest(".x")) closeQR();
    const q = e.target.closest("[data-q]"); if (q) { qMode = q.dataset.q; drawQR(); }
    const c = e.target.closest("[data-copy]");
    if (c) {
      const url = qrUrl(qMode);
      const ok = () => { c.textContent = "✓ " + T("Скопировано", "Нусха шуд", "Copied"); };
      try { navigator.clipboard.writeText(url).then(ok, ok); } catch (err) { ok(); }
    }
  });

  /* ================= ТУР ПО САЙТУ ================= */
  const STEPS = [
    { page: "home", sel: ".hero-title", t: T("Добро пожаловать в Hero Squad", "Хуш омадед ба Hero Squad", "Welcome to Hero Squad"),
      d: T("Сайт сервиса, который отправляет <b>аниматоров в костюмах супергероев</b> на детские праздники. Сейчас покажу всё самое интересное.", "Сайти хидмате, ки <b>аниматорони дар либоси суперқаҳрамонон</b>-ро ба ҷашнҳои кӯдакона мефиристад. Ҳозир ҳама чизи ҷолибро нишон медиҳам.", "A service that sends <b>superhero-costumed performers</b> to kids’ parties. Let me show you the best bits.") },
    { page: "home", sel: ".nav", alt: ".burger", t: T("5 страниц", "5 саҳифа", "5 pages"),
      d: T("Главная, Герои, Услуги, О нас и Контакты. Шапка прячется при прокрутке вниз и возвращается при прокрутке вверх.", "Асосӣ, Қаҳрамонон, Хизматҳо, Дар бораи мо ва Тамос. Сарлавҳа ҳангоми поён рафтан пинҳон мешавад.", "Home, Heroes, Services, About and Contacts. The header hides when you scroll down and returns when you scroll up.") },
    { page: "home", sel: ".header-cta .lang-switch", alt: ".burger", t: T("Три языка", "Се забон", "Three languages"),
      d: T("Русский, <b>тоҷикӣ</b> и English. Переводятся даже пасхалки и реплики Дэдпула.", "Русӣ, <b>тоҷикӣ</b> ва English. Ҳатто сирҳо ва суханони Дэдпул тарҷума шудаанд.", "Russian, <b>Tajik</b> and English. Even the easter eggs and Deadpool’s lines are translated.") },
    { page: "home", sel: ".hero-stage", t: T("Слайдер героев", "Слайдери қаҳрамонон", "Hero slider"),
      d: T("Каждый герой меняет цвет всей страницы. Стрелки — справа внизу, полоска показывает время до смены слайда.", "Ҳар қаҳрамон ранги тамоми саҳифаро иваз мекунад. Тирчаҳо — дар поёни рост.", "Each hero recolours the whole page. Arrows are bottom-right; the bar shows time until the next slide.") },
    { page: "home", sel: ".stats", t: T("Живые счётчики", "Ҳисобкунакҳои зинда", "Live counters"),
      d: T("Цифры начинают считать только когда блок появляется на экране — это <b>IntersectionObserver</b>.", "Рақамҳо танҳо вақте ҳисоб мекунанд, ки блок дар экран пайдо шавад — ин <b>IntersectionObserver</b> аст.", "The numbers only count up once the block is on screen — that’s <b>IntersectionObserver</b>.") },
    { page: "home", sel: ".gauntlet", t: T("Перчатка бесконечности", "Дастпӯшаки беохирӣ", "Infinity Gauntlet"),
      d: T("На сайте спрятаны <b>6 камней</b>. Соберите все — и сможете щёлкнуть пальцами. Нажмите на перчатку, чтобы получить подсказки.", "Дар сайт <b>6 санг</b> пинҳон аст. Ҳамаро ҷамъ кунед — ва ширтос зада метавонед.", "<b>6 stones</b> are hidden on the site. Collect them all and you can snap. Click the gauntlet for hints.") },
    { page: "heroes", sel: ".filters", t: T("Каталог и фильтр", "Феҳрист ва филтр", "Catalogue & filter"),
      d: T("8 персонажей: герои, антигерои и злодеи. Карточки генерируются из массива данных в JavaScript.", "8 қаҳрамон: қаҳрамонон, зидди қаҳрамонон ва бадкирдорон. Кортҳо аз массиви JavaScript сохта мешаванд.", "8 characters: heroes, antiheroes and villains. Cards are generated from a JavaScript data array.") },
    { page: "heroes", sel: ".hcard", t: T("3D-карточки", "Кортҳои 3D", "3D cards"),
      d: T("Карточка наклоняется за курсором, а круглая кнопка <b>переворачивает</b> её — на обороте характеристики героя.", "Корт аз паси курсор хам мешавад, тугмаи мудаввар онро <b>мегардонад</b>.", "The card tilts with the cursor; the round button <b>flips</b> it to show the hero’s stats.") },
    { page: "services", sel: ".packs", t: T("Пакеты услуг", "Бастаҳои хизмат", "Packages"),
      d: T("Три готовых пакета. Центральный — «хит сезона», он выделен цветом и тенью.", "Се бастаи тайёр. Мобайнӣ — «хити мавсим».", "Three ready-made packages. The middle one is the best seller, highlighted with colour and glow.") },
    { page: "services", sel: ".summary", alt: "#calc", t: T("Калькулятор праздника", "Ҳисобкунаки ҷашн", "Party calculator"),
      d: T("Цена пересчитывается мгновенно. Есть поле для <b>промокодов</b> — их выдают за найденные пасхалки.", "Нарх фавран ҳисоб мешавад. Майдони <b>промокод</b> ҳаст — онҳоро барои сирҳо медиҳанд.", "The price updates instantly. There’s a <b>promo code</b> field — codes are rewards for easter eggs.") },
    { page: "about", sel: ".strange-box", t: T("Доктор Стрэндж", "Доктор Стрэндж", "Doctor Strange"),
      d: T("Мандала нарисована чистым CSS. А ещё… приглядитесь к амулету у него на груди 👀", "Мандала бо CSS кашида шудааст. Ва… ба тӯмори синааш нигоҳ кунед 👀", "The mandala is pure CSS. And… take a close look at the amulet on his chest 👀") },
    { page: "contacts", sel: "#book-form", t: T("Форма заявки", "Формаи дархост", "Booking form"),
      d: T("Проверка полей, маска телефона <b>+992</b>, плавающие подписи. Расчёт из калькулятора подставляется сюда автоматически.", "Санҷиши майдонҳо, маскаи телефони <b>+992</b>. Ҳисоб аз ҳисобкунак худкор ворид мешавад.", "Field validation, a <b>+992</b> phone mask and floating labels. The calculator estimate is filled in automatically.") },
    { page: "contacts", sel: ".arc", t: T("Не трогай реактор", "Ба реактор даст нарасон", "Don’t touch the reactor"),
      d: T("…конечно же, трогайте! Здесь живёт <b>J.A.R.V.I.S.</b> — терминал с секретными командами. Также открывается клавишей «ё».", "…албатта, даст расонед! Дар ин ҷо <b>J.A.R.V.I.S.</b> зиндагӣ мекунад. Бо тугмаи «ё» ҳам кушода мешавад.", "…of course, touch it! <b>J.A.R.V.I.S.</b> lives here — a terminal with secret commands. The ` key opens it too.") },
    { page: "contacts", sel: null, final: true, t: T("Теперь ваша очередь!", "Акнун навбати шумо!", "Your turn now!"),
      d: T("Отсканируйте QR-код и откройте <b>Миссии</b>: 18 заданий, 16 секретов и звание «Легенда мультивселенной». Кто первым соберёт все камни?", "QR-кодро скан кунед ва <b>Миссияҳо</b>-ро кушоед: 18 супориш, 16 сир ва унвони «Афсонаи мултиолам». Кӣ аввал ҳамаи сангҳоро ҷамъ мекунад?", "Scan the QR code and open <b>Missions</b>: 18 tasks, 16 secrets and the “Multiverse Legend” rank. Who’ll collect all the stones first?") }
  ];
  const spot = document.createElement("div"); spot.className = "g-spot";
  const tip = document.createElement("div"); tip.className = "g-tip"; tip.setAttribute("role", "dialog");
  document.body.append(spot, tip);
  let cur = -1, curEl = null;

  function startTour() { showStep(0); }
  function endTour() {
    if (cur < 0) return;
    cur = -1; curEl = null; store.del("tour");
    spot.classList.remove("on"); tip.classList.remove("on");
  }
  function visible(el) { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; }
  function showStep(i) {
    if (i < 0 || i >= STEPS.length) return endTour();
    const s = STEPS[i];
    if (s.page !== PAGE) { store.set("tour", i); location.href = FILE[s.page]; return; }
    cur = i; store.set("tour", i);
    let el = s.sel ? (innerWidth <= 980 && s.alt ? $(s.alt) : $(s.sel)) : null;
    if (!visible(el) && s.alt) el = $(s.alt);
    if (!visible(el)) el = null;
    curEl = el;
    document.documentElement.style.scrollBehavior = "auto";
    if (el) {
      const r = el.getBoundingClientRect();
      const y = window.scrollY + r.top - Math.max(90, (innerHeight - Math.min(r.height, innerHeight * 0.6)) / 2 - 80);
      window.scrollTo(0, Math.max(0, y));
    }
    document.documentElement.style.scrollBehavior = "";
    tip.innerHTML = `<button class="x" aria-label="×">×</button>
      <div class="g-step">${T("Тур", "Сайр", "Tour")} · ${i + 1} / ${STEPS.length}</div>
      <h4>${s.t}</h4><p>${s.d}</p>
      <div class="nav-row">
        <div class="dots">${STEPS.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</div>
        ${i > 0 ? `<button class="prev">←</button>` : ""}
        ${s.final
          ? `<button data-g="qr">QR</button><button class="next" data-g="missions">${T("Миссии", "Миссияҳо", "Missions")}</button>`
          : `<button class="next">${T("Далее", "Минбаъд", "Next")} →</button>`}
      </div>`;
    setTimeout(place, 60);
    spot.classList.add("on"); tip.classList.add("on");
  }
  function place() {
    if (cur < 0) return;
    const pad = 10;
    if (curEl) {
      const r = curEl.getBoundingClientRect();
      spot.classList.remove("none");
      Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let top = r.bottom + 22;
      if (top + th > innerHeight - 10) top = r.top - th - 22;
      if (top < 10) top = Math.min(innerHeight - th - 16, Math.max(16, r.top + 16));
      let left = r.left + r.width / 2 - tw / 2;
      left = Math.max(12, Math.min(innerWidth - tw - 12, left));
      tip.style.left = left + "px"; tip.style.top = top + "px";
    } else {
      spot.classList.add("none");
      Object.assign(spot.style, { left: innerWidth / 2 + "px", top: innerHeight / 2 + "px", width: "0px", height: "0px" });
      tip.style.left = (innerWidth - tip.offsetWidth) / 2 + "px";
      tip.style.top = (innerHeight - tip.offsetHeight) / 2 + "px";
    }
  }
  tip.addEventListener("click", e => {
    if (e.target.closest(".x")) return endTour();
    if (e.target.closest(".prev")) return showStep(cur - 1);
    if (e.target.closest(".next") && !e.target.closest("[data-g]")) return showStep(cur + 1);
    if (e.target.closest("[data-g]")) endTour();
  });
  addEventListener("resize", place);
  addEventListener("scroll", () => { if (cur >= 0) requestAnimationFrame(place); }, { passive: true });
  document.addEventListener("keydown", e => {
    if (cur < 0) return;
    if (e.key === "ArrowRight") { e.preventDefault(); STEPS[cur].final ? endTour() : showStep(cur + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); showStep(cur - 1); }
  });
  // продолжение тура после перехода на другую страницу
  const resume = store.get("tour", null);
  if (resume !== null && STEPS[resume] && STEPS[resume].page === PAGE) setTimeout(() => showStep(resume), 700);
  else if (resume !== null) store.del("tour");

  /* ================= УДОСТОВЕРЕНИЕ ================= */
  function certificate() {
    const r = rankOf(xpNow());
    const m = HS.modal(`
      <span class="eyebrow">${T("Все миссии выполнены", "Ҳамаи миссияҳо иҷро шуданд", "All missions complete")}</span>
      <h3>${T("Удостоверение Мстителя", "Шаҳодатномаи Интиқомгиранда", "Avenger ID card")}</h3>
      <input class="g-name" maxlength="28" placeholder="${T("Впиши своё имя", "Номатро навис", "Enter your name")}">
      <div class="g-cert">
        <small>Hero Squad · ${T("удостоверение №", "шаҳодатномаи №", "ID no.")} ${String(Date.now()).slice(-6)}</small>
        <div class="nm">${T("Агент", "Агент", "Agent")}</div>
        <div class="rk">${r[1]} ${r[2]}</div>
        <div class="meta2"><span>${MISSIONS.length}/${MISSIONS.length} ${T("миссий", "миссия", "missions")} · ${xpNow()} XP</span><span>${new Date().toLocaleDateString(LANG === "en" ? "en-US" : "ru-RU")}</span></div>
        <div class="stamp">${T("Проверено<br>Щ.И.Т.", "Тасдиқ<br>S.H.I.E.L.D.", "Verified<br>S.H.I.E.L.D.")}</div>
      </div>
      <p style="margin-top:14px">${T("Сделай скриншот и покажи преподавателю 😉", "Скриншот гир ва ба муаллим нишон деҳ 😉", "Take a screenshot and show your teacher 😉")}</p>
      <button class="btn" data-close>${T("Я — легенда", "Ман — афсона", "I am legend")}</button>`);
    const inp = $(".g-name", m);
    inp.addEventListener("input", () => { $(".g-cert .nm", m).textContent = inp.value.trim() || T("Агент", "Агент", "Agent"); });
    HS.confetti && HS.confetti();
  }
  window.HGuide = {
    openPanel, closePanel, openQR, startTour, certificate, stats, resetProgress,
    setQuest(q) { quest = q; refresh(false); render(); },
    setBoard(html) { boardHTML = html; const b = $(".g-board", panel); if (b) b.innerHTML = html; },
    setTimer(txt) { qTimer = txt; const t = $(".g-qtime", panel); if (t) t.textContent = txt; },
    isLocked: questLocked
  };
})();
