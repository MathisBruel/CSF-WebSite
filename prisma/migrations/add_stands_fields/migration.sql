-- Add stand-related fields to Exhibition
ALTER TABLE "exhibitions" ADD COLUMN "standPlanUrl" TEXT,
ADD COLUMN "standContractUrl" TEXT,
ADD COLUMN "standBasePricePerModule" INTEGER NOT NULL DEFAULT 50;
