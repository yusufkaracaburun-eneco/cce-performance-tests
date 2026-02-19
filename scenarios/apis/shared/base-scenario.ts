import { check } from "k6";
import type { MeterPayload } from "../../../lib/builders/base/meter-payload-types.ts";
import { MeterType } from "../../../lib/builders/base/meter-payload-types.ts";
import { MeterIngestionClient } from "../../../lib/api/index.ts";
import type { MeterIngestionScenarioOptions } from "./types.ts";

/**
 * Payload generator function signature.
 * Some generators take meter type, others don't.
 */
export type PayloadGenerator = (meterType: MeterType) => MeterPayload;

/**
 * Creates a meter ingestion scenario function.
 *
 * This base function handles the common flow:
 * 1. Generate a meter payload
 * 2. Publish the payload to the backend
 * 3. Validate the response
 * 4. Log errors if configured
 *
 * @param payloadGenerator - Function that generates the meter payload
 * @param defaultMeterType - Default meter type (ELECTRICITY or GAS)
 * @param logPayload - Whether to log the generated payload (default: false)
 * @returns Scenario function ready to use in tests
 */
export function createMeterIngestionScenario(
	payloadGenerator: PayloadGenerator,
	defaultMeterType: MeterType = MeterType.ELECTRICITY,
	logPayload: boolean = false,
) {
	return function meterIngestionScenario(
		baseUrl: string,
		options?: MeterIngestionScenarioOptions,
	): void {
		const vuId = __VU;
		const iterId = __ITER;
		const meterType = options?.meterType ?? defaultMeterType;
		const scenarioTags = options?.tags ?? {};

		// Create API client
		const client = new MeterIngestionClient(baseUrl);

		// Generate meter payload
		const payload = payloadGenerator(meterType);
		if (logPayload) {
			console.info("Payload: ", payload);
		}

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
	};
}
