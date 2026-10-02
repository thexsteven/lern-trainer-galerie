# Stoffabgleich Semester 3

Stand: 02.10.2026. Ausgangspunkt sind die 17 bisherigen Fokus-Einheiten, nicht die Zahl der Bibliotheksangebote. Während dieses Abgleichs wird die FSA-Einheit zu regulären Ausdrücken ergänzt; die Programmdefinition enthält dadurch bereits 18 Einheiten. Diagnosen zählen nicht als ausgearbeitete Lernstrecken.

## Befund und Priorität

**FSA: reguläre Ausdrücke lesen und anwenden ist der passende nächste Ausbau.** Der früheste hinterlegte schriftliche Prüfungstermin ist FSA am 16.11.2026. Das aktuelle Übungsmaterial beginnt mit regulären Ausdrücken; diese sind eine Voraussetzung für die folgenden Automatenumwandlungen. Die beiden bisherigen FSA-Einheiten üben nur Grundlagen und Wortläufe an einem festen DEA. Eine Regex-Einheit schließt deshalb eine belegte Lücke, ohne spekulativ neuen Prüfungsstoff einzuführen.

Danach ist eine zusammenhängende Strecke **NEA verstehen → ε-Abschluss → Potenzmengenkonstruktion → Verbindung zum regulären Ausdruck** die nächste Empfehlung. Sie darf nicht durch weitere Wortlaufvarianten am bisherigen festen DEA ersetzt werden. Parallel ist Netztechnik die größte bislang fehlende Kapitelgruppe: Die Dateien 04–07 liegen tatsächlich im Semesterordner, während die drei Pflicht-Einheiten und die Diagnose auf 01–03 begrenzt sind.

Die Reihenfolge beruht auf Quelle, Voraussetzung und Termin, nicht auf einer behaupteten Klausurhäufigkeit. Die Termine stammen aus `src/learningProgram.js`: FSA 16.11., Netztechnik 19.11., Mathematik 23.11., systemnahe Programmierung 26.11.2026; Web ohne Termin. Ein amtlicher Prüfungsplan wurde hier nicht geprüft. Auch die Ablage im Semesterordner beweist für sich allein noch keinen verbindlichen Klausurumfang. Insbesondere nennt das Mathe-Übungsblatt „SS2026“; das darf nicht stillschweigend als aktuelle Prüfungszusage ausgelegt werden.

## Quellen und Prüftiefe

Quellenwurzel: `G:/Meine Ablage/01_Studium/DHBW Mosbach/Sem3`. Alle folgenden Seiten sind **PDF-Seiten ab 1**, nicht abweichende gedruckte Seitenzahlen.

| Kürzel | Tatsächlich vorhandene Quelle | Prüftiefe |
|---|---|---|
| R | `Formale Sprachen & Automaten/Reguläre Sprachen - Anmerkungen, Übungsaufgaben und Lösungen.pdf` (48 Seiten) | Seitenweise Textprüfung; bildliche Automaten nicht vollständig unabhängig nachgerechnet |
| K | `Formale Sprachen & Automaten/Kontextfreie Sprachen - Anmerkungen, Übungsaufgaben und Lösungen.pdf` (47 Seiten) | Seitenweise Stoff-/Verfahrensprüfung; keine vollständige Neuberechnung aller Lösungen |
| F-Zusatz | `CYK-Algorithmus.pdf`; `Beweis der Äquivalenz von Kontextfreien Grammatiken und Kellerautomaten.pdf`, gleicher Ordner | Vorhandensein geprüft; Priorisierung stützt sich auf die entsprechenden Seiten in K |
| M | `Mathe3_Angewandte-Mathematik/Mathe_Sem3_Heine_Skript_1_Differentialrechnung-mehrdimensional.pdf` (30 Seiten) | Bild-PDF: alle Seiten als Übersicht gerendert, Kapitelüberschriften visuell gesichtet; keine vollständige Formelprüfung |
| M-Ü | `Mathe3_Angewandte-Mathematik/Übung1_Differentialrechnung.pdf` (1 Seite) | Alle neun Aufgaben samt Unteraufgaben textlich abgeglichen |
| N01–N07 | `Kommunikations-Netztechnik/01-v1.62 KuN - Entwicklung der IT-Infrastruktur.pdf`, `02-v1.42 KuN - Das OSI Schichtenmodell.pdf`, `03-v1.63 KuN - Computernetzwerke und das Internet.pdf`, `04-v1.64 KuN - TCP-Modell Anwendungsschicht.pdf`, `05-v1.63 KuN - Transportschicht.pdf`, `06-v1.64 KuN - Vermittlungsschicht.pdf`, `07-v1.61 KuN - Sicherungsschicht.pdf` | 01–04 Seiten-/Überschriftenabgleich, 05–07 gezielte Seitenstichproben; keine Vollprüfung aller Protokolldetails |
| S01–S03 | `Systemnahe Programmierung 1/01_Einführung.pdf` (31), `02_Programmiermodell.pdf` (35), `03_Programmiersprachen.pdf` (22 Seiten) | Seiten-/Überschriftenabgleich mit den drei Trainer-Einheiten |
| W | `Web Eng 2/fullstack-vorlesung/pdf/` | Alle elf Kapitel-PDFs inventarisiert, Themenstichproben; `examination.pdf` alle vier Seiten gelesen |

