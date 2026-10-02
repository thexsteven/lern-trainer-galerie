import "@testing-library/jest-dom/vitest";
import React, { useSyncExternalStore } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import CourseTrainer, { createCourseRound } from "./CourseTrainer.jsx";
import Course, { createMathRound } from "../appliedMath/Course.jsx";
import FsaPruefungstraining from "../trainers/Formale Sprachen & Automaten/Endliche Automaten/FsaPruefungstraining.jsx";
import { createLearningControl } from "../learningControl.js";
import { getSemesterLearningProgram } from "../learningProgram.js";
import { units } from "../appliedMath/data.js";
import { createFsaRound } from "../fsaPractice.js";

afterEach(() => { cleanup(); localStorage.clear(); window.history.replaceState({}, "", "/"); });
const unit = { title: "Netzprobe", shortTitle: "Probe", lead: "Grundlage", sections: [], source: "Test", example: "Beispiel", quiz: { question: "Quizfrage", choices: ["Richtig", "Falsch"], answer: 0 }, guided: { title: "Anwendung", prompt: "Anwendungsfrage", choices: ["Richtig", "Falsch"], answer: 0 }, transfer: { title: "Transfer", prompt: "Transferfrage", choices: ["Richtig", "Falsch"], answer: 0 } };
function Harness({ control, type = "course" }) {
  const progress = useSyncExternalStore(control.subscribe, control.getSnapshot, control.getSnapshot);
  const props = { learningControl: control, learningSession: progress.activeSession, learningProgress: progress, onStartRound: control.startTarget, onRoundChange: (round) => control.updateRound(progress.activeSession.id, round), onLearningResult: (result) => control.complete({ sessionId: progress.activeSession.id, result }) };
  if (type === "math") return <Course index={0} {...props} />;
  if (type === "fsa") return <FsaPruefungstraining {...props} />;
  return <CourseTrainer title="Netz" subtitle="Üben" course="Netztechnik" units={[unit]} targetIds={["netz-infrastruktur"]} {...props} />;
}
const makeControl = () => createLearningControl({ storage: localStorage, program: getSemesterLearningProgram() });

