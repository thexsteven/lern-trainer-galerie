import React, { useState, useEffect, useRef } from "react";

/*
  Lern-Trainer: „Java-Konzepte & Syntax" — Mastermind 5-8
  -------------------------------------------------------
  Erklärt die Sprach-Bausteine, die in DEINEM Projekt vorkommen:
  package/import, Klassen/Felder/Methoden, static, final, enum, record,
  interface + Lambda, Generics, Optional, Exceptions, Lombok.
  Self-contained: nur React + Inline-Styles, keine externen Libraries.
*/

// ---------------------------------------------------------------------------
// Design-System (Dark Theme). Nur accent / accent2 thematisch gewählt.
// ---------------------------------------------------------------------------
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc", // cyan  – steht für SYNTAX / Schlüsselwörter
  accent2: "#a78bfa", // violett – steht für TYPEN / Konzepte / Bedeutung
  good: "#86efac", // grün  – Werte / Strings / „funktioniert"
  warn: "#fca5a5", // rot   – Fehler / verboten
  gold: "#fcd34d", // gelb  – Highlight / Zahlen / Annotationen
};

// ---------------------------------------------------------------------------
// Keyframes
// ---------------------------------------------------------------------------
const STYLE = `
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes drop { 0%{transform:translateY(-8px);opacity:0} 100%{transform:translateY(0);opacity:1} }
.pop { animation: pop .3s ease-out both; }
.drop { animation: drop .35s ease-out both; }
*::selection { background: ${C.accent}; color:#06121a; }
html { scroll-behavior:smooth; }
`;

// ---------------------------------------------------------------------------
// Mini-Syntax-Highlighter für Java-Schnipsel
// ---------------------------------------------------------------------------
const KW = new Set([
  "package", "import", "public", "private", "protected", "final", "static", "class", "enum", "record",
  "interface", "void", "return", "throw", "throws", "new", "this", "implements", "extends", "for", "while",
  "if", "else", "true", "false", "null", "boolean",
]);
const TYPES = new Set([
  "int", "char", "long", "double", "String", "Color", "Optional", "List", "ArrayList", "SecretCode", "Guess",
  "Feedback", "Round", "CodeGenerator", "Random", "RandomGenerator", "Scanner", "Game", "FeedbackCalculator",
  "IllegalArgumentException", "InvalidGuessException", "RuntimeException", "Override", "FunctionalInterface",
]);

function hl(line) {
  const out = [];
  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|@[A-Za-z]+|[A-Za-z_][A-Za-z0-9_]*|[0-9]+|\s+|[^\sA-Za-z0-9_]+)/g;
  let m;
  let key = 0;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    let color = C.text;
    if (t.startsWith("//")) color = C.dim;
    else if (t[0] === '"' || t[0] === "'") color = C.good;
    else if (t[0] === "@") color = C.gold;
    else if (KW.has(t)) color = C.accent;
    else if (TYPES.has(t)) color = C.accent2;
    else if (/^[0-9]+$/.test(t)) color = C.gold;
    out.push(
      <span key={key++} style={{ color, fontStyle: t.startsWith("//") ? "italic" : "normal" }}>
        {t}
      </span>
    );
  }
  return out;
}

