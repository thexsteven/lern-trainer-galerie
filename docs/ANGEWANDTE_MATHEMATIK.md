# Angewandte Mathematik: Quellen und Abdeckung

Leitquelle: `skript_studierende.pdf`, Dürrschnabel, T4INF2001, MOS-TINF25A,
29.08.2026, 62 PDF-Seiten. Gedruckte Seite n = PDF-Seite n+4.
Die Originale bleiben außerhalb des Repositorys.

| Kapitel | Lernziele / Übungsfamilien | Gedruckt / PDF | Trainer | Prüfung |
| --- | --- | --- | --- | --- |
| 1 | 1.1 Niveaumengen; 1.2 ReLU; 1.3 Schichten | 1–6 / 5–10 | Funktionen | A/B/C: Feld und Komposition |
| 2 | 2.1 Gradient/Richtung; 2.2 Geometrie; 2.3 Laplace; Topologie/Stetigkeit | 7–12 / 11–16 | Funktionen | A/B/C: Ableitungen |
| 3 | 3.1 Tangentialebene; 3.2 Jacobi; 3.3 Kettenregel | 13–17 / 17–21 | Funktionen | A/B/C: Linearisierung |
| 4 | 4.1 Graph; 4.2 Sigmoid; 4.3 Adjoint-Summe; Forward-Mode | 18–25 / 22–29 | Autodiff | A/B/C: unterschiedliche Graphen |
| 5 | 5.1 Extrema; 5.2 Taylor; 5.3 Sylvester/3D | 26–31 / 30–35 | Autodiff | A/B/C: Taylor/Klassifikation |
| 6 | 6.1 Gerade; 6.2 ohne Bias; 6.3 QR; Rang/Kondition | 32–40 / 36–44 | Regression | A/B/C: unterschiedliche Modelle |
| 7 | 7.1 GD; 7.2 Momentum; 7.3 Mini-Batch; MLP/Verlust | 41–47 / 45–51 | Autodiff | A/B/C: unterschiedliche Updates |
| 8 | 8.1 Fubini; 8.2 Normalbereich; 8.3 Polar; Dichten/Randdichten | 48–53 / 52–57 | Integrale | A/B/C: Gebiet, Polar, Dichte |
| 9 | 9.1 Lagrange; 9.2 PCA; 9.3 Rechteck | 54–58 / 58–62 | Regression | A/B/C: Nebenbedingung und PCA |

Jede nummerierte Familie erhält eine leichte Vorstufe, eine gestützte
Skriptanwendung, eine eigene selbstständige Variante und eine strukturell neue
Transferaufgabe. Quellen und Bewertungsfelder stehen unmittelbar in den Daten.
Die Abdeckungstests prüfen diese Zuordnung; numerische Tests prüfen Lösungen
zusätzlich mit unabhängig berechneten Ableitungen, Matrixprodukten und Integralen.

## Ergänzungen und Grenzen

- Heine Differentialrechnung: 30 Seiten, Blatt 22–51. Fehlerfortpflanzung:
  Abschnitt 11, Blatt 50–51 / PDF 29–30; Lagrange: Abschnitt 10,
  Blatt 46–49 / PDF 25–28. Handschriftliche Formeln visuell geprüft.
- Heine Integrale: 7 Seiten, Blatt/PDF 1–7. Normalbereiche und Reihenfolge:
  Blatt 3–5; Dreifachintegrale und Achtelkugel: Blatt 6–7.
- Die HTML-Lernlandkarte dient nur als Einstiegshilfe; fachliche Leitquelle bleibt
  das PDF. `tasks/1_Grundlagen.pdf` ist fachfremd und ausgeschlossen.
- Fehlerrechnung/Dreifachintegrale: Vertiefung, Prüfungsrelevanz unbelegt.
- Differentialgleichungen: nur in der Modulbeschreibung erwähnt, offene
  Stoffabgrenzung; keine erfundenen Prüfungsaufgaben.
- Termin laut Skript iv / PDF 4: 23.11.2026, 09:00, 60 Minuten, handschriftlich,
  Taschenrechner und beidseitiges handgeschriebenes A4-Blatt. Nicht aktuell bestätigt.
- Keine Altklausur oder verbindliche Gewichtung. Alle drei Prüfungen sind eigene
  skriptbasierte Probeklausuren mit einer selbst festgelegten 100-Punkte-Verteilung.

## Fachliche Präzisierungen gegenüber der Leitquelle

- Beispiel 6.1, S. 34 / PDF 38: Das angegebene System für (1,2),(2,3),(3,5)
  liefert tatsächlich β₀=1/3, β₁=3/2. Die gedruckten Koeffizienten sind falsch.
- Strikte Konvexität der Regression verlangt vollen Spaltenrang; QR ist erst
  mit einer Vorzeichenkonvention für die Diagonale eindeutig.
- Positive definite Hesse am stationären Punkt ist hinreichend, nicht notwendig
  für ein strenges Minimum (Gegenbeispiel x⁴+y⁴). Semidefinitheit entscheidet nicht.
- Die feste GD-Schranke gilt für positiv definite quadratische Probleme.
  Der Randwert ist nicht als sichere Lernrate zugelassen.
- Kreuzentropie −ln(p) wächst logarithmisch in 1/p; keine pauschale Behauptung
  exponentieller Bestrafung. SGD garantiert kein Entkommen aus jedem Sattelpunkt.

## Leistungsmaßstab

