import { MeterIngestionClient } from "../../lib/api/index.ts";
import type { TMeterPayload } from "../../lib/builders/base/meter-payload-types.ts";
import { EMeterType } from "../../lib/builders/base/meter-payload-types.ts";
import {
	generateElectricityExamplePayload,
	generateGasExamplePayload,
	generateMeterPayload,
} from "../../lib/builders/index.ts";
import { runIngestionScenario } from "./shared/run-ingestion-scenario.ts";
import type { TMeterIngestionScenarioOptions } from "./shared/types.ts";

export type { TMeterIngestionScenarioOptions } from "./shared/types.ts";

type TPayloadGenerator = (meterType: EMeterType) => TMeterPayload;

function createMeterIngestionScenario(
	payloadGenerator: TPayloadGenerator,
	defaultMeterType: EMeterType = EMeterType.ELECTRICITY,
	logPayload: boolean = false,
) {
	return function meterIngestionScenario(
		baseUrl: string,
		options?: TMeterIngestionScenarioOptions,
	): void {
		const meterType = options?.meterType ?? defaultMeterType;
		const client = new MeterIngestionClient(baseUrl);
		const payload = payloadGenerator(meterType);
		if (logPayload) {
			console.info("Payload: ", payload);
		}
		const defaultRequestTags = {
			name: "meter_ingestion",
			endpoint: "publish",
			meter_type: meterType,
		};
		runIngestionScenario(client, () => payload, options, defaultRequestTags);
	};
}

export const meterIngestionScenario = createMeterIngestionScenario(
	(meterType) => generateMeterPayload(__VU, __ITER, meterType),
	EMeterType.ELECTRICITY,
);

export const electricityMeterIngestionExampleScenario =
	createMeterIngestionScenario(
		(_meterType) => generateElectricityExamplePayload(),
		EMeterType.ELECTRICITY,
	);

export const gasMeterIngestionExampleScenario = createMeterIngestionScenario(
	(_meterType) => generateGasExamplePayload(),
	EMeterType.GAS,
);
