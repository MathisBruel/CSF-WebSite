-- Global pricing refactor: remove per-exhibition pricing, add structured global tariffs

-- Drop FK from registrations.cageOptionId → exhibition_cage_options
ALTER TABLE "registrations" DROP CONSTRAINT IF EXISTS "registrations_cageOptionId_fkey";

-- Remove old registration fields, add new ones
ALTER TABLE "registrations" DROP COLUMN IF EXISTS "cageOptionId";
ALTER TABLE "registrations" DROP COLUMN IF EXISTS "mealsCount";
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "needsCage" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "registrationFee" INTEGER NOT NULL DEFAULT 5;

-- Drop per-exhibition pricing tables
DROP TABLE IF EXISTS "exhibition_cage_options";
DROP TABLE IF EXISTS "exhibition_pricing_tiers";

-- Remove pricing fields from exhibitions
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "priceBase";
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "priceMeal";
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "mealsEnabled";
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "mealsRequired";

-- Add per-cat option fields
ALTER TABLE "registration_cats" ADD COLUMN IF NOT EXISTS "isHouseCat" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "registration_cats" ADD COLUMN IF NOT EXISTS "wantsDiploma" BOOLEAN NOT NULL DEFAULT false;

-- Refactor pricing table: drop old columns, add global tariff structure
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "registrationOneDay";
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "registrationWeekend";
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "extraCageOneDay";
ALTER TABLE "pricing" DROP COLUMN IF EXISTS "extraCageWeekend";
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "registrationFee"         INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberOneDayCat12"        INTEGER NOT NULL DEFAULT 36;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberOneDayCat3Plus"     INTEGER NOT NULL DEFAULT 31;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberOneDayHouseCat"     INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberTwoDayCat12"        INTEGER NOT NULL DEFAULT 46;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberTwoDayCat3Plus"     INTEGER NOT NULL DEFAULT 41;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberTwoDayHouseCat"     INTEGER NOT NULL DEFAULT 35;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberConformite"         INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "memberDiploma"            INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberOneDayCat12"     INTEGER NOT NULL DEFAULT 42;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberOneDayCat3Plus"  INTEGER NOT NULL DEFAULT 36;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberOneDayHouseCat"  INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberTwoDayCat12"     INTEGER NOT NULL DEFAULT 51;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberTwoDayCat3Plus"  INTEGER NOT NULL DEFAULT 46;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberTwoDayHouseCat"  INTEGER NOT NULL DEFAULT 35;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberConformite"      INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "nonMemberDiploma"         INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "membershipFee"            INTEGER NOT NULL DEFAULT 25;
ALTER TABLE "pricing" ADD COLUMN IF NOT EXISTS "cageDeposit"              INTEGER NOT NULL DEFAULT 100;