Gelesen, bearbeitet, mit Hilfe, erster Versuch ohne Hilfe und spätere Bestätigung
werden getrennt erfasst. Nur neue selbstständige/Transferaufgaben zählen für die
Kapitelquote. Jede falsche Erstabgabe bleibt im Nenner. Kleine Stichproben werden
angezeigt. Bekannte Aufgaben und geöffnete Lösungen erzeugen keinen neuen Nachweis.
Die lokalen Wiederholungstermine liegen nach 1, 3 und 7 Tagen.

Trainingsziel: alle Kernziele geübt, jedes Kapitel mindestens 80 %; drei verschiedene
neue Prüfungen je mindestens 90/100 in 60 Minuten, letzte an einem späteren Tag.
Selbstbewertung und automatische Punkte bleiben getrennt. Dies ist ein konservativer,
nicht validierter Lernmaßstab, keine Vorhersage der echten Klausurnote.

## Umsetzung und lokale Abnahme (23.09.2026)

- Genau fünf Katalogangebote mit stabilen Slugs `mathe-funktionen`,
  `mathe-autodiff`, `mathe-regression`, `mathe-integrale`, `mathe-klausurwerkstatt`.
  Die bestehende Bibliothek, Anheften und Prüfungsfokuslisten bleiben zuständig.
- 31 Einheiten mit je vier Aufgabenstufen, vier zusammenhängende Abschlüsse,
  acht Vorwissensthemen mit je zwei Diagnoseaufgaben. Alle 27 Skriptfamilien
  sind enthalten; Topologie und Dichten ergänzen den Kernstoff.
- Drei feste, strukturell verschiedene Klausuren: je 60 Minuten und 100 Punkte,
  davon 80 automatisch geprüft und 20 ausdrücklich selbst bewertet.
- Gemeinsamer versionierter lokaler Mathe-Lernstand, Wiederholungsfälligkeiten,
  eigene Merkzettelnotizen und getrennte Leistungsarten. Der Aufgabenpool ist
  endlich: bekannte Aufgaben werden als Wiederholungen gekennzeichnet.
- `npm test`: 37 Tests erfolgreich (22 Node-Tests, 15 Vitest-Tests).
  Abdeckung, Eingabeprüfung, Gegenbeispiele, PCA-Vorzeichen, Erstversuche,
  Wiederholungen, isoliertes Zurücksetzen und Zielkriterien sind geprüft.
- Unabhängige Rechenorakel prüfen jedes automatische Ergebnis der 27
  Skriptübungen, vier Abschlüsse und 15 Klausuraufgaben. Alle Übungsaufgaben
  werden zusätzlich auf Metadaten, gültige Referenzantworten und Leereingaben
  geprüft; das ist für eigene Lernvarianten kein unabhängiges Rechenorakel.
- Timerende und Wiederaufnahme wurden mit kontrollierter Testuhr geprüft;
  eine echte 60-minütige Wartezeit war dafür nicht nötig.
- Browserprüfung bei Desktop- und iPhone-Breite (390 px): fünf Karten,
  Direktlinks, Diagnose, falsche/korrekte/ungültige Antworten, Hinweis,
  zweiter Versuch, Lösung, frische Aufgabe und Speicherung nach Reload.
  Eine komplette Klausur wurde über die Oberfläche abgegeben und getrennt
  mit 80 automatischen plus 20 Selbstbewertungspunkten ausgewertet.
  Reload erhält Restzeit und Antworten, kennzeichnet den Lauf als unterbrochen.
- Integralstreifen, PCA-Regler per Tastatur, Rechengraph und berechneter
  Optimierungsschritt im Browser geprüft. Kein horizontaler Überlauf in den
  geprüften Ansichten. Breitenprüfung ersetzt keinen Test auf einem echten
  iPhone/Safari; Touch-Gesten wurden nicht auf einem physischen Gerät geprüft.
- `npm run build` und `git diff --check` erfolgreich. Kein Lint-Skript im Projekt.
  Keine neuen Abhängigkeiten, kein Commit, Push oder Deployment.

Die Tests liegen in `src/appliedMath/model.test.js`,
`src/appliedMath/mathematics.test.js` und `src/appliedMath/Course.test.jsx`;
die Katalogprüfung steht in `src/catalog.test.js`.

## UI-/UX-Überarbeitung

Trainerwechsel als aufklappbares Menü, ruhigere Flächen und klare aktive Zustände.
Auf dem Handy ersetzt eine Themenauswahl die lange Seitenleiste. Lernschritte
zeigen Position und Lernphase; nach dem Transfer führt der nächste Schritt zur
nächsten Einheit. Quellen, Voraussetzungen und Eingabeformat bleiben aufklappbar.
Rückmeldungen stehen zusätzlich direkt am Eingabefeld, mit Text und zugänglicher
Fehlerzuordnung statt ausschließlich Farbe. Der Klausurstart fasst Zeit, Aufgaben
und Punkte zusammen und erklärt die Freischaltung der Startbuttons.

Browserabnahme der fünf Einstiege bei 1280 und 390 px sowie mobiler Aufgaben-,
Leistungs-, Merkzettel- und Quellenansichten: kein horizontaler Seitenüberlauf.
Falsche und richtige Eingaben, Trainerwechsel und mobile Themenwahl geprüft;
automatisierter Test sichert den Übergang zur nächsten Einheit und den Erhalt
bereits eingegebener Antworten. Keine Browserwarnungen/-fehler im Prüflauf.
