-- Drop old registrations table (cascade drops indexes + FKs)
DROP TABLE IF EXISTS "registrations" CASCADE;

-- Recreate registrations: one per user per exhibition
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "convocationUrl" TEXT,
    "convocationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registrations_exhibitionId_userId_key" ON "registrations"("exhibitionId", "userId");

ALTER TABLE "registrations" ADD CONSTRAINT "registrations_exhibitionId_fkey"
    FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON UPDATE CASCADE;
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE;

-- Per-cat entries within a registration
CREATE TABLE "registration_cats" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "participationDays" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "traditionalClass" TEXT,
    "traditionalClassOther" TEXT,
    "isHorsConcours" BOOLEAN NOT NULL DEFAULT false,
    "wantsComplianceExam" BOOLEAN NOT NULL DEFAULT false,
    "specialParticipations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "wantsCage" BOOLEAN NOT NULL DEFAULT false,
    "wantsDoubleCage" BOOLEAN NOT NULL DEFAULT false,
    "mealsCount" INTEGER NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "catalogNumber" INTEGER,
    "vetValidated" BOOLEAN NOT NULL DEFAULT false,
    "vetValidatedAt" TIMESTAMP(3),
    "vetNotes" TEXT,

    CONSTRAINT "registration_cats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registration_cats_registrationId_catId_key" ON "registration_cats"("registrationId", "catId");

ALTER TABLE "registration_cats" ADD CONSTRAINT "registration_cats_registrationId_fkey"
    FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "registration_cats" ADD CONSTRAINT "registration_cats_catId_fkey"
    FOREIGN KEY ("catId") REFERENCES "cats"("id") ON UPDATE CASCADE;
