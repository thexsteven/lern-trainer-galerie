---
type: note
title: Wortlauf-Lerntrainer – Prüfprotokoll
status: reference
updated: 2026-09-14
tags: [lerntrainer, verifikation]
---

## Ausgeführte Prüfungen

### Erneute Prüfung nach Stevens Vorwissensantworten (14.09.2026)

- Vorhandenen, noch nicht eingecheckten Trainer übernommen und klein ergänzt: bestätigte Einstiegsantworten dokumentiert; Alphabet, Wort, ε, Zustand und Diagrammsymbole vor den formalen Details sichtbar erklärt.
- Originaldateien erneut gelesen: fünf PDFs, zusammen 600 Seiten. Automat und Akzeptanzdefinition auf gerenderten PDF-Seiten 69–70 visuell bestätigt; weitere Korrekturhinweise der Ergänzungen in der Materialübersicht festgehalten.
- Produktionsbuild nach der Änderung erfolgreich. Tatsächlich implementierte Übergangstabelle und Lauf-Funktion für alle 511 Wörter bis Länge 8 gegen das unabhängige Kriterium „Anzahl b, bei 2 gedeckelt“ geprüft, einschließlich jedes Präfixzustands und ε.
- Browser erneut geprüft: Galerie öffnet; Anfänger-Erklärung und persönlicher Einstieg sichtbar; drei Beispielschritte korrekt; Quiz falsch/richtig; Anwendung falsch; Präfixdiagnose richtig/falsch/kein Ansatz; alle drei Hilfestufen; erneuter Versuch korrekt; eigenes Wort aab; ähnliche Aufgabe baab mit Hilfe; Transfer aaba ohne Hilfe; Rückblick; Hilfe bei falschem weiteren Transfer erst nach Anforderung. Alle hierfür eingegebenen Übungsantworten sind technische Testdaten.
- Desktop visuell geprüft. Bei 390 px eingestellter mobiler Breite kein horizontaler DOM-Überlauf; anschließend Browsergröße zurückgesetzt. Keine Browserwarnungen oder -fehler im getesteten Ablauf.
- OBS 32.2.2 gefunden und Oberfläche gelesen; vorhandene Szene mit Laptop-/Monitorquellen und gestoppte Aufnahme erkannt. Klick auf die Szenenauswahl scheiterte zunächst mit `coordinate input geometry is unavailable`, nach erneuter Fensteraktivierung mit `point (810, -94) is outside window bounds`. Automatische Bedienung daraufhin beendet. Keine Aufnahme gestartet, keine erfolgreiche Szenenänderung bestätigt.

### Bereits vorhandenes Prüfprotokoll

- `npm run build`: Vite-Produktionsbuild erfolgreich. Das Projekt definiert kein separates Lint- oder Testskript.
- Automatendefinition gegen gerenderte Originalseiten 69–70 des Hauptskripts geprüft; Erklärung und Konfigurationen mit S. 66–72 abgeglichen.
- Implementierte Übergangsfunktion mit unabhängigem Zählkriterium geprüft: alle 511 Wörter über `{a,b}` bis Länge 8 einschließlich ε. Ergebniszustand entspricht `min(2, Anzahl b)`; Lauflänge entspricht Wortlänge + 1.
- Browser: Galerieeintrag „Wortlauf Lerntrainer“ sichtbar und geöffnet.
- Einstieg: drei richtige Testantworten ausgewertet. Diese Testantworten sind keine Antworten des Nutzers.
- Beispiel `aba`: drei Schritte bis Zustand 1, Rest ε und Akzeptanz.
- Quiz: falsche Antworten, Erläuterung, Korrektur und beide richtigen Antworten geprüft.
- Anwendung `abab`: falsche Antwort 1/Ja löst Diagnose nach Präfix `ab` aus. Richtiger Präfixzustand 1 lässt Fehlerursache offen; falscher Zustand 0 erklärt die Abweichung; „Kein Ansatz“ erklärt den ersten Schritt.
- Hilfestufen: Hinweis, Teillauf und vollständiger Lauf geprüft. Erneute Antwort 2/Nein korrekt.
- Eigenes Wort `aab`: als akzeptiert geprüft.
- Ähnliche Aufgabe `baab`: mit Hinweis korrekt gelöst.
- Transfer `aaba`: ohne geöffnete Hilfe korrekt gelöst. Diagnose, Hinweis und Cheat Sheet sind vor Hilfsanforderung ausgeblendet.
- Weiterer Transfer `baba`: falsche Antwort zeigt zunächst nur Wiederholungs-/Hilfsoption; „Ich brauche Hilfe“ schaltet die Präfixdiagnose frei.
- Rückblick: `abab` mit zwei Versuchen/Unterstützung, `baab` mit Unterstützung, `aaba` ohne aufgerufene Hilfe korrekt protokolliert.
- Desktopdarstellung visuell geprüft. Mobile Breite 390 px geprüft: kein horizontaler Dokumentüberlauf; Formular und Navigation nutzbar. Temporäre Browsergröße anschließend zurückgesetzt.
- Browserkonsole nach dem zentralen Lernbogen ohne Warnungen/Fehler.

## Grenzen

- Keine dauerhafte Speicherung; eingegebene Notizen und Übungszustände bleiben beim Wechsel der Lernschritte erhalten, gehen aber beim Schließen/Neuladen des Trainers verloren.
- Freitext wird nicht semantisch bewertet. „Ohne Hilfe“ bedeutet ohne im Trainer aufgerufene Unterstützung, nicht überwachte Abwesenheit externer Hilfsmittel.
- Weitere Skriptthemen sind als noch offen gekennzeichnet. Prüfung des aktuellen Klausurumfangs steht aus.
- Die 42-Sekunden-Regie ist ausgearbeitet; Filmaufnahme, Ton, Schnitt und Prüfung der tatsächlichen Exportdauer stehen noch aus.
- Lokale Vorschau bereitgestellt. Keine Veröffentlichung und kein Commit durchgeführt.
