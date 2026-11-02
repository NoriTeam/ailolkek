import test from "node:test";
import assert from "node:assert/strict";
import {
  createUniverse,
  universeFeatures,
  validateUniverse,
} from "../universe.js";
import {
  deriveStats,
  combatDamage,
  eventFeatures,
  validateRpg,
} from "../events.js";
function setup(existing) {
  const listeners = {};
  globalThis.document = {
    documentElement: { dataset: {}, style: { setProperty() {} } },
    querySelector: () => null,
    addEventListener: (name, fn) => {
      (listeners[name] ||= []).push(fn);
    },
  };
  let state = existing || {
    name: "Test",
    xp: 0,
    used: [],
    settings: { accent: "#b9a1ff", theme: "surface" },
    history: [],
  };
  let message = "",
    modal = "";
  const ui = {
    getState: () => state,
    persist() {},
    render() {},
    navigate() {},
    icon: () => "",
    esc: (v) => String(v),
    btn: () => "",
    openModal: (v) => {
      modal = v;
    },
    closeModal() {},
    toast: (v) => {
      message = v;
    },
    rewardXp: (n) => {
      state.xp += n;
    },
    useExpression() {},
  };
  const app = createUniverse(ui);
  const click = (action, extra = {}) =>
    listeners.click.forEach((fn) =>
      fn({
        target: { closest: () => ({ dataset: { action, ...extra } }) },
      }),
    );
  const submit = (id, values) => {
    const Original = globalThis.FormData;
    globalThis.FormData = class {
      constructor(f) {
        this.values = f.values;
      }
      get(k) {
        return this.values[k];
      }
    };
    try {
      for (const fn of listeners.submit || [])
        fn({ target: { id, values }, preventDefault() {} });
    } finally {
      globalThis.FormData = Original;
    }
  };
  return {
    state,
    app,
    click,
    submit,
    get message() {
      return message;
    },
    get modal() {
      return modal;
    },
  };
}
test("72 additional features have unique IDs and supported destinations", () => {
  let s = setup();
  assert.equal(universeFeatures.length, 72);
  assert.equal(new Set(universeFeatures.map((f) => f.id)).size, 72);
  for (const f of universeFeatures) assert.ok(s.app.supports(f.view), f.title);
});
test("opening records one login without awarding unclaimed currency", () => {
  let s = setup();
  assert.equal(s.state.universe.visits.length, 1);
  assert.equal(s.state.universe.coins, 40);
  setup(s.state);
  assert.equal(s.state.universe.visits.length, 1);
  assert.equal(s.state.universe.coins, 40);
});
test("daily login reward and season reward cannot be claimed twice", () => {
  let s = setup();
  s.click("u-login");
  assert.equal(s.state.universe.coins, 50);
  s.click("u-login");
  assert.equal(s.state.universe.coins, 50);
  s.state.xp = 100;
  s.click("u-season", { index: "0" });
  assert.equal(s.state.universe.coins, 65);
  s.click("u-season", { index: "0" });
  assert.equal(s.state.universe.coins, 65);
});
test("insufficient funds preserve inventory; owned skin does not charge again", () => {
  let s = setup();
  s.click("u-skin", { id: "sage" });
  assert.equal(s.state.universe.coins, 40);
  assert.deepEqual(s.state.universe.owned, ["surface"]);
  s.state.universe.coins = 50;
  s.click("u-skin", { id: "sage" });
  assert.equal(s.state.universe.coins, 5);
  assert.ok(s.state.universe.owned.includes("sage"));
  assert.equal(s.state.settings.accent, "#c5dca7");
  s.click("u-skin", { id: "sage" });
  assert.equal(s.state.universe.coins, 5);
});
test("quest rewards are tied to progress and claimed once", () => {
  let s = setup();
  s.click("u-quest", { id: "explore" });
  assert.equal(s.state.universe.coins, 40);
  s.state.used = Array.from({ length: 10 }, (_, i) => "t" + i);
  s.click("u-quest", { id: "explore" });
  assert.equal(s.state.universe.coins, 65);
  s.click("u-quest", { id: "explore" });
  assert.equal(s.state.universe.coins, 65);
});
test("calculation rewards stop after 50 per day; affinity and progress continue", () => {
  let s = setup();
  for (let i = 0; i < 70; i++) s.app.recordCalculation(i);
  assert.equal(s.state.universe.coins, 90);
  assert.equal(s.state.universe.affinity.sigma, 70);
  let today = new Date().toLocaleDateString("sv-SE");
  assert.equal(s.state.universe.daily[today].calculations, 70);
});
test("backup validation rejects malformed material and interpolated numerical state", () => {
  let s = setup();
  assert.ok(validateUniverse(s.state.universe));
  let bad = structuredClone(s.state.universe);
  bad.coins = "<script>";
  assert.equal(validateUniverse(bad), false);
  bad = structuredClone(s.state.universe);
  bad.font = "bad-value";
  assert.equal(validateUniverse(bad), false);
  bad = structuredClone(s.state.universe);
  bad.novel.chapter = 100;
  assert.equal(validateUniverse(bad), false);
});

