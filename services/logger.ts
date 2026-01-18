
/**
 * FMJAM Telemetry & Logger Service
 * Säkrar att alla systemavvikelser loggas för analys.
 */
export const logError = (message: string, error: Error | null, errorInfo?: any) => {
  console.group("%c🚨 FMJAM_CRITICAL_ERROR", "color: #f44; font-weight: bold; font-size: 14px;");
  console.error("Context:", message);
  console.error("Error Object:", error);
  if (errorInfo) {
    console.error("React Component Stack:", errorInfo.componentStack);
  }
  console.groupEnd();

  // In a production environment, this would also send data to an external monitoring service.
};
