# Performance test suite

k6 performance tests for ingestion APIs (meter today; contract, market-price, and others can be added). Each test is a **spec** that wires a **scenario** and load profile into a shared **test harness**.

## Table of Contents

- [How the structure works](#how-the-structure-works)
- [Available tests (domains)](#available-tests-domains)
- [How to add a new test domain (e.g. contract-ingestion)](#how-to-add-a-new-test-domain-eg-contract-ingestion)
  - [1. API client](#1-api-client-libapicontract-ingestion-clientts)
  - [2. Payload types and builders](#2-payload-types-and-builders-libbuilderscontract-or-similar)
  - [3. Scenario](#3-scenario-scenariosapiscontract-ingestionts)
  - [4. Spec](#4-spec-testscontract-ingestionspects)
  - [5. npm script](#5-npm-script-packagejson)
  - [6. Optional: domain-specific scenario options](#6-optional-domain-specific-scenario-options)
- [Running tests](#running-tests)
- [Config and env](#config-and-env)
- [Tags](#tags)

## How the structure works

```text
spec (*.spec.ts)  →  createTest({ testName, loadProfile, scenario })
       ↓
test harness (test-factory.ts)  →  getOptions(loadProfile), setup(), default(data) → scenario(baseUrl, options)
       ↓
scenario (e.g. scenarios/apis/meter-ingestion.ts)  →  create client, build payload, call runIngestionScenario(client, getPayload, options, tags)
       ↓
runIngestionScenario (shared)  →  client.publish(payload), k6 check() for 2xx/body/duration/JSON, optional errorHandler
```

- **Specs** (`tests/*.spec.ts`) only define *which* scenario runs and with which load. They call `createTest(config)` and re-export `options`, `setup`, `default`, `teardown` for k6.
- **Test harness** (`tests/lib/test-factory.ts`, `test-config.ts`) is domain-agnostic. It uses `TScenarioFunction = (baseUrl, options?: TScenarioOptions) => void` and passes `TScenarioOptions` (e.g. `errorHandler`, `tags`). No reference to meter, contract, or market-price.
- **Scenarios** (`scenarios/apis/*.ts`) are domain-specific. Each returns a function `(baseUrl, options?) => void` that creates a client, builds a payload, and calls the shared `runIngestionScenario(client, getPayload, options, defaultRequestTags)` in `scenarios/apis/shared/run-ingestion-scenario.ts`.
- **Clients** (`lib/api/*.ts`) extend `BaseAPIClient` and implement `publish(payload, tags)` so they satisfy `IIngestionClient<TPayload>` used by `runIngestionScenario`.

So: one harness, many domains. New domains add their own client, payload types/builders, and scenario; they reuse env, options, error handling, and the generic scenario runner.

## Available tests (domains)

| Domain              | Spec(s)                                                                 | Run command              |
|---------------------|-------------------------------------------------------------------------|--------------------------|
| Meter ingestion     | `meter-ingestion.spec.ts`, `*-meter-ingestion-example.spec.ts`         | `npm run test:meter` etc |
| Contract ingestion  | *(to be added)*                                                         | e.g. `npm run test:contract` |
| Market price        | *(to be added)*                                                         | e.g. `npm run test:market-price` |

## How to add a new test domain (e.g. contract-ingestion)

Follow the same pattern as meter ingestion.

### 1. API client (`lib/api/contract-ingestion-client.ts`)

- Extend `BaseAPIClient`.
- Implement `publish(payload: ContractPayload, tags?: Record<string, string>): TPublishResult` (same shape as `MeterIngestionClient`).
- Use your endpoint (e.g. `${this.baseUrl}/Contract/Publish`) and wire format.

### 2. Payload types and builders (`lib/builders/contract/` or similar)

- Define `ContractPayload` (and any wire DTO if different).
- Provide a way to build a payload (e.g. `generateContractPayload()` or a builder).

### 3. Scenario (`scenarios/apis/contract-ingestion.ts`)

- Create a function that matches `TScenarioFunction`: `(baseUrl: string, options?: TScenarioOptions) => void`.
- Inside: instantiate `ContractIngestionClient(baseUrl)`, build payload (e.g. `generateContractPayload()`), then call:
  - `runIngestionScenario(client, () => payload, options, defaultRequestTags)`  
  with `defaultRequestTags` e.g. `{ name: "contract_ingestion", endpoint: "publish" }`.
- Export the scenario (e.g. `contractIngestionScenario`).

If the contract API follows the same “POST JSON, expect 2xx + body” pattern, no need to duplicate checks or error handling; `runIngestionScenario` already does that.

### 4. Spec (`tests/contract-ingestion.spec.ts`)

```ts
import { contractIngestionScenario } from "../scenarios/apis/contract-ingestion.ts";
import { createTest } from "./lib/test-factory.ts";

const test = createTest({
  testName: "contract_ingestion",
  loadProfile: "loadHigh",
  scenario: contractIngestionScenario,
  description: "Contract ingestion test.",
});

export const options = test.options;
export const setup = test.setup;
export default test.default;
export const teardown = test.teardown;
```

### 5. npm script (`package.json`)

Add e.g. `"test:contract": "k6 run tests/contract-ingestion.spec.ts"`.

### 6. Optional: domain-specific scenario options

If your scenario needs extra options (like meter’s `meterType`), define e.g. `IContractIngestionScenarioOptions extends IScenarioOptions` and `TContractIngestionScenarioOptions = IContractIngestionScenarioOptions` in `scenarios/apis/shared/types.ts` (same pattern as `IMeterIngestionScenarioOptions` / `TMeterIngestionScenarioOptions`) and use it in your scenario signature. The test harness still passes `TScenarioOptions`; your scenario can cast or extend as needed.

## Running tests

- **All:** `npm test` or `k6 run tests/*.spec.ts`
- **Meter only:** `npm run test:meter`
- **Single iteration (one payload):** `npm run test:meter:1` or `k6 run --vus 1 --iterations 1 tests/meter-ingestion.spec.ts`
- **Load profile:** Set `loadProfile` in the spec (`smoke`, `stress`, `loadLow`, `loadMed`, `loadHigh`); see `configs/options.conf.ts`.

## Config and env

- **Load profiles:** `configs/options.conf.ts` — stages and thresholds.
- **Base URL:** `configs/env.conf.ts` — `BASE_URL` / `ENVIRONMENT`.
- **Env vars:** `BASE_URL`, `VIRTUAL_USERS`, `DURATION`; see root README and `.env.example`.

## Tags

Tests and scenarios attach tags (e.g. `test_name`, `scenario`, `endpoint`, `meter_type`) for filtering in Grafana or k6 output. Use `defaultRequestTags` in your scenario so your domain’s tags are consistent.
