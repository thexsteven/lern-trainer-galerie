# Neue Trainer anlegen

Wie du einen neuen interaktiven Trainer baust, sodass ihn die Galerie **automatisch**
erkennt. Kein Eintrag in einer Liste, keine Registrierung – nur Datei ablegen.

---

## Wie die Auto-Discovery funktioniert

Die Galerie sammelt Trainer mit dieser Zeile in [`src/Gallery.jsx`](../src/Gallery.jsx):

```js
const modules = import.meta.glob("./trainers/**/*.jsx");
```

Das bedeutet: jede `.jsx`-Datei unter `src/trainers/` wird gefunden. Die Struktur
ist **zweistufig** – `trainers/<Kurs>/<Thema>/<Datei>.jsx`:

Aus dem Pfad wird abgeleitet:

| Pfad-Teil           | wird zu     | Beispiel                                                  |
| ------------------- | ----------- | --------------------------------------------------------- |
| **1. Ordnerebene**  | **Kurs**    | `Theoretische Informatik/` → ruhige Überschrift           |
| **2. Ordnerebene**  | **Thema**   | `Hashing/` → einklappbare Gruppe „HASHING"                |
| **Dateiname**       | **Titel**   | `vl11_hashing_uebersicht.jsx` → „Vl11 Hashing Uebersicht" |

Der Titel entsteht durch eine simple Transformation: `_` und `-` werden zu Leerzeichen,
jeder Wortanfang wird großgeschrieben. Es wird **nichts** aus dem Datei-Inhalt gelesen –
der Titel kommt **ausschließlich** aus dem Dateinamen.

> **Fallback:** Liegt eine Datei nur eine Ebene tief (`trainers/<Thema>/datei.jsx`),
> landet sie automatisch im Sammelkurs „Sonstige". Es geht also nie etwas verloren,
> auch wenn du den Kurs-Ordner mal vergisst.

---

## Schritt für Schritt

### 1. Kurs & Thema (Ordner) wählen oder anlegen

Such dir den passenden **Kurs**-Ordner unter `src/trainers/` aus – oder leg einen
neuen an – und darin den **Thema**-Ordner. **Die erste Ebene ist der Kurs, die zweite
das Thema.**

```
src/trainers/Theoretische Informatik/Hashing/        ← Kurs „Theoretische Informatik", Thema „Hashing"
src/trainers/Theoretische Informatik/Sortier-Algos/  ← gleicher Kurs, Thema „Sortier-Algos"
src/trainers/Digitaltechnik/Zahlensysteme/           ← neuer Kurs „Digitaltechnik", Thema „Zahlensysteme"
```

### 2. Dateinamen sauber wählen

Der Dateiname wird zum sichtbaren Titel. Benutze `snake_case` oder `kebab-case`:

- `quicksort_trainer.jsx`  → „Quicksort Trainer"
- `vl12-dijkstra.jsx`      → „Vl12 Dijkstra"

Vermeide Leerzeichen und Sonderzeichen im Dateinamen.

### 3. Komponente mit `export default` schreiben

Jede Trainer-Datei **muss** genau eine Komponente als `export default` exportieren.
Die Galerie lädt sie per `React.lazy` und rendert den Default-Export. Ohne
`export default` taucht der Trainer zwar in der Liste auf, **stürzt aber beim Öffnen ab**.

Der Name der Funktion ist egal (`App`, `Beispiel`, irgendwas) – entscheidend ist
nur das `export default`.

### 4. Speichern – fertig

Läuft `npm run dev`, erscheint der Trainer **sofort** per Hot-Reload in der Galerie,
gruppiert unter Kurs und Thema. (Bei einem **neuen Ordner** kann ein einmaliger Neustart
von `npm run dev` nötig sein, damit Vite den neuen Glob-Treffer registriert.)

---

## Copy-Paste-Boilerplate

Leg das z. B. als `src/trainers/<DeinKurs>/<DeinThema>/mein_trainer.jsx` ab und bau es um:

```jsx
import React, { useState } from "react";

// Passe die Farben an die Galerie an (GitHub-Dark-Look):
const C = {
  bg: "#0d1117",
  panel: "#151b24",
  line: "#2a3441",
  text: "#e6edf3",
  dim: "#8b97a7",
  accent: "#7ee787",
};
const mono = "'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace";

export default function MeinTrainer() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        padding: "40px 24px 60px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ color: C.accent, fontFamily: mono, fontSize: 12, letterSpacing: 2 }}>
          MEIN THEMA
        </div>
        <h1 style={{ fontSize: 32, margin: "8px 0 6px" }}>Titel des Trainers</h1>
        <p style={{ color: C.dim, lineHeight: 1.6, maxWidth: 620 }}>
          Kurze Erklärung, worum es in diesem Trainer geht.
        </p>

        {/* Beispiel: interaktives Element */}
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            marginTop: 20,
            background: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            color: C.text,
            padding: "10px 16px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Geklickt: {count}×
        </button>
      </div>
    </div>
  );
}
```

> Hinweis: Du musst den dunklen Hintergrund **nicht** zwingend selbst setzen –
> die Galerie hat bereits einen dunklen Body. Es sorgt aber dafür, dass dein
> Trainer auch eigenständig (außerhalb der Galerie) gut aussieht.

---

## Häufige Fehler – warum ein Trainer NICHT auftaucht

| Symptom | Ursache | Lösung |
| ------- | ------- | ------ |
| Trainer fehlt komplett | Datei liegt **direkt** in `src/trainers/` (z. B. `src/trainers/foo.jsx`) | In einen **Kurs/Thema-Unterordner** verschieben: `src/trainers/<Kurs>/<Thema>/foo.jsx` |
| Trainer landet im Kurs „Sonstige" | Datei liegt nur **eine** Ebene tief (`src/trainers/<Thema>/foo.jsx`) | Kein Fehler – aber für die saubere Zuordnung in einen Kurs-Ordner legen: `src/trainers/<Kurs>/<Thema>/foo.jsx` |
| Trainer fehlt komplett | Falsche Endung (`.js`, `.tsx`) | Muss `.jsx` sein – der Glob ist auf `*.jsx` festgelegt. |
| Neuer Ordner wird ignoriert | Vite hat den neuen Glob-Treffer noch nicht erfasst | `npm run dev` einmal neu starten. |
| Trainer in Liste, aber **Absturz** beim Öffnen | Kein `export default` | `export default function …` ergänzen. |
| Trainer in Liste, aber **Absturz** beim Öffnen | Default-Export ist kein gültiges React-Component (z. B. ein Objekt, oder JS-Syntaxfehler) | Im Browser-Konsolen-/Terminal-Fehler nachsehen; gültige Komponente exportieren. |
| Titel sieht komisch aus | Sonderzeichen/Umlaute/Leerzeichen im Dateinamen | `snake_case`/`kebab-case`, keine Umlaute im Dateinamen verwenden. |
| Zwei Trainer mit gleichem Namen | Gleicher Dateiname in verschiedenen Ordnern ist ok (verschiedene Themen); **gleicher Name im gleichen Ordner** geht nicht | Datei umbenennen. |

---

## Faustregel

```
src/trainers/<Kurs>/<Thema>/<datei>.jsx   +   export default   =   erscheint automatisch
```

Mehr ist nicht nötig.
