import type { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import { MeterType } from "../base/meter-payload-types.ts";
import { ElectricityMeterBuilder } from "../strategies/electricity-builder.ts";
import { GasMeterBuilder } from "../strategies/gas-builder.ts";

type BuilderConstructor = new (
	vuId: number,
	iterId: number,
) => BaseMeterBuilder;

const registry = new Map<MeterType, BuilderConstructor>();

function register(type: MeterType, Builder: BuilderConstructor): void {
	registry.set(type, Builder);
}

register(MeterType.ELECTRICITY, ElectricityMeterBuilder);
register(MeterType.GAS, GasMeterBuilder);

export class MeterBuilderFactory {
	static register(type: MeterType, Builder: BuilderConstructor): void {
		register(type, Builder);
	}

	static create(
		meterType: MeterType,
		vuId: number,
		iterId: number,
	): BaseMeterBuilder {
		const Builder = registry.get(meterType);
		if (!Builder) {
			throw new Error(`Unsupported meter type: ${meterType}`);
		}
		return new Builder(vuId, iterId);
	}
}
