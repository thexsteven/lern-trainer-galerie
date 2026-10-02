---
type: note
title: Wortlauf-Lerntrainer – Regie für eine professionelle 42-Sekunden-Demo
status: active
updated: 2026-09-14
tags: [lerntrainer, video, automaten]
---

## Aussage und Format

„Ich verstehe den Ablauf, prüfe mein Wissen, untersuche einen Fehler und löse eine neue Aufgabe ohne Zettel.“ Die Aufnahme zeigt einen nachvollziehbaren Lernprozess. Sie behauptet weder Lernen in 42 Sekunden noch eine KI-Diagnose im laufenden Produkt. Die KI hat Quellen aufbereitet; die Galerie prüft fest implementierte Aufgaben.

Zieldauer: **42 Sekunden**, mit maximal 3 Sekunden Reserve. Format: 1920 × 1080, 30 fps. Der komplette Trainer bleibt für Lernen im eigenen Tempo verfügbar. Eine stumme Bildfassung mit Texteinblendungen ist exportiert; Sprecheraufnahme steht noch aus.

## Exportierte Bildfassung

`C:/Users/resolve_test/Videos/Lerntrainer-Demo/Wortlauf-Lerntrainer-42s.mp4`: 42,000 Sekunden, H.264, 1920 × 1080, 30 fps, ohne Tonspur. Vollständig fehlerfrei decodiert; Kontaktbogen und ausgewählte Vollbilder für Titel, Wortlaufabschluss, unterstützte Korrektur und Transfererfolg geprüft. Galerie und schwarze Aufnahmeränder sind aus dem Bildausschnitt entfernt. Quellenzeile und Abschnittsbeschriftungen sind eingebrannt. Rohdateien unverändert.

Tatsächlicher Schnitt: 0–3 Titel, 3–9 Wortlauf, 9–14 Quiz, 14–18 Fehler, 18–23 Diagnose, 23–28 Hinweis/Zettel, 28–31 unterstützte Korrektur, 31–35 erster erfolgloser Transfer, 35–42 Selbstkorrektur ohne aufgerufene Hilfe. Fehler und Diagnose verwenden dieselbe Aufnahme (2/Ja), damit keine abweichenden Eingaben als durchgehender Versuch erscheinen. Der ursprüngliche Schnittplan unten ist die Aufnahmevorlage; maßgeblich für die Bildfassung ist dieser Abschnitt.

Reproduzierbarer Schnitt: `C:/Users/resolve_test/Videos/Lerntrainer-Demo/render.py`. Passender Sprechertext mit Zeitmarken: `C:/Users/resolve_test/Videos/Lerntrainer-Demo/Sprechertext.txt`. Stimme noch nicht aufgenommen oder abgemischt.

## Zugang und Vorbereitung

1. Im Repository `C:/AIOS/Dev/studium/lern-trainer` mit `npm run dev` starten; in dieser Sitzung läuft die Vorschau unter `http://127.0.0.1:5173/`.
2. Galerie → **Formale Sprachen & Automaten → Endliche Automaten → Wortlauf Lerntrainer**.
3. „Aufnahme vorbereiten“ zeigt eine Regiehilfe. „Aufnahmestart zurücksetzen“ setzt den Beispiel-Wortlauf, Übungsindex und Beobachtungen zurück und öffnet „Verstehen“. Danach Aufnahmehinweise ausblenden. Der Einstieg ist für die reguläre Nutzung im Tab „Einstieg“ erreichbar.
4. Alle Clips in derselben Fenstergröße und bei demselben Zoom aufnehmen. Den Trainerbereich einrahmen; Browserleiste und private Umgebung aus dem Ausschnitt halten. Den Ausschnitt vor Beginn festlegen und während der Aufnahme nicht ändern.
5. Auflösungsziel 1080p, Bedienoberfläche im Export lesbar halten; nicht die gesamte lange Seite verkleinern. Pro Clip zum relevanten Bereich scrollen, dann den Bildausschnitt ruhen lassen. Bei Bedarf in der Schnittfassung auf ein Eingabefeld oder den Diagnoseblock schneiden.
6. Die Zustände für jeden Clip zuerst vorbereiten, dann mit 1–2 Sekunden Vor- und Nachlauf aufnehmen. Diese Griffe beim Schnitt entfernen. Die 42 Sekunden sind die Schnittfassung, nicht eine einzige durchgehetzte Bediensequenz.

