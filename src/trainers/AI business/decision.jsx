import React, { useState, useEffect } from "react";

// ============================================================
//  THE $100M AI AGENCY PLAYBOOK — Überblick + Action-Plan
//  Quelle: Nate Herk × Devin Kearns (Custom AI Studio)
//  "How to Position Your AI Agency for a $100M Exit"
// ============================================================

const ACCENT = "#FF5A1F"; // burnt orange
const INK = "#0E0E10";
const PAPER = "#F4F0E8";
const MUTED = "#6B6258";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Space+Mono:wght@400;700&display=swap');
`;

const insights = [
  {
    n: "01",
    title: "Das meiste verkaufte AI-Zeug überlebt 2027 nicht",
    body:
      "Viel heutige AI-Arbeit sind aufgesetzte Features (Chatbot, Dashboard), die niemand nutzt. Sie sehen im Pitch gut aus, bewegen aber keine Geschäftszahl. Wer so verkauft, ist austauschbar.",
    tag: "These",
  },
  {
    n: "02",
    title: "Mid-Market ist die beste Zielgruppe – nicht SMB, nicht Enterprise",
    body:
      "Kleine Firmen haben kein Budget, Konzerne haben endlose Zyklen. Mittelständler haben Budget, Schmerz und Entscheidungsfreude. Sie können jetzt 12–24 Monate Lernvorsprung aufbauen.",
    tag: "Markt",
  },
  {
    n: "03",
    title: "Kunden kaufen Entlastung – binde dich an eine echte KPI",
    body:
      "Firmen kaufen AI oft emotional (Druck vom Board, Konkurrenz auf LinkedIn). Verkaufe nicht 'AI', sondern das Ergebnis: Welche Kennzahl bewegt sich? Beispiel: 21% Retourenquote senken = Millionen.",
    tag: "Positionierung",
  },
  {
    n: "04",
    title: "Positioniere dich mit Frameworks, nicht als Vendor",
    body:
      "Ein wiederholbares, benanntes Framework (z. B. fixe Workshops, Agentic-Operating-System) schafft Vertrauen, standardisiert die Lieferung und hebt dich aus der Masse austauschbarer Dienstleister.",
    tag: "Positionierung",
  },
  {
    n: "05",
    title: "Wert-basierte Preise + skalierbare Prozesse",
    body:
      "Nicht nach Stunden abrechnen, sondern nach Outcome. Standardisierte Angebote (Fixed-Price-Workshops) vereinfachen Delivery und ebnen den Weg zu größeren Engagements und Retainern ($5k–$20k/Monat).",
    tag: "Pricing",
  },
  {
    n: "06",
    title: "Neue Modelle: Revenue-Share & AI-native Aufbau",
    body:
      "Erfolg an Kundenleistung koppeln (Revenue-Share) schafft langfristige, loyale Beziehungen. AI-native Firmen werden von Grund auf um AI gebaut – das ist die Marktrichtung.",
    tag: "Modell",
  },
];

const frameworks = [
  { name: "Partner-Modell", desc: "Team um dich herum aufbauen: erst Entwickler (Builds), dann Sales/Setter (Pipeline), du machst Audits & Strategie." },
  { name: "KPI-First-Positioning", desc: "Erst die geschäftskritische Kennzahl finden, dann darauf hin bauen – statt AI als Produkt zu verkaufen." },
  { name: "Fixed-Price-Workshops", desc: "Standardisiertes Einstiegsangebot, das Vertrauen aufbaut und zu größeren Projekten führt." },
  { name: "Agentic Operating System", desc: "Voll integriertes Multi-Agenten-System statt einzelner Insel-Automationen." },
];

const phases = [
  {
    week: "Woche 1",
    label: "Fokus & Positionierung",
    color: ACCENT,
    tasks: [
      "Eine Nische im Mid-Market wählen (Branche, in der du Schmerz kennst – z. B. Industrie/Maschinenbau über dein Emerson-Wissen).",
      "Die EINE KPI definieren, die du bewegst (z. B. Durchlaufzeit, Ausschussquote, manuelle Stunden).",
      "1-Satz-Positionierung formulieren: 'Ich helfe [Zielgruppe] [KPI] zu verbessern durch [Framework].'",
    ],
  },
  {
    week: "Woche 2",
    label: "Angebot & Framework",
    color: "#2E7D5B",
    tasks: [
      "Ein benanntes Framework definieren (Schritte: Audit → Build → Iterate).",
      "Fixed-Price-Einstiegsangebot bauen (z. B. AI-Audit-Workshop mit festem Preis).",
      "Pricing wert-basiert kalkulieren statt Stundensatz – an erwarteter KPI-Wirkung orientieren.",
    ],
  },
  {
    week: "Woche 3",
    label: "Portfolio & Proof",
    color: "#1F6FB2",
    tasks: [
      "1–2 Demo-/Portfolio-Builds erstellen (n8n-Workflow, Agenten-Setup) als greifbarer Beweis.",
      "Ein Mini-Case dokumentieren: Problem → Lösung → gespartes Zeit/Geld.",
      "LinkedIn-Profil & Pitch auf KPI-Sprache umstellen ('Entlastung', nicht 'AI-Feature').",
    ],
  },
  {
    week: "Woche 4",
    label: "Akquise & Messung",
    color: "#8E44AD",
    tasks: [
      "10–20 gezielte Mid-Market-Kontakte ansprechen (warm + cold), Workshop als Einstieg anbieten.",
      "Ersten bezahlten Audit/Workshop landen oder konkret terminieren.",
      "Metriken-Tracking aufsetzen: Outreach-Antwortrate, gebuchte Calls, KPI-Baseline beim Kunden.",
    ],
  },
];

const quickWins = [
  "Stop 'AI' zu verkaufen – formuliere jedes Angebot über eine Geschäftskennzahl.",
  "Ziel-Segment von SMB/Enterprise auf Mid-Market verschieben.",
  "Dein erstes wiederholbares Framework auf einer Seite skizzieren.",
];

const metrics = [
  { label: "Outreach → Antwortrate", target: "> 15%" },
  { label: "Gebuchte Audit-Calls / Monat", target: "≥ 4" },
  { label: "Retainer-Wert", target: "$5k–$20k / Mo." },
];

const caveats = [
  "Sprecher verkaufen eigene Programme (Skool, Communities) – Eigeninteresse mitdenken.",
  "Das Agentur-Modell gilt als gesättigt; Differenzierung über echte KPI-Ergebnisse ist Pflicht.",
  "Zahlen wie '$100M Exit' sind aspirational, kein Versprechen – als Richtung lesen, nicht als Plan.",
];

function Stat({ value, label }) {
  return (
    <div style={{ flex: "1 1 0" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 38, fontWeight: 600, color: ACCENT, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginTop: 8 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [activePhase, setActivePhase] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ background: PAPER, color: INK, minHeight: "100vh", fontFamily: "'Fraunces', serif", position: "relative", overflow: "hidden" }}>
      <style>{FONTS}</style>
      {/* grain */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.04, zIndex: 1,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "64px 28px 96px", position: "relative", zIndex: 2 }}>

        {/* HEADER */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(14px)", transition: "all .7s ease" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT }}>
            Playbook · Nate Herk × Devin Kearns
          </div>
          <h1 style={{ fontSize: "clamp(34px, 6vw, 64px)", fontWeight: 600, lineHeight: 1.02, margin: "14px 0 0", letterSpacing: "-0.02em" }}>
            Wie du deine AI-Agentur<br />
            für einen <span style={{ fontStyle: "italic", color: ACCENT }}>$100M&nbsp;Exit</span> positionierst
          </h1>
          <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 18, color: MUTED, maxWidth: 620, marginTop: 20, lineHeight: 1.5 }}>
            Echter Enterprise-Wert statt Lifestyle-Business. Warum der Mid-Market gewinnt, warum
            austauschbare AI-Arbeit 2027 nicht überlebt – und wie du dich mit Frameworks statt als
            Vendor positionierst.
          </p>
        </div>

        {/* STAT BAR */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 48, padding: "28px 0", borderTop: `1px solid ${INK}22`, borderBottom: `1px solid ${INK}22` }}>
          <Stat value="1:44h" label="Videolänge" />
          <Stat value="Mid-Market" label="Prime-Zielgruppe" />
          <Stat value="2027" label="Filter-Jahr" />
          <Stat value="$5–20k" label="Retainer / Monat" />
        </div>

        {/* ===== ÜBERBLICK ===== */}
        <SectionTitle kicker="Teil 1" title="Überblick & Kerninhalte" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {insights.map((it, i) => (
            <div key={it.n}
              style={{ background: "#fff", border: `1px solid ${INK}14`, borderRadius: 4, padding: "22px 22px 24px",
                boxShadow: "0 1px 0 rgba(0,0,0,0.04)", position: "relative",
                opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `all .6s ease ${0.1 + i * 0.07}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: ACCENT }}>{it.n}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: MUTED, border: `1px solid ${INK}22`, padding: "3px 8px", borderRadius: 99 }}>{it.tag}</span>
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.2, margin: "12px 0 8px", letterSpacing: "-0.01em" }}>{it.title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#3A352E", margin: 0 }}>{it.body}</p>
            </div>
          ))}
        </div>

        {/* FRAMEWORKS */}
        <SectionTitle kicker="Teil 2" title="Frameworks & Modelle" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {frameworks.map((f) => (
            <div key={f.name} style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{f.name}</div>
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ===== ANWENDUNG ===== */}
        <SectionTitle kicker="Teil 3" title="Anwendung — dein 30-Tage-Plan" />

        {/* Quick Wins */}
        <div style={{ background: INK, color: PAPER, borderRadius: 6, padding: "26px 26px 28px", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT }}>Quick Wins · diese Woche</div>
          <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
            {quickWins.map((q, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, lineHeight: 1.45 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", color: ACCENT, fontSize: 13, marginTop: 3 }}>→</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Phase tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {phases.map((p, i) => (
            <button key={i} onClick={() => setActivePhase(i)}
              style={{ cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 0.5,
                padding: "10px 16px", borderRadius: 99, border: `1.5px solid ${activePhase === i ? p.color : INK + "22"}`,
                background: activePhase === i ? p.color : "transparent", color: activePhase === i ? "#fff" : INK,
                transition: "all .25s ease", fontWeight: 700 }}>
              {p.week}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: `1px solid ${INK}14`, borderRadius: 6, padding: "28px 28px 30px", borderTop: `4px solid ${phases[activePhase].color}` }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 24, fontWeight: 600 }}>
            {phases[activePhase].label}
          </div>
          <ol style={{ margin: "18px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 14, counterReset: "step" }}>
            {phases[activePhase].tasks.map((t, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: phases[activePhase].color + "1A",
                  color: phases[activePhase].color, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
                <span style={{ fontSize: 15.5, lineHeight: 1.5, color: "#2A2620" }}>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Metrics */}
        <SectionTitle kicker="Teil 4" title="Fortschritt messen" />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ flex: "1 1 200px", background: "#fff", border: `1px solid ${INK}14`, borderRadius: 6, padding: "20px 22px" }}>
              <div style={{ fontSize: 13, color: MUTED, fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: INK, marginTop: 6 }}>{m.target}</div>
            </div>
          ))}
        </div>

        {/* Caveats */}
        <SectionTitle kicker="Teil 5" title="Kritische Einordnung" />
        <div style={{ display: "grid", gap: 10 }}>
          {caveats.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#FBEFE6", border: `1px solid ${ACCENT}33`, borderRadius: 4, padding: "14px 16px" }}>
              <span style={{ color: ACCENT, fontSize: 15, fontWeight: 700 }}>!</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5A3A28" }}>{c}</span>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${INK}22`, fontFamily: "'Space Mono', monospace", fontSize: 11, color: MUTED, lineHeight: 1.7 }}>
          Basierend auf öffentlich recherchierten Inhalten zum Video „How to Position Your AI Agency for a $100M Exit“
          (Nate Herk | AI Automation, Gast: Devin Kearns, Custom AI Studio).
          Aussagen sind Standpunkte der Sprecher, keine Garantie. Eigene Recherche empfohlen.
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }) {
  return (
    <div style={{ margin: "64px 0 24px" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: ACCENT }}>{kicker}</div>
      <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "6px 0 0" }}>{title}</h2>
    </div>
  );
}