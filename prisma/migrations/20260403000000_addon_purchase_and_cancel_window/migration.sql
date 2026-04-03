-- CreateEnum
CREATE TYPE "AddonType" AS ENUM ('EXPERT_REVIEW');

-- CreateEnum
CREATE TYPE "AddonStatus" AS ENUM ('ACTIVE', 'USED', 'REFUNDED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "CreditReason" ADD VALUE 'ADDON_PURCHASE';

-- CreateTable
CREATE TABLE "AddonPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT,
    "addonType" "AddonType" NOT NULL,
    "status" "AddonStatus" NOT NULL DEFAULT 'ACTIVE',
    "amountCents" INTEGER NOT NULL,
    "planSlug" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "AddonPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AddonPurchase_userId_idx" ON "AddonPurchase"("userId");

-- CreateIndex
CREATE INDEX "AddonPurchase_caseId_idx" ON "AddonPurchase"("caseId");

-- CreateIndex
CREATE INDEX "AddonPurchase_userId_addonType_status_idx" ON "AddonPurchase"("userId", "addonType", "status");

-- AddForeignKey
ALTER TABLE "AddonPurchase" ADD CONSTRAINT "AddonPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddonPurchase" ADD CONSTRAINT "AddonPurchase_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
