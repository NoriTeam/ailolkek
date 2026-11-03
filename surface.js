import { MaterialRenderer } from "./vendor/aori/MaterialRenderer.js";
import {
  body,
  world,
  defaultTokens,
  press,
  setMaterialState,
} from "./vendor/aori/material-core.js";

export function createSurface() {
  const canvas = document.createElement("canvas");
  canvas.className = "aori-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  let currentHover = null,
    regMap = new WeakMap(),
    renderer,
    registrations = [],
    rootObserver,
    layoutFrame = 0,
    settingsKey = "",
    timers = new Set();
  try {
    renderer = new MaterialRenderer(canvas);
    renderer.setQuality(innerWidth * innerHeight > 1600000 ? "low" : "medium");
    document.documentElement.dataset.material = "webgl2";
    canvas.addEventListener("material:fallback", () => {
      document.documentElement.dataset.material = "fallback";
      canvas.style.display = "none";
    });
  } catch {
    canvas.remove();
    document.documentElement.dataset.material = "fallback";
    return { mount() {}, react() {}, refresh() {} };
  }
  function later(fn, ms) {
    let t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  }
  function clear() {
    for (let r of registrations) {
      r.remove();
      r.observer.disconnect();
      r.element.removeAttribute("data-aori-ready");
      r.stage.remove();
      r.blur?.remove();
    }
    registrations = [];
    timers.forEach(clearTimeout);
    timers.clear();
  }
  function mount() {
    clear();
    let root = document.querySelector("#app");
    if (!root) return;
    for (let keypad of root.querySelectorAll(".keypad")) {
      if (keypad.querySelector(".aori-key-row")) continue;
      let keys = [...keypad.children];
      for (let i = 0; i < keys.length; i += 4) {
        let row = document.createElement("div");
        row.className = "aori-key-row";
        keys.slice(i, i + 4).forEach((k) => row.append(k));
        keypad.append(row);
      }
    }
    const all = [
      ...root.querySelectorAll(".surface"),
      ...root.querySelectorAll(".aori-key-row"),
    ];
    for (let element of all) {
      if (element.closest(".action-game-shell")) continue;
      let isKeys = element.classList.contains("aori-key-row"),
        stageElement = document.createElement("span");
      stageElement.className = "aori-stage";
      stageElement.setAttribute("aria-hidden", "true");
      element.prepend(stageElement);
      let blur = null;
      if (!isKeys) {
        blur = document.createElement("div");
        blur.className = "aori-blur";
        blur.setAttribute("aria-hidden", "true");
        element.prepend(blur);
      }
      let w = world([]),
        tokens = {
          ...defaultTokens,
          light: 0.25,
          edge: 0.055,
          roughness: 0.88,
        },
        stage = {
          element: stageElement,
          world: w,
          width: 1,
          height: 1,
          tokens,
          light: false,
          visible: true,
          rect: null,
        };
      let reg = {
        element,
        stage: stageElement,
        blur,
        world: w,
        materialStage: stage,
        isKeys,
        remove: null,
        observer: null,
      };
      const measure = () => {
        if (!element.isConnected) return;
        let r = stageElement.getBoundingClientRect(),
          accent =
            getComputedStyle(document.documentElement)
              .getPropertyValue("--accent")
              .trim() || "#a37ff2";
        stage.width = r.width;
        stage.height = r.height;
        stage.light = document.documentElement.dataset.theme === "paper";
        tokens.transmission = Math.max(
          0.15,
          Math.min(
            0.9,
            Number(
              getComputedStyle(document.documentElement).getPropertyValue(
                "--glass",
              ),
            ) || 0.65,
          ),
        );
        const nodes = isKeys
          ? [...element.querySelectorAll(".key")]
          : [element];
        w.bodies = nodes.map((node, i) => {
          let k = node.getBoundingClientRect(),
            css = getComputedStyle(node),
            color = isKeys
              ? node.classList.contains("equals")
                ? "#67537d"
                : node.classList.contains("operator")
                  ? "#423651"
                  : "#34303e"
              : "#282430";
          let b = body(
            "aori-" + i,
            k.left - r.left + k.width / 2,
            k.top - r.top + k.height / 2,
            Math.max(1, k.width - 2),
            Math.max(1, k.height - 2),
            color,
            parseFloat(css.borderTopLeftRadius) || 20,
          );
          if (isKeys && node.classList.contains("equals")) b.opacity = 1;
          return b;
        });
        w.lights = [];
        w.backings = [];
        renderer.measure();
      };
      reg.remove = renderer.add(stage);
      reg.observer = new ResizeObserver(measure);
      reg.observer.observe(element);
      registrations.push(reg);
      measure();
      element.dataset.aoriReady = "true";
      regMap.set(element, reg);
      for (let child of element.children) {
        if (child === stageElement || child === blur) continue;
        if (getComputedStyle(child).position === "static")
          child.classList.add("aori-content");
      }
      for (let node of [...element.childNodes]) {
        if (node.nodeType === 3 && node.textContent.trim()) {
          let span = document.createElement("span");
          span.className = "aori-content";
          span.textContent = node.textContent;
          node.replaceWith(span);
        }
      }
      if (isKeys)
        for (let key of element.querySelectorAll(".key"))
          key.dataset.aoriReady = "true";
    }
    renderer.stages = new Set(
      [...renderer.stages].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      ),
    );
    renderer.measure();
  }
  function findReg(target) {
    let el = target.closest(".aori-key-row,.surface");
    return regMap.get(el);
  }
  function point(reg, e) {
    let r = reg.stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  document.addEventListener(
    "pointermove",
    (e) => {
      let reg = findReg(e.target);
      if (currentHover && currentHover !== reg)
        currentHover.world.hoverTarget = 0;
      currentHover = reg;
      if (reg) {
        reg.world.pointer = point(reg, e);
        reg.world.hoverTarget = 1;
        renderer.wake();
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      let reg = findReg(e.target);
      if (!reg) return;
      press(reg.world, point(reg, e));
      renderer.wake();
      let key = e.target.closest(".key");
      if (
        key &&
        document.documentElement.dataset.motion !== "off" &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        key.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(.955)", offset: 0.3 },
            { transform: "scale(1)" },
          ],
          { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerout",
    (e) => {
      if (!e.relatedTarget) {
        for (let r of registrations) r.world.hoverTarget = 0;
        renderer.wake();
      }
    },
    { passive: true },
  );
  document.addEventListener("scroll", () => renderer.measure(), {
    capture: true,
    passive: true,
  });
  document
    .querySelector("#modal")
    ?.addEventListener("close", () => renderer.measure());
  function react(state = "success", selector = ".calculator") {
    let selected = registrations.filter((r) => r.element.matches(selector));
    for (let r of selected) {
      setMaterialState(r.world, state, true);
      r.world.loading.running = state === "loading";
      r.materialStage.loading = state === "loading";
    }
    renderer.wake();
    if (state !== "loading")
      later(() => {
        for (let r of selected) setMaterialState(r.world, "idle");
        renderer.wake();
      }, 1050);
  }
  rootObserver = new MutationObserver((records) => {
    if (
      !records.some(
        (r) =>
          r.type === "childList" &&
          [...r.addedNodes].some(
            (n) =>
              n.nodeType === 1 &&
              !(
                n.classList?.contains("aori-stage") ||
                n.classList?.contains("aori-blur")
              ),
          ),
      )
    )
      return;
    if (layoutFrame) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0;
      mount();
    });
  });
  // Only full page replacements trigger a rebind; calculator text and counters do not.
  rootObserver.observe(document.querySelector("#app"), { childList: true });
  function refresh() {
    let key =
      document.documentElement.dataset.theme +
      getComputedStyle(document.documentElement).getPropertyValue("--accent") +
      getComputedStyle(document.documentElement).getPropertyValue("--glass");
    if (key === settingsKey) return;
    settingsKey = key;
    mount();
  }
  mount();
  return { mount, react, refresh, renderer, stats: () => renderer.stats?.() };
}
