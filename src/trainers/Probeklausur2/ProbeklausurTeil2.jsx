import { useState, useRef, useEffect } from "react";

/* =========================================================================
   PROBEKLAUSUR TEIL 2 — Theoretische Informatik 2 (DHBW Mosbach)
   Eine einzige, durchscrollbare Lernkomponente fuer alle vier Aufgaben:
     1) Hashing (13 P)   2) Breitensuche/BFS (6 P)
     3) Binaere Suchbaeume (6 P)   4) Dijkstra (20 P)
   Dark Theme, genau ZWEI Akzentfarben (blau + gold), alles inline gestylt,
   keine externen Bibliotheken. Sprache: deutsch, du-Form.
   ========================================================================= */

/* ---- Design-Tokens: 2 Akzente + neutrale Graustufen (fix) -------------- */
const C = {
  bg: "#0e1016",
  panel: "#161a23",
  panel2: "#1d2230",
  panel3: "#252b3b",
  line: "#2c3344",
  lineSoft: "#222838",
  text: "#e7e9f0",
  text2: "#c3c8d6",
  dim: "#9aa1b3",
  dim2: "#6b7488",
  accent: "#6ea8fe", // blau  – aktiv / Struktur / Information
  accent2: "#ffc857", // gold – Highlight / richtig / Achtung
};
const SANS =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";

const STYLE = `
@keyframes pk-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes pk-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
* { box-sizing: border-box; }
.pk-root ::selection { background: ${C.accent}; color: #0a0e17; }
.pk-root code { font-family: ${MONO}; }
`;

/* ---- Button-Styles ----------------------------------------------------- */
const btn = {
  background: C.accent,
  color: "#0a0e17",
  border: "none",
  borderRadius: 9,
  padding: "9px 15px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: SANS,
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 9,
  padding: "9px 15px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: SANS,
};

/* =========================================================================
   PRIMITIVE
   ========================================================================= */

// Scroll-Reveal-Hook: blendet Sektionen beim Scrollen sanft ein
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
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

