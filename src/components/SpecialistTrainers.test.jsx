import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DatenbankTrainer from "../trainers/Datenbanken/DatenbankTrainer.jsx";
import { sqlChallenges } from "../trainers/Datenbanken/database/data.js";
import { loadProgress } from "../trainers/Datenbanken/database/progress.js";
import CountingSort from "../trainers/Theoretische Informatik/Sortier-Algos/CountingSortTrainer.jsx";
import RadixSort from "../trainers/Theoretische Informatik/Sortier-Algos/RadixSortTrainer.jsx";
import QuickSort from "../trainers/Theoretische Informatik/Sortier-Algos/QuickSortTrainer.jsx";
import MergeSort from "../trainers/Theoretische Informatik/Sortier-Algos/MergeSortTrainer.jsx";
import KVDiagramm from "../trainers/Digitaltechnik/KVDiagramm.jsx";
import SpielablaufTrainer from "../trainers/Java/pruefung_mastermind/SpielablaufTrainer.jsx";
import AppJsLevelQuest from "../trainers/Web-Eng2/ai-prompt-library/AppJs_Level_Quest.jsx";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("keeps SQL solution help marked after hiding it and checking the answer", async () => {
  const user = userEvent.setup();
  render(<DatenbankTrainer />);
  await user.click(screen.getByRole("button", { name: "Trainieren" }));
  await user.click(screen.getByRole("button", { name: /SQL-Challenges/ }));
  await user.click(screen.getByRole("button", { name: "Musterlösung anzeigen" }));
  await user.click(screen.getByRole("button", { name: "Musterlösung ausblenden" }));
  await user.type(screen.getByRole("textbox", { name: "SQL" }), sqlChallenges[0].solution);
  await user.click(screen.getByRole("button", { name: "Lösung prüfen" }));
  expect(loadProgress().attempts[sqlChallenges[0].id]).toMatchObject({ lastResult: "correct", lastAssessment: "automatic", lastHelpUsed: true });
  expect(screen.getByText(/Musterlösung verwendet/)).toBeInTheDocument();
});

it("restarts a single filtered flashcard and keeps its rating separate", async () => {
  const user = userEvent.setup();
  render(<DatenbankTrainer />);
  await user.click(screen.getByRole("button", { name: "Trainieren" }));
  await user.selectOptions(screen.getByLabelText("Level"), "study");
  await user.selectOptions(screen.getByLabelText("Thema"), "modellierung");
  await user.click(screen.getByRole("button", { name: "Antwort aufdecken" }));
  await user.click(screen.getByRole("button", { name: "Gewusst" }));
  expect(screen.getByRole("button", { name: "Gewusst" })).toBeDisabled();
  expect(loadProgress().attempts["db-card-007"]).toMatchObject({ lastAssessment: "self", count: 1 });
  await user.click(screen.getByRole("button", { name: "Diese Aufgabe erneut üben" }));
  expect(screen.getByRole("button", { name: "Antwort aufdecken" })).toBeEnabled();
  expect(screen.queryByRole("button", { name: "Gewusst" })).not.toBeInTheDocument();
});

it("restarts a single filtered multiple-choice question with enabled answers", async () => {
  const user = userEvent.setup();
  render(<DatenbankTrainer />);
  await user.click(screen.getByRole("button", { name: "Trainieren" }));
  await user.click(screen.getByRole("button", { name: /Multiple Choice/ }));
  await user.selectOptions(screen.getByLabelText("Level"), "basic");
  await user.selectOptions(screen.getByLabelText("Thema"), "relationen");
  await user.click(screen.getByRole("button", { name: "B 1:n" }));
  expect(screen.getByRole("button", { name: "B 1:n" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Diese Aufgabe erneut üben" }));
  expect(screen.getByRole("button", { name: "B 1:n" })).toBeEnabled();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it.each([
  ["Counting Sort", CountingSort, "3, 12, 1", "12"],
  ["Radix Sort", RadixSort, "3, -1, 1", "-1"],
  ["Quick Sort", QuickSort, "3, Infinity, 1", "Infinity"],
  ["Merge Sort", MergeSort, "3, foo, 1", "foo"],
])("%s rejects invalid values without changing the running example", async (_, Trainer, invalid, token) => {
  const user = userEvent.setup();
  render(<Trainer />);
  const originalStep = screen.getByText(/^Schritt 1 \/ /).textContent;
  const input = screen.getByRole("textbox", { name: "Zu sortierende Werte" });
  await user.clear(input);
  await user.type(input, invalid);
  await user.click(screen.getByRole("button", { name: "Übernehmen" }));
  expect(screen.getByRole("alert")).toHaveTextContent(`„${token}“ ist ungültig`);
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByText(originalStep)).toBeInTheDocument();
  await user.clear(input);
  await user.type(input, "3, 1{Enter}");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(input).toHaveAttribute("aria-invalid", "false");
  expect(screen.getByText(/^Schritt 1 \/ /).textContent).not.toBe(originalStep);
});

it("cycles KV cells with Enter and Space", async () => {
  const user = userEvent.setup();
  render(<KVDiagramm />);
  const cell = screen.getByRole("button", { name: /^Minterm 0,/ });
  const initial = cell.getAttribute("aria-label");
  cell.focus();
  await user.keyboard("{Enter}");
  const second = cell.getAttribute("aria-label");
  expect(second).not.toBe(initial);
  await user.keyboard(" ");
  expect(cell.getAttribute("aria-label")).not.toBe(second);
  await user.keyboard("{Enter}");
  expect(cell).toHaveAttribute("aria-label", initial);
});

it("removes a Mastermind colour with the keyboard", async () => {
  const user = userEvent.setup();
  render(<SpielablaufTrainer />);
  await user.click(screen.getByRole("button", { name: "R Rot" }));
  const slot = screen.getByRole("button", { name: "Feld 1: Rot entfernen" });
  slot.focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("button", { name: "Feld 1: Rot entfernen" })).not.toBeInTheDocument();
});

it("lets learners choose any Quest level without unearned completion claims", async () => {
  const user = userEvent.setup();
  render(<AppJsLevelQuest />);
  expect(screen.queryByText(/ahnungslos|konditioniert/)).not.toBeInTheDocument();
  expect(screen.getByText(/Projektbeispiel ai-prompt-library/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /^Level 7:/ }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tags, Dashboard");
  await user.click(screen.getByRole("button", { name: /^Finale:/ }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Die Projektbausteine verbinden");
});
