export const topics = [
  { id: "grundlagen", label: "Grundlagen" },
  { id: "relationen", label: "Relationen" },
  { id: "sql", label: "SQL" },
  { id: "modellierung", label: "Modellierung" },
  { id: "normalisierung", label: "Normalisierung" },
  { id: "constraints", label: "Constraints" },
  { id: "transaktionen", label: "Transaktionen" },
  { id: "performance", label: "Performance" },
  { id: "concurrency", label: "Concurrency" },
  { id: "datenbanktypen", label: "Datenbanktypen" },
  { id: "backend", label: "Backend-Praxis" },
];

export const difficulties = {
  basic: "Grundlagen",
  study: "Studium",
  practice: "Praxis",
};

export const flashcards = [
  ["db-card-001", "grundlagen", "basic", "Was ist eine Datenbank?", "Eine strukturierte, dauerhaft gespeicherte Sammlung zusammengehöriger Daten, die gezielt abgefragt und verändert werden kann."],
  ["db-card-002", "grundlagen", "basic", "Welche Aufgabe hat ein DBMS?", "Ein Datenbankmanagementsystem verwaltet Speicherung, Abfragen, Zugriffe, Konsistenz und gleichzeitige Änderungen an einer Datenbank."],
  ["db-card-003", "grundlagen", "basic", "Was unterscheidet Zeile und Spalte?", "Eine Zeile repräsentiert einen Datensatz; eine Spalte beschreibt ein Attribut mit einem festgelegten Datentyp."],
  ["db-card-004", "grundlagen", "basic", "Was ist ein Primary Key?", "Ein Primärschlüssel identifiziert jede Tabellenzeile eindeutig und darf weder doppelt noch NULL sein."],
  ["db-card-005", "relationen", "basic", "Was ist ein Foreign Key?", "Ein Fremdschlüssel verweist auf einen eindeutigen Schlüssel einer anderen oder derselben Tabelle und sichert Beziehungen ab."],
  ["db-card-006", "relationen", "basic", "Wie wird eine n:m-Beziehung relational abgebildet?", "Durch eine Junction Table mit Fremdschlüsseln auf beide beteiligten Tabellen; deren Kombination ist oft der Primärschlüssel."],
  ["db-card-007", "modellierung", "study", "Was zeigt die Kardinalität in einem ER-Modell?", "Sie beschreibt, wie viele Instanzen einer Entität mit Instanzen einer anderen Entität verbunden sein dürfen oder müssen."],
  ["db-card-008", "normalisierung", "study", "Was fordert die 1NF?", "Jedes Attribut enthält atomare Werte; es gibt keine Listen, Wiederholungsgruppen oder mehrfach belegten Zellen."],
  ["db-card-009", "normalisierung", "study", "Was beseitigt die 2NF?", "Partielle Abhängigkeiten: Jedes Nichtschlüsselattribut muss vom gesamten zusammengesetzten Schlüssel abhängen."],
  ["db-card-010", "normalisierung", "study", "Was beseitigt die 3NF?", "Transitive Abhängigkeiten von Nichtschlüsselattributen über andere Nichtschlüsselattribute."],
  ["db-card-011", "transaktionen", "study", "Wofür steht ACID?", "Atomicity, Consistency, Isolation und Durability: unteilbare, konsistente, isolierte und dauerhaft gespeicherte Transaktionen."],
  ["db-card-012", "performance", "practice", "Was ist ein B-Tree-Index?", "Eine balancierte Baumstruktur, die Suche, Bereichsabfragen und sortierte Zugriffe typischerweise logarithmisch beschleunigt."],
  ["db-card-013", "concurrency", "study", "Was ist ein Dirty Read?", "Eine Transaktion liest unbestätigte Änderungen einer anderen, die noch zurückgerollt werden könnten."],
  ["db-card-014", "datenbanktypen", "practice", "Wann passt Redis besser als PostgreSQL?", "Bei sehr schnellen, flüchtigen Key-Value-Zugriffen wie Caches, Sessions oder Countern; nicht als pauschaler Ersatz für relationale Persistenz."],
  ["db-card-015", "backend", "practice", "Was bewirkt Row Level Security?", "RLS erzwingt Zugriffsregeln pro Tabellenzeile direkt in PostgreSQL, etwa damit Nutzer nur eigene Projekte lesen dürfen."],
  ["db-card-016", "datenbanktypen", "practice", "Wie unterscheiden sich PostgreSQL und MySQL grob?", "Beide sind relationale Open-Source-DBMS. PostgreSQL ist besonders erweiterbar und SQL-funktionsreich; MySQL ist weit verbreitet und häufig Teil klassischer Web-Stacks. Die konkrete Wahl hängt vom System ab."],
  ["db-card-017", "concurrency", "study", "Wozu dienen Datenbanksperren?", "Locks koordinieren konkurrierende Zugriffe auf Zeilen oder Tabellen, damit unvereinbare Änderungen nicht gleichzeitig stattfinden."],
  ["db-card-018", "concurrency", "study", "Was steuern Isolation Levels?", "Sie bestimmen, welche Effekte paralleler Transaktionen sichtbar sein dürfen. Höhere Isolation verhindert mehr Anomalien, kann aber Parallelität kosten."],
  ["db-card-019", "constraints", "basic", "Was erzwingt NOT NULL?", "Die Spalte muss für jede Zeile einen Wert besitzen; fachlich ungültige fehlende Angaben werden direkt von der Datenbank abgewiesen."],
  ["db-card-020", "relationen", "study", "Was bedeutet relationale Integrität?", "Schlüssel und Constraints sorgen dafür, dass Beziehungen gültig bleiben, etwa dass ein Fremdschlüssel nur auf einen existierenden Datensatz verweist."],
  ["db-card-021", "backend", "practice", "Wie arbeiten Supabase Auth, API und RLS zusammen?", "Auth liefert die Identität, die automatisch erzeugte API transportiert Anfragen und RLS entscheidet in PostgreSQL, auf welche Zeilen diese Identität zugreifen darf."],
].map(([id, topic, difficulty, question, answer]) => ({ id, topic, difficulty, question, answer }));

