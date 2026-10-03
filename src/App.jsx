import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  findLearningItemBySlug,
  getLearningCatalog,
  searchLearningCatalog,
} from "./catalog.js";
import { createPersonalStore } from "./personalStore.js";
import { createLearningControl } from "./learningControl.js";
import { getSemesterLearningProgram } from "./learningProgram.js";
import LearningOverview from "./components/LearningOverview.jsx";
import "./app.css";

const modules = import.meta.glob([
  "./trainers/**/*.jsx",
  "./components/Archiv/**/*.jsx",
  "./components/ExamDiagnostic.jsx",
]);
const lazyModules = new Map();

function getTrainer(item) {
  if (!item?.source || !modules[item.source]) return null;
  if (!lazyModules.has(item.source)) lazyModules.set(item.source, lazy(modules[item.source]));
  return lazyModules.get(item.source);
}

function routeFromPath(path) {
  const url = new URL(path, window.location.origin);
  const pathname = url.pathname;
  if (pathname === "/bibliothek") return { name: "library" };
  if (pathname === "/pruefungen") return { name: "exams", create: url.searchParams.has("neu") };
  if (pathname === "/archiv") return { name: "archive" };
  if (pathname === "/uebersicht") return { name: "overview" };
  const match = pathname.match(/^\/trainer\/([^/]+)\/?$/);
  if (match) return { name: "trainer", slug: decodeURIComponent(match[1]) };
  return { name: "home" };
}

function useRoute(onBlocked) {
  const [route, setRoute] = useState(() => routeFromPath(window.location.href));
  const currentPath = useRef(window.location.pathname + window.location.search);
  const blockRef = useRef(onBlocked);
  blockRef.current = onBlocked;
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname + window.location.search;
      if (blockRef.current?.(path)) {
        window.history.pushState({}, "", currentPath.current);
        return;
      }
      currentPath.current = path;
      setRoute(routeFromPath(path));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    currentPath.current = path;
    setRoute(routeFromPath(path));
    window.scrollTo?.({ top: 0, behavior: "instant" });
  };
  return [route, navigate];
}

