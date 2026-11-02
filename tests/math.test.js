import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, factorial, gcd, stats } from "../math.js";
import { tools, conversions, appFeatures } from "../catalog.js";
const near = (a, b, epsilon = 1e-8) =>
  assert.ok(Math.abs(a - b) < epsilon, `${a} ≠ ${b}`);
test("operator precedence, signed exponents, parentheses and constants", () => {
  assert.equal(evaluate("2+3*4"), 14);
  assert.equal(evaluate("(2+3)*4"), 20);
  assert.equal(evaluate("2^3^2"), 512);
  assert.equal(evaluate("-2^2"), -4);
  assert.equal(evaluate("2^-2"), 0.25);
  near(evaluate("π*2"), Math.PI * 2);
  assert.equal(evaluate("5!"), 120);
  assert.equal(evaluate("200×10%"), 20);
  near(evaluate("0,1+0,2"), 0.3);
});
test("angle modes, memory, ANS and variable substitution", () => {
  near(evaluate("sin(30)"), 0.5);
  near(evaluate("cos(pi)", { angle: "RAD" }), -1);
  near(evaluate("asin(0.5)"), 30);
  assert.equal(evaluate("ans+mem+x", { ans: 4, memory: 5, x: 6 }), 15);
  near(evaluate("sinh(0)"), 0);
  assert.equal(evaluate("sqrt(9)+cbrt(27)"), 6);
});
test("invalid expressions and nonfinite results fail without executing code", () => {
  for (let v of [
    "1/0",
    "sqrt(-1)",
    "2+",
    "sin(30",
    "alert(1)",
    "globalThis",
    "1;2",
    "2**4",
    "Infinity",
    "factorial(4)",
    "(-1)!",
    "171!",
    "tan(90)",
    "2(3)",
  ])
    assert.throws(() => evaluate(v), undefined, v);
  assert.throws(() => evaluate("1+".repeat(300) + "1"));
});
test("number theory and statistics boundaries", () => {
  assert.equal(factorial(0), 1);
  assert.equal(gcd(48, 18), 6);
  assert.equal(gcd(0, 5), 5);
  let s = stats([2, 4, 6, 8]);
  assert.equal(s.mean, 5);
  assert.equal(s.median, 5);
  assert.equal(s.variance, 5);
  assert.equal(s.range, 6);
});
test("every registered calculator has a valid default calculation", () => {
  assert.ok(tools.length > 100);
  assert.equal(new Set(tools.map((t) => t.id)).size, tools.length);
  for (let t of tools) {
    assert.ok(!t.rule || t.rule(t.defaults), t.title + " defaults rejected");
    let r = t.run(t.defaults);
    assert.ok(
      typeof r === "string" || Number.isFinite(r),
      t.title + " invalid result",
    );
    if (t.category !== "Статистика")
      assert.equal(t.labels.length, t.defaults.length, t.title);
  }
});
test("financial formulas use zero-rate branch and compound discount correctly", () => {
  const find = (t) => tools.find((v) => v.title === t);
  assert.equal(find("Кредитный платёж").run([12000, 0, 12]), 1000);
  assert.equal(find("Переплата по кредиту").run([12000, 0, 12]), 0);
  assert.equal(find("Две скидки подряд").run([2000, 20, 10]), 1440);
  near(find("Сложный процент").run([100000, 12, 3]), 140492.8);
  assert.equal(find("Квадратное уравнение").run([0, 2, -4]), 2);
});
test("all unit conversions roundtrip, including temperature offsets", () => {
  assert.equal(conversions.length, 34);
  for (let c of conversions)
    for (let v of [0, 1, 25, 1000]) near(c.reverse(c.convert(v)), v);
  let t = conversions.find((c) => c.to === "°F");
  assert.equal(t.convert(0), 32);
  assert.equal(t.reverse(212), 100);
});
test("feature index has unique identifiers and real application destinations", () => {
  let views = [
    "calc",
    "history",
    "profile",
    "community",
    "learn",
    "games",
    "lab",
    "settings",
    "tools",
    "home",
  ];
  assert.equal(new Set(appFeatures.map((f) => f.id)).size, appFeatures.length);
  for (let f of appFeatures) assert.ok(views.includes(f.view));
  assert.equal(tools.length + conversions.length + appFeatures.length, 205);
});