it("requires all three course answers and credits two same-day rounds without resetting earlier success", () => {
  const control = makeControl();
  render(<Harness control={control} />);
  for (let round = 0; round < 2; round++) {
    fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde starten" }));
    expect(screen.getByRole("button", { name: "Runde abschließen" })).toBeDisabled();
    for (const section of document.querySelectorAll(".ct-practice")) {
      const correct = within(section).queryByRole("button", { name: /A Richtig/ });
      if (!correct) continue;
      fireEvent.click(correct);
      fireEvent.click(within(section).getByRole("button", { name: "Antwort prüfen" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Runde abschließen" }));
    expect(control.getSnapshot().unitProgress.find(item => item.id === "netz-infrastruktur").cleanRuns).toBe(round + 1);
  }
});

it("persists wrong course answers through remount and correction cannot clean the round", () => {
  let control = makeControl();
  let view = render(<Harness control={control} />);
  fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde starten" }));
  let section = document.querySelector(".ct-practice");
  fireEvent.click(within(section).getByRole("button", { name: /B Falsch/ }));
  fireEvent.click(within(section).getByRole("button", { name: "Antwort prüfen" }));
  view.unmount(); control = makeControl(); view = render(<Harness control={control} />);
  expect(screen.getByText(/Diese Runde enthält einen Fehler/)).toBeVisible();
  for (const current of document.querySelectorAll(".ct-practice")) {
    const correct = within(current).queryByRole("button", { name: /A Richtig/ });
    if (!correct) continue;
    fireEvent.click(correct);
    fireEvent.click(within(current).getByRole("button", { name: "Antwort prüfen" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Runde abschließen" }));
  expect(control.getSnapshot().unitProgress.find(item => item.id === "netz-infrastruktur").cleanRuns).toBe(0);
});

it("resumes FSA input and acceptance in the same centrally stored round", () => {
  let control = makeControl();
  control.startTarget("fsa-wortlauf", "assessment", createFsaRound("dfa"));
  let view = render(<Harness control={control} type="fsa" />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "0 1" } });
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "true" } });
  const id = control.getSnapshot().activeSession.id;
  view.unmount(); control = makeControl(); render(<Harness control={control} type="fsa" />);
  expect(screen.getByRole("textbox")).toHaveValue("0 1");
  expect(screen.getByRole("combobox")).toHaveValue("true");
  expect(control.getSnapshot().activeSession.id).toBe(id);
  expect(control.getSnapshot().unitProgress.find(item => item.id === "fsa-wortlauf").attempts).toBe(0);
});

it("math scope excludes the vector-field transfer and verifies both numeric tasks centrally", () => {
  const control = makeControl();
  const round = createMathRound(units.find(item => item.id === "1.1"));
  expect(round.tasks.map(item => item.id)).toEqual(["1.1-1", "1.1-2"]);
  control.startTarget("mathe-1.1", "assessment", round);
  render(<Harness control={control} type="math" />);
  fireEvent.click(screen.getByRole("button", { name: "Lerneinheiten" }));
  for (const task of round.tasks) {
    for (const [index, field] of task.fields.entries()) fireEvent.change(document.getElementById(`${task.id}-${index}`), { target: { value: String(field.answer) } });
    const input = document.getElementById(`${task.id}-0`);
    fireEvent.click(within(input.closest(".am-exercise")).getByRole("button", { name: "Antwort prüfen" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Runde abschließen" }));
  expect(control.getSnapshot().unitProgress.find(item => item.id === "mathe-1.1").cleanRuns).toBe(1);
});


it("keeps learning answers, revealed feedback and written reflection across a reload", () => {
  let control = makeControl();
  const view = render(<Harness control={control} />);
  fireEvent.click(screen.getByRole("button", { name: /A Richtig/ }));
  fireEvent.click(screen.getByRole("button", { name: "Antwort prüfen" }));
  const practice = document.querySelector(".ct-practice");
  fireEvent.click(within(practice).getByRole("button", { name: /A Richtig/ }));
  fireEvent.click(within(practice).getByRole("button", { name: "Antwort prüfen" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Eigene Herleitung" }), { target: { value: "Meine eigene Begründung" } });
  view.unmount(); control = makeControl(); render(<Harness control={control} />);
  expect(screen.getByRole("textbox", { name: "Eigene Herleitung" })).toHaveValue("Meine eigene Begründung");
  expect(screen.getByText("NEUE AUFGABE OHNE HILFE")).toBeVisible();
  expect(control.getSnapshot().unitProgress.find(item => item.id === "netz-infrastruktur").cleanRuns).toBe(0);
});

it("FSA correction preserves the first error while enabling continued learning", () => {
  const control = makeControl();
  control.startTarget("fsa-grundlagen", "learn", createFsaRound("basics"));
  render(<Harness control={control} type="fsa" />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "9" } });
  fireEvent.click(screen.getByRole("button", { name: "Antwort prüfen" }));
  fireEvent.click(screen.getByRole("button", { name: "Antwort korrigieren" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "Zweiten Versuch prüfen" }));
  const result = control.getSnapshot().activeSession.round.results[0];
  expect(result.correct).toBe(true);
  expect(result.firstAttempt).toBe(false);
  expect(result.hadError).toBe(true);
});


it("opens a linked mathematics unit immediately without requiring a prior diagnosis", () => {
  window.history.replaceState({}, "", "/trainer/mathe-funktionen?einheit=mathe-3.3&familie=3.3");
  render(<Course index={0} />);
  expect(screen.getByRole("heading", { name: "Mehrdimensionale Kettenregel" })).toBeVisible();
  expect(screen.getByRole("combobox", { name: "Dein Thema" })).toHaveValue("3.3");
  expect(screen.queryByRole("heading", { name: "Kurzer Einstiegstest" })).not.toBeInTheDocument();
});


it("opening learning material through unit navigation marks assistance for an existing assessment", () => {
  const control = makeControl();
  render(<Harness control={control} />);
  fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde starten" }));
  expect(control.getSnapshot().activeSession.round.helpUsed).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: /01 Probe/ }));
  expect(control.getSnapshot().activeSession.round.helpUsed).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde fortsetzen" }));
  expect(control.getSnapshot().activeSession.round.helpUsed).toBe(true);
});


it("FSA keeps round assistance sticky without revealing the next task hint", () => {
  const control = makeControl();
  control.startTarget("fsa-grundlagen", "learn", createFsaRound("basics"));
  render(<Harness control={control} type="fsa" />);
  fireEvent.click(screen.getByRole("button", { name: "Hinweis anzeigen" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "Antwort prüfen" }));
  fireEvent.click(screen.getByRole("button", { name: "Nächste Aufgabe" }));
  expect(control.getSnapshot().activeSession.round.helpUsed).toBe(true);
  expect(control.getSnapshot().activeSession.round.taskHelpUsed).toBe(false);
  expect(screen.getByRole("button", { name: "Hinweis anzeigen" })).toBeEnabled();
  expect(screen.queryByText(control.getSnapshot().activeSession.round.tasks[1].hint)).not.toBeInTheDocument();
});


it("aborts an incomplete course attempt without completion and permits a fresh round", () => {
  const control = makeControl();
  render(<Harness control={control} />);
  fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde starten" }));
  const initialId = control.getSnapshot().activeSession.id;
  const section = document.querySelector(".ct-practice");
  fireEvent.click(within(section).getByRole("button", { name: /B Falsch/ }));
  fireEvent.click(within(section).getByRole("button", { name: "Antwort prüfen" }));
  fireEvent.click(screen.getByRole("button", { name: "Runde abbrechen und Verlauf speichern" }));
  const progress = control.getSnapshot().unitProgress.find(item => item.id === "netz-infrastruktur");
  expect(progress.attempts).toBe(1);
  expect(progress.completedRuns).toBe(0);
  expect(progress.cleanRuns).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Nachweisrunde starten" }));
  expect(control.getSnapshot().activeSession.id).not.toBe(initialId);
  expect(control.getSnapshot().activeSession.round.results).toEqual([]);
});

it("opening mathematics notes marks assistance and cannot create a clean completed round", () => {
  const control = makeControl();
  const round = createMathRound(units.find(item => item.id === "1.1"));
  control.startTarget("mathe-1.1", "assessment", round);
  render(<Harness control={control} type="math" />);
  fireEvent.click(screen.getByRole("button", { name: "A4-Merkzettelhilfe" }));
  expect(control.getSnapshot().activeSession.round.helpUsed).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Lerneinheiten" }));
  for (const task of round.tasks) {
    for (const [index, field] of task.fields.entries()) fireEvent.change(document.getElementById(`${task.id}-${index}`), { target: { value: String(field.answer) } });
    fireEvent.click(within(document.getElementById(`${task.id}-0`).closest(".am-exercise")).getByRole("button", { name: "Antwort prüfen" }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Runde abschließen" }));
  const progress = control.getSnapshot().unitProgress.find(item => item.id === "mathe-1.1");
  expect(progress.completedRuns).toBe(1);
  expect(progress.cleanRuns).toBe(0);
});


it("labels a planned course review as repetition with help instead of a proof round", () => {
  let now = Date.parse("2026-10-02T10:00:00+02:00");
  const control = createLearningControl({ storage: localStorage, program: getSemesterLearningProgram(), clock: () => now });
  const round = createCourseRound(unit, "netz-infrastruktur");
  control.startTarget("netz-infrastruktur", "assessment", round);
  control.updateRound(control.getSnapshot().activeSession.id, { ...round, results: round.tasks.map(task => ({ id: task.id, correct: true, firstAttempt: true })) });
  control.complete({ sessionId: control.getSnapshot().activeSession.id, result: { outcome: "completed" } });
  now = Date.parse("2026-10-05T10:00:00+02:00");
  control.startNow();
  expect(control.getSnapshot().activeSession.mode).toBe("review");
  render(<Harness control={control} />);
  expect(screen.getByText("WIEDERHOLUNG · MIT HILFEN")).toBeVisible();
  expect(screen.getByText("Erklärung und Beispiel")).toBeVisible();
  expect(screen.getByRole("button", { name: "Wiederholung abschließen" })).toBeDisabled();
  expect(screen.queryByText("NACHWEISRUNDE")).not.toBeInTheDocument();
});

it("offers help in a mathematics review and clearly excludes it from completion progress", () => {
  const control = makeControl();
  control.startTarget("mathe-1.1", "review", createMathRound(units.find(item => item.id === "1.1")));
  render(<Harness control={control} type="math" />);
  expect(screen.getByText("WIEDERHOLUNG · MIT HILFEN")).toBeVisible();
  expect(screen.getAllByText("Hinweise und Lösung")).toHaveLength(2);
  expect(screen.getByText(/Diese Wiederholung ist eine Lernrunde/)).toBeVisible();
  expect(screen.getByRole("button", { name: "Wiederholung abschließen" })).toBeDisabled();
});

it("shows ordered FSA navigation during a round and changing goals preserves the same draft", () => {
  const control = makeControl();
  control.startTarget("fsa-grundlagen", "assessment", createFsaRound("basics"));
  render(<Harness control={control} type="fsa" />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "9" } });
  const sessionId = control.getSnapshot().activeSession.id;
  const path = screen.getByRole("navigation", { name: "Lernreihenfolge" });
  const buttons = within(path).getAllByRole("button");
  expect(buttons.map(button => button.textContent[0])).toEqual(["1", "2", "3"]);
  expect(buttons[0]).toHaveAttribute("aria-current", "step");
  expect(buttons[0]).toHaveTextContent("Als Nächstes");
  fireEvent.click(buttons[1]);
  expect(screen.getByRole("heading", { name: "DEA-Wortläufe und Akzeptanz" })).toBeVisible();
  expect(control.getSnapshot().activeSession.id).toBe(sessionId);
  expect(control.getSnapshot().activeSession.round.answer).toBe("9");
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  fireEvent.click(within(path).getAllByRole("button")[0]);
  expect(screen.getByRole("textbox")).toHaveValue("9");
  expect(control.getSnapshot().activeSession.id).toBe(sessionId);
});

it("recommends the first unfinished FSA goal while keeping later goals directly accessible", () => {
  const control = makeControl();
  for (let index = 0; index < 2; index++) {
    control.startTarget("fsa-grundlagen", "assessment", createFsaRound("basics"));
    const session = control.getSnapshot().activeSession;
    control.updateRound(session.id, { ...session.round, results: session.round.tasks.map(task => ({ id: task.id, correct: true, firstAttempt: true })) });
    control.complete({ sessionId: session.id, result: { outcome: "completed" } });
  }
  render(<Harness control={control} type="fsa" />);
  const buttons = within(screen.getByRole("navigation", { name: "Lernreihenfolge" })).getAllByRole("button");
  expect(buttons[0]).toHaveTextContent("2/2 Nachweise · Abgeschlossen");
  expect(buttons[1]).toHaveTextContent("Als Nächstes");
  expect(buttons[2]).toBeEnabled();
  fireEvent.click(buttons[2]);
  expect(screen.getByRole("heading", { name: "Reguläre Ausdrücke lesen und anwenden" })).toBeVisible();
  expect(control.getSnapshot().activeSession).toBeNull();
});

it("opening explanations of a paused FSA goal preserves assistance without starting a round", () => {
  const control = makeControl();
  control.startTarget("fsa-grundlagen", "assessment", createFsaRound("basics"));
  const originalId = control.getSnapshot().activeSession.id;
  control.startTarget("fsa-wortlauf", "assessment", createFsaRound("dfa"));
  render(<Harness control={control} type="fsa" />);
  const path = screen.getByRole("navigation", { name: "Lernreihenfolge" });
  fireEvent.click(within(path).getAllByRole("button")[0]);
  const details = screen.getByText("Erklären & üben").closest("details");
  details.open = true;
  fireEvent(details, new Event("toggle"));
  expect(control.getSnapshot().pausedSessions["fsa-grundlagen"].id).toBe(originalId);
  expect(control.getSnapshot().pausedSessions["fsa-grundlagen"].round.helpUsed).toBe(true);
  expect(control.getSnapshot().activeSession.action.targetId).toBe("fsa-wortlauf");
});

it("course path shows the current position and next unfinished unit without locking selection", () => {
  render(<CourseTrainer title="Netz" subtitle="Üben" course="Netztechnik" units={[unit, { ...unit, title: "OSI Probe", shortTitle: "OSI" }]} targetIds={["netz-infrastruktur", "netz-osi"]} learningProgress={{ unitProgress: [{ id: "netz-infrastruktur", cleanRuns: 2, completed: true }, { id: "netz-osi", cleanRuns: 0, completed: false }] }} />);
  const path = screen.getByRole("navigation", { name: "Lernreihenfolge" });
  const buttons = within(path).getAllByRole("button");
  expect(buttons[0]).toHaveAttribute("aria-current", "step");
  expect(buttons[1]).toHaveTextContent("Als Nächstes");
  expect(buttons[1]).toBeEnabled();
  fireEvent.click(buttons[1]);
  expect(screen.getByText(/Schritt 2 von 2/)).toBeVisible();
  expect(screen.getByRole("heading", { name: "OSI Probe" })).toBeVisible();
});
