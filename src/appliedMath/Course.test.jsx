import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import Course from "./Course.jsx";
import { exams } from "./exams.js";
import { EXAM_TIME, STORAGE_KEY, emptyState, startExam } from "./model.js";

afterEach(()=>{cleanup();window.localStorage.clear();window.history.replaceState({},"","/");vi.useRealTimers();});

it("diagnosis handles invalid, wrong, hint, second attempt, solution and a fresh task",async()=>{
  const user=userEvent.setup();render(<Course index={0}/>);
  await user.click(screen.getByRole("button",{name:"Zwischenschritte prüfen"}));
  expect(screen.getByRole("alert")).toHaveTextContent("Noch kein Rechenversuch");
  await user.type(screen.getByRole("textbox",{name:/Ergebnis/}),"2");
  await user.click(screen.getByRole("button",{name:"Zwischenschritte prüfen"}));
  expect(screen.getByRole("status")).toHaveTextContent("0/1");
  expect(screen.getByRole("textbox",{name:/Ergebnis/})).toHaveAttribute("aria-invalid","true");
  expect(screen.getByRole("textbox",{name:/Ergebnis/})).toHaveAccessibleDescription("Noch einmal prüfen");
  await user.click(screen.getByRole("button",{name:"Kein Ansatz"}));
  expect(screen.getByText("Nächster überschaubarer Schritt")).toBeVisible();
  await user.clear(screen.getByRole("textbox",{name:/Ergebnis/}));
  await user.type(screen.getByRole("textbox",{name:/Ergebnis/}),"12");
  await user.click(screen.getByRole("button",{name:"Zwischenschritte prüfen"}));
  expect(screen.getByRole("status")).toHaveTextContent("Erneuter Versuch");
  expect(screen.getByRole("textbox",{name:/Ergebnis/})).toHaveAttribute("aria-invalid","false");
  await user.click(screen.getByRole("button",{name:"Lösung anzeigen"}));
  expect(screen.getByText("Musterlösung · kein Beherrschungsnachweis")).toBeVisible();
  await user.click(screen.getByRole("button",{name:"Neue Diagnoseaufgabe"}));
  expect(screen.getByRole("textbox",{name:/Ergebnis/})).toHaveValue("");
  expect(screen.queryByText("Musterlösung · kein Beherrschungsnachweis")).not.toBeInTheDocument();
});

it("topic selection and the final transfer lead to the next unit without losing answers",async()=>{
  const user=userEvent.setup();render(<Course index={1}/>);
  await user.selectOptions(screen.getByRole("combobox",{name:"Dein Thema"}),"4.2");
  expect(screen.getByRole("heading",{name:"Sigmoid und lokale Ableitungen"})).toBeVisible();
  await user.click(screen.getByRole("button",{name:"6 Transfer"}));
  const input=screen.getAllByRole("textbox")[0];
  await user.type(input,"0,5");
  await user.click(screen.getByRole("button",{name:/Zur nächsten Lerneinheit/}));
  expect(screen.getByRole("heading",{name:"Verzweigte Pfade addieren"})).toBeVisible();
  expect(screen.getByRole("button",{name:"1 Erklärung"})).toHaveAttribute("aria-pressed","true");
  await user.selectOptions(screen.getByRole("combobox",{name:"Dein Thema"}),"4.2");
  await user.click(screen.getByRole("button",{name:"6 Transfer"}));
  expect(screen.getAllByRole("textbox")[0]).toHaveValue("0,5");
});

it("saved task inputs survive remount, linked repetition selects a new independent task",async()=>{
  window.history.replaceState({},"","/trainer/mathe-funktionen?familie=2.1");
  const seeded=emptyState();seeded.diagnostics={"diagnose-0":true};
  window.localStorage.setItem(STORAGE_KEY,JSON.stringify(seeded));
  const user=userEvent.setup();const view=render(<Course index={0}/>);
  expect(screen.getByText(/f=xy²\+x/)).toBeVisible();
  await user.type(screen.getByRole("textbox",{name:/fₓ/}),"2");
  await user.type(screen.getByRole("textbox",{name:/fᵧ/}),"4");
  await user.type(screen.getByRole("textbox",{name:/Dᵥf/}),"-4");
  await user.click(screen.getByRole("button",{name:"Zwischenschritte prüfen"}));
  expect(screen.getByRole("status")).toHaveTextContent("3/3");
  view.unmount();render(<Course index={0}/>);
  expect(screen.getByText(/Ein Temperaturfeld/)).toBeVisible();
  await user.click(screen.getByRole("button",{name:"5 Selbstständig"}));
  expect(screen.getByRole("textbox",{name:/Dᵥf/})).toHaveValue("-4");
  expect(screen.getByRole("status")).toHaveTextContent("3/3");
});