function usePersonalState(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

const systemClock = () => Date.now();

export default function App({ storage = window.localStorage, learningClock = systemClock }) {
  const catalog = useMemo(getLearningCatalog, []);
  const store = useMemo(() => createPersonalStore(storage), [storage]);
  const personal = usePersonalState(store);
  const program = useMemo(getSemesterLearningProgram, []);
  const learningControl = useMemo(
    () => createLearningControl({ storage, program, clock: learningClock }),
    [storage, program, learningClock],
  );
  const learning = useSyncExternalStore(learningControl.subscribe, learningControl.getSnapshot, learningControl.getSnapshot);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigationRequest, setNavigationRequest] = useState(null);
  const [archivedUndo, setArchivedUndo] = useState(null);
  const editorDirtyRef = useRef(false);
  const [route, navigate] = useRoute((path) => {
    if (!editorDirtyRef.current) return false;
    setNavigationRequest({ path });
    return true;
  });
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryCourse, setLibraryCourse] = useState("Alle Kurse");
  const returnPath = useRef("/");
  const libraryScroll = useRef(0);
  const searchReturnFocus = useRef(null);
  const openSearch = () => {
    searchReturnFocus.current = document.activeElement;
    setSearchOpen(true);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    window.requestAnimationFrame?.(() => searchReturnFocus.current?.focus());
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const inField = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      } else if (event.key === "/" && !inField) {
        event.preventDefault();
        openSearch();
      } else if (event.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!archivedUndo) return undefined;
    const timeout = window.setTimeout(() => setArchivedUndo(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [archivedUndo]);

  const openItem = (item, targetId) => {
    if (!item) return;
    store.recordOpen(item.slug);
    if (route.name !== "trainer") {
      returnPath.current = window.location.pathname + window.location.search;
      if (route.name === "library") libraryScroll.current = window.scrollY;
    }
    const target = program.targets.find((candidate) => candidate.id === targetId);
    if (target && learning.pausedSessions?.[target.id]) learningControl.startTarget(target.id);
    const query = target ? `?einheit=${encodeURIComponent(target.id)}${target.topicId ? `&familie=${encodeURIComponent(target.topicId)}` : ""}` : "";
    requestNavigation(`/trainer/${item.slug}${query}`);
  };

  const requestNavigation = (path) => {
    if (editorDirtyRef.current) {
      setNavigationRequest({ path });
      return;
    }
    navigate(path);
  };

  const archiveExam = (exam) => {
    store.archiveExam(exam.id);
    setArchivedUndo(exam);
  };

  const startLearning = () => {
    const started = learningControl.startNow();
    if (started) {
      returnPath.current = window.location.pathname + window.location.search;
      store.recordOpen(learning.action.trainerSlug);
      requestNavigation(started.path);
    }
  };

  if (route.name === "trainer") {
    const item = findLearningItemBySlug(route.slug);
    const requestedUnit = new URLSearchParams(window.location.search).get("einheit");
    const learningSession = learning.activeSession?.action.trainerSlug === route.slug && (!requestedUnit || learning.activeSession.action.targetId === requestedUnit) ? learning.activeSession : null;
    return <>
      <TrainerView
        item={item}
        learningControl={learningControl}
        learningSession={learningSession}
        learningProgress={learning}
        onStartRound={(targetId, mode, initialRound) => {
          const started = learningControl.startTarget(targetId, mode, initialRound);
          if (started) requestNavigation(started.path);
          return started;
        }}
        onRoundChange={(round) => learningSession && learningControl.updateRound(learningSession.id, round)}
        onOpenUnit={(targetId) => openItem(item, targetId)}
        pinned={personal.pins.includes(route.slug)}
        onBack={() => {
          requestNavigation(returnPath.current);
          if (returnPath.current === "/bibliothek") window.requestAnimationFrame?.(() => window.scrollTo?.({ top: libraryScroll.current, behavior: "instant" }));
        }}
        backLabel={returnPath.current === "/bibliothek" ? "Bibliothek" : returnPath.current === "/uebersicht" ? "Übersicht" : "Start"}
        onSearch={openSearch}
        onOverview={() => requestNavigation("/uebersicht")}
        onPin={() => item && store.togglePin(item.slug)}
        onLearningResult={(result) => {
          if (learningSession) return learningControl.complete({ sessionId: learningSession.id, result });
          if (item?.diagnosticId) return learningControl.recordDiagnostic({
            examId: item.diagnosticId, targetId: `diagnose-${item.diagnosticId}`,
            roundId: result.roundId || `diagnostic:${item.slug}:${learningClock()}`, ...result,
          });
          return { accepted: false };
        }}
      />
      {searchOpen && <SearchPalette catalog={catalog} onClose={closeSearch} onOpen={(next) => { closeSearch(); openItem(next); }} />}
    </>;
  }

  return (
    <div className="app-shell">
      <div className={`app-layout${personal.sidebarCollapsed ? " sidebar-collapsed" : ""}`} aria-hidden={searchOpen ? "true" : undefined} inert={searchOpen ? "" : undefined}>
        <Sidebar
          route={route}
          navigate={requestNavigation}
          onSearch={openSearch}
          collapsed={personal.sidebarCollapsed}
          onToggleCollapsed={() => store.setSidebarCollapsed(!personal.sidebarCollapsed)}
          warning={learning.warning}
        />
        <div className="app-main">
          <MobileHeader onSearch={openSearch} />
          <main>
            {route.name === "home" && (
              <HomePage
                navigate={requestNavigation}
                learning={learning}
                startLearning={startLearning}
              />
            )}
            {route.name === "library" && (
              <LibraryPage
                catalog={catalog}
                pins={personal.pins}
                openItem={openItem}
                togglePin={store.togglePin}
                learning={learning}
                query={libraryQuery} setQuery={setLibraryQuery}
                course={libraryCourse} setCourse={setLibraryCourse}
              />
            )}
            {route.name === "overview" && <LearningOverview learning={learning} program={program} onStart={startLearning} openItem={(slug, targetId) => openItem(findLearningItemBySlug(slug), targetId)} />}
            {route.name === "exams" && (
              <ExamsPage
                catalog={catalog}
                exams={personal.exams}
                startEditing={route.create}
                saveExam={store.saveExam}
                archiveExam={archiveExam}
                openItem={openItem}
                onDirtyChange={(dirty) => { editorDirtyRef.current = dirty; }}
                onCreated={() => window.history.replaceState({}, "", "/pruefungen")}
              />
            )}
            {route.name === "archive" && (
              <ArchivePage
                exams={personal.exams}
                restoreExam={store.restoreExam}
                removeExam={store.removeExam}
                openItem={openItem}
              />
            )}
          </main>
        </div>
        <MobileNav route={route} navigate={requestNavigation} />
      </div>
      {searchOpen && (
        <SearchPalette
          catalog={catalog}
          onClose={closeSearch}
          onOpen={(item) => {
            setSearchOpen(false);
            openItem(item);
          }}
        />
      )}
      {navigationRequest && (
        <ConfirmDialog
          title="Änderungen verwerfen?"
          copy="Deine Änderungen an dieser Prüfung wurden noch nicht gespeichert."
          confirmLabel="Änderungen verwerfen"
          onCancel={() => setNavigationRequest(null)}
          onConfirm={() => {
            const { path } = navigationRequest;
            editorDirtyRef.current = false;
            setNavigationRequest(null);
            navigate(path);
          }}
        />
      )}
      {archivedUndo && (
        <div className="undo-toast" role="status">
          <span>„{archivedUndo.title}“ archiviert.</span>
          <button onClick={() => { store.restoreExam(archivedUndo.id); setArchivedUndo(null); }}>Rückgängig</button>
          <button className="toast-close" aria-label="Meldung schließen" onClick={() => setArchivedUndo(null)}>×</button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ route, navigate, onSearch, collapsed, onToggleCollapsed, warning }) {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} aria-label="Hauptnavigation">
      <button className="brand" aria-label="Zur Startseite" title={collapsed ? "Start" : undefined} onClick={() => navigate("/")}>
        <span className="brand-mark">L</span>
        <span className="brand-copy"><strong>Lern·Trainer</strong><small>Dein Study Space</small></span>
      </button>
      <nav>
        <NavButton active={route.name === "home"} label="Start" icon="⌂" title={collapsed ? "Start" : undefined} onClick={() => navigate("/")} />
        <NavButton active={route.name === "overview"} label="Lernplan" icon="◉" title={collapsed ? "Lernplan" : undefined} onClick={() => navigate("/uebersicht")} />
        <NavButton active={route.name === "library"} label="Bibliothek" icon="▦" title={collapsed ? "Bibliothek" : undefined} onClick={() => navigate("/bibliothek")} />
        <NavButton active={route.name === "exams"} label="Prüfungen" icon="◇" title={collapsed ? "Prüfungen" : undefined} onClick={() => navigate("/pruefungen")} />
        <NavButton active={route.name === "archive"} label="Archiv" icon="▤" title={collapsed ? "Archiv" : undefined} onClick={() => navigate("/archiv")} />
      </nav>
      <button className="search-trigger" title={collapsed ? "Suchen" : undefined} aria-label="Suchen" onClick={onSearch}>
        <span>⌕</span><span>Suchen</span><kbd>⌘ K</kbd>
      </button>
      <button className="sidebar-toggle" aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"} title={collapsed ? "Sidebar ausklappen" : undefined} onClick={onToggleCollapsed}>
        <span aria-hidden="true">{collapsed ? "›" : "‹"}</span><span>{collapsed ? "Ausklappen" : "Einklappen"}</span>
      </button>
      <div className="sidebar-note">
        <span className="status-dot" />
        <span>{warning ? "Speicherung eingeschränkt" : "Lernstand auf diesem Gerät"}<br /><small>{warning ? "Hinweis im Lernbereich beachten" : "Lokal im Browser"}</small></span>
      </div>
    </aside>
  );
}

