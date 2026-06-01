import React, { useState, useEffect, useRef, useMemo } from "react";

/* =====================================================================
   Lern-Trainer · Übung 08 · Aufgabe 2 (Tiefensuche) & 3 (Zweifärbbarkeit)
   Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach
   Self-contained React-Komponente für die lern-trainer Galerie.
   ===================================================================== */

/* ---- Festes Design-System (Dark Theme) -------------------------------
   NUR accent & accent2 sind thematisch gesetzt. Rest exakt unverändert. */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#2dd4bf",  // Türkis – DFS-Exploration: Baumkanten, fertige (schwarze) Knoten, primäre Aktion
  accent2: "#f59e0b", // Bernstein-Gold – Graphstruktur: Kicker, Vorwärtskanten, Sekundär-Akzente
  good: "#86efac",    // grün – Erfolg/Treffer (Behauptung widerlegt, „zweifärbbar ✓“)
  warn: "#fca5a5",    // rot – Problem/Konflikt (Rückwärtskante, Färbungs-Konflikt) – hier auch Farbe „rot“ der 2-Färbung
  gold: "#fcd34d",    // gelb – Highlight (aktiver Knoten, untersuchte Kante)
};

/* Semantische 2-Färbungs-Farben (lokal, da die Definition c:V→{rot,blau} verlangt).
   „rot“ recycelt C.warn, „blau“ ist eine lokale Ergänzung – C selbst bleibt unangetastet. */
const ROT = C.warn;       // #fca5a5
const BLAU = "#60a5fa";   // blau – zweite Farbklasse der Zweifärbbarkeit

/* ====================== Wiederverwendbare Bausteine ==================== */

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
      {kicker && (
        <div style={{
          textTransform: "uppercase", letterSpacing: ".14em", fontSize: 12,
          fontWeight: 700, color: C.accent2, marginBottom: 10,
        }}>{kicker}</div>
      )}
      <h2 style={{
        fontSize: 30, lineHeight: 1.15, margin: "0 0 18px", color: C.text,
        fontWeight: 800, letterSpacing: "-.01em",
      }}>{title}</h2>
      <div style={{ color: C.text, fontSize: 16.5, lineHeight: 1.72 }}>{children}</div>
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16,
      padding: 24, ...style,
    }}>{children}</div>
  );
}

function Tag({ color = C.accent, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13,
      color: C.dim, marginRight: 16,
    }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: "rgba(167,139,250,0.0)",
      backgroundImage: `linear-gradient(180deg, ${C.accent2}14, ${C.accent2}06)`,
      border: `1px solid ${C.accent2}55`, borderLeft: `4px solid ${C.accent2}`,
      borderRadius: 12, padding: "16px 18px", margin: "18px 0",
    }}>
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6, fontSize: 15 }}>
        💡 {title}
      </div>
      <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.68 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4, fontSize: 14.5 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color = C.accent, name, formula, note }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "5px 1fr", gap: 14, alignItems: "stretch",
      background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: "14px 16px", marginBottom: 12,
    }}>
      <div style={{ background: color, borderRadius: 4 }} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: note ? 6 : 0 }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15.5 }}>{name}</span>
          {formula && (
            <code style={{
              fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 13,
              background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7,
              padding: "3px 9px", color: color,
            }}>{formula}</code>
          )}
        </div>
        {note && <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{note}</div>}
      </div>
    </div>
  );
}

