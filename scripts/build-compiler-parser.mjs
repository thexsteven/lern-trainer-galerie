// Generate the hosted PWA from the standalone compiler/parser learning page.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = new URL("../output/compiler-parser-landkarte.html", import.meta.url);
const targetDir = new URL("../public/compiler-parser/", import.meta.url);
const target = new URL("index.html", targetDir);

await mkdir(targetDir, { recursive: true });
let html = await readFile(source, "utf8");
html = html.replace("</head>", `<link rel="manifest" href="/compiler-parser/manifest.webmanifest">
<link rel="icon" href="/compiler-parser/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/compiler-parser/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Parsing">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#101619">
</head>`);
html = html.replace("</body>", `<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/compiler-parser/sw.js', { scope: '/compiler-parser/', updateViaCache: 'none' })
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      const status = document.getElementById('install-status');
      if (status) status.textContent = 'Offline bereit. In Safari: Teilen → „Zum Home-Bildschirm“ → Hinzufügen.';
    })
    .catch(() => {
      const status = document.getElementById('install-status');
      if (status) status.textContent = 'In Safari: Teilen → „Zum Home-Bildschirm“ → Hinzufügen. Für Offline-Nutzung später erneut online öffnen.';
    });
}
</script>
</body>`);
await writeFile(target, html);
console.log("Generated public/compiler-parser/index.html");
