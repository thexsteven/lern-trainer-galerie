# UI/UX-Audit des Lerntrainers

Stand: 02.10.2026. Das überarbeitete Konzept ist vom Nutzer bestätigt und seine Umsetzung autorisiert. Die ursprünglichen Befunde unten beschreiben den Ausgangszustand; der aktuelle Umsetzungsstand und verbleibende Grenzen werden separat festgehalten.

## Gesamtstand des bestätigten Konzepts

Die Übersicht ist als „Lernplan“ erreichbar: sichtbarer nächster Schritt mit Begründung, Wochenrhythmus und Fachbudgets, Reserve sowie bekannte Wiederholungstermine. Nummerierte und begründete Einheitsfolgen markieren die erste offene Einheit je Fach; FSA und Grundlagentrainer behalten die Orientierung während einer Runde. Mobile Plan- und FSA-Ansichten visuell ohne horizontale Überbreite geprüft. Beim Einheitenwechsel bleibt die eingegebene Antwort erhalten. Unabhängige Gegenprüfung fand und bestätigte Korrekturen für unabrufbare Reserve, unveränderte Wiederholungsintervalle, Diagnose-Wiederholungen und als Lernzeit gezählte Fachwechselpausen. Eine dauerhaft aktive Runde erfasst weiterhin verstrichene Zeit; die Anzeige und Planerklärung benennen diese Grenze.

Implementiert sind eine zentrale Übersicht der fünf Semesterfächer, gemeinsame Rundenhistorie und Einheitenfortschritte, ausdrücklich als Abschlussfortschritt bezeichnete Prozentwerte, Trennung von Lern- und Nachweisrunden sowie zwei fehlerfreie Nachweisrunden pro Einheit ohne Tages-/Neuheitszwang oder späteren Verlust erreichter Abschlüsse. Die zentrale Steuerung speichert aktive und pausierte Runden; CourseTrainer, Mathe und FSA verwenden diese Schnittstelle. Mathe-Probeklausuren und Selbsteinschätzungen bleiben als ergänzende Übungsdaten erkennbar.

Navigation und Darstellung wurden integriert: Übersicht und Suche bleiben aus Trainern erreichbar, Suche bietet Tastaturauswahl und vollständige Treffer, Bibliothekskarten zeigen Einheiten/Versuche und fachbezogene Cover. Bibliothekskontext bleibt bei der Rückkehr erhalten. HTML-Labore laufen im gemeinsamen Trainerrahmen und sind als Erkundung ohne automatischen Abschluss gekennzeichnet. Der Prüfungseditor verwendet Verwerfenschutz auch beim Schließen; Ladefehler bieten eine Wiederholungsaktion. Die vorhandenen fachlichen Visualisierungen und charakteristischen dunklen Bühnen wurden erhalten.

Der aktuelle Pflichtkatalog enthält **18 Einheiten**: FSA 3, Netztechnik 3, Mathematik 8, systemnahe Programmierung 3 und Web Engineering 1. Diese Zahl wurde direkt aus `getSemesterLearningProgram()` geprüft. Sie beschreibt den ausgearbeiteten Trainerbestand und behauptet keine vollständige Abdeckung sämtlicher Prüfungsunterlagen. Alle 51 bisherigen Lernangebote bleiben im Katalog.

### Unabhängige Gegenprüfung der Integration

Die Gegenprüfung verfolgte insbesondere Speicherung, Hilfezustände, Moduswechsel, Wiederaufnahme und die Abbruchpfade über App, Lernsteuerung und Trainer. Sie meldete folgende konkrete Nachbesserungen; daraus folgt keine pauschale Freigabe ungetesteter Pfade:

- Mathe-Hilfetabs müssen laufende Nachweisrunden als unterstützt markieren. Nachträgliche Korrektur mit Regressionstest durch den verantwortlichen Implementierungsagenten bestätigt.
- CourseTrainer und Mathe benötigen eine explizite Abbruchaktion statt erzwungener vollständiger Abgabe vor dem Neustart. Nachträgliche Korrektur mit Regressionstest durch den verantwortlichen Implementierungsagenten bestätigt.
- Geplante Wiederholungen dürfen visuell nur dann als Nachweisrunde erscheinen, wenn ihr zentraler Wertungsmodus dies tatsächlich erlaubt. Sichtbarer Wiederholungsmodus in CourseTrainer/Mathe korrigiert; zwei zusätzliche Regressionstests und insgesamt 19 gezielte Trainertests laut verantwortlichem Agenten erfolgreich.
- Veraltete aktive Sitzungen zu entfernten Sammelzielen wie `netz-grundlagen` dürfen den nächsten Lernschritt nicht blockieren. Der Fehler wurde gegen die zentrale Steuerung mit einem alten Speicherzustand reproduziert, anschließend zentral korrigiert; 23 Modelltests laut verantwortlichem Agenten erfolgreich.
- Fehler beim Speichern persönlicher Prüfungstermine sind sichtbar. `saveExam` liefert eine Speicherbestätigung und veröffentlicht bei Fehlschlag keine geänderte Prüfung; das Formular bleibt samt Eingaben und Verwerfenschutz geöffnet. Erneutes Speichern schließt es erst nach Erfolg. Vier PersonalStore-Tests und 18 App-Tests inklusive Fehler-/Wiederholungsweg erfolgreich.
- Die fünf Einträge der mobilen Hauptnavigation wurden auf eine gemeinsame Zeile korrigiert; der Hauptagent hat den Zustand vor und nach der Anpassung im Browser geprüft.

