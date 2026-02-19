import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import { generateElectricityExamplePayload } from "../../lib/builders/index.ts";
import { createMeterIngestionScenario } from "./shared/base-scenario.ts";

export type { MeterIngestionScenarioOptions } from "./shared/types.ts";

/**
 * Electricity meter ingestion example scenario.
 *
 * Uses generateElectricityExamplePayload which produces payloads
 * matching exactly ProcessedP4UsagesDayAlignedEvent_elec_example.json.
 * Useful for validating schema compliance and API behavior with known-good data.
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 */
export const electricityMeterIngestionExampleScenario =
	createMeterIngestionScenario(
		(_meterType) => generateElectricityExamplePayload(),
		MeterType.ELECTRICITY,
	);
