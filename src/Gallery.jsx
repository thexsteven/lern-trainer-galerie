import React, { useState, useMemo, useEffect, useRef, Suspense } from "react";

/*
  AUTO-DISCOVERY:
  Jede .jsx-Datei unter src/trainers/<Thema>/ wird automatisch gefunden.
  - Ordnername  = Thema (Gruppierung in der Seitenleiste)
  - Dateiname   = Titel des Trainers
  Neuen Trainer hinzufügen? Einfach eine .jsx mit `export default` in
  den passenden Themen-Ordner legen. Fertig – Hot-Reload zeigt ihn sofort.
*/

const modules = import.meta.glob("./trainers/*/*.jsx");

// Pfade in { thema, titel, key, loader } zerlegen
function parseTrainers() {
  const list = Object.entries(modules).map(([path, loader]) => {
    const m = path.match(/\.\/trainers\/([^/]+)\/([^/]+)\.jsx$/);
    const thema = m ? m[1] : "Sonstige";
    const datei = m ? m[2] : path;
    const titel = datei
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { key: path, path, thema, titel, loader };
  });
  list.sort((a, b) =>
    a.thema === b.thema
      ? a.titel.localeCompare(b.titel, "de")
      : a.thema.localeCompare(b.thema, "de")
  );
  return list;
}

const C = {
  bg: "#0d1117",
  side: "#11161e",
  panel: "#151b24",
  line: "#2a3441",
  text: "#e6edf3",
  dim: "#8b97a7",
  accent: "#7ee787",
  hover: "#1b2330",
};
const mono = "'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace";

// React.lazy-Komponenten EINMAL pro Trainer erzeugen und cachen.
// Sonst würde bei jedem Re-Render (z. B. Tippen ins Suchfeld) ein neues
// Lazy-Component entstehen → der offene Trainer würde neu gemountet (Flackern,
// State-Verlust). Der Cache hält die Identität stabil.
const lazyCache = new Map();
function getLazy(t) {
  let comp = lazyCache.get(t.key);
  if (!comp) {
    comp = React.lazy(t.loader);
    lazyCache.set(t.key, comp);
  }
  return comp;
}

