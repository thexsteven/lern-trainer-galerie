import React, { useEffect, useMemo, useRef, useState } from "react";
import { examDiagnostics } from "../examDiagnostics.js";
import "./examDiagnostic.css";

export default function ExamDiagnostic({ item, learningSession, onRoundChange, onLearningResult }) {
  const diagnostic = examDiagnostics[item?.diagnosticId];
  const [variant] = useState(learningSession?.action?.variant || 0);
  const draft = learningSession?.round?.diagnosticId === item?.diagnosticId ? learningSession.round : null;
  const [roundId] = useState(() => draft?.roundId || learningSession?.id || `diagnostic:${item?.diagnosticId}:${crypto.randomUUID()}`);
  const [startedAt] = useState(() => draft?.startedAt || learningSession?.startedAt || Date.now());
  const [questions] = useState(() => draft?.questions || (diagnostic?.variants[variant % diagnostic.variants.length] || []).map(([question, choices, answer]) => {
    const order = choices.map((_, index) => index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
    }
    return [question, order.map((index) => choices[index]), order.indexOf(answer)];
  }));
  const [answers, setAnswers] = useState(() => draft?.answers || Array(questions.length).fill(null));
  const [result, setResult] = useState(draft?.result || null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveWarning, setSaveWarning] = useState("");
  const onRoundChangeRef = useRef(onRoundChange);
  onRoundChangeRef.current = onRoundChange;
  const sessionId = learningSession?.id;
  const requiredTaskIds = useMemo(() => questions.map((_, index) => `${item?.diagnosticId}:${variant}:${index}`), [questions, item?.diagnosticId, variant]);
  const taskResults = useMemo(() => result ? questions.map((question, index) => ({
    id: requiredTaskIds[index], correct: answers[index] === question[2], firstAttempt: true, helpUsed: false,
  })) : [], [result, questions, requiredTaskIds, answers]);

  useEffect(() => {
    if (!sessionId || !diagnostic) return;
    onRoundChangeRef.current?.({ diagnosticId: item.diagnosticId, roundId, startedAt, variant, questions, answers, result,
      requiredTaskIds, taskResults, attemptStarted: answers.some((answer) => answer !== null) });
  }, [sessionId, diagnostic, item?.diagnosticId, roundId, startedAt, variant, questions, answers, result, requiredTaskIds, taskResults]);

  if (!diagnostic) return <main className="diagnostic-shell"><h1>Diagnose nicht verfügbar</h1></main>;

  const evaluate = () => {
    const correct = questions.reduce((sum, question, index) => sum + (answers[index] === question[2] ? 1 : 0), 0);
    setResult({ correct, score: Math.round((correct / questions.length) * 100) });
  };

  const save = async () => {
    if (!result || saved || saving) return;
    setSaving(true);
    setSaveWarning("");
    try {
      const response = await onLearningResult?.({
        roundId,
        startedAt,
        requiredTaskIds,
        taskResults,
        completed: true,
        mode: "diagnostic",
        outcome: result.score >= 80 ? "correct" : "incorrect",
        verified: true,
        firstAttempt: true,
        helpUsed: false,
        score: result.score,
      });
      if (response?.accepted === true && response.persisted !== false) setSaved(true);
      else setSaveWarning("Die Auswertung wurde nicht dauerhaft gespeichert. Bitte versuche es erneut.");
    } catch {
      setSaveWarning("Die Auswertung konnte nicht gespeichert werden. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
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
          <p>{result.correct} von {questions.length} Antworten stimmen. Diese Diagnose hilft bei der Wahl deines nächsten Lernschritts. Eine Lerneinheit ist nach zwei fehlerfreien Nachweisrunden abgeschlossen.</p>
          <button className="diagnostic-primary" disabled={saved || saving} onClick={save}>{saved ? "Gespeichert" : saving ? "Wird gespeichert …" : "Auswertung speichern"}</button>
          {saveWarning && <p role="alert">{saveWarning}</p>}
        </section>
      )}
    </main>
  );
}
