import React, { useCallback, useEffect, useRef, useState } from "react";
import { allTasks, capstones, coreUnits, courses, diagnostics, units } from "./data.js";
import { exams } from "./exams.js";
import { STORAGE_KEY, changeSession, checkTask, emptyState, examAnswer, finishExam, latestSession, loadState, localDay, openTask, remaining, selfPoints, startExam, trainingGoal } from "./model.js";
import { Contours, Graph, Optimization, PointCloud, Region } from "./Visuals.jsx";
import "./math.css";

function useMathState(storage) {
  const [loaded] = useState(()=>loadState(storage));
  const [state,setState] = useState(loaded.state);
  const [warning,setWarning] = useState(loaded.warning);
  const current=useRef(state);
  const update=useCallback((transform)=>{
    const next=transform(current.current);
    if(next===current.current)return;
    current.current=next;
    setState(next);
    try { storage.setItem(STORAGE_KEY,JSON.stringify(next)); }
    catch { setWarning("Speichern fehlgeschlagen. Fortschritt bleibt nur bis zum Schließen dieser Seite erhalten."); }
  },[storage]);
  useEffect(()=>{
    const refresh=(event)=>{
      if(event.key!==STORAGE_KEY)return;
      const result=loadState(storage);
      current.current=result.state;
      setState(result.state);
      setWarning(result.warning);
    };
    window.addEventListener("storage",refresh);
    return ()=>window.removeEventListener("storage",refresh);
  },[storage]);
  return {state,update,warning};
}

export function Source({value}) {
  return <details className="am-source"><summary>Quelle · Kapitel {value.chapter}, S. {value.printed}</summary><p>{value.file} · Kapitel/Abschnitt {value.chapter} · gedruckt {value.printed} · PDF {value.pdf}</p></details>;
}

export default function Course({index=0,storage=window.localStorage}) {
  const {state,update,warning}=useMathState(storage);
  const course=courses[index];
  const [tab,setTab]=useState(index===4?"workshop":index===0&&!Object.keys(state.diagnostics).length?"diagnosis":"learn");
  const [reset,setReset]=useState(false);
  // Mounting with an existing exam is a resumed/reloaded run, never a fresh one.
  useEffect(()=>{
    update(s=>s.activeExam?{...s,activeExam:{...s.activeExam,interrupted:true}}:s);
    const interrupt=()=>update(s=>s.activeExam?{...s,activeExam:{...s.activeExam,interrupted:true}}:s);
    const hidden=()=>{if(document.hidden)interrupt();};
    window.addEventListener("pagehide",interrupt);
    document.addEventListener("visibilitychange",hidden);
    return ()=>{window.removeEventListener("pagehide",interrupt);document.removeEventListener("visibilitychange",hidden);};
  },[update]);
  return <main className="am-shell">
    <header className="am-header"><div className="am-header-top"><p className="eyebrow">ANGEWANDTE MATHEMATIK · TRAINER {index+1} / 5</p>{!state.activeExam&&<details className="am-course-switch"><summary>Trainer wechseln</summary><nav className="am-course-nav" aria-label="Die fünf Mathe-Trainer">{courses.map((item,i)=><a key={item.slug} href={`/trainer/${item.slug}`} aria-current={i===index?"page":undefined}>{i+1} · {item.title}</a>)}</nav></details>}</div><h1>{course.title}</h1><p>{index===4?"Auf Papier rechnen. Unter Zeitdruck üben. Deinen Fortschritt einschätzen.":"Ein Thema nach dem anderen. Verstehen, selbst rechnen und sicherer werden."}</p><span className="am-badge">{index===4?"60 Minuten pro Prüfung":"10–20 Minuten pro Lerneinheit"}</span>
    </header>
    {warning&&<p className="am-warning" role="alert">{warning}</p>}
    {state.activeExam?<ExamRun state={state} update={update}/>:<>
      <div className="am-tabs" role="navigation" aria-label="Trainerbereiche">
        {index<4&&<button aria-pressed={tab==="learn"} onClick={()=>setTab("learn")}>Lerneinheiten</button>}
        {index<4&&<><button aria-pressed={tab==="diagnosis"} onClick={()=>setTab("diagnosis")}>Vorwissen prüfen</button><button aria-pressed={tab==="capstone"} onClick={()=>setTab("capstone")}>Zusammenhängender Abschluss</button></>}
        <button aria-pressed={tab==="progress"} onClick={()=>setTab("progress")}>Leistungsübersicht</button>
        {index===4&&<button aria-pressed={tab==="workshop"} onClick={()=>setTab("workshop")}>Probeklausuren</button>}
        <button aria-pressed={tab==="notes"} onClick={()=>setTab("notes")}>A4-Merkzettelhilfe</button>
        <button aria-pressed={tab==="sources"} onClick={()=>setTab("sources")}>Quellen & Abdeckung</button>
      </div>
      {tab==="learn"&&<Learning index={index} state={state} update={update}/>}
      {tab==="diagnosis"&&<Diagnosis index={index} state={state} update={update}/>}
      {tab==="capstone"&&<TaskCard task={capstones[index]} state={state} update={update}/>}
      {tab==="progress"&&<Progress state={state}/>}
      {tab==="workshop"&&<Workshop state={state} update={update}/>}
      {tab==="notes"&&<Notes state={state} update={update}/>}
      {tab==="sources"&&<Sources/>}
      <footer className="am-footer"><p>Lokal gespeichert · Keine Notengarantie · Fehlerrechnung und Dreifachintegrale sind ergänzende Vertiefungen.</p>
        {!reset?<button onClick={()=>setReset(true)}>Mathe-Lernstand zurücksetzen …</button>:<div><p>Nur der Lernstand für Angewandte Mathematik wird gelöscht, einschließlich Prüfungsnachweisen und Merkzettel. Andere Trainer und Fokuslisten bleiben erhalten.</p><button onClick={()=>{update(()=>emptyState());setReset(false);}}>Nur Mathe-Lernstand löschen</button><button onClick={()=>setReset(false)}>Abbrechen</button></div>}
      </footer>
    </>}
  </main>;
}

