import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App.jsx";

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
  window.localStorage.clear();
});

describe("learning app navigation", () => {
  it("shows the complete catalog on the start page and opens the library", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("heading", { name: "Bereit für die nächste Prüfung." })).toBeVisible();
    expect(screen.getByText("DEA-Wortlauf verstehen")).toBeVisible();
    expect(screen.getByText("Reguläre Ausdrücke · Prüfung")).toBeVisible();

    const desktopNavigation = screen.getByRole("complementary", { name: "Hauptnavigation" });
    await user.click(within(desktopNavigation).getByRole("button", { name: "Bibliothek" }));

    expect(window.location.pathname).toBe("/bibliothek");
    expect(screen.getByRole("heading", { name: "Alle Lernangebote" })).toBeVisible();
  });

  it("opens the exam form directly from the start-page call to action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Prüfung anlegen" }));

    expect(window.location.pathname).toBe("/pruefungen");
    expect(screen.getByRole("heading", { name: "Prüfung planen" })).toBeVisible();
  });

  it("opens the Wortlauf pilot as a focused learning experience", async () => {
    window.history.replaceState({}, "", "/trainer/dea-wortlauf");
    render(<App />);

    expect(await screen.findByRole("heading", { name: /Ein Wort\. Ein Weg\./ })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Aufnahme vorbereiten" })).not.toBeInTheDocument();
  });
});
