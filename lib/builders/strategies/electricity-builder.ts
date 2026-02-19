// Electricity meter builder - Strategy Pattern implementation
// Produces payloads matching ProcessedP4UsagesDayAlignedEvent_elec_example (kWh day readings, Wh interval/volume)

import { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import type {
	IntervalReadingValue,
	ProfileCategoryCode,
	SourceEnum,
	VolumeValue,
} from "../base/meter-payload-types.ts";

const ELEC_DAY_OFFSET = 6_395_000;
const ELEC_DAY_OFFSET_2 = 5_610_000;

export class ElectricityMeterBuilder extends BaseMeterBuilder {
	getCommodityEnum(): "E" {
		return "E";
	}

	getUnit(): string {
		return "kWh";
	}

	getDefaultProfileCategoryCode(): ProfileCategoryCode {
		return "E1B"; // Match example; dual-tariff typical
	}

	/** Build interval/volume values for the usage day (15-min slots, Wh). */
	private buildIntervalValues(iterId: number): IntervalReadingValue[] {
		const period = this.payload.message.data.usagePeriod;
		const date = period?.date ?? new Date().toISOString().split("T")[0];
		const tz = period?.timezone ?? "Europe/Amsterdam";
		const offset = tz === "Europe/Amsterdam" ? "+0100" : "+0000";
		const baseConsumptions = [27, 35, 14, 20];
		return [
			{ time: "00:00", consumption: baseConsumptions[0] },
			{ time: "00:15", consumption: baseConsumptions[1] },
			{ time: "23:30", consumption: baseConsumptions[2] },
			{ time: "23:45", consumption: baseConsumptions[3] },
		].map(({ time, consumption }, i) => ({
			timestamp: `${date}T${time}:00.000${offset}`,
			consumption: consumption + iterId + i,
			production: 0,
			consumptionSource: "ACTUAL" as SourceEnum,
			productionSource: "ACTUAL" as SourceEnum,
			isPeak: false,
			temperatureCorrection: null,
			caloricValue: null,
		}));
	}

	withDayReadings(iterId: number): this {
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}
		this.payload.message.data.readings.day = {
			unit: "kWh",
			intervalDuration: "P1D",
			values: [
				{
					start: ELEC_DAY_OFFSET + iterId * 100,
					end: ELEC_DAY_OFFSET + 2000 + iterId * 100,
					startSource: "CORRECTED" as SourceEnum,
					endSource: "ACTUAL" as SourceEnum,
					isPeak: true,
					injection: false,
				},
				{
					start: ELEC_DAY_OFFSET_2 + iterId * 10,
					end: ELEC_DAY_OFFSET_2 + 1000 + iterId * 10,
					startSource: "CORRECTED" as SourceEnum,
					endSource: "ACTUAL" as SourceEnum,
					temperatureCorrection: null,
					caloricValue: null,
					isPeak: false,
					injection: false,
				},
			],
		};
		return this;
	}

	withIntervalReadings(iterId: number): this {
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}
		this.payload.message.data.readings.interval = {
			unit: "Wh",
			intervalDuration: "PT15M",
			values: this.buildIntervalValues(iterId),
		};
		return this;
	}

	withVolumes(iterId: number): this {
		const values: VolumeValue[] = this.buildIntervalValues(iterId).map(
			(v) => ({
				timestamp: v.timestamp ?? undefined,
				consumption: v.consumption ?? 0,
				production: v.production ?? 0,
				temperatureCorrection: null,
				caloricValue: null,
				isPeak: false,
				consumptionSource: v.consumptionSource ?? "ACTUAL",
				productionSource: v.productionSource ?? "ACTUAL",
			}),
		);
		this.payload.message.data.volumes = {
			interval: {
				unit: "Wh",
				intervalDuration: "PT15M",
				values,
			},
		};
		return this;
	}
}
