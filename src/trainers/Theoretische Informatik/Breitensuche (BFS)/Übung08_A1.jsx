import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   Übung 08 · Aufgabe 1 (a–d) — Dijkstra-Algorithmus
   Animierter, anfängerfreundlicher Erklärer für die Lern-Trainer-Galerie.
   src/trainers/Dijkstra/Dijkstra.jsx
   ========================================================================= */

/* ---- Festes Design-System (Dark Theme) -------------------------------- */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc",  // cyan — steht für "endgültig kürzeste Distanz / fertiger Knoten"
  accent2: "#a78bfa", // violett — steht für "Relax / Kante wird gerade geprüft"
  good: "#86efac",    // grün – Erfolg/Treffer
  warn: "#fca5a5",    // rot – Problem/Fehler
  gold: "#fcd34d",    // gelb – Highlight / aktiver Knoten
};

/* ---- Keyframes & globale Mini-Styles ---------------------------------- */
const styleSheet = `
@keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
@keyframes pulse { 0%,100%{filter:drop-shadow(0 0 0 ${C.gold}00)} 50%{filter:drop-shadow(0 0 6px ${C.gold}cc)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.45} }
.dj-pop { animation: pop .35s ease-out both; }
.dj-pulse { animation: pulse 1.4s ease-in-out infinite; }
.dj-btn:hover { filter: brightness(1.12); }
.dj-btn:active { transform: translateY(1px); }
.dj-link { color: ${C.accent}; }
* { box-sizing: border-box; }
`;

/* ---- Scroll-Reveal-Hook ----------------------------------------------- */
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

/* ---- Wiederverwendbare Bausteine -------------------------------------- */
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
      <h2 style={{ margin: "0 0 20px", fontSize: 28, lineHeight: 1.2, color: C.text }}>
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
        gap: 6,
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
        background: `${C.accent2}1a`,
        border: `1px solid ${C.accent2}55`,
        borderRadius: 14,
        padding: "16px 18px",
        margin: "18px 0",
      }}
    >
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6, fontSize: 15 }}>
        💡 {title}
      </div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 14,
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 10,
      }}
    >
      <div style={{ width: 4, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{name}</span>
          {formula && (
            <code
              style={{
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 13,
                color: C.accent,
                fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              }}
            >
              {formula}
            </code>
          )}
        </div>
        {note && (
          <div style={{ color: C.dim, fontSize: 13.5, marginTop: 5, lineHeight: 1.55 }}>
            {note}
          </div>
        )}
      </div>
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
        padding: "12px 14px",
      }}
    >
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>
        {term}
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

/* ---- Button-Styles ----------------------------------------------------- */
const btn = {
  background: C.accent,
  color: "#06131c",
  border: "none",
  borderRadius: 9,
  padding: "8px 16px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  transition: "filter .15s, transform .05s",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 9,
  padding: "8px 16px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  transition: "filter .15s, transform .05s",
};

/* =========================================================================
   GRAPH-DATEN (exakt der Übungsgraph)
   Kanten gerichtet:  A→B 10, A→D 5, B→C 10, B→E 25, B→D 10, C→E 5, D→E 25
   ========================================================================= */
const NODES = {
  A: { x: 70, y: 150 },
  B: { x: 220, y: 70 },
  C: { x: 380, y: 70 },
  D: { x: 220, y: 230 },
  E: { x: 380, y: 230 },
};
const EDGES = [
  { from: "A", to: "B", w: 10 },
  { from: "A", to: "D", w: 5 },
  { from: "B", to: "C", w: 10 },
  { from: "B", to: "E", w: 25 },
  { from: "B", to: "D", w: 10 },
  { from: "C", to: "E", w: 5 },
  { from: "D", to: "E", w: 25 },
];
const ORDER = ["A", "B", "C", "D", "E"];

/* Farben für Knoten-Zustand (nach VL-Notation weiß/grau/schwarz) */
const stateColor = {
  white: C.dim,    // unentdeckt
  gray: C.gold,    // in der Warteschlange (entdeckt)
  black: C.accent, // fertig (endgültige Distanz)
};

/* ---------- Hilfsfunktion: Pfeil-Pfad zwischen zwei Knoten ------------- */
function edgeGeom(a, b) {
  const r = 22;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: a.x + ux * r,
    y1: a.y + uy * r,
    x2: b.x - ux * (r + 6),
    y2: b.y - uy * (r + 6),
    mx: (a.x + b.x) / 2,
    my: (a.y + b.y) / 2,
  };
}

/* =========================================================================
   VIS 1 — Dijkstra Live-Stepper
   Spielt die exakten Iterationen des Übungsgraphen ab und zeigt
   Distanztabelle + Warteschlange + Knotenfarben synchron.
   ========================================================================= */
const DIJKSTRA_STEPS = buildDijkstraSteps();