function NavButton({ active, label, icon, title, onClick }) {
  return <button className={`nav-button${active ? " active" : ""}`} aria-label={label} aria-current={active ? "page" : undefined} title={title} onClick={onClick}><span aria-hidden="true">{icon}</span><span className="nav-label">{label}</span></button>;
}

function MobileHeader({ onSearch }) {
  return <header className="mobile-header"><div><span className="brand-mark small">L</span><strong>Lern·Trainer</strong></div><button aria-label="Suchen" onClick={onSearch}>⌕</button></header>;
}

function MobileNav({ route, navigate }) {
  return <nav className="mobile-nav" aria-label="Mobile Hauptnavigation">
    <NavButton active={route.name === "home"} label="Start" icon="⌂" onClick={() => navigate("/")} />
    <NavButton active={route.name === "overview"} label="Lernplan" icon="◉" onClick={() => navigate("/uebersicht")} />
    <NavButton active={route.name === "library"} label="Bibliothek" icon="▦" onClick={() => navigate("/bibliothek")} />
    <NavButton active={route.name === "exams"} label="Prüfungen" icon="◇" onClick={() => navigate("/pruefungen")} />
    <NavButton active={route.name === "archive"} label="Archiv" icon="▤" onClick={() => navigate("/archiv")} />
  </nav>;
}

function HomePage({ navigate, learning, startLearning }) {
  return <div className="page home-page">
    <section className="hero-panel">
      <div>
        <p className="eyebrow">DEINE LERNWERKSTATT · SEMESTER 3</p>
        <h1>Verstehen. Anwenden.<br /><span>Weiterkommen.</span></h1>
        <p className="hero-copy">Ein klarer nächster Schritt. Fünf Fächer. Dein Fortschritt bleibt sichtbar – vom ersten Versuch bis zum zweiten fehlerfreien Durchlauf.</p>
        <button className="secondary-button" onClick={() => navigate("/uebersicht")}>Meinen Lernplan ansehen →</button>
      </div>
      <TodayCard learning={learning} onStart={startLearning} />
    </section>
    <SectionHeader eyebrow="FREIES ÜBEN" title="Weitere Lernangebote" action="Bibliothek öffnen" onAction={() => navigate("/bibliothek")} />
    {learning.warning && <p className="today-warning" role="status">{learning.warning}</p>}
    <p className="home-library-note">Geplante und frei gestartete Runden zählen nach denselben Regeln. Lernmaterial und ergänzende Themen findest du in der Bibliothek.</p>
  </div>;
}

function TodayCard({ learning, onStart }) {
  const action = learning.action;
  const target = learning.program.targets.find((item) => item.id === action?.targetId);
  if (!action) return <aside className="today-card done"><span className="today-label">HEUTE</span><h2>{learning.status === "rest" ? "Lernfreier Tag" : "Tagesziel erreicht"}</h2><p>Es ist kein weiterer Pflichtblock eingeplant. Die Bibliothek bleibt für freiwilliges Üben offen.</p><div className="today-progress">Diese Woche: {learning.weekMinutes} / {learning.fixedWeeklyMinutes} Minuten</div></aside>;
  return <aside className="today-card">
    <div className="today-topline"><span className="today-label">{learning.status === "active" ? "DEINE OFFENE RUNDE" : "DEIN NÄCHSTER SCHRITT"}</span><span className="relevance-badge">{action.kind === "diagnostic" ? "Orientierung" : "Lerneinheit"}</span></div>
    <h2>{action.examTitle}</h2>
    {target?.title && <strong className="today-unit-title">{target.title}</strong>}
    <p className="today-action">{action.kind === "diagnostic" ? "Kalter Einstiegstest" : action.kind === "review" ? "Fällige Wiederholung" : action.level?.label || "Geführter Lernblock"} · {action.minutes} Min.</p>
    <details><summary>Warum ist das relevant?</summary><p>{action.reason}</p><small>Quelle: {action.source}</small></details>
    {learning.warning && <p className="today-warning" role="status">{learning.warning}</p>}
    <button className="primary-button" onClick={onStart}>{learning.status === "active" ? "Sitzung fortsetzen" : "Jetzt starten"}</button>
    <div className="today-progress">Diese Woche: {learning.weekMinutes} / {learning.fixedWeeklyMinutes} Minuten</div>
  </aside>;
}

