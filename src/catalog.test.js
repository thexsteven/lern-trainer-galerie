import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  findLearningItemBySlug,
  getLearningCatalog,
  searchLearningCatalog,
} from "./catalog.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function findJsxFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findJsxFiles(path);
    return entry.isFile() && entry.name.endsWith(".jsx") ? [path] : [];
  }));
  return files.flat();
}

test("catalog exposes every usable learning offer through a unique stable slug", () => {
  const catalog = getLearningCatalog();
  const slugs = catalog.map((item) => item.slug);

  assert.equal(catalog.length, 38);
  assert.equal(new Set(slugs).size, catalog.length);
  assert.equal(findLearningItemBySlug("dea-wortlauf")?.title, "DEA-Wortlauf verstehen");
  assert.equal(findLearningItemBySlug("cyk-verstehen")?.kind, "lab");
});

test("every React trainer and archived component is reachable through the catalog", async () => {
  const discoveredFiles = (
    await Promise.all([
      findJsxFiles(resolve(projectRoot, "src/trainers")),
      findJsxFiles(resolve(projectRoot, "src/components/Archiv")),
    ])
  ).flat().map((path) => `./${relative(resolve(projectRoot, "src"), path).replaceAll("\\", "/")}`);

  const catalogSources = getLearningCatalog()
    .filter((item) => item.kind === "trainer")
    .map((item) => item.source);

  assert.deepEqual(catalogSources.sort(), discoveredFiles.sort());
});

test("every standalone learning source has a catalog destination", async () => {
  const outputFiles = (await readdir(resolve(projectRoot, "output")))
    .filter((file) => file.endsWith(".html"))
    .sort();
  const expectedSourcesByUrl = new Map([
    ["/cyk/", "cyk-verstehen.html"],
    ["/compiler-parser/", "compiler-parser-landkarte.html"],
    ["/labs/cyk-ableitung-visuell/", "cyk-ableitung-visuell.html"],
    ["/labs/fsa-cheatsheet/", "fsa-cheatsheet.html"],
    ["/labs/fsa-lernreise/", "fsa-lernreise.html"],
    ["/labs/grundlagen-pruefung/", "grundlagen-pruefung.html"],
    ["/labs/regulaere-ausdruecke-pruefung/", "regulaere-ausdruecke-pruefung.html"],
  ]);
  const catalogUrls = getLearningCatalog()
    .filter((item) => item.kind === "lab")
    .map((item) => item.url);

  assert.deepEqual([...expectedSourcesByUrl.values()].sort(), outputFiles);
  assert.deepEqual(catalogUrls.sort(), [...expectedSourcesByUrl.keys()].sort());
});

test("search finds learning offers by title, course, topic, and learning goal", () => {
  assert.deepEqual(
    searchLearningCatalog("karnaugh").map((item) => item.slug),
    ["kv-diagramm"]
  );
  assert.ok(searchLearningCatalog("Mastermind").length >= 3);
  assert.ok(searchLearningCatalog("Compiler Pipeline").some((item) => item.slug === "compiler-parser"));
});
