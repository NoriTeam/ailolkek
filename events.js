import { launchActionGame, actionFeatures } from "./action-games.js";
export const eventFeatures = [
  ["events", "Три многoэтапных игровых ивента"],
  ["events", "Локальный календарь событий на 14 дней"],
  ["events", "Сюжетные вступления к событиям"],
  ["events", "Последовательное открытие этапов"],
  ["events", "Очки и медали за прохождение"],
  ["events", "Награда за первое завершение этапа"],
  ["events", "Магазин событий за жетоны"],
  ["events", "Повторное прохождение на рекорд"],
  ["rpg", "RPG-уровень персонажа"],
  ["rpg", "Характеристики здоровья, атаки и защиты"],
  ["rpg", "Экипировка вычислительных артефактов"],
  ["rpg", "Улучшение математического оружия"],
  ["rpg", "Материалы за боевые победы"],
  ["rpg", "Операционные роли четырёх персонажей"],
  ["battle", "Пошаговые математические бои"],
  ["battle", "Умножение как усиленная атака"],
  ["battle", "Деление как пробитие защиты"],
  ["battle", "Сложение как восстановление"],
  ["battle", "Вычитание как ослабление"],
  ["battle", "Запас энергии и стоимость навыков"],
  ["battle", "Защитная стойка"],
  ["battle", "Ультимативное равенство"],
  ["battle", "Перезарядка усиленного навыка"],
  ["battle", "Боссы и обычные противники"],
  ["battle", "Сохранение незавершённого боя"],
  ["battle", "Дуэль с тренировочным соперником"],
  ["battle", "Локальная дуэль двух игроков"],
  ["battle", "Передача хода между игроками"],
  ["passes", "Три параллельных боевых пропуска"],
  ["passes", "По 12 уровней наград в каждом пропуске"],
  ["passes", "Отдельный прогресс за разные режимы"],
  ["passes", "Базовая и расширенная дорожки наград"],
  ["passes", "Открытие расширенной дорожки за Σ"],
  ["passes", "Однократное получение награды пропуска"],
  ["passes", "Сезонные задания для пропусков"],
  ["passes", "Материалы и валюта в боевом пропуске"],
  ...actionFeatures.map((f) => [f.view, f.title]),
].map(([view, title], i) => ({ id: "evt" + i, view, title }));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const events = [
  {
    id: "festival",
    title: "Фестиваль равенства",
    tag: "ГОРОДСКОЕ СОБЫТИЕ",
    symbol: "=",
    color: "lavender",
    desc: "На площади открывают три вычислительные сцены. Каждой нужен свой правильный ответ.",
    intro:
      "Сигма готовит городской фестиваль. На каждой сцене потеряли итоговую сумму. Пройдите испытания, соберите жетоны и верните площади её общий знаменатель.",
    stages: [
      "Разминка на площади",
      "Резонанс операций",
      "Последний общий знаменатель",
    ],
    base: 1,
  },
  {
    id: "rift",
    title: "Разлом переполнения",
    tag: "БОЕВОЕ ИСПЫТАНИЕ",
    symbol: "∞",
    color: "peach",
    desc: "Ошибки округления вышли из архива. Закройте три разлома до сброса счётчика.",
    intro:
      "Дельта обнаружила разлом между двумя значениями одной формулы. Внутри растут ошибки. В каждом этапе они становятся устойчивее, но ваши действия всё ещё подчиняются арифметике.",
    stages: [
      "Погрешность первого порядка",
      "Ошибка накопления",
      "Хранитель переполнения",
    ],
    base: 2,
  },
  {
    id: "archive",
    title: "Экспедиция в архив",
    tag: "ИССЛЕДОВАНИЕ",
    symbol: "∑",
    color: "blue",
    desc: "Фи нашёл закрытый фонд формул. Три хранителя проверят, кому можно доверить ключ.",
    intro:
      "За стеллажами нулевого этажа есть три комнаты. В каждой лежит часть общего чертежа. Хранители не принимают силу без доказательств: каждое действие должно быть вычислено.",
    stages: ["Читальный зал", "Зал неизвестных", "Главный хранитель"],
    base: 3,
  },
];
const artifacts = [
  {
    id: "bracket",
    name: "Кольцо скобок",
    symbol: "()",
    cost: 35,
    hp: 15,
    atk: 0,
    def: 3,
    desc: "+15 HP · +3 защита",
  },
  {
    id: "root",
    name: "Печать корня",
    symbol: "√",
    cost: 45,
    hp: 0,
    atk: 4,
    def: 0,
    desc: "+4 атака",
  },
  {
    id: "decimal",
    name: "Десятичный кристалл",
    symbol: "0.1",
    cost: 55,
    hp: 30,
    atk: 0,
    def: 0,
    desc: "+30 HP",
  },
  {
    id: "fraction",
    name: "Грань дроби",
    symbol: "⅟",
    cost: 65,
    hp: 10,
    atk: 2,
    def: 1,
    desc: "+10 HP · +2 атака · +1 защита",
  },
  {
    id: "infinity",
    name: "Лента предела",
    symbol: "∞",
    cost: 90,
    hp: 20,
    atk: 3,
    def: 2,
    desc: "+20 HP · +3 атака · +2 защита",
  },
  {
    id: "pi",
    name: "Орбита π",
    symbol: "π",
    cost: 110,
    hp: 35,
    atk: 5,
    def: 2,
    desc: "+35 HP · +5 атака · +2 защита",
  },
];
export function deriveStats(rpg, character = "sigma") {
  let level = 1 + Math.floor(rpg.xp / 80),
    stats = {
      level,
      hp: 95 + level * 8,
      atk: 10 + level * 2 + rpg.weapon * 2,
      def: 2 + Math.floor(level / 2),
    };
  if (character === "sigma") stats.hp += 15;
  if (character === "phi") stats.def += 2;
  if (character === "delta") stats.atk += 3;
  if (character === "zero") {
    stats.hp += 8;
    stats.def++;
  }
  for (let id of rpg.equipped) {
    let a = artifacts.find((a) => a.id === id);
    if (a) {
      stats.hp += a.hp;
      stats.atk += a.atk;
      stats.def += a.def;
    }
  }
  return stats;
}
export function combatDamage(attack, defense, multiplier = 1, pierce = false) {
  return Math.max(1, Math.round(attack * multiplier - (pierce ? 0 : defense)));
}
export function validateRpg(r) {
  if (!r || typeof r !== "object") return false;
  for (let k of [
    "xp",
    "weapon",
    "crystals",
    "ink",
    "tokens",
    "started",
    "wins",
    "duels",
    "actionRuns",
  ])
    if (!Number.isFinite(r[k]) || r[k] < 0) return false;
  if (!Number.isInteger(r.weapon) || r.weapon < 1 || r.weapon > 10)
    return false;
  for (let k of ["owned", "equipped", "firstClear", "passClaims", "premium"])
    if (!Array.isArray(r[k]) || r[k].some((v) => typeof v !== "string"))
      return false;
  if (
    r.equipped.length > 2 ||
    r.owned.some((v) => !artifacts.some((a) => a.id === v)) ||
    r.equipped.some((v) => !r.owned.includes(v))
  )
    return false;
  for (let k of ["passes", "stageBest", "actionBest"])
    if (
      !r[k] ||
      typeof r[k] !== "object" ||
      Object.values(r[k]).some((v) => !Number.isFinite(v) || v < 0)
    )
      return false;
  if (
    ["journey", "arena", "velocity"].some((k) => !Number.isFinite(r.passes[k]))
  )
    return false;
  if (r.battle) {
    let b = r.battle;
    if (
      !["pve", "bot", "local"].includes(b.type) ||
      !Array.isArray(b.log) ||
      b.log.some((v) => typeof v !== "string")
    )
      return false;
    for (let k of [
      "turn",
      "energy",
      "cooldown",
      "playerHp",
      "playerMax",
      "enemyHp",
      "enemyMax",
      "atk",
      "def",
      "enemyAtk",
      "enemyDef",
      "weak",
      "shield",
      "activePlayer",
    ])
      if (!Number.isFinite(b[k])) return false;
    if (
      b.question &&
      (typeof b.question.text !== "string" ||
        !Number.isFinite(b.question.answer))
    )
      return false;
    if (!Array.isArray(b.localEnergy) || !Array.isArray(b.localCooldown))
      return false;
  }
  return true;
}
export function createEvents(api) {
  const { esc, btn, icon, openModal, closeModal, toast, navigate } = api,
    $ = (s) => document.querySelector(s),
    state = () => api.state();
  const defaults = {
    xp: 0,
    weapon: 1,
    crystals: 0,
    ink: 0,
    tokens: 0,
    owned: [],
    equipped: [],
    started: Date.now(),
    stageBest: {},
    firstClear: [],
    battle: null,
    wins: 0,
    duels: 0,
    passes: { journey: 0, arena: 0, velocity: 0 },
    passClaims: [],
    passTaskClaims: [],
    premium: [],
    actionBest: {},
    actionRuns: 0,
  };
  if (!state().rpg) state().rpg = {};
  let r = { ...defaults, ...state().rpg };
  r.passes = { ...defaults.passes, ...r.passes };
  state().rpg = r;
  const character = () => api.character();
  const stats = () => deriveStats(r, character().id);
  function save() {
    state().rpg = r;
    api.save();
  }
  const duration = 14 * 86400000;
  const remaining = () =>
    Math.max(0, Math.ceil((r.started + duration - Date.now()) / 86400000));
  function tabs() {
    return `<div class="verse-tabs">${[
      ["events", "Ивенты"],
      ["rpg", "Персонаж RPG"],
      ["battle", "Бои и дуэли"],
      ["passes", "Пропуска"],
      ["action", "Гонки и арена"],
    ]
      .map(([v, t]) => btn(t, "nav", "chip", `data-view="${v}"`))
      .join("")}</div>`;
  }
  function head(title, sub) {
    return `<div class="page-heading"><div><div class="eyebrow">РЕЗОНАНС ОПЕРАЦИЙ / СЕЗОН 01</div><h1>${title}</h1><p>${sub}</p></div><span class="event-token">◇ ${r.tokens}</span></div>${tabs()}`;
  }
  function eventPage() {
    return (
      head(
        "События вычислительного города.",
        "Многоэтапные испытания, собственные жетоны и коллекция наград.",
      ) +
      `<div class="surface event-calendar"><div><span class="eyebrow">ЛИЧНЫЙ ЦИКЛ СОБЫТИЙ</span><h2>${remaining() ? remaining() + " дней до завершения" : "Цикл завершён"}</h2><p>Ваш 14-дневный цикл начинается при первом открытии. Все испытания проходят локально.</p></div>${remaining() ? '<span class="event-live">СОБЫТИЯ ДОСТУПНЫ</span>' : btn("Начать новый цикл", "e-new-cycle", "primary")}</div><div class="event-grid">${events.map((ev) => `<article class="surface event-card"><div class="event-art ${ev.color}"><span>${ev.symbol}</span><small>${ev.tag}</small></div><div class="event-body"><span class="eyebrow">${r.firstClear.filter((k) => k.startsWith(ev.id)).length}/3 ЭТАПОВ ПРОЙДЕНО</span><h2>${ev.title}</h2><p>${ev.desc}</p>${btn("Открыть событие " + icon("arrow"), "e-event", "primary", `data-id="${ev.id}"`)}</div></article>`).join("")}</div><div class="section-heading"><h2>Обмен жетонов</h2><span class="muted">Артефакты можно надеть на RPG-персонажа</span></div><div class="artifact-grid">${artifacts.map((a) => artifactCard(a, true)).join("")}</div>`
    );
  }
  function artifactCard(a, shop = false) {
    let owned = r.owned.includes(a.id),
      equipped = r.equipped.includes(a.id);
    return `<article class="surface artifact-card"><span class="artifact-symbol">${a.symbol}</span><h3>${a.name}</h3><p>${a.desc}</p>${btn(shop ? (owned ? "В коллекции" : a.cost + " ◇") : equipped ? "Снять" : "Экипировать", shop ? "e-buy-artifact" : "e-equip", "secondary", `data-id="${a.id}" ${shop && owned ? "disabled" : ""}`)}</article>`;
  }
  function openEvent(id) {
    let ev = events.find((e) => e.id === id);
    openModal(
      `<span class="eyebrow">${ev.tag}</span><h2>${ev.title}</h2><p>${ev.intro}</p><div class="event-stage-list">${ev.stages
        .map((t, i) => {
          let key = id + "-" + i,
            unlocked = i === 0 || r.firstClear.includes(id + "-" + (i - 1)),
            score = r.stageBest[key] || 0;
          return `<div><span class="stage-number">0${i + 1}</span><span><b>${t}</b><small>${score ? "Рекорд " + score + " · " + medal(score) : "Первое завершение: " + (25 + i * 10) + " ◇"}</small></span>${btn(unlocked ? "В бой" : "Закрыто", "e-stage", "secondary", `data-id="${key}" ${!unlocked || !remaining() ? "disabled" : ""}`)}</div>`;
        })
        .join(
          "",
        )}</div><p class="muted">Очки учитывают оставшееся здоровье и число ходов. Первые награды выдаются один раз за этап в текущем цикле.</p>`,
    );
  }
  function medal(score) {
    return score >= 800 ? "Золото" : score >= 500 ? "Серебро" : "Бронза";
  }
  function rpgPage() {
    let s = stats(),
      c = character(),
      cost = 30 + r.weapon * 15;
    return (
      head(
        "Ваш вычислительный отряд.",
        "Уровни, инструменты и артефакты влияют на характеристики в бою.",
      ) +
      `<div class="rpg-layout"><section class="surface rpg-hero"><div class="rpg-character" style="--character-color:${c.color}">${c.symbol}</div><div><span class="eyebrow">${c.role}</span><h2>${c.name} · ур. ${s.level}</h2><p>${r.xp} боевого опыта · до следующего уровня ${80 - (r.xp % 80)} XP</p><div class="progress-track"><i style="width:${((r.xp % 80) / 80) * 100}%"></i></div><div class="rpg-stats"><div><small>HP</small><b>${s.hp}</b></div><div><small>АТАКА</small><b>${s.atk}</b></div><div><small>ЗАЩИТА</small><b>${s.def}</b></div></div>${btn("Сменить спутника", "nav", "secondary", 'data-view="club"')}</div></section><section class="surface weapon-card"><span class="eyebrow">ИНСТРУМЕНТ ВЫЧИСЛИТЕЛЯ</span><div class="weapon-symbol">/</div><h3>Стилус равенства · +${r.weapon}</h3><p>Каждое улучшение даёт +2 атаки. Максимальное улучшение: +10.</p><div class="material-balance"><span>Кристаллы разряда <b>${r.crystals}</b></span><span>Чернила памяти <b>${r.ink}</b></span></div>${btn(r.weapon >= 10 ? "Максимальный уровень" : `Улучшить: ${cost} Σ + 2 кристалла`, "e-upgrade", "primary", r.weapon >= 10 ? "disabled" : "")}</section></div><div class="section-heading"><h2>Артефакты</h2><span class="muted">Экипировано ${r.equipped.length} / 2</span></div><div class="artifact-grid">${r.owned.length ? r.owned.map((id) => artifactCard(artifacts.find((a) => a.id === id))).join("") : `<div class="surface empty"><h3>Первая находка ещё впереди.</h3><p>Пройдите этап ивента и обменяйте жетоны на артефакт.</p>${btn("К событиям", "nav", "primary", 'data-view="events"')}</div>`}</div>`
    );
  }
  function battlePage() {
    if (r.battle) return battleScreen();
    return (
      head(
        "Ответьте за свой ход.",
        "Каждый удар, лечение и защитная стойка требуют правильного вычисления.",
      ) +
      `<div class="battle-mode-grid"><section class="surface battle-mode"><span class="battle-mode-symbol">×</span><span class="eyebrow">PvE / ТРЕНИРОВОЧНЫЙ ПРОТИВНИК</span><h2>Разбор ошибки</h2><p>Обычный бой для опыта и материалов. Сила противника растёт вместе с вашим уровнем.</p>${btn("Начать бой", "e-pve", "primary")}</section><section class="surface battle-mode"><span class="battle-mode-symbol">≠</span><span class="eyebrow">ДУЭЛЬ / КАЛЬКУЛЯТОР-СОПЕРНИК</span><h2>Спор о результате</h2><p>Соперник-тренажёр отвечает после вашего хода. Это локальный бой с ботом.</p>${btn("Вызвать соперника", "e-duel-bot", "primary")}</section><section class="surface battle-mode"><span class="battle-mode-symbol">⇄</span><span class="eyebrow">2 ИГРОКА / ОДНО УСТРОЙСТВО</span><h2>Передайте калькулятор</h2><p>Два человека по очереди отвечают на примеры. У обоих одинаковые характеристики.</p>${btn("Дуэль вдвоём", "e-duel-local", "primary")}</section></div><section class="surface battle-guide"><h3>Пять действий, пять боевых решений</h3><div>${[
        ["+", "Сложение", "Восстанавливает здоровье и энергию"],
        ["−", "Вычитание", "Ослабляет следующую атаку врага"],
        ["×", "Умножение", "Сильный удар, стоит 3 энергии"],
        ["÷", "Деление", "Игнорирует защиту, стоит 2 энергии"],
        ["=", "Равенство", "Ультимативная атака за 6 энергии"],
      ]
        .map(
          ([s, t, d]) =>
            `<article><span>${s}</span><b>${t}</b><p>${d}</p></article>`,
        )
        .join("")}</div></section>`
    );
  }
  function startBattle(type = "pve", stage = null) {
    let s = stats(),
      difficulty = stage
        ? events.find((e) => e.id === stage.split("-")[0]).base +
          Number(stage.split("-")[1])
        : s.level,
      local = type === "local",
      enemyHp = local ? 110 : 35 + difficulty * 12,
      enemyAtk = local ? 14 : 4 + difficulty;
    r.battle = {
      type,
      stage,
      turn: 1,
      energy: 3,
      cooldown: 0,
      playerHp: local ? 110 : s.hp + 35,
      playerMax: local ? 110 : s.hp + 35,
      enemyHp,
      enemyMax: enemyHp,
      atk: local ? 14 : s.atk,
      def: local ? 3 : s.def,
      enemyAtk,
      enemyDef: local ? 3 : 2 + difficulty,
      weak: 0,
      shield: 0,
      activePlayer: 0,
      log: ["Бой начался. Выберите действие."],
      question: null,
      operator: null,
      localEnergy: [3, 3],
      localCooldown: [0, 0],
      localShields: [0, 0],
      localWeak: [0, 0],
    };
    save();
    closeModal();
    navigate("battle");
  }
  const moves = [
    ["+", "Сложить", 0],
    ["−", "Ослабить", 1],
    ["×", "Умножить", 3],
    ["÷", "Разделить", 2],
    ["guard", "Защита", 0],
    ["=", "Равенство", 6],
  ];
  function battleScreen() {
    let b = r.battle,
      local = b.type === "local",
      names = local
        ? ["Игрок 1", "Игрок 2"]
        : [
            character().name,
            b.stage
              ? "Хранитель этапа"
              : b.type === "bot"
                ? "Калькулятор-соперник"
                : "Накопленная ошибка",
          ];
    return (
      head(
        local ? "Дуэль вычислителей." : "Резонанс операций.",
        local
          ? "Ход игрока " +
              (b.activePlayer + 1) +
              ". Передавайте устройство после ответа."
          : "Верное решение активирует навык. Ошибка передаёт инициативу противнику.",
      ) +
      `<section class="surface battle-arena"><div class="battle-contestants"><div class="battle-fighter"><span class="fighter-symbol">${local ? "1" : character().symbol}</span><h3>${names[0]}</h3><b>${Math.max(0, b.playerHp)} / ${b.playerMax} HP</b><div class="health-track"><i style="width:${(b.playerHp / b.playerMax) * 100}%"></i></div></div><div class="battle-versus">VS<small>ХОД ${b.turn}</small></div><div class="battle-fighter enemy"><span class="fighter-symbol">${local ? "2" : "≠"}</span><h3>${names[1]}</h3><b>${Math.max(0, b.enemyHp)} / ${b.enemyMax} HP</b><div class="health-track"><i style="width:${(b.enemyHp / b.enemyMax) * 100}%"></i></div></div></div><div class="battle-energy"><span>Энергия</span>${Array.from({ length: 6 }, (_, i) => `<i class="${i < b.energy ? "filled" : ""}"></i>`).join("")}<small>${b.cooldown ? "Умножение: " + b.cooldown + " хода" : "Умножение готово"}</small></div>${b.question ? `<form id="e-battle-form"><label>${b.operator === "guard" ? "Щит вычислений" : b.operator === "=" ? "Ультимативное равенство" : "Навык " + b.operator}<strong>${esc(b.question.text)} = ?</strong><input name="answer" type="number" step="any" inputmode="decimal" placeholder="Ваш ответ" required autocomplete="off"></label><button class="primary" type="submit">Применить действие</button></form>` : `<div class="battle-moves">${moves.map(([op, t, cost]) => btn(`<b>${op === "guard" ? "()" : op}</b><span>${t}</span><small>${cost} энергии</small>`, "e-move", "battle-move", `data-op="${op}" ${b.energy < cost || (op === "×" && b.cooldown > 0) ? "disabled" : ""}`)).join("")}</div>`}<div class="battle-log" aria-live="polite">${b.log
        .slice(-5)
        .map((l) => `<p>${esc(l)}</p>`)
        .join(
          "",
        )}</div>${btn("Отступить", "e-retreat", "text-button")}</section>`
    );
  }
  function chooseMove(op) {
    let b = r.battle,
      m = moves.find((m) => m[0] === op);
    if (
      !b ||
      b.question ||
      !m ||
      b.energy < m[2] ||
      (op === "×" && b.cooldown > 0)
    )
      return;
    let a = rand(3, 12),
      c = rand(2, 9),
      question;
    if (op === "+") question = { text: `${a} + ${c}`, answer: a + c };
    if (op === "−") question = { text: `${a + c} − ${c}`, answer: a };
    if (op === "×") question = { text: `${a} × ${c}`, answer: a * c };
    if (op === "÷") question = { text: `${a * c} ÷ ${c}`, answer: a };
    if (op === "guard")
      question = { text: `(${a} + ${c}) × 2`, answer: (a + c) * 2 };
    if (op === "=")
      question = { text: `${a} × ${c} + ${a}`, answer: a * c + a };
    b.operator = op;
    b.question = question;
    save();
    api.render();
  }
  function solveMove(value) {
    let b = r.battle;
    if (!b?.question) return;
    let correct = Math.abs(Number(value) - b.question.answer) < 1e-8,
      op = b.operator,
      m = moves.find((m) => m[0] === op),
      local = b.type === "local",
      self = local && b.activePlayer === 1 ? "enemyHp" : "playerHp",
      target = self === "playerHp" ? "enemyHp" : "playerHp",
      max = self === "playerHp" ? b.playerMax : b.enemyMax,
      damage = 0;
    if (correct) {
      b.energy -= m[2];
      if (op === "+") {
        let heal = 12 + stats().level * 2;
        b[self] = Math.min(max, b[self] + heal);
        b.energy = Math.min(6, b.energy + 2);
        damage = combatDamage(b.atk, b.enemyDef, 0.45);
        b.log.push("Сложение восстановило " + heal + " HP.");
      } else if (op === "guard") {
        b.shield = 10 + b.def;
        if (local) b.localShields[b.activePlayer] = b.shield;
        b.energy = Math.min(6, b.energy + 2);
        b.log.push("Защита поглотит " + b.shield + " урона.");
      } else {
        let multiplier =
          op === "×" ? 1.75 : op === "=" ? 2.8 : op === "÷" ? 1.3 : 0.9;
        damage = combatDamage(
          b.atk,
          local ? b.def : b.enemyDef,
          multiplier,
          op === "÷",
        );
        if (op === "−") {
          b.weak = 2;
          if (local) b.localWeak[1 - b.activePlayer] = 2;
        }
        if (op === "×") b.cooldown = 3;
        if (op === "=") b[self] = Math.min(max, b[self] + 10);
      }
      if (local) {
        if (b.localWeak[b.activePlayer] > 0) {
          damage = Math.round(damage * 0.7);
          b.localWeak[b.activePlayer]--;
        }
        damage = Math.max(0, damage - b.localShields[1 - b.activePlayer]);
        b.localShields[1 - b.activePlayer] = 0;
      }
      b[target] -= damage;
      if (damage)
        b.log.push(
          (local ? "Игрок " + (b.activePlayer + 1) : character().name) +
            " наносит " +
            damage +
            " урона.",
        );
    } else
      b.log.push(
        "Ошибка в примере. Правильный ответ: " + b.question.answer + ".",
      );
    b.question = null;
    b.operator = null;
    if (b[target] <= 0) {
      winBattle(
        local ? b.activePlayer === 0 : true,
        local ? "Игрок " + (b.activePlayer + 1) + " победил." : null,
      );
      return;
    }
    if (local) {
      b.localEnergy[b.activePlayer] = Math.min(6, b.energy + 1);
      b.localCooldown[b.activePlayer] = Math.max(0, b.cooldown - 1);
      b.activePlayer = 1 - b.activePlayer;
      b.energy = b.localEnergy[b.activePlayer];
      b.cooldown = b.localCooldown[b.activePlayer];
      b.turn++;
      b.log.push("Передайте устройство игроку " + (b.activePlayer + 1) + ".");
    } else {
      let enemyDamage = combatDamage(
        b.enemyAtk * (b.weak > 0 ? 0.65 : 1),
        b.def,
        correct ? 0.65 : 1,
      );
      enemyDamage = Math.max(0, enemyDamage - b.shield);
      b.shield = 0;
      b.playerHp -= enemyDamage;
      b.log.push("Противник отвечает: " + enemyDamage + " урона.");
      b.weak = Math.max(0, b.weak - 1);
      b.cooldown = Math.max(0, b.cooldown - 1);
      b.energy = Math.min(6, b.energy + 1);
      b.turn++;
      if (b.playerHp <= 0) {
        winBattle(false);
        return;
      }
    }
    save();
    api.render();
  }
  function winBattle(won, text) {
    let b = r.battle,
      local = b.type === "local",
      points = Math.max(
        50,
        Math.round(Math.max(b.playerHp, b.enemyHp) * 5 + 1000 / b.turn),
      ),
      tokenReward = 0;
    if (!local) {
      if (won) {
        r.wins++;
        r.xp += 35;
        r.crystals += 2;
        r.ink++;
        r.passes.arena += 40;
        r.passes.journey += 15;
        api.credit(15, "Победа в вычислительном бою");
        api.xp(15);
        if (b.stage) {
          let stageIndex = Number(b.stage.split("-")[1]);
          r.stageBest[b.stage] = Math.max(r.stageBest[b.stage] || 0, points);
          if (!r.firstClear.includes(b.stage)) {
            r.firstClear.push(b.stage);
            tokenReward = 25 + stageIndex * 10;
            r.tokens += tokenReward;
            r.passes.journey += 40;
          }
        }
      } else {
        r.ink++;
        r.xp += 5;
      }
    } else r.duels++;
    r.battle = null;
    save();
    api.render();
    openModal(
      `<span class="eyebrow">${local ? "ЛОКАЛЬНАЯ ДУЭЛЬ ЗАВЕРШЕНА" : "ИТОГ БОЯ"}</span><h2>${text || (won ? "Равенство восстановлено." : "Ошибка оказалась сильнее.")}</h2><div class="battle-final">${points}<small>очков · ${medal(points)}</small></div><p>${local ? "Счёт дуэлей: " + r.duels : won ? "+15 Σ · +35 боевого XP · +2 кристалла" + (tokenReward ? " · +" + tokenReward + " ◇ за первый проход" : "") : "Получены 1 чернила памяти и 5 боевого XP."}</p>${btn("Продолжить", "e-close-result", "primary")}`,
    );
  }
  const passTypes = [
    [
      "journey",
      "Архив путешественника",
      "Сюжет, первые прохождения и ивенты",
      "∑",
    ],
    ["arena", "Лига операций", "Победы в боях и дуэлях с ботами", "×"],
    ["velocity", "Скорость мысли", "Гонки, шутер и королевская битва", "↗"],
  ];
  function passTask(id) {
    let info =
      id === "journey"
        ? {
            text: "Пройти главу новеллы",
            current: state().novel.chapter,
            target: 1,
            points: 30,
            view: "novel",
          }
        : id === "arena"
          ? {
              text: "Выиграть два боя",
              current: r.wins,
              target: 2,
              points: 50,
              view: "battle",
            }
          : {
              text: "Завершить один заезд или бой на арене",
              current: r.actionRuns,
              target: 1,
              points: 40,
              view: "action",
            };
    let claimed = r.passTaskClaims.includes(id);
    return `<div class="pass-task"><span><b>${info.text}</b><small>${Math.min(info.current, info.target)} / ${info.target} · +${info.points} очков пропуска</small></span>${btn(claimed ? "Получено" : info.current >= info.target ? "Получить очки" : "Перейти", "e-pass-task", "secondary", `data-id="${id}" ${claimed ? "disabled" : ""}`)}</div>`;
  }
  function passesPage() {
    return (
      head(
        "Три пропуска. Один сезон.",
        "Прогресс идёт параллельно. Расширенные дорожки открываются за внутреннюю валюту.",
      ) +
      passTypes
        .map(
          ([id, title, desc, symbol]) =>
            `<section class="surface battle-pass"><div class="pass-heading"><span class="pass-emblem">${symbol}</span><div><span class="eyebrow">БОЕВОЙ ПРОПУСК / ${remaining()} ДНЕЙ</span><h2>${title}</h2><p>${desc} · ${r.passes[id]} очков</p></div>${btn(r.premium.includes(id) ? "Расширенный открыт" : "Расширить за 120 Σ", "e-premium", "secondary", `data-id="${id}" ${r.premium.includes(id) ? "disabled" : ""}`)}</div>${passTask(id)}<div class="pass-track">${Array.from(
              { length: 12 },
              (_, i) => {
                let required = (i + 1) * 40,
                  unlocked = r.passes[id] >= required;
                return `<article class="pass-level ${unlocked ? "unlocked" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><small>${required} очков</small><div><b>${10 + i * 3} Σ</b>${btn(r.passClaims.includes(id + "-free-" + i) ? "Получено" : "Забрать", "e-pass-claim", "secondary", `data-id="${id}" data-tier="${i}" data-track="free" ${!unlocked || r.passClaims.includes(id + "-free-" + i) ? "disabled" : ""}`)}</div><div class="premium-tier"><b>${i % 2 === 0 ? "◇ " + (8 + i * 2) : "Кристаллы ×" + (1 + Math.floor(i / 3))}</b>${btn(r.passClaims.includes(id + "-premium-" + i) ? "Получено" : r.premium.includes(id) ? "Забрать" : "Расширенный", "e-pass-claim", "secondary", `data-id="${id}" data-tier="${i}" data-track="premium" ${!unlocked || !r.premium.includes(id) || r.passClaims.includes(id + "-premium-" + i) ? "disabled" : ""}`)}</div></article>`;
              },
            ).join("")}</div></section>`,
        )
        .join("") +
      `<p class="muted">Боевые пропуска не продаются за реальные деньги. Локальный цикл не связан с внешними играми и их серверами.</p>`
    );
  }
  function actionPage() {
    return (
      head(
        "Точность в движении.",
        "Игровые режимы с управлением, движением и вычисляемыми целями.",
      ) +
      `<div class="action-mode-grid">${[
        [
          "race",
          "01",
          "Трасса результатов",
          "Заезд на 60 секунд. Объезжайте ошибки, выбирайте полосу с правильным ответом и ускоряйтесь.",
          "↗",
        ],
        [
          "shooter",
          "02",
          "Корректор",
          "Шутер от первого лица. Три волны числовых ошибок. Вычислите ответ, найдите цель и стреляйте.",
          "⌖",
        ],
        [
          "royale",
          "03",
          "Последнее равенство",
          "Королевская битва: вы и 12 ботов. Зона сужается, боезапас возвращается через решение примера.",
          "◎",
        ],
      ]
        .map(
          ([id, n, t, d, s]) =>
            `<article class="surface action-mode-card"><div class="action-card-art"><span>${s}</span><i></i><small>РЕЖИМ ${n}</small></div><div><span class="eyebrow">ЛИЧНЫЙ РЕКОРД: ${r.actionBest[id] || 0}</span><h2>${t}</h2><p>${d}</p>${btn("Запустить " + icon("arrow"), "e-action", "primary", `data-id="${id}"`)}</div></article>`,
        )
        .join(
          "",
        )}</div><section class="surface controls-guide"><h3>Управление</h3><p>Компьютер: WASD — движение, стрелки или перетаскивание — поворот, пробел — выстрел, R — перезарядка. В гонках A/D или стрелки управляют рулём.</p><p>Телефон: экранный пульт, отдельная кнопка стрельбы, поворот камеры перетаскиванием сцены. Прогресс за режимы идёт в пропуск «Скорость мысли».</p></section>`
    );
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-action]");
    if (!b?.dataset.action.startsWith("e-")) return;
    let a = b.dataset.action,
      id = b.dataset.id;
    if (a === "e-event") openEvent(id);
    if (a === "e-stage") {
      let [ev, n] = id.split("-");
      if (
        !remaining() ||
        (Number(n) > 0 && !r.firstClear.includes(ev + "-" + (Number(n) - 1)))
      )
        return;
      startBattle("pve", id);
    }
    if (a === "e-new-cycle") {
      r.started = Date.now();
      r.firstClear = [];
      r.stageBest = {};
      r.passes = { journey: 0, arena: 0, velocity: 0 };
      r.passClaims = [];
      r.passTaskClaims = [];
      r.premium = [];
      save();
      api.render();
    }
    if (a === "e-buy-artifact") {
      let item = artifacts.find((a) => a.id === id);
      if (r.owned.includes(id)) return;
      if (r.tokens < item.cost) {
        toast("Не хватает жетонов. Пройдите этапы событий.");
        return;
      }
      r.tokens -= item.cost;
      r.owned.push(id);
      save();
      api.render();
      toast(item.name + " в коллекции");
    }
    if (a === "e-equip") {
      if (!r.owned.includes(id)) return;
      if (r.equipped.includes(id))
        r.equipped = r.equipped.filter((v) => v !== id);
      else if (r.equipped.length < 2) r.equipped.push(id);
      else {
        toast("Можно надеть два артефакта. Снимите один из выбранных.");
        return;
      }
      save();
      api.render();
    }
    if (a === "e-upgrade") {
      if (r.weapon >= 10) return;
      let cost = 30 + r.weapon * 15;
      if (r.crystals < 2) {
        toast("Нужны два кристалла разряда за победу в бою.");
        return;
      }
      if (!api.spend(cost, "Улучшение стилуса")) return;
      r.crystals -= 2;
      r.weapon++;
      save();
      api.render();
    }
    if (a === "e-pve") startBattle();
    if (a === "e-duel-bot") startBattle("bot");
    if (a === "e-duel-local") startBattle("local");
    if (a === "e-move") chooseMove(b.dataset.op);
    if (a === "e-retreat") {
      r.battle = null;
      save();
      api.render();
    }
    if (a === "e-close-result") {
      closeModal();
      api.render();
    }
    if (a === "e-pass-task") {
      let current =
          id === "journey"
            ? state().novel.chapter
            : id === "arena"
              ? r.wins
              : r.actionRuns,
        target = id === "arena" ? 2 : 1;
      if (r.passTaskClaims.includes(id)) return;
      if (current < target) {
        navigate(
          id === "journey" ? "novel" : id === "arena" ? "battle" : "action",
        );
        return;
      }
      r.passTaskClaims.push(id);
      r.passes[id] += id === "journey" ? 30 : id === "arena" ? 50 : 40;
      save();
      api.render();
    }
    if (a === "e-premium") {
      if (r.premium.includes(id) || !passTypes.some((p) => p[0] === id)) return;
      if (
        !api.spend(
          120,
          "Расширенная дорожка: " + passTypes.find((p) => p[0] === id)[1],
        )
      )
        return;
      r.premium.push(id);
      save();
      api.render();
    }
    if (a === "e-pass-claim") {
      let i = Number(b.dataset.tier),
        track = b.dataset.track,
        key = id + "-" + track + "-" + i;
      if (
        !passTypes.some((p) => p[0] === id) ||
        !Number.isInteger(i) ||
        i < 0 ||
        i > 11 ||
        !["free", "premium"].includes(track) ||
        r.passes[id] < (i + 1) * 40 ||
        r.passClaims.includes(key) ||
        (track === "premium" && !r.premium.includes(id))
      )
        return;
      r.passClaims.push(key);
      if (track === "free")
        api.credit(10 + i * 3, "Пропуск " + id + ": уровень " + (i + 1));
      else if (i % 2 === 0) r.tokens += 8 + i * 2;
      else r.crystals += 1 + Math.floor(i / 3);
      save();
      api.render();
      toast("Награда пропуска получена");
    }
    if (a === "e-action") {
      launchActionGame(id, {
        openModal,
        complete: (out) => {
          r.actionRuns++;
          r.actionBest[id] = Math.max(
            r.actionBest[id] || 0,
            Math.floor(out.score),
          );
          r.passes.velocity += Math.max(10, Math.floor(out.score / 2));
          r.xp += Math.max(5, out.kills * 4);
          api.credit(out.reward, "Режим: " + id);
          api.xp(Math.max(5, Math.floor(out.score / 5)));
          save();
          openModal(
            `<span class="eyebrow">РЕЖИМ ЗАВЕРШЁН</span><h2>${out.won ? "Задача выполнена." : "Попытка записана."}</h2><p>${out.detail}</p><div class="battle-final">${Math.floor(out.score)}<small>очков · +${out.reward} Σ</small></div>${btn("К режимам", "e-action-close", "primary")}`,
          );
        },
      });
    }
    if (a === "e-action-close") {
      closeModal();
      navigate("action");
    }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id === "e-battle-form") {
      e.preventDefault();
      solveMove(new FormData(e.target).get("answer"));
    }
  });
  save();
  return {
    supports: (v) =>
      ["events", "rpg", "battle", "passes", "action"].includes(v),
    render: (v) =>
      (
        ({
          events: eventPage,
          rpg: rpgPage,
          battle: battlePage,
          passes: passesPage,
          action: actionPage,
        })[v] || eventPage
      )(),
    tabs,
    recordStory: () => {
      r.passes.journey += 10;
      save();
    },
    recordNovel: () => {
      r.passes.journey += 20;
      save();
    },
    reset: () => {
      r = { ...defaults, ...state().rpg };
      state().rpg = r;
    },
    summary: () =>
      `<section class="surface event-home-strip"><div><span class="eyebrow">СЕЗОН 01 / РЕЗОНАНС ОПЕРАЦИЙ</span><b>Ивенты, три пропуска и игровой полигон</b><small>${remaining()} дней в личном цикле · ${r.wins} боевых побед</small></div>${btn("События", "nav", "secondary", 'data-view="events"')}${btn("Гонки и арена", "nav", "secondary", 'data-view="action"')}</section>`,
  };
}
