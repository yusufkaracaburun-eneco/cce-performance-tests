import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import { generateGasPayload } from "../../lib/builders/index.ts";
import { createMeterIngestionScenario } from "./shared/base-scenario.ts";

export type { MeterIngestionScenarioOptions } from "./shared/types.ts";

/**
 * Gas meter ingestion scenario.
 *
 * Uses generateGasPayload which produces gas payloads
 * matching the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 */
export const gasMeterIngestionScenario = createMeterIngestionScenario(
	(_meterType) => generateGasPayload(__VU, __ITER),
	MeterType.GAS,
);
