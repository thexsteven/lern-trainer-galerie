export const LEARNING_CONTROL_KEY = "lern-trainer-learning-control-v1";
export const LEGACY_MATH_KEY = "lern-trainer-angewandte-mathe-v1";
export const LEGACY_MATH_BACKUP_KEY = "lern-trainer-angewandte-mathe-v1-backup-before-control";

const DAY = 86400000;

function emptyState() {
  return {
    version: 1,
    activeSession: null,
    sessions: [],
    due: {},
    evidence: {},
    failures: {},
    diagnosticScores: {},
    legacyMath: null,
  };
}

function dayKey(time) {
  return new Date(time).toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

function weekKey(time) {
  const date = new Date(`${dayKey(time)}T12:00:00`);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return dayKey(date.getTime());
}

function loadState(storage, now) {
  let warning = "";
  try {
    const raw = storage?.getItem(LEARNING_CONTROL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && Array.isArray(parsed.sessions) && parsed.due && parsed.evidence) {
        return { state: { ...emptyState(), ...parsed }, warning };
      }
      try { storage?.setItem(`${LEARNING_CONTROL_KEY}-corrupt-${Date.now()}`, raw); } catch { /* best effort */ }
      warning = "Der gespeicherte Lernstand war nicht lesbar und wurde separat gesichert.";
    }
  } catch {
    warning = "Der lokale Lernstand ist nicht lesbar. Fortschritt wird in dieser Sitzung nicht als dauerhaft gesichert dargestellt.";
  }

  const state = emptyState();
  try {
    const rawMath = storage?.getItem(LEGACY_MATH_KEY);
    if (rawMath) {
      if (!storage?.getItem(LEGACY_MATH_BACKUP_KEY)) storage?.setItem(LEGACY_MATH_BACKUP_KEY, rawMath);
      const math = JSON.parse(rawMath);
      state.legacyMath = {
        importedAt: now,
        sessionCount: Object.values(math?.sessions || {}).reduce((sum, runs) => sum + (Array.isArray(runs) ? runs.length : 0), 0),
        dueCount: Object.keys(math?.due || {}).length,
      };
    }
  } catch {
    warning ||= "Der bisherige Mathematik-Lernstand blieb unverändert, konnte aber nicht importiert werden.";
  }
  return { state, warning };
}

function completedSessions(state) {
  return state.sessions.filter((session) => session.completedAt);
}

function minutesForWeek(state, now, examId) {
  const currentWeek = weekKey(now);
  return completedSessions(state)
    .filter((session) => weekKey(session.completedAt) === currentWeek && (!examId || session.examId === examId))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
}

function minutesForDay(state, now, kind) {
  const currentDay = dayKey(now);
  return completedSessions(state)
    .filter((session) => dayKey(session.completedAt) === currentDay && (!kind || session.kind === kind))
    .reduce((sum, session) => sum + session.durationMinutes, 0);
}

function evidenceCount(state, targetId) {
  return new Set(state.evidence[targetId] || []).size;
}

function targetWorkedToday(state, targetId, now) {
  return completedSessions(state).some((session) => session.targetId === targetId && dayKey(session.completedAt) === dayKey(now));
}

function diagnosticCompleted(state, targetId) {
  return completedSessions(state).some((session) => session.targetId === targetId && session.kind === "diagnostic");
}

function levelForExam(state, examId) {
  const score = state.diagnosticScores[examId];
  if (!Number.isFinite(score)) return null;
  if (score < 60) return { code: "foundation", label: "Grundlagen aufbauen" };
  if (score < 80) return { code: "gaps", label: "Lücken gezielt schließen" };
  return { code: "transfer", label: "Anwendung und Transfer" };
}

