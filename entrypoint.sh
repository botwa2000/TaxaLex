#!/bin/sh
# Load Docker Swarm secrets into environment variables
# Secrets are mounted as files at /run/secrets/<secret_name>

for secret_file in /run/secrets/*; do
  if [ -f "$secret_file" ]; then
    secret_name=$(basename "$secret_file")
    # Convert secret name to uppercase env var (e.g., anthropic_api_key_prod -> ANTHROPIC_API_KEY,
    # taxalex_brevo_api_key_prod -> BREVO_API_KEY — the taxalex_ prefix is only for isolation on
    # the shared server and is stripped here so env.ts can use clean canonical names)
    env_name=$(echo "$secret_name" | sed 's/_prod$//' | sed 's/_dev$//' | sed 's/^taxalex_//' | tr '[:lower:]' '[:upper:]')
    export "$env_name"="$(cat "$secret_file")"
  fi
done

exec "$@"
