-- CreateTable
CREATE TABLE "SourceLink" (
    "id" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "contactType" TEXT,
    "fit" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCrawledAt" TIMESTAMP(3),
    "crawlStatus" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawPage" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "finalUrl" TEXT,
    "title" TEXT,
    "html" TEXT,
    "text" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "rawPageId" TEXT,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "opportunityType" TEXT,
    "description" TEXT NOT NULL,
    "danceStyles" TEXT[],
    "locationText" TEXT,
    "city" TEXT,
    "country" TEXT,
    "requirements" JSONB,
    "compensation" JSONB,
    "applicationUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "deadline" TIMESTAMP(3),
    "eventStartDate" TIMESTAMP(3),
    "eventEndDate" TIMESTAMP(3),
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completenessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missingFields" TEXT[],
    "rawUrl" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceLink_sourceCode_key" ON "SourceLink"("sourceCode");

-- CreateIndex
CREATE INDEX "SourceLink_category_idx" ON "SourceLink"("category");

-- CreateIndex
CREATE INDEX "SourceLink_priority_idx" ON "SourceLink"("priority");

-- CreateIndex
CREATE INDEX "SourceLink_enabled_idx" ON "SourceLink"("enabled");

-- CreateIndex
CREATE INDEX "RawPage_sourceId_idx" ON "RawPage"("sourceId");

-- CreateIndex
CREATE INDEX "RawPage_url_idx" ON "RawPage"("url");

-- CreateIndex
CREATE UNIQUE INDEX "RawPage_sourceId_contentHash_key" ON "RawPage"("sourceId", "contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_canonicalKey_key" ON "Opportunity"("canonicalKey");

-- CreateIndex
CREATE INDEX "Opportunity_sourceId_idx" ON "Opportunity"("sourceId");

-- CreateIndex
CREATE INDEX "Opportunity_city_idx" ON "Opportunity"("city");

-- CreateIndex
CREATE INDEX "Opportunity_country_idx" ON "Opportunity"("country");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- AddForeignKey
ALTER TABLE "RawPage" ADD CONSTRAINT "RawPage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_rawPageId_fkey" FOREIGN KEY ("rawPageId") REFERENCES "RawPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
