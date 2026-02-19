import { electricityMeterIngestionExampleScenario } from "../scenarios/apis/electricity-meter-ingestion.example.ts";
import { createTestConfig } from "./lib/test-config.ts";
import { createMeterIngestionTest } from "./lib/test-factory.ts";

/**
 * Electricity meter ingestion example test configuration.
 *
 * This test uses generateElectricityExamplePayload which produces payloads
 * matching exactly ProcessedP4UsagesDayAlignedEvent_elec_example.json.
 * Useful for validating schema compliance and API behavior with known-good data.
 */
const testConfig = createTestConfig({
	testName: "electricity_meter_ingestion_example",
	loadProfile: "smoke",
	scenario: electricityMeterIngestionExampleScenario,
	description:
		"Electricity meter ingestion test using the exact example payload. Uses generateElectricityExamplePayload which produces payloads matching exactly ProcessedP4UsagesDayAlignedEvent_elec_example.json. Useful for validating schema compliance and API behavior with known-good data.",
});

const test = createMeterIngestionTest(testConfig);

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