function Learning({index,state,update}) {
  const relevant=units.filter(unit=>courses[index].chapters.includes(unit.chapter)).sort((a,b)=>a.chapter-b.chapter||(a.id.endsWith("topologie")?-1:b.id.endsWith("topologie")?1:0));
  const initial=()=>{
    const requested=new URLSearchParams(window.location.search).get("familie");
    const linked=relevant.find(unit=>unit.id===requested);
    const due=relevant.find(unit=>state.due[unit.id]?.at<=Date.now());
    const saved=relevant.find(unit=>unit.id===state.selection[index]);
    return linked || due || saved || relevant[0];
  };
  const [selected,setSelected]=useState(()=>initial().id);
  const current=relevant.find(unit=>unit.id===selected) || relevant[0];
  const newTask=current.tasks.findIndex(task=>task.independent&&!state.sessions[task.id]);
  const [stage,setStage]=useState(()=>(state.read.includes(initial().id)||initial().tasks.some(task=>state.sessions[task.id])||new URLSearchParams(window.location.search).has("familie"))&&newTask>=0?newTask+2:0);
  const selectedTask=current.tasks[stage-2];
  const nextUnit=relevant[relevant.findIndex(unit=>unit.id===current.id)+1];
  const select=(unitId)=>{
    setSelected(unitId);setStage(0);
    update(s=>({...s,selection:{...s.selection,[index]:unitId}}));
  };
  const fresh=()=>{
    const next=current.tasks.findIndex(task=>task.independent&&!state.sessions[task.id]);
    if(next>=0)setStage(next+2);
  };
  return <div className="am-learning">
    <label className="am-mobile-unit">Dein Thema<select value={selected} onChange={e=>select(e.target.value)}>{relevant.map(unit=><option key={unit.id} value={unit.id}>{unit.supplementary?"Vertiefung":`Kap. ${unit.chapter}`} · {unit.title}</option>)}</select></label>
    <aside className="am-unit-list"><h2>Dein Lernpfad</h2><p>Kleine Schritte, ohne Zugangssperren.</p>{relevant.map(unit=><button key={unit.id} aria-pressed={unit.id===current.id} onClick={()=>select(unit.id)}><span>{unit.supplementary?"Vertiefung":`Kap. ${unit.chapter} · ${unit.id}`}</span>{unit.title}{state.due[unit.id]?.at<=Date.now()&&<small>Wiederholung fällig</small>}</button>)}</aside>
    <div className="am-unit"><div className="am-panel"><p className="eyebrow">{current.supplementary?"VERTIEFUNG · PRÜFUNGSRELEVANZ NICHT BELEGT":`KAPITEL ${current.chapter} · KERNSTOFF`}</p><h2>{current.title}</h2><details className="am-context"><summary>Voraussetzungen & Quelle</summary><p>Voraussetzungen: {current.prerequisites.join(", ")}. Du kannst jederzeit zur Diagnose wechseln.</p><Source value={current.source}/></details>
      <p className="am-step-caption">Schritt {stage+1} von 6 <span>{stage<2?"Verstehen":stage<4?"Mit Unterstützung üben":"Selbst anwenden"}</span></p>
      <div className="am-steps" aria-label="Lernschritte">{["1 Erklärung","2 Beispiel","3 Leicht","4 Gestützt","5 Selbstständig","6 Transfer"].map((name,i)=><button key={name} aria-pressed={stage===i} onClick={()=>setStage(i)}>{name}</button>)}</div>
      {stage===0&&<><p>{current.explanation}</p><button className="am-primary" onClick={()=>{update(s=>({...s,read:[...new Set([...s.read,current.id])]}));setStage(1);}}>Gelesen · zum Beispiel</button><p>Lesen zählt nicht als Beherrschung.</p></>}
      {stage===1&&<><h3>Durchgerechnetes Beispiel</h3><p className="am-formula">{current.example}</p><button className="am-primary" onClick={()=>setStage(2)}>Jetzt selbst einsetzen</button></>}
      {newTask>=0&&stage<4&&state.read.includes(current.id)&&<p><button onClick={fresh}>Neue Aufgabe ohne Hilfe starten</button></p>}
    </div>
    {selectedTask&&<TaskCard key={selectedTask.id} task={selectedTask} state={state} update={update} onNext={stage<5?()=>setStage(stage+1):nextUnit?()=>select(nextUnit.id):undefined} nextLabel={stage===5?"Zur nächsten Lerneinheit":"Zum nächsten Lernschritt"}/>}
    {stage===5&&!nextUnit&&<p className="am-end-note">Du bist bei der letzten Lerneinheit. Deinen Stand und fällige Wiederholungen findest du in der Leistungsübersicht.</p>}
    {stage<2&&["2.1","2.2"].includes(current.id)&&<Contours/>}{stage<2&&current.chapter===4&&<Graph/>}{stage<2&&current.chapter===7&&<Optimization/>}{stage<2&&current.id==="9.2"&&<PointCloud/>}{stage<2&&current.id==="8.2"&&<Region/>}
    </div>
  </div>;
}

