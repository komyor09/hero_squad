/* =========================================================
   Общие данные + перевод (RU / TJ / EN)
   Язык берётся из <html lang="ru|tg|en">
   ========================================================= */
window.LANG = (document.documentElement.lang || "ru").slice(0, 2);
window.ROOT = document.body ? (document.body.dataset.root || "") : "";
/* tr("рус", "тоҷ", "eng") — вернёт строку на текущем языке */
window.tr = function (ru, tg, en) { return ({ ru: ru, tg: tg, en: en })[window.LANG] || ru; };
/* валюта */
window.CUR = tr("смн", "смн", "TJS");
window.CUR_LONG = tr("сомони", "сомонӣ", "TJS");

window.HEROES = [
  {
    id: "spider", role: "hero", img: "spiderman.jpg", cover: true, c1: "#a10d13", c2: "#0a1a6b", price: 550, en: "Spider-Man",
    name: tr("Человек-паук", "Одам-тортанак", "Spider-Man"),
    ages: tr("3–12 лет", "3–12 сола", "ages 3–12"),
    desc: tr("Акробатика, «паутина» из серпантина, тренировка юных паучков и фото на стене. Самый популярный герой у малышей.",
             "Акробатика, «тор» аз серпантин, машқи тортанакҳои ҷавон ва акс дар девор. Қаҳрамони маҳбубтарини кӯдакон.",
             "Acrobatics, streamer “webs”, training for young spiders and wall-crawling photos. Little ones’ favourite hero."),
    stats: [[tr("Ловкость", "Чолокӣ", "Agility"), 98], [tr("Юмор", "Ҳазл", "Humour"), 85], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 100], [tr("Танцы", "Рақс", "Dance"), 70]]
  },
  {
    id: "iron", role: "hero", img: "ironman.jpg", cover: true, c1: "#b8325c", c2: "#2a0e3d", price: 650, en: "Iron Man",
    name: tr("Железный человек", "Одами оҳанин", "Iron Man"),
    ages: tr("4–14 лет", "4–14 сола", "ages 4–14"),
    desc: tr("Костюм со светящимся реактором, научное шоу с дымом и опытами, «посвящение в инженеры Старка».",
             "Либос бо реактори дурахшон, намоиши илмӣ бо дуд ва таҷрибаҳо, «қабул ба муҳандисони Старк».",
             "A suit with a glowing reactor, a science show with smoke and experiments, and a “Stark engineer” initiation."),
    stats: [[tr("Интеллект", "Зеҳн", "Intellect"), 100], [tr("Юмор", "Ҳазл", "Humour"), 90], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 95], [tr("Шоу", "Намоиш", "Show"), 92]]
  },
  {
    id: "strange", role: "hero", img: "strange.png", c1: "#d2601a", c2: "#3a0d2e", price: 550, en: "Doctor Strange",
    name: tr("Доктор Стрэндж", "Доктор Стрэндж", "Doctor Strange"),
    ages: tr("5–14 лет", "5–14 сола", "ages 5–14"),
    desc: tr("Иллюзии и фокусы, «порталы» из света, магический квест по книге заклинаний. Плащ левитации прилагается.",
             "Найрангу ҷодугарӣ, «порталҳо» аз нур, квести ҷодуӣ аз рӯи китоби афсунҳо. Ҷомаи парвозкунанда ҳам ҳаст.",
             "Illusions and magic tricks, light “portals”, a spell-book quest. Cloak of Levitation included."),
    stats: [[tr("Магия", "Ҷоду", "Magic"), 100], [tr("Юмор", "Ҳазл", "Humour"), 75], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 88], [tr("Загадки", "Чистонҳо", "Riddles"), 95]]
  },
  {
    id: "panther", role: "hero", img: "panther.png", c1: "#6b2bd6", c2: "#140733", price: 500, en: "Black Panther",
    name: tr("Чёрная Пантера", "Паланги Сиёҳ", "Black Panther"),
    ages: tr("4–12 лет", "4–12 сола", "ages 4–12"),
    desc: tr("Танцевальный батл в стиле Ваканды, ритмы на барабанах и полоса препятствий «Испытание короля».",
             "Батли рақсӣ дар услуби Ваканда, зарбҳои нағора ва хатти монеаҳо «Санҷиши подшоҳ».",
             "A Wakanda-style dance battle, drum rhythms and the “King’s Trial” obstacle course."),
    stats: [[tr("Сила", "Қувва", "Strength"), 92], [tr("Ритм", "Ритм", "Rhythm"), 100], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 90], [tr("Танцы", "Рақс", "Dance"), 98]]
  },
  {
    id: "widow", role: "hero", img: "widow.png", c1: "#3b4a6b", c2: "#0d0f1c", price: 500, en: "Black Widow",
    name: tr("Чёрная Вдова", "Бевазани Сиёҳ", "Black Widow"),
    ages: tr("6–14 лет", "6–14 сола", "ages 6–14"),
    desc: tr("Шпионский квест: лазерный коридор из лент, шифры, секретные досье и «академия агентов».",
             "Квести ҷосусӣ: долони лазерӣ аз лентаҳо, рамзҳо, парвандаҳои махфӣ ва «академияи агентҳо».",
             "A spy quest: a ribbon laser corridor, ciphers, secret dossiers and an “agent academy”."),
    stats: [[tr("Стратегия", "Стратегия", "Strategy"), 100], [tr("Юмор", "Ҳазл", "Humour"), 70], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 86], [tr("Квесты", "Квестҳо", "Quests"), 99]]
  },
  {
    id: "wolverine", role: "anti", img: "wolverine.png", c1: "#d6a50a", c2: "#3a2e05", price: 500, en: "Wolverine",
    name: tr("Росомаха", "Вулверин", "Wolverine"),
    ages: tr("6–14 лет", "6–14 сола", "ages 6–14"),
    desc: tr("Силовые конкурсы, армрестлинг с папами и «школа мутантов». Когти — мягкие, поролоновые, честно.",
             "Мусобиқаҳои қувва, панҷазанӣ бо падарон ва «мактаби мутантҳо». Чанголҳо нарм ва поролонӣ, ростӣ.",
             "Strength games, arm-wrestling with dads and a “mutant school”. The claws are soft foam, promise."),
    stats: [[tr("Сила", "Қувва", "Strength"), 97], [tr("Ворчливость", "Ғурғурӣ", "Grumpiness"), 100], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 84], [tr("Выносливость", "Тобоварӣ", "Stamina"), 99]]
  },
  {
    id: "deadpool", role: "anti", img: "deadpool.jpg", cover: true, c1: "#7a0b0b", c2: "#050505", price: 600, en: "Deadpool",
    name: tr("Дэдпул", "Дэдпул", "Deadpool"),
    ages: tr("12+ / подростки", "12+ / наврасон", "12+ / teens"),
    desc: tr("Стендап, импровизация и подколы гостей. Детская версия — без «взрослых» шуток. Только для подростков.",
             "Стендап, импровизатсия ва шӯхӣ бо меҳмонон. Версияи кӯдакона — бе шӯхиҳои «калонсолона». Танҳо барои наврасон.",
             "Stand-up, improv and friendly roasting. Kid-safe version — no “grown-up” jokes. Teens only."),
    stats: [[tr("Юмор", "Ҳазл", "Humour"), 100], [tr("Хаос", "Бесарусомонӣ", "Chaos"), 100], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 80], [tr("Серьёзность", "Ҷиддият", "Seriousness"), 3]]
  },
  {
    id: "doom", role: "villain", img: "doom.png", c1: "#1f4d1a", c2: "#050a05", price: 550, en: "Doctor Doom",
    name: tr("Доктор Дум", "Доктор Дум", "Doctor Doom"),
    ages: tr("злодей для квеста", "бадкирдор барои квест", "quest villain"),
    desc: tr("Главный злодей для квеста: похищает торт, ставит ловушки, а в финале проигрывает детям. Всегда.",
             "Бадкирдори асосии квест: тортро медуздад, дом мегузорад ва дар охир ба кӯдакон мағлуб мешавад. Ҳамеша.",
             "The main quest villain: steals the cake, sets traps, and loses to the kids in the end. Always."),
    stats: [[tr("Злодейство", "Бадкирдорӣ", "Villainy"), 99], [tr("Пафос", "Кибр", "Drama"), 100], [tr("Любовь детей", "Меҳри кӯдакон", "Kids’ love"), 78], [tr("Шансы на победу", "Имкони ғалаба", "Odds of winning"), 0]]
  }
];

window.EXTRAS = [
  { id: "face", price: 200, name: tr("Аквагрим героев", "Аквагрими қаҳрамонон", "Hero face paint") },
  { id: "photo", price: 400, name: tr("Фотограф 1 час", "Суратгир 1 соат", "Photographer, 1 h") },
  { id: "bubbles", price: 350, name: tr("Шоу мыльных пузырей", "Намоиши кафкҳои собун", "Bubble show") },
  { id: "pinata", price: 150, name: tr("Пиньята-щит", "Пиньята-сипар", "Shield piñata") },
  { id: "confetti", price: 120, name: tr("Конфетти-пушка", "Тӯпи конфетти", "Confetti cannon") },
  { id: "deco", price: 700, name: tr("Оформление зала", "Ороиши толор", "Venue decoration") }
];
