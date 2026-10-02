import test from "node:test";
import assert from "node:assert/strict";

import { allItems, modes, sqlChallenges } from "./data.js";
import { evaluateSql, normalizeSql } from "./sql.js";
import { getStats, loadProgress, priorityFor, recordAttempt, saveProgress } from "./progress.js";

test("database trainer ships the required amount of structured content", () => {
  const counts = Object.fromEntries(modes.map((mode) => [mode.id, mode.items.length]));
  assert.ok(counts.cards >= 15);
  assert.ok(counts.quiz >= 15);
  assert.ok(counts.sql >= 10);
  assert.ok(counts.schema >= 5);
  assert.ok(counts.concept >= 10);
  assert.equal(new Set(allItems.map((item) => item.id)).size, allItems.length);
});

test("SQL evaluation tolerates formatting but rejects incomplete solutions", () => {
  const challenge = sqlChallenges[0];
  assert.equal(evaluateSql(challenge, "  SELECT   * FROM customers\nWHERE city = 'Berlin';  "), true);
  assert.equal(evaluateSql(challenge, "SELECT * FROM customers"), false);
  assert.equal(normalizeSql("SELECT * -- comment\nFROM tasks;"), "SELECT * FROM tasks");
});

test("progress persists attempts and prioritizes weak answers", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const item = allItems[0];
  const wrong = recordAttempt({ attempts: {} }, item, "wrong");
  const correct = recordAttempt({ attempts: {} }, item, "correct");
  assert.ok(priorityFor(item, wrong) > priorityFor(item, correct));
  saveProgress(wrong, storage);
  assert.deepEqual(loadProgress(storage), wrong);
  assert.equal(getStats([item], wrong).answered, 1);
  assert.equal(getStats([item], wrong).automaticCorrect, 0);
  assert.equal(getStats([item], wrong).unclassified, 1);
});

test("activity distinguishes self-ratings, checked answers and solution help", () => {
  const [self, checked, assisted, legacy] = allItems;
  let progress = recordAttempt({ attempts: {} }, self, "correct", { assessment: "self" });
  progress = recordAttempt(progress, checked, "correct", { assessment: "automatic" });
  progress = recordAttempt(progress, assisted, "correct", { assessment: "automatic", helpUsed: true });
  progress = recordAttempt(progress, legacy, "correct");
  assert.deepEqual(getStats([self, checked, assisted, legacy], progress), {
    answered: 4, automaticCorrect: 1, selfRated: 1, assisted: 1, unclassified: 1,
  });
  assert.deepEqual(getStats([self], progress), {
    answered: 1, automaticCorrect: 0, selfRated: 1, assisted: 0, unclassified: 0,
  });
  progress = recordAttempt(progress, checked, "wrong", { assessment: "automatic" });
  assert.equal(getStats([checked], progress).automaticCorrect, 0);
});

test("storage failure is reported instead of acknowledging persistence", () => {
  assert.equal(saveProgress({ attempts: {} }, { setItem() { throw new Error("full"); } }), false);
});
