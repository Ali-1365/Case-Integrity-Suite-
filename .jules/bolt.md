# Bolt's Journal

## 2024-05-19 - Avoid Math.random()
**Learning:** Math.random() is used in several places for ID generation and mock data, which violates security policies in this specific environment. It's an anti-pattern when used for identifiers.
**Action:** Replace Math.random() with crypto.getRandomValues() or crypto.randomUUID(). This is a critical learning based on project requirements (no Math.random() allowed).

## 2024-05-19 - Polling in top-level components
**Learning:** `DocumentManager` has a polling interval (`setInterval`) for `quotaUsage` without a bailout, causing expensive re-renders.
**Action:** Always implement bailout logic in the state setter for polling hooks/components (e.g. check if the new value is deeply equal to the old value) to avoid massive application-wide re-renders.
