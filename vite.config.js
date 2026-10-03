import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "node:fs/promises";
import { resolve, sep } from "node:path";

function excludePrivateFiles() {
  return {
    name: "exclude-private-files",
    transform(source, id) {
      if (process.env.VITEST || !id.replaceAll("\\", "/").endsWith("/src/catalog.js")) return;
      const privateSlugs = ["pipeline-orchestrierung", "entscheidungs-dashboard", "business-systeme", "compiler-parser"];
      return source.split("\n").filter((line) => !privateSlugs.some((slug) => line.trimStart().startsWith(`reactItem("${slug}"`) || line.trimStart().startsWith(`labItem("${slug}"`))).join("\n");
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = decodeURIComponent((request.url || "").split("?")[0]);
        if (path.includes("/compiler-parser/") || path.includes("/T1000/") || path.includes("/components/Archiv/") || path.includes("compiler-parser-landkarte")) {
          response.statusCode = 404;
          response.end("Not found");
        } else next();
      });
    },
    async closeBundle() {
      const output = resolve("dist");
      const target = resolve(output, "compiler-parser");
      if (!target.startsWith(output + sep)) throw new Error("Invalid private output path");
      await rm(target, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), excludePrivateFiles()],
  server: { open: true },
});
