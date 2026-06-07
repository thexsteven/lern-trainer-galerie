import React, { useState, useEffect, useRef } from "react";

/*
  Lern-Trainer: „Das ganze Projekt verstehen" — ai-prompt-library
  ---------------------------------------------------------------
  Animierter Erklärer: Architektur einer Full-Stack-Webanwendung
  FastAPI · SQLAlchemy · SQLite · Vanilla-JS-Frontend · Docker
  Self-contained: nur React + Inline-Styles, keine externen Libraries.
*/

// ---------------------------------------------------------------------------
// Design-System (Dark Theme)
// ---------------------------------------------------------------------------
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent:  "#38bdf8", // sky-blue – steht für REST-API / HTTP-Kommunikation
  accent2: "#fb923c", // orange   – steht für Sicherheit / Authentication
  good: "#86efac",
  warn: "#fca5a5",
  gold: "#fcd34d",
};

const LAYER = {
  root:     "#94a3b8",
  backend:  C.accent,
  router:   C.accent2,
  frontend: C.good,
  infra:    C.gold,
  database: "#c084fc",
};

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
*::selection { background: #38bdf8; color: #06121a; }
html { scroll-behavior: smooth; }
`;

// ---------------------------------------------------------------------------
// useReveal — IntersectionObserver-Hook
// ---------------------------------------------------------------------------
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setShown(true); }),
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
      <div style={{ color: C.accent, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
        {kicker}
      </div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", lineHeight: 1.2 }}>{title}</h2>
      {children}
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

function Tag({ color = C.accent, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.dim, marginRight: 14, whiteSpace: "nowrap" }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{ background: "rgba(251,146,60,0.08)", border: `1px solid ${C.accent2}`, borderRadius: 14, padding: "18px 20px", margin: "18px 0" }}>
      <div style={{ color: C.accent2, fontWeight: 700, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span>💡</span>{title}
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
            <code style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "2px 8px", fontSize: 12.5, color }}>
              {formula}
            </code>
          )}
        </div>
        <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

function LayerCard({ color, name, sub, children }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: C.panel, border: `1px solid ${C.line}`, borderLeft: `4px solid ${color}`, borderRadius: 12, padding: "16px 18px" }}>
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

const btn = { background: C.accent, color: "#06121a", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const ci = { background: C.bg, border: `1px solid ${C.line}`, borderRadius: 5, padding: "1px 6px", fontSize: 13, color: C.accent, fontFamily: "ui-monospace, Menlo, Consolas, monospace" };
const cb = { display: "block", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.6, fontFamily: "ui-monospace, Menlo, Consolas, monospace" };

function PlayerControls({ playing, setPlaying, onPrev, onNext, onReset, atStart, atEnd, label }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
      <button style={btn} onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ Pause" : "▶ Abspielen"}</button>
      <button style={{ ...btnGhost, opacity: atStart ? 0.4 : 1 }} onClick={onPrev} disabled={atStart}>◀ Schritt</button>
      <button style={{ ...btnGhost, opacity: atEnd ? 0.4 : 1 }} onClick={onNext} disabled={atEnd}>Schritt ▶</button>
      <button style={btnGhost} onClick={onReset}>↺ Reset</button>
      {label && <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>{label}</span>}
    </div>
  );
}

// ===========================================================================
// VIS 1 — Projekt-Explorer: läuft animiert durch jede Datei
// ===========================================================================
const TREE = [
  { depth: 0, kind: "folder", layer: "root",     name: "ai-prompt-library/",   role: "Projektwurzel. Enthält Backend (Python), Frontend (HTML/JS), Docker-Konfiguration und Dokumentation." },
  { depth: 1, kind: "file",   layer: "infra",    name: "docker-compose.yml",   role: "Startet Backend-Container und persistentes Volume für die SQLite-Datei — alles mit einem Befehl: docker compose up --build." },
  { depth: 1, kind: "folder", layer: "infra",    name: "docs/",                role: "Dokumentation: Deutsche Architekturbeschreibung und maschinenlesbare OpenAPI-Spezifikation aller Endpunkte." },
  { depth: 2, kind: "file",   layer: "infra",    name: "architecture.md",      role: "Erklärt das Gesamtsystem auf Deutsch: Schichten, Datenfluss, Sicherheitskonzept, Designentscheidungen." },
  { depth: 2, kind: "file",   layer: "infra",    name: "openapi.yml",          role: "Alle Endpunkte, Felder und Fehler in maschinenlesbarem YAML — wird auch von der FastAPI-SwaggerUI gerendert." },
  { depth: 1, kind: "folder", layer: "backend",  name: "backend/",             role: "Der Server-Teil: FastAPI-Anwendung in Python. HTTP-Routen, Datenbankzugriff, Authentifizierung, Validierung." },
  { depth: 2, kind: "file",   layer: "backend",  name: "main.py",              role: "Einstiegspunkt: verdrahtet alle Router (include_router), konfiguriert CORS-Middleware und erstellt DB-Tabellen beim Start." },
  { depth: 2, kind: "file",   layer: "database", name: "database.py",          role: "Konfiguriert SQLAlchemy-Engine (zeigt auf prompts.db) und stellt get_db() als Session-Factory für Dependency Injection bereit." },
  { depth: 2, kind: "file",   layer: "database", name: "models.py",            role: "ORM-Klassen User, Prompt, Tag und die Verbindungstabelle prompt_tags (n:m). Beschreibt das DB-Schema als Python-Code." },
  { depth: 2, kind: "file",   layer: "backend",  name: "schemas.py",           role: "Pydantic-Modelle: validieren Eingaben (alphanumerischer Regex), definieren den Ausgabe-Shape. Vertrag zwischen Client und Server." },
  { depth: 2, kind: "file",   layer: "backend",  name: "security.py",          role: "hash_password() und verify_password() via bcrypt, plus In-Memory-Session-Speicher { token → user_id }." },
  { depth: 2, kind: "file",   layer: "backend",  name: "dependencies.py",      role: "FastAPI-Abhängigkeiten: get_current_user() liest Cookie und lädt User; require_admin() prüft Rolle — 403 falls nein." },
  { depth: 2, kind: "file",   layer: "infra",    name: "Dockerfile",           role: "Container-Bauplan: python:3.12-slim, zuerst requirements.txt (Layer-Caching!), dann Code, dann uvicorn --host 0.0.0.0." },
  { depth: 2, kind: "file",   layer: "infra",    name: "requirements.txt",     role: "Pip-Abhängigkeiten: FastAPI, Uvicorn, SQLAlchemy, bcrypt, python-multipart. Wie build.gradle in Java-Projekten." },
  { depth: 2, kind: "folder", layer: "router",   name: "routers/",             role: "Modular aufgeteilte Endpunkte — je Fachbereich eine Datei, alle in main.py via include_router() registriert." },
  { depth: 3, kind: "file",   layer: "router",   name: "auth.py",              role: "/register, /login, /logout, /me. Erster Nutzer → automatisch Admin. Setzt und löscht HttpOnly-Session-Cookie." },
  { depth: 3, kind: "file",   layer: "router",   name: "prompts.py",           role: "Vollständiges CRUD: GET/POST/PUT/DELETE /prompts. Eigentümer-Check via _get_prompt_with_access(). Tags via _load_tags()." },
  { depth: 3, kind: "file",   layer: "router",   name: "tags.py",              role: "GET/POST für alle Nutzer; PUT/DELETE nur Admin. Tags bei Löschung per Kaskade aus prompt_tags entfernt." },
  { depth: 3, kind: "file",   layer: "router",   name: "admin.py",             role: "/admin/stats mit SQL-Aggregation (outerjoin + group_by + count) + /admin/users CRUD. Schützt letzten Admin." },
  { depth: 1, kind: "folder", layer: "frontend", name: "frontend/",            role: "Der Browser-Teil: kein Framework, kein Build-Tool — reines HTML, CSS und Vanilla JavaScript (ES6+)." },
  { depth: 2, kind: "file",   layer: "frontend", name: "index.html",           role: "Single-Page-App: Login/Register-Bereich + App-Bereich (Prompts, Tags, Admin). Kein Page-Reload, Views werden ein-/ausgeblendet." },
  { depth: 2, kind: "file",   layer: "frontend", name: "app.js",               role: "~460 Zeilen: api()-Wrapper mit credentials:'include', Auth-Zustand, alle CRUD-Funktionen, Toast-Benachrichtigungen." },
  { depth: 2, kind: "file",   layer: "frontend", name: "styles.css",           role: "Custom Properties, minimale Utility-Klassen, responsives Layout — kein Framework wie Bootstrap oder Tailwind." },
];

function ProjectExplorerVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= TREE.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1300);
    return () => clearInterval(timer.current);
  }, [playing]);

  const active = TREE[i];
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <div style={{ flex: "1 1 320px", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, maxHeight: 420, overflow: "auto" }}>
          {TREE.map((n, idx) => {
            const on = idx === i;
            const col = LAYER[n.layer];
            return (
              <div
                key={idx}
                onClick={() => setI(idx)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", marginLeft: n.depth * 14, borderRadius: 6, cursor: "pointer", background: on ? "rgba(252,211,77,0.14)" : "transparent", outline: on ? `1px solid ${C.gold}` : "1px solid transparent", color: on ? C.text : n.kind === "folder" ? C.text : C.dim, transition: "background .3s, outline .3s" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                <span style={{ fontWeight: n.kind === "folder" ? 700 : 400 }}>{n.kind === "folder" ? "📁 " : ""}{n.name}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 220 }}>
          <div className="pop" key={i} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: LAYER[active.layer] }} />
              <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: LAYER[active.layer], fontWeight: 700 }}>
                {active.layer === "root" ? "Projektwurzel" : active.layer + "-Schicht"}
              </span>
            </div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 15, fontWeight: 700, marginBottom: 10, color: C.text }}>{active.name}</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{active.role}</div>
          </div>
          <div style={{ marginTop: 14, color: C.dim, fontSize: 13 }}>Datei {i + 1} / {TREE.length}</div>
        </div>
      </div>
      <PlayerControls playing={playing} setPlaying={setPlaying} onPrev={() => setI((v) => Math.max(0, v - 1))} onNext={() => setI((v) => Math.min(TREE.length - 1, v + 1))} onReset={() => { setI(0); setPlaying(false); }} atStart={i === 0} atEnd={i === TREE.length - 1} />
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={LAYER.root}>Wurzel / Docs</Tag>
        <Tag color={LAYER.backend}>backend</Tag>
        <Tag color={LAYER.database}>database</Tag>
        <Tag color={LAYER.router}>routers</Tag>
        <Tag color={LAYER.frontend}>frontend</Tag>
        <Tag color={LAYER.infra}>infra</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 2 — HTTP-Request-Reise: „Prompt erstellen" durch alle Schichten
// ===========================================================================
const FLOW = [
  { layer: "frontend", file: "Browser / Formular",                  text: "Nutzer tippt Titel, Inhalt, wählt Tags",          detail: "Das HTML-Formular in index.html sammelt die Eingaben rein client-seitig. Noch kein Netzwerk, noch keine Validierung." },
  { layer: "frontend", file: 'app.js  api("POST /prompts", body)',   text: "fetch mit credentials: 'include'",               detail: "Der zentrale api()-Wrapper baut den fetch-Aufruf. credentials:'include' sorgt dafür, dass der Browser den Session-Cookie automatisch mitsendet — ohne dass man ihn per JS lesen müsste." },
  { layer: "frontend", file: "HTTP POST /prompts  +  Cookie-Header", text: "Anfrage + Cookie reist zu Port 8000",             detail: "Im Paket steckt der JSON-Body (title, content, tag_ids) und der Session-Token im Cookie-Header. Der Browser führt zuerst einen CORS-Preflight durch: Darf localhost:5500 die API auf :8000 ansprechen?" },
  { layer: "backend",  file: "main.py  CORSMiddleware",             text: "Origin-Check: localhost:5500 erlaubt?",           detail: "FastAPI prüft den Origin-Header. Nur localhost:5500 steht auf der Whitelist. allow_credentials=True ist zwingend nötig, damit Cookies überhaupt durchgelassen werden — fehlt das, blockiert der Browser den Request." },
  { layer: "backend",  file: "dependencies.py  get_current_user()", text: "Cookie lesen → User aus DB laden",               detail: "FastAPI ruft via Depends() automatisch get_current_user() auf, bevor der Handler startet. Die Funktion liest den 'session'-Cookie, schlägt die ID im _sessions-Dict nach und lädt den User. Kein gültiger Token → HTTP 401 Unauthorized." },
  { layer: "backend",  file: "schemas.py  PromptCreate",            text: "Pydantic validiert den Request-Body",            detail: "Pydantic prüft automatisch: Ist title alphanumerisch (Regex)? Ist content vorhanden? Sind tag_ids eine Liste ganzer Zahlen? Fehler → HTTP 422 Unprocessable Entity — der Route-Handler wird gar nicht erst aufgerufen." },
  { layer: "backend",  file: "routers/prompts.py  _load_tags()",    text: "tag_ids → echte Tag-Objekte aus DB",             detail: "Die Hilfsfunktion fragt die DB nach jedem Tag-ID ab. Nicht-existierende IDs → 404 Not Found. So können keine verwaisten Verknüpfungen entstehen." },
  { layer: "database", file: "models.py  Prompt(…)  db.add()",      text: "ORM erzeugt sicheres INSERT-Statement",          detail: "SQLAlchemy übersetzt das Python-Objekt in ein INSERT mit Prepared Statements (parametrisierten Abfragen). Kein String-Zusammensetzen — SQL-Injection strukturell unmöglich." },
  { layer: "database", file: "database.py  db.commit()  + refresh", text: "Transaktion wird dauerhaft gespeichert",         detail: "Erst commit() schreibt in die SQLite-Datei. db.refresh() lädt die vom DB generierte ID zurück ins Python-Objekt, damit sie in der Antwort erscheint." },
  { layer: "backend",  file: "schemas.py  PromptOut → JSON",        text: "Antwort: nur erlaubte Felder serialisieren",     detail: "Pydantic konvertiert das SQLAlchemy-Objekt zu JSON — ausschließlich die in PromptOut definierten Felder. Sensible Felder wie password_hash erscheinen nie in Antworten." },
  { layer: "frontend", file: "app.js  loadPrompts()",               text: "Browser-Tabelle wird neu aufgebaut",             detail: "Der Erfolgs-Callback ruft loadPrompts() auf — die Tabelle baut sich aus der frischen DB-Antwort neu auf. Kein Page-Reload, der neue Prompt erscheint sofort." },
];

const FLOW_LAYERS = ["frontend", "backend", "database"];
const FLOW_LABELS  = { frontend: "Frontend  (Browser)", backend: "Backend  (FastAPI)", database: "Datenbank  (SQLite)" };
const FLOW_COLOR   = { frontend: C.good, backend: C.accent, database: "#c084fc" };

function RequestFlowVis() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= FLOW.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, 1600);
    return () => clearInterval(timer.current);
  }, [playing]);

  const step = FLOW[i];

  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        {/* Schritt-Liste */}
        <div style={{ flex: "1 1 360px", minWidth: 280 }}>
          {FLOW.map((s, idx) => {
            const on   = idx === i;
            const done = idx < i;
            const col  = FLOW_COLOR[s.layer];
            return (
              <div
                key={idx}
                onClick={() => setI(idx)}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 10px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: on ? "rgba(252,211,77,0.12)" : "transparent", outline: on ? `1px solid ${C.gold}` : "1px solid transparent", opacity: done ? 0.55 : 1, transition: "all .3s" }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: on ? C.gold : done ? C.good : C.panel2, color: on || done ? "#06121a" : C.dim, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.line}` }}>
                  {done ? "✓" : idx + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: col, flexShrink: 0 }} />
                    <code style={{ fontSize: 11.5, color: on ? C.text : C.dim }}>{s.file}</code>
                  </div>
                  <div style={{ fontSize: 13, color: on ? C.text : C.dim, marginTop: 2 }}>{s.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schichten-Säule + Erklärung */}
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FLOW_LAYERS.map((l) => {
              const here = step.layer === l;
              return (
                <div
                  key={l}
                  style={{ border: `1px solid ${here ? FLOW_COLOR[l] : C.line}`, background: here ? "rgba(255,255,255,0.04)" : C.panel2, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, transition: "all .3s", animation: here ? "pulseGlow 1.4s ease-in-out infinite" : "none" }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: FLOW_COLOR[l] }} />
                  <span style={{ fontSize: 13, fontWeight: here ? 700 : 500, color: here ? C.text : C.dim }}>{FLOW_LABELS[l]}</span>
                  {here && <span className="pop" style={{ marginLeft: "auto", fontSize: 16 }}>📦</span>}
                </div>
              );
            })}
          </div>
          <div key={i} className="pop" style={{ marginTop: 14, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{step.detail}</div>
          </div>
        </div>
      </div>

      <PlayerControls playing={playing} setPlaying={setPlaying} onPrev={() => setI((v) => Math.max(0, v - 1))} onNext={() => setI((v) => Math.min(FLOW.length - 1, v + 1))} onReset={() => { setI(0); setPlaying(false); }} atStart={i === 0} atEnd={i === FLOW.length - 1} label={`Schritt ${i + 1} / ${FLOW.length}`} />
      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap" }}>
        <Tag color={C.gold}>aktiver Schritt</Tag>
        <Tag color={C.good}>Frontend</Tag>
        <Tag color={C.accent}>Backend</Tag>
        <Tag color="#c084fc">Datenbank</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// VIS 3 — N:M-Beziehung: prompt_tags interaktiv erkunden
// ===========================================================================
const PROMPTS_NM = [
  { id: 1, title: "Code-Review",     color: C.accent },
  { id: 2, title: "Essay-Generator", color: C.accent2 },
  { id: 3, title: "SQL-Helper",      color: C.good },
];
const TAGS_NM = [
  { id: 1, name: "coding",   color: "#e879f9" },
  { id: 2, name: "writing",  color: "#f97316" },
  { id: 3, name: "creative", color: "#84cc16" },
  { id: 4, name: "database", color: "#06b6d4" },
];
const JUNCTION_NM = [
  { prompt_id: 1, tag_id: 1 },
  { prompt_id: 1, tag_id: 2 },
  { prompt_id: 2, tag_id: 2 },
  { prompt_id: 2, tag_id: 3 },
  { prompt_id: 3, tag_id: 1 },
  { prompt_id: 3, tag_id: 4 },
];

function NMRelationVis() {
  const [selPrompt, setSelPrompt] = useState(null);
  const [selTag,    setSelTag]    = useState(null);

  const activeRows = JUNCTION_NM.filter(
    (j) => (selPrompt !== null && j.prompt_id === selPrompt) || (selTag !== null && j.tag_id === selTag)
  );
  const activePromptIds = new Set(activeRows.map((j) => j.prompt_id));
  const activeTagIds    = new Set(activeRows.map((j) => j.tag_id));

  function clickPrompt(id) { setSelTag(null);    setSelPrompt((v) => (v === id ? null : id)); }
  function clickTag(id)    { setSelPrompt(null); setSelTag((v)    => (v === id ? null : id)); }

  const pColor = (id) => PROMPTS_NM.find((x) => x.id === id)?.color ?? C.dim;
  const tColor = (id) => TAGS_NM.find((x) => x.id === id)?.color    ?? C.dim;

  return (
    <Card>
      <p style={{ color: C.dim, fontSize: 13.5, marginBottom: 18, lineHeight: 1.6 }}>
        Klick auf einen Prompt oder Tag — die Verbindungstabelle <code style={ci}>prompt_tags</code> in der Mitte leuchtet auf und zeigt, welche Zeilen verknüpft sind.
      </p>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Prompts */}
        <div style={{ flex: "1 1 150px", minWidth: 130 }}>
          <div style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>prompts</div>
          {PROMPTS_NM.map((p) => {
            const active = selPrompt === p.id || activePromptIds.has(p.id);
            return (
              <div
                key={p.id}
                onClick={() => clickPrompt(p.id)}
                style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 8, border: `1px solid ${active ? p.color : C.line}`, background: active ? "rgba(255,255,255,0.05)" : C.panel2, color: active ? C.text : C.dim, transition: "all .25s", fontWeight: active ? 700 : 400, fontSize: 13.5 }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block", marginRight: 8 }} />
                {p.title}
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>3 Prompts</div>
        </div>

        {/* Junction Table */}
        <div style={{ flex: "1 1 200px", minWidth: 170 }}>
          <div style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
            prompt_tags&nbsp;<span style={{ fontWeight: 400 }}>(Verbindung)</span>
          </div>
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "6px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 11, color: C.dim, fontWeight: 700 }}>prompt_id (FK)</span>
              <span style={{ fontSize: 11, color: C.dim, fontWeight: 700 }}>tag_id (FK)</span>
            </div>
            {JUNCTION_NM.map((j, idx) => {
              const isActive = activeRows.some((a) => a.prompt_id === j.prompt_id && a.tag_id === j.tag_id);
              return (
                <div
                  key={idx}
                  className={isActive ? "pop" : ""}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "7px 14px", borderBottom: idx < JUNCTION_NM.length - 1 ? `1px solid ${C.line}` : "none", background: isActive ? "rgba(252,211,77,0.12)" : "transparent", transition: "background .3s" }}
                >
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: isActive ? pColor(j.prompt_id) : C.dim }}>{j.prompt_id}</span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: isActive ? tColor(j.tag_id)    : C.dim }}>{j.tag_id}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 4, textAlign: "center" }}>6 Verknüpfungen</div>
        </div>

        {/* Tags */}
        <div style={{ flex: "1 1 130px", minWidth: 110 }}>
          <div style={{ fontSize: 11, color: C.dim, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>tags</div>
          {TAGS_NM.map((t) => {
            const active = selTag === t.id || activeTagIds.has(t.id);
            return (
              <div
                key={t.id}
                onClick={() => clickTag(t.id)}
                style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 8, border: `1px solid ${active ? t.color : C.line}`, background: active ? "rgba(255,255,255,0.05)" : C.panel2, color: active ? C.text : C.dim, transition: "all .25s", fontWeight: active ? 700 : 400, fontSize: 13.5 }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, display: "inline-block", marginRight: 8 }} />
                {t.name}
              </div>
            );
          })}
          <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>4 Tags</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Tag color={C.gold}>aktive Verknüpfung</Tag>
        <Tag color={C.dim}>keine Auswahl</Tag>
      </div>
    </Card>
  );
}

