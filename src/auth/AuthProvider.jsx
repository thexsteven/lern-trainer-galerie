import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { accountAction, loadProfile, privateAccess, userRepository } from "../services/accountService.js";
import { createUserState } from "../services/userState.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(supabase));
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [allowPrivate, setAllowPrivate] = useState(false);
  const [privateItems, setPrivateItems] = useState([]);
  const [status, setStatus] = useState("saved");
  const [conflicts, setConflicts] = useState([]);
  const [importPending, setImportPending] = useState(false);
  const [generation, setGeneration] = useState(0);
  const controller = useRef(null);
  const user = session?.user || null;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let authChanged = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      authChanged = true;
      setSession(next);
      setInitializing(false);
      if (event === "PASSWORD_RECOVERY") {
        window.history.replaceState({}, "", "/passwort-zuruecksetzen");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authChanged) return;
      setSession(error ? null : data.session);
      setInitializing(false);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (initializing) return;
    let active = true;
    setReady(false);
    setProfile(null);
    setAllowPrivate(false);
    setPrivateItems([]);
    setImportPending(false);
    setConflicts([]);
    if (!user) {
      controller.current = null;
      setReady(true);
      return;
    }
    const state = createUserState({ local: window.localStorage, userId: user.id, repository: userRepository(user.id),
      onStatus: (next, nextConflicts) => { if (active) { setStatus(next); setConflicts(nextConflicts); } },
    });
    controller.current = state;
    const profileKey = `lern-trainer-account:${user.id}:profile`;
    async function initialize() {
      await Promise.all([
        state.load(),
        loadProfile(user).then((next) => {
          if (active) { setProfile(next); window.localStorage.setItem(profileKey, JSON.stringify(next)); }
        }).catch(() => {
          if (active) setProfile(JSON.parse(window.localStorage.getItem(profileKey) || "null"));
        }),
        privateAccess().then(async (allowed) => {
          if (!allowed) return;
          const { items } = await accountAction({ action: "catalog" });
          if (active) { setPrivateItems(items); setAllowPrivate(true); }
        }).catch(() => {}),
      ]);
      if (active) { setImportPending(state.needsImport()); setReady(true); }
    }
    initialize();
    const sync = () => state.flush();
    window.addEventListener("online", sync);
    const interval = window.setInterval(sync, 30000);
    return () => { active = false; state.stop(); window.removeEventListener("online", sync); window.clearInterval(interval); };
  }, [user?.id, initializing]);

  async function signOut() {
    await controller.current?.flush();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function chooseImport(importData) {
    if (importData) await controller.current.importGuest();
    else controller.current.skipImport();
    setImportPending(false);
    setGeneration((current) => current + 1);
  }

  async function resolveConflict(useLocal) {
    await controller.current.resolveConflict(useLocal);
    setGeneration((current) => current + 1);
  }

  const sameUser = !user || controller.current?.userId === user.id;
  return <AuthContext.Provider value={{ user, session, ready: ready && !initializing && sameUser, profile, setProfile,
    allowPrivate: Boolean(user && sameUser && allowPrivate), privateItems, status, conflicts, importPending, generation, chooseImport, resolveConflict, signOut,
    controller: controller.current, storage: user ? controller.current?.storage : window.localStorage,
    configured: Boolean(supabase),
  }}>{children}</AuthContext.Provider>;
}
