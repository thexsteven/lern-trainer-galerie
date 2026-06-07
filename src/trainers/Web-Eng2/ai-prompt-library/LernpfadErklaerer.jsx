import React, { useState, useEffect, useRef } from "react";

// ─── Design-System (Dark Theme) ──────────────────────────────────────────────
const C = {
  bg:      "#0f1117",
  panel:   "#171a23",
  panel2:  "#1e222e",
  line:    "#2a2f3d",
  text:    "#e6e8ee",
  dim:     "#9aa1b1",
  accent:  "#7dd3fc", // CYAN  – HTTP-Datenfluss durch die Schichten
  accent2: "#a78bfa", // VIOLETT – Auth & Sicherheit
  good:    "#86efac",
  warn:    "#fca5a5",
  gold:    "#fcd34d",
};

const sans = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const mono = '"JetBrains Mono","Fira Code","SFMono-Regular",Consolas,monospace';

const STYLES = `
@keyframes pop {
  0%   { transform: scale(.55); opacity: 0; }
  60%  { transform: scale(1.10); }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes pulse {
  0%,100% { opacity:1; } 50% { opacity:.4; }
}
.lp-reveal {
  opacity: 0; transform: translateY(26px);
  transition: opacity .6s ease, transform .6s ease;
}
.lp-reveal.lp-shown { opacity: 1; transform: none; }
`;

const btn = {
  background: C.accent, color: "#0b0e14", border: "none",
  borderRadius: 10, padding: "8px 16px", fontSize: 14,
  fontWeight: 600, cursor: "pointer", fontFamily: sans,
};
const btnGhost = {
  background: "transparent", color: C.text, border: `1px solid ${C.line}`,
  borderRadius: 10, padding: "8px 16px", fontSize: 14,
  fontWeight: 500, cursor: "pointer", fontFamily: sans,
};
const p = { color: C.text, fontSize: 16, lineHeight: 1.75, margin: "0 0 16px" };
const ci = {
  fontFamily: mono, fontSize: 13, background: C.panel2,
  border: `1px solid ${C.line}`, color: C.accent,
  padding: "1px 7px", borderRadius: 5,
};

// ─── Hooks & Primitive Bausteine ─────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, shown];
}

