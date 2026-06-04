import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   FESTES DESIGN-SYSTEM (Dark Theme)
   Nur accent & accent2 thematisch angepasst:
   - accent  (Türkis)  steht für die äquivalente UMFORMUNG / das Vereinfachen
                       (der Ausdruck schrumpft, bleibt aber wertgleich).
   - accent2 (Indigo)  steht für die BOOLESCHEN GESETZE / Regeln,
                       mit denen umgeformt wird.
   ========================================================================= */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#2dd4bf",  // Türkis – äquivalente Umformung / Vereinfachung
  accent2: "#818cf8", // Indigo – Boolesche Gesetze / Regeln
  good: "#86efac",    // grün – Erfolg/Treffer
  warn: "#fca5a5",    // rot – Problem/Fehler
  gold: "#fcd34d",    // gelb – Highlight
};

/* @keyframes als Stylesheet-Konstante (self-contained, keine externen Libs) */
const KEYFRAMES = `
@keyframes pop { 0% { transform: scale(.82); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
`;

/* =========================================================================
   PFLICHT-BAUSTEINE (wiederverwendbar)
   ========================================================================= */

/* useReveal(): blendet Sections beim Scrollen sanft ein (IntersectionObserver) */
function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Section({ kicker, title, children }) {
  const [ref, vis] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        marginBottom: 64,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 2, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
        {kicker}
      </div>
      <h2 style={{ fontSize: 28, lineHeight: 1.2, margin: "0 0 20px", color: C.text }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: C.dim, marginRight: 16 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: `${C.accent2}1a`,           // accent2 leicht getönt
      border: `1px solid ${C.accent2}55`,
      borderRadius: 14, padding: "18px 20px", margin: "20px 0",
    }}>
      <div style={{ fontWeight: 800, color: C.accent2, marginBottom: 8 }}>💡 {title}</div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ color: C.accent, fontWeight: 800, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.5 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 12 }}>
      <div style={{ width: 5, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: C.text }}>{name}</span>
          <code style={{
            background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8,
            padding: "3px 10px", fontSize: 14, color: color, fontFamily: "ui-monospace, monospace",
          }}>{formula}</code>
        </div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

