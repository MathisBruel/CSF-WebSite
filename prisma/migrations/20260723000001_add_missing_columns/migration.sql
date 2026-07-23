-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otherClubs" TEXT;

-- AlterTable cats
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "breeder" TEXT;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "father" TEXT;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "mother" TEXT;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "countryOfOrigin" TEXT;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "forSale" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "loofLitterNumber" TEXT;

-- AlterTable registrations
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "participationDays" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "traditionalClass" TEXT;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "traditionalClassOther" TEXT;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "isHorsConcours" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "wantsComplianceExam" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "specialParticipations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
