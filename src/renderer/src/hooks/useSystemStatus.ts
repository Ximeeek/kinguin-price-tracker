import { useState, useEffect, useCallback, useRef } from 'react';
import { SystemStatus } from '../../../shared/types';

const CACHE_TTL_MS = 60_000; // 60 seconds cache TTL to avoid wasting compute/DB calls
const HEARTBEAT_INTERVAL_MS = 5 * 60_000; // 5 minutes gentle heartbeat for idle app sessions

export function useSystemStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const lastCheckedRef = useRef<number>(0);
  const statusRef = useRef<SystemStatus | null>(status);
  statusRef.current = status;

  // Stable checkStatus function with empty dependency array
  const checkStatus = useCallback(async (force: boolean = false) => {
    const now = Date.now();

    // 1. Return cached status if checked recently and force is false
    if (!force && statusRef.current && now - lastCheckedRef.current < CACHE_TTL_MS) {
      return;
    }

    const currentOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(currentOnline);

    setIsLoading(true);
    try {
      if (!window.api || !window.api.checkSystemStatus) {
        // Fallback for non-Electron / web preview
        setStatus({
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
        });
        lastCheckedRef.current = now;
        return;
      }

      // 2. Fetch system diagnostics via IPC
      const systemDiag = await window.api.checkSystemStatus();
      
      // Override online with real-time navigator.onLine status
      const updatedStatus: SystemStatus = {
        ...systemDiag,
        online: currentOnline,
        // If navigator is offline, mark remote DB as offline short-circuit
        remoteDb: currentOnline
          ? systemDiag.remoteDb
          : { ...systemDiag.remoteDb, connected: false, error: 'Offline' }
      };

      setStatus(updatedStatus);
      lastCheckedRef.current = now;
    } catch (err: any) {
      console.warn('[useSystemStatus] Failed to check status:', err);
      setStatus({
        online: currentOnline,
        localDb: {
          connected: false,
          type: 'SQLite Engine',
          productCount: 0,
          latencyMs: 0,
          error: err.message
        },
        remoteDb: {
          enabled: false,
          connected: false,
          error: 'Diagnostic Error'
        },
        checkedAt: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependencies for 100% stable reference

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkStatus(true); // Re-check DB when network connection is restored
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              online: false,
              remoteDb: { ...prev.remoteDb, connected: false, error: 'Offline' }
            }
          : null
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to IPC event when backend transitions from offline/cold-start to online
    let unsubscribeStatus: (() => void) | undefined;
    if (window.api && typeof window.api.onBackendStatusChanged === 'function') {
      unsubscribeStatus = window.api.onBackendStatusChanged(() => {
        checkStatus(true);
      });
    }

    // Initial load check
    checkStatus();

    // 5-minute gentle background heartbeat for long idle app sessions
    const heartbeatTimer = setInterval(() => {
      if (navigator.onLine) {
        checkStatus(true);
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeStatus) unsubscribeStatus();
      clearInterval(heartbeatTimer);
    };
  }, [checkStatus]);

  // Fast-poll every 5 seconds while remote DB is waking up / cold-starting
  useEffect(() => {
    if (!status?.remoteDb?.enabled || status.remoteDb.connected || !isOnline) {
      return;
    }

    const coldStartTimer = setInterval(() => {
      checkStatus(true);
    }, 5000);

    return () => clearInterval(coldStartTimer);
  }, [status?.remoteDb?.enabled, status?.remoteDb?.connected, isOnline, checkStatus]);

  return {
    isOnline,
    status,
    isLoading,
    refreshStatus: () => checkStatus(true)
  };
}
