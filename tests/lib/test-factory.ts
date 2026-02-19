import type { Options } from "k6/options";
import {
	type EnvironmentValues,
	getEnvironmentValues,
} from "../../configs/env.conf.ts";
import { getOptions } from "../../configs/options.conf.ts";
import { ErrorHandler } from "../../lib/error-handler.ts";
import type {
	TestConfig,
	MeterIngestionScenarioOptions,
} from "./test-config.ts";

/**
 * Result object returned by the test factory.
 * Contains all exports required by k6 test files.
 */
export interface MeterIngestionTest {
	/**
	 * k6 test options (VUs, duration, thresholds, stages).
	 * Configured based on the load profile in TestConfig.
	 */
	options: Options;
	/**
	 * Setup function called once before the test starts.
	 * Initializes environment and logs test start information.
	 */
	setup: () => EnvironmentValues;
	/**
	 * Main test function executed for each VU iteration.
	 * Calls the configured scenario with proper error handling.
	 */
	default: (data: EnvironmentValues) => void;
	/**
	 * Teardown function called once after the test completes.
	 * Can be used for cleanup, final reporting, etc.
	 */
	teardown: (data: EnvironmentValues) => void;
}

/**
 * Creates a complete meter ingestion test from a configuration.
 *
 * This factory function implements the Template Method pattern, providing
 * a common test structure while allowing customization through the TestConfig.
 *
 * The factory handles:
 * - Error handler creation
 * - Options generation based on load profile
 * - Setup function with dynamic logging
 * - Test execution function
 * - Teardown function
 *
 * @param config - Test configuration object
 * @returns Complete test object with all required k6 exports
 *
 * @example
 * ```typescript
 * const test = createMeterIngestionTest({
 *   testName: "electricity_meter_ingestion",
 *   loadProfile: "loadHigh",
 *   scenario: electricityMeterIngestionScenario,
 *   description: "Tests electricity meter ingestion"
 * });
 *
 * export const options = test.options;
 * export const setup = test.setup;
 * export default test.default;
 * export const teardown = test.teardown;
 * ```
 */
export function createMeterIngestionTest(
	config: TestConfig,
): MeterIngestionTest {
	// Create error handler instance (shared across all VUs)
	const errorHandler = ErrorHandler.createConsoleLogger();

	// Generate options based on load profile
	const options = getOptions(config.loadProfile);

	/**
	 * Setup function: Called once before the test starts.
	 * Initializes environment values and logs test information.
	 */
	const setup = (): EnvironmentValues => {
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

	/**
	 * Main test function: Executed for each VU iteration.
	 * Calls the configured scenario with error handler and tags.
	 */
	const testFunction = (data: EnvironmentValues): void => {
		const scenarioOptions: MeterIngestionScenarioOptions = {
			errorHandler,
			tags: {
				test_name: config.testName,
			},
		};

		config.scenario(data.baseUrl, scenarioOptions);
	};

	/**
	 * Teardown function: Called once after the test completes.
	 * Currently empty but can be extended for cleanup or reporting.
	 */
	const teardown = (_data: EnvironmentValues): void => {
		// Teardown logic can be added here if needed
		// For example: cleanup, final reporting, etc.
	};

	return {
		options,
		setup,
		default: testFunction,
		teardown,
	};
}
