## 2024-03-01 - Batching Praxis Queries
**Learning:** The previous implementation was suffering from N+1 query problems where the frontend made multiple GET requests to the backend for praxis data, which in turn performed synchronous file reads (`fs.readFileSync`) for every request. This created a blocking file I/O bottleneck.
**Action:** When working with multiple entities (like `lawRefs`), always batch requests into a single POST query and implement in-memory caching to avoid blocking I/O calls on the server.
