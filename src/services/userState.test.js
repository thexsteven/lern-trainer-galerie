import test from "node:test";
import assert from "node:assert/strict";
import { createUserState, mergeGuestValue, quizRecords } from "./userState.js";

const KEY = "lern-trainer-personal-v1";
function memory() {
  const data = new Map();
  return { get length() { return data.size; }, key: (index) => [...data.keys()][index], getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)), removeItem: (key) => data.delete(key) };
}
function remote() {
  const data = new Map();
  let online = true;
  return { data, online: (value) => { online = value; },
    async load() { if (!online) throw new Error("offline"); return [...data.entries()].map(([key, row]) => ({ key, ...row })); },
    async save(key, value, revision) {
      if (!online) throw new Error("offline");
      const row = data.get(key) || { value: null, revision: 0 };
      if (row.revision !== revision) return { accepted: false, current: row };
      data.set(key, { value, revision: revision + 1 });
      return { accepted: true, revision: revision + 1 };
    },
  };
}

test("guest, account A and account B never share learning storage", async () => {
  const local = memory(); local.setItem(KEY, '{"pins":["guest"]}');
  const a = createUserState({ local, userId: "a", repository: remote() });
  const b = createUserState({ local, userId: "b", repository: remote() });
  await a.load(); await b.load();
  assert.equal(a.storage.getItem(KEY), null);
  a.storage.setItem(KEY, '{"pins":["a"]}');
  await a.flush();
  assert.equal(b.storage.getItem(KEY), null);
  assert.equal(local.getItem(KEY), '{"pins":["guest"]}');
  a.stop(); b.stop();
});

test("offline writes survive remount and sync on reconnect", async () => {
  const local = memory(); const repository = remote();
  const first = createUserState({ local, userId: "a", repository });
  await first.load(); repository.online(false);
  first.storage.setItem(KEY, "offline"); await first.flush(); first.stop();
  const next = createUserState({ local, userId: "a", repository });
  await next.load(); assert.equal(next.storage.getItem(KEY), "offline");
  repository.online(true); await next.flush();
  assert.equal(repository.data.get(KEY).value, "offline"); next.stop();
});

test("newer cloud state is preserved until an explicit conflict decision", async () => {
  const local = memory(); const repository = remote();
  repository.data.set(KEY, { value: "original", revision: 1 });
  let status;
  const state = createUserState({ local, userId: "a", repository, onStatus: (value) => { status = value; } });
  await state.load(); state.storage.setItem(KEY, "mine");
  repository.data.set(KEY, { value: "other device", revision: 2 });
  await state.flush(); assert.equal(status, "conflict");
  assert.equal(repository.data.get(KEY).value, "other device");
  assert.equal(state.storage.getItem(KEY), "mine");
  await state.resolveConflict(false); assert.equal(state.storage.getItem(KEY), "other device");
  state.stop();
});

test("import merges missing guest records without replacing account records or copying Auth keys", async () => {
  const local = memory(); const repository = remote();
  local.setItem(KEY, JSON.stringify({ pins: ["guest"], exams: [{ id: "existing", title: "guest" }, { id: "new" }] }));
  local.setItem("sb-auth-token", "secret");
  repository.data.set(KEY, { value: JSON.stringify({ pins: ["account"], exams: [{ id: "existing", title: "account" }] }), revision: 1 });
  const state = createUserState({ local, userId: "a", repository }); await state.load();
  assert.equal(state.needsImport(), true); await state.importGuest();
  const result = JSON.parse(state.storage.getItem(KEY));
  assert.deepEqual(result.pins, ["account", "guest"]);
  assert.deepEqual(result.exams, [{ id: "existing", title: "account" }, { id: "new" }]);
  assert.equal(state.storage.getItem("sb-auth-token"), null);
  assert.equal(state.needsImport(), false); assert.equal(local.getItem("sb-auth-token"), "secret");
  state.clear(); assert.ok(local.getItem(KEY)); state.stop();
});

test("reset tombstones propagate and cached state cannot be written after logout", async () => {
  const repository = remote(); const state = createUserState({ local: memory(), userId: "a", repository });
  await state.load(); state.storage.setItem(KEY, "value"); await state.flush();
  state.storage.removeItem(KEY); await state.flush();
  assert.equal(repository.data.get(KEY).value, null);
  state.stop(); assert.throws(() => state.storage.setItem(KEY, "late"));
});

test("quiz snapshots preserve automatic scores and self-assessment metadata", () => {
  const result = quizRecords("lern-trainer-database-progress-v1", JSON.stringify({ attempts: { sql: { correct: 2, count: 3, lastAssessment: "automatic", lastHelpUsed: true } } }));
  assert.equal(result[0].score, 2); assert.equal(result[0].max_score, 3); assert.equal(result[0].result.lastHelpUsed, true);
  const exams = quizRecords("lern-trainer-angewandte-mathe-v1", JSON.stringify({ examHistory: [
    { id: "exam-a", startedAt: 1, auto: 40 }, { id: "exam-a", startedAt: 2, auto: 50 },
  ] }));
  assert.notEqual(exams[0].quiz_id, exams[1].quiz_id);
  assert.deepEqual(exams.map((exam) => exam.score), [40, 50]);
  assert.equal(mergeGuestValue("plain account note", "guest note"), "plain account note");
});
