import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * CountingSort-Trainer
 * Theoretische Informatik / Algorithmen & Komplexität – DHBW Mosbach
 *
 * Pseudocode 1:1 aus VL 09 (Sortieren in Linearzeit).
 * Felder: A (Eingabe, 1-basiert), C (Rechenfeld, 0..k), B (Ausgabe, 1-basiert).
 * Zeigt aktive Pseudocode-Zeile, die drei Phasen (Zählen / Präfixsumme /
 * Einsortieren) und alle Hilfsfelder live.
 *
 * Standalone JSX: nur React + Inline-Styles, keine externen Abhängigkeiten.
 */

const LINES = [
  { id: "cs_sig", text: "CountingSort(int[ ] A, int[ ] B, int k)", indent: 0 },
  { id: "cs_init", text: "sei C[0..k] = \u27E80, 0, \u2026, 0\u27E9 ein neues Feld", indent: 1 },
  { id: "cs_for1", text: "for j = 1 to A.length do  C[A[j]] = C[A[j]] + 1", indent: 1, cmt: "(1a)" },
  { id: "cs_for2", text: "for i = 1 to k do  C[i] = C[i] + C[i \u2212 1]", indent: 1, cmt: "(1b)" },
  { id: "cs_for3", text: "for j = A.length downto 1 do", indent: 1, cmt: "(2)" },
  { id: "cs_writeB", text: "B[C[A[j]]] = A[j]", indent: 2 },
  { id: "cs_decC", text: "C[A[j]] = C[A[j]] \u2212 1", indent: 2 },
];

function buildSteps(A, k) {
  const steps = [];
  const C = new Array(k + 1).fill(0);
  const B = new Array(A.length).fill(null); // 1-basiert, Index 0 ungenutzt-Darstellung über pos

  const snap = (s) =>
    steps.push({ C: C.slice(), B: B.slice(), ...s });

  snap({
    line: "cs_init",
    phase: "init",
    desc: `Lege Rechenfeld C[0..${k}] an, alle Eintr\u00e4ge 0. k = ${k} begrenzt das Universum {0,\u2026,${k}}.`,
  });

  // Phase 1a: zählen
  for (let j = 1; j <= A.length; j++) {
    const x = A[j - 1];
    C[x] = C[x] + 1;
    snap({
      line: "cs_for1",
      phase: "count",
      jA: j,
      cIdx: x,
      desc: `(1a) j = ${j}: A[${j}] = ${x}. Erh\u00f6he C[${x}] auf ${C[x]}. C z\u00e4hlt, wie oft jeder Wert vorkommt.`,
    });
  }

  // Phase 1b: Präfixsumme
  for (let i = 1; i <= k; i++) {
    C[i] = C[i] + C[i - 1];
    snap({
      line: "cs_for2",
      phase: "prefix",
      cIdx: i,
      cPrev: i - 1,
      desc: `(1b) i = ${i}: C[${i}] = C[${i}] + C[${i - 1}] = ${C[i]}. C[${i}] ist jetzt die Anzahl der Elemente \u2264 ${i}.`,
    });
  }

  // Phase 2: einsortieren (stabil, von hinten)
  for (let j = A.length; j >= 1; j--) {
    const x = A[j - 1];
    snap({
      line: "cs_for3",
      phase: "place",
      jA: j,
      cIdx: x,
      desc: `(2) j = ${j}: nimm A[${j}] = ${x}. Zielposition in B ist C[${x}] = ${C[x]}.`,
    });
    const target = C[x];
    B[target - 1] = x;
    snap({
      line: "cs_writeB",
      phase: "place",
      jA: j,
      cIdx: x,
      bWrote: target,
      desc: `B[C[${x}]] = B[${target}] = ${x}. Element an seine richtige Stelle in B geschrieben.`,
    });
    C[x] = C[x] - 1;
    snap({
      line: "cs_decC",
      phase: "place",
      jA: j,
      cIdx: x,
      bWrote: target,
      desc: `C[${x}] = C[${x}] \u2212 1 = ${C[x]}. N\u00e4chstes gleiches Element kommt eine Position davor \u2013 darum ist CountingSort stabil.`,
    });
  }

  snap({
    line: null,
    phase: "done",
    done: true,
    desc: `Fertig! Ausgabe B = [${B.join(", ")}] ist stabil sortiert. Laufzeit \u0398(n + k).`,
  });

  return steps;
}

const COL = {
  bg: "#0d1117", panel: "#161b22", panelAlt: "#1c2128", border: "#30363d",
  text: "#e6edf3", textDim: "#8b949e", accent: "#58a6ff", green: "#3fb950",
  amber: "#d29922", red: "#f85149", purple: "#bc8cff", highlight: "#1f6feb33",
};

