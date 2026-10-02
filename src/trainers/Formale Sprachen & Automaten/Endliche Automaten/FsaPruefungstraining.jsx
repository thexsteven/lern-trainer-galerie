import React, { useEffect, useId, useState } from "react";
import { checkFsaAnswer, createFsaRound, DFA, FSA_GOALS } from "../../../fsaPractice.js";
import "./fsaPractice.css";

export default function FsaPruefungstraining({ learningControl, learningSession, learningProgress, onOpenUnit, onStartRound, onRoundChange, onLearningResult }) {
  const [mode, setMode] = useState("learn");
  const [selectedGoal, setSelectedGoal] = useState(() => new URLSearchParams(window.location.search).get("einheit"));
  const displayedSession = selectedGoal && learningSession?.action.targetId !== selectedGoal ? null : learningSession;
  const round = displayedSession?.round;
  const nextGoal = FSA_GOALS.find(goal => !learningProgress?.unitProgress?.find(item => item.id === goal.id)?.completed);
  const currentGoalId = FSA_GOALS.some(goal => goal.id === selectedGoal) ? selectedGoal : displayedSession?.action.targetId;
  const openGoal = (goalId) => { if (onOpenUnit) onOpenUnit(goalId); else setSelectedGoal(goalId); };
  const markLearningHelp = (goalId) => {
    const active = learningProgress?.activeSession;
    const pending = active?.action.targetId === goalId ? active : learningProgress?.pausedSessions?.[goalId];
    if (pending?.mode === "assessment" && pending.round && !pending.round.helpUsed) learningControl?.updateRound(pending.id, { ...pending.round, helpUsed: true });
  };
  const visibleGoals = FSA_GOALS.some(goal => goal.id === selectedGoal) ? FSA_GOALS.filter(goal => goal.id === selectedGoal) : FSA_GOALS;
  useEffect(() => {
    if (displayedSession && !round) onRoundChange(createFsaRound(displayedSession.action.roundGoal));
    if (displayedSession) setMode("assessment");
  }, [displayedSession?.id, Boolean(round)]);
  return <main className="fsa-shell">
    <header><p className="eyebrow">FORMALE SPRACHEN · PRÜFUNGSTRAINING</p><h1>Verstehen. Selbst lösen. Wiederholen.</h1><p>Fünf Aufgaben pro Runde · etwa 10–15 Minuten. Wiederholungen: etwa 10 Minuten, ohne erzwungenen Zeitabbruch.</p><small>Eigene Übungsvarianten zu Grundlagen, DEA und regulären Ausdrücken. Themenbezug: aktuelle Unterlagen zu regulären Sprachen, reguläre Ausdrücke PDF S. 2 und 5–6, DEA S. 7–14. Dieser Pilot deckt einen Teil des FSA-Stoffs ab.</small></header>
    <nav className="fsa-path" aria-label="Lernreihenfolge">
      <div className="fsa-path-heading"><strong>Dein Lernpfad</strong><span>{nextGoal ? "Schritt für Schritt – alle Einheiten bleiben frei wählbar." : "Alle Einheiten abgeschlossen. Weiter üben bleibt möglich."}</span></div>
      <ol>{FSA_GOALS.map((goal, index) => {
        const progress = learningProgress?.unitProgress?.find(item => item.id === goal.id);
        return <li key={goal.id}><button type="button" aria-current={currentGoalId === goal.id ? "step" : undefined} onClick={() => openGoal(goal.id)}><span className="fsa-path-number">{index + 1}</span><span><strong>{goal.title}</strong><small>{Math.min(2, progress?.cleanRuns || 0)}/2 Nachweise{nextGoal?.id === goal.id ? " · Als Nächstes" : progress?.completed ? " · Abgeschlossen" : ""}{currentGoalId === goal.id ? " · Aktuell" : ""}</small></span></button></li>;
      })}</ol>
    </nav>
    {learningProgress?.warning && <p role="alert">{learningProgress.warning}</p>}
    {!round && FSA_GOALS.some(goal => goal.id === selectedGoal) && <button className="text-button" onClick={() => setSelectedGoal("all")}>Alle Lernziele anzeigen</button>}
    {!round ? <section className="fsa-goals" aria-label="Lernziele">{visibleGoals.map((goal) => {
      const progress = learningProgress?.unitProgress?.find((item) => item.id === goal.id);
      const evidence = progress?.cleanRuns || 0;
      const errors = (learningProgress?.taskHistory?.[goal.id] || []).filter((task) => !task.correct || !task.firstAttempt || task.helpUsed).length;
      return <article key={goal.id}><h2>{goal.title}</h2><p>{evidence >= 2 ? "Abgeschlossen" : `${evidence}/2 Nachweisrunden`} · {errors} Aufgaben im Fehlertraining</p><p>{progress?.attempts || 0} Versuche · {progress?.completedRuns || 0} vollständige Runden</p><p>Zwei vollständige, fehlerfreie Runden im Erstversuch ohne Hilfe. Gleicher Tag und bekannte Varianten zählen; erreichte Abschlüsse bleiben erhalten.</p><button className="primary-button" onClick={() => onStartRound(goal.id, "assessment", createFsaRound(goal.goal))}>Runde starten</button><button className="secondary-button" disabled={!errors} onClick={() => onStartRound(goal.id, "errors", createFsaRound(goal.goal, learningProgress?.taskHistory?.[goal.id] || [], "errors"))}>Fehler trainieren</button><details onToggle={(event) => { if (event.currentTarget.open) markLearningHelp(goal.id); }}><summary>Erklären & üben</summary><Introduction goal={goal.goal} /><button className="secondary-button" onClick={() => { onStartRound(goal.id, "learn", createFsaRound(goal.goal)); setMode("learn"); }}>Mit Hinweisen üben</button></details></article>;
    })}<details><summary>Bisherige Runden</summary>{(learningProgress?.sessions || []).filter(run => run.examId === "fsa" && run.roundModelVersion === 1).slice(-5).reverse().map(run => <p key={run.id}>{FSA_GOALS.find(goal => goal.id === run.targetId)?.title || run.targetId} · {run.clean ? "Fehlerfrei · Nachweis zählt" : run.completed ? "Vollständig · kein fehlerfreier Nachweis" : "Abgebrochen"}</p>)}</details></section> : <Round key={displayedSession.id} round={round} session={displayedSession} onChange={onRoundChange} onComplete={onLearningResult} mode={displayedSession.mode || mode} />}
  </main>;
}

