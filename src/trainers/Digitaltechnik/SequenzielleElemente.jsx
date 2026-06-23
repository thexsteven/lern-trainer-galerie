import { useState, useEffect, useRef, useCallback } from "react";

// ─── Design-System ───────────────────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  panel:   "#171a23",
  panel2:  "#1e222e",
  line:    "#2a2f3d",
  text:    "#e6e8ee",
  dim:     "#9aa1b1",
  accent:  "#2dd4bf",   // türkis  — steht für "Datenfluss / Signal aktiv"
  accent2: "#818cf8",   // indigo  — steht für "Takt / CLK-Impuls"
  good:    "#86efac",
  warn:    "#fca5a5",
  gold:    "#fcd34d",
};

// ─── Keyframes ────────────────────────────────────────────────────────────────
const STYLES = `
@keyframes pop {
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(45,212,191,0.4); }
  50%       { box-shadow: 0 0 0 8px rgba(45,212,191,0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes clkFlash {
  0%, 100% { background: #2a2f3d; }
  50%      { background: #818cf8; }
}
.pop    { animation: pop    .35s ease both; }
.fadein { animation: fadeIn .6s ease both; }
.pulse  { animation: pulse  1.2s ease infinite; }
`;

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── Basis-Komponenten ────────────────────────────────────────────────────────
function Section({ kicker, title, children }) {
  const [ref, visible] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        marginBottom: 64,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "opacity .6s ease, transform .6s ease",
      }}
    >
      {kicker && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", color: C.accent, marginBottom: 6 }}>
          {kicker}
        </div>
      )}
      <h2 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: "0 0 24px" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      padding: 24,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12, color: C.dim, marginRight: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2,
        background: color, flexShrink: 0 }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: `${C.accent2}18`,
      border: `1px solid ${C.accent2}44`,
      borderRadius: 12, padding: "16px 20px",
      marginBottom: 20,
    }}>
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6 }}>
        💡 {title}
      </div>
      <div style={{ color: C.dim, lineHeight: 1.7, fontSize: 14 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: C.accent, fontWeight: 700, fontFamily: "monospace" }}>
        {term}
      </span>
      <span style={{ color: C.dim, marginLeft: 12, fontSize: 14 }}>{def}</span>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16,
      padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ width: 4, borderRadius: 4, background: color,
        alignSelf: "stretch", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{name}</div>
        <code style={{ background: C.panel2, color: C.gold, padding: "2px 8px",
          borderRadius: 6, fontSize: 13, display: "inline-block", marginBottom: 6 }}>
          {formula}
        </code>
        <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

function Btn({ onClick, children, ghost }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: ghost ? `1px solid ${C.accent}` : "none",
        background: ghost ? "transparent" : hover ? "#1fb8a8" : C.accent,
        color: ghost ? (hover ? C.accent : C.dim) : C.bg,
        fontWeight: 700, fontSize: 13,
        cursor: "pointer",
        transition: "all .2s",
      }}
    >
      {children}
    </button>
  );
}

// ─── VIS 1: Register-Ladevorgang ──────────────────────────────────────────────
const REG_STEPS = [
  {
    label: "Ausgangszustand",
    desc:  "Das Register enthält zufälligen Inhalt (0110). Am Datenbus liegt der neue Wert 1011 an.",
    bus:   [1,0,1,1],
    reg:   [0,1,1,0],
    clk:   false,
    oe:    false,
    load:  false,
  },
  {
    label: "LOAD-Signal = 1",
    desc:  "Das LOAD-Signal wird auf 1 gesetzt: Das Register ist jetzt bereit, beim nächsten Taktimpuls zu laden.",
    bus:   [1,0,1,1],
    reg:   [0,1,1,0],
    clk:   false,
    oe:    false,
    load:  true,
  },
  {
    label: "CLK-Flanke ↑",
    desc:  "Die steigende Taktflanke (CLK: 0→1) triggert das Register. Es übernimmt den Wert vom Datenbus.",
    bus:   [1,0,1,1],
    reg:   [1,0,1,1],
    clk:   true,
    oe:    false,
    load:  true,
    changed: true,
  },
  {
    label: "OE (Output Enable) = 1",
    desc:  "Der Ausgang wird freigegeben (OE=1). Jetzt legt das Register seinen Wert auf den Bus — andere Teilnehmer können ihn lesen.",
    bus:   [1,0,1,1],
    reg:   [1,0,1,1],
    clk:   true,
    oe:    true,
    load:  false,
  },
];

