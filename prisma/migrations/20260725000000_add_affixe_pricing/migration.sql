-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "affixe" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "breedingName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gpsCoordinates" TEXT;

-- CreateTable pricing
CREATE TABLE IF NOT EXISTS "pricing" (
    "id" TEXT NOT NULL,
    "registrationOneDay" INTEGER NOT NULL,
    "registrationWeekend" INTEGER NOT NULL,
    "extraCageOneDay" INTEGER NOT NULL,
    "extraCageWeekend" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_pkey" PRIMARY KEY ("id")
);
