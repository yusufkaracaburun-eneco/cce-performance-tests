import type { ErrorHandler } from "../../../lib/error-handler.ts";
import type { MeterType } from "../../../lib/builders/base/meter-payload-types.ts";

/**
 * Options for configuring the meter ingestion scenario.
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