function Section({ kicker, title, points, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      ref={ref}
      style={{
        marginBottom: 72,
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(22px)",
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
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 28, margin: "0 0 18px", color: C.text, lineHeight: 1.2 }}>
          {title}
        </h2>
        {points != null && (
          <span
            style={{
              color: C.accent2,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              border: `1px solid ${C.accent2}55`,
              borderRadius: 999,
              padding: "2px 10px",
            }}
          >
            {points} P
          </span>
        )}
      </div>
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
        padding: 22,
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
        fontSize: 12.5,
        color: C.dim,
        marginRight: 14,
        marginTop: 6,
      }}
    >
      <span
        style={{
          width: 11,
          height: 11,
          borderRadius: 3,
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}

// InfoBox: 3 Tonalitaeten, aber strikt aus den 2 Akzenten + Grau gebaut.
// info = blau, success = gold (Haken), warn = gold (Achtung-Symbol).
function InfoBox({ tone = "info", title, children }) {
  const map = {
    info: { col: C.accent, icon: "i", bg: "rgba(110,168,254,0.09)", bd: "rgba(110,168,254,0.38)" },
    success: { col: C.accent2, icon: "✓", bg: "rgba(255,200,87,0.09)", bd: "rgba(255,200,87,0.40)" },
    warn: { col: C.accent2, icon: "⚠", bg: "rgba(255,200,87,0.07)", bd: "rgba(255,200,87,0.45)" },
  };
  const t = map[tone] || map.info;
  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.bd}`,
        borderRadius: 14,
        padding: "16px 18px",
        margin: "18px 0",
      }}
    >
      {title && (
        <div
          style={{
            fontWeight: 700,
            color: t.col,
            marginBottom: 7,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: 999,
              border: `1.5px solid ${t.col}`,
              color: t.col,
              fontSize: 12,
              fontWeight: 800,
              fontStyle: tone === "info" ? "italic" : "normal",
            }}
          >
            {t.icon}
          </span>
          {title}
        </div>
      )}
      <div style={{ color: C.text2, fontSize: 14.5, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// Inline-Code-Badge
function K({ children }) {
  return (
    <code
      style={{
        background: C.bg,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: "1px 6px",
        fontSize: 13,
        color: C.accent,
      }}
    >
      {children}
    </code>
  );
}

/* ---- Generischer Stepper ---------------------------------------------- */
// steps: Array von Frames (jeweils mit .explain), render(frame, i) -> Visualisierung.
function Stepper({ steps, render, intervalMs = 1500, legend }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const max = steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (i >= max) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => {
      setI((p) => {
        if (p >= max) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, i, max, intervalMs]);

  const f = steps[i];

  return (
    <div>
      {render(f, i)}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, alignItems: "center" }}>
        <button style={btnGhost} onClick={() => { setPlaying(false); setI(0); }} title="Zuruecksetzen">
          {"⟲"} Reset
        </button>
        <button
          style={{ ...btnGhost, opacity: i === 0 ? 0.4 : 1 }}
          disabled={i === 0}
          onClick={() => { setPlaying(false); setI((p) => Math.max(0, p - 1)); }}
        >
          {"◀"} Zurueck
        </button>
        <button style={btn} onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Pause" : "▶ Auto-Play"}
        </button>
        <button
          style={{ ...btnGhost, opacity: i === max ? 0.4 : 1 }}
          disabled={i === max}
          onClick={() => { setPlaying(false); setI((p) => Math.min(max, p + 1)); }}
        >
          Weiter {"▶"}
        </button>
        <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13, fontFamily: MONO }}>
          Schritt {i + 1} / {steps.length}
        </span>
      </div>

      {/* Erklaerung pro Schritt */}
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 11,
          padding: "13px 15px",
          fontSize: 14.5,
          color: C.text,
          lineHeight: 1.6,
          minHeight: 50,
        }}
      >
        <span style={{ color: C.accent, fontWeight: 700 }}>Warum: </span>
        {f.explain}
      </div>

      {legend && <div style={{ marginTop: 10 }}>{legend}</div>}
    </div>
  );
}

/* ---- Quiz (Multiple Choice mit Feedback) ------------------------------ */
function Quiz({ question, options, correctIndex, explanation }) {
  const [pick, setPick] = useState(null);
  const answered = pick !== null;
  const ok = pick === correctIndex;
  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "16px 18px",
        margin: "12px 0",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.accent2, fontWeight: 800, fontSize: 15 }}>?</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{question}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, idx) => {
          let bg = C.panel,
            border = C.line,
            col = C.text,
            weight = 500;
          if (answered) {
            if (idx === correctIndex) {
              bg = "rgba(255,200,87,0.14)";
              border = C.accent2;
              col = C.text;
              weight = 700;
            } else if (idx === pick) {
              bg = "rgba(255,255,255,0.03)";
              border = C.dim2;
              col = C.dim;
            } else {
              col = C.dim2;
            }
          }
          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => setPick(idx)}
              style={{
                textAlign: "left",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 9,
                padding: "10px 13px",
                color: col,
                fontSize: 14,
                fontFamily: SANS,
                fontWeight: weight,
                cursor: answered ? "default" : "pointer",
                transition: "background .2s, border-color .2s",
                display: "flex",
                gap: 8,
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: 700, color: C.dim2 }}>
                {String.fromCharCode(65 + idx)})
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {answered && idx === correctIndex && (
                <span style={{ color: C.accent2, fontWeight: 800 }}>{"✓"}</span>
              )}
              {answered && idx === pick && idx !== correctIndex && (
                <span style={{ color: C.dim, fontWeight: 800 }}>{"✗"}</span>
              )}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 12, animation: "pk-fade .3s ease" }}>
          <div
            style={{
              color: ok ? C.accent2 : C.text,
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {ok ? "Richtig!" : "Nicht ganz — die richtige Antwort ist gold markiert."}
          </div>
          <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.65 }}>{explanation}</div>
          <button
            style={{ ...btnGhost, marginTop: 10, padding: "6px 12px", fontSize: 13 }}
            onClick={() => setPick(null)}
          >
            {"↺"} Nochmal
          </button>
        </div>
      )}
    </div>
  );
}

/* ---- FillCheck (Freitext/Zahl mit Auto-Check) ------------------------- */
function FillCheck({ prompt, expected, normalize, placeholder = "Antwort …", explanation }) {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const norm =
    normalize || ((s) => String(s).trim().toLowerCase().replace(/\s+/g, ""));
  const list = Array.isArray(expected) ? expected : [expected];
  const ok = list.some((a) => norm(a) === norm(val)) && val.trim() !== "";
  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "16px 18px",
        margin: "12px 0",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ color: C.accent, fontWeight: 800, fontSize: 15 }}>{"✎"}</span>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.55 }}>{prompt}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={val}
          placeholder={placeholder}
          onChange={(e) => {
            setVal(e.target.value);
            setChecked(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setChecked(true);
          }}
          style={{
            flex: 1,
            minWidth: 160,
            background: C.panel,
            border: `1px solid ${checked ? (ok ? C.accent2 : C.dim2) : C.line}`,
            borderRadius: 9,
            color: C.text,
            padding: "9px 12px",
            fontSize: 14,
            fontFamily: MONO,
            outline: "none",
            transition: "border-color .2s",
          }}
        />
        <button style={btn} onClick={() => setChecked(true)}>
          Pruefen
        </button>
      </div>
      {checked && (
        <div style={{ marginTop: 12, animation: "pk-fade .3s ease" }}>
          <div
            style={{
              color: ok ? C.accent2 : C.text,
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4,
            }}
          >
            {ok ? "Richtig! ✓" : "Noch nicht richtig — versuch es nochmal."}
          </div>
          {explanation && (
            <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.65 }}>{explanation}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- kleiner Untertitel ueber einer Visualisierung -------------------- */
function VizHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{title}</div>
      {sub && <div style={{ color: C.dim, fontSize: 13.5, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* =========================================================================
   AUFGABE 1 — HASHING
   ========================================================================= */

const HASH_FRAMES = [
  {
    scen: 1, key: 16, h1: 2, h2: 2, table: {}, i: null, probe: null, status: "intro",
    seq: [],
    explain:
      "Szenario 1: Schluessel 16 in eine leere Tabelle (m=7). Zuerst beide Hashwerte: h1(16)=16 mod 7=2 (Start-Index), h2(16)=2+(16 mod 4)=2+0=2 (Schrittweite). Sondieren = bei Kollision mit Schrittweite h2 weiterspringen.",
  },
  {
    scen: 1, key: 16, h1: 2, h2: 2, table: { 2: 16 }, i: 0, probe: 2, status: "place",
    seq: [2],
    explain: "i=0: (2 + 0·2) mod 7 = 2. Slot 2 ist frei → 16 landet auf Index 2. Sondierfolge: [2].",
  },
  {
    scen: 2, key: 1, h1: 1, h2: 3, table: { 0: 14, 1: 8 }, i: null, probe: null, status: "intro",
    seq: [],
    explain:
      "Szenario 2: Schluessel 1 in [0]=14, [1]=8 (Rest leer). h1(1)=1 mod 7=1, h2(1)=2+(1 mod 4)=2+1=3.",
  },
  {
    scen: 2, key: 1, h1: 1, h2: 3, table: { 0: 14, 1: 8 }, i: 0, probe: 1, status: "collision",
    seq: [1],
    explain:
      "i=0: (1 + 0·3) mod 7 = 1. Slot 1 ist belegt (8) → Kollision. Jetzt springen wir um h2=3 Slots weiter.",
  },
  {
    scen: 2, key: 1, h1: 1, h2: 3, table: { 0: 14, 1: 8, 4: 1 }, i: 1, probe: 4, status: "place",
    seq: [1, 4],
    explain: "i=1: (1 + 1·3) mod 7 = 4. Slot 4 ist frei → 1 landet auf Index 4. Sondierfolge: 1 → 4.",
  },
  {
    scen: 3, key: 21, h1: 0, h2: 3, table: { 0: 7, 3: 10, 6: 20 }, i: null, probe: null, status: "intro",
    seq: [],
    explain:
      "Szenario 3: Schluessel 21 in [0]=7, [3]=10, [6]=20 (Rest leer). h1(21)=21 mod 7=0, h2(21)=2+(21 mod 4)=2+1=3.",
  },
  {
    scen: 3, key: 21, h1: 0, h2: 3, table: { 0: 7, 3: 10, 6: 20 }, i: 0, probe: 0, status: "collision",
    seq: [0],
    explain: "i=0: (0 + 0·3) mod 7 = 0. Slot 0 ist belegt (7) → Kollision.",
  },
  {
    scen: 3, key: 21, h1: 0, h2: 3, table: { 0: 7, 3: 10, 6: 20 }, i: 1, probe: 3, status: "collision",
    seq: [0, 3],
    explain: "i=1: (0 + 1·3) mod 7 = 3. Slot 3 ist belegt (10) → Kollision.",
  },
  {
    scen: 3, key: 21, h1: 0, h2: 3, table: { 0: 7, 3: 10, 6: 20 }, i: 2, probe: 6, status: "collision",
    seq: [0, 3, 6],
    explain: "i=2: (0 + 2·3) mod 7 = 6. Slot 6 ist belegt (20) → Kollision.",
  },
  {
    scen: 3, key: 21, h1: 0, h2: 3, table: { 0: 7, 2: 21, 3: 10, 6: 20 }, i: 3, probe: 2, status: "place",
    seq: [0, 3, 6, 2],
    explain:
      "i=3: (0 + 3·3) mod 7 = 9 mod 7 = 2. Slot 2 ist frei → 21 landet auf Index 2. Sondierfolge: 0 → 3 → 6 → 2.",
  },
];

function HashSlots({ f }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {Array.from({ length: 7 }, (_, idx) => {
        const val = f.table[idx];
        const isProbe = f.probe === idx;
        const justPlaced = f.status === "place" && isProbe;
        let bg = C.panel2,
          border = C.line,
          ring = "none";
        if (isProbe && f.status === "collision") {
          bg = "rgba(255,200,87,0.16)";
          border = C.accent2;
        } else if (justPlaced) {
          bg = "rgba(110,168,254,0.18)";
          border = C.accent;
        }
        return (
          <div key={idx} style={{ textAlign: "center" }}>
            <div style={{ color: C.dim2, fontSize: 11, fontFamily: MONO, marginBottom: 4 }}>{idx}</div>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
                background: bg,
                border: `2px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 700,
                color: val == null ? C.dim2 : justPlaced ? C.accent : C.text,
                fontFamily: MONO,
                transition: "background .25s, border-color .25s",
                animation: justPlaced ? "pk-pop .4s ease" : "none",
                boxShadow: ring,
              }}
            >
              {val == null ? "·" : val}
            </div>
            {isProbe && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  color: f.status === "place" ? C.accent : C.accent2,
                }}
              >
                {f.status === "place" ? "frei ✓" : "belegt"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HashStepperViz(f) {
  return (
    <Card style={{ background: C.bg }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            background: C.panel3,
            border: `1px solid ${C.line}`,
            borderRadius: 999,
            padding: "3px 11px",
            fontSize: 12.5,
            fontWeight: 700,
            color: C.accent,
          }}
        >
          Szenario {f.scen}
        </span>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
          Schluessel {f.key} einfuegen
        </span>
        <span style={{ color: C.dim, fontFamily: MONO, fontSize: 13, marginLeft: "auto" }}>
          h1={f.h1} &nbsp; h2={f.h2}
        </span>
      </div>

      <HashSlots f={f} />

      {f.i != null && (
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 15,
            color: C.text,
          }}
        >
          i={f.i}: ({f.h1} + {f.i}·{f.h2}) mod 7 ={" "}
          <span style={{ color: f.status === "place" ? C.accent : C.accent2, fontWeight: 700 }}>
            {f.probe}
          </span>
        </div>
      )}

      {f.seq.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: C.dim, fontSize: 12.5 }}>Sondierfolge:</span>
          {f.seq.map((s, k) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {k > 0 && <span style={{ color: C.dim2 }}>{"→"}</span>}
              <span
                style={{
                  background: C.panel3,
                  border: `1px solid ${C.line}`,
                  borderRadius: 7,
                  padding: "3px 9px",
                  fontFamily: MONO,
                  fontSize: 13,
                  color: C.text,
                  fontWeight: 700,
                }}
              >
                {s}
              </span>
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

// Lineares Sondieren simulieren (Teil b)
function linProbe(m, keys) {
  const table = Array(m).fill(null);
  const colls = [];
  for (const k of keys) {
    let c = 0;
    let idx = k % m;
    while (table[idx] != null) {
      c++;
      idx = (idx + 1) % m;
    }
    table[idx] = k;
    colls.push(c);
  }
  return { table, colls };
}

function LinearProbeCompare() {
  const [m, setM] = useState(13);
  const keys = [5, 3, 16, 6];
  const observed = [0, 0, 1, 0];
  const { table, colls } = linProbe(m, keys);
  const matches = colls.every((c, i) => c === observed[i]);

  return (
    <Card style={{ background: C.bg }}>
      <VizHead
        title="Teil b interaktiv: probier m=11 gegen m=13"
        sub="Eingabefolge 5, 3, 16, 6 mit linearem Sondieren. Beobachtet wurden die Kollisionszahlen 0, 0, 1, 0."
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[11, 13].map((cand) => (
          <button
            key={cand}
            onClick={() => setM(cand)}
            style={{
              ...(m === cand ? btn : btnGhost),
              fontFamily: MONO,
            }}
          >
            m = {cand}
          </button>
        ))}
      </div>

      {/* Tabelle */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 5, minWidth: "min-content" }}>
          {table.map((val, idx) => (
            <div key={idx} style={{ textAlign: "center" }}>
              <div style={{ color: C.dim2, fontSize: 10.5, fontFamily: MONO, marginBottom: 3 }}>{idx}</div>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: val == null ? C.panel2 : "rgba(110,168,254,0.16)",
                  border: `1.5px solid ${val == null ? C.line : C.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: val == null ? C.dim2 : C.text,
                  fontFamily: MONO,
                }}
              >
                {val == null ? "·" : val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kollisionsvergleich */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {keys.map((k, i) => {
          const good = colls[i] === observed[i];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: C.panel2,
                border: `1px solid ${good ? C.line : C.accent2}`,
                borderRadius: 9,
                padding: "8px 12px",
                fontSize: 13.5,
              }}
            >
              <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 700, width: 70 }}>
                Key {k}
              </span>
              <span style={{ color: C.text2 }}>
                berechnet: <b style={{ color: good ? C.text : C.accent2 }}>{colls[i]}</b> Kollision(en)
              </span>
              <span style={{ color: C.dim }}>
                beobachtet: <b>{observed[i]}</b>
              </span>
              <span style={{ marginLeft: "auto", color: good ? C.accent2 : C.dim, fontWeight: 800 }}>
                {good ? "✓" : "✗"}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: "12px 14px",
          borderRadius: 10,
          background: matches ? "rgba(255,200,87,0.10)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${matches ? C.accent2 : C.dim2}`,
          color: C.text,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {matches ? (
          <>
            <b style={{ color: C.accent2 }}>m = {m} passt:</b> alle vier Kollisionszahlen stimmen mit der
            Beobachtung 0,0,1,0 ueberein. Resultierende Tabelle: [3]=3, [4]=16, [5]=5, [6]=6.
          </>
        ) : (
          <>
            <b style={{ color: C.accent2 }}>m = {m} scheidet aus:</b> Schluessel 6 trifft hier auf den
            schon belegten Slot 6 (dort liegt 16, weil 16 mod 11 = 5 zuerst mit 5 kollidiert und auf 6
            ausweicht). Das gibt fuer 6 eine Kollision — beobachtet wurden aber 0.
          </>
        )}
      </div>
    </Card>
  );
}

function AufgabeHashing() {
  return (
    <Section kicker="Aufgabe 1" title="Hashing" points={13}>
      {/* Grundlagen inline */}
      <Card style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          Eine <b style={{ color: C.text }}>Hashtabelle</b> ist ein Array fester Groesse{" "}
          <K>m</K>, in dem ein Schluessel <K>k</K> nicht der Reihe nach, sondern direkt an einer
          berechneten Position gespeichert wird. Diese Position liefert die{" "}
          <b style={{ color: C.text }}>Hashfunktion</b> <K>h(k)</K>. Stoßen zwei Schluessel auf
          denselben Index, heißt das <b style={{ color: C.text }}>Kollision</b>.
        </p>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          Bei <b style={{ color: C.text }}>offener Adressierung</b> wird die Kollision geloest, indem
          man im selben Array nach einem freien Slot sucht — das nennt man{" "}
          <b style={{ color: C.text }}>Sondieren</b>. Der Sondierschritt <K>i</K> (= 0, 1, 2, …)
          zaehlt die Versuche.
        </p>
        <InfoBox tone="info" title="Warum gerade doppeltes Hashing?">
          Beim einfachen linearen Sondieren ruecken Kollisionen immer nur um 1 weiter — es bilden
          sich lange belegte Bloecke (<i>Clustering</i>), die alles verlangsamen. Beim{" "}
          <b style={{ color: C.text }}>doppelten Hashing</b> liefert eine{" "}
          <b style={{ color: C.text }}>zweite</b> Funktion <K>h2(k)</K> eine{" "}
          <b style={{ color: C.text }}>schluesselabhaengige Schrittweite</b>. Zwei Schluessel mit
          gleichem Start <K>h1</K> springen dann unterschiedlich weit — das bricht die Cluster auf.
        </InfoBox>
      </Card>

      {/* Teil a) Aufgabenstellung */}
      <h3 style={{ fontSize: 19, color: C.text, margin: "26px 0 8px" }}>Teil a) Doppeltes Hashing (6 P)</h3>
      <Card style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 15,
            color: C.text,
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "12px 14px",
            lineHeight: 1.9,
            textAlign: "center",
          }}
        >
          h(k, i) = ( h1(k) + i · h2(k) ) mod 7
          <br />
          h1(k) = k mod 7 &nbsp;&nbsp; h2(k) = 2 + (k mod 4)
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 14.5, color: C.dim, lineHeight: 1.6 }}>
          Tabellengroeße m = 7 (Indizes 0–6). Wir fuegen in drei verschiedenen Ausgangslagen je
          einen Schluessel ein und verfolgen die Sondierfolge.
        </p>
      </Card>

      {/* Teil a) Schritt fuer Schritt */}
      <VizHead title="Schritt fuer Schritt: alle drei Szenarien" sub="Gold = angetasteter Slot ist belegt (Kollision), blau = freier Slot, hier wird eingefuegt." />
      <Stepper
        steps={HASH_FRAMES}
        render={(f) => HashStepperViz(f)}
        legend={
          <div>
            <Tag color={C.accent2}>belegter Slot (Kollision)</Tag>
            <Tag color={C.accent}>freier Slot (Einfuegen)</Tag>
            <Tag color={C.panel2}>leer / unberuehrt</Tag>
          </div>
        }
      />

      <InfoBox tone="success" title="Ergebnis Teil a)">
        Szenario 1: 16 {"→"} Index <b>2</b> (Folge [2]). &nbsp; Szenario 2: 1 {"→"} Index{" "}
        <b>4</b> (Folge 1{"→"}4). &nbsp; Szenario 3: 21 {"→"} Index <b>2</b> (Folge
        0{"→"}3{"→"}6{"→"}2).
      </InfoBox>

      {/* Teil b) */}
      <h3 style={{ fontSize: 19, color: C.text, margin: "30px 0 8px" }}>
        Teil b) Lineares Sondieren — m bestimmen (7 P)
      </h3>
      <Card style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 15,
            color: C.text,
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "12px 14px",
            textAlign: "center",
          }}
        >
          h(k, i) = ( h0(k) + i ) mod m &nbsp;&nbsp; mit h0(k) = k mod m
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 15, color: C.text2, lineHeight: 1.7 }}>
          Beim <b style={{ color: C.text }}>linearen Sondieren</b> ist die Schrittweite fest 1. Gegeben
          ist die Einfuegefolge <b style={{ color: C.text }}>5, 3, 16, 6</b> und die dabei beobachteten
          Kollisionszahlen <b style={{ color: C.text }}>0, 0, 1, 0</b>. Gesucht ist die Tabellengroeße{" "}
          <K>m</K>.
        </p>
      </Card>

      <InfoBox tone="info" title="Die Herleitung (nicht nur das Ergebnis)">
        16 kollidiert <b>genau einmal</b> {"⇒"} der erste angetastete Slot ist belegt, der naechste
        ist frei. Belegt sind zu dem Zeitpunkt nur 5 und 3. Eine Kollision von 16 entsteht also nur,
        wenn 16 mod m = 5 mod m (dann teilt m die Differenz 16{"−"}5 = 11 {"⇒"} m = 11) oder
        16 mod m = 3 mod m (dann teilt m 16{"−"}3 = 13 {"⇒"} m = 13).
        <br />
        <br />
        <b style={{ color: C.accent2 }}>m = 11 scheidet aus:</b> dann weicht 16 von Slot 5 auf 6 aus —
        und der danach eingefuegte Schluessel 6 (6 mod 11 = 6) trifft genau dort auf 16, haette also
        auch eine Kollision. Beobachtet sind fuer 6 aber 0. <br />
        <b style={{ color: C.accent2 }}>m = 13 passt:</b> 16 kollidiert mit 3 (beide {"≡"} 3 mod 13),
        weicht auf 4 aus (1 Kollision), und 6 landet kollisionsfrei auf Slot 6.
      </InfoBox>

      <LinearProbeCompare />

      <InfoBox tone="success" title="Ergebnis Teil b)">
        <b>m = 13.</b> Resultierende Tabelle T (Indizes 0–12): [3]=3, [4]=16, [5]=5, [6]=6 — alle
        uebrigen Slots leer.
      </InfoBox>

      {/* Verstaendnis */}
      <h3 style={{ fontSize: 17, color: C.text, margin: "30px 0 10px" }}>Verstaendnis-Check</h3>
      <Quiz
        question="Wofuer dient h2(k) beim doppelten Hashing?"
        options={[
          "Es liefert den Start-Index in der Tabelle.",
          "Es liefert eine schluesselabhaengige Schrittweite und vermeidet so Clustering.",
          "Es verdoppelt die Tabellengroeße bei Bedarf.",
          "Es entscheidet, ob ueberhaupt sondiert wird.",
        ]}
        correctIndex={1}
        explanation="h1 gibt den Start, h2 die Schrittweite. Weil die Schrittweite vom Schluessel abhaengt, springen kollidierende Schluessel unterschiedlich weit — das bricht Cluster auf."
      />
      <Quiz
        question="Warum scheidet m = 11 in Teil b) aus?"
        options={[
          "Weil 11 keine Primzahl ist.",
          "Weil dann der Schluessel 16 gar nicht kollidieren wuerde.",
          "Weil dann der Schluessel 6 eine Kollision haette (er traefe auf das ausgewichene 16).",
          "Weil 5 und 3 bei m = 11 auf denselben Slot fallen.",
        ]}
        correctIndex={2}
        explanation="Bei m=11 weicht 16 von Slot 5 auf 6 aus. Danach trifft 6 (6 mod 11 = 6) genau dort auf 16 → 1 Kollision. Beobachtet sind aber 0. Also kann m nicht 11 sein."
      />
      <FillCheck
        prompt="Auf welchem Index landet Schluessel 21 in Szenario 3?"
        expected={["2"]}
        placeholder="Index …"
        explanation="i=3 ergibt (0 + 3·3) mod 7 = 9 mod 7 = 2, und Slot 2 ist frei."
      />
      <FillCheck
        prompt="Gib die komplette Sondierfolge von Schluessel 21 als Komma-Liste an (Indizes)."
        expected={["0,3,6,2"]}
        placeholder="z. B. 0,3,6,2"
        explanation="Die angetasteten Slots sind nacheinander 0 (belegt), 3 (belegt), 6 (belegt), 2 (frei)."
      />
    </Section>
  );
}

