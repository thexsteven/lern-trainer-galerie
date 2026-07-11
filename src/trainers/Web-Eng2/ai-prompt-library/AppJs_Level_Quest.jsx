import React, { useState, useEffect } from "react";

/*
  app.js Level-Quest — Modul 1 des Lernpfads als spielbarer Trainer.

  Der Markdown-Walkthrough (docs/lernpfad/01-frontend-appjs.md im
  ai-prompt-lib-Projekt) als interaktive Quest:
  - 7 Levels + Boss-Fight, sequentiell freigeschaltet (Fokus!)
  - XP-System mit Rängen, Fortschritt bleibt via localStorage erhalten
  - Code-Zeilen mit ● sind klickbar und verraten ihr WARUM
  - Experimente (in der echten App ausprobieren) + Quizfragen schalten
    das Level frei → Belohnungs-Overlay

  Eigenständig: kein Import außer React. Dark-Theme wie die übrigen Trainer.
*/

// ─── Design-System ───────────────────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  panel:   "#171a23",
  panel2:  "#1e222e",
  line:    "#2a2f3d",
  text:    "#e6e8ee",
  dim:     "#9aa1b1",
  accent:  "#f7df1e", // JS-Gelb
  accent2: "#7dd3fc", // Cyan – Browser/DOM
  accent3: "#a78bfa", // Violett – async/Netz
  good:    "#86efac",
  bad:     "#fca5a5",
  gold:    "#fcd34d",
};
const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const mono = '"JetBrains Mono","Fira Code","SFMono-Regular",Consolas,monospace';

const STYLES = `
@keyframes aq-pop { 0% { transform: scale(.55); opacity: 0; } 65% { transform: scale(1.06); } 100% { transform: scale(1); opacity: 1; } }
@keyframes aq-fall { 0% { transform: translateY(-8vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(112vh) rotate(400deg); opacity: .4; } }
@keyframes aq-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
@keyframes aq-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,0); } 50% { box-shadow: 0 0 22px 2px rgba(252,211,77,.25); } }
.aq-shake { animation: aq-shake .28s ease 2; }
.aq-lvlbtn { transition: transform .15s ease, background .15s ease; }
.aq-lvlbtn:not(:disabled):hover { transform: translateY(-2px); }
.aq-line:hover { background: rgba(247,223,30,0.06); }
`;

const P = ({ children, style }) => (
  <p style={{ color: C.text, fontSize: 15.5, lineHeight: 1.75, margin: "0 0 14px", ...style }}>{children}</p>
);
const K = ({ children }) => (
  <code style={{ fontFamily: mono, fontSize: 13, background: C.panel2, border: `1px solid ${C.line}`,
    color: C.accent, padding: "1px 6px", borderRadius: 5, whiteSpace: "nowrap" }}>{children}</code>
);

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
      padding: "20px 22px", margin: "0 0 18px", ...style }}>{children}</div>
  );
}

function Box({ title, color = C.accent3, icon = "💡", children }) {
  return (
    <div style={{ background: "rgba(167,139,250,0.06)", border: `1px solid ${C.line}`,
      borderLeft: `4px solid ${color}`, borderRadius: 12, padding: "14px 18px", margin: "18px 0" }}>
      <div style={{ fontWeight: 700, color, marginBottom: 6, fontSize: 14.5 }}>{icon} {title}</div>
      <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// Einfacher Codeblock (z. B. für Konsolen-Befehle in Experimenten)
function Mini({ code }) {
  return (
    <pre style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
      padding: "10px 14px", margin: "10px 0", overflowX: "auto",
      fontFamily: mono, fontSize: 12.5, lineHeight: 1.7, color: C.accent2 }}>{code}</pre>
  );
}

