import { electricityMeterIngestionScenario } from "../scenarios/apis/electricity-meter-ingestion.ts";
import { createTestConfig } from "./lib/test-config.ts";
import { createMeterIngestionTest } from "./lib/test-factory.ts";

/**
 * Electricity meter ingestion test configuration.
 *
 * This test uses generateElectricityPayload which produces electricity payloads
 * matching the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).
 */
const testConfig = createTestConfig({
	testName: "electricity_meter_ingestion",
	loadProfile: "loadHigh",
	scenario: electricityMeterIngestionScenario,
	description:
		"Electricity meter ingestion test using the electricity-specific scenario. Uses generateElectricityPayload which produces electricity payloads matching the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).",
});

const test = createMeterIngestionTest(testConfig);

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