export function TaskCard({task,state,update,onNext,nextLabel="Zum nächsten Lernschritt"}) {
  useEffect(()=>{update(s=>openTask(s,task));},[task.id,update]);
  const run=latestSession(state,task.id);
  if(!run)return <p>Aufgabe wird geöffnet …</p>;
  const result=run.feedback;
  const markHelp=(solution=false)=>update(s=>changeSession(s,task.id,{helped:true,...(solution?{solution:true}:{hint:true})}));
  return <section className="am-panel am-exercise"><p className="eyebrow">{task.stage || "DIAGNOSE"} · {task.own?"EIGENE AUFGABENVARIANTE":"SKRIPTAUFGABE"}</p><h3>Rechne zuerst auf Papier</h3><p className="am-prompt">{task.prompt}</p><Source value={task.source}/>
    <p className="am-status">{run.known?"Bekannte Aufgabe: kein neuer Nachweis.":task.independent?"Neue Aufgabe: der erste gültige Versuch ohne Hilfe zählt.":"Übung: zählt als bearbeitet, nicht als neuer Kapitel-Nachweis."} {run.helped&&"Hilfe genutzt."}</p>
    {task.id==="4.1-1"&&<Graph variant="polynomial"/>}
    <AnswerFields task={task} answers={run.answers} result={result} onChange={(i,value)=>update(s=>changeSession(s,task.id,{answers:{...latestSession(s,task.id).answers,[i]:value},feedback:null}))}/>
    <div className="am-actions"><button className="am-primary" onClick={()=>update(s=>checkTask(s,task))}>Zwischenschritte prüfen</button><button onClick={()=>markHelp()}>Gezielter Hinweis</button><button onClick={()=>markHelp()}>Kein Ansatz</button><button onClick={()=>markHelp(true)}>Lösung anzeigen</button></div>
    {result&&!result.valid&&<p role="alert">Bitte alle Felder als gültige Zahlen oder Brüche ausfüllen. Leere Felder und Formeln werden nicht als null gewertet. Noch kein Rechenversuch gezählt.</p>}
    {result?.valid&&<div className={`am-feedback ${result.score===result.total?"am-feedback-success":""}`} role="status"><p>{result.score}/{result.total} Rechenpunkte in diesem Versuch. {run.checks>1?"Erneuter Versuch; der Erstversuch bleibt unverändert.":"Erster Versuch gespeichert."}</p><ul>{result.fields.filter(item=>!item.correct).map((item,i)=><li key={i}><strong>{item.label}:</strong> Dieser Zwischenschritt stimmt noch nicht. Prüffokus: {item.error}.</li>)}</ul>{result.score===result.total&&<p>Alle erfassten Rechenschritte stimmen. Die schriftliche Begründung bitte mit der Lösung vergleichen.</p>}</div>}
    {run.hint&&<div className="am-hint"><h4>Nächster überschaubarer Schritt</h4><p>{task.fields[result?.fields.findIndex(item=>!item.correct)>=0?result.fields.findIndex(item=>!item.correct):0].hint}</p><p>Überarbeite diesen Schritt und prüfe erneut. Daraus folgt noch keine Diagnose deiner allgemeinen Kenntnisse.</p></div>}
    {run.solution&&<div className="am-solution"><h4>Musterlösung · kein Beherrschungsnachweis</h4><ol>{task.solution.map((step,i)=><li key={i}>{step}</li>)}</ol><p>{task.fields.map(field=>`${field.label}: ${Number(field.answer.toFixed(6)).toLocaleString("de-DE")}`).join(" · ")}</p></div>}
    <div className="am-actions am-next">{onNext&&<button onClick={onNext}>{nextLabel} <span aria-hidden="true">→</span></button>}{(run.checks>0||run.helped)&&<button onClick={()=>update(s=>openTask(s,task,Date.now(),true))}>Bekannte Aufgabe erneut ohne Hilfe</button>}</div>
    {run.confirmed&&<p>Später erneut bestätigt: an einem anderen Tag ohne Hilfe im ersten Versuch gelöst.</p>}
  </section>;
}

