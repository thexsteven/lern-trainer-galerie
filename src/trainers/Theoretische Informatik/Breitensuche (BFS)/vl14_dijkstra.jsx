import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   DESIGN-SYSTEM (Dark Theme)
   Nur accent & accent2 thematisch angepasst:
   - accent  (#5eead4, grün-cyan): steht für WEGE / Distanzen (d-Werte, Pfad)
   - accent2 (#fdba74, orange):    steht für RELAX / Updates (Kantenentspannung)
   ========================================================================= */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#5eead4", // grün-cyan – Wege/Distanzen
  accent2: "#fdba74", // orange – Relax/Updates
  good: "#86efac", // grün – Erfolg/Treffer (fertiger Knoten)
  warn: "#fca5a5", // rot – Problem/Fehler
  gold: "#fcd34d", // gelb – Highlight (aktiv)
};

/* =========================================================================
   GLOBALE KEYFRAMES / BASIS-STYLES
   ========================================================================= */
const GlobalStyle = () => (
  <style>{`
    @keyframes pop {
      0%   { transform: scale(0.6); opacity: 0; }
      60%  { transform: scale(1.12); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes pulseGold {
      0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,0.0); }
      50%     { box-shadow: 0 0 0 6px rgba(252,211,77,0.25); }
    }
    * { box-sizing: border-box; }
    ::selection { background: ${C.accent}; color: ${C.bg}; }
  `}</style>
);

/* =========================================================================
   PFLICHT-BAUSTEINE
   ========================================================================= */

// useReveal(): blendet ein Element beim Scrollen sanft ein
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
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", color: C.text, lineHeight: 1.2 }}>
        {title}
      </h2>
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

function Tag({ color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontSize: 13,
        color: C.dim,
        marginRight: 14,
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
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
        background: "rgba(253,186,116,0.08)", // accent2-getönt
        border: `1px solid ${C.accent2}55`,
        borderRadius: 14,
        padding: "18px 20px",
        margin: "20px 0",
      }}
    >
      <div
        style={{
          color: C.accent2,
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>💡</span>
        {title}
      </div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.7 }}>{children}</div>
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
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        {term}
      </div>
      <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{def}</div>
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
        padding: "14px 0",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          width: 4,
          alignSelf: "stretch",
          minHeight: 40,
          borderRadius: 4,
          background: color,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{name}</span>
          <code
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "3px 9px",
              fontSize: 13,
              color: color,
              fontFamily: "ui-monospace, Menlo, monospace",
            }}
          >
            {formula}
          </code>
        </div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
          {note}
        </div>
      </div>
    </div>
  );
}

const btn = {
  background: C.accent,
  color: C.bg,
  border: "none",
  borderRadius: 9,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 9,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

// Kleiner gemeinsamer Player-Controlbar-Baustein
function Controls({ playing, onPlay, onPrev, onNext, onReset, step, total }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={onPlay}>
        {playing ? "⏸ Pause" : "▶ Play"}
      </button>
      <button style={btnGhost} onClick={onPrev}>
        ◀ Zurück
      </button>
      <button style={btnGhost} onClick={onNext}>
        Vor ▶
      </button>
      <button style={btnGhost} onClick={onReset}>
        ⟳ Reset
      </button>
      <span style={{ color: C.dim, fontSize: 13, marginLeft: 6 }}>
        Schritt {step + 1} / {total}
      </span>
    </div>
  );
}

/* =========================================================================
   VIS 1 — DIJKSTRA-STEPPER am Beispielgraphen
   Knoten färben (white→gray→black), d-Werte live, PriorityQueue sichtbar.
   Graph aus der VL (vereinfacht, nicht-negative Gewichte).
   ========================================================================= */

// Knotenpositionen (Layout im SVG)
const NODES = {
  s: { x: 60, y: 130, label: "s" },
  a: { x: 200, y: 60, label: "a" },
  b: { x: 200, y: 200, label: "b" },
  c: { x: 340, y: 60, label: "c" },
  t: { x: 340, y: 200, label: "t" },
};
// gerichtete Kanten mit Gewichten
const EDGES = [
  { u: "s", v: "a", w: 2 },
  { u: "s", v: "b", w: 5 },
  { u: "a", v: "b", w: 1 },
  { u: "a", v: "c", w: 7 },
  { u: "b", v: "t", w: 6 },
  { u: "c", v: "t", w: 3 },
  { u: "b", v: "c", w: 3 },
];

// Adjazenzliste aus EDGES
function adj(node) {
  return EDGES.filter((e) => e.u === node);
}

// Erzeugt die komplette Schrittfolge des Dijkstra-Laufs (Snapshots)
function buildDijkstraSteps() {
  const keys = Object.keys(NODES);
  const d = {};
  const color = {};
  const pi = {};
  keys.forEach((k) => {
    d[k] = Infinity;
    color[k] = "white";
    pi[k] = null;
  });
  d.s = 0;
  color.s = "gray";

  const steps = [];
  let iter = 0; // 0 = Initialisierung; pro ExtractMin-Aufruf hochgezählt
  const snap = (msg, active = null, relaxedEdge = null, queue = []) =>
    steps.push({
      d: { ...d },
      color: { ...color },
      pi: { ...pi },
      msg,
      active,
      relaxedEdge,
      queue: [...queue],
      iter,
    });

  // initial queue = alle Knoten, sortiert nach d
  const inQueue = new Set(keys);
  const queueArr = () =>
    [...inQueue]
      .map((k) => ({ k, d: d[k] }))
      .sort((x, y) => x.d - y.d || x.k.localeCompare(y.k));

  snap("Initialisierung: d[s]=0, alle anderen d=∞. Alle Knoten in die Priority Queue.", null, null, queueArr());

  while (inQueue.size > 0) {
    // ExtractMin
    const sorted = queueArr();
    const minK = sorted[0].k;
    if (d[minK] === Infinity) break; // unerreichbar
    iter += 1; // neue ExtractMin-Iteration beginnt
    inQueue.delete(minK);
    snap(
      `ExtractMin entnimmt »${minK}« (kleinstes d = ${d[minK]}). Dieser Knoten wird jetzt finalisiert.`,
      minK,
      null,
      queueArr()
    );

    // Relax alle ausgehenden Kanten
    for (const e of adj(minK)) {
      if (!inQueue.has(e.v)) continue; // schon finalisiert
      const neu = d[minK] + e.w;
      if (neu < d[e.v]) {
        const alt = d[e.v];
        d[e.v] = neu;
        pi[e.v] = minK;
        color[e.v] = "gray";
        snap(
          `Relax(${minK}→${e.v}): ${d[minK]} + ${e.w} = ${neu} < ${alt === Infinity ? "∞" : alt} → d[${e.v}] aktualisiert auf ${neu}, Vorgänger π[${e.v}]=${minK}.`,
          e.v,
          { u: minK, v: e.v, ok: true },
          queueArr()
        );
      } else {
        snap(
          `Relax(${minK}→${e.v}): ${d[minK]} + ${e.w} = ${neu} ≥ ${d[e.v]} → keine Verbesserung, d[${e.v}] bleibt.`,
          e.v,
          { u: minK, v: e.v, ok: false },
          queueArr()
        );
      }
    }
    color[minK] = "black";
    snap(`Knoten »${minK}« ist fertig (schwarz). Sein d-Wert ist endgültig die kürzeste Distanz.`, minK, null, queueArr());
  }
  snap("Fertig! Alle d-Werte sind die kürzesten Distanzen von s aus. Die π-Zeiger bilden den Kürzeste-Wege-Baum.", null, null, []);
  return steps;
}

function nodeFill(c) {
  if (c === "white") return C.panel2;
  if (c === "gray") return C.accent2; // in Bearbeitung / verbessert
  return C.good; // black = fertig
}
function nodeStroke(c) {
  if (c === "white") return C.line;
  if (c === "gray") return C.accent2;
  return C.good;
}

// Farbcode-Buchstabe (w/g/b) passend zur Graph-Legende
function colorMeta(c) {
  if (c === "white") return { letter: "w", color: C.dim };
  if (c === "gray") return { letter: "g", color: C.accent2 };
  return { letter: "b", color: C.good }; // black
}

