import React, { useMemo, useState } from "react";
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

function Practice({ label, task, onSolved }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const solved = revealed && selected === task.answer;

  const check = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === task.answer) onSolved?.();
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
        <button className="ct-text-button" onClick={() => setShowHint((value) => !value)} type="button">
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

function Unit({ unit, completed, onComplete }) {
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [diagnosticChoice, setDiagnosticChoice] = useState(null);
  const [showDiagnosticResult, setShowDiagnosticResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [guidedSolved, setGuidedSolved] = useState(false);
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
          <Practice label="ANWENDUNG MIT HILFE" task={unit.guided} onSolved={() => setGuidedSolved(true)} />
          {guidedSolved && <Practice label="NEUE AUFGABE OHNE HILFE" task={unit.transfer} onSolved={onComplete} />}
          <section className="ct-reflection">
            <h3>Selbst herleiten</h3>
            <p>{unit.reflection}</p>
            <textarea aria-label="Eigene Herleitung" placeholder="Deine Herleitung – nur für deine Selbstreflexion, ohne automatische KI-Bewertung." />
          </section>
        </>
      )}
    </article>
  );
}

export default function CourseTrainer({ title, subtitle, course, units }) {
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState([]);
  const observations = useMemo(() => units.filter((_, index) => completed.includes(index)).map((unit) => unit.title), [completed, units]);

  const completeUnit = (index) => setCompleted((current) => current.includes(index) ? current : [...current, index]);

  return (
    <main className="ct-shell">
      <header className="ct-hero">
        <p className="ct-kicker">{course.toUpperCase()}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>

      <section className="ct-overview" aria-label="Materialübersicht">
        <div>
          <p className="ct-kicker">MATERIALÜBERSICHT</p>
          <h2>Vom Fundament zur Anwendung</h2>
          <p>Die Reihenfolge folgt den fachlichen Abhängigkeiten. Wähle eine Einheit; bekannte Grundlagen bleiben jederzeit erreichbar.</p>
        </div>
        <nav>
          {units.map((unit, index) => (
            <button className={active === index ? "active" : ""} key={unit.title} onClick={() => setActive(index)} type="button">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{unit.shortTitle}</strong><small>{completed.includes(index) ? "Bearbeitet" : "Offen"}</small></span>
            </button>
          ))}
        </nav>
      </section>

      <Unit key={active} unit={units[active]} completed={completed.includes(active)} onComplete={() => completeUnit(active)} />

      <footer className="ct-footer">
        <strong>Beobachtungen aus dieser Sitzung</strong>
        <p>{observations.length ? `Korrekt gelöste Transferaufgaben: ${observations.join(", ")}. Das ist eine Übungsbeobachtung, kein umfassender Verständnisnachweis.` : "Noch keine Transferaufgabe korrekt gelöst. Beim Wiedereinstieg: zuerst eine Aufgabe ohne Cheat Sheet versuchen und Hilfe erst bei Schwierigkeiten nutzen."}</p>
        <small>Ablenkende Gedanken kurz auf Papier oder in einer Notiz-App festhalten, dann zur Aufgabe zurückkehren.</small>
      </footer>
    </main>
  );
}
