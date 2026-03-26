## 2024-05-18 - [Optimized state updates in DocumentManager]
**Learning:** Frequent polling with setInterval in top-level layout components (like DocumentManager fetching quotaUsage every 5s) forces re-renders of the entire component tree if the state object isn't strictly checked.
**Action:** When implementing polling, make sure to add a bailout (e.g., check if the values actually changed before updating state) or extract the polling logic into a smaller, isolated component.
