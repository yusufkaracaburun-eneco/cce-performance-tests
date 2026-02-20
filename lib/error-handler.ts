import type { RefinedResponse } from "k6/http";
import type { Counter } from "k6/metrics";

export type TErrorData = {
	url: string;
	status: number;
	error_code: number;
	traceparent?: string;
	response_body?: string;
	[key: string]: string | number | undefined;
};

const MAX_BODY_LOG_LENGTH = 500;
const MAX_TAG_VALUE_LENGTH = 200;

export class ErrorHandler {
	constructor(
		private readonly logErrorDetails: (errorData: TErrorData) => void,
	) {}

	static createConsoleLogger(): ErrorHandler {
		return new ErrorHandler((err) => console.error(JSON.stringify(err)));
	}

	static createMetricLogger(counter: Counter): ErrorHandler {
		return new ErrorHandler((errorData) => {
			const tags: { [name: string]: string } = {};
			for (const [key, value] of Object.entries(errorData)) {
				if (key === "response_body" || value === undefined) continue;
				const s = String(value);
				tags[key] =
					s.length <= MAX_TAG_VALUE_LENGTH
						? s
						: `${s.slice(0, MAX_TAG_VALUE_LENGTH)}...`;
			}
			counter.add(1, tags);
		});
	}

	logError(
		isError: boolean,
		res: RefinedResponse<undefined>,
		tags: Record<string, string | number> = {},
	): void {
		if (!isError) return;

		const traceparentHeader = res.request?.headers?.["Traceparent"];
		const traceparent =
			traceparentHeader != null
				? Array.isArray(traceparentHeader)
					? traceparentHeader[0]
					: String(traceparentHeader)
				: undefined;

		let response_body: string | undefined;
		if (res.status >= 400 && res.status < 500 && res.body != null) {
			const raw = typeof res.body === "string" ? res.body : String(res.body);
			response_body =
				raw.length <= MAX_BODY_LOG_LENGTH
					? raw
					: `${raw.slice(0, MAX_BODY_LOG_LENGTH)}... (truncated, total ${raw.length} chars)`;
		}

		const errorData: TErrorData = Object.assign(
			{
				url: res.url ?? "",
				status: res.status ?? 0,
				error_code: res.error_code ?? 0,
				traceparent,
				...(response_body !== undefined && { response_body }),
			},
			tags,
		);

		this.logErrorDetails(errorData);
	}
}
