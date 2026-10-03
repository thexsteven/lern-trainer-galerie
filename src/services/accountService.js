import { supabase } from "../lib/supabase.js";

const checked = ({ data, error }) => { if (error) throw error; return data; };

export function userRepository(userId) {
  return {
    async load() {
      const [progress, settings] = await Promise.all([
        supabase.from("progress").select("trainer_id,value,revision").eq("user_id", userId),
        supabase.from("user_settings").select("key,value,revision").eq("user_id", userId),
      ]);
      return [...checked(progress).map((row) => ({ ...row, key: row.trainer_id })), ...checked(settings)];
    },
    async save(key, value, revision, quizzes) {
      return checked(await supabase.rpc("save_learning_state", { p_key: key, p_value: value, p_revision: revision, p_quizzes: quizzes }));
    },
  };
}

export async function loadProfile(user) {
  return checked(await supabase.from("profiles").select("display_name,course").eq("user_id", user.id).single());
}

export async function saveProfile(userId, profile) {
  return checked(await supabase.from("profiles").update(profile).eq("user_id", userId));
}

export async function privateAccess() {
  return checked(await supabase.rpc("has_private_access"));
}

export async function accountAction(body) {
  return checked(await supabase.functions.invoke("account", { body }));
}

export async function exportAccount(user) {
  const tables = ["profiles", "progress", "quiz_results", "user_settings"];
  const entries = await Promise.all(tables.map(async (table) => [table, checked(await supabase.from(table).select("*").eq("user_id", user.id))]));
  return { email: user.email, exported_at: new Date().toISOString(), ...Object.fromEntries(entries) };
}