Ein zunächst vermuteter Fehler beim Öffnen einer anderen Einheit desselben Trainers wurde nach Prüfung des aktuellen `requestedUnit`-Filters ausdrücklich zurückgezogen; er ist kein offener Befund. Alle oben aufgeführten konkreten Integrationsbefunde sind damit bearbeitet. Abschließende Gesamtsuite: 112 Tests erfolgreich; Produktionsbuild und git diff --check erfolgreich. Die konkrete Browserabnahme der neuen Regex-Strecke sowie Grenzen sind in docs/VERIFICATION.md dokumentiert.

### Verbleibende fachliche Abdeckung und Prüflimits

Die technische Vereinheitlichung ergänzt keine fehlenden Vorlesungseinheiten. Der FSA-Rundentrainer deckt Grundlagen, DEA und die ergänzte Anwendungsstrecke zu regulären Ausdrücken ab; NEA/Umwandlungen, Beweise und kontextfreie Sprachen fehlen weiterhin als zentrale Nachweisstrecken. Web besitzt genau eine ausgearbeitete Fullstack-Einheit; die übrige Roadmap und die alte Projektquest ersetzen keinen vollständigen React-/TypeScript-/Drizzle-Portfolio-Nachweis. Netztechnik und Systemnähe beziehen sich auf die jeweils drei vorhandenen Einheiten. Mathe kennzeichnet den aktuellen Differentialrechnungsumfang und trennt ältere ergänzende Themen/Probeklausuren davon. Freie Datenbank- und HTML-Übungen erhalten durch das neue Layout keinen automatisch geprüften Semesterabschluss.

Die Root-Tests und Browser-Stichproben prüfen die integrierten Kernwege; die lokalen Regressionstests unten prüfen die konkreten Spezialtrainer-Fixes. Eine vollständige fachliche Validierung jeder älteren Aufgabe, aller SQL-/Regex-Antwortformen, sämtlicher Animationen, aller Kontrastwerte, Offline-Updates und aller Langzeitmigrationen wurde nicht durchgeführt. Der Umfang darf in Abschlussberichten nicht als „jede Funktion vollständig getestet“ bezeichnet werden.

## Umsetzungsstand: Diagnose und Spezialtrainer

| Befund | Umgesetzt und gezielt geprüft | Noch offen / Grenze |
|---|---|---|
| Diagnose meldet Speicherung ohne Bestätigung | Erfolg nur bei `accepted:true` und nicht `persisted:false`; Fehler bleiben erneut speicherbar. Stabile Runden-ID, explizite Aufgabenresultate und Wiederaufnahme geplanter Diagnosen einschließlich Fragenreihenfolge/Antworten/Auswertung. | Zentrale App-/Core-Integration wird separat geprüft; freie, noch nicht abgegebene Diagnosen haben keinen eigenen dauerhaften Entwurf. |
| Diagnose zeigt veraltete Tagesregel | Ergebnishinweis nennt zwei fehlerfreie Nachweisrunden, Diagnose selbst bleibt Diagnose. | Vollständige fächerübergreifende Regeln liegen außerhalb dieser Teiländerung. |
| Datenbank verwechselt Selbsteinschätzung und Nachweis | Aktivität in absoluten Zahlen getrennt nach automatischer Prüfung, Selbsteinschätzung und Lösungshilfe; alte Bewertungen bleiben unklassifiziert. Lösungshilfe bleibt nach Ausblenden markiert. Fehler beim Speichern sichtbar. | Kein vollständiger automatischer Einheitennachweis für alle Datenbank-Übungsarten; SQL-Prüfer weiter begrenzter Mustervergleich. |
| Datenbank kann Ein-Aufgaben-Auswahl nicht neu starten | Explizites „Diese Aufgabe erneut üben“ remountet den Versuch; abgegebene Karteikarte nicht mehrfach bewertbar. | Wiederholung ist eine Übung, kein neu behaupteter Prüfungsnachweis. |
| KV-/Mastermind-Interaktionen nicht tastaturbedienbar | Native Buttons, konkrete Zustands-/Feldnamen, sichtbare Fokusmarkierung; Enter/Leertaste für KV und Enter zum Entfernen einer Mastermind-Farbe getestet. | Gesamte Accessibility aller Diagramme und Spieler nicht vollständig geprüft. |
| Sortierer entfernen ungültige Werte | Alle vier Sortierer weisen ungültige Tokens oder falsche Anzahl zurück; laufendes Beispiel bleibt erhalten. Eingaben haben Namen und Wertebereichshinweis. | Regex-Prüflabor nicht Bestandteil dieser Änderung. |
| Web-Quest sperrt Inhalte und bewertet vorab | Freie Level-/Boss-/Finalewahl; respektvoller Einstieg; Projektbezug und XP-Bedeutung explizit; unverdiente Abschlussbehauptung im Finale entfernt; Speicherfehler sichtbar. | Fachliche Vollabdeckung der aktuellen Semesterprüfung bleibt ausdrücklich unbelegt. |
| Fullstack bindet gemeinsame Sitzung nicht ein | Props und genau eine Einheiten-ID `web-request-response` an CourseTrainer durchgereicht. | Gemeinsamer CourseTrainer und zentrale Integration separat verantwortet. |

