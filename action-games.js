import { evaluate } from "./math.js";
export const actionFeatures = [
  ["action", "Управляемые математические гонки"],
  ["action", "Повороты и препятствия на трассе"],
  ["action", "Ворота с выбором правильного ответа"],
  ["action", "Ускорение за верный расчёт"],
  ["action", "Личный рекорд заезда"],
  ["action", "Шутер от первого лица"],
  ["action", "Трёхмерная проекция числовой арены"],
  ["action", "Движение WASD и экранный пульт"],
  ["action", "Поворот камеры перетаскиванием"],
  ["action", "Стрельба по вычисленным целям"],
  ["action", "Перезарядка через решение примера"],
  ["action", "Волны противников-ошибок"],
  ["action", "Полосы здоровья и боезапас"],
  ["action", "Королевская битва против ботов"],
  ["action", "Сужающаяся зона вычислений"],
  ["action", "Выбывание числовых соперников"],
  ["action", "Награды за место в королевской битве"],
  ["action", "Общий опыт за гонки и стрельбу"],
].map(([view, title], i) => ({ id: "act" + i, view, title }));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export function launchActionGame(mode, api) {
  api.openModal(
    `<div class="action-game-shell"><canvas id="action-canvas" aria-label="${mode === "race" ? "Математическая гонка" : "Числовая арена"}"></canvas><div class="action-overlay"><span class="action-mode">${mode === "race" ? "ТРАССА РЕЗУЛЬТАТОВ" : mode === "royale" ? "ПОСЛЕДНЕЕ РАВЕНСТВО / БОТЫ" : "КОРРЕКТОР / PvE"}</span><div id="action-hud"></div><div id="action-task"></div><div id="action-message" aria-live="polite"></div></div><div class="action-controls">${mode === "race" ? `<div><button data-control="left" aria-label="Поворот налево">←</button><button data-control="right" aria-label="Поворот направо">→</button></div><button data-control="boost" class="action-fire">УСКОРИТЬ</button>` : `<div class="move-pad"><button data-control="forward" aria-label="Вперёд">↑</button><button data-control="left" aria-label="Влево">←</button><button data-control="back" aria-label="Назад">↓</button><button data-control="right" aria-label="Вправо">→</button></div><div class="aim-pad"><button data-control="turnLeft" aria-label="Повернуться налево">↶</button><button data-control="turnRight" aria-label="Повернуться направо">↷</button><button data-control="reload">R / ЗАРЯД</button><button data-control="fire" class="action-fire">ОГОНЬ</button></div>`}</div><div class="action-help">${mode === "race" ? "← → или A / D: руль · Пройдите через верный ответ" : "WASD: движение · Стрелки или перетаскивание: поворот · Пробел: выстрел · R: перезарядка"}</div></div>`,
    "action-modal",
  );
  const modal = document.querySelector("#modal"),
    canvas = document.querySelector("#action-canvas"),
    ctx = canvas.getContext("2d"),
    keys = {},
    controls = {},
    hud = document.querySelector("#action-hud"),
    task = document.querySelector("#action-task"),
    message = document.querySelector("#action-message");
  let stopped = false,
    frame = 0,
    last = performance.now(),
    elapsed = 0,
    score = 0,
    kills = 0,
    health = 100,
    ammo = 8,
    flash = 0,
    reloading = false,
    zone = 11,
    shotCooldown = 0,
    wave = 1,
    question = makeQuestion(),
    rngTimer = 0;
  let player = { x: 2.5, y: 2.5, angle: 0.35 },
    bots = [],
    walls = [
      "1111111111111111",
      "1000000000000001",
      "1000010000100001",
      "1000010000100001",
      "1000000000000001",
      "1000000110000001",
      "1001000000001001",
      "1001000000001001",
      "1000000000000001",
      "1000001110000001",
      "1010000000000101",
      "1010000000000101",
      "1000000000000001",
      "1000100001000001",
      "1000000000000001",
      "1111111111111111",
    ];
  let car = { x: 0, speed: 0, fuel: 100, distance: 0 },
    gates = [],
    obstacles = [],
    spawn = 0,
    gateClock = 0;
  const listen = [];
  function on(el, event, fn, options) {
    el.addEventListener(event, fn, options);
    listen.push(() => el.removeEventListener(event, fn, options));
  }
  function resize() {
    let r = canvas.getBoundingClientRect();
    canvas.width = Math.max(300, Math.floor(r.width));
    canvas.height = Math.max(400, Math.floor(r.height));
  }
  resize();
  on(window, "resize", resize);
  function makeQuestion() {
    let a = rand(2, 12),
      b = rand(2, 9),
      op = ["+", "−", "×"][rand(0, 2)],
      source = `${a}${op}${b}`;
    return { text: source, answer: evaluate(source) };
  }
  function say(text) {
    message.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => {
      message.textContent = "";
    }, 1800);
  }
  function solid(x, y) {
    return walls[Math.floor(y)]?.[Math.floor(x)] !== "0";
  }
  function clearLine(x, y) {
    let dx = x - player.x,
      dy = y - player.y,
      d = Math.hypot(dx, dy);
    for (let t = 0.15; t < d; t += 0.15)
      if (solid(player.x + (dx / d) * t, player.y + (dy / d) * t)) return false;
    return true;
  }
  function spawnBots(n) {
    for (let i = 0; i < n; i++) {
      let x, y;
      do {
        x = rand(2, 13) + 0.5;
        y = rand(2, 13) + 0.5;
      } while (solid(x, y) || Math.hypot(x - player.x, y - player.y) < 3);
      bots.push({
        x,
        y,
        hp: mode === "royale" ? 30 : 22,
        value: 0,
        shot: rand(1, 4),
        phase: Math.random() * 6,
      });
    }
    assignTargets();
  }
  function assignTargets() {
    let living = bots.filter((b) => b.hp > 0);
    for (let b of living) b.value = question.answer + rand(2, 20);
    if (living.length)
      living.sort(
        (a, b) =>
          Math.hypot(a.x - player.x, a.y - player.y) -
          Math.hypot(b.x - player.x, b.y - player.y),
      )[0].value = question.answer;
  }
  if (mode !== "race") spawnBots(mode === "royale" ? 12 : 4);
  function cleanup() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    listen.forEach((fn) => fn());
    clearTimeout(say.timer);
    document.exitPointerLock?.();
  }
  function finish(won, detail) {
    cleanup();
    let reward =
      mode === "race"
        ? Math.max(5, Math.floor(score / 3))
        : Math.max(5, kills * 5 + (won ? 30 : 0));
    api.complete({ mode, score, kills, won, reward, detail });
  }
  function shoot() {
    if (mode === "race" || reloading || shotCooldown > 0) return;
    if (ammo <= 0) {
      reload();
      return;
    }
    ammo--;
    flash = 0.15;
    shotCooldown = 0.35;
    let hits = bots
      .filter((b) => b.hp > 0)
      .map((b) => ({
        b,
        d: Math.hypot(b.x - player.x, b.y - player.y),
        a: Math.atan2(
          Math.sin(Math.atan2(b.y - player.y, b.x - player.x) - player.angle),
          Math.cos(Math.atan2(b.y - player.y, b.x - player.x) - player.angle),
        ),
      }))
      .filter(
        (v) => Math.abs(v.a) < 0.12 && v.d < 12 && clearLine(v.b.x, v.b.y),
      )
      .sort((a, b) => a.d - b.d);
    if (!hits.length) {
      say("Промах. Совместите прицел и цель.");
      return;
    }
    let b = hits[0].b;
    if (b.value !== question.answer) {
      say("Это не ответ на " + question.text);
      health -= 3;
      return;
    }
    b.hp -= evaluate("12*2");
    score += 10;
    say("Верный ответ · 12 × 2 = 24 урона");
    if (b.hp <= 0) {
      kills++;
      score += 15;
      question = makeQuestion();
      assignTargets();
      if (mode === "royale" && kills === 12) {
        finish(true, "Первое место из 13");
        return;
      }
      if (mode === "shooter" && bots.every((b) => b.hp <= 0)) {
        wave++;
        if (wave > 3) {
          finish(true, "Три волны исправлены");
          return;
        }
        health = Math.min(100, health + 20);
        ammo = 8;
        spawnBots(3 + wave);
        say("Волна " + wave + " · здоровье +20");
      }
    }
  }
  function reload() {
    if (reloading || ammo === 8 || mode === "race") return;
    reloading = true;
    let q = makeQuestion();
    task.innerHTML = `<form id="action-reload-form"><label>Перезарядка: ${q.text} = ?<input id="action-reload-answer" type="number" inputmode="numeric" required autocomplete="off" aria-label="Ответ для перезарядки"></label><button type="submit">ЗАРЯДИТЬ</button></form>`;
    let f = document.querySelector("#action-reload-form");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        Number(document.querySelector("#action-reload-answer").value) ===
        q.answer
      ) {
        ammo = 8;
        reloading = false;
        task.innerHTML = "";
        say("Боезапас восстановлен");
      } else say("Проверьте вычисление");
    });
    document.querySelector("#action-reload-answer").focus();
  }
  on(document, "keydown", (e) => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    keys[e.code] = true;
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
        e.code,
      )
    )
      e.preventDefault();
    if (e.code === "Space") shoot();
    if (e.code === "KeyR") reload();
  });
  on(document, "keyup", (e) => {
    keys[e.code] = false;
  });
  document.querySelectorAll("[data-control]").forEach((b) => {
    let key = b.dataset.control;
    on(b, "pointerdown", (e) => {
      e.preventDefault();
      controls[key] = true;
      b.setPointerCapture(e.pointerId);
      if (key === "fire") shoot();
      if (key === "reload") reload();
    });
    on(b, "pointerup", () => {
      controls[key] = false;
    });
    on(b, "pointercancel", () => {
      controls[key] = false;
    });
  });
  let dragging = false,
    dragX = 0;
  on(canvas, "pointerdown", (e) => {
    dragging = true;
    dragX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  on(canvas, "pointermove", (e) => {
    if (!dragging || mode === "race") return;
    player.angle += (e.clientX - dragX) * 0.007;
    dragX = e.clientX;
  });
  on(canvas, "pointerup", (e) => {
    dragging = false;
    if (e.pointerType === "mouse" && mode !== "race") shoot();
  });
  function movePlayer(dt) {
    let forward =
        (keys.KeyW || keys.ArrowUp || controls.forward ? 1 : 0) -
        (keys.KeyS || keys.ArrowDown || controls.back ? 1 : 0),
      strafe =
        (keys.KeyD || controls.right ? 1 : 0) -
        (keys.KeyA || controls.left ? 1 : 0),
      turn =
        (keys.ArrowRight || controls.turnRight ? 1 : 0) -
        (keys.ArrowLeft || controls.turnLeft ? 1 : 0);
    player.angle += turn * 2 * dt;
    let speed = 2.6 * dt,
      dx =
        (Math.cos(player.angle) * forward +
          Math.cos(player.angle + Math.PI / 2) * strafe) *
        speed,
      dy =
        (Math.sin(player.angle) * forward +
          Math.sin(player.angle + Math.PI / 2) * strafe) *
        speed;
    if (!solid(player.x + dx + Math.sign(dx) * 0.15, player.y)) player.x += dx;
    if (!solid(player.x, player.y + dy + Math.sign(dy) * 0.15)) player.y += dy;
  }
  function drawShooter(dt) {
    let w = canvas.width,
      h = canvas.height;
    movePlayer(dt);
    shotCooldown = Math.max(0, shotCooldown - dt);
    flash = Math.max(0, flash - dt);
    if (mode === "royale") zone = Math.max(2.1, 11 - elapsed * 0.055);
    let ceiling = ctx.createLinearGradient(0, 0, 0, h / 2);
    ceiling.addColorStop(0, "#0d101b");
    ceiling.addColorStop(1, "#30273e");
    ctx.fillStyle = ceiling;
    ctx.fillRect(0, 0, w, h / 2);
    let floor = ctx.createLinearGradient(0, h / 2, 0, h);
    floor.addColorStop(0, "#292131");
    floor.addColorStop(1, "#100f17");
    ctx.fillStyle = floor;
    ctx.fillRect(0, h / 2, w, h / 2);
    let depth = [];
    const fov = Math.PI / 3;
    for (let col = 0; col < w; col += 4) {
      let angle =
          player.angle + Math.atan((col / w - 0.5) * 2 * Math.tan(fov / 2)),
        cos = Math.cos(angle),
        sin = Math.sin(angle),
        dist = 0.05;
      while (dist < 22 && !solid(player.x + cos * dist, player.y + sin * dist))
        dist += 0.045;
      let corrected = dist * Math.cos(angle - player.angle),
        height = Math.min(h * 4, (h / corrected) * 0.78),
        shade = Math.max(15, 90 - dist * 5),
        hitX = player.x + cos * dist,
        hitY = player.y + sin * dist,
        seam =
          Math.min(hitX % 1, hitY % 1, 1 - (hitX % 1), 1 - (hitY % 1)) < 0.06;
      ctx.fillStyle = seam
        ? `rgb(${shade * 0.45},${shade * 0.35},${shade * 0.6})`
        : `rgb(${shade * 0.78},${shade * 0.64},${shade})`;
      ctx.fillRect(col, (h - height) / 2, 4, height);
      ctx.fillStyle = `rgba(191,160,238,${Math.max(0, 0.2 - dist * 0.015)})`;
      ctx.fillRect(col, (h - height) / 2, 4, 2);
      for (let k = 0; k < 4; k++) depth[col + k] = corrected;
    }
    let visible = bots
      .filter((b) => b.hp > 0)
      .map((b) => ({
        b,
        d: Math.hypot(b.x - player.x, b.y - player.y),
        a: Math.atan2(
          Math.sin(Math.atan2(b.y - player.y, b.x - player.x) - player.angle),
          Math.cos(Math.atan2(b.y - player.y, b.x - player.x) - player.angle),
        ),
      }))
      .filter((v) => Math.abs(v.a) < fov)
      .sort((a, b) => b.d - a.d);
    for (let { b, d, a } of visible) {
      let x = w / 2 + ((Math.tan(a) / Math.tan(fov / 2)) * w) / 2,
        size = Math.min(h, (h / (d * Math.cos(a))) * 0.66),
        y = h / 2 - size * 0.1;
      if (x < 0 || x > w || depth[Math.floor(x)] < d * Math.cos(a) - 0.4)
        continue;
      ctx.save();
      ctx.translate(x, y);
      let orb = ctx.createRadialGradient(
        -size * 0.12,
        -size * 0.12,
        0,
        0,
        0,
        size * 0.38,
      );
      orb.addColorStop(0, "#dac5ff");
      orb.addColorStop(0.55, "#8e6cb4");
      orb.addColorStop(1, "#2b2035");
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d4b6fa55";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#faf0ff";
      ctx.font = `500 ${Math.max(10, size * 0.19)}px Consolas,monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(b.value), 0, 0);
      ctx.fillStyle = "#5c4b6e";
      ctx.fillRect(
        -size * 0.25,
        -size * 0.43,
        size * 0.5,
        Math.max(2, size * 0.025),
      );
      ctx.fillStyle = "#c7abed";
      ctx.fillRect(
        -size * 0.25,
        -size * 0.43,
        size * 0.5 * Math.max(0, b.hp / (mode === "royale" ? 30 : 22)),
        Math.max(2, size * 0.025),
      );
      ctx.restore();
    }
    for (let b of bots) {
      if (b.hp <= 0) continue;
      let d = Math.hypot(b.x - player.x, b.y - player.y);
      b.shot -= dt;
      if (d < 6 && clearLine(b.x, b.y) && b.shot <= 0) {
        health -= mode === "royale" ? 4 : 3;
        b.shot = 2.8 + Math.random() * 2;
      }
      if (d > 2.3) {
        let speed = 0.35 * dt,
          dx = ((player.x - b.x) / d) * speed,
          dy = ((player.y - b.y) / d) * speed;
        if (!solid(b.x + dx, b.y)) b.x += dx;
        if (!solid(b.x, b.y + dy)) b.y += dy;
      }
      if (mode === "royale" && Math.hypot(b.x - 8, b.y - 8) > zone) {
        b.hp -= dt * 2;
        if (b.hp <= 0) {
          kills++;
          score += 5;
          assignTargets();
        }
      }
    }
    if (mode === "royale" && Math.hypot(player.x - 8, player.y - 8) > zone) {
      health -= dt * 2;
      say("За пределами зоны. Двигайтесь к центру арены.");
    }
    if (health <= 0) {
      finish(
        false,
        mode === "royale"
          ? "Место " + (bots.filter((b) => b.hp > 0).length + 1) + " из 13"
          : "Исправлено " + kills + " ошибок",
      );
      return;
    }
    if (mode === "royale" && bots.every((b) => b.hp <= 0)) {
      finish(true, "Первое место из 13");
      return;
    }
    ctx.strokeStyle = flash ? "#fff5c0" : "#ddd0f5bb";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 12, h / 2);
    ctx.lineTo(w / 2 - 4, h / 2);
    ctx.moveTo(w / 2 + 4, h / 2);
    ctx.lineTo(w / 2 + 12, h / 2);
    ctx.moveTo(w / 2, h / 2 - 12);
    ctx.lineTo(w / 2, h / 2 - 4);
    ctx.moveTo(w / 2, h / 2 + 4);
    ctx.lineTo(w / 2, h / 2 + 12);
    ctx.stroke();
    ctx.fillStyle = "#2d2639";
    ctx.beginPath();
    ctx.moveTo(w * 0.58, h);
    ctx.lineTo(w * 0.56, h * 0.8);
    ctx.lineTo(w * 0.53, h * 0.74);
    ctx.lineTo(w * 0.5, h * 0.74);
    ctx.lineTo(w * 0.48, h * 0.8);
    ctx.lineTo(w * 0.42, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#baa2e2";
    ctx.stroke();
    ctx.fillStyle = "#bda5ed";
    ctx.font = "16px Consolas";
    ctx.textAlign = "center";
    ctx.fillText("Σ", w * 0.52, h * 0.85);
    if (flash) {
      ctx.fillStyle = "#e4d5ff90";
      ctx.beginPath();
      ctx.arc(w * 0.51, h * 0.73, flash * 170, 0, Math.PI * 2);
      ctx.fill();
    }
    if (health < 25) {
      ctx.fillStyle = "#d2434315";
      ctx.fillRect(0, 0, w, h);
    }
    hud.innerHTML = `<span>HP ${Math.max(0, Math.ceil(health))}</span><span>Σ ${ammo}/8</span><span>${mode === "royale" ? "Осталось " + (bots.filter((b) => b.hp > 0).length + 1) + "/13" : "Волна " + wave + "/3"}</span>`;
    if (!reloading)
      task.innerHTML = `<b>${question.text} = ?</b><small>Найдите цель с правильным ответом</small>`;
    if (mode === "royale") {
      ctx.strokeStyle = "#9d90bd66";
      ctx.strokeRect(w - 84, 70, 65, 65);
      ctx.fillStyle = "#ddd0ff";
      ctx.fillRect(
        w - 84 + (player.x / 16) * 65,
        70 + (player.y / 16) * 65,
        3,
        3,
      );
      ctx.beginPath();
      ctx.arc(w - 51.5, 102.5, (zone / 16) * 65, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function drawRace(dt) {
    let w = canvas.width,
      h = canvas.height,
      steer =
        (keys.ArrowRight || keys.KeyD || controls.right ? 1 : 0) -
        (keys.ArrowLeft || keys.KeyA || controls.left ? 1 : 0),
      boost = controls.boost || keys.Space;
    car.x = Math.max(-1.25, Math.min(1.25, car.x + steer * dt * 1.7));
    let target = boost && car.fuel > 0 ? 220 : 150;
    car.speed += (target - car.speed) * dt * 0.7;
    if (Math.abs(car.x) > 1.05) car.speed *= 1 - dt * 0.8;
    if (boost) car.fuel = Math.max(0, car.fuel - dt * 8);
    else car.fuel = Math.min(100, car.fuel + dt * 2);
    car.distance += (car.speed * dt) / 100;
    spawn += dt;
    gateClock += dt;
    let horizon = h * 0.31,
      curve = Math.sin(car.distance * 0.04) * 0.12;
    let sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#151421");
    sky.addColorStop(0.4, "#4f3b58");
    sky.addColorStop(1, "#1a1620");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#bd9bd229";
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.2, 35, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 45; i++) {
      let t = i / 45,
        next = (i + 1) / 45,
        y = horizon + (h - horizon) * t * t,
        y2 = horizon + (h - horizon) * next * next,
        half = w * (0.04 + t * 0.48),
        half2 = w * (0.04 + next * 0.48),
        center = w / 2 + curve * w * (1 - t) ** 2 - car.x * w * 0.08 * t;
      ctx.fillStyle =
        (Math.floor(car.distance * 2) + i) % 2 ? "#26222d" : "#2b2634";
      ctx.beginPath();
      ctx.moveTo(center - half, y);
      ctx.lineTo(center + half, y);
      ctx.lineTo(center + half2, y2);
      ctx.lineTo(center - half2, y2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d9c6f130";
      ctx.lineWidth = 1;
      for (let lane = -1; lane <= 1; lane += 2) {
        ctx.beginPath();
        ctx.moveTo(center + (lane * half) / 3, y);
        ctx.lineTo(center + (lane * half2) / 3, y2);
        ctx.stroke();
      }
      ctx.strokeStyle = "#af8fbc80";
      ctx.beginPath();
      ctx.moveTo(center - half, y);
      ctx.lineTo(center - half2, y2);
      ctx.moveTo(center + half, y);
      ctx.lineTo(center + half2, y2);
      ctx.stroke();
    }
    if (spawn > 2.3) {
      spawn = 0;
      obstacles.push({ lane: rand(0, 2), z: 0.05 });
    }
    if (gateClock > 6) {
      gateClock = 0;
      let q = makeQuestion(),
        correct = rand(0, 2),
        values = Array.from({ length: 3 }, (_, i) =>
          i === correct ? q.answer : q.answer + rand(2, 15),
        );
      gates.push({ z: 0.02, q, correct, values });
      question = q;
    }
    function project(lane, z) {
      let y = horizon + (h - horizon) * z * z,
        half = w * (0.04 + z * 0.48),
        center = w / 2 + curve * w * (1 - z) ** 2 - car.x * w * 0.08 * z;
      return { x: center + (lane - 1) * half * 0.64, y, size: 18 + z * 72 };
    }
    for (let o of obstacles) {
      o.z += (dt * car.speed) / 550;
      if (o.z > 1.05) continue;
      let p = project(o.lane, o.z);
      ctx.fillStyle = "#866874";
      ctx.fillRect(
        p.x - p.size * 0.32,
        p.y - p.size * 0.5,
        p.size * 0.64,
        p.size * 0.6,
      );
      ctx.strokeStyle = "#d5a7bd";
      ctx.strokeRect(
        p.x - p.size * 0.32,
        p.y - p.size * 0.5,
        p.size * 0.64,
        p.size * 0.6,
      );
      ctx.fillStyle = "#d9bed0";
      ctx.font = `${p.size * 0.25}px Consolas`;
      ctx.textAlign = "center";
      ctx.fillText("ERR", p.x, p.y - p.size * 0.12);
      if (
        o.z > 0.88 &&
        !o.hit &&
        Math.abs(car.x - (o.lane - 1) * 0.65) < 0.35
      ) {
        o.hit = true;
        car.speed *= 0.4;
        car.fuel = Math.max(0, car.fuel - 12);
        say("Препятствие · скорость снижена");
      }
    }
    obstacles = obstacles.filter((o) => o.z < 1.1);
    for (let g of gates) {
      g.z += (dt * car.speed) / 650;
      for (let i = 0; i < 3; i++) {
        let p = project(i, g.z);
        ctx.fillStyle = "#b9a1ff19";
        ctx.fillRect(
          p.x - p.size * 0.45,
          p.y - p.size * 0.75,
          p.size * 0.9,
          p.size * 0.72,
        );
        ctx.strokeStyle = "#c1a6ed";
        ctx.strokeRect(
          p.x - p.size * 0.45,
          p.y - p.size * 0.75,
          p.size * 0.9,
          p.size * 0.72,
        );
        ctx.fillStyle = "#ece0ff";
        ctx.font = `${Math.max(12, p.size * 0.32)}px Consolas`;
        ctx.textAlign = "center";
        ctx.fillText(g.values[i], p.x, p.y - p.size * 0.27);
      }
      if (g.z > 0.91 && !g.done) {
        g.done = true;
        let lane = Math.max(0, Math.min(2, Math.round(car.x / 0.65) + 1));
        if (lane === g.correct) {
          score += 25;
          car.speed += 25;
          car.fuel = Math.min(100, car.fuel + 15);
          say(g.q.text + " = " + g.q.answer + " · +25 очков");
        } else {
          car.speed *= 0.7;
          say("Верный ответ: " + g.q.answer);
        }
      }
    }
    gates = gates.filter((g) => g.z < 1.1);
    let carX = w / 2 + car.x * w * 0.27,
      carY = h * 0.8;
    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(steer * 0.07);
    ctx.fillStyle = "#0a08128a";
    ctx.fillRect(-23, 15, 46, 35);
    let body = ctx.createLinearGradient(-22, -40, 22, 25);
    body.addColorStop(0, "#dfcdf6");
    body.addColorStop(0.4, "#a482ce");
    body.addColorStop(1, "#58406e");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(-22, -45, 44, 78, 10);
    ctx.fill();
    ctx.fillStyle = "#342741";
    ctx.fillRect(-14, -24, 28, 20);
    ctx.fillStyle = "#ecddff";
    ctx.font = "19px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("Σ", 0, 18);
    ctx.fillStyle = "#e0c3ff";
    ctx.fillRect(-18, 28, 9, 4);
    ctx.fillRect(9, 28, 9, 4);
    ctx.restore();
    score += dt * 0.3;
    hud.innerHTML = `<span>${Math.round(car.speed)} км/ч</span><span>Заряд ${Math.ceil(car.fuel)}%</span><span>${Math.max(0, 60 - Math.floor(elapsed))} с</span>`;
    let gate = gates.find((g) => !g.done);
    task.innerHTML = gate
      ? `<b>${gate.q.text} = ?</b><small>Выберите полосу с правильным ответом</small>`
      : `<b>${Math.floor(score)} очков</b><small>Следующие ворота скоро появятся</small>`;
    if (elapsed >= 60) finish(true, "Финиш · " + Math.floor(score) + " очков");
  }
  function loop(now) {
    if (stopped) return;
    if (!modal.open || !document.contains(canvas)) {
      cleanup();
      return;
    }
    let dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    if (!document.hidden) {
      elapsed += dt;
      if (mode === "race") drawRace(dt);
      else drawShooter(dt);
    }
    frame = requestAnimationFrame(loop);
  }
  frame = requestAnimationFrame(loop);
  return cleanup;
}
