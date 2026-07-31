import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function showError(err) {
  const root = document.getElementById("root");
  root.innerHTML =
    '<div style="direction:ltr;text-align:left;background:#1a0000;color:#ffb3b3;padding:20px;font-family:monospace;font-size:13px;white-space:pre-wrap;min-height:100vh;">' +
    "ERROR:\n" + (err && err.message ? err.message : String(err)) +
    "\n\nSTACK:\n" + (err && err.stack ? err.stack : "no stack") +
    "</div>";
}

window.addEventListener("error", (e) => showError(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason));

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  showError(err);
}
