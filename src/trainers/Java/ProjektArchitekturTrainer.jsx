import React, { useState, useEffect, useRef } from "react";

/*
  Lern-Trainer: „Das ganze Projekt verstehen" — Mastermind 5-8
  -------------------------------------------------------------
  Ein animierter Erklärer, der die komplette Architektur des Java-Projekts
  Schicht für Schicht, Ordner für Ordner und Datei für Datei begreifbar macht.
  Self-contained: nur React + Inline-Styles, keine externen Libraries.
*/

// ---------------------------------------------------------------------------
// Design-System (Dark Theme). Nur accent / accent2 sind thematisch gewählt.
// ---------------------------------------------------------------------------
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc", // cyan  – steht für STRUKTUR / Architektur / Schichten
  accent2: "#a78bfa", // violett – steht für DATENFLUSS / Konzepte / Prinzipien
  good: "#86efac", // grün  – Erfolg/Treffer
  warn: "#fca5a5", // rot   – Problem/Fehler
  gold: "#fcd34d", // gelb  – Highlight
};

// Farbcodierung der vier fachlichen Schichten (Packages)
const LAYER = {
  root: "#94a3b8", // grau  – Wurzel / Einstieg / Build
  domain: C.accent2, // violett – reine Domäne
  game: C.accent, // cyan    – Spiellogik
  infra: C.gold, // gelb    – Infrastruktur
  ui: C.good, // grün    – Ein-/Ausgabe
};

// ---------------------------------------------------------------------------
// Keyframes / globale Animationen
// ---------------------------------------------------------------------------
const STYLE = `
@keyframes pop {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,0.0); }
  50%     { box-shadow: 0 0 0 4px rgba(252,211,77,0.25); }
}
@keyframes flow {
  0%   { transform: translateX(-4px); opacity: 0.2; }
  100% { transform: translateX(0); opacity: 1; }
}
.pop { animation: pop .3s ease-out both; }
*::selection { background: ${C.accent}; color: #06121a; }
html { scroll-behavior: smooth; }
`;

// ---------------------------------------------------------------------------
// useReveal — IntersectionObserver-Hook für sanftes Einblenden beim Scrollen
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setShown(true);
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

// ---------------------------------------------------------------------------
// Wiederverwendbare Bausteine
// ---------------------------------------------------------------------------
function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        marginBottom: 64,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      <div
        style={{
          color: C.accent,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", lineHeight: 1.2 }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tag({ color = C.accent, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        color: C.dim,
        marginRight: 14,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          display: "inline-block",
        }}
      />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(167,139,250,0.08)",
        border: `1px solid ${C.accent2}`,
        borderRadius: 14,
        padding: "18px 20px",
        margin: "18px 0",
      }}
    >
      <div
        style={{
          color: C.accent2,
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>💡</span>
        {title}
      </div>
      <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color = C.accent, name, formula, note }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "14px 0",
        borderTop: `1px solid ${C.line}`,
      }}
    >
      <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: color, minHeight: 38 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{name}</span>
          {formula && (
            <code
              style={{
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 12.5,
                color: color,
              }}
            >
              {formula}
            </code>
          )}
        </div>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

