## 2024-04-20 - [Avoid unnecessary React state updates in fast polling intervals]
**Learning:** Frequent polling mechanisms (e.g. setInterval checking usage metrics or logs) in top-level components can trigger massive unnecessary re-renders across the whole layout if the `setState` is called blindly with a new object/array reference even when the underlying data is identical. Deep equality checks or libraries like `fast-deep-equal` can be computationally expensive and introduce unauthorized dependencies.
**Action:** When implementing polling mechanisms, always write state updater functions using targeted shallow checks (e.g. `prev.rpm === newUsage.rpm` or array lengths and recent item IDs) to safely return the `prev` state reference and bail out of the rendering cycle. Side effects, such as generating the new data, should remain pure and sit entirely outside of the React state updater function itself.
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