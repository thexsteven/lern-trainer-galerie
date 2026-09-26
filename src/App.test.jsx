import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App.jsx";

const STORAGE_KEY = "lern-trainer-personal-v1";

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

describe("learning app navigation", () => {
  it("opens the first current search result with Enter and stays open when there are no matches", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("textbox", { name: "Lernangebote durchsuchen" });
    await user.type(input, "zzzzkeinangebot{Enter}");
    expect(screen.getByRole("dialog", { name: "Lernangebote durchsuchen" })).toBeVisible();
    expect(window.location.pathname).toBe("/");
    await user.clear(input);
    await user.type(input, "angewandte{Enter}");
    await waitFor(() => expect(window.location.pathname).toBe("/trainer/mathe-funktionen"));
    expect(screen.queryByRole("dialog", { name: "Lernangebote durchsuchen" })).not.toBeInTheDocument();
  });

  it("keeps the start page focused and opens the complete library", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Nicht überlegen. Einfach anfangen." })).toBeVisible();
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

    expect(screen.getByRole("heading", { name: "Mathematik 3" })).toBeVisible();
    expect(screen.getByText(/Kalter Einstiegstest · 25 Min/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Jetzt starten" }));

    expect(window.location.pathname).toBe("/trainer/diagnose-mathe-3");
    expect(await screen.findByRole("heading", { name: /Mathematik 3/ })).toBeVisible();
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
