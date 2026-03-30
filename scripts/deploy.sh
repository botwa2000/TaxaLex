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

SSH_KEY="${HETZNER_SSH_KEY/#\~/$HOME}"
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new ${HETZNER_USER}@${HETZNER_HOST}"
GIT_SSH="GIT_SSH_COMMAND='ssh -i /home/deploy/.ssh/id_ed25519_taxalex -F /home/deploy/.ssh/config'"

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
  git push origin main
  echo "==> Pushed to GitHub"

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

  create_or_replace "anthropic_api_key_prod" "${ANTHROPIC_API_KEY_PROD:-}"
  create_or_replace "anthropic_api_key_dev"  "${ANTHROPIC_API_KEY_DEV:-}"
  create_or_replace "openai_api_key_prod"    "${OPENAI_API_KEY_PROD:-}"
  create_or_replace "openai_api_key_dev"     "${OPENAI_API_KEY_DEV:-}"
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

  echo "==> Done. Verify with: ssh server 'docker secret ls | grep -E \"anthropic|openai|nextauth\"'"

else
  echo "Usage: $0 <push [message] | dev | prod | secrets>"
  exit 1
fi
