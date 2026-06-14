import React, { useState, useEffect, useRef } from "react";

/*
  Frontend JavaScript verstehen — app.js von Grund auf.

  Zielgruppe: jemand, der NOCH KEIN JavaScript kann. Jedes Konzept wird beim
  ersten Auftreten erklärt, dann am echten Code aus
  Module/Web-Eng2/ai-prompt-library/frontend/app.js gezeigt.

  Eigenständig: kein externer Import außer React. Dark-Theme wie die übrigen
  Trainer dieses Projekts.
*/

// ─── Design-System (Dark Theme) ──────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  panel:   "#171a23",
  panel2:  "#1e222e",
  line:    "#2a2f3d",
  text:    "#e6e8ee",
  dim:     "#9aa1b1",
  accent:  "#f7df1e", // JS-Gelb – der Wiedererkennungswert von JavaScript
  accent2: "#7dd3fc", // Cyan – DOM & Browser
  accent3: "#a78bfa", // Violett – async / Netzwerk
  good:    "#86efac",
  warn:    "#fca5a5",
  gold:    "#fcd34d",
};

const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const mono = '"JetBrains Mono","Fira Code","SFMono-Regular",Consolas,monospace';

const STYLES = `
@keyframes js-pop  { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
@keyframes js-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@keyframes js-fly  { 0% { transform: translateX(-12px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
.js-reveal { opacity: 0; transform: translateY(26px); transition: opacity .6s ease, transform .6s ease; }
.js-reveal.js-shown { opacity: 1; transform: none; }
.js-cursor::after { content: "▋"; color: ${C.accent}; animation: js-blink 1s steps(1) infinite; margin-left: 1px; }
`;

