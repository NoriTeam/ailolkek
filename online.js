import { signIn, signUp, signOut, recover } from "./auth.js";
import { prepareImage, imageSource } from "./media.js";
export const ONLINE_HOME = "https://aori-calculate-online.aorione.chatgpt.site";
export const onlineFeatures = [
  ["online", "Настоящий онлайн-профиль"],
  ["online", "Aori ID: логин и пароль"],
  ["friends", "Поиск пользователей"],
  ["friends", "Заявки в друзья"],
  ["friends", "Принятие и отклонение дружбы"],
  ["messages", "Личные сообщения между друзьями"],
  ["messages", "Формулы в личных сообщениях"],
  ["messages", "Отметки прочтения сообщений"],
  ["clans", "Создание собственного клана"],
  ["clans", "Вступление в существующий клан"],
  ["clans", "Общий список участников клана"],
  ["clans", "Войны существующих кланов против ботов"],
  ["clans", "Серверная проверка ответов в войнах"],
  ["clans", "Общий рейтинг кланов"],
  ["codes", "Собственные пригласительные ссылки"],
  ["codes", "Собственный код приглашения"],
  ["codes", "Приглашения в клан"],
  ["codes", "Подарочные купоны за валюту"],
  ["codes", "Промокоды на три валюты"],
  ["codes", "Однократное погашение кода на сервере"],
  ["online", "Серверный журнал наград"],
  ["network-feed", "Настоящая общая лента формул"],
  ["network-feed", "Общие истории на 24 часа"],
].map(([view, title], i) => ({ id: "net" + i, view, title }));
export function createOnline(ui) {
  const { esc, icon, btn, openModal, closeModal, toast, navigate } = ui,
    $ = (s) => document.querySelector(s);
  let me = null,
    people = [],
    clans = [],
    posts = [],
    members = [],
    runs = [],
    chat = null,
    messages = [],
    loading = false,
    error = "",
    poll = null,
    pendingInvite = new URL(location.href).searchParams.get("invite");
  const hosted =
    location.hostname.endsWith(".chatgpt.site") ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";
  const routes = [
    "online",
    "friends",
    "messages",
    "clans",
    "codes",
    "network-feed",
  ];
  let activeView = "online",
    activeRun = null,
    postImage = null,
    profileImage = null;
  async function request(path, data) {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api" + path, {
        method: data ? "POST" : "GET",
        headers: { ...(data ? { "Content-Type": "application/json" } : {}) },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: "same-origin",
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error || "Ошибка сети");
      return body;
    } finally {
      clearTimeout(timer);
    }
  }
  async function refresh(quiet = false) {
    if (!hosted) return;
    try {
      loading = !quiet;
      me = await request("/me");
      error = "";
      if (me.registered) {
        if (activeView === "friends")
          people = (await request("/people")).people;
        if (activeView === "clans") {
          clans = (await request("/clans")).clans;
          runs = (await request("/wars")).runs;
          if (me.clan) members = (await request("/clans/members")).members;
        }
        if (activeView === "network-feed")
          posts = (await request("/posts")).posts;
        if (activeView === "messages" && chat)
          messages = (
            await request("/messages?with=" + encodeURIComponent(chat.id))
          ).messages;
      }
      loading = false;
      if (
        routes.includes(ui.currentView()) &&
        (!quiet || !document.activeElement?.matches("input,textarea,select"))
      )
        ui.render();
    } catch (e) {
      loading = false;
      error =
        e.name === "AbortError"
          ? "Сервер долго отвечает. Повторите запрос."
          : e.message;
      if (!quiet) ui.render();
    }
  }
  function tabs() {
    return `<nav class="verse-tabs" aria-label="Онлайн-разделы">${[
      ["online", "Профиль"],
      ["friends", "Друзья"],
      ["messages", "Сообщения"],
      ["clans", "Кланы"],
      ["codes", "Коды и подарки"],
      ["network-feed", "Общая лента"],
    ]
      .map(([v, t]) =>
        btn(
          t,
          "nav",
          "chip" + (activeView === v ? " active" : ""),
          `data-view="${v}"`,
        ),
      )
      .join("")}</nav>`;
  }
  function wallet() {
    return `<div class="server-wallet"><div><small>Σ / СИГМЫ</small><b>${me.wallet.sigma}</b></div><div><small>КРИСТАЛЛЫ</small><b>${me.wallet.shards}</b></div><div><small>ЧЕРНИЛА</small><b>${me.wallet.ink}</b></div></div>`;
  }
  function avatar(p) {
    return ui.avatar
      ? p &&
          `<img class="online-avatar" src="${imageSource(p.avatar) || ui.avatar(p.avatar || p.handle)}" alt="">`
      : `<span class="avatar">${icon("profile")}</span>`;
  }
  function title(t, sub) {
    return `<div class="page-heading"><div><div class="eyebrow">AORI / СЕТЕВОЙ КЛУБ</div><h1>${t}</h1><p>${sub}</p></div><span class="online-indicator">${icon("globe")} Сетевой клуб</span></div>${tabs()}${error ? `<div class="network-error" role="alert">${esc(error)} ${btn("Повторить", "n-refresh", "text-button")}</div>` : ""}`;
  }
  function gate() {
    if (!hosted)
      return (
        title(
          "Онлайн-клуб калькулятора.",
          "Общая база, настоящие пользователи и сообщения.",
        ) +
        `<section class="surface network-gate"><span class="gate-icon">${icon("users")}</span><h2>Откройте сетевую версию</h2><p>Эта страница размещена на GitHub Pages. Онлайн-клуб работает на отдельном сервере с базой данных и защищённым входом.</p><a class="primary" href="${ONLINE_HOME}/?${pendingInvite ? "invite=" + encodeURIComponent(pendingInvite) : ""}#${activeView}">Открыть онлайн-клуб ${icon("arrow")}</a><small>Локальные расчёты на этой странице останутся на устройстве.</small></section>`
      );
    if (loading && !me)
      return (
        title("Подключение к клубу.", "Проверяем вход и получаем профиль.") +
        `<div class="surface network-gate"><span class="network-spinner"></span><p>Соединение с сервером…</p></div>`
      );
    if (!me?.authenticated)
      return (
        title(
          "Онлайн-клуб калькулятора.",
          "Друзья, кланы и переписка с формулами.",
        ) +
        `<section class="surface network-registration"><span class="eyebrow">AORI ID</span><h2>Вход в калькулятор</h2><p>Создайте аккаунт калькулятора. Логин и пароль работают на любом устройстве.</p><form id="n-auth"><label>Логин<input name="login" autocomplete="username" pattern="[A-Za-z0-9_]{3,24}" minlength="3" maxlength="24" required></label><label>Пароль<input name="password" type="password" autocomplete="current-password" minlength="10" maxlength="72" required></label><div class="avatar-actions"><button class="primary" type="submit" name="intent" value="login">Войти</button><button class="secondary" type="submit" name="intent" value="signup">Создать аккаунт</button></div><p id="auth-feedback" role="status"></p>${btn("Восстановить доступ", "n-recover", "text-button")}</form><small>При регистрации вы получите код восстановления. Сохраните его: почта и телефон для входа не требуются.</small></section>`
      );
    if (!me.registered)
      return (
        title(
          "Профиль в клубе.",
          "Выберите имя и короткий адрес. После этого вас смогут найти друзья.",
        ) +
        `<section class="surface network-registration"><form id="n-profile"><label>Имя<input name="name" value="${esc(ui.state().name)}" maxlength="30" required></label><label>Адрес профиля<input name="handle" placeholder="my_calculator" pattern="[a-z0-9_]{3,20}" minlength="3" maxlength="20" required></label><input type="hidden" name="avatar" value="${esc(ui.state().avatarSeed || "aori-sigma")}"><button class="primary" type="submit">Создать онлайн-профиль</button></form></section>`
      );
    return null;
  }
  function profilePage() {
    return (
      title(
        "Ваш профиль в сети.",
        "Этот профиль доступен другим пользователям калькулятора.",
      ) +
      `<section class="surface online-profile">${avatar(me.profile)}<div><h2>${esc(me.profile.name)}</h2><p>@${esc(me.profile.handle)}</p><small>${esc(me.profile.bio || "Участник вычислительного клуба")}</small></div>${btn("Изменить", "n-edit-profile", "secondary")}${btn("Выйти", "n-logout", "text-button")}</section>${wallet()}${pendingInvite ? `<section class="surface invite-banner"><div><b>Вас пригласили в клуб</b><p>Код ${esc(pendingInvite)}</p></div>${btn("Принять приглашение", "n-accept-invite", "primary", `data-code="${esc(pendingInvite)}"`)}</section>` : ""}<div class="online-shortcuts">${[
        ["friends", "users", "Найти друзей", me.friends.length + " в списке"],
        [
          "clans",
          "shield",
          "Кланы",
          me.clan ? me.clan.name : "Выберите команду",
        ],
        ["codes", "ticket", "Коды и подарки", "Приглашения и три валюты"],
        [
          "network-feed",
          "message",
          "Общая лента",
          "Публикации настоящих пользователей",
        ],
      ]
        .map(([v, i, t, d]) =>
          btn(
            `${icon(i)}<span><b>${t}</b><small>${esc(d)}</small></span>${icon("arrow")}`,
            "nav",
            "surface online-shortcut",
            `data-view="${v}"`,
          ),
        )
        .join(
          "",
        )}</div><section class="surface server-ledger"><div class="section-heading"><h2>Серверный журнал</h2>${btn("Обновить", "n-refresh", "text-button")}</div>${me.ledger.map((l) => `<div><span><b>${esc(l.reason)}</b><small>${new Date(l.created).toLocaleString("ru-RU")}</small></span><strong>${l.amount > 0 ? "+" : ""}${l.amount} ${currencyName(l.currency)}</strong></div>`).join("")}</section>`
    );
  }
  function person(p, friend = false) {
    return `<div class="online-person">${avatar(p)}<span><b>${esc(p.name)}</b><small>@${esc(p.handle)}</small></span>${friend ? btn(icon("message"), "n-chat", "icon-button", `data-id="${esc(p.id)}" aria-label="Написать ${esc(p.name)}"`) : btn(icon("plus"), "n-friend", "icon-button", `data-id="${esc(p.id)}" aria-label="Добавить в друзья ${esc(p.name)}"`)}</div>`;
  }
  function friendsPage() {
    return (
      title(
        "Друзья по общему знаменателю.",
        "Заявки и сообщения видны на всех устройствах после входа.",
      ) +
      `<div class="friends-layout"><section class="surface online-section"><h2>Ваши друзья · ${me.friends.length}</h2>${me.friends.map((p) => person(p, true)).join("") || '<p class="empty-text">Пока никого. Найдите друга по адресу профиля или отправьте свою ссылку-приглашение.</p>'}<h3>Входящие заявки · ${me.requests.length}</h3>${me.requests.map((p) => `<div class="online-person">${avatar(p)}<span><b>${esc(p.name)}</b><small>@${esc(p.handle)}</small></span>${btn(icon("check"), "n-respond", "icon-button", `data-id="${esc(p.id)}" data-accept="yes" aria-label="Принять"`)}${btn(icon("close"), "n-respond", "icon-button", `data-id="${esc(p.id)}" data-accept="no" aria-label="Отклонить"`)}</div>`).join("") || '<p class="empty-text">Новых заявок нет.</p>'}</section><section class="surface online-section"><h2>Найти человека</h2><form id="n-search-people"><div class="search-field">${icon("search")}<input name="q" placeholder="Имя или адрес профиля" maxlength="30"><button type="submit" class="icon-button" aria-label="Найти">${icon("arrow")}</button></div></form>${people
        .filter((p) => !me.friends.some((f) => f.id === p.id))
        .map((p) => person(p))
        .join("")}</section></div>`
    );
  }
  function messagesPage() {
    return (
      title(
        "Личные сообщения.",
        "Переписка хранится на сервере. Сообщения доступны только участникам диалога.",
      ) +
      `<div class="messages-layout"><aside class="surface chat-people">${me.friends.map((p) => btn(`${avatar(p)}<span><b>${esc(p.name)}</b><small>@${esc(p.handle)}</small></span>`, "n-chat", "chat-person" + (chat?.id === p.id ? " active" : ""), `data-id="${esc(p.id)}"`)).join("") || '<p class="empty-text">Сначала добавьте друга.</p>'}</aside><section class="surface chat-window">${chat ? `<header><b>${esc(chat.name)}</b><small>Обновление каждые 5 секунд</small></header><div class="chat-messages" id="network-messages">${messageList()}</div><form id="n-message"><label class="sr-only" for="chat-text">Сообщение</label><textarea id="chat-text" name="text" maxlength="1800" rows="2" required placeholder="Обсудите расчёт или отправьте формулу"></textarea><div><input name="expression" placeholder="Формула, если нужна" maxlength="300" aria-label="Формула к сообщению"><button class="primary" type="submit">${icon("send")} Отправить</button></div></form>` : '<div class="chat-placeholder">' + icon("message") + "<h3>Выберите собеседника</h3><p>Формулы можно открывать прямо из переписки.</p></div>"}</section></div>`
    );
  }
  function messageList() {
    return (
      messages
        .map(
          (m) =>
            `<article class="chat-bubble ${m.sender === me.profile.id ? "mine" : ""}"><p>${esc(m.text)}</p>${m.expression ? btn(esc(m.expression), "n-use-expression", "chat-formula", `data-expression="${esc(m.expression)}"`) : ""}<small>${new Date(m.created).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}${m.sender === me.profile.id ? (m.read_at ? " · Прочитано" : " · Доставлено") : ""}</small></article>`,
        )
        .join("") ||
      '<p class="empty-text">Диалог начинается с первого сообщения.</p>'
    );
  }
  function clansPage() {
    return (
      title(
        "Кланы вычислителей.",
        "Выбирайте настоящий клан-соперник. В бою его состав ведут боты — ожидания игроков нет.",
      ) +
      `${
        me.clan
          ? `<section class="surface own-clan"><span class="clan-emblem">${icon("shield")}</span><div><span class="eyebrow">ВАШ КЛАН / ${esc(me.clan.tag)}</span><h2>${esc(me.clan.name)}</h2><p>${esc(me.clan.description)}</p></div>${btn("Пригласить", "n-clan-invite", "secondary")}${me.clan.owner_id !== me.profile.id ? btn("Выйти", "n-clan-leave", "text-button") : ""}</section><details class="surface clan-members"><summary>Участники клана · ${members.length}</summary>${members
              .map((p) =>
                person(
                  p,
                  me.friends.some((f) => f.id === p.id),
                ),
              )
              .join("")}</details>`
          : `<section class="surface invite-banner"><div><h2>Соберите свой клан</h2><p>Или вступите в один из существующих ниже.</p></div>${btn("Создать клан", "n-create-clan", "primary")}</section>`
      }<div class="clan-grid">${clans.map((c) => `<article class="surface clan-card"><span class="tag">${esc(c.tag)}</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p><div class="clan-stats"><span>${c.members} участников</span><b>${c.points} очков</b></div>${me.clan?.id === c.id ? '<span class="clan-current">Ваш клан</span>' : me.clan ? btn("Начать бой с ботами", "n-war", "primary", `data-clan="${esc(c.id)}"`) : btn("Вступить", "n-clan-join", "secondary", `data-clan="${esc(c.id)}"`)}</article>`).join("")}</div><section class="surface online-section war-history"><h2>Ваши клановые бои</h2>${runs.map((r) => `<div><span><b>${esc(r.own_clan)} — ${esc(r.opponent)}</b><small>${new Date(r.created).toLocaleString("ru-RU")}</small></span><b>${r.status === "complete" ? r.score + " : " + r.bot_score : "В процессе"}</b></div>`).join("") || '<p class="empty-text">Выберите соперника выше. Пять примеров решают исход боя.</p>'}</section>`
    );
  }
  function codesPage() {
    return (
      title(
        "Пригласить. Подарить. Получить.",
        "Все погашения и балансы проверяются сервером.",
      ) +
      wallet() +
      `<div class="codes-grid"><section class="surface online-section"><h2>Промокоды</h2><p>Небольшие подарки для начала: <b>FIRSTSUM</b>, <b>SOFTLIGHT</b> и <b>INKNOTE</b>. Каждый — один раз на аккаунт.</p><form id="n-promo"><label>Промокод<input name="code" required maxlength="32" placeholder="FIRSTSUM"></label><button class="primary" type="submit">Применить</button></form><h3>Получить подарок</h3><form id="n-claim-coupon"><label>Код купона<input name="code" placeholder="GIFT-…" required maxlength="32"></label><button class="secondary" type="submit">Забрать подарок</button></form></section><section class="surface online-section"><h2>Ваш купон</h2><p>Подарите часть своего сетевого баланса. Валюта резервируется при создании; купон может получить один другой человек.</p><form id="n-coupon"><label>Валюта<select name="currency"><option value="sigma">Сигмы · до 25</option><option value="shards">Кристаллы · до 5</option><option value="ink">Чернила · до 3</option></select></label><label>Количество<input name="amount" type="number" min="1" max="25" value="5" required></label><button class="primary" type="submit">Создать подарочный купон</button></form>${me.coupons.map((c) => `<div class="code-row"><span><b>${c.code}</b><small>${c.amount} ${currencyName(c.currency)} · ${c.claimed ? "Получен" : "Ожидает получателя"}</small></span>${btn(icon("copy"), "n-copy-code", "icon-button", `data-code="${c.code}" aria-label="Скопировать купон"`)}</div>`).join("")}</section><section class="surface online-section"><h2>Своё приглашение</h2><form id="n-invite"><label>Свой код (можно оставить пустым)<input name="code" maxlength="24" placeholder="MY-CALC-CLUB"></label><label>Куда приглашаем<select name="kind"><option value="friend">В друзья</option>${me.clan ? '<option value="clan">В мой клан</option>' : ""}</select></label><button class="primary" type="submit">Создать ссылку</button></form>${me.invites.map((c) => `<div class="code-row"><span><b>${c.code}</b><small>${c.kind === "clan" ? "В клан" : "В друзья"} · ${c.uses}/${c.max_uses}</small></span>${btn(icon("share"), "n-copy-invite", "icon-button", `data-code="${c.code}" aria-label="Скопировать приглашение"`)}</div>`).join("")}</section><section class="surface online-section"><h2>Ввести приглашение</h2><form id="n-invite-claim"><label>Код<input name="code" maxlength="32" value="${esc(pendingInvite || "")}" required></label><button class="primary" type="submit">Принять приглашение</button></form><p class="muted">Коды действуют 7 дней. Ссылка на дружбу подтверждает взаимное добавление, ссылка клана — вступление.</p></section></div>`
    );
  }
  function feedPage() {
    return (
      title(
        "Общая лента формул.",
        "Здесь публикуют расчёты реальные участники клуба.",
      ) +
      `<section class="surface online-section"><form id="n-post"><label>Ваш расчёт<input name="expression" placeholder="Например, 2000*0.8*0.9" required maxlength="300"></label><label>Комментарий<textarea name="text" rows="2" maxlength="1000" required placeholder="Что вы посчитали?"></textarea></label><label>Изображение к расчёту<input type="file" id="n-post-image" accept="image/jpeg,image/png,image/webp"></label><img id="n-post-preview" class="upload-preview" hidden alt="Предпросмотр изображения"><label class="story-checkbox"><input type="checkbox" name="story"> История на 24 часа</label><button class="primary" type="submit">Опубликовать в сети</button></form></section><div class="online-posts">${posts.map((p) => `<article class="surface post-card"><div class="post-author">${avatar({ avatar: p.avatar, handle: p.handle })}<div><b>${esc(p.name)}</b><small>@${esc(p.handle)} · ${p.story ? "История 24 часа" : new Date(p.created).toLocaleDateString("ru-RU")}</small></div></div><p>${esc(p.text)}</p>${imageSource(p.image) ? `<img class="post-image" src="${esc(p.image)}" loading="lazy" alt="Изображение к расчёту">` : ""}${btn(`<span class="mono">${esc(p.expression)}</span><strong>= ${ui.fmt(p.result)}</strong>`, "n-use-expression", "post-equation", `data-expression="${esc(p.expression)}"`)}</article>`).join("") || '<div class="surface empty"><h3>Здесь ещё нет публикаций.</h3><p>Первый расчёт может быть вашим.</p></div>'}</div>`
    );
  }
  function render(v) {
    activeView = v;
    let g = gate();
    if (g) return g;
    return (
      {
        online: profilePage,
        friends: friendsPage,
        messages: messagesPage,
        clans: clansPage,
        codes: codesPage,
        "network-feed": feedPage,
      }[v] || profilePage
    )();
  }
  document.addEventListener("change", async (e) => {
    if (!["n-post-image", "n-profile-image"].includes(e.target.id)) return;
    try {
      let profile = e.target.id === "n-profile-image",
        image = await prepareImage(e.target.files[0], profile);
      if (profile) profileImage = image;
      else postImage = image;
      let preview = $(profile ? "#n-profile-preview" : "#n-post-preview");
      if (preview) {
        preview.src = image;
        preview.hidden = false;
      }
    } catch (error) {
      toast(error.message);
      e.target.value = "";
    }
  });
  function showRecovery(code) {
    openModal(
      `<span class="eyebrow">AORI ID / ВОССТАНОВЛЕНИЕ</span><h2>Сохраните код</h2><p>Он показывается один раз. По нему можно заменить пароль. Храните его отдельно и никому не отправляйте.</p><code class="recovery-code">${code}</code>${btn("Скачать код", "n-download-recovery", "primary")}`,
    );
    document.querySelector("[data-action=n-download-recovery]").onclick = () =>
      ui.download("aori-recovery.txt", code, "text/plain");
  }
  function currencyName(c) {
    return { sigma: "Σ", shards: "крист.", ink: "чернил" }[c] || c;
  }
  function warModal(run) {
    activeRun = run;
    openModal(
      `<span class="eyebrow">КЛАНОВАЯ ВОЙНА / СОПЕРНИКИ-БОТЫ</span><h2>Ход ${run.round + 1} из ${run.total}</h2><div class="war-question">${esc(run.question)} = ?</div><p>Ваш счёт: ${run.score}. Ответ проверяет сервер.</p><form id="n-war-answer"><label>Ответ<input name="answer" type="number" step="any" inputmode="decimal" required autocomplete="off"></label><button class="primary" type="submit">Подтвердить ход</button></form>`,
    );
  }
  async function action(fn) {
    try {
      error = "";
      await fn();
    } catch (e) {
      toast(e.message);
      error = e.message;
    }
  }
  document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-action]");
    if (!b?.dataset.action.startsWith("n-")) return;
    let a = b.dataset.action,
      id = b.dataset.id;
    action(async () => {
      if (a === "n-recover")
        openModal(
          `<h2>Восстановить доступ</h2><form id="n-recovery-form"><label>Логин<input name="login" autocomplete="username" required maxlength="24"></label><label>Код восстановления<input name="recovery" required maxlength="64" autocomplete="off"></label><label>Новый пароль<input name="password" type="password" minlength="10" maxlength="72" autocomplete="new-password" required></label><button class="primary" type="submit">Сменить пароль</button></form>`,
        );
      if (a === "n-refresh") await refresh();
      if (a === "n-logout") {
        await signOut();
        me = null;
        chat = null;
        messages = [];
        await refresh();
      }
      if (a === "n-friend") {
        await request("/friends/request", { user: id });
        toast("Заявка отправлена");
        await refresh();
      }
      if (a === "n-respond") {
        await request("/friends/respond", {
          user: id,
          accept: b.dataset.accept === "yes",
        });
        await refresh();
      }
      if (a === "n-chat") {
        chat = me.friends.find((p) => p.id === id);
        if (!chat) return;
        messages = (await request("/messages?with=" + encodeURIComponent(id)))
          .messages;
        navigate("messages");
        queueMicrotask(() => {
          let list = $("#network-messages");
          if (list) list.scrollTop = list.scrollHeight;
        });
      }
      if (a === "n-use-expression") {
        ui.useExpression(b.dataset.expression);
      }
      if (a === "n-create-clan")
        openModal(
          `<h2>Новый клан</h2><form id="n-clan"><label>Название<input name="name" maxlength="40" minlength="3" required></label><label>Тег<input name="tag" maxlength="6" minlength="2" pattern="[A-Za-z0-9]{2,6}" required></label><label>Описание<textarea name="description" maxlength="250" rows="3"></textarea></label><button class="primary" type="submit">Создать клан</button></form>`,
        );
      if (a === "n-clan-join") {
        await request("/clans/join", { clan: b.dataset.clan });
        await refresh();
      }
      if (a === "n-clan-leave") {
        await request("/clans/leave", {});
        await refresh();
      }
      if (a === "n-clan-invite") {
        let r = await request("/invites", { kind: "clan" });
        await ui.copy(r.url);
        await refresh();
      }
      if (a === "n-accept-invite") {
        await request("/invites/claim", { code: b.dataset.code });
        pendingInvite = null;
        await refresh();
        toast("Приглашение принято");
      }
      if (a === "n-copy-code") await ui.copy(b.dataset.code);
      if (a === "n-copy-invite")
        await ui.copy(
          location.origin +
            "/?invite=" +
            encodeURIComponent(b.dataset.code) +
            "#online",
        );
      if (a === "n-war") {
        let run = await request("/wars/start", { clan: b.dataset.clan });
        warModal(run);
      }
      if (a === "n-edit-profile")
        openModal(
          `<h2>Онлайн-профиль</h2><form id="n-profile"><label>Имя<input name="name" value="${esc(me.profile.name)}" maxlength="30" required></label><label>Адрес<input name="handle" value="${esc(me.profile.handle)}" pattern="[a-z0-9_]{3,20}" required></label><label>Фото профиля<input type="file" id="n-profile-image" accept="image/jpeg,image/png,image/webp"></label><img id="n-profile-preview" class="upload-preview" hidden alt="Предпросмотр аватарки"><label>О себе<textarea name="bio" maxlength="150">${esc(me.profile.bio)}</textarea></label><input type="hidden" name="avatar" value="${esc(ui.state().avatarSeed || me.profile.avatar)}"><button class="primary" type="submit">Сохранить</button></form>`,
        );
    });
  });
  document.addEventListener("submit", (e) => {
    if (!e.target.id.startsWith("n-")) return;
    e.preventDefault();
    const f = e.target,
      d = new FormData(f),
      intent = e.submitter?.value,
      submit = f.querySelector("button[type=submit]");
    if (submit?.disabled) return;
    if (submit) submit.disabled = true;
    action(async () => {
      try {
        if (f.id === "n-auth") {
          let result =
            intent === "signup"
              ? await signUp(d.get("login"), d.get("password"))
              : await signIn(d.get("login"), d.get("password"));
          if (result.recovery) showRecovery(result.recovery);
          await refresh();
        }
        if (f.id === "n-recovery-form") {
          let result = await recover(
            d.get("login"),
            d.get("password"),
            d.get("recovery"),
          );
          showRecovery(result.recovery);
          await refresh();
        }
        if (f.id === "n-profile") {
          let values = Object.fromEntries(d);
          if (profileImage) {
            values.avatar = (
              await request("/media", { image: profileImage })
            ).url;
            profileImage = null;
          }
          me = await request("/profile", values);
          closeModal();
          await refresh();
        }
        if (f.id === "n-search-people") {
          people = (
            await request("/people?q=" + encodeURIComponent(d.get("q")))
          ).people;
          ui.render();
        }
        if (f.id === "n-message") {
          messages = (
            await request("/messages", {
              user: chat.id,
              text: d.get("text"),
              expression: d.get("expression"),
            })
          ).messages;
          f.reset();
          $("#network-messages").innerHTML = messageList();
          $("#network-messages").scrollTop =
            $("#network-messages").scrollHeight;
        }
        if (f.id === "n-clan") {
          await request("/clans", Object.fromEntries(d));
          closeModal();
          await refresh();
        }
        if (f.id === "n-promo") {
          let r = await request("/promos", { code: d.get("code") });
          toast(
            r.already
              ? "Этот промокод уже использован"
              : "Награда получена: " +
                  r.reward.amount +
                  " " +
                  currencyName(r.reward.currency),
          );
          await refresh();
        }
        if (f.id === "n-coupon") {
          let r = await request("/coupons", Object.fromEntries(d));
          toast("Купон " + r.code + " создан");
          await refresh();
        }
        if (f.id === "n-claim-coupon") {
          await request("/coupons/claim", { code: d.get("code") });
          toast("Подарок получен");
          await refresh();
        }
        if (f.id === "n-invite") {
          let r = await request("/invites", Object.fromEntries(d));
          await ui.copy(r.url);
          await refresh();
        }
        if (f.id === "n-invite-claim") {
          await request("/invites/claim", { code: d.get("code") });
          pendingInvite = null;
          toast("Приглашение принято");
          await refresh();
        }
        if (f.id === "n-post") {
          let image = postImage
            ? (await request("/media", { image: postImage })).url
            : null;
          await request("/posts", {
            image,
            text: d.get("text"),
            expression: d.get("expression"),
            story: d.get("story") === "on",
          });
          postImage = null;
          toast("Расчёт опубликован в сети");
          await refresh();
        }
        if (f.id === "n-war-answer") {
          let r = await request("/wars/answer", {
            run: activeRun.id,
            round: activeRun.round,
            answer: d.get("answer"),
          });
          if (r.done) {
            activeRun = null;
            openModal(
              `<span class="eyebrow">КЛАНОВЫЙ БОЙ ЗАВЕРШЁН</span><h2>${r.win ? "Победа вашего клана." : "Соперник оказался точнее."}</h2><div class="battle-final">${r.score} : ${r.botScore}</div><p>+${r.reward?.sigma || 0} Σ${r.reward?.shards ? " · +1 кристалл" : ""}. Очки добавлены в общий рейтинг.</p>`,
            );
            await refresh(true);
          } else warModal(r);
        }
      } finally {
        if (submit?.isConnected) submit.disabled = false;
      }
    });
  });
  function enter(v) {
    activeView = v;
    if (poll) clearInterval(poll);
    if (!hosted) return;
    if (!me) refresh();
    else refresh(true);
    poll = setInterval(async () => {
      if (document.hidden || !routes.includes(ui.currentView())) return;
      if (activeView === "messages" && chat)
        try {
          let next = (
            await request("/messages?with=" + encodeURIComponent(chat.id))
          ).messages;
          if (JSON.stringify(next) !== JSON.stringify(messages)) {
            messages = next;
            let box = $("#network-messages");
            if (box) {
              let atEnd =
                box.scrollHeight - box.scrollTop - box.clientHeight < 100;
              box.innerHTML = messageList();
              if (atEnd) box.scrollTop = box.scrollHeight;
            }
          }
        } catch {}
      else if (activeView === "friends") refresh(true);
    }, 5000);
  }
  return {
    supports: (v) => routes.includes(v),
    render,
    enter,
    leave: () => {
      if (poll) clearInterval(poll);
      poll = null;
    },
    refresh,
    avatarSeed: () => me?.profile?.avatar,
  };
}