/* Button-Styles */
const btn = {
  background: C.accent, color: C.bg, border: "none", borderRadius: 10,
  padding: "9px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer",
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`,
  borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer",
};

/* Bar: Negationsstrich (Überstrich) über einer Variablen/Teilformel.
   Das ist die in Digitaltechnik übliche Schreibweise für NICHT (¬). */
const Bar = ({ children }) => (
  <span style={{ textDecoration: "overline", textDecorationThickness: "2px" }}>{children}</span>
);

/* usePlayer(): Auto-Play-Stepper mit setInterval + Pause/▶, Vor/Zurück, Reset */
function usePlayer(n, ms = 1500) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => { if (s >= n - 1) { setPlaying(false); return s; } return s + 1; });
    }, ms);
    return () => clearInterval(id);
  }, [playing, n, ms]);
  return {
    step, playing,
    toggle: () => { setPlaying((p) => { if (!p && step >= n - 1) setStep(0); return !p; }); },
    next: () => setStep((s) => Math.min(n - 1, s + 1)),
    prev: () => setStep((s) => Math.max(0, s - 1)),
    reset: () => { setPlaying(false); setStep(0); },
  };
}

/* Wiederverwendbare Steuerleiste für jede Visualisierung */
function PlayerControls({ p, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={p.toggle}>{p.playing ? "❚❚ Pause" : "▶ Abspielen"}</button>
      <button style={btnGhost} onClick={p.prev} disabled={p.step === 0}>◀ Schritt</button>
      <button style={btnGhost} onClick={p.next} disabled={p.step === total - 1}>Schritt ▶</button>
      <button style={btnGhost} onClick={p.reset}>↺ Reset</button>
      <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13, fontFamily: "ui-monospace, monospace" }}>
        Schritt {p.step + 1} / {total}
      </span>
    </div>
  );
}

/* =========================================================================
   VISUALISIERUNG 1 — Schritt-für-Schritt-Vereinfacher (Kernstück)
   Zeigt LIVE, wie ein Ausdruck mit Booleschen Gesetzen schrumpft.
   ========================================================================= */
const SIMP_STEPS = [
  {
    expr: <>A·<Bar>B</Bar> + A·B + <Bar>A</Bar>·B</>,
    law: "Ausgangsterm", color: C.dim,
    note: "Drei UND-Terme (· = UND), verbunden durch ODER (+). Drei UND- und zwei ODER-Gatter wären nötig.",
  },
  {
    expr: <>A·(<Bar>B</Bar> + B) + <Bar>A</Bar>·B</>,
    law: "Distributivgesetz", color: C.accent,
    note: "A wird aus den ersten beiden Termen ausgeklammert: A·B̄ + A·B = A·(B̄ + B). (Wie das Ausklammern in der normalen Mathematik.)",
  },
  {
    expr: <>A·1 + <Bar>A</Bar>·B</>,
    law: "Komplementgesetz", color: C.accent2,
    note: "Eine Variable ODER ihre Negation ergibt immer 1 (wahr): B̄ + B = 1. Egal welchen Wert B hat – einer von beiden ist wahr.",
  },
  {
    expr: <>A + <Bar>A</Bar>·B</>,
    law: "Identitätsgesetz", color: C.good,
    note: "UND mit 1 ändert nichts: A·1 = A. (1 ist das neutrale Element der UND-Verknüpfung.)",
  },
  {
    expr: <>A + B</>,
    law: "Redundanz-/Absorptionsregel", color: C.gold, final: true,
    note: "Die Regel x + x̄·y = x + y: Wenn A schon dabei ist, ist das Ā im zweiten Term überflüssig. Ergebnis: ein einziges ODER-Gatter.",
  },
];

function VisSimplifier() {
  const p = usePlayer(SIMP_STEPS.length, 1700);
  const s = SIMP_STEPS[p.step];
  return (
    <Card>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 12 }}>
        Ziel: <code style={{ color: C.text }}>F = A·B̄ + A·B + Ā·B</code> so weit wie möglich verkleinern.
      </div>

      {/* Große, animierte Ausdrucks-Box */}
      <div
        key={p.step} /* Key-Wechsel triggert die pop-Animation neu */
        style={{
          background: C.bg,
          border: `2px solid ${s.final ? C.good : C.gold}`,
          borderRadius: 14, padding: "26px 20px", textAlign: "center",
          fontSize: 30, fontFamily: "ui-monospace, monospace", color: C.text,
          letterSpacing: 1, animation: "pop .35s ease",
        }}
      >
        F&nbsp;=&nbsp;{s.expr}
      </div>

      {/* Angewandtes Gesetz + Erklärung */}
      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{
          background: `${s.color}22`, border: `1px solid ${s.color}`, color: s.color,
          borderRadius: 999, padding: "6px 14px", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap",
        }}>
          {p.step === 0 ? "Start" : `angewandt: ${s.law}`}
        </span>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{s.note}</div>
      </div>

      {/* Fortschritts-Punkte */}
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        {SIMP_STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 5, borderRadius: 3,
            background: i <= p.step ? C.accent : C.line, transition: "background .3s ease",
          }} />
        ))}
      </div>

      <PlayerControls p={p} total={SIMP_STEPS.length} />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.gold}>aktueller Ausdruck</Tag>
        <Tag color={C.accent}>Vereinfachung schreitet voran</Tag>
        <Tag color={C.good}>Endform erreicht</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VISUALISIERUNG 2 — Wahrheitstabellen-Äquivalenz-Check
   Beweist Zeile für Zeile, dass Ausgangsterm und Endform GLEICH sind.
   ========================================================================= */
function buildTruthRows() {
  const rows = [];
  for (let a = 0; a <= 1; a++) {
    for (let b = 0; b <= 1; b++) {
      const orig = (a & (b ^ 1)) | (a & b) | ((a ^ 1) & b); // A·B̄ + A·B + Ā·B
      const simp = a | b;                                   // A + B
      rows.push({ a, b, orig, simp, match: orig === simp });
    }
  }
  return rows;
}
const TRUTH_ROWS = buildTruthRows();

function VisTruthTable() {
  // Schritt 0 = nichts geprüft, Schritt k = Zeilen 0..k-1 geprüft, letzter Schritt = Fazit
  const p = usePlayer(TRUTH_ROWS.length + 1, 1100);
  const revealed = p.step; // Anzahl geprüfter Zeilen
  const allDone = revealed >= TRUTH_ROWS.length;
  const allMatch = TRUTH_ROWS.every((r) => r.match);

  const th = { padding: "10px 8px", textAlign: "center", fontSize: 13, color: C.dim, borderBottom: `1px solid ${C.line}` };
  const td = { padding: "10px 8px", textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 16 };

  return (
    <Card>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14 }}>
        Zwei Ausdrücke sind <b style={{ color: C.text }}>äquivalent</b> (wertgleich), wenn ihre Wahrheitstabellen
        in <i>jeder</i> Zeile übereinstimmen. Hier: Ausgangsterm vs. Endform <code style={{ color: C.text }}>A + B</code>.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>A</th>
              <th style={th}>B</th>
              <th style={{ ...th, color: C.accent }}>F (Ausgang)</th>
              <th style={{ ...th, color: C.gold }}>F = A+B</th>
              <th style={th}>=?</th>
            </tr>
          </thead>
          <tbody>
            {TRUTH_ROWS.map((r, i) => {
              const shown = i < revealed;
              const active = i === revealed - 1;
              return (
                <tr key={i} style={{
                  opacity: shown ? 1 : 0.18,
                  background: active ? `${C.gold}18` : "transparent",
                  transition: "opacity .3s ease, background .3s ease",
                }}>
                  <td style={{ ...td, color: C.text }}>{r.a}</td>
                  <td style={{ ...td, color: C.text }}>{r.b}</td>
                  <td style={{ ...td, color: C.accent }}>{shown ? r.orig : "·"}</td>
                  <td style={{ ...td, color: C.gold }}>{shown ? r.simp : "·"}</td>
                  <td style={{ ...td }}>
                    {shown
                      ? (r.match
                          ? <span style={{ color: C.good }} key={i}>✓</span>
                          : <span style={{ color: C.warn }}>✗</span>)
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fazit-Banner */}
      <div style={{
        marginTop: 16, borderRadius: 12, padding: "12px 16px",
        background: allDone ? (allMatch ? `${C.good}1a` : `${C.warn}1a`) : C.panel2,
        border: `1px solid ${allDone ? (allMatch ? C.good : C.warn) : C.line}`,
        color: allDone ? (allMatch ? C.good : C.warn) : C.dim,
        fontWeight: 700, fontSize: 14, transition: "all .3s ease",
      }}>
        {allDone
          ? (allMatch
              ? "✓ Alle 4 Zeilen identisch → die Vereinfachung war wertgleich (korrekt)."
              : "✗ Mindestens eine Zeile weicht ab → die Umformung wäre fehlerhaft.")
          : "Spiel ab, um jede Zeile einzeln zu prüfen …"}
      </div>

      <PlayerControls p={p} total={TRUTH_ROWS.length + 1} />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.gold}>gerade geprüfte Zeile</Tag>
        <Tag color={C.good}>Werte stimmen überein</Tag>
        <Tag color={C.warn}>Werte weichen ab</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VISUALISIERUNG 3 — De Morgan: Negation „hineinziehen"
   Animiert ‾(A·B)  →  Ā + B̄  in nachvollziehbaren Schritten.
   ========================================================================= */
const DEMORGAN_STEPS = [
  {
    render: (hl) => <><Bar>A·B</Bar></>,
    note: "Start: Negation über einer ganzen UND-Verknüpfung. ‾(A·B) bedeutet „NICHT (A UND B)“.",
    color: C.dim,
  },
  {
    render: () => <><Bar>A</Bar> <span style={{ color: C.gold, animation: "blink 1s infinite" }}>·</span> <Bar>B</Bar></>,
    note: "Regel 1 – Operator tauschen: Beim Hineinziehen der Negation wird aus dem UND (·) ein ODER (+). Der lange Negationsstrich zerfällt in zwei kurze über je einer Variablen.",
    color: C.accent2,
  },
  {
    render: () => <><Bar>A</Bar> <span style={{ color: C.gold }}>+</span> <Bar>B</Bar></>,
    note: "Regel 2 – jede Variable einzeln negiert: Ergebnis ist Ā + B̄. Das UND ist jetzt ein ODER, und jede Variable trägt ihren eigenen Negationsstrich.",
    color: C.good, final: true,
  },
];

function VisDeMorgan() {
  const p = usePlayer(DEMORGAN_STEPS.length, 1900);
  const s = DEMORGAN_STEPS[p.step];
  return (
    <Card>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 12 }}>
        Die <b style={{ color: C.text }}>De-Morgan-Gesetze</b> sind die wichtigste Regel, um Negationen
        umzuformen – ohne sie kommt man bei vielen Termen nicht weiter.
      </div>

      <div
        key={p.step}
        style={{
          background: C.bg, border: `2px solid ${s.final ? C.good : C.accent2}`,
          borderRadius: 14, padding: "30px 20px", textAlign: "center",
          fontSize: 34, fontFamily: "ui-monospace, monospace", color: C.text,
          letterSpacing: 2, animation: "pop .35s ease",
        }}
      >
        {s.render()}
      </div>

      <div style={{ marginTop: 16, color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{s.note}</div>

      <PlayerControls p={p} total={DEMORGAN_STEPS.length} />

      <InfoBox title="Merksatz">
        „Strich zerschneiden, Zeichen tauschen." Negierst du eine ganze Klammer, drehst du innen jeden Operator
        um (UND ↔ ODER) und negierst jede einzelne Variable. Das gilt in beide Richtungen, auch dual:
        <code style={{ color: C.text }}> ‾(A + B) = Ā · B̄</code>.
      </InfoBox>

      <div style={{ marginTop: 4 }}>
        <Tag color={C.accent2}>Operator wird getauscht</Tag>
        <Tag color={C.gold}>aktive Stelle</Tag>
        <Tag color={C.good}>Endform</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   HAUPT-KOMPONENTE
   ========================================================================= */
export default function BoolescheVereinfachung() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{KEYFRAMES}</style>

      {/* HERO / HEADER */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "64px 24px 24px" }}>
        <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 3, fontSize: 13, fontWeight: 800 }}>
          Digitaltechnik · Lern-Trainer
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "12px 0 16px" }}>
          Boolesche Algebra <span style={{ color: C.accent }}>vereinfachen</span>
        </h1>
        <p style={{ fontSize: 18, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
          Wie macht man aus einem riesigen logischen Ausdruck einen kleinen, der <i>genau dasselbe</i> tut?
          Hier lernst du die algebraische Vereinfachung Schritt für Schritt – mit allen Gesetzen,
          live vorgeführt und mathematisch nachgewiesen.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* 0 — DAS PROBLEM */}
        <Section kicker="0 · Das Problem" title="Warum überhaupt vereinfachen?">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Eine <b style={{ color: C.text }}>Boolesche Funktion</b> (eine logische Funktion, die nur die Werte
            0 = falsch und 1 = wahr kennt, benannt nach dem Mathematiker George Boole) beschreibt, wann eine
            digitale Schaltung „an" sein soll. Jeder Operator in so einem Ausdruck – jedes
            UND (· , logisches „und beide"), jedes ODER (+ , logisches „mindestens eines") und jede
            Negation (Überstrich, logisches „nicht") – wird in der Hardware durch ein echtes
            <b style={{ color: C.text }}> Logikgatter</b> (ein winziger Baustein aus Transistoren) realisiert.
          </p>
          <InfoBox title="Weniger Operatoren = weniger Hardware">
            Jedes eingesparte Gatter bedeutet weniger Chipfläche, weniger Stromverbrauch, weniger Verzögerung
            und weniger Kosten. Aus <code style={{ color: C.text }}>A·B̄ + A·B + Ā·B</code> (3 UND-, 2 ODER-Gatter,
            2 Negationen) wird durch Vereinfachung das pure <code style={{ color: C.text }}>A + B</code> –
            ein einziges ODER-Gatter. Das ist der ganze Sinn der Übung.
          </InfoBox>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            „Vereinfachen" heißt also: den Ausdruck in eine <b style={{ color: C.text }}>äquivalente</b> (wertgleiche)
            Form mit möglichst wenig Operatoren bringen. Wertgleich bedeutet: Für jede mögliche Belegung der
            Eingänge liefert die neue Form exakt dasselbe Ergebnis wie die alte.
          </p>
        </Section>

        {/* 1 — DIE KERNIDEE */}
        <Section kicker="1 · Die Kernidee" title="Umformen mit Gesetzen – wie Algebra, nur mit 0 und 1">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Genau wie du in der normalen Algebra <code style={{ color: C.text }}>2x + 3x</code> zu
            <code style={{ color: C.text }}> 5x</code> zusammenfasst, gibt es feste
            <b style={{ color: C.text }}> Boolesche Gesetze</b>, mit denen du logische Ausdrücke umstellst,
            ohne ihren Wert zu verändern. Jeder Umformungsschritt ersetzt einen Teil des Ausdrucks durch einen
            <i>beweisbar gleichwertigen</i> Teil. Reihst du solche Schritte aneinander, schrumpft der Ausdruck.
          </p>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Schau dir das einmal live an – jeder Schritt zeigt, <i>welches</i> Gesetz angewendet wurde:
          </p>
          <VisSimplifier />
        </Section>

        {/* 2 — DAS ZENTRALE PROBLEM */}
        <Section kicker="2 · Der schwierige Teil" title="Es gibt keinen festen Weg – das ist die Crux">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Anders als beim Bruchrechnen gibt es bei der algebraischen Vereinfachung
            <b style={{ color: C.text }}> kein Kochrezept</b>. In jedem Schritt könntest du mehrere Gesetze anwenden –
            welches dich näher ans Ziel bringt, ist <i>nicht</i> vorgeschrieben. Du musst das passende Gesetz
            <b style={{ color: C.text }}> erkennen</b>.
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 800, marginBottom: 6 }}>⚠ Sackgassen</div>
              <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>
                Man kann sich „verrennen": Eine Umformung sieht kurzfristig schlauer aus, macht den Term aber
                später länger. Es gibt keine Garantie, dass dein Weg zur kleinstmöglichen Form führt.
              </div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.gold, fontWeight: 800, marginBottom: 6 }}>★ Mustererkennung</div>
              <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>
                Der Trick ist, typische Muster zu sehen: „Hier kann ich ausklammern", „das ist Absorption",
                „hier passt De Morgan". Genau das übst du mit den Gesetzen unten.
              </div>
            </Card>
          </div>
        </Section>

        {/* 3 — DIE GESETZE (MethodRow) */}
        <Section kicker="3 · Die Werkzeuge" title="Alle Booleschen Gesetze auf einen Blick">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
            Das sind die Regeln, mit denen jede Vereinfachung arbeitet. <b style={{ color: C.text }}>Dual</b> bedeutet:
            Tauscht man im Gesetz UND ↔ ODER und 0 ↔ 1, erhält man wieder ein gültiges Gesetz – die meisten treten
            deshalb paarweise auf.
          </p>
          <MethodRow color={C.accent}  name="Kommutativgesetz"  formula="A·B = B·A ;  A+B = B+A"
            note="Reihenfolge egal – wie bei Plus und Mal." />
          <MethodRow color={C.accent}  name="Assoziativgesetz"  formula="(A·B)·C = A·(B·C)"
            note="Klammern bei gleichem Operator beliebig setzbar." />
          <MethodRow color={C.accent2} name="Distributivgesetz" formula="A·(B+C) = A·B + A·C"
            note="Ausmultiplizieren / Ausklammern – der wichtigste Hebel zum Zusammenfassen." />
          <MethodRow color={C.good}    name="Identität (Neutrales Element)" formula="A·1 = A ;  A+0 = A"
            note="UND mit 1 bzw. ODER mit 0 ändert nichts." />
          <MethodRow color={C.good}    name="Extremalgesetz (Dominanz)" formula="A·0 = 0 ;  A+1 = 1"
            note="Eine 0 im UND erzwingt 0, eine 1 im ODER erzwingt 1 – egal was A ist." />
          <MethodRow color={C.gold}    name="Idempotenz"        formula="A·A = A ;  A+A = A"
            note="Dasselbe doppelt bringt nichts Neues – Wiederholungen streichen." />
          <MethodRow color={C.gold}    name="Komplement"        formula="A·Ā = 0 ;  A+Ā = 1"
            note="Etwas UND sein Gegenteil ist nie wahr; ODER sein Gegenteil ist immer wahr." />
          <MethodRow color={C.warn}    name="Doppelnegation"    formula="‾(Ā) = A"
            note="Zweimal „nicht“ hebt sich auf." />
          <MethodRow color={C.accent2} name="De Morgan"         formula="‾(A·B) = Ā+B̄ ;  ‾(A+B) = Ā·B̄"
            note="Negation einer Klammer: Operator tauschen, jede Variable negieren." />
          <MethodRow color={C.accent}  name="Absorption"        formula="A + A·B = A ;  A·(A+B) = A"
            note="Der größere Term „schluckt“ den kleineren – ganze Terme fallen weg." />
          <MethodRow color={C.accent}  name="Redundanz (vereinf. Absorption)" formula="A + Ā·B = A + B"
            note="Steht A schon allein da, ist das Ā im Nachbarterm überflüssig." />
        </Section>

        {/* 4 — SONDERFALL: DE MORGAN */}
        <Section kicker="4 · Detail" title="Der Knackpunkt: De Morgan in Aktion">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Bei keinem Gesetz machen Anfänger so oft Fehler wie bei De Morgan – etwa, wenn der Operator
            <i> nicht</i> getauscht oder eine Variable vergessen wird. Deshalb hier Schritt für Schritt,
            wie eine negierte Klammer korrekt aufgelöst wird:
          </p>
          <VisDeMorgan />
        </Section>

        {/* 5 — ANALYSE / KORREKTHEIT */}
        <Section kicker="5 · Analyse" title="Ist das wirklich korrekt – und ist es das Minimum?">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            <b style={{ color: C.text }}>Korrektheit</b> lässt sich immer hart nachweisen: Zwei Ausdrücke sind genau
            dann äquivalent, wenn ihre <b style={{ color: C.text }}>Wahrheitstabellen</b> (die Auflistung des Ergebnisses
            für jede der <code style={{ color: C.text }}>2ⁿ</code> Eingangskombinationen, n = Anzahl der Variablen)
            Zeile für Zeile übereinstimmen. Prüf es selbst:
          </p>
          <VisTruthTable />

          <InfoBox title="O-Notation: Warum es kein einfaches Allgemein­verfahren gibt">
            Die <b>O-Notation</b> beschreibt, wie der Aufwand mit der Eingabegröße wächst (z. B. <code>O(n)</code> =
            linear, <code>O(2ⁿ)</code> = exponentiell). Eine vollständige Wahrheitstabelle hat
            <code> 2ⁿ</code> Zeilen – bei 10 Variablen schon 1024, bei 30 über eine Milliarde. Zu prüfen, ob ein
            beliebiger Boolescher Ausdruck minimal bzw. ob er äquivalent zu einem anderen ist, gehört zur Klasse der
            <b> co-NP-vollständigen</b> Probleme: Es ist <i>kein</i> allgemeines Verfahren bekannt, das das immer in
            polynomieller (also „schneller") Zeit schafft. Deshalb bleibt algebraisches Vereinfachen für große
            Funktionen ein Stück Handarbeit und Erfahrung.
          </InfoBox>

          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            <b style={{ color: C.text }}>Minimalität</b> garantiert das algebraische Vorgehen also nicht: Dein Ergebnis
            ist korrekt, aber vielleicht nicht die absolut kleinste Form. Wer das systematisch und nachweisbar minimal
            will, greift zu Verfahren mit festem Ablauf:
          </p>
          <MethodRow color={C.accent2} name="KV-Diagramm (Karnaugh-Veitch)" formula="grafisch, ≤ 4–6 Variablen"
            note="Eine Tabelle, in der man benachbarte Einsen zu Blöcken zusammenfasst – schnell und anschaulich, aber bei vielen Variablen unhandlich. (Hier nicht das Thema, aber dein nächster Lernschritt.)" />
          <MethodRow color={C.accent2} name="Quine-McCluskey" formula="tabellarisch, beliebig viele Variablen"
            note="Ein vollständig mechanisches Verfahren, das das garantierte Minimum findet – aber mit exponentiellem Aufwand. Gut für den Computer, mühsam von Hand." />
        </Section>

        {/* 6 — ZUSAMMENFASSUNG */}
        <Section kicker="6 · Auf einen Blick" title="Das Wichtigste zusammengefasst">
          <Card style={{ background: `${C.accent}14`, border: `1px solid ${C.accent}55` }}>
            <ul style={{ margin: 0, paddingLeft: 22, color: C.text, fontSize: 16, lineHeight: 2 }}>
              <li><b>Ziel:</b> wertgleiche Form mit möglichst wenig Operatoren → weniger Gatter, weniger Kosten.</li>
              <li><b>Mittel:</b> Boolesche Gesetze – Ausklammern (Distributiv), Streichen (Komplement, Idempotenz, Absorption), Negieren (De Morgan).</li>
              <li><b>Schwierigkeit:</b> kein fester Weg – das passende Gesetz muss man <i>erkennen</i>.</li>
              <li><b>Korrektheit:</b> per Wahrheitstabelle beweisbar (Zeile für Zeile gleich).</li>
              <li><b>Grenze:</b> Minimum nicht garantiert → dafür KV-Diagramm oder Quine-McCluskey.</li>
            </ul>
            <div style={{ marginTop: 16, fontSize: 17, color: C.accent, fontWeight: 800 }}>
              Kernaussage: Vereinfachen = wiederholtes, wertgleiches Ersetzen, bis nichts Überflüssiges mehr übrig ist.
            </div>
          </Card>
        </Section>

        {/* 7 — GLOSSAR */}
        <Section kicker="7 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            <GlossEntry term="·  (UND / AND)" def="Logische Konjunktion: 1 nur, wenn beide Eingänge 1 sind. Oft auch ohne Zeichen geschrieben (AB)." />
            <GlossEntry term="+  (ODER / OR)" def="Logische Disjunktion: 1, sobald mindestens ein Eingang 1 ist." />
            <GlossEntry term="‾A  (NICHT / NOT)" def="Negation: dreht den Wert um (aus 0 wird 1 und umgekehrt). Geschrieben als Überstrich oder ¬A." />
            <GlossEntry term="0 / 1" def="Die einzigen zwei Werte der Booleschen Algebra: 0 = falsch, 1 = wahr." />
            <GlossEntry term="Boolesche Funktion" def="Funktion, die Eingänge (0/1) auf einen Ausgang (0/1) abbildet – beschreibt eine logische Schaltung." />
            <GlossEntry term="Äquivalent" def="Wertgleich: zwei Ausdrücke liefern für jede Eingangsbelegung dasselbe Ergebnis." />
            <GlossEntry term="Wahrheitstabelle" def="Tabelle aller 2ⁿ Eingangskombinationen mit dem jeweiligen Ergebnis." />
            <GlossEntry term="Logikgatter" def="Hardware-Baustein, der einen Operator (UND, ODER, NICHT …) physisch umsetzt." />
            <GlossEntry term="Term" def="Ein durch UND verbundener Teilausdruck, z. B. A·B̄, der im ODER mit anderen steht." />
            <GlossEntry term="Distributivgesetz" def="A·(B+C)=A·B+A·C – erlaubt Aus- und Einklammern." />
            <GlossEntry term="Komplementgesetz" def="A·Ā=0 und A+Ā=1 – Variable und ihr Gegenteil." />
            <GlossEntry term="Identität" def="Neutrales Element: A·1=A, A+0=A." />
            <GlossEntry term="Absorption" def="A+A·B=A – ein Term schluckt einen darin enthaltenen." />
            <GlossEntry term="De Morgan" def="‾(A·B)=Ā+B̄ und ‾(A+B)=Ā·B̄ – Negation einer Klammer auflösen." />
            <GlossEntry term="Dual" def="Gesetz, das durch Tausch UND↔ODER und 0↔1 entsteht und ebenfalls gilt." />
            <GlossEntry term="O-Notation" def="Maß für das Wachstum des Aufwands abhängig von der Eingabegröße (z. B. O(2ⁿ))." />
            <GlossEntry term="KV-Diagramm" def="Karnaugh-Veitch: grafisches Minimierungsverfahren für wenige Variablen." />
            <GlossEntry term="Quine-McCluskey" def="Tabellarisches Verfahren, das garantiert die minimale Form findet." />
          </div>
        </Section>

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.7 }}>
          Lern-Trainer · Digitaltechnik – Vereinfachung Boolescher Algebra<br />
          Kapitelbezug: Boolesche Algebra & Schaltnetzminimierung · Prof. Scherzer · DHBW Bad Mergentheim
        </div>
      </footer>
    </div>
  );
}
