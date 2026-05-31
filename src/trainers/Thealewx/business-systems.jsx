import React, { useState, useEffect, useRef } from "react";

/* =====================================================================
   FESTES DESIGN-SYSTEM (Dark Theme)
   Nur accent & accent2 sind thematisch angepasst:
   - accent  (#7dd3fc cyan)   = die zentrale Middleware / Integrationsschicht,
                                das verbindende Element von EAI.
   - accent2 (#a78bfa violett)= die angebundenen Anwendungssysteme &
                                Konzept-Einschübe (InfoBox).
   Alle übrigen Farben exakt beibehalten.
   ===================================================================== */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc", // cyan – zentrale Middleware / Integrationsschicht
  accent2: "#a78bfa", // violett – angebundene Anwendungssysteme / Konzept-Einschübe
  good: "#86efac", // grün – Erfolg/Treffer
  warn: "#fca5a5", // rot – Problem/Fehler
  gold: "#fcd34d", // gelb – Highlight
};

/* =====================================================================
   GLOBALE KEYFRAMES & BASIS-STYLES
   ===================================================================== */
const STYLES = `
  @keyframes pop {
    0%   { transform: scale(0.6); opacity: 0; }
    60%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes flowDash {
    to { stroke-dashoffset: -16; }
  }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(125,211,252,0.0); }
    50%     { box-shadow: 0 0 0 6px rgba(125,211,252,0.18); }
  }
  @keyframes blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.35; }
  }
  .eai-root *::-webkit-scrollbar { height: 8px; width: 8px; }
  .eai-root *::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 8px; }
  .eai-pop { animation: pop .35s cubic-bezier(.34,1.56,.64,1) both; }
`;

/* =====================================================================
   useReveal – sanftes Einblenden beim Scrollen
   (IntersectionObserver = Browser-API, die meldet, wann ein Element
    in den sichtbaren Bereich scrollt)
   ===================================================================== */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

