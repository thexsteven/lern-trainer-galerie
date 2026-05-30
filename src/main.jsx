import React from "react";
import { createRoot } from "react-dom/client";
import Gallery from "./Gallery.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Gallery />
  </React.StrictMode>
);
