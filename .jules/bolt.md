## 2026-03-29 - [Prevent application-wide re-renders from polling]
**Learning:** Polling mechanisms (like `setInterval` updating state) inside top-level layout components trigger application-wide re-renders, causing significant UI performance degradation.
**Action:** Always extract polling logic into isolated, dedicated leaf components (like `ApiStatusBadge`). Implement bailout logic in state setters (e.g., checking if values have actually changed before returning new state) to prevent even the leaf component from re-rendering needlessly.
