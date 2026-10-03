import React from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "./auth/AuthProvider.jsx";
import Runtime from "./auth/Runtime.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider><Runtime /></AuthProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("/sw.js");
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) => new URL(registration.scope).pathname.startsWith("/compiler-parser/")).map((registration) => registration.unregister()));
  });
}