function AnswerFields({task,answers={},onChange,disabled=false,result}) {
  return <><p className="am-input-note">Deine Ergebnisse · Zahlen oder Brüche, z. B. −0,5 oder 1/3</p><details className="am-input-details"><summary>Was kann ich eingeben?</summary><p>Vektoren/Matrizen komponentenweise. Keine Formeleingabe; π und Wurzeln numerisch. Absolute Toleranz je Feld: {Math.min(...task.fields.map(f=>f.tolerance))} bis {Math.max(...task.fields.map(f=>f.tolerance))}.</p></details>
    <div className="am-fields">{task.fields.map((field,i)=>{const feedback=result?.fields[i];return <div key={i} className={feedback?feedback.correct?"am-field-correct":"am-field-error":""}><label htmlFor={`${task.id}-${i}`}>{field.label} <small>({field.points} P)</small></label><input id={`${task.id}-${i}`} aria-invalid={feedback?!feedback.correct:undefined} aria-describedby={feedback?`${task.id}-${i}-feedback`:undefined} autoComplete="off" spellCheck="false" type="text" value={answers[i] || ""} disabled={disabled} onChange={e=>onChange(i,e.target.value)}/>{feedback&&<small id={`${task.id}-${i}-feedback`}>{feedback.correct?"✓ Richtig":feedback.valid?"Noch einmal prüfen":"Zahl oder Bruch eingeben"}</small>}</div>;})}</div>
  </>;
}

function Diagnosis({index,state,update}) {
  const choices=diagnostics.filter((_,i)=>i<6 || (i===6&&[1,2].includes(index)) || (i===7&&index===3));
  const [selected,setSelected]=useState(choices[0].id);
  const [retry,setRetry]=useState(false);
  const item=choices.find(d=>d.id===selected)||choices[0];
  const task=item.tasks[retry?1:0];
  const run=latestSession(state,task.id);
  return <section><div className="am-panel"><h2>Kurzer Einstiegstest</h2><p>Dein Vorwissen ist noch nicht erhoben. Rechne die kurzen Aufgaben; ein Fehler öffnet eine passende Erklärung, keine Sperre. Eigenwerte und Wahrscheinlichkeit kommen beim passenden Trainer dazu.</p><div className="am-actions">{choices.map(d=><button key={d.id} aria-pressed={d.id===item.id} onClick={()=>{setSelected(d.id);setRetry(false);}}>{d.title}</button>)}</div></div>
    <TaskCard key={task.id} task={task} state={state} update={update}/>
    {run?.checks>0&&<div className="am-panel"><p>{run.feedback?.score===run.feedback?.total?"Dieser geprüfte Schritt stimmt.":"Für diesen Schritt hilft folgende Mini-Erklärung:"}</p><p>{item.explanation}</p><button onClick={()=>{update(s=>({...s,diagnostics:{...s.diagnostics,[item.id]:true}}));setRetry(true);}}>Neue Diagnoseaufgabe</button></div>}
  </section>;
}

