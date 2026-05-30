import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * MergeSort-Trainer
 * Theoretische Informatik / Algorithmen & Komplexität – DHBW Mosbach
 *
 * Interaktiver Schritt-für-Schritt-Trainer für MergeSort + Merge.
 * Pseudocode 1:1 aus VL 02 (Sortieren 2). Zeigt aktive Pseudocode-Zeile,
 * Erklärung pro Schritt, Rekursionsbaum und Merge-Hilfsarrays L/R.
 *
 * Standalone JSX: nur React + Inline-Styles, keine externen Abhängigkeiten.
 */

// ---------------------------------------------------------------------------
// Pseudocode (1:1 aus der Vorlesung), Zeilen einzeln adressierbar
// ---------------------------------------------------------------------------
const MERGESORT_LINES = [
  { id: "ms_sig", text: "MergeSort(int[ ] A, int \u2113 = 1, int r = A.length)", indent: 0 },
  { id: "ms_if", text: "if \u2113 < r then", indent: 1 },
  { id: "ms_m", text: "m = \u230A(\u2113 + r)/2\u230B", indent: 2, tag: "teile" },
  { id: "ms_recL", text: "MergeSort(A, \u2113, m)", indent: 2, tag: "herrsche" },
  { id: "ms_recR", text: "MergeSort(A, m + 1, r)", indent: 2, tag: "herrsche" },
  { id: "ms_merge", text: "Merge(A, \u2113, m, r)", indent: 2, tag: "kombiniere" },
];

const MERGE_LINES = [
  { id: "mg_sig", text: "Merge(int[ ] A, int \u2113, int m, int r)", indent: 0 },
  { id: "mg_n", text: "n\u2081 = m \u2212 \u2113 + 1;  n\u2082 = r \u2212 m", indent: 1 },
  { id: "mg_alloc", text: "lege L[1..n\u2081+1] und R[1..n\u2082+1] an", indent: 1 },
  { id: "mg_copyL", text: "L[1..n\u2081] = A[\u2113..m]", indent: 1 },
  { id: "mg_copyR", text: "R[1..n\u2082] = A[m+1..r]", indent: 1 },
  { id: "mg_inf", text: "L[n\u2081+1] = R[n\u2082+1] = \u221E", indent: 1 },
  { id: "mg_ij", text: "i = j = 1", indent: 1 },
  { id: "mg_for", text: "for k = \u2113 to r do", indent: 1 },
  { id: "mg_cmp", text: "if L[i] \u2264 R[j] then", indent: 2 },
  { id: "mg_takeL", text: "A[k] = L[i];  i = i + 1", indent: 3 },
  { id: "mg_else", text: "else", indent: 2 },
  { id: "mg_takeR", text: "A[k] = R[j];  j = j + 1", indent: 3 },
];

