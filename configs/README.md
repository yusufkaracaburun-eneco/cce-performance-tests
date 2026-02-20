# k6 Configuration Guide

This directory contains the k6 test configuration files. This README explains how thresholds, metrics, and stages work in this project.

## Table of Contents

- [Overview](#overview)
- [Thresholds](#thresholds)
  - [Quick Example](#quick-example)
  - [Syntax](#syntax)
  - [Thresholds in This Project](#thresholds-in-this-project)
- [Stages](#stages)
  - [How Stages Work](#how-stages-work)
  - [Example](#example)
  - [Stages Available in This Project](#stages-available-in-this-project)
  - [Using Stages](#using-stages)
  - [Duration Format](#duration-format)
  - [Advanced: Scenarios (Beyond Stages)](#advanced-scenarios-beyond-stages)
- [Configuration Files](#configuration-files)
  - [options.conf.ts](#optionsconfts)
  - [env.conf.ts](#envconfts)
- [Order of Precedence](#order-of-precedence)
- [Common Patterns](#common-patterns)
- [Quick Reference](#quick-reference)

---

## Overview

The main configuration file is `options.conf.ts`, which exports a `getOptions()` function that returns k6 options including:
- **Thresholds**: Pass/fail criteria for metrics
- **Stages**: Load patterns (ramp-up/ramp-down of virtual users)
- Other test options (user agent, connection reuse, etc.)

For detailed information about metrics and thresholds, see [`../docs/METRICS_AND_THRESHOLDS.md`](../docs/METRICS_AND_THRESHOLDS.md).

---

## Thresholds

**Thresholds** are pass/fail rules applied to metrics at the end of a test. If any threshold expression evaluates to false, the test fails (non-zero exit code).

### Quick Example

```ts
thresholds: {
  http_req_duration: ["p(95)<1000"],  // 95% of requests must complete in under 1 second
  http_req_failed: ["rate<0.01"],      // Fewer than 1% of requests may fail
}
```

### Syntax

```
<aggregation> <operator> <value>
```

- **Aggregation**: `avg`, `min`, `max`, `med`, `p(90)`, `p(95)`, `p(99)`, `rate`, `count`
- **Operator**: `<`, `>`, `<=`, `>=`, `==`
- **Value**: Number (milliseconds for durations) or rate (0–1, e.g. `0.01` = 1%)

### Thresholds in This Project

All thresholds are defined in `options.conf.ts`. See the [full list in `docs/METRICS_AND_THRESHOLDS.md`](../docs/METRICS_AND_THRESHOLDS.md#3-thresholds-used-in-this-project).

**Key thresholds:**
- `http_req_duration`: `p(90)<500`, `p(95)<1000`, `p(99)<2000`, `avg<800`
- `http_req_failed`: `rate<0.01` (<1% failures)
- `http_req_waiting`: `p(95)<500`, `avg<300` (TTFB)
- `checks`: `rate>0.95` (≥95% of checks must pass)

**References:**
- [k6 Thresholds documentation](https://grafana.com/docs/k6/latest/using-k6/thresholds/)
- [k6 Metrics reference](https://grafana.com/docs/k6/latest/using-k6/metrics/reference/)

---

## Stages

**Stages** define how the number of Virtual Users (VUs) changes over time during a test. They allow you to simulate realistic load patterns like gradual ramp-up, sustained load, and ramp-down.

### How Stages Work

A stage is an object with:
- `duration`: How long this stage lasts (e.g. `"30s"`, `"5m"`, `"1h"`)
- `target`: Target number of VUs to reach/maintain during this stage

k6 will **ramp** from the previous stage's target (or `startVUs` if it's the first stage) to the new `target` over the `duration`.

### Example

```ts
stages: [
  { duration: '2m', target: 10 },   // Ramp up to 10 VUs over 2 minutes
  { duration: '5m', target: 10 },    // Stay at 10 VUs for 5 minutes
  { duration: '2m', target: 50 },     // Ramp up to 50 VUs over 2 minutes
  { duration: '5m', target: 50 },    // Stay at 50 VUs for 5 minutes
  { duration: '2m', target: 0 },     // Ramp down to 0 VUs over 2 minutes
]
```

**Timeline:**
- **0:00–2:00**: Gradually increase from 0 to 10 VUs
- **2:00–7:00**: Maintain 10 VUs
- **7:00–9:00**: Gradually increase from 10 to 50 VUs
- **9:00–14:00**: Maintain 50 VUs
- **14:00–16:00**: Gradually decrease from 50 to 0 VUs

### Stages Available in This Project

Defined in `options.conf.ts`:

| Stage Name | Duration | Target VUs | Use Case |
|------------|----------|-----------|----------|
| **smoke** | 30s | 1 | Quick smoke test with minimal load |
| **loadLow** | 30s | 5 | Low load testing |
| **loadMed** | 60s | 10 | Medium load testing |
| **loadHigh** | 90s | 15 | High load testing |
| **stress** | 60s | 10 | Stress testing (can be extended) |

### Using Stages

#### Option 1: Via `getOptions()` (Recommended)

```ts
import { getOptions } from './configs/options.conf';

export const options = getOptions('loadMed');
// Returns options with stages: [{ duration: '60s', target: 10 }]
```

#### Option 2: Direct Configuration

```ts
import { getOptions } from './configs/options.conf';

export const options = {
  ...getOptions(),
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 20 },
    { duration: '1m', target: 0 },
  ],
};
```

#### Option 3: Using `stages` Shortcut (Simple Cases)

The `stages` option is a shortcut for a single scenario with a **ramping VUs executor**. When used together with the `vus` option, the `vus` value is used as `startVUs`.

```ts
export const options = {
  vus: 1,  // Start with 1 VU
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
};
```

### Duration Format

Duration strings support:
- Seconds: `"30s"`, `"120s"`
- Minutes: `"5m"`, `"10m"`
- Hours: `"1h"`, `"2h"`
- Combined: `"1m30s"`, `"2h15m"`

### Advanced: Scenarios (Beyond Stages)

For more complex execution patterns (multiple scenarios, different executors, per-scenario thresholds), use the `scenarios` option instead of `stages`. See [k6 Scenarios documentation](https://grafana.com/docs/k6/latest/using-k6/scenarios/).

**References:**
- [k6 Stages documentation](https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#stages)
- [k6 Scenarios documentation](https://grafana.com/docs/k6/latest/using-k6/scenarios/)
- [Ramping VUs executor](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ramping-vus/)

---

## Configuration Files

### `options.conf.ts`

Main configuration file that exports:
- `getOptions(stage?)`: Returns k6 options with thresholds and optionally a stage
- Types: `TOptions`, `TThresholds`, `TStage`, `TThresholdExpression`

**Usage:**

```ts
import { getOptions } from './configs/options.conf';

// Use default options (no stage)
export const options = getOptions();

// Use a predefined stage
export const options = getOptions('loadMed');

// Override or extend
export const options = {
  ...getOptions('loadHigh'),
  vus: 20,  // Override start VUs
};
```

### `env.conf.ts`

Environment-specific configuration (API endpoints, credentials, etc.). See that file for details.

---

## Order of Precedence

k6 options can be set in multiple places. If there are conflicts, k6 uses the value from the place with the **highest precedence**:

1. **Default values** (lowest precedence)
2. **Configuration file** (`--config` flag)
3. **Script `options` object** (what we use in `options.conf.ts`)
4. **Environment variables** (e.g. `K6_VUS=10`)
5. **CLI flags** (e.g. `--vus 10`) (highest precedence)

**Example:**

```bash
# CLI flag overrides script value
k6 run --vus 20 script.js  # Uses 20 VUs, not the value from options.conf.ts
```

**Reference:** [k6 Options: How to use options](https://grafana.com/docs/k6/latest/using-k6/k6-options/how-to/)

---

## Common Patterns

### Pattern 1: Quick Smoke Test

```ts
import { getOptions } from './configs/options.conf';

export const options = getOptions('smoke');
```

### Pattern 2: Custom Load Pattern

```ts
import { getOptions } from './configs/options.conf';

export const options = {
  ...getOptions(),  // Includes thresholds
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 20 },
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
};
```

### Pattern 3: Override Thresholds for Specific Test

```ts
import { getOptions } from './configs/options.conf';

export const options = {
  ...getOptions('loadMed'),
  thresholds: {
    ...getOptions().thresholds,
    http_req_duration: ['p(95)<2000'],  // More lenient for this test
  },
};
```

---

## Quick Reference

| Concept | Description | File |
|---------|-------------|------|
| **Thresholds** | Pass/fail rules for metrics | `options.conf.ts` |
| **Stages** | VU ramp-up/down patterns | `options.conf.ts` |
| **Metrics** | What k6 measures (duration, errors, etc.) | See `docs/METRICS_AND_THRESHOLDS.md` |
| **getOptions()** | Function to get configured options | `options.conf.ts` |

**Documentation:**
- [k6 Options Reference](https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/)
- [k6 Options: How to use options](https://grafana.com/docs/k6/latest/using-k6/k6-options/how-to/)
- [k6 Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/)
- [k6 Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/)