/* =========================================================================
   AUFGABE 2 — BFS
   ========================================================================= */

const BFS_NODES = {
  A: { x: 380, y: 44 },
  B: { x: 120, y: 154 }, E: { x: 300, y: 154 }, H: { x: 470, y: 154 }, K: { x: 650, y: 154 },
  C: { x: 60, y: 300 }, D: { x: 168, y: 300 }, F: { x: 256, y: 300 }, G: { x: 344, y: 300 },
  I: { x: 426, y: 300 }, J: { x: 516, y: 300 }, L: { x: 596, y: 300 }, M: { x: 700, y: 300 },
};
const BFS_EDGES = [
  ["A", "B"], ["A", "E"], ["A", "H"], ["A", "K"],
  ["B", "C"], ["B", "D"], ["C", "M"],
  ["E", "F"], ["E", "G"], ["G", "I"],
  ["H", "I"], ["H", "J"], ["J", "L"], ["K", "L"], ["K", "M"],
];
const BFS_ADJ = {
  A: ["B", "E", "H", "K"], B: ["A", "C", "D"], C: ["B", "M"], D: ["B"],
  E: ["A", "F", "G"], F: ["E"], G: ["E", "I"], H: ["A", "I", "J"],
  I: ["G", "H"], J: ["H", "L"], K: ["A", "L", "M"], L: ["J", "K"], M: ["C", "K"],
};

