import test from "node:test";
import assert from "node:assert/strict";
import {
  body,
  world,
  press,
  stepWorld,
  setMaterialState,
} from "../vendor/aori/material-core.js";
import { speechToExpression } from "../enhancements.js";
import { evaluate } from "../math.js";

test("material wakes on press and returns to rest after the reaction", () => {
  const w = world([body("key", 50, 50, 80, 80)]);
  for (let i = 0; i < 400; i++) stepWorld(w, 0.005);
  assert.equal(stepWorld(w, 0.005), false);
  press(w, { x: 50, y: 50 });
  assert.equal(stepWorld(w, 0.005), true);
  for (let i = 0; i < 500; i++) stepWorld(w, 0.005);
  assert.equal(stepWorld(w, 0.005), false);
  setMaterialState(w, "success", true);
  assert.equal(stepWorld(w, 0.005), true);
  for (let i = 0; i < 500; i++) stepWorld(w, 0.005);
  assert.equal(stepWorld(w, 0.005), false);
});
test("voice parser accepts English compound numbers and decimal arithmetic", () => {
  assert.equal(evaluate(speechToExpression("twenty-five times four")), 100);
  assert.equal(
    evaluate(speechToExpression("one hundred and twenty plus three")),
    123,
  );
  assert.equal(evaluate(speechToExpression("one point five plus two")), 3.5);
});