Gezielte Verifikation dieser Teilumsetzung: fünf Datenbank-Modelltests und 17 React-Tests in `ExamDiagnostic.test.jsx`/`SpecialistTrainers.test.jsx` erfolgreich. Diese Tests ersetzen keine vollständige Browser-, Kontrast- oder Offline-Prüfung. App-, Core-, Mathe-, CourseTrainer- und Laborbefunde werden durch diese Tabelle nicht pauschal als erledigt markiert.

## Umfang und Belegstärke

Alle 51 Katalogangebote wurden inventarisiert. Alle JSX-Trainer wurden strukturell auf Komponenten, Zustände und Interaktionen gesichtet. Vertieft gelesen wurden App/Navigation/Prüfungseditor, CourseTrainer, ExamDiagnostic, FSA-Rundentrainer, appliedMath/Course und Datenbanktrainer samt Fortschrittslogik. Große ältere Erklärtrainer wurden anhand ihrer Komponenten und ausgewählter Interaktionsstellen geprüft, nicht Zeile für Zeile fachlich validiert. HTML-Labore wurden auf Struktur, Navigation, Prüfungsinteraktionen und Speicherung gesichtet. Kein vollständiger dynamischer Funktionstest aller Trainer, keine vollständige Accessibility- oder Kontrastmessung.

Browser-Stichproben des Hauptagenten: Start, Bibliothek mit 51 Angeboten, Prüfungsleerzustand und geöffnetes Formular ohne Speicherung, FSA-Einstieg, Netztechnik-Einstieg, Mathe-Vorwissen und Lerneinheiten auf Desktop sowie bei 390 px, App.js Level Quest. Diese Stichproben belegen Ansichten, nicht sämtliche Antwort-, Speicher- und Rückkehrpfade.

Empfohlene fachliche Richtung: fünf Semesterfächer im Fokus; Abschluss einer Einheit nach zwei fehlerfreien Runden insgesamt, ohne Tages-, Neuheits- oder spätere Reset-Bedingung; Lern- und Nachweismodus unterscheiden; zentrale History und Fortschritt; Prozent als ausdrücklich benannter Abschlussfortschritt; Selbsteinschätzung separat. Die Empfehlungen Q1–Q5 wurden übernommen; das Gesamtkonzept wurde vorgelegt und noch nicht ausdrücklich zur Implementierung bestätigt.

## Wichtigste Befunde und konkrete Abnahme

### P1 · Die Fortschrittsoberfläche erzählt mehrere widersprüchliche Geschichten

**Beleg:** `src/components/ExamDiagnostic.jsx` fordert im Ergebnis zwei kalte Nachweise an verschiedenen Tagen. `src/trainers/Formale Sprachen & Automaten/Endliche Automaten/FsaPruefungstraining.jsx` zeigt „Nachweistage“, neue Varianten und erneutes Öffnen nach Fehlern. `src/appliedMath/Course.jsx` zeigt neue Aufgaben, andere Tage, 80-%-Kapitelquoten und drei 90-Punkte-Klausuren; die Fortschrittsberechnung liegt separat in `src/appliedMath/model.js`. `src/learningControl.js` importiert vom alten Mathe-Stand lediglich Zählmetadaten. Die Startseite in `src/App.jsx` zeigt nur die aktuelle Empfehlung und Wochenminuten, keine Übersicht der fünf Fächer oder Rundenabschlüsse.

**Verbesserung:** Überall denselben Abschluss „0/2, 1/2, abgeschlossen“ darstellen. Mathe-Rechenquoten, Diagnosewerte, XP und Selbsteinschätzung bekommen eigene Beschriftungen außerhalb dieses Abschlusszählers. Eine Fachübersicht zeigt abgeschlossene Einheiten und den konkreten nächsten Schritt; die History erklärt, welche Runde gezählt hat und warum. Wochenminuten bleiben Planung, kein Wissensmaß.

**Nutzen/Abnahme:** Zwei fehlerfreie Runden am selben Tag schließen eine Einheit ab. Spätere Fehler verändern diesen Abschluss nicht. Fachkarte, Trainer und History zeigen nach Reload denselben Stand; Übung mit Hilfe erzeugt keinen fehlerfreien Nachweis. Selbst bewertete Abschlüsse bleiben ausdrücklich gekennzeichnet und erhöhen keinen automatisch geprüften Nachweiszähler.

### P1 · „Gespeichert“ kann ohne Speicherung erscheinen

**Beleg:** `ExamDiagnostic.save()` setzt `saved=true`; der in `App.jsx` übergebene Callback kehrt ohne passende aktive `learningSession` sofort zurück. Ein aus der Bibliothek gestarteter Einstiegstest kann damit „Gespeichert“ anzeigen, obwohl kein zentraler Lernnachweis entstanden ist. `personalStore.js`, `database/progress.js` und die Quest-Speicherung fangen Speicherfehler still ab; gleichzeitig behauptet die Sidebar „Lokal gespeichert“.

**Verbesserung:** Ergebnis erst nach bestätigter Speicherung als gespeichert zeigen; auch freie Diagnoseergebnisse mit ihrem tatsächlichen Status in der History ablegen. Speicherzustand konkret melden, statt eine unveränderliche Erfolgsaussage anzuzeigen.

**Nutzen/Abnahme:** Freie und geplante Diagnose abschließen, neu laden und History prüfen. Bei blockiertem Storage erscheint eine klare Sitzungswarnung und kein dauerhafter Speichererfolg.

### P1 · Arbeit geht bei üblichen Navigationen verloren

