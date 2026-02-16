// Electricity meter builder - Strategy Pattern implementation
// Handles electricity-specific payload generation (kWh units)

import { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import type {
	ProfileCategoryCode,
	Readings,
	SourceEnum,
} from "../base/meter-payload-types.ts";

export class ElectricityMeterBuilder extends BaseMeterBuilder {
	getCommodityEnum(): "E" {
		return "E"; // Electricity commodity enum
	}

	getUnit(): string {
		return "kWh"; // Electricity unit
	}

	getDefaultProfileCategoryCode(): ProfileCategoryCode {
		return "E1A"; // Default electricity profile category
	}

	withDayReadings(iterId: number): this {
		// Initialize readings if not exists
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}

		this.payload.message.data.readings.day = {
			unit: this.getUnit(),
			values: [
				{
					start: 0,
					end: 1000 + iterId * 10,
					startSource: "ACTUAL" as SourceEnum,
					endSource: "ACTUAL" as SourceEnum,
					isPeak: false,
					injection: false,
				},
			],
		};
		return this;
	}

	withIntervalReadings(iterId: number): this {
		// Initialize readings if not exists
		if (!this.payload.message.data.readings) {
			this.payload.message.data.readings = {};
		}

		this.payload.message.data.readings.interval = {
			unit: this.getUnit(),
			values: [
				{
					timestamp: this.timestamp,
					consumption: 50 + iterId * 5,
					production: 0,
					consumptionSource: "ACTUAL" as SourceEnum,
					productionSource: "ACTUAL" as SourceEnum,
				},
			],
		};
		return this;
	}

	withVolumes(iterId: number): this {
		// Electricity meters typically don't have volumes
		// This method is implemented for API consistency but volumes are optional
		// If volumes are needed for electricity, they can be added here
		return this;
	}
}