function RegisterVis() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep(s => {
        if (s >= REG_STEPS.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [playing]);

  const reset = () => { setStep(0); setPlaying(false); setKey(k => k+1); };
  const cur = REG_STEPS[step];

  const BitCell = ({ val, highlight, changed }) => (
    <div
      key={`${val}-${key}`}
      className={changed ? "pop" : ""}
      style={{
        width: 44, height: 44,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8,
        border: `2px solid ${highlight ? C.gold : C.line}`,
        background: highlight ? `${C.gold}22` : C.panel2,
        color: val ? C.gold : C.dim,
        fontSize: 20, fontWeight: 900, fontFamily: "monospace",
        transition: "all .3s",
      }}
    >
      {val}
    </div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4, fontSize: 15 }}>
        📦 4-Bit-Register: Laden &amp; Ausgeben
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Ein <strong style={{color:C.text}}>Register</strong> (kurz: eine Gruppe synchron gesteuerter Flip-Flops) speichert ein Datenwort — hier 4 Bit. Der Ladevorgang läuft in 4 Schritten.
      </div>

      {/* Schritt-Anzeige */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {REG_STEPS.map((s, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
            background: i === step ? C.accent : C.panel2,
            color: i === step ? C.bg : C.dim,
            border: `1px solid ${i === step ? C.accent : C.line}`,
            transition: "all .2s",
          }}>{i+1}. {s.label}</div>
        ))}
      </div>

      {/* Haupt-Diagram */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Datenbus */}
        <div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
            Datenbus (Eingang)
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {cur.bus.map((b, i) => (
              <BitCell key={i} val={b} highlight={cur.oe} />
            ))}
            <div style={{ marginLeft: 12, fontSize: 12, color: C.dim,
              display: "flex", alignItems: "center" }}>
              gemeinsame Leitung für alle Teilnehmer
            </div>
          </div>
        </div>

        {/* Pfeile + Steuersignale */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingLeft: 8 }}>
          <div style={{
            fontSize: 22,
            color: cur.load && cur.clk ? C.accent : cur.load ? C.accent2 : C.line,
            transition: "color .3s",
          }}>↓</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { name: "LOAD", active: cur.load, color: C.accent2 },
              { name: "CLK ↑", active: cur.clk, color: C.accent2 },
              { name: "OE", active: cur.oe, color: C.good },
            ].map(sig => (
              <div key={sig.name} style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                background: sig.active ? `${sig.color}33` : C.panel2,
                border: `1px solid ${sig.active ? sig.color : C.line}`,
                color: sig.active ? sig.color : C.line,
                transition: "all .3s",
                ...(sig.active && sig.name === "CLK ↑" ? {animation:"clkFlash .4s ease"} : {}),
              }}>
                {sig.name}: {sig.active ? "1" : "0"}
              </div>
            ))}
          </div>
        </div>

        {/* Register-Inhalt */}
        <div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
            Register-Inhalt (gespeicherter Wert)
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {cur.reg.map((b, i) => (
              <BitCell key={i} val={b} highlight={cur.oe} changed={cur.changed} />
            ))}
            <div style={{ marginLeft: 12, fontSize: 12, color: C.dim,
              display: "flex", alignItems: "center" }}>
              = {parseInt(cur.reg.join(""), 2)}
              <sub style={{marginLeft:4}}>dez</sub>
            </div>
          </div>
        </div>

        {/* OE-Pfeil nach unten */}
        {cur.oe && (
          <div style={{ paddingLeft: 8 }}>
            <div style={{ color: C.good, fontSize: 22 }}>↓</div>
            <div style={{ color: C.good, fontSize: 12 }}>
              Ausgabe auf Bus freigegeben (OE = Output Enable)
            </div>
          </div>
        )}
      </div>

      {/* Erklär-Zeile */}
      <div className="fadein" key={step} style={{
        marginTop: 20, padding: "12px 16px",
        background: C.panel2, borderRadius: 10,
        borderLeft: `3px solid ${C.accent}`,
        color: C.dim, fontSize: 14, lineHeight: 1.7,
      }}>
        <strong style={{ color: C.text }}>Schritt {step+1}: {cur.label}</strong>
        <br />{cur.desc}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Btn onClick={() => setStep(s => Math.max(0, s-1))} ghost>◀ Zurück</Btn>
        <Btn onClick={() => setPlaying(p => !p)}>{playing ? "⏸ Pause" : "▶ Auto"}</Btn>
        <Btn onClick={() => setStep(s => Math.min(REG_STEPS.length-1, s+1))} ghost>Vor ▶</Btn>
        <Btn onClick={reset} ghost>↺ Reset</Btn>
      </div>

      {/* Legende */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Tag color={C.gold}>Aktives Bit / hervorgehoben</Tag>
        <Tag color={C.accent2}>Steuersignal aktiv</Tag>
        <Tag color={C.good}>Ausgabe freigegeben</Tag>
      </div>
    </Card>
  );
}

