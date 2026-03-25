## 2025-03-25 - [React Polling Rendering Optimization]
**Learning:** Polling mechanisms (like `setInterval`) inside custom hooks can cause massive application-wide re-renders if they slice or map data that hasn't actually changed. Slicing an array creates a new reference, which forces React to re-render all dependent components every tick.
**Action:** Always check array equality (e.g. by comparing length and the most recent item's ID) before calling the state setter in polling hooks. Returning the previous state reference tells React to bail out of the render cycle.
