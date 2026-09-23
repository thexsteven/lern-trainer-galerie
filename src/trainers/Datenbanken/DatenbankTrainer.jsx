import React, { useMemo, useState } from "react";
import {
  allItems,
  conceptChecks,
  difficulties,
  flashcards,
  modes,
  multipleChoice,
  schemaTasks,
  sqlChallenges,
  topics,
} from "./database/data.js";
import { evaluateSql } from "./database/sql.js";
import {
  getStats,
  loadProgress,
  nextIndex,
  recordAttempt,
  saveProgress,
} from "./database/progress.js";
import "./database/database.css";

const modeItems = { cards: flashcards, quiz: multipleChoice, sql: sqlChallenges, schema: schemaTasks, concept: conceptChecks };

function LevelBadge({ level }) {
  return <span className={`db-level ${level}`}>{difficulties[level]}</span>;
}

function ProgressBar({ value }) {
  return <div className="db-progress-track" aria-label={`${value} Prozent`}><span style={{ width: `${value}%` }} /></div>;
}

function SchemaDiagram({ item }) {
  return <div className="db-schema-diagram" aria-label="Datenbankschema">
    {item.entities.map((entity, index) => <React.Fragment key={entity}>
      <div className="db-entity"><strong>{entity}</strong><span>id · PK</span>{index > 0 && <span>… · Attribute</span>}</div>
      {index < item.entities.length - 1 && <div className="db-relation" aria-hidden="true"><span>──</span><b>{item.links[index]?.[1]}:{item.links[index]?.[2]}</b><span>──</span></div>}
    </React.Fragment>)}
  </div>;
}

function Flashcard({ item, onResult }) {
  const [flipped, setFlipped] = useState(false);
  return <div className="db-exercise-card">
    <div className={`db-flashcard${flipped ? " flipped" : ""}`}>
      <p className="db-card-side">{flipped ? "Antwort" : "Frage"}</p>
      <h2>{flipped ? item.answer : item.question}</h2>
    </div>
    {!flipped ? <button className="db-primary" onClick={() => setFlipped(true)}>Antwort aufdecken</button> : <div className="db-rating" aria-label="Antwort bewerten">
      <button className="wrong" onClick={() => onResult("wrong")}>Nicht gewusst</button>
      <button className="unsure" onClick={() => onResult("unsure")}>Unsicher</button>
      <button className="correct" onClick={() => onResult("correct")}>Gewusst</button>
    </div>}
  </div>;
}

function MultipleChoice({ item, onResult }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const correct = selected === item.correctAnswer;
  const select = (index) => {
    if (answered) return;
    setSelected(index);
    onResult(index === item.correctAnswer ? "correct" : "wrong", false);
  };
  return <div className="db-exercise-card">
    <h2>{item.question}</h2>
    <div className="db-options">{item.answers.map((answer, index) => <button key={answer} className={answered ? index === item.correctAnswer ? "is-correct" : index === selected ? "is-wrong" : "" : ""} onClick={() => select(index)} disabled={answered}><span>{String.fromCharCode(65 + index)}</span>{answer}</button>)}</div>
    {answered && <Feedback correct={correct} explanation={item.explanation} />}
  </div>;
}

function SqlChallenge({ item, onResult }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [solution, setSolution] = useState(false);
  const check = () => {
    const correct = evaluateSql(item, input);
    setResult(correct);
    onResult(correct ? "correct" : "wrong", false);
  };
  return <div className="db-exercise-card">
    <div className="db-table-preview"><strong>{item.schema[0]}</strong><code>{item.schema[1]}</code></div>
    <h2>{item.task}</h2>
    <label className="db-sql-editor"><span>SQL</span><textarea value={input} onChange={(event) => { setInput(event.target.value); setResult(null); }} spellCheck="false" placeholder="SELECT …" /></label>
    <div className="db-action-row"><button className="db-primary" onClick={check} disabled={!input.trim()}>Lösung prüfen</button><button className="db-secondary" onClick={() => setSolution((value) => !value)}>{solution ? "Musterlösung ausblenden" : "Musterlösung anzeigen"}</button></div>
    {solution && <pre className="db-solution"><code>{item.solution}</code></pre>}
    {result !== null && <Feedback correct={result} explanation={item.explanation} />}
  </div>;
}

function SchemaTask({ item, onResult }) {
  const choices = ["1:1", "1:n", "n:m / Junction Table", "Positions-Tabelle", "Mandant über company_id", "companies 1:n employees", "Junction Table"];
  const visibleChoices = useMemo(() => [item.answer, ...choices.filter((choice) => choice !== item.answer)].slice(0, 4).sort((a, b) => a.localeCompare(b)), [item]);
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const select = (choice) => {
    if (answered) return;
    setSelected(choice);
    onResult(choice === item.answer ? "correct" : "wrong", false);
  };
  return <div className="db-exercise-card">
    <h2>{item.task}</h2>
    <SchemaDiagram item={item} />
    <p className="db-prompt">Welche Modellierung beschreibt das Szenario am besten?</p>
    <div className="db-options compact">{visibleChoices.map((choice) => <button key={choice} className={answered ? choice === item.answer ? "is-correct" : choice === selected ? "is-wrong" : "" : ""} onClick={() => select(choice)} disabled={answered}>{choice}</button>)}</div>
    {answered && <Feedback correct={selected === item.answer} explanation={item.explanation} />}
  </div>;
}

