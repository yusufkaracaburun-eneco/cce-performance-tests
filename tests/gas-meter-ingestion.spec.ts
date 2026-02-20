import { gasMeterIngestionExampleScenario } from "../scenarios/apis/meter-ingestion.ts";
import { createTest } from "./lib/test-factory.ts";

const test = createTest({
	testName: "gas_meter_ingestion_example",
	loadProfile: "smoke",
	scenario: gasMeterIngestionExampleScenario,
	description: "Gas example payload; schema validation and known-good data.",
});

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
