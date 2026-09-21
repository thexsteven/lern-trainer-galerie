import { copyFile, mkdir, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const canonicalApps = new Set(["cyk-verstehen", "compiler-parser-landkarte"]);

export async function publishLearningLabs({ sourceDir, targetDir }) {
  const files = await readdir(sourceDir, { withFileTypes: true });
  const slugs = files
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name.slice(0, -5))
    .filter((slug) => !canonicalApps.has(slug))
    .sort();

  for (const slug of slugs) {
    const destination = join(targetDir, slug);
    await mkdir(destination, { recursive: true });
    await copyFile(join(sourceDir, `${slug}.html`), join(destination, "index.html"));
  }
  return slugs;
}

const scriptPath = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const projectRoot = dirname(dirname(scriptPath));
  const published = await publishLearningLabs({
    sourceDir: join(projectRoot, "output"),
    targetDir: join(projectRoot, "public", "labs"),
  });
  console.log(`Published ${published.length} learning labs.`);
}
