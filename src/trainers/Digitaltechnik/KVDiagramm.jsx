import React, { useState, useEffect, useRef, useMemo } from "react";

/* =========================================================================
   FESTES DESIGN-SYSTEM (Dark Theme) — identisch zur restlichen Galerie.
   Nur accent & accent2 thematisch belegt:
   - accent  (Türkis)  = die EINSEN bzw. DMF-Blöcke (Treffer, die wir zu
                         möglichst großen Gruppen zusammenfassen).
   - accent2 (Indigo)  = die NULLEN bzw. KMF-Blöcke und die Variablen-Achsen
                         des Diagramms (Gray-Code-Beschriftung).
   ========================================================================= */
const C = {
  bg: "#0f1117",
  panel: "#171a23",
  panel2: "#1e222e",
  line: "#2a2f3d",
  text: "#e6e8ee",
  dim: "#9aa1b1",
  accent: "#2dd4bf",  // Türkis – Einsen / DMF-Blöcke
  accent2: "#818cf8", // Indigo – Nullen / KMF-Blöcke / Achsen
  good: "#86efac",
  warn: "#fca5a5",
  gold: "#fcd34d",
};

const KEYFRAMES = `
@keyframes pop { 0% { transform: scale(.82); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes ringpulse { 0%,100% { box-shadow: 0 0 0 3px var(--rc); } 50% { box-shadow: 0 0 0 5px var(--rc); } }
`;

/* Farben für die einzelnen Blöcke (durchgewechselt) */
const BLOCK_COLORS = [C.accent, C.gold, C.good, C.accent2, C.warn];

/* =========================================================================
   PFLICHT-BAUSTEINE
   ========================================================================= */
function useReveal() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Section({ kicker, title, children }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} style={{
      marginBottom: 64,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: "opacity .6s ease, transform .6s ease",
    }}>
      <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 2, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontSize: 28, lineHeight: 1.2, margin: "0 0 20px", color: C.text }}>{title}</h2>
      {children}
    </section>
  );
}

function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>{children}</div>;
}

function Tag({ color, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: C.dim, marginRight: 16 }}>
      <span style={{ width: 11, height: 11, borderRadius: 3, background: color, display: "inline-block" }} />
      {children}
    </span>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={{ background: `${C.accent2}1a`, border: `1px solid ${C.accent2}55`, borderRadius: 14, padding: "18px 20px", margin: "20px 0" }}>
      <div style={{ fontWeight: 800, color: C.accent2, marginBottom: 8 }}>💡 {title}</div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function GlossEntry({ term, def }) {
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ color: C.accent, fontWeight: 800, fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{term}</div>
      <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.5 }}>{def}</div>
    </div>
  );
}

function MethodRow({ color, name, formula, note }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "stretch", marginBottom: 12 }}>
      <div style={{ width: 5, borderRadius: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, color: C.text }}>{name}</span>
          <code style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "3px 10px", fontSize: 14, color, fontFamily: "ui-monospace, monospace" }}>{formula}</code>
        </div>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.55 }}>{note}</div>
      </div>
    </div>
  );
}

const btn = { background: C.accent, color: C.bg, border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 14, cursor: "pointer" };
const btnGhost = { background: "transparent", color: C.text, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer" };

/* Bar = Negationsstrich (Überstrich) = übliche Schreibweise für NICHT */
const Bar = ({ children }) => <span style={{ textDecoration: "overline", textDecorationThickness: "2px" }}>{children}</span>;

function usePlayer(n, ms = 1500) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => { if (s >= n - 1) { setPlaying(false); return s; } return s + 1; }), ms);
    return () => clearInterval(id);
  }, [playing, n, ms]);
  return {
    step, playing,
    toggle: () => setPlaying((p) => { if (!p && step >= n - 1) setStep(0); return !p; }),
    next: () => setStep((s) => Math.min(n - 1, s + 1)),
    prev: () => setStep((s) => Math.max(0, s - 1)),
    reset: () => { setPlaying(false); setStep(0); },
  };
}

function PlayerControls({ p, total, playLabel = "▶ Abspielen" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      <button style={btn} onClick={p.toggle}>{p.playing ? "❚❚ Pause" : playLabel}</button>
      <button style={btnGhost} onClick={p.prev} disabled={p.step === 0}>◀ Schritt</button>
      <button style={btnGhost} onClick={p.next} disabled={p.step === total - 1}>Schritt ▶</button>
      <button style={btnGhost} onClick={p.reset}>↺ Reset</button>
      <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13, fontFamily: "ui-monospace, monospace" }}>Schritt {p.step + 1} / {total}</span>
    </div>
  );
}

/* =========================================================================
   KV-LOGIK (3 Variablen A,B,C — A = höchstwertiges Bit)
   Minterm-Index m = A·4 + B·2 + C.
   Grid-Layout (Gray-Code in den Spalten 00,01,11,10):
        BC=00 BC=01 BC=11 BC=10
   A=0    m0    m1    m3    m2
   A=1    m4    m5    m7    m6
   ========================================================================= */
