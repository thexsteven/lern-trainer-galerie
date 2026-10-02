import React, { useState } from "react";
import CourseTrainer from "../../../components/CourseTrainer.jsx";

const base = "https://luc-debug.github.io/fullstack-lecture/";
const roadmap = [
  ["Orientierung", "introduction", "S. 5–14", "Voraussetzungen, Kursaufbau und Portfolio einordnen.", "Materialübersicht vorhanden"],
  ["Browser, Server & HTTP", "web-basics-advanced", "S. 3–23", "Request und Response zerlegen; einen Datenfluss verfolgen.", "Erste Lerneinheit verfügbar"],
  ["JavaScript", "javascript-advanced", "S. 4–56", "Array-Ergebnisse schrittweise berechnen; filter, map, find, reduce, ?:, &&, ||, ??, ?., Destructuring, Spread und Rest anwenden.", "Weitere Einheit geplant"],
  ["Webarchitektur", "evolution-of-web-architecture", "S. 3–26", "Statisch, MPA, AJAX, SPA und MVC vergleichen; ein Accordion imperativ und deklarativ erklären.", "Weitere Einheit geplant"],
  ["React-Komponenten & State", "frontend-advanced", "S. 8–61", "Eine UI zerlegen; essenziellen und abgeleiteten State unterscheiden; lokalen, geteilten und globalen State sowie Speicherorte begründen; den Fünf-Schritte-Workflow anwenden.", "Weitere Einheit geplant"],
  ["Frontend-Werkzeuge", "frontend-tooling", "S. 6–23", "Dev-Server, HMR, Transpiler, Polyfill, Bundler, Dependency Graph, Cache Busting, Source Maps, Linter und Formatter passenden Problemen zuordnen.", "Weitere Einheit geplant"],
  ["HTTP vertiefen", "web-basics-advanced", "S. 6–12, 22, 24–32", "IP, NAT, IPv6, DHCP und Subnetze einordnen; HTTP-Versionen, Accept, Content-Type und Kompression unterscheiden.", "Weitere Einheit geplant"],
  ["REST-APIs", "api", "S. 4–38", "Ressourcen und Methoden kombinieren; sechs REST-Prinzipien, Idempotenz, Dokumentation und Versionierung anhand konkreter Requests begründen.", "Weitere Einheit geplant"],
  ["Backend-Logik", "business-logic", "S. 2–9", "Middleware und Handler in einer Request-Pipeline ordnen; Abbruchpfade und Verantwortlichkeiten im Sequenzdiagramm erklären.", "Weitere Einheit geplant"],
  ["Datenbanken", "database", "S. 3–43", "SQL/NoSQL unterscheiden; CRUD und SELECT-Abfragen auswerten; Schlüssel, Kardinalitäten, ER-Modelle, INNER und LEFT JOIN anwenden.", "Weitere Einheit geplant"],
  ["Git", "git", "S. 2–25", "Working Tree, Index und Historie verfolgen; revert, reset-Modi und stash auswählen; Merge-Konflikte fachlich auflösen.", "Weitere Einheit geplant; parallel zum Programmieren üben"],
  ["Portfolio", "examination", "S. 2–4", "Technologien und Bewertung mit den eigenen Architekturentscheidungen und der Workflow-Dokumentation verbinden.", "Anforderungen gesichtet; Vertiefung geplant"],
];

