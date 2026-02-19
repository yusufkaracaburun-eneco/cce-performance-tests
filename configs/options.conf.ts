type Options = {
	vus?: number;
	duration?: string;
	noConnectionReuse: boolean;
	userAgent: string;
	stages?: Stage[];
	thresholds?: Thresholds;
};

/**
 * Threshold configuration for k6 performance tests.
 * 
 * Thresholds define pass/fail criteria for test metrics. If thresholds are not met,
 * the test finishes with a failed status (non-zero exit code).
 * 
 * Supports both short format (string[]) and long format (object with abortOnFail).
 * 
 * @see https://grafana.com/docs/k6/latest/using-k6/thresholds/
 */
type ThresholdExpression = string | {
	threshold: string;
	abortOnFail?: boolean;
	delayAbortEval?: string;
};

type Thresholds = {
	// Built-in HTTP metrics
	http_req_duration?: ThresholdExpression[];
	http_req_failed?: ThresholdExpression[];
	http_req_waiting?: ThresholdExpression[];
	http_req_receiving?: ThresholdExpression[];
	http_req_connecting?: ThresholdExpression[];
	
	// Check metrics
	checks?: ThresholdExpression[];
	
	// Custom metrics (from lib/metrics.ts)
	http_errors?: ThresholdExpression[];
	request_success_rate?: ThresholdExpression[];
	request_waiting_time?: ThresholdExpression[];
	request_duration_custom?: ThresholdExpression[];
	business_logic_time?: ThresholdExpression[];
	business_success_rate?: ThresholdExpression[];
};

type Stage = {
	duration: string;
	target: number;
};

const USER_AGENT = "k6-performance-test";

const defaultOptions: Options = {
	vus: Number(__ENV.VIRTUAL_USERS) || 1,
	duration: __ENV.DURATION || "30s",
	noConnectionReuse: true,
	userAgent: USER_AGENT,
};

/**
 * Performance thresholds for k6 tests.
 * 
 * These thresholds codify SLOs (Service Level Objectives) and ensure tests fail
 * if performance expectations are not met. Multiple thresholds per metric allow
 * for comprehensive performance validation.
 * 
 * Threshold expression syntax: <aggregation_method> <operator> <value>
 * - Trend metrics: avg, min, max, med, p(N) where N is percentile (0-100)
 * - Rate metrics: rate (0.0 to 1.0)
 * - Counter metrics: count, rate
 * - Gauge metrics: value
 * 
 * Examples:
 * - "p(95)<1000" - 95th percentile must be below 1000ms
 * - "rate<0.01" - Error rate must be less than 1%
 * - "avg<200" - Average must be below 200ms
 * 
 * @see https://grafana.com/docs/k6/latest/using-k6/thresholds/
 */
const thresholds: Thresholds = {
	// HTTP Request Duration - Multiple percentiles for comprehensive coverage
	http_req_duration: [
		"p(90)<500",  // 90% of requests should complete within 500ms
		"p(95)<1000", // 95% of requests should complete within 1000ms
		"p(99)<2000", // 99% of requests should complete within 2000ms
		"avg<800",    // Average response time should be below 800ms
	],

	// HTTP Request Failure Rate - Strict error tolerance
	http_req_failed: [
		"rate<0.01", // Less than 1% of requests should fail
	],

	// HTTP Request Waiting Time (TTFB - Time to First Byte)
	http_req_waiting: [
		"p(95)<500", // 95% of requests should receive first byte within 500ms
		"avg<300",   // Average waiting time should be below 300ms
	],

	// Checks - Functional correctness
	checks: [
		"rate>0.95", // At least 95% of checks should pass
	],

	// Optional: Custom metric thresholds (uncomment if using custom metrics)
	// http_errors: [
	//   "count<100", // Total error count should be less than 100
	// ],
	// request_success_rate: [
	//   "rate>0.99", // Success rate should be above 99%
	// ],
};

const stages: Record<string, Stage> = {
	smoke: {
		duration: "30s",
		target: 1,
	},
	stress: {
		duration: "60s",
		target: 10,
	},
	loadLow: {
		duration: "30s",
		target: 5,
	},
	loadMed: {
		duration: "60s",
		target: 10,
	},
	loadHigh: {
		duration: "90s",
		target: 15,
	},
};

export function getOptions(stage?: keyof typeof stages): Options {
	const stageConfig = stage ? stages[stage as keyof typeof stages] : undefined;
	if (stageConfig) {
		return {
			thresholds,
			stages: [stageConfig],
			noConnectionReuse: true,
			userAgent: USER_AGENT,
		};
	}
	return {
		...defaultOptions,
		thresholds,
	};
}