Zusätzlich vorhanden: `Routing 2020.pdf` (eine Seite), historische `FSA-handout (old).pdf` (480 Seiten), Web-Aufgaben-/Lösungs-PDFs und drei Dateien zu Datenbanken 1. Das alte FSA-Handout ist keine Grundlage für neue Pflichtinhalte. Datenbanken 1 ist nicht automatisch ein sechstes Fach des bestätigten Fünf-Fächer-Plans. Die Web-Aufgaben wurden inventarisiert, nicht sämtlich fachlich gelöst.

Ein Verzeichnis `src/courseContent` existiert nicht. Tatsächlicher Abgleich erfolgte mit `src/learningProgram.js`, `src/fsaPractice.js`, `src/appliedMath/data.js` und den in JSX eingebetteten Einheiten von `NetztechnikLernreise.jsx`, `SystemnaheProgrammierungLernreise.jsx` sowie `fullstack_verstehen.jsx`. HTML-Labore und ergänzende Bibliotheksangebote sind keine automatisch geprüften zentralen Einheiten.

## Abdeckung der ursprünglichen 17 Einheiten

„Vorhanden“ bedeutet: konkrete Lern-/Übungsaufgaben existieren. Es bedeutet weder vollständige Beherrschung noch vollständige Prüfungsabdeckung.

| Einheit-ID | Quellenbezug und vorhandener Kern | Verbleibende fachliche Grenze |
|---|---|---|
| `mathe-1.1` | M 1–4: Felder, Definitionsbereiche, Niveaumengen | Einheitsauswahl deckt nicht automatisch alle Topologie-/Darstellungsbeispiele ab |
| `mathe-2.1` | M 7–8, 17–19; M-Ü 1,7: partielle und normierte Richtungsableitungen | Aktuelle Blattvarianten mit Exponential-, Logarithmus-, Quotientenfunktionen breiter als einzelne Traineraufgaben |
| `mathe-2.2` | M 17–19: Gradient, Richtung, steilster Anstieg | Transfer über unterschiedliche Felder gesondert prüfen |
| `mathe-3.1` | M 15–16; M-Ü 4–5: totales Differential/Tangentialebene | Blattaufgaben zum allgemeinen totalen Differential nicht allein durch Ebenenaufgabe ersetzt |
| `mathe-3.3` | M 12–14; M-Ü 3: Kettenregel | Konkrete zusammengesetzte nichtpolynomiale Funktionen des Blatts ergänzen |
| `mathe-5.1` | M 21–24; M-Ü 8: stationäre Punkte/Hesse-Test | Zweite gemischte Ableitungen und Schwarz aus M 9–11/M-Ü 2 brauchen auch eigenständige Übung |
| `mathe-9.1` | M 25–28; M-Ü 9: Nebenbedingungen/Lagrange | Kandidaten, zulässiger Bereich und Vergleich müssen durchgängig geprüft werden |
| `mathe-3.fehler` | M 29–30; M-Ü 6: lineare Fehlerfortpflanzung | Absolute und relative Änderung im Schwingkreis sind konkreter Blatttransfer |
| `netz-infrastruktur` | N01; Client/Server, Peer-to-Peer, Netzformen | Ausgewählte Grundlagen, keine vollständige Folienabdeckung |
| `netz-osi` | N02; Schichten und Kapselung | Zuordnung allein ersetzt keine reale Paket-/Protokollanalyse |
| `netz-internet` | N03 43–73: Paketvermittlung, Verzögerung, Durchsatz | End-to-End-Rechnung, Einheiten KiB/TiB und mehrere Links breiter als Einstieg |
| `systemnah-embedded` | S01 4–20: eingebettete Systeme, MCU, Arduino | Pinbelegung/Analogauflösung und konkrete Hardwareentscheidung nur ausschnitthaft |
| `systemnah-architektur` | S02 3–29: Register, Harvard/Von Neumann, Befehlszyklus | Trainer ADD/MOV-Beispiele sind deutlich schmaler als Schleifen, Sprünge, Bits und Datenformate der Folien |
| `systemnah-sprachen` | S03: Maschine, Assembler, Hochsprache, Übersetzung | Begründungs-/Zuordnungsfragen ersetzen keine praktische Übersetzungs-/Codeanalyse |
| `web-request-response` | W `web-basics-advanced.pdf` 4,11–21; `api.pdf` 14–15; `database.pdf` 20–21 | Eine Einheit mit HTTP/JSON-Szenarien; weder React-Workflow noch vollständiger Fullstack-Kompetenznachweis |
| `fsa-grundlagen` | Voraussetzung für R: Alphabet, Wort, Konkatenation, ε, Sprache | Keine Grammatik-/Umwandlungs-/Beweisleistung |
| `fsa-wortlauf` | R 7–14: deterministische Automaten | Im Code ein fester DEA mit wechselnden Wörtern; keine freie Automatenkonstruktion, kein NEA |

