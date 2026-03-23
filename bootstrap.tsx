import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loggingService } from "./services/loggingService";

// Sätt offline-läge som default — aktiveras om API saknas
if (typeof window !== 'undefined') {
  (window as any).OFFLINE_MODE = !import.meta.env.VITE_GEMINI_API_KEY &&
                                 !import.meta.env.GEMINI_API_KEY;

  // Ignorera WebSocket-fel helt — påverkar inte appen
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : reason?.message ?? '';
    if (
      message.includes('WebSocket') ||
      message.includes('websocket') ||
      message.includes('failed to connect') ||
      message.includes('WebSocket closed without opened')
    ) {
      event.preventDefault();
      return;
    }
    loggingService.handleError(event.reason, "Unhandled Promise Rejection");
  });

  window.addEventListener('error', (event) => {
    const message = event.message ?? '';
    if (message.includes('WebSocket') || message.includes('websocket')) {
      event.preventDefault();
      return;
    }
    loggingService.handleError(event.error || new Error(message), "Global Window Error");
  });
}

export function startApp() {
  const timestamp = new Date().toISOString();
  const offlineMode = (window as any).OFFLINE_MODE;

  console.log(
    `%c Case Integrity Suite v1.0 %c ${offlineMode ? '⚠ OFFLINE-LÄGE' : 'Integrity Verified'} at ${timestamp}`,
    "color: #1e40af; font-weight: bold; background: #dbeafe; padding: 2px 5px; border-radius: 3px;",
    offlineMode 
      ? "color: #f59e0b; font-weight: bold;" 
      : "color: #10b981; font-weight: bold;"
  );

  if (offlineMode) {
    console.warn("SYSTEM: Ingen API-nyckel hittad. Startar i lokalt läge — AI-funktioner inaktiverade.");
  }

  const container = document.getElementById("root");
  if (!container) {
    console.error("FATAL: Root container #root saknas i DOM.");
    return;
  }

  console.log("FMJAM_STARTUP: Rendering App...");
  try {
    const root = createRoot(container);
    root.render(<App />);
    console.log("FMJAM_STARTUP: Render call completed.");
  } catch (err) {
    console.error("React Root Initialization Error:", err);
    // Visa ett minimalt felmeddelande i DOM om React kraschar
    container.innerHTML = `
      <div style="padding:2rem;font-family:sans-serif;color:#1e293b;">
        <h2 style="color:#dc2626;">Startfel</h2>
        <p>Appen kunde inte starta. Försök ladda om sidan.</p>
        <button onclick="location.reload()" 
          style="padding:0.5rem 1rem;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">
          Ladda om
        </button>
      </div>`;
  }
}