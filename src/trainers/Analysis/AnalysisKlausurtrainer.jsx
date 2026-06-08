import React, { useState, useEffect, useRef } from "react";

// ===================================================================
//  Analysis Klausurtrainer (Gesamt-Trainer)
//  Prof. Dr. Veronika Lesch, DHBW Mosbach
//  INF23 Haupt-/Nachklausur + INF24 Hauptklausur
//  Alle Aufgabentypen, jeweils an einer echten Klausuraufgabe
//  Schritt fuer Schritt durchgerechnet.
// ===================================================================

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#3b82f6",   // Marineblau - primaer: Methode/aktiver Loesungsschritt
  accent2: "#22d3ee",  // Cyan - sekundaer: Konzept-Einschuebe, Varianten
  good: "#86efac",     // gruen - korrektes Zwischenergebnis / Endergebnis
  warn: "#fca5a5",     // rot - typische Falle / Fehler
  gold: "#fcd34d",     // gelb - Highlight des aktuellen Schritts
};

// ===================================================================
//  PFLICHT-BAUSTEINE
// ===================================================================
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .6s ease, transform .6s ease",
        marginBottom: 64,
      }}
    >
      {kicker && (
        <div style={{ color: C.accent, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          {kicker}
        </div>
      )}
      <h2 style={{ fontSize: 28, margin: "0 0 18px", fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{title}</h2>
      <div style={{ color: C.dim, fontSize: 16, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: color, fontWeight: 600 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: `${C.accent2}12`, border: `1px solid ${C.accent2}44`, borderRadius: 14,
      padding: "16px 20px", margin: "18px 0", fontSize: 15, color: C.text, lineHeight: 1.7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: C.accent2, marginBottom: 8 }}>
        <span aria-hidden style={{ fontSize: 16 }}>{"💡"}</span> {title}
      </div>
      <div style={{ color: C.dim }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div>
      <div style={{ fontWeight: 700, color: C.accent, fontSize: 14, fontFamily: "ui-monospace, monospace" }}>{term}</div>
      <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.55, marginTop: 2 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{ width: 4, alignSelf: "stretch", background: color, borderRadius: 4 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.text }}>{name}</span>
          <code style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 7, padding: "3px 9px", color: color, fontSize: 13 }}>{formula}</code>
        </div>
        <div style={{ fontSize: 14, color: C.dim, marginTop: 6, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

const btn = {
  background: C.accent, color: "#031733", border: "none", borderRadius: 10,
  padding: "9px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10,
  padding: "9px 14px", fontWeight: 600, fontSize: 14, cursor: "pointer",
};

// ===================================================================
//  ZUSAETZLICHE PFLICHT-BAUSTEINE
// ===================================================================

// Frac: echter Bruch (Zaehler ueber Nenner mit Trennstrich).
function Frac({ num, den }) {
  return (
    <span style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center",
      verticalAlign: "middle", margin: "0 4px", fontFamily: "ui-monospace, monospace",
      fontSize: "0.95em", lineHeight: 1.05,
    }}>
      <span style={{ padding: "0 6px 1px" }}>{num}</span>
      <span style={{ borderTop: "1.4px solid currentColor", padding: "1px 6px 0", width: "100%", textAlign: "center" }}>{den}</span>
    </span>
  );
}

// LoesungsStepper - das Herzstueck: animierter Schritt-fuer-Schritt-Loeser.
function LösungsStepper({ aufgabe, quelle, schritte }) {
  const [i, setI] = useState(1);          // Anzahl der eingeblendeten Schritte
  const [playing, setPlaying] = useState(false);
  const total = schritte.length;

  useEffect(() => {
    if (!playing) return;
    if (i >= total) { setPlaying(false); return; }
    const t = setTimeout(() => setI((v) => Math.min(v + 1, total)), 1600);
    return () => clearTimeout(t);
  }, [playing, i, total]);

  const active = i - 1; // Index des aktiven (zuletzt gezeigten) Schritts

  return (
    <Card style={{ background: C.panel2 }}>
      {/* Aufgabe + Quelle */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <Tag color={C.accent2}>{quelle}</Tag>
        <span style={{ fontSize: 12, color: C.dim }}>Schritt {Math.min(i, total)} / {total}</span>
      </div>
      <div style={{
        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
        padding: "14px 16px", color: C.text, fontSize: 17, lineHeight: 1.7, marginBottom: 18,
      }}>
        <span style={{ color: C.dim, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginRight: 8 }}>Aufgabe</span>
        {aufgabe}
      </div>

      {/* Schritte */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {schritte.map((s, idx) => {
          const visible = idx < i;
          const isActive = idx === active;
          const isResult = idx === total - 1;
          const borderCol = isActive ? (isResult ? C.good : C.gold) : C.line;
          return (
            <div
              key={idx}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(.96)",
                transition: "opacity .35s ease, transform .35s ease, border-color .3s ease, box-shadow .3s ease",
                pointerEvents: visible ? "auto" : "none",
                height: visible ? "auto" : 0,
                overflow: "hidden",
                animation: isActive && visible ? "popStep .35s ease" : "none",
                background: isActive ? (isResult ? `${C.good}12` : `${C.gold}10`) : C.panel,
                border: `1px solid ${visible ? borderCol : "transparent"}`,
                boxShadow: isActive ? `0 0 0 1px ${borderCol}55` : "none",
                borderRadius: 12,
                padding: visible ? "13px 16px" : "0 16px",
              }}
            >
              <div style={{
                fontFamily: "ui-monospace, monospace", fontSize: 16.5,
                color: isResult && isActive ? C.good : C.text, lineHeight: 1.6,
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 6,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? borderCol : C.line, color: isActive ? "#0a0d14" : C.dim,
                }}>{idx + 1}</span>
                <span>{s.formel}</span>
              </div>
              <div style={{ fontSize: 13.5, color: C.dim, marginTop: 7, lineHeight: 1.6, paddingLeft: 30 }}>
                {s.warum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Steuerung */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
        <button style={btnGhost} onClick={() => setI((v) => Math.max(1, v - 1))} aria-label="Schritt zurueck">|◀</button>
        <button style={btn} onClick={() => { if (i >= total) { setI(1); setPlaying(true); } else setPlaying((p) => !p); }}>
          {playing ? "⏸ Pause" : (i >= total ? "↺ Nochmal" : "▶ Auto-Play")}
        </button>
        <button style={btnGhost} onClick={() => { setPlaying(false); setI((v) => Math.min(total, v + 1)); }} aria-label="Schritt vor">▶|</button>
        <button style={btnGhost} onClick={() => { setPlaying(false); setI(1); }} aria-label="Reset">↺ Reset</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Tag color={C.gold}>aktueller Schritt</Tag>
          <Tag color={C.good}>Ergebnis</Tag>
        </div>
      </div>
    </Card>
  );
}

// kleine Hilfs-Card fuer "Typische Falle"
function FalleCard({ children }) {
  return (
    <Card style={{ marginTop: 18, background: `${C.warn}0e`, borderColor: `${C.warn}44` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: C.warn, marginBottom: 8 }}>
        <span aria-hidden>{"⚠️"}</span> Typische Falle
      </div>
      <div style={{ color: C.dim, fontSize: 15, lineHeight: 1.7 }}>{children}</div>
    </Card>
  );
}

// Varianten-Zeile
function Varianten({ items }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
        Gleicher Typ, andere Zahlen (Varianten aus den anderen Klausuren):
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
        {items.map((it, k) => (
          <span key={k} style={{
            fontSize: 13, color: C.text, background: C.panel2, border: `1px solid ${C.line}`,
            borderRadius: 999, padding: "5px 12px", fontFamily: "ui-monospace, monospace",
          }}>
            <span style={{ color: C.accent2, marginRight: 6 }}>{it.q}</span>{it.t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===================================================================
//  VIS 1 - Unstetigkeits-Visualizer (4 Arten durchschalten)
// ===================================================================
function VisUnstetigkeit() {
  const arten = [
    {
      name: "Hebbar (behebbar)",
      color: C.good,
      desc: "Linker und rechter Grenzwert existieren und sind gleich - nur der Funktionswert an der Stelle fehlt (Loch). Man koennte die Luecke 'stopfen'.",
    },
    {
      name: "Sprungstelle",
      color: C.gold,
      desc: "Linker und rechter Grenzwert existieren, sind aber verschieden. Der Graph 'springt' - genau der Fall der NK-Aufgabe (x² fuer x<0, x+1 sonst).",
    },
    {
      name: "Polstelle",
      color: C.warn,
      desc: "Mindestens ein einseitiger Grenzwert ist ±∞. Die Funktion 'explodiert' an der Stelle (z. B. 1/x bei 0).",
    },
    {
      name: "Oszillation",
      color: C.accent2,
      desc: "Die Funktion schwingt unendlich oft - es gibt gar keinen Grenzwert. Genau sin(1/x) bei x₀=0 aus der HK-Aufgabe.",
    },
  ];
  const [k, setK] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setK((v) => (v + 1) % arten.length), 2200);
    return () => clearTimeout(t);
  }, [auto, k]);

  // SVG-Geometrie: x von 0..240 entspricht mathematisch -3..3, x0 in der Mitte (120)
  const W = 360, H = 200, x0 = 180, yMid = 100;

  function graph(type) {
    if (type === 0) {
      // hebbar: Gerade y = x/3*... eine glatte Linie mit Loch in der Mitte
      return (
        <>
          <path d={`M20 ${170} L${x0 - 6} ${yMid + 6}`} stroke={C.good} strokeWidth="3" fill="none" />
          <path d={`M${x0 + 6} ${yMid - 6} L${W - 20} ${30}`} stroke={C.good} strokeWidth="3" fill="none" />
          <circle cx={x0} cy={yMid} r="6" fill={C.panel} stroke={C.good} strokeWidth="2.5" />
        </>
      );
    }
    if (type === 1) {
      // Sprung: linker Ast endet unten, rechter beginnt hoeher
      return (
        <>
          <path d={`M20 ${150} Q ${100} ${150} ${x0} ${130}`} stroke={C.gold} strokeWidth="3" fill="none" />
          <circle cx={x0} cy={130} r="5.5" fill={C.gold} />
          <circle cx={x0} cy={60} r="5.5" fill={C.panel} stroke={C.gold} strokeWidth="2.5" />
          <path d={`M${x0} 60 L${W - 20} 40`} stroke={C.gold} strokeWidth="3" fill="none" />
        </>
      );
    }
    if (type === 2) {
      // Polstelle: 1/(x-x0), zwei Aeste die nach +/-unendlich laufen
      return (
        <>
          <path d={`M20 ${yMid + 8} C ${110} ${yMid + 14} ${x0 - 30} ${H - 6} ${x0 - 6} ${H - 6}`} stroke={C.warn} strokeWidth="3" fill="none" />
          <path d={`M${x0 + 6} 6 C ${x0 + 30} 6 ${260} ${yMid - 14} ${W - 20} ${yMid - 8}`} stroke={C.warn} strokeWidth="3" fill="none" />
          <line x1={x0} y1="4" x2={x0} y2={H - 4} stroke={`${C.warn}55`} strokeWidth="1.5" strokeDasharray="5 5" />
        </>
      );
    }
    // Oszillation: sin(1/x) - dichte Wellen Richtung x0
    const pts = [];
    for (let px = 20; px < x0 - 4; px += 1.5) {
      const xv = (x0 - px) / 60; // Abstand zu x0
      const y = yMid - 42 * Math.sin(1 / (xv + 0.04));
      pts.push(`${px},${y.toFixed(1)}`);
    }
    return (
      <>
        <polyline points={pts.join(" ")} stroke={C.accent2} strokeWidth="2.2" fill="none" />
        <line x1={x0} y1="4" x2={x0} y2={H - 4} stroke={`${C.accent2}55`} strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx={x0} cy={yMid} r="5" fill={C.panel} stroke={C.accent2} strokeWidth="2.5" />
      </>
    );
  }

  const a = arten[k];
  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {arten.map((it, idx) => (
          <button key={idx} onClick={() => { setAuto(false); setK(idx); }}
            style={{
              ...btnGhost, padding: "6px 12px", fontSize: 13,
              borderColor: idx === k ? it.color : C.line,
              color: idx === k ? it.color : C.dim,
              background: idx === k ? `${it.color}14` : "transparent",
            }}>
            {it.name}
          </button>
        ))}
        <button style={{ ...btn, marginLeft: "auto", padding: "6px 14px", fontSize: 13 }} onClick={() => setAuto((v) => !v)}>
          {auto ? "⏸" : "▶"} Auto
        </button>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 360, background: C.panel2, borderRadius: 12, border: `1px solid ${C.line}` }}>
          {/* Achsen */}
          <line x1="8" y1={yMid} x2={W - 8} y2={yMid} stroke={C.line} strokeWidth="1" />
          <text x={x0 - 4} y={H - 6} fill={C.dim} fontSize="11" fontFamily="ui-monospace">x{"₀"}</text>
          {graph(k)}
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, color: a.color, fontSize: 18, marginBottom: 6 }}>{a.name}</div>
          <div style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.65 }}>{a.desc}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
        <Tag color={C.good}>hebbar</Tag>
        <Tag color={C.gold}>Sprung</Tag>
        <Tag color={C.warn}>Polstelle</Tag>
        <Tag color={C.accent2}>Oszillation</Tag>
      </div>
    </Card>
  );
}

// ===================================================================
//  VIS 2 - Reihen-Konvergenz-Player (Partialsummen als Balken)
// ===================================================================
function VisReihen() {
  const reihen = {
    geo: {
      name: "Geometrisch  Σ (0,4)ⁿ",
      color: C.good,
      term: (n) => Math.pow(0.4, n),
      grenze: 0.4 / (1 - 0.4), // = 2/3, Summe ab n=1
      verdict: "konvergiert gegen 2/3 ≈ 0,667",
      konv: true,
    },
    harm: {
      name: "Harmonisch  Σ 1/n",
      color: C.warn,
      term: (n) => 1 / n,
      grenze: null,
      verdict: "divergiert (waechst unbegrenzt, nur sehr langsam)",
      konv: false,
    },
  };
  const [key, setKey] = useState("geo");
  const [n, setN] = useState(1);
  const [play, setPlay] = useState(false);
  const r = reihen[key];
  const MAXN = 14;

  useEffect(() => {
    if (!play) return;
    if (n >= MAXN) { setPlay(false); return; }
    const t = setTimeout(() => setN((v) => Math.min(MAXN, v + 1)), 650);
    return () => clearTimeout(t);
  }, [play, n]);

  // Partialsummen
  const sums = [];
  let acc = 0;
  for (let i = 1; i <= n; i++) { acc += r.term(i); sums.push(acc); }
  const cur = sums[sums.length - 1] || 0;
  const scaleMax = r.konv ? r.grenze * 1.15 : Math.max(cur * 1.1, 1);

  return (
    <Card>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {Object.entries(reihen).map(([k2, v]) => (
          <button key={k2} onClick={() => { setKey(k2); setN(1); setPlay(false); }}
            style={{ ...btnGhost, padding: "6px 12px", fontSize: 13,
              borderColor: k2 === key ? v.color : C.line, color: k2 === key ? v.color : C.dim,
              background: k2 === key ? `${v.color}14` : "transparent" }}>
            {v.name}
          </button>
        ))}
      </div>

      {/* Balken der Partialsummen */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 150, padding: "0 4px",
        borderBottom: `1px solid ${C.line}`, position: "relative" }}>
        {r.konv && (
          <div style={{ position: "absolute", left: 0, right: 0,
            bottom: `${(r.grenze / scaleMax) * 100}%`, borderTop: `1.5px dashed ${C.accent2}`, }}>
            <span style={{ position: "absolute", right: 0, top: -16, fontSize: 11, color: C.accent2 }}>
              Grenzwert {r.grenze.toFixed(2)}
            </span>
          </div>
        )}
        {sums.map((s, idx) => (
          <div key={idx} style={{
            flex: 1, background: idx === sums.length - 1 ? C.gold : r.color,
            height: `${Math.min(100, (s / scaleMax) * 100)}%`,
            borderRadius: "4px 4px 0 0", transition: "height .4s ease, background .3s ease",
            minHeight: 2,
          }} title={`S${idx + 1} = ${s.toFixed(3)}`} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.dim, marginTop: 4 }}>
        <span>S{"₁"}</span><span>Partialsumme nach n Gliedern</span><span>S<sub>{n}</sub></span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
        <button style={btn} onClick={() => { if (n >= MAXN) setN(1); setPlay((p) => !p); }}>
          {play ? "⏸ Pause" : "▶ Glieder addieren"}
        </button>
        <button style={btnGhost} onClick={() => { setPlay(false); setN(1); }}>↺ Reset</button>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, color: C.text }}>
          S<sub>{n}</sub> = <b style={{ color: r.konv ? C.good : C.warn }}>{cur.toFixed(4)}</b>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 13.5, color: r.konv ? C.good : C.warn, fontWeight: 700 }}>
          {r.verdict}
        </div>
      </div>
      <div style={{ fontSize: 13, color: C.dim, marginTop: 10, lineHeight: 1.6 }}>
        Beobachte: Bei der geometrischen Reihe naehern sich die Balken einer festen Hoehe (dem Grenzwert) -
        bei der harmonischen Reihe waechst die Summe immer weiter, nur gebremst. Genau das ist der Unterschied
        zwischen <b style={{ color: C.good }}>Konvergenz</b> und <b style={{ color: C.warn }}>Divergenz</b>.
      </div>
    </Card>
  );
}

