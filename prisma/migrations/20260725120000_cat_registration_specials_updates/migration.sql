-- Cat model: remove deprecated fields
ALTER TABLE "cats" DROP COLUMN IF EXISTS "neutered";
ALTER TABLE "cats" DROP COLUMN IF EXISTS "notes";
ALTER TABLE "cats" DROP COLUMN IF EXISTS "forSale";
ALTER TABLE "cats" DROP COLUMN IF EXISTS "loofLitterNumber";

-- Cat model: add new fields
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "pedigreeInProgress" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "foreignCatCertificate" TEXT;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "inscritChampionnatFrance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "cats" ADD COLUMN IF NOT EXISTS "isHouseCat" BOOLEAN NOT NULL DEFAULT false;

-- Registration model: add new fields
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "cageSpecialLengthRequest" TEXT;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "nextTo" TEXT;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "comment" TEXT;

-- ExhibitionSpecial model: new table
CREATE TABLE IF NOT EXISTS "exhibition_specials" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exhibition_specials_pkey" PRIMARY KEY ("id")
);

-- ExhibitionSpecial: foreign key to exhibitions
ALTER TABLE "exhibition_specials" ADD CONSTRAINT "exhibition_specials_exhibitionId_fkey"
    FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
