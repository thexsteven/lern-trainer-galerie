import React, { useState } from "react";
import { useAuth } from "./AuthProvider.jsx";
import { supabase } from "../lib/supabase.js";
import { accountAction, exportAccount, saveProfile } from "../services/accountService.js";
import { learningKeys } from "../services/userState.js";

export function downloadData(data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "lerntrainer-meine-daten.json";
  link.click();
  URL.revokeObjectURL(url);
}

function authError(error) {
  if (["invalid_credentials", "invalid_grant"].includes(error?.code)) return "E-Mail oder Passwort ist nicht korrekt.";
  if (error?.code === "email_not_confirmed") return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (error?.code === "email_address_not_authorized") return "Der E-Mail-Versand ist noch nicht für öffentliche Registrierungen eingerichtet.";
  if (error?.status === 429) return "Zu viele Versuche. Bitte versuche es später erneut.";
  return "Die Anfrage ist fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.";
}

export default function AccountPage({ mode }) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState(auth.profile?.display_name || "");
  const [course, setCourse] = useState(auth.user ? auth.profile?.course === "T-INF 25" : window.localStorage.getItem("lern-trainer-guest-course") === "T-INF 25");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const run = async (action) => {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(authError(error)); }
    finally { setBusy(false); }
  };

  if (mode === "profile") return <section className="page account-page account-settings">
    <a className="account-back" href="/">← Zurück zum Lernen</a>
    <header className="account-heading">
    <div className="account-avatar" aria-hidden="true">{(auth.profile?.display_name || auth.user?.email || "G").slice(0, 1).toUpperCase()}</div>
    <div><p className="eyebrow">DEIN LERNTRAINER</p>
    <h1>{auth.user ? "Konto & Einstellungen" : "Als Gast lernen"}</h1>
    <p>{auth.user ? auth.user.email : "Dein Lernstand bleibt auf diesem Gerät."}</p></div>
    </header>
    {!auth.user && <div className="account-guest-entry"><p>Mit einem Konto kannst du deinen Lernstand auf mehreren Geräten nutzen. Beim Löschen der Browserdaten geht dein Gast-Lernstand verloren.</p><div className="account-entry-actions"><a className="primary-button" href="/registrieren">Account erstellen</a><a className="secondary-button" href="/login">Anmelden</a></div></div>}
    <div className="account-settings-grid">
    <section className="account-card" aria-labelledby="account-profile-title">
    <h2 id="account-profile-title">Dein Profil</h2>
    <p className="account-description">{auth.user ? "Passe deinen Namen und deine Kurszugehörigkeit an." : "Wähle, welche Kursinformationen du sehen möchtest."}</p>
    <form onSubmit={(event) => { event.preventDefault(); run(async () => {
      if (auth.user) {
        const profile = { display_name: name.trim(), course: course ? "T-INF 25" : null, updated_at: new Date().toISOString() };
        await saveProfile(auth.user.id, profile);
        auth.setProfile(profile);
        window.localStorage.setItem(`lern-trainer-account:${auth.user.id}:profile`, JSON.stringify(profile));
      } else window.localStorage.setItem("lern-trainer-guest-course", course ? "T-INF 25" : "");
      setMessage("Einstellungen gespeichert.");
    }); }}>
      {auth.user && <label>Anzeigename (optional)<input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>}
      <div className="account-course"><label className="account-checkbox"><input type="checkbox" checked={course} onChange={(event) => setCourse(event.target.checked)} />Ich gehöre zum Kurs T-INF 25</label>
      <p>Zeigt die gemeinsamen Prüfungstermine dieses Kurses an.</p></div>
      <button className="primary-button" disabled={busy}>Einstellungen speichern</button>
    </form>
    {message && <p className="account-feedback" role="status">{message}</p>}
    </section>
    <div className="account-aside">
    <section className="account-card" aria-labelledby="account-data-title">
    <h2 id="account-data-title">Deine Lerndaten</h2>
    <p>Lade eine Kopie deiner Lernstände und Einstellungen als JSON-Datei herunter.</p>
    <button className="secondary-button" disabled={busy} onClick={() => run(async () => {
      const local = auth.user ? auth.controller.exportLocal() : Object.fromEntries(learningKeys(window.localStorage).map((key) => [key, window.localStorage.getItem(key)]));
      downloadData({ ...(auth.user ? await exportAccount(auth.user) : { mode: "guest" }), local, sync_status: auth.status });
    })}>Daten exportieren</button>
    </section>
    {auth.user && <section className="account-card account-session"><div><h2>Deine Sitzung</h2><p>Auf diesem Gerät angemeldet.</p></div><button className="secondary-button" disabled={busy} onClick={() => run(auth.signOut)}>Abmelden</button></section>}
    </div></div>
    {auth.user ? <>
      <details className="account-card account-danger"><summary>Account löschen</summary><p>Dein Konto und alle zugehörigen Daten werden gelöscht. Nicht synchronisierte Kontodaten in anderen Browsern müssen dort zusätzlich gelöscht werden.</p>
      <label>Zur Bestätigung LÖSCHEN eingeben<input value={deleteConfirm} onChange={(event) => setDeleteConfirm(event.target.value)} autoComplete="off" /></label>
      <button className="danger-button" disabled={busy || deleteConfirm !== "LÖSCHEN"} onClick={() => run(async () => {
        await accountAction({ action: "delete", confirm: "LÖSCHEN" });
        auth.controller.stop(); auth.controller.clear();
        await supabase.auth.signOut({ scope: "local" });
        window.location.assign("/");
      })}>Account endgültig löschen</button></details></> : <button className="danger-button" onClick={() => {
        if (!window.confirm("Alle Gast-Lernstände in diesem Browser löschen?")) return;
        learningKeys(window.localStorage).forEach((key) => window.localStorage.removeItem(key));
        window.location.reload();
      }}>Gast-Lernstand löschen</button>}
  </section>;

  const titles = { login: "Anmelden", register: "Account erstellen", forgot: "Passwort vergessen", reset: "Neues Passwort setzen" };
  return <section className="page account-page"><h1>{titles[mode]}</h1>
    {!auth.configured ? <p>Die Kontoanmeldung ist noch nicht konfiguriert. Du kannst als Gast weiterlernen.</p> : <form onSubmit={(event) => {
      event.preventDefault();
      run(async () => {
        let result;
        if (mode === "register") {
          result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/konto`, data: { course: course ? "T-INF 25" : null } } });
          if (!result.error) setMessage("Bitte bestätige deine E-Mail-Adresse über den zugesandten Link. Danach kannst du dich anmelden.");
        } else if (mode === "forgot") {
          result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/passwort-zuruecksetzen` });
          if (!result.error) setMessage("Falls ein Konto existiert, erhältst du eine E-Mail zum Zurücksetzen.");
        } else if (mode === "reset") {
          if (!auth.user) { setMessage("Öffne zuerst den Link aus der Passwort-E-Mail."); return; }
          result = await supabase.auth.updateUser({ password });
          if (!result.error) { setPassword(""); setMessage("Passwort geändert."); }
        } else {
          result = await supabase.auth.signInWithPassword({ email, password });
          if (!result.error) window.location.assign("/konto");
        }
        if (result.error) throw result.error;
      });
    }}>
      {mode !== "reset" && <label>E-Mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
      {mode !== "forgot" && <div><label htmlFor="account-password">Passwort</label><div className="account-password"><input id="account-password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="secondary-button" aria-controls="account-password" aria-pressed={showPassword} onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Verbergen" : "Anzeigen"}</button></div></div>}
      {mode === "register" && <><label className="account-checkbox"><input type="checkbox" checked={course} onChange={(event) => setCourse(event.target.checked)} />Ich gehöre zum Kurs T-INF 25</label><p>Mit der Registrierung bestätigst du, dass du die <a href="/datenschutz">Datenschutzerklärung</a> zur Kenntnis genommen hast.</p></>}
      <button className="primary-button" disabled={busy || (mode === "reset" && !auth.user)}>{busy ? "Bitte warten …" : titles[mode]}</button>
    </form>}
    {message && <p role="status">{message}</p>}
    <p><a href="/login">Anmelden</a> · <a href="/registrieren">Registrieren</a> · <a href="/passwort-vergessen">Passwort vergessen</a></p><a href="/">Als Gast weiterlernen →</a>
  </section>;
}