## Schnittplan und Sprechertext

| Zeit | Bild und tatsächliche Bedienung | Sprechertext | Texteinblendung |
| --- | --- | --- | --- |
| 00–03 | Titel „Ein Wort. Ein Weg.“; kurzer Schnitt auf „Verstehen“. | „Ich will den Ablauf verstehen und selbst anwenden.“ | Verstehen → Anwenden |
| 03–09 | Beispiel `aba`. Dreimal „Nächstes Zeichen“; jeweils kurze Pause. Zustand 1 und Rest ε am Ende zeigen. | „Der Automat liest jedes Zeichen. Erst am Wortende entscheidet der Zustand.“ | Ein Zeichen. Ein Übergang. |
| 09–14 | Tab Quiz, beide richtigen Antworten vorausgewählt; „Quiz prüfen“. | „Ein kurzes Quiz prüft die Regeln.“ | Wissen abrufen |
| 14–19 | Anwenden, Wort `abab`. Zustand **1**, Akzeptanz **Ja** als bewusst inszenierten Fehler auswählen; „Antwort prüfen“. | „Dann löse ich selbst. Bei einem Fehler prüfe ich zuerst einen Zwischenschritt.“ | Beispiel-Fehler · inszeniert |
| 19–25 | Diagnose „Nach ab: 0“ klicken. Nur Diagnosebereich zeigen; erste zwei Übergänge sind sichtbar. | „Hier war schon das Ablesen des Präfixes falsch.“ | Zwischenschritt statt Raten |
| 25–32 | „1 · Hinweis“ klicken, Hinweis und Cheat-Sheet-Vorschlag kurz zeigen. Danach Zustand **2**, Akzeptanz **Nein**, „Antwort prüfen“. | „Ein gezielter Hinweis hilft. Ich korrigiere meinen Lauf und notiere die Regel.“ | Hinweis → neuer Versuch |
| 32–39 | Schnitt auf „Ohne Hilfe“, Wort `aaba`. Zettel sichtbar beiseitelegen oder knappe Einblendung; Zustand **1**, **Ja**, „Antwort prüfen“. | „Anschließend löse ich ein neues Wort ohne Cheat Sheet.“ | Neue Aufgabe · ohne Zettel |
| 39–42 | Korrektes Ergebnis kurz stehen lassen; optional Rückblick mit unterstützter und selbstständig gelöster Aufgabe. | „Der Trainer hält fest, was ich tatsächlich gelöst habe.“ | Schritt für Schritt selbstständiger |

Die Diagnoseantwort „Nach ab: 0“ wird für die Demonstration absichtlich falsch gewählt. Sie liefert tatsächlich einen Beleg für einen Fehler in diesem Teillauf. Sie ist **keine Behauptung über Stevens Vorwissen**. Die alternative Diagnoseantwort „Nach ab: 1“ darf nicht als belegte Fehlerursache inszeniert werden: Dann war der Präfix korrekt, und der Trainer lässt die Ursache ausdrücklich offen.

## Fachliche Kontrolle der gezeigten Zustände

- Definition: `FSA-handout (old).pdf`, S. 69. Start 0, F = {1}; a bleibt in 0/1/2; b führt 0 → 1 → 2 → 2.
- Akzeptanz und Konfigurationen: gleiche Datei, S. 70 und 72. Nur der Zustand nach vollständiger Eingabe entscheidet.
- `aba`: 0 → 0 → 1 → 1, akzeptiert.
- `abab`: 0 → 0 → 1 → 1 → 2, verworfen. Präfix `ab` endet in 1.
- `baab`: 0 → 1 → 1 → 1 → 2, zusätzliche ähnliche Übung mit verfügbaren Hilfen im vollständigen Trainer.
- `aaba`: 0 → 0 → 0 → 1 → 1, akzeptiert. Für den gezeigten Transfer keine Hilfe öffnen.
- Die Übungswörter sind eigene didaktische Beispiele am Skriptautomaten.

