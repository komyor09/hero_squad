/* =========================================================
   HSDB — единый слой базы данных для сайта и админки
   ---------------------------------------------------------
   Два режима с одинаковым API:
   · firebase — Firebase Realtime Database (если задан FIREBASE_CONFIG)
   · local    — демо-режим: localStorage этого браузера

   API:
     HSDB.init({ anonymous })   → Promise   (вызвать один раз)
     HSDB.on(path, cb)          → unsubscribe   (cb(value) при каждом изменении)
     HSDB.get(path)             → Promise<value>
     HSDB.set(path, value) / update(path, obj) / remove(path) → Promise
     HSDB.push(path, value)     → Promise<key>
     HSDB.ts()                  → метка времени сервера для записи
     HSDB.now()                 → текущее время с поправкой на сервер (мс)
     HSDB.admin.signIn(email, pass) / signOut() / onChange(cb) / isAdmin()
   ========================================================= */
(function () {
  "use strict";
  const FB_VER = "10.12.2";
  const CFG = window.FIREBASE_CONFIG;
  const ADMINS = (window.HS_ADMIN_EMAILS || []).map(e => String(e).toLowerCase());

  const parts = p => String(p || "").split("/").filter(Boolean);
  const clone = v => v === undefined ? null : JSON.parse(JSON.stringify(v));
  const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* ================= ДЕМО-РЕЖИМ (localStorage) ================= */
  function LocalDB() {
    const KEY = "hsdb_v1";
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
    const write = t => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} };
    const getAt = (t, p) => parts(p).reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), t);
    function setAt(t, p, v) {
      const ks = parts(p);
      if (!ks.length) return v == null ? {} : v;
      let o = t;
      ks.slice(0, -1).forEach(k => { if (!o[k] || typeof o[k] !== "object") o[k] = {}; o = o[k]; });
      const last = ks[ks.length - 1];
      if (v === null || v === undefined) delete o[last]; else o[last] = v;
      return t;
    }
    const listeners = new Set();
    function notify() {
      const tree = read();
      listeners.forEach(l => {
        const v = clone(getAt(tree, l.path));
        const s = JSON.stringify(v);
        if (s !== l.last) { l.last = s; try { l.cb(v); } catch (e) { console.error(e); } }
      });
    }
    let bc = null;
    try { bc = new BroadcastChannel("hsdb"); bc.onmessage = notify; } catch (e) {}
    addEventListener("storage", e => { if (e.key === KEY) notify(); });
    setInterval(notify, 1200);              // запасной вариант: опрос
    function commit(tree) { write(tree); notify(); try { bc && bc.postMessage(1); } catch (e) {} }

    let uid = null;
    try { uid = localStorage.getItem("hsdb_uid"); if (!uid) { uid = "local-" + rid(); localStorage.setItem("hsdb_uid", uid); } } catch (e) { uid = "local-" + rid(); }

    const adminCbs = new Set();
    const adminUser = () => { try { return sessionStorage.getItem("hsdb_admin") ? { email: sessionStorage.getItem("hsdb_admin") } : null; } catch (e) { return null; } };

    return {
      mode: "local",
      uid,
      init: () => Promise.resolve(),
      on(path, cb) {
        const l = { path, cb, last: undefined };
        listeners.add(l);
        const v = clone(getAt(read(), path)); l.last = JSON.stringify(v);
        setTimeout(() => cb(v), 0);
        return () => listeners.delete(l);
      },
      get: path => Promise.resolve(clone(getAt(read(), path))),
      set(path, v) { commit(setAt(read(), path, clone(v))); return Promise.resolve(); },
      update(path, obj) {
        const t = read();
        Object.entries(obj || {}).forEach(([k, v]) => setAt(t, parts(path).concat(parts(k)).join("/"), clone(v)));
        commit(t); return Promise.resolve();
      },
      remove(path) { commit(setAt(read(), path, null)); return Promise.resolve(); },
      push(path, v) { const key = "-" + rid(); commit(setAt(read(), parts(path).concat(key).join("/"), clone(v))); return Promise.resolve(key); },
      ts: () => Date.now(),
      now: () => Date.now(),
      admin: {
        signIn(email, pass) {
          if (pass !== (window.HS_DEMO_PASSWORD || "avengers")) return Promise.reject(new Error("wrong-password"));
          try { sessionStorage.setItem("hsdb_admin", email || "demo"); } catch (e) {}
          adminCbs.forEach(cb => cb(adminUser()));
          return Promise.resolve(adminUser());
        },
        signOut() { try { sessionStorage.removeItem("hsdb_admin"); } catch (e) {} adminCbs.forEach(cb => cb(null)); return Promise.resolve(); },
        onChange(cb) { adminCbs.add(cb); setTimeout(() => cb(adminUser()), 0); return () => adminCbs.delete(cb); },
        isAdmin: () => !!adminUser()
      }
    };
  }

  /* ================= FIREBASE ================= */
  function FirebaseDB() {
    const base = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
    let F = null, db = null, auth = null, offset = 0, user = null;
    const adminCbs = new Set();
    const api = {
      mode: "firebase",
      uid: null,
      async init(opts = {}) {
        const [app, dbm, am] = await Promise.all([
          import(base + "firebase-app.js"), import(base + "firebase-database.js"), import(base + "firebase-auth.js")
        ]);
        F = { ...dbm, ...am };
        const fapp = app.initializeApp(CFG);
        db = dbm.getDatabase(fapp);
        auth = am.getAuth(fapp);
        dbm.onValue(dbm.ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
        await new Promise(res => {
          let first = true;
          am.onAuthStateChanged(auth, async u => {
            user = u;
            api.uid = u ? u.uid : null;
            adminCbs.forEach(cb => cb(api.admin.isAdmin() ? { email: u.email } : null));
            if (first) {
              first = false;
              if (!u && opts.anonymous) { try { await am.signInAnonymously(auth); } catch (e) { console.warn("[HSDB] anonymous auth:", e.message); } }
              res();
            }
          });
        });
        if (opts.anonymous && !api.uid) await new Promise(r => { const t = setInterval(() => { if (api.uid) { clearInterval(t); r(); } }, 100); setTimeout(() => { clearInterval(t); r(); }, 5000); });
      },
      on(path, cb) { return F.onValue(F.ref(db, path), s => cb(s.val()), e => console.warn("[HSDB]", path, e.message)); },
      get: path => F.get(F.ref(db, path)).then(s => s.val()),
      set: (path, v) => F.set(F.ref(db, path), v),
      update: (path, obj) => F.update(F.ref(db, path), obj),
      remove: path => F.remove(F.ref(db, path)),
      push: (path, v) => F.push(F.ref(db, path), v).then(r => r.key),
      ts: () => F.serverTimestamp(),
      now: () => Date.now() + offset,
      admin: {
        signIn: (email, pass) => F.signInWithEmailAndPassword(auth, email, pass).then(c => {
          if (!api.admin.isAdmin()) { F.signOut(auth); throw new Error("not-admin"); }
          return { email: c.user.email };
        }),
        signOut: () => F.signOut(auth),
        onChange(cb) { adminCbs.add(cb); if (auth) setTimeout(() => cb(api.admin.isAdmin() ? { email: user.email } : null), 0); return () => adminCbs.delete(cb); },
        isAdmin: () => !!(user && user.email && ADMINS.includes(user.email.toLowerCase()))
      }
    };
    return api;
  }

  /* ================= ВЫБОР РЕЖИМА ================= */
  const hasCfg = CFG && typeof CFG === "object" && CFG.apiKey && CFG.databaseURL;
  let impl = hasCfg ? FirebaseDB() : LocalDB();
  let readyResolve;
  const ready = new Promise(r => { readyResolve = r; });

  const HSDB = {
    get mode() { return impl.mode; },
    get uid() { return impl.uid; },
    ready,
    async init(opts) {
      try { await impl.init(opts); }
      catch (e) {
        console.warn("[HSDB] Firebase недоступен, включаю демо-режим:", e && e.message);
        impl = LocalDB(); await impl.init(opts);
      }
      readyResolve(HSDB);
      return HSDB;
    },
    on: (p, cb) => impl.on(p, cb),
    get: p => impl.get(p),
    set: (p, v) => impl.set(p, v),
    update: (p, o) => impl.update(p, o),
    remove: p => impl.remove(p),
    push: (p, v) => impl.push(p, v),
    ts: () => impl.ts(),
    now: () => impl.now(),
    admin: {
      signIn: (e, p) => impl.admin.signIn(e, p),
      signOut: () => impl.admin.signOut(),
      onChange: cb => impl.admin.onChange(cb),
      isAdmin: () => impl.admin.isAdmin()
    }
  };
  window.HSDB = HSDB;
})();