// Leitet die Iterationstabellen-Zeilen aus den Snapshots ab (keine 2. Simulation).
//  Zeile 0 = Initial-Snapshot; Zeile k = der „… ist fertig (schwarz)"-Snapshot der Iteration k.
function buildTableRows(steps) {
  const rows = [{ iter: 0, snap: steps[0], active: "—" }];
  const maxIter = steps.length ? steps[steps.length - 1].iter : 0;
  for (let k = 1; k <= maxIter; k++) {
    const snap = steps.find(
      (s) => s.iter === k && s.active && s.color[s.active] === "black"
    );
    if (snap) rows.push({ iter: k, snap, active: snap.active });
  }
  return rows;
}

// Eine Knotenzelle in der Notation d(π) f, z. B. „10(s) g" oder „∞ w".
function NodeCell({ d, pi, color }) {
  const cm = colorMeta(color);
  const dStr = d === Infinity ? "∞" : String(d);
  const piStr = d === Infinity ? "" : `(${pi == null ? "−" : pi})`;
  return (
    <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13 }}>
      {dStr}
      {piStr}{" "}
      <span style={{ color: cm.color, fontWeight: 800 }}>{cm.letter}</span>
    </span>
  );
}

// Iterationstabelle: eine Spalte pro Knoten, eine Zeile pro ExtractMin-Iteration.
function DijkstraTable({ rows, currentIter }) {
  const keys = Object.keys(NODES);
  const cell = {
    borderRight: `1px solid ${C.line}`,
    borderBottom: `1px solid ${C.line}`,
    padding: "7px 10px",
    textAlign: "left",
    whiteSpace: "nowrap",
  };
  const head = {
    ...cell,
    color: C.dim,
    fontWeight: 700,
    fontSize: 13,
    background: C.panel2,
    position: "sticky",
    top: 0,
  };
  return (
    <div
      style={{
        background: C.panel2,
        borderRadius: 12,
        border: `1px solid ${C.line}`,
        overflowX: "auto",
      }}
    >
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={head}>Aufruf (EM)</th>
            <th style={head}>Q</th>
            <th style={head}>akt. Knoten</th>
            {keys.map((k) => (
              <th key={k} style={{ ...head, textAlign: "center" }}>
                {NODES[k].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isCurrent = row.iter === currentIter;
            const isFuture = row.iter > currentIter;
            const qStr = row.snap.queue
              .map((q) => `${q.k}(${q.d === Infinity ? "∞" : q.d})`)
              .join(", ");
            return (
              <tr
                key={row.iter}
                style={{
                  background: isCurrent ? "rgba(94,234,212,0.12)" : "transparent",
                  opacity: isFuture ? 0.4 : 1,
                  transition: "background .25s, opacity .25s",
                }}
              >
                <td
                  style={{
                    ...cell,
                    fontWeight: 700,
                    color: C.text,
                    borderLeft: `3px solid ${isCurrent ? C.gold : "transparent"}`,
                  }}
                >
                  {row.iter === 0 ? "0 (Init)" : row.iter}
                </td>
                <td style={{ ...cell, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, color: C.text }}>
                  {qStr || "—"}
                </td>
                <td style={{ ...cell, fontWeight: 800, color: C.gold, textAlign: "center" }}>
                  {row.active}
                </td>
                {keys.map((k) => (
                  <td key={k} style={{ ...cell, textAlign: "center", color: C.text }}>
                    <NodeCell d={row.snap.d[k]} pi={row.snap.pi[k]} color={row.snap.color[k]} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DijkstraStepper() {
  const steps = useRef(buildDijkstraSteps()).current;
  const tableRows = useRef(buildTableRows(steps)).current;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState("graph"); // "graph" | "table"
  const timer = useRef(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setI((p) => {
          if (p >= steps.length - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  const st = steps[i];

  return (
    <Card>
      <h3 style={{ margin: "0 0 4px", color: C.text, fontSize: 18 }}>
        Dijkstra live am Graphen
      </h3>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
        Beobachte, wie Dijkstra Knoten einsammelt: Aus der Priority Queue (Warteschlange,
        sortiert nach kleinstem <code style={codeInline}>d</code>) wird immer der nächstgelegene
        Knoten entnommen und endgültig festgelegt.
      </p>

      {/* Umschalter: Graph- oder Tabellenansicht */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          style={{ ...(view === "graph" ? btn : btnGhost), fontSize: 13 }}
          onClick={() => setView("graph")}
        >
          Graph
        </button>
        <button
          style={{ ...(view === "table" ? btn : btnGhost), fontSize: 13 }}
          onClick={() => setView("table")}
        >
          Tabelle
        </button>
      </div>

      {/* SVG Graph */}
      {view === "graph" && (
      <div style={{ background: C.panel2, borderRadius: 12, padding: 12, border: `1px solid ${C.line}` }}>
        <svg viewBox="0 0 400 260" style={{ width: "100%", height: "auto" }}>
          {/* Kanten */}
          {EDGES.map((e, idx) => {
            const a = NODES[e.u];
            const b = NODES[e.v];
            const isRelax =
              st.relaxedEdge && st.relaxedEdge.u === e.u && st.relaxedEdge.v === e.v;
            const isTreeEdge = st.pi[e.v] === e.u; // gehört zum aktuellen Wegebaum
            const stroke = isRelax
              ? st.relaxedEdge.ok
                ? C.accent2
                : C.warn
              : isTreeEdge
              ? C.accent
              : C.line;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={idx}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={isRelax || isTreeEdge ? 3 : 1.5}
                  style={{ transition: "stroke .3s, stroke-width .3s" }}
                />
                <circle cx={mx} cy={my} r={11} fill={C.bg} stroke={stroke} strokeWidth={1} style={{ transition: "stroke .3s" }} />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize={11} fill={C.text} fontWeight="700">
                  {e.w}
                </text>
              </g>
            );
          })}
          {/* Knoten */}
          {Object.entries(NODES).map(([k, n]) => {
            const isActive = st.active === k;
            return (
              <g key={k} style={{ transition: "all .3s" }}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isActive ? 22 : 18}
                  fill={nodeFill(st.color[k])}
                  stroke={isActive ? C.gold : nodeStroke(st.color[k])}
                  strokeWidth={isActive ? 4 : 2}
                  style={{ transition: "all .3s" }}
                />
                <text x={n.x} y={n.y + 1} textAnchor="middle" fontSize={14} fontWeight="800" fill={C.bg}>
                  {n.label}
                </text>
                <text x={n.x} y={n.y - 26} textAnchor="middle" fontSize={12} fontWeight="700" fill={C.accent}>
                  d={st.d[k] === Infinity ? "∞" : st.d[k]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      )}

      {/* Iterationstabelle */}
      {view === "table" && (
        <DijkstraTable rows={tableRows} currentIter={st.iter} />
      )}

      {/* Priority Queue Anzeige */}
      <div style={{ marginTop: 14 }}>
        <div style={{ color: C.dim, fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
          Priority Queue (nach d sortiert):
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 38 }}>
          {st.queue.length === 0 && (
            <span style={{ color: C.dim, fontSize: 14, fontStyle: "italic" }}>leer – alle Knoten fertig</span>
          )}
          {st.queue.map((q, idx) => (
            <span
              key={q.k}
              style={{
                background: idx === 0 ? C.accent : C.panel2,
                color: idx === 0 ? C.bg : C.text,
                border: `1px solid ${idx === 0 ? C.accent : C.line}`,
                borderRadius: 8,
                padding: "6px 11px",
                fontSize: 14,
                fontWeight: 700,
                animation: "pop .3s ease",
              }}
            >
              {q.k} ({q.d === Infinity ? "∞" : q.d})
            </span>
          ))}
        </div>
      </div>

      {/* Erklärtext zum Schritt */}
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: 48,
        }}
      >
        {st.msg}
      </div>

      <Controls
        playing={playing}
        step={i}
        total={steps.length}
        onPlay={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(steps.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.panel2}>weiß: noch nicht entdeckt</Tag>
        <Tag color={C.accent2}>grau: in Queue / verbessert</Tag>
        <Tag color={C.good}>schwarz: fertig (endgültig)</Tag>
        <Tag color={C.accent}>grün-cyan: Wegebaum-Kante</Tag>
        <Tag color={C.gold}>gelb: gerade aktiv</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 2 — RELAX isoliert: warum & wann d aktualisiert wird
   ========================================================================= */
function RelaxVis() {
  // feste kleine Szene: u --(w)--> v
  const scenarios = [
    { ud: 3, w: 4, vd: Infinity, note: "v noch nie erreicht (d=∞). Jeder echte Weg ist besser als ∞." },
    { ud: 3, w: 4, vd: 9, note: "Neuer Weg (3+4=7) ist kürzer als bisher bekannte 9 → Update!" },
    { ud: 3, w: 4, vd: 6, note: "Neuer Weg (3+4=7) ist NICHT kürzer als 6 → kein Update." },
    { ud: 0, w: 2, vd: Infinity, note: "Direkt vom Start s aus: d[v] = 0+2 = 2." },
  ];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setI((p) => (p + 1) % scenarios.length);
      }, 1800);
    }
    return () => clearInterval(timer.current);
  }, [playing]);

  const s = scenarios[i];
  const neu = s.ud + s.w;
  const better = neu < s.vd;
  const vNew = better ? neu : s.vd;

  return (
    <Card>
      <h3 style={{ margin: "0 0 4px", color: C.text, fontSize: 18 }}>
        Was macht <code style={codeInline}>Relax</code> eigentlich?
      </h3>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
        Relax (deutsch: „entspannen") prüft eine einzelne Kante <code style={codeInline}>u→v</code>:
        Komme ich über <code style={codeInline}>u</code> günstiger zu <code style={codeInline}>v</code>
        als bisher? Die Frage ist immer dieselbe:{" "}
        <span style={{ color: C.accent2 }}>
          ist <code style={codeInline}>d[u] + w(u,v) &lt; d[v]</code>?
        </span>
      </p>

      <div style={{ background: C.panel2, borderRadius: 12, padding: 20, border: `1px solid ${C.line}` }}>
        <svg viewBox="0 0 360 120" style={{ width: "100%", height: "auto" }}>
          {/* Kante u->v */}
          <line x1={90} y1={60} x2={270} y2={60} stroke={better ? C.accent2 : C.line} strokeWidth={3} style={{ transition: "stroke .3s" }} />
          <circle cx={180} cy={60} r={15} fill={C.bg} stroke={better ? C.accent2 : C.line} style={{ transition: "stroke .3s" }} />
          <text x={180} y={64} textAnchor="middle" fontSize={13} fill={C.text} fontWeight="700">{s.w}</text>
          {/* u */}
          <circle cx={70} cy={60} r={26} fill={C.good} stroke={C.good} />
          <text x={70} y={64} textAnchor="middle" fontSize={16} fontWeight="800" fill={C.bg}>u</text>
          <text x={70} y={24} textAnchor="middle" fontSize={13} fill={C.accent} fontWeight="700">d={s.ud}</text>
          {/* v */}
          <circle cx={290} cy={60} r={26} fill={better ? C.accent2 : C.panel2} stroke={better ? C.accent2 : C.line} style={{ transition: "all .3s" }} />
          <text x={290} y={64} textAnchor="middle" fontSize={16} fontWeight="800" fill={better ? C.bg : C.text}>v</text>
          <text x={290} y={24} textAnchor="middle" fontSize={13} fill={C.accent} fontWeight="700" key={vNew} style={{ animation: "pop .3s ease" }}>
            d={vNew === Infinity ? "∞" : vNew}
          </text>
        </svg>

        <div style={{ marginTop: 12, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 15 }}>
          <span style={{ color: C.text }}>{s.ud}</span>
          <span style={{ color: C.dim }}> + </span>
          <span style={{ color: C.text }}>{s.w}</span>
          <span style={{ color: C.dim }}> = </span>
          <span style={{ color: C.accent2, fontWeight: 700 }}>{neu}</span>
          <span style={{ color: C.dim }}>{better ? "  <  " : "  ≥  "}</span>
          <span style={{ color: C.text }}>{s.vd === Infinity ? "∞" : s.vd}</span>
          <span
            style={{
              marginLeft: 12,
              color: better ? C.good : C.warn,
              fontWeight: 800,
            }}
          >
            {better ? "→ UPDATE ✓" : "→ kein Update ✗"}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: 44,
        }}
      >
        {s.note}
      </div>

      <Controls
        playing={playing}
        step={i}
        total={scenarios.length}
        onPlay={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => (p - 1 + scenarios.length) % scenarios.length); }}
        onNext={() => { setPlaying(false); setI((p) => (p + 1) % scenarios.length); }}
        onReset={() => { setPlaying(false); setI(0); }}
      />

      <InfoBox title="Wenn Relax aktualisiert, passieren immer drei Dinge">
        <code style={codeInline}>d[v]</code> bekommt den neuen, kleineren Wert;{" "}
        <code style={codeInline}>π[v] = u</code> merkt sich den Vorgänger (so entsteht der Weg);
        und <code style={codeInline}>DecreaseKey</code> sortiert <code style={codeInline}>v</code>{" "}
        in der Priority Queue nach vorne, weil seine Priorität (= kleines d) gestiegen ist.
      </InfoBox>
    </Card>
  );
}

/* =========================================================================
   VIS 2b — PSEUDOCODE-STEPPER
   Eigenständiger, interaktiver Stepper, der den Pseudocode Zeile für Zeile
   hervorhebt. Schwerpunkt: Priority Queue (Heap-Interna / Versickern) und
   Relax(u, v; w). Nutzt das vorhandene Design-System (C, Card, Controls, …).
   ========================================================================= */

// Die drei Code-Panels (1-basiert, Notation der Vorlesung).
const PANEL_A = {
  id: "a",
  title: "Dijkstra (Hauptschleife)",
  lines: [
    "Dijkstra(WeightedGraph G = (V, E; w), Vertex s)",
    "  Initialize(G, s)",
    "  Q = new PriorityQueue(V, d)",
    "  while not Q.Empty() do",
    "    u = Q.ExtractMin()",
    "    foreach v ∈ Adj[u] do",
    "      Relax(u, v; w)",
    "    u.color = black",
  ],
};
const PANEL_B = {
  id: "b",
  title: "Relax(u, v; w)",
  lines: [
    "Relax(u, v; w)",
    "  if v.d > u.d + w(u, v) then",
    "    v.color = gray",
    "    v.d = u.d + w(u, v)",
    "    v.π = u",
    "    Q.DecreaseKey(v, v.d)",
  ],
};
const PANEL_C = {
  id: "c",
  title: "Priority Queue (Min-Heap)",
  lines: [
    "ExtractMin()",
    '  if Q.heap-size < 1 then error "Heap underflow"',
    "  min = A[1]",
    "  A[1] = A[Q.heap-size]",
    "  Q.heap-size − −",
    "  MinHeapify(A, 1)            // Versickern",
    "  return min",
    "",
    'MinHeapify(A, i)             // „Versickern": A[i] sinkt nach unten',
    "  ℓ = left(i); r = right(i)",
    "  if ℓ ≤ Q.heap-size and A[ℓ] < A[i] then smallest = ℓ",
    "  else smallest = i",
    "  if r ≤ Q.heap-size and A[r] < A[smallest] then smallest = r",
    "  if smallest ≠ i then",
    "    swap(A, i, smallest)",
    "    MinHeapify(A, smallest)",
    "",
    'DecreaseKey(index i, prio p)  // „Hochsickern"',
    '  if p > A[i] then error "Priorität zu groß"',
    "  A[i] = p",
    "  while i > 1 and A[parent(i)] > A[i] do",
    "    swap(A, i, parent(i))",
    "    i = parent(i)",
  ],
};
const PC_PANELS = [PANEL_A, PANEL_B, PANEL_C];

// Mini-Helfer: Heap-Snapshot { A, size, hi (hervorgehobene 1-basierte Indizes) }
const h = (A, size, hi) => ({ A, size, hi });

// Vorab berechnete Schrittfolge (Frames). Jeder Frame markiert die laufende
// Zeile, die Aufruf-Kette (crumb) und – bei Heap-Operationen – den Heap-Zustand.
const PC_FRAMES = [
  // ── Akt 1: ExtractMin ⇒ MinHeapify (Versickern) ──
  { panel: "a", line: 3, crumb: ["Dijkstra"], heap: null,
    msg: "Die Hauptschleife läuft, solange die Priority Queue nicht leer ist. Du holst dir jetzt den günstigsten Knoten." },
  { panel: "a", line: 4, crumb: ["Dijkstra", "ExtractMin"], heap: h([2, 5, 4, 9, 7, 8], 6, []),
    msg: "Dijkstra ruft Q.ExtractMin() auf — der Code springt in die Priority-Queue-Operation." },
  { panel: "c", line: 1, crumb: ["Dijkstra", "ExtractMin"], heap: h([2, 5, 4, 9, 7, 8], 6, []),
    msg: "heap-size = 6 ≥ 1 — kein Underflow, es geht weiter." },
  { panel: "c", line: 2, crumb: ["Dijkstra", "ExtractMin"], heap: h([2, 5, 4, 9, 7, 8], 6, [1]),
    msg: "Beim Min-Heap steht das Minimum immer an der Wurzel: min = A[1] = 2." },
  { panel: "c", line: 3, crumb: ["Dijkstra", "ExtractMin"], heap: h([8, 5, 4, 9, 7, 8], 6, [1, 6]),
    msg: "Das letzte Element A[6] = 8 wird an die Wurzel A[1] kopiert." },
  { panel: "c", line: 4, crumb: ["Dijkstra", "ExtractMin"], heap: h([8, 5, 4, 9, 7, 8], 5, []),
    msg: "heap-size wird auf 5 verkleinert — das alte letzte Element gehört nicht mehr zum Heap (ausgegraut)." },
  { panel: "c", line: 5, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([8, 5, 4, 9, 7, 8], 5, [1]),
    msg: "Die Wurzel 8 verletzt die Heap-Eigenschaft. MinHeapify lässt sie „versickern“." },
  { panel: "c", line: 9, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([8, 5, 4, 9, 7, 8], 5, [1, 2, 3]),
    msg: "Für i = 1: linkes Kind ℓ = 2 (Wert 5), rechtes Kind r = 3 (Wert 4)." },
  { panel: "c", line: 10, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([8, 5, 4, 9, 7, 8], 5, [1, 2]),
    msg: "A[2] = 5 < A[1] = 8 → smallest = 2 (vorerst das linke Kind)." },
  { panel: "c", line: 12, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([8, 5, 4, 9, 7, 8], 5, [2, 3]),
    msg: "A[3] = 4 < A[smallest] = 5 → smallest = 3 (das rechte Kind ist noch kleiner)." },
  { panel: "c", line: 13, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([8, 5, 4, 9, 7, 8], 5, [1, 3]),
    msg: "smallest = 3 ≠ i = 1 → es muss getauscht werden." },
  { panel: "c", line: 14, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([4, 5, 8, 9, 7, 8], 5, [1, 3]),
    msg: "swap(A,1,3): die Werte 8 und 4 tauschen die Plätze. Die Wurzel ist jetzt 4." },
  { panel: "c", line: 15, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([4, 5, 8, 9, 7, 8], 5, [3]),
    msg: "Rekursiver Aufruf MinHeapify(A,3) — die 8 sinkt evtl. weiter." },
  { panel: "c", line: 9, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([4, 5, 8, 9, 7, 8], 5, [3]),
    msg: "Für i = 3: ℓ = 6 und r = 7 liegen beide außerhalb von heap-size = 5 — Index 3 hat keine Kinder mehr." },
  { panel: "c", line: 11, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([4, 5, 8, 9, 7, 8], 5, [3]),
    msg: "Kein Kind ist kleiner → smallest = i = 3." },
  { panel: "c", line: 13, crumb: ["Dijkstra", "ExtractMin", "MinHeapify (Versickern)"], heap: h([4, 5, 8, 9, 7, 8], 5, [3]),
    msg: "smallest = i → keine Vertauschung mehr. Das Versickern ist beendet." },
  { panel: "c", line: 6, crumb: ["Dijkstra", "ExtractMin"], heap: h([4, 5, 8, 9, 7, 8], 5, []),
    msg: "Der Heap ist wieder gültig. ExtractMin gibt min = 2 zurück." },
  { panel: "a", line: 4, crumb: ["Dijkstra"], heap: null,
    msg: "Zurück in Dijkstra: u = 2 ist jetzt der finalisierte Knoten." },
  { panel: "a", line: 5, crumb: ["Dijkstra"], heap: null,
    msg: "Für jeden Nachbarn v von u wird nun Relax aufgerufen." },
  // ── Akt 2: Relax ⇒ DecreaseKey (Hochsickern) ──
  { panel: "a", line: 6, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "Dijkstra ruft Relax für die Kante u → v auf — der Code springt in Relax." },
  { panel: "b", line: 1, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "Relax prüft: Ist der bisherige Wert v.d größer als der neue Weg u.d + w(u,v)? Nur dann lohnt das Update." },
  { panel: "b", line: 2, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "v wird grau markiert — es ist nun „in Bearbeitung“." },
  { panel: "b", line: 3, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "v.d bekommt den neuen, kleineren Distanzwert." },
  { panel: "b", line: 4, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "v.π = u: v merkt sich u als Vorgänger — so entsteht der Kürzeste-Wege-Baum." },
  { panel: "b", line: 5, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 5, 4, 9, 7, 8], 6, [5]),
    msg: "Weil v.d kleiner wurde, muss die Queue v neu einsortieren. Beispiel (frischer Heap): der Schlüssel an Index 5 sinkt von 7 auf 1." },
  { panel: "c", line: 18, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 5, 4, 9, 7, 8], 6, [5]),
    msg: "Neue Priorität p = 1 ist nicht größer als A[5] = 7 — das Verkleinern ist erlaubt." },
  { panel: "c", line: 19, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 5, 4, 9, 1, 8], 6, [5]),
    msg: "A[5] wird auf 1 gesetzt. Jetzt ist die Heap-Eigenschaft nach oben evtl. verletzt." },
  { panel: "c", line: 20, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 5, 4, 9, 1, 8], 6, [5, 2]),
    msg: "parent(5) = ⌊5/2⌋ = 2. A[2] = 5 > A[5] = 1 → die Schleife läuft, es wird getauscht." },
  { panel: "c", line: 21, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 1, 4, 9, 5, 8], 6, [2, 5]),
    msg: "swap(A,5,2): die Werte 1 und 5 tauschen. Der kleine Schlüssel rückt nach oben." },
  { panel: "c", line: 22, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 1, 4, 9, 5, 8], 6, [2]),
    msg: "i wird zu parent(5) = 2 — wir steigen eine Ebene höher." },
  { panel: "c", line: 20, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([2, 1, 4, 9, 5, 8], 6, [2, 1]),
    msg: "parent(2) = 1. A[1] = 2 > A[2] = 1 → weiter hochsickern." },
  { panel: "c", line: 21, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([1, 2, 4, 9, 5, 8], 6, [1, 2]),
    msg: "swap(A,2,1): die 1 erreicht die Wurzel." },
  { panel: "c", line: 22, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([1, 2, 4, 9, 5, 8], 6, [1]),
    msg: "i wird zu parent(2) = 1 — wir sind an der Wurzel angekommen." },
  { panel: "c", line: 20, crumb: ["Dijkstra", "Relax", "DecreaseKey (Hochsickern)"], heap: h([1, 2, 4, 9, 5, 8], 6, [1]),
    msg: "i = 1 → die Schleifenbedingung ist falsch. Der Heap ist wieder gültig, die neue Wurzel ist 1." },
  { panel: "b", line: 5, crumb: ["Dijkstra", "Relax"], heap: null,
    msg: "DecreaseKey ist fertig — zurück in Relax." },
  { panel: "a", line: 6, crumb: ["Dijkstra"], heap: null,
    msg: "Zurück in Dijkstra. So ruft die Hauptschleife ExtractMin und (über Relax) DecreaseKey immer wieder auf, bis die Queue leer ist." },
];

