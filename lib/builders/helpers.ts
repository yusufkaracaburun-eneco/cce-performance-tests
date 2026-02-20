// Example payloads use .0 suffixes to match example JSON; zero-fraction lint is intentional.

import type {
	TDeterminedEnergyConsumption,
	TEnecoLabel,
	TProfileCategoryCode,
	TMeterPayload,
} from "./base/meter-payload-types.ts";
import {
	EMeterType,
	EProfileCategoryCode,
	EDeterminedEnergyConsumption,
	EEnecoLabel,
	ECommodityEnum,
	ESourceEnum,
} from "./base/meter-payload-types.ts";
import { MeterBuilderFactory } from "./factory/meter-builder-factory.ts";

interface IStandardPayloadOptions {
	readonly profileCategoryCode?: TProfileCategoryCode;
	readonly determinedEnergyConsumption?: TDeterminedEnergyConsumption;
	readonly isDualTariffMeter?: boolean | null;
	readonly label?: TEnecoLabel;
}

/** Standard builder chain: connection metadata, label, mandate codes, usage period, readings, volumes. */
function buildStandardPayload(
	meterType: EMeterType,
	vuId: number,
	iterId: number,
	options?: IStandardPayloadOptions,
): TMeterPayload {
	const builder = MeterBuilderFactory.create(meterType, vuId, iterId);
	const conn = options
		? builder.withConnectionMetadata(
				vuId,
				iterId,
				options.profileCategoryCode,
				options.determinedEnergyConsumption ?? EDeterminedEnergyConsumption.AMI,
				options.isDualTariffMeter,
			)
		: builder.withConnectionMetadata(vuId, iterId);
	const withLabel = options?.label
		? conn.withLabelAndCommodity(options.label)
		: conn.withLabelAndCommodity();
	return withLabel
		.withMandateCodes(vuId, iterId)
		.withUsagePeriod()
		.withDayReadings(iterId)
		.withIntervalReadings(iterId)
		.withVolumes(iterId)
		.build();
}

export function generateMeterPayload(
	vuId: number,
	iterId: number,
	meterType: EMeterType = EMeterType.ELECTRICITY,
): TMeterPayload {
	return buildStandardPayload(meterType, vuId, iterId);
}

/** Electricity payload: E1B, AZI, dual-tariff, Wh intervals. */
export function generateElectricityPayload(
	vuId: number,
	iterId: number,
): TMeterPayload {
	return buildStandardPayload(EMeterType.ELECTRICITY, vuId, iterId, {
		profileCategoryCode: EProfileCategoryCode.E1B,
		determinedEnergyConsumption: EDeterminedEnergyConsumption.AZI,
		isDualTariffMeter: true,
		label: EEnecoLabel.ENECO,
	});
}

/** Gas payload: G1A, MTQ/DM3, PT1H, temperature/caloric. */
export function generateGasPayload(
	vuId: number,
	iterId: number,
): TMeterPayload {
	return buildStandardPayload(EMeterType.GAS, vuId, iterId, { label: EEnecoLabel.ENECO });
}

/** Exact match to ProcessedP4UsagesDayAlignedEvent_elec_example.json. */
export function generateElectricityExamplePayload(): TMeterPayload {
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
					profileCategoryCode: EProfileCategoryCode.E1B,
					determinedEnergyConsumption: EDeterminedEnergyConsumption.AZI,
					isDualTariffMeter: true,
				},
				label: EEnecoLabel.ENECO,
				commodity: ECommodityEnum.E,
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
								startSource: ESourceEnum.CORRECTED,
								endSource: ESourceEnum.ACTUAL,
								isPeak: true,
								injection: false,
							},
							{
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								start: 5610000.0,
								// biome-ignore lint/style/noZeroFraction: Match example JSON exactly
								end: 5611000.0,
								startSource: ESourceEnum.CORRECTED,
								endSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
								productionSource: ESourceEnum.ACTUAL,
							},
						],
					},
				},
				updatedAt: "2025-11-01T23:00:00.000+0000",
			},
		},
	};
}

/** Exact match to ProcessedP4UsagesDayAlignedEvent_gas_example.json. */
export function generateGasExamplePayload(): TMeterPayload {
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
					profileCategoryCode: EProfileCategoryCode.G1A,
					determinedEnergyConsumption: null,
					isDualTariffMeter: null,
				},
				label: EEnecoLabel.ENECO,
				commodity: ECommodityEnum.G,
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
								startSource: ESourceEnum.ACTUAL,
								endSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
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
								consumptionSource: ESourceEnum.ACTUAL,
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
