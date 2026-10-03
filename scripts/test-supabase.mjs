// Test only disposable, confirmed accounts created for this verification. Never use real accounts here.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries((await readFile(".env.local", "utf8")).trim().split(/\r?\n/).map((line) => line.split(/=(.*)/s).slice(0, 2)));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const accounts = JSON.parse(await readFile("tmp/test-accounts.json", "utf8"));
assert.ok(accounts.every((account) => account.email.startsWith("lerntrainer-test-") && account.email.endsWith("@example.invalid")));
const clients = accounts.map(() => createClient(url, key, { auth: { persistSession: false } }));
const tokens = [];
for (let index = 0; index < clients.length; index++) {
  const { data, error } = await clients[index].auth.signInWithPassword({ email: accounts[index].email, password: accounts[index].password });
  assert.equal(error, null, "Disposable account login"); tokens.push(data.session.access_token);
  assert.equal((await clients[index].rpc("has_live_session")).data, true);
}
const [a, b] = clients;
const [userA, userB] = accounts;
const learningKey = "lern-trainer-learning-control-v1";
const personalKey = "lern-trainer-personal-v1";
const save = (client, stateKey, value, revision, quizzes = []) => client.rpc("save_learning_state", { p_key: stateKey, p_value: value, p_revision: revision, p_quizzes: quizzes });
for (const client of clients) {
  const first = await save(client, learningKey, "initial", 0, [{ trainer_id: "test", quiz_id: "test", score: 1, max_score: 2, result: { checked: true } }]);
  assert.equal(first.error, null); assert.equal(first.data.accepted, true);
  assert.equal((await save(client, personalKey, '{"pins":[]}', 0)).data.accepted, true);
}
assert.equal((await a.from("profiles").update({ course: "T-INF 25", display_name: "Test" }).eq("user_id", userA.id)).error, null);
assert.equal((await a.from("profiles").select("course").single()).data.course, "T-INF 25");
for (const table of ["profiles", "progress", "quiz_results", "user_settings"]) {
  const own = await b.from(table).select("*");
  assert.equal(own.error, null); assert.ok(own.data.length > 0);
  assert.ok(own.data.every((row) => row.user_id === userB.id));
  assert.deepEqual((await b.from(table).select("*").eq("user_id", userA.id)).data, []);
  const foreignUpdate = await b.from(table).update(table === "profiles" ? { display_name: "attack" } : table === "quiz_results" ? { score: 999 } : { value: "attack" }).eq("user_id", userA.id).select();
  assert.equal(foreignUpdate.error, null); assert.deepEqual(foreignUpdate.data, []);
  assert.deepEqual((await b.from(table).delete().eq("user_id", userA.id).select()).data, []);
}
assert.ok((await b.from("progress").insert({ user_id: userA.id, trainer_id: "foreign" })).error);
assert.ok((await b.from("quiz_results").insert({ user_id: userA.id, trainer_id: "foreign", quiz_id: "foreign", result: {} })).error);
assert.ok((await b.from("user_settings").insert({ user_id: userA.id, key: "foreign" })).error);
assert.equal((await a.from("progress").select("value").single()).data.value, "initial");
const conflict = await save(a, learningKey, "stale", 0);
assert.equal(conflict.data.accepted, false); assert.equal(conflict.data.current.value, "initial");
assert.equal((await save(a, learningKey, "updated", 1)).data.accepted, true);
assert.equal((await a.auth.refreshSession()).error, null);
assert.equal((await a.from("progress").select("value").single()).data.value, "updated");
const anon = createClient(url, key, { auth: { persistSession: false } });
assert.ok((await anon.from("progress").select("*")).error);
const anonymousRequest = await fetch(`${url}/functions/v1/account`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json" }, body: JSON.stringify({ action: "private", slug: "pipeline-orchestrierung" }) });
assert.equal(anonymousRequest.status, 401);
assert.equal((await b.rpc("has_private_access")).data, false);
await b.auth.updateUser({ data: { email: "steven7braun@gmail.com", owner: true } });
const privateRequest = await fetch(`${url}/functions/v1/account`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${tokens[1]}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "private", slug: "pipeline-orchestrierung" }) });
assert.equal(privateRequest.status, 403, "User metadata cannot grant private access");
const password = accounts[0].password + "new";
assert.equal((await a.auth.updateUser({ password })).error, null);
assert.equal((await a.auth.signInWithPassword({ email: userA.email, password })).error, null);
accounts[0].password = password;
await writeFile("tmp/test-accounts.json", JSON.stringify(accounts));
const deletion = await fetch(`${url}/functions/v1/account`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${tokens[1]}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", confirm: "LÖSCHEN" }) });
assert.equal(deletion.status, 200, await deletion.text());
assert.deepEqual((await b.from("progress").select("*")).data, []);
assert.equal((await b.rpc("has_live_session")).data, false);
assert.ok((await b.auth.signInWithPassword({ email: userB.email, password: userB.password })).error);
assert.equal((await a.from("progress").select("value").single()).data.value, "updated");
console.log("PASS: live Auth login/refresh/password update; four-table RLS SELECT/UPDATE/DELETE + forged inserts; revision conflict; anonymous/private denial; metadata spoofing denied; account deletion + old-token denial; other account preserved.");
