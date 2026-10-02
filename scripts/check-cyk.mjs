import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../public/", import.meta.url);
const html = await readFile(new URL("cyk/index.html", root), "utf8");
for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
assert(html.includes('href="/cyk/manifest.webmanifest"'));
assert(html.includes("navigator.serviceWorker.register('/cyk/sw.js'"));
const manifest = JSON.parse(await readFile(new URL("cyk/manifest.webmanifest", root), "utf8"));
assert.equal(manifest.start_url, "/cyk/");
assert.equal(manifest.scope, "/cyk/");
assert.equal(manifest.display, "standalone");
for (const icon of manifest.icons) await access(new URL(icon.src.slice(1), root));

const listeners = {};
const saved = new Map();
const removed = [];
let claimed = false;
let offline = false;
let failInstall = false;
const cache = {
  async addAll(paths) {
    if (failInstall) throw new Error("Network unavailable");
    for (const path of paths) {
      const file = path.endsWith("/") ? path + "index.html" : path;
      saved.set(path, new Response(await readFile(new URL(file.slice(1), root))));
    }
  },
  async match(path) { return saved.get(path)?.clone(); },
  async put(path, response) { saved.set(path, response); },
};
const context = vm.createContext({
  URL,
  self: {
    location: { origin: "https://example.test" },
    clients: { async claim() { claimed = true; } },
    addEventListener(type, handler) { listeners[type] = handler; },
  },
  caches: {
    async open() { return cache; },
    async keys() { return ["cyk-offline-v1", "cyk-offline-v0", "other-app"]; },
    async delete(key) { removed.push(key); },
  },
  async fetch() {
    if (offline) throw new Error("Network unavailable");
    return new Response("Updated page");
  },
});
vm.runInContext(await readFile(new URL("cyk/sw.js", root), "utf8"), context);
async function lifecycle(type) {
  let pending;
  listeners[type]({ waitUntil(promise) { pending = promise; } });
  await pending;
}
function request(path, method = "GET") {
  let result;
  listeners.fetch({
    request: new Request(new URL(path, "https://example.test"), { method }),
    respondWith(promise) { result = promise; },
  });
  return result;
}
await lifecycle("install");
assert.equal(saved.size, 7);
await lifecycle("activate");
assert(claimed);
assert.deepEqual(removed, ["cyk-offline-v0"]);
offline = true;
assert.match(await (await request("/cyk/")).text(), /CYK verstehen/);
assert.match(await (await request("/cyk/?source=homescreen")).text(), /CYK verstehen/);
assert.equal(await (await request("/cyk/manifest.webmanifest")).json().then(m => m.display), "standalone");
assert.equal(request("/"), undefined);
assert.equal(request("/cyk/", "POST"), undefined);
assert.equal(request("https://other.test/cyk/"), undefined);
offline = false;
assert.equal(await (await request("/cyk/")).text(), "Updated page");
offline = true;
assert.equal(await (await request("/cyk/")).text(), "Updated page");
failInstall = true;
await assert.rejects(lifecycle("install"), /Network unavailable/);
console.log("PASS: HTML script syntax, app manifest/icons, complete precache, offline reopening, online updates, scoped requests/cache cleanup, failed-install handling.");
