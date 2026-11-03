import { createEvents, validateRpg } from "./events.js";
export { eventFeatures } from "./events.js";
import { evaluate, format } from "./math.js";
export const universeFeatures = [
  ["club", "Валюта Σ за вычисления"],
  ["club", "Журнал начислений валюты"],
  ["rewards", "Стрик входов в приложение"],
  ["rewards", "Семидневный календарь наград"],
  ["rewards", "Ежедневные задания"],
  ["rewards", "Награда за серию входов"],
  ["rewards", "Подарок за первое вычисление дня"],
  ["rewards", "Математический сезон"],
  ["rewards", "Сезонная шкала из 12 наград"],
  ["rewards", "Получение сезонных наград"],
  ["club", "Выбор персонажа калькулятора"],
  ["club", "Реплики персонажа на результат"],
  ["club", "Озвучивание персонажа"],
  ["club", "Близость с персонажами за расчёты"],
  ["novel", "Визуальная новелла «Нулевой этаж»"],
  ["novel", "Восемь глав математического сюжета"],
  ["novel", "Выбор пути в новелле"],
  ["novel", "Задачи внутри диалогов"],
  ["novel", "Сохранение сюжетного прогресса"],
  ["novel", "Галерея пройденных глав"],
  ["novel", "Три финала истории"],
  ["arcade", "Игра «Собери 24»"],
  ["arcade", "Игра «Сейф из цифр»"],
  ["arcade", "Игра «Память калькулятора»"],
  ["arcade", "Игра «Ближе к ответу»"],
  ["arcade", "Игра «Чётный сектор»"],
  ["arcade", "Игра «Округление на лету»"],
  ["arcade", "Игра «Двоичный переводчик»"],
  ["arcade", "Игра «Баланс уравнения»"],
  ["arcade", "Игра «Найди ошибку»"],
  ["arcade", "Игра «Дробная перспектива»"],
  ["arcade", "Личные рекорды по каждой игре"],
  ["shop", "Магазин скинов калькулятора"],
  ["shop", "Открытие скинов за Σ"],
  ["shop", "Инвентарь полученных предметов"],
  ["shop", "Применение купленного скина"],
  ["shop", "Математическая капсула со скином"],
  ["shop", "Компенсация повторного предмета"],
  ["shop", "Набор персональных титулов"],
  ["custom", "Эффекты нажатия клавиш"],
  ["custom", "Частицы математических символов"],
  ["custom", "Световой след клавиши"],
  ["custom", "Эффект результата вычисления"],
  ["custom", "Фейерверк из чисел"],
  ["custom", "Анимация появления ответа"],
  ["custom", "Шрифты числового дисплея"],
  ["custom", "Оформление символа равенства"],
  ["custom", "Настройка громкости звуков"],
  ["custom", "Четыре фоновые музыкальные темы"],
  ["custom", "Синтезируемая фоновая музыка"],
  ["custom", "Выбор тембра клавиатуры"],
  ["custom", "Настройка голоса персонажа"],
  ["offers", "Рекламная витрина калькулятора"],
  ["offers", "Награда за просмотр карточки"],
  ["offers", "Калькулятор стоимости ворот"],
  ["offers", "Калькулятор бюджета документов"],
  ["offers", "Калькулятор стоимости путёвки"],
  ["offers", "Калькулятор перевозки вещей"],
  ["offers", "Калькулятор теплицы"],
  ["offers", "Калькулятор ремонта балкона"],
  ["offers", "Калькулятор водоснабжения дачи"],
  ["offers", "Калькулятор семейного отпуска"],
  ["club", "Поддержка клуба за внутреннюю валюту"],
  ["club", "Личный статус мецената вычислений"],
  ["inbox", "Центр уведомлений вычислений"],
  ["inbox", "Отметки о прочитанных уведомлениях"],
  ["club", "Коллекционные карточки констант"],
  ["club", "Открытие карточек за опыт"],
  ["rewards", "Награды за сюжетные главы"],
  ["custom", "Светлая и тёмная тема скина"],
  ["club", "Избранное число профиля"],
  ["rewards", "Трекер изученных инструментов"],
].map(([view, title], i) => ({ id: "u" + i, view, title }));
const characters = [
  {
    id: "sigma",
    name: "Сигма",
    symbol: "Σ",
    role: "Хранительница суммы",
    color: "#c7adf5",
    bio: "Собирает разрозненные вычисления в одну историю. Не любит незакрытые скобки.",
    lines: [
      "Скобки закрыты. Можем жить дальше.",
      "Ответ записала. На случай, если передумаешь.",
      "В этом результате есть определённость.",
    ],
  },
  {
    id: "phi",
    name: "Фи",
    symbol: "φ",
    role: "Архитектор пропорций",
    color: "#d9dfaf",
    bio: "Чертит идеальные лестницы и спорит с прямыми углами. Отношения считает в пропорциях.",
    lines: [
      "Соотношение выглядит устойчивым.",
      "Я бы добавил здесь немного симметрии.",
      "Этот ответ впишется в план.",
    ],
  },
  {
    id: "delta",
    name: "Дельта",
    symbol: "Δ",
    role: "Курьер перемен",
    color: "#eac0a3",
    bio: "Замечает, насколько всё изменилось. Вечно в пути между «было» и «стало».",
    lines: [
      "Разница ощутимая. Двигаемся дальше.",
      "Считай это новой точкой отсчёта.",
      "Пересчитала маршрут. Выходим.",
    ],
  },
  {
    id: "zero",
    name: "Ноль",
    symbol: "0",
    role: "Смотритель начала",
    color: "#b3d5ec",
    bio: "Знает, что отсутствие результата тоже бывает результатом. Держит ключ от нулевого этажа.",
    lines: [
      "Запомни это число. Оно ещё пригодится.",
      "Мы уже были здесь. Только ответ был другим.",
      "У любого счёта есть начало.",
    ],
  },
];
const skins = [
  ["surface", "Surface 01", "#b9a1ff", "surface", 0, "Базовый материал"],
  ["sage", "Шалфей", "#c5dca7", "surface", 45, "Мягкий зелёный"],
  ["clay", "Обожжённая глина", "#d9ac91", "surface", 45, "Тёплая поверхность"],
  ["ice", "Ледник", "#abd2eb", "midnight", 60, "Холодное свечение"],
  ["rose", "Кварц", "#e0aecb", "surface", 60, "Дымчатый розовый"],
  ["graphite", "Графит", "#c6c6cc", "graphite", 75, "Сдержанный монохром"],
  ["gold", "Латунь", "#dfcf99", "graphite", 90, "Тонкое золотое ребро"],
  ["paper", "Бюро", "#bbaa94", "paper", 60, "Бумага и чернила"],
  ["cobalt", "Кобальт", "#91b2f0", "midnight", 100, "Ночной синий"],
  ["plum", "Слива", "#d2a3e7", "surface", 100, "Глубокий фиолетовый"],
  ["amber", "Янтарь", "#e6bc7d", "graphite", 120, "Прогретый свет"],
  ["mint", "Мятный лёд", "#a4e2d4", "midnight", 120, "Прозрачный холод"],
  ["ink", "Чернильный", "#8f9ee1", "midnight", 140, "Для поздних расчётов"],
  ["porcelain", "Фарфор", "#c4abc9", "paper", 140, "Светлая керамика"],
  ["mono", "Монохром", "#e4dfd4", "graphite", 150, "Ни одного лишнего оттенка"],
  [
    "aurora",
    "Полярное сияние",
    "#9fe4c7",
    "midnight",
    180,
    "Редкая поверхность",
  ],
].map(([id, name, color, theme, price, desc]) => ({
  id,
  name,
  color,
  theme,
  price,
  desc,
}));
const chapters = [
  {
    title: "Лифт на нулевой этаж",
    place: "Подъезд / 00:00",
    speaker: "zero",
    text: "На панели лифта нет кнопки первого этажа. Вместо неё — пустое равенство. Ноль держит дверь. «Здесь всё открывается через расчёт. Даже то, что обычно открывается ключом».",
    question: "Чтобы включить панель, найдите сумму: 18 + 24.",
    answer: 42,
    options: [
      "Попросить Ноля остаться рядом",
      "Самостоятельно осмотреть панель",
    ],
    next: "Панель загорается. На экране появляется этаж −1. Ниже нулевого тоже что-то есть.",
  },
  {
    title: "Ведомость пропавших единиц",
    place: "Архив / сектор Σ",
    speaker: "sigma",
    text: "Сигма раскладывает квитанции на длинном столе. «Из каждой суммы исчезает единица. Сначала никто не замечал. Теперь мост в городе короче проекта на целый метр». Она пододвигает вам первую ведомость.",
    question: "В ведомости 125, 240 и 135. Какова общая сумма?",
    answer: 500,
    options: ["Передать ведомость Сигме", "Оставить себе копию"],
    next: "Сумма сходится. Но подпись внизу листа поставлена вашим почерком.",
  },
  {
    title: "Пропорция доверия",
    place: "Мастерская / сектор φ",
    speaker: "phi",
    text: "Фи рисует мост на запотевшем стекле. «Мы можем построить обход. Но сначала нужно понять масштаб. Одна ошибка в чертеже — и кто-то снова не дойдёт до другого берега».",
    question: "На чертеже 3 см соответствуют 12 метрам. Сколько метров в 7 см?",
    answer: 28,
    options: ["Строить по плану Фи", "Проверить масштаб ещё раз"],
    next: "На чертеже появляется новая линия. Она ведёт не к мосту, а к архиву.",
  },
  {
    title: "Разница между вчера и завтра",
    place: "Вокзал / сектор Δ",
    speaker: "delta",
    text: "Дельта ждёт у пустого табло. «Каждый поезд привозит меньше людей, чем увёз. Они не пропадают. Просто выходят в другом расчёте». Она показывает два показания счётчика.",
    question:
      "Вчера счётчик показывал 840, сегодня 1 050. На сколько процентов он вырос?",
    answer: 25,
    options: ["Отправиться с Дельтой", "Вернуться к смотрителю"],
    next: "Табло меняет расписание. Следующий поезд прибывает вчера в 23:59.",
  },
  {
    title: "Проценты тишины",
    place: "Касса / закрыто",
    speaker: "sigma",
    text: "За стеклом кассы лежит ваш билет. На нём две скидки и ни одного пункта назначения. Сигма тихо говорит: «Не складывай проценты. Здесь это уже однажды сделали».",
    question:
      "Билет стоит 1 000. Скидка 20%, затем 25% от остатка. Итоговая цена?",
    answer: 600,
    options: ["Купить билет для двоих", "Передать билет другому"],
    next: "В билете появляется направление: «Нулевой этаж. Обратный путь».",
  },
  {
    title: "Квадрат пустой комнаты",
    place: "Комната 16",
    speaker: "phi",
    text: "В комнате четыре одинаковые стены. На полу — следы мебели, которой здесь не было. Фи считает шаги. «Площадь сохранилась. Исчезло только назначение».",
    question: "Квадратная комната имеет периметр 32 м. Какова её площадь?",
    answer: 64,
    options: [
      "Вернуть комнате прежнее назначение",
      "Оставить место для нового",
    ],
    next: "В стене открывается дверь. За ней слышен звук нажатия клавиши равенства.",
  },
  {
    title: "Последнее неизвестное",
    place: "Машинный зал / x",
    speaker: "delta",
    text: "В центре зала висит незавершённое уравнение. Дельта больше не торопится. «Мы всё время искали пропавшее число. А оно было неизвестным. Его просто никто не решился найти».",
    question: "Решите уравнение: 3x + 12 = 75. Чему равен x?",
    answer: 21,
    options: [
      "Сохранить все старые вычисления",
      "Разрешить городу начать заново",
    ],
    next: "Уравнение принимает ответ. Все двери в зале открываются одновременно.",
  },
  {
    title: "То, что остаётся",
    place: "Нулевой этаж / утро",
    speaker: "zero",
    text: "Ноль выключает лифт. «У нас было четыре числа. Мы их складывали, делили, теряли. Теперь нужно решить, что останется с нами». Впервые на панели нет неизвестных.",
    question: "Среднее арифметическое чисел 4, 8, 12 и 16?",
    answer: 10,
    options: [
      "Оставить открытый архив для всех",
      "Построить новый мост вместе",
      "Уйти, сохранив ключ",
    ],
    next: "Утром город снова совпадает со своим чертежом.",
  },
];
const campaigns = [
  {
    id: "gate",
    brand: "КОНТУР / ВОРОТА",
    title: "Проём известен.<br>Осталось посчитать.",
    text: "Откатные ворота для участка. Рассчитайте полотно, привод и монтаж под ваш проём.",
    mark: "4,0 м",
    color: "green",
    inputs: ["Ширина проёма, м", "Цена полотна за метр", "Привод", "Монтаж"],
    values: [4, 9500, 18000, 12000],
    formula: (v) => v[0] * v[1] + v[2] + v[3],
    note: "Предварительная модель: ширина × цена метра + привод + монтаж.",
  },
  {
    id: "passport",
    brand: "ДОКУМЕНТ / ПЛАН",
    title: "Поездка начинается<br>с документов.",
    text: "Соберите бюджет подготовки загранпаспорта: пошлина, фотографии и дорога.",
    mark: "10 лет",
    color: "blue",
    inputs: [
      "Пошлина по вашему тарифу",
      "Фотографии",
      "Дорога",
      "Дополнительные расходы",
    ],
    values: [0, 500, 300, 0],
    formula: (v) => v.reduce((a, b) => a + b, 0),
    note: "Размер пошлины укажите самостоятельно по действующему тарифу. Заявления и документы здесь не принимаются.",
  },
  {
    id: "travel",
    brand: "СЕВЕР—ЮГ / МАРШРУТЫ",
    title: "Море ближе,<br>когда есть расчёт.",
    text: "Разложите стоимость путёвки на дорогу, проживание и ежедневные расходы.",
    mark: "7 ночей",
    color: "peach",
    inputs: [
      "Дорога на человека",
      "Человек",
      "Ночей",
      "Жильё за ночь",
      "Дневной бюджет семьи",
    ],
    values: [12000, 2, 7, 4500, 3500],
    formula: (v) => v[0] * v[1] + v[2] * (v[3] + v[4]),
    note: "Расчёт бюджета по вашим значениям. Бронирования и продажи путёвок на странице нет.",
  },
  {
    id: "move",
    brand: "КУБАТУРА / ПЕРЕЕЗД",
    title: "У каждой коробки<br>есть свой объём.",
    text: "Посчитайте машину, грузчиков и маршрут до нового адреса.",
    mark: "12 м³",
    color: "lavender",
    inputs: [
      "Машина, цена в час",
      "Часов",
      "Число грузчиков",
      "Грузчик, цена в час",
      "Доплата за маршрут",
    ],
    values: [1200, 4, 2, 700, 1500],
    formula: (v) => v[0] * v[1] + v[1] * v[2] * v[3] + v[4],
    note: "Модель переезда: машина и работа по часам плюс маршрут.",
  },
  {
    id: "greenhouse",
    brand: "РАССАДА / КОНСТРУКЦИИ",
    title: "Дачный сезон<br>любит точность.",
    text: "Прикиньте стоимость теплицы по площади и комплекту основания.",
    mark: "3 × 6",
    color: "green",
    inputs: ["Ширина, м", "Длина, м", "Цена за м²", "Основание и сборка"],
    values: [3, 6, 2400, 8000],
    formula: (v) => v[0] * v[1] * v[2] + v[3],
    note: "Ширина × длина × цена за квадратный метр плюс основание.",
  },
  {
    id: "balcony",
    brand: "ТЁПЛЫЙ КОНТУР / БАЛКОН",
    title: "Ещё несколько<br>полезных метров.",
    text: "Сравните площадь отделки и стоимость работ без звонков и замеров.",
    mark: "6 м²",
    color: "peach",
    inputs: [
      "Площадь отделки, м²",
      "Материалы за м²",
      "Работа за м²",
      "Дополнительные расходы",
    ],
    values: [6, 2500, 1800, 10000],
    formula: (v) => v[0] * (v[1] + v[2]) + v[3],
    note: "Площадь × (материалы + работа) + дополнительные расходы.",
  },
  {
    id: "water",
    brand: "ГЛУБИНА / ВОДА НА УЧАСТКЕ",
    title: "Вода на даче.<br>Цифры на поверхности.",
    text: "Глубина, бурение, насос и обвязка в одной смете.",
    mark: "35 м",
    color: "blue",
    inputs: ["Глубина, м", "Цена бурения за метр", "Насос", "Обвязка"],
    values: [35, 3200, 18000, 25000],
    formula: (v) => v[0] * v[1] + v[2] + v[3],
    note: "Глубина × цена метра + насос + обвязка. Геология может изменить фактическую стоимость.",
  },
  {
    id: "holiday",
    brand: "ВЫХОДНЫЕ / СЕМЕЙНЫЙ КЛУБ",
    title: "Выходные<br>без неизвестных.",
    text: "Билеты, прогулки и семейный обед. Составьте бюджет короткого путешествия.",
    mark: "2 дня",
    color: "lavender",
    inputs: [
      "Билеты на человека",
      "Человек",
      "Жильё",
      "Питание",
      "Развлечения",
    ],
    values: [2500, 3, 9000, 7000, 4000],
    formula: (v) => v[0] * v[1] + v[2] + v[3] + v[4],
    note: "Личный бюджет поездки по введённым ценам.",
  },
];
const titles = [
  ["Студент бесконечности", 30],
  ["Хранитель скобок", 40],
  ["Министр процентов", 60],
  ["Архитектор равенств", 80],
  ["Академик нулевого этажа", 100],
  ["Главный по запятой", 120],
];
export function createUniverse(ui) {
  const { icon, esc, btn, openModal, closeModal, toast, navigate } = ui,
    $ = (s) => document.querySelector(s);
  const defaults = {
    coins: 40,
    ledger: [{ text: "Стартовый баланс", amount: 40, date: Date.now() }],
    visits: [],
    claims: [],
    questClaims: [],
    seasonClaims: [],
    owned: ["surface"],
    skin: "surface",
    character: "sigma",
    affinity: { sigma: 0, phi: 0, delta: 0, zero: 0 },
    clickFx: "ripple",
    resultFx: "sweep",
    font: "default",
    equal: "=",
    volume: 25,
    track: "lofi",
    timbre: "soft",
    voice: false,
    music: false,
    title: "",
    ownedTitles: [],
    novel: { chapter: 0, choices: [], complete: false, ending: null },
    arcadeScores: {},
    arcadePlayed: 0,
    support: 0,
    ads: {},
    cards: [],
    notifications: [],
    readNotifications: [],
    favoriteNumber: 42,
    daily: {},
    capsules: 0,
  };
  const get = () => ui.getState();
  if (!get().universe) get().universe = {};
  let u = { ...defaults, ...get().universe };
  u.affinity = { ...defaults.affinity, ...u.affinity };
  u.novel = { ...defaults.novel, ...u.novel };
  get().universe = u;
  const today = () => new Date().toLocaleDateString("sv-SE");
  let currentGame = null,
    adTimer = null,
    audio = null,
    musicTimer = null,
    storyRevealTimer = null;
  function save() {
    get().universe = u;
    ui.persist();
    apply();
  }
  function note(title, text) {
    u.notifications.unshift({
      id: crypto.randomUUID(),
      title,
      text,
      date: Date.now(),
    });
    u.notifications = u.notifications.slice(0, 80);
  }
  function credit(amount, text) {
    if (!Number.isFinite(amount) || u.coins + amount < 0) return false;
    u.coins += amount;
    u.ledger.unshift({ text, amount, date: Date.now() });
    u.ledger = u.ledger.slice(0, 150);
    save();
    return true;
  }
  function visitStreak() {
    let n = 0,
      d = new Date();
    while (u.visits.includes(d.toLocaleDateString("sv-SE"))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  if (!u.visits.includes(today())) {
    u.visits.push(today());
    note(
      "Снова в расчёте",
      `День ${visitStreak()} подряд. Награда за вход ждёт в календаре.`,
    );
    save();
  }
  function daily() {
    if (!u.daily[today()])
      u.daily[today()] = { calculations: 0, games: 0, ads: 0, stories: 0 };
    return u.daily[today()];
  }
  function apply() {
    let d = document.documentElement;
    d.dataset.calcFont = u.font;
    d.dataset.equal = u.equal;
    d.style.setProperty("--effect-accent", get().settings.accent);
    d.style.setProperty("--companion-color", character().color);
  }
  function character() {
    return characters.find((c) => c.id === u.character) || characters[0];
  }
  function head(title, sub) {
    return `<div class="page-heading"><div><div class="eyebrow">КЛУБ ВЫЧИСЛЕНИЙ / AORI</div><h1>${title}</h1><p>${sub}</p></div><button class="coin-wallet" data-action="u-ledger"><span>Σ</span> ${u.coins}</button></div>${subnav()}`;
  }
  function subnav() {
    return `<nav class="verse-tabs" aria-label="Разделы клуба">${[
      ["club", "Клуб"],
      ["rewards", "Награды"],
      ["shop", "Магазин"],
      ["custom", "Эффекты и звук"],
      ["novel", "Новелла"],
      ["arcade", "Игровой зал"],
      ["offers", "Витрина"],
      ["inbox", "Входящие"],
    ]
      .map(([v, t]) => btn(t, "nav", "chip", `data-view="${v}"`))
      .join("")}</nav>`;
  }
  function coin(amount = 0) {
    return `<span class="coin-inline">Σ ${amount}</span>`;
  }
  function home() {
    return `<section class="club-strip surface"><button data-action="nav" data-view="club" class="club-companion"><span class="mini-character" style="--character-color:${character().color}">${character().symbol}</span><span><b>${character().name} на связи</b><small>${u.title ? esc(u.title) : "Расчёты повышают вашу близость"}</small></span></button><button data-action="nav" data-view="rewards">${icon("flame")}<b>${visitStreak()}</b><small>входов подряд</small></button><button data-action="nav" data-view="shop"><span class="coin-glyph">Σ</span><b>${u.coins}</b><small>баланс</small></button><button data-action="nav" data-view="novel">${icon("learn")}<b>${Math.min(u.novel.chapter + 1, 8)}/8</b><small>Нулевой этаж</small></button></section>`;
  }
  function club() {
    let c = character();
    return (
      head(
        "Калькулятор, в котором живут.",
        "Персонажи, коллекции и всё, что вы успели накопить между вычислениями.",
      ) +
      `<div class="club-layout"><section class="surface companion-card"><span class="eyebrow">ВАШ СПУТНИК ВЫЧИСЛЕНИЙ</span><div class="character-portrait" style="--character-color:${c.color}"><span>${c.symbol}</span><i></i><em>0${characters.indexOf(c) + 1}</em></div><div class="companion-info"><h2>${c.name}</h2><span class="tag">${c.role}</span><p>${c.bio}</p><div class="affinity-line"><span>Близость ${u.affinity[c.id] || 0}</span><span>Уровень ${Math.floor((u.affinity[c.id] || 0) / 20) + 1}</span></div><div class="progress-track"><i style="width:${((u.affinity[c.id] || 0) % 20) * 5}%"></i></div>${btn("Поговорить", "u-talk", "secondary")}${btn(icon("settings") + " Голос и звук", "nav", "text-button", 'data-view="custom"')}</div></section><section class="surface club-passport"><span class="eyebrow">ЛИЧНОЕ ДЕЛО ВЫЧИСЛИТЕЛЯ</span><h3>${esc(get().name)}</h3><p>${u.title ? esc(u.title) : "Титул ещё не выбран"}</p><div class="club-passport-grid"><div><b>${u.coins}</b><small>единиц Σ</small></div><div><b>${u.owned.length}</b><small>скинов</small></div><div><b>${u.arcadePlayed}</b><small>попыток в аркаде</small></div><div><b>${u.support}</b><small>Σ на развитие клуба</small></div></div><label class="favorite-number">Ваше избранное число<input id="u-favorite-number" type="number" value="${u.favoriteNumber}" step="any"></label>${btn("Поддержать клуб за Σ", "u-support", "secondary")}${btn("История баланса " + icon("arrow"), "u-ledger", "text-button")}</section></div><div class="section-heading"><h2>С кем считать дальше</h2><span class="muted">Выбор спутника меняет реплики и голос</span></div><div class="characters-grid">${characters.map((c) => `<article class="surface character-card"><div class="character-bust" style="--character-color:${c.color}">${c.symbol}</div><span class="eyebrow">${c.role}</span><h3>${c.name}</h3><p>${c.bio}</p>${btn(u.character === c.id ? "Выбран" : "Позвать с собой", "u-character", u.character === c.id ? "secondary" : "primary", `data-id="${c.id}"`)}</article>`).join("")}</div><div class="section-heading"><h2>Картотека констант</h2><span class="muted">Открываются по мере накопления опыта</span></div><div class="constant-grid">${[
        ["π", Math.PI, 0, "Архимедова константа"],
        ["e", Math.E, 40, "Основание натурального логарифма"],
        ["φ", (1 + Math.sqrt(5)) / 2, 90, "Золотое сечение"],
        ["√2", Math.SQRT2, 160, "Диагональ единичного квадрата"],
        ["τ", 2 * Math.PI, 250, "Полный оборот в радианах"],
        ["γ", 0.5772156649015329, 400, "Постоянная Эйлера — Маскерони"],
      ]
        .map(
          ([s, v, xp, t], i) =>
            `<button class="surface constant-card ${get().xp < xp ? "locked" : ""}" data-action="u-constant" data-index="${i}"><span>${get().xp >= xp ? s : "?"}</span><b>${get().xp >= xp ? esc(format(v, 10)) : xp + " XP"}</b><small>${t}</small></button>`,
        )
        .join("")}</div>`
    );
  }
  function rewards() {
    let streak = visitStreak(),
      todayClaim = u.claims.includes(today()),
      qs = quests();
    return (
      head(
        "Привычка складывается.",
        "Награды за входы, вычисления и знакомство с инструментами.",
      ) +
      `<section class="surface login-reward"><div><span class="eyebrow">СЕРИЯ ВХОДОВ</span><h2>${streak} ${streak === 1 ? "день" : "дней"} подряд</h2><p>Вход считается сразу при открытии приложения. Вычисления ведут свою отдельную серию.</p></div><button class="primary" data-action="u-login" ${todayClaim ? "disabled" : ""}>${todayClaim ? "Сегодня получено" : `Забрать ${loginReward()} Σ`}</button></section><div class="login-calendar">${Array.from({ length: 7 }, (_, i) => `<div class="surface calendar-day ${(streak - 1) % 7 === i ? "current" : ""}"><small>ДЕНЬ ${i + 1}</small><b>Σ ${[10, 15, 20, 25, 30, 40, 70][i]}</b><span>${i < (streak - 1) % 7 ? "Пройден" : i === (streak - 1) % 7 ? "Сегодня" : "Впереди"}</span></div>`).join("")}</div><div class="section-heading"><h2>Сегодня в плане</h2><span class="muted">Задания обновляются в полночь на вашем устройстве</span></div><div class="quest-grid">${qs.map((q) => `<article class="surface quest"><div><span class="eyebrow">${q.type}</span><h3>${q.title}</h3><p>${q.desc}</p></div><div class="quest-progress"><span>${Math.min(q.current, q.target)} / ${q.target}</span><span>${coin(q.reward)}</span></div><div class="progress-track"><i style="width:${Math.min(100, (q.current / q.target) * 100)}%"></i></div>${btn(u.questClaims.includes(today() + q.id) ? "Получено" : q.current >= q.target ? "Получить награду" : "Открыть", "u-quest", q.current >= q.target ? "primary" : "secondary", `data-id="${q.id}" ${u.questClaims.includes(today() + q.id) ? "disabled" : ""}`)}</article>`).join("")}</div><div class="section-heading"><h2>Сезон 01 / Общий знаменатель</h2><span class="muted">Открывайте этапы за XP</span></div><div class="season-grid">${Array.from(
        { length: 12 },
        (_, i) => {
          let xp = (i + 1) * 50,
            value = 15 + i * 5,
            claimed = u.seasonClaims.includes(i);
          return `<article class="surface season-step ${get().xp >= xp ? "available" : ""}"><span class="season-index">${String(i + 1).padStart(2, "0")}</span><small>${xp} XP</small><b>${coin(value)}</b>${btn(claimed ? "Получено" : get().xp >= xp ? "Забрать" : "Закрыто", "u-season", "secondary", `data-index="${i}" ${claimed || get().xp < xp ? "disabled" : ""}`)}</article>`;
        },
      ).join("")}</div>`
    );
  }
  function loginReward() {
    return [10, 15, 20, 25, 30, 40, 70][(visitStreak() - 1) % 7];
  }
  function quests() {
    let d = daily();
    return [
      {
        id: "calc",
        type: "ПРАКТИКА",
        title: "Пять точных действий",
        desc: "Выполните пять расчётов сегодня.",
        current: d.calculations,
        target: 5,
        reward: 15,
        view: "calc",
      },
      {
        id: "game",
        type: "ТРЕНИРОВКА",
        title: "Разогреть память",
        desc: "Завершите две попытки в игровом зале.",
        current: d.games,
        target: 2,
        reward: 20,
        view: "arcade",
      },
      {
        id: "explore",
        type: "ИССЛЕДОВАНИЕ",
        title: "За пределами четырёх действий",
        desc: "Откройте десять разных расчётных инструментов.",
        current: get().used.filter((v) => v.startsWith("t")).length,
        target: 10,
        reward: 25,
        view: "tools",
      },
      {
        id: "story",
        type: "ИСТОРИЯ",
        title: "Один расчёт в эфир",
        desc: "Создайте историю с формулой сегодня.",
        current: d.stories,
        target: 1,
        reward: 15,
        view: "community",
      },
      {
        id: "chapter",
        type: "СЮЖЕТ",
        title: "Спуститься на этаж",
        desc: "Пройдите первую главу новеллы.",
        current: u.novel.chapter,
        target: 1,
        reward: 25,
        view: "novel",
      },
      {
        id: "pause",
        type: "ВИТРИНА",
        title: "Посчитать чужую смету",
        desc: "Посмотрите одну рекламную карточку до конца.",
        current: d.ads,
        target: 1,
        reward: 10,
        view: "offers",
      },
    ];
  }
  function shop() {
    return (
      head(
        "Поверхность на ваш вкус.",
        "Скины и титулы приобретаются за Σ, заработанные внутри калькулятора.",
      ) +
      `<section class="surface capsule-banner"><div><span class="eyebrow">КАПСУЛА ВЫЧИСЛЕНИЙ</span><h2>Один из 16 материалов.</h2><p>Случайный скин за 35 Σ. Повтор возвращает 20 Σ. Реальные деньги не используются.</p></div><div class="capsule-object" aria-hidden="true">∑</div>${btn("Открыть за 35 Σ", "u-capsule", "primary")}</section><div class="section-heading"><h2>Материалы клавиатуры</h2><span class="muted">${u.owned.length} / ${skins.length} в коллекции</span></div><div class="skin-grid">${skins.map((s) => `<article class="surface skin-card"><div class="skin-preview ${s.theme === "paper" ? "light-skin" : ""}" style="--skin-color:${s.color}"><span>7</span><span>8</span><span>9</span><span>×</span><span>4</span><span>5</span><span>6</span><span>=</span></div><div class="card-top"><h3>${s.name}</h3><span class="skin-number">${String(skins.indexOf(s) + 1).padStart(2, "0")}</span></div><p>${s.desc}</p>${btn(u.skin === s.id ? "Применён" : u.owned.includes(s.id) ? "Применить" : `Открыть за ${s.price} Σ`, "u-skin", u.owned.includes(s.id) ? "secondary" : "primary", `data-id="${s.id}" ${u.skin === s.id ? "disabled" : ""}`)}</article>`).join("")}</div><div class="section-heading"><h2>Как к вам обращаться</h2><span class="muted">Титул виден в клубной карточке</span></div><div class="titles-grid">${titles.map(([t, p]) => `<article class="surface title-card"><span class="eyebrow">ПЕРСОНАЛЬНЫЙ ТИТУЛ</span><h3>${t}</h3>${btn(u.title === t ? "Выбран" : u.ownedTitles.includes(t) ? "Выбрать" : p + " Σ", "u-title", "secondary", `data-title="${t}" ${u.title === t ? "disabled" : ""}`)}</article>`).join("")}</div>`
    );
  }
  function custom() {
    return (
      head(
        "Настроение вычислений.",
        "Эффекты, звук, музыка и голос вашего спутника.",
      ) +
      `<div class="settings-layout"><section class="surface settings-card"><h3>Нажатия</h3><div class="effect-picker">${[
        ["none", "Без эффекта"],
        ["ripple", "Круг на поверхности"],
        ["spark", "Частицы знаков"],
        ["halo", "Световое кольцо"],
        ["ink", "Чернильный след"],
        ["digits", "Поток цифр"],
      ]
        .map(([v, t]) =>
          btn(
            t,
            "u-setting",
            u.clickFx === v ? "chip active" : "chip",
            `data-setting="clickFx" data-value="${v}"`,
          ),
        )
        .join(
          "",
        )}</div><h3>Появление результата</h3><div class="effect-picker">${[
        ["none", "Спокойное"],
        ["sweep", "Световая линия"],
        ["rise", "Подъём числа"],
        ["glow", "Мягкий импульс"],
        ["confetti", "Фейерверк цифр"],
        ["type", "Посимвольный вывод"],
      ]
        .map(([v, t]) =>
          btn(
            t,
            "u-setting",
            u.resultFx === v ? "chip active" : "chip",
            `data-setting="resultFx" data-value="${v}"`,
          ),
        )
        .join("")}</div><h3>Шрифт результата</h3><div class="effect-picker">${[
        ["default", "Surface"],
        ["mono", "Технический"],
        ["serif", "Книжный"],
        ["rounded", "Геометрический"],
      ]
        .map(([v, t]) =>
          btn(
            t,
            "u-setting",
            u.font === v ? "chip active" : "chip",
            `data-setting="font" data-value="${v}"`,
          ),
        )
        .join(
          "",
        )}</div><h3>Клавиша равенства</h3><div class="effect-picker">${["=", "≈", "∴", "→"].map((v) => btn(v, "u-setting", u.equal === v ? "chip active" : "chip", `data-setting="equal" data-value="${v}"`)).join("")}</div>${btn("Проверить на калькуляторе " + icon("arrow"), "nav", "primary", 'data-view="calc"')}</section><section class="surface settings-card"><h3>Музыка для счёта</h3><p>Четыре инструментальные темы. Звук синтезируется на устройстве.</p><div class="music-list">${[
        ["lofi", "Тетрадь в клетку", "Мягкий ритм, 76 BPM"],
        ["ambient", "Нулевой этаж", "Редкие ноты, 54 BPM"],
        ["orbit", "Орбита числа", "Пульсация, 100 BPM"],
        ["rain", "Дождь на стекле", "Тихие интервалы, 66 BPM"],
      ]
        .map(
          ([v, t, d]) =>
            `<button class="music-track ${u.track === v ? "active" : ""}" data-action="u-track" data-id="${v}"><span class="music-disc">♪</span><span><b>${t}</b><small>${d}</small></span>${u.track === v && u.music ? '<span class="equalizer"><i></i><i></i><i></i></span>' : icon("arrow")}</button>`,
        )
        .join(
          "",
        )}</div>${btn(u.music ? "Остановить музыку" : "Включить музыку", "u-music", "primary")}<label class="setting-range"><span>Громкость <b>${u.volume}%</b></span><input type="range" min="0" max="60" value="${u.volume}" id="u-volume"></label><h3>Тембр клавиш</h3><div class="effect-picker">${[
        ["soft", "Мягкий"],
        ["glass", "Стекло"],
        ["wood", "Дерево"],
        ["digital", "Цифровой"],
      ]
        .map(([v, t]) =>
          btn(
            t,
            "u-setting",
            u.timbre === v ? "chip active" : "chip",
            `data-setting="timbre" data-value="${v}"`,
          ),
        )
        .join(
          "",
        )}</div><label class="setting-line"><span>Голос ${character().name}<small>Озвучивать реплики после вычисления</small></span><input class="switch" type="checkbox" id="u-voice" ${u.voice ? "checked" : ""}></label>${btn("Послушать реплику", "u-talk", "text-button")}</section></div>`
    );
  }
  function novel() {
    let n = u.novel,
      c = chapters[Math.min(n.chapter, 7)],
      ch = characters.find((x) => x.id === c.speaker);
    return (
      head(
        "Нулевой этаж.",
        "Город, в котором каждую дверь открывает вычисление.",
      ) +
      `<div class="novel-layout"><section class="surface novel-scene"><div class="novel-backdrop"><div class="novel-window"></div><div class="novel-floor"></div><div class="novel-scene-symbol" style="--character-color:${ch.color}">${ch.symbol}</div><span class="novel-place">${c.place}</span><span class="novel-counter">${Math.min(n.chapter + 1, 8)} / 8</span></div><div class="novel-dialog"><span class="eyebrow">${ch.name} / ${ch.role}</span><h2>${c.title}</h2><p>${n.complete ? ending() : c.text}</p>${n.complete ? `<div class="novel-ending-label">Финал ${n.ending + 1} / 3</div>${btn("Пройти другой путь", "u-replay-novel", "secondary")}` : `<div class="novel-problem"><span class="eyebrow">ПАНЕЛЬ ВЫЧИСЛЕНИЙ</span><p>${c.question}</p><form id="u-novel-form"><label class="sr-only" for="novel-answer">Ответ</label><input id="novel-answer" name="answer" type="number" step="any" inputmode="decimal" placeholder="Ваш ответ" required><button type="submit" class="primary">Открыть путь ${icon("arrow")}</button></form><p id="novel-feedback" aria-live="polite"></p></div>`}</div></section><aside class="surface chapter-list"><span class="eyebrow">АРХИВ ПУТЕШЕСТВИЯ</span>${chapters.map((c, i) => `<button data-action="u-chapter" data-index="${i}" ${i > n.chapter ? "disabled" : ""}><span>${String(i + 1).padStart(2, "0")}</span><b>${c.title}</b>${i < n.chapter ? icon("check") : i === n.chapter ? icon("arrow") : ""}</button>`).join("")}<div class="novel-affinity"><p>Пройденные главы приносят опыт и Σ. Ваши решения определяют финал.</p><b>${n.choices.length} решений сохранено</b></div></aside></div>`
    );
  }
  function ending() {
    return [
      "Архив остаётся открытым. Сигма принимает первую новую ведомость, Фи чинит лестницу, а Дельта впервые приезжает вовремя. Вы оставляете ключ на общем столе. Теперь никто не обязан считать в одиночку.",
      "Мост построен. Четверо стоят на середине и смотрят, как под ним проходит утренний поезд. У города больше нет короткой стороны. Вы остаётесь — проверить следующий чертёж.",
      "Ключ оказывается легче, чем вы помнили. Вы уходите до первого поезда. На экране телефона появляется обычный калькулятор. В истории уже записано одно выражение: 4 + 8 + 12 + 16. Ответ вы знаете.",
    ][u.novel.ending ?? 0];
  }
  const arcadeModes = [
    [
      "twentyfour",
      "24",
      "Собери 24",
      "Используйте числа 2, 3, 4, 6 ровно по одному разу. Разрешены + − × ÷ и скобки.",
    ],
    [
      "safe",
      "⌘",
      "Сейф из цифр",
      "Три действия. Один трёхзначный код. Сейф запоминает только верный ответ.",
    ],
    [
      "memory",
      "M",
      "Память калькулятора",
      "Пять секунд на запоминание. Потом выражение исчезнет.",
    ],
    [
      "estimate",
      "≈",
      "Ближе к ответу",
      "Выберите ближайшее значение произведения.",
    ],
    [
      "parity",
      "2n",
      "Чётный сектор",
      "Определите чётность результата, не вычисляя всё целиком.",
    ],
    [
      "round",
      "↳",
      "Округление на лету",
      "Округлите число до указанного разряда.",
    ],
    [
      "binary",
      "01",
      "Двоичный переводчик",
      "Переведите запись из двоичной системы в десятичную.",
    ],
    [
      "balance",
      "x",
      "Баланс уравнения",
      "Найдите число, которое уравновесит две стороны.",
    ],
    [
      "error",
      "≠",
      "Найди ошибку",
      "Проверьте готовое равенство. Калькулятор тоже нуждается в ревизии.",
    ],
    [
      "fraction",
      "⅔",
      "Дробная перспектива",
      "Укажите десятичное значение дроби.",
    ],
  ];
  function arcade() {
    return (
      head(
        "Ещё одна попытка.",
        "Десять игр для тех, кому недостаточно получить готовый ответ.",
      ) +
      `<div class="surface arcade-banner"><span class="eyebrow">ИГРОВОЙ ЗАЛ</span><h2>${u.arcadePlayed} попыток в архиве.</h2><p>За верное решение — 8 Σ и 10 XP. Время не ограничено, кроме проверки памяти.</p></div><div class="arcade-grid">${arcadeModes.map(([id, s, t, d]) => `<article class="surface arcade-card"><div class="arcade-symbol">${s}</div><span class="eyebrow">РЕКОРД: ${u.arcadeScores[id] || 0} РЕШЕНИЙ</span><h3>${t}</h3><p>${d}</p>${btn("Играть " + icon("arrow"), "u-game", "primary", `data-id="${id}"`)}</article>`).join("")}</div>`
    );
  }
  function offers() {
    return (
      head(
        "Сначала смета. Потом решение.",
        "Рекламные карточки, в которых тоже есть что посчитать.",
      ) +
      `<section class="surface offers-note"><div><span class="eyebrow">ВОЗНАГРАЖДЕНИЕ ЗА ВНИМАНИЕ</span><h3>12 Σ за просмотр карточки до конца.</h3><p>До 6 просмотров с наградой в сутки. Формы ведут только к калькуляторам бюджета.</p></div><span class="coin-badge">Σ 12</span></section><div class="offers-grid">${campaigns.map((c) => `<article class="surface offer-card"><div class="offer-visual ${c.color}"><span class="offer-brand">${c.brand}</span><div class="offer-object ${c.id}"><span>${c.mark}</span><i></i><i></i><i></i></div><span class="offer-meta">РАСЧЁТНАЯ КАМПАНИЯ / 0${campaigns.indexOf(c) + 1}</span></div><div class="offer-body"><h3>${c.title}</h3><p>${c.text}</p><div>${btn("Рассчитать стоимость", "u-estimate", "secondary", `data-id="${c.id}"`)}${btn("+12 Σ", "u-ad", "text-button", `data-id="${c.id}" aria-label="Посмотреть карточку ${c.brand} с наградой"`)}</div></div></article>`).join("")}</div><p class="showcase-disclosure">Витрина Aori Calculate: собственные концептуальные бренды и расчётные примеры. Здесь нет приёма заявок, бронирований, оформления документов и реальных платежей. Все цены в формах можно изменить.</p>`
    );
  }
  function inbox() {
    return (
      head(
        "Что произошло, пока вы считали.",
        "Сюжет, награды и новые предметы.",
      ) +
      `<div class="inbox-actions">${btn("Отметить всё прочитанным", "u-read-all", "secondary")}</div><div class="inbox-list">${u.notifications.map((n) => `<button class="surface inbox-item ${u.readNotifications.includes(n.id) ? "read" : ""}" data-action="u-read" data-id="${n.id}"><span class="notification-dot"></span><span><small>${new Date(n.date).toLocaleString("ru-RU")}</small><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></span>${icon("check")}</button>`).join("") || "<p>Уведомления появятся после первого события.</p>"}</div>`
    );
  }
  function talk(custom) {
    let c = character(),
      line = custom || c.lines[Math.floor(Math.random() * c.lines.length)];
    toast(c.name + ": " + line);
    if (u.voice && "speechSynthesis" in window) {
      speechSynthesis.cancel();
      let utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = "ru-RU";
      utterance.rate = 0.92;
      utterance.pitch = c.id === "delta" ? 1.15 : c.id === "zero" ? 0.8 : 1;
      speechSynthesis.speak(utterance);
    }
  }
  function openLedger() {
    openModal(
      `<span class="eyebrow">ВНУТРЕННЯЯ ВАЛЮТА</span><h2>На счёте ${u.coins} Σ</h2><p>Σ зарабатываются в приложении и тратятся на оформление. Их нельзя купить или обменять на деньги.</p><div class="ledger-list">${u.ledger.map((l) => `<div><span><b>${esc(l.text)}</b><small>${new Date(l.date).toLocaleString("ru-RU")}</small></span><strong class="${l.amount > 0 ? "positive" : ""}">${l.amount > 0 ? "+" : ""}${l.amount} Σ</strong></div>`).join("")}</div>`,
    );
  }
  function spend(price, reason) {
    if (u.coins < price) {
      toast("Не хватает Σ. Награды и тренировки помогут пополнить баланс.");
      return false;
    }
    return credit(-price, reason);
  }
  function estimate(id) {
    let c = campaigns.find((c) => c.id === id);
    openModal(
      `<span class="eyebrow">${c.brand}</span><h2>Расчёт стоимости</h2><form id="u-estimate-form" data-id="${c.id}">${c.inputs.map((t, i) => `<label>${t}<input type="number" name="v${i}" step="any" min="0" value="${c.values[i]}" required></label>`).join("")}<button class="primary" type="submit">Рассчитать</button></form><div class="estimate-result" id="estimate-result" aria-live="polite"></div><p class="muted">${c.note}</p><small>Расчётная витрина Aori. Без отправки заявок и оплаты.</small>`,
    );
  }
  function watchAd(id) {
    if (daily().ads >= 6) {
      toast(
        "Награды за просмотры на сегодня закончились. Калькуляторы смет остаются доступны.",
      );
      return;
    }
    let c = campaigns.find((c) => c.id === id),
      end = Date.now() + 8000,
      progress = 0;
    openModal(
      `<span class="eyebrow">${c.brand}</span><div class="reward-ad ${c.color}"><span class="ad-mark">${c.mark}</span><h2>${c.title}</h2><p>${c.text}</p><div class="ad-line"></div></div><p id="ad-countdown">До награды: 8 с</p><div class="progress-track"><i id="ad-progress" style="width:0%"></i></div><button class="primary" id="ad-claim" data-action="u-ad-claim" data-id="${id}" disabled>Получить 12 Σ</button><p class="muted">Закрытие карточки прерывает просмотр. Награда начисляется один раз за просмотр.</p>`,
    );
    if (adTimer) clearInterval(adTimer);
    adTimer = setInterval(() => {
      if (!$("#modal").open || !$("#ad-countdown")) {
        clearInterval(adTimer);
        adTimer = null;
        return;
      }
      if (document.hidden) {
        end += 200;
        return;
      }
      let left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      $("#ad-countdown").textContent = left
        ? "До награды: " + left + " с"
        : "Просмотр завершён";
      $("#ad-progress").style.width =
        Math.min(100, (1 - (end - Date.now()) / 8000) * 100) + "%";
      if (left === 0) {
        clearInterval(adTimer);
        adTimer = null;
        $("#ad-claim").disabled = false;
        $("#ad-claim").dataset.ready = "yes";
      }
    }, 200);
  }
  function playGame(mode) {
    let a = rand(2, 12),
      b = rand(2, 9),
      c = rand(1, 7);
    currentGame = { mode, answer: null, ready: true };
    let g = currentGame,
      question = "",
      input = true,
      options = null;
    if (mode === "twentyfour") {
      question = "2 · 3 · 4 · 6 → 24";
      g.answer = 24;
      g.inputMode = "expression";
    }
    if (mode === "safe") {
      let x = a + b,
        y = a - b + 10,
        z = a * c;
      g.answer = Number(String(x % 10) + String(y % 10) + String(z % 10));
      question = `Первая цифра: остаток (${a}+${b}) ÷ 10.<br>Вторая: остаток (${a}−${b}+10) ÷ 10.<br>Третья: остаток (${a}×${c}) ÷ 10.`;
    }
    if (mode === "memory") {
      g.answer = a * b + c;
      g.ready = false;
      question = `<span id="memory-expression">${a} × ${b} + ${c}</span>`;
      g.hiddenQuestion = "Какой результат у исчезнувшего выражения?";
    }
    if (mode === "estimate") {
      let n = a * 101 + c * 13,
        m = b * 9;
      g.answer = n * m;
      let answers = [
        g.answer,
        Math.round(g.answer * 0.65),
        Math.round(g.answer * 1.45),
      ].sort(() => Math.random() - 0.5);
      question = `${n} × ${m} ≈ ?`;
      options = answers.map((v) => [String(v), v]);
      input = false;
    }
    if (mode === "parity") {
      let n = a * b + c;
      g.answer = n % 2 === 0 ? "Чётный" : "Нечётный";
      question = `${a} × ${b} + ${c}`;
      options = [
        ["Чётный", "Чётный"],
        ["Нечётный", "Нечётный"],
      ];
      input = false;
    }
    if (mode === "round") {
      let n = rand(101, 9999),
        rank = [10, 100][rand(0, 1)];
      g.answer = Math.round(n / rank) * rank;
      question = `Округлите ${n} до ${rank === 10 ? "десятков" : "сотен"}.`;
    }
    if (mode === "binary") {
      g.answer = rand(5, 63);
      question = `${g.answer.toString(2)}₂ = ?₁₀`;
    }
    if (mode === "balance") {
      let x = rand(2, 20),
        r = a * x + b;
      g.answer = x;
      question = `${a}x + ${b} = ${r}`;
    }
    if (mode === "error") {
      let right = rand(0, 1),
        v = a * b + c;
      g.answer = right ? "Верно" : "Ошибка";
      question = `${a} × ${b} + ${c} = ${right ? v : v + rand(1, 9)}`;
      options = [
        ["Верно", "Верно"],
        ["Ошибка", "Ошибка"],
      ];
      input = false;
    }
    if (mode === "fraction") {
      let den = [2, 4, 5, 8, 10][rand(0, 4)],
        numerator = rand(1, den - 1);
      g.answer = numerator / den;
      question = `${numerator} / ${den} = ?`;
    }
    let title = arcadeModes.find((v) => v[0] === mode)[2];
    openModal(
      `<span class="eyebrow">ИГРОВОЙ ЗАЛ / +8 Σ ЗА РЕШЕНИЕ</span><h2>${title}</h2><div class="arcade-question">${question}</div>${input ? `<form id="u-game-form"><label>Ваш ответ<input name="answer" id="arcade-answer" type="${g.inputMode === "expression" ? "text" : "number"}" step="any" inputmode="${g.inputMode === "expression" ? "text" : "decimal"}" required ${!g.ready ? "disabled" : ""} placeholder="${mode === "twentyfour" ? "Например, (2+4)*(6-3)" : "Введите ответ"}"></label><button type="submit" class="primary" ${!g.ready ? 'disabled id="memory-submit"' : ""}>Проверить</button></form>` : `<div class="game-choices">${options.map(([t, v]) => btn(t, "u-game-answer", "secondary", `data-answer="${v}"`)).join("")}</div>`}<p id="arcade-feedback" class="muted" aria-live="polite">${mode === "memory" ? "Запомните выражение. Оно исчезнет через 10 секунд." : mode === "twentyfour" ? "Каждое из четырёх чисел нужно использовать ровно один раз." : "Награда начисляется за правильное решение."}</p>`,
    );
    if (mode === "memory") {
      setTimeout(() => {
        if (currentGame !== g || !$("#memory-expression")) return;
        $("#memory-expression").textContent = "? × ? + ?";
        $("#arcade-feedback").textContent = g.hiddenQuestion;
        g.ready = true;
        $("#arcade-answer").disabled = false;
        $("#memory-submit").disabled = false;
        $("#arcade-answer").focus();
      }, 10000);
    }
  }
  function checkArcade(raw) {
    let g = currentGame;
    if (!g || !g.ready) return;
    let value = raw;
    if (g.mode === "twentyfour") {
      let numbers = String(raw)
        .match(/\d+(?:\.\d+)?/g)
        ?.map(Number)
        .sort((a, b) => a - b);
      if (
        JSON.stringify(numbers) !== "[2,3,4,6]" ||
        !/^[\d\s()+*/×÷−-]+$/.test(raw)
      ) {
        $("#arcade-feedback").textContent =
          "Используйте только 2, 3, 4 и 6 ровно один раз и арифметические операции.";
        return;
      }
      try {
        value = evaluate(raw);
      } catch {
        $("#arcade-feedback").textContent = "Проверьте выражение и скобки.";
        return;
      }
    } else if (typeof g.answer === "number") value = Number(raw);
    let correct =
      typeof value === "number" && typeof g.answer === "number"
        ? Math.abs(value - g.answer) < 1e-8
        : String(value) === String(g.answer);
    if (!correct) {
      $("#arcade-feedback").textContent =
        "Ответ пока не сходится. Можно попробовать ещё.";
      return;
    }
    g.ready = false;
    u.arcadePlayed++;
    u.arcadeScores[g.mode] = (u.arcadeScores[g.mode] || 0) + 1;
    daily().games++;
    credit(8, "Решение: " + arcadeModes.find((v) => v[0] === g.mode)[2]);
    ui.rewardXp(10);
    openModal(
      `<span class="eyebrow">ВЕРНОЕ РЕШЕНИЕ</span><h2>Сошлось.</h2><div class="arcade-success">${esc(g.answer)}</div><p>+8 Σ и +10 XP. Решений в этой игре: ${u.arcadeScores[g.mode]}.</p>${btn("Ещё одну", "u-game", "primary", `data-id="${g.mode}"`)}${btn("В игровой зал", "u-arcade-close", "secondary")}`,
    );
  }
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  function musicStop() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
    if (audio?.master)
      audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.08);
  }
  function context() {
    if (!audio) {
      let ctx = new (window.AudioContext || window.webkitAudioContext)(),
        master = ctx.createGain();
      master.connect(ctx.destination);
      master.gain.value = (u.volume / 100) * 0.1;
      audio = { ctx, master };
    }
    audio.ctx.resume();
    audio.master.gain.setTargetAtTime(
      (u.volume / 100) * 0.12,
      audio.ctx.currentTime,
      0.1,
    );
    return audio;
  }
  function tone(hz, duration = 0.4, type = "sine", volume = 0.4, offset = 0) {
    try {
      let { ctx, master } = context(),
        osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        t = ctx.currentTime + offset;
      osc.type = type;
      osc.frequency.value = hz;
      osc.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {}
  }
  function musicStart() {
    musicStop();
    let bpm = { lofi: 76, ambient: 54, orbit: 100, rain: 66 }[u.track],
      i = 0,
      scales = {
        lofi: [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63],
        ambient: [146.83, 220, 293.66, 369.99, 293.66, 220],
        orbit: [261.63, 329.63, 392, 523.25, 392, 329.63],
        rain: [174.61, 220, 261.63, 349.23, 261.63, 220],
      };
    let step = () => {
      if (document.hidden) return;
      let notes = scales[u.track];
      tone(
        notes[i % notes.length],
        u.track === "ambient" ? 2.6 : 0.75,
        "sine",
        0.2,
      );
      if (i % 4 === 0) tone(notes[0] / 2, 2, "triangle", 0.1);
      if (u.track === "lofi" && i % 2 === 0) tone(70, 0.08, "sine", 0.4);
      i++;
    };
    step();
    musicTimer = setInterval(step, 60000 / bpm);
  }
  function keyEffects(button) {
    let effect = u.clickFx;
    if (effect === "none") return;
    let r = button.getBoundingClientRect(),
      layer = document.createElement("div");
    layer.className = "key-effect-layer " + effect;
    layer.style.left = r.left + r.width / 2 + "px";
    layer.style.top = r.top + r.height / 2 + "px";
    let symbols = effect === "digits" ? "0123456789" : "＋−×÷=Σ";
    for (
      let i = 0;
      i < (effect === "ripple" || effect === "halo" ? 1 : 7);
      i++
    ) {
      let p = document.createElement("i");
      p.textContent =
        effect === "ripple" || effect === "halo"
          ? ""
          : symbols[rand(0, symbols.length - 1)];
      p.style.setProperty("--dx", (Math.random() - 0.5) * 110 + "px");
      p.style.setProperty("--dy", -20 - Math.random() * 70 + "px");
      p.style.setProperty("--rot", (Math.random() - 0.5) * 120 + "deg");
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1000);
    if (get().settings.sound) {
      let hz = { soft: 420, glass: 1200, wood: 180, digital: 760 }[u.timbre];
      tone(hz, 0.09, u.timbre === "digital" ? "square" : "sine", 0.4);
    }
  }
  function resultEffect(value) {
    let out = $("#calc-result");
    if (!out) return;
    out.dataset.resultEffect = u.resultFx;
    out.classList.remove("result-animated");
    void out.offsetWidth;
    out.classList.add("result-animated");
    if (u.resultFx === "confetti") {
      let r = out.getBoundingClientRect();
      for (let i = 0; i < 16; i++) {
        let p = document.createElement("span");
        p.className = "result-confetti";
        p.textContent =
          String(value).replace(".", "")[i % String(value).length] || "0";
        p.style.left = r.left + r.width / 2 + "px";
        p.style.top = r.top + 20 + "px";
        p.style.setProperty("--dx", (Math.random() - 0.5) * 330 + "px");
        p.style.setProperty("--dy", (Math.random() - 0.5) * 230 + "px");
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1300);
      }
    }
    if (u.resultFx === "type") {
      let text = out.textContent;
      out.textContent = "";
      let n = 0;
      if (storyRevealTimer) clearInterval(storyRevealTimer);
      storyRevealTimer = setInterval(() => {
        out.textContent = text.slice(0, ++n);
        if (n >= text.length) clearInterval(storyRevealTimer);
      }, 35);
    }
  }
  function recordCalculation(value) {
    daily().calculations++;
    u.affinity[u.character] = (u.affinity[u.character] || 0) + 1;
    if (daily().calculations <= 50) credit(1, "Завершённое вычисление");
    else save();
    if (daily().calculations === 1)
      note(
        "Первый ответ за день",
        "Награда за вычисления уже доступна в заданиях.",
      );
    resultEffect(value);
    if (u.voice || daily().calculations % 5 === 0) talk();
    save();
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-action]");
    if (!b) return;
    let action = b.dataset.action;
    if (action === "key") {
      keyEffects(b);
      return;
    }
    if (!action?.startsWith("u-")) return;
    let id = b.dataset.id;
    if (action === "u-ledger") openLedger();
    if (action === "u-character") {
      u.character = id;
      note(
        "Спутник выбран",
        character().name + " теперь рядом с калькулятором.",
      );
      save();
      ui.render();
      talk();
    }
    if (action === "u-talk") talk();
    if (action === "u-login") {
      if (u.claims.includes(today())) return;
      u.claims.push(today());
      credit(loginReward(), "Награда за вход: день " + visitStreak());
      toast("Получено " + loginReward() + " Σ");
      ui.render();
    }
    if (action === "u-quest") {
      let q = quests().find((q) => q.id === id),
        key = today() + q.id;
      if (u.questClaims.includes(key)) return;
      if (q.current < q.target) {
        navigate(q.view);
        return;
      }
      u.questClaims.push(key);
      credit(q.reward, "Задание: " + q.title);
      ui.render();
      toast("Награда получена");
    }
    if (action === "u-season") {
      let i = Number(b.dataset.index);
      if (get().xp < (i + 1) * 50 || u.seasonClaims.includes(i)) return;
      u.seasonClaims.push(i);
      credit(15 + i * 5, "Сезон 01: этап " + (i + 1));
      note(
        "Сезонная награда",
        "Открыт этап " + (i + 1) + " общего знаменателя.",
      );
      save();
      ui.render();
    }
    if (action === "u-skin") {
      let s = skins.find((s) => s.id === id);
      if (!u.owned.includes(id)) {
        if (!spend(s.price, "Материал: " + s.name)) return;
        u.owned.push(id);
        note("Новый материал", s.name + " добавлен в коллекцию.");
      }
      u.skin = id;
      get().settings.accent = s.color;
      get().settings.theme = s.theme;
      save();
      ui.render();
      toast(s.name + " применён");
    }
    if (action === "u-capsule") {
      if (!spend(35, "Капсула вычислений")) return;
      let s = skins[rand(0, skins.length - 1)],
        duplicate = u.owned.includes(s.id);
      u.capsules++;
      if (duplicate) credit(20, "Повтор материала: " + s.name);
      else {
        u.owned.push(s.id);
        save();
      }
      note(
        "Капсула открыта",
        s.name +
          (duplicate ? " · повтор, возвращено 20 Σ" : " · новый материал"),
      );
      save();
      openModal(
        `<span class="eyebrow">КАПСУЛА ВЫЧИСЛЕНИЙ</span><div class="capsule-reveal" style="--skin-color:${s.color}">Σ</div><h2>${s.name}</h2><p>${duplicate ? "Материал уже есть в коллекции. Возвращено 20 Σ." : s.desc + ". Материал добавлен в коллекцию."}</p>${btn("Применить материал", "u-capsule-equip", "primary", `data-id="${s.id}"`)}`,
      );
    }
    if (action === "u-capsule-equip") {
      let s = skins.find((s) => s.id === id);
      u.skin = id;
      get().settings.accent = s.color;
      get().settings.theme = s.theme;
      save();
      closeModal();
      ui.render();
    }
    if (action === "u-title") {
      let t = b.dataset.title,
        p = titles.find((x) => x[0] === t)?.[1];
      if (p === undefined) return;
      if (!u.ownedTitles.includes(t)) {
        if (!spend(p, "Титул: " + t)) return;
        u.ownedTitles.push(t);
      }
      u.title = t;
      save();
      ui.render();
    }
    if (action === "u-setting") {
      let k = b.dataset.setting,
        v = b.dataset.value,
        allowed = {
          clickFx: ["none", "ripple", "spark", "halo", "ink", "digits"],
          resultFx: ["none", "sweep", "rise", "glow", "confetti", "type"],
          font: ["default", "mono", "serif", "rounded"],
          equal: ["=", "≈", "∴", "→"],
          timbre: ["soft", "glass", "wood", "digital"],
        };
      if (!allowed[k]?.includes(v)) return;
      u[k] = v;
      save();
      ui.render();
      if (k === "timbre")
        tone(
          { soft: 420, glass: 1200, wood: 180, digital: 760 }[v],
          0.14,
          "sine",
          0.6,
        );
    }
    if (action === "u-track") {
      u.track = id;
      if (u.music) musicStart();
      save();
      ui.render();
    }
    if (action === "u-music") {
      u.music = !u.music;
      if (u.music) musicStart();
      else musicStop();
      save();
      ui.render();
    }
    if (action === "u-support")
      openModal(
        `<span class="eyebrow">РАЗВИТИЕ КЛУБА ВЫЧИСЛЕНИЙ</span><h2>Внести свой вклад</h2><p>Поддержка использует только внутренние Σ. За каждые 100 внесённых Σ открывается новый уровень мецената. Реальные платежи не проводятся.</p><div class="support-options">${[10, 25, 50, 100].map((v) => btn(v + " Σ", "u-donate", "secondary", `data-amount="${v}"`)).join("")}</div><p>Ваш вклад: ${u.support} Σ. Уровень ${Math.floor(u.support / 100)}.</p>`,
      );
    if (action === "u-donate") {
      let n = Number(b.dataset.amount);
      if (![10, 25, 50, 100].includes(n) || !spend(n, "Поддержка клуба"))
        return;
      u.support += n;
      note("Вклад принят", "Вы внесли " + n + " Σ в клуб вычислений.");
      save();
      closeModal();
      ui.render();
      toast("Вклад записан. Спасибо за участие в клубе.");
    }
    if (action === "u-constant") {
      let i = Number(b.dataset.index),
        xp = [0, 40, 90, 160, 250, 400][i];
      if (get().xp < xp) {
        toast("Карточка откроется при " + xp + " XP");
        return;
      }
      if (!u.cards.includes(i)) {
        u.cards.push(i);
        save();
      }
      let expressions = [
        "pi",
        "e",
        "(1+sqrt(5))/2",
        "sqrt(2)",
        "2*pi",
        "0.5772156649015329",
      ];
      closeModal();
      ui.useExpression(expressions[i]);
    }
    if (action === "u-novel-choice") {
      let ch = u.novel.chapter,
        choice = Number(b.dataset.choice);
      if (
        !Number.isInteger(choice) ||
        choice < 0 ||
        choice >= chapters[ch]?.options.length
      )
        return;
      u.novel.choices.push(choice);
      u.novel.chapter++;
      eventSystem.recordNovel();
      if (u.novel.chapter >= 8) {
        u.novel.complete = true;
        u.novel.ending = choice;
        note(
          "Нулевой этаж пройден",
          "Открыт финал " + (choice + 1) + " из трёх.",
        );
      }
      u.affinity[chapters[ch].speaker] += 5;
      credit(20, "Глава " + (ch + 1) + " новеллы");
      ui.rewardXp(20);
      save();
      closeModal();
      ui.render();
    }
    if (action === "u-replay-novel") {
      u.novel = { chapter: 0, choices: [], complete: false, ending: null };
      save();
      ui.render();
    }
    if (action === "u-chapter") {
      let i = Number(b.dataset.index);
      if (i > u.novel.chapter) return;
      let c = chapters[i];
      openModal(
        `<span class="eyebrow">АРХИВ / ГЛАВА ${i + 1}</span><h2>${c.title}</h2><p>${c.text}</p><p>${c.next}</p>`,
      );
    }
    if (action === "u-game") playGame(id);
    if (action === "u-game-answer") checkArcade(b.dataset.answer);
    if (action === "u-arcade-close") {
      closeModal();
      navigate("arcade");
    }
    if (action === "u-estimate") estimate(id);
    if (action === "u-ad") watchAd(id);
    if (action === "u-ad-claim") {
      if (b.dataset.ready !== "yes" || daily().ads >= 6) return;
      b.disabled = true;
      b.dataset.ready = "no";
      daily().ads++;
      credit(12, "Просмотр: " + campaigns.find((c) => c.id === id).brand);
      closeModal();
      toast("На баланс зачислено 12 Σ");
      estimate(id);
    }
    if (action === "u-read-all") {
      u.readNotifications = u.notifications.map((n) => n.id);
      save();
      ui.render();
    }
    if (action === "u-read") {
      if (!u.readNotifications.includes(id)) u.readNotifications.push(id);
      save();
      b.classList.add("read");
    }
  });
  document.addEventListener("submit", (e) => {
    let f = e.target;
    if (!f.id.startsWith("u-")) return;
    e.preventDefault();
    let data = new FormData(f);
    if (f.id === "u-game-form") checkArcade(data.get("answer"));
    if (f.id === "u-novel-form") {
      let c = chapters[u.novel.chapter];
      if (Math.abs(Number(data.get("answer")) - c.answer) > 1e-8) {
        $("#novel-feedback").textContent =
          "Панель не открылась. Проверьте расчёт.";
        return;
      }
      openModal(
        `<span class="eyebrow">ВЫЧИСЛЕНИЕ ПРИНЯТО</span><h2>${c.title}</h2><p>${c.next}</p><p>Как поступите дальше?</p><div class="novel-choices">${c.options.map((t, i) => btn(t, "u-novel-choice", "secondary", `data-choice="${i}"`)).join("")}</div>`,
      );
    }
    if (f.id === "u-estimate-form") {
      let c = campaigns.find((c) => c.id === f.dataset.id),
        values = c.inputs.map((_, i) => Number(data.get("v" + i)));
      if (values.some((v) => !Number.isFinite(v) || v < 0)) return;
      let result = c.formula(values);
      $("#estimate-result").innerHTML =
        `<small>ПРЕДВАРИТЕЛЬНАЯ СТОИМОСТЬ</small><strong>${esc(format(result, 2))} ₽</strong>`;
      get().history.unshift({
        id: crypto.randomUUID(),
        expression: c.brand + " / " + values.join(" + "),
        result,
        date: Date.now(),
        kind: "Смета",
        estimateId: c.id,
        pinned: false,
      });
      get().history = get().history.slice(0, 500);
      ui.rewardXp(3);
      recordCalculation(result);
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "u-volume") {
      u.volume = Number(e.target.value);
      if (audio)
        audio.master.gain.setTargetAtTime(
          (u.volume / 100) * 0.12,
          audio.ctx.currentTime,
          0.1,
        );
      e.target.parentElement.querySelector("b").textContent = u.volume + "%";
      save();
    }
    if (e.target.id === "u-favorite-number") {
      let n = Number(e.target.value);
      if (Number.isFinite(n)) {
        u.favoriteNumber = n;
        save();
      }
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.id === "u-voice") {
      u.voice = e.target.checked;
      save();
      if (u.voice) talk();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (audio) audio.ctx.suspend();
    } else if (u.music && audio) audio.ctx.resume();
  });
  // Audio is never resumed automatically after a page load.
  u.music = false;
  save();
  const eventSystem = createEvents({
    state: () => u,
    save,
    render: ui.render,
    navigate,
    esc,
    btn,
    icon,
    openModal,
    closeModal,
    toast,
    character,
    credit,
    spend,
    xp: ui.rewardXp,
  });
  return {
    supports: (v) =>
      [
        "club",
        "rewards",
        "shop",
        "custom",
        "novel",
        "arcade",
        "offers",
        "inbox",
      ].includes(v) || eventSystem.supports(v),
    render: (v) =>
      eventSystem.supports(v)
        ? eventSystem.render(v)
        : (
            { club, rewards, shop, custom, novel, arcade, offers, inbox }[v] ||
            club
          )(),
    home: () => home() + eventSystem.summary(),
    recordCalculation,
    recordStory: () => {
      daily().stories++;
      eventSystem.recordStory();
      save();
    },
    apply,
    openEstimate: estimate,
    streak: visitStreak,
    wallet: () => btn("Σ " + u.coins, "nav", "top-wallet", 'data-view="club"'),
    validate: validateUniverse,
    resetFromState: () => {
      u = { ...defaults, ...get().universe };
      get().universe = u;
      eventSystem.reset();
      apply();
    },
  };
}