function buildBFSFrames(start) {
  const color = {}, dist = {}, parent = {};
  Object.keys(BFS_NODES).forEach((k) => {
    color[k] = "white";
    dist[k] = Infinity;
    parent[k] = null;
  });
  color[start] = "gray";
  dist[start] = 0;
  const queue = [start];
  const order = [start];
  const frames = [];
  const snap = (active, justFound, msg) =>
    frames.push({
      color: { ...color }, dist: { ...dist }, parent: { ...parent },
      queue: [...queue], order: [...order], active, justFound, explain: msg,
    });

  snap(null, [], `Start A: grau einfaerben, d[A]=0, in die Queue. Entdeckt heißt grau und in der Queue; abgearbeitet (schwarz) heißt: alle Nachbarn schon angeschaut.`);
  while (queue.length) {
    const u = queue.shift();
    snap(u, [], `Dequeue ${u} (vorderstes Element der FIFO-Queue). Jetzt die Nachbarn alphabetisch pruefen.`);
    const found = [];
    for (const v of BFS_ADJ[u]) {
      if (color[v] === "white") {
        color[v] = "gray";
        dist[v] = dist[u] + 1;
        parent[v] = u;
        queue.push(v);
        order.push(v);
        found.push(v);
        snap(u, [...found], `${v} ist weiß → entdeckt. d[${v}] = d[${u}]+1 = ${dist[v]}, Eltern π[${v}]=${u}, hinten anhaengen.`);
      }
    }
    color[u] = "black";
    snap(u, found, `${u} fertig: alle Nachbarn gesehen → schwarz.`);
  }
  snap(null, [], `Fertig. Entdeckungsreihenfolge: ${order.join(", ")}.`);
  return frames;
}
const BFS_FRAMES = buildBFSFrames("A");

function bfsNodeColors(state) {
  if (state === "white") return { fill: C.panel2, stroke: C.line, txt: C.dim };
  if (state === "gray") return { fill: "rgba(110,168,254,0.18)", stroke: C.accent, txt: C.accent };
  return { fill: "rgba(255,200,87,0.16)", stroke: C.accent2, txt: C.accent2 };
}

