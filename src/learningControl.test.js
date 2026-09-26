import test from "node:test";
import assert from "node:assert/strict";

import { createLearningControl, LEARNING_CONTROL_KEY, LEGACY_MATH_BACKUP_KEY, LEGACY_MATH_KEY, planNextAction } from "./learningControl.js";
import { getSemesterLearningProgram } from "./learningProgram.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

const at = (value) => Date.parse(value);

test("starts with the Monday mathematics diagnostic and persists the active session", () => {
  const storage = memoryStorage();
  const control = createLearningControl({
    storage,
    program: getSemesterLearningProgram(),
    clock: () => at("2026-09-28T05:30:00+02:00"),
  });

  assert.equal(control.getSnapshot().action.trainerSlug, "diagnose-mathe-3");
  const started = control.startNow();
  assert.equal(started.path, "/trainer/diagnose-mathe-3");
  assert.equal(JSON.parse(storage.getItem(LEARNING_CONTROL_KEY)).activeSession.id, started.sessionId);
});

test("prioritizes a due review, limits it to ten minutes, then continues with the next diagnostic", () => {
  let now = at("2026-09-28T05:30:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program: getSemesterLearningProgram(), clock: () => now });
  const first = control.startNow();
  now += 20 * 60000;
  control.complete({ sessionId: first.sessionId, result: { outcome: "correct", verified: true, firstAttempt: true, helpUsed: false, durationMinutes: 20, score: 80 } });

  now = at("2026-09-29T05:30:00+02:00");
  assert.equal(control.getSnapshot().action.kind, "review");
  assert.equal(control.getSnapshot().action.minutes, 10);
  const review = control.startNow();
  now += 10 * 60000;
  control.complete({ sessionId: review.sessionId, result: { outcome: "correct", verified: true, firstAttempt: true, helpUsed: false, durationMinutes: 10, score: 100 } });
  assert.equal(control.getSnapshot().action.trainerSlug, "diagnose-netztechnik");
});

test("never selects relevance C as mandatory work", () => {
  const program = getSemesterLearningProgram();
  program.targets = [{
    id: "optional", examId: "mathe", trainerSlug: "optional", kind: "focus", relevance: "C",
    availableFrom: "2026-09-28", minutes: 60, source: "Alt", reason: "Optional",
  }];
  const planned = planNextAction({ version: 1, activeSession: null, sessions: [], due: {}, evidence: {}, failures: {}, diagnosticScores: {} }, program, at("2026-09-28T05:30:00+02:00"));
  assert.equal(planned.action, null);
});

test("requires cold verified successes on separate days for separate evidence", () => {
  let now = at("2026-09-28T05:30:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program: getSemesterLearningProgram(), clock: () => now });
  let run = control.startNow();
  control.complete({ sessionId: run.sessionId, result: { outcome: "correct", verified: true, firstAttempt: true, helpUsed: false, durationMinutes: 20, score: 80 } });

  now = at("2026-09-29T05:30:00+02:00");
  run = control.startNow();
  const completed = control.complete({ sessionId: run.sessionId, result: { outcome: "correct", verified: true, firstAttempt: true, helpUsed: false, durationMinutes: 10, score: 100 } });
  assert.equal(completed.evidence, 2);
});

test("backs up but does not remove the existing mathematics state", () => {
  const legacy = JSON.stringify({ version: 1, sessions: { task: [{ checks: 1 }] }, due: { family: { at: 1 } } });
  const storage = memoryStorage({ [LEGACY_MATH_KEY]: legacy });
  const control = createLearningControl({ storage, program: getSemesterLearningProgram(), clock: () => at("2026-09-28T05:30:00+02:00") });

  assert.equal(storage.getItem(LEGACY_MATH_KEY), legacy);
  assert.equal(storage.getItem(LEGACY_MATH_BACKUP_KEY), legacy);
  assert.deepEqual(control.getSnapshot().legacyMath, { importedAt: at("2026-09-28T05:30:00+02:00"), sessionCount: 1, dueCount: 1 });
});
