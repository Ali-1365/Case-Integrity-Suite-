bolt/fix-quota-polling-rerender-13032162535497198072
## 2024-05-24 - [Avoid React Component Re-renders on Polled State Objects]
**Learning:** Setting state with a newly allocated object every interval cycle in top-level components (like `DocumentManager`) causes app-wide re-renders, even if the actual primitive values within the object remain unchanged.
**Action:** Always implement bailout logic in the state setter callback (e.g., comparing old vs new properties and returning the previous state reference if identical) when polling data to prevent massive re-renders.

## 2024-04-20 - [Avoid unnecessary React state updates in fast polling intervals]
**Learning:** Frequent polling mechanisms (e.g. setInterval checking usage metrics or logs) in top-level components can trigger massive unnecessary re-renders across the whole layout if the `setState` is called blindly with a new object/array reference even when the underlying data is identical. Deep equality checks or libraries like `fast-deep-equal` can be computationally expensive and introduce unauthorized dependencies.
**Action:** When implementing polling mechanisms, always write state updater functions using targeted shallow checks (e.g. `prev.rpm === newUsage.rpm` or array lengths and recent item IDs) to safely return the `prev` state reference and bail out of the rendering cycle. Side effects, such as generating the new data, should remain pure and sit entirely outside of the React state updater function itself.
bolt-optimize-intervals-16640277234052567324
## 2026-05-03 - [Avoid premature manual bailout for React primitive state]
**Learning:** In React components, manual state bailout logic (e.g., returning the previous state reference) is only necessary for objects and arrays. Primitive state updates (booleans, strings, numbers) automatically bail out of re-renders via strict equality. Implementing manual bailouts for primitives is redundant and adds unnecessary code noise. Furthermore, removing intervals completely from diagnostic panels without proper context can cause blocking functional regressions.
**Action:** When optimizing state updates, focus exclusively on object or array references. Do not attempt to manually bail out primitive state updates unless absolutely necessary. When optimizing intervals, ensure the change preserves the core functionality intended for that component.

bolt-parallelize-idb-writes-204725260340481873

## 2026-05-08 - [Parallelize IndexedDB writes to avoid N+1 bottlenecks]
**Learning:** Sequential `for...of` loops performing asynchronous `saveEconomicData` (IndexedDB) writes cause severe N+1 transaction bottlenecks, forcing the browser to wait for each I/O operation to finish sequentially. This delays the initialization of client-side services (like `EconomicService`).
**Action:** Always map over arrays to create an array of promises and `await Promise.all()` to parallelize repetitive IndexedDB write operations. This utilizes the async nature of the client-side database more effectively and significantly reduces the total blocking time for database synchronization.

bolt-parallelize-io-6858291852570027929
## 2024-05-09 - [Parallelize sequential I/O with Promise.all]
**Learning:** Sequential `for-of` loops that await asynchronous file parsing (`parseFile`) or network requests (`fetch`) inside React components can cause significant, unnecessary UI blocking and slow performance. However, because `useFileParser` uses a globally shared `isParsing` state, we shouldn't rely solely on that state for UI loading indicators if we're firing multiple concurrent parses. Instead, relying on the component's own `isLoading` state is preferred.
**Action:** Always replace sequential `for-of` loops containing asynchronous operations with `await Promise.all(array.map(...))` to parallelize execution. If subsequent processing must be sequential, parallelize the parsing step first, and then iterate over the resolved results.
bolt-optimize-db-sync-18226591939417556514
## 2024-05-15 - [IndexedDB Sequential N+1 I/O bottleneck]
**Learning:** Sequential `await` in loops used to update IndexedDB (e.g., `for (const p of elements) await db.save(p)`) introduces severe N+1 transaction overhead and blocks the main thread.
**Action:** Replace sequential I/O loops with parallel arrays mapped to promises and await them using `await Promise.all(...)` to maximize concurrency.
## 2024-05-12 - [In-memory caching for repeated API calls returning static JSON]
**Learning:** The Express backend uses `fs.readFileSync` and `JSON.parse` on every request to `/api/praxis/:lawRef` to read `public/data/praxis.json`. This causes blocking I/O and unnecessary CPU usage.
**Action:** Implement an in-memory cache variable that stores the parsed JSON data upon the first request or at startup to prevent repetitive file reads and JSON parsing, significantly improving endpoint response times for static data.
## 2024-05-12 - [Batch backend API calls to avoid N+1 requests]
**Learning:** `PraxisService.getRelevantPraxis` iterates through `lawRefs` with a sequential `for-of` loop, making a separate `fetch` request for each reference. This creates an N+1 query problem that blocks execution and increases network overhead.
**Action:** Implement a batching mechanism where multiple parameters are sent in a single POST request body to the backend, returning all filtered results at once.
 main

## 2024-05-25 - [Parallelize Integrity Validations to Avoid N+1 I/O Bottlenecks]
**Learning:** Sequential `for...of` loops performing asynchronous `verifyAtom` (Hash verification) validations cause severe N+1 I/O bottlenecks. However, unbounded parallelization with `Promise.all` across all cases and all their atoms simultaneously can cause memory exhaustion and overwhelm system limits.
**Action:** Always map over arrays to create an array of promises and use `await Promise.all()` to parallelize repetitive I/O validations. To prevent unbounded concurrency issues, use a chunking strategy (e.g., chunks of 50 atoms at a time) when parallelizing large arrays of asynchronous operations.
