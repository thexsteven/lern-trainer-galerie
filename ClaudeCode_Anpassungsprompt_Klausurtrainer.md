# Claude-Code-Anpassungsprompt — Analysis Klausurtrainer v2

> Kopiere alles unterhalb der Linie in Claude Code. Die zu bearbeitende Datei ist `src/trainers/Analysis_Klausurtrainer/AnalysisKlausurtrainer.jsx` (bereits vorhanden).

---

**Erweitere die bestehende Komponente `AnalysisKlausurtrainer.jsx` — nicht neu schreiben, sondern gezielt umbauen.** Behalte das komplette Design-System (`C`-Objekt, alle Farben), die Pflicht-Bausteine (`useReveal`, `Section`, `Card`, `Tag`, `InfoBox`, `GlossEntry`, `MethodRow`, `Frac`, `LösungsStepper`, `FalleCard`, `Varianten`, `SectionNav`/`NAV`), die 12 Aufgabentyp-Sections + Überblick/Strategie/Zusammenfassung/Glossar sowie den `default export`. Die folgenden vier Verbesserungen werden eingebaut.

## TECHNISCHE LEITPLANKEN (gelten für ALLE Änderungen)

- React mit Hooks, komplett **inline-styled über `C`**, keine externen Libs, kein Tailwind, **kein MathJax/LaTeX** (kein CDN).
- Mathematik in **Unicode** (`√ ∫ Σ ∞ ≤ ≥ ≠ ≈ → x² eˣ aₙ x₀`), alle Brüche über die `Frac`-Komponente.
- **Nur ASCII-Anführungszeichen** (`"` `'`) im gesamten Code — keine typografischen Quotes (verursachen JSX-Fehler).
- Neue wiederverwendbare Komponenten **einmal oben definieren** und überall instanziieren (die Datei wird größer — Redundanz vermeiden).
- Self-contained, sofort lauffähig. Am Ende mit esbuild/Node auf Syntax prüfen und alle Rechenergebnisse gegenrechnen.

---

## 1) ÜBERSICHTLICHKEIT — Herkunft jeder Aufgabe sofort erkennbar

Aktuell steht die Quelle nur als kleines `Tag` oben im Stepper. Ziel: **bei jeder Aufgabe auf einen Blick: welches Aufgabenblatt + welche Aufgabe.**

- Neue Komponente **`AufgabenHeader({ blatt, aufgabe, punkte })`**: deutlich sichtbares Band oben in jedem `LösungsStepper`:
  - Icon 📄 + **voller Klausurname** (z. B. „Hauptklausur INF23"), getrennt durch `·` die **Aufgabennummer** (z. B. „Aufgabe 6 a)"), optional Punkte als kleines Badge rechts.
  - **Farbcodierung pro Klausur**, damit man sie unterscheidet: HK INF23 = `accent` (Marineblau), NK INF23 = `accent2` (Cyan), HK INF24 = `gold`. Linke farbige Kante + getönter Hintergrund in der jeweiligen Farbe.