function Round({ round, session, onChange, onComplete, mode }) {
  const goal = FSA_GOALS.find((candidate) => candidate.goal === session.action.roundGoal);
  if (round.finished) {
    const cold = round.results.filter((task) => task.correct && task.firstAttempt && !task.helpUsed).length;
    return <section className="fsa-card"><h2>Runde abgeschlossen</h2><p>{cold} von 5 Aufgaben im Erstversuch ohne Hilfe gelöst.</p><p>Zwei vollständige, fehlerfreie Nachweisrunden schließen diese Einheit ab. Eine Lernrunde zählt nicht als Nachweis.</p><button className="primary-button" onClick={() => onComplete({ outcome: "completed" })}>Runde speichern</button></section>;
  }
  return <section className="fsa-card"><h2>{goal.title}</h2><p>Aufgabe {round.index + 1} von 5 · {mode === "assessment" ? "Nachweisrunde ohne Hilfe" : mode === "errors" ? "Gezieltes Fehlertraining" : "Lernrunde mit Hilfen"}</p>
    <Task key={round.tasks[round.index].id} round={round} onChange={onChange} mode={mode} />
    <button className="text-button" onClick={() => onComplete({ outcome: "aborted" })}>Runde abbrechen und Verlauf speichern</button>
  </section>;
}

function Introduction({ goal }) {
  if (goal === "regex") return <RegexIntroduction />;
  return <aside className="fsa-explanation"><h3>Kurz erklärt</h3>{goal === "basics" ? <p>Ein Alphabet ist eine Menge von Zeichen. Ein Wort ist eine endliche Zeichenfolge. ε ist das leere Wort und hat Länge 0. Eine Sprache ist eine Menge von Wörtern. Beispiel: ab · ba = abba, |abba| = 4 und ab · ε = ab.</p> : <><p>Starte in q0. Lies das Wort von links nach rechts und folge pro Zeichen einem Übergang. Erst nach dem gesamten Wort entscheidet der Endzustand über die Akzeptanz.</p><TransitionTable /><p>Beispiel aba: q0 → q0 → q1 → q1. Das Wort ist akzeptiert, weil q1 ein Endzustand ist.</p></>}</aside>;
}

