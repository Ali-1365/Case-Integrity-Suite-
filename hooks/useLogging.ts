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
      // Bailout: if the length is the same and the latest log hasn't changed, do not trigger a re-render
      if (
        prevLogs.length === newLogs.length &&
        (prevLogs.length === 0 || prevLogs[0].id === newLogs[0].id)
      ) {
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