function buildDijkstraSteps() {
  // Erzeugt die Folge von Schnappschüssen, exakt wie händisch durchgerechnet.
  const adj = {};
  ORDER.forEach((n) => (adj[n] = []));
  EDGES.forEach((e) => adj[e.from].push({ to: e.to, w: e.w }));

  const INF = Infinity;
  const d = {}, pi = {}, color = {};
  ORDER.forEach((n) => {
    d[n] = INF;
    pi[n] = null;
    color[n] = "white";
  });
  d.A = 0;
  color.A = "gray";

  const steps = [];
  const snap = (caption, extra = {}) =>
    steps.push({
      d: { ...d },
      pi: { ...pi },
      color: { ...color },
      caption,
      ...extra,
    });

  snap("Initialisierung: A.d = 0 (Start), alle anderen ∞. A ist grau (entdeckt).", {
    em: 0,
    queue: ["A"],
    active: null,
  });

  let em = 0;
  const inQueue = () =>
    ORDER.filter((n) => color[n] === "gray").sort((a, b) => d[a] - d[b]);

  while (inQueue().length > 0) {
    em += 1;
    const q = inQueue();
    const u = q[0]; // ExtractMin: kleinste d unter den grauen
    snap(
      `ExtractMin #${em}: kleinste Distanz in der Warteschlange ist ${u} (d=${d[u]}). ${u} wird aktiv.`,
      { em, queue: q.slice(), active: u, justExtracted: true }
    );

    for (const { to: v, w } of adj[u]) {
      const before = d[v];
      const candidate = d[u] + w;
      if (candidate < d[v]) {
        d[v] = candidate;
        pi[v] = u;
        color[v] = "gray";
        snap(
          `Relax(${u}→${v}): ${u}.d + w = ${d[u]} + ${w} = ${candidate} < ` +
            `${before === INF ? "∞" : before}  ✔  →  ${v}.d = ${candidate}, π(${v}) = ${u}`,
          { em, queue: inQueue(), active: u, relaxEdge: [u, v], relaxOk: true }
        );
      } else {
        snap(
          `Relax(${u}→${v}): ${u}.d + w = ${d[u]} + ${w} = ${candidate} ≥ ` +
            `${before === INF ? "∞" : before}  ✘  →  keine Verbesserung`,
          { em, queue: inQueue(), active: u, relaxEdge: [u, v], relaxOk: false }
        );
      }
    }
    color[u] = "black";
    snap(`${u} ist fertig (schwarz): d=${d[u]} ist jetzt endgültig kürzeste Distanz.`, {
      em,
      queue: inQueue(),
      active: u,
      finalized: u,
    });
  }
  snap(
    "Warteschlange leer → fertig. Alle Distanzen von A aus sind endgültig berechnet.",
    { em, queue: [], active: null, done: true }
  );
  return steps;
}

