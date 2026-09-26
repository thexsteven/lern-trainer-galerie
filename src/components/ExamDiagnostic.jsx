import React, { useMemo, useState } from "react";
import { examDiagnostics } from "../examDiagnostics.js";
import "./examDiagnostic.css";

export default function ExamDiagnostic({ item, learningSession, onLearningResult }) {
  const diagnostic = examDiagnostics[item?.diagnosticId];
  const variant = learningSession?.action?.variant || 0;
  const questions = useMemo(() => diagnostic?.variants[variant % diagnostic.variants.length] || [], [diagnostic, variant]);
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!diagnostic) return <main className="diagnostic-shell"><h1>Diagnose nicht verfügbar</h1></main>;

  const evaluate = () => {
    const correct = questions.reduce((sum, question, index) => sum + (answers[index] === question[2] ? 1 : 0), 0);
    setResult({ correct, score: Math.round((correct / questions.length) * 100) });
  };

  const save = () => {
    if (!result || saved) return;
    setSaved(true);
    onLearningResult?.({
      outcome: result.score >= 80 ? "correct" : "incorrect",
      verified: true,
      firstAttempt: true,
      helpUsed: false,
      score: result.score,
    });
  };

  const level = result?.score < 60 ? "Grundlagen aufbauen" : result?.score < 80 ? "Lücken gezielt schließen" : "Anwendung und Transfer";

  return (
    <main className="diagnostic-shell">
      <header className="diagnostic-hero">
        <p className="diagnostic-kicker">KALTER EINSTIEGSTEST · RELEVANZ B</p>
        <h1>{diagnostic.title}</h1>
        <p>Ohne Nachschlagen und ohne Hilfsmittel. Das Ergebnis bestimmt nur deinen nächsten Lernschritt, nicht deine Note.</p>
        <small>Quelle: {diagnostic.source}</small>
      </header>

      <ol className="diagnostic-list">
        {questions.map(([question, choices], questionIndex) => (
          <li key={question}>
            <fieldset disabled={Boolean(result)}>
              <legend>{question}</legend>
              {choices.map((choice, choiceIndex) => (
                <label key={choice}>
                  <input
                    type="radio"
                    name={`diagnostic-${questionIndex}`}
                    checked={answers[questionIndex] === choiceIndex}
                    onChange={() => setAnswers((current) => current.map((value, index) => index === questionIndex ? choiceIndex : value))}
                  />
                  <span>{choice}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>

      {!result ? (
        <button className="diagnostic-primary" disabled={answers.some((answer) => answer === null)} onClick={evaluate}>Test auswerten</button>
      ) : (
        <section className="diagnostic-result" role="status">
          <p>Dein Ergebnis</p>
          <strong>{result.score} %</strong>
          <h2>{level}</h2>
          <p>{result.correct} von {questions.length} Antworten stimmen. Ein einzelner Test beendet keine Wiederholung; dafür sind zwei kalte Nachweise an verschiedenen Tagen nötig.</p>
          <button className="diagnostic-primary" disabled={saved} onClick={save}>{saved ? "Gespeichert" : "Auswertung speichern"}</button>
        </section>
      )}
    </main>
  );
}
