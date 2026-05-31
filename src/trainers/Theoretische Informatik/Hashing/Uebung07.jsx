import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   ÜBUNG 07 — Erklärer
   Themen: Queue↔Stack-Umbau · Hashing (4 Sondierverfahren)
           · Suchpfade im BST · BinarySearch-Vergleichszählung
   Prof. Dr. Veronika Lesch · DHBW Mosbach
   ============================================================ */

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc",  // cyan – steht für "Hashing / Streuen": das Verteilen von Schlüsseln
  accent2: "#a78bfa", // violett – steht für "Suchen / Bäume": das gezielte Finden
  good: "#86efac",    // grün – Erfolg / freie Zelle / gültiger Pfad
  warn: "#fca5a5",    // rot  – Kollision / Verletzung / ungültig
  gold: "#fcd34d",    // gelb – aktiver Fokus / Highlight
};

/* ---------- Scroll-Reveal Hook ---------- */
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

/* ---------- Bausteine ---------- */
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
      <div
        style={{
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: 12,
          fontWeight: 700,
          color: C.accent,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
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
        gap: 6,
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
        background: `${C.accent2}15`,
        border: `1px solid ${C.accent2}55`,
        borderRadius: 12,
        padding: "16px 18px",
        margin: "18px 0",
      }}
    >
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6, fontSize: 15 }}>
        💡 {title}
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
        gap: 14,
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div style={{ width: 4, alignSelf: "stretch", background: color, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <strong style={{ color: C.text, fontSize: 15 }}>{name}</strong>
          {formula && (
            <code
              style={{
                background: C.panel2,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 13,
                color: C.accent,
              }}
            >
              {formula}
            </code>
          )}
        </div>
        {note && <div style={{ color: C.dim, fontSize: 14, marginTop: 4, lineHeight: 1.55 }}>{note}</div>}
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
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

/* ---------- Button-Styles ---------- */
const btn = {
  background: C.accent,
  color: "#0a0d14",
  border: "none",
  borderRadius: 9,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 9,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

/* ---------- gemeinsame Stepper-Steuerung ---------- */
function useStepper(maxStep, intervalMs = 1100) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= maxStep) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, step, maxStep, intervalMs]);

  const controls = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>
        {playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button
        style={btnGhost}
        onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
      >
        ◀ Zurück
      </button>
      <button
        style={btnGhost}
        onClick={() => { setPlaying(false); setStep((s) => Math.min(maxStep, s + 1)); }}
      >
        Vor ▶
      </button>
      <button style={btnGhost} onClick={() => { setPlaying(false); setStep(0); }}>
        ↺ Reset
      </button>
      <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13, alignSelf: "center" }}>
        Schritt {step} / {maxStep}
      </span>
    </div>
  );
  return { step, setStep, playing, setPlaying, controls };
}

/* =========================================================
   VIS 1 — Queue mit zwei Stacks (Aufgabe 1)
   ========================================================= */