function ConceptCheck({ item, onResult }) {
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState(false);
  return <div className="db-exercise-card db-concept-card">
    <p className="db-think">Kurz nachdenken</p><h2>{item.question}</h2>
    {!revealed ? <button className="db-primary" onClick={() => setRevealed(true)}>Erklärung aufdecken</button> : <>
      <div className="db-concept-answer">{item.explanation}</div>
      {!rated && <div className="db-rating"><button className="unsure" onClick={() => { setRated(true); onResult("unsure", false); }}>Noch unklar</button><button className="correct" onClick={() => { setRated(true); onResult("correct", false); }}>Verstanden</button></div>}
    </>}
  </div>;
}

function Feedback({ correct, explanation }) {
  return <div className={`db-feedback ${correct ? "correct" : "wrong"}`} role="status"><strong>{correct ? "Richtig" : "Noch nicht"}</strong><p>{explanation}</p></div>;
}

function Dashboard({ progress, onStart }) {
  const stats = getStats(allItems, progress);
  return <div className="db-dashboard">
    <section className="db-overview">
      <div><p className="db-kicker">DEIN LERNSTAND</p><h2>Datenbanken <span>{stats.percent} %</span></h2><ProgressBar value={stats.percent} /></div>
      <div className="db-stat-grid"><div><strong>{stats.answered}</strong><span>beantwortet</span></div><div><strong>{stats.correct}</strong><span>richtig</span></div><div><strong>{stats.wrong}</strong><span>Fehler</span></div><div><strong>{allItems.length}</strong><span>Aufgaben</span></div></div>
    </section>
    <section className="db-topic-progress"><div className="db-section-title"><div><p className="db-kicker">KAPITEL</p><h2>Wissensstand pro Thema</h2></div><button className="db-primary" onClick={onStart}>Weiterlernen</button></div>
      <div className="db-topic-grid">{topics.map((topic) => {
        const items = allItems.filter((item) => item.topic === topic.id);
        const topicStats = getStats(items, progress);
        return <div className="db-topic-row" key={topic.id}><div><strong>{topic.label}</strong><span>{topicStats.knowledgePercent}% sicher · {topicStats.answered}/{items.length}</span></div><ProgressBar value={topicStats.knowledgePercent} /></div>;
      })}</div>
    </section>
  </div>;
}

export default function DatenbankTrainer() {
  const [progress, setProgress] = useState(loadProgress);
  const [view, setView] = useState("overview");
  const [mode, setMode] = useState("cards");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [index, setIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const items = useMemo(() => modeItems[mode].filter((item) => (difficulty === "all" || item.difficulty === difficulty) && (topic === "all" || item.topic === topic)), [mode, difficulty, topic]);
  const safeIndex = index >= items.length ? 0 : index;
  const item = items[safeIndex];

  const changeFilters = (nextMode, nextDifficulty = difficulty, nextTopic = topic) => {
    setMode(nextMode); setDifficulty(nextDifficulty); setTopic(nextTopic); setIndex(0); setCanContinue(false);
  };
  const handleResult = (result, advance = true) => {
    const updated = recordAttempt(progress, item, result);
    setProgress(updated);
    saveProgress(updated);
    if (advance) setIndex(nextIndex(items, updated, safeIndex));
    else setCanContinue(true);
  };
  const next = () => { setIndex(nextIndex(items, progress, safeIndex)); setCanContinue(false); };
  const Exercise = mode === "cards" ? Flashcard : mode === "quiz" ? MultipleChoice : mode === "sql" ? SqlChallenge : mode === "schema" ? SchemaTask : ConceptCheck;

  return <div className="db-trainer">
    <header className="db-hero"><div><p className="db-kicker">DATENBANK-KOMPETENZTRAINER</p><h1>Datenbanken verstehen.<br /><span>Systeme sicher bauen.</span></h1><p>Von relationalen Grundlagen über SQL und Normalisierung bis zu PostgreSQL, Supabase und Concurrency.</p></div><div className="db-hero-schema" aria-hidden="true"><span>companies</span><i>1</i><b>projects</b><i>n</i><span>tasks</span></div></header>
    <nav className="db-main-tabs" aria-label="Bereich wählen"><button className={view === "overview" ? "active" : ""} onClick={() => setView("overview")}>Übersicht</button><button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}>Trainieren</button></nav>
    {view === "overview" ? <Dashboard progress={progress} onStart={() => setView("learn")} /> : <main className="db-learning">
      <div className="db-mode-tabs" role="tablist">{modes.map((entry) => <button key={entry.id} className={mode === entry.id ? "active" : ""} onClick={() => changeFilters(entry.id)}><span>{entry.label}</span><small>{entry.items.length}</small></button>)}</div>
      <div className="db-filters"><label>Level<select value={difficulty} onChange={(event) => changeFilters(mode, event.target.value, topic)}><option value="all">Alle Level</option>{Object.entries(difficulties).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Thema<select value={topic} onChange={(event) => changeFilters(mode, difficulty, event.target.value)}><option value="all">Alle Themen</option>{topics.map((entry) => <option value={entry.id} key={entry.id}>{entry.label}</option>)}</select></label><span className="db-queue">{items.length} Aufgaben · adaptive Reihenfolge</span></div>
      {item ? <section className="db-exercise" key={`${mode}-${item.id}-${safeIndex}`}><div className="db-exercise-meta"><LevelBadge level={item.difficulty} /><span>{topics.find((entry) => entry.id === item.topic)?.label}</span><span>{safeIndex + 1}/{items.length}</span></div><Exercise item={item} onResult={handleResult} />{canContinue && <button className="db-next" onClick={next}>Nächste Aufgabe →</button>}</section> : <div className="db-empty"><strong>Keine Aufgaben für diese Auswahl</strong><p>Wähle ein anderes Thema oder Level.</p></div>}
    </main>}
  </div>;
}
