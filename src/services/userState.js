export const PERSONAL_KEY = "lern-trainer-personal-v1";
const keys = new Set([
  PERSONAL_KEY, "lern-trainer-learning-control-v1", "lern-trainer-angewandte-mathe-v1",
  "lern-trainer-angewandte-mathe-v1-backup-before-control", "lern-trainer-database-progress-v1",
  "appjs-level-quest-v1", "fsa-lernreise-v1",
]);

export const isLearningKey = (key) => keys.has(key) || key.startsWith("fsa-cheatsheet-note-v1:");

export function learningKeys(storage) {
  return Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key) => key && isLearningKey(key));
}

export function mergeGuestValue(account, guest) {
  if (account === null) return guest;
  try {
    const merge = (left, right) => {
      if (Array.isArray(left) && Array.isArray(right)) {
        const identity = (item) => item?.id || item?.roundId || JSON.stringify(item);
        const seen = new Set(left.map(identity));
        return [...left, ...right.filter((item) => !seen.has(identity(item)))];
      }
      if (left && right && typeof left === "object" && typeof right === "object") {
        const result = { ...right, ...left };
        for (const key of Object.keys(left)) if (key in right) result[key] = merge(left[key], right[key]);
        return result;
      }
      return left;
    };
    return JSON.stringify(merge(JSON.parse(account), JSON.parse(guest)));
  } catch {
    return account;
  }
}

export function quizRecords(key, value) {
  if (value === null) return [];
  let data;
  try { data = JSON.parse(value); } catch { return []; }
  if (key === "lern-trainer-learning-control-v1") return (data.sessions || []).filter((run) => run.result).map((run) => ({
    trainer_id: run.trainerSlug || run.action?.trainerSlug || key, quiz_id: run.id,
    score: run.result.score ?? null, max_score: null, result: run,
  }));
  if (key === "lern-trainer-database-progress-v1") return Object.entries(data.attempts || {}).map(([id, result]) => ({
    trainer_id: "datenbanken", quiz_id: id, score: result.correct, max_score: result.count, result,
  }));
  if (key === "lern-trainer-angewandte-mathe-v1") return (data.examHistory || []).map((run) => ({
    trainer_id: "mathe-klausurwerkstatt", quiz_id: `${run.id}:${run.startedAt}`, score: run.auto ?? null, max_score: null, result: run,
  }));
  return [];
}

export function createUserState({ local, userId, repository, onStatus = () => {} }) {
  const prefix = `lern-trainer-account:${userId}:`;
  const pendingKey = `${prefix}pending`;
  let pending = JSON.parse(local.getItem(pendingKey) || "{}");
  let stopped = false;
  let running = null;
  let timer;
  const conflicts = new Map();
  const read = (key) => JSON.parse(local.getItem(prefix + key) || "null");
  const write = (key, entry) => local.setItem(prefix + key, JSON.stringify(entry));
  const persistPending = () => local.setItem(pendingKey, JSON.stringify(pending));
  const publish = (status) => { if (!stopped) onStatus(status, [...conflicts.keys()]); };

  const storage = {
    getItem(key) { return read(key)?.value ?? null; },
    setItem(key, value) {
      if (stopped || !isLearningKey(key)) throw new Error("Speicher nicht verfügbar");
      const entry = read(key) || { revision: 0 };
      if (entry.value === String(value)) return;
      write(key, { ...entry, value: String(value) });
      pending[key] = true;
      persistPending();
      publish("pending");
      clearTimeout(timer);
      timer = setTimeout(() => flush(), 600);
    },
    removeItem(key) {
      if (stopped || !isLearningKey(key)) throw new Error("Speicher nicht verfügbar");
      write(key, { ...(read(key) || { revision: 0 }), value: null });
      pending[key] = true;
      persistPending();
      publish("pending");
      clearTimeout(timer);
      timer = setTimeout(() => flush(), 600);
    },
  };

  async function flush() {
    if (stopped) return;
    if (running) return running;
    running = (async () => {
      await Promise.resolve();
      try {
        for (const key of Object.keys(pending)) {
          if (stopped || conflicts.has(key)) continue;
          const entry = read(key);
          const result = await repository.save(key, entry.value, entry.revision, quizRecords(key, entry.value));
          if (stopped) return;
          if (!result.accepted) {
            conflicts.set(key, result.current);
            continue;
          }
          const latest = read(key);
          write(key, { ...latest, revision: result.revision });
          if (latest.value === entry.value) delete pending[key];
          persistPending();
        }
        publish(conflicts.size ? "conflict" : Object.keys(pending).length ? "pending" : "saved");
      } catch {
        publish("offline");
      } finally { running = null; }
    })();
    return running;
  }

  return {
    userId,
    storage,
    async load() {
      try {
        const entries = await repository.load();
        if (stopped) return;
        for (const entry of entries) {
          const key = entry.key;
          if (pending[key]) {
            if ((read(key)?.revision || 0) !== entry.revision) conflicts.set(key, entry);
          } else write(key, { value: entry.value, revision: entry.revision });
        }
        await flush();
      } catch { publish("offline"); }
    },
    flush,
    importGuest() {
      for (const key of learningKeys(local)) storage.setItem(key, mergeGuestValue(storage.getItem(key), local.getItem(key)));
      local.setItem(`${prefix}import-decided`, "true");
      return flush();
    },
    needsImport: () => local.getItem(`${prefix}import-decided`) !== "true" && learningKeys(local).length > 0,
    skipImport: () => local.setItem(`${prefix}import-decided`, "true"),
    async resolveConflict(useLocal) {
      for (const [key, remote] of conflicts) {
        write(key, { value: useLocal ? storage.getItem(key) : remote.value, revision: remote.revision });
        if (!useLocal) delete pending[key];
      }
      conflicts.clear();
      persistPending();
      await flush();
    },
    exportLocal() {
      const result = {};
      for (let index = 0; index < local.length; index++) {
        const key = local.key(index);
        if (key.startsWith(prefix) && isLearningKey(key.slice(prefix.length))) result[key.slice(prefix.length)] = read(key.slice(prefix.length))?.value;
      }
      return result;
    },
    clear() {
      const remove = [];
      for (let index = 0; index < local.length; index++) if (local.key(index).startsWith(prefix)) remove.push(local.key(index));
      remove.forEach((key) => local.removeItem(key));
    },
    stop() { stopped = true; clearTimeout(timer); },
  };
}