**Beleg:** `App.jsx/ExamForm` ruft für × und „Abbrechen“ direkt `onCancel` auf; `ExamsPage.closeEditor` verwirft ohne Dirty-Prüfung. `useRoute` verarbeitet Browser-Zurück direkt, außerhalb von `requestNavigation`. `CourseTrainer` hält Antworten, Herleitung und Einheitfortschritt nur lokal; `Unit key={active}` setzt beim Themenwechsel Eingaben zurück. `TrainerView` führt immer zur Startseite zurück, auch wenn der Einstieg aus einer gefilterten Bibliothek kam.

**Verbesserung:** Den vorhandenen Verwerfenschutz für alle tatsächlichen Verwerfungswege verwenden. Sitzung/Entwurf und Rücksprungkontext erhalten. Einen Wechsel zwischen Einheiten nicht wie einen Neustart behandeln.

**Nutzen/Abnahme:** Formular ändern → ×/Abbrechen/Browser-Zurück ergeben denselben Schutz. Einheit A bearbeiten → B → A erhält Antworten und Herleitung. Bibliothek filtern → Trainer → zurück erhält Filter und Position.

### P1 · CourseTrainer beendet einen geplanten Lernblock zu früh und verliert Hilfenutzung

**Beleg:** `src/components/CourseTrainer.jsx/Practice` meldet `helpUsed: showHint`; Hinweis öffnen und wieder schließen löscht so die Information faktisch. `completeUnit` ruft `onLearningResult` schon nach einer einzelnen Transferaufgabe auf; `App.jsx` navigiert darauf sofort nach Hause. Die übrigen Einheiten und Reflexion liegen weiter im Trainer.

**Verbesserung:** Einmal verwendete Hilfe bleibt für den Versuch markiert. Aufgabenerfolg aktualisiert den Stand; ein eindeutiger Rundenabschluss führt zur Auswertung. Lern- und Nachweismodus müssen für den Nutzer vor der Antwort erkennbar sein.

**Nutzen/Abnahme:** Hinweis öffnen/schließen/korrekt antworten bleibt „mit Hilfe“. Eine Transferantwort transportiert den Nutzer nicht überraschend aus der Sitzung.

### P1 · Einige Kerninteraktionen sind nur mit der Maus erreichbar

**Beleg:** `Digitaltechnik/KVDiagramm.jsx/KVGrid` rendert anklickbare Zellen als `div` ohne Tastaturaktion. `Java/pruefung_mastermind/SpielablaufTrainer.jsx/Disc` verwendet ebenso klickbare `div` zum Entfernen gesetzter Farben. Die sichtbare Funktion hat keinen entsprechenden Tastaturweg.

**Verbesserung:** Interaktive Zellen/Felder als passend beschriftete Buttons; Zustand und Änderung textlich zugänglich. Fachgrafik und räumliche Darstellung erhalten.

**Nutzen/Abnahme:** KV-Zustände 0/1/X und Mastermind-Farbfelder lassen sich per Tab, Enter und Leertaste vollständig bearbeiten; sichtbarer Fokus und verständliche Namen vorhanden.

### P2 · Suche und Navigation brechen im Trainer auseinander

**Beleg:** Der globale Ctrl/Cmd+K-Handler in `App.jsx` läuft auch auf Trainerseiten; deren früher Return rendert `SearchPalette` jedoch nicht. Die Palette begrenzt Resultate stumm auf zehn und bietet keine Pfeiltasten-Auswahl. Bibliotheksfilter leben nur im Komponenten-State. Die vier Hauptnavigationspunkte verschwinden im Trainer.

**Verbesserung:** Suche auch im Trainer rendern; Ergebnisanzahl und „Alle Treffer“ anbieten. Zurückpfad und aktuelles Fach in der kompakten Trainerleiste erhalten, ohne das Aufgabenfeld durch eine zweite Vollnavigation zu verkleinern.

**Nutzen/Abnahme:** Ctrl+K vom Trainer aus öffnet sichtbar die Suche; Escape bringt Fokus zurück. Suchergebnisse sind vollständig erreichbar. Rückkehr stellt Kontext wieder her.

### P2 · Datenbank-Fortschritt vermischt Aktivität, Prüfung und Gefühl

**Beleg:** `DatenbankTrainer.jsx/Dashboard` zeigt „Wissensstand“ und „% sicher“. `database/progress.js/getStats` leitet dies vom letzten `correct/unsure/wrong` ab; Karteikarten und „Verstanden“ sind Selbsteinschätzungen, SQL/MC liefern automatische Resultate. Aufgedeckte SQL-Lösungen verändern den gespeicherten Ergebnistyp nicht. Bei nur einer gefilterten Aufgabe bleibt `nextIndex=0` und derselbe React-Key; „Nächste Aufgabe“ remountet die beantwortete Aufgabe nicht.

**Verbesserung:** Bearbeitungsstand, automatisch geprüfte Antworten und Selbsteinschätzung getrennt benennen; Hilfe markieren. Bei einer Aufgabe entweder Ende der Auswahl anzeigen oder „Erneut üben“ mit bewusst neuem Versuch.

**Nutzen/Abnahme:** „Verstanden“ steigert keinen Nachweis. Lösung ansehen bleibt im Ergebnis sichtbar. Ein-Aufgaben-Filter hat einen klaren, funktionsfähigen nächsten Schritt.

### P2 · Eingabeprüfung verändert Aufgaben still

