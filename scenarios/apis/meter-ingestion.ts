import { MeterType } from "../../lib/builders/base/meter-payload-types.ts";
import { generateMeterPayload } from "../../lib/builders/index.ts";
import { createMeterIngestionScenario } from "./shared/base-scenario.ts";

export type { MeterIngestionScenarioOptions } from "./shared/types.ts";

/**
 * Reusable scenario for meter ingestion testing.
 *
 * This scenario uses generateMeterPayload with configurable meter type.
 * The scenario can be reused across different test configurations (smoke, stress, etc.)
 * and environments (dev, test, acc, prod).
 *
 * @param baseUrl - Base URL of the API (e.g., "https://api.example.com")
 * @param options - Optional configuration for the scenario
 */
export const meterIngestionScenario = createMeterIngestionScenario(
	(meterType) => generateMeterPayload(__VU, __ITER, meterType),
	MeterType.ELECTRICITY,
	true, // log payload
);
