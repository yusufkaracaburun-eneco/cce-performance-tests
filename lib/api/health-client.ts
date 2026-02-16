import type { RefinedResponse } from "k6/http";
import http from "k6/http";
import { BaseAPIClient } from "./base-api-client.ts";

export type GetHealthResult = {
	data: unknown | null;
	res: RefinedResponse<undefined>;
};

/**
 * API client for health checks: GET health endpoint.
 */
export class HealthClient extends BaseAPIClient {
	/**
	 * GET the health endpoint.
	 * @param endpoint - path such as '/health' (with or without leading slash)
	 * @returns { data, res } for checks and optional body inspection.
	 */
	getHealth(endpoint: string = "/health"): GetHealthResult {
		const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
		const url = `${this.baseUrl}${path}`;
		const res = http.get(url, { headers: this.defaultHeaders });
		return {
			data: this.parseJsonBody(res),
			res,
		};
	}
}