function Code({ lines, activeLine = -1, dimUntil = -1 }) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "12px 4px",
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
        fontSize: 12.5,
        lineHeight: 1.7,
        overflowX: "auto",
      }}
    >
      {lines.map((ln, i) => (
        <div
          key={i}
          style={{
            whiteSpace: "pre",
            padding: "0 10px",
            borderLeft: i === activeLine ? `3px solid ${C.gold}` : "3px solid transparent",
            background: i === activeLine ? "rgba(252,211,77,0.13)" : "transparent",
            opacity: dimUntil >= 0 && i > dimUntil ? 0.35 : 1,
            transition: "all .3s",
          }}
        >
          {ln === "" ? " " : hl(ln)}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// useReveal
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setShown(true)), { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------
function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} style={{ marginBottom: 64, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(24px)", transition: "opacity .6s ease, transform .6s ease" }}>
      <div style={{ color: C.accent, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", lineHeight: 1.2 }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>{children}</div>;
}

function Tag({ color = C.accent, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.dim, marginRight: 14, whiteSpace: "nowrap" }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{ background: "rgba(167,139,250,0.08)", border: `1px solid ${C.accent2}`, borderRadius: 14, padding: "18px 20px", margin: "18px 0" }}>
      <div style={{ color: C.accent2, fontWeight: 700, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span>💡</span>
        {title}
      </div>
      <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color = C.accent, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
      <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: color, minHeight: 38 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{name}</span>
          {formula && (
            <code style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "2px 8px", fontSize: 12.5, color }}>{formula}</code>
          )}
        </div>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

const btn = { background: C.accent, color: "#06121a", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const codeInline = { background: C.bg, border: `1px solid ${C.line}`, borderRadius: 5, padding: "1px 6px", fontSize: 13, color: C.accent, fontFamily: "ui-monospace, Menlo, Consolas, monospace" };

function PlayerControls({ playing, setPlaying, onPrev, onNext, onReset, atStart, atEnd, label }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ Pause" : "▶ Abspielen"}</button>
      <button style={{ ...btnGhost, opacity: atStart ? 0.4 : 1 }} onClick={onPrev} disabled={atStart}>◀ Schritt</button>
      <button style={{ ...btnGhost, opacity: atEnd ? 0.4 : 1 }} onClick={onNext} disabled={atEnd}>Schritt ▶</button>
      <button style={btnGhost} onClick={onReset}>↺ Reset</button>
      {label && <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>{label}</span>}
    </div>
  );
}

// Farbiger Buchstaben-Chip (für Code-Ausgaben in Vis C)
const CHIP_COL = { R: "#f87171", G: "#4ade80", B: "#60a5fa", Y: "#fbbf24", O: "#fb923c" };
function Chip({ ch }) {
  return (
    <span className="pop" style={{ width: 26, height: 26, borderRadius: "50%", background: CHIP_COL[ch] || C.dim, color: "#0b1016", fontWeight: 800, fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(0,0,0,.35)" }}>
      {ch}
    </span>
  );
}

// ===========================================================================
// VIS 1 — Code-Anatomie: jede Zeile einer echten Datei erklärt
// ===========================================================================
const A_LINES = [
  `package de.hochschule.mastermind.domain;`,
  ``,
  `import java.util.Optional;`,
  ``,
  `public enum Color {`,
  `    RED('R', "Rot"),`,
  `    GREEN('G', "Gruen");`,
  ``,
  `    private final char symbol;`,
  ``,
  `    Color(char symbol) {`,
  `        this.symbol = symbol;`,
  `    }`,
  ``,
  `    public char getSymbol() {`,
  `        return symbol;`,
  `    }`,
  `}`,
];
const A_STEPS = [
  { line: 0, term: "package — die Adresse", def: "Legt fest, in welchem Ordner/Namensraum die Datei lebt. de.hochschule.mastermind.domain entspricht dem Verzeichnispfad. Verhindert Namenskonflikte zwischen gleichnamigen Klassen." },
  { line: 2, term: "import — andere Klassen holen", def: "Macht eine Klasse aus einem anderen Paket nutzbar, hier Optional aus der Java-Standardbibliothek. Ohne import müsstest du jedes Mal den vollen Namen java.util.Optional schreiben." },
  { line: 4, term: "public enum — der Typ", def: "public = von überall sichtbar. enum (Aufzählung) ist ein Spezial-Typ mit fester, abzählbarer Menge an Konstanten. Color hat genau 8 Werte. { } öffnet den Klassenkörper." },
  { line: 5, term: "Enum-Konstante mit Werten", def: "RED ist eine der festen Konstanten. In Klammern stehen die Werte, die ihr Konstruktor bekommt: das Zeichen 'R' und der Name „Rot“. Jede Konstante ist ein fertiges, einmaliges Color-Objekt." },
  { line: 8, term: "Feld: private final", def: "Ein Feld ist eine Variable, die zum Objekt gehört. private = nur innerhalb der Klasse lesbar (Kapselung). final = nach Zuweisung unveränderlich. char = ein einzelnes Zeichen." },
  { line: 10, term: "Konstruktor", def: "Heißt wie die Klasse und hat keinen Rückgabetyp. Er wird beim Erzeugen eines Objekts ausgeführt und befüllt die Felder. Hier nimmt er das symbol entgegen." },
  { line: 11, term: "this — dieses Objekt", def: "this.symbol meint das Feld des gerade entstehenden Objekts, symbol (rechts) den Konstruktor-Parameter. So unterscheidet man gleichnamige Namen. = ist Zuweisung, nicht Vergleich." },
  { line: 14, term: "Methode", def: "public char getSymbol() ist eine Methode: ein benanntes Stück Verhalten. public char = sie gibt einen char zurück; () = sie nimmt keine Parameter. Methoden sind das, was ein Objekt „tun“ kann." },
  { line: 15, term: "return — Wert zurückgeben", def: "Beendet die Methode und liefert das Feld symbol an den Aufrufer. Der Datentyp hinter return muss zum angekündigten Rückgabetyp (char) passen." },
  { line: 16, term: "} — Block-Ende", def: "Schließende geschweifte Klammer. Jede { hat genau eine }. Sie begrenzen Geltungsbereiche (Scopes): Klassenkörper, Methodenrumpf, Schleifen. Fehlt eine, gibt es einen Compilerfehler." },
];

function AnatomyVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((p) => {
        if (p >= A_STEPS.length - 1) { setPlaying(false); return p; }
        return p + 1;
      });
    }, 2400);
    return () => clearInterval(timer.current);
  }, [playing]);

  const step = A_STEPS[i];
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <div style={{ flex: "1 1 340px", minWidth: 300 }}>
          <Code lines={A_LINES} activeLine={step.line} />
          <div style={{ marginTop: 8, fontSize: 12, color: C.dim, fontStyle: "italic" }}>Beispiel: vereinfachtes Color.java (Auszug)</div>
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <div key={i} className="pop" style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent, fontWeight: 700, marginBottom: 8 }}>Baustein {i + 1} / {A_STEPS.length}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 10 }}>{step.term}</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{step.def}</div>
          </div>
        </div>
      </div>
      <PlayerControls
        playing={playing} setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(A_STEPS.length - 1, v + 1))}
        onReset={() => { setI(0); setPlaying(false); }}
        atStart={i === 0} atEnd={i === A_STEPS.length - 1}
      />
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.accent}>Schlüsselwort</Tag>
        <Tag color={C.accent2}>Typ</Tag>
        <Tag color={C.good}>Wert / String</Tag>
        <Tag color={C.gold}>aktive Zeile</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 2 — record-Dekonstruktor: was Java aus einer Zeile generiert
