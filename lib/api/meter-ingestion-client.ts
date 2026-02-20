import type { RefinedResponse } from "k6/http";
import http from "k6/http";
import { toPublishBody } from "../builders/api-payload.ts";
import type { TMeterPayload } from "../builders/base/meter-payload-types.ts";
import { BaseAPIClient } from "./base-api-client.ts";

export type TPublishResult = {
	data: unknown | null;
	res: RefinedResponse<undefined>;
};

export class MeterIngestionClient extends BaseAPIClient {
	publish(payload: TMeterPayload, tags?: Record<string, string>): TPublishResult {
		const url = `${this.baseUrl}/Publish`;
		const body = toPublishBody(payload);
		const res = http.post(url, JSON.stringify(body), {
			headers: this.defaultHeaders,
			timeout: __ENV.HTTP_TIMEOUT || "90s",
			tags: tags ?? {},
		});
		return {
			data: this.parseJsonBody<typeof body>(res),
			res,
		};
	}
}
