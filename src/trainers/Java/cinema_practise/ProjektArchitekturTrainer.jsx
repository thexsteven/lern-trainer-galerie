import React, { useState, useEffect, useRef } from "react";

/*
  Lern-Trainer: „Das ganze Projekt verstehen" — Kino-Ticketsystem
  ---------------------------------------------------------------
  Ein animierter Erklärer für die OOP-Abgabe „Ticketsystem eines Kinos"
  (Java 25 LTS · Lombok · Gradle). Er liefert zwei Dinge:
    1) einen ÜBERBLICK über die 12 Aufgabenteile und 41 Konzepte der Spezifikation,
       jeweils mit den konkreten Klassen, die sie umsetzen, und
    2) einen ABLAUFTRAINER, der jede Projektdatei Zeile für Zeile erklärt.
  Self-contained: nur React + Inline-Styles, keine externen Libraries.
*/

// ---------------------------------------------------------------------------
// Design-System (Dark Theme). Nur accent / accent2 sind thematisch gewählt.
// ---------------------------------------------------------------------------
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#7dd3fc", // cyan    – steht für STRUKTUR / Service-Logik / Code
  accent2: "#a78bfa", // violett – steht für KONZEPTE / Domänenmodell / Prinzipien
  good: "#86efac", // grün  – Erfolg/Treffer
  warn: "#fca5a5", // rot   – Problem/Fehler
  gold: "#fcd34d", // gelb  – Highlight
};

// Farbcodierung der drei Quell-Pakete + Build-Schicht
const LAYER = {
  build: "#94a3b8", // grau    – Build & Konfiguration (Gradle, referenz.md)
  model: C.accent2, // violett – Domänenmodell  (com.cinema.model)
  service: C.accent, // cyan   – Anwendungslogik (com.cinema.service)
  app: C.good, // grün         – Demo & Einstieg (com.cinema.app)
};
const LAYER_LABEL = {
  build: "Build / Konfiguration",
  model: "model — Domänenmodell",
  service: "service — Anwendungslogik",
  app: "app — Demo / Einstieg",
};

// ---------------------------------------------------------------------------
// Keyframes / globale Animationen
// ---------------------------------------------------------------------------
const STYLE = `
@keyframes pop {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 0 0 rgba(252,211,77,0.0); }
  50%     { box-shadow: 0 0 0 4px rgba(252,211,77,0.25); }
}
.pop { animation: pop .3s ease-out both; }
*::selection { background: ${C.accent}; color: #06121a; }
html { scroll-behavior: smooth; }
`;

// ---------------------------------------------------------------------------
// useReveal — IntersectionObserver-Hook für sanftes Einblenden beim Scrollen
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setShown(true);
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

// ---------------------------------------------------------------------------
// Wiederverwendbare Bausteine
// ---------------------------------------------------------------------------
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
          color: C.accent,
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", lineHeight: 1.2 }}>{title}</h2>
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
        gap: 6,
        fontSize: 12.5,
        color: C.dim,
        marginRight: 14,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(167,139,250,0.08)",
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
          fontSize: 14,
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>💡</span>
        {title}
      </div>
      <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color = C.accent, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderTop: `1px solid ${C.line}` }}>
      <div style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: color, minHeight: 38 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{name}</span>
          {formula && (
            <code
              style={{
                background: C.bg,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 12.5,
                color: color,
              }}
            >
              {formula}
            </code>
          )}
        </div>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

// Button-Styles
const btn = {
  background: C.accent,
  color: "#06121a",
  border: "none",
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};
const btnGhost = {
  background: "transparent",
  color: C.text,
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: "9px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

// Kleiner Player-Steuerblock (▶/⏸, Schritt, Reset) — von allen Vis genutzt
function PlayerControls({ playing, setPlaying, onPrev, onNext, onReset, atStart, atEnd, label }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>
        {playing ? "⏸ Pause" : "▶ Abspielen"}
      </button>
      <button style={{ ...btnGhost, opacity: atStart ? 0.4 : 1 }} onClick={onPrev} disabled={atStart}>
        ◀ Schritt
      </button>
      <button style={{ ...btnGhost, opacity: atEnd ? 0.4 : 1 }} onClick={onNext} disabled={atEnd}>
        Schritt ▶
      </button>
      <button style={btnGhost} onClick={onReset}>
        ↺ Reset
      </button>
      {label && <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>{label}</span>}
    </div>
  );
}

// ===========================================================================
// VIS 1 — Aufgaben- & Konzept-Trainer: läuft durch die 12 Teile der Spezifikation
// ===========================================================================
const TEILE = [
  {
    n: 1,
    title: "Domänenmodell & Kapselung",
    ziel: "Striktes Klassendesign: alles privat, alles unveränderlich, sofort geprüft.",
    konzepte: ["private final (Kapselung)", "kein Setter", "Fast-Fail (requireNonNull)", "Normalisierung (strip/toUpperCase)"],
    klassen: ["alle Klassen", "z. B. Seat", "Auditorium"],
  },
  {
    n: 2,
    title: "Records & Enums",
    ziel: "Den richtigen Bautyp wählen: Wert (record) vs. feste Auswahl (enum).",
    konzepte: ["record + Compact Constructor", "reiches Enum (Felder+Methoden)", "einfaches Enum"],
    klassen: ["Address", "ContactInfo", "FilmCategory", "AgeRating"],
  },
  {
    n: 3,
    title: "Vererbung & sealed",
    ziel: "Eine geschlossene, dem Compiler bekannte Klassen-Hierarchie.",
    konzepte: ["sealed abstract + permits", "final Subklassen + super(...)", "final-Methode schützt Vertrag"],
    klassen: ["Ticket", "StandardTicket", "PremiumTicket"],
  },
  {
    n: 4,
    title: "Abstrakte Klasse & Interface",
    ziel: "Abstrakter Zustand (Klasse) vs. reiner Fähigkeitsvertrag (Interface).",
    konzepte: ["abstract class mit Zustand", "statisches Feld + statische Methode", "@FunctionalInterface", "Regex-Validator"],
    klassen: ["Customer", "RegisteredCustomer", "Validator", "EmailValidator"],
  },
  {
    n: 5,
    title: "Konstruktoren",
    ziel: "Single Point of Validation: Primär validiert, Convenience delegiert.",
    konzepte: ["Primärkonstruktor", "Convenience-Konstruktor", "Delegation per this(...)"],
    klassen: ["Movie", "Screening", "BookingService"],
  },
  {
    n: 6,
    title: "Komposition & Aggregation",
    ziel: "Besitz- und Lebenszyklus-Beziehungen UML-konform modellieren.",
    konzepte: ["Komposition ◆ (intern erzeugt, exklusiv)", "Aggregation ◇ (von außen, unabhängig)"],
    klassen: ["Auditorium→Seat", "Booking→BookingReference", "Screening→Movie/Auditorium"],
  },
  {
    n: 7,
    title: "equals/hashCode & Defensive Copy",
    ziel: "Drei Strategien für Wertgleichheit + Schutz vor Manipulation von außen.",
    konzepte: ["manuell (instanceof)", "Lombok (of, callSuper)", "record (implizit)", "Defensive Copy List.copyOf"],
    klassen: ["Seat", "Movie", "Customer", "Ticket-Subklassen", "Booking"],
  },
  {
    n: 8,
    title: "Polymorphismus & Pattern Matching",
    ziel: "Dynamic Dispatch, exhaustives switch und generische Varianz (PECS).",
    konzepte: ["Basistyp als Parameter", "switch ohne default", "Text Block @Override", "Generics: Invarianz/Kovarianz/Kontravarianz"],
    klassen: ["TicketAnalytics", "RegisteredCustomer"],
  },
  {
    n: 9,
    title: "HAS-A, Exceptions, Datentypen",
    ziel: "Komposition über Vererbung, Fehlerbehandlung und korrekte Datentypen.",
    konzepte: ["HAS-A statt IS-A", "Checked Exception (2 Konstruktoren)", "throws & try-catch", "BigDecimal", "java.time", "Regex", "var"],
    klassen: ["BookingService", "ValidationException"],
  },
  {
    n: 10,
    title: "Lombok-Integration",
    ziel: "Boilerplate gezielt reduzieren — ohne Kontrollverlust.",
    konzepte: ["@Getter", "@EqualsAndHashCode (of, callSuper)", "@RequiredArgsConstructor (Enum)", "@Builder (auf Konstruktor!)"],
    klassen: ["FilmCategory", "PremiumTicket", "diverse"],
  },
  {
    n: 11,
    title: "Demo-Klasse",
    ziel: "Nachweis der funktionierenden Gesamtintegration in einer main-Methode.",
    konzepte: ["main()", "alle Objekte instanziieren", "Builder", "Polymorphie", "try-catch", "statischer Zähler", "formatForDisplay()"],
    klassen: ["CinemaDemo"],
  },
  {
    n: 12,
    title: "Javadoc, QA & referenz.md",
    ziel: "Professionelle Dokumentation und reflektierte Qualitätskontrolle.",
    konzepte: ["Javadoc", "KI-gestützte Qualitätssicherung", "Referenzdokument"],
    klassen: ["alle (Javadoc)", "referenz.md"],
  },
];

function ConceptTrainerVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= TEILE.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(timer.current);
  }, [playing]);

  const t = TEILE[i];
  return (
    <Card>
      {/* Fortschritts-Leiste der 12 Teile */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}>
        {TEILE.map((x, idx) => {
          const on = idx === i;
          const done = idx < i;
          return (
            <button
              key={x.n}
              onClick={() => setI(idx)}
              title={x.title}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12.5,
                border: `1px solid ${on ? C.gold : C.line}`,
                background: on ? C.gold : done ? "rgba(134,239,172,0.16)" : C.panel2,
                color: on ? "#06121a" : done ? C.good : C.dim,
                transition: "all .3s",
              }}
            >
              {x.n}
            </button>
          );
        })}
      </div>

      <div key={i} className="pop" style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.accent2 }}>
            Teil {t.n}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{t.title}</span>
        </div>
        <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6, marginBottom: 16 }}>🎯 {t.ziel}</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          <div style={{ flex: "1 1 240px", minWidth: 220 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              Konzepte
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {t.konzepte.map((k, idx) => (
                <div
                  key={idx}
                  className="pop"
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.line}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    color: C.text,
                  }}
                >
                  {k}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 180 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.dim, fontWeight: 700, marginBottom: 8 }}>
              Umgesetzt in
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {t.klassen.map((k, idx) => (
                <code
                  key={idx}
                  style={{
                    background: "rgba(125,211,252,0.10)",
                    border: `1px solid ${C.accent}`,
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 12,
                    color: C.accent,
                  }}
                >
                  {k}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PlayerControls
        playing={playing}
        setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(TEILE.length - 1, v + 1))}
        onReset={() => {
          setI(0);
          setPlaying(false);
        }}
        atStart={i === 0}
        atEnd={i === TEILE.length - 1}
        label={`Teil ${t.n} / 12`}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.gold}>aktueller Teil</Tag>
        <Tag color={C.good}>erledigt</Tag>
        <Tag color={C.accent2}>Konzept</Tag>
        <Tag color={C.accent}>Klasse</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 2 — Projekt-Explorer: läuft animiert durch jede Datei des Projekts
