import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Sanftes Scrollen zu einer Sektion per id (mit scrollMarginTop-Offset der Sektion).
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===================================================================
//  Analysis Klausurtrainer (Gesamt-Trainer)
//  Prof. Dr. Veronika Lesch, DHBW Mosbach
//  INF23 Haupt-/Nachklausur + INF24 Hauptklausur
//  Alle Aufgabentypen, jeweils an einer echten Klausuraufgabe
//  Schritt für Schritt durchgerechnet.
// ===================================================================

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#3b82f6",   // Marineblau - primär: Methode/aktiver Lösungsschritt
  accent2: "#22d3ee",  // Cyan - sekundär: Konzept-Einschübe, Varianten
  good: "#86efac",     // grün - korrektes Zwischenergebnis / Endergebnis
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

function Section({ id, kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        transition: "opacity .6s ease, transform .6s ease",
        marginBottom: 64,
        scrollMarginTop: 70, // Offset fuer die sticky Galerie-Kopfzeile
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

// Frac: echter Bruch (Zähler über Nenner mit Trennstrich).
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

// LösungsStepper - das Herzstück: animierter Schritt-für-Schritt-Löser.
function LösungsStepper({ aufgabe, quelle, blatt, nr, punkte, schritte }) {
  const [i, setI] = useState(1);          // Anzahl der eingeblendeten Schritte
  const [playing, setPlaying] = useState(false);
  const [openUeb, setOpenUeb] = useState({}); // pro Schritt: ist die "Selbst rechnen"-Uebung offen?
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
      {/* Herkunfts-Band: welche Klausur + welche Aufgabe (Farbcode pro Klausur) */}
      {blatt ? <AufgabenHeader blatt={blatt} aufgabe={nr} punkte={punkte} /> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        {!blatt && quelle ? <Tag color={C.accent2}>{quelle}</Tag> : <span />}
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
              {s.uebung && visible && (
                <div style={{ marginTop: 10, paddingLeft: 30 }}>
                  <button
                    onClick={() => setOpenUeb((o) => ({ ...o, [idx]: !o[idx] }))}
                    style={{ ...btnGhost, padding: "5px 12px", fontSize: 12.5, borderColor: `${C.accent}66`, color: C.accent }}
                  >
                    {openUeb[idx] ? "▾ Übung schließen" : "✎ Selbst rechnen"}
                  </button>
                  {openUeb[idx] && <StepUebung {...s.uebung} />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Steuerung */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
        <button style={btnGhost} onClick={() => setI((v) => Math.max(1, v - 1))} aria-label="Schritt zurück">|◀</button>
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

// kleine Hilfs-Card für "Typische Falle"
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

// Varianten-Zeile - jedes Tag traegt das farbcodierte Klausur-Kuerzel als Praefix.
function Varianten({ items }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
        Gleicher Typ, andere Zahlen (Varianten aus den anderen Klausuren):
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
        {items.map((it, k) => {
          const ex = it.k ? EXAMS[it.k] : null;
          return (
            <span key={k} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 13, color: C.text, background: C.panel2, border: `1px solid ${C.line}`,
              borderRadius: 999, padding: "5px 12px", fontFamily: "ui-monospace, monospace",
            }}>
              {ex ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: ex.color, flexShrink: 0 }} />
                  <span style={{ color: ex.color, fontWeight: 700 }}>{ex.kurz}</span>
                </span>
              ) : (
                <span style={{ color: C.accent2 }}>{it.q}</span>
              )}
              <span>{it.t}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ===================================================================
//  KLAUSUR-FARBCODE (Herkunft jeder Aufgabe auf einen Blick)
// ===================================================================
const EXAMS = {
  hk23: { color: C.accent,  kurz: "HK23", voll: "Hauptklausur INF23" },   // Marineblau
  nk23: { color: C.accent2, kurz: "NK23", voll: "Nachklausur INF23" },    // Cyan
  hk24: { color: C.gold,    kurz: "HK24", voll: "Hauptklausur INF24" },   // Gold
};

// AufgabenHeader: deutlich sichtbares Band oben in jedem Stepper.
function AufgabenHeader({ blatt, aufgabe, punkte }) {
  const ex = EXAMS[blatt] || EXAMS.hk23;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap",
      borderLeft: `4px solid ${ex.color}`, background: `${ex.color}16`,
      borderRadius: "0 10px 10px 0", padding: "10px 14px", marginBottom: 14,
    }}>
      <span aria-hidden style={{ fontSize: 17 }}>📄</span>
      <span style={{ fontWeight: 800, color: ex.color, fontSize: 14.5 }}>{ex.voll}</span>
      <span style={{ color: C.dim }}>·</span>
      <span style={{ fontWeight: 700, color: C.text, fontSize: 14.5 }}>{aufgabe}</span>
      {punkte != null && (
        <span style={{
          marginLeft: "auto", fontSize: 12, fontWeight: 800, color: ex.color,
          background: `${ex.color}22`, border: `1px solid ${ex.color}55`,
          borderRadius: 999, padding: "3px 10px",
        }}>
          {punkte} {punkte === 1 ? "Punkt" : "Punkte"}
        </span>
      )}
    </div>
  );
}

// Legende fuer die Uebersicht: welche Farbe = welche Klausur.
function KlausurLegende() {
  return (
    <Card style={{ marginTop: 14, background: C.panel2 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.dim, marginBottom: 10 }}>
        Farbcode der Klausuren - so erkennst du bei jeder Aufgabe sofort die Herkunft:
      </div>
      <div style={{ display: "flex", gap: "10px 20px", flexWrap: "wrap" }}>
        {Object.values(EXAMS).map((ex) => (
          <span key={ex.kurz} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.text }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: ex.color }} />
            <b style={{ color: ex.color }}>{ex.kurz}</b>
            <span style={{ color: C.dim }}>= {ex.voll}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

// ===================================================================
//  GRUNDLAGEN - "als ob man nichts weiss" (von Null erklaert)
// ===================================================================
function Grundlagen({ titel, children }) {
  return (
    <Card style={{ background: C.panel2, borderColor: C.line, margin: "0 0 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
        <span aria-hidden style={{ fontSize: 22 }}>📘</span>
        <div>
          <div style={{ fontSize: 11.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.dim, fontWeight: 800 }}>Ganz von vorn</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{titel}</div>
        </div>
      </div>
      <div style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.75 }}>{children}</div>
    </Card>
  );
}

// kleine Bausteine fuer Grundlagen-Bloecke
function Vokabel({ w, children }) {
  return (
    <div style={{ display: "flex", gap: 10, margin: "7px 0", alignItems: "baseline" }}>
      <span style={{ fontFamily: "ui-monospace, monospace", color: C.accent2, fontWeight: 700, minWidth: 76, flexShrink: 0 }}>{w}</span>
      <span style={{ flex: 1, color: C.dim }}>{children}</span>
    </div>
  );
}
function MiniBeispiel({ children }) {
  return (
    <div style={{ marginTop: 14, background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.good, letterSpacing: 1, textTransform: "uppercase", marginBottom: 7 }}>
        ✏️ Mini-Beispiel von Hand
      </div>
      <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

// ===================================================================
//  LOESUNGSERKLAERUNG - geteilt von QuizMC und StepUebung
// ===================================================================
function LoesungsErklaerung({ schritte }) {
  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: 1, textTransform: "uppercase" }}>
        Schritt für Schritt
      </div>
      {schritte.map((s, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, alignItems: "flex-start",
          background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 6,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: C.line, color: C.dim, flexShrink: 0,
          }}>{i + 1}</span>
          <div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 14.5, color: C.text, lineHeight: 1.6 }}>{s.formel}</div>
            {s.warum && <div style={{ fontSize: 13, color: C.dim, marginTop: 4, lineHeight: 1.55 }}>{s.warum}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===================================================================
//  QUIZ-MC - schneller Verstaendnis-Check mit Sofort-Feedback
// ===================================================================
function QuizMC({ frage, optionen, richtigIndex, loesung }) {
  const [sel, setSel] = useState(null);
  const beantwortet = sel !== null;
  const richtig = sel === richtigIndex;
  return (
    <Card style={{ marginTop: 18, background: C.panel2 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.accent2, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
        Quiz · Verständnis-Check
      </div>
      <div style={{ fontSize: 15.5, color: C.text, fontWeight: 600, lineHeight: 1.6, marginBottom: 14 }}>{frage}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {optionen.map((opt, idx) => {
          let bc = C.line, bg = C.panel, col = C.text;
          if (beantwortet) {
            if (idx === richtigIndex) { bc = C.good; bg = `${C.good}16`; col = C.good; }
            else if (idx === sel) { bc = C.warn; bg = `${C.warn}16`; col = C.warn; }
          }
          return (
            <button key={idx} disabled={beantwortet} onClick={() => setSel(idx)}
              style={{
                textAlign: "left", background: bg, border: `1px solid ${bc}`, color: col,
                borderRadius: 10, padding: "10px 14px", fontSize: 14.5, fontFamily: "inherit",
                cursor: beantwortet ? "default" : "pointer", transition: "background .25s ease, border-color .25s ease, color .25s ease",
                display: "flex", alignItems: "center", gap: 10,
              }}>
              <span style={{ fontWeight: 800, opacity: 0.75 }}>{String.fromCharCode(65 + idx)}</span>
              <span style={{ flex: 1 }}>{opt}</span>
              {beantwortet && idx === richtigIndex && <span>✓</span>}
              {beantwortet && idx === sel && idx !== richtigIndex && <span>✗</span>}
            </button>
          );
        })}
      </div>
      {beantwortet && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: richtig ? C.good : C.warn }}>
            {richtig ? "✓ Richtig!" : "Nicht ganz - so kommt man drauf:"}
          </div>
          {!richtig && loesung && <LoesungsErklaerung schritte={loesung} />}
          <button style={{ ...btnGhost, marginTop: 12, padding: "6px 12px", fontSize: 13 }} onClick={() => setSel(null)}>
            ↺ Nochmal
          </button>
        </div>
      )}
    </Card>
  );
}

// ===================================================================
//  STEP-UEBUNG - "selbst rechnen" an einem einzelnen Loesungsschritt
// ===================================================================
function normAnswer(s) {
  return String(s).toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/\*/g, "")
    .replace(/·/g, "")
    .replace(/\^/g, "");
}
function StepUebung({ frage, akzeptiert = [], zahl = null, toleranz = 1e-6, loesung, erklaerung }) {
  const [val, setVal] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "no"
  const [zeigen, setZeigen] = useState(false);
  const pruefe = () => {
    const v = val.trim();
    if (!v) return;
    let ok = false;
    if (zahl !== null) {
      const num = parseFloat(v.replace(",", "."));
      if (!Number.isNaN(num) && Math.abs(num - zahl) <= toleranz) ok = true;
    }
    if (!ok) {
      const n = normAnswer(v);
      ok = akzeptiert.some((a) => normAnswer(a) === n);
    }
    setStatus(ok ? "ok" : "no");
  };
  const borderCol = status === "ok" ? C.good : status === "no" ? C.warn : C.line;
  return (
    <div style={{ marginTop: 10, background: `${C.accent}0c`, border: `1px solid ${C.accent}33`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        ✎ Selbst rechnen - gleiches Prinzip, andere Zahlen
      </div>
      <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.65, marginBottom: 10 }}>{frage}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={val}
          onChange={(e) => { setVal(e.target.value); setStatus(null); }}
          onKeyDown={(e) => { if (e.key === "Enter") pruefe(); }}
          placeholder="deine Antwort"
          aria-label="Antwort eingeben"
          style={{
            flex: "1 1 160px", minWidth: 120, background: C.panel, border: `1px solid ${borderCol}`,
            color: C.text, borderRadius: 8, padding: "8px 12px", fontSize: 14.5, fontFamily: "ui-monospace, monospace",
          }}
        />
        <button style={btn} onClick={pruefe}>Prüfen</button>
        <button style={btnGhost} onClick={() => setZeigen((z) => !z)}>Lösung zeigen</button>
      </div>
      {status === "ok" && (
        <div style={{ marginTop: 10, color: C.good, fontWeight: 700, fontSize: 14 }}>✓ Richtig - gut gerechnet!</div>
      )}
      {status === "no" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: C.warn, fontWeight: 700, fontSize: 14 }}>Noch nicht - schau dir die Schritte an:</div>
          {erklaerung && <LoesungsErklaerung schritte={erklaerung} />}
        </div>
      )}
      {zeigen && (
        <div style={{ marginTop: 10, fontSize: 14, color: C.good, fontFamily: "ui-monospace, monospace" }}>
          Lösung: {loesung}
        </div>
      )}
    </div>
  );
}

// ===================================================================
//  GRAPH - reiner SVG-Plotter (keine Libs)
// ===================================================================
const GPAD = 30;
const gScaleX = (xmin, xmax, W) => (x) => GPAD + ((x - xmin) / (xmax - xmin)) * (W - 2 * GPAD);
const gScaleY = (ymin, ymax, H) => (y) => H - GPAD - ((y - ymin) / (ymax - ymin)) * (H - 2 * GPAD);

function niceStep(min, max) {
  const raw = (max - min) / 6;
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / pow;
  let s;
  if (r < 1.5) s = 1; else if (r < 3) s = 2; else if (r < 7) s = 5; else s = 10;
  return s * pow;
}
function fmtTick(v) {
  const r = Math.round(v * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString();
}
// Dichtes Sampling, das Pole/Definitionsluecken in getrennte Segmente bricht.
function buildSegments(f, xmin, xmax, ymin, ymax, sx, sy, n) {
  const segs = [];
  let cur = [];
  let prev = null;
  const span = ymax - ymin;
  for (let i = 0; i <= n; i++) {
    const x = xmin + (i / n) * (xmax - xmin);
    let y;
    try { y = f(x); } catch (e) { y = NaN; }
    if (!isFinite(y) || Number.isNaN(y) || y > ymax + span * 4 || y < ymin - span * 4) {
      if (cur.length > 1) segs.push(cur);
      cur = []; prev = null; continue;
    }
    if (prev !== null && Math.abs(y - prev) > span * 1.2) {
      if (cur.length > 1) segs.push(cur);
      cur = [];
    }
    const yc = Math.max(ymin - span, Math.min(ymax + span, y));
    cur.push([+sx(x).toFixed(1), +sy(yc).toFixed(1)]);
    prev = y;
  }
  if (cur.length > 1) segs.push(cur);
  return segs;
}

function Graph({
  fns = [], xRange = [-5, 5], yRange = [-3, 3], marks = [], fill = null,
  width = 380, height = 250, samples = 280, legende = true,
  onMouseMove, onMouseLeave, overlay,
}) {
  const [xmin, xmax] = xRange;
  const [ymin, ymax] = yRange;
  const W = width, H = height;
  const sx = gScaleX(xmin, xmax, W);
  const sy = gScaleY(ymin, ymax, H);

  const xstep = niceStep(xmin, xmax);
  const ystep = niceStep(ymin, ymax);
  const xticks = [], yticks = [];
  for (let x = Math.ceil(xmin / xstep) * xstep; x <= xmax + 1e-9; x += xstep) xticks.push(+x.toFixed(6));
  for (let y = Math.ceil(ymin / ystep) * ystep; y <= ymax + 1e-9; y += ystep) yticks.push(+y.toFixed(6));
  const y0in = 0 >= ymin && 0 <= ymax;
  const x0in = 0 >= xmin && 0 <= xmax;

  let fillEl = null;
  if (fill && fill.f) {
    const fcol = fill.color || C.accent;
    const n = 120;
    const base = sy(Math.max(ymin, Math.min(ymax, 0)));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = fill.from + (i / n) * (fill.to - fill.from);
      let y = fill.f(x);
      if (!isFinite(y)) y = ymax;
      y = Math.max(ymin, Math.min(ymax, y));
      pts.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
    }
    fillEl = (
      <path d={`M${sx(fill.from).toFixed(1)},${base.toFixed(1)} L${pts.join(" L")} L${sx(fill.to).toFixed(1)},${base.toFixed(1)} Z`}
        fill={`${fcol}33`} stroke={fcol} strokeWidth="1.2" />
    );
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        style={{ width: "100%", background: C.panel2, borderRadius: 12, border: `1px solid ${C.line}`, display: "block", touchAction: "none" }}>
        {xticks.map((x, i) => (
          <line key={"gx" + i} x1={sx(x)} y1={GPAD} x2={sx(x)} y2={H - GPAD} stroke={C.line} strokeWidth="1" opacity="0.45" />
        ))}
        {yticks.map((y, i) => (
          <line key={"gy" + i} x1={GPAD} y1={sy(y)} x2={W - GPAD} y2={sy(y)} stroke={C.line} strokeWidth="1" opacity="0.45" />
        ))}
        {y0in && <line x1={GPAD} y1={sy(0)} x2={W - GPAD} y2={sy(0)} stroke={C.dim} strokeWidth="1.4" />}
        {x0in && <line x1={sx(0)} y1={GPAD} x2={sx(0)} y2={H - GPAD} stroke={C.dim} strokeWidth="1.4" />}
        {xticks.map((x, i) => (Math.abs(x) < 1e-9 ? null : (
          <text key={"tx" + i} x={sx(x)} y={(y0in ? sy(0) : H - GPAD) + 14} fill={C.dim} fontSize="10" textAnchor="middle" fontFamily="ui-monospace">{fmtTick(x)}</text>
        )))}
        {yticks.map((y, i) => (Math.abs(y) < 1e-9 ? null : (
          <text key={"ty" + i} x={(x0in ? sx(0) : GPAD) - 5} y={sy(y) + 3} fill={C.dim} fontSize="10" textAnchor="end" fontFamily="ui-monospace">{fmtTick(y)}</text>
        )))}
        {fillEl}
        {fns.map((fn, i) => {
          const segs = buildSegments(fn.f, xmin, xmax, ymin, ymax, sx, sy, samples);
          return segs.map((seg, j) => (
            <polyline key={"c" + i + "_" + j} points={seg.map((p) => p.join(",")).join(" ")}
              fill="none" stroke={fn.color || C.accent} strokeWidth={fn.width || 2.4}
              strokeDasharray={fn.dash || "none"} strokeLinejoin="round" strokeLinecap="round" />
          ));
        })}
        {marks.map((m, i) => (
          <g key={"m" + i}>
            <circle cx={sx(m.x)} cy={sy(m.y)} r={m.r || 4}
              fill={m.hollow ? C.panel2 : (m.color || C.gold)} stroke={m.color || C.gold} strokeWidth="2" />
            {m.label && <text x={sx(m.x) + 8} y={sy(m.y) - 6} fill={m.color || C.gold} fontSize="11" fontFamily="ui-monospace">{m.label}</text>}
          </g>
        ))}
        {overlay}
      </svg>
      {legende && fns.some((f) => f.label) && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
          {fns.filter((f) => f.label).map((f, i) => <Tag key={i} color={f.color || C.accent}>{f.label}</Tag>)}
        </div>
      )}
    </div>
  );
}

// ===================================================================
//  GRAPH-INTERAKTIV - Slider + Hover, aufgesetzt auf Graph
// ===================================================================
function GraphInteraktiv({ slider, build, xRange, yRange, width = 380, height = 250, hinweis }) {
  const [t, setT] = useState(slider ? slider.init : 0);
  const [hover, setHover] = useState(null);
  const cfg = build(t) || {};
  const fns = cfg.fns || [];
  const [xmin, xmax] = xRange;
  const [ymin, ymax] = yRange;
  const W = width, H = height;
  const sx = gScaleX(xmin, xmax, W);
  const sy = gScaleY(ymin, ymax, H);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const x = xmin + ((px - GPAD) / (W - 2 * GPAD)) * (xmax - xmin);
    if (x < xmin || x > xmax || !fns[0]) { setHover(null); return; }
    let y; try { y = fns[0].f(x); } catch (e2) { y = NaN; }
    if (!isFinite(y)) { setHover(null); return; }
    setHover({ x, y });
  };

  const overlay = hover ? (
    <g>
      <line x1={sx(hover.x)} y1={GPAD} x2={sx(hover.x)} y2={H - GPAD} stroke={`${C.gold}99`} strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={sx(hover.x)} cy={sy(Math.max(ymin, Math.min(ymax, hover.y)))} r="4.5" fill={C.gold} />
      <rect x={Math.min(sx(hover.x) + 8, W - 94)} y={GPAD + 4} width="86" height="34" rx="6" fill={C.panel} stroke={C.line} />
      <text x={Math.min(sx(hover.x) + 14, W - 88)} y={GPAD + 18} fill={C.dim} fontSize="10" fontFamily="ui-monospace">x = {hover.x.toFixed(2)}</text>
      <text x={Math.min(sx(hover.x) + 14, W - 88)} y={GPAD + 31} fill={C.gold} fontSize="10" fontFamily="ui-monospace">y = {hover.y.toFixed(2)}</text>
    </g>
  ) : null;

  return (
    <Card>
      <Graph fns={fns} xRange={xRange} yRange={yRange} marks={cfg.marks || []} fill={cfg.fill || null}
        width={width} height={height} onMouseMove={onMove} onMouseLeave={() => setHover(null)} overlay={overlay} />
      {slider && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.dim, marginBottom: 6 }}>
            <span>{slider.label}</span>
            <span style={{ color: C.gold, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
              {slider.fmt ? slider.fmt(t) : t}
            </span>
          </div>
          <input type="range" min={slider.min} max={slider.max} step={slider.step} value={t}
            onChange={(e) => setT(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: C.gold }} aria-label={slider.label} />
        </div>
      )}
      {cfg.readout && (
        <div style={{ marginTop: 12, fontSize: 14, color: C.text, fontFamily: "ui-monospace, monospace",
          background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 12px" }}>
          {cfg.readout}
        </div>
      )}
      {hinweis && <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{hinweis}</div>}
    </Card>
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
      desc: "Linker und rechter Grenzwert existieren und sind gleich - nur der Funktionswert an der Stelle fehlt (Loch). Man könnte die Lücke 'stopfen'.",
    },
    {
      name: "Sprungstelle",
      color: C.gold,
      desc: "Linker und rechter Grenzwert existieren, sind aber verschieden. Der Graph 'springt' - genau der Fall der NK-Aufgabe (x² für x<0, x+1 sonst).",
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
      // Sprung: linker Ast endet unten, rechter beginnt höher
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
      verdict: "divergiert (wächst unbegrenzt, nur sehr langsam)",
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
        Beobachte: Bei der geometrischen Reihe nähern sich die Balken einer festen Höhe (dem Grenzwert) -
        bei der harmonischen Reihe wächst die Summe immer weiter, nur gebremst. Genau das ist der Unterschied
        zwischen <b style={{ color: C.good }}>Konvergenz</b> und <b style={{ color: C.warn }}>Divergenz</b>.
      </div>
    </Card>
  );
}

// ===================================================================
//  SektionsNavigation - anklickbares Inhaltsverzeichnis mit Scroll-Spy
// ===================================================================
const NAV = [
  { id: "ueberblick", label: "Überblick" },
  { id: "t1", label: "1 · Unstetigkeit" },
  { id: "t2", label: "2 · Folgen-Grenzwerte" },
  { id: "t3", label: "3 · Reihen" },
  { id: "t4", label: "4 · Verkettung" },
  { id: "t5", label: "5 · Grenzwert-Beweis" },
  { id: "t6", label: "6 · Ableitungen" },
  { id: "t7", label: "7 · L'Hospital" },
  { id: "t8", label: "8 · Taylorreihe" },
  { id: "t9", label: "9 · Integrale" },
  { id: "t10", label: "10 · Uneigentl. Integral" },
  { id: "t11", label: "11 · Partialbruchzerlegung" },
  { id: "t12", label: "12 · Bonus (INF24)" },
  { id: "strategie", label: "Prüfungsstrategie" },
  { id: "zusammenfassung", label: "Zusammenfassung" },
  { id: "glossar", label: "Glossar" },
];

function SectionNav() {
  // Breite Viewports: Panel standardmaessig offen. Schmale: als Button.
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1180px)").matches
  );
  const [open, setOpen] = useState(wide);
  const [active, setActive] = useState(NAV[0].id);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1180px)");
    const onChange = (e) => { setWide(e.matches); setOpen(e.matches); };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Scroll-Spy: welche Sektion ist gerade oben im Bild?
  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-70px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goTo = (id) => {
    scrollToId(id);
    setActive(id);
    if (!wide) setOpen(false); // auf schmalen Screens nach Auswahl schliessen
  };

  // Eingeklappt: schlanker vertikaler Tab am rechten Rand.
  // Per Portal direkt an <body> gehaengt - so ist die fixe Positionierung
  // immer relativ zum Viewport (kein transformierter Vorfahre als Containing-Block).
  if (!open) {
    return createPortal(
      <button
        onClick={() => setOpen(true)}
        aria-label="Sektionen anzeigen"
        style={{
          position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
          zIndex: 9000, display: "flex", alignItems: "center", gap: 8,
          background: C.panel2, color: C.text, border: `1px solid ${C.line}`,
          borderRight: "none", borderRadius: "12px 0 0 12px", padding: "12px 10px",
          cursor: "pointer", writingMode: "vertical-rl", fontWeight: 700, fontSize: 13,
          letterSpacing: 1, boxShadow: "0 8px 30px rgba(0,0,0,.35)",
        }}
      >
        <span aria-hidden style={{ writingMode: "horizontal-tb", fontSize: 15 }}>☰</span>
        Sektionen
      </button>,
      document.body
    );
  }

  return createPortal(
    <nav
      aria-label="Sektionen"
      style={{
        position: "fixed", right: 14, top: "50%", transform: "translateY(-50%)",
        zIndex: 9000, width: 232, maxHeight: "80vh", display: "flex", flexDirection: "column",
        background: `${C.panel}f2`, border: `1px solid ${C.line}`, borderRadius: 14,
        boxShadow: "0 16px 50px rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderBottom: `1px solid ${C.line}`, flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent }}>
          Sektionen
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Sektionen schließen"
          style={{ background: "transparent", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}
        >
          ✕
        </button>
      </div>
      <div style={{ overflowY: "auto", padding: 6 }}>
        {NAV.map((n) => {
          const on = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => goTo(n.id)}
              aria-current={on ? "true" : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
                background: on ? `${C.gold}1c` : "transparent",
                border: "none", borderRadius: 9, cursor: "pointer",
                color: on ? C.gold : C.dim, fontWeight: on ? 700 : 500,
                fontSize: 13, padding: "8px 10px", lineHeight: 1.3,
                transition: "background .15s ease, color .15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = C.panel2; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: on ? C.gold : C.line,
                boxShadow: on ? `0 0 0 3px ${C.gold}33` : "none",
                transition: "background .15s ease, box-shadow .15s ease",
              }} />
              {n.label}
            </button>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}

// ===================================================================
//  HAUPT-KOMPONENTE
// ===================================================================
export default function AnalysisKlausurtrainer() {
  const rootRef = useRef(null);
  // Die SektionsNav haengt sich per Portal an <body>. In den (verkleinerten,
  // pointer-events:none) Galerie-Vorschaukacheln wuerde sie sonst sichtbar
  // an den echten Viewport gelangen - daher dort unterdruecken.
  const [isPreview, setIsPreview] = useState(true);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const preview = getComputedStyle(el).pointerEvents === "none";
    setIsPreview(preview);
  }, []);

  return (
    <div ref={rootRef} style={{
      background: `radial-gradient(1200px 600px at 75% -10%, ${C.accent}1c, transparent), radial-gradient(900px 500px at 8% 8%, ${C.accent2}12, transparent), ${C.bg}`,
      color: C.text, minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @keyframes popStep { 0%{transform:scale(.92);opacity:.4} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        input[type=range]{ height: 6px; border-radius: 4px; }
      `}</style>

      {!isPreview && <SectionNav />}

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
          Hier ist jeder davon an einer <b style={{ color: C.text }}>echten Klausuraufgabe</b> Schritt für Schritt gelöst -
          mit Begründung zu jedem Schritt. Wer das hier kann, löst jede der drei Klausuren.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>

        {/* 0 - Landkarte */}
        <Section id="ueberblick" kicker="Orientierung" title="Die Klausur auf einen Blick">
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
                <button key={nr} onClick={() => scrollToId("t" + nr)}
                  title={`Zu "${name}" springen`}
                  style={{
                    background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px",
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "border-color .15s ease, background .15s ease, transform .15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = col; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{
                    minWidth: 24, height: 24, borderRadius: 7, background: `${col}22`, color: col,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0,
                  }}>{nr}</span>
                  <span style={{ fontSize: 13.5, color: C.text }}>{name}</span>
                </button>
              ))}
            </div>
          </Card>
          <KlausurLegende />
          <InfoBox title="So liest du diesen Trainer">
            Jede Section folgt demselben Bogen: <b style={{ color: C.text }}>Grundlagen</b> (von Null erklärt, mit Mini-Beispiel) -&gt;
            <b style={{ color: C.text }}> Graph</b> (das Konzept sehen) -&gt; <b style={{ color: C.text }}>Methode</b> (Verfahren + Erkennungsmerkmal) -&gt;
            <b style={{ color: C.text }}> Lösungs-Stepper</b> (echte Aufgabe Schritt für Schritt, mit ▶ Auto-Play und ✎ "Selbst rechnen" an jedem Schritt) -&gt;
            <b style={{ color: C.text }}> Quiz</b> -&gt; <b style={{ color: C.text }}>typische Falle</b> -&gt; <b style={{ color: C.text }}>Varianten</b>.
            Im Stepper ist der <b style={{ color: C.gold }}>aktuelle Schritt gelb</b>, das <b style={{ color: C.good }}>Endergebnis grün</b>.
            Oben in jeder Aufgabe zeigt ein farbiges Band die <b style={{ color: C.text }}>Herkunft</b> (siehe Farbcode oben).
          </InfoBox>
        </Section>

        {/* ============ 1 - UNSTETIGKEIT ============ */}
        <Section id="t1" kicker="Aufgabentyp 1" title="Unstetigkeit - Arten erkennen und benennen">
          <Grundlagen titel="Was heißt 'stetig' überhaupt?">
            <b style={{ color: C.text }}>Worum geht es?</b> Stell dir vor, du zeichnest den Graphen einer Funktion mit
            dem Stift, ohne abzusetzen. Geht das an einer Stelle nicht - weil du springen, das Blatt verlassen oder
            unendlich schnell zittern müsstest - dann ist die Funktion dort <b style={{ color: C.warn }}>unstetig</b>.
            "Stetig" heißt also schlicht: <i>der Graph hängt an dieser Stelle zusammen.</i>
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="x₀">die Stelle, die du untersuchst (eine feste x-Position auf der waagerechten Achse).</Vokabel>
              <Vokabel w="lim">"Limes" / Grenzwert: der Wert, dem sich f(x) nähert, wenn x ganz nah an x₀ heranrückt - ohne x₀ selbst zu erreichen.</Vokabel>
              <Vokabel w="links">linksseitiger Grenzwert: du näherst dich x₀ von der kleineren Seite (x &lt; x₀). Schreibweise x → x₀⁻.</Vokabel>
              <Vokabel w="rechts">rechtsseitiger Grenzwert: du näherst dich von der größeren Seite (x &gt; x₀), also x → x₀⁺.</Vokabel>
              <Vokabel w="f(x₀)">der echte Funktionswert genau an der Stelle (falls er existiert).</Vokabel>
            </div>
            <div style={{ marginTop: 10 }}>
              Die Regel in einem Satz: <b style={{ color: C.good }}>linker Grenzwert = rechter Grenzwert = f(x₀)</b> →
              stetig. Stimmt eine dieser drei Größen nicht überein (oder fehlt), ist f unstetig.
            </div>
            <MiniBeispiel>
              f(x) = x + 1. Bei x₀ = 2: von links kommend nähert sich f der 3, von rechts ebenfalls der 3, und f(2) = 3.
              Alle drei gleich → <b style={{ color: C.good }}>stetig</b>. Jetzt ändere f bei x = 2 künstlich auf 10:
              die Grenzwerte sagen weiter 3, der Funktionswert ist aber 10 → ein einzelnes "Loch/Punkt" passt nicht →
              unstetig. Genau diese drei Vergleiche machst du in der Klausur.
            </MiniBeispiel>
          </Grundlagen>
          <p style={{ marginTop: 0 }}>
            Eine Funktion ist an einer Stelle x{"₀"} <b style={{ color: C.text }}>stetig</b> (durchgängig, ohne Sprung),
            wenn linker Grenzwert = rechter Grenzwert = Funktionswert. Ist das verletzt, liegt eine
            <b style={{ color: C.warn }}> Unstetigkeit</b> vor. Es gibt vier Arten - die du erkennen und benennen können musst:
          </p>
          <div style={{ marginBottom: 20 }}><VisUnstetigkeit /></div>

          {/* Graphen: Oszillation sin(1/x) real geplottet + Sprungfunktion mit Hover */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
                Oszillation: sin(1/x) nahe x₀ = 0 (HK-Aufgabe)
              </div>
              <Graph
                xRange={[-0.4, 0.4]} yRange={[-1.3, 1.3]} samples={900} height={230}
                fns={[{ f: (x) => Math.sin(1 / x), color: C.accent2, label: "sin(1/x)" }]}
              />
              <div style={{ fontSize: 12.5, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
                Je näher an 0, desto schneller schwingt der Graph zwischen -1 und +1 - er kommt nie zur Ruhe.
                Deshalb existiert kein Grenzwert.
              </div>
            </div>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
                Sprungstelle: x² (für x&lt;0) und x+1 (für x≥0) - fahre mit der Maus über x = 0
              </div>
              <GraphInteraktiv
                xRange={[-2, 2]} yRange={[-0.5, 3.2]} height={230}
                slider={null}
                build={() => ({
                  fns: [{ f: (x) => (x < 0 ? x * x : x + 1), color: C.gold, label: "f(x)" }],
                  marks: [
                    { x: 0, y: 1, color: C.gold, label: "rechts: 1" },
                    { x: 0, y: 0, color: C.gold, hollow: true, label: "links: 0" },
                  ],
                })}
                hinweis={<>Linker Grenzwert (x → 0⁻): x² → <b style={{ color: C.text }}>0</b>. Rechter Grenzwert (x → 0⁺): x+1 → <b style={{ color: C.text }}>1</b>. Beide existieren, sind aber verschieden → der Graph springt um 1.</>}
              />
            </div>
          </div>

          <LösungsStepper
            blatt="hk23" nr="Unstetigkeit a)"
            aufgabe={<>Untersuche f(x) = sin(<Frac num="1" den="x" />) an der Stelle x{"₀"} = 0 auf Stetigkeit.</>}
            schritte={[
              { formel: <>Was passiert mit dem Argument <Frac num="1" den="x" /> für x &rarr; 0 ?</>,
                warum: "Nähert sich x der 0, so wächst 1/x unbegrenzt (gegen +unendlich von rechts, -unendlich von links).",
                uebung: {
                  frage: <>Setze ein kleines x ein: Was ist <Frac num="1" den="x" /> für x = 0,001 ?</>,
                  zahl: 1000, toleranz: 0.5, akzeptiert: ["1000"],
                  loesung: "1/0,001 = 1000",
                  erklaerung: [
                    { formel: <>1 / 0,001 = 1000</>, warum: "Teilt man 1 durch eine sehr kleine Zahl, wird das Ergebnis sehr groß." },
                    { formel: <>x noch kleiner → Ergebnis noch größer → 1/x → ∞</>, warum: "Genau das passiert beim Argument von sin(1/x) nahe 0." },
                  ],
                } },
              { formel: <>sin(<Frac num="1" den="x" />) durchläuft dabei unendlich oft alle Werte zwischen -1 und +1.</>,
                warum: "Der Sinus ist periodisch. Je näher x an 0, desto schneller schwingt das Argument durch ganze Perioden." },
              { formel: <>&rArr; lim<sub>x&rarr;0</sub> sin(<Frac num="1" den="x" />) existiert NICHT.</>,
                warum: "Die Funktion nähert sich keinem festen Wert - sie oszilliert ohne Ruhe. Kein Grenzwert möglich." },
              { formel: <><b>Ergebnis: Oszillationsunstetigkeit</b> bei x{"₀"} = 0.</>,
                warum: "Da kein Grenzwert existiert, ist f dort unstetig - und zwar vom Typ Oszillation (nicht hebbar, kein Sprung, keine Polstelle)." },
            ]}
          />
          <QuizMC
            frage={<>sin(1/x) bleibt nahe 0 immer zwischen -1 und +1, läuft also NICHT gegen ±∞. Welche Unstetigkeitsart liegt bei x₀ = 0 vor?</>}
            optionen={["Polstelle", "Oszillation", "hebbare Unstetigkeit", "Sprungstelle"]}
            richtigIndex={1}
            loesung={[
              { formel: <>±∞? Nein - beschränkt zwischen -1 und 1.</>, warum: "Das schließt eine Polstelle aus (dort liefe f gegen ±∞)." },
              { formel: <>Ein fester Grenzwert? Nein - f schwingt unendlich oft.</>, warum: "Damit ist es weder hebbar noch ein Sprung (beide brauchen existierende einseitige Grenzwerte)." },
              { formel: <>⇒ Oszillationsunstetigkeit.</>, warum: "Beschränkt, aber ohne Grenzwert - das ist genau die Oszillation." },
            ]}
          />
          <QuizMC
            frage={<>Bei einer Sprungstelle gilt: linker und rechter Grenzwert ...</>}
            optionen={["... existieren beide, sind aber verschieden", "... sind beide gleich, nur f(x₀) fehlt", "... existieren gar nicht", "... sind beide ±∞"]}
            richtigIndex={0}
            loesung={[
              { formel: <>Sprung = zwei verschiedene endliche Höhen.</>, warum: "Links und rechts existieren je ein Grenzwert, aber sie stimmen nicht überein - der Graph springt." },
              { formel: <>Gleich + Loch = hebbar; ±∞ = Polstelle; keiner = Oszillation.</>, warum: "So grenzt man die vier Arten sauber ab." },
            ]}
          />
          <InfoBox title="Teil b) - 'Nenne eine weitere Art'">
            Fast jede Unstetigkeits-Aufgabe hat einen Teil b): nenne eine andere Unstetigkeitsart mit Beispiel.
            Sichere Antworten: <b style={{ color: C.text }}>hebbar</b> (z. B. <Frac num="sin x" den="x" /> bei 0, Grenzwert 1 existiert),
            <b style={{ color: C.text }}> Sprung</b> (stückweise Funktion), <b style={{ color: C.text }}>Polstelle</b> (<Frac num="1" den="x" /> bei 0).
          </InfoBox>
          <FalleCard>
            Oszillation mit Polstelle verwechseln. Bei der <b>Polstelle</b> läuft die Funktion gegen &plusmn;&infin; (ein klarer
            "Trend"); bei der <b>Oszillation</b> gibt es gar keinen Trend - sie pendelt beschränkt, aber unendlich oft.
            sin(1/x) bleibt zwischen -1 und 1, geht also NICHT gegen unendlich.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "stückweise x² (x<0) / x+1 → Sprung (links 0, rechts 1)" },
            { k: "hk24", t: "weitere Art benennen + Beispiel" },
          ]} />
        </Section>

        {/* ============ 2 - FOLGEN-GRENZWERTE ============ */}
        <Section id="t2" kicker="Aufgabentyp 2" title="Folgen-Grenzwerte (ohne L'Hospital)">
          <Grundlagen titel="Was ist eine Folge und ihr Grenzwert?">
            <b style={{ color: C.text }}>Worum geht es?</b> Eine <b style={{ color: C.text }}>Folge</b> ist einfach eine
            durchnummerierte Liste von Zahlen: a₁, a₂, a₃, ... Du setzt für n nacheinander 1, 2, 3, ... ein und bekommst
            jedes Mal eine Zahl. Die Frage "Grenzwert" bedeutet: <i>auf welchen Wert läuft diese Liste zu, wenn n immer
            größer wird (n → ∞)?</i> Analogie: ein Auto, das immer langsamer wird und sich einer Wand nähert, sie aber
            nie ganz berührt - die Wand ist der Grenzwert.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="aₙ">das n-te Folgenglied; n ist die Position (1, 2, 3, ...), aₙ der Wert dort.</Vokabel>
              <Vokabel w="n → ∞">"n wächst über alle Grenzen"; gemeint ist das Langzeitverhalten der Folge.</Vokabel>
              <Vokabel w="lim aₙ">der Grenzwert: die Zahl, der sich aₙ beliebig nahe annähert.</Vokabel>
              <Vokabel w="Leitkoeff.">der Vorfaktor der höchsten n-Potenz (z. B. bei 2n die 2).</Vokabel>
            </div>
            <div style={{ marginTop: 10 }}>
              <b style={{ color: C.good }}>Der eine Trick, den du brauchst:</b> <Frac num="1" den="n" /> → 0, wenn n groß wird
              (1/1000000 ist fast 0). Aber <Frac num="n" den="n" /> = 1 bleibt 1. Du teilst Zähler und Nenner durch die
              höchste n-Potenz; dann verschwinden alle "Konstante/n"-Teile und übrig bleibt das Verhältnis der Leitkoeffizienten.
            </div>
            <MiniBeispiel>
              aₙ = <Frac num="6n" den="2n" />. Hier ist die höchste Potenz n. Teile oben und unten durch n:
              <Frac num="6" den="2" /> = 3. Also lim aₙ = 3. (Probe: a₁ = 6/2 = 3, a₁₀ = 60/20 = 3 - hier sogar konstant.)
              Schon bist du mitten in der Methode.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              Folgenglieder aₙ = (2n+1)/(7n) als Punkte - schiebe n hoch und sieh, wie sie sich der Linie 2/7 nähern:
            </div>
            <GraphInteraktiv
              xRange={[0, 20]} yRange={[0, 0.7]} height={240}
              slider={{ min: 1, max: 20, step: 1, init: 4, label: "Anzahl der Folgenglieder n", fmt: (n) => `n = ${n}` }}
              build={(N) => ({
                fns: [{ f: () => 2 / 7, color: C.good, dash: "6 5", label: "Grenzwert 2/7 ≈ 0,286" }],
                marks: Array.from({ length: N }, (_, k) => {
                  const n = k + 1;
                  return { x: n, y: (2 * n + 1) / (7 * n), color: C.accent2, r: 4 };
                }),
                readout: (
                  <>a<sub>{N}</sub> = (2·{N}+1)/(7·{N}) = {((2 * N + 1) / (7 * N)).toFixed(4)}
                    {"  ·  "}Abstand zu 2/7: {Math.abs((2 * N + 1) / (7 * N) - 2 / 7).toFixed(4)}</>
                ),
              })}
              hinweis="Die Punkte fallen von oben (a₁ ≈ 0,43) immer dichter an die gestrichelte Linie heran - sie erreichen sie nie exakt, kommen ihr aber beliebig nahe. Das ist Konvergenz."
            />
          </div>

          <Card style={{ marginBottom: 18 }}>
            <MethodRow color={C.accent} name="Dominanten Term ausklammern / kürzen"
              formula="höchste Potenz von n kürzen"
              note="Bei Brüchen von Polynomen in n: durch die höchste vorkommende n-Potenz teilen. Alle Terme der Form (Konstante / n^k) gehen dann gegen 0. Uebrig bleibt das Verhältnis der Leitkoeffizienten." />
          </Card>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 2 a)"
            aufgabe={<>Bestimme den Grenzwert von a<sub>n</sub> = <Frac num={<>(n+1)&sup2; &minus; n&sup2;</>} den="7n" />.</>}
            schritte={[
              { formel: <>Zähler ausmultiplizieren: (n+1)&sup2; = n&sup2; + 2n + 1</>,
                warum: "Erste binomische Formel. So lassen sich die n²-Terme im Zähler gegeneinander kürzen.",
                uebung: {
                  frage: <>Multipliziere selbst aus: (n+3)&sup2; = ?</>,
                  akzeptiert: ["n²+6n+9", "n^2+6n+9", "n2+6n+9"],
                  loesung: "n² + 6n + 9",
                  erklaerung: [
                    { formel: <>(a+b)&sup2; = a&sup2; + 2ab + b&sup2;</>, warum: "Erste binomische Formel mit a = n, b = 3." },
                    { formel: <>= n&sup2; + 2·n·3 + 3&sup2; = n&sup2; + 6n + 9</>, warum: "2·n·3 = 6n und 3² = 9." },
                  ],
                } },
              { formel: <>n&sup2; + 2n + 1 &minus; n&sup2; = 2n + 1</>,
                warum: "Die n² heben sich auf - der Zähler vereinfacht sich zu einem linearen Ausdruck." },
              { formel: <>a<sub>n</sub> = <Frac num="2n + 1" den="7n" /> = <Frac num="2" den="7" /> + <Frac num="1" den="7n" /></>,
                warum: "Bruch term-weise aufteilen: 2n/(7n) = 2/7, und 1/(7n) bleibt.",
                uebung: {
                  frage: <>Kürze selbst: <Frac num="2n" den="7n" /> = ? (als Bruch, z. B. 2/7)</>,
                  zahl: 2 / 7, toleranz: 0.004, akzeptiert: ["2/7"],
                  loesung: "2/7",
                  erklaerung: [
                    { formel: <><Frac num="2n" den="7n" /> = <Frac num="2" den="7" /> · <Frac num="n" den="n" /></>, warum: "n/n = 1, das kürzt sich weg." },
                    { formel: <>= <Frac num="2" den="7" /> ≈ 0,2857</>, warum: "Der n-Anteil verschwindet vollständig - nur die Leitkoeffizienten bleiben." },
                  ],
                } },
              { formel: <>n &rarr; &infin;: <Frac num="1" den="7n" /> &rarr; 0</>,
                warum: "Eine Konstante geteilt durch ein wachsendes n strebt gegen 0 - das ist der entscheidende Standardgrenzwert." },
              { formel: <><b>lim<sub>n&rarr;&infin;</sub> a<sub>n</sub> = <Frac num="2" den="7" /></b></>,
                warum: "Es bleibt nur das Verhältnis der Leitkoeffizienten 2/7 übrig." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="hk23" nr="Aufgabe 2 b)"
              aufgabe={<>Bestimme den Grenzwert von a<sub>n</sub> = <Frac num={<>&minus;2n + 1</>} den="3 + 4n" />.</>}
              schritte={[
                { formel: <>Höchste Potenz ist n. Zähler und Nenner durch n teilen.</>,
                  warum: "Standardtrick bei Polynom-Brüchen: durch die größte n-Potenz kürzen.",
                  uebung: {
                    frage: <>Bestimme selbst: lim<sub>n→∞</sub> <Frac num={<>3n &minus; 1</>} den="6n + 2" /> = ? (z. B. 1/2)</>,
                    zahl: 0.5, toleranz: 0.004, akzeptiert: ["1/2", "0,5"],
                    loesung: "1/2",
                    erklaerung: [
                      { formel: <>Durch n teilen: <Frac num={<>3 &minus; 1/n</>} den={<>6 + 2/n</>} /></>, warum: "Höchste Potenz ist n." },
                      { formel: <>n → ∞: 1/n → 0, 2/n → 0</>, warum: "Alle Konstante-durch-n-Terme verschwinden." },
                      { formel: <>= <Frac num="3" den="6" /> = <Frac num="1" den="2" /></>, warum: "Verhältnis der Leitkoeffizienten 3/6 = 1/2." },
                    ],
                  } },
                { formel: <>a<sub>n</sub> = <Frac num={<>&minus;2 + <Frac num="1" den="n" /></>} den={<><Frac num="3" den="n" /> + 4</>} /></>,
                  warum: "Jeder Term einzeln durch n geteilt: -2n/n = -2, 1/n bleibt, 3/n und 4n/n = 4." },
                { formel: <>Für n &rarr; &infin;: <Frac num="1" den="n" /> &rarr; 0 und <Frac num="3" den="n" /> &rarr; 0</>,
                  warum: "Alle Konstanten-durch-n-Terme verschwinden im Grenzwert." },
                { formel: <><b>&rarr; <Frac num={<>&minus;2</>} den="4" /> = &minus;<Frac num="1" den="2" /></b></>,
                  warum: "Es bleibt das Verhältnis der Leitkoeffizienten -2/4 = -1/2." },
              ]}
            />
          </div>
          <QuizMC
            frage={<>Welche Aussage über die Folge a<sub>n</sub> = <Frac num="n" den="n" /> ist richtig?</>}
            optionen={["aₙ → 0, weil n/n klein wird", "aₙ = 1 für jedes n, also Grenzwert 1", "aₙ → ∞", "aₙ hat keinen Grenzwert"]}
            richtigIndex={1}
            loesung={[
              { formel: <><Frac num="n" den="n" /> = 1 für jedes n ≥ 1</>, warum: "n geteilt durch sich selbst ist immer 1 - unabhängig von n." },
              { formel: <>Verwechslungsgefahr: 1/n → 0, aber n/n = 1.</>, warum: "Genau das ist die typische Falle - die Leitkoeffizienten bleiben stehen, sie verschwinden nicht." },
            ]}
          />
          <QuizMC
            frage={<>Um lim<sub>n→∞</sub> <Frac num={<>&minus;2n + 1</>} den="3 + 4n" /> zu bestimmen: Wodurch teilst du Zähler und Nenner?</>}
            optionen={["durch n² (die höchste denkbare Potenz)", "durch n (die höchste tatsächlich vorkommende Potenz)", "durch 4 (den größten Koeffizienten)", "gar nicht, direkt n = ∞ einsetzen"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Höchste vorkommende Potenz: n¹ (oben und unten).</>, warum: "Man teilt immer durch die höchste tatsächlich auftretende n-Potenz, nicht durch eine größere." },
              { formel: <>Ergebnis: <Frac num={<>&minus;2</>} den="4" /> = &minus;<Frac num="1" den="2" /></>, warum: "1/n und 3/n gehen gegen 0, übrig bleibt -2/4." },
            ]}
          />
          <FalleCard>
            Nicht durch die falsche Potenz teilen. Es zählt die <b>höchste</b> vorkommende n-Potenz in der gesamten
            Bruchstruktur. Und: 1/n &rarr; 0, aber n/n = 1 (nicht 0!) - die Leitkoeffizienten bleiben stehen.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "(e⁻ⁿ + 0,5ⁿ)/7ⁿ ,  (−7n+9)/(9+10n)" },
            { k: "hk24", t: "cos(n)/(7n) → 0 ,  2025/n → 0" },
          ]} />
        </Section>

        {/* ============ 3 - REIHEN ============ */}
        <Section id="t3" kicker="Aufgabentyp 3" title="Reihen-Konvergenz - das richtige Kriterium wählen">
          <Grundlagen titel="Was ist eine Reihe - und wann 'konvergiert' sie?">
            <b style={{ color: C.text }}>Worum geht es?</b> Eine <b style={{ color: C.text }}>Reihe</b> ist eine Summe von
            unendlich vielen Zahlen: a₁ + a₂ + a₃ + ... Das klingt erst mal so, als müsste immer "unendlich" herauskommen -
            aber wenn die Summanden schnell genug klein werden, bleibt die Gesamtsumme bei einer <i>endlichen</i> Zahl stehen.
            Analogie: Du gehst die halbe Strecke zur Wand, dann die Hälfte des Rests, dann wieder die Hälfte ...
            du legst unendlich viele Schritte zurück, aber insgesamt nie mehr als die volle Strecke.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="Σ (Sigma)">"summiere auf"; Σ aₙ bedeutet a₁ + a₂ + a₃ + ...</Vokabel>
              <Vokabel w="Partialsumme">die Summe der ersten n Glieder, Sₙ = a₁ + ... + aₙ (eine endliche Zwischensumme).</Vokabel>
              <Vokabel w="konvergent">die Partialsummen Sₙ nähern sich einer festen, endlichen Zahl an → die Reihe hat einen Summenwert.</Vokabel>
              <Vokabel w="divergent">die Partialsummen wachsen unbegrenzt (oder pendeln) → kein endlicher Summenwert.</Vokabel>
              <Vokabel w="alternierend">die Vorzeichen wechseln ständig: + - + - ... (kommt von (-1)ⁿ).</Vokabel>
            </div>
            <div style={{ marginTop: 10 }}>
              <b style={{ color: C.warn }}>Die wichtigste Warnung:</b> Dass die einzelnen Glieder gegen 0 gehen, reicht
              NICHT für Konvergenz. Σ <Frac num="1" den="n" /> hat Glieder, die gegen 0 gehen - und divergiert trotzdem
              (harmonische Reihe). Du brauchst immer ein echtes Kriterium.
            </div>
            <MiniBeispiel>
              Σ (½)ⁿ ab n=1: die Partialsummen sind ½, ¾, ⅞, 15/16, ... - sie nähern sich der <b style={{ color: C.good }}>1</b>
              und überschreiten sie nie. Also konvergiert die Reihe gegen 1. (Formel geometrische Reihe ab n=1:
              <Frac num="q" den="1 − q" /> = <Frac num="0,5" den="0,5" /> = 1.) Genau diese Idee siehst du gleich im Balken-Player.
            </MiniBeispiel>
          </Grundlagen>
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent2} name="Leibniz-Kriterium" formula="alternierend + monoton fallende Nullfolge"
                note="Für Reihen mit Vorzeichenwechsel (-1)^n. Wenn die Beträge monoton gegen 0 fallen, konvergiert die Reihe." />
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
            blatt="hk23" nr="Aufgabe 3 a)"
            aufgabe={<>Konvergiert <>&#8721;</> <Frac num={<>(&minus;1)<sup>n</sup></>} den="2n &minus; 1" /> ?</>}
            schritte={[
              { formel: <>Vorzeichen (&minus;1)<sup>n</sup> wechselt &rArr; alternierende Reihe.</>,
                warum: "Bei Vorzeichenwechsel ist das Leibniz-Kriterium der natürliche Kandidat." },
              { formel: <>Betrag der Glieder: b<sub>n</sub> = <Frac num="1" den="2n &minus; 1" /></>,
                warum: "Leibniz prüft die Beträge ohne Vorzeichen - sie müssen zwei Bedingungen erfüllen." },
              { formel: <>b<sub>n</sub> ist monoton fallend (Nenner 2n&minus;1 wächst).</>,
                warum: "Größerer Nenner -> kleinerer Bruch. Bedingung 1 (monoton fallend) erfüllt." },
              { formel: <>b<sub>n</sub> &rarr; 0 für n &rarr; &infin;.</>,
                warum: "1/(2n-1) -> 0. Bedingung 2 (Nullfolge) erfüllt." },
              { formel: <><b>Beide Leibniz-Bedingungen erfüllt &rArr; die Reihe konvergiert.</b></>,
                warum: "Alternierend + monoton fallende Nullfolge ist genau das Leibniz-Kriterium." },
            ]}
          />
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 18 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <LösungsStepper
                blatt="hk23" nr="Aufgabe 3 b)"
                aufgabe={<><>&#8721;</> <Frac num="9" den="n" /> - konvergent?</>}
                schritte={[
                  { formel: <><>&#8721;</> <Frac num="9" den="n" /> = 9 &middot; <>&#8721;</> <Frac num="1" den="n" /></>,
                    warum: "Konstanten Faktor 9 vorziehen - ändert das Konvergenzverhalten nicht." },
                  { formel: <><>&#8721;</> <Frac num="1" den="n" /> ist die harmonische Reihe.</>,
                    warum: "Das berühmteste Beispiel einer divergenten Reihe trotz Nullfolge." },
                  { formel: <><b>&rArr; divergiert</b> (auch mal 9).</>,
                    warum: "Ein konstanter Faktor macht aus einer divergenten Reihe keine konvergente." },
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <LösungsStepper
                blatt="hk23" nr="Aufgabe 3 c)"
                aufgabe={<><>&#8721;</> (0,4)<sup>n</sup> - konvergent?</>}
                schritte={[
                  { formel: <>Form q<sup>n</sup> mit q = 0,4 &rArr; geometrische Reihe.</>,
                    warum: "Konstante hoch n erkennt man als geometrische Reihe." },
                  { formel: <>|q| = 0,4 &lt; 1</>,
                    warum: "Das Konvergenz-Kriterium der geometrischen Reihe ist erfüllt." },
                  { formel: <><b>&rArr; konvergiert</b>, Summe (ab n=1) = <Frac num="0,4" den="1 &minus; 0,4" /> = <Frac num="2" den="3" /></>,
                    warum: "Bei |q|<1 gibt es sogar einen geschlossenen Summenwert.",
                    uebung: {
                      frage: <>Berechne selbst die Summe von <>&#8721;</> (0,5)<sup>n</sup> ab n=1 mit <Frac num="q" den="1 &minus; q" />, q = 0,5.</>,
                      zahl: 1, toleranz: 0.001, akzeptiert: ["1"],
                      loesung: "1",
                      erklaerung: [
                        { formel: <><Frac num="q" den="1 &minus; q" /> = <Frac num="0,5" den="1 &minus; 0,5" /></>, warum: "Formel der geometrischen Reihe ab n=1 mit q = 0,5 einsetzen." },
                        { formel: <>= <Frac num="0,5" den="0,5" /> = 1</>, warum: "Zähler und Nenner sind gleich → Summe 1." },
                      ],
                    } },
                ]}
              />
            </div>
          </div>
          <QuizMC
            frage={<>Die Glieder von Σ <Frac num="1" den="n" /> gehen gegen 0. Konvergiert die Reihe deshalb?</>}
            optionen={["Ja - wenn die Glieder gegen 0 gehen, konvergiert die Reihe immer", "Nein - die harmonische Reihe divergiert trotzdem", "Nur wenn man bei n = 2 startet", "Das kann man nicht entscheiden"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Glieder → 0 ist nur NOTWENDIG, nicht HINREICHEND.</>, warum: "Es schließt Konvergenz nicht ein - es schließt nur Divergenz aus, wenn Glieder NICHT gegen 0 gehen." },
              { formel: <>Σ 1/n divergiert (harmonische Reihe).</>, warum: "Das Standard-Gegenbeispiel: Glieder gegen 0, Summe trotzdem unbegrenzt." },
            ]}
          />
          <QuizMC
            frage={<>Welches Kriterium passt am besten zu Σ <Frac num={<>(&minus;1)<sup>n</sup></>} den="2n &minus; 1" /> ?</>}
            optionen={["Geometrische Reihe (q < 1)", "Leibniz-Kriterium (alternierend)", "Harmonische Reihe", "Notwendiges Kriterium reicht zum Beweis"]}
            richtigIndex={1}
            loesung={[
              { formel: <>(-1)ⁿ ⇒ Vorzeichen wechselt ⇒ alternierend.</>, warum: "Bei alternierenden Reihen ist Leibniz der natürliche Kandidat." },
              { formel: <>bₙ = 1/(2n-1) fällt monoton gegen 0.</>, warum: "Beide Leibniz-Bedingungen erfüllt ⇒ konvergent." },
            ]}
          />
          <FalleCard>
            "1/n geht gegen 0, also konvergiert die Reihe" - <b>falsch!</b> Das notwendige Kriterium (Glieder -&gt; 0)
            ist nur <i>notwendig</i>, nicht hinreichend. Die harmonische Reihe ist das Standard-Gegenbeispiel.
            Umgekehrt gilt: gehen die Glieder NICHT gegen 0, divergiert die Reihe garantiert.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "Σ(1,2)ⁿ divergiert (|q|>1) ,  Σ sin(nπ)=0 (alle Glieder 0)" },
            { k: "hk24", t: "Σ 1/n divergiert ,  Σ 0,99ⁿ konvergiert" },
          ]} />
        </Section>

        {/* ============ 4 - VERKETTUNG ============ */}
        <Section id="t4" kicker="Aufgabentyp 4" title="Funktionsverkettung - g∘f, f∘g, Definitionsbereich, Inverse">
          <Grundlagen titel="Funktionen hintereinanderschalten - wie zwei Maschinen">
            <b style={{ color: C.text }}>Worum geht es?</b> Stell dir zwei Maschinen vor. Maschine f nimmt eine Zahl und
            macht etwas damit, Maschine g macht etwas anderes. Bei der <b style={{ color: C.text }}>Verkettung g∘f</b>
            steckst du dein x erst in f, und das Ergebnis sofort weiter in g. Also: <i>von innen nach außen.</i>
            Wichtig: Die Reihenfolge zählt - erst f, dann g ist meist etwas anderes als erst g, dann f.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="g∘f">"g nach f", gesprochen g Kringel f. Bedeutet g(f(x)): zuerst f anwenden.</Vokabel>
              <Vokabel w="√(...)">Wurzel; darunter darf nichts Negatives stehen - das schränkt den Definitionsbereich ein.</Vokabel>
              <Vokabel w="Def.-bereich">die Menge aller x, die man einsetzen DARF (z. B. Radikand ≥ 0, Nenner ≠ 0).</Vokabel>
              <Vokabel w="f⁻¹">Umkehrfunktion: macht f rückgängig. Man löst y = f(x) nach x auf und tauscht x und y.</Vokabel>
            </div>
            <MiniBeispiel>
              f(x) = x + 1, g(x) = 2x. Dann ist (g∘f)(x) = g(f(x)) = 2·(x+1) = 2x + 2.
              Andersherum: (f∘g)(x) = f(g(x)) = 2x + 1. <b style={{ color: C.warn }}>Verschieden!</b>
              Genau dieses "erst innen, dann außen" und das Beachten der Reihenfolge brauchst du in der Aufgabe.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              f(x) = √(1−x), g(x) = x² und die Verkettung (g∘f)(x) = 1−x gemeinsam (Hover für Werte):
            </div>
            <GraphInteraktiv
              xRange={[-3, 3]} yRange={[-1, 4.2]} height={250} slider={null}
              build={() => ({
                fns: [
                  { f: (x) => Math.sqrt(1 - x), color: C.accent, label: "f(x) = √(1−x)" },
                  { f: (x) => x * x, color: C.accent2, label: "g(x) = x²" },
                  { f: (x) => (x <= 1 ? 1 - x : NaN), color: C.good, label: "(g∘f)(x) = 1−x  (nur x ≤ 1)" },
                ],
              })}
              hinweis={<>Beachte: (g∘f)(x) = 1−x ist eine Gerade, aber sie existiert nur für <b style={{ color: C.text }}>x ≤ 1</b> - genau dort, wo f (die Wurzel) definiert ist. Rechts von x = 1 hört die grüne Linie auf.</>}
            />
          </div>
          <InfoBox title="Was bedeutet g∘f ?">
            (g&thinsp;&#8728;&thinsp;f)(x) = g(f(x)): erst f auf x anwenden, dann g auf das Ergebnis - "von innen nach außen".
            Achtung auf die Reihenfolge: g&#8728;f ist meist NICHT dasselbe wie f&#8728;g. Der Definitionsbereich der
            Verkettung umfasst nur die x, für die <i>beide</i> Schritte erlaubt sind.
          </InfoBox>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 4"
            aufgabe={<>Gegeben f(x) = &radic;(1&minus;x) und g(x) = x&sup2;. Bestimme g&#8728;f, f&#8728;g samt Definitionsbereich und zeige (g&#8728;f) = (g&#8728;f)<sup>&minus;1</sup>.</>}
            schritte={[
              { formel: <>(g&#8728;f)(x) = g(f(x)) = (&radic;(1&minus;x))&sup2; = 1 &minus; x</>,
                warum: "Quadrieren hebt die Wurzel auf. Aber: f muss zuerst definiert sein - dazu gleich.",
                uebung: {
                  frage: <>Eigenes Beispiel: f(x) = √(3&minus;x), g(x) = x². Was ist (g&#8728;f)(x) = (√(3&minus;x))² ?</>,
                  akzeptiert: ["3-x", "3−x"],
                  loesung: "3 − x",
                  erklaerung: [
                    { formel: <>(g&#8728;f)(x) = g(f(x)) = (√(3&minus;x))&sup2;</>, warum: "Erst f anwenden, dann g (quadrieren)." },
                    { formel: <>= 3 &minus; x</>, warum: "Quadrieren hebt die Wurzel auf - das Innere bleibt stehen." },
                  ],
                } },
              { formel: <>D(f): 1&minus;x &ge; 0 &rArr; x &le; 1. Also D(g&#8728;f) = (&minus;&infin;, 1].</>,
                warum: "Unter der Wurzel darf nichts Negatives stehen. Der Definitionsbereich von f vererbt sich auf g∘f, obwohl 1-x überall definiert wäre.",
                uebung: {
                  frage: <>Bestimme den Definitionsbereich von √(2&minus;x): bis zu welchem x darf man gehen? (gib die obere Grenze als Zahl)</>,
                  zahl: 2, toleranz: 0.001, akzeptiert: ["2", "x<=2", "x≤2"],
                  loesung: "x ≤ 2",
                  erklaerung: [
                    { formel: <>2 &minus; x &ge; 0</>, warum: "Der Radikand (das unter der Wurzel) muss ≥ 0 sein." },
                    { formel: <>&rArr; x &le; 2</>, warum: "Nach x auflösen: 2 ≥ x, also x ≤ 2. Die obere Grenze ist 2." },
                  ],
                } },
              { formel: <>(f&#8728;g)(x) = f(g(x)) = &radic;(1 &minus; x&sup2;)</>,
                warum: "Andere Reihenfolge: erst quadrieren, dann in die Wurzel. Ergebnis ist völlig anders als g∘f." },
              { formel: <>D(f&#8728;g): 1&minus;x&sup2; &ge; 0 &rArr; &minus;1 &le; x &le; 1.</>,
                warum: "Auch hier muss der Radikand >= 0 sein. Das ergibt das Intervall [-1, 1]." },
              { formel: <>Inverse von (g&#8728;f)(x)=1&minus;x: y = 1&minus;x &rArr; x = 1&minus;y.</>,
                warum: "Nach x auflösen und x, y tauschen liefert die Umkehrfunktion." },
              { formel: <><b>(g&#8728;f)<sup>&minus;1</sup>(x) = 1 &minus; x = (g&#8728;f)(x)</b> &#10003;</>,
                warum: "Funktion und ihre Inverse sind identisch - 1-x ist selbstinvers (eine Involution). Genau das war zu zeigen." },
            ]}
          />
          <QuizMC
            frage={<>Mit f(x) = x + 1 und g(x) = x²: Was ist (g&#8728;f)(x)?</>}
            optionen={["x² + 1", "(x + 1)²", "x² · (x + 1)", "x + 1"]}
            richtigIndex={1}
            loesung={[
              { formel: <>g&#8728;f = g(f(x)), also f zuerst einsetzen.</>, warum: "Von innen nach außen: erst f(x) = x+1 bilden." },
              { formel: <>g(x+1) = (x+1)&sup2;</>, warum: "Das Ergebnis von f kommt als Ganzes in g (quadrieren). NICHT x²+1 - das wäre f∘g + 0... ein klassischer Fehler." },
            ]}
          />
          <QuizMC
            frage={<>(g&#8728;f)(x) = 1−x sieht für alle x definiert aus. Warum ist der Definitionsbereich trotzdem nur x ≤ 1?</>}
            optionen={["Weil 1−x nur dort positiv ist", "Weil die innere Funktion f = √(1−x) nur für x ≤ 1 existiert", "Weil g(x) = x² nur für x ≤ 1 gilt", "Das stimmt nicht, der Bereich ist ganz ℝ"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Bei g&#8728;f muss zuerst f definiert sein.</>, warum: "Der Definitionsbereich der inneren Funktion vererbt sich auf die Verkettung." },
              { formel: <>f = √(1−x) braucht 1−x ≥ 0 ⇒ x ≤ 1.</>, warum: "Auch wenn 1−x danach überall definiert wäre - der Weg führt durch f, und das begrenzt auf x ≤ 1." },
            ]}
          />
          <FalleCard>
            Reihenfolge vertauschen: g&#8728;f bedeutet <b>g(f(x))</b>, also f zuerst. Und der häufigste Punktverlust:
            den <b>Definitionsbereich vergessen</b>. (g&#8728;f)(x) = 1&minus;x sieht überall definiert aus - gilt aber
            nur für x &le; 1, weil f die Wurzel enthält.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "f=√x , g=1−x²" },
            { k: "hk24", t: "f=x² , g=1+x  (+ Monotonie prüfen)" },
          ]} />
        </Section>

        {/* ============ 5 - GRENZWERT-BEWEIS ============ */}
        <Section id="t5" kicker="Aufgabentyp 5" title="Grenzwert-Beweis / Stetigkeit (Ableitungsdefinition)">
          <Grundlagen titel="Die Ableitung ist ein Grenzwert - der Differenzenquotient">
            <b style={{ color: C.text }}>Worum geht es?</b> Die <b style={{ color: C.text }}>Ableitung</b> einer Funktion an
            einer Stelle ist die <i>Steigung</i> des Graphen genau dort. Wie misst man Steigung? Man legt eine Gerade durch
            zwei Punkte (eine <b style={{ color: C.text }}>Sekante</b>) und berechnet "Höhenunterschied geteilt durch
            Breitenunterschied". Rückt der zweite Punkt immer näher an den ersten (Abstand h → 0), wird aus der Sekante die
            <b style={{ color: C.text }}> Tangente</b> - und ihre Steigung ist die Ableitung.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="h">der kleine Abstand zwischen den beiden Punkten; am Ende lässt man h → 0 gehen.</Vokabel>
              <Vokabel w="Diff.-quot.">Differenzenquotient <Frac num={<>g(x+h) − g(x)</>} den="h" />: die Steigung der Sekante.</Vokabel>
              <Vokabel w="g'(x)">die Ableitung = Grenzwert des Differenzenquotienten für h → 0.</Vokabel>
              <Vokabel w="ln(a)">natürlicher Logarithmus von a; taucht als Ableitung von aˣ auf: (aˣ)' = aˣ·ln(a).</Vokabel>
            </div>
            <div style={{ marginTop: 10 }}>
              <b style={{ color: C.good }}>Der Trick dieser Aufgabe:</b> Wenn ein gesuchter Grenzwert genau die Bauform
              <Frac num={<>g(0+h) − g(0)</>} den="h" /> hat, dann IST er g'(0) - du musst ihn nicht mühsam ausrechnen,
              sondern nur die Ableitung kennen.
            </div>
            <MiniBeispiel>
              g(x) = x², Stelle 0: Differenzenquotient = <Frac num={<>(0+h)² − 0²</>} den="h" /> = <Frac num={<>h²</>} den="h" /> = h.
              Für h → 0 wird daraus 0. Also g'(0) = 0 - die Parabel ist im Scheitel waagerecht. Dieselbe Logik, nur mit aˣ
              statt x², steckt in der Klausuraufgabe.
            </MiniBeispiel>
          </Grundlagen>
          <p style={{ marginTop: 0 }}>
            Hier sollst du einen Grenzwert nicht nur ausrechnen, sondern <b style={{ color: C.text }}>begründen</b> -
            oft über die <b style={{ color: C.text }}>Definition der Ableitung</b> als Grenzwert des Differenzenquotienten.
          </p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              g(x) = 2ˣ und ihre Tangente bei x = 0: die Steigung dort ist g'(0) = ln(2) ≈ 0,693
            </div>
            <Graph
              xRange={[-2.5, 2.5]} yRange={[-0.5, 4.2]} height={240}
              fns={[
                { f: (x) => Math.pow(2, x), color: C.accent, label: "g(x) = 2ˣ" },
                { f: (x) => 1 + Math.log(2) * x, color: C.gold, dash: "6 5", label: "Tangente bei 0: y = 1 + ln(2)·x" },
              ]}
              marks={[{ x: 0, y: 1, color: C.good, label: "(0; 1)" }]}
            />
          </div>

          <LösungsStepper
            blatt="hk23" nr="Aufgabe 5"
            aufgabe={<>Zeige für a &gt; 0: &nbsp;lim<sub>h&rarr;0</sub> <Frac num={<>a<sup>h</sup> &minus; 1</>} den="h" /> = ln(a).</>}
            schritte={[
              { formel: <>Betrachte die Funktion g(x) = a<sup>x</sup> an der Stelle x = 0.</>,
                warum: "Der gesuchte Grenzwert hat genau die Bauform des Differenzenquotienten von a^x bei 0." },
              { formel: <>Ableitungsdefinition: g'(0) = lim<sub>h&rarr;0</sub> <Frac num={<>g(0+h) &minus; g(0)</>} den="h" /></>,
                warum: "Die Ableitung ist definiert als Grenzwert des Differenzenquotienten - das ist die Brücke zur Aufgabe." },
              { formel: <>g(0) = a<sup>0</sup> = 1, also g'(0) = lim<sub>h&rarr;0</sub> <Frac num={<>a<sup>h</sup> &minus; 1</>} den="h" /></>,
                warum: "Einsetzen zeigt: der gesuchte Grenzwert IST g'(0). Jetzt muss man nur g' kennen." },
              { formel: <>Ableitung der Exponentialfunktion: g'(x) = a<sup>x</sup> &middot; ln(a)</>,
                warum: "Standard-Ableitung. (Herleitbar über a^x = e^{x ln a} und Kettenregel.)",
                uebung: {
                  frage: <>Spezialfall a = e: Was ist die Ableitung von eˣ an der Stelle 0, also e⁰·ln(e) ?</>,
                  zahl: 1, toleranz: 0.001, akzeptiert: ["1"],
                  loesung: "1",
                  erklaerung: [
                    { formel: <>g'(0) = e⁰ · ln(e)</>, warum: "Formel (aˣ)' = aˣ·ln(a) bei x = 0 und a = e." },
                    { formel: <>= 1 · 1 = 1</>, warum: "e⁰ = 1 und ln(e) = 1. Deshalb ist eˣ die Funktion, die sich selbst ableitet." },
                  ],
                } },
              { formel: <><b>g'(0) = a<sup>0</sup> &middot; ln(a) = ln(a)</b> &#10003;</>,
                warum: "Bei x=0 ist a^0=1, es bleibt ln(a). Damit ist der Grenzwert bewiesen." },
            ]}
          />
          <QuizMC
            frage={<>Ein Grenzwert hat die Form lim<sub>h→0</sub> <Frac num={<>g(0+h) − g(0)</>} den="h" />. Was ist das?</>}
            optionen={["Die zweite Ableitung g''(0)", "Die Ableitung g'(0) (Differenzenquotient)", "Der Funktionswert g(0)", "Immer 0"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Das ist die Definition der Ableitung an der Stelle 0.</>, warum: "Differenzenquotient mit h → 0 = Ableitung g'(0)." },
              { formel: <>Statt mühsam zu rechnen: g' kennen und einsetzen.</>, warum: "Genau das macht den Beweis kurz und sauber." },
            ]}
          />
          <FalleCard>
            Hier einfach L'Hospital anzusetzen ist riskant, wenn die Ableitung von a^h gerade das ist, was man beweisen
            soll (Zirkelschluss). Der saubere Weg ist die <b>Ableitungsdefinition</b> - sie liefert das Ergebnis ohne Vorgriff.
          </FalleCard>
          <Varianten items={[
            { k: "hk24", t: "Nenne eine Eigenschaft stetiger Funktionen (z. B. Zwischenwertsatz)" },
          ]} />
        </Section>

        {/* ============ 6 - ABLEITUNGEN ============ */}
        <Section id="t6" kicker="Aufgabentyp 6" title="Ableitungen - Ketten-, Produkt- & logarithmische Regel">
          <Grundlagen titel="Ableiten = Steigung bestimmen, nach festen Regeln">
            <b style={{ color: C.text }}>Worum geht es?</b> Ableiten heißt: zu einer Funktion f die Funktion f' finden,
            die an jeder Stelle die <i>Steigung</i> von f angibt. Für die Grundbausteine gibt es feste Regeln, die du
            einfach anwendest - wie Vokabeln. Der ganze Trick in der Klausur ist: <b style={{ color: C.text }}>erkennen,
            welche Regel dran ist</b>, und sie sauber abarbeiten.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="Potenzregel">(xⁿ)' = n·xⁿ⁻¹: Exponent nach vorn, Exponent um 1 kleiner. (x³)' = 3x².</Vokabel>
              <Vokabel w="äußere/innere">bei verschachtelten Funktionen f(g(x)): f ist außen, g ist innen.</Vokabel>
              <Vokabel w="Kettenregel">äußere Ableitung mal innere Ableitung. Die innere NIE vergessen.</Vokabel>
              <Vokabel w="Produktregel">(u·v)' = u'·v + u·v': bei einem Produkt jeden Faktor einmal ableiten.</Vokabel>
              <Vokabel w="eˣ, ln x">(eˣ)' = eˣ (bleibt sich selbst), (ln x)' = 1/x.</Vokabel>
            </div>
            <MiniBeispiel>
              Leite (x²)³ mit der Kettenregel ab. Außen ist (▢)³, innen x².
              Äußere Ableitung: 3·(x²)² = 3x⁴. Innere Ableitung: (x²)' = 2x.
              Kettenregel: 3x⁴ · 2x = <b style={{ color: C.good }}>6x⁵</b>.
              Probe ohne Kettenregel: (x²)³ = x⁶, und (x⁶)' = 6x⁵. ✓ Gleiches Ergebnis - die Regel funktioniert.
            </MiniBeispiel>
          </Grundlagen>
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Kettenregel" formula="(f(g(x)))' = f'(g(x)) · g'(x)"
                note="'Äußere mal innere Ableitung'. Bei verschachtelten Funktionen wie (...)^5 oder √(...)." />
              <MethodRow color={C.accent2} name="Produktregel" formula="(u·v)' = u'v + uv'"
                note="Bei Produkten wie x³·e^x: jeden Faktor einmal ableiten, addieren." />
              <MethodRow color={C.gold} name="Logarithmische Ableitung" formula="y=f(x)^{g(x)} → ln beidseitig"
                note="Wenn Basis UND Exponent x enthalten (z. B. x^x): erst ln nehmen, dann implizit ableiten." />
            </div>
          </Card>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 6 a)"
            aufgabe={<>Leite ab: f(x) = (arcsin x + 4)<sup>5</sup>.</>}
            schritte={[
              { formel: <>Äußere Funktion: (&#9633;)<sup>5</sup>, innere: arcsin x + 4.</>,
                warum: "Verschachtelung erkennen -> Kettenregel. Innen steht arcsin x + 4." },
              { formel: <>Äußere Ableitung: 5(arcsin x + 4)<sup>4</sup></>,
                warum: "Potenzregel auf die äußere Klammer, Inneres unverändert lassen.",
                uebung: {
                  frage: <>Übe die Potenzregel: Leite x⁵ ab.</>,
                  akzeptiert: ["5x⁴", "5x^4", "5x4", "5*x^4"],
                  loesung: "5x⁴",
                  erklaerung: [
                    { formel: <>(xⁿ)' = n·xⁿ⁻¹</>, warum: "Potenzregel: Exponent nach vorn, Exponent um 1 verringern." },
                    { formel: <>(x⁵)' = 5·x⁴</>, warum: "n = 5: Faktor 5 vorn, neuer Exponent 4." },
                  ],
                } },
              { formel: <>Innere Ableitung: (arcsin x)' = <Frac num="1" den={<>&radic;(1&minus;x&sup2;)</>} /></>,
                warum: "Standard-Ableitung des Arkussinus; die +4 fällt als Konstante weg." },
              { formel: <><b>f'(x) = 5(arcsin x + 4)<sup>4</sup> &middot; <Frac num="1" den={<>&radic;(1&minus;x&sup2;)</>} /></b></>,
                warum: "Kettenregel: äußere mal innere Ableitung - fertig." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="hk23" nr="Aufgabe 6 c)"
              aufgabe={<>Leite ab: f(x) = x&sup3; &middot; e<sup>x</sup>.</>}
              schritte={[
                { formel: <>Produkt aus u = x&sup3; und v = e<sup>x</sup>.</>,
                  warum: "Zwei x-abhängige Faktoren multipliziert -> Produktregel." },
                { formel: <>u' = 3x&sup2;,&nbsp;&nbsp; v' = e<sup>x</sup></>,
                  warum: "Potenzregel für x³, und e^x bleibt beim Ableiten e^x.",
                  uebung: {
                    frage: <>Bestimme u' für u = x³ (Potenzregel).</>,
                    akzeptiert: ["3x²", "3x^2", "3x2"],
                    loesung: "3x²",
                    erklaerung: [
                      { formel: <>(x³)' = 3·x²</>, warum: "Exponent 3 nach vorn, neuer Exponent 2." },
                    ],
                  } },
                { formel: <>f'(x) = u'v + uv' = 3x&sup2; e<sup>x</sup> + x&sup3; e<sup>x</sup></>,
                  warum: "Produktregel einsetzen: erste abgeleitet mal zweite + erste mal zweite abgeleitet." },
                { formel: <><b>f'(x) = x&sup2; e<sup>x</sup>(3 + x)</b></>,
                  warum: "x² e^x ausklammern macht das Ergebnis kompakt." },
              ]}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="nk23" nr="Aufgabe 6 e)"
              aufgabe={<>Leite ab: f(x) = x<sup>x</sup> (logarithmische Ableitung).</>}
              schritte={[
                { formel: <>Setze y = x<sup>x</sup> und nimm beidseitig ln: ln y = x &middot; ln x.</>,
                  warum: "Basis UND Exponent enthalten x - normale Regeln greifen nicht. ln macht aus dem Exponenten einen Faktor." },
                { formel: <>Links implizit ableiten: <Frac num="y'" den="y" /> (innere Ableitung von ln y).</>,
                  warum: "y hängt von x ab, daher Kettenregel: (ln y)' = y'/y." },
                { formel: <>Rechts Produktregel: (x &middot; ln x)' = 1&middot;ln x + x&middot;<Frac num="1" den="x" /> = ln x + 1</>,
                  warum: "Produktregel auf x mal ln x; x mal 1/x = 1." },
                { formel: <><Frac num="y'" den="y" /> = ln x + 1 &rArr; y' = y(ln x + 1)</>,
                  warum: "Mit y multiplizieren, um y' freizustellen." },
                { formel: <><b>f'(x) = x<sup>x</sup>(ln x + 1)</b></>,
                  warum: "y = x^x wieder einsetzen. Fertig." },
              ]}
            />
          </div>
          <QuizMC
            frage={<>Du sollst f(x) = (arcsin x + 4)⁵ ableiten. Welche Regel ist hier die richtige?</>}
            optionen={["Produktregel", "Kettenregel (äußere mal innere Ableitung)", "Quotientenregel", "Logarithmische Ableitung"]}
            richtigIndex={1}
            loesung={[
              { formel: <>(▢)⁵ mit Innenleben arcsin x + 4 ⇒ Verschachtelung.</>, warum: "Eine Funktion steckt in einer anderen - das ist die Kettenregel." },
              { formel: <>f' = 5(arcsin x + 4)⁴ · (arcsin x)'</>, warum: "Äußere Ableitung mal innere Ableitung - die innere nie vergessen." },
            ]}
          />
          <QuizMC
            frage={<>Warum darf man x^x NICHT mit der Potenzregel (xⁿ)' = n·xⁿ⁻¹ ableiten?</>}
            optionen={["Weil x^x gar nicht differenzierbar ist", "Weil der Exponent hier kein fester Wert n ist, sondern selbst x", "Weil x^x immer 1 ist", "Darf man doch - das Ergebnis ist x·xˣ⁻¹"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Potenzregel verlangt einen KONSTANTEN Exponenten n.</>, warum: "Bei x^x ist auch der Exponent variabel - die Regel passt nicht." },
              { formel: <>Lösung: ln nehmen ⇒ ln y = x ln x, dann implizit ableiten.</>, warum: "Logarithmische Ableitung liefert f'(x) = xˣ(ln x + 1)." },
            ]}
          />
          <FalleCard>
            x^x NICHT wie x^n (Potenzregel) oder wie a^x (Exponentialregel) behandeln - beides ist falsch, weil
            hier <b>Basis und Exponent zugleich x</b> sind. Nur die logarithmische Ableitung ist korrekt.
            Und bei der Kettenregel die <b>innere Ableitung nicht vergessen</b> (häufigster Flüchtigkeitsfehler).
          </FalleCard>
          <Varianten items={[
            { k: "hk23", t: "√(sin x + 1) (Kettenregel)" },
            { k: "nk23", t: "(arctan x + 2)⁴ ,  e^{arcosh x}+e^{−arcosh x}" },
            { k: "hk24", t: "ln(3x) ,  √(ln x² + 1) ,  x⁴·e^x" },
          ]} />
        </Section>

        {/* ============ 7 - L'HOSPITAL ============ */}
        <Section id="t7" kicker="Aufgabentyp 7" title="L'Hospital-Grenzwerte - '0/0' und '0·∞'">
          <Grundlagen titel="Wenn Einsetzen '0/0' liefert - die unbestimmte Form">
            <b style={{ color: C.text }}>Worum geht es?</b> Manchmal willst du einen Grenzwert eines Bruchs bestimmen,
            und beim Einsetzen kommt <Frac num="0" den="0" /> heraus. Das ist <i>keine</i> Zahl - es ist ein
            "unentschiedenes Rennen" zwischen Zähler und Nenner: beide gehen gegen 0, aber wer schneller? L'Hospital
            ist der Schiedsrichter: er vergleicht die <b style={{ color: C.text }}>Steigungen</b> (Ableitungen) von Zähler
            und Nenner und liest daran den Grenzwert ab.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="unbest. Form">ein Ausdruck wie 0/0 oder ∞/∞, der so noch keinen Wert hat.</Vokabel>
              <Vokabel w="L'Hospital">bei 0/0 oder ∞/∞: lim <Frac num="f" den="g" /> = lim <Frac num="f'" den="g'" />.</Vokabel>
              <Vokabel w="getrennt">Zähler und Nenner werden EINZELN abgeleitet - NICHT mit der Quotientenregel.</Vokabel>
              <Vokabel w="0·∞">andere unbestimmte Form; erst in einen Bruch umschreiben, dann L'Hospital.</Vokabel>
            </div>
            <MiniBeispiel>
              lim<sub>x→0</sub> <Frac num="3x" den="x" />. Einsetzen: <Frac num="0" den="0" /> - unbestimmt. L'Hospital: Zähler
              ableiten (3x)' = 3, Nenner ableiten (x)' = 1, also <Frac num="3" den="1" /> = <b style={{ color: C.good }}>3</b>.
              Probe: 3x/x = 3 für alle x ≠ 0. ✓ Genau diese Idee, nur mit eˣ statt 3x, steckt in 7a.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              f(x) = (e⁴ˣ−1)/(2x): bei x = 0 ist sie "0/0" (Lücke), aber schiebe x → 0 und der Wert läuft gegen 2:
            </div>
            <GraphInteraktiv
              xRange={[0, 0.6]} yRange={[0, 6]} height={240}
              slider={{ min: 0.02, max: 0.6, step: 0.02, init: 0.5, label: "x immer näher an 0 schieben", fmt: (x) => `x = ${x.toFixed(2)}` }}
              build={(x) => ({
                fns: [
                  { f: (xx) => (Math.exp(4 * xx) - 1) / (2 * xx), color: C.accent, label: "(e⁴ˣ−1)/(2x)" },
                  { f: () => 2, color: C.good, dash: "6 5", label: "Grenzwert 2" },
                ],
                marks: [{ x, y: (Math.exp(4 * x) - 1) / (2 * x), color: C.gold }],
                readout: (
                  <>Bei x = {x.toFixed(2)}: f(x) = {((Math.exp(4 * x) - 1) / (2 * x)).toFixed(3)}
                    {"  →  "}je kleiner x, desto näher an 2</>
                ),
              })}
              hinweis="Genau bei x = 0 hat der Graph eine winzige Lücke (0/0 ist nicht definiert) - aber von beiden Seiten strebt er gegen 2. Das ist der Grenzwert, den L'Hospital sauber liefert."
            />
          </div>
          <InfoBox title="Wann darf man L'Hospital anwenden?">
            Nur bei den <b style={{ color: C.text }}>unbestimmten Formen</b> <code style={{ color: C.gold }}>0/0</code> oder
            <code style={{ color: C.gold }}> &infin;/&infin;</code>. Dann gilt: lim <Frac num="f" den="g" /> = lim <Frac num="f'" den="g'" />
            (Zähler und Nenner <i>getrennt</i> ableiten, NICHT die Quotientenregel!). Andere Formen wie
            <code style={{ color: C.accent2 }}> 0&middot;&infin;</code> erst in einen Bruch umschreiben.
          </InfoBox>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 7 a)"
            aufgabe={<>lim<sub>x&rarr;0</sub> <Frac num={<>e<sup>4x</sup> &minus; 1</>} den="2x" /></>}
            schritte={[
              { formel: <>Einsetzen x=0: <Frac num={<>e<sup>0</sup>&minus;1</>} den="0" /> = <Frac num="0" den="0" /></>,
                warum: "Erst prüfen, ob überhaupt eine unbestimmte Form vorliegt. 0/0 -> L'Hospital erlaubt." },
              { formel: <>Zähler ableiten: (e<sup>4x</sup>&minus;1)' = 4e<sup>4x</sup></>,
                warum: "Kettenregel: innere Ableitung von 4x ist 4. Die -1 fällt weg." },
              { formel: <>Nenner ableiten: (2x)' = 2</>,
                warum: "Einfache Potenzregel." },
              { formel: <>lim<sub>x&rarr;0</sub> <Frac num={<>4e<sup>4x</sup></>} den="2" /> = <Frac num={<>4&middot;1</>} den="2" /></>,
                warum: "Jetzt x=0 einsetzen: e^0 = 1." },
              { formel: <><b>= 2</b></>,
                warum: "4/2 = 2. Das ist der Grenzwert.",
                uebung: {
                  frage: <>Selbst mit L'Hospital: lim<sub>x→0</sub> <Frac num={<>e<sup>6x</sup> &minus; 1</>} den="2x" /> = ?</>,
                  zahl: 3, toleranz: 0.001, akzeptiert: ["3"],
                  loesung: "3",
                  erklaerung: [
                    { formel: <>Einsetzen: (e⁰−1)/0 = 0/0 ⇒ L'Hospital erlaubt.</>, warum: "Erst die Form prüfen." },
                    { formel: <>Zähler: (e⁶ˣ−1)' = 6e⁶ˣ; Nenner: (2x)' = 2</>, warum: "Getrennt ableiten, Kettenregel im Zähler (innere Ableitung 6)." },
                    { formel: <>x=0: <Frac num={<>6·1</>} den="2" /> = 3</>, warum: "e⁰ = 1, also 6/2 = 3." },
                  ],
                } },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="hk23" nr="Aufgabe 7 b)"
              aufgabe={<>lim<sub>x&rarr;0</sub> x&sup2; &middot; ln(x&sup2;)</>}
              schritte={[
                { formel: <>Form: 0 &middot; (&minus;&infin;) - unbestimmt, aber kein Bruch.</>,
                  warum: "x² -> 0, ln(x²) -> -unendlich. Erst in einen Bruch umschreiben, damit L'Hospital greift." },
                { formel: <>Umschreiben: x&sup2; ln(x&sup2;) = <Frac num={<>ln(x&sup2;)</>} den={<>1 / x&sup2;</>} /></>,
                  warum: "Den 0-Faktor in den Nenner schieben: aus 0·∞ wird ∞/∞." },
                { formel: <>Substituiere t = x&sup2; &rarr; 0<sup>+</sup>: <Frac num="t ln t" den="1" /> bzw. t&middot;ln t.</>,
                  warum: "Mit t = x² wird es der bekannte Grenzwert t·ln t für t -> 0+." },
                { formel: <>lim<sub>t&rarr;0<sup>+</sup></sub> t &middot; ln t = 0</>,
                  warum: "Standardgrenzwert: t geht schneller gegen 0 als ln t gegen -unendlich. (Per L'Hospital auf ln t / (1/t) bestätigt.)" },
                { formel: <><b>&rArr; lim<sub>x&rarr;0</sub> x&sup2; ln(x&sup2;) = 0</b></>,
                  warum: "Das Polynom x² 'gewinnt' gegen den Logarithmus." },
              ]}
            />
          </div>
          <QuizMC
            frage={<>Bei L'Hospital für lim <Frac num="f" den="g" />: Wie leitet man ab?</>}
            optionen={["Mit der Quotientenregel (f'g − fg')/g²", "Zähler und Nenner getrennt: f' und g' einzeln", "Nur den Zähler", "Erst multiplizieren, dann ableiten"]}
            richtigIndex={1}
            loesung={[
              { formel: <>L'Hospital: lim <Frac num="f" den="g" /> = lim <Frac num="f'" den="g'" /></>, warum: "Zähler und Nenner werden getrennt abgeleitet - das ist NICHT die Quotientenregel." },
              { formel: <>Quotientenregel wäre hier ein klassischer Fehler.</>, warum: "Sie liefert einen anderen, falschen Ausdruck." },
            ]}
          />
          <QuizMC
            frage={<>Setzt man x = 0 in <Frac num={<>e<sup>4x</sup> − 1</>} den="2x" /> ein, kommt 0/0. Was bedeutet das?</>}
            optionen={["Der Grenzwert ist 0", "Der Grenzwert existiert nicht", "Unbestimmte Form - L'Hospital ist erlaubt", "Man muss durch 0 teilen, also Fehler"]}
            richtigIndex={2}
            loesung={[
              { formel: <>0/0 ist eine unbestimmte Form.</>, warum: "Sie hat noch keinen Wert - genau hier darf (und soll) man L'Hospital anwenden." },
              { formel: <>Ergebnis hier: 4e⁴ˣ/2 bei x=0 = 2.</>, warum: "Getrennt ableiten, einsetzen - der Grenzwert ist 2." },
            ]}
          />
          <FalleCard>
            Den Bruch mit der <b>Quotientenregel</b> ableiten - falsch! Bei L'Hospital werden Zähler und Nenner
            <b> getrennt</b> abgeleitet. Und: L'Hospital nur bei 0/0 oder &infin;/&infin; ansetzen - vorher die Form prüfen.
            0&middot;&infin; muss erst in einen Bruch umgeformt werden.
          </FalleCard>
          <Varianten items={[
            { k: "hk23", t: "ln(cos x)/ln(cos 4x) → 1/16" },
            { k: "nk23", t: "(e^{3x}−1)/(3x) → 1 ,  x² ln(x³)" },
            { k: "hk24", t: "ln x / x → 0 ,  (7^{5x²}−1)/(3x²)" },
          ]} />
        </Section>

        {/* ============ 8 - TAYLORREIHE ============ */}
        <Section id="t8" kicker="Aufgabentyp 8" title="Taylorreihe um a=0 (bis 4. Glied)">
          <Grundlagen titel="Eine krumme Funktion durch ein Polynom annähern">
            <b style={{ color: C.text }}>Worum geht es?</b> Funktionen wie √(x+1) oder eˣ sind "krumm" und schwer von Hand
            auszurechnen. Die <b style={{ color: C.text }}>Taylorreihe</b> baut dir an einer Stelle (hier a = 0) ein
            <b style={{ color: C.text }}> Polynom</b> (also nur +, ·, Potenzen), das sich an die Funktion anschmiegt:
            zuerst gleicher Wert, dann gleiche Steigung, dann gleiche Krümmung ... Je mehr Glieder du nimmst, desto
            besser passt die Näherung - besonders nahe am Entwicklungspunkt.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="a">Entwicklungspunkt - die Stelle, an der angenähert wird (hier 0, dann heißt es MacLaurin-Reihe).</Vokabel>
              <Vokabel w="f', f'', ...">erste, zweite, dritte Ableitung - sie liefern die Koeffizienten.</Vokabel>
              <Vokabel w="n! (Fakultät)">n! = 1·2·...·n. Es gilt 0! = 1, 1! = 1, 2! = 2, 3! = 6.</Vokabel>
              <Vokabel w="Glied">ein Summand der Reihe, z. B. <Frac num={<>f''(0)</>} den="2!" />·x² ist das x²-Glied.</Vokabel>
            </div>
            <MiniBeispiel>
              Das einfachste Taylorpolynom (2 Glieder) ist die <b style={{ color: C.text }}>Tangente</b>: f(0) + f'(0)·x.
              Für √(x+1) ist f(0) = 1 und f'(0) = ½, also T ≈ 1 + <Frac num="x" den="2" />. Bei x = 0,2:
              1 + 0,1 = 1,1; echt ist √1,2 ≈ 1,0954 - schon ziemlich nah. Mit mehr Gliedern wird es noch genauer.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              √(x+1) (cyan) und das Taylorpolynom (gold): schiebe die Anzahl der Glieder hoch und sieh die Näherung besser werden:
            </div>
            <GraphInteraktiv
              xRange={[-1, 3]} yRange={[-0.5, 2.6]} height={250}
              slider={{ min: 1, max: 4, step: 1, init: 2, label: "Anzahl der Glieder", fmt: (k) => `${k} Glied${k === 1 ? "" : "er"}` }}
              build={(k) => {
                const co = [1, 1 / 2, -1 / 8, 1 / 16];
                const T = (x) => { let s = 0; for (let i = 0; i < k; i++) s += co[i] * Math.pow(x, i); return s; };
                const labels = ["1", "1 + x/2", "1 + x/2 − x²/8", "1 + x/2 − x²/8 + x³/16"];
                return {
                  fns: [
                    { f: (x) => Math.sqrt(x + 1), color: C.accent2, label: "f(x) = √(x+1)" },
                    { f: T, color: C.gold, label: "Taylor (" + k + "): " + labels[k - 1] },
                  ],
                  marks: [{ x: 1, y: T(1), color: C.gold }],
                  readout: (<>Bei x = 1: √2 ≈ 1,4142 {"  ·  "}Näherung T<sub>{k}</sub>(1) = {T(1).toFixed(4)}</>),
                };
              }}
              hinweis="Mit 1 Glied ist die Näherung nur die waagerechte Linie y = 1. Ab 2 Gliedern wird daraus die Tangente, ab 3-4 schmiegt sich die goldene Kurve immer enger an die echte Wurzel - genau das ist der Sinn der Taylorreihe."
            />
          </div>
          <InfoBox title="Die Taylorformel">
            Um den Entwicklungspunkt a=0 (auch <b style={{ color: C.text }}>MacLaurin-Reihe</b>):
            f(x) &asymp; f(0) + f'(0)&middot;x + <Frac num={<>f''(0)</>} den="2!" />&middot;x&sup2; + <Frac num={<>f'''(0)</>} den="3!" />&middot;x&sup3; + ...
            (n! = "n Fakultät" = 1&middot;2&middot;...&middot;n, also 2!=2, 3!=6.) Man braucht die Ableitungen, jeweils bei 0 ausgewertet.
          </InfoBox>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 8"
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
                warum: "Werte in die Taylorformel einsetzen; 2!=2, 3!=6.",
                uebung: {
                  frage: <>Rechne den x²-Koeffizienten aus: <Frac num={<>&minus;1/4</>} den="2!" /> = ? (2! = 2; z. B. -1/8)</>,
                  zahl: -0.125, toleranz: 0.001, akzeptiert: ["-1/8", "−1/8"],
                  loesung: "-1/8",
                  erklaerung: [
                    { formel: <>2! = 2</>, warum: "Fakultät: 2! = 1·2 = 2." },
                    { formel: <><Frac num={<>&minus;1/4</>} den="2" /> = &minus;<Frac num="1" den="8" /> = &minus;0,125</>, warum: "Bruch durch 2 teilen heißt Nenner verdoppeln: 4·2 = 8." },
                  ],
                } },
              { formel: <><b>&radic;(x+1) &asymp; 1 + <Frac num="x" den="2" /> &minus; <Frac num={<>x&sup2;</>} den="8" /> + <Frac num={<>x&sup3;</>} den="16" /></b></>,
                warum: "(-1/4)/2 = -1/8 und (3/8)/6 = 1/16. Das ist die gesuchte Näherung." },
            ]}
          />
          <QuizMC
            frage={<>Welcher Nenner gehört zum x³-Glied der Taylorreihe?</>}
            optionen={["3 (einfach der Exponent)", "3! = 6", "2! = 2", "kein Nenner"]}
            richtigIndex={1}
            loesung={[
              { formel: <>x³-Glied = <Frac num={<>f'''(0)</>} den="3!" /> · x³</>, warum: "Beim x^k-Glied steht im Nenner k! (k Fakultät)." },
              { formel: <>3! = 1·2·3 = 6</>, warum: "Das Vergessen der Fakultät ist hier die häufigste Falle." },
            ]}
          />
          <QuizMC
            frage={<>Die Taylorreihe um a = 0 trägt noch einen anderen Namen. Welchen?</>}
            optionen={["Fourier-Reihe", "MacLaurin-Reihe", "Harmonische Reihe", "Geometrische Reihe"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Taylor um a = 0 = MacLaurin-Reihe.</>, warum: "Ein Spezialfall mit dem Entwicklungspunkt 0 - rechnerisch oft am einfachsten." },
            ]}
          />
          <FalleCard>
            Die <b>Fakultäten im Nenner vergessen</b>: das x&sup2;-Glied hat f''(0)/<b>2!</b>, das x&sup3;-Glied f'''(0)/<b>3!</b>.
            Und Vorzeichenfehler bei den negativen Exponenten der Wurzel-Ableitungen sind hier die typische Fehlerquelle.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "e^{2x+1} um a=0" },
            { k: "hk24", t: "tan x (Ableitungen explizit angeben)" },
          ]} />
        </Section>

        {/* ============ 9 - INTEGRALE ============ */}
        <Section id="t9" kicker="Aufgabentyp 9" title="Integrale - partielle Integration & Substitution">
          <Grundlagen titel="Integrieren = Fläche unter der Kurve = Ableiten rückwärts">
            <b style={{ color: C.text }}>Worum geht es?</b> Ein <b style={{ color: C.text }}>Integral</b> hat zwei Gesichter.
            Anschaulich misst das Zeichen ∫ die <i>Fläche zwischen Kurve und x-Achse</i>. Rechnerisch ist Integrieren
            das <b style={{ color: C.text }}>Gegenteil des Ableitens</b>: du suchst eine Funktion (die Stammfunktion),
            deren Ableitung dein Integrand ist. Beide Sichtweisen hängen über den Hauptsatz zusammen.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="∫ ... dx">"integriere nach x"; das dx sagt, nach welcher Variable.</Vokabel>
              <Vokabel w="Stammfkt.">eine Funktion F mit F' = f. Beispiel: F(x) = x²/2 ist Stammfunktion von f(x) = x.</Vokabel>
              <Vokabel w="+ C">unbestimmtes Integral hat keine festen Grenzen ⇒ Konstante C, weil C beim Ableiten wegfällt.</Vokabel>
              <Vokabel w="bestimmt">Integral mit Grenzen ∫ₐᵇ = F(b) − F(a) ⇒ eine konkrete Zahl (Flächeninhalt).</Vokabel>
            </div>
            <MiniBeispiel>
              ∫ x dx: Welche Funktion hat x als Ableitung? F(x) = <Frac num={<>x²</>} den="2" /> (denn (x²/2)' = x), plus C.
              Probe durch Ableiten: <Frac num="d" den="dx" />(<Frac num={<>x²</>} den="2" />) = x. ✓ Genau diese Rückwärts-Idee
              steckt hinter partieller Integration und Substitution - nur für kniffligere Integranden.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              Das bestimmte Integral als Fläche: die gefüllte Fläche ist ∫₀¹ x² dx = <Frac num="1" den="3" /> ≈ 0,333
            </div>
            <Graph
              xRange={[-0.4, 1.7]} yRange={[-0.3, 2.2]} height={230}
              fns={[{ f: (x) => x * x, color: C.accent, label: "f(x) = x²" }]}
              fill={{ f: (x) => x * x, from: 0, to: 1, color: C.accent }}
              marks={[{ x: 1, y: 1, color: C.gold, label: "(1; 1)" }]}
            />
            <div style={{ fontSize: 12.5, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
              Stammfunktion F(x) = x³/3, also ∫₀¹ x² dx = F(1) − F(0) = <Frac num="1" den="3" /> − 0 = <Frac num="1" den="3" />.
            </div>
          </div>
          <Card style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Partielle Integration" formula="∫ u'v = uv − ∫ uv'"
                note="Bei Produkten wie x·cos x oder x·ln x. Faustregel: das Teil, das beim Ableiten einfacher wird (z. B. x oder ln x), als v wählen." />
              <MethodRow color={C.accent2} name="Substitution" formula="∫ f(g(x))g'(x) dx = ∫ f(u) du"
                note="Wenn im Integranden eine innere Funktion und (fast) ihre Ableitung steht. Setze u = innere Funktion." />
            </div>
          </Card>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 9 b)"
            aufgabe={<>Berechne &#8747; x &middot; cos x dx.</>}
            schritte={[
              { formel: <>Wähle u = x (&rarr; u' = 1) und v' = cos x (&rarr; v = sin x).</>,
                warum: "x wird beim Ableiten zu 1 (einfacher), cos x lässt sich leicht integrieren. Ideal für partielle Integration." },
              { formel: <>&#8747; u v' dx = u v &minus; &#8747; u' v dx</>,
                warum: "Formel der partiellen Integration anschreiben." },
              { formel: <>= x &middot; sin x &minus; &#8747; 1 &middot; sin x dx</>,
                warum: "u·v = x sin x; das verbleibende Integral ist einfacher als das Ausgangsintegral." },
              { formel: <>&#8747; sin x dx = &minus;cos x</>,
                warum: "Stammfunktion von sin x ist -cos x.",
                uebung: {
                  frage: <>Welche Stammfunktion hat cos x? (∫ cos x dx = ?, ohne +C)</>,
                  akzeptiert: ["sin x", "sinx", "sin(x)"],
                  loesung: "sin x",
                  erklaerung: [
                    { formel: <>(sin x)' = cos x</>, warum: "Stammfunktion = Ableiten rückwärts: Was ergibt abgeleitet cos x? Genau sin x." },
                    { formel: <>also ∫ cos x dx = sin x (+ C)</>, warum: "Gegenstück zu ∫ sin x dx = −cos x." },
                  ],
                } },
              { formel: <><b>= x sin x + cos x + C</b></>,
                warum: "Minus mal -cos x ergibt +cos x. C ist die Integrationskonstante (unbestimmtes Integral)." },
            ]}
          />
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="hk23" nr="Aufgabe 9 c)"
              aufgabe={<>Berechne &#8747; x &middot; ln x dx.</>}
              schritte={[
                { formel: <>Wähle u = ln x (&rarr; u' = <Frac num="1" den="x" />) und v' = x (&rarr; v = <Frac num={<>x&sup2;</>} den="2" />).</>,
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
          <QuizMC
            frage={<>Bei &#8747; x · ln x dx mit partieller Integration: Was wählst du als u (das Teil, das abgeleitet wird)?</>}
            optionen={["u = x", "u = ln x", "u = x · ln x", "egal, beides geht gleich gut"]}
            richtigIndex={1}
            loesung={[
              { formel: <>ln x lässt sich leicht ableiten ((ln x)' = 1/x), aber schwer integrieren.</>, warum: "Darum nimmt man ln x als u - dann wird das Restintegral einfacher." },
              { formel: <>Mit u = x würde ln x integriert werden müssen - schwerer.</>, warum: "Falsche Wahl macht das Restintegral komplizierter statt einfacher." },
            ]}
          />
          <QuizMC
            frage={<>Du berechnest ein UNbestimmtes Integral (ohne Grenzen). Was darfst du nicht vergessen?</>}
            optionen={["die Grenzen einzusetzen", "die Integrationskonstante + C", "durch dx zu teilen", "das Ergebnis zu quadrieren"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Unbestimmtes Integral ⇒ + C.</>, warum: "Beim Ableiten fällt jede Konstante weg, also gibt es unendlich viele Stammfunktionen - das + C hält sie alle fest." },
            ]}
          />
          <FalleCard>
            Bei der partiellen Integration <b>u und v' falsch wählen</b>: dann wird das Restintegral schwerer statt
            leichter. Merksatz für x&middot;ln x: <b>ln x = u</b> (denn ln lässt sich leicht ableiten, schwer integrieren).
            Und die <b>+C</b> bei unbestimmten Integralen nie vergessen.
          </FalleCard>
          <Varianten items={[
            { k: "hk23", t: "∫ 3x²+4−1/x dx (Grundintegrale)" },
            { k: "nk23", t: "∫ e^{3x}+ln x dx ,  ∫ x·sin x dx ,  ∫ 1/(x ln x) dx (Substitution u=ln x)" },
          ]} />
        </Section>

        {/* ============ 10 - UNEIGENTLICHES INTEGRAL ============ */}
        <Section id="t10" kicker="Aufgabentyp 10" title="Uneigentliches Integral - Grenze als Limes behandeln">
          <Grundlagen titel="Wenn der Integrand an der Grenze explodiert">
            <b style={{ color: C.text }}>Worum geht es?</b> Normalerweise ist ein Integral eine endliche Fläche unter
            einer braven Kurve. Manchmal aber wird der Integrand an einer Grenze <b style={{ color: C.warn }}>unendlich
            hoch</b> (oder die Grenze selbst ist ∞). Dann darf man die Stelle nicht einfach einsetzen - man würde durch 0
            teilen. <b style={{ color: C.text }}>Der Trick:</b> Du ersetzt die heikle Grenze durch einen Buchstaben b,
            rechnest ganz normal, und lässt erst am Schluss b an die kritische Stelle heranlaufen (Grenzwert). Bleibt dabei
            eine endliche Zahl, <i>konvergiert</i> das Integral - sonst <i>divergiert</i> es.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="uneigentlich">Integral, bei dem Integrand oder Grenze unbeschränkt ist.</Vokabel>
              <Vokabel w="kritische Stelle">die Stelle, an der der Integrand → ∞ geht (oft wird dort ein Nenner 0).</Vokabel>
              <Vokabel w="b → 2,5⁻">b läuft von links an die kritische Stelle 2,5 heran, ohne sie zu erreichen.</Vokabel>
              <Vokabel w="konvergiert">der Grenzwert existiert und ist endlich ⇒ die Fläche hat einen festen Wert.</Vokabel>
            </div>
            <MiniBeispiel>
              ∫₀¹ <Frac num="1" den={<>√x</>} /> dx: bei x = 0 ist der Integrand ∞. Stammfunktion: 2√x.
              Setze untere Grenze a statt 0: [2√x]ₐ¹ = 2 − 2√a. Jetzt a → 0: 2√a → 0, also Ergebnis
              <b style={{ color: C.good }}> 2</b>. Endlich ⇒ das uneigentliche Integral konvergiert gegen 2.
            </MiniBeispiel>
          </Grundlagen>
          <p style={{ marginTop: 0 }}>
            Ein Integral heißt <b style={{ color: C.text }}>uneigentlich</b>, wenn der Integrand an einer Grenze
            unbeschränkt wird (gegen &infin; geht) oder eine Grenze selbst &infin; ist. Trick: die kritische Grenze
            durch eine Variable ersetzen und am Ende den <b style={{ color: C.text }}>Grenzwert</b> bilden.
          </p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              ∫₀ᵇ 1/√(5−2x) dx: schiebe die obere Grenze b gegen die Polstelle 2,5 - die Fläche wächst gegen √5 ≈ 2,236:
            </div>
            <GraphInteraktiv
              xRange={[-0.2, 2.7]} yRange={[0, 5]} height={250}
              slider={{ min: 0, max: 2.49, step: 0.03, init: 1.5, label: "obere Grenze b → 2,5", fmt: (b) => `b = ${b.toFixed(2)}` }}
              build={(b) => ({
                fns: [{ f: (x) => 1 / Math.sqrt(5 - 2 * x), color: C.accent, label: "1/√(5−2x)" }],
                fill: { f: (x) => 1 / Math.sqrt(5 - 2 * x), from: 0, to: b, color: C.accent2 },
                marks: [{ x: 2.5, y: 0, color: C.warn, label: "Pol x=2,5" }],
                readout: (
                  <>Fläche bis b = {b.toFixed(2)}: √5 − √(5−2b) = {(Math.sqrt(5) - Math.sqrt(5 - 2 * b)).toFixed(3)}
                    {"  →  "}Grenzwert √5 ≈ 2,236</>
                ),
              })}
              hinweis="Je näher b an 2,5 rückt, desto steiler wird der Integrand - aber die hinzukommende Fläche wird so schmal, dass die Gesamtfläche endlich bleibt und gegen √5 strebt. Genau das ist Konvergenz eines uneigentlichen Integrals."
            />
          </div>

          <LösungsStepper
            blatt="hk23" nr="Aufgabe 10"
            aufgabe={<>Berechne &#8747;<sub>0</sub><sup>2,5</sup> <Frac num="1" den={<>&radic;(5&minus;2x)</>} /> dx.</>}
            schritte={[
              { formel: <>Bei x=2,5: 5&minus;2&middot;2,5 = 0 &rArr; Integrand &rarr; &infin;. Uneigentlich!</>,
                warum: "Erst die kritische Stelle erkennen: der Nenner wird 0, der Integrand unbeschränkt." },
              { formel: <>Substitution u = 5&minus;2x, du = &minus;2 dx &rArr; dx = &minus;<Frac num="1" den="2" /> du.</>,
                warum: "Die innere Funktion unter der Wurzel substituieren, um eine einfache Stammfunktion zu finden." },
              { formel: <>&#8747; <Frac num="1" den={<>&radic;u</>} />&middot;(&minus;<Frac num="1" den="2" />) du = &minus;<Frac num="1" den="2" />&middot;2&radic;u = &minus;&radic;u</>,
                warum: "∫ u^{-1/2} du = 2√u; mal -1/2 ergibt -√u. Rücksubstitution: -√(5-2x)." },
              { formel: <>Als Limes: lim<sub>b&rarr;2,5<sup>&minus;</sup></sub> [&minus;&radic;(5&minus;2x)]<sub>0</sub><sup>b</sup></>,
                warum: "Die problematische obere Grenze 2,5 durch b ersetzen und b -> 2,5 von links laufen lassen.",
                uebung: {
                  frage: <>Übe an einem einfacheren: ∫₀¹ <Frac num="1" den={<>√x</>} /> dx mit Stammfunktion 2√x. Wert? (untere Grenze a → 0)</>,
                  zahl: 2, toleranz: 0.001, akzeptiert: ["2"],
                  loesung: "2",
                  erklaerung: [
                    { formel: <>[2√x]ₐ¹ = 2√1 − 2√a = 2 − 2√a</>, warum: "Stammfunktion an den Grenzen auswerten, untere Grenze als a." },
                    { formel: <>a → 0: 2√a → 0 ⇒ Ergebnis 2</>, warum: "Der kritische Teil verschwindet im Grenzwert - das Integral konvergiert gegen 2." },
                  ],
                } },
              { formel: <>= lim<sub>b&rarr;2,5</sub> (&minus;&radic;(5&minus;2b) + &radic;5) = &minus;0 + &radic;5</>,
                warum: "Bei b -> 2,5 wird √(5-2b) -> 0; bei der unteren Grenze 0 steht √5." },
              { formel: <><b>= &radic;5 &asymp; 2,236</b></>,
                warum: "Der Grenzwert existiert und ist endlich -> das uneigentliche Integral konvergiert gegen √5." },
            ]}
          />
          <QuizMC
            frage={<>Warum ist ∫₀<sup>2,5</sup> <Frac num="1" den={<>√(5−2x)</>} /> dx ein uneigentliches Integral?</>}
            optionen={["Weil die untere Grenze 0 ist", "Weil bei x = 2,5 der Nenner 0 wird und der Integrand → ∞ geht", "Weil der Integrand negativ ist", "Weil es keine Stammfunktion gibt"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Bei x = 2,5: 5 − 2·2,5 = 0 ⇒ Nenner 0.</>, warum: "Der Integrand wächst dort über alle Grenzen - das macht das Integral uneigentlich." },
              { formel: <>Darum: obere Grenze als Limes b → 2,5 behandeln.</>, warum: "Einfaches Einsetzen von 2,5 wäre Division durch 0." },
            ]}
          />
          <QuizMC
            frage={<>Wie geht man mit der kritischen Grenze 2,5 korrekt um?</>}
            optionen={["2,5 direkt einsetzen", "Die Grenze durch b ersetzen und b → 2,5 als Grenzwert bilden", "Das Integral auf 0 setzen", "Die Grenze auf 2 abrunden"]}
            richtigIndex={1}
            loesung={[
              { formel: <>∫₀ᵇ ... rechnen, dann lim<sub>b→2,5⁻</sub>.</>, warum: "So vermeidet man die Division durch 0 und sieht, ob ein endlicher Wert herauskommt." },
              { formel: <>Hier: √5 − √(5−2b) → √5 ≈ 2,236.</>, warum: "Endlicher Grenzwert ⇒ das Integral konvergiert." },
            ]}
          />
          <FalleCard>
            Die <b>Unbeschränktheit übersehen</b> und einfach 2,5 einsetzen - das gibt Division durch 0. Man MUSS die
            kritische Grenze als Limes behandeln. Existiert der Grenzwert nicht (wird unendlich), <b>divergiert</b> das Integral.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "∫₀² 1/√(6−3x) dx" },
          ]} />
        </Section>

        {/* ============ 11 - PARTIALBRUCHZERLEGUNG ============ */}
        <Section id="t11" kicker="Aufgabentyp 11" title="Partialbruchzerlegung - Nenner faktorisieren & integrieren">
          <Grundlagen titel="Einen schweren Bruch in leichte Stücke zerlegen">
            <b style={{ color: C.text }}>Worum geht es?</b> Einen Bruch wie <Frac num={<>7x+13</>} den={<>x²+5x−6</>} /> kann man nicht
            direkt integrieren. Die Idee der <b style={{ color: C.text }}>Partialbruchzerlegung</b>: zerlege ihn in eine
            <i> Summe</i> ganz einfacher Brüche der Form <Frac num="A" den={<>x−a</>} />, die du einzeln integrieren kannst -
            jeder liefert einen ln. Es ist dasselbe Prinzip wie <Frac num="5" den="6" /> = <Frac num="1" den="2" /> + <Frac num="1" den="3" />,
            nur mit Buchstaben statt Zahlen.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="faktoris.">den Nenner als Produkt schreiben, z. B. x²+5x−6 = (x+6)(x−1).</Vokabel>
              <Vokabel w="Linearfaktor">ein Faktor der Form (x − a); seine Nullstelle a ist eine Polstelle.</Vokabel>
              <Vokabel w="Ansatz">pro Linearfaktor ein Bruch mit unbekanntem Zähler: A/(x+6) + B/(x−1).</Vokabel>
              <Vokabel w="Einsetzmeth.">geschickte x-Werte einsetzen, sodass ein Unbekannter wegfällt.</Vokabel>
              <Vokabel w="∫ 1/(x−a)">= ln|x−a| - daher kommen die ln-Terme im Ergebnis.</Vokabel>
            </div>
            <MiniBeispiel>
              <Frac num="1" den={<>x(x+1)</>} /> = <Frac num="1" den="x" /> − <Frac num="1" den={<>x+1</>} />. Probe (zusammenfassen):
              <Frac num={<>(x+1) − x</>} den={<>x(x+1)</>} /> = <Frac num="1" den={<>x(x+1)</>} />. ✓ Integriert ergibt das ln|x| − ln|x+1|.
              Genau so läuft die Klausuraufgabe, nur mit den Zählern A und B, die man erst bestimmen muss.
            </MiniBeispiel>
          </Grundlagen>
          <InfoBox title="Idee der Partialbruchzerlegung">
            Einen komplizierten Bruch wie <Frac num={<>7x+13</>} den={<>x&sup2;+5x&minus;6</>} /> zerlegt man in eine Summe einfacher
            Brüche <Frac num="A" den={<>x+6</>} /> + <Frac num="B" den={<>x&minus;1</>} />, die man einzeln integrieren kann (sie liefern ln-Terme).
            Voraussetzung: Nenner in Linearfaktoren zerlegen.
          </InfoBox>
          <LösungsStepper
            blatt="hk23" nr="Aufgabe 11"
            aufgabe={<>Berechne &#8747; <Frac num={<>7x + 13</>} den={<>x&sup2; + 5x &minus; 6</>} /> dx.</>}
            schritte={[
              { formel: <>Nenner faktorisieren: x&sup2;+5x&minus;6 = (x+6)(x&minus;1)</>,
                warum: "Nullstellen x=-6 und x=1 (Satz von Vieta: Produkt -6, Summe -5... bzw. +5 mit Vorzeichen). Linearfaktoren sind die Basis der Zerlegung.",
                uebung: {
                  frage: <>Faktorisiere selbst: x² &minus; 5x + 6 = ? (zwei Klammern, z. B. (x-2)(x-3))</>,
                  akzeptiert: ["(x-2)(x-3)", "(x−2)(x−3)", "(x-3)(x-2)", "(x−3)(x−2)"],
                  loesung: "(x − 2)(x − 3)",
                  erklaerung: [
                    { formel: <>Suche zwei Zahlen mit Produkt 6 und Summe 5.</>, warum: "Bei x² + px + q: Produkt der Nullstellen = q, Summe = −p. Hier q = 6, −p = 5." },
                    { formel: <>2 und 3: 2·3 = 6, 2+3 = 5 ⇒ (x−2)(x−3)</>, warum: "Probe durch Ausmultiplizieren: x²−5x+6. ✓" },
                  ],
                } },
              { formel: <>Ansatz: <Frac num={<>7x+13</>} den={<>(x+6)(x&minus;1)</>} /> = <Frac num="A" den={<>x+6</>} /> + <Frac num="B" den={<>x&minus;1</>} /></>,
                warum: "Pro Linearfaktor ein Partialbruch mit unbekanntem Zähler A bzw. B." },
              { formel: <>Beide Seiten &middot;(x+6)(x&minus;1): 7x+13 = A(x&minus;1) + B(x+6)</>,
                warum: "Nenner wegmultiplizieren - jetzt eine Gleichung für alle x, aus der wir A und B bestimmen." },
              { formel: <>x = 1: 20 = 7B &rArr; B = <Frac num="20" den="7" /></>,
                warum: "Geschickte Werte einsetzen (Einsetzmethode): bei x=1 fällt der A-Term weg." },
              { formel: <>x = &minus;6: &minus;29 = &minus;7A &rArr; A = <Frac num="29" den="7" /></>,
                warum: "Bei x=-6 fällt der B-Term weg; -42+13 = -29." },
              { formel: <>&#8747;(<Frac num="29/7" den={<>x+6</>} /> + <Frac num="20/7" den={<>x&minus;1</>} />) dx</>,
                warum: "Jeder Summand ist jetzt ein Grundintegral der Form ∫ 1/(x-a) dx = ln|x-a|." },
              { formel: <><b>= <Frac num="29" den="7" /> ln|x+6| + <Frac num="20" den="7" /> ln|x&minus;1| + C</b></>,
                warum: "∫ 1/(x+6) dx = ln|x+6| usw. Betragsstriche, weil das Argument negativ sein kann." },
            ]}
          />
          <InfoBox title="Zusatzfrage: 'Wann darf über [a,b] integriert werden?'">
            Nur wenn <b style={{ color: C.text }}>keine Nullstelle des Nenners</b> im Intervall [a,b] liegt. Hier wären das
            x = &minus;6 und x = 1 - das Intervall darf diese Polstellen nicht enthalten, sonst ist das Integral uneigentlich.
          </InfoBox>
          <QuizMC
            frage={<>Wie viele Partialbrüche setzt man für <Frac num={<>7x+13</>} den={<>(x+6)(x−1)</>} /> an?</>}
            optionen={["Einen: A/((x+6)(x−1))", "Zwei: A/(x+6) + B/(x−1)", "Drei", "Keinen, man integriert direkt"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Pro Linearfaktor genau ein Partialbruch.</>, warum: "Zwei verschiedene Linearfaktoren ⇒ zwei Brüche A/(x+6) und B/(x−1)." },
              { formel: <>A und B dann per Einsetzmethode bestimmen.</>, warum: "x = 1 liefert B, x = −6 liefert A." },
            ]}
          />
          <QuizMC
            frage={<>Was ist ∫ <Frac num="1" den={<>x−1</>} /> dx?</>}
            optionen={["ln(x−1) + C", "ln|x−1| + C", "1/(x−1)² + C", "(x−1)·ln(x−1) + C"]}
            richtigIndex={1}
            loesung={[
              { formel: <>∫ 1/(x−a) dx = ln|x−a| + C</>, warum: "Mit Betragsstrichen, weil das Argument auch negativ sein kann (z. B. x &lt; 1)." },
              { formel: <>Betragsstriche vergessen = klassischer Punktverlust.</>, warum: "ln(x−1) ohne Betrag wäre für x &lt; 1 gar nicht definiert." },
            ]}
          />
          <FalleCard>
            <b>Betragsstriche bei ln vergessen</b>: korrekt ist ln|x&minus;1|, nicht ln(x&minus;1). Und Vorzeichenfehler beim
            Faktorisieren: x&sup2;+5x&minus;6 = (x+6)(x&minus;1), NICHT (x&minus;6)(x+1) - immer durch Ausmultiplizieren gegenprüfen.
          </FalleCard>
          <Varianten items={[
            { k: "nk23", t: "∫ (7+3x)/(x²−5x+6) dx ,  Nenner = (x−2)(x−3)" },
          ]} />
        </Section>

        {/* ============ 12 - BONUS INF24 ============ */}
        <Section id="t12" kicker="Aufgabentyp 12 &middot; Bonus (nur INF24)" title="Kurvendiskussion der Glockenkurve & vollständige Induktion">
          <Grundlagen titel="Kurvendiskussion - was f' und f'' über den Graphen verraten">
            <b style={{ color: C.text }}>Worum geht es?</b> Eine <b style={{ color: C.text }}>Kurvendiskussion</b> liest die
            Form eines Graphen aus seinen Ableitungen ab. Die <b style={{ color: C.text }}>erste Ableitung f'</b> ist die
            Steigung: wo f' = 0 ist, ist der Graph waagerecht (möglicher Hoch- oder Tiefpunkt). Die
            <b style={{ color: C.text }}> zweite Ableitung f''</b> ist die Krümmung: f'' &lt; 0 heißt nach rechts/unten
            gekrümmt (konkav, "Bergkuppe"), f'' &gt; 0 heißt nach links/oben gekrümmt (konvex, "Tal"). Wo f'' das Vorzeichen
            wechselt, liegt ein <b style={{ color: C.text }}>Wendepunkt</b>.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="f'(x)=0">Kandidat für Hoch-/Tiefpunkt (waagerechte Tangente).</Vokabel>
              <Vokabel w="konkav">f'' &lt; 0, Rechtskrümmung - der Graph wölbt sich nach oben (wie ein Hügel).</Vokabel>
              <Vokabel w="konvex">f'' &gt; 0, Linkskrümmung - der Graph öffnet sich nach oben (wie eine Schale).</Vokabel>
              <Vokabel w="Wendepunkt">f'' = 0 mit Vorzeichenwechsel - hier wechselt die Krümmung.</Vokabel>
            </div>
            <MiniBeispiel>
              f(x) = x²: f'(x) = 2x, also f'(0) = 0 ⇒ Tiefpunkt bei 0. f''(x) = 2 &gt; 0 überall ⇒ durchweg konvex (eine
              nach oben offene Parabel). Bei der Glockenkurve unten ist es spannender: sie ist in der Mitte konkav und
              außen konvex - dazwischen die Wendepunkte.
            </MiniBeispiel>
          </Grundlagen>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              Glockenkurve f(x) = e^(−x²/2): goldener Bereich = konkav (|x|&lt;1), rote Wendepunkte bei x = ±1. Schiebe die Teststelle:
            </div>
            <GraphInteraktiv
              xRange={[-3, 3]} yRange={[-0.1, 1.15]} height={250}
              slider={{ min: -3, max: 3, step: 0.1, init: 0.5, label: "Teststelle x (Krümmung prüfen)", fmt: (x) => `x = ${x.toFixed(1)}` }}
              build={(xs) => ({
                fns: [{ f: (x) => Math.exp(-x * x / 2), color: C.accent2, label: "f(x) = e^(−x²/2)" }],
                fill: { f: (x) => Math.exp(-x * x / 2), from: -1, to: 1, color: C.gold },
                marks: [
                  { x: 0, y: 1, color: C.good, label: "Max (0;1)" },
                  { x: -1, y: Math.exp(-0.5), color: C.warn, label: "WP x=−1" },
                  { x: 1, y: Math.exp(-0.5), color: C.warn, label: "WP x=1" },
                  { x: xs, y: Math.exp(-xs * xs / 2), color: C.gold },
                ],
                readout: (
                  <>f''({xs.toFixed(1)}) = (x²−1)·e^(−x²/2) = {((xs * xs - 1) * Math.exp(-xs * xs / 2)).toFixed(3)}
                    {"  →  "}{Math.abs(xs) < 0.999 ? "konkav (f'' < 0)" : Math.abs(xs) > 1.001 ? "konvex (f'' > 0)" : "Wendepunkt (f'' = 0)"}</>
                ),
              })}
              hinweis="In der Mitte (|x| < 1) ist x²−1 negativ ⇒ f'' < 0 ⇒ konkav (goldener Bereich). Außen (|x| > 1) ist x²−1 positiv ⇒ f'' > 0 ⇒ konvex. Genau bei x = ±1 ist f'' = 0 - die Wendepunkte."
            />
          </div>

          <LösungsStepper
            blatt="hk24" nr="Bonus: Glockenkurve"
            aufgabe={<>Untersuche f(x) = e<sup>&minus;x&sup2;/2</sup>: globales Maximum, Konkavität auf [&minus;0,5; 0,5], Wendepunkte.</>}
            schritte={[
              { formel: <>f'(x) = &minus;x &middot; e<sup>&minus;x&sup2;/2</sup></>,
                warum: "Kettenregel: innere Ableitung von -x²/2 ist -x. Die e-Funktion bleibt." },
              { formel: <>f'(x) = 0 &rArr; x = 0 (e-Term nie 0).</>,
                warum: "Ein Produkt ist 0, wenn ein Faktor 0 ist; e^{...} > 0 immer, also nur x=0." },
              { formel: <>f(0) = e<sup>0</sup> = 1 &rArr; globales Maximum (1; 0).</>,
                warum: "Bei x=0 ist die Funktion am größten; sie fällt nach beiden Seiten symmetrisch ab." },
              { formel: <>f''(x) = (x&sup2; &minus; 1) e<sup>&minus;x&sup2;/2</sup></>,
                warum: "Produkt- und Kettenregel auf f'. Das Vorzeichen von f'' steuert die Krümmung.",
                uebung: {
                  frage: <>Berechne f''(0) = (0² &minus; 1) · e⁰. Ist die Kurve dort konkav (negativ) oder konvex (positiv)?</>,
                  zahl: -1, toleranz: 0.001, akzeptiert: ["-1", "−1"],
                  loesung: "−1 (konkav)",
                  erklaerung: [
                    { formel: <>(0² &minus; 1) = &minus;1, e⁰ = 1</>, warum: "Einsetzen von x = 0." },
                    { formel: <>f''(0) = &minus;1 · 1 = &minus;1 &lt; 0 ⇒ konkav</>, warum: "Negative zweite Ableitung bedeutet Rechtskrümmung (konkav) - der Scheitel der Glocke." },
                  ],
                } },
              { formel: <>Auf [&minus;0,5; 0,5]: x&sup2;&minus;1 &lt; 0 &rArr; f'' &lt; 0 &rArr; konkav.</>,
                warum: "Für |x|<1 ist x²-1 negativ, also f''<0 -> Rechtskrümmung (konkav)." },
              { formel: <><b>Wendepunkte: f''=0 &rArr; x = &plusmn;1; konvex für |x| &gt; 1.</b></>,
                warum: "Bei x=±1 wechselt die Krümmung. Außerhalb [-1,1] ist x²-1>0 -> f''>0 -> konvex." },
            ]}
          />
          <Grundlagen titel="Vollständige Induktion - das Domino-Prinzip">
            <b style={{ color: C.text }}>Worum geht es?</b> Du willst zeigen, dass eine Formel für <i>alle</i> natürlichen
            Zahlen n gilt - unendlich viele Fälle, die man nicht einzeln prüfen kann. Die <b style={{ color: C.text }}>vollständige
            Induktion</b> macht das wie eine Reihe Dominosteine: (1) Du stößt den ersten Stein um (Induktionsanfang, n = 1).
            (2) Du zeigst: <i>fällt irgendein Stein n, fällt auch der nächste n+1</i> (Induktionsschritt). Dann fallen
            automatisch alle.
            <div style={{ marginTop: 12 }}>
              <b style={{ color: C.text }}>Die nötigen Vokabeln:</b>
              <Vokabel w="Anfang">die Aussage für n = 1 (den kleinsten Fall) direkt nachrechnen.</Vokabel>
              <Vokabel w="Annahme">"Angenommen, die Formel gilt für ein festes n" - das darfst du benutzen.</Vokabel>
              <Vokabel w="Schritt">aus der Annahme die Formel für n+1 herleiten.</Vokabel>
              <Vokabel w="Σ bis n+1">= (Σ bis n) + neues Glied. Hier setzt du die Annahme ein - das ist der Kniff.</Vokabel>
            </div>
            <MiniBeispiel>
              Behauptung: 1 + 2 + ... + n = <Frac num={<>n(n+1)</>} den="2" />. Anfang n = 1: links 1, rechts 1·2/2 = 1. ✓
              Schritt: Summe bis n+1 = <Frac num={<>n(n+1)</>} den="2" /> (Annahme) + (n+1) = <Frac num={<>(n+1)(n+2)</>} den="2" /> -
              genau die Formel mit n+1 statt n. ✓ Dieselbe Mechanik nutzt die Aufgabe für Σ(2k−1) = n².
            </MiniBeispiel>
          </Grundlagen>
          <div style={{ marginTop: 18 }}>
            <LösungsStepper
              blatt="hk24" nr="Bonus: Induktion"
              aufgabe={<>Zeige per vollständiger Induktion: &#8721;<sub>k=1</sub><sup>n</sup> (2k&minus;1) = n&sup2;.</>}
              schritte={[
                { formel: <>Induktionsanfang n=1: linke Seite = 2&middot;1&minus;1 = 1 = 1&sup2;. &#10003;</>,
                  warum: "Die Aussage für den kleinsten Fall (n=1) direkt nachrechnen - sie stimmt." },
                { formel: <>Induktionsannahme: &#8721;<sub>k=1</sub><sup>n</sup>(2k&minus;1) = n&sup2; gelte.</>,
                  warum: "Wir nehmen an, die Formel sei für ein beliebiges n schon wahr (Annahme), und schließen auf n+1." },
                { formel: <>Schritt n&rarr;n+1: &#8721;<sub>k=1</sub><sup>n+1</sup> = n&sup2; + (2(n+1)&minus;1)</>,
                  warum: "Die Summe bis n+1 = (Summe bis n, das ist n² nach Annahme) + das neue Glied für k=n+1." },
                { formel: <>= n&sup2; + 2n + 2 &minus; 1 = n&sup2; + 2n + 1</>,
                  warum: "Das neue Glied 2(n+1)-1 = 2n+1 ausrechnen und addieren.",
                  uebung: {
                    frage: <>Vereinfache das neue Glied selbst: 2(n+1) &minus; 1 = ?</>,
                    akzeptiert: ["2n+1"],
                    loesung: "2n + 1",
                    erklaerung: [
                      { formel: <>2(n+1) = 2n + 2</>, warum: "Klammer ausmultiplizieren." },
                      { formel: <>2n + 2 &minus; 1 = 2n + 1</>, warum: "Die −1 abziehen." },
                    ],
                  } },
                { formel: <><b>= (n+1)&sup2;</b> &#10003;</>,
                  warum: "Erste binomische Formel: n²+2n+1 = (n+1)² - genau die Behauptung für n+1. Induktion abgeschlossen." },
              ]}
            />
          </div>
          <QuizMC
            frage={<>Auf dem Intervall (−1; 1) gilt für die Glockenkurve x²−1 &lt; 0, also f'' &lt; 0. Wie ist die Kurve dort?</>}
            optionen={["konvex (Linkskrümmung)", "konkav (Rechtskrümmung)", "eine Gerade", "unstetig"]}
            richtigIndex={1}
            loesung={[
              { formel: <>f'' &lt; 0 ⇒ konkav.</>, warum: "Negative zweite Ableitung = Rechtskrümmung, die Kurve wölbt sich nach oben (Glockenscheitel)." },
              { formel: <>Bei x = ±1 wechselt f'' das Vorzeichen ⇒ Wendepunkte.</>, warum: "Außerhalb [−1, 1] wird x²−1 positiv ⇒ konvex." },
            ]}
          />
          <QuizMC
            frage={<>Was ist im Induktionsschritt der entscheidende Trick?</>}
            optionen={["Die Behauptung für n+1 einfach hinschreiben", "Die Summe bis n+1 in (Summe bis n) + neues Glied aufspalten und die Annahme einsetzen", "Den Anfang noch einmal prüfen", "n = ∞ einsetzen"]}
            richtigIndex={1}
            loesung={[
              { formel: <>Σ bis n+1 = (Σ bis n) + (neues Glied).</>, warum: "Nur so kommt die Induktionsannahme (Σ bis n = n²) ins Spiel." },
              { formel: <>n² + (2n+1) = (n+1)² ✓</>, warum: "Erste binomische Formel - genau die Behauptung für n+1." },
            ]}
          />
          <FalleCard>
            Bei der Induktion den <b>Induktionsschritt</b> nicht sauber von der <b>Annahme</b> trennen, oder die
            Annahme gar nicht benutzen. Der entscheidende Trick: die Summe bis n+1 in (Summe bis n) + (neues Glied) aufspalten
            und dann die Annahme n&sup2; einsetzen.
          </FalleCard>
        </Section>

        {/* ============ PRUEFUNGSSTRATEGIE ============ */}
        <Section id="strategie" kicker="Klausurtaktik" title="Prüfungsstrategie - 75 Minuten clever einteilen">
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.good, marginBottom: 10 }}>1. Sichere Punkte zuerst</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
                Erst die Typen, die du sicher beherrschst (oft Ableitungen, Folgen-Grenzwerte, Reihen). Schnelle Punkte
                holen, Selbstvertrauen aufbauen - nicht an Aufgabe 1 festbeißen.
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
        <Section id="zusammenfassung" kicker="Auf einen Blick" title="Aufgabentyp → Schlüsselmethode → typische Falle">
          <Card style={{ background: `${C.accent}0c`, borderColor: `${C.accent}33`, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: C.panel2, textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", color: C.accent, fontWeight: 700 }}>Typ</th>
                    <th style={{ padding: "10px 14px", color: C.accent2, fontWeight: 700 }}>Schlüsselmethode</th>
                    <th style={{ padding: "10px 14px", color: C.warn, fontWeight: 700 }}>Typische Falle</th>
                  </tr>
                </thead>
                <tbody style={{ color: C.dim }}>
                  {[
                    ["Unstetigkeit", "links-/rechtsseitigen Grenzwert vergleichen", "Oszillation vs. Polstelle verwechseln"],
                    ["Folgen-Grenzwerte", "höchste n-Potenz kürzen", "n/n = 1, nicht 0"],
                    ["Reihen", "Kriterium wählen (Leibniz/geom./harm.)", "1/n -> 0 heißt NICHT konvergent"],
                    ["Verkettung", "g(f(x)), Definitionsbereich von f", "Definitionsbereich vergessen"],
                    ["Grenzwert-Beweis", "Ableitungsdefinition", "Zirkelschluss mit L'Hospital"],
                    ["Ableitungen", "Ketten-/Produkt-/log. Ableitung", "innere Ableitung vergessen"],
                    ["L'Hospital", "Zähler & Nenner getrennt ableiten", "Quotientenregel statt getrennt"],
                    ["Taylorreihe", "f^(k)(0) / k! einsetzen", "Fakultät im Nenner vergessen"],
                    ["Integrale", "partielle Int. / Substitution", "+C vergessen, u falsch wählen"],
                    ["Uneigentl. Integral", "kritische Grenze als Limes", "Unbeschränktheit übersehen"],
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
        <Section id="glossar" kicker="Nachschlagen" title="Glossar - alle Begriffe & Symbole">
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px 28px" }}>
              <GlossEntry term="Unstetigkeit" def="Stelle, an der eine Funktion nicht durchgängig ist: hebbar, Sprung, Polstelle oder Oszillation." />
              <GlossEntry term="hebbare Unstetigkeit" def="Links- und rechtsseitiger Grenzwert gleich, nur der Funktionswert fehlt (Loch)." />
              <GlossEntry term="Sprungstelle" def="Links- und rechtsseitiger Grenzwert existieren, sind aber verschieden." />
              <GlossEntry term="Polstelle" def="Mindestens ein einseitiger Grenzwert ist +/- unendlich." />
              <GlossEntry term="Oszillation" def="Funktion schwingt unendlich oft, kein Grenzwert (z. B. sin(1/x) bei 0)." />
              <GlossEntry term="Grenzwert (lim)" def="Wert, dem sich eine Funktion/Folge nähert, wenn x bzw. n gegen etwas läuft." />
              <GlossEntry term="Konvergenz" def="Eine Folge/Reihe nähert sich einem festen, endlichen Wert." />
              <GlossEntry term="Divergenz" def="Eine Folge/Reihe nähert sich keinem endlichen Wert (wächst unbegrenzt oder pendelt)." />
              <GlossEntry term="Leibniz-Kriterium" def="Alternierende Reihe mit monoton fallender Nullfolge konvergiert." />
              <GlossEntry term="geometrische Reihe" def="Summe q^n; konvergiert genau dann, wenn |q| < 1 (Summe 1/(1-q))." />
              <GlossEntry term="harmonische Reihe" def="Summe 1/n; divergiert, obwohl die Glieder gegen 0 gehen." />
              <GlossEntry term="notwendiges Kriterium" def="Gehen die Glieder nicht gegen 0, divergiert die Reihe sicher." />
              <GlossEntry term="Verkettung (g∘f)" def="g(f(x)) - erst f, dann g; Reihenfolge beachten." />
              <GlossEntry term="Definitionsbereich" def="Menge aller x, für die die Funktion erlaubt ist (z. B. Radikand >= 0)." />
              <GlossEntry term="Umkehrfunktion (f⁻¹)" def="Macht f rückgängig; y=f(x) nach x auflösen, dann tauschen." />
              <GlossEntry term="L'Hospital" def="Bei 0/0 oder unendl./unendl.: Zähler und Nenner getrennt ableiten." />
              <GlossEntry term="Kettenregel" def="(f(g(x)))' = f'(g(x))*g'(x): äußere mal innere Ableitung." />
              <GlossEntry term="Produktregel" def="(u*v)' = u'v + uv'." />
              <GlossEntry term="logarithmische Ableitung" def="Bei x^x o. Ä.: erst ln nehmen, dann implizit ableiten." />
              <GlossEntry term="Taylorreihe" def="Näherung f(x) = Summe f^(k)(a)/k! * (x-a)^k; hier a=0." />
              <GlossEntry term="Fakultät (n!)" def="Produkt 1*2*...*n; 2!=2, 3!=6." />
              <GlossEntry term="partielle Integration" def="∫ u'v = uv − ∫ uv'; für Produkte." />
              <GlossEntry term="Substitution" def="Innere Funktion u setzen; ∫ f(g)g' dx = ∫ f(u) du." />
              <GlossEntry term="uneigentliches Integral" def="Integrand/Grenze unbeschränkt; kritische Grenze als Limes behandeln." />
              <GlossEntry term="Partialbruchzerlegung" def="Bruch in A/(x-a)+B/(x-b) zerlegen, dann einzeln integrieren." />
              <GlossEntry term="konkav" def="Rechtsgekrümmt, f'' < 0 ('nach unten geöffnet')." />
              <GlossEntry term="konvex" def="Linksgekrümmt, f'' > 0 ('nach oben geöffnet')." />
              <GlossEntry term="Wendepunkt" def="Stelle, an der die Krümmung wechselt (f'' = 0 mit Vorzeichenwechsel)." />
              <GlossEntry term="vollständige Induktion" def="Beweis: Anfang (n=1) + Schritt (n -> n+1) unter Nutzung der Annahme." />
              <GlossEntry term="ln" def="Natürlicher Logarithmus (Umkehrung der e-Funktion)." />
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
