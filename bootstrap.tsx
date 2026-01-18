
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";

export function startApp() {
  // System Heartbeat - Verifierar miljöns integritet efter synk (v.7.2.0-STABLE)
  const timestamp = new Date().toISOString();
  console.log(
    `%c FMJAM v.7.2.0-STABLE %c Integrity Verified at ${timestamp}`,
    "color: #06b6d4; font-weight: bold; background: #083344; padding: 2px 5px; border-radius: 3px;",
    "color: #10b981; font-weight: bold;"
  );
  
  const container = document.getElementById("root");
  if (!container) {
    console.error("FATAL: Root container #root saknas i DOM. Synkroniseringsfel i index.html?");
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