function rankFocusTargets(state, program, now, targets) {
  const examMap = new Map(program.exams.map((exam) => [exam.id, exam]));
  return [...targets].sort((left, right) => {
    const leftExam = examMap.get(left.examId);
    const rightExam = examMap.get(right.examId);
    const leftRatio = minutesForWeek(state, now, left.examId) / leftExam.weeklyMinutes;
    const rightRatio = minutesForWeek(state, now, right.examId) / rightExam.weeklyMinutes;
    if (leftRatio !== rightRatio) return leftRatio - rightRatio;
    if (leftExam.priority !== rightExam.priority) return leftExam.priority - rightExam.priority;
    if (leftExam.date !== rightExam.date) return leftExam.date.localeCompare(rightExam.date);
    return left.id.localeCompare(right.id);
  });
}

function makeAction(target, exam, kind, minutes, reason, state) {
  const previous = completedSessions(state).filter((session) => session.targetId === target.id).length;
  return {
    id: `${kind}:${target.id}:${previous}`,
    targetId: target.id,
    trainerSlug: target.trainerSlug,
    examId: exam.id,
    examTitle: exam.title,
    examDate: exam.date,
    kind,
    relevance: target.relevance,
    minutes,
    source: target.source,
    reason,
    variant: previous % 2,
    level: levelForExam(state, exam.id),
  };
}

export function planNextAction(state, program, now = Date.now()) {
  const localDate = dayKey(now);
  const weekday = new Date(`${localDate}T12:00:00`).getDay();
  const dayLimit = program.dayMinutes[weekday] || 0;
  if (!dayLimit) return { action: null, status: "rest" };

  const todayMinutes = minutesForDay(state, now);
  const fixedWeekMinutes = minutesForWeek(state, now);
  const reserveUnlocked = Object.values(state.failures).some((count) => count >= 3);
  const weekLimit = program.fixedWeeklyMinutes + (reserveUnlocked ? program.reserveWeeklyMinutes : 0);
  const available = Math.min(dayLimit - todayMinutes, weekLimit - fixedWeekMinutes);
  if (available < program.minimumMinutes) return { action: null, status: "done" };

  const examMap = new Map(program.exams.map((exam) => [exam.id, exam]));
  const availableTargets = program.targets.filter((target) => {
    const exam = examMap.get(target.examId);
    return target.relevance !== "C" && target.availableFrom <= localDate && exam?.date >= localDate;
  });

  const reviewSpent = minutesForDay(state, now, "review");
  const dueTarget = availableTargets
    .filter((target) => state.due[target.id]?.at <= now && !targetWorkedToday(state, target.id, now))
    .sort((left, right) => state.due[left.id].at - state.due[right.id].at || examMap.get(left.examId).date.localeCompare(examMap.get(right.examId).date))[0];
  if (dueTarget && reviewSpent < program.reviewDailyMinutes) {
    const minutes = Math.min(10, available, program.reviewDailyMinutes - reviewSpent);
    return {
      action: makeAction(dueTarget, examMap.get(dueTarget.examId), "review", minutes, "Diese Wiederholung ist heute nach dem 1–3–7-Rhythmus fällig.", state),
      status: "ready",
    };
  }

  const diagnostic = availableTargets
    .filter((target) => target.kind === "diagnostic" && !diagnosticCompleted(state, target.id) && !targetWorkedToday(state, target.id, now))
    .sort((left, right) => left.availableFrom.localeCompare(right.availableFrom))[0];
  if (diagnostic) {
    return {
      action: makeAction(diagnostic, examMap.get(diagnostic.examId), "diagnostic", Math.min(diagnostic.minutes, available), diagnostic.reason, state),
      status: "ready",
    };
  }

  const focus = rankFocusTargets(
    state,
    program,
    now,
    availableTargets.filter((target) => target.kind === "focus" && evidenceCount(state, target.id) < 2 && !targetWorkedToday(state, target.id, now)),
  )[0];
  if (focus) {
    const minutes = Math.max(program.minimumMinutes, Math.min(focus.minutes, available));
    return {
      action: makeAction(focus, examMap.get(focus.examId), "focus", minutes, focus.reason, state),
      status: "ready",
    };
  }

  return { action: null, status: "done" };
}