const VARS = ["A", "B", "C"];
const GRID = [[0, 1, 3, 2], [4, 5, 7, 6]];   // [Zeile A=0/1][Spalte] -> Minterm
const COL_LABELS = ["00", "01", "11", "10"]; // BC im Gray-Code
const ROW_LABELS = ["0", "1"];               // A

function mintermBits(m) { return [(m >> 2) & 1, (m >> 1) & 1, m & 1]; } // [A,B,C]

/* alle 27 Implikanten als [a,b,c] mit Werten {-1 = entfällt, 0, 1} */
const ALL_IMPL = (() => {
  const out = [];
  for (const a of [-1, 0, 1]) for (const b of [-1, 0, 1]) for (const c of [-1, 0, 1]) out.push([a, b, c]);
  return out;
})();
const COV = {}; // implKey -> Liste abgedeckter Minterme
for (const impl of ALL_IMPL) {
  const cov = [];
  for (let m = 0; m < 8; m++) {
    const [a, b, c] = mintermBits(m);
    if ((impl[0] === -1 || impl[0] === a) && (impl[1] === -1 || impl[1] === b) && (impl[2] === -1 || impl[2] === c)) cov.push(m);
  }
  COV[impl.join(",")] = cov;
}

function makePrime(impl, cov) {
  const fixed = [];
  for (let i = 0; i < 3; i++) if (impl[i] !== -1) fixed.push({ v: VARS[i], val: impl[i] });
  return { impl, cov, fixed };
}

function solveCover(primes, required) {
  const remaining = new Set(required);
  const chosen = [];
  let progress = true;
  while (progress) {                       // 1) wesentliche Primimplikanten
    progress = false;
    for (const m of [...remaining]) {
      const covers = primes.filter((p) => p.cov.includes(m));
      if (covers.length === 1 && !chosen.includes(covers[0])) {
        chosen.push(covers[0]);
        covers[0].cov.forEach((x) => remaining.delete(x));
        progress = true;
      }
    }
  }
  while (remaining.size > 0) {              // 2) greedy: größter Zugewinn, dann größter Block
    let best = null, bestCount = -1, bestLit = 99;
    for (const p of primes) {
      if (chosen.includes(p)) continue;
      const cnt = p.cov.filter((x) => remaining.has(x)).length;
      if (cnt > bestCount || (cnt === bestCount && p.fixed.length < bestLit)) { best = p; bestCount = cnt; bestLit = p.fixed.length; }
    }
    if (!best || bestCount <= 0) break;
    chosen.push(best);
    best.cov.forEach((x) => remaining.delete(x));
  }
  return chosen;
}

/* target: '1' -> DMF (Einsen), '0' -> KMF (Nullen). X zählt als erlaubt. */
function solve(cells, target) {
  const allowed = new Set();
  const required = [];
  for (let m = 0; m < 8; m++) {
    if (cells[m] === target || cells[m] === "X") allowed.add(m);
    if (cells[m] === target) required.push(m);
  }
  if (required.length === 0) return { chosen: [], constStr: target === "1" ? "0" : "1" };

  const primes = [];
  for (const impl of ALL_IMPL) {
    const cov = COV[impl.join(",")];
    if (!cov.every((m) => allowed.has(m))) continue;        // gültig?
    let prime = true;                                       // maximal? (keine fixe Variable lässt sich entfernen)
    for (let i = 0; i < 3; i++) {
      if (impl[i] !== -1) {
        const t = impl.slice(); t[i] = -1;
        if (COV[t.join(",")].every((m) => allowed.has(m))) { prime = false; break; }
      }
    }
    if (prime) primes.push(makePrime(impl, cov));
  }
  const chosen = solveCover(primes, required);
  if (chosen.length === 1 && chosen[0].fixed.length === 0) return { chosen, constStr: target === "1" ? "1" : "0" };
  return { chosen, constStr: null };
}

/* Term-Renderer */
const Lit = ({ v, neg }) => (neg ? <Bar>{v}</Bar> : <span>{v}</span>);
function ProductTerm({ fixed }) { // DMF: 1 fix=1 -> Variable, fix=0 -> negiert
  if (fixed.length === 0) return <>1</>;
  return <>{fixed.map((f, i) => <React.Fragment key={i}>{i > 0 && "·"}<Lit v={f.v} neg={f.val === 0} /></React.Fragment>)}</>;
}
function SumTerm({ fixed }) { // KMF: 0-Block -> Summenterm, fix=1 -> negiert, fix=0 -> Variable
  if (fixed.length === 0) return <>0</>;
  return <>({fixed.map((f, i) => <React.Fragment key={i}>{i > 0 && " + "}<Lit v={f.v} neg={f.val === 1} /></React.Fragment>)})</>;
}
function renderEq(sol, kind) {
  if (sol.constStr !== null) return <>{sol.constStr}</>;
  const join = kind === "DMF" ? " + " : " · ";
  return sol.chosen.map((p, i) => (
    <React.Fragment key={i}>{i > 0 && join}{kind === "DMF" ? <ProductTerm fixed={p.fixed} /> : <SumTerm fixed={p.fixed} />}</React.Fragment>
  ));
}

