import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * QuickSort-Trainer
 * Theoretische Informatik / Algorithmen & Komplexität – DHBW Mosbach
 *
 * Interaktiver Schritt-für-Schritt-Trainer für QuickSort + Partition.
 * Pseudocode 1:1 aus VL 08 (QuickSort). Zeigt aktive Zeile, Pivot, die
 * Zeiger i/j, die Partition-Schleifeninvariante und die Rekursion.
 *
 * Standalone JSX: nur React + Inline-Styles, keine externen Abhängigkeiten.
 */

const QUICKSORT_LINES = [
  { id: "qs_sig", text: "QuickSort(A, \u2113 = 1, r = A.length)", indent: 0 },
  { id: "qs_if", text: "if \u2113 < r then", indent: 1 },
  { id: "qs_part", text: "m = Partition(A, \u2113, r)", indent: 2 },
  { id: "qs_recL", text: "QuickSort(A, \u2113, m \u2212 1)", indent: 2 },
  { id: "qs_recR", text: "QuickSort(A, m + 1, r)", indent: 2 },
];

const PARTITION_LINES = [
  { id: "pt_sig", text: "int Partition(int[ ] A, int \u2113, int r)", indent: 0 },
  { id: "pt_piv", text: "pivot = A[r]", indent: 1 },
  { id: "pt_i", text: "i = \u2113", indent: 1 },
  { id: "pt_for", text: "for j = \u2113 to r \u2212 1 do", indent: 1 },
  { id: "pt_cmp", text: "if A[j] \u2264 pivot then", indent: 2 },
  { id: "pt_swap", text: "Swap(A, i, j)", indent: 3 },
  { id: "pt_inc", text: "i = i + 1", indent: 3 },
  { id: "pt_swapr", text: "Swap(A, i, r)", indent: 1 },
  { id: "pt_ret", text: "return i", indent: 1 },
];