Mathe ist thematisch vergleichsweise breit, aber die Aufgabenherkunft muss transparent bleiben: `appliedMath/data.js` verwendet überwiegend `skript_studierende.pdf` als Quelle; die Fehlerrechnung nennt zudem eine `(1)`-Dateivariante. Das aktuelle Heine-Skript belegt die Themenauswahl, macht ältere oder eigene Aufgaben aber nicht rückwirkend zu Originalaufgaben dieses Skripts. Zusätzliche Angebote wie PCA, Regression, Autodiff oder Mehrfachintegrale sind aus den hier tatsächlich vorliegenden beiden Heine-Dateien nicht als aktueller Pflichtstoff ableitbar.

## Konkretes Ausbau-Ranking nach dem Regex-Einstieg

| Rang | Nächste Lücke | Beleg | Konkreter sinnvoller Umfang |
|---|---|---|---|
| 1 | FSA: Nichtdeterminismus und Umwandlungen | R 15–22, 23–27; frühester hinterlegter Termin | NEA-Zustandsmengen pro Zeichen, ε-Abschluss, erreichbare Teilmengen, Endzustandsmarkierung und vollständige determinisierte Tabelle; danach Regex→NEA |
| 2 | Netztechnik: Anwendung bis Sicherung | N04 24–31,47–55; N05 3–10,40–50,70–80,100; N06 20–30,60–70,90; N07 3–10,20,50–60,80 | Getrennte Einheiten HTTP/SMTP, TCP/UDP/SEQ/ACK, IPv4/CIDR/Routing, Ethernet/MAC/ARP/VLAN. Nicht in eine einzelne 25-Minuten-Einheit pressen |
| 3 | FSA: Grammatiken, CNF und CYK | K 4–13,14–30 | Terminierende/erreichbare Symbole, ε-/Kettenregeln, CNF; anschließend vollständige CYK-Tabelle mit Teilwortmengen und Wortentscheidung |
| 4 | FSA: Begründungs-/Beweisverfahren | R 28–30,34–47; K 31–47 | Arden, Pumping-Quantoren, Kellerläufe und Grammatik/Keller-Verbindung. Beweise brauchen fachliches Feedback; bloße Schlüsselwortprüfung genügt nicht |
| 5 | Mathe: gezielter Transfer zum aktuellen Übungsblatt | M-Ü 1–9 | Gemischte zweite Ableitungen/Schwarz, nichtpolynomiale Kettenregel, totales Differential und relativer Schwingkreisfehler zuerst; keine pauschale neue Mathe-Großstrecke |
| 6 | Systemnah: ausführbare Register-/Sprungprogramme | S02 3–7,18–29 | Mehrschrittiger Registerlauf einschließlich bedingtem Sprung und Datenformat; Aufgabe nach jeder Instruktion prüfbar |
| separat, termingesteuert | Web: React-Komponenten und State → Workflow → API/Persistenz | W `frontend-advanced.pdf` 20,30,40,50–61; `examination.pdf` 3–4 | Prüfungsnahe Übungsstrecke zu Komponentenbaum, essenziellem/abgeleitetem State, Datenfluss und dokumentiertem Entwicklungsprozess; anschließend TypeScript/API/Drizzle. Sobald Abgabetermin bestätigt ist, Rang neu bewerten |

