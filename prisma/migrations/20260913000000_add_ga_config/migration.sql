-- CreateTable GAConfig
CREATE TABLE "ga_config" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "measurementId" TEXT,
    "apiSecret" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ga_config_pkey" PRIMARY KEY ("id")
);
