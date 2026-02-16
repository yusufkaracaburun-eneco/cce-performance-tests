import { Counter } from "k6/metrics";

/**
 * Shared counter for HTTP/request errors. Use with ErrorHandler.createMetricLogger(errorCounter).
 * Create in init context so it is available to all VUs.
 */
export const errorCounter = new Counter("http_errors");
