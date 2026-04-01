-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'TRIALING');

-- CreateEnum
CREATE TYPE "CreditReason" AS ENUM ('PURCHASE_SINGLE', 'PURCHASE_PACK', 'SUBSCRIPTION_GRANT', 'CASE_CREATED', 'REFUND', 'ADMIN_GRANT');

-- AlterTable: User — add Stripe fields
ALTER TABLE "User"
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "creditBalance"    INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- AlterTable: PricingPlan — cache Stripe product ID
ALTER TABLE "PricingPlan"
  ADD COLUMN "stripeProductId" TEXT;

-- CreateTable: Subscription
CREATE TABLE "Subscription" (
    "id"                   TEXT        NOT NULL,
    "userId"               TEXT        NOT NULL,
    "stripeSubscriptionId" TEXT        NOT NULL,
    "stripePriceId"        TEXT        NOT NULL,
    "planSlug"             TEXT        NOT NULL,
    "status"               "SubscriptionStatus" NOT NULL,
    "currentPeriodStart"   TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd"     TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd"    BOOLEAN     NOT NULL DEFAULT false,
    "canceledAt"           TIMESTAMP(3),
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_userId_key"               ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: CreditLedger
CREATE TABLE "CreditLedger" (
    "id"          TEXT        NOT NULL,
    "userId"      TEXT        NOT NULL,
    "delta"       INTEGER     NOT NULL,
    "reason"      "CreditReason" NOT NULL,
    "referenceId" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CreditLedger_userId_idx" ON "CreditLedger"("userId");

ALTER TABLE "CreditLedger"
  ADD CONSTRAINT "CreditLedger_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: StripeEvent (idempotency guard)
CREATE TABLE "StripeEvent" (
    "id"          TEXT        NOT NULL,
    "stripeId"    TEXT        NOT NULL,
    "type"        TEXT        NOT NULL,
    "processed"   BOOLEAN     NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeEvent_stripeId_key" ON "StripeEvent"("stripeId");
CREATE INDEX        "StripeEvent_stripeId_idx" ON "StripeEvent"("stripeId");
