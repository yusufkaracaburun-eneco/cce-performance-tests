# CCE Performance Tests

Performance testing suite using k6 and TypeScript.

## Prerequisites

- k6 installed (available in devcontainer with Dynatrace extension)
- Node.js and npm
- Go (automatically installed by devcontainer for building custom k6 binaries)

## DevContainer Setup

This project uses a devcontainer with k6 pre-installed with the Dynatrace output extension.

### First Time Setup

1. Open the project in VS Code
2. When prompted, click "Reopen in Container"
3. Wait for the container to build (this may take a few minutes)
   - The k6 binary with Dynatrace extension will be automatically built during container build

### Troubleshooting

If you encounter the error: `unable to find user node: no matching entries in passwd file`:

1. **Rebuild the container:**
   - Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
   - Run: `Dev Containers: Rebuild Container Without Cache`

See [.devcontainer/REBUILD.md](.devcontainer/REBUILD.md) for detailed instructions.

## Setup

Install dependencies:

```bash
npm install
```

## Running Tests

This project follows [Grafana k6 best practices](https://grafana.com/blog/organizing-your-grafana-k6-performance-testing-suite-best-practices-to-get-started/) for organizing performance testing suites:

- **Modularized configurations** - Separate workload and threshold configurations
- **Reusable scenarios** - Test logic extracted into reusable scenario modules
- **API client pattern** - Encapsulated HTTP interactions via API client classes
- **Error handling wrapper** - Structured error reporting with ErrorHandler

### Environment-Specific Options

This project supports environment-specific k6 options for different environments: **dev**, **test**, **acc** (acceptance), and **prd** (production). Each environment has predefined configurations for VUs, duration, stages, and thresholds.

#### Default Environment Configurations

| Environment | VUs | Duration/Stages | Thresholds | Base URL | Use Case |
|------------|-----|-----------------|------------|----------|----------|
| **dev** | 1 | 10s | Lenient (p95 < 1000ms) | `http://localhost:5197` | Quick local testing |
| **test** | 5-10 | Gradual ramp-up (1m) | Moderate (p95 < 500ms) | `https://test.example.com` | Integration testing |
| **acc** | 20-50 | Realistic load (3.5m) | Stricter (p95 < 300ms) | `https://acc.example.com` | Acceptance testing |
| **prd** | 100-200 | Production-like (17m) | Strict (p95 < 200ms) | `https://api.example.com` | Production load testing |

**Note:** Base URLs can be overridden using the `BASE_URL` environment variable. The configuration also includes environment-specific settings like HTTP timeouts, max redirects, and user agent strings.

#### Running Tests with Different Environments

**Using npm scripts (recommended):**

```bash
# Development (default)
npm run test:smoke
npm run test:smoke:dev

# Testing environment
npm run test:smoke:test

# Acceptance environment
npm run test:smoke:acc

# Production environment
npm run test:smoke:prd
```

**Using environment variable:**

```bash
# Set environment variable
K6_ENV=prd k6 run tests/smoke.spec.ts

# Or use ENV variable
ENV=test k6 run tests/smoke.spec.ts
```

**Using CLI flag:**

```bash
k6 run --env ENV=acc tests/smoke.spec.ts
```

### Workload Configurations

Workload configurations define different load patterns (VU stages) that can be applied to any environment. Not all workloads are available for all environments.

**Available Workloads:**
- **smoke**: Minimal load (1 VU, 10s) - Available for all environments
- **averageLow**: Low average load - Available for test, acc, prd
- **averageMed**: Medium average load - Available for test, acc, prd
- **averageHigh**: High average load - Available for acc, prd
- **stress**: Stress testing load - Available for test, acc, prd
- **peak**: Peak load testing - Available for prd only

**Running Tests with Workloads:**

```bash
# Using npm scripts
npm run test:meter-ingestion:test:averageMed
npm run test:meter-ingestion:prd:stress

# Using environment variables
WORKLOAD=stress k6 run --env ENV=prd tests/meter-ingestion.spec.ts

# Using CLI flags
k6 run --env ENV=acc --env WORKLOAD=averageHigh tests/meter-ingestion.spec.ts
```

**Workload Selection Logic:**
- Workloads are environment-specific (e.g., `peak` only available in production)
- If a workload is not available for an environment, falls back to `smoke`
- Workload stages override environment default stages
- Thresholds are adjusted based on workload (stress/peak allow higher error rates)

#### Environment-Specific Configuration Values

The configuration system provides environment-specific values beyond k6 options:

- **BASE_URL**: Base URL for API endpoints (defaults per environment, can be overridden via `BASE_URL` env var)
- **httpTimeout**: HTTP request timeout (30s for dev/test, 60s for acc/prd)
- **maxRedirects**: Maximum HTTP redirects to follow (5 for dev/test, 10 for acc/prd)
- **userAgent**: User agent string for requests (includes environment name)

**Using environment values in tests:**

```typescript
import { getEnvironmentValues, getBaseUrl } from '../config/options';

// In setup() function
export function setup() {
  // Get all environment values
  const envValues = getEnvironmentValues();
  console.log(`Testing against ${envValues.baseUrl} in ${envValues.environment}`);
  return envValues;
}

// Or get just the base URL
const baseUrl = getBaseUrl(); // Uses current environment
const testBaseUrl = getBaseUrl('test'); // Specific environment
```

#### Customizing Environment Options

To customize options for a specific environment, edit `config/options.ts`:

```typescript
// Customize k6 options (VUs, duration, thresholds)
function createDevConfig(): EnvironmentOptions {
  return {
    vus: 1,
    duration: '10s',
    thresholds: createThresholds({
      httpReqDuration: createHttpReqDurationThreshold(1000),
      errors: createErrorRateThreshold(0.2),
    }),
  };
}

// Customize environment values (BASE_URL, timeouts, etc.)
function createDevConfigValues(): EnvironmentConfig {
  return {
    baseUrl: __ENV.BASE_URL || 'http://localhost:5197',
    httpTimeout: '30s',
    maxRedirects: 5,
    userAgent: 'k6-performance-test/dev',
  };
}
```

Test files can also override environment options:

```typescript
import { getOptions } from '../config/options';

export const options = getOptions(undefined, {
  // Override specific options
  thresholds: {
    'custom_check': ['rate=1'],
  },
});
```

**Overriding BASE_URL:**

```bash
# Via environment variable (takes precedence over config defaults)
BASE_URL=https://custom-api.example.com k6 run --env ENV=test tests/smoke.spec.ts

# Or set in .env file
BASE_URL=https://custom-api.example.com
```

### Reusable Test Scenarios

Test scenarios are modular, reusable functions that encapsulate test logic. They can be used across multiple tests with different configurations.

**Available Scenarios:**
- `scenarios/apis/publish.ts` - Publish API scenario
- `scenarios/apis/meter-ingestion.ts` - Meter ingestion API scenario

**Using Scenarios:**

```typescript
import publishScenario from '../scenarios/apis/publish';

export default function() {
  const result = publishScenario({
    baseUrl: 'https://api.example.com',
    errorHandler: myErrorHandler,
    customPayload: { /* custom data */ }
  });
}
```

**Scenario Guidelines:**
- Scenarios accept configuration objects (baseUrl, errorHandler, etc.)
- They return response data, avoiding side effects
- Custom metrics are optional
- Requests are tagged for identification

### API Client Pattern

API clients encapsulate HTTP interactions, making it easier to maintain and update API calls.

**Available API Clients:**
- `lib/api-client.ts` - Base APIClient class with common HTTP methods
- `lib/publish-api-client.ts` - PublishAPIClient for Publish endpoint
- `lib/meter-api-client.ts` - MeterAPIClient for Meter Ingestion endpoints

**Using API Clients:**

```typescript
import { PublishAPIClient } from '../lib/publish-api-client';
import { ErrorHandler } from '../lib/error-handler';

const errorHandler = ErrorHandler.createMetricLogger(errorCounter);
const client = new PublishAPIClient(baseUrl, { errorHandler });

const result = client.publishMeterData(payload);
// Returns: { data, response, success }
```

**API Client Features:**
- Automatic error handling via ErrorHandler
- Request tagging for metrics
- Response parsing (JSON or raw)
- Custom checks support
- Consistent return format: `{ data, response, success }`

### Error Handling

The ErrorHandler class provides structured error reporting with multiple logging strategies. The pattern follows the [Grafana k6 error handler example](https://grafana.com/docs/k6/latest/examples/error-handler/), extended with TypeScript types and optional 4xx response body capture for debugging.

**Error Handler Usage:**

```typescript
import { ErrorHandler } from '../lib/error-handler';
import { errorCounter } from '../lib/metrics';

// Console logging
const consoleHandler = ErrorHandler.createConsoleLogger();

// Metric logging (recommended)
const metricHandler = ErrorHandler.createMetricLogger(errorCounter);

// Custom logging
const customHandler = ErrorHandler.createCustomLogger((error) => {
  // Custom error handling logic
  console.error(`Error: ${error.url} - ${error.status}`);
});
```

**Error Data Captured:**
- URL
- HTTP status code
- Error code
- Traceparent header (for distributed tracing)
- Response body for 4xx (truncated, for debugging)
- Custom tags/metadata

### Standard k6 Tests

Run tests using k6 (the custom binary with Dynatrace extension works for all k6 tests):

```bash
# Run meter ingestion test (defaults to dev environment)
npm run test:meter-ingestion

# Run with specific environment
npm run test:meter-ingestion:prd
```

**Note:** Even though k6 is built with the Dynatrace extension, it works perfectly fine for standard k6 tests. The extension is only used when you explicitly enable Dynatrace output.

**Web dashboard (open in browser + export HTML report):**

To run a test with the [k6 web dashboard](https://grafana.com/docs/k6/latest/results-output/web-dashboard/) (real-time metrics), open it in your browser, and export an HTML report when the run finishes:

```bash
npm run test:meter-ingestion:dashboard
# or
npm run test:health:dashboard
```

The dashboard opens at `http://127.0.0.1:5665` and the report is written to `reports/k6-report.html`. To disable opening the browser (e.g. in CI), run with `K6_WEB_DASHBOARD_OPEN=false`. To disable export, omit `K6_WEB_DASHBOARD_EXPORT` or set it to empty.

### Dynatrace Tests

For tests that send metrics to Dynatrace:

1. **Configure Dynatrace environment variables:**

The devcontainer has default values for Dynatrace configuration. You only need to set your API token.

**Using .env file (Recommended)**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual Dynatrace credentials
# The .env file is automatically loaded when the container starts
```

**Alternative: Export directly in terminal**

```bash
export K6_DYNATRACE_URL=https://<environment-id>.live.dynatrace.com
export K6_DYNATRACE_APITOKEN=<your-api-token>
```

**Important:** The Dynatrace API Token must have the scope `metrics.ingest` (API v2).

You can create an API token via:
- Dynatrace UI: Settings → Integration → Dynatrace API → Generate new token
- Or using curl:

```bash
curl -X POST "https://<environment-id>.live.dynatrace.com/api/v2/apiTokens" \
  -H "accept: application/json; charset=utf-8" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "Authorization: Api-Token XXXXXXXX" \
  -d '{"name":"k6-metrics","scopes":["metrics.ingest"]}'
```

2. **Run tests with Dynatrace output:**

```bash
k6 run tests/dynatrace-test.ts -o output-dynatrace
```

**Note:** Default Dynatrace configuration is set in the devcontainer:
- `K6_DYNATRACE_URL` defaults to `https://dynatrace.live.com` (can be overridden in .env)
- `K6_DYNATRACE_FLUSH_PERIOD` defaults to `1s` (can be overridden in .env)
- `K6_DYNATRACE_INSECURE_SKIP_TLS_VERIFY` defaults to `true` (can be overridden in .env)
- `K6_DYNATRACE_APITOKEN` must be set in your `.env` file

### Dynatrace Configuration Options

When streaming k6 results to Dynatrace, you can configure the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `K6_DYNATRACE_URL` | Dynatrace environment URL | `https://dynatrace.live.com` |
| `K6_DYNATRACE_APITOKEN` | API token with `metrics.ingest` scope | Required |
| `K6_DYNATRACE_FLUSH_PERIOD` | How often metrics are sent to Dynatrace | `1s` |
| `K6_DYNATRACE_INSECURE_SKIP_TLS_VERIFY` | Skip TLS verification | `true` |
| `K6_DYNATRACE_HEADER_<key>` | Additional HTTP headers | - |

Example with custom flush period:

```bash
export K6_DYNATRACE_FLUSH_PERIOD=5s
k6 run tests/dynatrace-test.ts -o output-dynatrace
```

## Architecture Overview

This project follows Grafana k6 best practices for organizing performance testing suites:

### Modularized Configurations

**Workload Configurations** (`config/workloads.ts`):
- Separate workload definitions from environment configs
- Environment-specific workload availability
- Easy to add new workloads or modify existing ones

**Threshold Configurations** (`config/thresholds.ts`):
- Common thresholds applied to all tests
- Environment-specific threshold adjustments
- Workload-specific threshold relaxations (e.g., stress tests allow higher error rates)

### Reusable Scenarios

**Scenario Modules** (`scenarios/apis/`):
- Test logic extracted into reusable functions
- Can be used across multiple tests
- Accept configuration objects for flexibility
- Return response data without side effects

### API Client Pattern

**API Clients** (`lib/`):
- Encapsulate HTTP interactions
- Central point for API changes
- Consistent error handling
- Request tagging for metrics

### Error Handling

**ErrorHandler** (`lib/error-handler.ts`):
- Structured error reporting
- Multiple logging strategies (console, metrics, custom)
- Captures URL, status, error codes, traceparent headers
- Integrates with custom metrics

## Test Structure

The tests demonstrate:

- **Modular scenarios** - Reusable test logic
- **API clients** - Encapsulated HTTP interactions
- **Error handling** - Structured error reporting
- **Custom metrics** - Tracking error rates and success rates
- **Thresholds** - Setting performance expectations
- **Workloads** - Different load patterns per environment
- **Stages** - Ramping up/down virtual users
- **Setup/Teardown** - Initializing and cleaning up test data

## Available Scripts

### Test Scripts

**Smoke Tests:**
- `npm run test:smoke` or `npm run test:smoke:dev` - Run smoke test (dev environment, smoke workload)
- `npm run test:smoke:test` - Run smoke test (test environment, smoke workload)
- `npm run test:smoke:acc` - Run smoke test (acceptance environment, smoke workload)
- `npm run test:smoke:prd` - Run smoke test (production environment, smoke workload)

**Meter Ingestion Tests:**
- `npm test` or `npm run test:meter-ingestion` - Run meter ingestion test (dev environment, smoke workload)
- `npm run test:meter-ingestion:dev` - Run meter ingestion test (dev environment, smoke workload)
- `npm run test:meter-ingestion:dev:smoke` - Run with smoke workload
- `npm run test:meter-ingestion:dev:averageLow` - Run with averageLow workload
- `npm run test:meter-ingestion:test` - Run meter ingestion test (test environment, smoke workload)
- `npm run test:meter-ingestion:test:smoke` - Run with smoke workload
- `npm run test:meter-ingestion:test:averageLow` - Run with averageLow workload
- `npm run test:meter-ingestion:test:averageMed` - Run with averageMed workload
- `npm run test:meter-ingestion:test:stress` - Run with stress workload
- `npm run test:meter-ingestion:acc` - Run meter ingestion test (acceptance environment, smoke workload)
- `npm run test:meter-ingestion:acc:smoke` - Run with smoke workload
- `npm run test:meter-ingestion:acc:averageLow` - Run with averageLow workload
- `npm run test:meter-ingestion:acc:averageMed` - Run with averageMed workload
- `npm run test:meter-ingestion:acc:stress` - Run with stress workload
- `npm run test:meter-ingestion:prd` - Run meter ingestion test (production environment, smoke workload)
- `npm run test:meter-ingestion:prd:smoke` - Run with smoke workload
- `npm run test:meter-ingestion:prd:averageLow` - Run with averageLow workload
- `npm run test:meter-ingestion:prd:averageMed` - Run with averageMed workload
- `npm run test:meter-ingestion:prd:stress` - Run with stress workload

**Dynatrace Tests:**
- `npm run test:dynatrace` or `npm run test:dynatrace:dev` - Run Dynatrace test (dev environment, smoke workload)
- `npm run test:dynatrace:test` - Run Dynatrace test (test environment, smoke workload)
- `npm run test:dynatrace:acc` - Run Dynatrace test (acceptance environment, smoke workload)
- `npm run test:dynatrace:prd` - Run Dynatrace test (production environment, smoke workload)

## Custom k6 Binary

The devcontainer automatically builds a custom k6 binary with the Dynatrace output extension during container build. This is configured in `.devcontainer/devcontainer.json`:

```json
"ghcr.io/grafana/devcontainer-features/k6:1": {
  "with": ["github.com/Dynatrace/xk6-output-dynatrace"]
}
```

The custom binary is automatically installed in `/usr/local/bin/k6` and is available immediately when the container starts.

### Adding More Extensions

To add more k6 extensions, edit `.devcontainer/devcontainer.json` and add them to the `with` array:

```json
"ghcr.io/grafana/devcontainer-features/k6:1": {
  "with": [
    "github.com/Dynatrace/xk6-output-dynatrace",
    "github.com/your-org/xk6-your-extension"
  ]
}
```

Then rebuild the container for the changes to take effect.

## CI/CD Integration

This project includes a GitHub Actions workflow for automated performance testing.

### GitHub Actions Workflow

The workflow (`.github/workflows/performance-tests.yml`) automatically runs performance tests on:
- Push to any branch
- Pull requests

**Workflow Jobs:**
The workflow runs tests for multiple environments (dev and test) using a matrix strategy:
1. **Smoke Test** - Runs `tests/smoke.spec.ts` for dev and test environments (smoke workload)
2. **Meter Ingestion Test** - Runs `tests/meter-ingestion.spec.ts` for dev and test environments (smoke workload)
3. **Dynatrace Test** - Builds custom k6 binary with Dynatrace extension and runs `tests/dynatrace-test.spec.ts` for dev and test environments (smoke workload)

To add more environments (acc, prd) or workloads to CI/CD, update the `environment` and `workload` matrices in `.github/workflows/performance-tests.yml`.

### GitHub Secrets Configuration

For the Dynatrace test to work in CI/CD, configure the following secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Add the following secrets:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `K6_DYNATRACE_URL` | Dynatrace environment URL | No (defaults to `https://dynatrace.live.com`) |
| `K6_DYNATRACE_APITOKEN` | Dynatrace API token with `metrics.ingest` scope | Yes (for Dynatrace test) |
| `K6_DYNATRACE_FLUSH_PERIOD` | How often metrics are sent | No (defaults to `1s`) |

**Note:** If Dynatrace secrets are not configured, the Dynatrace test job will be skipped (configured with `continue-on-error: true`).

### Local Testing vs CI/CD

- **Local**: Use `.env` file for Dynatrace configuration (automatically loaded)
- **CI/CD**: Use GitHub Secrets for Dynatrace configuration

## Creating New Tests

Following the best practices, creating a new test is straightforward:

1. **Create a scenario** (if reusable logic doesn't exist):
   ```typescript
   // scenarios/apis/my-api.ts
   import { MyAPIClient } from '../../lib/my-api-client';
   
   export default function myApiScenario(config: MyApiConfig) {
     const client = new MyAPIClient(config.baseUrl);
     return client.getData();
   }
   ```

2. **Create the test file**:
   ```typescript
   // tests/my-api.spec.ts
   import { getOptions, getEnvironmentValues } from '../config/options';
   import { ErrorHandler } from '../lib/error-handler';
   import { errorCounter } from '../lib/metrics';
   import myApiScenario from '../scenarios/apis/my-api';
   
   export const options = getOptions(undefined, undefined, 'smoke');
   
   export function setup() {
     return {
       ...getEnvironmentValues(),
       errorHandler: ErrorHandler.createMetricLogger(errorCounter),
     };
   }
   
   export default function(data: ReturnType<typeof setup>) {
     myApiScenario({ baseUrl: data.baseUrl, errorHandler: data.errorHandler });
   }
   ```

3. **Add npm script** (optional):
   ```json
   "test:my-api:dev": "k6 run --env ENV=dev --env WORKLOAD=smoke tests/my-api.spec.ts"
   ```

## TypeScript Support

This project uses TypeScript for type safety. The `tsconfig.json` is configured for k6 compatibility.

To validate TypeScript without running tests:

```bash
npx tsc --noEmit
```

## Project Structure

```
workspace/
├── .devcontainer/
│   ├── devcontainer.json       # k6 feature with Dynatrace extension
│   └── setup-env.sh            # Auto-load .env script
├── .github/
│   └── workflows/
│       └── performance-tests.yml  # CI/CD workflow
├── config/
│   ├── options.ts              # Environment-specific k6 options & config values
│   ├── workloads.ts            # Workload configurations (smoke, average, stress, etc.)
│   └── thresholds.ts           # Threshold configurations (common, environment-specific)
├── lib/
│   ├── api-client.ts           # Base API client class
│   ├── publish-api-client.ts   # Publish API client
│   ├── meter-api-client.ts    # Meter Ingestion API client
│   ├── error-handler.ts        # Error handling wrapper
│   └── metrics.ts              # Shared custom metrics
├── scenarios/
│   └── apis/
│       ├── publish.ts          # Reusable Publish API scenario
│       └── meter-ingestion.ts  # Reusable Meter Ingestion scenario
├── tests/
│   ├── smoke.spec.ts           # Smoke test (uses publish scenario)
│   ├── meter-ingestion.spec.ts # Meter ingestion test (uses meter scenario)
│   └── dynatrace-test.spec.ts  # Dynatrace test (uses meter scenario)
├── .env.example                # Example environment configuration
├── .env                        # Your environment credentials (gitignored)
├── package.json
└── README.md
```

**Configuration Files:**
- `config/options.ts`: Defines environment-specific k6 options and configuration values (BASE_URL, timeouts, etc.)
- `config/workloads.ts`: Defines workload configurations (smoke, averageLow, averageMed, stress, peak) per environment
- `config/thresholds.ts`: Defines threshold configurations (common thresholds, environment-specific, workload-specific)
- `.env`: Local environment variables (BASE_URL, Dynatrace credentials, etc.) - automatically loaded in devcontainer
- `.env.example`: Template showing required/optional environment variables

**Library Files:**
- `lib/api-client.ts`: Base API client with common HTTP methods (GET, POST, PUT, DELETE, PATCH)
- `lib/publish-api-client.ts`: Specialized client for Publish API endpoint
- `lib/meter-api-client.ts`: Specialized client for Meter Ingestion API endpoints
- `lib/error-handler.ts`: ErrorHandler class for structured error reporting
- `lib/metrics.ts`: Shared custom metrics (errorCounter, errorRate, successRate)

**Scenario Files:**
- `scenarios/apis/publish.ts`: Reusable Publish API scenario
- `scenarios/apis/meter-ingestion.ts`: Reusable Meter Ingestion scenario