const btn = {
  background: C.accent, color: "#06231f", border: "none", borderRadius: 10,
  padding: "9px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 7,
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`,
  borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 14, cursor: "pointer",
};

function Pill({ children, color = C.dim }) {
  return (
    <code style={{
      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 13,
      background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7,
      padding: "2px 8px", color,
    }}>{children}</code>
  );
}

/* ============================ Player-Hook ============================= */
function usePlayer(len, speed = 1150) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (i >= len - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, len - 1)), speed);
    return () => clearTimeout(t);
  }, [playing, i, len, speed]);
  return {
    i, playing,
    toggle: () => { if (i >= len - 1) setI(0); setPlaying((p) => !p); },
    next: () => { setPlaying(false); setI((x) => Math.min(x + 1, len - 1)); },
    prev: () => { setPlaying(false); setI((x) => Math.max(x - 1, 0)); },
    reset: () => { setPlaying(false); setI(0); },
  };
}

function Controls({ p, len }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={p.toggle}>{p.playing ? "❚❚ Pause" : (p.i >= len - 1 ? "↻ Erneut" : "▶ Abspielen")}</button>
      <button style={btnGhost} onClick={p.prev} disabled={p.i === 0}>‹ Zurück</button>
      <button style={btnGhost} onClick={p.next} disabled={p.i >= len - 1}>Vor ›</button>
      <button style={btnGhost} onClick={p.reset}>Reset</button>
      <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>
        Schritt {p.i + 1} / {len}
      </span>
    </div>
  );
}

/* ======================= DFS-Simulation (gerichtet) =================== */
function simulateDFS({ nodeOrder, adj }) {
  const state = {};
  nodeOrder.forEach((id) => (state[id] = { color: "white", d: null, f: null, pi: null }));
  let time = 0;
  const frames = [];
  const stack = [];
  const edgeClasses = {}; // "u->v" : 'tree' | 'back' | 'forward' | 'cross'

  const snap = (extra) => frames.push({
    time,
    nodes: JSON.parse(JSON.stringify(state)),
    stack: [...stack],
    edgeClasses: { ...edgeClasses },
    examining: null, active: null, edgeClass: null, msg: "",
    ...extra,
  });

  function visit(u) {
    time++; state[u].d = time; state[u].color = "gray"; stack.push(u);
    snap({ active: u, msg: `${u} entdeckt → grau · ${u}.d = ${time}` });
    for (const v of adj[u] || []) {
      snap({ active: u, examining: [u, v], msg: `Untersuche Kante ${u}→${v}` });
      if (state[v].color === "white") {
        state[v].pi = u; edgeClasses[`${u}->${v}`] = "tree";
        snap({ active: u, examining: [u, v], edgeClass: "tree", msg: `${v} ist weiß → Baumkante, steige nach ${v} ab` });
        visit(v);
        snap({ active: u, msg: `Zurück in ${u} (Abstieg nach ${v} beendet)` });
      } else if (state[v].color === "gray") {
        edgeClasses[`${u}->${v}`] = "back";
        snap({ active: u, examining: [u, v], edgeClass: "back", msg: `${v} ist grau (Vorfahr auf dem Stack) → Rückwärtskante (R)` });
      } else {
        if (state[u].d < state[v].d) {
          edgeClasses[`${u}->${v}`] = "forward";
          snap({ active: u, examining: [u, v], edgeClass: "forward", msg: `${v} ist schwarz, ${u}.d < ${v}.d → Vorwärtskante (V)` });
        } else {
          edgeClasses[`${u}->${v}`] = "cross";
          snap({ active: u, examining: [u, v], edgeClass: "cross", msg: `${v} ist schwarz, ${u}.d > ${v}.d → Kreuzkante (K)` });
        }
      }
    }
    time++; state[u].f = time; state[u].color = "black"; stack.pop();
    snap({ active: stack[stack.length - 1] || null, msg: `${u} abgeschlossen → schwarz · ${u}.f = ${time}` });
  }

  snap({ msg: "Start: alle Knoten weiß, time = 0" });
  for (const u of nodeOrder) {
    if (state[u].color === "white") {
      snap({ msg: `Hauptschleife: ${u} ist weiß → neuer DFS-Baum (Wurzel ${u})` });
      visit(u);
    }
  }
  snap({ msg: "DFS abgeschlossen.", done: true });
  return frames;
}

/* --------- Geometrie für (ggf. gebogene) gerichtete Kanten ----------- */
function edgeGeom(p1, p2, r, curve) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const s = [p1[0] + ux * r, p1[1] + uy * r];
  const e = [p2[0] - ux * (r + 7), p2[1] - uy * (r + 7)];
  if (!curve) {
    return { d: `M${s[0]},${s[1]} L${e[0]},${e[1]}`, mid: [(s[0] + e[0]) / 2 + px * 12, (s[1] + e[1]) / 2 + py * 12] };
  }
  const mx = (p1[0] + p2[0]) / 2 + px * curve;
  const my = (p1[1] + p2[1]) / 2 + py * curve;
  // Endpunkte am Knotenrand entlang der Sehne grob trimmen
  const s2 = [p1[0] + (mx - p1[0]) / Math.hypot(mx - p1[0], my - p1[1]) * r,
              p1[1] + (my - p1[1]) / Math.hypot(mx - p1[0], my - p1[1]) * r];
  const e2 = [p2[0] + (mx - p2[0]) / Math.hypot(mx - p2[0], my - p2[1]) * (r + 7),
              p2[1] + (my - p2[1]) / Math.hypot(mx - p2[0], my - p2[1]) * (r + 7)];
  return { d: `M${s2[0]},${s2[1]} Q${mx},${my} ${e2[0]},${e2[1]}`, mid: [mx + px * 6, my + py * 6] };
}

const EDGE_COLOR = { tree: C.accent, back: C.warn, forward: C.accent2, cross: C.dim, none: C.line };
const EDGE_LABEL = { tree: "Baum", back: "R", forward: "V", cross: "K" };

function dfsNodeStyle(color) {
  if (color === "white") return { fill: C.panel2, stroke: C.line, txt: C.dim, dash: "4 3" };
  if (color === "gray") return { fill: "rgba(252,211,77,0.16)", stroke: C.gold, txt: C.text, dash: null };
  return { fill: "rgba(45,212,191,0.18)", stroke: C.accent, txt: C.text, dash: null }; // schwarz = fertig
}

/* ----------- DFS-Wald aus den π-Zeigern eines Frames bauen ----------- */
function buildForest(nodes, nodeOrder) {
  const discovered = nodeOrder.filter((id) => nodes[id].d != null);
  const roots = discovered.filter((id) => nodes[id].pi == null);
  const childrenOf = (id) => discovered.filter((c) => nodes[c].pi === id);
  const render = (id, depth) => (
    <div key={id}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "3px 0", paddingLeft: depth * 18,
        color: nodes[id].f != null ? C.text : C.dim,
        fontSize: 14,
      }}>
        <span style={{ color: depth === 0 ? C.accent2 : C.dim }}>{depth === 0 ? "▸" : "└"}</span>
        <span style={{ fontWeight: 700 }}>{id}</span>
        <Pill color={C.accent}>{`${nodes[id].d}/${nodes[id].f ?? "–"}`}</Pill>
      </div>
      {childrenOf(id).map((c) => render(c, depth + 1))}
    </div>
  );
  if (roots.length === 0) return <div style={{ color: C.dim, fontSize: 14 }}>– noch leer –</div>;
  return roots.map((r) => render(r, 0));
}

/* =============================== DFSPlayer ============================ */
function DFSPlayer({ graph }) {
  const frames = useMemo(() => simulateDFS(graph), [graph]);
  const p = usePlayer(frames.length);
  const fr = frames[p.i];
  const r = 24;
  const reverseExists = (a, b) => graph.edges.some(([x, y]) => x === b && y === a);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18, alignItems: "stretch" }}>
        {/* Graph */}
        <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 8 }}>
          <svg viewBox={graph.viewBox} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              {Object.entries(EDGE_COLOR).map(([k, col]) => (
                <marker key={k} id={`arr-${graph.id}-${k}`} markerWidth="9" markerHeight="9"
                  refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L7,3 L0,6 Z" fill={col} />
                </marker>
              ))}
              <marker id={`arr-${graph.id}-gold`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L7,3 L0,6 Z" fill={C.gold} />
              </marker>
            </defs>

            {/* Kanten */}
            {graph.edges.map(([a, b], idx) => {
              const cls = fr.edgeClasses[`${a}->${b}`] || "none";
              const isExam = fr.examining && fr.examining[0] === a && fr.examining[1] === b;
              const curve = reverseExists(a, b) ? (a < b ? 26 : -26) : 0;
              const g = edgeGeom(graph.pos[a], graph.pos[b], r, curve);
              const col = isExam ? C.gold : EDGE_COLOR[cls];
              const dashed = cls === "back" || cls === "forward" || cls === "cross";
              return (
                <g key={idx}>
                  <path d={g.d} fill="none" stroke={col}
                    strokeWidth={isExam ? 3.4 : (cls === "tree" ? 2.6 : 1.8)}
                    strokeDasharray={dashed && !isExam ? "6 5" : null}
                    markerEnd={`url(#arr-${graph.id}-${isExam ? "gold" : cls})`}
                    style={{ transition: "stroke .3s, stroke-width .3s" }} />
                  {cls !== "none" && EDGE_LABEL[cls] && (
                    <text x={g.mid[0]} y={g.mid[1]} fill={isExam ? C.gold : col}
                      fontSize="11" fontWeight="700" textAnchor="middle"
                      style={{ fontFamily: "ui-monospace, monospace" }}>{EDGE_LABEL[cls]}</text>
                  )}
                </g>
              );
            })}

            {/* Knoten */}
            {graph.nodes.map((id) => {
              const n = fr.nodes[id];
              const st = dfsNodeStyle(n.color);
              const isActive = fr.active === id;
              const [x, y] = graph.pos[id];
              return (
                <g key={id} style={{ transition: "all .3s" }}>
                  {isActive && (
                    <circle cx={x} cy={y} r={r + 6} fill="none" stroke={C.gold} strokeWidth="2" opacity="0.85"
                      style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
                  )}
                  <circle cx={x} cy={y} r={r} fill={st.fill} stroke={st.stroke} strokeWidth="2.4"
                    strokeDasharray={st.dash} style={{ transition: "fill .3s, stroke .3s" }} />
                  <text x={x} y={y - 1} fill={st.txt} fontSize="18" fontWeight="800" textAnchor="middle" dominantBaseline="middle">{id}</text>
                  <text x={x} y={y + 13} fill={st.txt} fontSize="10.5" textAnchor="middle"
                    style={{ fontFamily: "ui-monospace, monospace", opacity: n.d ? 1 : 0.4 }}>
                    {n.d ? `${n.d}/${n.f ?? "–"}` : "–/–"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Seitenpanel: Wald + Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", flex: 1 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: C.dim, marginBottom: 8 }}>DFS-Wald (Knoten · d/f)</div>
            {buildForest(fr.nodes, graph.nodes)}
          </div>
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: C.dim, marginBottom: 8 }}>Rekursions-Stack (graue Knoten)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 26 }}>
              {fr.stack.length === 0 ? <span style={{ color: C.dim, fontSize: 13 }}>leer</span> :
                fr.stack.map((s) => (
                  <span key={s} style={{
                    background: "rgba(252,211,77,0.16)", border: `1px solid ${C.gold}`, color: C.text,
                    borderRadius: 7, padding: "2px 9px", fontWeight: 700, fontSize: 13,
                    animation: "pop .3s ease",
                  }}>{s}</span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statuszeile */}
      <div style={{
        marginTop: 14, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
        padding: "11px 14px", color: C.text, fontSize: 14.5, minHeight: 20,
      }}>
        <span style={{ color: C.accent2, fontWeight: 700, marginRight: 8 }}>time = {fr.time}</span>
        {fr.msg}
      </div>

      <Controls p={p} len={frames.length} />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", rowGap: 6 }}>
        <Tag color={C.line}>weiß = unentdeckt</Tag>
        <Tag color={C.gold}>grau = auf dem Stack</Tag>
        <Tag color={C.accent}>schwarz = fertig / Baumkante</Tag>
        <Tag color={C.warn}>R = Rückwärtskante</Tag>
        <Tag color={C.accent2}>V = Vorwärtskante</Tag>
        <Tag color={C.dim}>K = Kreuzkante</Tag>
      </div>
    </div>
  );
}

/* ================= 2-Färbungs-Simulation (BFS, ungerichtet) =========== */
function simulateBipartite({ nodeOrder, adj }) {
  const color = {};
  nodeOrder.forEach((id) => (color[id] = "none"));
  const frames = [];
  let conflictEdge = null, conflict = false, queue = [], active = null, examining = null;

  const push = (msg, extra = {}) => frames.push({
    color: { ...color }, queue: [...queue], active,
    examining: examining ? [...examining] : null,
    conflictEdge: conflictEdge ? [...conflictEdge] : null,
    conflict, msg, ...extra,
  });

  push("Start: alle Knoten ungefärbt.");
  for (const s of nodeOrder) {
    if (conflict) break;
    if (color[s] === "none") {
      color[s] = "rot"; queue = [s]; active = null; examining = null;
      push(`Neue Komponente: Startknoten ${s} → rot, in die Warteschlange.`);
      while (queue.length && !conflict) {
        const u = queue.shift(); active = u; examining = null;
        push(`Entnimm ${u} (Farbe ${color[u]}) aus der Warteschlange, prüfe Nachbarn.`);
        for (const v of adj[u]) {
          examining = [u, v];
          if (color[v] === "none") {
            color[v] = color[u] === "rot" ? "blau" : "rot";
            queue.push(v);
            push(`${v} ungefärbt → Gegenfarbe ${color[v]}, in die Warteschlange.`);
          } else if (color[v] === color[u]) {
            conflict = true; conflictEdge = [u, v];
            push(`Kante {${u},${v}}: beide ${color[u]} → Konflikt! G ist NICHT zweifärbbar.`, { bad: true });
            break;
          } else {
            push(`${v} ist bereits ${color[v]} (Gegenfarbe) → ok.`);
          }
        }
        if (conflict) break;
        examining = null;
      }
    }
  }
  active = null; examining = null;
  if (!conflict) push("Keine Kante mit gleichfarbigen Endpunkten → G ist zweifärbbar. ✓", { good: true });
  return frames;
}

function colNodeStyle(c) {
  if (c === "rot") return { fill: "rgba(252,165,165,0.20)", stroke: ROT, txt: C.text };
  if (c === "blau") return { fill: "rgba(96,165,250,0.20)", stroke: BLAU, txt: C.text };
  return { fill: C.panel2, stroke: C.line, txt: C.dim };
}

/* ========================= BipartitePlayer ============================ */
function BipartitePlayer({ graph }) {
  const frames = useMemo(() => simulateBipartite(graph), [graph]);
  const p = usePlayer(frames.length);
  const fr = frames[p.i];
  const r = 23;
  const undirEdges = useMemo(() => {
    const seen = new Set(), out = [];
    graph.edges.forEach(([a, b]) => {
      const key = [a, b].sort().join("|");
      if (!seen.has(key)) { seen.add(key); out.push([a, b]); }
    });
    return out;
  }, [graph]);

  const result = fr.done ? null : null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 18 }}>
        <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 8 }}>
          <svg viewBox={graph.viewBox} style={{ width: "100%", height: "auto", display: "block" }}>
            {/* Kanten (ungerichtet) */}
            {undirEdges.map(([a, b], idx) => {
              const [x1, y1] = graph.pos[a], [x2, y2] = graph.pos[b];
              const isExam = fr.examining &&
                ((fr.examining[0] === a && fr.examining[1] === b) || (fr.examining[0] === b && fr.examining[1] === a));
              const isConf = fr.conflictEdge &&
                ((fr.conflictEdge[0] === a && fr.conflictEdge[1] === b) || (fr.conflictEdge[0] === b && fr.conflictEdge[1] === a));
              const col = isConf ? C.warn : isExam ? C.gold : C.line;
              return (
                <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={col} strokeWidth={isConf ? 4 : isExam ? 3.2 : 1.8}
                  strokeDasharray={isConf ? "7 4" : null}
                  style={{ transition: "stroke .3s, stroke-width .3s", animation: isConf ? "pulse 0.9s ease-in-out infinite" : null }} />
              );
            })}
            {/* Knoten */}
            {graph.nodes.map((id) => {
              const st = colNodeStyle(fr.color[id]);
              const isActive = fr.active === id;
              const [x, y] = graph.pos[id];
              return (
                <g key={id}>
                  {isActive && <circle cx={x} cy={y} r={r + 6} fill="none" stroke={C.gold} strokeWidth="2" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />}
                  <circle cx={x} cy={y} r={r} fill={st.fill} stroke={st.stroke} strokeWidth="2.6"
                    style={{ transition: "fill .3s, stroke .3s", animation: fr.color[id] !== "none" ? "pop .3s ease" : null }} />
                  <text x={x} y={y} fill={st.txt} fontSize="17" fontWeight="800" textAnchor="middle" dominantBaseline="middle">{id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", flex: 1 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: C.dim, marginBottom: 8 }}>Warteschlange (FIFO)</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", minHeight: 26 }}>
              {fr.queue.length === 0 ? <span style={{ color: C.dim, fontSize: 13 }}>leer</span> :
                fr.queue.map((q, k) => {
                  const st = colNodeStyle(fr.color[q]);
                  return <span key={k} style={{
                    background: st.fill, border: `1px solid ${st.stroke}`, color: C.text,
                    borderRadius: 7, padding: "2px 9px", fontWeight: 700, fontSize: 13, animation: "pop .3s ease",
                  }}>{q}</span>;
                })}
            </div>
          </div>
          <div style={{
            background: fr.bad ? "rgba(252,165,165,0.10)" : fr.good ? "rgba(134,239,172,0.10)" : C.panel2,
            border: `1px solid ${fr.bad ? C.warn : fr.good ? C.good : C.line}`,
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".1em", color: C.dim, marginBottom: 6 }}>Ergebnis</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: fr.bad ? C.warn : fr.good ? C.good : C.dim }}>
              {fr.bad ? "✗ nicht zweifärbbar" : fr.good ? "✓ zweifärbbar" : "… läuft"}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
        padding: "11px 14px", color: C.text, fontSize: 14.5, minHeight: 20,
      }}>{fr.msg}</div>

      <Controls p={p} len={frames.length} />

      <div style={{ marginTop: 14 }}>
        <Tag color={ROT}>rot</Tag>
        <Tag color={BLAU}>blau</Tag>
        <Tag color={C.line}>ungefärbt</Tag>
        <Tag color={C.gold}>geprüfte Kante / aktiver Knoten</Tag>
        <Tag color={C.warn}>Konflikt-Kante</Tag>
      </div>
    </div>
  );
}

