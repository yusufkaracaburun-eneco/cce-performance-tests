// Abstract base builder using Template Method Pattern
// Shared common structure with meter-specific implementations

import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import type {
	DeterminedEnergyConsumption,
	EnecoLabel,
	MeterPayload,
	ProfileCategoryCode,
} from "./meter-payload-types.ts";

export abstract class BaseMeterBuilder {
	protected payload: MeterPayload;
	protected vuId: number;
	protected iterId: number;
	protected eventTime: string;
	protected updatedAt: string;
	protected timestamp: string;

	constructor(vuId: number, iterId: number) {
		this.vuId = vuId;
		this.iterId = iterId;

		// Generate timestamps once per builder instance (performance optimization)
		// eventTime should be date with zoned time set to 00:00:00 of that day (RFC 3339)
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		this.eventTime = `${dateStr}T00:00:00Z`; // RFC 3339 format with 00:00:00
		this.updatedAt = new Date().toISOString();
		this.timestamp = new Date().toISOString();

		const eventInstanceId = uuidv4();

		// Initialize base payload structure matching ProcessedP4UsagesDayAlignedEvent_v1 schema
		this.payload = {
			key: `test-key-${vuId}-${iterId}`,
			message: {
				eventInstanceId: eventInstanceId,
				eventName: "ProcessedP4UsagesDayAligned",
				eventTime: this.eventTime,
				eventSource: "MTR",
				eventSubject: `meter-${vuId}-${iterId}`,
				eventReason: "NEW_READING_RECEIVED",
				containsPrivacyData: false,
				data: {
					label: "UNDEFINED",
					commodity: this.getCommodityEnum(),
					updatedAt: this.updatedAt,
				},
			},
		};
	}

	// Common methods (shared across all meter types)
	withConnectionMetadata(
		vuId: number,
		iterId: number,
		profileCategoryCode?: ProfileCategoryCode,
		determinedEnergyConsumption: DeterminedEnergyConsumption = "AMI",
		isDualTariffMeter?: boolean | null,
	): this {
		this.payload.message.data.connectionMetadata = {
			connectionPointEAN: `EAN-${vuId}-${iterId}`,
			countryCode: "NL",
			gridOperatorEAN: `GRID-${vuId}`,
			supplierEAN: `SUPPLIER-${vuId}`,
			profileCategoryCode:
				profileCategoryCode || this.getDefaultProfileCategoryCode(),
			determinedEnergyConsumption: determinedEnergyConsumption,
			...(isDualTariffMeter !== undefined && {
				isDualTariffMeter,
			}),
		};
		return this;
	}

	withLabelAndCommodity(label?: EnecoLabel, commodity?: string): this {
		if (label !== undefined) {
			this.payload.message.data.label = label;
		}
		if (commodity !== undefined) {
			this.payload.message.data.commodity = commodity as "E" | "G";
		}
		return this;
	}

	withMandateCodes(vuId: number, iterId: number): this {
		this.payload.message.data.mandateCodes = [`MANDATE-${vuId}-${iterId}`];
		return this;
	}

	withUsagePeriod(): this {
		// Keep usage period date in sync with eventTime day (RFC 3339 / ISO date)
		const dateStr = this.eventTime.split("T")[0];
		this.payload.message.data.usagePeriod = {
			date: dateStr,
			timezone: "Europe/Amsterdam",
			period: "P1D",
			interval: "PT15M",
		};
		return this;
	}

	// Abstract methods (meter-specific implementations)
	abstract withDayReadings(iterId: number): this;
	abstract withIntervalReadings(iterId: number): this;
	abstract withVolumes(iterId: number): this;
	abstract getCommodityEnum(): "E" | "G";
	abstract getUnit(): string;
	abstract getDefaultProfileCategoryCode(): ProfileCategoryCode;

	// Build method - returns final payload
	build(): MeterPayload {
		return this.payload;
	}
}
