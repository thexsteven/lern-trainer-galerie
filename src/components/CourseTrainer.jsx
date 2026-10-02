import React, { useEffect, useState } from "react";
import "./courseTrainer.css";

function ChoiceList({ choices, selected, answer, revealed, locked = revealed, onSelect }) {
  return (
    <div className="ct-choices">
      {choices.map((choice, index) => {
        const isSelected = selected === index;
        const isCorrect = revealed && index === answer;
        const isWrong = revealed && isSelected && index !== answer;
        return (
          <button
            className={`${isSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
            disabled={locked}
            key={choice}
            onClick={() => onSelect(index)}
            type="button"
          >
            <span>{String.fromCharCode(65 + index)}</span>{choice}
          </button>
        );
      })}
    </div>
  );
}

function Practice({ label, task, onSolved, draft = {}, onDraft }) {
  const [selected, setSelected] = useState(draft.selected ?? null);
  const [revealed, setRevealed] = useState(draft.revealed || false);
  const [showHint, setShowHint] = useState(draft.showHint || false);
  const [helpUsed, setHelpUsed] = useState(draft.helpUsed || false);
  const [attempts, setAttempts] = useState(draft.attempts || 0);
  useEffect(() => { onDraft?.({ selected, revealed, showHint, helpUsed, attempts }); }, [selected, revealed, showHint, helpUsed, attempts]);
  const solved = revealed && selected === task.answer;

  const check = () => {
    if (selected === null) return;
    setAttempts((value) => value + 1);
    setRevealed(true);
    if (selected === task.answer) onSolved?.({
      outcome: "correct",
      verified: true,
      firstAttempt: attempts === 0,
      helpUsed,
    });
  };

  const retry = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <section className="ct-practice">
      <p className="ct-kicker">{label}</p>
      <h3>{task.title}</h3>
      <p>{task.prompt}</p>
      {task.hint && !revealed && (
        <button className="ct-text-button" onClick={() => { setHelpUsed(true); setShowHint((value) => !value); }} type="button">
          {showHint ? "Hinweis ausblenden" : "Hinweis verwenden"}
        </button>
      )}
      {showHint && !revealed && <div className="ct-hint">{task.hint}</div>}
      <ChoiceList choices={task.choices} selected={selected} answer={task.answer} revealed={revealed} onSelect={setSelected} />
      {!revealed && <button className="ct-primary" disabled={selected === null} onClick={check} type="button">Antwort prüfen</button>}
      {revealed && (
        <div className={`ct-feedback ${solved ? "success" : "error"}`} role="status">
          <strong>{solved ? "Richtig." : "Noch nicht."}</strong> {task.explanation}
          {!solved && <button className="ct-secondary" onClick={retry} type="button">Neu versuchen</button>}
        </div>
      )}
    </section>
  );
}

function Unit({ unit, completed, onComplete, draft = {}, onDraft }) {
  const [quizChoice, setQuizChoice] = useState(draft.quizChoice ?? null);
  const [quizChecked, setQuizChecked] = useState(draft.quizChecked ?? false);
  const [diagnosticChoice, setDiagnosticChoice] = useState(draft.diagnosticChoice ?? null);
  const [showDiagnosticResult, setShowDiagnosticResult] = useState(draft.showDiagnosticResult ?? false);
  const [showExplanation, setShowExplanation] = useState(draft.showExplanation ?? false);
  const [guidedSolved, setGuidedSolved] = useState(draft.guidedSolved ?? false);
  const [practiceDrafts, setPracticeDrafts] = useState(draft.practiceDrafts || {});
  const [reflection, setReflection] = useState(draft.reflection || "");
  useEffect(() => { onDraft?.({ quizChoice, quizChecked, diagnosticChoice, showDiagnosticResult, showExplanation, guidedSolved, practiceDrafts, reflection }); }, [quizChoice, quizChecked, diagnosticChoice, showDiagnosticResult, showExplanation, guidedSolved, practiceDrafts, reflection]);
  const quizCorrect = quizChecked && quizChoice === unit.quiz.answer;
  const quizWrong = quizChecked && quizChoice !== unit.quiz.answer;

  const retryQuiz = () => {
    setQuizChoice(null);
    setQuizChecked(false);
  };

  return (
    <article className="ct-unit">
      <header className="ct-unit-header">
        <div><p className="ct-kicker">LERNEINHEIT</p><h2>{unit.title}</h2></div>
        <span className={completed ? "ct-status done" : "ct-status"}>{completed ? "Bearbeitet" : "Offen"}</span>
      </header>

      <div className="ct-reading">
        <p className="ct-lead">{unit.lead}</p>
        {unit.sections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
            {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
          </section>
        ))}
        <div className="ct-example"><strong>Durchgearbeitetes Beispiel</strong><p>{unit.example}</p></div>
        <p className="ct-source">Quelle: {unit.source}</p>
      </div>

      <section className="ct-quiz">
        <p className="ct-kicker">QUIZ NACH DEM LESEN</p>
        <h3>{unit.quiz.question}</h3>
        <ChoiceList choices={unit.quiz.choices} selected={quizChoice} answer={unit.quiz.answer} revealed={quizCorrect} locked={quizChecked} onSelect={setQuizChoice} />
        {!quizChecked && <button className="ct-primary" disabled={quizChoice === null} onClick={() => setQuizChecked(true)} type="button">Antwort prüfen</button>}
        {quizCorrect && <div className="ct-feedback success" role="status"><strong>Richtig.</strong> {unit.quiz.explanation}</div>}

        {quizWrong && (
          <div className="ct-diagnostic">
            <p className="ct-kicker">ZWISCHENSCHRITT</p>
            <h3>{unit.diagnostic.question}</h3>
            <ChoiceList
              choices={[...unit.diagnostic.choices, "Kein Ansatz"]}
              selected={diagnosticChoice}
              answer={unit.diagnostic.answer}
              revealed={showDiagnosticResult}
              onSelect={setDiagnosticChoice}
            />
            {!showDiagnosticResult && <button className="ct-primary" disabled={diagnosticChoice === null} onClick={() => setShowDiagnosticResult(true)} type="button">Zwischenschritt prüfen</button>}
            {showDiagnosticResult && (
              <div className="ct-hint" role="status">
                <strong>Gezielter Hinweis:</strong> {diagnosticChoice === unit.diagnostic.choices.length ? unit.diagnostic.firstStep : unit.diagnostic.feedback}
                <div className="ct-inline-actions">
                  <button className="ct-secondary" onClick={retryQuiz} type="button">Quiz erneut versuchen</button>
                  <button className="ct-text-button" onClick={() => setShowExplanation((value) => !value)} type="button">{showExplanation ? "Erklärung schließen" : "Vollständige Erklärung"}</button>
                </div>
                {showExplanation && <p>{unit.quiz.explanation}</p>}
              </div>
            )}
          </div>
        )}
      </section>

      {quizCorrect && (
        <>
          {showDiagnosticResult && (
            <aside className="ct-cheat">
              <p className="ct-kicker">VORSCHLAG FÜR DEIN CHEAT SHEET</p>
              <strong>{unit.cheat.title}</strong>
              <p><b>Wann?</b> {unit.cheat.when}</p>
              <p><b>Vorgehen:</b> {unit.cheat.steps}</p>
              <p><b>Mini-Beispiel:</b> {unit.cheat.example}</p>
              <small>Schreibe den Eintrag auf Papier oder in deine eigene Notiz-App.</small>
            </aside>
          )}
          <Practice label="ANWENDUNG MIT HILFE" task={unit.guided} draft={practiceDrafts.guided} onDraft={(value) => setPracticeDrafts((current) => ({ ...current, guided: value }))} onSolved={() => setGuidedSolved(true)} />
          {guidedSolved && <Practice label="NEUE AUFGABE OHNE HILFE" task={unit.transfer} draft={practiceDrafts.transfer} onDraft={(value) => setPracticeDrafts((current) => ({ ...current, transfer: value }))} onSolved={onComplete} />}
          <section className="ct-reflection">
            <h3>Selbst herleiten</h3>
            <p>{unit.reflection}</p>
            <textarea value={reflection} onChange={(event) => setReflection(event.target.value)} aria-label="Eigene Herleitung" placeholder="Deine Herleitung – nur für deine Selbstreflexion, ohne automatische KI-Bewertung." />
          </section>
        </>
      )}
    </article>
  );
}

export function createCourseRound(unit, targetId) {
  return { tasks: [unit.quiz, unit.guided, unit.transfer].map((task, index) => ({ ...task, id: `${targetId}:${index}`, prompt: task.prompt || task.question })), answers: {}, results: [], helpUsed: false, finished: false };
}

export default function CourseTrainer({ title, subtitle, course, units, targetIds = [], learningControl, learningSession, learningProgress, onStartRound, onRoundChange, onLearningResult }) {
  const [active, setActive] = useState(() => Math.max(0, targetIds.indexOf(new URLSearchParams(window.location.search).get("einheit"))));
  const [mode, setMode] = useState(learningSession ? "assessment" : "learn");
  const [saved, setSaved] = useState("");
  const targetId = targetIds[active];
  const session = learningSession?.action.targetId === targetId ? learningSession : null;
  useEffect(() => {
    const index = targetIds.indexOf(learningSession?.action.targetId);
    if (index >= 0) { setActive(index); setMode("assessment"); }
  }, [learningSession?.id]);
  useEffect(() => {
    if (session && !session.round?.tasks?.length) onRoundChange?.(createCourseRound(units[active], targetId));
  }, [session?.id, session?.round, active]);
  useEffect(() => {
    if (mode !== "learn") return;
    const pending = session || learningProgress?.pausedSessions?.[targetId];
    if (pending?.mode === "assessment" && pending.round && !pending.round.helpUsed) learningControl?.updateRound(pending.id, { ...pending.round, helpUsed: true });
  }, [mode, targetId, session?.id, learningProgress?.pausedSessions?.[targetId]?.id]);
  const nextIndex = units.findIndex((_, index) => !learningProgress?.unitProgress?.find(item => item.id === targetIds[index])?.completed);
  const unit = units[active];
  const progress = learningProgress?.unitProgress?.find((item) => item.id === targetId);
  const start = () => { setSaved(""); setMode("assessment"); onStartRound?.(targetId, "assessment", createCourseRound(unit, targetId)); };
  return <main className="ct-shell">
    <header className="ct-hero"><p className="ct-kicker">{course.toUpperCase()}</p><h1>{title}</h1><p>{subtitle}</p></header>
    <section className="ct-overview" aria-label="Materialübersicht"><div><p className="ct-kicker">DEIN LERNPFAD</p><h2>Verstehen. Anwenden. Abschließen.</h2><p>Jede Einheit braucht zwei vollständige, fehlerfreie Nachweisrunden ohne Hilfe. Wiederholungen am selben Tag zählen. Erreichte Abschlüsse bleiben erhalten.</p><p className="ct-path-position">Schritt {active + 1} von {units.length} · {unit.shortTitle}. Alle Einheiten bleiben frei wählbar.</p></div><nav aria-label="Lernreihenfolge">{units.map((item, index) => <button className={active === index ? "active" : ""} aria-current={active === index ? "step" : undefined} key={item.title} onClick={() => { setActive(index); setMode("learn"); setSaved(""); }} type="button"><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.shortTitle}</strong><small>{Math.min(2, learningProgress?.unitProgress?.find((item) => item.id === targetIds[index])?.cleanRuns || 0)}/2 Nachweise{nextIndex === index ? " · Als Nächstes" : ""}{active === index ? " · Aktuell" : ""}</small></span></button>)}</nav></section>
    <div className="ct-mode" aria-label="Lernmodus"><button className={mode === "learn" ? "ct-primary" : "ct-secondary"} onClick={() => { if (session?.round) onRoundChange({ ...session.round, helpUsed: true }); setMode("learn"); }}>Erklären & üben</button>{targetId && <button className={mode === "assessment" ? "ct-primary" : "ct-secondary"} onClick={start}>{session ? session.mode === "assessment" ? "Nachweisrunde fortsetzen" : "Wiederholung fortsetzen" : "Nachweisrunde starten"}</button>}<span>{Math.min(2, progress?.cleanRuns || 0)}/2 fehlerfreie Runden · {progress?.attempts || 0} Versuche · {progress?.completedRuns || 0} vollständig</span></div>
    {learningProgress?.warning && <p className="ct-footer" role="alert">{learningProgress.warning}</p>}
    {saved && <p className="ct-footer" role="status">{saved}</p>}
    {mode === "learn" ? <Unit key={active} unit={unit} completed={false} draft={learningProgress?.learningDrafts?.[targetId]} onDraft={(draft) => learningControl?.updateLearningDraft(targetId, draft)} onComplete={() => {}} /> : session?.round ? <Assessment round={session.round} mode={session.mode} unit={unit} onChange={onRoundChange} onAbort={() => {
      const result = onLearningResult?.({ outcome: "aborted" });
      if (result?.accepted) { setSaved(result.persisted ? "Abgebrochene Runde im Verlauf gespeichert." : "Runde nur in dieser Sitzung abgebrochen. Dauerhaftes Speichern ist fehlgeschlagen."); setMode("learn"); }
    }} onComplete={() => {
      const result = onLearningResult?.({ outcome: "completed", verification: "automatic" });
      if (result?.accepted) { setSaved(result.persisted ? session.mode === "assessment" ? "Runde gespeichert. Dein Abschlussfortschritt ist aktualisiert." : "Wiederholung gespeichert. Lernrunden erhöhen den Abschlussfortschritt nicht." : "Runde nur in dieser Sitzung übernommen. Dauerhaftes Speichern ist fehlgeschlagen."); setMode("learn"); }
    }} /> : <p className="ct-footer">Starte eine Nachweisrunde für diese Einheit.</p>}
    <details className="ct-footer"><summary>Verlauf dieser Einheit</summary>{(learningProgress?.sessions || []).filter(run => run.targetId === targetId && run.roundModelVersion === 1).slice(-5).reverse().map(run => <p key={run.id}>{new Date(run.completedAt).toLocaleDateString("de-DE")} · {run.clean ? "Fehlerfrei · Nachweis zählt" : run.completed ? "Vollständig · kein fehlerfreier Nachweis" : "Abgebrochen"}</p>)}</details>
    <footer className="ct-footer"><strong>Lernen bleibt jederzeit möglich.</strong><p>Erklärungen, Hinweise und Selbstreflexion unterstützen das Lernen. Nur eigenständig gelöste Nachweisrunden erhöhen den Abschlussfortschritt.</p></footer>
  </main>;
}

function Assessment({ round, mode, unit, onChange, onComplete, onAbort }) {
  const assessment = mode === "assessment";
  const results = round.results || [];
  const answers = round.answers || {};
  const check = (task) => {
    if (answers[task.id] === undefined) return;
    const previous = results.find((result) => result.id === task.id);
    const correct = answers[task.id] === task.answer;
    const next = [...results.filter((result) => result.id !== task.id), { id: task.id, correct, firstAttempt: previous ? false : true, firstCorrect: previous?.firstCorrect ?? correct, helpUsed: Boolean(round.helpUsed) }];
    onChange({ ...round, results: next, finished: next.length === round.tasks.length });
  };
  return <article className="ct-unit"><header className="ct-unit-header"><div><p className="ct-kicker">{assessment ? "NACHWEISRUNDE" : "WIEDERHOLUNG · MIT HILFEN"}</p><h2>{assessment ? "Drei Aufgaben. Deine Lösung." : "Bekanntes festigen"}</h2><p>{results.length}/{round.tasks.length} Aufgaben abgegeben · Antworten werden gespeichert.</p></div></header>
    {!assessment && <div className="ct-reading"><p>Diese Wiederholung ist eine Lernrunde und erhöht den Abschlussfortschritt nicht.</p><details onToggle={(event) => { if (event.currentTarget.open) onChange({ ...round, helpUsed: true }); }}><summary>Erklärung und Beispiel</summary><p>{unit.lead}</p>{unit.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}<p>{unit.example}</p></details></div>}
    {assessment && round.helpUsed && <p className="ct-hint">Für diese Runde wurde Lernmaterial oder Hilfe geöffnet. Sie zählt nicht als selbstständiger Nachweis.</p>}
    {results.some((result) => !result.firstCorrect) && <p className="ct-hint">Diese Runde enthält einen Fehler. Korrekturen sind möglich; der Erstversuch bleibt erhalten.</p>}
    {round.tasks.map((task) => { const result = results.find((item) => item.id === task.id); return <section className="ct-practice" key={task.id}><h3>{task.prompt}</h3><ChoiceList choices={task.choices} selected={answers[task.id]} answer={task.answer} revealed={Boolean(result)} locked={Boolean(result?.correct)} onSelect={(answer) => onChange({ ...round, answers: { ...answers, [task.id]: answer } })} /><button className="ct-primary" disabled={answers[task.id] === undefined || result?.correct} onClick={() => check(task)}>Antwort prüfen</button>{result && <p role="status">{result.correct ? "Richtig." : "Noch nicht richtig. Du kannst korrigieren."} {task.explanation}</p>}</section>; })}
    <div className="ct-practice"><button className="ct-primary" disabled={!round.finished} onClick={onComplete}>{assessment ? "Runde abschließen" : "Wiederholung abschließen"}</button><button className="ct-secondary" onClick={onAbort}>Runde abbrechen und Verlauf speichern</button><p>Die erste gültige Abgabe je Aufgabe entscheidet. Gleiche Aufgaben dürfen in einer neuen Runde erneut gelöst werden.</p></div>
  </article>;
}
