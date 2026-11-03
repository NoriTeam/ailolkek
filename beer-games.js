export const beerModes = [
  [
    "measure",
    "Точный налив",
    "Остановитесь у отметки. Погрешность до 35 мл засчитывается.",
  ],
  [
    "balance",
    "Ровный поднос",
    "Удерживайте стакан около центра десять секунд.",
  ],
  ["mix", "Мастер пропорций", "Соберите нужный объём из двух ингредиентов."],
  ["foam", "Без лишней пены", "Снимайте пену и сохраняйте полезный объём."],
];
export function launchBeerGame(ui, mode) {
  const config = beerModes.find((x) => x[0] === mode);
  if (!config) return;
  const { openModal, closeModal, btn, toast } = ui;
  let round = 1,
    score = 0,
    value = 0,
    target = 250,
    held = false,
    frame = 0,
    last = 0,
    time = 0,
    angle = 0,
    control = 0,
    foam = 70,
    stopped = false;
  openModal(
    `<span class="eyebrow">iBEER / ${config[1]}</span><h2>${config[1]}</h2><p>${config[2]}</p><div class="beer-game-status"><b id="beer-game-round">Раунд 1 / 5</b><span id="beer-game-score">0 очков</span></div><canvas id="beer-game-canvas" width="380" height="300" aria-label="Игровой мерный стакан"></canvas><p id="beer-game-task" class="beer-game-task"></p><div id="beer-game-controls"></div><p id="beer-game-feedback" role="status">Можно пробовать без ограничения попыток.</p>`,
  );
  const $ = (s) => document.querySelector(s),
    canvas = $("#beer-game-canvas"),
    ctx = canvas.getContext("2d");
  function draw() {
    ctx.clearRect(0, 0, 380, 300);
    ctx.save();
    ctx.translate(190, 145);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.fillStyle = "#27232f";
    ctx.beginPath();
    ctx.roundRect(-80, -125, 160, 255, 18);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-74, -119, 148, 243, 14);
    ctx.clip();
    let fill = mode === "foam" ? 400 : value;
    ctx.fillStyle = "#bc913d";
    ctx.fillRect(-74, 124 - (fill / 500) * 230, 148, 260);
    if (mode === "foam") {
      ctx.fillStyle = "#eddfbd";
      ctx.fillRect(
        -74,
        124 - ((fill + foam) / 500) * 230,
        148,
        (foam / 500) * 230,
      );
    }
    ctx.restore();
    ctx.strokeStyle = "#e0c478";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-93, 124 - (target / 500) * 230);
    ctx.lineTo(93, 124 - (target / 500) * 230);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#c4bbc9";
    ctx.font = "14px Golos Text, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      Math.round(mode === "foam" ? foam : value) +
        " " +
        (mode === "foam" ? "мл пены" : "мл"),
      190,
      288,
    );
  }
  function controls() {
    let box = $("#beer-game-controls");
    if (mode === "measure")
      box.innerHTML = `<button id="beer-pour-hold" class="primary">Удерживать: наливать</button>${btn("Проверить объём", "beer-check", "secondary")}`;
    if (mode === "balance")
      box.innerHTML = `<label>Наклон подноса<input id="beer-game-input" type="range" min="-25" max="25" value="0" aria-label="Наклон подноса"></label>`;
    if (mode === "mix")
      box.innerHTML = `<label>Сок, мл<input id="beer-game-input" type="range" min="0" max="300" step="10" value="0"></label><button data-beer-add="50" class="secondary">+50 мл воды</button><button data-beer-add="100" class="secondary">+100 мл воды</button>${btn("Проверить объём", "beer-check", "primary")}`;
    if (mode === "foam")
      box.innerHTML = `<button id="beer-skim" class="primary">Снять 10 мл пены</button>${btn("Готово", "beer-check", "secondary")}`;
    box
      .querySelector("#beer-pour-hold")
      ?.addEventListener("pointerdown", (e) => {
        held = true;
        e.target.setPointerCapture(e.pointerId);
      });
    box
      .querySelector("#beer-pour-hold")
      ?.addEventListener("pointerup", () => (held = false));
    box
      .querySelector("#beer-pour-hold")
      ?.addEventListener("pointercancel", () => (held = false));
    box.querySelector("#beer-game-input")?.addEventListener("input", (e) => {
      if (mode === "balance") control = Number(e.target.value);
      else {
        let n = Number(e.target.value);
        value += n - control;
        control = n;
        draw();
      }
    });
    box.querySelectorAll("[data-beer-add]").forEach(
      (b) =>
        (b.onclick = () => {
          value = Math.min(500, value + Number(b.dataset.beerAdd));
          draw();
        }),
    );
    box.querySelector("#beer-skim")?.addEventListener("click", () => {
      foam = Math.max(0, foam - 10);
      draw();
    });
    box
      .querySelector("[data-action=beer-check]")
      ?.addEventListener("click", check);
  }
  function next() {
    held = false;
    value = mode === "balance" ? 400 : 0;
    control = 0;
    foam = 70;
    time = 0;
    target = [200, 300, 250, 400, 350][round - 1];
    $("#beer-game-round").textContent = "Раунд " + round + " / 5";
    $("#beer-game-task").textContent =
      mode === "measure"
        ? "Налейте " + target + " мл"
        : mode === "balance"
          ? "Держите угол в пределах ±12°: 0 / 10 с"
          : mode === "mix"
            ? "Соберите " + target + " мл напитка"
            : "Оставьте не более 20 мл пены";
    controls();
    draw();
  }
  function check() {
    if (stopped) return;
    let good =
      mode === "balance" || mode === "foam"
        ? mode === "balance" || foam <= 20
        : Math.abs(value - target) <= 35;
    if (!good) {
      $("#beer-game-feedback").textContent =
        mode === "foam"
          ? "Снимите ещё немного пены."
          : "Сейчас " +
            Math.round(value) +
            " мл. Попробуйте снова, штрафа нет.";
      if (mode === "measure" || mode === "mix") {
        value = 0;
        control = 0;
        controls();
        draw();
      }
      return;
    }
    score += 20;
    $("#beer-game-score").textContent = score + " очков";
    if (round === 5) {
      stopped = true;
      cancelAnimationFrame(frame);
      $("#beer-game-task").textContent = "Пять раундов пройдены.";
      $("#beer-game-controls").innerHTML = btn(
        "Результат в калькулятор",
        "beer-result",
        "primary",
      );
      $("#beer-game-controls button").onclick = () => {
        closeModal();
        ui.useExpression(score + "*5");
        toast(score + " очков × 5 раундов");
      };
      $("#beer-game-feedback").textContent =
        "Ваш результат: " + score + " / 100";
      return;
    }
    round++;
    $("#beer-game-feedback").textContent = "Верно. Следующая отметка.";
    next();
  }
  function tick(now) {
    if (stopped || !canvas.isConnected || !$("#modal").open) return;
    let dt = Math.min(0.04, last ? (now - last) / 1000 : 0);
    last = now;
    if (!document.hidden) {
      if (mode === "measure" && held) value = Math.min(500, value + dt * 85);
      if (mode === "balance") {
        angle = Math.sin(now / 2400) * 7 + control;
        if (Math.abs(angle) <= 12) time += dt;
        $("#beer-game-task").textContent =
          "Угол " +
          Math.round(angle) +
          "° · " +
          Math.min(10, time).toFixed(1) +
          " / 10 с";
        if (time >= 10) check();
      }
      if ((mode === "measure" && held) || mode === "balance") draw();
    }
    frame = requestAnimationFrame(tick);
  }
  next();
  if (mode === "measure" || mode === "balance")
    frame = requestAnimationFrame(tick);
}
