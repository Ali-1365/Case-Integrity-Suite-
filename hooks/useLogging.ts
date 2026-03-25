import { useState, useEffect, useCallback } from 'react';
import { loggingService, LogEntry } from '../services/loggingService';

/**
 * ⚡ Bolt: React Rendering Optimization
 *
 * 💡 What: Implemented bailout logic in `refreshLogs` to prevent unnecessary state updates.
 * 🎯 Why: The previous implementation created a new array reference every 5 seconds (`allLogs.slice(0, limit)`)
 *        and passed it to `setLogs`, causing dependent components (`ErrorDashboard`, `SystemMonitor`, `AIDebugPanel`)
 *        to re-render entirely every 5 seconds, even when no new logs were added.
 * 📊 Impact: Eliminates idle re-renders for all log viewers, saving CPU cycles and lowering latency.
 * 🔬 Measurement: Verify with React Profiler; component updates should now only occur when actual logs are appended or cleared.
 */
export const useLogging = (limit: number = 50) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    const allLogs = loggingService.getLogs();
    const newLogs = allLogs.slice(0, limit);
    setLogs(prevLogs => {
      if (prevLogs.length === newLogs.length && (prevLogs.length === 0 || prevLogs[0].id === newLogs[0].id)) {
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
