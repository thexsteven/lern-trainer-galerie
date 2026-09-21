const STORAGE_KEY = "lern-trainer-personal-v1";
const EMPTY_STATE = { pins: [], recents: [], exams: [] };

function load(storage) {
  try {
    const value = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
    if (!value || typeof value !== "object") return { ...EMPTY_STATE };
    return {
      pins: Array.isArray(value.pins) ? value.pins : [],
      recents: Array.isArray(value.recents) ? value.recents.slice(0, 3) : [],
      exams: Array.isArray(value.exams) ? value.exams : [],
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function createPersonalStore(storage) {
  let state = load(storage);
  const listeners = new Set();

  const commit = (next) => {
    state = next;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The app remains usable when storage is unavailable.
    }
    listeners.forEach((listener) => listener());
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
      const nextExam = {
        id: exam.id,
        title: exam.title.trim(),
        date: exam.date,
        itemSlugs: [...new Set(exam.itemSlugs)],
      };
      commit({
        ...state,
        exams: [...state.exams.filter((item) => item.id !== nextExam.id), nextExam]
          .sort((a, b) => a.date.localeCompare(b.date)),
      });
    },
    removeExam(id) {
      commit({ ...state, exams: state.exams.filter((exam) => exam.id !== id) });
    },
  };
}
