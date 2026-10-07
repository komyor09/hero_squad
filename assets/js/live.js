/* =========================================================
   LIVE — связь сайта с базой данных (RU / TJ / EN)
   · общий квест: старт/стоп из админки, таймер, имя игрока
   · таблица лидеров в «Миссиях», итоги раунда
   · заявки с формы → база, правки героев и цен ← база
   · объявления ведущего
   ========================================================= */
(function () {
  "use strict";
  const DB = window.HSDB;
  if (!DB || !window.HS) return;
  const { store, toast, $ } = window.HS;
  const T = tr;
  const G = () => window.HGuide;
  const LANG = window.LANG;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // исходные значения героев (чтобы можно было вернуть после правок)
  const BASE = {};
  (window.HEROES || []).forEach(h => { BASE[h.id] = { price: h.price, desc: h.desc }; });

  let quest = null, players = {}, timerId = null, lastSync = 0, syncT = null;

  DB.init({ anonymous: true }).then(start).catch(e => console.warn("[live]", e));

  function start() {
    /* ---------- герои и цены из админки ---------- */
    let sig = "";
    DB.on("heroes", ov => {
      ov = ov || {};
      const s = JSON.stringify(ov);
      if (s === sig) return;
      const first = sig === "";
      sig = s;
      (window.HEROES || []).forEach(h => {
        const b = BASE[h.id], o = ov[h.id] || {};
        const p = Number(o.price);
        h.price = o.price !== undefined && o.price !== "" && Number.isFinite(p) && p >= 0 ? Math.round(p) : b.price;
        h.enabled = o.enabled !== false;
        const d = o.desc && o.desc[LANG];
        h.desc = d ? esc(d) : b.desc;
      });
      if (!(first && s === "{}")) document.dispatchEvent(new Event("hs:heroes"));
    });

    /* ---------- заявки ---------- */
    document.addEventListener("hs:act", e => {
      const { t, v } = e.detail || {};
      if (t !== "book" || !v) return;
      const rec = {
        name: String(v.name || "").slice(0, 60), phone: String(v.phone || "").slice(0, 20),
        date: String(v.date || "").slice(0, 10), hero: String(v.heroName || v.hero || "").slice(0, 40),
        msg: String(v.msg || "").slice(0, 600), lang: LANG, status: "new", createdAt: DB.ts()
      };
      DB.push("bookings", rec).catch(err => console.warn("[live] booking:", err && err.message));
    });

    /* ---------- объявления ---------- */
    DB.on("announce", a => {
      if (!a || !a.id || !a.text) return;
      if (store.get("annSeen", "") === a.id) return;
      if (a.at && DB.now() - a.at > 10 * 60 * 1000) return;
      store.set("annSeen", a.id);
      showAnnounce(a.text);
    });

    /* ---------- квест и лидеры ---------- */
    DB.on("players", p => { players = p || {}; renderBoard(); });
    DB.on("quest", q => { quest = q; onQuest(); });
    document.addEventListener("hs:progress", e => syncMe(e.detail));
  }

  /* ================= КВЕСТ ================= */
  const isRunning = q => !!(q && q.active && (!q.endsAt || DB.now() < q.endsAt));
  const myRound = () => store.get("qround", null);

  function onQuest() {
    clearInterval(timerId);
    const q = quest;
    if (!q || !q.round) { G() && G().setQuest(null); bar(false); return; }
    const running = isRunning(q);
    if (running && myRound() !== q.round) return joinRound(q);
    G() && G().setQuest({ round: q.round, running, finished: !running && !!q.startedAt });
    if (running) {
      bar(true);
      tick();
      timerId = setInterval(tick, 1000);
      if (store.get("qintro", null) === q.round) { store.del("qintro"); countdown(); }
      syncMe(G() ? G().stats() : null, true);
    } else {
      bar(false);
      if (q.startedAt && myRound() === q.round && store.get("qres", null) !== q.round) {
        store.set("qres", q.round);
        setTimeout(showResults, 600);
      }
    }
  }

  function fmtTime(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }
  function tick() {
    const q = quest;
    if (!q) return;
    if (!isRunning(q)) { onQuest(); return; }
    let txt;
    if (q.endsAt) txt = fmtTime(q.endsAt - DB.now());
    else txt = "∞ " + fmtTime(DB.now() - (q.startedAt || DB.now()));
    const b = $(".q-bar");
    if (b) {
      $(".tm", b).textContent = txt;
      $(".tm", b).classList.toggle("low", !!q.endsAt && q.endsAt - DB.now() < 60000);
      const st = G() ? G().stats() : null;
      if (st) $(".xp", b).textContent = st.xp + " XP";
    }
    G() && G().setTimer(txt);
  }

  function bar(on) {
    let b = $(".q-bar");
    if (!b) {
      b = document.createElement("div");
      b.className = "q-bar";
      b.innerHTML = `<span class="dot"></span><span>${T("Квест", "Квест", "Quest")} · <span class="rd"></span></span><span class="tm">--:--</span><span class="xp"></span>`;
      b.addEventListener("click", () => G() && G().openPanel());
      document.body.appendChild(b);
    }
    if (quest) $(".rd", b).textContent = T("раунд ", "давр ", "round ") + quest.round;
    b.classList.toggle("on", on);
  }

  /* --- вход в новый раунд: имя → сброс прогресса → перезагрузка → отсчёт --- */
  function joinRound(q) {
    const go = name => {
      store.set("pname", name);
      G() && G().resetProgress();
      store.set("qround", q.round);
      store.set("qintro", q.round);
      store.del("qres");
      DB.update("players/" + DB.uid, { name, xp: 0, done: 0, total: 18, stones: 0, rank: "", round: q.round, lang: LANG, updated: DB.ts() })
        .catch(() => {}).then(() => location.reload());
    };
    const saved = store.get("pname", "");
    if (saved) return go(saved);
    askName(go);
  }

  function overlay(html) {
    let o = $(".q-over");
    if (!o) { o = document.createElement("div"); o.className = "q-over"; document.body.appendChild(o); }
    o.innerHTML = `<div class="box">${html}</div>`;
    requestAnimationFrame(() => o.classList.add("open"));
    return o;
  }
  const closeOverlay = () => { const o = $(".q-over"); if (o) o.classList.remove("open"); };

  function askName(cb) {
    const o = overlay(`
      <span class="eyebrow" style="color:var(--gold)">${T("Ведущий запустил квест!", "Пешбар квестро оғоз кард!", "The host started the quest!")}</span>
      <h2>${T("Как тебя зовут, герой?", "Номат чист, қаҳрамон?", "What’s your name, hero?")}</h2>
      <p>${T("Имя появится в таблице лидеров на большом экране.", "Ном дар ҷадвали пешсафон дар экрани калон пайдо мешавад.", "Your name will appear on the big-screen leaderboard.")}</p>
      <input maxlength="20" autocomplete="nickname" placeholder="${T("Например: Комёр", "Масалан: Комёр", "e.g. Komyor")}">
      <button class="btn">${T("В бой!", "Ба ҷанг!", "Let’s go!")}</button>`);
    const inp = $("input", o), btn = $(".btn", o);
    setTimeout(() => inp.focus(), 300);
    const ok = () => {
      const v = inp.value.replace(/\s+/g, " ").trim().slice(0, 20);
      if (v.length < 2) { inp.style.borderColor = "#ff4d4d"; inp.focus(); return; }
      btn.disabled = true; cb(v);
    };
    btn.addEventListener("click", ok);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") ok(); e.stopPropagation(); });
  }

  function countdown() {
    const steps = ["3", "2", "1", T("СТАРТ!", "ОҒОЗ!", "GO!")];
    let i = 0;
    const show = () => {
      overlay(`<div class="big">${steps[i]}</div><p>${T("Раунд", "Давр", "Round")} ${quest ? quest.round : ""} · ${esc(store.get("pname", ""))}</p>`);
      i++;
      if (i < steps.length) setTimeout(show, 800);
      else setTimeout(() => { closeOverlay(); G() && G().openPanel(); }, 900);
    };
    show();
  }

  /* --- итоги раунда --- */
  function ranked() {
    const r = quest ? quest.round : null;
    return Object.entries(players || {})
      .map(([id, p]) => ({ id, ...p }))
      .filter(p => p && p.round === r && p.name)
      .sort((a, b) => (b.xp || 0) - (a.xp || 0) || (a.updated || 0) - (b.updated || 0));
  }
  function rowsHTML(list, n) {
    return list.slice(0, n).map((p, i) => `
      <div class="lb-row ${p.id === DB.uid ? "me" : ""}">
        <span class="pl">${i + 1}</span>
        <span class="nm">${esc(p.name)}<small>${p.done || 0}/${p.total || 18} · ◆${p.stones || 0}</small></span>
        <span class="sc">${p.xp || 0} XP</span>
      </div>`).join("");
  }
  function renderBoard() {
    if (!G()) return;
    if (!quest || !quest.round) { G().setBoard(""); return; }
    const list = ranked();
    const meIdx = list.findIndex(p => p.id === DB.uid);
    let html = `<h5>🏆 ${T("Таблица лидеров", "Ҷадвали пешсафон", "Leaderboard")} · ${list.length} ${T("игр.", "бозингар", "players")}</h5>`;
    html += list.length ? `<div>${rowsHTML(list, 10)}</div>` : `<div class="lb-empty">${T("Пока никого нет — будь первым!", "Ҳоло касе нест — аввалин бош!", "Nobody yet — be the first!")}</div>`;
    if (meIdx >= 10) html += `<div class="lb-empty" style="margin-top:6px">${T("Ты на", "Ту дар", "You are")} ${meIdx + 1} ${T("месте", "ҷой", "place")}</div>`;
    G().setBoard(html);
  }
  function showResults() {
    const list = ranked();
    const idx = list.findIndex(p => p.id === DB.uid);
    const me = list[idx] || { xp: G() ? G().stats().xp : 0 };
    const o = overlay(`
      <span class="eyebrow" style="color:var(--gold)">${T("Раунд завершён", "Давр ба охир расид", "Round over")}</span>
      <h2>${idx === 0 ? T("Ты победил! 🏆", "Ту ғолиб шудӣ! 🏆", "You won! 🏆") : T("Квест окончен", "Квест ба охир расид", "Quest over")}</h2>
      <div class="me-score">${me.xp || 0} XP</div>
      <p>${idx >= 0 ? `${T("Твоё место", "Ҷойи ту", "Your place")}: <b>${idx + 1}</b> / ${list.length}` : ""}</p>
      <div class="res">${rowsHTML(list, 5) || `<div class="lb-empty">—</div>`}</div>
      <button class="btn">${T("Закрыть", "Пӯшидан", "Close")}</button>`);
    $(".btn", o).addEventListener("click", closeOverlay);
    if (idx === 0 && window.HS.confetti) window.HS.confetti();
  }

  /* --- синхронизация прогресса игрока --- */
  function syncMe(st, force) {
    if (!st || !isRunning(quest) || myRound() !== quest.round) return;
    const send = () => {
      lastSync = Date.now();
      DB.update("players/" + DB.uid, {
        name: store.get("pname", "Agent").slice(0, 20), xp: st.xp, done: st.done, total: st.total,
        stones: st.stones, rank: String(st.rank || "").slice(0, 40), round: quest.round, lang: LANG, updated: DB.ts()
      }).catch(err => console.warn("[live] sync:", err && err.message));
    };
    clearTimeout(syncT);
    if (force || Date.now() - lastSync > 1500) send(); else syncT = setTimeout(send, 1500);
  }

  /* ================= ОБЪЯВЛЕНИЕ ================= */
  function showAnnounce(text) {
    let a = $(".q-ann");
    if (!a) { a = document.createElement("div"); a.className = "q-ann"; a.addEventListener("click", () => a.classList.remove("on")); document.body.appendChild(a); }
    a.innerHTML = `<small>${T("Сообщение ведущего", "Паёми пешбар", "Message from the host")}</small>${esc(text)}`;
    requestAnimationFrame(() => a.classList.add("on"));
    clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove("on"), 10000);
  }

  window.HLive = { get quest() { return quest; }, ranked };
})();
