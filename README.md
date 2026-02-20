# CCE Performance Tests

k6 performance tests for meter ingestion APIs (electricity and gas). Tests publish meter payloads to a configurable base URL and assert status, body, and response time. Built with k6, TypeScript, and Biome; supports optional Dynatrace output and k6 web dashboard.

## Prerequisites

- **Node.js** — Use the version in [.nvmrc](.nvmrc) (24).
- **k6** — Required to run tests. For local runs, the standard k6 binary is enough. For Dynatrace integration, use an xk6 build with the Dynatrace extension (as in CI and Docker).

## Setup

1. Copy [.env.example](.env.example) to `.env`.
2. Set `ENVIRONMENT` to one of `dev`, `test`, `acc`, or `prod` (selects base URL from [configs/env.conf.ts](configs/env.conf.ts)). You can override `BASE_URL` per environment in that file.
3. Optionally set `VIRTUAL_USERS`, `DURATION`, Dynatrace vars (`K6_DYNATRACE_URL`, `K6_DYNATRACE_APITOKEN`), and dashboard-related vars (see .env.example).
4. Install dependencies:

```bash
npm install
```

No global k6 install is required if you use Docker or CI to run tests.

## Running tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (`k6 run tests/*.spec.ts`) |
| `npm run test:meter` | Generic meter ingestion |
| `npm run test:electricity-example` | Electricity example payload (schema/API validation) |
| `npm run test:gas-example` | Gas example payload (schema/API validation) |
| `npm run test:meter:1` | Single iteration (smoke) |
| `npm run test:dashboard` | Run with k6 web dashboard and HTML export |
| `npm run test:dynatrace` | Run with Dynatrace output (requires Dynatrace env vars) |

Load profile (smoke, stress, loadLow, loadMed, loadHigh) is set per spec via `loadProfile` in `createTest`. When no stage is used, `VIRTUAL_USERS` and `DURATION` override the defaults (see [configs/options.conf.ts](configs/options.conf.ts)).

For the full list of tests, tags, and custom run options (e.g. `VIRTUAL_USERS=10 DURATION=60s`), see [tests/README.md](tests/README.md).

## Project structure

- **configs/** — [env.conf.ts](configs/env.conf.ts) (per-environment `BASE_URL`), [options.conf.ts](configs/options.conf.ts) (VUs, duration, stages, thresholds).
- **lib/** — API client ([meter-ingestion-client.ts](lib/api/meter-ingestion-client.ts), calls `/Publish`), meter payload builders (electricity/gas strategies, factory in [meter-builder-factory.ts](lib/builders/factory/meter-builder-factory.ts)), error handler.
- **scenarios/apis/** — Shared [runIngestionScenario](scenarios/apis/shared/run-ingestion-scenario.ts) (generic publish + checks). [meter-ingestion.ts](scenarios/apis/meter-ingestion.ts) defines meter ingestion scenarios (generic, electricity example, gas example). Contract and market-price ingestion will follow the same pattern.
- **tests/** — k6 spec files (`*.spec.ts`) using [test-factory.ts](tests/lib/test-factory.ts) and [test-config.ts](tests/lib/test-config.ts); each spec wires a scenario and load profile.

## Configuration

- **Environments** — dev, test, acc, prod are defined in [configs/env.conf.ts](configs/env.conf.ts). The active one is chosen by the `ENVIRONMENT` variable; each has a `BASE_URL`.
- **Load profiles** — In [configs/options.conf.ts](configs/options.conf.ts): smoke (1 VU, 30s), stress (10 VU, 60s), loadLow, loadMed, loadHigh. Thresholds include e.g. p90 &lt; 500ms, failure rate &lt; 1%, checks &gt; 95%.

## CI/CD and Docker

- **GitHub Actions** — [.github/workflows/performance-tests.yaml](.github/workflows/performance-tests.yaml) runs on push, pull_request, and `workflow_dispatch`. It uses xk6 with the Dynatrace extension, uploads the HTML report, and can send Slack notifications. Required secrets: `K6_DYNATRACE_URL`, `K6_DYNATRACE_APITOKEN`; optional: `SLACK_WEBHOOK_URL`.
- **Docker** — [Dockerfile](Dockerfile) uses Node 24, installs Go and builds k6 with the Dynatrace extension, and runs `npm run test` by default. Mount `.env` or pass env vars for configuration.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run format` | Biome format |
| `npm run lint` | Biome lint (with write) |
| `npm run check` | Biome check (format + lint, with write) |
| `npm run prepare` | Husky git hooks (runs automatically after install) |

Test scripts are listed in [Running tests](#running-tests).

## Test tags

Tests use tags such as `test_name`, `scenario`, `endpoint`, and `meter_type` for filtering in Grafana or other monitoring tools. Details are in [tests/README.md](tests/README.md).

## License

ISC