export function createLearningControl({ storage, program, clock = () => Date.now() }) {
  const loaded = loadState(storage, clock());
  let state = loaded.state;
  let warning = loaded.warning;
  let snapshot;
  let snapshotDay;
  const listeners = new Set();

  const persist = () => {
    try {
      storage?.setItem(LEARNING_CONTROL_KEY, JSON.stringify(state));
    } catch {
      warning = "Der Lernstand ist aktuell nicht dauerhaft gespeichert.";
    }
  };

  const refresh = () => {
    const now = clock();
    snapshotDay = dayKey(now);
    const planned = state.activeSession
      ? { action: state.activeSession.action, status: "active" }
      : planNextAction(state, program, now);
    snapshot = {
      status: planned.status,
      action: planned.action,
      activeSession: state.activeSession,
      warning,
      todayMinutes: minutesForDay(state, now),
      weekMinutes: minutesForWeek(state, now),
      fixedWeeklyMinutes: program.fixedWeeklyMinutes,
      reserveWeeklyMinutes: program.reserveWeeklyMinutes,
      legacyMath: state.legacyMath,
    };
  };

  const commit = (next) => {
    state = next;
    persist();
    refresh();
    listeners.forEach((listener) => listener());
  };

  refresh();

  return {
    getSnapshot: () => {
      if (snapshotDay !== dayKey(clock())) refresh();
      return snapshot;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    startNow() {
      if (state.activeSession) return { sessionId: state.activeSession.id, path: `/trainer/${state.activeSession.action.trainerSlug}` };
      refresh();
      const action = snapshot.action;
      if (!action) return null;
      const now = clock();
      const activeSession = { id: `${now}-${action.id}`, startedAt: now, action };
      commit({ ...state, activeSession });
      return { sessionId: activeSession.id, path: `/trainer/${action.trainerSlug}` };
    },
    complete({ sessionId, result }) {
      const active = state.activeSession;
      if (!active || active.id !== sessionId) return { accepted: false, error: "UNKNOWN_SESSION" };
      const now = clock();
      const action = active.action;
      const elapsed = Math.max(1, Math.round((now - active.startedAt) / 60000));
      const durationMinutes = Math.max(1, Math.min(result.durationMinutes || elapsed, action.minutes));
      const session = {
        id: active.id,
        targetId: action.targetId,
        examId: action.examId,
        trainerSlug: action.trainerSlug,
        kind: action.kind,
        startedAt: active.startedAt,
        completedAt: now,
        durationMinutes,
        result: {
          outcome: result.outcome,
          helpUsed: Boolean(result.helpUsed),
          firstAttempt: result.firstAttempt !== false,
          verified: result.verified === true,
          score: Number.isFinite(result.score) ? result.score : null,
        },
      };

      const qualifies = session.result.outcome === "correct" && !session.result.helpUsed && session.result.firstAttempt && session.result.verified;
      const previousEvidence = state.evidence[action.targetId] || [];
      const evidenceDay = dayKey(now);
      const evidence = qualifies && !previousEvidence.includes(evidenceDay)
        ? { ...state.evidence, [action.targetId]: [...previousEvidence, evidenceDay] }
        : state.evidence;
      const previousDue = state.due[action.targetId];
      const stage = qualifies && previousDue?.at <= now ? Math.min((previousDue.stage || 0) + 1, 2) : 0;
      const due = result.outcome === "aborted" ? state.due : {
        ...state.due,
        [action.targetId]: { stage, at: active.startedAt + program.reviewIntervalsDays[stage] * DAY },
      };
      const failures = {
        ...state.failures,
        [action.targetId]: result.outcome === "incorrect" ? (state.failures[action.targetId] || 0) + 1 : qualifies ? 0 : (state.failures[action.targetId] || 0),
      };
      const diagnosticScores = Number.isFinite(result.score)
        ? { ...state.diagnosticScores, [action.examId]: result.score }
        : state.diagnosticScores;

      commit({
        ...state,
        activeSession: null,
        sessions: [...state.sessions, session],
        evidence,
        due,
        failures,
        diagnosticScores,
      });
      return { accepted: true, evidence: evidence[action.targetId]?.length || 0 };
    },
  };
}
