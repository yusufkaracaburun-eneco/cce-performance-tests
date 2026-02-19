// Helper functions for generating meter payloads
// Provides convenient wrapper functions for common payload generation patterns
//
// Note: Example payload functions (generateElectricityExamplePayload, generateGasExamplePayload)
// use .0 suffixes on numeric values to match the example JSON files exactly.
// Linter warnings about zero fractions are expected and intentional.

import type { MeterPayload } from "./base/meter-payload-types.ts";
import { MeterType } from "./base/meter-payload-types.ts";
import { MeterBuilderFactory } from "./factory/meter-builder-factory.ts";

/**
 * Generates a complete meter payload with all standard fields
 * This is a convenience function that applies the most common builder pattern
 *
 * @param vuId - Virtual User ID
 * @param iterId - Iteration ID
 * @param meterType - Type of meter (MeterType.ELECTRICITY | MeterType.GAS), defaults to MeterType.ELECTRICITY
 * @returns Complete meter payload ready for API submission
 */
export function generateMeterPayload(
	vuId: number,
	iterId: number,
	meterType: MeterType = MeterType.ELECTRICITY,
): MeterPayload {
	return MeterBuilderFactory.create(meterType, vuId, iterId)
		.withConnectionMetadata(vuId, iterId)
		.withLabelAndCommodity()
		.withMandateCodes(vuId, iterId)
		.withUsagePeriod()
		.withDayReadings(iterId)
		.withIntervalReadings(iterId)
		.withVolumes(iterId)
		.build();
}

/**
 * Generates a single electricity meter payload with all standard fields.
 * Matches the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).
 *
 * @param vuId - Virtual User ID
 * @param iterId - Iteration ID
 * @returns Complete electricity meter payload ready for API submission
 */
export function generateElectricityPayload(
	vuId: number,
	iterId: number,
): MeterPayload {
	return MeterBuilderFactory.create(MeterType.ELECTRICITY, vuId, iterId)
		.withConnectionMetadata(vuId, iterId, "E1B", "AZI", true)
		.withLabelAndCommodity("eneco")
		.withMandateCodes(vuId, iterId)
		.withUsagePeriod()
		.withDayReadings(iterId)
		.withIntervalReadings(iterId)
		.withVolumes(iterId)
		.build();
}

/**
 * Generates a single gas meter payload with all standard fields.
 * Matches the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).
 *
 * @param vuId - Virtual User ID
 * @param iterId - Iteration ID
 * @returns Complete gas meter payload ready for API submission
 */
export function generateGasPayload(vuId: number, iterId: number): MeterPayload {
	return MeterBuilderFactory.create(MeterType.GAS, vuId, iterId)
		.withConnectionMetadata(vuId, iterId)
		.withLabelAndCommodity("eneco")
		.withMandateCodes(vuId, iterId)
		.withUsagePeriod()
		.withDayReadings(iterId)
		.withIntervalReadings(iterId)
		.withVolumes(iterId)
		.build();
}

/**
 * Generates an array of electricity meter payloads for performance tests.
 * Each payload matches the electricity example shape (E1B, AZI, dual-tariff, Wh intervals).
 *
 * @param count - Number of payloads to generate
 * @returns Array of MeterPayload ready for toPublishBody / publish
 */
export function generateElectricityPayloads(count: number): MeterPayload[] {
	const payloads: MeterPayload[] = [];
	for (let i = 0; i < count; i++) {
		payloads.push(
			MeterBuilderFactory.create(MeterType.ELECTRICITY, 1, i)
				.withConnectionMetadata(1, i, "E1B", "AZI", true)
				.withLabelAndCommodity("eneco")
				.withMandateCodes(1, i)
				.withUsagePeriod()
				.withDayReadings(i)
				.withIntervalReadings(i)
				.withVolumes(i)
				.build(),
		);
	}
	return payloads;
}

/**
 * Generates an array of gas meter payloads for performance tests.
 * Each payload matches the gas example shape (G1A, MTQ/DM3, PT1H, temperature/caloric).
 *
 * @param count - Number of payloads to generate
 * @returns Array of MeterPayload ready for toPublishBody / publish
 */
export function generateGasPayloads(count: number): MeterPayload[] {
	const payloads: MeterPayload[] = [];
	for (let i = 0; i < count; i++) {
		payloads.push(
			MeterBuilderFactory.create(MeterType.GAS, 1, i)
				.withConnectionMetadata(1, i)
				.withLabelAndCommodity("eneco")
				.withMandateCodes(1, i)
				.withUsagePeriod()
				.withDayReadings(i)
				.withIntervalReadings(i)
				.withVolumes(i)
				.build(),
		);
	}
	return payloads;
}

/**
 * Generates an electricity meter payload matching exactly ProcessedP4UsagesDayAlignedEvent_elec_example.json.
 * All values match the example file exactly.
 *
 * @returns MeterPayload matching the electricity example exactly
 */