- `LösungsStepper` so erweitern, dass er `blatt`, `aufgabe`, `punkte` als Props nimmt und `AufgabenHeader` rendert (alte `quelle`-Aufrufe entsprechend aufteilen).
- Auch die **`Varianten`-Tags** bekommen das Klausur-Kürzel als farbigen Präfix in derselben Codierung (z. B. ein kleines Quadrat in accent/accent2/gold + „HK23 / NK23 / HK24").
- In der Section **„Die Klausur auf einen Blick"** eine kompakte **Legende** ergänzen: welche Farbe = welche Klausur.

## 2) GRUNDLAGEN VON NULL — als ob man nichts weiß

Vor der Methoden-/Lösungsebene jedes Aufgabentyps eine echte Einsteiger-Erklärung. Nichts voraussetzen.

- Neue Komponente **`Grundlagen({ titel, children })`**: ruhig gestalteter Erklärblock (eigene, von `InfoBox` unterscheidbare Optik, z. B. `panel2`-Hintergrund + 📘-Icon + Kicker „Ganz von vorn").
- Pro Aufgabentyp ein `Grundlagen`-Block **vor** Methode/Stepper mit:
  1. **Worum geht es überhaupt?** — der Begriff in Alltagssprache, eine anschauliche Analogie.
  2. **Die nötigen Vokabeln** — jedes Symbol/Wort, das später auftaucht, hier erstmals erklärt (z. B. was `lim` bedeutet, was „Grenzwert", „konvergent", „Ableitung", „Stammfunktion" heißt).
  3. **Ein Mini-Beispiel von Hand** — der kleinstmögliche Fall, komplett vorgerechnet, bevor die echte Klausuraufgabe kommt.
- Sprache: Deutsch, Du-Form, geduldig. Lieber ein Satz mehr zur Intuition als eine ungeklärte Abkürzung.

## 3) ÜBUNGSAUFGABEN — Lernen durch Tun (Kernstück dieser Version)

Zwei Übungsformate, beide mit **schrittweiser Lösungserklärung bei falscher Antwort**.

### 3a) Schnelle Multiple-Choice-Checks
- Neue Komponente **`QuizMC({ frage, optionen, richtigIndex, loesung })`**:
  - Zeigt die Frage + antippbare Optionen (Buttons). Klick = **sofortiges Feedback**: richtige Option wird `good`, falsch gewählte `warn`, sanfte transition.
  - Bei falscher Antwort klappt darunter eine **`LoesungsErklaerung`** auf (siehe 3c) — Schritt für Schritt, warum die richtige Option richtig ist.
  - „Nochmal"-Button zum Zurücksetzen.
- Platziere pro Aufgabentyp **1–2 QuizMC** für Konzept-/Verständnisfragen (z. B. „Welches Konvergenzkriterium passt hier?", „Welche Regel zuerst — Ketten- oder Produktregel?"). Gedacht für den schnellen Durchlauf.

### 3b) „Selbst rechnen" an JEDEM Lösungsschritt
- Die `schritte` des `LösungsStepper` erweitern: jeder Schritt darf ein optionales Feld **`uebung`** haben.
- Ist `uebung` vorhanden, zeigt der Schritt einen kleinen Button **„✎ Selbst rechnen"**. Klick öffnet inline (aufklappend, NICHT als separates Vollbild) eine **`StepUebung`**:
  - Eine **analoge Mini-Aufgabe** zu genau diesem Rechenschritt (andere Zahlen, gleiches Prinzip) — so übt man jeden Teilschritt einzeln.
  - **Eingabefeld** für Zahl/Term, „Prüfen"-Button.
  - Antwortprüfung **tolerant**: Whitespace ignorieren, gängige äquivalente Schreibweisen akzeptieren (Liste erlaubter Antworten je Aufgabe), bei Zahlen kleine numerische Toleranz. Zusätzlich ein „Lösung zeigen"-Fallback.
  - Richtig → `good`-Bestätigung. Falsch → **`LoesungsErklaerung`** (Schritt für Schritt).
- Ergebnis: Man kann den Stepper lesen UND an jedem Teilschritt sofort selbst rechnen.

### 3c) Gemeinsame Lösungserklärung
- Neue Komponente **`LoesungsErklaerung({ schritte })`** (von `QuizMC` und `StepUebung` gemeinsam genutzt): nummerierte Schrittliste (Formel + kurze Begründung), optisch an den `LösungsStepper`-Schrittstil angelehnt, aber statisch (kein Player).

## 4) GRAPHEN — viel mehr visuelle Veranschaulichung

Beides: statische Funktionsgraphen UND interaktive Graphen, je nach Thema.

- Neue Basis-Komponente **`Graph({ fns, xRange, yRange, marks, fill, width, height })`** — reiner SVG-Plotter, keine Libs:
  - Koordinatensystem mit Achsen, Nulllinien, dezenten Gitterlinien (`line`), beschrifteten Ticks.
  - Plottet eine oder mehrere JS-Funktionen (`fns`: `[{ f, color, label }]`) durch dichtes Sampling als glatte Polyline. Definitionslücken/Pole sauber abfangen (kein Strich durch ±∞).
  - Optionale Punkte/Marker (`marks`) und Flächenfüllung unter einer Kurve (`fill`) für Integrale.
- Interaktive Variante **`GraphInteraktiv`** (Slider/Hover) — über `Graph` aufgesetzt, mit `useState`:
  - Hover/Drag zeigt Koordinaten am Cursor.
  - Slider, der je nach Thema einen Parameter steuert (siehe unten).
- Setze Graphen gezielt dort ein, wo sie das Verständnis tragen:
  - **Unstetigkeit:** `sin(1/x)` nahe 0 (Oszillation sichtbar machen); Sprungfunktion `x²` / `x+1` mit Hover, der linksseitigen vs. rechtsseitigen Grenzwert markiert.
  - **Folgen-Grenzwerte:** Folgenglieder `aₙ` als Punkte, Slider für n → Punkte nähern sich der Grenzwert-Linie.
  - **Reihen:** Partialsummen als wachsende Kurve gegen den Grenzwert (geometrisch) bzw. divergierend (harmonisch).
  - **Verkettung:** `f`, `g` und `g∘f` gemeinsam plotten; Definitionsbereich farblich markieren.
  - **L'Hospital / Grenzwerte:** Slider, der `x → 0` annähert, mit eingeblendetem Funktionswert.
  - **Taylorreihe:** `f(x)=√(x+1)` mit dem Taylorpolynom; Slider über die **Anzahl der Glieder (1 → 4)**, sodass man sieht, wie die Näherung besser wird.
  - **Integrale:** Fläche unter der Kurve schraffieren/füllen.
  - **Uneigentliches Integral:** obere Grenze per Slider gegen die kritische Stelle (z. B. → 2.5) laufen lassen, Fläche wächst.
  - **Glockenkurve (INF24):** `exp(−x²/2)` mit markierten Wendepunkten, konkav/konvex-Bereiche einfärben.
- Kleine `Tag`-Legende unter jedem Graph. Achsen/Beschriftungen aus `C` (text/dim), Kurven aus `accent`/`accent2`/`good`/`warn`.

---

## REIHENFOLGE INNERHALB JEDER AUFGABENTYP-SECTION (neuer Bogen)

1. `Grundlagen` — von Null erklärt (inkl. Mini-Beispiel von Hand).
2. `Graph` bzw. `GraphInteraktiv` — das Konzept sehen.
3. `MethodRow`/`InfoBox` — Methode + Erkennungsmerkmal (wie bisher).
4. `LösungsStepper` mit `AufgabenHeader` + **„Selbst rechnen"-Button an jedem Schritt**.
5. `QuizMC` — 1–2 schnelle Verständnis-Checks.
6. `FalleCard` — typische Falle (wie bisher).
7. `Varianten` — mit farbcodierten Klausur-Kürzeln (wie bisher, ergänzt).

## QUALITÄTSSICHERUNG

- Keine typografischen Quotes; balancierte Tags; `node --check` / esbuild ohne Fehler.
- Alle Übungs-Lösungen und Graph-Funktionen mathematisch korrekt (Endergebnisse gegenrechnen, z. B. L'Hospital 7a → 2, Folge 2a → 2/7).
- Performance: Graph-Sampling und Slider flüssig (keine teuren Neuberechnungen pro Frame ohne Not).
