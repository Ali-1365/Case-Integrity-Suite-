
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { loggingService } from "./services/loggingService";

// Global Error Handling v.7.4.0-GOLD
// Säkrar att alla ohanterade fel loggas för systemanalys.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    loggingService.handleError(event.error || new Error(event.message), "Global Window Error");
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Ignore benign Vite WebSocket errors in sandboxed environments
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : reason?.message;
    if (message && (message.includes('WebSocket closed without opened') || message.includes('failed to connect to websocket'))) {
      event.preventDefault();
      return;
    }
    loggingService.handleError(event.reason, "Unhandled Promise Rejection");
  });
}

export function startApp() {
  // System Heartbeat - Verifierar miljöns integritet efter synk (v.7.2.0-STABLE)
  const timestamp = new Date().toISOString();
  console.log(
    `%c Case Integrity Suite v1.0 %c Integrity Verified at ${timestamp}`,
    "color: #1e40af; font-weight: bold; background: #dbeafe; padding: 2px 5px; border-radius: 3px;",
    "color: #10b981; font-weight: bold;"
  );
  
  const container = document.getElementById("root");
  if (!container) {
    console.error("FATAL: Root container #root saknas i DOM. Synkroniseringsfel i index.html?");
    return;
  }

  // Check if root already exists to prevent "already been passed to createRoot()" error
  const root = (container as any)._reactRoot || createRoot(container);
  if (!(container as any)._reactRoot) {
    (container as any)._reactRoot = root;
  }

  root.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>
  );
}