**Beleg:** Alle vier Sortiertrainer in `Theoretische Informatik/Sortier-Algos` filtern ungültige Eingaben heraus. Counting Sort entfernt etwa Werte außerhalb 0–9, Radix außerhalb 0–999; Quick/Merge entfernen NaN. Aus „3, foo, 1“ wird ohne explizites Fehlerfeedback ein anderer Datensatz. `output/regulaere-ausdruecke-pruefung.html/isCorrect` prüft gegen eine Liste normalisierter Zeichenketten, nicht allgemeine Sprachäquivalenz.

**Verbesserung:** Ungültiges Token am Eingabefeld nennen und Übernahme verhindern. Für Regex den unterstützten Prüfbereich ehrlich benennen; unbekannte äquivalente Schreibweisen nicht pauschal als fachlich falsch behaupten. Keine unangefragte komplexe Äquivalenz-Engine nötig.

**Nutzen/Abnahme:** „3, foo, 1“ verändert die laufende Sortierung nicht. Zulässige Wertebereiche sind vor der Eingabe erkennbar. Regex-Feedback unterscheidet überprüfbar falsch von nicht unterstützter Schreibweise.

### P2 · Mobile Mathe-Navigation drängt die Aufgabe nach unten

**Beleg:** Browser-Stichprobe bei 390 px und `appliedMath/Course.jsx`/`math.css`: bis zu sechs Bereichstabs, Themenauswahl, Quellenkontext, sechs Lernschritte und Einleitung vor dem Aufgabenfeld. Interne Kennungen wie `2.topologie` erscheinen in der Einheitenliste. Quellen sind sinnvoll aufklappbar; numerische Felder haben bereits gutes zugeordnetes Feedback.

**Verbesserung:** Aktuelles Thema und Schritt als kompakte Leiste; vollständigen Lernpfad bei Bedarf öffnen. Aufgabe und primäre Aktion priorisieren, Quellen/Detailstatus sekundär. Technische IDs durch fachliche Kurzbezeichnungen ersetzen. Bestehende freie Schrittwahl erhalten.

**Nutzen/Abnahme:** Bei 390 px sind Thema, aktueller Schritt und Beginn der Aufgabe ohne mehrere Navigationsblöcke sichtbar. Zoom auf 200 %, längere Formeln und Tastaturfokus separat prüfen; kein behaupteter Messwert ohne Messung.

### P2 · Die Bibliothek hilft beim Wiederfinden weniger als beim Anschauen

**Beleg:** `App.jsx/CoverArt` wählt drei abstrakte SVG-Motive anhand eines Slug-Hashes; Browser zeigt wiederholte Motive. `LearningCard` zeigt Dauer/Thema/Ziel, aber keine Versuche oder Fortsetzungsposition. Pins werden gespeichert, jedoch bietet `LibraryPage` keinen eigenen Pin-Filter. `HomePage` stellt die fünf Semesterfächer nicht gegenüber.

**Verbesserung:** Fachtypische Miniaturen nutzen: Automat, Rechengraph, Paketweg, Register, Requestfolge. Im Vordergrund stehen letzter Arbeitsstand und „Fortsetzen“, danach freies Erkunden. Fünf Semesterfächer zuerst, übrige Angebote als erreichbare Bibliothek. Zusatzangebote nicht still löschen.

**Nutzen/Abnahme:** Ein Nutzer findet angehefteten Trainer und letzte offene Einheit direkt. Bild und Titel lassen den Inhalt unterscheiden; Abschlussprozent hat eine benannte Bezugsgröße.

### P2 · Ältere Web-Quest besitzt Charakter, aber unpassende Lernsignale

**Beleg:** Browser und `Web-Eng2/ai-prompt-library/AppJs_Level_Quest.jsx`: XP, Ränge, sieben Level, Boss und Sperren; Startetikett „Noch ahnungslos 🐣“. Inhalt bezieht sich auf ein konkretes FastAPI/SQLite/nginx-Projekt. Die Passung zur aktuellen Semesterprüfung mit React/TypeScript/Drizzle ist vor Übernahme separat fachlich zu prüfen, nicht allein aus dem Projektnamen ableitbar.

**Verbesserung:** Den spielerischen Charakter erhalten, Sprache respektvoll machen („Bereit für den Einstieg“), freie Themenwahl erlauben und Projektbezug prominent benennen. XP beschreibt Übungsaktivität. Zuordnung zur Semesterprüfung nur mit belegbarer Stoffabdeckung.

**Nutzen/Abnahme:** Kein Kompetenzurteil vor einer Antwort, keine künstliche Sperre bekannter Themen; Nutzer erkennt Projektbeispiel und aktuelles Prüfungsthema vor dem Start.

### P2 · HTML-Labore sind in der Bibliothek integriert, im Arbeitsfluss jedoch eigenständig

**Beleg:** `App.jsx/openItem` verlässt die App per `window.location.assign`. `public/cyk/index.html` und `public/compiler-parser/index.html` haben eigene Navigation und PWA-Hinweise. `output/fsa-lernreise.html` speichert selbst markierte Stufen lokal; `output/fsa-cheatsheet.html` eigene Notizen. Die Quest-HTMLs halten Missionsresultate im Seitenspeicher. `scripts/build-learning-labs.mjs` kopiert die fünf übrigen HTMLs nach `public/labs`; CYK/Compiler besitzen separate kanonische Buildpfade.

**Verbesserung:** Kompakte, konsistente Rückkehr zum Fach/Bibliothekskontext; „Erkundung“, „selbst markiert“ und „geprüft“ unterscheiden. Fachspezifische Gestaltung und Druckansichten bewahren. Spätere Ergebnisintegration an den Quell-/Buildstellen durchführen, nicht nur generierte Kopien ändern.

