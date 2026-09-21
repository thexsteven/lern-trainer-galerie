import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { publishLearningLabs } from "./build-learning-labs.mjs";

test("publishes standalone learning labs at their catalog URLs", async () => {
  const root = await mkdtemp(join(tmpdir(), "lern-trainer-labs-"));
  const sourceDir = join(root, "output");
  const targetDir = join(root, "public", "labs");
  await mkdir(sourceDir, { recursive: true });
  await writeFile(join(sourceDir, "fsa-cheatsheet.html"), "<h1>Cheatsheet</h1>");
  await writeFile(join(sourceDir, "cyk-verstehen.html"), "<h1>Canonical elsewhere</h1>");

  const published = await publishLearningLabs({ sourceDir, targetDir });

  assert.deepEqual(published, ["fsa-cheatsheet"]);
  assert.equal(
    await readFile(join(targetDir, "fsa-cheatsheet", "index.html"), "utf8"),
    "<h1>Cheatsheet</h1>"
  );
});
