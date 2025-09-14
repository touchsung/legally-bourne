-- CreateTable
CREATE TABLE "public"."Case" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseMessage" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseSummary" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "caseDescription" TEXT NOT NULL,
    "timelineEvents" JSONB NOT NULL,
    "keyPoints" JSONB NOT NULL,
    "nextSteps" JSONB NOT NULL,
    "urgency" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Case_userId_idx" ON "public"."Case"("userId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "public"."Case"("status");

-- CreateIndex
CREATE INDEX "CaseMessage_caseId_idx" ON "public"."CaseMessage"("caseId");

-- CreateIndex
CREATE INDEX "CaseMessage_createdAt_idx" ON "public"."CaseMessage"("createdAt");

-- CreateIndex
CREATE INDEX "CaseSummary_caseId_idx" ON "public"."CaseSummary"("caseId");

-- CreateIndex
CREATE INDEX "CaseSummary_createdAt_idx" ON "public"."CaseSummary"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Case" ADD CONSTRAINT "Case_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseMessage" ADD CONSTRAINT "CaseMessage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CaseSummary" ADD CONSTRAINT "CaseSummary_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