Rang 2 und 3 sind eine Arbeitsreihenfolge, keine behauptete unterschiedliche Klausurgewichtung. Klares Web-Prüfungsindiz: `examination.pdf` S.3 verlangt React, TypeScript in Front-/Backend, shadcn.ui, Tailwind und Drizzle; S.4 bewertet Codequalität und Frontend samt dokumentiertem Workflow. Die vorhandene allgemeine JavaScript/FastAPI-Quest schließt diese Lücke nicht. Auf S.2 stehen zudem eigene AI-Regeln der Prüfungsaufgabe; eine Lernstrecke ist als Übung zu kennzeichnen und nicht mit einer zulässigen Prüfungsabgabe gleichzusetzen.

## Abnahmekriterien für die nächste zusammenhängende FSA-Strecke

1. Regex-Einstieg: Vereinigung, Konkatenation, Stern, ε und leere Sprache sauber unterscheiden; Wortzugehörigkeit und konkrete Gegenbeispiele frei eingeben. ε nicht mit einem leeren Formular verwechseln. Endliche Testwortmengen beweisen keine allgemeine Äquivalenz.
2. NEA: pro Eingabesymbol die vollständige erreichbare Zustandsmenge prüfen; ε-Übergänge verbrauchen kein Symbol. Akzeptanz bedeutet Existenz eines akzeptierenden Laufs.
3. Determinisierung: Startmenge einschließlich ε-Abschluss, alle erreichbaren Folgemengen, gegebenenfalls leere Menge und Endzustände prüfen. Zustandsnamen dürfen frei gewählt werden, sofern die repräsentierten Mengen stimmen.
4. Transfer: dieselbe Sprache an kleinem unbekanntem Beispiel als Regex, NEA und DEA verbinden. Lernhilfen erklären den ersten falschen Schritt; Nachweis verwendet keine Lösungsauswahl als Ersatz für Konstruktion.
5. Zentrale Regeln unverändert: Lernmodus, Nachweismodus, verlässliches Resume und zwei vollständig fehlerfreie Nachweisrunden insgesamt. Ein Abschluss belegt die konkret aufgeführten Teilkompetenzen, nicht „FSA bestanden“.

Die ergänzte Regex-Einheit ist ein erster Teil dieses Ausbaus. Unabhängige Gegenprüfung: Die fünf Referenzantworten, die Trennung ε/∅/leere Eingabe und die Wortkonstruktion wurden über die produktive Prüffunktion geprüft. Bei der Konstruktion wurden alle 243 Wörter der Länge 5 über {a,b,c} getestet; exakt die sechs mathematisch zulässigen Wörter werden akzeptiert. Die Erklärung grenzt algebraische Äquivalenzbeweise und Salomaa ausdrücklich aus. Keine fachliche Abweichung in diesen geprüften Aufgaben festgestellt; Browser-/Integrationsabnahme erfolgt separat. Salomaa/Arden-Beweise, allgemeine Äquivalenz, Automatenumwandlungen und der gesamte kontextfreie Teil bleiben offen. Die Einheit ist deshalb weder vollständige Abdeckung von R S.1–6 noch vollständige FSA-Vorbereitung.

## Grenzen der Aussage

Keine Häufigkeitsstatistik, kein vollständiger amtlicher Prüfungsumfang und keine Prüfung sämtlicher Musterlösungen. Textauszüge aus PDF verlieren teilweise mathematische Zeichen; bildbasierte Formeln wurden nicht als exakter OCR-Beweis verwendet. Die detaillierte UI-/Speicherprüfung steht separat in `docs/UI_UX_AUDIT.md`. Dieser Abgleich ändert keine Produktdateien und zählt ergänzende HTML-Labore nicht stillschweigend als beherrschte Pflichtkompetenzen.
