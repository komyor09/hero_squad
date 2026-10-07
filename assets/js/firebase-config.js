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
   Подробная инструкция — в файле FIREBASE_SETUP.md
   ========================================================= */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCzpQfdrep_i5gYi7oOMv037d_G56DUAXk",
  authDomain: "squad-hero-c985c.firebaseapp.com",
  projectId: "squad-hero-c985c",
  storageBucket: "squad-hero-c985c.firebasestorage.app",
  messagingSenderId: "84796389098",
  appId: "1:84796389098:web:d5462ece08cf7d6989c993",
  measurementId: "G-RBD0WNE21Z"
};

/* e-mail администраторов (тот же, что вы создадите в Firebase → Authentication) */
window.HS_ADMIN_EMAILS = ["komyor09@gmail.com"];

/* пароль входа в админку в демо-режиме (без Firebase) */
window.HS_DEMO_PASSWORD = "avengers#2006";
