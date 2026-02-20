# CCE Performance Tests

k6 performance tests for meter ingestion APIs (electricity and gas). Tests publish meter payloads to a configurable base URL and assert status, body, and response time. Built with k6, TypeScript, and Biome; supports optional Dynatrace output and k6 web dashboard.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running tests](#running-tests)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Dynatrace integration](#dynatrace-integration)
  - [How it works](#how-it-works)
  - [Metrics sent to Dynatrace](#metrics-sent-to-dynatrace)
  - [How to interpret in Dynatrace](#how-to-interpret-in-dynatrace)
  - [Configuration options](#configuration-options)
  - [References](#references)
- [CI/CD and Docker](#cicd-and-docker)
- [Scripts](#scripts)
- [Test tags](#test-tags)
- [License](#license)

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

## Dynatrace integration

Performance test metrics can be streamed to [Dynatrace](https://www.dynatrace.com/) so you can visualize load test results and correlate them with application and infrastructure metrics in one place.

### How it works

- The project uses the [xk6-output-dynatrace](https://github.com/Dynatrace/xk6-output-dynatrace) extension. You need a **custom k6 binary** built with this extension (CI and Docker do this automatically; for local runs, build with `xk6 build --with github.com/Dynatrace/xk6-output-dynatrace`).
- When you run tests with `-o output-dynatrace` (e.g. `npm run test:dynatrace`), k6 sends metrics to the Dynatrace Metrics API v2 at a configurable interval (default: every 1 second).
- **Required:** Set `K6_DYNATRACE_URL` (e.g. `https://<environment>.live.dynatrace.com`) and `K6_DYNATRACE_APITOKEN`. The API token must have the **metrics.ingest** scope (API v2). See [.env.example](.env.example).

### Metrics sent to Dynatrace

The extension streams k6’s **built-in metrics** (dozens of time series). These align with the metrics used for [thresholds](configs/README.md#thresholds) in this project:

| Category | Examples | Description |
|----------|----------|-------------|
| **HTTP timing** | `http_req_duration`, `http_req_waiting`, `http_req_connecting`, `http_req_blocked`, `http_req_sending`, `http_req_receiving`, `http_req_tls_handshaking` | Request phases and total duration (ms). |
| **HTTP result** | `http_req_failed` | Rate of failed requests (4xx/5xx, network errors). |
| **Throughput** | `http_reqs` | Request count; useful for requests per second. |
| **Iterations** | `iteration_duration` | Time per full script iteration. |
| **Assertions** | `checks` | Rate of successful `check()` assertions. |
| **Execution** | `vus`, `vus_max`, `iterations`, `data_received`, `data_sent` | VU count, iteration count, bytes. |

Metrics are sampled at ~50 ms and flushed to Dynatrace every 1 s by default (configurable via `K6_DYNATRACE_FLUSH_PERIOD`). For a full list of built-in metrics and how they map to thresholds, see [configs/README.md](configs/README.md).

### How to interpret in Dynatrace

1. **Find k6 metrics** — In Dynatrace, open **Metrics** (or **Data Explorer**) and filter by metric names containing `k6` or by the prefix used by the extension (e.g. `k6.*`). You should see the same metric names as in the table above.
2. **Key metrics to watch:**
   - **`http_req_duration`** — Response time (avg, percentiles). Compare with your [thresholds](configs/options.conf.ts) (e.g. p95 &lt; 1000 ms).
   - **`http_req_failed`** — Failure rate; should stay low (e.g. &lt; 1%).
   - **`http_req_waiting`** — Time to first byte (TTFB); indicates server responsiveness.
   - **`checks`** — Assertion pass rate; should be high (e.g. &gt; 95%).
   - **`http_reqs`** — Throughput (requests over time).
3. **Correlation** — Place k6 metrics on the same dashboard as Dynatrace application metrics (e.g. request latency, error rate, CPU/memory of the service under test) to see how load tests affect the system and to validate SLOs.
4. **Trends and alerts** — Use Dynatrace dashboards and alerting on these metrics to track regressions or to trigger when load-test results exceed acceptable bounds (aligned with your k6 thresholds).

### Configuration options

| Option | Description | Default |
|--------|-------------|---------|
| `K6_DYNATRACE_URL` | Dynatrace environment URL | — |
| `K6_DYNATRACE_APITOKEN` | API token with `metrics.ingest` (API v2) | — |
| `K6_DYNATRACE_FLUSH_PERIOD` | How often metrics are sent (e.g. `1s`, `5s`) | `1s` |
| `K6_DYNATRACE_INSECURE_SKIP_TLS_VERIFY` | Skip TLS verification | `true` |
| `K6_DYNATRACE_HEADER_<Key>` | Extra HTTP header (e.g. `K6_DYNATRACE_HEADER_X_Test_Header=value`) | — |

See [.env.example](.env.example) and [Grafana k6 – Dynatrace](https://grafana.com/docs/k6/latest/results-output/real-time/dynatrace/).

### References

- [Grafana k6: Dynatrace output](https://grafana.com/docs/k6/latest/results-output/real-time/dynatrace/)
- [Dynatrace xk6-output-dynatrace](https://github.com/Dynatrace/xk6-output-dynatrace)
- [Dynatrace Hub: Grafana k6](https://www.dynatrace.com/hub/detail/grafana-k6/) (dashboard and integration details)

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