function TransitionTable() {
  return <table className="fsa-table"><caption>DEA über {'{a,b}'} · Start: q0 · einziger Endzustand: q1</caption><thead><tr><th scope="col">Zustand</th><th scope="col">a</th><th scope="col">b</th></tr></thead><tbody>{DFA.transitions.map((row, state) => <tr key={state}><th scope="row">q{state}</th><td>q{row[0]}</td><td>q{row[1]}</td></tr>)}</tbody></table>;
}

function Task({ round, onChange, mode }) {
  const answer = round.answer || "";
  const acceptance = round.acceptance || "";
  const task = round.tasks[round.index];
  const done = round.feedback?.done;
  const check = (event) => {
    event.preventDefault();
    if (!answer.trim() || (task.type === "dfa" && !acceptance)) return;
    const correct = checkFsaAnswer(task, answer, acceptance);
    const attempts = round.attempts + 1;
    onChange({ ...round, attempts, feedback: { correct, done: true },
      results: [...round.results.filter((result) => result.id !== task.id), { id: task.id, correct, firstAttempt: attempts === 1, helpUsed: Boolean(round.taskHelpUsed) }] });
  };
  const next = () => onChange({ ...round, index: round.index + 1, attempts: 0, taskHelpUsed: false, feedback: null, answer: "", acceptance: "", finished: round.index === 4 });
  return <><h3>{task.prompt}</h3>{task.type === "regex" && <p className="fsa-answer-format">{task.answerFormat}</p>}{task.type === "dfa" && <><AutomatonDiagram /><TransitionTable /></>}
    <form onSubmit={check}><label>{task.type === "dfa" ? "Zustandsfolge einschließlich Startzustand (z. B. 0 0 1)" : "Deine Antwort"}<input value={answer} onChange={(event) => onChange({ ...round, answer: event.target.value })} required disabled={done} autoComplete="off" /></label>
      {task.type === "dfa" && <label>Wird das Wort akzeptiert?<select value={acceptance} onChange={(event) => onChange({ ...round, acceptance: event.target.value })} required disabled={done}><option value="">Bitte wählen</option><option value="true">Ja</option><option value="false">Nein</option></select></label>}
      {!done && <button className="primary-button" type="submit">{round.attempts ? "Zweiten Versuch prüfen" : "Antwort prüfen"}</button>}
    </form>
    {task.source && <small className="fsa-task-source">{task.source}</small>}
    {round.feedback && <p role="status">{round.feedback.correct ? "Richtig gelöst." : done ? "Die Antwort stimmt noch nicht. Diese Runde ist nicht fehlerfrei." : task.type === "dfa" ? "Zustandsfolge oder Akzeptanz stimmt noch nicht. Prüfe jeden Übergang und den Zustand nach dem letzten Zeichen." : "Die Antwort stimmt noch nicht. Prüfe die Definition und versuche es erneut."}</p>}
    {!done && mode !== "assessment" && <button className="secondary-button" disabled={round.taskHelpUsed} onClick={() => onChange({ ...round, helpUsed: true, taskHelpUsed: true })}>Hinweis anzeigen</button>}
    {round.taskHelpUsed && <aside className="fsa-explanation">{task.hint}</aside>}
    {done && !round.feedback.correct && <button className="secondary-button" onClick={() => onChange({ ...round, feedback: { ...round.feedback, done: false } })}>Antwort korrigieren</button>}
    {done && <aside className="fsa-explanation"><h4>Lösung und Erklärung</h4><p>{task.explanation}</p><p>{round.attempts > 1 || round.taskHelpUsed || !round.feedback.correct ? "Diese Aufgabe bleibt im Fehlertraining. Der Erstversuch bleibt gespeichert; diese Runde ist nicht fehlerfrei." : "Im Erstversuch ohne aufgerufene Hilfe richtig gelöst."}</p><button className="primary-button" onClick={next}>{round.index === 4 ? "Runde auswerten" : "Nächste Aufgabe"}</button></aside>}
  </>;
}

