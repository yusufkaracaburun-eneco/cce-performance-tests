import { meterIngestionScenario } from "../scenarios/apis/meter-ingestion.ts";
import { createTestConfig } from "./lib/test-config.ts";
import { createMeterIngestionTest } from "./lib/test-factory.ts";

/**
 * Meter ingestion test configuration.
 *
 * This test uses the reusable meterIngestionScenario which implements the VU logic.
 * The scenario can be reused across different test configurations (smoke, stress, etc.)
 * and environments (dev, test, acc, prod).
 */
const testConfig = createTestConfig({
	testName: "meter_ingestion",
	loadProfile: "loadHigh",
	scenario: meterIngestionScenario,
	description:
		"Meter ingestion test using the reusable scenario. Delegates to meterIngestionScenario which implements the VU logic.",
});

const test = createMeterIngestionTest(testConfig);

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
