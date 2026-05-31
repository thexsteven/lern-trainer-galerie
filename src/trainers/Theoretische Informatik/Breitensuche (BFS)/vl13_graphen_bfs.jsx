import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   DESIGN-SYSTEM (Dark Theme)
   Nur accent & accent2 sind thematisch angepasst:
   - accent  (Cyan):    die "Welle" der Breitensuche, die sich ausbreitet
   - accent2 (Violett): Knoten & Struktur des Graphen
   ========================================================================= */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc",  // Cyan – die wellenförmige Ausbreitung der BFS
  accent2: "#a78bfa", // Violett – Knoten/Graph-Struktur
  good: "#86efac",    // grün – fertig/besucht
  warn: "#fca5a5",    // rot  – Problem/abgearbeitet hervorgehoben
  gold: "#fcd34d",    // gelb – gerade aktiv
};

/* =========================================================================
   KEYFRAMES + globale Styles
   ========================================================================= */
const STYLE = `
@keyframes pop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.12); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(125,211,252,0.0); }
  50%     { box-shadow: 0 0 0 6px rgba(125,211,252,0.18); }
}
* { box-sizing: border-box; }
::selection { background: ${C.accent}; color: #0a0c11; }
`;

/* =========================================================================
   PFLICHT-BAUSTEINE
   ========================================================================= */

// IntersectionObserver-Hook: blendet Sections beim Scrollen sanft ein
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            obs.unobserve(e.target);
          }
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
      {kicker && (
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
      )}
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

// Hervorgehobener Erklärkasten für Konzept-Einschübe (z.B. O-Notation, FIFO)
function InfoBox({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(167,139,250,0.08)",
        border: `1px solid rgba(167,139,250,0.35)`,
        borderRadius: 14,
        padding: "18px 20px",
        margin: "20px 0",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: C.accent2,
          marginBottom: 8,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>💡</span>
        {title}
      </div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
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
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 5 }}>
        {term}
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