/* =====================================================================
   WIEDERVERWENDBARE BAUSTEINE
   ===================================================================== */
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
      {kicker && (
        <div
          style={{
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          {kicker}
        </div>
      )}
      <h2 style={{ fontSize: 30, lineHeight: 1.2, margin: "0 0 20px", fontWeight: 800 }}>
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

function Tag({ color = C.accent, children }) {
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
        background: "rgba(167,139,250,0.10)", // accent2-getönt
        border: `1px solid ${C.accent2}`,
        borderRadius: 14,
        padding: "18px 20px",
        margin: "18px 0",
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
        <span>💡</span>
        {title}
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
        gap: 16,
        alignItems: "flex-start",
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <div style={{ width: 5, alignSelf: "stretch", borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <strong style={{ fontSize: 16 }}>{name}</strong>
          {formula && (
            <code
              style={{
                background: C.bg,
                border: `1px solid ${C.line}`,
                color: C.accent,
                padding: "3px 9px",
                borderRadius: 7,
                fontSize: 13,
              }}
            >
              {formula}
            </code>
          )}
        </div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{note}</div>
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
        padding: "14px 16px",
      }}
    >
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

/* Button-Styles */
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

/* Kleine Player-Steuerung (wiederverwendet von allen Visualisierungen) */
function PlayerControls({ playing, onToggle, onPrev, onNext, onReset, info }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 18 }}>
      <button style={btn} onClick={onToggle}>
        {playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button style={btnGhost} onClick={onPrev}>
        ◀ Schritt
      </button>
      <button style={btnGhost} onClick={onNext}>
        Schritt ▶
      </button>
      <button style={btnGhost} onClick={onReset}>
        ↺ Reset
      </button>
      {info && <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>{info}</span>}
    </div>
  );
}

/* =====================================================================
   VISUALISIERUNG 1 — Spaghetti vs. zentrale Middleware
   Zeigt live, wie viele Punkt-zu-Punkt-Schnittstellen entstehen und
   wie die Middleware sie auf wenige Verbindungen reduziert.
   ===================================================================== */
function VisSpaghetti() {
  // Modus: "p2p" = Punkt-zu-Punkt, "mw" = Middleware
  const [mode, setMode] = useState("p2p");
  const [n, setN] = useState(3); // Anzahl Systeme (3..6)
  const [playing, setPlaying] = useState(true);

  // Auto-Play: lässt die Systemanzahl wachsen, damit man den
  // explodierenden Schnittstellen-Aufwand "fühlt".
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setN((prev) => (prev >= 6 ? 3 : prev + 1));
    }, 1400);
    return () => clearInterval(id);
  }, [playing]);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const R = 118; // Radius des Systemkreises
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), id: i };
  });

  // Anzahl Verbindungen:
  // P2P (bidirektional, ohne Doppelung) = n*(n-1)/2
  // Middleware = n (jedes System nur zur Mitte)
  const p2pCount = (n * (n - 1)) / 2;
  const mwCount = n;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <strong style={{ fontSize: 17 }}>Schnittstellen-Explosion vs. zentrale Drehscheibe</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={mode === "p2p" ? btn : btnGhost}
            onClick={() => setMode("p2p")}
          >
            Punkt-zu-Punkt
          </button>
          <button
            style={mode === "mw" ? btn : btnGhost}
            onClick={() => setMode("mw")}
          >
            Middleware
          </button>
        </div>
      </div>
      <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
        Beobachte, wie die Zahl der Verbindungen wächst, wenn Systeme hinzukommen. Bei
        Punkt-zu-Punkt muss jedes System mit jedem anderen direkt sprechen
        (das ist die berüchtigte „Spaghetti-Landschaft"); die Middleware bündelt alles
        über eine zentrale Stelle.
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: 360 }}>
          {/* Verbindungen */}
          {mode === "p2p"
            ? nodes.map((a, i) =>
                nodes.slice(i + 1).map((b, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={C.warn}
                    strokeWidth="2"
                    strokeDasharray="6 5"
                    style={{ animation: "flowDash 1s linear infinite", opacity: 0.85 }}
                  />
                ))
              )
            : nodes.map((a, i) => (
                <line
                  key={`mw-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={cx}
                  y2={cy}
                  stroke={C.accent}
                  strokeWidth="2.5"
                  strokeDasharray="6 5"
                  style={{ animation: "flowDash 1s linear infinite" }}
                />
              ))}

          {/* zentrale Middleware (nur im mw-Modus) */}
          {mode === "mw" && (
            <g className="eai-pop">
              <circle cx={cx} cy={cy} r="30" fill={C.panel2} stroke={C.accent} strokeWidth="2.5" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill={C.accent} fontWeight="700">
                MW
              </text>
            </g>
          )}

          {/* Systemknoten */}
          {nodes.map((p) => (
            <g key={p.id} className="eai-pop">
              <rect
                x={p.x - 20}
                y={p.y - 16}
                width="40"
                height="32"
                rx="7"
                fill={C.panel2}
                stroke={C.accent2}
                strokeWidth="2"
              />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fill={C.text} fontWeight="700">
                S{p.id + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          marginTop: 6,
          fontSize: 15,
        }}
      >
        <span>
          Systeme: <strong style={{ color: C.gold }}>{n}</strong>
        </span>
        <span>
          Verbindungen:{" "}
          <strong style={{ color: mode === "p2p" ? C.warn : C.good }}>
            {mode === "p2p" ? p2pCount : mwCount}
          </strong>
        </span>
        <span style={{ color: C.dim }}>
          {mode === "p2p" ? "n·(n−1)/2" : "n"}
        </span>
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => {
          setPlaying(false);
          setN((p) => (p <= 3 ? 6 : p - 1));
        }}
        onNext={() => {
          setPlaying(false);
          setN((p) => (p >= 6 ? 3 : p + 1));
        }}
        onReset={() => {
          setN(3);
          setMode("p2p");
          setPlaying(true);
        }}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.accent2}>System (Anwendung)</Tag>
        <Tag color={C.accent}>Middleware</Tag>
        <Tag color={C.warn}>P2P-Verbindung (wächst quadratisch)</Tag>
        <Tag color={C.good}>Reduzierte Anzahl</Tag>
      </div>
    </Card>
  );
}

/* =====================================================================
   VISUALISIERUNG 2 — Middleware-Pipeline mit IDoc → Mapping → Ziel
   Animierter Stepper: Ein Datenpaket wandert vom SAP-System durch die
   Middleware (Mapping/Format-Umwandlung) zum Zielsystem.
   ===================================================================== */
const PIPE_STEPS = [
  {
    label: "SAP erzeugt IDoc",
    desc: "Das SAP-System verpackt einen Geschäftsbeleg (z. B. eine Bestellung) in ein IDoc – das ist SAPs standardisiertes Austauschformat (IDoc = Intermediate Document).",
    pos: 0,
    format: "IDoc",
    fcolor: C.accent2,
  },
  {
    label: "Senden an Middleware",
    desc: "Das IDoc verlässt SAP und wird an die Middleware (zentrale Vermittlungsschicht) übertragen. SAP muss das Zielformat nicht kennen.",
    pos: 1,
    format: "IDoc",
    fcolor: C.accent2,
  },
  {
    label: "Mapping / Umwandlung",
    desc: "Die Middleware führt ein Mapping durch (Mapping = regelbasiertes Übersetzen von Feldern) und wandelt das IDoc in das Format um, das das Zielsystem versteht – z. B. XML.",
    pos: 2,
    format: "→ XML",
    fcolor: C.gold,
  },
  {
    label: "Bereitstellen für Zielsystem",
    desc: "Die Middleware stellt die umgewandelten Daten dem Zielsystem (hier: ein Warehouse-/Lagersystem) im passenden Format bereit.",
    pos: 3,
    format: "XML",
    fcolor: C.accent,
  },
  {
    label: "Verarbeitung im Zielsystem",
    desc: "Das Zielsystem verarbeitet die relevanten Daten. Die Integration ist abgeschlossen – ganz ohne direkte SAP↔Ziel-Kopplung.",
    pos: 3,
    format: "OK",
    fcolor: C.good,
  },
];

function VisPipeline() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => (s >= PIPE_STEPS.length - 1 ? 0 : s + 1));
    }, 2000);
    return () => clearInterval(id);
  }, [playing]);

  const cur = PIPE_STEPS[step];
  // Drei Stationen: SAP (links), Middleware (mitte), Zielsystem (rechts)
  const stations = [
    { name: "SAP-System", x: 70, color: C.accent2 },
    { name: "Middleware", x: 250, color: C.accent },
    { name: "Warehouse", x: 430, color: C.accent2 },
  ];
  // Paket-X-Position je nach pos (0..3)
  const packetX = [70, 160, 250, 430][cur.pos];
  const doneAtTarget = step >= 4;

  return (
    <Card>
      <strong style={{ fontSize: 17 }}>Datenfluss über die Middleware (SAP-Beispiel)</strong>
      <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
        Ein Beleg wandert vom SAP-System durch die Middleware bis ins Zielsystem.
        Achte auf das Datenpaket (gelb hervorgehoben) und wie sich sein Format ändert.
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg viewBox="0 0 500 200" width="100%" style={{ maxWidth: 520 }}>
          {/* Verbindungslinie */}
          <line x1="70" y1="120" x2="430" y2="120" stroke={C.line} strokeWidth="3" />
          <line
            x1="70"
            y1="120"
            x2="430"
            y2="120"
            stroke={C.accent}
            strokeWidth="3"
            strokeDasharray="7 6"
            style={{ animation: "flowDash 1s linear infinite", opacity: 0.6 }}
          />

          {/* Stationen */}
          {stations.map((st, i) => {
            const active =
              (i === 0 && cur.pos <= 1) ||
              (i === 1 && cur.pos === 2) ||
              (i === 2 && cur.pos === 3);
            return (
              <g key={st.name}>
                <rect
                  x={st.x - 42}
                  y={88}
                  width="84"
                  height="64"
                  rx="11"
                  fill={C.panel2}
                  stroke={active ? C.gold : st.color}
                  strokeWidth={active ? 3 : 2}
                  style={{ transition: "stroke .3s" }}
                />
                <text x={st.x} y={124} textAnchor="middle" fontSize="12" fill={C.text} fontWeight="700">
                  {st.name}
                </text>
              </g>
            );
          })}

          {/* wanderndes Datenpaket */}
          <g style={{ transition: "transform .6s cubic-bezier(.4,1.3,.5,1)" }} transform={`translate(${packetX},60)`}>
            <rect
              x={-26}
              y={-16}
              width="52"
              height="30"
              rx="7"
              fill={C.bg}
              stroke={cur.fcolor}
              strokeWidth="2.5"
              style={{ animation: doneAtTarget ? "none" : "pulseGlow 1.4s ease-in-out infinite" }}
            />
            <text x={0} y={4} textAnchor="middle" fontSize="12" fill={cur.fcolor} fontWeight="700">
              {cur.format}
            </text>
          </g>
        </svg>
      </div>

      {/* Schritt-Erklärung */}
      <div
        style={{
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: "14px 16px",
          marginTop: 8,
        }}
      >
        <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          Schritt {step + 1}/{PIPE_STEPS.length}: {cur.label}
        </div>
        <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>{cur.desc}</div>
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => {
          setPlaying(false);
          setStep((s) => (s <= 0 ? PIPE_STEPS.length - 1 : s - 1));
        }}
        onNext={() => {
          setPlaying(false);
          setStep((s) => (s >= PIPE_STEPS.length - 1 ? 0 : s + 1));
        }}
        onReset={() => {
          setStep(0);
          setPlaying(true);
        }}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.accent2}>IDoc (SAP-Format)</Tag>
        <Tag color={C.gold}>Mapping läuft</Tag>
        <Tag color={C.accent}>XML (Zielformat)</Tag>
        <Tag color={C.good}>Verarbeitet</Tag>
      </div>
    </Card>
  );
}

/* =====================================================================
   VISUALISIERUNG 3 — ESB-Verteilmuster: Broadcast (1:n) vs. Pull (n:1)
   Animierter Stepper, der zeigt, wie ein Enterprise Service Bus Daten
   an viele Systeme verteilt oder von vielen einsammelt.
   ===================================================================== */
function VisESB() {
  const [mode, setMode] = useState("broadcast"); // "broadcast" | "pull"
  const [phase, setPhase] = useState(0); // 0 ruhe, 1 unterwegs, 2 angekommen
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 1200);
    return () => clearInterval(id);
  }, [playing]);

  const size = 360;
  const cx = size / 2;
  const busY = size / 2;
  const targets = Array.from({ length: 4 }, (_, i) => ({
    x: 50 + i * ((size - 100) / 3),
    y: 60,
    id: i,
  }));

  // Richtung der Datenpunkte: bei broadcast Bus→oben, bei pull oben→Bus
  const t = phase === 0 ? 0 : phase === 1 ? 0.55 : 1; // Fortschritt
  const dotPos = (tx) => {
    const startY = mode === "broadcast" ? busY : targets[0].y;
    const endY = mode === "broadcast" ? targets[0].y : busY;
    const startX = mode === "broadcast" ? cx : tx;
    const endX = mode === "broadcast" ? tx : cx;
    return { x: startX + (endX - startX) * t, y: startY + (endY - startY) * t };
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
        <strong style={{ fontSize: 17 }}>Enterprise Service Bus: verteilen oder einsammeln</strong>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={mode === "broadcast" ? btn : btnGhost} onClick={() => setMode("broadcast")}>
            Broadcast 1:n
          </button>
          <button style={mode === "pull" ? btn : btnGhost} onClick={() => setMode("pull")}>
            Pull n:1
          </button>
        </div>
      </div>
      <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
        Ein <strong style={{ color: C.accent }}>Enterprise Service Bus (ESB)</strong> – ein
        Sonderfall der Middleware, der wie eine Datenleitung funktioniert – verteilt
        entweder dieselbe Nachricht an viele Systeme (<em>Broadcast, 1:n</em>) oder
        fordert Daten von vielen Systemen an und führt sie zusammen (<em>Pull, n:1</em>).
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${size} ${size * 0.62}`} width="100%" style={{ maxWidth: 420 }}>
          {/* Der Bus (horizontale Leitung) */}
          <rect x="30" y={busY - 14} width={size - 60} height="28" rx="14" fill={C.panel2} stroke={C.accent} strokeWidth="2.5" />
          <text x={cx} y={busY + 5} textAnchor="middle" fontSize="12" fill={C.accent} fontWeight="700">
            ESB
          </text>

          {/* Leitungen + Datenpunkte */}
          {targets.map((tg) => {
            const d = dotPos(tg.x);
            return (
              <g key={tg.id}>
                <line
                  x1={tg.x}
                  y1={tg.y + 16}
                  x2={cx}
                  y2={busY - 14}
                  stroke={C.line}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                {phase !== 0 && (
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r="6"
                    fill={mode === "broadcast" ? C.accent : C.gold}
                    style={{ transition: "cx .9s linear, cy .9s linear" }}
                  />
                )}
                {/* Zielsystem */}
                <rect
                  x={tg.x - 24}
                  y={tg.y - 16}
                  width="48"
                  height="34"
                  rx="7"
                  fill={C.panel2}
                  stroke={phase === 2 ? C.good : C.accent2}
                  strokeWidth="2"
                  style={{ transition: "stroke .3s" }}
                />
                <text x={tg.x} y={tg.y + 5} textAnchor="middle" fontSize="11" fill={C.text} fontWeight="700">
                  S{tg.id + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ textAlign: "center", color: C.dim, fontSize: 14, marginTop: 4 }}>
        {mode === "broadcast"
          ? "Eine Nachricht → an alle vier Systeme gleichzeitig verteilt."
          : "Vier Systeme → ihre Daten werden über den Bus zentral eingesammelt."}
      </div>

      <PlayerControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onPrev={() => {
          setPlaying(false);
          setPhase((p) => (p + 2) % 3);
        }}
        onNext={() => {
          setPlaying(false);
          setPhase((p) => (p + 1) % 3);
        }}
        onReset={() => {
          setPhase(0);
          setMode("broadcast");
          setPlaying(true);
        }}
      />

      <div style={{ marginTop: 14 }}>
        <Tag color={C.accent}>ESB (Datenbus)</Tag>
        <Tag color={C.accent2}>angebundenes System</Tag>
        <Tag color={C.good}>Daten empfangen</Tag>
        <Tag color={C.gold}>Pull-Datenpunkt</Tag>
      </div>
    </Card>
  );
}

/* =====================================================================
   HAUPT-KOMPONENTE
   ===================================================================== */
export default function EAIExplainer() {
  return (
    <div
      className="eai-root"
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily:
          "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <style>{STYLES}</style>

      {/* HERO / HEADER */}
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "72px 24px 32px",
        }}
      >
        <div
          style={{
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Architekturen von Businesssystemen
        </div>
        <h1 style={{ fontSize: 46, lineHeight: 1.1, margin: "0 0 18px", fontWeight: 800 }}>
          Enterprise Application{" "}
          <span style={{ color: C.accent }}>Integration</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.65, color: C.dim, maxWidth: 680 }}>
          In jedem Unternehmen leben Dutzende Software-Systeme nebeneinander – ERP, Lager,
          CRM, Webshop. Sie wurden unabhängig voneinander entwickelt und sprechen oft nicht
          dieselbe „Sprache". <strong style={{ color: C.text }}>Enterprise Application
          Integration (EAI)</strong> ist die Kunst, sie zu einer funktionierenden Einheit zu
          verbinden. Wir bauen das Verständnis Schritt für Schritt auf – mit drei
          interaktiven Visualisierungen, die du selbst steuern kannst.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* 0. DAS PROBLEM */}
        <Section kicker="0 · Motivation" title="Das Problem: Software-Inseln, die nicht reden">
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Ein typisches Unternehmen kauft oder entwickelt seine Systeme über Jahre einzeln:
            ein <strong>ERP-System</strong> (ERP = Enterprise Resource Planning, die zentrale
            Software für Finanzen, Einkauf, Produktion – bei vielen Firmen ist das SAP) für
            die Buchhaltung, ein Lagersystem für die Logistik, ein Webshop für den Verkauf.
            Jedes wurde für sich gebaut und kennt die anderen nicht.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Ohne Integration bedeutet das: Daten werden mehrfach von Hand eingetippt, ein
            Beleg im Webshop landet nicht automatisch im Lager, und niemand hat einen
            Gesamtüberblick. Das kostet Zeit, erzeugt Fehler und macht das Unternehmen träge.
            Genau diese „Software-Inseln" sollen verbunden werden.
          </p>
          <InfoBox title="Definition EAI (so steht es in der Vorlesung)">
            Anwendungsintegration bzw. Enterprise Application Integration ist der Prozess,
            unabhängig voneinander entwickelte Software­anwendungen zu einer funktionierenden
            Einheit zu verbinden. Die Idee: Jede Anwendung kann über eine zentrale Komponente
            mit allen anderen kommunizieren – statt mit jeder einzeln.
          </InfoBox>
        </Section>

        {/* 1. DIE KERNIDEE */}
        <Section kicker="1 · Kernidee" title="Eine zentrale Drehscheibe statt vieler Direktdrähte">
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Die naive Lösung wäre: Verbinde jedes System direkt mit jedem anderen, das es
            braucht. Das nennt man <strong>Punkt-zu-Punkt-Verbindung</strong> (jedes System
            hat eigene direkte Drähte zu den anderen). Schnell gebaut – aber es wird schnell
            unübersichtlich.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Die Kernidee von EAI ist stattdessen eine{" "}
            <strong style={{ color: C.accent }}>zentrale Vermittlungsschicht</strong>: die
            Middleware (wörtlich „Software in der Mitte"). Jedes System spricht nur noch mit
            ihr – und sie verteilt die Daten weiter. Die folgende Visualisierung zeigt, warum
            das einen riesigen Unterschied macht.
          </p>

          <div style={{ marginTop: 8 }}>
            <VisSpaghetti />
          </div>

          <InfoBox title="Warum n·(n−1)/2? (eine kleine Formel-Erklärung)">
            Bei Punkt-zu-Punkt braucht jedes der n Systeme eine Verbindung zu jedem anderen.
            Das sind n·(n−1) gerichtete Drähte; da eine Verbindung beide Richtungen abdeckt,
            teilen wir durch 2: <strong>n·(n−1)/2</strong>. Bei 6 Systemen sind das schon 15
            Schnittstellen. Mit Middleware genügt eine pro System – also nur{" "}
            <strong>n</strong>. Mehr dazu in der Analyse weiter unten.
          </InfoBox>
        </Section>

        {/* 2. DER SCHWIERIGE TEIL */}
        <Section
          kicker="2 · Der schwierige Teil"
          title="Systeme sprechen verschiedene Sprachen"
        >
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Eine zentrale Drehscheibe reicht allein nicht. Das eigentlich Knifflige ist:
            jedes System hat sein <strong>eigenes Datenformat</strong>. SAP verschickt seine
            Belege als <strong>IDoc</strong> (Intermediate Document – SAPs standardisiertes
            Austauschformat), ein Lagersystem erwartet vielleicht <strong>XML</strong>
            {" "}(eXtensible Markup Language – ein textbasiertes, hierarchisches Datenformat),
            ein anderes eine CSV-Datei.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Die Middleware muss deshalb <strong>übersetzen</strong>. Dieses regelbasierte
            Umsetzen von Feldern – „Feld <code style={{ color: C.accent }}>KUNDE</code> aus
            dem IDoc wird zu Feld <code style={{ color: C.accent }}>customerId</code> im
            XML" – heißt <strong>Mapping</strong>. Die nächste Visualisierung zeigt einen
            kompletten Durchlauf am SAP-Beispiel.
          </p>

          <div style={{ marginTop: 8 }}>
            <VisPipeline />
          </div>
        </Section>

        {/* 3. VARIANTEN / VERFAHREN */}
        <Section kicker="3 · Integrationsansätze" title="Drei Wege, Systeme zu verbinden">
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text, marginBottom: 18 }}>
            Die Vorlesung unterscheidet drei Ansätze. Sie unterscheiden sich vor allem darin,
            wie viele Schnittstellen entstehen und wie viel Einrichtungsaufwand nötig ist.
          </p>

          <MethodRow
            color={C.warn}
            name="Punkt-zu-Punkt-Verbindung"
            formula="O(n²)"
            note="Jedes System direkt mit jedem verbunden. Schnell und einfach umzusetzen, aber die Zahl der Schnittstellen wächst quadratisch (O(n²) heißt: rund proportional zum Quadrat der Systemzahl) – die berüchtigte „Spaghetti-Landschaft“."
          />
          <MethodRow
            color={C.accent}
            name="Enterprise Service Bus (ESB)"
            formula="1:n / n:1"
            note="Eine zentrale Datenleitung, die Nachrichten an viele Systeme verteilt (Broadcast, 1:n) oder von vielen einsammelt (Pull, n:1). Sehr flexibel, aber hohe Startkosten."
          />
          <MethodRow
            color={C.accent2}
            name="Middleware-basierte Integration"
            formula="O(n)"
            note="Zentrale, vermittelnde Softwareschicht zwischen den Systemen. Hersteller- und plattformunabhängiger Datenaustausch, reduziert das Schnittstellen-Chaos auf O(n) – dafür einrichtungsintensiv mit hohen Startkosten."
          />

          <div style={{ marginTop: 8 }}>
            <VisESB />
          </div>
        </Section>

        {/* 4. SONDERFALL: EDI */}
        <Section kicker="4 · Sonderfall" title="EDI – Integration über Unternehmensgrenzen hinweg">
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Bisher ging es um Systeme <em>innerhalb</em> eines Unternehmens. Sobald aber zwei
            <strong> verschiedene Firmen</strong> automatisch Dokumente austauschen wollen –
            etwa Bestellungen und Rechnungen –, kommt <strong>EDI</strong> ins Spiel.
          </p>
          <InfoBox title="Was ist EDI?">
            EDI (Electronic Data Interchange, deutsch: elektronischer Datenaustausch)
            bezeichnet den Austausch elektronischer Geschäftsdokumente zwischen
            Geschäftspartnern. Damit Firmen unterschiedlicher Größe, Branche und Länder
            zusammenpassen, nutzt man <strong>Standards</strong> – z. B.{" "}
            <strong>EDIFACT</strong> bzw. <strong>EANCOM</strong> als Nachrichtenstandards
            und Identifikationsstandards der GS1 wie <strong>GLN</strong> (Global Location
            Number – eindeutige Adresse eines Standorts), <strong>GTIN</strong> (Global Trade
            Item Number – die Artikelnummer hinter dem Barcode) oder <strong>SSCC</strong>
            {" "}(Serial Shipping Container Code – die eindeutige Nummer einer Versandeinheit).
          </InfoBox>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Der Nutzen ist konkret messbar: Laut den in der Vorlesung zitierten Studien lassen
            sich pro Geschäftsfall – von der Bestellabwicklung bis zur Rechnungsstellung – bis
            zu <strong style={{ color: C.good }}>51 €</strong> einsparen, weil das manuelle
            Abtippen entfällt.
          </p>
        </Section>

        {/* 5. ANALYSE */}
        <Section kicker="5 · Analyse" title="Aufwand, Vorteile und Stolpersteine">
          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.text }}>
            Wenn man EAI „analysiert", betrachtet man vor allem den{" "}
            <strong>Schnittstellen-Aufwand</strong>. Hier hilft die O-Notation (sprich:
            „Groß-O") – eine kompakte Schreibweise, die beschreibt, wie stark eine Größe mit
            der Eingabe wächst, ohne sich um konstante Faktoren zu kümmern.
          </p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 4 }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>Punkt-zu-Punkt</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.warn }}>O(n²)</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, marginTop: 6 }}>
                Genau n·(n−1)/2 Schnittstellen. Doppelt so viele Systeme → grob viermal so
                viele Verbindungen. Skaliert schlecht.
              </div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.good, fontWeight: 700, marginBottom: 6 }}>Middleware / EAI</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.good }}>O(n)</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55, marginTop: 6 }}>
                n Anbindungen (eine je System). Doppelt so viele Systeme → doppelt so viele
                Verbindungen. Skaliert linear.
              </div>
            </Card>
          </div>

          <InfoBox title="Was bedeutet O-Notation hier konkret?">
            O(n²) heißt nicht „genau n² Verbindungen", sondern: der Aufwand wächst{" "}
            <em>proportional zum Quadrat</em> der Systemzahl, wenn man große n betrachtet. Der
            konstante Faktor (hier ½) wird in der O-Notation weggelassen, weil er das
            Wachstumsverhalten nicht ändert. Der Sprung von O(n²) auf O(n) ist der zentrale
            quantitative Vorteil von EAI.
          </InfoBox>

          <h3 style={{ fontSize: 19, margin: "26px 0 12px" }}>Vorteile (Korrektheit & Nutzen)</h3>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: C.text, marginTop: 0 }}>
            Durchgängige, automatisierte Geschäftsprozesse ohne manuelles Eingreifen
            (Kostenersparnis); hohe Datenqualität durch saubere Anbindung; eine zentrale
            Middleware reduziert Komplexität und Schnittstellenzahl; und das Monitoring
            (zentrale Systemüberwachung) läuft über eine einzige Plattform.
          </p>

          <h3 style={{ fontSize: 19, margin: "22px 0 12px" }}>Herausforderungen (die Stolpersteine)</h3>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: C.text, marginTop: 0 }}>
            EAI ist kein fertiges Produkt, sondern eine <strong>Architektur</strong> – das
            wird oft falsch verstanden. Typische Risiken: fehlende Strategie und Rückendeckung
            der Geschäftsführung, mangelhafte Kommunikation zwischen Teams, unzureichende
            Tools, ein zu enger Fokus (Performance und Sicherheits-Monitoring werden
            unterschätzt) und fehlende qualifizierte Ressourcen.
          </p>
        </Section>

        {/* 6. ZUSAMMENFASSUNG */}
        <Section kicker="6 · Auf einen Blick" title="Das Wichtigste in drei Sätzen">
          <Card
            style={{
              background: "rgba(125,211,252,0.08)",
              border: `1px solid ${C.accent}`,
            }}
          >
            <ol style={{ margin: 0, paddingLeft: 22, fontSize: 16, lineHeight: 1.85 }}>
              <li>
                <strong>Problem:</strong> Unabhängig gewachsene Systeme sprechen verschiedene
                Sprachen; Punkt-zu-Punkt-Verbindungen führen zur Spaghetti-Landschaft
                (O(n²)).
              </li>
              <li>
                <strong>Lösung:</strong> Eine zentrale <span style={{ color: C.accent }}>Middleware</span>
                {" "}(bzw. ein ESB) vermittelt, übersetzt per Mapping zwischen Formaten und
                senkt den Aufwand auf O(n).
              </li>
              <li>
                <strong>Im SAP-Umfeld:</strong> Daten fließen als IDoc in die Middleware,
                werden z. B. nach XML umgewandelt und dem Zielsystem bereitgestellt – über
                Firmengrenzen hinweg per EDI mit Standards wie EDIFACT und GS1.
              </li>
            </ol>
          </Card>
        </Section>

        {/* 7. GLOSSAR */}
        <Section kicker="7 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            }}
          >
            <GlossEntry term="EAI" def="Enterprise Application Integration – Verbinden unabhängig entwickelter Anwendungen zu einer funktionierenden Einheit über eine zentrale Komponente." />
            <GlossEntry term="Middleware" def="„Software in der Mitte“: zentrale, vermittelnde Softwareschicht zwischen Systemen; ermöglicht hersteller- und plattformunabhängigen Datenaustausch." />
            <GlossEntry term="Punkt-zu-Punkt" def="Direkte Verbindung jedes Systems mit jedem anderen. Einfach, aber O(n²) Schnittstellen → Spaghetti-Landschaft." />
            <GlossEntry term="ESB" def="Enterprise Service Bus – Middleware als zentrale Datenleitung; verteilt 1:n (Broadcast) oder sammelt n:1 (Pull) ein." />
            <GlossEntry term="IDoc" def="Intermediate Document – SAPs standardisiertes Format zum Austausch von Geschäftsbelegen mit anderen Systemen." />
            <GlossEntry term="Mapping" def="Regelbasiertes Übersetzen von Datenfeldern eines Formats in ein anderes (z. B. IDoc-Feld → XML-Feld)." />
            <GlossEntry term="XML" def="eXtensible Markup Language – textbasiertes, hierarchisches Datenformat, das viele Zielsysteme verarbeiten können." />
            <GlossEntry term="EDI" def="Electronic Data Interchange – elektronischer Austausch von Geschäftsdokumenten zwischen Geschäftspartnern." />
            <GlossEntry term="EDIFACT / EANCOM" def="Internationale Nachrichtenstandards für EDI, die Format und Aufbau der ausgetauschten Dokumente festlegen." />
            <GlossEntry term="GS1" def="Organisation hinter weltweiten Identifikationsstandards (GLN, GTIN, SSCC), damit Partner branchen- und länderübergreifend kompatibel sind." />
            <GlossEntry term="GLN" def="Global Location Number – eindeutige Nummer zur Identifikation eines Standorts oder Unternehmens." />
            <GlossEntry term="GTIN" def="Global Trade Item Number – weltweit eindeutige Artikelnummer, die hinter dem Barcode steckt." />
            <GlossEntry term="SSCC" def="Serial Shipping Container Code – eindeutige Nummer einer einzelnen Versandeinheit (z. B. einer Palette)." />
            <GlossEntry term="ERP" def="Enterprise Resource Planning – zentrale Unternehmenssoftware für Finanzen, Einkauf, Produktion u. a. (z. B. SAP)." />
            <GlossEntry term="O(n) / O(n²)" def="O-Notation („Groß-O“): beschreibt das Wachstum einer Größe mit der Eingabe. O(n) = linear, O(n²) = quadratisch." />
            <GlossEntry term="Monitoring" def="Zentrale, kontinuierliche Überwachung aller angebundenen Systeme über eine einzige Plattform." />
          </div>
        </Section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "26px 24px 40px",
          textAlign: "center",
          color: C.dim,
          fontSize: 13.5,
          lineHeight: 1.7,
        }}
      >
        <div>
          <strong style={{ color: C.text }}>Architekturen von Businesssystemen INF22</strong> · Kapitel 6:
          Enterprise Application Integration
        </div>
        <div>Özcan Yakup Akbulut · DHBW Mosbach · Bad Mergentheim</div>
        <div style={{ marginTop: 6, color: C.line }}>Interaktiver Lern-Erklärer · Dark Theme</div>
      </footer>
    </div>
  );
}