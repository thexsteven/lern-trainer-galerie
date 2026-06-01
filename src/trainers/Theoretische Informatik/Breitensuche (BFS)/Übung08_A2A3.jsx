import React, { useState, useEffect, useRef, useMemo } from "react";

/* =====================================================================
   Lern-Trainer · Übung 08 · AUFGABE 2 verstehen — warum die Behauptungen kippen
   Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach
   Fokus: Graph (Erreichbarkeit) ↔ DFS-Baum (Hierarchie) nebeneinander.
   Self-contained React-Komponente · default export.
   ===================================================================== */

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#2dd4bf",  // Türkis – DFS-Baum / Baumkanten / „im Baum darunter”
  accent2: "#f59e0b", // Bernstein-Gold – Graphstruktur / Kicker / Sekundär-Akzent
  good: "#86efac",    // grün – Auflösung / Behauptung widerlegt
  warn: "#fca5a5",    // rot – Kipp-Punkt / Rückwärtskante / Problem
  gold: "#fcd34d",    // gelb – Highlight: aktive Kante, hervorgehobener Pfad
};

/* ====================== Wiederverwendbare Bausteine ==================== */
function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Section({ kicker, title, children }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} style={{
      marginBottom: 64,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: "opacity .6s ease, transform .6s ease",
    }}>
      {kicker && <div style={{ textTransform: "uppercase", letterSpacing: ".14em", fontSize: 12, fontWeight: 700, color: C.accent2, marginBottom: 10 }}>{kicker}</div>}
      <h2 style={{ fontSize: 30, lineHeight: 1.15, margin: "0 0 18px", color: C.text, fontWeight: 800, letterSpacing: "-.01em" }}>{title}</h2>
      <div style={{ color: C.text, fontSize: 16.5, lineHeight: 1.72 }}>{children}</div>
    </section>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>{children}</div>;
}

function Tag({ color = C.accent, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: C.dim, marginRight: 16 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children, tone = "accent2" }) {
  const col = tone === "warn" ? C.warn : C.accent2;
  return (
    <div style={{
      backgroundImage: `linear-gradient(180deg, ${col}14, ${col}06)`,
      border: `1px solid ${col}55`, borderLeft: `4px solid ${col}`,
      borderRadius: 12, padding: "16px 18px", margin: "18px 0",
    }}>
      <div style={{ fontWeight: 700, color: col, marginBottom: 6, fontSize: 15 }}>
        {tone === "warn" ? "⚠️ " : "💡 "}{title}
      </div>
      <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.68 }}>{children}</div>
    </div>
  );
}

function Pill({ children, color = C.dim }) {
  return <code style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 13, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 7, padding: "2px 8px", color }}>{children}</code>;
}

const btn = { background: C.accent, color: "#06231f", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 14, cursor: "pointer" };

function usePlayer(len, speed = 2100) {
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
    goto: (n) => { setPlaying(false); setI(n); },
  };
}

/* ====================== Geometrie & Knoten-Stil ======================= */
function edgeGeom(p1, p2, r, curve) {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  if (!curve) {
    const s = [p1[0] + ux * r, p1[1] + uy * r];
    const e = [p2[0] - ux * (r + 7), p2[1] - uy * (r + 7)];
    return { d: `M${s[0]},${s[1]} L${e[0]},${e[1]}`, mid: [(s[0] + e[0]) / 2 + px * 11, (s[1] + e[1]) / 2 + py * 11] };
  }
  const mx = (p1[0] + p2[0]) / 2 + px * curve, my = (p1[1] + p2[1]) / 2 + py * curve;
  const n1 = Math.hypot(mx - p1[0], my - p1[1]) || 1, n2 = Math.hypot(mx - p2[0], my - p2[1]) || 1;
  const s = [p1[0] + (mx - p1[0]) / n1 * r, p1[1] + (my - p1[1]) / n1 * r];
  const e = [p2[0] + (mx - p2[0]) / n2 * (r + 7), p2[1] + (my - p2[1]) / n2 * (r + 7)];
  return { d: `M${s[0]},${s[1]} Q${mx},${my} ${e[0]},${e[1]}`, mid: [mx + px * 5, my + py * 5] };
}

const EDGE_COLOR = { tree: C.accent, back: C.warn, forward: C.accent2, cross: C.dim, none: C.line };
const EDGE_LABEL = { tree: "Baum", back: "R", forward: "V", cross: "K" };

function nodeStyle(color) {
  if (!color || color === "white") return { fill: C.panel2, stroke: C.line, txt: C.dim, dash: "4 3" };
  if (color === "gray") return { fill: "rgba(252,211,77,0.16)", stroke: C.gold, txt: C.text, dash: null };
  return { fill: "rgba(45,212,191,0.18)", stroke: C.accent, txt: C.text, dash: null }; // schwarz = fertig
}

