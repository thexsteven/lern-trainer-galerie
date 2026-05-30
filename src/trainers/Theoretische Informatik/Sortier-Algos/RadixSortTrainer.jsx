import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * RadixSort-Trainer
 * Theoretische Informatik / Algorithmen & Komplexität – DHBW Mosbach
 *
 * Pseudocode 1:1 aus VL 09 (Sortieren in Linearzeit):
 *   RadixSort(A, s)
 *     for i = 1 to s do
 *       sortiere A stabil nach der i-ten Stelle
 *
 * Zeigt die stabile stellenweise Sortierung (von niederwertigster Stelle),
 * mit Buckets 0–9 pro Durchlauf, aktiver Pseudocode-Zeile und Erklärung.
 *
 * Standalone JSX: nur React + Inline-Styles, keine externen Abhängigkeiten.
 */

const LINES = [
  { id: "rs_sig", text: "RadixSort(A, s)", indent: 0 },
  { id: "rs_for", text: "for i = 1 to s do", indent: 1 },
  { id: "rs_sort", text: "sortiere A stabil nach der i-ten Stelle", indent: 2 },
];

// i-te Stelle (1 = niederwertigste) einer Zahl extrahieren
function digit(num, i) {
  return Math.floor(num / Math.pow(10, i - 1)) % 10;
}

function buildSteps(input, s) {
  const A = input.slice();
  const steps = [];
  const snap = (st) => steps.push({ array: A.slice(), ...st });

  snap({
    line: "rs_sig",
    desc: `Start RadixSort(A, s=${s}). Sortiere ${s} Mal stabil, von der niederwertigsten Stelle (Einer) zur h\u00f6chsten.`,
    pass: 0,
  });

  for (let i = 1; i <= s; i++) {
    const stelle = i === 1 ? "Einer" : i === 2 ? "Zehner" : i === 3 ? "Hunderter" : `${i}.`;
    snap({
      line: "rs_for",
      desc: `Durchlauf i = ${i}: sortiere stabil nach der ${i}. Stelle (${stelle}). Aktuelles A = [${A.join(", ")}].`,
      pass: i,
      activeDigit: i,
    });

    // Verteilen in 10 Buckets (stabil = Reihenfolge erhalten)
    const buckets = Array.from({ length: 10 }, () => []);
    A.forEach((num) => buckets[digit(num, i)].push(num));

    snap({
      line: "rs_sort",
      desc: `Verteile jede Zahl nach ihrer ${i}. Stelle in Eimer 0\u20139. Innerhalb eines Eimers bleibt die alte Reihenfolge erhalten (stabil!).`,
      pass: i,
      activeDigit: i,
      buckets: buckets.map((b) => b.slice()),
    });

    // Einsammeln
    let idx = 0;
    for (let d = 0; d < 10; d++) {
      for (const num of buckets[d]) {
        A[idx++] = num;
      }
    }
    snap({
      line: "rs_sort",
      desc: `Sammle die Eimer 0\u21929 der Reihe nach ein \u2192 A = [${A.join(", ")}]. Nach ${i} Durchlauf/Durchl\u00e4ufen sind die letzten ${i} Stelle(n) korrekt sortiert.`,
      pass: i,
      activeDigit: i,
      collected: true,
    });
  }

  snap({
    line: null,
    done: true,
    desc: `Fertig! A = [${A.join(", ")}] vollst\u00e4ndig sortiert. Laufzeit O(s\u00b7(n + b)) mit Basis b = 10.`,
    pass: s,
  });
  return steps;
}

const COL = {
  bg: "#0d1117", panel: "#161b22", panelAlt: "#1c2128", border: "#30363d",
  text: "#e6edf3", textDim: "#8b949e", accent: "#58a6ff", green: "#3fb950",
  amber: "#d29922", red: "#f85149", purple: "#bc8cff", highlight: "#1f6feb33",
};