/* ============================ Graph-Daten ============================= */
// Aufgabe 2a) — Pfad u→v existiert, u.d<v.d, aber v ist KEIN Nachkomme von u.
const G2a = {
  id: "g2a",
  viewBox: "0 0 360 230",
  nodes: ["w", "u", "v"],
  pos: { w: [180, 48], u: [88, 178], v: [272, 178] },
  edges: [["w", "u"], ["u", "w"], ["w", "v"]],
  nodeOrder: ["w", "u", "v"],
  adj: { w: ["u", "v"], u: ["w"], v: [] },
};
// Aufgabe 2b) — Pfad u→v existiert, aber v.d > u.f (u ist längst fertig).
const G2b = {
  id: "g2b",
  viewBox: "0 0 360 250",
  nodes: ["r", "u", "x", "v"],
  pos: { r: [180, 45], u: [70, 150], x: [255, 130], v: [290, 215] },
  edges: [["r", "u"], ["u", "r"], ["r", "x"], ["x", "v"]],
  nodeOrder: ["r", "u", "x", "v"],
  adj: { r: ["u", "x"], u: ["r"], x: ["v"], v: [] },
};
// Aufgabe 2c) — u bildet einen Einzelknoten-Baum, obwohl u Ein- UND Ausgangskante hat.
const G2c = {
  id: "g2c",
  viewBox: "0 0 400 160",
  nodes: ["x", "u", "w"],
  pos: { x: [70, 80], u: [200, 80], w: [330, 80] },
  edges: [["u", "x"], ["w", "u"]],
  nodeOrder: ["x", "u", "w"],
  adj: { x: [], u: ["x"], w: ["u"] },
};
// Aufgabe 3a) — kleinster nicht-zweifärbbarer Graph: Dreieck K₃.
const GK3 = {
  id: "gk3",
  viewBox: "0 0 360 230",
  nodes: ["1", "2", "3"],
  pos: { "1": [180, 45], "2": [85, 185], "3": [275, 185] },
  edges: [["1", "2"], ["1", "3"], ["2", "3"]],
  nodeOrder: ["1", "2", "3"],
  adj: { "1": ["2", "3"], "2": ["1", "3"], "3": ["1", "2"] },
};
// Aufgabe 3c) — zweifärbbarer Graph mit ZWEI Komponenten (nicht zusammenhängend).
const GBIP = {
  id: "gbip",
  viewBox: "0 0 420 230",
  nodes: ["A", "B", "C", "D", "E", "F"],
  pos: { A: [70, 55], B: [210, 55], C: [210, 175], D: [70, 175], E: [355, 70], F: [355, 165] },
  edges: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "B"], ["E", "F"],
          ["B", "A"], ["C", "B"], ["D", "C"], ["A", "D"], ["F", "E"]],
  nodeOrder: ["A", "B", "C", "D", "E", "F"],
  adj: { A: ["B", "D"], B: ["A", "C"], C: ["B", "D"], D: ["C", "A"], E: ["F"], F: ["E"] },
};

