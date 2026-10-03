import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App.jsx";
import { createLearningControl } from "./learningControl.js";
import { getSemesterLearningProgram } from "./learningProgram.js";

const STORAGE_KEY = "lern-trainer-personal-v1";

describe("FSA practice integration", () => {
  it("opens the regex unit from the overview and records two independently answered rounds", async () => {
    window.history.replaceState({}, "", "/uebersicht");
    const user = userEvent.setup();
    render(<App learningClock={() => Date.parse("2026-10-02T10:00:00+02:00")} />);
    await user.click(screen.getByRole("button", { name: "Reguläre Ausdrücke lesen und anwenden" }));
    expect(window.location.search).toBe("?einheit=fsa-regulaere-ausdruecke");
    const heading = await screen.findByRole("heading", { name: "Reguläre Ausdrücke lesen und anwenden" });
    expect(screen.queryByRole("heading", { name: "Alphabet, Wörter und ε" })).not.toBeInTheDocument();
    for (let run = 0; run < 2; run++) {
      const card = screen.getByRole("heading", { name: heading.textContent }).closest("article");
      await user.click(within(card).getByRole("button", { name: "Runde starten" }));
      expect(screen.queryByRole("button", { name: "Hinweis anzeigen" })).not.toBeInTheDocument();
      for (const [index, answer] of ["ε", "abba, baa", "b, ab", "ababab", "caccc"].entries()) {
        await user.type(screen.getByRole("textbox", { name: "Deine Antwort" }), answer);
        await user.click(screen.getByRole("button", { name: "Antwort prüfen", exact: true }));
        expect(screen.getByRole("status")).toHaveTextContent("Richtig gelöst.");
        await user.click(screen.getByRole("button", { name: index === 4 ? "Runde auswerten" : "Nächste Aufgabe" }));
      }
      await user.click(screen.getByRole("button", { name: "Runde speichern", exact: true }));
    }
    await user.click(screen.getByRole("button", { name: "Lernübersicht öffnen" }));
    const unit = screen.getByRole("button", { name: "Reguläre Ausdrücke lesen und anwenden" }).closest("li");
    expect(within(unit).getByText("Abgeschlossen")).toBeVisible();
    expect(within(unit).getByText("2 vollständig")).toBeVisible();
    expect(within(unit).getByText("2 fehlerfrei")).toBeVisible();
    const state = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1"));
    expect(state.evidence["fsa-regulaere-ausdruecke"]).toHaveLength(2);
  });

  it("preserves regex learning hints and input after reload without awarding assessment evidence", async () => {
    window.history.replaceState({}, "", "/trainer/fsa-pruefungstraining?einheit=fsa-regulaere-ausdruecke");
    const user = userEvent.setup();
    const view = render(<App />);
    const heading = await screen.findByRole("heading", { name: "Reguläre Ausdrücke lesen und anwenden" });
    const card = heading.closest("article");
    await user.click(within(card).getByText("Erklären & üben"));
    expect(within(card).getByRole("heading", { name: "Ein Ausdruck beschreibt eine Menge von Wörtern." })).toBeVisible();
    await user.click(within(card).getByRole("button", { name: "Mit Hinweisen üben" }));
    await user.click(screen.getByRole("button", { name: "Hinweis anzeigen" }));
    await user.type(screen.getByRole("textbox", { name: "Deine Antwort" }), "epsilon");
    const first = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1")).activeSession;
    view.unmount();
    render(<App />);
    expect(await screen.findByRole("textbox", { name: "Deine Antwort" })).toHaveValue("epsilon");
    expect(screen.getByRole("button", { name: "Hinweis anzeigen" })).toBeDisabled();
    const restored = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1")).activeSession;
    expect(restored.id).toBe(first.id);
    expect(restored.mode).toBe("learn");
    await user.click(screen.getByRole("button", { name: "Antwort prüfen", exact: true }));
    await user.click(screen.getByRole("button", { name: "Runde abbrechen und Verlauf speichern" }));
    const state = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1"));
    expect(state.sessions[0]).toMatchObject({ mode: "learn", clean: false, completed: false });
    expect(state.sessions[0].taskResults[0]).toMatchObject({ helpUsed: true, correct: true });
    expect(state.evidence["fsa-regulaere-ausdruecke"]).toEqual([]);
  });

  it("credits two free same-day rounds and shows the same completion in the overview", async () => {
    window.history.replaceState({}, "", "/trainer/fsa-pruefungstraining");
    const user = userEvent.setup();
    const learningClock = () => Date.parse("2026-10-02T10:00:00+02:00");
    render(<App learningClock={learningClock} />);
    for (let run = 0; run < 2; run++) {
      const basics = await screen.findByRole("heading", { name: "Alphabet, Wörter und ε" });
      await user.click(within(basics.closest("article")).getByRole("button", { name: "Runde starten" }));
      for (const [index, answer] of ["0", "nein", "bba", "aa", "sprache"].entries()) {
        await user.type(screen.getByRole("textbox", { name: "Deine Antwort" }), answer);
        await user.click(screen.getByRole("button", { name: "Antwort prüfen", exact: true }));
        expect(screen.getByRole("status")).toHaveTextContent("Richtig gelöst.");
        await user.click(screen.getByRole("button", { name: index === 4 ? "Runde auswerten" : "Nächste Aufgabe" }));
      }
      expect(screen.getByText("5 von 5 Aufgaben im Erstversuch ohne Hilfe gelöst.")).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Runde speichern", exact: true }));
    }
    const state = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1"));
    expect(state.evidence["fsa-grundlagen"]).toHaveLength(2);
    expect(state.sessions[0].taskResults).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Lernübersicht öffnen" }));
    const unit = screen.getByRole("button", { name: "Alphabet, Wörter und Sprachen" }).closest("li");
    expect(within(unit).getByText("Abgeschlossen")).toBeVisible();
    expect(within(unit).getByText("2 vollständig")).toBeVisible();
  });

  it("preserves failed first attempts and a partial round through reload", async () => {
    window.history.replaceState({}, "", "/trainer/fsa-pruefungstraining");
    const user = userEvent.setup();
    const learningClock = () => Date.parse("2026-10-02T10:00:00+02:00");
    const view = render(<App learningClock={learningClock} />);
    const basics = await screen.findByRole("heading", { name: "Alphabet, Wörter und ε" });
    await user.click(within(basics.closest("article")).getByRole("button", { name: "Runde starten" }));
    await user.type(screen.getByRole("textbox", { name: "Deine Antwort" }), "1");
    await user.click(screen.getByRole("button", { name: "Antwort prüfen", exact: true }));
    view.unmount();
    render(<App learningClock={learningClock} />);
    expect(await screen.findByRole("textbox", { name: "Deine Antwort" })).toHaveValue("1");
    await user.click(screen.getByRole("button", { name: "Runde abbrechen und Verlauf speichern" }));
    const state = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1"));
    expect(state.taskHistory["fsa-grundlagen"][0]).toMatchObject({ correct: false });
    expect(state.evidence["fsa-grundlagen"]).toEqual([]);
  });
});

