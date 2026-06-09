import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   Flip-Flops, Zähler & Zustandsautomaten — Lern-Trainer
   Digitaltechnik · Prof. Scherzer · DHBW Bad Mergentheim
   Self-contained, keine externen Libraries, alle Styles via C-Objekt.
   ========================================================================= */

const C = {
  bg: "#0b1220",
  panel: "#141d2e",
  panel2: "#0f1726",
  border: "#2a3850",
  text: "#e6edf6",
  dim: "#93a4bd",
  faint: "#5d6f8a",
  accent: "#2dd4bf", // türkis  -> "logisch 1" / aktiv
  accent2: "#818cf8", // indigo -> Steuerung / Sekundär
  low: "#3b4a64", // "logisch 0"
  warn: "#fbbf24",
  danger: "#f87171",
  ok: "#34d399",
  font: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/* ---------- Reveal-Hook (Fade-in beim Scrollen) ---------- */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          o.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, shown];
}

/* ---------- Basis-Bausteine ---------- */
function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "44px 22px",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(18px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      {kicker && (
        <div
          style={{
            color: C.accent,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {kicker}
        </div>
      )}
      {title && (
        <h2 style={{ fontSize: 27, margin: "0 0 18px", color: C.text, lineHeight: 1.2 }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Tag({ children, color = C.accent }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        color,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        borderRadius: 999,
        padding: "3px 10px",
        marginRight: 6,
        marginBottom: 6,
        fontFamily: C.mono,
      }}
    >
      {children}
    </span>
  );
}

function InfoBox({ kind = "warum", title, children }) {
  const map = {
    warum: { c: C.accent2, label: "WARUM?" },
    merke: { c: C.accent, label: "MERKE" },
    achtung: { c: C.warn, label: "ACHTUNG" },
    klausur: { c: C.danger, label: "KLAUSUR-FALLE" },
  };
  const m = map[kind] || map.warum;
  return (
    <div
      style={{
        borderLeft: `3px solid ${m.c}`,
        background: `${m.c}12`,
        borderRadius: "0 10px 10px 0",
        padding: "14px 16px",
        margin: "14px 0",
      }}
    >
      <div style={{ color: m.c, fontWeight: 800, fontSize: 12, letterSpacing: 1, marginBottom: 6 }}>
        {m.label}
        {title ? ` · ${title}` : ""}
      </div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ color: C.dim, fontSize: 15.5, lineHeight: 1.72, margin: "0 0 14px" }}>{children}</p>;
}

function Em({ children }) {
  return <span style={{ color: C.text, fontWeight: 600 }}>{children}</span>;
}

function Code({ children }) {
  return (
    <span style={{ fontFamily: C.mono, color: C.accent, background: `${C.accent}12`, padding: "1px 6px", borderRadius: 5 }}>
      {children}
    </span>
  );
}

const btn = {
  background: C.accent,
  color: "#06231f",
  border: "none",
  borderRadius: 9,
  padding: "9px 16px",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: C.font,
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: C.font,
};

/* ---------- Bit-Lampe ---------- */
function Bit({ v, label, big }) {
  const on = v === 1;
  const size = big ? 52 : 34;
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: size,
          height: size,
          lineHeight: `${size}px`,
          borderRadius: 10,
          fontFamily: C.mono,
          fontWeight: 800,
          fontSize: big ? 24 : 16,
          color: on ? "#06231f" : C.dim,
          background: on ? C.accent : C.low,
          border: `1px solid ${on ? C.accent : C.border}`,
          boxShadow: on ? `0 0 16px ${C.accent}66` : "none",
          transition: "all .18s ease",
          margin: "0 auto",
        }}
      >
        {v}
      </div>
      {label && <div style={{ color: C.faint, fontSize: 12, marginTop: 5, fontFamily: C.mono }}>{label}</div>}
    </div>
  );
}

/* ---------- Wahrheits-/Funktionstabelle ---------- */
function Truth({ head, rows, note }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: C.mono, fontSize: 14 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "center",
                  padding: "9px 10px",
                  color: C.accent,
                  borderBottom: `2px solid ${C.border}`,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    textAlign: "center",
                    padding: "8px 10px",
                    borderBottom: `1px solid ${C.border}55`,
                    color:
                      typeof cell === "object"
                        ? cell.c
                        : cell === "1"
                        ? C.accent
                        : cell === "0"
                        ? C.dim
                        : C.text,
                    fontWeight: typeof cell === "object" ? 700 : 600,
                  }}
                >
                  {typeof cell === "object" ? cell.t : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <div style={{ color: C.faint, fontSize: 12.5, marginTop: 8, lineHeight: 1.5 }}>{note}</div>}
    </div>
  );
}

/* =========================================================================
   INTERAKTIV 1 — Flip-Flop-Simulator mit Impulsdiagramm
   ========================================================================= */

const FF_DEFS = {
  RS: { name: "RS-Flip-Flop", ins: ["S", "R"], color: C.accent2 },
  D: { name: "D-Flip-Flop", ins: ["D"], color: C.accent },
  JK: { name: "JK-Flip-Flop", ins: ["J", "K"], color: C.accent2 },
  T: { name: "T-Flip-Flop", ins: ["T"], color: C.accent },
};

function nextQ(type, q, ins) {
  if (type === "RS") {
    const { S, R } = ins;
    if (S === 1 && R === 0) return { q: 1 };
    if (S === 0 && R === 1) return { q: 0 };
    if (S === 0 && R === 0) return { q };
    return { q, verboten: true }; // S=R=1
  }
  if (type === "D") return { q: ins.D };
  if (type === "JK") {
    const { J, K } = ins;
    if (J === 0 && K === 0) return { q };
    if (J === 1 && K === 0) return { q: 1 };
    if (J === 0 && K === 1) return { q: 0 };
    return { q: q ? 0 : 1 }; // J=K=1 toggle
  }
  // T
  return { q: ins.T ? (q ? 0 : 1) : q };
}

