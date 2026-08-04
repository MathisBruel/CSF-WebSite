-- AlterTable
ALTER TABLE "registration_cats" ADD COLUMN IF NOT EXISTS "isConformityOnly" BOOLEAN NOT NULL DEFAULT false;
