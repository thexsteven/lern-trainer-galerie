# Lern-Trainer · Galerie

Eine lokale Plattform, um alle deine interaktiven JSX-Trainer zu sammeln,
nach Thema zu sortieren, schnell zu öffnen und live (mit Hot-Reload) zu sehen.

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

1. Leg eine `.jsx`-Datei in einen Themen-Ordner unter `src/trainers/`, z. B.
   `src/trainers/Hashing/mein_neuer_trainer.jsx`.
2. Die Datei muss `export default` haben:
   ```jsx
   export default function App() {
     return <div>…</div>;
   }
   ```
3. Fertig. Der Trainer taucht automatisch in der Galerie auf –
   gruppiert nach dem Ordnernamen, benannt nach dem Dateinamen.

## Ordnerstruktur

```
src/
├─ main.jsx              ← Einstiegspunkt (nicht ändern)
├─ Gallery.jsx           ← die Galerie-Oberfläche
└─ trainers/
   ├─ Sortieren/         ← ein Ordner = ein Thema
   ├─ Hashing/
   │  └─ vl11_hashing_uebersicht.jsx
   └─ Datenstrukturen/
```

Neues Thema = neuer Ordner unter `src/trainers/`. Mehr musst du nicht tun.
```
```
