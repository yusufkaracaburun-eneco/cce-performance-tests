/**
 * Converts internal TMeterPayload (string enums) to API format: schema tags + numeric enums.
 * Matches the Publish endpoint example: root { key, message }, message and nested objects have schema: { tag: 0 }, enums as numbers.
 */

import type {
	TConnectionMetadata,
	TDayReadings,
	TIntervalReadings,
	TMeterData,
	TMeterMessage,
	TMeterPayload,
	TReadings,
	TUsagePeriod,
	TVolumes,
} from "./base/meter-payload-types.ts";

const SCHEMA_TAG = { schema: { tag: 0 } };

// Enum → number (order from Avro schema / backend)
const ENECO_LABEL: Record<string, number> = {
	eneco: 0,
	oxxio: 1,
	woonenergie: 2,
	UNDEFINED: 3,
	enecobusiness: 4,
};
const COMMODITY: Record<string, number> = { E: 0, G: 1 };
const PROFILE_CATEGORY: Record<string, number> = {
	E1A: 0,
	E1B: 1,
	E2A: 2,
	E2B: 3,
	E3A: 4,
	E3B: 5,
	E4A: 6,
	E4B: 7,
	G1A: 8,
	G2A: 9,
	G2B: 10,
	G2C: 11,
	GXX: 12,
	GGV: 13,
};
const DETERMINED_ENERGY: Record<string, number> = { AMI: 0, AZI: 1 };
const SOURCE: Record<string, number> = {
	ACTUAL: 0,
	ESTIMATED: 1,
	CORRECTED: 2,
	MANUAL: 3,
	UNDEFINED: 4,
};

function toLabel(v: string | undefined | null): number {
	return v != null ? (ENECO_LABEL[v] ?? 3) : 3;
}
function toCommodity(v: string | undefined | null): number {
	return v != null ? (COMMODITY[v] ?? 0) : 0;
}
function toProfileCategory(v: string | undefined | null): number {
	return v != null ? (PROFILE_CATEGORY[v] ?? 0) : 0;
}
function toDeterminedEnergy(v: string | undefined | null): number {
	return v != null ? (DETERMINED_ENERGY[v] ?? 0) : 0;
}
function toSource(v: string | undefined | null): number {
	return v != null ? (SOURCE[v] ?? 0) : 0;
}

function convertConnectionMetadata(
	m: TConnectionMetadata | undefined | null,
): unknown {
	if (m == null) return undefined;
	return {
		...SCHEMA_TAG,
		connectionPointEAN: m.connectionPointEAN ?? undefined,
		countryCode: m.countryCode ?? undefined,
		gridOperatorEAN: m.gridOperatorEAN ?? undefined,
		supplierEAN: m.supplierEAN ?? undefined,
		profileCategoryCode: toProfileCategory(m.profileCategoryCode),
		determinedEnergyConsumption: toDeterminedEnergy(
			m.determinedEnergyConsumption,
		),
	};
}

function convertUsagePeriod(u: TUsagePeriod | undefined | null): unknown {
	if (u == null) return undefined;
	return {
		...SCHEMA_TAG,
		date: u.date ?? undefined,
		timezone: u.timezone ?? undefined,
		period: u.period ?? undefined,
		interval: u.interval ?? undefined,
	};
}

function convertDayReadings(r: TDayReadings | undefined | null): unknown {
	if (r == null) return undefined;
	const values = (r.values ?? []).map((v) => ({
		...SCHEMA_TAG,
		start: v.start ?? 0,
		end: v.end ?? 0,
		startSource: toSource(v.startSource),
		endSource: toSource(v.endSource),
		isPeak: v.isPeak ?? false,
		injection: v.injection ?? false,
	}));
	return {
		...SCHEMA_TAG,
		unit: r.unit ?? undefined,
		values,
	};
}

function convertIntervalReadings(
	r: TIntervalReadings | undefined | null,
): unknown {
	if (r == null) return undefined;
	const values = (r.values ?? []).map((v) => ({
		...SCHEMA_TAG,
		timestamp: v.timestamp ?? undefined,
		consumption: v.consumption ?? 0,
		production: v.production ?? 0,
		consumptionSource: toSource(v.consumptionSource),
		productionSource: toSource(v.productionSource),
	}));
	return {
		...SCHEMA_TAG,
		unit: r.unit ?? undefined,
		values,
	};
}

function convertReadings(r: TReadings | undefined | null): unknown {
	if (r == null) return undefined;
	return {
		...SCHEMA_TAG,
		day: convertDayReadings(r.day ?? null),
		interval: convertIntervalReadings(r.interval ?? null),
	};
}

function convertVolumes(v: TVolumes | undefined | null): unknown {
	if (v == null) return undefined;
	const intervalValues = (v.interval?.values ?? []).map((item) => ({
		...SCHEMA_TAG,
		timestamp: item.timestamp ?? undefined,
		consumption: item.consumption ?? 0,
		production: item.production ?? 0,
		temperatureCorrection: item.temperatureCorrection ?? 0,
		caloricValue: item.caloricValue ?? 0,
		isPeak: item.isPeak ?? false,
		consumptionSource: toSource(item.consumptionSource),
		productionSource: toSource(item.productionSource),
	}));
	return {
		...SCHEMA_TAG,
		interval: {
			...SCHEMA_TAG,
			unit: v.interval?.unit ?? "m3",
			values: intervalValues,
		},
	};
}

function convertData(d: TMeterData): unknown {
	return {
		...SCHEMA_TAG,
		connectionMetadata: convertConnectionMetadata(d.connectionMetadata ?? null),
		label: toLabel(d.label),
		commodity: toCommodity(d.commodity),
		mandateCodes: d.mandateCodes ?? undefined,
		usagePeriod: convertUsagePeriod(d.usagePeriod ?? null),
		readings: convertReadings(d.readings ?? null),
		volumes: convertVolumes(d.volumes ?? null),
		updatedAt: d.updatedAt,
	};
}

function convertMessage(m: TMeterMessage): unknown {
	return {
		...SCHEMA_TAG,
		eventInstanceId: m.eventInstanceId,
		eventName: m.eventName,
		eventTime: m.eventTime,
		eventSource: m.eventSource,
		eventSubject: m.eventSubject ?? undefined,
		eventReason: m.eventReason ?? undefined,
		containsPrivacyData: m.containsPrivacyData ?? false,
		data: convertData(m.data),
	};
}

/**
 * Converts a TMeterPayload to the exact shape expected by POST /Publish: { key, message } with schema tags and numeric enums.
 */
export function toPublishBody(payload: TMeterPayload): {
	key: string;
	message: unknown;
} {
	return {
		key: payload.key,
		message: convertMessage(payload.message),
	};
}
