import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   Tiefensuche (DFS) & Topologische Sortierung — animierter Erklärer
   VL 15 · Prof. Dr. Veronika Lesch · DHBW Mosbach · Theoretische Informatik II
   ========================================================================= */

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#86efac",   // GRÜN — steht für KNOTEN (die "Orte"/Vertices im Graphen)
  accent2: "#fb923c",  // ORANGE — steht für KANTEN (die Verbindungen/Edges)
  good: "#86efac",     // grün – Erfolg/fertig (schwarz gefärbt)
  warn: "#fca5a5",     // rot – Problem/Rückwärtskante/Kreis
  gold: "#fcd34d",     // gelb – aktuelles Element / Highlight
};

/* --- globales Stylesheet (Keyframes) --- */
const STYLES = `
@keyframes pop { 0%{transform:scale(.4);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
@keyframes pulseGold { 0%,100%{box-shadow:0 0 0 0 rgba(252,211,77,.0)} 50%{box-shadow:0 0 0 6px rgba(252,211,77,.18)} }
* { box-sizing: border-box; }
`;

/* ======================= Wiederverwendbare Bausteine ===================== */

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

function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        marginBottom: 64,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(28px)",
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
      <h2 style={{ margin: "0 0 22px", fontSize: 30, lineHeight: 1.15, color: C.text }}>
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
        background: "rgba(251,146,60,0.08)",
        border: `1px solid ${C.accent2}55`,
        borderRadius: 14,
        padding: "18px 20px",
        margin: "18px 0",
      }}
    >
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6 }}>
        💡 {title}
      </div>
      <div style={{ color: C.text, lineHeight: 1.7, fontSize: 15 }}>{children}</div>
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
      <div style={{ color: C.accent, fontWeight: 700, marginBottom: 5, fontSize: 15 }}>
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
        gap: 16,
        alignItems: "flex-start",
        padding: "14px 0",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div style={{ width: 5, alignSelf: "stretch", background: color, borderRadius: 3 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <strong style={{ color: C.text, fontSize: 15 }}>{name}</strong>
          <code
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 13,
              color: color,
            }}
          >
            {formula}
          </code>
        </div>
        <div style={{ color: C.dim, fontSize: 14, marginTop: 5, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

/* --- Player-Steuerung (wiederverwendbar) --- */
function PlayerControls({ playing, onPlay, onPrev, onNext, onReset, step, total }) {
  const btn = {
    background: C.accent,
    color: C.bg,
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  };
  const btnGhost = {
    background: "transparent",
    color: C.text,
    border: `1px solid ${C.line}`,
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 14,
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={onPlay}>{playing ? "⏸ Pause" : "▶ Play"}</button>
      <button style={btnGhost} onClick={onPrev}>◀ Zurück</button>
      <button style={btnGhost} onClick={onNext}>Vor ▶</button>
      <button style={btnGhost} onClick={onReset}>↺ Reset</button>
      <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>
        Schritt {step + 1} / {total}
      </span>
    </div>
  );
}

/* ============================ VIS 1: DFS-Lauf ============================ */
/*
   Kleiner gerichteter Graph (an die Folie angelehnt):
     u → v , u → x
     v → y
     y → x   (Rückwärtskante, wenn x noch grau wäre -> hier Kreuz/zurück)
     w → y , w → z
     z → z   (Schleife = Rückwärtskante)
   Wir simulieren DFS und protokollieren JEDEN Färbe-/Zeitschritt.
*/
const NODES = {
  u: { x: 90,  y: 60 },
  v: { x: 250, y: 60 },
  w: { x: 410, y: 60 },
  x: { x: 90,  y: 200 },
  y: { x: 250, y: 200 },
  z: { x: 410, y: 200 },
};
const ADJ = {
  u: ["v", "x"],
  v: ["y"],
  w: ["y", "z"],
  x: ["v"],   // x → v : v ist Vorgänger (grau) ⇒ Rückwärtskante
  y: ["x"],
  z: ["z"],   // Selbstschleife ⇒ Rückwärtskante
};
const EDGES = [];
Object.entries(ADJ).forEach(([a, list]) => list.forEach((b) => EDGES.push([a, b])));

// Pseudocode-Panels — die Zeilenindizes stimmen mit den snap(...)-Aufrufen
// in buildDfsSteps überein (panel + line markieren die laufende Zeile).
const PANEL_MAIN = {
  id: "main",
  title: "DFS(G) — Hauptschleife",
  lines: [
    "DFS(Graph G = (V, E))",
    "  foreach u ∈ V:",
    "    u.color = white",
    "    u.π = nil",
    "  time = 0",
    "  foreach u ∈ V:",
    "    if u.color == white:",
    "      DFSVisit(G, u)",
  ],
};
const PANEL_VISIT = {
  id: "visit",
  title: "DFSVisit(G, u) — rekursiver Abstieg",
  lines: [
    "DFSVisit(Graph G, Vertex u)",
    "  time = time + 1",
    "  u.d = time;  u.color = gray",
    "  foreach v ∈ Adj[u]:",
    "    if v.color == white:",
    "      v.π = u",
    "      DFSVisit(G, v)",
    "  time = time + 1",
    "  u.f = time;  u.color = black",
  ],
};

// DFS simulieren -> Schritt-Liste erzeugen (jeder Schritt = Snapshot).
// Zusätzlich aufgezeichnet: aktive Codezeile (panel/line) und Rekursions-Stapel.
function buildDfsSteps() {
  const color = {}, d = {}, f = {}, pi = {};
  Object.keys(NODES).forEach((k) => (color[k] = "white"));
  let time = 0;
  const steps = [];
  const edgeClass = {}; // "a-b" -> Baum/Rück/Vor/Kreuz
  const stack = [];     // Aufruf-Stapel der laufenden DFSVisit-Aufrufe

  const snap = (msg, active, edge, panel, line) =>
    steps.push({
      color: { ...color }, d: { ...d }, f: { ...f }, pi: { ...pi },
      edgeClass: { ...edgeClass }, time, msg, active, edge,
      panel, line, stack: [...stack],
    });

  function visit(node) {
    stack.push(node);
    snap(`DFSVisit(${node}) wird aufgerufen — ${node} kommt auf den Aufruf-Stapel.`, node, null, "visit", 0);
    time++; d[node] = time; color[node] = "gray";
    snap(`${node} entdeckt: grau gefärbt, d[${node}] = ${time}.`, node, null, "visit", 2);
    for (const nb of ADJ[node]) {
      const key = `${node}-${nb}`;
      snap(`Betrachte Nachbarn ${nb} ∈ Adj[${node}] (Kante ${node}→${nb}).`, node, key, "visit", 3);
      if (color[nb] === "white") {
        snap(`${nb} ist weiß ⇒ Bedingung erfüllt: das wird eine Baumkante.`, node, key, "visit", 4);
        edgeClass[key] = "Baum";
        pi[nb] = node;
        snap(`Setze π[${nb}] = ${node} — ${node} wird Elternknoten im DFS-Wald.`, node, key, "visit", 5);
        snap(`Rekursiver Aufruf DFSVisit(${nb}) — tiefer in den Graphen.`, node, key, "visit", 6);
        visit(nb);
        snap(`Zurück in DFSVisit(${node}); nächste Kante aus Adj[${node}] prüfen.`, node, null, "visit", 3);
      } else if (color[nb] === "gray") {
        edgeClass[key] = "Rück";
        snap(`${nb} ist grau ⇒ Bedingung nicht erfüllt. Rückwärtskante: ${node} zeigt auf einen aktiven Vorfahren ⇒ Kreis!`, node, key, "visit", 4);
      } else {
        edgeClass[key] = d[node] < d[nb] ? "Vor" : "Kreuz";
        snap(`${nb} ist schwarz ⇒ Bedingung nicht erfüllt. ${edgeClass[key]}kante (d[${node}] ${d[node] < d[nb] ? "<" : ">"} d[${nb}]).`, node, key, "visit", 4);
      }
    }
    time++; f[node] = time; color[node] = "black";
    snap(`Alle Nachbarn erledigt ⇒ ${node} fertig: schwarz gefärbt, f[${node}] = ${time}.`, node, null, "visit", 8);
    stack.pop();
  }

  snap("Initialisierung: alle Knoten weiß, π = nil, globale Uhr time = 0.", null, null, "main", 4);
  for (const n of Object.keys(NODES)) {
    if (color[n] === "white") {
      snap(`Hauptschleife prüft ${n}: weiß ⇒ neuer Wurzelbaum im DFS-Wald.`, n, null, "main", 6);
      snap(`Starte DFSVisit(${n}).`, n, null, "main", 7);
      visit(n);
      snap(`DFSVisit(${n}) beendet — zurück in der Hauptschleife.`, null, null, "main", 5);
    } else {
      snap(`Hauptschleife prüft ${n}: bereits ${color[n] === "black" ? "fertig" : "entdeckt"} (nicht weiß) ⇒ überspringen.`, n, null, "main", 6);
    }
  }
  snap("DFS abgeschlossen — alle Knoten schwarz, der DFS-Wald ist vollständig.", null, null, "main", 5);
  return steps;
}
const DFS_STEPS = buildDfsSteps();

const NODE_FILL = { white: C.panel2, gray: C.gold, black: "#0a0c11" };
const NODE_STROKE = { white: C.line, gray: C.gold, black: C.good };
const EDGE_COLOR = { Baum: C.accent, Rück: C.warn, Vor: C.accent2, Kreuz: C.dim };

// Layout des DFS-Waldes (fixe Positionen; Knoten/Kanten erscheinen beim Lauf).
// Baum 1: u → v → y → x (Kette) · Baum 2: w → z
const DFS_TREE_POS = {
  u: { x: 120, y: 44 },
  v: { x: 120, y: 112 },
  y: { x: 120, y: 180 },
  x: { x: 120, y: 248 },
  w: { x: 340, y: 44 },
  z: { x: 340, y: 112 },
};
const DFS_ROOTS = ["u", "w"];

// Kleine Style-Helfer für Tabs (Ansichtswechsel) und Stapel-Chips.
const tabActive = {
  background: C.accent, color: C.bg, border: "none", borderRadius: 8,
  padding: "7px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13,
};
const tabGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`,
  borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13,
};
const stackChip = (last) => ({
  background: last ? C.gold : C.panel2, color: last ? C.bg : C.text,
  border: `1px solid ${last ? C.gold : C.line}`, borderRadius: 8,
  padding: "4px 10px", fontSize: 12.5, fontWeight: 700,
});

// Ein Pseudocode-Panel mit Zeilennummern; die aktive Zeile wird hervorgehoben.
function DfsCodePanel({ panel, isActivePanel, activeLine }) {
  let num = 0;
  return (
    <div
      style={{
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: 13,
        background: C.bg,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "8px 0",
        opacity: isActivePanel ? 1 : 0.5,
        transition: "opacity .3s",
      }}
    >
      <div
        style={{
          padding: "2px 14px 8px",
          color: isActivePanel ? C.accent : C.dim,
          fontSize: 12,
          fontWeight: 700,
          borderBottom: `1px solid ${C.line}`,
          marginBottom: 6,
        }}
      >
        {panel.title}
      </div>
      {panel.lines.map((ln, idx) => {
        const isActive = isActivePanel && idx === activeLine;
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              background: isActive ? "rgba(252,211,77,0.16)" : "transparent",
              borderLeft: `3px solid ${isActive ? C.gold : "transparent"}`,
              transition: "background .25s, border-color .25s",
            }}
          >
            <span
              style={{
                width: 30,
                textAlign: "right",
                paddingRight: 10,
                color: C.dim,
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {++num}
            </span>
            <span
              style={{
                whiteSpace: "pre",
                paddingRight: 12,
                color: C.text,
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {ln}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Der DFS-Wald als wachsender Baum: Knoten erscheinen beim Entdecken,
// Baumkanten entstehen aus den π-Zeigern des aktuellen Snapshots.
function DfsTreeVis({ S }) {
  const ids = Object.keys(DFS_TREE_POS);
  return (
    <svg viewBox="0 0 460 300" style={{ width: "100%", background: C.bg, borderRadius: 12 }}>
      <defs>
        <marker id="ahtree" markerWidth="10" markerHeight="10" refX="8" refY="3"
                orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6 Z" fill={C.accent} />
        </marker>
      </defs>

      {/* Wurzel-Beschriftung */}
      {DFS_ROOTS.map((r) => {
        const p = DFS_TREE_POS[r];
        const discovered = !!S.d[r];
        return (
          <text key={"root" + r} x={p.x} y={p.y - 30} textAnchor="middle"
                fontSize="11" fill={discovered ? C.accent : C.dim} fontWeight="700">
            Wurzel
          </text>
        );
      })}

      {/* Baumkanten aus π */}
      {ids.map((n) => {
        const par = S.pi[n];
        if (!par) return null;
        const A = DFS_TREE_POS[par], B = DFS_TREE_POS[n];
        const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy), r = 24;
        const sx = A.x + (dx / len) * r, sy = A.y + (dy / len) * r;
        const ex = B.x - (dx / len) * r, ey = B.y - (dy / len) * r;
        return (
          <line key={"te" + n} x1={sx} y1={sy} x2={ex} y2={ey}
                stroke={C.accent} strokeWidth={2.5} markerEnd="url(#ahtree)"
                style={{ transition: "all .3s" }} />
        );
      })}

      {/* Knoten */}
      {ids.map((n) => {
        const p = DFS_TREE_POS[n];
        const col = S.color[n];
        const discovered = !!S.d[n];
        const active = S.active === n;
        return (
          <g key={n} style={{ transition: "all .3s", opacity: discovered ? 1 : 0.3 }}>
            <circle cx={p.x} cy={p.y} r={22}
                    fill={NODE_FILL[col]} stroke={active ? C.gold : NODE_STROKE[col]}
                    strokeWidth={active ? 4 : 2} style={{ transition: "fill .3s, stroke .3s" }} />
            <text x={p.x} y={p.y + 5} textAnchor="middle"
                  fill={col === "gray" ? C.bg : C.text} fontSize="15" fontWeight="700">
              {n}
            </text>
            {discovered && (
              <text x={p.x + 30} y={p.y + 4} textAnchor="start" fill={C.dim} fontSize="11">
                {S.d[n] || "–"}/{S.f[n] || "–"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function VisDFS() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState("graph"); // "graph" | "tree"
  const total = DFS_STEPS.length;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= total - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [playing, total]);

  const S = DFS_STEPS[step];

  const arrow = (a, b, edge) => {
    const A = NODES[a], B = NODES[b];
    if (a === b) {
      // Selbstschleife
      const cls = S.edgeClass[`${a}-${b}`];
      const col = S.edge === `${a}-${b}` ? C.gold : (cls ? EDGE_COLOR[cls] : C.line);
      return (
        <g key={`${a}-${b}`}>
          <path
            d={`M ${A.x + 14} ${A.y - 14} a 22 22 0 1 1 -10 -18`}
            fill="none" stroke={col} strokeWidth={S.edge === `${a}-${b}` ? 3 : 2}
            markerEnd="url(#arrowhead)" style={{ transition: "stroke .3s" }}
          />
        </g>
      );
    }
    const cls = S.edgeClass[`${a}-${b}`];
    const isActive = S.edge === `${a}-${b}`;
    const col = isActive ? C.gold : (cls ? EDGE_COLOR[cls] : C.line);
    // Kürzen, damit Pfeil am Knotenrand endet
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy), r = 26;
    const sx = A.x + (dx / len) * r, sy = A.y + (dy / len) * r;
    const ex = B.x - (dx / len) * r, ey = B.y - (dy / len) * r;
    return (
      <line
        key={`${a}-${b}`} x1={sx} y1={sy} x2={ex} y2={ey}
        stroke={col} strokeWidth={isActive ? 3 : 2}
        markerEnd="url(#arrowhead)" style={{ transition: "stroke .3s, stroke-width .3s" }}
      />
    );
  };

  return (
    <Card>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>
        DFS live: Code, Färbung & DFS-Wald
      </div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14 }}>
        Verfolge synchron, welche <strong>Pseudocode-Zeile</strong> gerade läuft, wie jeder Knoten
        von <em>weiß</em> → <em>grau</em> → <em>schwarz</em> wandert und wie daraus der{" "}
        <strong>DFS-Wald</strong> (der Baum aus allen Baumkanten) wächst. Schalte die Ansicht
        unten zwischen Graph und Baum um.
      </div>

      {/* Pseudocode — beide Funktionen, die laufende Zeile leuchtet auf */}
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        <DfsCodePanel panel={PANEL_MAIN} isActivePanel={S.panel === "main"} activeLine={S.line} />
        <DfsCodePanel panel={PANEL_VISIT} isActivePanel={S.panel === "visit"} activeLine={S.line} />
      </div>

      {/* Aufruf-Stapel (Rekursionstiefe sichtbar machen) */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ color: C.dim, fontSize: 12, fontWeight: 700 }}>Aufruf-Stapel:</span>
        <span style={stackChip(S.stack.length === 0)}>DFS</span>
        {S.stack.map((n, i) => (
          <React.Fragment key={i}>
            <span style={{ color: C.dim }}>▸</span>
            <span style={stackChip(i === S.stack.length - 1)}>DFSVisit({n})</span>
          </React.Fragment>
        ))}
      </div>

      {/* Ansichtswechsel: Graph oder DFS-Wald */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button style={view === "graph" ? tabActive : tabGhost} onClick={() => setView("graph")}>
          Graph
        </button>
        <button style={view === "tree" ? tabActive : tabGhost} onClick={() => setView("tree")}>
          DFS-Wald (Baum)
        </button>
      </div>

      {view === "graph" ? (
        <svg viewBox="0 0 500 260" style={{ width: "100%", background: C.bg, borderRadius: 12 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3"
                    orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L8,3 L0,6 Z" fill={C.dim} />
            </marker>
          </defs>
          {EDGES.map(([a, b]) => arrow(a, b))}
          {Object.entries(NODES).map(([id, p]) => {
            const col = S.color[id];
            const active = S.active === id;
            return (
              <g key={id} style={{ transition: "all .3s" }}>
                <circle
                  cx={p.x} cy={p.y} r={22}
                  fill={NODE_FILL[col]} stroke={active ? C.gold : NODE_STROKE[col]}
                  strokeWidth={active ? 4 : 2}
                  style={{ transition: "fill .3s, stroke .3s" }}
                />
                <text x={p.x} y={p.y + 5} textAnchor="middle"
                      fill={col === "gray" ? C.bg : C.text} fontSize="15" fontWeight="700">
                  {id}
                </text>
                {(S.d[id] || S.f[id]) && (
                  <text x={p.x} y={p.y + 38} textAnchor="middle" fill={C.dim} fontSize="11">
                    {S.d[id] || "–"}/{S.f[id] || "–"}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      ) : (
        <DfsTreeVis S={S} />
      )}

      <div
        style={{
          marginTop: 12, background: C.panel2, border: `1px solid ${C.line}`,
          borderRadius: 10, padding: "12px 14px", minHeight: 44,
          color: C.text, fontSize: 14, display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span style={{ color: C.gold, fontWeight: 700 }}>t={S.time}</span>
        <span>{S.msg}</span>
      </div>

      <div style={{ marginTop: 12 }}>
        <Tag color={C.panel2}>weiß = unentdeckt</Tag>
        <Tag color={C.gold}>grau = aktiv (im Stack)</Tag>
        <Tag color={C.good}>schwarz = fertig</Tag>
        <br />
        <Tag color={C.accent}>Baumkante</Tag>
        <Tag color={C.warn}>Rückwärtskante</Tag>
        <Tag color={C.accent2}>Vorwärtskante</Tag>
        <Tag color={C.dim}>Kreuzkante</Tag>
      </div>

      <PlayerControls
        playing={playing}
        onPlay={() => { if (step >= total - 1) setStep(0); setPlaying((p) => !p); }}
        onPrev={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }}
        onReset={() => { setPlaying(false); setStep(0); }}
        step={step} total={total}
      />
    </Card>
  );
}

/* ===================== VIS 2: Klammern-Theorem =========================== */
/*
   Zeigt Besuchsintervalle [d,f] als ineinander geschachtelte Klammern.
   Beispiel-Intervalle aus dem DFS oben (vereinfachte feste Werte).
*/
const INTERVALS = [
  { node: "u", d: 1, f: 8, depth: 0 },
  { node: "v", d: 2, f: 7, depth: 1 },
  { node: "y", d: 3, f: 6, depth: 2 },
  { node: "x", d: 4, f: 5, depth: 3 },
];
const TIMELINE_MAX = 8;

function VisBrackets() {
  const [reveal, setReveal] = useState(1); // wie viele Intervalle sichtbar
  const [playing, setPlaying] = useState(false);
  const total = INTERVALS.length;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setReveal((r) => { if (r >= total) { setPlaying(false); return r; } return r + 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, total]);

  const pct = (v) => `${(v / TIMELINE_MAX) * 100}%`;

  return (
    <Card>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>
        Klammern-Theorem: Intervalle schachteln sich sauber
      </div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 18 }}>
        Jeder Knoten hat ein Besuchsintervall <code style={{ color: C.accent }}>[d, f]</code>{" "}
        (Entdeckzeit <code style={{ color: C.accent }}>d</code> = discovery, Fertigzeit{" "}
        <code style={{ color: C.accent }}>f</code> = finish). Zwei Intervalle sind{" "}
        <strong>entweder ganz ineinander verschachtelt oder völlig getrennt</strong> — sie
        überlappen sich nie nur teilweise. Das ist das Klammern-Theorem.
      </div>

      {/* Zeitachse */}
      <div style={{ position: "relative", marginBottom: 6, height: 18 }}>
        {Array.from({ length: TIMELINE_MAX }, (_, i) => (
          <span key={i} style={{
            position: "absolute", left: pct(i + 0.5), transform: "translateX(-50%)",
            color: C.dim, fontSize: 11,
          }}>{i + 1}</span>
        ))}
      </div>

      <div style={{ position: "relative" }}>
        {INTERVALS.map((iv, i) => {
          const visible = i < reveal;
          return (
            <div key={iv.node} style={{ position: "relative", height: 40 }}>
              <div
                style={{
                  position: "absolute",
                  left: pct(iv.d - 1), width: pct(iv.f - iv.d + 1),
                  top: 6, height: 28,
                  background: visible ? `${C.accent}22` : "transparent",
                  border: `2px solid ${visible ? C.accent : "transparent"}`,
                  borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.text, fontWeight: 700, fontSize: 14,
                  opacity: visible ? 1 : 0,
                  animation: visible ? "pop .4s ease" : "none",
                  transition: "opacity .3s",
                }}
              >
                {iv.node} [{iv.d},{iv.f}]
              </div>
            </div>
          );
        })}
      </div>

      <InfoBox title="Warum ist das nützlich?">
        Wenn das Intervall von <code style={{ color: C.accent }}>x</code> komplett im Intervall
        von <code style={{ color: C.accent }}>u</code> liegt, dann ist x ein{" "}
        <strong>Nachfahre</strong> von u im DFS-Wald (die Suche von u aus hat x erreicht, bevor u
        fertig war). Liegen die Intervalle getrennt, sind die Knoten in keinem
        Vorgänger-Nachfolger-Verhältnis.
      </InfoBox>

      <PlayerControls
        playing={playing}
        onPlay={() => { if (reveal >= total) setReveal(1); setPlaying((p) => !p); }}
        onPrev={() => { setPlaying(false); setReveal((r) => Math.max(1, r - 1)); }}
        onNext={() => { setPlaying(false); setReveal((r) => Math.min(total, r + 1)); }}
        onReset={() => { setPlaying(false); setReveal(1); }}
        step={reveal - 1} total={total}
      />
    </Card>
  );
}

/* ================== VIS 3: Topologische Sortierung ====================== */
/*
   Anziehbeispiel (vereinfacht, aus der Folie). Wir nutzen DFS und hängen
   jeden fertig gewordenen (schwarzen) Knoten VORNE an die Liste.
*/
const CLOTHES_POS = {
  Unterhose: { x: 70,  y: 50 },
  Hose:      { x: 70,  y: 130 },
  Gürtel:    { x: 70,  y: 210 },
  Socken:    { x: 230, y: 50 },
  Schuhe:    { x: 230, y: 130 },
  Uhr:       { x: 230, y: 210 },
  "T-Shirt": { x: 400, y: 50 },
  Pulli:     { x: 400, y: 130 },
  Anorak:    { x: 400, y: 210 },
};
const CLOTHES_ADJ = {
  Unterhose: ["Hose"],
  Hose: ["Schuhe", "Gürtel"],
  Socken: ["Schuhe"],
  Schuhe: [],
  Gürtel: [],
  "T-Shirt": ["Pulli"],
  Pulli: ["Anorak"],
  Anorak: [],
  Uhr: [],
};
const CLOTHES_EDGES = [];
Object.entries(CLOTHES_ADJ).forEach(([a, l]) => l.forEach((b) => CLOTHES_EDGES.push([a, b])));

function buildTopoSteps() {
  const color = {};
  Object.keys(CLOTHES_POS).forEach((k) => (color[k] = "white"));
  const list = [];
  const steps = [];
  const snap = (msg, active) =>
    steps.push({ color: { ...color }, list: [...list], msg, active });

  function visit(n) {
    color[n] = "gray";
    snap(`${n} betreten (grau) — erst alle Nachfolger erledigen`, n);
    for (const nb of CLOTHES_ADJ[n]) {
      if (color[nb] === "white") visit(nb);
    }
    color[n] = "black";
    list.unshift(n); // VORNE anhängen
    snap(`${n} fertig (schwarz) ⇒ vorne in die Liste`, n);
  }
  for (const n of Object.keys(CLOTHES_POS)) {
    if (color[n] === "white") visit(n);
  }
  snap("Fertig — die Liste ist eine gültige topologische Reihenfolge.", null);
  return steps;
}
const TOPO_STEPS = buildTopoSteps();

function VisTopo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = TOPO_STEPS.length;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => { if (s >= total - 1) { setPlaying(false); return s; } return s + 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [playing, total]);

  const S = TOPO_STEPS[step];

  return (
    <Card>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.text }}>
        Topologische Sortierung am Anzieh-Beispiel
      </div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14 }}>
        Eine Kante <code style={{ color: C.accent2 }}>a → b</code> heißt „a muss vor b". DFS
        läuft durch — und sobald ein Knoten <strong>schwarz</strong> (fertig) wird, hängen wir ihn{" "}
        <strong>vorne</strong> an die Ergebnisliste. So landen Voraussetzungen automatisch links.
      </div>

      <svg viewBox="0 0 480 260" style={{ width: "100%", background: C.bg, borderRadius: 12 }}>
        <defs>
          <marker id="ah2" markerWidth="10" markerHeight="10" refX="8" refY="3"
                  orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,3 L0,6 Z" fill={C.dim} />
          </marker>
        </defs>
        {CLOTHES_EDGES.map(([a, b]) => {
          const A = CLOTHES_POS[a], B = CLOTHES_POS[b];
          const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy), r = 34;
          const sx = A.x + (dx / len) * r, sy = A.y + (dy / len) * r;
          const ex = B.x - (dx / len) * r, ey = B.y - (dy / len) * r;
          return (
            <line key={`${a}-${b}`} x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={C.accent2} strokeWidth={1.6} opacity={0.6} markerEnd="url(#ah2)" />
          );
        })}
        {Object.entries(CLOTHES_POS).map(([id, p]) => {
          const col = S.color[id];
          const active = S.active === id;
          const fill = col === "gray" ? C.gold : col === "black" ? "#0a0c11" : C.panel2;
          const stroke = active ? C.gold : col === "black" ? C.good : C.line;
          return (
            <g key={id} style={{ transition: "all .3s" }}>
              <rect x={p.x - 34} y={p.y - 15} width={68} height={30} rx={8}
                    fill={fill} stroke={stroke} strokeWidth={active ? 3 : 1.5}
                    style={{ transition: "fill .3s, stroke .3s" }} />
              <text x={p.x} y={p.y + 4} textAnchor="middle"
                    fill={col === "gray" ? C.bg : C.text} fontSize="11" fontWeight="700">
                {id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Ergebnisliste */}
      <div style={{ marginTop: 14, color: C.dim, fontSize: 13, marginBottom: 6 }}>
        Ergebnisliste L (vorne anhängen):
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 36 }}>
        {S.list.length === 0 && <span style={{ color: C.dim, fontSize: 13 }}>— noch leer —</span>}
        {S.list.map((n, i) => (
          <span key={n} style={{
            background: `${C.good}1f`, border: `1px solid ${C.good}`, color: C.text,
            borderRadius: 8, padding: "5px 10px", fontSize: 13, fontWeight: 600,
            animation: "pop .35s ease",
          }}>
            {i + 1}. {n}
          </span>
        ))}
      </div>

      <div
        style={{
          marginTop: 14, background: C.panel2, border: `1px solid ${C.line}`,
          borderRadius: 10, padding: "12px 14px", minHeight: 44,
          color: C.text, fontSize: 14, display: "flex", alignItems: "center",
        }}
      >
        {S.msg}
      </div>

      <div style={{ marginTop: 12 }}>
        <Tag color={C.panel2}>weiß = offen</Tag>
        <Tag color={C.gold}>grau = in Arbeit</Tag>
        <Tag color={C.good}>schwarz = einsortiert</Tag>
      </div>

      <PlayerControls
        playing={playing}
        onPlay={() => { if (step >= total - 1) setStep(0); setPlaying((p) => !p); }}
        onPrev={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
        onNext={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }}
        onReset={() => { setPlaying(false); setStep(0); }}
        step={step} total={total}
      />
    </Card>
  );
}

/* ============================ HAUPTKOMPONENTE =========================== */
export default function Tiefensuche() {
  const btn = {
    background: C.accent, color: C.bg, border: "none", borderRadius: 10,
    padding: "11px 20px", fontWeight: 700, cursor: "pointer", fontSize: 15,
  };
  const btnGhost = {
    background: "transparent", color: C.text, border: `1px solid ${C.line}`,
    borderRadius: 10, padding: "11px 20px", cursor: "pointer", fontSize: 15,
  };

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh",
                  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <style>{STYLES}</style>

      {/* HERO */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 28px" }}>
        <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 3,
                      fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
          Kapitel 15 · Graphenalgorithmen
        </div>
        <h1 style={{ fontSize: 46, lineHeight: 1.08, margin: "0 0 18px" }}>
          Tiefensuche &amp;{" "}
          <span style={{ color: C.accent }}>Topologische Sortierung</span>
        </h1>
        <p style={{ color: C.dim, fontSize: 18, lineHeight: 1.7, maxWidth: 660 }}>
          Wie durchläuft man einen Graphen systematisch „in die Tiefe"? Wie verrät uns die
          Reihenfolge des Fertigwerdens, in welcher Reihenfolge Dinge passieren müssen? Dieser
          Erklärer baut beides Schritt für Schritt auf — mit Animationen, die du selbst steuern
          kannst.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => scrollTo("idee")}>Los geht's</button>
          <button style={btnGhost} onClick={() => scrollTo("glossar")}>Zum Glossar</button>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>

        {/* 0 — PROBLEM */}
        <Section kicker="Das Problem" title={'Warum überhaupt einen Graphen ‚durchsuchen‘?'}>
          <Card>
            <p style={{ lineHeight: 1.8, margin: "0 0 14px" }}>
              Ein <strong>Graph</strong> ist eine Menge von <em>Knoten</em> (engl. <em>vertices</em>,
              die „Punkte" oder Orte) und <em>Kanten</em> (engl. <em>edges</em>, die Verbindungen
              dazwischen). Damit modelliert man fast alles: Straßennetze, Webseiten-Links,
              Abhängigkeiten zwischen Aufgaben, Freundschaften.
            </p>
            <p style={{ lineHeight: 1.8, margin: 0 }}>
              Sehr viele Fragen laufen darauf hinaus: <em>„Erreiche ich von hier aus jeden anderen
              Knoten — und in welcher Reihenfolge?"</em> Denk an ein Labyrinth: Du läufst einen Gang
              so weit wie möglich, und erst wenn es nicht mehr weitergeht, kehrst du zur letzten
              Abzweigung zurück. Genau dieses „erst tief, dann zurück" ist die{" "}
              <strong style={{ color: C.accent }}>Tiefensuche</strong> (engl.{" "}
              <em>Depth-First Search</em>, kurz <strong>DFS</strong>).
            </p>
          </Card>
        </Section>

        {/* 1 — KERNIDEE */}
        <Section kicker="Die Kernidee" title="Drei Farben, zwei Zeitstempel">
          <div id="idee" />
          <Card>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              DFS gibt jedem Knoten eine <strong>Farbe</strong>, die seinen Zustand zeigt:
            </p>
            <div style={{ display: "grid", gap: 10, margin: "14px 0" }}>
              <MethodRow color={C.panel2} name="weiß" formula="white"
                note="Noch nicht entdeckt. Startzustand aller Knoten." />
              <MethodRow color={C.gold} name="grau" formula="gray"
                note="Gerade in Bearbeitung — wir sind ‚mittendrin‘, die Nachfolger werden noch besucht. Liegt im Aufruf-Stapel." />
              <MethodRow color={C.good} name="schwarz" formula="black"
                note="Komplett abgearbeitet. Alle erreichbaren Knoten dahinter sind erledigt." />
            </div>
            <p style={{ lineHeight: 1.8, marginBottom: 0 }}>
              Zusätzlich notiert DFS für jeden Knoten zwei <strong>Zeitstempel</strong> aus einer
              globalen Uhr <code style={{ color: C.accent }}>time</code>:{" "}
              <code style={{ color: C.accent }}>d</code> (<em>discovery time</em> = wann grau
              gefärbt) und <code style={{ color: C.accent }}>f</code> (<em>finish time</em> = wann
              schwarz gefärbt). Geschrieben als <code style={{ color: C.accent }}>d/f</code>.
            </p>
          </Card>

          <InfoBox title="O-Notation kurz erklärt (brauchen wir später)">
            <code style={{ color: C.accent }}>O(...)</code> (großes O) beschreibt, wie die Laufzeit{" "}
            <em>höchstens</em> wächst, wenn die Eingabe größer wird — wobei konstante Faktoren und
            kleine Terme ignoriert werden. <code style={{ color: C.accent }}>O(V + E)</code> heißt
            also: die Laufzeit wächst proportional zur Zahl der Knoten{" "}
            <code style={{ color: C.accent }}>V</code> <em>plus</em> der Zahl der Kanten{" "}
            <code style={{ color: C.accent }}>E</code> — das ist „linear in der Graphgröße" und sehr
            effizient.
          </InfoBox>
        </Section>

        {/* 2 — DER PSEUDOCODE / schwieriger Teil */}
        <Section kicker="Der Kern" title="Der Algorithmus — und wo die Rekursion steckt">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              DFS besteht aus zwei Teilen. Die Hauptfunktion <code>DFS</code> sorgt dafür, dass{" "}
              <em>jeder</em> Knoten besucht wird (auch wenn der Graph in mehrere unverbundene Teile
              zerfällt). Die Hilfsfunktion <code>DFSVisit</code> steigt von einem Knoten aus
              rekursiv „in die Tiefe".
            </p>
            <p style={{ lineHeight: 1.8, marginBottom: 0, color: C.dim, fontSize: 14 }}>
              <code style={{ color: C.accent }}>Adj[u]</code> ist die <em>Adjazenzliste</em> — die
              Liste der direkten Nachbarn von u. <code style={{ color: C.accent }}>u.π</code> (Pi)
              ist der Knoten, von dem aus u entdeckt wurde — der „Elternknoten" im{" "}
              <strong>DFS-Wald</strong> (der Baumstruktur, die durch alle Baumkanten entsteht). Im{" "}
              interaktiven Erklärer unten kannst du <strong>beide Funktionen Zeile für Zeile</strong>{" "}
              mitlaufen lassen — der Aufruf-Stapel zeigt dabei, wie tief die Rekursion gerade steckt,
              und die Baum-Ansicht baut den DFS-Wald live aus den <code style={{ color: C.accent }}>π</code>-Zeigern auf.
            </p>
          </Card>

          <VisDFS />
        </Section>

        {/* 3 — VARIANTEN: Kantentypen */}
        <Section kicker="Die vier Kantentypen" title="Was uns die Färbung beim Überqueren verrät">
          <Card>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              Während DFS läuft, fragt es bei jeder Kante <code>u → v</code>: <em>Welche Farbe hat
              v gerade?</em> Daraus ergibt sich automatisch der Kantentyp:
            </p>
            <div style={{ marginTop: 6 }}>
              <MethodRow color={C.accent} name="Baumkante" formula="v ist weiß"
                note="v wird zum ersten Mal über diese Kante entdeckt. Diese Kanten bilden zusammen den DFS-Wald." />
              <MethodRow color={C.warn} name="Rückwärtskante" formula="v ist grau"
                note="v ist ein Vorfahre, der noch in Bearbeitung ist. Eine solche Kante bedeutet: Es gibt einen Kreis! (wichtig fürs Sortieren)" />
              <MethodRow color={C.accent2} name="Vorwärtskante" formula="v schwarz, v später entdeckt"
                note="v ist ein Nachfahre, aber über einen kürzeren ‚Abkürzungs‘-Pfad erreicht. Erkennbar an d[u] < d[v]." />
              <MethodRow color={C.dim} name="Kreuzkante" formula="v schwarz, v früher entdeckt"
                note="v gehört zu einem bereits abgeschlossenen Zweig — kein Vorgänger/Nachfolger-Verhältnis. Erkennbar an d[u] > d[v]." />
            </div>
          </Card>
          <InfoBox title="Merksatz">
            Rückwärtskante ⟺ Kreis. Ein gerichteter Graph ist genau dann{" "}
            <strong>kreisfrei</strong> (azyklisch), wenn DFS <em>keine</em> einzige
            Rückwärtskante findet. Genau das brauchen wir gleich fürs Sortieren.
          </InfoBox>
        </Section>

        {/* 4 — SONDERFALL: Klammern-Theorem */}
        <Section kicker="Der elegante Trick" title="Das Klammern-Theorem">
          <VisBrackets />
        </Section>

        {/* 5 — ANALYSE */}
        <Section kicker="Analyse" title="Warum DFS nur O(V + E) kostet">
          <Card>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              Die Laufzeit ergibt sich aus einem einfachen Zähl-Argument:
            </p>
            <ul style={{ lineHeight: 1.9, color: C.text, paddingLeft: 22 }}>
              <li>
                <code style={{ color: C.accent }}>DFSVisit</code> wird für jeden Knoten{" "}
                <strong>genau einmal</strong> aufgerufen — denn schon im ersten Schritt wird der
                Knoten grau, und aufgerufen wird nur für <em>weiße</em> Knoten. Das ergibt zusammen{" "}
                <code style={{ color: C.accent }}>O(V)</code> (V = Anzahl Knoten).
              </li>
              <li>
                In jedem <code>DFSVisit(u)</code> läuft die Schleife über{" "}
                <code style={{ color: C.accent }}>Adj[u]</code>, also über{" "}
                <code style={{ color: C.accent }}>deg(u)</code> Kanten (der <em>Grad</em> = Zahl der
                ausgehenden Kanten von u). Summiert über alle Knoten sind das alle Kanten zusammen:{" "}
                <code style={{ color: C.accent }}>O(E)</code> (E = Anzahl Kanten).
              </li>
            </ul>
            <div style={{ textAlign: "center", margin: "18px 0",
                          fontSize: 22, fontWeight: 700, color: C.accent }}>
              O(V) + O(E) = O(V + E)
            </div>
            <p style={{ lineHeight: 1.8, marginBottom: 0, color: C.dim, fontSize: 14 }}>
              Da hier kein Best-/Worst-Case-Unterschied entsteht (jeder Knoten und jede Kante wird
              exakt einmal angefasst), ist die Laufzeit sogar{" "}
              <code style={{ color: C.accent }}>Θ(V + E)</code> — das große Theta heißt: nach oben{" "}
              <em>und</em> unten gleich beschränkt, also „genau diese Größenordnung".
            </p>
          </Card>
        </Section>

        {/* 6 — TOPOLOGISCHE SORTIERUNG */}
        <Section kicker="Die Anwendung" title="Topologische Sortierung: Reihenfolge aus Abhängigkeiten">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              Stell dir das Anziehen am Morgen vor: Die Unterhose muss vor der Hose, die Socken vor
              den Schuhen. Solche „muss-vorher"-Beziehungen sind ein{" "}
              <strong>gerichteter, kreisfreier Graph</strong> (engl.{" "}
              <em>Directed Acyclic Graph</em>, <strong>DAG</strong>). Eine{" "}
              <strong style={{ color: C.accent }}>topologische Sortierung</strong> ist eine lineare
              Reihenfolge aller Knoten, in der für jede Kante <code>u → v</code> gilt: u steht{" "}
              <em>vor</em> v.
            </p>
            <pre style={{
              background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
              padding: 16, overflowX: "auto", fontSize: 13.5, lineHeight: 1.7, color: C.text,
            }}>
{`TopologicalSort(DirectedGraph G)
  L = new List()
  führe DFS(G) aus, mit einer Änderung:
      wenn ein Knoten SCHWARZ wird,
      hänge ihn VORNE an die Liste L
  return L`}
            </pre>
            <p style={{ lineHeight: 1.8, marginBottom: 0 }}>
              Der Trick: Ein Knoten wird erst schwarz, wenn <em>alle</em> seine Nachfolger schon
              fertig (und damit schon in der Liste) sind. Hängt man ihn dann vorne an, steht er
              automatisch vor allen, von denen er abhängt. Sortieren nach{" "}
              <strong>absteigender Fertigzeit f</strong> liefert dasselbe Ergebnis.
            </p>
          </Card>

          <VisTopo />

          <InfoBox title="Wann klappt das?">
            Nur wenn der Graph <strong>kreisfrei</strong> ist. Gäbe es einen Kreis (z.&nbsp;B. „A
            vor B" und „B vor A"), würde DFS eine Rückwärtskante finden — und eine widerspruchsfreie
            Reihenfolge wäre logisch unmöglich. Die Laufzeit ist dieselbe wie bei DFS:{" "}
            <code style={{ color: C.accent }}>O(V + E)</code>.
          </InfoBox>
        </Section>

        {/* 7 — VERGLEICH */}
        <Section kicker="Einordnung" title="DFS vs. Breitensuche">
          <Card>
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>
              Die <strong>Breitensuche</strong> (engl. <em>Breadth-First Search</em>, BFS) ist die
              „Schwester" der Tiefensuche. Beide besuchen jeden Knoten genau einmal, aber in anderer
              Reihenfolge:
            </p>
            <MethodRow color={C.accent2} name="Breitensuche (BFS)" formula="Schlange · O(V+E)"
              note="Erkundet Knoten Ring für Ring nach Entfernung. Liefert kürzeste Wege (in Kantenzahl). Nutzt eine Warteschlange (Queue), arbeitet ‚nicht-lokal‘ (in die Breite)." />
            <MethodRow color={C.accent} name="Tiefensuche (DFS)" formula="Stack · O(V+E)"
              note="Erkundet erst so tief wie möglich, kehrt dann zurück. Liefert d/f-Zeiten (z.B. für topologische Sortierung). Nutzt Rekursion bzw. einen Stapel (Stack), arbeitet ‚lokal‘ (in die Tiefe)." />
          </Card>
        </Section>

        {/* 8 — ZUSAMMENFASSUNG */}
        <Section kicker="Auf einen Blick" title="Das Wichtigste in drei Sätzen">
          <Card style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}55` }}>
            <ol style={{ lineHeight: 2, margin: 0, paddingLeft: 22, fontSize: 16 }}>
              <li>
                <strong>DFS</strong> färbt jeden Knoten weiß → grau → schwarz und vergibt
                Zeitstempel <code style={{ color: C.accent }}>d/f</code>; das alles kostet nur{" "}
                <code style={{ color: C.accent }}>Θ(V + E)</code>.
              </li>
              <li>
                Aus der Farbe des Zielknotens beim Überqueren einer Kante folgt ihr Typ —{" "}
                <strong>eine graue Zielfarbe (Rückwärtskante) bedeutet immer einen Kreis</strong>.
              </li>
              <li>
                Hängt man fertige (schwarze) Knoten <strong>vorne</strong> an eine Liste, erhält man
                eine <strong>topologische Sortierung</strong> — die korrekte Reihenfolge aus
                Abhängigkeiten, sofern der Graph kreisfrei ist.
              </li>
            </ol>
          </Card>
        </Section>

        {/* 9 — GLOSSAR */}
        <Section kicker="Nachschlagen" title="Glossar — alle Begriffe & Symbole">
          <div id="glossar" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: 12 }}>
            <GlossEntry term="Graph" def="Menge aus Knoten (Punkten) und Kanten (Verbindungen). Modelliert Netzwerke aller Art." />
            <GlossEntry term="Knoten / Vertex (V)" def="Die ‚Punkte‘ eines Graphen. V steht auch für ihre Anzahl." />
            <GlossEntry term="Kante / Edge (E)" def="Eine Verbindung zwischen zwei Knoten. E steht auch für ihre Anzahl." />
            <GlossEntry term="gerichtet" def="Kanten haben eine Richtung (u → v ist nicht v → u). Sonst: ungerichtet." />
            <GlossEntry term="DFS (Tiefensuche)" def="Depth-First Search: erkundet erst so tief wie möglich, kehrt dann zur letzten Abzweigung zurück." />
            <GlossEntry term="BFS (Breitensuche)" def="Breadth-First Search: erkundet Knoten nach Entfernung ringweise; liefert kürzeste Wege." />
            <GlossEntry term="weiß / grau / schwarz" def="Knotenzustand: unentdeckt / in Bearbeitung (im Stack) / fertig abgearbeitet." />
            <GlossEntry term="d (discovery time)" def="Zeitstempel, wann ein Knoten entdeckt (grau) wurde." />
            <GlossEntry term="f (finish time)" def="Zeitstempel, wann ein Knoten fertig (schwarz) wurde. Notation: d/f." />
            <GlossEntry term="π (Pi)" def="Vorgängerknoten im DFS-Wald — der Knoten, von dem aus dieser entdeckt wurde." />
            <GlossEntry term="Adj[u]" def="Adjazenzliste: die Liste der direkten Nachbarn von Knoten u." />
            <GlossEntry term="deg(u)" def="Grad von u: Anzahl der (ausgehenden) Kanten an u." />
            <GlossEntry term="DFS-Wald" def="Baumstruktur aus allen Baumkanten; kann aus mehreren Bäumen bestehen." />
            <GlossEntry term="Baumkante" def="Kante zu einem weißen Knoten — entdeckt ihn neu. Bildet den DFS-Wald." />
            <GlossEntry term="Rückwärtskante" def="Kante zu einem grauen (noch aktiven) Vorfahren ⇒ es existiert ein Kreis." />
            <GlossEntry term="Vorwärtskante" def="Kante zu einem schwarzen Nachfahren (d[u] < d[v]) — eine ‚Abkürzung‘." />
            <GlossEntry term="Kreuzkante" def="Kante zu einem schwarzen Knoten ohne Vorgänger-/Nachfolgerbeziehung (d[u] > d[v])." />
            <GlossEntry term="Klammern-Theorem" def="Besuchsintervalle [d,f] sind entweder verschachtelt oder völlig getrennt — nie teilweise überlappend." />
            <GlossEntry term="kreisfrei / azyklisch" def="Enthält keinen (gerichteten) Kreis. Äquivalent: DFS findet keine Rückwärtskante." />
            <GlossEntry term="DAG" def="Directed Acyclic Graph: gerichteter, kreisfreier Graph — Voraussetzung fürs topologische Sortieren." />
            <GlossEntry term="Topologische Sortierung" def="Lineare Reihenfolge der Knoten, sodass aus u → v folgt: u steht vor v." />
            <GlossEntry term="O(...)" def="Obere Schranke des Wachstums (höchstens so schnell). Ignoriert Konstanten." />
            <GlossEntry term="Θ(...)" def="Theta: nach oben UND unten gleich beschränkt — die exakte Größenordnung." />
            <GlossEntry term="O(V + E)" def="Lineare Laufzeit in der Graphgröße — sehr effizient. Laufzeit von DFS und BFS." />
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 40,
                       padding: "28px 24px 56px", textAlign: "center", color: C.dim, fontSize: 13 }}>
        Kapitel 15 · Tiefensuche &amp; Topologische Sortierung<br />
        Prof. Dr. Veronika Lesch · DHBW Mosbach · Theoretische Informatik II
      </footer>
    </div>
  );
}