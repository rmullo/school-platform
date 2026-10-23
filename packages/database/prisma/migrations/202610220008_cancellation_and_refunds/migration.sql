ALTER TYPE "EnrollmentConfirmationStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "ObligationStatus" ADD VALUE 'CANCELLED';

CREATE TYPE "RefundStatus" AS ENUM ('EXECUTED');

CREATE TABLE "EnrollmentCancellation" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "effectiveDate" VARCHAR(10) NOT NULL,
    "reason" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "refundableAmountCents" INTEGER NOT NULL DEFAULT 0,
    "availableCreditCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnrollmentCancellation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EnrollmentCancellation_refundableAmountCents_check" CHECK ("refundableAmountCents" >= 0),
    CONSTRAINT "EnrollmentCancellation_availableCreditCents_check" CHECK ("availableCreditCents" >= 0)
);
CREATE UNIQUE INDEX "EnrollmentCancellation_enrollmentId_key" ON "EnrollmentCancellation"("enrollmentId");
CREATE UNIQUE INDEX "EnrollmentCancellation_operationKey_key" ON "EnrollmentCancellation"("operationKey");
CREATE INDEX "EnrollmentCancellation_actorId_createdAt_idx" ON "EnrollmentCancellation"("actorId", "createdAt");
ALTER TABLE "EnrollmentCancellation" ADD CONSTRAINT "EnrollmentCancellation_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "FinancialRefund" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "cancellationId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'EXECUTED',
    "reason" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "executedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialRefund_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FinancialRefund_amountCents_check" CHECK ("amountCents" > 0)
);
CREATE UNIQUE INDEX "FinancialRefund_cancellationId_key" ON "FinancialRefund"("cancellationId");
CREATE UNIQUE INDEX "FinancialRefund_operationKey_key" ON "FinancialRefund"("operationKey");
CREATE INDEX "FinancialRefund_enrollmentId_executedAt_idx" ON "FinancialRefund"("enrollmentId", "executedAt");
CREATE INDEX "FinancialRefund_actorId_executedAt_idx" ON "FinancialRefund"("actorId", "executedAt");
ALTER TABLE "FinancialRefund" ADD CONSTRAINT "FinancialRefund_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialRefund" ADD CONSTRAINT "FinancialRefund_cancellationId_fkey" FOREIGN KEY ("cancellationId") REFERENCES "EnrollmentCancellation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
