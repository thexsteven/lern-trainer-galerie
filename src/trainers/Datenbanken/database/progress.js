const STORAGE_KEY = "lern-trainer-database-progress-v1";

export function loadProgress(storage = window.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) || "null");
    return parsed && typeof parsed === "object" && parsed.attempts && typeof parsed.attempts === "object"
      ? parsed
      : { attempts: {} };
  } catch {
    return { attempts: {} };
  }
}

export function saveProgress(progress, storage = window.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Learning remains available if storage is blocked.
  }
}

export function recordAttempt(progress, item, result) {
  const previous = progress.attempts[item.id] || { count: 0, correct: 0, wrong: 0, unsure: 0 };
  return {
    attempts: {
      ...progress.attempts,
      [item.id]: {
        ...previous,
        count: previous.count + 1,
        correct: previous.correct + (result === "correct" ? 1 : 0),
        wrong: previous.wrong + (result === "wrong" ? 1 : 0),
        unsure: previous.unsure + (result === "unsure" ? 1 : 0),
        lastResult: result,
        lastAnsweredAt: new Date().toISOString(),
      },
    },
  };
}

export function priorityFor(item, progress) {
  const attempt = progress.attempts[item.id];
  if (!attempt) return 5;
  if (attempt.lastResult === "wrong") return 9;
  if (attempt.lastResult === "unsure") return 7;
  return Math.max(1, 4 - attempt.correct);
}

export function nextIndex(items, progress, currentIndex) {
  if (items.length < 2) return 0;
  const candidates = items
    .map((item, index) => ({ index, priority: priorityFor(item, progress) }))
    .filter(({ index }) => index !== currentIndex);
  const maxPriority = Math.max(...candidates.map(({ priority }) => priority));
  const best = candidates.filter(({ priority }) => priority === maxPriority);
  return best[Math.floor(Math.random() * best.length)].index;
}

export function getStats(items, progress) {
  const answered = items.filter((item) => progress.attempts[item.id]?.count > 0);
  const knowledge = items.reduce((sum, item) => {
    const result = progress.attempts[item.id]?.lastResult;
    return sum + (result === "correct" ? 1 : result === "unsure" ? 0.5 : 0);
  }, 0);
  const correct = Object.values(progress.attempts).reduce((sum, attempt) => sum + attempt.correct, 0);
  const wrong = Object.values(progress.attempts).reduce((sum, attempt) => sum + attempt.wrong, 0);
  return {
    answered: answered.length,
    correct,
    wrong,
    percent: items.length ? Math.round((answered.length / items.length) * 100) : 0,
    knowledgePercent: items.length ? Math.round((knowledge / items.length) * 100) : 0,
  };
}
