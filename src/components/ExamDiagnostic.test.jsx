import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import ExamDiagnostic from "./ExamDiagnostic.jsx";
import { examDiagnostics } from "../examDiagnostics.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("shuffles every diagnostic variant, keeps choices stable and scores the original correct answers", async () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const user = userEvent.setup();
  for (const [diagnosticId, diagnostic] of Object.entries(examDiagnostics)) {
    for (const [variant, questions] of diagnostic.variants.entries()) {
      const onLearningResult = vi.fn(() => ({ accepted: true }));
      render(<ExamDiagnostic item={{ diagnosticId }} learningSession={{ action: { variant } }} onLearningResult={onLearningResult} />);
      const groups = screen.getAllByRole("group");
      const order = groups.map((group) => within(group).getAllByRole("radio").map((radio) => radio.parentElement.textContent));
      for (const [index, [, choices, answer]] of questions.entries()) {
        expect(order[index]).toEqual([choices[1], choices[2], choices[0]]);
        await user.click(within(groups[index]).getByRole("radio", { name: choices[answer] }));
      }
      expect(groups.map((group) => within(group).getAllByRole("radio").map((radio) => radio.parentElement.textContent))).toEqual(order);
      await user.click(screen.getByRole("button", { name: "Test auswerten" }));
      expect(screen.getByRole("status")).toHaveTextContent("100 %");
      await user.click(screen.getByRole("button", { name: "Auswertung speichern" }));
      expect(onLearningResult).toHaveBeenCalledWith(expect.objectContaining({ score: 100, outcome: "correct" }));
      expect(screen.getByRole("button", { name: "Gespeichert" })).toBeDisabled();
      cleanup();
    }
  }
});

it.each([undefined, { accepted: false }, { accepted: true, persisted: false }, new Error("Storage unavailable")])("keeps an unconfirmed save retryable: %s", async (response) => {
  const user = userEvent.setup();
  const onLearningResult = vi.fn().mockImplementationOnce(() => {
    if (response instanceof Error) throw response;
    return response;
  }).mockResolvedValue({ accepted: true });
  render(<ExamDiagnostic item={{ diagnosticId: "mathe" }} onLearningResult={onLearningResult} />);
  for (const group of screen.getAllByRole("group")) await user.click(within(group).getAllByRole("radio")[0]);
  await user.click(screen.getByRole("button", { name: "Test auswerten" }));
  await user.click(screen.getByRole("button", { name: "Auswertung speichern" }));
  expect(screen.getByRole("alert")).toHaveTextContent(/nicht.*gespeichert/);
  expect(screen.queryByRole("button", { name: "Gespeichert" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Auswertung speichern" }));
  expect(screen.getByRole("button", { name: "Gespeichert" })).toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("waits for the save acknowledgement before showing success", async () => {
  const user = userEvent.setup();
  let acknowledge;
  const onLearningResult = vi.fn(() => new Promise((resolve) => { acknowledge = resolve; }));
  render(<ExamDiagnostic item={{ diagnosticId: "mathe" }} onLearningResult={onLearningResult} />);
  for (const group of screen.getAllByRole("group")) await user.click(within(group).getAllByRole("radio")[0]);
  await user.click(screen.getByRole("button", { name: "Test auswerten" }));
  await user.click(screen.getByRole("button", { name: "Auswertung speichern" }));
  expect(screen.getByRole("button", { name: "Wird gespeichert …" })).toBeDisabled();
  acknowledge({ accepted: true });
  expect(await screen.findByRole("button", { name: "Gespeichert" })).toBeDisabled();
  expect(onLearningResult).toHaveBeenCalledTimes(1);
});

it("resumes a planned diagnosis with stable questions and answers, without scoring on entry", async () => {
  const user = userEvent.setup();
  const onRoundChange = vi.fn();
  const session = { id: "planned-diagnosis", startedAt: 1000, action: { variant: 0 } };
  const { unmount } = render(<ExamDiagnostic item={{ diagnosticId: "mathe" }} learningSession={session} onRoundChange={onRoundChange} />);
  expect(onRoundChange.mock.lastCall[0]).toMatchObject({ attemptStarted: false, taskResults: [] });
  const radios = screen.getAllByRole("radio").map((radio) => radio.parentElement.textContent);
  await user.click(screen.getAllByRole("radio")[1]);
  const draft = onRoundChange.mock.lastCall[0];
  expect(draft).toMatchObject({ attemptStarted: true, taskResults: [] });
  unmount();
  const onLearningResult = vi.fn().mockReturnValue({ accepted: true, persisted: true });
  render(<ExamDiagnostic item={{ diagnosticId: "mathe" }} learningSession={{ ...session, round: draft }} onRoundChange={onRoundChange} onLearningResult={onLearningResult} />);
  expect(screen.getAllByRole("radio").map((radio) => radio.parentElement.textContent)).toEqual(radios);
  expect(screen.getAllByRole("radio")[1]).toBeChecked();
  for (const group of screen.getAllByRole("group").slice(1)) await user.click(within(group).getAllByRole("radio")[0]);
  await user.click(screen.getByRole("button", { name: "Test auswerten" }));
  await user.click(screen.getByRole("button", { name: "Auswertung speichern" }));
  const saved = onLearningResult.mock.lastCall[0];
  expect(saved).toMatchObject({ roundId: session.id, startedAt: 1000, completed: true, mode: "diagnostic" });
  expect(saved.taskResults.map((task) => task.id)).toEqual(saved.requiredTaskIds);
  expect(saved.taskResults).toHaveLength(screen.getAllByRole("group").length);
});
