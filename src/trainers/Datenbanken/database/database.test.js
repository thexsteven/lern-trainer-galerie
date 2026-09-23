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
  assert.equal(getStats([item], wrong).percent, 100);
  assert.equal(getStats([item], wrong).knowledgePercent, 0);
});