export default function RadixSortTrainer() {
  const [inputText, setInputText] = useState("25, 13, 31, 23, 11, 37, 15");
  const [committed, setCommitted] = useState([25, 13, 31, 23, 11, 37, 15]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const timerRef = useRef(null);

  const s = useMemo(() => {
    const max = Math.max(0, ...committed);
    return Math.max(1, String(max).length);
  }, [committed]);
  const steps = useMemo(() => buildSteps(committed, s), [committed, s]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    timerRef.current = setTimeout(() => setStepIdx((x) => x + 1), speed);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIdx, steps.length, speed]);

  const reset = () => { setStepIdx(0); setPlaying(false); };
  const applyInput = () => {
    const parsed = inputText.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
      .map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x <= 999);
    if (parsed.length >= 1 && parsed.length <= 12) { setCommitted(parsed); reset(); }
  };
  const randomize = () => {
    const n = 6 + Math.floor(Math.random() * 3);
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10);
    setInputText(arr.join(", ")); setCommitted(arr); reset();
  };

  const atStart = stepIdx === 0;
  const atEnd = stepIdx >= steps.length - 1;

  return (
    <div style={styles.root}>
      <style>{`::selection{background:${COL.accent}55}`}</style>
      <header style={styles.header}>
        <div style={styles.kicker}>VL 09 · THEORETISCHE INFORMATIK</div>
        <h1 style={styles.title}>RadixSort — Schritt für Schritt</h1>
        <p style={styles.subtitle}>
          Stellenweise sortieren: erst nach Einern, dann (stabil!) nach Zehnern,
          usw. Der Trick ist die Stabilität – sie bewahrt die Ordnung der
          niederwertigeren Stellen. Werte 0–999.
        </p>
      </header>

      <section style={styles.inputRow}>
        <input style={styles.input} value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="z. B. 25, 13, 31, 23, 11" />
        <button style={styles.btnGhost} onClick={applyInput}>Übernehmen</button>
        <button style={styles.btnGhost} onClick={randomize}>Zufall</button>
      </section>

      <div style={styles.passInfo}>
        Durchlauf <strong style={{ color: COL.accent }}>{Math.min(step.pass, s)}</strong> von {s}
        {step.activeDigit && (
          <span style={{ color: COL.textDim, marginLeft: 10 }}>
            · aktive Stelle: {step.activeDigit === 1 ? "Einer" : step.activeDigit === 2 ? "Zehner" : "Hunderter"}
          </span>
        )}
      </div>

      <ArrayView step={step} />

      {step.buckets && <Buckets buckets={step.buckets} activeDigit={step.activeDigit} />}

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
        Pseudocode nach Prof. Dr. V. Lesch, DHBW Mosbach · s = Anzahl Stellen,
        b = Basis · Laufzeit O(s·(n + b)) · setzt stabiles Sortieren voraus
      </footer>
    </div>
  );
}

function ArrayView({ step }) {
  const { array, activeDigit, collected } = step;
  return (
    <div style={styles.arrayWrap}>
      {array.map((v, idx) => {
        const d = activeDigit ? digit(v, activeDigit) : null;
        const str = String(v);
        return (
          <div key={idx} style={{ ...styles.cell,
            borderColor: collected ? COL.green : COL.border,
            background: collected ? "#10331c" : COL.panelAlt }}>
            {activeDigit ? (
              <span>
                {str.slice(0, str.length - activeDigit)}
                <span style={{ color: COL.amber, textDecoration: "underline" }}>
                  {str.slice(str.length - activeDigit, str.length - activeDigit + 1) || "0"}
                </span>
                {str.slice(str.length - activeDigit + 1)}
              </span>
            ) : v}
          </div>
        );
      })}
    </div>
  );
}

function Buckets({ buckets, activeDigit }) {
  return (
    <div style={styles.bucketGrid}>
      {buckets.map((b, d) => (
        <div key={d} style={styles.bucketCol}>
          <div style={styles.bucketHead}>{d}</div>
          <div style={styles.bucketBody}>
            {b.length === 0 ? (
              <span style={{ color: COL.textDim, fontSize: 12 }}>/</span>
            ) : (
              b.map((num, i) => (
                <div key={i} style={styles.bucketItem}>{num}</div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ lines, activeLine }) {
  return (
    <div style={styles.codeBlock}>
      <div style={styles.codeTitle}>RadixSort</div>
      <div style={styles.codeBody}>
        {lines.map((ln, i) => {
          const active = ln.id === activeLine;
          return (
            <div key={ln.id} style={{ ...styles.codeLine,
              background: active ? COL.highlight : "transparent",
              borderLeft: active ? `3px solid ${COL.accent}` : "3px solid transparent" }}>
              <span style={styles.lineNo}>{i + 1}</span>
              <span style={{ paddingLeft: ln.indent * 16 }}>{ln.text}</span>
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
      <button style={styles.btn} onClick={() => setStepIdx((x) => Math.max(0, x - 1))} disabled={atStart}>‹ Zurück</button>
      <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => { if (atEnd) reset(); else setPlaying((p) => !p); }}>
        {atEnd ? "↻ Neu" : playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button style={styles.btn} onClick={() => setStepIdx((x) => Math.min(steps.length - 1, x + 1))} disabled={atEnd}>Weiter ›</button>
      <div style={styles.speedWrap}>
        <span style={styles.speedLabel}>Tempo</span>
        <input type="range" min="300" max="1700" step="100" value={2000 - speed}
          onChange={(e) => setSpeed(2000 - Number(e.target.value))} style={styles.range} />
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
  passInfo: { fontSize: 13, marginBottom: 12, color: COL.text },
  arrayWrap: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", padding: "8px 0", minHeight: 60 },
  cell: { minWidth: 46, height: 46, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", borderRadius: 10, fontSize: 16, fontWeight: 700, transition: "all 0.25s ease" },
  bucketGrid: { display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5, margin: "16px 0", background: COL.panelAlt, padding: 12, borderRadius: 10, border: `1px solid ${COL.border}` },
  bucketCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5 },
  bucketHead: { fontSize: 12, fontWeight: 700, color: COL.amber, width: "100%", textAlign: "center", borderBottom: `1px solid ${COL.border}`, paddingBottom: 3 },
  bucketBody: { display: "flex", flexDirection: "column", gap: 4, minHeight: 28, alignItems: "center" },
  bucketItem: { background: COL.panel, border: `1px solid ${COL.accent}`, borderRadius: 5, fontSize: 12, padding: "2px 5px", color: COL.text, fontWeight: 600 },
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
};a