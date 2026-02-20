import type { BaseMeterBuilder } from "../base/base-meter-builder.ts";
import { EMeterType } from "../base/meter-payload-types.ts";
import { ElectricityMeterBuilder } from "../strategies/electricity-builder.ts";
import { GasMeterBuilder } from "../strategies/gas-builder.ts";

type BuilderConstructor = new (
	vuId: number,
	iterId: number,
) => BaseMeterBuilder;

const registry = new Map<EMeterType, BuilderConstructor>();

function register(type: EMeterType, Builder: BuilderConstructor): void {
	registry.set(type, Builder);
}

register(EMeterType.ELECTRICITY, ElectricityMeterBuilder);
register(EMeterType.GAS, GasMeterBuilder);

export class MeterBuilderFactory {
	static register(type: EMeterType, Builder: BuilderConstructor): void {
		register(type, Builder);
	}

	static create(
		meterType: EMeterType,
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