function dfLabel(df) {
  if (!df) return "–/–";
  return `${df[0]}/${df[1] ?? "–"}`;
}

/* =========================== Reducer ================================== */
function buildStates(events) {
  const states = [];
  let colors = {}, df = {}, tree = [], ec = {};
  for (const e of events) {
    let hi = null, path = null, compare = false, mark = null, focus = null;
    if (e.ev === "root") { colors = { ...colors, [e.node]: "gray" }; df = { ...df, [e.node]: [e.d, null] }; }
    else if (e.ev === "tree") { ec = { ...ec, [`${e.from}->${e.to}`]: "tree" }; tree = [...tree, [e.from, e.to]]; colors = { ...colors, [e.to]: "gray" }; df = { ...df, [e.to]: [e.d, null] }; hi = [e.from, e.to]; }
    else if (e.ev === "back") { ec = { ...ec, [`${e.from}->${e.to}`]: "back" }; hi = [e.from, e.to]; }
    else if (e.ev === "cross") { ec = { ...ec, [`${e.from}->${e.to}`]: "cross" }; hi = [e.from, e.to]; }
    else if (e.ev === "finish") { colors = { ...colors, [e.node]: "black" }; df = { ...df, [e.node]: [df[e.node][0], e.f] }; }
    else if (e.ev === "compare") { compare = true; path = e.path; mark = e.mark || null; }
    states.push({
      colors: { ...colors }, df: JSON.parse(JSON.stringify(df)), tree: tree.map((t) => [...t]), ec: { ...ec },
      hi, path, compare, mark, title: e.title, text: e.text, kipp: !!e.kipp,
    });
  }
  return states;
}