function SectionHeader({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action && <button className="text-button" onClick={onAction}>{action} <span>→</span></button>}</div>;
}

function CatalogSections({ catalog, pins, onOpen, onPin, learning }) {
  const courses = groupBy(catalog, "course");
  return <div className="catalog-sections">{[...courses.entries()].map(([course, items]) => <section className="course-section" key={course}><div className="course-title"><h3>{course}</h3><span>{items.length} {items.length === 1 ? "Lernangebot" : "Lernangebote"}</span></div><div className="card-grid">{items.map((item) => <LearningCard key={item.slug} item={item} pinned={pins.includes(item.slug)} onOpen={onOpen} onPin={onPin} learning={learning} />)}</div></section>)}</div>;
}

function LearningCard({ item, pinned, onOpen, onPin, learning }) {
  const units = (learning?.unitProgress || []).filter((unit) => unit.trainerSlug === item.slug);
  const attempts = units.reduce((sum, unit) => sum + unit.attempts, 0);
  return <article className="learning-card">
    <button className="cover-button" onClick={() => onOpen(item)} aria-label={`${item.title} öffnen`}>
      <CoverArt item={item} />
    </button>
    <div className="card-body">
      <div className="card-meta"><span>{item.topic}</span><span>{item.duration}</span></div>
      <button className="card-title" onClick={() => onOpen(item)}>{item.title}</button>
      <p>{item.goal}</p>
      {units.length > 0 && <div className="card-learning-status"><span>{units.filter((unit) => unit.completed).length}/{units.length} Einheiten abgeschlossen</span><span>{attempts} {attempts === 1 ? "Versuch" : "Versuche"}</span></div>}
      <div className="card-footer"><span>{item.kind === "lab" ? "Lernlabor" : item.course}</span><button className={`pin-button${pinned ? " pinned" : ""}`} aria-label={pinned ? `${item.title} lösen` : `${item.title} anheften`} aria-pressed={pinned} onClick={() => onPin(item.slug)}>{pinned ? "◆" : "◇"}</button></div>
    </div>
  </article>;
}

const coverPalettes = {
  violet: ["#8b5cf6", "#d8b4fe"], amber: ["#d97706", "#fde68a"], mint: ["#047857", "#a7f3d0"], cyan: ["#0369a1", "#a5f3fc"], orange: ["#c2410c", "#fed7aa"], blue: ["#1d4ed8", "#bfdbfe"], rose: ["#be123c", "#fecdd3"], green: ["#15803d", "#bbf7d0"], indigo: ["#4338ca", "#c7d2fe"], purple: ["#7e22ce", "#e9d5ff"], coral: ["#c2410c", "#fecaca"], teal: ["#0f766e", "#99f6e4"],
};