test("all event and action modes have supported destinations", () => {
  let s = setup();
  assert.equal(eventFeatures.length, 54);
  for (let f of eventFeatures) assert.ok(s.app.supports(f.view), f.title);
  assert.ok(validateRpg(s.state.universe.rpg));
});
test("equipment changes RPG stats and piercing ignores defense", () => {
  let r = { xp: 0, weapon: 1, equipped: [] },
    base = deriveStats(r, "sigma");
  r.equipped = ["bracket", "root"];
  let gear = deriveStats(r, "sigma");
  assert.equal(gear.hp, base.hp + 15);
  assert.equal(gear.atk, base.atk + 4);
  assert.equal(gear.def, base.def + 3);
  assert.equal(combatDamage(20, 8, 1, false), 12);
  assert.equal(combatDamage(20, 8, 1, true), 20);
  assert.equal(combatDamage(1, 100), 1);
});
test("successful RPG action consumes energy, damages enemy, and activates cooldown", () => {
  let s = setup();
  s.click("e-pve");
  let b = s.state.universe.rpg.battle,
    start = b.enemyHp;
  s.click("e-move", { op: "×" });
  let answer = b.question.answer;
  s.submit("e-battle-form", { answer });
  assert.ok(b.enemyHp < start);
  assert.equal(b.energy, 1);
  assert.equal(b.cooldown, 2);
  assert.equal(b.turn, 2);
});
test("event stage first-clear rewards are not repeated", () => {
  let s = setup();
  function clear() {
    s.click("e-stage", { id: "festival-0" });
    let loops = 0;
    while (s.state.universe.rpg.battle && loops++ < 50) {
      let b = s.state.universe.rpg.battle;
      s.click("e-move", { op: b.energy >= 2 ? "÷" : "+" });
      s.submit("e-battle-form", { answer: b.question.answer });
    }
    assert.ok(loops < 50);
  }
  clear();
  assert.equal(s.state.universe.rpg.tokens, 25);
  assert.ok(s.state.universe.rpg.firstClear.includes("festival-0"));
  clear();
  assert.equal(s.state.universe.rpg.tokens, 25);
});
test("battle pass free and expanded rewards can only be claimed once", () => {
  let s = setup(),
    r = s.state.universe.rpg;
  r.passes.arena = 100;
  s.click("e-pass-claim", { id: "arena", tier: "0", track: "free" });
  assert.equal(s.state.universe.coins, 50);
  s.click("e-pass-claim", { id: "arena", tier: "0", track: "free" });
  assert.equal(s.state.universe.coins, 50);
  s.click("e-pass-claim", { id: "arena", tier: "0", track: "premium" });
  assert.equal(r.tokens, 0);
  s.state.universe.coins = 200;
  s.click("e-premium", { id: "arena" });
  assert.equal(s.state.universe.coins, 80);
  s.click("e-pass-claim", { id: "arena", tier: "0", track: "premium" });
  assert.equal(r.tokens, 8);
  s.click("e-pass-claim", { id: "arena", tier: "0", track: "premium" });
  assert.equal(r.tokens, 8);
});