function QueueTwoStacksVis() {
  // Operationsfolge, die das amortisierte Verhalten zeigt
  const ops = [
    { type: "enq", v: "A" },
    { type: "enq", v: "B" },
    { type: "enq", v: "C" },
    { type: "deq" },            // löst Umschütten aus (teuer)
    { type: "deq" },            // billig
    { type: "enq", v: "D" },
    { type: "deq" },            // billig
  ];
  // Schritte: 0 = Startzustand, danach pro Operation ein Schritt
  const max = ops.length;
  const { step, controls } = useStepper(max, 1300);

  // Zustand bis Schritt rekonstruieren
  let inS = [], outS = [], lastNote = "Leere Schlange. Sin = Eingangsstapel, Sout = Ausgangsstapel.", lastCost = "";
  for (let i = 0; i < step; i++) {
    const op = ops[i];
    if (op.type === "enq") {
      inS = [...inS, op.v];
      lastNote = `Enqueue(${op.v}): einfach oben auf Sin legen.`;
      lastCost = "Θ(1) — billig";
    } else {
      if (outS.length === 0) {
        // alles umschütten
        const moved = [...inS].reverse();
        outS = moved;
        inS = [];
        const popped = outS.pop();
        lastNote = `Dequeue: Sout ist leer → alle Elemente von Sin nach Sout umschütten (kehrt Reihenfolge um), dann oberstes (${popped}) zurückgeben.`;
        lastCost = "Θ(n) — teuer (Umschütten)";
      } else {
        const popped = outS.pop();
        outS = [...outS];
        lastNote = `Dequeue: Sout nicht leer → direkt oberstes (${popped}) zurückgeben. Kein Umschütten nötig.`;
        lastCost = "Θ(1) — billig";
      }
    }
  }

  const stackBox = (title, arr, color) => (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 6, textAlign: "center" }}>{title}</div>
      <div
        style={{
          minHeight: 150,
          display: "flex",
          flexDirection: "column-reverse",
          gap: 4,
          padding: 8,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
        }}
      >
        {arr.map((x, i) => (
          <div
            key={i}
            style={{
              animation: "pop .3s ease",
              background: color + "22",
              border: `1px solid ${color}`,
              color: C.text,
              borderRadius: 7,
              padding: "8px 0",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            {x}
          </div>
        ))}
        {arr.length === 0 && (
          <div style={{ color: C.dim, fontSize: 12, textAlign: "center", padding: 20 }}>leer</div>
        )}
      </div>
      <div style={{ color: C.dim, fontSize: 11, textAlign: "center", marginTop: 4 }}>↑ oben (top)</div>
    </div>
  );

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Schlange (FIFO) aus zwei Stapeln (LIFO)
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 16 }}>
        FIFO = First In, First Out (wer zuerst kommt, geht zuerst). LIFO = Last In, First Out (Stapel:
        zuletzt abgelegt = zuerst entnommen). Trick: zwei Stapel, einer für Eingang, einer für Ausgang.
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {stackBox("Sin (Eingang)", inS, C.accent)}
        {stackBox("Sout (Ausgang)", outS, C.accent2)}
      </div>
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.55,
          minHeight: 56,
        }}
      >
        {lastNote}
        {lastCost && (
          <div
            style={{
              marginTop: 6,
              color: lastCost.includes("teuer") ? C.warn : C.good,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Kosten: {lastCost}
          </div>
        )}
      </div>
      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent}>Sin: Enqueue legt hier ab</Tag>
        <Tag color={C.accent2}>Sout: Dequeue entnimmt hier</Tag>
        <Tag color={C.warn}>teures Umschütten Θ(n)</Tag>
        <Tag color={C.good}>billiger Zugriff Θ(1)</Tag>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 2 — Hashing: 4 Sondierverfahren umschaltbar (Aufgabe 2)
   ========================================================= */
const HKEYS = [44, 12, 23, 88, 71, 11, 94, 39, 20, 5, 16];
const M = 16;
const h0 = (k) => (3 * k + 7) % M;
const h2dh = (k) => 7 - 2 * (k % 4);

// Erzeugt die komplette Einfüge-Historie für ein Verfahren
function buildInsertHistory(method) {
  const T = Array(M).fill(null);
  const chains = Array.from({ length: M }, () => []);
  const events = []; // jeweils ein Schritt = ein Probing-Test bzw. finale Platzierung

  HKEYS.forEach((k) => {
    if (method === "chain") {
      const home = h0(k);
      chains[home] = [...chains[home], k];
      events.push({
        key: k,
        probe: home,
        placed: home,
        chainSnapshot: chains.map((c) => [...c]),
        T: null,
        info: `h(${k}) = (3·${k}+7) mod 16 = ${home}. Anhängen an Liste in Zelle ${home}.`,
        success: true,
        probeCount: 1,
      });
      return;
    }
    // offene Adressierung
    let i = 0;
    while (true) {
      let pos;
      let formula;
      if (method === "lin") {
        pos = (h0(k) + i) % M;
        formula = `(h0(${k})+${i}) mod16 = (${h0(k)}+${i}) mod16 = ${pos}`;
      } else if (method === "quad") {
        pos = Math.trunc(h0(k) + 0.5 * i + 0.5 * i * i) % M;
        formula = `(h0+½·${i}+½·${i}²) mod16 = ${pos}`;
      } else {
        pos = (h0(k) + i * h2dh(k)) % M;
        formula = `(h1(${k})+${i}·h2(${k})) mod16 = (${h0(k)}+${i}·${h2dh(k)}) mod16 = ${pos}`;
      }
      const free = T[pos] === null;
      events.push({
        key: k,
        probe: pos,
        i,
        T: T.map((x) => x),
        info: `i=${i}: ${formula} → Zelle ${pos} ${free ? "ist FREI ✓" : "ist belegt ✗ (Kollision)"}`,
        success: free,
        collision: !free,
      });
      if (free) {
        T[pos] = k;
        break;
      }
      i++;
    }
  });
  return { events, finalT: T, finalChains: chains };
}

const METHODS = {
  chain: { label: "Verkettung", color: C.accent },
  lin: { label: "Lineares Sondieren", color: C.accent2 },
  quad: { label: "Quadrat. Sondieren", color: C.gold },
  dh: { label: "Doppeltes Hashing", color: C.good },
};
// erfolglose Tests gesamt (vorab berechnet, stimmen mit Skript überein)
const FAILS = { chain: "—", lin: 8, quad: 12, dh: 4 };

function HashingVis() {
  const [method, setMethod] = useState("lin");
  const hist = React.useMemo(() => buildInsertHistory(method), [method]);
  const max = hist.events.length;
  const { step, setStep, controls } = useStepper(max, 850);

  // Reset Schritt bei Verfahrenwechsel
  useEffect(() => { setStep(0); }, [method]); // eslint-disable-line

  const ev = step > 0 ? hist.events[step - 1] : null;

  // aktueller Tabellen-/Listenzustand
  let T, chains;
  if (method === "chain") {
    chains = ev ? ev.chainSnapshot : Array.from({ length: M }, () => []);
    T = null;
  } else {
    T = ev ? [...ev.T] : Array(M).fill(null);
    if (ev && ev.success) T[ev.probe] = ev.key; // gerade platziert sichtbar machen
  }

  const cellStyle = (idx) => {
    let bg = C.panel2, border = C.line, txt = C.text;
    if (ev) {
      if (ev.probe === idx && ev.collision) { bg = C.warn + "33"; border = C.warn; }
      else if (ev.probe === idx && ev.success) { bg = C.good + "33"; border = C.good; }
    }
    return {
      border: `1px solid ${border}`,
      background: bg,
      color: txt,
      borderRadius: 8,
      padding: "10px 4px",
      textAlign: "center",
      fontSize: 14,
      fontWeight: 700,
      transition: "background .3s, border-color .3s",
      minHeight: 22,
    };
  };

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Hashtabelle T[0..15] aufbauen — vier Kollisionsverfahren
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 14 }}>
        Schlüssel in Reihenfolge: {HKEYS.join(", ")}. Basis-Hashfunktion h0(k) = (3k+7) mod 16.
        Kollision = zwei Schlüssel wollen dieselbe Zelle. <em>Sondieren</em> = systematisch nach einer
        Ersatzzelle suchen.
      </div>

      {/* Verfahren-Auswahl */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(METHODS).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMethod(key)}
            style={{
              ...(method === key ? btn : btnGhost),
              background: method === key ? m.color : "transparent",
              color: method === key ? "#0a0d14" : C.text,
              borderColor: m.color,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Tabelle */}
      {method === "chain" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {chains.map((c, idx) => {
            const active = ev && ev.placed === idx;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    textAlign: "right",
                    color: C.dim,
                    fontSize: 13,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  [{idx}]
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 6,
                    minHeight: 30,
                    padding: 4,
                    borderRadius: 8,
                    background: active ? C.good + "1f" : "transparent",
                    transition: "background .3s",
                  }}
                >
                  {c.map((x, j) => (
                    <span
                      key={j}
                      style={{
                        animation: "pop .3s ease",
                        background: C.accent + "22",
                        border: `1px solid ${C.accent}`,
                        color: C.text,
                        borderRadius: 6,
                        padding: "3px 9px",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 6,
          }}
        >
          {T.map((x, idx) => (
            <div key={idx}>
              <div style={{ color: C.dim, fontSize: 10, textAlign: "center", marginBottom: 2 }}>{idx}</div>
              <div style={cellStyle(idx)}>{x === null ? "·" : x}</div>
            </div>
          ))}
        </div>
      )}

      {/* Erklärzeile */}
      <div
        style={{
          marginTop: 14,
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          minHeight: 44,
          color: C.text,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {ev ? (
          <>
            <span style={{ color: METHODS[method].color, fontWeight: 700 }}>Schlüssel {ev.key}:</span>{" "}
            {ev.info}
          </>
        ) : (
          "Drücke ▶ oder „Vor“, um Schlüssel für Schlüssel einzufügen."
        )}
      </div>

      {controls}

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <Tag color={C.warn}>Kollision (Zelle belegt)</Tag>
        <Tag color={C.good}>freie Zelle gefunden</Tag>
        <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>
          Erfolglose Tests gesamt: <strong style={{ color: C.gold }}>{FAILS[method]}</strong>
        </span>
      </div>
    </Card>
  );
}

/* =========================================================
   VIS 3 — Suchpfad im BST prüfen (Aufgabe 3)
   ========================================================= */
const BST_CASES = {
  A1: { arr: [2, 252, 401, 398, 330, 344, 397, 363], valid: true },
  A2: { arr: [924, 220, 911, 244, 898, 258, 362, 363], valid: true },
  A3: { arr: [935, 278, 347, 621, 299, 392, 358, 363], valid: false },
};

function buildBSTHistory(arr) {
  // Intervall (lo,hi); Richtung bestimmt das nächste Element
  let lo = -Infinity, hi = Infinity;
  const steps = [];
  let fromDir = null; // Richtung, mit der dieser Knoten vom Vorgänger erreicht wurde (L/R)
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    const ok = lo < x && x < hi;
    let dir = null, nlo = lo, nhi = hi;
    if (ok && i + 1 < arr.length) {
      const nxt = arr[i + 1];
      if (nxt < x) { dir = "links"; nhi = x; }
      else { dir = "rechts"; nlo = x; }
    }
    // welche Pseudocode-Zeile gehört zu diesem Schritt?
    // ungültig -> Zeile 4 (return False); gültig+links -> 6; gültig+rechts -> 7;
    // gültig, letztes Element -> 3 (nur Prüfung)
    let line;
    if (!ok) line = 4;
    else if (dir === "links") line = 6;
    else if (dir === "rechts") line = 7;
    else line = 3;
    steps.push({
      idx: i, x, lo, hi, ok, dir, fromDir, line,
      nlo: ok ? nlo : lo, nhi: ok ? nhi : hi,
    });
    if (!ok) break;
    // Richtung, mit der der NÄCHSTE Knoten erreicht wird
    fromDir = dir === "links" ? "L" : dir === "rechts" ? "R" : null;
    lo = nlo; hi = nhi;
  }
  return steps;
}

/* Pseudocode für Aufgabe 3b — Python-nah, Zeilenindex = Position im Array.
   Die Vis hebt pro Schritt die gerade ausgeführte Zeile hervor. */
const BST_PSEUDO = [
  { n: 0, code: "istSuchpfad(A[1..k]):", indent: 0 },
  { n: 1, code: "lo, hi = −∞, +∞            # erlaubtes Intervall", indent: 1 },
  { n: 2, code: "for i = 1 to k:", indent: 1 },
  { n: 3, code: "if not (lo < A[i] < hi):", indent: 2 },
  { n: 4, code: "return False        # Wert außerhalb → unmöglich", indent: 3 },
  { n: 5, code: "if i < k:                # es folgt noch ein Knoten", indent: 2 },
  { n: 6, code: "if A[i+1] < A[i]: hi = A[i]   # weiter nach links", indent: 3 },
  { n: 7, code: "else:             lo = A[i]   # weiter nach rechts", indent: 3 },
  { n: 8, code: "return True              # ganze Folge konsistent", indent: 1 },
];

/* Baum-Layout: der Suchpfad ist eine Kette. Jeder Knoten sitzt eine Ebene
   tiefer und horizontal nach links/rechts versetzt, je nach Abbiegerichtung.
   Der Versatz halbiert sich pro Ebene, damit nichts kollidiert. */
function layoutTree(steps) {
  const nodes = [];
  const W = 560, H = 360;
  const cx = W / 2;
  const levelGap = 42;
  let x = cx, y = 30;
  let spread = 130;
  steps.forEach((s, i) => {
    if (i > 0) {
      // bewege je nach fromDir
      x += s.fromDir === "L" ? -spread : spread;
      y += levelGap;
      spread = Math.max(22, spread * 0.62);
    }
    nodes.push({ ...s, px: x, py: y });
  });
  // ghost: bei ungültigem Schritt zeige, wohin der Knoten EIGENTLICH müsste
  // (auf der durch fromDir vorgegebenen Seite) -> dort liegt er falsch
  return { nodes, W, H };
}

function fmtBound(v) {
  if (v === -Infinity) return "−∞";
  if (v === Infinity) return "+∞";
  return v;
}

function BSTPathVis() {
  const [caseKey, setCaseKey] = useState("A1");
  const [view, setView] = useState("baum"); // "baum" | "intervall"
  const data = BST_CASES[caseKey];
  const steps = React.useMemo(() => buildBSTHistory(data.arr), [caseKey]);
  const tree = React.useMemo(() => layoutTree(steps), [steps]);
  const max = steps.length;
  const { step, setStep, controls } = useStepper(max, 1100);
  useEffect(() => { setStep(0); }, [caseKey]); // eslint-disable-line

  const cur = step > 0 ? steps[step - 1] : null;

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        Ist die Folge ein gültiger Suchpfad im binären Suchbaum?
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 14 }}>
        Idee: Jeder besuchte Knoten engt ein erlaubtes Intervall (lo, hi) ein. Geht die Suche danach nach
        links, wird hi = Knotenwert; geht sie nach rechts, wird lo = Knotenwert. Liegt ein Wert außerhalb
        seines Intervalls, ist der Pfad <strong>unmöglich</strong>. Schalte zwischen beiden Ansichten um —
        sie zeigen dasselbe von zwei Seiten.
      </div>

      {/* Fall-Auswahl + Ansichts-Umschalter */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        {Object.keys(BST_CASES).map((k) => (
          <button
            key={k}
            onClick={() => setCaseKey(k)}
            style={{
              ...(caseKey === k ? btn : btnGhost),
              background: caseKey === k ? C.accent2 : "transparent",
              color: caseKey === k ? "#0a0d14" : C.text,
              borderColor: C.accent2,
            }}
          >
            {k}
          </button>
        ))}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 4,
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 9,
            padding: 3,
          }}
        >
          {[
            ["baum", "🌳 Baum"],
            ["intervall", "📏 Intervall"],
            ["code", "💻 Code"],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 7,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 700,
                background: view === v ? C.accent : "transparent",
                color: view === v ? "#0a0d14" : C.dim,
                transition: "background .2s, color .2s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* BAUM-ANSICHT */}
      {view === "baum" && (
        <div
          style={{
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 8,
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          <svg
            viewBox={`0 0 ${tree.W} ${tree.H}`}
            style={{ width: "100%", minWidth: 460, display: "block" }}
          >
            {/* Kanten zwischen aufeinanderfolgenden, bereits sichtbaren Knoten */}
            {tree.nodes.map((n, i) => {
              if (i === 0) return null;
              const prev = tree.nodes[i - 1];
              const visible = cur && i <= cur.idx;
              if (!visible) return null;
              const violation = n.idx === (cur && cur.idx) && !n.ok;
              const stroke = violation ? C.warn : C.accent2;
              const midX = (prev.px + n.px) / 2;
              const midY = (prev.py + n.py) / 2;
              return (
                <g key={"e" + i}>
                  <line
                    x1={prev.px}
                    y1={prev.py}
                    x2={n.px}
                    y2={n.py}
                    stroke={stroke}
                    strokeWidth={2}
                    strokeDasharray={violation ? "5 4" : "0"}
                    style={{ transition: "stroke .3s" }}
                  />
                  {/* L/R-Label an der Kante */}
                  <text
                    x={midX + (n.fromDir === "L" ? -12 : 12)}
                    y={midY}
                    fill={C.dim}
                    fontSize={12}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {n.fromDir === "L" ? "links" : "rechts"}
                  </text>
                </g>
              );
            })}

            {/* Knoten */}
            {tree.nodes.map((n, i) => {
              const visible = cur && i <= cur.idx;
              if (!visible) return null;
              const active = cur && i === cur.idx;
              const isViol = active && !n.ok;
              let fill = C.panel,
                stroke = C.accent2,
                txt = C.text;
              if (active && n.ok) { stroke = C.gold; fill = C.gold + "22"; }
              if (isViol) { stroke = C.warn; fill = C.warn + "33"; }
              return (
                <g key={"n" + i} style={{ transition: "opacity .3s" }}>
                  <circle
                    cx={n.px}
                    cy={n.py}
                    r={19}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={active ? 3 : 2}
                    style={{ transition: "stroke .3s, fill .3s" }}
                  />
                  <text
                    x={n.px}
                    y={n.py + 4}
                    fill={txt}
                    fontSize={13}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {n.x}
                  </text>
                  {i === 0 && (
                    <text x={n.px} y={n.py - 26} fill={C.dim} fontSize={11} textAnchor="middle">
                      Wurzel
                    </text>
                  )}
                </g>
              );
            })}

            {/* Verletzungs-Hinweis: zeige das verbotene Intervall am fehlerhaften Knoten */}
            {cur && !cur.ok && (() => {
              const n = tree.nodes[cur.idx];
              return (
                <text
                  x={n.px}
                  y={n.py + 38}
                  fill={C.warn}
                  fontSize={11}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  muss in ({fmtBound(cur.lo)}, {fmtBound(cur.hi)}) liegen — tut es nicht
                </text>
              );
            })()}
          </svg>
        </div>
      )}

      {/* CODE-ANSICHT: synchron mitlaufender Pseudocode */}
      {view === "code" && (
        <div
          style={{
            background: "#0b0e15",
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: "14px 4px",
            marginBottom: 16,
            fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
            fontSize: 13.5,
            lineHeight: 1.9,
            overflowX: "auto",
          }}
        >
          {BST_PSEUDO.map((row) => {
            const isActive = cur && cur.line === row.n;
            const isViolLine = isActive && cur && !cur.ok; // Zeile 4 bei Verletzung
            const barColor = isViolLine ? C.warn : isActive ? C.gold : "transparent";
            return (
              <div
                key={row.n}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  background: isActive
                    ? (isViolLine ? C.warn + "22" : C.gold + "1c")
                    : "transparent",
                  transition: "background .3s",
                }}
              >
                <span
                  style={{
                    width: 3,
                    background: barColor,
                    transition: "background .3s",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    width: 26,
                    textAlign: "right",
                    color: C.dim,
                    paddingRight: 10,
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  {row.n + 1}
                </span>
                <span
                  style={{
                    paddingLeft: row.indent * 22,
                    color: isActive ? C.text : C.dim,
                    whiteSpace: "pre",
                    transition: "color .3s",
                  }}
                >
                  {row.code}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Live-Zustand der Variablen (in Code-Ansicht nützlich) */}
      {view === "code" && cur && (
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          <span
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "6px 12px",
              color: C.text,
            }}
          >
            i = <strong style={{ color: C.accent }}>{cur.idx + 1}</strong>
          </span>
          <span
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "6px 12px",
              color: C.text,
            }}
          >
            A[i] = <strong style={{ color: C.gold }}>{cur.x}</strong>
          </span>
          <span
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "6px 12px",
              color: C.text,
            }}
          >
            lo = <strong style={{ color: C.accent2 }}>{fmtBound(cur.lo)}</strong>
          </span>
          <span
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: "6px 12px",
              color: C.text,
            }}
          >
            hi = <strong style={{ color: C.accent2 }}>{fmtBound(cur.hi)}</strong>
          </span>
        </div>
      )}

      {/* Folge als Zellen (immer sichtbar, zeigt Position im Pfad) */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {data.arr.map((x, i) => {
          const visited = cur && i < cur.idx;
          const active = cur && i === cur.idx;
          let border = C.line, bg = C.panel2, col = C.text;
          if (visited) { border = C.accent2; bg = C.accent2 + "1a"; }
          if (active) {
            if (cur.ok) { border = C.gold; bg = C.gold + "22"; }
            else { border = C.warn; bg = C.warn + "33"; }
          }
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${border}`,
                background: bg,
                color: col,
                borderRadius: 8,
                padding: "10px 12px",
                fontWeight: 700,
                fontSize: 14,
                transition: "background .3s, border-color .3s",
                animation: active ? "pop .3s ease" : "none",
              }}
            >
              {x}
            </div>
          );
        })}
      </div>

      {/* aktuelle Prüfung */}
      <div
        style={{
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "14px 16px",
          minHeight: 70,
          color: C.text,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {!cur ? (
          "Wähle eine Folge und drücke ▶."
        ) : cur.ok ? (
          <>
            <div>
              Knoten <strong style={{ color: C.gold }}>{cur.x}</strong> muss im Intervall{" "}
              <code style={{ color: C.accent }}>
                ({fmtBound(cur.lo)}, {fmtBound(cur.hi)})
              </code>{" "}
              liegen — <span style={{ color: C.good, fontWeight: 700 }}>passt ✓</span>
            </div>
            {cur.dir && (
              <div style={{ marginTop: 6, color: C.dim }}>
                Nächster Wert ist {cur.dir === "links" ? "kleiner" : "größer"} → gehe nach {cur.dir}, neues
                Intervall{" "}
                <code style={{ color: C.accent2 }}>
                  ({fmtBound(cur.nlo)}, {fmtBound(cur.nhi)})
                </code>
              </div>
            )}
          </>
        ) : (
          <div>
            Knoten <strong style={{ color: C.warn }}>{cur.x}</strong> müsste im Intervall{" "}
            <code style={{ color: C.accent }}>
              ({fmtBound(cur.lo)}, {fmtBound(cur.hi)})
            </code>{" "}
            liegen, tut es aber nicht →{" "}
            <span style={{ color: C.warn, fontWeight: 700 }}>UNGÜLTIGER Pfad ✗</span>
          </div>
        )}
      </div>

      {step >= max && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            background: data.valid ? C.good + "1f" : C.warn + "1f",
            color: data.valid ? C.good : C.warn,
            border: `1px solid ${data.valid ? C.good : C.warn}55`,
          }}
        >
          Ergebnis: {data.valid ? "gültiger Suchpfad ✓" : "kein gültiger Suchpfad ✗"}
        </div>
      )}

      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent2}>bereits besucht</Tag>
        <Tag color={C.gold}>aktuell geprüft</Tag>
        <Tag color={C.warn}>Intervallverletzung</Tag>
      </div>

      {view === "baum" && (
        <div style={{ color: C.dim, fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
          Im Baum ist der Suchpfad eine <strong>Kette</strong>: jeder Knoten hat genau ein Kind — links,
          wenn der nächste Wert kleiner ist, rechts, wenn er größer ist. Bei <strong>A3</strong> sieht man
          es direkt: Von 347 ging es nach rechts zu 621, also dürfen ab da nur noch Werte über 347 kommen.
          Der nächste Wert 299 ist aber kleiner als 347 — er kann im rechten Teilbaum von 347 gar nicht
          existieren. Die Kante wird rot gestrichelt.
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   VIS 4 — BinarySearch Vergleiche zählen (Aufgabe 4)
   ========================================================= */
function binSearchSteps(n) {
  // Worst case: Element nicht vorhanden, immer linke Hälfte. Indizes 1..n
  const steps = [];
  let l = 1, r = n, cmp = 0;
  while (l <= r) {
    const m = Math.floor((l + r) / 2);
    cmp += 2; // A[m]==k  und  A[m]>k
    steps.push({ l, r, m, cmp });
    r = m - 1; // key kleiner als alle -> links weiter
  }
  return steps;
}

function BinarySearchVis() {
  const exps = [1, 2, 3, 4]; // n = 2,4,8,16
  const [exp, setExp] = useState(3);
  const n = 2 ** exp;
  const steps = React.useMemo(() => binSearchSteps(n), [n]);
  const max = steps.length;
  const { step, setStep, controls } = useStepper(max, 950);
  useEffect(() => { setStep(0); }, [n]); // eslint-disable-line

  const cur = step > 0 ? steps[step - 1] : null;
  const totalCmp = cur ? cur.cmp : 0;

  return (
    <Card>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>
        BinarySearch: Vergleiche im Worst-Case zählen
      </div>
      <div style={{ color: C.dim, fontSize: 13, marginBottom: 14 }}>
        Jeder Aufruf macht 2 Vergleiche mit Feldelementen (A[m]==k und A[m]&gt;k). Worst Case: gesuchtes
        Element ist nicht vorhanden, das Intervall wird jedes Mal halbiert, bis es leer ist. Bei n = 2ⁱ
        gibt es log₂(n) Halbierungen.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {exps.map((e) => (
          <button
            key={e}
            onClick={() => setExp(e)}
            style={{
              ...(exp === e ? btn : btnGhost),
              background: exp === e ? C.accent : "transparent",
              color: exp === e ? "#0a0d14" : C.text,
              borderColor: C.accent,
            }}
          >
            n = 2^{e} = {2 ** e}
          </button>
        ))}
      </div>

      {/* Feld-Visualisierung */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
        {Array.from({ length: n }, (_, i) => {
          const pos = i + 1;
          let bg = C.panel2, border = C.line, col = C.dim;
          if (cur) {
            const inRange = pos >= cur.l && pos <= cur.r;
            if (inRange) { col = C.text; border = C.accent2; bg = C.accent2 + "14"; }
            if (pos === cur.m) { bg = C.gold + "33"; border = C.gold; col = C.text; }
          }
          return (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${border}`,
                background: bg,
                color: col,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                transition: "background .3s, border-color .3s",
              }}
            >
              {pos}
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: C.panel2,
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: "12px 14px",
          minHeight: 44,
          color: C.text,
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {cur ? (
          <>
            Intervall [{cur.l}, {cur.r}], Mitte m = <strong style={{ color: C.gold }}>{cur.m}</strong>. +2
            Vergleiche → laufende Summe{" "}
            <strong style={{ color: C.accent }}>{cur.cmp}</strong>. Element nicht gefunden → suche links
            weiter.
          </>
        ) : (
          "Drücke ▶, um die Halbierungen mitzuzählen."
        )}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 14, color: C.text }}>
          Vergleiche bisher: <strong style={{ color: C.gold, fontSize: 18 }}>{totalCmp}</strong>
        </div>
        {step >= max && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: C.good + "1f",
              border: `1px solid ${C.good}55`,
              color: C.good,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Worst-Case-Gesamt: 2·log₂({n}) = 2·{exp} = {2 * exp} Vergleiche
          </div>
        )}
      </div>

      {controls}
      <div style={{ marginTop: 12 }}>
        <Tag color={C.accent2}>aktives Suchintervall</Tag>
        <Tag color={C.gold}>geprüfte Mitte m</Tag>
      </div>
    </Card>
  );
}

