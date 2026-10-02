# Web Engineering 2: Quellen und Lernpfad

Stand der Sichtung: 02.10.2026. Vorwissen laut Nutzer: Einsteiger-Grundwissen in den meisten Bereichen. Ziel: Zusammenhänge verstehen und selbst anwenden.

## Quellen

Read-only: `G:\Meine Ablage\01_Studium\DHBW Mosbach\Web Eng 2\fullstack-vorlesung` und `gitrepo`.
Online-Einstieg: https://luc-debug.github.io/fullstack-lecture/

Die lokale Sammlung enthält elf Vorlesungsdecks als PDF/PPTX sowie HTML-Folien, Aufgaben und teilweise Lösungen. PDF und PPTX sind alternative Formate, keine zusätzlichen Themen. Die Online-Seite war über das Web-Tool nicht zugänglich, ließ sich anschließend per HTTP abrufen (200). Ihre elf Kapitelüberschriften stimmen mit der lokalen Sammlung überein. Die HTML-Dateien sind nicht identisch; die inhaltliche Auswertung und Seitenangaben beziehen sich auf die lokalen PDFs, deren Übereinstimmung mit den heutigen Online-PDFs nicht bestätigt ist.

| Material | Umfang | Themen / passende Lernkomponente | Stand |
| --- | --- | --- | --- |
| introduction.pdf | 14 Seiten | Kursaufbau, Kompetenz-Puls, Portfolio; Orientierung | Übersicht |
| web-basics-advanced.pdf | 32 Seiten | Netzwerkbegriffe, IP/NAT/IPv6/DHCP/Subnetze, TCP/UDP, HTTP-Nachrichten, Status, Versionen, Content Negotiation und Kompression; Nachrichten zerlegen | Grundlagen S. 4, 11–21 ausgearbeitet; Rest geplant |
| javascript-advanced.pdf | 56 Seiten | map/filter/find/reduce, bedingte Operatoren, Nullish Coalescing, Optional Chaining, Destructuring, Spread/Rest; Codeauswertung mit Zwischenschritten | Geplant |
| evolution-of-web-architecture.pdf | 26 Seiten | Statisch/MPA/AJAX/SPA, imperativ/deklarativ, MVC; Architekturvergleich und Accordion | Geplant |
| frontend-advanced.pdf | 61 Seiten | Komponentenschnitt, essenzieller/abgeleiteter State, lokal/lifted/global, RAM/Storage/Server/URL, fünf Entwicklungsschritte; UI zerlegen und State zuweisen | Geplant |
| frontend-tooling.pdf | 23 Seiten | Dev-Server/HMR, Transpiler/Polyfills, Bundler/Dependency Graph, Cache Busting, Source Maps, Linter/Formatter; Werkzeug einem Problem zuordnen | Geplant |
| api.pdf | 38 Seiten | Sechs REST-Prinzipien, URI-Design, Idempotenz, OpenAPI/Dokumentation, Versionierung; Requests entwerfen und Wiederholung beurteilen | Geplant; Rollen S. 14–15 im Fundament |
| business-logic.pdf | 9 Seiten | Middleware, Request Handler, Pipeline, Sequenzdiagramme; Request und Fehlerpfade verfolgen | Geplant |
| database.pdf | 43 Seiten | SQL/NoSQL, CRUD/SELECT, Persistenz, Schlüssel/Kardinalitäten, ER-Diagramme, JOINs; Datensätze und Abfrageergebnisse herleiten | Geplant; Persistenz S. 20–21 im Fundament |
| git.pdf | 25 Seiten | Working Tree/Index/Historie, revert/reset/stash/Merge; Zustand vor/nach einem Befehl | Geplant, parallel zur Praxis |
| examination.pdf | 4 Seiten | Portfolio-Rahmen, Technologien, Codequalität, dokumentierter Frontend-Workflow | Anforderungen gesichtet |

