import type { ErrorHandler } from "../../lib/error-handler.ts";
import type { MeterType } from "../../lib/builders/base/meter-payload-types.ts";

/**
 * Load profile options for k6 performance tests.
 * Maps to predefined stages in options.conf.ts.
 */
export type LoadProfile =
	| "smoke"
	| "stress"
	| "loadLow"
	| "loadMed"
	| "loadHigh"
	| undefined;

/**
 * Options for configuring the meter ingestion scenario.
 * This matches the MeterIngestionScenarioOptions from scenario files.
 */
export type MeterIngestionScenarioOptions = {
	/**
	 * Error handler instance. If not provided, errors will not be logged.
	 * Use ErrorHandler.createConsoleLogger() or ErrorHandler.createMetricLogger(counter) for logging.
	 */
	errorHandler?: ErrorHandler;
	/**
	 * Additional tags to apply to requests and checks.
	 * These tags can be used for filtering metrics and setting thresholds.
	 */
	tags?: Record<string, string>;
	/**
	 * Meter type to use for payload generation.
	 * Defaults to MeterType.ELECTRICITY.
	 */
	meterType?: MeterType;
};

/**
 * Function signature for meter ingestion scenarios.
 * All scenario functions follow this signature pattern.
 */
export type MeterIngestionScenarioFunction = (
	baseUrl: string,
	options?: MeterIngestionScenarioOptions,
) => void;

/**
 * Configuration for creating a meter ingestion test.
 * This interface defines all the parameters needed to generate a test file.
 */
export interface TestConfig {
	/**
	 * Unique test identifier used in logging and tags.
	 * Should be descriptive and follow snake_case convention (e.g., "electricity_meter_ingestion").
	 */
	testName: string;
	/**
	 * Load profile to use for this test.
	 * Maps to predefined stages: smoke, stress, loadLow, loadMed, loadHigh.
	 * If undefined, uses default options from environment variables.
	 */
	loadProfile: LoadProfile;
	/**
	 * Scenario function to execute during the test.
	 * This is the main test logic that will be called for each VU iteration.
	 */
	scenario: MeterIngestionScenarioFunction;
	/**
	 * Optional description of what this test validates.
	 * Used for documentation and test reporting.
	 */
	description?: string;
}

/**
 * Creates a test configuration object with type safety.
 * This builder function ensures all required fields are provided.
 *
 * @param config - Test configuration object
 * @returns The same configuration object (for type checking)
 *
 * @example
 * ```typescript
 * const config = createTestConfig({
 *   testName: "electricity_meter_ingestion",
 *   loadProfile: "loadHigh",
 *   scenario: electricityMeterIngestionScenario,
 *   description: "Tests electricity meter ingestion with high load"
 * });
 * ```
 */
export function createTestConfig(config: TestConfig): TestConfig {
	return config;
}
