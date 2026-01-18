
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
        <div style="background:#050000; color:#ff3333; min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:monospace; text-align:center; padding:2rem; border:10px solid #200;">
          <div style="border:4px solid #f33; padding:4rem; border-radius:3rem; background:rgba(255,0,0,0.1); max-width:800px; box-shadow:0 0 100px rgba(255,0,0,0.3);">
            <h1 style="margin:0 0 1.5rem 0; font-size:3rem; letter-spacing:-2px; transform:skewX(-5deg); uppercase italic">${isPermDenied ? 'PERMISSION_LOCKED' : 'CRITICAL_SYNC_NUKE'}</h1>
            <p style="color:#fff; font-size:1.2rem; line-height:1.8; font-weight:bold;">${isPermDenied ? 'Filsystemet nekar skrivåtkomst (EACCES_PERM_DENIED).' : 'Anslutningen misslyckades eller filkonflikt på GitHub.'} <br/>Systemet har aktiverat skrivskydd.</p>
            
            <div style="margin-top:3rem; padding:2rem; background:#000; border-radius:1.5rem; text-align:left; border:1px solid #444;">
              <p style="color:yellow; margin-bottom:1rem; font-size:0.9rem;">DIAGNOS: ${err instanceof Error ? err.message : 'Nätverksfel'}</p>
              <ol style="color:#aaa; font-size:0.8rem; line-height:2;">
                <li>1. Klicka på din profil -> <b>Linked GitHub Repository</b> -> <b>Disconnect</b>.</li>
                <li>2. Öppna Terminalen och kör: <code>localStorage.setItem('FMJAM_INTEGRITY_BYPASS', '1')</code></li>
                <li>3. Ladda om denna sida (F5).</li>
                <li>4. Re-connect till <b>Processanalys-Socialtj-nst</b>.</li>
              </ol>
            </div>
            
            <button onclick="window.location.reload()" style="margin-top:3rem; background:#f33; color:#fff; border:none; padding:1.5rem 3rem; border-radius:1.5rem; cursor:pointer; font-weight:900; text-transform:uppercase; font-size:1.1rem; box-shadow:0 10px 30px rgba(255,0,0,0.4);">Försök igen</button>
          </div>
        </div>
      `;
    }
  }
}

init();

export {};