export const multipleChoice = [
  ["db-mc-001", "relationen", "basic", "Welche Beziehung besteht typischerweise zwischen einem Kunden und seinen Bestellungen?", ["1:1", "1:n", "n:m", "keine"], 1, "Ein Kunde kann viele Bestellungen besitzen; jede Bestellung gehört in diesem Modell genau einem Kunden."],
  ["db-mc-002", "grundlagen", "basic", "Welcher Datentyp eignet sich am besten für einen Geldbetrag?", ["FLOAT", "BOOLEAN", "DECIMAL(10,2)", "VARCHAR"], 2, "DECIMAL speichert feste Dezimalstellen exakt; binäre Gleitkommazahlen können Rundungsfehler erzeugen."],
  ["db-mc-003", "constraints", "basic", "Welcher Constraint verhindert doppelte E-Mail-Adressen?", ["CHECK", "UNIQUE", "DEFAULT", "FOREIGN KEY"], 1, "UNIQUE erzwingt eindeutige Werte; der Umgang mit NULL hängt vom DBMS ab."],
  ["db-mc-004", "sql", "basic", "Welche Klausel filtert Zeilen vor einer Gruppierung?", ["HAVING", "ORDER BY", "WHERE", "GROUP BY"], 2, "WHERE filtert einzelne Zeilen; HAVING filtert erst die gebildeten Gruppen."],
  ["db-mc-005", "sql", "study", "Welcher JOIN behält alle Zeilen der linken Tabelle?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], 1, "Ein LEFT JOIN ergänzt nicht passende rechte Werte mit NULL."],
  ["db-mc-006", "normalisierung", "study", "Welche Anomalie entsteht, wenn eine Firmenadresse in jeder Mitarbeiterzeile gespeichert wird?", ["Leseanomalie", "Update-Anomalie", "Deadlock", "Phantom Read"], 1, "Eine Adressänderung muss in vielen Zeilen konsistent durchgeführt werden."],
  ["db-mc-007", "transaktionen", "basic", "Welcher Befehl macht Änderungen einer Transaktion dauerhaft?", ["BEGIN", "COMMIT", "ROLLBACK", "EXPLAIN"], 1, "COMMIT bestätigt die Transaktion; ROLLBACK verwirft sie."],
  ["db-mc-008", "concurrency", "study", "Welches Phänomen sind neue Zeilen, die bei derselben Bereichsabfrage später auftauchen?", ["Dirty Read", "Lost Update", "Phantom Read", "Non-repeatable Read"], 2, "Phantome sind hinzugekommene oder verschwundene Zeilen, die das Prädikat einer wiederholten Bereichsabfrage erfüllen."],
  ["db-mc-009", "performance", "practice", "Was zeigt EXPLAIN primär?", ["Gespeicherte Daten", "Den geplanten Ausführungsweg", "Alle Constraints", "Das Backup-Protokoll"], 1, "Der Query Plan zeigt etwa Scans, Joins, geschätzte Zeilen und Kosten."],
  ["db-mc-010", "performance", "practice", "Warum sind viele Indizes auf einer häufig beschriebenen Tabelle problematisch?", ["SELECT wird verboten", "Jeder Schreibvorgang muss Indizes mitpflegen", "Primary Keys verschwinden", "Transaktionen sind unmöglich"], 1, "Indizes beschleunigen Lesen, kosten aber Speicher und zusätzliche Arbeit bei INSERT, UPDATE und DELETE."],
  ["db-mc-011", "datenbanktypen", "practice", "Welche Datenbank ist eingebettet und gut für lokale Einzeldatei-Anwendungen?", ["Redis", "SQLite", "MongoDB", "PostgreSQL"], 1, "SQLite läuft ohne separaten Server und speichert eine Datenbank typischerweise in einer Datei."],
  ["db-mc-012", "datenbanktypen", "study", "Was ist ein typischer Vorteil dokumentorientierter Datenbanken?", ["Immer stärkere Integrität", "Flexible, verschachtelte Dokumentstrukturen", "Keine Indizes nötig", "Automatische 3NF"], 1, "MongoDB-artige Systeme bilden variable, verschachtelte Aggregate bequem als Dokumente ab."],
  ["db-mc-013", "backend", "practice", "Wozu dient Connection Pooling?", ["Tabellen normalisieren", "DB-Verbindungen wiederverwenden und begrenzen", "Passwörter hashen", "Backups komprimieren"], 1, "Ein Pool vermeidet den Aufbau einer neuen Verbindung pro Request und schützt die Datenbank vor zu vielen Verbindungen."],
  ["db-mc-014", "backend", "practice", "Warum gehören Schemaänderungen in Migrationen?", ["Damit Änderungen versioniert und reproduzierbar sind", "Damit SQL unnötig wird", "Damit Backups entfallen", "Damit jede Abfrage cached"], 0, "Migrationen machen Datenbankschemata zwischen Umgebungen nachvollziehbar und wiederholbar."],
  ["db-mc-015", "constraints", "study", "Welcher Constraint kann erzwingen, dass duration_minutes positiv ist?", ["NOT NULL", "UNIQUE", "CHECK", "FOREIGN KEY"], 2, "CHECK (duration_minutes > 0) validiert eine Bedingung direkt in der Datenbank."],
].map(([id, topic, difficulty, question, answers, correctAnswer, explanation]) => ({ id, topic, difficulty, question, answers, correctAnswer, explanation }));

export const sqlChallenges = [
  { id: "db-sql-001", topic: "sql", difficulty: "basic", schema: ["customers", "id · name · city"], task: "Gib alle Kunden aus Berlin aus.", solution: "SELECT * FROM customers WHERE city = 'Berlin';", required: [/^select\s+\*\s+from\s+customers\s+where\s+city\s*=\s*['\"]berlin['\"]$/i], explanation: "WHERE schränkt die Ergebnismenge auf Zeilen mit Berlin ein." },
  { id: "db-sql-002", topic: "sql", difficulty: "basic", schema: ["tasks", "id · title · due_date"], task: "Liste alle Aufgaben aufsteigend nach Fälligkeit.", solution: "SELECT * FROM tasks ORDER BY due_date ASC;", required: [/^select\s+\*\s+from\s+tasks\s+order\s+by\s+due_date(?:\s+asc)?$/i], explanation: "ASC ist die Standardrichtung, explizit aber oft leichter lesbar." },
  { id: "db-sql-003", topic: "sql", difficulty: "basic", schema: ["users", "id · name · email"], task: "Füge die Nutzerin Ada mit ada@example.org ein.", solution: "INSERT INTO users (name, email) VALUES ('Ada', 'ada@example.org');", required: [/^insert\s+into\s+users\s*\(\s*name\s*,\s*email\s*\)\s*values\s*\(\s*['\"]ada['\"]\s*,\s*['\"]ada@example\.org['\"]\s*\)$/i], explanation: "Eine explizite Spaltenliste macht INSERTs robust gegen Schemaänderungen." },
  { id: "db-sql-004", topic: "sql", difficulty: "basic", schema: ["tasks", "id · title · done"], task: "Markiere Aufgabe 7 als erledigt.", solution: "UPDATE tasks SET done = TRUE WHERE id = 7;", required: [/^update\s+tasks\s+set\s+done\s*=\s*(?:true|1)\s+where\s+id\s*=\s*7$/i], explanation: "Das WHERE ist entscheidend, sonst würden alle Aufgaben geändert." },
  { id: "db-sql-005", topic: "sql", difficulty: "basic", schema: ["measurements", "id · captured_at"], task: "Lösche Messwert 42.", solution: "DELETE FROM measurements WHERE id = 42;", required: [/^delete\s+from\s+measurements\s+where\s+id\s*=\s*42$/i], explanation: "Auch bei DELETE begrenzt WHERE die betroffenen Zeilen." },
  { id: "db-sql-006", topic: "sql", difficulty: "study", schema: ["projects", "id · company_id · name", "companies", "id · name"], task: "Zeige Projektname und zugehörigen Firmennamen.", solution: "SELECT p.name, c.name FROM projects p JOIN companies c ON c.id = p.company_id;", required: [/(?:from\s+projects\s+(?:as\s+)?p[\s\S]*join\s+companies\s+(?:as\s+)?c|from\s+companies\s+(?:as\s+)?c[\s\S]*join\s+projects\s+(?:as\s+)?p)/i, /on\s+(?:c\.id\s*=\s*p\.company_id|p\.company_id\s*=\s*c\.id)/i, /select\s+p\.name\s*,\s*c\.name/i], explanation: "Der Fremdschlüssel projects.company_id verbindet Projekte mit Unternehmen." },
  { id: "db-sql-007", topic: "sql", difficulty: "study", schema: ["tasks", "id · project_id · title"], task: "Zähle die Aufgaben pro Projekt.", solution: "SELECT project_id, COUNT(*) FROM tasks GROUP BY project_id;", required: [/select\s+project_id\s*,\s*count\s*\(\s*\*\s*\)/i, /from\s+tasks/i, /group\s+by\s+project_id/i], explanation: "GROUP BY bildet je project_id eine Gruppe, COUNT zählt ihre Zeilen." },
  { id: "db-sql-008", topic: "sql", difficulty: "study", schema: ["tasks", "id · project_id"], task: "Zeige nur Projekte mit mehr als fünf Aufgaben.", solution: "SELECT project_id, COUNT(*) FROM tasks GROUP BY project_id HAVING COUNT(*) > 5;", required: [/group\s+by\s+project_id/i, /having\s+count\s*\(\s*\*\s*\)\s*>\s*5/i], explanation: "HAVING filtert aggregierte Gruppen; WHERE kann das Aggregat nicht filtern." },
  { id: "db-sql-009", topic: "sql", difficulty: "study", schema: ["employees", "id · name · salary"], task: "Finde Mitarbeitende mit überdurchschnittlichem Gehalt.", solution: "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);", required: [/from\s+employees\s+where\s+salary\s*>\s*\(\s*select\s+avg\s*\(\s*salary\s*\)\s+from\s+employees\s*\)/i], explanation: "Die Subquery berechnet einen einzelnen Vergleichswert für die äußere Abfrage." },
  { id: "db-sql-010", topic: "sql", difficulty: "practice", schema: ["measurements", "machine_id · value · captured_at"], task: "Nutze eine CTE namens recent, um Messwerte seit 2026-01-01 auszuwählen, und gib daraus alle Zeilen aus.", solution: "WITH recent AS (SELECT * FROM measurements WHERE captured_at >= '2026-01-01') SELECT * FROM recent;", required: [/^with\s+recent\s+as\s*\(/i, /from\s+measurements\s+where\s+captured_at\s*>=\s*['\"]2026-01-01['\"]/i, /\)\s*select\s+\*\s+from\s+recent$/i], explanation: "Eine CTE benennt ein Zwischenergebnis und kann komplexe Abfragen lesbarer gliedern." },
];

export const schemaTasks = [
  { id: "db-schema-001", topic: "modellierung", difficulty: "basic", task: "Ein Unternehmen beschäftigt viele Mitarbeitende; jede Person arbeitet genau für ein Unternehmen.", entities: ["companies", "employees"], links: [["companies", "1", "n", "employees"]], answer: "companies 1:n employees", explanation: "employees erhält company_id als Fremdschlüssel." },
  { id: "db-schema-002", topic: "modellierung", difficulty: "study", task: "Mitarbeitende können an mehreren Projekten arbeiten; Projekte haben mehrere Mitarbeitende.", entities: ["employees", "employee_projects", "projects"], links: [["employees", "1", "n", "employee_projects"], ["employee_projects", "n", "1", "projects"]], answer: "Junction Table", explanation: "employee_projects löst die n:m-Beziehung auf und kann zusätzlich Rolle oder Stunden speichern." },
  { id: "db-schema-003", topic: "relationen", difficulty: "basic", task: "Jede Maschine besitzt höchstens einen aktuellen Wartungsplan, jeder Plan gehört genau einer Maschine.", entities: ["machines", "maintenance_plans"], links: [["machines", "1", "1", "maintenance_plans"]], answer: "1:1", explanation: "Ein UNIQUE-Fremdschlüssel machine_id in maintenance_plans sichert die 1:1-Beziehung." },
  { id: "db-schema-004", topic: "normalisierung", difficulty: "study", task: "Bestellungen enthalten Produkte mit Menge und Einzelpreis.", entities: ["orders", "order_items", "products"], links: [["orders", "1", "n", "order_items"], ["order_items", "n", "1", "products"]], answer: "Positions-Tabelle", explanation: "order_items modelliert jede Bestellposition; quantity und unit_price gehören an diese Beziehung." },
  { id: "db-schema-005", topic: "backend", difficulty: "practice", task: "Mandantenfähige App: Nutzer gehören zu Firmen und bearbeiten deren Projekte und Aufgaben.", entities: ["companies", "users", "projects", "tasks"], links: [["companies", "1", "n", "users"], ["companies", "1", "n", "projects"], ["projects", "1", "n", "tasks"]], answer: "Mandant über company_id", explanation: "company_id grenzt Mandantendaten ab; RLS kann den Zugriff anhand der Firmenmitgliedschaft prüfen." },
];

export const conceptChecks = [
  ["db-concept-001", "normalisierung", "basic", "Warum sollte der Kundenname nicht in jeder Bestellung erneut gespeichert werden?", "Redundanz führt zu Update-Anomalien. Eine Referenz auf customers hält den Namen an genau einer Stelle."],
  ["db-concept-002", "constraints", "basic", "Warum reicht Formularvalidierung für Datenintegrität nicht aus?", "Daten können über andere Clients, Skripte oder parallele Requests eintreffen. Constraints schützen jede Zugriffsstelle zentral."],
  ["db-concept-003", "transaktionen", "study", "Warum sollten Überweisung und Gegenbuchung in einer Transaktion liegen?", "Beide Änderungen bilden eine unteilbare fachliche Operation. Scheitert eine, verhindert ROLLBACK einen halbfertigen Zustand."],
  ["db-concept-004", "performance", "practice", "Warum beschleunigt ein Index nicht automatisch jede Abfrage?", "Er hilft nur bei passenden Zugriffsmustern. Bei kleinen Tabellen oder vielen Treffern kann ein sequenzieller Scan günstiger sein."],
  ["db-concept-005", "concurrency", "study", "Wie kann ein Deadlock trotz korrekter Einzeltransaktionen entstehen?", "Zwei Transaktionen sperren Ressourcen in unterschiedlicher Reihenfolge und warten anschließend zyklisch aufeinander."],
  ["db-concept-006", "datenbanktypen", "practice", "Warum ist NoSQL nicht gleichbedeutend mit schemalos?", "Auch flexible Dokumente besitzen ein erwartetes Schema; es wird oft in Anwendung und Validierungsregeln statt nur relational erzwungen."],
  ["db-concept-007", "backend", "practice", "Warum ersetzt Supabase kein Verständnis von PostgreSQL?", "Supabase stellt PostgreSQL samt APIs, Auth und Werkzeugen bereit; Tabellen, SQL, Constraints, Indizes und RLS bleiben zentral."],
  ["db-concept-008", "backend", "practice", "Warum müssen Backups regelmäßig wiederhergestellt getestet werden?", "Nur ein Restore-Test zeigt, ob Sicherungen vollständig, lesbar und innerhalb der benötigten Zeit nutzbar sind."],
  ["db-concept-009", "normalisierung", "practice", "Wann kann Denormalisierung sinnvoll sein?", "Bei nachgewiesenen Leseengpässen kann bewusst redundante Speicherung Abfragen vereinfachen; Konsistenzkosten müssen kontrolliert werden."],
  ["db-concept-010", "concurrency", "study", "Was ist der Unterschied zwischen Non-repeatable Read und Phantom Read?", "Beim Non-repeatable Read ändert sich eine bereits gelesene Zeile; beim Phantom Read ändert sich die Menge passender Zeilen."],
  ["db-concept-011", "datenbanktypen", "study", "Wann ist ein relationales Modell einem NoSQL-Modell vorzuziehen?", "Wenn klar strukturierte Beziehungen, starke Constraints, Transaktionen und flexible relationale Abfragen zentral sind. NoSQL ist eine spezialisierte Alternative, kein allgemeines Upgrade."],
  ["db-concept-012", "backend", "practice", "Warum darf eine API nicht allein auf versteckte UI-Buttons als Zugriffsschutz vertrauen?", "Clients lassen sich umgehen. Autorisierung muss serverseitig oder mit RLS an jeder Datenoperation geprüft werden."],
].map(([id, topic, difficulty, question, explanation]) => ({ id, topic, difficulty, question, explanation }));

export const modes = [
  { id: "cards", label: "Lernkarten", short: "Karten", items: flashcards },
  { id: "quiz", label: "Multiple Choice", short: "Quiz", items: multipleChoice },
  { id: "sql", label: "SQL-Challenges", short: "SQL", items: sqlChallenges },
  { id: "schema", label: "Schema-Aufgaben", short: "Schema", items: schemaTasks },
  { id: "concept", label: "Concept Check", short: "Check", items: conceptChecks },
];

export const allItems = modes.flatMap((mode) => mode.items.map((item) => ({ ...item, mode: mode.id })));
