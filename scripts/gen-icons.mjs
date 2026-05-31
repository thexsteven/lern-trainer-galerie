// Erzeugt die PNG-App-Icons aus public/icon.svg.
// Einmalig ausführen, wenn sich das Icon ändert:
//   npm i -D sharp && node scripts/gen-icons.mjs && npm un sharp
// Die erzeugten PNGs werden committet, daher ist sharp keine ständige Dependency.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const svg = readFileSync(join(pub, "icon.svg"));

const targets = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512 },
];

for (const { file, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(pub, file));
  console.log(`✓ ${file} (${size}×${size})`);
}
