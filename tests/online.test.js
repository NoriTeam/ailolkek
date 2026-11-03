import test from "node:test";
import assert from "node:assert/strict";
import { api } from "../server/api.js";
import { createDatabase } from "../server/sqlite-test-db.js";
import { evaluate } from "../math.js";
import { avatarSvg, speechToExpression } from "../enhancements.js";
function fixture() {
  let DB = createDatabase();
  return {
    DB,
    async request(user, path, data) {
      let headers = { "Content-Type": "application/json" };
      if (user) headers["oai-authenticated-user-id"] = user;
      let response = await api(
        new Request("https://test.example/api" + path, {
          method: data ? "POST" : "GET",
          headers,
          body: data ? JSON.stringify(data) : undefined,
        }),
        { DB, DEV: true },
      );
      return { status: response.status, data: await response.json() };
    },
    close: () => DB.close(),
  };
}
async function register(f, id) {
  let r = await f.request(id, "/profile", {
    name: id,
    handle: id + "_calc",
    avatar: "face-" + id,
  });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.data.profile;
}
test("anonymous visitors cannot create profiles or access messages", async () => {
  let f = fixture();
  assert.equal((await f.request(null, "/me")).data.authenticated, false);
  assert.equal((await f.request(null, "/messages?with=bob")).status, 401);
  assert.equal(
    (await f.request(null, "/profile", { name: "a", handle: "aaa" })).status,
    401,
  );
  f.close();
});
test("three promo currencies are credited once, including simultaneous attempts", async () => {
  let f = fixture();
  await register(f, "alice");
  await Promise.all([
    f.request("alice", "/promos", { code: "FIRSTSUM" }),
    f.request("alice", "/promos", { code: "FIRSTSUM" }),
  ]);
  await f.request("alice", "/promos", { code: "SOFTLIGHT" });
  await f.request("alice", "/promos", { code: "INKNOTE" });
  let me = (await f.request("alice", "/me")).data;
  assert.deepEqual(me.wallet, { sigma: 65, shards: 5, ink: 3 });
  assert.equal(
    me.ledger.filter((l) => l.reason === "Промокод FIRSTSUM").length,
    1,
  );
  f.close();
});
test("gift coupons debit sender and credit exactly one recipient", async () => {
  let f = fixture();
  await register(f, "alice");
  await register(f, "bob");
  await register(f, "carol");
  let coupon = await f.request("alice", "/coupons", {
    currency: "sigma",
    amount: 5,
  });
  assert.equal(coupon.status, 200, JSON.stringify(coupon.data));
  assert.equal(coupon.data.wallet.sigma, 35);
  let code = coupon.data.code;
  let claim = await f.request("bob", "/coupons/claim", { code });
  assert.equal(claim.status, 200, JSON.stringify(claim.data));
  assert.equal(claim.data.wallet.sigma, 45);
  assert.equal(
    (await f.request("carol", "/coupons/claim", { code })).status,
    400,
  );
  assert.equal(
    (await f.request("bob", "/coupons/claim", { code })).status,
    400,
  );
  assert.equal(
    (await f.request("alice", "/coupons", { currency: "shards", amount: 2 }))
      .status,
    400,
  );
  assert.equal((await f.request("alice", "/me")).data.wallet.sigma, 35);
  f.close();
});
test("friend consent is required for DMs; a third account cannot read them", async () => {
  let f = fixture();
  let a = await register(f, "alice"),
    b = await register(f, "bob");
  await register(f, "carol");
  assert.equal(
    (await f.request("alice", "/messages", { user: b.id, text: "hello" }))
      .status,
    403,
  );
  await f.request("alice", "/friends/request", { user: b.id });
  let pending = (await f.request("bob", "/me")).data;
  assert.equal(pending.requests[0].id, a.id);
  await f.request("bob", "/friends/respond", { user: a.id, accept: true });
  let sent = await f.request("alice", "/messages", {
    user: b.id,
    text: "Считаем вместе",
    expression: "12*12",
  });
  assert.equal(sent.status, 200, JSON.stringify(sent.data));
  assert.equal(sent.data.messages[0].expression, "12*12");
  let read = await f.request(
    "bob",
    "/messages?with=" + encodeURIComponent(a.id),
  );
  assert.equal(read.data.messages[0].text, "Считаем вместе");
  assert.ok(read.data.messages[0].read_at);
  assert.equal(
    (await f.request("carol", "/messages?with=" + a.id)).status,
    403,
  );
  f.close();
});
test("custom invitations are persistent, unique and not reusable by the same account", async () => {
  let f = fixture();
  let a = await register(f, "alice");
  await register(f, "bob");
  let invite = await f.request("alice", "/invites", {
    kind: "friend",
    code: "CALC-FRIEND",
  });
  assert.equal(invite.status, 200);
  assert.ok(invite.data.url.includes("CALC-FRIEND"));
  assert.equal(
    (await f.request("alice", "/invites/claim", { code: "CALC-FRIEND" }))
      .status,
    400,
  );
  assert.equal(
    (await f.request("bob", "/invites/claim", { code: "CALC-FRIEND" })).status,
    200,
  );
  assert.equal(
    (await f.request("bob", "/invites/claim", { code: "CALC-FRIEND" })).data
      .already,
    true,
  );
  assert.equal((await f.request("bob", "/me")).data.friends[0].id, a.id);
  assert.equal((await f.request("alice", "/me")).data.invites[0].uses, 1);
  f.close();
});
test("clan wars use existing clans and server-validated answers; rewards cannot repeat", async () => {
  let f = fixture();
  await register(f, "alice");
  await register(f, "bob");
  let clanA = await f.request("alice", "/clans", {
      name: "Сумма А",
      tag: "SUMA",
    }),
    clanB = await f.request("bob", "/clans", { name: "Сумма Б", tag: "SUMB" });
  assert.equal(clanA.status, 200);
  assert.equal(clanB.status, 200);
  let start = await f.request("alice", "/wars/start", {
    clan: clanB.data.clan.id,
  });
  assert.equal(start.status, 200, JSON.stringify(start.data));
  assert.equal("answer" in start.data, false);
  let run = start.data,
    out;
  for (let round = 0; round < 5; round++) {
    out = await f.request("alice", "/wars/answer", {
      run: run.id,
      round: run.round,
      answer: evaluate(run.question),
    });
    assert.equal(out.status, 200, JSON.stringify(out.data));
    if (!out.data.done) run = out.data;
  }
  assert.equal(out.data.score, 100);
  assert.equal(out.data.win, true);
  assert.deepEqual(out.data.wallet, { sigma: 52, shards: 1, ink: 0 });
  await f.request("alice", "/wars/answer", {
    run: run.id,
    round: 4,
    answer: 0,
  });
  assert.equal((await f.request("alice", "/me")).data.wallet.sigma, 52);
  let clans = (await f.request("alice", "/clans")).data.clans;
  assert.equal(clans.find((c) => c.id === clanA.data.clan.id).points, 100);
  f.close();
});
test("public formula posts are recalculated by server and visible to another user", async () => {
  let f = fixture();
  await register(f, "alice");
  await register(f, "bob");
  let r = await f.request("alice", "/posts", {
    text: "Проверка",
    expression: "(7+5)*3",
    result: 999,
  });
  assert.equal(r.status, 200);
  let feed = (await f.request("bob", "/posts")).data.posts;
  assert.equal(feed[0].result, 36);
  assert.equal(feed[0].name, "alice");
  f.close();
});
test("Russian voice input converts compound numbers and operations", () => {
  assert.equal(
    evaluate(speechToExpression("двадцать пять умножить на четыре")),
    100,
  );
  assert.equal(evaluate(speechToExpression("сто двадцать три плюс семь")), 130);
  assert.equal(
    evaluate(speechToExpression("тысяча двести разделить на три")),
    400,
  );
});
test("avatar output is deterministic, vector, and does not interpolate source text", () => {
  assert.equal(avatarSvg("hello"), avatarSvg("hello"));
  assert.notEqual(avatarSvg("hello"), avatarSvg("world"));
  let svg = avatarSvg("<script>alert(1)</script>");
  assert.ok(svg.startsWith("<svg"));
  assert.equal(svg.includes("<script>"), false);
});

