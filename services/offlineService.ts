export type OfflineReason = 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'API_KEY_MISSING' | 'MANUAL' | null;

class OfflineService {
  private _isOffline: boolean = false;
  private _reason: OfflineReason = null;
  private _subscribers: ((offline: boolean, reason: OfflineReason) => void)[] = [];

  constructor() {
    this.syncFromWindow();

    // Listen for manual changes to window.OFFLINE_MODE if any other script modifies it
    if (typeof window !== 'undefined') {
      const originalSetItem = localStorage.setItem;
      // We can periodically sync or just rely on our own setOffline method.
      // For full bidirectionality, let's add a setter to window if possible, but
      // for now, we'll initialize from window state.
      setInterval(() => {
        this.syncFromWindow();
      }, 1000);
    }
  }

  private syncFromWindow() {
    if (typeof window !== 'undefined') {
      const winOffline = (window as any).OFFLINE_MODE;
      const winReason = (window as any).OFFLINE_REASON;

      if (winOffline !== undefined && winOffline !== this._isOffline) {
        this._isOffline = winOffline;
        this._reason = winReason || null;
        this.notifySubscribers();
      }
    }
  }

  public setOffline(offline: boolean, reason: OfflineReason = null): void {
    if (this._isOffline === offline && this._reason === reason) return;

    this._isOffline = offline;
    this._reason = reason;

    if (typeof window !== 'undefined') {
      (window as any).OFFLINE_MODE = offline;
      (window as any).OFFLINE_REASON = reason;
    }

    this.notifySubscribers();
  }

  public getIsOffline(): boolean {
    return this._isOffline;
  }

  public getReason(): OfflineReason {
    return this._reason;
  }

  public subscribe(listener: (isOffline: boolean, reason: OfflineReason) => void): () => void {
    this._subscribers.push(listener);
    // Immediately call listener with current state
    listener(this._isOffline, this._reason);

    return () => {
      this._subscribers = this._subscribers.filter(l => l !== listener);
    };
  }

  private notifySubscribers() {
    this._subscribers.forEach(l => l(this._isOffline, this._reason));
  }
}

export const offlineService = new OfflineService();
export default offlineService;
