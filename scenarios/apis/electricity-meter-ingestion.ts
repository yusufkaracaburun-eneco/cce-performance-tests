import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import { generateElectricityPayload } from "../../lib/builders/index.ts";
import { createMeterIngestionScenario } from "./shared/base-scenario.ts";

export type { MeterIngestionScenarioOptions } from "./shared/types.ts";

/**
 * Electricity meter ingestion scenario.
 *
 * Uses generateElectricityPayload which produces electricity payloads
 * matching the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 */
export const electricityMeterIngestionScenario = createMeterIngestionScenario(
	(_meterType) => generateElectricityPayload(__VU, __ITER),
	MeterType.ELECTRICITY,
);