/* =========================================================================
   KV-GRID (Präsentation) — wird von allen Visualisierungen genutzt
   props:
   - values: array8 ('0'|'1'|'X') oder null (dann werden Bits groß gezeigt)
   - chips: { minterm: [farbe,...] }  Blockzugehörigkeit
   - ring:  { minterm: farbe }        aktuell hervorgehobener Block
   - tint:  { minterm: farbe }        Hintergrundtönung (Vis-spezifisch)
   - onClick(minterm)
   ========================================================================= */
function KVGrid({ values = null, chips = {}, ring = {}, tint = {}, onClick }) {
  const hdr = { display: "flex", alignItems: "center", justifyContent: "center", color: C.accent2, fontWeight: 800, fontFamily: "ui-monospace, monospace", fontSize: 13 };
  const corner = { ...hdr, color: C.dim, fontSize: 11 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px repeat(4, 60px)", gap: 6, justifyContent: "center" }}>
      <div style={corner}>A\BC</div>
      {COL_LABELS.map((l) => <div key={l} style={hdr}>{l}</div>)}
      {[0, 1].map((r) => (
        <React.Fragment key={r}>
          <div style={hdr}>{ROW_LABELS[r]}</div>
          {[0, 1, 2, 3].map((ci) => {
            const m = GRID[r][ci];
            const v = values ? values[m] : null;
            const bits = mintermBits(m).join("");
            const valColor = v === "1" ? C.accent : v === "X" ? C.gold : C.dim;
            const bg = tint[m] || (v === "1" ? `${C.accent}1f` : v === "X" ? `${C.gold}1f` : C.panel2);
            const myChips = chips[m] || [];
            const rc = ring[m];
            return (
              <div
                key={ci}
                onClick={onClick ? () => onClick(m) : undefined}
                title={`m${m} = ${bits} (A,B,C)`}
                style={{
                  position: "relative", height: 60, borderRadius: 10,
                  background: bg, border: `1px solid ${C.line}`,
                  cursor: onClick ? "pointer" : "default",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transition: "background .25s ease, box-shadow .25s ease",
                  ["--rc"]: rc || "transparent",
                  boxShadow: rc ? `0 0 0 3px ${rc}` : "none",
                  animation: rc ? "ringpulse 1.1s ease-in-out infinite" : "none",
                }}
              >
                <div style={{ position: "absolute", top: 3, left: 5, fontSize: 9, color: C.dim, fontFamily: "ui-monospace, monospace" }}>m{m}·{bits}</div>
                {values
                  ? <div style={{ fontSize: 22, fontWeight: 800, color: valColor, fontFamily: "ui-monospace, monospace" }}>{v}</div>
                  : <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: "ui-monospace, monospace" }}>{bits}</div>}
                {myChips.length > 0 && (
                  <div style={{ position: "absolute", bottom: 4, display: "flex", gap: 3 }}>
                    {myChips.map((col, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: col }} />)}
                  </div>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

/* =========================================================================
   VIS 1 — Nachbarschaft & Gray-Code: warum dieses Raster?
   ========================================================================= */
const ADJ_STEPS = [
  { center: 0, note: "Jedes Feld hat genau 3 Nachbarn – je ein gekipptes Bit (A, B oder C). Nachbarn = Hamming-Abstand 1." },
  { center: 0, wrapWith: 2, note: "m0 (000) liegt links außen, m2 (010) rechts außen. Über den Rand hinweg sind sie trotzdem benachbart – nur B kippt. Darum darf ein Block „um die Kante wrappen“." },
  { center: 5, note: "Auch senkrecht: m5 (101) und m1 (001) liegen über-/untereinander – hier kippt nur A. Die Gray-Code-Anordnung sorgt dafür, dass JEDE Nachbarschaft genau 1 Bit ändert." },
];
function neighborsOf(m) { return [m ^ 4, m ^ 2, m ^ 1]; } // A,B,C kippen

function VisAdjacency() {
  const p = usePlayer(ADJ_STEPS.length, 2200);
  const s = ADJ_STEPS[p.step];
  const ring = { [s.center]: C.gold };
  const tint = {};
  if (s.wrapWith != null) {
    tint[s.center] = `${C.accent}33`; tint[s.wrapWith] = `${C.accent}33`;
  } else {
    neighborsOf(s.center).forEach((n) => (tint[n] = `${C.accent}33`));
  }
  return (
    <Card>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>
        In den Feldern stehen die Bitmuster <code style={{ color: C.text }}>A&nbsp;B&nbsp;C</code>. Beobachte, dass sich benachbarte Felder immer nur in <b style={{ color: C.text }}>einem</b> Bit unterscheiden.
      </div>
      <KVGrid ring={ring} tint={tint} />
      <div style={{ marginTop: 16, color: C.dim, fontSize: 14, lineHeight: 1.6, minHeight: 44 }}>{s.note}</div>
      <PlayerControls p={p} total={ADJ_STEPS.length} />
      <div style={{ marginTop: 14 }}>
        <Tag color={C.gold}>betrachtetes Feld</Tag>
        <Tag color={C.accent}>direkte Nachbarn (1 Bit Unterschied)</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   VIS 2 — Warum Zweierpotenzen? Block wächst, Term schrumpft.
   ========================================================================= */
const SHRINK_STEPS = [
  { cells: [7], fixed: [{ v: "A", val: 1 }, { v: "B", val: 1 }, { v: "C", val: 1 }], note: "1er-Block: ein einzelnes Feld. Alle drei Variablen bleiben im Term stehen – nichts entfällt." },
  { cells: [7, 6], fixed: [{ v: "A", val: 1 }, { v: "B", val: 1 }], note: "2er-Block (m6,m7): A=1 und B=1 sind fest, nur C wechselt zwischen 0 und 1. → C entfällt. 1 Variable weg." },
  { cells: [4, 5, 6, 7], fixed: [{ v: "A", val: 1 }], note: "4er-Block (komplette untere Zeile): nur A=1 bleibt fest, B und C wechseln frei. → B und C entfallen. 2 Variablen weg." },
];
function VisBlockShrink() {
  const p = usePlayer(SHRINK_STEPS.length, 2000);
  const s = SHRINK_STEPS[p.step];
  const tint = {}; const chips = {};
  s.cells.forEach((m) => { tint[m] = `${C.accent}33`; chips[m] = [C.accent]; });
  const size = s.cells.length;
  const entfallen = 3 - s.fixed.length;
  return (
    <Card>
      <div style={{ color: C.dim, fontSize: 14, marginBottom: 16 }}>
        Faustregel aus Scherzers Folien: bei 2er-/4er-/8er-Blöcken entfallen <b style={{ color: C.text }}>1 / 2 / 3</b> Variablen. Größere Blöcke = kürzere Terme = weniger Gatter.
      </div>
      <KVGrid values={["0", "0", "0", "0", "0", "0", "0", "0"].map((_, m) => (s.cells.includes(m) ? "1" : "0"))} tint={tint} chips={chips} />
      <div key={p.step} style={{ marginTop: 18, background: C.bg, border: `2px solid ${C.accent}`, borderRadius: 12, padding: "16px 18px", textAlign: "center", animation: "pop .35s ease" }}>
        <span style={{ fontSize: 26, fontFamily: "ui-monospace, monospace", color: C.text }}>Term = <ProductTerm fixed={s.fixed} /></span>
        <div style={{ color: C.accent, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{size}er-Block · {entfallen} Variable{entfallen === 1 ? "" : "n"} entfallen</div>
      </div>
      <div style={{ marginTop: 14, color: C.dim, fontSize: 14, lineHeight: 1.6 }}>{s.note}</div>
      <PlayerControls p={p} total={SHRINK_STEPS.length} playLabel="▶ Block vergrößern" />
    </Card>
  );
}

/* =========================================================================
   VIS 3 — Interaktiver KV-Trainer (Kernstück): klicken, lösen, animieren
   ========================================================================= */
const PRESETS = {
  "Beispiel (Ā + C)": ["1", "1", "1", "1", "0", "1", "0", "1"],
  "Mit Don't-Care": ["0", "1", "0", "1", "0", "X", "0", "X"],
  "Parität (kein Vorteil)": ["1", "0", "0", "1", "0", "1", "1", "0"],
  "Leeren": ["0", "0", "0", "0", "0", "0", "0", "0"],
};

function VisInteractiveKV() {
  const [cells, setCells] = useState(PRESETS["Beispiel (Ā + C)"].slice());
  const [mode, setMode] = useState("DMF"); // welcher Modus wird im Raster animiert

  const solDMF = useMemo(() => solve(cells, "1"), [cells]);
  const solKMF = useMemo(() => solve(cells, "0"), [cells]);
  const sol = mode === "DMF" ? solDMF : solKMF;
  const blocks = sol.chosen;
  const total = blocks.length + 1;

  const [step, setStep] = useState(total - 1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setStep(total - 1); setPlaying(false); }, [cells, mode, total]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => { if (s >= total - 1) { setPlaying(false); return s; } return s + 1; }), 1300);
    return () => clearInterval(id);
  }, [playing, total]);

  const visibleBlocks = blocks.slice(0, step);
  const current = step > 0 ? blocks[step - 1] : null;

  // chips/ring/tint aus sichtbaren Blöcken aufbauen
  const chips = {}; const ring = {}; const tint = {};
  visibleBlocks.forEach((b, i) => {
    const col = BLOCK_COLORS[i % BLOCK_COLORS.length];
    b.cov.forEach((m) => { (chips[m] = chips[m] || []).push(col); });
  });
  if (current) {
    const col = BLOCK_COLORS[(step - 1) % BLOCK_COLORS.length];
    current.cov.forEach((m) => { ring[m] = col; tint[m] = `${col}33`; });
  }

  const cycle = (m) => setCells((prev) => { const n = prev.slice(); n[m] = n[m] === "0" ? "1" : n[m] === "1" ? "X" : "0"; return n; });

  const playBuild = () => { if (!playing && step >= total - 1) setStep(0); setPlaying((p) => !p); };

  // Beschreibung des aktuellen Blocks
  let currentDesc = null;
  if (current) {
    const fixedStr = current.fixed.length ? current.fixed.map((f) => `${f.v}=${f.val}`).join(", ") : "nichts (ganzes Feld)";
    const entf = 3 - current.fixed.length;
    currentDesc = `${current.cov.length}er-Block · fest: ${fixedStr} · ${entf} Variable${entf === 1 ? "" : "n"} entfallen`;
  }

  return (
    <Card>
      {/* Steuerzeile: Presets + Modus */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {Object.keys(PRESETS).map((name) => (
          <button key={name} style={btnGhost} onClick={() => setCells(PRESETS[name].slice())}>{name}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button style={mode === "DMF" ? btn : btnGhost} onClick={() => setMode("DMF")}>DMF · Einsen-Blöcke</button>
        <button style={mode === "KMF" ? { ...btn, background: C.accent2 } : btnGhost} onClick={() => setMode("KMF")}>KMF · Nullen-Blöcke</button>
      </div>

      <div style={{ color: C.dim, fontSize: 13, marginBottom: 14 }}>
        Klick auf ein Feld schaltet seinen Wert weiter: <b style={{ color: C.accent }}>1</b> → <b style={{ color: C.gold }}>X</b> (Don't-Care) → <b style={{ color: C.dim }}>0</b> → … Das Tool sucht automatisch die maximal großen, rechteckigen Blöcke.
      </div>

      <KVGrid values={cells} chips={chips} ring={ring} tint={tint} onClick={cycle} />

      {/* aktueller Block */}
      <div style={{ marginTop: 16, minHeight: 24, textAlign: "center", color: current ? BLOCK_COLORS[(step - 1) % BLOCK_COLORS.length] : C.dim, fontSize: 13, fontWeight: 700 }}>
        {current ? currentDesc : step === 0 ? "— Reset: nur die Belegung, noch keine Blöcke —" : "Alle Blöcke eingezeichnet."}
      </div>

      {/* live aufgebaute Gleichung */}
      <div style={{ marginTop: 12, background: C.bg, border: `2px solid ${mode === "DMF" ? C.accent : C.accent2}`, borderRadius: 12, padding: "18px 16px", textAlign: "center", fontSize: 26, fontFamily: "ui-monospace, monospace", color: C.text }}>
        F&nbsp;=&nbsp;
        {sol.constStr !== null
          ? (step > 0 || blocks.length === 0 ? sol.constStr : <span style={{ color: C.dim }}>…</span>)
          : (visibleBlocks.length === 0
              ? <span style={{ color: C.dim, fontSize: 16 }}>– noch keine Blöcke –</span>
              : visibleBlocks.map((b, i) => (
                  <React.Fragment key={i}>{i > 0 && (mode === "DMF" ? " + " : " · ")}{mode === "DMF" ? <ProductTerm fixed={b.fixed} /> : <SumTerm fixed={b.fixed} />}</React.Fragment>
                )))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button style={btn} onClick={playBuild}>{playing ? "❚❚ Pause" : "▶ Blöcke aufbauen"}</button>
        <button style={btnGhost} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>◀ Schritt</button>
        <button style={btnGhost} onClick={() => setStep((s) => Math.min(total - 1, s + 1))} disabled={step === total - 1}>Schritt ▶</button>
        <button style={btnGhost} onClick={() => { setPlaying(false); setStep(0); }}>↺ Reset</button>
        <span style={{ marginLeft: "auto", color: C.dim, fontSize: 13, fontFamily: "ui-monospace, monospace" }}>Block {Math.min(step, blocks.length)} / {blocks.length}</span>
      </div>

      {/* Doppel-Ergebnis: beide Minimalformen */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginTop: 20 }}>
        <div style={{ background: `${C.accent}14`, border: `1px solid ${C.accent}55`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ color: C.accent, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Disjunktive Minimalform</div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 18, color: C.text }}>F = {renderEq(solDMF, "DMF")}</div>
        </div>
        <div style={{ background: `${C.accent2}14`, border: `1px solid ${C.accent2}55`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ color: C.accent2, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Konjunktive Minimalform</div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 18, color: C.text }}>F = {renderEq(solKMF, "KMF")}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Tag color={C.accent}>1 / Einsen</Tag>
        <Tag color={C.gold}>X / Don't-Care</Tag>
        <Tag color={C.dim}>0 / Nullen</Tag>
        <Tag color={BLOCK_COLORS[0]}>Block (Farbpunkte = Zugehörigkeit)</Tag>
      </div>
    </Card>
  );
}

/* =========================================================================
   HAUPT-KOMPONENTE
   ========================================================================= */
export default function KVDiagramm() {
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{KEYFRAMES}</style>

      <header style={{ maxWidth: 880, margin: "0 auto", padding: "64px 24px 24px" }}>
        <div style={{ color: C.accent, textTransform: "uppercase", letterSpacing: 3, fontSize: 13, fontWeight: 800 }}>Digitaltechnik · Lern-Trainer</div>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "12px 0 16px" }}>Das <span style={{ color: C.accent }}>KV-Diagramm</span></h1>
        <p style={{ fontSize: 18, color: C.dim, lineHeight: 1.7, maxWidth: 680 }}>
          Karnaugh-Veitch: das grafische Verfahren, um eine Schaltfunktion mit dem Auge zu minimieren. Du lernst, benachbarte Felder zu Blöcken zusammenzufassen und daraus die kürzestmögliche Formel abzulesen – interaktiv und Schritt für Schritt.
        </p>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* 0 — PROBLEM */}
        <Section kicker="0 · Das Problem" title="Warum ein Diagramm statt Algebra?">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Eine <b style={{ color: C.text }}>Schaltfunktion</b> (eine logische Funktion mit Werten 0 = falsch, 1 = wahr) liest man zunächst direkt aus der <b style={{ color: C.text }}>Wahrheitstabelle</b> ab – als <b style={{ color: C.text }}>kanonische disjunktive Normalform (KDNF)</b>, also eine ODER-Verknüpfung aller „Einser-Zeilen“. Diese Form ist korrekt, aber meist riesig und damit teuer in Gattern.
          </p>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Beim algebraischen Vereinfachen muss man das passende Gesetz erkennen – fehleranfällig und ohne Garantie aufs Minimum. Das <b style={{ color: C.text }}>KV-Diagramm</b> macht die Vereinfachung dagegen <i>sichtbar</i>: Man ordnet die Funktionswerte so an, dass zusammenfassbare Terme räumlich nebeneinander liegen, und „umkreist“ sie einfach.
          </p>
          <InfoBox title="Scherzers Einordnung">
            In den Folien heißt es sinngemäß, das grafische Verfahren sei „sehr anschaulich und selbsterklärend“, in der Praxis aber kaum noch relevant – man behandelt es trotzdem, <i>um die nicht-grafischen Verfahren</i> (Quine-McCluskey) <i>zu verstehen</i>. Behandelt werden maximal 4 Eingangsvariablen; das Ergebnis ist immer eine <b>disjunktive (DMF)</b> oder <b>konjunktive Minimalform (KMF)</b>.
          </InfoBox>
        </Section>

        {/* 1 — KERNIDEE */}
        <Section kicker="1 · Die Kernidee" title="Nachbarschaft = ein gekipptes Bit (Gray-Code)">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Das ganze Verfahren steht und fällt mit der Anordnung der Felder. Zeilen und Spalten werden im <b style={{ color: C.text }}>Gray-Code</b> beschriftet (00, 01, 11, 10 statt 00, 01, 10, 11) – ein „einschrittiger“ Code, bei dem sich aufeinanderfolgende Werte nur in einem einzigen Bit unterscheiden.
          </p>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Dadurch gilt: <b style={{ color: C.text }}>geometrisch benachbarte Felder unterscheiden sich in genau einem Bit</b> (Hamming-Abstand 1). Genau solche Paare lassen sich nach dem Komplementgesetz zusammenfassen – die eine Variable, die sich ändert, fällt weg.
          </p>
          <VisAdjacency />
        </Section>

        {/* 2 — DER SCHWIERIGE TEIL */}
        <Section kicker="2 · Der schwierige Teil" title="Blöcke bilden – und zwar richtig">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Man fasst benachbarte Einsen zu rechteckigen <b style={{ color: C.text }}>Blöcken</b> zusammen. Je größer ein Block, desto kürzer der Term:
          </p>
          <VisBlockShrink />
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8, marginTop: 20 }}>
            Damit das auch das echte Minimum liefert, gelten Scherzers Blockregeln strikt:
          </p>
          <MethodRow color={C.accent}  name="Nur Zweierpotenzen" formula="1, 2, 4, 8 …" note="Ein Block darf nur 1, 2, 4 oder 8 Felder umfassen – jede Kantenlänge muss eine Zweierpotenz sein." />
          <MethodRow color={C.accent}  name="Rechteckig"        formula="keine L-Formen" note="Blöcke sind immer rechteckige (bzw. quadratische) Bereiche, niemals krumme Formen." />
          <MethodRow color={C.gold}    name="So groß wie möglich" formula="max. Fläche" note="Jeder Block wird so weit vergrößert, wie es geht – größere Blöcke streichen mehr Variablen." />
          <MethodRow color={C.gold}    name="So wenige wie möglich" formula="min. Anzahl" note="Alle Einsen müssen überdeckt sein, aber mit möglichst wenigen Blöcken." />
          <MethodRow color={C.accent2} name="Dürfen überlappen" formula="Felder mehrfach" note="Ein Feld darf in mehreren Blöcken liegen. Bei Wahl: überlappende Blöcke bevorzugen (stabileres dynamisches Verhalten)." />
          <MethodRow color={C.accent2} name="Über den Rand (Wrap)" formula="links ↔ rechts, oben ↔ unten" note="Das Diagramm verhält sich wie ein Torus: gegenüberliegende Ränder sind benachbart. Ein Block darf über die Kante hinweg gebildet werden." />
          <MethodRow color={C.warn}    name="Keine Redundanz"   formula="kein Block überflüssig" note="Zwei Blöcke dürfen nicht exakt dieselben Einsen umfassen, und keine Gruppe darf vollständig in einer anderen enthalten sein." />
        </Section>

        {/* 3 — DAS WERKZEUG LIVE */}
        <Section kicker="3 · Das Werkzeug live" title="Interaktiver KV-Trainer (DMF & KMF)">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Jetzt selbst ausprobieren: Setze die acht Felder per Klick auf 0, 1 oder X. Das Tool findet die maximal großen Blöcke und baut beide Minimalformen auf – die <b style={{ color: C.accent }}>DMF</b> aus den Einsen und die <b style={{ color: C.accent2 }}>KMF</b> aus den Nullen.
          </p>
          <VisInteractiveKV />
          <p style={{ color: C.dim, fontSize: 14, lineHeight: 1.7, marginTop: 16 }}>
            Tipp: Lade „Parität (kein Vorteil)“, um zu sehen, wann sich gar nichts zusammenfassen lässt – dann braucht es so viele Terme wie Einsen.
          </p>
        </Section>

        {/* 4 — SONDERFÄLLE */}
        <Section kicker="4 · Sonderfälle" title="Don't-Care und die Wahl DMF vs. KMF">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            <b style={{ color: C.gold }}>Don't-Care (X)</b> bezeichnet Eingangskombinationen, die nie auftreten oder deren Ausgang egal ist (z. B. die sechs Pseudotetraden im BCD-Code). Beim Blockbilden ist X ein <b style={{ color: C.text }}>Joker</b>: Man darf es als 1 mitnehmen, <i>falls es einen Block vergrößert</i> – ansonsten lässt man es als 0. So entstehen größere Blöcke und kürzere Terme „geschenkt“.
          </p>
          <InfoBox title="DMF oder KMF – was nehmen?">
            Beide Formen beschreiben dieselbe Funktion. Man wählt die, die weniger Aufwand erzeugt: Hat die Funktion <b>wenige Einsen</b>, ist die DMF (Einsen umkreisen) kompakter; hat sie <b>wenige Nullen</b>, lohnt die KMF. Für die KMF fasst man die <b>Nullen</b> zu Blöcken zusammen, liest daraus zunächst das Komplement <code style={{ color: C.text }}>F̄</code> ab und negiert es per De Morgan / Shannonschem Satz – aus jedem Produktterm wird ein Summenterm mit invertierten Variablen, aus dem ODER ein UND.
          </InfoBox>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            Der <b style={{ color: C.text }}>Shannonsche Satz</b>: Man invertiert einen Ausdruck, indem man alle Variablen invertiert und jede Operation durch ihre duale ersetzt (UND ↔ ODER). Genau das passiert beim Übergang von der Nullen-DMF zur fertigen KMF.
          </p>
        </Section>

        {/* 5 — ANALYSE */}
        <Section kicker="5 · Analyse" title="Korrektheit, Minimum und die Grenze">
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            <b style={{ color: C.text }}>Korrektheit:</b> Jeder Block ist ein gültiger Implikant – alle seine Felder sind 1 (oder X). Die ODER-Verknüpfung aller Blöcke deckt also genau die Einsen ab und nichts darüber hinaus. Das Ergebnis ist damit wertgleich zur Ausgangsfunktion.
          </p>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.8 }}>
            <b style={{ color: C.text }}>Minimum:</b> Die größtmöglichen Blöcke heißen <b style={{ color: C.text }}>Primimplikanten</b>. Wählt man die unverzichtbaren davon (wesentliche Primimplikanten) plus möglichst wenige weitere zur Überdeckung, erhält man eine minimale Form. Genau dieses Vorgehen formalisiert das tabellarische Quine-McCluskey-Verfahren – das KV-Diagramm ist seine grafische Variante für den Menschen.
          </p>
          <InfoBox title="O-Notation: warum nur bis 4 Variablen">
            Die <b>O-Notation</b> beschreibt das Wachstum des Aufwands mit der Eingabegröße. Ein KV-Diagramm hat <code>2ⁿ</code> Felder (n = Variablen). Bei 2 Variablen sind das 4, bei 4 schon 16, bei 6 bereits 64 Felder in einem 2-dimensionalen Raster, dessen Nachbarschaften der Mensch nicht mehr überblickt. Darum ist das grafische Verfahren auf etwa <b>n ≤ 4</b> begrenzt – jenseits davon übernimmt der Computer mit Quine-McCluskey (dessen Aufwand allerdings exponentiell bleibt).
          </InfoBox>
        </Section>

        {/* 6 — ZUSAMMENFASSUNG */}
        <Section kicker="6 · Auf einen Blick" title="Das Wichtigste zusammengefasst">
          <Card style={{ background: `${C.accent}14`, border: `1px solid ${C.accent}55` }}>
            <ul style={{ margin: 0, paddingLeft: 22, color: C.text, fontSize: 16, lineHeight: 2 }}>
              <li><b>Aufbau:</b> Zeilen/Spalten im Gray-Code → Nachbarn unterscheiden sich in 1 Bit.</li>
              <li><b>DMF:</b> Einsen zu Blöcken (Zweierpotenz, rechteckig, max. groß, min. Anzahl, dürfen überlappen & wrappen) → ODER von UND-Termen.</li>
              <li><b>KMF:</b> Nullen zu Blöcken → Komplement ablesen → per De Morgan/Shannon negieren → UND von ODER-Termen.</li>
              <li><b>Don't-Care (X):</b> als 1 nutzen, wenn es Blöcke vergrößert; sonst als 0.</li>
              <li><b>Grenze:</b> sinnvoll bis ~4 Variablen, darüber Quine-McCluskey.</li>
            </ul>
            <div style={{ marginTop: 16, fontSize: 17, color: C.accent, fontWeight: 800 }}>
              Kernaussage: Möglichst große, möglichst wenige Blöcke ablesen – jeder verdoppelte Block streicht eine weitere Variable.
            </div>
          </Card>
        </Section>

        {/* 7 — GLOSSAR */}
        <Section kicker="7 · Glossar" title="Alle Begriffe & Symbole kompakt">
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            <GlossEntry term="KV-Diagramm" def="Karnaugh-Veitch-Diagramm: grafisches Raster zur Minimierung von Schaltfunktionen bis ~4 Variablen." />
            <GlossEntry term="Schaltfunktion" def="Logische Funktion, die Eingänge (0/1) auf einen Ausgang (0/1) abbildet." />
            <GlossEntry term="Minterm" def="Vollkonjunktion: UND-Term, in dem jede Variable genau einmal (normal oder negiert) vorkommt – eine Einser-Zeile der Tabelle." />
            <GlossEntry term="Maxterm" def="Volldisjunktion: ODER-Term mit allen Variablen – eine Nuller-Zeile der Tabelle." />
            <GlossEntry term="KDNF / KKNF" def="Kanonische disjunktive/konjunktive Normalform: ungekürzte ODER-aller-Minterme bzw. UND-aller-Maxterme." />
            <GlossEntry term="DMF" def="Disjunktive Minimalform: minimierte ODER-Verknüpfung von UND-Termen (aus den Einsen)." />
            <GlossEntry term="KMF" def="Konjunktive Minimalform: minimierte UND-Verknüpfung von ODER-Termen (aus den Nullen)." />
            <GlossEntry term="Gray-Code" def="Einschrittiger Code (00,01,11,10): benachbarte Werte unterscheiden sich in genau einem Bit." />
            <GlossEntry term="Hamming-Abstand" def="Anzahl der Bitstellen, in denen sich zwei Codewörter unterscheiden. Nachbarn im KV: Abstand 1." />
            <GlossEntry term="Block / Gruppe" def="Rechteckige Zusammenfassung von 1/2/4/8 benachbarten Feldern, Kantenlänge = Zweierpotenz." />
            <GlossEntry term="Implikant" def="Term, der nur dort 1 ist, wo auch die Funktion 1 ist – im KV ein gültiger Block." />
            <GlossEntry term="Primimplikant" def="Größtmöglicher Block, der sich nicht weiter vergrößern lässt." />
            <GlossEntry term="Wesentlicher PI" def="Primimplikant, der als einziger eine bestimmte 1 abdeckt – muss in die Lösung." />
            <GlossEntry term="Don't-Care (X)" def="Eingangskombination, deren Ausgang egal/unmöglich ist. Joker: als 1 oder 0 nutzbar." />
            <GlossEntry term="Wrap-around" def="Rand-Nachbarschaft: gegenüberliegende Kanten des Diagramms sind benachbart (Torus)." />
            <GlossEntry term="Shannonscher Satz" def="Invertieren = alle Variablen invertieren und jede Operation durch ihre duale ersetzen." />
            <GlossEntry term="Quine-McCluskey" def="Tabellarisches Verfahren mit gleichem Ziel, auch für viele Variablen geeignet." />
          </div>
        </Section>

      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ color: C.dim, fontSize: 14, lineHeight: 1.7 }}>
          Lern-Trainer · Digitaltechnik – Schaltungssynthese & Minimierung<br />
          Kapitelbezug: KV-Diagramme, DMF/KMF, Don't-Care · Prof. Scherzer · DHBW Bad Mergentheim
        </div>
      </footer>
    </div>
  );
}