// Button-Styles
const btn = {
  background: C.accent,
  color: "#06121a",
  border: "none",
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

// Kleiner Player-Steuerblock (▶/⏸, Schritt, Reset) — von allen Vis genutzt
function PlayerControls({ playing, setPlaying, onPrev, onNext, onReset, atStart, atEnd, label }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>
        {playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button style={{ ...btnGhost, opacity: atStart ? 0.4 : 1 }} onClick={onPrev} disabled={atStart}>
        ◀ Schritt
      </button>
      <button style={{ ...btnGhost, opacity: atEnd ? 0.4 : 1 }} onClick={onNext} disabled={atEnd}>
        Schritt ▶
      </button>
      <button style={btnGhost} onClick={onReset}>
        ↺ Reset
      </button>
      {label && <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>{label}</span>}
    </div>
  );
}

// ===========================================================================
// VIS 1 — Projekt-Explorer: läuft animiert durch jede Datei des Projekts
// ===========================================================================
const TREE = [
  { depth: 0, kind: "folder", layer: "root", name: "mastermind58/", role: "Projektwurzel. Enthält Build-Dateien, Quellcode und Tests." },
  { depth: 1, kind: "file", layer: "root", name: "build.gradle.kts", role: "Bau-Rezept: Java 25, Lombok (compileOnly), JUnit 5. Definiert die main-Klasse." },
  { depth: 1, kind: "file", layer: "root", name: "settings.gradle.kts", role: "Legt den Projektnamen fest: rootProject.name = \"mastermind58\"." },
  { depth: 1, kind: "file", layer: "root", name: "README.md", role: "Anleitung: Bauen, Starten, Testen + Erklärung der Architektur." },
  { depth: 1, kind: "folder", layer: "root", name: "src/main/java/.../mastermind/", role: "Der eigentliche Produktiv-Code, fachlich in vier Pakete geschnitten." },
  { depth: 2, kind: "file", layer: "root", name: "MastermindApplication.java", role: "Einstiegspunkt: main(). Verdrahtet (injiziert) alle Bausteine und startet das Spiel." },
  { depth: 2, kind: "folder", layer: "domain", name: "domain/", role: "Reine Domäne — die Spielbegriffe selbst. KEINE Ein-/Ausgabe, keine Abhängigkeit nach außen." },
  { depth: 3, kind: "file", layer: "domain", name: "Color.java", role: "Enum mit den 8 Farben, je mit Kürzel (R,G,B,…) und Anzeigename. fromSymbol() deutet Eingaben." },
  { depth: 3, kind: "file", layer: "domain", name: "GameRules.java", role: "Zentrale Konstanten: CODE_LENGTH = 5, MAX_ATTEMPTS = 10. Verhindert „magische Zahlen\"." },
  { depth: 3, kind: "file", layer: "domain", name: "SecretCode.java", role: "record (unveränderlich): der geheime Code aus 5 Farben. Kopiert die Liste defensiv." },
  { depth: 3, kind: "file", layer: "domain", name: "Guess.java", role: "record: ein Tipp aus 5 Farben. parse() macht aus Roh-Text einen geprüften Tipp." },
  { depth: 3, kind: "file", layer: "domain", name: "Feedback.java", role: "record: das Ergebnis (schwarze/weiße Stecker). isWinning() = 5 schwarze." },
  { depth: 3, kind: "file", layer: "domain", name: "InvalidGuessException.java", role: "Sprechende Ausnahme bei ungültiger Eingabe — statt Programmabsturz." },
  { depth: 2, kind: "folder", layer: "game", name: "game/", role: "Spiellogik / Regeln — verbindet die Domänen-Objekte zu einem Spielablauf." },
  { depth: 3, kind: "file", layer: "game", name: "CodeGenerator.java", role: "Interface (Abstraktion): „irgendwer liefert einen Geheimcode\". Kennt das WIE nicht." },
  { depth: 3, kind: "file", layer: "game", name: "FeedbackCalculator.java", role: "Das Herzstück: berechnet zweistufig schwarze, dann weiße Stecker (Duplikat-sicher)." },
  { depth: 3, kind: "file", layer: "game", name: "Round.java", role: "record: ein Spielzug = Tipp + zugehöriges Feedback. Ein Eintrag im Verlauf." },
  { depth: 3, kind: "file", layer: "game", name: "Game.java", role: "Zustand EINER Runde: Geheimcode, Verlauf, Versuche, Gewinn/Verlust. Keine Konsole!" },
  { depth: 2, kind: "folder", layer: "infra", name: "infrastructure/", role: "Konkrete technische Umsetzung der Abstraktionen aus game/." },
  { depth: 3, kind: "file", layer: "infra", name: "RandomCodeGenerator.java", role: "implements CodeGenerator: würfelt 5 zufällige Farben. Zufallsquelle ist injizierbar." },
  { depth: 2, kind: "folder", layer: "ui", name: "ui/", role: "Konsolen-Ein-/Ausgabe — die einzige Schicht, die System.out/in berührt." },
  { depth: 3, kind: "file", layer: "ui", name: "ConsoleRenderer.java", role: "Alle Ausgaben: Begrüßung, Verlaufstabelle, Feedback, Sieg/Niederlage." },
  { depth: 3, kind: "file", layer: "ui", name: "ConsoleInputReader.java", role: "Liest Eingaben in einer robusten Schleife: fragt bei Fehler einfach erneut." },
  { depth: 3, kind: "file", layer: "ui", name: "ConsoleGameController.java", role: "Dirigent: Begrüßung → Rate-Schleife → Ergebnis → „Nochmal?\". Trifft KEINE Fach-Entscheidung." },
  { depth: 1, kind: "folder", layer: "root", name: "src/test/java/", role: "JUnit-Tests, spiegeln die Paketstruktur: prüfen Domäne und Spiellogik." },
  { depth: 2, kind: "file", layer: "domain", name: "FeedbackTest · GuessTest · SecretCodeTest", role: "Domänen-Tests: Invarianten, Eingabevalidierung, Unveränderlichkeit." },
  { depth: 2, kind: "file", layer: "game", name: "FeedbackCalculatorTest · GameTest", role: "Logik-Tests: Duplikat-Fälle des Feedbacks + Gewinn/Verlust (mit festem Generator)." },
];

function ProjectExplorerVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= TREE.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1300);
    return () => clearInterval(timer.current);
  }, [playing]);

  const active = TREE[i];
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {/* Baum */}
        <div
          style={{
            flex: "1 1 320px",
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 12,
            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            fontSize: 12.5,
            maxHeight: 420,
            overflow: "auto",
          }}
        >
          {TREE.map((n, idx) => {
            const on = idx === i;
            const col = LAYER[n.layer];
            return (
              <div
                key={idx}
                onClick={() => setI(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 6px",
                  marginLeft: n.depth * 14,
                  borderRadius: 6,
                  cursor: "pointer",
                  background: on ? "rgba(252,211,77,0.14)" : "transparent",
                  outline: on ? `1px solid ${C.gold}` : "1px solid transparent",
                  color: on ? C.text : n.kind === "folder" ? C.text : C.dim,
                  transition: "background .3s, outline .3s",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                <span style={{ fontWeight: n.kind === "folder" ? 700 : 400 }}>
                  {n.kind === "folder" ? "📁 " : ""}
                  {n.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div className="pop" key={i} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: LAYER[active.layer] }} />
              <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: LAYER[active.layer], fontWeight: 700 }}>
                {active.layer === "root" ? "Wurzel / Einstieg" : active.layer + "-Schicht"}
              </span>
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700, marginBottom: 10, color: C.text }}>
              {active.name}
            </div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{active.role}</div>
          </div>
          <div style={{ marginTop: 14, color: C.dim, fontSize: 13 }}>
            Datei {i + 1} / {TREE.length}
          </div>
        </div>
      </div>

      <PlayerControls
        playing={playing}
        setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(TREE.length - 1, v + 1))}
        onReset={() => {
          setI(0);
          setPlaying(false);
        }}
        atStart={i === 0}
        atEnd={i === TREE.length - 1}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={LAYER.root}>Wurzel / Build</Tag>
        <Tag color={LAYER.domain}>domain</Tag>
        <Tag color={LAYER.game}>game</Tag>
        <Tag color={LAYER.infra}>infrastructure</Tag>
        <Tag color={LAYER.ui}>ui</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 2 — Datenfluss: die Reise EINES Tipps durch die Schichten
