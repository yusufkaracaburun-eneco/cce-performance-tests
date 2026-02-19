# CCE Performance Tests

Performance testing suite using k6 and TypeScript.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [DevContainer Setup](#devcontainer-setup)
  - [Docker Setup](#docker-setup)
- [Running Tests](#running-tests)

## Prerequisites

- k6 installed (available in devcontainer with Dynatrace extension)
- Node.js and npm
- Go (automatically installed by devcontainer for building custom k6 binaries)

## Setup

### DevContainer Setup

This project uses a devcontainer with k6 pre-installed with the Dynatrace output extension.

**First Time Setup:**

1. Open the project in VS Code
2. When prompted, click "Reopen in Container"
3. Wait for the container to build (this may take a few minutes)
   - The k6 binary with Dynatrace extension will be automatically built during container build

See [.devcontainer/REBUILD.md](.devcontainer/REBUILD.md) for detailed instructions.

**Install dependencies:**

```bash
npm install
```

### Docker Setup

You can run the test suite with plain Docker (no devcontainer). The image includes Node 24 and k6 with the Dynatrace output extension.

**Build the image:**

```bash
≈
```

**Run the default test (meter ingestion):**

```bash
docker run --rm cce-performance-tests
```

**Run with environment variables (e.g. BASE_URL, Dynatrace):**

```bash
docker run --rm -e BASE_URL=https://api.example.com -e K6_DYNATRACE_APITOKEN=your-token cce-performance-tests
```

**Mount a local `.env` file (so the container reads your existing env config):**

```bash
docker run --rm -v $(pwd)/.env:/app/.env:ro cce-performance-tests
```

The `.env` file is not copied into the image; use `-e` or a bind mount as above.

**For development (no rebuild needed when adding tests):**

```bash
docker run --rm -v $(pwd):/app cce-performance-tests npm run test
```

**Open a shell in the container:**

```bash
docker run --rm -it --entrypoint sh cce-performance-tests
```

## Running Tests

**Run meter ingestion test (defaults to dev environment):**

```bash
npm run test:meter-ingestion
```

**Run with specific environment:**

```bash
npm run test:meter-ingestion:prd
```

**Run tests with k6 directly:**

```bash
k6 run tests/meter-ingestion.spec.ts
```

**Run with environment variable:**

```bash
ENV=test k6 run tests/meter-ingestion.spec.ts
```