// ===========================================================================
const REC_HEADER = [`record Feedback(int blackPegs, int whitePegs) { }`];
const REC_STEPS = [
  {
    term: "Das schreibst DU",
    def: "Eine einzige Zeile. record sagt Java: „das ist ein unveränderliches Wertobjekt mit diesen Bestandteilen“. blackPegs und whitePegs heißen die Komponenten.",
    code: [],
  },
  {
    term: "+ private final Felder",
    def: "Für jede Komponente legt Java automatisch ein privates, finales Feld an. final = einmal gesetzt, nie wieder geändert. Das macht das Objekt unveränderlich.",
    code: [`private final int blackPegs;`, `private final int whitePegs;`],
  },
  {
    term: "+ kanonischer Konstruktor",
    def: "Ein Konstruktor, der alle Komponenten entgegennimmt und die Felder setzt. Du rufst ihn mit new Feedback(1, 2) auf.",
    code: [`Feedback(int blackPegs, int whitePegs) {`, `    this.blackPegs = blackPegs;`, `    this.whitePegs = whitePegs;`, `}`],
  },
  {
    term: "+ Accessoren (Getter)",
    def: "Für jede Komponente eine Lese-Methode — ohne get-Präfix. feedback.blackPegs() liefert den Wert. Setter gibt es bewusst keine.",
    code: [`int blackPegs() { return blackPegs; }`, `int whitePegs() { return whitePegs; }`],
  },
  {
    term: "+ equals() & hashCode()",
    def: "Wertgleichheit statt Objektidentität: new Feedback(1,2).equals(new Feedback(1,2)) ist true, obwohl es zwei Objekte sind. Das brauchen z. B. die Unit-Tests.",
    code: [`boolean equals(Object o) { /* vergleicht beide Felder */ }`, `int hashCode()         { /* aus beiden Feldern */ }`],
  },
  {
    term: "+ toString()",
    def: "Eine lesbare Textform fürs Debuggen — automatisch im Format Typ[komponente=wert].",
    code: [`String toString() { return "Feedback[blackPegs=1, whitePegs=2]"; }`],
  },
  {
    term: "Dein kompakter Konstruktor",
    def: "Das EINZIGE, was du selbst hinzufügst: eine Prüfung der Invarianten. Läuft VOR dem automatischen Setzen der Felder. So kann nie ein ungültiges Feedback entstehen.",
    code: [`Feedback {`, `    if (blackPegs < 0 || whitePegs < 0)`, `        throw new IllegalArgumentException("...");`, `}`],
  },
];

function RecordVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((p) => {
        if (p >= REC_STEPS.length - 1) { setPlaying(false); return p; }
        return p + 1;
      });
    }, 2300);
    return () => clearInterval(timer.current);
  }, [playing]);

  // alle bis i akkumulierten generierten Blöcke
  const shown = REC_STEPS.slice(1, i + 1);
  const step = REC_STEPS[i];

  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 6 }}>Du schreibst:</div>
          <Code lines={REC_HEADER} />
          <div style={{ fontSize: 12, color: C.dim, margin: "14px 0 6px" }}>Java erzeugt daraus automatisch:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shown.length === 0 && <div style={{ color: C.dim, fontSize: 13, fontStyle: "italic", padding: 8 }}>Drück ▶ — Stück für Stück …</div>}
            {shown.map((s, k) => (
              <div key={k} className="drop">
                <div style={{ fontSize: 11, color: s.term.startsWith("Dein") ? C.gold : C.accent2, fontWeight: 700, marginBottom: 4 }}>{s.term}</div>
                <Code lines={s.code} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 220 }}>
          <div key={i} className="pop" style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18, position: "sticky", top: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: step.term.startsWith("Dein") ? C.gold : C.text, marginBottom: 10 }}>{step.term}</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{step.def}</div>
          </div>
          <InfoBox title="Warum das zählt">
            Dieselbe Funktionalität als normale class wären gut 40 Zeilen Tipparbeit — alle fehleranfällig. Der record erledigt das fehlerfrei. Deshalb sind SecretCode, Guess, Feedback und Round records.
          </InfoBox>
        </div>
      </div>
      <PlayerControls
        playing={playing} setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(REC_STEPS.length - 1, v + 1))}
        onReset={() => { setI(0); setPlaying(false); }}
        atStart={i === 0} atEnd={i === REC_STEPS.length - 1}
        label={`Schritt ${i + 1} / ${REC_STEPS.length}`}
      />
    </Card>
  );
}