// Zeile für Verfahren/Formeln: farbiger Balken + Code-Badge + Erklärung
function MethodRow({ color, name, formula, note }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "stretch",
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <div style={{ width: 4, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{name}</span>
          {formula && (
            <code
              style={{
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 7,
                padding: "3px 9px",
                fontSize: 13.5,
                color: C.accent,
                fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              }}
            >
              {formula}
            </code>
          )}
        </div>
        {note && (
          <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, marginTop: 6 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

// Button-Styles
const btn = {
  background: C.accent,
  color: "#08111a",
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

// Steuerleiste für die Vis-Player (▶/⏸, ‹ Schritt, Schritt ›, ⟳)
function PlayerControls({ playing, onToggle, onPrev, onNext, onReset, atStart, atEnd }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={onToggle}>
        {playing ? "⏸ Pause" : "▶ Auto-Play"}
      </button>
      <button style={{ ...btnGhost, opacity: atStart ? 0.4 : 1 }} onClick={onPrev} disabled={atStart}>
        ‹ Schritt
      </button>
      <button style={{ ...btnGhost, opacity: atEnd ? 0.4 : 1 }} onClick={onNext} disabled={atEnd}>
        Schritt ›
      </button>
      <button style={btnGhost} onClick={onReset}>
        ⟳ Reset
      </button>
    </div>
  );
}

/* =========================================================================
   GRAPH-DATEN (kleiner ungerichteter Graph wie im Skript)
   Knoten r,s,t,u,v,w,x,y ; Startknoten s
   ========================================================================= */
const NODES = {
  r: { x: 70,  y: 60 },
  s: { x: 190, y: 60 },
  t: { x: 310, y: 60 },
  u: { x: 430, y: 60 },
  v: { x: 70,  y: 180 },
  w: { x: 190, y: 180 },
  x: { x: 310, y: 180 },
  y: { x: 430, y: 180 },
};
const EDGES = [
  ["r", "s"], ["r", "v"],
  ["s", "w"],
  ["t", "u"], ["t", "w"], ["t", "x"],
  ["u", "x"], ["u", "y"],
  ["w", "x"],
  ["x", "y"],
];
// Adjazenzliste (sortiert) – Reihenfolge bestimmt BFS-Ausgabe
const ADJ = {
  r: ["s", "v"],
  s: ["r", "w"],
  t: ["u", "w", "x"],
  u: ["t", "x", "y"],
  v: ["r"],
  w: ["s", "t", "x"],
  x: ["t", "u", "w", "y"],
  y: ["u", "x"],
};

// BFS vorab durchrechnen -> Liste von "Frames" (Momentaufnahmen)
function buildBFSFrames(start) {
  const color = {};
  const dist = {};
  const parent = {};
  Object.keys(NODES).forEach((k) => {
    color[k] = "white";
    dist[k] = Infinity;
    parent[k] = null;
  });
  color[start] = "gray";
  dist[start] = 0;
  const queue = [start];

  const frames = [];
  const snap = (active, justFound, msg) =>
    frames.push({
      color: { ...color },
      dist: { ...dist },
      parent: { ...parent },
      queue: [...queue],
      active,
      justFound,
      msg,
    });

  snap(null, [], `Start: ${start} grau einfärben, d[${start}]=0, in die Queue.`);

  while (queue.length) {
    const u = queue.shift();
    snap(u, [], `Dequeue ${u} (vorderstes Element). Nachbarn prüfen …`);
    const found = [];
    for (const v of ADJ[u]) {
      if (color[v] === "white") {
        color[v] = "gray";
        dist[v] = dist[u] + 1;
        parent[v] = u;
        queue.push(v);
        found.push(v);
        snap(u, [...found], `${v} ist weiß → entdeckt. d[${v}]=d[${u}]+1=${dist[v]}, Enqueue ${v}.`);
      }
    }
    color[u] = "black";
    snap(u, found, `${u} fertig: alle Nachbarn gesehen → schwarz färben.`);
  }
  snap(null, [], "Fertig! Alle erreichbaren Knoten besucht, d = kürzeste Kantenanzahl ab s.");
  return frames;
}

/* =========================================================================
   VIS 1 — BFS Live auf dem Graphen (Wellen-Ausbreitung + Queue)
   ========================================================================= */
function colorOf(state) {
  if (state === "white") return { fill: C.panel2, stroke: C.line, txt: C.dim };
  if (state === "gray") return { fill: "rgba(125,211,252,0.18)", stroke: C.accent, txt: C.accent };
  return { fill: "rgba(134,239,172,0.16)", stroke: C.good, txt: C.good }; // black=fertig
}

function VisBFSGraph() {
  const frames = useRef(buildBFSFrames("s")).current;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const f = frames[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setInterval(() => setI((p) => Math.min(p + 1, frames.length - 1)), 1100);
    return () => clearInterval(id);
  }, [playing, i, frames.length]);

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: C.text }}>
        Vis 1 · BFS in Aktion — die Welle ab Startknoten s
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, marginBottom: 16 }}>
        Beobachte, wie sich die Suche Ring für Ring (Distanz 0, 1, 2 …) ausbreitet.
      </div>

      <svg viewBox="0 0 500 240" style={{ width: "100%", background: C.bg, borderRadius: 12, border: `1px solid ${C.line}` }}>
        {/* Kanten */}
        {EDGES.map(([a, b], k) => {
          const onTree = f.parent[a] === b || f.parent[b] === a;
          return (
            <line
              key={k}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              stroke={onTree ? C.accent2 : C.line}
              strokeWidth={onTree ? 2.6 : 1.4}
              style={{ transition: "stroke .3s, stroke-width .3s" }}
            />
          );
        })}
        {/* Knoten */}
        {Object.entries(NODES).map(([id, p]) => {
          const cs = colorOf(f.color[id]);
          const isActive = f.active === id;
          const isNew = f.justFound.includes(id);
          return (
            <g key={id} style={{ animation: isNew ? "pop .35s ease" : "none" }}>
              <circle
                cx={p.x} cy={p.y} r={18}
                fill={cs.fill}
                stroke={isActive ? C.gold : cs.stroke}
                strokeWidth={isActive ? 3.4 : 2}
                style={{ transition: "fill .3s, stroke .3s" }}
              />
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? C.gold : cs.txt} fontSize="13" fontWeight="700">
                {id}
              </text>
              {/* Distanz d unter dem Knoten */}
              <text x={p.x} y={p.y + 32} textAnchor="middle" fill={C.dim} fontSize="10.5">
                d={f.dist[id] === Infinity ? "∞" : f.dist[id]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Queue-Visualisierung (FIFO) */}
      <div style={{ marginTop: 16 }}>
        <div style={{ color: C.dim, fontSize: 12.5, marginBottom: 6 }}>
          Queue (FIFO) — vorne wird entnommen, hinten angehängt:
        </div>
        <div style={{ display: "flex", gap: 6, minHeight: 38, alignItems: "center", flexWrap: "wrap" }}>
          {f.queue.length === 0 && <span style={{ color: C.dim, fontSize: 13 }}>— leer —</span>}
          {f.queue.map((q, k) => (
            <span
              key={k}
              style={{
                animation: "pop .3s ease",
                background: k === 0 ? "rgba(252,211,77,0.15)" : C.panel2,
                border: `1px solid ${k === 0 ? C.gold : C.line}`,
                color: k === 0 ? C.gold : C.text,
                borderRadius: 8,
                padding: "6px 12px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      {/* Statuszeile */}
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 14,
          color: C.text,
          lineHeight: 1.5,
          minHeight: 44,
        }}
      >
        <span style={{ color: C.accent, fontWeight: 700 }}>Schritt {i + 1}/{frames.length}: </span>
        {f.msg}
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(frames.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
        atStart={i === 0}
        atEnd={i === frames.length - 1}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.panel2}>weiß = unentdeckt</Tag>
        <Tag color={C.accent}>grau = entdeckt, in Queue</Tag>
        <Tag color={C.good}>schwarz = fertig abgearbeitet</Tag>
        <Tag color={C.gold}>aktiv / vorne in Queue</Tag>
        <Tag color={C.accent2}>Baumkante (π-Vorgänger)</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 2 — Queue-Mechanik FIFO vs. Stack LIFO (warum BFS eine Queue braucht)
   ========================================================================= */
function VisQueueVsStack() {
  const ops = ["Enqueue r", "Enqueue s", "Enqueue t", "Dequeue", "Enqueue u", "Dequeue", "Dequeue"];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Zustand bis Schritt i berechnen
  const queue = [];
  const stack = [];
  let lastQ = null, lastS = null;
  for (let k = 0; k <= i && k < ops.length; k++) {
    const op = ops[k];
    if (op.startsWith("Enqueue")) {
      const el = op.split(" ")[1];
      queue.push(el);
      stack.push(el);
    } else {
      lastQ = queue.shift();   // FIFO: vorne raus
      lastS = stack.pop();     // LIFO: hinten raus
    }
  }
  const curOp = ops[Math.min(i, ops.length - 1)];

  useEffect(() => {
    if (!playing) return;
    if (i >= ops.length - 1) { setPlaying(false); return; }
    const id = setInterval(() => setI((p) => Math.min(p + 1, ops.length - 1)), 1000);
    return () => clearInterval(id);
  }, [playing, i, ops.length]);

  const Lane = ({ label, items, last, hint, hi }) => (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ color: C.dim, fontSize: 12.5, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, minHeight: 40, alignItems: "center", flexWrap: "wrap" }}>
        {items.length === 0 && <span style={{ color: C.dim, fontSize: 13 }}>— leer —</span>}
        {items.map((el, k) => {
          const highlighted = hi === "front" ? k === 0 : k === items.length - 1;
          return (
            <span key={k} style={{
              animation: "pop .3s ease",
              background: highlighted ? "rgba(252,211,77,0.15)" : C.panel2,
              border: `1px solid ${highlighted ? C.gold : C.line}`,
              color: highlighted ? C.gold : C.text,
              borderRadius: 8, padding: "6px 11px", fontWeight: 700, fontSize: 14,
            }}>{el}</span>
          );
        })}
      </div>
      <div style={{ color: C.dim, fontSize: 12, marginTop: 6 }}>{hint}</div>
      {last && (
        <div style={{ marginTop: 6, fontSize: 13, color: C.good }}>
          zuletzt entnommen: <b>{last}</b>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: C.text }}>
        Vis 2 · Warum eine Queue? FIFO vs. LIFO
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, marginBottom: 16 }}>
        Dieselben Operationen, zwei Datenstrukturen. Die Reihenfolge der Entnahme entscheidet,
        ob die Suche „in die Breite" (BFS) oder „in die Tiefe" geht.
      </div>

      <div style={{
        background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10,
        padding: "10px 14px", marginBottom: 16, fontSize: 14, color: C.text,
      }}>
        Aktuelle Operation: <span style={{ color: C.gold, fontWeight: 700 }}>{curOp}</span>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Lane label="Queue (BFS) — First In, First Out" items={queue} last={lastQ}
          hint="vorne (links) wird entnommen" hi="front" />
        <Lane label="Stack (DFS) — Last In, First Out" items={stack} last={lastS}
          hint="hinten (rechts) wird entnommen" hi="back" />
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(ops.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
        atStart={i === 0}
        atEnd={i === ops.length - 1}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.gold}>nächstes zu entnehmendes Element</Tag>
        <Tag color={C.good}>zuletzt entnommen</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 3 — Graph-Darstellung: Adjazenzliste ↔ Adjazenzmatrix (kleine Grundlage)
   ========================================================================= */
function VisRepresentation() {
  const verts = ["1", "2", "3", "4", "5"];
  // ungerichteter Beispielgraph
  const adj = { "1": ["3"], "2": ["4"], "3": ["1", "5"], "4": ["2", "5"], "5": ["3", "4"] };
  const steps = verts; // ein Schritt pro Knoten-Zeile
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const activeRow = verts[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const id = setInterval(() => setI((p) => Math.min(p + 1, steps.length - 1)), 1100);
    return () => clearInterval(id);
  }, [playing, i, steps.length]);

  const cell = (r, c) => (adj[r].includes(c) ? 1 : 0);

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: C.text }}>
        Vis 3 · Zwei Wege, denselben Graphen zu speichern
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, marginBottom: 16 }}>
        Die Zeile für Knoten <b style={{ color: C.gold }}>{activeRow}</b> ist hervorgehoben —
        links als Liste der Nachbarn, rechts als 0/1-Zeile der Matrix.
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Adjazenzliste */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Adjazenzliste
          </div>
          {verts.map((v) => (
            <div key={v} style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
              background: v === activeRow ? "rgba(252,211,77,0.12)" : C.panel2,
              border: `1px solid ${v === activeRow ? C.gold : C.line}`,
              borderRadius: 9, padding: "8px 12px",
              transition: "background .3s, border-color .3s",
            }}>
              <span style={{ fontWeight: 700, color: C.accent2, width: 16 }}>{v}</span>
              <span style={{ color: C.dim }}>→</span>
              <span style={{ color: C.text, fontFamily: "ui-monospace, monospace", fontSize: 13.5 }}>
                {adj[v].join(", ")}
              </span>
            </div>
          ))}
        </div>

        {/* Adjazenzmatrix */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Adjazenzmatrix
          </div>
          <table style={{ borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                <th style={{ width: 26 }}></th>
                {verts.map((c) => (
                  <th key={c} style={{ color: C.dim, fontWeight: 600, padding: 4, width: 26 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {verts.map((r) => (
                <tr key={r}>
                  <td style={{ color: C.accent2, fontWeight: 700, padding: 4, textAlign: "center" }}>{r}</td>
                  {verts.map((c) => {
                    const val = cell(r, c);
                    const inRow = r === activeRow;
                    return (
                      <td key={c} style={{
                        textAlign: "center", padding: 4,
                        width: 26, height: 26,
                        background: inRow
                          ? (val ? "rgba(252,211,77,0.2)" : "rgba(252,211,77,0.06)")
                          : (val ? "rgba(125,211,252,0.12)" : C.panel2),
                        border: `1px solid ${inRow ? C.gold : C.line}`,
                        color: val ? (inRow ? C.gold : C.accent) : C.dim,
                        fontWeight: val ? 700 : 400,
                        transition: "background .3s",
                      }}>{val}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        onNext={() => { setPlaying(false); setI((p) => Math.min(steps.length - 1, p + 1)); }}
        onReset={() => { setPlaying(false); setI(0); }}
        atStart={i === 0}
        atEnd={i === steps.length - 1}
      />

      <InfoBox title="Speicherplatz: Liste vs. Matrix">
        Die <b>Matrix</b> braucht immer Θ(|V|²) Platz (eine Zelle pro Knotenpaar), egal wie
        wenige Kanten es gibt — „Θ" (Theta) bedeutet: genau in dieser Größenordnung, nach oben
        und unten. Die <b>Liste</b> braucht nur Θ(|V|+|E|) (ein Eintrag pro Knoten plus einer pro
        Kante) und ist deshalb bei dünn besetzten Graphen (wenige Kanten) sparsamer. BFS nutzt die
        Liste — daher kommt das |E| in der Laufzeit.
      </InfoBox>
    </Card>
  );
}

/* =========================================================================
   HAUPT-KOMPONENTE
   ========================================================================= */
export default function BFSErklaerer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 8px" }}>
        <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 3, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          Kapitel 13 · Theoretische Informatik II
        </div>
        <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
          Breitensuche (BFS) —<br />
          <span style={{ color: C.accent }}>Ring für Ring durch den Graphen</span>
        </h1>
        <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.6, maxWidth: 640 }}>
          BFS (englisch <i>breadth-first search</i>, also „Suche zuerst in die Breite") besucht
          ausgehend von einem Startknoten erst alle direkten Nachbarn, dann deren Nachbarn — wie eine
          Welle, die sich auf dem Wasser ausbreitet. Hier siehst du Schritt für Schritt, wie das
          funktioniert und warum es genau die kürzesten Wege findet.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* 0 — Das Problem */}
        <Section kicker="Motivation" title="0 · Warum braucht man das überhaupt?">
          <Card>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
              Ein <b>Graph</b> (eine Menge von Punkten, die durch Linien verbunden sind — z.B. Städte
              mit Straßen, Personen in einem sozialen Netz, Webseiten mit Links) wirft ständig die
              gleiche Frage auf: <i>„Wie komme ich von hier nach dort — und auf dem kürzesten Weg?"</i>
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, marginBottom: 0 }}>
              Genau das löst die Breitensuche. Sie beantwortet für <b>jeden</b> erreichbaren Knoten
              gleichzeitig: Wie viele Kanten („Schritte") ist er vom Start entfernt? Damit ist BFS die
              Grundlage für Routing, Empfehlungssysteme („Freunde von Freunden") und vieles mehr.
            </p>
          </Card>
          <InfoBox title="Kurz: Was ist ein Graph formal?">
            Ein ungerichteter Graph ist ein Paar <code>G = (V, E)</code>: <code>V</code> (engl.
            <i> vertices</i>) ist die <b>Knotenmenge</b>, <code>E</code> (engl. <i>edges</i>) die
            <b> Kantenmenge</b>. Eine Kante <code>{"{u, v}"}</code> verbindet zwei verschiedene Knoten.
            <code>|V|</code> ist die Anzahl der Knoten, <code>|E|</code> die Anzahl der Kanten — diese
            beiden Zahlen tauchen gleich in der Laufzeit wieder auf.
          </InfoBox>
        </Section>

        {/* 1 — Die Kernidee */}
        <Section kicker="Kernidee" title="1 · Die wellenförmige Ausbreitung">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
              BFS arbeitet in <b>Distanzringen</b>. Zuerst der Start (Distanz 0), dann alle Knoten,
              die eine Kante entfernt sind (Distanz 1), dann Distanz 2 usw. Ein Knoten wird genau dann
              behandelt, wenn alle näheren Knoten schon dran waren. Dadurch ist die zuerst gefundene
              Entfernung automatisch die <b>kürzeste</b>.
            </p>
          </Card>
          <VisBFSGraph />
        </Section>

        {/* 2 — Der schwierige Teil: die Queue */}
        <Section kicker="Der Kniff" title="2 · Das Herzstück: eine Warteschlange (Queue)">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
              Damit die Ringe sauber in der richtigen Reihenfolge abgearbeitet werden, merkt sich BFS
              entdeckte Knoten in einer <b>Queue</b> (Warteschlange). Eine Queue arbeitet nach dem
              <b> FIFO</b>-Prinzip (<i>First In, First Out</i>: wer zuerst hineinkommt, kommt zuerst
              wieder heraus) — genau wie eine Schlange an der Kasse.
            </p>
          </Card>
          <InfoBox title="FIFO vs. LIFO — ein einziger Unterschied">
            Tauscht man die Queue gegen einen <b>Stack</b> (Stapel, <i>LIFO</i> = <i>Last In, First
            Out</i>: das zuletzt Abgelegte kommt zuerst), läuft die Suche nicht mehr in die Breite,
            sondern in die <b>Tiefe</b> (das ist DFS — Thema der nächsten Vorlesung). Die Datenstruktur
            allein bestimmt das Verhalten.
          </InfoBox>
          <VisQueueVsStack />
        </Section>

        {/* 3 — Varianten / Darstellung */}
        <Section kicker="Grundlage" title="3 · Wie der Graph gespeichert wird">
          <Card style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: 0 }}>
              BFS greift ständig auf die Nachbarn eines Knotens zu (<code>Adj[u]</code> = „die zu
              <code> u</code> benachbarten Knoten"). Wie schnell das geht, hängt von der Darstellung
              ab. Es gibt zwei Standard-Varianten:
            </p>
          </Card>
          <MethodRow color={C.accent} name="Adjazenzliste" formula="Adj[i] = { j | (i,j) ∈ E }"
            note="Pro Knoten eine Liste seiner Nachbarn. Platz Θ(|V|+|E|) — sparsam bei wenigen Kanten. BFS verwendet diese Darstellung." />
          <MethodRow color={C.accent2} name="Adjazenzmatrix" formula="aᵢⱼ = 1 ⇔ (i,j) ∈ E"
            note="Eine |V|×|V|-Tabelle aus 0/1. Platz Θ(|V|²) — verschwenderisch bei wenigen Kanten, aber Nachbarschaftstest in O(1)." />
          <div style={{ height: 20 }} />
          <VisRepresentation />
        </Section>

        {/* 4 — Detail: was die Knoten-Attribute bedeuten */}
        <Section kicker="Detail" title="4 · Die drei Markierungen pro Knoten">
          <Card>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, marginTop: 0 }}>
              BFS hängt an jeden Knoten drei Informationen. Wenn du diese verstehst, verstehst du den
              ganzen Algorithmus:
            </p>
            <MethodRow color={C.accent} name="color (Farbe)" formula="white / gray / black"
              note="Zustand: weiß = noch nicht entdeckt, grau = entdeckt und in der Queue, schwarz = vollständig abgearbeitet (alle Nachbarn gesehen)." />
            <MethodRow color={C.gold} name="d (distance)" formula="v.d = u.d + 1"
              note="Distanz zum Start in Anzahl Kanten. Wird beim Entdecken gesetzt: ein Schritt mehr als der entdeckende Knoten u. Genau das ist der kürzeste Weg." />
            <MethodRow color={C.accent2} name="π (Pi, parent)" formula="v.π = u"
              note="Der Vorgänger, von dem aus v entdeckt wurde. Alle π-Zeiger zusammen bilden den BFS-Baum (im Graphen oben violett markiert) — er kodiert die kürzesten Wege." />
          </Card>
          <InfoBox title="Warum reichen drei Farben?">
            Die Farben verhindern, dass ein Knoten <b>doppelt</b> in die Queue kommt. Nur weiße Knoten
            werden entdeckt; sobald ein Knoten grau ist, wird er ignoriert. Ohne diese Markierung würde
            BFS bei Zyklen (Kreisen im Graphen) endlos im Kreis laufen.
          </InfoBox>
        </Section>

        {/* 5 — Analyse */}
        <Section kicker="Analyse" title="5 · Laufzeit: O(|V| + |E|)">
          <Card>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, marginTop: 0 }}>
              Die Laufzeit setzt sich aus drei Teilen zusammen. <code>O(·)</code> (Groß-O) heißt
              „höchstens in dieser Größenordnung" — eine obere Schranke für den Aufwand:
            </p>
            <MethodRow color={C.dim} name="Initialisierung" formula="O(|V|)"
              note="Jeder der |V| Knoten wird einmal auf weiß / d=∞ / π=nil gesetzt." />
            <MethodRow color={C.accent} name="En-/Dequeue" formula="O(|V|)"
              note="Jeder Knoten wird höchstens einmal in die Queue gelegt und einmal entnommen (dank der Farben)." />
            <MethodRow color={C.accent2} name="Nachbar-Durchläufe" formula="O(|E|)"
              note="Die foreach-Schleife über Adj[u] berührt jede Kante insgesamt nur konstant oft (im ungerichteten Graphen zweimal: von jedem Endknoten aus)." />
            <div style={{
              marginTop: 16, background: C.bg, border: `1px solid ${C.accent}`, borderRadius: 10,
              padding: "14px 16px", textAlign: "center", fontSize: 16,
            }}>
              <code style={{ color: C.accent, fontWeight: 700 }}>
                O(|V|) + O(|V|) + O(|E|) = O(|V| + |E|)
              </code>
            </div>
          </Card>
          <InfoBox title={'Was bedeutet „lineare Laufzeit" hier?'}>
            <code>O(|V|+|E|)</code> ist <b>linear in der Größe des Graphen</b> (Knoten plus Kanten
            zusammen). Schneller geht es prinzipiell nicht — man muss jeden Knoten und jede Kante
            mindestens einmal anschauen, um den Graphen überhaupt zu erkunden. BFS ist also optimal.
          </InfoBox>
          <Card style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>Korrektheit (Idee)</div>
            <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0, color: C.dim }}>
              Man kann beweisen: Wenn ein Knoten <code>v</code> zum ersten Mal grau wird, ist
              <code> v.d</code> bereits die <b>kürzeste</b> Distanz zum Start. Der Grund ist die
              FIFO-Reihenfolge: Knoten verlassen die Queue strikt nach steigender Distanz
              (erst alle mit d=0, dann d=1, …). Eine spätere, kürzere Entdeckung ist damit ausgeschlossen.
            </p>
          </Card>
        </Section>

        {/* 6 — Zusammenfassung */}
        <Section kicker="Auf einen Blick" title="6 · Das Wichtigste in drei Sätzen">
          <Card style={{ background: "rgba(125,211,252,0.07)", border: `1px solid rgba(125,211,252,0.4)` }}>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15.5, lineHeight: 1.9 }}>
              <li>
                BFS breitet sich von einem Startknoten <b>Ring für Ring</b> (nach Distanz) aus und
                findet so für jeden Knoten den kürzesten Weg in <b>Kantenanzahl</b>.
              </li>
              <li>
                Das Herzstück ist eine <b>Queue</b> (FIFO); drei Farben (weiß/grau/schwarz) verhindern
                doppelte Besuche, <code>d</code> speichert die Distanz, <code>π</code> baut den BFS-Baum.
              </li>
              <li>
                Die Laufzeit ist <b><code>O(|V| + |E|)</code></b> — linear und damit optimal, weil jeder
                Knoten und jede Kante nur konstant oft angefasst wird.
              </li>
            </ol>
          </Card>
        </Section>

        {/* 7 — Glossar */}
        <Section kicker="Nachschlagen" title="7 · Glossar — alle Begriffe & Symbole">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            <GlossEntry term="Graph G = (V, E)" def="Knotenmenge V und Kantenmenge E. Modelliert Verbindungen zwischen Objekten." />
            <GlossEntry term="V / |V|" def="Knotenmenge (vertices) bzw. ihre Anzahl." />
            <GlossEntry term="E / |E|" def="Kantenmenge (edges) bzw. ihre Anzahl." />
            <GlossEntry term="Adj[u]" def="Adjazenzliste: die zu Knoten u benachbarten Knoten." />
            <GlossEntry term="adjazent" def="Zwei Knoten sind adjazent, wenn eine Kante sie verbindet." />
            <GlossEntry term="Adjazenzmatrix aᵢⱼ" def="|V|×|V|-Tabelle; aᵢⱼ=1 genau dann, wenn Kante (i,j) existiert." />
            <GlossEntry term="deg(u) / Grad" def="Anzahl der Kanten an Knoten u, also |Adj[u]|." />
            <GlossEntry term="BFS" def="Breitensuche (breadth-first search): erkundet den Graphen in die Breite." />
            <GlossEntry term="Queue (FIFO)" def="Warteschlange. First In, First Out — zuerst Hinzugefügtes wird zuerst entnommen." />
            <GlossEntry term="Stack (LIFO)" def="Stapel. Last In, First Out — zuletzt Abgelegtes wird zuerst entnommen. Basis von DFS." />
            <GlossEntry term="Enqueue / Dequeue" def="Element hinten an die Queue anhängen / vorne entnehmen." />
            <GlossEntry term="color (weiß/grau/schwarz)" def="Knotenzustand: unentdeckt / entdeckt&in Queue / fertig." />
            <GlossEntry term="d (distance)" def="Kürzeste Distanz zum Start in Anzahl Kanten; v.d = u.d + 1." />
            <GlossEntry term="π (Pi, parent)" def="Vorgängerknoten; alle π-Zeiger bilden den BFS-Baum." />
            <GlossEntry term="BFS-Baum" def="Baum aus den π-Kanten; kodiert die kürzesten Wege ab s." />
            <GlossEntry term="Startknoten s" def="Knoten, von dem die Suche ausgeht (d[s]=0)." />
            <GlossEntry term="O(·) (Groß-O)" def="Obere Schranke der Laufzeit: höchstens in dieser Größenordnung." />
            <GlossEntry term="Θ(·) (Theta)" def="Genau diese Größenordnung — obere und untere Schranke zugleich." />
            <GlossEntry term="O(|V|+|E|)" def="Lineare Laufzeit von BFS — optimal für Graph-Durchläufe." />
            <GlossEntry term="∞ (unendlich)" def="Anfangswert von d für noch nicht erreichte Knoten." />
          </div>
        </Section>
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.7 }}>
          Kapitel 13 · Graphen + BFS · Theoretische Informatik II<br />
          Prof. Dr. Veronika Lesch · DHBW Mosbach
        </div>
      </footer>
    </div>
  );
}