/* ============================ Hauptkomponente ========================= */
export default function Uebung08Trainer() {
  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    }}>
      <style>{`
        @keyframes pop { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.12) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes pulse { 0%,100% { opacity: .35 } 50% { opacity: .9 } }
        button:disabled { opacity: .4; cursor: not-allowed }
        ::selection { background: ${C.accent}55 }
        code { font-feature-settings: "calt" 0 }
      `}</style>

      {/* Hero */}
      <header style={{
        borderBottom: `1px solid ${C.line}`,
        background: `radial-gradient(900px 320px at 20% -10%, ${C.accent}1a, transparent), radial-gradient(700px 300px at 90% -20%, ${C.accent2}14, transparent)`,
      }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "56px 24px 44px" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: ".16em", fontSize: 12.5, fontWeight: 700, color: C.accent }}>
            Übung 08 · Aufgaben 2 & 3 · Theoretische Informatik II
          </div>
          <h1 style={{ fontSize: 44, lineHeight: 1.06, margin: "14px 0 0", fontWeight: 800, letterSpacing: "-.02em" }}>
            Tiefensuche &amp; Zweifärbbarkeit
          </h1>
          <p style={{ color: C.dim, fontSize: 18, lineHeight: 1.65, marginTop: 18, maxWidth: 680 }}>
            Wie durchläuft man einen Graphen systematisch in die Tiefe – und warum trügt unsere Intuition über
            Entdeckungs- und Abschlusszeiten so oft? Und wann lässt sich ein Graph mit nur zwei Farben so färben,
            dass keine Kante zwei gleiche Farben verbindet? Wir bauen beides Schritt für Schritt auf, live animiert.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 24px" }}>

        {/* 0 — Problem */}
        <Section kicker="Motivation" title="0 · Warum brauchen wir das überhaupt?">
          <p>
            Ein <b>Graph</b> (eine Menge von <i>Knoten</i> V und <i>Kanten</i> E, also Verbindungen zwischen Knoten)
            modelliert Beziehungen: Abhängigkeiten zwischen Aufgaben, Verlinkungen von Webseiten, Freundschaften in
            einem Netzwerk. Sobald wir solche Strukturen <i>berechnen</i> wollen, brauchen wir eine zuverlässige Art,
            jeden Knoten genau einmal zu besuchen.
          </p>
          <p style={{ marginTop: 12 }}>
            Die <b>Tiefensuche</b> (engl. <i>depth-first search</i>, kurz DFS) ist dafür das Arbeitspferd. Sie liefert
            nicht nur „besucht / nicht besucht“, sondern reichhaltige Zusatzinformation – <Pill color={C.accent}>d</Pill> (Entdeckungszeit)
            und <Pill color={C.accent}>f</Pill> (Abschlusszeit) je Knoten –, aus der sich erstaunlich viel ablesen lässt
            (z.&nbsp;B. eine topologische Sortierung oder die Erkennung von Kreisen).
          </p>
          <p style={{ marginTop: 12 }}>
            <b>Aufgabe&nbsp;2</b> testet, ob du die DFS wirklich verstanden hast – durch drei <i>Behauptungen</i>, die
            plausibel klingen, aber falsch sind. Deine Aufgabe ist es, Gegenbeispiele zu konstruieren.
            <b> Aufgabe&nbsp;3</b> stellt eine saubere Struktur­frage: Ist ein Graph mit zwei Farben <i>zulässig färbbar</i>?
          </p>
        </Section>

        {/* 1 — Kernidee DFS */}
        <Section kicker="Kernidee I" title="1 · Die Tiefensuche – so tickt sie">
          <p>
            Die Idee in einem Satz: <b>Gehe von einem Knoten so tief wie möglich, bis es nicht mehr weitergeht, und
            kehre dann zurück</b> (Backtracking). Jeder Knoten durchläuft dabei drei Zustände, klassisch als Farben notiert:
          </p>
          <div style={{ margin: "16px 0" }}>
            <MethodRow color={C.line} name="weiß" formula="unentdeckt" note="Der Knoten wurde noch nicht besucht." />
            <MethodRow color={C.gold} name="grau" formula="in Bearbeitung" note="Knoten entdeckt, liegt aktuell auf dem Rekursions-Stack (Bearbeitung noch nicht abgeschlossen)." />
            <MethodRow color={C.accent} name="schwarz" formula="abgeschlossen" note="Alle von diesem Knoten erreichbaren Wege wurden untersucht." />
          </div>

          <InfoBox title="Entdeckungs- und Abschlusszeit (u.d / u.f)">
            Eine globale Variable <Pill color={C.accent2}>time</Pill> wird bei jedem Ereignis um 1 erhöht.
            Beim ersten Besuch eines Knotens u (weiß→grau) merken wir uns <Pill color={C.accent}>u.d</Pill> (engl.
            <i> discovery time</i>), beim Abschließen (grau→schwarz) <Pill color={C.accent}>u.f</Pill> (<i>finish time</i>).
            Notation in der Vorlesung: <Pill>d/f</Pill> direkt am Knoten. Es gilt immer <Pill>u.d &lt; u.f</Pill>.
          </InfoBox>

          <p style={{ marginTop: 12 }}>Als Pseudocode (Python-nah, die genaue Syntax ist Nebensache):</p>
          <PseudoBox lines={[
            ["DFS", "(Graph G = (V, E))"],
            ["  foreach", " u ∈ V:  u.color = weiß;  u.π = nil"],
            ["  ", "time = 0                    # globale Variable"],
            ["  foreach", " u ∈ V:"],
            ["    if", " u.color == weiß:  DFSVisit(G, u)"],
            ["", ""],
            ["DFSVisit", "(G, u)"],
            ["  ", "time = time + 1;  u.d = time;  u.color = grau"],
            ["  foreach", " v ∈ Adj[u]:           # Nachbarn von u"],
            ["    if", " v.color == weiß:  v.π = u;  DFSVisit(G, v)"],
            ["  ", "time = time + 1;  u.f = time;  u.color = schwarz"],
          ]} />
          <p style={{ marginTop: 14, color: C.dim, fontSize: 14.5 }}>
            <b style={{ color: C.text }}>Wichtig:</b> Die äußere <Pill>foreach</Pill>-Schleife sorgt dafür, dass auch
            ein nicht zusammenhängender Graph vollständig durchsucht wird – jeder noch weiße Knoten startet einen
            neuen Baum. Die Sammlung dieser Bäume heißt <b>DFS-Wald</b> (G<sub>π</sub>), die Kanten v.π→v sind die
            <b> Baumkanten</b>.
          </p>
          <p style={{ marginTop: 10, color: C.dim, fontSize: 14.5 }}>
            <b style={{ color: C.text }}>Laufzeit:</b> DFSVisit wird pro Knoten genau einmal aufgerufen (O(|V|)),
            jede Adjazenzliste genau einmal durchlaufen (Σ deg = O(|E|)) ⇒ <Pill color={C.accent}>O(|V| + |E|)</Pill>.
          </p>
        </Section>

        {/* 2 — Der schwierige Teil */}
        <Section kicker="Der schwierige Teil" title="2 · Wann trügt die Intuition?">
          <p>
            Aufgabe&nbsp;2 dreht sich um zwei Sätze, die genau beschreiben, was die d/f-Zeiten <i>wirklich</i> garantieren –
            und wo naive Schlussfolgerungen scheitern.
          </p>
          <InfoBox title="Klammerntheorem">
            Für zwei beliebige Knoten u, v sind ihre Besuchsintervalle <Pill>[u.d, u.f]</Pill> und <Pill>[v.d, v.f]</Pill>
            entweder <b>vollständig getrennt</b> (dann ist keiner Nachkomme des anderen) oder <b>vollständig
            ineinander geschachtelt</b> (der mit dem umfassenden Intervall ist Vorfahr). Überlappen wie zwei
            falsch gesetzte Klammern <Pill>[ ( ] )</Pill> ist <b>unmöglich</b>.
          </InfoBox>
          <InfoBox title="Satz vom weißen Pfad">
            v wird <b>genau dann</b> ein Nachkomme von u im DFS-Wald, wenn zum Zeitpunkt u.d ein Weg von u nach v
            existiert, der <b>nur über weiße Knoten</b> läuft. Das ist der Knackpunkt: Existiert <i>irgendein</i> Pfad
            u→v, aber ist er beim Entdecken von u durch einen bereits grauen/schwarzen Knoten <b>blockiert</b>, landet
            v nicht zwangsläufig unter u.
          </InfoBox>
          <p style={{ marginTop: 12 }}>
            Genau diese Lücke nutzen die drei Gegenbeispiele aus: Ein Pfad u→v <i>existiert</i>, aber er ist kein
            <i> weißer</i> Pfad – meist, weil eine <b>Rückwärtskante</b> über einen gemeinsamen Vorfahren läuft.
          </p>
        </Section>

        {/* 3 — Kantenklassifikation & Vergleich */}
        <Section kicker="Varianten & Einordnung" title="3 · Kantenarten und BFS ↔ DFS">
          <p>Nach einer DFS lässt sich jede Kante (u, v) eindeutig in eine von vier Klassen einordnen:</p>
          <div style={{ margin: "16px 0" }}>
            <MethodRow color={C.accent} name="Baumkante" formula="v weiß" note="Kante, über die v zum ersten Mal entdeckt wird – Bestandteil des DFS-Waldes." />
            <MethodRow color={C.warn} name="Rückwärtskante (R)" formula="v grau" note="Zeigt auf einen Vorfahren auf dem Stack. Ihre Existenz ⇔ es gibt einen Kreis im gerichteten Graphen." />
            <MethodRow color={C.accent2} name="Vorwärtskante (V)" formula="v schwarz, u.d < v.d" note="Zeigt auf einen bereits abgeschlossenen Nachfahren (Abkürzung nach unten im selben Baum)." />
            <MethodRow color={C.dim} name="Kreuzkante (K)" formula="v schwarz, u.d > v.d" note="Verbindet Knoten ohne Vorfahr-Nachfahr-Beziehung – etwa zwischen zwei Teilbäumen." />
          </div>
          <p style={{ marginTop: 6 }}>Zum Vergleich die beiden zentralen Durchlaufstrategien:</p>
          <div style={{ margin: "16px 0" }}>
            <MethodRow color={C.accent2} name="Breitensuche (BFS)" formula="Queue · O(V+E)" note="Wellenförmig ab Startknoten. Liefert kürzeste Wege (in Kantenanzahl). Datenstruktur: Warteschlange. Brauchen wir gleich für die Zweifärbbarkeit." />
            <MethodRow color={C.accent} name="Tiefensuche (DFS)" formula="Stack/Rek. · O(V+E)" note="So schnell wie möglich weit weg. Liefert d/f-Werte (z.B. für topologische Sortierung). Datenstruktur: Rekursion bzw. Stapel." />
          </div>
        </Section>

        {/* 4 — Die drei Gegenbeispiele */}
        <Section kicker="Aufgabe 2 · a / b / c" title="4 · Die drei Gegenbeispiele, live">
          <p style={{ marginBottom: 6 }}>
            In allen drei Aufgabenteilen ist die Antwort ein <b>kleiner gerichteter Graph</b> plus die DFS darauf.
            Spiele die Animationen ab und beobachte, wie die behauptete Eigenschaft jeweils verletzt wird.
            (Keine Selbst- oder Mehrfachkanten – eine Hin- und eine Rückkante zwischen zwei Knoten sind erlaubt,
            das sind zwei <i>verschiedene</i> gerichtete Kanten.)
          </p>

          {/* 2a */}
          <Card style={{ marginTop: 22 }}>
            <ClaimHead part="a)" claim="„Gibt es einen Pfad u→v und gilt u.d < v.d, dann ist v ein Nachkomme von u im DFS-Baum.“" />
            <DFSPlayer graph={G2a} />
            <Resolution>
              Hier ist <b>u → w → v</b> ein Pfad (über die Rückwärtskante u→w und die Baumkante w→v), und es gilt
              <Pill> u.d = 2 &lt; v.d = 4</Pill>. Trotzdem sind u und v <b>Geschwister</b> – beide direkte Kinder der
              Wurzel w. v ist <b>kein</b> Nachkomme von u. Grund: Als u entdeckt wurde, war der einzige Weg zu v über
              den bereits grauen Knoten w blockiert – <b>kein weißer Pfad</b>. Behauptung widerlegt. ✓
            </Resolution>
          </Card>

          {/* 2b */}
          <Card style={{ marginTop: 22 }}>
            <ClaimHead part="b)" claim="„Gibt es einen Pfad u→v, dann gilt für jede DFS: v.d < u.f.“" />
            <DFSPlayer graph={G2b} />
            <Resolution>
              Der Pfad <b>u → r → x → v</b> existiert (Rückwärtskante u→r, dann r→x→v). u wird aber komplett
              abgeschlossen, <b>bevor</b> v überhaupt entdeckt wird: <Pill>u.f = 3</Pill>, aber <Pill>v.d = 5</Pill>,
              also <Pill>v.d &gt; u.f</Pill>. Die Behauptung „v.d &lt; u.f“ ist damit verletzt. Anschaulich: u steckt in
              einer Sackgasse, deren einziger Ausgang (über r) erst <i>nach</i> u’s Abschluss weiterverfolgt wird. ✓
            </Resolution>
          </Card>

          {/* 2c */}
          <Card style={{ marginTop: 22 }}>
            <ClaimHead part="c)" claim="Finde eine DFS, in der ein Baum aus dem einzelnen Knoten u entsteht – obwohl u sowohl eingehende als auch ausgehende Kanten hat." />
            <DFSPlayer graph={G2c} />
            <Resolution>
              Verarbeitungsreihenfolge der Hauptschleife: <b>x, u, w</b>. Wenn u als Wurzel entdeckt wird, ist sein
              einziger Nachbar x bereits <b>schwarz</b> (im ersten Baum abgeschlossen) → kein Abstieg, u wird sofort
              fertig: <Pill>u.d = 3, u.f = 4</Pill>, also ein <b>Einzelknoten-Baum</b>. Dabei hat u die Ausgangskante
              <Pill> u→x</Pill> (wird zur Kreuzkante) und die Eingangskante <Pill>w→u</Pill> (von w aus eine
              Kreuzkante, nachdem u schwarz ist). Genau das Geforderte. ✓
            </Resolution>
          </Card>
        </Section>

        {/* 5 — Zweifärbbarkeit */}
        <Section kicker="Kernidee II · Aufgabe 3" title="5 · Zweifärbbarkeit – mit zwei Farben auskommen">
          <p>
            Ein Graph G = (V, E) heißt <b>zweifärbbar</b>, wenn es eine Abbildung <Pill color={C.accent}>c : V → {"{rot, blau}"}</Pill> gibt,
            sodass für <i>jede</i> Kante {"{u, v}"} ∈ E gilt: <Pill>c(u) ≠ c(v)</Pill>. In Worten: Benachbarte Knoten
            bekommen immer verschiedene Farben. (Das ist genau der Begriff <i>bipartit</i> aus der Graphentheorie.)
          </p>

          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "28px 0 10px", color: C.text }}>
            a) Der kleinste nicht-zweifärbbare Graph
          </h3>
          <p>
            Es ist das <b>Dreieck K₃</b>: drei Knoten, paarweise verbunden. Mit nur zwei Farben müssen nach dem
            Schubfachprinzip zwei der drei Knoten dieselbe Farbe tragen – und die sind benachbart. Allgemein gilt:
            ein Graph ist genau dann zweifärbbar, wenn er <b>keinen Kreis ungerader Länge</b> enthält; der kürzeste
            ungerade Kreis ist der 3er-Kreis. Spiele die BFS-Färbung ab und beobachte, wo der Konflikt entsteht:
          </p>
          <Card style={{ marginTop: 16 }}>
            <ClaimHead part="K₃" claim="Versuch, das Dreieck mit zwei Farben zulässig zu färben – per BFS." kind="neutral" />
            <BipartitePlayer graph={GK3} />
          </Card>

          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "30px 0 10px", color: C.text }}>
            b) Eine gegebene Färbung prüfen
          </h3>
          <p>
            <b>Textuell:</b> Eine Färbung c ist genau dann ungültig, wenn es <i>irgendeine</i> Kante gibt, deren beide
            Endknoten dieselbe Farbe haben. Also: Gehe alle Kanten durch und prüfe für jede, ob c(u) = c(v). Findest
            du eine solche Kante, gibt es zwei gleichfarbige Nachbarn (→ <Pill>true</Pill>); andernfalls ist c gültig.
          </p>
          <PseudoBox lines={[
            ["PrüfeFärbung", "(G = (V, E), Färbung c)"],
            ["  foreach", " {u, v} ∈ E:"],
            ["    if", " c(u) == c(v):"],
            ["      return", " true        # zwei benachbarte Knoten gleicher Farbe"],
            ["  return", " false           # gültige Färbung"],
          ]} />
          <InfoBox title="Worst-Case-Laufzeit von b)">
            Über Adjazenzlisten betrachtest du jeden Knoten und jede seiner Kanten genau einmal (jede ungerichtete
            Kante zählt dabei zweimal): Σ deg(u) = 2|E|. Zusammen mit dem Durchlaufen aller Knoten ergibt sich
            <Pill color={C.accent}> O(|V| + |E|)</Pill>. (Liegt E direkt als Liste vor, genügt das Durchgehen der
            Kanten, also Θ(|E|).) Das ist <i>linear</i> in der Graphgröße – schneller geht es nicht, denn man muss
            jede Kante mindestens ansehen.
          </InfoBox>

          <h3 style={{ fontSize: 20, fontWeight: 700, margin: "30px 0 10px", color: C.text }}>
            c) Zweifärbbarkeit entscheiden in O(|V| + |E|)
          </h3>
          <p>
            Bei b) war die Färbung gegeben – jetzt sollen wir selbst herausfinden, <i>ob</i> eine zulässige Färbung
            existiert. Trick: Wir <b>erzeugen</b> eine Färbung mit BFS und prüfen sie gleichzeitig. Da der Graph nicht
            zusammenhängend sein muss, behandeln wir jede Komponente einzeln.
          </p>
          <InfoBox title="Algorithmus (textuell)">
            Färbe zunächst alle Knoten als <i>ungefärbt</i>. Durchlaufe alle Knoten; ist ein Knoten s noch ungefärbt,
            starte eine <b>Breitensuche ab s</b> und färbe s rot. In der Breitensuche: Für jeden entnommenen Knoten u
            betrachte alle Nachbarn v. Ist v <b>ungefärbt</b>, gib ihm die <b>Gegenfarbe</b> von u und reihe ihn ein.
            Ist v <b>bereits gefärbt und hat dieselbe Farbe</b> wie u, dann existiert eine Kante zwischen zwei
            gleichfarbigen Knoten ⇒ <b>nicht zweifärbbar</b>, gib „nein“ zurück. Tritt nie ein Konflikt auf, ist G
            zweifärbbar – und die erzeugte Färbung c ist ein Zeuge dafür.
          </InfoBox>
          <p style={{ marginTop: 4, color: C.dim, fontSize: 14.5 }}>
            <b style={{ color: C.text }}>Warum O(|V| + |E|)?</b> Es ist im Kern eine einzige BFS über alle
            Komponenten: Jeder Knoten wird einmal entnommen, jede Kante einmal betrachtet. Die äußere Schleife über
            alle Knoten kostet zusätzlich O(|V|). Macht zusammen lineare Laufzeit. Die freie Farbwahl je
            Komponenten-Wurzel ist unkritisch, weil verschiedene Komponenten keine gemeinsamen Kanten haben.
          </p>
          <Card style={{ marginTop: 16 }}>
            <ClaimHead part="3c" claim="BFS-Zweifärbung auf einem Graphen mit zwei Komponenten – die äußere Schleife startet die zweite Komponente neu." kind="neutral" />
            <BipartitePlayer graph={GBIP} />
          </Card>
        </Section>

        {/* 6 — Zusammenfassung */}
        <Section kicker="Auf einen Blick" title="6 · Zusammenfassung">
          <div style={{
            background: `linear-gradient(180deg, ${C.accent}12, ${C.accent2}0a)`,
            border: `1px solid ${C.accent}55`, borderRadius: 16, padding: "22px 24px",
          }}>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.85, fontSize: 15.5 }}>
              <li>DFS vergibt pro Knoten <b>u.d</b> (entdeckt, grau) und <b>u.f</b> (fertig, schwarz); Laufzeit <Pill color={C.accent}>O(|V|+|E|)</Pill>.</li>
              <li><b>Klammerntheorem:</b> Intervalle sind getrennt <i>oder</i> geschachtelt – nie überlappend.</li>
              <li><b>Satz vom weißen Pfad:</b> v wird Nachkomme von u ⇔ bei u.d gibt es einen <i>weißen</i> Weg u→v.</li>
              <li><b>Aufgabe 2:</b> Ein bloßer Pfad u→v garantiert weder „v Nachkomme von u“ (a) noch „v.d &lt; u.f“ (b); und ein Knoten mit Ein- und Ausgangskante kann ein Einzelbaum sein (c) – alles über Rückwärts-/Kreuzkanten.</li>
              <li><b>Zweifärbbar = bipartit = kein ungerader Kreis;</b> kleinstes Gegenbeispiel ist das Dreieck <Pill color={C.warn}>K₃</Pill>.</li>
              <li><b>Aufgabe 3:</b> Färbung prüfen = alle Kanten checken; Zweifärbbarkeit entscheiden = BFS mit Gegenfarben über alle Komponenten – beides <Pill color={C.accent}>O(|V|+|E|)</Pill>.</li>
            </ul>
          </div>
        </Section>

        {/* 7 — Glossar */}
        <Section kicker="Nachschlagen" title="7 · Glossar">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <GlossEntry term="Graph G = (V, E)" def="Knotenmenge V und Kantenmenge E. Gerichtet: Kanten sind Paare (u,v); ungerichtet: Mengen {u,v}." />
            <GlossEntry term="Adjazenzliste Adj[u]" def="Liste aller direkten Nachbarn von u. Platzbedarf O(|V|+|E|)." />
            <GlossEntry term="deg(u)" def="Grad: Anzahl der zu u inzidenten Kanten. Summe aller Grade = 2·|E|." />
            <GlossEntry term="DFS / Tiefensuche" def="Durchlauf, der so tief wie möglich absteigt und dann zurückkehrt (Backtracking)." />
            <GlossEntry term="BFS / Breitensuche" def="Wellenförmiger Durchlauf über eine Warteschlange; findet kürzeste Wege (Kantenzahl)." />
            <GlossEntry term="u.d (discovery time)" def="Zeitpunkt, zu dem u entdeckt wird (weiß → grau)." />
            <GlossEntry term="u.f (finish time)" def="Zeitpunkt, zu dem u abgeschlossen wird (grau → schwarz). Stets u.d < u.f." />
            <GlossEntry term="u.π" def="Vorgänger von u im DFS-/BFS-Wald (die Baumkante π(u)→u)." />
            <GlossEntry term="DFS-Wald (Gπ)" def="Sammlung aller Bäume, die die DFS bildet – einer pro Startknoten der äußeren Schleife." />
            <GlossEntry term="Baumkante" def="Kante u→v, über die v erstmals entdeckt wird (v war weiß)." />
            <GlossEntry term="Rückwärtskante (R)" def="Kante auf einen grauen Vorfahren; ihre Existenz zeigt einen gerichteten Kreis an." />
            <GlossEntry term="Vorwärtskante (V)" def="Kante auf einen schwarzen Nachfahren (u.d < v.d)." />
            <GlossEntry term="Kreuzkante (K)" def="Kante zwischen Knoten ohne Vorfahr-Nachfahr-Beziehung (u.d > v.d, v schwarz)." />
            <GlossEntry term="Klammerntheorem" def="Besuchsintervalle [u.d,u.f] sind disjunkt oder geschachtelt – nie überlappend." />
            <GlossEntry term="Satz vom weißen Pfad" def="v wird Nachkomme von u ⇔ bei u.d existiert ein nur über weiße Knoten laufender Weg u→v." />
            <GlossEntry term="Nachkomme / Vorfahr" def="v ist Nachkomme von u, wenn es im DFS-Wald einen Baumpfad u→…→v gibt." />
            <GlossEntry term="Zweifärbbar (bipartit)" def="Es gibt c: V→{rot,blau} mit c(u)≠c(v) für jede Kante {u,v}." />
            <GlossEntry term="K₃ / Dreieck" def="Vollständiger Graph auf 3 Knoten; kleinster nicht-zweifärbbarer Graph." />
            <GlossEntry term="Ungerader Kreis" def="Kreis mit ungerader Kantenzahl. Genau dann nicht vorhanden ⇔ Graph zweifärbbar." />
            <GlossEntry term="O(|V| + |E|)" def="Lineare Laufzeit in der Graphgröße – das übliche Optimum für Durchläufe." />
            <GlossEntry term="Warteschlange (FIFO)" def="„First in, first out“; Datenstruktur der Breitensuche." />
            <GlossEntry term="Rekursions-Stack" def="„Last in, first out“; hält die aktuell grauen Knoten der DFS." />
          </div>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px", color: C.dim, fontSize: 13.5, lineHeight: 1.7 }}>
          Lern-Trainer · Übung 08, Aufgaben 2 &amp; 3 · Kapitel 13 (Graphen + BFS) &amp; 15 (Tiefensuche).<br />
          Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach.
        </div>
      </footer>
    </div>
  );
}

