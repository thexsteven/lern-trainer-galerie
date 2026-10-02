# FSA-Prüfungstraining

In der Bibliothek: **FSA · Wörter, DEA & reguläre Ausdrücke** (`/trainer/fsa-pruefungstraining`). Die drei Lernziele sind auch in den bestehenden Semesterplan eingebunden.

- Grundlagen: Wortlänge, Alphabetzugehörigkeit, Konkatenation, leeres Wort und Unterscheidung zwischen Wort und Sprache.
- DEA: vollständige Zustandsfolge einschließlich Startzustand und Akzeptanz nach dem gesamten Wort. Der Übungsautomat erkennt genau die Wörter über `{a,b}` mit einem `b`.
- Reguläre Ausdrücke: ε und ∅, Vereinigung, Konkatenation und Kleene-Stern unterscheiden, Wortzugehörigkeit prüfen und eigene passende Wörter bilden. Feste fachliche Prädikate prüfen die Antworten; es wird keine allgemeine Regex-Äquivalenz aus einer endlichen Stichprobe abgeleitet.
- Fünf eigene Aufgabenvarianten pro Runde. Erklären/Üben, Fehlertraining und selbstständige Nachweisrunden sind getrennt. Ein DEA-Diagramm und die Übergangstabelle gehören zu den erlaubten Aufgabeninformationen.
- Nach einem Fehler: Rückmeldung, vollständige Erklärung und Möglichkeit zur Korrektur. Der erste Fehler bleibt erhalten. Hilfe, Eingaben, Akzeptanzauswahl und Erstbewertungen bleiben beim Neuladen erhalten.
- Fehlertraining verwendet zuletzt falsch, mit Hilfe oder erst nach Korrektur gelöste Aufgaben; fehlende Aufgaben werden aus dem übrigen Pool ergänzt.
- Ein Nachweis verlangt eine vollständige Nachweisrunde: alle fünf Aufgaben im Erstversuch richtig, ohne aufgerufene Hilfe. Zwei unterschiedliche Runden schließen die Einheit ab. Gleicher Tag und bekannte Varianten sind erlaubt; spätere Fehler setzen den Abschluss nicht zurück.
- Lern-/Fehlerrunden werden als Aktivität dokumentiert und erzeugen keinen selbstständigen Nachweis. Der 1–3–7-Rhythmus empfiehlt Wiederholungen, bestimmt aber keinen Abschluss.
- Freie Runden und „Heute“ verwenden dieselbe zentrale Speicherung. Eine bereits aktive Session wird fortgesetzt. Abgebrochene Runden speichern bewertete Antworten und begonnene Fehlversuche; sie ergeben keinen vollständigen Nachweis.

Speicherung erfolgt lokal im Browser unter dem bestehenden Lernsteuerungsschlüssel. Die Zeit zwischen Sessionstart und Abschluss wird auf Tages- und Wochenbudget angerechnet, auch bei Überschreitung der geplanten Rundendauer. Bei langen Unterbrechungen die Runde beenden und später eine neue beginnen.

Unter `/uebersicht` erscheinen alle fünf Semesterfächer, Versuche, vollständige Durchläufe und fehlerfreie Nachweise. Der Abschlussfortschritt zählt pro Einheit 0/50/100 Prozent; er behauptet keine vollständige Stoffabdeckung oder Prüfungsreife. Alte Nachweistage bleiben als bisherige Daten erhalten und werden nicht pauschal als neue Runden angerechnet.

Themenbezug: aktuelle Unterlagen zu regulären Sprachen, reguläre Ausdrücke auf S. 1–6 und DEA auf S. 7–14 gemäß `FSA_UNTERLAGEN.md`. Die generierten Aufgaben sind eigene Übungen, keine übernommenen Klausuraufgaben. Diese drei Einheiten bilden keine vollständige FSA-Klausur ab. Bestehende andere Fachtrainer und die separate Prüfungsverwaltung bleiben erhalten; Mathe, Netztechnik, Systemnah und Web haben gemeinsame Nachweisregeln.

Verifikation: `npm test` prüft unter anderem Sessionintegration, Nachweise, Wiederholung, Fehler, Hilfe und Neuladen; alle 511 Wörter bis Länge acht werden gegen das unabhängige Kriterium „genau ein b“ geprüft. `npm run build` erzeugt den Produktionsbuild.
