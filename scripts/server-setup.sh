#!/bin/bash
# Run once on the Hetzner server as root to set up the deployment environment.
# Usage: bash server-setup.sh
set -e

echo "=== TaxAlex Hetzner Server Setup ==="

# 1. System packages
apt-get update -y
apt-get install -y git curl nginx certbot python3-certbot-nginx

# 2. Docker
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

# 3. Clone repo
if [ ! -d /opt/taxalex ]; then
  git clone https://github.com/botwa2000/TaxaLex.git /opt/taxalex
else
  echo "Repo already cloned at /opt/taxalex"
fi

# 4. Nginx config
cp /opt/taxalex/nginx/taxalex.conf /etc/nginx/sites-available/taxalex.conf
ln -sf /etc/nginx/sites-available/taxalex.conf /etc/nginx/sites-enabled/taxalex.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 5. SSL certificates (requires DNS already pointing to this server)
certbot --nginx -d taxalex.de -d www.taxalex.de --non-interactive --agree-tos -m admin@taxalex.de
certbot --nginx -d dev.taxalex.de --non-interactive --agree-tos -m admin@taxalex.de

# 6. Docker Swarm secrets — fill in real values below
echo "==> Creating Docker secrets (edit this script with real values first!)"
# echo "YOUR_ANTHROPIC_KEY_PROD"  | docker secret create anthropic_api_key_prod -
# echo "YOUR_OPENAI_KEY_PROD"     | docker secret create openai_api_key_prod -
# echo "YOUR_NEXTAUTH_SECRET_PROD"| docker secret create nextauth_secret_prod -
# echo "YOUR_ANTHROPIC_KEY_DEV"   | docker secret create anthropic_api_key_dev -
# echo "YOUR_OPENAI_KEY_DEV"      | docker secret create openai_api_key_dev -
# echo "YOUR_NEXTAUTH_SECRET_DEV" | docker secret create nextauth_secret_dev -

echo ""
echo "=== Manual steps remaining ==="
echo "1. Uncomment and fill in Docker secrets above, then re-run this section"
echo "2. Set up deploy SSH key: add ~/.ssh/authorized_keys entry for GitHub Actions"
echo "3. First deploy: cd /opt/taxalex && docker compose -f docker-compose-dev.yml up -d --build"
echo "4. GitHub repo secrets to add:"
echo "   HETZNER_HOST = <server IP>"
echo "   HETZNER_USER = root"
echo "   HETZNER_SSH_KEY = <private key for deploy>"
