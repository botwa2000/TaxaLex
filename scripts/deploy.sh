#!/usr/bin/env bash
# TaxAlex deploy script
#
# Usage:
#   ./scripts/deploy.sh push [message]   — commit everything and push to GitHub
#   ./scripts/deploy.sh dev              — deploy to dev.taxalex.de
#   ./scripts/deploy.sh prod             — deploy to taxalex.de (requires confirmation)
#   ./scripts/deploy.sh secrets          — create/rotate Docker Swarm secrets from .secrets
#
# Credentials are read from .secrets (gitignored). Copy .secrets.example to .secrets first.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/.secrets"

# ── Load credentials ──────────────────────────────────────────────────────────
if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "Error: .secrets file not found."
  echo "Copy .secrets.example to .secrets and fill in your values."
  exit 1
fi
# shellcheck disable=SC1090
source "$SECRETS_FILE"

: "${HETZNER_HOST:?HETZNER_HOST not set in .secrets}"
: "${HETZNER_USER:?HETZNER_USER not set in .secrets}"
: "${HETZNER_SSH_KEY:?HETZNER_SSH_KEY not set in .secrets}"
: "${GITHUB_SSH_KEY:?GITHUB_SSH_KEY not set in .secrets}"

SSH_KEY="${HETZNER_SSH_KEY/#\~/$HOME}"
GITHUB_KEY="${GITHUB_SSH_KEY/#\~/$HOME}"
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new ${HETZNER_USER}@${HETZNER_HOST}"
GIT_SSH="GIT_SSH_COMMAND='ssh -i /home/deploy/.ssh/id_ed25519_taxalex -F /home/deploy/.ssh/config'"
# Used for local → GitHub push
GIT_PUSH="GIT_SSH_COMMAND='ssh -i $GITHUB_KEY -o IdentitiesOnly=yes'"

CMD="${1:-}"

# ── push ─────────────────────────────────────────────────────────────────────
if [[ "$CMD" == "push" ]]; then
  MSG="${2:-update: $(date '+%Y-%m-%d %H:%M')}"
  cd "$REPO_ROOT"
  echo "==> Staging all changes"
  git add .
  if git diff --cached --quiet; then
    echo "==> Nothing to commit, pushing existing HEAD"
  else
    git commit -m "$MSG"
  fi
  eval "$GIT_PUSH" git push origin main
  echo "==> Pushed to GitHub"
  echo ""
  echo "    Next: ./scripts/deploy.sh dev   — deploy to dev.taxalex.de"
  echo "          ./scripts/deploy.sh prod  — deploy to taxalex.de"

# ── dev ──────────────────────────────────────────────────────────────────────
elif [[ "$CMD" == "dev" ]]; then
  echo "==> Deploying to dev.taxalex.de"
  $SSH bash -s << EOF
set -euo pipefail
cd /opt/taxalex-dev

echo "--- [1/4] pull"
$GIT_SSH git pull origin main

echo "--- [2/4] build"
docker build -t taxalex-frontend:dev .

echo "--- [3/4] stack deploy"
docker stack deploy -c docker-compose-dev.yml taxalex-dev

echo "--- [4/4] force update + wait"
docker service update --force --image taxalex-frontend:dev taxalex-dev_frontend
sleep 20
curl -sf http://localhost:3011/ > /dev/null && echo "==> dev.taxalex.de OK" || echo "==> WARNING: health check failed"
EOF

# ── prod ─────────────────────────────────────────────────────────────────────
elif [[ "$CMD" == "prod" ]]; then
  echo ""
  echo "==> You are about to deploy to PRODUCTION (taxalex.de)"
  echo "    Have you tested on dev.taxalex.de first?"
  echo ""
  read -r -p "Type 'deploy' to confirm: " CONFIRM
  if [[ "$CONFIRM" != "deploy" ]]; then
    echo "Aborted."
    exit 0
  fi
  echo "==> Deploying to taxalex.de"
  $SSH bash -s << EOF
set -euo pipefail
cd /opt/taxalex

echo "--- [1/4] pull"
$GIT_SSH git pull origin main

echo "--- [2/4] build"
docker build -t taxalex-frontend:latest .

echo "--- [3/4] stack deploy"
docker stack deploy -c docker-compose.yml taxalex

echo "--- [4/4] force update + wait"
docker service update --force --image taxalex-frontend:latest taxalex_frontend
sleep 20
curl -sf http://localhost:3010/ > /dev/null && echo "==> taxalex.de OK" || echo "==> WARNING: health check failed"
EOF

# ── migrate ──────────────────────────────────────────────────────────────────
elif [[ "$CMD" == "migrate" ]]; then
  # Applies any unapplied migration SQL files directly via psql.
  # Usage: ./scripts/deploy.sh migrate [dev|prod] <migration_sql_file>
  ENV="${2:-dev}"
  SQL_FILE="${3:-}"
  if [[ "$ENV" == "prod" ]]; then
    DB_URL="${DATABASE_URL_PROD:-}"
  else
    DB_URL="${DATABASE_URL_DEV:-}"
  fi
  if [[ -z "$DB_URL" ]]; then
    echo "Error: DATABASE_URL_${ENV^^} not set in .secrets"
    exit 1
  fi
  if [[ -z "$SQL_FILE" ]]; then
    echo "Error: provide path to migration SQL file"
    echo "Usage: $0 migrate [dev|prod] prisma/migrations/<name>/migration.sql"
    exit 1
  fi
  MIGRATION_NAME="$(basename "$(dirname "$SQL_FILE")")"
  echo "==> Applying migration '$MIGRATION_NAME' to $ENV"
  cat "$SQL_FILE" | $SSH "psql '$DB_URL'"
  $SSH "psql '$DB_URL' -c \"INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, applied_steps_count) VALUES (gen_random_uuid()::text, 'manual', NOW(), '$MIGRATION_NAME', NULL, NULL, 1) ON CONFLICT DO NOTHING;\""
  echo "==> Migration complete"

