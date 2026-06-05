import React, { useState, useEffect, useRef, useMemo } from "react";

/* ============================================================
   ÜBUNG 07 — Interaktiver Lern-Trainer (von Grund auf)
   Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach
   Aufgabe 1  Schlange aus zwei Stapeln (und umgekehrt)
   Aufgabe 2  Hashing — 4 Sondierverfahren  (Kernstück)
   Aufgabe 3  Pfade im binären Suchbaum
   Aufgabe 4  BinarySearch — Feldvergleiche zählen
   Aufgabe 5  ⭐ Knobel-Bonus: tödlicher Bocksbeutel
   ============================================================ */

/* ---------- Farb-/Design-System ----------
   accent + accent2 themenspezifisch (Streuen vs. Suchen), Rest neutral. */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  border: "#2a2f3d",
  text: "#e6e8ee",
  textDim: "#9aa1b1",
  accent: "#7dd3fc",  // cyan  — „Hashing / Streuen": Schlüssel verteilen
  accent2: "#a78bfa", // violett — „Suchen / Bäume": gezielt finden
  good: "#86efac",    // grün — Erfolg / frei / gültig
  bad: "#fca5a5",     // rot  — Kollision / Verletzung / ungültig
  warn: "#fcd34d",    // gelb — aktiver Fokus / Highlight
  code: "#7dd3fc",
};

const MONO = "'SF Mono', 'Fira Code', Consolas, ui-monospace, monospace";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* ============================================================
   WIEDERVERWENDBARE BAUSTEINE
   ============================================================ */

/* Aufdeck-Logik (Frage → Lösung sichtbar machen). */
function useReveal(init = false) {
  const [shown, setShown] = useState(init);
  return [shown, () => setShown((s) => !s), () => setShown(false)];
}

function Section({ kicker, title, color = C.accent, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      {kicker && (
        <div
          style={{
            textTransform: "uppercase",
            letterSpacing: 2,
            fontSize: 12,
            fontWeight: 700,
            color,
            marginBottom: 8,
          }}
        >
          {kicker}
        </div>
      )}
      {title && (
        <h2 style={{ fontSize: 26, margin: "0 0 18px", color: C.text, lineHeight: 1.2 }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: C.textDim,
        marginRight: 14,
        marginTop: 4,
      }}
    >
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, tone = C.accent2, children }) {
  return (
    <div
      style={{
        background: `${tone}15`,
        border: `1px solid ${tone}55`,
        borderRadius: 12,
        padding: "14px 18px",
        margin: "16px 0",
      }}
    >
      {title && (
        <div style={{ fontWeight: 700, color: tone, marginBottom: 6, fontSize: 15 }}>💡 {title}</div>
      )}
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ width: 4, alignSelf: "stretch", background: color, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: C.text, fontSize: 15 }}>{name}</strong>
          {formula && (
            <code
              style={{
                background: C.panel2,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 13,
                color: C.accent,
                fontFamily: MONO,
              }}
            >
              {formula}
            </code>
          )}
        </div>
        {note && <div style={{ color: C.textDim, fontSize: 14, marginTop: 4, lineHeight: 1.55 }}>{note}</div>}
      </div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.textDim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

/* Inline-Code & Pseudocode in Monospace, Vorlesungs-Notation (:=, ⌊⌋, mod, …) */
function Code({ children }) {
  return (
    <code
      style={{
        fontFamily: MONO,
        background: C.panel2,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: 13,
        color: C.code,
      }}
    >
      {children}
    </code>
  );
}

function Pseudo({ title, lines }) {
  return (
    <div
      style={{
        background: "#0b0e15",
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        margin: "14px 0",
        overflowX: "auto",
      }}
    >
      {title && (
        <div style={{ color: C.textDim, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          {title}
        </div>
      )}
      <div style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 1.85 }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: "pre", color: ln.startsWith("//") || ln.includes("# ") ? C.textDim : C.text }}>
            {ln}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Untertitel für die 5 Teilabschnitte jeder Aufgabe */
function SubHead({ n, color = C.accent, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "30px 0 12px" }}>
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: color + "22",
          border: `1px solid ${color}`,
          color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <h3 style={{ margin: 0, fontSize: 18, color: C.text }}>{children}</h3>
    </div>
  );
}

