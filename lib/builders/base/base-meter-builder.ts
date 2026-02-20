import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import {
	EDeterminedEnergyConsumption,
	EEnecoLabel,
	type TCommodityEnum,
	type TDeterminedEnergyConsumption,
	type TEnecoLabel,
	type TMeterPayload,
	type TProfileCategoryCode,
} from "./meter-payload-types.ts";

export abstract class BaseMeterBuilder {
	protected payload: TMeterPayload;
	protected vuId: number;
	protected iterId: number;
	protected eventTime: string;
	protected updatedAt: string;
	protected timestamp: string;

	constructor(vuId: number, iterId: number) {
		this.vuId = vuId;
		this.iterId = iterId;

		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		this.eventTime = `${dateStr}T00:00:00Z`;
		this.updatedAt = new Date().toISOString();
		this.timestamp = new Date().toISOString();

		const eventInstanceId = uuidv4();

		this.payload = {
			key: `k6-test-key-${vuId}-${iterId}`,
			message: {
				eventInstanceId: eventInstanceId,
				eventName: "ProcessedP4UsagesDayAligned",
				eventTime: this.eventTime,
				eventSource: "MTR",
				eventSubject: `meter-${vuId}-${iterId}`,
				eventReason: "NEW_READING_RECEIVED",
				containsPrivacyData: false,
				data: {
					label: EEnecoLabel.UNDEFINED,
					commodity: this.getCommodityEnum(),
					updatedAt: this.updatedAt,
				},
			},
		};
	}

	withConnectionMetadata(
		vuId: number,
		iterId: number,
		profileCategoryCode?: TProfileCategoryCode,
		determinedEnergyConsumption: TDeterminedEnergyConsumption = EDeterminedEnergyConsumption.AMI,
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

	withLabelAndCommodity(label?: TEnecoLabel, commodity?: string): this {
		if (label !== undefined) {
			this.payload.message.data.label = label;
		}
		if (commodity !== undefined) {
			this.payload.message.data.commodity = commodity as TCommodityEnum;
		}
		return this;
	}

	withMandateCodes(vuId: number, iterId: number): this {
		this.payload.message.data.mandateCodes = [`MANDATE-${vuId}-${iterId}`];
		return this;
	}

	withUsagePeriod(): this {
		const dateStr = this.eventTime.split("T")[0];
		this.payload.message.data.usagePeriod = {
			date: dateStr,
			timezone: "Europe/Amsterdam",
			period: "P1D",
			interval: "PT15M",
		};
		return this;
	}

	abstract withDayReadings(iterId: number): this;
	abstract withIntervalReadings(iterId: number): this;
	abstract withVolumes(iterId: number): this;
	abstract getCommodityEnum(): TCommodityEnum;
	abstract getUnit(): string;
	abstract getDefaultProfileCategoryCode(): TProfileCategoryCode;

	build(): TMeterPayload {
		return this.payload;
	}
}
