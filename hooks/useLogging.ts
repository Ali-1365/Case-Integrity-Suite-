import { useState, useEffect, useCallback } from 'react';
import { loggingService, LogEntry } from '../services/loggingService';

/**
 * Custom hook for accessing and managing system logs.
 */
export const useLogging = (limit: number = 50) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    const allLogs = loggingService.getLogs();
    const newLogs = allLogs.slice(0, limit);

    setLogs(prevLogs => {
      // Fast bailout: check array length and newest item ID to prevent expensive re-renders on unchanged data.
      // Since logs are unshifted (newest first), if length and [0].id match, the slice is likely identical.
      if (prevLogs.length === newLogs.length && (newLogs.length === 0 || prevLogs[0]?.id === newLogs[0]?.id)) {
        return prevLogs;
      }
      return newLogs;
    });
  }, [limit]);

  useEffect(() => {
    refreshLogs();
    // In a real app, we might want to subscribe to log events
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  const clearLogs = useCallback(() => {
    loggingService.clearLogs();
    setLogs([]);
  }, []);

  return {
    logs,
    refreshLogs,
    clearLogs
  };
};
