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

// Apple-inspirierte Light-Palette: hell, aber nicht reinweiß.
// Hintergrund = Apples typisches Systemgrau (#f5f5f7), Karten in Weiß,
// weiche Schatten statt harter Linien, near-black Text, System-Blau als Akzent.
const C = {
  bg: "#f5f5f7", // Apple Systemgrau
  bg2: "#ececee", // etwas tiefer für Verläufe
  side: "rgba(255,255,255,0.72)", // frosted Sidebar
  panel: "#ffffff",
  panelSoft: "#fbfbfd",
  line: "#e3e3e6",
  lineSoft: "#ededf0",
  text: "#1d1d1f", // Apple near-black
  text2: "#424245",
  dim: "#86868b", // Apple Sekundärgrau
  accent: "#0071e3", // Apple System-Blau
  accentSoft: "#e8f1fd",
  hover: "#f0f0f3",
  // dunkler Bühnen-Hintergrund hinter den Live-Vorschauen
  previewBg: "#0d1117",
};

// Apple-Schriftstack (SF Pro) + getrennter Monospace-Stack.
const sans =
  "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Segoe UI',system-ui,Roboto,Helvetica,Arial,sans-serif";
const mono = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace";

// React.lazy-Komponenten EINMAL pro Trainer erzeugen und cachen.
// Sonst würde bei jedem Re-Render (z. B. Tippen ins Suchfeld) ein neues
// Lazy-Component entstehen → der offene Trainer würde neu gemountet (Flackern,
// State-Verlust). Der Cache hält die Identität stabil. Wird auch von den
// Live-Vorschauen genutzt, damit Kachel und Vollansicht dasselbe Modul teilen.
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
// `compact` rendert eine schlanke Fehlerfläche für die kleinen Vorschau-Kacheln.
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
      if (this.props.compact) {
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 6,
              background: C.previewBg,
              color: "#ff7b72",
              fontFamily: mono,
              fontSize: 12,
              textAlign: "center",
              padding: 16,
            }}
          >
            <span style={{ fontSize: 22 }}>⚠</span>
            <span>Vorschau nicht verfügbar</span>
          </div>
        );
      }
      return (
        <div style={{ padding: 40, fontFamily: sans, color: C.text }}>
          <div style={{ color: "#d70015", fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
            ⚠ Dieser Trainer konnte nicht geladen werden.
          </div>
          <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6, maxWidth: 640 }}>
            Wahrscheinliche Ursachen: fehlendes <code>export default</code>,
            ein Syntaxfehler in der Datei, oder ein Laufzeitfehler beim Rendern.
            Details stehen in der Browser-Konsole.
          </div>
          <pre
            style={{
              marginTop: 16,
              background: "#fff5f5",
              border: `1px solid #ffd7d4`,
              borderRadius: 10,
              padding: "12px 14px",
              color: "#d70015",
              fontSize: 12,
              fontFamily: mono,
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

// Globale Stile: Fokus-Sichtbarkeit (A11y), weiche Animationen, schlanke
// Scrollbars und der Apple-typische Karten-Hover. Inline-Styles können kein
// :focus-visible / @keyframes — daher ein kleines Stylesheet.
const globalStyles = `
  * { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  .lt-focusable:focus-visible {
    outline: 3px solid ${C.accent}55;
    outline-offset: 1px;
    border-radius: 10px;
  }
  .lt-tile {
    transition: transform .22s cubic-bezier(.25,.8,.25,1), box-shadow .22s cubic-bezier(.25,.8,.25,1);
  }
  .lt-tile:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
  }
  .lt-tile:focus-visible {
    outline: 3px solid ${C.accent}66;
    outline-offset: 3px;
  }
  .lt-tile:hover .lt-tile-preview { transform: scale(0.355); }
  .lt-tile-arrow { transition: transform .22s ease, opacity .22s ease; }
  .lt-tile:hover .lt-tile-arrow { transform: translateX(3px); opacity: 1; }
  .lt-nav { transition: background .15s ease, color .15s ease; }
  @keyframes lt-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .lt-fade { animation: lt-fade-in .4s cubic-bezier(.25,.8,.25,1) both; }
  @keyframes lt-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .lt-skeleton {
    background: linear-gradient(90deg, #161c26 25%, #232c3a 50%, #161c26 75%);
    background-size: 200% 100%;
    animation: lt-shimmer 1.4s ease-in-out infinite;
  }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: #c7c7cc; border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
  ::-webkit-scrollbar-thumb:hover { background: #aeaeb2; background-clip: content-box; }
  ::-webkit-scrollbar-track { background: transparent; }
`;

// Live-Vorschau eines Trainers: rendert das ECHTE JSX-Modul, skaliert auf
// Thumbnail-Größe herunter, klippt den Überlauf und deaktiviert Interaktion.
// So sieht man in der Galerie sofort, wie der Trainer wirklich aussieht.
const PREVIEW_SCALE = 0.34;
function TrainerPreview({ trainer }) {
  const Comp = getLazy(trainer);
  const inv = `${100 / PREVIEW_SCALE}%`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: C.previewBg,
      }}
    >
      <div
        className="lt-tile-preview"
        style={{
          width: inv,
          height: inv,
          transform: `scale(${PREVIEW_SCALE})`,
          transformOrigin: "top left",
          transition: "transform .35s cubic-bezier(.25,.8,.25,1)",
        }}
      >
        <TrainerErrorBoundary resetKey={trainer.key} compact>
          <Suspense
            fallback={<div className="lt-skeleton" style={{ width: "100%", height: "100%" }} />}
          >
            <Comp />
          </Suspense>
        </TrainerErrorBoundary>
      </div>
    </div>
  );
}

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
        background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`,
        color: C.text,
        fontFamily: sans,
      }}
    >
      <style>{globalStyles}</style>
      {/* Sidebar */}
      <aside
        aria-label="Trainer-Navigation"
        style={{
          width: 288,
          flexShrink: 0,
          background: C.side,
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderRight: `1px solid ${C.line}`,
          padding: "24px 0",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 22px 18px" }}>
          <div
            style={{
              color: C.accent,
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.5,
            }}
          >
            LERN·TRAINER
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 3, letterSpacing: -0.5 }}>
            Galerie
          </div>
          <div style={{ color: C.dim, fontSize: 12.5, marginTop: 3 }}>
            {trainers.length} Trainer · {Object.keys(grouped).length} Themen
          </div>
          <div style={{ position: "relative", marginTop: 16 }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: C.dim,
                fontSize: 14,
                pointerEvents: "none",
              }}
            >
              ⌕
            </span>
            <input
              ref={searchRef}
              type="search"
              className="lt-focusable"
              placeholder="Suchen …  ( / )"
              aria-label="Trainer durchsuchen"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: C.panel,
                border: `1px solid ${C.line}`,
                borderRadius: 980,
                color: C.text,
                padding: "9px 14px 9px 32px",
                fontSize: 13.5,
                fontFamily: sans,
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>
        </div>

        <div style={{ padding: "0 12px" }}>
          <button
            className="lt-focusable lt-nav"
            aria-current={active === null ? "page" : undefined}
            onClick={() => setActive(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              textAlign: "left",
              background: active === null ? C.accentSoft : "transparent",
              border: "none",
              borderRadius: 10,
              color: active === null ? C.accent : C.text2,
              fontWeight: active === null ? 600 : 500,
              padding: "9px 12px",
              fontSize: 13.5,
              fontFamily: sans,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (active !== null) e.currentTarget.style.background = C.hover;
            }}
            onMouseLeave={(e) => {
              if (active !== null) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 15 }}>⌂</span> Übersicht
          </button>
        </div>

        {Object.entries(grouped).map(([thema, items]) => (
          <div key={thema} style={{ marginTop: 18, padding: "0 12px" }}>
            <div
              style={{
                padding: "4px 12px 6px",
                color: C.dim,
                fontFamily: sans,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {thema}
            </div>
            {items.map((t) => {
              const on = active?.key === t.key;
              return (
                <button
                  key={t.key}
                  className="lt-focusable lt-nav"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setActive(t)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: on ? C.accentSoft : "transparent",
                    border: "none",
                    borderRadius: 10,
                    color: on ? C.accent : C.text2,
                    fontWeight: on ? 600 : 500,
                    padding: "8px 12px",
                    fontSize: 13.5,
                    fontFamily: sans,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!on) e.currentTarget.style.background = C.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (!on) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {t.titel}
                </button>
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "12px 24px",
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
          <StartScreen trainers={filtered} grouped={grouped} query={query} onPick={setActive} />
        ) : (
          <div className="lt-fade">
            <header
              style={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 28px",
                background: "rgba(245,245,247,0.8)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                borderBottom: `1px solid ${C.line}`,
              }}
            >
              <button
                className="lt-focusable"
                onClick={() => setActive(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: C.panel,
                  border: `1px solid ${C.line}`,
                  borderRadius: 980,
                  color: C.accent,
                  fontFamily: sans,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 14px",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                ‹ Zurück
              </button>
              <div style={{ fontSize: 13, color: C.dim }}>
                {active.thema} <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{active.titel}</span>
              </div>
            </header>
            <Suspense
              fallback={
                <div style={{ padding: 40, color: C.dim, fontFamily: mono }}>
                  Lade {active.titel} …
                </div>
              }
            >
              <TrainerErrorBoundary resetKey={active.key}>
                <Active />
              </TrainerErrorBoundary>
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}

function StartScreen({ trainers, grouped, query, onPick }) {
  return (
    <div className="lt-fade" style={{ padding: "56px 48px 64px", maxWidth: 1180 }}>
      <h1 style={{ fontSize: 40, margin: 0, fontWeight: 700, letterSpacing: -1 }}>
        Deine Lern-Trainer
      </h1>
      <p style={{ color: C.text2, fontSize: 17, lineHeight: 1.55, maxWidth: 640, marginTop: 12 }}>
        Alle interaktiven Trainer aus deinem Studium an einem Ort. Jede Kachel zeigt eine
        Live-Vorschau des echten Trainers – klick rein, um loszulegen. Neue Trainer
        hinzufügen: lege einfach eine{" "}
        <code style={{ color: C.accent, fontFamily: mono, fontSize: 14 }}>.jsx</code>-Datei in
        einen Ordner unter{" "}
        <code style={{ color: C.accent, fontFamily: mono, fontSize: 14 }}>
          src/trainers/&lt;Thema&gt;/
        </code>
        .
      </p>

      {Object.entries(grouped).map(([thema, items]) => (
        <section key={thema} style={{ marginTop: 44 }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: C.dim,
              margin: "0 0 18px",
            }}
          >
            {thema}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 22,
            }}
          >
            {items.map((t) => (
              <article
                key={t.key}
                className="lt-tile lt-focusable"
                role="button"
                tabIndex={0}
                aria-label={`${t.titel} (${t.thema}) öffnen`}
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
                  borderRadius: 18,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.04)",
                }}
              >
                {/* Live-Vorschau (echtes JSX, skaliert) */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    borderBottom: `1px solid ${C.lineSoft}`,
                    background: C.previewBg,
                  }}
                >
                  <TrainerPreview trainer={t} />
                  {/* sanfter Verlauf für besseren Übergang zum Footer */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(13,17,23,0) 70%, rgba(13,17,23,0.35) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>
                {/* Footer mit Titel */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: C.accent,
                        fontFamily: mono,
                        fontSize: 10.5,
                        fontWeight: 600,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                      }}
                    >
                      {t.thema}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginTop: 3,
                        letterSpacing: -0.2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.titel}
                    </div>
                  </div>
                  <span
                    className="lt-tile-arrow"
                    aria-hidden="true"
                    style={{
                      marginLeft: "auto",
                      color: C.accent,
                      fontSize: 20,
                      opacity: 0.55,
                      flexShrink: 0,
                    }}
                  >
                    ›
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {trainers.length === 0 && (
        <div
          style={{
            marginTop: 40,
            padding: "32px 28px",
            background: C.panel,
            border: `1px dashed ${C.line}`,
            borderRadius: 16,
            color: C.dim,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {query ? (
            <>Keine Treffer für „{query}".</>
          ) : (
            <>
              Noch keine Trainer gefunden. Lege eine <code style={{ fontFamily: mono }}>.jsx</code>{" "}
              in <code style={{ fontFamily: mono }}>src/trainers/&lt;Thema&gt;/</code> ab.
            </>
          )}
        </div>
      )}
    </div>
  );
}
