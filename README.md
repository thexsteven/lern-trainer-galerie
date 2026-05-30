# Lern-Trainer · Galerie

Eine lokale Plattform, um alle deine interaktiven JSX-Trainer zu sammeln,
nach **Kurs › Thema** zu sortieren, schnell zu öffnen und live (mit Hot-Reload)
zu sehen. Die Themen in der Seitenleiste lassen sich einklappen.

## Einmal einrichten

Du brauchst **Node.js** (Version 18 oder neuer). Prüfen mit:

```bash
node -v
```

Falls nichts kommt: Node von https://nodejs.org herunterladen und installieren
(die "LTS"-Version reicht). Danach im Projektordner:

```bash
npm install
```

Das lädt React und Vite herunter (einmalig, ein paar Sekunden).

## Starten

```bash
npm run dev
```

Der Browser öffnet sich automatisch auf `http://localhost:5173`.
Während `npm run dev` läuft, wird jede Änderung an einer Trainer-Datei
**sofort** im Browser angezeigt (Hot-Reload). Zum Beenden: `Strg + C` im Terminal.

## Neuen Trainer hinzufügen

1. Leg eine `.jsx`-Datei in einen **Kurs/Thema**-Ordner unter `src/trainers/`, z. B.
   `src/trainers/Theoretische Informatik/Hashing/mein_neuer_trainer.jsx`.
2. Die Datei muss `export default` haben:
   ```jsx
   export default function App() {
     return <div>…</div>;
   }
   ```
3. Fertig. Der Trainer taucht automatisch in der Galerie auf –
   gruppiert nach Kurs und Thema, benannt nach dem Dateinamen.

## Ordnerstruktur

Zweistufige Hierarchie: **Kurs › Thema › Trainer.** Die erste Ordnerebene ist der
Kurs, die zweite das Thema.

```
src/
├─ main.jsx              ← Einstiegspunkt (nicht ändern)
├─ Gallery.jsx           ← die Galerie-Oberfläche
└─ trainers/
   ├─ Theoretische Informatik/   ← Kurs
   │  ├─ Hashing/                 ← Thema (einklappbar in der Seitenleiste)
   │  │  └─ vl11_hashing_uebersicht.jsx
   │  └─ Sortier-Algos/
   │     └─ MergeSortTrainer.jsx
   └─ Digitaltechnik/             ← neuer Kurs = einfach neuer Ordner
      ├─ Zahlensysteme/
      └─ Schaltnetze/
```

Neuer Kurs = neuer Ordner unter `src/trainers/`. Neues Thema = neuer Unterordner
darin. Mehr musst du nicht tun.

> Liegt eine Datei nur eine Ebene tief (`src/trainers/<Thema>/datei.jsx`), landet
> sie im Sammelkurs „Sonstige" – sie geht also nie verloren.