test("native signup stores password hashes, uses HttpOnly sessions, and recovery revokes old sessions", async () => {
  const DB = createDatabase();
  let call = async (path, data, cookie) => {
    let response = await api(
      new Request("https://test.example/api" + path, {
        method: data ? "POST" : "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://test.example",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: data ? JSON.stringify(data) : undefined,
      }),
      { DB },
    );
    return {
      status: response.status,
      cookie: response.headers.get("set-cookie"),
      data: await response.json(),
    };
  };
  let signup = await call("/auth/signup", {
    login: "tester",
    password: "long-test-password",
  });
  assert.equal(signup.status, 200, JSON.stringify(signup.data));
  assert.ok(signup.cookie.includes("HttpOnly"));
  assert.ok(signup.cookie.includes("Secure"));
  assert.equal(signup.data.recovery.length, 64);
  let row = await DB.prepare("SELECT * FROM accounts WHERE login=?")
    .bind("tester")
    .first();
  assert.ok(row.password_hash.startsWith("$2b$12$"));
  assert.notEqual(row.recovery_hash, signup.data.recovery);
  let cookie = signup.cookie.split(";")[0];
  assert.equal((await call("/me", null, cookie)).data.authenticated, true);
  assert.equal(
    (await call("/auth/login", { login: "tester", password: "wrong-password" }))
      .status,
    401,
  );
  let recovery = await call("/auth/recover", {
    login: "tester",
    password: "replacement-password",
    recovery: signup.data.recovery,
  });
  assert.equal(recovery.status, 200);
  assert.equal((await call("/me", null, cookie)).data.authenticated, false);
  assert.equal(
    (
      await call("/auth/recover", {
        login: "tester",
        password: "replacement-password",
        recovery: signup.data.recovery,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await call("/auth/login", {
        login: "tester",
        password: "replacement-password",
      })
    ).status,
    200,
  );
  let spoof = await api(
    new Request("https://test.example/api/me", {
      headers: { "oai-authenticated-user-id": row.id },
    }),
    { DB },
  );
  assert.equal((await spoof.json()).authenticated, false);
  DB.close();
});

test("uploaded images are shared from server; SVG and MIME spoofing are rejected", async () => {
  let f = fixture();
  await register(f, "alice");
  let image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9j8AAAAASUVORK5CYII=";
  let upload = await f.request("alice", "/media", { image });
  assert.equal(upload.status, 200);
  let served = await api(
    new Request("https://test.example" + upload.data.url),
    { DB: f.DB },
  );
  assert.equal(served.headers.get("content-type"), "image/png");
  assert.equal(served.status, 200);
  assert.equal(
    (
      await f.request("alice", "/media", {
        image: "data:image/svg+xml;base64,PHN2Zz4=",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await f.request("alice", "/media", {
        image: "data:image/png;base64,PHN2Zz4=",
      })
    ).status,
    400,
  );
  await f.request("alice", "/posts", {
    expression: "2+2",
    text: "Иллюстрация",
    image: upload.data.url,
  });
  assert.equal(
    (await f.request("alice", "/posts")).data.posts[0].image,
    upload.data.url,
  );
  f.close();
});