const btn = {
  background: C.accent, color: "#1a1a00", border: "none",
  borderRadius: 10, padding: "8px 16px", fontSize: 14,
  fontWeight: 700, cursor: "pointer", fontFamily: sans,
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`,
  borderRadius: 10, padding: "8px 16px", fontSize: 14,
  fontWeight: 500, cursor: "pointer", fontFamily: sans,
};
const p = { color: C.text, fontSize: 16, lineHeight: 1.75, margin: "0 0 16px" };
const ci = {
  fontFamily: mono, fontSize: 13.5, background: C.panel2,
  border: `1px solid ${C.line}`, color: C.accent,
  padding: "1px 7px", borderRadius: 5, whiteSpace: "nowrap",
};

// ─── Hooks & Primitive Bausteine ─────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className={"js-reveal" + (shown ? " js-shown" : "")}
      style={{ marginBottom: 64 }}>
      <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 2,
        fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", color: C.text, lineHeight: 1.2 }}>
        {title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: 24, ...style }}>{children}</div>
  );
}

function InfoBox({ title, color = C.accent3, icon = "💡", children }) {
  return (
    <div style={{ background: "rgba(167,139,250,0.07)", border: `1px solid ${color}`,
      borderLeft: `4px solid ${color}`, borderRadius: 12,
      padding: "16px 18px", margin: "22px 0" }}>
      <div style={{ fontWeight: 700, color, marginBottom: 6, fontSize: 15 }}>
        {icon} {title}</div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// Code-Block: dimmt Kommentarzeilen, hebt Code ab. Bewusst simpel — kein
// vollwertiges Syntax-Highlighting, aber Kommentare sind klar erkennbar.
function CodeBlock({ code, highlight, style }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <pre style={{
      background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: "14px 16px", margin: 0, overflowX: "auto",
      fontFamily: mono, fontSize: 13, lineHeight: 1.7, ...style,
    }}>
      {lines.map((ln, i) => {
        const t = ln.trim();
        const isComment = t.startsWith("//") || t.startsWith("/*") || t.startsWith("*");
        const isHi = highlight === i;
        return (
          <div key={i} style={{
            color: isComment ? C.dim : C.text,
            fontStyle: isComment ? "italic" : "normal",
            background: isHi ? "rgba(247,223,30,0.10)" : "transparent",
            borderLeft: isHi ? `3px solid ${C.accent}` : "3px solid transparent",
            paddingLeft: 8, marginLeft: -8, whiteSpace: "pre",
          }}>
            {ln || " "}
          </div>
        );
      })}
    </pre>
  );
}

// Inline-Kürzel für Fließtext.
const K = ({ children }) => <code style={ci}>{children}</code>;

// ─── Stepper-Hook + PlayerBar (für die animierten Visualisierungen) ───────────

function useStepper(count, interval = 1600) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= count - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, interval);
    return () => clearInterval(id);
  }, [playing, count, interval]);
  const next   = () => setStep((s) => Math.min(s + 1, count - 1));
  const prev   = () => setStep((s) => Math.max(s - 1, 0));
  const reset  = () => { setPlaying(false); setStep(0); };
  const toggle = () => {
    if (!playing && step >= count - 1) setStep(0);
    setPlaying((pl) => !pl);
  };
  return { step, playing, next, prev, reset, toggle, setStep };
}

function PlayerBar({ st, count }) {
  const ghost = (dis) => ({ ...btnGhost, opacity: dis ? 0.4 : 1, cursor: dis ? "default" : "pointer" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
      <button style={btnGhost} onClick={st.reset}>↺ Reset</button>
      <button style={ghost(st.step === 0)} onClick={st.prev} disabled={st.step === 0}>‹ Zurück</button>
      <button style={btn} onClick={st.toggle}>{st.playing ? "⏸ Pause" : "▶ Abspielen"}</button>
      <button style={ghost(st.step === count - 1)} onClick={st.next} disabled={st.step === count - 1}>Weiter ›</button>
      <span style={{ color: C.dim, fontSize: 13, marginLeft: "auto", fontFamily: mono }}>
        {st.step + 1} / {count}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 1 — Variablen-Inspektor: const/let und wie sich State verändert
// ══════════════════════════════════════════════════════════════════════════════

const VAR_SCENES = [
  {
    label: "Seite frisch geladen",
    desc: "Bevor irgendetwas passiert, haben die drei State-Variablen ihre Startwerte. null heißt: „hier ist noch nichts“.",
    currentUser: "null",
    editingPromptId: "null",
    tagsCache: "[]",
    note: 'currentUser ist null → niemand ist eingeloggt → die App zeigt das Login-Formular.',
  },
  {
    label: "Nach erfolgreichem Login",
    desc: "enterApp(user) schreibt das Benutzer-Objekt in currentUser. Aus null wird ein echtes Objekt.",
    currentUser: '{ id: 1, username: "steven", role: "user" }',
    editingPromptId: "null",
    tagsCache: "[]",
    note: 'currentUser ist jetzt ein Objekt → isAdmin() prüft currentUser?.role === "admin" → hier false.',
  },
  {
    label: "Tags vom Server geladen",
    desc: "loadTags() holt die Tags und legt sie in tagsCache ab — zwischengespeichert, damit man sie nicht ständig neu laden muss.",
    currentUser: '{ id: 1, username: "steven", role: "user" }',
    editingPromptId: "null",
    tagsCache: '[ {id:1,name:"coding"}, {id:2,name:"writing"} ]',
    note: "tagsCache ist mit let deklariert → sein Wert darf sich ändern (von [] zu einer gefüllten Liste).",
  },
  {
    label: '„Bearbeiten“ geklickt',
    desc: "startEditPrompt(p) merkt sich die ID des bearbeiteten Prompts. Das Formular schaltet von „Anlegen“ auf „Speichern“ um.",
    currentUser: '{ id: 1, username: "steven", role: "user" }',
    editingPromptId: "7",
    tagsCache: '[ {id:1,name:"coding"}, {id:2,name:"writing"} ]',
    note: "editingPromptId ist nicht mehr null → beim Absenden wird PUT /prompts/7 (Update) statt POST (Neu) gesendet.",
  },
  {
    label: "Logout",
    desc: "Beim Abmelden wird currentUser zurück auf null gesetzt — der Ausgangszustand. showAuth() zeigt wieder den Login.",
    currentUser: "null",
    editingPromptId: "null",
    tagsCache: '[ {id:1,name:"coding"}, {id:2,name:"writing"} ]',
    note: "Variablen sind das Gedächtnis der App während sie läuft. null bedeutet wieder: nicht eingeloggt.",
  },
];

function VarInspectorVis() {
  const st = useStepper(VAR_SCENES.length, 2200);
  const s = VAR_SCENES[st.step];
  const Row = ({ kw, name, value, color }) => (
    <div key={value} style={{
      display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap",
      padding: "10px 12px", borderRadius: 10, marginBottom: 8,
      background: C.bg, border: `1px solid ${C.line}`, animation: "js-pop .35s ease",
      fontFamily: mono, fontSize: 13.5,
    }}>
      <span style={{ color: C.accent3, fontWeight: 700 }}>{kw}</span>
      <span style={{ color: color }}>{name}</span>
      <span style={{ color: C.dim }}>=</span>
      <span style={{ color: C.good, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        Der „State“ — das Gedächtnis der App</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>
        Drei Variablen merken sich, was gerade los ist. Spiel ab und beobachte, wie sich ihre Werte ändern.
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "inline-block", background: C.panel2, border: `1px solid ${C.accent}`,
          color: C.accent, fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 999 }}>
          {st.step + 1}. {s.label}
        </div>
      </div>

      <Row kw="let" name="currentUser"      value={s.currentUser}      color={C.accent2} />
      <Row kw="let" name="tagsCache"        value={s.tagsCache}        color={C.accent2} />
      <Row kw="let" name="editingPromptId"  value={s.editingPromptId}  color={C.accent2} />

      <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12,
        padding: "13px 15px", marginTop: 6, color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>
        {s.desc}
      </div>
      <div style={{ color: C.gold, fontSize: 13.5, lineHeight: 1.6, marginTop: 10, fontStyle: "italic" }}>
        → {s.note}
      </div>

      <PlayerBar st={st} count={VAR_SCENES.length} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 2 — Das DOM: aus JS-Befehlen wird eine Tabellenzeile
// ══════════════════════════════════════════════════════════════════════════════

const DOM_STEPS = [
  {
    code: 'const tr = document.createElement("tr");',
    expl: 'createElement baut ein neues HTML-Element — hier eine Tabellenzeile <tr>. Es existiert erst nur in JS, ist noch NICHT auf der Seite sichtbar.',
    render: { created: true, title: false, cat: false, attached: false },
  },
  {
    code: 'const td = document.createElement("td");\ntd.textContent = "Code-Review";',
    expl: 'Eine Tabellenzelle <td> wird erzeugt. textContent setzt ihren Text. textContent (statt innerHTML) ist sicher: eingegebener Text wird NIE als HTML ausgeführt → kein XSS.',
    render: { created: true, title: true, cat: false, attached: false },
  },
  {
    code: 'tr.append(td);',
    expl: 'append hängt die Zelle IN die Zeile. Jetzt steckt das <td> im <tr> — aber beide hängen immer noch nur im Speicher, nicht im sichtbaren Dokument.',
    render: { created: true, title: true, cat: false, attached: false, nested: true },
  },
  {
    code: 'tr.append( cell("coding") );',
    expl: 'Noch eine Zelle dazu (die Hilfsfunktion cell() macht createElement + textContent in einem Schritt). Die Zeile wächst.',
    render: { created: true, title: true, cat: true, attached: false, nested: true },
  },
  {
    code: 'body.append(tr);',
    expl: 'Erst JETZT wird die fertige Zeile an den <tbody> der echten Tabelle gehängt — und erscheint sichtbar im Browser. Das ist der Moment, in dem aus Code Bild wird.',
    render: { created: true, title: true, cat: true, attached: true, nested: true },
  },
];

function DomBuildVis() {
  const st = useStepper(DOM_STEPS.length, 1900);
  const cur = DOM_STEPS[st.step];
  const r = cur.render;

  const Cell = ({ on, children, w }) => (
    <div style={{
      flex: w || 1, padding: "8px 10px", fontSize: 12.5, fontFamily: mono,
      color: on ? C.text : C.dim, border: `1px dashed ${on ? C.accent2 : C.line}`,
      background: on ? "rgba(125,211,252,0.08)" : "transparent",
      borderRadius: 6, textAlign: "center", minHeight: 16,
      animation: on ? "js-pop .3s ease" : "none",
    }}>{on ? children : "—"}</div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        Das DOM bauen — Stück für Stück</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>
        Die Seite ist ein Baum aus Elementen (das „DOM“). JS erzeugt Elemente und hängt sie ein.
        So entsteht in <code style={{ ...ci, whiteSpace: "normal" }}>renderPromptTable()</code> jede Tabellenzeile.
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Code */}
        <div style={{ flex: "1 1 280px" }}>
          <CodeBlock code={cur.code} />
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12,
            padding: "13px 15px", marginTop: 12, color: C.text, fontSize: 14, lineHeight: 1.6 }}>
            {cur.expl}
          </div>
        </div>

        {/* Live-Vorschau */}
        <div style={{ flex: "1 1 260px" }}>
          <div style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", marginBottom: 8 }}>So sieht's im Browser aus</div>

          {/* "im Speicher" Zone */}
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 12, marginBottom: 10,
            background: C.bg, opacity: r.created ? 1 : 0.4 }}>
            <div style={{ fontSize: 10, color: C.dim, marginBottom: 6, fontFamily: mono }}>
              {r.attached ? "🔒 nur im Speicher (leer – Zeile ist umgezogen)" : "🧠 nur im Speicher (noch unsichtbar)"}
            </div>
            {r.created && !r.attached && (
              <div style={{ display: "flex", gap: 6 }}>
                <Cell on={r.title}>Code-Review</Cell>
                <Cell on={r.cat}>coding</Cell>
              </div>
            )}
          </div>

          {/* echte Tabelle */}
          <div style={{ border: `1px solid ${r.attached ? C.good : C.line}`, borderRadius: 10,
            overflow: "hidden", transition: "border-color .3s" }}>
            <div style={{ display: "flex", gap: 0, background: C.panel2,
              padding: "6px 10px", fontSize: 11, color: C.dim, fontWeight: 700 }}>
              <span style={{ flex: 1 }}>Titel</span><span style={{ flex: 1 }}>Kategorie</span>
            </div>
            <div style={{ padding: 8, minHeight: 40 }}>
              {r.attached ? (
                <div style={{ display: "flex", gap: 6, animation: "js-fly .4s ease" }}>
                  <Cell on>Code-Review</Cell>
                  <Cell on>coding</Cell>
                </div>
              ) : (
                <div style={{ color: C.dim, fontSize: 12, fontFamily: mono, padding: 4 }}>
                  (noch keine Zeile sichtbar)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PlayerBar st={st} count={DOM_STEPS.length} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 3 — async / await + fetch: der Lebensweg der api()-Funktion
// ══════════════════════════════════════════════════════════════════════════════

const API_STEPS = [
  { t: "Aufruf", c: 'await api("/prompts")',
    d: "Irgendeine Funktion ruft api() auf und schreibt await davor. await heißt: „warte hier, bis das Ergebnis da ist“ — der Rest der App friert dabei NICHT ein.",
    z: "js" },
  { t: "Anfrage zusammenbauen", c: 'opts = { method:"GET", credentials:"include" }',
    d: "api() baut ein Optionen-Objekt. credentials:'include' sorgt dafür, dass der Login-Cookie automatisch mitgeschickt wird — sonst wüsste der Server nicht, wer fragt.",
    z: "js" },
  { t: "Absenden", c: "fetch(API_BASE + path, opts)",
    d: "fetch() schickt die HTTP-Anfrage übers Netzwerk an das Backend (Port 8000). Das dauert — Millisekunden bis Sekunden.",
    z: "net" },
  { t: "Warten", c: "const res = await fetch(...)",
    d: "Hier wartet await auf die Antwort des Servers. Währenddessen bleibt die Seite bedienbar. Das ist der Sinn von „asynchron“.",
    z: "net" },
  { t: "Antwort prüfen", c: "if (!res.ok) throw new Error(...)",
    d: "Kam ein Fehler-Status (z. B. 401 nicht eingeloggt, 404 nicht gefunden)? Dann wirft api() einen Fehler. throw springt sofort raus zum try/catch des Aufrufers.",
    z: "js" },
  { t: "JSON lesen", c: "const data = await res.json()",
    d: "Die Antwort kommt als Text an. res.json() verwandelt diesen Text in ein echtes JS-Objekt/Array, mit dem man weiterarbeiten kann.",
    z: "js" },
  { t: "Zurückgeben", c: "return data",
    d: "api() gibt die fertigen Daten zurück. Das await im allerersten Schritt „taut auf“ und der Aufruferaufruf bekommt sein Ergebnis: die Liste der Prompts.",
    z: "ok" },
];

function ApiFlowVis() {
  const [fail, setFail] = useState(false);
  const st = useStepper(API_STEPS.length, 1800);
  const cur = API_STEPS[st.step];

  // Im Fehler-Szenario endet der Weg beim Prüf-Schritt (Index 4).
  const blocked = fail && st.step >= 4;
  let color = C.accent3;
  if (cur.z === "net") color = C.accent2;
  if (cur.z === "ok" && !fail) color = C.good;
  if (blocked) color = C.warn;

  const zoneActive = (z) => cur.z === z && !blocked;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        api() — eine Anfrage von Anfang bis Ende</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        Szenario:
        <button style={{ ...btnGhost, padding: "4px 12px", fontSize: 13,
          borderColor: !fail ? C.good : C.line, color: !fail ? C.good : C.dim, fontWeight: 600 }}
          onClick={() => { setFail(false); st.reset(); }}>Alles klappt (200 OK)</button>
        <button style={{ ...btnGhost, padding: "4px 12px", fontSize: 13,
          borderColor: fail ? C.warn : C.line, color: fail ? C.warn : C.dim, fontWeight: 600 }}
          onClick={() => { setFail(true); st.reset(); }}>Fehler (z. B. 401)</button>
      </div>

      {/* drei Zonen: JS-Welt · Netzwerk · Ergebnis */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["js",  "🟣 JavaScript (Browser)", C.accent3],
          ["net", "🔵 Netzwerk → Backend",   C.accent2],
          ["ok",  blocked ? "🔴 Fehler" : "🟢 Ergebnis", blocked ? C.warn : C.good],
        ].map(([z, label, col]) => {
          const here = z === "ok" ? (cur.z === "ok") : zoneActive(z);
          const showWarn = z === "ok" && blocked;
          return (
            <div key={z} style={{ flex: "1 1 150px",
              border: `1px solid ${here || showWarn ? col : C.line}`,
              background: here || showWarn ? C.panel2 : C.panel,
              borderRadius: 10, padding: "10px 12px", transition: "all .3s",
              textAlign: "center", fontSize: 12.5, fontWeight: here || showWarn ? 700 : 400,
              color: here || showWarn ? C.text : C.dim }}>
              {label}
            </div>
          );
        })}
      </div>

      {/* aktueller Schritt */}
      <div key={st.step} style={{ animation: "js-pop .3s ease" }}>
        <CodeBlock code={blocked
          ? 'throw new Error("Nicht eingeloggt")  // → springt zum catch'
          : cur.c} />
        <div style={{ background: C.panel2, border: `1px solid ${color}`, borderRadius: 12,
          padding: "13px 15px", marginTop: 12, color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>
          <span style={{ color, fontWeight: 700, marginRight: 8 }}>
            {blocked ? "Abbruch:" : cur.t + ":"}
          </span>
          {blocked
            ? "res.ok ist false. api() wirft einen Fehler. Der Aufrufer fängt ihn im catch und zeigt per toast() eine rote Meldung an — die App stürzt NICHT ab."
            : cur.d}
        </div>
      </div>

      <PlayerBar st={st} count={API_STEPS.length} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 4 — app.js Schritt für Schritt: echte Code-Blöcke + Erklärung
// ══════════════════════════════════════════════════════════════════════════════

const WALK = [
  {
    tag: "Start der Datei",
    code: `"use strict";

const API_BASE = \`http://\${location.hostname || "localhost"}:8000\`;`,
    points: [
      ['"use strict";', "Schaltet den „strengen Modus“ ein. JS verzeiht dann weniger Fehler (z. B. Tippfehler in Variablennamen) und warnt früher. Steht ganz oben."],
      ["const API_BASE", "const = eine Konstante, ihr Wert wird einmal gesetzt und ändert sich nie wieder."],
      ["Backticks ` `", "Ein Template-String. Mit ${ … } kann man Werte mitten in den Text einsetzen. Ergebnis z. B. http://localhost:8000."],
      ["||", "„oder“: location.hostname ODER, falls das leer ist, \"localhost\" als Rückfallwert."],
    ],
  },
  {
    tag: "State + Mini-Helfer",
    code: `let currentUser = null;
let tagsCache = [];
let editingPromptId = null;

const $ = (sel) => document.querySelector(sel);
const isAdmin = () => currentUser?.role === "admin";`,
    points: [
      ["let", "let = eine Variable, deren Wert sich später ändern DARF (anders als const)."],
      ["null / [ ]", "Startwerte: null = „noch nichts“, [] = leere Liste."],
      ["const $ = (sel) => …", "Eine Pfeilfunktion (arrow function), in der Kurzschreibweise. $ ist nur ein (erlaubter) Funktionsname — eine Abkürzung für document.querySelector."],
      ["currentUser?.role", "Das ?. ist optional chaining: ist currentUser null, gibt der Ausdruck einfach undefined zurück statt abzustürzen."],
    ],
  },
  {
    tag: "Die zentrale api()-Funktion",
    code: `async function api(path, { method = "GET", body } = {}) {
  const opts = { method, credentials: "include", headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(extractError(data, res.status));
  return data;
}`,
    points: [
      ["async / await", "async markiert eine Funktion, die auf Dinge warten kann. await wartet auf ein Ergebnis, ohne die Seite einzufrieren."],
      ["{ method = \"GET\", body } = {}", "Destrukturierung mit Standardwerten: aus dem zweiten Argument werden method und body herausgezogen; fehlt method, ist es \"GET\"."],
      ["JSON.stringify(body)", "Wandelt ein JS-Objekt in einen JSON-Text um — so reist es übers Netz."],
      ["fetch(...)", "Schickt die HTTP-Anfrage. credentials:'include' nimmt den Login-Cookie mit."],
      ["throw new Error(...)", "Bei einem Fehler-Status wird ein Fehler geworfen — der Aufrufer fängt ihn im catch."],
    ],
  },
  {
    tag: "Auf ein Formular reagieren",
    code: `$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const user = await api("/login", {
      method: "POST",
      body: { username: f.get("username"), password: f.get("password") },
    });
    await enterApp(user);
  } catch (err) { toast(err.message); }
});`,
    points: [
      ["addEventListener('submit', …)", "„Wenn das Login-Formular abgeschickt wird, führe diese Funktion aus.“ Das ist ein Event-Listener."],
      ["e.preventDefault()", "Verhindert das Standardverhalten des Browsers (Seite neu laden). Wir wollen die Daten selbst per JS schicken."],
      ["new FormData(e.target)", "Liest bequem alle Eingabefelder des Formulars aus. f.get('username') holt ein Feld."],
      ["try { … } catch (err)", "Versuche den Code; geht etwas schief (z. B. falsches Passwort → api() wirft), lande im catch und zeige die Meldung."],
    ],
  },
  {
    tag: "Eine Tabelle aufbauen",
    code: `function renderPromptTable(prompts) {
  const body = $("#promptTableBody");
  body.replaceChildren();
  for (const p of prompts) {
    const tr = document.createElement("tr");
    tr.append(cell(p.title));
    tr.append(cell(p.category || "–"));
    body.append(tr);
  }
}`,
    points: [
      ["replaceChildren()", "Leert die Tabelle komplett, bevor neu gezeichnet wird — sonst würden Zeilen doppelt erscheinen."],
      ["for (const p of prompts)", "Geht jeden Eintrag p der Liste prompts der Reihe nach durch (eine for…of-Schleife)."],
      ["createElement / append", "Für jeden Prompt wird eine Zeile gebaut und in die Tabelle gehängt — genau wie in der DOM-Visualisierung oben."],
      ["p.category || \"–\"", "Hat der Prompt keine Kategorie, wird ersatzweise ein Gedankenstrich angezeigt."],
    ],
  },
  {
    tag: "Der Einstiegspunkt",
    code: `async function init() {
  wireAuth();
  wireNav();
  wirePromptForm();
  wireTagForm();
  try {
    const user = await api("/me");
    await enterApp(user);
  } catch {
    showAuth();
  }
}

document.addEventListener("DOMContentLoaded", init);`,
    points: [
      ["DOMContentLoaded", "Das Event „die HTML-Seite ist fertig geladen“. ERST dann startet init() — vorher gäbe es die Elemente noch gar nicht."],
      ["wireAuth(), wireNav(), …", "„Verdrahten“: alle Event-Listener einmalig anhängen (welcher Klick macht was)."],
      ["api('/me')", "Fragt den Server: „Bin ich noch eingeloggt?“ (vom Cookie der letzten Sitzung)."],
      ["try → enterApp / catch → showAuth", "Klappt /me → direkt in die App. Schlägt es fehl (401) → zeige das Login. So merkt man, dass init das Drehkreuz ist."],
    ],
  },
];

