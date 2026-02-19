import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../configs/env.conf.ts";
import { getOptions } from "../configs/options.conf.ts";
import { ErrorHandler } from "../lib/error-handler.ts";
import { electricityMeterIngestionExampleScenario } from "../scenarios/apis/electricity-meter-ingestion.example.ts";

// Create error handler for this test
const errorHandler = ErrorHandler.createConsoleLogger();

export const options = getOptions("smoke");

export function setup(): EnvironmentValues {
	const environmentValues = getEnvironmentValues();
	console.info(
		`Electricity meter ingestion example test started: ${environmentValues.baseUrl}, ${environmentValues.testStartTime}, ${options.vus} virtual users, ${options.duration} duration`,
	);
	return environmentValues;
}

/**
 * Electricity meter ingestion test using the exact example payload.
 *
 * This test uses generateElectricityExamplePayload which produces payloads
 * matching exactly ProcessedP4UsagesDayAlignedEvent_elec_example.json.
 * Useful for validating schema compliance and API behavior with known-good data.
 */
export default function electricityMeterIngestionExampleTest(
	data: ReturnType<typeof setup>,
) {
	electricityMeterIngestionExampleScenario(data.baseUrl, {
		errorHandler,
		tags: {
			test_name: "electricity_meter_ingestion_example",
		},
	});
}

export function teardown(data: ReturnType<typeof setup>) {
	// Teardown logic can be added here if needed
}
