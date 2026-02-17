# CCE Performance Tests - run k6 tests with Node 24 and k6 (Dynatrace extension)
# Devcontainer is unchanged; use this image for plain Docker runs.

FROM node:24-bookworm

# Install Go 1.22+ (xk6 requires it; Bookworm's Go 1.19 is too old), then build k6 with Dynatrace extension
ARG GO_VERSION=1.22.4
ARG TARGETARCH
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget \
	&& wget -q "https://go.dev/dl/go${GO_VERSION}.linux-${TARGETARCH}.tar.gz" -O /tmp/go.tar.gz \
	&& tar -C /usr/local -xzf /tmp/go.tar.gz \
	&& rm /tmp/go.tar.gz \
	&& export PATH="/usr/local/go/bin:$PATH" \
	&& GOPATH=/go /usr/local/go/bin/go install go.k6.io/xk6/cmd/xk6@latest \
	&& cd /tmp && /go/bin/xk6 build --with github.com/Dynatrace/xk6-output-dynatrace -o /usr/local/bin/k6 \
	&& rm -rf /usr/local/go /go /root/.cache \
	&& apt-get remove -y wget \
	&& apt-get autoremove -y \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci && npm config set update-notifier false

# Copy application code
COPY . .

# Run as node user (match devcontainer remoteUser)
RUN chown -R node:node /app
USER node

# Source .env if present (e.g. when bind-mounted), then run the command.
# With sh -c "script" cmd args, $0=cmd and $@=args.
ENTRYPOINT ["sh", "-c", "if [ -f /app/.env ]; then set -a && . /app/.env && set +a; fi && exec \"$0\" \"$@\""]
CMD ["npm", "run", "test"]
