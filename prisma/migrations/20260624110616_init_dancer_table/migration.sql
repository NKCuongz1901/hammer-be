-- CreateTable
CREATE TABLE "Dancer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "danceStyles" TEXT[],
    "preferredTypes" TEXT[],
    "skillLevel" TEXT,
    "yearsExperience" INTEGER,
    "availability" JSONB,
    "travelRadiusKm" INTEGER,
    "minCompensation" DOUBLE PRECISION,
    "currency" TEXT,
    "portfolioUrls" TEXT[],
    "languages" TEXT[],
    "profileDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dancer_pkey" PRIMARY KEY ("id")
);
