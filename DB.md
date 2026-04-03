# TaxAlex — Database Operations

## Connection

### SSH into the server first
```bash
ssh -i ~/.ssh/id_rsa root@91.99.212.17
```

### psql — direct DB access
```bash
# Production
psql 'postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex'

# Dev
psql 'postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex_dev'
```

The host `172.17.0.1` is the Docker bridge gateway — only reachable from the server itself, not from your local machine.

### Useful psql queries
```sql
\dt                          -- list all tables
SELECT count(*) FROM "User";
SELECT slug, "priceOnce", "isActive" FROM "PricingPlan" ORDER BY "sortOrder";
SELECT * FROM "_prisma_migrations" ORDER BY started_at;
```

---

## Migration workflow

### Why `prisma migrate dev` does NOT work on this server
The `taxalex` DB user cannot create databases, which Prisma requires for its shadow DB during `migrate dev`. This is intentional — the user is locked down. **Never grant CREATEDB rights to the app user.**

### Correct workflow for every schema change

**Step 1 — Edit schema locally**
```
prisma/schema.prisma
```

**Step 2 — Write the migration SQL manually**

Create a new folder in `prisma/migrations/` with the timestamp + name:
```
prisma/migrations/YYYYMMDDHHMMSS_your_migration_name/migration.sql
```

Write the SQL yourself based on what changed. Common patterns:
```sql
-- New table
CREATE TABLE "ModelName" (
    "id" TEXT NOT NULL,
    ...
    CONSTRAINT "ModelName_pkey" PRIMARY KEY ("id")
);

-- New column
ALTER TABLE "ModelName" ADD COLUMN "colName" TEXT;

-- New enum
CREATE TYPE "EnumName" AS ENUM ('VALUE_A', 'VALUE_B');

-- Add value to existing enum
ALTER TYPE "EnumName" ADD VALUE 'NEW_VALUE';

-- Foreign key
ALTER TABLE "ModelName" ADD CONSTRAINT "ModelName_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index
CREATE INDEX "ModelName_userId_idx" ON "ModelName"("userId");
```

**Step 3 — Commit and deploy**
```bash
git add prisma/
./scripts/deploy.sh push "feat: add YourModel"
./scripts/deploy.sh dev    # verify on dev first
./scripts/deploy.sh prod
```

**Step 4 — Apply migration on server**

The deploy pulls the code but does NOT auto-migrate. After deploying, SSH in and run:
```bash
# Production
cd /opt/taxalex && DATABASE_URL='postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex' npx prisma migrate deploy

# Dev
cd /opt/taxalex-dev && DATABASE_URL='postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex_dev' npx prisma migrate deploy
```

`prisma migrate deploy` only runs SQL files — no shadow DB needed, safe for production.

**Step 5 — Verify**
```bash
psql 'postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex' \
  -c "SELECT migration_name, finished_at FROM \"_prisma_migrations\" ORDER BY started_at DESC LIMIT 5;"
```

---

## Seed

The seed upserts all static content (pricing plans, FAQs, use cases, trust stats) and creates 5 demo users. It is idempotent — safe to run multiple times.

### When to run the seed
- After first deploy to a fresh database
- After adding new pricing plans, FAQs, or use cases to `contentFallbacks.ts`
- Never needed for schema-only changes

### Run seed
```bash
# Production
cd /opt/taxalex
echo 'DATABASE_URL=postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex' > .env
npx tsx prisma/seed.ts
rm .env

# Dev
cd /opt/taxalex-dev
echo 'DATABASE_URL=postgresql://taxalex:3b78945ff17ed878424766fe2a22f3299a2b6701@172.17.0.1:5432/taxalex_dev' > .env
npx tsx prisma/seed.ts
rm .env
```

### Why the .env file pattern
`PrismaPg` reads `DATABASE_URL` from `process.env`. The seed script runs outside Next.js (no `.env.local` loading), so the URL must be in a `.env` file for `dotenv/config` (imported at the top of seed.ts) to pick it up. The file is deleted immediately after.

---

## Prisma client notes (Prisma 7)

Prisma 7 with `engineType: "client"` requires a driver adapter at construction time:

```ts
// CORRECT — matches src/lib/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

// WRONG — throws in Prisma 7
const prisma = new PrismaClient()
```

This applies to any script outside Next.js (seed, one-off data scripts, etc.).

---

## Demo accounts (seeded)

| Email | Password | Role |
|---|---|---|
| `admin@taxalex.de` | `Admin1234!` | ADMIN |
| `advisor@demo.taxalex.de` | `Demo1234!` | ADVISOR |
| `lawyer@demo.taxalex.de` | `Demo1234!` | LAWYER |
| `user@demo.taxalex.de` | `Demo1234!` | USER |
| `expat@demo.taxalex.de` | `Demo1234!` | USER (locale: en) |

---

## Checklist for every schema change

- [ ] `prisma/schema.prisma` updated
- [ ] Migration SQL file created in `prisma/migrations/TIMESTAMP_name/migration.sql`
- [ ] Both committed and pushed
- [ ] `./scripts/deploy.sh dev` — deploy to dev
- [ ] `npx prisma migrate deploy` run on dev server
- [ ] Tested on dev.taxalex.de
- [ ] `./scripts/deploy.sh prod` — deploy to prod
- [ ] `npx prisma migrate deploy` run on prod server