// ===================================================================
//  HAUPT-KOMPONENTE
// ===================================================================
export default function AnalysisKlausurtrainer() {
  return (
    <div style={{
      background: `radial-gradient(1200px 600px at 75% -10%, ${C.accent}1c, transparent), radial-gradient(900px 500px at 8% 8%, ${C.accent2}12, transparent), ${C.bg}`,
      color: C.text, minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @keyframes popStep { 0%{transform:scale(.92);opacity:.4} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        input[type=range]{ height: 6px; border-radius: 4px; }
      `}</style>

      {/* HERO */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 44px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 12, letterSpacing: 3, color: C.accent, fontWeight: 700, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 16px", marginBottom: 20 }}>
          ANALYSIS &middot; KLAUSURTRAINER
        </div>
        <h1 style={{ fontSize: 50, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.05, letterSpacing: -1 }}>
          Jeder <span style={{ color: C.accent }}>Aufgabentyp</span>, einmal komplett <span style={{ color: C.accent2 }}>durchgerechnet</span>.
        </h1>
        <p style={{ fontSize: 18, color: C.dim, maxWidth: 640, margin: "0 auto", lineHeight: 1.65 }}>
          Die INF-Analysis-Klausuren bestehen aus rund <b style={{ color: C.text }}>11 wiederkehrenden Aufgabentypen</b>.
          Hier ist jeder davon an einer <b style={{ color: C.text }}>echten Klausuraufgabe</b> Schritt fuer Schritt geloest -
          mit Begruendung zu jedem Schritt. Wer das hier kann, loest jede der drei Klausuren.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>

        {/* 0 - Landkarte */}
        <Section kicker="Orientierung" title="Die Klausur auf einen Blick">
          <p style={{ marginTop: 0 }}>
            <b style={{ color: C.text }}>75 Minuten</b> Bearbeitungszeit, eine feste Aufgaben-Reihenfolge. Diese ~11 Typen
            wiederholen sich in jeder Klausur - nur mit anderen Zahlen. Verschaff dir zuerst den Ueberblick:
          </p>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {[
                ["1", "Unstetigkeit", C.accent],
                ["2", "Folgen-Grenzwerte", C.accent],
                ["3", "Reihen-Konvergenz", C.accent2],
                ["4", "Funktionsverkettung", C.accent],
                ["5", "Grenzwert-Beweis", C.accent2],
                ["6", "Ableitungen", C.accent],
                ["7", "L'Hospital", C.accent],
                ["8", "Taylorreihe", C.accent2],
                ["9", "Integrale", C.accent],
                ["10", "Uneigentl. Integral", C.accent2],
                ["11", "Partialbruchzerlegung", C.accent],
                ["12", "Bonus (INF24)", C.gold],
              ].map(([nr, name, col]) => (
                <div key={nr} style={{
                  background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{
                    minWidth: 24, height: 24, borderRadius: 7, background: `${col}22`, color: col,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13,
                  }}>{nr}</span>
                  <span style={{ fontSize: 13.5, color: C.text }}>{name}</span>
                </div>
              ))}
            </div>
          </Card>
          <InfoBox title="So liest du diesen Trainer">
            Jede Section folgt demselben Bogen: <b style={{ color: C.text }}>Methode</b> (welches Verfahren, woran man es erkennt) -&gt;
            <b style={{ color: C.text }}> Loesungs-Stepper</b> (echte Aufgabe Schritt fuer Schritt, mit ▶ Auto-Play) -&gt;
            <b style={{ color: C.text }}> typische Falle</b> -&gt; <b style={{ color: C.text }}>Varianten</b> aus den anderen Klausuren.
            Im Stepper ist der <b style={{ color: C.gold }}>aktuelle Schritt gelb</b>, das <b style={{ color: C.good }}>Endergebnis gruen</b>.
          </InfoBox>
        </Section>

        {/* ============ 1 - UNSTETIGKEIT ============ */}
        <Section kicker="Aufgabentyp 1" title="Unstetigkeit - Arten erkennen und benennen">
          <p style={{ marginTop: 0 }}>
            Eine Funktion ist an einer Stelle x{"₀"} <b style={{ color: C.text }}>stetig</b> (durchgaengig, ohne Sprung),
            wenn linker Grenzwert = rechter Grenzwert = Funktionswert. Ist das verletzt, liegt eine
            <b style={{ color: C.warn }}> Unstetigkeit</b> vor. Es gibt vier Arten - die mt du erkennen koennen:
          </p>
          <div style={{ marginBottom: 20 }}><VisUnstetigkeit /></div>

          <LösungsStepper
            quelle="HK INF23 - Unstetigkeit a)"
            aufgabe={<>Untersuche f(x) = sin(<Frac num="1" den="x" />) an der Stelle x{"₀"} = 0 auf Stetigkeit.</>}
            schritte={[
              { formel: <>Was passiert mit dem Argument <Frac num="1" den="x" /> fuer x &rarr; 0 ?</>,
                warum: "Naehert sich x der 0, so waechst 1/x unbegrenzt (gegen +unendlich von rechts, -unendlich von links)." },
              { formel: <>sin(<Frac num="1" den="x" />) durchlaeuft dabei unendlich oft alle Werte zwischen -1 und +1.</>,
                warum: "Der Sinus ist periodisch. Je naeher x an 0, desto schneller schwingt das Argument durch ganze Perioden." },
              { formel: <>&rArr; lim<sub>x&rarr;0</sub> sin(<Frac num="1" den="x" />) existiert NICHT.</>,
                warum: "Die Funktion naehert sich keinem festen Wert - sie oszilliert ohne Ruhe. Kein Grenzwert moeglich." },
              { formel: <><b>Ergebnis: Oszillationsunstetigkeit</b> bei x{"₀"} = 0.</>,
                warum: "Da kein Grenzwert existiert, ist f dort unstetig - und zwar vom Typ Oszillation (nicht hebbar, kein Sprung, keine Polstelle)." },
            ]}
          />
          <InfoBox title="Teil b) - 'Nenne eine weitere Art'">
            Fast jede Unstetigkeits-Aufgabe hat einen Teil b): nenne eine andere Unstetigkeitsart mit Beispiel.
            Sichere Antworten: <b style={{ color: C.text }}>hebbar</b> (z. B. <Frac num="sin x" den="x" /> bei 0, Grenzwert 1 existiert),
            <b style={{ color: C.text }}> Sprung</b> (stueckweise Funktion), <b style={{ color: C.text }}>Polstelle</b> (<Frac num="1" den="x" /> bei 0).
          </InfoBox>
          <FalleCard>
            Oszillation mit Polstelle verwechseln. Bei der <b>Polstelle</b> laeuft die Funktion gegen &plusmn;&infin; (ein klarer
            "Trend"); bei der <b>Oszillation</b> gibt es gar keinen Trend - sie pendelt beschraenkt, aber unendlich oft.
            sin(1/x) bleibt zwischen -1 und 1, geht also NICHT gegen unendlich.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "stueckweise x² (x<0) / x+1 → Sprung (links 0, rechts 1)" },
            { q: "INF24:", t: "weitere Art benennen + Beispiel" },
          ]} />
        </Section>

        {/* ============ 2 - FOLGEN-GRENZWERTE ============ */}
        <Section kicker="Aufgabentyp 2" title="Folgen-Grenzwerte (ohne L'Hospital)">
          <Card style={{ marginBottom: 18 }}>
            <MethodRow color={C.accent} name="Dominanten Term ausklammern / kuerzen"
              formula="hoechste Potenz von n kuerzen"
              note="Bei Bruechen von Polynomen in n: durch die hoechste vorkommende n-Potenz teilen. Alle Terme der Form (Konstante / n^k) gehen dann gegen 0. Uebrig bleibt das Verhaeltnis der Leitkoeffizienten." />
          </Card>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 2a)"
            aufgabe={<>Bestimme den Grenzwert von a<sub>n</sub> = <Frac num={<>(n+1)&sup2; &minus; n&sup2;</>} den="7n" />.</>}
            schritte={[
              { formel: <>Zaehler ausmultiplizieren: (n+1)&sup2; = n&sup2; + 2n + 1</>,
                warum: "Erste binomische Formel. So lassen sich die n²-Terme im Zaehler gegeneinander kuerzen." },
              { formel: <>n&sup2; + 2n + 1 &minus; n&sup2; = 2n + 1</>,
                warum: "Die n² heben sich auf - der Zaehler vereinfacht sich zu einem linearen Ausdruck." },
              { formel: <>a<sub>n</sub> = <Frac num="2n + 1" den="7n" /> = <Frac num="2" den="7" /> + <Frac num="1" den="7n" /></>,
                warum: "Bruch term-weise aufteilen: 2n/(7n) = 2/7, und 1/(7n) bleibt." },
              { formel: <>n &rarr; &infin;: <Frac num="1" den="7n" /> &rarr; 0</>,
                warum: "Eine Konstante geteilt durch ein wachsendes n strebt gegen 0 - das ist der entscheidende Standardgrenzwert." },
              { formel: <><b>lim<sub>n&rarr;&infin;</sub> a<sub>n</sub> = <Frac num="2" den="7" /></b></>,
                warum: "Es bleibt nur das Verhaeltnis der Leitkoeffizienten 2/7 uebrig." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="HK INF23 - Aufg. 2b)"
              aufgabe={<>Bestimme den Grenzwert von a<sub>n</sub> = <Frac num={<>&minus;2n + 1</>} den="3 + 4n" />.</>}
              schritte={[
                { formel: <>Hoechste Potenz ist n. Zaehler und Nenner durch n teilen.</>,
                  warum: "Standardtrick bei Polynom-Bruechen: durch die groesste n-Potenz kuerzen." },
                { formel: <>a<sub>n</sub> = <Frac num={<>&minus;2 + <Frac num="1" den="n" /></>} den={<><Frac num="3" den="n" /> + 4</>} /></>,
                  warum: "Jeder Term einzeln durch n geteilt: -2n/n = -2, 1/n bleibt, 3/n und 4n/n = 4." },
                { formel: <>Fuer n &rarr; &infin;: <Frac num="1" den="n" /> &rarr; 0 und <Frac num="3" den="n" /> &rarr; 0</>,
                  warum: "Alle Konstanten-durch-n-Terme verschwinden im Grenzwert." },
                { formel: <><b>&rarr; <Frac num={<>&minus;2</>} den="4" /> = &minus;<Frac num="1" den="2" /></b></>,
                  warum: "Es bleibt das Verhaeltnis der Leitkoeffizienten -2/4 = -1/2." },
              ]}
            />
          </div>
          <FalleCard>
            Nicht durch die falsche Potenz teilen. Es zaehlt die <b>hoechste</b> vorkommende n-Potenz in der gesamten
            Bruchstruktur. Und: 1/n &rarr; 0, aber n/n = 1 (nicht 0!) - die Leitkoeffizienten bleiben stehen.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "(e⁻ⁿ + 0,5ⁿ)/7ⁿ ,  (−7n+9)/(9+10n)" },
            { q: "INF24:", t: "cos(n)/(7n) → 0 ,  2025/n → 0" },
          ]} />
        </Section>

        {/* ============ 3 - REIHEN ============ */}
        <Section kicker="Aufgabentyp 3" title="Reihen-Konvergenz - das richtige Kriterium waehlen">
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent2} name="Leibniz-Kriterium" formula="alternierend + monoton fallende Nullfolge"
                note="Fuer Reihen mit Vorzeichenwechsel (-1)^n. Wenn die Betraege monoton gegen 0 fallen, konvergiert die Reihe." />
              <MethodRow color={C.good} name="Geometrische Reihe" formula="Σ q^n  konvergiert  ⇔  |q| < 1"
                note="Bei |q|<1 ist die Summe (ab n=0) gleich 1/(1-q). Bei |q|>=1 divergiert sie." />
              <MethodRow color={C.warn} name="Harmonische Reihe" formula="Σ 1/n  divergiert"
                note="Wichtiges Gegenbeispiel: obwohl 1/n -> 0, divergiert die Summe. Jede Reihe der Form c/n divergiert ebenfalls." />
              <MethodRow color={C.accent} name="Notwendiges Kriterium" formula="Glieder ↛ 0  ⇒  divergiert"
                note="Wenn die Summanden nicht gegen 0 gehen, kann die Reihe gar nicht konvergieren (schneller Ausschluss)." />
            </div>
          </Card>
          <div style={{ marginBottom: 20 }}><VisReihen /></div>

          <LösungsStepper
            quelle="HK INF23 - Aufg. 3a)"
            aufgabe={<>Konvergiert <>&#8721;</> <Frac num={<>(&minus;1)<sup>n</sup></>} den="2n &minus; 1" /> ?</>}
            schritte={[
              { formel: <>Vorzeichen (&minus;1)<sup>n</sup> wechselt &rArr; alternierende Reihe.</>,
                warum: "Bei Vorzeichenwechsel ist das Leibniz-Kriterium der natuerliche Kandidat." },
              { formel: <>Betrag der Glieder: b<sub>n</sub> = <Frac num="1" den="2n &minus; 1" /></>,
                warum: "Leibniz prueft die Betraege ohne Vorzeichen - sie muessen zwei Bedingungen erfuellen." },
              { formel: <>b<sub>n</sub> ist monoton fallend (Nenner 2n&minus;1 waechst).</>,
                warum: "Groesserer Nenner -> kleinerer Bruch. Bedingung 1 (monoton fallend) erfuellt." },
              { formel: <>b<sub>n</sub> &rarr; 0 fuer n &rarr; &infin;.</>,
                warum: "1/(2n-1) -> 0. Bedingung 2 (Nullfolge) erfuellt." },
              { formel: <><b>Beide Leibniz-Bedingungen erfuellt &rArr; die Reihe konvergiert.</b></>,
                warum: "Alternierend + monoton fallende Nullfolge ist genau das Leibniz-Kriterium." },
            ]}
          />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <LösungsStepper
                quelle="HK INF23 - Aufg. 3b)"
                aufgabe={<><>&#8721;</> <Frac num="9" den="n" /> - konvergent?</>}
                schritte={[
                  { formel: <><>&#8721;</> <Frac num="9" den="n" /> = 9 &middot; <>&#8721;</> <Frac num="1" den="n" /></>,
                    warum: "Konstanten Faktor 9 vorziehen - aendert das Konvergenzverhalten nicht." },
                  { formel: <><>&#8721;</> <Frac num="1" den="n" /> ist die harmonische Reihe.</>,
                    warum: "Das beruehmteste Beispiel einer divergenten Reihe trotz Nullfolge." },
                  { formel: <><b>&rArr; divergiert</b> (auch mal 9).</>,
                    warum: "Ein konstanter Faktor macht aus einer divergenten Reihe keine konvergente." },
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <LösungsStepper
                quelle="HK INF23 - Aufg. 3c)"
                aufgabe={<><>&#8721;</> (0,4)<sup>n</sup> - konvergent?</>}
                schritte={[
                  { formel: <>Form q<sup>n</sup> mit q = 0,4 &rArr; geometrische Reihe.</>,
                    warum: "Konstante hoch n erkennt man als geometrische Reihe." },
                  { formel: <>|q| = 0,4 &lt; 1</>,
                    warum: "Das Konvergenz-Kriterium der geometrischen Reihe ist erfuellt." },
                  { formel: <><b>&rArr; konvergiert</b>, Summe (ab n=1) = <Frac num="0,4" den="1 &minus; 0,4" /> = <Frac num="2" den="3" /></>,
                    warum: "Bei |q|<1 gibt es sogar einen geschlossenen Summenwert." },
                ]}
              />
            </div>
          </div>
          <FalleCard>
            "1/n geht gegen 0, also konvergiert die Reihe" - <b>falsch!</b> Das notwendige Kriterium (Glieder -&gt; 0)
            ist nur <i>notwendig</i>, nicht hinreichend. Die harmonische Reihe ist das Standard-Gegenbeispiel.
            Umgekehrt gilt: gehen die Glieder NICHT gegen 0, divergiert die Reihe garantiert.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "Σ(1,2)ⁿ divergiert (|q|>1) ,  Σ sin(nπ)=0 (alle Glieder 0)" },
            { q: "INF24:", t: "Σ 1/n divergiert ,  Σ 0,99ⁿ konvergiert" },
          ]} />
        </Section>

        {/* ============ 4 - VERKETTUNG ============ */}
        <Section kicker="Aufgabentyp 4" title="Funktionsverkettung - g∘f, f∘g, Definitionsbereich, Inverse">
          <InfoBox title="Was bedeutet g∘f ?">
            (g&thinsp;&#8728;&thinsp;f)(x) = g(f(x)): erst f auf x anwenden, dann g auf das Ergebnis - "von innen nach aussen".
            Achtung auf die Reihenfolge: g&#8728;f ist meist NICHT dasselbe wie f&#8728;g. Der Definitionsbereich der
            Verkettung umfasst nur die x, fuer die <i>beide</i> Schritte erlaubt sind.
          </InfoBox>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 4"
            aufgabe={<>Gegeben f(x) = &radic;(1&minus;x) und g(x) = x&sup2;. Bestimme g&#8728;f, f&#8728;g samt Definitionsbereich und zeige (g&#8728;f) = (g&#8728;f)<sup>&minus;1</sup>.</>}
            schritte={[
              { formel: <>(g&#8728;f)(x) = g(f(x)) = (&radic;(1&minus;x))&sup2; = 1 &minus; x</>,
                warum: "Quadrieren hebt die Wurzel auf. Aber: f muss zuerst definiert sein - dazu gleich." },
              { formel: <>D(f): 1&minus;x &ge; 0 &rArr; x &le; 1. Also D(g&#8728;f) = (&minus;&infin;, 1].</>,
                warum: "Unter der Wurzel darf nichts Negatives stehen. Der Definitionsbereich von f vererbt sich auf g∘f, obwohl 1-x ueberall definiert waere." },
              { formel: <>(f&#8728;g)(x) = f(g(x)) = &radic;(1 &minus; x&sup2;)</>,
                warum: "Andere Reihenfolge: erst quadrieren, dann in die Wurzel. Ergebnis ist voellig anders als g∘f." },
              { formel: <>D(f&#8728;g): 1&minus;x&sup2; &ge; 0 &rArr; &minus;1 &le; x &le; 1.</>,
                warum: "Auch hier muss der Radikand >= 0 sein. Das ergibt das Intervall [-1, 1]." },
              { formel: <>Inverse von (g&#8728;f)(x)=1&minus;x: y = 1&minus;x &rArr; x = 1&minus;y.</>,
                warum: "Nach x aufloesen und x, y tauschen liefert die Umkehrfunktion." },
              { formel: <><b>(g&#8728;f)<sup>&minus;1</sup>(x) = 1 &minus; x = (g&#8728;f)(x)</b> &#10003;</>,
                warum: "Funktion und ihre Inverse sind identisch - 1-x ist selbstinvers (eine Involution). Genau das war zu zeigen." },
            ]}
          />
          <FalleCard>
            Reihenfolge vertauschen: g&#8728;f bedeutet <b>g(f(x))</b>, also f zuerst. Und der haeufigste Punktverlust:
            den <b>Definitionsbereich vergessen</b>. (g&#8728;f)(x) = 1&minus;x sieht ueberall definiert aus - gilt aber
            nur fuer x &le; 1, weil f die Wurzel enthaelt.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "f=√x , g=1−x²" },
            { q: "INF24:", t: "f=x² , g=1+x  (+ Monotonie pruefen)" },
          ]} />
        </Section>

        {/* ============ 5 - GRENZWERT-BEWEIS ============ */}
        <Section kicker="Aufgabentyp 5" title="Grenzwert-Beweis / Stetigkeit (Ableitungsdefinition)">
          <p style={{ marginTop: 0 }}>
            Hier sollst du einen Grenzwert nicht nur ausrechnen, sondern <b style={{ color: C.text }}>begruenden</b> -
            oft ueber die <b style={{ color: C.text }}>Definition der Ableitung</b> als Grenzwert des Differenzenquotienten.
          </p>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 5"
            aufgabe={<>Zeige fuer a &gt; 0: &nbsp;lim<sub>h&rarr;0</sub> <Frac num={<>a<sup>h</sup> &minus; 1</>} den="h" /> = ln(a).</>}
            schritte={[
              { formel: <>Betrachte die Funktion g(x) = a<sup>x</sup> an der Stelle x = 0.</>,
                warum: "Der gesuchte Grenzwert hat genau die Bauform des Differenzenquotienten von a^x bei 0." },
              { formel: <>Ableitungsdefinition: g'(0) = lim<sub>h&rarr;0</sub> <Frac num={<>g(0+h) &minus; g(0)</>} den="h" /></>,
                warum: "Die Ableitung ist definiert als Grenzwert des Differenzenquotienten - das ist die Bruecke zur Aufgabe." },
              { formel: <>g(0) = a<sup>0</sup> = 1, also g'(0) = lim<sub>h&rarr;0</sub> <Frac num={<>a<sup>h</sup> &minus; 1</>} den="h" /></>,
                warum: "Einsetzen zeigt: der gesuchte Grenzwert IST g'(0). Jetzt muss man nur g' kennen." },
              { formel: <>Ableitung der Exponentialfunktion: g'(x) = a<sup>x</sup> &middot; ln(a)</>,
                warum: "Standard-Ableitung. (Herleitbar ueber a^x = e^{x ln a} und Kettenregel.)" },
              { formel: <><b>g'(0) = a<sup>0</sup> &middot; ln(a) = ln(a)</b> &#10003;</>,
                warum: "Bei x=0 ist a^0=1, es bleibt ln(a). Damit ist der Grenzwert bewiesen." },
            ]}
          />
          <FalleCard>
            Hier einfach L'Hospital anzusetzen ist riskant, wenn die Ableitung von a^h gerade das ist, was man beweisen
            soll (Zirkelschluss). Der saubere Weg ist die <b>Ableitungsdefinition</b> - sie liefert das Ergebnis ohne Vorgriff.
          </FalleCard>
          <Varianten items={[
            { q: "INF24:", t: "Nenne eine Eigenschaft stetiger Funktionen (z. B. Zwischenwertsatz)" },
          ]} />
        </Section>

        {/* ============ 6 - ABLEITUNGEN ============ */}
        <Section kicker="Aufgabentyp 6" title="Ableitungen - Ketten-, Produkt- & logarithmische Regel">
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Kettenregel" formula="(f(g(x)))' = f'(g(x)) · g'(x)"
                note="'Aeussere mal innere Ableitung'. Bei verschachtelten Funktionen wie (...)^5 oder √(...)." />
              <MethodRow color={C.accent2} name="Produktregel" formula="(u·v)' = u'v + uv'"
                note="Bei Produkten wie x³·e^x: jeden Faktor einmal ableiten, addieren." />
              <MethodRow color={C.gold} name="Logarithmische Ableitung" formula="y=f(x)^{g(x)} → ln beidseitig"
                note="Wenn Basis UND Exponent x enthalten (z. B. x^x): erst ln nehmen, dann implizit ableiten." />
            </div>
          </Card>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 6a)"
            aufgabe={<>Leite ab: f(x) = (arcsin x + 4)<sup>5</sup>.</>}
            schritte={[
              { formel: <>Aeussere Funktion: (&#9633;)<sup>5</sup>, innere: arcsin x + 4.</>,
                warum: "Verschachtelung erkennen -> Kettenregel. Innen steht arcsin x + 4." },
              { formel: <>Aeussere Ableitung: 5(arcsin x + 4)<sup>4</sup></>,
                warum: "Potenzregel auf die aeussere Klammer, Inneres unveraendert lassen." },
              { formel: <>Innere Ableitung: (arcsin x)' = <Frac num="1" den={<>&radic;(1&minus;x&sup2;)</>} /></>,
                warum: "Standard-Ableitung des Arkussinus; die +4 faellt als Konstante weg." },
              { formel: <><b>f'(x) = 5(arcsin x + 4)<sup>4</sup> &middot; <Frac num="1" den={<>&radic;(1&minus;x&sup2;)</>} /></b></>,
                warum: "Kettenregel: aeussere mal innere Ableitung - fertig." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="HK INF23 - Aufg. 6c)"
              aufgabe={<>Leite ab: f(x) = x&sup3; &middot; e<sup>x</sup>.</>}
              schritte={[
                { formel: <>Produkt aus u = x&sup3; und v = e<sup>x</sup>.</>,
                  warum: "Zwei x-abhaengige Faktoren multipliziert -> Produktregel." },
                { formel: <>u' = 3x&sup2;,&nbsp;&nbsp; v' = e<sup>x</sup></>,
                  warum: "Potenzregel fuer x³, und e^x bleibt beim Ableiten e^x." },
                { formel: <>f'(x) = u'v + uv' = 3x&sup2; e<sup>x</sup> + x&sup3; e<sup>x</sup></>,
                  warum: "Produktregel einsetzen: erste abgeleitet mal zweite + erste mal zweite abgeleitet." },
                { formel: <><b>f'(x) = x&sup2; e<sup>x</sup>(3 + x)</b></>,
                  warum: "x² e^x ausklammern macht das Ergebnis kompakt." },
              ]}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="NK INF23 - Aufg. 6e)"
              aufgabe={<>Leite ab: f(x) = x<sup>x</sup> (logarithmische Ableitung).</>}
              schritte={[
                { formel: <>Setze y = x<sup>x</sup> und nimm beidseitig ln: ln y = x &middot; ln x.</>,
                  warum: "Basis UND Exponent enthalten x - normale Regeln greifen nicht. ln macht aus dem Exponenten einen Faktor." },
                { formel: <>Links implizit ableiten: <Frac num="y'" den="y" /> (innere Ableitung von ln y).</>,
                  warum: "y haengt von x ab, daher Kettenregel: (ln y)' = y'/y." },
                { formel: <>Rechts Produktregel: (x &middot; ln x)' = 1&middot;ln x + x&middot;<Frac num="1" den="x" /> = ln x + 1</>,
                  warum: "Produktregel auf x mal ln x; x mal 1/x = 1." },
                { formel: <><Frac num="y'" den="y" /> = ln x + 1 &rArr; y' = y(ln x + 1)</>,
                  warum: "Mit y multiplizieren, um y' freizustellen." },
                { formel: <><b>f'(x) = x<sup>x</sup>(ln x + 1)</b></>,
                  warum: "y = x^x wieder einsetzen. Fertig." },
              ]}
            />
          </div>
          <FalleCard>
            x^x NICHT wie x^n (Potenzregel) oder wie a^x (Exponentialregel) behandeln - beides ist falsch, weil
            hier <b>Basis und Exponent zugleich x</b> sind. Nur die logarithmische Ableitung ist korrekt.
            Und bei der Kettenregel die <b>innere Ableitung nicht vergessen</b> (haeufigster Fluechtigkeitsfehler).
          </FalleCard>
          <Varianten items={[
            { q: "HK INF23:", t: "√(sin x + 1) (Kettenregel)" },
            { q: "NK INF23:", t: "(arctan x + 2)⁴ ,  e^{arcosh x}+e^{−arcosh x}" },
            { q: "INF24:", t: "ln(3x) ,  √(ln x² + 1) ,  x⁴·e^x" },
          ]} />
        </Section>

        {/* ============ 7 - L'HOSPITAL ============ */}
        <Section kicker="Aufgabentyp 7" title="L'Hospital-Grenzwerte - '0/0' und '0·∞'">
          <InfoBox title="Wann darf man L'Hospital anwenden?">
            Nur bei den <b style={{ color: C.text }}>unbestimmten Formen</b> <code style={{ color: C.gold }}>0/0</code> oder
            <code style={{ color: C.gold }}> &infin;/&infin;</code>. Dann gilt: lim <Frac num="f" den="g" /> = lim <Frac num="f'" den="g'" />
            (Zaehler und Nenner <i>getrennt</i> ableiten, NICHT die Quotientenregel!). Andere Formen wie
            <code style={{ color: C.accent2 }}> 0&middot;&infin;</code> erst in einen Bruch umschreiben.
          </InfoBox>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 7a)"
            aufgabe={<>lim<sub>x&rarr;0</sub> <Frac num={<>e<sup>4x</sup> &minus; 1</>} den="2x" /></>}
            schritte={[
              { formel: <>Einsetzen x=0: <Frac num={<>e<sup>0</sup>&minus;1</>} den="0" /> = <Frac num="0" den="0" /></>,
                warum: "Erst pruefen, ob ueberhaupt eine unbestimmte Form vorliegt. 0/0 -> L'Hospital erlaubt." },
              { formel: <>Zaehler ableiten: (e<sup>4x</sup>&minus;1)' = 4e<sup>4x</sup></>,
                warum: "Kettenregel: innere Ableitung von 4x ist 4. Die -1 faellt weg." },
              { formel: <>Nenner ableiten: (2x)' = 2</>,
                warum: "Einfache Potenzregel." },
              { formel: <>lim<sub>x&rarr;0</sub> <Frac num={<>4e<sup>4x</sup></>} den="2" /> = <Frac num={<>4&middot;1</>} den="2" /></>,
                warum: "Jetzt x=0 einsetzen: e^0 = 1." },
              { formel: <><b>= 2</b></>,
                warum: "4/2 = 2. Das ist der Grenzwert." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="HK INF23 - Aufg. 7b)"
              aufgabe={<>lim<sub>x&rarr;0</sub> x&sup2; &middot; ln(x&sup2;)</>}
              schritte={[
                { formel: <>Form: 0 &middot; (&minus;&infin;) - unbestimmt, aber kein Bruch.</>,
                  warum: "x² -> 0, ln(x²) -> -unendlich. Erst in einen Bruch umschreiben, damit L'Hospital greift." },
                { formel: <>Umschreiben: x&sup2; ln(x&sup2;) = <Frac num={<>ln(x&sup2;)</>} den={<>1 / x&sup2;</>} /></>,
                  warum: "Den 0-Faktor in den Nenner schieben: aus 0·∞ wird ∞/∞." },
                { formel: <>Substituiere t = x&sup2; &rarr; 0<sup>+</sup>: <Frac num="t ln t" den="1" /> bzw. t&middot;ln t.</>,
                  warum: "Mit t = x² wird es der bekannte Grenzwert t·ln t fuer t -> 0+." },
                { formel: <>lim<sub>t&rarr;0<sup>+</sup></sub> t &middot; ln t = 0</>,
                  warum: "Standardgrenzwert: t geht schneller gegen 0 als ln t gegen -unendlich. (Per L'Hospital auf ln t / (1/t) bestaetigt.)" },
                { formel: <><b>&rArr; lim<sub>x&rarr;0</sub> x&sup2; ln(x&sup2;) = 0</b></>,
                  warum: "Das Polynom x² 'gewinnt' gegen den Logarithmus." },
              ]}
            />
          </div>
          <FalleCard>
            Den Bruch mit der <b>Quotientenregel</b> ableiten - falsch! Bei L'Hospital werden Zaehler und Nenner
            <b> getrennt</b> abgeleitet. Und: L'Hospital nur bei 0/0 oder &infin;/&infin; ansetzen - vorher die Form pruefen.
            0&middot;&infin; muss erst in einen Bruch umgeformt werden.
          </FalleCard>
          <Varianten items={[
            { q: "HK INF23:", t: "ln(cos x)/ln(cos 4x) → 1/16" },
            { q: "NK INF23:", t: "(e^{3x}−1)/(3x) → 1 ,  x² ln(x³)" },
            { q: "INF24:", t: "ln x / x → 0 ,  (7^{5x²}−1)/(3x²)" },
          ]} />
        </Section>

        {/* ============ 8 - TAYLORREIHE ============ */}
        <Section kicker="Aufgabentyp 8" title="Taylorreihe um a=0 (bis 4. Glied)">
          <InfoBox title="Die Taylorformel">
            Um den Entwicklungspunkt a=0 (auch <b style={{ color: C.text }}>MacLaurin-Reihe</b>):
            f(x) &asymp; f(0) + f'(0)&middot;x + <Frac num={<>f''(0)</>} den="2!" />&middot;x&sup2; + <Frac num={<>f'''(0)</>} den="3!" />&middot;x&sup3; + ...
            (n! = "n Fakultaet" = 1&middot;2&middot;...&middot;n, also 2!=2, 3!=6.) Man braucht die Ableitungen, jeweils bei 0 ausgewertet.
          </InfoBox>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 8"
            aufgabe={<>Entwickle f(x) = &radic;(x+1) um a=0 bis zum 4. Glied (bis x&sup3;).</>}
            schritte={[
              { formel: <>f(x) = (x+1)<sup>1/2</sup>, f(0) = &radic;1 = 1</>,
                warum: "Wurzel als Potenz schreiben - so lassen sich die Ableitungen mit der Potenzregel bilden." },
              { formel: <>f'(x) = <Frac num="1" den="2" />(x+1)<sup>&minus;1/2</sup>, f'(0) = <Frac num="1" den="2" /></>,
                warum: "Potenzregel: Exponent 1/2 nach vorn, neuer Exponent -1/2. Bei x=0: (1)^{-1/2}=1." },
              { formel: <>f''(x) = &minus;<Frac num="1" den="4" />(x+1)<sup>&minus;3/2</sup>, f''(0) = &minus;<Frac num="1" den="4" /></>,
                warum: "Nochmal ableiten: (1/2)·(-1/2) = -1/4." },
              { formel: <>f'''(x) = <Frac num="3" den="8" />(x+1)<sup>&minus;5/2</sup>, f'''(0) = <Frac num="3" den="8" /></>,
                warum: "Dritte Ableitung: (-1/4)·(-3/2) = 3/8." },
              { formel: <>Einsetzen: 1 + <Frac num="1" den="2" />x + <Frac num={<>&minus;1/4</>} den="2!" />x&sup2; + <Frac num={<>3/8</>} den="3!" />x&sup3;</>,
                warum: "Werte in die Taylorformel einsetzen; 2!=2, 3!=6." },
              { formel: <><b>&radic;(x+1) &asymp; 1 + <Frac num="x" den="2" /> &minus; <Frac num={<>x&sup2;</>} den="8" /> + <Frac num={<>x&sup3;</>} den="16" /></b></>,
                warum: "(-1/4)/2 = -1/8 und (3/8)/6 = 1/16. Das ist die gesuchte Naeherung." },
            ]}
          />
          <FalleCard>
            Die <b>Fakultaeten im Nenner vergessen</b>: das x&sup2;-Glied hat f''(0)/<b>2!</b>, das x&sup3;-Glied f'''(0)/<b>3!</b>.
            Und Vorzeichenfehler bei den negativen Exponenten der Wurzel-Ableitungen sind hier die typische Fehlerquelle.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "e^{2x+1} um a=0" },
            { q: "INF24:", t: "tan x (Ableitungen explizit angeben)" },
          ]} />
        </Section>

        {/* ============ 9 - INTEGRALE ============ */}
        <Section kicker="Aufgabentyp 9" title="Integrale - partielle Integration & Substitution">
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Partielle Integration" formula="∫ u'v = uv − ∫ uv'"
                note="Bei Produkten wie x·cos x oder x·ln x. Faustregel: das Teil, das beim Ableiten einfacher wird (z. B. x oder ln x), als v waehlen." />
              <MethodRow color={C.accent2} name="Substitution" formula="∫ f(g(x))g'(x) dx = ∫ f(u) du"
                note="Wenn im Integranden eine innere Funktion und (fast) ihre Ableitung steht. Setze u = innere Funktion." />
            </div>
          </Card>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 9b)"
            aufgabe={<>Berechne &#8747; x &middot; cos x dx.</>}
            schritte={[
              { formel: <>Waehle u = x (&rarr; u' = 1) und v' = cos x (&rarr; v = sin x).</>,
                warum: "x wird beim Ableiten zu 1 (einfacher), cos x laesst sich leicht integrieren. Ideal fuer partielle Integration." },
              { formel: <>&#8747; u v' dx = u v &minus; &#8747; u' v dx</>,
                warum: "Formel der partiellen Integration anschreiben." },
              { formel: <>= x &middot; sin x &minus; &#8747; 1 &middot; sin x dx</>,
                warum: "u·v = x sin x; das verbleibende Integral ist einfacher als das Ausgangsintegral." },
              { formel: <>&#8747; sin x dx = &minus;cos x</>,
                warum: "Stammfunktion von sin x ist -cos x." },
              { formel: <><b>= x sin x + cos x + C</b></>,
                warum: "Minus mal -cos x ergibt +cos x. C ist die Integrationskonstante (unbestimmtes Integral)." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="HK INF23 - Aufg. 9c)"
              aufgabe={<>Berechne &#8747; x &middot; ln x dx.</>}
              schritte={[
                { formel: <>Waehle u = ln x (&rarr; u' = <Frac num="1" den="x" />) und v' = x (&rarr; v = <Frac num={<>x&sup2;</>} den="2" />).</>,
                  warum: "ln x kann man nicht direkt integrieren, aber leicht ableiten - also u = ln x." },
                { formel: <>= ln x &middot; <Frac num={<>x&sup2;</>} den="2" /> &minus; &#8747; <Frac num="1" den="x" /> &middot; <Frac num={<>x&sup2;</>} den="2" /> dx</>,
                  warum: "Partielle Integration einsetzen: u·v - ∫ u'·v." },
                { formel: <>&#8747; <Frac num="1" den="x" />&middot;<Frac num={<>x&sup2;</>} den="2" /> dx = &#8747; <Frac num="x" den="2" /> dx = <Frac num={<>x&sup2;</>} den="4" /></>,
                  warum: "(1/x)·(x²/2) = x/2; integriert ergibt x²/4." },
                { formel: <><b>= <Frac num={<>x&sup2;</>} den="2" /> ln x &minus; <Frac num={<>x&sup2;</>} den="4" /> + C</b></>,
                  warum: "Zusammensetzen - fertig. Auch hier die Konstante C nicht vergessen." },
              ]}
            />
          </div>
          <FalleCard>
            Bei der partiellen Integration <b>u und v' falsch waehlen</b>: dann wird das Restintegral schwerer statt
            leichter. Merksatz fuer x&middot;ln x: <b>ln x = u</b> (denn ln laesst sich leicht ableiten, schwer integrieren).
            Und die <b>+C</b> bei unbestimmten Integralen nie vergessen.
          </FalleCard>
          <Varianten items={[
            { q: "HK INF23:", t: "∫ 3x²+4−1/x dx (Grundintegrale)" },
            { q: "NK INF23:", t: "∫ e^{3x}+ln x dx ,  ∫ x·sin x dx ,  ∫ 1/(x ln x) dx (Substitution u=ln x)" },
          ]} />
        </Section>

        {/* ============ 10 - UNEIGENTLICHES INTEGRAL ============ */}
        <Section kicker="Aufgabentyp 10" title="Uneigentliches Integral - Grenze als Limes behandeln">
          <p style={{ marginTop: 0 }}>
            Ein Integral heisst <b style={{ color: C.text }}>uneigentlich</b>, wenn der Integrand an einer Grenze
            unbeschraenkt wird (gegen &infin; geht) oder eine Grenze selbst &infin; ist. Trick: die kritische Grenze
            durch eine Variable ersetzen und am Ende den <b style={{ color: C.text }}>Grenzwert</b> bilden.
          </p>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 10"
            aufgabe={<>Berechne &#8747;<sub>0</sub><sup>2,5</sup> <Frac num="1" den={<>&radic;(5&minus;2x)</>} /> dx.</>}
            schritte={[
              { formel: <>Bei x=2,5: 5&minus;2&middot;2,5 = 0 &rArr; Integrand &rarr; &infin;. Uneigentlich!</>,
                warum: "Erst die kritische Stelle erkennen: der Nenner wird 0, der Integrand unbeschraenkt." },
              { formel: <>Substitution u = 5&minus;2x, du = &minus;2 dx &rArr; dx = &minus;<Frac num="1" den="2" /> du.</>,
                warum: "Die innere Funktion unter der Wurzel substituieren, um eine einfache Stammfunktion zu finden." },
              { formel: <>&#8747; <Frac num="1" den={<>&radic;u</>} />&middot;(&minus;<Frac num="1" den="2" />) du = &minus;<Frac num="1" den="2" />&middot;2&radic;u = &minus;&radic;u</>,
                warum: "∫ u^{-1/2} du = 2√u; mal -1/2 ergibt -√u. Ruecksubstitution: -√(5-2x)." },
              { formel: <>Als Limes: lim<sub>b&rarr;2,5<sup>&minus;</sup></sub> [&minus;&radic;(5&minus;2x)]<sub>0</sub><sup>b</sup></>,
                warum: "Die problematische obere Grenze 2,5 durch b ersetzen und b -> 2,5 von links laufen lassen." },
              { formel: <>= lim<sub>b&rarr;2,5</sub> (&minus;&radic;(5&minus;2b) + &radic;5) = &minus;0 + &radic;5</>,
                warum: "Bei b -> 2,5 wird √(5-2b) -> 0; bei der unteren Grenze 0 steht √5." },
              { formel: <><b>= &radic;5 &asymp; 2,236</b></>,
                warum: "Der Grenzwert existiert und ist endlich -> das uneigentliche Integral konvergiert gegen √5." },
            ]}
          />
          <FalleCard>
            Die <b>Unbeschraenktheit uebersehen</b> und einfach 2,5 einsetzen - das gibt Division durch 0. Man MUSS die
            kritische Grenze als Limes behandeln. Existiert der Grenzwert nicht (wird unendlich), <b>divergiert</b> das Integral.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "∫₀² 1/√(6−3x) dx" },
          ]} />
        </Section>

        {/* ============ 11 - PARTIALBRUCHZERLEGUNG ============ */}
        <Section kicker="Aufgabentyp 11" title="Partialbruchzerlegung - Nenner faktorisieren & integrieren">
          <InfoBox title="Idee der Partialbruchzerlegung">
            Einen komplizierten Bruch wie <Frac num={<>7x+13</>} den={<>x&sup2;+5x&minus;6</>} /> zerlegt man in eine Summe einfacher
            Brueche <Frac num="A" den={<>x+6</>} /> + <Frac num="B" den={<>x&minus;1</>} />, die man einzeln integrieren kann (sie liefern ln-Terme).
            Voraussetzung: Nenner in Linearfaktoren zerlegen.
          </InfoBox>
          <LösungsStepper
            quelle="HK INF23 - Aufg. 11"
            aufgabe={<>Berechne &#8747; <Frac num={<>7x + 13</>} den={<>x&sup2; + 5x &minus; 6</>} /> dx.</>}
            schritte={[
              { formel: <>Nenner faktorisieren: x&sup2;+5x&minus;6 = (x+6)(x&minus;1)</>,
                warum: "Nullstellen x=-6 und x=1 (Satz von Vieta: Produkt -6, Summe -5... bzw. +5 mit Vorzeichen). Linearfaktoren sind die Basis der Zerlegung." },
              { formel: <>Ansatz: <Frac num={<>7x+13</>} den={<>(x+6)(x&minus;1)</>} /> = <Frac num="A" den={<>x+6</>} /> + <Frac num="B" den={<>x&minus;1</>} /></>,
                warum: "Pro Linearfaktor ein Partialbruch mit unbekanntem Zaehler A bzw. B." },
              { formel: <>Beide Seiten &middot;(x+6)(x&minus;1): 7x+13 = A(x&minus;1) + B(x+6)</>,
                warum: "Nenner wegmultiplizieren - jetzt eine Gleichung fuer alle x, aus der wir A und B bestimmen." },
              { formel: <>x = 1: 20 = 7B &rArr; B = <Frac num="20" den="7" /></>,
                warum: "Geschickte Werte einsetzen (Einsetzmethode): bei x=1 faellt der A-Term weg." },
              { formel: <>x = &minus;6: &minus;29 = &minus;7A &rArr; A = <Frac num="29" den="7" /></>,
                warum: "Bei x=-6 faellt der B-Term weg; -42+13 = -29." },
              { formel: <>&#8747;(<Frac num="29/7" den={<>x+6</>} /> + <Frac num="20/7" den={<>x&minus;1</>} />) dx</>,
                warum: "Jeder Summand ist jetzt ein Grundintegral der Form ∫ 1/(x-a) dx = ln|x-a|." },
              { formel: <><b>= <Frac num="29" den="7" /> ln|x+6| + <Frac num="20" den="7" /> ln|x&minus;1| + C</b></>,
                warum: "∫ 1/(x+6) dx = ln|x+6| usw. Betragsstriche, weil das Argument negativ sein kann." },
            ]}
          />
          <InfoBox title="Zusatzfrage: 'Wann darf ueber [a,b] integriert werden?'">
            Nur wenn <b style={{ color: C.text }}>keine Nullstelle des Nenners</b> im Intervall [a,b] liegt. Hier waeren das
            x = &minus;6 und x = 1 - das Intervall darf diese Polstellen nicht enthalten, sonst ist das Integral uneigentlich.
          </InfoBox>
          <FalleCard>
            <b>Betragsstriche bei ln vergessen</b>: korrekt ist ln|x&minus;1|, nicht ln(x&minus;1). Und Vorzeichenfehler beim
            Faktorisieren: x&sup2;+5x&minus;6 = (x+6)(x&minus;1), NICHT (x&minus;6)(x+1) - immer durch Ausmultiplizieren gegenpruefen.
          </FalleCard>
          <Varianten items={[
            { q: "NK INF23:", t: "∫ (7+3x)/(x²−5x+6) dx ,  Nenner = (x−2)(x−3)" },
          ]} />
        </Section>

        {/* ============ 12 - BONUS INF24 ============ */}
        <Section kicker="Aufgabentyp 12 &middot; Bonus (nur INF24)" title="Kurvendiskussion der Glockenkurve & vollstaendige Induktion">
          <LösungsStepper
            quelle="INF24 - Bonus: Glockenkurve"
            aufgabe={<>Untersuche f(x) = e<sup>&minus;x&sup2;/2</sup>: globales Maximum, Konkavitaet auf [&minus;0,5; 0,5], Wendepunkte.</>}
            schritte={[
              { formel: <>f'(x) = &minus;x &middot; e<sup>&minus;x&sup2;/2</sup></>,
                warum: "Kettenregel: innere Ableitung von -x²/2 ist -x. Die e-Funktion bleibt." },
              { formel: <>f'(x) = 0 &rArr; x = 0 (e-Term nie 0).</>,
                warum: "Ein Produkt ist 0, wenn ein Faktor 0 ist; e^{...} > 0 immer, also nur x=0." },
              { formel: <>f(0) = e<sup>0</sup> = 1 &rArr; globales Maximum (1; 0).</>,
                warum: "Bei x=0 ist die Funktion am groessten; sie faellt nach beiden Seiten symmetrisch ab." },
              { formel: <>f''(x) = (x&sup2; &minus; 1) e<sup>&minus;x&sup2;/2</sup></>,
                warum: "Produkt- und Kettenregel auf f'. Das Vorzeichen von f'' steuert die Kruemmung." },
              { formel: <>Auf [&minus;0,5; 0,5]: x&sup2;&minus;1 &lt; 0 &rArr; f'' &lt; 0 &rArr; konkav.</>,
                warum: "Fuer |x|<1 ist x²-1 negativ, also f''<0 -> Rechtskruemmung (konkav)." },
              { formel: <><b>Wendepunkte: f''=0 &rArr; x = &plusmn;1; konvex fuer |x| &gt; 1.</b></>,
                warum: "Bei x=±1 wechselt die Kruemmung. Ausserhalb [-1,1] ist x²-1>0 -> f''>0 -> konvex." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              quelle="INF24 - Bonus: Induktion"
              aufgabe={<>Zeige per vollstaendiger Induktion: &#8721;<sub>k=1</sub><sup>n</sup> (2k&minus;1) = n&sup2;.</>}
              schritte={[
                { formel: <>Induktionsanfang n=1: linke Seite = 2&middot;1&minus;1 = 1 = 1&sup2;. &#10003;</>,
                  warum: "Die Aussage fuer den kleinsten Fall (n=1) direkt nachrechnen - sie stimmt." },
                { formel: <>Induktionsannahme: &#8721;<sub>k=1</sub><sup>n</sup>(2k&minus;1) = n&sup2; gelte.</>,
                  warum: "Wir nehmen an, die Formel sei fuer ein beliebiges n schon wahr (Annahme), und schliessen auf n+1." },
                { formel: <>Schritt n&rarr;n+1: &#8721;<sub>k=1</sub><sup>n+1</sup> = n&sup2; + (2(n+1)&minus;1)</>,
                  warum: "Die Summe bis n+1 = (Summe bis n, das ist n² nach Annahme) + das neue Glied fuer k=n+1." },
                { formel: <>= n&sup2; + 2n + 2 &minus; 1 = n&sup2; + 2n + 1</>,
                  warum: "Das neue Glied 2(n+1)-1 = 2n+1 ausrechnen und addieren." },
                { formel: <><b>= (n+1)&sup2;</b> &#10003;</>,
                  warum: "Erste binomische Formel: n²+2n+1 = (n+1)² - genau die Behauptung fuer n+1. Induktion abgeschlossen." },
              ]}
            />
          </div>
          <FalleCard>
            Bei der Induktion den <b>Induktionsschritt</b> nicht sauber von der <b>Annahme</b> trennen, oder die
            Annahme gar nicht benutzen. Der entscheidende Trick: die Summe bis n+1 in (Summe bis n) + (neues Glied) aufspalten
            und dann die Annahme n&sup2; einsetzen.
          </FalleCard>
        </Section>

        {/* ============ PRUEFUNGSSTRATEGIE ============ */}
        <Section kicker="Klausurtaktik" title="Pruefungsstrategie - 75 Minuten clever einteilen">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.good, marginBottom: 10 }}>1. Sichere Punkte zuerst</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
                Erst die Typen, die du sicher beherrschst (oft Ableitungen, Folgen-Grenzwerte, Reihen). Schnelle Punkte
                holen, Selbstvertrauen aufbauen - nicht an Aufgabe 1 festbeissen.
              </div>
            </Card>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.accent, marginBottom: 10 }}>2. Zeit pro Punkt</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
                75 Minuten auf die Punkte verteilen: grob <b style={{ color: C.text }}>1 Minute pro Punkt</b> als Richtwert.
                Mehr Punkte = mehr Zeit. Einen Puffer von ~10 Min am Ende zum Kontrollieren lassen.
              </div>
            </Card>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.gold, marginBottom: 10 }}>3. Teilpunkte mitnehmen</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
                Ansatz hinschreiben, auch wenn das Ergebnis nicht fertig wird - Methode erkennen (z. B. "Leibniz",
                "partielle Integration") gibt oft schon Punkte. Nichts leer lassen.
              </div>
            </Card>
          </div>
        </Section>

        {/* ============ ZUSAMMENFASSUNG ============ */}
        <Section kicker="Auf einen Blick" title="Aufgabentyp → Schluesselmethode → typische Falle">
          <Card style={{ background: `${C.accent}0c`, borderColor: `${C.accent}33`, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: C.panel2, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: C.accent, fontWeight: 700 }}>Typ</th>
                    <th style={{ padding: "10px 14px", color: C.accent2, fontWeight: 700 }}>Schluesselmethode</th>
                    <th style={{ padding: "10px 14px", color: C.warn, fontWeight: 700 }}>Typische Falle</th>
                  </tr>
                </thead>
                <tbody style={{ color: C.dim }}>
                  {[
                    ["Unstetigkeit", "links-/rechtsseitigen Grenzwert vergleichen", "Oszillation vs. Polstelle verwechseln"],
                    ["Folgen-Grenzwerte", "hoechste n-Potenz kuerzen", "n/n = 1, nicht 0"],
                    ["Reihen", "Kriterium waehlen (Leibniz/geom./harm.)", "1/n -> 0 heisst NICHT konvergent"],
                    ["Verkettung", "g(f(x)), Definitionsbereich von f", "Definitionsbereich vergessen"],
                    ["Grenzwert-Beweis", "Ableitungsdefinition", "Zirkelschluss mit L'Hospital"],
                    ["Ableitungen", "Ketten-/Produkt-/log. Ableitung", "innere Ableitung vergessen"],
                    ["L'Hospital", "Zaehler & Nenner getrennt ableiten", "Quotientenregel statt getrennt"],
                    ["Taylorreihe", "f^(k)(0) / k! einsetzen", "Fakultaet im Nenner vergessen"],
                    ["Integrale", "partielle Int. / Substitution", "+C vergessen, u falsch waehlen"],
                    ["Uneigentl. Integral", "kritische Grenze als Limes", "Unbeschraenktheit uebersehen"],
                    ["Partialbruchzerlegung", "Nenner faktorisieren, A,B bestimmen", "Betrag bei ln, Vorzeichen"],
                    ["Bonus (INF24)", "Kurvendiskussion / Induktion", "Annahme im Schritt nicht nutzen"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td style={{ padding: "9px 14px", color: C.text, fontWeight: 600 }}>{row[0]}</td>
                      <td style={{ padding: "9px 14px" }}>{row[1]}</td>
                      <td style={{ padding: "9px 14px" }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* ============ GLOSSAR ============ */}
        <Section kicker="Nachschlagen" title="Glossar - alle Begriffe & Symbole">
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px 28px" }}>
              <GlossEntry term="Unstetigkeit" def="Stelle, an der eine Funktion nicht durchgaengig ist: hebbar, Sprung, Polstelle oder Oszillation." />
              <GlossEntry term="hebbare Unstetigkeit" def="Links- und rechtsseitiger Grenzwert gleich, nur der Funktionswert fehlt (Loch)." />
              <GlossEntry term="Sprungstelle" def="Links- und rechtsseitiger Grenzwert existieren, sind aber verschieden." />
              <GlossEntry term="Polstelle" def="Mindestens ein einseitiger Grenzwert ist +/- unendlich." />
              <GlossEntry term="Oszillation" def="Funktion schwingt unendlich oft, kein Grenzwert (z. B. sin(1/x) bei 0)." />
              <GlossEntry term="Grenzwert (lim)" def="Wert, dem sich eine Funktion/Folge naehert, wenn x bzw. n gegen etwas laeuft." />
              <GlossEntry term="Konvergenz" def="Eine Folge/Reihe naehert sich einem festen, endlichen Wert." />
              <GlossEntry term="Divergenz" def="Eine Folge/Reihe naehert sich keinem endlichen Wert (waechst unbegrenzt oder pendelt)." />
              <GlossEntry term="Leibniz-Kriterium" def="Alternierende Reihe mit monoton fallender Nullfolge konvergiert." />
              <GlossEntry term="geometrische Reihe" def="Summe q^n; konvergiert genau dann, wenn |q| < 1 (Summe 1/(1-q))." />
              <GlossEntry term="harmonische Reihe" def="Summe 1/n; divergiert, obwohl die Glieder gegen 0 gehen." />
              <GlossEntry term="notwendiges Kriterium" def="Gehen die Glieder nicht gegen 0, divergiert die Reihe sicher." />
              <GlossEntry term="Verkettung (g∘f)" def="g(f(x)) - erst f, dann g; Reihenfolge beachten." />
              <GlossEntry term="Definitionsbereich" def="Menge aller x, fuer die die Funktion erlaubt ist (z. B. Radikand >= 0)." />
              <GlossEntry term="Umkehrfunktion (f⁻¹)" def="Macht f rueckgaengig; y=f(x) nach x aufloesen, dann tauschen." />
              <GlossEntry term="L'Hospital" def="Bei 0/0 oder unendl./unendl.: Zaehler und Nenner getrennt ableiten." />
              <GlossEntry term="Kettenregel" def="(f(g(x)))' = f'(g(x))*g'(x): aeussere mal innere Ableitung." />
              <GlossEntry term="Produktregel" def="(u*v)' = u'v + uv'." />
              <GlossEntry term="logarithmische Ableitung" def="Bei x^x o. ae.: erst ln nehmen, dann implizit ableiten." />
              <GlossEntry term="Taylorreihe" def="Naeherung f(x) = Summe f^(k)(a)/k! * (x-a)^k; hier a=0." />
              <GlossEntry term="Fakultaet (n!)" def="Produkt 1*2*...*n; 2!=2, 3!=6." />
              <GlossEntry term="partielle Integration" def="∫ u'v = uv − ∫ uv'; fuer Produkte." />
              <GlossEntry term="Substitution" def="Innere Funktion u setzen; ∫ f(g)g' dx = ∫ f(u) du." />
              <GlossEntry term="uneigentliches Integral" def="Integrand/Grenze unbeschraenkt; kritische Grenze als Limes behandeln." />
              <GlossEntry term="Partialbruchzerlegung" def="Bruch in A/(x-a)+B/(x-b) zerlegen, dann einzeln integrieren." />
              <GlossEntry term="konkav" def="Rechtsgekruemmt, f'' < 0 ('nach unten geoeffnet')." />
              <GlossEntry term="konvex" def="Linksgekruemmt, f'' > 0 ('nach oben geoeffnet')." />
              <GlossEntry term="Wendepunkt" def="Stelle, an der die Kruemmung wechselt (f'' = 0 mit Vorzeichenwechsel)." />
              <GlossEntry term="vollstaendige Induktion" def="Beweis: Anfang (n=1) + Schritt (n -> n+1) unter Nutzung der Annahme." />
              <GlossEntry term="ln" def="Natuerlicher Logarithmus (Umkehrung der e-Funktion)." />
              <GlossEntry term="Integrationskonstante C" def="Bei unbestimmten Integralen immer + C dazu." />
            </div>
          </Card>
        </Section>

        <footer style={{ textAlign: "center", color: C.dim, fontSize: 13, paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
          Prof. Dr. Veronika Lesch &middot; DHBW Mosbach &middot; INF23 Haupt-/Nachklausur + INF24 Hauptklausur
        </footer>
      </main>
    </div>
  );
}
