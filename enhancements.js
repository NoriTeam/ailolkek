import { prepareImage } from "./media.js";
import { beerModes, launchBeerGame } from "./beer-games.js";
export const extraFeatures = [
  ["avatar", "Генератор SVG-аватарок"],
  ["avatar", "Сохранение аватарки в профиль"],
  ["avatar", "Скачивание аватарки в SVG"],
  ["ibeer", "iBeer — виртуальный мерный стакан"],
  ["ibeer", "Переливание при наклоне"],
  ["ibeer", "Счётчик объёма и перевод в литры"],
  ["calc", "Голосовой ввод выражения"],
  ["settings", "Обучение по меню при первом запуске"],
  ["settings", "Повторный запуск обучения"],
  ["avatar", "Своя фотография профиля"],
  ["online", "Загрузка аватарки в сетевой профиль"],
  ["network-feed", "Изображения к расчётам в общей ленте"],
  ["ibeer", "Игра: точный налив"],
  ["ibeer", "Игра: ровный поднос"],
  ["ibeer", "Игра: пропорции напитка"],
  ["ibeer", "Игра: снятие пены"],
  ["settings", "Русский и английский интерфейс"],
  ["online", "Восстановление аккаунта по личному коду"],
].map(([view, title], i) => ({ id: "extra" + i, view, title }));
export function avatarSvg(seed = "aori-sigma") {
  let h = 2166136261;
  for (let c of String(seed))
    h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const palettes = [
    ["#272234", "#bca3eb", "#e9dafb"],
    ["#26332f", "#a4c9b5", "#d7eedc"],
    ["#38302b", "#d1ad8f", "#f6dfc5"],
    ["#26313c", "#a2bdd6", "#d8e9f4"],
    ["#342a32", "#c8a4b9", "#f1d8e6"],
    ["#2c2f2c", "#b7bea7", "#e6ead6"],
  ];
  let [bg, fill, ink] = palettes[h % palettes.length],
    eye = h % 3,
    offset = (h % 11) - 5,
    ears = h % 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="56" fill="${bg}"/><path d="M29 223c12-43 43-61 99-61s87 18 99 61v33H29Z" fill="${fill}" opacity=".5"/><rect x="58" y="45" width="140" height="145" rx="${26 + (h % 25)}" fill="${fill}"/><path d="M77 52h102" stroke="${ink}" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>${ears ? `<rect x="43" y="98" width="20" height="48" rx="9" fill="${fill}"/><rect x="193" y="98" width="20" height="48" rx="9" fill="${fill}"/>` : ""}<rect x="75" y="91" width="106" height="49" rx="20" fill="${bg}"/>${eye === 0 ? `<circle cx="103" cy="116" r="8" fill="${ink}"/><circle cx="154" cy="116" r="8" fill="${ink}"/>` : eye === 1 ? `<path d="M93 119q10-15 20 0m30 0q10-15 20 0" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>` : `<path d="M95 108v16m16-16v16m33-8h18" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`}<path d="M111 ${159 + offset}q17 13 34 0" stroke="${bg}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M128 45V26m-7 0h14" stroke="${fill}" stroke-width="6" stroke-linecap="round"/><circle cx="128" cy="24" r="7" fill="${ink}"/><path d="M113 220h30m-15-15v30" stroke="${ink}" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/></svg>`;
}
export const avatarData = (seed) =>
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(avatarSvg(seed));
const numberWords = {
  ноль: 0,
  нуль: 0,
  один: 1,
  одна: 1,
  два: 2,
  две: 2,
  три: 3,
  четыре: 4,
  пять: 5,
  шесть: 6,
  семь: 7,
  восемь: 8,
  девять: 9,
  десять: 10,
  одиннадцать: 11,
  двенадцать: 12,
  тринадцать: 13,
  четырнадцать: 14,
  пятнадцать: 15,
  шестнадцать: 16,
  семнадцать: 17,
  восемнадцать: 18,
  девятнадцать: 19,
  двадцать: 20,
  тридцать: 30,
  сорок: 40,
  пятьдесят: 50,
  шестьдесят: 60,
  семьдесят: 70,
  восемьдесят: 80,
  девяносто: 90,
  сто: 100,
  двести: 200,
  триста: 300,
  четыреста: 400,
  пятьсот: 500,
  шестьсот: 600,
  семьсот: 700,
  восемьсот: 800,
  девятьсот: 900,
};
export function speechToExpression(raw) {
  let s = String(raw)
    .toLowerCase()
    .replace(/[!?]/g, "")
    .replace(/multiplied by|multiply by|times/g, " × ")
    .replace(/divided by|divide by/g, " ÷ ")
    .replace(/plus|add/g, " + ")
    .replace(/minus|subtract/g, " − ")
    .replace(/percent/g, " % ")
    .replace(/equals|calculate/g, " ")
    .replace(/open parenthesis/g, " ( ")
    .replace(/close parenthesis/g, " ) ")
    .replace(/умножить\s+на|умножить|помножить\s+на/g, " × ")
    .replace(/разделить\s+на|поделить\s+на|делить\s+на/g, " ÷ ")
    .replace(/плюс|прибавить/g, " + ")
    .replace(/минус|вычесть/g, " − ")
    .replace(/открыть\s+скобку|открывающая\s+скобка/g, " ( ")
    .replace(/закрыть\s+скобку|закрывающая\s+скобка/g, " ) ")
    .replace(/процентов|процента|процент/g, " % ")
    .replace(/равно|посчитай|вычисли/g, " ")
    .replace(/число\s+пи|\bpi\b|\sпи\s/g, " π ");
  const english = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
  };
  s = s
    .replace(/(\d)\s+point\s+(\d)/g, "$1.$2")
    .replace(/(?<=[a-z])-(?=[a-z])/g, " ");
  let words = s.trim().split(/\s+/),
    out = [],
    sum = 0,
    current = 0,
    inNumber = false;
  const flush = () => {
    if (inNumber) {
      out.push(String(sum + current));
      sum = 0;
      current = 0;
      inNumber = false;
    }
  };
  for (let w of words) {
    if (w === "and") continue;
    if (w === "hundred") {
      current = (current || 1) * 100;
      inNumber = true;
      continue;
    }
    if (w === "thousand") {
      sum += (current || 1) * 1000;
      current = 0;
      inNumber = true;
      continue;
    }
    if (Object.hasOwn(english, w)) {
      current += english[w];
      inNumber = true;
      continue;
    }
    if (Object.hasOwn(numberWords, w)) {
      current += numberWords[w];
      inNumber = true;
    } else if (/^тысяч/.test(w)) {
      sum += (current || 1) * 1000;
      current = 0;
      inNumber = true;
    } else {
      flush();
      out.push(w);
    }
  }
  flush();
  return out
    .join(" ")
    .replace(/(\d)\s+point\s+(\d)/g, "$1.$2")
    .replace(/\s+/g, " ")
    .trim();
}
export function createEnhancements(ui) {
  const { esc, btn, icon, openModal, closeModal, toast, navigate } = ui,
    $ = (s) => document.querySelector(s);
  let seed = ui.state().avatarSeed || "aori-sigma",
    tourStep = -1,
    tour = null,
    recognition = null,
    beerCleanup = null;
  const steps = [
    {
      view: "calc",
      selector: ".calculator",
      title: "Это калькулятор",
      text: "Введите выражение с клавиатуры, голосом или кнопками. Знак = сохраняет ответ в историю.",
    },
    {
      view: "history",
      selector: ".history-list",
      title: "История расчётов",
      text: "Здесь можно найти ответ, закрепить расчёт и повторно открыть его.",
    },
    {
      view: "tools",
      selector: ".search-field",
      title: "Готовые инструменты",
      text: "Скидки, кредит, площадь, физика и конвертация единиц. Ищите задачу по названию.",
    },
    {
      view: "online",
      selector: ".page-heading",
      title: "Онлайн-клуб",
      text: "После входа можно найти друзей, писать сообщения, вступать в кланы и делиться формулами.",
    },
  ];
  function onboarding() {
    openModal(
      `<div class="onboarding"><span class="intro-product">КАЛЬКУЛЯТОР / AORI</span><h2>Калькулятор.<br>Начнём с вычислений.</h2><div class="intro-example"><span>128 + 64</span><strong>= 192</strong></div><p>Обычные и научные вычисления — основной инструмент. История сохраняет результаты, каталог помогает с конкретными задачами. Клуб и игровые режимы находятся в отдельных разделах.</p><div class="onboarding-actions">${btn("Показать меню", "x-tour", "primary")}${btn("Сразу считать", "x-skip-intro", "secondary")}</div><small>Обучение можно повторить в настройках.</small></div>`,
      "intro-modal",
    );
    localStorage.setItem("aori-onboarding-v2", "seen");
  }
  function finishTour() {
    document.querySelector(".tour-target")?.classList.remove("tour-target");
    tour?.remove();
    tour = null;
    tourStep = -1;
    localStorage.setItem("aori-onboarding-v2", "done");
  }
  function showStep(index) {
    finishTour();
    tourStep = index;
    let s = steps[index];
    if (!s) {
      navigate("calc");
      return;
    }
    navigate(s.view);
    tour = document.createElement("section");
    tour.className = "menu-tour";
    tour.setAttribute("role", "region");
    tour.setAttribute("aria-label", "Обучение по меню");
    tour.innerHTML = `<small>МЕНЮ / ${index + 1} ИЗ ${steps.length}</small><h3>${s.title}</h3><p>${s.text}</p><div>${btn("Пропустить", "x-end-tour", "text-button")}${btn(index === steps.length - 1 ? "Готово" : "Далее " + icon("arrow"), "x-tour-next", "primary")}</div>`;
    document.body.append(tour);
    requestAnimationFrame(() => $(s.selector)?.classList.add("tour-target"));
  }
  function avatarPage() {
    return `<div class="page-heading"><div><div class="eyebrow">ПРОФИЛЬ / ОФОРМЛЕНИЕ</div><h1>Генератор аватарок.</h1><p>Один набор форм, разные выражения лица. Аватарка создаётся на устройстве.</p></div></div><div class="avatar-generator surface"><div class="avatar-preview"><img id="avatar-preview" src="${ui.state().avatarImage || avatarData(seed)}" alt="Предпросмотр аватарки"></div><div><h2>Ваш вычислительный спутник</h2><label>Ключ аватарки<input id="avatar-seed" value="${esc(seed)}" maxlength="80" placeholder="Любое слово или число"></label><div class="avatar-actions">${btn(icon("shuffle") + " Другой вариант", "x-random-avatar", "secondary")}${btn("Сохранить в профиль", "x-save-avatar", "primary")}${btn(icon("download") + " Скачать SVG", "x-download-avatar", "text-button")}</div><p class="muted">Один и тот же ключ всегда даёт одинаковую аватарку. Персонаж Сигма остаётся выбранным независимо от изображения профиля.</p></div></div><section class="surface avatar-upload"><h2>Или своё изображение</h2><p>JPEG, PNG или WebP. Фото обрежется до квадрата и сохранится на устройстве. Онлайн-аватар можно загрузить в настройках сетевого профиля.</p><label>Выбрать фото<input id="local-avatar-image" type="file" accept="image/jpeg,image/png,image/webp"></label></section><div class="avatar-options">${Array.from({ length: 12 }, (_, i) => btn(`<img src="${avatarData("aori-collection-" + i)}" alt="Вариант ${i + 1}">`, "x-pick-avatar", "avatar-option", `data-seed="aori-collection-${i}"`)).join("")}</div>`;
  }
  function launchBeer() {
    openModal(
      `<span class="eyebrow">iBEER / КАЛЬКУЛЯТОР ОБЪЁМА</span><h2>Мерный стакан.</h2><p>Наклоняйте стакан ползунком или движением телефона. Счётчик показывает объём жидкости.</p><canvas id="beer-canvas" width="380" height="420" aria-label="Виртуальный стакан с пеной"></canvas><div class="beer-stats"><div><small>В СТАКАНЕ</small><b id="beer-volume">500 мл</b></div><div><small>ПЕРЕЛИТО</small><b id="beer-poured">0 мл</b></div></div><label class="setting-range"><span>Наклон <b id="beer-angle">0°</b></span><input id="beer-tilt" type="range" min="-85" max="85" value="0"></label><div class="beer-actions">${btn("+100 мл", "x-beer-fill", "secondary")}${btn(icon("smartphone") + " Наклон телефона", "x-beer-motion", "secondary")}${btn("Перевести в литры", "x-beer-calc", "primary")}</div><small>Виртуальная жидкость. Расчёт в миллилитрах и литрах.</small>`,
      "beer-modal",
    );
    if (beerCleanup) beerCleanup();
    let canvas = $("#beer-canvas"),
      ctx = canvas.getContext("2d"),
      volume = 500,
      poured = 0,
      angle = 0,
      frame,
      last = performance.now(),
      bubbleTime = 0,
      lastVolume = -1,
      tilt = $("#beer-tilt");
    const setAngle = (n) => {
      angle = Math.max(-85, Math.min(85, n));
      tilt.value = String(angle);
      $("#beer-angle").textContent = Math.round(angle) + "°";
    };
    tilt.addEventListener("input", () => setAngle(Number(tilt.value)));
    const orientation = (e) => setAngle(e.gamma || 0);
    const click = async (e) => {
      let b = e.target.closest("[data-action]");
      if (!b) return;
      if (b.dataset.action === "x-beer-fill")
        volume = Math.min(500, volume + 100);
      if (b.dataset.action === "x-beer-calc") {
        let ml = Math.round(volume);
        closeModal();
        ui.useExpression(ml + "/1000");
        toast(ml + " мл → литры");
      }
      if (b.dataset.action === "x-beer-motion") {
        try {
          if (typeof DeviceOrientationEvent === "undefined") {
            toast("Датчик недоступен. Используйте ползунок.");
            return;
          }
          if (
            typeof DeviceOrientationEvent.requestPermission === "function" &&
            (await DeviceOrientationEvent.requestPermission()) !== "granted"
          )
            return;
          window.addEventListener("deviceorientation", orientation, {
            passive: true,
          });
          toast("Наклон телефона включён");
        } catch {
          toast("Используйте ползунок наклона.");
        }
      }
    };
    document.addEventListener("click", click);
    function draw(now) {
      if (!$("#modal").open || !canvas.isConnected) {
        beerCleanup?.();
        return;
      }
      let dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        bubbleTime += dt;
        if (Math.abs(angle) > 48 && volume > 0) {
          let amount = Math.min(volume, dt * (Math.abs(angle) - 48) * 4);
          volume -= amount;
          poured += amount;
        }
        ctx.clearRect(0, 0, 380, 420);
        let glass = new Path2D();
        glass.moveTo(88, 45);
        glass.lineTo(292, 45);
        glass.lineTo(273, 365);
        glass.quadraticCurveTo(190, 390, 107, 365);
        glass.closePath();
        ctx.save();
        ctx.clip(glass);
        let y = 365 - (volume / 500) * 294,
          slope = Math.tan((angle * Math.PI) / 180) * 0.6;
        let grad = ctx.createLinearGradient(0, y, 0, 385);
        grad.addColorStop(0, "#e4bc52");
        grad.addColorStop(1, "#a8651d");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(40, y - 150 * slope);
        ctx.lineTo(340, y + 150 * slope);
        ctx.lineTo(340, 410);
        ctx.lineTo(40, 410);
        ctx.closePath();
        ctx.fill();
        if (volume > 1) {
          ctx.strokeStyle = "#f6e9c8";
          ctx.lineWidth = 13;
          ctx.beginPath();
          ctx.moveTo(40, y - 150 * slope);
          ctx.lineTo(340, y + 150 * slope);
          ctx.stroke();
          for (let i = 0; i < 28; i++) {
            let x = 112 + ((i * 47) % 157),
              by =
                365 -
                ((bubbleTime * (12 + (i % 7)) + i * 29) % Math.max(1, 365 - y));
            ctx.fillStyle = "#f6e8b952";
            ctx.beginPath();
            ctx.arc(x, by, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        ctx.strokeStyle = "#d5c2ed70";
        ctx.lineWidth = 2;
        ctx.stroke(glass);
        ctx.fillStyle = "#c8b3e722";
        ctx.fillRect(104, 57, 6, 285);
        ctx.strokeStyle = "#d5c2ed24";
        for (let i = 1; i <= 5; i++) {
          let gy = 365 - i * 58.8;
          ctx.beginPath();
          ctx.moveTo(269, gy);
          ctx.lineTo(284, gy);
          ctx.stroke();
          ctx.fillStyle = "#b9abc8";
          ctx.font = "9px Consolas";
          ctx.fillText(i * 100 + "", 299, gy + 3);
        }
        if (Math.floor(volume) !== lastVolume) {
          lastVolume = Math.floor(volume);
          $("#beer-volume").textContent = Math.round(volume) + " мл";
          $("#beer-poured").textContent = Math.round(poured) + " мл";
        }
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);
    beerCleanup = () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", click);
      window.removeEventListener("deviceorientation", orientation);
      beerCleanup = null;
    };
  }
  function voice() {
    let Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      openModal(
        `<h2>Голосовой ввод</h2><p>Этот браузер не поддерживает распознавание речи. Откройте страницу в Chrome или используйте микрофон системной клавиатуры в поле выражения.</p>`,
      );
      return;
    }
    if (recognition) {
      recognition.stop();
      return;
    }
    let r = new Recognition();
    recognition = r;
    r.lang = document.documentElement.lang === "en" ? "en-US" : "ru-RU";
    r.interimResults = false;
    r.maxAlternatives = 1;
    document.documentElement.dataset.listening = "true";
    r.onresult = (e) => {
      let spoken = e.results[0][0].transcript,
        formula = speechToExpression(spoken);
      ui.setExpression(formula);
      toast("Распознано: " + spoken);
    };
    r.onerror = (e) =>
      toast(
        e.error === "not-allowed"
          ? "Доступ к микрофону не предоставлен."
          : "Не удалось распознать. Попробуйте ещё раз.",
      );
    r.onend = () => {
      recognition = null;
      delete document.documentElement.dataset.listening;
    };
    try {
      r.start();
      toast("Говорите выражение…");
    } catch {
      recognition = null;
      delete document.documentElement.dataset.listening;
    }
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-action]");
    if (!b) return;
    let a = b.dataset.action;
    if (a === "x-welcome") onboarding();
    if (a === "x-tour") {
      closeModal();
      showStep(0);
    }
    if (a === "x-skip-intro") {
      closeModal();
      navigate("calc");
    }
    if (a === "x-tour-next") showStep(tourStep + 1);
    if (a === "x-end-tour") {
      finishTour();
      navigate("calc");
    }
    if (a === "x-random-avatar") {
      seed = crypto.randomUUID().slice(0, 12);
      $("#avatar-seed").value = seed;
      $("#avatar-preview").src = avatarData(seed);
    }
    if (a === "x-pick-avatar") {
      seed = b.dataset.seed;
      $("#avatar-seed").value = seed;
      $("#avatar-preview").src = avatarData(seed);
    }
    if (a === "x-save-avatar") {
      delete ui.state().avatarImage;
      ui.state().avatarSeed = seed;
      ui.persist();
      toast("Аватарка сохранена");
      ui.render();
    }
    if (a === "x-download-avatar") {
      ui.download("aori-avatar.svg", avatarSvg(seed), "image/svg+xml");
    }
    if (a === "x-beer") launchBeer();
    if (a === "x-beer-game") launchBeerGame(ui, b.dataset.mode);
    if (a === "x-voice") voice();
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "avatar-seed") {
      seed = e.target.value.slice(0, 80);
      $("#avatar-preview").src = avatarData(seed);
    }
  });
  document.addEventListener("change", async (e) => {
    if (e.target.id !== "local-avatar-image") return;
    try {
      ui.state().avatarImage = await prepareImage(e.target.files[0], true);
      ui.persist();
      ui.render();
      toast("Фото профиля сохранено");
    } catch (error) {
      toast(error.message);
    }
  });
  function mount() {
    if ($("#expression") && !$(".voice-input")) {
      let button = document.createElement("button");
      button.className = "voice-input icon-button";
      button.dataset.action = "x-voice";
      button.setAttribute("aria-label", "Голосовой ввод");
      button.innerHTML = icon("mic");
      $(".display-meta")?.append(button);
    }
    if (ui.currentView() === "settings" && !$("#menu-help")) {
      let help = document.createElement("div");
      help.id = "menu-help";
      help.className = "surface menu-help";
      help.innerHTML = `<div><h3>Как пользоваться калькулятором</h3><p>Повторить обучение по основным разделам.</p></div>${btn("Показать меню", "x-welcome", "secondary")}${btn("Аватарка", "nav", "secondary", 'data-view="avatar"')}${btn("iBeer", "x-beer", "secondary")}`;
      $("#main")?.append(help);
    }
  }
  if (
    !localStorage.getItem("aori-onboarding-v2") &&
    ui.state().history.length === 0
  )
    setTimeout(onboarding, 650);
  return {
    supports: (v) => v === "avatar" || v === "ibeer",
    render: (v) =>
      v === "avatar"
        ? avatarPage()
        : `<div class="page-heading"><div><div class="eyebrow">iBEER / ИЗМЕРЕНИЯ</div><h1>Калькулятор объёма.</h1><p>Виртуальный стакан, наклон и перевод миллилитров в литры.</p></div></div><section class="surface beer-launch"><span>${icon("beer")}</span><h2>Налито 500 миллилитров.</h2><p>Проверьте, сколько останется после наклона, и отправьте объём в калькулятор.</p>${btn("Открыть стакан", "x-beer", "primary")}</section><div class="beer-mode-grid">${beerModes.map(([mode, name, desc]) => `<section class="surface beer-mode"><span>${icon("games")}</span><h2>${name}</h2><p>${desc}</p>${btn("Играть", "x-beer-game", "secondary", `data-mode="${mode}"`)}</section>`).join("")}</div>`,
    mount,
    onboarding,
  };
}