// ---------------------------------------------------------------------------
// Step-Generator: erzeugt die komplette Schrittliste für ein Eingabe-Array
// ---------------------------------------------------------------------------
function buildSteps(input) {
  const A = input.slice();
  const steps = [];
  let nodeCounter = 0;

  // Snapshot-Helfer: kopiert den aktuellen Array-Zustand in den Step
  const push = (s) => {
    steps.push({
      array: A.slice(),
      ...s,
    });
  };

  // l, r sind 1-basiert (wie in der VL); Array intern 0-basiert
  function mergeSort(l, r, depth, nodeId) {
    push({
      proc: "ms",
      line: "ms_sig",
      range: [l, r],
      depth,
      nodeId,
      desc: `Aufruf MergeSort(A, ${l}, ${r}) \u2013 Teil-Array A[${l}..${r}] = [${A.slice(l - 1, r).join(", ")}].`,
    });
    push({
      proc: "ms",
      line: "ms_if",
      range: [l, r],
      depth,
      nodeId,
      desc:
        l < r
          ? `Bedingung \u2113 < r erf\u00fcllt (${l} < ${r}) \u2013 das Teil-Array hat mehr als ein Element, also wird geteilt.`
          : `Bedingung \u2113 < r NICHT erf\u00fcllt (${l} = ${r}) \u2013 Teil-Array hat genau ein Element und gilt als sortiert. Rekursion endet hier.`,
    });
    if (l >= r) {
      return; // Basisfall: ein Element ist trivial sortiert
    }
    const m = Math.floor((l + r) / 2);
    push({
      proc: "ms",
      line: "ms_m",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Teile: Mitte m = \u230A(${l} + ${r})/2\u230B = ${m}. Linke H\u00e4lfte A[${l}..${m}], rechte H\u00e4lfte A[${m + 1}..${r}].`,
    });

    const leftId = ++nodeCounter;
    push({
      proc: "ms",
      line: "ms_recL",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Herrsche: rekursiver Aufruf MergeSort(A, ${l}, ${m}) f\u00fcr die linke H\u00e4lfte.`,
    });
    mergeSort(l, m, depth + 1, leftId);

    const rightId = ++nodeCounter;
    push({
      proc: "ms",
      line: "ms_recR",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Herrsche: rekursiver Aufruf MergeSort(A, ${m + 1}, ${r}) f\u00fcr die rechte H\u00e4lfte.`,
    });
    mergeSort(m + 1, r, depth + 1, rightId);

    push({
      proc: "ms",
      line: "ms_merge",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Kombiniere: Merge(A, ${l}, ${m}, ${r}) verschmilzt die beiden sortierten H\u00e4lften.`,
    });
    merge(l, m, r, depth, nodeId);
  }

  function merge(l, m, r, depth, nodeId) {
    const n1 = m - l + 1;
    const n2 = r - m;
    push({
      proc: "mg",
      line: "mg_n",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Merge startet. n\u2081 = ${m} \u2212 ${l} + 1 = ${n1} (linke L\u00e4nge), n\u2082 = ${r} \u2212 ${m} = ${n2} (rechte L\u00e4nge).`,
    });

    const L = A.slice(l - 1, m); // A[l..m]
    const R = A.slice(m, r); // A[m+1..r]

    push({
      proc: "mg",
      line: "mg_alloc",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      L: L.slice(),
      R: R.slice(),
      desc: `Lege Hilfsarrays L (L\u00e4nge ${n1}+1) und R (L\u00e4nge ${n2}+1) an.`,
    });
    push({
      proc: "mg",
      line: "mg_copyL",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      L: L.slice(),
      R: R.slice(),
      desc: `Kopiere linke H\u00e4lfte A[${l}..${m}] = [${L.join(", ")}] nach L.`,
    });
    push({
      proc: "mg",
      line: "mg_copyR",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      L: L.slice(),
      R: R.slice(),
      desc: `Kopiere rechte H\u00e4lfte A[${m + 1}..${r}] = [${R.join(", ")}] nach R.`,
    });

    const Linf = [...L, Infinity];
    const Rinf = [...R, Infinity];
    push({
      proc: "mg",
      line: "mg_inf",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      L: Linf.slice(),
      R: Rinf.slice(),
      desc: `Setze Wachposten L[${n1 + 1}] = R[${n2 + 1}] = \u221E. Damit muss beim Mergen kein Sonderfall f\u00fcr "Array leer" behandelt werden.`,
    });

    let i = 0;
    let j = 0;
    push({
      proc: "mg",
      line: "mg_ij",
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      L: Linf.slice(),
      R: Rinf.slice(),
      iL: i,
      jR: j,
      desc: `Initialisiere Zeiger i = 1 (L) und j = 1 (R).`,
    });

    for (let k = l; k <= r; k++) {
      push({
        proc: "mg",
        line: "mg_for",
        range: [l, r],
        mid: m,
        depth,
        nodeId,
        L: Linf.slice(),
        R: Rinf.slice(),
        iL: i,
        jR: j,
        k: k,
        desc: `Schleifeniteration k = ${k}. Bef\u00fclle A[${k}].`,
      });
      const lv = Linf[i];
      const rv = Rinf[j];
      const takeLeft = lv <= rv;
      push({
        proc: "mg",
        line: "mg_cmp",
        range: [l, r],
        mid: m,
        depth,
        nodeId,
        L: Linf.slice(),
        R: Rinf.slice(),
        iL: i,
        jR: j,
        k: k,
        desc: `Vergleich L[${i + 1}] = ${fmt(lv)} \u2264 R[${j + 1}] = ${fmt(rv)} ? \u2192 ${
          takeLeft ? "ja" : "nein"
        }.`,
      });
      if (takeLeft) {
        A[k - 1] = lv;
        push({
          proc: "mg",
          line: "mg_takeL",
          range: [l, r],
          mid: m,
          depth,
          nodeId,
          L: Linf.slice(),
          R: Rinf.slice(),
          iL: i,
          jR: j,
          k: k,
          wrote: k,
          desc: `A[${k}] = L[${i + 1}] = ${fmt(lv)}. Zeiger i r\u00fcckt auf ${i + 2}.`,
        });
        i++;
      } else {
        A[k - 1] = rv;
        push({
          proc: "mg",
          line: "mg_takeR",
          range: [l, r],
          mid: m,
          depth,
          nodeId,
          L: Linf.slice(),
          R: Rinf.slice(),
          iL: i,
          jR: j,
          k: k,
          wrote: k,
          desc: `A[${k}] = R[${j + 1}] = ${fmt(rv)}. Zeiger j r\u00fcckt auf ${j + 2}.`,
        });
        j++;
      }
    }
    push({
      proc: "mg",
      line: null,
      range: [l, r],
      mid: m,
      depth,
      nodeId,
      desc: `Merge fertig: A[${l}..${r}] = [${A.slice(l - 1, r).join(", ")}] ist jetzt sortiert.`,
      mergedRange: [l, r],
    });
  }

  push({
    proc: "ms",
    line: null,
    range: [1, A.length],
    depth: 0,
    nodeId: 0,
    desc: "Start: ganzes Array \u00fcbergeben an MergeSort(A, 1, A.length).",
  });
  mergeSort(1, A.length, 0, 0);
  push({
    proc: "done",
    line: null,
    range: [1, A.length],
    depth: 0,
    nodeId: 0,
    desc: `Fertig! Array vollst\u00e4ndig sortiert: [${A.join(", ")}].`,
    done: true,
  });

  return steps;
}

function fmt(v) {
  return v === Infinity ? "\u221E" : v;
}

// ---------------------------------------------------------------------------
// Farb-Tokens (dunkles Theme, an die Galerie angelehnt)
// ---------------------------------------------------------------------------
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

const TAG_COLORS = {
  teile: C.amber,
  herrsche: C.purple,
  kombiniere: C.green,
};

// ---------------------------------------------------------------------------
// Hauptkomponente
// ---------------------------------------------------------------------------
export default function MergeSortTrainer() {
  const [inputText, setInputText] = useState("8, 3, 4, 0, 7, 9, 1, 6, 5, 2");
  const [committedInput, setCommittedInput] = useState([8, 3, 4, 0, 7, 9, 1, 6, 5, 2]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const timerRef = useRef(null);

  const steps = useMemo(() => buildSteps(committedInput), [committedInput]);
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  // Auto-Play
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
      .filter((x) => x.length > 0)
      .map(Number)
      .filter((x) => !Number.isNaN(x));
    if (parsed.length >= 1 && parsed.length <= 16) {
      setCommittedInput(parsed);
      setStepIdx(0);
      setPlaying(false);
    }
  };

  const randomize = () => {
    const n = 6 + Math.floor(Math.random() * 5);
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    setInputText(arr.join(", "));
    setCommittedInput(arr);
    setStepIdx(0);
    setPlaying(false);
  };

  const atStart = stepIdx === 0;
  const atEnd = stepIdx >= steps.length - 1;

  return (
    <div style={styles.root}>
      <style>{keyframes}</style>

      {/* Kopf */}
      <header style={styles.header}>
        <div style={styles.kicker}>VL 02 · THEORETISCHE INFORMATIK</div>
        <h1 style={styles.title}>MergeSort — Schritt für Schritt</h1>
        <p style={styles.subtitle}>
          Teile &amp; Herrsche: zerlegen, rekursiv sortieren, sortiert
          verschmelzen. Steuere unten Schritt für Schritt und beobachte die
          aktive Pseudocode-Zeile.
        </p>
      </header>

      {/* Eingabe */}
      <section style={styles.inputRow}>
        <input
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyInput()}
          placeholder="z. B. 8, 3, 4, 0, 7"
        />
        <button style={styles.btnGhost} onClick={applyInput}>
          Übernehmen
        </button>
        <button style={styles.btnGhost} onClick={randomize}>
          Zufall
        </button>
      </section>

      {/* Array-Visualisierung */}
      <ArrayView step={step} />

      {/* Erklärung */}
      <div style={styles.descBox}>
        <span style={styles.descBadge}>Schritt {stepIdx + 1} / {steps.length}</span>
        <span style={styles.descText}>{step.desc}</span>
      </div>

      {/* Merge-Hilfsarrays (nur während Merge sichtbar) */}
      {step.L && <MergeArrays step={step} />}

      {/* Pseudocode nebeneinander */}
      <section style={styles.codeGrid}>
        <CodeBlock
          title="MergeSort"
          lines={MERGESORT_LINES}
          activeLine={step.proc === "ms" ? step.line : null}
          dimmed={step.proc === "mg"}
        />
        <CodeBlock
          title="Merge"
          lines={MERGE_LINES}
          activeLine={step.proc === "mg" ? step.line : null}
          dimmed={step.proc === "ms"}
        />
      </section>

      {/* Steuerung */}
      <section style={styles.controls}>
        <button style={styles.btn} onClick={reset} disabled={atStart}>
          ⏮ Anfang
        </button>
        <button
          style={styles.btn}
          onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
          disabled={atStart}
        >
          ‹ Zurück
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={() => {
            if (atEnd) reset();
            else setPlaying((p) => !p);
          }}
        >
          {atEnd ? "↻ Neu" : playing ? "⏸ Pause" : "▶ Abspielen"}
        </button>
        <button
          style={styles.btn}
          onClick={() => setStepIdx((s) => Math.min(steps.length - 1, s + 1))}
          disabled={atEnd}
        >
          Weiter ›
        </button>
        <div style={styles.speedWrap}>
          <span style={styles.speedLabel}>Tempo</span>
          <input
            type="range"
            min="300"
            max="1600"
            step="100"
            value={1900 - speed}
            onChange={(e) => setSpeed(1900 - Number(e.target.value))}
            style={styles.range}
          />
        </div>
      </section>

      {/* Fortschrittsbalken */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${(stepIdx / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      <footer style={styles.footer}>
        Pseudocode nach Prof. Dr. V. Lesch, DHBW Mosbach · Merge macht genau
        r − ℓ + 1 Vergleiche · Gesamtlaufzeit Θ(n log n)
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Array-Ansicht mit Hervorhebung von aktivem Bereich, Mitte und Schreibstelle
// ---------------------------------------------------------------------------
function ArrayView({ step }) {
  const { array, range, mid, wrote, mergedRange } = step;
  return (
    <div style={styles.arrayWrap}>
      {array.map((v, idx) => {
        const pos = idx + 1; // 1-basiert
        const inRange = range && pos >= range[0] && pos <= range[1];
        const isMid = mid != null && pos === mid;
        const justWrote = wrote === pos;
        const inMerged =
          mergedRange && pos >= mergedRange[0] && pos <= mergedRange[1];

        let bg = C.panelAlt;
        let bd = C.border;
        let col = C.text;
        if (inRange) {
          bg = "#1f2937";
          bd = C.accent;
        }
        if (inMerged) {
          bg = "#10331c";
          bd = C.green;
        }
        if (justWrote) {
          bg = "#3fb95033";
          bd = C.green;
        }
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                ...styles.cell,
                background: bg,
                borderColor: bd,
                color: col,
                transform: justWrote ? "translateY(-4px)" : "none",
                boxShadow: justWrote ? `0 6px 14px ${C.green}44` : "none",
              }}
            >
              {v}
            </div>
            <div style={{ ...styles.idxLabel, color: isMid ? C.amber : C.textDim }}>
              {isMid ? `m=${pos}` : pos}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hilfsarrays L und R während des Merge
// ---------------------------------------------------------------------------
function MergeArrays({ step }) {
  const { L, R, iL, jR } = step;
  const renderRow = (arr, label, ptr, color) => (
    <div style={styles.mergeRow}>
      <span style={{ ...styles.mergeLabel, color }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {arr.map((v, idx) => {
          const isPtr = ptr === idx;
          return (
            <div
              key={idx}
              style={{
                ...styles.miniCell,
                borderColor: isPtr ? color : C.border,
                background: isPtr ? `${color}22` : C.panel,
                color: v === Infinity ? C.textDim : C.text,
              }}
            >
              {fmt(v)}
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div style={styles.mergeBox}>
      {renderRow(L, "L", iL, C.accent)}
      {renderRow(R, "R", jR, C.red)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pseudocode-Block mit Zeilennummern und aktiver Zeile
// ---------------------------------------------------------------------------
function CodeBlock({ title, lines, activeLine, dimmed }) {
  return (
    <div style={{ ...styles.codeBlock, opacity: dimmed ? 0.4 : 1 }}>
      <div style={styles.codeTitle}>{title}</div>
      <div style={styles.codeBody}>
        {lines.map((ln, i) => {
          const active = ln.id === activeLine;
          return (
            <div
              key={ln.id}
              style={{
                ...styles.codeLine,
                background: active ? C.highlight : "transparent",
                borderLeft: active
                  ? `3px solid ${C.accent}`
                  : "3px solid transparent",
              }}
            >
              <span style={styles.lineNo}>{i + 1}</span>
              <span style={{ paddingLeft: ln.indent * 16 }}>{ln.text}</span>
              {ln.tag && (
                <span style={{ ...styles.tag, color: TAG_COLORS[ln.tag] }}>
                  {"\u007D "}
                  {ln.tag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  root: {
    fontFamily:
      "'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    background: C.bg,
    color: C.text,
    padding: "28px 24px",
    borderRadius: 16,
    maxWidth: 920,
    margin: "0 auto",
    border: `1px solid ${C.border}`,
  },
  header: { marginBottom: 22 },
  kicker: {
    color: C.green,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 700,
    marginBottom: 8,
  },
  title: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 30,
    margin: "0 0 10px",
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  subtitle: { color: C.textDim, fontSize: 14, lineHeight: 1.6, margin: 0 },
  inputRow: { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" },
  input: {
    flex: 1,
    minWidth: 200,
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    color: C.text,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  arrayWrap: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
    padding: "20px 0 8px",
    minHeight: 70,
  },
  cell: {
    width: 46,
    height: 46,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid",
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    transition: "all 0.25s ease",
  },
  idxLabel: { fontSize: 11, marginTop: 5, transition: "color 0.2s" },
  descBox: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "14px 16px",
    margin: "16px 0",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    minHeight: 48,
  },
  descBadge: {
    background: C.accent,
    color: "#0d1117",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 6,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  descText: { fontSize: 14, lineHeight: 1.55 },
  mergeBox: {
    background: C.panelAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  mergeRow: { display: "flex", alignItems: "center", gap: 12 },
  mergeLabel: { fontWeight: 700, width: 16, fontSize: 15 },
  miniCell: {
    minWidth: 34,
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid",
    borderRadius: 7,
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  codeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 18,
  },
  codeBlock: {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    overflow: "hidden",
    transition: "opacity 0.3s",
  },
  codeTitle: {
    background: C.panelAlt,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 700,
    color: C.accent,
    borderBottom: `1px solid ${C.border}`,
    letterSpacing: 1,
  },
  codeBody: { padding: "8px 0" },
  codeLine: {
    display: "flex",
    alignItems: "center",
    fontSize: 12.5,
    padding: "2px 12px 2px 0",
    lineHeight: 1.7,
    transition: "background 0.15s",
  },
  lineNo: {
    width: 28,
    textAlign: "right",
    color: C.textDim,
    fontSize: 11,
    marginRight: 10,
    flexShrink: 0,
    userSelect: "none",
  },
  tag: { marginLeft: "auto", fontSize: 11, paddingLeft: 10, whiteSpace: "nowrap" },
  controls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  btn: {
    background: C.panelAlt,
    border: `1px solid ${C.border}`,
    color: C.text,
    padding: "9px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  btnPrimary: { background: C.accent, color: "#0d1117", border: "none", fontWeight: 700 },
  btnGhost: {
    background: "transparent",
    border: `1px solid ${C.border}`,
    color: C.textDim,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  speedWrap: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  speedLabel: { fontSize: 12, color: C.textDim },
  range: { accentColor: C.accent, cursor: "pointer" },
  progressTrack: {
    height: 4,
    background: C.panelAlt,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressFill: { height: "100%", background: C.green, transition: "width 0.2s" },
  footer: {
    fontSize: 11,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 1.6,
    borderTop: `1px solid ${C.border}`,
    paddingTop: 14,
  },
};

const keyframes = `
  input[type=range] { height: 4px; }
  ::selection { background: ${C.accent}55; }
`;