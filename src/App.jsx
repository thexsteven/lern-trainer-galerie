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
import "./app.css";

const modules = import.meta.glob([
  "./trainers/**/*.jsx",
  "./components/Archiv/**/*.jsx",
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
  const match = pathname.match(/^\/trainer\/([^/]+)\/?$/);
  if (match) return { name: "trainer", slug: decodeURIComponent(match[1]) };
  return { name: "home" };
}

function useRoute() {
  const [route, setRoute] = useState(() => routeFromPath(window.location.href));
  useEffect(() => {
    const onPopState = () => setRoute(routeFromPath(window.location.href));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setRoute(routeFromPath(path));
    window.scrollTo?.({ top: 0, behavior: "instant" });
  };
  return [route, navigate];
}

function usePersonalState(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export default function App({ storage = window.localStorage }) {
  const catalog = useMemo(getLearningCatalog, []);
  const store = useMemo(() => createPersonalStore(storage), [storage]);
  const personal = usePersonalState(store);
  const [route, navigate] = useRoute();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigationRequest, setNavigationRequest] = useState(null);
  const [archivedUndo, setArchivedUndo] = useState(null);
  const editorDirtyRef = useRef(false);
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

  const openItem = (item) => {
    store.recordOpen(item.slug);
    if (item.kind === "lab") {
      window.location.assign(item.url);
      return;
    }
    requestNavigation(`/trainer/${item.slug}`);
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

  if (route.name === "trainer") {
    const item = findLearningItemBySlug(route.slug);
    return (
      <TrainerView
        item={item}
        pinned={personal.pins.includes(route.slug)}
        onBack={() => requestNavigation("/")}
        onPin={() => item && store.togglePin(item.slug)}
      />
    );
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
        />
        <div className="app-main">
          <MobileHeader onSearch={openSearch} />
          <main>
            {route.name === "home" && (
              <HomePage
                catalog={catalog}
                personal={personal}
                navigate={requestNavigation}
                openItem={openItem}
                togglePin={store.togglePin}
              />
            )}
            {route.name === "library" && (
              <LibraryPage
                catalog={catalog}
                pins={personal.pins}
                openItem={openItem}
                togglePin={store.togglePin}
              />
            )}
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

function Sidebar({ route, navigate, onSearch, collapsed, onToggleCollapsed }) {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} aria-label="Hauptnavigation">
      <button className="brand" aria-label="Zur Startseite" title={collapsed ? "Start" : undefined} onClick={() => navigate("/")}>
        <span className="brand-mark">L</span>
        <span className="brand-copy"><strong>Lern·Trainer</strong><small>Dein Study Space</small></span>
      </button>
      <nav>
        <NavButton active={route.name === "home"} label="Start" icon="⌂" title={collapsed ? "Start" : undefined} onClick={() => navigate("/")} />
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
        <span>Lokal gespeichert<br /><small>Synchronisierung später</small></span>
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
    <NavButton active={route.name === "library"} label="Bibliothek" icon="▦" onClick={() => navigate("/bibliothek")} />
    <NavButton active={route.name === "exams"} label="Prüfungen" icon="◇" onClick={() => navigate("/pruefungen")} />
    <NavButton active={route.name === "archive"} label="Archiv" icon="▤" onClick={() => navigate("/archiv")} />
  </nav>;
}

function HomePage({ catalog, personal, navigate, openItem, togglePin }) {
  const nextExam = personal.exams
    .filter((exam) => !exam.archivedAt && new Date(`${exam.date}T23:59:59`) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const quickSlugs = [...personal.pins, ...personal.recents]
    .filter((slug, index, all) => all.indexOf(slug) === index)
    .slice(0, 3);
  const quickItems = quickSlugs.map(findLearningItemBySlug).filter(Boolean);

  return <div className="page home-page">
    <section className="hero-panel">
      <div>
        <p className="eyebrow">DEIN STUDIUM · KLAR SORTIERT</p>
        <h1>Bereit für die<br /><span>nächste Prüfung.</span></h1>
        <p className="hero-copy">Finde deinen nächsten Fokus, steige wieder ein oder öffne direkt einen deiner Lern-Trainer.</p>
      </div>
      <ExamSummary exam={nextExam} catalog={catalog} navigate={navigate} openItem={openItem} />
    </section>

    <SectionHeader eyebrow="DEIN NÄCHSTER SCHRITT" title="Weiterlernen" action="Prüfungen verwalten" onAction={() => navigate("/pruefungen")} />
    {quickItems.length ? (
      <div className="card-grid quick-grid">{quickItems.map((item) => <LearningCard key={item.slug} item={item} pinned={personal.pins.includes(item.slug)} onOpen={openItem} onPin={togglePin} />)}</div>
    ) : (
      <div className="empty-card"><div className="empty-icon">◇</div><div><strong>Noch nichts angeheftet</strong><p>Öffne einen Trainer oder hefte ihn an. Er erscheint dann hier für den schnellen Wiedereinstieg.</p></div></div>
    )}

    <SectionHeader eyebrow="ALLE INHALTE" title="Deine Lernbibliothek" action="Bibliothek öffnen" onAction={() => navigate("/bibliothek")} />
    <CatalogSections catalog={catalog} pins={personal.pins} onOpen={openItem} onPin={togglePin} />
  </div>;
}

function ExamSummary({ exam, catalog, navigate, openItem }) {
  if (!exam) return <aside className="exam-summary empty"><span className="exam-label">NÄCHSTE PRÜFUNG</span><strong>Noch kein Termin</strong><p>Lege eine Prüfung an und stelle deine Fokusliste zusammen.</p><button className="primary-button" onClick={() => navigate("/pruefungen?neu=1")}>Prüfung anlegen</button></aside>;
  const distance = dateDistance(exam.date);
  const focus = exam.itemSlugs.map(findLearningItemBySlug).find(Boolean);
  return <aside className="exam-summary"><span className="exam-label">NÄCHSTE PRÜFUNG</span><div className="countdown"><strong>{distance.short}</strong><span>{distance.suffix}</span></div><h2>{exam.title}</h2><p>{formatExamDate(exam.date)}</p>{focus && <button className="primary-button" onClick={() => openItem(focus)}>Jetzt {focus.title} lernen</button>}</aside>;
}

function SectionHeader({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{action && <button className="text-button" onClick={onAction}>{action} <span>→</span></button>}</div>;
}

function CatalogSections({ catalog, pins, onOpen, onPin }) {
  const courses = groupBy(catalog, "course");
  return <div className="catalog-sections">{[...courses.entries()].map(([course, items]) => <section className="course-section" key={course}><div className="course-title"><h3>{course}</h3><span>{items.length} {items.length === 1 ? "Lernangebot" : "Lernangebote"}</span></div><div className="card-grid">{items.map((item) => <LearningCard key={item.slug} item={item} pinned={pins.includes(item.slug)} onOpen={onOpen} onPin={onPin} />)}</div></section>)}</div>;
}

function LearningCard({ item, pinned, onOpen, onPin }) {
  return <article className="learning-card">
    <button className="cover-button" onClick={() => onOpen(item)} aria-label={`${item.title} öffnen`}>
      <CoverArt item={item} />
    </button>
    <div className="card-body">
      <div className="card-meta"><span>{item.topic}</span><span>{item.duration}</span></div>
      <button className="card-title" onClick={() => onOpen(item)}>{item.title}</button>
      <p>{item.goal}</p>
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
  return <div className="cover-art" style={{ "--cover-dark": dark, "--cover-light": light }} aria-hidden="true">
    <svg viewBox="0 0 360 210" focusable="false">
      <defs><linearGradient id={`g-${item.slug}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={dark}/><stop offset="1" stopColor={light}/></linearGradient></defs>
      <rect width="360" height="210" rx="24" fill={`url(#g-${item.slug})`} />
      {mode === 0 && <><circle cx="260" cy="38" r="88" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="18"/><circle cx="284" cy="148" r="54" fill="rgba(255,255,255,.18)"/><path d="M40 160 L140 60 L210 130" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/></>}
      {mode === 1 && <><path d="M-20 170 C70 80 115 235 210 115 S330 20 390 70" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="12"/><path d="M-20 195 C75 105 130 260 225 140 S330 50 390 95" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="24"/><circle cx="92" cy="62" r="22" fill="white"/></>}
      {mode === 2 && <><g fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.8)" strokeWidth="5"><rect x="42" y="42" width="72" height="72" rx="18"/><rect x="144" y="70" width="72" height="72" rx="18"/><rect x="246" y="98" width="72" height="72" rx="18"/></g><path d="M114 78 H144 M216 106 H246" stroke="white" strokeWidth="6" strokeLinecap="round"/></>}
      <text x="28" y="188" fill="rgba(255,255,255,.88)" fontSize="12" fontWeight="700" letterSpacing="1.5">{item.course.toUpperCase().slice(0, 34)}</text>
    </svg>
  </div>;
}

function LibraryPage({ catalog, pins, openItem, togglePin }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("Alle Kurse");
  const courses = [...new Set(catalog.map((item) => item.course))];
  const visible = searchLearningCatalog(query, catalog).filter((item) => course === "Alle Kurse" || item.course === course);
  return <div className="page"><PageIntro eyebrow="BIBLIOTHEK" title="Alle Lernangebote" copy="Durchsuche alle Trainer, Lernlabore und Prüfungsmodule an einem Ort." />
    <div className="filter-bar"><label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thema, Kurs oder Lernziel" aria-label="Bibliothek durchsuchen" /></label><select value={course} onChange={(event) => setCourse(event.target.value)} aria-label="Kurs filtern"><option>Alle Kurse</option>{courses.map((name) => <option key={name}>{name}</option>)}</select><span className="result-count">{visible.length} Ergebnisse</span></div>
    {visible.length ? <CatalogSections catalog={visible} pins={pins} onOpen={openItem} onPin={togglePin} /> : <div className="empty-card"><strong>Keine passenden Lernangebote</strong><p>Versuche einen anderen Begriff oder entferne den Kursfilter.</p></div>}
  </div>;
}

function ExamsPage({ catalog, exams, startEditing, saveExam, archiveExam, openItem, onDirtyChange, onCreated }) {
  const [editingId, setEditingId] = useState(startEditing ? "new" : null);
  const [dirty, setDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
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
  });
  const closeEditor = () => {
    setEditingId(null);
    setDirty(false);
  };
  const save = (exam) => {
    const created = editingId === "new";
    saveExam(exam);
    closeEditor();
    if (created) onCreated();
  };
  const archive = (exam) => runOrConfirm(() => {
    closeEditor();
    archiveExam(exam);
  });

  return <div className="page"><div className="page-title-row"><PageIntro eyebrow="PRÜFUNGSMODUS" title="Deine Prüfungen" copy="Termine, Fokuslisten und der nächste sinnvolle Einstieg – ohne künstliche Prozentwerte." /><button className="primary-button" onClick={() => beginEditing("new")}>Prüfung anlegen</button></div>
    {editingId === "new" && <ExamForm catalog={catalog} onCancel={closeEditor} onSave={save} onDirtyChange={setDirty} />}
    {!activeExams.length && editingId !== "new" && <div className="empty-card large"><div className="empty-icon">◇</div><div><strong>Plane deine nächste Prüfung</strong><p>Lege Datum und Fokus-Trainer fest. Die App zeigt dir anschließend den direkten Einstieg.</p><button className="text-button" onClick={() => beginEditing("new")}>Erste Prüfung anlegen →</button></div></div>}
    {!!upcoming.length && <ExamSection title="Anstehend" exams={upcoming} editingId={editingId} catalog={catalog} onEdit={beginEditing} onCancel={closeEditor} onSave={save} onDirtyChange={setDirty} onArchive={archive} onOpen={openItem} />}
    {!!past.length && <ExamSection title="Vergangen" exams={past} editingId={editingId} catalog={catalog} onEdit={beginEditing} onCancel={closeEditor} onSave={save} onDirtyChange={setDirty} onArchive={archive} onOpen={openItem} />}
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
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);
  const results = searchLearningCatalog(query, catalog).slice(0, 10);
  return <div className="search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="search-palette" role="dialog" aria-modal="true" aria-label="Lernangebote durchsuchen"><div className="palette-input"><span>⌕</span><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && results.length) { event.preventDefault(); onOpen(results[0]); } }} aria-label="Lernangebote durchsuchen" placeholder="Wonach möchtest du lernen?" /><button aria-label="Suche schließen" onClick={onClose}>Esc</button></div><div className="palette-results">{results.map((item) => <button key={item.slug} onClick={() => onOpen(item)}><span className={`result-symbol ${item.accent}`}>{item.kind === "lab" ? "↗" : "L"}</span><span><strong>{item.title}</strong><small>{item.course} · {item.topic}</small></span><span className="result-arrow">→</span></button>)}</div>{!results.length && <p className="no-results">Keine passenden Lernangebote gefunden.</p>}</section></div>;
}

class TrainerErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(previous) { if (previous.item?.slug !== this.props.item?.slug && this.state.error) this.setState({ error: null }); }
  render() { return this.state.error ? <div className="trainer-error"><strong>Dieser Trainer konnte nicht geladen werden.</strong><p>{String(this.state.error.message || this.state.error)}</p></div> : this.props.children; }
}

function TrainerView({ item, pinned, onBack, onPin }) {
  if (!item) return <div className="not-found"><span className="brand-mark">L</span><h1>Lernangebot nicht gefunden</h1><button className="primary-button" onClick={onBack}>Zur Startseite</button></div>;
  const Trainer = getTrainer(item);
  return <div className="trainer-stage"><header className="trainer-bar"><button className="back-button" aria-label="Zur Startseite" onClick={onBack}>← <span>Start</span></button><div className="trainer-identity"><span>{item.course} · {item.topic}</span><strong>{item.title}</strong></div><button className={`pin-button large${pinned ? " pinned" : ""}`} aria-pressed={pinned} aria-label={pinned ? "Anheftung lösen" : "Trainer anheften"} onClick={onPin}>{pinned ? "◆" : "◇"}</button></header><div className="trainer-content"><TrainerErrorBoundary item={item}><Suspense fallback={<div className="trainer-loading"><span /><p>{item.title} wird geladen …</p></div>}>{Trainer ? <Trainer /> : <div className="trainer-error">Trainer-Modul fehlt.</div>}</Suspense></TrainerErrorBoundary></div></div>;
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(item);
    return groups;
  }, new Map());
}
