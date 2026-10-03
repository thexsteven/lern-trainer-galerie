import React, { useEffect, useState } from "react";
import { accountAction } from "../services/accountService.js";

export default function PrivateTrainer({ item, ...props }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setContent(null); setError(false);
    accountAction({ action: "private", slug: item.slug }).then((data) => {
      if (!active) return;
      if (data.kind === "lab") setContent({ html: data.content });
      else {
        const require = (name) => { if (name === "react") return React; throw new Error("Unbekanntes Modul"); };
        const Trainer = new Function("require", `${data.content}; return PrivateModule.default;`)(require);
        setContent({ Trainer });
      }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [item.slug]);
  if (error) return <p role="alert">Privater Trainer konnte nicht geladen werden. Anmeldung und Internetverbindung prüfen.</p>;
  if (!content) return <p role="status">Privater Trainer wird geladen …</p>;
  return content.Trainer ? <content.Trainer {...props} /> : <iframe className="lab-frame" sandbox="allow-scripts" title={item.title} srcDoc={content.html} />;
}