// ===========================================================================
const FLOW = [
  { layer: "ui", file: "Konsole", text: 'Spieler tippt:  "R B R R R"', detail: "Eine rohe Textzeile — noch ohne jede Bedeutung." },
  { layer: "ui", file: "ConsoleInputReader.readGuess()", text: "liest die Zeile", detail: "Holt die Eingabe über den Scanner und gibt sie zur Prüfung weiter." },
  { layer: "domain", file: "Guess.parse(\"R B R R R\")", text: "→ Guess[R,B,R,R,R]", detail: "Leerzeichen weg, jedes Kürzel → Color. Länge 5? Gültig? Sonst Exception." },
  { layer: "ui", file: "ConsoleGameController", text: "übergibt den Tipp", detail: "Der Dirigent reicht den geprüften Guess an die Spiellogik weiter." },
  { layer: "game", file: "Game.submitGuess(guess)", text: "nimmt Tipp entgegen", detail: "Prüft, ob die Runde noch läuft, und ruft den Rechner auf." },
  { layer: "game", file: "FeedbackCalculator.calculate()", text: "rechnet …", detail: "Vergleicht Tipp mit Geheimcode (Vis unten zeigt das Detail)." },
  { layer: "domain", file: "new Feedback(1, 2)", text: "= 1 schwarz, 2 weiß", detail: "Das Ergebnis als unveränderliches Wertobjekt." },
  { layer: "game", file: "Game.history.add(Round)", text: "speichert Round", detail: "Tipp + Feedback wandern als ein Spielzug in den Verlauf." },
  { layer: "ui", file: "ConsoleRenderer.showFeedback()", text: "gibt aus", detail: "„Feedback: 1 schwarz, 2 weiss\" erscheint auf der Konsole." },
];

const LAYER_LABEL = { ui: "ui", game: "game", domain: "domain", infra: "infra" };

function DataFlowVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= FLOW.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer.current);
  }, [playing]);

  const step = FLOW[i];

  // Stacked-Schichten-Spalte (rechts) — zeigt, wo der Token gerade ist
  const layers = ["ui", "game", "domain", "infra"];
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {/* Ablaufliste */}
        <div style={{ flex: "1 1 360px", minWidth: 280 }}>
          {FLOW.map((s, idx) => {
            const on = idx === i;
            const done = idx < i;
            const col = LAYER[s.layer];
            return (
              <div
                key={idx}
                onClick={() => setI(idx)}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "8px 10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  marginBottom: 4,
                  background: on ? "rgba(252,211,77,0.12)" : "transparent",
                  outline: on ? `1px solid ${C.gold}` : "1px solid transparent",
                  opacity: done ? 0.55 : 1,
                  transition: "all .3s",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    flexShrink: 0,
                    background: on ? C.gold : done ? C.good : C.panel2,
                    color: on || done ? "#06121a" : C.dim,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${C.line}`,
                  }}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: col }} />
                    <code style={{ fontSize: 12.5, color: on ? C.text : C.dim }}>{s.file}</code>
                  </div>
                  <div style={{ fontSize: 13, color: on ? C.text : C.dim, marginTop: 2 }}>{s.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schichten-Säule + aktuelle Erklärung */}
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {layers.map((l) => {
              const here = step.layer === l;
              return (
                <div
                  key={l}
                  style={{
                    border: `1px solid ${here ? LAYER[l] : C.line}`,
                    background: here ? "rgba(255,255,255,0.04)" : C.panel2,
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all .3s",
                    animation: here ? "pulseGlow 1.4s ease-in-out infinite" : "none",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: LAYER[l] }} />
                  <span style={{ fontSize: 13, fontWeight: here ? 700 : 500, color: here ? C.text : C.dim }}>
                    {LAYER_LABEL[l]}
                  </span>
                  {here && (
                    <span className="pop" style={{ marginLeft: "auto", fontSize: 16 }}>
                      📦
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div
            key={i}
            className="pop"
            style={{ marginTop: 14, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}
          >
            <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{step.detail}</div>
          </div>
        </div>
      </div>

      <PlayerControls
        playing={playing}
        setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(FLOW.length - 1, v + 1))}
        onReset={() => {
          setI(0);
          setPlaying(false);
        }}
        atStart={i === 0}
        atEnd={i === FLOW.length - 1}
        label={`Schritt ${i + 1} / ${FLOW.length}`}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.gold}>aktiver Schritt</Tag>
        <Tag color={C.good}>erledigt</Tag>
        <Tag color={LAYER.ui}>ui</Tag>
        <Tag color={LAYER.game}>game</Tag>
        <Tag color={LAYER.domain}>domain</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 3 — Der schwierige Teil: zweistufige Feedback-Berechnung (Duplikate!)
// Beispiel aus Anhang A.4.2:  Code R R B G Y   Tipp R B R R R  → 1 schwarz, 2 weiß
// ===========================================================================
const SECRET = ["R", "R", "B", "G", "Y"];
const GUESS = ["R", "B", "R", "R", "R"];
const PEG_COLOR = { R: "#f87171", B: "#60a5fa", G: "#86efac", Y: "#fbbf24" };

// Vorberechnete Schrittfolge des Algorithmus
function buildFeedbackSteps() {
  const steps = [];
  steps.push({
    phase: 0,
    msg: "Start. Wir vergleichen Tipp und Code Position für Position.",
    black: 0,
    white: 0,
    pos: -1,
    blacks: [false, false, false, false, false],
    restSecret: [],
    restGuess: [],
    ptr: -1,
    removed: null,
  });

  // Phase 1: schwarze Stecker
  const blacks = [false, false, false, false, false];
  const restSecret = [];
  const restGuess = [];
  let black = 0;
  for (let p = 0; p < 5; p++) {
    const match = SECRET[p] === GUESS[p];
    if (match) {
      black++;
      blacks[p] = true;
    } else {
      restSecret.push(SECRET[p]);
      restGuess.push(GUESS[p]);
    }
    steps.push({
      phase: 1,
      msg: match
        ? `Position ${p + 1}: Tipp ${GUESS[p]} = Code ${SECRET[p]}  →  SCHWARZER Stecker!`
        : `Position ${p + 1}: Tipp ${GUESS[p]} ≠ Code ${SECRET[p]}  →  beide kommen in den „Rest\".`,
      black,
      white: 0,
      pos: p,
      blacks: [...blacks],
      restSecret: [...restSecret],
      restGuess: [...restGuess],
      ptr: -1,
      removed: null,
      hit: match,
    });
  }
  steps.push({
    phase: 1.5,
    msg: `Phase 1 fertig: ${black} schwarz. Übrig bleiben Rest-Code [${restSecret.join(" ")}] und Rest-Tipp [${restGuess.join(" ")}].`,
    black,
    white: 0,
    pos: -1,
    blacks: [...blacks],
    restSecret: [...restSecret],
    restGuess: [...restGuess],
    ptr: -1,
    removed: null,
  });

  // Phase 2: weiße Stecker — jeden Rest-Tipp im Rest-Code suchen & entfernen
  let white = 0;
  const rs = [...restSecret];
  for (let k = 0; k < restGuess.length; k++) {
    const g = restGuess[k];
    const idx = rs.indexOf(g);
    const found = idx !== -1;
    if (found) {
      white++;
      rs.splice(idx, 1);
    }
    steps.push({
      phase: 2,
      msg: found
        ? `Rest-Tipp ${g}: im Rest-Code gefunden  →  WEISSER Stecker! Farbe wird verbraucht (entfernt).`
        : `Rest-Tipp ${g}: nicht (mehr) im Rest-Code  →  kein Stecker. Duplikat wird NICHT doppelt gezählt.`,
      black,
      white,
      pos: -1,
      blacks: [...blacks],
      restSecret: [...rs],
      restGuess: [...restGuess],
      ptr: k,
      removed: found ? g : null,
      foundWhite: found,
    });
  }
  steps.push({
    phase: 3,
    msg: `Ergebnis: Feedback(${black}, ${white})  →  ${black} schwarz, ${white} weiß. ✅`,
    black,
    white,
    pos: -1,
    blacks: [...blacks],
    restSecret: [...rs],
    restGuess: [...restGuess],
    ptr: -1,
    removed: null,
    done: true,
  });
  return steps;
}
const FB_STEPS = buildFeedbackSteps();