function Waveform({ values, color, stepW, yH, yL }) {
  let d = "";
  values.forEach((v, i) => {
    const y = v ? yH : yL;
    const x0 = i * stepW;
    const x1 = x0 + stepW;
    if (i === 0) d += `M ${x0} ${y} `;
    else {
      const yp = values[i - 1] ? yH : yL;
      if (yp !== y) d += `L ${x0} ${y} `;
    }
    d += `L ${x1} ${y} `;
  });
  return <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" />;
}

function FlipFlopSim() {
  const [type, setType] = useState("D");
  const def = FF_DEFS[type];
  const [pending, setPending] = useState(() => Object.fromEntries(def.ins.map((k) => [k, 0])));
  const [q, setQ] = useState(0);
  const [cols, setCols] = useState([]); // {ins, q, verboten}

  const switchType = (t) => {
    setType(t);
    setPending(Object.fromEntries(FF_DEFS[t].ins.map((k) => [k, 0])));
    setQ(0);
    setCols([]);
  };

  const toggleIn = (k) => setPending((p) => ({ ...p, [k]: p[k] ? 0 : 1 }));

  const tick = () => {
    const res = nextQ(type, q, pending);
    setQ(res.q);
    setCols((cs) => [...cs, { ins: { ...pending }, q: res.q, verboten: !!res.verboten }].slice(-14));
  };

  const reset = () => {
    setQ(0);
    setCols([]);
  };

  const lastVerboten = cols.length && cols[cols.length - 1].verboten;
  const qbar = q ? 0 : 1;

  // Diagramm-Geometrie
  const stepW = 46;
  const rowH = 34;
  const labelW = 34;
  const rows = [...def.ins, "Q"];
  const svgW = labelW + Math.max(cols.length, 1) * stepW + 8;
  const svgH = rows.length * rowH + 30 + 8;

  const rowValues = (sig) => (sig === "Q" ? cols.map((c) => c.q) : cols.map((c) => c.ins[sig]));

  return (
    <Card>
      {/* Typ-Auswahl */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.keys(FF_DEFS).map((t) => (
          <button
            key={t}
            onClick={() => switchType(t)}
            style={{
              ...btnGhost,
              padding: "7px 14px",
              borderColor: type === t ? C.accent : C.border,
              background: type === t ? `${C.accent}1c` : "transparent",
              color: type === t ? C.accent : C.dim,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center" }}>
        {/* Eingänge */}
        <div>
          <div style={{ color: C.faint, fontSize: 12, marginBottom: 8, fontFamily: C.mono }}>EINGÄNGE (vor der Flanke setzen)</div>
          <div style={{ display: "flex", gap: 12 }}>
            {def.ins.map((k) => (
              <button key={k} onClick={() => toggleIn(k)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Bit v={pending[k]} label={k} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 26, color: C.faint }}>→</div>

        {/* Ausgang */}
        <div>
          <div style={{ color: C.faint, fontSize: 12, marginBottom: 8, fontFamily: C.mono }}>AUSGANG</div>
          <div style={{ display: "flex", gap: 12 }}>
            <Bit v={q} label="Q" big />
            <Bit v={qbar} label="¬Q" big />
          </div>
        </div>

        {/* Steuerung */}
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={tick} style={btn}>↑ Taktflanke</button>
          <button onClick={reset} style={btnGhost}>Zurücksetzen</button>
        </div>
      </div>

      {lastVerboten && (
        <div style={{ color: C.danger, fontSize: 13.5, marginTop: 12, fontWeight: 600 }}>
          ⚠ Verbotener Zustand: S = R = 1. Beim NOR-RS-FF werden dann <Code>Q = ¬Q = 0</Code> — die Speicherfunktion bricht zusammen.
        </div>
      )}

      {/* Impulsdiagramm */}
      <div style={{ marginTop: 18 }}>
        <div style={{ color: C.faint, fontSize: 12, marginBottom: 6, fontFamily: C.mono }}>
          IMPULSDIAGRAMM (jede senkrechte Linie = aktive Taktflanke)
        </div>
        {cols.length === 0 ? (
          <div style={{ color: C.faint, fontSize: 14, padding: "20px 0", fontStyle: "italic" }}>
            Setze die Eingänge und klicke „↑ Taktflanke“, um den Verlauf zu sehen.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <svg width={svgW} height={svgH} style={{ display: "block" }}>
              {/* Flanken-Hilfslinien */}
              {cols.map((_, i) => (
                <line
                  key={"g" + i}
                  x1={labelW + i * stepW}
                  y1={20}
                  x2={labelW + i * stepW}
                  y2={svgH - 8}
                  stroke={C.accent2}
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.5"
                />
              ))}
              {/* Spaltennummern */}
              {cols.map((_, i) => (
                <text key={"n" + i} x={labelW + i * stepW + stepW / 2} y={14} fill={C.faint} fontSize="11" textAnchor="middle" fontFamily={C.mono}>
                  {i + 1}
                </text>
              ))}
              {/* Signalreihen */}
              {rows.map((sig, ri) => {
                const top = 24 + ri * rowH;
                const yH = top + 6;
                const yL = top + 24;
                const isQ = sig === "Q";
                return (
                  <g key={sig} transform={`translate(${labelW},0)`}>
                    <text x={-labelW + 2} y={(yH + yL) / 2 + 4} fill={isQ ? C.accent : C.text} fontSize="13" fontWeight="700" fontFamily={C.mono}>
                      {sig}
                    </text>
                    <Waveform values={rowValues(sig)} color={isQ ? C.accent : FF_DEFS[type].color} stepW={stepW} yH={yH} yL={yL} />
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
}

/* =========================================================================
   INTERAKTIV 2 — 3-Bit-Zähler: asynchron (Ripple) vs. synchron
   ========================================================================= */
function CounterSim() {
  const [mode, setMode] = useState("sync"); // sync | async
  const [count, setCount] = useState(0);
  const [display, setDisplay] = useState([0, 0, 0]); // [Q2,Q1,Q0]
  const [rippling, setRippling] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const bitsOf = (n) => [(n >> 2) & 1, (n >> 1) & 1, n & 1];

  const step = () => {
    if (rippling) return;
    const next = (count + 1) % 8;
    const old = count;
    setCount(next);

    if (mode === "sync") {
      setDisplay(bitsOf(next));
      return;
    }

    // ASYNCHRON: Ripple-Kaskade von Bit0 aufwärts sichtbar machen.
    // Beim Inkrement kippen alle "trailing ones" + das erste 0-Bit – nacheinander.
    clearTimers();
    setRippling(true);
    let cur = old;
    const seq = [];
    // LSB (Bit0) kippt immer
    for (let b = 0; b <= 2; b++) {
      const mask = 1 << b;
      cur = cur ^ mask;
      seq.push(cur & 7);
      if ((old & mask) === 0) break; // dieses Bit war 0 -> Kaskade endet
    }
    seq.forEach((state, idx) => {
      const t = setTimeout(() => {
        setDisplay(bitsOf(state));
        if (idx === seq.length - 1) setRippling(false);
      }, 180 * (idx + 1));
      timers.current.push(t);
    });
  };

  const reset = () => {
    clearTimers();
    setRippling(false);
    setCount(0);
    setDisplay([0, 0, 0]);
  };

  const dec = display[0] * 4 + display[1] * 2 + display[2];

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          ["sync", "Synchron"],
          ["async", "Asynchron (Ripple)"],
        ].map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              reset();
            }}
            style={{
              ...btnGhost,
              borderColor: mode === m ? C.accent : C.border,
              background: mode === m ? `${C.accent}1c` : "transparent",
              color: mode === m ? C.accent : C.dim,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <Bit v={display[0]} label="Q2 (4)" big />
          <Bit v={display[1]} label="Q1 (2)" big />
          <Bit v={display[2]} label="Q0 (1)" big />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: C.mono, fontSize: 44, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{dec}</div>
          <div style={{ color: C.faint, fontSize: 12, fontFamily: C.mono }}>dezimal</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={step} style={{ ...btn, opacity: rippling ? 0.5 : 1 }} disabled={rippling}>
            ↑ Taktimpuls
          </button>
          <button onClick={reset} style={btnGhost}>Zurücksetzen</button>
        </div>
      </div>

      {mode === "async" && rippling && (
        <div style={{ color: C.warn, fontSize: 13.5, marginTop: 14, fontWeight: 600, fontFamily: C.mono }}>
          ⟳ Ripple läuft … Bit0 → Bit1 → Bit2. Die Zwischenwerte sind kurzzeitig falsch (Glitch).
        </div>
      )}
      <InfoBox kind={mode === "async" ? "achtung" : "merke"} title={mode === "async" ? "Ripple-Effekt" : "Gleichzeitigkeit"}>
        {mode === "async" ? (
          <>
            Jedes FF taktet das nächste. Beim Übergang z. B. 3 → 4 (<Code>011 → 100</Code>) kippt erst Bit0, dann ausgelöst Bit1, dann
            Bit2 — die Schaltung läuft kurz durch <Code>010</Code> und <Code>000</Code>. Diese <Em>Laufzeit-Verzögerung</Em> erzeugt
            kurzzeitige Falschwerte. Deshalb in der Praxis fast nur noch synchron.
          </>
        ) : (
          <>
            Alle FFs hängen am <Em>selben Takt</Em> und kippen zur gleichen Flanke gleichzeitig. Der Zählerstand ist nach der Flanke
            sofort korrekt — keine Glitches. Realisiert als <Em>synchroner Automat</Em> (Medwedjew: Ausgang = Zustandsvektor Q).
          </>
        )}
      </InfoBox>
    </Card>
  );
}

/* =========================================================================
   INTERAKTIV 3 — Zustandsautomat-Explorer (Moore vs. Mealy)
   ========================================================================= */
const FSM = {
  moore: {
    title: "Moore-Automat — Modulo-3-Zähler",
    desc: "Ausgang hängt nur vom Zustand ab. Eingabe x = 1 zählt weiter, x = 0 hält.",
    nodes: [
      { id: 0, label: "Z0", out: "0", x: 90, y: 90 },
      { id: 1, label: "Z1", out: "1", x: 300, y: 60 },
      { id: 2, label: "Z2", out: "2", x: 240, y: 230 },
    ],
    start: 0,
    next: (s, x) => (x === 1 ? (s + 1) % 3 : s),
    output: (s) => String(s), // nur vom Zustand
    outputOnState: true,
  },
  mealy: {
    title: "Mealy-Automat — „11“-Erkenner",
    desc: "Ausgang hängt von Zustand UND Eingabe ab. Gibt 1 aus, sobald zwei Einsen aufeinanderfolgen.",
    nodes: [
      { id: 0, label: "A", out: "", x: 110, y: 150 },
      { id: 1, label: "B", out: "", x: 330, y: 150 },
    ],
    start: 0,
    next: (s, x) => (x === 1 ? 1 : 0),
    output: (s, x) => (s === 1 && x === 1 ? "1" : "0"),
    outputOnState: false,
  },
};

function FsmExplorer() {
  const [kind, setKind] = useState("moore");
  const fsm = FSM[kind];
  const [state, setState] = useState(fsm.start);
  const [log, setLog] = useState([]); // {x, out, to}
  const [flash, setFlash] = useState(null); // letzter Output

  const switchKind = (k) => {
    setKind(k);
    setState(FSM[k].start);
    setLog([]);
    setFlash(null);
  };

  const feed = (x) => {
    const out = fsm.output(state, x);
    const to = fsm.next(state, x);
    setLog((l) => [...l, { x, out, from: state, to }].slice(-10));
    setState(to);
    setFlash(out);
  };

  const reset = () => {
    setState(fsm.start);
    setLog([]);
    setFlash(null);
  };

  const node = (id) => fsm.nodes.find((n) => n.id === id);

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {[
          ["moore", "Moore"],
          ["mealy", "Mealy"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            style={{
              ...btnGhost,
              borderColor: kind === k ? C.accent2 : C.border,
              background: kind === k ? `${C.accent2}1c` : "transparent",
              color: kind === k ? C.accent2 : C.dim,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ color: C.text, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{fsm.title}</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>{fsm.desc}</div>

      {/* Zustandsdiagramm */}
      <div style={{ overflowX: "auto", background: C.panel2, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <svg width="440" height="300" style={{ display: "block", margin: "0 auto" }}>
          <defs>
            <marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C.faint} />
            </marker>
            <marker id="arrA" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={C.accent} />
            </marker>
          </defs>

          {kind === "moore" ? (
            <>
              {/* Übergänge */}
              {edge(node(0), node(1), "1", state === 0)}
              {edge(node(1), node(2), "1", state === 1)}
              {edge(node(2), node(0), "1", state === 2)}
              {selfLoop(node(0), "0", state === 0)}
              {selfLoop(node(1), "0", state === 1)}
              {selfLoop(node(2), "0", state === 2)}
            </>
          ) : (
            <>
              {edge(node(0), node(1), "1 / 0", state === 0, 1)}
              {edge(node(1), node(0), "0 / 0", state === 1, -1)}
              {selfLoop(node(0), "0 / 0", state === 0)}
              {selfLoop(node(1), "1 / 1", state === 1)}
            </>
          )}

          {/* Zustände */}
          {fsm.nodes.map((n) => {
            const active = n.id === state;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="30"
                  fill={active ? C.accent : C.panel}
                  stroke={active ? C.accent : C.border}
                  strokeWidth="2.5"
                  style={{ transition: "all .2s" }}
                />
                <text x={n.x} y={n.y + (fsm.outputOnState ? -2 : 5)} textAnchor="middle" fill={active ? "#06231f" : C.text} fontSize="16" fontWeight="800" fontFamily={C.mono}>
                  {n.label}
                </text>
                {fsm.outputOnState && (
                  <text x={n.x} y={n.y + 14} textAnchor="middle" fill={active ? "#06231f" : C.accent} fontSize="11" fontFamily={C.mono}>
                    y={n.out}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Eingabe */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <div style={{ color: C.faint, fontSize: 12, fontFamily: C.mono }}>EINGABE x:</div>
        <button onClick={() => feed(0)} style={btnGhost}>x = 0</button>
        <button onClick={() => feed(1)} style={btnGhost}>x = 1</button>
        <button onClick={reset} style={{ ...btnGhost, marginLeft: "auto" }}>Reset</button>
        {flash !== null && (
          <div style={{ fontFamily: C.mono, fontSize: 15 }}>
            <span style={{ color: C.faint }}>Ausgang y = </span>
            <span style={{ color: flash === "1" ? C.accent : C.dim, fontWeight: 800, fontSize: 20 }}>{flash}</span>
          </div>
        )}
      </div>

      {/* Verlauf */}
      {log.length > 0 && (
        <div style={{ marginTop: 14, fontFamily: C.mono, fontSize: 13, color: C.dim, lineHeight: 1.9 }}>
          {log.map((e, i) => (
            <span key={i}>
              {fsm.nodes.find((n) => n.id === e.from).label}
              <span style={{ color: C.accent2 }}> ─x={e.x}/y={e.out}→ </span>
              <span style={{ color: C.text }}>{fsm.nodes.find((n) => n.id === e.to).label}</span>
              {i < log.length - 1 ? "   " : ""}
            </span>
          ))}
        </div>
      )}

      <InfoBox kind="merke" title={kind === "moore" ? "Moore" : "Mealy"}>
        {kind === "moore" ? (
          <>
            Der Ausgang <Code>y</Code> steht <Em>im Zustandskreis</Em> — er hängt nur vom aktuellen Zustand ab. Stabiler Ausgang, aber
            eine Taktperiode „Verzögerung“. Sonderfall <Em>Medwedjew</Em>: y = Zustandsvektor Q direkt (kein Ausgangs-Schaltnetz).
          </>
        ) : (
          <>
            Der Ausgang <Code>x / y</Code> steht <Em>an der Kante</Em> — er hängt von Zustand <Em>und</Em> Eingabe ab. Reagiert
            schneller (gleiche Taktflanke), aber der Ausgang kann sich innerhalb einer Taktperiode ändern.
          </>
        )}
      </InfoBox>
    </Card>
  );
}

/* --- SVG-Kanten-Helfer für den FSM-Explorer --- */
function edge(a, b, label, active, bow = 0) {
  const r = 30;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Start-/Endpunkt am Kreisrand, mit kleinem Versatz für Hin-/Rückkante
  const ox = -uy * bow * 14;
  const oy = ux * bow * 14;
  const x1 = a.x + ux * r + ox;
  const y1 = a.y + uy * r + oy;
  const x2 = b.x - ux * r + ox;
  const y2 = b.y - uy * r + oy;
  const mx = (x1 + x2) / 2 - uy * bow * 26;
  const my = (y1 + y2) / 2 + ux * bow * 26;
  const col = active ? C.accent : C.faint;
  const d = bow ? `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <g>
      <path d={d} fill="none" stroke={col} strokeWidth={active ? 2.6 : 1.6} markerEnd={active ? "url(#arrA)" : "url(#arr)"} />
      <text x={mx} y={my - 5} textAnchor="middle" fill={col} fontSize="12.5" fontWeight="700" fontFamily={C.mono}>
        {label}
      </text>
    </g>
  );
}

function selfLoop(n, label, active) {
  const col = active ? C.accent : C.faint;
  const cx = n.x;
  const cy = n.y - 30;
  const d = `M ${cx - 12} ${cy} C ${cx - 34} ${cy - 40}, ${cx + 34} ${cy - 40}, ${cx + 12} ${cy}`;
  return (
    <g>
      <path d={d} fill="none" stroke={col} strokeWidth={active ? 2.4 : 1.5} markerEnd={active ? "url(#arrA)" : "url(#arr)"} />
      <text x={cx} y={cy - 30} textAnchor="middle" fill={col} fontSize="12" fontWeight="700" fontFamily={C.mono}>
        {label}
      </text>
    </g>
  );
}

/* =========================================================================
   HAUPTKOMPONENTE
   ========================================================================= */
export default function FlipFlopTrainer() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: C.font, color: C.text }}>
      {/* Hero */}
      <header
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "60px 22px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", gap: 6, marginBottom: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Tag>RS</Tag>
          <Tag color={C.accent2}>D</Tag>
          <Tag>JK</Tag>
          <Tag color={C.accent2}>T</Tag>
          <Tag color={C.warn}>Zähler</Tag>
          <Tag color={C.danger}>Automaten</Tag>
        </div>
        <h1 style={{ fontSize: 38, margin: "0 0 14px", lineHeight: 1.12, letterSpacing: -0.5 }}>
          Flip-Flops, Zähler &<br />
          <span style={{ color: C.accent }}>Zustandsautomaten</span>
        </h1>
        <p style={{ color: C.dim, fontSize: 17, lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
          Vom 1-Bit-Speicher zum getakteten Automaten — Schritt für Schritt aufgebaut, mit interaktivem Impulsdiagramm,
          Ripple-Zähler und Moore/Mealy-Explorer.
        </p>
      </header>

      {/* 1 — PROBLEM */}
      <Section kicker="Das Problem" title="Warum reicht ein Logikgatter nicht?">
        <P>
          Ein UND- oder ODER-Gatter ist <Em>kombinatorisch</Em>: Sein Ausgang hängt nur von den <Em>gerade jetzt</Em> anliegenden
          Eingängen ab. Nimmst du das Eingangssignal weg, vergisst es sofort alles. Für ein Rechenwerk brauchst du aber Bausteine,
          die sich etwas <Em>merken</Em> — Register, Zähler, Schieberegister.
        </P>
        <P>
          Eine <Em>sequenzielle Schaltung (Schaltwerk)</Em> hat genau diese Eigenschaft: ihr Ausgang hängt von den momentanen
          <Em> und</Em> von früheren Eingangsbelegungen ab, formal <Code>y = f(x, y)</Code> — der Ausgang wird auf sich selbst
          zurückgeführt. Der kleinste Baustein dafür ist das Flip-Flop.
        </P>
        <InfoBox kind="warum" title="Kombinatorisch vs. sequenziell">
          Kombinatorisch = „Funktion ohne Gedächtnis“. Sequenziell = „Funktion mit Gedächtnis“. Der Unterschied ist die
          <Em> Rückkopplung</Em> des Ausgangs auf den Eingang — daraus entsteht Speicherverhalten.
        </InfoBox>
      </Section>

      {/* 2 — GRUNDIDEE */}
      <Section kicker="Die Grundidee" title="Was ein Flip-Flop ausmacht">
        <P>
          Ein <Em>Flip-Flop (bistabile Kippstufe)</Em> ist die kleinste Speicherzelle: es speichert genau <Em>1 Bit</Em>. „Bistabil“
          heißt, es hat zwei stabile Zustände — <Code>Q = 1</Code> (gesetzt) und <Code>Q = 0</Code> (rückgesetzt). Meist gibt es
          zusätzlich den invertierten Ausgang <Code>¬Q</Code>, der immer das Gegenteil von Q ist.
        </P>
        <P>
          Der Name ist lautmalerisch — er stammt aus der Zeit, als man solche Speicher mit elektromagnetischen Relais baute (z. B. im
          Relaisrechner Z3). Das „Gedächtnis“ entsteht durch die Rückkopplung zweier über Kreuz verbundener Gatter.
        </P>

        <h3 style={{ color: C.text, fontSize: 18, margin: "22px 0 12px" }}>Klassifikation (so ordnet Scherzer ein)</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <Card style={{ padding: 16 }}>
            <Tag>ungesteuert</Tag> <span style={{ color: C.dim, fontSize: 14.5 }}>
              Basis-FF ohne Steuereingang — wertet die Dateneingänge <Em>ständig</Em> aus, arbeitet also <Em>asynchron</Em> (z. B. das RS-Basis-FF).
            </span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.accent2}>gesteuert</Tag> <span style={{ color: C.dim, fontSize: 14.5 }}>
              Wertet die Eingänge nur aus, wenn ein Steuersignal <Code>C</Code> (control / clock) einen bestimmten Wert oder eine bestimmte
              Flanke hat.
            </span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.warn}>zustandsgesteuert (statisch)</Tag> <span style={{ color: C.dim, fontSize: 14.5 }}>
              Übernimmt Werte, <Em>solange</Em> C = 1 ist (engl. <Em>Latch</Em>). Der Eingang reagiert auf den <Em>Pegel</Em>.
            </span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.danger}>flankengesteuert (dynamisch)</Tag> <span style={{ color: C.dim, fontSize: 14.5 }}>
              Übernimmt Werte nur im <Em>Moment der aktiven Flanke</Em>: 0→1 (positiv) oder 1→0 (negativ). Der Eingang reagiert auf die
              <Em> Änderung</Em>.
            </span>
          </Card>
        </div>
        <InfoBox kind="merke" title="statisch vs. dynamisch">
          „Statisch“ = reagiert auf den <Em>Zustand</Em> (Pegel) des Taktsignals. „Dynamisch“ = reagiert auf die <Em>Flanke</Em>
          (den Wechsel). Im Schaltzeichen markiert ein kleines Dreieck <Code>▷</Code> am C-Eingang die dynamische (flankengesteuerte)
          Variante. Ein <Em>Master-Slave-FF</Em> schaltet zwei Speicher hintereinander und übernimmt bei gegenläufigen Flanken —
          dadurch erscheint der Ausgang verzögert (retardiert).
        </InfoBox>
      </Section>

      {/* 3 — DIE VIER TYPEN */}
      <Section kicker="Die vier Typen" title="RS → D → JK → T">
        <P>
          Alle gebräuchlichen Flip-Flops bauen aufeinander auf. Das RS-FF ist die Wurzel; D, JK und T sind Beschaltungen bzw.
          Erweiterungen davon. Die <Em>charakteristische Tabelle</Em> beschreibt jeweils, was bei der aktiven Taktflanke passiert
          (<Code>Q</Code> = Zustand vorher, <Code>Q'</Code> = Zustand nachher).
        </P>

        {/* RS */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ color: C.accent2, fontSize: 19, margin: "18px 0 6px" }}>1 · RS-Flip-Flop (die Wurzel)</h3>
          <P>
            Zwei über Kreuz rückgekoppelte Gatter. <Code>S</Code> (Set) setzt Q auf 1, <Code>R</Code> (Reset) setzt Q auf 0. Sind beide 0,
            wird der alte Wert <Em>gehalten</Em> — das ist die Speicherung. Sind beide 1, entsteht der <Em>verbotene Zustand</Em>.
          </P>
          <Truth
            head={["S", "R", "Q'", "Bedeutung"]}
            rows={[
              ["0", "0", { t: "Q", c: C.text }, { t: "halten (speichern)", c: C.dim }],
              ["0", "1", "0", { t: "rücksetzen", c: C.dim }],
              ["1", "0", "1", { t: "setzen", c: C.dim }],
              ["1", "1", { t: "—", c: C.danger }, { t: "verboten", c: C.danger }],
            ]}
            note="Beim NOR-RS-FF liefert der Widerspruch S=R=1 an Q und ¬Q beide 0; beim NAND-RS-FF beide 1. In Steuerungen legt man bewusst Setz- oder Rücksetzvorrang fest."
          />
        </div>

        {/* D */}
        <div>
          <h3 style={{ color: C.accent, fontSize: 19, margin: "26px 0 6px" }}>2 · D-Flip-Flop (Data / Delay)</h3>
          <P>
            Ein RS-FF, bei dem R = ¬S erzwungen wird, sodass der verbotene Zustand nicht auftreten kann. Es hat nur den Dateneingang
            <Code>D</Code> und den Takt <Code>C</Code>. Bei der aktiven Flanke wird <Em>D direkt nach Q übernommen</Em> und dann bis zur
            nächsten Flanke gehalten („verzögert“ — daher Delay).
          </P>
          <Truth
            head={["C", "D", "Q'", "Bedeutung"]}
            rows={[
              [{ t: "↑", c: C.accent }, "0", "0", { t: "Übernahme von D", c: C.dim }],
              [{ t: "↑", c: C.accent }, "1", "1", { t: "Übernahme von D", c: C.dim }],
              [{ t: "0/1", c: C.faint }, "x", { t: "Q", c: C.text }, { t: "halten (keine Flanke)", c: C.dim }],
            ]}
            note="Anwendung: 1 Bit speichern bis zur nächsten Flanke; Synchronisieren paralleler Signale. Grundbaustein von Registern und Synchronzählern."
          />
        </div>

        {/* JK */}
        <div>
          <h3 style={{ color: C.accent2, fontSize: 19, margin: "26px 0 6px" }}>3 · JK-Flip-Flop</h3>
          <P>
            Baut auf dem RS-FF auf, beseitigt aber den verbotenen Zustand: <Code>J</Code> wirkt wie Set, <Code>K</Code> wie Reset — und
            der Fall <Code>J = K = 1</Code> ist <Em>erlaubt</Em> und bewirkt ein <Em>Umschalten (Toggle)</Em>. Damit ist das JK-FF der
            „universellste“ Typ.
          </P>
          <Truth
            head={["J", "K", "Q'", "Bedeutung"]}
            rows={[
              ["0", "0", { t: "Q", c: C.text }, { t: "halten", c: C.dim }],
              ["0", "1", "0", { t: "rücksetzen", c: C.dim }],
              ["1", "0", "1", { t: "setzen", c: C.dim }],
              ["1", "1", { t: "¬Q", c: C.accent }, { t: "umschalten (toggle)", c: C.dim }],
            ]}
            note="Als Master-Slave-FF gilt: in der Transparenzphase des Masters dürfen sich J und K nicht ändern. Deshalb heute meist flankengetriggert."
          />
        </div>

        {/* T */}
        <div>
          <h3 style={{ color: C.accent, fontSize: 19, margin: "26px 0 6px" }}>4 · T-Flip-Flop (Toggle)</h3>
          <P>
            Wechselt bei <Code>T = 1</Code> mit jeder aktiven Flanke seinen Zustand. Man erhält es aus einem JK-FF, indem man J und K
            verbindet (gemeinsamer T-Eingang), oder aus einem D-FF, indem man <Code>¬Q</Code> auf D zurückführt. Das T steht für
            <Em> Toggle</Em>, nicht für Takt.
          </P>
          <Truth
            head={["T", "Q'", "Bedeutung"]}
            rows={[
              ["0", { t: "Q", c: C.text }, { t: "halten", c: C.dim }],
              ["1", { t: "¬Q", c: C.accent }, { t: "umschalten", c: C.dim }],
            ]}
            note="Frequenzteiler: bei T=1 hat das Ausgangssignal die halbe Frequenz des Takts (÷2). Grundelement asynchroner Binärzähler und Frequenzteiler."
          />
        </div>

        <InfoBox kind="klausur" title="Die Verwandtschaft kennen">
          Typischer Prüfungseinstieg: „Wie baue ich aus einem JK-FF ein T-FF?“ → <Em>J = K = T</Em> verbinden. „Aus einem D-FF ein
          T-FF?“ → <Em>¬Q auf D zurückführen</Em>. „Aus RS ein D?“ → <Em>R = ¬S</Em> erzwingen. Diese drei Umbauten werden gern gefragt.
        </InfoBox>
      </Section>

      {/* 4 — INTERAKTIV: SIMULATOR */}
      <Section kicker="Interaktiv · Teil 1" title="Flip-Flop-Simulator mit Impulsdiagramm">
        <P>
          Wähle den Typ, setze die Eingänge, und löse die Taktflanke aus. Beobachte, wie sich <Code>Q</Code> verhält — und vergleiche es
          mit der charakteristischen Tabelle oben. Das Impulsdiagramm zeigt den zeitlichen Verlauf; jede gestrichelte Linie ist eine
          aktive Flanke.
        </P>
        <FlipFlopSim />
        <InfoBox kind="merke" title="Lesart des Impulsdiagramms">
          Q ändert sich <Em>nur</Em> an den gestrichelten Flankenlinien — dazwischen wird gehalten. Probier beim D-FF: D auf 1, Flanke →
          Q=1. D wieder auf 0 ohne Flanke → Q bleibt 1. Genau das ist „Speichern“.
        </InfoBox>
      </Section>

      {/* 5 — ZÄHLER */}
      <Section kicker="Anwendung · Zähler" title="Asynchron vs. synchron">
        <P>
          Die häufigste Anwendung von Flip-Flops: Zählschaltungen. Gezählt werden Impulse (z. B. von einer Lichtschranke) oder die
          regelmäßigen Impulse eines Taktgenerators. Mit <Code>n</Code> Flip-Flops zählt ein Dualzähler von 0 bis <Code>2ⁿ − 1</Code>.
          Es gibt zwei Bauarten — gleiche Zählfolge, aber grundverschiedenes Zeitverhalten.
        </P>
        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          <Card style={{ padding: 16 }}>
            <Tag color={C.warn}>asynchron (Ripple)</Tag>
            <span style={{ color: C.dim, fontSize: 14.5 }}>
              {" "}Nur das erste FF hängt am Takt; jedes weitere wird vom Ausgang des vorigen getaktet. Einfach & wenig Aufwand, aber die
              Zustandsänderung „rieselt“ durch die Kette → Laufzeit-Verzögerung und kurzzeitige Falschwerte.
            </span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.accent}>synchron</Tag>
            <span style={{ color: C.dim, fontSize: 14.5 }}>
              {" "}Alle FFs hängen am <Em>gemeinsamen</Em> Takt und kippen zur selben Flanke gleichzeitig. Entworfen als endlicher binärer
              Automat. Mehr Logik, dafür kein Ripple — der Standard in der Praxis.
            </span>
          </Card>
        </div>
        <CounterSim />
      </Section>

      {/* 6 — ZUSTANDSAUTOMATEN */}
      <Section kicker="Das große Bild" title="Zustandsautomaten: Moore & Mealy">
        <P>
          Ein synchrones Schaltwerk <Em>ist</Em> ein endlicher Automat: Die Flip-Flops speichern den <Em>Zustand</Em>, ein Schaltnetz
          berechnet aus Zustand und Eingabe den Folgezustand, ein weiteres berechnet den Ausgang. Wovon der Ausgang abhängt, definiert
          den Automatentyp.
        </P>
        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          <Card style={{ padding: 16 }}>
            <Tag color={C.accent}>Moore</Tag>
            <span style={{ color: C.dim, fontSize: 14.5 }}> Ausgang hängt <Em>nur vom Zustand</Em> ab. Ausgang stabil, aber eine Taktperiode „träger“.</span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.accent2}>Mealy</Tag>
            <span style={{ color: C.dim, fontSize: 14.5 }}> Ausgang hängt von <Em>Zustand und Eingabe</Em> ab. Reagiert schneller, kann sich aber innerhalb einer Taktperiode ändern.</span>
          </Card>
          <Card style={{ padding: 16 }}>
            <Tag color={C.warn}>Medwedjew</Tag>
            <span style={{ color: C.dim, fontSize: 14.5 }}> Sonderfall von Moore: Ausgang = Zustandsvektor Q <Em>direkt</Em> (kein Ausgangs-Schaltnetz). Ein einfacher Dualzähler ist genau das.</span>
          </Card>
        </div>
        <FsmExplorer />
      </Section>

      {/* 7 — ANREGUNGSTABELLE */}
      <Section kicker="Der Entwurfs-Schlüssel" title="Anregungstabelle: vom Zustand zur Beschaltung">
        <P>
          Beim Synchronzähler-Entwurf kennst du den gewünschten Übergang <Code>Qᵐ → Qᵐ⁺¹</Code> und musst rückwärts bestimmen, welche
          Eingangsbelegung das FF dazu bringt. Diese Tabelle liest man <Em>rückwärts</Em> zur charakteristischen Tabelle — die
          <Code> x</Code> sind „don't care“ (egal) und Gold wert bei der KV-Minimierung.
        </P>
        <Truth
          head={["Qᵐ", "Qᵐ⁺¹", "S", "R", "J", "K", "D", "T"]}
          rows={[
            ["0", "0", "0", { t: "x", c: C.warn }, "0", { t: "x", c: C.warn }, "0", "0"],
            ["0", "1", "1", "0", "1", { t: "x", c: C.warn }, "1", "1"],
            ["1", "0", "0", "1", { t: "x", c: C.warn }, "1", "0", "1"],
            ["1", "1", { t: "x", c: C.warn }, "0", { t: "x", c: C.warn }, "0", "1", "0"],
          ]}
          note="x = don't care. Beispiel JK, Übergang 0→1: J muss 1 sein, K ist egal (x) — denn bei J=1 setzt das FF unabhängig von K."
        />
        <InfoBox kind="klausur" title="So nutzt du sie">
          Für einen Synchronzähler: (1) Zählfolge als Zustandstabelle aufschreiben, (2) je FF und Bit den geforderten Übergang in dieser
          Tabelle nachschlagen, (3) die nötige Eingangsbelegung (mit den vielen <Code>x</Code>) ins KV-Diagramm eintragen, (4)
          minimieren → fertige Ansteuerlogik. Das JK-FF erzeugt durch die vielen don't-cares besonders einfache Gleichungen.
        </InfoBox>
      </Section>

      {/* 8 — ZUSAMMENFASSUNG */}
      <Section kicker="In einem Bild" title="Zusammenfassung">
        <Card>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              ["Flip-Flop", "Bistabile Kippstufe, kleinster Speicher = 1 Bit, mit Q und ¬Q. Erzeugt Speicherverhalten durch Rückkopplung."],
              ["RS", "Set/Reset, kann halten — aber S=R=1 ist verboten. Die Wurzel aller anderen Typen."],
              ["D", "Übernimmt D bei der Flanke (Delay). Kein verbotener Zustand. Basis von Registern."],
              ["JK", "Wie RS, aber J=K=1 = Toggle. Universellster Typ, ideal für Zählerentwurf (viele don't-cares)."],
              ["T", "Toggle bei T=1. Frequenzteiler ÷2. Aus JK (J=K=T) oder D (¬Q→D)."],
              ["Asynchron", "Ripple-Kette: einfach, aber Laufzeit-Glitches."],
              ["Synchron", "Gemeinsamer Takt: gleichzeitig, glitchfrei, Standard. = endlicher Automat."],
              ["Moore / Mealy / Medwedjew", "Ausgang aus Zustand / aus Zustand+Eingabe / = Zustand direkt."],
            ].map(([t, d], i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
                <div style={{ minWidth: 168, color: C.accent, fontWeight: 800, fontFamily: C.mono, fontSize: 14 }}>{t}</div>
                <div style={{ color: C.dim, fontSize: 14.5, lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* 9 — GLOSSAR */}
      <Section kicker="Nachschlagen" title="Glossar">
        <div style={{ display: "grid", gap: 10 }}>
          {[
            ["Bistabil", "Hat zwei stabile Zustände (0 und 1). Im Gegensatz zum Monoflop mit nur einem stabilen Zustand."],
            ["Kippstufe", "Anderer Name für Flip-Flop — eine Schaltung, die zwischen zwei Zuständen „umkippt“."],
            ["Taktflanke", "Der Wechsel des Taktsignals: steigend (0→1) oder fallend (1→0). Bei flankengesteuerten FFs der einzige Moment der Übernahme."],
            ["statisch / dynamisch", "Eingang reagiert auf den Pegel (statisch) bzw. auf die Flanke/Änderung (dynamisch)."],
            ["Latch", "Zustandsgesteuertes FF — transparent, solange C = 1 (Pegel-, nicht flankengesteuert)."],
            ["Master-Slave", "Zwei hintereinandergeschaltete Speicher; Übernahme bei gegenläufigen Flanken → retardierter (verzögerter) Ausgang."],
            ["Verbotener Zustand", "Beim RS-FF S=R=1: Widerspruch, Speicherfunktion bricht zusammen (NOR→00, NAND→11)."],
            ["Ripple", "„Rieseln“ der Zustandsänderung durch eine asynchrone FF-Kette → Laufzeitverzögerung & Glitches."],
            ["Zustandsvektor Q", "Die Gesamtheit aller FF-Ausgänge — beschreibt den aktuellen Zustand des Automaten."],
            ["Anregungstabelle", "Rückwärts gelesene charakteristische Tabelle: welche Eingänge erzwingen einen gewünschten Übergang Qᵐ→Qᵐ⁺¹."],
            ["don't care (x)", "Eingang, dessen Wert für den gewünschten Übergang egal ist — vereinfacht die KV-Minimierung."],
          ].map(([t, d], i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}55`, paddingBottom: 10 }}>
              <span style={{ color: C.accent, fontWeight: 800, fontFamily: C.mono, fontSize: 14.5 }}>{t}</span>
              <span style={{ color: C.dim, fontSize: 14.5, lineHeight: 1.6 }}> — {d}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px 22px 60px",
          color: C.faint,
          fontSize: 13,
          borderTop: `1px solid ${C.border}`,
          maxWidth: 920,
          margin: "20px auto 0",
        }}
      >
        Digitaltechnik-Lerntrainer · Flip-Flops, Zähler & Zustandsautomaten
        <br />
        Prof. Scherzer · DHBW Bad Mergentheim
      </footer>
    </div>
  );
}
