import React, { useState, useEffect, useMemo } from "react";

/* ============================================================
   ÜBUNG 08 — Interaktiver Lern-Trainer (von Grund auf)
   Theoretische Informatik II · Prof. Dr. Veronika Lesch · DHBW Mosbach
   Aufgabe 1  Dijkstra (Kürzeste Wege)        ← Kernstück + Iterationstabelle
   Aufgabe 2  Tiefensuche (DFS-Gegenbeispiele) ← DFS-Stepper
   Aufgabe 3  Zweifärbbarkeit (Bipartitheit)   ← BFS-Färber
   Klausur am 22.06.2026 — alles wirklich verstehen, kein Vorwissen nötig.
   ============================================================ */

/* ---------- Farb-/Design-System ----------
   accent + accent2 themenspezifisch (Wege/Distanz vs. Suche/Färbung),
   Rest neutral – wie in den anderen Trainern. */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  border: "#2a2f3d",
  text: "#e6e8ee",
  textDim: "#9aa1b1",
  accent: "#7dd3fc",  // cyan   — „Distanz / fertiger Knoten / kürzester Weg"
  accent2: "#a78bfa", // violett — „Suche / Färbung / Kantentyp"
  good: "#86efac",    // grün — Erfolg / verbessert / bipartit
  bad: "#fca5a5",     // rot  — Konflikt / Verletzung / Rückwärtskante
  warn: "#fcd34d",    // gelb — aktiver Fokus / grau / Highlight
  code: "#7dd3fc",
};

const MONO = "'SF Mono', 'Fira Code', Consolas, ui-monospace, monospace";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/* Knotenfarben nach VL-Notation weiß / grau / schwarz */
const NODE_WHITE = C.textDim; // unentdeckt
const NODE_GRAY = C.warn;     // entdeckt / in Q
const NODE_BLACK = C.accent;  // fertig / abgeschlossen

/* ============================================================
   WIEDERVERWENDBARE BAUSTEINE
   ============================================================ */

function useReveal(init = false) {
  const [shown, setShown] = useState(init);
  return [shown, () => setShown((s) => !s), () => setShown(false)];
}

function Section({ kicker, title, color = C.accent, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      {kicker && (
        <div style={{ textTransform: "uppercase", letterSpacing: 2, fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>
          {kicker}
        </div>
      )}
      {title && <h2 style={{ fontSize: 26, margin: "0 0 18px", color: C.text, lineHeight: 1.2 }}>{title}</h2>}
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22, ...style }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textDim, marginRight: 14, marginTop: 4 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, tone = C.accent2, icon = "💡", children }) {
  return (
    <div style={{ background: `${tone}15`, border: `1px solid ${tone}55`, borderRadius: 12, padding: "14px 18px", margin: "16px 0" }}>
      {title && <div style={{ fontWeight: 700, color: tone, marginBottom: 6, fontSize: 15 }}>{icon} {title}</div>}
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 4, alignSelf: "stretch", background: color, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: C.text, fontSize: 15 }}>{name}</strong>
          {formula && (
            <code style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "2px 8px", fontSize: 13, color: C.accent, fontFamily: MONO }}>
              {formula}
            </code>
          )}
        </div>
        {note && <div style={{ color: C.textDim, fontSize: 14, marginTop: 4, lineHeight: 1.55 }}>{note}</div>}
      </div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.textDim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

/* Inline-Code in Monospace (Vorlesungs-Notation :=, mod, Θ/O/Ω, ∞) */
function Code({ children }) {
  return (
    <code style={{ fontFamily: MONO, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "1px 6px", fontSize: 13, color: C.code }}>
      {children}
    </code>
  );
}

/* Pseudocode-Block in VL-Notation */
function Pseudo({ title, lines }) {
  return (
    <div style={{ background: "#0b0e15", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", margin: "14px 0", overflowX: "auto" }}>
      {title && (
        <div style={{ color: C.textDim, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      )}
      <div style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 1.85 }}>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: "pre", color: ln.trimStart().startsWith("//") ? C.textDim : C.text }}>{ln}</div>
        ))}
      </div>
    </div>
  );
}

/* Untertitel für die 5 Teilabschnitte jeder Aufgabe */
function SubHead({ n, color = C.accent, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "30px 0 12px" }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: color + "22", border: `1px solid ${color}`, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
        {n}
      </span>
      <h3 style={{ margin: 0, fontSize: 18, color: C.text }}>{children}</h3>
    </div>
  );
}

/* Aufgabenstellung (Originaltext) */
function TaskStatement({ children }) {
  return (
    <div style={{ background: C.accent + "0e", border: `1px solid ${C.accent}40`, borderLeft: `4px solid ${C.accent}`, borderRadius: 10, padding: "14px 18px", margin: "4px 0", color: C.text, fontSize: 15, lineHeight: 1.7 }}>
      {children}
    </div>
  );
}

/* ---------- Button-Styles ---------- */
const btn = {
  background: C.accent, color: "#0a0d14", border: "none", borderRadius: 9,
  padding: "8px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer",
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 9,
  padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer",
};

/* ---------- Reveal-Karte: Frage → Lösung aufdecken ---------- */
function Reveal({ q, children }) {
  const [shown, toggle] = useReveal();
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: C.accent2, fontWeight: 800, fontSize: 16, lineHeight: 1.4 }}>?</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
          {shown && <div style={{ marginTop: 10, color: C.textDim, fontSize: 14.5, lineHeight: 1.7, animation: "fade .3s ease" }}>{children}</div>}
          <button style={{ ...btnGhost, marginTop: 10, padding: "6px 12px", fontSize: 13 }} onClick={toggle}>
            {shown ? "▲ Lösung verbergen" : "▼ Lösung aufdecken"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Quiz: Auswahlfrage mit Feedback ---------- */
function QuizChoice({ q, options, correct, explain }) {
  const [pick, setPick] = useState(null);
  const answered = pick !== null;
  const ok = pick === correct;
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.warn, fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>✎</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, i) => {
          let bg = C.panel, border = C.border, col = C.text;
          if (answered) {
            if (i === correct) { bg = C.good + "1f"; border = C.good; }
            else if (i === pick) { bg = C.bad + "1f"; border = C.bad; }
            else { col = C.textDim; }
          }
          return (
            <button key={i} disabled={answered} onClick={() => setPick(i)}
              style={{ textAlign: "left", background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: "10px 14px", color: col, fontSize: 14, fontFamily: SANS, cursor: answered ? "default" : "pointer", transition: "background .2s, border-color .2s" }}>
              <span style={{ fontWeight: 700, marginRight: 8, color: C.textDim }}>{String.fromCharCode(65 + i)})</span>
              {opt}
              {answered && i === correct && <span style={{ color: C.good, fontWeight: 700, float: "right" }}>✓</span>}
              {answered && i === pick && i !== correct && <span style={{ color: C.bad, fontWeight: 700, float: "right" }}>✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 12, animation: "fade .3s ease" }}>
          <div style={{ color: ok ? C.good : C.bad, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ok ? "Richtig! 🎉" : "Nicht ganz."}</div>
          <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65 }}>{explain}</div>
          <button style={{ ...btnGhost, marginTop: 10, padding: "6px 12px", fontSize: 13 }} onClick={() => setPick(null)}>↺ Nochmal</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Quiz: Eingabefrage (Zahl/Text) mit Feedback ---------- */
