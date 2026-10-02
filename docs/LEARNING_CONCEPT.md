# Lernkonzept und Umsetzung

Bestätigt am 02.10.2026. Die vorhandene React/Vite-Anwendung bleibt erhalten.

## Gemeinsame Regeln

- Ein Fach enthält festgelegte Pflicht-Einheiten. Eine Nachweisrunde hält ihre Pflichtaufgaben beim Start fest.
- Die erste gültige Abgabe beginnt einen Versuch. Öffnen, Pausieren und Neuladen erzeugen keinen zusätzlichen Versuch.
- Vollständig heißt: jede Pflichtaufgabe beantwortet. Falsche Antworten verhindern Vollständigkeit nicht.
- Fehlerfrei heißt: jede Erstantwort richtig, ohne aufgerufene Hilfe oder Lösung. Korrekturen überschreiben keinen Erstfehler.
- Zwei vollständige fehlerfreie Nachweisrunden schließen eine Einheit ab. Gleicher Tag und gleiche Varianten sind erlaubt. Ein späterer Fehler setzt den Abschluss nicht zurück.
- Abschlussfortschritt ist der Durchschnitt der Einheitswerte 0/50/100 Prozent. Diagnosen, Selbsteinschätzung und Lernmaterial werden getrennt ausgewertet.

## Architektur

`learningProgram.js` definiert fünf Fächer und den aktuellen Einheitsumfang. `learningControl.js` besitzt generische Runden, Aufgabenresultate, Hilfemarkierungen, pausierte Drafts und daraus abgeleiteten Fortschritt. Es erzeugt keine fachlichen Aufgaben. Trainer definieren und bewerten ihre eigenen Aufgaben; `App.jsx` verbindet sie mit der gemeinsamen Steuerung. `LearningOverview.jsx` zeigt Einheiten und die gespeicherte Historie.

Der vorhandene lokale Speicherschlüssel bleibt bestehen. Alte Tagesnachweise bleiben separat erhalten. Nur vollständig rekonstruierbare Runden nach dem aktuellen Modell erzeugen einen Abschluss. Mathe behält ergänzende Übungsdaten, Notizen und Probeklausuren in seinem bisherigen Speicher; seine Pflicht-Nachweisrunden laufen über die Zentrale. `personalStore.js` verwaltet weiterhin persönliche Prüfungslisten und Anheftungen.

## Aktueller Umfang

18 Pflicht-Einheiten: acht Mathe-Themen zur belegten Differentialrechnung, drei Netztechnik-Grundlagen, drei Systemnah-Grundlagen, drei FSA-Einheiten und eine Web-Grundlageneinheit. Die zugeordneten Originalquellen und ergänzenden eigenen Aufgaben bleiben kenntlich. Nicht belegte Mathe-Themen und das alte FSA-Handout werden nicht automatisch zu Pflichtstoff.

Diese Einheiten bilden nicht den gesamten Semesterstoff ab. Reguläre Ausdrücke sind als dritte FSA-Einheit mit freien Wortaufgaben ergänzt. Weitere vorhandene Netztechnik-Schichten, FSA-Konstruktionen und Web-Projektthemen sind noch nicht vollständig als zentrale Nachweisrunden aufbereitet. Der vorhandene Web-Lernpfad kennzeichnet geplante Einheiten; die Portfolio-Prüfung bleibt praktische Projektarbeit. Multiple Choice ersetzt keine Code- oder Projektbewertung.

HTML-Labore öffnen innerhalb des Trainerrahmens mit Rückweg und Kennzeichnung als Lernmaterial. Ihre eigenen Selbstmarkierungen erzeugen keine automatisch geprüften Einheitsabschlüsse. Andere vorhandene Spezialtrainer behalten ihre fachliche Gestaltung; das UI/UX-Audit dokumentiert gezielte Verbesserungen und offene Prüftiefe.

## UX und Verifikation

Der Menüpunkt „Lernplan“ zeigt den empfohlenen nächsten Schritt mit Begründung, Tages- und Wochenbudgets, Fachanteilen und bekannten Wiederholungsterminen. Die Einheiten stehen in einer nummerierten, begründeten Reihenfolge. Die erste offene Einheit jedes Fachs ist als nächster Schritt markiert; die Auswahl bleibt frei. FSA und Grundlagentrainer zeigen diese Orientierung auch während der Aufgabenbearbeitung.

Die automatische Auswahl setzt offene Runden fort, bevorzugt danach fällige Wiederholungen und offene Einstiegstests und wählt anschließend die erste offene Einheit eines Fachs. Fachbudgets und Prioritäten entscheiden zwischen den Fächern. Erfolgreiche Wiederholungen verlängern das Intervall auf drei bzw. sieben Tage, erzeugen aber keine Nachweise. Diagnosen erzeugen keine Wiederholungstermine. Nach drei falsch gespeicherten Runden derselben Einheit stehen bis zu 15 zusätzliche Minuten pro Lerntag und insgesamt höchstens 60 Reserveminuten pro Woche bereit. Wochenenden bleiben frei.

Die Zeitanzeige bezeichnet gespeicherte Rundendauer. Pausen beim Wechsel in andere Runden zählen nicht; eine weiterhin aktive Runde sammelt Zeit bis zum Speichern. Alte gespeicherte Dauerwerte bleiben erhalten. Künftige Einheiten erhalten keine festen Termine: Der nächste Schritt wird aus dem gespeicherten Verlauf neu berechnet.

Die Oberfläche verbindet eine ruhige Fachübersicht mit dunklen Aufgabenbühnen, fachlichen Diagrammen und zwei sichtbaren Nachweismarken. Bibliotheksfilter und Rückkehrkontext bleiben beim Trainerbesuch erhalten. Globale Suche funktioniert auch im Trainer. Speicherfehler dürfen nicht als dauerhafter Erfolg erscheinen.

Regressionstests prüfen unter anderem gleiche Tage, dauerhafte Abschlüsse, doppelte Speicheraufrufe, Hilfe-/Fehlerkorrekturen, Neuladen, Einheitenwechsel, Diagnose-Speicherbestätigung, Tastaturbedienung und ungültige Eingaben. Nach Änderungen folgen `npm test`, `npm run build` und direkte Browserprüfungen. Die Aussage „verbessert“ bezieht sich auf nachweisbare Bedien- und Verhaltenskorrekturen; die visuelle Wirkung wird an konkreten Ansichten beurteilt. Eine Lernerfolgsgarantie wird daraus nicht abgeleitet.
