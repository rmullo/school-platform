CREATE TYPE "SettlementKind" AS ENUM ('PAYMENT', 'WAIVER', 'NEGOTIATION');
CREATE TYPE "EnrollmentConfirmationStatus" AS ENUM ('CONFIRMED');
CREATE TYPE "ObligationStatus" AS ENUM ('SETTLED', 'OPEN', 'WAIVED');

CREATE TABLE "Enrollment" (
    "id" UUID NOT NULL,
    "draftId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "classroomId" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "financialResponsibleId" UUID NOT NULL,
    "status" "EnrollmentConfirmationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "confirmedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Enrollment_draftId_key" ON "Enrollment"("draftId");
CREATE UNIQUE INDEX "Enrollment_studentId_classroomId_campaignId_key" ON "Enrollment"("studentId", "classroomId", "campaignId");
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");
CREATE INDEX "Enrollment_classroomId_idx" ON "Enrollment"("classroomId");

CREATE TABLE "InitialSettlement" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "kind" "SettlementKind" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT,
    "reason" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InitialSettlement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InitialSettlement_amountCents_check" CHECK ("amountCents" >= 0)
);
CREATE UNIQUE INDEX "InitialSettlement_enrollmentId_key" ON "InitialSettlement"("enrollmentId");
CREATE UNIQUE INDEX "InitialSettlement_operationKey_key" ON "InitialSettlement"("operationKey");
CREATE INDEX "InitialSettlement_actorId_createdAt_idx" ON "InitialSettlement"("actorId", "createdAt");

CREATE TABLE "FinancialObligation" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "installment" INTEGER NOT NULL,
    "dueDate" VARCHAR(10) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "ObligationStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialObligation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FinancialObligation_amountCents_check" CHECK ("amountCents" >= 0)
);
CREATE UNIQUE INDEX "FinancialObligation_enrollmentId_installment_key" ON "FinancialObligation"("enrollmentId", "installment");
CREATE INDEX "FinancialObligation_dueDate_status_idx" ON "FinancialObligation"("dueDate", "status");

ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "EnrollmentDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ContractVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_financialResponsibleId_fkey" FOREIGN KEY ("financialResponsibleId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InitialSettlement" ADD CONSTRAINT "InitialSettlement_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialObligation" ADD CONSTRAINT "FinancialObligation_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
