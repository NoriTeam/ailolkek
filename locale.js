const KEY = "aori-language";
let language = localStorage.getItem(KEY) === "en" ? "en" : "ru",
  dictionary = null,
  pattern = null,
  pending = false;
const originals = new Map(),
  attributes = new Map();
const overrides = {
  часы: "hours",
  узлы: "knots",
  сутки: "days",
  день: "day",
  дня: "days",
  дней: "days",
  ур: "lvl",
  хода: "turns",
  Лента: "Feed",
  "Вся история": "All history",
  возможность: "feature",
  возможности: "features",
  возможностей: "features",
  "Найти возможность": "Search tools",
  ВЫЧИСЛЕНИЯ: "CALCULATOR",
  "Ввод с клавиатуры": "Keyboard input",
  УПРАВЛЕНИЕ: "KEYBOARD",
  Калькулятор: "Calculator",
  "Калькулятор.": "Calculator.",
  Считать: "Calculate",
  Обзор: "Overview",
  Инструменты: "Tools",
  Каталог: "Tools",
  Лаборатория: "Lab",
  Журнал: "Journal",
  Тренировки: "Practice",
  "Игровой зал": "Arcade",
  "Гонки и арена": "Racing & arena",
  "Нулевой этаж": "Floor Zero",
  "Онлайн-клуб": "Online club",
  Сигма: "Sigma",
  Аватарка: "Avatar",
  "Генератор аватарок": "Avatar generator",
  Бои: "Battles",
  Пропуска: "Battle passes",
  Ивенты: "Events",
  Чернила: "Ink",
  крист: "crystals",
  "Ваша история": "Your history",
  "Выделить НДС": "Extract VAT",
  "Сколько процентов": "Percentage ratio",
  Размещения: "Permutations",
  "Число до процента": "Original value from percentage",
  "Голосовой ввод": "Voice input",
  "Точный налив": "Precision pour",
  "Ровный поднос": "Steady tray",
  "Мастер пропорций": "Mixing ratios",
  Почта: "Email",
  Научный: "Scientific",
  Обычный: "Standard",
  "Скачать SVG": "Download SVG",
  "Личное пространство": "Workspace",
  "ПРОСТРАНСТВО ВЫЧИСЛЕНИЙ": "CALCULATOR WORKSPACE",
  КЛАНЫ: "CLANS",
  "ГОТОВ К ВЫЧИСЛЕНИЯМ": "READY",
  "Настройте поверхность": "Appearance",
  "Всё сходится на вас": "Your profile",
  "Друзья по общему знаменателю": "Friends",
  "Пригласить. Подарить. Получить": "Invites, gifts & codes",
};
export function translateLabel(text) {
  return pattern ? text.replace(pattern, (s) => dictionary[s] || s) : text;
}
const changedRoots = new Set();
function apply(full = true) {
  pending = false;
  let roots = full
    ? [document.body]
    : [...changedRoots].filter((n) => n.isConnected);
  changedRoots.clear();
  document.documentElement.lang = language;
  document.title =
    language === "en"
      ? "Aori Calculate — calculator"
      : "Aori Calculate — калькулятор";
  for (const [node] of originals) if (!node.isConnected) originals.delete(node);
  for (const [node] of attributes)
    if (!node.isConnected) attributes.delete(node);
  if (language === "ru") {
    for (const [node, text] of originals)
      if (node.textContent !== text) node.textContent = text;
    for (const [node, attrs] of attributes)
      for (const [key, value] of Object.entries(attrs))
        node.setAttribute(key, value);
    originals.clear();
    attributes.clear();
  } else if (pattern) {
    for (let root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = root.nodeType === 3 ? root : walker.nextNode();
      for (; node; node = walker.nextNode()) {
        if (
          node.parentElement?.closest(
            "script,style,textarea,[data-no-translate],.chat-bubble p,.online-posts .post-card>p",
          )
        )
          continue;
        let text = node.textContent;
        if (!/[А-Яа-яЁё]/.test(text)) continue;
        let next = translateLabel(text);
        if (text !== next) {
          originals.set(node, text);
          node.textContent = next;
        }
      }
      for (let el of root.nodeType === 1
        ? [
            root,
            ...root.querySelectorAll(
              "[placeholder],[aria-label],[title],[alt]",
            ),
          ]
        : []) {
        for (let key of ["placeholder", "aria-label", "title", "alt"]) {
          let value = el.getAttribute(key);
          if (!value || !/[А-Яа-яЁё]/.test(value)) continue;
          let next = translateLabel(value);
          if (next !== value) {
            let attrs = attributes.get(el) || {};
            attrs[key] = value;
            attributes.set(el, attrs);
            el.setAttribute(key, next);
          }
        }
      }
    }
  }
  let host = document.querySelector(".top-actions");
  if (host && !host.querySelector("#language-select")) {
    let select = document.createElement("select");
    select.id = "language-select";
    select.className = "language-select";
    select.setAttribute(
      "aria-label",
      language === "en" ? "Interface language" : "Язык интерфейса",
    );
    select.innerHTML =
      '<option value="ru">RU</option><option value="en">EN</option>';
    select.value = language;
    select.addEventListener("change", async () => {
      language = select.value;
      localStorage.setItem(KEY, language);
      await load();
      apply();
      document.dispatchEvent(new Event("aori-language-change"));
    });
    host.prepend(select);
  }
}
async function load() {
  if (language !== "en" || dictionary) return;
  try {
    let response = await fetch("./locale-en.json");
    if (!response.ok) throw Error();
    dictionary = { ...(await response.json()), ...overrides };
    const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    pattern = new RegExp(
      keys.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
      "g",
    );
  } catch {
    language = "ru";
    localStorage.setItem(KEY, "ru");
  }
}
function schedule() {
  if (pending) return;
  pending = true;
  queueMicrotask(() => apply(false));
}
const observer = new MutationObserver((records) => {
  for (let r of records) {
    if (r.type === "characterData") changedRoots.add(r.target);
    else
      for (let n of r.addedNodes)
        if (n.nodeType === 1 || n.nodeType === 3) changedRoots.add(n);
  }
  if (changedRoots.size) schedule();
});
function start() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  load().then(apply);
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
