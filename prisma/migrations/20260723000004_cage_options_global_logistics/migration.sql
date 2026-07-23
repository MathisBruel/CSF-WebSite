-- Remove old fixed cage prices from exhibitions
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "priceCage";
ALTER TABLE "exhibitions" DROP COLUMN IF EXISTS "priceDoubleCage";

-- Add meals configuration to exhibitions
ALTER TABLE "exhibitions" ADD COLUMN IF NOT EXISTS "mealsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "exhibitions" ADD COLUMN IF NOT EXISTS "mealsRequired" BOOLEAN NOT NULL DEFAULT false;

-- Flexible cage options per exhibition
CREATE TABLE "exhibition_cage_options" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exhibition_cage_options_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "exhibition_cage_options"
    ADD CONSTRAINT "exhibition_cage_options_exhibitionId_fkey"
    FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move cage/meals from registration_cats to registrations
ALTER TABLE "registration_cats" DROP COLUMN IF EXISTS "wantsCage";
ALTER TABLE "registration_cats" DROP COLUMN IF EXISTS "wantsDoubleCage";
ALTER TABLE "registration_cats" DROP COLUMN IF EXISTS "mealsCount";

ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "cageOptionId" TEXT;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "mealsCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "registrations"
    ADD CONSTRAINT "registrations_cageOptionId_fkey"
    FOREIGN KEY ("cageOptionId") REFERENCES "exhibition_cage_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
