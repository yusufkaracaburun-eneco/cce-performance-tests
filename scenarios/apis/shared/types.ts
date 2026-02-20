import type { MeterType } from "../../../lib/builders/base/meter-payload-types.ts";
import type { ErrorHandler } from "../../../lib/error-handler.ts";

/** Shared options for any ingestion scenario (used by test harness). */
export interface IScenarioOptions {
	readonly errorHandler?: ErrorHandler;
	readonly tags?: Record<string, string>;
}

/** Options for the meter ingestion scenario (IScenarioOptions + meterType). */
export interface IMeterIngestionScenarioOptions extends IScenarioOptions {
	readonly meterType?: MeterType;
}

export type TScenarioOptions = IScenarioOptions;
export type TMeterIngestionScenarioOptions = IMeterIngestionScenarioOptions;
