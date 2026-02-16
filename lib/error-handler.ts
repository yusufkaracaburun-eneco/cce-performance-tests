import type { RefinedResponse } from "k6/http";
import type { Counter } from "k6/metrics";

/**
 * Shape of error data passed to the ErrorHandler callback.
 * Can be used for logging, custom metrics, or observability integration.
 */
export type ErrorData = {
	url: string;
	status: number;
	error_code: number;
	traceparent?: string;
	/** Response body for 4xx responses (truncated), to help debug validation errors */
	response_body?: string;
	[key: string]: string | number | undefined;
};

const MAX_BODY_LOG_LENGTH = 500;

/** Max length for tag values when sending to k6 Counter (avoids high cardinality / backend limits). */
const MAX_TAG_VALUE_LENGTH = 200;

/**
 * Error handler that records error details via a configurable callback.
 * Use after checks to log or metric failed requests (e.g. to console or Counter).
 * Pattern follows the [Grafana k6 error handler example](https://grafana.com/docs/k6/latest/examples/error-handler/), extended with TypeScript and optional 4xx response body capture.
 */
export class ErrorHandler {
	constructor(
		private readonly logErrorDetails: (errorData: ErrorData) => void,
	) {}

	/**
	 * Returns an ErrorHandler that logs error data to the console as JSON.
	 */
	static createConsoleLogger(): ErrorHandler {
		return new ErrorHandler((err) => console.error(JSON.stringify(err)));
	}

	/**
	 * Returns an ErrorHandler that adds 1 to the given k6 Counter with error data as tags.
	 * Tag values are stringified and truncated to avoid high cardinality or backend limits.
	 */
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

	/**
	 * Returns an ErrorHandler that invokes the given callback for each error.
	 */
	static createCustomLogger(
		logErrorDetails: (errorData: ErrorData) => void,
	): ErrorHandler {
		return new ErrorHandler(logErrorDetails);
	}

	/**
	 * If the response is considered an error, build error data and invoke the callback.
	 * @param isError - true when the request/response should be treated as an error
	 * @param res - k6 HTTP response
	 * @param tags - optional tags to include in error data (e.g. vuId, iterId)
	 */
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

		const errorData: ErrorData = Object.assign(
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