Aufgabeninventar: Git-Entscheidungen; zehn JavaScript-Aufgaben (Array-Methoden, Ternary, Short Circuit, Nullish, Optional Chaining, Array-/Objekt-Destructuring, Spread, Rest; Nummer 06 fehlt in den vorhandenen Dateinamen); Accordion mit Vanilla JS und React; essenzieller/abgeleiteter State; Vite-Tooling; native Node-HTTP-API; Content Negotiation/Compression; RESTful URL-Design; Middleware; Basic Read, ER-Diagramme und JOINs. Die Nummerierungslücke wird nicht als fehlendes Fachthema interpretiert.

`gitrepo/react-app/src/App.jsx` enthält einen Vite/React-Einstieg mit Zähler. Daraus lässt sich kein bereits implementiertes Fullstack-Projekt ableiten. Die vorhandenen Trainer unter `ai-prompt-library` beziehen sich auf ein anderes konkretes Projekt; sie ersetzen nicht die Vorlesungsabdeckung.

## Erste Einheit

Galerie-Slug: `web-fullstack-verstehen`. Verwendet den vorhandenen `CourseTrainer` ohne neue Abhängigkeiten.

- Drei Einstiegsfragen werden erst nach Antworten ausgewertet. Keine abgeleiteten persönlichen Wissenslücken ohne Antwort.
- Erklärung von Client, Frontend, Backend, API, Datenbank, URL und Transport bis Request/Response, Status, Body und Anzeige.
- Eigenes durchgearbeitetes Benutzerbeispiel, an die native Node-HTTP-Aufgabe angelehnt.
- Quiz; bei Fehlern Body als Zwischenschritt, „Kein Ansatz“, Hinweis, erneuter Versuch und optionale vollständige Erklärung.
- Cheat-Sheet-Vorschlag für den Datenfluss; Anwendung mit Hinweis und neue Transferaufgabe ohne Hilfe; eigene Buchsuche zur Selbstreflexion.
- Fortschritt der Einheit gilt nur für die Sitzung. Beim Wiedereinstieg zuerst die Einstiegsfragen ohne Hilfen bearbeiten. Keine automatische semantische Bewertung freier Texte.

## Grenzen und Quellenpräzision

Die Übersicht erfasst das gesamte Material, die erste Einheit deckt noch nicht den ganzen Kurs ab. Beispiele und didaktische Erläuterungen sind eigene Ergänzungen. Die HTTP-Textdarstellung wird ausdrücklich auf HTTP/1.1 begrenzt; HTTP/2 und HTTP/3 dürfen nicht als dieselbe Textübertragung erklärt werden. Zustandsloses HTTP verbietet weder Datenbanken noch ergänzte Sitzungsmechanismen.

Die Prüfungsfolien nennen React, TypeScript (Frontend/Backend), shadcn.ui, Tailwind CSS und Drizzle sowie SWAPI. S. 4 enthält 5 BE Codequalität und 10 BE Frontend. Weitere Funktionen, ein vollständiger Bewertungsrahmen oder ein Prüfungstermin werden nicht erfunden. Die dortige „Readonly AI“-Regel betrifft die Prüfungsleistung; der Trainer ist Lernmaterial. TypeScript und die verpflichtenden Bibliotheken brauchen zusätzliche Lerninhalte, da die vorhandenen Decks dafür keine vollständige Einführung bieten.

Einzelne Folien sind vereinfachend formuliert, etwa database.pdf S. 7 („SQL … Tabelle“). SQL ist eine Sprache; eine relationale Datenbank enthält Tabellen. Solche Verkürzungen dürfen in späteren Einheiten nicht als Definition übernommen werden.

## Verifikation

`npm run build` erfolgreich. `npm test`: 27 Node-Tests und 18 Vitest-Tests bestanden. Im Browser geprüft: Galerie-Eintrag öffnet, Einstieg mit richtigen/falschen Antworten und Wiederholung, falsches Quiz, Diagnose mit „Kein Ansatz“, Hinweis, vollständige Erklärung, neuer Versuch, Cheat Sheet, Anwendung mit Hinweis, Transfer ohne Hinweis und Abschlussanzeige. Keine Warnungen/Fehler in der Browser-Konsole. Die Antworten bei dieser Prüfung stammen vom Coding-Agent, nicht vom Lernenden.