export function generateElectricityExamplePayload(): MeterPayload {
	return {
		key: "example-electricity-key",
		message: {
			eventInstanceId: "de53fdd3-1960-414f-8c5f-bed3d6a099f9",
			eventName: "ProcessedP4UsagesDayAligned",
			eventTime: "2026-01-28T16:39:27.304+01:00",
			eventSource: "MTR",
			eventSubject: "871689290600044291",
			eventReason: null,
			containsPrivacyData: true,
			data: {
				connectionMetadata: {
					connectionPointEAN: "871689290600044291",
					countryCode: "NL",
					gridOperatorEAN: "8716892000005",
					supplierEAN: "8714252007107",
					profileCategoryCode: "E1B",
					determinedEnergyConsumption: "AZI",
					isDualTariffMeter: true,
				},
				label: "eneco",
				commodity: "E",
				mandateCodes: ["INT_EN", "ISMA_EN"],
				usagePeriod: {
					date: "2026-01-23",
					timezone: "Europe/Amsterdam",
				},
				readings: {
					day: {
						unit: "kWh",
						intervalDuration: "P1D",
						values: [
							{
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								start: 6395000.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								end: 6397000.0,
								startSource: "CORRECTED",
								endSource: "ACTUAL",
								isPeak: true,
								injection: false,
							},
							{
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								start: 5610000.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								end: 5611000.0,
								startSource: "CORRECTED",
								endSource: "ACTUAL",
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								injection: false,
							},
						],
					},
					interval: {
						unit: "Wh",
						intervalDuration: "PT15M",
						values: [
							{
								timestamp: "2026-01-23T00:00:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 27.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T00:15:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 35.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T23:30:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 14.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T23:45:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 20.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
						],
					},
				},
				volumes: {
					interval: {
						unit: "Wh",
						intervalDuration: "PT15M",
						values: [
							{
								timestamp: "2026-01-23T00:00:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 27.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T00:15:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 35.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T23:30:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 14.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
							{
								timestamp: "2026-01-23T23:45:00.000+0100",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 20.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								production: 0.0,
								temperatureCorrection: null,
								caloricValue: null,
								isPeak: false,
								consumptionSource: "ACTUAL",
								productionSource: "ACTUAL",
							},
						],
					},
				},
				updatedAt: "2025-11-01T23:00:00.000+0000",
			},
		},
	};
}

/**
 * Generates a gas meter payload matching exactly ProcessedP4UsagesDayAlignedEvent_gas_example.json.
 * All values match the example file exactly.
 *
 * @returns MeterPayload matching the gas example exactly
 */
export function generateGasExamplePayload(): MeterPayload {
	return {
		key: "example-gas-key",
		message: {
			eventInstanceId: "f0f639bd-63e9-4e0c-9036-460fdae17423",
			eventName: "ProcessedP4UsagesDayAligned",
			eventTime: "2025-10-17T00:00:00+01:00",
			eventSource: "MTR",
			eventSubject: "8716912020002XXXXX",
			eventReason: "NEW_READING_RECEIVED",
			containsPrivacyData: true,
			data: {
				connectionMetadata: {
					connectionPointEAN: "8716912020002XXXXX",
					countryCode: "NL",
					gridOperatorEAN: "8716912XXXXX",
					supplierEAN: "8717185XXXXX",
					profileCategoryCode: "G1A",
					determinedEnergyConsumption: null,
					isDualTariffMeter: null,
				},
				label: "eneco",
				commodity: "G",
				mandateCodes: ["DP_INTE_EN", "DP_ISMA_EN"],
				usagePeriod: {
					date: "2025-10-17",
					timezone: "Europe/Amsterdam",
				},
				readings: {
					day: {
						unit: "MTQ",
						intervalDuration: "P1D",
						values: [
							{
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								start: 2455.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								end: 2460.0,
								startSource: "ACTUAL",
								endSource: "ACTUAL",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								temperatureCorrection: 0.0,
								caloricValue: 31.649999618530273,
								isPeak: null,
								injection: null,
							},
						],
					},
					interval: {
						unit: "DM3",
						intervalDuration: "PT1H",
						values: [
							{
								timestamp: "2025-10-16T08:00:00.000+0000",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 96.0,
								production: null,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								temperatureCorrection: 0.0,
								caloricValue: 31.649999618530273,
								isPeak: null,
								consumptionSource: "ACTUAL",
								productionSource: null,
							},
							{
								timestamp: "2025-10-17T23:00:00.000+0000",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 30.0,
								production: null,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								temperatureCorrection: 0.0,
								caloricValue: 31.649999618530273,
								isPeak: null,
								consumptionSource: "ACTUAL",
								productionSource: null,
							},
						],
					},
				},
				volumes: {
					interval: {
						unit: "DM3",
						intervalDuration: "PT1H",
						values: [
							{
								timestamp: "2025-10-16T08:00:00.000+0000",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 96.0,
								production: null,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								temperatureCorrection: 0.0,
								caloricValue: 31.649999618530273,
								isPeak: null,
								consumptionSource: "ACTUAL",
								productionSource: null,
							},
							{
								timestamp: "2025-10-17T23:00:00.000+0000",
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								consumption: 30.0,
								production: null,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								temperatureCorrection: 0.0,
								caloricValue: 31.649999618530273,
								isPeak: null,
								consumptionSource: "ACTUAL",
								productionSource: null,
							},
						],
					},
				},
				updatedAt: "2025-11-01T23:00:00.000+0000",
			},
		},
	};
}
