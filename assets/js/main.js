/* =========================================================
   HERO SQUAD · основной скрипт
   ========================================================= */
(function () {
  "use strict";

  /* ---------- безопасное хранилище ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("hs_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("hs_" + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("hs_" + k); } catch (e) {} }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const IMG = (window.ROOT || "") + "assets/img/";
  const LOC = { ru: "ru-RU", tg: "ru-RU", en: "en-US" }[window.LANG] || "ru-RU";
  const fmt = n => n.toLocaleString(LOC);

  /* ---------- тосты ---------- */
  function toast(title, text, icon = "★", ms = 4200) {
    let box = $(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="t-ico">${icon}</div><div><small>${title}</small><b>${text}</b></div>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 450); }, ms);
  }

  /* ---------- модалка ---------- */
  function modal(html) {
    let m = $("#hs-modal");
    if (!m) {
      m = document.createElement("div");
      m.id = "hs-modal"; m.className = "modal";
      m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true"></div>`;
      m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) m.classList.remove("open"); });
      document.body.appendChild(m);
    }
    $(".modal-box", m).innerHTML = html;
    requestAnimationFrame(() => m.classList.add("open"));
    return m;
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { const m = $("#hs-modal"); m && m.classList.remove("open"); } });

  /* событие для мини-помощника (миссии) */
  function act(t, v) { document.dispatchEvent(new CustomEvent("hs:act", { detail: { t, v } })); }

  window.HS = { store, toast, modal, $, $$, fmt, act };

  /* ---------- загрузчик (один раз за сессию) ---------- */
  const loader = $(".loader");
  if (loader) {
    let seen = false;
    try { seen = sessionStorage.getItem("hs_loaded"); sessionStorage.setItem("hs_loaded", "1"); } catch (e) {}
    if (seen) loader.remove();
    else {
      const word = $(".loader-word", loader);
      word.innerHTML = word.textContent.split("").map((c, i) => `<span style="animation-delay:${i * 0.05}s">${c === " " ? "&nbsp;" : c}</span>`).join("");
      window.addEventListener("load", () => setTimeout(() => { loader.classList.add("done"); setTimeout(() => loader.remove(), 1000); }, 900));
      setTimeout(() => loader && loader.classList.add("done"), 3500);
    }
  }

  /* ---------- шапка, прогресс, бургер ---------- */
  const header = $(".header");
  const progress = $(".progress");
  const railDot = $(".side-rail .line i");
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    if (progress) progress.style.transform = `scaleX(${p})`;
    if (railDot) railDot.style.setProperty("--p", (p * 100).toFixed(1) + "%");
    if (header) {
      header.classList.toggle("scrolled", y > 30);
      header.classList.toggle("hide", y > lastY && y > 400 && !document.body.classList.contains("menu-open"));
    }
    lastY = y;
    $$("[data-parallax]").forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      el.style.transform = `translateY(${(r.top * -0.18).toFixed(1)}px)`;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $(".burger");
  burger && burger.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $$(".nav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  // активный пункт меню
  const page = document.body.dataset.page;
  $$(".nav a").forEach(a => { if (a.dataset.page === page) a.classList.add("active"); });

  /* ---------- появление при прокрутке ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  function observe() { $$(".reveal:not(.in)").forEach(el => io.observe(el)); }
  observe();

  /* ---------- счётчики ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; cio.unobserve(el);
      const to = +el.dataset.count; const dur = 1600; const t0 = performance.now();
      (function tick(t) {
        const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(to * e));
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---------- кастомный курсор ---------- */
  if (matchMedia("(hover: hover)").matches) {
    const c = document.createElement("div"); c.className = "cursor";
    const d = document.createElement("div"); d.className = "cursor-dot";
    document.body.append(c, d);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", e => { x = e.clientX; y = e.clientY; d.style.transform = `translate(${x}px,${y}px)`; });
    (function loop() { cx += (x - cx) * 0.18; cy += (y - cy) * 0.18; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", e => { c.classList.toggle("big", !!e.target.closest("a, button, .hcard, label, summary")); });
  }

  /* ---------- слайдер на главной ---------- */
  const hero = $(".hero");
  if (hero) {
    const slides = $$(".hero-slide", hero);
    const cur = $(".hero-count b", hero);
    const bar = $(".hero-bar", hero);
    let i = 0, timer;
    function go(n) {
      slides[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      hero.dataset.theme = slides[i].dataset.theme;
      cur.textContent = String(i + 1).padStart(2, "0");
      bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run");
      clearTimeout(timer); timer = setTimeout(() => go(i + 1), 7000);
    }
    $(".prev", hero).addEventListener("click", () => go(i - 1));
    $(".next", hero).addEventListener("click", () => go(i + 1));
    go(0);
    // лёгкий параллакс фигуры за мышью
    hero.addEventListener("mousemove", e => {
      const dx = (e.clientX / innerWidth - 0.5), dy = (e.clientY / innerHeight - 0.5);
      $$(".hero-stage", hero).forEach(s => s.style.transform = `translate(${dx * -18}px, ${dy * -12}px)`);
    });
  }

  /* ---------- карточки героев ---------- */
  const roleName = { hero: tr("Герой", "Қаҳрамон", "Hero"), villain: tr("Злодей", "Бадкирдор", "Villain"), anti: tr("Антигерой", "Зидди қаҳрамон", "Antihero") };
  const perHour = tr("смн/час", "смн/соат", "TJS/h");
  const fromW = tr("от", "аз", "from");
  function cardHTML(h) {
    const fig = h.cover
      ? `<img class="fig cover" src="${IMG + h.img}" alt="${h.name}">`
      : `<img class="fig" src="${IMG + h.img}" alt="${h.name}">`;
    const bars = h.stats.map(([k, v]) =>
      `<div class="bar-row"><span>${k}</span><span class="track"><i style="--v:${v}%"></i></span><b>${v}</b></div>`).join("");
    const extra = h.id === "widow" ? `<button class="stone" data-stone="mind" style="right:22px;bottom:84px" aria-label="?"></button>` : "";
    const tip = h.id === "spider" ? `<p class="secret-hint">// ${tr("совет паучка: Shift + клик", "маслиҳати тортанак: Shift + клик", "spidey tip: Shift + click")}</p>` : "";
    return `
    <article class="hcard reveal" data-role="${h.role}" data-id="${h.id}" style="--c1:${h.c1};--c2:${h.c2}">
      <div class="hcard-inner">
        <div class="hcard-face hcard-front">
          <span class="tag t-${h.role}">${roleName[h.role]}</span>
          <div class="big-name">${h.en}</div>
          ${fig}
          <div class="meta">
            <div><h3>${h.name}</h3><small>${h.ages} · ${fromW} ${h.price} ${perHour}</small></div>
            <button class="flip-btn" aria-label="${tr("Подробнее о герое", "Маълумоти бештар", "More about the hero")}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/></svg>
            </button>
          </div>
        </div>
        <div class="hcard-face hcard-back">
          <button class="close flip-btn" aria-label="${tr("Назад", "Бозгашт", "Back")}">✕</button>
          <span class="role">${roleName[h.role]} · ${h.ages}</span>
          <h3>${h.name}</h3>
          <p>${h.desc}</p>
          <div class="bars">${bars}</div>
          ${tip}
          <div class="bottom">
            <div class="price">${h.price}<small> ${perHour}</small></div>
            <a class="btn" href="services.html#calc" data-invite="${h.id}">${tr("Позвать", "Даъват", "Invite")}</a>
          </div>
          ${extra}
        </div>
      </div>
    </article>`;
  }
  window.HS.cardHTML = cardHTML;

  function mountCards(container, list) {
    container.innerHTML = list.map(cardHTML).join("");
    observe();
    $$(".hcard", container).forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.closest(".flip-btn")) { card.classList.toggle("flipped"); act("flip", card.dataset.id); }
      });
      // 3D-наклон за мышью
      card.addEventListener("mousemove", e => {
        if (card.classList.contains("flipped")) return;
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 12;
        $(".hcard-inner", card).style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener("mouseleave", () => { $(".hcard-inner", card).style.transform = ""; });
    });
    $$("[data-invite]", container).forEach(a => a.addEventListener("click", () => {
      const sel = store.get("picked", []);
      if (!sel.includes(a.dataset.invite)) sel.push(a.dataset.invite);
      store.set("picked", sel);
    }));
  }
  // flipped карточка не должна наклоняться
  document.addEventListener("click", e => {
    const card = e.target.closest(".hcard");
    if (card && card.classList.contains("flipped")) $(".hcard-inner", card).style.transform = "";
  });

  const allGrid = $("#heroes-grid");
  if (allGrid && window.HEROES) {
    mountCards(allGrid, HEROES);
    $$(".filters button").forEach(b => b.addEventListener("click", () => {
      $$(".filters button").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      const f = b.dataset.f; act("filter", f);
      $$(".hcard", allGrid).forEach(c => c.classList.toggle("hidden-card", f !== "all" && c.dataset.role !== f));
    }));
  }
  const previewGrid = $("#heroes-preview");
  if (previewGrid && window.HEROES) mountCards(previewGrid, HEROES.filter(h => ["spider", "iron", "panther", "doom"].includes(h.id)));

  /* ---------- подсветка карточек услуг за курсором ---------- */
  $$(".svc").forEach(s => s.addEventListener("mousemove", e => {
    const r = s.getBoundingClientRect();
    s.style.setProperty("--mx", (e.clientX - r.left) + "px");
    s.style.setProperty("--my", (e.clientY - r.top) + "px");
  }));

  /* ---------- калькулятор праздника ---------- */
  const calc = $("#calc-form");
  if (calc && window.HEROES) {
    const picks = $("#pick-heroes");
    const preset = store.get("picked", []);
    picks.innerHTML = HEROES.map(h => `
      <label class="pick" style="--c1:${h.c1};--c2:${h.c2}">
        <input type="checkbox" name="hero" value="${h.id}" ${preset.includes(h.id) ? "checked" : ""}>
        <span class="box">
          <span class="thumb"><img src="${IMG + h.img}" alt="" class="${h.cover ? "cover" : ""}"></span>
          <span class="lbl">${h.name}<small>${h.price} ${perHour}</small></span>
        </span>
      </label>`).join("");
    if (!preset.length) $("input[value=spider]", picks).checked = true;
    store.del("picked");

    $("#pick-extras").innerHTML = EXTRAS.map(x =>
      `<label class="chip"><input type="checkbox" name="extra" value="${x.id}"><span>${x.name} · ${x.price}</span></label>`).join("");

    const hours = $("#hours"), kids = $("#kids");
    const H = tr("ч", "соат", "h");
    const promoIn = $("#promo"), promoMsg = $(".promo-msg");
    let promo = null;
    const PROMOS = {
      DORMAMMU10: { off: 0.10, msg: tr("Дормамму согласился: −10%", "Дормамму розӣ шуд: −10%", "Dormammu agreed: −10%") },
      WAKANDA7: { off: 0.07, msg: tr("Вибраниевая скидка: −7%", "Тахфифи вибраниумӣ: −7%", "Vibranium discount: −7%") },
      SNAP15: { off: 0.15, msg: tr("Половина цены исчезла… почти. −15%", "Нисфи нарх нопадид шуд… қариб. −15%", "Half the price vanished… almost. −15%") }
    };

    function fill(r) { const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty("--fill", p + "%"); }

    function recalc() {
      const chosen = $$("input[name=hero]:checked", calc).map(i => HEROES.find(h => h.id === i.value));
      const ex = $$("input[name=extra]:checked", calc).map(i => EXTRAS.find(x => x.id === i.value));
      const hr = +hours.value, kd = +kids.value;
      $("#hours-out").textContent = hr + " " + H;
      $("#kids-out").textContent = kd;
      fill(hours); fill(kids);

      const heroSum = chosen.reduce((s, h) => s + h.price, 0) * hr;
      const kidsExtra = Math.max(0, kd - 10) * 15;
      const exSum = ex.reduce((s, x) => s + x.price, 0);
      let total = heroSum + kidsExtra + exSum;
      let lines = chosen.map(h => [`${h.name} × ${hr} ${H}`, h.price * hr]);
      if (kidsExtra) lines.push([tr(`Гостей больше 10 (+${kd - 10})`, `Меҳмонон зиёда аз 10 (+${kd - 10})`, `Over 10 guests (+${kd - 10})`), kidsExtra]);
      ex.forEach(x => lines.push([x.name, x.price]));
      if (promo) { const d = Math.round(total * PROMOS[promo].off); lines.push([`${tr("Промокод", "Промокод", "Promo code")} ${promo}`, -d]); total -= d; }
      if (!lines.length) lines.push([tr("Выберите хотя бы одного героя", "Ақаллан як қаҳрамонро интихоб кунед", "Pick at least one hero"), 0]);

      $("#sum-lines").innerHTML = lines.map(([a, b]) => `<div class="line-item"><span>${a}</span><b>${b < 0 ? "−" + fmt(-b) : fmt(b)}</b></div>`).join("");
      $("#sum-total").innerHTML = `${fmt(total)} <small>${CUR_LONG}</small>`;
      calc.dataset.total = total;
      store.set("order", { heroes: chosen.map(h => h.id), hours: hr, kids: kd, extras: ex.map(x => x.id), total, promo });
      document.dispatchEvent(new CustomEvent("hs:total", { detail: total }));
    }
    calc.addEventListener("input", recalc);
    $("#promo-btn").addEventListener("click", () => {
      const code = promoIn.value.trim().toUpperCase();
      if (code === "SNAP15" && !(window.HSecrets && HSecrets.has("snap"))) {
        promoMsg.textContent = tr("Этот код работает только после щелчка перчаткой.", "Ин код танҳо пас аз ширтоси дастпӯшак кор мекунад.", "This code only works after the Gauntlet snap.");
        return;
      }
      if (PROMOS[code]) { promo = code; promoMsg.textContent = "✓ " + PROMOS[code].msg; act("promo", code); }
      else { promo = null; promoMsg.textContent = code ? tr("Такого кода нет даже в мультивселенной.", "Чунин код ҳатто дар мултиолам нест.", "No such code, not even in the multiverse.") : ""; }
      recalc();
    });
    recalc();

    $("#to-book").addEventListener("click", () => { location.href = "contacts.html#book"; });
  }

  /* ---------- форма бронирования ---------- */
  const form = $("#book-form");
  if (form) {
    const order = store.get("order", null);
    const hName = id => (HEROES.find(h => h.id === id) || {}).name;
    const xName = id => (EXTRAS.find(x => x.id === id) || {}).name;
    if (order && order.heroes && order.heroes.length) {
      const hn = order.heroes.map(hName).filter(Boolean), xn = (order.extras || []).map(xName).filter(Boolean);
      $("#f-msg").value = tr(
        `Хочу: ${hn.join(", ")}; ${order.hours} ч; гостей: ${order.kids}` + (xn.length ? `; доп.: ${xn.join(", ")}` : "") + `. Расчёт: ${fmt(order.total)} смн.`,
        `Мехоҳам: ${hn.join(", ")}; ${order.hours} соат; меҳмонон: ${order.kids}` + (xn.length ? `; иловагӣ: ${xn.join(", ")}` : "") + `. Ҳисоб: ${fmt(order.total)} смн.`,
        `I want: ${hn.join(", ")}; ${order.hours} h; guests: ${order.kids}` + (xn.length ? `; extras: ${xn.join(", ")}` : "") + `. Estimate: ${fmt(order.total)} TJS.`);
    }
    if (window.HEROES) {
      $("#f-hero").innerHTML = `<option value="" disabled selected hidden></option>` +
        HEROES.map(h => `<option value="${h.id}">${h.name}</option>`).join("") + `<option value="any">${tr("Пусть решит команда", "Бигзор даста интихоб кунад", "Let the team decide")}</option>`;
      if (order && order.heroes && order.heroes[0]) $("#f-hero").value = order.heroes[0];
    }
    const phone = $("#f-phone");
    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (!d.startsWith("992")) d = "992" + d;
      d = d.slice(0, 12);
      const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
      phone.value = "+" + p.join(" ");
    });
    const date = $("#f-date");
    const today = new Date(); today.setDate(today.getDate() + 1);
    date.min = today.toISOString().slice(0, 10);

    form.addEventListener("submit", e => {
      e.preventDefault();
      let ok = true;
      const check = (el, cond) => { const f = el.closest(".field"); f.classList.toggle("err", !cond); if (!cond) ok = false; };
      check($("#f-name"), $("#f-name").value.trim().length >= 2);
      check(phone, phone.value.replace(/\D/g, "").length === 12);
      check(date, !!date.value);
      check($("#f-hero"), !!$("#f-hero").value);
      if (!ok) return;
      const name = $("#f-name").value.trim();
      const d = new Date(date.value).toLocaleDateString(LOC);
      modal(`
        <svg class="emblem" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#e62429" stroke-width="4"/><path d="M28 52l15 15 30-34" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3>${tr("Сигнал принят!", "Сигнал қабул шуд!", "Signal received!")}</h3>
        <p>${tr(`${name}, ваша заявка улетела на хеликэрриер. Дежурный герой перезвонит в течение 15 минут, чтобы уточнить детали праздника ${d}.`, `${name}, дархости шумо ба хеликэрриер парвоз кард. Қаҳрамони навбатдор дар давоми 15 дақиқа занг мезанад, то тафсилоти ҷашни ${d}-ро аниқ кунад.`, `${name}, your request is on its way to the Helicarrier. The hero on duty will call you within 15 minutes to plan your party on ${d}.`)}</p>
        <button class="btn" data-close>${tr("Отлично!", "Олӣ!", "Awesome!")}</button>`);
      confetti();
      act("book");
      form.reset();
      store.del("order");
    });
  }

  /* ---------- конфетти ---------- */
  function confetti() {
    const cv = document.createElement("canvas");
    Object.assign(cv.style, { position: "fixed", inset: 0, zIndex: 8600, pointerEvents: "none" });
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const cols = ["#e62429", "#1d3ed6", "#f5c518", "#ffffff", "#22e07a", "#a64dff"];
    const ps = Array.from({ length: 180 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 22, vy: -Math.random() * 22 - 6,
      s: Math.random() * 8 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: cols[Math.random() * cols.length | 0]
    }));
    let f = 0;
    (function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.vy += 0.5; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (++f < 200) requestAnimationFrame(draw); else cv.remove();
    })();
  }
  window.HS.confetti = confetti;

  /* ---------- год в футере ---------- */
  $$("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
})();
