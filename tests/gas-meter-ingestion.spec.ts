import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../configs/env.conf.ts";
import { getOptions } from "../configs/options.conf.ts";
import { ErrorHandler } from "../lib/error-handler.ts";
import { gasMeterIngestionScenario } from "../scenarios/apis/gas-meter-ingestion.ts";

// Create error handler for this test
const errorHandler = ErrorHandler.createConsoleLogger();

export const options = getOptions("loadHigh");

export function setup(): EnvironmentValues {
	const environmentValues = getEnvironmentValues();
	console.info(
		`Gas meter ingestion test started: ${environmentValues.baseUrl}, ${environmentValues.testStartTime}, ${options.vus} virtual users, ${options.duration} duration`,
	);
	return environmentValues;
}

/**
 * Gas meter ingestion test using the gas-specific scenario.
 *
 * This test uses generateGasPayload which produces gas payloads
 * matching the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).
 */
export default function gasMeterIngestionTest(
	data: ReturnType<typeof setup>,
) {
	gasMeterIngestionScenario(data.baseUrl, {
		errorHandler,
		tags: {
			test_name: "gas_meter_ingestion",
		},
	});
}

export function teardown(data: ReturnType<typeof setup>) {
	// Teardown logic can be added here if needed
}