// ===========================================================================
// Haupt-Komponente
// ===========================================================================
export default function WebEngProjektTrainer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{STYLE}</style>

      {/* Hero */}
      <header style={{ borderBottom: `1px solid ${C.line}`, padding: "64px 24px 48px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: C.accent2 }} />
            <span style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: C.dim, fontWeight: 700 }}>
              Lern-Trainer · Web Engineering 2 — Projektarchitektur
            </span>
          </div>
          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: "0 0 18px" }}>
            Das ganze Projekt verstehen:
            <br />
            <span style={{ color: C.accent }}>ai-prompt-library</span>, Schicht für Schicht
          </h1>
          <p style={{ fontSize: 17, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
            Eine Full-Stack-Webanwendung in ~2 000 Zeilen: Python-Backend (FastAPI), relationale Datenbank (SQLite über SQLAlchemy), Cookie-Authentifizierung (bcrypt) und Vanilla-JavaScript-Frontend — alles in Docker verpackt. Dieser Trainer zeigt dir, <b style={{ color: C.text }}>warum</b> der Code so aufgeteilt ist, <b style={{ color: C.text }}>wie</b> ein HTTP-Request durch alle Schichten reist und <b style={{ color: C.text }}>was</b> jede einzelne Datei tut.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#explorer" style={{ ...btn, textDecoration: "none" }}>▶ Projekt erkunden</a>
            <a href="#glossar"  style={{ ...btnGhost, textDecoration: "none" }}>Zum Glossar</a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 56 }} />

        {/* 0 — Das Problem */}
        <Section kicker="0 · Das Problem" title="Warum nicht alles in eine Datei?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Man könnte einen Prompt-Manager in einer einzigen Python-Datei schreiben: Datenbankverbindung aufbauen, Passwort prüfen, HTTP-Routen definieren, SQL-Abfragen ausführen — alles direkt hintereinander. Für ein schnelles Skript reicht das. Sobald die Anwendung aber <b style={{ color: C.text }}>wachsen, getestet oder von mehreren Leuten gepflegt</b> werden soll, wird so eine Datei zur Falle:
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", marginTop: 8 }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Alles vermischt</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>Eine Änderung am Passwort-Hashing kann die SQL-Abfrage nebenan kaputt machen. Code, der alles macht, macht alles schlecht wartbar.</div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Kaum testbar</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>Wie testest du die Validierungsregel allein, wenn sie mit HTTP-Handling und Datenbank-Code verwirrt ist? Du müsstest jedes Mal das komplette System hochfahren.</div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Keine Rollenverteilung</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>Im Team kann nicht Person A an der Auth arbeiten, während Person B CRUD-Routen schreibt — beides stünde in derselben Datei und würde ständig kollidieren.</div>
            </Card>
          </div>
          <InfoBox title="Die Leitfrage des Designs">
            „Wenn ich morgen die SQLite-Datenbank gegen PostgreSQL tausche oder das Passwort-Hashing von bcrypt auf Argon2 umstelle — wie viele Dateien muss ich anfassen?" Antwort dieses Projekts: <b>genau eine.</b> Dafür gibt es die Schichten.
          </InfoBox>
        </Section>

        {/* 1 — Kernidee */}
        <Section kicker="1 · Die Kernidee" title="Drei Schichten, je eine Verantwortung">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Die Anwendung folgt der <b style={{ color: C.accent }}>3-Tier-Architektur</b> (drei-Ebenen-Architektur): Frontend, Backend und Datenbank sind physisch und logisch getrennt. Jede Schicht (englisch <i>tier</i> oder <i>layer</i>) kommuniziert nur mit ihrer direkten Nachbarschicht — niemals quer durch. Das macht jede Ebene eigenständig austauschbar.
          </p>
          <div style={{ display: "grid", gap: 10, marginTop: 6 }}>
            <LayerCard color={C.good} name="Frontend" sub="Der Browser — was der Nutzer sieht und bedient">
              Reines HTML, CSS und JavaScript. Schickt HTTP-Requests an das Backend und aktualisiert die Seite ohne vollständigen Reload. Kennt kein SQL, kein bcrypt, keine Datenbankverbindung.
            </LayerCard>
            <LayerCard color={C.accent} name="Backend / API" sub="Der Server — Logik, Regeln, Sicherheit">
              FastAPI in Python. Nimmt HTTP-Anfragen entgegen, prüft <i>wer fragt</i> (Authentication — Authentifizierung), <i>was der darf</i> (Authorization — Autorisierung), validiert Eingaben und redet mit der Datenbank. Kennt kein HTML.
            </LayerCard>
            <LayerCard color="#c084fc" name="Datenbank" sub="Die Speicherschicht — persistente Daten">
              SQLite: eine einzelne Datei (<code style={ci}>prompts.db</code>), die alle Prompts, Users und Tags dauerhaft speichert. Wird ausschließlich über SQLAlchemy (das ORM — Object Relational Mapper) angesprochen.
            </LayerCard>
          </div>
          <InfoBox title="REST — das Kommunikationsprinzip zwischen Frontend und Backend">
            <b>REST</b> (Representational State Transfer) ist kein Protokoll, sondern eine Konvention: HTTP-Verben bilden CRUD-Operationen ab. <code style={ci}>GET /prompts</code> = Lesen, <code style={ci}>POST /prompts</code> = Erstellen, <code style={ci}>PUT /prompts/3</code> = Aktualisieren, <code style={ci}>DELETE /prompts/3</code> = Löschen. Klar, vorhersehbar, von jeder Sprache nutzbar.
          </InfoBox>
        </Section>

        {/* VIS 1 */}
        <Section kicker="Interaktiv · Explorer" title="Jede Datei, einmal angefasst">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Klick auf eine Datei oder drück ▶ — der Explorer läuft durch das komplette Projekt und erklärt jede Datei in einem Satz. Die Farbpunkte zeigen die Zugehörigkeit.
          </p>
          <div id="explorer" />
          <ProjectExplorerVis />
        </Section>

        {/* 2 — Authentifizierung */}
        <Section kicker="2 · Der schwierige Teil" title="Wie bleibt die Authentifizierung sicher?">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            HTTP (das Protokoll, über das Webanfragen laufen) ist von Natur aus <b style={{ color: C.accent2 }}>zustandslos</b> (englisch <i>stateless</i>): Jede Anfrage ist unabhängig, der Server „erinnert" sich an nichts. Für eine App mit Login braucht man aber Zustand — der Server muss wissen, wer angemeldet ist. Die Lösung: ein <b style={{ color: C.text }}>Session-Cookie</b>.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
            <Card style={{ flex: "1 1 260px", background: C.panel2 }}>
              <div style={{ color: C.accent2, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Schritt 1 — Passwort nie im Klartext speichern</div>
              <code style={{ ...cb, color: C.accent2 }}>
                {"# security.py\n"}
                {"hash = bcrypt.hashpw(\n"}
                {"    password.encode(), bcrypt.gensalt()\n"}
                {")\n"}
                {"# Ergebnis: $2b$12$SALT…HASH…"}
              </code>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                bcrypt berechnet einen <b>irreversiblen Hash</b> (ein Einweg-Fingerabdruck). In der DB steht niemals das echte Passwort. Ein Salt (zufällige Zeichenfolge, eingemischt vor dem Hashen) sorgt dafür, dass zwei gleiche Passwörter immer verschiedene Hashes erzeugen.
              </div>
            </Card>
            <Card style={{ flex: "1 1 260px", background: C.panel2 }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Schritt 2 — Session-Token und Cookie</div>
              <code style={{ ...cb, color: C.gold }}>
                {"# Nach erfolgreichem Login:\n"}
                {"token = secrets.token_hex(32)\n"}
                {"_sessions[token] = user.id\n"}
                {"response.set_cookie(\n"}
                {"    'session', token,\n"}
                {"    httponly=True, samesite='lax'\n"}
                {")"}
              </code>
              <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>
                Ein zufälliger Token wird gespeichert und als Cookie gesetzt. <b>HttpOnly</b> bedeutet: JavaScript im Browser kann den Cookie nicht lesen — Schutz vor XSS-Angriffen (Cross-Site-Scripting: eine Technik, die fremden JS-Code einschleust).
              </div>
            </Card>
          </div>
          <InfoBox title="CORS — warum der Browser ohne Erlaubnis blockiert">
            <b>CORS</b> (Cross-Origin Resource Sharing — Ressourcenteilung über Ursprungsgrenzen) ist ein Browser-Sicherheitsmechanismus. Standardmäßig darf JavaScript auf Seite A (z.B. localhost:5500) keine Requests an Server B (localhost:8000) schicken. Die API muss via <code style={ci}>CORSMiddleware</code> explizit erlauben, wer sie ansprechen darf. Mit <code style={ci}>allow_credentials=True</code> werden auch Cookies durchgelassen. Fehlt das, blockiert der Browser — nicht der Server.
          </InfoBox>
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Der andere herausfordernde Teil sind <b style={{ color: C.accent }}>Abhängigkeiten</b> (englisch <i>dependencies</i>). Jede Route braucht einen Datenbankzugang und muss den eingeloggten User kennen. FastAPIs Lösung: <b style={{ color: C.text }}>Dependency Injection</b> (Abhängigkeits-Einspeisung) via <code style={ci}>Depends()</code>. Funktionen wie <code style={ci}>get_current_user()</code> werden einmal definiert und automatisch vor dem Handler aufgerufen — kein Duplikat-Code, kein vergessener Auth-Check.
          </p>
        </Section>

        {/* VIS 2 */}
        <Section kicker="Interaktiv · Request-Reise" title='Die Reise eines „Prompt erstellen"-Requests'>
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 18 }}>
            Folge einem POST-Request vom Browser-Formular bis in die SQLite-Datei und zurück. Achte, wie die drei Schichten nacheinander aktiv werden (rechts leuchtet die aktive Tier) und wie viele Sicherheitsebenen passiert werden müssen, bevor etwas gespeichert wird.
          </p>
          <RequestFlowVis />
        </Section>

        {/* 3 — Sicherheitsschichten */}
        <Section kicker="3 · Qualität & Sicherheit" title="Defense in Depth — sechs unabhängige Schutzschichten">
          <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 6 }}>
            <b style={{ color: C.text }}>Defense in Depth</b> (Tiefenverteidigung) bedeutet: Sicherheit ist kein einzelnes Feature, sondern ein Stapel voneinander unabhängiger Mechanismen. Wenn eine Ebene versagt, hält die nächste.
          </p>
          <Card>
            <MethodRow color={C.accent}   name="Input-Validierung"  formula="Pydantic + Regex"          note="schemas.py prüft jede Eingabe mit ^[A-Za-z0-9 _\-]+$ bevor der Handler läuft. Ungültig → HTTP 422. Kein Sonderzeichen kann zu SQL-Fragmenten oder Script-Tags werden." />
            <MethodRow color="#c084fc"     name="SQL-Sicherheit"     formula="ORM · Prepared Statements" note="SQLAlchemy setzt Werte nie direkt in SQL-Strings ein — intern entstehen parametrisierte Abfragen mit Platzhaltern. SQL-Injection ist strukturell unmöglich." />
            <MethodRow color={C.accent2}  name="Passwort-Sicherheit" formula="bcrypt · Cost-Factor 12"   note="Passwörter werden nie gespeichert — nur der Hash. bcrypt ist absichtlich langsam (~250 ms), damit Brute-Force-Angriffe (Ausprobieren aller Kombinationen) unpraktikabel bleiben." />
            <MethodRow color={C.gold}     name="Session-Sicherheit"  formula="HttpOnly · SameSite=lax"   note="Der Cookie ist für JavaScript unsichtbar (HttpOnly), wird nicht bei Requests von fremden Seiten mitgesendet (SameSite=lax) und läuft nach 7 Tagen ab." />
            <MethodRow color={C.good}     name="Zugriffskontrolle"   formula="Ownership + Rollen"        note="_get_prompt_with_access() prüft Eigentümerschaft (403 falls fremd). require_admin() prüft die Rolle. Beide via Depends() — kein Handler vergisst die Prüfung." />
            <MethodRow color={C.dim}      name="CORS-Whitelist"      formula="allow_origins=[...]"       note="Nur localhost:5500 darf die API ansprechen. Verhindert, dass beliebige Drittseiten im Browser des Users API-Calls mit dessen Cookie auslösen (CSRF-Schutz)." />
          </Card>
          <InfoBox title="ORM vs. rohes SQL — warum SQLAlchemy?">
            Rohes SQL: <code style={ci}>{`f"SELECT * FROM users WHERE name='{user_input}'"`}</code>. Gibt ein Angreifer als Nutzernamen <code style={ci}>{`'; DROP TABLE users; --`}</code> ein, löscht die Datenbank (SQL-Injection). SQLAlchemy trennt Abfrage und Daten strukturell: <code style={ci}>db.query(User).filter(User.name == name)</code> — <code style={ci}>name</code> landet nie unkodiert im SQL-String.
          </InfoBox>
        </Section>

        {/* 4 — N:M */}
        <Section kicker="4 · Der kniffligste Aspekt" title="n:m-Beziehungen und die Verbindungstabelle">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Ein Prompt kann <b style={{ color: C.text }}>mehrere Tags</b> haben, und ein Tag kann an <b style={{ color: C.text }}>mehreren Prompts</b> hängen. Das nennt man eine <b style={{ color: C.accent }}>n:m-Beziehung</b> (viele-zu-viele). In einer relationalen Datenbank lässt sich das nicht direkt in zwei Tabellen abbilden — man braucht eine dritte: die <b style={{ color: C.accent }}>Verbindungstabelle</b> (englisch <i>junction table</i> oder <i>association table</i>).
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", marginTop: 8 }}>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>❌ Naiver Ansatz: Tags als Text</div>
              <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>
                Ein Feld <code style={ci}>tags = "coding,writing"</code> im Prompt ist ein Anti-Pattern (schlechte Praxis): Kein Index möglich, keine referentielle Integrität, keine automatische Löschung.
              </div>
            </Card>
            <Card style={{ background: C.panel2 }}>
              <div style={{ color: C.accent, fontWeight: 700, marginBottom: 6 }}>✅ Sauber: prompt_tags</div>
              <code style={{ ...cb, color: C.accent }}>
                {"prompt_tags = Table(\n"}
                {"  'prompt_tags', Base.metadata,\n"}
                {"  Column('prompt_id',\n"}
                {"    ForeignKey('prompts.id')),\n"}
                {"  Column('tag_id',\n"}
                {"    ForeignKey('tags.id'))\n"}
                {")"}
              </code>
            </Card>
          </div>
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75, marginTop: 16 }}>
            Jede Zeile in <code style={ci}>prompt_tags</code> ist eine Verknüpfung: Prompt 1 hat Tag 2. Der <b style={{ color: C.accent }}>Fremdschlüssel</b> (englisch <i>foreign key</i>, FK) stellt sicher, dass nur IDs eingetragen werden, die wirklich existieren. Wird ein Tag gelöscht, räumt die <b style={{ color: C.text }}>Kaskaden-Löschung</b> automatisch alle zugehörigen Zeilen in <code style={ci}>prompt_tags</code> auf — kein verwaister Datenmüll.
          </p>
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 15.5, color: C.dim, lineHeight: 1.7, marginBottom: 14 }}>
              Klick auf Prompt oder Tag — die Verbindungstabelle zeigt, welche Zeilen aktiv sind:
            </p>
            <NMRelationVis />
          </div>
        </Section>

        {/* 5 — Analyse */}
        <Section kicker="5 · Analyse" title="Korrektheit, Laufzeit & Robustheit">
          <p style={{ fontSize: 15.5, color: C.text, lineHeight: 1.75 }}>
            Schauen wir formal auf das Verhalten — was kostet es, warum stimmt es und wo sind die Grenzen?
          </p>
          <Card>
            <MethodRow color={C.accent}   name="Pydantic-Validierung"    formula="O(n) · automatisch"    note="Pydantic prüft jede eingehende Anfrage linear über die Felder. Fehler entstehen vor dem Handler-Aufruf — kein ungültiger Zustand erreicht je die Datenbank." />
            <MethodRow color="#c084fc"     name="Datenbankabfragen"        formula="O(log n) · Index"      note="SQLAlchemy nutzt SQLite-Indizes auf Primary Keys automatisch. Tag.name und User.username sind explizit indiziert. Lookups skalieren logarithmisch — auch mit vielen Einträgen schnell." />
            <MethodRow color={C.accent2}  name="bcrypt-Hashing"           formula="O(2^cost) · ~250 ms"   note="Cost-Factor 12 bedeutet 2¹² = 4 096 Iterationen. Absichtlich langsam: schützt vor Brute-Force. 250 ms pro Login ist für Menschen unmerklich, für Angreifer mit Millionen Versuchen prohibitiv." />
            <MethodRow color={C.good}     name="Session-Store-Lookup"     formula="O(1) · Python-dict"    note="Ein dict ist ein Hash-Table: { token → user_id }. Lookup ist konstante Zeit, egal wie viele Sessions existieren. Einschränkung: geht bei Server-Neustart verloren (kein Redis/DB)." />
            <MethodRow color={C.gold}     name="Admin-Stats (Top-Tags)"   formula="O(n log n) · Aggregate" note="outerjoin + group_by + count aggregiert über alle Tags. SQLite sortiert das Ergebnis — O(n log n) für n Tags. Bei sehr vielen Tags würde ein materialisierter View helfen." />
          </Card>
          <InfoBox title="Warum SQLite für ein Lernprojekt völlig richtig ist">
            SQLite ist dateibasiert — kein separater Datenbank-Server nötig, keine Konfiguration, eine einzige <code style={ci}>.db</code>-Datei. Der Übergang zu PostgreSQL (einem professionellen Datenbank-Server) würde in diesem Projekt nur <b>eine Zeile</b> in <code style={ci}>database.py</code> ändern: die Verbindungs-URL. Das ORM macht den Rest transparent — kein SQL-Code im Router muss angepasst werden.
          </InfoBox>
        </Section>

        {/* 6 — Zusammenfassung */}
        <Section kicker="6 · Auf einen Blick" title="Das ganze Projekt in fünf Sätzen">
          <Card style={{ background: "rgba(56,189,248,0.06)", border: `1px solid ${C.accent}` }}>
            <ol style={{ margin: 0, paddingLeft: 20, color: C.text, fontSize: 15.5, lineHeight: 1.9 }}>
              <li><b style={{ color: C.accent }}>3-Tier-Architektur:</b> Frontend (Browser), Backend (FastAPI), Datenbank (SQLite) — jede Schicht kennt nur ihre direkte Nachbarschicht.</li>
              <li><b style={{ color: C.accent }}>REST + HTTP-Verben:</b> GET/POST/PUT/DELETE bilden Read/Create/Update/Delete ab — klar, dokumentierbar und von jeder Sprache konsumierbar.</li>
              <li><b style={{ color: C.accent }}>Defense in Depth:</b> Pydantic-Validierung → ORM-Prepared-Statements → bcrypt-Hashing → HttpOnly-Cookie → Ownership-Check — fünf unabhängige Sicherheitsebenen.</li>
              <li><b style={{ color: C.accent }}>Dependency Injection:</b> <code style={ci}>get_current_user()</code> und <code style={ci}>get_db()</code> einmal definieren, überall via <code style={ci}>Depends()</code> einsetzen — kein Duplikat, kein vergessener Auth-Check.</li>
              <li><b style={{ color: C.accent }}>n:m via Junction Table:</b> <code style={ci}>prompt_tags</code> verbindet Prompts und Tags mit referentieller Integrität und automatischer Kaskaden-Löschung.</li>
            </ol>
          </Card>
          <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.7, marginTop: 16 }}>
            Wenn du das verstanden hast, kannst du jede Datei öffnen und sofort einordnen: <i>Zu welcher Schicht gehört sie? Was validiert, was speichert, was schützt sie? Und was darf sie bewusst nicht wissen?</i> Das ist „das ganze Projekt verstehen".
          </p>
        </Section>

        {/* 7 — Glossar */}
        <Section kicker="7 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div id="glossar" />
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            <GlossEntry term="3-Tier-Architektur"        def="Aufteilung in Presentation (Frontend), Logic (Backend/API) und Data (Datenbank). Jede Schicht hat eine klar abgegrenzte Aufgabe und kennt nur ihre Nachbarn." />
            <GlossEntry term="REST / RESTful API"        def="Konvention für HTTP-APIs: Ressourcen (Prompts, Tags, Users) haben eigene URLs; HTTP-Verben (GET/POST/PUT/DELETE) bilden CRUD ab." />
            <GlossEntry term="FastAPI"                   def="Python-Web-Framework für HTTP-APIs. Nutzt Pydantic für Validierung, generiert automatisch OpenAPI-Dokumentation." />
            <GlossEntry term="CRUD"                      def="Create, Read, Update, Delete — die vier Grundoperationen auf Daten. Entspricht POST, GET, PUT, DELETE in REST." />
            <GlossEntry term="ORM (Object-Relational Mapper)" def="Bibliothek (hier SQLAlchemy), die Python-Klassen auf Datenbanktabellen abbildet. Schreibt sicheres SQL intern, der Code bleibt Python." />
            <GlossEntry term="Prepared Statement"        def="SQL-Abfrage, bei der Daten getrennt vom SQL-Text übergeben werden (Platzhalter). Kein Wert kann zu SQL-Befehlen werden — verhindert SQL-Injection." />
            <GlossEntry term="SQL-Injection"             def="Angriff: Nutzereingabe enthält SQL-Code, der unkodiert in eine Abfrage eingebettet wird und Daten manipuliert oder löscht." />
            <GlossEntry term="Pydantic"                  def="Python-Bibliothek für Daten-Validierung via Typ-Annotationen. Schlägt mit HTTP 422 fehl, wenn Eingaben nicht dem Schema entsprechen." />
            <GlossEntry term="Dependency Injection (DI)" def="Abhängigkeiten (DB-Session, eingeloggter User) werden von FastAPI via Depends() automatisch eingesetzt, statt selbst erzeugt." />
            <GlossEntry term="Authentication (Authentifizierung)" def="Prüfung: Wer bist du? Erfolgt via bcrypt-Passwort-Vergleich + Session-Cookie." />
            <GlossEntry term="Authorization (Autorisierung)" def="Prüfung: Was darfst du? Erfolgt via Rollen (admin/user) und Eigentümer-Check auf Prompts." />
            <GlossEntry term="bcrypt"                    def="Passwort-Hash-Algorithmus. Irreversibel, enthält automatisch einen Salt und ist absichtlich langsam (schützt vor Brute-Force-Angriffen)." />
            <GlossEntry term="Salt"                      def="Zufällige Zeichenfolge, die vor dem Hashing dem Passwort beigemixt wird. Verhindert, dass gleiche Passwörter gleiche Hashes erzeugen (Rainbow-Table-Schutz)." />
            <GlossEntry term="Session / Session-Token"   def="Zufälliger, server-seitig gespeicherter Bezeichner, der einem eingeloggten User zugeordnet ist. Ersetzt das Passwort bei Folge-Requests." />
            <GlossEntry term="Cookie"                    def="Kleines Datenstück, das der Browser bei jedem Request automatisch an die zugehörige Domain sendet. HttpOnly-Cookies sind für JavaScript nicht lesbar." />
            <GlossEntry term="HttpOnly"                  def="Cookie-Flag: JavaScript kann den Cookie nicht per document.cookie lesen. Schützt gegen XSS-Angriffe." />
            <GlossEntry term="XSS (Cross-Site-Scripting)" def="Angriff: Fremder JavaScript-Code wird in eine Seite eingebettet und kann Cookies, Tokens oder andere Daten stehlen." />
            <GlossEntry term="CORS (Cross-Origin Resource Sharing)" def="Browser-Sicherheitsmechanismus: Requests von einem Ursprung (z.B. :5500) an einen anderen (:8000) werden ohne explizite Server-Erlaubnis blockiert." />
            <GlossEntry term="Stateless / Stateful"      def="HTTP ist zustandslos (stateless) — kein Gedächtnis zwischen Requests. Cookies/Sessions fügen künstlichen Zustand (stateful) hinzu." />
            <GlossEntry term="n:m-Beziehung"             def="Datenbankbeziehung: ein Datensatz in Tabelle A kann mit vielen in B verknüpft sein, und umgekehrt. Wird durch eine Verbindungstabelle aufgelöst." />
            <GlossEntry term="Verbindungstabelle / Junction Table" def="Dritte Tabelle zur Auflösung einer n:m-Beziehung — hier prompt_tags mit den Spalten (prompt_id, tag_id)." />
            <GlossEntry term="Fremdschlüssel / Foreign Key (FK)" def="Spalte, deren Wert auf den Primary Key einer anderen Tabelle zeigt. Stellt referentielle Integrität sicher: keine verwaisten Verweise." />
            <GlossEntry term="Kaskaden-Löschung / Cascade Delete" def="Wenn ein Eltern-Datensatz gelöscht wird, werden automatisch alle abhängigen Kind-Datensätze mitgelöscht." />
            <GlossEntry term="Uvicorn"                   def="ASGI-Server (asynchroner Webserver) für Python. Führt FastAPI-Apps aus — vergleichbar mit Tomcat für Java." />
            <GlossEntry term="Docker / Docker Compose"   def="Container-Technologie: Anwendung + Abhängigkeiten in einem isolierten Image. Compose startet mehrere Services koordiniert mit einem Befehl." />
            <GlossEntry term="SQLite"                    def="Dateibasierte relationale Datenbank ohne separaten Server. Ideal für Entwicklung — Wechsel zu PostgreSQL erfordert nur eine Zeile in database.py." />
            <GlossEntry term="Single-Page-App (SPA)"     def="Webanwendung in einer HTML-Datei. Views werden per JavaScript ein-/ausgeblendet, kein vollständiger Seitenneuladen." />
            <GlossEntry term="HTTP-Statuscodes"          def="Dreistellige Zahlen: 200 OK, 201 Created, 204 No Content, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation Error, 500 Server Error." />
            <GlossEntry term="OpenAPI / Swagger"         def="Standard-Format zur Beschreibung von REST-APIs (Endpunkte, Parameter, Antworten). FastAPI generiert die Swagger-UI automatisch unter /docs." />
          </div>
        </Section>

        <div style={{ height: 40 }} />
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", marginTop: 24 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>Lern-Trainer · Web Engineering 2 — Projektarchitektur „ai-prompt-library"</span>
          <span style={{ color: C.dim, fontSize: 13 }}>Prof. Dr. Veronika Lesch · DHBW Mosbach</span>
        </div>
      </footer>
    </div>
  );
}
