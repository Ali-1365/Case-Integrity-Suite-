
## 2024-05-28 - [Performance] Prevented massive top-level re-renders
**Learning:** Polling state variables (like API quota limits) directly in top-level components like `<DocumentManager>` causes excessive cascading re-renders across the entire application on every poll interval. In this specific architecture, omitting bailout logic in hooks (like `useLogging`'s state setter) forces deep re-renders regardless of whether the state value actually changed.
**Action:** Extract frequently changing polled data into targeted micro-components (`<QuotaStatus>`) to localize re-renders. Always implement bailout logic `setLogs(prev => ... return prev)` in custom hooks that poll to prevent application-wide thrashing.