function QuizInput({ q, answers, explain, placeholder = "Antwort …" }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
  const list = Array.isArray(answers) ? answers : [answers];
  const ok = list.some((a) => norm(a) === norm(val));
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", margin: "10px 0" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.warn, fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>✎</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{q}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={val} placeholder={placeholder}
          onChange={(e) => { setVal(e.target.value); setChecked(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") setChecked(true); }}
          style={{ flex: 1, minWidth: 160, background: C.panel, border: `1px solid ${checked ? (ok ? C.good : C.bad) : C.border}`, borderRadius: 9, color: C.text, padding: "9px 12px", fontSize: 14, fontFamily: SANS, outline: "none", transition: "border-color .2s" }} />
        <button style={btn} onClick={() => setChecked(true)}>Prüfen</button>
      </div>
      {checked && (
        <div style={{ marginTop: 12, animation: "fade .3s ease" }}>
          <div style={{ color: ok ? C.good : C.bad, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {ok ? "Richtig! 🎉" : "Noch nicht richtig — versuch es nochmal."}
          </div>
          <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65 }}>{explain}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- gemeinsame Stepper-Steuerung ---------- */
function useStepper(maxStep, intervalMs = 1200, deps = []) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Reset, wenn sich abhängige Auswahl (z. B. Beispielgraph) ändert
  useEffect(() => { setStep(0); setPlaying(false); }, deps); // eslint-disable-line
  useEffect(() => {
    if (!playing) return;
    if (step >= maxStep) { setPlaying(false); return; }
    const t = setInterval(() => {
      setStep((s) => { if (s >= maxStep) { setPlaying(false); return s; } return s + 1; });
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, step, maxStep, intervalMs]);

  const controls = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={() => { if (step >= maxStep) setStep(0); setPlaying((p) => !p); }}>
        {playing ? "⏸ Pause" : step >= maxStep ? "↻ Nochmal" : "▶ Abspielen"}
      </button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}>◀ Zurück</button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep((s) => Math.min(maxStep, s + 1)); }}>Vor ▶</button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep(0); }}>↺ Reset</button>
      <span style={{ marginLeft: "auto", color: C.textDim, fontSize: 13, alignSelf: "center" }}>Schritt {step} / {maxStep}</span>
    </div>
  );
  return { step, setStep, playing, controls };
}

/* Caption-Box, einheitlich für alle Visualisierungen */
function Caption({ tone = C.accent2, children, mono = false }) {
  return (
    <div style={{ marginTop: 14, background: C.panel2, border: `1px solid ${C.border}`, borderLeft: `3px solid ${tone}`, borderRadius: 10, padding: "12px 14px", minHeight: 52, color: C.text, fontSize: 14, lineHeight: 1.6, fontFamily: mono ? MONO : SANS }}>
      {children}
    </div>
  );
}

/* =========================================================
   GRAPH-GEOMETRIE — Hilfen für gerichtete Kanten (mit/ohne Krümmung)
   ========================================================= */
function straightGeom(a, b, r = 22) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  return {
    x1: a.x + ux * r, y1: a.y + uy * r,
    x2: b.x - ux * (r + 7), y2: b.y - uy * (r + 7),
    mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2,
  };
}
/* Gekrümmte Kante (für reziproke Paare u→v und v→u), gibt Pfad + Pfeil-Endpunkt + Label-Position */
function curvedGeom(a, b, bend, r = 22) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux; // Normale
  const mx = (a.x + b.x) / 2 + px * bend;
  const my = (a.y + b.y) / 2 + py * bend;
  // Start-/Endpunkt an den Knotenrand schieben (Richtung Kontrollpunkt)
  const s = { x: a.x, y: a.y }, e = { x: b.x, y: b.y };
  const sdx = mx - s.x, sdy = my - s.y, sl = Math.hypot(sdx, sdy) || 1;
  const edx = mx - e.x, edy = my - e.y, el = Math.hypot(edx, edy) || 1;
  const x1 = s.x + (sdx / sl) * r, y1 = s.y + (sdy / sl) * r;
  const x2 = e.x + (edx / el) * (r + 7), y2 = e.y + (edy / el) * (r + 7);
  return { path: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`, lx: mx, ly: my };
}

/* =========================================================
   VIS 1 — DIJKSTRA Live-Stepper mit Iterationstabelle (Aufgabe 1)
   Graph exakt aus der Übung:
   A→B 10, A→D 5, B→C 10, B→D 10, B→E 25, C→E 5, D→E 25
   ========================================================= */
const DJ_NODES = { A: { x: 70, y: 150 }, B: { x: 220, y: 60 }, C: { x: 390, y: 60 }, D: { x: 220, y: 240 }, E: { x: 390, y: 240 } };
const DJ_EDGES = [
  { from: "A", to: "B", w: 10 }, { from: "A", to: "D", w: 5 },
  { from: "B", to: "C", w: 10 }, { from: "B", to: "D", w: 10 }, { from: "B", to: "E", w: 25 },
  { from: "C", to: "E", w: 5 }, { from: "D", to: "E", w: 25 },
];
const DJ_ORDER = ["A", "B", "C", "D", "E"];

/* Deterministische Simulation → Iterations-Snapshots (gegen die Vorlage verifiziert) */
function buildDijkstra() {
  const adj = {}; DJ_ORDER.forEach((n) => (adj[n] = []));
  DJ_EDGES.forEach((e) => adj[e.from].push({ to: e.to, w: e.w }));
  const INF = Infinity;
  const d = {}, pi = {}, color = {};
  DJ_ORDER.forEach((n) => { d[n] = INF; pi[n] = null; color[n] = "white"; });
  d.A = 0; color.A = "gray";

  const snaps = [];
  // Q = alle noch nicht schwarzen Knoten (Textbuch-Dijkstra mit Q := V)
  const queue = () => DJ_ORDER.filter((n) => color[n] !== "black").sort((a, b) => d[a] - d[b] || DJ_ORDER.indexOf(a) - DJ_ORDER.indexOf(b));

  snaps.push({
    em: 0, qBefore: queue(), active: null,
    d: { ...d }, pi: { ...pi }, color: { ...color },
    updated: new Set(), relax: [], done: false,
    caption: "Initialisierung: A.d := 0 (Start), alle anderen ∞. A ist grau (entdeckt, in Q). Vorgänger π überall „–“.",
  });

  let em = 0;
  while (queue().length > 0) {
    em += 1;
    const qBefore = queue();
    const u = qBefore[0]; // Extract-Min: kleinste d
    const updated = new Set();
    const relax = [];
    for (const { to: v, w } of adj[u]) {
      const cand = d[u] + w, before = d[v];
      if (cand < d[v]) {
        d[v] = cand; pi[v] = u; if (color[v] === "white") color[v] = "gray";
        updated.add(v);
        relax.push({ to: v, w, cand, before, ok: true });
      } else {
        relax.push({ to: v, w, cand, before, ok: false });
      }
    }
    color[u] = "black";
    const relaxTxt = relax.map((r) =>
      `${u}→${r.to}: ${d[u]}+${r.w}=${r.cand} ${r.ok ? `< ${r.before === INF ? "∞" : r.before} ✔ aktualisiert` : `≥ ${r.before === INF ? "∞" : r.before} ✘`}`
    ).join("  ·  ");
    snaps.push({
      em, qBefore, active: u,
      d: { ...d }, pi: { ...pi }, color: { ...color },
      updated, relax, done: false,
      caption: `Extract-Min #${em}: kleinste Distanz in Q ist ${u} (d=${d[u]}) → ${u} wird aktiv & danach schwarz. Relax: ${relaxTxt || "keine ausgehenden Kanten"}.`,
    });
  }
  // Abschluss-Schritt: kürzesten Pfad A→E markieren
  snaps.push({
    em, qBefore: [], active: null,
    d: { ...d }, pi: { ...pi }, color: { ...color },
    updated: new Set(), relax: [], done: true,
    caption: "Q leer → fertig. Kürzester Pfad A→E: A → B → C → E mit Länge 25 (10+10+5). Der entscheidende Schritt war Iteration 4: E wurde von 30 (über D) auf 25 (über C) verbessert.",
  });
  return snaps;
}
const DJ_STEPS = buildDijkstra();
const DJ_PATH_EDGES = new Set(["AB", "BC", "CE"]); // kürzester A→E-Pfad

function fmtDist(v) { return v === Infinity ? "∞" : v; }
function djStateColor(c) { return c === "black" ? NODE_BLACK : c === "gray" ? NODE_GRAY : NODE_WHITE; }