export default function CountingSortTrainer() {
  const [inputText, setInputText] = useState("3, 0, 4, 1, 3, 4, 1, 4");
  const [committed, setCommitted] = useState([3, 0, 4, 1, 3, 4, 1, 4]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const k = useMemo(() => Math.max(0, ...committed), [committed]);
  const steps = useMemo(() => buildSteps(committed, k), [committed, k]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStepIdx((s) => s + 1), speed);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIdx, steps.length, speed]);

  const reset = () => { setStepIdx(0); setPlaying(false); };
  const applyInput = () => {
    const parsed = inputText.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
      .map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x <= 9);
    if (parsed.length >= 1 && parsed.length <= 12) { setCommitted(parsed); reset(); }
  };
  const randomize = () => {
    const n = 6 + Math.floor(Math.random() * 4);
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 6));
    setInputText(arr.join(", ")); setCommitted(arr); reset();
  };

  const atStart = stepIdx === 0;
  const atEnd = stepIdx >= steps.length - 1;

  return (
    <div style={styles.root}>
      <style>{`::selection{background:${COL.accent}55}`}</style>
      <header style={styles.header}>
        <div style={styles.kicker}>VL 09 · THEORETISCHE INFORMATIK</div>
        <h1 style={styles.title}>CountingSort — Schritt für Schritt</h1>
        <p style={styles.subtitle}>
          Nicht vergleichsbasiert: zählen statt vergleichen. Drei Phasen –
          Häufigkeiten zählen, Präfixsummen bilden, stabil von hinten
          einsortieren. Werte 0…9 erlaubt.
        </p>
      </header>

      <section style={styles.inputRow}>
        <input style={styles.input} value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="Werte 0–9, z. B. 3, 0, 4, 1, 3" />
        <button style={styles.btnGhost} onClick={applyInput}>Übernehmen</button>
        <button style={styles.btnGhost} onClick={randomize}>Zufall</button>
      </section>

      <PhaseBar phase={step.phase} />

      <FieldRow label="A" sub="Eingabe" arr={committed} oneBased
        highlight={step.jA} highlightColor={COL.accent} />

      <FieldRow label="C" sub={step.phase === "prefix" ? "Anz. ≤ x" : "Häufigkeit"}
        arr={step.C} zeroBased highlight={step.cIdx != null ? step.cIdx + 1 : null}
        prevHighlight={step.cPrev != null ? step.cPrev + 1 : null}
        highlightColor={COL.amber} />

      <FieldRow label="B" sub="Ausgabe" arr={step.B} oneBased
        highlight={step.bWrote} highlightColor={COL.green} placeholder="·" />

      <div style={styles.descBox}>
        <span style={styles.descBadge}>Schritt {stepIdx + 1} / {steps.length}</span>
        <span style={styles.descText}>{step.desc}</span>
      </div>

      <section style={{ marginBottom: 18 }}>
        <CodeBlock lines={LINES} activeLine={step.line} />
      </section>

      <Controls {...{ reset, atStart, atEnd, playing, setPlaying, setStepIdx, steps, speed, setSpeed }} />

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${(stepIdx / (steps.length - 1)) * 100}%` }} />
      </div>

      <footer style={styles.footer}>
        Pseudocode nach Prof. Dr. V. Lesch, DHBW Mosbach · Laufzeit Θ(n + k) ·
        stabil · Annahme: Arrays starten bei Index 0 (für C)
      </footer>
    </div>
  );
}

function PhaseBar({ phase }) {
  const phases = [
    { id: "count", label: "1a · Zählen" },
    { id: "prefix", label: "1b · Präfixsumme" },
    { id: "place", label: "2 · Einsortieren" },
  ];
  return (
    <div style={styles.phaseBar}>
      {phases.map((p) => {
        const active = phase === p.id;
        return (
          <div key={p.id} style={{ ...styles.phaseChip,
            background: active ? COL.accent : COL.panelAlt,
            color: active ? "#0d1117" : COL.textDim,
            fontWeight: active ? 700 : 400 }}>{p.label}</div>
        );
      })}
    </div>
  );
}

function FieldRow({ label, sub, arr, oneBased, zeroBased, highlight, prevHighlight, highlightColor, placeholder }) {
  return (
    <div style={styles.fieldRow}>
      <div style={styles.fieldLabel}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{label}</span>
        <span style={{ fontSize: 10, color: COL.textDim }}>{sub}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {arr.map((v, idx) => {
          const pos = zeroBased ? idx : idx + 1;
          const isHi = highlight === pos;
          const isPrev = prevHighlight === pos;
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ ...styles.fieldCell,
                borderColor: isHi ? highlightColor : isPrev ? COL.purple : COL.border,
                background: isHi ? `${highlightColor}22` : isPrev ? `${COL.purple}22` : COL.panel,
                color: v == null ? COL.textDim : COL.text }}>
                {v == null ? (placeholder || "") : v}
              </div>
              <span style={{ fontSize: 10, color: COL.textDim, marginTop: 3 }}>{pos}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CodeBlock({ lines, activeLine }) {
  return (
    <div style={styles.codeBlock}>
      <div style={styles.codeTitle}>CountingSort</div>
      <div style={styles.codeBody}>
        {lines.map((ln, i) => {
          const active = ln.id === activeLine;
          return (
            <div key={ln.id} style={{ ...styles.codeLine,
              background: active ? COL.highlight : "transparent",
              borderLeft: active ? `3px solid ${COL.accent}` : "3px solid transparent" }}>
              <span style={styles.lineNo}>{i + 1}</span>
              <span style={{ paddingLeft: ln.indent * 16 }}>{ln.text}</span>
              {ln.cmt && <span style={{ marginLeft: "auto", paddingLeft: 12, color: COL.textDim, fontSize: 11 }}>{ln.cmt}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Controls({ reset, atStart, atEnd, playing, setPlaying, setStepIdx, steps, speed, setSpeed }) {
  return (
    <section style={styles.controls}>
      <button style={styles.btn} onClick={reset} disabled={atStart}>⏮ Anfang</button>
      <button style={styles.btn} onClick={() => setStepIdx((s) => Math.max(0, s - 1))} disabled={atStart}>‹ Zurück</button>
      <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { if (atEnd) reset(); else setPlaying((p) => !p); }}>
        {atEnd ? "↻ Neu" : playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button style={styles.btn} onClick={() => setStepIdx((s) => Math.min(steps.length - 1, s + 1))} disabled={atEnd}>Weiter ›</button>
      <div style={styles.speedWrap}>
        <span style={styles.speedLabel}>Tempo</span>
        <input type="range" min="300" max="1600" step="100" value={1900 - speed}
          onChange={(e) => setSpeed(1900 - Number(e.target.value))} style={styles.range} />
      </div>
    </section>
  );
}

const styles = {
  root: { fontFamily: "'SF Mono','JetBrains Mono','Fira Code',ui-monospace,monospace", background: COL.bg, color: COL.text, padding: "28px 24px", borderRadius: 16, maxWidth: 920, margin: "0 auto", border: `1px solid ${COL.border}` },
  header: { marginBottom: 22 },
  kicker: { color: COL.green, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 8 },
  title: { fontFamily: "Georgia,'Times New Roman',serif", fontSize: 30, margin: "0 0 10px", fontWeight: 700, letterSpacing: -0.5 },
  subtitle: { color: COL.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 },
  inputRow: { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" },
  input: { flex: 1, minWidth: 200, background: COL.panel, border: `1px solid ${COL.border}`, borderRadius: 8, color: COL.text, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" },
  phaseBar: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" },
  phaseChip: { padding: "6px 14px", borderRadius: 20, fontSize: 12, transition: "all 0.25s" },
  fieldRow: { display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 },
  fieldLabel: { display: "flex", flexDirection: "column", width: 60, paddingTop: 6 },
  fieldCell: { minWidth: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", borderRadius: 8, fontSize: 15, fontWeight: 700, transition: "all 0.2s" },
  descBox: { background: COL.panel, border: `1px solid ${COL.border}`, borderRadius: 10, padding: "14px 16px", margin: "8px 0 16px", display: "flex", gap: 12, alignItems: "flex-start", minHeight: 48 },
  descBadge: { background: COL.accent, color: "#0d1117", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 },
  descText: { fontSize: 14, lineHeight: 1.55 },
  codeBlock: { background: COL.panel, border: `1px solid ${COL.border}`, borderRadius: 10, overflow: "hidden" },
  codeTitle: { background: COL.panelAlt, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: COL.accent, borderBottom: `1px solid ${COL.border}`, letterSpacing: 1 },
  codeBody: { padding: "8px 0" },
  codeLine: { display: "flex", alignItems: "center", fontSize: 12.5, padding: "3px 12px 3px 0", lineHeight: 1.7, transition: "background 0.15s" },
  lineNo: { width: 28, textAlign: "right", color: COL.textDim, fontSize: 11, marginRight: 10, flexShrink: 0, userSelect: "none" },
  controls: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 },
  btn: { background: COL.panelAlt, border: `1px solid ${COL.border}`, color: COL.text, padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary: { background: COL.accent, color: "#0d1117", border: "none", fontWeight: 700 },
  btnGhost: { background: "transparent", border: `1px solid ${COL.border}`, color: COL.textDim, padding: "10px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  speedWrap: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  speedLabel: { fontSize: 12, color: COL.textDim },
  range: { accentColor: COL.accent, cursor: "pointer" },
  progressTrack: { height: 4, background: COL.panelAlt, borderRadius: 4, overflow: "hidden", marginBottom: 18 },
  progressFill: { height: "100%", background: COL.green, transition: "width 0.2s" },
  footer: { fontSize: 11, color: COL.textDim, textAlign: "center", lineHeight: 1.6, borderTop: `1px solid ${COL.border}`, paddingTop: 14 },
};