// Gas meter builder - Strategy Pattern implementation
// Produces payloads matching ProcessedP4UsagesDayAlignedEvent_gas_example (MTQ reading, DM3 volume, PT1H)

import { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import type {
	ProfileCategoryCode,
	SourceEnum,
	TVolumeValue,
} from "../base/meter-payload-types.ts";

const GAS_CALORIC_VALUE = 31.649999618530273;

export class GasMeterBuilder extends BaseMeterBuilder {
	getCommodityEnum(): "G" {
		return "G";
	}

	getUnit(): string {
		return "MTQ"; // Gas reading unit per Avro example
	}

	getDefaultProfileCategoryCode(): ProfileCategoryCode {
		return "G1A";
	}

	override withUsagePeriod(): this {
		super.withUsagePeriod();
		// Gas uses hourly intervals
		if (this.payload.message.data.usagePeriod) {
			this.payload.message.data.usagePeriod.interval = "PT1H";
		}
		return this;
	}

	withDayReadings(iterId: number): this {
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}
		this.payload.message.data.readings.day = {
			unit: "MTQ",
			intervalDuration: "P1D",
			values: [
				{
					start: 2455 + iterId,
					end: 2460 + iterId,
					startSource: "ACTUAL" as SourceEnum,
					endSource: "ACTUAL" as SourceEnum,
					temperatureCorrection: 0,
					caloricValue: GAS_CALORIC_VALUE,
					isPeak: null,
					injection: null,
				},
			],
		};
		return this;
	}

	withIntervalReadings(iterId: number): this {
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}
		const period = this.payload.message.data.usagePeriod;
		const date = period?.date ?? new Date().toISOString().split("T")[0];
		const values = this.buildGasVolumeValues(date, iterId);
		this.payload.message.data.readings.interval = {
			unit: "DM3",
			intervalDuration: "PT1H",
			values: values.map((v) => ({
				timestamp: v.timestamp,
				consumption: v.consumption,
				production: v.production,
				consumptionSource: v.consumptionSource,
				productionSource: v.productionSource,
				isPeak: v.isPeak,
				temperatureCorrection: v.temperatureCorrection,
				caloricValue: v.caloricValue,
			})),
		};
		return this;
	}

	/** Build volume values for gas (PT1H): two slots matching example. */
	private buildGasVolumeValues(date: string, iterId: number): TVolumeValue[] {
		const [y, m, d] = date.split("-").map(Number);
		const dayBefore = new Date(y, m - 1, d - 1);
		const dayBeforeStr = dayBefore.toISOString().split("T")[0];
		return [
			{
				timestamp: `${dayBeforeStr}T08:00:00.000+0000`,
				consumption: 96 + iterId,
				production: null,
				temperatureCorrection: 0,
				caloricValue: GAS_CALORIC_VALUE,
				isPeak: null,
				consumptionSource: "ACTUAL" as SourceEnum,
				productionSource: null,
			},
			{
				timestamp: `${date}T23:00:00.000+0000`,
				consumption: 30 + iterId,
				production: null,
				temperatureCorrection: 0,
				caloricValue: GAS_CALORIC_VALUE,
				isPeak: null,
				consumptionSource: "ACTUAL" as SourceEnum,
				productionSource: null,
			},
		];
	}

	withVolumes(iterId: number): this {
		const period = this.payload.message.data.usagePeriod;
		const date = period?.date ?? new Date().toISOString().split("T")[0];
		this.payload.message.data.volumes = {
			interval: {
				unit: "DM3",
				intervalDuration: "PT1H",
				values: this.buildGasVolumeValues(date, iterId),
			},
		};
		return this;
	}
}