// ===========================================================================
// VIS 3 — Interface & Lambda: ein Vertrag, zwei Implementierungen
// ===========================================================================
function InterfaceVis() {
  const [impl, setImpl] = useState("random"); // random | lambda
  const [out, setOut] = useState(null);
  const [pulse, setPulse] = useState(0);

  function run() {
    let code;
    if (impl === "lambda") {
      code = ["R", "G", "B", "Y", "O"]; // fester Test-Code
    } else {
      const keys = Object.keys(CHIP_COL);
      code = Array.from({ length: 5 }, () => keys[Math.floor(Math.random() * keys.length)]);
    }
    setOut(code);
    setPulse((p) => p + 1);
  }

  const wiring =
    impl === "random"
      ? [`CodeGenerator gen = new RandomCodeGenerator();`]
      : [`CodeGenerator gen = () -> secret;   // Lambda`];

  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {/* Vertrag */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.accent, fontWeight: 700, marginBottom: 6 }}>Der Vertrag (interface)</div>
          <Code lines={[`@FunctionalInterface`, `interface CodeGenerator {`, `    SecretCode generate();`, `}`]} />
          <div style={{ fontSize: 13, color: C.dim, marginTop: 8, lineHeight: 1.55 }}>
            Ein Versprechen: „wer mich erfüllt, hat eine Methode generate(), die einen SecretCode liefert“. @FunctionalInterface = genau eine Methode, darf darum als Lambda geschrieben werden.
          </div>
        </div>

        {/* Implementierung wählen */}
        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.accent2, fontWeight: 700, marginBottom: 6 }}>Welche Umsetzung steckst du ein?</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button onClick={() => { setImpl("random"); setOut(null); }} style={{ ...(impl === "random" ? btn : btnGhost), flex: 1 }}>Zufall (Produktion)</button>
            <button onClick={() => { setImpl("lambda"); setOut(null); }} style={{ ...(impl === "lambda" ? btn : btnGhost), flex: 1 }}>Fester Code (Test)</button>
          </div>
          <Code lines={wiring} />
          <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
            {impl === "random" ? "Eine ganze Klasse, die das Interface implements." : "Eine einzige Zeile. Das Lambda IST die generate()-Methode."}
          </div>
        </div>
      </div>

      {/* Game bleibt gleich + Ausführung */}
      <div style={{ marginTop: 18, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>
          <b>Wichtig:</b> Game kennt nur den Vertrag — der Code von Game ändert sich nie, egal welche Variante du einsteckst:
        </div>
        <Code lines={[`Game game = new Game(gen, calculator);`, `SecretCode secret = gen.generate();   // ruft die eingesteckte Variante`]} />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 14 }}>
          <button style={btn} onClick={run}>▶ gen.generate() aufrufen</button>
          <span style={{ color: C.dim, fontSize: 20 }}>→</span>
          <div key={pulse} style={{ display: "flex", gap: 6, minHeight: 26, alignItems: "center" }}>
            {out ? out.map((ch, i) => <Chip key={i} ch={ch} />) : <span style={{ color: C.dim, fontSize: 13, fontStyle: "italic" }}>noch kein Code erzeugt</span>}
          </div>
        </div>
        {out && (
          <div className="pop" style={{ fontSize: 13, color: C.dim, marginTop: 10 }}>
            {impl === "random" ? "Zufallsvariante: bei jedem Klick ein anderer Code." : "Test-Variante: immer derselbe, vorhersagbare Code — deshalb testbar."}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.accent}>Vertrag / interface</Tag>
        <Tag color={C.accent2}>Implementierung</Tag>
        <Tag color={C.good}>erzeugter Code</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
export default function JavaKonzepteTrainer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent2 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>Lern-Trainer · Java-Konzepte &amp; Syntax</span>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
            Die <span style={{ color: C.accent }}>Schlüsselwörter</span> &amp; <span style={{ color: C.accent2 }}>Konzepte</span> hinter deinem Code
          </h1>
          <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
            <code style={codeInline}>record</code>, <code style={codeInline}>interface</code>, <code style={codeInline}>final</code>,{" "}
            <code style={codeInline}>Optional</code>, Lambdas, Generics … In deinem Mastermind-Projekt steckt viel moderne Java-Syntax.
            Hier lernst du <b style={{ color: C.text }}>jeden Baustein</b> kennen — anhand echter Stellen aus deinem eigenen Code.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#anatomie" style={{ ...btn, textDecoration: "none" }}>▶ Code-Anatomie ansehen</a>
            <a href="#glossar" style={{ ...btnGhost, textDecoration: "none" }}>Zum Glossar</a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 56 }} />

        {/* 0. Problem */}
        <Section kicker="0 · Warum dieser Trainer" title="Du liest deinen Code — aber was bedeutet jedes Wort?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Funktionierender Code ist eine Sache. Ihn <b style={{ color: C.text }}>erklären</b> zu können — Wort für Wort, Symbol für
            Symbol — eine andere. Genau das wird in Prüfungen und Code-Reviews verlangt. Dieser Trainer geht die Sprach-Bausteine durch,
            die in deinem Projekt wirklich vorkommen, und zeigt jeden an einer echten Stelle.
          </p>
          <InfoBox title="So liest du die Code-Beispiele">
            In allen Schnipseln sind <span style={{ color: C.accent, fontWeight: 700 }}>Schlüsselwörter cyan</span>,{" "}
            <span style={{ color: C.accent2, fontWeight: 700 }}>Typen violett</span>,{" "}
            <span style={{ color: C.good, fontWeight: 700 }}>Werte/Strings grün</span>,{" "}
            <span style={{ color: C.gold, fontWeight: 700 }}>Zahlen &amp; @Annotationen gelb</span> und Kommentare grau eingefärbt.
          </InfoBox>
        </Section>

        {/* 1. Bausteine + Anatomie-Vis */}
        <Section kicker="1 · Die Grundbausteine" title="Paket, Klasse, Feld, Methode — die Skelett-Teile">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75, marginBottom: 6 }}>
            Jede Java-Datei folgt demselben Grundgerüst. Geh es einmal Zeile für Zeile durch:
          </p>
          <div id="anatomie" />
          <AnatomyVis />
          <div style={{ marginTop: 20 }}>
            <Card>
              <MethodRow color={C.accent} name="Zugriffsmodifizierer" formula="public / private" note="public = von überall nutzbar; private = nur innerhalb der eigenen Klasse. private schützt Felder vor unbefugtem Zugriff — das nennt man Kapselung." />
              <MethodRow color={C.accent} name="final" formula="unveränderlich" note="Ein final-Feld kann nach der ersten Zuweisung nicht mehr geändert werden. Grundlage für unveränderliche Objekte und sichere Konstanten." />
              <MethodRow color={C.accent2} name="Datentyp" formula="char · int · String" note="Jede Variable hat einen festen Typ. char = ein Zeichen, int = ganze Zahl, String = Text. Java prüft Typen schon beim Kompilieren (statische Typisierung)." />
              <MethodRow color={C.good} name="Methode aufrufen" formula="objekt.methode()" note="Der Punkt . greift auf ein Mitglied zu. color.getSymbol() ruft die Methode getSymbol auf dem Objekt color auf." />
            </Card>
          </div>
        </Section>

        {/* 2. static vs Objekt */}
        <Section kicker="2 · Klasse vs. Objekt" title="static, Konstanten und der Bauplan-Gedanke">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Eine <b style={{ color: C.text }}>Klasse</b> ist ein Bauplan, ein <b style={{ color: C.text }}>Objekt</b> ein konkretes
            Exemplar davon. Manche Dinge gehören aber nicht zu einem einzelnen Exemplar, sondern zur Klasse selbst — die markiert man mit{" "}
            <code style={codeInline}>static</code>.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Card style={{ flex: "1 1 260px", background: C.panel2 }}>
              <div style={{ color: C.accent2, fontWeight: 700, marginBottom: 8 }}>static — gehört zur Klasse</div>
              <Code lines={[`public static final int CODE_LENGTH = 5;`, `// Aufruf ohne Objekt:`, `GameRules.CODE_LENGTH`]} />
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>
                Es gibt CODE_LENGTH nur EINMAL, unabhängig von Objekten. static + final = Konstante. Auch main() ist static — Java startet sie, bevor irgendein Objekt existiert.
              </div>
            </Card>
            <Card style={{ flex: "1 1 260px", background: C.panel2 }}>
              <div style={{ color: C.good, fontWeight: 700, marginBottom: 8 }}>nicht-static — gehört zum Objekt</div>
              <Code lines={[`private final char symbol;`, `// pro Objekt eigener Wert:`, `Color.RED.getSymbol()  // 'R'`]} />
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>
                Jedes Color-Objekt hat sein eigenes symbol. Solche Felder brauchen ein konkretes Objekt, auf dem man sie liest.
              </div>
            </Card>
          </div>
          <InfoBox title="Konstanten statt „magischer Zahlen“">
            In deinem Projekt stehen 5 und 10 nicht verstreut im Code, sondern gebündelt als <code style={codeInline}>CODE_LENGTH</code> und{" "}
            <code style={codeInline}>MAX_ATTEMPTS</code> in <code style={codeInline}>GameRules</code>. Willst du die Regeln ändern,
            änderst du genau eine Zeile. Eine nackte 5 mitten im Code nennt man abwertend „magische Zahl“.
          </InfoBox>
        </Section>

        {/* 3. record + Vis */}
        <Section kicker="3 · Unveränderliche Werte" title="record — viel Code, den Java für dich schreibt">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Ein <code style={codeInline}>record</code> ist der moderne Weg, ein <b style={{ color: C.text }}>Wertobjekt</b> zu bauen —
            ein Objekt, das nur Daten zusammenfasst und sich nach der Erzeugung nie mehr ändert. Sieh zu, was eine einzige Zeile alles
            auslöst:
          </p>
          <RecordVis />
          <InfoBox title="Defensive Kopie — die Stelle, die leicht übersehen wird">
            Ein record schützt seine Felder, aber nicht automatisch den <i>Inhalt</i> einer Liste. Deshalb steht in SecretCode und Guess{" "}
            <code style={codeInline}>colors = List.copyOf(colors)</code>: Java macht eine eigene, nicht-änderbare Kopie der übergebenen
            Liste. So kann niemand von außen heimlich die Farben im fertigen Objekt umschreiben.
          </InfoBox>
        </Section>

        {/* 4. interface + Vis */}
        <Section kicker="4 · Abstraktion" title="interface, @FunctionalInterface und Lambdas">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Ein <code style={codeInline}>interface</code> ist ein <b style={{ color: C.text }}>Vertrag</b>: eine Liste von Methoden ohne
            Umsetzung. Verschiedene Klassen können denselben Vertrag <code style={codeInline}>implements</code> (erfüllen). Hat ein
            Interface nur eine einzige Methode (<code style={codeInline}>@FunctionalInterface</code>), darf man die Umsetzung als{" "}
            <b style={{ color: C.text }}>Lambda</b> schreiben — eine Kurzform für „Funktion als Wert“, erkennbar am Pfeil{" "}
            <code style={codeInline}>{"->"}</code>.
          </p>
          <InterfaceVis />
          <InfoBox title="Das ist Polymorphie">
            „Viele Gestalten“: Dieselbe Stelle (<code style={codeInline}>gen.generate()</code>) verhält sich unterschiedlich, je
            nachdem welches Objekt dahintersteckt. Genau das erlaubt deinem Projekt, im Test den Zufall durch einen festen Code zu
            ersetzen, ohne <code style={codeInline}>Game</code> anzufassen.
          </InfoBox>
        </Section>

        {/* 5. Typsicherheit & Null */}
        <Section kicker="5 · Typsicherheit & kein null" title="Generics, Optional und enum">
          <Card>
            <MethodRow
              color={C.accent2}
              name="Generics"
              formula="List<Color>"
              note="Die spitzen Klammern <…> sagen: das ist nicht irgendeine Liste, sondern eine Liste von Color. Versuchst du, etwas anderes hineinzulegen, meckert schon der Compiler — nicht erst das laufende Programm."
            />
            <MethodRow
              color={C.good}
              name="Optional"
              formula="Optional<Color>"
              note="Eine Box, die einen Wert enthalten kann — oder eben nicht. Color.fromSymbol('X') gibt ein leeres Optional zurück statt null. Das zwingt den Aufrufer, den „nichts gefunden“-Fall zu behandeln, und verhindert die berüchtigte NullPointerException."
            />
            <MethodRow
              color={C.accent}
              name="enum"
              formula="enum Color { RED, ... }"
              note="Ein Typ mit fester, benannter Wertemenge. Statt eine Farbe als int 0..7 oder String zu führen, gibt es nur die acht gültigen Color-Konstanten — Tippfehler werden unmöglich."
            />
            <MethodRow
              color={C.gold}
              name="for-each-Schleife"
              formula="for (Color c : values())"
              note="Lies: „für jedes Color c in values()“. Läuft bequem über alle Elemente, ohne Zählvariable und Index. So sucht fromSymbol() das passende Kürzel."
            />
          </Card>
          <div style={{ marginTop: 14 }}>
            <Code lines={[
              `public static Optional<Color> fromSymbol(char symbol) {`,
              `    char upper = Character.toUpperCase(symbol);`,
              `    for (Color color : values()) {`,
              `        if (color.symbol == upper) {`,
              `            return Optional.of(color);     // gefunden`,
              `        }`,
              `    }`,
              `    return Optional.empty();               // nichts gefunden`,
              `}`,
            ]} />
          </div>
        </Section>

        {/* 6. Exceptions */}
        <Section kicker="6 · Fehlerbehandlung" title="Exceptions: Fehler als kontrollierter Notruf">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Eine <b style={{ color: C.text }}>Exception</b> (Ausnahme) ist Javas Weg, einen Fehlerfall zu melden. Mit{" "}
            <code style={codeInline}>throw</code> wirfst du sie, mit <code style={codeInline}>try/catch</code> fängst du sie wieder auf.
            Dazwischen springt das Programm sofort aus der aktuellen Methode heraus.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Card style={{ flex: "1 1 280px", background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 8 }}>1 · werfen (throw)</div>
              <Code lines={[`if (rawInput.isBlank()) {`, `    throw new InvalidGuessException(`, `        "Eingabe darf nicht leer sein.");`, `}`]} />
            </Card>
            <Card style={{ flex: "1 1 280px", background: C.panel2 }}>
              <div style={{ color: C.good, fontWeight: 700, marginBottom: 8 }}>2 · fangen (try / catch)</div>
              <Code lines={[`try {`, `    return Guess.parse(line);`, `} catch (InvalidGuessException e) {`, `    renderer.showInvalidInput(e.getMessage());`, `}`]} />
            </Card>
          </div>
          <InfoBox title="Eigene, sprechende Exception">
            <code style={codeInline}>InvalidGuessException</code> erbt (<code style={codeInline}>extends</code>) von{" "}
            <code style={codeInline}>RuntimeException</code>. Statt eines anonymen Fehlers bekommst du einen mit Namen, der genau sagt,
            was schiefging. Der ConsoleInputReader fängt ihn ab und fragt einfach erneut — ein Tippfehler stürzt das Spiel so nie ab.
          </InfoBox>
        </Section>

        {/* 7. Lombok */}
        <Section kicker="7 · Werkzeug" title="Lombok — Annotationen, die Code erzeugen">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Eine <b style={{ color: C.text }}>Annotation</b> (beginnt mit <code style={codeInline}>@</code>) ist eine Markierung am Code.
            Die Bibliothek Lombok liest solche Markierungen beim Kompilieren und erzeugt daraus automatisch Standard-Code — ähnlich wie
            ein record, nur dort, wo ein record nicht passt.
          </p>
          <Card>
            <MethodRow color={C.gold} name="@Getter" formula="am enum Color" note="Erzeugt für jedes Feld eine Lese-Methode, z. B. getSymbol() und getDisplayName(). Du sparst dir das Tippen, das Verhalten bleibt gleich." />
            <MethodRow color={C.gold} name="@RequiredArgsConstructor" formula="für finale Felder" note="Erzeugt einen Konstruktor, der genau die finalen Felder befüllt. In ConsoleRenderer, ConsoleInputReader und dem Controller ist das die Grundlage der Konstruktor-Injection." />
          </Card>
          <InfoBox title="Bewusst NICHT genutzt: @Data / Setter">
            Lombok könnte auch Setter erzeugen (<code style={codeInline}>@Data</code>) — das würde Objekte aber wieder veränderbar machen
            und der Unveränderlichkeit widersprechen. Deshalb: record für Werte, Lombok nur als Boilerplate-Sparer drumherum.
          </InfoBox>
        </Section>

        {/* 8. Zusammenfassung / Cheat-Sheet */}
        <Section kicker="8 · Auf einen Blick" title="Konzept → wo es in deinem Projekt steckt">
          <Card style={{ background: "rgba(125,211,252,0.06)", border: `1px solid ${C.accent}` }}>
            <CheatRow k="package / import" v="Jede Datei oben — schneidet das Projekt in domain, game, infrastructure, ui." />
            <CheatRow k="enum" v="Color — die 8 Farben mit Kürzel und Name." />
            <CheatRow k="record" v="SecretCode, Guess, Feedback, Round — unveränderliche Wertobjekte." />
            <CheatRow k="interface + Lambda" v="CodeGenerator — Vertrag; im Test als () -> secret erfüllt." />
            <CheatRow k="static final" v="GameRules.CODE_LENGTH, MAX_ATTEMPTS — zentrale Konstanten." />
            <CheatRow k="Generics" v="List<Color>, Optional<Color> — typsichere Container." />
            <CheatRow k="Optional" v="Color.fromSymbol() — kein null bei unbekanntem Kürzel." />
            <CheatRow k="Exception" v="InvalidGuessException + try/catch in ConsoleInputReader." />
            <CheatRow k="Lombok @…" v="@Getter, @RequiredArgsConstructor — gespartes Boilerplate." />
          </Card>
        </Section>

        {/* 9. Glossar */}
        <Section kicker="9 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div id="glossar" />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            <GlossEntry term="package" def="Namensraum/Ordner, der zusammengehörige Klassen bündelt und Namenskonflikte vermeidet." />
            <GlossEntry term="import" def="Macht eine Klasse aus einem anderen Paket nutzbar, ohne jedes Mal den vollen Namen zu schreiben." />
            <GlossEntry term="Klasse" def="Bauplan für Objekte: bündelt Felder (Daten) und Methoden (Verhalten)." />
            <GlossEntry term="Objekt / Instanz" def="Ein konkretes Exemplar einer Klasse, mit eigenen Feldwerten." />
            <GlossEntry term="Feld" def="Eine Variable, die zu einem Objekt (oder bei static zur Klasse) gehört." />
            <GlossEntry term="Methode" def="Benanntes Stück Verhalten mit Parametern und Rückgabetyp; wird mit objekt.name() aufgerufen." />
            <GlossEntry term="Konstruktor" def="Spezielle Methode ohne Rückgabetyp, die beim Erzeugen eines Objekts die Felder befüllt." />
            <GlossEntry term="public / private" def="Zugriffsmodifizierer: public = überall sichtbar, private = nur in der eigenen Klasse (Kapselung)." />
            <GlossEntry term="static" def="Gehört zur Klasse statt zu einem Objekt; existiert genau einmal. Aufruf über den Klassennamen." />
            <GlossEntry term="final" def="Unveränderlich: ein final-Feld bzw. eine final-Variable kann nach Zuweisung nicht mehr geändert werden." />
            <GlossEntry term="this" def="Verweist auf das aktuelle Objekt; trennt gleichnamige Felder von Parametern (this.symbol = symbol)." />
            <GlossEntry term="enum" def="Aufzählungstyp mit fester, benannter Wertemenge — hier die 8 Farben." />
            <GlossEntry term="record" def="Kurzschreibweise für unveränderliche Wertobjekte; erzeugt Felder, Konstruktor, Accessoren, equals, hashCode, toString." />
            <GlossEntry term="Kompakter Konstruktor" def="Im record die Stelle für Validierung der Invarianten, läuft vor dem Setzen der Felder." />
            <GlossEntry term="interface" def="Vertrag aus Methoden ohne Umsetzung; Klassen erfüllen ihn mit implements." />
            <GlossEntry term="@FunctionalInterface" def="Interface mit genau einer Methode; darf als Lambda umgesetzt werden." />
            <GlossEntry term="Lambda  () -> x" def="Kurzform für eine Funktion als Wert. Erfüllt ein FunctionalInterface ohne eigene Klasse." />
            <GlossEntry term="Polymorphie" def="Dieselbe Aufrufstelle verhält sich je nach eingestecktem Objekt unterschiedlich." />
            <GlossEntry term="Generics <T>" def="Typ-Parameter: List<Color> ist eine Liste, die nur Color enthält — vom Compiler geprüft." />
            <GlossEntry term="Optional<T>" def="Box, die einen Wert enthält oder leer ist; ersetzt null und erzwingt die Fallunterscheidung." />
            <GlossEntry term="Exception" def="Objekt, das einen Fehlerfall meldet; mit throw geworfen, mit try/catch gefangen." />
            <GlossEntry term="extends" def="Vererbung: eine Klasse übernimmt Eigenschaften einer anderen (InvalidGuessException extends RuntimeException)." />
            <GlossEntry term="Annotation @…" def="Markierung am Code; Werkzeuge wie Lombok werten sie aus und erzeugen daraus Code." />
            <GlossEntry term="Kapselung" def="Daten privat halten und nur über Methoden zugänglich machen — schützt Invarianten." />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>Lern-Trainer · Java-Konzepte &amp; Syntax — am Beispiel „Mastermind 5-8“</span>
          <span style={{ color: C.dim, fontSize: 13 }}>Prof. Dr. Veronika Lesch · DHBW Mosbach</span>
        </div>
      </footer>
    </div>
  );
}

function CheatRow({ k, v }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "10px 0", borderTop: `1px solid ${C.line}` }}>
      <code style={{ color: C.accent, fontSize: 13, fontWeight: 700, minWidth: 150, fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>{k}</code>
      <span style={{ color: C.text, fontSize: 14, flex: 1, minWidth: 220, lineHeight: 1.5 }}>{v}</span>
    </div>
  );
}
