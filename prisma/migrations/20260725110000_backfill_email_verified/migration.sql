-- Backfill emailVerified for all existing users created before email verification was introduced.
-- New registrations go through the verification flow; existing accounts are trusted as-is.
UPDATE "users" SET "emailVerified" = NOW() WHERE "emailVerified" IS NULL;
