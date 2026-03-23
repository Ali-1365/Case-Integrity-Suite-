
import { loggingService } from './loggingService';

export type OfflineReason = 'API_KEY_MISSING' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'MANUAL' | null;

class OfflineService {
    private isOffline: boolean = false;
    private reason: OfflineReason = null;
    private listeners: ((isOffline: boolean, reason: OfflineReason) => void)[] = [];
    private recoveryTimer: any = null;

    constructor() {
        // Check if we were offline in previous session
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('cis_offline_mode');
            if (saved === 'true') {
                this.isOffline = true;
                this.reason = 'MANUAL';
            }
            this.syncToWindow();
        }
    }

    private syncToWindow() {
        if (typeof window !== 'undefined') {
            (window as any).OFFLINE_MODE = this.isOffline;
            (window as any).OFFLINE_REASON = this.reason;
        }
    }

    public setOffline(offline: boolean, reason: OfflineReason = null) {
        if (this.isOffline === offline && this.reason === reason) return;
        
        const wasOffline = this.isOffline;
        this.isOffline = offline;
        this.reason = offline ? reason : null;
        this.syncToWindow();
        
        if (offline) {
            loggingService.warn(`[OFFLINE] Systemet har växlat till OFFLINE-LÄGE. Orsak: ${reason}`);
            if (typeof window !== 'undefined') {
                localStorage.setItem('cis_offline_mode', 'true');
            }
        } else {
            loggingService.info(`[OFFLINE] Systemet är nu ONLINE.`);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cis_offline_mode');
            }
        }

        this.notify();

        if (offline) {
            if (reason === 'QUOTA_EXCEEDED' || reason === 'NETWORK_ERROR') {
                // Recovery polling will be started by the service that can check status
            }
        }
    }

    public getIsOffline(): boolean {
        return this.isOffline || (typeof window !== 'undefined' && (window as any).OFFLINE_MODE === true);
    }

    public getReason(): OfflineReason {
        return this.reason;
    }

    public subscribe(listener: (isOffline: boolean, reason: OfflineReason) => void) {
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