function buildSteps(input) {
  const A = input.slice();
  const steps = [];

  const push = (s) => steps.push({ array: A.slice(), ...s });

  function quickSort(l, r, depth) {
    push({
      proc: "qs",
      line: "qs_sig",
      range: [l, r],
      depth,
      desc: `Aufruf QuickSort(A, ${l}, ${r}) \u2013 Teil-Array A[${l}..${r}] = [${A.slice(l - 1, r).join(", ")}].`,
    });
    push({
      proc: "qs",
      line: "qs_if",
      range: [l, r],
      depth,
      desc:
        l < r
          ? `\u2113 < r erf\u00fcllt (${l} < ${r}) \u2013 partitioniere.`
          : `\u2113 < r NICHT erf\u00fcllt (${l} \u2265 ${r}) \u2013 Teil-Array hat \u2264 1 Element, nichts zu tun.`,
    });
    if (l >= r) return;

    push({
      proc: "qs",
      line: "qs_part",
      range: [l, r],
      depth,
      desc: `Rufe Partition(A, ${l}, ${r}) auf. Liefert die endg\u00fcltige Pivot-Position m zur\u00fcck.`,
    });
    const m = partition(l, r, depth);

    push({
      proc: "qs",
      line: "qs_recL",
      range: [l, r],
      pivotPos: m,
      depth,
      desc: `Partition fertig: Pivot steht auf Position ${m}. Rekursion links: QuickSort(A, ${l}, ${m - 1}).`,
    });
    quickSort(l, m - 1, depth + 1);

    push({
      proc: "qs",
      line: "qs_recR",
      range: [l, r],
      pivotPos: m,
      depth,
      desc: `Rekursion rechts: QuickSort(A, ${m + 1}, ${r}).`,
    });
    quickSort(m + 1, r, depth + 1);
  }

  function partition(l, r, depth) {
    const pivot = A[r - 1];
    push({
      proc: "pt",
      line: "pt_piv",
      range: [l, r],
      depth,
      pivotIdx: r,
      pivot,
      desc: `pivot = A[${r}] = ${pivot}. Das letzte Element ist der Pivot.`,
    });
    let i = l;
    push({
      proc: "pt",
      line: "pt_i",
      range: [l, r],
      depth,
      pivotIdx: r,
      pivot,
      iPtr: i,
      desc: `i = \u2113 = ${l}. i markiert die Grenze: links von i steht alles \u2264 pivot.`,
    });

    for (let j = l; j <= r - 1; j++) {
      push({
        proc: "pt",
        line: "pt_for",
        range: [l, r],
        depth,
        pivotIdx: r,
        pivot,
        iPtr: i,
        jPtr: j,
        desc: `Schleife j = ${j}. Vergleiche A[${j}] mit dem Pivot.`,
      });
      const aj = A[j - 1];
      const cond = aj <= pivot;
      push({
        proc: "pt",
        line: "pt_cmp",
        range: [l, r],
        depth,
        pivotIdx: r,
        pivot,
        iPtr: i,
        jPtr: j,
        desc: `A[${j}] = ${aj} \u2264 pivot = ${pivot}? \u2192 ${cond ? "ja" : "nein"}.`,
      });
      if (cond) {
        push({
          proc: "pt",
          line: "pt_swap",
          range: [l, r],
          depth,
          pivotIdx: r,
          pivot,
          iPtr: i,
          jPtr: j,
          swap: [i, j],
          desc:
            i === j
              ? `Swap(A, ${i}, ${j}) \u2013 i und j gleich, kein echter Tausch.`
              : `Swap(A, ${i}, ${j}): tausche A[${i}]=${A[i - 1]} \u2194 A[${j}]=${A[j - 1]}.`,
        });
        const tmp = A[i - 1];
        A[i - 1] = A[j - 1];
        A[j - 1] = tmp;
        i++;
        push({
          proc: "pt",
          line: "pt_inc",
          range: [l, r],
          depth,
          pivotIdx: r,
          pivot,
          iPtr: i,
          jPtr: j,
          desc: `i = i + 1 = ${i}. Der \u201e\u2264 pivot\u201c-Bereich ist um eins gewachsen.`,
        });
      }
    }
    push({
      proc: "pt",
      line: "pt_swapr",
      range: [l, r],
      depth,
      pivotIdx: r,
      pivot,
      iPtr: i,
      swap: [i, r],
      desc: `Swap(A, ${i}, ${r}): Pivot an seine endg\u00fcltige Position ${i} tauschen.`,
    });
    const tmp = A[i - 1];
    A[i - 1] = A[r - 1];
    A[r - 1] = tmp;
    push({
      proc: "pt",
      line: "pt_ret",
      range: [l, r],
      depth,
      pivotPos: i,
      desc: `return i = ${i}. Links davon alles \u2264 pivot, rechts alles > pivot.`,
    });
    return i;
  }

  push({
    proc: "qs",
    line: null,
    range: [1, A.length],
    depth: 0,
    desc: "Start: QuickSort(A, 1, A.length) auf dem ganzen Array.",
  });
  quickSort(1, A.length, 0);
  push({
    proc: "done",
    line: null,
    range: [1, A.length],
    depth: 0,
    done: true,
    desc: `Fertig! Array vollst\u00e4ndig sortiert: [${A.join(", ")}].`,
  });
  return steps;
}

const C = {
  bg: "#0d1117",
  panel: "#161b22",
  panelAlt: "#1c2128",
  border: "#30363d",
  text: "#e6edf3",
  textDim: "#8b949e",
  accent: "#58a6ff",
  green: "#3fb950",
  amber: "#d29922",
  red: "#f85149",
  purple: "#bc8cff",
  highlight: "#1f6feb33",
};