function Progress({state}) {
  const goal=trainingGoal(state,coreUnits);
  const sessions=allTasks.flatMap(task=>(state.sessions[task.id]||[]).map(run=>({task,run})));
  const worked=new Set(sessions.filter(({run})=>run.checks>0).map(({task})=>task.id)).size;
  const assisted=new Set(sessions.filter(({run})=>run.helped&&run.feedback?.score===run.feedback?.total&&run.checks>0).map(({task})=>task.id)).size;
  const first=new Set(sessions.filter(({run})=>!run.known&&run.firstUnaided&&run.firstScore===run.firstTotal&&run.checks>0).map(({task})=>task.id)).size;
  const confirmed=new Set(sessions.filter(({run})=>run.confirmed).map(({task})=>task.id)).size;
  const due=Object.entries(state.due).filter(([,value])=>value.at<=Date.now());
  return <section className="am-panel"><h2>{goal.reached?"Trainingsziel erreicht":"Dein Leistungsnachweis wächst mit dem Rechnen"}</h2><p>Vorgeschlagener konservativer Maßstab, keine validierte Vorhersage der Klausurnote und keine Garantie für 85 %.</p>
    <dl className="am-metrics"><div><dt>Einheiten gelesen</dt><dd>{state.read.length}</dd></div><div><dt>Aufgaben bearbeitet</dt><dd>{worked}</dd></div><div><dt>Mit Hilfe gelöst</dt><dd>{assisted}</dd></div><div><dt>Erstmals ohne Hilfe gelöst</dt><dd>{first}</dd></div><div><dt>Später erneut bestätigt</dt><dd>{confirmed}</dd></div></dl>
    <h3>Jedes Kapitel mindestens 80 % auf neuen Aufgaben ohne Hilfe</h3><p>Nur erste gültige Abgaben selbstständiger und Transferaufgaben zählen. Fehler bleiben im Nenner. Lesefortschritt und Lösungen liefern keine Punkte; kleine Stichproben sind schwache Evidenz.</p>
    <div className="am-table-wrap"><table><thead><tr><th>Kapitel</th><th>Rechenpunkte</th><th>Neue Aufgaben</th><th>Quote</th><th>Alle Kernfamilien geübt</th></tr></thead><tbody>{goal.chapters.map(ch=><tr key={ch.chapter}><th>{ch.chapter}</th><td>{ch.earned}/{ch.possible}</td><td>{ch.count}{ch.count<5?" · kleine Stichprobe":""}</td><td>{ch.percent===null?"Noch kein Nachweis":`${ch.percent} %`}</td><td>{ch.practiced?"Ja":"Noch nicht"}</td></tr>)}</tbody></table></div>
    <h3>Drei unterschiedliche Probeklausuren: jeweils mindestens 90/100</h3><p>{goal.qualifying.length}/3 gültige neue Nachweise. {goal.examsPassed?"Letzte Prüfung an einem späteren Tag bestätigt.":"Die letzte Prüfung muss an einem späteren Tag stattfinden. Nur erlaubte Hilfsmittel, höchstens 60 Minuten, ohne Unterbrechung; bekannte Varianten zählen nicht."}</p>
    <h3>Fehlerwiederholung und lokale Fälligkeiten</h3><p>Wiederholungen nach 1, 3 und 7 Tagen. Keine Benachrichtigungen. {due.length} Familien jetzt fällig.</p>
    {Object.entries(state.due).map(([id,value])=>{const unit=units.find(u=>u.id===id);if(!unit)return null;const course=courses.find(c=>c.chapters.includes(unit.chapter));const fresh=unit.tasks.find(t=>t.independent&&!state.sessions[t.id]);return <p key={id}><a href={`/trainer/${course.slug}?familie=${encodeURIComponent(id)}`}>{unit.title}</a> · {new Date(value.at).toLocaleDateString("de-DE")} · {fresh?"Neue Aufgabe ohne Hilfe verfügbar":"Nur bekannte Aufgaben verfügbar; kein neuer Nachweis"}</p>;})}
    {!Object.keys(state.due).length&&<p>Noch keine Wiederholung fällig: zuerst eine Aufgabe rechnen.</p>}
    <h3>Prüfungsprotokoll</h3>{state.examHistory.map((run,i)=><p key={i}>{exams.find(e=>e.id===run.id)?.title} · {localDay(run.startedAt)} · automatisch {run.auto}/80 · selbstbewertet {selfPoints(run)}/20 · Gesamt {run.auto+selfPoints(run)}/100 (gemischte Bewertung){run.known?" · bekannt":" · erstmalig"}{run.interrupted?" · unterbrochen, kein Zielnachweis":""}</p>)}
  </section>;
}