// ─── CodeWalk: echter Code, Zeilen mit ● sind klickbar → WARUM ───────────────
function CodeWalk({ file = "frontend/app.js", lines }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12,
      overflow: "hidden", margin: "16px 0" }}>
      <div style={{ padding: "7px 14px", borderBottom: `1px solid ${C.line}`, display: "flex",
        justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: C.dim, fontFamily: mono, fontSize: 12 }}>{file}</span>
        <span style={{ color: C.accent, fontFamily: sans, fontSize: 12 }}>
          ● Zeile anklicken → das <b>Warum</b>
        </span>
      </div>
      <div style={{ padding: "10px 0", overflowX: "auto" }}>
        {lines.map((ln, i) => (
          <React.Fragment key={i}>
            <div
              className={ln.n ? "aq-line" : undefined}
              onClick={ln.n ? () => setOpen(open === i ? null : i) : undefined}
              style={{ display: "flex", padding: "1px 14px", fontFamily: mono, fontSize: 13,
                lineHeight: 1.7, cursor: ln.n ? "pointer" : "default",
                background: open === i ? "rgba(247,223,30,0.09)" : "transparent" }}>
              <span style={{ width: 20, flexShrink: 0, color: C.accent, userSelect: "none" }}>
                {ln.n ? "●" : ""}
              </span>
              <span style={{ whiteSpace: "pre", color: ln.dim ? C.dim : C.text }}>{ln.c}</span>
            </div>
            {open === i && (
              <div style={{ margin: "6px 14px 10px 34px", padding: "10px 14px",
                background: C.panel2, borderLeft: `3px solid ${C.accent}`, borderRadius: 8,
                color: C.text, fontFamily: sans, fontSize: 14, lineHeight: 1.65 }}>
                {ln.n}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Experiment-Aufgabe mit Abhak-Checkbox ───────────────────────────────────
function Task({ id, ctx, title, children }) {
  const done = !!ctx.st.tasks[id];
  return (
    <div style={{ background: done ? "rgba(134,239,172,0.06)" : C.panel2,
      border: `1px solid ${done ? C.good : C.line}`, borderRadius: 12,
      padding: "14px 16px", margin: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button
          onClick={() => ctx.toggleTask(id)}
          aria-label={done ? "Experiment als offen markieren" : "Experiment als erledigt markieren"}
          style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, cursor: "pointer",
            border: `2px solid ${done ? C.good : C.dim}`,
            background: done ? C.good : "transparent",
            color: "#0f1117", fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
          {done ? "✓" : ""}
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: done ? C.good : C.accent2, fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>
            ⚡ Experiment: {title}
          </div>
          <div style={{ color: C.text, fontSize: 14, lineHeight: 1.65 }}>{children}</div>
          {!done && (
            <div style={{ color: C.dim, fontSize: 12.5, marginTop: 8 }}>
              Erst in der echten App ausprobieren, dann abhaken → XP!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz (Single Choice, Antwort bleibt gespeichert) ────────────────────────
function Quiz({ id, q, options, correct, explain, ctx }) {
  const chosen = ctx.st.quiz[id];
  const solved = chosen === correct;
  const [shake, setShake] = useState(false);
  const pick = (i) => {
    if (solved) return;
    ctx.answer(id, i);
    if (i !== correct) { setShake(true); setTimeout(() => setShake(false), 600); }
  };
  return (
    <div className={shake ? "aq-shake" : undefined}
      style={{ background: C.panel2, border: `1px solid ${solved ? C.good : C.line}`,
        borderRadius: 12, padding: "14px 16px", margin: "14px 0" }}>
      <div style={{ color: solved ? C.good : C.gold, fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>
        {solved ? "✅" : "❓"} Quiz: {q}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((opt, i) => {
          const isChosen = chosen === i;
          const showGood = solved && i === correct;
          const showBad = isChosen && !solved && chosen !== undefined;
          return (
            <button key={i} onClick={() => pick(i)}
              style={{ textAlign: "left", fontFamily: sans, fontSize: 14, lineHeight: 1.55,
                padding: "9px 13px", borderRadius: 9, cursor: solved ? "default" : "pointer",
                background: showGood ? "rgba(134,239,172,0.12)" : showBad ? "rgba(252,165,165,0.10)" : C.panel,
                border: `1px solid ${showGood ? C.good : showBad ? C.bad : C.line}`,
                color: showGood ? C.good : showBad ? C.bad : solved ? C.dim : C.text }}>
              <b style={{ marginRight: 8, fontFamily: mono }}>{String.fromCharCode(65 + i)}</b>
              {opt}
            </button>
          );
        })}
      </div>
      {showFeedback(chosen, correct, solved, explain)}
    </div>
  );
}
function showFeedback(chosen, correct, solved, explain) {
  if (chosen === undefined) return null;
  if (!solved) {
    return <div style={{ color: C.bad, fontSize: 13.5, marginTop: 10 }}>
      Nicht ganz — überleg nochmal und probier eine andere Antwort.</div>;
  }
  return (
    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(134,239,172,0.07)",
      borderLeft: `3px solid ${C.good}`, borderRadius: 8, color: C.text, fontSize: 13.5, lineHeight: 1.65 }}>
      {explain}
    </div>
  );
}

// ─── Level-Inhalte ───────────────────────────────────────────────────────────
// (Der echte Code stammt 1:1 aus ai-prompt-lib …/frontend/app.js)

function L1({ ctx }) {
  return (
    <>
      <P>Die ersten 13 Zeilen sind das Fundament der ganzen Datei: die Adresse des
        Backends, der <b>komplette Zustand</b> der App (nur 3 Variablen!) und zwei
        Mini-Helfer. Klick dich durch die ●-Zeilen:</P>
      <CodeWalk lines={[
        { c: '"use strict";', n: <>Schaltet den <b>strikten Modus</b> ein: JavaScript verzeiht weniger.
          Ohne ihn erzeugt ein Tippfehler wie <K>curentUser = x</K> klammheimlich eine <i>neue globale
          Variable</i> statt eines Fehlers — solche Bugs sucht man stundenlang.</> },
        { c: "" },
        { c: 'const API_BASE = `http://${location.hostname || "localhost"}:8000`;',
          n: <>Die Backend-Adresse, <b>einmal</b> definiert statt 20-mal verstreut. <K>location.hostname</K> ist
          der Host der aktuellen Seite. Warum nicht fest <K>"localhost"</K>? Öffnest du die Seite übers
          WLAN (<K>http://192.168.1.5:5500</K>), zeigt <K>API_BASE</K> automatisch auf die richtige
          IP — ohne Codeänderung.</> },
        { c: "" },
        { c: "let currentUser = null;", n: <>Wer ist eingeloggt? <K>null</K> = niemand. Zusammen mit den
          zwei Zeilen darunter ist das der <b>gesamte Zustand (State)</b> der App. Merke: <K>let</K> nur
          dort, wo sich der Wert ändern <i>muss</i> — alles andere ist <K>const</K>.</> },
        { c: "let tagsCache = [];", n: <>Die zuletzt geladenen Tags, zwischengespeichert. Zwei verschiedene
          Stellen der UI brauchen dieselben Tags (Checkbox-Liste + Tag-Tabelle) — einmal laden reicht.</> },
        { c: "let editingPromptId = null;", n: <>Der <b>Modus-Schalter</b> des Prompt-Formulars:
          <K>null</K> heißt „neu anlegen", eine Zahl heißt „Prompt mit dieser ID bearbeiten".
          Level 6 dreht sich komplett um diese Variable.</> },
        { c: "" },
        { c: "const $ = (sel) => document.querySelector(sel);",
          n: <>Selbstgebaute Abkürzung: <K>document.querySelector("#toast")</K> sucht das Element mit
          <K>id="toast"</K> im HTML — das braucht die Datei dutzendfach, also kurz <K>$("#toast")</K>.
          Das <K>$</K> ist reine Konvention (aus jQuery-Zeiten). Rechts steht eine <b>Arrow Function</b>:
          Kurzform für <K>function (sel) {"{"} return … {"}"}</K>.</> },
        { c: 'const isAdmin = () => currentUser?.role === "admin";',
          n: <>Warum eine <b>Funktion</b> und keine Variable? Eine beim Login gesetzte Variable könnte
          <i>veralten</i>, wenn sich <K>currentUser</K> ändert (Logout!). Die Funktion fragt bei jedem
          Aufruf frisch nach. Und <K>?.</K> (Optional Chaining) verhindert den Crash: ist
          <K>currentUser</K> gerade <K>null</K>, kommt <K>undefined</K> heraus statt eines Fehlers.</> },
      ]} />
      <Box title="Fundament — just in time" icon="📚">
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          <li><K>const</K> vs. <K>let</K>: <K>const</K> = nicht neu zuweisbar. Faustregel hier: alles
            <K>const</K>, außer den 3 State-Variablen.</li>
          <li>Template-String: <K>{"`http://${x}:8000`"}</K> — Backticks; <K>{"${…}"}</K> fügt einen Wert
            mitten in den Text ein.</li>
          <li>Arrow Function ohne <K>{"{ }"}</K> gibt das Ergebnis automatisch zurück.</li>
        </ul>
      </Box>
      <Task id="l1t1" ctx={ctx} title="Der State zum Anfassen">
        App starten (<K>docker compose up</K>), <K>http://localhost:5500</K> öffnen, <b>F12</b> →
        Tab „Konsole", dann eintippen:
        <Mini code={`API_BASE      // → "http://localhost:8000"
$("#toast")   // → das Toast-Element (Maus drüber halten!)
currentUser   // → dein User-Objekt oder null`} />
      </Task>
      <Quiz id="l1q1" ctx={ctx}
        q={<>Niemand ist eingeloggt (<K>currentUser</K> ist <K>null</K>). Was liefert <K>currentUser?.role</K>?</>}
        options={[
          "Einen Fehler: „Cannot read properties of null“ — die App stürzt ab.",
          "undefined — das ?. fängt den null-Fall ab, isAdmin() liefert einfach false.",
          "Den String \"user\", weil das der Standardwert der Rolle ist.",
        ]}
        correct={1}
        explain={<>Genau. <K>?.</K> bricht die Kette bei <K>null</K>/<K>undefined</K> sanft ab.
          Ohne <K>?.</K> wäre <K>null.role</K> ein TypeError — die App wäre kaputt, solange
          niemand eingeloggt ist.</>} />
    </>
  );
}

function L2({ ctx }) {
  return (
    <>
      <P><b>Jede</b> Kommunikation mit dem Backend läuft durch diese eine Funktion.
        Ohne sie müsste jeder der ~15 Server-Aufrufe selbst <K>fetch</K> konfigurieren,
        Cookies mitschicken, JSON umwandeln, Fehler prüfen — 15-mal derselbe Code.
        <K>api()</K> bündelt das <b>einmal</b> (DRY: Don't Repeat Yourself):</P>
      <CodeWalk lines={[
        { c: 'async function api(path, { method = "GET", body } = {}) {',
          n: <>Der zweite Parameter ist ein Objekt, das direkt in <K>method</K> und <K>body</K>
          <b> zerlegt</b> wird (Destructuring). <K>= "GET"</K> ist der Standardwert, das äußere
          <K>= {"{}"}</K> erlaubt, den Parameter ganz wegzulassen: <K>api("/tags")</K> funktioniert.
          Benannte Optionen lesen sich selbsterklärend: <K>{"api(\"/x\", { method: \"POST\" })"}</K>.</> },
        { c: '  const opts = { method, credentials: "include", headers: {} };',
          n: <><b>Die wichtigste Zeile der Datei!</b> Seite auf Port <b>5500</b>, API auf <b>8000</b> —
          für den Browser zwei verschiedene „Origins", und cross-origin schickt er Cookies
          standardmäßig NICHT mit. <K>credentials: "include"</K> erzwingt das Mitschicken.
          Ohne diese Zeile: Login „klappt", aber du wärst sofort wieder ausgeloggt, weil der
          Session-Cookie nie beim Backend ankommt. (Gegenstück im Backend:
          <K>allow_credentials=True</K> in <K>main.py</K>.)</> },
        { c: "  if (body !== undefined) {" },
        { c: '    opts.headers["Content-Type"] = "application/json";',
          n: <>HTTP transportiert nur Text. Dieser Header sagt dem Server, <i>wie</i> er den Text lesen
          soll. FastAPI verweigert JSON-Bodies ohne ihn.</> },
        { c: "    opts.body = JSON.stringify(body);",
          n: <><K>JSON.stringify</K> macht aus dem JS-Objekt <K>{"{username: \"anna\"}"}</K> den Text
          <K>{"'{\"username\":\"anna\"}'"}</K> — erst als Text kann er über die Leitung.</> },
        { c: "  }" },
        { c: "  const res = await fetch(API_BASE + path, opts);",
          n: <><K>fetch</K> schickt die Anfrage ab, <K>await</K> <b>pausiert nur diese Funktion</b> (nicht
          den Browser!), bis die Antwort da ist. So bleibt die Seite bedienbar, obwohl der Server
          Millisekunden bis Sekunden braucht.</> },
        { c: "  if (res.status === 204) return null;",
          n: <>Status 204 = „No Content" — die Antwort auf DELETE (siehe <K>routers/prompts.py</K>,
          <K>status_code=204</K>). Sonderfall nötig, weil <K>res.json()</K> bei leerem Body eine
          Exception werfen würde.</> },
        { c: "  const data = await res.json().catch(() => null);",
          n: <>Antwort-Text → JS-Objekt. Scheitert das Parsen (kaputte/leere Antwort), lieber
          <K>null</K> als Crash. Warum überhaupt parsen bei Fehlern? Auch 400/401-Antworten
          enthalten meist JSON mit einer <K>detail</K>-Meldung — die brauchen wir gleich.</> },
        { c: "  if (!res.ok) throw new Error(extractError(data, res.status));",
          n: <><b>fetch wirft bei HTTP-Fehlern KEINE Exception!</b> Ein 401 oder 500 ist für fetch eine
          „erfolgreiche" Anfrage (es kam ja eine Antwort). <K>res.ok</K> ist nur bei Status 200–299
          <K>true</K>. Diese Zeile übersetzt HTTP-Fehler in echte Exceptions — erst dadurch
          funktioniert überall das bequeme Muster
          <K>{"try { await api(…) } catch (err) { toast(err.message) }"}</K>.</> },
        { c: "  return data;" },
        { c: "}" },
      ]} />
      <Box title="Fundament — synchron vs. asynchron" icon="📚">
        Eine Server-Anfrage dauert. Würde JS solange blockieren, wäre die Seite eingefroren.
        Deshalb gibt <K>fetch</K> sofort ein <b>Promise</b> zurück („Zettel: Ergebnis folgt").
        In einer <K>async function</K> wartet <K>await promise</K> auf das Ergebnis, und der Code
        liest sich trotzdem wie normale Zeilen — ohne Callback-Verschachtelung.
        <K>throw</K> springt dabei zum nächsten umgebenden <K>try/catch</K>, auch über
        <K>await</K>-Grenzen hinweg.
      </Box>
      <Task id="l2t1" ctx={ctx} title="api() live benutzen">
        In der Konsole (eingeloggt):
        <Mini code={`await api("/me")          // → dein User-Objekt
await api("/prompts")     // → Array deiner Prompts
await api("/gibtsnicht")  // → rote Exception! (res.ok war false)`} />
      </Task>
      <Task id="l2t2" ctx={ctx} title="Die Cookie-Magie sehen">
        DevTools → Tab <b>Netzwerk</b> → in der Seite auf „Prompts" klicken → Request
        <K>prompts</K> anklicken → bei den <b>Request-Headern</b> die Zeile
        <K>Cookie: session=…</K> finden. Das ist <K>credentials: "include"</K> in Aktion.
      </Task>
      <Quiz id="l2q1" ctx={ctx}
        q={<>Der Server antwortet mit <b>HTTP 500</b>. Was macht <K>await fetch(…)</K>?</>}
        options={[
          "Es wirft sofort eine Exception — 500 ist schließlich ein Fehler.",
          "Es liefert ganz normal eine Response; erst res.ok === false verrät den Fehler, und api() wirft dann selbst.",
          "Es gibt null zurück, damit der Aufrufer den Fehler ignorieren kann.",
        ]}
        correct={1}
        explain={<>fetch „scheitert" nur bei Netzwerkproblemen (Server nicht erreichbar). Eine
          4xx/5xx-Antwort ist für fetch Erfolg. Deshalb existiert die Zeile
          <K>if (!res.ok) throw …</K> — sie macht aus HTTP-Fehlern echte Exceptions.</>} />
      <Quiz id="l2q2" ctx={ctx}
        q={<>Warum wärst du ohne <K>credentials: "include"</K> nach dem Login „sofort wieder ausgeloggt"?</>}
        options={[
          "Der Login-Request würde fehlschlagen, weil das Passwort unverschlüsselt wäre.",
          "Der Server würde gar keinen Cookie setzen.",
          "Seite (:5500) und API (:8000) sind verschiedene Origins — der Browser würde den Session-Cookie bei Folge-Requests einfach nicht mitschicken.",
        ]}
        correct={2}
        explain={<>Der Login selbst klappt und der Cookie wird gesetzt — aber jeder weitere Request
          (<K>/me</K>, <K>/prompts</K>) käme <i>ohne</i> Cookie beim Backend an → 401. Cross-Origin-Cookies
          gibt es nur mit <K>credentials: "include"</K> (und CORS-seitig <K>allow_credentials=True</K>).</>} />
    </>
  );
}

function L3({ ctx }) {
  return (
    <>
      <P>Fehler passieren — die Frage ist, wie freundlich sie beim Nutzer ankommen.
        Zwei kleine Funktionen kümmern sich darum:</P>
      <CodeWalk lines={[
        { c: "function extractError(data, status) {" },
        { c: '  if (data && typeof data.detail === "string") return data.detail;',
          n: <>Fall 1: FastAPI-<K>HTTPException(detail="Text")</K> → <K>detail</K> ist ein
          <b>String</b>, z. B. „Benutzername ist bereits vergeben." aus <K>routers/auth.py</K>.
          Einfach durchreichen.</> },
        { c: "  if (data && Array.isArray(data.detail)) {" },
        { c: '    return data.detail.map((e) => e.msg).join("; ");',
          n: <>Fall 2: Pydantic-Validierungsfehler (Status 422) → <K>detail</K> ist ein <b>Array</b>
          von Objekten, eins pro fehlerhaftem Feld. <K>.map((e) =&gt; e.msg)</K> zieht aus jedem nur
          die Meldung, <K>.join("; ")</K> klebt sie zu einem String zusammen.</> },
        { c: "  }" },
        { c: "  return `Unerwarteter Fehler (HTTP ${status}).`;",
          n: <>Das Sicherheitsnetz: Server tot, HTML-Fehlerseite statt JSON, was auch immer —
          der Nutzer bekommt trotzdem eine lesbare Meldung.</> },
        { c: "}" },
        { c: "" },
        { c: "let toastTimer = null;" },
        { c: 'function toast(message, type = "error") {' },
        { c: '  const el = $("#toast");' },
        { c: "  el.textContent = message;" },
        { c: "  el.className = `toast ${type}`;",
          n: <>Ersetzt <b>alle</b> CSS-Klassen auf einmal — entfernt dabei praktischerweise auch
          <K>hidden</K> und macht den Toast sichtbar. Die ganze App zeigt/versteckt Dinge nur über
          die CSS-Klasse <K>hidden</K> (<K>display: none</K> in styles.css) — JS ändert nie direkt
          Styles. Saubere Trennung.</> },
        { c: "  clearTimeout(toastTimer);",
          n: <>Das <b>Anti-Flacker-Detail</b>: Kommt Toast B, während Toast A noch läuft, würde As
          alter Timer Toast B nach zu kurzer Zeit wegräumen. Also: alten Timer immer erst löschen.
          Klassischer Bug, elegant vermieden.</> },
        { c: '  toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);',
          n: <><K>setTimeout(fn, 3500)</K> = „führe <K>fn</K> in 3,5 Sekunden aus" — hier: den Toast
          wieder verstecken.</> },
        { c: "}" },
      ]} />
      <Box title="Fundament — map & join" icon="📚">
        <K>[1,2,3].map(x =&gt; x*2)</K> → <K>[2,4,6]</K> und <K>["a","b"].join("; ")</K> →
        <K>"a; b"</K>. Arrays transformieren ohne Schleife — das Duo taucht in JS ständig auf.
      </Box>
      <Task id="l3t1" ctx={ctx} title="Toasts feuern">
        In der Konsole:
        <Mini code={`toast("Hallo, ich bin ein Fehler!")   // roter Toast
toast("Ich bin Erfolg!", "success")   // grüner Toast
toast("A"); toast("B", "success")     // B ersetzt A sofort — dank clearTimeout`} />
      </Task>
      <Quiz id="l3q1" ctx={ctx}
        q={<>Was würde <b>ohne</b> <K>clearTimeout(toastTimer)</K> passieren, wenn zwei Toasts kurz
          nacheinander erscheinen?</>}
        options={[
          "Nichts anderes — setTimeout überschreibt den alten Timer automatisch.",
          "Der alte Timer von Toast A läuft weiter und blendet Toast B viel zu früh aus.",
          "Toast B würde gar nicht angezeigt, weil das Element noch belegt ist.",
        ]}
        correct={1}
        explain={<>Timer laufen unabhängig weiter — <K>setTimeout</K> „überschreibt" nichts.
          As Timer (gestartet z. B. 3 s vor B) würde B nach nur wenigen hundert Millisekunden
          verstecken. Deshalb: alten Timer explizit löschen, dann neuen starten.</>} />
    </>
  );
}

function L4({ ctx }) {
  return (
    <>
      <P>Die App kennt <b>zwei Welten</b> im selben HTML: Login-Ansicht (<K>#authView</K>) und
        Haupt-App (<K>#appView</K>) — genau eine ist sichtbar (Single-Page-App: kein Seitenwechsel,
        JS schaltet nur um). Die Tür in die App ist <b>eine einzige Funktion</b>, <K>enterApp</K> —
        Login, Registrierung UND Session-Wiederherstellung laufen alle durch sie. Ein Weg = ein Ort
        für Bugs.</P>
      <CodeWalk lines={[
        { c: '$("#loginForm").addEventListener("submit", async (e) => {',
          n: <>„Wenn dieses Formular abgeschickt wird, führe diese Funktion aus." Das ist
          <b> ereignisgesteuerte Programmierung</b>: Der Code läuft nicht von oben nach unten,
          sondern wartet auf Ereignisse (Events). <K>e</K> ist das Event-Objekt,
          <K>e.target</K> das auslösende Element (hier: das Formular).</> },
        { c: "  e.preventDefault();",
          n: <>Unterdrückt das <b>Browser-Standardverhalten</b>: Ohne diese Zeile lädt der Browser
          die Seite neu und verschickt die Formulardaten als URL-Parameter (Verhalten von 1995).
          Wir wollen stattdessen selbst per <K>fetch</K> senden — ohne Neuladen.</> },
        { c: "  const f = new FormData(e.target);",
          n: <>Sammelt alle Eingabefelder des Formulars ein. <K>f.get("username")</K> liest das Feld
          mit <K>name="username"</K> aus dem HTML.</> },
        { c: "  try {" },
        { c: '    const user = await api("/login", {' },
        { c: '      method: "POST",' },
        { c: '      body: { username: f.get("username"), password: f.get("password") },' },
        { c: "    });",
          n: <>Fällt dir auf, dass hier <b>kein Token gespeichert</b> wird? Das Backend setzt den
          Session-Cookie per <K>Set-Cookie</K>-Header — mit <K>httponly</K>, d. h. JS <i>kann</i> ihn
          gar nicht lesen (Schutz gegen Cookie-Diebstahl per XSS). Der Browser schickt ihn ab jetzt
          automatisch mit — dank <K>credentials: "include"</K> aus Level 2.</> },
        { c: "    await enterApp(user);" },
        { c: "  } catch (err) {" },
        { c: "    toast(err.message);",
          n: <>Hier landet die Exception aus <K>api()</K> (Level 2) — z. B. „Benutzername oder
          Passwort ist falsch." vom Backend. Ein Muster, überall gleich.</> },
        { c: "  }" },
        { c: "});" },
        { c: "" },
        { c: '  document.querySelectorAll(".admin-only").forEach((el) =>' },
        { c: "    el.classList.toggle(\"hidden\", !isAdmin())",
          n: <>(aus <K>enterApp</K>) Versteckt Admin-Elemente für normale User — aber das ist
          <b>nur Kosmetik</b>! Jeder kann das in den DevTools rückgängig machen. Die <i>echte</i>
          Absicherung ist <K>require_admin</K> im Backend: der Server antwortet trotzdem mit 403.
          <b>Regel fürs Leben: Das Frontend versteckt, das Backend verbietet.</b></> },
        { c: "  );" },
      ]} />
      <Box title="Fundament — Cookies" icon="📚">
        Cookies sind kleine Datenkrümel, die der Server dem Browser gibt („merk dir:
        <K>session=abc123</K>") und die der Browser bei künftigen Anfragen an denselben Host
        automatisch zurückschickt. So erkennt dich der Server wieder, obwohl HTTP selbst
        „vergesslich" (stateless) ist. Nebenbei: Der Logout in app.js hat ein leeres
        <K>catch</K> — selbst wenn der Server tot ist, wirst du lokal ausgeloggt. Ein toter
        Server darf dich nicht am Ausloggen hindern.
      </Box>
      <Task id="l4t1" ctx={ctx} title="httponly beweisen">
        Netzwerk-Tab öffnen, einloggen → im <K>login</K>-Request bei den <b>Response-Headern</b>
        die Zeile <K>set-cookie: session=…; HttpOnly</K> finden. Dann in der Konsole:
        <Mini code={`document.cookie   // → der Session-Cookie fehlt! (httponly = für JS unsichtbar)`} />
      </Task>
      <Task id="l4t2" ctx={ctx} title="Frontend versteckt, Backend verbietet">
        Registriere einen <b>zweiten</b> Account (der ist normaler User). Dann in der Konsole:
        <Mini code={`document.querySelector(".admin-only").classList.remove("hidden")`} />
        Der Admin-Tab erscheint! Klick ihn → das Dashboard bleibt leer, und im Netzwerk-Tab
        siehst du <b>403</b> für <K>/admin/stats</K>.
      </Task>
      <Quiz id="l4q1" ctx={ctx}
        q={<>Was passiert, wenn du <K>e.preventDefault()</K> aus dem Login-Handler löschst?</>}
        options={[
          "Nichts — die Zeile ist nur eine Konvention.",
          "Der Browser lädt die Seite neu und verschickt das Formular auf die klassische Art — unser fetch-Code läuft ins Leere.",
          "Der Login schlägt fehl, weil FormData nicht mehr gefüllt wird.",
        ]}
        correct={1}
        explain={<>Das Standardverhalten von <K>submit</K> ist ein kompletter Seiten-Reload mit
          klassischem Formularversand. <K>preventDefault()</K> schaltet genau das ab, damit
          die Single-Page-App selbst übernehmen kann.</>} />
      <Quiz id="l4q2" ctx={ctx}
        q={<>Ein normaler User macht per DevTools den Admin-Tab sichtbar und ruft das Dashboard auf.
          Warum ist das kein Sicherheitsproblem?</>}
        options={[
          "Weil DevTools-Änderungen nach einem Reload verschwinden.",
          "Weil app.js den Klick abfängt und blockiert.",
          "Weil das Verstecken nur Kosmetik ist — die echte Prüfung (require_admin) sitzt im Backend und antwortet mit 403.",
        ]}
        correct={2}
        explain={<>Alles, was im Browser läuft, kontrolliert der Nutzer. Sicherheitsentscheidungen
          müssen deshalb <i>immer</i> auf dem Server fallen. Das Frontend versteckt nur, um die UI
          aufgeräumt zu halten.</>} />
    </>
  );
}

function L5({ ctx }) {
  return (
    <>
      <P>Nach jeder Änderung wird die Prompt-Tabelle <b>komplett weggeworfen und neu gebaut</b> —
        aus frischen Server-Daten. Warum kein „Flicken" einzelner Zeilen? Ein Renderer, der immer
        alles neu baut, kann nie einen veralteten Zwischenzustand anzeigen. (React verfolgt exakt
        dieselbe Idee, nur automatisiert.)</P>
      <CodeWalk lines={[
        { c: "function renderPromptTable(prompts) {" },
        { c: '  const body = $("#promptTableBody");' },
        { c: "  body.replaceChildren();",
          n: <><K>replaceChildren()</K> ohne Argumente = Tabelle leeren. Schritt 1 von
          „wegwerfen &amp; neu bauen".</> },
        { c: "" },
        { c: "  for (const p of prompts) {" },
        { c: '    const tr = document.createElement("tr");',
          n: <>Warum <K>createElement</K> statt <K>innerHTML = "&lt;tr&gt;…"</K>? Das ist die
          <b> wichtigste Sicherheitsentscheidung im Frontend</b> — siehe die ●-Zeile bei
          <K>cell()</K> unten.</> },
        { c: "    tr.append(cell(p.title));" },
        { c: '    tr.append(cell(p.category || "-"));',
          n: <><K>||</K> gibt den rechten Wert, wenn der linke „falsy" ist (<K>null</K>, <K>""</K>, 0).
          <K>category</K> darf in der DB <K>null</K> sein (<K>models.py</K>: <K>nullable=True</K>) —
          angezeigt wird dann „-".</> },
        { c: "    // … Tags als Pills, Inhalt …", dim: true },
        { c: "    actions.append(" },
        { c: '      button("Bearbeiten", "btn btn-ghost btn-small", () => startEditPrompt(p)),',
          n: <>Der Trick heißt <b>Closure</b>: Die Arrow-Funktion „erinnert sich" an <i>ihr</i>
          <K> p</K> aus genau dieser Schleifenrunde. Jede Zeile bekommt so einen Button, der exakt
          ihren Prompt kennt — ohne IDs im DOM verstecken zu müssen.</> },
        { c: '      button("Loeschen", "btn btn-danger btn-small", () => deletePrompt(p))' },
        { c: "    );" },
        { c: "    body.append(tr);" },
        { c: "  }" },
        { c: "}" },
        { c: "" },
        { c: "function cell(text) {" },
        { c: '  const td = document.createElement("td");' },
        { c: "  td.textContent = text;",
          n: <><b>Hier wohnt die Sicherheit.</b> Mit <K>innerHTML = "&lt;td&gt;" + p.title</K> würde ein
          Titel wie <K>&lt;img src=x onerror="alert(document.cookie)"&gt;</K> als <b>echtes HTML
          ausgeführt</b> — eine XSS-Lücke (Cross-Site-Scripting: fremder Code läuft in deinem
          Browser). <K>textContent</K> behandelt den Wert <i>immer als reinen Text</i>, egal was
          drinsteht. Merke: <b>textContent = sicher, innerHTML mit Nutzerdaten = verboten.</b></> },
        { c: "  return td;" },
        { c: "}" },
      ]} />
      <Box title="Fundament — das DOM" icon="📚">
        Der Browser verwandelt HTML in einen Objektbaum (Document Object Model). JS kann diesen
        Baum lesen und umbauen — <i>das</i> ist „die Seite ändern". <K>createElement</K> erzeugt
        einen Knoten, <K>append</K> hängt ihn ein. Nebenbei: Die Navigation
        (<K>switchView</K>/<K>wireNav</K>) nutzt <K>data-view="prompts"</K>-Attribute im HTML —
        <K> btn.dataset.view</K> liest sie. So bedient <b>ein</b> generischer Listener alle drei
        Nav-Buttons.
      </Box>
      <Task id="l5t1" ctx={ctx} title="Der XSS-Test (sicher!)">
        Lege einen Prompt an, dessen <b>Inhalt</b> (content ist bewusst ohne Zeichen-Beschränkung)
        genau das hier ist:
        <Mini code={`<img src=x onerror="alert('XSS!')">`} />
        → In der Tabelle erscheint der Text <i>als Text</i>, kein Alert. <K>textContent</K> schützt
        dich. (Im Titel würde die Backend-Validierung das eh ablehnen — nur A–Z, 0–9.)
      </Task>
      <Quiz id="l5q1" ctx={ctx}
        q={<>Ein Kommilitone schreibt <K>row.innerHTML = "&lt;td&gt;" + prompt.title + "&lt;/td&gt;"</K>.
          Was hat er gerade möglich gemacht?</>}
        options={[
          "Nichts Schlimmes — innerHTML ist nur langsamer als textContent.",
          "XSS: Ein präparierter Titel wird als echtes HTML/JS im Browser jedes Betrachters ausgeführt.",
          "Ein Speicherleck, weil innerHTML alte Knoten nicht freigibt.",
        ]}
        correct={1}
        explain={<>Nutzerdaten in <K>innerHTML</K> = der Browser parst sie als HTML. Ein Titel wie
          <K>&lt;img src=x onerror="…"&gt;</K> führt beliebigen Code aus — bei <i>jedem</i>, der die
          Tabelle ansieht. Die Ein-Wort-Lösung: <K>textContent</K>.</>} />
      <Quiz id="l5q2" ctx={ctx}
        q={<>Woher „weiß" der Bearbeiten-Button der 5. Tabellenzeile, welcher Prompt gemeint ist?</>}
        options={[
          "Er liest die Zeilennummer aus dem DOM und fragt den Server.",
          "Closure: seine Klick-Funktion wurde in der 5. Schleifenrunde erzeugt und erinnert sich für immer an ihr p.",
          "Alle Buttons teilen sich eine globale Variable lastClickedPrompt.",
        ]}
        correct={1}
        explain={<>Jede Runde der <K>for…of</K>-Schleife erzeugt eine neue Arrow-Funktion
          <K>() =&gt; startEditPrompt(p)</K>, die ihr eigenes <K>p</K> einschließt. Das ist eine
          Closure — eines der mächtigsten JS-Konzepte, hier ganz beiläufig eingesetzt.</>} />
    </>
  );
}

function L6({ ctx }) {
  return (
    <>
      <P>Ein einziges Formular dient zum <b>Anlegen UND Bearbeiten</b> — Anlegen und Bearbeiten
        brauchen exakt dieselben Felder, zwei Formulare hießen doppelter Code. Der Schalter ist
        <K> editingPromptId</K> aus Level 1:</P>
      <CodeWalk lines={[
        { c: "if (editingPromptId === null) {" },
        { c: '  await api("/prompts", { method: "POST", body: payload });',
          n: <>Modus „neu anlegen" → <K>POST /prompts</K>. Das Backend vergibt die ID.</> },
        { c: "} else {" },
        { c: '  await api(`/prompts/${editingPromptId}`, { method: "PUT", body: payload });',
          n: <>Modus „bearbeiten" → <K>PUT /prompts/7</K>. Gleiche Felder, anderes Ziel — deshalb
          reicht EIN Formular mit einer Modus-Variable. Der Preis: Überschrift, Button-Text und
          Abbrechen-Button müssen synchron gehalten werden — genau das tun
          <K> startEditPrompt</K> und <K>resetPromptForm</K>.</> },
        { c: "}" },
        { c: "" },
        { c: "// startEditPrompt(p): Formular in den Bearbeiten-Modus schalten", dim: true },
        { c: "const ids = new Set(p.tags.map((t) => t.id));",
          n: <>Warum <K>Set</K> statt Array? <K>ids.has(x)</K> ist die natürliche „ist enthalten?"-Frage —
          genau dafür ist ein Set da (Sammlung ohne Duplikate, schnelles Nachschlagen).</> },
        { c: 'document.querySelectorAll("#promptTagChecks input").forEach((c) => {' },
        { c: "  c.checked = ids.has(Number(c.value));",
          n: <><b>Die String-Falle:</b> HTML-Attribute sind <i>immer Strings</i> —
          <K>"3" === 3</K> ist in JS <K>false</K>! Ohne <K>Number(…)</K> wäre keine einzige Checkbox
          angehakt, obwohl die IDs „gleich aussehen". Ein klassischer Anfänger-Bug, hier sauber
          gelöst.</> },
        { c: "});" },
        { c: "" },
        { c: "// deletePrompt(p):", dim: true },
        { c: 'if (!confirm(`Prompt "${p.title}" wirklich loeschen?`)) return;',
          n: <><K>confirm()</K> = eingebauter Browser-Dialog mit OK/Abbrechen. Löschen ist
          unumkehrbar → einmal nachfragen. Bei „Abbrechen": <K>return</K>, nichts passiert.</> },
        { c: "// … nach erfolgreichem DELETE:", dim: true },
        { c: "if (editingPromptId === p.id) resetPromptForm();",
          n: <><b>Edge-Case-Denken:</b> Du bearbeitest gerade Prompt 7 und löschst ihn gleichzeitig
          über die Tabelle. Ohne diese Zeile bliebe das Formular im Bearbeiten-Modus für einen
          <i> Geist</i> hängen — „Speichern" gäbe einen 404. Solche Details unterscheiden robusten
          Code von Tutorial-Code.</> },
      ]} />
      <Box title="Fundament — State-getriebene UI" icon="📚">
        Eine Variable (<K>editingPromptId</K>) bestimmt das Verhalten; die UI (Überschrift,
        Buttons) wird bei jedem Moduswechsel daran angeglichen. Dieses Muster — <i>State ändern,
        dann UI anpassen</i> — ist die Essenz aller Frontend-Frameworks. Beim Absenden außerdem:
        <K> title.trim()</K> (Randleerzeichen weg) und <K>category … || null</K> (leeres Feld wird
        sauberes <K>null</K> statt <K>""</K> in der DB). Und nach jeder Änderung:
        <K> await loadPrompts()</K> — <b>das Frontend rät nie, es fragt den Server neu</b>
        (Single Source of Truth).
      </Box>
      <Task id="l6t1" ctx={ctx} title="Den Modus-Schalter beobachten">
        Klicke bei einem Prompt auf „Bearbeiten", dann in der Konsole:
        <Mini code={`editingPromptId   // → die ID des Prompts`} />
        Klicke „Abbrechen" → wieder <K>null</K>. Bonus: Bearbeite Prompt X (nicht speichern!) und
        lösche X über die Tabelle → das Formular springt automatisch zurück. Das ist Zeile
        „<K>if (editingPromptId === p.id) …</K>" in Aktion.
      </Task>
      <Quiz id="l6q1" ctx={ctx}
        q={<>Warum steht in <K>ids.has(Number(c.value))</K> das <K>Number(…)</K>?</>}
        options={[
          "Reine Vorsicht — c.value ist bereits eine Zahl.",
          "HTML-Attribute sind immer Strings, und \"3\" === 3 ist false — ohne Umwandlung fände has() nie einen Treffer.",
          "Set kann nur Zahlen speichern, keine Strings.",
        ]}
        correct={1}
        explain={<>Alles, was aus dem DOM kommt (<K>value</K>, <K>dataset</K>, …), ist ein String.
          JS vergleicht mit <K>===</K> ohne Typumwandlung. Deshalb: an der Grenze zwischen DOM und
          Daten immer explizit konvertieren.</>} />
      <Quiz id="l6q2" ctx={ctx}
        q={<>Du löschst gerade den Prompt, den du parallel im Formular bearbeitest. Was verhindert
          <K>resetPromptForm()</K> an dieser Stelle?</>}
        options={[
          "Dass die Tabelle den gelöschten Prompt weiter anzeigt.",
          "Dass das Formular im Bearbeiten-Modus für einen nicht mehr existierenden Prompt hängen bleibt — „Speichern“ würde 404 liefern.",
          "Dass der DELETE-Request doppelt abgeschickt wird.",
        ]}
        correct={1}
        explain={<>Der State (<K>editingPromptId = 7</K>) würde auf etwas zeigen, das es nicht mehr
          gibt — ein „Geist". Der Reset bringt Formular und State zurück in den Anlegen-Modus.</>} />
    </>
  );
}

function L7({ ctx }) {
  return (
    <>
      <P>Tags und Dashboard nutzen die Muster aus Level 5/6 — hier nur die neuen Ideen, dann der
        spannendste Teil: <b>wie die App startet</b>.</P>
      <Box title="Tags & Dashboard — die 3 neuen Ideen" icon="🏷️" color={C.accent2}>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          <li><b>Cache mit Konsequenz:</b> Nach <K>renameTag</K> wird auch <K>loadPrompts()</K>
            aufgerufen — die Tag-Pillen in der Prompt-Tabelle zeigen sonst noch den alten Namen.
            Wer Daten doppelt anzeigt, muss überall aktualisieren.</li>
          <li><b>Kosmetik vs. Regel (again):</b> Umbenennen/Löschen-Buttons erscheinen nur für
            Admins (<K>isAdmin()</K>) — die echte Regel sitzt in <K>routers/tags.py</K>
            (<K>require_admin</K>).</li>
          <li><b>Generisches Rendering:</b> <K>fillKeyValueTable("#topTagsBody", s.top_tags,
            "name", "count")</K> — „Top-Tags" und „Prompts pro User" sind strukturell identische
            Tabellen, also EIN Renderer mit Feldnamen als Parameter (<K>r[keyField]</K> liest eine
            Eigenschaft, deren <i>Name in einer Variable</i> steckt).</li>
        </ul>
      </Box>
      <CodeWalk lines={[
        { c: "async function init() {" },
        { c: "  wireAuth();" },
        { c: "  wireNav();" },
        { c: "  wirePromptForm();" },
        { c: "  wireTagForm();",
          n: <>Erst werden <b>alle Event-Listener registriert</b> („wire" = verkabeln) — die App
          „hört" jetzt zu. Erst danach wird entschieden, welche Ansicht startet.</> },
        { c: "" },
        { c: "  try {" },
        { c: '    const user = await api("/me");',
          n: <>Der <b><K>/me</K>-Trick</b>: Liegt vom letzten Besuch noch ein gültiger Session-Cookie
          im Browser, antwortet <K>/me</K> mit deinem User → du bist <b>ohne neuen Login sofort
          drin</b> (Session-Wiederherstellung nach F5!).</> },
        { c: "    await enterApp(user);" },
        { c: "  } catch {" },
        { c: "    showAuth();",
          n: <>Kein gültiger Cookie → 401 → <K>api()</K> wirft → <K>catch</K> → Login-Ansicht.
          Ein „Fehler" ist hier also <b>erwarteter Programmfluss</b>, kein Problem.</> },
        { c: "  }" },
        { c: "}" },
        { c: "" },
        { c: 'document.addEventListener("DOMContentLoaded", init);',
          n: <>Garantiert, dass der DOM-Baum fertig ist, bevor <K>init</K> nach Elementen greift.
          <K> $("#loginForm")</K> auf einer halb geladenen Seite wäre <K>null</K> → Crash.</> },
      ]} />
      <Task id="l7t1" ctx={ctx} title="Session-Wiederherstellung erleben">
        Eingeloggt? Drücke <b>F5</b> → du bleibst drin. Im Netzwerk-Tab ist der erste Request
        <K>me</K> (Status 200). Dann: DevTools → <b>Anwendung/Application</b> → Cookies →
        <K>localhost:5500</K> → <K>session</K> löschen → F5 → Login-Ansicht, <K>me</K> liefert 401.
      </Task>
      <Quiz id="l7q1" ctx={ctx}
        q={<>Warum ruft <K>renameTag</K> nach dem Umbenennen zusätzlich <K>loadPrompts()</K> auf?</>}
        options={[
          "Reine Vorsicht — nötig wäre es nicht.",
          "Weil der Server sonst den neuen Namen nicht speichert.",
          "Die Tag-Pillen in der Prompt-Tabelle sind eine zweite Anzeige derselben Daten — ohne Neuladen zeigten sie den alten Namen.",
        ]}
        correct={2}
        explain={<>Dieselben Tag-Daten stecken an zwei Stellen der UI. Nach einer Änderung müssen
          beide neu aus der Quelle (Server) gebaut werden — die Kehrseite jedes Caches.</>} />
    </>
  );
}

// ─── Boss-Fight ──────────────────────────────────────────────────────────────
function BossContent({ ctx }) {
  return (
    <>
      <P style={{ fontSize: 16.5 }}>Fünf Fragen. Alles Gelernte, keine Hilfen. Besiegst du den
        Boss, ist Modul 1 offiziell abgeschlossen. 🗡️</P>
      <Quiz id="bq1" ctx={ctx}
        q={<>Warum wirft <K>api()</K> bei <K>!res.ok</K> selbst eine Exception?</>}
        options={[
          "Weil fetch bei 4xx/5xx keine Exception wirft — erst dadurch funktioniert überall das Muster try/catch + toast(err.message).",
          "Weil FastAPI sonst die Verbindung offen halten würde.",
          "Damit der Browser den fehlgeschlagenen Request automatisch wiederholt.",
        ]}
        correct={0}
        explain={<>fetch meldet nur Netzwerkfehler. HTTP-Fehlerstatus muss man selbst prüfen —
          <K>api()</K> übersetzt sie einmal zentral in Exceptions, damit alle Aufrufer einheitlich
          mit <K>try/catch</K> arbeiten können.</>} />
      <Quiz id="bq2" ctx={ctx}
        q={<>Seite auf :5500, API auf :8000. Welche ZWEI Stellen halten den Session-Cookie über
          diese Port-Grenze am Leben?</>}
        options={[
          "httponly im Cookie und JSON.stringify im Body.",
          'credentials: "include" in app.js UND allow_credentials=True (CORS) in main.py.',
          "Der nginx-Container und das Docker-Volume.",
        ]}
        correct={1}
        explain={<>Beide Seiten müssen zustimmen: Der Browser schickt Cookies cross-origin nur mit
          <K>credentials: "include"</K>, und der Server muss das per CORS
          (<K>allow_credentials=True</K> + explizite Origins) erlauben.</>} />
      <Quiz id="bq3" ctx={ctx}
        q={<>Warum benutzt die gesamte Datei <K>textContent</K> statt <K>innerHTML</K> für Nutzerdaten?</>}
        options={[
          "textContent ist schneller, weil kein HTML geparst wird.",
          "innerHTML funktioniert in älteren Browsern nicht zuverlässig.",
          "XSS-Schutz: innerHTML würde präparierte Eingaben als echtes HTML/JS ausführen — textContent behandelt alles als reinen Text.",
        ]}
        correct={2}
        explain={<>Die Performance ist Nebensache — es geht um Sicherheit. Nutzerdaten in
          <K>innerHTML</K> = fremder Code läuft im Browser jedes Betrachters (Cross-Site-Scripting).</>} />
      <Quiz id="bq4" ctx={ctx}
        q={<>Du bist eingeloggt und drückst F5. Welcher Ablauf ist korrekt?</>}
        options={[
          "Der Browser zeigt die Login-Ansicht, bis du dich neu einloggst.",
          "DOMContentLoaded → init() registriert Listener → api(\"/me\") mit Cookie → 200 → enterApp(user) → loadTags/loadPrompts füllen die Tabellen.",
          "app.js liest den Session-Token aus localStorage und stellt den State wieder her.",
        ]}
        correct={1}
        explain={<>Es gibt keinen Token in localStorage — der httponly-Cookie überlebt den Reload,
          und <K>/me</K> verwandelt ihn zurück in einen User. Schlägt das fehl (401), landet
          <K>init()</K> im <K>catch</K> und zeigt die Login-Ansicht.</>} />
      <Quiz id="bq5" ctx={ctx}
        q={<>Warum ist <K>isAdmin</K> eine Funktion und keine beim Login gesetzte Konstante
          <K>const admin = user.role === "admin"</K>?</>}
        options={[
          "Funktionen sind in JavaScript performanter als Variablen.",
          "Eine beim Login berechnete Konstante würde veralten, wenn sich currentUser ändert (Logout, anderer Login) — die Funktion liest den State immer frisch.",
          "Weil man Konstanten nicht in Template-Strings verwenden kann.",
        ]}
        correct={1}
        explain={<>Abgeleitete Werte, die von veränderlichem State abhängen, berechnet man bei
          Bedarf neu statt sie zu kopieren. Kopien können lügen — Funktionen nicht.</>} />
    </>
  );
}

// ─── Level-Definitionen ──────────────────────────────────────────────────────
const LEVELS = [
  { id: "l1", nr: 1, xp: 10, emoji: "🧱", title: "Der Rahmen",
    sub: "State, $-Helfer & warum isAdmin eine Funktion ist",
    tasks: ["l1t1"], quiz: { l1q1: 1 }, Content: L1 },
  { id: "l2", nr: 2, xp: 25, emoji: "📡", title: "api() — das Herzstück",
    sub: "fetch, Cookies über die Port-Grenze & Fehler als Exceptions",
    tasks: ["l2t1", "l2t2"], quiz: { l2q1: 1, l2q2: 2 }, Content: L2 },
  { id: "l3", nr: 3, xp: 15, emoji: "🍞", title: "Fehler & Toast",
    sub: "Zwei FastAPI-Fehlerformate & das Anti-Flacker-Detail",
    tasks: ["l3t1"], quiz: { l3q1: 1 }, Content: L3 },
  { id: "l4", nr: 4, xp: 20, emoji: "🔐", title: "Login & Registrierung",
    sub: "Events, preventDefault & „Frontend versteckt, Backend verbietet“",
    tasks: ["l4t1", "l4t2"], quiz: { l4q1: 1, l4q2: 2 }, Content: L4 },
  { id: "l5", nr: 5, xp: 20, emoji: "🛡️", title: "Tabellen ohne HTML-Strings",
    sub: "Wegwerfen & neu bauen, Closures & der XSS-Schutz",
    tasks: ["l5t1"], quiz: { l5q1: 1, l5q2: 1 }, Content: L5 },
  { id: "l6", nr: 6, xp: 20, emoji: "🎭", title: "Formular mit Doppelleben",
    sub: "editingPromptId, die String-Falle & Edge-Case-Denken",
    tasks: ["l6t1"], quiz: { l6q1: 1, l6q2: 1 }, Content: L6 },
  { id: "l7", nr: 7, xp: 15, emoji: "🚀", title: "Tags, Dashboard & Startschuss",
    sub: "Cache-Konsequenzen & der /me-Trick beim Start",
    tasks: ["l7t1"], quiz: { l7q1: 2 }, Content: L7 },
];
const BOSS = { id: "boss", nr: 8, xp: 25, emoji: "🐉", title: "Boss-Fight",
  sub: "5 Fragen — alles Gelernte auf einmal",
  tasks: [], quiz: { bq1: 0, bq2: 1, bq3: 2, bq4: 1, bq5: 1 }, Content: BossContent };
const ALL = [...LEVELS, BOSS];
const TOTAL_XP = ALL.reduce((s, l) => s + l.xp, 0); // 150

const levelDone = (lv, st) =>
  lv.tasks.every((t) => !!st.tasks[t]) &&
  Object.entries(lv.quiz).every(([qid, correct]) => st.quiz[qid] === correct);

const RANKS = [
  [0, "Noch ahnungslos 🐣"], [10, "Konsolen-Neuling 🌱"], [35, "fetch-Lehrling 📡"],
  [70, "DOM-Bändiger 🛠️"], [110, "Event-Meister ⚙️"], [150, "app.js-Boss 👑"],
];
const rankFor = (xp) => RANKS.reduce((r, [min, name]) => (xp >= min ? name : r), RANKS[0][1]);

// ─── Persistenz ──────────────────────────────────────────────────────────────
const LS_KEY = "appjs-level-quest-v1";
function useSaved(initial) {
  const [val, setVal] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(LS_KEY) || "{}") }; }
    catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(val)); } catch { /* egal */ }
  }, [val]);
  return [val, setVal];
}

// ─── Belohnungs-Overlay ──────────────────────────────────────────────────────
function Reward({ reward, onClose }) {
  if (!reward) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(10,12,18,0.55)", cursor: "pointer" }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ position: "absolute", top: -30,
          left: `${(i * 137 + 23) % 100}%`, fontSize: 16 + (i % 3) * 8,
          animation: `aq-fall ${2.2 + (i % 5) * 0.35}s linear ${(i % 7) * 0.15}s both` }}>
          {["🎉", "✨", "⭐", "🟡"][i % 4]}
        </span>
      ))}
      <div style={{ background: C.panel, border: `1px solid ${C.gold}`, borderRadius: 20,
        padding: "30px 44px", textAlign: "center", fontFamily: sans,
        animation: "aq-pop .45s cubic-bezier(.2,1.4,.4,1) both",
        boxShadow: "0 24px 70px rgba(0,0,0,.55)" }}>
        <div style={{ fontSize: 46, lineHeight: 1 }}>{reward.emoji}</div>
        <div style={{ color: C.gold, fontSize: 28, fontWeight: 800, margin: "10px 0 2px" }}>
          +{reward.xp} XP
        </div>
        <div style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>
          „{reward.title}" geschafft!
        </div>
        <div style={{ color: C.dim, fontSize: 13, marginTop: 10 }}>
          Gönn dir eine kurze Belohnung ☕ — dein Gehirn speichert in Pausen.
        </div>
      </div>
    </div>
  );
}

// ─── Intro & Finale ──────────────────────────────────────────────────────────
function ArchBox({ label, sub, color }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${color}`, borderRadius: 12,
      padding: "10px 16px", textAlign: "center", minWidth: 130 }}>
      <div style={{ color, fontWeight: 700, fontSize: 14 }}>{label}</div>
      <div style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Intro({ onStart, st }) {
  return (
    <>
      <Card style={{ borderColor: C.accent, animation: "aq-glow 3s ease infinite" }}>
        <div style={{ color: C.accent, fontFamily: mono, fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>
          MODUL 1 · LERNPFAD AI-PROMPT-LIBRARY
        </div>
        <h1 style={{ color: C.text, fontSize: 30, margin: "8px 0 10px", lineHeight: 1.15 }}>
          app.js Level-Quest 🎮
        </h1>
        <P style={{ fontSize: 16 }}>447 Zeilen Vanilla-JavaScript — dein komplettes Frontend.
          7 Levels, 1 Boss, 150 XP. <b>Kein Vorwissen nötig:</b> Jedes Konzept kommt genau dann,
          wenn der Code es braucht.</P>
      </Card>
      <Card>
        <h2 style={{ color: C.text, fontSize: 19, margin: "0 0 12px" }}>🗺️ Das große Ganze</h2>
        <P><K>app.js</K> ist das <b>Gehirn des Frontends</b> — <K>index.html</K> das Skelett,
          <K> styles.css</K> die Haut. Merksatz: <b>Das Frontend ist eine Fernbedienung.</b> Es
          speichert (fast) nichts selbst — jeder Klick wird eine HTTP-Anfrage, die Wahrheit liegt
          beim Backend.</P>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          justifyContent: "center", padding: "10px 0" }}>
          <ArchBox label="Browser" sub="du + app.js" color={C.accent} />
          <span style={{ color: C.dim, fontFamily: mono, fontSize: 12 }}>—fetch + Cookie→</span>
          <ArchBox label="FastAPI :8000" sub="prüft & speichert" color={C.accent3} />
          <span style={{ color: C.dim, fontFamily: mono, fontSize: 12 }}>—SQL→</span>
          <ArchBox label="SQLite" sub="das Gedächtnis" color={C.accent2} />
        </div>
        <P style={{ color: C.dim, fontSize: 13.5, marginTop: 8 }}>Ausgeliefert wird die Seite von
          nginx auf Port 5500 (Modul 2: Docker) — daher das ganze Cookie/CORS-Theater, das du in
          Level 2 verstehen wirst.</P>
      </Card>
      <Card>
        <h2 style={{ color: C.text, fontSize: 19, margin: "0 0 12px" }}>🕹️ Spielregeln</h2>
        <ul style={{ color: C.text, fontSize: 15, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li><b>Ein Level pro Sitzung</b> (15–25 Min). Nicht mehr — dein Gehirn speichert in Pausen.</li>
          <li>Levels schalten sich <b>nacheinander</b> frei: Erledige die ⚡ Experimente in der
            echten App und beantworte die ❓ Quizfragen.</li>
          <li>Nach jedem Level: <b>bewusst belohnen</b> (Kaffee, Musik, 1 Runde irgendwas).
            Klingt albern, konditioniert aber wirklich.</li>
          <li>Fortschritt wird automatisch gespeichert (localStorage) — du kannst jederzeit
            weitermachen.</li>
        </ul>
        <div style={{ marginTop: 14, padding: "10px 14px", background: C.panel2,
          borderRadius: 10, color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
          <b style={{ color: C.accent2 }}>Setup:</b> <K>docker compose up</K> im Projektordner →
          Browser auf <K>http://localhost:5500</K> → <b>F12</b> → Tab „Konsole". Das ist dein
          Spielplatz für die Experimente.
        </div>
      </Card>
      <div style={{ textAlign: "center", margin: "26px 0" }}>
        <button onClick={onStart}
          style={{ background: C.accent, color: "#1a1a00", border: "none", borderRadius: 12,
            padding: "13px 34px", fontSize: 16, fontWeight: 800, cursor: "pointer",
            fontFamily: sans, boxShadow: "0 8px 28px rgba(247,223,30,0.25)" }}>
          {Object.keys(st.tasks).length || Object.keys(st.quiz).length
            ? "▶ Quest fortsetzen" : "▶ Quest starten — Level 1"}
        </button>
      </div>
    </>
  );
}

function Finale({ xp }) {
  const CONNECTIONS = [
    ["API_BASE = …:8000, Seite auf :5500", "docker-compose.yml mappt genau diese zwei Ports", "Modul 2"],
    ['credentials: "include"', "main.py: CORS mit allow_credentials=True", "Modul 3"],
    ["api(\"/login\"), /me, Cookie-Magie", "routers/auth.py + security.py setzen/prüfen den Cookie", "Modul 7/9"],
    ["body: { title, content, tag_ids }", "schemas.py validiert exakt diese Felder (422 → Array-Fall in extractError!)", "Modul 6"],
    ["p.tags als Pills", "models.py: n:m-Beziehung Prompt ↔ Tag", "Modul 5"],
    [".admin-only nur versteckt", "dependencies.py: require_admin verbietet wirklich", "Modul 8"],
  ];
  return (
    <>
      <Card style={{ borderColor: C.gold, textAlign: "center" }}>
        <div style={{ fontSize: 54 }}>🏆</div>
        <h1 style={{ color: C.gold, fontSize: 28, margin: "8px 0 4px" }}>
          Modul 1 abgeschlossen — {xp}/{TOTAL_XP} XP
        </h1>
        <div style={{ color: C.text, fontSize: 15.5 }}>Rang: <b>{rankFor(xp)}</b></div>
      </Card>
      <Card>
        <h2 style={{ color: C.text, fontSize: 19, margin: "0 0 10px" }}>🧠 Mental Model — der Spickzettel</h2>
        <P><b>app.js ist eine Fernbedienung mit Drei-Takt-Motor: zuhören → Server fragen → neu
          zeichnen.</b> Aller Server-Verkehr fließt durch die eine Funktion <K>api()</K>, die
          Cookies mitschickt und HTTP-Fehler in Exceptions übersetzt. Die UI wird nie „geflickt",
          sondern nach jeder Änderung aus frischen Server-Daten komplett neu gebaut —
          ausschließlich mit <K>textContent</K> (XSS-Schutz). Drei Variablen
          (<K>currentUser</K>, <K>tagsCache</K>, <K>editingPromptId</K>) sind der gesamte Zustand;
          das Frontend versteckt nur, <b>verbieten tut immer das Backend</b>.</P>
      </Card>
      <Card>
        <h2 style={{ color: C.text, fontSize: 19, margin: "0 0 12px" }}>🔗 Verbindung zu den anderen Bausteinen</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>
            <thead>
              <tr>
                {["app.js sagt …", "… der Partner antwortet", "wo"].map((h) => (
                  <th key={h} style={{ textAlign: "left", color: C.dim, fontWeight: 600,
                    padding: "6px 10px", borderBottom: `1px solid ${C.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CONNECTIONS.map(([a, b, m]) => (
                <tr key={m + a}>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${C.line}`,
                    color: C.accent, fontFamily: mono, fontSize: 12.5 }}>{a}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${C.line}`,
                    color: C.text }}>{b}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${C.line}`,
                    color: C.dim, whiteSpace: "nowrap" }}>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P style={{ color: C.dim, fontSize: 13.5, marginTop: 12 }}>
          <b style={{ color: C.accent2 }}>Nächster Schritt:</b> Modul 2 — Docker & Compose. Warum
          gibt es überhaupt die Zwei-Port-Welt, die das ganze Cookie/CORS-Theater verursacht hat?
        </P>
      </Card>
    </>
  );
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────
export default function AppJsLevelQuest() {
  const INITIAL = { tasks: {}, quiz: {}, celebrated: [], view: "intro" };
  const [st, setSt] = useSaved(INITIAL);
  const [reward, setReward] = useState(null);

  const toggleTask = (id) =>
    setSt((s) => ({ ...s, tasks: { ...s.tasks, [id]: !s.tasks[id] } }));
  const answer = (qid, idx) =>
    setSt((s) => ({ ...s, quiz: { ...s.quiz, [qid]: idx } }));
  const setView = (v) => {
    setSt((s) => ({ ...s, view: v }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const ctx = { st, toggleTask, answer };

  // Level fertig geworden? → einmalig feiern (celebrated verhindert Wiederholung)
  useEffect(() => {
    const fresh = ALL.find((lv) => levelDone(lv, st) && !st.celebrated.includes(lv.id));
    if (fresh) {
      setSt((s) => ({ ...s, celebrated: [...s.celebrated, fresh.id] }));
      setReward({ xp: fresh.xp, title: fresh.title, emoji: fresh.emoji });
      const t = setTimeout(() => setReward(null), 4200);
      return () => clearTimeout(t);
    }
  }, [st.tasks, st.quiz]); // eslint-disable-line react-hooks/exhaustive-deps

  const doneMap = Object.fromEntries(ALL.map((lv) => [lv.id, levelDone(lv, st)]));
  const xp = ALL.reduce((s, lv) => s + (doneMap[lv.id] ? lv.xp : 0), 0);
  const allLevelsDone = LEVELS.every((lv) => doneMap[lv.id]);
  const bossDone = doneMap.boss;

  const isUnlocked = (lv) => {
    if (lv.id === "boss") return allLevelsDone;
    const i = LEVELS.findIndex((l) => l.id === lv.id);
    return i === 0 || doneMap[LEVELS[i - 1].id];
  };

  const active = ALL.find((lv) => lv.id === st.view) || null;

  const resetAll = () => {
    if (window.confirm("Wirklich den kompletten Quest-Fortschritt löschen?")) {
      try { localStorage.removeItem(LS_KEY); } catch { /* egal */ }
      setSt(INITIAL);
    }
  };

  const chip = (label, view, unlocked, done, title) => (
    <button key={view} className="aq-lvlbtn" disabled={!unlocked}
      onClick={() => unlocked && setView(view)} title={title}
      style={{ minWidth: 40, height: 40, borderRadius: 12, fontFamily: sans, fontSize: 15,
        fontWeight: 700, cursor: unlocked ? "pointer" : "not-allowed", flexShrink: 0,
        background: st.view === view ? C.accent : done ? "rgba(134,239,172,0.12)" : C.panel2,
        color: st.view === view ? "#1a1a00" : done ? C.good : unlocked ? C.text : C.dim,
        border: `1px solid ${st.view === view ? C.accent : done ? C.good : C.line}`,
        opacity: unlocked ? 1 : 0.45 }}>
      {unlocked ? (done && st.view !== view ? "✓" : label) : "🔒"}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: sans, paddingBottom: 80 }}>
      <style>{STYLES}</style>
      <Reward reward={reward} onClose={() => setReward(null)} />

      {/* Kopfleiste: XP, Rang, Level-Navigation */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,17,23,0.92)",
        backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ fontFamily: mono, fontSize: 12, color: C.accent, fontWeight: 700,
              letterSpacing: 1.5, whiteSpace: "nowrap" }}>APP.JS · LEVEL-QUEST</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ height: 10, background: C.panel2, borderRadius: 99,
                border: `1px solid ${C.line}`, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(xp / TOTAL_XP) * 100}%`,
                  background: `linear-gradient(90deg, ${C.accent}, ${C.gold})`,
                  borderRadius: 99, transition: "width .6s cubic-bezier(.25,.8,.25,1)" }} />
              </div>
            </div>
            <div style={{ color: C.gold, fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>
              {xp} / {TOTAL_XP} XP
            </div>
            <div style={{ color: C.dim, fontSize: 12.5, whiteSpace: "nowrap" }}>{rankFor(xp)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 2 }}>
            {chip("🗺", "intro", true, false, "Übersicht & Spielregeln")}
            {LEVELS.map((lv) => chip(String(lv.nr), lv.id, isUnlocked(lv), doneMap[lv.id],
              `Level ${lv.nr}: ${lv.title}`))}
            {chip("🐉", "boss", allLevelsDone, bossDone, "Boss-Fight (alle Levels nötig)")}
            {chip("🏆", "final", bossDone, false, "Finale: Mental Model & Verbindungen")}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 20px 0" }}>
        {st.view === "intro" && <Intro st={st} onStart={() => setView("l1")} />}
        {st.view === "final" && <Finale xp={xp} />}

        {active && (
          <>
            {/* Level-Kopf */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 0 18px" }}>
              <div style={{ fontSize: 42, lineHeight: 1 }}>{active.emoji}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: C.accent, fontFamily: mono, fontSize: 12, fontWeight: 700,
                  letterSpacing: 1.5 }}>
                  {active.id === "boss" ? "FINALE PRÜFUNG" : `LEVEL ${active.nr} VON 7`} · {active.xp} XP
                </div>
                <h1 style={{ color: C.text, fontSize: 26, margin: "3px 0 2px", lineHeight: 1.2 }}>
                  {active.title}
                </h1>
                <div style={{ color: C.dim, fontSize: 13.5 }}>{active.sub}</div>
              </div>
            </div>

            <active.Content ctx={ctx} />

            {/* Level-Fuß: Status + Weiter */}
            <Card style={{ marginTop: 26, borderColor: doneMap[active.id] ? C.good : C.line }}>
              {doneMap[active.id] ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ color: C.good, fontWeight: 700, fontSize: 15.5, flex: 1 }}>
                    ✅ {active.id === "boss" ? "Boss besiegt — Modul 1 gemeistert!"
                      : `Level ${active.nr} geschafft (+${active.xp} XP)`}
                  </div>
                  <button
                    onClick={() => setView(active.id === "boss" ? "final"
                      : active.nr === 7 ? "boss" : LEVELS[active.nr].id)}
                    style={{ background: C.accent, color: "#1a1a00", border: "none",
                      borderRadius: 10, padding: "10px 22px", fontSize: 14.5, fontWeight: 800,
                      cursor: "pointer", fontFamily: sans }}>
                    {active.id === "boss" ? "🏆 Zum Finale" :
                      active.nr === 7 ? "🐉 Zum Boss-Fight" : `Weiter zu Level ${active.nr + 1} →`}
                  </button>
                </div>
              ) : (
                <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.7 }}>
                  <b style={{ color: C.gold }}>Noch offen:</b>{" "}
                  {active.tasks.filter((t) => !st.tasks[t]).length > 0 &&
                    `${active.tasks.filter((t) => !st.tasks[t]).length} Experiment(e) ⚡ `}
                  {Object.entries(active.quiz).filter(([q, c]) => st.quiz[q] !== c).length > 0 &&
                    `· ${Object.entries(active.quiz).filter(([q, c]) => st.quiz[q] !== c).length} Quizfrage(n) ❓`}
                  <span style={{ display: "block", marginTop: 4 }}>
                    Erledige alles, um das Level abzuschließen und XP zu kassieren.
                  </span>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Fußzeile */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 30, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
          <span style={{ color: C.dim, fontSize: 12 }}>
            Modul 1 des Lernpfads · Quelle: frontend/app.js (ai-prompt-library)
          </span>
          <button onClick={resetAll}
            style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim,
              borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer",
              fontFamily: sans }}>
            Fortschritt zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}