function BFSGraphViz(f) {
  return (
    <Card style={{ background: C.bg }}>
      <svg viewBox="0 0 760 460" style={{ width: "100%", display: "block" }}>
        {BFS_EDGES.map(([a, b], k) => {
          const onTree = f.parent[a] === b || f.parent[b] === a;
          const na = BFS_NODES[a], nb = BFS_NODES[b];
          // C-M unten herum biegen, damit die lange Kante nicht durch andere Knoten laeuft
          if ((a === "C" && b === "M") || (a === "M" && b === "C")) {
            return (
              <path
                key={k}
                d={`M ${na.x},${na.y} Q 380,455 ${nb.x},${nb.y}`}
                fill="none"
                stroke={onTree ? C.accent2 : C.line}
                strokeWidth={onTree ? 2.6 : 1.4}
              />
            );
          }
          return (
            <line
              key={k}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={onTree ? C.accent2 : C.line}
              strokeWidth={onTree ? 2.6 : 1.4}
              style={{ transition: "stroke .3s, stroke-width .3s" }}
            />
          );
        })}
        {Object.entries(BFS_NODES).map(([id, p]) => {
          const cs = bfsNodeColors(f.color[id]);
          const isActive = f.active === id;
          const isNew = f.justFound.includes(id);
          return (
            <g key={id} style={{ animation: isNew ? "pk-pop .35s ease" : "none" }}>
              <circle
                cx={p.x} cy={p.y} r={19}
                fill={cs.fill}
                stroke={isActive ? C.accent2 : cs.stroke}
                strokeWidth={isActive ? 3.6 : 2}
                style={{ transition: "fill .3s, stroke .3s" }}
              />
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? C.accent2 : cs.txt} fontSize="14" fontWeight="700">
                {id}
              </text>
              <text x={p.x} y={p.y + 32} textAnchor="middle" fill={C.dim2} fontSize="10.5">
                d={f.dist[id] === Infinity ? "∞" : f.dist[id]}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.dim, fontSize: 12.5, marginBottom: 6 }}>
          Queue (FIFO) — vorne (gold) wird als naechstes entnommen:
        </div>
        <div style={{ display: "flex", gap: 6, minHeight: 36, flexWrap: "wrap", alignItems: "center" }}>
          {f.queue.length === 0 && <span style={{ color: C.dim2, fontSize: 13 }}>— leer —</span>}
          {f.queue.map((q, k) => (
            <span
              key={k}
              style={{
                background: k === 0 ? "rgba(255,200,87,0.15)" : C.panel2,
                border: `1px solid ${k === 0 ? C.accent2 : C.line}`,
                color: k === 0 ? C.accent2 : C.text,
                borderRadius: 8,
                padding: "5px 11px",
                fontWeight: 700,
                fontSize: 13.5,
                fontFamily: MONO,
              }}
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.dim, fontSize: 12.5, marginBottom: 6 }}>Entdeckungsreihenfolge:</div>
        <div style={{ fontFamily: MONO, fontSize: 14, color: C.accent, letterSpacing: 1 }}>
          {f.order.join(" ")}
        </div>
      </div>
    </Card>
  );
}

const BFS_SEQUENCES = [
  {
    seq: ["A", "B", "E", "H", "K", "C", "D", "F", "G", "I", "L", "J", "M"],
    verdict: false,
    reason:
      "L ist Kind von K, J ist Kind von H. H wird vor K aus der Queue entnommen, also muessen alle Kinder von H (inklusive J) vor allen Kindern von K (inklusive L) entdeckt werden. Hier steht L vor J → unmoeglich.",
  },
  {
    seq: ["A", "B", "E", "K", "H", "C", "D", "F", "G", "I", "J", "L", "M"],
    verdict: false,
    reason:
      "Die Nachbarn von A werden alphabetisch entdeckt: B, E, H, K. Hier kommt K vor H → Verstoß gegen die alphabetische Reihenfolge.",
  },
  {
    seq: ["A", "B", "E", "H", "K", "C", "D", "F", "G", "I", "J", "L", "M"],
    verdict: true,
    reason: "Entspricht exakt der kanonischen BFS-Reihenfolge ab A.",
  },
];

function SeqRow({ seq, verdict, reason }) {
  return (
    <div
      style={{
        background: C.panel2,
        border: `1px solid ${verdict ? C.accent2 : C.line}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, alignItems: "center" }}>
        {seq.map((s, k) => (
          <span
            key={k}
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              color: C.text,
              background: C.panel3,
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            {s}
          </span>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontWeight: 800,
            fontSize: 13,
            color: verdict ? C.accent2 : C.dim,
            border: `1px solid ${verdict ? C.accent2 : C.dim2}`,
            borderRadius: 999,
            padding: "2px 12px",
          }}
        >
          {verdict ? "JA ✓" : "NEIN ✗"}
        </span>
      </div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>{reason}</div>
    </div>
  );
}

// Interaktiv: erste unmoegliche Stelle in Reihenfolge 1 anklicken (das L bei Index 10)
function BFSClickGame() {
  const seq = BFS_SEQUENCES[0].seq;
  const correct = 10; // das L, das vor J steht
  const [pick, setPick] = useState(null);
  const answered = pick !== null;
  const ok = pick === correct;
  return (
    <Card style={{ background: C.bg }}>
      <VizHead
        title="Klick-Aufgabe: Wo wird Reihenfolge 1 unmoeglich?"
        sub="Klicke das erste Element, das in einer korrekten BFS hier nicht stehen duerfte."
      />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {seq.map((s, k) => {
          let bg = C.panel2, border = C.line, col = C.text;
          if (answered) {
            if (k === correct) { bg = "rgba(255,200,87,0.16)"; border = C.accent2; col = C.accent2; }
            else if (k === pick) { bg = "rgba(255,255,255,0.03)"; border = C.dim2; col = C.dim; }
          }
          return (
            <button
              key={k}
              onClick={() => setPick(k)}
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 700,
                color: col,
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: 7,
                padding: "6px 11px",
                cursor: "pointer",
                transition: "background .2s, border-color .2s",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          style={{
            animation: "pk-fade .3s ease",
            color: C.text,
            fontSize: 14,
            lineHeight: 1.6,
            background: C.panel2,
            border: `1px solid ${ok ? C.accent2 : C.dim2}`,
            borderRadius: 10,
            padding: "12px 14px",
          }}
        >
          <b style={{ color: ok ? C.accent2 : C.text }}>
            {ok ? "Richtig!" : "Nicht ganz — die richtige Stelle ist gold markiert."}
          </b>{" "}
          Das <b>L</b> an dieser Stelle ist das Problem: L ist Kind von K, das davorstehende Ziel J ist
          Kind von H. Da H vor K entnommen wird, muss J vor L kommen. Hier ist die Reihenfolge vertauscht.
          <div style={{ marginTop: 8 }}>
            <button style={{ ...btnGhost, padding: "6px 12px", fontSize: 13 }} onClick={() => setPick(null)}>
              {"↺"} Nochmal
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AufgabeBFS() {
  return (
    <Section kicker="Aufgabe 2" title="Breitensuche (BFS)" points={6}>
      <Card style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          <b style={{ color: C.text }}>BFS</b> (breadth-first search, Suche in die Breite) besucht von
          einem Startknoten aus erst alle direkten Nachbarn, dann deren Nachbarn — wie eine Welle,
          die sich ausbreitet. Sie arbeitet in <b style={{ color: C.text }}>Distanzringen</b>: zuerst
          Ebene 0 (Start), dann Ebene 1, dann 2 …
        </p>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          Das Herzstueck ist eine <b style={{ color: C.text }}>FIFO-Queue</b> (First In, First Out:
          wer zuerst rein kommt, kommt zuerst raus). Man unterscheidet{" "}
          <b style={{ color: C.text }}>Entdecken</b> (ein Knoten wird grau und in die Queue gelegt) von{" "}
          <b style={{ color: C.text }}>Abarbeiten</b> (er wird aus der Queue genommen und alle seine
          Nachbarn geprueft, dann schwarz).
        </p>
        <InfoBox tone="info" title="Die entscheidende Regel fuer diese Aufgabe">
          Knoten verlassen die Queue strikt in der Reihenfolge, in der sie hineinkamen. Wird also{" "}
          <K>H</K> vor <K>K</K> entnommen, dann werden <b>alle</b> Kinder von H entdeckt, bevor das
          erste Kind von K an die Reihe kommt. Außerdem entdeckt jeder Knoten seine Nachbarn hier in{" "}
          <b style={{ color: C.text }}>alphabetischer</b> Reihenfolge (Aufgabenvorgabe).
        </InfoBox>
      </Card>

      <VizHead
        title="Die kanonische BFS ab A"
        sub="Verfolge Queue, Distanzen und Entdeckungsreihenfolge Schritt fuer Schritt."
      />
      <Stepper
        steps={BFS_FRAMES}
        render={(f) => BFSGraphViz(f)}
        legend={
          <div>
            <Tag color={C.panel2}>weiß = unentdeckt</Tag>
            <Tag color={C.accent}>grau = entdeckt, in Queue</Tag>
            <Tag color={C.accent2}>schwarz = fertig / aktiv</Tag>
          </div>
        }
      />

      <InfoBox tone="success" title="Kanonische Reihenfolge ab A">
        <span style={{ fontFamily: MONO }}>A, B, E, H, K, C, D, F, G, I, J, L, M</span> — Ebenen:
        L0 = {"{A}"}; L1 = {"{B, E, H, K}"}; L2 in Reihenfolge der Elternentnahme B,E,H,K {"→"} C,D |
        F,G | I,J | L,M.
      </InfoBox>

      <h3 style={{ fontSize: 17, color: C.text, margin: "28px 0 10px" }}>
        Die drei Reihenfolgen bewerten
      </h3>
      {BFS_SEQUENCES.map((s, k) => (
        <SeqRow key={k} {...s} />
      ))}

      <h3 style={{ fontSize: 17, color: C.text, margin: "28px 0 10px" }}>Verstaendnis-Check</h3>
      <Quiz
        question="Warum kann Reihenfolge 2 (A, B, E, K, H, …) nicht aus dieser BFS stammen?"
        options={[
          "Weil K und H nicht benachbart sind.",
          "Weil die Nachbarn von A nicht in alphabetischer Reihenfolge entdeckt werden (K vor H).",
          "Weil K eine groeßere Distanz als H hat.",
          "Weil A nur drei Nachbarn haben darf.",
        ]}
        correctIndex={1}
        explanation="A hat die Nachbarn B, E, H, K. Laut Vorgabe werden sie alphabetisch entdeckt, also … H dann K. In Reihenfolge 2 steht K vor H → unmoeglich."
      />
      <BFSClickGame />
    </Section>
  );
}

/* =========================================================================
   AUFGABE 3 — BINAERE SUCHBAEUME
   ========================================================================= */

const BST_INIT = {
  v: 10,
  l: { v: 5, l: { v: 3 }, r: { v: 8, r: { v: 9 } } },
  r: { v: 14, r: { v: 15 } },
};
const BST_A = {
  v: 10,
  l: { v: 5, l: { v: 3 }, r: { v: 8, r: { v: 9 } } },
  r: { v: 14, r: { v: 15, r: { v: 16 } } },
};
const BST_B = {
  v: 10,
  l: { v: 5, l: { v: 3 }, r: { v: 8, r: { v: 9 } } },
  r: { v: 14, l: { v: 11 }, r: { v: 15, r: { v: 16 } } },
};
const BST_C = {
  v: 10,
  l: { v: 5, l: { v: 3 }, r: { v: 9 } },
  r: { v: 14, l: { v: 11 }, r: { v: 15, r: { v: 16 } } },
};

function layoutTree(root) {
  const pos = {};
  const edges = [];
  let col = 0;
  let maxDepth = 0;
  (function visit(node, depth) {
    if (!node) return;
    visit(node.l, depth + 1);
    pos[node.v] = { col: col++, depth };
    if (depth > maxDepth) maxDepth = depth;
    visit(node.r, depth + 1);
  })(root, 0);
  (function collect(node) {
    if (!node) return;
    if (node.l) edges.push([node.v, node.l.v]);
    if (node.r) edges.push([node.v, node.r.v]);
    collect(node.l);
    collect(node.r);
  })(root);
  const cols = col;
  return { pos, edges, cols, maxDepth };
}

const BST_FRAMES = [
  // a) Insert(16)
  { tree: BST_INIT, path: [10], active: 10, op: "Insert(16)", explain: "Insert(16): Start an der Wurzel 10. 16 > 10 → gehe in den rechten Teilbaum." },
  { tree: BST_INIT, path: [10, 14], active: 14, op: "Insert(16)", explain: "16 > 14 → weiter nach rechts." },
  { tree: BST_INIT, path: [10, 14, 15], active: 15, op: "Insert(16)", explain: "16 > 15, aber 15.rechts ist frei → hier wird eingefuegt." },
  { tree: BST_A, path: [10, 14, 15, 16], active: 16, inserted: 16, op: "Insert(16)", explain: "16 wird neues rechtes Kind von 15. Suchpfad war 10 → 14 → 15." },
  // b) Insert(11)
  { tree: BST_A, path: [10], active: 10, op: "Insert(11)", explain: "Insert(11): 11 > 10 → rechter Teilbaum." },
  { tree: BST_A, path: [10, 14], active: 14, op: "Insert(11)", explain: "11 < 14 → linker Teilbaum. 14.links ist frei → hier einfuegen." },
  { tree: BST_B, path: [10, 14, 11], active: 11, inserted: 11, op: "Insert(11)", explain: "11 wird linkes Kind von 14 (denn 11 > 10, aber 11 < 14)." },
  // c) Delete(8)
  { tree: BST_B, path: [10], active: 10, op: "Delete(8)", explain: "Delete(8): Suche 8. 8 < 10 → nach links." },
  { tree: BST_B, path: [10, 5], active: 5, op: "Delete(8)", explain: "8 > 5 → nach rechts." },
  { tree: BST_B, path: [10, 5, 8], active: 8, op: "Delete(8)", explain: "8 gefunden. Knoten 8 hat genau EIN Kind (rechtes Kind 9, kein linkes)." },
  { tree: BST_B, path: [10, 5, 8], active: 8, removed: 8, op: "Delete(8)", explain: "Loesch-Fall 'ein Kind': Knoten 8 herausschneiden — das Kind 9 rueckt an seine Stelle." },
  { tree: BST_C, path: [], active: 9, inserted: 9, op: "Delete(8)", explain: "Ergebnis: 5.rechts zeigt jetzt direkt auf 9 (9 ist Blatt). Endbaum fertig." },
];

function BSTViz(f) {
  const { pos, edges, cols, maxDepth } = layoutTree(f.tree);
  const COLW = 60, ROWH = 74, PADX = 12, PADY = 34, R = 20;
  const W = cols * COLW + PADX * 2;
  const H = (maxDepth + 1) * ROWH + PADY * 2;
  const cx = (v) => pos[v].col * COLW + COLW / 2 + PADX;
  const cy = (v) => pos[v].depth * ROWH + PADY;

  return (
    <Card style={{ background: C.bg }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            background: C.panel3,
            border: `1px solid ${C.line}`,
            borderRadius: 999,
            padding: "3px 11px",
            fontSize: 12.5,
            fontWeight: 700,
            color: C.accent,
            fontFamily: MONO,
          }}
        >
          {f.op}
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: Math.min(W, 520), display: "block" }}>
          {edges.map(([a, b], k) => {
            const removingEdge = f.removed === b || f.removed === a;
            return (
              <line
                key={k}
                x1={cx(a)} y1={cy(a)} x2={cx(b)} y2={cy(b)}
                stroke={removingEdge ? C.dim2 : C.line}
                strokeWidth={2}
                strokeDasharray={removingEdge ? "5 4" : "none"}
                opacity={removingEdge ? 0.5 : 1}
              />
            );
          })}
          {Object.keys(pos).map((vStr) => {
            const v = Number(vStr);
            const onPath = f.path.includes(v);
            const isActive = f.active === v;
            const isInserted = f.inserted === v;
            const isRemoved = f.removed === v;
            let fill = C.panel2, stroke = C.line, txt = C.text;
            if (onPath) { stroke = C.accent; fill = "rgba(110,168,254,0.12)"; }
            if (isActive) { stroke = C.accent2; fill = "rgba(255,200,87,0.14)"; txt = C.accent2; }
            if (isInserted) { stroke = C.accent2; fill = "rgba(255,200,87,0.22)"; txt = C.accent2; }
            return (
              <g key={vStr} style={{ animation: isInserted ? "pk-pop .4s ease" : "none" }} opacity={isRemoved ? 0.4 : 1}>
                <circle
                  cx={cx(v)} cy={cy(v)} r={R}
                  fill={fill}
                  stroke={isRemoved ? C.dim2 : stroke}
                  strokeWidth={isActive || isInserted ? 3.4 : 2}
                  strokeDasharray={isRemoved ? "4 3" : "none"}
                  style={{ transition: "fill .25s, stroke .25s" }}
                />
                <text x={cx(v)} y={cy(v) + 1} textAnchor="middle" dominantBaseline="middle"
                  fill={isRemoved ? C.dim : txt} fontSize="15" fontWeight="700" fontFamily={MONO}>
                  {v}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

function AufgabeBST() {
  return (
    <Section kicker="Aufgabe 3" title="Binaere Suchbaeume" points={6}>
      <Card style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          Ein <b style={{ color: C.text }}>binaerer Suchbaum (BST)</b> ist ein Baum, in dem jeder Knoten
          hoechstens zwei Kinder hat und die <b style={{ color: C.text }}>BST-Eigenschaft</b> gilt:
          {" "}<span style={{ fontFamily: MONO }}>{"alles links < Knoten < alles rechts"}</span>. Dadurch
          findet man jeden Wert, indem man von der Wurzel aus immer nach links (kleiner) oder rechts
          (groeßer) abbiegt — das ist der <b style={{ color: C.text }}>Suchpfad</b>.
        </p>
        <InfoBox tone="info" title="Die drei Loeschfaelle (Ueberblick)">
          <b style={{ color: C.text }}>0 Kinder (Blatt):</b> einfach entfernen. &nbsp;
          <b style={{ color: C.text }}>1 Kind:</b> Knoten herausschneiden, das einzige Kind nimmt seinen
          Platz ein. &nbsp; <b style={{ color: C.text }}>2 Kinder:</b> durch den
          Inorder-Nachfolger (kleinster im rechten Teilbaum) ersetzen. In dieser Aufgabe brauchen wir den{" "}
          <b style={{ color: C.accent2 }}>Fall 1 Kind</b>.
        </InfoBox>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>Ausgangsbaum</div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6, fontFamily: MONO }}>
          Wurzel 10 → 10.l=5, 10.r=14; &nbsp; 5.l=3, 5.r=8; &nbsp; 8.r=9; &nbsp; 14.r=15.
        </div>
        <div style={{ color: C.text2, fontSize: 14.5, marginTop: 10, lineHeight: 1.6 }}>
          Aufgaben: <b style={{ color: C.text }}>a)</b> Insert(16), &nbsp;
          <b style={{ color: C.text }}>b)</b> Insert(11) auf dem Ergebnis von a), &nbsp;
          <b style={{ color: C.text }}>c)</b> Delete(8) auf dem Ergebnis von b).
        </div>
      </Card>

      <VizHead
        title="Schritt fuer Schritt: a) Insert(16) → b) Insert(11) → c) Delete(8)"
        sub="Blau = Suchpfad, gold = aktueller / neu eingefuegter Knoten, gestrichelt = wird entfernt."
      />
      <Stepper
        steps={BST_FRAMES}
        render={(f) => BSTViz(f)}
        legend={
          <div>
            <Tag color={C.accent}>Suchpfad</Tag>
            <Tag color={C.accent2}>aktiv / eingefuegt</Tag>
            <Tag color={C.dim2}>wird geloescht</Tag>
          </div>
        }
      />

      <InfoBox tone="success" title="Endbaum nach a), b), c)">
        <span style={{ fontFamily: MONO }}>10( 5(3, 9), 14(11, 15(–, 16)) )</span>. Also: 15.r=16,
        14.l=11, und nach Delete(8) zeigt 5.r direkt auf 9.
      </InfoBox>

      <h3 style={{ fontSize: 17, color: C.text, margin: "28px 0 10px" }}>Verstaendnis-Check</h3>
      <Quiz
        question="Welcher Loeschfall liegt bei Delete(8) vor?"
        options={[
          "Knoten ist ein Blatt (0 Kinder).",
          "Knoten mit genau einem Kind.",
          "Knoten mit zwei Kindern.",
          "Knoten ist die Wurzel.",
        ]}
        correctIndex={1}
        explanation="8 hat nur ein rechtes Kind (9) und kein linkes → Fall 'genau ein Kind'. Das Kind 9 rueckt an die Stelle von 8."
      />
      <Quiz
        question="Warum landet 11 als linkes Kind von 14?"
        options={[
          "Weil 11 kleiner als 10 ist.",
          "Weil 11 > 10 (also rechts), aber 11 < 14, und 14.links frei war.",
          "Weil 11 die naechste freie Zahl ist.",
          "Weil 14 noch kein rechtes Kind hatte.",
        ]}
        correctIndex={1}
        explanation="Der Suchpfad: 11 > 10 → rechts zu 14; 11 < 14 → links; dort ist frei → 11 wird linkes Kind von 14."
      />
      <FillCheck
        prompt="Wie lautet der Suchpfad (Knotenfolge) beim Einfuegen von 16? Komma-getrennt."
        expected={["10,14,15"]}
        placeholder="z. B. 10,14,15"
        explanation="16 > 10 (rechts zu 14), 16 > 14 (rechts zu 15), 16 > 15 und 15.rechts ist frei → dort einfuegen."
      />
    </Section>
  );
}

/* =========================================================================
   AUFGABE 4 — DIJKSTRA
   ========================================================================= */

const DIJ_NODES = {
  A: { x: 70, y: 175 }, B: { x: 220, y: 66 }, C: { x: 400, y: 162 },
  D: { x: 158, y: 330 }, E: { x: 420, y: 332 }, F: { x: 600, y: 108 }, G: { x: 578, y: 256 },
};
const DIJ_EDGES = [
  ["A", "B", 3], ["A", "D", 6], ["B", "C", 2], ["B", "E", 7], ["C", "E", 4],
  ["C", "D", 6], ["C", "F", 3], ["C", "G", 6], ["E", "G", 1], ["G", "F", 6],
];
const DIJ_TREE = [["A", "B"], ["A", "D"], ["B", "C"], ["C", "E"], ["C", "F"], ["E", "G"]];

const INF = Infinity;
// Ground-Truth-Trace: pro Zeile Status aller Knoten (d, pi, color)
const DIJ_ROWS = [
  {
    em: "0", knoten: "–", q: "–",
    st: { A: [0, "–", "w"], B: [INF, "–", "w"], C: [INF, "–", "w"], D: [INF, "–", "w"], E: [INF, "–", "w"], F: [INF, "–", "w"], G: [INF, "–", "w"] },
    relax: [],
    explain: "Startzeile (vorgegeben): A=(0,–,w), alle anderen (∞,–,w). d = vorlaeufige Distanz, π = Vorgaenger, Farbe = Status (w weiß, g grau, s schwarz).",
  },
  {
    em: "1", knoten: "A", q: "A(0)",
    st: { A: [0, "–", "s"], B: [3, "A", "g"], C: [INF, "–", "w"], D: [6, "A", "g"], E: [INF, "–", "w"], F: [INF, "–", "w"], G: [INF, "–", "w"] },
    relax: [["A", "B"], ["A", "D"]],
    explain: "ExtractMin → A (d=0, kleinste). Relax A→B: 0+3=3, A→D: 0+6=6 — beide von ∞ verbessert, π=A, grau. A ist fertig → schwarz.",
  },
  {
    em: "2", knoten: "B", q: "B(3), D(6)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "g"], D: [6, "A", "g"], E: [10, "B", "g"], F: [INF, "–", "w"], G: [INF, "–", "w"] },
    relax: [["B", "C"], ["B", "E"]],
    explain: "ExtractMin → B (d=3). Relax B→C: 3+2=5, B→E: 3+7=10. B → schwarz.",
  },
  {
    em: "3", knoten: "C", q: "C(5), D(6), E(10)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "s"], D: [6, "A", "g"], E: [9, "C", "g"], F: [8, "C", "g"], G: [11, "C", "g"] },
    relax: [["C", "E"], ["C", "F"], ["C", "G"]],
    explain: "ExtractMin → C (d=5). Relax C→E: 5+4=9 < 10 → E verbessert (Weg ueber C statt B)! C→F: 5+3=8, C→G: 5+6=11. C→D: 5+6=11, nicht < 6 → keine Aenderung. C → schwarz.",
  },
  {
    em: "4", knoten: "D", q: "D(6), F(8), E(9), G(11)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "s"], D: [6, "A", "s"], E: [9, "C", "g"], F: [8, "C", "g"], G: [11, "C", "g"] },
    relax: [],
    explain: "ExtractMin → D (d=6). D wird VOR F/E/G entnommen, weil 6 < 8, 9, 11. Nachbarn A, C sind schon schwarz → keine Verbesserung. D → schwarz.",
  },
  {
    em: "5", knoten: "F", q: "F(8), E(9), G(11)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "s"], D: [6, "A", "s"], E: [9, "C", "g"], F: [8, "C", "s"], G: [11, "C", "g"] },
    relax: [],
    explain: "ExtractMin → F (d=8). Relax F→G: 8+6=14, nicht < 11 → keine Aenderung. F → schwarz.",
  },
  {
    em: "6", knoten: "E", q: "E(9), G(11)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "s"], D: [6, "A", "s"], E: [9, "C", "s"], F: [8, "C", "s"], G: [10, "E", "g"] },
    relax: [["E", "G"]],
    explain: "ExtractMin → E (d=9). Relax E→G: 9+1=10 < 11 → G verbessert (Weg ueber E)! E → schwarz.",
  },
  {
    em: "7", knoten: "G", q: "G(10)",
    st: { A: [0, "–", "s"], B: [3, "A", "s"], C: [5, "B", "s"], D: [6, "A", "s"], E: [9, "C", "s"], F: [8, "C", "s"], G: [10, "E", "s"] },
    relax: [],
    explain: "ExtractMin → G (d=10). Alle Nachbarn schwarz → keine Aenderung. G → schwarz. Fertig — alle kuerzesten Wege stehen fest.",
  },
];
const DIJ_KEYS = ["A", "B", "C", "D", "E", "F", "G"];

function dijColor(c) {
  if (c === "w") return { fill: C.panel2, stroke: C.line, txt: C.dim };
  if (c === "g") return { fill: "rgba(110,168,254,0.18)", stroke: C.accent, txt: C.accent };
  return { fill: "rgba(255,200,87,0.16)", stroke: C.accent2, txt: C.accent2 };
}
const fmtD = (d) => (d === INF ? "∞" : d);

function edgeIn(list, a, b) {
  return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function DijkstraGraph({ row, isLast }) {
  return (
    <svg viewBox="0 0 660 400" style={{ width: "100%", display: "block" }}>
      {DIJ_EDGES.map(([a, b, w], k) => {
        const na = DIJ_NODES[a], nb = DIJ_NODES[b];
        const relaxed = edgeIn(row.relax, a, b);
        const tree = isLast && edgeIn(DIJ_TREE, a, b);
        const stroke = relaxed ? C.accent : tree ? C.accent2 : C.line;
        const sw = relaxed ? 3.4 : tree ? 2.8 : 1.4;
        const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
        return (
          <g key={k}>
            <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={stroke} strokeWidth={sw}
              style={{ transition: "stroke .3s, stroke-width .3s" }} />
            <g>
              <rect x={mx - 11} y={my - 11} width={22} height={20} rx={5} fill={C.bg} stroke={C.line} strokeWidth={1} />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fill={C.text2} fontSize="12" fontWeight="700" fontFamily={MONO}>
                {w}
              </text>
            </g>
          </g>
        );
      })}
      {DIJ_KEYS.map((id) => {
        const p = DIJ_NODES[id];
        const [d, , c] = row.st[id];
        const cs = dijColor(c);
        const isExtract = row.knoten === id;
        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r={19} fill={cs.fill}
              stroke={isExtract ? C.accent2 : cs.stroke} strokeWidth={isExtract ? 3.6 : 2}
              style={{ transition: "fill .3s, stroke .3s" }} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
              fill={isExtract ? C.accent2 : cs.txt} fontSize="14" fontWeight="700">
              {id}
            </text>
            <text x={p.x} y={p.y - 27} textAnchor="middle" fill={C.dim} fontSize="11" fontFamily={MONO}>
              {fmtD(d)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DijkstraTable({ upto }) {
  const cellStyle = { padding: "5px 4px", textAlign: "center", borderBottom: `1px solid ${C.lineSoft}`, fontFamily: MONO };
  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 620, fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, color: C.dim, fontWeight: 700 }}>EM</th>
            <th style={{ ...cellStyle, color: C.dim, fontWeight: 700, textAlign: "left", paddingLeft: 8 }}>Q</th>
            <th style={{ ...cellStyle, color: C.dim, fontWeight: 700 }}>Knoten</th>
            {DIJ_KEYS.map((k) => (
              <th key={k} style={{ ...cellStyle, color: C.accent, fontWeight: 700 }}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIJ_ROWS.slice(0, upto + 1).map((row, ri) => {
            const isCur = ri === upto;
            return (
              <tr key={ri} style={{ background: isCur ? "rgba(110,168,254,0.07)" : "transparent" }}>
                <td style={{ ...cellStyle, color: C.text, fontWeight: 700 }}>{row.em}</td>
                <td style={{ ...cellStyle, color: C.dim, textAlign: "left", paddingLeft: 8, whiteSpace: "nowrap" }}>{row.q}</td>
                <td style={{ ...cellStyle, color: isCur ? C.accent2 : C.text, fontWeight: 700 }}>{row.knoten}</td>
                {DIJ_KEYS.map((k) => {
                  const [d, pi, c] = row.st[k];
                  const cs = dijColor(c);
                  return (
                    <td key={k} style={{ ...cellStyle, background: c === "w" ? "transparent" : cs.fill }}>
                      <div style={{ color: cs.txt, fontWeight: 700 }}>{fmtD(d)}</div>
                      <div style={{ color: C.dim2, fontSize: 10.5 }}>{pi},{c}</div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DijkstraStepperViz(f, i) {
  const isLast = i === DIJ_ROWS.length - 1;
  return (
    <Card style={{ background: C.bg }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <span
          style={{
            background: C.panel3, border: `1px solid ${C.line}`, borderRadius: 999,
            padding: "3px 11px", fontSize: 12.5, fontWeight: 700, color: C.accent, fontFamily: MONO,
          }}
        >
          ExtractMin #{f.em}
        </span>
        {f.knoten !== "–" && (
          <span style={{ color: C.text, fontWeight: 700 }}>
            entnommen: <span style={{ color: C.accent2 }}>{f.knoten}</span>
          </span>
        )}
        <span style={{ marginLeft: "auto", color: C.dim, fontFamily: MONO, fontSize: 12.5 }}>
          Q: {f.q}
        </span>
      </div>
      <DijkstraGraph row={f} isLast={isLast} />
      <DijkstraTable upto={i} />
    </Card>
  );
}

function AufgabeDijkstra() {
  return (
    <Section kicker="Aufgabe 4" title="Dijkstra (kuerzeste Wege)" points={20}>
      <Card style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          Ein <b style={{ color: C.text }}>gewichteter Graph</b> hat an jeder Kante eine Zahl (das
          Gewicht, z. B. eine Entfernung). Das <b style={{ color: C.text }}>SSSP-Problem</b>
          {" "}(single-source shortest paths) sucht von einem Startknoten aus die{" "}
          <b style={{ color: C.text }}>kuerzesten Gesamtkosten</b> zu allen anderen Knoten.
        </p>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: C.text2 }}>
          <b style={{ color: C.text }}>Dijkstra</b> arbeitet <b style={{ color: C.text }}>greedy</b>:
          Aus allen noch nicht fertigen Knoten nimmt er stets den mit der{" "}
          <b style={{ color: C.text }}>kleinsten vorlaeufigen Distanz</b> und erklaert dessen Distanz fuer
          endgueltig.
        </p>
        <InfoBox tone="info" title="Min-Heap, ExtractMin, DecreaseKey und Relax">
          Die Priority Queue ist hier ein <b style={{ color: C.text }}>Min-Heap</b> (anders als der
          Max-Heap aus VL06!): <b style={{ color: C.text }}>ExtractMin</b> liefert immer den Knoten mit{" "}
          <i>kleinster</i> Distanz. <b style={{ color: C.text }}>Relax(u,v)</b> prueft, ob der Weg ueber u
          besser ist: falls <span style={{ fontFamily: MONO }}>{"v.d > u.d + w(u,v)"}</span>, dann
          aktualisiere v.d, setze π(v)=u, faerbe v grau und passe den Heap an
          (<b style={{ color: C.text }}>DecreaseKey</b>). Sind alle Nachbarn von u relaxiert, wird u
          schwarz (fertig).
        </InfoBox>
      </Card>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>Graph & Aufgabe</div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.7, fontFamily: MONO }}>
          A–B(3), A–D(6), B–C(2), B–E(7), C–E(4), C–D(6), C–F(3),
          C–G(6), E–G(1), G–F(6)
        </div>
        <div style={{ color: C.text2, fontSize: 14.5, marginTop: 10, lineHeight: 1.6 }}>
          Startknoten <b style={{ color: C.text }}>A</b>. Spalten: Aufruf-Nr. ExtractMin, Queue-Inhalt Q,
          entnommener Knoten, und je Knoten A–G das Tripel (d, π, Farbe).
        </div>
      </Card>

      <VizHead
        title="Vollstaendiger Trace — 7 ExtractMin-Aufrufe"
        sub="Blau = in diesem Schritt relaxierte (verbesserte) Kante. Die Tabelle fuellt sich Zeile fuer Zeile."
      />
      <Stepper
        steps={DIJ_ROWS}
        intervalMs={1800}
        render={(f, i) => DijkstraStepperViz(f, i)}
        legend={
          <div>
            <Tag color={C.panel2}>weiß = unentdeckt (d=∞)</Tag>
            <Tag color={C.accent}>grau = entdeckt, im Heap</Tag>
            <Tag color={C.accent2}>schwarz = fertig / entnommen</Tag>
          </div>
        }
      />

      <InfoBox tone="success" title="Kuerzeste Distanzen & Wege ab A">
        B: 3 (A→B) &nbsp;·&nbsp; C: 5 (A→B→C) &nbsp;·&nbsp; D: 6 (A→D)
        &nbsp;·&nbsp; E: 9 (A→B→C→E) &nbsp;·&nbsp; F: 8 (A→B→C→F)
        &nbsp;·&nbsp; G: 10 (A→B→C→E→G).
        <br />
        <br />
        <b style={{ color: C.text }}>Entnahme-Reihenfolge:</b>{" "}
        <span style={{ fontFamily: MONO }}>A(0), B(3), C(5), D(6), F(8), E(9), G(10)</span>.{" "}
        <b style={{ color: C.text }}>Kuerzeste-Wege-Baum:</b> B, D Kinder von A; C Kind von B; E, F Kinder
        von C; G Kind von E (im Graphen am Ende gold).
      </InfoBox>

      <h3 style={{ fontSize: 17, color: C.text, margin: "28px 0 10px" }}>Verstaendnis-Check</h3>
      <Quiz
        question="Warum verwendet Dijkstra hier einen Min-Heap und nicht den Max-Heap aus VL06?"
        options={[
          "Weil ein Min-Heap weniger Speicher braucht.",
          "Weil stets der Knoten mit kleinster vorlaeufiger Distanz entnommen werden muss.",
          "Weil der Graph ungerichtet ist.",
          "Weil die Gewichte positiv sind.",
        ]}
        correctIndex={1}
        explanation="Dijkstra ist greedy auf das Minimum: ExtractMin muss die kleinste Distanz liefern, damit ein entnommener Knoten garantiert fertig ist. Ein Max-Heap wuerde das Maximum liefern."
      />
      <Quiz
        question="In welchem Schritt wird die Distanz von E verbessert — und warum?"
        options={[
          "In EM2, weil A→B→E am kuerzesten ist.",
          "In EM3, weil der Weg ueber C (5+4=9) kuerzer ist als ueber B (3+7=10).",
          "In EM6, weil E erst dann entdeckt wird.",
          "Gar nicht, E behaelt immer 10.",
        ]}
        correctIndex={1}
        explanation="In EM2 bekommt E zunaechst 10 (ueber B). In EM3 wird C entnommen und relaxiert C→E: 5+4=9 < 10 → E wird auf 9 verbessert, π(E)=C."
      />
      <FillCheck
        prompt="Kuerzeste Distanz von A nach G?"
        expected={["10"]}
        placeholder="Zahl …"
        explanation="G wird zuletzt mit d=10 entnommen, ueber den Weg A→B→C→E→G (3+2+4+1)."
      />
      <FillCheck
        prompt="Kuerzester Weg A → G als Knotenfolge (Komma-getrennt)?"
        expected={["A,B,C,E,G"]}
        placeholder="z. B. A,B,C,E,G"
        explanation="Aus den π-Zeigern rueckwaerts: G←E←C←B←A, also A, B, C, E, G mit Gesamtkosten 10."
      />
    </Section>
  );
}

/* =========================================================================
   HAUPTKOMPONENTE
   ========================================================================= */
export default function ProbeklausurTeil2() {
  return (
    <div
      className="pk-root"
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: SANS,
      }}
    >
      <style>{STYLE}</style>

      {/* Hero / Intro */}
      <header style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px 8px" }}>
        <div
          style={{
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Probeklausur Teil 2 · Theoretische Informatik 2 · DHBW Mosbach
        </div>
        <h1 style={{ fontSize: 42, lineHeight: 1.12, margin: "0 0 18px" }}>
          Vier Aufgaben,{" "}
          <span style={{ color: C.accent }}>von Grund auf</span> erklaert
        </h1>
        <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.65, maxWidth: 660 }}>
          Diese Seite arbeitet die komplette Probeklausur Teil 2 durch:{" "}
          <b style={{ color: C.text2 }}>Hashing</b>, <b style={{ color: C.text2 }}>Breitensuche</b>,{" "}
          <b style={{ color: C.text2 }}>binaere Suchbaeume</b> und <b style={{ color: C.text2 }}>Dijkstra</b>.
          Jeder Fachbegriff wird beim ersten Auftauchen erklaert — du brauchst kein Vorwissen. Spiele
          die Stepper ab, beantworte die Checks, und du verstehst jede Aufgabe wirklich.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          {[
            ["1", "Hashing", "13 P"],
            ["2", "BFS", "6 P"],
            ["3", "Suchbaeume", "6 P"],
            ["4", "Dijkstra", "20 P"],
          ].map(([n, t, p]) => (
            <div
              key={n}
              style={{
                flex: "1 1 150px",
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div style={{ color: C.accent, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
                Aufgabe {n}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, margin: "4px 0 2px" }}>{t}</div>
              <div style={{ color: C.accent2, fontSize: 13, fontWeight: 700, fontFamily: MONO }}>{p}</div>
            </div>
          ))}
        </div>
        <div style={{ color: C.dim2, fontSize: 13, marginTop: 14, fontFamily: MONO }}>
          Summe: 45 Punkte
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}>
        <AufgabeHashing />
        <AufgabeBFS />
        <AufgabeBST />
        <AufgabeDijkstra />
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "26px 24px", textAlign: "center" }}>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.7 }}>
          Probeklausur Teil 2 · Theoretische Informatik 2 · DHBW Mosbach
          <br />
          Hashing · BFS · Binaere Suchbaeume · Dijkstra — alles von Grund auf.
        </div>
      </footer>
    </div>
  );
}