function GraphSVG({ step }) {
  const treeEdges = new Set();
  // Kürzeste-Wege-Baum aus aktuellen π-Zeigern ableiten
  ORDER.forEach((n) => {
    if (step.pi[n]) treeEdges.add(step.pi[n] + n);
  });
  const relaxKey = step.relaxEdge ? step.relaxEdge.join("") : null;

  return (
    <svg viewBox="0 0 450 300" style={{ width: "100%", height: "auto", display: "block" }}>
      {/* Kanten */}
      {EDGES.map((e, i) => {
        const g = edgeGeom(NODES[e.from], NODES[e.to]);
        const isTree = treeEdges.has(e.from + e.to);
        const isRelax = relaxKey === e.from + e.to;
        let col = C.line;
        let wid = 2;
        if (isTree) {
          col = C.accent;
          wid = 3;
        }
        if (isRelax) {
          col = step.relaxOk ? C.good : C.warn;
          wid = 3.5;
        }
        return (
          <g key={i}>
            <line
              x1={g.x1}
              y1={g.y1}
              x2={g.x2}
              y2={g.y2}
              stroke={col}
              strokeWidth={wid}
              markerEnd={`url(#arr-${isTree ? "tree" : isRelax ? (step.relaxOk ? "ok" : "no") : "def"})`}
              style={{ transition: "stroke .3s, stroke-width .3s" }}
            />
            <rect
              x={g.mx - 11}
              y={g.my - 10}
              width={22}
              height={18}
              rx={4}
              fill={C.bg}
              opacity={0.85}
            />
            <text x={g.mx} y={g.my + 3} textAnchor="middle" fontSize="12" fill={C.dim}>
              {e.w}
            </text>
          </g>
        );
      })}

      {/* Pfeilspitzen-Definitionen */}
      <defs>
        {[
          ["def", C.line],
          ["tree", C.accent],
          ["ok", C.good],
          ["no", C.warn],
        ].map(([id, col]) => (
          <marker
            key={id}
            id={`arr-${id}`}
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L7,3 L0,6 Z" fill={col} />
          </marker>
        ))}
      </defs>

      {/* Knoten */}
      {ORDER.map((n) => {
        const p = NODES[n];
        const col = stateColor[step.color[n]];
        const isActive = step.active === n;
        const dist = step.d[n];
        return (
          <g key={n} className={isActive ? "dj-pulse" : ""}>
            <circle
              cx={p.x}
              cy={p.y}
              r={22}
              fill={C.panel2}
              stroke={col}
              strokeWidth={isActive ? 4 : 3}
              style={{ transition: "stroke .3s, stroke-width .3s" }}
            />
            <text
              x={p.x}
              y={p.y - 1}
              textAnchor="middle"
              fontSize="15"
              fontWeight="700"
              fill={C.text}
            >
              {n}
            </text>
            <text x={p.x} y={p.y + 13} textAnchor="middle" fontSize="10" fill={col}>
              {dist === Infinity ? "∞" : dist}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DijkstraVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = DIJKSTRA_STEPS[i];
  const last = DIJKSTRA_STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, last)), 1600);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  return (
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        {/* Graph */}
        <div style={{ background: C.bg, borderRadius: 12, padding: 10 }}>
          <GraphSVG step={step} />
        </div>

        {/* Distanztabelle */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {["", ...ORDER].map((h, k) => (
                  <th
                    key={k}
                    style={{
                      borderBottom: `1px solid ${C.line}`,
                      padding: "6px 8px",
                      color: C.dim,
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px", color: C.dim }}>d</td>
                {ORDER.map((n) => {
                  const v = step.d[n];
                  const col = stateColor[step.color[n]];
                  return (
                    <td
                      key={n}
                      style={{
                        padding: "6px 8px",
                        textAlign: "center",
                        color: col,
                        fontWeight: 700,
                        background: step.active === n ? `${C.gold}22` : "transparent",
                        transition: "background .3s",
                      }}
                    >
                      {v === Infinity ? "∞" : v}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td style={{ padding: "6px 8px", color: C.dim }}>π</td>
                {ORDER.map((n) => (
                  <td
                    key={n}
                    style={{ padding: "6px 8px", textAlign: "center", color: C.dim }}
                  >
                    {step.pi[n] || "–"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warteschlange */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: C.dim, fontSize: 13 }}>Warteschlange Q (nach d sortiert):</span>
          {step.queue.length === 0 ? (
            <span style={{ color: C.dim, fontStyle: "italic" }}>leer</span>
          ) : (
            step.queue.map((n) => (
              <span
                key={n}
                className="dj-pop"
                style={{
                  background: n === step.active ? C.gold : C.panel2,
                  color: n === step.active ? "#1a1400" : C.text,
                  border: `1px solid ${C.line}`,
                  borderRadius: 8,
                  padding: "3px 11px",
                  fontWeight: 700,
                  fontSize: 13.5,
                }}
              >
                {n}
                <span style={{ opacity: 0.6, marginLeft: 4 }}>
                  {step.d[n] === Infinity ? "∞" : step.d[n]}
                </span>
              </span>
            ))
          )}
        </div>

        {/* Caption */}
        <div
          style={{
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "12px 14px",
            minHeight: 56,
            color: C.text,
            fontSize: 14.5,
            lineHeight: 1.55,
            borderLeft: `3px solid ${
              step.done ? C.good : step.relaxEdge ? (step.relaxOk ? C.good : C.warn) : C.accent2
            }`,
          }}
        >
          {step.caption}
        </div>

        {/* Steuerung */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            className="dj-btn"
            style={btn}
            onClick={() => {
              if (i >= last) setI(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? "⏸ Pause" : i >= last ? "↻ Nochmal" : "▶ Abspielen"}
          </button>
          <button
            className="dj-btn"
            style={btnGhost}
            onClick={() => {
              setPlaying(false);
              setI((x) => Math.max(0, x - 1));
            }}
          >
            ◀ Zurück
          </button>
          <button
            className="dj-btn"
            style={btnGhost}
            onClick={() => {
              setPlaying(false);
              setI((x) => Math.min(last, x + 1));
            }}
          >
            Vor ▶
          </button>
          <button
            className="dj-btn"
            style={btnGhost}
            onClick={() => {
              setPlaying(false);
              setI(0);
            }}
          >
            Reset
          </button>
          <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>
            Schritt {i + 1} / {DIJKSTRA_STEPS.length}
          </span>
        </div>

        {/* Legende */}
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          <Tag color={stateColor.white}>weiß = unentdeckt (∞)</Tag>
          <Tag color={stateColor.gray}>grau = in Q (entdeckt)</Tag>
          <Tag color={stateColor.black}>schwarz = fertig (endgültig)</Tag>
          <Tag color={C.good}>Relax verbessert</Tag>
          <Tag color={C.warn}>Relax verwirft</Tag>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 2 — Pfad-Rekonstruktion A → E über die π-Zeiger (Aufgabe c)
   ========================================================================= */
const PI_FINAL = { A: null, B: "A", C: "B", D: "A", E: "C" };
const D_FINAL = { A: 0, B: 10, C: 20, D: 5, E: 25 };

function PathVis() {
  // Rückverfolgung von E: E ← C ← B ← A  →  Pfad A→B→C→E
  const chain = [];
  let cur = "E";
  while (cur) {
    chain.unshift(cur);
    cur = PI_FINAL[cur];
  }
  const maxStep = chain.length; // 0..chain.length: wie viele Knoten schon "aufgedeckt"
  const [s, setS] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (s >= maxStep) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setS((x) => x + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, s, maxStep]);

  // beim Rückverfolgen decken wir von E nach A auf:
  const revealed = chain.slice(chain.length - s); // letzte s Knoten der Kette
  const onPath = (n) => revealed.includes(n);
  const pathEdgeSet = new Set();
  for (let k = 1; k < chain.length; k++) {
    if (onPath(chain[k]) && onPath(chain[k - 1])) pathEdgeSet.add(chain[k - 1] + chain[k]);
  }

  const stepSnap = {
    color: Object.fromEntries(ORDER.map((n) => [n, onPath(n) ? "black" : "white"])),
    d: D_FINAL,
    pi: PI_FINAL,
    active: s > 0 && s <= chain.length ? chain[chain.length - s] : null,
  };

  return (
    <Card>
      <div style={{ background: C.bg, borderRadius: 12, padding: 10, marginBottom: 16 }}>
        <svg viewBox="0 0 450 300" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <marker id="arr-path" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C.good} />
            </marker>
            <marker id="arr-grey" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C.line} />
            </marker>
          </defs>
          {EDGES.map((e, i) => {
            const g = edgeGeom(NODES[e.from], NODES[e.to]);
            const on = pathEdgeSet.has(e.from + e.to);
            return (
              <g key={i}>
                <line
                  x1={g.x1}
                  y1={g.y1}
                  x2={g.x2}
                  y2={g.y2}
                  stroke={on ? C.good : C.line}
                  strokeWidth={on ? 3.5 : 2}
                  markerEnd={`url(#arr-${on ? "path" : "grey"})`}
                  style={{ transition: "stroke .3s, stroke-width .3s" }}
                />
                <rect x={g.mx - 11} y={g.my - 10} width={22} height={18} rx={4} fill={C.bg} opacity={0.85} />
                <text x={g.mx} y={g.my + 3} textAnchor="middle" fontSize="12" fill={on ? C.good : C.dim}>
                  {e.w}
                </text>
              </g>
            );
          })}
          {ORDER.map((n) => {
            const p = NODES[n];
            const on = onPath(n);
            const isActive = stepSnap.active === n;
            return (
              <g key={n} className={isActive ? "dj-pulse" : ""}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={22}
                  fill={C.panel2}
                  stroke={on ? C.good : C.dim}
                  strokeWidth={isActive ? 4 : 3}
                  style={{ transition: "stroke .3s" }}
                />
                <text x={p.x} y={p.y - 1} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.text}>
                  {n}
                </text>
                <text x={p.x} y={p.y + 13} textAnchor="middle" fontSize="10" fill={on ? C.good : C.dim}>
                  {D_FINAL[n]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        style={{
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          minHeight: 50,
          color: C.text,
          fontSize: 14.5,
          lineHeight: 1.55,
          borderLeft: `3px solid ${s >= maxStep ? C.good : C.accent2}`,
        }}
      >
        {s === 0 && "Start beim Ziel E. Wir folgen den Vorgänger-Zeigern π rückwärts bis A."}
        {s > 0 && s < maxStep && (
          <>
            π({chain[chain.length - s]}) = <b>{PI_FINAL[chain[chain.length - s]]}</b> → einen Schritt
            näher an A.
          </>
        )}
        {s >= maxStep && (
          <>
            Pfad gefunden: <b>A → B → C → E</b>. Länge = E.d = <b>25</b> (10 + 10 + 5).
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button
          className="dj-btn"
          style={btn}
          onClick={() => {
            if (s >= maxStep) setS(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? "⏸ Pause" : s >= maxStep ? "↻ Nochmal" : "▶ Pfad zurückverfolgen"}
        </button>
        <button className="dj-btn" style={btnGhost} onClick={() => { setPlaying(false); setS((x) => Math.max(0, x - 1)); }}>
          ◀ Zurück
        </button>
        <button className="dj-btn" style={btnGhost} onClick={() => { setPlaying(false); setS((x) => Math.min(maxStep, x + 1)); }}>
          Vor ▶
        </button>
        <button className="dj-btn" style={btnGhost} onClick={() => { setPlaying(false); setS(0); }}>
          Reset
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, marginTop: 14 }}>
        <Tag color={C.good}>auf dem kürzesten Pfad</Tag>
        <Tag color={C.dim}>nicht auf dem Pfad</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 3 — Graph ↔ Adjazenzmatrix interaktiv (Aufgabe d, + Bezug zu b)
   ========================================================================= */
function MatrixVis() {
  const [hover, setHover] = useState(null); // {from,to}
  const [mode, setMode] = useState("classic"); // "classic" | "distance"

  // klassische Matrix: Kantengewichte (Richtung from→to)
  const wOf = (a, b) => {
    const e = EDGES.find((x) => x.from === a && x.to === b);
    return e ? e.w : null;
  };
  // Distanzmatrix-Zeile A (aus Dijkstra)
  const distRowA = (b) => (b === "A" ? 0 : D_FINAL[b]);

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          className="dj-btn"
          style={mode === "classic" ? btn : btnGhost}
          onClick={() => setMode("classic")}
        >
          Klassische Matrix (d)
        </button>
        <button
          className="dj-btn"
          style={mode === "distance" ? btn : btnGhost}
          onClick={() => setMode("distance")}
        >
          Distanzmatrix ab A (b)
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 18,
        }}
      >
        {/* Graph */}
        <div style={{ background: C.bg, borderRadius: 12, padding: 10 }}>
          <svg viewBox="0 0 450 300" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <marker id="arr-m" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill={C.line} />
              </marker>
              <marker id="arr-mh" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill={C.gold} />
              </marker>
            </defs>
            {EDGES.map((e, i) => {
              const g = edgeGeom(NODES[e.from], NODES[e.to]);
              const hot = hover && hover.from === e.from && hover.to === e.to;
              return (
                <g key={i}>
                  <line
                    x1={g.x1}
                    y1={g.y1}
                    x2={g.x2}
                    y2={g.y2}
                    stroke={hot ? C.gold : C.line}
                    strokeWidth={hot ? 4 : 2}
                    markerEnd={`url(#arr-${hot ? "mh" : "m"})`}
                    style={{ transition: "stroke .3s, stroke-width .3s" }}
                  />
                  <rect x={g.mx - 11} y={g.my - 10} width={22} height={18} rx={4} fill={C.bg} opacity={0.85} />
                  <text x={g.mx} y={g.my + 3} textAnchor="middle" fontSize="12" fill={hot ? C.gold : C.dim}>
                    {e.w}
                  </text>
                </g>
              );
            })}
            {ORDER.map((n) => {
              const p = NODES[n];
              const hot = hover && (hover.from === n || hover.to === n);
              return (
                <g key={n}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={22}
                    fill={C.panel2}
                    stroke={hot ? C.gold : C.dim}
                    strokeWidth={3}
                    style={{ transition: "stroke .3s" }}
                  />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.text}>
                    {n}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Matrix */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", margin: "0 auto", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ padding: 8, color: C.accent2 }}>
                  {mode === "classic" ? "von ↓ / nach →" : "A →"}
                </th>
                {ORDER.map((c) => (
                  <th key={c} style={{ padding: "8px 12px", color: C.dim, fontWeight: 700 }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(mode === "classic" ? ORDER : ["A"]).map((r) => (
                <tr key={r}>
                  <td style={{ padding: "8px 12px", color: C.dim, fontWeight: 700 }}>{r}</td>
                  {ORDER.map((c) => {
                    let val, isVal;
                    if (mode === "classic") {
                      const w = wOf(r, c);
                      isVal = w !== null;
                      val = isVal ? w : r === c ? "0" : "∞";
                    } else {
                      val = distRowA(c);
                      isVal = true;
                    }
                    const hot =
                      hover &&
                      ((mode === "classic" && hover.from === r && hover.to === c) ||
                        (mode === "distance" && hover.to === c));
                    return (
                      <td
                        key={c}
                        onMouseEnter={() =>
                          mode === "classic"
                            ? isVal && setHover({ from: r, to: c })
                            : setHover({ from: "A", to: c })
                        }
                        onMouseLeave={() => setHover(null)}
                        style={{
                          padding: "8px 12px",
                          textAlign: "center",
                          border: `1px solid ${C.line}`,
                          color: isVal && val !== "∞" && val !== "0" ? C.accent : C.dim,
                          fontWeight: isVal && val !== "∞" ? 700 : 400,
                          background: hot ? `${C.gold}22` : "transparent",
                          cursor: isVal ? "pointer" : "default",
                          transition: "background .2s",
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InfoBox title={mode === "classic" ? "Klassische Adjazenzmatrix (Aufgabe d)" : "Distanzmatrix ab A (Aufgabe b)"}>
        {mode === "classic" ? (
          <>
            Jeder Eintrag <code>M[u][v]</code> ist das <b>Kantengewicht</b> der gerichteten Kante
            u→v – oder <b>∞</b>, wenn keine Kante existiert (Diagonale 0). Weil der Graph
            gerichtet ist, ist die Matrix <b>nicht symmetrisch</b> (z. B. A→B = 10, aber B→A = ∞).
            Fahr mit der Maus über einen Eintrag, um die zugehörige Kante zu sehen.
          </>
        ) : (
          <>
            Hier stehen die von Dijkstra berechneten <b>kürzesten Distanzen</b> ab A (eine Zeile).
            Für eine <b>vollständige</b> Distanzmatrix müsste man Dijkstra von <b>jedem</b> Knoten
            als Start neu ausführen (|V|-mal) – das ergibt dann eine 5×5-Matrix kürzester Wege.
          </>
        )}
      </InfoBox>

      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
        <Tag color={C.gold}>verknüpft (Hover)</Tag>
        <Tag color={C.accent}>vorhandener Eintrag</Tag>
        <Tag color={C.dim}>∞ / keine Kante</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   HAUPTKOMPONENTE
   ========================================================================= */
export default function Dijkstra() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{styleSheet}</style>

      {/* Hero */}
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "64px 24px 24px",
        }}
      >
        <div
          style={{
            color: C.accent2,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Übung 08 · Aufgabe 1 (a–d)
        </div>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 16px" }}>
          Der <span style={{ color: C.accent }}>Dijkstra</span>-Algorithmus
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: C.dim, maxWidth: 680 }}>
          Wie findet man den kürzesten Weg in einem gewichteten Graphen? Dieser Erklärer
          baut Dijkstra Schritt für Schritt am Übungsgraphen auf – von der Idee über die
          Iterationstabelle und den kürzesten Pfad A→E bis zur Adjazenzmatrix. Jeder Begriff
          wird beim ersten Auftreten erklärt.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        {/* 0. Das Problem */}
        <Section kicker="0 · Motivation" title="Warum braucht man das überhaupt?">
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            Stell dir ein Straßen- oder Bahnnetz vor: Kreuzungen/Bahnhöfe sind{" "}
            <b>Knoten</b> (engl. <i>vertices</i>, die Punkte des Graphen), Straßen sind{" "}
            <b>Kanten</b> (engl. <i>edges</i>, die Verbindungen). Jede Kante hat ein{" "}
            <b>Gewicht</b> w (z. B. Fahrtzeit oder Entfernung). Die Frage „Wie komme ich am
            schnellsten von A nach E?“ ist das <b>Kürzeste-Wege-Problem</b>.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            Wir betrachten einen <b>gerichteten</b> Graphen (Kanten haben eine Richtung, dargestellt
            durch Pfeile – eine Einbahnstraße) mit <b>nicht-negativen</b> Gewichten. Genau für diesen
            Fall ist Dijkstra das Standardverfahren: Es berechnet die kürzesten Distanzen von
            einem <b>Startknoten</b> s zu <b>allen</b> anderen Knoten (das sogenannte{" "}
            <b>SSSP-Problem</b>, <i>Single-Source-Shortest-Path</i> – „kürzeste Wege von einer Quelle“).
          </p>
          <InfoBox title="Voraussetzung: keine negativen Gewichte">
            Dijkstra setzt voraus, dass alle Kantengewichte ≥ 0 sind. Bei negativen Gewichten
            würde die Greedy-Annahme (siehe Kernidee) brechen – dafür gibt es Bellman-Ford. Im
            Übungsgraphen sind alle Gewichte positiv, also passt Dijkstra perfekt.
          </InfoBox>
        </Section>

        {/* 1. Die Kernidee */}
        <Section kicker="1 · Kernidee" title="Immer den nächstgelegenen Knoten zuerst abschließen">
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            Dijkstra ist eine <b>Greedy</b>-Strategie („gierig“ – trifft in jedem Schritt die lokal
            beste Wahl): Wir verwalten für jeden Knoten v eine vorläufige Distanz{" "}
            <code style={codeInline}>v.d</code> (kürzeste bisher bekannte Distanz vom Start). Anfangs
            ist <code style={codeInline}>s.d = 0</code> und alle anderen{" "}
            <code style={codeInline}>∞</code> (unendlich – „noch kein Weg bekannt“).
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            In jeder Runde nehmen wir aus der <b>Warteschlange</b> den Knoten mit der{" "}
            <b>kleinsten</b> aktuellen Distanz (<b>ExtractMin</b> – „entnimm das Minimum“). Für
            diesen Knoten steht die kürzeste Distanz dann <b>endgültig</b> fest. Anschließend
            aktualisieren wir die Nachbarn (<b>Relax</b>). Das wiederholen wir, bis die
            Warteschlange leer ist.
          </p>
          <InfoBox title="Drei Farben für drei Zustände">
            In der Vorlesung markieren wir Knoten farbig: <b>weiß</b> = noch nicht entdeckt
            (Distanz ∞), <b>grau</b> = entdeckt und in der Warteschlange, <b>schwarz</b> = fertig
            abgeschlossen (endgültige Distanz steht fest). Diese Farben siehst du gleich live in
            der ersten Animation.
          </InfoBox>
        </Section>

        {/* 2. Der schwierige Teil: Relax */}
        <Section kicker="2 · Der Kern-Mechanismus" title="Relax – der Schritt, der alles antreibt">
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            <b>Relax(u, v)</b> ist der Moment, in dem entlang einer Kante u→v geprüft wird, ob
            der Umweg über u den bekannten Weg zu v <i>verkürzt</i>. Die Bedingung lautet:
          </p>
          <pre style={preBox}>
{`Relax(u, v, w):
  wenn  v.d  >  u.d + w(u,v):     # gibt es über u einen kürzeren Weg?
      v.d = u.d + w(u,v)          # neue, kürzere Distanz übernehmen
      v.π = u                     # u als Vorgänger merken
      v.color = grau              # v ist (jetzt) entdeckt
      Q.DecreaseKey(v)            # v in der Warteschlange nach oben`}
          </pre>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            <code style={codeInline}>v.π</code> (sprich „pi von v“) ist der{" "}
            <b>Vorgänger-Zeiger</b>: der Knoten, über den man v am günstigsten erreicht. Aus diesen
            Zeigern setzen wir später den kürzesten Pfad zusammen. <b>DecreaseKey</b> heißt „Schlüssel
            verkleinern“ – die Warteschlange ist nach d sortiert, und wenn v.d sinkt, rutscht v nach vorne.
          </p>
          <InfoBox title="Warum funktioniert das Greedy-Prinzip?">
            Sobald ein grauer Knoten u die kleinste Distanz in der Warteschlange hat, kann kein
            späterer Weg ihn noch verkürzen – denn alle anderen offenen Wege starten bei einer{" "}
            <i>größeren</i> Distanz, und Gewichte sind nie negativ. Darum darf u sofort „schwarz“
            (endgültig) werden. Genau hier bräuchte man bei negativen Gewichten ein anderes Verfahren.
          </InfoBox>
        </Section>

        {/* VIS 1 */}
        <Section
          kicker="Aufgabe a · Live"
          title="Dijkstra Schritt für Schritt am Übungsgraphen"
        >
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, marginBottom: 18 }}>
            Spiel die Iterationen ab: Du siehst pro Schritt die Distanztabelle (<b>d</b> und
            Vorgänger <b>π</b>), die nach Distanz sortierte Warteschlange <b>Q</b>, den aktiven
            Knoten (<b>ExtractMin</b>) und jede <b>Relax</b>-Prüfung. Cyan-Kanten bilden den
            entstehenden <b>Kürzeste-Wege-Baum</b>. Das ist genau die Übersichtstabelle aus
            Aufgabe a) in Bewegung.
          </p>
          <DijkstraVis />
          <InfoBox title="Das Ergebnis von Aufgabe a">
            Reihenfolge der ExtractMin-Aufrufe: <b>A (0) → D (5) → B (10) → C (20) → E (25)</b>.
            Endgültige Distanzen ab A: A=0, D=5, B=10, C=20, E=25. Beachte: D wird vor B
            abgeschlossen (5 &lt; 10), und E bekommt zuerst d=30 über D, wird dann aber über C auf 25
            verbessert.
          </InfoBox>
        </Section>

        {/* 3. Varianten / Qualität: Laufzeit je nach Datenstruktur */}
        <Section
          kicker="3 · Varianten"
          title="Wie schnell ist Dijkstra? Es hängt an der Warteschlange"
        >
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, marginBottom: 16 }}>
            Dijkstra ruft <b>ExtractMin</b> genau |V|-mal auf (einmal pro Knoten) und{" "}
            <b>DecreaseKey</b> bis zu |E|-mal (einmal pro Kante, beim Relaxen). Wie teuer das
            insgesamt ist, hängt davon ab, wie die Prioritätswarteschlange implementiert ist
            (|V| = Anzahl Knoten, |E| = Anzahl Kanten):
          </p>
          <MethodRow
            color={C.warn}
            name="Unsortiertes Feld"
            formula="O(V² + E)"
            note="ExtractMin durchsucht jedes Mal das ganze Feld → O(V). DecreaseKey ist billig O(1). Für dichte Graphen okay, sonst langsam."
          />
          <MethodRow
            color={C.good}
            name="Binärer Heap (MinHeap)"
            formula="O((E + V) · log V)"
            note="ExtractMin und DecreaseKey kosten je O(log V). Das ist die in der Vorlesung verwendete Standard-Variante."
          />
          <MethodRow
            color={C.accent}
            name="Fibonacci-Heap"
            formula="O(E + V · log V)"
            note="DecreaseKey amortisiert O(1). Theoretisch optimal, in der Praxis wegen hoher Konstanten oft langsamer."
          />
          <InfoBox title="O-Notation (zur Erinnerung)">
            <b>O(f(n))</b> beschreibt eine <i>obere Schranke</i> des Wachstums: Wie stark steigt der
            Aufwand, wenn die Eingabe (hier: Knoten- und Kantenzahl) wächst? Konstante Faktoren und
            kleine Terme werden weggelassen – es zählt nur das dominante Wachstumsverhalten.
          </InfoBox>
        </Section>

        {/* 4. Sonderfall / Pfad-Rekonstruktion (Aufgabe c) */}
        <Section
          kicker="Aufgabe c · Live"
          title="Der kürzeste Pfad A → E – aus den π-Zeigern zurückgebaut"
        >
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, marginBottom: 18 }}>
            Dijkstra liefert nicht nur die Distanz, sondern über die Vorgänger-Zeiger <b>π</b> auch
            den konkreten Weg. Man startet beim Ziel <b>E</b> und folgt π rückwärts, bis man beim
            Start A ankommt. Spiel die Rückverfolgung ab:
          </p>
          <PathVis />
          <InfoBox title="Antwort auf Aufgabe c">
            Kürzester Pfad von A nach E: <b>A → B → C → E</b> mit Länge <b>25</b> (= 10 + 10 + 5).
            Der direkte Sprung B→E (Gewicht 25) oder der Weg über D (5 + 25 = 30) sind länger – der
            Umweg über C ist die beste Wahl.
          </InfoBox>
        </Section>

        {/* 5. Adjazenzmatrix (Aufgabe b + d) */}
        <Section
          kicker="Aufgaben b & d · Live"
          title="Graph als Adjazenzmatrix darstellen"
        >
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text, marginBottom: 18 }}>
            Eine <b>Adjazenzmatrix</b> (lat. <i>adiacere</i> = „angrenzen“) ist eine Tabelle, in der
            Zeile u und Spalte v angeben, ob/wie u mit v verbunden ist. Schalte zwischen der{" "}
            <b>klassischen</b> Matrix (Kantengewichte, Aufgabe d) und der <b>Distanzmatrix ab A</b>{" "}
            (Dijkstra-Distanzen, Aufgabe b) um. Fahr über Einträge, um die Kante im Graphen
            hervorzuheben.
          </p>
          <MatrixVis />
        </Section>

        {/* 6. Analyse / Korrektheit Zusammenfassung */}
        <Section kicker="5 · Analyse" title="Korrektheit & Laufzeit auf einen Blick">
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            <b>Korrektheit:</b> Wenn ein Knoten u per ExtractMin gewählt und schwarz gefärbt wird,
            ist <code style={codeInline}>u.d</code> bereits die endgültige kürzeste Distanz. Das gilt,
            weil jeder noch offene (graue/weiße) Weg über einen Knoten mit ≥ u.d führen müsste – und
            nicht-negative Gewichte können diese Distanz nicht mehr senken.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
            <b>Laufzeit:</b> Mit binärem Heap <b>O((E + V)·log V)</b>, mit Fibonacci-Heap{" "}
            <b>O(E + V·log V)</b>. ExtractMin läuft |V|-mal, Relax/DecreaseKey insgesamt Θ(E)-mal.
          </p>
        </Section>

        {/* Zusammenfassung */}
        <Section kicker="6 · Auf einen Blick" title="Zusammenfassung">
          <Card style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}44` }}>
            <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.9, fontSize: 16 }}>
              <li>
                Dijkstra löst das <b>SSSP-Problem</b> für gerichtete Graphen mit{" "}
                <b>nicht-negativen</b> Gewichten.
              </li>
              <li>
                Greedy-Schleife: <b>ExtractMin</b> (kleinste Distanz) → schwarz färben →{" "}
                <b>Relax</b> aller Nachbarn → wiederholen.
              </li>
              <li>
                <b>Übungsgraph:</b> Distanzen ab A = A:0, D:5, B:10, C:20, E:25. ExtractMin-Reihenfolge
                A, D, B, C, E.
              </li>
              <li>
                <b>Kürzester Pfad A→E:</b> A → B → C → E, Länge <b>25</b>.
              </li>
              <li>
                <b>π-Zeiger</b> bauen den Pfad zurück; <b>Adjazenzmatrix</b> ist asymmetrisch, weil der
                Graph gerichtet ist.
              </li>
              <li>
                Laufzeit mit Heap: <b>O((E + V)·log V)</b>.
              </li>
            </ul>
          </Card>
        </Section>

        {/* Glossar */}
        <Section kicker="7 · Glossar" title="Begriffe & Symbole kompakt">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: 12,
            }}
          >
            <GlossEntry term="Knoten / Vertex (V)" def="Punkt im Graphen, z. B. eine Kreuzung. |V| = Anzahl der Knoten." />
            <GlossEntry term="Kante / Edge (E)" def="Gerichtete Verbindung u→v mit Gewicht w. |E| = Anzahl der Kanten." />
            <GlossEntry term="Gewicht w(u,v)" def="Kosten/Länge einer Kante. Bei Dijkstra immer ≥ 0." />
            <GlossEntry term="v.d" def="Vorläufig kürzeste bekannte Distanz vom Start zu v. Endgültig, sobald v schwarz ist." />
            <GlossEntry term="v.π (pi)" def="Vorgänger-Zeiger: Knoten, über den v am günstigsten erreicht wird." />
            <GlossEntry term="ExtractMin" def="Entnimmt aus der Warteschlange den Knoten mit kleinster Distanz d." />
            <GlossEntry term="Relax(u,v)" def="Prüft, ob der Weg über u die Distanz zu v verkürzt; falls ja: aktualisieren." />
            <GlossEntry term="DecreaseKey" def="Verkleinert den Schlüssel (Distanz) eines Knotens in der Warteschlange." />
            <GlossEntry term="Greedy" def="Strategie, die in jedem Schritt die lokal beste Wahl trifft." />
            <GlossEntry term="weiß / grau / schwarz" def="Knotenzustände: unentdeckt / in Q entdeckt / fertig abgeschlossen." />
            <GlossEntry term="SSSP" def="Single-Source-Shortest-Path: kürzeste Wege von einer Quelle zu allen Knoten." />
            <GlossEntry term="Adjazenzmatrix" def="Tabelle, deren Eintrag [u][v] die Kante u→v (Gewicht oder ∞) angibt." />
            <GlossEntry term="Kürzeste-Wege-Baum" def="Baum aus allen π-Zeigern mit Wurzel s; enthält je einen kürzesten Pfad." />
            <GlossEntry term="O(·)" def="Obere Schranke für das Wachstum des Aufwands bei wachsender Eingabe." />
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "24px 24px 64px",
          borderTop: `1px solid ${C.line}`,
          color: C.dim,
          fontSize: 13.5,
          lineHeight: 1.7,
        }}
      >
        Theoretische Informatik · Algorithmen &amp; Komplexität — VL 14 (Dijkstra), Übung 08 Aufgabe 1
        <br />
        Prof. Dr. Veronika Lesch · DHBW Mosbach · Angewandte Informatik
      </footer>
    </div>
  );
}

/* ---- kleine Inline-Style-Helfer --------------------------------------- */
const codeInline = {
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 5,
  padding: "1px 6px",
  fontSize: 13.5,
  color: C.accent,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};
const preBox = {
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 12,
  padding: "16px 18px",
  overflowX: "auto",
  fontSize: 13.5,
  lineHeight: 1.6,
  color: C.text,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};