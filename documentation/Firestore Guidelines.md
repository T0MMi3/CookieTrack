Firebase JSON design: 
    -Denormalize Data: Firestore is a NoSQL database, so denormalizing your data can help reduce the number of reads and improve performance. This means duplicating data where necessary to avoid complex queries.
    -Use Subcollections: Organize related data into subcollections to make it easier to fetch related documents.
    -Use Document References: Store references to other documents to avoid duplicating large amounts of data.
    -Indexing: Ensure that you have proper indexing on fields that you frequently query.


Document access: ACL via firebase custom claim or in document
    fetching using user's docIds array: large number of concurrent request if this is large
    fetching using doc's ownerId or accessList: easier and faster, but a lot of data management

When creating, only create the bare minimum


Concurrency Design: a quick fix is to use transaction
1. Database-Level Concurrency Control
Firestore Transactions: As shown in your code, Firestore transactions ensure atomicity for read-modify-write operations. Use transactions for operations that involve multiple reads and writes to prevent race conditions.
Optimistic Locking: Add a version field (e.g., version or updatedAt) to your documents. Before updating, check if the version matches the latest version in the database. If not, reject the update to avoid overwriting changes made by other requests.
Pessimistic Locking: Temporarily lock a resource (e.g., a document) while it is being modified. Firestore does not natively support pessimistic locking, but you can implement it using a "lock" field in your documents.
2. Application-Level Concurrency Control
Queues for Sequential Processing: Use a message queue (e.g., RabbitMQ, Apache Kafka, or Google Pub/Sub) to process requests sequentially for critical operations. For example:
When multiple requests modify the same trooper's inventory, enqueue the requests and process them one at a time.Rate Limiting: Prevent excessive concurrent requests from overwhelming your server by limiting the number of requests per user or IP address using tools like Redis or libraries like express-rate-limit.
Debouncing and Throttling: For operations triggered by frequent user actions (e.g., updating trooper data), debounce or throttle requests to reduce the load on the server.
3. Horizontal Scaling
Load Balancers: Use a load balancer (e.g., NGINX, AWS Elastic Load Balancer) to distribute incoming requests across multiple server instances. This ensures that no single server is overwhelmed by concurrent requests.
Stateless Design: Design your server to be stateless so that any instance can handle any request. Store session data in a shared store (e.g., Redis, Firestore, or Memcached) instead of in memory.
4. Conflict Resolution Strategies
Last Write Wins (LWW): Allow the last update to overwrite previous updates. This is simple but may lead to data loss if not used carefully.
Merge Changes: For example, if two users update different fields of the same trooper document, merge the changes instead of overwriting the entire document.
User Confirmation: If a conflict is detected, notify the user and let them decide how to resolve it.
5. Caching
Use caching to reduce the load on your database for read-heavy operations. Tools like Redis or Memcached can store frequently accessed data in memory.
Implement cache invalidation strategies to ensure that cached data remains consistent with the database.
6. Event-Driven Architecture
Use an event-driven architecture to handle complex workflows. For example:
When a trooper is updated, emit an event (e.g., trooperUpdated) that triggers other services (e.g., updating sale data or inventory).
Tools like Google Cloud Functions, AWS Lambda, or Apache Kafka can help implement event-driven systems.
7. Concurrency-Safe Programming Practices
Idempotent APIs: Design APIs to be idempotent, meaning that multiple identical requests have the same effect as a single request. For example:
If a request to update a trooper's inventory is retried, it should not double the inventory count.
Atomic Operations: Use atomic operations for simple updates. For example, Firestore supports atomic increments for numeric fields:
8. Testing for Concurrency
Load Testing: Use tools like Apache JMeter, k6, or Locust to simulate concurrent requests and identify bottlenecks.
Chaos Engineering: Introduce failures (e.g., network delays, server crashes) in a controlled environment to test the resilience of your system.
9. Distributed Locking
If you have a distributed system, use distributed locking mechanisms to ensure that only one instance modifies a resource at a time. Tools like Redis Redlock or Zookeeper can help implement distributed locks.
10. Monitoring and Observability
Use monitoring tools (e.g., Prometheus, Datadog, Google Cloud Monitoring) to track metrics like request latency, error rates, and database contention.
Implement logging and tracing (e.g., ELK Stack, Jaeger) to debug concurrency issues.



-Optimization options: 
    -Batch Reads: Combine multiple read requests into a single batch read request.
    -Caching: Use caching to store frequently accessed data and reduce the number of reads to the database.
    -Pagination: Implement pagination to limit the number of documents read in a single request.
    -Denormalization: Store redundant data to reduce the number of reads needed to fetch related data.