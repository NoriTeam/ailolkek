import bcrypt from "../vendor/bcryptjs/index.js";
import { evaluate } from "../math.js";
const PROMOS = {
  FIRSTSUM: { currency: "sigma", amount: 25 },
  SOFTLIGHT: { currency: "shards", amount: 5 },
  INKNOTE: { currency: "ink", amount: 3 },
};
const currencies = ["sigma", "shards", "ink"];
const digest = async (value) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
const secret = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
async function account(request, env) {
  if (env.DEV && request.headers.get("oai-authenticated-user-id"))
    return request.headers.get("oai-authenticated-user-id");
  const token = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)aori_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  return (
    (
      await first(
        env.DB,
        "SELECT account_id FROM sessions WHERE token_hash=? AND expires>?",
        await digest(token),
        Date.now(),
      )
    )?.account_id || null
  );
}
async function authRoute(request, db, path) {
  if (request.method !== "POST") fail("Ожидается POST.", 405);
  let origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    fail("Неверный источник запроса.", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    fail("Ожидается JSON.", 415);
  let text = await request.text();
  if (text.length > 2048) fail("Слишком большой запрос.", 413);
  let data = JSON.parse(text),
    login = clean(data.login, 24).toLowerCase(),
    password = String(data.password || "");
  const client = request.headers.get("cf-connecting-ip") || "unknown";
  await rate(db, "ip:" + (await digest(client)), path, 12, 900);
  const cookie = (token, age) =>
    "aori_session=" +
    token +
    "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" +
    age +
    (new URL(request.url).protocol === "https:" ? "; Secure" : "");
  if (path === "/api/auth/logout") {
    let token = request.headers
      .get("cookie")
      ?.match(/aori_session=([a-f0-9]{64})/)?.[1];
    if (token)
      await statement(
        db,
        "DELETE FROM sessions WHERE token_hash=?",
        await digest(token),
      ).run();
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": cookie("", 0),
      },
    });
  }
  if (
    !/^[a-z0-9_]{3,24}$/.test(login) ||
    password.length < 10 ||
    password.length > 72 ||
    new TextEncoder().encode(password).length > 72
  )
    fail("Логин: 3–24 латинских буквы, цифры или _. Пароль: 10–72 байта.");
  await rate(db, "login:" + login, path, 8, 900);
  let row = await first(db, "SELECT * FROM accounts WHERE login=?", login),
    id,
    recovery;
  if (path === "/api/auth/signup") {
    if (row) fail("Этот логин уже занят.", 409);
    id = uid();
    recovery = secret();
    let hash = await bcrypt.hash(password, 12);
    await statement(
      db,
      "INSERT INTO accounts(id,login,password_hash,recovery_hash,created) VALUES(?,?,?,?,?)",
      id,
      login,
      hash,
      await digest(recovery),
      Date.now(),
    ).run();
  } else if (path === "/api/auth/login") {
    let valid = await bcrypt.compare(
      password,
      row?.password_hash ||
        "$2b$12$zqsAcBl5LT8s68F2qBs.UeRmhSphxML83b/7QJf4qqPXsWQp5jM.K",
    );
    if (!row || !valid) fail("Логин или пароль не подошли.", 401);
    id = row.id;
  } else if (path === "/api/auth/recover") {
    if (
      !row ||
      (await digest(String(data.recovery || ""))) !== row.recovery_hash
    )
      fail("Логин или код восстановления не подошли.", 401);
    id = row.id;
    recovery = secret();
    let hash = await bcrypt.hash(password, 12);
    await db.batch([
      statement(
        db,
        "UPDATE accounts SET password_hash=?,recovery_hash=? WHERE id=?",
        hash,
        await digest(recovery),
        id,
      ),
      statement(db, "DELETE FROM sessions WHERE account_id=?", id),
    ]);
  } else fail("Маршрут не найден.", 404);
  let token = secret();
  await db.batch([
    statement(db, "DELETE FROM sessions WHERE expires<?", Date.now()),
    statement(
      db,
      "INSERT INTO sessions(token_hash,account_id,expires) VALUES(?,?,?)",
      await digest(token),
      id,
      Date.now() + 30 * 86400000,
    ),
  ]);
  return new Response(JSON.stringify({ ok: true, recovery }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": cookie(token, 30 * 86400),
    },
  });
}
const json = (v, status = 200) =>
  new Response(JSON.stringify(v), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const uid = () => crypto.randomUUID();
const pair = (a, b) => [a, b].sort();
const publicProfile = (p) =>
  p
    ? {
        id: p.user_id,
        handle: p.handle,
        name: p.name,
        avatar: p.avatar_seed,
        bio: p.bio,
        seen: p.last_seen,
      }
    : null;
const clean = (v, max = 100) =>
  String(v ?? "")
    .trim()
    .slice(0, max);
const safeCode = (v) =>
  clean(v, 32)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
function code() {
  return [...crypto.getRandomValues(new Uint8Array(7))]
    .map((v) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[v % 32])
    .join("");
}
function statement(db, sql, ...args) {
  return db.prepare(sql).bind(...args);
}
const all = async (db, sql, ...args) =>
  (await statement(db, sql, ...args).all()).results;
const first = (db, sql, ...args) => statement(db, sql, ...args).first();
async function rate(db, user, action, max, seconds = 60) {
  const slot = Math.floor(Date.now() / (seconds * 1000));
  await statement(
    db,
    "INSERT INTO rate_limits(user_id,action,slot,count) VALUES(?,?,?,1) ON CONFLICT(user_id,action,slot) DO UPDATE SET count=count+1",
    user,
    action,
    slot,
  ).run();
  let r = await first(
    db,
    "SELECT count FROM rate_limits WHERE user_id=? AND action=? AND slot=?",
    user,
    action,
    slot,
  );
  if (r.count > max) fail("Слишком часто. Попробуйте немного позже.", 429);
}
async function wallet(db, user) {
  return await first(
    db,
    "SELECT sigma,shards,ink FROM wallets WHERE user_id=?",
    user,
  );
}
async function rewardOnce(db, user, currency, amount, reason, ref) {
  if (!currencies.includes(currency) || !Number.isInteger(amount))
    fail("Неизвестная валюта");
  let id = uid(),
    now = Date.now();
  await db.batch([
    statement(
      db,
      "INSERT OR IGNORE INTO ledger(id,user_id,currency,amount,reason,ref,created) VALUES(?,?,?,?,?,?,?)",
      id,
      user,
      currency,
      amount,
      reason,
      ref,
      now,
    ),
    statement(
      db,
      `UPDATE wallets SET ${currency}=${currency}+? WHERE user_id=? AND EXISTS(SELECT 1 FROM ledger WHERE id=?)`,
      amount,
      user,
      id,
    ),
  ]);
  return wallet(db, user);
}
async function membership(db, user) {
  return first(
    db,
    "SELECT c.*,m.joined FROM clan_members m JOIN clans c ON c.id=m.clan_id WHERE m.user_id=?",
    user,
  );
}
async function areFriends(db, a, b) {
  let p = pair(a, b);
  return !!(await first(
    db,
    "SELECT a FROM friendships WHERE a=? AND b=?",
    ...p,
  ));
}
async function snapshot(db, user) {
  let profile = await first(db, "SELECT * FROM profiles WHERE user_id=?", user);
  if (!profile) return { authenticated: true, registered: false };
  const [balance, clan, requests, friends, invites, coupons, ledger] =
    await Promise.all([
      wallet(db, user),
      membership(db, user),
      all(
        db,
        "SELECT p.*,r.created AS requested FROM friend_requests r JOIN profiles p ON p.user_id=r.sender WHERE r.recipient=? AND r.status='pending' ORDER BY r.created DESC",
        user,
      ),
      all(
        db,
        "SELECT p.* FROM friendships f JOIN profiles p ON p.user_id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE f.a=? OR f.b=? ORDER BY p.name",
        user,
        user,
        user,
      ),
      all(
        db,
        "SELECT code,kind,clan_id,uses,max_uses,expires FROM invites WHERE owner_id=? ORDER BY created DESC LIMIT 20",
        user,
      ),
      all(
        db,
        "SELECT code,currency,amount,claimed_by IS NOT NULL AS claimed,expires FROM coupons WHERE owner_id=? ORDER BY created DESC LIMIT 20",
        user,
      ),
      all(
        db,
        "SELECT currency,amount,reason,created FROM ledger WHERE user_id=? ORDER BY created DESC LIMIT 30",
        user,
      ),
    ]);
  return {
    authenticated: true,
    registered: true,
    profile: publicProfile(profile),
    wallet: balance,
    clan,
    requests: requests.map(publicProfile),
    friends: friends.map(publicProfile),
    invites,
    coupons,
    ledger,
  };
}
export async function api(request, env) {
  try {
    const url = new URL(request.url),
      path = url.pathname,
      db = env.DB;
    if (path === "/api/health")
      return json({ ok: !!db, service: "aori-online", version: 2 });
    if (!db) fail("База данных ещё не подключена.", 503);
    if (path.startsWith("/api/auth/"))
      return await authRoute(request, db, path);
    if (path.startsWith("/api/media/") && request.method === "GET") {
      let m = await first(
        db,
        "SELECT type,data FROM media WHERE id=?",
        path.split("/").pop(),
      );
      if (!m) fail("Изображение не найдено.", 404);
      return new Response(
        Uint8Array.from(atob(m.data), (c) => c.charCodeAt(0)),
        {
          headers: {
            "Content-Type": m.type,
            "Cache-Control": "public,max-age=86400",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }
    const user = await account(request, env);
    if (!user) {
      if (path === "/api/me") return json({ authenticated: false });
      fail("Войдите в аккаунт для сетевых функций.", 401);
    }
    if (request.method !== "GET") {
      let origin = request.headers.get("origin");
      if (origin && origin !== url.origin)
        fail("Неверный источник запроса.", 403);
      if (!request.headers.get("content-type")?.includes("application/json"))
        fail("Ожидается JSON.", 415);
      if (
        Number(request.headers.get("content-length") || 0) >
        (path === "/api/media" ? 720000 : 16000)
      )
        fail("Слишком большой запрос.", 413);
    }
    if (path === "/api/me" && request.method === "GET")
      return json(await snapshot(db, user));
    let profile = await first(
      db,
      "SELECT * FROM profiles WHERE user_id=?",
      user,
    );
    let raw = request.method === "GET" ? "" : await request.text();
    if (raw.length > (path === "/api/media" ? 720000 : 16000))
      fail("Слишком большой запрос.", 413);
    const data = raw ? JSON.parse(raw) : {};
    if (path === "/api/profile" && request.method === "POST") {
      let handle = clean(data.handle, 20).toLowerCase(),
        name = clean(data.name, 30),
        avatar = clean(data.avatar, 80) || "aori";
      if (
        avatar.startsWith("/api/media/") &&
        !(await first(
          db,
          "SELECT id FROM media WHERE id=? AND user_id=?",
          avatar.split("/").pop(),
          user,
        ))
      )
        fail("Сначала загрузите изображение в свой профиль.");
      if (
        !/^[a-z0-9_]{3,20}$/.test(handle) ||
        handle.startsWith("npc_") ||
        !name
      )
        fail(
          "Имя обязательно. Адрес профиля: 3–20 латинских букв, цифр или _.",
        );
      if (
        await first(
          db,
          "SELECT user_id FROM profiles WHERE handle=? AND user_id<>?",
          handle,
          user,
        )
      )
        fail("Этот адрес профиля уже занят.", 409);
      await rate(db, user, "profile", 8);
      if (profile)
        await statement(
          db,
          "UPDATE profiles SET handle=?,name=?,avatar_seed=?,bio=?,last_seen=? WHERE user_id=?",
          handle,
          name,
          avatar,
          clean(data.bio, 150),
          Date.now(),
          user,
        ).run();
      else
        await db.batch([
          statement(
            db,
            "INSERT INTO profiles(user_id,handle,name,avatar_seed,bio,created,last_seen) VALUES(?,?,?,?,?,?,?)",
            user,
            handle,
            name,
            avatar,
            clean(data.bio, 150),
            Date.now(),
            Date.now(),
          ),
          statement(
            db,
            "INSERT INTO wallets(user_id,sigma,shards,ink) VALUES(?,40,0,0)",
            user,
          ),
          statement(
            db,
            "INSERT INTO ledger(id,user_id,currency,amount,reason,ref,created) VALUES(?,?,?,?,?,?,?)",
            uid(),
            user,
            "sigma",
            40,
            "Открытие онлайн-профиля",
            "welcome",
            Date.now(),
          ),
        ]);
      await seedClubs(db);
      return json(await snapshot(db, user));
    }
    if (!profile) fail("Сначала создайте онлайн-профиль.", 409);
    if (path === "/api/media" && request.method === "POST") {
      await rate(db, user, "upload", 6);
      let m = String(data.image || "").match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/,
      );
      if (!m || m[2].length > 700000)
        fail("Выберите JPEG, PNG или WebP до 500 КБ.");
      let bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
      let valid =
        m[1] === "image/jpeg"
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : m[1] === "image/png"
            ? bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
            : String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
              String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
      if (!valid) fail("Формат изображения не совпадает с содержимым.");
      let quota = await first(
        db,
        "SELECT COUNT(*) AS count FROM media WHERE user_id=?",
        user,
      );
      if (quota.count >= 40)
        fail("Достигнут лимит: 40 изображений на аккаунт.");
      let id = uid();
      await statement(
        db,
        "INSERT INTO media(id,user_id,type,data,created) VALUES(?,?,?,?,?)",
        id,
        user,
        m[1],
        m[2],
        Date.now(),
      ).run();
      return json({ url: "/api/media/" + id });
    }
    if (Date.now() - profile.last_seen > 60000)
      await statement(
        db,
        "UPDATE profiles SET last_seen=? WHERE user_id=?",
        Date.now(),
        user,
      ).run();
    if (path === "/api/people") {
      let q = clean(url.searchParams.get("q"), 30);
      return json({
        people: (
          await all(
            db,
            "SELECT * FROM profiles WHERE user_id<>? AND user_id NOT LIKE 'npc:%' AND (handle LIKE ? OR name LIKE ?) ORDER BY last_seen DESC LIMIT 25",
            user,
            "%" + q + "%",
            "%" + q + "%",
          )
        ).map(publicProfile),
      });
    }
    if (path === "/api/friends/request" && request.method === "POST") {
      let target = clean(data.user, 100);
      if (
        target === user ||
        !(await first(
          db,
          "SELECT user_id FROM profiles WHERE user_id=?",
          target,
        ))
      )
        fail("Профиль не найден.");
      if (await areFriends(db, user, target)) return json({ ok: true });
      await rate(db, user, "friend", 12);
      let inverse = await first(
        db,
        "SELECT sender FROM friend_requests WHERE sender=? AND recipient=? AND status='pending'",
        target,
        user,
      );
      if (inverse) {
        let [a, b] = pair(user, target);
        await db.batch([
          statement(
            db,
            "INSERT OR IGNORE INTO friendships(a,b,created) VALUES(?,?,?)",
            a,
            b,
            Date.now(),
          ),
          statement(
            db,
            "UPDATE friend_requests SET status='accepted' WHERE sender=? AND recipient=?",
            target,
            user,
          ),
        ]);
      } else
        await statement(
          db,
          "INSERT INTO friend_requests(sender,recipient,status,created) VALUES(?,?,'pending',?) ON CONFLICT(sender,recipient) DO UPDATE SET status='pending',created=excluded.created",
          user,
          target,
          Date.now(),
        ).run();
      return json({ ok: true });
    }
    if (path === "/api/friends/respond" && request.method === "POST") {
      let target = clean(data.user, 100);
      if (
        !(await first(
          db,
          "SELECT sender FROM friend_requests WHERE sender=? AND recipient=? AND status='pending'",
          target,
          user,
        ))
      )
        fail("Приглашение уже обработано.");
      let batch = [
        statement(
          db,
          "UPDATE friend_requests SET status=? WHERE sender=? AND recipient=?",
          data.accept ? "accepted" : "declined",
          target,
          user,
        ),
      ];
      if (data.accept) {
        let [a, b] = pair(user, target);
        batch.push(
          statement(
            db,
            "INSERT OR IGNORE INTO friendships(a,b,created) VALUES(?,?,?)",
            a,
            b,
            Date.now(),
          ),
        );
      }
      await db.batch(batch);
      return json({ ok: true });
    }
    if (path === "/api/messages") {
      let target = clean(
        request.method === "GET" ? url.searchParams.get("with") : data.user,
        100,
      );
      if (!(await areFriends(db, user, target)))
        fail("Личные сообщения доступны после принятия дружбы.", 403);
      if (request.method === "POST") {
        let text = clean(data.text, 1800);
        if (!text) fail("Введите сообщение.");
        await rate(db, user, "message", 30);
        let expression = data.expression ? clean(data.expression, 300) : null;
        if (expression) evaluate(expression);
        await statement(
          db,
          "INSERT INTO messages(id,sender,recipient,text,expression,created) VALUES(?,?,?,?,?,?)",
          uid(),
          user,
          target,
          text,
          expression,
          Date.now(),
        ).run();
      }
      await statement(
        db,
        "UPDATE messages SET read_at=? WHERE sender=? AND recipient=? AND read_at IS NULL",
        Date.now(),
        target,
        user,
      ).run();
      let messages = await all(
        db,
        "SELECT id,sender,recipient,text,expression,created,read_at FROM messages WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?) ORDER BY created DESC LIMIT 80",
        user,
        target,
        target,
        user,
      );
      return json({ messages: messages.reverse() });
    }
    if (path === "/api/clans" && request.method === "GET") {
      return json({
        clans: await all(
          db,
          "SELECT c.id,c.name,c.tag,c.description,c.owner_id,COUNT(m.user_id) AS members,COALESCE(s.points,0) AS points FROM clans c LEFT JOIN clan_members m ON m.clan_id=c.id LEFT JOIN war_scores s ON s.clan_id=c.id AND s.season=? GROUP BY c.id ORDER BY points DESC,c.created DESC LIMIT 50",
          new Date().toISOString().slice(0, 7),
        ),
      });
    }
    if (path === "/api/clans" && request.method === "POST") {
      if (await membership(db, user)) fail("Вы уже состоите в клане.");
      let name = clean(data.name, 40),
        tag = clean(data.tag, 6).toUpperCase();
      if (name.length < 3 || !/^[A-Z0-9]{2,6}$/.test(tag))
        fail("Название от 3 символов, тег — 2–6 латинских букв или цифр.");
      if (
        await first(db, "SELECT id FROM clans WHERE name=? OR tag=?", name, tag)
      )
        fail("Название или тег уже заняты.", 409);
      let id = uid();
      await db.batch([
        statement(
          db,
          "INSERT INTO clans(id,name,tag,description,owner_id,created) VALUES(?,?,?,?,?,?)",
          id,
          name,
          tag,
          clean(data.description, 250),
          user,
          Date.now(),
        ),
        statement(
          db,
          "INSERT INTO clan_members(user_id,clan_id,joined) VALUES(?,?,?)",
          user,
          id,
          Date.now(),
        ),
      ]);
      return json({ ok: true, clan: await membership(db, user) });
    }
    if (path === "/api/clans/members") {
      let clan = await membership(db, user);
      if (!clan) fail("Сначала вступите в клан.");
      return json({
        members: (
          await all(
            db,
            "SELECT p.* FROM clan_members m JOIN profiles p ON p.user_id=m.user_id WHERE m.clan_id=? ORDER BY m.joined",
            clan.id,
          )
        ).map(publicProfile),
      });
    }
    if (path === "/api/clans/join" && request.method === "POST") {
      if (await membership(db, user)) fail("Вы уже состоите в клане.");
      let clan = await first(
        db,
        "SELECT id FROM clans WHERE id=?",
        clean(data.clan, 100),
      );
      if (!clan) fail("Клан не найден.");
      await statement(
        db,
        "INSERT INTO clan_members(user_id,clan_id,joined) VALUES(?,?,?)",
        user,
        clan.id,
        Date.now(),
      ).run();
      return json({ ok: true });
    }
    if (path === "/api/clans/leave" && request.method === "POST") {
      let c = await membership(db, user);
      if (!c) fail("Вы не состоите в клане.");
      if (c.owner_id === user) fail("Основатель остаётся хранителем клана.");
      await statement(
        db,
        "DELETE FROM clan_members WHERE user_id=?",
        user,
      ).run();
      return json({ ok: true });
    }
    if (path === "/api/invites" && request.method === "POST") {
      await rate(db, user, "invite", 10, 86400);
      let kind = data.kind === "clan" ? "clan" : "friend",
        clan = kind === "clan" ? await membership(db, user) : null;
      if (kind === "clan" && !clan) fail("Сначала вступите в клан.");
      let own = data.code ? safeCode(data.code) : "AORI-" + code();
      if (own.length < 5) fail("Код от 5 символов.");
      if (await first(db, "SELECT code FROM invites WHERE code=?", own))
        fail("Такой код уже занят.");
      await statement(
        db,
        "INSERT INTO invites(code,owner_id,kind,clan_id,max_uses,expires,created) VALUES(?,?,?,?,?,?,?)",
        own,
        user,
        kind,
        clan?.id || null,
        10,
        Date.now() + 7 * 86400000,
        Date.now(),
      ).run();
      return json({
        code: own,
        kind,
        url: url.origin + "/?invite=" + encodeURIComponent(own) + "#online",
      });
    }
    if (path === "/api/invites/claim" && request.method === "POST") {
      let c = safeCode(data.code),
        invite = await first(db, "SELECT * FROM invites WHERE code=?", c);
      if (
        !invite ||
        invite.expires < Date.now() ||
        invite.uses >= invite.max_uses
      )
        fail("Приглашение недействительно.");
      if (invite.owner_id === user)
        fail("Нельзя принять собственное приглашение.");
      if (
        await first(
          db,
          "SELECT id FROM invite_claims WHERE code=? AND user_id=?",
          c,
          user,
        )
      )
        return json({ ok: true, already: true });
      let id = uid();
      let batch = [
        statement(
          db,
          "INSERT OR IGNORE INTO invite_claims(id,code,user_id,created) VALUES(?,?,?,?)",
          id,
          c,
          user,
          Date.now(),
        ),
        statement(
          db,
          "UPDATE invites SET uses=uses+1 WHERE code=? AND EXISTS(SELECT 1 FROM invite_claims WHERE id=?)",
          c,
          id,
        ),
      ];
      if (invite.kind === "clan") {
        let member = await membership(db, user);
        if (member && member.id !== invite.clan_id)
          fail("Сначала выйдите из текущего клана.");
        batch.push(
          statement(
            db,
            "INSERT OR IGNORE INTO clan_members(user_id,clan_id,joined) VALUES(?,?,?)",
            user,
            invite.clan_id,
            Date.now(),
          ),
        );
      } else {
        let [a, b] = pair(user, invite.owner_id);
        batch.push(
          statement(
            db,
            "INSERT OR IGNORE INTO friendships(a,b,created) VALUES(?,?,?)",
            a,
            b,
            Date.now(),
          ),
        );
      }
      await db.batch(batch);
      return json({ ok: true, kind: invite.kind });
    }
    if (path === "/api/promos" && request.method === "POST") {
      await rate(db, user, "promo", 8);
      let c = safeCode(data.code),
        promo = PROMOS[c];
      if (!promo) fail("Промокод не найден.");
      let id = uid();
      await db.batch([
        statement(
          db,
          "INSERT OR IGNORE INTO promo_claims(id,user_id,code,currency,amount,created) VALUES(?,?,?,?,?,?)",
          id,
          user,
          c,
          promo.currency,
          promo.amount,
          Date.now(),
        ),
        statement(
          db,
          `UPDATE wallets SET ${promo.currency}=${promo.currency}+? WHERE user_id=? AND EXISTS(SELECT 1 FROM promo_claims WHERE id=?)`,
          promo.amount,
          user,
          id,
        ),
        statement(
          db,
          "INSERT INTO ledger(id,user_id,currency,amount,reason,ref,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM promo_claims WHERE id=?)",
          uid(),
          user,
          promo.currency,
          promo.amount,
          "Промокод " + c,
          "promo-" + c,
          Date.now(),
          id,
        ),
      ]);
      let claim = await first(db, "SELECT id FROM promo_claims WHERE id=?", id);
      return json({
        ok: !!claim,
        already: !claim,
        reward: promo,
        wallet: await wallet(db, user),
      });
    }
    if (path === "/api/coupons" && request.method === "POST") {
      let currency = currencies.includes(data.currency)
          ? data.currency
          : "sigma",
        amount = Number(data.amount),
        max = currency === "sigma" ? 25 : currency === "shards" ? 5 : 3;
      if (!Number.isInteger(amount) || amount < 1 || amount > max)
        fail("Для этой валюты можно подарить от 1 до " + max + ".");
      await rate(db, user, "coupon", 5, 86400);
      let c = "GIFT-" + code(),
        ledgerId = uid();
      await db.batch([
        statement(
          db,
          `UPDATE wallets SET ${currency}=${currency}-? WHERE user_id=? AND ${currency}>=?`,
          amount,
          user,
          amount,
        ),
        statement(
          db,
          "INSERT INTO coupons(code,owner_id,currency,amount,created,expires) SELECT ?,?,?,?,?,? WHERE changes()=1",
          c,
          user,
          currency,
          amount,
          Date.now(),
          Date.now() + 7 * 86400000,
        ),
        statement(
          db,
          "INSERT INTO ledger(id,user_id,currency,amount,reason,ref,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM coupons WHERE code=?)",
          ledgerId,
          user,
          currency,
          -amount,
          "Подарочный купон",
          c,
          Date.now(),
          c,
        ),
      ]);
      if (!(await first(db, "SELECT code FROM coupons WHERE code=?", c)))
        fail("Не хватает валюты.");
      return json({
        code: c,
        currency,
        amount,
        wallet: await wallet(db, user),
      });
    }
    if (path === "/api/coupons/claim" && request.method === "POST") {
      let c = safeCode(data.code),
        coupon = await first(db, "SELECT * FROM coupons WHERE code=?", c);
      if (!coupon || coupon.expires < Date.now())
        fail("Купон не найден или истёк.");
      if (coupon.owner_id === user)
        fail("Купон предназначен другому человеку.");
      if (coupon.claimed_by) fail("Купон уже использован.");
      await db.batch([
        statement(
          db,
          "UPDATE coupons SET claimed_by=? WHERE code=? AND claimed_by IS NULL",
          user,
          c,
        ),
        statement(
          db,
          `UPDATE wallets SET ${coupon.currency}=${coupon.currency}+? WHERE user_id=? AND changes()=1`,
          coupon.amount,
          user,
        ),
        statement(
          db,
          "INSERT OR IGNORE INTO ledger(id,user_id,currency,amount,reason,ref,created) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM coupons WHERE code=? AND claimed_by=?)",
          uid(),
          user,
          coupon.currency,
          coupon.amount,
          "Подарок по купону",
          c,
          Date.now(),
          c,
          user,
        ),
      ]);
      return json({ ok: true, wallet: await wallet(db, user) });
    }
    if (path === "/api/posts") {
      if (request.method === "POST") {
        let text = clean(data.text, 1000),
          expression = clean(data.expression, 300);
        if (!text || !expression) fail("Введите текст и формулу.");
        await rate(db, user, "post", 8);
        let result = evaluate(expression);
        await statement(
          db,
          "INSERT INTO posts(id,user_id,text,expression,result,created,story,image) VALUES(?,?,?,?,?,?,?,?)",
          uid(),
          user,
          text,
          expression,
          result,
          Date.now(),
          data.story ? 1 : 0,
          clean(data.image, 80).startsWith("/api/media/")
            ? clean(data.image, 80)
            : null,
        ).run();
      }
      return json({
        posts: await all(
          db,
          "SELECT p.id,p.text,p.expression,p.result,p.created,p.story,p.image,u.handle,u.name,u.avatar_seed AS avatar FROM posts p JOIN profiles u ON p.user_id=u.user_id WHERE p.story=0 OR p.created>? ORDER BY p.created DESC LIMIT 60",
          Date.now() - 86400000,
        ),
      });
    }
    if (path === "/api/wars/start" && request.method === "POST") {
      let clan = await membership(db, user);
      if (!clan) fail("Для войны нужно состоять в клане.");
      let opponent = await first(
        db,
        "SELECT * FROM clans WHERE id=?",
        clean(data.clan, 100),
      );
      if (!opponent || opponent.id === clan.id)
        fail("Выберите другой существующий клан.");
      await rate(db, user, "war-start", 10, 86400);
      let active = await first(
        db,
        "SELECT * FROM war_runs WHERE user_id=? AND status='active' AND updated>? ORDER BY created DESC LIMIT 1",
        user,
        Date.now() - 15 * 60000,
      );
      if (active) return json(publicRun(active));
      let questions = Array.from({ length: 5 }, () => {
          let [a, b] = crypto.getRandomValues(new Uint8Array(2));
          a = (a % 18) + 3;
          b = (b % 12) + 2;
          let op = ["+", "-", "*"][a % 3],
            expression = a + op + b;
          return { expression, answer: evaluate(expression) };
        }),
        bot = 40 + (crypto.getRandomValues(new Uint8Array(1))[0] % 4) * 20,
        id = uid(),
        now = Date.now();
      await statement(
        db,
        "INSERT INTO war_runs(id,user_id,clan_a,clan_b,questions,bot_score,created,updated) VALUES(?,?,?,?,?,?,?,?)",
        id,
        user,
        clan.id,
        opponent.id,
        JSON.stringify(questions),
        bot,
        now,
        now,
      ).run();
      return json(
        publicRun(await first(db, "SELECT * FROM war_runs WHERE id=?", id)),
      );
    }
    if (path === "/api/wars/answer" && request.method === "POST") {
      let run = await first(
        db,
        "SELECT * FROM war_runs WHERE id=? AND user_id=?",
        clean(data.run, 100),
        user,
      );
      if (!run) fail("Бой не найден.");
      if (run.status !== "active")
        return json({ done: true, score: run.score, botScore: run.bot_score });
      if (Date.now() - run.updated > 15 * 60000) fail("Время боя истекло.");
      let clan = await membership(db, user);
      if (clan?.id !== run.clan_a) fail("Ваш клан изменился.");
      if (Number(data.round) !== run.round_index)
        fail("Этот ход уже обработан.", 409);
      let qs = JSON.parse(run.questions),
        correct =
          Math.abs(Number(data.answer) - qs[run.round_index].answer) < 1e-8,
        index = run.round_index + 1,
        score = run.score + (correct ? 20 : 0),
        done = index === 5,
        win = score >= run.bot_score,
        season = new Date().toISOString().slice(0, 7),
        reward = win ? 12 : 4;
      let batch = [
        statement(
          db,
          "UPDATE war_runs SET round_index=?,correct=correct+?,score=?,status=?,updated=? WHERE id=? AND round_index=? AND status=?",
          index,
          correct ? 1 : 0,
          score,
          done ? "complete" : "active",
          Date.now(),
          run.id,
          run.round_index,
          "active",
        ),
      ];
      if (done) {
        let ref = "war-" + run.id,
          receipt = uid();
        batch.push(
          statement(
            db,
            "INSERT OR IGNORE INTO ledger(id,user_id,currency,amount,reason,ref,created) SELECT ?,?,'sigma',?,'Клановое испытание',?,? WHERE EXISTS(SELECT 1 FROM war_runs WHERE id=? AND status='complete' AND round_index=5)",
            receipt,
            user,
            reward,
            ref,
            Date.now(),
            run.id,
          ),
          statement(
            db,
            "UPDATE wallets SET sigma=sigma+?,shards=shards+? WHERE user_id=? AND EXISTS(SELECT 1 FROM ledger WHERE id=?)",
            reward,
            win ? 1 : 0,
            user,
            receipt,
          ),
          statement(
            db,
            "INSERT INTO war_scores(clan_id,season,points,wins) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM ledger WHERE id=?) ON CONFLICT(clan_id,season) DO UPDATE SET points=points+excluded.points,wins=wins+excluded.wins",
            run.clan_a,
            season,
            score,
            win ? 1 : 0,
            receipt,
          ),
        );
      }
      await db.batch(batch);
      if (done)
        return json({
          done: true,
          win,
          score,
          botScore: run.bot_score,
          reward: { sigma: reward, shards: win ? 1 : 0 },
          wallet: await wallet(db, user),
        });
      return json({
        ...publicRun(
          await first(db, "SELECT * FROM war_runs WHERE id=?", run.id),
        ),
        correct,
        lastAnswer: qs[run.round_index].answer,
      });
    }
    if (path === "/api/wars")
      return json({
        runs: await all(
          db,
          "SELECT r.id,r.score,r.bot_score,r.status,r.created,a.name AS own_clan,b.name AS opponent FROM war_runs r JOIN clans a ON a.id=r.clan_a JOIN clans b ON b.id=r.clan_b WHERE r.user_id=? ORDER BY r.created DESC LIMIT 20",
          user,
        ),
      });
    return json({ error: "Маршрут не найден." }, 404);
  } catch (e) {
    if (!e.status) console.error(e.stack);
    return json(
      {
        error: e.status
          ? e.message
          : "Не удалось выполнить запрос. Попробуйте ещё раз.",
      },
      e.status || 500,
    );
  }
}
function publicRun(run) {
  let qs = JSON.parse(run.questions);
  return {
    id: run.id,
    round: run.round_index,
    total: 5,
    score: run.score,
    question: qs[run.round_index]?.expression,
    opponent: run.clan_b,
    status: run.status,
  };
}

async function seedClubs(db) {
  const clubs = [
    [
      "archive",
      "Архив формул",
      "ARCV",
      "Официальный клуб архива. Расчётный состав управляется ботами.",
    ],
    [
      "percent",
      "Бюро процентов",
      "PCT",
      "Официальный клуб прикладных расчётов. Соперники в боях — боты.",
    ],
    [
      "geometry",
      "Палата геометрии",
      "GEO",
      "Официальный клуб геометрии. Постоянный бот-состав для испытаний.",
    ],
  ];
  for (let [id, name, tag, description] of clubs) {
    let owner = "npc:" + id,
      clan = "official:" + id;
    await db.batch([
      statement(
        db,
        "INSERT OR IGNORE INTO profiles(user_id,handle,name,avatar_seed,bio,created,last_seen) VALUES(?,?,?,?,?,?,?)",
        owner,
        "npc_" + id,
        name,
        "club-" + id,
        description,
        0,
        0,
      ),
      statement(
        db,
        "INSERT OR IGNORE INTO clans(id,name,tag,description,owner_id,created) VALUES(?,?,?,?,?,?)",
        clan,
        name,
        tag,
        description,
        owner,
        0,
      ),
      statement(
        db,
        "INSERT OR IGNORE INTO clan_members(user_id,clan_id,joined) VALUES(?,?,?)",
        owner,
        clan,
        0,
      ),
    ]);
  }
}
