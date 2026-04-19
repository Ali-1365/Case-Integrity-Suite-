## 2026-04-19 - [IndexedDB Promise.all Batching]
**Learning:** Sequential awaits on IndexedDB operations (idb) cause significant N+1 transaction bottlenecks in this codebase because each idb transaction needs to commit before the next begins.
**Action:** Always use Promise.all to parallelize bulk database writes instead of using sequential 'for...of' loops with awaits.
