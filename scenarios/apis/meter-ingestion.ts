import { check } from "k6";
import { MeterIngestionClient } from "../../lib/api/index.ts";
import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import {
	generateMeterPayload,
	generateElectricityPayload,
	generateGasPayload,
} from "../../lib/builders/index.ts";
import { ErrorHandler } from "../../lib/error-handler.ts";

/**
 * Options for configuring the meter ingestion scenario.
 */
export type MeterIngestionScenarioOptions = {
	/**
	 * Error handler instance. If not provided, errors will not be logged.
	 * Use ErrorHandler.createConsoleLogger() or ErrorHandler.createMetricLogger(counter) for logging.
	 */
	errorHandler?: ErrorHandler;
	/**
	 * Additional tags to apply to requests and checks.
	 * These tags can be used for filtering metrics and setting thresholds.
	 */
	tags?: Record<string, string>;
	/**
	 * Meter type to use for payload generation.
	 * Defaults to MeterType.ELECTRICITY.
	 */
	meterType?: MeterType;
};

/**
 * Reusable scenario for meter ingestion testing.
 *
 * This scenario implements the meter ingestion flow:
 * 1. Generate a meter payload
 * 2. Publish the payload to the backend
 * 3. Validate the response
 * 4. Log errors if configured
 *
 * The scenario is designed to be reusable across different test configurations:
 * - Different environments (dev, test, acc, prod)
 * - Different workloads (smoke, stress, average)
 * - Different error handling strategies
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 *
 * @example
 * ```typescript
 * // Basic usage
 * meterIngestionScenario("https://api.example.com");
 *
 * // With error handler
 * const errorHandler = ErrorHandler.createConsoleLogger();
 * meterIngestionScenario("https://api.example.com", { errorHandler });
 *
 * // With custom tags
 * meterIngestionScenario("https://api.example.com", {
 *   tags: { environment: "prod", test_type: "smoke" }
 * });
 * ```
 *
 * @see https://grafana.com/blog/organizing-your-grafana-k6-performance-testing-suite-best-practices-to-get-started/#2.-implement-reusable-test-scenarios
 */
export function meterIngestionScenario(
	baseUrl: string,
	options?: MeterIngestionScenarioOptions,
): void {
	const vuId = __VU;
	const iterId = __ITER;
	const meterType = options?.meterType ?? MeterType.ELECTRICITY;
	const scenarioTags = options?.tags ?? {};

	// Create API client
	const client = new MeterIngestionClient(baseUrl);

	// Generate meter payload
	const payload = generateMeterPayload(vuId, iterId, meterType);

	// Prepare tags for HTTP request and checks
	const requestTags = {
		name: "meter_ingestion",
		endpoint: "publish",
		meter_type: meterType,
		...scenarioTags,
	};

	// Publish payload with tags applied to the HTTP request
	const { data: responseData, res } = client.publish(payload, requestTags);

	// Apply tags to checks for filtering and threshold purposes
	const checkTags = {
		scenario: "meter_ingestion",
		endpoint: "publish",
		meter_type: meterType,
		...scenarioTags,
	};

	// Validate response status and basic properties
	const mainChecks = check(
		res,
		{
			"status is 200 or 2xx": (r) => r.status >= 200 && r.status < 300,
			"response has body": (r) => {
				if (r.body === null) return false;
				if (typeof r.body === "string") return r.body.length > 0;
				return true;
			},
			"response time < 1000ms": (r) => r.timings.duration < 1000,
		},
		checkTags,
	);

	// Validate JSON response for successful requests
	let jsonCheck = true;
	if (res.status >= 200 && res.status < 300 && responseData != null) {
		jsonCheck = check(
			responseData,
			{
				"response is valid JSON": () => typeof responseData === "object",
			},
			checkTags,
		);
	}

	// Log errors if error handler is configured
	if (options?.errorHandler) {
		const allChecksPassed = mainChecks && jsonCheck;
		options.errorHandler.logError(!allChecksPassed, res, {
			vuId,
			iterId,
			meter_type: meterType,
			...scenarioTags,
		});
	}
}
