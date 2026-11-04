---

title: "Concurrent Go Uptime Monitor & HTTP Health-Check Engine"

role: "Personal Project | Go Systems Engineering"

period: "2026"

summary: "Built a concurrent HTTP uptime-monitoring engine in Go using a bounded worker pool, context-aware cancellation, configurable timeouts, deterministic result ordering, and machine-readable JSON reporting. Benchmarked concurrency trade-offs using a controlled local HTTP server."

domain: "Backend Engineering & Distributed Systems Fundamentals"

technologies:
- "Go"
- "net/http"
- "Goroutines & Channels"
- "context"
- "sync.WaitGroup"
- "encoding/json"
- "httptest"
- "Go Testing & Benchmarking"
- "GitHub Actions"

featured: true
draft: false
---

### Situation

Monitoring multiple HTTP endpoints sequentially creates unnecessary waiting when requests spend much of their time on network I/O. However, launching an unrestricted goroutine for every target introduces resource-management concerns, makes concurrency harder to control, and can generate excessive traffic against monitored services.

I wanted to build a lightweight Go application that demonstrates how to design a concurrent I/O-bound workload with explicit resource limits, predictable result collection, cancellation handling, and measurable performance characteristics.

### Task

Design and implement a command-line HTTP health-check engine that:

* Accepts a single URL or a list of targets from a file.
* Validates target URLs before execution.
* Executes checks concurrently with a configurable worker limit.
* Supports request timeouts and cancellation through Go contexts.
* Preserves input ordering in the final results, regardless of request completion order.
* Distinguishes unhealthy HTTP responses from request-level errors.
* Produces human-readable output and structured JSON reports.
* Includes automated tests and reproducible benchmarks to validate correctness and evaluate concurrency trade-offs.

### Action

* **Bounded Worker-Pool Architecture:** Implemented a fixed worker pool using goroutines and channels to distribute URL checks. Rather than spawning an unrestricted goroutine per target, the scheduler limits the number of checks processed concurrently.

* **Context-Aware Cancellation:** Propagated contexts into HTTP requests so in-flight operations can be cancelled. Added cancellation-aware job dispatch and explicit handling of targets that were not dispatched when cancellation occurred.

* **HTTP Health Classification:** Built a reusable checker using Go's `net/http` client. Captured HTTP status codes and request duration, classified status codes from 200 through 399 as healthy, and represented transport failures separately from unhealthy HTTP responses.

* **Deterministic Result Collection:** Associated each scheduled job with its original input index, allowing concurrent checks to complete out of order while keeping the final output aligned with the supplied target list.

* **Input Validation & File Loading:** Implemented URL validation and a target-file loader that trims whitespace and ignores blank lines and comments. Added command-line configuration for request timeout, concurrency, target files, and output format.

* **Machine-Readable Reporting:** Introduced structured JSON reports containing per-target status, duration, health classification, errors, and aggregate counts. Kept operational results suitable for inspection by scripts and future integrations.

* **Automated Testing:** Added unit and scheduler tests covering URL validation, target loading, concurrent execution, result ordering, and cancellation scenarios. Used Go's HTTP test server to exercise network behavior under controlled conditions.

* **Performance Benchmarking:** Created a benchmark comparing worker counts of 1, 2, 5, and 10 against a local HTTP server with an artificial 5 ms response delay. Used Go's benchmark and allocation-reporting tools to measure batch execution time and memory allocations.

* **Engineering Quality Gates:** Ran the Go test suite with the race detector, `go vet`, and package builds. Prepared a GitHub Actions workflow for repeatable formatting, testing, vetting, and build checks.

### Result

* **7.5× measured batch speedup:** Reduced the time to check a batch of 20 targets from approximately 121.7 ms at concurrency 1 to 16.2 ms at concurrency 10 in the local benchmark.

* **Explicit concurrency/resource trade-offs:** Observed that allocations increased from approximately 1,291 to 1,982 per benchmark operation as concurrency increased from 1 to 10, illustrating why throughput must be evaluated alongside resource consumption.

* **Predictable concurrent execution:** Preserved input-order results while allowing individual HTTP checks to execute concurrently.

* **Testable cancellation behavior:** Incorporated context propagation and cancellation-aware scheduling to handle interruption without treating every HTTP response as a successful health check.

* **Automation-ready output:** Added a structured reporting model that can support future dashboards, monitoring integrations, and automated consumers without coupling the core checker to a specific presentation layer.

* **Reproducible engineering evidence:** Established a local benchmarking approach and automated quality checks that make future scheduler changes easier to validate.

### Architecture & Design Considerations

The project separates command-line orchestration, target loading, HTTP checking, scheduling, and report representation. This keeps the core components independently testable and provides a foundation for future integration into a service or interactive demonstration.

Key design trade-offs include:

* **Bounded concurrency versus unrestricted parallelism:** Limits simultaneous checks to keep resource consumption and outbound request volume under control.
* **Cancellation versus completion guarantees:** Allows callers to stop work, while requiring explicit semantics for checks that are in flight or not yet dispatched.
* **Structured errors versus health status:** Separates transport failures from valid HTTP responses that indicate an unhealthy endpoint.
* **Throughput versus allocations:** Measures how additional concurrency affects both execution time and allocation counts rather than assuming maximum concurrency is always optimal.

### Future Evolution

Potential extensions include TLS certificate-expiration checks, periodic scheduling, bounded retries with backoff, Prometheus-compatible metrics, historical result storage, and a restricted interactive demo with predefined targets and abuse-resistant execution limits.

These extensions would build on the current checker and scheduler without requiring the CLI implementation to become the public interface.
