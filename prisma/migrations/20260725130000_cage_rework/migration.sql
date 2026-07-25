-- Replace needsCage boolean with explicit personalCages / borrowedCages counts
ALTER TABLE "registrations" DROP COLUMN IF EXISTS "needsCage";
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "personalCages" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "borrowedCages" INTEGER NOT NULL DEFAULT 0;
