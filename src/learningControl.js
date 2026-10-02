export const LEARNING_CONTROL_KEY = "lern-trainer-learning-control-v1";
export const LEGACY_MATH_KEY = "lern-trainer-angewandte-mathe-v1";
export const LEGACY_MATH_BACKUP_KEY = "lern-trainer-angewandte-mathe-v1-backup-before-control";

const DAY = 86400000;

function emptyState() {
  return {
    version: 1,
    roundModelVersion: 1,
    activeSession: null,
    pausedSessions: {},
    learningDrafts: {},
    legacyEvidence: {},
    sessions: [],
    due: {},
    evidence: {},
    failures: {},
    diagnosticScores: {},
    taskHistory: {},
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

function loadState(storage, now, program) {
  let warning = "";
  try {
    const raw = storage?.getItem(LEARNING_CONTROL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && Array.isArray(parsed.sessions) && parsed.due && parsed.evidence) {
        const restored = { ...emptyState(), ...parsed };
        if (!parsed.roundModelVersion) {
          restored.legacyEvidence = parsed.evidence;
          restored.evidence = {};
        }
        const knownTargets = new Set(program.targets.map((target) => target.id));
        const archiveRetiredSession = (session) => {
          if (!session || knownTargets.has(session.action?.targetId)) return false;
          if (!restored.sessions.some((previous) => previous.id === session.id)) {
            restored.sessions = [...restored.sessions, { ...session,
              targetId: session.action?.targetId, examId: session.action?.examId, trainerSlug: session.action?.trainerSlug,
              completedAt: now, durationMinutes: 0, legacy: true, roundModelVersion: undefined,
              legacyMode: session.mode, mode: undefined,
            }];
          }
          return true;
        };
        if (archiveRetiredSession(restored.activeSession)) restored.activeSession = null;
        restored.pausedSessions = Object.fromEntries(Object.entries(restored.pausedSessions).filter(([, session]) => !archiveRetiredSession(session)));
        return { state: restored, warning };
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
  return state.sessions.filter((session) => session.targetId === targetId && session.roundModelVersion === 1 && session.clean).length;
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
    if (leftExam.date !== rightExam.date) return (leftExam.date || "9999").localeCompare(rightExam.date || "9999");
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
    roundGoal: target.roundGoal,
  };
}

export function planNextAction(state, program, now = Date.now()) {
  const localDate = dayKey(now);
  const weekday = new Date(`${localDate}T12:00:00`).getDay();
  const baseDayLimit = program.dayMinutes[weekday] || 0;
  if (!baseDayLimit) return { action: null, status: "rest" };

  const todayMinutes = minutesForDay(state, now);
  const fixedWeekMinutes = minutesForWeek(state, now);
  const reserveUnlocked = Object.values(state.failures).some((count) => count >= 3);
  const dayLimit = baseDayLimit + (reserveUnlocked ? program.reserveDailyMinutes : 0);
  const weekLimit = program.fixedWeeklyMinutes + (reserveUnlocked ? program.reserveWeeklyMinutes : 0);
  const available = Math.min(dayLimit - todayMinutes, weekLimit - fixedWeekMinutes);
  if (available < program.minimumMinutes) return { action: null, status: "done" };

  const examMap = new Map(program.exams.map((exam) => [exam.id, exam]));
  const availableTargets = program.targets.filter((target) => {
    const exam = examMap.get(target.examId);
    return target.relevance !== "C" && target.availableFrom <= localDate && exam && (!exam.date || exam.date >= localDate);
  });

  const reviewSpent = minutesForDay(state, now, "review");
  const dueTarget = availableTargets
    .filter((target) => target.kind === "focus" && state.due[target.id]?.at <= now && !targetWorkedToday(state, target.id, now))
    .sort((left, right) => state.due[left.id].at - state.due[right.id].at || (examMap.get(left.examId).date || "9999").localeCompare(examMap.get(right.examId).date || "9999"))[0];
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
    availableTargets.filter((target) => target.kind === "focus" && evidenceCount(state, target.id) < 2
      && !program.targets.some((previous) => previous.kind === "focus" && previous.relevance !== "C"
        && previous.examId === target.examId && previous.order < target.order && evidenceCount(state, previous.id) < 2)),
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

// First evaluations and hints belong to a round and cannot be erased by a later draft.
function mergeTaskResults(previous = [], incoming = []) {
  const results = new Map(previous.filter((task) => task?.id && typeof task.correct === "boolean").map((task) => [task.id, task]));
  for (const task of incoming) {
    if (!task?.id || typeof task.correct !== "boolean") continue;
    const before = results.get(task.id);
    results.set(task.id, { ...before, ...task,
      firstAttempt: before ? before.firstAttempt === true && before.correct && task.firstAttempt === true : task.firstAttempt === true,
      helpUsed: Boolean(before?.helpUsed || task.helpUsed),
      hadError: Boolean(before?.hadError || before?.correct === false || task.correct === false || task.firstAttempt === false || task.firstCorrect === false),
    });
  }
  return [...results.values()];
}

function mergeRound(previous, incoming) {
  if (!incoming) return previous;
  const results = mergeTaskResults(previous?.taskResults || previous?.results, incoming.results || incoming.taskResults);
  return { ...previous, ...incoming,
    ...(previous?.tasks?.length ? { tasks: previous.tasks } : {}),
    ...(previous?.requiredTaskIds?.length || previous?.tasks?.length ? { requiredTaskIds: previous.requiredTaskIds || previous.tasks.map((task) => typeof task === "string" ? task : task.id) } : {}),
    results, taskResults: results,
    helpUsed: Boolean(previous?.helpUsed || incoming.helpUsed),
    hadError: Boolean(previous?.hadError || incoming.hadError || incoming.feedback?.correct === false || results.some((task) => task.hadError)),
    attemptStarted: Boolean(previous?.attemptStarted || incoming.attemptStarted || incoming.attempts > 0 || results.length),
  };
}

function normalizeMode(mode) {
  return mode === "focus" ? "assessment" : mode;
}

export function createLearningControl({ storage, program, clock = () => Date.now() }) {
  const loaded = loadState(storage, clock(), program);
  let state = loaded.state;
  let warning = loaded.warning;
  let snapshot;
  let snapshotDay;
  let sequence = 0;
  const listeners = new Set();

  const persist = () => {
    try {
      if (!storage) throw new Error("Storage unavailable");
      storage.setItem(LEARNING_CONTROL_KEY, JSON.stringify(state));
      warning = "";
      return true;
    } catch {
      warning = "Der Lernstand ist aktuell nicht dauerhaft gespeichert.";
      return false;
    }
  };

  const refresh = () => {
    const now = clock();
    snapshotDay = dayKey(now);
    const planned = state.activeSession
      ? { action: state.activeSession.action, status: "active" }
      : planNextAction(state, program, now);
    const unitProgress = program.targets.filter((target) => target.kind === "focus" && target.relevance !== "C").map((target) => {
      const runs = state.sessions.filter((session) => session.targetId === target.id && session.roundModelVersion === 1);
      const cleanRuns = runs.filter((session) => session.clean).length;
      const pending = state.activeSession?.action.targetId === target.id ? state.activeSession : state.pausedSessions[target.id];
      return { id: target.id, examId: target.examId, title: target.title || target.id, trainerSlug: target.trainerSlug, order: target.order, orderReason: target.orderReason,
        attempts: runs.filter((session) => session.attemptStarted).length + (pending?.round?.attemptStarted ? 1 : 0),
        completedRuns: runs.filter((session) => session.completed).length, cleanRuns,
        progressPercent: Math.min(100, cleanRuns * 50), completed: cleanRuns >= 2, paused: Boolean(pending),
        verification: runs.some((session) => session.verification === "self") ? "self" : "automatic" };
    });
    const examProgress = program.exams.map((exam) => {
      const units = unitProgress.filter((unit) => unit.examId === exam.id);
      const completedUnits = units.filter((unit) => unit.completed).length;
      return { id: exam.id, title: exam.title, units: units.length, completedUnits,
        progressPercent: units.length ? Math.round(units.reduce((sum, unit) => sum + unit.progressPercent, 0) / units.length) : 0 };
    });
    const baseDayLimit = program.dayMinutes[new Date(`${dayKey(now)}T12:00:00`).getDay()] || 0;
    const todayMinutes = minutesForDay(state, now);
    const weekMinutes = minutesForWeek(state, now);
    const reserveUnlocked = Object.values(state.failures).some((count) => count >= 3);
    const dayLimit = baseDayLimit ? baseDayLimit + (reserveUnlocked ? program.reserveDailyMinutes : 0) : 0;
    const weekLimit = program.fixedWeeklyMinutes + (reserveUnlocked ? program.reserveWeeklyMinutes : 0);
    const dueReviews = program.targets.filter((target) => target.kind === "focus" && target.relevance !== "C" && state.due[target.id])
      .map((target) => ({ targetId: target.id, examId: target.examId, title: target.title, trainerSlug: target.trainerSlug, at: state.due[target.id].at, stage: state.due[target.id].stage }))
      .sort((left, right) => left.at - right.at);
    snapshot = {
      status: planned.status, action: planned.action, activeSession: state.activeSession, pausedSessions: state.pausedSessions,
      program, sessions: state.sessions, unitProgress, examProgress, learningDrafts: state.learningDrafts,
      totalProgressPercent: unitProgress.length ? Math.round(unitProgress.reduce((sum, unit) => sum + unit.progressPercent, 0) / unitProgress.length) : 0,
      warning, todayDate: dayKey(now), todayMinutes, weekMinutes, dayLimit, reserveUnlocked, weekLimit, dueReviews,
      remainingMinutes: Math.max(0, Math.min(dayLimit - todayMinutes, weekLimit - weekMinutes)),
      fixedWeeklyMinutes: program.fixedWeeklyMinutes, reserveWeeklyMinutes: program.reserveWeeklyMinutes,
      legacyMath: state.legacyMath, legacyEvidence: state.legacyEvidence, taskHistory: state.taskHistory, evidence: state.evidence,
    };
  };

  const commit = (next) => {
    state = next;
    const persisted = persist();
    refresh();
    listeners.forEach((listener) => listener());
    return persisted;
  };

  const start = (action, mode, initialRound) => {
    const current = state.activeSession;
    const now = clock();
    if (current?.action.targetId === action.targetId) {
      if (!current.round && initialRound) commit({ ...state, activeSession: { ...current, round: mergeRound(null, initialRound) } });
      return { sessionId: current.id, path: `/trainer/${current.action.trainerSlug}` };
    }
    const pausedSessions = { ...state.pausedSessions };
    if (current) pausedSessions[current.action.targetId] = { ...current,
      accumulatedElapsedMs: (current.accumulatedElapsedMs || 0) + Math.max(0, now - (current.resumedAt ?? current.startedAt)), resumedAt: null,
    };
    const activeSession = pausedSessions[action.targetId] ? { ...pausedSessions[action.targetId], resumedAt: now } : {
      id: `${now}-${state.sessions.length}-${++sequence}-${action.targetId}`, startedAt: now, accumulatedElapsedMs: 0, resumedAt: now, action, mode: normalizeMode(mode), round: mergeRound(null, initialRound),
    };
    delete pausedSessions[action.targetId];
    commit({ ...state, activeSession, pausedSessions });
    return { sessionId: activeSession.id, path: `/trainer/${activeSession.action.trainerSlug}` };
  };

  const record = (input, active = null) => {
    const target = program.targets.find((candidate) => candidate.id === input.targetId);
    if (!target || !input.roundId) return { accepted: false, persisted: false, error: "UNKNOWN_TARGET_OR_ROUND" };
    const duplicate = state.sessions.find((session) => session.targetId === input.targetId && session.roundId === input.roundId);
    if (duplicate) return { accepted: true, persisted: commit(state), duplicate: true, evidence: evidenceCount(state, target.id) };
    const round = mergeRound(active?.round, input);
    const taskResults = round.taskResults;
    const requiredTaskIds = [...new Set(round.requiredTaskIds || (round.tasks || []).map((task) => typeof task === "string" ? task : task.id))];
    const completed = input.completed !== false && (target.kind === "diagnostic" && Number.isFinite(input.score) || requiredTaskIds.length > 0 && requiredTaskIds.every((id) => taskResults.some((task) => task.id === id)));
    const verification = input.verification === "self" ? "self" : "automatic";
    const mode = normalizeMode(active?.mode || input.mode || "assessment");
    const requiredResults = taskResults.filter((task) => requiredTaskIds.includes(task.id));
    const unaidedSuccess = target.kind === "focus" && ["assessment", "review"].includes(mode) && verification === "automatic" && completed && !round.helpUsed && !round.hadError
      && requiredResults.every((task) => task.correct && task.firstAttempt === true && !task.helpUsed && !task.hadError);
    const clean = mode === "assessment" && unaidedSuccess;
    const now = input.endedAt || clock();
    const startedAt = active?.startedAt || input.startedAt || now;
    const elapsedMs = active
      ? (active.accumulatedElapsedMs || 0) + (active.id === state.activeSession?.id ? Math.max(0, now - (active.resumedAt ?? active.startedAt)) : 0)
      : Math.max(0, now - startedAt);
    const durationMinutes = Math.max(1, Number(input.durationMinutes) || Math.round(elapsedMs / 60000));
    const outcome = input.outcome === "aborted" ? "aborted" : target.kind === "diagnostic" && Number.isFinite(input.score) ? (input.score >= 80 ? "correct" : "incorrect") : completed ? (requiredResults.every((task) => task.correct) ? "correct" : "incorrect") : input.outcome || "aborted";
    const session = {
      id: active?.id || input.roundId, roundId: input.roundId, roundModelVersion: 1,
      targetId: target.id, examId: target.examId, trainerSlug: target.trainerSlug, kind: active?.action.kind || target.kind,
      mode, verification, startedAt, completedAt: now, durationMinutes, accumulatedElapsedMs: elapsedMs, resumedAt: null, taskResults, requiredTaskIds,
      completed, clean, attemptStarted: Boolean(round.attemptStarted),
      result: { outcome, helpUsed: Boolean(round.helpUsed || taskResults.some((task) => task.helpUsed)),
        firstAttempt: !round.hadError && taskResults.every((task) => task.firstAttempt), verified: verification === "automatic" && completed,
        score: Number.isFinite(input.score) ? input.score : null },
    };
    const previousDue = state.due[target.id];
    const stage = unaidedSuccess && previousDue?.at <= now ? Math.min((previousDue.stage || 0) + 1, 2) : 0;
    const evidence = { ...state.evidence, [target.id]: [...(state.evidence[target.id] || []), ...(clean ? [input.roundId] : [])] };
    const pausedSessions = { ...state.pausedSessions };
    if (active) delete pausedSessions[target.id];
    const persisted = commit({ ...state,
      activeSession: active?.id === state.activeSession?.id ? null : state.activeSession, pausedSessions,
      sessions: [...state.sessions, session], evidence,
      due: target.kind !== "focus" || outcome === "aborted" ? state.due : { ...state.due, [target.id]: { stage, at: now + program.reviewIntervalsDays[stage] * DAY } },
      failures: { ...state.failures, [target.id]: outcome === "incorrect" ? (state.failures[target.id] || 0) + 1 : clean ? 0 : (state.failures[target.id] || 0) },
      diagnosticScores: Number.isFinite(input.score) && target.kind === "diagnostic" ? { ...state.diagnosticScores, [target.examId]: input.score } : state.diagnosticScores,
      taskHistory: { ...state.taskHistory, [target.id]: [...new Map([...(state.taskHistory[target.id] || []), ...taskResults].map((task) => [task.id, task])).values()] },
    });
    return { accepted: true, persisted, evidence: evidenceCount(state, target.id) };
  };

  refresh();
  return {
    getSnapshot: () => { if (snapshotDay !== dayKey(clock())) refresh(); return snapshot; },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    startNow() {
      if (state.activeSession) return { sessionId: state.activeSession.id, path: `/trainer/${state.activeSession.action.trainerSlug}` };
      refresh();
      return snapshot.action ? start(snapshot.action, snapshot.action.kind === "focus" ? "assessment" : snapshot.action.kind, null) : null;
    },
    startTarget(targetId, mode = "assessment", initialRound = null) {
      const target = program.targets.find((candidate) => candidate.id === targetId);
      if (!target) return null;
      const exam = program.exams.find((candidate) => candidate.id === target.examId);
      const kind = target.kind === "diagnostic" ? "diagnostic" : ["review", "errors"].includes(mode) ? "review" : "focus";
      return start(makeAction(target, exam, kind, kind === "review" ? 10 : target.minutes, target.reason, state), mode, initialRound);
    },
    updateLearningDraft(targetId, draft) {
      if (!program.targets.some((target) => target.id === targetId && target.kind === "focus")) {
        return { accepted: false, persisted: false, error: "UNKNOWN_TARGET" };
      }
      const learningDrafts = { ...state.learningDrafts };
      if (draft === null) delete learningDrafts[targetId];
      else learningDrafts[targetId] = draft;
      return { accepted: true, persisted: commit({ ...state, learningDrafts }) };
    },
    updateRound(sessionId, round) {
      if (state.activeSession?.id === sessionId) {
        return commit({ ...state, activeSession: { ...state.activeSession, round: mergeRound(state.activeSession.round, round) } });
      }
      const paused = Object.values(state.pausedSessions).find((session) => session.id === sessionId);
      if (!paused) return false;
      return commit({ ...state, pausedSessions: { ...state.pausedSessions, [paused.action.targetId]: { ...paused, round: mergeRound(paused.round, round) } } });
    },
    recordResult(input) { return record(input); },
    recordDiagnostic(input) {
      const target = program.targets.find((candidate) => candidate.kind === "diagnostic" && (input.targetId ? candidate.id === input.targetId : candidate.examId === input.examId));
      if (!target) return { accepted: false, persisted: false, error: "UNKNOWN_DIAGNOSTIC" };
      return record({ ...input, targetId: target.id, mode: "diagnostic", outcome: Number(input.score) >= 80 ? "correct" : "incorrect" });
    },
    complete({ sessionId, result = {} }) {
      const active = state.activeSession?.id === sessionId ? state.activeSession : Object.values(state.pausedSessions).find((session) => session.id === sessionId);
      if (!active) {
        const previous = state.sessions.find((session) => session.id === sessionId);
        return previous ? { accepted: true, persisted: commit(state), duplicate: true, evidence: evidenceCount(state, previous.targetId) } : { accepted: false, persisted: false, error: "UNKNOWN_SESSION" };
      }
      return record({ ...result, targetId: active.action.targetId, roundId: sessionId, completed: result.outcome === "aborted" ? false : result.completed }, active);
    },
  };
}
