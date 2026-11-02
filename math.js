// Recursive-descent expression parser. No eval, Function or executable user input.
export function factorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 170)
    throw Error("Факториал: целое число от 0 до 170");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}
export function evaluate(
  input,
  { angle = "DEG", ans = 0, memory = 0, x = 0 } = {},
) {
  const source = String(input)
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll(",", ".")
    .replaceAll("π", "pi")
    .replace(/\s/g, "");
  const tokens =
    source.match(
      /(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?|[a-zA-Z]+|[()+\-*/^%!]/g,
    ) || [];
  if (tokens.join("") !== source) throw Error("Недопустимый символ");
  if (tokens.length > 500) throw Error("Слишком длинное выражение");
  let p = 0;
  const peek = () => tokens[p],
    take = () => tokens[p++],
    angleIn = (v) => (angle === "DEG" ? (v * Math.PI) / 180 : v),
    angleOut = (v) => (angle === "DEG" ? (v * 180) / Math.PI : v);
  const funcs = {
    sin: (v) => Math.sin(angleIn(v)),
    cos: (v) => Math.cos(angleIn(v)),
    tan: (v) => {
      if (Math.abs(Math.cos(angleIn(v))) < 1e-14)
        throw Error("Тангенс не определён");
      return Math.tan(angleIn(v));
    },
    asin: (v) => angleOut(Math.asin(v)),
    acos: (v) => angleOut(Math.acos(v)),
    atan: (v) => angleOut(Math.atan(v)),
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    ln: Math.log,
    log: Math.log10,
    abs: Math.abs,
    exp: Math.exp,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
  };
  function primary() {
    let t = take(),
      v;
    if (t === "(") {
      v = expression();
      if (take() !== ")") throw Error("Закройте скобку");
    } else if (t in funcs) {
      if (take() !== "(") throw Error("После функции нужна скобка");
      v = funcs[t](expression());
      if (take() !== ")") throw Error("Закройте скобку");
    } else if (t === "pi") v = Math.PI;
    else if (t === "e") v = Math.E;
    else if (t === "ans") v = ans;
    else if (t === "mem") v = memory;
    else if (t === "x") v = x;
    else if (t && /^(?:\d|\.)/.test(t)) v = Number(t);
    else throw Error("Введите число или формулу");
    while (peek() === "!" || peek() === "%") {
      v = take() === "!" ? factorial(v) : v / 100;
    }
    return v;
  }
  function power() {
    let v = primary();
    if (peek() === "^") {
      take();
      v = v ** unary();
    }
    return v;
  }
  function unary() {
    if (peek() === "+") {
      take();
      return unary();
    }
    if (peek() === "-") {
      take();
      return -unary();
    }
    return power();
  }
  function term() {
    let v = unary();
    while (peek() === "*" || peek() === "/") {
      let op = take(),
        b = unary();
      if (op === "/" && b === 0) throw Error("Деление на ноль не определено");
      v = op === "*" ? v * b : v / b;
    }
    return v;
  }
  function expression() {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      let op = take(),
        b = term();
      v = op === "+" ? v + b : v - b;
    }
    return v;
  }
  const result = expression();
  if (p < tokens.length) throw Error("Проверьте операторы и скобки");
  if (!Number.isFinite(result))
    throw Error("Результат вне области действительных чисел");
  return Object.is(result, -0) ? 0 : result;
}
export function format(n, digits = 8, group = true) {
  return typeof n === "number"
    ? new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: digits,
        useGrouping: group,
      }).format(n)
    : String(n);
}
export function stats(values) {
  let a = values.slice().sort((a, b) => a - b),
    sum = a.reduce((s, v) => s + v, 0),
    mean = sum / a.length,
    variance = a.reduce((s, v) => s + (v - mean) ** 2, 0) / a.length;
  return {
    sum,
    mean,
    median:
      a.length % 2
        ? a[(a.length - 1) / 2]
        : (a[a.length / 2 - 1] + a[a.length / 2]) / 2,
    min: a[0],
    max: a.at(-1),
    variance,
    sd: Math.sqrt(variance),
    range: a.at(-1) - a[0],
    count: a.length,
    rms: Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length),
  };
}
