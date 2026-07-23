CREATE TABLE "exhibition_pricing_tiers" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "minCats" INTEGER NOT NULL,
    "pricePerCat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "exhibition_pricing_tiers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "exhibition_pricing_tiers_exhibitionId_minCats_key"
    ON "exhibition_pricing_tiers"("exhibitionId", "minCats");

ALTER TABLE "exhibition_pricing_tiers"
    ADD CONSTRAINT "exhibition_pricing_tiers_exhibitionId_fkey"
    FOREIGN KEY ("exhibitionId") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