// ===========================================================================
const TREE = [
  { depth: 0, kind: "folder", layer: "build", name: "cinema-ticketsystem/", role: "Projektwurzel: kompilierbares Gradle-Projekt mit allen Quellen und dem Referenzdokument." },
  { depth: 1, kind: "file", layer: "build", name: "build.gradle.kts", role: "Bau-Rezept: Java-25-Toolchain, Lombok (compileOnly + annotationProcessor), application-Plugin mit mainClass = CinemaDemo, UTF-8." },
  { depth: 1, kind: "file", layer: "build", name: "settings.gradle.kts", role: 'Legt den Projektnamen fest: rootProject.name = "cinema-ticketsystem".' },
  { depth: 1, kind: "file", layer: "build", name: "referenz.md", role: "Referenzdokument (Teil 12): erklärt alle 41 Konzepte mit Klassenzuordnung, Klassendiagramm, Checkliste und QA-Protokoll." },
  { depth: 1, kind: "folder", layer: "build", name: "src/main/java/com/cinema/", role: "Wurzel-Paket des Produktivcodes, in drei fachliche Pakete geschnitten." },
  { depth: 2, kind: "folder", layer: "model", name: "model/", role: "Domänenmodell: die Kino-Begriffe selbst. Reine Daten + Regeln, keine Ein-/Ausgabe." },
  { depth: 3, kind: "file", layer: "model", name: "Address.java", role: "record: unveränderliche Postadresse. Compact Constructor normalisiert (strip) und validiert (Teil 2, 7)." },
  { depth: 3, kind: "file", layer: "model", name: "ContactInfo.java", role: "record: E-Mail + Telefon. Prüft die E-Mail mit einem private static final Pattern (Regex, Teil 9)." },
  { depth: 3, kind: "file", layer: "model", name: "FilmCategory.java", role: "Reiches Enum mit Preis-Multiplikator (BigDecimal). @Getter + @RequiredArgsConstructor (Teil 2, 10)." },
  { depth: 3, kind: "file", layer: "model", name: "AgeRating.java", role: "Einfaches Enum (FSK) mit einem Feld minimumAge — bewusst ohne Lombok geschrieben (Teil 2)." },
  { depth: 3, kind: "file", layer: "model", name: "Seat.java", role: "Sitzplatz. MANUELLES equals()/hashCode() mit instanceof-Pattern-Matching (Teil 7)." },
  { depth: 3, kind: "file", layer: "model", name: "Auditorium.java", role: "Kinosaal. KOMPOSITION ◆: erzeugt seine Seat-Objekte selbst per new im Konstruktor (Teil 6)." },
  { depth: 3, kind: "file", layer: "model", name: "Movie.java", role: "Film. Lombok-equals mit Business Key (of), Primär- + Convenience-Konstruktor, Duration (Teil 5, 7)." },
  { depth: 3, kind: "file", layer: "model", name: "Screening.java", role: "Vorstellung. AGGREGATION ◇: Movie + Auditorium von außen. LocalDateTime, DateTimeFormatter (Teil 6, 9)." },
  { depth: 3, kind: "file", layer: "model", name: "Ticket.java", role: "sealed abstract Basistyp, permits Standard/Premium. Abstrakte + finale Methode (Teil 3)." },
  { depth: 3, kind: "file", layer: "model", name: "StandardTicket.java", role: "final Subklasse, ruft super(...), @EqualsAndHashCode(callSuper = true) (Teil 3, 7)." },
  { depth: 3, kind: "file", layer: "model", name: "PremiumTicket.java", role: "final Subklasse mit @Builder auf dem KONSTRUKTOR — der Builder umgeht die Validierung nicht (Teil 10)." },
  { depth: 3, kind: "file", layer: "model", name: "BookingReference.java", role: "Buchungsreferenz: das Teil, das Booking intern per new erzeugt (Komposition-Partner)." },
  { depth: 3, kind: "file", layer: "model", name: "Booking.java", role: "Buchung. DEFENSIVE COPY der Ticket-Liste via List.copyOf, Komposition + Aggregation (Teil 6, 7)." },
  { depth: 3, kind: "file", layer: "model", name: "Customer.java", role: "abstract class mit STATISCHEM Zähler (AtomicLong) + statischer Methode + abstrakter formatForDisplay (Teil 4)." },
  { depth: 3, kind: "file", layer: "model", name: "RegisteredCustomer.java", role: "Konkrete final Subklasse. Implementiert formatForDisplay() mit TEXT BLOCK, nutzt LocalDate + Period (Teil 8)." },
  { depth: 2, kind: "folder", layer: "service", name: "service/", role: "Anwendungslogik: validieren, buchen, auswerten. Verbindet die Domänen-Objekte." },
  { depth: 3, kind: "file", layer: "service", name: "ValidationException.java", role: "Eigene Checked Exception (extends Exception) mit zwei überladenen Konstruktoren (Teil 9)." },
  { depth: 3, kind: "file", layer: "service", name: "Validator.java", role: "@FunctionalInterface: eine einzige Methode validate(T) throws ... (Teil 4)." },
  { depth: 3, kind: "file", layer: "service", name: "EmailValidator.java", role: "implements Validator<String>: Regex-Prüfung per private static final Pattern (Teil 4, 9)." },
  { depth: 3, kind: "file", layer: "service", name: "BookingService.java", role: "HAS-A: hält einen Validator (Komposition über Vererbung). Primär+Convenience, throws, Exception-Wrapping (Teil 9)." },
  { depth: 3, kind: "file", layer: "service", name: "TicketAnalytics.java", role: "Polymorphie + exhaustives switch + Generics (Invarianz/Kovarianz/Kontravarianz, PECS) (Teil 8)." },
  { depth: 2, kind: "folder", layer: "app", name: "app/", role: "Demo-Schicht: der Einstiegspunkt des Programms." },
  { depth: 3, kind: "file", layer: "app", name: "CinemaDemo.java", role: "final class mit main(): instanziiert alles, zeigt Builder, Polymorphie, try-catch, BigDecimal, Text Block (Teil 11)." },
];

function ProjectExplorerVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= TREE.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(timer.current);
  }, [playing]);

  const active = TREE[i];
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {/* Baum */}
        <div
          style={{
            flex: "1 1 330px",
            background: C.bg,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 12,
            fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            fontSize: 12.5,
            maxHeight: 460,
            overflow: "auto",
          }}
        >
          {TREE.map((n, idx) => {
            const on = idx === i;
            const col = LAYER[n.layer];
            return (
              <div
                key={idx}
                onClick={() => setI(idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 6px",
                  marginLeft: n.depth * 14,
                  borderRadius: 6,
                  cursor: "pointer",
                  background: on ? "rgba(252,211,77,0.14)" : "transparent",
                  outline: on ? `1px solid ${C.gold}` : "1px solid transparent",
                  color: on ? C.text : n.kind === "folder" ? C.text : C.dim,
                  transition: "background .3s, outline .3s",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                <span style={{ fontWeight: n.kind === "folder" ? 700 : 400 }}>
                  {n.kind === "folder" ? "📁 " : ""}
                  {n.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detail */}
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div className="pop" key={i} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: LAYER[active.layer] }} />
              <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: LAYER[active.layer], fontWeight: 700 }}>
                {LAYER_LABEL[active.layer]}
              </span>
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700, marginBottom: 10, color: C.text }}>
              {active.name}
            </div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{active.role}</div>
          </div>
          <div style={{ marginTop: 14, color: C.dim, fontSize: 13 }}>
            Eintrag {i + 1} / {TREE.length}
          </div>
        </div>
      </div>

      <PlayerControls
        playing={playing}
        setPlaying={setPlaying}
        onPrev={() => setI((v) => Math.max(0, v - 1))}
        onNext={() => setI((v) => Math.min(TREE.length - 1, v + 1))}
        onReset={() => {
          setI(0);
          setPlaying(false);
        }}
        atStart={i === 0}
        atEnd={i === TREE.length - 1}
      />

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={LAYER.build}>Build</Tag>
        <Tag color={LAYER.model}>model</Tag>
        <Tag color={LAYER.service}>service</Tag>
        <Tag color={LAYER.app}>app</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 3 — AblaufTrainer: liest jede Datei Zeile für Zeile