export default function QuickSortTrainer() {
  const [inputText, setInputText] = useState("5, 6, 4, 1, 2, 3, 7");
  const [committed, setCommitted] = useState([5, 6, 4, 1, 2, 3, 7]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const steps = useMemo(() => buildSteps(committed), [committed]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setStepIdx((s) => s + 1), speed);
    return () => clearTimeout(timerRef.current);
  }, [playing, stepIdx, steps.length, speed]);

  const reset = () => {
    setStepIdx(0);
    setPlaying(false);
  };
  const applyInput = () => {
    const parsed = inputText
      .split(/[,\s]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number)
      .filter((x) => !Number.isNaN(x));
    if (parsed.length >= 1 && parsed.length <= 14) {
      setCommitted(parsed);
      reset();
    }
  };
  const randomize = () => {
    const n = 6 + Math.floor(Math.random() * 4);
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 50));
    setInputText(arr.join(", "));
    setCommitted(arr);
    reset();
  };

  const atStart = stepIdx === 0;
  const atEnd = stepIdx >= steps.length - 1;

  return (
    <div style={styles.root}>
      <style>{`::selection{background:${C.accent}55}`}</style>
      <header style={styles.header}>
        <div style={styles.kicker}>VL 08 · THEORETISCHE INFORMATIK</div>
        <h1 style={styles.title}>QuickSort — Schritt für Schritt</h1>
        <p style={styles.subtitle}>
          Teile &amp; Herrsche in situ: Partition wählt einen Pivot und sortiert
          alles Kleinere nach links, alles Größere nach rechts. Beobachte die
          Zeiger i und j und die Partition-Invariante.
        </p>
      </header>

      <section style={styles.inputRow}>
        <input
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="z. B. 5, 6, 4, 1, 2, 3, 7"
        />
        <button style={styles.btnGhost} onClick={applyInput}>Übernehmen</button>
        <button style={styles.btnGhost} onClick={randomize}>Zufall</button>
      </section>

      <ArrayView step={step} />

      <div style={styles.descBox}>
        <span style={styles.descBadge}>Schritt {stepIdx + 1} / {steps.length}</span>
        <span style={styles.descText}>{step.desc}</span>
      </div>

      {(step.proc === "pt" || step.pivot != null) && step.pivot != null && (
        <div style={styles.invBox}>
          <span style={{ color: C.green }}>■ ≤ pivot (k = ℓ…i−1)</span>
          <span style={{ color: C.amber }}>■ &gt; pivot (k = i…j−1)</span>
          <span style={{ color: C.textDim }}>□ noch unbearbeitet</span>
          <span style={{ color: C.red }}>■ pivot = A[r]</span>
        </div>
      )}

      <section style={styles.codeGrid}>
        <CodeBlock
          title="QuickSort"
          lines={QUICKSORT_LINES}
          activeLine={step.proc === "qs" ? step.line : null}
          dimmed={step.proc === "pt"}
        />
        <CodeBlock
          title="Partition"
          lines={PARTITION_LINES}
          activeLine={step.proc === "pt" ? step.line : null}
          dimmed={step.proc === "qs"}
        />
      </section>

      <Controls
        {...{ reset, atStart, atEnd, playing, setPlaying, setStepIdx, steps, speed, setSpeed }}
      />

      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${(stepIdx / (steps.length - 1)) * 100}%` }} />
      </div>

      <footer style={styles.footer}>
        Pseudocode nach Prof. Dr. V. Lesch, DHBW Mosbach · Partition braucht
        immer r − ℓ Vergleiche · Best/Average Θ(n log n), Worst Θ(n²)
      </footer>
    </div>
  );
}

function ArrayView({ step }) {
  const { array, range, pivotIdx, iPtr, jPtr, swap, pivotPos } = step;
  return (
    <div style={styles.arrayWrap}>
      {array.map((v, idx) => {
        const pos = idx + 1;
        const inRange = range && pos >= range[0] && pos <= range[1];
        const isPivot = pivotIdx === pos;
        const isPivotPos = pivotPos === pos;
        const inSwap = swap && (swap[0] === pos || swap[1] === pos);
        // Partition-Bereiche relativ zu i/j
        let bg = C.panelAlt, bd = C.border, col = C.text;
        if (inRange) { bg = "#1a2230"; bd = "#2d3b52"; }
        if (iPtr != null && jPtr != null && range) {
          if (pos >= range[0] && pos <= iPtr - 1) { bg = "#10331c"; bd = C.green; }
          else if (pos >= iPtr && pos <= jPtr - 1) { bg = "#33270a"; bd = C.amber; }
        }
        if (isPivot) { bg = "#3a1416"; bd = C.red; }
        if (isPivotPos) { bg = "#3a1416"; bd = C.red; }
        if (inSwap) { bg = `${C.accent}33`; bd = C.accent; }
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ ...styles.cell, background: bg, borderColor: bd, color: col,
              transform: inSwap ? "translateY(-4px)" : "none" }}>{v}</div>
            <div style={styles.idxLabel}>
              <span style={{ color: C.textDim }}>{pos}</span>
              <div style={styles.ptrRow}>
                {iPtr === pos && <span style={{ color: C.green }}>i</span>}
                {jPtr === pos && <span style={{ color: C.amber }}>j</span>}
                {isPivot && <span style={{ color: C.red }}>r</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ title, lines, activeLine, dimmed }) {
  return (
    <div style={{ ...styles.codeBlock, opacity: dimmed ? 0.4 : 1 }}>
      <div style={styles.codeTitle}>{title}</div>
      <div style={styles.codeBody}>
        {lines.map((ln, i) => {
          const active = ln.id === activeLine;
          return (
            <div key={ln.id} style={{ ...styles.codeLine,
              background: active ? C.highlight : "transparent",
              borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent" }}>
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
  root: { fontFamily: "'SF Mono','JetBrains Mono','Fira Code',ui-monospace,monospace", background: C.bg, color: C.text, padding: "28px 24px", borderRadius: 16, maxWidth: 920, margin: "0 auto", border: `1px solid ${C.border}` },
  header: { marginBottom: 22 },
  kicker: { color: C.green, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 8 },
  title: { fontFamily: "Georgia,'Times New Roman',serif", fontSize: 30, margin: "0 0 10px", fontWeight: 700, letterSpacing: -0.5 },
  subtitle: { color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 },
  inputRow: { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" },
  input: { flex: 1, minWidth: 200, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" },
  arrayWrap: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", padding: "20px 0 8px", minHeight: 80 },
  cell: { width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid", borderRadius: 10, fontSize: 17, fontWeight: 700, transition: "all 0.25s ease" },
  idxLabel: { fontSize: 11, marginTop: 5, textAlign: "center", minHeight: 28 },
  ptrRow: { display: "flex", gap: 4, justifyContent: "center", fontWeight: 700, marginTop: 2 },
  descBox: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", margin: "16px 0", display: "flex", gap: 12, alignItems: "flex-start", minHeight: 48 },
  descBadge: { background: C.accent, color: "#0d1117", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 },
  descText: { fontSize: 14, lineHeight: 1.55 },
  invBox: { display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, marginBottom: 16, padding: "10px 14px", background: C.panelAlt, borderRadius: 8, border: `1px solid ${C.border}` },
  codeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 },
  codeBlock: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", transition: "opacity 0.3s" },
  codeTitle: { background: C.panelAlt, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: C.accent, borderBottom: `1px solid ${C.border}`, letterSpacing: 1 },
  codeBody: { padding: "8px 0" },
  codeLine: { display: "flex", alignItems: "center", fontSize: 12.5, padding: "2px 12px 2px 0", lineHeight: 1.7, transition: "background 0.15s" },
  lineNo: { width: 28, textAlign: "right", color: C.textDim, fontSize: 11, marginRight: 10, flexShrink: 0, userSelect: "none" },
  controls: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 },
  btn: { background: C.panelAlt, border: `1px solid ${C.border}`, color: C.text, padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  btnPrimary: { background: C.accent, color: "#0d1117", border: "none", fontWeight: 700 },
  btnGhost: { background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, padding: "10px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  speedWrap: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  speedLabel: { fontSize: 12, color: C.textDim },
  range: { accentColor: C.accent, cursor: "pointer" },
  progressTrack: { height: 4, background: C.panelAlt, borderRadius: 4, overflow: "hidden", marginBottom: 18 },
  progressFill: { height: "100%", background: C.green, transition: "width 0.2s" },
  footer: { fontSize: 11, color: C.textDim, textAlign: "center", lineHeight: 1.6, borderTop: `1px solid ${C.border}`, paddingTop: 14 },
};