**Nutzen/Abnahme:** Labor öffnen und zurückkehren verliert keinen Bibliothekskontext; Reload-Verhalten und Speicherung werden korrekt angekündigt. Selbst markierte Lernreise erhöht keinen Rundenabschluss.

### P3 · Bewegung, Typografie und Fehlerzustände gezielt vereinheitlichen

**Beleg:** `HashmapErklaerer.jsx` und `components/Archiv/Watch later/business-systems.jsx` starten einzelne Player mit `playing=true`; viele andere Player beginnen pausiert. Globale Reduced-Motion-CSS reduziert Animationen, stoppt aber keine JS-Intervalle. `app.css` setzt Metadaten teils auf 9,5–11 px; `math.css` Lernpfadstatus auf 10 px. `TrainerErrorBoundary` zeigt die rohe Fehlermeldung ohne Wiederholungsaktion.

**Verbesserung:** Lernanimationen starten bewusst per Play, bieten konsistente Schritt-/Pause-/Reset-Aktionen. Reduced Motion auch auf JS-Verhalten anwenden. Kleine entscheidende Statusinformationen lesbarer machen; Fehlermeldung mit erneutem Ladeversuch und Rückweg, technische Details aufklappbar.

**Nutzen/Abnahme:** Mit Reduced Motion laufen nach Laden keine unbeauftragten Schritte. Ladefehler lässt sich ohne Browserwissen beheben. Schriftgröße/Contrast und Touch-Ziele anschließend im Browser messen, keine pauschale WCAG-Konformität behaupten.

## Visuelle Richtung: eine präzise Lernwerkstatt mit eigenem Charakter

Die stärkste vorhandene Handschrift sind fachliche Diagramme, dunkle interaktive Bühnen, farbige Zustände und einzelne spielerische Momente. Diese Elemente bleiben. Ein vollständiges Umfärben aller Trainer in identische helle Karten würde ihre Stärken verlieren.

- **Rahmen:** Ruhiger, kompakter App-Rahmen mit fünf Fachzugängen, Fortsetzung und History. Größere Leseflächen auf warmem Hellgrau; dunkle Bühnen dort, wo Code, Graphen oder Zustände erklärt werden.
- **Fachidentität:** Bestehende Akzentfamilien für Mathematik, FSA, Netztechnik, Systemnähe und Web konsequent zuordnen. Farbe immer mit Titel/Icon/Status ergänzen. Cover zeigen tatsächliche fachliche Strukturen statt zufälliger Wellen.
- **Aufgabe:** Oben Fach, Einheit, Lern-/Nachweismodus; darunter eine klare Aufgabe, Eingabe und eine dominante Prüfaktion. Hilfe bleibt zugänglich. Ergebnis erläutert den nächsten Schritt und den tatsächlichen Fortschrittsbeitrag.
- **Spiel:** Eine kurze, sachliche Abschlussanimation und zwei sichtbare Rundenmarken dürfen Freude erzeugen. XP kann in passenden Quests bleiben, räumlich getrennt von Abschluss und Selbsteinschätzung. Keine Beherrschungsversprechen durch kosmetische Belohnungen.
- **Futuristischer Eindruck:** Präzise Linien, klar gerasterte Diagramme, zurückhaltendes Leuchten aktiver Knoten und direkte Zustandswechsel; keine zusätzliche Dauerbewegung über Lesetext.

## Abdeckungsmatrix nach Funktionsbereich

