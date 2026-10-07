/* =========================================================
   НАСТРОЙКИ БАЗЫ ДАННЫХ (Firebase Realtime Database)
   ---------------------------------------------------------
   Пока здесь null — сайт работает в «демо-режиме»:
   данные хранятся только в этом браузере (админка и сайт
   видят друг друга, если открыты на одном компьютере).

   Чтобы подключить настоящую базу (телефоны однокурсников
   будут видеть старт квеста и попадать в таблицу лидеров):
   1. Создайте проект на https://console.firebase.google.com
   2. Добавьте веб-приложение (значок </>) и скопируйте объект
      firebaseConfig сюда вместо null.
   Подробная инструкция — в файле docs/FIREBASE_SETUP.md
   ========================================================= */

window.FIREBASE_CONFIG = null;
/* пример:
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "hero-squad-xxxx.firebaseapp.com",
  databaseURL: "https://hero-squad-xxxx-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hero-squad-xxxx",
  storageBucket: "hero-squad-xxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};
*/

/* e-mail администраторов (тот же, что вы создадите в Firebase → Authentication) */
window.HS_ADMIN_EMAILS = ["admin@example.com"];

/* пароль входа в админку в демо-режиме (без Firebase) */
window.HS_DEMO_PASSWORD = "avengers";