## Gestaltung und Ton

- Ein konsistenter Bildausschnitt pro Szene; nur harte Schnitte oder eine kurze Überblendung zwischen Abschnitten. Keine dekorativen Zoomfahrten.
- Untertitel maximal zwei Zeilen, hoher Kontrast, nicht über Formularen oder Zuständen platzieren. Schlüsselwörter wie „Zwischenschritt“ und „ohne Zettel“ konsistent verwenden.
- Pro Szene eine kurze Einblendung; den eingeblendeten Sprechertext nicht mit zusätzlichen langen Erklärungen konkurrieren lassen.
- Stimme separat und ruhig aufnehmen; Klickgeräusche leise halten. Musik ist optional und darf Sprache nie verdecken. Bei Musik nur Material verwenden, für das Nutzungsrechte vorliegen.
- Quellenzeile im Trainer lesbar lassen; alternativ in der Schnittfassung eine ruhige Fußzeile „FSA-handout (old), S. 69–72 · eigene Übungswörter“.
- Den Text einmal mit Stoppuhr einsprechen. Wenn über 42 Sekunden: Pausen oder Text kürzen, nicht die Stimme unnatürlich beschleunigen. Die fertige Exportdatei muss unter 45 Sekunden bleiben.

## Abnahme des späteren Films

### Vorhandenes Rohmaterial

- Clip 5: `C:/Users/resolve_test/Videos/2026-09-14 11-31-24.mkv`, 10,566 Sekunden. Geprüfte Bildstichproben zeigen Korrektur von 1/Nein auf 1/Ja, erneute Prüfung und „Richtig gelöst … Ohne aufgerufene Hilfe“. In der Endfassung zusammen mit dem vorherigen erfolglosen Versuch verwendet; kein Erfolg beim ersten Versuch behauptet.

- Clip 4: `C:/Users/resolve_test/Videos/2026-09-14 11-27-55.mkv`, 37,366 Sekunden. Kontaktbogen alle vier Sekunden und Schlussbild bei Sekunde 36 geprüft. Beginn bestätigt erfolgreiche Korrektur von abab mit verwendeter Unterstützung. Danach Wechsel zu „Ohne Hilfe“, Eingabe 1/Nein und Rückmeldung „Noch nicht passend“. Keine Hilfe sichtbar aufgerufen. Als selbstständiger Versuch verwendbar, nicht als erfolgreich gelöster Transfer. Für den geplanten erfolgreichen Abschluss fehlt noch ein geprüfter neuer Versuch.

- Clip 3b: `C:/Users/resolve_test/Videos/2026-09-14 11-25-00.mkv`, 33,866 Sekunden, H.264, 1920 × 1080, 30 fps. Kontaktbogen und Schlussbild bei Sekunde 33 geprüft. Enthält ausgeführte falsche Präfixdiagnose sowie geöffneten Hinweis und Cheat-Sheet-Vorschlag. Am Ende steht 2/Nein in den Feldern, aber die Antwort wurde noch nicht erneut geprüft; weiterhin Diagnosemeldung statt Erfolgsmeldung. Nächsten Clip mit „Antwort prüfen“ beginnen und danach Transfer aufnehmen. Zu Beginn steht 2/Ja statt 1/Ja wie in Clip 3: beim Schnitt keinen nahtlosen identischen Eingabezustand vortäuschen.

- Clip 3: `C:/Users/resolve_test/Videos/2026-09-14 11-22-46.mkv`, 36,366 Sekunden, H.264, 1920 × 1080, 30 fps. Bildstichproben zunächst alle fünf Sekunden, anschließend sekündlich von 18–35 Sekunden geprüft; Ergebnis bei Sekunde 33 in voller Auflösung bestätigt. Zeigt falsche Antwort 1/Ja für abab, die angebotene Präfixfrage und die erfolgreiche Korrektur auf 2/Nein. Diagnoseantwort und Hinweis wurden nicht aufgerufen: Die Erfolgsmeldung bestätigt „Ohne aufgerufene Hilfe“. Für Fehlerdarstellung nutzbar; für die geplante Diagnose-/Hilfesequenz ist eine Ergänzungsaufnahme erforderlich. Nicht als Korrektur mithilfe eines Hinweises darstellen.