function Peg({ ch, dim, ring }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: dim ? C.panel2 : PEG_COLOR[ch] || C.dim,
        color: dim ? C.dim : "#0b1016",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 15,
        border: ring ? `3px solid ${C.gold}` : `2px solid ${C.line}`,
        boxSizing: "border-box",
        transition: "all .3s",
        opacity: dim ? 0.35 : 1,
      }}
    >
      {ch}
    </div>
  );
}

function FeedbackVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= FB_STEPS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1600);
    return () => clearInterval(timer.current);
  }, [playing]);

  const s = FB_STEPS[i];
  const phaseLabel =
    s.phase === 0 ? "Vorbereitung" : s.phase < 2 ? "Phase 1 — schwarze Stecker" : s.phase === 2 ? "Phase 2 — weiße Stecker" : "Ergebnis";

  return (
    <Card>
      {/* Phasen-Badge + Zähler */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: s.phase < 2 ? C.accent : s.phase === 2 ? C.accent2 : C.good,
          }}
        >
          {phaseLabel}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.text }}>
            ⚫ schwarz: <b style={{ color: C.text }}>{s.black}</b>
          </span>
          <span style={{ fontSize: 13, color: C.text }}>
            ⚪ weiß: <b style={{ color: C.text }}>{s.white}</b>
          </span>
        </div>
      </div>

      {/* Code + Tipp Reihen */}
      <div style={{ display: "grid", gap: 12 }}>
        <Row label="Code" arr={SECRET} highlightPos={s.phase === 1 ? s.pos : -1} blacks={s.blacks} />
        <Row label="Tipp" arr={GUESS} highlightPos={s.phase === 1 ? s.pos : -1} blacks={s.blacks} />
      </div>

      {/* Rest-Listen (Phase 2 relevant) */}
      {(s.phase === 1.5 || s.phase === 2 || s.phase === 3) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 18 }}>
          <RestList title="Rest-Code (noch verfügbar)" arr={s.restSecret} ptr={-1} flash={s.removed} mode="secret" />
          <RestList title="Rest-Tipp (wird abgearbeitet)" arr={FB_STEPS.find((x) => x.phase === 1.5)?.restGuess || []} ptr={s.ptr} flash={null} mode="guess" />
        </div>
      )}

      {/* Erklärzeile */}
      <div
        key={i}
        className="pop"
        style={{
          marginTop: 18,
          background: s.done ? "rgba(134,239,172,0.1)" : C.panel2,
          border: `1px solid ${s.done ? C.good : C.line}`,
          borderRadius: 12,
          padding: "14px 16px",
          fontSize: 14,
          color: C.text,
          lineHeight: 1.6,
          minHeight: 30,
        }}
      >
        {s.msg}
      </div>

      <PlayerControls
        playing={playing}
        setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(FB_STEPS.length - 1, v + 1))}
        onReset={() => {
          setI(0);
          setPlaying(false);
        }}
        atStart={i === 0}
        atEnd={i === FB_STEPS.length - 1}
        label={`Schritt ${i + 1} / ${FB_STEPS.length}`}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.gold}>aktive Position</Tag>
        <Tag color={C.good}>schwarzer Treffer</Tag>
        <Tag color={C.accent2}>verbrauchte Farbe</Tag>
      </div>
    </Card>
  );
}