| Bereich | Geprüfte Funktionen/Komponenten | Tiefe und Grenze |
|---|---|---|
| App und `app.css` | Routing, Sidebar/MobileNav, TodayCard, Bibliothek/Filter/Cover/Pins, Suche, Trainerrahmen, Lade-/Fehlerzustand | Vertiefte statische Prüfung; ausgewählte Browseransichten |
| Prüfungsplanung | ExamsPage, Form/Sortieren/Suche, Archiv/Restore/Delete/Undo, Dialog, Dirty-State | Vertieft statisch; Browser nur Leerzustand und Formularöffnung |
| `personalStore`, `learningControl`, `learningProgram` | Speicherung, aktive Sitzung, History, Importgrenze, Abschluss-/Tagesbedingungen, Semesterzuordnung | Gezielte Logikprüfung; keine vollständige Zeit-/Migrationssimulation |
| CourseTrainer | ChoiceList, Practice, Unit, Diagnose/Hilfe/Transfer/Reflexion, Einheitenwahl | Vertieft statisch; Netztechnik-Einstieg im Browser |
| ExamDiagnostic und Datensatz | Vier Katalogdiagnosen, Varianten, Auswahl, Auswertung/Speichern | Vertieft statisch; keine vollständigen Diagnosedurchläufe |
| FSA React | Rundenziele, Einführung/DEA-Tabelle, Aufgabe/Hilfe/Feedback/Abbruch; Wortlauf-Erklärung/Übung | Rundentrainer vertieft, Wortlauf strukturell; FSA-Einstieg im Browser |
| Mathe | Fünf Wrapper, Course, Learning/TaskCard/AnswerFields, Diagnosis, Progress, Workshop/ExamRun/ExamReview, Notes/Sources | Vertieft statisch im gemeinsamen UI; Browser Vorwissen/Lernen Desktop und mobil; Timer/Nachbewertung nicht dynamisch geprüft |
| Mathe-Grafiken | Contours, Optimization, Graph, PointCloud, Region und Slider | Struktur und repräsentative zugängliche SVG-/Eingabestellen; keine Vollvalidierung aller Rechenszenarien |
| Datenbanken | Dashboard, Karteikarte, MC, SQL, Schema, Konzeptcheck, Filter/adaptive Auswahl, Fortschrittsmodell | Vertieft statisch, SQL-Prüfer nicht fachlich vollständig validiert |
| Analysis | Lösungsstepper, Selbstrechnen, Gliederung, Beispiele und Navigation | Strukturell/ausgewählte Interaktionen; große Inhaltsdatei nicht vollständig fachlich gelesen |
| Digitaltechnik | Vereinfachungsplayer, Wahrheitstafel/De Morgan; Flipflop-/Zählersimulation; KV-Grid/DMF/KMF; Register/Schieberegister | Alle vier Dateien strukturell; KV-Zellen konkret auf Interaktion geprüft |
| Java | Cinema-Explorer/Ablauftrainer, Mastermind-Konzepte/Architektur/Feedback, spielbares Mastermind | Alle vier Dateien strukturell; Disc-Tastaturproblem konkret gelesen |
| Theoretische Informatik | Vier Sortierplayer; Hashing-Visuals/Übung07/Übersicht; DFS/BFS/Dijkstra/Topologie/Übung08; Probeklausur Teil2 | Alle 13 Dateien strukturell; Sortier-Eingabepfade vertieft, übrige Visuals nicht vollständig durchgespielt |
| Web | Fullstack mit CourseTrainer; Quest; Frontend-/Lernpfad-/Architekturvisuals | Alle fünf Dateien gesichtet; Quest-Einstieg im Browser; aktueller Prüfungsbezug offen |
| Netz/Systemnah | Jeweilige Inhalte und Einbindung in CourseTrainer | Struktur/Wrapper geprüft; gemeinsame Interaktionsbefunde gelten beiden |
| T1000 | Code-/Abschnittsexplorer, StageSimulator, Glossar, Quiz, SelfCheck | Strukturell; keine vollständige fachliche Prüfung des Pipelinecodes |
| Archiv-Inhalte | AI-Business-Dashboard, Business-Systeme/Spaghetti/Pipeline/ESB | Strukturell; aktive Katalogangebote trotz Ablagepfad `Archiv` |
| HTML/CYK/Compiler | Sieben Angebote, eigenständige Navigation, Eingaben/Quests, Druck/PWA/Notiz-/Selbstmarkierung, Publikationsskript | Statische Stichproben aller Quellseiten; keine Browser-Vollprüfung |
| `Gallery.jsx` | Frühere automatische Galerie | Legacy-Struktur gesichtet; `main.jsx` rendert `App`, daher kein aktueller UI-Änderungsschwerpunkt |

## Umsetzung in kleinen überprüfbaren Schritten

1. Einheitliche Abschlussregeln und ehrliche Speicher-/Ergebnisanzeigen festlegen und technisch absichern.
2. Arbeitsverlust, Suchintegration und Tastaturblocker beheben.
3. Eine vollständige Lernstrecke mit Fachübersicht, Runde, Auswertung und History als Referenz gestalten; Browserprüfung Desktop/390 px/Tastatur/Reload.
4. Mathe und gemeinsame CourseTrainer-Ansichten an diese Interaktionsregeln anschließen; fachliche Visuals erhalten.
5. Bibliothek und ältere Spezialtrainer gezielt nachziehen. Große Erklärmodule nicht pauschal neu bauen.

Offene dynamische Prüfungen: tatsächliche Speicherfehler/Reloads, Browser-Zurück bei geändertem Formular, Ein-Aufgaben-DB-Filter, Dialogfokus, alle Grafiken per Tastatur, Reduced Motion einschließlich JS, Kontrastmessungen, 200-%-Zoom, breite Tabellen/Formeln, HTML-Rückkehr, Offline-/Service-Worker-Updates. Dieses Dokument behauptet deren erfolgreichen Abschluss nicht.

## Vollständiges Inventar der Katalogangebote

Die folgende Liste wird direkt aus `getLearningCatalog()` abgeleitet. Quellpfade der Trainer gelten relativ zu `src`; Laborpfade bezeichnen veröffentlichte URLs. Die Prüftiefe ergibt sich aus der obigen Matrix.