function AutomatonDiagram() {
  const marker = useId().replaceAll(":", "");
  return <svg className="fsa-automaton" viewBox="0 0 560 160" role="img" aria-label="DEA: Start q0, a bleibt in q0; b führt nach q1. q1 ist akzeptierend, a bleibt dort; b führt nach q2. q2 hat eine Schleife für a und b.">
    <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
    <g fill="none" stroke="currentColor" strokeWidth="2" markerEnd={`url(#${marker})`}><path d="M 15 95 H 70"/><path d="M 131 95 H 239"/><path d="M 301 95 H 409"/><path d="M 82 71 C 35 8 160 8 119 71"/><path d="M 252 71 C 205 8 330 8 289 71"/><path d="M 422 71 C 375 8 500 8 459 71"/></g>
    <g fill="var(--panel, #102236)" stroke="currentColor" strokeWidth="2"><circle cx="100" cy="95" r="30"/><circle cx="270" cy="95" r="30"/><circle cx="270" cy="95" r="24"/><circle cx="440" cy="95" r="30"/></g>
    <g fill="currentColor" textAnchor="middle" fontSize="18"><text x="100" y="101">q0</text><text x="270" y="101">q1</text><text x="440" y="101">q2</text><text x="185" y="82">b</text><text x="355" y="82">b</text><text x="100" y="20">a</text><text x="270" y="20">a</text><text x="440" y="20">a, b</text></g>
  </svg>;
}

function RegexIntroduction() {
  return <section className="fsa-regex-lesson" aria-label="Reguläre Ausdrücke erklärt">
    <p className="eyebrow">REGULÄRE AUSDRÜCKE · KONVENTIONEN DIESER LERNSTRECKE</p>
    <h3>Ein Ausdruck beschreibt eine Menge von Wörtern.</h3>
    <p>Ein Wort wird vollständig geprüft: Bei r = ab passt das Wort ab, aber weder a noch aba. L(r) bezeichnet die Sprache aller passenden Wörter. Alle Buchstaben sind kleingeschrieben.</p>
    <dl className="fsa-regex-operators"><div><dt>r + s</dt><dd>Vereinigung: ein Wort aus L(r) oder L(s). + bedeutet hier „oder“, nicht „mindestens einmal“.</dd></div><div><dt>rs oder r · s</dt><dd>Konkatenation: ein Wort aus L(r) direkt gefolgt von einem Wort aus L(s).</dd></div><div><dt>r*</dt><dd>Null, eine oder beliebig viele Wiederholungen von Wörtern aus L(r). Null Wiederholungen ergeben ε.</dd></div><div><dt>ε und ∅</dt><dd>ε ist das leere Wort, also L(ε) = {'{ε}'}. ∅ ist die leere Sprache: kein Wort, auch kein ε. Es gilt L(∅*) = {'{ε}'}.</dd></div></dl>
    <h4>Klammern zuerst, dann Stern, dann Konkatenation, zuletzt +</h4><p>a + bc* bedeutet: a oder b mit beliebig vielen c danach. (a+b)c* erlaubt dagegen auch ac. Der Stern in (ab)* wiederholt den ganzen Block ab; in ab* wiederholt er nur b.</p>
    <div className="fsa-regex-example"><p className="eyebrow">DURCHGEARBEITETES EIGENES BEISPIEL</p><h4>Wie entsteht ccac aus c*(a+b)c*?</h4><div className="fsa-regex-flow" aria-label="Zerlegung cc, a, c"><span>c*<b>cc</b><small>2 Wiederholungen</small></span><span aria-hidden="true">→</span><span>(a+b)<b>a</b><small>genau eine Wahl</small></span><span aria-hidden="true">→</span><span>c*<b>c</b><small>1 Wiederholung</small></span></div><p>Zusammen: cc · a · c = ccac. Das Wort enthält genau ein Zeichen aus {'{a,b}'}; alle übrigen Zeichen sind c. ccabc passt nicht, weil es sowohl a als auch b enthält.</p></div>
    <h4>Konkatenation Schritt für Schritt</h4><p>Bei (a+ε)bb gibt es zuerst zwei Möglichkeiten: a oder ε. Hänge danach immer bb an: a · bb = abb und ε · bb = bb. Also L((a+ε)bb) = {'{abb, bb}'}. ε ist kein zusätzliches sichtbares Zeichen.</p>
    <p>In der Lernrunde kannst du pro Aufgabe Hinweise aufrufen und Fehler korrigieren. Die selbstständige Nachweisrunde enthält fünf Aufgaben ohne Hinweise. Ein später korrigierter Fehler bleibt in der Erstbewertung erhalten.</p>
    <small>Eigene Grundlagen und Beispiele zum Themenbezug: „Reguläre Sprachen – Anmerkungen, Übungsaufgaben und Lösungen“, PDF S. 2 (Übung 2.10) und S. 5–6 (Übung 2.15). Diese Einheit prüft das Lesen und Anwenden; algebraische Äquivalenzbeweise und der Satz von Salomaa sind nicht Bestandteil dieses Nachweises.</small>
  </section>;
}
