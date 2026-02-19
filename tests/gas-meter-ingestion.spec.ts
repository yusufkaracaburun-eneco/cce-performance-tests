import { gasMeterIngestionScenario } from "../scenarios/apis/gas-meter-ingestion.ts";
import { createTestConfig } from "./lib/test-config.ts";
import { createMeterIngestionTest } from "./lib/test-factory.ts";

/**
 * Gas meter ingestion test configuration.
 *
 * This test uses generateGasPayload which produces gas payloads
 * matching the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).
 */
const testConfig = createTestConfig({
	testName: "gas_meter_ingestion",
	loadProfile: "loadHigh",
	scenario: gasMeterIngestionScenario,
	description:
		"Gas meter ingestion test using the gas-specific scenario. Uses generateGasPayload which produces gas payloads matching the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).",
});

const test = createMeterIngestionTest(testConfig);

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