export function validateUniverse(s) {
  if (!s || typeof s !== "object") return false;
  if (s.rpg && !validateRpg(s.rpg)) return false;
  for (const k of [
    "coins",
    "support",
    "favoriteNumber",
    "arcadePlayed",
    "capsules",
    "volume",
  ])
    if (!Number.isFinite(s[k])) return false;
  if (s.coins < 0 || s.support < 0 || s.volume < 0 || s.volume > 60)
    return false;
  for (const k of [
    "visits",
    "claims",
    "questClaims",
    "seasonClaims",
    "owned",
    "ownedTitles",
    "cards",
    "readNotifications",
  ])
    if (!Array.isArray(s[k]) || s[k].length > 10000) return false;
  if (
    !s.owned.every((v) => skins.some((x) => x.id === v)) ||
    !characters.some((c) => c.id === s.character) ||
    !skins.some((x) => x.id === s.skin)
  )
    return false;
  if (
    !["none", "ripple", "spark", "halo", "ink", "digits"].includes(s.clickFx) ||
    !["none", "sweep", "rise", "glow", "confetti", "type"].includes(
      s.resultFx,
    ) ||
    !["default", "mono", "serif", "rounded"].includes(s.font) ||
    !["=", "≈", "∴", "→"].includes(s.equal) ||
    !["lofi", "ambient", "orbit", "rain"].includes(s.track) ||
    !["soft", "glass", "wood", "digital"].includes(s.timbre)
  )
    return false;
  if (
    typeof s.title !== "string" ||
    s.ownedTitles.some((v) => typeof v !== "string")
  )
    return false;
  if (!s.affinity || Object.values(s.affinity).some((v) => !Number.isFinite(v)))
    return false;
  if (
    !s.novel ||
    !Number.isInteger(s.novel.chapter) ||
    s.novel.chapter < 0 ||
    s.novel.chapter > 8 ||
    !Array.isArray(s.novel.choices) ||
    s.novel.choices.some((v) => ![0, 1, 2].includes(v)) ||
    (s.novel.ending !== null && ![0, 1, 2].includes(s.novel.ending))
  )
    return false;
  if (
    !Array.isArray(s.ledger) ||
    s.ledger.length > 200 ||
    s.ledger.some(
      (l) =>
        typeof l.text !== "string" ||
        !Number.isFinite(l.amount) ||
        !Number.isFinite(l.date),
    )
  )
    return false;
  if (
    !Array.isArray(s.notifications) ||
    s.notifications.length > 100 ||
    s.notifications.some(
      (n) =>
        typeof n.id !== "string" ||
        typeof n.title !== "string" ||
        typeof n.text !== "string" ||
        !Number.isFinite(n.date),
    )
  )
    return false;
  if (
    !s.arcadeScores ||
    Object.values(s.arcadeScores).some((v) => !Number.isFinite(v) || v < 0)
  )
    return false;
  if (
    !s.daily ||
    Object.values(s.daily).some((d) =>
      ["calculations", "games", "ads", "stories"].some(
        (k) => !Number.isFinite(d[k]) || d[k] < 0,
      ),
    )
  )
    return false;
  return true;
}
