// TypeScript interfaces and types for meter payloads
// Based on ProcessedP4UsagesDayAlignedEvent_v1 Avro schema

export enum MeterType {
	ELECTRICITY = "electricity",
	GAS = "gas",
}

// Enums from the schema
export type ProfileCategoryCode =
	| "E1A"
	| "E1B"
	| "E2A"
	| "E2B"
	| "E3A"
	| "E3B"
	| "E4A"
	| "E4B"
	| "G1A"
	| "G2A"
	| "G2B"
	| "G2C"
	| "GXX"
	| "GGV";

export type DeterminedEnergyConsumption = "AMI" | "AZI";

export type EnecoLabel =
	| "eneco"
	| "oxxio"
	| "woonenergie"
	| "UNDEFINED"
	| "enecobusiness";

export type CommodityEnum = "E" | "G";

export type SourceEnum =
	| "ACTUAL"
	| "ESTIMATED"
	| "CORRECTED"
	| "MANUAL"
	| "UNDEFINED";

/** Avro: data.connectionMetadata (ConnectionMetaData). */
export interface ConnectionMetadata {
	connectionPointEAN?: string | null;
	countryCode?: string | null;
	gridOperatorEAN?: string | null;
	supplierEAN?: string | null;
	profileCategoryCode?: ProfileCategoryCode | null;
	determinedEnergyConsumption?: DeterminedEnergyConsumption | null;
	isDualTariffMeter?: boolean | null;
}

/** Avro: data.usagePeriod (UsagePeriod). date = YYYY-MM-DD, timezone = tzdata (e.g. Europe/Amsterdam). period/interval = ISO 8601 duration (e.g. P1D, PT15M). */
export interface UsagePeriod {
	date?: string | null;
	timezone?: string | null;
	period?: string | null;
	interval?: string | null;
}

/** One item in data.reading.values (Avro ReadingValuesItem). Used for daily cumulative start/end. */
export interface DayReadingValue {
	start?: number | null;
	end?: number | null;
	startSource?: SourceEnum | null;
	endSource?: SourceEnum | null;
	isPeak?: boolean | null;
	injection?: boolean | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
}

/** Avro data.reading (ReadingValuesRecord): unit (e.g. kWh, MTQ), intervalDuration P1D, values. */
export interface DayReadings {
	unit?: string | null;
	intervalDuration?: string | null; // ISO 8601 e.g. P1D
	values?: DayReadingValue[] | null;
}

/** One item in interval values (Avro VolumeValuesItem / electricity interval). timestamp = RFC3339 start of interval. */
export interface IntervalReadingValue {
	timestamp?: string | null;
	consumption?: number | null;
	production?: number | null;
	consumptionSource?: SourceEnum | null;
	productionSource?: SourceEnum | null;
	isPeak?: boolean | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
}

/** Interval-level readings: unit (e.g. Wh for electricity), intervalDuration (e.g. PT15M), values. */
export interface IntervalReadings {
	unit?: string | null;
	intervalDuration?: string | null; // ISO 8601 e.g. PT15M
	values?: IntervalReadingValue[] | null;
}

/** Maps to Avro data.reading (day) + interval shape for electricity (data.volume-style intervals in Wh). */
export interface Readings {
	day?: DayReadings | null;
	interval?: IntervalReadings | null;
}

/** One item in data.volume.values (Avro VolumeValuesItem). Gas: temperatureCorrection, caloricValue typically set. */
export interface VolumeValue {
	timestamp?: string | null;
	consumption?: number | null;
	production?: number | null;
	temperatureCorrection?: number | null;
	caloricValue?: number | null;
	isPeak?: boolean | null; // Required in API conversion, default: false
	consumptionSource?: SourceEnum | null;
	productionSource?: SourceEnum | null;
}

/** Avro data.volume (VolumeRecord): unit (e.g. Wh, DM3), intervalDuration (e.g. PT15M, PT1H), values. */
export interface Volumes {
	interval: {
		unit: string;
		intervalDuration?: string | null; // ISO 8601 e.g. PT15M, PT1H
		values?: VolumeValue[] | null;
	};
}

export interface MeterData {
	connectionMetadata?: ConnectionMetadata | null;
	label: EnecoLabel; // Required, default: "UNDEFINED"
	commodity?: CommodityEnum | null;
	mandateCodes?: string[] | null;
	usagePeriod?: UsagePeriod | null;
	readings?: Readings | null;
	volumes?: Volumes | null;
	updatedAt: string; // Required
}

export interface MeterMessage {
	eventInstanceId: string; // Required
	eventName: string; // Required, default: "ProcessedP4UsagesDayAligned"
	eventTime: string; // Required, RFC 3339 format
	eventSource: string; // Required, default: "MTR"
	eventSubject?: string | null;
	eventReason?: string | null;
	containsPrivacyData?: boolean | null;
	data: MeterData; // Required
}

export interface MeterPayload {
	key: string; // Added by API wrapper, not in schema
	message: MeterMessage;
}

export interface BuilderOptions {
	vuId: number;
	iterId: number;
}