| Nr. | Angebot | Quelle / URL |
|---|---|---|
| 1 | FSA · Wörter, DEA & reguläre Ausdrücke | `./trainers/Formale Sprachen & Automaten/Endliche Automaten/FsaPruefungstraining.jsx` |
| 2 | Kalter Einstiegstest · Angewandte Mathematik | `./components/ExamDiagnostic.jsx` |
| 3 | Kalter Einstiegstest · Netztechnik | `./components/ExamDiagnostic.jsx` |
| 4 | Kalter Einstiegstest · Systemnahe Programmierung | `./components/ExamDiagnostic.jsx` |
| 5 | Kalter Einstiegstest · Formale Sprachen | `./components/ExamDiagnostic.jsx` |
| 6 | Mehrdimensionale Funktionen & Ableitungen | `./trainers/Angewandte Mathematik/Funktionen.jsx` |
| 7 | Autodiff, Taylor & Optimierung | `./trainers/Angewandte Mathematik/Autodiff.jsx` |
| 8 | Regression, Lagrange & PCA | `./trainers/Angewandte Mathematik/Regression.jsx` |
| 9 | Mehrfachintegrale & Wahrscheinlichkeitsdichten | `./trainers/Angewandte Mathematik/Integrale.jsx` |
| 10 | Klausurwerkstatt – 60 Minuten | `./trainers/Angewandte Mathematik/Klausurwerkstatt.jsx` |
| 11 | Analysis-Klausurtraining | `./trainers/Analysis/AnalysisKlausurtrainer.jsx` |
| 12 | Boolesche Ausdrücke vereinfachen | `./trainers/Digitaltechnik/BoolescheVereinfachung.jsx` |
| 13 | Flipflops & Zustandsautomaten | `./trainers/Digitaltechnik/FlipFlops.jsx` |
| 14 | KV-Diagramme | `./trainers/Digitaltechnik/KVDiagramm.jsx` |
| 15 | Sequenzielle Schaltungen | `./trainers/Digitaltechnik/SequenzielleElemente.jsx` |
| 16 | DEA-Wortlauf verstehen | `./trainers/Formale Sprachen & Automaten/Endliche Automaten/wortlauf_lerntrainer.jsx` |
| 17 | Pipeline-Orchestrierung | `./trainers/T1000/PipelineOrchestrationTrainer.jsx` |
| 18 | Datenbank-Kompetenztrainer | `./trainers/Datenbanken/DatenbankTrainer.jsx` |
| 19 | Netze wirklich verstehen | `./trainers/Kommunikations- und Netztechnik/Grundlagen/NetztechnikLernreise.jsx` |
| 20 | Hardware nah denken | `./trainers/Systemnahe Programmierung 1/Grundlagen/SystemnaheProgrammierungLernreise.jsx` |
| 21 | Cinema-Projektarchitektur | `./trainers/Java/cinema_practise/ProjektArchitekturTrainer.jsx` |
| 22 | Java-Konzepte in Mastermind | `./trainers/Java/pruefung_mastermind/JavaKonzepteTrainer.jsx` |
| 23 | Mastermind-Projektarchitektur | `./trainers/Java/pruefung_mastermind/ProjektArchitekturTrainer.jsx` |
| 24 | Mastermind-Spielablauf | `./trainers/Java/pruefung_mastermind/SpielablaufTrainer.jsx` |
| 25 | Counting Sort | `./trainers/Theoretische Informatik/Sortier-Algos/CountingSortTrainer.jsx` |
| 26 | Merge Sort | `./trainers/Theoretische Informatik/Sortier-Algos/MergeSortTrainer.jsx` |
| 27 | Quick Sort | `./trainers/Theoretische Informatik/Sortier-Algos/QuickSortTrainer.jsx` |
| 28 | Radix Sort | `./trainers/Theoretische Informatik/Sortier-Algos/RadixSortTrainer.jsx` |
| 29 | Probeklausur · Teil 2 | `./trainers/Theoretische Informatik/Probeklausuren/ProbeklausurTeil2.jsx` |
| 30 | Hashmaps verstehen | `./trainers/Theoretische Informatik/Hashing/HashmapErklaerer.jsx` |
| 31 | Übung 07 · Hashing & Suchstrukturen | `./trainers/Theoretische Informatik/Hashing/Uebung07.jsx` |
| 32 | Hashing im Überblick | `./trainers/Theoretische Informatik/Hashing/vl11_hashing_uebersicht.jsx` |
| 33 | Tiefensuche trainieren | `./trainers/Theoretische Informatik/Graph-algorithmen/DFSTrainer.jsx` |
| 34 | Übung 08 · Graphalgorithmen | `./trainers/Theoretische Informatik/Graph-algorithmen/Uebung08.jsx` |
| 35 | Breitensuche | `./trainers/Theoretische Informatik/Graph-algorithmen/vl13_graphen_BFS.jsx` |
| 36 | Dijkstra-Algorithmus | `./trainers/Theoretische Informatik/Graph-algorithmen/vl14_dijkstra.jsx` |
| 37 | Tiefensuche & topologisches Sortieren | `./trainers/Theoretische Informatik/Graph-algorithmen/vl15_tiefensuche.jsx` |
| 38 | Fullstack Schritt für Schritt | `./trainers/Web-Eng2/Grundlagen/fullstack_verstehen.jsx` |
| 39 | App.js Level Quest | `./trainers/Web-Eng2/ai-prompt-library/AppJs_Level_Quest.jsx` |
| 40 | Frontend-JavaScript verstehen | `./trainers/Web-Eng2/ai-prompt-library/Frontend_JavaScript_verstehen.jsx` |
| 41 | Webprojekt-Lernreise | `./trainers/Web-Eng2/ai-prompt-library/LernpfadErklaerer.jsx` |
| 42 | Webprojekt-Architektur | `./trainers/Web-Eng2/ai-prompt-library/ProjektArchitekturTrainer.jsx` |
| 43 | Entscheidungen mit KI vorbereiten | `./components/Archiv/AI business/decision.jsx` |
| 44 | Business-Systeme & Integration | `./components/Archiv/Watch later/business-systems.jsx` |
| 45 | CYK verstehen | `/cyk/` |
| 46 | Compiler & Parser verstehen | `/compiler-parser/` |
| 47 | CYK-Ableitung visuell | `/labs/cyk-ableitung-visuell/` |
| 48 | FSA-Cheatsheet | `/labs/fsa-cheatsheet/` |
| 49 | FSA-Lernreise | `/labs/fsa-lernreise/` |
| 50 | FSA-Grundlagenprüfung | `/labs/grundlagen-pruefung/` |
| 51 | Reguläre Ausdrücke · Prüfung | `/labs/regulaere-ausdruecke-pruefung/` |
