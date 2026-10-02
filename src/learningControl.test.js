import test from "node:test";
import assert from "node:assert/strict";

import { createLearningControl, LEARNING_CONTROL_KEY, LEGACY_MATH_BACKUP_KEY, LEGACY_MATH_KEY, planNextAction } from "./learningControl.js";
import { getSemesterLearningProgram } from "./learningProgram.js";
import { checkFsaAnswer, makeFsaTask, wordPath } from "./fsaPractice.js";

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

test("completed diagnostics do not generate reviews and the next diagnostic remains scheduled", () => {
  let now = at("2026-09-28T05:30:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program: getSemesterLearningProgram(), clock: () => now });
  const first = control.startNow();
  now += 20 * 60000;
  control.complete({ sessionId: first.sessionId, result: { outcome: "correct", verified: true, firstAttempt: true, helpUsed: false, durationMinutes: 20, score: 80 } });

  now = at("2026-09-29T05:30:00+02:00");
  assert.equal(control.getSnapshot().dueReviews.length, 0);
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

test("backs up but does not remove the existing mathematics state", () => {
  const legacy = JSON.stringify({ version: 1, sessions: { task: [{ checks: 1 }] }, due: { family: { at: 1 } } });
  const storage = memoryStorage({ [LEGACY_MATH_KEY]: legacy });
  const control = createLearningControl({ storage, program: getSemesterLearningProgram(), clock: () => at("2026-09-28T05:30:00+02:00") });

  assert.equal(storage.getItem(LEGACY_MATH_KEY), legacy);
  assert.equal(storage.getItem(LEGACY_MATH_BACKUP_KEY), legacy);
  assert.deepEqual(control.getSnapshot().legacyMath, { importedAt: at("2026-09-28T05:30:00+02:00"), sessionCount: 1, dueCount: 1 });
});

test("DEA checks complete paths including epsilon against the independent exactly-one-b criterion", () => {
  for (let index = 1; index <= 511; index += 1) {
    const word = index.toString(2).slice(1).replaceAll("0", "a").replaceAll("1", "b");
    const task = makeFsaTask("dfa", word, 0);
    const accepted = [...word].filter((symbol) => symbol === "b").length === 1;
    assert.equal(task.accepted, accepted);
    assert.equal(wordPath(word).length, word.length + 1);
    assert.equal(checkFsaAnswer(task, wordPath(word).join(" "), String(accepted)), true);
    assert.equal(checkFsaAnswer(task, "0 99", String(accepted)), false);
    assert.equal(checkFsaAnswer(task, task.answer, String(!accepted)), false);
  }
  assert.equal(checkFsaAnswer(makeFsaTask("basics", "", 0), "0"), true);
});

function round(ids = ["a", "b"]) {
  return { tasks: ids.map((id) => ({ id })), results: [], answers: {} };
}

function results(ids = ["a", "b"]) {
  return ids.map((id) => ({ id, correct: true, firstAttempt: true, helpUsed: false }));
}

function setup(program = getSemesterLearningProgram(), storage = memoryStorage()) {
  const clock = () => at("2026-10-02T10:00:00+02:00");
  return { control: createLearningControl({ storage, program, clock }), storage, program, clock };
}

function finish(control, targetId = "fsa-wortlauf", mode = "assessment", taskResults = results()) {
  const started = control.startTarget(targetId, mode, round());
  control.updateRound(started.sessionId, { ...round(), results: taskResults, finished: true });
  return { ...control.complete({ sessionId: started.sessionId, result: {} }), sessionId: started.sessionId };
}

test("two complete same-day same-variant rounds finish an unit permanently; duplicate saves do not count", () => {
  const { control, storage, program, clock } = setup();
  assert.equal(finish(control).evidence, 1);
  const second = finish(control);
  assert.equal(second.evidence, 2);
  assert.equal(control.complete({ sessionId: second.sessionId, result: {} }).duplicate, true);
  finish(control, "fsa-wortlauf", "assessment", [{ ...results()[0], correct: false }, results()[1]]);
  const restored = createLearningControl({ storage, program, clock });
  const progress = restored.getSnapshot().unitProgress.find((unit) => unit.id === "fsa-wortlauf");
  assert.equal(progress.cleanRuns, 2);
  assert.equal(progress.completedRuns, 3);
  assert.equal(progress.attempts, 3);
  assert.equal(progress.completed, true);
  assert.equal(progress.progressPercent, 100);
  assert.equal(restored.getSnapshot().sessions.length, 3);
});

test("drafts pause separately per target and resume all input without counting an empty attempt", () => {
  const { control, storage, program, clock } = setup();
  const first = control.startTarget("fsa-wortlauf", "assessment", round());
  control.updateRound(first.sessionId, { ...round(), answers: { a: "unfinished answer" }, custom: { explanation: "draft" } });
  assert.equal(control.getSnapshot().unitProgress.find((unit) => unit.id === "fsa-wortlauf").attempts, 0);
  const second = control.startTarget("netz-osi", "assessment", round(["net-1"]));
  assert.notEqual(first.sessionId, second.sessionId);
  assert.equal(second.path, "/trainer/netztechnik-lernreise");
  const restored = createLearningControl({ storage, program, clock });
  assert.equal(restored.startTarget("fsa-wortlauf").sessionId, first.sessionId);
  assert.deepEqual(restored.getSnapshot().activeSession.round.answers, { a: "unfinished answer" });
  assert.deepEqual(restored.getSnapshot().activeSession.round.custom, { explanation: "draft" });
  assert.equal(restored.getSnapshot().pausedSessions["netz-osi"].id, second.sessionId);
});

test("hint hiding, corrected errors, and replaced drafts cannot recover clean evidence", () => {
  for (const contamination of [{ helpUsed: true }, { feedback: { correct: false }, attempts: 1 }, { results: [{ id: "a", correct: false, firstAttempt: false }] }]) {
    const { control } = setup();
    const started = control.startTarget("fsa-grundlagen", "assessment", round());
    control.updateRound(started.sessionId, { ...round(), ...contamination });
    control.updateRound(started.sessionId, { ...round(), helpUsed: false, results: results(), finished: true });
    assert.equal(control.complete({ sessionId: started.sessionId, result: {} }).evidence, 0);
    assert.equal(control.getSnapshot().sessions[0].completed, true);
  }
});

test("required task identities define completeness, never a fixed count or repeated answers", () => {
  const { control } = setup();
  const input = { targetId: "netz-osi", roundId: "external-1", requiredTaskIds: ["a", "b", "c"], taskResults: results(["a", "b", "b"]) };
  assert.equal(control.recordResult(input).evidence, 0);
  assert.equal(control.getSnapshot().sessions[0].completed, false);
  assert.equal(control.recordResult({ ...input, roundId: "external-2", taskResults: results(["a", "b", "c"]) }).evidence, 1);
  assert.equal(control.recordResult({ ...input, roundId: "external-2", taskResults: results(["a", "b", "c"]) }).duplicate, true);
  assert.equal(control.getSnapshot().sessions.length, 2);
});

test("learning, review, errors and self-assessment are history but never automatic clean runs", () => {
  const { control } = setup();
  for (const mode of ["learning", "review", "errors"]) {
    assert.equal(finish(control, "fsa-wortlauf", mode).evidence, 0);
  }
  assert.equal(control.recordResult({ targetId: "fsa-wortlauf", roundId: "self", tasks: round().tasks, taskResults: results(), verification: "self" }).evidence, 0);
  assert.equal(control.getSnapshot().sessions.length, 4);
  assert.equal(control.getSnapshot().sessions.at(-1).verification, "self");
});

test("an aborted started attempt stays in history; opening a draft does not count an attempt", () => {
  const { control } = setup();
  let started = control.startTarget("fsa-wortlauf", "assessment", round());
  control.complete({ sessionId: started.sessionId, result: { outcome: "aborted" } });
  started = control.startTarget("fsa-wortlauf", "assessment", round());
  control.updateRound(started.sessionId, { ...round(), attempts: 1, feedback: { correct: false } });
  control.complete({ sessionId: started.sessionId, result: { outcome: "aborted" } });
  const progress = control.getSnapshot().unitProgress.find((unit) => unit.id === "fsa-wortlauf");
  assert.equal(progress.attempts, 1);
  assert.equal(progress.completedRuns, 0);
  assert.equal(progress.cleanRuns, 0);
});

test("previous required tasks cannot be silently replaced midway through a round", () => {
  const { control } = setup();
  const started = control.startTarget("fsa-wortlauf", "assessment", round());
  control.updateRound(started.sessionId, { tasks: [{ id: "a" }], results: results(["a"]) });
  assert.equal(control.complete({ sessionId: started.sessionId, result: {} }).evidence, 0);
  assert.deepEqual(control.getSnapshot().sessions[0].requiredTaskIds, ["a", "b"]);
});

test("all five exams have real units and a fair fixed 420 minute budget; Web has no invented date", () => {
  const program = getSemesterLearningProgram();
  assert.equal(program.exams.length, 5);
  assert.equal(program.exams.reduce((total, exam) => total + exam.weeklyMinutes, 0), 420);
  assert.equal(program.reserveWeeklyMinutes, 60);
  assert.equal(program.exams.find((exam) => exam.id === "web").date, null);
  assert.ok(program.exams.every((exam) => program.targets.some((target) => target.examId === exam.id && target.kind === "focus" && target.title)));
  const onlyWeb = { ...program, targets: program.targets.filter((target) => target.examId === "web") };
  assert.equal(setup(onlyWeb).control.getSnapshot().action.targetId, "web-request-response");
});

test("legacy evidence days remain available without being counted as verified rounds", () => {
  const legacy = { version: 1, sessions: [{ id: "legacy", targetId: "fsa-wortlauf", completedAt: at("2026-10-01T10:00:00+02:00"), durationMinutes: 10 }], due: {}, evidence: { "fsa-wortlauf": ["2026-09-29", "2026-10-01"] } };
  const { control } = setup(getSemesterLearningProgram(), memoryStorage({ [LEARNING_CONTROL_KEY]: JSON.stringify(legacy) }));
  assert.equal(control.getSnapshot().sessions.length, 1);
  assert.deepEqual(control.getSnapshot().legacyEvidence["fsa-wortlauf"], legacy.evidence["fsa-wortlauf"]);
  assert.equal(control.getSnapshot().unitProgress.find((unit) => unit.id === "fsa-wortlauf").cleanRuns, 0);
});

test("free diagnostics return actual storage acknowledgment and cannot create round evidence", () => {
  const { control, storage, program, clock } = setup();
  const diagnostic = { examId: "mathe", roundId: "free-diagnostic", score: 100, tasks: round().tasks, taskResults: results() };
  assert.deepEqual(control.recordDiagnostic(diagnostic), { accepted: true, persisted: true, evidence: 0 });
  const restored = createLearningControl({ storage, program, clock });
  assert.equal(restored.getSnapshot().sessions[0].targetId, "diagnose-mathe");
  const failed = setup(program, { getItem: () => null, setItem: () => { throw new Error("quota"); } }).control;
  assert.equal(failed.recordDiagnostic(diagnostic).persisted, false);
  assert.ok(failed.getSnapshot().warning);
});

test("trainer spreading the existing draft still saves new result arrays and partial progress", () => {
  const { control } = setup();
  const started = control.startTarget("fsa-wortlauf", "assessment", round());
  control.updateRound(started.sessionId, { ...control.getSnapshot().activeSession.round, results: results(["a"]) });
  control.updateRound(started.sessionId, { ...control.getSnapshot().activeSession.round, results: results() });
  assert.equal(control.complete({ sessionId: started.sessionId, result: {} }).evidence, 1);
  const snapshot = control.getSnapshot();
  assert.equal(snapshot.examProgress.find((exam) => exam.id === "fsa").progressPercent, Math.round(50 / 3));
  assert.equal(snapshot.examProgress.find((exam) => exam.id === "fsa").completedUnits, 0);
  assert.equal(snapshot.totalProgressPercent, Math.round(50 / snapshot.unitProgress.length));
});

test("all five subjects use the same round completion contract", () => {
  const { control, program } = setup();
  for (const exam of program.exams) {
    const target = program.targets.find((candidate) => candidate.kind === "focus" && candidate.examId === exam.id);
    assert.equal(finish(control, target.id).evidence, 1);
    assert.equal(finish(control, target.id).evidence, 2);
    assert.equal(control.getSnapshot().unitProgress.find((unit) => unit.id === target.id).completed, true);
  }
});

test("learning drafts persist independently from assessment rounds and empty drafts never count", () => {
  const { control, storage, program, clock } = setup();
  const draft = { explanation: "Eigene Herleitung", selected: 1, notes: "Paket prüfen", showHint: true };
  assert.deepEqual(control.updateLearningDraft("netz-osi", draft), { accepted: true, persisted: true });
  assert.equal(control.updateLearningDraft("unknown", draft).accepted, false);
  assert.equal(control.updateLearningDraft("diagnose-netz", draft).accepted, false);
  control.startTarget("netz-osi", "assessment", round());
  control.startTarget("systemnah-embedded", "assessment", round());
  const restored = createLearningControl({ storage, program, clock });
  assert.deepEqual(restored.getSnapshot().learningDrafts["netz-osi"], draft);
  assert.equal(restored.getSnapshot().unitProgress.find((unit) => unit.id === "netz-osi").attempts, 0);
  restored.updateLearningDraft("netz-osi", null);
  assert.equal(restored.getSnapshot().learningDrafts["netz-osi"], undefined);
});

test("a mode change never silently converts a paused learning round into a clean assessment", () => {
  const { control } = setup();
  const learning = control.startTarget("fsa-wortlauf", "learn", round());
  control.updateRound(learning.sessionId, { ...round(), attempts: 1, helpUsed: true });
  assert.equal(control.startTarget("fsa-wortlauf", "assessment", round()).sessionId, learning.sessionId);
  assert.equal(control.getSnapshot().activeSession.mode, "learn");
  control.complete({ sessionId: learning.sessionId, result: { outcome: "aborted" } });
  const assessment = control.startTarget("fsa-wortlauf", "assessment", round());
  assert.notEqual(assessment.sessionId, learning.sessionId);
  assert.equal(control.getSnapshot().activeSession.mode, "assessment");
  assert.equal(control.getSnapshot().sessions[0].clean, false);
});

test("completion cannot replace a round's frozen task list with a smaller required list", () => {
  const { control } = setup();
  const started = control.startTarget("fsa-wortlauf", "assessment", round());
  const result = control.complete({ sessionId: started.sessionId, result: { requiredTaskIds: ["a"], taskResults: results(["a"]) } });
  assert.equal(result.evidence, 0);
  assert.equal(control.getSnapshot().sessions[0].completed, false);
});

test("a saved diagnostic is complete history without contributing unit evidence", () => {
  const { control } = setup();
  control.recordDiagnostic({ examId: "netz", roundId: "diagnostic-scored", score: 50 });
  const session = control.getSnapshot().sessions[0];
  assert.equal(session.completed, true);
  assert.equal(session.result.outcome, "incorrect");
  assert.equal(session.clean, false);
});

test("diagnostic draft preserves an explicitly started attempt before its final evaluation", () => {
  const { control, storage, program, clock } = setup();
  const started = control.startTarget("diagnose-netz", "diagnostic");
  control.updateRound(started.sessionId, { answers: [1, null], taskResults: [], attemptStarted: true });
  control.updateRound(started.sessionId, { answers: [1, null], taskResults: [], attemptStarted: false });
  const restored = createLearningControl({ storage, program, clock });
  assert.equal(restored.getSnapshot().activeSession.round.attemptStarted, true);
  restored.complete({ sessionId: started.sessionId, result: { outcome: "aborted" } });
  assert.equal(restored.getSnapshot().sessions[0].attemptStarted, true);
});

test("retired legacy targets leave the active plan while their full drafts remain in history", () => {
  const pending = (id, targetId) => ({ id, startedAt: at("2026-09-28T10:00:00+02:00"), action: { targetId, examId: "mathe", trainerSlug: "mathe-funktionen" }, round: { answers: { old: "Herleitung erhalten" }, attempts: 1 } });
  const activeSession = pending("old-active", "mathe-funktionen");
  const pausedSessions = Object.fromEntries(["netz-grundlagen", "systemnah-grundlagen", "fsa-dea"].map((targetId) => [targetId, pending(`old-${targetId}`, targetId)]));
  pausedSessions["netz-osi"] = pending("still-supported", "netz-osi");
  const legacy = { version: 1, activeSession, pausedSessions, sessions: [], due: {}, evidence: {} };
  const { control, storage, program, clock } = setup(getSemesterLearningProgram(), memoryStorage({ [LEARNING_CONTROL_KEY]: JSON.stringify(legacy) }));
  const snapshot = control.getSnapshot();
  assert.equal(snapshot.activeSession, null);
  assert.ok(snapshot.action);
  assert.deepEqual(Object.keys(snapshot.pausedSessions), ["netz-osi"]);
  assert.equal(snapshot.sessions.length, 4);
  assert.ok(snapshot.sessions.every((session) => session.legacy && !session.roundModelVersion));
  assert.deepEqual(snapshot.sessions.find((session) => session.id === "old-active").round, activeSession.round);
  assert.equal(snapshot.weekMinutes, 0);
  assert.equal(control.startTarget("netz-osi").sessionId, "still-supported");
  const restored = createLearningControl({ storage, program, clock });
  assert.equal(restored.getSnapshot().sessions.length, 4);
  assert.equal(restored.getSnapshot().totalProgressPercent, 0);
});

function focusProgram(examId) {
  const program = getSemesterLearningProgram();
  program.targets = program.targets.filter((target) => target.kind === "focus" && (!examId || target.examId === examId));
  return program;
}

test("automatic focus follows FSA prerequisites and skips only units with two clean rounds", () => {
  const { control } = setup(focusProgram("fsa"));
  assert.equal(control.getSnapshot().action.targetId, "fsa-grundlagen");
  finish(control, "fsa-grundlagen");
  assert.equal(control.getSnapshot().action.targetId, "fsa-grundlagen");
  finish(control, "fsa-grundlagen");
  assert.equal(control.getSnapshot().action.targetId, "fsa-wortlauf");
  finish(control, "fsa-wortlauf");
  finish(control, "fsa-wortlauf");
  assert.equal(control.getSnapshot().action.targetId, "fsa-regulaere-ausdruecke");
});

test("mathematics curricular order places error propagation before unconstrained and constrained optimization", () => {
  const { control, program } = setup(focusProgram("mathe"));
  const expected = ["1.1", "2.1", "2.2", "3.1", "3.3", "3.fehler", "5.1", "9.1"];
  assert.deepEqual(program.targets.map((target) => target.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.ok(program.targets.every((target) => target.orderReason));
  for (const topic of expected) {
    const targetId = `mathe-${topic}`;
    assert.equal(control.getSnapshot().action.targetId, targetId);
    finish(control, targetId);
    finish(control, targetId);
  }
  assert.equal(control.getSnapshot().action, null);
});

test("manual later-unit work stays free and an active draft resumes without changing the recommendation order", () => {
  const { control, storage, program, clock } = setup(focusProgram("fsa"));
  const later = control.startTarget("fsa-regulaere-ausdruecke", "assessment", round());
  control.updateRound(later.sessionId, { ...round(), answers: { a: "draft" } });
  const restored = createLearningControl({ storage, program, clock });
  assert.equal(restored.startNow().sessionId, later.sessionId);
  assert.equal(restored.getSnapshot().activeSession.round.answers.a, "draft");
  restored.complete({ sessionId: later.sessionId, result: { outcome: "aborted" } });
  assert.equal(restored.getSnapshot().action.targetId, "fsa-grundlagen");
});

test("a due review remains ahead of the first unfinished curricular unit", () => {
  const program = focusProgram("fsa");
  let now = at("2026-10-02T10:00:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program, clock: () => now });
  finish(control, "fsa-regulaere-ausdruecke");
  assert.equal(control.getSnapshot().action.targetId, "fsa-grundlagen");
  now = at("2026-10-05T10:00:00+02:00");
  assert.equal(control.getSnapshot().action.targetId, "fsa-regulaere-ausdruecke");
  assert.equal(control.getSnapshot().action.kind, "review");
  assert.equal(control.getSnapshot().dueReviews[0].title, "Reguläre Ausdrücke lesen und anwenden");
});

test("subject budget ranking remains independent of curricular order within each subject", () => {
  const { control } = setup(focusProgram());
  assert.equal(control.getSnapshot().action.targetId, "mathe-1.1");
  finish(control, "mathe-1.1");
  assert.equal(control.getSnapshot().action.targetId, "netz-infrastruktur");
});

test("plan snapshot exposes the clock date, daily remainder, reserve and sorted known-unit review dates", () => {
  const { control } = setup();
  const initial = control.getSnapshot();
  assert.equal(initial.todayDate, "2026-10-02");
  assert.equal(initial.dayLimit, 60);
  assert.equal(initial.remainingMinutes, 60);
  assert.equal(initial.weekLimit, 420);
  assert.equal(initial.reserveUnlocked, false);
  control.recordDiagnostic({ examId: "mathe", roundId: "plan-diagnostic", score: 100, durationMinutes: 10 });
  finish(control, "fsa-grundlagen");
  for (let index = 0; index < 3; index += 1) finish(control, "netz-osi", "assessment", [{ ...results()[0], correct: false }, results()[1]]);
  const snapshot = control.getSnapshot();
  assert.equal(snapshot.todayMinutes, 14);
  assert.equal(snapshot.remainingMinutes, 61);
  assert.equal(snapshot.dayLimit, 75);
  assert.equal(snapshot.reserveUnlocked, true);
  assert.equal(snapshot.weekLimit, 480);
  assert.deepEqual(snapshot.dueReviews.map((review) => review.targetId).sort(), ["fsa-grundlagen", "netz-osi"]);
  assert.ok(snapshot.dueReviews.every((review) => review.title && review.trainerSlug && review.examId && Number.isFinite(review.at)));
  assert.equal(snapshot.unitProgress.find((unit) => unit.id === "fsa-grundlagen").order, 1);
});

test("successful scheduled reviews advance from one to three to seven days without new evidence", () => {
  let now = at("2026-10-05T10:00:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program: focusProgram("fsa"), clock: () => now });
  finish(control, "fsa-grundlagen");
  assert.equal(control.getSnapshot().dueReviews[0].at, now + 86400000);
  now += 86400000;
  let started = control.startNow();
  assert.equal(control.getSnapshot().activeSession.mode, "review");
  control.updateRound(started.sessionId, { ...round(), results: results(), finished: true });
  control.complete({ sessionId: started.sessionId, result: {} });
  assert.equal(control.getSnapshot().dueReviews[0].stage, 1);
  assert.equal(control.getSnapshot().dueReviews[0].at, now + 3 * 86400000);
  now += 3 * 86400000;
  started = control.startNow();
  control.updateRound(started.sessionId, { ...round(), results: results(), finished: true });
  control.complete({ sessionId: started.sessionId, result: {} });
  assert.equal(control.getSnapshot().dueReviews[0].stage, 2);
  assert.equal(control.getSnapshot().dueReviews[0].at, now + 7 * 86400000);
  assert.equal(control.getSnapshot().unitProgress.find((unit) => unit.id === "fsa-grundlagen").cleanRuns, 1);
  now += 7 * 86400000;
  control.recordResult({ targetId: "fsa-grundlagen", roundId: "assisted-review", mode: "review", tasks: round().tasks, taskResults: results(), helpUsed: true });
  assert.equal(control.getSnapshot().dueReviews[0].stage, 0);
  assert.equal(control.getSnapshot().dueReviews[0].at, now + 86400000);
});

test("old diagnostic due dates cannot become review actions", () => {
  const program = getSemesterLearningProgram();
  const now = at("2026-10-06T10:00:00+02:00");
  const stored = { version: 1, roundModelVersion: 1, sessions: [], due: { "diagnose-mathe": { at: now - 86400000, stage: 0 } }, evidence: {} };
  const control = createLearningControl({ storage: memoryStorage({ [LEARNING_CONTROL_KEY]: JSON.stringify(stored) }), program, clock: () => now });
  assert.equal(control.getSnapshot().action.kind, "diagnostic");
  assert.equal(control.getSnapshot().dueReviews.length, 0);
});

test("unlocked reserve extends study days by fifteen minutes while the weekly cap and rest days remain enforced", () => {
  const program = focusProgram("fsa");
  const now = at("2026-10-09T10:00:00+02:00");
  const session = (id, date, durationMinutes) => ({ id, targetId: "fsa-grundlagen", examId: "fsa", completedAt: at(date), durationMinutes });
  const sessions = [
    session("mon", "2026-10-05T10:00:00+02:00", 105),
    session("tue", "2026-10-06T10:00:00+02:00", 105),
    session("wed", "2026-10-07T10:00:00+02:00", 105),
    session("thu", "2026-10-08T10:00:00+02:00", 105),
    session("fri", "2026-10-09T09:00:00+02:00", 50),
  ];
  const state = { version: 1, roundModelVersion: 1, sessions, due: {}, evidence: {}, failures: { "fsa-wortlauf": 3 } };
  const storage = memoryStorage({ [LEARNING_CONTROL_KEY]: JSON.stringify(state) });
  const control = createLearningControl({ storage, program, clock: () => now });
  assert.equal(control.getSnapshot().dayLimit, 75);
  assert.equal(control.getSnapshot().weekMinutes, 470);
  assert.equal(control.getSnapshot().remainingMinutes, 10);
  assert.equal(control.getSnapshot().action.minutes, 10);
  control.recordResult({ targetId: "fsa-grundlagen", roundId: "reserve-last-ten", mode: "learn", durationMinutes: 10, tasks: round().tasks, taskResults: results() });
  assert.equal(control.getSnapshot().weekMinutes, 480);
  assert.equal(control.getSnapshot().remainingMinutes, 0);
  assert.equal(control.getSnapshot().action, null);
  const weekend = createLearningControl({ storage, program, clock: () => at("2026-10-10T10:00:00+02:00") });
  assert.equal(weekend.getSnapshot().dayLimit, 0);
  assert.equal(weekend.getSnapshot().status, "rest");
});

test("switching subjects excludes a full paused day from a resumed round's duration", () => {
  let now = at("2026-10-05T10:00:00+02:00");
  const program = getSemesterLearningProgram();
  const storage = memoryStorage();
  let control = createLearningControl({ storage, program, clock: () => now });
  const first = control.startTarget("fsa-grundlagen", "assessment", round());
  now += 60000;
  control.startTarget("netz-osi", "assessment", round());
  assert.equal(control.getSnapshot().pausedSessions["fsa-grundlagen"].accumulatedElapsedMs, 60000);
  assert.equal(control.getSnapshot().pausedSessions["fsa-grundlagen"].resumedAt, null);
  now += 86400000;
  control = createLearningControl({ storage, program, clock: () => now });
  assert.equal(control.startTarget("fsa-grundlagen").sessionId, first.sessionId);
  now += 60000;
  control.updateRound(first.sessionId, { ...round(), results: results(), finished: true });
  control.complete({ sessionId: first.sessionId, result: {} });
  const snapshot = control.getSnapshot();
  assert.equal(snapshot.sessions[0].durationMinutes, 2);
  assert.equal(snapshot.sessions[0].accumulatedElapsedMs, 120000);
  assert.equal(snapshot.todayMinutes, 2);
  assert.equal(snapshot.remainingMinutes, 88);
  assert.ok(snapshot.action);
});

test("completing a still-paused draft counts only its recorded active time", () => {
  let now = at("2026-10-05T10:00:00+02:00");
  const control = createLearningControl({ storage: memoryStorage(), program: getSemesterLearningProgram(), clock: () => now });
  const first = control.startTarget("fsa-grundlagen", "assessment", round());
  now += 3 * 60000;
  control.startTarget("netz-osi", "assessment", round());
  now += 86400000;
  control.complete({ sessionId: first.sessionId, result: { outcome: "aborted" } });
  assert.equal(control.getSnapshot().sessions[0].durationMinutes, 3);
  assert.equal(control.getSnapshot().activeSession.action.targetId, "netz-osi");
});
