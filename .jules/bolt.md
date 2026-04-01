## 2024-05-24 - [Avoid React Component Re-renders on Polled State Objects]
**Learning:** Setting state with a newly allocated object every interval cycle in top-level components (like `DocumentManager`) causes app-wide re-renders, even if the actual primitive values within the object remain unchanged.
**Action:** Always implement bailout logic in the state setter callback (e.g., comparing old vs new properties and returning the previous state reference if identical) when polling data to prevent massive re-renders.
