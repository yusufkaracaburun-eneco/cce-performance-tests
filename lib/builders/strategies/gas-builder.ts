// Gas meter builder - Strategy Pattern implementation
// Handles gas-specific payload generation (m3 units, volumes with temperature correction)

import { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import type {
	ProfileCategoryCode,
	Readings,
	SourceEnum,
	Volumes,
} from "../base/meter-payload-types.ts";

export class GasMeterBuilder extends BaseMeterBuilder {
	getCommodityEnum(): "G" {
		return "G"; // Gas commodity enum
	}

	getUnit(): string {
		return "m3"; // Gas unit
	}

	getDefaultProfileCategoryCode(): ProfileCategoryCode {
		return "G1A"; // Default gas profile category
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
					consumption: 10 + iterId * 0.5, // Gas consumption typically lower than electricity
					production: 0,
					consumptionSource: "ACTUAL" as SourceEnum,
					productionSource: "ACTUAL" as SourceEnum,
				},
			],
		};
		return this;
	}

	withVolumes(iterId: number): this {
		// Gas meters require volumes with temperature correction and caloric value
		this.payload.message.data.volumes = {
			interval: {
				unit: "m3",
				values: [
					{
						timestamp: this.timestamp,
						consumption: 10 + iterId * 0.5,
						production: 0,
						temperatureCorrection: 1.0,
						caloricValue: 35.17, // Typical caloric value for natural gas (MJ/m3)
						isPeak: false, // Required field
						consumptionSource: "ACTUAL" as SourceEnum,
						productionSource: "ACTUAL" as SourceEnum,
					},
				],
			},
		};
		return this;
	}
}