function Workshop({state,update}) {
  const [allowed,setAllowed]=useState(false);
  const [review,setReview]=useState(()=>state.examHistory.length-1);
  return <section><div className="am-panel"><h2>Skriptbasierte Probeklausuren</h2><p>Wähle eine Variante und lege Papier und Taschenrechner bereit.</p><div className="am-exam-facts"><span><strong>60</strong> Minuten</span><span><strong>5</strong> Aufgaben</span><span><strong>100</strong> Übungspunkte</span></div><p>Rechne auf Papier und trage deine Ergebnisse ein. Hinweise und Lösungen erscheinen erst nach der Abgabe.</p><details className="am-context"><summary>Ablauf, Punkte & Zeitlimit</summary><p>5 Aufgaben à 20 Punkte. Kapitel 1–3: 20, Kapitel 4–5: 20, Kapitel 6: 20, Kapitel 7 und 9: 20, Kapitel 8: 20. Gewichtung und Zeitbudget sind Trainingsentscheidungen; es liegt keine Altklausur vor.</p><p>Vor Abgabe bleiben Korrektheit und digitale Merkzettelhilfe geschlossen. Der Timer läuft bei Reload und Unterbrechung weiter. Ein Verlassen/Verbergen der Seite wird konservativ als Unterbrechung markiert.</p></details><p className="am-input-note">Bestätige deine Hilfsmittel, um die Startbuttons freizuschalten. Der Timer startet sofort; es gibt keine Pause.</p>
    <label className="am-check"><input type="checkbox" checked={allowed} onChange={e=>setAllowed(e.target.checked)}/>Ich verwende nur Papier, Taschenrechner und mein beidseitiges handgeschriebenes A4-Blatt.</label>
    <div className="am-exam-options">{exams.map(exam=><article key={exam.id}><h3>{exam.title}</h3><p>{state.seenExams.includes(exam.id)?"Bereits gesehen · Wiederholung ohne neuen Zielnachweis":"Noch nicht gesehen · neue Aufgabenvariante"}</p><button className="am-primary" disabled={!allowed} onClick={()=>update(s=>startExam(s,exam,allowed))}>Prüfung {exam.id.slice(-1).toUpperCase()} starten</button></article>)}</div>
  </div>
  {state.examHistory.length>0&&<><div className="am-panel"><h3>Abgaben nachbewerten</h3><select aria-label="Prüfungsabgabe auswählen" value={review} onChange={e=>setReview(Number(e.target.value))}>{state.examHistory.map((run,i)=><option value={i} key={i}>{exams.find(exam=>exam.id===run.id)?.title} · {new Date(run.startedAt).toLocaleString("de-DE")}</option>)}</select></div><ExamReview key={review} state={state} update={update} index={review}/></>}
  </section>;
}

function ExamRun({state,update}) {
  const [now,setNow]=useState(Date.now());
  const [confirm,setConfirm]=useState(false);
  const run=state.activeExam;
  const exam=exams.find(exam=>exam.id===run.id);
  useEffect(()=>{
    const tick=()=>{const time=Date.now();setNow(time);update(s=>s.activeExam&&remaining(s.activeExam,time)===0?finishExam(s,exams.find(e=>e.id===s.activeExam.id),time):s);};
    tick();const timer=setInterval(tick,500);return ()=>clearInterval(timer);
  },[update]);
  if(!exam)return <p role="alert">Unbekannte Prüfungsvariante. Bitte den Mathe-Lernstand prüfen.</p>;
  const task=exam.tasks[run.index] || exam.tasks[0];
  const seconds=Math.ceil(remaining(run,now)/1000);
  return <section className="am-panel"><div className="am-exam-head"><h2>{exam.title}</h2><strong role="timer" aria-label="Verbleibende Prüfungszeit">{String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}</strong></div><p>Aufgabe {run.index+1}/5 · je 20 Punkte (16 automatisch, 4 später selbstbewertet). Noch keine Bewertung.</p>
    {run.interrupted&&<p className="am-warning">Unterbrochener/fortgesetzter Lauf: Die Zeit läuft weiter. Dieser Lauf zählt nicht für das Trainingsziel.</p>}
    {run.known&&<p>Bekannte Variante: kein neuer Leistungsnachweis.</p>}
    <div className="am-actions">{exam.tasks.map((item,i)=><button key={item.id} aria-pressed={i===run.index} onClick={()=>update(s=>({...s,activeExam:{...s.activeExam,index:i}}))}>{i+1} · {item.title}</button>)}</div>
    <h3>{task.title}</h3><p className="am-prompt">{task.prompt}</p>{task.sources.map(src=><Source key={src.chapter} value={src}/>)}
    <AnswerFields task={task} answers={run.answers[task.id]} onChange={(i,value)=>update(s=>examAnswer(s,task.id,i,value))} disabled={seconds===0}/>
    <div className="am-actions"><button onClick={()=>update(s=>({...s,activeExam:{...s.activeExam,interrupted:true}}))}>Unterbrechung markieren</button><button className="am-primary" onClick={()=>setConfirm(true)}>Prüfung abgeben …</button></div>
    {confirm&&<div className="am-warning"><p>Jetzt endgültig abgeben? Leere oder ungültige Felder erhalten 0 Punkte. Danach kannst du die Antworten nicht mehr ändern.</p><button onClick={()=>update(s=>finishExam(s,exam))}>Endgültig abgeben</button><button onClick={()=>setConfirm(false)}>Weiterrechnen</button></div>}
  </section>;
}