// Fängt Fehler eines einzelnen Trainers ab, statt die ganze Galerie abstürzen
// zu lassen. resetKey sorgt dafür, dass beim Wechsel des Trainers neu versucht wird.
class TrainerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: mono, color: C.text }}>
          <div style={{ color: "#ff7b72", fontSize: 14, marginBottom: 10 }}>
            ⚠ Dieser Trainer konnte nicht geladen werden.
          </div>
          <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.6, maxWidth: 640 }}>
            Wahrscheinliche Ursachen: fehlendes <code>export default</code>,
            ein Syntaxfehler in der Datei, oder ein Laufzeitfehler beim Rendern.
            Details stehen in der Browser-Konsole.
          </div>
          <pre
            style={{
              marginTop: 16,
              background: "#0b0f15",
              border: `1px solid ${C.line}`,
              borderRadius: 6,
              padding: "10px 12px",
              color: "#ff7b72",
              fontSize: 12,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Globale Fokus-Stile: macht Tab-Navigation sichtbar (Tastatur/A11y).
// Inline-Styles können kein :focus-visible — daher ein kleines Stylesheet.
const focusStyles = `
  .lt-focusable:focus-visible {
    outline: 2px solid ${C.accent};
    outline-offset: -2px;
    border-radius: 6px;
  }
  .lt-tile:focus-visible {
    outline: 2px solid ${C.accent};
    outline-offset: 2px;
  }
`;

export default function Gallery() {
  const trainers = useMemo(parseTrainers, []);
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = trainers.filter(
    (t) =>
      t.titel.toLowerCase().includes(query.toLowerCase()) ||
      t.thema.toLowerCase().includes(query.toLowerCase())
  );

  // nach Thema gruppieren
  const grouped = {};
  for (const t of filtered) (grouped[t.thema] ??= []).push(t);

  const Active = active ? getLazy(active) : null;
  const searchRef = useRef(null);

  // Tastatur-Shortcuts: Esc → zurück zum Start, "/" oder Ctrl/Cmd+K → Suche fokussieren
  useEffect(() => {
    function onKey(e) {
      const inField =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (e.key === "Escape") {
        if (inField && query) setQuery("");
        else if (active) setActive(null);
        else if (inField) e.target.blur();
      } else if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !inField)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, query]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{focusStyles}</style>
      {/* Sidebar */}
      <aside
        aria-label="Trainer-Navigation"
        style={{
          width: 280,
          flexShrink: 0,
          background: C.side,
          borderRight: `1px solid ${C.line}`,
          padding: "20px 0",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ color: C.accent, fontFamily: mono, fontSize: 11, letterSpacing: 2 }}>
            LERN-TRAINER
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>Galerie</div>
          <div style={{ color: C.dim, fontSize: 12, marginTop: 2 }}>
            {trainers.length} Trainer · {Object.keys(grouped).length} Themen
          </div>
          <input
            ref={searchRef}
            type="search"
            className="lt-focusable"
            placeholder="Suchen…  ( / )"
            aria-label="Trainer durchsuchen"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              marginTop: 14,
              width: "100%",
              boxSizing: "border-box",
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              color: C.text,
              padding: "8px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        <button
          className="lt-focusable"
          aria-current={active === null ? "page" : undefined}
          onClick={() => setActive(null)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            background: active === null ? C.hover : "transparent",
            border: "none",
            color: active === null ? C.accent : C.dim,
            padding: "8px 20px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ◇ Start
        </button>

        {Object.entries(grouped).map(([thema, items]) => (
          <div key={thema} style={{ marginTop: 14 }}>
            <div
              style={{
                padding: "4px 20px",
                color: C.dim,
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {thema}
            </div>
            {items.map((t) => (
              <button
                key={t.key}
                className="lt-focusable"
                aria-current={active?.key === t.key ? "page" : undefined}
                onClick={() => setActive(t)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: active?.key === t.key ? C.hover : "transparent",
                  borderLeft:
                    active?.key === t.key
                      ? `3px solid ${C.accent}`
                      : "3px solid transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  color: active?.key === t.key ? C.text : C.dim,
                  padding: "8px 20px",
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (active?.key !== t.key) e.currentTarget.style.background = C.panel;
                }}
                onMouseLeave={(e) => {
                  if (active?.key !== t.key) e.currentTarget.style.background = "transparent";
                }}
              >
                {t.titel}
              </button>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "12px 20px",
              color: C.dim,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Keine Treffer für „{query}".
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {active === null ? (
          <StartScreen trainers={trainers} grouped={grouped} onPick={setActive} />
        ) : (
          <Suspense
            fallback={
              <div style={{ padding: 40, color: C.dim, fontFamily: mono }}>
                Lade {active.titel}…
              </div>
            }
          >
            <div>
              <div
                style={{
                  padding: "12px 24px",
                  borderBottom: `1px solid ${C.line}`,
                  color: C.dim,
                  fontFamily: mono,
                  fontSize: 12,
                }}
              >
                {active.thema} / <span style={{ color: C.text }}>{active.titel}</span>
              </div>
              <TrainerErrorBoundary resetKey={active.key}>
                <Active />
              </TrainerErrorBoundary>
            </div>
          </Suspense>
        )}
      </main>
    </div>
  );
}

function StartScreen({ trainers, grouped, onPick }) {
  return (
    <div style={{ padding: "48px 40px", maxWidth: 900 }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Deine Lern-Trainer</h1>
      <p style={{ color: C.dim, fontSize: 15, lineHeight: 1.6, maxWidth: 620 }}>
        Alle interaktiven Trainer aus deinem Studium an einem Ort. Wähle links ein Thema,
        oder klick unten direkt auf eine Kachel. Neue Trainer hinzufügen: lege einfach eine{" "}
        <code style={{ color: C.accent, fontFamily: mono }}>.jsx</code>-Datei in einen
        Ordner unter <code style={{ color: C.accent, fontFamily: mono }}>src/trainers/&lt;Thema&gt;/</code>.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
          marginTop: 28,
        }}
      >
        {trainers.map((t) => (
          <div
            key={t.key}
            className="lt-tile"
            role="button"
            tabIndex={0}
            aria-label={`${t.titel} (${t.thema})`}
            onClick={() => onPick(t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(t);
              }
            }}
            style={{
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "16px 18px",
              cursor: "pointer",
              transition: "transform .1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}
          >
            <div
              style={{
                color: C.accent,
                fontFamily: mono,
                fontSize: 10.5,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {t.thema}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 6 }}>{t.titel}</div>
          </div>
        ))}
      </div>
      {trainers.length === 0 && (
        <div style={{ color: C.dim, marginTop: 30, fontFamily: mono }}>
          Noch keine Trainer gefunden. Lege eine .jsx in src/trainers/&lt;Thema&gt;/ ab.
        </div>
      )}
    </div>
  );
}
