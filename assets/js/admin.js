/* =========================================================
   АДМИНКА HERO SQUAD
   квест (старт/стоп/таймер/объявления) · лидеры + проектор
   заявки · герои и цены
   ========================================================= */
(function () {
  "use strict";
  const DB = window.HSDB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const dt = ms => ms ? new Date(ms).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
  const fmt = ms => { const s = Math.max(0, Math.round(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
  const LANGN = { ru: "RU", tg: "TJ", en: "EN" };

  function toast(msg, err) {
    const t = $("#a-toast");
    t.textContent = msg; t.classList.toggle("err", !!err); t.classList.add("on");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2600);
  }
  const fail = e => { console.error(e); toast("Ошибка: " + (e && (e.code || e.message) || e), true); };

  let quest = null, players = {}, bookings = {}, heroesOv = {}, unsub = [], tickT = null;

  DB.init({ anonymous: false }).then(() => {
    $$("[data-mode]").forEach(m => {
      const fb = DB.mode === "firebase";
      m.textContent = fb ? "● Firebase — онлайн" : "● Демо-режим (только этот браузер)";
      m.classList.toggle("fb", fb);
    });
    $("#l-note").innerHTML = DB.mode === "firebase"
      ? "Вход по e-mail и паролю администратора из Firebase → Authentication."
      : `Firebase ещё не подключён — работает демо-режим. Пароль: <b>${esc(window.HS_DEMO_PASSWORD || "avengers")}</b> (меняется в <code>firebase-config.js</code>). Как подключить настоящую базу — в файле FIREBASE_SETUP.md.`;
    DB.admin.onChange(user => user ? showApp(user) : showLogin());
  }).catch(fail);

  /* ================= ВХОД / ВЫХОД ================= */
  function showLogin() {
    unsub.forEach(u => u && u()); unsub = [];
    $("#app").hidden = true; $("#login").hidden = false;
    setTimeout(() => $("#l-email").focus(), 50);
  }
  $("#login-form").addEventListener("submit", e => {
    e.preventDefault();
    $("#l-err").textContent = "";
    const btn = $("#login-form .btn"); btn.disabled = true;
    DB.admin.signIn($("#l-email").value.trim(), $("#l-pass").value)
      .catch(err => {
        const c = (err && (err.code || err.message)) || "";
        $("#l-err").textContent = /not-admin/.test(c) ? "Этот аккаунт не указан в HS_ADMIN_EMAILS (firebase-config.js)."
          : /password|credential|user-not-found|invalid/.test(c) ? "Неверный e-mail или пароль." : "Не удалось войти: " + c;
      })
      .finally(() => { btn.disabled = false; });
  });
  $("#logout").addEventListener("click", () => DB.admin.signOut());

  function showApp(user) {
    $("#login").hidden = true; $("#app").hidden = false;
    $("#u-email").textContent = user.email || "";
    if (unsub.length) return;
    unsub.push(DB.on("quest", q => { quest = q; renderQuest(); renderLeaders(); renderProj(); }));
    unsub.push(DB.on("players", p => { players = p || {}; renderQuest(); renderLeaders(); renderProj(); }));
    unsub.push(DB.on("bookings", b => { bookings = b || {}; renderBookings(); }));
    unsub.push(DB.on("heroes", h => { heroesOv = h || {}; renderHeroes(); }));
    clearInterval(tickT); tickT = setInterval(tick, 1000);
  }

  /* ================= ВКЛАДКИ ================= */
  $$(".a-tabs button").forEach(b => b.addEventListener("click", () => {
    $$(".a-tabs button").forEach(x => x.classList.toggle("on", x === b));
    $$(".a-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === b.dataset.tab));
  }));

  /* ================= КВЕСТ ================= */
  const running = () => !!(quest && quest.active && (!quest.endsAt || DB.now() < quest.endsAt));
  function roundPlayers() {
    const r = quest && quest.round;
    return Object.entries(players).map(([id, p]) => ({ id, ...p })).filter(p => p.name && (!r || p.round === r))
      .sort((a, b) => (b.xp || 0) - (a.xp || 0) || (a.updated || 0) - (b.updated || 0));
  }
  function stateInfo() {
    if (!quest || !quest.round) return ["Свободный режим", "", "Квест выключен — миссии работают у всех как обычно."];
    if (running()) return [`Раунд ${quest.round} идёт`, "run", quest.endsAt ? "до конца раунда" : "без ограничения по времени"];
    if (!quest.startedAt) return ["Режим ожидания", "wait", "Миссии заблокированы. Нажмите «Начать новый раунд»."];
    return [`Раунд ${quest.round} завершён`, "end", "Итоги показаны игрокам. Можно начать следующий раунд."];
  }
  function renderQuest() {
    const [txt, cls, sub] = stateInfo();
    const st = $("#q-state"); st.textContent = txt; st.className = "a-state " + cls;
    $("#q-sub").textContent = sub;
    const list = roundPlayers();
    $("#k-players").textContent = list.length;
    $("#k-avg").textContent = list.length ? Math.round(list.reduce((s, p) => s + (p.xp || 0), 0) / list.length) : 0;
    $("#k-stones").textContent = list.filter(p => (p.stones || 0) >= 6).length;
    $("#cnt-players").textContent = list.length;
    $("#q-stop").disabled = !running();
    $("#q-plus").disabled = !running() || !quest.endsAt;
    tick();
  }
  function timerText() {
    if (!quest || !quest.round) return ["--:--", false];
    if (running()) return quest.endsAt ? [fmt(quest.endsAt - DB.now()), quest.endsAt - DB.now() < 60000] : ["∞ " + fmt(DB.now() - quest.startedAt), false];
    return ["00:00", false];
  }
  let wasRunning = null;
  function tick() {
    const [t, low] = timerText();
    $("#q-timer").textContent = t;
    const pt = $("#p-timer"); pt.textContent = t; pt.classList.toggle("low", low);
    const r = running();
    const changed = wasRunning !== null && wasRunning !== r;
    wasRunning = r;
    if (changed) { renderQuest(); renderProj(); }
  }

  $("#q-start").addEventListener("click", async () => {
    const mins = +$("#q-dur").value;
    const round = ((quest && quest.round) || 0) + 1;
    const now = DB.now();
    try {
      if ($("#q-clear").checked) await DB.remove("players");
      await DB.set("quest", { active: true, round, startedAt: now, endsAt: mins ? now + mins * 60000 : null, duration: mins });
      toast(`Раунд ${round} запущен! У всех игроков начался отсчёт.`);
    } catch (e) { fail(e); }
  });
  $("#q-stop").addEventListener("click", () => {
    if (!quest) return;
    DB.update("quest", { active: false, endsAt: DB.now() }).then(() => toast("Раунд завершён — игроки видят итоги.")).catch(fail);
  });
  $("#q-plus").addEventListener("click", () => {
    if (!quest || !quest.endsAt) return;
    DB.update("quest", { endsAt: quest.endsAt + 5 * 60000 }).then(() => toast("+5 минут")).catch(fail);
  });
  $("#q-wait").addEventListener("click", () => {
    const round = (quest && quest.round) || 0;
    DB.set("quest", { active: false, round: round || 1, startedAt: null, endsAt: null, waiting: true, roundBase: round })
      .then(() => toast("Режим ожидания: миссии заблокированы до старта.")).catch(fail);
  });
  $("#q-free").addEventListener("click", () => {
    if (!confirm("Выключить квест? Миссии снова будут работать у всех без таймера.")) return;
    DB.remove("quest").then(() => toast("Свободный режим включён.")).catch(fail);
  });

  /* объявления */
  function sendAnn(text) {
    text = String(text || "").trim().slice(0, 140);
    if (!text) return toast("Введите текст объявления", true);
    DB.set("announce", { id: Date.now().toString(36), text, at: DB.now() }).then(() => { toast("Объявление отправлено"); $("#ann-text").value = ""; }).catch(fail);
  }
  $("#ann-send").addEventListener("click", () => sendAnn($("#ann-text").value));
  $("#ann-text").addEventListener("keydown", e => { if (e.key === "Enter") sendAnn($("#ann-text").value); });
  $$("[data-ann]").forEach(b => b.addEventListener("click", () => sendAnn(b.dataset.ann)));

  /* ================= ЛИДЕРЫ ================= */
  $("#lb-scope").addEventListener("change", renderLeaders);
  function renderLeaders() {
    const all = $("#lb-scope").value === "all";
    const list = all
      ? Object.entries(players).map(([id, p]) => ({ id, ...p })).filter(p => p.name).sort((a, b) => (b.xp || 0) - (a.xp || 0))
      : roundPlayers();
    const tb = $("#lb-table tbody");
    tb.innerHTML = list.length ? list.map((p, i) => `
      <tr>
        <td class="num">${i + 1}</td><td><b>${esc(p.name)}</b></td><td class="num">${p.xp || 0}</td>
        <td>${p.done || 0}/${p.total || 18}</td><td>◆ ${p.stones || 0}/6</td><td>${esc(p.rank || "")}</td>
        <td>${LANGN[p.lang] || "—"}</td><td>${p.round || "—"}</td><td>${dt(p.updated)}</td>
        <td><button class="a-x" data-del-player="${esc(p.id)}" title="Удалить">✕</button></td>
      </tr>`).join("") : `<tr><td colspan="10" class="empty">Игроков пока нет. Запустите раунд — участники появятся здесь.</td></tr>`;
  }
  $("#lb-table").addEventListener("click", e => {
    const b = e.target.closest("[data-del-player]");
    if (b && confirm("Удалить игрока из таблицы?")) DB.remove("players/" + b.dataset.delPlayer).catch(fail);
  });
  $("#lb-clear").addEventListener("click", () => {
    if (confirm("Очистить всю таблицу лидеров?")) DB.remove("players").then(() => toast("Таблица очищена")).catch(fail);
  });

  /* проектор */
  function openProj() {
    $("#proj").hidden = false; renderProj();
    try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); } catch (e) {}
  }
  function closeProj() { $("#proj").hidden = true; try { document.fullscreenElement && document.exitFullscreen(); } catch (e) {} }
  $("#open-proj").addEventListener("click", openProj);
  $("#open-proj2").addEventListener("click", openProj);
  $("#proj-close").addEventListener("click", closeProj);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#proj").hidden) closeProj(); });
  function renderProj() {
    const [txt] = stateInfo();
    $("#p-state").textContent = txt;
    const list = roundPlayers().slice(0, 10);
    $("#p-list").innerHTML = list.length ? list.map((p, i) => `
      <li><span class="p">${i + 1}</span><span class="n">${esc(p.name)}<small>◆${p.stones || 0} · ${p.done || 0}/${p.total || 18}</small></span><span class="s">${p.xp || 0}</span></li>`).join("")
      : `<li class="none" style="display:block">Сканируйте QR-код и введите имя — вы появитесь здесь</li>`;
  }

  /* ================= ЗАЯВКИ ================= */
  $("#bk-filter").addEventListener("change", renderBookings);
  const STATUS = { new: "Новая", work: "В работе", done: "Выполнена" };
  function bookingList() {
    return Object.entries(bookings).map(([id, b]) => ({ id, ...b })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  function renderBookings() {
    const f = $("#bk-filter").value;
    const all = bookingList();
    $("#cnt-new").textContent = all.filter(b => (b.status || "new") === "new").length;
    const list = f ? all.filter(b => (b.status || "new") === f) : all;
    $("#bk-table tbody").innerHTML = list.length ? list.map(b => `
      <tr class="st-${esc(b.status || "new")}">
        <td>${dt(b.createdAt)}</td><td><b>${esc(b.name)}</b></td>
        <td><a href="tel:${esc(String(b.phone || "").replace(/\s/g, ""))}">${esc(b.phone)}</a></td>
        <td>${esc(b.hero)}</td><td>${esc(b.date ? new Date(b.date).toLocaleDateString("ru-RU") : "—")}</td>
        <td class="msg">${esc(b.msg)}</td><td>${LANGN[b.lang] || "—"}</td>
        <td><select data-status="${esc(b.id)}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${(b.status || "new") === k ? "selected" : ""}>${v}</option>`).join("")}</select></td>
        <td><button class="a-x" data-del-bk="${esc(b.id)}" title="Удалить">✕</button></td>
      </tr>`).join("") : `<tr><td colspan="9" class="empty">Заявок пока нет. Они появятся, когда кто-нибудь отправит форму на странице «Контакты».</td></tr>`;
  }
  $("#bk-table").addEventListener("change", e => {
    const s = e.target.closest("[data-status]");
    if (s) DB.update("bookings/" + s.dataset.status, { status: s.value }).then(() => toast("Статус обновлён")).catch(fail);
  });
  $("#bk-table").addEventListener("click", e => {
    const b = e.target.closest("[data-del-bk]");
    if (b && confirm("Удалить заявку?")) DB.remove("bookings/" + b.dataset.delBk).catch(fail);
  });
  $("#bk-csv").addEventListener("click", () => {
    const rows = [["Получена", "Имя", "Телефон", "Герой", "Дата праздника", "Пожелания", "Язык", "Статус"]]
      .concat(bookingList().map(b => [dt(b.createdAt), b.name, b.phone, b.hero, b.date, b.msg, LANGN[b.lang] || "", STATUS[b.status || "new"]]));
    const csv = "﻿" + rows.map(r => r.map(v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `hero-squad-zayavki-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ================= ГЕРОИ ================= */
  const BASE = (window.HEROES || []).map(h => ({ id: h.id, name: h.name, en: h.en, img: h.img, c1: h.c1, c2: h.c2, price: h.price, desc: h.desc, role: h.role }));
  const ROLE = { hero: "Герой", anti: "Антигерой", villain: "Злодей" };
  const editing = {};   // несохранённые правки, чтобы живое обновление их не затирало
  function renderHeroes() {
    const box = $("#heroes-admin");
    box.innerHTML = BASE.map(h => {
      const o = heroesOv[h.id] || {};
      const e = editing[h.id] || {};
      const en = e.enabled !== undefined ? e.enabled : o.enabled !== false;
      const price = e.price !== undefined ? e.price : (o.price != null ? o.price : "");
      const d = { ru: "", tg: "", en: "", ...(o.desc || {}), ...(e.desc || {}) };
      const changed = Object.keys(o).length ? `<span class="changed">изменён</span>` : "";
      return `<div class="a-card a-hero ${en ? "" : "off"}" data-h="${h.id}" style="--c1:${h.c1};--c2:${h.c2}">
        <div class="top"><img src="assets/img/${h.img}" alt=""><div><b>${esc(h.name)}</b><small>${ROLE[h.role]} · по умолчанию ${h.price} смн/час</small> ${changed}</div></div>
        <div class="bd">
          <label class="a-switch">Показывать на сайте <input type="checkbox" data-f="enabled" ${en ? "checked" : ""}></label>
          <label class="a-field"><span>Цена, смн/час</span><input type="number" min="0" step="10" data-f="price" value="${esc(price)}" placeholder="${h.price}"></label>
          <div class="a-field"><span style="display:flex;justify-content:space-between;align-items:center">Описание
            <span class="a-langs">${["ru", "tg", "en"].map((l, i) => `<button type="button" data-lang="${l}" class="${i ? "" : "on"}">${LANGN[l]}</button>`).join("")}</span></span>
            ${["ru", "tg", "en"].map((l, i) => `<textarea data-desc="${l}" ${i ? "hidden" : ""} placeholder="${l === "ru" ? esc(h.desc) : "по умолчанию (как в исходном переводе)"}">${esc(d[l])}</textarea>`).join("")}
          </div>
          <div class="row2"><button class="a-btn go" data-save>Сохранить</button><button class="a-btn ghost" data-reset>Сбросить</button></div>
        </div>
      </div>`;
    }).join("");
  }
  const box = $("#heroes-admin");
  box.addEventListener("click", e => {
    const card = e.target.closest("[data-h]"); if (!card) return;
    const id = card.dataset.h;
    const lb = e.target.closest("[data-lang]");
    if (lb) {
      $$("[data-lang]", card).forEach(b => b.classList.toggle("on", b === lb));
      $$("[data-desc]", card).forEach(t => { t.hidden = t.dataset.desc !== lb.dataset.lang; });
    }
    if (e.target.closest("[data-save]")) {
      const priceV = $("[data-f=price]", card).value.trim();
      const desc = {};
      $$("[data-desc]", card).forEach(t => { const v = t.value.trim().slice(0, 400); if (v) desc[t.dataset.desc] = v; });
      const rec = { enabled: $("[data-f=enabled]", card).checked, price: priceV === "" ? null : Math.max(0, Math.round(+priceV)), desc: Object.keys(desc).length ? desc : null };
      delete editing[id];
      DB.set("heroes/" + id, rec).then(() => toast("Сохранено — сайт обновился")).catch(fail);
    }
    if (e.target.closest("[data-reset]")) {
      delete editing[id];
      DB.remove("heroes/" + id).then(() => toast("Возвращены значения по умолчанию")).catch(fail);
    }
  });
  box.addEventListener("input", e => {
    const card = e.target.closest("[data-h]"); if (!card) return;
    const id = card.dataset.h, ed = editing[id] = editing[id] || {};
    if (e.target.dataset.f === "enabled") { ed.enabled = e.target.checked; card.classList.toggle("off", !e.target.checked); }
    if (e.target.dataset.f === "price") ed.price = e.target.value;
    if (e.target.dataset.desc) { ed.desc = ed.desc || {}; ed.desc[e.target.dataset.desc] = e.target.value; }
  });
})();
