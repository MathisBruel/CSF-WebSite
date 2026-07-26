-- Split traditionalClass into one judging class per participation day (Samedi/Dimanche)
ALTER TABLE "registration_cats" ADD COLUMN IF NOT EXISTS "traditionalClassSaturday" TEXT;
ALTER TABLE "registration_cats" ADD COLUMN IF NOT EXISTS "traditionalClassSunday" TEXT;
UPDATE "registration_cats" SET "traditionalClassSaturday" = "traditionalClass" WHERE "traditionalClass" IS NOT NULL;
ALTER TABLE "registration_cats" DROP COLUMN IF EXISTS "traditionalClass";
