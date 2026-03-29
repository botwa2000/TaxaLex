# TaxAlex Deployment Guide (Docker Swarm)

**Last Updated:** 2026-03-29
**Domain:** taxalex.de
**Server:** Shared Hetzner VPS with bonifatus-dms (91.99.212.17)

> **NOTE:** This project runs on the same server as bonifatus-dms but is fully isolated:
> separate Docker stack, separate Nginx server blocks, separate secrets, separate directories.

---

## Quick Reference

| Environment | Directory | URL | Stack Name | Port |
|------------|-----------|-----|------------|------|
| **Dev** | `/opt/taxalex-dev` | https://dev.taxalex.de | `taxalex-dev` | 3011 |
| **Prod** | `/opt/taxalex` | https://taxalex.de | `taxalex` | 3010 |

**Server IP:** 91.99.212.17
**GitHub Repo:** github.com/botwa2000/TaxaLex

---

## FIRST-TIME SETUP (One-Time Only)

### 1. DNS Setup (Cloudflare)

Add these DNS records in Cloudflare for `taxalex.de`:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `taxalex.de` | 91.99.212.17 | Proxied |
| A | `www` | 91.99.212.17 | Proxied |
| A | `dev` | 91.99.212.17 | Proxied |

Set SSL/TLS encryption mode to **Full (Strict)**.

### 2. Cloudflare Origin Certificate

Generate an Origin Certificate for `taxalex.de` and `*.taxalex.de`:

1. Cloudflare Dashboard > taxalex.de > SSL/TLS > Origin Server > Create Certificate
2. Copy cert and key, then on the server:

```bash
ssh root@91.99.212.17 'bash -s' << 'ENDSSH'
mkdir -p /etc/ssl/cloudflare

cat > /etc/ssl/cloudflare/taxalex.de.pem << 'CERT'
# Paste your origin certificate here
CERT

cat > /etc/ssl/cloudflare/taxalex.de.key << 'KEY'
# Paste your private key here
KEY

chmod 600 /etc/ssl/cloudflare/taxalex.de.key
chmod 644 /etc/ssl/cloudflare/taxalex.de.pem
ENDSSH
```

### 3. GitHub Deploy Key

Create a deploy key on the server for the TaxPax repo:

```bash
ssh root@91.99.212.17 'bash -s' << 'ENDSSH'
# Generate key (as deploy user)
sudo -u deploy ssh-keygen -t ed25519 -C "deploy@taxalex" -f /home/deploy/.ssh/id_ed25519_taxalex -N ""

# Show the public key - add this to GitHub repo Settings > Deploy Keys
cat /home/deploy/.ssh/id_ed25519_taxalex.pub

# Configure SSH to use this key for the taxalex repo
cat >> /home/deploy/.ssh/config << 'EOF'
Host github-taxalex
    HostName github.com
    User git
    IdentityFile /home/deploy/.ssh/id_ed25519_taxalex
    IdentitiesOnly yes
EOF

chown deploy:deploy /home/deploy/.ssh/config
chmod 600 /home/deploy/.ssh/config
ENDSSH
```

Add the public key to: https://github.com/botwa2000/TaxaLex/settings/keys

### 4. Clone Repository

```bash
ssh root@91.99.212.17 'bash -s' << 'ENDSSH'
# Production
sudo -u deploy git clone git@github-taxalex:botwa2000/TaxaLex.git /opt/taxalex
chown -R deploy:deploy /opt/taxalex

# Development
sudo -u deploy git clone git@github-taxalex:botwa2000/TaxaLex.git /opt/taxalex-dev
chown -R deploy:deploy /opt/taxalex-dev
ENDSSH
```

### 5. Create Docker Swarm Secrets

Docker Swarm should already be initialized (from bonifatus-dms). Create taxalex-specific secrets:

```bash
ssh root@91.99.212.17 'bash -s' << 'ENDSSH'
set -e

echo "=== Creating TaxAlex Production Secrets ==="
echo -n "YOUR_ANTHROPIC_API_KEY" | docker secret create anthropic_api_key_prod -
echo -n "YOUR_OPENAI_API_KEY" | docker secret create openai_api_key_prod -
echo -n "$(openssl rand -base64 32)" | docker secret create nextauth_secret_prod -

echo "=== Creating TaxAlex Development Secrets ==="
echo -n "YOUR_ANTHROPIC_API_KEY" | docker secret create anthropic_api_key_dev -
echo -n "YOUR_OPENAI_API_KEY" | docker secret create openai_api_key_dev -
echo -n "$(openssl rand -base64 32)" | docker secret create nextauth_secret_dev -

echo "=== Verifying ==="
docker secret ls | grep -E "anthropic|openai|nextauth"
ENDSSH
```

**Replace** `YOUR_ANTHROPIC_API_KEY` and `YOUR_OPENAI_API_KEY` with actual values.

### 6. Install Nginx Server Blocks

```bash
ssh root@91.99.212.17 'bash -s' << 'ENDSSH'
# Copy nginx configs from the repo
cp /opt/taxalex/nginx-taxalex.conf /etc/nginx/sites-available/taxalex.conf
cp /opt/taxalex/nginx-taxalex-dev.conf /etc/nginx/sites-available/taxalex-dev.conf

# Enable sites
ln -sf /etc/nginx/sites-available/taxalex.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/taxalex-dev.conf /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
ENDSSH
```

**Note:** The dev config reuses the `$dev_allowed` geo block from the existing bonifatus nginx config. Ensure your IP is whitelisted there.

---

## ONE-COMMAND DEPLOYMENT SEQUENCES

### Deploy to DEV

```bash
ssh root@91.99.212.17 'cd /opt/taxalex-dev && \
  echo "=== [1/5] Pulling latest code ===" && \
  git pull origin main && \
  echo "=== [2/5] Building image ===" && \
  docker compose -f docker-compose-dev.yml build && \
  echo "=== [3/5] Deploying to Docker Swarm ===" && \
  docker stack deploy -c docker-compose-dev.yml taxalex-dev && \
  echo "=== [4/5] Forcing frontend update ===" && \
  docker service update --force taxalex-dev_frontend && \
  echo "=== [5/5] Waiting and health check (20s) ===" && \
  sleep 20 && \
  curl -s https://dev.taxalex.de/ | head -c 200 && echo "" && \
  docker stack ps taxalex-dev --no-trunc | head -5'
```

**Time:** ~1-2 minutes

### Deploy to PROD

```bash
ssh root@91.99.212.17 'cd /opt/taxalex && \
  echo "=== [1/6] Pulling latest code ===" && \
  git pull origin main && \
  echo "=== [2/6] Building image ===" && \
  docker compose build && \
  echo "=== [3/6] Verifying secrets ===" && \
  docker secret ls | grep -E "anthropic_api_key_prod|openai_api_key_prod|nextauth_secret_prod" && \
  echo "=== [4/6] Deploying to Docker Swarm ===" && \
  docker stack deploy -c docker-compose.yml taxalex && \
  echo "=== [5/6] Forcing frontend update ===" && \
  docker service update --force taxalex_frontend && \
  echo "=== [6/6] Waiting and health check (20s) ===" && \
  sleep 20 && \
  curl -s https://taxalex.de/ | head -c 200 && echo "" && \
  docker stack ps taxalex --no-trunc | head -5'
```

**Time:** ~1-2 minutes

### Deploy to BOTH (Dev -> Test -> Prod)

```bash
# Step 1: Deploy to DEV
ssh root@91.99.212.17 'cd /opt/taxalex-dev && \
  git pull origin main && \
  docker compose -f docker-compose-dev.yml build && \
  docker stack deploy -c docker-compose-dev.yml taxalex-dev && \
  docker service update --force taxalex-dev_frontend && \
  sleep 20 && \
  curl -s https://dev.taxalex.de/ | head -c 200'

# Step 2: TEST ON DEV
# Open https://dev.taxalex.de and verify:
# - Page loads correctly
# - Tax objection letter generation works
# - No console errors

# Step 3: Deploy to PROD (only if dev testing passed)
ssh root@91.99.212.17 'cd /opt/taxalex && \
  git pull origin main && \
  docker compose build && \
  docker stack deploy -c docker-compose.yml taxalex && \
  docker service update --force taxalex_frontend && \
  sleep 20 && \
  curl -s https://taxalex.de/ | head -c 200'

# Step 4: VERIFY PROD
# Open https://taxalex.de and verify deployment
```

