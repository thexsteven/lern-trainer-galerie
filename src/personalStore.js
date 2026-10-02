const STORAGE_KEY = "lern-trainer-personal-v1";
const EMPTY_STATE = { pins: [], recents: [], exams: [], sidebarCollapsed: false };

function load(storage) {
  try {
    const value = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
    if (!value || typeof value !== "object") return { ...EMPTY_STATE };
    return {
      pins: Array.isArray(value.pins) ? value.pins : [],
      recents: Array.isArray(value.recents) ? value.recents.slice(0, 3) : [],
      exams: Array.isArray(value.exams) ? value.exams : [],
      sidebarCollapsed: value.sidebarCollapsed === true,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function createPersonalStore(storage) {
  let state = load(storage);
  const listeners = new Set();

  const commit = (next, { requirePersistence = false } = {}) => {
    let persisted = true;
    try {
      if (!storage) throw new Error("Storage unavailable");
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      persisted = false;
      if (requirePersistence) return { accepted: false, persisted: false };
    }
    state = next;
    listeners.forEach((listener) => listener());
    return { accepted: true, persisted };
  };

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    togglePin(slug) {
      const pins = state.pins.includes(slug)
        ? state.pins.filter((item) => item !== slug)
        : [slug, ...state.pins];
      commit({ ...state, pins });
    },
    recordOpen(slug) {
      commit({
        ...state,
        recents: [slug, ...state.recents.filter((item) => item !== slug)].slice(0, 3),
      });
    },
    saveExam(exam) {
      const existing = state.exams.find((item) => item.id === exam.id);
      const nextExam = {
        id: exam.id,
        title: exam.title.trim(),
        date: exam.date,
        itemSlugs: [...new Set(exam.itemSlugs)],
        ...(existing?.archivedAt ? { archivedAt: existing.archivedAt } : {}),
      };
      return commit({
        ...state,
        exams: [...state.exams.filter((item) => item.id !== nextExam.id), nextExam]
          .sort((a, b) => a.date.localeCompare(b.date)),
      }, { requirePersistence: true });
    },
    removeExam(id) {
      commit({ ...state, exams: state.exams.filter((exam) => exam.id !== id) });
    },
    archiveExam(id, archivedAt = new Date().toISOString()) {
      commit({
        ...state,
        exams: state.exams.map((exam) => exam.id === id ? { ...exam, archivedAt } : exam),
      });
    },
    restoreExam(id) {
      commit({
        ...state,
        exams: state.exams.map((exam) => {
          if (exam.id !== id) return exam;
          const { archivedAt, ...restored } = exam;
          return restored;
        }),
      });
    },
    setSidebarCollapsed(sidebarCollapsed) {
      commit({ ...state, sidebarCollapsed: Boolean(sidebarCollapsed) });
    },
  };
}
