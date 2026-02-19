import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../configs/env.conf.ts";
import { getOptions } from "../configs/options.conf.ts";
import { ErrorHandler } from "../lib/error-handler.ts";
import { electricityMeterIngestionScenario } from "../scenarios/apis/electricity-meter-ingestion.ts";

// Create error handler for this test
const errorHandler = ErrorHandler.createConsoleLogger();

export const options = getOptions("loadHigh");

export function setup(): EnvironmentValues {
	const environmentValues = getEnvironmentValues();
	console.info(
		`Electricity meter ingestion test started: ${environmentValues.baseUrl}, ${environmentValues.testStartTime}, ${options.vus} virtual users, ${options.duration} duration`,
	);
	return environmentValues;
}

/**
 * Electricity meter ingestion test using the electricity-specific scenario.
 *
 * This test uses generateElectricityPayload which produces electricity payloads
 * matching the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).
 */
export default function electricityMeterIngestionTest(
	data: ReturnType<typeof setup>,
) {
	electricityMeterIngestionScenario(data.baseUrl, {
		errorHandler,
		tags: {
			test_name: "electricity_meter_ingestion",
		},
	});
}

export function teardown(data: ReturnType<typeof setup>) {
	// Teardown logic can be added here if needed
}
