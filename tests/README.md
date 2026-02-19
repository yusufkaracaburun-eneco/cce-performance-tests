# Performance Test Suite

This directory contains k6 performance tests for meter ingestion scenarios.

## Available Tests

### 1. Generic Meter Ingestion (`meter-ingestion.spec.ts`)
- **Scenario**: `meterIngestionScenario`
- **Payload**: Uses `generateMeterPayload` with configurable meter type
- **Use case**: General purpose test that can test both electricity and gas meters
- **Run**: `npm run test:meter` or `k6 run tests/meter-ingestion.spec.ts`

### 2. Electricity Meter Ingestion (`electricity-meter-ingestion.spec.ts`)
- **Scenario**: `electricityMeterIngestionScenario`
- **Payload**: Uses `generateElectricityPayload` (E1B, AZI, dual-tariff, Wh intervals)
- **Use case**: Dedicated electricity meter testing with realistic payloads
- **Run**: `npm run test:electricity` or `k6 run tests/electricity-meter-ingestion.spec.ts`

### 3. Gas Meter Ingestion (`gas-meter-ingestion.spec.ts`)
- **Scenario**: `gasMeterIngestionScenario`
- **Payload**: Uses `generateGasPayload` (G1A, MTQ/DM3, PT1H, temperature/caloric)
- **Use case**: Dedicated gas meter testing with realistic payloads
- **Run**: `npm run test:gas` or `k6 run tests/gas-meter-ingestion.spec.ts`

### 4. Electricity Example Payload (`electricity-meter-ingestion-example.spec.ts`)
- **Scenario**: `electricityMeterIngestionExampleScenario`
- **Payload**: Uses `generateElectricityExamplePayload` (exact match to example JSON)
- **Use case**: Schema validation and API behavior testing with known-good data
- **Run**: `npm run test:electricity-example` or `k6 run tests/electricity-meter-ingestion-example.spec.ts`

### 5. Gas Example Payload (`gas-meter-ingestion-example.spec.ts`)
- **Scenario**: `gasMeterIngestionExampleScenario`
- **Payload**: Uses `generateGasExamplePayload` (exact match to example JSON)
- **Use case**: Schema validation and API behavior testing with known-good data
- **Run**: `npm run test:gas-example` or `k6 run tests/gas-meter-ingestion-example.spec.ts`

## Running Tests

### Run All Tests
```bash
npm test
# or
k6 run tests/*.spec.ts
```

### Run Individual Tests
```bash
# Generic meter ingestion
npm run test:meter

# Electricity meter ingestion
npm run test:electricity

# Gas meter ingestion
npm run test:gas

# Electricity example payload
npm run test:electricity-example

# Gas example payload
npm run test:gas-example
```

### Run with Custom Options
```bash
# Override virtual users and duration
VIRTUAL_USERS=10 DURATION=60s k6 run tests/electricity-meter-ingestion.spec.ts

# Run with specific stage (smoke, stress, loadLow, loadMed, loadHigh)
# Edit the test file to change: getOptions("smoke")
```

### Run with Dashboard
```bash
npm run test:dashboard
```

### Run with Dynatrace Output
```bash
npm run test:dynatrace
```

## Test Configuration

Each test file can be configured with different load profiles by changing the `getOptions()` call:

- `getOptions("smoke")` - Light load: 1 VU for 30s
- `getOptions("stress")` - Stress test: 10 VU for 60s
- `getOptions("loadLow")` - Low load: 5 VU for 30s
- `getOptions("loadMed")` - Medium load: 10 VU for 60s
- `getOptions("loadHigh")` - High load: 15 VU for 90s
- `getOptions()` - Default: Uses VIRTUAL_USERS env var or 1 VU, DURATION env var or 30s

## Environment Variables

Set these in `.env` or export before running:

- `BASE_URL` - API base URL (required)
- `VIRTUAL_USERS` - Number of virtual users (default: 1)
- `DURATION` - Test duration (default: 30s)

## Test Tags

All tests use tags for filtering metrics:
- `test_name` - Test identifier (e.g., "electricity_meter_ingestion")
- `scenario` - Scenario name
- `endpoint` - API endpoint (e.g., "publish")
- `meter_type` - Meter type ("electricity" or "gas")

Use these tags in Grafana or other monitoring tools to filter and analyze results.
