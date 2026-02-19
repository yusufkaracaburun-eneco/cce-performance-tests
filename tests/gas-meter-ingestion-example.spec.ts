import { gasMeterIngestionExampleScenario } from "../scenarios/apis/gas-meter-ingestion.example.ts";
import { createTestConfig } from "./lib/test-config.ts";
import { createMeterIngestionTest } from "./lib/test-factory.ts";

/**
 * Gas meter ingestion example test configuration.
 *
 * This test uses generateGasExamplePayload which produces payloads
 * matching exactly ProcessedP4UsagesDayAlignedEvent_gas_example.json.
 * Useful for validating schema compliance and API behavior with known-good data.
 */
const testConfig = createTestConfig({
	testName: "gas_meter_ingestion_example",
	loadProfile: "smoke",
	scenario: gasMeterIngestionExampleScenario,
	description:
		"Gas meter ingestion test using the exact example payload. Uses generateGasExamplePayload which produces payloads matching exactly ProcessedP4UsagesDayAlignedEvent_gas_example.json. Useful for validating schema compliance and API behavior with known-good data.",
});

const test = createMeterIngestionTest(testConfig);

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
