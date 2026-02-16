// Factory Pattern implementation for creating meter builders
// Centralizes builder creation logic for easy extension

import type { MeterType } from '../base/meter-payload-types.ts';
import { BaseMeterBuilder } from '../base/base-meter-builder.ts';
import { ElectricityMeterBuilder } from '../strategies/electricity-builder.ts';
import { GasMeterBuilder } from '../strategies/gas-builder.ts';

export class MeterBuilderFactory {
  /**
   * Creates an appropriate meter builder based on meter type
   * @param meterType - Type of meter ('electricity' | 'gas')
   * @param vuId - Virtual User ID
   * @param iterId - Iteration ID
   * @returns Builder instance for the specified meter type
   */
  static create(meterType: MeterType, vuId: number, iterId: number): BaseMeterBuilder {
    switch (meterType) {
      case 'electricity':
        return new ElectricityMeterBuilder(vuId, iterId);
      case 'gas':
        return new GasMeterBuilder(vuId, iterId);
      default:
        throw new Error(`Unsupported meter type: ${meterType}`);
    }
  }
}
