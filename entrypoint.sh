#!/bin/sh
# Load Docker Swarm secrets into environment variables
# Secrets are mounted as files at /run/secrets/<secret_name>

for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    # Convert secret name to uppercase env var (e.g., anthropic_api_key_prod -> ANTHROPIC_API_KEY)
    env_name=$(echo "$secret_name" | sed 's/_prod$//' | sed 's/_dev$//' | tr '[:lower:]' '[:upper:]')
    export "$env_name"="$(cat "$secret_file")"
  fi
done

# Run Prisma migrations if DATABASE_URL is set and is not the build placeholder
if [ -n "${DATABASE_URL:-}" ] && [ "$DATABASE_URL" != "postgresql://placeholder:placeholder@localhost:5432/taxalex" ]; then
  echo "[entrypoint] Running database migrations..."
  node node_modules/.bin/prisma migrate deploy && echo "[entrypoint] Migrations complete" || echo "[entrypoint] Migration failed — continuing startup"
fi

exec "$@"
