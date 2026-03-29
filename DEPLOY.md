# TaxAlex — Deployment Guide

## The three commands you use every day

```bash
./scripts/deploy.sh push "feat: add new section"   # commit + push to GitHub
./scripts/deploy.sh dev                             # deploy to dev.taxalex.de
./scripts/deploy.sh prod                            # deploy to taxalex.de (asks for confirmation)
```

All credentials are loaded from `.secrets` (gitignored). See setup below.

---

## Environments

| | Dev | Prod |
|---|---|---|
| **URL** | https://dev.taxalex.de | https://taxalex.de |
| **Server dir** | `/opt/taxalex-dev` | `/opt/taxalex` |
| **Docker stack** | `taxalex-dev` | `taxalex` |
| **Docker image** | `taxalex-frontend:dev` | `taxalex-frontend:latest` |
| **Port** | 3011 | 3010 |

**Server:** bonidoc Hetzner VPS (details in `.secrets`, not here)
**Repo:** https://github.com/botwa2000/TaxaLex

---

## Setup (once per machine)

### 1. Create your `.secrets` file

```bash
cp .secrets.example .secrets
# Edit .secrets — fill in HETZNER_HOST, HETZNER_USER, HETZNER_SSH_KEY
```

`.secrets` is gitignored. It holds server IP, SSH key path, and API keys. Never committed.

### 2. Make the script executable

```bash
chmod +x scripts/deploy.sh
```

That's it.

---

## Daily workflow

```
code → push → test on dev → confirm → deploy prod
```

```bash
# 1. Push your changes
./scripts/deploy.sh push "fix: update hero copy"

# 2. Deploy to dev and test
./scripts/deploy.sh dev
# open https://dev.taxalex.de and verify

# 3. Deploy to production
./scripts/deploy.sh prod
# type "deploy" when prompted
# open https://taxalex.de and verify
```

---

## Rotating API keys / secrets

Add the new key values to `.secrets`, then:

```bash
./scripts/deploy.sh secrets
```

This re-creates the Docker Swarm secrets. Then redeploy to pick them up:

```bash
./scripts/deploy.sh dev    # or prod
```

---

## Rollback

SSH to the server and reset to a previous commit, then redeploy:

```bash
# From your local machine (host in .secrets):
ssh -i $HETZNER_SSH_KEY root@$HETZNER_HOST

# On the server:
cd /opt/taxalex
git log --oneline -10
git reset --hard <commit-hash>
docker build -t taxalex-frontend:latest .
docker stack deploy -c docker-compose.yml taxalex
docker service update --force --image taxalex-frontend:latest taxalex_frontend
```

---

## Useful server commands

```bash
# Status
docker service ps taxalex_frontend
docker service ps taxalex-dev_frontend

# Logs
docker service logs taxalex_frontend --tail 50
docker service logs taxalex-dev_frontend --tail 50

# Restart without rebuild
docker service update --force taxalex_frontend

# Check secrets exist
docker secret ls | grep -E "anthropic|openai|nextauth"

# Nginx
nginx -t && systemctl status nginx
```

---

## First-time server setup (already done — documented for reference)

### DNS (Cloudflare)
- A record: `taxalex.de` → server IP
- A record: `dev.taxalex.de` → server IP
- SSL/TLS: **Full (Strict)**

### Cloudflare Origin Certificate
Installed at:
- `/etc/ssl/cloudflare/taxalex.de.pem`
- `/etc/ssl/cloudflare/taxalex.de.key`

### GitHub Deploy Key
SSH alias `github-taxalex` configured in `/home/deploy/.ssh/config` on server.
Public key at: https://github.com/botwa2000/TaxaLex/settings/keys

### Repos on server
```
/opt/taxalex       — production (main branch)
/opt/taxalex-dev   — dev (main branch)
```

### Docker Swarm Secrets (6 total)
```
anthropic_api_key_prod    openai_api_key_prod    nextauth_secret_prod
anthropic_api_key_dev     openai_api_key_dev     nextauth_secret_dev
```
Create/rotate via: `./scripts/deploy.sh secrets`

### Nginx
Configs at `/etc/nginx/sites-enabled/taxalex.de` and `dev.taxalex.de` (already live).

---

## Coexistence with other projects on this server

| | Bonifatus DMS | TaxAlex |
|---|---|---|
| Dirs | `/opt/bonifatus-dms` | `/opt/taxalex` + `/opt/taxalex-dev` |
| Ports | 3000/3001 | 3010/3011 |
| Domain | bonidoc.com | taxalex.de |
| Stacks | `bonifatus`, `bonifatus-dev` | `taxalex`, `taxalex-dev` |
| GitHub key | `id_ed25519` | `id_ed25519_taxalex` |

No shared networks, volumes, or secrets between projects.

---

## GitHub Actions (automated CI/CD)

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Every push / PR | lint + tsc + build |
| `deploy-dev.yml` | Push to `main` | Auto-deploy to dev.taxalex.de |
| `deploy-prod.yml` | Manual (Actions tab) | Deploy to taxalex.de |

GitHub Secrets needed (repo Settings → Secrets → Actions):

| Secret | Where to find it |
|---|---|
| `HETZNER_HOST` | `.secrets` → `HETZNER_HOST` |
| `HETZNER_USER` | `root` |
| `HETZNER_SSH_KEY` | Contents of your SSH private key file |