function WalkthroughVis() {
  const [i, setI] = useState(0);
  const cur = WALK[i];
  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>
        app.js — die wichtigsten Blöcke im Original</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {WALK.map((w, idx) => (
          <button key={idx} onClick={() => setI(idx)} style={{
            ...btnGhost, padding: "6px 12px", fontSize: 12.5,
            borderColor: idx === i ? C.accent : C.line,
            background: idx === i ? "rgba(247,223,30,0.10)" : "transparent",
            color: idx === i ? C.accent : C.dim, fontWeight: idx === i ? 700 : 500,
          }}>
            {idx + 1}. {w.tag}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <CodeBlock code={cur.code} />
        </div>
        <div style={{ flex: "1 1 260px" }}>
          {cur.points.map(([term, def], k) => (
            <div key={k} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ color: C.accent, fontWeight: 800, fontFamily: mono, flexShrink: 0 }}>›</span>
              <div>
                <code style={{ fontFamily: mono, fontSize: 12.5, color: C.accent2,
                  background: C.bg, border: `1px solid ${C.line}`, padding: "1px 6px",
                  borderRadius: 5, display: "inline-block", marginBottom: 4 }}>{term}</code>
                <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button style={{ ...btnGhost, opacity: i === 0 ? 0.4 : 1 }}
          onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>‹ Vorheriger Block</button>
        <button style={{ ...btn, opacity: i === WALK.length - 1 ? 0.4 : 1 }}
          onClick={() => setI((v) => Math.min(WALK.length - 1, v + 1))}
          disabled={i === WALK.length - 1}>Nächster Block ›</button>
        <span style={{ color: C.dim, fontSize: 13, marginLeft: "auto", fontFamily: mono,
          alignSelf: "center" }}>{i + 1} / {WALK.length}</span>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Konzept-Karten (statisch) für die Grundlagen
// ══════════════════════════════════════════════════════════════════════════════

function ConceptCard({ color, badge, title, children }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`,
      borderLeft: `4px solid ${color}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color,
          background: C.bg, border: `1px solid ${C.line}`, padding: "2px 8px", borderRadius: 6 }}>
          {badge}</span>
        <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{title}</span>
      </div>
      <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Glossar
// ══════════════════════════════════════════════════════════════════════════════

const GLOSSARY = [
  ["Variable", "Ein benannter Behälter für einen Wert. let = veränderbar, const = einmal gesetzt."],
  ["null", "Bewusst „leer / noch nichts“. In app.js: currentUser = null bedeutet „niemand eingeloggt“."],
  ["String", "Text, z. B. \"Hallo\". Mit Backticks ` ` als Template-String, dann ${} zum Einsetzen."],
  ["Array []", "Eine Liste von Werten, z. B. [ {id:1}, {id:2} ]. tagsCache ist ein Array."],
  ["Objekt { }", "Sammlung benannter Eigenschaften: { id: 1, role: \"admin\" }. Zugriff per punkt: user.role."],
  ["Funktion", "Ein wiederverwendbarer Codeblock. Wird mit name() aufgerufen."],
  ["Pfeilfunktion", "Kurzform (a) => a + 1. In app.js z. B. der $-Helfer und Event-Handler."],
  ["Parameter / Argument", "Eingaben einer Funktion. function api(path, opts) — path und opts sind Parameter."],
  ["Destrukturierung", "{ method, body } = opts zieht einzelne Werte aus einem Objekt heraus."],
  ["Standardwert", "method = \"GET\": fehlt der Wert beim Aufruf, wird der Standard genommen."],
  ["DOM", "Document Object Model: der Element-Baum der Seite. JS liest und verändert ihn."],
  ["querySelector", "Findet ein Element per CSS-Auswahl: $(\"#toast\") = Element mit id=\"toast\"."],
  ["createElement", "Erzeugt ein neues HTML-Element im Speicher (noch unsichtbar)."],
  ["append", "Hängt ein Element in ein anderes ein. Erst dann wird es Teil der Seite."],
  ["textContent", "Setzt den reinen Text eines Elements — sicher gegen XSS (kein HTML wird ausgeführt)."],
  ["classList", "Verwaltet CSS-Klassen eines Elements: .add / .remove / .toggle(\"hidden\")."],
  ["Event", "Ein Ereignis wie click oder submit, auf das man reagieren kann."],
  ["addEventListener", "Hängt eine Funktion an ein Event: „bei Klick führe das aus“."],
  ["e.preventDefault()", "Stoppt das Standardverhalten (z. B. Formular-Neuladen der Seite)."],
  ["FormData", "Liest alle Felder eines Formulars bequem aus: f.get(\"username\")."],
  ["async / await", "async-Funktion kann warten; await pausiert bis ein Ergebnis da ist — ohne Einfrieren."],
  ["Promise", "Ein „Versprechen auf ein späteres Ergebnis“. await wartet auf seine Einlösung."],
  ["fetch", "Schickt eine HTTP-Anfrage an den Server und liefert die Antwort zurück."],
  ["JSON", "Textformat für Daten. JSON.stringify(obj) → Text, res.json() → Objekt."],
  ["try / catch", "Fehler abfangen: try den Code, catch fängt geworfene Fehler ab."],
  ["throw", "Wirft einen Fehler — der Ablauf springt zum nächsten catch."],
  ["for…of", "Schleife über jeden Eintrag einer Liste: for (const p of prompts)."],
  [".map()", "Verwandelt jeden Listeneintrag in etwas Neues und gibt eine neue Liste zurück."],
  ["optional chaining ?.", "currentUser?.role greift sicher zu, auch wenn currentUser null ist."],
  ["Cookie / credentials", "credentials:'include' schickt den Login-Cookie automatisch mit der Anfrage."],
];

// ══════════════════════════════════════════════════════════════════════════════
//  Hauptkomponente
// ══════════════════════════════════════════════════════════════════════════════

export default function FrontendJavaScriptVerstehen() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans }}>
      <style>{STYLES}</style>

      {/* Hero */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: C.panel2, border: `1px solid ${C.line}`,
          borderRadius: 999, padding: "5px 14px",
          fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 20,
        }}>
          🟨 VANILLA JAVASCRIPT · FÜR ABSOLUTE ANFÄNGER
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "0 0 16px", fontWeight: 800 }}>
          Frontend JavaScript verstehen —{" "}
          <span style={{ color: C.accent }}>dein app.js von Grund auf</span>
        </h1>
        <p style={{ fontSize: 18, color: C.dim, lineHeight: 1.65, margin: 0, maxWidth: 720 }}>
          Du hast noch nie JavaScript geschrieben? Perfekt. Dieser Trainer erklärt jedes
          Konzept beim ersten Auftreten — Variablen, Funktionen, das DOM, Events und
          async/await — und zeigt es dann direkt an den echten Zeilen deiner{" "}
          <code style={{ fontFamily: mono, color: C.accent2, fontSize: 16 }}>frontend/app.js</code>.
          Am Ende verstehst du, was jede Zeile tut und warum sie dort steht.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 40px" }}>

        {/* ─── 0 Was ist JS ─────────────────────────────────────────────────── */}
        <Section kicker="0 · Erstmal das große Bild" title="Was macht JavaScript überhaupt?">
          <p style={p}>
            Eine Webseite besteht aus drei Sprachen, die zusammenarbeiten. Stell dir ein Haus vor:
          </p>
          <div style={{ display: "grid", gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 16 }}>
            <ConceptCard color={C.good} badge="HTML" title="Die Struktur">
              Das Gerüst & die Räume: Überschriften, Formulare, Tabellen. In deinem Projekt:{" "}
              <K>index.html</K>. Statisch — es passiert nichts von allein.
            </ConceptCard>
            <ConceptCard color={C.accent2} badge="CSS" title="Das Aussehen">
              Farben, Abstände, Layout — die Tapete und Möbel. In deinem Projekt:{" "}
              <K>styles.css</K>.
            </ConceptCard>
            <ConceptCard color={C.accent} badge="JS" title="Das Verhalten">
              Der Strom im Haus: reagiert auf Klicks, holt Daten vom Server, baut Tabellen
              auf, blendet Bereiche ein/aus. Das ist <K>app.js</K> — dein Thema hier.
            </ConceptCard>
          </div>
          <p style={p}>
            <strong>JavaScript läuft im Browser</strong> und macht die Seite lebendig. Ohne JS
            wäre dein Frontend nur ein totes Formular. Dein <K>app.js</K> ist das „Gehirn“: Es
            fängt Klicks ab, schickt Anfragen an das FastAPI-Backend und zeichnet die Antworten
            in die Seite. „Vanilla JS“ heißt dabei nur: pures JavaScript, ganz ohne
            Framework wie React oder Vue.
          </p>
          <InfoBox title="So liest du diesen Trainer" color={C.accent} icon="🧭">
            Erst kommen die <strong>Grundlagen</strong> (Variablen, Funktionen, DOM, Events,
            async). Jede hat eine interaktive Visualisierung zum Ausprobieren. Ganz am Ende
            gehen wir dein <K>app.js</K> Block für Block durch — dann ergibt alles ein Bild.
            Unten findest du ein Glossar zum Nachschlagen.
          </InfoBox>
        </Section>

        {/* ─── 1 Variablen ──────────────────────────────────────────────────── */}
        <Section kicker="1 · Bausteine" title="Variablen: Werte merken">
          <p style={p}>
            Eine <strong>Variable</strong> ist ein beschrifteter Behälter für einen Wert.
            JavaScript kennt zwei wichtige Schlüsselwörter dafür:
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <ConceptCard color={C.accent3} badge="const" title="Konstante">
              Einmal gesetzt, nie wieder geändert. Gut für Dinge, die fest sind —
              z. B. <K>const API_BASE = …</K>.
            </ConceptCard>
            <ConceptCard color={C.accent2} badge="let" title="Veränderbar">
              Der Wert darf sich später ändern. Gut für „State“ —
              z. B. <K>let currentUser = null</K>.
            </ConceptCard>
          </div>
          <p style={p}>
            Werte haben <strong>Typen</strong>: Text (<K>"Hallo"</K>), Zahl (<K>42</K>),
            Wahrheitswert (<K>true</K>/<K>false</K>), <K>null</K> („nichts“), Listen
            (<K>[1, 2, 3]</K>) und Objekte (<K>{"{ id: 1 }"}</K>). In app.js stehen ganz oben
            drei <K>let</K>-Variablen, die sich merken, was gerade los ist. Spiel den Ablauf ab:
          </p>
          <VarInspectorVis />
        </Section>

        {/* ─── 2 Funktionen ─────────────────────────────────────────────────── */}
        <Section kicker="2 · Bausteine" title="Funktionen: Code mit Namen, wiederverwendbar">
          <p style={p}>
            Eine <strong>Funktion</strong> bündelt mehrere Schritte unter einem Namen. Statt
            denselben Code zehnmal zu schreiben, schreibst du ihn einmal und rufst ihn per{" "}
            <K>name()</K> auf. Werte, die du hineingibst, heißen <strong>Argumente</strong>;
            in der Funktion heißen sie <strong>Parameter</strong>.
          </p>
          <Card style={{ background: C.panel2, marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 10, fontWeight: 600 }}>
              Dieselbe Funktion, zwei Schreibweisen:
            </div>
            <CodeBlock code={`// Klassische Schreibweise
function quadrat(x) {
  return x * x;
}

// Pfeilfunktion (arrow function) — kürzer, sehr verbreitet
const quadrat = (x) => x * x;

// In app.js: ein Mini-Helfer als Pfeilfunktion
const $ = (sel) => document.querySelector(sel);`} />
          </Card>
          <p style={p}>
            Das <K>$</K> ist kein Zauber — nur ein erlaubter, kurzer Funktionsname. Überall im
            Code bedeutet <K>$("#toast")</K> also „finde das Element mit der id <em>toast</em>“.
            Funktionen können auch <strong>Standardwerte</strong> haben und Werte direkt{" "}
            <strong>auspacken</strong> (Destrukturierung) — beides nutzt <K>api()</K>:
          </p>
          <CodeBlock code={`// { method = "GET", body } = {}
//  └─ zieht method & body aus dem 2. Argument heraus
//  └─ fehlt method, ist es automatisch "GET"
//  └─ wird gar kein 2. Argument übergeben, gilt {} (leeres Objekt)
async function api(path, { method = "GET", body } = {}) { … }`} style={{ marginBottom: 8 }} />
          <InfoBox title="Pfeilfunktionen sind überall" color={C.accent2} icon="🏹">
            Jedes Mal, wenn du <K>{"(e) => { … }"}</K> oder <K>{"() => …"}</K> siehst, ist das
            eine Funktion „zum Mitgeben“ — etwa als Reaktion auf einen Klick. Du wirst sie in
            app.js ständig in <K>addEventListener</K> wiederfinden.
          </InfoBox>
        </Section>

        {/* ─── 3 DOM ────────────────────────────────────────────────────────── */}
        <Section kicker="3 · JS spricht mit der Seite" title="Das DOM: Elemente finden und bauen">
          <p style={p}>
            Der Browser stellt die HTML-Seite als Baum aus Element-Objekten dar — das{" "}
            <strong>DOM</strong> (Document Object Model). Über das globale Objekt{" "}
            <K>document</K> kann JS diesen Baum lesen und verändern. Die wichtigsten Werkzeuge:
          </p>
          <div style={{ display: "grid", gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: 18 }}>
            <ConceptCard color={C.accent2} badge="finden" title="querySelector">
              <K>{'document.querySelector("#userBox")'}</K> findet ein Element per CSS-Auswahl.
              Genau das kürzt der <K>$</K>-Helfer ab.
            </ConceptCard>
            <ConceptCard color={C.accent2} badge="bauen" title="createElement">
              <K>{'document.createElement("tr")'}</K> erzeugt ein neues Element — zunächst nur im
              Speicher, noch unsichtbar.
            </ConceptCard>
            <ConceptCard color={C.accent2} badge="füllen" title="textContent">
              <K>{'el.textContent = "Hi"'}</K> setzt den Text. Sicher: Eingaben werden nie als
              HTML ausgeführt (Schutz vor XSS).
            </ConceptCard>
            <ConceptCard color={C.accent2} badge="einhängen" title="append / classList">
              <K>parent.append(el)</K> hängt ein Element ein. <K>{'classList.toggle("hidden")'}</K>{" "}
              blendet Bereiche per CSS-Klasse ein/aus.
            </ConceptCard>
          </div>
          <p style={p}>
            Genau so baut <K>renderPromptTable()</K> jede Zeile deiner Prompt-Tabelle. Klick dich
            durch — beachte den Moment, in dem aus „nur im Speicher“ etwas Sichtbares wird:
          </p>
          <DomBuildVis />
          <InfoBox title="Warum erst leeren mit replaceChildren()?" color={C.gold} icon="🧹">
            Vor dem Neuzeichnen ruft der Code <K>body.replaceChildren()</K> auf — er löscht alle
            alten Zeilen. Ohne das würden bei jedem Neuladen die Zeilen <em>zusätzlich</em>
            erscheinen und sich verdoppeln.
          </InfoBox>
        </Section>

        {/* ─── 4 Events ─────────────────────────────────────────────────────── */}
        <Section kicker="4 · Reagieren" title="Events: auf Klicks & Eingaben hören">
          <p style={p}>
            Eine App muss auf den Nutzer reagieren. Dafür gibt es <strong>Events</strong>
            (Ereignisse) wie <K>click</K> oder <K>submit</K>. Mit{" "}
            <K>addEventListener</K> sagst du: „Wenn dieses Ereignis passiert, führe diese
            Funktion aus.“ Diese Funktion bekommt ein <strong>Event-Objekt</strong> (meist{" "}
            <K>e</K>) mit Infos zum Ereignis.
          </p>
          <CodeBlock code={`$("#logoutBtn").addEventListener("click", async () => {
  await api("/logout", { method: "POST" });
  currentUser = null;   // State zurücksetzen
  showAuth();           // Login wieder zeigen
});`} style={{ marginBottom: 16 }} />
          <p style={p}>
            Bei Formularen ist ein Detail wichtig: Normalerweise lädt der Browser bei „Absenden“
            die ganze Seite neu. Das wollen wir nicht — wir schicken die Daten lieber selbst per{" "}
            <K>fetch</K>. Deshalb steht in jedem Submit-Handler ganz vorne{" "}
            <K>e.preventDefault()</K>. Anschließend liest <K>new FormData(e.target)</K> bequem
            alle Felder aus.
          </p>
          <InfoBox title="Das Muster, das sich in app.js ständig wiederholt" color={C.accent} icon="🔁">
            <strong>1.</strong> Event abfangen → <strong>2.</strong> <K>e.preventDefault()</K> →{" "}
            <strong>3.</strong> Felder mit <K>FormData</K> lesen → <strong>4.</strong>{" "}
            <K>await api(...)</K> aufrufen → <strong>5.</strong> bei Erfolg neu zeichnen, bei
            Fehler <K>toast(err.message)</K>. Wer dieses Muster erkennt, hat das halbe app.js
            verstanden.
          </InfoBox>
        </Section>

        {/* ─── 5 async / fetch ──────────────────────────────────────────────── */}
        <Section kicker="5 · Mit dem Server reden" title="async / await & fetch: warten ohne einzufrieren">
          <p style={p}>
            Daten vom Server zu holen <strong>dauert</strong> — vielleicht Millisekunden,
            vielleicht eine Sekunde. Würde die Seite so lange komplett einfrieren, wäre das
            schrecklich. JavaScripts Lösung: <strong>asynchroner</strong> Code.
          </p>
          <p style={p}>
            <K>fetch()</K> schickt die Anfrage und gibt ein <strong>Promise</strong> zurück —
            ein „Versprechen auf ein späteres Ergebnis“. Mit <K>await</K> sagst du „warte hier,
            bis das Versprechen eingelöst ist“, ohne dass der Rest des Browsers blockiert.{" "}
            <K>await</K> darf nur in einer <K>async</K>-Funktion stehen — deshalb ist <K>api()</K>{" "}
            als <K>async function</K> deklariert.
          </p>
          <p style={p}>
            Verfolge eine echte Anfrage durch <K>api()</K> — einmal erfolgreich, einmal mit Fehler:
          </p>
          <ApiFlowVis />
          <InfoBox title="Warum eine einzige api()-Funktion?" color={C.good} icon="🎯">
            Statt in jedem Handler <K>fetch</K>, Cookie-Option, JSON-Umwandlung und
            Fehlerbehandlung zu wiederholen, steckt all das <strong>einmal</strong> in{" "}
            <K>api()</K>. Jeder Aufruf ist dann nur noch eine Zeile wie{" "}
            <K>await api("/prompts")</K>. Das nennt man „nicht wiederholen“ (DRY) — und es
            verhindert, dass man irgendwo den Cookie oder die Fehlerprüfung vergisst.
          </InfoBox>
        </Section>

        {/* ─── 6 Walkthrough ────────────────────────────────────────────────── */}
        <Section kicker="6 · Alles zusammen" title="app.js Block für Block">
          <p style={p}>
            Jetzt hast du alle Bausteine. Hier ist der echte Code deiner <K>app.js</K> in
            sechs Blöcken — von der ersten Zeile bis zum Startpunkt. Klick dich durch; rechts
            steht zu jedem Block, was die markanten Stellen bedeuten:
          </p>
          <WalkthroughVis />
        </Section>

        {/* ─── 7 Lebenszyklus ───────────────────────────────────────────────── */}
        <Section kicker="7 · Der rote Faden" title="Was passiert, wenn die Seite lädt?">
          <p style={p}>
            Damit du das ganze app.js als <em>einen</em> Ablauf siehst — die Reihenfolge, in der
            alles passiert:
          </p>
          <Card>
            {[
              ["1", "Browser lädt index.html + app.js", "Der HTML-Aufbau ist fertig, der JS-Code ist geladen — aber init() wartet noch.", C.dim],
              ["2", 'Event "DOMContentLoaded" feuert', "Signal: „Die Seite steht.“ Jetzt — und keine Sekunde früher — startet init().", C.accent],
              ["3", "init() verdrahtet alle Events", "wireAuth(), wireNav(), wirePromptForm(), wireTagForm() hängen einmalig alle Listener an.", C.accent2],
              ["4", 'await api("/me")', "Frage an den Server: „Bin ich vom letzten Mal noch eingeloggt?“ (über den Cookie).", C.accent3],
              ["5a", "Erfolg → enterApp(user)", "Login war noch gültig: App-Ansicht zeigen, Tags & Prompts laden, ggf. Admin-Dashboard.", C.good],
              ["5b", "Fehler (401) → showAuth()", "Kein gültiger Login: Das Login-/Registrieren-Formular wird angezeigt.", C.warn],
            ].map(([n, title, desc, col]) => (
              <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start",
                padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8,
                  background: C.panel2, border: `1px solid ${col}`, color: col,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontWeight: 800, fontSize: 12.5 }}>{n}</span>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14.5, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ color: C.dim, fontSize: 13, marginTop: 14, fontStyle: "italic" }}>
              Ab hier läuft alles über Events: Jeder Klick / jedes Formular ruft eine Funktion,
              die meist <K>api(...)</K> nutzt und danach die betroffene Tabelle neu zeichnet.
            </div>
          </Card>
        </Section>

        {/* ─── 8 Selbsttest ─────────────────────────────────────────────────── */}
        <Section kicker="8 · Prüf dich selbst" title="Verstehst du jede Zeile?">
          <p style={p}>
            Kleine Checkliste fürs Mündliche oder zur Selbstkontrolle. Kannst du jede Frage
            in einem Satz beantworten?
          </p>
          <Card style={{ background: "rgba(247,223,30,0.05)", borderColor: C.accent }}>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, fontSize: 15.5, color: C.text }}>
              <li>Warum <K>const</K> für <K>API_BASE</K>, aber <K>let</K> für <K>currentUser</K>?</li>
              <li>Was bewirkt <K>credentials: "include"</K> in <K>api()</K> — und was ginge ohne kaputt?</li>
              <li>Warum steht in jedem Submit-Handler <K>e.preventDefault()</K>?</li>
              <li>Wieso ist <K>textContent</K> sicherer als <K>innerHTML</K>?</li>
              <li>Was macht <K>await</K> — und warum friert die Seite trotzdem nicht ein?</li>
              <li>Wann wirft <K>api()</K> einen Fehler, und wer fängt ihn?</li>
              <li>Warum startet alles erst bei <K>DOMContentLoaded</K> und nicht sofort?</li>
              <li>Was bedeutet das <K>?.</K> in <K>currentUser?.role</K>?</li>
            </ul>
          </Card>
        </Section>

        {/* ─── 9 Glossar ────────────────────────────────────────────────────── */}
        <Section kicker="9 · Nachschlagen" title="Alle JS-Begriffe kompakt">
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {GLOSSARY.map(([term, def]) => (
              <div key={term} style={{ background: C.panel2, border: `1px solid ${C.line}`,
                borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 4,
                  fontFamily: mono }}>{term}</div>
                <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.55 }}>{def}</div>
              </div>
            ))}
          </div>
        </Section>

      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px 56px",
        textAlign: "center", color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
        Lern-Trainer · AI Prompt Library — Frontend JavaScript von Grund auf<br />
        Modul Web Engineering 2 · DHBW Mosbach
      </footer>
    </div>
  );
}