it("exam navigation persists answers, hides help, submits all sections and separates self points",async()=>{
  const user=userEvent.setup();render(<Course index={4}/>);
  await user.click(screen.getByRole("checkbox"));
  await user.click(screen.getByRole("button",{name:"Prüfung A starten"}));
  expect(screen.getByRole("timer")).toHaveTextContent("60:00");
  expect(screen.queryByRole("button",{name:"Lösung anzeigen"})).not.toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"A4-Merkzettelhilfe"})).not.toBeInTheDocument();
  for(const [i,task] of exams[0].tasks.entries()){
    await user.click(screen.getByRole("button",{name:`${i+1} · ${task.title}`}));
    const inputs=screen.getAllByRole("textbox");
    task.fields.forEach((field,j)=>fireEvent.change(inputs[j],{target:{value:String(field.answer)}}));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  }
  await user.click(screen.getByRole("button",{name:"1 · Feld und Messpfad"}));
  expect(screen.getByRole("textbox",{name:/Ausgabedimension/})).toHaveValue("1");
  await user.click(screen.getByRole("button",{name:"Prüfung abgeben …"}));
  await user.click(screen.getByRole("button",{name:"Endgültig abgeben"}));
  expect(screen.getByRole("heading",{name:"Abgabe: 80/100 · gemischte Bewertung"})).toBeVisible();
  for(const select of screen.getAllByRole("combobox").filter(el=>el.getAttribute("aria-label")?.includes("Selbstbewertung")))fireEvent.change(select,{target:{value:"2"}});
  expect(screen.getByRole("heading",{name:"Abgabe: 100/100 · gemischte Bewertung"})).toBeVisible();
  expect(screen.getByText(/Automatisch geprüft: 80\/80/)).toBeVisible();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

it("reload does not reset deadline, timeout freezes fields and labels interruption",()=>{
  vi.useFakeTimers();const now=Date.now();
  const seeded=startExam(emptyState(),exams[0],true,now-EXAM_TIME+1000);
  seeded.activeExam.answers={"a-feld":{0:"1"}};
  window.localStorage.setItem(STORAGE_KEY,JSON.stringify(seeded));
  render(<Course index={4}/>);
  expect(screen.getByRole("timer")).toHaveTextContent("00:01");
  expect(screen.getByText(/Unterbrochener\/fortgesetzter Lauf/)).toBeVisible();
  act(()=>vi.advanceTimersByTime(1001));
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  expect(screen.getByText(/Zeitlimit erreicht; Antworten eingefroren/)).toBeVisible();
  expect(screen.getByRole("heading",{name:"Abgabe: 2/100 · gemischte Bewertung"})).toBeVisible();
  const saved=JSON.parse(window.localStorage.getItem(STORAGE_KEY));
  expect(saved.examHistory[0].deadline).toBe(now+1000);
  expect(saved.examHistory[0].interrupted).toBe(true);
});

it("reset is scoped to mathematics and requires an explicit inline action",async()=>{
  window.localStorage.setItem("lern-trainer-personal-v1",JSON.stringify({pins:["mathe-funktionen"]}));
  const state=emptyState();state.notes="Meine Formeln";window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const user=userEvent.setup();render(<Course index={4}/>);
  await user.click(screen.getByRole("button",{name:"Mathe-Lernstand zurücksetzen …"}));
  await user.click(screen.getByRole("button",{name:"Nur Mathe-Lernstand löschen"}));
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).notes).toBe("");
  expect(JSON.parse(window.localStorage.getItem("lern-trainer-personal-v1")).pins).toEqual(["mathe-funktionen"]);
});
