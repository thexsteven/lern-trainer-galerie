import React, { useState } from "react";

// VL11 – Hashing: Übersicht aller Verfahren
// DHBW Mosbach · Theoretische Informatik · Prof. Dr. Veronika Lesch

const C = {
  bg: "#0d1117",
  panel: "#151b24",
  panel2: "#1b2330",
  line: "#2a3441",
  text: "#e6edf3",
  dim: "#8b97a7",
  accent: "#7ee787",
  accent2: "#ffa657",
  accent3: "#79c0ff",
  accent4: "#d2a8ff",
  danger: "#ff7b72",
};

const mono = "'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace";
const serif = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";

function Section({ children }) {
  return <div style={{ marginBottom: 28 }}>{children}</div>;
}

function Card({ accent, k, titel, children, formel, eigenschaften }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 14,
        cursor: "pointer",
        transition: "transform .12s ease, background .12s ease",
      }}
      onClick={() => setOpen((o) => !o)}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.panel2)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.panel)}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ color: accent, fontFamily: mono, fontSize: 13, fontWeight: 700 }}>{k}</span>
        <span style={{ fontWeight: 600, fontSize: 18, color: C.text }}>{titel}</span>
        <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13 }}>{open ? "−" : "+"}</span>
      </div>
      {formel && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 14,
            color: C.accent3,
            marginTop: 10,
            background: "#0b0f15",
            padding: "8px 12px",
            borderRadius: 6,
            border: `1px solid ${C.line}`,
            overflowX: "auto",
          }}
        >
          {formel}
        </div>
      )}
      {open && (
        <div style={{ marginTop: 14, color: C.text, fontSize: 14.5, lineHeight: 1.65 }}>
          {children}
          {eigenschaften && (
            <ul style={{ margin: "10px 0 0", paddingLeft: 20, color: C.dim }}>
              {eigenschaften.map((e, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        padding: "40px 24px 60px",
        fontFamily: serif,
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 18, marginBottom: 28 }}>
          <div style={{ color: C.accent, fontFamily: mono, fontSize: 12, letterSpacing: 2 }}>
            VL11 · THEORETISCHE INFORMATIK
          </div>
          <h1 style={{ fontSize: 34, margin: "8px 0 6px", fontWeight: 700 }}>Hashing — alle Verfahren</h1>
          <div style={{ color: C.dim, fontSize: 14, fontFamily: mono }}>
            Hashtabelle T[0..m−1] · Auslastungsfaktor α = n/m · zum Aufklappen klicken
          </div>
        </div>

        {/* Grundidee */}
        <Section>
          <div
            style={{
              background: C.panel2,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "16px 20px",
              fontSize: 14.5,
              lineHeight: 1.65,
            }}
          >
            <b style={{ color: C.accent2 }}>Grundidee.</b> Eine Hashfunktion <span style={{ fontFamily: mono }}>h: U → {"{0,…,m−1}"}</span> bildet
            Schlüssel aus einem großen Universum U auf wenige Tabellenplätze ab. Da |U| ≫ m, sind <b>Kollisionen</b>
            {" "}(zwei Schlüssel → gleicher Platz) unvermeidbar. Die Verfahren unterscheiden sich darin, (1) <i>wie h berechnet</i> wird
            und (2) <i>wie Kollisionen aufgelöst</i> werden.
          </div>
        </Section>

        {/* 1. Hashfunktionen */}
        <h2 style={{ fontSize: 15, fontFamily: mono, color: C.accent2, letterSpacing: 1, marginBottom: 4 }}>
          ① BERECHNUNG VON h — Hashfunktionen
        </h2>
        <Card
          accent={C.accent2}
          k="1.1"
          titel="Divisionsmethode"
          formel="h(k) = k mod m"
          eigenschaften={[
            "Sehr schnell zu berechnen.",
            "m sollte KEINE Zweierpotenz sein — sonst hängt h nur von den niederwertigsten Bits ab.",
            "Gute Wahl: m = Primzahl, fern von einer Zweierpotenz.",
          ]}
        >
          Der Schlüssel wird durch m geteilt, der Rest ist der Hashwert. Bei m = 2^p würde h nur die letzten p
          Bits von k betrachten — Muster in den Daten würden nicht aufgelöst.
        </Card>
        <Card
          accent={C.accent2}
          k="1.2"
          titel="Multiplikationsmethode"
          formel="h(k) = ⌊ m · (k·A mod 1) ⌋,  0 < A < 1"
          eigenschaften={[
            "k·A mod 1 = gebrochener Anteil von k·A.",
            "Wahl von m relativ beliebig — auch Zweierpotenz erlaubt.",
            "Gute Konstante: A ≈ (√5 − 1)/2 (goldener Schnitt, nach Knuth).",
            "Schnell: bei m = 2^p per Bit-Shift berechenbar.",
          ]}
        >
          k wird mit A multipliziert, nur der Nachkommaanteil verwendet und mit m skaliert. Vorteil gegenüber der
          Divisionsmethode: die Wahl von m ist unkritisch.
        </Card>

        {/* 2. Kollisionsauflösung */}
        <h2 style={{ fontSize: 15, fontFamily: mono, color: C.accent3, letterSpacing: 1, margin: "26px 0 4px" }}>
          ② KOLLISIONSAUFLÖSUNG
        </h2>
        <Card
          accent={C.accent3}
          k="2.1"
          titel="Hashing mit Verkettung (Chaining)"
          formel="T[h(k)] → verkettete Liste aller Schlüssel mit diesem Hashwert"
          eigenschaften={[
            "Funktioniert auch für n > m (α kann > 1 sein).",
            "Erwartete Suchzeit: erfolglos 1 + α,  erfolgreich 1 + α/2  (einfaches uniformes Hashing).",
            "Nachteil: Listenoperationen sind langsam, Zeiger-Overhead.",
            "Suchzeit O(1) erwartet, solange α konstant.",
          ]}
        >
          Jeder Tabellenplatz zeigt auf eine verkettete Liste. Kollidierende Schlüssel werden einfach an die Liste
          angehängt. Die Tabelle kann nie „überlaufen“.
        </Card>

        <div
          style={{
            background: C.panel2,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "14px 18px",
            margin: "4px 0 14px",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <b style={{ color: C.accent4 }}>Offene Adressierung.</b> Alle Elemente werden <i>direkt</i> in der Tabelle gespeichert
          ⇒ kein Zeiger-Overhead, aber die Tabelle kann volllaufen ⇒ <span style={{ fontFamily: mono }}>α ≤ 1</span>. Statt einer
          festen Position erzeugt jeder Schlüssel eine <b>Sondierfolge</b> ⟨h(k,0), h(k,1), …, h(k,m−1)⟩ — idealerweise eine
          Permutation aller Plätze. Die drei Sondiermethoden:
        </div>

        <Card
          accent={C.accent4}
          k="2.2"
          titel="Lineares Sondieren"
          formel="h(k,i) = (h₀(k) + i) mod m"
          eigenschaften={[
            "Sehr einfach.",
            "Problem: primäres Clustering — es bilden sich schnell große zusammenhängende Blöcke besetzter Plätze.",
            "⇒ hohe durchschnittliche Suchzeit.",
            "Nur m verschiedene Sondierfolgen möglich.",
          ]}
        >
          Bei Kollision wird einfach der nächste Platz geprüft, dann der übernächste usw. (zyklisch mod m).
        </Card>
        <Card
          accent={C.accent4}
          k="2.3"
          titel="Quadratisches Sondieren"
          formel="h(k,i) = (h₀(k) + c₁·i + c₂·i²) mod m"
          eigenschaften={[
            "Vermeidet primäres Clustering.",
            "Problem: sekundäres Clustering — gleiche h₀(k) ⇒ identische Sondierfolge.",
            "m, c₁, c₂ müssen zusammenpassen, sonst werden nicht alle Plätze besucht.",
            "Nur m verschiedene Sondierfolgen möglich.",
          ]}
        >
          Der Abstand vom Startplatz wächst quadratisch. Dadurch werden große Blöcke aufgebrochen, aber Schlüssel
          mit gleichem Startwert laufen weiterhin dieselbe Folge ab.
        </Card>
        <Card
          accent={C.accent4}
          k="2.4"
          titel="Doppeltes Hashing (Double Hashing)"
          formel="h(k,i) = (h₁(k) + i·h₂(k)) mod m"
          eigenschaften={[
            "Sondierfolge hängt ZWEIFACH vom Schlüssel ab ⇒ kein sekundäres Clustering.",
            "Potentiell bis zu m² verschiedene Sondierfolgen.",
            "Bedingung: h₂(k) und m müssen teilerfremd sein (ggT = 1), sonst werden nicht alle Plätze besucht.",
            "Praxis: m = Primzahl & 0 < h₂(k) < m,  ODER  m = 2^p & h₂ stets ungerade.",
          ]}
        >
          Die Schrittweite zwischen Sondierungen wird selbst per zweiter Hashfunktion h₂ aus dem Schlüssel
          berechnet — verschiedene Schlüssel mit gleichem Startplatz nehmen daher verschiedene Wege.
        </Card>

        {/* 3. Analyse-Modell */}
        <h2 style={{ fontSize: 15, fontFamily: mono, color: C.accent, letterSpacing: 1, margin: "26px 0 4px" }}>
          ③ ANALYSE-MODELL
        </h2>
        <Card
          accent={C.accent}
          k="3.1"
          titel="Uniformes Hashing (Annahme, kein eigenes Verfahren)"
          formel="erfolglos ≤ 1/(1−α)   ·   erfolgreich ≤ (1/α)·ln(1/(1−α))"
          eigenschaften={[
            "Idealisierte Annahme: jede der m! Permutationen ist als Sondierfolge gleich wahrscheinlich.",
            "Dient zur Laufzeitanalyse der offenen Adressierung.",
            "Folgerung: Suche dauert erwartet O(1), falls α konstant.",
          ]}
        >
          Kein konkretes Hashverfahren, sondern eine Annahme für die Average-Case-Analyse. Liefert die obigen
          Schranken für die erwartete Anzahl an Tabellenzugriffen bei offener Adressierung.
        </Card>

        {/* Vergleich */}
        <h2 style={{ fontSize: 15, fontFamily: mono, color: C.dim, letterSpacing: 1, margin: "26px 0 10px" }}>
          ④ ZUSAMMENFASSUNG
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, fontFamily: mono }}>
            <thead>
              <tr style={{ color: C.dim, textAlign: "left" }}>
                <th style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}` }}></th>
                <th style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}`, color: C.accent3 }}>Verkettung</th>
                <th style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}`, color: C.accent4 }}>Offene Adressierung</th>
              </tr>
            </thead>
            <tbody style={{ color: C.text }}>
              {[
                ["Speicherung", "verkettete Listen", "direkt in der Tabelle"],
                ["Auslastung α", "n ∈ O(m), α > 1 ok", "n ≤ m, also α ≤ 1"],
                ["erfolglose Suche", "1 + α", "1/(1−α)"],
                ["erfolgreiche Suche", "1 + α/2", "(1/α)·ln(1/(1−α))"],
                ["Schwäche", "Listen langsam", "langsam wenn n ≈ m"],
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}`, color: C.dim }}>{r[0]}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}` }}>{r[1]}</td>
                  <td style={{ padding: "8px 10px", borderBottom: `1px solid ${C.line}` }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 30, color: C.dim, fontSize: 12.5, fontFamily: mono, textAlign: "center" }}>
          VL11 Hashing · Divisions- & Multiplikationsmethode · Verkettung · lineares / quadratisches Sondieren · doppeltes Hashing · uniformes Hashing
        </div>
      </div>
    </div>
  );
}
