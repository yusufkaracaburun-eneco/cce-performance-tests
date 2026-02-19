import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../configs/env.conf.ts";
import { getOptions } from "../configs/options.conf.ts";
import { ErrorHandler } from "../lib/error-handler.ts";
import { meterIngestionScenario } from "../scenarios/apis/meter-ingestion.ts";

// Create error handler for this test
const errorHandler = ErrorHandler.createConsoleLogger();

export const options = getOptions("loadHigh");

export function setup(): EnvironmentValues {
	const environmentValues = getEnvironmentValues();
	console.info(
		`Meter ingestion test started: ${environmentValues.baseUrl}, ${environmentValues.testStartTime}, ${options.vus} virtual users, ${options.duration} duration`,
	);
	return environmentValues;
}

/**
 * Meter ingestion test using the reusable scenario.
 *
 * This test delegates to the meterIngestionScenario which implements the VU logic.
 * The scenario can be reused across different test configurations (smoke, stress, etc.)
 * and environments (dev, test, acc, prod).
 */
export default function meterIngestionTest(data: ReturnType<typeof setup>) {
	meterIngestionScenario(data.baseUrl, {
		errorHandler,
		tags: {
			test_name: "meter_ingestion",
		},
	});
}

export function teardown(data: ReturnType<typeof setup>) {
	// Teardown logic can be added here if needed
	// For example: cleanup, final reporting, etc.
}
