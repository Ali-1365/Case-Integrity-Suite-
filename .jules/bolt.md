## 2024-04-09 - [Preventing Widespread Re-renders from Polling]
**Learning:** In this application, global state polling (e.g., `setInterval` updating React state for logs or quotas) can trigger expensive re-renders across multiple large components if state bailout logic isn't explicitly used.
**Action:** When updating arrays or objects via polling, always use a functional state setter and compare relevant fields (like array length and newest item ID, or deep equality for quota usages) to return the `prev` state reference if data hasn't changed.
