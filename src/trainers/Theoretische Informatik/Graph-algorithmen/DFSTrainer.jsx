import { useState, useEffect, useRef, useCallback } from "react";

// ── Farbpalette ───────────────────────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  panel:   "#171a23",
  panel2:  "#1e222e",
  line:    "#2a2f3d",
  text:    "#e6e8ee",
  dim:     "#9aa1b1",
  accent:  "#7dd3fc",   // cyan  – aktiver/entdeckter Knoten (grau = in Bearbeitung)
  accent2: "#a78bfa",   // violett – Baumkanten / DFS-Baum
  good:    "#86efac",   // grün  – abgeschlossener Knoten (schwarz)
  warn:    "#fca5a5",   // rot   – Rückwärtskante / Fehler
  gold:    "#fcd34d",   // gelb  – aktuell betrachteter Knoten
};

// ── Keyframes ─────────────────────────────────────────────────────────────────
const STYLE = `
@keyframes pop {
  0%   { transform: scale(0.7); opacity:0; }
  70%  { transform: scale(1.08); }
  100% { transform: scale(1);   opacity:1; }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(22px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 ${C.gold}44; }
  50%      { box-shadow: 0 0 0 8px ${C.gold}00; }
}
`;

// ── useReveal ─────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Bausteine ─────────────────────────────────────────────────────────────────
function Section({ kicker, title, children }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} style={{
      marginBottom: 64,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: "opacity .6s ease, transform .6s ease",
    }}>
      {kicker && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", color: C.accent, marginBottom: 6 }}>
          {kicker}
        </div>
      )}
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 24,
        borderBottom: `1px solid ${C.line}`, paddingBottom: 12 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: 24, ...style
    }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap: 6,
      fontSize: 12, color: C.text, background: C.panel2,
      border: `1px solid ${C.line}`, borderRadius: 6, padding: "3px 10px" }}>
      <span style={{ width:8, height:8, borderRadius:2, background: color, flexShrink:0 }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: `${C.accent2}18`, border: `1px solid ${C.accent2}55`,
      borderRadius: 12, padding: "16px 20px", marginTop: 16
    }}>
      <div style={{ display:"flex", gap: 8, alignItems:"flex-start" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          {title && <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 4 }}>{title}</div>}
          <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.line}`, padding: "10px 0" }}>
      <span style={{ color: C.accent, fontWeight: 700, fontFamily:"monospace", marginRight: 8 }}>{term}</span>
      <span style={{ color: C.dim, fontSize: 14 }}>{def}</span>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display:"flex", gap: 0, marginBottom: 12, borderRadius: 10, overflow:"hidden",
      border:`1px solid ${C.line}` }}>
      <div style={{ width: 5, background: color, flexShrink:0 }} />
      <div style={{ padding: "12px 16px", flex:1, background: C.panel }}>
        <div style={{ display:"flex", alignItems:"center", gap: 12, flexWrap:"wrap" }}>
          <span style={{ fontWeight:700, color: C.text, minWidth:120 }}>{name}</span>
          <span style={{ fontFamily:"monospace", background: C.panel2, color: color,
            padding:"2px 8px", borderRadius:5, fontSize:13 }}>{formula}</span>
          <span style={{ color: C.dim, fontSize: 13 }}>{note}</span>
        </div>
      </div>
    </div>
  );
}

const btn = {
  background: C.accent, color: "#0f1117", border: "none", borderRadius: 8,
  padding: "8px 18px", fontWeight: 700, cursor:"pointer", fontSize: 13,
};
const btnGhost = {
  background: "transparent", color: C.accent, border:`1px solid ${C.accent}`,
  borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor:"pointer", fontSize: 13,
};

// ── Graph-Daten ───────────────────────────────────────────────────────────────
const NODES = {
  A: { x:280, y:40  },
  B: { x:150, y:120 },
  F: { x:280, y:120 },
  C: { x:410, y:120 },
  D: { x: 80, y:210 },
  E: { x:200, y:210 },
  G: { x:410, y:210 },
  H: { x: 80, y:300 },
  I: { x:230, y:300 },
  J: { x:330, y:300 },
};

const EDGES = [
  ["A","B"], ["A","F"], ["A","C"],
  ["B","D"], ["B","E"],
  ["D","H"],
  ["F","I"], ["F","J"],
  ["C","G"],
  ["G","J"],
];

// DFS-Schritte (pre-computed + verified)
const DFS_STEPS = [
  { type:"discover", node:"A", time:1,  desc:"Entdecke A → d[A]=1, Farbe: weiß→grau" },
  { type:"edge",     from:"A", to:"B",  edgeType:"tree",  desc:"Kante {A,B}: Baumkante — B ist weiß, gehe tiefer" },
  { type:"discover", node:"B", time:2,  desc:"Entdecke B → d[B]=2, Farbe: weiß→grau" },
  { type:"edge",     from:"B", to:"A",  edgeType:"back",  desc:"Kante {B,A}: Rückwärtskante — A ist bereits grau (in Bearbeitung)" },
  { type:"edge",     from:"B", to:"D",  edgeType:"tree",  desc:"Kante {B,D}: Baumkante — D ist weiß, gehe tiefer" },
  { type:"discover", node:"D", time:3,  desc:"Entdecke D → d[D]=3, Farbe: weiß→grau" },
  { type:"edge",     from:"D", to:"B",  edgeType:"back",  desc:"Kante {D,B}: Rückwärtskante — B ist grau" },
  { type:"edge",     from:"D", to:"H",  edgeType:"tree",  desc:"Kante {D,H}: Baumkante — H ist weiß, gehe tiefer" },
  { type:"discover", node:"H", time:4,  desc:"Entdecke H → d[H]=4, Farbe: weiß→grau" },
  { type:"edge",     from:"H", to:"D",  edgeType:"back",  desc:"Kante {H,D}: Rückwärtskante — D ist grau" },
  { type:"finish",   node:"H", time:5,  desc:"Fertig mit H → f[H]=5, Farbe: grau→schwarz" },
  { type:"finish",   node:"D", time:6,  desc:"Fertig mit D → f[D]=6, Farbe: grau→schwarz" },
  { type:"edge",     from:"B", to:"E",  edgeType:"tree",  desc:"Kante {B,E}: Baumkante — E ist weiß, gehe tiefer" },
  { type:"discover", node:"E", time:7,  desc:"Entdecke E → d[E]=7, Farbe: weiß→grau" },
  { type:"edge",     from:"E", to:"B",  edgeType:"back",  desc:"Kante {E,B}: Rückwärtskante — B ist grau" },
  { type:"finish",   node:"E", time:8,  desc:"Fertig mit E → f[E]=8, Farbe: grau→schwarz" },
  { type:"finish",   node:"B", time:9,  desc:"Fertig mit B → f[B]=9, Farbe: grau→schwarz" },
  { type:"edge",     from:"A", to:"C",  edgeType:"tree",  desc:"Kante {A,C}: Baumkante — C ist weiß, gehe tiefer" },
  { type:"discover", node:"C", time:10, desc:"Entdecke C → d[C]=10, Farbe: weiß→grau" },
  { type:"edge",     from:"C", to:"A",  edgeType:"back",  desc:"Kante {C,A}: Rückwärtskante — A ist grau" },
  { type:"edge",     from:"C", to:"G",  edgeType:"tree",  desc:"Kante {C,G}: Baumkante — G ist weiß, gehe tiefer" },
  { type:"discover", node:"G", time:11, desc:"Entdecke G → d[G]=11, Farbe: weiß→grau" },
  { type:"edge",     from:"G", to:"C",  edgeType:"back",  desc:"Kante {G,C}: Rückwärtskante — C ist grau" },
  { type:"edge",     from:"G", to:"J",  edgeType:"tree",  desc:"Kante {G,J}: Baumkante — J ist weiß, gehe tiefer" },
  { type:"discover", node:"J", time:12, desc:"Entdecke J → d[J]=12, Farbe: weiß→grau" },
  { type:"edge",     from:"J", to:"F",  edgeType:"tree",  desc:"Kante {J,F}: Baumkante — F ist weiß, gehe tiefer" },
  { type:"discover", node:"F", time:13, desc:"Entdecke F → d[F]=13, Farbe: weiß→grau" },
  { type:"edge",     from:"F", to:"A",  edgeType:"back",  desc:"Kante {F,A}: Rückwärtskante — A ist grau" },
  { type:"edge",     from:"F", to:"I",  edgeType:"tree",  desc:"Kante {F,I}: Baumkante — I ist weiß, gehe tiefer" },
  { type:"discover", node:"I", time:14, desc:"Entdecke I → d[I]=14, Farbe: weiß→grau" },
  { type:"edge",     from:"I", to:"F",  edgeType:"back",  desc:"Kante {I,F}: Rückwärtskante — F ist grau" },
  { type:"finish",   node:"I", time:15, desc:"Fertig mit I → f[I]=15, Farbe: grau→schwarz" },
  { type:"edge",     from:"F", to:"J",  edgeType:"back",  desc:"Kante {F,J}: Rückwärtskante — J ist grau" },
  { type:"finish",   node:"F", time:16, desc:"Fertig mit F → f[F]=16, Farbe: grau→schwarz" },
  { type:"edge",     from:"J", to:"G",  edgeType:"back",  desc:"Kante {J,G}: Rückwärtskante — G ist grau" },
  { type:"finish",   node:"J", time:17, desc:"Fertig mit J → f[J]=17, Farbe: grau→schwarz" },
  { type:"finish",   node:"G", time:18, desc:"Fertig mit G → f[G]=18, Farbe: grau→schwarz" },
  { type:"finish",   node:"C", time:19, desc:"Fertig mit C → f[C]=19, Farbe: grau→schwarz" },
  { type:"edge",     from:"A", to:"F",  edgeType:"back",  desc:"Kante {A,F}: Rückwärtskante — F ist bereits schwarz (fertig)" },
  { type:"finish",   node:"A", time:20, desc:"Fertig mit A → f[A]=20, Farbe: grau→schwarz — DFS abgeschlossen!" },
];

// Berechne Node-State nach Schritt i
function computeState(stepIdx) {
  const colors = {};
  const d = {};
  const f = {};
  const treeEdges = new Set();
  const backEdges = new Set();
  let activeEdge = null;
  let activeNode = null;

  Object.keys(NODES).forEach(n => { colors[n] = "white"; });

  for (let i = 0; i <= stepIdx; i++) {
    const s = DFS_STEPS[i];
    if (s.type === "discover") {
      colors[s.node] = "gray";
      d[s.node] = s.time;
      activeNode = s.node;
      activeEdge = null;
    } else if (s.type === "finish") {
      colors[s.node] = "black";
      f[s.node] = s.time;
      activeNode = null;
      activeEdge = null;
    } else if (s.type === "edge") {
      const key = [s.from, s.to].sort().join("-");
      if (i === stepIdx) {
        activeEdge = key;
        activeNode = s.from;
      }
      if (s.edgeType === "tree") treeEdges.add(key);
      else backEdges.add(key);
    }
  }
  return { colors, d, f, treeEdges, backEdges, activeEdge, activeNode };
}

// ── VIS 1: DFS Stepper ────────────────────────────────────────────────────────
function DFSStepper() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  const state = computeState(step);

  const play = useCallback(() => {
    if (step >= DFS_STEPS.length - 1) { setStep(0); }
    setPlaying(true);
  }, [step]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= DFS_STEPS.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 900);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const nodeColor = (n) => {
    const c = state.colors[n];
    if (n === state.activeNode) return C.gold;
    if (c === "gray")  return C.accent;
    if (c === "black") return C.good;
    return C.panel2; // white
  };

  const nodeStroke = (n) => {
    if (n === state.activeNode) return C.gold;
    const c = state.colors[n];
    if (c === "gray")  return C.accent;
    if (c === "black") return C.good;
    return C.dim;
  };

  const edgeColor = (a, b) => {
    const key = [a,b].sort().join("-");
    if (key === state.activeEdge) return C.gold;
    if (state.treeEdges.has(key))  return C.accent2;
    if (state.backEdges.has(key))  return C.warn;
    return C.line;
  };

  const edgeWidth = (a, b) => {
    const key = [a,b].sort().join("-");
    if (key === state.activeEdge) return 3;
    if (state.treeEdges.has(key)) return 2.5;
    return 1.5;
  };

  const cur = DFS_STEPS[step];

  return (
    <Card>
      {/* SVG Graph */}
      <div style={{ overflowX:"auto" }}>
        <svg viewBox="0 0 560 360" style={{ width:"100%", maxWidth:560, display:"block", margin:"0 auto" }}>
          {/* Edges */}
          {EDGES.map(([a,b]) => (
            <line
              key={a+b}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              stroke={edgeColor(a,b)}
              strokeWidth={edgeWidth(a,b)}
              strokeDasharray={(() => {
                const key=[a,b].sort().join("-");
                return state.backEdges.has(key) ? "6 3" : "none";
              })()}
              style={{ transition:"stroke .3s, stroke-width .3s" }}
            />
          ))}

          {/* Nodes */}
          {Object.entries(NODES).map(([n, pos]) => (
            <g key={n}>
              <circle
                cx={pos.x} cy={pos.y} r={22}
                fill={nodeColor(n)}
                stroke={nodeStroke(n)}
                strokeWidth={n === state.activeNode ? 3 : 2}
                style={{ transition:"fill .3s, stroke .3s",
                  animation: state.colors[n]==="gray" && n!==state.activeNode ? "pulse 1.5s infinite" : "none"
                }}
              />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
                fontSize={14} fontWeight={700}
                fill={state.colors[n]==="white" ? C.dim : "#0f1117"}>
                {n}
              </text>
              {/* d/f label */}
              {(state.d[n] !== undefined) && (
                <text x={pos.x+26} y={pos.y-14} fontSize={10} fill={C.dim}
                  fontFamily="monospace">
                  {state.d[n]}/{state.f[n] ?? "–"}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Step info */}
      <div style={{ background: C.panel2, borderRadius: 10, padding: "12px 16px",
        marginTop: 12, minHeight: 48, border: `1px solid ${C.line}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:13, color: C.dim }}>Schritt {step+1} / {DFS_STEPS.length}</span>
          <span style={{
            fontSize:13, fontWeight:600,
            color: cur.type==="discover" ? C.accent
                 : cur.type==="finish"   ? C.good
                 : cur.edgeType==="tree" ? C.accent2 : C.warn
          }}>
            {cur.type==="discover" ? "🔵 Entdecken" : cur.type==="finish" ? "✅ Fertig" :
             cur.edgeType==="tree" ? "🌲 Baumkante" : "↩️ Rückwärtskante"}
          </span>
        </div>
        <div style={{ color: C.text, marginTop:6, fontSize:14 }}>{cur.desc}</div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap", alignItems:"center" }}>
        <button style={btnGhost} onClick={() => { setPlaying(false); setStep(0); }}>⏮ Reset</button>
        <button style={btnGhost} onClick={() => setStep(s => Math.max(0, s-1))} disabled={playing}>‹ Zurück</button>
        <button style={btn} onClick={() => playing ? setPlaying(false) : play()}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button style={btnGhost} onClick={() => setStep(s => Math.min(DFS_STEPS.length-1, s+1))} disabled={playing}>Vor ›</button>
        <button style={{...btnGhost, marginLeft:"auto"}} onClick={() => setStep(DFS_STEPS.length-1)}>⏭ Ende</button>
      </div>

      {/* Legende */}
      <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
        <Tag color={C.panel2}>⬜ weiß = unentdeckt</Tag>
        <Tag color={C.accent}>🔵 grau = in Bearbeitung</Tag>
        <Tag color={C.gold}>🟡 gold = aktiv</Tag>
        <Tag color={C.good}>🟢 schwarz = fertig</Tag>
      </div>

      {/* d/f Tabelle */}
      <div style={{ marginTop: 20, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              {["Knoten","d[ ]","f[ ]","Farbe"].map(h => (
                <th key={h} style={{ textAlign:"center", padding:"6px 8px",
                  color: C.dim, borderBottom:`1px solid ${C.line}`, fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(NODES).map(n => (
              <tr key={n} style={{
                background: n===state.activeNode ? `${C.gold}22` : "transparent",
                transition:"background .3s"
              }}>
                <td style={{ textAlign:"center", padding:"5px 8px", fontWeight:700,
                  color: n===state.activeNode ? C.gold :
                         state.colors[n]==="gray" ? C.accent :
                         state.colors[n]==="black" ? C.good : C.dim }}>
                  {n}
                </td>
                <td style={{ textAlign:"center", padding:"5px 8px", fontFamily:"monospace",
                  color: state.d[n] ? C.text : C.line }}>
                  {state.d[n] ?? "–"}
                </td>
                <td style={{ textAlign:"center", padding:"5px 8px", fontFamily:"monospace",
                  color: state.f[n] ? C.text : C.line }}>
                  {state.f[n] ?? "–"}
                </td>
                <td style={{ textAlign:"center", padding:"5px 8px", fontSize:12 }}>
                  {state.colors[n]==="white"  ? <span style={{color:C.dim}}>weiß</span>
                  :state.colors[n]==="gray"   ? <span style={{color:C.accent}}>grau</span>
                  :<span style={{color:C.good}}>schwarz</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── VIS 2: Kantenkategorien ───────────────────────────────────────────────────
const EDGE_TYPES = [
  {
    name: "Baumkante",
    key: "tree",
    color: C.accent2,
    symbol: "—",
    rule: "Zielknoten v ist weiß",
    desc: "DFS besucht v zum ersten Mal über diese Kante. Sie bildet den DFS-Baum (auch: DFS-Wald).",
    example: "z.B. {A,B}, {B,D}, {G,J}, {J,F}",
    dash: false,
  },
  {
    name: "Rückwärtskante",
    key: "back",
    color: C.warn,
    symbol: "- -",
    rule: "Zielknoten v ist grau (in Bearbeitung)",
    desc: "v ist Vorfahre von u im DFS-Baum. Im ungerichteten Graphen sind ALLE Nicht-Baumkanten Rückwärtskanten. Sie zeigen Zyklen an.",
    example: "z.B. {H,D}, {E,B}, {F,A}",
    dash: true,
  },
  {
    name: "Vorwärtskante",
    key: "forward",
    color: C.gold,
    symbol: "·  ·",
    rule: "Zielknoten v ist schwarz, d[u] < d[v]",
    desc: "Nur in gerichteten Graphen! v ist Nachfahre von u im DFS-Baum, aber kein direktes Kind. Im ungerichteten Graphen nicht möglich.",
    example: "Nur bei gerichteten Graphen",
    dash: true,
  },
  {
    name: "Kreuzkante",
    key: "cross",
    color: C.dim,
    symbol: "···",
    rule: "Zielknoten v ist schwarz, d[u] > d[v]",
    desc: "Nur in gerichteten Graphen! Verbindet Knoten, die weder Vorfahre noch Nachfahre voneinander sind. Im ungerichteten Graphen nicht möglich.",
    example: "Nur bei gerichteten Graphen",
    dash: true,
  },
];

function KantenExplainer() {
  const [selected, setSelected] = useState(0);
  const et = EDGE_TYPES[selected];

  return (
    <Card>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        {EDGE_TYPES.map((e, i) => (
          <button key={e.key} onClick={() => setSelected(i)} style={{
            background: i===selected ? e.color : C.panel2,
            color: i===selected ? "#0f1117" : C.dim,
            border: `1px solid ${i===selected ? e.color : C.line}`,
            borderRadius: 8, padding: "7px 14px", fontWeight: 700,
            cursor:"pointer", fontSize:13, transition:"all .2s"
          }}>
            {e.name}
          </button>
        ))}
      </div>

      {/* Visualisierung der Kantenregel */}
      <div style={{ display:"flex", gap:20, alignItems:"center", justifyContent:"center",
        padding:"20px 0", flexWrap:"wrap" }}>
        {/* Knoten u */}
        <div style={{ textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background: C.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontSize:18, color:"#0f1117",
            border:`3px solid ${C.accent}`, margin:"0 auto 6px" }}>
            u
          </div>
          <div style={{ fontSize:11, color: C.accent }}>grau (aktiv)</div>
        </div>

        {/* Kante */}
        <div style={{ textAlign:"center", minWidth:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"center" }}>
            <div style={{ width:40, height:2, background: et.dash ? "none" : et.color,
              backgroundImage: et.dash ? `repeating-linear-gradient(90deg, ${et.color} 0,${et.color} 6px, transparent 6px, transparent 12px)` : "none"
            }} />
            <div style={{ width:12, height:12, borderRadius:"50%", background:et.color }} />
          </div>
          <div style={{ fontSize:11, color: et.color, marginTop:4, fontWeight:700 }}>{et.name}</div>
        </div>

        {/* Knoten v */}
        <div style={{ textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%",
            background: et.key==="tree" ? C.panel2 : et.key==="back" ? C.accent : C.good,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontSize:18,
            color: et.key==="tree" ? C.dim : "#0f1117",
            border:`3px solid ${et.key==="tree" ? C.dim : et.key==="back" ? C.accent : C.good}`,
            margin:"0 auto 6px" }}>
            v
          </div>
          <div style={{ fontSize:11, color: et.key==="tree" ? C.dim : et.key==="back" ? C.accent : C.good }}>
            {et.key==="tree" ? "weiß (neu)" : et.key==="back" ? "grau (Vorfahre)" : "schwarz (fertig)"}
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ background: C.panel2, borderRadius:10, padding:"14px 16px",
        borderLeft:`4px solid ${et.color}`, marginTop:4 }}>
        <div style={{ fontWeight:700, color: et.color, marginBottom:6 }}>
          Regel: {et.rule}
        </div>
        <div style={{ color: C.text, fontSize:14, marginBottom:6 }}>{et.desc}</div>
        <div style={{ fontFamily:"monospace", fontSize:12, color: C.dim }}>{et.example}</div>
      </div>

      <InfoBox title="Merksatz für ungerichtete Graphen">
        Im ungerichteten Graphen gibt es <strong style={{color:C.accent2}}>nur Baum- und Rückwärtskanten</strong>.
        Vorwärts- und Kreuzkanten treten nur in gerichteten Graphen auf — denn in ungerichteten Graphen
        würde jede solche Kante auch in die andere Richtung existieren, was sie stets zur Rückwärtskante macht.
      </InfoBox>
    </Card>
  );
}

// ── VIS 3: Quiz ───────────────────────────────────────────────────────────────
const QUIZ_ROWS = [
  {
    seq: "A, B, D, H, E, C, G, J, F, I",
    answer: true,
    reason: "Korrekte DFS-Reihenfolge! Nachbarn alphabetisch: A→B (kleinster weißer Nachbar), B→D (vor E), D→H, Backtrack zu B→E, Backtrack zu A→C, C→G, G→J (J ist weiß!), J→F, F→I. Exakt die tatsächliche DFS-Folge.",
  },
  {
    seq: "A, B, E, D, H, C, G, J, F, I",
    answer: false,
    reason: "Unmöglich! Nach A→B prüft DFS die Nachbarn von B alphabetisch: A (grau, skip), D (weiß → nimm D). D kommt also vor E. E kann nicht vor D entdeckt werden, da DFS immer zuerst den alphabetisch kleinsten weißen Nachbarn wählt.",
  },
  {
    seq: "A, B, C, D, E, F, G, H, I, J",
    answer: false,
    reason: "Unmöglich! Nach A→B würde DFS tief in B's Unterbaum tauchen (B→D→H, dann B→E) — solange B noch graue Nachbarn hat, kann DFS nicht zu C zurückkehren. C kann erst entdeckt werden, wenn B komplett fertig ist (schwarz). Das passiert erst nach E.",
  },
];

function QuizSection() {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  const choose = (i, val) => {
    if (revealed[i]) return;
    setAnswers(a => ({ ...a, [i]: val }));
  };

  const reveal = (i) => {
    if (answers[i] === undefined) return;
    setRevealed(r => ({ ...r, [i]: true }));
  };

  const correct = Object.keys(revealed).filter(i => answers[i] === QUIZ_ROWS[i].answer).length;
  const total = Object.keys(revealed).length;

  return (
    <Card>
      <div style={{ marginBottom:16, color: C.dim, fontSize:14 }}>
        Entscheide für jede Entdeckungsreihenfolge: Ist sie durch DFS auf dem Graphen aus Aufgabe 6 möglich?
        Wähle zuerst, dann aufdecken.
      </div>

      {QUIZ_ROWS.map((row, i) => {
        const chosen = answers[i];
        const rev = revealed[i];
        const isCorrect = chosen === row.answer;

        return (
          <div key={i} style={{ marginBottom:20, background: C.panel2, borderRadius:12,
            padding:16, border:`1px solid ${rev ? (isCorrect ? C.good : C.warn) : C.line}`,
            transition:"border-color .3s" }}>
            <div style={{ fontFamily:"monospace", fontSize:13, color: C.accent,
              marginBottom:10, background: C.bg, borderRadius:6, padding:"6px 10px" }}>
              Folge {i+1}: {row.seq}
            </div>

            <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
              {[true, false].map(val => (
                <button key={String(val)} onClick={() => choose(i, val)} style={{
                  padding:"8px 20px", borderRadius:8, fontWeight:700, cursor: rev ? "default" : "pointer",
                  fontSize:13, transition:"all .2s",
                  background: chosen===val ? (val ? `${C.good}33` : `${C.warn}33`) : C.panel,
                  border: `2px solid ${chosen===val ? (val ? C.good : C.warn) : C.line}`,
                  color: chosen===val ? (val ? C.good : C.warn) : C.dim,
                }}>
                  {val ? "✓ Ja, möglich" : "✗ Nein, unmöglich"}
                </button>
              ))}
              <button onClick={() => reveal(i)} style={{
                ...btn, marginLeft:"auto", opacity: chosen===undefined ? 0.4 : 1,
                cursor: chosen===undefined ? "default" : "pointer"
              }}>
                Aufdecken
              </button>
            </div>

            {rev && (
              <div style={{ borderRadius:8, padding:"12px 14px", fontSize:13,
                background: isCorrect ? `${C.good}18` : `${C.warn}18`,
                border: `1px solid ${isCorrect ? C.good : C.warn}`,
                animation:"fadeUp .4s ease" }}>
                <div style={{ fontWeight:700, marginBottom:6,
                  color: isCorrect ? C.good : C.warn }}>
                  {isCorrect ? "✅ Richtig!" : "❌ Leider falsch."}
                  <span style={{ marginLeft:8, fontSize:12, fontWeight:400 }}>
                    Antwort: {row.answer ? "Ja, möglich" : "Nein, unmöglich"}
                  </span>
                </div>
                <div style={{ color: C.text, lineHeight:1.6 }}>{row.reason}</div>
              </div>
            )}
          </div>
        );
      })}

      {total > 0 && (
        <div style={{ textAlign:"center", padding:"10px 0", color: C.dim, fontSize:13 }}>
          Ergebnis: <span style={{ color: C.gold, fontWeight:700 }}>{correct}/{total}</span> richtig
        </div>
      )}
    </Card>
  );
}

// ── Hauptkomponente ───────────────────────────────────────────────────────────
export default function DFSTrainer() {
  return (
    <div style={{ background: C.bg, minHeight:"100vh", color: C.text,
      fontFamily:"system-ui, -apple-system, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${C.panel} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.line}`, padding:"48px 24px 40px" }}>
        <div style={{ maxWidth:880, margin:"0 auto" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase",
            color: C.accent, marginBottom:10 }}>
            Theoretische Informatik II · Graphalgorithmen
          </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,44px)", fontWeight:800, margin:"0 0 16px",
            background: `linear-gradient(90deg, ${C.text} 60%, ${C.accent})`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Tiefensuche (DFS)
          </h1>
          <p style={{ color: C.dim, fontSize:16, maxWidth:620, lineHeight:1.7, margin:0 }}>
            Die Tiefensuche (englisch: <em>Depth-First Search</em>, kurz DFS) ist ein
            fundamentaler Graphalgorithmus, der einen Graphen systematisch durchläuft —
            indem er immer so tief wie möglich in einen Pfad taucht, bevor er zurückspringt.
            Hier lernst du Schritt für Schritt: Farb-Zustände, d/f-Zeitstempel und Kantenkategorien.
          </p>
        </div>
      </div>

      {/* Content */}
      <main style={{ maxWidth:880, margin:"0 auto", padding:"48px 24px" }}>

        {/* 0. Motivation */}
        <Section kicker="Das Problem" title="Warum braucht man die Tiefensuche?">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            Stell dir vor, du stehst in einem Labyrinth und willst herausfinden, ob es einen
            Ausgang gibt. Eine Strategie: Wähle immer den ersten unerkundeten Gang und folge ihm
            bis zum Ende — dann geh zurück und probiere den nächsten. Genau das macht DFS.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:12 }}>
            {[
              { icon:"🔍", label:"Erreichbarkeit", text:"Welche Knoten sind von A aus erreichbar?" },
              { icon:"♻️", label:"Kreiserkennung", text:"Hat der Graph einen Zyklus (Kreis)?" },
              { icon:"📋", label:"Topologische Sortierung", text:"In welcher Reihenfolge Tasks ausführen?" },
              { icon:"🧩", label:"Zusammenhangskomponenten", text:"Welche Knoten gehören zusammen?" },
            ].map(c => (
              <div key={c.label} style={{ background: C.panel2, borderRadius:10, padding:"14px 16px",
                border:`1px solid ${C.line}` }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
                <div style={{ fontWeight:700, color: C.text, marginBottom:4, fontSize:14 }}>{c.label}</div>
                <div style={{ color: C.dim, fontSize:13 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 1. Kernidee */}
        <Section kicker="Die Kernidee" title="Wie funktioniert DFS?">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            DFS verwaltet jeden Knoten mit einer <strong style={{color:C.text}}>Farbe</strong>{" "}
            (weiß = unbesucht, grau = in Bearbeitung, schwarz = fertig) und einem{" "}
            <strong style={{color:C.text}}>Zeitstempel-Paar d/f</strong>{" "}
            (d = discovery/Entdeckung, f = finish/Abschluss). Der Algorithmus arbeitet rekursiv:
          </p>
          <MethodRow color={C.accent}  name="DFS(G)"      formula="Initialisierung"    note="Alle Knoten weiß, π = nil, Zeit = 0" />
          <MethodRow color={C.accent2} name="DFSVisit(u)" formula="Zeit++; d[u]←Zeit"  note="Knoten u wird grau — Entdeckungszeitstempel" />
          <MethodRow color={C.gold}    name="Rekursion"   formula="∀v ∈ Adj[u] weiß"   note="Für jeden weißen Nachbarn: DFSVisit(v)" />
          <MethodRow color={C.good}    name="Abschluss"   formula="Zeit++; f[u]←Zeit"  note="Knoten u wird schwarz — alle Nachbarn fertig" />
          <InfoBox title="Das Klammern-Theorem">
            Für je zwei Knoten u, v gilt nach DFS genau eines von drei Fällen: Die Intervalle [d[u],f[u]] und
            [d[v],f[v]] sind <strong style={{color:C.text}}>disjunkt</strong> (keine Vorgänger-Nachfahren-Beziehung),
            oder eines ist vollständig im anderen <strong style={{color:C.text}}>enthalten</strong> (dann ist der äußere Knoten
            Vorfahre des inneren). Das sieht aus wie korrekt gesetzte Klammern — daher der Name.
          </InfoBox>
        </Section>

        {/* 2. Stepper */}
        <Section kicker="Interaktive Visualisierung" title="DFS Schritt für Schritt — Aufgabe 6">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            Der Graph entspricht exakt dem aus Aufgabe 6 (Knoten A–J, ungerichtet, Startknoten A).
            Nachbarn werden in <strong style={{color:C.text}}>alphabetischer Reihenfolge</strong> besucht.
            Klick „▶ Play" für automatischen Ablauf oder navigiere manuell.
          </p>
          <DFSStepper />
        </Section>

        {/* 3. Kantenkategorien */}
        <Section kicker="Kantenkategorien" title="Welche Kantentypen entstehen?">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            Während DFS läuft, bekommt jede Kante {"{u,v}"} eine Kategorie — abhängig von der
            Farbe des Zielknotens v zum Zeitpunkt, wenn DFS die Kante betrachtet:
          </p>
          <KantenExplainer />
        </Section>

        {/* 4. Laufzeit */}
        <Section kicker="Analyse" title="Laufzeit von DFS">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            Die Laufzeit von DFS ist proportional zur Größe des Graphen —
            gemessen in Knoten (V) und Kanten (E):
          </p>
          <MethodRow color={C.good} name="Laufzeit"
            formula="Θ(V + E)"
            note="Jeder Knoten wird exakt 1× grau gefärbt (DFSVisit). Jede Kante wird in DFSVisit genau 2× geprüft (je einmal von beiden Endpunkten) → Θ(E)." />
          <InfoBox title="Warum nicht O(V · E)?">
            DFSVisit wird nur für <strong style={{color:C.text}}>weiße</strong> Knoten aufgerufen — und ein Knoten
            wird sofort grau, sobald DFSVisit startet. Damit ist garantiert, dass jeder Knoten
            genau einmal den DFSVisit-Rumpf durchläuft. Die Adjazenzlisten aller Knoten zusammen haben
            insgesamt Länge 2|E| (ungerichtet) bzw. |E| (gerichtet) — daher Θ(V+E) gesamt.
          </InfoBox>
        </Section>

        {/* 5. Quiz */}
        <Section kicker="Klausur-Quiz · Aufgabe 6" title="Welche DFS-Folgen sind möglich?">
          <p style={{ color: C.dim, lineHeight:1.7, marginBottom:16 }}>
            Genau wie in der Klausur: Entscheide, ob die Entdeckungsreihenfolge durch
            eine DFS auf dem Aufgabe-6-Graphen (Startknoten A, Nachbarn alphabetisch) möglich ist.
            Falls nicht, musst du in der Klausur <strong style={{color:C.text}}>kurz erklären warum</strong>.
          </p>
          <QuizSection />
          <InfoBox title="Klausur-Strategie für solche Aufgaben">
            Simuliere DFS gedanklich Schritt für Schritt: An jedem Knoten u, prüfe die Nachbarn
            alphabetisch. Sobald du einen weißen Nachbar findest, <em>musst</em> du sofort dorthin
            gehen — du hast keine Wahl. Wenn eine Folge einen Knoten „zu früh" besucht (vor einem
            weißen Nachbarn des aktuellen Knotens), ist sie unmöglich. Die Begründung: <em>„DFS
            wählt alphabetisch den ersten weißen Nachbarn — X müsste vor Y kommen, da X &lt; Y."</em>
          </InfoBox>
        </Section>

        {/* 6. Zusammenfassung */}
        <Section kicker="Zusammenfassung" title="DFS auf einen Blick">
          <div style={{ background:`${C.accent}15`, border:`1px solid ${C.accent}55`,
            borderRadius:14, padding:"20px 24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))", gap:16 }}>
              {[
                { label:"Laufzeit", val:"Θ(V + E)" },
                { label:"Datenstruktur", val:"Rekursion / Stack" },
                { label:"Ergebnis", val:"DFS-Wald + d/f-Zeiten + Kantenkategorien" },
                { label:"Kantenkategorien (ungerichtet)", val:"Nur Baum- & Rückwärtskanten" },
                { label:"Entdeckungsreihenfolge", val:"Alphabetisch (laut Aufgabe)" },
                { label:"Klammern-Theorem", val:"[d[u],f[u]] ⊂ [d[v],f[v]] oder disjunkt" },
              ].map(e => (
                <div key={e.label}>
                  <div style={{ fontSize:11, color: C.dim, marginBottom:3, textTransform:"uppercase", letterSpacing:1 }}>{e.label}</div>
                  <div style={{ fontWeight:700, color: C.text, fontFamily:"monospace", fontSize:14 }}>{e.val}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* 7. Glossar */}
        <Section kicker="Glossar" title="Alle Begriffe erklärt">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px,1fr))", gap:"0 32px" }}>
            {[
              { term:"DFS", def:"Depth-First Search — Tiefensuche, Graphdurchlaufalgorithmus" },
              { term:"d[u]", def:"Discovery-Zeit (Entdeckungszeitstempel): Zeitpunkt, wann u grau wird" },
              { term:"f[u]", def:"Finish-Zeit (Abschluss-Zeitstempel): Zeitpunkt, wann u schwarz wird" },
              { term:"weiß", def:"Knoten noch nicht entdeckt" },
              { term:"grau", def:"Knoten entdeckt, aber seine DFSVisit noch nicht abgeschlossen" },
              { term:"schwarz", def:"DFSVisit abgeschlossen — alle Nachbarn vollständig bearbeitet" },
              { term:"Baumkante", def:"Kante zum weißen Nachbarn — bildet den DFS-Baum" },
              { term:"Rückwärtskante", def:"Kante zu einem grauen Knoten (Vorfahre im DFS-Baum)" },
              { term:"Vorwärtskante", def:"Nur gerichtet: Kante zu schwarzem Nachfahren (d[u]<d[v])" },
              { term:"Kreuzkante", def:"Nur gerichtet: Kante zu schwarzem Nicht-Verwandten (d[u]>d[v])" },
              { term:"DFS-Wald", def:"Die Menge aller Baumkanten bildet einen Wald (Menge von Bäumen)" },
              { term:"π[v]", def:"Vorgänger-Zeiger: π[v]=u bedeutet, u hat v entdeckt (Baumkante)" },
              { term:"Adj[u]", def:"Adjazenzliste von u: Liste aller direkten Nachbarknoten" },
              { term:"Klammern-Theorem", def:"[d[u],f[u]] und [d[v],f[v]] sind stets ineinander geschachtelt oder disjunkt" },
              { term:"Θ(V+E)", def:"Theta-Notation: exakte asymptotische Schranke, nicht nur obere Schranke" },
            ].map(g => <GlossEntry key={g.term} {...g} />)}
          </div>
        </Section>

      </main>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.line}`, padding:"20px 24px",
        textAlign:"center", color: C.dim, fontSize:12 }}>
        Prof. Dr. Veronika Lesch · DHBW Mosbach · Theoretische Informatik II
        <span style={{ margin:"0 12px", color: C.line }}>|</span>
        VL 15: Tiefensuche · VL 13: Graphen & BFS
      </div>
    </div>
  );
}