/* =========================================================
   HAUPTKOMPONENTE
   ========================================================= */
export default function Uebung07Erklaerer() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes pop {
          0%   { transform: scale(.6); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        code { font-family: 'SF Mono', 'Fira Code', Consolas, monospace; }
        ::selection { background: ${C.accent}55; }
      `}</style>

      {/* HERO */}
      <header
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "72px 24px 40px",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.accent2,
            border: `1px solid ${C.accent2}55`,
            borderRadius: 999,
            padding: "5px 14px",
            marginBottom: 20,
          }}
        >
          Übung 07 · Theoretische Informatik
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "0 0 18px", letterSpacing: -1 }}>
          Datenstrukturen, Hashing &<br />
          das geschickte Suchen
        </h1>
        <p style={{ fontSize: 18, color: C.dim, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>
          Vier Aufgaben, ein roter Faden: Wie baut man eine Datenstruktur aus einer anderen? Wie verteilt
          man Daten kollisionsfrei? Und wie findet man etwas, ohne alles durchzuschauen? Du arbeitest hier
          jede Aufgabe Schritt für Schritt interaktiv durch — jeder Begriff wird beim ersten Auftreten
          erklärt.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* 0. PROBLEM */}
        <Section kicker="0 · Motivation" title="Warum diese vier Aufgaben zusammengehören">
          <Card>
            <p style={{ margin: "0 0 14px", lineHeight: 1.7, fontSize: 16 }}>
              In der Informatik geht es ständig darum, <strong>Daten zu speichern</strong> und sie später
              schnell <strong>wiederzufinden</strong>. Übung 07 beleuchtet beide Seiten:
            </p>
            <MethodRow
              color={C.accent}
              name="Aufgabe 1 — Datenstrukturen umbauen"
              note="Kann man eine Schlange (FIFO) nur mit Stapeln (LIFO) nachbauen — und umgekehrt? Das schult das Verständnis, dass Datenstrukturen Schnittstellen sind, keine festen Dinge."
            />
            <MethodRow
              color={C.accent2}
              name="Aufgabe 2 — Hashing"
              note="Wie speichert man Schlüssel so, dass man fast in konstanter Zeit darauf zugreift? Und was tut man bei Kollisionen?"
            />
            <MethodRow
              color={C.gold}
              name="Aufgabe 3 — Suchpfade im Baum"
              note="Welche Knotenfolgen kann eine Suche in einem binären Suchbaum überhaupt erzeugen?"
            />
            <MethodRow
              color={C.good}
              name="Aufgabe 4 — BinarySearch analysieren"
              note="Wie viele Vergleiche braucht die binäre Suche genau — und wie macht man sie noch sparsamer?"
            />
            <p style={{ margin: "16px 0 0", color: C.dim, fontSize: 14, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>FIFO</strong> = First In, First Out (Warteschlange).{" "}
              <strong style={{ color: C.text }}>LIFO</strong> = Last In, First Out (Stapel).
            </p>
          </Card>
        </Section>

        {/* 1. AUFGABE 1 */}
        <Section kicker="1 · Aufgabe 1" title="Eine Schlange aus zwei Stapeln bauen">
          <p style={{ lineHeight: 1.7, fontSize: 16, marginTop: 0 }}>
            Ein <strong>Stapel</strong> (Stack) gibt immer das zuletzt abgelegte Element zurück (LIFO). Eine{" "}
            <strong>Schlange</strong> (Queue) soll aber das <em>älteste</em> Element zuerst herausgeben
            (FIFO) — also genau die umgekehrte Reihenfolge. Mit <strong>zwei</strong> Stapeln dreht man die
            Reihenfolge einmal um und erhält FIFO-Verhalten.
          </p>

          <InfoBox title="Die Idee: zweimal umdrehen ergibt richtig herum">
            Lege alle Enqueue-Elemente auf den Eingangsstapel <code>Sin</code>. Beim Dequeue: ist der
            Ausgangsstapel <code>Sout</code> leer, schütte <em>alle</em> Elemente von <code>Sin</code> nach{" "}
            <code>Sout</code> um. Durch das zweimalige Stapeln (rein, raus) steht das älteste Element nun
            oben auf <code>Sout</code> — also genau das, was FIFO verlangt.
          </InfoBox>

          <QueueTwoStacksVis />

          <InfoBox title="Laufzeiten (a) — Schlange aus zwei Stapeln">
            <strong>Enqueue:</strong> immer nur auf <code>Sin</code> legen →{" "}
            <span style={{ color: C.good }}>Θ(1)</span>.<br />
            <strong>Dequeue (Worst Case):</strong> ist <code>Sout</code> leer, müssen erst alle n Elemente
            umgeschüttet werden → <span style={{ color: C.warn }}>Θ(n)</span>.<br />
            <span style={{ color: C.dim }}>
              (Θ, „Theta", bedeutet: die Laufzeit wächst genau in dieser Größenordnung — als scharfe obere
              und untere Schranke. Über viele Operationen gemittelt ist Dequeue trotzdem nur Θ(1)
              „amortisiert", weil jedes Element höchstens einmal umgeschüttet wird.)
            </span>
          </InfoBox>

          <InfoBox title="Spiegelbild (b) — Stapel aus zwei Schlangen">
            Umgekehrt baut man einen Stapel aus zwei Schlangen. <strong>Push:</strong> Element in die aktive
            Schlange einreihen → <span style={{ color: C.good }}>Θ(1)</span>. <strong>Pop/Top:</strong> Man
            braucht das <em>zuletzt</em> eingefügte Element, das aber bei FIFO ganz hinten steht. Also
            schiebt man alle bis auf das letzte in die zweite Schlange um →{" "}
            <span style={{ color: C.warn }}>Θ(n)</span>. (Je nach gewählter Variante kann man Push oder
            Pop teuer machen — eines von beiden bleibt immer Θ(n).)
          </InfoBox>
        </Section>

        {/* 2. AUFGABE 2 */}
        <Section kicker="2 · Aufgabe 2" title="Hashing — Schlüssel verteilen, Kollisionen auflösen">
          <p style={{ lineHeight: 1.7, fontSize: 16, marginTop: 0 }}>
            Eine <strong>Hashtabelle</strong> ist ein Feld <code>T[0..15]</code>. Die{" "}
            <strong>Hashfunktion</strong> <code>h0(k) = (3k+7) mod 16</code> rechnet jeden Schlüssel k auf
            eine Zelle 0..15 um (<code>mod 16</code> = Rest bei Division durch 16, garantiert einen Index im
            Bereich). Problem: Zwei verschiedene Schlüssel können auf dieselbe Zelle fallen — eine{" "}
            <strong style={{ color: C.warn }}>Kollision</strong>. Genau dafür gibt es vier Verfahren.
          </p>

          <Card style={{ marginBottom: 18 }}>
            <MethodRow
              color={C.accent}
              name="Verkettung (Chaining)"
              formula="Liste pro Zelle"
              note="Jede Zelle hält eine verkettete Liste. Kollidierende Schlüssel werden einfach angehängt. Keine Ersatzsuche nötig."
            />
            <MethodRow
              color={C.accent2}
              name="Lineares Sondieren"
              formula="(h0(k)+i) mod 16"
              note="Bei Kollision i um 1 erhöhen → die nächste Zelle probieren, dann übernächste usw. Neigt zu Klumpenbildung (Clustering)."
            />
            <MethodRow
              color={C.gold}
              name="Quadratisches Sondieren"
              formula="(h0+½i+½i²) mod 16"
              note="Der Abstand wächst quadratisch (1, 3, 6, 10, …). Verteilt besser als lineares, kann aber Zellen auslassen."
            />
            <MethodRow
              color={C.good}
              name="Doppeltes Hashing"
              formula="(h1(k)+i·h2(k)) mod 16"
              note="Die Schrittweite h2(k)=7−2(k mod 4) hängt vom Schlüssel ab. Verschiedene Schlüssel sondieren unterschiedlich → wenigste Kollisionen."
            />
            <div style={{ color: C.dim, fontSize: 13, marginTop: 12, lineHeight: 1.55 }}>
              <strong style={{ color: C.text }}>i</strong> = Sondierungsversuch (startet bei 0).{" "}
              <strong style={{ color: C.text }}>„Erfolgloser Test"</strong> = eine geprüfte Zelle, die schon
              belegt war.
            </div>
          </Card>

          <HashingVis />

          <InfoBox title="Teil (b) — Wann doppeltes Hashing scheitert">
            Beim doppelten Hashing muss die Schrittweite <code>h2(k)</code>{" "}
            <strong>teilerfremd zur Tabellengröße 16</strong> sein, sonst werden nicht alle Zellen erreicht.
            Mit <code>h2(k) = 8 − (k mod 8)</code> entstehen Werte wie 8, 4, 2 — diese teilen 16 (gemeinsamer
            Teiler &gt; 1). Folge: Die Sondierfolge läuft in einem kurzen Zyklus und besucht nur einen Teil
            der Tabelle. Selbst wenn die Tabelle noch freie Plätze hat, findet ein Schlüssel{" "}
            <strong style={{ color: C.warn }}>möglicherweise keinen freien Platz</strong> — das Einfügen
            schlägt fehl, obwohl Platz wäre. (Beispiel: k=88 → h2=8, der Schlüssel springt immer um 8 und
            erreicht nur 2 Zellen.)
          </InfoBox>
        </Section>

        {/* 3. AUFGABE 3 */}
        <Section kicker="3 · Aufgabe 3" title="Pfade im binären Suchbaum prüfen">
          <p style={{ lineHeight: 1.7, fontSize: 16, marginTop: 0 }}>
            Ein <strong>binärer Suchbaum (BST)</strong> hat die Eigenschaft: links von einem Knoten stehen
            nur kleinere, rechts nur größere Werte. Sucht man darin ein Element, ist die Folge der
            besuchten Knoten ein <strong>Suchpfad</strong>. Frage: Kann eine gegebene Zahlenfolge überhaupt
            so ein Pfad sein?
          </p>

          <InfoBox title="Die Schlüsselidee: das Intervall schrumpft monoton">
            Jeder besuchte Knoten legt fest, wohin es weitergeht. Gehst du nach <em>links</em> (nächster
            Wert kleiner), darf ab jetzt nichts mehr ≥ dem aktuellen Wert kommen → Obergrenze sinkt. Gehst
            du nach <em>rechts</em>, steigt die Untergrenze. Verlässt ein Wert das erlaubte Intervall (lo,
            hi), ist der Pfad <strong>unmöglich</strong> — egal wie der Baum aussieht.
          </InfoBox>

          <BSTPathVis />

          <InfoBox title="Teil (b) — der Algorithmus, den du oben gerade gesehen hast">
            Die Lösung <em>ist</em> die Intervall-Methode aus der Visualisierung — schalte oben auf{" "}
            <strong>💻 Code</strong>, dann läuft der Pseudocode Zeile für Zeile mit der Animation mit.
            <div style={{ margin: "12px 0 4px", color: C.text, fontWeight: 600 }}>In Worten:</div>
            <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <div>
                <span style={{ color: C.accent2, fontWeight: 700 }}>1.</span> Starte mit dem größtmöglichen
                Intervall <code>(lo, hi) = (−∞, +∞)</code>.
              </div>
              <div>
                <span style={{ color: C.accent2, fontWeight: 700 }}>2.</span> Gehe die Folge{" "}
                <code>A[1..k]</code> <strong>einmal</strong> von vorne durch.
              </div>
              <div>
                <span style={{ color: C.accent2, fontWeight: 700 }}>3.</span> Liegt <code>A[i]</code> nicht
                im Intervall → <span style={{ color: C.warn }}>sofort „kein gültiger Pfad"</span>.
              </div>
              <div>
                <span style={{ color: C.accent2, fontWeight: 700 }}>4.</span> Sonst Intervall einengen:
                nächster Wert kleiner → <code>hi = A[i]</code>; größer → <code>lo = A[i]</code>.
              </div>
              <div>
                <span style={{ color: C.accent2, fontWeight: 700 }}>5.</span> Bis zum Ende durchgehalten →{" "}
                <span style={{ color: C.good }}>gültiger Pfad</span>.
              </div>
            </div>
            <strong>Warum Θ(k)?</strong> Die Schleife läuft über jeden der k Indizes{" "}
            <strong>genau einmal</strong>, und pro Durchlauf passiert nur konstant viel (ein Vergleich, eine
            Zuweisung) — also wächst die Laufzeit exakt linear mit der Länge k. Θ bedeutet hier: nicht nur
            höchstens (O), sondern auch mindestens (Ω) k Schritte, denn im gültigen Fall muss wirklich die
            ganze Folge geprüft werden.
          </InfoBox>
        </Section>

        {/* 4. AUFGABE 4 */}
        <Section kicker="4 · Aufgabe 4" title="BinarySearch — Vergleiche genau zählen">
          <p style={{ lineHeight: 1.7, fontSize: 16, marginTop: 0 }}>
            Die <strong>binäre Suche</strong> halbiert ein sortiertes Feld bei jedem Schritt: schaue in die
            Mitte, ist das gesuchte Element kleiner → links weiter, größer → rechts weiter. Der gegebene
            Algorithmus macht pro Aufruf <strong>zwei</strong> Vergleiche mit Feldelementen:{" "}
            <code>A[m] == k</code> und <code>A[m] &gt; k</code>.
          </p>

          <BinarySearchVis />

          <InfoBox title="Teil (a) — genaue Worst-Case-Vergleichszahl">
            Im schlimmsten Fall ist das Element nicht im Feld. Das Intervall wird bei n = 2ⁱ genau{" "}
            <strong>log₂(n) = i</strong> mal halbiert, bevor es leer ist. Jeder dieser Aufrufe kostet 2
            Vergleiche → insgesamt <span style={{ color: C.good }}>2·log₂(n)</span> Vergleiche.{" "}
            (log₂ = Logarithmus zur Basis 2: „wie oft kann ich n halbieren, bis 1 übrig ist".)
          </InfoBox>

          <InfoBox title="Teil (b) — BinarySearch2 mit nur ⌈log₂ n⌉+1 Vergleichen">
            Der Trick: <strong>nicht in der Schleife auf Gleichheit testen</strong>. Statt bei jedem Schritt{" "}
            <code>A[m]==k</code> <em>und</em> <code>A[m]&gt;k</code> zu prüfen (2 Vergleiche), grenzt man das
            Intervall mit nur <strong>einem</strong> Vergleich pro Schritt ein (<code>A[m] &lt; k</code> →
            rechts, sonst links). Erst <em>nach</em> dem Schrumpfen auf eine einzige Position macht man{" "}
            <strong>einen</strong> abschließenden Gleichheitstest. Da int-Variablen die Grenzen verwalten
            (kein zusätzlicher key-Vergleich), ergibt das ⌈log₂ n⌉ Schritte + 1 finalen Vergleich ={" "}
            <span style={{ color: C.good }}>⌈log₂ n⌉ + 1</span> Vergleiche. (⌈ ⌉ = Aufrunden auf die nächste
            ganze Zahl.)
          </InfoBox>
        </Section>

        {/* 5. ZUSATZ */}
        <Section kicker="5 · Knobel-Zusatz" title="Der tödliche Bocksbeutel (kurz)">
          <Card>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 16 }}>
              1000 Flaschen, eine vergiftet, das Gift wirkt nach einem Monat, nur{" "}
              <strong>10 Vorkoster</strong>, eine Probe pro Person. Lösung über{" "}
              <strong>Binärcodierung</strong>: Nummeriere die Flaschen 0–999 und schreibe jede Nummer als
              10-Bit-Binärzahl (2¹⁰ = 1024 ≥ 1000). Vorkoster <em>j</em> trinkt von <em>allen</em> Flaschen,
              deren <em>j</em>-tes Bit eine 1 ist. Nach einem Monat ergeben die toten Vorkoster (1) und
              überlebenden (0) zusammengesetzt genau die Binärnummer der vergifteten Flasche.
            </p>
            <p style={{ margin: "12px 0 0", color: C.dim, fontSize: 14, lineHeight: 1.6 }}>
              Dasselbe Prinzip wie bei der binären Suche: jeder Vorkoster halbiert die Menge der
              Verdächtigen → 10 Vorkoster unterscheiden 2¹⁰ = 1024 Möglichkeiten.
            </p>
          </Card>
        </Section>

        {/* ZUSAMMENFASSUNG */}
        <Section kicker="Auf einen Blick" title="Das Wichtigste in einem Bild">
          <Card style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}44` }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <strong style={{ color: C.accent }}>Aufgabe 1:</strong> Zwei Stapel → eine Schlange.
                Enqueue Θ(1), Dequeue Worst-Case Θ(n) (Umschütten), amortisiert Θ(1). Spiegelbildlich für
                Stapel aus zwei Schlangen.
              </div>
              <div>
                <strong style={{ color: C.accent2 }}>Aufgabe 2:</strong> Vier Kollisionsverfahren.
                Erfolglose Tests: linear 8, quadratisch 12, doppelt 4. Doppeltes Hashing scheitert, wenn
                h2(k) nicht teilerfremd zu 16 ist.
              </div>
              <div>
                <strong style={{ color: C.gold }}>Aufgabe 3:</strong> Suchpfad gültig ⇔ jeder Wert liegt im
                schrumpfenden Intervall (lo, hi). A1 und A2 gültig, A3 ungültig (299 verletzt das
                Intervall). Algorithmus: ein Durchlauf, Θ(k).
              </div>
              <div>
                <strong style={{ color: C.good }}>Aufgabe 4:</strong> Gegebener Algorithmus: 2·log₂(n)
                Vergleiche im Worst Case. Bessere Variante: nur ⌈log₂ n⌉+1, indem der Gleichheitstest erst
                am Ende erfolgt.
              </div>
            </div>
          </Card>
        </Section>

        {/* GLOSSAR */}
        <Section kicker="Glossar" title="Alle Begriffe & Symbole kompakt">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <GlossEntry term="FIFO" def="First In, First Out — Warteschlange: ältestes Element zuerst raus." />
            <GlossEntry term="LIFO" def="Last In, First Out — Stapel: zuletzt abgelegtes Element zuerst raus." />
            <GlossEntry term="Enqueue / Dequeue" def="Einreihen / Entnehmen bei einer Schlange." />
            <GlossEntry term="Push / Pop / Top" def="Auflegen / Abnehmen / Oberstes ansehen bei einem Stapel." />
            <GlossEntry term="Hashtabelle T[0..15]" def="Feld der Größe 16, in dem Schlüssel über eine Hashfunktion abgelegt werden." />
            <GlossEntry term="Hashfunktion h(k)" def="Bildet einen Schlüssel k auf einen Tabellenindex ab. Hier h0(k)=(3k+7) mod 16." />
            <GlossEntry term="mod (Modulo)" def="Rest bei der ganzzahligen Division. mod 16 liefert immer 0..15." />
            <GlossEntry term="Kollision" def="Zwei verschiedene Schlüssel landen auf derselben Zelle." />
            <GlossEntry term="Verkettung" def="Kollisionen werden in einer verketteten Liste pro Zelle gesammelt." />
            <GlossEntry term="Sondieren (Probing)" def="Systematisches Suchen einer Ersatzzelle bei Kollision." />
            <GlossEntry term="Sondierungsversuch i" def="Zähler der Ersatzsuche, beginnt bei 0." />
            <GlossEntry term="Teilerfremd" def="Zwei Zahlen ohne gemeinsamen Teiler > 1; nötig, damit doppeltes Hashing alle Zellen erreicht." />
            <GlossEntry term="BST (binärer Suchbaum)" def="Baum mit: links kleiner, rechts größer als der Knoten." />
            <GlossEntry term="Suchpfad" def="Folge der bei einer Suche besuchten Knoten von der Wurzel abwärts." />
            <GlossEntry term="Intervall (lo, hi)" def="Erlaubter Wertebereich für den nächsten Knoten im Suchpfad." />
            <GlossEntry term="BinarySearch" def="Suche in sortiertem Feld durch wiederholtes Halbieren." />
            <GlossEntry term="log₂(n)" def="Logarithmus zur Basis 2: wie oft man n halbieren kann, bis 1 übrig bleibt." />
            <GlossEntry term="⌈x⌉ (Aufrunden)" def="Kleinste ganze Zahl ≥ x (ceiling)." />
            <GlossEntry term="Θ (Theta)" def="Asymptotisch scharfe Schranke — Laufzeit wächst genau in dieser Größenordnung." />
            <GlossEntry term="Worst Case" def="Schlimmstmöglicher Fall einer Eingabe (z. B. Element nicht vorhanden)." />
            <GlossEntry term="Amortisiert" def="Über viele Operationen gemittelte Kosten, auch wenn einzelne teuer sind." />
          </div>
        </Section>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "28px 24px 48px",
          textAlign: "center",
          color: C.dim,
          fontSize: 13,
        }}
      >
        Übung 07 · Theoretische Informatik · Datenstrukturen, Hashing & Suchen
        <br />
        Prof. Dr. Veronika Lesch · DHBW Mosbach
      </footer>
    </div>
  );
}