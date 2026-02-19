import { Counter, Gauge, Rate, Trend } from "k6/metrics";

/**
 * Custom metrics for k6 performance tests.
 * 
 * All metrics are created in init context (required by k6) and are available to all VUs.
 * Metrics follow OpenTelemetry/Prometheus naming conventions:
 * - Up to 128 characters
 * - ASCII letters, numbers, and underscores only
 * - Must start with a letter or underscore
 * 
 * @see https://grafana.com/docs/k6/latest/using-k6/metrics/
 * @see https://grafana.com/docs/k6/latest/using-k6/metrics/create-custom-metrics/
 */

/**
 * Counter for HTTP/request errors.
 * Increments by 1 for each error occurrence.
 * Use with ErrorHandler.createMetricLogger(errorCounter) to automatically track errors.
 * 
 * Tags: url, status, error_code, traceparent, and any custom tags from ErrorHandler.logError()
 */
export const errorCounter = new Counter("http_errors");

/**
 * Rate metric for successful requests.
 * Tracks the rate of successful requests (non-zero value = success).
 * Use: successRate.add(1) for success, successRate.add(0) for failure.
 * 
 * Tags: Can be tagged with endpoint, method, etc.
 */
export const successRate = new Rate("request_success_rate");

/**
 * Trend metric for request waiting time (time to first byte).
 * Measures the time spent waiting for response from remote host (TTFB).
 * Use: waitingTime.add(response.timings.waiting)
 * 
 * Provides: avg, min, med, max, p(90), p(95), p(99) statistics.
 * 
 * Tags: Can be tagged with endpoint, method, status, etc.
 */
export const waitingTime = new Trend("request_waiting_time");

/**
 * Trend metric for request duration.
 * Measures total request time (sending + waiting + receiving).
 * Use: requestDuration.add(response.timings.duration)
 * 
 * Provides: avg, min, med, max, p(90), p(95), p(99) statistics.
 * 
 * Tags: Can be tagged with endpoint, method, status, etc.
 */
export const requestDuration = new Trend("request_duration_custom");

/**
 * Trend metric for response receiving time.
 * Measures time spent receiving response data from remote host.
 * Use: receivingTime.add(response.timings.receiving)
 * 
 * Useful for tracking slow response body transfers.
 * 
 * Tags: Can be tagged with endpoint, method, etc.
 */
export const receivingTime = new Trend("request_receiving_time");

/**
 * Gauge metric for current active requests.
 * Tracks the current number of in-flight requests.
 * Use: activeRequests.add(1) when starting, activeRequests.add(-1) when finishing.
 * 
 * Tags: Can be tagged with endpoint, method, etc.
 */
export const activeRequests = new Gauge("active_requests");

/**
 * Counter for total requests made.
 * Increments by 1 for each request (regardless of success/failure).
 * 
 * Tags: Can be tagged with endpoint, method, etc.
 */
export const totalRequests = new Counter("total_requests");

/**
 * Trend metric for business logic timing.
 * Use for measuring custom business logic execution time.
 * Example: businessLogicTime.add(timeTaken)
 * 
 * Tags: Can be tagged with operation type, etc.
 */
export const businessLogicTime = new Trend("business_logic_time");

/**
 * Rate metric for business logic success.
 * Tracks the rate of successful business operations.
 * Use: businessSuccessRate.add(1) for success, businessSuccessRate.add(0) for failure.
 * 
 * Tags: Can be tagged with operation type, etc.
 */
export const businessSuccessRate = new Rate("business_success_rate");
