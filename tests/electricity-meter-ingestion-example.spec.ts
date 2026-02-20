import { electricityMeterIngestionExampleScenario } from "../scenarios/apis/meter-ingestion.ts";
import { createTest } from "./lib/test-factory.ts";

const test = createTest({
	testName: "electricity_meter_ingestion_example",
	loadProfile: "smoke",
	scenario: electricityMeterIngestionExampleScenario,
	description:
		"Electricity example payload; schema validation and known-good data.",
});

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