# ── secrets ──────────────────────────────────────────────────────────────────
elif [[ "$CMD" == "secrets" ]]; then
  echo "==> Updating Docker Swarm secrets on server"

  create_or_replace() {
    local name="$1"
    local value="$2"
    if [[ -z "$value" ]]; then
      echo "    Skipping $name (empty)"
      return
    fi
    $SSH "docker secret rm $name 2>/dev/null || true && printf '%s' '$value' | docker secret create $name -"
    echo "    Created: $name"
  }

  create_or_replace "anthropic_api_key_prod"  "${ANTHROPIC_API_KEY_PROD:-}"
  create_or_replace "anthropic_api_key_dev"   "${ANTHROPIC_API_KEY_DEV:-}"
  create_or_replace "openai_api_key_prod"     "${OPENAI_API_KEY_PROD:-}"
  create_or_replace "openai_api_key_dev"      "${OPENAI_API_KEY_DEV:-}"
  create_or_replace "google_ai_api_key_prod"  "${GOOGLE_AI_API_KEY_PROD:-}"
  create_or_replace "google_ai_api_key_dev"   "${GOOGLE_AI_API_KEY_DEV:-}"
  create_or_replace "perplexity_api_key_prod" "${PERPLEXITY_API_KEY_PROD:-}"
  create_or_replace "perplexity_api_key_dev"  "${PERPLEXITY_API_KEY_DEV:-}"
  create_or_replace "database_url_prod"      "${DATABASE_URL_PROD:-}"
  create_or_replace "database_url_dev"       "${DATABASE_URL_DEV:-}"

  if [[ -n "${NEXTAUTH_SECRET_PROD:-}" ]]; then
    create_or_replace "nextauth_secret_prod" "$NEXTAUTH_SECRET_PROD"
  else
    echo "    NEXTAUTH_SECRET_PROD not set — keeping existing secret"
  fi
  if [[ -n "${NEXTAUTH_SECRET_DEV:-}" ]]; then
    create_or_replace "nextauth_secret_dev" "$NEXTAUTH_SECRET_DEV"
  else
    echo "    NEXTAUTH_SECRET_DEV not set — keeping existing secret"
  fi

  # TaxaLex-specific secrets (taxalex_ prefix — isolated from other apps on same server)
  create_or_replace "taxalex_brevo_api_key_prod" "${TAXALEX_BREVO_API_KEY_PROD:-}"
  create_or_replace "taxalex_brevo_api_key_dev"  "${TAXALEX_BREVO_API_KEY_DEV:-}"
  create_or_replace "taxalex_app_url_prod"        "${TAXALEX_APP_URL_PROD:-}"
  create_or_replace "taxalex_app_url_dev"         "${TAXALEX_APP_URL_DEV:-}"
  # EMAIL_FROM and EMAIL_FROM_NAME are static — only recreate if changed
  create_or_replace "taxalex_email_from_prod"      "${TAXALEX_EMAIL_FROM_PROD:-no-reply@taxalex.de}"
  create_or_replace "taxalex_email_from_dev"       "${TAXALEX_EMAIL_FROM_DEV:-no-reply@taxalex.de}"
  create_or_replace "taxalex_email_from_name_prod" "${TAXALEX_EMAIL_FROM_NAME_PROD:-TaxaLex}"
  create_or_replace "taxalex_email_from_name_dev"  "${TAXALEX_EMAIL_FROM_NAME_DEV:-TaxaLex}"

  # Stripe
  create_or_replace "stripe_secret_key_prod"      "${STRIPE_SECRET_KEY_PROD:-}"
  create_or_replace "stripe_secret_key_dev"       "${STRIPE_SECRET_KEY_DEV:-}"
  create_or_replace "stripe_publishable_key_prod" "${STRIPE_PUBLISHABLE_KEY_PROD:-}"
  create_or_replace "stripe_publishable_key_dev"  "${STRIPE_PUBLISHABLE_KEY_DEV:-}"
  if [[ -n "${STRIPE_WEBHOOK_SECRET_PROD:-}" ]]; then
    create_or_replace "taxalex_stripe_webhook_secret_prod" "$STRIPE_WEBHOOK_SECRET_PROD"
  else
    echo "    STRIPE_WEBHOOK_SECRET_PROD not set — skipping (add after registering webhook)"
  fi
  if [[ -n "${STRIPE_WEBHOOK_SECRET_DEV:-}" ]]; then
    create_or_replace "taxalex_stripe_webhook_secret_dev"  "$STRIPE_WEBHOOK_SECRET_DEV"
  else
    echo "    STRIPE_WEBHOOK_SECRET_DEV not set — skipping (add after registering webhook)"
  fi

  echo "==> Done. Verify with: ssh server 'docker secret ls | grep taxalex'"

else
  echo "Usage: $0 <push [message] | dev | prod | migrate [dev|prod] | secrets>"
  exit 1
fi
