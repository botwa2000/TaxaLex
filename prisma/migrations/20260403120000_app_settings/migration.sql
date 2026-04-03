-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- Seed default: pipeline starts in dev mode
INSERT INTO "AppSetting" ("key", "value", "updatedAt") VALUES ('pipeline_mode', 'dev', NOW());
