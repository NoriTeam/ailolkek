import { createUniverse, universeFeatures, eventFeatures } from "./universe.js";
let universe;
import { evaluate, format } from "./math.js";
import { tools, conversions, articles, appFeatures } from "./catalog.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const icons = {
  calc: '<rect x="5" y="3" width="14" height="18" rx="4"/><path d="M8 8h8M8 12h1m6 0h1m-8 4h1m6 0h1"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  tools: '<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm13 0v6m-3-3h6"/>',
  community:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-2-4"/>',
  learn:
    '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3zm9 2v15"/>',
  games: '<path d="m8 4 4 6 4-6m-4 6v11M4 8l8 2 8-2M5 16l7-6 7 6"/>',
  profile:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2"/>',
  lab: '<path d="M3 3v18h18M5 16c5 0 4-11 8-11s2 9 7 9"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  heart: '<path d="M20 5c-3-3-7 0-8 2-1-2-5-5-8-2s0 8 8 14c8-6 11-11 8-14Z"/>',
  star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  share: '<path d="M12 15V3m-4 4 4-4 4 4M5 11H3v10h18V11h-2"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="3"/><path d="M16 5V3H3v13h2"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  flame:
    '<path d="M13 2c2 7-4 8-2 12 3-1 4-3 4-5 6 5 5 13-3 13C2 22 2 10 7 7c-1 4 1 5 2 5-1-4 5-5 4-10Z"/>',
  trophy:
    '<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"/>',
  bookmark: '<path d="M5 3h14v19l-7-5-7 5Z"/>',
  message: '<path d="M3 4h18v13H9l-6 4Zm5 5h8m-8 4h5"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
};
icons.events = icons.bolt;
icons.action = icons.lab;
icons.club = icons.community;
icons.novel = icons.learn;
icons.arcade = icons.games;
icons.custom = icons.settings;
const colorClass = (c) =>
  ["lavender", "green", "peach", "blue"].includes(c) ? c : "lavender";
const icon = (n, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.calc}</svg>`;
const initial = {
  name: "Алекс",
  bio: "Сначала посчитаю. Потом решу.",
  avatar: "∑",
  history: [],
  posts: [],
  stories: [],
  likes: [],
  saved: [],
  following: [],
  comments: {},
  favorites: [],
  read: [],
  used: [],
  xp: 0,
  gameBest: 0,
  games: 0,
  days: [],
  poll: null,
  collections: [],
  settings: {
    theme: "surface",
    accent: "#b9a1ff",
    precision: 8,
    group: true,
    radius: 20,
    density: "normal",
    sound: false,
    haptic: false,
    motion: true,
    glass: 65,
    size: 1,
    glow: true,
    focus: false,
  },
  memory: 0,
};
let state;
try {
  state = JSON.parse(localStorage.getItem("aori-calculate-v1") || "null");
} catch {}
state = {
  ...initial,
  ...state,
  settings: { ...initial.settings, ...state?.settings },
};
let view = "home",
  expr = "",
  result = 0,
  error = "",
  angle = "DEG",
  scientific = false,
  finished = false,
  search = "",
  category = "Все",
  feedTab = "Для вас",
  game = null,
  storyIndex = 0,
  toolOutputs = {},
  lastFocus = null;
const seed = [
  {
    id: "p1",
    author: "Aori Journal",
    avatar: "φ",
    topic: "Теория чисел",
    text: "У этого числа хорошая репутация. Проверили: квадрат золотого сечения действительно больше его самого ровно на единицу.",
    expression: "((1+sqrt(5))/2)^2-(1+sqrt(5))/2",
    result: 1,
    color: "lavender",
    editorial: true,
  },
  {
    id: "p2",
    author: "Бюро процентов",
    avatar: "%",
    topic: "Финансы",
    text: "Две скидки, одно решение. Сохраняйте формулу перед следующим походом за покупками.",
    expression: "4900*(1-20/100)*(1-10/100)",
    result: 3528,
    color: "green",
    editorial: true,
  },
  {
    id: "p3",
    author: "Клуб простых чисел",
    avatar: "97",
    topic: "Теория чисел",
    text: "Сумма первых десяти натуральных чисел. Иногда самый короткий путь — спарить первое и последнее.",
    expression: "10*(1+10)/2",
    result: 55,
    color: "peach",
    editorial: true,
  },
];
const authors = [...new Set(seed.map((p) => p.author))];
const total =
  tools.length +
  conversions.length +
  appFeatures.length +
  universeFeatures.length +
  eventFeatures.length;
function persist() {
  try {
    localStorage.setItem("aori-calculate-v1", JSON.stringify(state));
  } catch {
    toast("Хранилище заполнено. Экспортируйте резервную копию.");
  }
  applySettings();
}
function applySettings() {
  let s = state.settings,
    d = document.documentElement;
  d.dataset.theme = s.theme;
  d.dataset.density = s.density;
  d.style.setProperty("--accent", s.accent);
  d.style.setProperty("--key-radius", s.radius + "px");
  d.style.setProperty("--glass", s.glass / 100);
  d.style.setProperty("--number-scale", s.size);
  d.dataset.motion = s.motion ? "on" : "off";
  d.dataset.glow = s.glow ? "on" : "off";
  d.dataset.focus = s.focus ? "on" : "off";
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("visible"), 3000);
}
function fmt(n) {
  return format(n, state.settings.precision, state.settings.group);
}
function uid() {
  return (
    crypto.randomUUID?.() ||
    Date.now() + "-" + Math.random().toString(36).slice(2)
  );
}
function reward(n) {
  state.xp += n;
  persist();
}
function dailyMark() {
  let d = new Date().toLocaleDateString("sv-SE");
  if (!state.days.includes(d)) state.days.push(d);
}
function compute(source = expr, kind = "calc") {
  try {
    let value = evaluate(source, { angle, ans: result, memory: state.memory });
    result = value;
    error = "";
    state.history.unshift({
      id: uid(),
      expression: source,
      result: value,
      date: Date.now(),
      kind,
      pinned: false,
    });
    state.history = state.history.slice(0, 500);
    dailyMark();
    reward(5);
    queueMicrotask(() => universe?.recordCalculation(value));
    return value;
  } catch (e) {
    error = e.message;
    return null;
  }
}
function useExpression(s) {
  expr = s;
  finished = false;
  error = "";
  navigate("calc");
}
function navigate(next) {
  view = next;
  search = "";
  category = "Все";
  let route = new URL(location.href);
  route.hash = next;
  route.searchParams.delete("expression");
  window.history.replaceState(null, "", route);
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
const btn = (label, action, cls = "", attrs = "") =>
  `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const heading = (eyebrow, title, sub = "") =>
  `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div></div>`;
function navItem(v, label) {
  return btn(
    `${icon(v)}<span>${label}</span>`,
    "nav",
    view === v ? "nav-item active" : "nav-item",
    `data-view="${v}" ${view === v ? 'aria-current="page"' : ""}`,
  );
}
function shell(content) {
  return `<aside class="sidebar"><a class="brand" href="#home" aria-label="Aori Calculate, главная"><img src="icon.svg" alt=""><div>aori<span>calculate</span></div></a><span class="side-label">ПРОСТРАНСТВО ВЫЧИСЛЕНИЙ</span><nav>${navItem("home", "Обзор")}${navItem("calc", "Калькулятор")}${navItem("tools", "Инструменты")}${navItem("lab", "Лаборатория")}<div class="nav-separator"></div>${navItem("community", "Сообщество")}${navItem("learn", "Журнал")}${navItem("games", "Тренировки")}${navItem("history", "История")}<div class="nav-separator"></div>${navItem("club", "Клуб Σ")}${navItem("novel", "Нулевой этаж")}${navItem("arcade", "Игровой зал")}${navItem("events", "Ивенты")}${navItem("action", "Гонки и арена")}</nav><div class="side-bottom"><div class="surface-mini"><span class="status-dot"></span> Aori Surface <span class="mono">01</span></div>${navItem("custom", "Эффекты и звук")}${navItem("settings", "Настройки")}${btn(`<span class="avatar small">${esc(state.avatar)}</span><span><b>${esc(state.name)}</b><small>Уровень ${level()} · ${state.xp} XP</small></span>${icon("chevron")}`, "nav", "profile-link", 'data-view="profile"')}</div></aside><div class="workspace"><header class="topbar"><a href="#home" class="mobile-brand"><img src="icon.svg" alt="Aori Calculate"></a><div class="breadcrumbs">Личное пространство <span>/</span> <b>${{ home: "Обзор", calc: "Калькулятор", tools: "Инструменты", lab: "Лаборатория", community: "Сообщество", learn: "Журнал", games: "Тренировки", history: "История", profile: "Профиль", settings: "Настройки", club: "Клуб Σ", rewards: "Награды", shop: "Магазин", custom: "Эффекты и звук", novel: "Нулевой этаж", arcade: "Игровой зал", offers: "Витрина", inbox: "Входящие", events: "Ивенты", rpg: "Персонаж RPG", battle: "Бои", passes: "Пропуска", action: "Гонки и арена" }[view]}</b></div><div class="top-actions">${universe?.wallet() || ""}${btn(`${icon("search")}<span>Найти инструмент</span><kbd>/</kbd>`, "catalog", "search-trigger", 'aria-label="Найти возможность"')}${btn(`${icon("flame")}<span>${universe?.streak() ?? streak()} ${wordDays(universe?.streak() ?? streak())}</span>`, "nav", "streak", 'data-view="rewards"')}${btn(esc(state.avatar), "nav", "avatar", 'data-view="profile"')}</div></header><main id="main">${content}</main><footer><span>aori calculate</span>${btn(`${total} возможностей ${icon("arrow")}`, "catalog", "text-button")}</footer></div><nav class="bottom-nav" aria-label="Основная навигация">${navItem("home", "Обзор")}${navItem("calc", "Считать")}${navItem("tools", "Каталог")}${navItem("community", "Лента")}${navItem("profile", "Профиль")}</nav>`;
}
function level() {
  return Math.floor(Math.sqrt(state.xp / 30)) + 1;
}
function wordDays(n) {
  return n % 10 === 1 && n % 100 !== 11
    ? "день"
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
      ? "дня"
      : "дней";
}
function streak() {
  let count = 0,
    date = new Date();
  if (!state.days.includes(date.toLocaleDateString("sv-SE")))
    date.setDate(date.getDate() - 1);
  while (state.days.includes(date.toLocaleDateString("sv-SE"))) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}
