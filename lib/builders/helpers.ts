// Helper functions for generating meter payloads
// Provides convenient wrapper functions for common payload generation patterns

import { MeterBuilderFactory } from './factory/meter-builder-factory.ts';
import { MeterType } from './base/meter-payload-types.ts';
import type { MeterPayload } from './base/meter-payload-types.ts';

/**
 * Generates a complete meter payload with all standard fields
 * This is a convenience function that applies the most common builder pattern
 * 
 * @param vuId - Virtual User ID
 * @param iterId - Iteration ID
 * @param meterType - Type of meter (MeterType.ELECTRICITY | MeterType.GAS), defaults to MeterType.ELECTRICITY
 * @returns Complete meter payload ready for API submission
 */
export function generateMeterPayload(
  vuId: number,
  iterId: number,
  meterType: MeterType = MeterType.ELECTRICITY
): MeterPayload {
  return MeterBuilderFactory.create(meterType, vuId, iterId)
    .withConnectionMetadata(vuId, iterId)
    .withLabelAndCommodity()
    .withMandateCodes(vuId, iterId)
    .withUsagePeriod()
    .withDayReadings(iterId)
    .withIntervalReadings(iterId)
    .withVolumes(iterId)
    .build();
}
