
import { loggingService } from './loggingService';

export type OfflineReason = 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'API_KEY_MISSING' | 'MANUAL';

class OfflineService {
    private isOffline: boolean = false;
    private reason: OfflineReason | null = null;
    private listeners: ((isOffline: boolean, reason: OfflineReason | null) => void)[] = [];

    constructor() {
        // Check if we were offline in previous session (optional, maybe better to start fresh)
        const saved = localStorage.getItem('cis_offline_mode');
        if (saved === 'true') {
            this.isOffline = true;
            this.reason = 'MANUAL';
        }
    }

    public setOffline(offline: boolean, reason: OfflineReason | null = null) {
        if (this.isOffline === offline && this.reason === reason) return;
        
        this.isOffline = offline;
        this.reason = offline ? reason : null;
        
        if (offline) {
            loggingService.warn(`[OFFLINE] Systemet har växlat till OFFLINE-LÄGE. Orsak: ${reason}`);
            localStorage.setItem('cis_offline_mode', 'true');
        } else {
            loggingService.info(`[OFFLINE] Systemet är nu ONLINE.`);
            localStorage.removeItem('cis_offline_mode');
        }

        this.notify();
    }

    public getIsOffline(): boolean {
        return this.isOffline;
    }

    public getReason(): OfflineReason | null {
        return this.reason;
    }

    public subscribe(listener: (isOffline: boolean, reason: OfflineReason | null) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.isOffline, this.reason));
    }
}

export const offlineService = new OfflineService();
