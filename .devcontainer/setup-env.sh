#!/bin/bash
# Auto-load .env in shell sessions; create .env from .env.example if missing.
# Runs during container creation (postCreateCommand).

WORKSPACE="/workspaces/cce-performance-tests"
ENV_FILE="$WORKSPACE/.env"
ENV_EXAMPLE="$WORKSPACE/.env.example"

# Create .env from .env.example if it doesn't exist (fresh clone)
if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "✅ Created .env from .env.example — edit with your values (BASE_URL, Dynatrace, etc.)"
fi

ENV_LOADER="# Auto-load .env if it exists
if [ -f $ENV_FILE ]; then
  set -a
  source $ENV_FILE
  set +a
fi"

# Add to .bashrc if not already present
if ! grep -q "Auto-load .env if it exists" ~/.bashrc 2>/dev/null; then
  echo "" >> ~/.bashrc
  echo "$ENV_LOADER" >> ~/.bashrc
fi

# Add to .profile if not already present
if ! grep -q "Auto-load .env if it exists" ~/.profile 2>/dev/null; then
  echo "" >> ~/.profile
  echo "$ENV_LOADER" >> ~/.profile
fi

# Load .env for this session
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
  echo "✅ Environment loaded from .env"
fi
