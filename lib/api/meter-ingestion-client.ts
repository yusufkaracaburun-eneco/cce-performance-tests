import type { RefinedResponse } from "k6/http";
import http from "k6/http";
import { toPublishBody } from "../builders/api-payload.ts";
import type { MeterPayload } from "../builders/base/meter-payload-types.ts";
import { BaseAPIClient } from "./base-api-client.ts";

export type PublishResult = {
	data: unknown | null;
	res: RefinedResponse<undefined>;
};

/**
 * API client for meter ingestion: publish meter payloads to POST /Publish.
 */
export class MeterIngestionClient extends BaseAPIClient {
	/**
	 * Publish a meter payload to the backend.
	 * @returns { data, res } so the test can run checks and use the response.
	 */
	/**
	 * Publish a meter payload. Sends body as { key, message } with API format (schema tags + numeric enums).
	 */
	publish(payload: MeterPayload): PublishResult {
		const url = `${this.baseUrl}/Publish`;
		const headers = {
			...this.defaultHeaders,
			"Content-Type": "application/json",
		};
		const body = toPublishBody(payload);
		const res = http.post(url, JSON.stringify(body), { 
			headers,
			timeout: __ENV.HTTP_TIMEOUT || "90s",
		});
		return {
			data: this.parseJsonBody<typeof body>(res),
			res,
		};
	}
}
