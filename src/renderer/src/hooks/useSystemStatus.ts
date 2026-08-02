import { useState, useEffect, useCallback } from 'react';
import { SystemStatus } from '../../../shared/types';

const CACHE_TTL_MS = 60_000; // 60 seconds cache TTL to avoid wasting compute/DB calls
const HEARTBEAT_INTERVAL_MS = 5 * 60_000; // 5 minutes gentle heartbeat for idle app sessions

// Module-level singleton state shared across all components using useSystemStatus
let globalStatus: SystemStatus | null = null;
let globalLastChecked = 0;
let globalIsLoading = false;
let globalIsOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let inFlightPromise: Promise<SystemStatus> | null = null;

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export async function fetchSystemStatusGlobal(force: boolean = false): Promise<SystemStatus> {
  const now = Date.now();

  // 1. Return cached status if checked recently and force is false
  if (!force && globalStatus && now - globalLastChecked < CACHE_TTL_MS) {
    return globalStatus;
  }

  // 2. Return in-flight promise if a request is already active
  if (inFlightPromise) {
    return inFlightPromise;
  }

  const currentOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  globalIsOnline = currentOnline;
  globalIsLoading = true;
  notifyListeners();

  inFlightPromise = (async () => {
    try {
      if (!window.api || !window.api.checkSystemStatus) {
        // Fallback for non-Electron / web preview
        const mockStatus: SystemStatus = {
          online: currentOnline,
          localDb: {
            connected: true,
            type: 'Local Storage / Web DB',
            productCount: 0,
            latencyMs: 1
          },
          remoteDb: {
            enabled: false,
            connected: false
          },
          checkedAt: new Date().toISOString()
        };
        globalStatus = mockStatus;
        globalLastChecked = Date.now();
        return mockStatus;
      }

      // Fetch system diagnostics via IPC
      const systemDiag = await window.api.checkSystemStatus();

      const updatedStatus: SystemStatus = {
        ...systemDiag,
        online: currentOnline,
        remoteDb: currentOnline
          ? systemDiag.remoteDb
          : { ...systemDiag.remoteDb, connected: false, error: 'Offline' }
      };

      globalStatus = updatedStatus;
      globalLastChecked = Date.now();
      return updatedStatus;
    } catch (err: any) {
      console.warn('[useSystemStatus] Failed to check status:', err);
      const errStatus: SystemStatus = {
        online: currentOnline,
        localDb: {
          connected: false,
          type: 'SQLite Engine',
          productCount: 0,
          latencyMs: 0,
          error: err?.message || 'Diagnostic Error'
        },
        remoteDb: {
          enabled: false,
          connected: false,
          error: 'Diagnostic Error'
        },
        checkedAt: new Date().toISOString()
      };
      globalStatus = errStatus;
      return errStatus;
    } finally {
      globalIsLoading = false;
      inFlightPromise = null;
      notifyListeners();
    }
  })();

  return inFlightPromise;
}

// Module-level global event subscriptions
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    globalIsOnline = true;
    notifyListeners();
    fetchSystemStatusGlobal(true);
  });

  window.addEventListener('offline', () => {
    globalIsOnline = false;
    if (globalStatus) {
      globalStatus = {
        ...globalStatus,
        online: false,
        remoteDb: { ...globalStatus.remoteDb, connected: false, error: 'Offline' }
      };
    }
    notifyListeners();
  });

  if (window.api && typeof window.api.onBackendStatusChanged === 'function') {
    window.api.onBackendStatusChanged(() => {
      fetchSystemStatusGlobal(true);
    });
  }

  // Kick off initial status check on app boot
  fetchSystemStatusGlobal(false);

  // 5-minute background heartbeat
  setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      fetchSystemStatusGlobal(true);
    }
  }, HEARTBEAT_INTERVAL_MS);
}

export function useSystemStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(globalIsOnline);
  const [status, setStatus] = useState<SystemStatus | null>(globalStatus);
  const [isLoading, setIsLoading] = useState<boolean>(globalIsLoading);

  useEffect(() => {
    const handleUpdate = () => {
      setIsOnline(globalIsOnline);
      setStatus(globalStatus);
      setIsLoading(globalIsLoading);
    };

    listeners.add(handleUpdate);
    handleUpdate();

    // If no status cached yet or cache expired, fetch
    if (!globalStatus || Date.now() - globalLastChecked >= CACHE_TTL_MS) {
      fetchSystemStatusGlobal(false);
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // Fast-poll every 5 seconds while remote DB is waking up / cold-starting
  useEffect(() => {
    if (!status?.remoteDb?.enabled || status.remoteDb.connected || !isOnline) {
      return;
    }

    const coldStartTimer = setInterval(() => {
      fetchSystemStatusGlobal(true);
    }, 5000);

    return () => clearInterval(coldStartTimer);
  }, [status?.remoteDb?.enabled, status?.remoteDb?.connected, isOnline]);

  const refreshStatus = useCallback(() => {
    fetchSystemStatusGlobal(true);
  }, []);

  return {
    isOnline,
    status,
    isLoading,
    refreshStatus
  };
}