function Row({ label, arr, highlightPos, blacks }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 42, fontSize: 12.5, color: C.dim, textAlign: "right" }}>{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {arr.map((ch, p) => (
          <div key={p} style={{ position: "relative" }}>
            <Peg ch={ch} ring={p === highlightPos} dim={false} />
            {blacks[p] && (
              <span
                className="pop"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#111",
                  border: `2px solid ${C.good}`,
                }}
                title="schwarzer Stecker"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RestList({ title, arr, ptr, flash, mode }) {
  return (
    <div style={{ flex: "1 1 200px", minWidth: 190 }}>
      <div style={{ fontSize: 12, color: C.dim, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 40 }}>
        {arr.length === 0 && <span style={{ color: C.dim, fontSize: 13, fontStyle: "italic" }}>leer</span>}
        {arr.map((ch, k) => (
          <Peg key={k} ch={ch} ring={mode === "guess" && k === ptr} dim={false} />
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
export default function ProjektArchitekturTrainer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent2 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
              Lern-Trainer · Projektarchitektur
            </span>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
            Das ganze Projekt verstehen:
            <br />
            <span style={{ color: C.accent }}>Mastermind 5-8</span>, Schicht für Schicht
          </h1>
          <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
            17 kleine Java-Dateien in vier Paketen — auf den ersten Blick viel. Dieser Trainer zeigt dir,{" "}
            <b style={{ color: C.text }}>warum</b> der Code so aufgeteilt ist, <b style={{ color: C.text }}>wie</b> ein einziger Tipp
            durch alle Schichten reist und <b style={{ color: C.text }}>was</b> jede einzelne Datei tut. Am Ende ist nichts mehr eine
            Blackbox.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#explorer" style={{ ...btn, textDecoration: "none" }}>
              ▶ Projekt erkunden
            </a>
            <a href="#glossar" style={{ ...btnGhost, textDecoration: "none" }}>
              Zum Glossar
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 56 }} />

        {/* 0. Das Problem */}
        <Section kicker="0 · Das Problem" title="Warum nicht einfach alles in eine Datei?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Man könnte Mastermind in einer einzigen <code style={codeInline}>Main.java</code> schreiben: Eingabe lesen, Code würfeln,
            vergleichen, ausgeben — alles untereinander. Für ein Wochenend-Skript reicht das. Aber sobald ein Programm{" "}
            <b style={{ color: C.text }}>wachsen, getestet oder im Team gepflegt</b> werden soll, wird so eine Datei zur Falle:
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 8 }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Alles vermischt</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Spielregeln, Konsolen-Ausgabe und Zufall stehen verschränkt nebeneinander. Eine kleine Änderung an der Ausgabe kann die
                Regel-Logik zerschießen.
              </div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Kaum testbar</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Wie testest du die Feedback-Regel, wenn sie nur „beim Tippen in der Konsole" passiert? Du müsstest das ganze Programm
                fernsteuern.
              </div>
            </Card>
          </div>
          <InfoBox title="Die Leitfrage des ganzen Designs">
            „Wenn ich morgen die Konsole gegen eine grafische Oberfläche tausche oder den Zufall durch einen festen Code für einen Test
            ersetze — wie viel Code muss ich dafür anfassen?" Antwort dieses Projekts: <b>fast keinen.</b> Genau dafür gibt es die
            Schichten.
          </InfoBox>
        </Section>

        {/* 1. Die Kernidee */}
        <Section kicker="1 · Die Kernidee" title="Vier Pakete, je eine Verantwortung">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Der Code ist in vier <b style={{ color: C.text }}>Pakete</b> (englisch <i>packages</i> — Ordner, die zusammengehörigen Code
            bündeln) geschnitten. Jedes Paket hat <b style={{ color: C.text }}>genau eine Aufgabe</b>. Das ist das{" "}
            <b style={{ color: C.accent }}>Single-Responsibility-Prinzip</b> (Prinzip der einzelnen Verantwortung): Ein Baustein sollte
            nur aus einem Grund geändert werden müssen.
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
            <LayerCard color={LAYER.domain} name="domain" sub="Die Spielbegriffe selbst">
              Was <i>ist</i> ein Geheimcode, ein Tipp, ein Feedback? Reine Datentypen mit Regeln, die immer gelten müssen. Berührt
              niemals Konsole oder Zufall.
            </LayerCard>
            <LayerCard color={LAYER.game} name="game" sub="Die Spielregeln im Ablauf">
              Wie wird Feedback berechnet? Wann ist eine Runde gewonnen oder verloren? Verbindet die Domänen-Objekte zu einem Spiel.
            </LayerCard>
            <LayerCard color={LAYER.infra} name="infrastructure" sub="Die technische Umsetzung">
              Die konkrete „Wie genau"-Antwort auf abstrakte Versprechen — hier: das echte Würfeln zufälliger Farben.
            </LayerCard>
            <LayerCard color={LAYER.ui} name="ui" sub="Reden mit dem Menschen">
              Liest Tastatur-Eingaben, malt Tabellen, zeigt Sieg/Niederlage. Die einzige Schicht, die <code style={codeInline}>System.out</code>{" "}
              und <code style={codeInline}>System.in</code> kennt.
            </LayerCard>
          </div>
          <InfoBox title="Abhängigkeitsrichtung — der wichtigste Pfeil">
            Die Abhängigkeiten zeigen <b>nach innen</b>: <code style={codeInline}>ui → game → domain</code>. Die Domäne (innen) weiß
            nichts von der Konsole (außen). Du kannst die äußeren Schichten austauschen, ohne den Kern anzufassen. Innen ist stabil,
            außen ist beweglich.
          </InfoBox>
        </Section>

        {/* VIS 1 */}
        <Section kicker="Interaktiv · Explorer" title="Jede Datei, einmal angefasst">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Klick auf eine Datei oder drück ▶ — der Explorer läuft durch das komplette Projekt und erklärt jede Datei in einem Satz. Die
            Farbpunkte zeigen die Schicht.
          </p>
          <div id="explorer" />
          <ProjectExplorerVis />
        </Section>

        {/* 2. Das zentrale Problem */}
        <Section kicker="2 · Der schwierige Teil" title="Wie bleiben die Schichten wirklich entkoppelt?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Ein Problem bleibt: <code style={codeInline}>Game</code> (Spiellogik) braucht einen Geheimcode. Der wird zufällig erzeugt —
            aber Zufall ist <i>Infrastruktur</i>, eine äußere Schicht. Würde <code style={codeInline}>Game</code> direkt{" "}
            <code style={codeInline}>new RandomCodeGenerator()</code> aufrufen, hinge der Kern plötzlich am Außen. Genau das wollten wir
            vermeiden.
          </p>
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die Lösung heißt <b style={{ color: C.accent2 }}>Dependency Inversion</b> (Abhängigkeits-Umkehr): Statt einer konkreten
            Klasse hängt <code style={codeInline}>Game</code> nur von einem <b style={{ color: C.text }}>Interface</b> ab —
            <code style={codeInline}>CodeGenerator</code>. Ein Interface ist ein <i>Versprechen</i> („es gibt eine Methode{" "}
            <code style={codeInline}>generate()</code>"), ohne zu sagen, wie sie funktioniert.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "stretch", marginTop: 8 }}>
            <Card style={{ flex: "1 1 240px", background: C.panel2 }}>
              <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Das Versprechen (game)</div>
              <code style={{ ...codeBlock, color: C.accent }}>
                interface CodeGenerator {"{"}
                <br />
                &nbsp;&nbsp;SecretCode generate();
                <br />
                {"}"}
              </code>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                Game kennt nur das. Es ist egal, ob der Code gewürfelt, fest vorgegeben oder aus einer Datei gelesen wird.
              </div>
            </Card>
            <Card style={{ flex: "1 1 240px", background: C.panel2 }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Die Einlösung (infrastructure)</div>
              <code style={{ ...codeBlock, color: C.gold }}>
                class RandomCodeGenerator
                <br />
                &nbsp;&nbsp;implements CodeGenerator {"{"} … {"}"}
              </code>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                Im Test wird stattdessen <code style={codeInline}>{"() -> secret"}</code> eingesetzt — ein fester Code per Lambda. Game
                merkt davon nichts.
              </div>
            </Card>
          </div>
          <InfoBox title="Wer entscheidet, welche Variante läuft?">
            Genau <b>eine</b> Stelle: <code style={codeInline}>MastermindApplication.main()</code>. Dort wird die konkrete{" "}
            <code style={codeInline}>RandomCodeGenerator</code>-Instanz erzeugt und per Konstruktor in den Controller „injiziert"
            (hineingegeben). Das nennt man <b>Dependency Injection</b>. Der Rest des Programms bleibt von der Wahl unberührt.
          </InfoBox>
        </Section>

        {/* 3. Qualität / Varianten — SOLID + record vs Lombok */}
        <Section kicker="3 · Prinzipien & Werkzeuge" title="Die Entwurfs-Entscheidungen im Überblick">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 6 }}>
            Die Architektur folgt drei der fünf <b style={{ color: C.text }}>SOLID</b>-Prinzipien (fünf Faustregeln für wartbaren
            objektorientierten Code). Dazu zwei bewusste Werkzeug-Entscheidungen:
          </p>
          <Card>
            <MethodRow
              color={LAYER.domain}
              name="Single Responsibility"
              formula="1 Klasse = 1 Grund zu ändern"
              note="Domäne, Logik und I/O liegen in getrennten Paketen. Game enthält keine einzige Konsolen-Ausgabe."
            />
            <MethodRow
              color={LAYER.game}
              name="Open/Closed"
              formula="offen für Erweiterung"
              note="Neue Code-Erzeugungs-Strategien ergänzt man als neue CodeGenerator-Implementierung — ohne Game zu ändern."
            />
            <MethodRow
              color={LAYER.infra}
              name="Dependency Inversion"
              formula="abhängig von Abstraktion"
              note="Game hängt am Interface CodeGenerator, nicht an RandomCodeGenerator. Die konkrete Wahl fällt erst in main()."
            />
            <MethodRow
              color={C.accent2}
              name="Java record"
              formula="für Wertobjekte"
              note="SecretCode, Guess, Feedback, Round sind records: von Natur aus unveränderlich, mit automatischem equals/hashCode/toString. Validierung im kompakten Konstruktor."
            />
            <MethodRow
              color={C.gold}
              name="Lombok"
              formula="@Getter, @RequiredArgsConstructor"
              note="Nur dort, wo ein record nicht passt: am Enum Color und für die Konstruktor-Injection in den Service-/UI-Klassen. Spart Boilerplate, ohne Unveränderlichkeit aufzugeben."
            />
          </Card>
          <InfoBox title="Warum record und nicht überall Lombok?">
            Ein <code style={codeInline}>record</code> erzwingt Unveränderlichkeit (es entstehen gar keine Setter). Bei reinen
            Wertobjekten ist das genau das, was man will. Lomboks <code style={codeInline}>@Data</code> würde dagegen veränderbare
            Setter erzeugen — das widerspräche der Idee. Deshalb: record für Werte, Lombok nur als Boilerplate-Sparer drumherum.
          </InfoBox>
        </Section>

        {/* VIS 2 */}
        <Section kicker="Interaktiv · Datenfluss" title="Die Reise eines einzigen Tipps">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Folge dem Tipp <code style={codeInline}>"R B R R R"</code> von der Tastatur bis zur Ausgabe. Beachte, wie er die Schichten
            wechselt (rechts leuchtet das aktive Paket) und sich von rohem Text in ein geprüftes <code style={codeInline}>Guess</code>-
            und schließlich ein <code style={codeInline}>Feedback</code>-Objekt verwandelt.
          </p>
          <DataFlowVis />
        </Section>

        {/* 4. Detail / Sonderfall — Feedback-Algorithmus */}
        <Section kicker="4 · Der kniffligste Aspekt" title="Schwarze und weiße Stecker bei Duplikaten">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die fachlich heikelste Stelle des ganzen Projekts ist <code style={codeInline}>FeedbackCalculator</code>. Mastermind-Regel:
          </p>
          <ul style={{ color: C.text, fontSize: 15, lineHeight: 1.8, paddingLeft: 20 }}>
            <li>
              <b style={{ color: C.text }}>Schwarzer Stecker</b> = richtige Farbe an <b>richtiger</b> Position.
            </li>
            <li>
              <b style={{ color: C.text }}>Weißer Stecker</b> = richtige Farbe an <b>falscher</b> Position.
            </li>
          </ul>
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die Falle sind <b style={{ color: C.warn }}>doppelte Farben</b>. Ein naiver „zähle einfach alle gemeinsamen Farben"-Ansatz
            zählt eine Farbe mehrfach und liefert falsche Werte. Die saubere Lösung ist <b style={{ color: C.accent }}>zweistufig</b>:
            erst <i>alle</i> schwarzen Treffer ermitteln, und nur die <b>übrig gebliebenen</b> (nicht „verbrauchten") Farben gehen in die
            Weiß-Zählung — jede Farbe wird beim Treffer aus dem Rest entfernt.
          </p>
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7 }}>
            Spiel das Beispiel <b style={{ color: C.text }}>Code R R B G Y</b> gegen <b style={{ color: C.text }}>Tipp R B R R R</b> Schritt
            für Schritt durch (verbindlicher Fall A.4.2 der Spezifikation, Ergebnis: 1 schwarz, 2 weiß):
          </p>
          <FeedbackVis />
        </Section>

        {/* 5. Analyse */}
        <Section kicker="5 · Analyse" title="Korrektheit, Laufzeit & Robustheit">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Schauen wir formal auf das Verhalten — was kostet es und warum stimmt es immer?
          </p>
          <Card>
            <MethodRow
              color={C.accent}
              name="Feedback-Berechnung"
              formula="O(n²) · n = 5"
              note="Phase 1 läuft einmal über n Positionen (O(n)). Phase 2 sucht für jede Rest-Farbe linear im Rest (remove/indexOf), im schlimmsten Fall O(n²). Bei n=5 ist das vernachlässigbar — Lesbarkeit schlägt Mikro-Optimierung."
            />
            <MethodRow
              color={C.accent2}
              name="Korrektheit bei Duplikaten"
              formula="„verbrauchen“ statt „zählen“"
              note="Weil jede getroffene Farbe aus dem Rest-Code entfernt wird, kann keine Position des Codes oder Tipps doppelt gewertet werden. Genau das beweisen die Tests shouldNotCountDuplicatesTwice & shouldCountColorOnlyAsOftenAsItOccursInSecret."
            />
            <MethodRow
              color={C.good}
              name="Eingabe-Robustheit"
              formula="Worst case: Endlos-Retry"
              note="ConsoleInputReader fängt InvalidGuessException und fragt erneut — ein Tippfehler beendet das Spiel nie. Validierung sitzt im Guess-Konstruktor, also kann gar kein ungültiger Tipp entstehen."
            />
            <MethodRow
              color={C.gold}
              name="Unveränderlichkeit"
              formula="defensive Kopie · List.copyOf"
              note="SecretCode/Guess kopieren ihre Farbliste und geben nur eine nicht-änderbare Sicht heraus. Best & Worst Case identisch: niemand kann ein Wertobjekt nachträglich verändern."
            />
          </Card>
          <InfoBox title="Warum ist O(n²) hier völlig okay?">
            Die O-Notation (Groß-O) beschreibt, wie der Aufwand mit der Eingabegröße <i>n</i> wächst. <code style={codeInline}>O(n²)</code>{" "}
            bedeutet „quadratisch". Klingt teuer — aber <i>n</i> ist hier durch die Spielregel fest auf 5 begrenzt. 5² = 25 Vergleiche pro
            Tipp. Eine Optimierung auf <code style={codeInline}>O(n)</code> mit Zähl-Arrays würde den Code nur schwerer lesbar machen,
            ohne spürbaren Gewinn. <b>Die richtige Komplexität ist die, die zum Problem passt.</b>
          </InfoBox>
        </Section>

        {/* 6. Zusammenfassung */}
        <Section kicker="6 · Auf einen Blick" title="Das ganze Projekt in fünf Sätzen">
          <Card style={{ background: "rgba(125,211,252,0.06)", border: `1px solid ${C.accent}` }}>
            <ol style={{ margin: 0, paddingLeft: 20, color: C.text, fontSize: 15.5, lineHeight: 1.9 }}>
              <li>
                <b style={{ color: C.accent }}>Vier Pakete, vier Verantwortungen:</b> domain (Begriffe), game (Regeln), infrastructure
                (Technik), ui (Mensch).
              </li>
              <li>
                <b style={{ color: C.accent }}>Abhängigkeiten zeigen nach innen:</b> Der Kern (domain) weiß nichts vom Außen (Konsole,
                Zufall).
              </li>
              <li>
                <b style={{ color: C.accent }}>Interfaces entkoppeln:</b> Game kennt nur <code style={codeInline}>CodeGenerator</code>;
                die echte Variante wird in <code style={codeInline}>main()</code> injiziert.
              </li>
              <li>
                <b style={{ color: C.accent }}>Wertobjekte sind unveränderlich:</b> records mit Validierung im Konstruktor — ungültige
                Zustände sind unmöglich.
              </li>
              <li>
                <b style={{ color: C.accent }}>Das Herzstück ist zweistufig:</b> erst schwarze, dann weiße Stecker aus dem Rest — so
                stimmen auch Duplikate.
              </li>
            </ol>
          </Card>
          <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.7, marginTop: 16 }}>
            Wenn du das verstanden hast, kannst du jede einzelne Datei lesen und sofort einordnen: <i>Zu welcher Schicht gehört sie? Was
            ist ihre eine Aufgabe? Worauf darf sie zugreifen — und worauf nicht?</i> Das ist „das ganze Projekt verstehen".
          </p>
        </Section>

        {/* 7. Glossar */}
        <Section kicker="7 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div id="glossar" />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            <GlossEntry term="Paket / package" def="Ein Ordner, der zusammengehörige Java-Klassen bündelt. Hier: domain, game, infrastructure, ui." />
            <GlossEntry term="Schicht / Layer" def="Eine Ebene mit klar abgegrenzter Aufgabe. Abhängigkeiten zeigen von außen (ui) nach innen (domain)." />
            <GlossEntry term="Domäne / domain" def="Die fachlichen Kernbegriffe (Code, Tipp, Feedback) ohne jede technische Abhängigkeit." />
            <GlossEntry term="Interface" def="Ein Versprechen über vorhandene Methoden, ohne deren Umsetzung. Erlaubt das Austauschen von Implementierungen." />
            <GlossEntry term="Abstraktion" def="Das Wesentliche festhalten, Details weglassen. CodeGenerator sagt „liefert einen Code“, nicht „würfelt“." />
            <GlossEntry term="Implementierung" def="Die konkrete Einlösung eines Interface-Versprechens, z. B. RandomCodeGenerator." />
            <GlossEntry term="Dependency Inversion" def="Abhängigkeits-Umkehr: Code hängt von Abstraktionen ab, nicht von konkreten Klassen." />
            <GlossEntry term="Dependency Injection" def="Abhängigkeiten werden von außen hineingegeben (per Konstruktor), statt selbst erzeugt. Hier in main()." />
            <GlossEntry term="SOLID" def="Fünf Faustregeln für wartbaren OO-Code. Genutzt: Single Responsibility, Open/Closed, Dependency Inversion." />
            <GlossEntry term="Single Responsibility" def="Eine Klasse sollte nur einen Grund haben, geändert zu werden — genau eine Aufgabe." />
            <GlossEntry term="Open/Closed" def="Offen für Erweiterung (neue CodeGenerator), geschlossen für Änderung (Game bleibt unberührt)." />
            <GlossEntry term="record" def="Java-Konstrukt für unveränderliche Wertobjekte. Erzeugt Konstruktor, equals, hashCode, toString automatisch." />
            <GlossEntry term="Kompakter Konstruktor" def="Im record die Stelle, an der Invarianten (z. B. „genau 5 Farben“) geprüft werden." />
            <GlossEntry term="Unveränderlich / immutable" def="Ein Objekt, dessen Zustand nach Erzeugung nicht mehr geändert werden kann." />
            <GlossEntry term="Defensive Kopie" def="Eine eigene Kopie übergebener Daten (List.copyOf), damit Außenstehende das Objekt nicht heimlich ändern." />
            <GlossEntry term="Enum" def="Aufzählungstyp mit fester Anzahl Konstanten. Color hat genau 8 Werte mit Kürzel und Name." />
            <GlossEntry term="Lombok" def="Bibliothek, die Boilerplate (Getter, Konstruktoren) per Annotation erzeugt. Nur dort, wo record nicht passt." />
            <GlossEntry term="Exception / Ausnahme" def="Signal für einen Fehlerfall. InvalidGuessException meldet ungültige Eingaben, ohne das Programm abzustürzen." />
            <GlossEntry term="Schwarzer Stecker" def="Richtige Farbe an richtiger Position. 5 schwarze = gewonnen (isWinning)." />
            <GlossEntry term="Weißer Stecker" def="Richtige Farbe an falscher Position — gezählt aus den nach Phase 1 übrig gebliebenen Farben." />
            <GlossEntry term="O-Notation (Groß-O)" def="Beschreibt das Wachstum des Aufwands mit der Eingabegröße n. O(n²) = quadratisch; bei n=5 unkritisch." />
            <GlossEntry term="Lambda  () -> secret" def="Kurzschreibweise für eine Funktion. Im Test ersetzt sie RandomCodeGenerator durch einen festen Code." />
            <GlossEntry term="JUnit" def="Test-Framework. Prüft automatisch, ob Methoden das erwartete Ergebnis liefern (z. B. Feedback-Fälle)." />
            <GlossEntry term="Gradle / Wrapper" def="Bau-Werkzeug. Der Wrapper (gradlew) lädt die passende Gradle-Version selbst — kein manuelles Setup nötig." />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>
            Lern-Trainer · Projektarchitektur „Mastermind 5-8" — Konsolenanwendung, Java 25
          </span>
          <span style={{ color: C.dim, fontSize: 13 }}>Prof. Dr. Veronika Lesch · DHBW Mosbach</span>
        </div>
      </footer>
    </div>
  );
}

// Kleine Helfer-Komponenten & Inline-Style-Snippets
const codeInline = {
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 5,
  padding: "1px 6px",
  fontSize: 13,
  color: C.accent,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};
const codeBlock = {
  display: "block",
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 12.5,
  lineHeight: 1.6,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};

function LayerCard({ color, name, sub, children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <code style={{ fontSize: 15, fontWeight: 800, color }}>{name}</code>
          <span style={{ fontSize: 13, color: C.dim }}>{sub}</span>
        </div>
        <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{children}</div>
      </div>
    </div>
  );
}