// ─── VIS 2: Schieberegister ───────────────────────────────────────────────────
const SHIFT_BITS_INIT = [0, 1, 1, 0, 1, 0, 0, 1];

function ShiftRegVis() {
  const [bits, setBits] = useState([...SHIFT_BITS_INIT]);
  const [input, setInput] = useState(1);
  const [shifted, setShifted] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [dir, setDir] = useState("right"); // "right" = seriell rechts rein
  const [stepCount, setStepCount] = useState(0);
  const [outBit, setOutBit] = useState(null);
  const [popIdx, setPopIdx] = useState(null);

  const doShift = useCallback(() => {
    setBits(prev => {
      const newBits = [...prev];
      let out;
      if (dir === "right") {
        out = newBits[newBits.length - 1];
        for (let i = newBits.length - 1; i > 0; i--) newBits[i] = newBits[i-1];
        newBits[0] = input;
        setPopIdx(0);
      } else {
        out = newBits[0];
        for (let i = 0; i < newBits.length - 1; i++) newBits[i] = newBits[i+1];
        newBits[newBits.length-1] = input;
        setPopIdx(newBits.length-1);
      }
      setOutBit(out);
      setShifted(true);
      setStepCount(s => s + 1);
      setTimeout(() => { setShifted(false); setPopIdx(null); }, 400);
      return newBits;
    });
  }, [dir, input]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(doShift, 900);
    return () => clearInterval(id);
  }, [playing, doShift]);

  const reset = () => {
    setBits([...SHIFT_BITS_INIT]);
    setPlaying(false);
    setStepCount(0);
    setOutBit(null);
  };

  return (
    <Card style={{ marginTop: 24 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4, fontSize: 15 }}>
        ↔ 8-Bit-Schieberegister (SIPO — Seriell-In, Parallel-Out)
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Beim <strong style={{color:C.text}}>Schieberegister</strong> (engl. <em>shift register</em>) rückt mit jedem Taktimpuls jedes gespeicherte Bit eine Position weiter — ein neues Bit kommt seriell rein, ein Bit fällt seriell raus.
      </div>

      {/* Richtungsauswahl + Serieller Eingang */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Schieberichtung</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["right", "left"].map(d => (
              <div key={d} onClick={() => setDir(d)} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                background: dir === d ? C.accent : C.panel2,
                color: dir === d ? C.bg : C.dim,
                border: `1px solid ${dir === d ? C.accent : C.line}`,
                fontWeight: 700, transition: "all .2s",
              }}>
                {d === "right" ? "→ Rechts" : "← Links"}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
            Serieller Eingang (DS)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1].map(v => (
              <div key={v} onClick={() => setInput(v)} style={{
                width: 44, height: 36, borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "monospace", fontWeight: 900, fontSize: 18,
                background: input === v ? `${C.gold}33` : C.panel2,
                border: `2px solid ${input === v ? C.gold : C.line}`,
                color: input === v ? C.gold : C.dim,
                transition: "all .2s",
              }}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>Taktimpulse</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.accent, fontFamily: "monospace" }}>
            {stepCount}
          </div>
        </div>
      </div>

      {/* Hauptdarstellung */}
      <div style={{ position: "relative", marginBottom: 12 }}>

        {/* Serieller Ausgang (rausgefallenes Bit) */}
        {outBit !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: C.warn }}>
              {dir === "right" ? "← Seriell raus (Q_s):" : "→ Seriell raus (Q_s):"}
            </div>
            <div className="pop" style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 6, border: `2px solid ${C.warn}`,
              background: `${C.warn}22`,
              color: C.warn, fontWeight: 900, fontSize: 18, fontFamily: "monospace",
            }}>{outBit}</div>
          </div>
        )}

        {/* Register-Bits + Bitposition */}
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {bits.map((_, i) => (
              <div key={i} style={{
                width: 44, textAlign: "center",
                fontSize: 10, color: C.dim,
              }}>
                Q{i === 0 ? <sub>7</sub> : <sub>{7-i}</sub>}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {bits.map((b, i) => (
              <div
                key={i}
                className={popIdx === i ? "pop" : ""}
                style={{
                  width: 44, height: 44,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 8,
                  border: `2px solid ${popIdx === i ? C.accent : C.line}`,
                  background: popIdx === i ? `${C.accent}22` : C.panel2,
                  color: b ? C.accent : C.dim,
                  fontWeight: 900, fontSize: 18, fontFamily: "monospace",
                  transition: "background .3s, border .3s, color .3s",
                }}
              >{b}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {bits.map((_, i) => (
              <div key={i} style={{
                width: 44, textAlign: "center", fontSize: 10, color: C.dim,
              }}>
                {i === 0 ? "MSB" : i === bits.length-1 ? "LSB" : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Parallel-Ausgänge symbolisiert */}
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          {bits.map((_, i) => (
            <div key={i} style={{
              width: 44, textAlign: "center", color: C.dim, fontSize: 16,
            }}>↓</div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: C.dim }}>
          Parallel-Ausgänge (alle Bits gleichzeitig ablesbar)
        </div>
      </div>

      {/* Aktueller Binärwert */}
      <div style={{
        margin: "16px 0",
        padding: "10px 16px",
        background: C.panel2,
        borderRadius: 10,
        display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center",
      }}>
        <div>
          <span style={{ fontSize: 11, color: C.dim, marginRight: 8 }}>BIN:</span>
          <code style={{ color: C.gold, fontFamily: "monospace", fontSize: 15 }}>
            {bits.join("")}
          </code>
        </div>
        <div>
          <span style={{ fontSize: 11, color: C.dim, marginRight: 8 }}>DEZ:</span>
          <code style={{ color: C.accent, fontFamily: "monospace", fontSize: 15 }}>
            {parseInt(bits.join(""), 2)}
          </code>
        </div>
        <div>
          <span style={{ fontSize: 11, color: C.dim, marginRight: 8 }}>HEX:</span>
          <code style={{ color: C.accent2, fontFamily: "monospace", fontSize: 15 }}>
            0x{parseInt(bits.join(""), 2).toString(16).toUpperCase().padStart(2,"0")}
          </code>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={doShift}>⚡ Taktimpuls</Btn>
        <Btn onClick={() => setPlaying(p => !p)} ghost>{playing ? "⏸ Pause" : "▶ Auto-Takt"}</Btn>
        <Btn onClick={reset} ghost>↺ Reset</Btn>
      </div>

      {/* Legende */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 4 }}>
        <Tag color={C.accent}>Neu eingeschobenes Bit</Tag>
        <Tag color={C.warn}>Herausgefallenes Bit (serieller Ausgang)</Tag>
        <Tag color={C.dim}>Parallel-Ausgänge (alle Bits gleichzeitig)</Tag>
      </div>
    </Card>
  );
}

// ─── VIS 3: Register-Datenpfad / Blockschema ─────────────────────────────────
function DatapathVis() {
  const [highlight, setHighlight] = useState(null);

  const blocks = [
    { id: "mem", x: 30, y: 120, w: 100, h: 60, label: "Speicher", sub: "RAM/ROM", color: C.accent2 },
    { id: "reg", x: 200, y: 90, w: 110, h: 120, label: "Register-\nDatei", sub: "R0–R15", color: C.accent },
    { id: "alu", x: 390, y: 120, w: 100, h: 60, label: "ALU", sub: "±, &, |, ^", color: C.gold },
    { id: "io", x: 200, y: 260, w: 110, h: 50, label: "I/O", sub: "Ein/Ausgabe", color: C.good },
    { id: "cu", x: 560, y: 100, w: 110, h: 100, label: "Control\nUnit", sub: "Steuerwerk", color: "#f472b6" },
  ];

  const arrows = [
    { from: [130,150], to: [200,150], label: "Lade" },
    { from: [310,150], to: [390,150], label: "Operand" },
    { from: [490,150], to: [560,150], label: "Status" },
    { from: [255,210], to: [255,260], label: "Schreib/Lies" },
    { from: [615,200], to: [615,280], to2: [310,285], to3: [310,210], label: "Steuersignale", ctrl: true },
  ];

  return (
    <Card style={{ marginTop: 24 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4, fontSize: 15 }}>
        🗺 Register im CPU-Datenpfad
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        Klicke auf einen Block, um seine Rolle zu sehen. Register sitzen im Zentrum — sie verbinden ALU, Speicher und I/O.
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox="0 0 700 340" width="100%" style={{ maxWidth: 700, display: "block", margin: "0 auto" }}>
          {/* Pfeile */}
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={C.dim} />
            </marker>
          </defs>
          <line x1={130} y1={150} x2={198} y2={150} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arr)" />
          <line x1={310} y1={150} x2={388} y2={150} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arr)" />
          <line x1={490} y1={150} x2={558} y2={150} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arr)" />
          <line x1={255} y1={210} x2={255} y2={258} stroke={C.dim} strokeWidth={1.5} markerEnd="url(#arr)" />
          {/* Steuerbus (gestrichelt) */}
          <polyline
            points={`615,200 615,310 255,310 255,312`}
            fill="none" stroke="#f472b688" strokeWidth={1.5}
            strokeDasharray="6 3" markerEnd="url(#arr)"
          />
          <text x={620} y={260} fill="#f472b6" fontSize={10} transform="rotate(-90,620,260)">Steuersignale</text>

          {/* Pfeil-Labels */}
          <text x={155} y={143} fill={C.dim} fontSize={10} textAnchor="middle">Lade</text>
          <text x={348} y={143} fill={C.dim} fontSize={10} textAnchor="middle">Operand</text>
          <text x={523} y={143} fill={C.dim} fontSize={10} textAnchor="middle">Status</text>
          <text x={280} y={238} fill={C.dim} fontSize={10} textAnchor="start">Schreib/Lies</text>

          {/* Blöcke */}
          {blocks.map(b => (
            <g key={b.id} onClick={() => setHighlight(h => h === b.id ? null : b.id)}
               style={{ cursor: "pointer" }}>
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                rx={10}
                fill={highlight === b.id ? `${b.color}33` : "#1e222e"}
                stroke={b.color}
                strokeWidth={highlight === b.id ? 2.5 : 1.5}
              />
              {b.label.split("\n").map((line, li) => (
                <text key={li} x={b.x + b.w/2} y={b.y + b.h/2 - 8 + li*18}
                  fill={b.color} fontSize={13} fontWeight={700} textAnchor="middle">
                  {line}
                </text>
              ))}
              <text x={b.x + b.w/2} y={b.y + b.h - 12}
                fill={C.dim} fontSize={10} textAnchor="middle">{b.sub}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Info-Overlay */}
      {highlight && (() => {
        const infos = {
          reg: { title: "Register-Datei (Register File)", text: "Enthält alle allgemeinen Register (z. B. R0–R15). Flip-Flop-basiert, extrem schnell (1 Taktzyklus). Die ALU liest ihre Operanden von hier und schreibt das Ergebnis zurück." },
          mem: { title: "Hauptspeicher (RAM/ROM)", text: "Langsamer als Register (Dutzende bis Hunderte Takte). Daten werden erst in ein Register geladen, bevor die ALU sie verarbeiten kann." },
          alu: { title: "ALU (Arithmetic Logic Unit)", text: "Führt alle Berechnungen durch: Addition, Subtraktion, logische Operationen. Bezieht Operanden aus der Register-Datei, schreibt Ergebnis zurück dorthin." },
          io: { title: "I/O (Ein-/Ausgabe)", text: "Kommuniziert mit Peripherie (Tastatur, Display). Verwendet oft spezielle I/O-Register oder speichermappierte Register (memory-mapped I/O)." },
          cu: { title: "Control Unit (Steuerwerk)", text: "Dekodiert Befehle und erzeugt alle Steuersignale — legt fest, welche Register geladen werden, wann die ALU rechnet, und was mit dem Ergebnis passiert." },
        };
        const info = infos[highlight];
        return (
          <div className="fadein" style={{
            marginTop: 12, padding: "12px 16px",
            background: C.panel2, borderRadius: 10,
            borderLeft: `3px solid ${C.accent}`,
          }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>{info.title}</div>
            <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.7 }}>{info.text}</div>
          </div>
        );
      })()}
    </Card>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────
export default function SequenzielleElemente() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "system-ui, sans-serif" }}>
      <style>{STYLES}</style>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.panel} 0%, #12151f 100%)`,
        borderBottom: `1px solid ${C.line}`, padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
          color: C.accent, marginBottom: 12 }}>
          Sequenzielle Schaltungen · CPU-Elemente
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 16px",
          background: `linear-gradient(135deg, ${C.text} 0%, ${C.accent} 100%)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Register &amp; Schieberegister
        </h1>
        <p style={{ color: C.dim, maxWidth: 580, margin: "0 auto", lineHeight: 1.8, fontSize: 15 }}>
          Register und Schieberegister sind <strong style={{color:C.text}}>sequenzielle Schaltungen</strong> (Schaltungen mit Gedächtnis) und bilden das Rückgrat jeder CPU — hier lernst du, wie sie intern funktionieren und warum sie unersetzlich sind.
        </p>
      </div>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px" }}>

        {/* 0 — Das Problem */}
        <Section kicker="0 · Das Problem" title="Warum braucht die CPU überhaupt Speicher?">
          <Card>
            <p style={{ color: C.dim, lineHeight: 1.8, margin: 0 }}>
              Eine CPU rechnet blitzschnell — aber was passiert mit dem Zwischenergebnis? <br/>
              Beispiel: Du rechnest <code style={{color:C.gold}}>5 + 3 × 2</code>. Erst wird <code style={{color:C.gold}}>3 × 2 = 6</code> ausgerechnet, dann muss diese 6 irgendwo liegen, während die CPU die 5 holt. Würde man das Ergebnis sofort vergessen, müsste man die komplette Rechnung von vorne starten.
            </p>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "⚡", text: "Register: ultraschnell (1 Taktzyklus), begrenzte Anzahl" },
                { icon: "🔄", text: "Schieberegister: seriell ↔ parallel umwandeln" },
                { icon: "🧮", text: "Zähler: binär automatisch hochzählen" },
              ].map(item => (
                <div key={item.text} style={{
                  flex: "1 1 200px", padding: "12px 16px",
                  background: C.panel2, borderRadius: 10,
                  border: `1px solid ${C.line}`,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 1 — Kernidee */}
        <Section kicker="1 · Die Kernidee" title="Flip-Flop × n = Register">
          <InfoBox title="Was ist ein Register?">
            Ein <strong>Register</strong> (von lat. <em>registrum</em> = Liste) ist eine Gruppe von <strong>D-Flip-Flops</strong> (Data-Flip-Flops), die synchron — d. h. alle auf denselben Taktimpuls — gesteuert werden. Ein 8-Bit-Register = 8 D-Flip-Flops, die parallel ein Byte speichern.
          </InfoBox>
          <Card>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 700, color: C.accent, marginBottom: 10 }}>D-Flip-Flop (einzeln)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Eingang D", "Datenbit (0 oder 1)"],
                    ["Eingang C (CLK)", "Taktflanke — wann wird übernommen?"],
                    ["Ausgang Q", "Aktuell gespeichertes Bit"],
                    ["Ausgang ¬Q", "Komplement von Q (immer entgegengesetzt)"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 12 }}>
                      <code style={{ background: C.panel2, color: C.gold, padding: "2px 8px",
                        borderRadius: 6, fontSize: 12, whiteSpace: "nowrap" }}>{k}</code>
                      <span style={{ color: C.dim, fontSize: 13, alignSelf: "center" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 10 }}>n Flip-Flops → Register</div>
                <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.8 }}>
                  Alle FFs teilen denselben CLK-Eingang (Takteingang). Dadurch wechseln alle Bits exakt gleichzeitig — das ist die <strong style={{color:C.text}}>Synchronität</strong>. Ein zusätzlicher <strong>LOAD</strong>-Eingang entscheidet, ob überhaupt geladen wird, und <strong>OE</strong> (Output Enable) gibt den Ausgang frei.
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* 2 — Register-Visualisierung */}
        <Section kicker="2 · Interaktiv" title="Register: Laden & Ausgeben — live">
          <RegisterVis />
          <DatapathVis />
        </Section>

        {/* 3 — Schieberegister */}
        <Section kicker="3 · Variante" title="Schieberegister — Bit für Bit verschieben">
          <InfoBox title="Wozu braucht man Schieben?">
            In der Datenübertragung werden Daten oft <strong>seriell</strong> (Bit für Bit, eine Leitung) übertragen, intern aber <strong>parallel</strong> (alle Bits gleichzeitig) verarbeitet. Das Schieberegister ist der Übersetzer zwischen beiden Welten — und ermöglicht außerdem eine schnelle Multiplikation mit 2 (Linksshift) bzw. Division durch 2 (Rechtsshift).
          </InfoBox>

          <Card>
            <div style={{ marginBottom: 16 }}>
              {[
                { color: C.accent, name: "SIPO", formula: "Seriell In, Parallel Out", note: "Daten seriell einlesen, dann alle Bits gleichzeitig ausgeben — z. B. beim Empfang von Daten." },
                { color: C.accent2, name: "PISO", formula: "Parallel In, Seriell Out", note: "Alle Bits gleichzeitig laden, dann seriell ausgeben — z. B. beim Senden von Daten." },
                { color: C.gold, name: "SISO", formula: "Seriell In, Seriell Out", note: "Reines Verzögerungsglied — das Bit kommt nach n Taktschlägen wieder raus." },
                { color: C.good, name: "PIPO", formula: "Parallel In, Parallel Out", note: "Einfaches Register ohne Schiebefunktion — dient nur zur Zwischenspeicherung." },
              ].map(m => <MethodRow key={m.name} {...m} />)}
            </div>
          </Card>

          <ShiftRegVis />
        </Section>

        {/* 4 — Detail: Multiplikation per Shift */}
        <Section kicker="4 · Detail" title="Schieben = Multiplizieren / Dividieren">
          <InfoBox title="Warum ist Linksshift = ×2?">
            Im Binärsystem hat jede Stelle den Wert 2 hoch ihre Position. Wenn du alle Bits um eine Stelle nach links schiebst, erhöhst du jede Position um 1 — das ist gleichbedeutend mit der Multiplikation mit 2. Rechtsshift = Division durch 2 (ganzzahlig, d. h. mit Abrunden).
          </InfoBox>
          <Card>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { op: "Linksshift (×2)", before: "0000 0110 = 6", after: "0000 1100 = 12", color: C.accent },
                { op: "Linksshift (×2)", before: "0000 0110 = 6", after: "0001 1000 = 24 (2 Stellen)", color: C.accent },
                { op: "Rechtsshift (÷2)", before: "0000 1100 = 12", after: "0000 0110 = 6", color: C.accent2 },
              ].map((ex, i) => (
                <div key={i} style={{ flex: "1 1 200px", padding: 16, background: C.panel2,
                  borderRadius: 10, border: `1px solid ${ex.color}44` }}>
                  <div style={{ fontWeight: 700, color: ex.color, marginBottom: 8 }}>{ex.op}</div>
                  <code style={{ display: "block", color: C.dim, fontSize: 12, marginBottom: 4 }}>Vorher: {ex.before}</code>
                  <code style={{ display: "block", color: C.gold, fontSize: 12 }}>Nachher: {ex.after}</code>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
              CPUs nutzen das zum schnellen Multiplizieren mit Zweierpotenzen — viel schneller als eine echte Multiplizierschaltung. Modernere Architekturen (z. B. ARM) können Shifts und ALU-Operationen in einem einzigen Befehl kombinieren (Barrel-Shifter).
            </div>
          </Card>
        </Section>

        {/* 5 — Analyse */}
        <Section kicker="5 · Analyse" title="Eigenschaften im Überblick">
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Eigenschaft", "Register", "Schieberegister", "Zähler (Bonus)"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px",
                        color: C.accent, fontWeight: 700, borderBottom: `1px solid ${C.line}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Baustein", "D-Flip-Flops", "D-Flip-Flops in Serie", "T-/JK-Flip-Flops"],
                    ["Eingang", "Parallel (alle Bits gleichzeitig)", "Seriell (Bit für Bit)", "Taktimpuls"],
                    ["Ausgang", "Parallel (alle Bits gleichzeitig)", "Parallel oder seriell", "Zustandsvektor Q"],
                    ["Latenz", "1 Taktzyklus", "n Taktzyklen (n = Breite)", "1 Taktzyklus"],
                    ["Verwendung", "ALU-Operanden, Ergebnisse", "Datenübertragung, Shift-Arithmetik", "PC, Schleifen, Frequenzteiler"],
                  ].map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 ? C.panel2 : "transparent" }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: "8px 12px", color: ci === 0 ? C.text : C.dim,
                          fontWeight: ci === 0 ? 700 : 400, borderBottom: `1px solid ${C.line}22` }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Section>

        {/* 6 — Zusammenfassung */}
        <Section kicker="6 · Zusammenfassung" title="Auf einen Blick">
          <Card style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}44` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["🧱", "Register", "n D-Flip-Flops mit gemeinsamem CLK → speichert n Bit parallel in 1 Takt"],
                ["↔", "Schieberegister", "D-FFs in Kette → rückt Bits pro Takt um eine Stelle — wandelt seriell ↔ parallel um"],
                ["×2 / ÷2", "Shift-Arithmetik", "Links-Shift = Multiplikation mit 2, Rechts-Shift = Division durch 2"],
                ["🗺", "CPU-Datenpfad", "Register verbinden ALU, Speicher und I/O — alles läuft durch sie hindurch"],
              ].map(([icon, term, desc]) => (
                <div key={term} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, minWidth: 28 }}>{icon}</div>
                  <div>
                    <span style={{ fontWeight: 700, color: C.accent }}>{term}: </span>
                    <span style={{ color: C.dim, fontSize: 14 }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* 7 — Glossar */}
        <Section kicker="7 · Glossar" title="Alle Begriffe kompakt">
          <Card>
            {[
              ["D-Flip-Flop", "Data-Flip-Flop — speichert genau 1 Bit synchron zur Taktflanke"],
              ["CLK", "Clock — Taktsignal, das alle FFs im Register gleichzeitig auslöst (steigende oder fallende Flanke)"],
              ["LOAD", "Steuersignal — gibt an, ob der Datenbus-Wert beim nächsten Takt übernommen werden soll"],
              ["OE", "Output Enable — schaltet den Ausgang auf den Bus; ohne OE = hochohmig (Bus-Konflikt vermieden)"],
              ["Register-Datei", "Sammlung aller allgemeinen Register einer CPU (z. B. R0–R15)"],
              ["Schieberegister", "FFs in Serie — verschiebt gespeicherte Bits pro Takt um eine Position"],
              ["SIPO", "Serial In, Parallel Out — seriell einlesen, parallel ausgeben"],
              ["PISO", "Parallel In, Serial Out — parallel laden, seriell ausgeben"],
              ["Linksshift", "Alle Bits um 1 nach links; entspricht ×2 (niedrigste Stelle wird 0)"],
              ["Rechtsshift", "Alle Bits um 1 nach rechts; entspricht ÷2 (ganzzahlig, oberstes Bit je nach Vorzeichen)"],
              ["MSB", "Most Significant Bit — das höchstwertigste Bit (ganz links)"],
              ["LSB", "Least Significant Bit — das niederwertigste Bit (ganz rechts)"],
              ["ALU", "Arithmetic Logic Unit — Rechenwerk der CPU, liest Operanden aus Registern"],
              ["Barrel-Shifter", "Spezialschaltung zum Verschieben um beliebig viele Positionen in einem einzigen Takt"],
              ["Synchron", "Alle Flip-Flops schalten gleichzeitig auf dieselbe Taktflanke — kein Glitch/Hazard"],
            ].map(([term, def]) => <GlossEntry key={term} term={term} def={def} />)}
          </Card>
        </Section>

      </main>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.line}`, padding: "24px", textAlign: "center",
        color: C.dim, fontSize: 12 }}>
        Prof. Scherzer · DHBW Bad Mergentheim · Technische Informatik / Digitaltechnik
        <span style={{ marginLeft: 16, color: C.line }}>|</span>
        <span style={{ marginLeft: 16, color: C.accent }}>Register &amp; Schieberegister</span>
      </div>
    </div>
  );
}
