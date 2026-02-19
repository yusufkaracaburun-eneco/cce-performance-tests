import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import { generateGasExamplePayload } from "../../lib/builders/index.ts";
import { createMeterIngestionScenario } from "./shared/base-scenario.ts";

export type { MeterIngestionScenarioOptions } from "./shared/types.ts";

/**
 * Gas meter ingestion example scenario.
 *
 * Uses generateGasExamplePayload which produces payloads
 * matching exactly ProcessedP4UsagesDayAlignedEvent_gas_example.json.
 * Useful for validating schema compliance and API behavior with known-good data.
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 */
export const gasMeterIngestionExampleScenario = createMeterIngestionScenario(
	(_meterType) => generateGasExamplePayload(),
	MeterType.GAS,
);
