// TypeScript interfaces and types for meter payloads
// Based on ProcessedP4UsagesDayAlignedEvent_v1 Avro schema

export enum EMeterType {
	ELECTRICITY = "electricity",
	GAS = "gas",
}

export type TMeterType = EMeterType;

// Enums from the schema
export enum EProfileCategoryCode {
	E1A = "E1A",
	E1B = "E1B",
	E2A = "E2A",
	E2B = "E2B",
	E3A = "E3A",
	E3B = "E3B",
	E4A = "E4A",
	E4B = "E4B",
	G1A = "G1A",
	G2A = "G2A",
	G2B = "G2B",
	G2C = "G2C",
	GXX = "GXX",
	GGV = "GGV",
}

export type TProfileCategoryCode = EProfileCategoryCode;

export enum EDeterminedEnergyConsumption {
	AMI = "AMI",
	AZI = "AZI",
}

export type TDeterminedEnergyConsumption = EDeterminedEnergyConsumption;

export enum EEnecoLabel {
	ENECO = "eneco",
	OXXIO = "oxxio",
	WOONENERGIE = "woonenergie",
	UNDEFINED = "UNDEFINED",
	ENECOBUSINESS = "enecobusiness",
}

export type TEnecoLabel = EEnecoLabel;

export enum ECommodityEnum {
	E = "E",
	G = "G",
}

export type TCommodityEnum = ECommodityEnum;

export enum ESourceEnum {
	ACTUAL = "ACTUAL",
	ESTIMATED = "ESTIMATED",
	CORRECTED = "CORRECTED",
	MANUAL = "MANUAL",
	UNDEFINED = "UNDEFINED",
}

export type TSourceEnum = ESourceEnum;

/** Avro: data.connectionMetadata (ConnectionMetaData). */
export interface IConnectionMetadata {
	connectionPointEAN?: string | null;
	countryCode?: string | null;
	gridOperatorEAN?: string | null;
	supplierEAN?: string | null;
	profileCategoryCode?: TProfileCategoryCode | null;
	determinedEnergyConsumption?: TDeterminedEnergyConsumption | null;
	isDualTariffMeter?: boolean | null;
}

/** Avro: data.usagePeriod (UsagePeriod). date = YYYY-MM-DD, timezone = tzdata (e.g. Europe/Amsterdam). period/interval = ISO 8601 duration (e.g. P1D, PT15M). */
export interface IUsagePeriod {
	date?: string | null;
	timezone?: string | null;
	period?: string | null;
	interval?: string | null;
}

/** One item in data.reading.values (Avro ReadingValuesItem). Used for daily cumulative start/end. */
export interface IDayReadingValue {
	start?: number | null;
	end?: number | null;
	startSource?: TSourceEnum | null;
	endSource?: TSourceEnum | null;
	isPeak?: boolean | null;
	injection?: boolean | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
}

/** Avro data.reading (ReadingValuesRecord): unit (e.g. kWh, MTQ), intervalDuration P1D, values. */
export interface IDayReadings {
	unit?: string | null;
	intervalDuration?: string | null; // ISO 8601 e.g. P1D
	values?: IDayReadingValue[] | null;
}

/** One item in interval values (Avro VolumeValuesItem / electricity interval). timestamp = RFC3339 start of interval. */
export interface IIntervalReadingValue {
	timestamp?: string | null;
	consumption?: number | null;
	production?: number | null;
	consumptionSource?: TSourceEnum | null;
	productionSource?: TSourceEnum | null;
	isPeak?: boolean | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
}

/** Interval-level readings: unit (e.g. Wh for electricity), intervalDuration (e.g. PT15M), values. */
export interface IIntervalReadings {
	unit?: string | null;
	intervalDuration?: string | null; // ISO 8601 e.g. PT15M
	values?: IIntervalReadingValue[] | null;
}

/** Maps to Avro data.reading (day) + interval shape for electricity (data.volume-style intervals in Wh). */
export interface IReadings {
	day?: IDayReadings | null;
	interval?: IIntervalReadings | null;
}

/** One item in data.volume.values (Avro VolumeValuesItem). Gas: temperatureCorrection, caloricValue typically set. */
export interface IVolumeValue {
	timestamp?: string | null;
	consumption?: number | null;
	production?: number | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
	isPeak?: boolean | null; // Required in API conversion, default: false
	consumptionSource?: TSourceEnum | null;
	productionSource?: TSourceEnum | null;
}

/** Avro data.volume (VolumeRecord): unit (e.g. Wh, DM3), intervalDuration (e.g. PT15M, PT1H), values. */
export interface IVolumes {
	interval: {
		unit: string;
		intervalDuration?: string | null; // ISO 8601 e.g. PT15M, PT1H
		values?: IVolumeValue[] | null;
	};
}

export interface IMeterData {
	connectionMetadata?: IConnectionMetadata | null;
	label: TEnecoLabel; // Required, default: "UNDEFINED"
	commodity?: TCommodityEnum | null;
	mandateCodes?: string[] | null;
	usagePeriod?: IUsagePeriod | null;
	readings?: IReadings | null;
	volumes?: IVolumes | null;
	updatedAt: string; // Required
}

export interface IMeterMessage {
	eventInstanceId: string; // Required
	eventName: string; // Required, default: "ProcessedP4UsagesDayAligned"
	eventTime: string; // Required, RFC 3339 format
	eventSource: string; // Required, default: "MTR"
	eventSubject?: string | null;
	eventReason?: string | null;
	containsPrivacyData?: boolean | null;
	data: IMeterData; // Required
}

export interface IMeterPayload {
	key: string; // Added by API wrapper, not in schema
	message: IMeterMessage;
}

export interface IBuilderOptions {
	vuId: number;
	iterId: number;
}

export type TConnectionMetadata = IConnectionMetadata;
export type TUsagePeriod = IUsagePeriod;
export type TDayReadingValue = IDayReadingValue;
export type TDayReadings = IDayReadings;
export type TIntervalReadingValue = IIntervalReadingValue;
export type TIntervalReadings = IIntervalReadings;
export type TReadings = IReadings;
export type TVolumeValue = IVolumeValue;
export type TVolumes = IVolumes;
export type TMeterData = IMeterData;
export type TMeterMessage = IMeterMessage;
export type TMeterPayload = IMeterPayload;
export type TBuilderOptions = IBuilderOptions;
