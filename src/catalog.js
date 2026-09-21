const reactItem = (slug, title, course, topic, goal, duration, source, accent) => ({
  slug,
  title,
  course,
  topic,
  goal,
  duration,
  source,
  accent,
  kind: "trainer",
});

const labItem = (slug, title, course, topic, goal, duration, url, accent) => ({
  slug,
  title,
  course,
  topic,
  goal,
  duration,
  url,
  accent,
  kind: "lab",
});

const catalog = [
  reactItem("analysis-klausur", "Analysis-Klausurtraining", "Analysis", "Prüfungsvorbereitung", "Aufgabentypen erkennen, Lösungswege üben und Klausurstrategien festigen.", "45–90 Min.", "./trainers/Analysis/AnalysisKlausurtrainer.jsx", "violet"),
  reactItem("boolesche-vereinfachung", "Boolesche Ausdrücke vereinfachen", "Digitaltechnik", "Schaltnetze", "Boolesche Gesetze verstehen und Ausdrücke sicher vereinfachen.", "25 Min.", "./trainers/Digitaltechnik/BoolescheVereinfachung.jsx", "amber"),
  reactItem("flipflops", "Flipflops & Zustandsautomaten", "Digitaltechnik", "Sequenzielle Logik", "Speicherelemente, Taktflanken und Zustandsübergänge interaktiv untersuchen.", "35 Min.", "./trainers/Digitaltechnik/FlipFlops.jsx", "amber"),
  reactItem("kv-diagramm", "KV-Diagramme", "Digitaltechnik", "Schaltnetze", "Karnaugh-Veitch-Diagramme ausfüllen und minimale Formen ablesen.", "30 Min.", "./trainers/Digitaltechnik/KVDiagramm.jsx", "amber"),
  reactItem("sequenzielle-elemente", "Sequenzielle Schaltungen", "Digitaltechnik", "Sequenzielle Logik", "Register, Schieberegister und Datenpfade Schritt für Schritt verstehen.", "30 Min.", "./trainers/Digitaltechnik/SequenzielleElemente.jsx", "amber"),
  reactItem("dea-wortlauf", "DEA-Wortlauf verstehen", "Formale Sprachen & Automaten", "Endliche Automaten", "Wörter Zeichen für Zeichen durch einen deterministischen Automaten verfolgen.", "20 Min.", "./trainers/Formale Sprachen & Automaten/Endliche Automaten/wortlauf_lerntrainer.jsx", "mint"),
  reactItem("pipeline-orchestrierung", "Pipeline-Orchestrierung", "T1000", "Datenverarbeitung", "Aufbau, Laufzeit und Fehlersicherheit einer mehrstufigen Pipeline verstehen.", "40 Min.", "./trainers/T1000/PipelineOrchestrationTrainer.jsx", "cyan"),
  reactItem("cinema-architektur", "Cinema-Projektarchitektur", "Java", "Cinema Practice", "Klassen, Verantwortlichkeiten und Abläufe des Cinema-Projekts verbinden.", "35 Min.", "./trainers/Java/cinema_practise/ProjektArchitekturTrainer.jsx", "orange"),
  reactItem("mastermind-konzepte", "Java-Konzepte in Mastermind", "Java", "Mastermind", "Zentrale Java-Konzepte am Mastermind-Projekt wiederholen.", "30 Min.", "./trainers/Java/pruefung_mastermind/JavaKonzepteTrainer.jsx", "orange"),
  reactItem("mastermind-architektur", "Mastermind-Projektarchitektur", "Java", "Mastermind", "Schichten, Klassen und Abhängigkeiten des Projekts einordnen.", "30 Min.", "./trainers/Java/pruefung_mastermind/ProjektArchitekturTrainer.jsx", "orange"),
  reactItem("mastermind-spielablauf", "Mastermind-Spielablauf", "Java", "Mastermind", "Programmlogik und Zustandswechsel entlang einer vollständigen Partie nachvollziehen.", "25 Min.", "./trainers/Java/pruefung_mastermind/SpielablaufTrainer.jsx", "orange"),
  reactItem("counting-sort", "Counting Sort", "Theoretische Informatik", "Sortieralgorithmen", "Zählverfahren animiert durchlaufen und seine Voraussetzungen verstehen.", "15 Min.", "./trainers/Theoretische Informatik/Sortier-Algos/CountingSortTrainer.jsx", "blue"),
  reactItem("merge-sort", "Merge Sort", "Theoretische Informatik", "Sortieralgorithmen", "Teilen und Zusammenführen Schritt für Schritt nachvollziehen.", "20 Min.", "./trainers/Theoretische Informatik/Sortier-Algos/MergeSortTrainer.jsx", "blue"),
  reactItem("quick-sort", "Quick Sort", "Theoretische Informatik", "Sortieralgorithmen", "Pivotwahl und Partitionierung an konkreten Folgen beobachten.", "20 Min.", "./trainers/Theoretische Informatik/Sortier-Algos/QuickSortTrainer.jsx", "blue"),
  reactItem("radix-sort", "Radix Sort", "Theoretische Informatik", "Sortieralgorithmen", "Stellenweises Sortieren und Buckets visuell verstehen.", "15 Min.", "./trainers/Theoretische Informatik/Sortier-Algos/RadixSortTrainer.jsx", "blue"),
  reactItem("probeklausur-teil-2", "Probeklausur · Teil 2", "Theoretische Informatik", "Probeklausuren", "Prüfungsaufgaben unter realistischen Bedingungen bearbeiten.", "60 Min.", "./trainers/Theoretische Informatik/Probeklausuren/ProbeklausurTeil2.jsx", "rose"),
  reactItem("hashmaps-verstehen", "Hashmaps verstehen", "Theoretische Informatik", "Hashing", "Hashfunktionen, Kollisionen und Tabellenaufbau anschaulich untersuchen.", "25 Min.", "./trainers/Theoretische Informatik/Hashing/HashmapErklaerer.jsx", "green"),
  reactItem("uebung-07", "Übung 07 · Hashing & Suchstrukturen", "Theoretische Informatik", "Hashing", "Aufgaben zu Hashing, Suchbäumen und binärer Suche nachvollziehen.", "45 Min.", "./trainers/Theoretische Informatik/Hashing/Uebung07.jsx", "green"),
  reactItem("hashing-uebersicht", "Hashing im Überblick", "Theoretische Informatik", "Hashing", "Verfahren und Eigenschaften kompakt vergleichen.", "15 Min.", "./trainers/Theoretische Informatik/Hashing/vl11_hashing_uebersicht.jsx", "green"),
  reactItem("dfs-trainer", "Tiefensuche trainieren", "Theoretische Informatik", "Graphalgorithmen", "Depth-First Search interaktiv ausführen und Reihenfolgen prüfen.", "25 Min.", "./trainers/Theoretische Informatik/Graph-algorithmen/DFSTrainer.jsx", "indigo"),
  reactItem("uebung-08", "Übung 08 · Graphalgorithmen", "Theoretische Informatik", "Graphalgorithmen", "Prüfungsnahe Aufgaben zu Graphen und Traversierung lösen.", "45 Min.", "./trainers/Theoretische Informatik/Graph-algorithmen/Uebung08.jsx", "indigo"),
  reactItem("bfs", "Breitensuche", "Theoretische Informatik", "Graphalgorithmen", "BFS, Warteschlange und Schichtstruktur visuell nachvollziehen.", "25 Min.", "./trainers/Theoretische Informatik/Graph-algorithmen/vl13_graphen_BFS.jsx", "indigo"),
  reactItem("dijkstra", "Dijkstra-Algorithmus", "Theoretische Informatik", "Graphalgorithmen", "Kürzeste Wege und die Greedy-Entscheidung Schritt für Schritt verstehen.", "30 Min.", "./trainers/Theoretische Informatik/Graph-algorithmen/vl14_dijkstra.jsx", "indigo"),
  reactItem("tiefensuche", "Tiefensuche & topologisches Sortieren", "Theoretische Informatik", "Graphalgorithmen", "DFS-Zeiten, Klammerstruktur und topologische Ordnung verbinden.", "30 Min.", "./trainers/Theoretische Informatik/Graph-algorithmen/vl15_tiefensuche.jsx", "indigo"),
  reactItem("app-js-level-quest", "App.js Level Quest", "Web Engineering 2", "Frontend & API", "Frontend-Logik, Requests und Authentifizierung als Quest wiederholen.", "40 Min.", "./trainers/Web-Eng2/ai-prompt-library/AppJs_Level_Quest.jsx", "purple"),
  reactItem("frontend-javascript", "Frontend-JavaScript verstehen", "Web Engineering 2", "Frontend & API", "Vom Event bis zur Serverantwort den vollständigen Datenfluss verfolgen.", "35 Min.", "./trainers/Web-Eng2/ai-prompt-library/Frontend_JavaScript_verstehen.jsx", "purple"),
  reactItem("web-lernreise", "Webprojekt-Lernreise", "Web Engineering 2", "Projektverständnis", "Die Architektur eines Webprojekts in einer geführten Reihenfolge erschließen.", "35 Min.", "./trainers/Web-Eng2/ai-prompt-library/LernpfadErklaerer.jsx", "purple"),
  reactItem("web-projektarchitektur", "Webprojekt-Architektur", "Web Engineering 2", "Projektverständnis", "Frontend, Backend und Datenwege des Projekts zusammenführen.", "30 Min.", "./trainers/Web-Eng2/ai-prompt-library/ProjektArchitekturTrainer.jsx", "purple"),
  reactItem("entscheidungs-dashboard", "Entscheidungen mit KI vorbereiten", "AI Business", "Entscheidungen", "Entscheidungsqualität, Unsicherheit und Wirkung strukturiert betrachten.", "20 Min.", "./components/Archiv/AI business/decision.jsx", "coral"),
  reactItem("business-systeme", "Business-Systeme & Integration", "Enterprise Architecture", "Systemintegration", "Spaghetti-Architektur, Pipelines und ESB visuell vergleichen.", "30 Min.", "./components/Archiv/Watch later/business-systems.jsx", "teal"),
  labItem("cyk-verstehen", "CYK verstehen", "Formale Sprachen & Automaten", "Kontextfreie Sprachen", "Den CYK-Algorithmus vom Zeichen bis zum ganzen Wort anwenden.", "35 Min.", "/cyk/", "mint"),
  labItem("compiler-parser", "Compiler & Parser verstehen", "Compilerbau", "Parsing", "Die Compiler-Pipeline und die Rolle des Parsers als zusammenhängende Reise verstehen.", "35 Min.", "/compiler-parser/", "cyan"),
  labItem("cyk-ableitung", "CYK-Ableitung visuell", "Formale Sprachen & Automaten", "Kontextfreie Sprachen", "Ableitungen und Tabellenzellen des CYK-Verfahrens visuell verbinden.", "20 Min.", "/labs/cyk-ableitung-visuell/", "mint"),
  labItem("fsa-cheatsheet", "FSA-Cheatsheet", "Formale Sprachen & Automaten", "Prüfungsvorbereitung", "Zentrale Definitionen und Verfahren kompakt wiederholen.", "10 Min.", "/labs/fsa-cheatsheet/", "mint"),
  labItem("fsa-lernreise", "FSA-Lernreise", "Formale Sprachen & Automaten", "Gesamtüberblick", "Themen der Vorlesung in einer zusammenhängenden Lernreise ordnen.", "45 Min.", "/labs/fsa-lernreise/", "mint"),
  labItem("fsa-grundlagen-pruefung", "FSA-Grundlagenprüfung", "Formale Sprachen & Automaten", "Selbsttest", "Grundbegriffe und Basiskonzepte prüfungsnah abrufen.", "20 Min.", "/labs/grundlagen-pruefung/", "rose"),
  labItem("regulaere-ausdruecke-pruefung", "Reguläre Ausdrücke · Prüfung", "Formale Sprachen & Automaten", "Reguläre Sprachen", "Reguläre Ausdrücke unter Prüfungsbedingungen anwenden.", "25 Min.", "/labs/regulaere-ausdruecke-pruefung/", "rose"),
];

const normalize = (value) =>
  value
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function getLearningCatalog() {
  return catalog.map((item) => ({ ...item }));
}

export function findLearningItemBySlug(slug) {
  return catalog.find((item) => item.slug === slug) ?? null;
}

export function searchLearningCatalog(query, items = catalog) {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return [...items];

  return items.filter((item) => {
    const haystack = normalize(
      [item.title, item.course, item.topic, item.goal].join(" ")
    );
    return terms.every((term) => haystack.includes(term));
  });
}
