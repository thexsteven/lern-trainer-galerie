import React, { useState, useEffect, useRef } from "react";

/*
  Lern-Trainer: „Den Spielablauf verstehen" — Mastermind 5-8
  ----------------------------------------------------------
  Ein interaktiver Trainer, der dir das Spiel beibringt, indem du es spielst.
  Die Spiellogik ist 1:1 die des Java-Projekts:
    - 8 Farben, 5 Positionen, Duplikate erlaubt, max. 10 Versuche
    - Feedback wird zweistufig berechnet (erst schwarze, dann weiße Stecker)
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
  accent: "#7dd3fc", // cyan  – steht für DEIN ZUG / Eingabe / Aktion
  accent2: "#a78bfa", // violett – steht für FEEDBACK / Erkenntnis / Strategie
  good: "#86efac", // grün  – Treffer/Gewinn
  warn: "#fca5a5", // rot   – Fehler/Niederlage
  gold: "#fcd34d", // gelb  – Highlight
};

// ---------------------------------------------------------------------------
// Spielregeln & Farbpalette — exakt wie im Java-Enum Color + GameRules
// ---------------------------------------------------------------------------
const CODE_LENGTH = 5;
const MAX_ATTEMPTS = 10;

const COLORS = [
  { key: "R", name: "Rot", col: "#f87171" },
  { key: "G", name: "Gruen", col: "#4ade80" },
  { key: "B", name: "Blau", col: "#60a5fa" },
  { key: "Y", name: "Gelb", col: "#fbbf24" },
  { key: "O", name: "Orange", col: "#fb923c" },
  { key: "P", name: "Purpur", col: "#a78bfa" },
  { key: "W", name: "Weiss", col: "#e5e7eb" },
  { key: "K", name: "Schwarz", col: "#334155" },
];
const COL_OF = Object.fromEntries(COLORS.map((c) => [c.key, c.col]));
const NAME_OF = Object.fromEntries(COLORS.map((c) => [c.key, c.name]));

// Zufälliger Geheimcode (wie RandomCodeGenerator.generate())
function randomSecret() {
  const out = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    out.push(COLORS[Math.floor(Math.random() * COLORS.length)].key);
  }
  return out;
}

// Zweistufige Feedback-Berechnung — identisch zu FeedbackCalculator.calculate()
function calcFeedback(secret, guess) {
  let black = 0;
  const restSecret = [];
  const restGuess = [];
  // Phase 1: positionsgenaue Treffer (schwarze Stecker)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secret[i] === guess[i]) {
      black++;
    } else {
      restSecret.push(secret[i]);
      restGuess.push(guess[i]);
    }
  }
  // Phase 2: farbgleiche Treffer an falscher Position (weiße Stecker)
  let white = 0;
  const pool = [...restSecret];
  for (const g of restGuess) {
    const idx = pool.indexOf(g);
    if (idx !== -1) {
      white++;
      pool.splice(idx, 1);
    }
  }
  return { black, white };
}

// Teaching-Text: erklärt, was ein Feedback bedeutet
function interpret(black, white) {
  const none = CODE_LENGTH - black - white;
  if (black === CODE_LENGTH) return "🎉 Perfekt — alle 5 sitzen richtig. Code geknackt!";
  if (black + white === 0) return "Keine einzige dieser Farben steckt im Code. Probier ganz andere Farben aus.";
  if (black + white === CODE_LENGTH)
    return "Stark! Alle fünf Farben sind die richtigen — nur die Reihenfolge stimmt noch nicht überall. Jetzt nur noch sortieren.";
  return `${black} sitzen am richtigen Platz, ${white} sind richtige Farben am falschen Platz, ${none} kommen im Code gar nicht (so) vor.`;
}

// ---------------------------------------------------------------------------
// Keyframes / Animationen
// ---------------------------------------------------------------------------
const STYLE = `
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes drop { 0%{transform:translateY(-10px);opacity:0} 100%{transform:translateY(0);opacity:1} }
@keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(252,211,77,0)} 50%{box-shadow:0 0 0 4px rgba(252,211,77,.25)} }
.pop { animation: pop .3s ease-out both; }
.drop { animation: drop .35s ease-out both; }
*::selection { background: ${C.accent}; color:#06121a; }
html { scroll-behavior:smooth; }
`;

// ---------------------------------------------------------------------------
// useReveal — sanftes Einblenden beim Scrollen
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(true)),
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
      <div style={{ color: C.accent, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
        {kicker}
      </div>
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

const btn = { background: C.accent, color: "#06121a", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };

// ---------------------------------------------------------------------------
// Bausteine für das Spielbrett
// ---------------------------------------------------------------------------

// Ein farbiger Spielstein (Code-Position)
function Disc({ ch, size = 38, faded, ring, hidden, onClick, title }) {
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: size * 0.4,
    cursor: onClick ? "pointer" : "default",
    transition: "all .25s",
    boxSizing: "border-box",
    flexShrink: 0,
  };
  if (hidden) {
    return (
      <div onClick={onClick} title={title} style={{ ...base, background: C.panel2, border: `2px dashed ${C.line}`, color: C.dim }}>
        ?
      </div>
    );
  }
  if (!ch) {
    return (
      <div onClick={onClick} title={title || "leeres Feld"} style={{ ...base, background: "transparent", border: `2px dashed ${C.line}`, color: C.dim }} />
    );
  }
  const c = COL_OF[ch];
  return (
    <div
      onClick={onClick}
      title={title || NAME_OF[ch]}
      style={{
        ...base,
        background: c,
        color: ch === "W" ? "#1b2030" : "#0b1016",
        border: ring ? `3px solid ${C.gold}` : `2px solid rgba(0,0,0,0.35)`,
        opacity: faded ? 0.4 : 1,
      }}
    >
      {ch}
    </div>
  );
}

// Feedback-Stecker (schwarz/weiß) als kompaktes 5er-Raster
function FeedbackPegs({ black, white }) {
  const pegs = [];
  for (let i = 0; i < black; i++) pegs.push("b");
  for (let i = 0; i < white; i++) pegs.push("w");
  while (pegs.length < CODE_LENGTH) pegs.push("e");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 12px)", gap: 4 }}>
      {pegs.map((p, i) => (
        <span
          key={i}
          className={p !== "e" ? "pop" : ""}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: p === "b" ? "#0b0e14" : p === "w" ? "#f8fafc" : "transparent",
            border: p === "e" ? `1px solid ${C.line}` : p === "b" ? `2px solid ${C.good}` : `1px solid ${C.dim}`,
          }}
          title={p === "b" ? "schwarz: richtig + richtige Position" : p === "w" ? "weiß: richtige Farbe, falsche Position" : "leer"}
        />
      ))}
    </div>
  );
}

// Eine Zeile im Spielverlauf
function HistoryRow({ n, guess, black, white }) {
  return (
    <div className="drop" style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ width: 22, color: C.dim, fontSize: 12.5, textAlign: "right" }}>{n}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {guess.map((ch, i) => (
          <Disc key={i} ch={ch} size={30} />
        ))}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <FeedbackPegs black={black} white={white} />
        <span style={{ fontSize: 12.5, color: C.dim, minWidth: 92 }}>
          {black} schwarz · {white} weiß
        </span>
      </div>
    </div>
  );
}

// ===========================================================================
// SPIELBRETT — voll spielbar
// ===========================================================================
function PlayableGame() {
  const [secret, setSecret] = useState(randomSecret);
  const [guess, setGuess] = useState(Array(CODE_LENGTH).fill(null));
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [reveal, setReveal] = useState(false);
  const [hint, setHint] = useState("Wähle 5 Farben und drück „Raten“. Du hast 10 Versuche.");

  function newGame() {
    setSecret(randomSecret());
    setGuess(Array(CODE_LENGTH).fill(null));
    setHistory([]);
    setStatus("playing");
    setReveal(false);
    setHint("Neue Runde, neuer Geheimcode. Viel Erfolg!");
  }

  function pick(key) {
    if (status !== "playing") return;
    setGuess((g) => {
      const ni = g.indexOf(null);
      if (ni === -1) return g; // voll
      const n = [...g];
      n[ni] = key;
      return n;
    });
  }

  function clearSlot(i) {
    if (status !== "playing") return;
    setGuess((g) => {
      const n = [...g];
      n[i] = null;
      return n;
    });
  }

  function submit() {
    if (status !== "playing") return;
    if (guess.includes(null)) {
      setHint("Bitte erst alle 5 Felder füllen — sonst ist es kein gültiger Tipp.");
      return;
    }
    const fb = calcFeedback(secret, guess);
    const row = { guess: [...guess], black: fb.black, white: fb.white };
    const nextHistory = [...history, row];
    setHistory(nextHistory);
    setGuess(Array(CODE_LENGTH).fill(null));

    if (fb.black === CODE_LENGTH) {
      setStatus("won");
      setReveal(true);
      setHint(`🎉 Gewonnen in ${nextHistory.length} Versuch(en)!`);
    } else if (nextHistory.length >= MAX_ATTEMPTS) {
      setStatus("lost");
      setReveal(true);
      setHint("Leider verloren — alle 10 Versuche aufgebraucht. Der Code wird jetzt aufgedeckt.");
    } else {
      setHint(interpret(fb.black, fb.white));
    }
  }

  const attemptNo = history.length + 1;
  const filled = guess.filter((x) => x !== null).length;

  return (
    <Card>
      {/* Kopf: Geheimcode + Status */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: C.dim }}>Geheimcode:</span>
          <div style={{ display: "flex", gap: 6 }}>
            {secret.map((ch, i) => (
              <Disc key={i} ch={ch} size={30} hidden={!reveal} />
            ))}
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.dim, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={reveal} disabled={status !== "playing"} onChange={(e) => setReveal(e.target.checked)} />
          Lehrmodus (Code zeigen)
        </label>
      </div>

      {/* Verlauf */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "flex", padding: "8px 12px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.dim, borderBottom: `1px solid ${C.line}` }}>
          <span style={{ width: 22, textAlign: "right" }}>#</span>
          <span style={{ marginLeft: 14 }}>Dein Tipp</span>
          <span style={{ marginLeft: "auto" }}>Feedback</span>
        </div>
        {history.length === 0 && <div style={{ padding: "18px 12px", color: C.dim, fontSize: 13, fontStyle: "italic" }}>Noch keine Versuche.</div>}
        {history.map((r, i) => (
          <HistoryRow key={i} n={i + 1} guess={r.guess} black={r.black} white={r.white} />
        ))}
        {/* freie Plätze andeuten */}
        {status === "playing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", background: "rgba(125,211,252,0.05)" }}>
            <span style={{ width: 22, color: C.accent, fontSize: 12.5, textAlign: "right", fontWeight: 700 }}>{attemptNo}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {guess.map((ch, i) => (
                <Disc key={i} ch={ch} size={30} ring={i === guess.indexOf(null)} onClick={() => clearSlot(i)} title={ch ? "klick zum Entfernen" : "nächstes Feld"} />
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, color: C.dim }}>
              Versuch {attemptNo} / {MAX_ATTEMPTS}
            </span>
          </div>
        )}
      </div>

      {/* Hinweis-Banner */}
      <div
        key={hint}
        className="pop"
        style={{
          background: status === "won" ? "rgba(134,239,172,.1)" : status === "lost" ? "rgba(252,165,165,.1)" : C.panel2,
          border: `1px solid ${status === "won" ? C.good : status === "lost" ? C.warn : C.line}`,
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 14,
          color: C.text,
          lineHeight: 1.55,
          marginBottom: 16,
          minHeight: 20,
        }}
      >
        {status === "lost" ? (
          <>
            {hint} Der Code war:{" "}
            <span style={{ display: "inline-flex", gap: 4, verticalAlign: "middle", marginLeft: 4 }}>
              {secret.map((ch, i) => (
                <Disc key={i} ch={ch} size={22} />
              ))}
            </span>
          </>
        ) : (
          hint
        )}
      </div>

      {/* Palette */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 8 }}>Farb-Palette — anklicken füllt das nächste freie Feld ({filled}/5 gesetzt):</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => pick(c.key)}
              disabled={status !== "playing" || filled >= CODE_LENGTH}
              title={c.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: C.panel2,
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                padding: "6px 10px 6px 6px",
                cursor: status === "playing" && filled < CODE_LENGTH ? "pointer" : "not-allowed",
                opacity: status === "playing" && filled < CODE_LENGTH ? 1 : 0.5,
              }}
            >
              <Disc ch={c.key} size={26} />
              <span style={{ fontSize: 12.5, color: C.text }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aktionen */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button style={{ ...btn, opacity: status === "playing" ? 1 : 0.5 }} onClick={submit} disabled={status !== "playing"}>
          ✓ Raten
        </button>
        <button style={btnGhost} onClick={() => setGuess(Array(CODE_LENGTH).fill(null))} disabled={status !== "playing"}>
          ↺ Tipp leeren
        </button>
        <button style={btnGhost} onClick={newGame}>
          ⟳ Neue Runde
        </button>
      </div>

      {/* Legende */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap" }}>
        <Tag color="#0b0e14">schwarz = richtig + richtiger Platz</Tag>
        <Tag color="#f8fafc">weiß = richtige Farbe, falscher Platz</Tag>
        <Tag color={C.gold}>nächstes Feld</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// GEFÜHRTE DEMO — eine komplette Runde mit Erklärung, Schritt für Schritt
// Geheimcode fest (R G B Y O), damit die Erklärung nachvollziehbar bleibt.
// ===========================================================================
const DEMO_SECRET = ["R", "G", "B", "Y", "O"];
const DEMO_GUESSES = [
  {
    g: ["R", "G", "O", "B", "Y"],
    why: "Erster Tipp ins Blaue: fünf verschiedene Farben. Wir wollen sehen, welche überhaupt im Code stecken.",
    read: "2 schwarz, 3 weiß — Summe ist 5! Das heißt: Alle fünf Farben sind die richtigen. Nur drei stehen am falschen Platz. Ab jetzt geht es nur noch um die Reihenfolge.",
  },
  {
    g: ["R", "G", "B", "O", "Y"],
    why: "Wir lassen die zwei sicheren Treffer (Rot, Grün vorne) stehen und tauschen hinten die Reihenfolge durch.",
    read: "3 schwarz, 2 weiß — ein Treffer mehr! Rot, Grün, Blau sitzen jetzt. Die letzten beiden (O und Y) sind richtig dabei, aber noch vertauscht.",
  },
  {
    g: ["R", "G", "B", "Y", "O"],
    why: "Also drehen wir nur noch die letzten beiden Positionen um: Y und O tauschen.",
    read: "5 schwarz — gewonnen! 🎉 In drei Versuchen geknackt, allein durch Lesen des Feedbacks.",
  },
];

function DemoPlayer() {
  // Schrittfolge: pro Tipp 2 Phasen (a = Tipp gelegt/„warum", b = Feedback/„read")
  const steps = [];
  steps.push({ kind: "intro" });
  DEMO_GUESSES.forEach((d, i) => {
    const fb = calcFeedback(DEMO_SECRET, d.g);
    steps.push({ kind: "guess", i, ...d, fb });
    steps.push({ kind: "feedback", i, ...d, fb });
  });
  steps.push({ kind: "done" });

  const [s, setS] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setS((p) => {
        if (p >= steps.length - 1) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 2200);
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const step = steps[s];
  // Wie viele Tipps sind aktuell „abgeschlossen" (Feedback sichtbar)?
  const shownRows = steps.slice(0, s + 1).filter((x) => x.kind === "feedback");
  const pendingGuess = step.kind === "guess" ? step : null;

  let narration = "Drück ▶ — wir spielen eine ganze Runde durch und lesen jedes Feedback gemeinsam.";
  if (step.kind === "guess") narration = step.why;
  else if (step.kind === "feedback") narration = step.read;
  else if (step.kind === "done") narration = "Das ist der ganze Trick: nicht raten, sondern aus jedem Feedback die nächste Schlussfolgerung ziehen.";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: C.dim }}>Geheimcode (im Lehrmodus sichtbar):</span>
          <div style={{ display: "flex", gap: 6 }}>
            {DEMO_SECRET.map((ch, i) => (
              <Disc key={i} ch={ch} size={28} />
            ))}
          </div>
        </div>
      </div>

      {/* Verlaufstabelle der Demo */}
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
        {shownRows.length === 0 && !pendingGuess && (
          <div style={{ padding: "18px 12px", color: C.dim, fontSize: 13, fontStyle: "italic" }}>Gleich geht's los …</div>
        )}
        {shownRows.map((r, i) => (
          <HistoryRow key={i} n={i + 1} guess={r.g} black={r.fb.black} white={r.fb.white} />
        ))}
        {pendingGuess && (
          <div className="drop" style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 12px", background: "rgba(125,211,252,0.06)" }}>
            <span style={{ width: 22, color: C.accent, fontSize: 12.5, textAlign: "right", fontWeight: 700 }}>{pendingGuess.i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              {pendingGuess.g.map((ch, i) => (
                <Disc key={i} ch={ch} size={30} ring />
              ))}
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, color: C.dim }}>Tipp gelegt — wartet auf Feedback …</span>
          </div>
        )}
      </div>

      {/* Narration */}
      <div
        key={s}
        className="pop"
        style={{
          background: step.kind === "done" ? "rgba(134,239,172,.1)" : C.panel2,
          border: `1px solid ${step.kind === "done" ? C.good : step.kind === "feedback" ? C.accent2 : C.line}`,
          borderRadius: 12,
          padding: "14px 16px",
          fontSize: 14.5,
          color: C.text,
          lineHeight: 1.6,
          minHeight: 30,
        }}
      >
        {step.kind === "feedback" && (
          <span style={{ fontWeight: 700, color: C.accent2, marginRight: 6 }}>
            {step.fb.black} schwarz, {step.fb.white} weiß →
          </span>
        )}
        {narration}
      </div>

      {/* Steuerung */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
        <button style={btn} onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Pause" : "▶ Runde abspielen"}
        </button>
        <button style={{ ...btnGhost, opacity: s === 0 ? 0.4 : 1 }} onClick={() => setS((v) => Math.max(0, v - 1))} disabled={s === 0}>
          ◀ Schritt
        </button>
        <button style={{ ...btnGhost, opacity: s >= steps.length - 1 ? 0.4 : 1 }} onClick={() => setS((v) => Math.min(steps.length - 1, v + 1))} disabled={s >= steps.length - 1}>
          Schritt ▶
        </button>
        <button style={btnGhost} onClick={() => { setS(0); setPlaying(false); }}>
          ↺ Reset
        </button>
        <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>
          Schritt {s + 1} / {steps.length}
        </span>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.accent}>dein Zug</Tag>
        <Tag color={C.accent2}>Feedback lesen</Tag>
        <Tag color={C.good}>Ziel erreicht</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
export default function SpielablaufTrainer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent2 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>Lern-Trainer · Spielablauf</span>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
            Mastermind <span style={{ color: C.accent }}>spielen</span> &amp; dabei die <span style={{ color: C.accent2 }}>Logik</span> verstehen
          </h1>
          <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
            Du knackst einen geheimen 5-Farben-Code in höchstens 10 Versuchen. Nach jedem Tipp bekommst du schwarze und weiße Stecker als
            Hinweis. Hier lernst du, <b style={{ color: C.text }}>wie man diese Hinweise liest</b> — indem du selbst spielst und eine geführte
            Runde mitverfolgst. Die Logik ist exakt die des Java-Programms.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#spielen" style={{ ...btn, textDecoration: "none" }}>▶ Jetzt selbst spielen</a>
            <a href="#demo" style={{ ...btnGhost, textDecoration: "none" }}>Geführte Runde ansehen</a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 56 }} />

        {/* 0. Das Ziel */}
        <Section kicker="0 · Das Ziel" title="Worum geht es überhaupt?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Der Computer würfelt einen <b style={{ color: C.text }}>geheimen Code</b> aus genau <b>5 Positionen</b>. Auf jede Position
            kommt eine von <b>8 Farben</b> — und Farben dürfen sich <b style={{ color: C.text }}>wiederholen</b> (z. B. zweimal Rot).
            Deine Aufgabe: diesen Code erraten, bevor deine <b>10 Versuche</b> aufgebraucht sind.
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginTop: 8 }}>
            <Card style={{ background: C.panel2, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.accent }}>5</div>
              <div style={{ fontSize: 13, color: C.dim }}>Positionen im Code</div>
            </Card>
            <Card style={{ background: C.panel2, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.accent2 }}>8</div>
              <div style={{ fontSize: 13, color: C.dim }}>Farben zur Auswahl</div>
            </Card>
            <Card style={{ background: C.panel2, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.gold }}>10</div>
              <div style={{ fontSize: 13, color: C.dim }}>Versuche maximal</div>
            </Card>
          </div>
          <InfoBox title="Wie viele Codes gibt es?">
            8 Farben auf 5 Positionen, jede unabhängig: 8 × 8 × 8 × 8 × 8 = 8⁵ = <b>32 768</b> mögliche Codes. Stures Durchprobieren
            würde Jahre dauern — deshalb spielst du <b>mit Köpfchen</b> statt mit Glück. Genau das übt dieser Trainer.
          </InfoBox>
        </Section>

        {/* 1. Die Farben */}
        <Section kicker="1 · Die Spielsteine" title="Die acht Farben und ihre Kürzel">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 16 }}>
            Jede Farbe hat ein Buchstaben-Kürzel — genau so, wie das Java-Programm sie auf der Konsole anzeigt und einliest.
          </p>
          <Card>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {COLORS.map((c) => (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Disc ch={c.key} size={34} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: C.dim }}>Kürzel: {c.key}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 2. Das Feedback */}
        <Section kicker="2 · Die Sprache des Spiels" title="Schwarze und weiße Stecker lesen">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Nach jedem Tipp antwortet das Spiel nicht mit „heiß/kalt", sondern mit zwei Zahlen — den <b>Steckern</b>. Sie sind dein
            einziger Informationskanal. Wer sie lesen kann, gewinnt.
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <Card style={{ borderLeft: `4px solid ${C.good}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0b0e14", border: `2px solid ${C.good}` }} />
                <b style={{ color: C.text }}>Schwarzer Stecker</b>
              </div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Richtige Farbe an <b style={{ color: C.text }}>richtiger</b> Position. Fünf schwarze = gewonnen.
              </div>
            </Card>
            <Card style={{ borderLeft: `4px solid ${C.dim}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#f8fafc", border: `1px solid ${C.dim}` }} />
                <b style={{ color: C.text }}>Weißer Stecker</b>
              </div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Richtige Farbe, aber <b style={{ color: C.text }}>falsche</b> Position. Die Farbe steckt im Code — nur woanders.
              </div>
            </Card>
          </div>
          <InfoBox title="Die wichtigste Faustregel">
            Die Stecker sagen dir <b>nicht</b>, welche Position gemeint ist. Du bekommst nur Anzahlen. Trick: zähle{" "}
            <code style={codeInline}>schwarz + weiß</code>. Ist die Summe = 5, hast du bereits <b>alle richtigen Farben</b> — dann
            musst du nur noch die Reihenfolge sortieren. Ist die Summe klein, sind viele deiner Farben gar nicht im Code.
          </InfoBox>
          <InfoBox title="Vorsicht bei doppelten Farben">
            Jede Farbe im Code wird nur <b>so oft gezählt, wie sie wirklich vorkommt</b>. Rätst du fünfmal Rot, der Code hat aber nur
            zwei Rot, bekommst du höchstens zwei Stecker für Rot — nicht fünf. Wie das genau berechnet wird (erst alle schwarzen, dann
            die weißen aus dem „Rest"), zeigt der Trainer <i>Projektarchitektur</i> im Detail.
          </InfoBox>
        </Section>

        {/* 3. Selbst spielen */}
        <Section kicker="3 · Interaktiv · Spiel" title="Jetzt bist du dran">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Klick Farben aus der Palette — sie füllen dein Tipp-Feld von links. Ein gesetztes Feld wieder anklicken entfernt es. Mit{" "}
            <b style={{ color: C.text }}>Raten</b> gibst du ab. Tipp für den Anfang: aktiviere den <b style={{ color: C.text }}>Lehrmodus</b>,
            dann siehst du den Code und kannst nachvollziehen, warum welches Feedback erscheint.
          </p>
          <div id="spielen" />
          <PlayableGame />
        </Section>

        {/* 4. Geführte Runde */}
        <Section kicker="4 · Interaktiv · Demo" title="Eine Runde gemeinsam durchdenken">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Hier spielt der Trainer für dich — aber er <b style={{ color: C.text }}>denkt laut mit</b>. Beobachte, wie aus jedem Feedback
            der nächste, bessere Tipp entsteht. Genau diese Denkweise sollst du dir abschauen.
          </p>
          <div id="demo" />
          <DemoPlayer />
        </Section>

        {/* 5. Strategie */}
        <Section kicker="5 · Strategie" title="Vier Tipps, mit denen du fast immer gewinnst">
          <Card>
            <Strategy n="1" title="Erst die Farben, dann die Reihenfolge" color={C.accent}>
              Finde mit den ersten Tipps heraus, <i>welche</i> Farben überhaupt im Code sind (achte auf schwarz + weiß). Erst wenn die
              Summe 5 erreicht, lohnt sich das Feilen an der Reihenfolge.
            </Strategy>
            <Strategy n="2" title="Sichere Treffer stehen lassen" color={C.accent2}>
              Hast du durch Ausprobieren einen schwarzen Stecker mehr bekommen, nachdem du eine Position fixiert hast, war diese Position
              richtig — lass sie beim nächsten Tipp unverändert.
            </Strategy>
            <Strategy n="3" title="Immer nur wenig auf einmal ändern" color={C.gold}>
              Änderst du fünf Dinge gleichzeitig, weißt du bei einem veränderten Feedback nicht, welche Änderung es verursacht hat.
              Tausche pro Versuch möglichst nur ein bis zwei Positionen.
            </Strategy>
            <Strategy n="4" title="Eine Farbe testen verrät ihre Anzahl" color={C.good}>
              Ein Tipp aus fünfmal derselben Farbe sagt dir über schwarz + weiß genau, <i>wie oft</i> diese Farbe im Code steckt — sehr
              nützlich bei Verdacht auf Duplikate.
            </Strategy>
          </Card>
        </Section>

        {/* 6. Glossar */}
        <Section kicker="6 · Glossar" title="Begriffe rund ums Spiel">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            <GlossEntry term="Geheimcode" def="Die vom Computer gewürfelte, verdeckte Folge aus 5 Farben, die du erraten sollst." />
            <GlossEntry term="Tipp / Guess" def="Dein abgegebener Rateversuch aus 5 Farben. Pro Runde sind 10 Tipps erlaubt." />
            <GlossEntry term="Position" def="Einer der 5 Plätze im Code, von links nach rechts. Reihenfolge zählt." />
            <GlossEntry term="Schwarzer Stecker" def="Rückmeldung: richtige Farbe am richtigen Platz. 5 schwarze bedeuten Sieg." />
            <GlossEntry term="Weißer Stecker" def="Rückmeldung: richtige Farbe, aber am falschen Platz." />
            <GlossEntry term="Duplikat" def="Dieselbe Farbe mehrfach im Code. Erlaubt — wird beim Feedback aber nur so oft gezählt, wie sie vorkommt." />
            <GlossEntry term="Lehrmodus" def="In diesem Trainer: zeigt den Geheimcode offen an, damit du das Feedback nachvollziehen kannst." />
            <GlossEntry term="Versuch / Attempt" def="Ein Durchgang aus Tipp + Feedback. Nach 10 erfolglosen Versuchen ist die Runde verloren." />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>Lern-Trainer · Spielablauf „Mastermind 5-8" — gleiche Logik wie die Java-Konsolenanwendung</span>
          <span style={{ color: C.dim, fontSize: 13 }}>Prof. Dr. Veronika Lesch · DHBW Mosbach</span>
        </div>
      </footer>
    </div>
  );
}

// Strategie-Zeile
function Strategy({ n, title, color, children }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: color,
          color: "#06121a",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 4 }}>{title}</div>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

const codeInline = {
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 5,
  padding: "1px 6px",
  fontSize: 13,
  color: C.accent,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};
