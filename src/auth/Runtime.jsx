import React, { useEffect, useState } from "react";
import App from "../App.jsx";
import { useAuth } from "./AuthProvider.jsx";
import { LearningStorageContext } from "./learningStorage.jsx";
import AccountPage from "./AccountPage.jsx";
import LegalPage from "../pages/LegalPage.jsx";
import "./account.css";

const modes = { "/login": "login", "/registrieren": "register", "/passwort-vergessen": "forgot", "/passwort-zuruecksetzen": "reset", "/konto": "profile", "/einstellungen": "profile" };

export default function Runtime() {
  const auth = useAuth();
  const [path, setPath] = useState(window.location.pathname);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const change = () => setPath(window.location.pathname);
    window.addEventListener("popstate", change);
    return () => window.removeEventListener("popstate", change);
  }, []);
  const action = async (fn) => {
    setBusy(true); setActionError("");
    try { await fn(); } catch { setActionError("Die Änderung konnte nicht gespeichert werden. Bitte erneut versuchen."); }
    finally { setBusy(false); }
  };
  if (!auth.ready && !["/impressum", "/datenschutz"].includes(path)) return <p className="account-loading" role="status">Lernstand wird geladen …</p>;
  const courseMember = auth.user ? auth.profile?.course === "T-INF 25" : window.localStorage.getItem("lern-trainer-guest-course") === "T-INF 25";
  return <LearningStorageContext.Provider value={auth.storage}>
    <div className="account-strip"><a href="/">Lern·Trainer</a><span>{auth.user ? `${auth.user.email} · ${auth.status === "saved" ? "Synchronisiert" : auth.status === "conflict" ? "Speicherkonflikt" : auth.status === "pending" ? "Synchronisierung ausstehend" : "Offline · lokal gespeichert"}` : "Gast · Speicherung nur in diesem Browser"}</span><a href="/konto">{auth.user ? "Mein Konto" : "Gast / Konto"}</a></div>
    {auth.importPending && <section className="account-notice" aria-label="Gast-Lernstand übernehmen"><h2>Gast-Lernstand übernehmen?</h2><p>Lokale Lernstände werden ergänzt. Bei gleichen Einträgen bleibt der Kontostand erhalten. Der Gaststand bleibt getrennt bestehen.</p><button disabled={busy} onClick={() => action(() => auth.chooseImport(true))}>Gast-Lernstand übernehmen</button><button disabled={busy} onClick={() => action(() => auth.chooseImport(false))}>Ohne Übernahme fortfahren</button></section>}
    {!!auth.conflicts.length && <section className="account-notice" role="alert"><h2>Neuere Daten auf einem anderen Gerät</h2><p>Deine Änderungen bleiben lokal erhalten. Wähle, welchen Stand du für die betroffenen Speicherbereiche verwenden möchtest.</p><button disabled={busy} onClick={() => action(() => auth.resolveConflict(false))}>Kontostand laden</button><button disabled={busy} onClick={() => { if (window.confirm("Die neueren Kontodaten dieser Speicherbereiche durch den lokalen Stand ersetzen?")) action(() => auth.resolveConflict(true)); }}>Lokalen Stand verwenden</button></section>}
    {actionError && <p role="alert">{actionError}</p>}
    {["/impressum", "/datenschutz"].includes(path) ? <LegalPage privacy={path === "/datenschutz"} /> : modes[path] ? <AccountPage key={`${auth.user?.id || "guest"}:${path}`} mode={modes[path]} /> : <App key={`${auth.user?.id || "guest"}:${auth.generation}`} storage={auth.storage} allowPrivate={auth.allowPrivate} privateItems={auth.privateItems} courseMember={courseMember} accountMode={Boolean(auth.user)} />}
    <footer className="legal-footer"><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a><a href="/konto">Konto & Einstellungen</a></footer>
  </LearningStorageContext.Provider>;
}