function seedPersonalState(exams, extra = {}) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    pins: [],
    recents: [],
    exams,
    ...extra,
  }));
}

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  window.localStorage.clear();
});

describe("semester library", () => {
  it("hides private courses from guests, including direct trainer links", () => {
    window.history.replaceState({}, "", "/bibliothek");
    const view = render(<App />);
    expect(screen.queryByRole("region", { name: "Privat" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Compilerbau" })).not.toBeInTheDocument();
    view.unmount();
    window.history.replaceState({}, "", "/trainer/pipeline-orchestrierung");
    render(<App />);
    expect(screen.getByRole("heading", { name: "Lernangebot nicht gefunden" })).toBeVisible();
  });

  it("shows shared examination dates only for course members", () => {
    window.history.replaceState({}, "", "/uebersicht");
    const view = render(<App />);
    expect(screen.queryByText(/Geplanter Prüfungstermin:/)).not.toBeInTheDocument();
    view.rerender(<App courseMember />);
    expect(screen.getAllByText(/Geplanter Prüfungstermin:/).length).toBeGreaterThan(0);
  });

  it("orders semesters before private courses and shows the empty first semester", () => {
    window.history.replaceState({}, "", "/bibliothek");
    render(<App allowPrivate />);
    expect(screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"))).toEqual([
      "3. Semester", "2. Semester", "1. Semester", "Privat",
    ]);
    expect(within(screen.getByRole("region", { name: "3. Semester" })).getByRole("heading", { name: "Datenbanken" })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "2. Semester" })).getByRole("heading", { name: "Analysis" })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Privat" })).getByRole("heading", { name: "Compilerbau" })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "1. Semester" })).getByText("Hier wartet noch Wissen im Dunkeln. Der erste Trainer macht das Licht an.")).toBeVisible();
  });

  it("hides empty sections while searching or filtering courses", async () => {
    window.history.replaceState({}, "", "/bibliothek");
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox", { name: "Bibliothek durchsuchen" }), "Mastermind");
    expect(screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"))).toEqual(["2. Semester"]);
    await user.clear(screen.getByRole("textbox", { name: "Bibliothek durchsuchen" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Kurs filtern" }), "Datenbanken");
    expect(screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"))).toEqual(["3. Semester"]);
    await user.type(screen.getByRole("textbox", { name: "Bibliothek durchsuchen" }), "xyzxyz");
    expect(screen.queryAllByRole("region")).toHaveLength(0);
    expect(screen.getByText("Keine passenden Lernangebote")).toBeVisible();
  });
});

describe("learning app navigation", () => {
  it("shows the ordered subject paths and transparent weekly plan with a working next-step action", async () => {
    window.history.replaceState({}, "", "/uebersicht");
    const user = userEvent.setup();
    render(<App learningClock={() => Date.parse("2026-10-02T11:00:00+02:00")} />);
    const plan = screen.getByRole("region", { name: "Mein Lernplan" });
    expect(within(plan).getByText(/Erfasste Rundendauer heute: 0 \/ 60 Min./)).toBeVisible();
    const days = within(plan).getByRole("list", { name: "Zeitbudget pro Wochentag" });
    expect(within(days).getAllByRole("listitem").map((day) => day.textContent)).toEqual(["Mo90 Min.", "Di90 Min.", "Mi90 Min.", "Do90 Min.", "Fr60 Min.", "SaFrei", "SoFrei"]);
    const fsaPath = screen.getByRole("list", { name: "Formale Sprachen: Lernreihenfolge" });
    expect(within(fsaPath).getAllByRole("button").map((button) => button.textContent)).toEqual(["Alphabet, Wörter und Sprachen", "Deterministische Wortläufe", "Reguläre Ausdrücke lesen und anwenden"]);
    const mathPath = screen.getByRole("list", { name: "Angewandte Mathematik: Lernreihenfolge" });
    expect(within(mathPath).getAllByRole("button").slice(-3).map((button) => button.textContent)).toEqual(["Fehlerfortpflanzung", "Stationäre Punkte und Hesse-Test", "Lagrange und Kandidatenvergleich"]);
    await user.click(within(plan).getByText("So entsteht dein Plan"));
    expect(within(plan).getByText(/Die Fachauswahl berücksichtigt/)).toBeVisible();
    await user.click(within(plan).getByRole("button", { name: "Jetzt starten" }));
    await waitFor(() => expect(window.location.pathname).toBe("/trainer/diagnose-mathe-3"));
    await user.click(await screen.findByRole("button", { name: "Zur Übersicht" }));
    expect(screen.getByRole("region", { name: "Mein Lernplan" })).toBeVisible();
  });

  it("shows a due review and starts it in review mode rather than as an assessment", async () => {
    const time = Date.parse("2026-10-01T10:00:00+02:00");
    const control = createLearningControl({ storage: window.localStorage, program: getSemesterLearningProgram(), clock: () => time });
    control.recordResult({ targetId: "fsa-grundlagen", roundId: "plan-review", mode: "assessment", startedAt: time, durationMinutes: 15, completed: true, tasks: [{ id: "task" }], taskResults: [{ id: "task", correct: true, firstAttempt: true }] });
    window.history.replaceState({}, "", "/uebersicht");
    const user = userEvent.setup();
    render(<App learningClock={() => Date.parse("2026-10-02T11:00:00+02:00")} />);
    const plan = screen.getByRole("region", { name: "Mein Lernplan" });
    expect(within(plan).getByText("Wiederholung · ca. 10 Min.")).toBeVisible();
    expect(within(plan).getByText("Fällig · 02.10.")).toBeVisible();
    await user.click(within(plan).getByRole("button", { name: "Jetzt starten" }));
    expect(await screen.findByText(/Aufgabe 1 von 5 · Lernrunde mit Hilfen/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Hinweis anzeigen" })).toBeVisible();
    const state = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1"));
    expect(state.activeSession.mode).toBe("review");
  });

  it("allows path navigation during an FSA round and restores the same draft without starting another attempt", async () => {
    window.history.replaceState({}, "", "/trainer/fsa-pruefungstraining?einheit=fsa-grundlagen");
    const user = userEvent.setup();
    render(<App />);
    const basics = await screen.findByRole("heading", { name: "Alphabet, Wörter und ε" });
    await user.click(within(basics.closest("article")).getByRole("button", { name: "Runde starten" }));
    await user.type(screen.getByRole("textbox", { name: "Deine Antwort" }), "0");
    const first = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1")).activeSession;
    let path = screen.getByRole("navigation", { name: "Lernreihenfolge" });
    await user.click(within(path).getByRole("button", { name: /DEA-Wortläufe und Akzeptanz/ }));
    expect(await screen.findByRole("heading", { name: "DEA-Wortläufe und Akzeptanz" })).toBeVisible();
    expect(screen.queryByRole("textbox", { name: "Deine Antwort" })).not.toBeInTheDocument();
    path = screen.getByRole("navigation", { name: "Lernreihenfolge" });
    await user.click(within(path).getByRole("button", { name: /Alphabet, Wörter und ε/ }));
    expect(await screen.findByRole("textbox", { name: "Deine Antwort" })).toHaveValue("0");
    const restored = JSON.parse(window.localStorage.getItem("lern-trainer-learning-control-v1")).activeSession;
    expect(restored.id).toBe(first.id);
    expect(restored.round.attemptStarted).toBe(false);
  });

  it("keeps an exam draft open after a storage failure and saves it on retry", async () => {
    seedPersonalState([{ id: "future", title: "Algorithmen", date: "2099-10-14", itemSlugs: ["merge-sort"] }]);
    window.history.replaceState({}, "", "/pruefungen");
    let failExamWrites = true;
    const storage = {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => {
        if (key === STORAGE_KEY && failExamWrites) throw new Error("Storage full");
        window.localStorage.setItem(key, value);
      },
    };
    const user = userEvent.setup();
    render(<App storage={storage} />);
    await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
    await user.clear(screen.getByLabelText("Prüfungsname"));
    await user.type(screen.getByLabelText("Prüfungsname"), "Algorithmen II");
    await user.click(screen.getByRole("button", { name: "Änderungen sichern" }));
    expect(screen.getByRole("alert")).toHaveTextContent("nicht dauerhaft gespeichert");
    expect(screen.getByLabelText("Prüfungsname")).toHaveValue("Algorithmen II");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).exams[0].title).toBe("Algorithmen");
    await user.click(screen.getByRole("button", { name: "Schließen", exact: true }));
    const dialog = screen.getByRole("dialog", { name: "Änderungen verwerfen?" });
    await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    failExamWrites = false;
    await user.click(screen.getByRole("button", { name: "Änderungen sichern" }));
    expect(screen.queryByLabelText("Prüfungsname")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).exams[0].title).toBe("Algorithmen II");
  });

  it("opens global search inside a trainer and selects a result with arrow keys", async () => {
    window.history.replaceState({}, "", "/trainer/dea-wortlauf");
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: /Ein Wort\. Ein Weg\./ });
    await user.keyboard("{Control>}k{/Control}");
    const search = screen.getByRole("combobox", { name: "Lernangebote durchsuchen" });
    await user.type(search, "angewandte");
    const options = screen.getAllByRole("option");
    const nextTitle = within(options[1]).getByText("Mehrdimensionale Funktionen & Ableitungen").textContent;
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(window.location.pathname).toBe("/trainer/mathe-funktionen"));
    expect(await screen.findByRole("heading", { name: nextTitle })).toBeVisible();
  });

  it("restores library filters when returning from a trainer", async () => {
    window.history.replaceState({}, "", "/bibliothek");
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox", { name: "Bibliothek durchsuchen" }), "wortlauf");
    await user.click(screen.getByRole("button", { name: "DEA-Wortlauf verstehen", exact: true }));
    await screen.findByRole("heading", { name: /Ein Wort\. Ein Weg\./ });
    await user.click(screen.getByRole("button", { name: "Zur Bibliothek" }));
    expect(screen.getByRole("textbox", { name: "Bibliothek durchsuchen" })).toHaveValue("wortlauf");
  });

  it("opens the selected mathematics unit from the five-subject overview", async () => {
    window.history.replaceState({}, "", "/uebersicht");
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("heading", { name: "Web Engineering 2" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Mehrdimensionale Kettenregel" }));
    expect(window.location.search).toContain("familie=3.3");
    expect(await screen.findByRole("heading", { name: "Mehrdimensionale Kettenregel" })).toBeVisible();
  });

  it("asks before closing a changed examination form", async () => {
    window.history.replaceState({}, "", "/pruefungen?neu");
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText("Prüfungsname"), "Mathe");
    await user.click(screen.getByRole("button", { name: "Schließen", exact: true }));
    const dialog = screen.getByRole("dialog", { name: "Änderungen verwerfen?" });
    await user.click(within(dialog).getByRole("button", { name: "Abbrechen" }));
    expect(screen.getByLabelText("Prüfungsname")).toHaveValue("Mathe");
  });

  it("filters the library after clicking its search field and opens search with the mouse", async () => {
    window.history.replaceState({}, "", "/bibliothek");
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Bibliothek durchsuchen" });
    await user.click(input);
    expect(input).toHaveFocus();
    await user.keyboard("cyk");
    expect(screen.getByText("2 Ergebnisse")).toBeVisible();
    expect(screen.getByRole("button", { name: "CYK verstehen", exact: true })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Kalter Einstiegstest · Angewandte Mathematik", exact: true })).not.toBeInTheDocument();
    await user.click(within(screen.getByRole("complementary", { name: "Hauptnavigation" })).getByRole("button", { name: "Suchen" }));
    expect(screen.getByRole("dialog", { name: "Lernangebote durchsuchen" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Lernangebote durchsuchen" })).toHaveFocus();
  });

  it("opens the first current search result with Enter and stays open when there are no matches", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("combobox", { name: "Lernangebote durchsuchen" });
    await user.type(input, "zzzzkeinangebot{Enter}");
    expect(screen.getByRole("dialog", { name: "Lernangebote durchsuchen" })).toBeVisible();
    expect(window.location.pathname).toBe("/");
    await user.clear(input);
    await user.type(input, "angewandte{Enter}");
    await waitFor(() => expect(window.location.pathname).toBe("/trainer/diagnose-mathe-3"));
    expect(screen.queryByRole("dialog", { name: "Lernangebote durchsuchen" })).not.toBeInTheDocument();
  });

  it("keeps the start page focused and opens the complete library", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Verstehen. Anwenden. Weiterkommen." })).toBeVisible();
    expect(screen.queryByText("DEA-Wortlauf verstehen")).not.toBeInTheDocument();

    const desktopNavigation = screen.getByRole("complementary", { name: "Hauptnavigation" });
    await user.click(within(desktopNavigation).getByRole("button", { name: "Bibliothek" }));

    expect(window.location.pathname).toBe("/bibliothek");
    expect(screen.getByRole("heading", { name: "Alle Lernangebote" })).toBeVisible();
    expect(screen.getByText("DEA-Wortlauf verstehen")).toBeVisible();
    expect(screen.getByText("Reguläre Ausdrücke · Prüfung")).toBeVisible();
  });

  it("starts the planned Monday mathematics diagnostic", async () => {
    const user = userEvent.setup();
    const learningClock = () => Date.parse("2026-09-28T05:30:00+02:00");
    render(<App learningClock={learningClock} />);

    expect(screen.getByRole("heading", { name: "Angewandte Mathematik" })).toBeVisible();
    expect(screen.getByText(/Kalter Einstiegstest · 25 Min/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));

    expect(window.location.pathname).toBe("/trainer/diagnose-mathe-3");
    expect(await screen.findByRole("heading", { name: /Angewandte Mathematik/ })).toBeVisible();
  });

  it("opens the Wortlauf pilot as a focused learning experience", async () => {
    window.history.replaceState({}, "", "/trainer/dea-wortlauf");
    render(<App />);

    expect(await screen.findByRole("heading", { name: /Ein Wort\. Ein Weg\./ })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Aufnahme vorbereiten" })).not.toBeInTheDocument();
  });

  it("edits and reorders a focus list", async () => {
    seedPersonalState([{
      id: "future",
      title: "Algorithmen",
      date: "2099-10-14",
      itemSlugs: ["analysis-klausur", "merge-sort"],
    }]);
    window.history.replaceState({}, "", "/pruefungen");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
    await user.clear(screen.getByLabelText("Prüfungsname"));
    await user.type(screen.getByLabelText("Prüfungsname"), "Algorithmen II");
    await user.click(screen.getByRole("button", { name: "Merge Sort nach oben" }));
    await user.click(screen.getByRole("button", { name: "Änderungen sichern" }));

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.exams[0]).toMatchObject({
      title: "Algorithmen II",
      itemSlugs: ["merge-sort", "analysis-klausur"],
    });

  });

  it("groups past exams and archives and restores an upcoming exam", async () => {
    seedPersonalState([
      { id: "past", title: "Alte Prüfung", date: "2000-01-01", itemSlugs: ["merge-sort"] },
      { id: "future", title: "Neue Prüfung", date: "2099-01-01", itemSlugs: ["analysis-klausur"] },
    ]);
    window.history.replaceState({}, "", "/pruefungen");
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Anstehend" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Vergangen" })).toBeVisible();
    await user.click(screen.getAllByRole("button", { name: "Archivieren" })[0]);
    expect(screen.getByRole("status")).toHaveTextContent("Neue Prüfung");

    const desktopNavigation = screen.getByRole("complementary", { name: "Hauptnavigation" });
    await user.click(within(desktopNavigation).getByRole("button", { name: "Archiv" }));
    expect(screen.getByRole("heading", { name: "Archivierte Prüfungen" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Neue Prüfung" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Wiederherstellen" }));
    expect(screen.getByText("Dein Archiv ist leer")).toBeVisible();
  });

  it("confirms permanent deletion from the archive and returns focus on cancel", async () => {
    seedPersonalState([{
      id: "archived",
      title: "Archivprüfung",
      date: "2020-01-01",
      itemSlugs: ["merge-sort"],
      archivedAt: "2026-09-20T10:00:00.000Z",
    }]);
    window.history.replaceState({}, "", "/archiv");
    const user = userEvent.setup();
    render(<App />);

    const deleteButton = screen.getByRole("button", { name: "Endgültig löschen" });
    await user.click(deleteButton);
    expect(screen.getByRole("dialog", { name: "Prüfung endgültig löschen?" })).toHaveTextContent("Archivprüfung");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(deleteButton).toHaveFocus());

    await user.click(deleteButton);
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Endgültig löschen" }));
    expect(screen.getByText("Dein Archiv ist leer")).toBeVisible();
  });

  it("persists the collapsed desktop sidebar", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole("button", { name: "Sidebar einklappen" }));
    expect(container.querySelector(".sidebar")).toHaveClass("collapsed");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).sidebarCollapsed).toBe(true);
    expect(screen.getByRole("button", { name: "Sidebar ausklappen" })).toBeVisible();
  });

  it("shows unavailable focus entries without silently deleting them", async () => {
    seedPersonalState([{
      id: "stale",
      title: "Gemischte Liste",
      date: "2099-03-01",
      itemSlugs: ["entfernter-trainer", "merge-sort"],
    }]);
    window.history.replaceState({}, "", "/pruefungen");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
    expect(screen.getByText("entfernter-trainer")).toBeVisible();
    expect(screen.getByText("Nicht mehr verfügbar")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Merge Sort entfernen" }));
    expect(screen.getByRole("button", { name: "Änderungen sichern" })).toBeDisabled();
  });

  it("protects a dirty exam draft during in-app navigation", async () => {
    seedPersonalState([{
      id: "future",
      title: "Prüfung",
      date: "2099-03-01",
      itemSlugs: ["merge-sort"],
    }]);
    window.history.replaceState({}, "", "/pruefungen");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Bearbeiten" }));
    await user.type(screen.getByLabelText("Prüfungsname"), " geändert");
    const desktopNavigation = screen.getByRole("complementary", { name: "Hauptnavigation" });
    await user.click(within(desktopNavigation).getByRole("button", { name: "Bibliothek" }));
    expect(screen.getByRole("dialog", { name: "Änderungen verwerfen?" })).toBeVisible();
    expect(window.location.pathname).toBe("/pruefungen");
    await user.click(screen.getByRole("button", { name: "Änderungen verwerfen" }));
    expect(window.location.pathname).toBe("/bibliothek");
  });
});
