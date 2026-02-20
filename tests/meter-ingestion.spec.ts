import { meterIngestionScenario } from "../scenarios/apis/meter-ingestion.ts";
import { createTest } from "./lib/test-factory.ts";

const test = createTest({
	testName: "meter_ingestion",
	loadProfile: "loadHigh",
	scenario: meterIngestionScenario,
	description:
		"Meter ingestion test using the reusable meterIngestionScenario.",
});

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