---

## Docker Swarm Commands Reference

| Task | Dev (taxalex-dev) | Prod (taxalex) |
|------|-------------------|----------------|
| Deploy | `docker stack deploy -c docker-compose-dev.yml taxalex-dev` | `docker stack deploy -c docker-compose.yml taxalex` |
| Stop | `docker stack rm taxalex-dev` | `docker stack rm taxalex` |
| Logs | `docker service logs taxalex-dev_frontend` | `docker service logs taxalex_frontend` |
| Status | `docker stack ps taxalex-dev` | `docker stack ps taxalex` |
| Restart | `docker service update --force taxalex-dev_frontend` | `docker service update --force taxalex_frontend` |
| Scale | `docker service scale taxalex-dev_frontend=2` | `docker service scale taxalex_frontend=2` |

### Secret Management

```bash
# List all secrets (shows both bonifatus and taxalex secrets)
docker secret ls

# Rotate a secret
echo -n 'new_api_key' | docker secret create anthropic_api_key_v2_prod -
docker service update \
  --secret-rm anthropic_api_key_prod \
  --secret-add source=anthropic_api_key_v2_prod,target=anthropic_api_key_prod \
  taxalex_frontend
```

---

## Rollback Procedure

```bash
ssh root@91.99.212.17 'cd /opt/taxalex && \
  echo "=== Recent commits ===" && \
  git log --oneline -10 && \
  echo "" && \
  read -p "Enter commit hash to rollback to: " COMMIT && \
  git reset --hard $COMMIT && \
  docker compose build && \
  docker stack deploy -c docker-compose.yml taxalex && \
  sleep 20 && \
  curl -s https://taxalex.de/ | head -c 200 && \
  docker stack ps taxalex'
```

---

## Coexistence with Bonifatus DMS

Both projects share the same server but are fully isolated:

| Resource | Bonifatus DMS | TaxAlex |
|----------|--------------|---------|
| Directory | `/opt/bonifatus-dms` | `/opt/taxalex` |
| Stack | `bonifatus` / `bonifatus-dev` | `taxalex` / `taxalex-dev` |
| Ports | 3000/3001 (frontend), 8080/8081 (backend) | 3010 (prod), 3011 (dev) |
| Domain | bonidoc.com | taxalex.de |
| SSL Cert | `/etc/ssl/cloudflare/bonidoc.com.*` | `/etc/ssl/cloudflare/taxalex.de.*` |
| Secrets | `*_prod` / `*_dev` (bonifatus) | `anthropic_*`, `openai_*`, `nextauth_*` |
| Docker Network | bonifatus_default | taxalex_default |
| GitHub Key | `id_ed25519` | `id_ed25519_taxalex` |

**No shared Docker networks, volumes, or secrets between the two projects.**

---

## Deployment Checklist

**First-Time Setup:**
- [ ] DNS records in Cloudflare (A records for taxalex.de, www, dev)
- [ ] Cloudflare SSL/TLS set to Full (Strict)
- [ ] Origin certificate created and installed on server
- [ ] GitHub deploy key added to botwa2000/TaxaLex
- [ ] Repo cloned to `/opt/taxalex` and `/opt/taxalex-dev`
- [ ] Docker Swarm secrets created (6 total: 3 prod + 3 dev)
- [ ] Nginx configs installed and enabled
- [ ] First deployment tested on dev

**Every Deployment:**
- [ ] Code committed and pushed to main
- [ ] No hardcoded API keys in code
- [ ] Deploy to dev first, test, then deploy to prod
- [ ] Verify site loads after deployment

---

**Server Access:** `ssh root@91.99.212.17`
**Bonifatus DMS docs:** See `DEPLOY.md` in the bonifatus-dms repo