/* ---- Kleine Helfer für Behauptungs-Kopf, Auflösung & Pseudocode ----- */
function ClaimHead({ part, claim, kind = "claim" }) {
  const col = kind === "neutral" ? C.accent2 : C.warn;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
      <span style={{
        flexShrink: 0, background: `${col}22`, border: `1px solid ${col}`, color: col,
        borderRadius: 9, padding: "4px 11px", fontWeight: 800, fontSize: 14,
      }}>{part}</span>
      <span style={{ color: C.text, fontSize: 15.5, lineHeight: 1.6, fontStyle: kind === "neutral" ? "normal" : "italic" }}>
        {kind === "neutral" ? claim : <>Behauptung: {claim}</>}
      </span>
    </div>
  );
}

function Resolution({ children }) {
  return (
    <div style={{
      marginTop: 16, background: "rgba(134,239,172,0.08)", border: `1px solid ${C.good}55`,
      borderLeft: `4px solid ${C.good}`, borderRadius: 12, padding: "14px 16px",
      color: C.text, fontSize: 15, lineHeight: 1.68,
    }}>
      <div style={{ fontWeight: 700, color: C.good, marginBottom: 5 }}>Auflösung</div>
      {children}
    </div>
  );
}

function PseudoBox({ lines }) {
  return (
    <pre style={{
      background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px",
      overflowX: "auto", margin: "8px 0", fontSize: 13.5, lineHeight: 1.7,
      fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", color: C.text,
    }}>
      {lines.map(([kw, rest], i) => (
        <div key={i}>
          <span style={{ color: C.accent, fontWeight: 700 }}>{kw}</span>
          <span style={{ color: rest.includes("#") ? C.text : C.text }}>{rest}</span>
        </div>
      ))}
    </pre>
  );
}