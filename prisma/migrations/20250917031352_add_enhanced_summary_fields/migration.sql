/*
  Warnings:

  - You are about to drop the column `keyPoints` on the `CaseSummary` table. All the data in the column will be lost.
  - You are about to drop the column `nextSteps` on the `CaseSummary` table. All the data in the column will be lost.
  - Added the required column `evidenceChecklist` to the `CaseSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalAnalysis` to the `CaseSummary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CaseSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CaseSummary" DROP COLUMN "keyPoints",
DROP COLUMN "nextSteps",
ADD COLUMN     "evidenceChecklist" JSONB NOT NULL,
ADD COLUMN     "legalAnalysis" JSONB NOT NULL,
ADD COLUMN     "nextCriticalDeadline" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "CaseSummary_urgency_idx" ON "public"."CaseSummary"("urgency");