//   Jede Datei trägt ihren echten Quelltext (String.raw, damit \\ und """
//   unverändert bleiben). Die Schritte zeigen per "mark" (eindeutiger
//   Teilstring) auf die erklärte Zeile — robust ohne Zeilennummern-Zählen.
// ===========================================================================
const FILES = [
  // ----- model ------------------------------------------------------------
  {
    pkg: "model",
    layer: "model",
    name: "Address.java",
    teil: "Teil 1 · 2 · 7",
    code: String.raw`
package com.cinema.model;

import java.util.Objects;

/**
 * Immutable postal address of a cinema location.
 * Modelled as a record (pure value object) with automatic equals/hashCode.
 */
public record Address(String street, String city, String postalCode) {

    public Address {
        Objects.requireNonNull(street, "street must not be null");
        Objects.requireNonNull(city, "city must not be null");
        Objects.requireNonNull(postalCode, "postalCode must not be null");
        street = street.strip();
        city = city.strip();
        postalCode = postalCode.strip();
        if (street.isBlank() || city.isBlank() || postalCode.isBlank()) {
            throw new IllegalArgumentException("address components must not be blank");
        }
    }

    public String oneLine() {
        return "%s, %s %s".formatted(street, postalCode, city);
    }
}
`,
    steps: [
      { mark: "package com.cinema.model;", note: "Paket-Deklaration: Die Datei gehört zum Domänenmodell-Paket (model). Pakete sind Ordner, die zusammengehörige Klassen bündeln." },
      { mark: "import java.util.Objects;", note: "Import: Objects bringt requireNonNull(...) mit — eine Hilfsmethode für Null-Prüfungen." },
      { mark: "public record Address(", note: "record = unveränderlicher Wertträger. Die Komponenten in Klammern werden automatisch zu private-final-Feldern samt Gettern, equals(), hashCode() und toString() (Teil 2 & 7)." },
      { mark: "public Address {", note: "Compact Constructor (kompakter Konstruktor): die einzige Stelle für Validierung und Normalisierung eines records. Keine Parameterliste, kein this. — nötig." },
      { mark: 'requireNonNull(street', note: "Fast-Fail (Teil 1): Bei null fliegt sofort eine NullPointerException — kein halb-gültiges Objekt kann entstehen." },
      { mark: "street = street.strip();", note: "Normalisierung (Teil 1): strip() entfernt führende/abschließende Leerzeichen. So kann der Aufrufer keine inkonsistenten Werte einschleusen." },
      { mark: "if (street.isBlank()", note: "isBlank() ist true, wenn der String leer ist oder nur Leerzeichen enthält. Leere Pflichtfelder werden abgelehnt." },
      { mark: "throw new IllegalArgumentException", note: "Ungültige (nicht-null, aber leere) Werte → IllegalArgumentException. Damit ist jedes Address-Objekt nach Konstruktion garantiert gültig." },
      { mark: "public String oneLine()", note: 'Zusatz-Methode: rendert die Adresse als eine Zeile. "%s, %s %s".formatted(...) ist Java-String-Formatierung (Teil 9).' },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "ContactInfo.java",
    teil: "Teil 2 · 9",
    code: String.raw`
package com.cinema.model;

import java.util.Objects;
import java.util.regex.Pattern;

/** Immutable contact details (e-mail + phone) of a customer. */
public record ContactInfo(String email, String phone) {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$");

    public ContactInfo {
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(phone, "phone must not be null");
        email = email.strip().toLowerCase();
        phone = phone.strip();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("malformed e-mail address: " + email);
        }
        if (phone.isBlank()) {
            throw new IllegalArgumentException("phone must not be blank");
        }
    }
}
`,
    steps: [
      { mark: "import java.util.regex.Pattern;", note: "Pattern ist Javas Klasse für reguläre Ausdrücke (Regex) — ein Muster, gegen das man Texte prüft." },
      { mark: "public record ContactInfo(", note: "Zweiter record (Teil 2 verlangt mindestens zwei): reine Kontaktdaten." },
      { mark: "private static final Pattern EMAIL_PATTERN", note: "static final Pattern (Teil 9 & 12): Das Regex-Muster wird genau EINMAL kompiliert und von allen Objekten geteilt — effizient." },
      { mark: 'Pattern.compile("^[\\w.+-]+@', note: "Das Muster: ^ Anfang, [\\w.+-]+ ein/mehr Wortzeichen, dann @, Domain und Punkt. \\\\w steht im Java-Quelltext für die Zeichenklasse \\w (Buchstabe/Ziffer/_)." },
      { mark: "email = email.strip().toLowerCase();", note: "Doppelte Normalisierung: strip() + toLowerCase(). E-Mails sind groß-/kleinschreibungs-unabhängig, also vereinheitlichen." },
      { mark: "if (!EMAIL_PATTERN.matcher(email).matches())", note: "matcher(email).matches(): prüft, ob die ganze E-Mail dem Muster entspricht. Wenn nicht → Exception." },
      { mark: "if (phone.isBlank())", note: "Auch das Telefon darf nicht leer sein. Damit ist auch dieser record nach Konstruktion garantiert konsistent." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "FilmCategory.java",
    teil: "Teil 2 · 10",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/** Film category with a category-specific price multiplier. */
@Getter
@RequiredArgsConstructor
public enum FilmCategory {

    BLOCKBUSTER("Blockbuster", new BigDecimal("1.20")),
    STANDARD("Standard", new BigDecimal("1.00")),
    ARTHOUSE("Art-house", new BigDecimal("0.90")),
    CLASSIC("Classic", new BigDecimal("0.80"));

    private final String displayName;
    private final BigDecimal priceMultiplier;

    public BigDecimal applyTo(BigDecimal basePrice) {
        return basePrice.multiply(priceMultiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
`,
    steps: [
      { mark: "@Getter", note: "Lombok @Getter (Teil 10): erzeugt zur Compile-Zeit getDisplayName() und getPriceMultiplier() — kein Boilerplate im Quelltext." },
      { mark: "@RequiredArgsConstructor", note: "Lombok @RequiredArgsConstructor (Teil 10): erzeugt den (privaten) Enum-Konstruktor für die final-Felder, in deren Reihenfolge." },
      { mark: "public enum FilmCategory", note: "Reiches Enum (Teil 2): eine feste Menge von Konstanten, aber MIT Feldern, Konstruktor und Methoden." },
      { mark: 'BLOCKBUSTER("Blockbuster", new BigDecimal("1.20"))', note: "Jede Konstante übergibt ihre Werte an den Konstruktor. new BigDecimal(\"1.20\") nutzt den String-Konstruktor (Teil 9) — exakt, ohne Gleitkomma-Fehler." },
      { mark: "private final BigDecimal priceMultiplier;", note: "Der Preis-Faktor als Feld. BigDecimal statt double, weil Geldbeträge exakt sein müssen." },
      { mark: "public BigDecimal applyTo(BigDecimal basePrice)", note: "Verhalten im Enum: multipliziert den Basispreis mit dem Faktor." },
      { mark: "setScale(2, RoundingMode.HALF_UP)", note: "setScale(2, HALF_UP): erzwingt 2 Nachkommastellen und kaufmännische Rundung (Teil 9) — ein Geldbetrag hat immer Cent-Genauigkeit." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "AgeRating.java",
    teil: "Teil 2",
    code: String.raw`
package com.cinema.model;

/** Age rating of a film — the simpler enum, written without Lombok. */
public enum AgeRating {

    FSK0(0), FSK6(6), FSK12(12), FSK16(16), FSK18(18);

    private final int minimumAge;

    AgeRating(int minimumAge) {
        this.minimumAge = minimumAge;
    }

    public int getMinimumAge() {
        return minimumAge;
    }

    public boolean admits(int age) {
        return age >= minimumAge;
    }
}
`,
    steps: [
      { mark: "public enum AgeRating", note: "Das zweite, EINFACHERE Enum (Teil 2). Bewusst ohne Lombok — zum Kontrast mit FilmCategory, damit man beide Varianten sieht." },
      { mark: "FSK0(0), FSK6(6)", note: "Fünf Konstanten, jede mit ihrem Mindestalter als Argument für den Konstruktor." },
      { mark: "private final int minimumAge;", note: "Das eine Feld, das Teil 2 für das einfache Enum verlangt." },
      { mark: "AgeRating(int minimumAge)", note: "Hier von Hand geschrieben (statt Lombok): der private Enum-Konstruktor, der das Feld setzt." },
      { mark: "public int getMinimumAge()", note: "Getter ebenfalls von Hand — zeigt, was Lombok bei FilmCategory automatisch generiert." },
      { mark: "public boolean admits(int age)", note: "Kleine Fachmethode: prüft, ob ein Alter zugelassen ist." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Seat.java",
    teil: "Teil 1 · 7",
    code: String.raw`
package com.cinema.model;

import java.util.Objects;

import lombok.Getter;

/** A single physical seat in an auditorium, e.g. A12. */
@Getter
public final class Seat {

    private final String rowLabel;
    private final int seatNumber;

    public Seat(String rowLabel, int seatNumber) {
        Objects.requireNonNull(rowLabel, "rowLabel must not be null");
        var normalized = rowLabel.strip().toUpperCase();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("rowLabel must not be blank");
        }
        if (seatNumber <= 0) {
            throw new IllegalArgumentException("seatNumber must be positive");
        }
        this.rowLabel = normalized;
        this.seatNumber = seatNumber;
    }

    public String label() {
        return rowLabel + seatNumber;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        return obj instanceof Seat other
                && seatNumber == other.seatNumber
                && rowLabel.equals(other.rowLabel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rowLabel, seatNumber);
    }

    @Override
    public String toString() {
        return "Seat " + label();
    }
}
`,
    steps: [
      { mark: "public final class Seat", note: "final class (Teil 1): von dieser Klasse kann niemand mehr erben — eine abgeschlossene Implementierung." },
      { mark: "private final String rowLabel;", note: "Kapselung + Immutability (Teil 1): privat und final. Nach dem Konstruktor unveränderbar, kein Setter." },
      { mark: "var normalized = rowLabel.strip().toUpperCase();", note: "var (Teil 9): lokale Typ-Inferenz — der Typ String ist aus der rechten Seite klar. Normalisierung: strip + toUpperCase (z. B. ' a ' → 'A')." },
      { mark: "if (seatNumber <= 0)", note: "Fachliche Validierung: eine Sitznummer muss positiv sein." },
      { mark: "public String label()", note: "Liefert die kompakte Bezeichnung, z. B. 'A12'." },
      { mark: "public boolean equals(Object obj)", note: "MANUELLES equals (Teil 7): die erste der drei equals-Strategien." },
      { mark: "if (this == obj)", note: "Schnell-Abkürzung: dasselbe Objekt ist immer gleich (Referenzgleichheit)." },
      { mark: "obj instanceof Seat other", note: "instanceof-Pattern-Matching (modernes Java): prüft den Typ UND bindet die Variable 'other' in einem Schritt — kein expliziter Cast nötig." },
      { mark: "public int hashCode()", note: "Objects.hash(...) nutzt EXAKT dieselben Felder wie equals (rowLabel, seatNumber). Das ist der equals/hashCode-Vertrag (Teil 7)." },
      { mark: 'return "Seat " + label();', note: "@Override toString() (Teil 8): lesbare Darstellung statt Seat@1a2b3c." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Auditorium.java",
    teil: "Teil 6 · KOMPOSITION ◆",
    code: String.raw`
package com.cinema.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import lombok.Getter;

/** A cinema auditorium with a fixed grid of seats. */
@Getter
public final class Auditorium {

    private final String name;
    private final List<Seat> seats;

    public Auditorium(String name, int rowCount, int seatsPerRow) {
        Objects.requireNonNull(name, "name must not be null");
        var normalized = name.strip();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        if (rowCount <= 0 || rowCount > 26) {
            throw new IllegalArgumentException("rowCount must be between 1 and 26");
        }
        if (seatsPerRow <= 0) {
            throw new IllegalArgumentException("seatsPerRow must be positive");
        }
        this.name = normalized;

        var built = new ArrayList<Seat>();
        for (var row = 0; row < rowCount; row++) {
            var rowLabel = String.valueOf((char) ('A' + row));
            for (var nr = 1; nr <= seatsPerRow; nr++) {
                built.add(new Seat(rowLabel, nr)); // composition: part created internally
            }
        }
        this.seats = List.copyOf(built);
    }

    public int capacity() {
        return seats.size();
    }

    public Seat seatAt(int index) {
        return seats.get(index);
    }

    @Override
    public String toString() {
        return "Auditorium '%s' (%d seats)".formatted(name, capacity());
    }
}
`,
    steps: [
      { mark: "private final List<Seat> seats;", note: "Der Saal HAT eine Liste von Sitzen — das 'Teil' der Komposition (Teil 6)." },
      { mark: "public Auditorium(String name, int rowCount, int seatsPerRow)", note: "Der Konstruktor bekommt nur die Maße — NICHT fertige Sitze. Den Rest erledigt der Saal selbst." },
      { mark: "if (rowCount <= 0 || rowCount > 26)", note: "Grenze 1–26, weil die Reihen mit Buchstaben A–Z beschriftet werden." },
      { mark: "var built = new ArrayList<Seat>();", note: "Eine Arbeitsliste, in die der Saal seine Sitze einsammelt." },
      { mark: "for (var row = 0; row < rowCount; row++)", note: "Äußere Schleife über die Reihen." },
      { mark: "var rowLabel = String.valueOf((char) ('A' + row));", note: "Reihen-Buchstabe: 'A'+0='A', 'A'+1='B' … Zeichen-Arithmetik in Java." },
      { mark: "built.add(new Seat(rowLabel, nr));", note: "KERN DER KOMPOSITION ◆: Der Saal erzeugt jeden Seat selbst per new. Die Sitze gehören exklusiv diesem Saal und teilen seinen Lebenszyklus." },
      { mark: "this.seats = List.copyOf(built);", note: "List.copyOf macht die Liste unveränderlich — niemand von außen kann Sitze hinzufügen/entfernen." },
      { mark: "public Seat seatAt(int index)", note: "Lesender Zugriff auf einen Sitz per Index — von der Demo und den Analytics genutzt." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Movie.java",
    teil: "Teil 5 · 7",
    code: String.raw`
package com.cinema.model;

import java.time.Duration;
import java.time.Year;
import java.util.Objects;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/** A film that can be shown in one or more screenings. */
@Getter
@EqualsAndHashCode(of = {"title", "releaseYear"})
public final class Movie {

    private final String title;
    private final String director;
    private final Duration runtime;
    private final FilmCategory category;
    private final AgeRating ageRating;
    private final int releaseYear;

    // primary constructor — the single point of validation
    public Movie(String title, String director, Duration runtime,
                 FilmCategory category, AgeRating ageRating, int releaseYear) {
        this.title = requireText(title, "title");
        this.director = requireText(director, "director");
        this.runtime = Objects.requireNonNull(runtime, "runtime must not be null");
        if (runtime.isZero() || runtime.isNegative()) {
            throw new IllegalArgumentException("runtime must be positive");
        }
        this.category = Objects.requireNonNull(category, "category must not be null");
        this.ageRating = Objects.requireNonNull(ageRating, "ageRating must not be null");
        if (releaseYear < 1888) {
            throw new IllegalArgumentException("releaseYear is implausible: " + releaseYear);
        }
        this.releaseYear = releaseYear;
    }

    // convenience constructor — defaults + delegation, NO validation of its own
    public Movie(String title, Duration runtime, FilmCategory category, AgeRating ageRating) {
        this(title, "Unknown", runtime, category, ageRating, Year.now().getValue());
    }

    private static String requireText(String value, String field) {
        Objects.requireNonNull(value, field + " must not be null");
        var stripped = value.strip();
        if (stripped.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return stripped;
    }

    @Override
    public String toString() {
        return "%s (%d, %s)".formatted(title, releaseYear, category.getDisplayName());
    }
}
`,
    steps: [
      { mark: '@EqualsAndHashCode(of = {"title", "releaseYear"})', note: "Lombok-equals mit BUSINESS KEY (Teil 7): Zwei Filme gelten als gleich, wenn Titel UND Erscheinungsjahr übereinstimmen — egal, was sonst gespeichert ist." },
      { mark: "private final Duration runtime;", note: "Duration aus java.time (Teil 9): eine Zeitspanne (die Filmlänge), nicht ein Zeitpunkt." },
      { mark: "public Movie(String title, String director, Duration runtime,", note: "PRIMÄRKONSTRUKTOR (Teil 5): alle Parameter, vollständige Validierung — der Single Point of Validation." },
      { mark: "if (runtime.isZero() || runtime.isNegative())", note: "Eine Filmlänge muss positiv sein." },
      { mark: "if (releaseYear < 1888)", note: "1888 ist das Jahr des ersten Films überhaupt — alles davor ist unplausibel." },
      { mark: "public Movie(String title, Duration runtime, FilmCategory category, AgeRating ageRating)", note: "CONVENIENCE-KONSTRUKTOR (Teil 5): weniger Parameter, sinnvolle Defaults. Das ist auch OVERLOADING (Teil 9) — gleicher Name, andere Parameterliste." },
      { mark: 'this(title, "Unknown", runtime, category, ageRating, Year.now().getValue());', note: "DELEGATION per this(...): ruft den Primärkonstruktor mit Defaults auf. Hier KEINE eigene Validierung — die passiert nur im Primär. Year.now() liefert das aktuelle Jahr (java.time)." },
      { mark: "private static String requireText(String value, String field)", note: "Private Hilfsmethode, damit sich die Null-/Leer-Prüfung nicht wiederholt (DRY-Prinzip: Don't Repeat Yourself)." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Screening.java",
    teil: "Teil 5 · 6 · 9 · AGGREGATION ◇",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

import lombok.Getter;

/** A concrete screening of a movie in an auditorium at a point in time. */
@Getter
public final class Screening {

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private final Movie movie;
    private final Auditorium auditorium;
    private final LocalDateTime startTime;
    private final BigDecimal basePrice;
    private final String language;

    public Screening(Movie movie, Auditorium auditorium, LocalDateTime startTime,
                     BigDecimal basePrice, String language) {
        this.movie = Objects.requireNonNull(movie, "movie must not be null");
        this.auditorium = Objects.requireNonNull(auditorium, "auditorium must not be null");
        this.startTime = Objects.requireNonNull(startTime, "startTime must not be null");
        Objects.requireNonNull(basePrice, "basePrice must not be null");
        if (basePrice.signum() <= 0) {
            throw new IllegalArgumentException("basePrice must be positive");
        }
        this.basePrice = basePrice.setScale(2, RoundingMode.HALF_UP);
        Objects.requireNonNull(language, "language must not be null");
        var normalized = language.strip().toUpperCase();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("language must not be blank");
        }
        this.language = normalized;
    }

    public Screening(Movie movie, Auditorium auditorium, LocalDateTime startTime, BigDecimal basePrice) {
        this(movie, auditorium, startTime, basePrice, "OV");
    }

    public LocalDateTime endTime() {
        return startTime.plus(movie.getRuntime());
    }

    public BigDecimal categoryAdjustedPrice() {
        return movie.getCategory().applyTo(basePrice);
    }

    public String formattedStart() {
        return startTime.format(TIME_FORMAT);
    }

    @Override
    public String toString() {
        return "%s @ %s in %s".formatted(movie.getTitle(), formattedStart(), auditorium.getName());
    }
}
`,
    steps: [
      { mark: "private static final DateTimeFormatter TIME_FORMAT", note: "Ein geteilter Formatierer (Teil 9). ofPattern('dd.MM.yyyy HH:mm') legt das deutsche Datums-/Zeitformat fest." },
      { mark: "private final Movie movie;", note: "AGGREGATION ◇ (Teil 6): Der Film wird von außen übergeben (siehe Konstruktor) und existiert unabhängig — derselbe Film läuft in vielen Vorstellungen." },
      { mark: "private final LocalDateTime startTime;", note: "LocalDateTime (Teil 9): ein Zeitstempel (Datum + Uhrzeit) des Vorstellungsbeginns." },
      { mark: "public Screening(Movie movie, Auditorium auditorium, LocalDateTime startTime,", note: "Primärkonstruktor: Movie UND Auditorium kommen als Parameter herein — das macht beide Beziehungen zu Aggregationen ◇, nicht zu Kompositionen." },
      { mark: "if (basePrice.signum() <= 0)", note: "signum() liefert das Vorzeichen (-1/0/+1). Der Preis muss > 0 sein." },
      { mark: "this.basePrice = basePrice.setScale(2, RoundingMode.HALF_UP);", note: "Auch hier: Geld immer auf 2 Stellen normalisieren." },
      { mark: 'this(movie, auditorium, startTime, basePrice, "OV");', note: "Convenience-Konstruktor (Teil 5): setzt die Sprache standardmäßig auf 'OV' (Originalversion) und delegiert per this(...)." },
      { mark: "return startTime.plus(movie.getRuntime());", note: "java.time-Arithmetik: Startzeit + Filmlänge (Duration) = Endzeit. Saubere Zeitrechnung ohne Millisekunden-Gefummel." },
      { mark: "return movie.getCategory().applyTo(basePrice);", note: "Zusammenspiel: nutzt den Enum-Multiplikator aus FilmCategory auf dem Basispreis." },
      { mark: "return startTime.format(TIME_FORMAT);", note: "Formatiert den Zeitstempel lesbar, z. B. '05.06.2026 20:15'." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Ticket.java",
    teil: "Teil 3 · sealed",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/** Base type of the closed ticket hierarchy. */
@Getter
@EqualsAndHashCode
public sealed abstract class Ticket permits StandardTicket, PremiumTicket {

    private final Screening screening;
    private final Seat seat;
    private final BigDecimal basePrice;

    protected Ticket(Screening screening, Seat seat, BigDecimal basePrice) {
        this.screening = Objects.requireNonNull(screening, "screening must not be null");
        this.seat = Objects.requireNonNull(seat, "seat must not be null");
        Objects.requireNonNull(basePrice, "basePrice must not be null");
        if (basePrice.signum() <= 0) {
            throw new IllegalArgumentException("basePrice must be positive");
        }
        this.basePrice = basePrice.setScale(2, RoundingMode.HALF_UP);
    }

    public abstract BigDecimal calculateSurcharge();

    public final BigDecimal calculateTotalPrice() {
        return basePrice.add(calculateSurcharge()).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String toString() {
        return "%s for %s (%s EUR)".formatted(
                getClass().getSimpleName(), seat.label(), calculateTotalPrice());
    }
}
`,
    steps: [
      { mark: "@EqualsAndHashCode", note: "Lombok-equals auf der Basisklasse (Teil 7). Die Subklassen setzen darauf mit callSuper=true auf." },
      { mark: "public sealed abstract class Ticket permits StandardTicket, PremiumTicket", note: "HERZSTÜCK Teil 3: sealed = versiegelt. permits nennt die EINZIGEN erlaubten Subklassen. Der Compiler kennt damit die komplette Hierarchie — Basis für exhaustives switch ohne default (Teil 8)." },
      { mark: "protected Ticket(Screening screening, Seat seat, BigDecimal basePrice)", note: "protected Konstruktor (Teil 3): nur Subklassen dürfen ihn via super(...) aufrufen. Validiert den gemeinsamen Zustand zentral." },
      { mark: "public abstract BigDecimal calculateSurcharge();", note: "ABSTRAKTE Methode: kein Rumpf. Jede Ticket-Art muss ihren Aufschlag selbst definieren — das ist der polymorphe Haken (Teil 8)." },
      { mark: "public final BigDecimal calculateTotalPrice()", note: "FINALE Methode (Teil 3): Subklassen dürfen sie NICHT überschreiben. So ist die Preis-Formel ein fester Vertrag." },
      { mark: "return basePrice.add(calculateSurcharge())", note: "Polymorphie in Aktion: add ruft die je nach Subtyp unterschiedliche calculateSurcharge() auf. Gesamtpreis = Basis + Aufschlag." },
      { mark: "getClass().getSimpleName()", note: "Liefert zur Laufzeit den echten Klassennamen (StandardTicket/PremiumTicket) — toString ist in der Basis definiert, funktioniert aber für beide Subtypen." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "StandardTicket.java",
    teil: "Teil 3 · 7",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/** A standard ticket without extra services. */
@Getter
@EqualsAndHashCode(callSuper = true)
public final class StandardTicket extends Ticket {

    private final boolean onlinePurchase;

    public StandardTicket(Screening screening, Seat seat, BigDecimal basePrice, boolean onlinePurchase) {
        super(screening, seat, basePrice);
        this.onlinePurchase = onlinePurchase;
    }

    @Override
    public BigDecimal calculateSurcharge() {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}
`,
    steps: [
      { mark: "@EqualsAndHashCode(callSuper = true)", note: "callSuper = true (Teil 7 & 10): bezieht die geerbten Felder der Basisklasse in equals/hashCode ein. Ohne das würde Lombok eine Warnung geben." },
      { mark: "public final class StandardTicket extends Ticket", note: "Eine der beiden erlaubten Subklassen (siehe permits in Ticket). final = nicht weiter vererbbar (Teil 3)." },
      { mark: "private final boolean onlinePurchase;", note: "Eigenes, spezifisches Feld der Subklasse (Teil 3 verlangt: jede Subklasse ergänzt eigene Felder)." },
      { mark: "super(screening, seat, basePrice);", note: "super(...) (Teil 3): ruft den protected Basis-Konstruktor auf, der den gemeinsamen Zustand validiert und setzt." },
      { mark: "public BigDecimal calculateSurcharge()", note: "@Override der abstrakten Methode: Ein Standard-Ticket hat keinen Aufschlag → 0.00 (auf 2 Stellen skaliert)." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "PremiumTicket.java",
    teil: "Teil 3 · 10 · @Builder",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/** A premium ticket with a lounge surcharge and an optional welcome drink. */
@Getter
@EqualsAndHashCode(callSuper = true)
public final class PremiumTicket extends Ticket {

    private final BigDecimal loungeSurcharge;
    private final boolean welcomeDrink;

    @Builder
    public PremiumTicket(Screening screening, Seat seat, BigDecimal basePrice,
                         BigDecimal loungeSurcharge, boolean welcomeDrink) {
        super(screening, seat, basePrice);
        Objects.requireNonNull(loungeSurcharge, "loungeSurcharge must not be null");
        if (loungeSurcharge.signum() < 0) {
            throw new IllegalArgumentException("loungeSurcharge must not be negative");
        }
        this.loungeSurcharge = loungeSurcharge.setScale(2, RoundingMode.HALF_UP);
        this.welcomeDrink = welcomeDrink;
    }

    @Override
    public BigDecimal calculateSurcharge() {
        return loungeSurcharge;
    }
}
`,
    steps: [
      { mark: "@Builder", note: "ENTSCHEIDEND (Teil 10): @Builder steht auf dem KONSTRUKTOR, nicht auf der Klasse. Dadurch läuft jeder Builder-Aufbau durch den validierenden Konstruktor inkl. super(...) — die Validierung kann NICHT umgangen werden." },
      { mark: "public final class PremiumTicket extends Ticket", note: "Die zweite erlaubte Subklasse. Auch sie ist final und Teil der sealed-Hierarchie." },
      { mark: "private final BigDecimal loungeSurcharge;", note: "Spezifisches Feld: der Lounge-Aufschlag (ein Geldbetrag)." },
      { mark: "public PremiumTicket(Screening screening, Seat seat, BigDecimal basePrice,", note: "Der Konstruktor nimmt die Basis-Felder (für super) UND die eigenen Felder entgegen." },
      { mark: "if (loungeSurcharge.signum() < 0)", note: "Der Aufschlag darf nicht negativ sein (0 ist erlaubt)." },
      { mark: "return loungeSurcharge;", note: "@Override: anders als beim Standard-Ticket ist der Aufschlag hier der echte Lounge-Betrag → Polymorphie." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "BookingReference.java",
    teil: "Teil 6 · Komposition-Partner",
    code: String.raw`
package com.cinema.model;

import java.time.LocalDateTime;
import java.util.Objects;

import lombok.Getter;

/** The unique reference (code + issue timestamp) of a booking. */
@Getter
public final class BookingReference {

    private final String code;
    private final LocalDateTime issuedAt;

    public BookingReference(String code, LocalDateTime issuedAt) {
        Objects.requireNonNull(code, "code must not be null");
        var normalized = code.strip().toUpperCase();
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("code must not be blank");
        }
        this.code = normalized;
        this.issuedAt = Objects.requireNonNull(issuedAt, "issuedAt must not be null");
    }

    @Override
    public String toString() {
        return "Ref " + code;
    }
}
`,
    steps: [
      { mark: "public final class BookingReference", note: "Das 'Teil' der zweiten Komposition: Booking erzeugt eine solche Referenz intern (siehe Booking.java)." },
      { mark: "private final LocalDateTime issuedAt;", note: "Zeitstempel der Ausstellung (java.time, Teil 9)." },
      { mark: "var normalized = code.strip().toUpperCase();", note: "Normalisierung: Buchungscodes immer in Großbuchstaben." },
      { mark: 'return "Ref " + code;', note: "Lesbare Kurzform für Ausgaben." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Booking.java",
    teil: "Teil 6 · 7 · Defensive Copy",
    code: String.raw`
package com.cinema.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import lombok.Getter;

/** A confirmed booking: one customer reserves tickets for a screening. */
@Getter
public final class Booking {

    private final Customer customer;
    private final Screening screening;
    private final List<Ticket> tickets;
    private final BookingReference reference;
    private final LocalDateTime bookedAt;

    public Booking(Customer customer, Screening screening, List<Ticket> tickets, LocalDateTime bookedAt) {
        this.customer = Objects.requireNonNull(customer, "customer must not be null");
        this.screening = Objects.requireNonNull(screening, "screening must not be null");
        Objects.requireNonNull(tickets, "tickets must not be null");
        if (tickets.isEmpty()) {
            throw new IllegalArgumentException("a booking needs at least one ticket");
        }
        this.tickets = List.copyOf(tickets); // defensive copy
        this.bookedAt = Objects.requireNonNull(bookedAt, "bookedAt must not be null");
        this.reference = new BookingReference(
                "BK-%s-%d".formatted(bookedAt.toLocalDate(), customer.getCustomerId()), bookedAt);
    }

    public int ticketCount() {
        return tickets.size();
    }

    public BigDecimal totalAmount() {
        var sum = BigDecimal.ZERO;
        for (var ticket : tickets) {
            sum = sum.add(ticket.calculateTotalPrice());
        }
        return sum.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public String toString() {
        return "Booking %s: %d ticket(s), total %s EUR"
                .formatted(reference.getCode(), ticketCount(), totalAmount());
    }
}
`,
    steps: [
      { mark: "private final Customer customer;", note: "AGGREGATION ◇: der Kunde wird übergeben und lebt unabhängig (eine Person hat viele Buchungen)." },
      { mark: "private final List<Ticket> tickets;", note: "Die gebuchten Tickets — gleich defensiv kopiert." },
      { mark: "private final BookingReference reference;", note: "KOMPOSITION ◆: die Referenz wird intern erzeugt und gehört exklusiv dieser Buchung." },
      { mark: "if (tickets.isEmpty())", note: "Eine Buchung ohne Tickets ergibt keinen Sinn → Exception." },
      { mark: "this.tickets = List.copyOf(tickets);", note: "DEFENSIVE COPY (Teil 7): List.copyOf erzeugt eine eigene, unveränderliche Kopie. Ändert der Aufrufer SPÄTER seine Liste, bleibt unsere Buchung unberührt." },
      { mark: "this.reference = new BookingReference(", note: "Hier passiert die Komposition ◆: new BookingReference(...) — das Teil entsteht im Inneren des Ganzen." },
      { mark: '"BK-%s-%d".formatted(bookedAt.toLocalDate(), customer.getCustomerId())', note: "Der Buchungscode wird aus Datum und Kunden-Id zusammengesetzt. toLocalDate() schneidet die Uhrzeit ab." },
      { mark: "var sum = BigDecimal.ZERO;", note: "Summen-Akkumulator startet bei 0. BigDecimal ist unveränderlich, daher wird in der Schleife neu zugewiesen." },
      { mark: "sum = sum.add(ticket.calculateTotalPrice());", note: "Polymorphie + Summierung: jedes Ticket liefert seinen eigenen Gesamtpreis." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "Customer.java",
    teil: "Teil 4 · abstract + static",
    code: String.raw`
package com.cinema.model;

import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/** Abstract base class for cinema customers. */
@Getter
@EqualsAndHashCode(of = "customerId")
public abstract class Customer {

    private static final AtomicLong COUNTER = new AtomicLong(0);

    private final long customerId;
    private final String name;
    private final ContactInfo contact;

    protected Customer(String name, ContactInfo contact) {
        Objects.requireNonNull(name, "name must not be null");
        var stripped = name.strip();
        if (stripped.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
        }
        this.name = stripped;
        this.contact = Objects.requireNonNull(contact, "contact must not be null");
        this.customerId = COUNTER.incrementAndGet();
    }

    public static long getRegisteredCount() {
        return COUNTER.get();
    }

    public abstract String formatForDisplay();

    @Override
    public String toString() {
        return "%s (#%d)".formatted(name, customerId);
    }
}
`,
    steps: [
      { mark: '@EqualsAndHashCode(of = "customerId")', note: "Business Key = die Id (Teil 7): zwei Kunden sind gleich, wenn ihre Id gleich ist." },
      { mark: "public abstract class Customer", note: "ABSTRAKTE KLASSE (Teil 4): kann nicht direkt instanziiert werden, trägt aber gemeinsamen ZUSTAND (id, name, contact)." },
      { mark: "private static final AtomicLong COUNTER", note: "STATISCHES Feld (Teil 4): EINMAL pro Klasse (nicht pro Objekt). AtomicLong zählt threadsicher hoch — der Id-Generator." },
      { mark: "protected Customer(String name, ContactInfo contact)", note: "protected: nur Subklassen rufen ihn via super(...) auf. Validiert den gemeinsamen Zustand." },
      { mark: "this.customerId = COUNTER.incrementAndGet();", note: "Jeder neue Kunde bekommt im Konstruktor die nächste Id (1, 2, 3, …). So 'pflegt' der Konstruktor das statische Feld." },
      { mark: "public static long getRegisteredCount()", note: "STATISCHE METHODE (Teil 4): liest den Zählerstand. Wird in der Demo abgefragt — gehört zur Klasse, nicht zu einem Objekt." },
      { mark: "public abstract String formatForDisplay();", note: "Abstrakte Methode ohne Rumpf — jede konkrete Kundenart muss ihre Anzeige selbst liefern (Implementierung in RegisteredCustomer)." },
    ],
  },
  {
    pkg: "model",
    layer: "model",
    name: "RegisteredCustomer.java",
    teil: "Teil 8 · Text Block",
    code: String.raw`
package com.cinema.model;

import java.time.LocalDate;
import java.time.Period;
import java.util.Objects;

import lombok.EqualsAndHashCode;
import lombok.Getter;

/** A registered cinema member. */
@Getter
@EqualsAndHashCode(callSuper = true)
public final class RegisteredCustomer extends Customer {

    private final LocalDate memberSince;
    private final int loyaltyPoints;

    public RegisteredCustomer(String name, ContactInfo contact, LocalDate memberSince, int loyaltyPoints) {
        super(name, contact);
        this.memberSince = Objects.requireNonNull(memberSince, "memberSince must not be null");
        if (loyaltyPoints < 0) {
            throw new IllegalArgumentException("loyaltyPoints must not be negative");
        }
        this.loyaltyPoints = loyaltyPoints;
    }

    public Period membershipDuration() {
        return Period.between(memberSince, LocalDate.now());
    }

    @Override
    public String formatForDisplay() {
        var duration = membershipDuration();
        return """
               +------------------------------------------+
               |  CINEMA MEMBER CARD                      |
               +------------------------------------------+
               |  Name   : %-30s |
               |  Id     : #%-29d |
               |  E-Mail : %-30s |
               |  Member : since %-24s |
               |  Tenure : %d years, %d months%-17s|
               |  Points : %-30d |
               +------------------------------------------+
               """.formatted(
                getName(),
                getCustomerId(),
                getContact().email(),
                memberSince,
                duration.getYears(), duration.getMonths(), "",
                loyaltyPoints);
    }
}
`,
    steps: [
      { mark: "@EqualsAndHashCode(callSuper = true)", note: "Wieder callSuper=true: bezieht die geerbten Customer-Felder (v. a. die Id) mit ein." },
      { mark: "public final class RegisteredCustomer extends Customer", note: "Die KONKRETE final Subklasse (Teil 4), die die abstrakte Klasse Customer vervollständigt." },
      { mark: "private final LocalDate memberSince;", note: "LocalDate (Teil 9): ein reines Datum (ohne Uhrzeit) — der Beitrittstag." },
      { mark: "super(name, contact);", note: "Ruft den Customer-Konstruktor auf → dort wird die Id vergeben und der Zähler erhöht." },
      { mark: "return Period.between(memberSince, LocalDate.now());", note: "Period (Teil 9): eine Zeitspanne in Jahren/Monaten/Tagen. between(...) rechnet vom Beitritt bis heute." },
      { mark: "public String formatForDisplay()", note: "@Override der abstrakten Methode (Teil 8) — hier wird sie endlich mit Inhalt gefüllt." },
      { mark: 'return """', note: "TEXT BLOCK (Teil 8): mehrzeiliger String zwischen dreifachen Anführungszeichen. Ideal für die formatierte Mitgliedskarte — keine \\n-Verkettung nötig." },
      { mark: "|  Name   : %-30s |", note: "%-30s ist ein Format-Platzhalter: String, linksbündig, auf 30 Zeichen aufgefüllt — so bleibt der Kasten-Rahmen ausgerichtet." },
      { mark: ".formatted(", note: "formatted(...) füllt die Platzhalter der Reihe nach mit den Werten (Name, Id, E-Mail, Datum, Jahre/Monate, Punkte)." },
    ],
  },

  // ----- service ----------------------------------------------------------
  {
    pkg: "service",
    layer: "service",
    name: "ValidationException.java",
    teil: "Teil 9 · Checked Exception",
    code: String.raw`
package com.cinema.service;

/** Checked exception signalling that a domain value failed validation. */
public class ValidationException extends Exception {

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
`,
    steps: [
      { mark: "public class ValidationException extends Exception", note: "Eigene CHECKED Exception (Teil 9): erbt von Exception (nicht RuntimeException). 'Checked' heißt: der Compiler erzwingt throws oder try-catch." },
      { mark: "public ValidationException(String message)", note: "Erster Konstruktor: nur eine Fehlermeldung." },
      { mark: "public ValidationException(String message, Throwable cause)", note: "Zweiter Konstruktor: Meldung + Ursache. Das ist OVERLOADING (Teil 9): gleicher Name, andere Parameterliste. Erlaubt das 'Einwickeln' einer tieferen Exception ohne Verlust der Spur." },
    ],
  },
  {
    pkg: "service",
    layer: "service",
    name: "Validator.java",
    teil: "Teil 4 · @FunctionalInterface",
    code: String.raw`
package com.cinema.service;

/** A pure capability: validate a value of type T or fail. */
@FunctionalInterface
public interface Validator<T> {

    void validate(T value) throws ValidationException;
}
`,
    steps: [
      { mark: "@FunctionalInterface", note: "@FunctionalInterface (Teil 4): markiert ein Interface mit GENAU EINER abstrakten Methode. Der Compiler wacht darüber. So kann man es per Lambda implementieren." },
      { mark: "public interface Validator<T>", note: "Generisch (<T>): funktioniert für jeden Werttyp. Ein Interface beschreibt eine reine FÄHIGKEIT — keinen Zustand (Designregel Teil 4)." },
      { mark: "void validate(T value) throws ValidationException;", note: "Die eine Methode. throws ValidationException: Implementierungen dürfen die checked Exception werfen." },
    ],
  },
  {
    pkg: "service",
    layer: "service",
    name: "EmailValidator.java",
    teil: "Teil 4 · 9 · Regex",
    code: String.raw`
package com.cinema.service;

import java.util.regex.Pattern;

/** Concrete Validator for e-mail addresses (regex check). */
public final class EmailValidator implements Validator<String> {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Override
    public void validate(String value) throws ValidationException {
        if (value == null || value.isBlank()) {
            throw new ValidationException("e-mail must not be blank");
        }
        if (!EMAIL_PATTERN.matcher(value.strip()).matches()) {
            throw new ValidationException("invalid e-mail format: " + value);
        }
    }
}
`,
    steps: [
      { mark: "public final class EmailValidator implements Validator<String>", note: "Konkrete Klasse, die das Interface implementiert (Teil 4). <String>: validiert E-Mail-Strings." },
      { mark: "private static final Pattern EMAIL_PATTERN", note: "Wieder ein einmal kompiliertes Regex-Muster (Teil 9) — der von Teil 4 geforderte 'Validator mit Regex-Prüfung'." },
      { mark: "[A-Za-z]{2,}$", note: "{2,} bedeutet 'mindestens 2 Zeichen' für die Top-Level-Domain (z. B. .de, .com). $ markiert das Zeilenende." },
      { mark: "public void validate(String value) throws ValidationException", note: "@Override der Interface-Methode. throws: meldet ungültige Eingaben als checked Exception." },
      { mark: 'throw new ValidationException("e-mail must not be blank")', note: "Null oder leer → Fehler (nutzt den Konstruktor mit nur einer Meldung)." },
      { mark: "if (!EMAIL_PATTERN.matcher(value.strip()).matches())", note: "Kernprüfung: Passt die getrimmte Eingabe vollständig zum Muster? Wenn nicht → Exception." },
    ],
  },
  {
    pkg: "service",
    layer: "service",
    name: "BookingService.java",
    teil: "Teil 5 · 9 · HAS-A",
    code: String.raw`
package com.cinema.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.cinema.model.Booking;
import com.cinema.model.Customer;
import com.cinema.model.Screening;
import com.cinema.model.Ticket;

/** Application service that creates bookings after validating the input. */
public final class BookingService {

    private final Validator<String> emailValidator;

    public BookingService(Validator<String> emailValidator) {
        this.emailValidator = Objects.requireNonNull(emailValidator, "emailValidator must not be null");
    }

    public BookingService() {
        this(new EmailValidator());
    }

    public Booking book(Customer customer, Screening screening, List<Ticket> tickets, LocalDateTime when)
            throws ValidationException {
        Objects.requireNonNull(customer, "customer must not be null");
        emailValidator.validate(customer.getContact().email());
        if (tickets == null || tickets.isEmpty()) {
            throw new ValidationException("a booking needs at least one ticket");
        }
        return new Booking(customer, screening, tickets, when);
    }

    public BigDecimal parsePrice(String raw) throws ValidationException {
        try {
            return new BigDecimal(raw.strip()).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            throw new ValidationException("not a valid price: " + raw, e);
        }
    }
}
`,
    steps: [
      { mark: "private final Validator<String> emailValidator;", note: "HAS-A / KOMPOSITION ÜBER VERERBUNG (Teil 9): Der Service HAT einen Validator (Feld), statt von ihm zu ERBEN. In UML ist diese eingebettete Abhängigkeit eine Aggregation ◇, weil sie von außen kommt." },
      { mark: "public BookingService(Validator<String> emailValidator)", note: "Primärkonstruktor: der Validator wird INJIZIERT (von außen hineingegeben — Dependency Injection)." },
      { mark: "public BookingService() {", note: "Convenience-Konstruktor (Teil 5): liefert eine Default-Implementierung und delegiert per this(...)." },
      { mark: "this(new EmailValidator());", note: "Default-Wahl: nimmt einen EmailValidator, wenn der Aufrufer keinen angibt." },
      { mark: "throws ValidationException", note: "throws (Teil 9): book() kann die checked Exception weiterreichen — der Aufrufer MUSS sie behandeln." },
      { mark: "emailValidator.validate(customer.getContact().email());", note: "Delegation an das HAS-A-Objekt: der Service nutzt die Fähigkeit des Validators, ohne sie selbst zu kennen." },
      { mark: "return new Booking(customer, screening, tickets, when);", note: "Erst nach erfolgreicher Validierung wird die Buchung erstellt." },
      { mark: "try {", note: "try-catch (Teil 9): hier wird ein möglicher Fehler beim Parsen abgefangen." },
      { mark: "new BigDecimal(raw.strip())", note: "String-Konstruktor von BigDecimal (Teil 9). Bei ungültigem Text wirft er eine NumberFormatException." },
      { mark: 'throw new ValidationException("not a valid price: " + raw, e);', note: "WRAPPING: die tiefe NumberFormatException (e) wird als Ursache in unsere ValidationException eingepackt — der Zwei-Argument-Konstruktor (Teil 9)." },
    ],
  },
  {
    pkg: "service",
    layer: "service",
    name: "TicketAnalytics.java",
    teil: "Teil 8 · switch + PECS",
    code: String.raw`
package com.cinema.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

import com.cinema.model.PremiumTicket;
import com.cinema.model.Screening;
import com.cinema.model.StandardTicket;
import com.cinema.model.Ticket;

/** Stateless helper methods over tickets. */
public final class TicketAnalytics {

    private TicketAnalytics() {
    }

    public static String describe(Ticket ticket) {
        Objects.requireNonNull(ticket, "ticket must not be null");
        return switch (ticket) {
            case StandardTicket s -> "Standard seat %s%s".formatted(
                    s.getSeat().label(), s.isOnlinePurchase() ? " (online)" : "");
            case PremiumTicket p -> "Premium seat %s%s".formatted(
                    p.getSeat().label(), p.isWelcomeDrink() ? " incl. welcome drink" : "");
        };
    }

    public static BigDecimal sumExactly(List<Ticket> tickets) {
        var total = BigDecimal.ZERO;
        for (var ticket : tickets) {
            total = total.add(ticket.calculateTotalPrice());
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal totalRevenue(List<? extends Ticket> tickets) {
        var total = BigDecimal.ZERO;
        for (var ticket : tickets) {
            total = total.add(ticket.calculateTotalPrice());
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public static void fillWithStandardTickets(List<? super StandardTicket> sink,
                                               Screening screening, BigDecimal basePrice, int count) {
        for (var i = 0; i < count; i++) {
            sink.add(new StandardTicket(screening, screening.getAuditorium().seatAt(i), basePrice, true));
        }
    }
}
`,
    steps: [
      { mark: "private TicketAnalytics() {", note: "Privater Konstruktor: verhindert das Instanziieren. Diese Klasse ist ein reiner Methoden-Container (Utility)." },
      { mark: "public static String describe(Ticket ticket)", note: "POLYMORPHIE (Teil 8): nimmt den BASISTYP Ticket entgegen und verarbeitet jeden Subtyp passend." },
      { mark: "return switch (ticket) {", note: "switch mit PATTERN MATCHING (Teil 8): verzweigt nach dem konkreten Laufzeit-Typ." },
      { mark: "case StandardTicket s ->", note: "Bindet das Ticket direkt als StandardTicket s — Typprüfung und Zuweisung in einem." },
      { mark: "case PremiumTicket p ->", note: "Zweiter Fall. Da Ticket sealed ist und beide erlaubten Subtypen abgedeckt sind, ist das switch EXHAUSTIV — KEIN default nötig (Teil 8). Käme ein neuer Subtyp dazu, gäbe es einen Compile-Fehler." },
      { mark: "public static BigDecimal sumExactly(List<Ticket> tickets)", note: "INVARIANZ (Teil 8): akzeptiert EXAKT List<Ticket> — weder eine Subtyp- noch eine Obertyp-Liste." },
      { mark: "public static BigDecimal totalRevenue(List<? extends Ticket> tickets)", note: "KOVARIANZ (PECS: Producer Extends): '? extends Ticket' — die Liste wird nur GELESEN, daher ist jede Subtyp-Liste erlaubt." },
      { mark: "public static void fillWithStandardTickets(List<? super StandardTicket> sink,", note: "KONTRAVARIANZ (PECS: Consumer Super): '? super StandardTicket' — in die Liste wird nur GESCHRIEBEN, daher ist jede Obertyp-Liste (z. B. List<Ticket>) erlaubt." },
      { mark: "sink.add(new StandardTicket(", note: "Merksatz PECS: Producer Extends, Consumer Super. Hier ist die Liste ein Consumer (sie nimmt auf), also super." },
    ],
  },

  // ----- app --------------------------------------------------------------
  {
    pkg: "app",
    layer: "app",
    name: "CinemaDemo.java",
    teil: "Teil 11 · main()",
    code: String.raw`
package com.cinema.app;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.cinema.model.*;
import com.cinema.service.BookingService;
import com.cinema.service.TicketAnalytics;
import com.cinema.service.ValidationException;

/** Demonstration entry point (Teil 11). */
public final class CinemaDemo {

    private CinemaDemo() {
    }

    public static void main(String[] args) {
        var address = new Address(" Hauptstrasse 1 ", "Mosbach", " 74821 ");
        var contact = new ContactInfo("Anna.Schmidt@Example.com", " +49 6261 1234 ");

        var movie = new Movie("Inception", "Christopher Nolan",
                Duration.ofMinutes(148), FilmCategory.BLOCKBUSTER, AgeRating.FSK12, 2010);
        var auditorium = new Auditorium("Saal 1", 5, 12);
        var screening = new Screening(movie, auditorium,
                LocalDateTime.of(2026, 6, 5, 20, 15), new BigDecimal("11.50"), "OV");

        var standard = new StandardTicket(screening, auditorium.seatAt(0), screening.categoryAdjustedPrice(), true);
        var premium = PremiumTicket.builder()
                .screening(screening)
                .seat(auditorium.seatAt(1))
                .basePrice(screening.categoryAdjustedPrice())
                .loungeSurcharge(new BigDecimal("4.50"))
                .welcomeDrink(true)
                .build();

        for (Ticket ticket : List.of(standard, premium)) {
            System.out.println(TicketAnalytics.describe(ticket));
        }

        var anna = new RegisteredCustomer("Anna Schmidt", contact, LocalDate.of(2022, 3, 1), 240);
        System.out.println("registered customers: " + RegisteredCustomer.getRegisteredCount());

        var service = new BookingService();
        var tickets = new ArrayList<Ticket>();
        tickets.add(standard);
        tickets.add(premium);
        try {
            var booking = service.book(anna, screening, tickets, LocalDateTime.of(2026, 6, 4, 18, 0));
            System.out.println(booking);
        } catch (ValidationException e) {
            System.out.println("booking failed: " + e.getMessage());
        }

        System.out.print(anna.formatForDisplay());
    }
}
`,
    steps: [
      { mark: "public final class CinemaDemo", note: "Die Demo-Klasse (Teil 11): final, mit privatem Konstruktor — sie dient nur als Einstiegspunkt." },
      { mark: "public static void main(String[] args)", note: "main(...) ist der Programmstart. In build.gradle.kts als mainClass eingetragen, also läuft sie bei ./gradlew run." },
      { mark: "var address = new Address(", note: "Records instanziieren — beachte die Leerzeichen in den Argumenten; der Compact Constructor stript sie weg." },
      { mark: "var movie = new Movie(", note: "Primärkonstruktor von Movie (alle Parameter). Duration.ofMinutes(148) = 2h 28min." },
      { mark: 'var auditorium = new Auditorium("Saal 1", 5, 12);', note: "Komposition in Aktion: hier entstehen 5×12 = 60 Seat-Objekte INNERHALB des Saals." },
      { mark: "var screening = new Screening(movie, auditorium,", note: "Aggregation in Aktion: movie und auditorium werden HINEINGEGEBEN." },
      { mark: "var premium = PremiumTicket.builder()", note: "Der Lombok-@Builder (Teil 10): lesbarer, benannter Aufbau. .build() ruft am Ende den validierenden Konstruktor auf." },
      { mark: "System.out.println(TicketAnalytics.describe(ticket));", note: "Polymorphie + switch: dieselbe Methode beschreibt beide Ticket-Typen unterschiedlich." },
      { mark: 'System.out.println("registered customers: " + RegisteredCustomer.getRegisteredCount());', note: "Abfrage der STATISCHEN Methode/Zähler aus der abstrakten Klasse (Teil 11)." },
      { mark: "try {", note: "try-catch um die Buchung: book() ist checked, muss also behandelt werden (Teil 9)." },
      { mark: "} catch (ValidationException e) {", note: "Fängt eine ungültige E-Mail / leere Ticketliste ab — das Programm stürzt nicht ab." },
      { mark: "System.out.print(anna.formatForDisplay());", note: "Ruft den Text-Block-Steckbrief auf der konkreten Subklasse auf (Teil 8 & 11) — die Mitgliedskarte erscheint." },
    ],
  },
];

function toLines(code) {
  return code.replace(/^\n/, "").replace(/\n+$/, "").split("\n");
}

// Für jede Datei: Zeilenindex pro Schritt vorab bestimmen (per Teilstring-Suche).
function resolveStepLines(lines, steps) {
  const out = [];
  let cursor = 0;
  for (const st of steps) {
    let found = -1;
    for (let k = cursor; k < lines.length; k++) {
      if (lines[k].includes(st.mark)) {
        found = k;
        break;
      }
    }
    if (found === -1) {
      // Fallback: von vorne suchen, falls Reihenfolge nicht passt
      for (let k = 0; k < lines.length; k++) {
        if (lines[k].includes(st.mark)) {
          found = k;
          break;
        }
      }
    }
    out.push(found);
    if (found >= 0) cursor = found + 1;
  }
  return out;
}

function AblaufTrainerVis() {
  const initial = Math.max(0, FILES.findIndex((f) => f.name === "Ticket.java"));
  const [fileIdx, setFileIdx] = useState(initial);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  const activeRef = useRef(null);

  const file = FILES[fileIdx];
  const lines = toLines(file.code);
  const stepLines = resolveStepLines(lines, file.steps);
  const activeLine = stepLines[step];

  // Auto-Play durch die Schritte der aktuellen Datei
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((prev) => {
        if (prev >= file.steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2600);
    return () => clearInterval(timer.current);
  }, [playing, fileIdx, file.steps.length]);

  // Aktive Zeile in den Sichtbereich scrollen
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [fileIdx, step]);

  function pickFile(idx) {
    setFileIdx(idx);
    setStep(0);
    setPlaying(false);
  }

  const grouped = { model: [], service: [], app: [] };
  FILES.forEach((f, idx) => grouped[f.pkg].push(idx));

  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {/* Datei-Auswahl */}
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          {Object.keys(grouped).map((pkg) => (
            <div key={pkg} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: LAYER[pkg],
                  marginBottom: 6,
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: 2, background: LAYER[pkg] }} />
                {pkg}/
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {grouped[pkg].map((idx) => {
                  const on = idx === fileIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => pickFile(idx)}
                      style={{
                        textAlign: "left",
                        background: on ? "rgba(252,211,77,0.14)" : C.panel2,
                        border: `1px solid ${on ? C.gold : C.line}`,
                        borderRadius: 8,
                        padding: "6px 9px",
                        cursor: "pointer",
                        color: on ? C.text : C.dim,
                        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
                        fontSize: 12,
                        transition: "all .25s",
                      }}
                    >
                      {FILES[idx].name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Code + Erklärung */}
        <div style={{ flex: "1 1 420px", minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: LAYER[file.layer] }} />
            <code style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{file.name}</code>
            <span
              style={{
                fontSize: 11,
                color: C.accent2,
                border: `1px solid ${C.line}`,
                borderRadius: 6,
                padding: "1px 7px",
              }}
            >
              {file.teil}
            </span>
          </div>

          {/* Code-Panel */}
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "10px 0",
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              fontSize: 12,
              lineHeight: 1.55,
              maxHeight: 360,
              overflow: "auto",
            }}
          >
            {lines.map((ln, k) => {
              const on = k === activeLine;
              return (
                <div
                  key={k}
                  ref={on ? activeRef : null}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "0 12px",
                    background: on ? "rgba(252,211,77,0.16)" : "transparent",
                    borderLeft: on ? `3px solid ${C.gold}` : "3px solid transparent",
                    transition: "background .25s",
                  }}
                >
                  <span style={{ color: C.line === undefined ? C.dim : "#4b5366", width: 26, textAlign: "right", flexShrink: 0, userSelect: "none" }}>
                    {k + 1}
                  </span>
                  <span style={{ color: on ? C.text : C.dim, whiteSpace: "pre" }}>{ln || " "}</span>
                </div>
              );
            })}
          </div>

          {/* Erklärung */}
          <div
            key={fileIdx + "-" + step}
            className="pop"
            style={{
              marginTop: 12,
              background: C.panel2,
              border: `1px solid ${C.accent2}`,
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: C.accent2, fontWeight: 700, marginBottom: 6 }}>
              Zeile {activeLine >= 0 ? activeLine + 1 : "?"} · erklärt
            </div>
            <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{file.steps[step].note}</div>
          </div>

          <PlayerControls
            playing={playing}
            setPlaying={setPlaying}
            onPrev={() => setStep((v) => Math.max(0, v - 1))}
            onNext={() => setStep((v) => Math.min(file.steps.length - 1, v + 1))}
            onReset={() => {
              setStep(0);
              setPlaying(false);
            }}
            atStart={step === 0}
            atEnd={step === file.steps.length - 1}
            label={`Schritt ${step + 1} / ${file.steps.length}`}
          />
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.gold}>aktive Zeile</Tag>
        <Tag color={LAYER.model}>model</Tag>
        <Tag color={LAYER.service}>service</Tag>
        <Tag color={LAYER.app}>app</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
export default function ProjektArchitekturTrainer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent2 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
              Lern-Trainer · Projektarchitektur
            </span>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
            Das ganze Projekt verstehen:
            <br />
            <span style={{ color: C.accent }}>Kino-Ticketsystem</span>, Teil für Teil, Zeile für Zeile
          </h1>
          <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.7, maxWidth: 700 }}>
            Die OOP-Abgabe verlangt <b style={{ color: C.text }}>21 Java-Klassen</b>, die zusammen{" "}
            <b style={{ color: C.text }}>41 Konzepte</b> aus 12 Aufgabenteilen nachweisen. Das wirkt erschlagend. Dieser Trainer gibt dir
            zuerst den <b style={{ color: C.accent2 }}>Überblick</b> über alle Aufgaben und Konzepte und führt dich dann mit dem{" "}
            <b style={{ color: C.accent2 }}>AblaufTrainer</b> durch <b style={{ color: C.text }}>jede Datei, Zeile für Zeile</b>.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#konzepte" style={{ ...btn, textDecoration: "none" }}>
              ▶ Konzept-Überblick
            </a>
            <a href="#ablauf" style={{ ...btnGhost, textDecoration: "none" }}>
              Zum AblaufTrainer
            </a>
            <a href="#glossar" style={{ ...btnGhost, textDecoration: "none" }}>
              Glossar
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 56 }} />

        {/* 0. Das Problem */}
        <Section kicker="0 · Das Problem" title="Warum 21 Klassen statt einer Main.java?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Man könnte ein Kino-Ticketsystem in eine einzige Datei quetschen: Kunde, Film, Saal, Ticket und Preisberechnung
            untereinander. Für ein Wochenend-Skript reicht das. Aber die Aufgabe verfolgt ein{" "}
            <b style={{ color: C.text }}>Tiefenverständnis der OOP</b> — und genau das zeigt sich erst, wenn jeder Baustein eine{" "}
            <b style={{ color: C.text }}>klare, begründbare Rolle</b> hat.
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 8 }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Alles vermischt</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Domänenregeln, Validierung und Konsolen-Ausgabe verschränkt — eine kleine Änderung an der Ausgabe kann die
                Preislogik zerschießen.
              </div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Konzepte unsichtbar</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Wo ist hier Polymorphismus? Wo Komposition vs. Aggregation? In einem Klumpen Code kann man die geforderten 41 Konzepte
                weder zeigen noch prüfen.
              </div>
            </Card>
          </div>
          <InfoBox title="Die Leitfrage der Aufgabe">
            „Jede Entwurfsentscheidung soll bewusst und begründbar sein." Das Projekt ist deshalb klar in drei Pakete und 12 didaktisch
            aufeinander aufbauende Teile gegliedert — jeder Teil macht ein Konzept sichtbar und überprüfbar.
          </InfoBox>
        </Section>

        {/* 1. Die Kernidee */}
        <Section kicker="1 · Die Kernidee" title="Drei Pakete, klare Verantwortungen">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Der Produktivcode liegt unter <code style={codeInline}>src/main/java/com/cinema/</code> und ist in drei{" "}
            <b style={{ color: C.text }}>Pakete</b> (Ordner, die zusammengehörige Klassen bündeln) geschnitten. Jedes Paket hat{" "}
            <b style={{ color: C.accent }}>eine Aufgabe</b> — das ist das Prinzip der einzelnen Verantwortung (Single Responsibility).
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
            <LayerCard color={LAYER.model} name="model" sub="Das Domänenmodell — die Kino-Begriffe selbst">
              Was <i>ist</i> ein Film, ein Saal, ein Ticket, ein Kunde? Reine Datentypen mit Regeln, die immer gelten. Records, Enums, die
              sealed Ticket-Hierarchie und die abstrakte Customer-Klasse leben hier.
            </LayerCard>
            <LayerCard color={LAYER.service} name="service" sub="Die Anwendungslogik">
              Validieren, buchen, auswerten. Hier sitzen das Validator-Interface, der BookingService (HAS-A), die eigene Exception und die
              Analyse-Methoden mit Generics.
            </LayerCard>
            <LayerCard color={LAYER.app} name="app" sub="Demo & Einstieg">
              Die <code style={codeInline}>CinemaDemo</code> mit <code style={codeInline}>main()</code> — verdrahtet alles und führt die
              Gesamtintegration vor.
            </LayerCard>
          </div>
          <InfoBox title="Aufeinander aufbauend">
            Die 12 Aufgabenteile sind didaktisch gestaffelt: erst Kapselung &amp; Immutability (Teil 1), dann Records/Enums (2), Vererbung
            (3), Abstraktion (4) … bis zur Demo (11) und Dokumentation (12). Jeder Teil nutzt die vorherigen.
          </InfoBox>
        </Section>

        {/* VIS 1 — Konzept-Überblick */}
        <Section kicker="Interaktiv · Überblick" title="Die 12 Aufgabenteile & ihre Konzepte">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Klick auf eine Nummer oder drück ▶ — der Trainer läuft durch alle 12 Teile der Spezifikation und zeigt jeweils Ziel, die
            eingeführten Konzepte und die Klassen, die sie umsetzen. So bekommst du den Gesamtüberblick, bevor es ins Detail geht.
          </p>
          <div id="konzepte" />
          <ConceptTrainerVis />
        </Section>

        {/* 2. Architektur-Explorer */}
        <Section kicker="2 · Orientierung" title="Jede Datei, einmal angefasst">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Bevor wir in den Code zoomen, hier die Vogelperspektive: Der Explorer läuft durch das komplette Projekt und erklärt jede Datei
            in einem Satz. Die Farbpunkte zeigen das Paket.
          </p>
          <ProjectExplorerVis />
        </Section>

        {/* 3. Der schwierige Teil — Komposition vs Aggregation */}
        <Section kicker="3 · Der knifflige Teil" title="Komposition ◆ vs. Aggregation ◇">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die fachlich heikelste Unterscheidung der Aufgabe (Teil 6) ist die zwischen{" "}
            <b style={{ color: C.accent2 }}>Komposition</b> und <b style={{ color: C.accent }}>Aggregation</b>. Beide bedeuten
            „besteht-aus", aber der Unterschied liegt in <b style={{ color: C.text }}>Erzeugung und Lebensdauer</b> des Teils.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <Card style={{ flex: "1 1 260px", background: C.panel2, borderLeft: `4px solid ${C.accent2}` }}>
              <div style={{ color: C.accent2, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>◆ Komposition — „Teil-von"</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 13.5, lineHeight: 1.7 }}>
                <li>Das Ganze erzeugt das Teil intern mit <code style={codeInline}>new</code>.</li>
                <li>Kein Setter — das Teil ist nicht austauschbar.</li>
                <li>Das Teil gehört exklusiv einem Ganzen, stirbt mit ihm.</li>
              </ul>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                Im Projekt: <code style={codeInline}>Auditorium → Seat</code>, <code style={codeInline}>Booking → BookingReference</code>.
              </div>
            </Card>
            <Card style={{ flex: "1 1 260px", background: C.panel2, borderLeft: `4px solid ${C.accent}` }}>
              <div style={{ color: C.accent, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>◇ Aggregation — „kennt-ein"</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 13.5, lineHeight: 1.7 }}>
                <li>Das Teil wird von außen als Konstruktor-Parameter übergeben.</li>
                <li>Das Teil existiert unabhängig vom Ganzen.</li>
                <li>Es kann mehreren Ganzen bekannt sein.</li>
              </ul>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                Im Projekt: <code style={codeInline}>Screening → Movie / Auditorium</code>, <code style={codeInline}>Booking → Customer</code>.
              </div>
            </Card>
          </div>
          <InfoBox title="Falsche Fährte: Sichtbarkeit">
            Ob ein Konstruktor public oder package-private ist, entscheidet <b>nicht</b> über Komposition. Entscheidend sind die{" "}
            <b>exklusive Eigentümerschaft</b> und die <b>interne Erzeugung</b>. Und Achtung: Der GoF-Begriff „Komposition über Vererbung"
            (HAS-A im <code style={codeInline}>BookingService</code>) ist wieder etwas anderes — in UML ist das eine Aggregation ◇.
          </InfoBox>
        </Section>

        {/* VIS 3 — AblaufTrainer (Zeile für Zeile) */}
        <Section kicker="Interaktiv · AblaufTrainer" title="Jede Datei, Zeile für Zeile">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Das Herzstück: Wähle links eine Datei und gehe mit ▶ oder den Schritt-Knöpfen durch ihren echten Quelltext. Die{" "}
            <b style={{ color: C.gold }}>gelb markierte Zeile</b> wird jeweils im Erklärkasten darunter besprochen — Fachbegriffe
            inklusive. Start ist <code style={codeInline}>Ticket.java</code>, das Kernstück der Vererbung.
          </p>
          <div id="ablauf" />
          <AblaufTrainerVis />
        </Section>

        {/* 4. Analyse — Konzept-Abdeckung */}
        <Section kicker="4 · Analyse" title="Sind wirklich alle Konzepte abgedeckt?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die Spezifikation listet 41 nummerierte Konzepte. Hier die fachlich anspruchsvollsten — jeweils mit dem Ort im Code, an dem sie
            nachweisbar sind:
          </p>
          <Card>
            <MethodRow
              color={LAYER.model}
              name="sealed Hierarchie"
              formula="permits + exhaustive switch"
              note="Ticket permits StandardTicket, PremiumTicket. Das macht das switch in TicketAnalytics.describe vollständig prüfbar — ohne default-Zweig."
            />
            <MethodRow
              color={C.accent}
              name="Generics · PECS"
              formula="? extends / ? super"
              note="sumExactly (Invarianz), totalRevenue (Kovarianz, Producer Extends), fillWithStandardTickets (Kontravarianz, Consumer Super) in TicketAnalytics."
            />
            <MethodRow
              color={C.accent2}
              name="equals/hashCode · 3 Strategien"
              formula="manuell · Lombok · record"
              note="Seat (manuell, instanceof), Movie/Customer (Lombok of/callSuper), Address/ContactInfo (record, implizit). Defensive Copy in Booking."
            />
            <MethodRow
              color={C.gold}
              name="BigDecimal & java.time"
              formula="Scale · compareTo · Duration/Period"
              note="Alle Geldbeträge als BigDecimal mit setScale(2, HALF_UP) und compareTo. Duration (Filmlänge), LocalDateTime, LocalDate, Period (Mitgliedsdauer), DateTimeFormatter."
            />
            <MethodRow
              color={C.good}
              name="Exception-Handling"
              formula="checked · throws · try-catch · cause"
              note="Eigene ValidationException mit zwei Konstruktoren; BookingService wirft sie, CinemaDemo fängt sie; parsePrice packt eine NumberFormatException als cause ein."
            />
          </Card>
          <InfoBox title="Vollständige Zuordnung">
            Die komplette Checkliste aller 41 Konzepte mit Klassenzuordnung steht im Abgabedokument{" "}
            <code style={codeInline}>referenz.md</code> (Abschnitt 14) — zusammen mit Klassendiagramm und QA-Protokoll. Dieser Trainer ist
            die interaktive Ergänzung dazu.
          </InfoBox>
        </Section>

        {/* 5. Zusammenfassung */}
        <Section kicker="5 · Auf einen Blick" title="Das ganze Projekt in fünf Sätzen">
          <Card style={{ background: "rgba(125,211,252,0.06)", border: `1px solid ${C.accent}` }}>
            <ol style={{ margin: 0, paddingLeft: 20, color: C.text, fontSize: 15.5, lineHeight: 1.9 }}>
              <li>
                <b style={{ color: C.accent }}>Drei Pakete:</b> model (Begriffe), service (Logik), app (Demo) — jede Klasse hat eine klare
                Rolle.
              </li>
              <li>
                <b style={{ color: C.accent }}>Unveränderlich &amp; geprüft:</b> alle Felder <code style={codeInline}>private final</code>,
                Validierung im Konstruktor (Fast-Fail) — ungültige Zustände sind unmöglich.
              </li>
              <li>
                <b style={{ color: C.accent }}>Eine geschlossene Hierarchie:</b> <code style={codeInline}>sealed Ticket</code> erlaubt
                exhaustives Pattern Matching ohne <code style={codeInline}>default</code>.
              </li>
              <li>
                <b style={{ color: C.accent }}>Beziehungen bewusst gewählt:</b> Komposition ◆ (intern erzeugt) vs. Aggregation ◇ (von außen)
                — UML-konform begründet.
              </li>
              <li>
                <b style={{ color: C.accent }}>Werkzeuge mit Bedacht:</b> records für Werte, Lombok nur als Boilerplate-Sparer, @Builder auf
                dem Konstruktor (umgeht die Validierung nicht).
              </li>
            </ol>
          </Card>
          <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.7, marginTop: 16 }}>
            Wenn du das verinnerlicht hast, kannst du jede Datei öffnen und sofort einordnen: <i>Zu welchem Paket gehört sie? Welches
            Konzept zeigt sie? Welcher Aufgabenteil verlangt das?</i> Das ist „das ganze Projekt verstehen".
          </p>
        </Section>

        {/* 6. Glossar */}
        <Section kicker="6 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div id="glossar" />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            <GlossEntry term="Paket / package" def="Ordner, der zusammengehörige Java-Klassen bündelt. Hier: model, service, app." />
            <GlossEntry term="Kapselung" def="Felder privat, Zugriff nur über Methoden (Getter). Keine Setter — der Zustand bleibt geschützt." />
            <GlossEntry term="Immutability / unveränderlich" def="Ein Objekt, dessen Zustand nach der Konstruktion nicht mehr änderbar ist (alle Felder final)." />
            <GlossEntry term="Fast-Fail" def="Sofortige Prüfung im Konstruktor (requireNonNull, IllegalArgumentException). Fehler werden früh sichtbar." />
            <GlossEntry term="Normalisierung" def="Eingaben vereinheitlichen, z. B. strip() (Leerzeichen weg) und toUpperCase()." />
            <GlossEntry term="record" def="Java-Konstrukt für unveränderliche Wertobjekte; erzeugt Konstruktor, Getter, equals, hashCode, toString automatisch." />
            <GlossEntry term="Compact Constructor" def="Im record die kompakte Stelle für Validierung/Normalisierung — ohne Parameterliste." />
            <GlossEntry term="enum" def="Aufzählungstyp mit fester Anzahl Konstanten. Kann Felder und Methoden tragen (FilmCategory)." />
            <GlossEntry term="sealed" def="Versiegelte Klasse: erlaubt per permits nur bestimmte Subklassen. Der Compiler kennt die ganze Hierarchie." />
            <GlossEntry term="permits" def="Schlüsselwort, das die erlaubten Subklassen einer sealed-Klasse explizit benennt." />
            <GlossEntry term="abstract class" def="Nicht instanziierbare Basisklasse mit gemeinsamem Zustand und ggf. abstrakten Methoden (Customer, Ticket)." />
            <GlossEntry term="Interface" def="Reiner Fähigkeitsvertrag ohne Zustand. @FunctionalInterface = genau eine Methode (Validator)." />
            <GlossEntry term="Polymorphismus" def="Ein Aufruf, viele Ausprägungen: derselbe Methodenname verhält sich je nach Laufzeittyp unterschiedlich." />
            <GlossEntry term="Pattern Matching" def="switch/instanceof, das Typ prüft UND zugleich eine typisierte Variable bindet — ohne expliziten Cast." />
            <GlossEntry term="exhaustiv" def="Vollständig: ein switch über eine sealed-Hierarchie deckt alle Fälle ab, kein default nötig." />
            <GlossEntry term="Komposition ◆" def="Das Ganze erzeugt das Teil intern (new) und besitzt es exklusiv; gemeinsamer Lebenszyklus." />
            <GlossEntry term="Aggregation ◇" def="Das Teil wird von außen übergeben, existiert unabhängig und kann mehreren Ganzen bekannt sein." />
            <GlossEntry term="HAS-A (Komposition über Vererbung)" def="Eine Klasse HAT ein Objekt als Feld, statt von ihm zu erben (BookingService hat Validator). In UML: Aggregation ◇." />
            <GlossEntry term="equals / hashCode" def="Vertrag für Wertgleichheit: gleiche Objekte → gleicher Hashcode; beide nutzen dieselben Felder." />
            <GlossEntry term="Business Key" def="Fachlicher Schlüssel für Gleichheit, z. B. of = {title, releaseYear} bei Movie." />
            <GlossEntry term="callSuper" def="Lombok-Option: bezieht die geerbten Felder der Basisklasse in equals/hashCode der Subklasse ein." />
            <GlossEntry term="Defensive Copy" def="Eigene Kopie übergebener Daten (List.copyOf), damit Außenstehende das Objekt nicht nachträglich ändern." />
            <GlossEntry term="Generics" def="Typ-Parameter wie List<Ticket>. Erlauben typsichere, wiederverwendbare Methoden." />
            <GlossEntry term="Invarianz" def="List<Ticket> akzeptiert exakt diesen Typ — keine Subtyp- oder Obertyp-Liste." />
            <GlossEntry term="Kovarianz · ? extends" def="Nur-Lesen über Subtypen (Producer Extends). totalRevenue akzeptiert jede Ticket-Subtyp-Liste." />
            <GlossEntry term="Kontravarianz · ? super" def="Nur-Schreiben in Obertyp-Listen (Consumer Super). fillWithStandardTickets schreibt in List<? super StandardTicket>." />
            <GlossEntry term="PECS" def="Producer Extends, Consumer Super — Faustregel, wann ? extends und wann ? super zu nutzen ist." />
            <GlossEntry term="Primärkonstruktor" def="Konstruktor mit allen Parametern und vollständiger Validierung (Single Point of Validation)." />
            <GlossEntry term="Convenience-Konstruktor" def="Konstruktor mit weniger Parametern + Defaults, der per this(...) an den Primär delegiert." />
            <GlossEntry term="Overloading" def="Mehrere Methoden/Konstruktoren mit gleichem Namen, aber unterschiedlicher Parameterliste." />
            <GlossEntry term="Overriding · @Override" def="Eine geerbte/abstrakte Methode neu implementieren (toString, calculateSurcharge, formatForDisplay)." />
            <GlossEntry term="Checked Exception" def="Fehler, den der Compiler erzwingt zu behandeln (throws oder try-catch). ValidationException extends Exception." />
            <GlossEntry term="cause / Wrapping" def="Eine tiefere Exception als Ursache einpacken (Konstruktor mit Throwable cause), ohne die Spur zu verlieren." />
            <GlossEntry term="BigDecimal" def="Exakter Dezimal-Datentyp für Geld. String-Konstruktor, setScale, RoundingMode, Vergleich per compareTo." />
            <GlossEntry term="java.time" def="Moderne Datums-/Zeit-API: LocalDate, LocalDateTime, Duration, Period, DateTimeFormatter." />
            <GlossEntry term="Text Block" def='Mehrzeiliger String zwischen """ … """ — ideal für formatierte Ausgaben wie die Mitgliedskarte.' />
            <GlossEntry term="var" def="Lokale Typ-Inferenz: der Compiler leitet den Typ aus dem Initialisierer ab (nur für lokale Variablen)." />
            <GlossEntry term="static" def="Gehört zur Klasse, nicht zum Objekt. Customer.COUNTER zählt alle Kunden; getRegisteredCount() liest ihn." />
            <GlossEntry term="AtomicLong" def="Threadsicherer Long-Zähler; hier der Id-Generator in Customer." />
            <GlossEntry term="Regex / Pattern" def="Reguläre Ausdrücke für Textprüfung. private static final Pattern wird einmal kompiliert (EmailValidator)." />
            <GlossEntry term="Lombok" def="Bibliothek, die Boilerplate per Annotation erzeugt: @Getter, @EqualsAndHashCode, @RequiredArgsConstructor, @Builder." />
            <GlossEntry term="@Builder (auf Konstruktor)" def="Erzeugt einen Builder, der durch den validierenden Konstruktor läuft — er umgeht die Prüfung nicht." />
            <GlossEntry term="Gradle / Wrapper" def="Bau-Werkzeug. ./gradlew lädt die passende Gradle-Version selbst und baut/startet das Projekt (run)." />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>
            Lern-Trainer · Projektarchitektur „Kino-Ticketsystem" — OOP mit Java 25 LTS · Lombok · Gradle
          </span>
          <span style={{ color: C.dim, fontSize: 13 }}>Modul Programmieren · DHBW Mosbach</span>
        </div>
      </footer>
    </div>
  );
}

// Kleine Helfer-Komponenten & Inline-Style-Snippets
const codeInline = {
  background: C.bg,
  border: `1px solid ${C.line}`,
  borderRadius: 5,
  padding: "1px 6px",
  fontSize: 13,
  color: C.accent,
  fontFamily: "ui-monospace, Menlo, Consolas, monospace",
};

function LayerCard({ color, name, sub, children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <code style={{ fontSize: 15, fontWeight: 800, color }}>{name}</code>
          <span style={{ fontSize: 13, color: C.dim }}>{sub}</span>
        </div>
        <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>{children}</div>
      </div>
    </div>
  );
}