function ExamReview({state,update,index}) {
  const run=state.examHistory[index];
  if(!run)return null;
  const exam=exams.find(e=>e.id===run.id);
  return <section className="am-review"><div className="am-panel"><h2>Abgabe: {run.auto+selfPoints(run)}/100 · gemischte Bewertung</h2><p>Automatisch geprüft: {run.auto}/80. Selbstbewertung der schriftlichen Argumentation: {selfPoints(run)}/20. Nicht bewertete Rasterpunkte zählen vorläufig als 0.</p><p>Dauer: {Math.ceil((run.finishedAt-run.startedAt)/60000)} Minuten. {run.timedOut?"Zeitlimit erreicht; Antworten eingefroren.":"Manuell abgegeben."} {run.interrupted?"Unterbrochen, kein Zielnachweis.":"Keine Unterbrechung registriert."} {run.known?"Bekannte Variante.":"Erstmalige Variante."}</p></div>
    {exam.tasks.map((task,taskIndex)=>{
      const result=run.results[taskIndex];
      const unit=units.find(u=>u.id===task.family);
      const course=courses.find(c=>c.chapters.includes(unit.chapter));
      return <article key={task.id} className="am-panel"><h3>{task.title} · automatisch {result.score}/16</h3><p>{task.prompt}</p><ol>{task.solution.map((step,i)=><li key={i}>{step}</li>)}</ol>
        <div className="am-table-wrap"><table><thead><tr><th>Rechenschritt</th><th>Dein Ergebnis</th><th>Musterwert</th><th>Punkte</th></tr></thead><tbody>{task.fields.map((field,i)=><tr key={i}><th>{field.label}</th><td>{run.answers[task.id]?.[i] || "Leer"}</td><td>{Number(field.answer.toFixed(6)).toLocaleString("de-DE")}</td><td>{result.fields[i].correct?2:0}/2 · {result.fields[i].correct?"richtig":result.fields[i].valid?"abweichend":"ungültig/leer"}</td></tr>)}</tbody></table></div>
        <h4>Schriftlicher Rechenweg · ausdrücklich Selbstbewertung</h4>{task.rubric.map((criterion,i)=><label className="am-rubric" key={i}>{criterion.text}<select aria-label={`${task.title}: Selbstbewertung ${i+1}`} value={run.self[`${task.id}-${i}`]??""} onChange={e=>{const value=e.target.value;update(s=>({...s,examHistory:s.examHistory.map((entry,j)=>j===index?{...entry,self:{...entry.self,[`${task.id}-${i}`]:value===""?0:Number(value)}}:entry)}));}}><option value="">Noch nicht bewertet</option><option value="0">0 von 2 Punkten</option><option value="1">1 von 2 Punkten</option><option value="2">2 von 2 Punkten</option></select></label>)}
        <p>{result.score<16?"Abweichende Rechenschritte oben einzeln prüfen. ":"Für eine spätere Bestätigung: "}<a href={`/trainer/${course.slug}?familie=${encodeURIComponent(unit.id)}`}>Passende Wiederholung: {unit.title}</a></p>
      </article>;
    })}
  </section>;
}