function stories() {
  let all = visibleStories();
  return `<div class="story-row">${btn(`<span class="story-orbit add-story">${icon("plus")}</span><span>Ваша история</span>`, "new-story", "story")}${all
    .slice(0, 10)
    .map((s, i) =>
      btn(
        `<span class="story-orbit ${colorClass(s.color)}"><span>${esc(s.symbol)}</span></span><span>${esc(s.name)}</span>`,
        "story",
        "story",
        `data-index="${i}"`,
      ),
    )
    .join("")}</div>`;
}
function visibleStories() {
  return [
    ...state.stories
      .filter((s) => Date.now() - s.date < 86400000)
      .map((s) => ({ ...s, name: state.name, symbol: state.avatar })),
    ...articles.slice(0, 5).map((a) => ({
      ...a,
      name: {
        a1: "Точность",
        a2: "Рост",
        a3: "Экспонента",
        a4: "Пропорции",
        a5: "Проценты",
      }[a.id],
      text: a.subtitle,
      result: evaluate(a.expression),
      symbol: a.symbol,
    })),
  ];
}
function calcCard(compact = false) {
  return `<section class="surface calculator ${compact ? "dashboard-calculator" : ""}" aria-label="Калькулятор"><div class="card-top"><div class="label">${icon("calc")} КАЛЬКУЛЯТОР</div><div class="pill-tabs">${btn("Обычный", "mode", !scientific ? "selected" : "", 'data-mode="basic"')}${btn("Научный", "mode", scientific ? "selected" : "", 'data-mode="science"')}</div></div><div class="calc-display"><div class="display-meta"><span id="calc-angle">${angle} <i>·</i> ${state.memory ? "M = " + fmt(state.memory) : "ГОТОВ К ВЫЧИСЛЕНИЯМ"}</span>${btn(icon("history"), "nav", "icon-button", 'data-view="history" aria-label="История вычислений"')}</div><label class="sr-only" for="expression">Выражение</label><input id="expression" class="expression-input" autocomplete="off" spellcheck="false" inputmode="text" placeholder="0" value="${esc(expr)}"><output id="calc-result" class="calc-result ${error ? "error" : ""}" aria-live="polite">${error ? esc(error) : fmt(result)}</output><div class="result-caption" id="result-caption">${finished ? "РЕЗУЛЬТАТ ВЫЧИСЛЕНИЯ" : ""}</div></div>${scientific ? `<div class="science-keys">${["sin(", "cos(", "tan(", "asin(", "acos(", "atan(", "ln(", "log(", "sqrt(", "cbrt(", "abs(", "exp(", "π", "e", "^", "!", "(", ")", "ans", "mem", "sinh(", "cosh(", "tanh(", "round("].map((k) => btn(k.replace("(", "") || k, "key", "science-key", `data-key="${k}"`)).join("")}</div>` : ""}<div class="memory-row">${["MC", "MR", "MS", "M+", "M−", angle].map((k) => btn(k, "memory", "text-button", `data-key="${k}"`)).join("")}</div><div class="keypad">${["AC", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "⌫", "0", ",", "="].map((k) => btn(k, "key", `key ${["÷", "×", "−", "+"].includes(k) ? "operator" : ""} ${k === "=" ? "equals" : ""} ${["AC", "±", "%"].includes(k) ? "utility" : ""}`, `data-key="${k}" aria-label="${{ "⌫": "Удалить символ", AC: "Очистить", "=": "Вычислить" }[k] || k}"`)).join("")}</div><div class="calc-bottom">${btn(`${icon("copy")} Копировать`, "copy", "text-button")}${btn(`${icon("share")} Поделиться`, "share", "text-button")}${btn(`${icon("plus")} В ленту`, "publish", "text-button")}</div></section>`;
}
function recommendation() {
  let used = state.history[0]?.kind;
  return tools
    .filter(
      (t) =>
        t.category ===
        (used === "Финансы"
          ? "Финансы"
          : used === "Геометрия"
            ? "Геометрия"
            : "На каждый день"),
    )
    .slice(0, 4);
}
function home() {
  let hour = new Date().getHours(),
    greet =
      hour < 6
        ? "Спокойной ночи"
        : hour < 12
          ? "Доброе утро"
          : hour < 18
            ? "Добрый день"
            : "Добрый вечер";
  return `${heading("AORI CALCULATE / ЛИЧНОЕ ПРОСТРАНСТВО", `${greet}, ${esc(state.name)}<span class="heading-dot">.</span>`, "Сегодня можно посчитать чуть больше обычного.")}${stories()}${universe?.home() || ""}<div class="dashboard-grid">${calcCard(true)}<div class="dashboard-right"><section class="surface hero-card"><div class="eyebrow">КАЛЬКУЛЯТОР С ОБШИРНЫМИ ПЛАНАМИ</div><h2>У чисел<br>свои планы<span class="heading-dot">.</span></h2><p>Ваши расчёты заслуживают собственной ленты.<br>И, возможно, нескольких подписчиков.</p><div class="math-art" aria-hidden="true"><span class="art-ring"></span><span class="art-orb">a</span><span class="art-small">²</span><span class="art-spark">+</span><span class="art-equal">=</span></div>${btn(`Исследовать ${total} возможностей ${icon("arrow")}`, "catalog", "primary")}</section><section class="surface daily-card"><div class="card-top"><span class="label">${icon("bolt")} ЗАДАЧА ДНЯ</span><span class="badge green-badge">+25 XP</span></div><h3>Скидка на скидку</h3><p>Цена 2 000. Сначала −20%, затем −10%.<br>Сколько останется заплатить?</p><div class="challenge-bottom"><span class="mono">2 000 × 0,8 × 0,9 = ?</span>${btn("Решить " + icon("arrow"), "daily", "round-button", 'aria-label="Решить задачу дня"')}</div></section><section class="surface progress-card"><span class="avatar">${esc(state.avatar)}</span><div><b>Уровень ${level()}. ${state.xp < 100 ? "Начало большого счёта" : "Числа под контролем"}</b><p>${state.xp} XP · ${state.history.length} вычислений</p><div class="progress-track"><i style="width:${Math.min(100, state.xp % 100)}%"></i></div></div>${btn(icon("chevron"), "nav", "icon-button", 'data-view="profile" aria-label="Открыть профиль"')}</section></div></div><div class="section-heading"><div><span class="eyebrow">ПОД ВАШИ ЗАДАЧИ</span><h2>Полезно прямо сейчас</h2></div>${btn("Все инструменты " + icon("arrow"), "nav", "text-button", 'data-view="tools"')}</div><div class="quick-grid">${recommendation()
    .map((t, i) =>
      btn(
        `<span class="tool-symbol ${["lavender", "green", "peach", "blue"][i]}">${["%", "÷", "↗", "⅟"][i]}</span><span><b>${t.title}</b><small>${t.category}</small></span>${icon("arrow")}`,
        "tool",
        "surface quick-card",
        `data-id="${t.id}"`,
      ),
    )
    .join(
      "",
    )}</div><div class="section-heading"><div><span class="eyebrow">МЫСЛИ, КОТОРЫЕ СХОДЯТСЯ</span><h2>В поле вашего зрения</h2></div>${btn("Открыть ленту " + icon("arrow"), "nav", "text-button", 'data-view="community"')}</div><div class="editorial-grid">${articleCard(articles[0])}${postCard([...state.posts, ...seed][0], true)}${articleCard(articles[1])}</div>`;
}
function toolCards() {
  let q = search.toLowerCase();
  return tools
    .filter(
      (t) =>
        (category === "Все" || category === t.category) &&
        (t.title + " " + t.category + " " + t.formula)
          .toLowerCase()
          .includes(q),
    )
    .map(
      (t) =>
        `<article class="surface tool-card"><div class="card-top"><span class="tag">${t.category}</span>${btn(icon("star"), "favorite", `icon-button ${state.favorites.includes(t.id) ? "lit" : ""}`, `data-id="${t.id}" aria-label="Избранное: ${t.title}"`)}</div><h3>${t.title}</h3><p class="mono">${esc(t.formula)}</p>${btn("Открыть " + icon("arrow"), "tool", "text-button", `data-id="${t.id}"`)}</article>`,
    )
    .join("");
}
function toolsPage() {
  return `${heading("ВЫЧИСЛЕНИЯ НА ЛЮБОЙ СЛУЧАЙ", "Каталог расчётов.", `${tools.length} специализированных калькуляторов и ${conversions.length} преобразования единиц.`)}<div class="search-field">${icon("search")}<input id="tool-search" placeholder="Проценты, площадь, кредит…" value="${esc(search)}" aria-label="Поиск инструмента"></div><div class="chips" role="group" aria-label="Категория">${["Все", ...new Set(tools.map((t) => t.category)), "Избранное", "Конвертер"].map((c) => btn(c, "category", category === c ? "chip active" : "chip", `data-category="${c}"`)).join("")}</div><div id="tools-grid" class="tools-grid">${
    category === "Конвертер"
      ? converterCards()
      : category === "Избранное"
        ? tools
            .filter((t) => state.favorites.includes(t.id))
            .map((t) =>
              btn(
                `${t.title} ${icon("arrow")}`,
                "tool",
                "surface quick-card",
                `data-id="${t.id}"`,
              ),
            )
            .join("") ||
          empty(
            "Избранные инструменты появятся здесь.",
            "Нажмите звезду рядом с нужной формулой.",
          )
        : toolCards() ||
          empty("Ничего не найдено", "Попробуйте другое название.")
  }</div>`;
}
function converterCards() {
  return conversions
    .filter((c) =>
      (c.title + c.category).toLowerCase().includes(search.toLowerCase()),
    )
    .map(
      (c) =>
        `<div class="surface tool-card"><span class="tag">${c.category}</span><h3>${c.title}</h3>${btn("Преобразовать " + icon("arrow"), "convert", "text-button", `data-id="${c.id}"`)}</div>`,
    )
    .join("");
}
function openTool(id) {
  let t = tools.find((t) => t.id === id);
  if (!t) return;
  state.used = [...new Set([...state.used, id])];
  persist();
  openModal(
    `<span class="eyebrow">${t.category}</span><h2>${t.title}</h2><p class="formula-banner mono">${esc(t.formula)}</p><form id="tool-form" data-id="${id}">${t.category === "Статистика" ? `<label>Числа через пробел или точку с запятой<textarea name="series" rows="3" required>${t.defaults.join(" ")}</textarea></label>` : t.labels.map((l, i) => `<label>${l}<input type="number" step="any" name="n${i}" value="${t.defaults[i]}" required></label>`).join("")}<button class="primary" type="submit">Рассчитать ${icon("arrow")}</button></form><div id="tool-output" class="tool-output" aria-live="polite"></div>`,
  );
}
function openConvert(id) {
  let c = conversions.find((c) => c.id === id);
  openModal(
    `<span class="eyebrow">ПРЕОБРАЗОВАНИЕ ЕДИНИЦ</span><h2>${c.title}</h2><form id="convert-form" data-id="${id}"><label>Значение<input name="value" type="number" value="1" step="any" required></label><label>Направление<select name="direction"><option value="forward">${c.from} → ${c.to}</option><option value="reverse">${c.to} → ${c.from}</option></select></label><button class="primary" type="submit">Преобразовать ${icon("arrow")}</button></form><div id="tool-output" class="tool-output" aria-live="polite"></div>`,
  );
}
function empty(title, sub) {
  return `<div class="empty surface">${icon("calc")}<h3>${title}</h3><p>${sub}</p></div>`;
}
function articleCard(a) {
  return `<article class="surface article-card"><button class="article-art ${a.color}" data-action="article" data-id="${a.id}" aria-label="Читать: ${a.title}"><span>${a.symbol}</span><div class="art-lines"></div></button><div class="article-body"><span class="eyebrow">${a.tag}</span><h3>${btn(a.title, "article", "text-button", `data-id="${a.id}"`)}</h3><p>${a.subtitle}</p><div class="article-foot"><span>3 минуты · ${state.read.includes(a.id) ? "Прочитано" : "Aori Journal"}</span>${btn(icon("arrow"), "article", "icon-button", `data-id="${a.id}" aria-label="Читать статью"`)}</div></div></article>`;
}
function learn() {
  return `${heading("AORI JOURNAL", "Числа со смыслом.", "Разбираемся в том, что стоит за кнопкой «равно».")}<div class="article-grid">${articles.map(articleCard).join("")}</div>`;
}
function postCard(p, compact = false) {
  return `<article class="surface post-card"><div class="post-author"><span class="avatar ${colorClass(p.color)}">${esc(p.avatar)}</span><div><b>${esc(p.author)}</b><small>${p.editorial ? "Редакционная коллекция" : "Ваш расчёт"} · ${esc(p.topic)}</small></div>${!compact && p.author !== state.name ? btn(state.following.includes(p.author) ? icon("check") : icon("plus"), "follow", "icon-button", `data-author="${esc(p.author)}" aria-label="Подписка на ${esc(p.author)}"`) : ""}</div><p>${esc(p.text)}</p><button class="post-equation" data-action="use-post" data-id="${p.id}"><span class="mono">${esc(p.expression)}</span><strong>= ${esc(fmt(p.result))}</strong><span class="post-hint">Открыть в калькуляторе ${icon("arrow")}</span></button><div class="post-footer">${btn(`${icon("heart")} ${state.likes.includes(p.id) ? "Нравится" : "Оценить"}`, "like", `text-button ${state.likes.includes(p.id) ? "lit" : ""}`, `data-id="${p.id}"`)}${btn(`${icon("message")} ${state.comments[p.id]?.length || ""}`, "comments", "text-button", `data-id="${p.id}" aria-label="Комментарии к формуле"`)}${btn(icon("bookmark"), "save-post", `icon-button ${state.saved.includes(p.id) ? "lit" : ""}`, `data-id="${p.id}" aria-label="Сохранить формулу"`)}${btn(icon("share"), "share-post", "icon-button", `data-id="${p.id}" aria-label="Поделиться формулой"`)}</div></article>`;
}
function community() {
  let posts = [...state.posts, ...seed].filter(
    (p) =>
      (feedTab === "Подписки"
        ? state.following.includes(p.author)
        : feedTab === "Сохранённое"
          ? state.saved.includes(p.id)
          : true) &&
      (p.text + p.expression + p.author + p.topic)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return `${heading("ОБЩИЙ ЗНАМЕНАТЕЛЬ", "Мысли сходятся здесь.", "Локальная лента формул. Делитесь расчётами по ссылке с теми, кто считает вместе с вами.")}${stories()}<div class="community-layout"><div><section class="surface composer"><span class="avatar">${esc(state.avatar)}</span>${btn("Какая формула у вас сегодня?", "publish", "composer-prompt")}${btn(icon("plus"), "publish", "round-button", 'aria-label="Опубликовать расчёт"')}</section><div class="chips">${["Для вас", "Подписки", "Сохранённое"].map((t) => btn(t, "feed-tab", feedTab === t ? "chip active" : "chip", `data-tab="${t}"`)).join("")}</div><div class="search-field">${icon("search")}<input id="feed-search" placeholder="Найти формулу, автора или тему" value="${esc(search)}" aria-label="Поиск в ленте"></div><div class="feed" id="feed-list">${posts.map((p) => postCard(p)).join("") || empty("Здесь пока тихо", "Подпишитесь на авторов или сохраните интересную формулу.")}</div></div><aside class="community-aside"><section class="surface aside-card"><span class="eyebrow">ПОХОЖИЙ ХОД МЫСЛИ</span><h3>Ваш круг вычислений</h3>${authors.map((a, i) => `<div class="author-row"><span class="avatar">${["φ", "%", "97"][i]}</span><span><b>${a}</b><small>Формулы и разборы</small></span>${btn(state.following.includes(a) ? icon("check") : icon("plus"), "follow", "icon-button", `data-author="${a}" aria-label="Подписка на ${a}"`)}</div>`).join("")}</section><section class="surface aside-card"><span class="eyebrow">ВОПРОС МЕТОДА</span><h3>Как посчитать 18 × 5?</h3><p>Один результат. Два пути.</p>${["18 × 10 ÷ 2", "20 × 5 − 10"].map((v, i) => btn(`${v} ${state.poll === i ? icon("check") : ""}`, "poll", `poll-option ${state.poll === i ? "active" : ""}`, `data-choice="${i}"`)).join("")}<small>Ваш выбор сохраняется на этом устройстве.</small></section><section class="surface aside-card"><span class="eyebrow">КОЛЛЕКЦИИ</span><h3>Соберите свою систему</h3><p>${state.collections.length} коллекций вычислений</p>${btn("Создать коллекцию " + icon("plus"), "collection", "text-button")}${state.collections.map((c) => `<button class="collection-item" data-action="open-collection" data-id="${c.id}"><b>${esc(c.name)}</b><small>${c.items.length} расчётов</small></button>`).join("")}</section></aside></div>`;
}
function history() {
  let items = state.history
    .filter((h) => (h.expression + " " + h.result).includes(search))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return `${heading("НИ ОДНОГО ПОТЕРЯННОГО ОТВЕТА", "История вычислений.", `${state.history.length} расчётов · сохраняются на этом устройстве`)}<div class="toolbar"><div class="search-field">${icon("search")}<input id="history-search" placeholder="Найти выражение или результат" value="${esc(search)}" aria-label="Поиск истории"></div>${btn(icon("download") + " Экспорт CSV", "export-csv", "secondary")}</div><div class="history-list">${items.length ? items.map((h) => `<article class="surface history-item"><div><span class="mono">${esc(h.expression)}</span><strong>= ${esc(fmt(h.result))}</strong><small>${new Date(h.date).toLocaleString("ru-RU")} · ${esc(h.kind)}</small></div><div>${btn(icon("bookmark"), "pin", `icon-button ${h.pinned ? "lit" : ""}`, `data-id="${h.id}" aria-label="Закрепить расчёт"`)}${btn(icon("arrow"), "reuse", "icon-button", `data-id="${h.id}" aria-label="Повторить расчёт"`)}</div></article>`).join("") : empty("Первое вычисление станет началом", "Введите выражение в калькуляторе.")}</div>`;
}
const achievements = () => [
  [
    "Первое равенство",
    "Выполнить один расчёт",
    state.history.length >= 1,
    state.history.length,
    1,
  ],
  [
    "На одной волне",
    "Выполнить 10 расчётов",
    state.history.length >= 10,
    state.history.length,
    10,
  ],
  [
    "Сотня ответов",
    "Выполнить 100 расчётов",
    state.history.length >= 100,
    state.history.length,
    100,
  ],
  [
    "Автор формулы",
    "Опубликовать расчёт в ленте",
    state.posts.length > 0,
    state.posts.length,
    1,
  ],
  [
    "Момент истины",
    "Создать историю расчёта",
    state.stories.length > 0,
    state.stories.length,
    1,
  ],
  [
    "Исследователь",
    "Открыть 10 инструментов",
    state.used.length >= 10,
    state.used.length,
    10,
  ],
  [
    "Разбор по существу",
    "Прочитать все 6 статей",
    state.read.length >= 6,
    state.read.length,
    6,
  ],
  [
    "Быстрый счёт",
    "Решить 10 заданий за тренировку",
    state.gameBest >= 10,
    state.gameBest,
    10,
  ],
  ["Ритм чисел", "Считать три дня подряд", streak() >= 3, streak(), 3],
  [
    "Хранитель",
    "Закрепить пять расчётов",
    state.history.filter((h) => h.pinned).length >= 5,
    state.history.filter((h) => h.pinned).length,
    5,
  ],
  [
    "Свой круг",
    "Подписаться на три коллекции",
    state.following.length >= 3,
    state.following.length,
    3,
  ],
  [
    "Общий знаменатель",
    "Оставить комментарий к формуле",
    Object.values(state.comments).flat().length > 0,
    Object.values(state.comments).flat().length,
    1,
  ],
];
function profile() {
  return `${heading("ВАША МАТЕМАТИЧЕСКАЯ ИДЕНТИЧНОСТЬ", "Всё сходится на вас.")}<section class="surface profile-hero"><div class="profile-orb">${esc(state.avatar)}</div><div><span class="eyebrow">УРОВЕНЬ ${level()} · ${state.xp} XP</span><h2>${esc(state.name)}</h2><p>${esc(state.bio)}</p>${btn("Редактировать профиль", "edit-profile", "secondary")}</div><div class="profile-stats"><div><b>${state.history.length}</b><span>вычислений</span></div><div><b>${streak()}</b><span>дней подряд</span></div><div><b>${achievements().filter((a) => a[2]).length}/12</b><span>достижений</span></div></div></section><div class="section-heading"><h2>Следы ваших вычислений</h2>${btn("История " + icon("arrow"), "nav", "text-button", 'data-view="history"')}</div><div class="stat-grid">${[
    [
      "Самый большой ответ",
      state.history.length
        ? fmt(
            Math.max(
              ...state.history
                .filter((h) => typeof h.result === "number")
                .map((h) => h.result),
              0,
            ),
          )
        : "—",
    ],
    ["Тренировок", state.games],
    ["Открыто инструментов", state.used.length],
    ["Формул в ленте", state.posts.length],
  ]
    .map(
      ([a, b]) =>
        `<div class="surface stat"><span>${a}</span><b>${b}</b></div>`,
    )
    .join(
      "",
    )}</div><div class="section-heading"><h2>Есть чем гордиться</h2><span class="muted">Достижения открываются за ваши действия</span></div><div class="achievement-grid">${achievements()
    .map(
      ([t, d, done, n, max]) =>
        `<article class="surface achievement ${done ? "unlocked" : ""}"><span class="achievement-icon">${icon(done ? "trophy" : "calc")}</span><h3>${t}</h3><p>${d}</p><div class="progress-track"><i style="width:${Math.min(100, (n / max) * 100)}%"></i></div><small>${done ? "Открыто" : Math.min(n, max) + " / " + max}</small></article>`,
    )
    .join(
      "",
    )}</div><div class="section-heading"><h2>Ваши данные под рукой</h2></div><section class="surface backup"><div><b>История, профиль и оформление</b><p>Резервная копия переносит ваше пространство на другое устройство.</p></div>${btn("Скачать JSON", "export-json", "secondary")}<label class="secondary file-label">Восстановить<input id="import-json" type="file" accept="application/json" hidden></label></section><section class="surface install-card"><div><h3>Калькулятор всегда рядом</h3><p>Добавьте приложение на главный экран. После первого открытия вычисления доступны офлайн.</p></div>${btn("Как установить " + icon("arrow"), "install", "secondary")}</section>`;
}
function games() {
  return `${heading("ФИТНЕС ДЛЯ ВАШЕГО КАЛЬКУЛЯТОРА", "Держите мысль в тонусе.", "Пять тренировок устного счёта. По минуте на попытку.")}<div class="surface game-hero"><div><span class="eyebrow">ЛИЧНЫЙ РЕКОРД</span><h2>${state.gameBest}<span> верных ответов</span></h2><p>${state.games} завершённых тренировок. Следующий рекорд ближе, чем кажется.</p></div><div class="game-art" aria-hidden="true">×<span>+</span></div></div><div class="games-grid">${[
    [
      "sprint",
      "01",
      "Арифметический спринт",
      "Сложение, вычитание и умножение. 60 секунд на точность.",
      "+",
    ],
    [
      "operator",
      "02",
      "Недостающее действие",
      "Верните оператор на место. Выберите +, − или ×.",
      "?",
    ],
    [
      "compare",
      "03",
      "Больше или меньше",
      "Сравните два выражения без подсказки калькулятора.",
      "≷",
    ],
    [
      "sequence",
      "04",
      "Следующее число",
      "Найдите закономерность арифметической последовательности.",
      "…",
    ],
    [
      "percent",
      "05",
      "Чувство процента",
      "Скидки и доли без долгих раздумий.",
      "%",
    ],
  ]
    .map(
      ([id, n, t, d, s]) =>
        `<article class="surface game-card"><div class="card-top"><span class="eyebrow">ТРЕНИРОВКА ${n}</span><span class="game-symbol">${s}</span></div><h3>${t}</h3><p>${d}</p>${btn("Начать " + icon("arrow"), "start-game", "primary", `data-mode="${id}"`)}</article>`,
    )
    .join("")}</div>`;
}
function settings() {
  let s = state.settings;
  return `${heading("ВАШ СПОСОБ ВИДЕТЬ ЧИСЛА", "Настройте поверхность.", "Материал, точность и ощущение каждой клавиши.")}<div class="settings-layout"><section class="surface settings-card"><h3>Материал Aori Surface</h3><p>Мягкий свет, глубина и спокойные контуры.</p><div class="theme-grid">${[
    ["surface", "Surface", "lavender"],
    ["midnight", "Midnight", "blue"],
    ["graphite", "Graphite", "gray"],
    ["paper", "Paper", "paper"],
  ]
    .map(([v, t, c]) =>
      btn(
        `<span class="theme-sample ${c}">7 <i>+</i></span><b>${t}</b>${s.theme === v ? icon("check") : ""}`,
        "theme",
        `theme-option ${s.theme === v ? "active" : ""}`,
        `data-theme="${v}"`,
      ),
    )
    .join(
      "",
    )}</div><h3>Акцент вычислений</h3><div class="swatches">${["#b9a1ff", "#bfe79a", "#f2bc9d", "#9bcef2", "#f0a9d2", "#e8d993"].map((c) => btn("", "accent", `swatch ${s.accent === c ? "active" : ""}`, `style="--swatch:${c}" data-color="${c}" aria-label="Цвет ${c}"`)).join("")}</div>${settingRange("radius", "Радиус клавиш", 8, 32, 1, s.radius, "px")}${settingRange("glass", "Глубина материала", 15, 95, 5, s.glass, "%")}${settingRange("size", "Размер результата", 0.8, 1.3, 0.1, s.size, "×")}</section><section class="surface settings-card"><h3>Вычисления</h3><label class="setting-line"><span>Знаков после запятой<small>Округление при отображении</small></span><select data-setting="precision">${[0, 2, 4, 6, 8, 10, 12].map((v) => `<option value="${v}" ${s.precision === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>${toggle("group", "Разделение разрядов", "1 000 000 вместо 1000000")}${toggle("sound", "Звук клавиш", "Короткий тон при вводе")}${toggle("haptic", "Тактильный отклик", "На устройствах с поддержкой вибрации")}<h3>Пространство</h3><label class="setting-line"><span>Плотность интерфейса</span><select data-setting="density"><option value="normal" ${s.density === "normal" ? "selected" : ""}>Свободная</option><option value="compact" ${s.density === "compact" ? "selected" : ""}>Компактная</option></select></label>${toggle("motion", "Анимация материала", "Мягкие переходы и движение")}${toggle("glow", "Фоновое свечение", "Свет за поверхностью")}${toggle("focus", "Режим фокуса", "Оставить в калькуляторе только вычисления")}${btn("Вернуть начальные настройки", "reset-settings", "text-button")}</section></div>`;
}
function toggle(k, t, sub) {
  return `<label class="setting-line"><span>${t}<small>${sub}</small></span><input class="switch" type="checkbox" data-setting="${k}" ${state.settings[k] ? "checked" : ""}></label>`;
}
function settingRange(k, t, min, max, step, value, unit) {
  return `<label class="setting-range"><span>${t}<b>${value}${unit}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-setting="${k}"></label>`;
}
function lab() {
  return `${heading("ИССЛЕДУЙТЕ ЗАВИСИМОСТИ", "Посмотрите на формулу.", "График, таблица, производная и интеграл в одной рабочей области.")}<div class="lab-layout"><section class="surface settings-card"><form id="lab-form"><label>Функция f(x)<input name="formula" value="sin(x)" required placeholder="sin(x)" spellcheck="false"></label><div class="form-row"><label>От x<input name="min" type="number" value="-10" step="any" required></label><label>До x<input name="max" type="number" value="10" step="any" required></label></div><label>Точка для анализа<input name="point" type="number" value="1" step="any" required></label><label>Вторая функция для сравнения<input name="second" placeholder="Например, cos(x)" spellcheck="false"></label><p class="muted">Тригонометрия в лаборатории использует радианы. Интеграл и производная вычисляются численно.</p><button type="submit" class="primary">Исследовать ${icon("arrow")}</button></form><div class="lab-presets">${["sin(x)", "x^2", "1/x", "exp(-x)", "sqrt(x)", "cos(x)"].map((s) => btn(s, "lab-preset", "chip", `data-expression="${s}"`)).join("")}</div></section><section class="surface lab-result" id="lab-result"><div class="graph-placeholder"><span>ƒ(x)</span><h3>У каждого выражения есть форма</h3><p>Введите функцию и нажмите «Исследовать».</p></div></section></div>`;
}
function render() {
  if (universe?.supports(view)) {
    $("#app").innerHTML = shell(universe.render(view));
    applySettings();
    universe.apply();
    return;
  }
  let f =
    {
      home,
      calc: () =>
        `${heading("ТОЧНОСТЬ В КАЖДОМ ДЕЙСТВИИ", "Калькулятор.")}<div class="full-calc">${calcCard()}<aside class="surface calc-notes"><span class="eyebrow">УПРАВЛЕНИЕ</span><h3>Ввод с клавиатуры</h3><p>Enter — получить ответ<br>Esc — очистить<br>Backspace — удалить символ<br>Скобки — сохранить порядок</p><p>Процент означает сотую часть: <span class="mono">200 × 10% = 20</span>.</p><h3>Последние ответы</h3>${
          state.history
            .slice(0, 4)
            .map((h) =>
              btn(
                `${esc(h.expression)} <b>= ${esc(fmt(h.result))}</b>`,
                "reuse",
                "recent-answer",
                `data-id="${h.id}"`,
              ),
            )
            .join("") || "<p>Ваши расчёты появятся здесь.</p>"
        }${btn("Вся история " + icon("arrow"), "nav", "text-button", 'data-view="history"')}</aside></div>`,
      tools: toolsPage,
      community,
      learn,
      history,
      profile,
      games,
      settings,
      lab,
    }[view] || home;
  $("#app").innerHTML = shell(f());
  applySettings();
}
function openModal(content, cls = "") {
  lastFocus = document.activeElement;
  let d = $("#modal");
  d.className = cls;
  d.innerHTML = `${btn(icon("close"), "close", "modal-close icon-button", 'aria-label="Закрыть"')}<div class="modal-content">${content}</div>`;
  if (!d.open) d.showModal();
}
function closeModal() {
  if (game?.timer) {
    clearInterval(game.timer);
    game = null;
  }
  $("#modal").close();
  lastFocus?.focus?.();
}
function bestExpression() {
  if (expr) return expr;
  let h = state.history.find((h) => !h.toolId && !h.estimateId);
  return h?.expression || "2+2";
}
function publish() {
  let source = bestExpression();
  openModal(
    `<span class="eyebrow">МЫСЛЬ В ФОРМЕ ВЫЧИСЛЕНИЯ</span><h2>Поделиться решением</h2><form id="post-form"><label>Выражение<input name="expression" value="${esc(source)}" required maxlength="300"></label><label>Что стоит за этим расчётом?<textarea name="text" placeholder="Объясните свой ход мысли" required maxlength="1000" rows="3"></textarea></label><label>Тема<select name="topic"><option>На каждый день</option><option>Финансы</option><option>Геометрия</option><option>Теория чисел</option><option>Наука</option></select></label><p class="muted">Публикация сохранится в вашей локальной ленте. Для отправки другу используйте ссылку на расчёт.</p><button type="submit" class="primary">Опубликовать расчёт ${icon("arrow")}</button></form>`,
  );
}
function createStory() {
  openModal(
    `<span class="eyebrow">24 ЧАСА В ЖИЗНИ ЧИСЛА</span><h2>Ваша история расчёта</h2><form id="story-form"><label>Формула<input name="expression" required value="${esc(bestExpression())}"></label><label>Подпись<input name="text" placeholder="Сегодня всё сошлось" maxlength="160" required></label><label>Материал<select name="color"><option value="lavender">Аметист</option><option value="green">Шалфей</option><option value="peach">Терракота</option><option value="blue">Лёд</option></select></label><button class="primary" type="submit">Сохранить историю ${icon("arrow")}</button></form>`,
  );
}
function showStory(i) {
  let all = visibleStories();
  storyIndex = (i + all.length) % all.length;
  let s = all[storyIndex];
  openModal(
    `<div class="story-progress">${all.map((_, n) => `<i class="${n <= storyIndex ? "seen" : ""}"></i>`).join("")}</div><div class="story-header"><span class="avatar">${esc(s.symbol)}</span><b>${esc(s.name)}</b><small>${s.date ? "Ваш расчёт · 24 часа" : "Aori Journal"}</small></div><div class="story-stage ${colorClass(s.color)}"><span class="eyebrow">ЧИСЛО СЕГОДНЯ</span><p>${esc(s.expression)}</p><strong>${esc(fmt(s.result))}</strong><h3>${esc(s.text || s.subtitle)}</h3></div><div class="story-actions">${btn("Назад", "story-prev", "secondary")}${btn("Посчитать", "story-use", "primary")}${btn("Далее " + icon("arrow"), "story-next", "secondary")}</div>`,
    "story-modal",
  );
}
function catalog() {
  openModal(
    `<span class="eyebrow">ВСЁ СВЯЗАНО С ВЫЧИСЛЕНИЯМИ</span><h2>${total} возможностей.<br>Один калькулятор.</h2><div class="search-field">${icon("search")}<input id="catalog-search" placeholder="Найти любую возможность" aria-label="Поиск возможностей"></div><div id="catalog-list" class="catalog-list">${catalogList("")}</div>`,
  );
}
function catalogList(q) {
  let list = [
    ...tools.map((t) => ({ ...t, action: "tool" })),
    ...conversions.map((c) => ({ ...c, action: "convert" })),
    ...[...appFeatures, ...universeFeatures, ...eventFeatures].map((f) => ({
      ...f,
      action: "feature",
    })),
  ].filter((t) =>
    (t.title + " " + (t.category || ""))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    list
      .map((t, i) =>
        btn(
          `<span class="catalog-number">${String(i + 1).padStart(3, "0")}</span><span>${t.title}<small>${t.category || "Aori Calculate"}</small></span>${icon("arrow")}`,
          t.action,
          "catalog-item",
          `data-id="${t.id}" data-view="${t.view || ""}"`,
        ),
      )
      .join("") || "<p>Попробуйте другое слово.</p>"
  );
}
async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    toast("Скопировано");
  } catch {
    openModal(
      `<h2>Скопируйте текст</h2><textarea readonly rows="5">${esc(t)}</textarea>`,
    );
  }
}
function sharedUrl(source) {
  let u = new URL(location.href);
  u.hash = "calc";
  u.search = "";
  u.searchParams.set("expression", source);
  return u.href;
}
function download(name, text, type) {
  let a = document.createElement("a"),
    url = URL.createObjectURL(new Blob([text], { type }));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function sound() {
  let s = state.settings;
  if (s.haptic) navigator.vibrate?.(8);
  if (s.sound) {
    try {
      const ctx =
        sound.ctx ||
        (sound.ctx = new (window.AudioContext || window.webkitAudioContext)());
      ctx.resume();
      let o = ctx.createOscillator(),
        g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 540;
      g.gain.setValueAtTime(0.035, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      o.start();
      o.stop(ctx.currentTime + 0.04);
    } catch {}
  }
}
function key(k) {
  sound();
  if (k === "AC") {
    expr = "";
    result = 0;
    error = "";
    finished = false;
  } else if (k === "⌫") {
    expr = expr.slice(0, -1);
    finished = false;
    error = "";
  } else if (k === "=") {
    if (!expr) return;
    let r = compute();
    if (r !== null) finished = true;
  } else if (k === "±") {
    expr = expr ? `-(${expr})` : "-";
    finished = false;
  } else {
    if (finished && !["+", "−", "×", "÷", "^", "%", "!"].includes(k)) expr = "";
    else if (finished) expr = String(result);
    expr += k === "," ? "." : k;
    finished = false;
    error = "";
  }
  updateDisplay();
}
function updateDisplay() {
  if ($("#expression")) $("#expression").value = expr;
  let preview = result;
  if (!finished && !error && expr)
    try {
      preview = evaluate(expr, { angle, ans: result, memory: state.memory });
    } catch {}
  if ($("#calc-result")) {
    $("#calc-result").textContent = error || fmt(preview);
    $("#calc-result").classList.toggle("error", !!error);
  }
  if ($("#result-caption"))
    $("#result-caption").textContent = error
      ? "Проверьте выражение"
      : finished
        ? "РЕЗУЛЬТАТ ВЫЧИСЛЕНИЯ"
        : "ПРЕДПРОСМОТР РЕЗУЛЬТАТА";
  if ($("#calc-angle"))
    $("#calc-angle").textContent =
      angle +
      (state.memory ? " · M = " + fmt(state.memory) : " · ГОТОВ К ВЫЧИСЛЕНИЯМ");
}
function newGame(mode) {
  game = { mode, score: 0, remaining: 60, end: Date.now() + 60000 };
  nextQuestion();
  game.timer = setInterval(() => {
    if (!game) return;
    game.remaining = Math.max(0, Math.ceil((game.end - Date.now()) / 1000));
    let t = $("#game-time");
    if (t) t.textContent = game.remaining + " с";
    if (game.remaining <= 0) finishGame();
  }, 250);
}
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
function nextQuestion() {
  if (!game) return;
  let a = rand(2, 19),
    b = rand(2, 12),
    mode = game.mode,
    choices = null;
  if (mode === "sprint") {
    let op = ["+", "−", "×"][rand(0, 2)];
    game.question = `${a} ${op} ${b}`;
    game.answer = op === "+" ? a + b : op === "−" ? a - b : a * b;
  } else if (mode === "percent") {
    let p = [5, 10, 15, 20, 25, 50][rand(0, 5)],
      n = rand(1, 20) * 100;
    game.question = `${p}% от ${n}`;
    game.answer = (n * p) / 100;
  } else if (mode === "sequence") {
    let d = rand(2, 8);
    game.question = `${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ?`;
    game.answer = a + 4 * d;
  } else if (mode === "operator") {
    let op = ["+", "−", "×"][rand(0, 2)];
    game.answer = op;
    game.question = `${a} ? ${b} = ${op === "+" ? a + b : op === "−" ? a - b : a * b}`;
    choices = ["+", "−", "×"];
  } else {
    let c = rand(2, 19),
      d = rand(2, 12);
    game.question = `${a} × ${b} ? ${c} + ${d}`;
    game.answer = a * b > c + d ? ">" : a * b < c + d ? "<" : "=";
    choices = ["<", "=", ">"];
  }
  game.choices = choices;
  openModal(
    `<span class="eyebrow">ТРЕНИРОВКА ВЫЧИСЛЕНИЙ</span><div class="game-score"><b id="game-time">${game.remaining} с</b><span>${game.score} верных ответов</span></div><div class="game-question">${game.question}</div>${choices ? `<div class="game-choices">${choices.map((v) => btn(v, "game-answer", "primary", `data-value="${v}"`)).join("")}</div>` : `<form id="game-form"><label class="sr-only" for="game-answer">Ваш ответ</label><input id="game-answer" name="answer" type="number" step="any" inputmode="decimal" autocomplete="off" placeholder="Ваш ответ" required autofocus><button class="primary" type="submit">Ответить ${icon("arrow")}</button></form>`}<p id="game-feedback" class="muted">Точность важнее спешки.</p>`,
  );
  $("#game-answer")?.focus();
}
function checkGame(answer) {
  if (!game) return;
  if (String(answer) === String(game.answer)) {
    game.score++;
    nextQuestion();
  } else {
    $("#game-feedback").textContent = "Пока не сходится. Попробуйте ещё раз.";
    $("#game-answer")?.select();
  }
}
function finishGame() {
  clearInterval(game.timer);
  let score = game.score;
  state.games++;
  state.gameBest = Math.max(state.gameBest, score);
  dailyMark();
  reward(score * 3);
  game = null;
  openModal(
    `<span class="eyebrow">ТРЕНИРОВКА ЗАВЕРШЕНА</span><h2>${score} верных ответов.</h2><p>Получено ${score * 3} XP. Личный рекорд: ${state.gameBest}.</p>${btn("К тренировкам", "finish-game", "primary")}`,
  );
}
document.addEventListener("click", async (e) => {
  let b = e.target.closest("[data-action]");
  if (!b) return;
  let a = b.dataset.action,
    id = b.dataset.id,
    p = [...state.posts, ...seed].find((p) => p.id === id);
  if (a === "nav") {
    navigate(b.dataset.view);
    return;
  }
  if (a === "close") {
    closeModal();
    return;
  }
  if (a === "key") {
    key(b.dataset.key);
    return;
  }
  if (a === "memory") {
    let k = b.dataset.key,
      v;
    try {
      v = expr
        ? evaluate(expr, { angle, ans: result, memory: state.memory })
        : result;
    } catch {
      v = result;
    }
    if (k === "MC") state.memory = 0;
    else if (k === "MR") {
      expr += String(state.memory);
      finished = false;
    } else if (k === "MS") state.memory = v;
    else if (k === "M+") state.memory += v;
    else if (k === "M−") state.memory -= v;
    else {
      angle = angle === "DEG" ? "RAD" : "DEG";
      b.textContent = angle;
    }
    persist();
    updateDisplay();
    return;
  }
  if (a === "mode") {
    scientific = b.dataset.mode === "science";
    render();
    return;
  }
  if (a === "catalog") {
    catalog();
    return;
  }
  if (a === "feature") {
    closeModal();
    navigate(b.dataset.view);
    return;
  }
  if (a === "tool") {
    openTool(id);
    return;
  }
  if (a === "convert") {
    openConvert(id);
    return;
  }
  if (a === "category") {
    category = b.dataset.category;
    render();
    return;
  }
  if (a === "favorite") {
    toggleArray("favorites", id);
    b.classList.toggle("lit");
    return;
  }
  if (a === "copy") {
    copyText(String(result));
    return;
  }
  if (a === "share") {
    copyText(sharedUrl(expr || String(result)));
    return;
  }
  if (a === "publish") {
    publish();
    return;
  }
  if (a === "new-story") {
    createStory();
    return;
  }
  if (a === "story") {
    showStory(Number(b.dataset.index));
    return;
  }
  if (a === "story-prev") {
    showStory(storyIndex - 1);
    return;
  }
  if (a === "story-next") {
    showStory(storyIndex + 1);
    return;
  }
  if (a === "story-use") {
    let s = visibleStories()[storyIndex];
    closeModal();
    useExpression(s.expression);
    return;
  }
  if (a === "article") {
    let ar = articles.find((x) => x.id === id);
    if (!state.read.includes(id)) {
      state.read.push(id);
      reward(10);
    }
    openModal(
      `<span class="eyebrow">AORI JOURNAL · ${ar.tag}</span><div class="article-modal-art ${ar.color}">${ar.symbol}</div><h2>${ar.title}</h2><p class="article-text">${ar.body}</p><p class="formula-banner mono">${esc(ar.expression)}</p>${btn("Проверить в калькуляторе " + icon("arrow"), "article-calc", "primary", `data-expression="${esc(ar.expression)}"`)}`,
    );
    return;
  }
  if (a === "article-calc") {
    closeModal();
    useExpression(b.dataset.expression);
    return;
  }
  if (a === "use-post") {
    useExpression(p.expression);
    return;
  }
  if (a === "like" || a === "save-post") {
    toggleArray(a === "like" ? "likes" : "saved", id);
    b.classList.toggle("lit");
    if (a === "like")
      b.innerHTML =
        icon("heart") +
        " " +
        (state.likes.includes(id) ? "Нравится" : "Оценить");
    return;
  }
  if (a === "follow") {
    toggleArray("following", b.dataset.author);
    render();
    return;
  }
  if (a === "feed-tab") {
    feedTab = b.dataset.tab;
    render();
    return;
  }
  if (a === "share-post") {
    copyText(sharedUrl(p.expression));
    return;
  }
  if (a === "comments") {
    showComments(id);
    return;
  }
  if (a === "poll") {
    state.poll = Number(b.dataset.choice);
    persist();
    render();
    return;
  }
  if (a === "open-collection") {
    let c = state.collections.find((c) => c.id === id);
    openModal(
      `<span class="eyebrow">КОЛЛЕКЦИЯ ВЫЧИСЛЕНИЙ</span><h2>${esc(c.name)}</h2>${c.items.map((h) => `<div class="collection-item"><span class="mono">${esc(h.expression)}</span><strong class="collection-result">= ${esc(fmt(h.result))}</strong>${btn("Открыть", "collection-reuse", "text-button", `data-collection="${id}" data-id="${h.id}"`)}</div>`).join("") || "<p>Закрепите расчёты в истории и создайте новую коллекцию.</p>"}`,
    );
    return;
  }
  if (a === "collection-reuse") {
    let c = state.collections.find((c) => c.id === b.dataset.collection),
      h = c.items.find((h) => h.id === id);
    if (h.toolId) openTool(h.toolId);
    else {
      closeModal();
      useExpression(h.expression);
    }
    return;
  }
  if (a === "collection") {
    openModal(
      `<h2>Коллекция расчётов</h2><form id="collection-form"><label>Название<input name="name" required maxlength="60" placeholder="Например, ремонт квартиры"></label><p>В коллекцию войдут все закреплённые расчёты из истории.</p><button class="primary" type="submit">Создать коллекцию</button></form>`,
    );
    return;
  }
  if (a === "pin") {
    let h = state.history.find((h) => h.id === id);
    h.pinned = !h.pinned;
    persist();
    render();
    return;
  }
  if (a === "reuse") {
    let h = state.history.find((h) => h.id === id);
    if (h.estimateId) universe.openEstimate(h.estimateId);
    else if (h.toolId) openTool(h.toolId);
    else useExpression(h.expression);
    return;
  }
  if (a === "export-csv") {
    download(
      "aori-calculations.csv",
      "\ufeffВыражение;Результат;Дата\r\n" +
        state.history
          .map((h) =>
            [h.expression, h.result, new Date(h.date).toISOString()]
              .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
              .join(";"),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
    return;
  }
  if (a === "export-json") {
    download(
      "aori-space.json",
      JSON.stringify({ version: 1, state }, null, 2),
      "application/json",
    );
    return;
  }
  if (a === "edit-profile") {
    openModal(
      `<h2>Ваш профиль</h2><form id="profile-form"><label>Имя<input name="name" value="${esc(state.name)}" maxlength="30" required></label><label>О себе<input name="bio" value="${esc(state.bio)}" maxlength="150"></label><label>Математический символ<select name="avatar">${["∑", "π", "φ", "∞", "√", "%", "97", "e"].map((v) => `<option ${state.avatar === v ? "selected" : ""}>${v}</option>`).join("")}</select></label><button class="primary" type="submit">Сохранить профиль</button></form>`,
    );
    return;
  }
  if (a === "theme") {
    state.settings.theme = b.dataset.theme;
    persist();
    render();
    return;
  }
  if (a === "accent") {
    state.settings.accent = b.dataset.color;
    persist();
    render();
    return;
  }
  if (a === "reset-settings") {
    state.settings = { ...initial.settings };
    persist();
    render();
    return;
  }
  if (a === "start-game") {
    newGame(b.dataset.mode);
    return;
  }
  if (a === "game-answer") {
    checkGame(b.dataset.value);
    return;
  }
  if (a === "finish-game") {
    closeModal();
    navigate("games");
    return;
  }
  if (a === "daily") {
    openModal(
      `<span class="eyebrow">ЗАДАЧА ДНЯ · +25 XP</span><h2>Скидка на скидку</h2><p>Товар стоит 2 000. После скидки 20% дают ещё 10% на оставшуюся цену. Сколько заплатите?</p><form id="daily-form"><label>Сумма<input name="answer" type="number" required inputmode="decimal"></label><button class="primary" type="submit">Проверить</button></form><p id="daily-feedback" aria-live="polite"></p>`,
    );
    return;
  }
  if (a === "lab-preset") {
    $('[name="formula"]').value = b.dataset.expression;
    $("#lab-form").requestSubmit();
    return;
  }
  if (a === "install") {
    openModal(
      `<h2>Всегда под рукой.</h2><p>На iPhone: откройте страницу в Safari, нажмите «Поделиться» → «На экран Домой».</p><p>На Android: откройте меню Chrome → «Добавить на главный экран» → «Установить».</p><p>На компьютере: в Chrome или Edge используйте значок установки в адресной строке. Офлайн-доступ включается после первой успешной загрузки.</p>`,
    );
    return;
  }
  if (a === "tool-copy") {
    copyText(b.dataset.value);
    return;
  }
});
function toggleArray(k, id) {
  state[k] = state[k].includes(id)
    ? state[k].filter((v) => v !== id)
    : [...state[k], id];
  persist();
}
function showComments(id) {
  openModal(
    `<span class="eyebrow">РАЗБОР ВЫЧИСЛЕНИЯ</span><h2>Обсуждение формулы</h2><div class="comments">${(state.comments[id] || []).map((c) => `<div class="comment"><b>${esc(c.name)}</b><p>${esc(c.text)}</p></div>`).join("") || "<p>Объясните свой способ решения.</p>"}</div><form id="comment-form" data-id="${id}"><label>Комментарий<textarea name="text" required maxlength="1000" rows="3" placeholder="Как вы пришли к ответу?"></textarea></label><p class="muted">Комментарии хранятся в вашем локальном пространстве.</p><button class="primary" type="submit">Добавить комментарий</button></form>`,
  );
}
document.addEventListener("submit", (e) => {
  let f = e.target;
  if (!(f instanceof HTMLFormElement)) return;
  e.preventDefault();
  let d = new FormData(f);
  try {
    if (f.id === "tool-form") {
      let t = tools.find((t) => t.id === f.dataset.id),
        values =
          t.category === "Статистика"
            ? String(d.get("series"))
                .trim()
                .split(/[\s;]+/)
                .map((s) => Number(s.replace(",", ".")))
            : t.labels.map((_, i) => Number(d.get("n" + i)));
      if (
        values.length > 10000 ||
        !values.length ||
        values.some((v) => !Number.isFinite(v))
      )
        throw Error("Введите конечные числа; не более 10 000 значений");
      if (t.rule && !t.rule(values))
        throw Error("Эти значения не подходят для формулы");
      if (
        ["Геометрия", "Наука", "Финансы", "На каждый день"].includes(
          t.category,
        ) &&
        values.some((v) => v < 0) &&
        ![
          "Квадратное уравнение",
          "Расстояние между точками",
          "Середина отрезка",
          "Ускорение",
          "Изменение в процентах",
          "Реальная доходность",
          "ROI",
          "Теплота нагревания",
        ].includes(t.title)
      )
        throw Error("Для этой формулы нужны неотрицательные значения");
      let value = t.run(values);
      if (typeof value === "number" && !Number.isFinite(value))
        throw Error("Результат не определён для этих значений");
      state.history.unshift({
        id: uid(),
        expression: t.title + " (" + values.join("; ") + ")",
        toolId: t.id,
        result: value,
        date: Date.now(),
        kind: t.category,
        pinned: false,
      });
      state.history = state.history.slice(0, 500);
      dailyMark();
      reward(5);
      universe?.recordCalculation(value);
      $("#tool-output").innerHTML =
        `<small>РЕЗУЛЬТАТ</small><strong>${esc(fmt(value))}</strong>${btn(icon("copy") + " Копировать", "tool-copy", "text-button", `data-value="${esc(value)}"`)}`;
      return;
    }
    if (f.id === "convert-form") {
      let c = conversions.find((c) => c.id === f.dataset.id),
        v = Number(d.get("value")),
        reverse = d.get("direction") === "reverse",
        r = reverse ? c.reverse(v) : c.convert(v);
      if (!Number.isFinite(r)) throw Error("Введите конечное число");
      $("#tool-output").innerHTML =
        `<small>${reverse ? c.from : c.to}</small><strong>${fmt(r)}</strong>`;
      dailyMark();
      reward(2);
      return;
    }
    if (f.id === "post-form") {
      let source = String(d.get("expression")),
        r = evaluate(source, { angle });
      state.posts.unshift({
        id: uid(),
        author: state.name,
        avatar: state.avatar,
        topic: d.get("topic"),
        text: d.get("text"),
        expression: source,
        result: r,
        color: "lavender",
      });
      reward(15);
      closeModal();
      navigate("community");
      toast("Расчёт добавлен в вашу ленту");
      return;
    }
    if (f.id === "story-form") {
      let source = String(d.get("expression"));
      state.stories.unshift({
        id: uid(),
        expression: source,
        result: evaluate(source, { angle }),
        text: d.get("text"),
        color: d.get("color"),
        date: Date.now(),
      });
      reward(10);
      universe?.recordStory();
      showStory(0);
      return;
    }
    if (f.id === "comment-form") {
      let id = f.dataset.id;
      state.comments[id] = [
        ...(state.comments[id] || []),
        { name: state.name, text: d.get("text") },
      ];
      reward(3);
      showComments(id);
      return;
    }
    if (f.id === "collection-form") {
      state.collections.push({
        id: uid(),
        name: d.get("name"),
        items: state.history.filter((h) => h.pinned).map((h) => ({ ...h })),
      });
      persist();
      closeModal();
      navigate("community");
      return;
    }
    if (f.id === "profile-form") {
      state.name = String(d.get("name")).trim() || "Алекс";
      state.bio = d.get("bio");
      state.avatar = d.get("avatar");
      persist();
      closeModal();
      render();
      return;
    }
    if (f.id === "game-form") {
      checkGame(Number(d.get("answer")));
      return;
    }
    if (f.id === "daily-form") {
      if (Number(d.get("answer")) === 1440) {
        let key = "daily-" + new Date().toLocaleDateString("sv-SE");
        if (!state.used.includes(key)) {
          state.used.push(key);
          reward(25);
          dailyMark();
          persist();
        }
        $("#daily-feedback").textContent =
          "Верно. 2 000 × 0,8 × 0,9 = 1 440. Награда за сегодня получена.";
      } else
        $("#daily-feedback").textContent =
          "Вторая скидка применяется к остатку после первой. Попробуйте ещё.";
      return;
    }
    if (f.id === "lab-form") {
      runLab(d);
      return;
    }
  } catch (err) {
    let out = $("#tool-output");
    if (
      out &&
      f.id.includes("form") &&
      ["tool-form", "convert-form"].includes(f.id)
    )
      out.innerHTML = `<p class="error">${esc(err.message)}</p>`;
    else toast(err.message);
  }
});
document.addEventListener("input", (e) => {
  let t = e.target;
  if (t.id === "expression") {
    expr = t.value;
    finished = false;
    error = "";
    updateDisplay();
  }
  if (t.id === "tool-search") {
    search = t.value;
    $("#tools-grid").innerHTML =
      category === "Конвертер"
        ? converterCards()
        : category === "Избранное"
          ? tools
              .filter(
                (t) =>
                  state.favorites.includes(t.id) &&
                  t.title.toLowerCase().includes(search.toLowerCase()),
              )
              .map((t) =>
                btn(t.title, "tool", "surface quick-card", `data-id="${t.id}"`),
              )
              .join("")
          : toolCards();
  }
  if (t.id === "catalog-search")
    $("#catalog-list").innerHTML = catalogList(t.value);
  if (t.id === "history-search" || t.id === "feed-search") {
    let start = t.selectionStart,
      id = t.id;
    search = t.value;
    render();
    $("#" + id).focus();
    $("#" + id).setSelectionRange(start, start);
  }
  if (t.dataset.setting && t.type === "range") {
    state.settings[t.dataset.setting] = Number(t.value);
    persist();
    t.parentElement.querySelector("b").textContent = t.value;
  }
});
document.addEventListener("change", async (e) => {
  let t = e.target,
    k = t.dataset.setting;
  if (k) {
    state.settings[k] =
      t.type === "checkbox"
        ? t.checked
        : k === "precision"
          ? Number(t.value)
          : t.value;
    persist();
    if (k === "precision" || k === "group") updateDisplay();
  }
  if (t.id === "import-json") {
    let file = t.files?.[0];
    if (!file) return;
    if (file.size > 3000000) {
      toast("Размер копии не должен превышать 3 МБ");
      return;
    }
    try {
      let obj = JSON.parse(await file.text());
      validateBackup(obj);
      state = {
        ...initial,
        ...obj.state,
        settings: { ...initial.settings, ...obj.state.settings },
      };
      universe.resetFromState();
      persist();
      render();
      toast("Пространство восстановлено");
    } catch (err) {
      toast(err.message || "Не удалось прочитать резервную копию");
    }
  }
});
function validateBackup(o) {
  let s = o?.state;
  if (
    o?.version !== 1 ||
    !s ||
    typeof s.name !== "string" ||
    s.name.length > 30 ||
    typeof s.bio !== "string" ||
    ![s.games, s.gameBest].every((v) => Number.isFinite(v) && v >= 0) ||
    !["∑", "π", "φ", "∞", "√", "%", "97", "e"].includes(s.avatar) ||
    !Number.isFinite(s.xp) ||
    s.xp < 0 ||
    !Number.isFinite(s.memory)
  )
    throw Error("Неверный формат копии");
  for (let k of [
    "history",
    "posts",
    "stories",
    "likes",
    "saved",
    "following",
    "favorites",
    "read",
    "used",
    "days",
    "collections",
  ])
    if (!Array.isArray(s[k]) || s[k].length > 10000)
      throw Error("Повреждён раздел " + k);
  if (
    s.history.some(
      (h) =>
        typeof h.expression !== "string" ||
        !["number", "string"].includes(typeof h.result) ||
        !Number.isFinite(h.date),
    )
  )
    throw Error("Повреждена история");
  if (
    !s.comments ||
    typeof s.comments !== "object" ||
    Object.values(s.comments).some(
      (a) =>
        !Array.isArray(a) ||
        a.some((c) => typeof c.name !== "string" || typeof c.text !== "string"),
    )
  )
    throw Error("Повреждены комментарии");
  if (
    s.posts.some((p) =>
      ["id", "author", "avatar", "topic", "text", "expression"].some(
        (k) => typeof p[k] !== "string",
      ),
    )
  )
    throw Error("Повреждена лента");
  if (
    s.collections.some(
      (c) =>
        typeof c.name !== "string" ||
        !Array.isArray(c.items) ||
        c.items.some(
          (h) =>
            typeof h.expression !== "string" ||
            !["number", "string"].includes(typeof h.result),
        ),
    )
  )
    throw Error("Повреждены коллекции");
  if (
    s.stories.some(
      (p) => typeof p.expression !== "string" || !Number.isFinite(p.date),
    )
  )
    throw Error("Повреждены истории");
  if (s.universe && !universe.validate(s.universe))
    throw Error("Повреждены данные клуба");
  if (
    !s.settings ||
    !["surface", "midnight", "graphite", "paper"].includes(s.settings.theme) ||
    !/^#[\da-f]{6}$/i.test(s.settings.accent) ||
    ![0, 2, 4, 6, 8, 10, 12].includes(s.settings.precision)
  )
    throw Error("Неверные настройки");
  for (let [k, min, max] of [
    ["radius", 8, 32],
    ["glass", 15, 95],
    ["size", 0.8, 1.3],
  ])
    if (
      !Number.isFinite(s.settings[k]) ||
      s.settings[k] < min ||
      s.settings[k] > max
    )
      throw Error("Неверная настройка " + k);
}
document.addEventListener("keydown", (e) => {
  let typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if ($("#modal").open) return;
  if (e.key === "/" && !typing) {
    e.preventDefault();
    catalog();
    return;
  }
  if (!["home", "calc"].includes(view)) return;
  if (e.target.id === "expression") {
    if (e.key === "Enter") {
      e.preventDefault();
      key("=");
    } else if (e.key === "Escape") {
      e.preventDefault();
      key("AC");
    }
    return;
  }
  if (typing) return;
  if (/^[0-9.+\-*/()%!^]$/.test(e.key)) {
    e.preventDefault();
    key(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    key("=");
  } else if (e.key === "Backspace") {
    e.preventDefault();
    key("⌫");
  } else if (e.key === "Escape") key("AC");
});
$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) {
    let r = $("#modal").getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
$("#modal").addEventListener("cancel", () => {
  if (game?.timer) {
    clearInterval(game.timer);
    game = null;
  }
});
function runLab(d) {
  let formula = String(d.get("formula")),
    second = String(d.get("second")).trim(),
    min = Number(d.get("min")),
    max = Number(d.get("max")),
    point = Number(d.get("point"));
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min ||
    max - min > 1e6
  )
    throw Error(
      "Правая граница должна быть больше левой; диапазон не более 1 000 000",
    );
  let f = (x) => evaluate(formula, { angle: "RAD", x }),
    g = (x) => evaluate(second, { angle: "RAD", x });
  f(point);
  let points = [],
    other = [];
  for (let i = 0; i <= 200; i++) {
    let x = min + ((max - min) * i) / 200;
    try {
      points.push([x, f(x)]);
    } catch {
      points.push([x, null]);
    }
    if (second)
      try {
        other.push([x, g(x)]);
      } catch {
        other.push([x, null]);
      }
  }
  let ys = [...points, ...other]
    .map((p) => p[1])
    .filter((v) => v !== null && Number.isFinite(v));
  if (!ys.length) throw Error("В выбранном диапазоне нет значений");
  let sorted = ys.slice().sort((a, b) => a - b),
    lo = sorted[Math.floor(sorted.length * 0.03)],
    hi = sorted[Math.floor(sorted.length * 0.97)];
  if (hi === lo) {
    lo -= 1;
    hi += 1;
  }
  let pad = (hi - lo) * 0.15;
  lo -= pad;
  hi += pad;
  const sx = (x) => 48 + ((x - min) / (max - min)) * 674,
    sy = (y) => 300 - ((y - lo) / (hi - lo)) * 270;
  function path(ps) {
    let active = false;
    return ps
      .map(([x, y]) => {
        if (y === null || y < lo || y > hi) {
          active = false;
          return "";
        }
        let cmd = active ? "L" : "M";
        active = true;
        return cmd + sx(x).toFixed(2) + "," + sy(y).toFixed(2);
      })
      .join(" ");
  }
  let h = 1e-5 * Math.max(1, Math.abs(point)),
    derivative = (f(point + h) - f(point - h)) / (2 * h),
    integral = 0,
    integralValid = true,
    n = 1000,
    dx = (max - min) / n;
  try {
    integral = f(min) + f(max);
    for (let i = 1; i < n; i++) integral += (i % 2 ? 4 : 2) * f(min + i * dx);
    integral *= dx / 3;
  } catch {
    integralValid = false;
  }
  let chart = `<svg class="function-chart" role="img" aria-label="График ${esc(formula)}" viewBox="0 0 760 340"><defs><clipPath id="plot"><rect x="48" y="30" width="674" height="270"/></clipPath></defs>${Array.from(
    { length: 6 },
    (_, i) => {
      let x = 48 + (i * 674) / 5,
        y = 30 + (i * 270) / 5;
      return `<path class="grid-line" d="M${x} 30V300M48 ${y}H722"/><text x="${x}" y="324" text-anchor="middle">${format(min + (i * (max - min)) / 5, 2)}</text><text x="40" y="${y + 4}" text-anchor="end">${format(hi - (i * (hi - lo)) / 5, 2)}</text>`;
    },
  ).join(
    "",
  )}<g clip-path="url(#plot)">${min <= 0 && max >= 0 ? `<path class="axis" d="M${sx(0)} 30V300"/>` : ""}${lo <= 0 && hi >= 0 ? `<path class="axis" d="M48 ${sy(0)}H722"/>` : ""}<path class="plot-line" d="${path(points)}"/>${second ? `<path class="plot-line second" d="${path(other)}"/>` : ""}</g></svg>`;
  $("#lab-result").innerHTML =
    `<div class="card-top"><span class="label">ƒ(x) = ${esc(formula)}</span><span class="tag">RAD</span></div>${chart}<div class="lab-stats"><div><small>f(${point})</small><b>${fmt(f(point))}</b></div><div><small>Производная ≈</small><b>${fmt(derivative)}</b></div><div><small>∫ от ${min} до ${max} ≈</small><b>${integralValid ? fmt(integral) : "Не определён"}</b></div></div>${second ? `<p class="comparison">g(${point}) = ${fmt(g(point))} · ${Math.abs(f(point) - g(point)) < 1e-8 ? "Функции равны в выбранной точке" : "Разность в точке: " + fmt(f(point) - g(point))}</p>` : ""}<details><summary>Таблица значений</summary><table><thead><tr><th>x</th><th>f(x)</th>${second ? "<th>g(x)</th>" : ""}</tr></thead><tbody>${Array.from(
      { length: 11 },
      (_, i) => {
        let x = min + ((max - min) * i) / 10;
        let safe = (fn) => {
          try {
            return fmt(fn(x));
          } catch {
            return "—";
          }
        };
        return `<tr><td>${fmt(x)}</td><td>${safe(f)}</td>${second ? `<td>${safe(g)}</td>` : ""}</tr>`;
      },
    ).join(
      "",
    )}</tbody></table></details><p class="muted">Численные оценки для гладких функций. Метод Симпсона с 1 000 интервалами не подтверждает сходимость несобственных интегралов.</p>`;
  reward(5);
}
window.addEventListener("hashchange", () => {
  let next = location.hash.slice(1);
  if (
    [
      "home",
      "calc",
      "tools",
      "lab",
      "community",
      "learn",
      "games",
      "history",
      "profile",
      "settings",
      "club",
      "rewards",
      "shop",
      "custom",
      "novel",
      "arcade",
      "offers",
      "inbox",
      "events",
      "rpg",
      "battle",
      "passes",
      "action",
    ].includes(next)
  )
    navigate(next);
});
universe = createUniverse({
  getState: () => state,
  persist,
  render,
  navigate,
  icon,
  esc,
  btn,
  openModal,
  closeModal,
  toast,
  rewardXp: reward,
  useExpression,
});
let url = new URL(location.href),
  incoming = url.searchParams.get("expression");
if (incoming) {
  expr = incoming.slice(0, 500);
  view = "calc";
  try {
    result = evaluate(expr);
  } catch (e) {
    error = e.message;
  }
} else if (location.hash) view = location.hash.slice(1);
render();
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./sw.js").catch(() => {});
