import type { ErrorHandler } from "../../lib/error-handler.ts";
import type { TScenarioOptions } from "../../scenarios/apis/shared/types.ts";

export type TLoadProfile =
	| "smoke"
	| "stress"
	| "loadLow"
	| "loadMed"
	| "loadHigh"
	| undefined;

export type { IScenarioOptions, TScenarioOptions } from "../../scenarios/apis/shared/types.ts";

/** Generic scenario signature: any domain can plug in (meter, contract, market-price, etc.). */
export type TScenarioFunction = (
	baseUrl: string,
	options?: TScenarioOptions,
) => void;

export interface ITestConfig {
	/** Unique test identifier used in logging and tags (snake_case). */
	readonly testName: string;
	/** Load profile: smoke, stress, loadLow, loadMed, loadHigh. */
	readonly loadProfile: TLoadProfile;
	/** Scenario function executed each VU iteration (generic: any ingestion domain). */
	readonly scenario: TScenarioFunction;
	/** Optional error handler; defaults to ErrorHandler.createConsoleLogger(). */
	readonly errorHandler?: ErrorHandler;
	/** Optional description for documentation and reporting. */
	readonly description?: string;
}
