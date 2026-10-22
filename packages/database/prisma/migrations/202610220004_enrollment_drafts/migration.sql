CREATE TYPE "EnrollmentStatus" AS ENUM ('DRAFT');

CREATE TABLE "EnrollmentDraft" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "classroomId" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "financialResponsibleId" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'DRAFT',
    "initialAmountCents" INTEGER NOT NULL,
    "pendingItems" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "EnrollmentDraft_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EnrollmentDraft_initialAmountCents_check" CHECK ("initialAmountCents" >= 0)
);

CREATE UNIQUE INDEX "EnrollmentDraft_studentId_classroomId_campaignId_contractId_key" ON "EnrollmentDraft"("studentId", "classroomId", "campaignId", "contractId");
CREATE INDEX "EnrollmentDraft_studentId_idx" ON "EnrollmentDraft"("studentId");
CREATE INDEX "EnrollmentDraft_classroomId_idx" ON "EnrollmentDraft"("classroomId");
CREATE INDEX "EnrollmentDraft_campaignId_idx" ON "EnrollmentDraft"("campaignId");

ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ContractVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnrollmentDraft" ADD CONSTRAINT "EnrollmentDraft_financialResponsibleId_fkey" FOREIGN KEY ("financialResponsibleId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
