// Generate the hosted PWA from the standalone learning page.
import { readFile, writeFile } from "node:fs/promises";

const source = new URL("../output/cyk-verstehen.html", import.meta.url);
const target = new URL("../public/cyk/index.html", import.meta.url);
let html = await readFile(source, "utf8");
html = html.replace('content="width=device-width,initial-scale=1"', 'content="width=device-width,initial-scale=1,viewport-fit=cover"');
html = html.replace("</head>", `<link rel="manifest" href="/cyk/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="CYK">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#235b46">
<style>
body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
.nav{top:env(safe-area-inset-top)}
.install-note{margin:20px 0 0;font-size:14px}.install-note p:last-child{margin-bottom:0}
@media(max-width:600px){.btn,.presets button,.quiz-options button,.nav a{min-height:44px}.cell{font-size:13px}.check-options label{min-height:44px}}
</style>
</head>`);
html = html.replace("<main>", `<main>
<aside class="card install-note" aria-label="Unterwegs lernen">
<strong>Als iPhone-App nutzen</strong>
<p>In Safari: Teilen → Zum Home-Bildschirm → als Web-App öffnen → Hinzufügen.</p>
<p id="offline-status" role="status">Offline-Speicherung wird vorbereitet …</p>
</aside>`);
html = html.replace('class="matrix" aria-label=', 'class="matrix" style="min-width:\'+Math.max(320,n*72+45)+\'px" aria-label=');
html = html.replace("</body>", `<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cyk/sw.js', {scope:'/cyk/', updateViaCache:'none'})
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      document.getElementById('offline-status').textContent = '✓ Für offline gespeichert. Öffne die App nach dem Hinzufügen einmal mit Internet, bis diese Meldung erscheint.';
    })
    .catch(() => {
      document.getElementById('offline-status').textContent = 'Offline-Speicherung hat nicht geklappt. Die Seite funktioniert online; versuche es später erneut.';
    });
} else {
  document.getElementById('offline-status').textContent = 'Dieser Browser unterstützt die Offline-Speicherung nicht. Die Seite funktioniert online.';
}
</script>
</body>`);
await writeFile(target, html);
console.log("Generated public/cyk/index.html");