function CoverArt({ item }) {
  const [dark, light] = coverPalettes[item.accent] || coverPalettes.blue;
  const seed = [...item.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const mode = seed % 3;
  const subject = item.course === "Formale Sprachen & Automaten" ? "automaton" : item.course === "Angewandte Mathematik" ? "math" : item.course === "Kommunikations- und Netztechnik" ? "network" : item.course === "Systemnahe Programmierung 1" ? "memory" : item.course === "Web Engineering 2" ? "web" : null;
  return <div className="cover-art" style={{ "--cover-dark": dark, "--cover-light": light }} aria-hidden="true">
    <svg viewBox="0 0 360 210" focusable="false">
      <defs><linearGradient id={`g-${item.slug}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={dark}/><stop offset="1" stopColor={light}/></linearGradient></defs>
      <rect width="360" height="210" rx="24" fill={`url(#g-${item.slug})`} />
      {subject === "automaton" && <g fill="none" stroke="white" strokeWidth="3"><path d="M27 96H55M110 96H153M208 96H252"/><path d="M44 88l11 8-11 8M142 88l11 8-11 8M241 88l11 8-11 8"/><circle cx="82" cy="96" r="27"/><circle cx="180" cy="96" r="27"/><circle cx="279" cy="96" r="27"/><circle cx="279" cy="96" r="21"/><g fill="white" stroke="none" fontSize="17" textAnchor="middle"><text x="82" y="102">q₀</text><text x="180" y="102">q₁</text><text x="279" y="102">q₂</text></g></g>}
      {subject === "math" && <g fill="none" stroke="white"><path d="M40 145H320M60 155V32" opacity=".5"/><path d="M60 125Q175 140 290 40" strokeWidth="4"/><path d="M115 143L270 45" strokeWidth="2" strokeDasharray="5 5"/><circle cx="197" cy="91" r="6" fill="white"/><text x="245" y="130" fill="white" stroke="none" fontSize="22">∇f</text></g>}
      {subject === "network" && <g fill="none" stroke="white" strokeWidth="3"><rect x="35" y="65" width="67" height="51" rx="6"/><path d="M68 116v16m-21 0h42M102 90h55m46 0h54" strokeDasharray="5 5"/><circle cx="180" cy="90" r="23"/><rect x="257" y="54" width="61" height="73" rx="5"/><path d="M268 73h38m-38 18h38m-38 18h38"/><rect x="126" y="80" width="14" height="19" rx="2" fill="white"/></g>}
      {subject === "memory" && <g fill="none" stroke="white" strokeWidth="2"><rect x="46" y="53" width="95" height="89" rx="6"/><text x="68" y="104" fill="white" stroke="none" fontSize="24">CPU</text><path d="M141 95h66m-50-10l10 10-10 10"/><rect x="209" y="41" width="96" height="27" rx="3"/><rect x="209" y="79" width="96" height="27" rx="3"/><rect x="209" y="117" width="96" height="27" rx="3"/><text x="225" y="61" fill="white" stroke="none" fontSize="14">0x00</text></g>}
      {subject === "web" && <g fill="none" stroke="white" strokeWidth="2"><rect x="35" y="46" width="119" height="95" rx="6"/><path d="M35 66h119"/><circle cx="47" cy="56" r="2" fill="white"/><path d="M65 87l-12 13 12 13m58-26l12 13-12 13m-20-30l-14 34M154 95h47m-12-8l12 8-12 8"/><rect x="204" y="61" width="113" height="65" rx="6"/><text x="227" y="100" fill="white" stroke="none" fontSize="22">API</text></g>}
      {!subject && mode === 0 && <><circle cx="260" cy="38" r="88" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="18"/><circle cx="284" cy="148" r="54" fill="rgba(255,255,255,.18)"/><path d="M40 160 L140 60 L210 130" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/></>}
      {!subject && mode === 1 && <><path d="M-20 170 C70 80 115 235 210 115 S330 20 390 70" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="12"/><path d="M-20 195 C75 105 130 260 225 140 S330 50 390 95" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="24"/><circle cx="92" cy="62" r="22" fill="white"/></>}
      {!subject && mode === 2 && <><g fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.8)" strokeWidth="5"><rect x="42" y="42" width="72" height="72" rx="18"/><rect x="144" y="70" width="72" height="72" rx="18"/><rect x="246" y="98" width="72" height="72" rx="18"/></g><path d="M114 78 H144 M216 106 H246" stroke="white" strokeWidth="6" strokeLinecap="round"/></>}
      <text x="28" y="188" fill="rgba(255,255,255,.88)" fontSize="12" fontWeight="700" letterSpacing="1.5">{item.course.toUpperCase().slice(0, 34)}</text>
    </svg>
  </div>;
}

function LibraryPage({ catalog, pins, openItem, togglePin, learning, query, setQuery, course, setCourse }) {
  const courses = [...new Set(catalog.map((item) => item.course))];
  const visible = searchLearningCatalog(query, catalog).filter((item) => course === "Alle Kurse" || item.course === course);
  return <div className="page"><PageIntro eyebrow="BIBLIOTHEK" title="Alle Lernangebote" copy="Durchsuche alle Trainer, Lernlabore und Prüfungsmodule an einem Ort." />
    <div className="filter-bar"><label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thema, Kurs oder Lernziel" aria-label="Bibliothek durchsuchen" /></label><select value={course} onChange={(event) => setCourse(event.target.value)} aria-label="Kurs filtern"><option>Alle Kurse</option>{courses.map((name) => <option key={name}>{name}</option>)}</select><span className="result-count">{visible.length} Ergebnisse</span></div>
    {visible.length ? <div className="catalog-sections">{[3, 2, 1, null].map((semester) => {
      const items = visible.filter((item) => item.semester === semester);
      if (!items.length && (semester !== 1 || query.trim() || course !== "Alle Kurse")) return null;
      const title = semester === null ? "Privat" : `${semester}. Semester`;
      return <section key={semester ?? "private"} aria-label={title}>
        <SectionHeader title={title} />
        {items.length ? <CatalogSections catalog={items} pins={pins} onOpen={openItem} onPin={togglePin} learning={learning} /> : <div className="empty-card"><strong>Noch keine Lernangebote</strong><p>Hier wartet noch Wissen im Dunkeln. Der erste Trainer macht das Licht an.</p></div>}
      </section>;
    })}</div> : <div className="empty-card"><strong>Keine passenden Lernangebote</strong><p>Versuche einen anderen Begriff oder entferne den Kursfilter.</p></div>}
  </div>;
}

function ExamsPage({ catalog, exams, startEditing, saveExam, archiveExam, openItem, onDirtyChange, onCreated }) {
  const [editingId, setEditingId] = useState(startEditing ? "new" : null);
  const [dirty, setDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [saveWarning, setSaveWarning] = useState("");
  const activeExams = exams.filter((exam) => !exam.archivedAt);
  const upcoming = activeExams.filter((exam) => !isPastExam(exam));
  const past = activeExams.filter(isPastExam);

  useEffect(() => {
    onDirtyChange(dirty);
    const warnBeforeUnload = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      onDirtyChange(false);
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [dirty, onDirtyChange]);

  const runOrConfirm = (action) => {
    if (dirty) setPendingAction(() => action);
    else action();
  };
  const beginEditing = (id) => runOrConfirm(() => {
    setEditingId(id);
    setDirty(false);
    setSaveWarning("");
  });
  const closeEditor = () => {
    setEditingId(null);
    setDirty(false);
    setSaveWarning("");
  };
  const save = (exam) => {
    const created = editingId === "new";
    const response = saveExam(exam);
    if (!response?.accepted || !response.persisted) {
      setSaveWarning("Die Prüfung konnte nicht dauerhaft gespeichert werden. Deine Eingaben bleiben hier erhalten. Bitte versuche erneut zu speichern.");
      return;
    }
    closeEditor();
    if (created) onCreated();
  };
  const archive = (exam) => runOrConfirm(() => {
    closeEditor();
    archiveExam(exam);
  });

  return <div className="page"><div className="page-title-row"><PageIntro eyebrow="PRÜFUNGSMODUS" title="Deine Prüfungen" copy="Termine, Fokuslisten und der nächste sinnvolle Einstieg – ohne künstliche Prozentwerte." /><button className="primary-button" onClick={() => beginEditing("new")}>Prüfung anlegen</button></div>
    {saveWarning && <p className="today-warning" role="alert">{saveWarning}</p>}
    {editingId === "new" && <ExamForm catalog={catalog} onCancel={() => runOrConfirm(closeEditor)} onSave={save} onDirtyChange={setDirty} />}
    {!activeExams.length && editingId !== "new" && <div className="empty-card large"><div className="empty-icon">◇</div><div><strong>Plane deine nächste Prüfung</strong><p>Lege Datum und Fokus-Trainer fest. Die App zeigt dir anschließend den direkten Einstieg.</p><button className="text-button" onClick={() => beginEditing("new")}>Erste Prüfung anlegen →</button></div></div>}
    {!!upcoming.length && <ExamSection title="Anstehend" exams={upcoming} editingId={editingId} catalog={catalog} onEdit={beginEditing} onCancel={() => runOrConfirm(closeEditor)} onSave={save} onDirtyChange={setDirty} onArchive={archive} onOpen={openItem} />}
    {!!past.length && <ExamSection title="Vergangen" exams={past} editingId={editingId} catalog={catalog} onEdit={beginEditing} onCancel={() => runOrConfirm(closeEditor)} onSave={save} onDirtyChange={setDirty} onArchive={archive} onOpen={openItem} />}
    {pendingAction && <ConfirmDialog title="Änderungen verwerfen?" copy="Deine Änderungen an dieser Prüfung wurden noch nicht gespeichert." confirmLabel="Änderungen verwerfen" onCancel={() => setPendingAction(null)} onConfirm={() => { const action = pendingAction; setPendingAction(null); setDirty(false); action(); }} />}
  </div>;
}

function ExamSection({ title, exams, editingId, catalog, onEdit, onCancel, onSave, onDirtyChange, onArchive, onOpen }) {
  return <section className="exam-section"><h2>{title}</h2><div className="exam-list">{exams.map((exam) => editingId === exam.id
    ? <ExamForm key={exam.id} catalog={catalog} exam={exam} onCancel={onCancel} onSave={onSave} onDirtyChange={onDirtyChange} />
    : <ExamCard key={exam.id} exam={exam} onEdit={() => onEdit(exam.id)} onArchive={() => onArchive(exam)} onOpen={onOpen} />)}</div></section>;
}

function ExamForm({ catalog, exam, onCancel, onSave, onDirtyChange }) {
  const initial = useMemo(() => ({ title: exam?.title ?? "", date: exam?.date ?? "", itemSlugs: exam?.itemSlugs ?? [] }), [exam]);
  const [title, setTitle] = useState(initial.title);
  const [date, setDate] = useState(initial.date);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(initial.itemSlugs);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const results = searchLearningCatalog(query, catalog);
  const choices = query.trim() ? results : results.slice(0, 12);
  const availableCount = selected.filter((slug) => findLearningItemBySlug(slug)).length;
  const dirty = title !== initial.title || date !== initial.date || selected.join("\0") !== initial.itemSlugs.join("\0");

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const move = (from, to) => {
    if (to < 0 || to >= selected.length || from === to) return;
    setSelected((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      const item = findLearningItemBySlug(moved);
      setAnnouncement(`${item?.title ?? "Eintrag"} an Position ${to + 1} verschoben.`);
      return next;
    });
  };
  const submit = (event) => {
    event.preventDefault();
    if (!title.trim() || !date || !availableCount) return;
    onSave({ id: exam?.id ?? `${Date.now()}`, title, date, itemSlugs: selected });
  };

  return <form className="exam-form" onSubmit={submit}><div className="form-heading"><div><span className="eyebrow">{exam ? "PRÜFUNG BEARBEITEN" : "NEUER TERMIN"}</span><h2>{exam ? exam.title : "Prüfung planen"}</h2></div><button type="button" className="icon-button" aria-label="Schließen" onClick={onCancel}>×</button></div><div className="form-row"><label>Prüfungsname<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="z. B. Formale Sprachen" required /></label><label>Datum<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label></div>
    <div className="focus-editor"><div className="editor-heading"><div><span className="eyebrow">DEINE FOKUSLISTE</span><h3>Reihenfolge festlegen</h3></div><span>{selected.length} {selected.length === 1 ? "Eintrag" : "Einträge"}</span></div><div className="ordered-focus-list">{selected.map((slug, index) => {
      const item = findLearningItemBySlug(slug);
      return <div className={`focus-editor-row${item ? "" : " unavailable"}`} key={slug} onDragEnter={(event) => { event.preventDefault(); if (draggedIndex !== null) { move(draggedIndex, index); setDraggedIndex(index); } }} onDragOver={(event) => event.preventDefault()}>
        <span className="focus-position">{String(index + 1).padStart(2, "0")}</span>
        <button type="button" className="drag-handle" draggable aria-label={`${item?.title ?? slug} ziehen`} onDragStart={(event) => { setDraggedIndex(index); event.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => setDraggedIndex(null)}>⠿</button>
        <span className="focus-editor-copy"><strong>{item?.title ?? slug}</strong><small>{item ? `${item.course} · ${item.duration}` : "Nicht mehr verfügbar"}</small></span>
        <span className="reorder-actions"><button type="button" aria-label={`${item?.title ?? slug} nach oben`} disabled={index === 0} onClick={() => move(index, index - 1)}>↑</button><button type="button" aria-label={`${item?.title ?? slug} nach unten`} disabled={index === selected.length - 1} onClick={() => move(index, index + 1)}>↓</button><button type="button" className="remove-focus" aria-label={`${item?.title ?? slug} entfernen`} onClick={() => setSelected((current) => current.filter((value) => value !== slug))}>×</button></span>
      </div>;
    })}</div>{!selected.length && <p className="focus-empty">Füge mindestens einen Trainer aus der Suche hinzu.</p>}<p className="sr-only" aria-live="polite">{announcement}</p></div>
    <label className="trainer-search-label">Trainer hinzufügen<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thema, Kurs oder Lernziel suchen" /></label><div className="choice-list add-choice-list">{choices.map((item) => {
      const added = selected.includes(item.slug);
      return <button type="button" key={item.slug} className={added ? "added" : ""} disabled={added} onClick={() => setSelected((current) => [...current, item.slug])}><span><strong>{item.title}</strong><small>{item.course} · {item.duration}</small></span><span>{added ? "Hinzugefügt" : "+ Hinzufügen"}</span></button>;
    })}</div>{!choices.length && <p className="no-choice-results">Keine passenden Trainer gefunden.</p>}<div className="form-actions"><span>{availableCount ? `${availableCount} verfügbar` : "Mindestens ein verfügbarer Trainer erforderlich"}</span><button type="button" className="secondary-button" onClick={onCancel}>Abbrechen</button><button className="primary-button" disabled={!title.trim() || !date || !availableCount}>{exam ? "Änderungen sichern" : "Speichern"}</button></div></form>;
}

function ExamCard({ exam, onEdit, onArchive, onOpen, archived = false, onRestore, onDelete }) {
  const items = exam.itemSlugs.map(findLearningItemBySlug).filter(Boolean);
  return <article className="exam-card"><div className="exam-date"><strong>{dateDistance(exam.date).short}</strong><span>{dateDistance(exam.date).suffix}</span></div><div className="exam-content"><span className="eyebrow">{formatExamDate(exam.date)}</span><h2>{exam.title}</h2><div className="focus-list">{items.map((item, index) => <button key={item.slug} onClick={() => onOpen(item)}><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.topic}</small></span><span>→</span></button>)}</div><div className="exam-card-actions">{archived ? <><button className="secondary-button" onClick={onRestore}>Wiederherstellen</button><button className="danger-text-button" onClick={onDelete}>Endgültig löschen</button></> : <><button className="secondary-button" onClick={onEdit}>Bearbeiten</button><button className="text-button" onClick={onArchive}>Archivieren</button></>}</div></div></article>;
}

function ArchivePage({ exams, restoreExam, removeExam, openItem }) {
  const archived = exams.filter((exam) => exam.archivedAt).sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));
  const [deleteExam, setDeleteExam] = useState(null);
  return <div className="page"><PageIntro eyebrow="ARCHIV" title="Archivierte Prüfungen" copy="Abgelegte Prüfungsvorbereitungen bleiben erreichbar und können jederzeit zurückkehren." />
    {archived.length ? <div className="exam-list">{archived.map((exam) => <ExamCard key={exam.id} exam={exam} archived onRestore={() => restoreExam(exam.id)} onDelete={() => setDeleteExam(exam)} onOpen={openItem} />)}</div> : <div className="empty-card large"><div className="empty-icon">▤</div><div><strong>Dein Archiv ist leer</strong><p>Archivierte Prüfungen erscheinen hier und lassen sich später wiederherstellen.</p></div></div>}
    {deleteExam && <ConfirmDialog destructive title="Prüfung endgültig löschen?" copy={`„${deleteExam.title}“ und ihre Fokusliste werden unwiderruflich entfernt.`} confirmLabel="Endgültig löschen" onCancel={() => setDeleteExam(null)} onConfirm={() => { removeExam(deleteExam.id); setDeleteExam(null); }} />}
  </div>;
}

