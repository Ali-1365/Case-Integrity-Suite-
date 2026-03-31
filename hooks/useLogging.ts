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
    setLogs(prev => {
      if (prev.length === newLogs.length && (prev.length === 0 || prev[0].id === newLogs[0].id)) {
        return prev;
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