function DijkstraGraph({ snap }) {
  const treeEdges = new Set();
  DJ_ORDER.forEach((n) => { if (snap.pi[n]) treeEdges.add(snap.pi[n] + n); });
  const relaxKeys = {}; snap.relax.forEach((r) => { relaxKeys[snap.active + r.to] = r.ok; });

  return (
    <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        {[["def", C.border], ["tree", C.accent], ["ok", C.good], ["no", C.bad], ["path", C.good]].map(([id, col]) => (
          <marker key={id} id={`dj-${id}`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={col} />
          </marker>
        ))}
      </defs>
      {DJ_EDGES.map((e, i) => {
        const g = straightGeom(DJ_NODES[e.from], DJ_NODES[e.to]);
        const key = e.from + e.to;
        const onPath = snap.done && DJ_PATH_EDGES.has(key);
        const isRelax = key in relaxKeys;
        const isTree = treeEdges.has(key);
        let col = C.border, wid = 2, marker = "def";
        if (isTree) { col = C.accent; wid = 3; marker = "tree"; }
        if (isRelax) { col = relaxKeys[key] ? C.good : C.bad; wid = 3.4; marker = relaxKeys[key] ? "ok" : "no"; }
        if (onPath) { col = C.good; wid = 4; marker = "path"; }
        return (
          <g key={i}>
            <line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke={col} strokeWidth={wid} markerEnd={`url(#dj-${marker})`} style={{ transition: "stroke .3s, stroke-width .3s" }} />
            <rect x={g.mx - 11} y={g.my - 10} width={22} height={18} rx={4} fill={C.bg} opacity={0.88} />
            <text x={g.mx} y={g.my + 3} textAnchor="middle" fontSize="12" fill={onPath || isRelax ? col : C.textDim}>{e.w}</text>
          </g>
        );
      })}
      {DJ_ORDER.map((n) => {
        const p = DJ_NODES[n];
        const col = djStateColor(snap.color[n]);
        const isActive = snap.active === n;
        const upd = snap.updated.has(n);
        return (
          <g key={n} className={isActive ? "u8-pulse" : ""}>
            <circle cx={p.x} cy={p.y} r={22} fill={C.panel2} stroke={upd ? C.warn : col} strokeWidth={isActive || upd ? 4 : 3} style={{ transition: "stroke .3s, stroke-width .3s" }} />
            <text x={p.x} y={p.y - 1} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.text}>{n}</text>
            <text x={p.x} y={p.y + 13} textAnchor="middle" fontSize="10" fill={col}>
              {fmtDist(snap.d[n])}{snap.pi[n] ? `,${snap.pi[n]}` : n === "A" ? ",–" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DijkstraVis() {
  const max = DJ_STEPS.length - 1;
  const { step, controls } = useStepper(max, 1500);
  const snap = DJ_STEPS[step];

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>Dijkstra Schritt für Schritt — Graph, Tabelle &amp; Warteschlange synchron</div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 14 }}>
        Jeder Schritt = ein <strong>Extract-Min</strong>. Der aktive Knoten wird schwarz, seine ausgehenden Kanten werden <em>relaxiert</em>,
        Distanz/Vorgänger an den Knoten aktualisiert und die Iterationstabelle wächst Zeile für Zeile.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ background: C.bg, borderRadius: 12, padding: 10 }}><DijkstraGraph snap={snap} /></div>

        {/* Warteschlange */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: C.textDim, fontSize: 13 }}>Q vor Extract-Min (nach d sortiert):</span>
          {snap.qBefore.length === 0 ? <span style={{ color: C.textDim, fontStyle: "italic" }}>leer</span> :
            snap.qBefore.map((n) => (
              <span key={n} className="u8-pop" style={{ background: n === snap.active ? C.warn : C.panel2, color: n === snap.active ? "#1a1400" : C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 10px", fontWeight: 700, fontSize: 13 }}>
                {n}<span style={{ opacity: 0.6, marginLeft: 4 }}>{fmtDist(snap.d[n])}</span>
              </span>
            ))}
        </div>

        {/* Iterationstabelle (Zeile für Zeile) */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: 13, fontFamily: MONO }}>
            <thead>
              <tr>
                {["Aufr. EM", "akt.", ...DJ_ORDER].map((h, k) => (
                  <th key={k} style={{ borderBottom: `1px solid ${C.border}`, padding: "6px 8px", color: C.textDim, textAlign: "center", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DJ_STEPS.slice(0, step + 1).filter((s) => !s.done).map((s, ri) => (
                <tr key={ri} style={{ animation: "fade .3s ease" }}>
                  <td style={{ padding: "6px 8px", textAlign: "center", color: C.textDim }}>{s.em === 0 ? "0 (Init)" : s.em}</td>
                  <td style={{ padding: "6px 8px", textAlign: "center", color: C.warn, fontWeight: 700 }}>{s.active || "–"}</td>
                  {DJ_ORDER.map((n) => {
                    const col = djStateColor(s.color[n]);
                    const upd = s.updated.has(n);
                    return (
                      <td key={n} style={{ padding: "5px 8px", textAlign: "center", color: col, fontWeight: 700, background: upd ? C.warn + "26" : s.active === n ? C.accent + "14" : "transparent", border: upd ? `1px solid ${C.warn}` : `1px solid transparent`, borderRadius: 4 }}>
                        {fmtDist(s.d[n])}{s.pi[n] ? `,${s.pi[n]}` : n === "A" ? ",–" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Caption tone={snap.done ? C.good : snap.active ? C.accent : C.accent2}>{snap.caption}</Caption>
        {controls}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <Tag color={NODE_WHITE}>weiß = unentdeckt (∞)</Tag>
          <Tag color={NODE_GRAY}>grau = in Q (entdeckt)</Tag>
          <Tag color={NODE_BLACK}>schwarz = fertig (endgültig)</Tag>
          <Tag color={C.good}>Relax verbessert</Tag>
          <Tag color={C.bad}>Relax verworfen</Tag>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 1b — Adjazenzmatrix interaktiv (klassisch d / Distanz ab A, b)
   ========================================================= */
const DJ_D_FINAL = { A: 0, B: 10, C: 20, D: 5, E: 25 };
function MatrixVis() {
  const [hover, setHover] = useState(null);
  const [mode, setMode] = useState("classic");
  const wOf = (a, b) => { const e = DJ_EDGES.find((x) => x.from === a && x.to === b); return e ? e.w : null; };

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button style={mode === "classic" ? btn : btnGhost} onClick={() => setMode("classic")}>Klassische Matrix (d)</button>
        <button style={mode === "distance" ? { ...btn, background: C.accent2 } : btnGhost} onClick={() => setMode("distance")}>Distanzmatrix ab A (b)</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", margin: "0 auto", fontSize: 14, fontFamily: MONO }}>
          <thead>
            <tr>
              <th style={{ padding: 8, color: C.accent2 }}>{mode === "classic" ? "von ↓ / nach →" : "A →"}</th>
              {DJ_ORDER.map((c) => <th key={c} style={{ padding: "8px 14px", color: C.textDim, fontWeight: 700 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {(mode === "classic" ? DJ_ORDER : ["A"]).map((r) => (
              <tr key={r}>
                <td style={{ padding: "8px 14px", color: C.textDim, fontWeight: 700 }}>{r}</td>
                {DJ_ORDER.map((c) => {
                  let val, isVal;
                  if (mode === "classic") { const w = wOf(r, c); isVal = w !== null; val = isVal ? w : r === c ? "0" : "∞"; }
                  else { val = c === "A" ? 0 : DJ_D_FINAL[c]; isVal = true; }
                  const hot = hover && ((mode === "classic" && hover.from === r && hover.to === c) || (mode === "distance" && hover.to === c));
                  return (
                    <td key={c}
                      onMouseEnter={() => mode === "classic" ? (isVal && r !== c && setHover({ from: r, to: c })) : setHover({ from: "A", to: c })}
                      onMouseLeave={() => setHover(null)}
                      style={{ padding: "8px 14px", textAlign: "center", border: `1px solid ${C.border}`, color: val !== "∞" && val !== "0" ? C.accent : C.textDim, fontWeight: val !== "∞" ? 700 : 400, background: hot ? C.warn + "22" : "transparent", transition: "background .2s" }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InfoBox title={mode === "classic" ? "Klassische Adjazenzmatrix (d)" : "Distanzmatrix ab A (b)"} tone={mode === "classic" ? C.accent : C.accent2} icon="🔢">
        {mode === "classic" ? (
          <>Eintrag <Code>M[u][v]</Code> = Gewicht der Kante u→v, sonst <strong>∞</strong> (Diagonale 0). Weil G <strong>gerichtet</strong> ist, ist die Matrix <strong>nicht symmetrisch</strong> (A→B = 10, aber B→A = ∞).</>
        ) : (
          <>Hier stehen die von Dijkstra berechneten <strong>kürzesten Distanzen ab A</strong> — nur eine Zeile. Für die <strong>vollständige</strong> Matrix kürzester Wege müsstest du Dijkstra von <strong>jedem</strong> Knoten starten (|V| = 5 Läufe) → das All-Pairs-Shortest-Paths-Problem.</>
        )}
      </InfoBox>
    </Card>
  );
}

/* =========================================================
   VIS 2 — DFS-Stepper mit 3 Beispielgraphen (Aufgabe 2)
   ========================================================= */
const DFS_CASES = {
  a: {
    label: "(a) w, u, v",
    nodes: { w: { x: 230, y: 55 }, u: { x: 120, y: 200 }, v: { x: 340, y: 200 } },
    edges: [{ from: "w", to: "u" }, { from: "u", to: "w" }, { from: "w", to: "v" }],
    adj: { w: ["u", "v"], u: ["w"], v: [] },
    roots: ["w"],
    claim: "„u.d < v.d ⇒ v ist Nachkomme von u“ — wird widerlegt.",
  },
  b: {
    label: "(b) x, u, v",
    nodes: { x: { x: 230, y: 55 }, u: { x: 120, y: 200 }, v: { x: 340, y: 200 } },
    edges: [{ from: "x", to: "u" }, { from: "u", to: "x" }, { from: "x", to: "v" }],
    adj: { x: ["u", "v"], u: ["x"], v: [] },
    roots: ["x"],
    claim: "„Pfad u⇝v ⇒ v.d < u.f“ — wird widerlegt (hier v.d > u.f).",
  },
  c: {
    label: "(c) u, x, y",
    nodes: { u: { x: 230, y: 55 }, x: { x: 120, y: 200 }, y: { x: 340, y: 200 } },
    edges: [{ from: "u", to: "x" }, { from: "y", to: "u" }],
    adj: { u: ["x"], x: [], y: ["u"] },
    roots: ["x", "u", "y"], // Wurzelreihenfolge: x, dann u, dann y
    claim: "Ein-Knoten-Baum {u}, obwohl u ein- UND ausgehende Kanten hat.",
  },
};

/* Generische DFS mit Zeitstempeln + Kantenklassifikation → Event-Liste */
function buildDFS(caseDef) {
  const { adj, roots, nodes } = caseDef;
  const all = Object.keys(nodes);
  const color = {}; all.forEach((n) => (color[n] = "white"));
  const d = {}, f = {}, pi = {};
  let time = 0;
  const events = [];
  const snap = (extra) => ({ d: { ...d }, f: { ...f }, color: { ...color }, time, ...extra });

  function classify(uu, vv) {
    if (color[vv] === "white") return "tree";
    if (color[vv] === "gray") return "back";
    return d[uu] < d[vv] ? "forward" : "cross";
  }
  function visit(uu) {
    time += 1; d[uu] = time; color[uu] = "gray";
    events.push(snap({ kind: "discover", node: uu, caption: `${uu} entdeckt → grau. ${uu}.d = ${time}.` }));
    for (const vv of adj[uu]) {
      const type = classify(uu, vv);
      events.push(snap({ kind: "edge", edge: { from: uu, to: vv, type }, caption: edgeCaption(uu, vv, type) }));
      if (type === "tree") { pi[vv] = uu; visit(vv); }
    }
    time += 1; f[uu] = time; color[uu] = "black";
    events.push(snap({ kind: "finish", node: uu, caption: `${uu} fertig → schwarz. ${uu}.f = ${time}. Intervall [${d[uu]},${f[uu]}].` }));
  }
  function edgeCaption(uu, vv, type) {
    const names = { tree: "Baumkante", back: "Rückwärtskante", forward: "Vorwärtskante", cross: "Querkante" };
    if (type === "tree") return `Kante ${uu}→${vv}: ${vv} ist weiß → ${names.tree}. Wir steigen in ${vv} ab.`;
    if (type === "back") return `Kante ${uu}→${vv}: ${vv} ist grau (Vorfahr im Stack) → ${names.back}. ${vv} bekommt kein neues Kind.`;
    if (type === "cross") return `Kante ${uu}→${vv}: ${vv} ist schon schwarz und kein Vorfahr → ${names.cross}. Kein Baumkind.`;
    return `Kante ${uu}→${vv}: ${vv} schwarz, aber Nachkomme → ${names.forward}.`;
  }

  events.push(snap({ kind: "init", caption: "Start: alle Knoten weiß, Zeitzähler = 0." }));
  for (const r of roots) if (color[r] === "white") visit(r);
  events.push(snap({ kind: "done", caption: "Fertig. DFS-Wald & alle Entdeckungs-/Abschlusszeiten stehen.", done: true }));
  return events;
}
const DFS_PRECOMP = { a: buildDFS(DFS_CASES.a), b: buildDFS(DFS_CASES.b), c: buildDFS(DFS_CASES.c) };

const ETYPE_COLOR = { tree: C.accent, back: C.bad, forward: C.accent2, cross: C.warn };
function dfsNodeColor(c) { return c === "black" ? NODE_BLACK : c === "gray" ? NODE_GRAY : NODE_WHITE; }

function DFSGraph({ caseDef, ev }) {
  const { nodes, edges } = caseDef;
  const hasReverse = (a, b) => edges.some((e) => e.from === b && e.to === a);
  const treeEdges = new Set();
  // Baumkanten aus bisher gesehenen tree-Events ableiten: nutze ev.color (Knoten, die pi bekamen)
  return (
    <svg viewBox="0 0 460 270" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        {Object.entries(ETYPE_COLOR).concat([["def", C.border]]).map(([id, col]) => (
          <marker key={id} id={`dfs-${id}`} markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={col} />
          </marker>
        ))}
      </defs>
      {edges.map((e, i) => {
        const a = nodes[e.from], b = nodes[e.to];
        const reciprocal = hasReverse(e.from, e.to);
        const active = ev.kind === "edge" && ev.edge.from === e.from && ev.edge.to === e.to;
        const col = active ? ETYPE_COLOR[ev.edge.type] : C.border;
        const wid = active ? 3.6 : 2;
        if (reciprocal) {
          const bend = e.from < e.to ? -26 : 26;
          const g = curvedGeom(a, b, bend);
          return (
            <g key={i}>
              <path d={g.path} fill="none" stroke={col} strokeWidth={wid} markerEnd={`url(#dfs-${active ? ev.edge.type : "def"})`} className={active ? "u8-blink" : ""} style={{ transition: "stroke .3s, stroke-width .3s" }} />
            </g>
          );
        }
        const g = straightGeom(a, b, 20);
        return (
          <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke={col} strokeWidth={wid} markerEnd={`url(#dfs-${active ? ev.edge.type : "def"})`} className={active ? "u8-blink" : ""} style={{ transition: "stroke .3s, stroke-width .3s" }} />
        );
      })}
      {Object.entries(nodes).map(([n, p]) => {
        const col = dfsNodeColor(ev.color[n]);
        const active = (ev.kind === "discover" || ev.kind === "finish") && ev.node === n;
        const hasD = ev.d[n] !== undefined;
        return (
          <g key={n} className={active ? "u8-pulse" : ""}>
            <circle cx={p.x} cy={p.y} r={20} fill={C.panel2} stroke={col} strokeWidth={active ? 4 : 3} style={{ transition: "stroke .3s, stroke-width .3s" }} />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.text}>{n}</text>
            {hasD && (
              <text x={p.x} y={p.y - 28} textAnchor="middle" fontSize="11" fontWeight="700" fill={col}>
                {ev.d[n]}/{ev.f[n] !== undefined ? ev.f[n] : "·"}
              </text>
            )}
          </g>
        );
      })}
      <text x={230} y={262} textAnchor="middle" fontSize="10.5" fill={C.textDim}>Beschriftung: d/f (Entdeckungs-/Abschlusszeit)</text>
    </svg>
  );
}

/* Zeitleiste mit Intervallen [d,f] – macht „geschachtelt vs. disjunkt" sichtbar */
function IntervalTimeline({ caseDef, ev }) {
  const nodes = Object.keys(caseDef.nodes);
  const maxT = nodes.length * 2;
  const slot = 26;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginTop: 12 }}>
      <div style={{ color: C.textDim, fontSize: 11.5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Klammerungssatz: Intervalle [d, f]</div>
      <svg viewBox={`0 0 ${maxT * slot + 40} ${nodes.length * 30 + 24}`} style={{ width: "100%", height: "auto" }}>
        {Array.from({ length: maxT + 1 }, (_, t) => (
          <g key={t}>
            <line x1={30 + t * slot} y1={6} x2={30 + t * slot} y2={nodes.length * 30 + 6} stroke={C.border} strokeWidth={1} />
            <text x={30 + t * slot} y={nodes.length * 30 + 20} textAnchor="middle" fontSize="9" fill={C.textDim}>{t}</text>
          </g>
        ))}
        {nodes.map((n, i) => {
          const dn = ev.d[n], fn = ev.f[n];
          const y = 14 + i * 30;
          const col = dfsNodeColor(ev.color[n]);
          const x1 = dn !== undefined ? 30 + dn * slot : null;
          const x2 = fn !== undefined ? 30 + fn * slot : x1;
          return (
            <g key={n}>
              <text x={8} y={y + 4} fontSize="12" fontWeight="700" fill={C.text}>{n}</text>
              {x1 !== null && (
                <rect x={x1} y={y - 7} width={Math.max((x2 - x1), 6)} height={14} rx={4} fill={col + "33"} stroke={col} strokeWidth={1.5} style={{ transition: "all .3s" }} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DFSVis() {
  const [caseKey, setCaseKey] = useState("a");
  const caseDef = DFS_CASES[caseKey];
  const events = DFS_PRECOMP[caseKey];
  const max = events.length - 1;
  const { step, controls } = useStepper(max, 1300, [caseKey]);
  const ev = events[step];

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>DFS-Stepper — Färbung, Zeiten &amp; Kantentypen</div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 12 }}>Wähle einen Beispielgraphen. Du siehst weiß→grau→schwarz, den laufenden Zeitzähler, d/f an den Knoten und beim Durchlaufen den Kantentyp.</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(DFS_CASES).map(([k, c]) => (
          <button key={k} onClick={() => setCaseKey(k)} style={{ ...(caseKey === k ? btn : btnGhost), background: caseKey === k ? C.accent2 : "transparent", color: caseKey === k ? "#0a0d14" : C.text, borderColor: C.accent2 }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.textDim, fontSize: 13, marginBottom: 12 }}>
        Ziel: <span style={{ color: C.text }}>{caseDef.claim}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ background: C.bg, borderRadius: 12, padding: 10 }}><DFSGraph caseDef={caseDef} ev={ev} /></div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
          <span style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.text }}>Zeit = <strong style={{ color: C.warn }}>{ev.time}</strong></span>
          {ev.kind === "edge" && (
            <span style={{ background: ETYPE_COLOR[ev.edge.type] + "22", border: `1px solid ${ETYPE_COLOR[ev.edge.type]}`, borderRadius: 8, padding: "6px 12px", color: C.text }}>
              {ev.edge.from}→{ev.edge.to}: <strong style={{ color: ETYPE_COLOR[ev.edge.type] }}>{{ tree: "Baumkante", back: "Rückwärtskante", forward: "Vorwärtskante", cross: "Querkante" }[ev.edge.type]}</strong>
            </span>
          )}
        </div>

        {(caseKey === "a" || caseKey === "b") && <IntervalTimeline caseDef={caseDef} ev={ev} />}

        <Caption tone={ev.kind === "edge" ? ETYPE_COLOR[ev.edge.type] : ev.done ? C.good : C.accent2}>{ev.caption}</Caption>
        {controls}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <Tag color={NODE_WHITE}>weiß</Tag><Tag color={NODE_GRAY}>grau (im Stack)</Tag><Tag color={NODE_BLACK}>schwarz (fertig)</Tag>
          <Tag color={ETYPE_COLOR.tree}>Baumkante</Tag><Tag color={ETYPE_COLOR.back}>Rückwärtskante</Tag><Tag color={ETYPE_COLOR.cross}>Querkante</Tag>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 3 — BFS-Zweifärbung mit Konflikterkennung (Aufgabe 3)
   ========================================================= */
const BIP_CASES = {
  c4: {
    label: "C₄ (bipartit ✓)",
    nodes: { 1: { x: 110, y: 60 }, 2: { x: 350, y: 60 }, 3: { x: 350, y: 220 }, 4: { x: 110, y: 220 } },
    edges: [["1", "2"], ["2", "3"], ["3", "4"], ["4", "1"]],
    start: "1",
  },
  k3: {
    label: "K₃ (ungerade ✗)",
    nodes: { 1: { x: 230, y: 50 }, 2: { x: 110, y: 230 }, 3: { x: 350, y: 230 } },
    edges: [["1", "2"], ["2", "3"], ["3", "1"]],
    start: "1",
  },
  c5: {
    label: "C₅ (ungerade ✗)",
    nodes: { 1: { x: 230, y: 40 }, 2: { x: 390, y: 150 }, 3: { x: 320, y: 250 }, 4: { x: 140, y: 250 }, 5: { x: 70, y: 150 } },
    edges: [["1", "2"], ["2", "3"], ["3", "4"], ["4", "5"], ["5", "1"]],
    start: "1",
  },
};

function buildBipartite(caseDef) {
  const { nodes, edges, start } = caseDef;
  const adj = {}; Object.keys(nodes).forEach((n) => (adj[n] = []));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  const color = {}; // null | "rot" | "blau"
  const opp = (c) => (c === "rot" ? "blau" : "rot");
  const events = [];
  const snap = (queue, extra) => ({ color: { ...color }, queue: [...queue], ...extra });

  events.push(snap([], { kind: "init", caption: "Alle Knoten ungefärbt. Wir starten BFS und färben den Startknoten rot." }));
  color[start] = "rot";
  let queue = [start];
  events.push(snap(queue, { kind: "start", node: start, caption: `Start ${start} := rot, in die Warteschlange.` }));

  let conflict = false;
  while (queue.length && !conflict) {
    const u = queue.shift();
    events.push(snap(queue, { kind: "dequeue", node: u, caption: `Knoten ${u} (${color[u]}) aus der Warteschlange holen, Nachbarn prüfen.` }));
    for (const w of adj[u]) {
      if (color[w] == null) {
        color[w] = opp(color[u]); queue.push(w);
        events.push(snap(queue, { kind: "color", edge: [u, w], node: w, caption: `${w} ungefärbt → Gegenfarbe ${color[w]}. In die Warteschlange.` }));
      } else if (color[w] === color[u]) {
        conflict = true;
        events.push(snap(queue, { kind: "conflict", edge: [u, w], caption: `Kante {${u},${w}}: beide ${color[u]}! ⇒ Konflikt → NICHT zweifärbbar (ungerader Kreis).` }));
        break;
      } else {
        events.push(snap(queue, { kind: "ok", edge: [u, w], caption: `Kante {${u},${w}}: ${u}=${color[u]}, ${w}=${color[w]} – verschieden ✔ (schon korrekt gefärbt).` }));
      }
    }
  }
  if (!conflict) events.push(snap([], { kind: "done", caption: "Warteschlange leer, kein Konflikt → der Graph ist ZWEIFÄRBBAR (bipartit) ✓." }));
  return events;
}
const BIP_PRECOMP = { c4: buildBipartite(BIP_CASES.c4), k3: buildBipartite(BIP_CASES.k3), c5: buildBipartite(BIP_CASES.c5) };
const BIP_COLORVAL = { rot: C.bad, blau: C.accent };

function BipartiteVis() {
  const [caseKey, setCaseKey] = useState("c4");
  const caseDef = BIP_CASES[caseKey];
  const events = BIP_PRECOMP[caseKey];
  const max = events.length - 1;
  const { step, controls } = useStepper(max, 1300, [caseKey]);
  const ev = events[step];

  const edgeState = (a, b) => {
    if (!ev.edge) return "idle";
    const [x, y] = ev.edge;
    if ((x === a && y === b) || (x === b && y === a)) return ev.kind === "conflict" ? "conflict" : ev.kind === "ok" ? "ok" : "active";
    return "idle";
  };

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>BFS-Zweifärbung — färbt in Schichten oder findet den Konflikt</div>
      <div style={{ color: C.textDim, fontSize: 13, marginBottom: 12 }}>Bipartiter Graph: BFS färbt sauber rot/blau in Schichten. Ungerader Kreis: irgendwann treffen zwei <em>gleichfarbige</em> Nachbarn aufeinander → die Kante blinkt rot.</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(BIP_CASES).map(([k, c]) => (
          <button key={k} onClick={() => setCaseKey(k)} style={{ ...(caseKey === k ? btn : btnGhost), background: caseKey === k ? (k === "c4" ? C.good : C.bad) : "transparent", color: caseKey === k ? "#0a0d14" : C.text, borderColor: k === "c4" ? C.good : C.bad }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ background: C.bg, borderRadius: 12, padding: 10 }}>
          <svg viewBox="0 0 460 300" style={{ width: "100%", height: "auto", display: "block" }}>
            {caseDef.edges.map(([a, b], i) => {
              const pa = caseDef.nodes[a], pb = caseDef.nodes[b];
              const st = edgeState(a, b);
              const col = st === "conflict" ? C.bad : st === "ok" ? C.good : st === "active" ? C.accent2 : C.border;
              const wid = st === "idle" ? 2 : 3.6;
              return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={col} strokeWidth={wid} className={st === "conflict" ? "u8-blink" : ""} style={{ transition: "stroke .3s, stroke-width .3s" }} />;
            })}
            {Object.entries(caseDef.nodes).map(([n, p]) => {
              const cv = ev.color[n];
              const fill = cv ? BIP_COLORVAL[cv] : C.panel2;
              const active = ev.node === n;
              const inQ = ev.queue.includes(n);
              return (
                <g key={n} className={active ? "u8-pulse" : ""}>
                  <circle cx={p.x} cy={p.y} r={22} fill={cv ? fill + "33" : C.panel2} stroke={cv ? fill : (inQ ? C.warn : C.textDim)} strokeWidth={active ? 4 : 3} style={{ transition: "stroke .3s, fill .3s" }} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.text}>{n}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: C.textDim, fontSize: 13 }}>Warteschlange:</span>
          {ev.queue.length === 0 ? <span style={{ color: C.textDim, fontStyle: "italic" }}>leer</span> :
            ev.queue.map((n, i) => (
              <span key={i} className="u8-pop" style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 11px", fontWeight: 700, fontSize: 13, color: BIP_COLORVAL[ev.color[n]] || C.text }}>{n}</span>
            ))}
        </div>

        <Caption tone={ev.kind === "conflict" ? C.bad : ev.kind === "done" ? C.good : C.accent2}>{ev.caption}</Caption>
        {controls}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          <Tag color={C.bad}>rot</Tag><Tag color={C.accent}>blau</Tag><Tag color={C.warn}>in Warteschlange</Tag>
          <Tag color={C.good}>Kante ok</Tag><Tag color={C.bad}>Konfliktkante</Tag>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   AUFGABE 1 — DIJKSTRA
   ========================================================= */
function Aufgabe1() {
  return (
    <Section kicker="Aufgabe 1 · Kürzeste Wege" title="Dijkstra-Algorithmus" color={C.accent}>
      <SubHead n="1" color={C.accent}>Aufgabenstellung</SubHead>
      <TaskStatement>
        Gegeben ein <strong>gerichteter, gewichteter</strong> Graph G(V,E) mit den Kanten{" "}
        <Code>A→B = 10</Code>, <Code>A→D = 5</Code>, <Code>B→C = 10</Code>, <Code>B→D = 10</Code>, <Code>B→E = 25</Code>, <Code>C→E = 5</Code>, <Code>D→E = 25</Code>.
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.7 }}>
          <li><strong>a)</strong> Führe Dijkstra ab <strong>A</strong> durch; Übersichtstabelle pro Iteration (Aufrufe von Extract-Min, Q-Inhalt, ausgewählter Knoten sowie Distanz, Vorgänger und Farbe der Knoten).</li>
          <li><strong>b)</strong> Adjazenzmatrix mit den kürzesten Distanzen (Zeile A). Was bräuchte es für die <em>vollständige</em> Matrix?</li>
          <li><strong>c)</strong> Kürzester Pfad A→E und seine Länge?</li>
          <li><strong>d)</strong> Klassische Adjazenzmatrix für G (direkte Gewichte/Richtungen).</li>
          <li><strong>e)</strong> Zusatz: Matrix → Graph zurückzeichnen und vergleichen (nur kurz).</li>
        </ul>
      </TaskStatement>

      <SubHead n="2" color={C.accent}>Grundlagen von Null</SubHead>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        Ein <strong>gerichteter</strong> Graph hat Kanten mit Richtung (Pfeile, „Einbahnstraßen"); <strong>gewichtet</strong> heißt, jede Kante trägt eine Zahl
        (z. B. Fahrtzeit). Dijkstra berechnet die <strong>kürzesten Distanzen</strong> von einem Startknoten zu allen anderen — das <em>Single-Source-Shortest-Path</em>-Problem,
        Voraussetzung: keine negativen Gewichte.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        Für jeden Knoten v merken wir uns eine <strong>vorläufige Distanz</strong> <Code>v.d</Code> und einen <strong>Vorgänger</strong> <Code>π(v)</Code> (über wen man v am günstigsten erreicht).
        Dijkstra ist <strong>greedy</strong>: In jeder Runde holt er per <strong>Extract-Min</strong> den noch nicht fertigen Knoten mit der kleinsten vorläufigen Distanz aus der Prioritäts-Warteschlange Q
        und <strong>relaxiert</strong> dann seine ausgehenden Kanten.
      </p>
      <MethodRow color={C.accent2} name="Relax(u, v, w)" formula="wenn v.d > u.d + w: verbessere" note="Prüft, ob der Weg über u kürzer ist. Falls ja: v.d := u.d + w, π(v) := u, v wird grau (entdeckt)." />
      <InfoBox title="Drei Farben für drei Zustände" tone={C.accent} icon="🎨">
        <strong>weiß</strong> = noch nie relaxiert (Distanz ∞) · <strong>grau</strong> = entdeckt / in Q mit endlicher Distanz · <strong>schwarz</strong> = per Extract-Min fertiggestellt (Distanz endgültig).
        Sobald ein grauer Knoten die kleinste Distanz in Q hat, kann ihn kein späterer Weg mehr verkürzen (alle anderen offenen Wege starten größer, Gewichte ≥ 0) → er darf sofort schwarz werden.
      </InfoBox>

      <SubHead n="3" color={C.accent}>Lösung Schritt für Schritt</SubHead>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        <strong>a)</strong> Jede Zeile = Zustand <em>nach</em> dem Extract-Min dieser Iteration. Reihenfolge der Extract-Min-Aufrufe: <strong>A(0) → D(5) → B(10) → C(20) → E(25)</strong>.
      </p>
      <div style={{ overflowX: "auto", margin: "10px 0" }}>
        <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 13, fontFamily: MONO }}>
          <thead>
            <tr>{["Aufr. EM", "Q vor Extract", "akt.", "A", "B", "C", "D", "E"].map((h, i) => (
              <th key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: "7px 8px", color: C.textDim, fontWeight: 700, textAlign: "center" }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[
              ["0", "{A,B,C,D,E}", "–", "0,– (g)", "∞ (w)", "∞ (w)", "∞ (w)", "∞ (w)"],
              ["1", "{A,B,C,D,E}", "A", "0,– (s)", "10,A (g)", "∞ (w)", "5,A (g)", "∞ (w)"],
              ["2", "{B,C,D,E}", "D", "(s)", "10,A (g)", "∞ (w)", "5,A (s)", "30,D (g)"],
              ["3", "{B,C,E}", "B", "(s)", "10,A (s)", "20,B (g)", "(s)", "30,D (g)"],
              ["4", "{C,E}", "C", "(s)", "(s)", "20,B (s)", "(s)", "25,C (g)★"],
              ["5", "{E}", "E", "(s)", "(s)", "(s)", "(s)", "25,C (s)"],
            ].map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: "6px 8px", textAlign: "center", color: cell.includes("★") ? C.warn : ci === 2 && cell !== "–" ? C.warn : C.text, fontWeight: ci <= 2 || cell.includes("★") ? 700 : 500, background: cell.includes("★") ? C.warn + "22" : "transparent", borderBottom: `1px solid ${C.border}` }}>
                    {cell.replace("★", "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: C.textDim, fontSize: 12, marginTop: 6 }}>(w) weiß · (g) grau · (s) schwarz · ★ = in dieser Iteration aktualisiert (E von 30,D auf 25,C).</div>
      </div>
      <InfoBox title="Die entscheidenden Relax-Schritte" tone={C.accent2} icon="🔑">
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>It. 1 (A): relaxiert B (→10) und D (→5).</li>
          <li>It. 2 (D, denn 5 &lt; 10): relaxiert E (→30 über D).</li>
          <li>It. 3 (B): relaxiert C (→20); B→D = 10+10=20 &gt; 5 → keine Änderung (D schon schwarz); B→E = 35 &gt; 30 → keine Änderung.</li>
          <li>It. 4 (C): C→E = 20+5 = <strong>25 &lt; 30</strong> → <strong>E wird auf 25, Vorgänger C aktualisiert</strong> (der „Aha"-Moment).</li>
          <li>It. 5 (E): keine ausgehenden Kanten — nichts zu relaxieren.</li>
        </ul>
        <div style={{ marginTop: 8 }}><strong>Endergebnis (kürzeste Distanzen ab A):</strong> A:0/– · B:10/A · C:20/B · D:5/A · E:25/C.</div>
      </InfoBox>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, marginTop: 16 }}><strong>b)</strong> Adjazenzmatrix mit kürzesten Distanzen, nur Zeile A:</p>
      <Pseudo lines={["        A    B    C    D    E", "   A  [ 0   10   20    5   25 ]"]} />
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        Für eine <strong>vollständige</strong> Matrix kürzester Pfade müsste man Dijkstra <strong>von jedem Knoten als Start</strong> ausführen (|V| = 5 Durchläufe) → das All-Pairs-Shortest-Paths-Problem.
      </p>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, marginTop: 12 }}>
        <strong>c)</strong> Kürzester Pfad <strong>A → B → C → E, Länge 25</strong>. Vergleich der Alternativen: über D = 5+25 = 30; direkt B→E = 10+25 = 35; über C = 10+10+5 = <strong>25</strong> ← kürzester.
        „denn:" die Aktualisierung in Iteration 4 schlägt den D-Weg.
      </p>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, marginTop: 12 }}><strong>d)</strong> Klassische Adjazenzmatrix (Zeile = von, Spalte = nach; ∞ = keine Kante, Diagonale 0; gerichtet → nicht symmetrisch):</p>
      <Pseudo lines={[
        "        A    B    C    D    E",
        "   A  [ 0   10    ∞    5    ∞ ]",
        "   B  [ ∞    0   10   10   25 ]",
        "   C  [ ∞    ∞    0    ∞    5 ]",
        "   D  [ ∞    ∞    ∞    0   25 ]",
        "   E  [ ∞    ∞    ∞    ∞    0 ]",
      ]} />
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: C.textDim }}>
        <strong>e)</strong> Matrix und Graph sind äquivalente Darstellungen — korrekt übersetzt müssen beide Graphen übereinstimmen.
      </p>

      <SubHead n="4" color={C.accent}>Interaktive Visualisierung</SubHead>
      <DijkstraVis />
      <div style={{ height: 16 }} />
      <MatrixVis />

      <SubHead n="5" color={C.accent}>Verständnisaufgaben</SubHead>
      <QuizInput q="Wie lang ist der kürzeste Pfad A → E?" answers={["25"]} explain="25 = 10 (A→B) + 10 (B→C) + 5 (C→E). Die Alternativen über D (30) oder direkt B→E (35) sind länger." placeholder="Zahl" />
      <QuizInput q="Über welchen Knoten läuft der kürzeste A→E-Pfad zuletzt (direkt vor E)?" answers={["C", "c"]} explain="Über C: …→ C → E. π(E) = C, weil C→E = 5 die Distanz auf 25 senkt." placeholder="Knoten (A–E)" />
      <Reveal q="Warum wird E in Iteration 4 noch einmal verbessert?">
        In Iteration 2 bekam E den Wert 30 über D (5+25). Erst als C in Iteration 4 schwarz wird, steht C.d = 20 endgültig fest. Jetzt gilt C→E: 20 + 5 = <strong>25 &lt; 30</strong> →
        E.d := 25, π(E) := C. Dijkstra darf E vorher nicht abschließen, weil E zu diesem Zeitpunkt nicht die kleinste Distanz in Q hatte (D, B, C waren kleiner und kamen zuerst dran).
      </Reveal>
      <Reveal q="Warum braucht man |V| Dijkstra-Läufe für die volle Distanzmatrix?">
        Ein Dijkstra-Lauf liefert kürzeste Distanzen von <em>genau einem</em> Startknoten (eine Matrixzeile). Für alle Zeilen B, C, D, E braucht man jeweils einen eigenen Lauf mit diesem Knoten als Start —
        insgesamt |V| = 5. Das ist das All-Pairs-Shortest-Paths-Problem (alternativ: Floyd-Warshall in einem Durchgang).
      </Reveal>
      <QuizChoice q="Warum darf D schon in Iteration 2 vor B abgeschlossen (schwarz) werden?" options={["Weil D weniger Nachbarn hat", "Weil D.d = 5 die kleinste Distanz in Q ist und Gewichte ≥ 0 sind", "Weil D alphabetisch vor B kommt", "Zufall der Reihenfolge"]} correct={1} explain="Greedy-Kern: Der graue Knoten mit kleinster vorläufiger Distanz (hier D mit 5 < 10) kann nicht mehr verkürzt werden, weil alle anderen offenen Wege bei größerer Distanz starten und Gewichte nicht-negativ sind." />
    </Section>
  );
}

/* =========================================================
   AUFGABE 2 — TIEFENSUCHE
   ========================================================= */
function Aufgabe2() {
  return (
    <Section kicker="Aufgabe 2 · Tiefensuche" title="DFS-Gegenbeispiele" color={C.accent2}>
      <SubHead n="1" color={C.accent2}>Aufgabenstellung</SubHead>
      <TaskStatement>
        Gib für jedes Beispiel den Graphen und das DFS-Ergebnis (Bäume + Entdeckungs-/Abschlusszeiten) an. Keine Selbst- oder Mehrfachkanten.
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.7 }}>
          <li><strong>a)</strong> Widerlege: „Sei G gerichtet mit Pfad von u nach v, und u.d &lt; v.d. Dann ist v im DFS-Baum ein Nachkomme von u."</li>
          <li><strong>b)</strong> Widerlege: „Sei G gerichtet mit Pfad von u nach v. Für jede Tiefensuche gilt dann v.d &lt; u.f."</li>
          <li><strong>c)</strong> Gib eine DFS an, in der ein Baum mit <strong>einem einzelnen</strong> Knoten u entsteht, obwohl u <strong>ein- und ausgehende</strong> Kanten hat.</li>
        </ul>
      </TaskStatement>

      <SubHead n="2" color={C.accent2}>Grundlagen von Null</SubHead>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        <strong>DFS</strong> geht so tief wie möglich, bevor sie zurückkehrt. Ein globaler Zähler vergibt jedem Knoten eine <strong>Entdeckungszeit</strong> <Code>u.d</Code> (Knoten wird grau)
        und eine <strong>Abschlusszeit</strong> <Code>u.f</Code> (Knoten wird schwarz). Bei |V| Knoten läuft die Zeit von 1 bis 2|V|.
      </p>
      <InfoBox title="Klammerungssatz" tone={C.accent} icon="🧩">
        Die Intervalle <Code>[u.d, u.f]</Code> sind entweder <strong>geschachtelt</strong> (dann ist einer Nachkomme des anderen) oder <strong>disjunkt</strong> (dann ist keiner Nachkomme des anderen) — <strong>nie überlappend</strong>.
        Disjunkte Intervalle ⇒ kein Nachkomme. Genau das brauchen wir für (a).
      </InfoBox>
      <InfoBox title="Weißer-Pfad-Satz" tone={C.accent2} icon="🕊️">
        v ist genau dann Nachkomme von u im DFS-Baum, wenn zum Zeitpunkt <Code>u.d</Code> ein Pfad u⇝v existiert, der <strong>nur über weiße Knoten</strong> läuft. Fehlt so ein weißer Pfad, wird v kein Nachkomme.
      </InfoBox>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10, margin: "14px 0" }}>
        <GlossEntry term="Baumkante u→v" def="v ist beim Durchlaufen weiß → wird Kind von u im DFS-Wald." />
        <GlossEntry term="Rückwärtskante u→v" def="v ist grau (Vorfahr im Stack). Zeigt einen Kreis." />
        <GlossEntry term="Vorwärtskante u→v" def="v ist schwarz und echter Nachkomme von u." />
        <GlossEntry term="Querkante u→v" def="v ist schwarz, aber kein Vorfahr/Nachkomme (z. B. anderer Teilbaum)." />
      </div>

      <SubHead n="3" color={C.accent2}>Lösung Schritt für Schritt</SubHead>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>a) Gegenbeispiel — Knoten w, u, v</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
          Kanten <Code>w→u</Code>, <Code>u→w</Code>, <Code>w→v</Code>. DFS startet bei <strong>w</strong> und nimmt in w's Adjazenz <strong>zuerst u, dann v</strong>.
          Zeiten: <Code>w.d=1, u.d=2, u.f=3, v.d=4, v.f=5, w.f=6</Code>. <Code>u→w</Code> ist eine <strong>Rückwärtskante</strong> (w ist grauer Vorfahr) → u-Teilbaum = {"{u}"} allein.
          Es gibt zwar den Pfad <strong>u → w → v</strong> (Rückwärtskante u→w, dann Baumkante w→v), und u.d=2 &lt; v.d=4 ✓ —{" "}
          <strong>aber</strong> die Intervalle [2,3] und [4,5] sind <strong>disjunkt</strong> → <strong>v ist kein Nachkomme von u</strong>. Behauptung widerlegt.
        </p>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>b) Gegenbeispiel — gleiche Struktur (x, u, v)</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
          Kanten <Code>x→u</Code>, <Code>u→x</Code>, <Code>x→v</Code>; DFS ab x, zuerst u. Zeiten <Code>x.d=1, u.d=2, u.f=3, v.d=4, v.f=5, x.f=6</Code>. Pfad u → x → v existiert.
          Die Behauptung verlangt v.d &lt; u.f, also 4 &lt; 3 — <strong>falsch</strong>: hier ist <strong>v.d (4) &gt; u.f (3)</strong>, v wird erst entdeckt, <em>nachdem</em> u schon fertig ist. Behauptung widerlegt.
        </p>
        <InfoBox title="Gemeinsame Schlüsselidee von a & b" tone={C.bad} icon="⚠">
          Eine <strong>Rückwärtskante</strong> zum Vorfahren erzeugt einen Pfad u⇝v, ohne dass v in u's Teilbaum liegt. Ein bloßer Pfad u⇝v sagt also nichts über die Nachkomme-Beziehung im DFS-Baum aus.
        </InfoBox>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>c) Beispiel — Knoten u, x, y</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
          Kanten <Code>u→x</Code> (ausgehend von u) und <Code>y→u</Code> (eingehend zu u). DFS wählt die Wurzeln in der Reihenfolge <strong>x, dann u, dann y</strong>.
          Zeiten <Code>x.d=1, x.f=2; u.d=3, u.f=4; y.d=5, y.f=6</Code>. Wenn u Wurzel wird, ist x bereits <strong>schwarz</strong> → <Code>u→x</Code> ist eine <strong>Querkante</strong>, kein Baumkind.
          u bildet einen <strong>Ein-Knoten-Baum {"{u}"}</strong> — und hat trotzdem die ausgehende Kante u→x <strong>und</strong> die eingehende Kante y→u. Gefordertes Beispiel erfüllt.
        </p>
      </Card>

      <SubHead n="4" color={C.accent2}>Interaktive Visualisierung</SubHead>
      <DFSVis />

      <SubHead n="5" color={C.accent2}>Verständnisaufgaben</SubHead>
      <QuizChoice q="Ist v in Beispiel (a) ein Nachkomme von u?" options={["Ja, denn es gibt einen Pfad u⇝v", "Nein, die Intervalle [2,3] und [4,5] sind disjunkt"]} correct={1} explain="Nein. Trotz Pfad u→w→v sind die Klammern [u.d,u.f]=[2,3] und [v.d,v.f]=[4,5] disjunkt → kein Nachkomme. v liegt im Geschwister-Teilbaum (Nachkomme von w)." />
      <QuizChoice q="Welcher Kantentyp ist u→w in Beispiel (a)?" options={["Baumkante", "Vorwärtskante", "Rückwärtskante", "Querkante"]} correct={2} explain="Rückwärtskante: Zum Zeitpunkt der Kante ist w noch grau (Vorfahr von u im Stack). Solche Kanten belegen einen Kreis (w→u→w)." />
      <Reveal q="Welcher Satz erklärt am besten, warum v in (a) kein Nachkomme ist?">
        Der <strong>Weiße-Pfad-Satz</strong>: Zum Zeitpunkt u.d = 2 ist w bereits grau (nicht weiß). Der einzige Weg von u nach v führt über w (u→w→v), also gibt es <strong>keinen rein weißen Pfad</strong> von u nach v.
        Damit kann v kein Nachkomme von u sein. (Gleichwertig: der Klammerungssatz mit disjunkten Intervallen.)
      </Reveal>
      <Reveal q="Warum bleibt u in (c) allein, obwohl es Kanten hat?">
        Für ein Baumkind müsste u eine <strong>Baumkante</strong> zu einem <em>weißen</em> Nachbarn haben. u's einzige ausgehende Kante u→x trifft x aber, wenn x schon <strong>schwarz</strong> ist (x wurde als erste Wurzel komplett abgearbeitet)
        → das ist eine Querkante. Die eingehende Kante y→u zählt für u's Teilbaum gar nicht (sie gehört zu y). Also entsteht der Ein-Knoten-Baum {"{u}"}.
      </Reveal>
    </Section>
  );
}

/* =========================================================
   AUFGABE 3 — ZWEIFÄRBBARKEIT
   ========================================================= */
function Aufgabe3() {
  return (
    <Section kicker="Aufgabe 3 · Bipartitheit" title="Zweifärbbarkeit (Bipartit)" color={C.accent2}>
      <SubHead n="1" color={C.accent2}>Aufgabenstellung</SubHead>
      <TaskStatement>
        G = (V,E) heißt <strong>zweifärbbar</strong>, wenn es eine Abbildung c : V → {"{rot, blau}"} gibt, sodass für jede Kante {"{u,v}"} ∈ E gilt c(u) ≠ c(v) (benachbarte Knoten verschieden gefärbt).
        <ul style={{ margin: "10px 0 0", paddingLeft: 20, lineHeight: 1.7 }}>
          <li><strong>a)</strong> Welches ist der <strong>kleinste</strong> Graph, der nicht zweifärbbar ist?</li>
          <li><strong>b)</strong> Algorithmus (textuell + Pseudocode), der für gegebenes G und gegebene Färbung c testet, ob zwei benachbarte Knoten gleiche Farbe haben. Worst-Case-Laufzeit?</li>
          <li><strong>c)</strong> Algorithmus (textuell), der ermittelt, ob G zweifärbbar ist. Laufzeit <strong>O(|V| + |E|)</strong>. Achtung: G ist nicht notwendig zusammenhängend.</li>
        </ul>
      </TaskStatement>

      <SubHead n="2" color={C.accent2}>Grundlagen von Null</SubHead>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>
        Zweifärbbar = <strong>bipartit</strong>. Anschaulich: Lassen sich die Knoten in zwei Gruppen teilen, sodass jede Kante <em>zwischen</em> den Gruppen läuft (keine Kante innerhalb einer Gruppe)?
      </p>
      <InfoBox title="Schlüsselsatz" tone={C.accent} icon="🔑">
        Ein Graph ist <strong>genau dann bipartit</strong>, wenn er <strong>keinen Kreis ungerader Länge</strong> enthält. In einem ungeraden Kreis muss man beim Zwei-Färben irgendwann zwei benachbarte Knoten gleich färben — Widerspruch.
      </InfoBox>

      <SubHead n="3" color={C.accent2}>Lösung Schritt für Schritt</SubHead>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>a) Kleinster nicht-zweifärbbarer Graph: das Dreieck K₃</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
          Drei Knoten, die einen Kreis der Länge 3 bilden. Bei drei paarweise verbundenen Knoten bräuchte man drei Farben; mit nur zwei Farben muss ein Kantenpaar gleichfarbig sein → nicht zweifärbbar.
          K₃ ist der <strong>kleinste ungerade Kreis</strong>. (Ein einzelner Knoten mit Schleife wäre formal kleiner, aber Schleifen sind hier ausgeschlossen — wir betrachten einfache Graphen.)
        </p>
      </Card>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>b) Färbung prüfen</div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
          <strong>Textuell:</strong> Gehe alle Kanten durch; sobald eine Kante {"{u,v}"} mit c(u) = c(v) auftritt, melde „gefunden" (Färbung ungültig). Sonst „keine".
        </p>
        <Pseudo title="Pseudocode (VL-Notation)" lines={[
          "PrüfeFärbung(G, c)",
          "  for each Kante {u, v} ∈ E do",
          "    if c[u] = c[v] then",
          "      return true        // zwei benachbarte Knoten gleicher Farbe",
          "  return false",
        ]} />
        <InfoBox title="Laufzeit" tone={C.good} icon="⏱">
          Jede Kante wird einmal mit O(1) geprüft → <strong>O(|E|)</strong>. Läuft man über Adjazenzlisten inkl. isolierter Knoten, ist es <strong>O(|V| + |E|)</strong>. „denn:" konstante Arbeit pro Kante × Anzahl Kanten.
        </InfoBox>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>c) Zweifärbbarkeit ermitteln (BFS-basiert, auch unzusammenhängend)</div>
        <ul style={{ margin: "0 0 8px", paddingLeft: 18, fontSize: 14.5, lineHeight: 1.75, color: C.text }}>
          <li>Markiere alle Knoten als ungefärbt.</li>
          <li><strong>Für jeden</strong> Knoten s ∈ V: ist s noch ungefärbt, starte eine BFS bei s und färbe s rot. Hole nacheinander Knoten u aus Q; für jeden Nachbarn w:
            <ul style={{ margin: "4px 0", paddingLeft: 18 }}>
              <li>w ungefärbt → färbe w mit der <strong>Gegenfarbe</strong> von u und füge w in Q ein;</li>
              <li>w schon gefärbt und <strong>gleiche</strong> Farbe wie u → gib <strong>„nicht zweifärbbar"</strong> zurück.</li>
            </ul>
          </li>
          <li>Laufen alle Komponenten ohne Konflikt durch → <strong>„zweifärbbar"</strong>.</li>
        </ul>
        <InfoBox title="Laufzeit O(|V| + |E|)" tone={C.good} icon="⏱">
          Jeder Knoten wird einmal entdeckt/gefärbt, jede Kante einmal betrachtet (wie bei BFS/DFS). Die äußere Schleife über alle Knoten stellt sicher, dass auch <strong>jede Komponente</strong> erreicht wird, ohne die Schranke zu verletzen —
          sie besucht jeden Knoten nur einmal zusätzlich in O(1).
        </InfoBox>
      </Card>

      <SubHead n="4" color={C.accent2}>Interaktive Visualisierung</SubHead>
      <BipartiteVis />

      <SubHead n="5" color={C.accent2}>Verständnisaufgaben</SubHead>
      <QuizInput q="Welcher kleinste Graph ist nicht zweifärbbar? (Name oder Knotenzahl)" answers={["K3", "k3", "Dreieck", "dreieck", "Triangel", "3"]} explain="Das Dreieck K₃ — der kleinste ungerade Kreis (3 Knoten, 3 Kanten). Mit nur zwei Farben unvermeidbar ein gleichfarbiges Nachbarpaar." placeholder="z. B. K3 / Dreieck" />
      <QuizChoice q="Ist ein Kreis mit 4 Knoten (C₄) zweifärbbar?" options={["Ja — gerader Kreis, abwechselnd rot/blau", "Nein — jeder Kreis ist problematisch"]} correct={0} explain="Ja. C₄ ist ein gerader Kreis: rot–blau–rot–blau schließt sich konfliktfrei. Nur ungerade Kreise (C₃, C₅, …) sind nicht zweifärbbar." />
      <Reveal q="Warum genügt die äußere Schleife über alle Knoten in c)?">
        BFS von einem Startknoten erreicht nur dessen <strong>Zusammenhangskomponente</strong>. Bei einem unzusammenhängenden Graphen blieben andere Komponenten ungefärbt. Die äußere Schleife startet darum für jeden noch ungefärbten Knoten
        eine neue BFS — so wird garantiert jede Komponente getestet. Da jeder Knoten nur einmal als neuer Start in Frage kommt (danach ist er gefärbt), kostet das nur O(|V|) zusätzlich.
      </Reveal>
      <Reveal q="Warum ist die Laufzeit von c) O(|V|+|E|) und nicht mehr?">
        Jeder Knoten wird genau einmal gefärbt und einmal aus Q geholt → O(|V|). Über die Adjazenzlisten wird jede Kante (gerichtet betrachtet zweimal, also Θ(|E|)) genau einmal angesehen → O(|E|).
        Die äußere Schleife fügt nur einen O(1)-Check pro Knoten hinzu. Summe: <strong>O(|V| + |E|)</strong> — dieselbe Schranke wie ein normaler BFS/DFS-Durchlauf.
      </Reveal>
    </Section>
  );
}