function ConfirmDialog({ title, copy, confirmLabel, destructive = false, onCancel, onConfirm }) {
  const cancelRef = useRef(null);
  const returnFocus = useRef(document.activeElement);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab") return;
      const dialog = cancelRef.current?.closest("[role=dialog]");
      const focusable = [...(dialog?.querySelectorAll("button") ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame?.(() => returnFocus.current?.focus());
    };
  }, [onCancel]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-copy"><h2 id="confirm-title">{title}</h2><p id="confirm-copy">{copy}</p><div><button ref={cancelRef} className="secondary-button" onClick={onCancel}>Abbrechen</button><button className={destructive ? "danger-button" : "primary-button"} onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}

function examDay(date) {
  return new Date(`${date}T00:00:00`);
}

function todayDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysFromToday(date) {
  return Math.round((examDay(date) - todayDay()) / 86400000);
}

function isPastExam(exam) {
  return daysFromToday(exam.date) < 0;
}

function dateDistance(date) {
  const days = daysFromToday(date);
  if (days === 0) return { short: "Heute", suffix: "" };
  if (days === 1) return { short: "Morgen", suffix: "" };
  if (days > 1) return { short: `in ${days}`, suffix: "Tagen" };
  return { short: `vor ${Math.abs(days)}`, suffix: Math.abs(days) === 1 ? "Tag" : "Tagen" };
}

function formatExamDate(date) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${date}T12:00:00`));
}

function PageIntro({ eyebrow, title, copy }) {
  return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></header>;
}

function SearchPalette({ catalog, onClose, onOpen }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);
  const results = searchLearningCatalog(query, catalog);
  return <div className="search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="search-palette" role="dialog" aria-modal="true" aria-label="Lernangebote durchsuchen" onKeyDown={(event) => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll("input,button")];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}><div className="palette-input"><span>⌕</span><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} onKeyDown={(event) => {
    if (event.nativeEvent.isComposing) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key) && results.length) {
      event.preventDefault();
      const next = (selected + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      setSelected(next);
      document.getElementById(`search-result-${next}`)?.scrollIntoView?.({ block: "nearest" });
    }
    if (event.key === "Enter" && results.length) { event.preventDefault(); onOpen(results[selected]); }
  }} aria-label="Lernangebote durchsuchen" role="combobox" aria-expanded="true" aria-controls="search-results" aria-activedescendant={results.length ? `search-result-${selected}` : undefined} placeholder="Wonach möchtest du lernen?" /><button aria-label="Suche schließen" onClick={onClose}>Esc</button></div><p className="palette-count">{results.length} Ergebnisse · ↑ ↓ auswählen · Enter öffnen</p><div className="palette-results" id="search-results" role="listbox">{results.map((item, index) => <button role="option" aria-selected={selected === index} id={`search-result-${index}`} className={selected === index ? "selected" : ""} key={item.slug} onClick={() => onOpen(item)}><span className={`result-symbol ${item.accent}`}>{item.kind === "lab" ? "↗" : "L"}</span><span><strong>{item.title}</strong><small>{item.course} · {item.topic}</small></span><span className="result-arrow">→</span></button>)}</div>{!results.length && <p className="no-results">Keine passenden Lernangebote gefunden.</p>}</section></div>;
}

class TrainerErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(previous) { if (previous.item?.slug !== this.props.item?.slug && this.state.error) this.setState({ error: null }); }
  render() { return this.state.error ? <div className="trainer-error"><strong>Dieser Trainer konnte nicht geladen werden.</strong><p>Dein gespeicherter Lernstand bleibt erhalten.</p><button className="primary-button" onClick={() => window.location.reload()}>Erneut laden</button><details><summary>Technische Details</summary>{String(this.state.error.message || this.state.error)}</details></div> : this.props.children; }
}

function TrainerView({ item, pinned, onBack, backLabel, onPin, onSearch, onOverview, learningControl, learningSession, learningProgress, onStartRound, onRoundChange, onLearningResult, onOpenUnit }) {
  if (!item) return <div className="not-found"><span className="brand-mark">L</span><h1>Lernangebot nicht gefunden</h1><button className="primary-button" onClick={onBack}>Zur Startseite</button></div>;
  const Trainer = getTrainer(item);
  return <div className="trainer-stage"><header className="trainer-bar"><button className="back-button" aria-label={backLabel === "Start" ? "Zur Startseite" : `Zur ${backLabel}`} onClick={onBack}>← <span>{backLabel}</span></button><div className="trainer-identity"><span>{item.course} · {item.topic}</span><strong>{item.title}</strong></div><button className="trainer-tool" aria-label="Lernübersicht öffnen" onClick={onOverview}>◉</button><button className="trainer-tool" aria-label="Suchen" onClick={onSearch}>⌕</button><button className={`pin-button large${pinned ? " pinned" : ""}`} aria-pressed={pinned} aria-label={pinned ? "Anheftung lösen" : "Trainer anheften"} onClick={onPin}>{pinned ? "◆" : "◇"}</button></header>{learningProgress.warning && <p className="trainer-storage-warning" role="status">{learningProgress.warning}</p>}<div className="trainer-content">{item.kind === "lab" ? <><p className="lab-context">Lernlabor · Erkundung und eigenes Üben. Diese Ansicht erzeugt keinen automatisch geprüften Abschluss.</p><iframe className="lab-frame" title={item.title} src={item.url} /></> : <TrainerErrorBoundary item={item}><Suspense fallback={<div className="trainer-loading"><span /><p>{item.title} wird geladen …</p></div>}>{Trainer ? <Trainer key={`${item.slug}:${new URLSearchParams(window.location.search).get("einheit") || ""}`} item={item} learningControl={learningControl} learningSession={learningSession} learningProgress={learningProgress} onStartRound={onStartRound} onRoundChange={onRoundChange} onLearningResult={onLearningResult} onOpenUnit={onOpenUnit} /> : <div className="trainer-error">Trainer-Modul fehlt.</div>}</Suspense></TrainerErrorBoundary>}</div></div>;
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(item);
    return groups;
  }, new Map());
}
