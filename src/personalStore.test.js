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
});
