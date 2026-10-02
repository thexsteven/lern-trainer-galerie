import test from "node:test";
import assert from "node:assert/strict";
import { checkFsaAnswer, createFsaRound, FSA_GOALS } from "./fsaPractice.js";
import { createLearningControl } from "./learningControl.js";
import { getSemesterLearningProgram } from "./learningProgram.js";

const task = (skill) => createFsaRound("regex").tasks.find((item) => item.skill === skill);

test("regex has five distinct required skills with source and explicit free-answer formats", () => {
  const round = createFsaRound("regex");
  assert.equal(FSA_GOALS.find(goal => goal.goal === "regex").id, "fsa-regulaere-ausdruecke");
  assert.deepEqual(round.tasks.map(item => item.skill), ["empty", "membership", "concatenation", "star", "construct"]);
  assert.equal(new Set(round.tasks.map(item => item.id)).size, 5);
  assert.equal(round.finished, false);
  for (const item of round.tasks) {
    assert.match(item.source, /Eigene Übungsaufgabe/);
    assert.ok(item.hint && item.explanation && item.answerFormat);
  }
});

test("the language of epsilon plus empty set contains epsilon, not the empty language", () => {
  for (const answer of ["ε", "epsilon", "{ε}", " { epsilon } ", "ε, ε"]) assert.equal(checkFsaAnswer(task("empty"), answer), true, answer);
  for (const answer of ["", " ", "∅", "{}", "a", "ε,a", "{∅}", "EPSILON", "ε*", "{ε"]) assert.equal(checkFsaAnswer(task("empty"), answer), false, answer);
});

test("membership requires every matching candidate and no extra word regardless of order", () => {
  const item = task("membership");
  for (const answer of ["baa, abba", "abba;baa", "{ abba, baa }", "baa\nabba", "baa abba"]) assert.equal(checkFsaAnswer(item, answer), true, answer);
  for (const answer of ["baa", "abba", "baa,abba,aba", "baa,abba,ab", "baa,abba,ε", "BAA,abba", "bAa,abba", "baa_,abba", "baa,abba,cbaa"]) assert.equal(checkFsaAnswer(item, answer), false, answer);
  // Position counted from the end, independently of the supplied answer parser.
  const candidates = ["baa", "aba", "abba", "ab", ""];
  assert.deepEqual(candidates.filter(word => word.length >= 3 && word.at(-3) === "b"), ["baa", "abba"]);
});

test("concatenation distributes over epsilon and a without retaining epsilon as a word", () => {
  for (const answer of ["ab,b", "b;ab", "{b, ab}"]) assert.equal(checkFsaAnswer(task("concatenation"), answer), true, answer);
  for (const answer of ["ab", "b", "a,b", "ε,ab,b", "aεb", "a b", "AB,b", "ab,b,bb"]) assert.equal(checkFsaAnswer(task("concatenation"), answer), false, answer);
});

test("Kleene star repeats whole ab blocks while respecting the fixed length", () => {
  const item = task("star");
  for (let length = 0; length <= 8; length++) {
    for (let value = 0; value < 2 ** length; value++) {
      const word = length ? value.toString(2).padStart(length, "0").replaceAll("0", "a").replaceAll("1", "b") : "";
      const expected = word.length === 6 && [...word].every((symbol, index) => symbol === (index % 2 ? "b" : "a"));
      assert.equal(checkFsaAnswer(item, word), expected, word);
    }
  }
  for (const answer of ["(ab)*", "(ab)3", "ABABAB", "ab ab ab", "{ababab}", "ε"]) assert.equal(checkFsaAnswer(item, answer), false, answer);
});

test("word construction checks the complete word and accepts all six valid solutions", () => {
  const item = task("construct");
  const accepted = [];
  const visit = (word) => {
    const middle = [...word].filter(symbol => symbol !== "c");
    const expected = word.length === 5 && middle.length === 1 && ["a", "b"].includes(middle[0]) && word.startsWith("c") && word.endsWith("c");
    assert.equal(checkFsaAnswer(item, word), expected, word);
    if (expected) accepted.push(word);
    if (word.length < 6) for (const symbol of "abc") visit(word + symbol);
  };
  visit("");
  assert.deepEqual(accepted.sort(), ["caccc", "cbccc", "ccacc", "ccbcc", "cccac", "cccbc"].sort());
  for (const answer of ["cCacc", "ccAcc", "cc_acc", "ccaccx", "xccacc", "ccаcc", "cc acc", "ccacc,ccbcc", "{ccacc}"]) assert.equal(checkFsaAnswer(item, answer), false, answer);
});

test("error practice prioritizes prior regex errors without dropping required skills", () => {
  const round = createFsaRound("regex", [{ id: "regex:construct", correct: false, firstAttempt: true }], "errors");
  assert.equal(round.tasks[0].id, "regex:construct");
  assert.equal(round.tasks.length, 5);
  assert.equal(new Set(round.tasks.map(item => item.id)).size, 5);
});

test("regex round integration preserves drafts, credits same-day proofs and excludes learning", () => {
  const saved = new Map();
  const storage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  const create = () => createLearningControl({ storage, program: getSemesterLearningProgram(), clock: () => Date.parse("2026-10-02T10:00:00+02:00") });
  let control = create();
  for (const mode of ["learn", "assessment", "assessment"]) {
    control.startTarget("fsa-regulaere-ausdruecke", mode, createFsaRound("regex"));
    const session = control.getSnapshot().activeSession;
    control.updateRound(session.id, { ...session.round, answer: "epsilon" });
    control = create();
    assert.equal(control.getSnapshot().activeSession.id, session.id);
    assert.equal(control.getSnapshot().activeSession.round.answer, "epsilon");
    assert.equal(control.getSnapshot().activeSession.round.attemptStarted, false);
    const round = control.getSnapshot().activeSession.round;
    const answers = ["ε", "abba,baa", "b,ab", "ababab", "ccacc"];
    control.updateRound(session.id, { ...round, finished: true, results: round.tasks.map((item, index) => ({ id: item.id, correct: checkFsaAnswer(item, answers[index]), firstAttempt: true, helpUsed: false })) });
    assert.equal(control.complete({ sessionId: session.id, result: { outcome: "completed" } }).accepted, true);
  }
  const progress = control.getSnapshot().unitProgress.find(item => item.id === "fsa-regulaere-ausdruecke");
  assert.equal(progress.cleanRuns, 2);
  assert.equal(progress.completed, true);
});