function Section({ kicker, title, children }) {
  const [ref, shown] = useReveal();
  return (
    <section ref={ref} className={"lp-reveal" + (shown ? " lp-shown" : "")}
      style={{ marginBottom: 64 }}>
      <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 2,
        fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontSize: 28, margin: "0 0 20px", color: C.text, lineHeight: 1.2 }}>
        {title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: 24, ...style }}>{children}</div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 13, color: C.dim, marginRight: 16 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3,
        background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{ background: "rgba(167,139,250,0.08)", border: `1px solid ${C.accent2}`,
      borderLeft: `4px solid ${C.accent2}`, borderRadius: 12,
      padding: "16px 18px", margin: "22px 0" }}>
      <div style={{ fontWeight: 700, color: C.accent2, marginBottom: 6, fontSize: 15 }}>
        💡 {title}</div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "stretch",
      padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ width: 4, background: color, borderRadius: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10,
          flexWrap: "wrap", marginBottom: 5 }}>
          <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{name}</span>
          <code style={{ fontFamily: mono, fontSize: 12.5, background: C.panel2,
            border: `1px solid ${C.line}`, color, padding: "2px 8px", borderRadius: 6 }}>
            {formula}
          </code>
        </div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{note}</div>
      </div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`,
      borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ color: C.accent, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 13, lineHeight: 1.55 }}>{def}</div>
    </div>
  );
}

function Legend({ items }) {
  return (
    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", rowGap: 6 }}>
      {items.map((it, i) => <Tag key={i} color={it.color}>{it.label}</Tag>)}
    </div>
  );
}

// ─── Stepper-Hook + PlayerBar ─────────────────────────────────────────────────

function useStepper(count, interval = 1500) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= count - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, interval);
    return () => clearInterval(id);
  }, [playing, count, interval]);
  const next   = () => setStep((s) => Math.min(s + 1, count - 1));
  const prev   = () => setStep((s) => Math.max(s - 1, 0));
  const reset  = () => { setPlaying(false); setStep(0); };
  const toggle = () => {
    if (!playing && step >= count - 1) setStep(0);
    setPlaying((p) => !p);
  };
  return { step, playing, next, prev, reset, toggle };
}

function PlayerBar({ st, count }) {
  const ghost = (dis) => ({ ...btnGhost, opacity: dis ? 0.4 : 1, cursor: dis ? "default" : "pointer" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
      <button style={btnGhost} onClick={st.reset}>↺ Reset</button>
      <button style={ghost(st.step === 0)} onClick={st.prev} disabled={st.step === 0}>‹ Zurück</button>
      <button style={btn} onClick={st.toggle}>{st.playing ? "⏸ Pause" : "▶ Play"}</button>
      <button style={ghost(st.step === count - 1)} onClick={st.next} disabled={st.step === count - 1}>Weiter ›</button>
      <span style={{ color: C.dim, fontSize: 13, marginLeft: "auto", fontFamily: mono }}>
        {st.step + 1} / {count}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 1 — Docker Layer-Caching: Dockerfile Schritt für Schritt
// ══════════════════════════════════════════════════════════════════════════════

const DOCKER_LAYERS = [
  {
    line: "FROM python:3.12-slim",
    status: "cached",
    label: "Layer 1 – Basis-Image",
    detail: "Startpunkt: offizielles Python 3.12 in der 'slim'-Variante (~50 MB statt ~900 MB des vollständigen Images). Ändert sich praktisch nie → fast immer aus dem Cache.",
  },
  {
    line: "ENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1",
    status: "cached",
    label: "Layer 2 – Umgebungsvariablen",
    detail: "PYTHONDONTWRITEBYTECODE: keine .pyc-Dateien im Container (spart Platz). PYTHONUNBUFFERED: Logs erscheinen sofort in docker logs (kein Puffer). Ändert sich selten → Cache.",
  },
  {
    line: "WORKDIR /app",
    status: "cached",
    label: "Layer 3 – Arbeitsverzeichnis",
    detail: "Alle folgenden COPY/RUN/CMD-Befehle arbeiten relativ zu /app. Ohne WORKDIR landet alles im chaotischen Root /.",
  },
  {
    line: "COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt",
    status: "cached",
    label: "Layer 4 & 5 – Dependencies (der teure Schritt)",
    detail: "Nur requirements.txt wird kopiert – BEVOR der Code kommt. Solange sich requirements.txt nicht ändert, nimmt Docker den pip install-Layer aus dem Cache. Code-Änderung? Kein Neuinstallieren. Das ist der wichtigste Layer-Caching-Trick.",
  },
  {
    line: "COPY . .",
    status: "rebuild",
    label: "Layer 6 – Anwendungscode",
    detail: "Jetzt erst wird der Code kopiert. Dieser Layer wird bei JEDER Code-Änderung neu gebaut – aber der teure pip install-Layer darüber bleibt im Cache. Ohne diese Reihenfolge würden bei jedem git commit alle Packages neu heruntergeladen.",
  },
  {
    line: "RUN mkdir -p /app/data",
    status: "rebuild",
    label: "Layer 7 – Datenordner",
    detail: "Erstellt /app/data für die SQLite-Datei. Ohne diesen Ordner würde SQLAlchemy beim Start mit einem Fehler abbrechen. -p: kein Fehler falls der Ordner schon existiert.",
  },
  {
    line: "EXPOSE 8000\nCMD [\"uvicorn\", \"main:app\",\n     \"--host\", \"0.0.0.0\",\n     \"--port\", \"8000\"]",
    status: "rebuild",
    label: "Layer 8 – Startbefehl",
    detail: "EXPOSE ist nur Dokumentation (öffnet keinen Port). CMD startet uvicorn mit 0.0.0.0 (nicht 127.0.0.1!): 0.0.0.0 = von allen Netzwerkinterfaces erreichbar. 127.0.0.1 wäre nur im Container selbst erreichbar – der Browser könnte nicht zugreifen.",
  },
];

function DockerLayerVis() {
  const st = useStepper(DOCKER_LAYERS.length, 1800);
  const cur = DOCKER_LAYERS[st.step];
  const statusColor = cur.status === "cached" ? C.good : C.gold;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        Dockerfile — Layer für Layer</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 18 }}>
        Grün = aus dem Cache (schnell). Gold = neu gebaut. Die Reihenfolge entscheidet alles.
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Layer-Liste */}
        <div style={{ flex: "1 1 300px" }}>
          {DOCKER_LAYERS.map((L, i) => {
            const active = i === st.step;
            const done   = i < st.step;
            const col    = L.status === "cached" ? C.good : C.gold;
            return (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "9px 12px", borderRadius: 10, marginBottom: 4,
                background: active ? C.panel2 : "transparent",
                border: `1px solid ${active ? col : C.line}`,
                transition: "all .3s", cursor: "default",
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: active ? col : done ? (L.status === "cached" ? C.good : C.gold) : C.panel2,
                  color: active || done ? "#0b0e14" : C.dim,
                  fontSize: 11, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${C.line}`,
                }}>
                  {done ? "✓" : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600,
                    color: active ? C.text : done ? C.dim : C.dim,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {L.label}
                  </div>
                </div>
                {active && (
                  <span key={st.step} style={{
                    animation: "pop .3s ease",
                    fontSize: 11, fontWeight: 700, color: "#0b0e14",
                    background: col, padding: "2px 8px", borderRadius: 12,
                  }}>
                    {L.status === "cached" ? "CACHED" : "REBUILD"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail-Panel */}
        <div style={{ flex: "1 1 260px" }}>
          <div key={st.step} style={{ animation: "pop .3s ease" }}>
            <div style={{
              background: C.bg, border: `1px solid ${statusColor}`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 12,
              fontFamily: mono, fontSize: 12.5, lineHeight: 1.7,
              color: statusColor, whiteSpace: "pre-wrap",
            }}>
              {cur.line}
            </div>
            <div style={{
              background: C.panel2, border: `1px solid ${C.line}`,
              borderRadius: 12, padding: "14px 16px",
              color: C.text, fontSize: 14.5, lineHeight: 1.65,
            }}>
              {cur.detail}
            </div>
          </div>
        </div>
      </div>

      <PlayerBar st={st} count={DOCKER_LAYERS.length} />
      <Legend items={[
        { color: C.good, label: "CACHED (aus Cache, schnell)" },
        { color: C.gold, label: "REBUILD (neu gebaut)" },
      ]} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 2 — Auth-Flow: Login → Token → Cookie → Folge-Request
// ══════════════════════════════════════════════════════════════════════════════

const AUTH_STEPS = [
  { phase: "login", text: "Browser sendet POST /login mit { username, password } als JSON-Body." },
  { phase: "login", text: "auth.py: user = db.query(User).filter(User.username == payload.username).first() — sucht den User." },
  { phase: "login", pw: true, text: "security.py: bcrypt.checkpw(password.encode()[:72], user.password_hash) — Passwort-Vergleich." },
  { phase: "login", text: "security.py: token = secrets.token_hex(32) → 64-Zeichen-Zufallsstring. _sessions[token] = user.id im RAM gespeichert." },
  { phase: "login", text: "auth.py: response.set_cookie('session', token, httponly=True, samesite='lax') — Cookie wird gesetzt." },
  { phase: "followup", text: "Später: GET /prompts. Browser sendet Cookie automatisch mit (credentials:'include')." },
  { phase: "followup", text: "dependencies.py: get_current_user() liest den 'session'-Cookie aus dem Request-Header." },
  { phase: "followup", text: "get_current_user(): user_id = _sessions.get(token) — Token → User-ID im Server-Store nachschlagen." },
  { phase: "followup", good: true, text: "user = db.get(User, user_id) → User-Objekt geladen. Request-Handler läuft mit vollem Kontext. ✓" },
];

function AuthFlowVis() {
  const [pwOk, setPwOk] = useState(true);
  const st = useStepper(AUTH_STEPS.length, 1600);
  const step = AUTH_STEPS[st.step];

  const cookieSet   = pwOk && st.step >= 4;
  const tokenStored = pwOk && st.step >= 3;
  const blocked     = !pwOk && st.step >= 2;

  let narrColor = C.accent2;
  if (step.pw)  narrColor = pwOk ? C.good : C.warn;
  if (blocked)  narrColor = C.warn;
  if (step.good && pwOk) narrColor = C.good;

  const chip = (bg) => ({
    fontFamily: mono, fontSize: 12, background: C.panel,
    border: `1px solid ${bg}`, color: bg,
    padding: "2px 8px", borderRadius: 6, display: "inline-block",
  });
  const TOKEN = "a3f9…77b2";

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        Login &amp; Session — wie HTTP sich „erinnert"</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 14,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        Szenario:
        <button style={{ ...btnGhost, padding: "4px 12px", fontSize: 13,
          borderColor: pwOk ? C.good : C.line, color: pwOk ? C.good : C.dim, fontWeight: 600 }}
          onClick={() => { setPwOk(true); st.reset(); }}>Passwort korrekt</button>
        <button style={{ ...btnGhost, padding: "4px 12px", fontSize: 13,
          borderColor: !pwOk ? C.warn : C.line, color: !pwOk ? C.warn : C.dim, fontWeight: 600 }}
          onClick={() => { setPwOk(false); st.reset(); }}>Passwort falsch</button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ flex: "1 1 220px", background: C.panel2,
          border: `1px solid ${cookieSet && st.step >= 5 ? C.gold : C.line}`,
          borderRadius: 12, padding: "14px 16px", transition: "border-color .3s" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🍪 Browser-Cookies</div>
          {cookieSet
            ? <div key="ck" style={{ animation: "pop .3s ease" }}>
                <span style={chip(C.accent2)}>session = {TOKEN}</span>
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={chip(C.dim)}>HttpOnly</span>
                  <span style={chip(C.dim)}>SameSite=lax</span>
                </div>
              </div>
            : <div style={{ color: C.dim, fontSize: 13, fontStyle: "italic" }}>— noch kein Cookie —</div>
          }
        </div>
        <div style={{ flex: "1 1 220px", background: C.panel2,
          border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🗄 Session-Store (RAM)</div>
          {tokenStored
            ? <div key="tk" style={{ animation: "pop .3s ease" }}>
                <span style={chip(C.accent)}>{`{ "${TOKEN}" → user #1 }`}</span>
              </div>
            : <div style={{ color: C.dim, fontSize: 13, fontFamily: mono }}>{"{ }  (leer)"}</div>
          }
        </div>
      </div>

      <div style={{
        background: C.panel2, border: `1px solid ${blocked ? C.warn : C.line}`,
        borderRadius: 12, padding: "14px 16px",
        fontSize: 15, lineHeight: 1.6, minHeight: 72, transition: "border-color .3s",
      }}>
        <span style={{ color: narrColor, fontWeight: 700, marginRight: 8 }}>
          {step.phase === "login" ? "🔑 Login" : "🔁 Folge-Request"}
        </span>
        <span style={{ color: blocked ? C.warn : C.text }}>
          {step.pw && !pwOk
            ? "bcrypt.checkpw() → ✗ falsch. Server antwortet 401 Unauthorized. Kein Token, kein Cookie."
            : blocked
              ? "✗ Login fehlgeschlagen. Ab hier passiert nichts — kein Token, kein Cookie."
              : step.text}
        </span>
      </div>

      <PlayerBar st={st} count={AUTH_STEPS.length} />
      <Legend items={[
        { color: C.accent2, label: "Auth-Schritt" },
        { color: C.gold,    label: "Token erzeugt" },
        { color: C.good,    label: "Erfolg" },
        { color: C.warn,    label: "401 / Abbruch" },
      ]} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 3 — HTTP Request Journey: alle 13 Module in Aktion
// ══════════════════════════════════════════════════════════════════════════════

const JOURNEY = [
  { file: "Browser / index.html",    layer: "frontend", text: "Nutzer tippt Titel + Inhalt, wählt Tags aus den Checkboxen. Noch kein Netzwerk." },
  { file: "frontend/app.js  api()",  layer: "frontend", text: 'api("POST /prompts", body): zentraler fetch-Wrapper. credentials:"include" → Browser sendet Session-Cookie automatisch mit.' },
  { file: "docker-compose.yml",      layer: "infra",    text: "Port 8000:8000 leitet den Request vom Host in den Container weiter. Das Volume /app/data ist für die DB-Datei gemountet." },
  { file: "backend/main.py  CORS",   layer: "backend",  text: "CORSMiddleware prüft: Origin localhost:5500 auf der Whitelist? allow_credentials=True? → Ja → Request durchgelassen." },
  { file: "backend/main.py  Router", layer: "backend",  text: "app.include_router(prompts.router) → FastAPI leitet POST /prompts an den prompts-Router weiter." },
  { file: "backend/dependencies.py", layer: "backend",  text: "Depends(get_current_user): Cookie lesen → _sessions nachschlagen → db.get(User, user_id). Kein Token → 401 sofort." },
  { file: "backend/schemas.py",      layer: "backend",  text: "Pydantic PromptCreate: title alphanumerisch (Regex ^[A-Za-z0-9 _-]+$)? content vorhanden? tag_ids eine Liste? Fehler → 422." },
  { file: "backend/routers/prompts.py", layer: "backend", text: "create_prompt(): _load_tags() prüft Tag-IDs, setzt user_id = current_user.id. Kein fremder user_id möglich." },
  { file: "backend/models.py",       layer: "database", text: "models.Prompt(...) erzeugt ein Python-Objekt. prompt.tags = tag_objects setzt die n:m-Verknüpfung via prompt_tags." },
  { file: "backend/database.py",     layer: "database", text: "db.add(prompt), db.commit() → SQLAlchemy schreibt ein parametrisiertes INSERT (Prepared Statement) in die prompts.db." },
  { file: "backend/schemas.py",      layer: "backend",  text: "PromptOut serialisiert das Ergebnis: nur erlaubte Felder (id, title, content, category, tags) — kein password_hash." },
  { file: "frontend/app.js",         layer: "frontend", text: "201 Created + JSON. loadPrompts() baut die Tabelle neu auf — sofort sichtbar, kein Seiten-Reload nötig." },
];

const LAYER_COLORS = { frontend: C.good, backend: C.accent, infra: C.gold, database: C.accent2 };
const LAYER_LABELS = { frontend: "Frontend", backend: "Backend", infra: "Infra", database: "Datenbank" };

function RequestJourneyVis() {
  const st = useStepper(JOURNEY.length, 1700);
  const cur = JOURNEY[st.step];

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        POST /prompts — durch alle 12 Stationen</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 18 }}>
        Von der Eingabe im Browser bis zur gespeicherten Zeile in SQLite.
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Schritt-Liste */}
        <div style={{ flex: "1 1 340px" }}>
          {JOURNEY.map((s, i) => {
            const active = i === st.step;
            const done   = i < st.step;
            const col    = LAYER_COLORS[s.layer];
            return (
              <div key={i} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "7px 10px", borderRadius: 10, marginBottom: 3,
                background: active ? "rgba(252,211,77,0.1)" : "transparent",
                outline: active ? `1px solid ${C.gold}` : "1px solid transparent",
                opacity: done ? 0.5 : 1, transition: "all .3s",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: active ? C.gold : done ? C.good : C.panel2,
                  color: active || done ? "#0b0e14" : C.dim,
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {done ? "✓" : i + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2,
                      background: col, flexShrink: 0 }} />
                    <code style={{ fontFamily: mono, fontSize: 11.5,
                      color: active ? C.text : C.dim }}>{s.file}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aktive Schicht + Erklärung */}
        <div style={{ flex: "1 1 240px", minWidth: 200 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {Object.entries(LAYER_LABELS).map(([l, label]) => {
              const here = cur.layer === l;
              return (
                <div key={l} style={{
                  border: `1px solid ${here ? LAYER_COLORS[l] : C.line}`,
                  background: here ? C.panel2 : C.panel,
                  borderRadius: 10, padding: "9px 12px",
                  display: "flex", alignItems: "center", gap: 8, transition: "all .3s",
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2,
                    background: LAYER_COLORS[l] }} />
                  <span style={{ fontSize: 13, fontWeight: here ? 700 : 400,
                    color: here ? C.text : C.dim }}>{label}</span>
                  {here && <span key={st.step} style={{
                    animation: "pop .3s ease", marginLeft: "auto", fontSize: 16 }}>📦</span>}
                </div>
              );
            })}
          </div>
          <div key={st.step} style={{
            animation: "pop .3s ease", background: C.panel2,
            border: `1px solid ${C.line}`, borderRadius: 12, padding: 14,
            color: C.text, fontSize: 14, lineHeight: 1.6,
          }}>
            {cur.text}
          </div>
        </div>
      </div>

      <PlayerBar st={st} count={JOURNEY.length} />
      <Legend items={[
        { color: C.good,    label: "Frontend" },
        { color: C.accent,  label: "Backend" },
        { color: C.gold,    label: "Infra (Docker)" },
        { color: C.accent2, label: "Datenbank" },
      ]} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  VIS 4 — N:M Prompt ↔ Tag (interaktiv)
// ══════════════════════════════════════════════════════════════════════════════

const PROMPTS_NM = [
  { id: 1, title: "Code-Review",   color: C.accent },
  { id: 2, title: "Blog Outline",  color: C.accent2 },
  { id: 3, title: "SQL-Helper",    color: C.good },
];
const TAGS_NM = [
  { id: 1, name: "coding",   color: "#e879f9" },
  { id: 2, name: "writing",  color: "#f97316" },
  { id: 3, name: "creative", color: "#84cc16" },
  { id: 4, name: "database", color: "#06b6d4" },
];
const JUNCTIONS = [
  { pid: 1, tid: 1 }, { pid: 1, tid: 2 },
  { pid: 2, tid: 2 }, { pid: 2, tid: 3 },
  { pid: 3, tid: 1 }, { pid: 3, tid: 4 },
];

function NmRelationVis() {
  const [selP, setSelP] = useState(null);
  const [selT, setSelT] = useState(null);

  const activeRows  = JUNCTIONS.filter(
    j => (selP !== null && j.pid === selP) || (selT !== null && j.tid === selT)
  );
  const activePids = new Set(activeRows.map(j => j.pid));
  const activeTids = new Set(activeRows.map(j => j.tid));

  const clickP = (id) => { setSelT(null); setSelP(v => v === id ? null : id); };
  const clickT = (id) => { setSelP(null); setSelT(v => v === id ? null : id); };
  const pColor = (id) => PROMPTS_NM.find(x => x.id === id)?.color ?? C.dim;
  const tColor = (id) => TAGS_NM.find(x => x.id === id)?.color    ?? C.dim;

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
        prompt_tags — die n:m-Verbindungstabelle live</div>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 18 }}>
        Klick auf einen Prompt oder Tag — die Verbindungszeilen leuchten auf.
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Prompts */}
        <div style={{ flex: "1 1 150px" }}>
          <div style={{ color: C.accent, fontSize: 11, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>PROMPTS</div>
          {PROMPTS_NM.map(p => {
            const on = selP === p.id || activePids.has(p.id);
            return (
              <div key={p.id} onClick={() => clickP(p.id)} style={{
                padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 7,
                border: `1px solid ${on ? p.color : C.line}`,
                background: on ? C.panel2 : C.panel,
                transition: "all .25s", fontWeight: on ? 700 : 400, fontSize: 13.5,
                color: on ? C.text : C.dim,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 2,
                  background: p.color, display: "inline-block", marginRight: 8 }} />
                {p.title}
              </div>
            );
          })}
        </div>

        {/* Junction Table */}
        <div style={{ flex: "1 1 200px" }}>
          <div style={{ color: C.good, fontSize: 11, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
            prompt_tags</div>
          <div style={{ background: C.bg, border: `1px solid ${C.line}`,
            borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
              padding: "6px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 11, color: C.dim, fontWeight: 700 }}>prompt_id (FK)</span>
              <span style={{ fontSize: 11, color: C.dim, fontWeight: 700 }}>tag_id (FK)</span>
            </div>
            {JUNCTIONS.map((j, idx) => {
              const on = activeRows.some(a => a.pid === j.pid && a.tid === j.tid);
              return (
                <div key={idx} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  padding: "7px 14px", borderBottom: idx < JUNCTIONS.length - 1 ? `1px solid ${C.line}` : "none",
                  background: on ? "rgba(252,211,77,0.12)" : "transparent", transition: "background .3s",
                  animation: on ? "pop .3s ease" : "none",
                }}>
                  <span style={{ fontSize: 13, fontWeight: on ? 700 : 400,
                    color: on ? pColor(j.pid) : C.dim }}>{j.pid}</span>
                  <span style={{ fontSize: 13, fontWeight: on ? 700 : 400,
                    color: on ? tColor(j.tid) : C.dim }}>{j.tid}</span>
                </div>
              );
            })}
          </div>
          <div style={{ color: C.dim, fontSize: 11, marginTop: 6, textAlign: "center" }}>
            6 Verknüpfungen — 3 Prompts × 4 Tags</div>
        </div>

        {/* Tags */}
        <div style={{ flex: "1 1 130px" }}>
          <div style={{ color: C.accent2, fontSize: 11, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>TAGS</div>
          {TAGS_NM.map(t => {
            const on = selT === t.id || activeTids.has(t.id);
            return (
              <div key={t.id} onClick={() => clickT(t.id)} style={{
                padding: "10px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 7,
                border: `1px solid ${on ? t.color : C.line}`,
                background: on ? C.panel2 : C.panel,
                transition: "all .25s", fontWeight: on ? 700 : 400, fontSize: 13.5,
                color: on ? C.text : C.dim,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 2,
                  background: t.color, display: "inline-block", marginRight: 8 }} />
                {t.name}
              </div>
            );
          })}
        </div>
      </div>
      <Legend items={[
        { color: C.gold, label: "aktive Verknüpfung" },
        { color: C.dim,  label: "keine Auswahl" },
      ]} />
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  Glossar
// ══════════════════════════════════════════════════════════════════════════════

const GLOSSARY = [
  ["3-Tier-Architektur", "Frontend (Browser), Backend (FastAPI), Datenbank (SQLite) — drei Schichten, je eine Aufgabe, jede kennt nur ihre Nachbarn."],
  ["Docker Image", "Unveränderlicher Bauplan einer Anwendung. Wie ein Kuchenrezept: beschreibt alles, läuft aber noch nicht."],
  ["Docker Container", "Laufende Instanz eines Images. Der 'fertig gebackene Kuchen'. Kann aus demselben Image mehrfach gestartet werden."],
  ["Layer-Caching", "Docker speichert jede Dockerfile-Zeile als Layer. Ändert sich ein Layer nicht, wird er aus dem Cache wiederverwendet — spart Minuten bei pip install."],
  ["Bind Mount / Volume", "Verbindet /app/data im Container mit ./backend/data auf dem Host. Daten überleben Container-Neustarts — ohne dieses Feature würde die SQLite-Datei bei docker compose down verschwinden."],
  ["ASGI / uvicorn", "Asynchroner Webserver für Python. FastAPI braucht uvicorn wie eine Java-App Tomcat. --host 0.0.0.0 macht ihn vom Host erreichbar."],
  ["FastAPI", "Python-Framework für HTTP-APIs. Nutzt Pydantic für Validierung und generiert automatisch die /docs-Swagger-Oberfläche."],
  ["CORS", "Cross-Origin Resource Sharing: Browser-Mechanismus, der verhindert, dass JS auf :5500 die API auf :8000 anspricht — außer der Server erlaubt es explizit."],
  ["HTTP-Stateless", "Jeder Request steht für sich. Der Server 'erinnert' sich an nichts. Lösung: Cookie-Sessions."],
  ["Session-Cookie", "Browser speichert einen Token. Bei jedem Request mitgeschickt. Server schlägt Token → User-ID im Session-Store nach."],
  ["HttpOnly", "Cookie-Flag: JavaScript kann den Cookie nicht lesen. Schützt gegen XSS-Angriffe (eingefügter Fremdcode)."],
  ["SameSite=lax", "Cookie-Flag: wird bei Cross-Site-Requests nicht mitgeschickt. Schutz gegen CSRF (fremde Seite löst API-Calls aus)."],
  ["bcrypt", "Passwort-Hash-Algorithmus. Irreversibel, enthält zufälligen Salt, absichtlich langsam (~250 ms). Nur erste 72 Bytes des Passworts werden verarbeitet."],
  ["Salt", "Zufallswert, der vor dem Hashen beigemixt wird. Verhindert, dass gleiche Passwörter gleiche Hashes erzeugen (Rainbow-Table-Schutz)."],
  ["SQLAlchemy ORM", "Übersetzt Python-Objekte nach SQL. db.add(prompt) → INSERT. Prepared Statements: Werte nie als String ins SQL eingebaut — SQL-Injection strukturell unmöglich."],
  ["Pydantic", "Validierungsbibliothek. Prüft Eingaben gegen Schema-Klassen. Fehler → automatisch HTTP 422 Unprocessable Entity."],
  ["field_validator", "Pydantic-Dekorator für benutzerdefinierte Prüfungen, z. B. der Regex ^[A-Za-z0-9 _-]+$ für alphanumerische Felder."],
  ["Dependency Injection", "FastAPIs Depends(): Hilfsfunktionen (get_current_user, get_db) werden einmal definiert und automatisch in jeden Handler injiziert."],
  ["get_current_user()", "Liest Cookie → schlägt Token im Session-Store nach → lädt User aus DB. Wirft 401 wenn kein gültiges Token."],
  ["require_admin()", "Ruft get_current_user() auf und prüft zusätzlich role == 'admin'. Wirft 403 wenn kein Admin. Via Depends() in Admin-Routen."],
  ["CRUD", "Create (POST), Read (GET), Update (PUT), Delete (DELETE) — die vier Grundoperationen auf Daten."],
  ["1:n-Beziehung", "Ein User hat viele Prompts. Umgesetzt mit Foreign Key user_id in der Prompts-Tabelle + relationship() in SQLAlchemy."],
  ["n:m-Beziehung", "Ein Prompt hat viele Tags, ein Tag hängt an vielen Prompts. Braucht eine dritte Tabelle (prompt_tags) zur Auflösung."],
  ["Junction-Table", "prompt_tags mit Spalten (prompt_id FK, tag_id FK). Jede Zeile ist eine Verknüpfung. SQLAlchemy pflegt sie automatisch über secondary=prompt_tags."],
  ["Cascade delete-orphan", "cascade='all, delete-orphan' auf der ORM-Beziehung: Wird ein User gelöscht, löscht SQLAlchemy seine Prompts automatisch mit."],
  ["401 / 403 / 404", "Nicht eingeloggt / eingeloggt aber verboten / nicht gefunden — drei klar verschiedene Fehlerfälle, die im Code strikt getrennt behandelt werden."],
  ["Admin-Dashboard", "GET /admin/stats: SQL-Aggregation mit func.count, outerjoin, group_by — liefert Top-Tags und Prompts-pro-User."],
  ["Single-Page-App", "index.html ohne Seitenneuladen. Views per classList.toggle('hidden') ein-/ausgeblendet. app.js steuert alles per Vanilla JS."],
  ["credentials:'include'", "fetch-Option, damit der Browser den Session-Cookie automatisch mitschickt. Ohne diese Option bleibt der Cookie daheim."],
  ["OpenAPI / Swagger", "FastAPI generiert automatisch /docs. Maschinenlesbare API-Beschreibung aller Endpunkte, Parameter und Antworten."],
];

// ══════════════════════════════════════════════════════════════════════════════
//  Hauptkomponente
// ══════════════════════════════════════════════════════════════════════════════

export default function LernpfadErklaerer() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: sans }}>
      <style>{STYLES}</style>

      {/* Hero */}
      <header style={{ maxWidth: 880, margin: "0 auto", padding: "72px 24px 32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: C.panel2, border: `1px solid ${C.line}`,
          borderRadius: 999, padding: "5px 14px",
          fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: 1, marginBottom: 20,
        }}>
          🧩 FASTAPI · SQLALCHEMY · DOCKER · VANILLA JS
        </div>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "0 0 16px", fontWeight: 800 }}>
          ai-prompt-library —{" "}
          <span style={{ color: C.accent }}>der vollständige Lernpfad</span>
        </h1>
        <p style={{ fontSize: 18, color: C.dim, lineHeight: 1.65, margin: 0, maxWidth: 700 }}>
          Alle 13 Module des Projekts erklärt: von Docker über das FastAPI-Backend bis zum
          Vanilla-JS-Frontend. Jedes Konzept beim ersten Auftreten erläutert — damit du das
          Projekt danach selbst reproduzieren kannst.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 40px" }}>

        {/* ─── 0 Das Problem ───────────────────────────────────────────────── */}
        <Section kicker="0 · Das Problem" title="Warum nicht alles in eine Datei?">
          <p style={p}>
            Stell dir vor, du schreibst einen Prompt-Manager als einziges Python-Skript: Passwort
            prüfen, SQL-Abfragen schreiben und HTTP-Routen definieren — alles nebeneinander. Für
            ein schnelles Skript reicht das. Sobald aber{" "}
            <strong>mehrere Nutzer</strong> dazukommen, bricht das Konzept zusammen: Wer darf
            welche Daten sehen? Wie speicherst du Passwörter sicher? Wie überlebt die
            Datenbank einen Server-Neustart?
          </p>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 16 }}>
            {[
              ["❌ Alles vermischt", "Ändert man das Hashing, kann man versehentlich die SQL-Abfrage daneben kaputtmachen. Code, der alles tut, ist schwer zu warten."],
              ["❌ Keine Trennung", "User A soll nur seine Prompts sehen. Ohne Backend-Logik sieht er alles — oder schreibt über die Daten anderer."],
              ["❌ Passwörter im Klartext", "Ohne gezieltes Passwort-Hashing (bcrypt) liegen Passwörter lesbar in der Datenbank. Ein Datenbankdump gibt alles preis."],
            ].map(([h, t]) => (
              <Card key={h} style={{ background: C.panel2 }}>
                <div style={{ color: C.warn, fontWeight: 700, marginBottom: 6 }}>{h}</div>
                <div style={{ color: C.dim, fontSize: 13.5, lineHeight: 1.6 }}>{t}</div>
              </Card>
            ))}
          </div>
          <InfoBox title="Die drei Entitäten des Projekts">
            <strong style={{ color: C.accent }}>User</strong> (Benutzername, bcrypt-Hash, Rolle
            user/admin) ·{" "}
            <strong style={{ color: C.accent }}>Prompt</strong> (Titel, Inhalt, optionale Kategorie,
            gehört einem User) ·{" "}
            <strong style={{ color: C.accent }}>Tag</strong> (Schlagwort). Beziehungen: User
            <code style={ci}>1:n</code>Prompt und Prompt<code style={ci}>n:m</code>Tag.
          </InfoBox>
        </Section>

        {/* ─── 1 Kernidee ──────────────────────────────────────────────────── */}
        <Section kicker="1 · Die Kernidee" title="Drei Schichten, je eine Verantwortung">
          <p style={p}>
            Das Projekt folgt der <strong>3-Tier-Architektur</strong>: jede Schicht (englisch{" "}
            <em>tier</em>) hat genau eine Aufgabe und redet nur mit ihrer direkten Nachbarschicht.
            Die Dateien des Projekts lassen sich alle einer Schicht zuordnen:
          </p>
          <Card style={{ background: C.panel2, marginBottom: 22 }}>
            <div style={{ fontFamily: mono, fontSize: 14, lineHeight: 2.2 }}>
              {[
                ["index.html · app.js · styles.css", "Frontend  (Browser)", C.good],
                ["main.py · routers/ · schemas.py · dependencies.py", "Backend (FastAPI)", C.accent],
                ["security.py", "Sicherheitsschicht (bcrypt, Session)", C.accent2],
                ["models.py · database.py", "Datenbank-Schicht (SQLAlchemy + SQLite)", "#c084fc"],
                ["Dockerfile · docker-compose.yml", "Infrastruktur (Docker)", C.gold],
              ].map(([files, label, col]) => (
                <div key={label} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span style={{ color: col, fontWeight: 700, minWidth: 14 }}>▸</span>
                  <span style={{ color: C.dim, fontSize: 12 }}>{files}</span>
                  <span style={{ color: col, fontSize: 12, fontWeight: 600 }}>→ {label}</span>
                </div>
              ))}
            </div>
          </Card>
          <p style={p}>
            Der komplette Weg eines Requests durch alle Schichten — vom Formular im Browser bis
            zur gespeicherten Zeile in der Datenbank und zurück:
          </p>
          <RequestJourneyVis />
        </Section>

        {/* ─── 2 Docker ────────────────────────────────────────────────────── */}
        <Section kicker="2 · Infrastruktur" title="Docker: das System portierbar machen">
          <p style={p}>
            <strong>Docker</strong> löst das "Works on my machine"-Problem: Du packst Python,
            alle Packages und deinen Code in eine isolierte{" "}
            <strong>Box</strong>. Ein <strong>Image</strong> (Unveränderlicher Bauplan, wie ein
            Rezept) wird per <code style={ci}>docker build</code> aus dem Dockerfile gebaut. Ein{" "}
            <strong>Container</strong> (laufende Instanz des Images) wird aus dem Image gestartet.
          </p>
          <p style={p}>
            Das <strong>docker-compose.yml</strong> ist der Dirigent: Es definiert welche Container
            mit welchen Ports, Volumes und Einstellungen starten. Das wichtigste Detail ist das{" "}
            <strong>Volume</strong>: <code style={ci}>./backend/data:/app/data</code> verbindet
            einen Ordner auf deiner Festplatte mit dem Container. SQLite schreibt nach{" "}
            <code style={ci}>/app/data/prompts.db</code> — das landet direkt auf dem Host. Ohne
            Volume wären alle Daten nach <code style={ci}>docker compose down</code> verloren.
          </p>
          <DockerLayerVis />
          <InfoBox title="restart: unless-stopped">
            Container startet automatisch neu wenn er abstürzt oder der Docker-Daemon neu startet
            — außer du stoppst ihn manuell. Für produktionsähnliches Verhalten unverzichtbar:
            Nach einem Server-Reboot läuft das Backend automatisch wieder.
          </InfoBox>
        </Section>

        {/* ─── 3 Das schwierige Stück ──────────────────────────────────────── */}
        <Section kicker="3 · Das zentrale Problem" title="HTTP vergisst alles — die Session-Lösung">
          <p style={p}>
            HTTP ist <strong>zustandslos</strong> (stateless): Jeder Request kommt unabhängig
            an, der Server weiß von sich aus nicht, ob du eingeloggt bist. Das ist kein Fehler,
            sondern Design — es macht HTTP skalierbar. Für eine App mit Login braucht man aber
            Zustand. Die Lösung dieses Projekts: ein <strong>Cookie-basierter Session-Store</strong>.
          </p>
          <p style={p}>
            Beim Login prüft <code style={ci}>security.py</code> das Passwort via bcrypt, erzeugt
            ein 64-Zeichen-Zufalls-Token, speichert es im RAM-Dict{" "}
            <code style={ci}>_sessions = {"{ token → user_id }"}</code> und schickt es als Cookie
            zurück. Jeder Folge-Request trägt diesen Cookie, <code style={ci}>get_current_user()</code>
            in <code style={ci}>dependencies.py</code> löst Token → User auf:
          </p>
          <AuthFlowVis />
          <InfoBox title="Ehrliche Einschränkung — Session-Store im RAM">
            <code style={ci}>_sessions</code> ist ein Python-Dict im Arbeitsspeicher. Das bedeutet:
            Bei Server-Neustart sind alle Sessions weg (alle ausgeloggt). Mit mehreren uvicorn-Workern
            würde jeder Worker einen eigenen Store haben — Tokens wären nicht zwischen Workern geteilt.
            Für Produktion würde man Redis oder eine DB-Tabelle verwenden. Als Lernprojekt ist
            der RAM-Store vollkommen richtig: Er ist einfach und zeigt das Konzept klar.
          </InfoBox>
        </Section>

        {/* ─── 4 Sicherheitsschichten ──────────────────────────────────────── */}
        <Section kicker="4 · Qualität" title="Defense in Depth: sechs unabhängige Schutzschichten">
          <p style={p}>
            Sicherheit ist kein einzelner Schalter, sondern ein Stapel voneinander unabhängiger
            Mechanismen. Fällt eine Schicht aus, hält die nächste. Das Projekt verwendet sechs:
          </p>
          <Card>
            <MethodRow color={C.accent2} name="Passwort-Hashing"
              formula="bcrypt.hashpw(pw[:72], gensalt())"
              note="Passwörter werden nie gespeichert — nur der bcrypt-Hash. Irreversibel. Der Salt (Zufallswert) verhindert, dass gleiche Passwörter gleiche Hashes erzeugen. Die 72-Byte-Grenze ist eine bcrypt-Eigenschaft." />
            <MethodRow color={C.accent} name="Cookie-Sicherheit"
              formula="HttpOnly · SameSite=lax"
              note="HttpOnly: Cookie per JavaScript nicht lesbar → XSS-Schutz. SameSite=lax: Cookie wird von fremden Seiten nicht mitgeschickt → CSRF-Schutz. Beides zusammen deckt die häufigsten Cookie-Angriffe ab." />
            <MethodRow color={C.good} name="SQL-Injection-Schutz"
              formula="ORM → Prepared Statements"
              note="SQLAlchemy baut keine SQL-Strings via f-string. Werte werden als Parameter übergeben: db.query(User).filter(User.username == name). Der Datenbankdriver trennt Code und Daten strikt." />
            <MethodRow color={C.gold} name="Input-Validierung"
              formula="^[A-Za-z0-9 _-]+$ → 422"
              note="Pydantic's field_validator prüft Titel, Tags und Benutzernamen per Regex. Ungültige Eingaben werden mit HTTP 422 Unprocessable Entity abgewiesen, bevor der Handler überhaupt läuft." />
            <MethodRow color={C.accent2} name="Autorisierung"
              formula="Owner-Check · require_admin()"
              note="_get_prompt_with_access(): Falls user.role != 'admin' UND prompt.user_id != user.id → 403 Forbidden. require_admin() via Depends() schützt alle /admin-Routen. Kein Handler vergisst den Check." />
            <MethodRow color={C.accent} name="CORS-Whitelist"
              formula="allow_origins=['localhost:5500']"
              note="Nur localhost:5500 darf die API mit Cookies ansprechen. allow_credentials=True ist zwingend — fehlt es, blockiert der Browser den Request, nicht der Server." />
          </Card>
        </Section>

        {/* ─── 5 Sonderfälle ───────────────────────────────────────────────── */}
        <Section kicker="5 · Detail-Sonderfälle" title="Zwei knifflige Aspekte aus der Nähe">
          <p style={p}>
            Erstens: die <strong>n:m-Beziehung</strong>. Ein Prompt kann viele Tags haben,
            ein Tag hängt an vielen Prompts. Das lässt sich nicht mit einem einfachen Fremdschlüssel
            abbilden — dafür braucht es die Verbindungstabelle <code style={ci}>prompt_tags</code>.
            SQLAlchemy pflegt sie automatisch wenn du{" "}
            <code style={ci}>prompt.tags = [tag1, tag2]</code> setzt.
          </p>
          <NmRelationVis />
          <p style={{ ...p, marginTop: 28 }}>
            Zweitens: <strong>Dependency Injection</strong>. FastAPIs <code style={ci}>Depends()</code>
            bedeutet: Schreibe <code style={ci}>get_current_user()</code> einmal, injiziere sie in
            jeden Handler der sie braucht. FastAPI ruft sie automatisch vor dem Handler auf. Kein
            Copy-Paste, kein vergessener Auth-Check:
          </p>
          <Card style={{ background: C.panel2 }}>
            <div style={{ fontFamily: mono, fontSize: 13, lineHeight: 1.8, color: C.text }}>
              <span style={{ color: C.dim }}>{"# Ohne Depends: jeder Handler muss selbst prüfen → fehleranfällig\n"}</span>
              <span style={{ color: C.warn }}>{"# def create_prompt(session=Cookie(...), db=Depends(get_db)):\n"}</span>
              <span style={{ color: C.warn }}>{"#     user_id = _sessions.get(session)  # vergisst man leicht!\n\n"}</span>
              <span style={{ color: C.dim }}>{"# Mit Depends: Logik einmal, automatisch überall\n"}</span>
              <span style={{ color: C.good }}>{"def create_prompt(\n"}</span>
              <span style={{ color: C.good }}>{"    db:           Session    = Depends(get_db),\n"}</span>
              <span style={{ color: C.good }}>{"    current_user: models.User = Depends(get_current_user),\n"}</span>
              <span style={{ color: C.good }}>{"): ..."}</span>
            </div>
          </Card>
          <InfoBox title="Das 'tote' Cascade-Detail für das Mündliche">
            In <code style={ci}>models.py</code> steht <code style={ci}>ondelete="CASCADE"</code> auf
            dem Foreign Key. In SQLite greift das aber nur wenn <code style={ci}>PRAGMA foreign_keys=ON</code>
            gesetzt ist — und das ist hier nicht der Fall. Was Prompts tatsächlich mit löscht, ist
            die ORM-seitige Regel <code style={ci}>cascade="all, delete-orphan"</code> auf der
            Python-Relationship. Wer diesen Unterschied erklären kann, hat das Thema verstanden.
          </InfoBox>
        </Section>

        {/* ─── 6 Analyse ───────────────────────────────────────────────────── */}
        <Section kicker="6 · Analyse" title="Laufzeit, Korrektheit und Grenzen">
          <p style={p}>
            Bei einer CRUD-App ist die relevante Analyse vor allem{" "}
            <strong>Korrektheit und Sicherheit</strong>, nicht rohe Laufzeit. Trotzdem gibt es
            ein paar interessante Stellen. Die{" "}
            <strong>O-Notation</strong> (Groß-O) beschreibt, wie der Aufwand mit der Datenmenge{" "}
            <em>n</em> wächst — unabhängig von Hardware.
          </p>
          <Card style={{ marginBottom: 20 }}>
            <MethodRow color={C.accent} name="Einzelne User/Prompt/Tag-Abfragen"
              formula="O(log n)"
              note="SQLAlchemy nutzt SQLite-Indizes auf Primary Keys automatisch. username und tag.name sind zusätzlich explizit indiziert. B-Baum-Index: Suche in O(log n) statt O(n) Tabellen-Scan." />
            <MethodRow color={C.accent2} name="bcrypt-Passwort-Vergleich"
              formula="O(2^cost) ≈ 250 ms"
              note="Cost-Factor 12 = 4096 Iterationen. Für Menschen unmerklich. Für einen Angreifer der Millionen Passwörter ausprobiert: prohibitiv teuer. Das ist das Designziel." />
            <MethodRow color={C.gold} name="Admin-Stats: Top-Tags"
              formula="O(n log n)"
              note="outerjoin + group_by + count aggregiert alle Tag-Verknüpfungen. SQLite sortiert das Ergebnis via B-Baum. Bei sehr vielen Tags würde ein materialisierter View helfen." />
            <MethodRow color={C.good} name="Session-Token-Lookup"
              formula="O(1)"
              note="Python-dict ist eine Hash-Table. Lookup { token → user_id } ist konstante Zeit, egal wie viele Sessions existieren. Der Preis: RAM, keine Persistenz." />
          </Card>
          <InfoBox title="Skalierungsgrenzen — was würde sich in Produktion ändern?">
            SQLite ist für dieses Projekt perfekt. Skalierungsgrenzen: SQLite unterstützt keine
            echte Parallelität (ein Schreiber gleichzeitig). Wechsel zu PostgreSQL: nur eine Zeile
            in <code style={ci}>database.py</code>. Session-Store im RAM: kein Multi-Worker, kein
            Neustart-Überleben → Redis oder DB-Tabelle. Das ORM-Interface bleibt in beiden Fällen
            identisch.
          </InfoBox>
        </Section>

        {/* ─── 7 Zusammenfassung ───────────────────────────────────────────── */}
        <Section kicker="7 · Auf einen Blick" title="Das Projekt in sechs Sätzen">
          <Card style={{ background: "rgba(125,211,252,0.06)", borderColor: C.accent }}>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, fontSize: 16, color: C.text }}>
              <li><strong>Docker</strong>: Dockerfile baut das Image layer-by-layer (requirements zuerst → Layer-Caching). docker-compose.yml orchestriert Port-Mapping und Volume.</li>
              <li><strong>3-Tier</strong>: Browser → FastAPI → SQLite. Jede Schicht kennt nur ihre direkten Nachbarn. Datenbankdetails (SQL) dringen nie ins Frontend.</li>
              <li><strong>Auth</strong>: HTTP ist zustandslos. Cookie-Sessions (bcrypt-Vergleich → Zufalls-Token → HttpOnly-Cookie) geben ihm Gedächtnis.</li>
              <li><strong>Sicherheit in Schichten</strong>: bcrypt, HttpOnly/SameSite, ORM-Prepared-Statements, Pydantic-Regex, Owner-Check, CORS-Whitelist — unabhängig voneinander.</li>
              <li><strong>Beziehungen</strong>: User 1:n Prompt (FK user_id). Prompt n:m Tag über die Verbindungstabelle prompt_tags. SQLAlchemy pflegt sie über Python-Listen.</li>
              <li><strong>Status-Codes</strong>: 401 (wer bist du?), 403 (darf nicht), 404 (gibt's nicht), 422 (Validierung), 201 (angelegt), 204 (gelöscht).</li>
            </ul>
          </Card>
        </Section>

        {/* ─── 8 Glossar ───────────────────────────────────────────────────── */}
        <Section kicker="8 · Nachschlagen" title="Alle Begriffe kompakt">
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {GLOSSARY.map(([term, def]) => (
              <GlossEntry key={term} term={term} def={def} />
            ))}
          </div>
        </Section>

      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px 56px",
        textAlign: "center", color: C.dim, fontSize: 13, lineHeight: 1.7 }}>
        Lern-Trainer · AI Prompt Library — vollständiger Lernpfad<br />
        Modul Web Engineering 2 · Prof. Dr. Veronika Lesch · DHBW Mosbach
      </footer>
    </div>
  );
}