/* =========================== GraphCanvas ============================== */
function GraphCanvas({ g, st }) {
  const r = 23;
  const reverseExists = (a, b) => g.edges.some(([x, y]) => x === b && y === a);
  const inPath = (a, b) => st.path && st.path.some(([x, y]) => x === a && y === b);

  return (
    <svg viewBox={g.gview} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        {Object.entries(EDGE_COLOR).map(([k, col]) => (
          <marker key={k} id={`a-${g.id}-${k}`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L7,3 L0,6 Z" fill={col} />
          </marker>
        ))}
        <marker id={`a-${g.id}-gold`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L7,3 L0,6 Z" fill={C.gold} />
        </marker>
      </defs>

      {g.edges.map(([a, b], idx) => {
        const cls = st.ec[`${a}->${b}`] || "none";
        const isHi = st.hi && st.hi[0] === a && st.hi[1] === b;
        const isPath = inPath(a, b);
        const curve = reverseExists(a, b) ? (a < b ? 24 : -24) : 0;
        const gm = edgeGeom(g.gpos[a], g.gpos[b], r, curve);
        const goldNow = isHi || isPath;
        const col = goldNow ? C.gold : EDGE_COLOR[cls];
        const dashed = (cls === "back" || cls === "forward" || cls === "cross") && !goldNow;
        return (
          <g key={idx}>
            <path d={gm.d} fill="none" stroke={col}
              strokeWidth={goldNow ? 4 : cls === "tree" ? 2.6 : 1.7}
              strokeDasharray={dashed ? "6 5" : null}
              markerEnd={`url(#a-${g.id}-${goldNow ? "gold" : cls})`}
              style={{ transition: "stroke .35s, stroke-width .35s" }} />
            {cls !== "none" && EDGE_LABEL[cls] && !isPath && (
              <text x={gm.mid[0]} y={gm.mid[1]} fill={goldNow ? C.gold : col} fontSize="11" fontWeight="700" textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace" }}>{EDGE_LABEL[cls]}</text>
            )}
          </g>
        );
      })}

      {g.nodes.map((id) => {
        const c = st.colors[id];
        const s = nodeStyle(c);
        const [x, y] = g.gpos[id];
        const isMark = st.mark && st.mark.includes(id);
        return (
          <g key={id} style={{ transition: "all .3s" }}>
            {isMark && <circle cx={x} cy={y} r={r + 6} fill="none" stroke={C.gold} strokeWidth="2.5" style={{ animation: "pulse 1.3s ease-in-out infinite" }} />}
            <circle cx={x} cy={y} r={r} fill={s.fill} stroke={s.stroke} strokeWidth="2.4" strokeDasharray={s.dash} style={{ transition: "fill .35s, stroke .35s" }} />
            <text x={x} y={y - 1} fill={s.txt} fontSize="17" fontWeight="800" textAnchor="middle" dominantBaseline="middle">{id}</text>
            <text x={x} y={y + 13} fill={s.txt} fontSize="10" textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace", opacity: st.df[id] ? 1 : 0.35 }}>{dfLabel(st.df[id])}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* =========================== TreeCanvas =============================== */
function TreeCanvas({ g, st }) {
  const r = 21;
  const discovered = g.nodes.filter((id) => st.df[id]);
  return (
    <svg viewBox={g.tview} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* Baumkanten (Eltern → Kind), als Linien nach unten */}
      {st.tree.map(([p, c], i) => {
        const [x1, y1] = g.tpos[p], [x2, y2] = g.tpos[c];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.accent} strokeWidth="2.4" style={{ transition: "all .3s" }} />;
      })}
      {discovered.length === 0 && (
        <text x="50%" y="50%" fill={C.dim} fontSize="13" textAnchor="middle">– Baum baut sich auf –</text>
      )}
      {discovered.map((id) => {
        const s = nodeStyle(st.colors[id]);
        const [x, y] = g.tpos[id];
        const isMark = st.mark && st.mark.includes(id);
        return (
          <g key={id} style={{ animation: "pop .35s ease" }}>
            {isMark && <circle cx={x} cy={y} r={r + 6} fill="none" stroke={C.gold} strokeWidth="2.5" style={{ animation: "pulse 1.3s ease-in-out infinite" }} />}
            <circle cx={x} cy={y} r={r} fill={s.fill} stroke={s.stroke} strokeWidth="2.4" strokeDasharray={s.dash} style={{ transition: "fill .35s, stroke .35s" }} />
            <text x={x} y={y - 1} fill={s.txt} fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">{id}</text>
            <text x={x} y={y + 12} fill={s.txt} fontSize="9.5" textAnchor="middle" style={{ fontFamily: "ui-monospace, monospace" }}>{dfLabel(st.df[id])}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ===================== Split-Stepper (Graph ↔ Baum) =================== */
function SplitStepper({ g }) {
  const states = useMemo(() => buildStates(g.events), [g]);
  const p = usePlayer(states.length);
  const st = states[p.i];

  const panel = (heading, sub, children) => (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 10px 6px", flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".09em", color: C.accent2, fontWeight: 700, padding: "2px 4px" }}>{heading}</div>
      <div style={{ fontSize: 12, color: C.dim, padding: "0 4px 6px" }}>{sub}</div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
        {panel("Der Graph", "wer ist mit wem verbunden", <GraphCanvas g={g} st={st} />)}
        {panel("Der DFS-Baum", "wer hängt unter wem", <TreeCanvas g={g} st={st} />)}
      </div>

      {/* Erklärbox */}
      <div style={{
        marginTop: 14, borderRadius: 12, padding: "15px 17px",
        background: st.kipp ? "rgba(252,165,165,0.10)" : st.compare ? "rgba(134,239,172,0.10)" : C.bg,
        border: `1px solid ${st.kipp ? C.warn : st.compare ? C.good : C.line}`,
        borderLeft: `4px solid ${st.kipp ? C.warn : st.compare ? C.good : C.accent2}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
          {st.kipp && <span style={{ background: C.warn, color: "#3a0d0d", borderRadius: 6, padding: "1px 8px", fontWeight: 800, fontSize: 11.5 }}>⚠ KIPP-PUNKT</span>}
          {st.compare && <span style={{ background: C.good, color: "#093a18", borderRadius: 6, padding: "1px 8px", fontWeight: 800, fontSize: 11.5 }}>VERGLEICH</span>}
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15.5 }}>{st.title}</span>
        </div>
        <div style={{ color: C.text, fontSize: 15, lineHeight: 1.68 }}>{st.text}</div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button style={btn} onClick={p.toggle}>{p.playing ? "❚❚ Pause" : (p.i >= states.length - 1 ? "↻ Erneut" : "▶ Abspielen")}</button>
        <button style={btnGhost} onClick={p.prev} disabled={p.i === 0}>‹ Zurück</button>
        <button style={btnGhost} onClick={p.next} disabled={p.i >= states.length - 1}>Vor ›</button>
        <button style={btnGhost} onClick={p.reset}>Reset</button>
        <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>Schritt {p.i + 1} / {states.length}</span>
      </div>

      {/* Fortschritts-Punkte (klickbar) */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {states.map((s, k) => (
          <button key={k} onClick={() => p.goto(k)} title={s.title}
            style={{
              width: 22, height: 22, borderRadius: 6, cursor: "pointer", fontSize: 10.5, fontWeight: 700,
              border: `1px solid ${k === p.i ? C.accent : C.line}`,
              background: k === p.i ? C.accent : s.kipp ? "rgba(252,165,165,0.18)" : s.compare ? "rgba(134,239,172,0.18)" : C.panel2,
              color: k === p.i ? "#06231f" : s.kipp ? C.warn : s.compare ? C.good : C.dim,
            }}>{k + 1}</button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", rowGap: 6 }}>
        <Tag color={C.line}>weiß = unentdeckt</Tag>
        <Tag color={C.gold}>grau = in Arbeit</Tag>
        <Tag color={C.accent}>schwarz = fertig / Baumkante</Tag>
        <Tag color={C.warn}>R = Rückwärtskante</Tag>
        <Tag color={C.dim}>K = Kreuzkante</Tag>
        <Tag color={C.gold}>Pfad u→v / aktive Kante</Tag>
      </div>
    </div>
  );
}

/* ============================ Aufgabe-Block =========================== */
function AufgabeBlock({ tag, claimWortlich, claimEinfach, denkfalle, g, kipp, fazit }) {
  return (
    <Card style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ flexShrink: 0, background: `${C.warn}22`, border: `1px solid ${C.warn}`, color: C.warn, borderRadius: 9, padding: "5px 12px", fontWeight: 800, fontSize: 15 }}>{tag}</span>
        <div>
          <div style={{ fontStyle: "italic", color: C.dim, fontSize: 14.5, lineHeight: 1.6, marginBottom: 8 }}>
            „{claimWortlich}”
          </div>
          <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.6 }}>
            <b style={{ color: C.accent2 }}>In Alltagssprache:</b> {claimEinfach}
          </div>
        </div>
      </div>

      <InfoBox title="Die Denkfalle" tone="accent2">{denkfalle}</InfoBox>

      <div style={{ margin: "18px 0 6px", fontWeight: 700, color: C.text, fontSize: 15 }}>
        ▶ Spiel das Gegenbeispiel ab und beobachte beide Seiten gleichzeitig:
      </div>
      <SplitStepper g={g} />

      <InfoBox title="Genau hier kippt die Behauptung" tone="warn">{kipp}</InfoBox>

      <div style={{ background: "rgba(134,239,172,0.08)", border: `1px solid ${C.good}55`, borderLeft: `4px solid ${C.good}`, borderRadius: 12, padding: "14px 16px", marginTop: 4 }}>
        <div style={{ fontWeight: 700, color: C.good, marginBottom: 5 }}>✓ Fazit</div>
        <div style={{ color: C.text, fontSize: 15, lineHeight: 1.68 }}>{fazit}</div>
      </div>
    </Card>
  );
}

/* ============================ Graph-Daten ============================= */
const G2A = {
  id: "a",
  nodes: ["w", "u", "v"],
  edges: [["w", "u"], ["u", "w"], ["w", "v"]],
  gpos: { w: [140, 42], u: [58, 160], v: [222, 160] }, gview: "0 0 280 205",
  tpos: { w: [140, 42], u: [72, 150], v: [208, 150] }, tview: "0 0 280 190",
  events: [
    { ev: "root", node: "w", d: 1, title: "Start: DFS beginnt bei w", text: "Die Tiefensuche startet bei w. w wird grau – „entdeckt, aber noch nicht fertig”. w ist die Wurzel des Baums (w.d = 1)." },
    { ev: "tree", from: "w", to: "u", d: 2, title: "w → u: erste Baumkante", text: "w schaut seinen ersten Nachbarn an: u. u ist noch weiß → die DFS steigt hinab, u wird Kind von w im Baum (u.d = 2)." },
    { ev: "back", from: "u", to: "w", kipp: true, title: "u → w: Rückwärtskante", text: "Jetzt schaut u seinen Nachbarn w an. Aber w ist GRAU – ein noch offener Vorfahr. Über diese Kante steigt die DFS NICHT ab (sonst Endlosschleife). Das ist eine Rückwärtskante: Sie lebt im Graphen, gehört aber NICHT zum Baum. u bekommt kein Kind." },
    { ev: "finish", node: "u", f: 3, title: "u ist fertig", text: "u hat keine weiteren neuen Nachbarn → u wird schwarz. u.d = 2, u.f = 3. Im Baum bleibt u ein Blatt ohne Kinder." },
    { ev: "tree", from: "w", to: "v", d: 4, title: "w → v: v wird Kind von w – nicht von u!", text: "Zurück bei w. Nächster Nachbar v ist weiß → Baumkante. Entscheidend: v wird Kind von w. Damit sind u und v GESCHWISTER im Baum (v.d = 4) – v hängt NICHT unter u." },
    { ev: "finish", node: "v", f: 5, title: "v ist fertig", text: "v hat keine Nachbarn → schwarz (v.d = 4, v.f = 5)." },
    { ev: "finish", node: "w", f: 6, title: "w ist fertig", text: "Zuletzt wird die Wurzel w fertig (w.f = 6). Der Baum ist komplett: w mit den zwei Kindern u und v." },
    { ev: "compare", path: [["u", "w"], ["w", "v"]], mark: ["u", "v"], title: "Vergleich: Graph vs. Baum", text: "Im GRAPH gibt es den Pfad u → w → v (gold) – v ist von u erreichbar ✓, und u.d = 2 < v.d = 4 ✓. Beide Voraussetzungen der Behauptung sind erfüllt. Im BAUM aber sind u und v Geschwister (beide gold umrandet) – v ist KEIN Nachkomme von u. Behauptung widerlegt." },
  ],
};

const G2B = {
  id: "b",
  nodes: ["r", "u", "x", "v"],
  edges: [["r", "u"], ["u", "r"], ["r", "x"], ["x", "v"]],
  gpos: { r: [140, 38], u: [52, 150], x: [232, 118], v: [256, 208] }, gview: "0 0 300 240",
  tpos: { r: [135, 38], u: [62, 135], x: [212, 118], v: [212, 208] }, tview: "0 0 290 245",
  events: [
    { ev: "root", node: "r", d: 1, title: "Start bei r", text: "Die DFS startet bei r. r wird grau (r.d = 1) und ist die Wurzel." },
    { ev: "tree", from: "r", to: "u", d: 2, title: "r → u: Baumkante", text: "r schaut u an: u ist weiß → Baumkante. u wird Kind von r (u.d = 2). u ist jetzt „in Arbeit”." },
    { ev: "back", from: "u", to: "r", title: "u → r: der Ausgang führt zurück", text: "u schaut seinen EINZIGEN Nachbarn an: r. r ist grau (Vorfahr) → Rückwärtskante. Der einzige Weg von u führt also wieder nach oben, nicht zu einem neuen Knoten. u kann selbst nichts Neues entdecken." },
    { ev: "finish", node: "u", f: 3, kipp: true, title: "u ist fertig – und v existiert noch gar nicht", text: "u hat keine weiteren Nachbarn → u wird fertig: u.f = 3. Merke dir diese Zahl! u ist jetzt KOMPLETT abgeschlossen, obwohl es einen Pfad zu v gibt – und v ist noch nicht einmal entdeckt." },
    { ev: "tree", from: "r", to: "x", d: 4, title: "r → x: der zweite Ast beginnt", text: "Zurück bei r. r hat einen zweiten Nachbarn: x (weiß) → Baumkante (x.d = 4). Erst jetzt startet der zweite Ast des Baums." },
    { ev: "tree", from: "x", to: "v", d: 5, title: "x → v: v wird ERST JETZT entdeckt", text: "x → v: v ist weiß → Baumkante. v wird jetzt entdeckt (v.d = 5) – lange nachdem u fertig war." },
    { ev: "finish", node: "v", f: 6, title: "v ist fertig", text: "v wird fertig (v.f = 6)." },
    { ev: "finish", node: "x", f: 7, title: "x ist fertig", text: "x wird fertig (x.f = 7)." },
    { ev: "finish", node: "r", f: 8, title: "r ist fertig", text: "Die Wurzel r wird fertig (r.f = 8). Baum: r → u, und r → x → v." },
    { ev: "compare", path: [["u", "r"], ["r", "x"], ["x", "v"]], mark: ["u", "v"], title: "Vergleich der Zeiten", text: "Im GRAPH existiert der Pfad u → r → x → v (gold) ✓. Aber: u.f = 3 und v.d = 5, also v.d (5) > u.f (3). u war längst fertig, als v entdeckt wurde – die Behauptung „v.d < u.f” ist klar verletzt." },
  ],
};

const G2C = {
  id: "c",
  nodes: ["x", "u", "w"],
  edges: [["u", "x"], ["w", "u"]],
  gpos: { x: [58, 95], u: [152, 95], w: [246, 95] }, gview: "0 0 305 175",
  tpos: { x: [60, 92], u: [152, 92], w: [244, 92] }, tview: "0 0 305 160",
  events: [
    { ev: "root", node: "x", d: 1, title: "Reihenfolge entscheidet: zuerst x", text: "Die Hauptschleife der DFS geht die Knoten in fester Reihenfolge durch – hier x, dann u, dann w. Der erste weiße Knoten ist x (NICHT u, obwohl u→x existiert!). x startet als eigene Wurzel (x.d = 1)." },
    { ev: "finish", node: "x", f: 2, title: "x ist sofort fertig", text: "x hat keine ausgehenden Kanten → sofort fertig (x.f = 2). x ist ein Einzelknoten-Baum." },
    { ev: "root", node: "u", d: 3, title: "u startet als neue Wurzel", text: "Nächster weißer Knoten: u. u wurde von niemandem entdeckt → u startet als NEUE eigene Wurzel (u.d = 3)." },
    { ev: "cross", from: "u", to: "x", kipp: true, title: "u → x: schon schwarz!", text: "u schaut seinen Nachbarn x an. Aber x ist bereits SCHWARZ (in Schritt 2 fertig geworden). Über u→x steigt die DFS nicht ab – x ist ja erledigt. Das ist eine Kreuzkante. u bekommt KEIN Kind, obwohl die Kante u→x existiert." },
    { ev: "finish", node: "u", f: 4, kipp: true, title: "u ist ein Einzelknoten-Baum", text: "u hat keine weiteren Nachbarn → sofort fertig. u.d = 3, u.f = 4 (direkt hintereinander) – u ist ein Baum aus einem einzigen Knoten, obwohl es die Ausgangskante u→x gibt." },
    { ev: "root", node: "w", d: 5, title: "Zuletzt w", text: "Letzter weißer Knoten: w startet als eigene Wurzel (w.d = 5)." },
    { ev: "cross", from: "w", to: "u", title: "w → u: auch schon schwarz", text: "w schaut u an: u ist schon schwarz → wieder eine Kreuzkante. Auch über w→u entsteht keine Baumkante – u bleibt auch von oben unverbunden." },
    { ev: "finish", node: "w", f: 6, title: "w ist fertig", text: "w wird fertig (w.f = 6). Der DFS-Wald besteht aus drei getrennten Einzelknoten-Bäumen." },
    { ev: "compare", path: [["w", "u"], ["u", "x"]], mark: ["u"], title: "u: Ein- und Ausgang, trotzdem allein", text: "Schau dir u an (gold umrandet): Es hat die Eingangskante w→u ✓ und die Ausgangskante u→x ✓ (beide Kanten gold). Trotzdem ist u im DFS-Wald ein völlig isolierter Einzelknoten – eigener Baum, kein Kind, kein Elternteil. Möglich, weil beim Besuch beide Nachbarn die „falsche” Farbe (schwarz) hatten." },
  ],
};

/* ============================ Hauptkomponente ========================= */
export default function Aufgabe2DFSVerstehen() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @keyframes pop { 0% { transform: scale(.5); opacity: 0 } 70% { transform: scale(1.12) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes pulse { 0%,100% { opacity: .35 } 50% { opacity: .95 } }
        button:disabled { opacity: .4; cursor: not-allowed }
        ::selection { background: ${C.accent}55 }
      `}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: `radial-gradient(900px 320px at 18% -10%, ${C.accent}1a, transparent), radial-gradient(700px 300px at 92% -20%, ${C.accent2}14, transparent)` }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "54px 24px 42px" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: ".16em", fontSize: 12.5, fontWeight: 700, color: C.accent }}>Übung 08 · Aufgabe 2 · Tiefensuche</div>
          <h1 style={{ fontSize: 42, lineHeight: 1.08, margin: "14px 0 0", fontWeight: 800, letterSpacing: "-.02em" }}>Warum die drei Behauptungen kippen</h1>
          <p style={{ color: C.dim, fontSize: 18, lineHeight: 1.65, marginTop: 18, maxWidth: 680 }}>
            Alle drei Teilaufgaben wirken plausibel – und sind trotzdem falsch. Der Grund ist immer derselbe
            Denkfehler. Wir legen ihn frei, indem wir <b style={{ color: C.text }}>Graph</b> und <b style={{ color: C.text }}>DFS-Baum</b> Seite
            an Seite stellen und Schritt für Schritt den Moment zeigen, an dem die Intuition versagt.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 24px" }}>

        {/* Der rote Faden */}
        <Section kicker="Der gemeinsame Denkfehler" title="0 · Graph ≠ Baum – das musst du verinnerlichen">
          <p>
            Eine <b>Tiefensuche</b> (DFS) baut aus einem Graphen einen <b>Baum</b> (bzw. mehrere Bäume, einen
            <i> Wald</i>). Dabei gilt eine simple, aber leicht übersehene Regel:
          </p>
          <InfoBox title="Nur Baumkanten formen den Baum">
            Wenn die DFS einen Knoten u betrachtet und über eine Kante u→v zu einem <b>noch weißen</b> (unentdeckten)
            Knoten v gelangt, wird v ein <b>Kind</b> von u – das ist eine <b>Baumkante</b>. Ist v dagegen schon
            grau oder schwarz, passiert im Baum <b>nichts</b>: Die Kante wird zwar klassifiziert (Rückwärts-,
            Vorwärts- oder Kreuzkante), aber sie erzeugt <b>keine</b> Eltern-Kind-Beziehung.
          </InfoBox>
          <p>Welche Kantenarten gibt es – und tauchen sie im Baum auf?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, margin: "16px 0" }}>
            {[
              ["Baumkante", C.accent, "✓ ja", "v war weiß → wird Kind. Bildet die Hierarchie."],
              ["Rückwärtskante (R)", C.warn, "✗ nein", "zeigt auf einen grauen Vorfahren."],
              ["Vorwärtskante (V)", C.accent2, "✗ nein", "zeigt auf einen schwarzen Nachfahren."],
              ["Kreuzkante (K)", C.dim, "✗ nein", "verbindet Knoten ohne Verwandtschaft."],
            ].map(([n, col, im, d]) => (
              <div key={n} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderTop: `3px solid ${col}`, borderRadius: 12, padding: "13px 14px" }}>
                <div style={{ fontWeight: 700, color: C.text, fontSize: 14.5 }}>{n}</div>
                <div style={{ color: im.startsWith("✓") ? C.good : C.warn, fontWeight: 700, fontSize: 13.5, margin: "4px 0 6px" }}>im Baum? {im}</div>
                <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 6 }}>
            Daraus folgt der zentrale Merksatz für ganz Aufgabe 2:
          </p>
          <div style={{ background: `linear-gradient(180deg, ${C.accent}14, ${C.accent2}0a)`, border: `1px solid ${C.accent}66`, borderRadius: 14, padding: "16px 20px", margin: "12px 0", fontSize: 16.5, lineHeight: 1.6 }}>
            <b style={{ color: C.accent }}>„Von u aus erreichbar im Graphen”</b> ist <b style={{ color: C.warn }}>nicht</b> dasselbe wie
            <b style={{ color: C.accent }}> „hängt im Baum unter u” (Nachkomme)</b>. Die drei Behauptungen verwechseln
            genau diese beiden Dinge.
          </div>
          <p style={{ color: C.dim, fontSize: 14.5 }}>
            <b style={{ color: C.text }}>Kurz die Begriffe:</b> <Pill color={C.accent}>u.d</Pill> = Zeitpunkt, zu dem u
            entdeckt wird (weiß→grau). <Pill color={C.accent}>u.f</Pill> = Zeitpunkt, zu dem u fertig ist
            (grau→schwarz). <b style={{ color: C.text }}>v ist Nachkomme von u</b>, wenn man im <i>Baum</i> von u über
            Kind-Kanten zu v gelangt.
          </p>
        </Section>

        {/* Aufgabe 2a */}
        <Section kicker="Aufgabe 2 a" title="1 · „Pfad u→v und u.d < v.d ⟹ v ist Nachkomme von u”">
          <AufgabeBlock
            tag="a)"
            claimWortlich="Sei G ein gerichteter Graph mit einem Pfad von u nach v, und sei u.d < v.d. Dann ist v im Tiefensuchbaum ein Nachkomme von u."
            claimEinfach={<>Wenn man von u aus zu v laufen kann <b>und</b> u zuerst entdeckt wird, dann muss v im Baum unter u hängen.</>}
            denkfalle={<>Klingt zwingend: „Ich kann von u nach v laufen, also steigt die DFS doch von u aus zu v hinab und sortiert v unter u ein.” Der Haken: Die DFS folgt nur <b>weißen</b> Wegen. Führt der Weg über einen bereits entdeckten (grauen/schwarzen) Knoten, steigt sie dort <b>nicht</b> ab – und v landet woanders.</>}
            g={G2A}
            kipp={<>Die Behauptung verwechselt zwei Wege-Begriffe. Im <b>Graphen</b> ist v von u erreichbar (über die Rückwärtskante u→w und dann w→v). Aber der DFS-Baum bildet nur <b>weiße</b> Wege ab. Als u entdeckt wurde, war w bereits grau – der einzige Weg zu v war „versperrt”. Darum wird v ein <b>Geschwister</b> von u, kein Nachkomme.</>}
            fazit={<><Pill>u.d &lt; v.d</Pill> und „v von u erreichbar” reichen <b>nicht</b>. Es bräuchte einen Pfad aus <b>lauter weißen Knoten</b> zum Zeitpunkt u.d (das ist der „Satz vom weißen Pfad”). Den gibt es hier nicht.</>}
          />
        </Section>

        {/* Aufgabe 2b */}
        <Section kicker="Aufgabe 2 b" title="2 · „Pfad u→v ⟹ v.d < u.f”">
          <AufgabeBlock
            tag="b)"
            claimWortlich="Sei G ein gerichteter Graph mit einem Pfad von u nach v. Dann gilt für jede Tiefensuche: v.d < u.f."
            claimEinfach={<>Wenn man von u nach v laufen kann, dann wird v entdeckt, <b>bevor</b> u fertig wird (die Entdeckung von v liegt zeitlich vor dem Abschluss von u).</>}
            denkfalle={<>Man denkt: „Solange u in Arbeit (grau) ist, arbeitet die DFS alles ab, was von u erreichbar ist – also auch v, ehe u fertig wird.” Aber: Führt der einzige Weg von u zu v über eine <b>Rückwärtskante</b> zu einem Vorfahren, dann wird dieser zweite Ast erst <b>nach</b> dem Abschluss von u erkundet.</>}
            g={G2B}
            kipp={<>u kann fertig werden, <b>lange bevor</b> v entdeckt wird – nämlich dann, wenn der Weg von u zu v nicht „nach vorne” in unentdecktes Gebiet führt, sondern über eine Rückwärtskante zurück zum Vorfahren r. r erkundet seinen zweiten Ast (zu x und v) erst, <b>nachdem</b> u abgeschlossen ist.</>}
            fazit={<>Ein Pfad u→v garantiert <b>nicht</b> <Pill>v.d &lt; u.f</Pill>. Hier gilt sogar das Gegenteil: <Pill>u.f = 3</Pill> &lt; <Pill>v.d = 5</Pill> – u ist komplett fertig, ehe v überhaupt auftaucht.</>}
          />
        </Section>

        {/* Aufgabe 2c */}
        <Section kicker="Aufgabe 2 c" title="3 · Ein Einzelknoten-Baum trotz Ein- und Ausgangskanten">
          <AufgabeBlock
            tag="c)"
            claimWortlich="Finde eine Tiefensuche, in der ein Baum aus dem einzelnen Knoten u gebildet wird, obwohl u sowohl eingehende als auch ausgehende Kanten hat."
            claimEinfach={<>Gesucht ist ein Beispiel, das die naive Annahme widerlegt: „Ein Knoten mit Ein- und Ausgangskanten kann kein isolierter Einzelknoten im Wald sein.”</>}
            denkfalle={<>Man denkt: „u hat die Ausgangskante u→x, also muss x im Baum unter u landen; und w→u, also muss u unter w landen. Also kann u nicht allein stehen.” Aber: Ob eine Kante zur <b>Baumkante</b> wird, hängt allein davon ab, ob der Zielknoten beim Betrachten noch <b>weiß</b> ist – und das steuert die <b>Reihenfolge</b> der Hauptschleife.</>}
            g={G2C}
            kipp={<>Ob u→x eine Baumkante wird, entscheidet allein die <b>Farbe von x</b> in dem Moment, in dem u es betrachtet. War x da schon schwarz, ist u→x nur eine Kreuzkante – im Baum unsichtbar. Dasselbe gilt für w→u. Beide Nachbarn hatten zum Besuchszeitpunkt die „falsche” Farbe.</>}
            fazit={<>Ein Knoten kann Ein- und Ausgangskanten haben und <b>trotzdem</b> ein isolierter Einzelknoten im DFS-Wald sein. Entscheidend ist die <b>Besuchsreihenfolge</b>, nicht die bloße Existenz der Kanten.</>}
          />
        </Section>

        {/* Zusammenfassung */}
        <Section kicker="Auf einen Blick" title="4 · Drei Merksätze, ein Prinzip">
          <div style={{ background: `linear-gradient(180deg, ${C.accent}12, ${C.accent2}0a)`, border: `1px solid ${C.accent}55`, borderRadius: 16, padding: "22px 24px" }}>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 15.5 }}>
              <li>Der DFS-Baum zeigt nur <b>Baumkanten</b> (Erstbesuche weißer Knoten). Rückwärts-, Vorwärts- und Kreuzkanten existieren im Graphen, sind im Baum aber <b>unsichtbar</b>.</li>
              <li><b>Nachkomme im Baum</b> ⟺ es gab bei der Entdeckung von u einen Weg zu v aus <b>lauter weißen Knoten</b> – nicht: irgendein Pfad im Graphen (Satz vom weißen Pfad).</li>
              <li>Welche Kante zur Baumkante wird, hängt von der <b>Farbe des Nachbarn zum Besuchszeitpunkt</b> ab – und damit von der <b>Reihenfolge</b> der Hauptschleife.</li>
            </ol>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}`, color: C.text, fontSize: 15.5, lineHeight: 1.6 }}>
              <b style={{ color: C.accent2 }}>Das Prinzip hinter allen dreien:</b> „im Graphen verbunden/erreichbar”
              ≠ „im Baum verwandt”. Wer beides gleichsetzt, tappt in die Falle – genau darauf zielt Aufgabe 2.
            </div>
          </div>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: 24, color: C.dim, fontSize: 13.5, lineHeight: 1.7 }}>
          Lern-Trainer · Übung 08, Aufgabe 2 · Kapitel 15 (Tiefensuche).<br />
          Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach.
        </div>
      </footer>
    </div>
  );
}