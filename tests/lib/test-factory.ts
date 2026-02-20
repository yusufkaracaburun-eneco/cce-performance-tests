import type { Options } from "k6/options";
import {
	getEnvironmentValues,
	type TEnvironmentValues,
} from "../../configs/env.conf.ts";
import { getOptions } from "../../configs/options.conf.ts";
import { ErrorHandler } from "../../lib/error-handler.ts";
import type { ITestConfig, TScenarioOptions } from "./test-config.ts";

export interface ITest {
	options: Options;
	setup: () => TEnvironmentValues;
	default: (data: TEnvironmentValues) => void;
	teardown: (data: TEnvironmentValues) => void;
}

/** Builds a full k6 test (options, setup, default, teardown) from ITestConfig. Domain-agnostic: meter, contract, market-price, etc. */
export function createTest(config: ITestConfig): ITest {
	const errorHandler =
		config.errorHandler ?? ErrorHandler.createConsoleLogger();

	const options = getOptions(config.loadProfile);

	const setup = (): TEnvironmentValues => {
		const environmentValues = getEnvironmentValues();
		const testInfo = [
			`${config.testName} test started:`,
			environmentValues.baseUrl,
			environmentValues.testStartTime,
			`${options.vus ?? "N/A"} virtual users`,
			`${options.duration ?? "N/A"} duration`,
		].join(", ");

		console.info(testInfo);
		return environmentValues;
	};

	const testFunction = (data: TEnvironmentValues): void => {
		const scenarioOptions: TScenarioOptions = {
			errorHandler,
			tags: {
				test_name: config.testName,
			},
		};

		config.scenario(data.baseUrl, scenarioOptions);
	};

	const teardown = (_data: TEnvironmentValues): void => {};

	return {
		options,
		setup,
		default: testFunction,
		teardown,
	};
}
