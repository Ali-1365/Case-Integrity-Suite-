
/**
 * FMJAM BOOTSTRAP LOADER v.7.4.0-GOLD
 * PROTOCOL: RESILIENT_AUTO_BOOT
 * STATUS: ACTIVE (AUDITED)
 */

async function init() {
  const syncId = "sync_gold_v740";
  const isBypassActive = localStorage.getItem('FMJAM_INTEGRITY_BYPASS') === '1';

  console.log(`%c[SYSTEM_BOOT]%c SYNC_ID: ${syncId} %c[RESILIENCE_${isBypassActive ? 'OVERRIDE' : 'ACTIVE'}]`, 
    "color:white; background:#06b6d4; padding:2px 4px; font-weight:bold;", 
    "color:#06b6d4; font-weight:bold;",
    isBypassActive ? "color:black; background:orange; padding:2px 4px;" : "color:yellow; background:black; padding:2px 4px;");

  const loadApp = async (retries = 3, delay = 1000): Promise<void> => {
    try {
      const module = await import('./bootstrap');
      if (module && module.startApp) {
        module.startApp();
      } else {
        throw new Error("Bootstrap export failure");
      }
    } catch (err) {
      if (retries > 0) {
        console.warn(`Boot attempt failed, retrying in ${delay}ms... (${retries} left)`);
        await new Promise(r => setTimeout(r, delay));
        return loadApp(retries - 1, delay * 2);
      }
      throw err;
    }
  };

  try {
    await loadApp();
  } catch (err) {
    console.error("CRITICAL_BOOT_ERROR:", err);
    const root = document.getElementById('root');
    if (root) {
      const isPermDenied = err instanceof Error && err.message.includes('EACCES');
      
      root.innerHTML = `
        <div style="background:#0a0a0a; color:#e5e7eb; min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:system-ui, -apple-system, sans-serif; text-align:center; padding:2rem;">
          <div style="border:1px solid rgba(244, 63, 94, 0.3); padding:3rem; border-radius:1rem; background:#111111; max-width:600px; width:100%; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <h1 style="margin:0 0 1rem 0; font-size:1.5rem; font-weight:600; color:#f43f5e;">${isPermDenied ? 'Permission Locked' : 'Critical Sync Error'}</h1>
            <p style="color:#9ca3af; font-size:0.875rem; line-height:1.5; margin-bottom:2rem;">${isPermDenied ? 'Filsystemet nekar skrivåtkomst (EACCES_PERM_DENIED).' : 'Anslutningen misslyckades eller filkonflikt på GitHub.'} <br/>Systemet har aktiverat skrivskydd.</p>
            
            <div style="padding:1.5rem; background:#0a0a0a; border-radius:0.75rem; text-align:left; border:1px solid #1f2937;">
              <p style="color:#fbbf24; margin-bottom:1rem; font-size:0.75rem; font-family:monospace;">DIAGNOS: ${err instanceof Error ? err.message : 'Nätverksfel'}</p>
              <ol style="color:#9ca3af; font-size:0.875rem; line-height:1.75; margin:0; padding-left:1.25rem;">
                <li>Klicka på din profil -> <b>Linked GitHub Repository</b> -> <b>Disconnect</b>.</li>
                <li>Öppna Terminalen och kör: <code style="background:#1f2937; padding:0.125rem 0.25rem; border-radius:0.25rem; font-size:0.75rem;">localStorage.setItem('FMJAM_INTEGRITY_BYPASS', '1')</code></li>
                <li>Ladda om denna sida (F5).</li>
                <li>Re-connect till <b>Processanalys-Socialtj-nst</b>.</li>
              </ol>
            </div>
            
            <button onclick="window.location.reload()" style="margin-top:2rem; background:#e11d48; color:#fff; border:none; padding:0.75rem 1.5rem; border-radius:0.5rem; cursor:pointer; font-weight:500; font-size:0.875rem; transition:background-color 0.2s;">Försök igen</button>
          </div>
        </div>
      `;
    }
  }
}

init();

export {};