bolt/fix-quota-polling-rerender-13032162535497198072
## 2024-05-24 - [Avoid React Component Re-renders on Polled State Objects]
**Learning:** Setting state with a newly allocated object every interval cycle in top-level components (like `DocumentManager`) causes app-wide re-renders, even if the actual primitive values within the object remain unchanged.
**Action:** Always implement bailout logic in the state setter callback (e.g., comparing old vs new properties and returning the previous state reference if identical) when polling data to prevent massive re-renders.

## 2024-04-20 - [Avoid unnecessary React state updates in fast polling intervals]
**Learning:** Frequent polling mechanisms (e.g. setInterval checking usage metrics or logs) in top-level components can trigger massive unnecessary re-renders across the whole layout if the `setState` is called blindly with a new object/array reference even when the underlying data is identical. Deep equality checks or libraries like `fast-deep-equal` can be computationally expensive and introduce unauthorized dependencies.
**Action:** When implementing polling mechanisms, always write state updater functions using targeted shallow checks (e.g. `prev.rpm === newUsage.rpm` or array lengths and recent item IDs) to safely return the `prev` state reference and bail out of the rendering cycle. Side effects, such as generating the new data, should remain pure and sit entirely outside of the React state updater function itself.

## 2024-04-26 - [Backend caching & Batching N+1 API calls]
**Learning:** Frequent API requests in a loop (N+1 query problem) from the frontend, hitting a backend endpoint that performs blocking disk I/O (`fs.readFileSync`) without caching, cause significant performance degradation. This is especially true for reading static JSON files. Express routes reading from disk per request instead of keeping an in-memory cache will limit throughput.
**Action:** When serving static/mostly-static data from JSON files, implement a simple in-memory cache variable in the Node server. Furthermore, replace N+1 API calls from the client with a single batched endpoint (e.g. POST `/api/endpoint/batch` accepting an array of parameters) to dramatically reduce network overhead and server load.
