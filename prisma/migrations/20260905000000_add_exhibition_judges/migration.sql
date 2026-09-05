-- AlterTable
ALTER TABLE "exhibitions" ADD COLUMN "judgeListComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "exhibition_judges" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "region" TEXT,
    "breeds" TEXT,
    "role" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exhibition_judges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exhibition_judges" ADD CONSTRAINT "exhibition_judges_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
