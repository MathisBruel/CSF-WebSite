-- AlterTable: add social/contact fields to team_members
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
