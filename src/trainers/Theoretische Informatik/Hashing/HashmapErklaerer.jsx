import React, { useState, useEffect, useRef } from "react";

// ===================================================================
//  Hashmap-Erklärer — Theoretische Informatik II, Kap. 11: Hashing
//  Prof. Dr. Veronika Lesch, DHBW Mosbach
//  Animierter, anfängerfreundlicher Erklärer mit Visualisierungen
// ===================================================================

const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc",     // cyan – Schlüssel
  accent2: "#a78bfa",    // violett – Hashfunktion
  good: "#86efac",       // grün – Treffer/Slot belegt
  warn: "#fca5a5",       // rot – Kollision
  gold: "#fcd34d",       // gelb – Highlight
};

// kleine Helfer ----------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.15 }
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

// ===================================================================
//  VIS 1 — Die Grundidee: Schlüssel → Hashfunktion → Slot
// ===================================================================
function VisGrundidee() {
  const M = 7; // Tabellengröße (Primzahl, wie in VL empfohlen)
  const samples = [12, 25, 33, 5, 19];
  const [step, setStep] = useState(0); // wie viele schon eingefügt
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => (s >= samples.length ? 0 : s + 1));
    }, 1400);
    return () => clearInterval(t);
  }, [playing]);

  const table = Array.from({ length: M }, () => []);
  for (let i = 0; i < step && i < samples.length; i++) {
    table[samples[i] % M].push(samples[i]);
  }
  const active = step > 0 && step <= samples.length ? samples[step - 1] : null;
  const activeSlot = active != null ? active % M : null;

  return (
    <Card style={{ background: C.panel2 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center", justifyContent: "center" }}>
        {/* Schlüssel-Eingang */}
        <div style={{ textAlign: "center", minWidth: 120 }}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>Schlüssel k</div>
          <div
            key={active}
            style={{
              width: 70, height: 70, borderRadius: 14, background: C.accent, color: "#04212e",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800,
              margin: "0 auto", boxShadow: `0 0 24px ${C.accent}66`,
              animation: active != null ? "pop .4s ease" : "none",
            }}
          >
            {active ?? "–"}
          </div>
        </div>

        {/* Hashfunktion */}
        <div style={{ textAlign: "center", minWidth: 160 }}>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10 }}>Hashfunktion</div>
          <div style={{ background: C.panel, border: `1px solid ${C.accent2}`, borderRadius: 12, padding: "14px 16px", color: C.accent2, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
            h(k) = k mod {M}
          </div>
          {active != null && (
            <div style={{ marginTop: 10, fontSize: 14, color: C.text, fontFamily: "ui-monospace, monospace" }}>
              {active} mod {M} = <span style={{ color: C.gold, fontWeight: 800 }}>{active % M}</span>
            </div>
          )}
        </div>

        {/* Tabelle */}
        <div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 10, textAlign: "center" }}>Hashtabelle T[0..{M - 1}]</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {table.map((bucket, idx) => {
              const isActive = idx === activeSlot;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, textAlign: "right", color: C.dim, fontSize: 13, fontFamily: "ui-monospace, monospace" }}>{idx}</div>
                  <div
                    style={{
                      minWidth: 150, height: 36, borderRadius: 9, display: "flex", alignItems: "center", paddingLeft: 10, gap: 6,
                      background: isActive ? `${C.gold}22` : C.panel,
                      border: `1px solid ${isActive ? C.gold : C.line}`,
                      transition: "all .3s ease",
                    }}
                  >
                    {bucket.map((v) => (
                      <span key={v} style={{ background: bucket.length > 1 ? C.warn : C.good, color: "#0b1418", borderRadius: 7, padding: "3px 9px", fontWeight: 700, fontSize: 14 }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "center", marginTop: 22 }}>
        <button onClick={() => setPlaying((p) => !p)} style={btn}>{playing ? "⏸ Pause" : "▶ Abspielen"}</button>
        <button onClick={() => { setStep(0); }} style={btnGhost}>↺ Reset</button>
        <div style={{ display: "flex", gap: 16 }}>
          <Tag color={C.good}>1 Element im Slot</Tag>
          <Tag color={C.warn}>Kollision (≥2)</Tag>
        </div>
      </div>
    </Card>
  );
}

// ===================================================================
//  VIS 2 — Kollisionen: Verkettung vs. Offene Adressierung
// ===================================================================
function VisKollision() {
  const M = 7;
  const seq = [10, 17, 3, 24, 5]; // 10%7=3, 17%7=3 (Kollision!), 3%7=3, ...
  const [mode, setMode] = useState("chain"); // "chain" | "open"
  const [step, setStep] = useState(seq.length);

  // Verkettung: Bucket-Listen
  const chain = Array.from({ length: M }, () => []);
  // Offene Adressierung mit linearem Sondieren
  const open = Array.from({ length: M }, () => null);
  const openProbes = {}; // key -> finaler index

  for (let i = 0; i < step; i++) {
    const k = seq[i];
    chain[k % M].push(k);
    let j = k % M, tries = 0;
    while (open[j] !== null && tries < M) { j = (j + 1) % M; tries++; }
    if (open[j] === null) { open[j] = k; openProbes[k] = j; }
  }

  const lastKey = step > 0 ? seq[step - 1] : null;

  return (
    <Card style={{ background: C.panel2 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => setMode("chain")} style={mode === "chain" ? btn : btnGhost}>Verkettung</button>
        <button onClick={() => setMode("open")} style={mode === "open" ? btn : btnGhost}>Offene Adressierung</button>
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 22, flexWrap: "wrap" }}>
        {seq.map((k, i) => (
          <span key={i} style={{
            background: i < step ? C.accent : C.panel, color: i < step ? "#04212e" : C.dim,
            border: `1px solid ${i < step ? C.accent : C.line}`,
            borderRadius: 8, padding: "5px 11px", fontWeight: 700, fontSize: 14, transition: "all .25s",
          }}>{k}</span>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, maxWidth: 460, margin: "0 auto" }}>
        {Array.from({ length: M }).map((_, idx) => {
          if (mode === "chain") {
            const bucket = chain[idx];
            const hot = lastKey != null && lastKey % M === idx;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={slotIdx}>{idx}</div>
                <div style={{ ...slotBox, borderColor: hot ? C.gold : C.line, background: hot ? `${C.gold}1a` : C.panel }}>
                  {bucket.map((v, bi) => (
                    <React.Fragment key={v}>
                      {bi > 0 && <span style={{ color: C.dim, fontSize: 13 }}>→</span>}
                      <span style={{ background: bucket.length > 1 ? C.warn : C.good, color: "#0b1418", borderRadius: 7, padding: "3px 9px", fontWeight: 700, fontSize: 14 }}>{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          } else {
            const v = open[idx];
            const hot = v != null && v === lastKey;
            const collided = v != null && v % M !== idx; // landete nicht auf seinem Heim-Slot
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={slotIdx}>{idx}</div>
                <div style={{ ...slotBox, borderColor: hot ? C.gold : C.line, background: hot ? `${C.gold}1a` : C.panel }}>
                  {v != null && (
                    <span style={{ background: collided ? C.warn : C.good, color: "#0b1418", borderRadius: 7, padding: "3px 9px", fontWeight: 700, fontSize: 14 }}>
                      {v}{collided && <span style={{ fontSize: 11, marginLeft: 4, opacity: .8 }}>↩ verschoben</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.dim, lineHeight: 1.6, maxWidth: 520, margin: "20px auto 0" }}>
        {mode === "chain"
          ? "Jeder Slot ist eine Liste. Bei einer Kollision wird das Element einfach angehängt. Die Tabelle kann nie „voll“ werden."
          : "Ist der Heim-Slot belegt, wird per Sondierfolge der nächste freie Platz gesucht (hier: lineares Sondieren, +1). ⇒ Tabelle kann volllaufen, α ≤ 1."}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnGhost}>◀ Schritt</button>
        <button onClick={() => setStep((s) => Math.min(seq.length, s + 1))} style={btnGhost}>Schritt ▶</button>
        <button onClick={() => setStep(seq.length)} style={btn}>Alle einfügen</button>
        <button onClick={() => setStep(0)} style={btnGhost}>↺</button>
      </div>
    </Card>
  );
}

// ===================================================================
//  VIS 3 — Auslastung α und Laufzeit
// ===================================================================
function VisAuslastung() {
  const M = 12;
  const [n, setN] = useState(6);
  const alpha = (n / M).toFixed(2);

  // füllrate als belegte slots (vereinfacht: erste n slots)
  return (
    <Card style={{ background: C.panel2 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {Array.from({ length: M }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: 10,
                background: i < n ? C.good : C.panel,
                border: `1px solid ${i < n ? C.good : C.line}`,
                transition: "all .25s ease",
              }} />
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 220px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.dim }}>Auslastungsfaktor</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.gold, fontFamily: "ui-monospace, monospace", lineHeight: 1.1 }}>
            α = {alpha}
          </div>
          <div style={{ fontSize: 14, color: C.dim, fontFamily: "ui-monospace, monospace" }}>
            α = n / m = {n} / {M}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: C.text }}>
            Erwartete erfolglose Suche (Verkettung): <b style={{ color: C.accent }}>≈ {Number(alpha).toFixed(2)} Elemente</b>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <input type="range" min={0} max={M} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%", accentColor: C.accent }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.dim, marginTop: 6 }}>
          <span>leer (α=0)</span><span>n = {n} Elemente</span><span>voll (α=1)</span>
        </div>
      </div>
    </Card>
  );
}

// ===================================================================
//  Haupt-Komponente
// ===================================================================
export default function HashmapErklaerer() {
  return (
    <div style={{
      background: `radial-gradient(1200px 600px at 70% -10%, ${C.accent2}1a, transparent), radial-gradient(900px 500px at 10% 10%, ${C.accent}14, transparent), ${C.bg}`,
      color: C.text, minHeight: "100vh", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      padding: "0 0 80px",
    }}>
      <style>{`
        @keyframes pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        input[type=range]{ height: 6px; border-radius: 4px; }
      `}</style>

      {/* HERO */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 12, letterSpacing: 3, color: C.accent, fontWeight: 700, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 16px", marginBottom: 20 }}>
          THEORETISCHE INFORMATIK II · KAP. 11
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, margin: "0 0 16px", lineHeight: 1.05, letterSpacing: -1 }}>
          Was ist eine <span style={{ color: C.accent }}>Hashmap?</span>
        </h1>
        <p style={{ fontSize: 19, color: C.dim, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Eine <b style={{ color: C.text }}>Datenstruktur</b> (eine organisierte Art, Daten im Speicher abzulegen),
          die <b style={{ color: C.text }}>Einfügen, Suchen und Löschen</b> in
          <b style={{ color: C.text }}> erwartet O(1)</b> ermöglicht – also unabhängig davon, wie viele Daten gespeichert sind,
          praktisch in <i>konstanter</i> Zeit. Hier von Grund auf erklärt – mit Animationen.
          <br />
          <span style={{ fontSize: 14 }}>(Was „O(1)" genau bedeutet, klären wir gleich im ersten Abschnitt.)</span>
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>

        {/* 0 — Das Problem */}
        <Section kicker="Das Problem" title="Wozu überhaupt eine Hashmap?">
          <p style={{ marginTop: 0 }}>
            Stell dir ein <b style={{ color: C.text }}>Wörterbuch</b> vor: eine Sammlung von Daten, in der du drei Dinge tun willst –
            ein Element <b style={{ color: C.text }}>einfügen</b> (Insert), ein Element <b style={{ color: C.text }}>finden</b> (Search)
            und ein Element <b style={{ color: C.text }}>entfernen</b> (Delete).
          </p>
          <p>
            In einer normalen Liste musst du beim Suchen im schlimmsten Fall <i>alle</i> Elemente durchgehen → das kostet Θ(n) Zeit
            (dazu gleich mehr). Die Idee der Hashmap: <b style={{ color: C.accent }}>Berechne aus dem Schlüssel direkt die Position</b>, an der das Element liegt.
            Dann brauchst du im Idealfall <b style={{ color: C.text }}>keine Suche</b> – du springst direkt hin.
          </p>

          <InfoBox title="Kurz erklärt: O-Notation (Landau-Symbole)">
            <p style={{ marginTop: 0 }}>
              Mit der <b style={{ color: C.text }}>O-Notation</b> beschreibt man, <i>wie stark der Aufwand wächst</i>, wenn die Datenmenge
              wächst. Dabei steht <b style={{ color: C.text }}>n</b> für die <b style={{ color: C.text }}>Anzahl der gespeicherten Elemente</b>.
            </p>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, lineHeight: 1.8 }}>
              <li><b style={{ color: C.good }}>O(1)</b> = <i>konstante</i> Zeit: gleich schnell, egal ob 10 oder 10 Millionen Elemente.</li>
              <li><b style={{ color: C.warn }}>Θ(n)</b> = <i>lineare</i> Zeit: doppelt so viele Elemente → doppelt so lange. (Θ = „Theta", O = „groß O".)</li>
              <li><b style={{ color: C.text }}>n = O(m)</b> heißt: n wächst höchstens so schnell wie die Tabellengröße m – beide bleiben in derselben Größenordnung.</li>
            </ul>
            <p style={{ marginBottom: 0 }}>
              <b style={{ color: C.text }}>„erwartet"</b> meint den <i>Durchschnittsfall</i> (was typischerweise passiert),
              der <b style={{ color: C.text }}>„schlimmste Fall"</b> ist das ungünstigste mögliche Szenario.
            </p>
          </InfoBox>
          <Card style={{ marginTop: 18, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>Liste / Array durchsuchen</div>
              <div style={{ fontSize: 14, color: C.dim }}>„Ist 25 dabei?" → Element für Element prüfen. Bis zu n Vergleiche.</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: C.good, fontWeight: 700, marginBottom: 6 }}>Hashmap</div>
              <div style={{ fontSize: 14, color: C.dim }}>„Wo liegt 25?" → h(25) ausrechnen → direkt zum Slot. Ein Sprung.</div>
            </div>
          </Card>
        </Section>

        {/* 1 — Grundidee */}
        <Section kicker="Die Kernidee" title="Schlüssel → Hashfunktion → Slot">
          <p style={{ marginTop: 0 }}>
            Eine Hashmap ist ein <b style={{ color: C.text }}>Array</b> (eine durchnummerierte Reihe von Speicherplätzen –
            hier die <i>Hashtabelle</i> T) mit <b style={{ color: C.text }}>m</b> Plätzen (m = die Tabellengröße), genannt
            <b style={{ color: C.text }}> Slots</b> oder <b style={{ color: C.text }}>Buckets</b> (engl. für „Fächer"). Eine
            <b style={{ color: C.accent2 }}> Hashfunktion h</b> rechnet aus jedem <b style={{ color: C.text }}>Schlüssel k</b>
            (engl. <i>key</i>, der Wert, nach dem man sucht) eine Zahl zwischen 0 und m−1 aus – das ist der Slot-Index.
          </p>
          <p>
            Das einfachste Beispiel aus der Vorlesung ist die <b style={{ color: C.text }}>Divisionsmethode</b>:
            <span style={{ fontFamily: "ui-monospace, monospace", color: C.gold }}> h(k) = k mod m</span>.
            Dabei ist <b style={{ color: C.text }}>mod</b> (gesprochen „modulo") der <b style={{ color: C.text }}>Rest, der bei der
            ganzzahligen Division</b> von k durch m übrig bleibt – z.&nbsp;B. 17 mod 7 = 3, weil 17 = 2·7 + 3.
            Dieser Rest liegt immer zwischen 0 und m−1 – passt also perfekt als Index.
            Schau zu, wie fünf Schlüssel eingefügt werden:
          </p>
          <div style={{ marginTop: 20 }}><VisGrundidee /></div>
        </Section>

        {/* 2 — Kollisionen */}
        <Section kicker="Das zentrale Problem" title="Kollisionen – wenn zwei Schlüssel denselben Slot wollen">
          <p style={{ marginTop: 0 }}>
            Das <b style={{ color: C.text }}>Universum U</b> – die Menge <i>aller theoretisch möglichen</i> Schlüssel – ist meist viel
            größer als die Menge <b style={{ color: C.text }}>K</b> der gerade tatsächlich benutzten Schlüssel. In Symbolen:
            <b style={{ color: C.text }}> |U| ≫ |K|</b>. Dabei bedeuten die senkrechten Striche <b style={{ color: C.text }}>|·|</b> die
            „Anzahl der Elemente einer Menge", und <b style={{ color: C.text }}>≫</b> heißt <i>„ist sehr viel größer als"</i>.
            Weil U so groß ist, <i>müssen</i> manchmal zwei verschiedene Schlüssel auf denselben Slot abgebildet werden – das nennt man eine
            <b style={{ color: C.warn }}> Kollision</b>. Beispiel: 10 mod 7 = 3 und 17 mod 7 = 3.
          </p>
          <p>Es gibt zwei Hauptstrategien, damit umzugehen:</p>
          <ul style={{ lineHeight: 1.8 }}>
            <li><b style={{ color: C.text }}>Hashing mit Verkettung:</b> Jeder Slot ist eine <b style={{ color: C.text }}>verkettete Liste</b> (eine Kette von Elementen, bei der jedes auf das nächste zeigt). Kollidierende Elemente werden einfach angehängt.</li>
            <li><b style={{ color: C.text }}>Offene Adressierung:</b> Alle Elemente liegen direkt in der Tabelle. Bei Kollision sucht eine <i>Sondierfolge</i> (eine festgelegte Reihenfolge von Ausweich-Slots) den nächsten freien Platz.</li>
          </ul>
          <div style={{ marginTop: 20 }}><VisKollision /></div>
        </Section>

        {/* 3 — Gute Hashfunktion */}
        <Section kicker="Qualität" title="Was macht eine gute Hashfunktion aus?">
          <p style={{ marginTop: 0 }}>
            Eine gute Hashfunktion verteilt die Schlüssel <b style={{ color: C.text }}>möglichst gleichmäßig</b> über alle Slots –
            so kommt man der Idealannahme nahe und vermeidet Häufungen. Diese Idealannahme heißt
            <b style={{ color: C.text }}> „einfaches uniformes Hashing"</b>: die Vorstellung, dass jeder Schlüssel mit gleicher
            Wahrscheinlichkeit in jedem Slot landet (gleichmäßig = „uniform"). In der Praxis nie ganz erreichbar, aber das Ziel.
          </p>
          <Card style={{ marginTop: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Divisionsmethode" formula="h(k) = k mod m"
                note="Einfach & schnell. Wichtig: m als Primzahl wählen (Zahl, die nur durch 1 und sich selbst teilbar ist), fern von Zweierpotenzen (2, 4, 8, 16, …) – sonst beeinflussen nur die untersten Stellen der Binärdarstellung (die Bits, also die 0/1-Ziffern) das Ergebnis und Muster werden schlecht aufgelöst." />
              <MethodRow color={C.accent2} name="Multiplikationsmethode" formula="h(k) = ⌊m · (k·A mod 1)⌋"
                note="Die Klammern ⌊ ⌋ bedeuten „abrunden auf die nächste ganze Zahl“; (k·A mod 1) ist der Nachkomma-Anteil von k·A. A ist eine feste Konstante mit 0 < A < 1, bewährt ist A ≈ (√5−1)/2 ≈ 0,618 (√ = Wurzel; das ist der Goldene Schnitt). Vorteil: m frei wählbar (auch Zweierpotenz), sehr schnell berechenbar." />
            </div>
          </Card>
        </Section>

        {/* 4 — Sondierfolgen */}
        <Section kicker="Offene Adressierung im Detail" title="Drei Arten zu sondieren">
          <p style={{ marginTop: 0 }}>
            Bei offener Adressierung legt die <b style={{ color: C.text }}>Sondierfolge</b> ⟨h(k,0), h(k,1), …⟩ fest,
            welche Slots in welcher Reihenfolge probiert werden. Der zweite Parameter
            <b style={{ color: C.text }}> i</b> ist dabei der <b style={{ color: C.text }}>Versuchszähler</b>: i = 0 ist der erste
            (bevorzugte) Slot, i = 1 der erste Ausweich-Slot usw. <b style={{ color: C.text }}>h₀</b> und
            <b style={{ color: C.text }}> h₁</b> sind „gewöhnliche" Hilfs-Hashfunktionen (die tiefgestellten Zahlen
            unterscheiden sie nur), und <b style={{ color: C.text }}>c₁, c₂</b> sind frei gewählte Konstanten.
          </p>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <MethodRow color={C.accent} name="Lineares Sondieren" formula="h(k,i) = (h₀(k) + i) mod m"
                note="Einfach: Bei Belegung einfach einen Slot weiter (+1). Aber es bilden sich schnell große zusammenhängende Blöcke belegter Slots → das nennt man primäres Clustering (Cluster = Häufung) → hohe Suchzeit." />
              <MethodRow color={C.gold} name="Quadratisches Sondieren" formula="h(k,i) = (h₀(k) + c₁i + c₂i²) mod m"
                note="Die Sprünge wachsen quadratisch (i² = i·i), das vermeidet primäres Clustering. Aber: Zwei Schlüssel mit gleichem Start-Hash h₀ durchlaufen dieselbe Folge → sekundäres Clustering." />
              <MethodRow color={C.good} name="Doppeltes Hashing" formula="h(k,i) = (h₀(k) + i·h₁(k)) mod m"
                note="Beste Streuung: Die Folge hängt über h₀ und h₁ zweifach vom Schlüssel k ab. Bedingung: ggT(h₁(k), m) = 1 – ggT ist der „größte gemeinsame Teiler“; = 1 bedeutet teilerfremd (keine gemeinsamen Teiler außer 1), nur dann werden alle Slots genau einmal erreicht." />
            </div>
          </Card>
        </Section>

        {/* 5 — Auslastung */}
        <Section kicker="Analyse" title="Auslastung α und warum O(1) gilt">
          <p style={{ marginTop: 0 }}>
            Der <b style={{ color: C.gold }}>Auslastungsfaktor α</b> (der griechische Buchstabe „alpha") <b style={{ color: C.gold }}>= n/m</b>
            ist das Verhältnis von gespeicherten Elementen <b style={{ color: C.text }}>n</b> zur Tabellengröße <b style={{ color: C.text }}>m</b>.
            Beispiel: 6 Elemente in 12 Slots → α = 0,5 (Tabelle halb voll).
            Bei Verkettung ist α gerade die <b style={{ color: C.text }}>durchschnittliche Länge einer Kette</b>.
          </p>
          <p>
            Solange n = O(m) bleibt (also α konstant), laufen alle Operationen in <b style={{ color: C.accent }}>erwartet O(1)</b>.
            Probier aus, wie sich α verändert:
          </p>
          <div style={{ marginTop: 20 }}><VisAuslastung /></div>
        </Section>

        {/* 6 — Zusammenfassung */}
        <Section kicker="Auf einen Blick" title="Zusammenfassung">
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.accent, marginBottom: 10 }}>Verkettung</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
                <li>funktioniert für n ∈ O(m)</li>
                <li>erfolglos: erwartet α</li>
                <li>erfolgreich: erwartet 1 + α/2</li>
                <li>Listenoperationen können langsam sein</li>
              </ul>
            </Card>
            <Card style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 800, color: C.good, marginBottom: 10 }}>Offene Adressierung</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
                <li>nur für n ≤ m (α ≤ 1)</li>
                <li>erfolglos: ≤ 1/(1−α)</li>
                <li>erfolgreich: ≤ (1/α)·ln(1/(1−α))</li>
                <li>langsam, wenn n ≈ m</li>
              </ul>
            </Card>
          </div>
          <p style={{ fontSize: 13, color: C.dim, marginTop: 12 }}>
            In den Formeln ist <b style={{ color: C.text }}>ln</b> der <i>natürliche Logarithmus</i> (Umkehrung der
            e-Potenz) – er sorgt dafür, dass die Suchzeit nur sehr langsam wächst, solange die Tabelle nicht fast voll ist (α nahe 1).
          </p>
          <Card style={{ marginTop: 18, background: `${C.accent}10`, borderColor: `${C.accent}44` }}>
            <b style={{ color: C.text }}>Kernaussage:</b> <span style={{ color: C.dim }}>
              Eine Hashmap tauscht Speicher gegen Geschwindigkeit. Mit einer guten Hashfunktion und konstantem α
              werden Insert, Search und Delete erwartet O(1) – im schlimmsten Fall aber Θ(n).
            </span>
          </Card>
        </Section>

        {/* 7 — Glossar */}
        <Section kicker="Nachschlagen" title="Glossar – alle Begriffe & Symbole auf einen Blick">
          <p style={{ marginTop: 0 }}>
            Falls dir unterwegs ein Kürzel oder Zeichen unklar war – hier ist alles kompakt gesammelt:
          </p>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px 28px" }}>
              <GlossEntry term="Schlüssel (key) k" def="Der Wert, nach dem gesucht wird und aus dem die Position berechnet wird." />
              <GlossEntry term="Hashfunktion h" def="Rechnet aus einem Schlüssel k einen Slot-Index zwischen 0 und m−1 aus." />
              <GlossEntry term="Hashtabelle T" def="Das zugrunde liegende Array mit m Plätzen, in dem die Daten liegen." />
              <GlossEntry term="Slot / Bucket" def="Ein einzelner Platz (Fach) der Hashtabelle." />
              <GlossEntry term="m" def="Tabellengröße – die Anzahl der Slots." />
              <GlossEntry term="n" def="Anzahl der aktuell gespeicherten Elemente." />
              <GlossEntry term="mod (modulo)" def="Rest der ganzzahligen Division, z. B. 17 mod 7 = 3." />
              <GlossEntry term="Kollision" def="Zwei verschiedene Schlüssel werden auf denselben Slot abgebildet." />
              <GlossEntry term="Universum U" def="Menge aller theoretisch möglichen Schlüssel." />
              <GlossEntry term="K" def="Menge der gerade tatsächlich benutzten Schlüssel." />
              <GlossEntry term="|·|" def="Anzahl der Elemente einer Menge (z. B. |U|)." />
              <GlossEntry term="≫" def="„ist sehr viel größer als“." />
              <GlossEntry term="Verkettung" def="Kollisions-Strategie: jeder Slot ist eine verkettete Liste, Kollisionen werden angehängt." />
              <GlossEntry term="Offene Adressierung" def="Kollisions-Strategie: bei Belegung wird per Sondierfolge ein anderer freier Slot gesucht." />
              <GlossEntry term="Sondierfolge" def="Festgelegte Reihenfolge ⟨h(k,0), h(k,1), …⟩, in der Slots probiert werden." />
              <GlossEntry term="i" def="Versuchszähler in der Sondierfolge (0 = erster Versuch)." />
              <GlossEntry term="h₀, h₁" def="Hilfs-Hashfunktionen; die tiefgestellten Zahlen unterscheiden sie nur." />
              <GlossEntry term="Clustering" def="Häufung belegter Slots; primär = zusammenhängende Blöcke, sekundär = gleiche Sondierfolge." />
              <GlossEntry term="ggT" def="Größter gemeinsamer Teiler. ggT = 1 ⇒ teilerfremd." />
              <GlossEntry term="Auslastung α" def="α = n/m, Füllgrad der Tabelle; bei Verkettung mittlere Kettenlänge." />
              <GlossEntry term="O(1)" def="Konstanter Aufwand – unabhängig von der Datenmenge." />
              <GlossEntry term="Θ(n)" def="Linearer Aufwand – wächst proportional zu n." />
              <GlossEntry term="O(m)" def="„n = O(m)“: n wächst höchstens so schnell wie m." />
              <GlossEntry term="erwartet / schlimmster Fall" def="Durchschnittsfall vs. ungünstigstes mögliches Szenario." />
              <GlossEntry term="Primzahl" def="Nur durch 1 und sich selbst teilbar (2, 3, 5, 7, 11, …)." />
              <GlossEntry term="Zweierpotenz" def="2, 4, 8, 16, … – als m für die Divisionsmethode ungünstig." />
              <GlossEntry term="Bit" def="Eine 0/1-Ziffer der Binärdarstellung einer Zahl." />
              <GlossEntry term="⌊ ⌋" def="Abrunden auf die nächste ganze Zahl (Gauß-Klammer)." />
              <GlossEntry term="√" def="Wurzel; z. B. √5 ≈ 2,236." />
              <GlossEntry term="ln" def="Natürlicher Logarithmus (Umkehrung der e-Potenz)." />
              <GlossEntry term="uniformes Hashing" def="Idealannahme: jeder Schlüssel landet gleich wahrscheinlich in jedem Slot." />
            </div>
          </Card>
        </Section>

        <footer style={{ textAlign: "center", color: C.dim, fontSize: 13, paddingTop: 24, borderTop: `1px solid ${C.line}` }}>
          Angelehnt an Kap. 11 „Hashing" · Prof. Dr. Veronika Lesch · DHBW Mosbach
        </footer>
      </main>
    </div>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{
      background: `${C.accent2}12`, border: `1px solid ${C.accent2}44`, borderRadius: 14,
      padding: "16px 20px", margin: "18px 0", fontSize: 15, color: C.text, lineHeight: 1.7,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: C.accent2, marginBottom: 8 }}>
        <span aria-hidden style={{ fontSize: 16 }}>💡</span> {title}
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
          <code style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 7, padding: "3px 9px", color: color, fontSize: 13 }}>{formula}</code>
        </div>
        <div style={{ fontSize: 14, color: C.dim, marginTop: 6, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

const btn = {
  background: C.accent, color: "#04212e", border: "none", borderRadius: 10,
  padding: "9px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10,
  padding: "9px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer",
};
const slotIdx = { width: 22, textAlign: "right", color: C.dim, fontSize: 13, fontFamily: "ui-monospace, monospace" };
const slotBox = { flex: 1, minHeight: 36, borderRadius: 9, display: "flex", alignItems: "center", paddingLeft: 10, gap: 6, border: `1px solid ${C.line}`, background: C.panel, transition: "all .3s ease" };