import { check } from "k6";
import type { RefinedResponse } from "k6/http";
import type { TScenarioOptions } from "./types.ts";

export type TPublishResult = {
	data: unknown | null;
	res: RefinedResponse<undefined>;
};

/** Minimal client interface for ingestion scenarios (meter, contract, market-price, etc.). */
export interface IIngestionClient<TPayload> {
	publish(payload: TPayload, tags?: Record<string, string>): TPublishResult;
}

/** Generic publish + checks + optional error logging. Reused by meter, contract, market-price scenarios. */
export function runIngestionScenario<TPayload>(
	client: IIngestionClient<TPayload>,
	getPayload: () => TPayload,
	options?: TScenarioOptions,
	defaultRequestTags?: Record<string, string>,
): void {
	const vuId = __VU;
	const iterId = __ITER;
	const scenarioTags = options?.tags ?? {};
	const requestTags = { ...defaultRequestTags, ...scenarioTags };
	const payload = getPayload();
	const { data: responseData, res } = client.publish(payload, requestTags);
	const checkTags = { ...defaultRequestTags, ...scenarioTags };
	const mainChecks = check(
		res,
		{
			"status is 200 or 2xx": (r) => r.status >= 200 && r.status < 300,
			"response has body": (r) => {
				if (r.body === null) return false;
				if (typeof r.body === "string") return r.body.length > 0;
				return true;
			},
			"response time < 1000ms": (r) => r.timings.duration < 1000,
		},
		checkTags,
	);
	let jsonCheck = true;
	if (res.status >= 200 && res.status < 300 && responseData != null) {
		jsonCheck = check(
			responseData,
			{
				"response is valid JSON": () => typeof responseData === "object",
			},
			checkTags,
		);
	}
	if (options?.errorHandler) {
		const allChecksPassed = mainChecks && jsonCheck;
		options.errorHandler.logError(!allChecksPassed, res, {
			vuId,
			iterId,
			...scenarioTags,
		});
	}
}
