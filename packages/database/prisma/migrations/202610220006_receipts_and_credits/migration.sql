ALTER TYPE "ObligationStatus" ADD VALUE 'PARTIAL';
CREATE TYPE "PaymentStatus" AS ENUM ('POSTED', 'REVERSED');
CREATE TYPE "CreditStatus" AS ENUM ('AVAILABLE', 'CONSUMED', 'REVERSED');

ALTER TABLE "FinancialObligation" ADD COLUMN "settledAmountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FinancialObligation" ADD CONSTRAINT "FinancialObligation_settledAmountCents_check" CHECK ("settledAmountCents" >= 0 AND "settledAmountCents" <= "amountCents");

CREATE TABLE "PaymentReceipt" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'POSTED',
    "reason" TEXT,
    "actorId" UUID NOT NULL,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt" TIMESTAMPTZ(3),
    "reverseReason" TEXT,
    "reverseOperationKey" UUID,
    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PaymentReceipt_amountCents_check" CHECK ("amountCents" > 0)
);
CREATE UNIQUE INDEX "PaymentReceipt_operationKey_key" ON "PaymentReceipt"("operationKey");
CREATE UNIQUE INDEX "PaymentReceipt_receiptNumber_key" ON "PaymentReceipt"("receiptNumber");
CREATE UNIQUE INDEX "PaymentReceipt_reverseOperationKey_key" ON "PaymentReceipt"("reverseOperationKey");
CREATE INDEX "PaymentReceipt_enrollmentId_receivedAt_idx" ON "PaymentReceipt"("enrollmentId", "receivedAt");
CREATE INDEX "PaymentReceipt_actorId_receivedAt_idx" ON "PaymentReceipt"("actorId", "receivedAt");

CREATE TABLE "PaymentAllocation" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "obligationId" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PaymentAllocation_amountCents_check" CHECK ("amountCents" > 0)
);
CREATE UNIQUE INDEX "PaymentAllocation_paymentId_obligationId_key" ON "PaymentAllocation"("paymentId", "obligationId");
CREATE INDEX "PaymentAllocation_obligationId_idx" ON "PaymentAllocation"("obligationId");

CREATE TABLE "FinancialCredit" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "sourcePaymentId" UUID NOT NULL,
    "originalAmountCents" INTEGER NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "status" "CreditStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialCredit_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FinancialCredit_originalAmountCents_check" CHECK ("originalAmountCents" > 0),
    CONSTRAINT "FinancialCredit_balanceCents_check" CHECK ("balanceCents" >= 0 AND "balanceCents" <= "originalAmountCents")
);
CREATE UNIQUE INDEX "FinancialCredit_sourcePaymentId_key" ON "FinancialCredit"("sourcePaymentId");
CREATE INDEX "FinancialCredit_enrollmentId_status_idx" ON "FinancialCredit"("enrollmentId", "status");

CREATE TABLE "CreditAllocation" (
    "id" UUID NOT NULL,
    "creditId" UUID NOT NULL,
    "obligationId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditAllocation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CreditAllocation_amountCents_check" CHECK ("amountCents" > 0)
);
CREATE UNIQUE INDEX "CreditAllocation_operationKey_key" ON "CreditAllocation"("operationKey");
CREATE INDEX "CreditAllocation_obligationId_idx" ON "CreditAllocation"("obligationId");

ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentAllocation" ADD CONSTRAINT "PaymentAllocation_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "FinancialObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialCredit" ADD CONSTRAINT "FinancialCredit_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialCredit" ADD CONSTRAINT "FinancialCredit_sourcePaymentId_fkey" FOREIGN KEY ("sourcePaymentId") REFERENCES "PaymentReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreditAllocation" ADD CONSTRAINT "CreditAllocation_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "FinancialCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreditAllocation" ADD CONSTRAINT "CreditAllocation_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "FinancialObligation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
