import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getLearningCatalog } from "../src/catalog.js";

const entries = {
  "pipeline-orchestrierung": "src/trainers/T1000/PipelineOrchestrationTrainer.jsx",
  "entscheidungs-dashboard": "src/components/Archiv/AI business/decision.jsx",
  "business-systeme": "src/components/Archiv/Watch later/business-systems.jsx",
};
const content = {};
for (const [slug, entry] of Object.entries(entries)) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "iife", globalName: "PrivateModule",
    external: ["react"], jsx: "transform", jsxFactory: "React.createElement", jsxFragment: "React.Fragment",
    banner: { js: 'var React = require("react");' }, minify: true,
  });
  content[slug] = { kind: "trainer", content: result.outputFiles[0].text };
}
content["compiler-parser"] = { kind: "lab", content: await readFile("output/compiler-parser-landkarte.html", "utf8") };
for (const item of getLearningCatalog().filter((item) => item.semester === null)) content[item.slug].item = item;
await mkdir("supabase/functions/account", { recursive: true });
await writeFile("supabase/functions/account/private-content.json", JSON.stringify(content));
console.log("Prepared four private trainers for the authenticated backend (outside dist).");