function Notes({state,update}) {
  return <section className="am-panel"><h2>A4-Merkzettelhilfe</h2><p>Zum handschriftlichen Übertragen auf ein beidseitiges A4-Blatt. Während der Simulation ist diese digitale Hilfe geschlossen.</p>
    <h3>Vorderseite: Ableitungen und Optimierung</h3><ul><li>∂: andere Variablen festhalten. ∇f als Spalte; J mit Ausgabezeilen/Eingabespalten.</li><li>Dᵥf=∇f·v nur bei passender Differenzierbarkeit; v=u/‖u‖, u≠0.</li><li>T=f(P)+∇f(P)ᵀh. Kettenregel J_f(g(P))J_g(P), Dimensionen prüfen.</li><li>Reverse: Ausgangsadjoint 1; lokale Beiträge aller Pfade addieren.</li><li>Schwarz bei C²; T₂=f+∇fᵀh+½hᵀHh. Stationarität vor Hesse-Test; semidefinit entscheidet nicht.</li><li>Sylvester für symmetrisches H: alle führenden Minoren &gt;0 ⇒ positiv definit.</li><li>GD x neu=x−η∇f. Nur für positiv definite Quadratik: 0&lt;η&lt;2/λmax. Momentum v neu=γv+η∇f, x neu=x−v neu. Mini-Batch mitteln.</li></ul>
    <h3>Rückseite: Daten und Integrale</h3><ul><li>Regression: X mit/ohne Eins-Spalte, r=y−Xβ, XtXβ=Xty. Eindeutig nur bei vollem Spaltenrang. κ(XtX)=κ(X)².</li><li>QR: QᵀQ=I prüfen, d=Qᵀy, Rβ=d von unten lösen.</li><li>Lagrange: L=f−λg; ∇g≠0, Nebenbedingung und alle Kandidaten prüfen; globale Aussagen mit Existenz-/Randargument.</li><li>PCA: μ berechnen, X̃ zentrieren, Σ=X̃ᵀX̃/n. Normierte Eigenachse, z=X̃v; Vorzeichen konsistent. Anteil λ₁/Spur(Σ), falls Spur&gt;0.</li><li>Gebiet skizzieren, Grenzen innen/außen zuordnen, ggf. teilen. Fubini z. B. bei stetigem f auf kompaktem Rechteck.</li><li>Polar: x=r cos φ,y=r sin φ,dA=r dr dφ. Allgemein Betrag der Jacobi-Determinante.</li><li>Dichte: p≥0, Gesamtintegral 1, p_X=∫p dy, E[X]=∫∫xp, Cov=E[XY]−E[X]E[Y].</li></ul>
    <label>Eigene Regeln und typische Fehler<textarea rows="7" value={state.notes} onChange={e=>update(s=>({...s,notes:e.target.value}))}/></label>
  </section>;
}

function Sources() {
  return <section className="am-panel"><h2>Quellen, Abdeckung und offene Stoffabgrenzung</h2><p>Leitquelle: Dürrschnabel, Mathematik III / Angewandte Mathematik, MOS-TINF25A, T4INF2001, Stand 29.08.2026. Keine PDFs werden hier öffentlich kopiert. Die vorhandene HTML-Lernlandkarte dient als Orientierung; fachliche Angaben wurden mit den PDFs abgeglichen.</p><p>Termin laut Skript, gedruckt iv / PDF 4: 23.11.2026, 09:00 Uhr, 60 Minuten, handschriftlich; Taschenrechner und handgeschriebenes beidseitiges A4-Blatt erlaubt. Nicht unabhängig aktuell bestätigt.</p><p>Differentialgleichungen stehen nur in der allgemeinen Modulbeschreibung; ausgearbeitetes Kapitel fehlt. Prüfungsumfang offen. Fehlerfortpflanzung und Dreifachintegrale aus Heine sind Vertiefung mit unbelegter Prüfungsrelevanz. Das fachfremde tasks/1_Grundlagen.pdf gehört nicht zu diesem Kurs.</p>
    <p>Fachliche Korrektur: Im Hauptskript, S. 34 / PDF 38, liefert das Regressionssystem des Beispiels 6.1 tatsächlich β₀=1/3 und β₁=3/2. Die dort gedruckten Koeffizienten sind falsch. Weitere Präzisierungen: strikte Konvexität braucht Rang; positiv definite Hesse ist hinreichend, nicht notwendig für ein Minimum.</p>
    <div className="am-table-wrap"><table><thead><tr><th>Kapitel / Familie</th><th>Lernziel</th><th>Quelle</th><th>Trainer / Test</th></tr></thead><tbody>{units.map(unit=><tr key={unit.id}><th>{unit.id}</th><td>{unit.title}</td><td>{unit.source.file}<br/>Kap. {unit.source.chapter}, S. {unit.source.printed}, PDF {unit.source.pdf}</td><td>{courses.find(c=>c.chapters.includes(unit.chapter))?.title}<br/>{unit.supplementary?"Vertiefung":`Vorstufe, Anwendung, selbstständig, Transfer; Probeklausuren A/B/C (Kap. ${unit.chapter})`}</td></tr>)}</tbody></table></div>
  </section>;
}