const units = [{
  shortTitle: "Browser → Server → Browser",
  title: "Eine Webanfrage vom Klick bis zur Anzeige verstehen",
  lead: "Du klickst auf einen Benutzer. Der Browser fragt den Server nach dessen Daten. Der Server verarbeitet die Anfrage und antwortet. Erst danach kann das Frontend die erhaltenen Daten darstellen. Diese Rollen bilden das Fundament für React, APIs und Backend-Code.",
  sections: [
    { title: "Was läuft wo?", body: "Der Client ist das Programm, das eine Anfrage stellt – hier der Browser. Das Frontend ist die Benutzeroberfläche mit HTML (Struktur), CSS (Gestaltung) und JavaScript (Verhalten). Das Backend läuft auf dem Server, verarbeitet Anfragen und setzt Regeln durch. Eine Datenbank speichert Daten dauerhaft. Die API ist die vereinbarte Schnittstelle: Sie legt fest, welche Anfragen erlaubt sind und wie Antworten aussehen. Nicht jede Anfrage braucht eine Datenbank." },
    { title: "Wie kommt die Anfrage an?", body: "Bei https://example.org/users/7 ist https das Schema, example.org der Hostname und /users/7 der Pfad. DNS übersetzt einen Namen in eine IP-Adresse. IP ermöglicht Adressierung und Weiterleitung; TCP transportiert einen geordneten, zuverlässigen Datenstrom. Ein Port kennzeichnet den Dienst, etwa 443 für HTTPS. HTTPS schützt HTTP durch TLS. Für diese Einheit betrachten wir HTTP/1.1 über TCP; HTTP/3 nutzt QUIC über UDP." },
    { title: "Request: Was möchte der Client?", body: "Ein HTTP/1.1-Request besteht aus Startzeile, Headern, Leerzeile und gegebenenfalls Body. GET /users/7 HTTP/1.1 nennt Methode, Zielpfad und Version. GET fragt eine Darstellung ab; POST kann beispielsweise einen Benutzer anlegen. Header sind Metadaten: Host benennt den Zielhost, Accept nennt gewünschte Antwortformate. Der Body enthält Nutzdaten, etwa ein JSON-Objekt beim Anlegen. JSON ist ein textuelles Datenformat, kein laufender JavaScript-Code." },
    { title: "Response: Was ist passiert?", body: "Die Response enthält Statuszeile, Header, Leerzeile und gegebenenfalls Body. 200 bedeutet Erfolg, 201 erfolgreich angelegt, 400 fehlerhafte Anfrage und 404 Ressource nicht gefunden. 5xx bezeichnet Serverfehler. Content-Type: application/json beschreibt das Format des Bodys. Die Leerzeile trennt Metadaten und Nutzdaten. Ein Statuscode ist kein Benutzername, und JSON zeichnet noch keine Oberfläche: Das Frontend muss die Daten auswerten und anzeigen." },
    { title: "Zustandslos heißt nicht ohne gespeicherte Daten", body: "HTTP bringt von sich aus keine Erinnerung an vorherige Anfragen mit. Anwendungen können trotzdem Benutzer und andere Daten speichern und Sitzungen ergänzen. Eine Datenbank und der aktuelle UI-State sind verschiedene Dinge: Eine Anzeige im Browser beweist noch nicht, dass etwas dauerhaft auf dem Server gespeichert wurde." },
  ],
  example: "Eigenes Beispiel in Anlehnung an die native Node-HTTP-Aufgabe: Du öffnest Benutzer 7. Das Frontend sendet GET /users/7 mit Accept: application/json. Der Handler sucht Benutzer 7 und antwortet mit Status 200, Content-Type: application/json und dem Body {\"id\":7,\"name\":\"Mira\"}. Das Frontend liest die Antwort und zeigt Mira an. Fehlt Benutzer 7, antwortet der Handler mit 404; das Frontend zeigt eine passende Fehlermeldung. Weder die Anfrage noch die Antwort ist bereits die fertige Anzeige.",
  source: "web-basics-advanced.pdf, S. 4, 11–21; api.pdf, S. 14–15; database.pdf, S. 20–21. Eigene Erläuterungen und Beispiele ergänzen die Folien. Originalübung: web-basics-advanced/tasks/01-native-node-http-api/task.md.",
  quiz: {
    question: "GET /users/7 liefert 200 und einen JSON-Body. Wer macht daraus die sichtbare Benutzerkarte?",
    choices: ["DNS, sobald der Hostname aufgelöst ist", "Das Frontend, nachdem es die Antwort ausgewertet hat", "Der Statuscode 200 selbst", "Die Datenbank durch direkte Änderung des Browser-DOM"],
    answer: 1,
    explanation: "Der Server liefert hier Daten in einer HTTP-Response. Das Frontend verarbeitet sie und erzeugt daraus die Anzeige. DNS findet eine Adresse; der Statuscode beschreibt das Ergebnis; die Datenbank zeichnet keine Browseroberfläche.",
  },
  diagnostic: {
    question: "Welcher Teil der Response enthält hier den Namen Mira?",
    choices: ["Der Body {\"id\":7,\"name\":\"Mira\"}", "Der Statuscode 200", "Der Request-Pfad /users/7"],
    answer: 0,
    feedback: "Trenne Ergebnis und Inhalt: 200 meldet Erfolg; erst der Body enthält die Benutzerdaten. Überlege anschließend, welches Programm diese Daten in eine Anzeige verwandelt.",
    firstStep: "Markiere zuerst den Body. Im JSON-Objekt steht name: Mira. Diese Daten muss das Frontend lesen, bevor es den Namen darstellen kann.",
  },
  cheat: { title: "Datenfluss einer HTTP-Anfrage", when: "Wenn du beim Lesen von Webcode nicht weißt, welche Rolle gerade handelt.", steps: "1. Client-Aktion finden. 2. Methode und Pfad lesen. 3. Backend-Verarbeitung bestimmen. 4. Status, Content-Type und Body getrennt betrachten. 5. Frontend-Reaktion erklären.", example: "GET /users/7 → Handler sucht → 200 + JSON → Frontend zeigt Mira." },
  guided: {
    title: "Eine Antwort konstruieren",
    prompt: "GET /users/99 fragt nach einem Benutzer, der nicht existiert. Der Server soll einen JSON-Fehler liefern. Welche Antwort passt?",
    choices: ["200; Content-Type: text/html; Body: Benutzer angelegt", "404; Content-Type: application/json; Body: {\"error\":\"Benutzer nicht gefunden\"}", "201; Content-Type: application/json; Body: {}"],
    answer: 1,
    hint: "Bestimme zuerst das Ergebnis: gesucht, aber nicht gefunden. Wähle danach unabhängig davon das angekündigte Body-Format.",
    explanation: "404 beschreibt die fehlende Ressource. application/json kündigt das JSON-Fehlerobjekt an. 201 würde eine erfolgreiche Neuanlage melden, die hier nicht stattgefunden hat.",
  },
  transfer: {
    title: "Neue Situation ohne Cheat Sheet",
    prompt: "POST /users sendet {\"name\":\"Lea\",\"role\":\"student\"}. Der Server legt Lea erfolgreich an und liefert ihre Daten als JSON zurück. Welche vollständige Kette passt?",
    choices: ["Frontend sendet → Backend legt an → 201 + application/json + Benutzerdaten → Frontend aktualisiert die Liste", "Frontend sendet → DNS legt Lea an → 404 → Frontend meldet Erfolg", "Frontend sendet → Backend legt an → 201 ersetzt automatisch die Browseroberfläche"],
    answer: 0,
    explanation: "Der Request transportiert Eingaben, das Backend verarbeitet sie, 201 meldet die erfolgreiche Neuanlage und der JSON-Body enthält Daten. Die anschließende Anzeige ist Aufgabe des Frontends.",
  },
  reflection: "Entwirf selbst den Ablauf einer Buchsuche: Formuliere Methode und Pfad, eine erfolgreiche Response mit Status und Body sowie die Reaktion der Oberfläche. Erkläre daneben den Fall, dass ein bestimmtes Buch nicht existiert. Welche Teile laufen im Browser, welche auf dem Server? Vergleiche deinen Ablauf mit dem durchgearbeiteten Beispiel.",
}];

