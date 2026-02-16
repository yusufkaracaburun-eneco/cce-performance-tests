// TypeScript interfaces and types for meter payloads
// Based on ProcessedP4UsagesDayAlignedEvent_v1 Avro schema

export enum MeterType {
  ELECTRICITY = 'electricity',
  GAS = 'gas',
}

// Enums from the schema
export type ProfileCategoryCode = 
  | 'E1A' | 'E1B' | 'E2A' | 'E2B' | 'E3A' | 'E3B' | 'E4A' | 'E4B'
  | 'G1A' | 'G2A' | 'G2B' | 'G2C' | 'GXX' | 'GGV';

export type DeterminedEnergyConsumption = 'AMI' | 'AZI';

export type EnecoLabel = 'eneco' | 'oxxio' | 'woonenergie' | 'UNDEFINED' | 'enecobusiness';

export type CommodityEnum = 'E' | 'G';

export type SourceEnum = 'ACTUAL' | 'ESTIMATED' | 'CORRECTED' | 'MANUAL' | 'UNDEFINED';

export interface ConnectionMetadata {
  connectionPointEAN?: string | null;
  countryCode?: string | null;
  gridOperatorEAN?: string | null;
  supplierEAN?: string | null;
  profileCategoryCode?: ProfileCategoryCode | null;
  determinedEnergyConsumption?: DeterminedEnergyConsumption | null;
}

export interface UsagePeriod {
  date?: string | null;
  timezone?: string | null;
  period?: string | null;
  interval?: string | null;
}

export interface DayReadingValue {
  start?: number | null;
  end?: number | null;
  startSource?: SourceEnum | null;
  endSource?: SourceEnum | null;
  isPeak?: boolean | null;
  injection?: boolean | null;
}

export interface DayReadings {
  unit?: string | null;
  values?: DayReadingValue[] | null;
}

export interface IntervalReadingValue {
  timestamp?: string | null;
  consumption?: number | null;
  production?: number | null;
  consumptionSource?: SourceEnum | null;
  productionSource?: SourceEnum | null;
}

export interface IntervalReadings {
  unit?: string | null;
  values?: IntervalReadingValue[] | null;
}

export interface Readings {
  day?: DayReadings | null;
  interval?: IntervalReadings | null;
}

export interface VolumeValue {
  timestamp?: string | null;
  consumption?: number | null;
  production?: number | null;
  temperatureCorrection?: number | null;
  caloricValue?: number | null;
  isPeak: boolean; // Required, default: false
  consumptionSource?: SourceEnum | null;
  productionSource?: SourceEnum | null;
}

export interface Volumes {
  interval: {
    unit: string; // Required
    values?: VolumeValue[] | null;
  };
}

export interface MeterData {
  connectionMetadata?: ConnectionMetadata | null;
  label: EnecoLabel; // Required, default: "UNDEFINED"
  commodity?: CommodityEnum | null;
  mandateCodes?: string[] | null;
  usagePeriod?: UsagePeriod | null;
  readings?: Readings | null;
  volumes?: Volumes | null;
  updatedAt: string; // Required
}

export interface MeterMessage {
  eventInstanceId: string; // Required
  eventName: string; // Required, default: "ProcessedP4UsagesDayAligned"
  eventTime: string; // Required, RFC 3339 format
  eventSource: string; // Required, default: "MTR"
  eventSubject?: string | null;
  eventReason?: string | null;
  containsPrivacyData?: boolean | null;
  data: MeterData; // Required
}

export interface MeterPayload {
  key: string; // Added by API wrapper, not in schema
  message: MeterMessage;
}

export interface BuilderOptions {
  vuId: number;
  iterId: number;
}