// Baumpositionen für die 1-basierten Heap-Indizes 1..7 (viewBox 0 0 340 190)
const HEAP_POS = {
  1: { x: 170, y: 28 },
  2: { x: 95, y: 92 },
  3: { x: 245, y: 92 },
  4: { x: 50, y: 158 },
  5: { x: 140, y: 158 },
  6: { x: 200, y: 158 },
  7: { x: 290, y: 158 },
};

// Ein einzelnes Code-Panel mit Zeilennummern, aktiver & ausgeführter Zeile.
function PcCodePanel({ lines, activeLine, executed }) {
  let num = 0;
  return (
    <div
      style={{
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 13.5,
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "10px 0",
        overflowX: "auto",
      }}
    >
      {lines.map((ln, idx) => {
        const blank = ln.trim() === "";
        const n = blank ? null : ++num;
        const isActive = idx === activeLine;
        const isDone = executed.has(idx);
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "stretch",
              background: isActive ? "rgba(94,234,212,0.14)" : "transparent",
              borderLeft: `3px solid ${isActive ? C.accent2 : "transparent"}`,
              opacity: isActive ? 1 : isDone ? 0.4 : 0.92,
              transition: "background .25s, opacity .25s, border-color .25s",
            }}
          >
            <span
              style={{
                width: 34,
                textAlign: "right",
                paddingRight: 10,
                color: C.dim,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {n ?? ""}
            </span>
            <span
              style={{
                whiteSpace: "pre",
                paddingRight: 12,
                color: isActive ? C.text : isDone ? C.dim : C.text,
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {ln === "" ? " " : ln}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Mini-Visualisierung des Heaps: 1-basiertes Array + optional Binärbaum.
function HeapVis({ heap, showTree }) {
  const { A, size, hi } = heap;
  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ color: C.dim, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
        Min-Heap als 1-basiertes Array (heap-size = {size}):
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {A.map((val, idx0) => {
          const idx = idx0 + 1;
          const inHeap = idx <= size;
          const isHi = hi.includes(idx);
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div
                key={`${val}-${isHi ? "h" : "n"}-${idx}`}
                style={{
                  width: 42,
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9,
                  fontWeight: 800,
                  fontSize: 16,
                  background: isHi ? C.gold : inHeap ? C.panel : "transparent",
                  color: isHi ? C.bg : inHeap ? C.text : C.dim,
                  border: `1px solid ${isHi ? C.gold : C.line}`,
                  opacity: inHeap ? 1 : 0.35,
                  animation: isHi ? "pop .35s ease" : "none",
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 11, color: isHi ? C.gold : C.dim, fontWeight: isHi ? 700 : 400 }}>
                {idx}
              </div>
            </div>
          );
        })}
      </div>

      {showTree && (
        <div style={{ marginTop: 14 }}>
          <div style={{ color: C.dim, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            … und als Binärbaum (left(i)=2i, right(i)=2i+1, parent(i)=⌊i/2⌋):
          </div>
          <svg viewBox="0 0 340 190" style={{ width: "100%", maxWidth: 380, height: "auto" }}>
            {/* Kanten zuerst (liegen hinter den Knoten) */}
            {A.map((val, idx0) => {
              const idx = idx0 + 1;
              if (idx === 1 || idx > size) return null;
              const p = Math.floor(idx / 2);
              const a = HEAP_POS[idx];
              const b = HEAP_POS[p];
              if (!a || !b) return null;
              return <line key={"e" + idx} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.line} strokeWidth={2} />;
            })}
            {/* Knoten */}
            {A.map((val, idx0) => {
              const idx = idx0 + 1;
              if (idx > size) return null;
              const p = HEAP_POS[idx];
              if (!p) return null;
              const isHi = hi.includes(idx);
              return (
                <g key={"n" + idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={18}
                    fill={isHi ? C.gold : C.panel}
                    stroke={isHi ? C.gold : C.accent2}
                    strokeWidth={2}
                    style={{ transition: "fill .3s, stroke .3s" }}
                  />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize={15} fontWeight="800" fill={isHi ? C.bg : C.text}>
                    {val}
                  </text>
                  <text x={p.x} y={p.y - 24} textAnchor="middle" fontSize={11} fill={C.dim}>
                    i={idx}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

function PseudocodeStepper() {
  const frames = PC_FRAMES;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState(frames[0].panel);
  const [showTree, setShowTree] = useState(false);
  const timer = useRef(null);

  // Beim Schrittwechsel springt das angezeigte Panel auf die laufende Ebene.
  useEffect(() => {
    setView(frames[i].panel);
  }, [i, frames]);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setI((p) => {
          if (p >= frames.length - 1) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer.current);
  }, [playing, frames.length]);

  const cur = frames[i];
  const panel = PC_PANELS.find((p) => p.id === view) || PANEL_A;

  // Schon ausgeführte Zeilen im aktuellen Besuch dieses Panels (dezent).
  const executed = new Set();
  if (view === cur.panel) {
    for (let k = i; k >= 0 && frames[k].panel === cur.panel; k--) {
      executed.add(frames[k].line);
    }
    executed.delete(cur.line);
  }
  const activeLine = view === cur.panel ? cur.line : -1;

  return (
    <Card>
      <h3 style={{ margin: "0 0 4px", color: C.text, fontSize: 18 }}>
        Der Code, Schritt für Schritt
      </h3>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
        Verfolge, wie Dijkstra die Priority-Queue-Operationen <strong>aufruft</strong>: Die
        Hauptschleife ruft <code style={codeInline}>ExtractMin</code> (mit{" "}
        <code style={codeInline}>MinHeapify</code> = „Versickern“) und über{" "}
        <code style={codeInline}>Relax</code> auch <code style={codeInline}>DecreaseKey</code>{" "}
        (= „Hochsickern“). Das Panel springt automatisch auf die gerade laufende Ebene.
      </p>

      {/* Tabs: Code-Panel wählen */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {PC_PANELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setView(p.id)}
            style={{ ...(view === p.id ? btn : btnGhost), fontSize: 13 }}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Aufruf-Kette (Breadcrumb) */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ color: C.dim, fontSize: 12, fontWeight: 700, marginRight: 2 }}>Aufruf-Kette:</span>
        {cur.crumb.map((c, idx) => {
          const last = idx === cur.crumb.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ color: C.dim }}>▸</span>}
              <span
                style={{
                  background: last ? C.accent2 : C.panel2,
                  color: last ? C.bg : C.text,
                  border: `1px solid ${last ? C.accent2 : C.line}`,
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {c}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Code-Panel */}
      <PcCodePanel lines={panel.lines} activeLine={activeLine} executed={executed} />

      {view !== cur.panel && (
        <div style={{ color: C.dim, fontSize: 12.5, marginTop: 8, fontStyle: "italic" }}>
          Du betrachtest gerade ein anderes Panel als den laufenden Schritt — tippe „Vor ▶“ oder wähle
          das hervorgehobene Tab, um der Ausführung zu folgen.
        </div>
      )}

      {/* Heap-Visualisierung (nur bei Heap-Operationen) */}
      {cur.heap && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button style={{ ...btnGhost, fontSize: 13 }} onClick={() => setShowTree((s) => !s)}>
              {showTree ? "Baum ausblenden" : "Baum anzeigen"}
            </button>
          </div>
          <HeapVis heap={cur.heap} showTree={showTree} />
        </div>
      )}

      {/* Erklärtext zum Frame */}
      <div
        style={{
          marginTop: cur.heap ? 0 : 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: 48,
        }}
      >
        {cur.msg}
      </div>

      <Controls
        playing={playing}
        step={i}
        total={frames.length}
        onPlay={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(frames.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.accent2}>linker Balken / aktive Zeile</Tag>
        <Tag color={C.gold}>gelb: gerade getauschte Heap-Indizes</Tag>
        <Tag color={C.panel2}>ausgegraut: außerhalb von heap-size</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 3 — BFS vs. DIJKSTRA nebeneinander
   ========================================================================= */
function CompareVis() {
  const rows = [
    {
      aspect: "Warteschlange",
      bfs: "Queue (FIFO) – wer zuerst rein, zuerst raus",
      dij: "Priority Queue – wer kleinstes d hat, zuerst raus",
    },
    {
      aspect: "Auswahl des nächsten Knotens",
      bfs: "Dequeue – einfach der nächste in der Reihe",
      dij: "ExtractMin – der mit der kleinsten Distanz",
    },
    {
      aspect: "Distanz-Update",
      bfs: "v.d = u.d + 1  (jede Kante zählt gleich)",
      dij: "Relax: v.d = u.d + w(u,v)  (Gewicht zählt)",
    },
    {
      aspect: "Voraussetzung",
      bfs: "ungewichteter Graph",
      dij: "Gewichte ≥ 0 (nicht-negativ)",
    },
    {
      aspect: "Laufzeit",
      bfs: "O(E + V)",
      dij: "O(E + V log V)",
    },
  ];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setI((p) => {
          if (p >= rows.length - 1) { setPlaying(false); return p; }
          return p + 1;
        });
      }, 1600);
    }
    return () => clearInterval(timer.current);
  }, [playing]);

  return (
    <Card>
      <h3 style={{ margin: "0 0 4px", color: C.text, fontSize: 18 }}>
        BFS vs. Dijkstra – Zeile für Zeile
      </h3>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
        Dijkstra ist im Kern „BFS (Breitensuche) mit Gewichten". Der Bauplan ist fast identisch –
        nur an drei Stellen wird ersetzt. Klicke dich durch, um die Unterschiede einzeln aufzudecken.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.4fr 1.4fr",
            gap: 1,
            background: C.line,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            overflow: "hidden",
            fontSize: 13.5,
          }}
        >
          {/* Header */}
          <div style={{ ...cellHead }}>Aspekt</div>
          <div style={{ ...cellHead, color: C.dim }}>BFS</div>
          <div style={{ ...cellHead, color: C.accent }}>Dijkstra</div>
          {rows.map((r, idx) => {
            const visible = idx <= i;
            return (
              <React.Fragment key={idx}>
                <div style={{ ...cell, fontWeight: 700, opacity: visible ? 1 : 0.15, transition: "opacity .4s" }}>
                  {r.aspect}
                </div>
                <div style={{ ...cell, color: C.dim, opacity: visible ? 1 : 0.15, transition: "opacity .4s" }}>
                  {visible ? r.bfs : "···"}
                </div>
                <div
                  style={{
                    ...cell,
                    color: C.text,
                    background: idx === i ? "rgba(94,234,212,0.08)" : C.panel,
                    opacity: visible ? 1 : 0.15,
                    transition: "opacity .4s, background .3s",
                  }}
                >
                  {visible ? r.dij : "···"}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Controls
        playing={playing}
        step={i}
        total={rows.length}
        onPlay={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(rows.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
      />
    </Card>
  );
}

const cellHead = {
  background: C.panel2,
  padding: "12px 14px",
  fontWeight: 800,
  color: C.text,
};
const cell = {
  background: C.panel,
  padding: "12px 14px",
  lineHeight: 1.5,
};

/* =========================================================================
   VIS 4 — LAUFZEIT-TABELLE interaktiv: PriorityQueue-Implementierungen
   ========================================================================= */
function RuntimeVis() {
  const impls = [
    {
      name: "Unsortiertes Feld (Array)",
      extract: "O(V)",
      decrease: "O(1)",
      total: "O(V² + E)",
      explain:
        "ExtractMin muss jedes Mal das ganze Feld durchsuchen → O(V). DecreaseKey ist trivial (Wert einfach überschreiben) → O(1). Gesamt: V·O(V) für die Extractions + E·O(1) für die Relaxierungen = O(V² + E). Gut für dichte Graphen (viele Kanten).",
    },
    {
      name: "Binärer Heap (Min-Heap)",
      extract: "O(log V)",
      decrease: "O(log V)",
      total: "O((E + V) log V)",
      explain:
        "Sowohl ExtractMin als auch DecreaseKey kosten O(log V), weil der Heap nur log V hoch ist. V Extractions + E DecreaseKeys → (V + E)·O(log V). Das ist der Standardfall und gut für dünne Graphen.",
    },
    {
      name: "Fibonacci-Heap",
      extract: "O(log V)",
      decrease: "O(1) amortisiert",
      total: "O(E + V log V)",
      explain:
        "DecreaseKey läuft hier amortisiert in O(1) – das ist das theoretisch beste Ergebnis. Da Relax (und damit DecreaseKey) bis zu E-mal aufgerufen wird, spart das viel: E·O(1) + V·O(log V) = O(E + V log V). Das ist die Bestmarke aus der Vorlesung (Korollar).",
    },
  ];
  const [i, setI] = useState(1); // Standard: Binärheap
  const cur = impls[i];

  return (
    <Card>
      <h3 style={{ margin: "0 0 4px", color: C.text, fontSize: 18 }}>
        Die Laufzeit hängt an der Priority Queue
      </h3>
      <p style={{ color: C.dim, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
        Dijkstra selbst ist fix. Aber <code style={codeInline}>ExtractMin</code> wird genau{" "}
        <strong style={{ color: C.accent }}>V-mal</strong> aufgerufen und{" "}
        <code style={codeInline}>DecreaseKey</code> bis zu{" "}
        <strong style={{ color: C.accent2 }}>E-mal</strong>. Die Gesamtlaufzeit ist also{" "}
        <code style={codeInline}>O(V · T_ExtractMin + E · T_DecreaseKey)</code> – und die hängt davon
        ab, womit du die Queue baust. Schalte durch:
      </p>

      {/* Auswahl-Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {impls.map((im, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            style={{
              ...(idx === i ? btn : btnGhost),
              fontSize: 13,
            }}
          >
            {im.name.split(" ")[0]} {im.name.includes("Fib") ? "" : ""}
          </button>
        ))}
      </div>

      {/* Tabelle */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          background: C.line,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          overflow: "hidden",
          fontSize: 14,
        }}
      >
        <div style={cellHead}>ExtractMin (×V)</div>
        <div style={cellHead}>DecreaseKey (×E)</div>
        <div style={{ ...cellHead, color: C.accent }}>Dijkstra gesamt</div>
        <div style={{ ...cell, fontFamily: "ui-monospace, monospace", color: C.accent }} key={"e" + i} >
          <span style={{ animation: "pop .3s ease", display: "inline-block" }}>{cur.extract}</span>
        </div>
        <div style={{ ...cell, fontFamily: "ui-monospace, monospace", color: C.accent2 }} key={"d" + i}>
          <span style={{ animation: "pop .3s ease", display: "inline-block" }}>{cur.decrease}</span>
        </div>
        <div
          style={{
            ...cell,
            fontFamily: "ui-monospace, monospace",
            fontWeight: 800,
            color: C.gold,
            background: "rgba(252,211,77,0.06)",
          }}
          key={"t" + i}
        >
          <span style={{ animation: "pop .3s ease", display: "inline-block" }}>{cur.total}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "14px 16px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {cur.explain}
      </div>

      <div style={{ marginTop: 14 }}>
        <Tag color={C.accent}>ExtractMin: wird V-mal aufgerufen</Tag>
        <Tag color={C.accent2}>DecreaseKey: wird bis zu E-mal aufgerufen</Tag>
        <Tag color={C.gold}>Gesamt: Summe beider Kosten</Tag>
      </div>
    </Card>
  );
}

const codeInline = {
  background: C.panel2,
  border: `1px solid ${C.line}`,
  borderRadius: 5,
  padding: "1px 6px",
  fontSize: "0.92em",
  color: C.accent,
  fontFamily: "ui-monospace, Menlo, monospace",
};

/* =========================================================================
   HAUPT-KOMPONENTE
   ========================================================================= */
export default function DijkstraErklaerer() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <GlobalStyle />

      {/* HERO */}
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "72px 24px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: C.accent2,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Kapitel 14 · Theoretische Informatik II
        </div>
        <h1 style={{ fontSize: 44, margin: "0 0 18px", lineHeight: 1.1, fontWeight: 800 }}>
          Kürzeste Wege &{" "}
          <span style={{ color: C.accent }}>Dijkstras Algorithmus</span>
        </h1>
        <p style={{ color: C.dim, fontSize: 17, maxWidth: 620, margin: "0 auto" }}>
          Wie findet ein Navi den schnellsten Weg? Dieser Erklärer baut Dijkstra Schritt für
          Schritt auf – von der Grundidee über die <code style={codeInline}>Relax</code>-Operation
          bis zur vollständigen Laufzeitherleitung <code style={codeInline}>O(E + V log V)</code>.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* 0. DAS PROBLEM */}
        <Section kicker="Motivation" title="0 · Warum braucht man kürzeste Wege?">
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 15.5 }}>
              Stell dir ein Navigationssystem vor: Du willst von zuhause (<em>Start</em>) zum Bahnhof
              (<em>Ziel</em>). Das Straßennetz lässt sich als{" "}
              <strong>Graph</strong> (mathematisches Netz aus Punkten und Verbindungen) modellieren:
            </p>
            <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
              <MethodRow color={C.accent} name="Kreuzung → Knoten" formula="v ∈ V" note="Ein Knoten (engl. vertex, Mehrzahl vertices) ist ein Punkt im Netz. V ist die Menge aller Knoten." />
              <MethodRow color={C.accent} name="Straße → Kante" formula="e ∈ E" note="Eine Kante (engl. edge) verbindet zwei Knoten. E ist die Menge aller Kanten. Gerichtet bedeutet: sie zeigt in eine Richtung (wie eine Einbahnstraße)." />
              <MethodRow color={C.accent2} name="Fahrtzeit → Gewicht" formula="w(e) ≥ 0" note="Jede Kante hat ein Gewicht w(e) (z.B. Minuten). w ist nie negativ – Zeit kann man nicht zurückgewinnen. Das ist später entscheidend!" />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 15.5 }}>
              Gesucht: der <strong>s-t-Weg</strong> (Weg vom Startknoten{" "}
              <code style={codeInline}>s</code> zum Zielknoten <code style={codeInline}>t</code>),
              dessen aufsummiertes Gewicht <strong>minimal</strong> ist.
            </p>
          </Card>
          <InfoBox title="Was bedeutet O(...)?">
            Das <strong>O</strong> (Groß-O, „O-Notation") beschreibt, wie schnell die Laufzeit
            wächst, wenn der Graph größer wird – ohne sich um konstante Faktoren zu kümmern.{" "}
            <code style={codeInline}>O(V)</code> heißt „proportional zur Anzahl der Knoten",{" "}
            <code style={codeInline}>O(V²)</code> „proportional zum Quadrat". Wir benutzen es,
            um Algorithmen fair zu vergleichen. <code style={codeInline}>V</code> ist dabei eine
            Kurzschreibweise für <code style={codeInline}>|V|</code> (Anzahl der Knoten),{" "}
            <code style={codeInline}>E</code> für <code style={codeInline}>|E|</code> (Anzahl der Kanten).
          </InfoBox>
        </Section>

        {/* 1. KERNIDEE */}
        <Section kicker="Die Kernidee" title="1 · Immer den nächstgelegenen Knoten zuerst">
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 15.5 }}>
              Dijkstras Trick ist <strong>gierig</strong> (greedy): Er nimmt sich immer den noch
              nicht fertigen Knoten mit der <em>kleinsten bisher bekannten Distanz</em> vor und
              erklärt dessen Distanz für <strong>endgültig</strong>. Warum darf er das?
            </p>
            <p style={{ margin: "0 0 14px", fontSize: 15.5 }}>
              Weil alle Gewichte <code style={codeInline}>≥ 0</code> sind, kann kein späterer Weg
              einen schon gefundenen kürzeren Weg noch unterbieten – Umwege machen die Sache nur
              länger, nie kürzer. Genau deshalb darf der nächstgelegene Knoten „abgehakt" werden.
            </p>
            <p style={{ margin: 0, fontSize: 15.5 }}>
              Jeder Knoten merkt sich zwei Dinge:{" "}
              <code style={codeInline}>d[v]</code> (die bisher beste bekannte Distanz von{" "}
              <code style={codeInline}>s</code> aus) und{" "}
              <code style={codeInline}>π[v]</code> (gesprochen „pi von v" – der{" "}
              <strong>Vorgänger</strong> auf diesem Weg, mit dem sich der Pfad später rückwärts
              rekonstruieren lässt).
            </p>
          </Card>
          <div style={{ marginTop: 20 }}>
            <DijkstraStepper />
          </div>
        </Section>

        {/* 2. DER SCHWIERIGE TEIL: RELAX */}
        <Section kicker="Der Kern-Mechanismus" title="2 · Relax – die eine Operation, die alles tut">
          <p style={{ color: C.dim, fontSize: 15.5, margin: "0 0 20px" }}>
            Wenn ein Knoten <code style={codeInline}>u</code> fertig wird, schaut Dijkstra alle
            Kanten an, die von <code style={codeInline}>u</code> wegführen, und versucht, die
            Nachbarn zu verbessern. Diese Verbesserungs-Prüfung heißt{" "}
            <strong>Relax</strong> – und sie ist das Herzstück.
          </p>
          <RelaxVis />
        </Section>

        {/* 3. PSEUDOCODE INTERAKTIV */}
        <Section kicker="Der Code, Schritt für Schritt" title="3 · Pseudocode interaktiv">
          <p style={{ color: C.dim, fontSize: 15.5, margin: "0 0 20px" }}>
            Jetzt sehen wir den <strong>echten Pseudocode</strong> – und zwar so, dass sichtbar wird,
            wie die Hauptschleife die <strong>Priority Queue</strong> aufruft. Besonders spannend ist,
            was <em>innerhalb</em> der Queue passiert: das <strong>Versickern</strong> (MinHeapify) beim
            Entnehmen und das <strong>Hochsickern</strong> (DecreaseKey) nach einem Relax.
          </p>
          <InfoBox title="Min-Heap statt Max-Heap (spiegelbildlich zu VL06)">
            In VL06 wurde der <strong>Max</strong>-Heap gezeigt (FindMax / ExtractMax / IncreaseKey,
            Versickern via <code style={codeInline}>MaxHeapify</code>). Dijkstra braucht aber immer den{" "}
            <em>kleinsten</em> d-Wert zuerst, also eine <strong>Min</strong>-Priority-Queue. Der Code
            unten ist die exakt <strong>spiegelbildliche</strong> Variante: aus „größer“ wird „kleiner“,
            aus <code style={codeInline}>ExtractMax</code> wird <code style={codeInline}>ExtractMin</code>,
            aus <code style={codeInline}>MaxHeapify</code> wird <code style={codeInline}>MinHeapify</code>,
            aus <code style={codeInline}>IncreaseKey</code> wird <code style={codeInline}>DecreaseKey</code>.
            Die Mechanik (Versickern/Hochsickern) bleibt identisch.
          </InfoBox>
          <PseudocodeStepper />
        </Section>

        {/* 4. VARIANTEN / VERGLEICH */}
        <Section kicker="Einordnung" title="4 · Dijkstra ist „BFS mit Gewichten“">
          <CompareVis />
        </Section>

        {/* 5. SONDERFALL / ÜBERBLICK ANDERE VERFAHREN */}
        <Section kicker="Über Dijkstra hinaus" title="5 · Wann reicht Dijkstra nicht?">
          <Card>
            <p style={{ margin: "0 0 16px", fontSize: 15.5 }}>
              Dijkstra braucht zwingend <strong>nicht-negative</strong> Gewichte. Für andere
              Situationen gibt es spezialisierte Verfahren – hier der Überblick aus der Vorlesung:
            </p>
            <MethodRow color={C.dim} name="Ungewichteter Graph" formula="BFS · O(E + V)" note="Wenn alle Kanten gleich „teuer“ sind, reicht eine einfache Breitensuche." />
            <MethodRow color={C.accent} name="Nicht-negative Gewichte" formula="Dijkstra · O(E + V log V)" note="Unser Fall. Schnell und für die meisten realen Netze passend." />
            <MethodRow color={C.gold} name="Azyklischer Graph (DAG)" formula="topol. Sortieren · O(E + V)" note="Ein Graph ohne Kreise lässt sich linear sortieren und in einem Durchlauf lösen." />
            <MethodRow color={C.warn} name="Negative Gewichte" formula="Bellman-Ford · O(E·V)" note="Sobald Kanten negativ sein dürfen (z.B. Gewinn statt Kosten), versagt Dijkstras Greedy-Logik. Bellman-Ford ist langsamer, aber robust." />
            <MethodRow color={C.accent2} name="Alle Knotenpaare" formula="Floyd-Warshall · O(V³)" note="Wenn man die kürzesten Wege zwischen ALLEN Paaren gleichzeitig will." />
          </Card>
          <InfoBox title="Warum scheitert Dijkstra bei negativen Kanten?">
            Dijkstras Versprechen war: „Wenn ich den nächstgelegenen Knoten abhake, kann ihn
            nichts mehr verbessern." Mit einer negativen Kante <em>könnte</em> aber ein späterer
            Umweg die Gesamtdistanz noch verringern – das Versprechen bricht, und der Algorithmus
            liefert falsche Ergebnisse.
          </InfoBox>
        </Section>

        {/* 6. ANALYSE / LAUFZEIT */}
        <Section kicker="Laufzeitanalyse" title="6 · Wie kommt man auf O(E + V log V)?">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 14px", fontSize: 15.5 }}>
              Wir zählen, wie oft die beiden teuren Operationen vorkommen:
            </p>
            <MethodRow
              color={C.accent}
              name="ExtractMin"
              formula="× |V|"
              note="Die while-Schleife läuft genau einmal pro Knoten, denn jeder Knoten wird genau einmal aus der Queue entnommen und fertiggestellt. Also genau |V| Aufrufe."
            />
            <MethodRow
              color={C.accent2}
              name="Relax / DecreaseKey"
              formula="× Θ(E)"
              note="Für jeden Knoten u wird Relax für jede ausgehende Kante einmal aufgerufen – das sind deg(u) Stück (der Ausgangsgrad). Über alle Knoten summiert ergibt das genau |E| Aufrufe (jede Kante wird genau einmal angefasst). Θ bedeutet hier: exakt in dieser Größenordnung, nicht nur eine obere Schranke."
            />
            <p style={{ margin: "16px 0 0", fontSize: 15.5 }}>
              Die Gesamtformel lautet damit:
            </p>
            <div
              style={{
                marginTop: 12,
                background: C.panel2,
                border: `1px solid ${C.accent}55`,
                borderRadius: 10,
                padding: "16px 18px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 15,
                color: C.text,
                textAlign: "center",
              }}
            >
              T<sub>Dijkstra</sub> ={" "}
              <span style={{ color: C.accent }}>|V| · T<sub>ExtractMin</sub></span>{" "}
              +{" "}
              <span style={{ color: C.accent2 }}>|E| · T<sub>DecreaseKey</sub></span>
            </div>
          </Card>

          <RuntimeVis />

          <InfoBox title="Der Clou: DecreaseKey ohne Suchen">
            Im Heap kann man eigentlich nicht „nach einem Knoten suchen". Trick: Man merkt sich
            ständig <em>für jeden Knoten, wo er gerade im Heap steht</em>. So springt DecreaseKey
            per Direktzugriff zum richtigen Platz – das macht die <code style={codeInline}>O(log V)</code>
            erst möglich.
          </InfoBox>
        </Section>

        {/* 7. ZUSAMMENFASSUNG */}
        <Section kicker="Auf einen Blick" title="7 · Das Wichtigste in einem Satz">
          <Card
            style={{
              background: "rgba(94,234,212,0.07)",
              border: `1px solid ${C.accent}55`,
            }}
          >
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.8 }}>
              <strong style={{ color: C.accent }}>Dijkstra</strong> findet die kürzesten Wege von
              einem Start <code style={codeInline}>s</code> zu allen Knoten, indem er{" "}
              <strong>gierig immer den nächstgelegenen offenen Knoten finalisiert</strong> (per{" "}
              <code style={codeInline}>ExtractMin</code> aus der Priority Queue) und dessen Nachbarn
              per <strong style={{ color: C.accent2 }}>Relax</strong> verbessert. Das funktioniert
              nur bei <strong>nicht-negativen Gewichten</strong> und läuft mit Binärheap in{" "}
              <code style={codeInline}>O((E + V) log V)</code>, mit Fibonacci-Heap sogar in{" "}
              <code style={codeInline}>O(E + V log V)</code>.
            </p>
          </Card>
        </Section>

        {/* 8. GLOSSAR */}
        <Section kicker="Nachschlagen" title="8 · Glossar – alle Begriffe & Symbole">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 12,
            }}
          >
            <GlossEntry term="Graph G = (V, E)" def="Netz aus Knoten V und Kanten E. Hier gerichtet (Kanten haben Richtung), gewichtet (Kanten haben Kosten) und zusammenhängend." />
            <GlossEntry term="Knoten / Vertex (v ∈ V)" def="Punkt im Graphen, z.B. eine Kreuzung. |V| = Anzahl der Knoten." />
            <GlossEntry term="Kante / Edge (e ∈ E)" def="Verbindung zwischen zwei Knoten, z.B. eine Straße. |E| = Anzahl der Kanten." />
            <GlossEntry term="Gewicht w(e)" def="Kosten einer Kante (z.B. Fahrtzeit). Bei Dijkstra immer ≥ 0." />
            <GlossEntry term="s und t" def="Startknoten s (engl. source) und Zielknoten t (target)." />
            <GlossEntry term="d[v]" def="Bisher kürzeste bekannte Distanz von s nach v. Startet bei ∞ (unendlich = noch nicht erreicht)." />
            <GlossEntry term="π[v] (pi von v)" def="Vorgänger von v auf dem kürzesten Weg. Damit lässt sich der Pfad rückwärts rekonstruieren." />
            <GlossEntry term="Relax(u, v; w)" def="Prüft: ist d[u] + w(u,v) < d[v]? Wenn ja, wird d[v] verkleinert und π[v] = u gesetzt." />
            <GlossEntry term="Priority Queue" def="Vorrang-Warteschlange: gibt immer das Element mit kleinstem Schlüssel (hier kleinstes d) zuerst heraus." />
            <GlossEntry term="ExtractMin" def="Operation der Priority Queue: entnimmt das Element mit dem kleinsten d. Wird |V|-mal aufgerufen." />
            <GlossEntry term="DecreaseKey" def="Operation der Priority Queue: verkleinert den Schlüssel eines Elements und sortiert es per „Hochsickern“ neu ein. Wird bis zu |E|-mal aufgerufen." />
            <GlossEntry term="MinHeapify / Versickern" def="Stellt die Min-Heap-Eigenschaft ab Index i wieder her, indem ein zu großes Element nach unten „versickert“ – es tauscht so lange mit dem kleineren Kind, bis es kleiner als beide Kinder ist. Kern von ExtractMin." />
            <GlossEntry term="Hochsickern" def="Gegenstück zum Versickern: ein verkleinerter Schlüssel tauscht so lange mit seinem Elternknoten, bis er nicht mehr kleiner als dieser ist. Kern von DecreaseKey." />
            <GlossEntry term="heap-size" def="Anzahl der gültigen Heap-Elemente im Array A. Elemente mit Index > heap-size gehören (noch/nicht mehr) zum Heap." />
            <GlossEntry term="left / right / parent" def="1-basierte Index-Arithmetik im Heap-Array: left(i)=2i, right(i)=2i+1, parent(i)=⌊i/2⌋. So findet man Kinder und Eltern ohne Zeiger." />
            <GlossEntry term="Min-Heap vs. Max-Heap" def="Im Min-Heap steht das kleinste Element an der Wurzel (für Dijkstra), im Max-Heap (VL06) das größte. Beide arbeiten spiegelbildlich mit denselben Mechanismen." />
            <GlossEntry term="Knotenfarben" def="weiß = unentdeckt, grau = in der Queue/verbessert, schwarz = fertig (d endgültig)." />
            <GlossEntry term="O(...) / Θ(...)" def="O = obere Schranke für das Wachstum der Laufzeit. Θ (Theta) = exakte Größenordnung (obere UND untere Schranke)." />
            <GlossEntry term="deg(u) / Ausgangsgrad" def="Anzahl der von u ausgehenden Kanten. Die Summe aller deg(u) über alle Knoten ist |E|." />
            <GlossEntry term="SSSP" def="Single-Source-Shortest-Path: kürzeste Wege von EINER Quelle zu allen anderen Knoten – genau das, was Dijkstra löst." />
            <GlossEntry term="Greedy" def="„Gierig“: Strategie, die in jedem Schritt die lokal beste Wahl trifft. Bei Dijkstra: immer kleinstes d zuerst." />
            <GlossEntry term="Kürzeste-Wege-Baum" def="Baum mit Wurzel s, gebildet aus allen π-Zeigern. Enthält für jeden Knoten genau einen kürzesten Weg von s." />
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "28px 24px 48px",
          textAlign: "center",
          color: C.dim,
          fontSize: 13,
        }}
      >
        Kapitel 14 · Kürzeste Wege & Dijkstras Algorithmus<br />
        Prof. Dr. Veronika Lesch · Theoretische Informatik II · DHBW Mosbach
      </footer>
    </div>
  );
}