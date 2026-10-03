import React, { useEffect, useRef, useState } from "react";
import { useLearningStorage } from "./learningStorage.jsx";

export default function LearningLab({ item }) {
  const storage = useLearningStorage();
  const frame = useRef(null);
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setHtml(""); setFailed(false);
    fetch(item.url.endsWith("/") ? `${item.url}index.html` : item.url, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Lernlabor nicht verfügbar");
      return response.text();
    }).then(setHtml).catch((error) => { if (error.name !== "AbortError") setFailed(true); });
    return () => controller.abort();
  }, [item.url]);
  // Existing trusted same-origin labs keep their storage API; only its account scope changes.
  const ref = (element) => {
    frame.current = element;
    if (element) element.learningStorage = storage;
  };
  if (failed) return <p role="alert">Lernlabor konnte nicht geladen werden.</p>;
  if (!html) return <p role="status">Lernlabor wird geladen …</p>;
  const bootstrap = `<script>Object.defineProperty(window, 'localStorage', {value: window.frameElement.learningStorage});</script>`;
  const document = html.replace(/<head([^>]*)>/i, `<head$1><base href="${item.url}">${bootstrap}`);
  return <iframe ref={ref} className="lab-frame" title={item.title} srcDoc={document} />;
}