/* Aufgabenstellung (Originaltext) */
function TaskStatement({ children }) {
  return (
    <div
      style={{
        background: C.accent + "0e",
        border: `1px solid ${C.accent}40`,
        borderLeft: `4px solid ${C.accent}`,
        borderRadius: 10,
        padding: "14px 18px",
        margin: "4px 0",
        color: C.text,
        fontSize: 15,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Button-Styles ---------- */
const btn = {
  background: C.accent,
  color: "#0a0d14",
  border: "none",
  borderRadius: 9,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

/* ---------- Reveal-Karte: Frage → Lösung aufdecken ---------- */
function Reveal({ q, children }) {
  const [shown, toggle] = useReveal();
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: C.accent2, fontWeight: 800, fontSize: 16, lineHeight: 1.4 }}>?</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
          {shown && (
            <div style={{ marginTop: 10, color: C.textDim, fontSize: 14.5, lineHeight: 1.7, animation: "fade .3s ease" }}>
              {children}
            </div>
          )}
          <button style={{ ...btnGhost, marginTop: 10, padding: "6px 12px", fontSize: 13 }} onClick={toggle}>
            {shown ? "▲ Lösung verbergen" : "▼ Lösung aufdecken"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Quiz: Auswahlfrage mit Feedback ---------- */
function QuizChoice({ q, options, correct, explain }) {
  const [pick, setPick] = useState(null);
  const answered = pick !== null;
  const ok = pick === correct;
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.warn, fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>✎</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, i) => {
          let bg = C.panel, border = C.border, col = C.text;
          if (answered) {
            if (i === correct) { bg = C.good + "1f"; border = C.good; col = C.text; }
            else if (i === pick) { bg = C.bad + "1f"; border = C.bad; }
            else { col = C.textDim; }
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPick(i)}
              style={{
                textAlign: "left",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 9,
                padding: "10px 14px",
                color: col,
                fontSize: 14,
                fontFamily: SANS,
                cursor: answered ? "default" : "pointer",
                transition: "background .2s, border-color .2s",
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 8, color: C.textDim }}>{String.fromCharCode(65 + i)})</span>
              {opt}
              {answered && i === correct && <span style={{ color: C.good, fontWeight: 700, float: "right" }}>✓</span>}
              {answered && i === pick && i !== correct && <span style={{ color: C.bad, fontWeight: 700, float: "right" }}>✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 12, animation: "fade .3s ease" }}>
          <div style={{ color: ok ? C.good : C.bad, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {ok ? "Richtig! 🎉" : "Nicht ganz."}
          </div>
          <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65 }}>{explain}</div>
          <button style={{ ...btnGhost, marginTop: 10, padding: "6px 12px", fontSize: 13 }} onClick={() => setPick(null)}>
            ↺ Nochmal
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Quiz: Eingabefrage (Zahl/Text) mit Feedback ---------- */
function QuizInput({ q, answers, explain, placeholder = "Antwort …" }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
  const list = Array.isArray(answers) ? answers : [answers];
  const ok = list.some((a) => norm(a) === norm(val));
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.warn, fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>✎</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={val}
          placeholder={placeholder}
          onChange={(e) => { setVal(e.target.value); setChecked(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") setChecked(true); }}
          style={{
            flex: 1,
            minWidth: 160,
            background: C.panel,
            border: `1px solid ${checked ? (ok ? C.good : C.bad) : C.border}`,
            borderRadius: 9,
            color: C.text,
            padding: "9px 12px",
            fontSize: 14,
            fontFamily: SANS,
            outline: "none",
            transition: "border-color .2s",
          }}
        />
        <button style={btn} onClick={() => setChecked(true)}>Prüfen</button>
      </div>
      {checked && (
        <div style={{ marginTop: 12, animation: "fade .3s ease" }}>
          <div style={{ color: ok ? C.good : C.bad, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {ok ? "Richtig! 🎉" : "Noch nicht richtig — versuch es nochmal."}
          </div>
          {(ok || true) && <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65 }}>{explain}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------- gemeinsame Stepper-Steuerung ---------- */
function useStepper(maxStep, intervalMs = 1100) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= maxStep) { setPlaying(false); return; }
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) { setPlaying(false); return s; }
        return s + 1;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, step, maxStep, intervalMs]);

  const controls = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ Pause" : "▶ Abspielen"}</button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}>◀ Zurück</button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep((s) => Math.min(maxStep, s + 1)); }}>Vor ▶</button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep(0); }}>↺ Reset</button>
      <span style={{ marginLeft: "auto", color: C.textDim, fontSize: 13, alignSelf: "center" }}>Schritt {step} / {maxStep}</span>
    </div>
  );
  return { step, setStep, playing, setPlaying, controls };
}

/* =========================================================
   VIS 1 — Queue mit zwei Stacks (Aufgabe 1)
   ========================================================= */
function QueueTwoStacksVis() {
  const ops = [
    { type: "enq", v: "A" },
    { type: "enq", v: "B" },
    { type: "enq", v: "C" },
    { type: "deq" }, // löst Umschütten aus (teuer)
    { type: "deq" }, // billig
    { type: "enq", v: "D" },
    { type: "deq" }, // billig
  ];
  const max = ops.length;
  const { step, controls } = useStepper(max, 1300);

  let inS = [], outS = [];
  let lastNote = "Leere Schlange. Sin = Eingangsstapel, Sout = Ausgangsstapel.";
  let lastCost = "";
  for (let i = 0; i < step; i++) {
    const op = ops[i];
    if (op.type === "enq") {
      inS = [...inS, op.v];
      lastNote = `Enqueue(${op.v}): einfach oben auf Sin legen.`;
      lastCost = "Θ(1) — billig";
    } else {
      if (outS.length === 0) {
        const moved = [...inS].reverse();
        outS = moved;
        inS = [];
        const popped = outS.pop();
        lastNote = `Dequeue: Sout ist leer → ALLE Elemente von Sin nach Sout umschütten (jedes pop+push kehrt die Reihenfolge um). Das vorderste (${popped}) liegt jetzt oben auf Sout und wird zurückgegeben.`;
        lastCost = "O(n) — teuer (Umschütten)";
      } else {
        const popped = outS.pop();
        outS = [...outS];
        lastNote = `Dequeue: Sout nicht leer → direkt oberstes (${popped}) zurückgeben. Kein Umschütten nötig.`;
        lastCost = "Θ(1) — billig";
      }
    }
  }

  const stackBox = (title, arr, color) => (
    <div style={{ flex: 1, minWidth: 110 }}>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div
        style={{
          minHeight: 150,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 4,
          padding: 8,
          background: C.panel2,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
        }}
      >
        {arr.map((x, i) => (
          <div
            key={i}
            style={{
              animation: "pop .3s ease",
              background: color + "22",
              border: `1px solid ${color}`,
              color: C.text,
              borderRadius: 7,
              padding: "8px 0",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {x}
          </div>
        ))}
        {arr.length === 0 && <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", padding: 20 }}>leer</div>}
      </div>
      <div style={{ color: C.textDim, fontSize: 11, textAlign: "center", marginTop: 4 }}>↑ oben (top)</div>
    </div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Schlange (FIFO) aus zwei Stapeln (LIFO)</div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>
        Trick: zwei Stapel, einer für den Eingang (<Code>Sin</Code>), einer für den Ausgang (<Code>Sout</Code>). Das
        einmalige Umschütten dreht LIFO zu FIFO.
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {stackBox("Sin (Eingang)", inS, C.accent)}
        {stackBox("Sout (Ausgang)", outS, C.accent2)}
      </div>
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.55,
          minHeight: 56,
        }}
      >
        {lastNote}
        {lastCost && (
          <div style={{ marginTop: 6, color: lastCost.includes("teuer") ? C.bad : C.good, fontWeight: 700, fontSize: 13 }}>
            Kosten: {lastCost}
          </div>
        )}
      </div>
      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent}>Sin: Enqueue legt hier ab</Tag>
        <Tag color={C.accent2}>Sout: Dequeue entnimmt hier</Tag>
        <Tag color={C.bad}>teures Umschütten O(n)</Tag>
        <Tag color={C.good}>billiger Zugriff Θ(1)</Tag>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 2 — Hashing: 4 Sondierverfahren umschaltbar (Aufgabe 2)
   ========================================================= */
const HKEYS = [44, 12, 23, 88, 71, 11, 94, 39, 20, 5, 16];
const M = 16;
const h0 = (k) => (3 * k + 7) % M;
const h2dh = (k) => 7 - 2 * (k % 4);

function buildInsertHistory(method) {
  const T = Array(M).fill(null);
  const chains = Array.from({ length: M }, () => []);
  const events = [];

  HKEYS.forEach((k) => {
    if (method === "chain") {
      const home = h0(k);
      chains[home] = [k, ...chains[home]]; // Einfügen am Listenkopf
      events.push({
        key: k,
        probe: home,
        placed: home,
        chainSnapshot: chains.map((c) => [...c]),
        T: null,
        info: `h(${k}) = (3·${k}+7) mod 16 = ${home}. Am Listenkopf von Zelle ${home} einfügen.`,
        success: true,
        collision: false,
      });
      return;
    }
    let i = 0;
    while (i < M) {
      let pos, formula;
      if (method === "lin") {
        pos = (h0(k) + i) % M;
        formula = `(h0(${k})+${i}) mod 16 = (${h0(k)}+${i}) mod 16 = ${pos}`;
      } else if (method === "quad") {
        pos = (h0(k) + (i * (i + 1)) / 2) % M; // h0 + ½i + ½i² = h0 + i(i+1)/2
        formula = `(h0 + ½·${i} + ½·${i}²) mod 16 = ${pos}`;
      } else {
        pos = (h0(k) + i * h2dh(k)) % M;
        formula = `(h1(${k})+${i}·h2(${k})) mod 16 = (${h0(k)}+${i}·${h2dh(k)}) mod 16 = ${pos}`;
      }
      const free = T[pos] === null;
      events.push({
        key: k,
        probe: pos,
        i,
        T: T.map((x) => x),
        info: `i=${i}: ${formula} → Zelle ${pos} ${free ? "ist FREI ✓" : "ist belegt ✗ (Kollision)"}`,
        success: free,
        collision: !free,
      });
      if (free) { T[pos] = k; break; }
      i++;
    }
  });
  return { events, finalT: T, finalChains: chains };
}

const METHODS = {
  chain: { label: "Verkettung", color: C.accent },
  lin: { label: "Lineares Sondieren", color: C.accent2 },
  quad: { label: "Quadrat. Sondieren", color: C.warn },
  dh: { label: "Doppeltes Hashing", color: C.good },
};

/* erfolglose Tests aus der DETERMINISTISCHEN Simulation – muss 8/12/4 ergeben */
const FAILS = {
  chain: "—",
  lin: buildInsertHistory("lin").events.filter((e) => e.collision).length,
  quad: buildInsertHistory("quad").events.filter((e) => e.collision).length,
  dh: buildInsertHistory("dh").events.filter((e) => e.collision).length,
};

function HashingVis() {
  const [method, setMethod] = useState("lin");
  const hist = useMemo(() => buildInsertHistory(method), [method]);
  const maxS = hist.events.length;
  const { step, setStep, controls } = useStepper(maxS, 850);
  useEffect(() => { setStep(0); }, [method]); // eslint-disable-line

  const ev = step > 0 ? hist.events[step - 1] : null;
  const failsSoFar = hist.events.slice(0, step).filter((e) => e.collision).length;

  let T, chains;
  if (method === "chain") {
    chains = ev ? ev.chainSnapshot : Array.from({ length: M }, () => []);
    T = null;
  } else {
    T = ev ? [...ev.T] : Array(M).fill(null);
    if (ev && ev.success) T[ev.probe] = ev.key;
  }

  const cellStyle = (idx) => {
    let bg = C.panel2, border = C.border;
    if (ev) {
      if (ev.probe === idx && ev.collision) { bg = C.bad + "33"; border = C.bad; }
      else if (ev.probe === idx && ev.success) { bg = C.good + "33"; border = C.good; }
    }
    return {
      border: `1px solid ${border}`,
      background: bg,
      color: C.text,
      borderRadius: 8,
      padding: "10px 4px",
      textAlign: "center",
      fontSize: 14,
      fontWeight: 700,
      transition: "background .3s, border-color .3s",
      minHeight: 22,
    };
  };

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Hashtabelle T[0..15] aufbauen — vier Kollisionsverfahren
      </div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 14 }}>
        Schlüssel in Reihenfolge: {HKEYS.join(", ")}. Basis-Hashfunktion h0(k) = (3k+7) mod 16. Wähle ein Verfahren und
        schiebe Schlüssel für Schlüssel ein — bei offener Adressierung wird jeder einzelne Probe-Schritt animiert.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(METHODS).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMethod(key)}
            style={{
              ...(method === key ? btn : btnGhost),
              background: method === key ? m.color : "transparent",
              color: method === key ? "#0a0d14" : C.text,
              borderColor: m.color,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === "chain" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {chains.map((c, idx) => {
            const active = ev && ev.placed === idx;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 34, textAlign: "right", color: C.textDim, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                  [{idx}]
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 6,
                    minHeight: 30,
                    padding: 4,
                    borderRadius: 8,
                    background: active ? C.good + "1f" : "transparent",
                    transition: "background .3s",
                  }}
                >
                  {c.map((x, j) => (
                    <span
                      key={j}
                      style={{
                        animation: "pop .3s ease",
                        background: C.accent + "22",
                        border: `1px solid ${C.accent}`,
                        color: C.text,
                        borderRadius: 6,
                        padding: "3px 9px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
          {T.map((x, idx) => (
            <div key={idx}>
              <div style={{ color: C.textDim, fontSize: 10, textAlign: "center", marginBottom: 2 }}>{idx}</div>
              <div style={cellStyle(idx)}>{x === null ? "·" : x}</div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          minHeight: 44,
          color: C.text,
          fontSize: 14,
          lineHeight: 1.55,
          fontFamily: ev ? MONO : SANS,
        }}
      >
        {ev ? (
          <>
            <span style={{ color: METHODS[method].color, fontWeight: 700 }}>Schlüssel {ev.key}:</span> {ev.info}
          </>
        ) : (
          "Drücke ▶ oder „Vor“, um Schlüssel für Schlüssel einzufügen."
        )}
      </div>

      {/* Live-Zähler */}
      {method !== "chain" && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, fontSize: 13 }}>
          <span style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.text }}>
            aktuelles i = <strong style={{ color: C.warn }}>{ev ? ev.i : "–"}</strong>
          </span>
          <span style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.text }}>
            erfolglose Tests bisher: <strong style={{ color: C.bad }}>{failsSoFar}</strong>
          </span>
          <span style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.text }}>
            Gesamt (erwartet): <strong style={{ color: C.warn }}>{FAILS[method]}</strong>
          </span>
        </div>
      )}

      {controls}

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <Tag color={C.bad}>Kollision (Zelle belegt)</Tag>
        <Tag color={C.good}>freie Zelle gefunden</Tag>
      </div>

      {/* Endvergleich aller vier Verfahren */}
      <div style={{ marginTop: 16, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ color: C.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          Gesamtzahl erfolgloser Tests — Vergleich
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(METHODS).map(([key, m]) => (
            <div
              key={key}
              style={{
                flex: "1 1 110px",
                background: method === key ? m.color + "1f" : "transparent",
                border: `1px solid ${method === key ? m.color : C.border}`,
                borderRadius: 9,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ color: C.textDim, fontSize: 12 }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 22, fontWeight: 800 }}>{FAILS[key]}</div>
            </div>
          ))}
        </div>
        <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 8, lineHeight: 1.55 }}>
          Doppeltes Hashing (4) verteilt am besten, quadratisch (12) am schlechtesten — bei Verkettung gibt es keine
          Sondierung, daher „—“.
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 3 — Suchpfad im BST prüfen (Aufgabe 3)
   ========================================================= */
const BST_CASES = {
  A1: { arr: [2, 252, 401, 398, 330, 344, 397, 363], valid: true },
  A2: { arr: [924, 220, 911, 244, 898, 258, 362, 363], valid: true },
  A3: { arr: [935, 278, 347, 621, 299, 392, 358, 363], valid: false },
};

function buildBSTHistory(arr) {
  let lo = -Infinity, hi = Infinity;
  const steps = [];
  let fromDir = null;
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    const ok = lo < x && x < hi;
    let dir = null, nlo = lo, nhi = hi;
    if (ok && i + 1 < arr.length) {
      const nxt = arr[i + 1];
      if (nxt < x) { dir = "links"; nhi = x; }
      else { dir = "rechts"; nlo = x; }
    }
    let line;
    if (!ok) line = 4;
    else if (dir === "links") line = 6;
    else if (dir === "rechts") line = 7;
    else line = 3;
    steps.push({ idx: i, x, lo, hi, ok, dir, fromDir, line, nlo: ok ? nlo : lo, nhi: ok ? nhi : hi });
    if (!ok) break;
    fromDir = dir === "links" ? "L" : dir === "rechts" ? "R" : null;
    lo = nlo; hi = nhi;
  }
  return steps;
}

const BST_PSEUDO = [
  { n: 0, code: "PrüfeSuchpfad(A[1..k])", indent: 0 },
  { n: 1, code: "low  := −∞", indent: 1 },
  { n: 2, code: "high := +∞", indent: 1 },
  { n: 3, code: "for i := 1 to k do", indent: 1 },
  { n: 4, code: "if A[i] ≤ low or A[i] ≥ high then return false", indent: 2 },
  { n: 5, code: "if i < k then", indent: 2 },
  { n: 6, code: "if A[i+1] < A[i] then high := A[i]   // links", indent: 3 },
  { n: 7, code: "else                low := A[i]   // rechts", indent: 3 },
  { n: 8, code: "return true", indent: 1 },
];

function layoutTree(steps) {
  const nodes = [];
  const W = 560, H = 360;
  const cx = W / 2;
  const levelGap = 42;
  let x = cx, y = 30, spread = 130;
  steps.forEach((s, i) => {
    if (i > 0) {
      x += s.fromDir === "L" ? -spread : spread;
      y += levelGap;
      spread = Math.max(22, spread * 0.62);
    }
    nodes.push({ ...s, px: x, py: y });
  });
  return { nodes, W, H };
}

function fmtBound(v) {
  if (v === -Infinity) return "−∞";
  if (v === Infinity) return "+∞";
  return v;
}

function BSTPathVis() {
  const [caseKey, setCaseKey] = useState("A1");
  const [view, setView] = useState("baum");
  const data = BST_CASES[caseKey];
  const steps = useMemo(() => buildBSTHistory(data.arr), [caseKey]); // eslint-disable-line
  const tree = useMemo(() => layoutTree(steps), [steps]);
  const maxS = steps.length;
  const { step, setStep, controls } = useStepper(maxS, 1100);
  useEffect(() => { setStep(0); }, [caseKey]); // eslint-disable-line

  const cur = step > 0 ? steps[step - 1] : null;

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Ist die Folge ein gültiger Suchpfad im binären Suchbaum?
      </div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 14 }}>
        Jeder besuchte Knoten engt ein erlaubtes Intervall (low, high) ein. Links → high := Knotenwert, rechts → low :=
        Knotenwert. Liegt ein Wert außerhalb, ist der Pfad <strong>unmöglich</strong>.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        {Object.keys(BST_CASES).map((k) => (
          <button
            key={k}
            onClick={() => setCaseKey(k)}
            style={{
              ...(caseKey === k ? btn : btnGhost),
              background: caseKey === k ? C.accent2 : "transparent",
              color: caseKey === k ? "#0a0d14" : C.text,
              borderColor: C.accent2,
            }}
          >
            {k}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 9, padding: 3 }}>
          {[["baum", "🌳 Baum"], ["intervall", "📏 Intervall"], ["code", "💻 Code"]].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 7,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 700,
                background: view === v ? C.accent : "transparent",
                color: view === v ? "#0a0d14" : C.textDim,
                transition: "background .2s, color .2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* BAUM */}
      {view === "baum" && (
        <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, marginBottom: 16, overflowX: "auto" }}>
          <svg viewBox={`0 0 ${tree.W} ${tree.H}`} style={{ width: "100%", minWidth: 460, display: "block" }}>
            {tree.nodes.map((n, i) => {
              if (i === 0) return null;
              const prev = tree.nodes[i - 1];
              const visible = cur && i <= cur.idx;
              if (!visible) return null;
              const violation = n.idx === (cur && cur.idx) && !n.ok;
              const stroke = violation ? C.bad : C.accent2;
              const midX = (prev.px + n.px) / 2;
              const midY = (prev.py + n.py) / 2;
              return (
                <g key={"e" + i}>
                  <line x1={prev.px} y1={prev.py} x2={n.px} y2={n.py} stroke={stroke} strokeWidth={2} strokeDasharray={violation ? "5 4" : "0"} style={{ transition: "stroke .3s" }} />
                  <text x={midX + (n.fromDir === "L" ? -12 : 12)} y={midY} fill={C.textDim} fontSize={12} fontWeight="700" textAnchor="middle">
                    {n.fromDir === "L" ? "links" : "rechts"}
                  </text>
                </g>
              );
            })}
            {tree.nodes.map((n, i) => {
              const visible = cur && i <= cur.idx;
              if (!visible) return null;
              const active = cur && i === cur.idx;
              const isViol = active && !n.ok;
              let fill = C.panel, stroke = C.accent2;
              if (active && n.ok) { stroke = C.warn; fill = C.warn + "22"; }
              if (isViol) { stroke = C.bad; fill = C.bad + "33"; }
              return (
                <g key={"n" + i}>
                  <circle cx={n.px} cy={n.py} r={19} fill={fill} stroke={stroke} strokeWidth={active ? 3 : 2} style={{ transition: "stroke .3s, fill .3s" }} />
                  <text x={n.px} y={n.py + 4} fill={C.text} fontSize={13} fontWeight="700" textAnchor="middle">{n.x}</text>
                  {i === 0 && <text x={n.px} y={n.py - 26} fill={C.textDim} fontSize={11} textAnchor="middle">Wurzel</text>}
                </g>
              );
            })}
            {cur && !cur.ok && (() => {
              const n = tree.nodes[cur.idx];
              return (
                <text x={n.px} y={n.py + 38} fill={C.bad} fontSize={11} fontWeight="700" textAnchor="middle">
                  muss in ({fmtBound(cur.lo)}, {fmtBound(cur.hi)}) liegen — tut es nicht
                </text>
              );
            })()}
          </svg>
        </div>
      )}

      {/* CODE */}
      {view === "code" && (
        <div style={{ background: "#0b0e15", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 4px", marginBottom: 16, fontFamily: MONO, fontSize: 13.5, lineHeight: 1.9, overflowX: "auto" }}>
          {BST_PSEUDO.map((row) => {
            const isActive = cur && cur.line === row.n;
            const isViolLine = isActive && cur && !cur.ok;
            const barColor = isViolLine ? C.bad : isActive ? C.warn : "transparent";
            return (
              <div key={row.n} style={{ display: "flex", alignItems: "stretch", background: isActive ? (isViolLine ? C.bad + "22" : C.warn + "1c") : "transparent", transition: "background .3s" }}>
                <span style={{ width: 3, background: barColor, transition: "background .3s", flexShrink: 0 }} />
                <span style={{ width: 26, textAlign: "right", color: C.textDim, paddingRight: 10, userSelect: "none", flexShrink: 0 }}>{row.n + 1}</span>
                <span style={{ paddingLeft: row.indent * 22, color: isActive ? C.text : C.textDim, whiteSpace: "pre", transition: "color .3s" }}>{row.code}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERVALL */}
      {view === "intervall" && (
        <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
          {!cur ? (
            <div style={{ color: C.textDim }}>Drücke ▶, um die Intervalle (low, high) schrumpfen zu sehen.</div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: C.textDim, fontSize: 12, marginBottom: 6 }}>
                <span>low = {fmtBound(cur.lo)}</span>
                <span>A[i] = {cur.x}</span>
                <span>high = {fmtBound(cur.hi)}</span>
              </div>
              <div style={{ position: "relative", height: 14, background: C.border, borderRadius: 7, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: cur.ok ? C.good + "33" : C.bad + "33" }} />
                <div style={{ position: "absolute", top: -3, bottom: -3, left: "50%", width: 3, background: cur.ok ? C.warn : C.bad, transform: "translateX(-50%)" }} />
              </div>
              <div style={{ color: cur.ok ? C.good : C.bad, fontWeight: 700, fontSize: 14, marginTop: 10 }}>
                {cur.ok ? `${cur.x} liegt im erlaubten Intervall ✓` : `${cur.x} verletzt das Intervall ✗`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Folge als Zellen */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {data.arr.map((x, i) => {
          const visited = cur && i < cur.idx;
          const active = cur && i === cur.idx;
          let border = C.border, bg = C.panel2;
          if (visited) { border = C.accent2; bg = C.accent2 + "1a"; }
          if (active) {
            if (cur.ok) { border = C.warn; bg = C.warn + "22"; }
            else { border = C.bad; bg = C.bad + "33"; }
          }
          return (
            <div key={i} style={{ border: `1px solid ${border}`, background: bg, color: C.text, borderRadius: 8, padding: "10px 12px", fontWeight: 700, fontSize: 14, transition: "background .3s, border-color .3s", animation: active ? "pop .3s ease" : "none" }}>
              {x}
            </div>
          );
        })}
      </div>

      <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", minHeight: 64, color: C.text, fontSize: 14, lineHeight: 1.6 }}>
        {!cur ? (
          "Wähle eine Folge und drücke ▶."
        ) : cur.ok ? (
          <>
            <div>
              Knoten <strong style={{ color: C.warn }}>{cur.x}</strong> muss im Intervall{" "}
              <Code>{`(${fmtBound(cur.lo)}, ${fmtBound(cur.hi)})`}</Code> liegen — <span style={{ color: C.good, fontWeight: 700 }}>passt ✓</span>
            </div>
            {cur.dir && (
              <div style={{ marginTop: 6, color: C.textDim }}>
                Nächster Wert ist {cur.dir === "links" ? "kleiner" : "größer"} → gehe nach {cur.dir}, neues Intervall{" "}
                <Code>{`(${fmtBound(cur.nlo)}, ${fmtBound(cur.nhi)})`}</Code>
              </div>
            )}
          </>
        ) : (
          <div>
            Knoten <strong style={{ color: C.bad }}>{cur.x}</strong> müsste im Intervall{" "}
            <Code>{`(${fmtBound(cur.lo)}, ${fmtBound(cur.hi)})`}</Code> liegen, tut es aber nicht →{" "}
            <span style={{ color: C.bad, fontWeight: 700 }}>UNGÜLTIGER Pfad ✗</span>
          </div>
        )}
      </div>

      {step >= maxS && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontWeight: 700, background: data.valid ? C.good + "1f" : C.bad + "1f", color: data.valid ? C.good : C.bad, border: `1px solid ${data.valid ? C.good : C.bad}55` }}>
          Ergebnis: {data.valid ? "gültiger Suchpfad ✓" : "kein gültiger Suchpfad ✗"}
        </div>
      )}

      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent2}>bereits besucht</Tag>
        <Tag color={C.warn}>aktuell geprüft</Tag>
        <Tag color={C.bad}>Intervallverletzung</Tag>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 4 — BinarySearch vs BinarySearch2 (Aufgabe 4)
   Worst case: Schlüssel größer als alle → immer nach RECHTS
   (die rechte Hälfte ist wegen ⌊⌋ die größere → maximale Tiefe)
   ========================================================= */
function binSearchAEsteps(n) {
  // Algorithmus aus Teil a): 2 Feldvergleiche pro Aufruf (== und >)
  const steps = [];
  let l = 1, r = n, cmp = 0;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    cmp += 2;
    steps.push({ l, r, m, cmp, kind: "probe" });
    l = m + 1; // Worst-Case: rechts weiter
  }
  steps.push({ l, r: r, m: null, cmp, kind: "empty" }); // ℓ>r: 0 Feldvergleiche
  return steps;
}

function binSearch2steps(n) {
  // Teil b): 1 Feldvergleich pro Schleifendurchlauf (<), 1 finaler (==)
  const steps = [];
  let l = 1, r = n, cmp = 0;
  while (l < r) {
    const m = Math.floor((l + r) / 2);
    cmp += 1;
    steps.push({ l, r, m, cmp, kind: "probe" });
    l = m + 1; // Worst-Case: A[m] < k → rechts
  }
  cmp += 1;
  steps.push({ l, r, m: l, cmp, kind: "final" });
  return steps;
}

function FieldRow({ n, cur, color }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {Array.from({ length: n }, (_, i) => {
        const pos = i + 1;
        let bg = C.panel2, border = C.border, col = C.textDim;
        if (cur) {
          const inRange = pos >= cur.l && pos <= cur.r;
          if (inRange) { col = C.text; border = color; bg = color + "14"; }
          if (cur.m != null && pos === cur.m) { bg = C.warn + "33"; border = C.warn; col = C.text; }
        }
        return (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${border}`,
              background: bg,
              color: col,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              transition: "background .3s, border-color .3s",
            }}
          >
            {pos}
          </div>
        );
      })}
    </div>
  );
}

function BinarySearchVis() {
  const exps = [3, 4]; // n = 8, 16
  const [exp, setExp] = useState(3);
  const n = 2 ** exp;
  const stepsA = useMemo(() => binSearchAEsteps(n), [n]);
  const steps2 = useMemo(() => binSearch2steps(n), [n]);
  const maxS = Math.max(stepsA.length, steps2.length);
  const { step, setStep, controls } = useStepper(maxS, 950);
  useEffect(() => { setStep(0); }, [n]); // eslint-disable-line

  const curA = step > 0 ? stepsA[Math.min(step, stepsA.length) - 1] : null;
  const cur2 = step > 0 ? steps2[Math.min(step, steps2.length) - 1] : null;
  const cmpA = curA ? curA.cmp : 0;
  const cmp2 = cur2 ? cur2.cmp : 0;
  const totA = stepsA[stepsA.length - 1].cmp; // = 2·log₂n + 2
  const tot2 = steps2[steps2.length - 1].cmp; // = ⌈log₂n⌉ + 1
  const done = step >= maxS;

  const panel = (title, color, cur, cmp, formula) => (
    <div style={{ flex: "1 1 280px", background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontWeight: 700, color, marginBottom: 4 }}>{title}</div>
      <div style={{ color: C.textDim, fontSize: 12.5, marginBottom: 10 }}>{formula}</div>
      <FieldRow n={n} cur={cur} color={color} />
      <div style={{ marginTop: 10, fontSize: 13, color: C.text, minHeight: 38 }}>
        {cur ? (
          cur.kind === "empty" ? (
            <span>ℓ &gt; r → leeres Teilfeld, <strong style={{ color: C.good }}>0</strong> Feldvergleiche.</span>
          ) : cur.kind === "final" ? (
            <span>ℓ = r = {cur.l}: ein finaler Gleichheitstest <Code>{"A[ℓ] == k"}</Code>.</span>
          ) : (
            <span>ℓ={cur.l}, r={cur.r}, m=⌊(ℓ+r)/2⌋=<strong style={{ color: C.warn }}>{cur.m}</strong></span>
          )
        ) : (
          <span>—</span>
        )}
      </div>
      <div style={{ marginTop: 6, fontSize: 14, color: C.text }}>
        Feldvergleiche: <strong style={{ color, fontSize: 20 }}>{cmp}</strong>
      </div>
    </div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        BinarySearch (Teil a) vs. BinarySearch2 (Teil b) — Feldvergleiche zählen
      </div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 14 }}>
        Worst-Case: gesuchter Schlüssel ist größer als alle Elemente → die Suche geht immer nach rechts (die rechte
        Hälfte ist wegen <Code>⌊ ⌋</Code> die größere und liefert die maximale Tiefe). Links zählt jeder Aufruf 2
        Feldvergleiche (<Code>{"=="}</Code> und <Code>{">"}</Code>), rechts nur 1 (<Code>{"<"}</Code>) plus einen am Ende.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {exps.map((e) => (
          <button
            key={e}
            onClick={() => setExp(e)}
            style={{ ...(exp === e ? btn : btnGhost), background: exp === e ? C.accent : "transparent", color: exp === e ? "#0a0d14" : C.text, borderColor: C.accent }}
          >
            n = 2^{e} = {2 ** e}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {panel("BinarySearch (a)", C.accent2, curA, cmpA, "2 Feldvergleiche je Aufruf")}
        {panel("BinarySearch2 (b)", C.good, cur2, cmp2, "1 je Schleife + 1 am Ende")}
      </div>

      {done && (
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: C.good + "16", border: `1px solid ${C.good}44`, color: C.text, fontSize: 14, lineHeight: 1.6 }}>
          <strong style={{ color: C.accent2 }}>BinarySearch:</strong> {totA} Vergleiche = 2·log₂({n})+2 = 2·{exp}+2.{" "}
          <strong style={{ color: C.good }}>BinarySearch2:</strong> {tot2} Vergleiche = ⌈log₂({n})⌉+1 = {exp}+1.{" "}
          → BinarySearch2 braucht ungefähr die <strong>Hälfte</strong>.
        </div>
      )}

      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent2}>aktives Suchintervall</Tag>
        <Tag color={C.warn}>geprüfte Mitte m</Tag>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 5 — Bocksbeutel: Binärkodierung (Aufgabe 5)
   ========================================================= */
function BocksbeutelVis() {
  const [num, setNum] = useState(412);
  const bits = Array.from({ length: 10 }, (_, j) => (num >> j) & 1); // bits[0] = LSB
  const binStr = Array.from({ length: 10 }, (_, j) => (num >> (9 - j)) & 1).join("");

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Binärkodierung: welche Vorkoster trinken?</div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 14 }}>
        Wähle die vergiftete Flasche (0–999). Vorkoster j trinkt von jeder Flasche, deren Bit j eine 1 ist. Nach einem
        Monat ist das Sterbe-Muster genau die Binärzahl der Flasche.
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="range"
          min={0}
          max={999}
          value={num}
          onChange={(e) => setNum(Number(e.target.value))}
          style={{ flex: 1, minWidth: 200, accentColor: C.accent }}
        />
        <input
          type="number"
          min={0}
          max={999}
          value={num}
          onChange={(e) => setNum(Math.max(0, Math.min(999, Number(e.target.value) || 0)))}
          style={{ width: 80, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "8px 10px", fontSize: 14, fontFamily: MONO }}
        />
        <span style={{ color: C.textDim, fontSize: 13 }}>
          binär: <span style={{ color: C.accent, fontFamily: MONO, fontWeight: 700 }}>{binStr}</span>
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
        {Array.from({ length: 10 }, (_, j) => {
          const bit = bits[9 - j]; // links = höchstwertiges Bit (Vorkoster 9)
          const idx = 9 - j;
          const dead = bit === 1;
          return (
            <div key={j} style={{ textAlign: "center" }}>
              <div style={{ color: C.textDim, fontSize: 10, marginBottom: 3 }}>V{idx}</div>
              <div
                style={{
                  borderRadius: 10,
                  border: `1px solid ${dead ? C.bad : C.border}`,
                  background: dead ? C.bad + "26" : C.panel2,
                  padding: "10px 0 6px",
                  transition: "background .25s, border-color .25s",
                }}
              >
                <div style={{ fontSize: 20 }}>{dead ? "💀" : "🧑"}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: dead ? C.bad : C.textDim, fontFamily: MONO }}>{bit}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", color: C.text, fontSize: 14, lineHeight: 1.6 }}>
        Gestorben sind die Vorkoster mit Bit 1: <strong style={{ color: C.bad }}>{bits.map((b, j) => (b ? `V${j}` : null)).filter(Boolean).reverse().join(", ") || "keiner"}</strong>.
        Liest man ihr Muster als Binärzahl, ergibt sich <Code>{binStr}</Code> = <strong style={{ color: C.accent }}>{num}</strong> — die gesuchte Flasche.
      </div>
      <div style={{ marginTop: 8, color: C.textDim, fontSize: 12.5 }}>
        10 Vorkoster liefern 2¹⁰ = 1024 unterscheidbare Muster — mehr als die 1000 Flaschen.
      </div>
    </Card>
  );
}

/* =========================================================
   AUFGABEN-INHALTE
   ========================================================= */
function Aufgabe1() {
  return (
    <Section kicker="Aufgabe 1 · Datenstrukturen umbauen" title="Eine Schlange aus zwei Stapeln (und umgekehrt)">
      <SubHead n="1" color={C.accent}>Aufgabenstellung</SubHead>
      <TaskStatement>
        <strong>a)</strong> Wie lässt sich eine Schlange (Queue) durch zwei Stapel (Stacks) implementieren? Welche
        asymptotischen Worst-Case-Laufzeiten haben <Code>Enqueue</Code> und <Code>Dequeue</Code>?<br />
        <strong>b)</strong> Wie lässt sich ein Stapel durch zwei Schlangen implementieren? Welche Worst-Case-Laufzeiten
        haben <Code>Push</Code>, <Code>Pop</Code>, <Code>Top</Code>?
      </TaskStatement>

      <SubHead n="2" color={C.accent}>Grundlagen von Null</SubHead>
      <Card>
        <MethodRow color={C.accent} name="Stack (Stapel) = LIFO" formula="push · pop · top" note="Last In, First Out: man legt oben auf (push), nimmt oben weg (pop), schaut oben an (top). Wie ein Stapel Teller. Jede dieser Operationen ist für sich O(1)." />
        <MethodRow color={C.accent2} name="Queue (Schlange) = FIFO" formula="enqueue · dequeue" note="First In, First Out: hinten anstellen (enqueue), vorne bedient werden (dequeue). Wie eine Warteschlange an der Kasse. Auch hier sind beide Operationen O(1)." />
        <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 12, lineHeight: 1.55 }}>
          Das Problem: Ein Stapel gibt immer das <em>zuletzt</em> Abgelegte zurück, eine Schlange das <em>älteste</em> —
          also genau die umgekehrte Reihenfolge. Mit zwei Stapeln dreht man die Reihenfolge einmal um.
        </div>
      </Card>

      <SubHead n="3" color={C.accent}>Lösung Schritt für Schritt</SubHead>
      <InfoBox title="a) Queue aus zwei Stacks Sin, Sout" tone={C.accent}>
        <div style={{ marginBottom: 8 }}>
          <strong>Enqueue(x):</strong> <Code>push(Sin, x)</Code>. → <span style={{ color: C.good }}>Θ(1)</span>.
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Dequeue():</strong> Ist <Code>Sout</Code> leer, schiebe <strong>alle</strong> Elemente von{" "}
          <Code>Sin</Code> nach <Code>Sout</Code> (jedes <Code>pop</Code>+<Code>push</Code> kehrt die Reihenfolge um → das
          vorderste Element liegt jetzt oben auf <Code>Sout</Code>). Danach <Code>pop(Sout)</Code>.
        </div>
        <div>
          Worst-Case: Enqueue <span style={{ color: C.good }}>Θ(1)</span>; Dequeue{" "}
          <span style={{ color: C.bad }}>O(n)</span> (wenn <Code>Sout</Code> leer ist und alle n Elemente umgeschichtet
          werden müssen). <span style={{ color: C.textDim }}>Hinweis: amortisiert ist Dequeue O(1) — gefragt ist aber der Worst-Case → O(n).</span>
        </div>
      </InfoBox>
      <InfoBox title="b) Stack aus zwei Queues Q1, Q2 (Variante „Push teuer“)" tone={C.accent2}>
        <div style={{ marginBottom: 8 }}>
          <strong>Push(x):</strong> <Code>enqueue(Q1, x)</Code>; dann <strong>alle vorherigen</strong> Elemente einmal
          rotieren (<Code>dequeue</Code> aus Q1, <Code>enqueue</Code> zurück), sodass das neue Element vorne steht. →{" "}
          <span style={{ color: C.bad }}>O(n)</span>.
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>Pop():</strong> <Code>dequeue(Q1)</Code> → <span style={{ color: C.good }}>Θ(1)</span>.<br />
          <strong>Top():</strong> <Code>front(Q1)</Code> → <span style={{ color: C.good }}>Θ(1)</span>.
        </div>
        <div style={{ color: C.textDim }}>
          Symmetrische Alternative „Pop teuer“: Push O(1), Pop/Top O(n) (beim Pop n−1 Elemente nach Q2 umfüllen, das letzte
          ist das Ergebnis). Eines von beiden bleibt immer O(n).
        </div>
      </InfoBox>

      <SubHead n="4" color={C.accent}>Interaktive Visualisierung</SubHead>
      <QueueTwoStacksVis />

      <SubHead n="5" color={C.accent}>Verständnisaufgaben</SubHead>
      <Reveal q="Warum ist Dequeue trotz Worst-Case O(n) amortisiert O(1)?">
        Jedes Element wird in seinem „Leben“ <strong>höchstens einmal</strong> umgeschüttet: einmal von Sin nach Sout.
        Danach wird es nur noch billig per pop entnommen. Verteilt man die einmaligen Umschütt-Kosten auf alle
        Operationen, entfällt auf jede im Schnitt nur ein konstanter Anteil → amortisiert Θ(1). Der Worst-Case einer{" "}
        <em>einzelnen</em> Dequeue-Operation bleibt aber O(n).
      </Reveal>
      <QuizChoice
        q="Bei der Queue aus zwei Stacks — welche Operation kann im Worst-Case O(n) kosten?"
        options={["Enqueue", "Dequeue", "Beide gleich teuer", "Keine, beide sind O(1)"]}
        correct={1}
        explain="Enqueue legt nur auf Sin ab (Θ(1)). Dequeue muss, wenn Sout leer ist, alle n Elemente umschichten → O(n)."
      />
    </Section>
  );
}

function Aufgabe2() {
  return (
    <Section kicker="Aufgabe 2 · Hashing (Kernstück)" title="Schlüssel verteilen, Kollisionen auflösen" color={C.accent}>
      <SubHead n="1" color={C.accent}>Aufgabenstellung</SubHead>
      <TaskStatement>
        Die Schlüssel <strong>44, 12, 23, 88, 71, 11, 94, 39, 20, 5, 16</strong> werden in dieser Reihenfolge in eine
        Hashtabelle <Code>T[0..15]</Code> (m = 16) eingefügt.<br />
        <strong>a)</strong> Zeichne für jedes Verfahren die Tabelle: <em>Verkettung</em> mit <Code>{"h(k)=(3k+7) mod 16"}</Code>;{" "}
        <em>lineares Sondieren</em> <Code>{"h(k,i)=(h₀(k)+i) mod 16"}</Code>; <em>quadratisches Sondieren</em>{" "}
        <Code>{"h(k,i)=(h₀+½i+½i²) mod 16"}</Code>; <em>doppeltes Hashing</em>{" "}
        <Code>{"h(k,i)=(h₁(k)+i·h₂(k)) mod 16"}</Code> mit <Code>{"h₂(k)=7−2(k mod 4)"}</Code>. Gib (außer bei
        Verkettung) die Gesamtzahl der erfolglosen Tests an.<br />
        <strong>b)</strong> Welches Problem tritt bei doppeltem Hashing auf, wenn <Code>{"h₂(k)=8−(k mod 8)"}</Code>{" "}
        verwendet wird?
      </TaskStatement>

      <SubHead n="2" color={C.accent}>Grundlagen von Null</SubHead>
      <Card style={{ marginBottom: 8 }}>
        <p style={{ margin: "0 0 12px", lineHeight: 1.7, fontSize: 15, color: C.text }}>
          Eine <strong>Hashtabelle</strong> ist ein Array <Code>T[0..15]</Code>. Die <strong>Hashfunktion</strong>{" "}
          <Code>{"h₀(k)=(3k+7) mod 16"}</Code> rechnet jeden Schlüssel k auf einen Index 0..15 um (<Code>mod 16</Code> =
          Rest bei Division durch 16). Eine <strong style={{ color: C.bad }}>Kollision</strong> ist, wenn zwei Schlüssel
          auf denselben Index fallen.
        </p>
        <MethodRow color={C.accent} name="Verkettung (Chaining)" formula="Liste pro Zelle" note="Jede Zelle hält eine verkettete Liste; kollidierende Schlüssel werden angehängt (hier: am Listenkopf eingefügt → zuletzt Eingefügtes steht vorne)." />
        <MethodRow color={C.accent2} name="Offene Adressierung (Sondieren)" formula="Versuchszähler i" note="Bei Kollision wird nach festem Muster die nächste Zelle probiert. i = Versuchszähler (startet bei 0)." />
        <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 12, lineHeight: 1.55 }}>
          <strong style={{ color: C.text }}>„Erfolgloser Test“</strong> = ein Probe-Schritt, der auf eine <em>belegte</em>{" "}
          Zelle trifft. <strong style={{ color: C.text }}>„Getestete Zellen“</strong> = erfolglose Tests + 1 (die finale freie Zelle).
        </div>
      </Card>

      <SubHead n="3" color={C.accent}>Lösung Schritt für Schritt</SubHead>
      <InfoBox title="Basis-Hashwerte h₀(k) = (3k+7) mod 16" tone={C.accent}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontFamily: MONO, fontSize: 13, color: C.text }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 8px", color: C.textDim }}>k</td>
                {HKEYS.map((k) => <td key={k} style={{ padding: "4px 8px", borderLeft: `1px solid ${C.border}` }}>{k}</td>)}
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: C.textDim }}>h₀</td>
                {HKEYS.map((k) => <td key={k} style={{ padding: "4px 8px", borderLeft: `1px solid ${C.border}`, color: C.accent }}>{h0(k)}</td>)}
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: C.textDim }}>h₂</td>
                {HKEYS.map((k) => <td key={k} style={{ padding: "4px 8px", borderLeft: `1px solid ${C.border}`, color: C.good }}>{h2dh(k)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </InfoBox>
      <div style={{ display: "grid", gap: 10 }}>
        <Card style={{ padding: 16 }}>
          <strong style={{ color: C.accent }}>Verkettung</strong>
          <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 6, lineHeight: 1.6, fontFamily: MONO }}>
            1: 94 · 3: 20 · 6: 5 · 7: 16 · 8: 11 · 11: 44, 12 · 12: 23, 71, 39 · 15: 88
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <strong style={{ color: C.accent2 }}>Lineares Sondieren — 8 erfolglose Tests</strong>
          <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 6, lineHeight: 1.6, fontFamily: MONO }}>
            0: 39 · 1: 94 · 3: 20 · 6: 5 · 7: 16 · 8: 11 · 11: 44 · 12: 12 · 13: 23 · 14: 71 · 15: 88
          </div>
          <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 6 }}>Fehlversuche je Schlüssel: 44:0, 12:1, 23:1, 88:0, 71:2, 11:0, 94:0, 39:4, 20:0, 5:0, 16:0 → <strong style={{ color: C.warn }}>8</strong></div>
        </Card>
        <Card style={{ padding: 16 }}>
          <strong style={{ color: C.warn }}>Quadratisches Sondieren — 12 erfolglose Tests</strong>
          <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 6, lineHeight: 1.6, fontFamily: MONO }}>
            1: 94 · 2: 71 · 3: 20 · 6: 39 · 7: 5 · 8: 11 · 10: 16 · 11: 44 · 12: 12 · 13: 23 · 15: 88
          </div>
          <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 6 }}>Offset-Folge i(i+1)/2 mod 16 = [0,1,3,6,10,15,5,12,4,13,7,2,14,11,9,8] ist eine vollständige Permutation. Fehlversuche: 44:0, 12:1, 23:1, 88:0, 71:3, 11:0, 94:0, 39:4, 20:0, 5:1, 16:2 → <strong style={{ color: C.warn }}>12</strong></div>
        </Card>
        <Card style={{ padding: 16 }}>
          <strong style={{ color: C.good }}>Doppeltes Hashing — 4 erfolglose Tests</strong>
          <div style={{ color: C.textDim, fontSize: 13.5, marginTop: 6, lineHeight: 1.6, fontFamily: MONO }}>
            1: 94 · 2: 12 · 3: 20 · 6: 5 · 7: 16 · 8: 11 · 11: 44 · 12: 23 · 13: 71 · 14: 39 · 15: 88
          </div>
          <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 6 }}>Fehlversuche: 44:0, 12:1, 23:0, 88:0, 71:1, 11:0, 94:0, 39:2, 20:0, 5:0, 16:0 → <strong style={{ color: C.warn }}>4</strong></div>
        </Card>
      </div>

      <InfoBox title="b) Warum h₂(k) = 8 − (k mod 8) gefährlich ist" tone={C.bad}>
        Damit doppeltes Hashing <strong>alle</strong> Zellen durchläuft, muss <Code>h₂(k)</Code>{" "}
        <strong>teilerfremd zu m = 16</strong> sein. <Code>{"h₂(k)=8−(k mod 8)"}</Code> liefert Werte aus {"{1,…,8}"}; ist{" "}
        <Code>h₂(k)</Code> <strong>gerade</strong> (2, 4, 6, 8), teilt es mit 16 den Faktor 2. Dann besucht die
        Sondierfolge <Code>{"h₁+i·h₂ mod 16"}</Code> nur eine <strong>Teilmenge</strong> der Zellen (Schrittweite 8 → nur
        2 Zellen, 4 → nur 4 usw.). Folge: Das Einfügen kann <strong style={{ color: C.bad }}>fehlschlagen, obwohl noch
        freie Zellen da sind</strong>. Das ursprüngliche <Code>{"h₂(k)=7−2(k mod 4)"}</Code> liefert nur{" "}
        <strong>ungerade</strong> Werte {"{1,3,5,7}"} → immer teilerfremd zu 16 → vollständige Permutation.
      </InfoBox>

      <SubHead n="4" color={C.accent}>Interaktive Visualisierung</SubHead>
      <HashingVis />

      <SubHead n="5" color={C.accent}>Verständnisaufgaben</SubHead>
      <QuizInput
        q="Wie viele erfolglose Tests gibt es beim doppelten Hashing insgesamt?"
        answers={["4"]}
        explain="Richtig ist 4. Nur 12, 71 und 39 kollidieren überhaupt (1+1+2 Fehlversuche). Die schlüsselabhängige Schrittweite verteilt am gleichmäßigsten."
        placeholder="Zahl eingeben"
      />
      <Reveal q="Warum braucht quadratisches Sondieren hier mehr Tests (12) als doppeltes Hashing (4)?">
        Beim quadratischen Sondieren hängt die Sprungfolge <em>nur von der Start­zelle</em> ab — alle Schlüssel mit
        gleichem <Code>h₀</Code> laufen dieselbe Offset-Folge ab und stolpern über dieselben belegten Zellen
        („sekundäres Clustering“). Beim doppelten Hashing bestimmt zusätzlich <Code>h₂(k)</Code> die <em>Schrittweite</em>,
        die von Schlüssel zu Schlüssel verschieden ist. Dadurch weichen kollidierende Schlüssel auf unterschiedliche
        Wege aus und treffen viel seltener auf belegte Zellen.
      </Reveal>
      <QuizChoice
        q="Ist h₂(k) = 8 − (k mod 8) eine sichere Schrittweite für m = 16?"
        options={["Ja, sie erreicht alle Zellen", "Nein, sie kann gerade (und damit nicht teilerfremd zu 16) werden", "Ja, weil sie nie 0 wird", "Nur für gerade Schlüssel k"]}
        correct={1}
        explain="Nein. Wird h₂(k) gerade (2,4,6,8), hat es mit 16 den gemeinsamen Teiler 2. Die Sondierfolge läuft dann in einem kurzen Zyklus und erreicht nicht alle Zellen — Einfügen kann scheitern, obwohl Platz frei ist."
      />
    </Section>
  );
}

function Aufgabe3() {
  return (
    <Section kicker="Aufgabe 3 · Suchbäume" title="Pfade im binären Suchbaum prüfen" color={C.accent2}>
      <SubHead n="1" color={C.accent2}>Aufgabenstellung</SubHead>
      <TaskStatement>
        Gegeben eine Folge <Code>A[1..k]</Code>, die bei der Suche geprüft wurde (<Code>A[1]</Code> = Wurzel,{" "}
        <Code>A[2]</Code> = Kind der Wurzel usw.).<br />
        <strong>a)</strong> Prüfe mit Begründung, ob diese Folgen einem Suchpfad in einem BST entsprechen <em>können</em>:
        <div style={{ fontFamily: MONO, fontSize: 13.5, margin: "8px 0", color: C.text }}>
          A1 = ⟨2, 252, 401, 398, 330, 344, 397, 363⟩<br />
          A2 = ⟨924, 220, 911, 244, 898, 258, 362, 363⟩<br />
          A3 = ⟨935, 278, 347, 621, 299, 392, 358, 363⟩
        </div>
        <strong>b)</strong> Beschreibe in Worten <em>und</em> Pseudocode einen Algorithmus mit Worst-Case-Laufzeit{" "}
        <strong>Θ(k)</strong>.
      </TaskStatement>

      <SubHead n="2" color={C.accent2}>Grundlagen von Null</SubHead>
      <Card>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 15, color: C.text }}>
          Ein <strong>binärer Suchbaum (BST)</strong> erfüllt: links {"<"} Knoten {"<"} rechts. Ein{" "}
          <strong>Suchpfad</strong> ist die Liste der Knoten, die man bei der Suche besucht: ist das Ziel kleiner → nach
          links, größer → nach rechts.
        </p>
        <InfoBox title="Kernidee: ein schrumpfendes Intervall" tone={C.accent2}>
          Jede Richtungsentscheidung schränkt ein gültiges Intervall <Code>(low, high)</Code> für alle folgenden Knoten
          ein. Bricht ein Knoten aus diesem Intervall aus, ist die Folge unmöglich — egal wie der Baum konkret aussieht.
        </InfoBox>
      </Card>

      <SubHead n="3" color={C.accent2}>Lösung Schritt für Schritt</SubHead>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
        Starte mit <Code>low = −∞</Code>, <Code>high = +∞</Code>. An Knoten <Code>A[i]</Code> muss{" "}
        <Code>{"low < A[i] < high"}</Code> gelten. Geht es nach links (<Code>{"A[i+1] < A[i]"}</Code>) → <Code>high := A[i]</Code>;
        nach rechts → <Code>low := A[i]</Code>.
      </div>
      <InfoBox title="A1 ⟨2,252,401,398,330,344,397,363⟩ → gültig ✓" tone={C.good}>
        Jeder Knoten liegt im jeweils verengten Intervall (rechts, rechts, links, links, rechts, rechts, links — alles konsistent).
      </InfoBox>
      <InfoBox title="A2 ⟨924,220,911,244,898,258,362,363⟩ → gültig ✓" tone={C.good}>
        Trotz Zickzack bleibt jeder Wert im aktuellen Fenster (z. B. 911 ∈ (220, 924), 244 ∈ (220, 911), …, 363 ∈ (362, 898)).
      </InfoBox>
      <InfoBox title="A3 ⟨935,278,347,621,299,392,358,363⟩ → NICHT gültig ✗" tone={C.bad}>
        935→278 (links) → 278→347 (rechts, low=278) → 347→621 (rechts, low=347) → 621→299 (links, high=621): der nächste
        Knoten muss in <Code>(347, 621)</Code> liegen. <strong>299 {"<"} 347</strong> → Widerspruch. Wir hatten bei 347
        entschieden „Ziel {">"} 347“, können danach unmöglich auf 299 stoßen.
      </InfoBox>
      <Pseudo
        title="b) Algorithmus — Θ(k)"
        lines={[
          "PrüfeSuchpfad(A[1..k])",
          "  low  := −∞",
          "  high := +∞",
          "  for i := 1 to k do",
          "    if A[i] ≤ low or A[i] ≥ high then",
          "      return false        // A[i] außerhalb des erlaubten Intervalls",
          "    if i < k then",
          "      if A[i+1] < A[i] then high := A[i]   // nach links",
          "      else                  low  := A[i]   // nach rechts",
          "  return true",
        ]}
      />
      <InfoBox title="Begründung Θ(k)" tone={C.accent2}>
        Eine Schleife mit k Durchläufen, jeder Durchlauf nur O(1) (zwei Vergleiche, eine Zuweisung) → Θ(k). <em>denn:</em>{" "}
        genau k Iterationen × konstante Kosten — nicht nur höchstens (O), sondern im gültigen Fall auch mindestens (Ω) k
        Schritte, weil die ganze Folge geprüft werden muss.
      </InfoBox>

      <SubHead n="4" color={C.accent2}>Interaktive Visualisierung</SubHead>
      <BSTPathVis />

      <SubHead n="5" color={C.accent2}>Verständnisaufgaben</SubHead>
      <QuizChoice
        q="Welche der drei Folgen ist KEIN gültiger Suchpfad?"
        options={["A1", "A2", "A3", "Alle drei sind gültig"]}
        correct={2}
        explain="A3 ist ungültig: nach den Schritten bis 621 muss der nächste Knoten in (347, 621) liegen, aber 299 < 347."
      />
      <QuizInput
        q="An welchem Wert bricht die ungültige Folge A3? (Wert eingeben)"
        answers={["299"]}
        explain="Bei 299: das erlaubte Intervall ist zu diesem Zeitpunkt (347, 621), und 299 liegt darunter."
        placeholder="Wert"
      />
      <Reveal q="Warum ist A2 trotz wildem Auf und Ab gültig?">
        Gültigkeit hängt nicht davon ab, ob die Werte monoton steigen oder fallen, sondern nur davon, ob jeder Wert im{" "}
        <em>aktuell erlaubten Intervall</em> liegt. Bei A2 schrumpft das Fenster bei jedem Schritt sauber: 924 setzt
        high, 220 setzt low, 911 ∈ (220,924), 244 ∈ (220,911) usw. Jeder Wert respektiert die bisher getroffenen
        links/rechts-Entscheidungen — das Zickzack ist erlaubt, solange das Intervall nie verletzt wird.
      </Reveal>
    </Section>
  );
}

function Aufgabe4() {
  return (
    <Section kicker="Aufgabe 4 · Analyse" title="BinarySearch — Feldvergleiche genau zählen" color={C.accent2}>
      <SubHead n="1" color={C.accent2}>Aufgabenstellung</SubHead>
      <TaskStatement>
        <Code>A</Code> ist stets aufsteigend sortiert, Länge n.<br />
        <strong>a)</strong> Gegeben <Code>BinarySearch(A, k, ℓ, r)</Code>:{" "}
        <Code>{"if ℓ>r then return false; m:=⌊(ℓ+r)/2⌋; if A[m]==k then return true; if A[m]>k then BinarySearch(A,k,ℓ,m−1) else BinarySearch(A,k,m+1,r)"}</Code>.
        Gib die <strong>genaue Anzahl der Vergleiche mit Feldelementen</strong> im Worst-Case an (n = 2ⁱ).<br />
        <strong>b)</strong> Gib <Code>BinarySearch2(A, k)</Code> an, der höchstens <Code>{"⌈log₂ n⌉ + 1"}</Code>{" "}
        Feldvergleiche braucht. Nur Hilfsvariablen vom Typ <Code>int</Code> (keine vom Typ <Code>key</Code>). Begründe.
      </TaskStatement>

      <SubHead n="2" color={C.accent2}>Grundlagen von Null</SubHead>
      <Card>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 15, color: C.text }}>
          Die <strong>binäre Suche</strong> schaut in die Mitte des sortierten Feldes und verwirft jeweils die Hälfte, in
          der das Element nicht liegen kann.
        </p>
        <InfoBox title="Was als „Vergleich mit einem Feldelement“ zählt" tone={C.accent2}>
          <Code>{"A[m]==k"}</Code> <strong>und</strong> <Code>{"A[m]>k"}</Code> greifen beide auf <Code>A[m]</Code> zu →{" "}
          <strong>2 Vergleiche pro Aufruf</strong>. Der Test <Code>{"ℓ>r"}</Code> zählt <strong>nicht</strong> (kein
          Feldzugriff, nur int-Vergleich).
        </InfoBox>
      </Card>

      <SubHead n="3" color={C.accent2}>Lösung Schritt für Schritt</SubHead>
      <InfoBox title="a) Genaue Worst-Case-Vergleichszahl" tone={C.accent2}>
        Im Worst-Case (Element nicht vorhanden) reicht die Rekursion bis zu einem leeren Teilfeld. Anzahl der Aufrufe
        <em> mit Vergleichen</em> = Rekursionstiefe = <Code>{"log₂ n + 1"}</Code> (für n = 2ⁱ: i + 1). Pro solchem Aufruf
        2 Feldvergleiche (<Code>{"=="}</Code> schlägt fehl, dann <Code>{">"}</Code>). Der finale Aufruf mit{" "}
        <Code>{"ℓ>r"}</Code> macht 0 Feldvergleiche.
        <div style={{ marginTop: 10, padding: "10px 12px", background: C.good + "16", borderRadius: 9, color: C.text, fontWeight: 700 }}>
          → Genaue Anzahl: 2·(log₂ n + 1) = 2 log₂ n + 2 = 2(i + 1) Feldvergleiche.
        </div>
        <div style={{ color: C.textDim, fontSize: 13, marginTop: 8 }}>
          Kurzcheck: n=1 → 2, n=2 → 4, n=4 → 6, n=8 → 8, n=16 → 10.
        </div>
        <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.55 }}>
          <em>denn:</em> Weil <Code>{"m=⌊(ℓ+r)/2⌋"}</Code> abrundet, ist die rechte Hälfte die größere. Der Worst-Case
          läuft daher immer nach rechts und halbiert n = 2ⁱ exakt i-mal bis Größe 1, plus den leeren Aufruf.
        </div>
      </InfoBox>
      <Pseudo
        title="b) BinarySearch2 — Gleichheitstest aufgeschoben"
        lines={[
          "BinarySearch2(A, k)",
          "  ℓ := 1",
          "  r := A.length            // n",
          "  while ℓ < r do",
          "    m := ⌊(ℓ + r) / 2⌋",
          "    if A[m] < k then",
          "      ℓ := m + 1",
          "    else",
          "      r := m",
          "  return A[ℓ] == k          // einziger Gleichheitsvergleich",
        ]}
      />
      <InfoBox title="Begründung der Vergleichsanzahl" tone={C.good}>
        Die Schleife halbiert die Intervallgröße bei jedem Durchlauf von n auf 1 → genau <Code>{"⌈log₂ n⌉"}</Code>{" "}
        Durchläufe mit je <strong>einem</strong> Feldvergleich (<Code>{"A[m] < k"}</Code>). Danach bleibt genau ein
        Kandidat (<Code>ℓ = r</Code>), der mit <strong>einem</strong> <Code>{"A[ℓ] == k"}</Code> geprüft wird. Der
        Schleifenkopf <Code>{"ℓ < r"}</Code> ist ein int-Vergleich und zählt nicht. →{" "}
        <strong style={{ color: C.good }}>⌈log₂ n⌉ + 1</strong> Feldvergleiche — ungefähr die <strong>Hälfte</strong> von
        Teil a, weil pro Ebene nur noch ein statt zwei Feldvergleiche nötig sind.
      </InfoBox>

      <SubHead n="4" color={C.accent2}>Interaktive Visualisierung</SubHead>
      <BinarySearchVis />

      <SubHead n="5" color={C.accent2}>Verständnisaufgaben</SubHead>
      <QuizInput
        q="Wie viele Feldvergleiche braucht BinarySearch (Teil a) bei n = 16 im Worst-Case?"
        answers={["10"]}
        explain="2·(log₂ 16 + 1) = 2·(4+1) = 10. (Nicht 8 — der ℓ>r-Aufruf zählt nicht, aber jede der 5 Ebenen kostet 2 Feldvergleiche.)"
        placeholder="Zahl"
      />
      <Reveal q="Warum spart das Aufschieben des ==-Tests fast die Hälfte der Vergleiche?">
        Der ursprüngliche Algorithmus prüft auf jeder Ebene <em>zwei</em> Dinge am selben Element: „Bin ich schon da?“
        (<Code>{"=="}</Code>) und „In welche Richtung?“ (<Code>{">"}</Code>). Fast immer ist die Antwort auf die erste
        Frage „nein“ — der Test ist also meist verschwendet. BinarySearch2 stellt pro Ebene nur die Richtungsfrage
        (<Code>{"<"}</Code>) und schiebt die Gleichheitsfrage bis zum Schluss, wenn nur noch ein Kandidat übrig ist. So
        fällt pro Ebene ein Feldvergleich weg: aus 2 log₂ n + 2 wird ⌈log₂ n⌉ + 1.
      </Reveal>
      <QuizChoice
        q="Welche Art von Variable darf in BinarySearch2 NICHT vorkommen?"
        options={["Eine Variable vom Typ int", "Eine Variable vom Typ key", "Die Variablen ℓ und r", "Die Mitte m"]}
        correct={1}
        explain="Erlaubt sind nur int-Hilfsvariablen (ℓ, r, m). Eine Variable vom Typ key würde einen zusätzlichen, hier verbotenen Umgang mit Feldwerten bedeuten — gezählt werden ausschließlich Vergleiche mit Feldelementen."
      />
    </Section>
  );
}

function Aufgabe5() {
  return (
    <Section kicker="Aufgabe 5 · ⭐ Knobel-Bonus" title="Der tödliche Bocksbeutel" color={C.warn}>
      <SubHead n="1" color={C.warn}>Aufgabenstellung</SubHead>
      <TaskStatement>
        1000 Bocksbeutel, genau <strong>einer</strong> ist vergiftet. Das Gift ist tödlich (schon ein Tropfen) und wirkt
        erst <strong>nach einem Monat</strong>. Es stehen nur <strong>10 Vorkoster</strong> zur Verfügung. Erkläre, warum
        10 Vorkoster reichen, um innerhalb eines Monats den vergifteten Bocksbeutel zu bestimmen.
      </TaskStatement>

      <SubHead n="2" color={C.warn}>Lösung — Binärkodierung</SubHead>
      <Card>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 15, color: C.text }}>
          Nummeriere die Flaschen 0…999. Jede Zahl hat eine <strong>10-Bit-Darstellung</strong> (denn{" "}
          <Code>2¹⁰ = 1024 ≥ 1000</Code>). Ordne jedem Vorkoster ein Bit zu: Vorkoster j trinkt von <strong>jeder</strong>{" "}
          Flasche, deren Bit j eine 1 ist (eine Mischung). Nach einem Monat gilt: Vorkoster j stirbt ⇔ Bit j der
          vergifteten Flasche = 1. Das <strong>Muster der gestorbenen Vorkoster</strong> ist direkt die Binärzahl der
          vergifteten Flasche → ablesen, fertig.
        </p>
        <InfoBox title="Warum 10 genügen" tone={C.warn}>
          10 Vorkoster liefern <Code>2¹⁰ = 1024</Code> unterscheidbare Sterbe-Muster — mehr als die 1000 Flaschen. Es ist
          dasselbe Prinzip wie bei der binären Suche: jedes Bit halbiert die Menge der Verdächtigen.
        </InfoBox>
      </Card>

      <SubHead n="3" color={C.warn}>Interaktive Visualisierung</SubHead>
      <BocksbeutelVis />

      <SubHead n="4" color={C.warn}>Verständnisaufgabe</SubHead>
      <QuizInput
        q="Wie viele Vorkoster braucht man für 5000 Flaschen?"
        answers={["13"]}
        explain="13, denn 2¹³ = 8192 ≥ 5000, während 2¹² = 4096 < 5000 nicht reicht. Allgemein: ⌈log₂(Flaschenzahl)⌉."
        placeholder="Zahl"
      />
      <Reveal q="Was wäre, wenn das Gift sofort wirkte statt erst nach einem Monat?">
        Dann könnte man <em>sequenziell</em> testen und adaptiv reagieren — bräuchte aber mehr Zeit oder müsste anders
        vorgehen. Der Clou der Aufgabe ist gerade, dass alle Vorkoster <strong>gleichzeitig</strong> trinken müssen
        (das Ergebnis kommt erst nach einem Monat, ein zweiter Durchgang ist nicht möglich). Genau deshalb braucht man
        eine <em>nicht-adaptive</em> Strategie wie die Binärkodierung, die alle Informationen in einer einzigen Runde gewinnt.
      </Reveal>
    </Section>
  );
}

/* =========================================================
   HAUPTKOMPONENTE — Tab-Navigation
   ========================================================= */
const TABS = [
  { id: 1, label: "Aufgabe 1", sub: "Queue ↔ Stack", color: C.accent },
  { id: 2, label: "Aufgabe 2", sub: "Hashing", color: C.accent },
  { id: 3, label: "Aufgabe 3", sub: "Suchpfade", color: C.accent2 },
  { id: 4, label: "Aufgabe 4", sub: "BinarySearch", color: C.accent2 },
  { id: 5, label: "⭐ Aufgabe 5", sub: "Knobel-Bonus", color: C.warn },
];

export default function Uebung07() {
  const [tab, setTab] = useState(1);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: SANS,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes pop { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes tabIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        code { font-family: ${MONO}; }
        ::selection { background: ${C.accent}55; }
      `}</style>

      {/* HERO + Intro */}
      <header style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 24px" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.accent2,
            border: `1px solid ${C.accent2}55`,
            borderRadius: 999,
            padding: "5px 14px",
            marginBottom: 18,
          }}
        >
          Übung 07 · Theoretische Informatik II
        </div>
        <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -1 }}>
          Datenstrukturen, Hashing &amp;<br />das geschickte Suchen
        </h1>
        <p style={{ fontSize: 17, color: C.textDim, lineHeight: 1.65, maxWidth: 660, margin: 0 }}>
          Dieser Trainer deckt <strong style={{ color: C.text }}>Übung 07 komplett von Grund auf</strong> ab — ohne
          Vorwissen vorauszusetzen. Jeder Begriff (Stack, Queue, Hashtabelle, Kollision, Sondieren, BST, Suchpfad,
          binäre Suche) wird beim ersten Auftreten erklärt. Pro Aufgabe: Aufgabenstellung → Grundlagen → vollständige
          Herleitung → interaktive Visualisierung → Verständnisaufgaben. Klausur am 22.06.2026.
        </p>
      </header>

      {/* Tab-Leiste (sticky) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: `${C.bg}e8`,
          backdropFilter: "saturate(160%) blur(12px)",
          WebkitBackdropFilter: "saturate(160%) blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 32,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "10px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: "1 1 130px",
                  textAlign: "left",
                  background: on ? t.color + "1c" : C.panel,
                  border: `1px solid ${on ? t.color : C.border}`,
                  borderRadius: 11,
                  padding: "9px 13px",
                  cursor: "pointer",
                  transition: "background .2s, border-color .2s",
                }}
              >
                <div style={{ color: on ? t.color : C.text, fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 1 }}>{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inhalt */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div key={tab} style={{ animation: "tabIn .35s ease both" }}>
          {tab === 1 && <Aufgabe1 />}
          {tab === 2 && <Aufgabe2 />}
          {tab === 3 && <Aufgabe3 />}
          {tab === 4 && <Aufgabe4 />}
          {tab === 5 && <Aufgabe5 />}
        </div>

        {/* Glossar (immer sichtbar unter dem Tab-Inhalt) */}
        <Section kicker="Glossar" title="Alle Begriffe & Symbole kompakt">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            <GlossEntry term="FIFO / LIFO" def="Schlange (ältestes zuerst raus) / Stapel (zuletzt abgelegtes zuerst raus)." />
            <GlossEntry term="Enqueue / Dequeue" def="Einreihen / Entnehmen bei einer Schlange." />
            <GlossEntry term="Push / Pop / Top" def="Auflegen / Abnehmen / Oberstes ansehen bei einem Stapel." />
            <GlossEntry term="Hashtabelle T[0..15]" def="Feld der Größe m=16, in dem Schlüssel über eine Hashfunktion abgelegt werden." />
            <GlossEntry term="Hashfunktion h(k)" def="Bildet Schlüssel k auf einen Index ab. Hier h₀(k)=(3k+7) mod 16." />
            <GlossEntry term="mod (Modulo)" def="Rest bei ganzzahliger Division. mod 16 liefert immer 0..15." />
            <GlossEntry term="Kollision" def="Zwei verschiedene Schlüssel landen auf derselben Zelle." />
            <GlossEntry term="Sondieren (Probing)" def="Systematisches Suchen einer Ersatzzelle bei Kollision; i = Versuchszähler." />
            <GlossEntry term="Erfolgloser Test" def="Probe-Schritt, der eine belegte Zelle trifft." />
            <GlossEntry term="Teilerfremd" def="Ohne gemeinsamen Teiler > 1; nötig, damit doppeltes Hashing alle Zellen erreicht." />
            <GlossEntry term="BST" def="Binärer Suchbaum: links < Knoten < rechts." />
            <GlossEntry term="Suchpfad" def="Folge der bei einer Suche besuchten Knoten von der Wurzel abwärts." />
            <GlossEntry term="Intervall (low, high)" def="Erlaubter Wertebereich für den nächsten Knoten im Suchpfad." />
            <GlossEntry term="BinarySearch" def="Suche in sortiertem Feld durch wiederholtes Halbieren." />
            <GlossEntry term="log₂(n)" def="Wie oft man n halbieren kann, bis 1 übrig ist." />
            <GlossEntry term="⌊ ⌋ / ⌈ ⌉" def="Abrunden / Aufrunden auf die nächste ganze Zahl." />
            <GlossEntry term="Θ / O / Ω" def="Scharfe / obere / untere asymptotische Schranke der Laufzeit." />
            <GlossEntry term="Amortisiert" def="Über viele Operationen gemittelte Kosten, auch wenn einzelne teuer sind." />
          </div>
        </Section>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "28px 24px 48px",
          textAlign: "center",
          color: C.textDim,
          fontSize: 13,
        }}
      >
        Übung 07 · Theoretische Informatik II · Datenstrukturen, Hashing &amp; Suchen
        <br />
        Prof. Dr. Veronika Lesch · DHBW Mosbach
      </footer>
    </div>
  );
}
