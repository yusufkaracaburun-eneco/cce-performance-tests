import type { RefinedResponse } from "k6/http";

export abstract class BaseAPIClient {
	protected readonly defaultHeaders: Record<string, string> = {
		accept: "*/*",
		"Content-Type": "application/json",
	};

	constructor(protected baseUrl: string) {
		this.baseUrl = baseUrl.replace(/\/+$/, "") || baseUrl;
	}

	protected parseJsonBody<T = unknown>(
		res: RefinedResponse<undefined>,
	): T | null {
		if (res.body == null) return null;
		if (res.status < 200 || res.status >= 300) return null;
		try {
			const bodyStr =
				typeof res.body === "string" ? res.body : String(res.body);
			return JSON.parse(bodyStr) as T;
		} catch {
			return null;
		}
	}
}
