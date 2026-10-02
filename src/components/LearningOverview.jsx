import React from "react";

const accents = { fsa: "#00a78e", mathe: "#427be8", netz: "#008ca4", systemnah: "#d87132", web: "#9860d9" };

export default function LearningOverview({ learning, program, openItem, onStart }) {
  const units = learning.unitProgress || [];
  const sessions = learning.sessions || [];
  const progress = learning.totalProgressPercent || 0;
  const completed = units.filter((unit) => unit.completed).length;
  const recent = [...sessions].reverse().slice(0, 12);
  return <div className="page overview-page">
    <header className="overview-heading">
      <div><p className="eyebrow">DEIN LERNPLAN · SEMESTER 3</p><h1>Schritt für Schritt.</h1><p>Dein nächster Schritt, dein Zeitbudget und die Reihenfolge in jedem Fach.</p></div>
      <div className="overview-total"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" /><circle className="progress-orbit" cx="50" cy="50" r="42" pathLength="100" strokeDasharray={`${progress} 100`} /></svg><strong>{progress}<small>%</small></strong><span>Abschlussfortschritt</span></div>
    </header>
    <LearningPlan learning={learning} program={program} openItem={openItem} onStart={onStart} />
    <div className="overview-summary"><span><strong>{completed}/{units.length}</strong> Einheiten abgeschlossen</span><span><strong>{units.reduce((sum, unit) => sum + unit.attempts, 0)}</strong> Versuche</span><span><strong>{units.reduce((sum, unit) => sum + unit.completedRuns, 0)}</strong> vollständige Durchläufe</span></div>
    <p className="progress-explanation">Zwei fehlerfreie Nachweisrunden schließen eine Einheit ab. Der Prozentwert zeigt den Abschluss der hier aufgeführten Einheiten. Er ist keine Bewertung deines gesamten Wissens oder eine Aussage über die vollständige Prüfungsabdeckung.</p>
    {learning.warning && <p className="today-warning" role="status">{learning.warning}</p>}
    <section className="overview-subjects" aria-label="Fächer und Einheiten">
      {program.exams.map((exam) => {
        const subjectUnits = units.filter((unit) => unit.examId === exam.id).sort((left, right) => left.order - right.order);
        const subjectProgress = learning.examProgress?.find((subject) => subject.id === exam.id);
        const nextUnit = subjectUnits.find((unit) => !unit.completed);
        const diagnostic = program.targets.find((target) => target.examId === exam.id && target.kind === "diagnostic");
        const diagnosed = diagnostic && sessions.some((session) => session.targetId === diagnostic.id && session.completed);
        return <article className="subject-panel" key={exam.id} style={{ "--subject-accent": accents[exam.id] }}>
          <header><div><span className="subject-code">{exam.id.toUpperCase()}</span><h2>{exam.title}</h2></div><strong className="subject-percentage">{subjectProgress?.progressPercent || 0}<small>%</small></strong></header>
          <div className="subject-progress" role="progressbar" aria-label={`${exam.title}: Abschlussfortschritt`} aria-valuenow={subjectProgress?.progressPercent || 0} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${subjectProgress?.progressPercent || 0}%` }} /></div>
          <p className="subject-count">{subjectUnits.filter((unit) => unit.completed).length} von {subjectUnits.length} Einheiten abgeschlossen</p>
          <p className="subject-path-label">Empfohlene Reihenfolge · freie Auswahl möglich</p>
          {diagnostic && <button className="subject-diagnostic" onClick={() => openItem(diagnostic.trainerSlug, diagnostic.id)}>{diagnosed ? "Einstiegstest erneut öffnen" : "Zur Orientierung: Einstiegstest"}</button>}
          <ol className="overview-unit-list" aria-label={`${exam.title}: Lernreihenfolge`}>{subjectUnits.map((unit, index) => <li className={unit.id === nextUnit?.id ? "next-unit" : undefined} key={unit.id}>
            <span className={`unit-step${unit.completed ? " complete" : ""}`} aria-label={`Schritt ${index + 1}`}>{unit.completed ? "✓" : index + 1}</span>
            <div className="unit-step-content">
            <div className="unit-heading"><button onClick={() => openItem(unit.trainerSlug, unit.id)}>{unit.title}</button><span className={`round-marks${unit.completed ? " complete" : ""}`} aria-label={`${Math.min(unit.cleanRuns, 2)} von 2 fehlerfreien Nachweisen`}><i className={unit.cleanRuns >= 1 ? "filled" : ""} /><i className={unit.cleanRuns >= 2 ? "filled" : ""} /></span></div>
            {unit.id === nextUnit?.id && <span className="unit-next-label">Nächste Einheit in diesem Fach</span>}
            <p className="unit-order-reason">{unit.orderReason}</p>
            <div className="unit-counts"><span>{unit.attempts} Versuche</span><span>{unit.completedRuns} vollständig</span><span>{unit.cleanRuns} fehlerfrei</span></div>
            <div className="unit-status"><span>{unit.completed ? "Abgeschlossen" : unit.paused ? "Runde pausiert" : unit.cleanRuns === 1 ? "Ein Nachweis fehlt noch" : "Bereit zum Lernen"}</span>{unit.verification === "self" && <span>Selbst bewertet</span>}</div>
            </div>
          </li>)}</ol>
          {exam.id === "web" && <p className="subject-note">Praktische Projektarbeit gehört zur Vorbereitung. Diese Einheiten ersetzen keinen vollständigen Portfolio-Nachweis.</p>}
        </article>;
      })}
    </section>
    <section className="overview-history" aria-labelledby="history-title"><div className="section-heading"><div><p className="eyebrow">DEINE DURCHLÄUFE</p><h2 id="history-title">Zuletzt bearbeitet</h2></div></div>
      {!recent.length ? <p className="history-empty">Hier erscheint dein erster beendeter Versuch. Pausierte Runden bleiben bei ihrer Einheit erhalten.</p> : <ol>{recent.map((session) => {
        const unit = units.find((candidate) => candidate.id === session.targetId);
        const itemTitle = unit?.title || program.targets.find((candidate) => candidate.id === session.targetId)?.title || "Einstiegsdiagnose";
        const isLegacy = !session.mode;
        const diagnostic = session.mode === "diagnostic";
        return <li key={session.id}><div><strong>{itemTitle}</strong><span>{new Date(session.endedAt || session.completedAt || session.startedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" })} · {isLegacy ? "Bisherige Historie" : diagnostic ? "Einstiegsdiagnose" : session.mode === "assessment" ? "Nachweisrunde" : "Lernen / Wiederholen"}</span></div><span className={`history-result${session.clean ? " success" : ""}`}>{isLegacy ? "Früherer Lernblock" : diagnostic ? `${session.result.score} % richtig` : session.clean ? "Fehlerfreier Nachweis" : session.completed ? "Vollständig bearbeitet" : "Abgebrochen"}{session.verification === "self" ? " · selbst bewertet" : ""}</span></li>;
      })}</ol>}
    </section>
  </div>;
}

function LearningPlan({ learning, program, openItem, onStart }) {
  const action = learning.action;
  const target = program.targets.find((unit) => unit.id === action?.targetId);
  const weekdays = [[1, "Mo"], [2, "Di"], [3, "Mi"], [4, "Do"], [5, "Fr"], [6, "Sa"], [0, "So"]];
  const reviews = learning.dueReviews || [];
  const dateLabel = (date) => new Date(`${date}T12:00:00+02:00`).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: program.timezone });
  const actionMode = learning.activeSession?.mode;
  const modeLabel = action?.kind === "diagnostic" ? "Einstiegstest" : actionMode === "errors" ? "Fehlertraining" : action?.kind === "review" ? "Wiederholung" : actionMode === "learn" ? "Lernrunde" : "Nachweisrunde";
  return <section className="learning-plan" aria-label="Mein Lernplan">
    <div className="plan-next">
      <p className="eyebrow">{learning.status === "active" ? "DEINE OFFENE RUNDE" : "HEUTE · DEIN NÄCHSTER SCHRITT"}</p>
      {learning.todayDate && <p className="plan-date">{dateLabel(learning.todayDate)}</p>}
      {action ? <><span className="plan-subject">{action.examTitle}</span><h2>{target?.title || "Vorwissen prüfen"}</h2><p className="plan-mode">{modeLabel} · ca. {action.minutes} Min.</p><p className="plan-reason"><strong>Warum jetzt?</strong> {action.reason}</p>{target?.orderReason && <p className="plan-reason">{target.orderReason}</p>}<button className="primary-button" onClick={onStart}>{learning.status === "active" ? "Runde fortsetzen" : "Jetzt starten"}</button></> : <><h2>{learning.status === "rest" ? "Heute ist ein lernfreier Tag." : "Für heute ist kein weiterer Schritt eingeplant."}</h2><p>Du kannst freiwillig eine Einheit aus der Reihenfolge unten öffnen. Der Plan wird nach jeder gespeicherten Runde neu berechnet.</p></>}
      <p className="plan-time">Erfasste Rundendauer heute: {learning.todayMinutes} / {learning.dayLimit} Min. · Noch eingeplant: {learning.remainingMinutes} Min.</p>
    </div>
    <div className="plan-week">
      <h2>Dein Wochenrhythmus</h2><p>{program.fixedWeeklyMinutes} Min. pro Woche · {program.reserveWeeklyMinutes} Min. Reserve {learning.reserveUnlocked ? "freigeschaltet" : "bei wiederholten Schwierigkeiten"}</p>
      <ol className="plan-days" aria-label="Zeitbudget pro Wochentag">{weekdays.map(([day, label]) => <li key={day} className={program.dayMinutes[day] ? "" : "rest-day"}><strong>{label}</strong><span>{program.dayMinutes[day] ? `${program.dayMinutes[day] + (learning.reserveUnlocked ? program.reserveDailyMinutes : 0)} Min.` : "Frei"}</span></li>)}</ol>
      <p className="plan-time">Diese Woche erfasst: {learning.weekMinutes} / {learning.weekLimit} Min.</p>
      <ul className="plan-budgets" aria-label="Wochenbudget pro Fach">{program.exams.map((exam) => <li key={exam.id}><span style={{ "--subject-accent": accents[exam.id] }}>{exam.title}<small>{exam.date ? `Geplanter Prüfungstermin: ${new Date(`${exam.date}T12:00:00`).toLocaleDateString("de-DE")}` : "Prüfungstermin noch offen"}</small></span><strong>{exam.weeklyMinutes} Min.</strong></li>)}</ul>
      <details className="plan-rules"><summary>So entsteht dein Plan</summary><p>Eine offene Runde wird zuerst fortgesetzt. Danach folgen fällige Wiederholungen und noch offene Einstiegstests. Neue Nachweisrunden beginnen mit der ersten noch nicht abgeschlossenen Einheit eines Fachs. Die Fachauswahl berücksichtigt, welcher Anteil des Wochenbudgets bereits genutzt wurde; bei Gleichstand gilt: {[...program.exams].sort((left, right) => left.priority - right.priority).map((exam) => exam.title).join(" → ")}.</p><p>Wiederholungen sind ab dem Speichern nach {program.reviewIntervalsDays.join(" / ")} Tagen vorgesehen, höchstens {program.reviewDailyMinutes} Min. täglich. Die Reserve wird nach drei als falsch gespeicherten Runden derselben Einheit verfügbar: bis zu {program.reserveDailyMinutes} zusätzliche Minuten pro Lerntag, höchstens {program.reserveWeeklyMinutes} pro Woche. Der Plan vergibt keine festen künftigen Termine für einzelne Einheiten; er passt den nächsten Schritt an deinen gespeicherten Verlauf an. Du kannst die Reihenfolge frei wählen.</p><p>Zeitbudgets beziehen sich auf gespeicherte Rundendauern. Beim Wechsel in eine andere Runde wird die Pause abgezogen. Solange eine Runde aktiv bleibt, läuft ihre Dauer bis zum Speichern weiter.</p><p>Pro Einheit: Erklärung lesen → mit Hinweisen üben → selbstständig lösen → zwei fehlerfreie Nachweisrunden erreichen.</p></details>
    </div>
    <div className="plan-reviews"><h2>Deine nächsten Wiederholungen</h2>{reviews.length ? <ol>{reviews.map((review) => <li key={review.targetId}><button aria-label={`Einheit öffnen: ${review.title}`} onClick={() => openItem(review.trainerSlug, review.targetId)}>{review.title}</button><span>{new Date(review.at).toLocaleDateString("sv-SE", { timeZone: program.timezone }) <= learning.todayDate ? "Fällig" : "Geplant"} · {new Date(review.at).toLocaleDateString("de-DE", { timeZone: program.timezone, day: "2-digit", month: "2-digit" })}</span></li>)}</ol> : <p>Nach einer abgeschlossenen Lern- oder Nachweisrunde erscheinen hier die Wiederholungstermine.</p>}</div>
  </section>;
}
