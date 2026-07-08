-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "dancerId" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "styleScore" DOUBLE PRECISION,
    "locationScore" DOUBLE PRECISION,
    "typeScore" DOUBLE PRECISION,
    "availabilityScore" DOUBLE PRECISION,
    "experienceScore" DOUBLE PRECISION,
    "compensationScore" DOUBLE PRECISION,
    "reason" TEXT,
    "risks" TEXT[],
    "suggestedMessage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_review',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recommendation_opportunityId_idx" ON "Recommendation"("opportunityId");

-- CreateIndex
CREATE INDEX "Recommendation_dancerId_idx" ON "Recommendation"("dancerId");

-- CreateIndex
CREATE INDEX "Recommendation_status_idx" ON "Recommendation"("status");

-- CreateIndex
CREATE INDEX "Recommendation_finalScore_idx" ON "Recommendation"("finalScore");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_opportunityId_dancerId_key" ON "Recommendation"("opportunityId", "dancerId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_dancerId_fkey" FOREIGN KEY ("dancerId") REFERENCES "Dancer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