const entryQuestions = [
  { question: "Wo läuft das JavaScript einer React-Oberfläche?", choices: ["Im Browser", "Immer in der Datenbank", "Weiß ich noch nicht"], answer: 0, explanation: "Die React-Oberfläche läuft im Browser. JavaScript kann zusätzlich als Backend-Code auf einem Server laufen." },
  { question: "Was fordert GET /users/7 an?", choices: ["Das Löschen aller Benutzer", "Eine Darstellung von Benutzer 7", "Weiß ich noch nicht"], answer: 1, explanation: "GET fordert Daten an; /users/7 bezeichnet hier die Ressource Benutzer 7." },
  { question: "Eine API antwortet mit JSON. Ist damit schon eine Benutzerkarte gezeichnet?", choices: ["Ja, JSON ist die Oberfläche", "Nein, das Frontend muss die Daten darstellen", "Weiß ich noch nicht"], answer: 1, explanation: "JSON transportiert strukturierte Daten. Das Frontend macht daraus die sichtbare Oberfläche." },
];

export default function FullstackVerstehen({ onLearningResult }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  return (
    <>
      <section className="ct-shell" style={{ minHeight: "auto", paddingBottom: 0 }}>
        <header className="ct-hero">
          <p className="ct-kicker">WEB ENGINEERING 2 · DEINE VORLESUNG</p>
          <h1>Fullstack Schritt für Schritt</h1>
          <p>Für Einsteiger-Grundwissen: erst Zusammenhänge verstehen, dann anwenden. Die erste Einheit ist ausgearbeitet; die Übersicht zeigt den übrigen Lernstoff und die dafür vorgesehenen Übungen.</p>
        </header>
        <section className="ct-unit" aria-label="Einstiegsfragen">
          <div className="ct-reading">
            <h2>Kurzer Einstieg ohne Hilfsmittel</h2>
            <p>Auch beim Wiedereinstieg zuerst diese Fragen beantworten. Deine Antworten werden erst nach „Einstieg prüfen“ ausgewertet; daraus entsteht keine pauschale Bewertung deines Wissens.</p>
            {entryQuestions.map((task, index) => (
              <fieldset key={task.question} style={{ margin: "18px 0", border: "1px solid #243a56", borderRadius: 10 }}>
                <legend>{task.question}</legend>
                <div className="ct-choices">
                  {task.choices.map((choice, choiceIndex) => (
                    <label key={choice}>
                      <input type="radio" name={`web-entry-${index}`} checked={answers[index] === choiceIndex} disabled={checked} onChange={() => setAnswers((current) => ({ ...current, [index]: choiceIndex }))} /> {choice}
                    </label>
                  ))}
                </div>
                {checked && <p role="status">{answers[index] === task.answer ? "Richtig. " : "Hier lohnt sich die Grundlagen-Erklärung. "}{task.explanation}</p>}
              </fieldset>
            ))}
            <button className="ct-primary" disabled={checked || Object.keys(answers).length !== entryQuestions.length} onClick={() => setChecked(true)} type="button">Einstieg prüfen</button>
            {checked && <button className="ct-secondary" onClick={() => { setAnswers({}); setChecked(false); }} type="button">Einstieg wiederholen</button>}
          </div>
        </section>
        <section className="ct-unit" aria-label="Gesamter Lernpfad">
          <div className="ct-reading">
            <h2>Dein Lernpfad durch die Unterlagen</h2>
            <p>Die Reihenfolge folgt den Voraussetzungen. Git begleitet die praktische Arbeit. Ein geplanter Abschnitt ist noch keine verfügbare Übung. Die Originalfolien und Aufgaben bleiben über die Quellenlinks erreichbar.</p>
            {roadmap.map(([title, deck, pages, practice, status], index) => (
              <details key={title} style={{ padding: "12px 0", borderBottom: "1px solid #243a56" }}>
                <summary style={{ cursor: "pointer" }}>{String(index + 1).padStart(2, "0")} · {title} — {status}</summary>
                <p>{practice}</p>
                <p className="ct-source"><a href={`${base}pdf/${deck}.pdf`} target="_blank" rel="noreferrer" style={{ color: "#59d8c5" }}>{deck}.pdf, {pages}</a> · <a href={`${base}${deck}/`} target="_blank" rel="noreferrer" style={{ color: "#59d8c5" }}>Vorlesungsfolien</a></p>
              </details>
            ))}
            <p>Portfolio: Die vorliegenden Prüfungsfolien nennen React, TypeScript in Frontend und Backend, shadcn.ui, Tailwind CSS und Drizzle sowie SWAPI. Sie bewerten Codequalität und dokumentierten Frontend-Workflow. Konkrete Anwendungsfunktionen sind dort nicht vollständig beschrieben. Diese Werkzeuge benötigen später zusätzliche Erklärungen.</p>
          </div>
        </section>
      </section>
      <CourseTrainer title="Vom Klick zur Antwort" subtitle="Lies die Grundlagen, löse das Quiz und wende den Ablauf selbst an. Bei Fehlern folgt ein Zwischenschritt mit gezieltem Hinweis. Die Transferaufgabe kommt ohne Hilfe aus. Fortschritt und Notizen innerhalb dieser Einheit gelten nur für die aktuelle Sitzung." course="Web Engineering 2" units={units} onLearningResult={onLearningResult} />
    </>
  );
}
