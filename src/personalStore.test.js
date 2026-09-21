import test from "node:test";
import assert from "node:assert/strict";

import { createPersonalStore } from "./personalStore.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("pins, recent items, and exams survive creating a new store", () => {
  const storage = memoryStorage();
  const firstSession = createPersonalStore(storage);

  firstSession.togglePin("dea-wortlauf");
  firstSession.recordOpen("cyk-verstehen");
  firstSession.recordOpen("dea-wortlauf");
  firstSession.saveExam({
    id: "fsa-2026",
    title: "Formale Sprachen",
    date: "2026-10-14",
    itemSlugs: ["dea-wortlauf", "cyk-verstehen"],
  });

  const restored = createPersonalStore(storage).getSnapshot();
  assert.deepEqual(restored.pins, ["dea-wortlauf"]);
  assert.deepEqual(restored.recents, ["dea-wortlauf", "cyk-verstehen"]);
  assert.deepEqual(restored.exams, [
    {
      id: "fsa-2026",
      title: "Formale Sprachen",
      date: "2026-10-14",
      itemSlugs: ["dea-wortlauf", "cyk-verstehen"],
    },
  ]);
  assert.equal(restored.sidebarCollapsed, false);
});

test("archives, edits, restores, and removes exams without losing their order", () => {
  const storage = memoryStorage();
  const store = createPersonalStore(storage);
  store.saveExam({
    id: "analysis-2026",
    title: "Analysis",
    date: "2026-12-10",
    itemSlugs: ["analysis-klausur", "merge-sort", "analysis-klausur"],
  });

  store.archiveExam("analysis-2026", "2026-09-21T10:00:00.000Z");
  store.saveExam({
    id: "analysis-2026",
    title: "Analysis II",
    date: "2026-12-12",
    itemSlugs: ["merge-sort", "analysis-klausur"],
  });
  assert.deepEqual(store.getSnapshot().exams[0], {
    id: "analysis-2026",
    title: "Analysis II",
    date: "2026-12-12",
    itemSlugs: ["merge-sort", "analysis-klausur"],
    archivedAt: "2026-09-21T10:00:00.000Z",
  });

  store.restoreExam("analysis-2026");
  assert.equal(store.getSnapshot().exams[0].archivedAt, undefined);
  store.removeExam("analysis-2026");
  assert.deepEqual(store.getSnapshot().exams, []);
});

test("persists the collapsed sidebar preference while accepting old saved data", () => {
  const storage = memoryStorage();
  storage.setItem("lern-trainer-personal-v1", JSON.stringify({
    pins: [],
    recents: [],
    exams: [{ id: "old", title: "Altbestand", date: "2026-10-10", itemSlugs: [] }],
  }));

  const store = createPersonalStore(storage);
  assert.equal(store.getSnapshot().sidebarCollapsed, false);
  store.setSidebarCollapsed(true);

  const restored = createPersonalStore(storage).getSnapshot();
  assert.equal(restored.sidebarCollapsed, true);
  assert.equal(restored.exams[0].archivedAt, undefined);
});
