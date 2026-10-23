ALTER TABLE "EnrollmentDraft" ADD COLUMN "lateEntryMonth" INTEGER;
ALTER TABLE "EnrollmentDraft" ADD COLUMN "lateEntryInstallmentCount" INTEGER;
ALTER TABLE "EnrollmentDraft" ADD COLUMN "lateEntryTotalCents" INTEGER;
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_lateEntryMonth_check" CHECK ("lateEntryMonth" IS NULL OR "lateEntryMonth" BETWEEN 1 AND 12);
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_lateEntryInstallmentCount_check" CHECK ("lateEntryInstallmentCount" IS NULL OR "lateEntryInstallmentCount" > 0);
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_lateEntryTotalCents_check" CHECK ("lateEntryTotalCents" IS NULL OR "lateEntryTotalCents" > 0);

CREATE TABLE "FinancialNegotiation" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "obligationId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "originalAmountCents" INTEGER NOT NULL,
    "negotiatedAmountCents" INTEGER NOT NULL,
    "originalDueDate" VARCHAR(10) NOT NULL,
    "negotiatedDueDate" VARCHAR(10) NOT NULL,
    "reason" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialNegotiation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FinancialNegotiation_originalAmountCents_check" CHECK ("originalAmountCents" > 0),
    CONSTRAINT "FinancialNegotiation_negotiatedAmountCents_check" CHECK ("negotiatedAmountCents" > 0)
);
CREATE UNIQUE INDEX "FinancialNegotiation_obligationId_key" ON "FinancialNegotiation"("obligationId");
CREATE UNIQUE INDEX "FinancialNegotiation_operationKey_key" ON "FinancialNegotiation"("operationKey");
CREATE INDEX "FinancialNegotiation_enrollmentId_createdAt_idx" ON "FinancialNegotiation"("enrollmentId", "createdAt");
CREATE INDEX "FinancialNegotiation_actorId_createdAt_idx" ON "FinancialNegotiation"("actorId", "createdAt");
ALTER TABLE "FinancialNegotiation" ADD CONSTRAINT "FinancialNegotiation_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialNegotiation" ADD CONSTRAINT "FinancialNegotiation_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "FinancialObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
