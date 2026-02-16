import { check } from "k6";
import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../configs/env.conf.ts";
import { getOptions } from "../configs/options.conf.ts";
import { HealthClient } from "../lib/api/index.ts";
import { ErrorHandler } from "../lib/error-handler.ts";

const errorHandler = new ErrorHandler((err) =>
	console.error(JSON.stringify(err)),
);

export const options = getOptions();

export function setup(): EnvironmentValues {
	const options = getEnvironmentValues();
	console.info(`>>> Health check test started: ${options.testStartTime}`);
	return options;
}

export default function (data: ReturnType<typeof setup>) {
	const client = new HealthClient(data.baseUrl);
	const { data: responseData, res } = client.getHealth();

	const mainChecks = check(res, {
		"health check status is 200": (r) => r.status === 200,
		"health check has response body": (r) => {
			if (r.body === null) return false;
			if (typeof r.body === "string") return r.body.length > 0;
			return true;
		},
		"health check response time < 500ms": (r) => r.timings.duration < 500,
	});

	let jsonCheck = true;
	if (res.status === 200 && responseData != null) {
		jsonCheck = check(responseData, {
			"health check response is valid JSON": () =>
				typeof responseData === "object",
		});
	}

	errorHandler.logError(!(mainChecks && jsonCheck), res, {});
}

export function teardown(data: ReturnType<typeof setup>) {
	const testEndTime = new Date().toISOString();
	console.info(
		`Health check test completed. Started: ${data.testStartTime}, Ended: ${testEndTime}`,
	);
}