- Clip 2: `C:/Users/resolve_test/Videos/2026-09-14 11-21-20.mkv`, 25,833 Sekunden, H.264, 1920 × 1080, 30 fps. Metadaten und Bildstichproben alle zwei Sekunden geprüft: beide richtigen Quizantworten ausgewählt, anschließend „Beide Antworten stimmen“ sichtbar. Brauchbarer Ausschnitt ungefähr 16–23 Sekunden; finale Schnittgrenzen noch bildgenau bestimmen. Am Ende wird gescrollt, diesen Teil weglassen. Für die Endfassung Quizbereich vergrößern und schwarze Seitenränder entfernen. Noch fehlend: inszenierter Fehler mit Diagnose/Hilfe/Korrektur, Transfer und Sprecheraufnahme.

- Clip 1: `C:/Users/resolve_test/Videos/2026-09-14 11-18-18.mkv`, 22,800 Sekunden, H.264, 1920 × 1080, 30 fps. Metadaten und Bildstichproben geprüft. Enthält Titel, Scrollen zur Erklärung und vollständigen Lauf von `aba`: Start 0, nach a weiterhin 0, nach ab Zustand 1, nach aba Zustand 1 mit Rest ε. Brauchbarer Lauf ungefähr 13,5–17 Sekunden; die Zwischenzustände können im Schnitt etwas länger stehen bleiben. Danach wird zurückgesetzt; diesen Nachlauf entfernen. Browserleiste ausgeblendet, seitliche schwarze Ränder noch vorhanden. Für die Schnittfassung auf den Trainerbereich zuschneiden. Noch fehlend: Quiz, inszenierter Fehler mit Diagnose/Hilfe/Korrektur, Transfer und Sprecheraufnahme.

OBS-Vorbereitung am 14.09.2026: Nach Rücksetzen der abgedockten OBS-Bereiche funktioniert die Bedienung. Neue Szene „Lerntrainer – Wortlauf“, Quelle „Fensteraufnahme 2“ erfasst das Chrome-Fenster „Lern-Trainer · Galerie“. An Leinwand angepasst. Ausgabe und Leinwand: 1920 × 1080, 30 fps; MKV, H.264 NVENC, hohe Qualität. Speicherordner: `C:/Users/resolve_test/Videos`. Desktop-Audio und Mikrofon sind für stumme Bildclips stummgeschaltet; Sprecheraufnahme separat vorbereiten.

Technischer Test: `C:/Users/resolve_test/Videos/2026-09-14 11-16-50.mkv`, 9,766 Sekunden. Mit ffprobe als H.264, 1920 × 1080, 30 fps bestätigt; Frame bei Sekunde 3 visuell geprüft: Trainerbild vorhanden. Aufnahme beendet. Das ist ein Bildtest, noch kein fertiger Demonstrationsfilm. Aktuell sind Browserleiste und seitliche schwarze Ränder sichtbar; endgültigen Ausschnitt nach Vollbildwechsel erneut prüfen. Chrome-Fernsteuerung ist nicht verbunden; die Trainerbedienung erfolgt bis zur Verbindung durch Steven. OBS kann bedient werden.

Exportdauer ≤ 45 s; Wort und Zustand jederzeit lesbar; keine privaten Tabs oder Benachrichtigungen im Bild; Untertitel korrekt; Stimme ohne Übersteuerung; Fehlerbeispiel als inszeniert erkennbar; Transfer tatsächlich ohne eingeblendete Hilfe; Quellenangabe vorhanden. Vollständiges Video vor Freigabe einmal mit und einmal ohne Ton ansehen.

Der Film und die Veröffentlichung sind separate Schritte. Die lokale Implementierung verändert die bestehende öffentliche Vercel-Seite noch nicht.