/* =========================================================
   HAUPTKOMPONENTE — Tab-Navigation
   ========================================================= */
const TABS = [
  { id: 1, label: "Aufgabe 1", sub: "Dijkstra", color: C.accent },
  { id: 2, label: "Aufgabe 2", sub: "Tiefensuche", color: C.accent2 },
  { id: 3, label: "Aufgabe 3", sub: "Zweifärbbarkeit", color: C.accent2 },
];

export default function Uebung08() {
  const [tab, setTab] = useState(1);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: SANS, WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes pop { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes tabIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes u8pulse { 0%,100% { filter: drop-shadow(0 0 0 ${C.warn}00); } 50% { filter: drop-shadow(0 0 6px ${C.warn}cc); } }
        @keyframes u8blink { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .u8-pop { animation: pop .3s ease both; }
        .u8-pulse { animation: u8pulse 1.4s ease-in-out infinite; }
        .u8-blink { animation: u8blink 1s ease-in-out infinite; }
        code { font-family: ${MONO}; }
        ::selection { background: ${C.accent}55; }
      `}</style>

      {/* HERO + Intro */}
      <header style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 24px" }}>
        <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.accent2, border: `1px solid ${C.accent2}55`, borderRadius: 999, padding: "5px 14px", marginBottom: 18 }}>
          Übung 08 · Theoretische Informatik II
        </div>
        <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: -1 }}>
          Kürzeste Wege, Tiefensuche &amp;<br />Zweifärbbarkeit
        </h1>
        <p style={{ fontSize: 17, color: C.textDim, lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
          Dieser Trainer deckt <strong style={{ color: C.text }}>Übung 08 komplett von Grund auf</strong> ab — ohne Vorwissen. Jeder Begriff (gerichteter/gewichteter Graph, Extract-Min,
          Relaxieren, Entdeckungs-/Abschlusszeit, Baum-/Rückwärts-/Querkante, Bipartitheit) wird beim ersten Auftreten erklärt. Pro Aufgabe: Aufgabenstellung → Grundlagen → vollständige
          Herleitung → interaktive Visualisierung → Verständnisaufgaben. Klausur am 22.06.2026.
        </p>
      </header>

      {/* Tab-Leiste (sticky) */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: `${C.bg}e8`, backdropFilter: "saturate(160%) blur(12px)", WebkitBackdropFilter: "saturate(160%) blur(12px)", borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "10px 24px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "1 1 150px", textAlign: "left", background: on ? t.color + "1c" : C.panel, border: `1px solid ${on ? t.color : C.border}`, borderRadius: 11, padding: "9px 13px", cursor: "pointer", transition: "background .2s, border-color .2s" }}>
                <div style={{ color: on ? t.color : C.text, fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 1 }}>{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inhalt */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 64px" }}>
        <div key={tab} style={{ animation: "tabIn .35s ease both" }}>
          {tab === 1 && <Aufgabe1 />}
          {tab === 2 && <Aufgabe2 />}
          {tab === 3 && <Aufgabe3 />}
        </div>

        {/* Glossar (immer sichtbar) */}
        <Section kicker="Glossar" title="Alle Begriffe & Symbole kompakt">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            <GlossEntry term="gerichteter Graph" def="Kanten haben eine Richtung (Pfeile, Einbahnstraßen)." />
            <GlossEntry term="gewichteter Graph" def="Jede Kante trägt eine Zahl (Kosten/Länge), z. B. w(u,v)." />
            <GlossEntry term="Adjazenzmatrix" def="Tabelle: Eintrag [u][v] = Kante u→v (Gewicht oder ∞). Gerichtet → nicht symmetrisch." />
            <GlossEntry term="Extract-Min" def="Holt aus der Prioritäts-Warteschlange den Knoten mit kleinster Distanz d." />
            <GlossEntry term="Relaxieren" def="Prüft, ob der Weg über u die Distanz zu v verkürzt; falls ja: v.d, π(v) aktualisieren." />
            <GlossEntry term="Vorgänger π(v)" def="Knoten, über den v am günstigsten erreicht wird; baut den Pfad zurück." />
            <GlossEntry term="weiß / grau / schwarz" def="unentdeckt (∞) / entdeckt, in Q / fertig abgeschlossen." />
            <GlossEntry term="Entdeckungszeit u.d" def="Zeitstempel, wann u grau wird (DFS)." />
            <GlossEntry term="Abschlusszeit u.f" def="Zeitstempel, wann u schwarz wird (DFS)." />
            <GlossEntry term="Klammerungssatz" def="Intervalle [d,f] sind geschachtelt (Nachkomme) oder disjunkt (keiner), nie überlappend." />
            <GlossEntry term="Weißer-Pfad-Satz" def="v ist Nachkomme von u ⇔ bei u.d gibt es einen rein weißen Pfad u⇝v." />
            <GlossEntry term="Baum/Rück/Vor/Quer" def="Kantentypen der DFS: ins Weiße / zum grauen Vorfahr / zum schwarzen Nachkomme / sonst." />
            <GlossEntry term="zweifärbbar / bipartit" def="Knoten in 2 Gruppen, jede Kante läuft zwischen den Gruppen." />
            <GlossEntry term="ungerader Kreis" def="Kreis mit ungerader Kantenzahl; genau das verhindert Bipartitheit." />
            <GlossEntry term="Θ / O / Ω" def="Scharfe / obere / untere asymptotische Schranke der Laufzeit." />
            <GlossEntry term="∞ (unendlich)" def="Noch kein Weg bekannt (Distanz unendlich)." />
          </div>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 24px 48px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
        Übung 08 · Theoretische Informatik II · Dijkstra, Tiefensuche &amp; Zweifärbbarkeit
        <br />
        Prof. Dr. Veronika Lesch · DHBW Mosbach
      </footer>
    </div>
  );
}
